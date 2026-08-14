import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

const root = resolve("dist/client");

test("GitHub Pages export keeps assets at artifact root", () => {
  assert.ok(existsSync(join(root, "index.html")), "index.html should exist");
  assert.ok(existsSync(join(root, "_next", "static", "css")), "CSS directory should exist at artifact root");
  assert.ok(existsSync(join(root, "_next", "static", "chunks")), "JS chunks should exist at artifact root");
  assert.ok(readdirSync(join(root, "_next", "static", "css")).length > 0, "CSS directory should not be empty");
  assert.ok(readdirSync(join(root, "_next", "static", "chunks")).length > 0, "JS chunks directory should not be empty");
  assert.equal(existsSync(join(root, "ozon671games", "_next")), false, "assetPrefix must not create a duplicated physical subpath");

  if (process.env.GITHUB_ACTIONS === "true") {
    const html = readFileSync(join(root, "index.html"), "utf8");
    assert.match(html, /\/ozon671games\/_next\/static\/css\//);
    assert.match(html, /\/ozon671games\/_next\/static\/chunks\//);
  }
});
