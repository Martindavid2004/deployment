"""Tests for the index bootstrap (no live MongoDB required)."""

import pytest

from app.db.indexes import INDEX_SPECS, ensure_indexes


class _FakeCollection:
    def __init__(self, fail=False):
        self.calls = []
        self.fail = fail

    async def create_index(self, keys, **options):
        if self.fail:
            raise RuntimeError("duplicate key")
        self.calls.append((keys, options))
        return options.get("name")


class _FakeDb:
    def __init__(self, fail_on=None):
        self.collections = {}
        self.fail_on = fail_on or set()

    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = _FakeCollection(fail=name in self.fail_on)
        return self.collections[name]


class TestIndexSpecs:
    def test_all_specs_are_named(self):
        for collection, keys, options in INDEX_SPECS:
            assert collection
            assert keys
            assert options.get("name"), f"missing name for {collection} {keys}"

    def test_index_names_are_unique(self):
        names = [options["name"] for _, _, options in INDEX_SPECS]
        assert len(names) == len(set(names))

    def test_covers_hot_query_fields(self):
        spec_map = {(c, tuple(k for k, _ in keys)) for c, keys, _ in INDEX_SPECS}
        assert ("users", ("username",)) in spec_map
        assert ("users", ("email",)) in spec_map
        assert ("lobbies", ("game_id",)) in spec_map
        assert ("matches", ("players.user_id",)) in spec_map
        assert ("attempts", ("user_id",)) in spec_map


class TestEnsureIndexes:
    @pytest.mark.asyncio
    async def test_creates_every_index(self):
        db = _FakeDb()
        result = await ensure_indexes(db)
        assert len(result["created"]) == len(INDEX_SPECS)
        assert result["skipped"] == []

    @pytest.mark.asyncio
    async def test_failures_are_skipped_not_raised(self):
        db = _FakeDb(fail_on={"users"})
        result = await ensure_indexes(db)
        assert "ix_users_username" in result["skipped"]
        assert "ix_lobbies_game_id" in result["created"]
