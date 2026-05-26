import { mockTikTokProfile } from "@/lib/tiktok/mockData";

export async function GET() {
  return Response.json({
    ok: true,
    scopesUsed: ["user.info.profile", "user.info.stats"],
    profile: mockTikTokProfile,
  });
}
