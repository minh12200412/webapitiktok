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

type DirectPostDebug = {
  mode: "DIRECT_POST";
  requestedPrivacyLevel: TikTokPrivacyLevel | null;
  selectedPrivacyLevel: TikTokPrivacyLevel | null;
  creatorPrivacyOptions: TikTokPrivacyLevel[] | null;
  wasPrivacyForced: boolean;
  allowPublicSandbox: boolean;
  videoUrlPrefix: string;
  hasVideoPublishScope: boolean;
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

  let directPostDebug: DirectPostDebug | undefined;

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
    const allowPublicSandbox = isPublicDirectPostSandboxAllowed();
    const privacySelection = selectPrivacyLevel(
      post.privacyLevel,
      creatorInfo.privacyLevelOptions,
      allowPublicSandbox,
    );
    directPostDebug = {
      mode: "DIRECT_POST",
      requestedPrivacyLevel: post.privacyLevel || null,
      selectedPrivacyLevel: privacySelection.privacyLevel || null,
      creatorPrivacyOptions: creatorInfo.privacyLevelOptions || null,
      wasPrivacyForced: privacySelection.wasPrivacyForced,
      allowPublicSandbox,
      videoUrlPrefix: getVideoUrlPrefix(videoUrl),
      hasVideoPublishScope: hasScope(token.scope, "video.publish"),
    };

    console.info("TikTok creator_info/query safe debug", {
      accountId,
      departmentId,
      creatorInfo: creatorInfo.raw,
      privacyLevelOptions: creatorInfo.privacyLevelOptions,
      selectedPrivacyLevel: directPostDebug.selectedPrivacyLevel,
      wasPrivacyForced: directPostDebug.wasPrivacyForced,
      allowPublicSandbox: directPostDebug.allowPublicSandbox,
      hasVideoPublishScope: directPostDebug.hasVideoPublishScope,
    });

    if (!privacySelection.ok) {
      return Response.json(
        {
          ok: false,
          errorCode: "PRIVACY_LEVEL_NOT_ALLOWED",
          message:
            "Creator privacy_level_options do not allow requested privacy level or SELF_ONLY fallback.",
          privacy_level_options: creatorInfo.privacyLevelOptions || [],
          safeDebug: directPostDebug,
        },
        { status: 400 },
      );
    }

    const title = buildPostTitle(post.caption, post.hashtags);
    const result = await initVideoDirectPost(token.accessToken, {
      post_info: {
        title,
        disable_comment: post.disableComment === true,
        disable_duet: post.disableDuet === true,
        disable_stitch: post.disableStitch === true,
        privacy_level: privacySelection.privacyLevel,
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
      safeDebug: directPostDebug,
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
          safeDebug:
            post.postMode === "DIRECT_POST"
              ? directPostDebug || {
                  mode: "DIRECT_POST",
                  requestedPrivacyLevel: post.privacyLevel || null,
                  selectedPrivacyLevel: null,
                  creatorPrivacyOptions: null,
                  wasPrivacyForced: false,
                  allowPublicSandbox: isPublicDirectPostSandboxAllowed(),
                  videoUrlPrefix: getVideoUrlPrefix(videoUrl),
                  hasVideoPublishScope: hasScope(token.scope, "video.publish"),
                }
              : undefined,
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

  if (isStorageDirectUrl(asset.url)) {
    return {
      ok: false,
      status: 400,
      errorCode: "MEDIA_URL_NOT_VERIFIED_DOMAIN",
      message:
        "Do not send direct Vercel Blob/Supabase URLs to TikTok. Use the verified /api/media/file URL.",
    };
  }

  if (!isVerifiedMediaUrl(asset.url)) {
    return {
      ok: false,
      status: 400,
      errorCode: "MEDIA_URL_NOT_VERIFIED_DOMAIN",
      message:
        "Video URL must be under the verified webapitiktok.vercel.app domain.",
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
  allowPublicSandbox: boolean,
):
  | {
      ok: true;
      privacyLevel: TikTokPrivacyLevel;
      wasPrivacyForced: boolean;
    }
  | {
      ok: false;
      privacyLevel?: TikTokPrivacyLevel;
      wasPrivacyForced: boolean;
    } {
  const sandboxPrivacyLevel: TikTokPrivacyLevel = "SELF_ONLY";

  if (!options || options.length === 0) {
    return {
      ok: true,
      privacyLevel: sandboxPrivacyLevel,
      wasPrivacyForced: requestedPrivacyLevel !== sandboxPrivacyLevel,
    };
  }

  if (
    allowPublicSandbox &&
    requestedPrivacyLevel &&
    options.includes(requestedPrivacyLevel)
  ) {
    return {
      ok: true,
      privacyLevel: requestedPrivacyLevel,
      wasPrivacyForced: false,
    };
  }

  if (options.includes(sandboxPrivacyLevel)) {
    return {
      ok: true,
      privacyLevel: sandboxPrivacyLevel,
      wasPrivacyForced: requestedPrivacyLevel !== sandboxPrivacyLevel,
    };
  }

  if (requestedPrivacyLevel && options.includes(requestedPrivacyLevel)) {
    return {
      ok: false,
      privacyLevel: requestedPrivacyLevel,
      wasPrivacyForced: false,
    };
  }

  return { ok: false, wasPrivacyForced: false };
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

function isVerifiedMediaUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const verifiedOrigin =
      process.env.APP_BASE_URL?.replace(/\/+$/, "") ||
      "https://webapitiktok.vercel.app";

    return (
      url.origin === verifiedOrigin &&
      url.pathname.startsWith("/api/media/file/")
    );
  } catch {
    return false;
  }
}

function isStorageDirectUrl(value: string): boolean {
  try {
    const hostname = new URL(value).hostname;

    return (
      hostname.endsWith(".vercel-storage.com") ||
      hostname.includes("supabase.co")
    );
  } catch {
    return false;
  }
}

function hasScope(scope: string, targetScope: string): boolean {
  return scope
    .split(",")
    .map((value) => value.trim())
    .includes(targetScope);
}

function getVideoUrlPrefix(value: string): string {
  try {
    const url = new URL(value);
    const pathParts = url.pathname.split("/").filter(Boolean).slice(0, 3);
    return `${url.origin}/${pathParts.join("/")}`;
  } catch {
    return "[invalid-url]";
  }
}

function isPublicDirectPostSandboxAllowed(): boolean {
  return process.env.TIKTOK_ALLOW_PUBLIC_DIRECT_POST_IN_SANDBOX === "true";
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
