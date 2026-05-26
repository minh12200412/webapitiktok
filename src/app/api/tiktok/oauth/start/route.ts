import { getServerEnv } from "@/lib/env";
import { buildTikTokOAuthUrl, encodeState } from "@/lib/tiktok/oauth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const env = getServerEnv();
  const requestUrl = new URL(request.url);
  const departmentId = requestUrl.searchParams.get("departmentId") || "";
  const accountId = requestUrl.searchParams.get("accountId") || "";

  if (!env.TIKTOK_CLIENT_KEY || !env.TIKTOK_REDIRECT_URI) {
    const redirectUrl = new URL("/tiktok-publisher-demo", request.url);
    redirectUrl.searchParams.set("mockConnected", "1");
    redirectUrl.searchParams.set("departmentId", departmentId);
    redirectUrl.searchParams.set("accountId", accountId);

    return Response.redirect(redirectUrl);
  }

  const state = encodeState({
    departmentId,
    accountId,
    nonce: crypto.randomUUID(),
    timestamp: Date.now(),
  });

  const oauthUrl = buildTikTokOAuthUrl({
    clientKey: env.TIKTOK_CLIENT_KEY,
    redirectUri: env.TIKTOK_REDIRECT_URI,
    scopes: env.TIKTOK_SCOPES,
    state,
  });

  return Response.redirect(oauthUrl);
}
