/** Cloudflare Worker entry point for the vinext application and API. */
import { and, asc, eq, or } from "drizzle-orm";
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
    "access-control-allow-methods": "GET,POST,PUT,PATCH,OPTIONS",
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

function isAssetKind(value: unknown): value is "image" | "audio" | "video" | "document" {
  return value === "image" || value === "audio" || value === "video" || value === "document";
}

function isAiDisclosure(value: unknown): value is "none" | "ai-assisted" | "ai-generated" {
  return value === "none" || value === "ai-assisted" || value === "ai-generated";
}

function cleanOptionalInteger(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return Number.isInteger(value) ? Number(value) : undefined;
}

function safeStorageKey(value: unknown) {
  if (typeof value !== "string") return null;
  const key = value.trim().replace(/^\/+/, "");
  if (!key || key.length > 512 || key.includes("..") || !/^[a-zA-Z0-9/_.,@+() -]+$/.test(key)) return null;
  return key;
}

function assetStorageKey(url: string) {
  return url.startsWith("r2://") ? safeStorageKey(url.slice(5)) : null;
}

async function assetHasPublicReference(db: ReturnType<typeof drizzle<typeof schema>>, assetId: string) {
  const work = await db.select({ id: schema.works.id }).from(schema.works).where(and(
    eq(schema.works.publicationStatus, "published"),
    eq(schema.works.rightsStatus, "cleared"),
    or(eq(schema.works.coverAssetId, assetId), eq(schema.works.heroAssetId, assetId)),
  )).limit(1);
  if (work[0]) return true;

  const chapter = await db.select({ id: schema.chapters.id }).from(schema.chapters)
    .innerJoin(schema.works, eq(schema.chapters.workId, schema.works.id))
    .where(and(
      eq(schema.chapters.audioAssetId, assetId),
      eq(schema.chapters.publicationStatus, "published"),
      eq(schema.works.publicationStatus, "published"),
      eq(schema.works.rightsStatus, "cleared"),
    )).limit(1);
  if (chapter[0]) return true;

  const [film, character, product] = await Promise.all([
    db.select({ id: schema.films.id }).from(schema.films).where(and(eq(schema.films.videoAssetId, assetId), eq(schema.films.publicationStatus, "published"))).limit(1),
    db.select({ id: schema.characters.id }).from(schema.characters).where(and(eq(schema.characters.portraitAssetId, assetId), eq(schema.characters.publicationStatus, "published"))).limit(1),
    db.select({ id: schema.products.id }).from(schema.products).where(and(eq(schema.products.coverAssetId, assetId), eq(schema.products.publicationStatus, "published"))).limit(1),
  ]);
  return Boolean(film[0] || character[0] || product[0]);
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

  if (url.pathname === "/api/admin/assets" && request.method === "POST") {
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    const kind = body?.kind;
    const key = safeStorageKey(body?.storageKey);
    const aiDisclosure = body?.aiDisclosure ?? "none";
    if (!isAssetKind(kind) || !key || !isAiDisclosure(aiDisclosure)) {
      return adminJson(env, request, { error: "invalid_payload", fields: ["kind", "storageKey", "aiDisclosure"] }, 400);
    }
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    await db.insert(schema.assets).values({
      id,
      kind,
      url: `r2://${key}`,
      alt: typeof body?.alt === "string" ? body.alt.trim() : null,
      rightsStatus: "unverified",
      rightsHolder: typeof body?.rightsHolder === "string" ? body.rightsHolder.trim() : null,
      licenseNote: typeof body?.licenseNote === "string" ? body.licenseNote.trim() : null,
      aiDisclosure,
      createdAt: now,
      updatedAt: now,
    });
    const created = await db.select().from(schema.assets).where(eq(schema.assets.id, id)).limit(1);
    return adminJson(env, request, { data: created[0] }, 201);
  }

  const adminAssetMatch = url.pathname.match(/^\/api\/admin\/assets\/([^/]+)$/);
  if (adminAssetMatch && request.method === "PATCH") {
    const id = decodeURIComponent(adminAssetMatch[1]);
    const current = (await db.select().from(schema.assets).where(eq(schema.assets.id, id)).limit(1))[0];
    if (!current) return adminJson(env, request, { error: "not_found" }, 404);
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body) return adminJson(env, request, { error: "invalid_payload" }, 400);
    const patch: Partial<typeof schema.assets.$inferInsert> = { updatedAt: new Date().toISOString() };
    if (isRightsStatus(body.rightsStatus)) patch.rightsStatus = body.rightsStatus;
    if (isAiDisclosure(body.aiDisclosure)) patch.aiDisclosure = body.aiDisclosure;
    if (typeof body.alt === "string" || body.alt === null) patch.alt = body.alt as string | null;
    if (typeof body.rightsHolder === "string" || body.rightsHolder === null) patch.rightsHolder = body.rightsHolder as string | null;
    if (typeof body.licenseNote === "string" || body.licenseNote === null) patch.licenseNote = body.licenseNote as string | null;
    await db.update(schema.assets).set(patch).where(eq(schema.assets.id, id));
    const updated = await db.select().from(schema.assets).where(eq(schema.assets.id, id)).limit(1);
    return adminJson(env, request, { data: updated[0] });
  }

  const mediaUploadMatch = url.pathname.match(/^\/api\/admin\/media\/([^/]+)$/);
  if (mediaUploadMatch && request.method === "PUT") {
    if (!env.MEDIA) return adminJson(env, request, { error: "backend_not_configured", resource: "R2" }, 503);
    const assetId = decodeURIComponent(mediaUploadMatch[1]);
    const asset = (await db.select().from(schema.assets).where(eq(schema.assets.id, assetId)).limit(1))[0];
    if (!asset) return adminJson(env, request, { error: "not_found" }, 404);
    const key = assetStorageKey(asset.url);
    if (!key) return adminJson(env, request, { error: "invalid_storage_reference" }, 409);
    if (!request.body) return adminJson(env, request, { error: "empty_body" }, 400);

    const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() ?? "application/octet-stream";
    const allowed = asset.kind === "image" ? contentType.startsWith("image/")
      : asset.kind === "audio" ? contentType.startsWith("audio/")
      : asset.kind === "video" ? contentType.startsWith("video/")
      : contentType === "application/pdf" || contentType === "application/octet-stream";
    if (!allowed) return adminJson(env, request, { error: "content_type_mismatch", kind: asset.kind, contentType }, 415);

    const object = await env.MEDIA.put(key, request.body, { httpMetadata: { contentType } });
    return adminJson(env, request, { data: { assetId, key, etag: object.httpEtag, uploaded: true } }, 201);
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

  const publicMediaMatch = url.pathname.match(/^\/api\/media\/([^/]+)$/);
  if (publicMediaMatch) {
    if (!env.MEDIA) return unavailable("R2");
    const assetId = decodeURIComponent(publicMediaMatch[1]);
    const asset = (await db.select().from(schema.assets).where(and(eq(schema.assets.id, assetId), eq(schema.assets.rightsStatus, "cleared"))).limit(1))[0];
    if (!asset || !(await assetHasPublicReference(db, assetId))) return json({ error: "not_found" }, 404, { "cache-control": "no-store" });
    const key = assetStorageKey(asset.url);
    if (!key) return json({ error: "not_found" }, 404, { "cache-control": "no-store" });
    const object = await env.MEDIA.get(key);
    if (!object) return json({ error: "not_found" }, 404, { "cache-control": "no-store" });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "public, max-age=3600, stale-while-revalidate=86400");
    headers.set("x-content-type-options", "nosniff");
    return new Response(request.method === "HEAD" ? null : object.body, { headers });
  }

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
    if (apiResponse) return request.method === "HEAD" && apiResponse.headers.get("content-type")?.includes("application/json") ? new Response(null, { status: apiResponse.status, headers: apiResponse.headers }) : apiResponse;

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
