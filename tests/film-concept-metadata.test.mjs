import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const filmsPath = new URL("../app/films/FilmsClient.tsx", import.meta.url);

test("film concepts use canonical work metadata and explicit AI disclosure", async () => {
  const text = await readFile(filmsPath, "utf8");

  assert.match(text, /import \{ quietDan \} from "\.\.\/data\/stories";/);
  assert.match(text, /VISUAL FILE \/ \{quietDan\.code\} \/ CONCEPT/);
  assert.match(text, /Создано с помощью ИИ/);
  assert.match(text, /REAL FOOTAGE: NO/);
});

test("film demo player does not claim fake official file IDs or video quality", async () => {
  const text = await readFile(filmsPath, "utf8");

  assert.equal(text.includes("TD-01"), false);
  assert.equal(text.includes("1080p"), false);
  assert.match(text, /QUALITY —/);
});
