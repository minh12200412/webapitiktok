import { PageShell } from "@/components/PageShell";
import { StatusBadge } from "@/components/StatusBadge";

const sections = [
  {
    title: "Data We Collect",
    items: [
      "TikTok open_id",
      "TikTok display name",
      "TikTok avatar URL",
      "Authorization scopes granted to the app",
      "Access and refresh token metadata",
      "Publish status and upload status",
      "Content metadata such as title, caption, hashtags, and media URLs",
    ],
  },
  {
    title: "Purpose of Processing",
    items: [
      "Identify the connected TikTok account.",
      "Map the TikTok account to an internal Tan Phat ETEK department.",
      "Upload approved content to TikTok draft/inbox flow using TikTok Login Kit and Content Posting API.",
      "Support internal auditing of approved marketing publishing workflows.",
    ],
  },
  {
    title: "Token Handling",
    items: [
      "Tokens are used only server-side.",
      "Tokens are not shown in the user interface.",
      "Tokens should be encrypted in production before storage.",
      "This phase does not store live tokens because the app has no production database yet.",
    ],
  },
  {
    title: "Data Sharing",
    items: [
      "We do not sell TikTok user data.",
      "We do not share TikTok user data with advertisers.",
      "Data is used only for authorized internal publishing operations and app review demonstration.",
    ],
  },
  {
    title: "Revocation and Disconnect",
    items: [
      "Users can disconnect their TikTok account in this app.",
      "Users can revoke access directly in TikTok settings.",
      "After revocation, this app will no longer use the revoked TikTok authorization.",
    ],
  },
  {
    title: "Security",
    items: [
      "Secrets are stored in environment variables.",
      "Logs must redact sensitive values such as client secrets, access tokens, and refresh tokens.",
      "Production token storage requires a database, encryption, and restricted operational access.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PageShell>
      <main className="mx-auto max-w-4xl px-5 py-12">
        <StatusBadge tone="info">Privacy Policy</StatusBadge>
        <h1 className="mt-5 text-4xl font-bold text-[#111827]">
          Privacy Policy
        </h1>
        <p className="mt-4 text-base leading-7 text-[#5f6f84]">
          This Privacy Policy describes how Tan Phat ETEK processes information
          for the TanPhatETek TikTok Publisher application. The app is intended
          for authorized employees and departments of Tan Phat ETEK.
        </p>

        <div className="mt-8 rounded-xl border border-[#e1e6ef] bg-white p-5 shadow-sm">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-[#1d2433]">Company</dt>
              <dd className="mt-1 text-[#5f6f84]">Tan Phat ETEK</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#1d2433]">Contact</dt>
              <dd className="mt-1 text-[#5f6f84]">
                qttt.tanphatetek@gmail.com
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 grid gap-5">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-xl border border-[#e1e6ef] bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-[#111827]">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5f6f84]">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </PageShell>
  );
}
