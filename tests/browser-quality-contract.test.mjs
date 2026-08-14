import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflow = await readFile(new URL("../.github/workflows/browser-quality.yml", import.meta.url), "utf8");
const script = await readFile(new URL("../scripts/browser-quality.mjs", import.meta.url), "utf8");

test("browser QA uses pinned Playwright and axe versions", () => {
  assert.match(workflow, /playwright@1\.60\.0/);
  assert.match(workflow, /@axe-core\/playwright@4\.12\.1/);
  assert.match(workflow, /playwright install --with-deps chromium/);
});

test("browser QA covers runtime, performance and accessibility failures", () => {
  assert.match(script, /pageerror/);
  assert.match(script, /response\.status\(\) >= 400/);
  assert.match(script, /horizontal overflow/);
  assert.match(script, /DOM budget exceeded/);
  assert.match(script, /resource transfer budget exceeded/);
  assert.match(script, /navigation budget exceeded/);
  assert.match(script, /AxeBuilder/);
  assert.match(script, /seriousImpacts/);
});

test("browser QA covers core product routes and mobile viewports", () => {
  assert.match(script, /\/stories\/tihiy-den\.html/);
  assert.match(script, /\/films\.html/);
  assert.match(script, /\/shop\.html/);
  assert.match(script, /\/account\.html/);
  assert.match(script, /\/admin\.html/);
  assert.match(script, /width: 390/);
});
