import { writeFile } from "node:fs/promises";

const required = [
  "CF_D1_DATABASE_ID",
  "CF_R2_BUCKET_NAME",
  "OIDC_ISSUER",
  "OIDC_AUDIENCE",
  "OIDC_JWKS_URL",
  "USER_ALLOWED_ORIGIN",
  "ADMIN_ALLOWED_ORIGIN",
];

const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(`Missing Cloudflare deployment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const databaseName = process.env.CF_D1_DATABASE_NAME?.trim() || "ozon671games";
const workerName = process.env.CF_WORKER_NAME?.trim() || "ozon671games-api";

const config = {
  $schema: "./node_modules/wrangler/config-schema.json",
  name: workerName,
  main: "./worker/entry.ts",
  compatibility_date: "2026-08-14",
  compatibility_flags: ["nodejs_compat"],
  observability: { enabled: true },
  assets: {
    binding: "ASSETS",
    run_worker_first: ["/api/*", "/_vinext/*"],
  },
  images: { binding: "IMAGES" },
  d1_databases: [
    {
      binding: "DB",
      database_name: databaseName,
      database_id: process.env.CF_D1_DATABASE_ID.trim(),
    },
  ],
  r2_buckets: [
    {
      binding: "MEDIA",
      bucket_name: process.env.CF_R2_BUCKET_NAME.trim(),
    },
  ],
  vars: {
    OIDC_ISSUER: process.env.OIDC_ISSUER.trim(),
    OIDC_AUDIENCE: process.env.OIDC_AUDIENCE.trim(),
    OIDC_JWKS_URL: process.env.OIDC_JWKS_URL.trim(),
    USER_ALLOWED_ORIGIN: process.env.USER_ALLOWED_ORIGIN.trim(),
    ADMIN_ALLOWED_ORIGIN: process.env.ADMIN_ALLOWED_ORIGIN.trim(),
  },
};

await writeFile("wrangler.production.json", `${JSON.stringify(config, null, 2)}\n`, "utf8");
console.log(`Prepared wrangler.production.json for ${workerName}.`);
