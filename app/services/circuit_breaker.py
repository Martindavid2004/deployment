"""
Circuit Breaker Pattern Implementation

Prevents cascading failures by stopping requests after consecutive failures.
Implements three states: Closed (normal), Open (failing), Half-Open (testing recovery).
"""

import asyncio
import time
import logging
from typing import Callable, Any
from enum import Enum

logger = logging.getLogger(__name__)


class CircuitState(Enum):
    """Circuit breaker states"""
    CLOSED = "closed"  # Normal operation
    OPEN = "open"  # Failures exceeded threshold
    HALF_OPEN = "half_open"  # Testing recovery


class CircuitBreakerOpenException(Exception):
    """Raised when circuit breaker is open"""
    pass


class CircuitBreaker:
    """
    Circuit breaker to prevent cascading failures
    
    States:
    - CLOSED: Normal operation, requests pass through
    - OPEN: Failures exceeded threshold, reject all requests
    - HALF_OPEN: After recovery timeout, allow one test request
    """
    
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60
    ):
        """
        Initialize circuit breaker with failure threshold
        
        Args:
            failure_threshold: Number of consecutive failures before opening
            recovery_timeout: Seconds to wait before attempting reset
        """
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.state = CircuitState.CLOSED
        self.last_failure_time = None
        self._lock = asyncio.Lock()
    
    async def call(self, func: Callable, *args, **kwargs) -> Any:
        """
        Execute function through circuit breaker
        
        Args:
            func: Async function to execute
            *args: Positional arguments for func
            **kwargs: Keyword arguments for func
            
        Returns:
            Result of func execution
            
        Raises:
            CircuitBreakerOpenException: If breaker is open
        """
        async with self._lock:
            # Check if we should attempt reset
            if self.state == CircuitState.OPEN:
                self._attempt_reset()
            
            # Reject if still open
            if self.state == CircuitState.OPEN:
                logger.warning("Circuit breaker is OPEN, rejecting request")
                raise CircuitBreakerOpenException(
                    "Service temporarily unavailable due to upstream issues"
                )
        
        # Execute the function
        try:
            result = await func(*args, **kwargs)
            await self._on_success()
            return result
        
        except Exception as e:
            await self._on_failure()
            raise e
    
    async def _on_success(self):
        """Record successful execution"""
        async with self._lock:
            self.failure_count = 0
            if self.state == CircuitState.HALF_OPEN:
                logger.info("Circuit breaker test successful, closing breaker")
                self.state = CircuitState.CLOSED
    
    async def _on_failure(self):
        """Record failed execution"""
        async with self._lock:
            self.failure_count += 1
            self.last_failure_time = time.time()
            
            if self.failure_count >= self.failure_threshold:
                if self.state != CircuitState.OPEN:
                    logger.error(
                        f"Circuit breaker OPENED after {self.failure_count} failures"
                    )
                    self.state = CircuitState.OPEN
            
            logger.warning(
                f"Circuit breaker failure count: {self.failure_count}/{self.failure_threshold}"
            )
    
    def _attempt_reset(self):
        """Try to reset circuit breaker after recovery timeout"""
        if self.state == CircuitState.OPEN and self.last_failure_time:
            elapsed = time.time() - self.last_failure_time
            if elapsed >= self.recovery_timeout:
                logger.info(
                    f"Circuit breaker entering HALF_OPEN state after {elapsed:.1f}s"
                )
                self.state = CircuitState.HALF_OPEN
                self.failure_count = 0
    
    def is_open(self) -> bool:
        """
        Check if circuit breaker is open
        
        Returns:
            True if breaker is open, False otherwise
        """
        return self.state == CircuitState.OPEN
    
    def record_success(self):
        """Synchronous method to record success (for compatibility)"""
        self.failure_count = 0
        if self.state == CircuitState.HALF_OPEN:
            self.state = CircuitState.CLOSED
    
    def record_failure(self):
        """Synchronous method to record failure (for compatibility)"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            if self.state != CircuitState.OPEN:
                logger.error(
                    f"Circuit breaker OPENED after {self.failure_count} failures"
                )
                self.state = CircuitState.OPEN
    
    def get_state(self) -> str:
        """Get current circuit breaker state"""
        return self.state.value
    
    def reset(self):
        """Manually reset the circuit breaker"""
        self.failure_count = 0
        self.state = CircuitState.CLOSED
        self.last_failure_time = None
        logger.info("Circuit breaker manually reset")
