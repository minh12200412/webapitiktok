import { mockExecutiveSummary } from "@/lib/tiktok/mockData";

export async function GET() {
  return Response.json({
    ok: true,
    reportType: "executive_summary",
    generatedFor: "authorized teams and executives",
    scopesUsed: ["user.info.profile", "user.info.stats", "video.list"],
    summary: mockExecutiveSummary,
  });
}
