import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const readSource = (path) => readFileSync(resolve(path), "utf8");

test("Quiet Dan connects to confirmed character, film and universe files", () => {
  const source = readSource("app/stories/tihiy-den/StoryClient.tsx");
  assert.match(source, /films\.html/);
  assert.match(source, /characters\.html/);
  assert.match(source, /universe\.html/);
  assert.match(source, /story-media-card-link/);
  assert.match(source, /story-world-card-link/);
});

test("character inspector exposes related archive files without inventing redacted story links", () => {
  const source = readSource("app/characters/CharactersClient.tsx");
  assert.match(source, /case-crosslinks/);
  assert.match(source, /active\.id === "tihiy-den"/);
  assert.match(source, /stories\/tihiy-den\.html/);
  assert.match(source, /universe\.html/);
  assert.match(source, /films\.html/);
});

test("film inspector links Quiet Dan concepts back to confirmed archive files", () => {
  const source = readSource("app/films/FilmsClient.tsx");
  assert.match(source, /const isQuietDan = active\.story === "Тихий Дэн"/);
  assert.match(source, /stories\/tihiy-den\.html/);
  assert.match(source, /characters\.html/);
  assert.match(source, /universe\.html/);
});

test("crosslink styling stays keyboard-visible and readable", () => {
  const css = readSource("app/inner-archive.css");
  assert.match(css, /\.case-crosslinks/);
  assert.match(css, /focus-visible/);
  assert.match(css, /min-height:34px/);
  assert.match(css, /font-size:10px/);
});
