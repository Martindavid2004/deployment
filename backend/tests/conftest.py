"""Shared pytest setup for the backend test suite."""

import sys
from pathlib import Path

# Make ``app`` importable regardless of where pytest is invoked from.
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))
