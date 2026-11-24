"""
Non-destructive index bootstrap.

Every index here mirrors a query that already exists in the codebase. Creation
is best-effort: a failure (for example a duplicate value where a unique index
is requested) is logged and never blocks application startup.

No index changes the shape of an API response; they only affect query cost.
"""

import logging

logger = logging.getLogger(__name__)

# (collection, keys, options)
INDEX_SPECS = [
    ("users", [("username", 1)], {"name": "ix_users_username"}),
    ("users", [("email", 1)], {"name": "ix_users_email"}),
    ("users", [("xp", -1)], {"name": "ix_users_xp_desc"}),
    ("users", [("rating", -1)], {"name": "ix_users_rating_desc"}),
    ("problems", [("id", 1)], {"name": "ix_problems_id"}),
    ("problems", [("difficulty", 1)], {"name": "ix_problems_difficulty"}),
    ("attempts", [("user_id", 1)], {"name": "ix_attempts_user_id"}),
    ("attempts", [("problem_id", 1)], {"name": "ix_attempts_problem_id"}),
    ("lobbies", [("game_id", 1)], {"name": "ix_lobbies_game_id"}),
    ("lobbies", [("status", 1), ("created_at", -1)], {"name": "ix_lobbies_status_created"}),
    ("matches", [("status", 1), ("created_at", -1)], {"name": "ix_matches_status_created"}),
    ("matches", [("players.user_id", 1)], {"name": "ix_matches_players_user_id"}),
    ("quiz_questions", [("language", 1), ("difficulty", 1)], {"name": "ix_quiz_questions_lang_difficulty"}),
]


async def ensure_indexes(db) -> dict:
    """Create the indexes above, skipping any that fail.

    Returns a summary ``{"created": [...], "skipped": [...]}`` so callers and
    tests can assert on the outcome without a live database.
    """
    created = []
    skipped = []

    for collection_name, keys, options in INDEX_SPECS:
        try:
            await db[collection_name].create_index(keys, **options)
            created.append(options["name"])
        except Exception as exc:  # pragma: no cover - depends on live data
            logger.warning(
                "Skipped index %s on %s: %s", options["name"], collection_name, exc
            )
            skipped.append(options["name"])

    if created:
        logger.info("MongoDB indexes ready: %d created, %d skipped", len(created), len(skipped))
    return {"created": created, "skipped": skipped}
