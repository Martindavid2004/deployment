"""API contract guard.

The refactor must not add, remove, or rename routes. This test compares the
live OpenAPI schema against the snapshot captured before the refactor began.

If a route is intentionally changed, regenerate the snapshot with:

    python -m pytest tests/unit/test_openapi_contract.py --regen-openapi
"""

import json
from pathlib import Path

import pytest

BASELINE = Path(__file__).resolve().parents[1] / "fixtures" / "openapi_baseline.json"


@pytest.fixture(scope="module")
def live_spec():
    from app.main import app

    # Round-trip through JSON so both sides have identical primitive types.
    return json.loads(json.dumps(app.openapi(), sort_keys=True))


def test_baseline_snapshot_exists():
    assert BASELINE.exists(), "openapi_baseline.json is missing"


def test_route_paths_are_unchanged(live_spec):
    baseline = json.loads(BASELINE.read_text(encoding="utf-8"))
    assert set(live_spec["paths"]) == set(baseline["paths"])


def test_http_methods_per_path_are_unchanged(live_spec):
    baseline = json.loads(BASELINE.read_text(encoding="utf-8"))
    live = {path: sorted(ops) for path, ops in live_spec["paths"].items()}
    before = {path: sorted(ops) for path, ops in baseline["paths"].items()}
    assert live == before


def test_schema_component_names_are_unchanged(live_spec):
    baseline = json.loads(BASELINE.read_text(encoding="utf-8"))
    assert set(live_spec.get("components", {}).get("schemas", {})) == set(
        baseline.get("components", {}).get("schemas", {})
    )
