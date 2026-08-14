import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflow = await readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");

test("regular CI dry-runs the generated Cloudflare deployment bundle without production secrets", () => {
  assert.match(workflow, /cloudflare-config-smoke:/);
  assert.match(workflow, /CF_D1_DATABASE_ID: 00000000-0000-0000-0000-000000000000/);
  assert.match(workflow, /CF_R2_BUCKET_NAME: ozon671games-ci/);
  assert.match(workflow, /OIDC_ISSUER: https:\/\/oidc\.example\.com/);
  assert.match(workflow, /node scripts\/validate-cloudflare-production-env\.mjs/);
  assert.match(workflow, /node scripts\/write-cloudflare-production-config\.mjs/);
  assert.match(workflow, /CLOUDFLARE_VITE_WRANGLER_CONFIG_PATH: wrangler\.production\.json/);
  assert.match(workflow, /wrangler deploy --dry-run --outdir \.wrangler\/ci-dry-run/);
  assert.doesNotMatch(workflow, /cloudflare-config-smoke:[\s\S]*?secrets\./);
});
