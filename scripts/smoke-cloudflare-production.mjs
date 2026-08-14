const base = process.env.CF_API_BASE_URL?.trim().replace(/\/+$/, "");
const adminToken = process.env.ADMIN_API_TOKEN?.trim();
if (!base || !adminToken) {
  console.error("CF_API_BASE_URL and ADMIN_API_TOKEN are required for smoke checks.");
  process.exit(1);
}

async function fetchWithRetry(path, init = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await fetch(`${base}${path}`, init);
      if (response.ok) return response;
      lastError = new Error(`${path} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < 6) await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
  }
  throw lastError;
}

const publicHealthResponse = await fetchWithRetry("/api/health", { headers: { accept: "application/json" } });
const publicHealth = await publicHealthResponse.json();
if (!publicHealth?.ok || !publicHealth.databaseConfigured || !publicHealth.mediaConfigured || !publicHealth.adminAuthConfigured) {
  console.error("Public health endpoint reports incomplete production bindings.", publicHealth);
  process.exit(1);
}

const adminHealthResponse = await fetchWithRetry("/api/admin/health", {
  headers: { authorization: `Bearer ${adminToken}`, accept: "application/json" },
});
const adminHealth = await adminHealthResponse.json();
if (!adminHealth?.ok || !adminHealth.databaseConfigured || !adminHealth.mediaConfigured || !adminHealth.adminAuthConfigured) {
  console.error("Admin health endpoint reports incomplete production bindings.", adminHealth);
  process.exit(1);
}

console.log("Cloudflare production smoke check passed: Worker, D1, R2 and admin auth are online.");
