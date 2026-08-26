import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const characterPath = new URL("../app/characters/CharactersClient.tsx", import.meta.url);

test("character archive is anchored to the central Quiet Dan record", async () => {
  const text = await readFile(characterPath, "utf8");

  assert.match(text, /import \{ quietDan \} from "\.\.\/data\/stories";/);
  assert.match(text, /code: quietDan\.code/);
  assert.match(text, /work: quietDan\.title/);
  assert.match(text, /quietDan\.description/);
});

test("character archive does not invent official-looking record identifiers", async () => {
  const text = await readFile(characterPath, "utf8");

  for (const value of ["TD-001", "??-002", "??-003", "??-004"]) {
    assert.equal(text.includes(value), false, `Unsupported character code must not appear: ${value}`);
  }
});
