import { neon } from "@neondatabase/serverless";

type NeonSql = ReturnType<typeof neon>;

declare global {
  var __bbgNeonSql: NeonSql | undefined;
  var __bbgGameVotesSchemaReady: boolean | undefined;
}

export function getNeonSql(): NeonSql {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!globalThis.__bbgNeonSql) {
    globalThis.__bbgNeonSql = neon(url);
  }

  return globalThis.__bbgNeonSql;
}

export async function ensureGameVotesSchema(sql: NeonSql) {
  if (globalThis.__bbgGameVotesSchemaReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS game_votes (
      game_slug TEXT NOT NULL,
      visitor_id UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (game_slug, visitor_id)
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS game_votes_game_slug_idx ON game_votes (game_slug);`;

  globalThis.__bbgGameVotesSchemaReady = true;
}

export async function ensureGameEngagementSchema(sql: NeonSql) {
  await sql`
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
  `;

  await sql`CREATE INDEX IF NOT EXISTS game_engagement_game_slug_idx ON game_engagement (game_slug);`;
}
