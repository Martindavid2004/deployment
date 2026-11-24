"""
Process-wide ``QueueManager`` singleton.

The singleton previously lived inside ``app/routers/competitive.py`` and was
imported by ``app/main.py`` from there. Moving it here lets application
startup depend on a service instead of a router, while both sides keep
sharing the exact same instance.
"""

from app.services.queue_manager import QueueManager

_queue_manager = None


def get_queue_manager():
    """Get or create the process-wide queue manager singleton."""
    global _queue_manager
    if _queue_manager is None:
        _queue_manager = QueueManager(
            max_concurrent=5,
            max_queue_size=50,
            max_retries=2,
        )
    return _queue_manager
