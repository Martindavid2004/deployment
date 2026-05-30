"""
Queue Manager for Piston API Requests

Manages concurrent code execution requests with semaphore-based throttling,
retry logic, and result storage. Prevents system overload by limiting
concurrent API calls and queuing excess requests.
"""

import asyncio
import time
import uuid
from dataclasses import dataclass
from typing import Optional, Dict
from datetime import datetime, timedelta
import logging

from app.services.piston_executor import PistonExecutor, ExecutionResult
from app.services.circuit_breaker import CircuitBreaker, CircuitBreakerOpenException

logger = logging.getLogger(__name__)


@dataclass
class QueueStatus:
    """Current queue statistics"""
    pending_count: int
    active_count: int
    completed_count: int
    failed_count: int
    circuit_breaker_active: bool


class QueueFullException(Exception):
    """Raised when queue exceeds maximum size"""
    pass


class QueueManager:
    """
    Manages concurrent Piston API requests with throttling and retry logic
    
    Features:
    - Limits concurrent executions using asyncio.Semaphore
    - Queues excess requests in memory
    - Retries failed requests up to max_retries times
    - Stores results with TTL for polling
    - Integrates with circuit breaker for fault tolerance
    """
    
    def __init__(
        self,
        max_concurrent: int = 5,
        max_queue_size: int = 50,
        max_retries: int = 2,
        result_ttl: int = 300  # 5 minutes
    ):
        """
        Initialize queue manager with concurrency limits
        
        Args:
            max_concurrent: Maximum parallel Piston API calls
            max_queue_size: Maximum queued requests before rejection
            max_retries: Number of retry attempts for failed requests
            result_ttl: Time to live for results in seconds
        """
        self.max_concurrent = max_concurrent
        self.max_queue_size = max_queue_size
        self.max_retries = max_retries
        self.result_ttl = result_ttl
        
        # Concurrency control
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.queue: asyncio.Queue = asyncio.Queue(maxsize=max_queue_size)
        
        # Result storage
        self.results: Dict[str, ExecutionResult] = {}
        self.result_timestamps: Dict[str, datetime] = {}
        
        # Statistics
        self.active_count = 0
        self.completed_count = 0
        self.failed_count = 0
        
        # Services
        self.piston_executor = PistonExecutor()
        self.circuit_breaker = CircuitBreaker()
        
        # Background task
        self.processing_task = None
        self._running = False
    
    async def start(self):
        """Start the background queue processing task"""
        if not self._running:
            self._running = True
            try:
                # Get the current event loop and create task
                loop = asyncio.get_running_loop()
                self.processing_task = loop.create_task(self._process_queue())
                
                # Add callback to log if task fails
                def task_done_callback(task):
                    try:
                        task.result()
                    except Exception as e:
                        logger.error(f"Queue processing task failed: {e}", exc_info=True)
                
                self.processing_task.add_done_callback(task_done_callback)
                
                logger.info("Queue manager started - background task created")
                # Give the task a moment to start and log
                await asyncio.sleep(0.2)
                
                # Verify task is running
                if self.processing_task.done():
                    logger.error("Queue processing task completed immediately - this is unexpected!")
                    try:
                        self.processing_task.result()
                    except Exception as e:
                        logger.error(f"Task failed with: {e}", exc_info=True)
                        raise
                else:
                    logger.info("Queue processing task is running")
                    
            except Exception as e:
                logger.error(f"Failed to start queue processing task: {e}", exc_info=True)
                self._running = False
                raise
    
    async def stop(self):
        """Stop the background queue processing task"""
        self._running = False
        if self.processing_task:
            self.processing_task.cancel()
            try:
                await self.processing_task
            except asyncio.CancelledError:
                pass
        logger.info("Queue manager stopped")
    
    async def submit_execution(
        self,
        code: str,
        language: str,
        stdin: str = "",
        execution_id: Optional[str] = None
    ) -> str:
        """
        Submit code execution request to queue
        
        Args:
            code: Source code to execute
            language: Programming language ('python', 'java', 'cpp')
            stdin: Standard input for the program
            execution_id: Optional custom execution ID
            
        Returns:
            execution_id for tracking the request
            
        Raises:
            QueueFullException: If queue exceeds max_queue_size
        """
        # Generate execution ID if not provided
        if not execution_id:
            execution_id = f"exec_{uuid.uuid4().hex[:12]}"
        
        # Check queue size
        if self.queue.qsize() >= self.max_queue_size:
            logger.error(f"Queue full: {self.queue.qsize()} requests pending")
            raise QueueFullException("Server is busy, please try again in a few moments")
        
        # Add to queue
        request = {
            'execution_id': execution_id,
            'code': code,
            'language': language,
            'stdin': stdin,
            'retry_count': 0
        }
        
        await self.queue.put(request)
        logger.info(f"Queued execution {execution_id}, queue size: {self.queue.qsize()}")
        
        return execution_id
    
    async def get_result(self, execution_id: str) -> Optional[ExecutionResult]:
        """
        Retrieve execution result by ID (non-blocking)
        
        Args:
            execution_id: The execution ID to look up
            
        Returns:
            ExecutionResult if complete, None if still pending or not found
        """
        # Clean up expired results
        self._cleanup_expired_results()
        
        return self.results.get(execution_id)
    
    async def _process_queue(self):
        """Background task that processes queued requests"""
        try:
            logger.info("Queue processing task started")
            
            while self._running:
                try:
                    # Get request from queue (with timeout to allow checking _running)
                    try:
                        request = await asyncio.wait_for(
                            self.queue.get(),
                            timeout=1.0
                        )
                        logger.info(f"Got request from queue: {request['execution_id']}")
                    except asyncio.TimeoutError:
                        continue
                    
                    # Process request with semaphore
                    logger.info(f"Creating task for {request['execution_id']}")
                    asyncio.create_task(self._execute_request(request))
                
                except Exception as e:
                    logger.error(f"Error in queue processing: {e}", exc_info=True)
                    await asyncio.sleep(1)
            
            logger.info("Queue processing task stopped")
        except Exception as e:
            logger.error(f"Queue processing task crashed: {e}", exc_info=True)
            raise
    
    async def _execute_request(self, request: dict):
        """
        Execute a single request with retry logic
        
        Args:
            request: Request dictionary with execution details
        """
        execution_id = request['execution_id']
        
        logger.info(f"Starting execution for {execution_id}")
        
        async with self.semaphore:
            self.active_count += 1
            logger.info(f"Executing {execution_id}, active: {self.active_count}")
            
            try:
                # Execute through circuit breaker
                logger.info(f"Calling circuit breaker for {execution_id}")
                result = await self.circuit_breaker.call(
                    self._execute_with_retry,
                    request
                )
                
                logger.info(f"Got result for {execution_id}: success={result.success}")
                
                # Store result
                self.results[execution_id] = result
                self.result_timestamps[execution_id] = datetime.now()
                self.completed_count += 1
                
                logger.info(f"Completed {execution_id}, success: {result.success}")
            
            except CircuitBreakerOpenException as e:
                # Circuit breaker is open
                logger.error(f"Circuit breaker open for {execution_id}: {e}")
                error_result = ExecutionResult(
                    success=False,
                    output="",
                    compile_error="",
                    runtime_error=str(e),
                    execution_time=0.0,
                    timed_out=False
                )
                self.results[execution_id] = error_result
                self.result_timestamps[execution_id] = datetime.now()
                self.failed_count += 1
            
            except Exception as e:
                # Unexpected error
                logger.error(f"Unexpected error executing {execution_id}: {e}", exc_info=True)
                error_result = ExecutionResult(
                    success=False,
                    output="",
                    compile_error="",
                    runtime_error=f"Unexpected error: {str(e)}",
                    execution_time=0.0,
                    timed_out=False
                )
                self.results[execution_id] = error_result
                self.result_timestamps[execution_id] = datetime.now()
                self.failed_count += 1
            
            finally:
                self.active_count -= 1
                logger.info(f"Finished execution for {execution_id}, active: {self.active_count}")
    
    async def _execute_with_retry(self, request: dict) -> ExecutionResult:
        """
        Execute code with retry logic
        
        Args:
            request: Request dictionary
            
        Returns:
            ExecutionResult
        """
        retry_count = request.get('retry_count', 0)
        
        while retry_count <= self.max_retries:
            try:
                result = await self.piston_executor.execute_code(
                    code=request['code'],
                    language=request['language'],
                    stdin=request['stdin']
                )
                
                # If successful or timeout (don't retry timeouts), return
                if result.success or result.timed_out:
                    return result
                
                # If network/API error and retries remaining, retry
                if retry_count < self.max_retries:
                    retry_count += 1
                    wait_time = 2 ** (retry_count - 1)  # Exponential backoff: 1s, 2s
                    logger.warning(
                        f"Retry {retry_count}/{self.max_retries} for {request['execution_id']} "
                        f"after {wait_time}s"
                    )
                    await asyncio.sleep(wait_time)
                else:
                    return result
            
            except Exception as e:
                if retry_count < self.max_retries:
                    retry_count += 1
                    wait_time = 2 ** (retry_count - 1)
                    logger.warning(
                        f"Retry {retry_count}/{self.max_retries} after error: {e}"
                    )
                    await asyncio.sleep(wait_time)
                else:
                    raise
        
        # Should not reach here, but return error if we do
        return ExecutionResult(
            success=False,
            output="",
            compile_error="",
            runtime_error="Max retries exceeded",
            execution_time=0.0,
            timed_out=False
        )
    
    def _cleanup_expired_results(self):
        """Remove results older than TTL"""
        now = datetime.now()
        expired_ids = [
            exec_id for exec_id, timestamp in self.result_timestamps.items()
            if now - timestamp > timedelta(seconds=self.result_ttl)
        ]
        
        for exec_id in expired_ids:
            self.results.pop(exec_id, None)
            self.result_timestamps.pop(exec_id, None)
        
        if expired_ids:
            logger.info(f"Cleaned up {len(expired_ids)} expired results")
    
    def get_queue_status(self) -> QueueStatus:
        """
        Get current queue statistics
        
        Returns:
            QueueStatus with current metrics
        """
        return QueueStatus(
            pending_count=self.queue.qsize(),
            active_count=self.active_count,
            completed_count=self.completed_count,
            failed_count=self.failed_count,
            circuit_breaker_active=self.circuit_breaker.is_open()
        )
