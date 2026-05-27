const TIKTOK_API_BASE = "https://open.tiktokapis.com";

export type TikTokPrivacyLevel =
  | "SELF_ONLY"
  | "PUBLIC_TO_EVERYONE"
  | "MUTUAL_FOLLOW_FRIENDS"
  | "FOLLOWER_OF_CREATOR";

export type TikTokApiResult = {
  raw: unknown;
  publishId?: string;
  privacyLevelOptions?: TikTokPrivacyLevel[];
};

export type TikTokVideoInitPayload = {
  post_info?: {
    title?: string;
    privacy_level?: TikTokPrivacyLevel;
    disable_duet?: boolean;
    disable_comment?: boolean;
    disable_stitch?: boolean;
    is_aigc?: boolean;
  };
  source_info: {
    source: "PULL_FROM_URL";
    video_url: string;
  };
};

export async function queryCreatorInfo(
  accessToken: string,
): Promise<TikTokApiResult> {
  const raw = await postTikTokApi(
    "/v2/post/publish/creator_info/query/",
    accessToken,
    {},
  );

  return {
    raw,
    privacyLevelOptions: extractPrivacyOptions(raw),
  };
}

export async function initVideoMediaUpload(
  accessToken: string,
  payload: TikTokVideoInitPayload,
): Promise<TikTokApiResult> {
  const raw = await postTikTokApi(
    "/v2/post/publish/inbox/video/init/",
    accessToken,
    payload,
  );

  return {
    raw,
    publishId: extractPublishId(raw),
  };
}

export async function initVideoDirectPost(
  accessToken: string,
  payload: TikTokVideoInitPayload,
): Promise<TikTokApiResult> {
  const raw = await postTikTokApi(
    "/v2/post/publish/video/init/",
    accessToken,
    payload,
  );

  return {
    raw,
    publishId: extractPublishId(raw),
  };
}

export async function fetchPublishStatus(
  accessToken: string,
  publishId: string,
): Promise<TikTokApiResult> {
  const raw = await postTikTokApi(
    "/v2/post/publish/status/fetch/",
    accessToken,
    {
      publish_id: publishId,
    },
  );

  return {
    raw,
    publishId,
  };
}

async function postTikTokApi(
  path: string,
  accessToken: string,
  payload: unknown,
): Promise<unknown> {
  const response = await fetch(`${TIKTOK_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = (await response.json()) as unknown;

  if (!response.ok || hasTikTokError(raw)) {
    throw new TikTokContentPostingError(response.status, raw);
  }

  return raw;
}

export class TikTokContentPostingError extends Error {
  constructor(
    public readonly status: number,
    public readonly raw: unknown,
  ) {
    super("tiktok_content_posting_error");
  }
}

function hasTikTokError(raw: unknown): boolean {
  if (!isRecord(raw)) {
    return false;
  }

  const error = raw.error;

  if (!isRecord(error)) {
    return false;
  }

  return typeof error.code === "string" && error.code !== "ok";
}

function extractPublishId(raw: unknown): string | undefined {
  if (!isRecord(raw) || !isRecord(raw.data)) {
    return undefined;
  }

  if (typeof raw.data.publish_id === "string") {
    return raw.data.publish_id;
  }

  if (typeof raw.data.publishId === "string") {
    return raw.data.publishId;
  }

  return undefined;
}

function extractPrivacyOptions(raw: unknown): TikTokPrivacyLevel[] | undefined {
  if (!isRecord(raw) || !isRecord(raw.data)) {
    return undefined;
  }

  const options = raw.data.privacy_level_options;

  if (!Array.isArray(options)) {
    return undefined;
  }

  return options.filter(isPrivacyLevel);
}

function isPrivacyLevel(value: unknown): value is TikTokPrivacyLevel {
  return (
    value === "SELF_ONLY" ||
    value === "PUBLIC_TO_EVERYONE" ||
    value === "MUTUAL_FOLLOW_FRIENDS" ||
    value === "FOLLOWER_OF_CREATOR"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
