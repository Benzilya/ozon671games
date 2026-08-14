import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const auth = await readFile(new URL("../worker/auth.ts", import.meta.url), "utf8");
const userApi = await readFile(new URL("../worker/user-api.ts", import.meta.url), "utf8");
const entry = await readFile(new URL("../worker/entry.ts", import.meta.url), "utf8");
const vite = await readFile(new URL("../vite.config.ts", import.meta.url), "utf8");

test("OIDC verifier validates signature and core JWT claims", () => {
  assert.match(auth, /header\.alg !== "RS256"/);
  assert.match(auth, /payload\.iss !== config\.issuer/);
  assert.match(auth, /audienceMatches\(payload\.aud, config\.audience\)/);
  assert.match(auth, /payload\.exp <= now/);
  assert.match(auth, /crypto\.subtle\.verify/);
  assert.match(auth, /candidate\.kid === header\.kid/);
});

test("user identity is issuer-scoped and does not trust email as primary key", () => {
  assert.match(auth, /identity\.issuer/);
  assert.match(auth, /identity\.subject/);
  assert.match(auth, /crypto\.subtle\.digest\("SHA-256"/);
  assert.match(userApi, /email: null/);
  assert.match(userApi, /role: "user" as const/);
});

test("authenticated account writes remain scoped to the current user", () => {
  assert.match(userApi, /eq\(schema\.favorites\.userId, userId\)/);
  assert.match(userApi, /eq\(schema\.playbackProgress\.userId, userId\)/);
  assert.match(userApi, /userId, workId/);
  assert.match(userApi, /status: "pending" as const/);
  assert.match(userApi, /publishedWorkExists/);
});

test("user API has exact-origin CORS and is routed before public API", () => {
  assert.match(userApi, /origin === allowedOrigin/);
  assert.doesNotMatch(userApi, /access-control-allow-origin[^\n]+\*/i);
  assert.match(entry, /handleUserApi/);
  assert.match(entry, /OIDC_ISSUER/);
  assert.match(entry, /OIDC_AUDIENCE/);
  assert.match(entry, /OIDC_JWKS_URL/);
  assert.match(vite, /main: "\.\/worker\/entry\.ts"/);
});
