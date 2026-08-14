import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const client = await readFile(new URL("../app/admin/AdminClient.tsx", import.meta.url), "utf8");
const page = await readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8");

test("admin credentials are session-scoped and never hardcoded", () => {
  assert.match(client, /window\.sessionStorage\.setItem\(tokenKey,token\)/);
  assert.match(client, /window\.sessionStorage\.removeItem\(tokenKey\)/);
  assert.doesNotMatch(client, /localStorage/);
  assert.doesNotMatch(client, /ADMIN_API_TOKEN\s*=/);
  assert.match(client, /type="password"/);
});

test("operator console talks only to authenticated admin endpoints", () => {
  assert.match(client, /Authorization/);
  assert.match(client, /Bearer \$\{token\}/);
  assert.match(client, /\/api\/admin\/health/);
  assert.match(client, /\/api\/admin\/works/);
  assert.match(client, /\/api\/admin\/assets/);
  assert.match(client, /\/api\/admin\/media\//);
});

test("admin page remains excluded from search indexing", () => {
  assert.match(page, /robots: \{ index: false, follow: false \}/);
  assert.match(page, /CMS Operator/);
});
