import baseWorker from "./index";
import { handleUserApi } from "./user-api";

interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  MEDIA?: R2Bucket;
  ADMIN_API_TOKEN?: string;
  ADMIN_ALLOWED_ORIGIN?: string;
  OIDC_ISSUER?: string;
  OIDC_AUDIENCE?: string;
  OIDC_JWKS_URL?: string;
  USER_ALLOWED_ORIGIN?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

type BaseWorker = {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
};

const appWorker = baseWorker as unknown as BaseWorker;

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const userResponse = await handleUserApi(request, {
      DB: env.DB,
      issuer: env.OIDC_ISSUER,
      audience: env.OIDC_AUDIENCE,
      jwksUrl: env.OIDC_JWKS_URL,
      allowedOrigin: env.USER_ALLOWED_ORIGIN,
    }, url);
    if (userResponse) return userResponse;
    return appWorker.fetch(request, env, ctx);
  },
};

export default worker;
