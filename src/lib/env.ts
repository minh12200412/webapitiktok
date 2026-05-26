export type ServerEnv = {
  APP_BASE_URL: string;
  TIKTOK_CLIENT_KEY: string;
  TIKTOK_CLIENT_SECRET: string;
  TIKTOK_REDIRECT_URI: string;
  TIKTOK_SCOPES: string;
  TIKTOK_LIVE_OAUTH: boolean;
  TOKEN_ENCRYPTION_KEY: string;
};

const DEFAULT_APP_BASE_URL = "http://localhost:3008";
const DEFAULT_TIKTOK_SCOPES = "user.info.basic,video.upload,video.publish";

export function getServerEnv(): ServerEnv {
  return {
    APP_BASE_URL: normalizeBaseUrl(
      process.env.APP_BASE_URL ?? DEFAULT_APP_BASE_URL,
    ),
    TIKTOK_CLIENT_KEY: process.env.TIKTOK_CLIENT_KEY ?? "",
    TIKTOK_CLIENT_SECRET: process.env.TIKTOK_CLIENT_SECRET ?? "",
    TIKTOK_REDIRECT_URI: process.env.TIKTOK_REDIRECT_URI ?? "",
    TIKTOK_SCOPES: process.env.TIKTOK_SCOPES ?? DEFAULT_TIKTOK_SCOPES,
    TIKTOK_LIVE_OAUTH: process.env.TIKTOK_LIVE_OAUTH === "true",
    TOKEN_ENCRYPTION_KEY: process.env.TOKEN_ENCRYPTION_KEY ?? "",
  };
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}
