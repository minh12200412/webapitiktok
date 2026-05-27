import {
  initVideoDirectPost,
  initVideoMediaUpload,
  queryCreatorInfo,
  type TikTokPrivacyLevel,
  TikTokContentPostingError,
} from "@/lib/tiktok/contentPostingClient";
import { getTokenStore } from "@/lib/tiktok/tokenStore";

export const dynamic = "force-dynamic";

type LivePublishPayload = {
  departmentId?: string;
  accountId?: string;
  approval?: {
    status?: string;
    approvedBy?: string;
  };
  post?: {
    mediaType?: string;
    postMode?: string;
    title?: string;
    caption?: string;
    hashtags?: string[] | string;
    privacyLevel?: TikTokPrivacyLevel;
    disableComment?: boolean;
    disableDuet?: boolean;
    disableStitch?: boolean;
    isAigc?: boolean;
  };
  assets?: Array<{
    type?: string;
    sourceType?: string;
    url?: string;
  }>;
};

type ValidatedPost = NonNullable<LivePublishPayload["post"]> & {
  mediaType: "VIDEO";
  postMode: "MEDIA_UPLOAD" | "DIRECT_POST";
};

type ValidationResult =
  | {
      ok: true;
      payload: {
        departmentId: string;
        accountId: string;
        post: ValidatedPost;
        videoUrl: string;
      };
    }
  | {
      ok: false;
      status: number;
      errorCode: string;
      message: string;
    };

export async function GET() {
  return Response.json({
    ok: true,
    message: "Use POST to publish live TikTok content",
    method: "POST",
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be JSON.");
  }

  const validation = validateLivePublishPayload(body);

  if (!validation.ok) {
    return errorResponse(
      validation.status,
      validation.errorCode,
      validation.message,
    );
  }

  const { departmentId, accountId, post, videoUrl } = validation.payload;
  const token = await getTokenStore().getTokenData(accountId);

  if (!token) {
    return errorResponse(
      404,
      "TOKEN_NOT_FOUND",
      "No OAuth token found for this accountId. Connect TikTok first.",
    );
  }

  try {
    if (post.postMode === "MEDIA_UPLOAD") {
      const result = await initVideoMediaUpload(token.accessToken, {
        source_info: {
          source: "PULL_FROM_URL",
          video_url: videoUrl,
        },
      });

      return Response.json({
        ok: true,
        mode: "MEDIA_UPLOAD",
        scopeUsed: "video.upload",
        publishId: result.publishId,
        status: "PROCESSING_OR_SEND_TO_INBOX",
        raw: result.raw,
      });
    }

    const creatorInfo = await queryCreatorInfo(token.accessToken);
    const privacyLevel = selectPrivacyLevel(
      post.privacyLevel,
      creatorInfo.privacyLevelOptions,
    );
    const title = buildPostTitle(post.caption, post.hashtags);
    const result = await initVideoDirectPost(token.accessToken, {
      post_info: {
        title,
        privacy_level: privacyLevel,
        disable_duet: post.disableDuet === true,
        disable_comment: post.disableComment === true,
        disable_stitch: post.disableStitch === true,
        is_aigc: post.isAigc === true,
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: videoUrl,
      },
    });

    return Response.json({
      ok: true,
      mode: "DIRECT_POST",
      scopeUsed: "video.publish",
      publishId: result.publishId,
      status: "PROCESSING_OR_PUBLISH_COMPLETE",
      raw: result.raw,
    });
  } catch (error) {
    if (error instanceof TikTokContentPostingError) {
      return Response.json(
        {
          ok: false,
          errorCode: "TIKTOK_API_ERROR",
          message: "TikTok Content Posting API request failed.",
          raw: error.raw,
        },
        { status: error.status >= 400 ? error.status : 502 },
      );
    }

    return errorResponse(
      500,
      "LIVE_PUBLISH_FAILED",
      `Live publish failed for ${departmentId}/${accountId}.`,
    );
  }
}

function validateLivePublishPayload(body: unknown): ValidationResult {
  if (!isRecord(body)) {
    return {
      ok: false,
      status: 400,
      errorCode: "INVALID_PAYLOAD",
      message: "Payload must be an object.",
    };
  }

  const payload = body as LivePublishPayload;

  if (!payload.accountId || typeof payload.accountId !== "string") {
    return {
      ok: false,
      status: 400,
      errorCode: "ACCOUNT_ID_REQUIRED",
      message: "accountId is required.",
    };
  }

  if (!payload.departmentId || typeof payload.departmentId !== "string") {
    return {
      ok: false,
      status: 400,
      errorCode: "DEPARTMENT_ID_REQUIRED",
      message: "departmentId is required.",
    };
  }

  if (payload.approval?.status !== "approved") {
    return {
      ok: false,
      status: 400,
      errorCode: "APPROVAL_REQUIRED",
      message: "approval.status must be approved.",
    };
  }

  if (payload.post?.mediaType !== "VIDEO") {
    return {
      ok: false,
      status: 400,
      errorCode: "UNSUPPORTED_MEDIA_TYPE",
      message: "Only VIDEO mediaType is supported in this phase.",
    };
  }

  if (
    payload.post.postMode !== "MEDIA_UPLOAD" &&
    payload.post.postMode !== "DIRECT_POST"
  ) {
    return {
      ok: false,
      status: 400,
      errorCode: "UNSUPPORTED_POST_MODE",
      message: "postMode must be MEDIA_UPLOAD or DIRECT_POST.",
    };
  }

  const asset = payload.assets?.[0];

  if (!asset || asset.type !== "video" || asset.sourceType !== "url") {
    return {
      ok: false,
      status: 400,
      errorCode: "UNSUPPORTED_ASSET_SOURCE",
      message: "assets[0] must be a video with sourceType url.",
    };
  }

  if (!asset.url || !isHttpsUrl(asset.url)) {
    return {
      ok: false,
      status: 400,
      errorCode: "INVALID_VIDEO_URL",
      message: "Video URL must be a public HTTPS URL.",
    };
  }

  return {
    ok: true,
    payload: {
      departmentId: payload.departmentId,
      accountId: payload.accountId,
      post: {
        ...payload.post,
        mediaType: "VIDEO",
        postMode: payload.post.postMode,
      },
      videoUrl: asset.url,
    },
  };
}

function selectPrivacyLevel(
  requestedPrivacyLevel: TikTokPrivacyLevel | undefined,
  options: TikTokPrivacyLevel[] | undefined,
): TikTokPrivacyLevel {
  const sandboxPrivacyLevel: TikTokPrivacyLevel = "SELF_ONLY";

  if (!options || options.length === 0) {
    return sandboxPrivacyLevel;
  }

  if (options.includes(sandboxPrivacyLevel)) {
    return sandboxPrivacyLevel;
  }

  return requestedPrivacyLevel && options.includes(requestedPrivacyLevel)
    ? requestedPrivacyLevel
    : options[0];
}

function buildPostTitle(
  caption: string | undefined,
  hashtags: string[] | string | undefined,
): string {
  const hashtagText = Array.isArray(hashtags)
    ? hashtags.join(" ")
    : hashtags || "";

  return [caption, hashtagText].filter(Boolean).join(" ").trim();
}

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function errorResponse(status: number, errorCode: string, message: string) {
  return Response.json(
    {
      ok: false,
      errorCode,
      message,
    },
    { status },
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
