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

  if (!isRecord(body) || typeof body.scheduleId !== "string") {
    return Response.json(
      {
        ok: false,
        errorCode: "SCHEDULE_ID_REQUIRED",
      },
      { status: 400 },
    );
  }

  return Response.json({
    ok: true,
    scheduleId: body.scheduleId,
    publishId: `mock_publish_from_schedule_${Date.now()}`,
    status: "PUBLISH_COMPLETE",
    mode: "DIRECT_POST",
    scopeUsed: "video.publish",
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
