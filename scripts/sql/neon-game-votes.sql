-- Neon / Postgres schema for per-game anonymous likes (one vote per visitor).

CREATE TABLE IF NOT EXISTS game_votes (
  game_slug TEXT NOT NULL,
  visitor_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (game_slug, visitor_id)
);

CREATE INDEX IF NOT EXISTS game_votes_game_slug_idx ON game_votes (game_slug);

