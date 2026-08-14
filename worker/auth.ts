export type OidcConfig = {
  issuer?: string;
  audience?: string;
  jwksUrl?: string;
};

export type AuthenticatedIdentity = {
  subject: string;
  issuer: string;
  email?: string;
  name?: string;
};

type JwtHeader = { alg?: string; kid?: string; typ?: string };
type JwtPayload = {
  sub?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  email?: string;
  name?: string;
  preferred_username?: string;
};

type JsonWebKeySet = { keys?: JsonWebKey[] };

type CachedJwks = { expiresAt: number; value: JsonWebKeySet };
const jwksCache = new Map<string, CachedJwks>();
const JWKS_TTL_MS = 5 * 60 * 1000;

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function decodeJson<T>(value: string): T | null {
  try {
    return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;
  } catch {
    return null;
  }
}

async function getJwks(url: string): Promise<JsonWebKeySet> {
  const now = Date.now();
  const cached = jwksCache.get(url);
  if (cached && cached.expiresAt > now) return cached.value;

  const response = await fetch(url, {
    headers: { accept: "application/json" },
    cf: { cacheTtl: 300, cacheEverything: true },
  } as RequestInit);
  if (!response.ok) throw new Error("jwks_unavailable");
  const value = await response.json() as JsonWebKeySet;
  if (!Array.isArray(value.keys)) throw new Error("jwks_invalid");
  jwksCache.set(url, { value, expiresAt: now + JWKS_TTL_MS });
  return value;
}

function audienceMatches(aud: JwtPayload["aud"], expected: string) {
  return typeof aud === "string" ? aud === expected : Array.isArray(aud) && aud.includes(expected);
}

async function verifyRs256(signingInput: string, signature: Uint8Array, key: JsonWebKey) {
  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    key,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    signature as BufferSource,
    new TextEncoder().encode(signingInput),
  );
}

export function oidcConfigured(config: OidcConfig) {
  return Boolean(config.issuer && config.audience && config.jwksUrl);
}

export async function verifyOidcBearer(request: Request, config: OidcConfig): Promise<AuthenticatedIdentity | null> {
  if (!config.issuer || !config.audience || !config.jwksUrl) return null;

  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return null;
  const token = authorization.slice(7).trim();
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const header = decodeJson<JwtHeader>(parts[0]);
  const payload = decodeJson<JwtPayload>(parts[1]);
  if (!header || !payload || header.alg !== "RS256" || !header.kid) return null;

  const now = Math.floor(Date.now() / 1000);
  if (!payload.sub || payload.iss !== config.issuer) return null;
  if (!audienceMatches(payload.aud, config.audience)) return null;
  if (typeof payload.exp !== "number" || payload.exp <= now) return null;
  if (typeof payload.nbf === "number" && payload.nbf > now + 60) return null;

  let jwks: JsonWebKeySet;
  try {
    jwks = await getJwks(config.jwksUrl);
  } catch {
    return null;
  }
  const key = jwks.keys?.find((candidate) => candidate.kid === header.kid && (!candidate.alg || candidate.alg === "RS256") && (!candidate.use || candidate.use === "sig"));
  if (!key) return null;

  let verified = false;
  try {
    verified = await verifyRs256(`${parts[0]}.${parts[1]}`, decodeBase64Url(parts[2]), key);
  } catch {
    return null;
  }
  if (!verified) return null;

  return {
    subject: payload.sub,
    issuer: payload.iss,
    email: typeof payload.email === "string" ? payload.email : undefined,
    name: typeof payload.name === "string" ? payload.name : typeof payload.preferred_username === "string" ? payload.preferred_username : undefined,
  };
}

export async function stableUserId(identity: AuthenticatedIdentity) {
  const input = new TextEncoder().encode(`${identity.issuer}\u0000${identity.subject}`);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", input));
  return `oidc_${Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}
