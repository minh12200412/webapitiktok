export type TikTokLiveTokenResponse = {
  access_token: string;
  refresh_token: string;
  open_id: string;
  scope: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type?: string;
};

type TikTokTokenApiResponse = Partial<TikTokLiveTokenResponse> & {
  error?: string;
  error_description?: string;
  message?: string;
};

export async function exchangeCodeForToken({
  code,
  clientKey,
  clientSecret,
  redirectUri,
}: {
  code: string;
  clientKey: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<TikTokLiveTokenResponse> {
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  return requestTikTokToken(body);
}

export async function refreshAccessToken({
  refreshToken,
  clientKey,
  clientSecret,
}: {
  refreshToken: string;
  clientKey: string;
  clientSecret: string;
}): Promise<TikTokLiveTokenResponse> {
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  return requestTikTokToken(body);
}

async function requestTikTokToken(
  body: URLSearchParams,
): Promise<TikTokLiveTokenResponse> {
  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await response.json()) as TikTokTokenApiResponse;

  if (!response.ok) {
    throw new Error(
      data.error || data.error_description || data.message || "token_error",
    );
  }

  if (
    !data.access_token ||
    !data.refresh_token ||
    !data.open_id ||
    !data.scope ||
    typeof data.expires_in !== "number" ||
    typeof data.refresh_expires_in !== "number"
  ) {
    throw new Error("invalid_token_response");
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    open_id: data.open_id,
    scope: data.scope,
    expires_in: data.expires_in,
    refresh_expires_in: data.refresh_expires_in,
    token_type: data.token_type,
  };
}
