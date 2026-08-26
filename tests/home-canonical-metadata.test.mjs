import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const homePath = new URL("../app/HomeClient.tsx", import.meta.url);

async function source() {
  return readFile(homePath, "utf8");
}

test("homepage dossier reads metadata from the story dataset", async () => {
  const text = await source();

  assert.match(text, /quietDan\.formats\.join/);
  assert.match(text, /quietDan\.status\.toUpperCase/);
  assert.match(text, /quietDan\.year\.toUpperCase/);
  assert.match(text, /featuredStories\.slice\(0, 5\)\.map/);
});

test("homepage does not present decorative dossier values as canon", async () => {
  const text = await source();
  const forbidden = ["TD-671-01", "03:17 AM", "ARCHIVE OPEN", "CASE 671 / NEW YORK / NIGHT FILE"];

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `Homepage must not contain unsupported dossier value: ${value}`);
  }
});
