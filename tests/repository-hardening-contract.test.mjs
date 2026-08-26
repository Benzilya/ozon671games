import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const contract = JSON.parse(await readFile(new URL("../docs/repository-hardening.json", import.meta.url), "utf8"));
const browserWorkflow = await readFile(new URL("../.github/workflows/browser-quality.yml", import.meta.url), "utf8");
const validateWorkflow = await readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
const productWorkflow = await readFile(new URL("../.github/workflows/product-tests.yml", import.meta.url), "utf8");
const auditWorkflow = await readFile(new URL("../.github/workflows/dependency-audit.yml", import.meta.url), "utf8");

test("main hardening requires controlled pull-request changes", () => {
  assert.equal(contract.targetBranch, "main");
  assert.equal(contract.requirePullRequest, true);
  assert.equal(contract.requiredApprovals, 0);
  assert.equal(contract.requireConversationResolution, true);
  assert.equal(contract.requireStatusChecksToPass, true);
  assert.equal(contract.requireBranchUpToDate, true);
  assert.equal(contract.blockForcePushes, true);
  assert.equal(contract.blockDeletions, true);
  assert.equal(contract.allowDirectPushes, false);
});

test("required main checks stay aligned with real CI jobs", () => {
  assert.deepEqual(contract.requiredStatusChecks, [
    "validate",
    "cloudflare-config-smoke",
    "product-tests",
    "audit",
    "browser-quality",
  ]);

  assert.match(validateWorkflow, /\n\s{2}validate:/);
  assert.match(validateWorkflow, /\n\s{2}cloudflare-config-smoke:/);
  assert.match(productWorkflow, /\n\s{2}product-tests:/);
  assert.match(auditWorkflow, /\n\s{2}audit:/);
  assert.match(browserWorkflow, /\n\s{2}browser-quality:/);
});
