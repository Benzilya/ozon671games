import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");
const docs = await readFile(new URL("../docs/BACKEND_FOUNDATION.md", import.meta.url), "utf8");

test("admin API is isolated behind a bearer secret", () => {
  assert.match(worker, /ADMIN_API_TOKEN\?: string/);
  assert.match(worker, /authorization\.startsWith\("Bearer "\)/);
  assert.match(worker, /crypto\.subtle\.digest\("SHA-256"/);
  assert.match(worker, /admin_auth_not_configured/);
  assert.match(worker, /error: "unauthorized"/);
  assert.doesNotMatch(worker, /access-control-allow-origin[^\n]+\*[^\n]+admin/i);
});

test("admin writes start safe and enforce the rights publication gate", () => {
  assert.match(worker, /publicationStatus: "draft", rightsStatus: "unverified"/);
  assert.match(worker, /finalPublicationStatus === "published" && finalRightsStatus !== "cleared"/);
  assert.match(worker, /error: "rights_gate"/);
});

test("public API does not accept anonymous writes", () => {
  assert.match(worker, /error: "method_not_allowed"/);
  assert.match(worker, /allow: "GET, HEAD, OPTIONS"/);
});

test("backend documentation keeps admin and user auth separate", () => {
  assert.match(docs, /ADMIN_API_TOKEN/);
  assert.match(docs, /не пользовательская система входа/);
  assert.match(docs, /User auth boundary/);
  assert.match(docs, /ADMIN_ALLOWED_ORIGIN/);
});
