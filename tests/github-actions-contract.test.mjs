import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowPaths = [
  "pages.yml",
  "ci.yml",
  "security-audit.yml",
  "browser-quality.yml",
  "cloudflare-deploy.yml",
  "product-tests.yml",
];

const workflows = await Promise.all(
  workflowPaths.map(async (name) => ({
    name,
    content: await readFile(new URL(`../.github/workflows/${name}`, import.meta.url), "utf8"),
  })),
);

test("first-party checkout and setup-node actions use Node 24 based v7 releases", () => {
  for (const { name, content } of workflows) {
    assert.doesNotMatch(content, /actions\/checkout@v4/, `${name} still uses checkout@v4`);
    assert.doesNotMatch(content, /actions\/setup-node@v4/, `${name} still uses setup-node@v4`);
    assert.match(content, /actions\/checkout@v7/, `${name} must use checkout@v7`);
    assert.match(content, /actions\/setup-node@v7/, `${name} must use setup-node@v7`);
    assert.match(content, /node-version: 22\.13\.0/, `${name} must keep the project Node version pinned`);
  }
});
