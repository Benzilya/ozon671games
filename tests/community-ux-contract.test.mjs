import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const read = (path) => readFileSync(resolve(path), "utf8");

test("community feed avoids dead disabled CMS buttons", () => {
  const source = read("app/community/CommunityClient.tsx");
  assert.doesNotMatch(source, /disabled>Материал появится из CMS/);
  assert.match(source, /ОЖИДАЕТ ДАННЫХ ИЗ CMS/);
});

test("community cards point to meaningful existing destinations", () => {
  const source = read("app/community/CommunityClient.tsx");
  assert.match(source, /href="#submit-work"/);
  assert.match(source, /\/universe\.html/);
  assert.match(source, /id="submit-work"/);
  assert.match(source, /ПРЕДЛОЖИТЬ РАБОТУ/);
  assert.match(source, /СВЕРИТЬСЯ С КАНОНОМ/);
});

test("community actions keep focus visibility and anchor clearance", () => {
  const css = read("app/community/community.css");
  assert.match(css, /community-post-action a:focus-visible/);
  assert.match(css, /scroll-margin-top:96px/);
  assert.match(css, /community-post p\{min-height:0\}/);
});
