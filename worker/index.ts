/** Cloudflare Worker entry point for the vinext application and future API. */
import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import * as schema from "../db/schema";

interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  MEDIA?: R2Bucket;
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

const apiHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,HEAD,OPTIONS",
  "access-control-allow-headers": "content-type",
  "cache-control": "public, max-age=60, stale-while-revalidate=300",
};

function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...apiHeaders, ...headers } });
}

function unavailable(resource: "D1" | "R2") {
  return json({ error: "backend_not_configured", resource, message: `${resource} binding is not configured for this deployment.` }, 503, { "cache-control": "no-store" });
}

async function handleApi(request: Request, env: Env, url: URL): Promise<Response | null> {
  if (!url.pathname.startsWith("/api/")) return null;
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: apiHeaders });

  if (url.pathname === "/api/health" && request.method === "GET") {
    return json({ ok: true, databaseConfigured: Boolean(env.DB), mediaConfigured: Boolean(env.MEDIA), mode: "cloudflare-worker" }, 200, { "cache-control": "no-store" });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return json({ error: "auth_not_configured", message: "Write API is intentionally disabled until production authentication is configured." }, 501, { "cache-control": "no-store" });
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

    const apiResponse = await handleApi(request, env, url);
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
