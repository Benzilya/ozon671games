import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";

const root = resolve("dist/client");
const read = (path) => readFileSync(join(root, path), "utf8");

const requiredRoutes = [
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
];

test("exports every public product route", () => {
  for (const route of requiredRoutes) {
    assert.ok(existsSync(join(root, route)), `${route} should exist in the static export`);
  }
});

test("homepage renders the bespoke editorial archive instead of starter UI", () => {
  const html = read("index.html");
  assert.match(html, /NIGHT ARCHIVE/);
  assert.match(html, /ТИХИЙ/);
  assert.match(html, /РЕСПЕКТ ФАНАМ/);
  assert.match(html, /Дела из архива/);
  assert.doesNotMatch(html, /Starter Project|Your site is taking shape|Building your site/);
  assert.doesNotMatch(html, /3 500 ₽|3,500 ₽/);
});

test("Quiet Dan route exposes player and rights-safe demo language", () => {
  const html = read("stories/tihiy-den.html");
  assert.match(html, /Тихий Дэн|ТИХИЙ/);
  assert.match(html, /Аудиоплеер|Слушать/);
  assert.match(html, /−15|\+15/);
  assert.match(html, /Таймер сна/);
  assert.match(html, /localStorage/);
  assert.match(html, /Создано с помощью ИИ/);
  assert.match(html, /не цитата из произведения/i);
});

test("generated navigation points only to exported same-site HTML routes", () => {
  const htmlFiles = ["index.html", "audiobooks.html", "films.html", "characters.html", "timeline.html", "universe.html", "shop.html", "community.html", "account.html"];
  const unresolved = [];

  for (const file of htmlFiles) {
    const html = read(file);
    const hrefs = [...html.matchAll(/href=["']([^"']+)["']/g)].map((match) => match[1]);
    for (const href of hrefs) {
      if (!href.startsWith("/ozon671games/")) continue;
      const raw = href.slice("/ozon671games/".length).split(/[?#]/, 1)[0];
      if (!raw || raw.startsWith("_next/")) continue;
      const target = raw.endsWith("/") ? `${raw}index.html` : raw;
      if (!target.endsWith(".html")) continue;
      if (!existsSync(join(root, target))) unresolved.push(`${file} -> ${href}`);
    }
  }

  assert.deepEqual(unresolved, [], `Broken exported links:\n${unresolved.join("\n")}`);
});

test("SEO and crawler files point at the GitHub Pages production base", () => {
  const sitemap = read("sitemap.xml");
  const robots = read("robots.txt");
  assert.match(sitemap, /https:\/\/benzilya\.github\.io\/ozon671games\//);
  assert.match(sitemap, /stories\/tihiy-den\.html/);
  assert.match(robots, /Sitemap:/i);
  assert.match(robots, /admin\.html/);
  assert.match(robots, /account\.html/);
});

test("all required nested route directories are valid filesystem targets", () => {
  for (const route of requiredRoutes.filter((item) => item.includes("/"))) {
    assert.ok(existsSync(dirname(join(root, route))), `directory for ${route} should exist`);
  }
});
