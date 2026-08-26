import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const searchPath = new URL("../app/search/SearchClient.tsx", import.meta.url);

test("search describes the current verified-data archive behavior", async () => {
  const text = await readFile(searchPath, "utf8");

  assert.match(text, /Межкнижные связи появляются только после подтверждения/);
  assert.match(text, /точные цены, тиражи и наличие только из CMS/);
  assert.match(text, /локальные демо-опросы/);
  assert.doesNotMatch(text, /Связи произведений, персонажей, событий и локаций/);
});
