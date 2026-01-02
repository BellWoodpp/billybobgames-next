import { NextRequest, NextResponse } from "next/server";
import { ensureGameEngagementSchema, getNeonSql } from "@/lib/neon";

export const dynamic = "force-dynamic";

const VISITOR_COOKIE = "bbg_vid";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getVisitorId(req: NextRequest) {
  const existing = req.cookies.get(VISITOR_COOKIE)?.value;
  if (existing && UUID_RE.test(existing)) return { visitorId: existing, needsSetCookie: false };
  return { visitorId: crypto.randomUUID(), needsSetCookie: true };
}

function applyVisitorCookie(res: NextResponse, visitorId: string) {
  res.cookies.set({
    name: VISITOR_COOKIE,
    value: visitorId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

function validateSlug(slug: string) {
  return /^[a-z0-9-]{1,64}$/i.test(slug);
}

type EngagementState = {
  counts: { up: number; down: number; love: number };
  active: { up: boolean; down: boolean; love: boolean };
};

async function getEngagementState(
  sql: ReturnType<typeof getNeonSql>,
  slug: string,
  visitorId: string
): Promise<EngagementState> {
  const countsRows = (await sql`
    SELECT
      COALESCE(SUM((vote = 1)::int), 0)::int AS "up",
      COALESCE(SUM((vote = -1)::int), 0)::int AS "down",
      COALESCE(SUM((collected)::int), 0)::int AS "love"
    FROM game_engagement
    WHERE game_slug = ${slug};
  `) as unknown as Array<{ up: number; down: number; love: number }>;
  const counts = countsRows[0] ?? { up: 0, down: 0, love: 0 };

  const viewerRows = (await sql`
    SELECT vote, collected
    FROM game_engagement
    WHERE game_slug = ${slug} AND visitor_id = ${visitorId}::uuid
    LIMIT 1;
  `) as unknown as Array<{ vote: number; collected: boolean }>;
  const viewer = viewerRows[0];

  return {
    counts,
    active: {
      up: viewer?.vote === 1,
      down: viewer?.vote === -1,
      love: !!viewer?.collected,
    },
  };
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!validateSlug(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const { visitorId, needsSetCookie } = getVisitorId(req);

  let state: EngagementState;
  try {
    const sql = getNeonSql();
    await ensureGameEngagementSchema(sql);
    state = await getEngagementState(sql, slug, visitorId);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Engagement database is not configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const res = NextResponse.json(
    { ok: true, ...state },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
  if (needsSetCookie) applyVisitorCookie(res, visitorId);
  return res;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!validateSlug(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const { visitorId, needsSetCookie } = getVisitorId(req);

  const body = (await req.json().catch(() => null)) as
    | { action?: "toggle_up" | "toggle_down" | "toggle_collect" }
    | null;
  const action = body?.action;
  if (!action || !["toggle_up", "toggle_down", "toggle_collect"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  let state: EngagementState;
  try {
    const sql = getNeonSql();
    await ensureGameEngagementSchema(sql);

    await sql`
      INSERT INTO game_engagement (game_slug, visitor_id)
      VALUES (${slug}, ${visitorId}::uuid)
      ON CONFLICT DO NOTHING;
    `;

    if (action === "toggle_collect") {
      await sql`
        UPDATE game_engagement
        SET collected = NOT collected, updated_at = NOW()
        WHERE game_slug = ${slug} AND visitor_id = ${visitorId}::uuid;
      `;
    } else if (action === "toggle_up") {
      await sql`
        UPDATE game_engagement
        SET
          vote = CASE WHEN vote = 1 THEN 0 ELSE 1 END,
          updated_at = NOW()
        WHERE game_slug = ${slug} AND visitor_id = ${visitorId}::uuid;
      `;
    } else if (action === "toggle_down") {
      await sql`
        UPDATE game_engagement
        SET
          vote = CASE WHEN vote = -1 THEN 0 ELSE -1 END,
          updated_at = NOW()
        WHERE game_slug = ${slug} AND visitor_id = ${visitorId}::uuid;
      `;
    }

    state = await getEngagementState(sql, slug, visitorId);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Engagement database is not configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const res = NextResponse.json(
    { ok: true, ...state },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
  if (needsSetCookie) applyVisitorCookie(res, visitorId);
  return res;
}

