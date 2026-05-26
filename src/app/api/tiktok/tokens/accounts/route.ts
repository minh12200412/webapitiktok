import { getTokenStore } from "@/lib/tiktok/tokenStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = getTokenStore();
  const [accounts, status] = await Promise.all([
    store.listAccounts(),
    Promise.resolve(store.getStatus()),
  ]);

  return Response.json({
    ok: true,
    tokenStore: status,
    accounts,
  });
}
