import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { oidcConfigured, stableUserId, verifyOidcBearer, type OidcConfig } from "./auth";

export type UserApiEnv = OidcConfig & {
  DB?: D1Database;
  allowedOrigin?: string;
};

function headers(request: Request, allowedOrigin?: string) {
  const result: Record<string, string> = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
    "access-control-allow-headers": "authorization,content-type",
    "vary": "Origin",
  };
  const origin = request.headers.get("origin");
  if (origin && allowedOrigin && origin === allowedOrigin) result["access-control-allow-origin"] = origin;
  return result;
}

function json(request: Request, allowedOrigin: string | undefined, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: headers(request, allowedOrigin) });
}

function routeMatches(url: URL) {
  return url.pathname === "/api/me" || url.pathname.startsWith("/api/me/") || url.pathname === "/api/comments";
}

async function ensureUser(db: ReturnType<typeof drizzle<typeof schema>>, userId: string, displayName?: string) {
  const existing = (await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1))[0];
  const now = new Date().toISOString();
  if (existing) {
    if (displayName && displayName !== existing.displayName) {
      await db.update(schema.users).set({ displayName, updatedAt: now }).where(eq(schema.users.id, userId));
      return { ...existing, displayName, updatedAt: now };
    }
    return existing;
  }
  const created = { id: userId, email: null, displayName: displayName ?? null, role: "user" as const, createdAt: now, updatedAt: now };
  await db.insert(schema.users).values(created);
  return created;
}

async function publishedWorkExists(db: ReturnType<typeof drizzle<typeof schema>>, workId: string) {
  const row = await db.select({ id: schema.works.id }).from(schema.works).where(and(
    eq(schema.works.id, workId),
    eq(schema.works.publicationStatus, "published"),
    eq(schema.works.rightsStatus, "cleared"),
  )).limit(1);
  return Boolean(row[0]);
}

export async function handleUserApi(request: Request, env: UserApiEnv, url: URL): Promise<Response | null> {
  if (!routeMatches(url)) return null;
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(request, env.allowedOrigin) });

  if (!oidcConfigured(env)) {
    return json(request, env.allowedOrigin, { error: "auth_not_configured" }, 503);
  }
  if (!env.DB) {
    return json(request, env.allowedOrigin, { error: "backend_not_configured", resource: "D1" }, 503);
  }

  const identity = await verifyOidcBearer(request, env);
  if (!identity) return json(request, env.allowedOrigin, { error: "invalid_token" }, 401);

  const db = drizzle(env.DB, { schema });
  const userId = await stableUserId(identity);
  const user = await ensureUser(db, userId, identity.name);

  if (url.pathname === "/api/me" && request.method === "GET") {
    const [favoriteRows, progressRows, momentRows, orderRows] = await Promise.all([
      db.select().from(schema.favorites).where(eq(schema.favorites.userId, userId)),
      db.select().from(schema.playbackProgress).where(eq(schema.playbackProgress.userId, userId)),
      db.select().from(schema.savedMoments).where(eq(schema.savedMoments.userId, userId)).orderBy(desc(schema.savedMoments.createdAt)),
      db.select().from(schema.orders).where(eq(schema.orders.userId, userId)).orderBy(desc(schema.orders.createdAt)),
    ]);
    return json(request, env.allowedOrigin, {
      data: {
        profile: { id: user.id, displayName: user.displayName, role: user.role },
        favorites: favoriteRows,
        progress: progressRows,
        savedMoments: momentRows,
        orders: orderRows,
      },
    });
  }

  const favoriteMatch = url.pathname.match(/^\/api\/me\/favorites\/([^/]+)$/);
  if (favoriteMatch && request.method === "PUT") {
    const workId = decodeURIComponent(favoriteMatch[1]);
    if (!(await publishedWorkExists(db, workId))) return json(request, env.allowedOrigin, { error: "work_not_found" }, 404);
    const body = await request.json().catch(() => null) as { favorite?: unknown } | null;
    if (typeof body?.favorite !== "boolean") return json(request, env.allowedOrigin, { error: "invalid_payload", fields: ["favorite"] }, 400);
    if (body.favorite) {
      await db.insert(schema.favorites).values({ userId, workId, createdAt: new Date().toISOString() }).onConflictDoNothing();
    } else {
      await db.delete(schema.favorites).where(and(eq(schema.favorites.userId, userId), eq(schema.favorites.workId, workId)));
    }
    return json(request, env.allowedOrigin, { data: { workId, favorite: body.favorite } });
  }

  const progressMatch = url.pathname.match(/^\/api\/me\/progress\/([^/]+)$/);
  if (progressMatch && request.method === "PUT") {
    const workId = decodeURIComponent(progressMatch[1]);
    if (!(await publishedWorkExists(db, workId))) return json(request, env.allowedOrigin, { error: "work_not_found" }, 404);
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    const positionSeconds = body?.positionSeconds;
    const playbackRate = body?.playbackRate ?? 1;
    const chapterId = typeof body?.chapterId === "string" && body.chapterId ? body.chapterId : null;
    if (!Number.isInteger(positionSeconds) || Number(positionSeconds) < 0 || typeof playbackRate !== "number" || playbackRate < 0.5 || playbackRate > 2) {
      return json(request, env.allowedOrigin, { error: "invalid_payload", fields: ["positionSeconds", "playbackRate"] }, 400);
    }
    if (chapterId) {
      const chapter = await db.select({ id: schema.chapters.id }).from(schema.chapters).where(and(eq(schema.chapters.id, chapterId), eq(schema.chapters.workId, workId))).limit(1);
      if (!chapter[0]) return json(request, env.allowedOrigin, { error: "chapter_not_found" }, 404);
    }
    const updatedAt = new Date().toISOString();
    const row = { userId, workId, chapterId, positionSeconds: Number(positionSeconds), playbackRateMilli: Math.round(playbackRate * 1000), updatedAt };
    await db.insert(schema.playbackProgress).values(row).onConflictDoUpdate({
      target: [schema.playbackProgress.userId, schema.playbackProgress.workId],
      set: { chapterId, positionSeconds: row.positionSeconds, playbackRateMilli: row.playbackRateMilli, updatedAt },
    });
    return json(request, env.allowedOrigin, { data: row });
  }

  if (url.pathname === "/api/me/moments" && request.method === "POST") {
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    const workId = typeof body?.workId === "string" ? body.workId : "";
    const chapterId = typeof body?.chapterId === "string" && body.chapterId ? body.chapterId : null;
    const positionSeconds = body?.positionSeconds;
    const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : null;
    if (!workId || !Number.isInteger(positionSeconds) || Number(positionSeconds) < 0 || !(await publishedWorkExists(db, workId))) {
      return json(request, env.allowedOrigin, { error: "invalid_payload" }, 400);
    }
    const row = { id: crypto.randomUUID(), userId, workId, chapterId, positionSeconds: Number(positionSeconds), note, createdAt: new Date().toISOString() };
    await db.insert(schema.savedMoments).values(row);
    return json(request, env.allowedOrigin, { data: row }, 201);
  }

  if (url.pathname === "/api/comments" && request.method === "POST") {
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    const targetType = body?.targetType;
    const targetId = typeof body?.targetId === "string" ? body.targetId.trim() : "";
    const commentBody = typeof body?.body === "string" ? body.body.trim() : "";
    if ((targetType !== "work" && targetType !== "film" && targetType !== "community-post") || !targetId || !commentBody || commentBody.length > 2000) {
      return json(request, env.allowedOrigin, { error: "invalid_payload" }, 400);
    }
    const row = { id: crypto.randomUUID(), userId, targetType, targetId, body: commentBody, status: "pending" as const, createdAt: new Date().toISOString() };
    await db.insert(schema.comments).values(row);
    return json(request, env.allowedOrigin, { data: row }, 201);
  }

  return json(request, env.allowedOrigin, { error: "method_not_allowed" }, 405);
}
