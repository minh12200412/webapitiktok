import { ButtonLink } from "@/components/ButtonLink";
import { FeatureCard } from "@/components/FeatureCard";
import { PageShell } from "@/components/PageShell";
import { StatusBadge } from "@/components/StatusBadge";

export default function Home() {
  return (
    <PageShell>
      <main>
        <section className="border-b border-[#e1e6ef] bg-[#f7f8fb]">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <StatusBadge tone="info">Demo/Sandbox Mode</StatusBadge>
              <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-normal text-[#111827] sm:text-5xl">
                TanPhatETek TikTok Publisher
              </h1>
              <p className="mt-4 text-xl font-semibold text-[#42526a]">
                Internal TikTok publishing tool for authorized departments.
              </p>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[#5f6f84]">
                This web app allows authorized departments to connect their
                TikTok accounts, publish approved marketing content, schedule
                Direct Post publishing, and generate internal TikTok performance
                reports using authorized TikTok data.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/tiktok-publisher-demo">View Demo</ButtonLink>
                <ButtonLink href="/admin/tiktok-accounts" variant="secondary">
                  Manage TikTok Accounts
                </ButtonLink>
                <ButtonLink href="/privacy" variant="ghost">
                  Privacy Policy
                </ButtonLink>
                <ButtonLink href="/terms" variant="ghost">
                  Terms of Service
                </ButtonLink>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e1e6ef] bg-white p-5 shadow-sm">
              <div className="rounded-xl border border-[#e7edf6] bg-[#fbfcfe] p-5">
                <div className="flex items-center justify-between border-b border-[#e7edf6] pb-4">
                  <div>
                    <p className="text-sm font-semibold text-[#5f6f84]">
                      Review Readiness
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#111827]">
                      Login, Publish + Report Demo
                    </p>
                  </div>
                  <StatusBadge tone="success">Ready</StatusBadge>
                </div>
                <dl className="mt-5 grid gap-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6d7c91]">Products</dt>
                    <dd className="text-right font-semibold text-[#1d2433]">
                      Login Kit, Content Posting API
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6d7c91]">Scopes</dt>
                    <dd className="text-right font-semibold text-[#1d2433]">
                      user.info.basic, user.info.profile, user.info.stats,
                      video.upload, video.publish, video.list
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6d7c91]">Direct Post</dt>
                    <dd className="font-semibold text-emerald-700">Enabled</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#6d7c91]">Token display</dt>
                    <dd className="font-semibold text-emerald-700">Hidden</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              accent="cyan"
              title="Login Kit OAuth"
              description="Connects an authorized department TikTok account through OAuth and stores only server-side token metadata in production."
            />
            <FeatureCard
              accent="rose"
              title="Content Posting API"
              description="Prepares approved posts for TikTok draft/inbox upload with the video.upload scope."
            />
            <FeatureCard
              accent="emerald"
              title="Direct Post & Scheduling"
              description="Direct publishes approved content with video.publish and stores internal schedules for later backend publishing."
            />
            <FeatureCard
              accent="amber"
              title="TikTok Reporting & Executive Summary"
              description="Reads authorized profile, stats, and public videos to generate leadership-ready performance summaries."
            />
          </div>
        </section>
      </main>
    </PageShell>
  );
}
