import { getTokenStore } from "@/lib/tiktok/tokenStore";

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

  if (!isRecord(body)) {
    return Response.json(
      {
        ok: false,
        errorCode: "INVALID_PAYLOAD",
      },
      { status: 400 },
    );
  }

  if (typeof body.accountId === "string") {
    await getTokenStore().deleteToken(body.accountId);
  }

  return Response.json({
    ok: true,
    status: "DISCONNECTED",
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
