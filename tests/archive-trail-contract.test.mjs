import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const read = (path) => readFileSync(resolve(path), "utf8");

test("root layout mounts the contextual archive trail", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /ArchiveTrail/);
  assert.match(layout, /archive-trail\.css/);
  assert.match(layout, /<ArchiveTrail\s*\/>/);
});

test("archive trail excludes service, legal, and high-focus routes", () => {
  const source = read("app/components/ArchiveTrail.tsx");
  for (const route of ["/account", "/admin", "/search", "/shop", "/legal"]) assert.match(source, new RegExp(route.replace("/", "\\/")));
  assert.match(source, /CASE PATH/);
  assert.match(source, /Следующее дело/);
  assert.match(source, /aria-current="page"/);
  assert.match(source, /if \(!active\) return null/);
});

test("archive trail clears mobile dock and keeps readable keyboard UI", () => {
  const css = read("app/archive-trail.css");
  assert.match(css, /bottom:126px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-transparency/);
  assert.match(css, /archive-trail-index\{[^}]*background:#0b0b0a[^}]*color:#f1eadf/);
});
