import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const source = readFileSync(resolve("app/HomeClient.tsx"), "utf8");

test("home recorder opens the active story context", () => {
  assert.match(source, /const activeHref = active\.slug === "tihiy-den"/);
  assert.match(source, /encodeURIComponent\(active\.title\)/);
  assert.match(source, /<a href=\{activeHref\}>OPEN/);
});

test("recorder playback control exposes the active title", () => {
  assert.match(source, /Пауза: \$\{active\.title\}/);
  assert.match(source, /Воспроизвести: \$\{active\.title\}/);
});

test("community teaser no longer ships placeholder copy", () => {
  assert.doesNotMatch(source, /<em>Стандартно\.<\/em>/);
  assert.match(source, /<em>Открытый канал\.<\/em>/);
});
