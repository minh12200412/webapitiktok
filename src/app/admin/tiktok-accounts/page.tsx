import { Suspense } from "react";
import { AdminAccountsTable } from "@/components/AdminAccountsTable";
import { PageShell } from "@/components/PageShell";

export default function TikTokAccountsAdminPage() {
  return (
    <PageShell>
      <Suspense
        fallback={
          <main className="mx-auto max-w-6xl px-5 py-12">
            Loading TikTok accounts...
          </main>
        }
      >
        <AdminAccountsTable />
      </Suspense>
    </PageShell>
  );
}
