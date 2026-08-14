import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflow = await readFile(new URL("../.github/workflows/cloudflare-deploy.yml", import.meta.url), "utf8");
const generator = await readFile(new URL("../scripts/write-cloudflare-production-config.mjs", import.meta.url), "utf8");

test("Cloudflare production deployment stays manual and secret-driven", () => {
  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /secrets\.CLOUDFLARE_API_TOKEN/);
  assert.match(workflow, /secrets\.CLOUDFLARE_ACCOUNT_ID/);
  assert.match(workflow, /secrets\.ADMIN_API_TOKEN/);
  assert.doesNotMatch(workflow, /[a-f0-9]{32,64}/i);
});

test("generated Worker config binds D1, R2, assets, images and OIDC", () => {
  assert.match(generator, /binding: "DB"/);
  assert.match(generator, /binding: "MEDIA"/);
  assert.match(generator, /binding: "ASSETS"/);
  assert.match(generator, /binding: "IMAGES"/);
  assert.match(generator, /OIDC_ISSUER/);
  assert.match(generator, /OIDC_AUDIENCE/);
  assert.match(generator, /OIDC_JWKS_URL/);
  assert.match(generator, /USER_ALLOWED_ORIGIN/);
  assert.match(generator, /ADMIN_ALLOWED_ORIGIN/);
});

test("deployment applies migrations before deploying the Worker", () => {
  const migrations = workflow.indexOf("wrangler d1 migrations apply DB --remote");
  const deploy = workflow.indexOf("wrangler deploy");
  assert.ok(migrations > -1);
  assert.ok(deploy > migrations);
});
