import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const root = new URL("../dist/client/", import.meta.url).pathname;
const port = 4173;
const routes = [
  "/",
  "/audiobooks.html",
  "/stories/tihiy-den.html",
  "/films.html",
  "/characters.html",
  "/timeline.html",
  "/universe.html",
  "/shop.html",
  "/community.html",
  "/search.html",
  "/account.html",
  "/admin.html",
  "/legal.html",
];
const mobileRoutes = routes;
const seriousImpacts = new Set(["serious", "critical"]);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function resolveAsset(requestUrl) {
  const url = new URL(requestUrl, `http://127.0.0.1:${port}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.startsWith("/ozon671games/")) pathname = pathname.slice("/ozon671games".length);
  if (pathname === "/") pathname = "/index.html";
  if (!extname(pathname)) pathname = `${pathname}.html`;
  const relative = normalize(pathname).replace(/^([/\\])+/, "");
  if (relative.includes("..")) return null;
  return join(root, relative);
}

const server = createServer(async (request, response) => {
  const file = resolveAsset(request.url ?? "/");
  if (!file) {
    response.writeHead(400).end("Bad request");
    return;
  }
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error("not file");
    const body = await readFile(file);
    response.writeHead(200, {
      "content-type": mime[extname(file).toLowerCase()] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
const browser = await chromium.launch({ headless: true });
const failures = [];
console.log(`Browser quality coverage: ${routes.length} routes × 2 viewports = ${routes.length * 2} audits.`);

async function auditRoute(route, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const failedResponses = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  const started = Date.now();
  const response = await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "networkidle", timeout: 15000 });
  const wallMs = Date.now() - started;
  if (!response?.ok()) failures.push(`${route}: document response ${response?.status() ?? "missing"}`);
  if (pageErrors.length) failures.push(`${route}: page errors: ${pageErrors.join(" | ")}`);
  if (consoleErrors.length) failures.push(`${route}: console errors: ${consoleErrors.join(" | ")}`);
  if (failedResponses.length) failures.push(`${route}: failed resources: ${failedResponses.join(" | ")}`);

  const metrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource");
    const nav = performance.getEntriesByType("navigation")[0];
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      domNodes: document.getElementsByTagName("*").length,
      transferBytes: resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
      durationMs: nav?.duration ?? 0,
      mainCount: document.querySelectorAll("main").length,
      h1Count: document.querySelectorAll("h1").length,
    };
  });

  if (metrics.scrollWidth - metrics.clientWidth > 2) failures.push(`${route}: horizontal overflow ${metrics.scrollWidth - metrics.clientWidth}px at ${viewport.width}px`);
  if (metrics.domNodes > 2500) failures.push(`${route}: DOM budget exceeded (${metrics.domNodes} > 2500)`);
  if (metrics.transferBytes > 4_000_000) failures.push(`${route}: resource transfer budget exceeded (${metrics.transferBytes} bytes)`);
  if (wallMs > 8000 || metrics.durationMs > 8000) failures.push(`${route}: navigation budget exceeded (${Math.round(Math.max(wallMs, metrics.durationMs))}ms)`);
  if (metrics.mainCount !== 1) failures.push(`${route}: expected exactly one <main>, found ${metrics.mainCount}`);
  if (metrics.h1Count < 1) failures.push(`${route}: page has no <h1>`);

  const axe = await new AxeBuilder({ page }).analyze();
  const blockingViolations = axe.violations.filter((item) => seriousImpacts.has(item.impact));
  for (const violation of blockingViolations) {
    const targets = violation.nodes.slice(0, 3).flatMap((node) => node.target).join(", ");
    failures.push(`${route}: axe ${violation.impact} ${violation.id} — ${targets}`);
  }

  console.log(`${route} @ ${viewport.width}x${viewport.height}: DOM=${metrics.domNodes}, transfer=${metrics.transferBytes}, nav=${Math.round(metrics.durationMs)}ms, axe=${axe.violations.length}`);
  await context.close();
}

try {
  for (const route of routes) await auditRoute(route, { width: 1440, height: 1000 });
  for (const route of mobileRoutes) await auditRoute(route, { width: 390, height: 844 });
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

if (failures.length) {
  console.error("Browser quality gate failed:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log("Browser quality gate passed.");
