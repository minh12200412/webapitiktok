import { Suspense } from "react";
import { DemoPublisher } from "@/components/DemoPublisher";
import { PageShell } from "@/components/PageShell";

export default function TikTokPublisherDemoPage() {
  return (
    <PageShell>
      <Suspense
        fallback={
          <main className="mx-auto max-w-6xl px-5 py-12">Loading demo...</main>
        }
      >
        <DemoPublisher />
      </Suspense>
    </PageShell>
  );
}
