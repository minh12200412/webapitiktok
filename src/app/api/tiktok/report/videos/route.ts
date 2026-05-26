import { mockTikTokVideos } from "@/lib/tiktok/mockData";

export async function GET() {
  return Response.json({
    ok: true,
    scopesUsed: ["video.list"],
    videos: mockTikTokVideos,
  });
}
