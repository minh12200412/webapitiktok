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
    return {
      ok: false,
      status: 400,
      errorCode: "UNSUPPORTED_POST_MODE",
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
      },
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
