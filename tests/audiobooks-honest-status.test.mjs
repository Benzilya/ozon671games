import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const source = readFileSync(resolve("app/audiobooks/AudiobooksClient.tsx"), "utf8");

test("unpublished audiobook cards expose a status instead of a dead button", () => {
  assert.doesNotMatch(source, /disabled>Карточка готовится<\/button>/);
  assert.match(source, /Карточка ожидает данных/);
  assert.match(source, /story\.slug === "tihiy-den"/);
});
