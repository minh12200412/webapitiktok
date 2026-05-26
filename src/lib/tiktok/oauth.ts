import { redactSecret } from "@/lib/security/redact";

export type TikTokOAuthState = {
  departmentId: string;
  accountId: string;
  nonce: string;
  timestamp: number;
};

export type BuildTikTokOAuthUrlInput = {
  clientKey: string;
  redirectUri: string;
  scopes?: string;
  state: string;
};

export function buildTikTokOAuthUrl({
  clientKey,
  redirectUri,
  scopes = "user.info.basic,user.info.profile,user.info.stats,video.upload,video.publish,video.list",
  state,
}: BuildTikTokOAuthUrlInput): string {
  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");

  url.searchParams.set("client_key", clientKey);
  url.searchParams.set("scope", scopes);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);

  return url.toString();
}

export function encodeState(state: TikTokOAuthState): string {
  return Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
}

export function decodeState(value: string): TikTokOAuthState {
  const decoded = Buffer.from(value, "base64url").toString("utf8");
  const parsed = JSON.parse(decoded) as Partial<TikTokOAuthState>;

  if (
    typeof parsed.departmentId !== "string" ||
    typeof parsed.accountId !== "string" ||
    typeof parsed.nonce !== "string" ||
    typeof parsed.timestamp !== "number"
  ) {
    throw new Error("Invalid TikTok OAuth state");
  }

  return parsed as TikTokOAuthState;
}

export function maskOpenId(openId: string): string {
  const parts = openId.split("_");
  const suffix = parts.at(-1) || "account";

  return `open_****_${suffix}`;
}

export type TikTokTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  open_id?: string;
  scope?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  token_type?: string;
};

export async function exchangeTikTokCodeForToken({
  code,
  clientKey,
  clientSecret,
  redirectUri,
}: {
  code: string;
  clientKey: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<TikTokTokenResponse> {
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`TikTok token exchange failed: ${response.status}`);
  }

  const tokenResponse = (await response.json()) as TikTokTokenResponse;

  return {
    ...tokenResponse,
    access_token: tokenResponse.access_token
      ? redactSecret(tokenResponse.access_token)
      : undefined,
    refresh_token: tokenResponse.refresh_token
      ? redactSecret(tokenResponse.refresh_token)
      : undefined,
  };
}
