import { NextRequest, NextResponse } from "next/server";
import { ensureGameVotesSchema, getNeonSql } from "@/lib/neon";

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

async function getLikeState(sql: ReturnType<typeof getNeonSql>, slug: string, visitorId: string) {
  const rows = (await sql`
    SELECT
      (SELECT COUNT(*)::int FROM game_votes WHERE game_slug = ${slug}) AS "count",
      EXISTS(
        SELECT 1
        FROM game_votes
        WHERE game_slug = ${slug} AND visitor_id = ${visitorId}::uuid
      ) AS "liked";
  `) as unknown as Array<{ count: number; liked: boolean }>;
  const row = rows[0];
  return { count: row?.count ?? 0, liked: row?.liked ?? false };
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!validateSlug(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const { visitorId, needsSetCookie } = getVisitorId(req);

  let state: { count: number; liked: boolean };
  try {
    const sql = getNeonSql();
    await ensureGameVotesSchema(sql);
    state = await getLikeState(sql, slug, visitorId);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Likes database is not configured" },
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

  const body = (await req.json().catch(() => null)) as { action?: "like" | "unlike" | "toggle" } | null;
  const action = body?.action ?? "toggle";
  if (!["like", "unlike", "toggle"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  let state: { count: number; liked: boolean };
  try {
    const sql = getNeonSql();
    await ensureGameVotesSchema(sql);

    const likedRows = (await sql`
      SELECT 1
      FROM game_votes
      WHERE game_slug = ${slug} AND visitor_id = ${visitorId}::uuid
      LIMIT 1;
    `) as unknown as Array<unknown>;
    const hasLike = likedRows.length > 0;

    const wantLike = action === "toggle" ? !hasLike : action === "like";
    if (wantLike && !hasLike) {
      await sql`
        INSERT INTO game_votes (game_slug, visitor_id)
        VALUES (${slug}, ${visitorId}::uuid)
        ON CONFLICT DO NOTHING;
      `;
    } else if (!wantLike && hasLike) {
      await sql`
        DELETE FROM game_votes
        WHERE game_slug = ${slug} AND visitor_id = ${visitorId}::uuid;
      `;
    }

    state = await getLikeState(sql, slug, visitorId);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Likes database is not configured" },
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
