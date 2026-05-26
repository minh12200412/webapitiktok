import { publishMock, type MockPublishPayload } from "@/lib/tiktok/mockPublisher";

type ValidationResult =
  | { ok: true; payload: MockPublishPayload }
  | { ok: false; status: number; errorCode: string; message?: string };

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        ok: false,
        errorCode: "INVALID_JSON",
      },
      { status: 400 },
    );
  }

  const validation = validatePublishPayload(body);
  if (!validation.ok) {
    return Response.json(
      {
        ok: false,
        errorCode: validation.errorCode,
        message: validation.message,
      },
      { status: validation.status },
    );
  }

  return Response.json(publishMock(validation.payload));
}

function validatePublishPayload(body: unknown): ValidationResult {
  if (!isRecord(body)) {
    return {
      ok: false,
      status: 400,
      errorCode: "INVALID_PAYLOAD",
    };
  }

  const { departmentId, accountId, approval, post } = body;

  if (
    typeof departmentId !== "string" ||
    departmentId.trim().length === 0 ||
    typeof accountId !== "string" ||
    accountId.trim().length === 0
  ) {
    return {
      ok: false,
      status: 400,
      errorCode: "MISSING_ACCOUNT",
    };
  }

  if (!isRecord(approval) || approval.status !== "approved") {
    return {
      ok: false,
      status: 400,
      errorCode: "APPROVAL_REQUIRED",
    };
  }

  if (!isRecord(post)) {
    return {
      ok: false,
      status: 400,
      errorCode: "INVALID_POST",
    };
  }

  if (post.mediaType !== "VIDEO" && post.mediaType !== "PHOTO") {
    return {
      ok: false,
      status: 400,
      errorCode: "INVALID_MEDIA_TYPE",
    };
  }

  if (post.postMode !== "MEDIA_UPLOAD") {
    if (post.postMode !== "DIRECT_POST") {
      return {
        ok: false,
        status: 400,
        errorCode: "UNSUPPORTED_POST_MODE",
      };
    }
  }

  if (post.postMode === "DIRECT_POST" && post.userConsent !== true) {
    return {
      ok: false,
      status: 400,
      errorCode: "USER_CONSENT_REQUIRED",
    };
  }

  const scheduleMode = post.scheduleMode === "later" ? "later" : "now";

  if (scheduleMode === "later") {
    if (typeof post.scheduledAt !== "string" || post.scheduledAt.length === 0) {
      return {
        ok: false,
        status: 400,
        errorCode: "SCHEDULED_AT_REQUIRED",
      };
    }

    const scheduledTime = new Date(post.scheduledAt).getTime();

    if (Number.isNaN(scheduledTime) || scheduledTime <= Date.now()) {
      return {
        ok: false,
        status: 400,
        errorCode: "SCHEDULED_AT_MUST_BE_FUTURE",
      };
    }
  }

  if (!isPrivacyLevel(post.privacyLevel)) {
    return {
      ok: false,
      status: 400,
      errorCode: "INVALID_PRIVACY_LEVEL",
    };
  }

  return {
    ok: true,
    payload: {
      departmentId: departmentId.trim(),
      accountId: accountId.trim(),
      approval: {
        status: approval.status,
        approvedBy:
          typeof approval.approvedBy === "string"
            ? approval.approvedBy
            : undefined,
      },
      post: {
        mediaType: post.mediaType,
        postMode: post.postMode,
        title: typeof post.title === "string" ? post.title : undefined,
        caption: typeof post.caption === "string" ? post.caption : undefined,
        hashtags: typeof post.hashtags === "string" ? post.hashtags : undefined,
        privacyLevel: post.privacyLevel,
        disableComment: post.disableComment === true,
        disableDuet: post.disableDuet === true,
        disableStitch: post.disableStitch === true,
        isAigc: post.isAigc === true,
        userConsent: post.userConsent === true,
        scheduleMode,
        scheduledAt:
          typeof post.scheduledAt === "string" ? post.scheduledAt : undefined,
      },
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPrivacyLevel(
  value: unknown,
): value is NonNullable<MockPublishPayload["post"]["privacyLevel"]> {
  return (
    value === "SELF_ONLY" ||
    value === "PUBLIC_TO_EVERYONE" ||
    value === "MUTUAL_FOLLOW_FRIENDS" ||
    value === "FOLLOWER_OF_CREATOR"
  );
}
