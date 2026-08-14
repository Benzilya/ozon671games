import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const exportRoot = path.resolve("dist/client");
const publicBase = "/ozon671games";
const pages = [
  "index.html",
  "search.html",
  "audiobooks.html",
  "films.html",
  "characters.html",
  "timeline.html",
  "universe.html",
  "shop.html",
  "community.html",
  "account.html",
  "admin.html",
  "stories/tihiy-den.html",
  "404.html",
];

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function htmlTargetFromHref(href) {
  if (!href.startsWith(`${publicBase}/`)) return null;
  const clean = href.slice(publicBase.length).split(/[?#]/, 1)[0];
  if (!clean || clean === "/") return "index.html";
  const relative = clean.replace(/^\//, "");
  if (relative.startsWith("_next/") || relative.startsWith("favicon") || relative === "og.png") return null;
  if (relative.endsWith("/")) return path.join(relative, "index.html");
  if (path.extname(relative)) return relative.endsWith(".html") ? relative : null;
  return `${relative}.html`;
}

test("exports all public and utility pages", async () => {
  for (const page of pages) {
    assert.equal(await exists(path.join(exportRoot, page)), true, `Missing exported page: ${page}`);
  }
  assert.equal(await exists(path.join(exportRoot, "sitemap.xml")), true);
  assert.equal(await exists(path.join(exportRoot, "robots.txt")), true);
});

test("exported pages are the Ozon671Games site, not the starter placeholder", async () => {
  const html = await readFile(path.join(exportRoot, "index.html"), "utf8");
  assert.match(html, /OZON 671/);
  assert.match(html, /ТИХИЙ/);
  assert.match(html, /Истории, которые невозможно забыть|вселенная аудиокниг/i);
  assert.doesNotMatch(html, /Your site is taking shape|Starter Project|Building your site/i);
  assert.match(html, /lang="ru"/);
  assert.match(html, /Перейти к основному содержанию/);
});

test("all internal HTML links from key pages resolve inside the export", async () => {
  for (const page of pages.filter((item) => item !== "404.html")) {
    const html = await readFile(path.join(exportRoot, page), "utf8");
    const hrefs = [...html.matchAll(/href=["']([^"']+)["']/g)].map((match) => match[1]);
    for (const href of hrefs) {
      const target = htmlTargetFromHref(href);
      if (!target) continue;
      assert.equal(
        await exists(path.join(exportRoot, target)),
        true,
        `Broken internal link in ${page}: ${href} -> ${target}`,
      );
    }
  }
});

test("robots and sitemap match the GitHub Pages production origin", async () => {
  const [robots, sitemap] = await Promise.all([
    readFile(path.join(exportRoot, "robots.txt"), "utf8"),
    readFile(path.join(exportRoot, "sitemap.xml"), "utf8"),
  ]);
  assert.match(robots, /Disallow: \/ozon671games\/admin\.html/);
  assert.match(robots, /Disallow: \/ozon671games\/account\.html/);
  assert.match(robots, /https:\/\/benzilya\.github\.io\/ozon671games\/sitemap\.xml/);
  assert.match(sitemap, /https:\/\/benzilya\.github\.io\/ozon671games\/stories\/tihiy-den\.html/);
  assert.doesNotMatch(sitemap, /account\.html|admin\.html|search\.html/);
});

test("AI and commerce pages keep required prototype disclosures", async () => {
  const [films, shop] = await Promise.all([
    readFile(path.join(exportRoot, "films.html"), "utf8"),
    readFile(path.join(exportRoot, "shop.html"), "utf8"),
  ]);
  assert.match(films, /Создано с помощью ИИ|AI-контент|AI-КОНТЕНТ/i);
  assert.match(films, /не реальные съёмки|не выдаются за реальные съёмки/i);
  assert.match(shop, /Цена[^<]{0,40}CMS|цены[^<]{0,60}CMS/i);
  assert.match(shop, /демо|без реального списания/i);
});
