const requiredSecrets = ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "ADMIN_API_TOKEN"];
const requiredVars = [
  "CF_D1_DATABASE_ID",
  "CF_R2_BUCKET_NAME",
  "CF_WORKER_NAME",
  "CF_API_BASE_URL",
  "OIDC_ISSUER",
  "OIDC_AUDIENCE",
  "OIDC_JWKS_URL",
  "USER_ALLOWED_ORIGIN",
  "ADMIN_ALLOWED_ORIGIN",
];

const missing = [...requiredSecrets, ...requiredVars].filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(`Missing Cloudflare production settings: ${missing.join(", ")}`);
  process.exit(1);
}

function requireHttps(name) {
  const value = process.env[name].trim();
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    console.error(`${name} must be a valid URL.`);
    process.exit(1);
  }
  if (parsed.protocol !== "https:") {
    console.error(`${name} must use https.`);
    process.exit(1);
  }
  if (parsed.username || parsed.password || parsed.hash) {
    console.error(`${name} must not contain credentials or a fragment.`);
    process.exit(1);
  }
  return parsed;
}

const apiBase = requireHttps("CF_API_BASE_URL");
const issuer = requireHttps("OIDC_ISSUER");
const jwks = requireHttps("OIDC_JWKS_URL");
const userOrigin = requireHttps("USER_ALLOWED_ORIGIN");
const adminOrigin = requireHttps("ADMIN_ALLOWED_ORIGIN");

for (const [name, url] of [["CF_API_BASE_URL", apiBase], ["USER_ALLOWED_ORIGIN", userOrigin], ["ADMIN_ALLOWED_ORIGIN", adminOrigin]]) {
  if (url.pathname !== "/" || url.search) {
    console.error(`${name} must be an origin/base URL without a path or query string.`);
    process.exit(1);
  }
}

if (!jwks.pathname || jwks.pathname === "/") {
  console.error("OIDC_JWKS_URL must point to a JWKS endpoint path.");
  process.exit(1);
}

if (!issuer.origin || !process.env.OIDC_AUDIENCE.trim()) {
  console.error("OIDC issuer/audience configuration is incomplete.");
  process.exit(1);
}

if (!/^[a-z0-9][a-z0-9-]{1,62}$/i.test(process.env.CF_WORKER_NAME.trim())) {
  console.error("CF_WORKER_NAME contains unsupported characters.");
  process.exit(1);
}

console.log("Cloudflare production environment contract is complete and syntactically valid.");
