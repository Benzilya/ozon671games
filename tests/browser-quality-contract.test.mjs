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

test("browser QA covers runtime, performance, accessibility and internal link failures", () => {
  assert.match(script, /pageerror/);
  assert.match(script, /response\.status\(\) >= 400/);
  assert.match(script, /horizontal overflow/);
  assert.match(script, /DOM budget exceeded/);
  assert.match(script, /resource transfer budget exceeded/);
  assert.match(script, /navigation budget exceeded/);
  assert.match(script, /AxeBuilder/);
  assert.match(script, /seriousImpacts/);
  assert.match(script, /checkedInternalLinks/);
  assert.match(script, /context\.request\.get/);
  assert.match(script, /internal link .* returned/);
});

test("browser QA covers every application route on desktop and mobile", () => {
  for (const route of [
    "audiobooks",
    "stories/tihiy-den",
    "films",
    "characters",
    "timeline",
    "universe",
    "shop",
    "community",
    "search",
    "account",
    "admin",
    "legal",
  ]) {
    assert.match(script, new RegExp(`/${route.replace("/", "\\/")}\\.html`));
  }
  assert.match(script, /const mobileRoutes = routes;/);
  assert.match(script, /width: 390/);
  assert.match(script, /width: 1440/);
});
