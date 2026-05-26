export async function GET() {
  return Response.json({
    ok: true,
    app: "tanphat-tiktok-publisher-web",
    mode: "mock",
  });
}
