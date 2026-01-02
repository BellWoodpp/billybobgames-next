-- Neon / Postgres schema for anonymous per-game engagement.
-- - vote: -1 (down), 0 (none), 1 (up)
-- - collected: independent toggle

CREATE TABLE IF NOT EXISTS game_engagement (
  game_slug TEXT NOT NULL,
  visitor_id UUID NOT NULL,
  vote SMALLINT NOT NULL DEFAULT 0,
  collected BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (game_slug, visitor_id),
  CONSTRAINT game_engagement_vote_chk CHECK (vote IN (-1, 0, 1))
);

CREATE INDEX IF NOT EXISTS game_engagement_game_slug_idx ON game_engagement (game_slug);

