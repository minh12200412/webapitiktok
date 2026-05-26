import { getServerEnv } from "@/lib/env";
import { exchangeCodeForToken } from "@/lib/tiktok/liveOAuth";
import { decodeState } from "@/lib/tiktok/oauth";
import { getTokenStore } from "@/lib/tiktok/tokenStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const env = getServerEnv();
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (error) {
    const redirectUrl = new URL("/admin/tiktok-accounts", request.url);
    redirectUrl.searchParams.set("error", errorDescription || error);
    return Response.redirect(redirectUrl);
  }

  if (!code || !state) {
    const redirectUrl = new URL("/admin/tiktok-accounts", request.url);
    redirectUrl.searchParams.set("error", "missing_code_or_state");
    return Response.redirect(redirectUrl);
  }

  let decodedState;
  try {
    decodedState = decodeState(state);
  } catch {
    const redirectUrl = new URL("/admin/tiktok-accounts", request.url);
    redirectUrl.searchParams.set("error", "invalid_state");
    return Response.redirect(redirectUrl);
  }

  if (Date.now() - decodedState.timestamp > 30 * 60 * 1000) {
    const redirectUrl = new URL("/admin/tiktok-accounts", request.url);
    redirectUrl.searchParams.set("error", "expired_state");
    return Response.redirect(redirectUrl);
  }

  if (!env.TIKTOK_LIVE_OAUTH) {
    const redirectUrl = new URL("/admin/tiktok-accounts", request.url);
    redirectUrl.searchParams.set("connected", "1");
    redirectUrl.searchParams.set("departmentId", decodedState.departmentId);
    redirectUrl.searchParams.set("accountId", decodedState.accountId);
    return Response.redirect(redirectUrl);
  }

  if (
    !env.TIKTOK_CLIENT_KEY ||
    !env.TIKTOK_CLIENT_SECRET ||
    !env.TIKTOK_REDIRECT_URI
  ) {
    const redirectUrl = new URL("/admin/tiktok-accounts", request.url);
    redirectUrl.searchParams.set("error", "missing_live_oauth_env");
    return Response.redirect(redirectUrl);
  }

  try {
    const token = await exchangeCodeForToken({
      code,
      clientKey: env.TIKTOK_CLIENT_KEY,
      clientSecret: env.TIKTOK_CLIENT_SECRET,
      redirectUri: env.TIKTOK_REDIRECT_URI,
    });

    const now = Date.now();
    await getTokenStore().saveToken(decodedState.accountId, decodedState.departmentId, {
      openId: token.open_id,
      scope: token.scope,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: new Date(now + token.expires_in * 1000).toISOString(),
      refreshExpiresAt: new Date(
        now + token.refresh_expires_in * 1000,
      ).toISOString(),
    });

    const redirectUrl = new URL("/admin/tiktok-accounts", request.url);
    redirectUrl.searchParams.set("connected", "1");
    redirectUrl.searchParams.set("live", "1");
    redirectUrl.searchParams.set("departmentId", decodedState.departmentId);
    redirectUrl.searchParams.set("accountId", decodedState.accountId);
    return Response.redirect(redirectUrl);
  } catch {
    const redirectUrl = new URL("/admin/tiktok-accounts", request.url);
    redirectUrl.searchParams.set("error", "token_exchange_failed");
    return Response.redirect(redirectUrl);
  }
}
