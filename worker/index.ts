/** Cloudflare Worker entry point for the vinext application and API. */
import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import * as schema from "../db/schema";

interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  MEDIA?: R2Bucket;
  ADMIN_API_TOKEN?: string;
  ADMIN_ALLOWED_ORIGIN?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const publicApiHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,HEAD,OPTIONS",
  "access-control-allow-headers": "content-type",
  "cache-control": "public, max-age=60, stale-while-revalidate=300",
};

function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...publicApiHeaders, ...headers } });
}

function adminHeaders(env: Env, request: Request) {
  const headers: Record<string, string> = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
    "access-control-allow-headers": "authorization,content-type",
    "vary": "Origin",
  };
  const origin = request.headers.get("origin");
  if (origin && env.ADMIN_ALLOWED_ORIGIN && origin === env.ADMIN_ALLOWED_ORIGIN) {
    headers["access-control-allow-origin"] = origin;
  }
  return headers;
}

function adminJson(env: Env, request: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: adminHeaders(env, request) });
}

function unavailable(resource: "D1" | "R2") {
  return json({ error: "backend_not_configured", resource, message: `${resource} binding is not configured for this deployment.` }, 503, { "cache-control": "no-store" });
}

async function secureEqual(left: string, right: string) {
  const encoder = new TextEncoder();
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);
  const a = new Uint8Array(leftHash);
  const b = new Uint8Array(rightHash);
  let diff = a.length ^ b.length;
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) diff |= a[index] ^ b[index];
  return diff === 0;
}

async function isAdminAuthorized(request: Request, env: Env) {
  if (!env.ADMIN_API_TOKEN) return false;
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return false;
  return secureEqual(authorization.slice(7), env.ADMIN_API_TOKEN);
}

function isPublicationStatus(value: unknown): value is "draft" | "review" | "published" | "archived" {
  return value === "draft" || value === "review" || value === "published" || value === "archived";
}

function isRightsStatus(value: unknown): value is "unverified" | "cleared" | "restricted" | "expired" {
  return value === "unverified" || value === "cleared" || value === "restricted" || value === "expired";
}

function cleanOptionalInteger(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return Number.isInteger(value) ? Number(value) : undefined;
}

async function handleAdminApi(request: Request, env: Env, url: URL): Promise<Response | null> {
  if (!url.pathname.startsWith("/api/admin/")) return null;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: adminHeaders(env, request) });
  }

  if (!env.ADMIN_API_TOKEN) {
    return adminJson(env, request, { error: "admin_auth_not_configured", message: "ADMIN_API_TOKEN is missing for this deployment." }, 503);
  }
  if (!(await isAdminAuthorized(request, env))) {
    return adminJson(env, request, { error: "unauthorized" }, 401);
  }
  if (!env.DB) {
    return adminJson(env, request, { error: "backend_not_configured", resource: "D1" }, 503);
  }

  const db = drizzle(env.DB, { schema });

  if (url.pathname === "/api/admin/health" && request.method === "GET") {
    return adminJson(env, request, { ok: true, databaseConfigured: true, mediaConfigured: Boolean(env.MEDIA), adminAuthConfigured: true });
  }

  if (url.pathname === "/api/admin/works" && request.method === "GET") {
    const rows = await db.select().from(schema.works).orderBy(asc(schema.works.title));
    return adminJson(env, request, { data: rows });
  }

  if (url.pathname === "/api/admin/works" && request.method === "POST") {
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    if (!title || !slug || !/^[a-z0-9-]+$/.test(slug)) {
      return adminJson(env, request, { error: "invalid_payload", fields: ["title", "slug"] }, 400);
    }
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    await db.insert(schema.works).values({ id, slug, title, description, publicationStatus: "draft", rightsStatus: "unverified", createdAt: now, updatedAt: now });
    const created = await db.select().from(schema.works).where(eq(schema.works.id, id)).limit(1);
    return adminJson(env, request, { data: created[0] }, 201);
  }

  const adminWorkMatch = url.pathname.match(/^\/api\/admin\/works\/([^/]+)$/);
  if (adminWorkMatch && request.method === "PATCH") {
    const id = decodeURIComponent(adminWorkMatch[1]);
    const currentRows = await db.select().from(schema.works).where(eq(schema.works.id, id)).limit(1);
    const current = currentRows[0];
    if (!current) return adminJson(env, request, { error: "not_found" }, 404);

    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body) return adminJson(env, request, { error: "invalid_payload" }, 400);

    const patch: Partial<typeof schema.works.$inferInsert> = { updatedAt: new Date().toISOString() };
    if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim();
    if (typeof body.description === "string") patch.description = body.description.trim();
    if (typeof body.ageRating === "string" || body.ageRating === null) patch.ageRating = body.ageRating as string | null;
    if (isPublicationStatus(body.publicationStatus)) patch.publicationStatus = body.publicationStatus;
    if (isRightsStatus(body.rightsStatus)) patch.rightsStatus = body.rightsStatus;

    const year = cleanOptionalInteger(body.year);
    if (year !== undefined) patch.year = year;
    const durationSeconds = cleanOptionalInteger(body.durationSeconds);
    if (durationSeconds !== undefined) patch.durationSeconds = durationSeconds;

    const finalPublicationStatus = patch.publicationStatus ?? current.publicationStatus;
    const finalRightsStatus = patch.rightsStatus ?? current.rightsStatus;
    if (finalPublicationStatus === "published" && finalRightsStatus !== "cleared") {
      return adminJson(env, request, { error: "rights_gate", message: "A work cannot be published until rights_status is cleared." }, 409);
    }

    await db.update(schema.works).set(patch).where(eq(schema.works.id, id));
    const updated = await db.select().from(schema.works).where(eq(schema.works.id, id)).limit(1);
    return adminJson(env, request, { data: updated[0] });
  }

  const commentMatch = url.pathname.match(/^\/api\/admin\/comments\/([^/]+)$/);
  if (commentMatch && request.method === "PATCH") {
    const id = decodeURIComponent(commentMatch[1]);
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    const status = body?.status;
    if (status !== "pending" && status !== "approved" && status !== "rejected") {
      return adminJson(env, request, { error: "invalid_payload", fields: ["status"] }, 400);
    }
    await db.update(schema.comments).set({ status }).where(eq(schema.comments.id, id));
    const updated = await db.select().from(schema.comments).where(eq(schema.comments.id, id)).limit(1);
    if (!updated[0]) return adminJson(env, request, { error: "not_found" }, 404);
    return adminJson(env, request, { data: updated[0] });
  }

  return adminJson(env, request, { error: "not_found" }, 404);
}

async function handlePublicApi(request: Request, env: Env, url: URL): Promise<Response | null> {
  if (!url.pathname.startsWith("/api/") || url.pathname.startsWith("/api/admin/")) return null;
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: publicApiHeaders });

  if (url.pathname === "/api/health" && request.method === "GET") {
    return json({ ok: true, databaseConfigured: Boolean(env.DB), mediaConfigured: Boolean(env.MEDIA), adminAuthConfigured: Boolean(env.ADMIN_API_TOKEN), mode: "cloudflare-worker" }, 200, { "cache-control": "no-store" });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return json({ error: "method_not_allowed", message: "Public write operations are disabled. Use authenticated user/admin endpoints when configured." }, 405, { "cache-control": "no-store", allow: "GET, HEAD, OPTIONS" });
  }

  if (!env.DB) return unavailable("D1");
  const db = drizzle(env.DB, { schema });

  if (url.pathname === "/api/works") {
    const rows = await db.select().from(schema.works).where(and(eq(schema.works.publicationStatus, "published"), eq(schema.works.rightsStatus, "cleared"))).orderBy(asc(schema.works.title));
    return json({ data: rows });
  }

  const workMatch = url.pathname.match(/^\/api\/works\/([^/]+)$/);
  if (workMatch) {
    const slug = decodeURIComponent(workMatch[1]);
    const rows = await db.select().from(schema.works).where(and(eq(schema.works.slug, slug), eq(schema.works.publicationStatus, "published"), eq(schema.works.rightsStatus, "cleared"))).limit(1);
    const work = rows[0];
    if (!work) return json({ error: "not_found" }, 404);
    const [genres, chapterRows] = await Promise.all([
      db.select().from(schema.workGenres).where(eq(schema.workGenres.workId, work.id)).orderBy(asc(schema.workGenres.genre)),
      db.select().from(schema.chapters).where(and(eq(schema.chapters.workId, work.id), eq(schema.chapters.publicationStatus, "published"))).orderBy(asc(schema.chapters.order)),
    ]);
    return json({ data: { ...work, genres: genres.map((item) => item.genre), chapters: chapterRows } });
  }

  if (url.pathname === "/api/films") {
    const rows = await db.select().from(schema.films).where(eq(schema.films.publicationStatus, "published")).orderBy(asc(schema.films.title));
    return json({ data: rows });
  }

  if (url.pathname === "/api/characters") {
    const rows = await db.select().from(schema.characters).where(eq(schema.characters.publicationStatus, "published")).orderBy(asc(schema.characters.name));
    return json({ data: rows });
  }

  if (url.pathname === "/api/timeline") {
    const rows = await db.select().from(schema.events).where(eq(schema.events.publicationStatus, "published")).orderBy(asc(schema.events.startsAt));
    return json({ data: rows });
  }

  if (url.pathname === "/api/products") {
    const rows = await db.select().from(schema.products).where(eq(schema.products.publicationStatus, "published")).orderBy(asc(schema.products.title));
    return json({ data: rows });
  }

  if (url.pathname === "/api/links") {
    const rows = await db.select().from(schema.externalLinks).where(eq(schema.externalLinks.publicationStatus, "published")).orderBy(asc(schema.externalLinks.label));
    return json({ data: rows });
  }

  return json({ error: "not_found" }, 404);
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    const adminResponse = await handleAdminApi(request, env, url);
    if (adminResponse) return adminResponse;

    const apiResponse = await handlePublicApi(request, env, url);
    if (apiResponse) return request.method === "HEAD" ? new Response(null, { status: apiResponse.status, headers: apiResponse.headers }) : apiResponse;

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env as Env & { DB: D1Database }, ctx);
  },
};

export default worker;
