import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const read = (path) => readFileSync(resolve(path), "utf8");

test("global search empty state provides useful recovery paths", () => {
  const source = read("app/search/SearchClient.tsx");
  const css = read("app/search/search.css");
  assert.match(source, /Очистить запрос/);
  assert.match(source, /Аудиоархив/);
  assert.match(source, /Карта вселенной/);
  assert.match(source, /replaceState/);
  assert.match(css, /global-search-empty-actions/);
  assert.match(css, /focus-visible/);
});

test("catalog empty state resets all filters", () => {
  const source = read("app/audiobooks/AudiobooksClient.tsx");
  assert.match(source, /Показать весь архив/);
  assert.match(source, /onClick=\{resetFilters\}/);
  assert.match(source, /localStorage\.removeItem\(storageKey\)/);
});

test("character empty state can restore the full personnel archive", () => {
  const source = read("app/characters/CharactersClient.tsx");
  const css = read("app/characters/characters.css");
  assert.match(source, /resetCharacterFilters/);
  assert.match(source, /setStatus\("Все"\)/);
  assert.match(source, /Показать весь архив/);
  assert.match(css, /characters-empty button/);
  assert.match(css, /characters-empty button:focus-visible/);
});
