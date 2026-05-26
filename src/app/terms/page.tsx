import { PageShell } from "@/components/PageShell";
import { StatusBadge } from "@/components/StatusBadge";

const terms = [
  "Only authorized employees and departments of Tan Phat ETEK may use this tool.",
  "Content must be reviewed and approved internally before upload.",
  "The app uploads content to TikTok draft/inbox flow in this phase.",
  "Direct posting is disabled in this version.",
  "Users must comply with TikTok policies and Tan Phat ETEK company policy.",
  "Users can disconnect their TikTok account from this app.",
  "The company may suspend access if misuse is detected.",
];

export default function TermsPage() {
  return (
    <PageShell>
      <main className="mx-auto max-w-4xl px-5 py-12">
        <StatusBadge tone="info">Terms of Service</StatusBadge>
        <h1 className="mt-5 text-4xl font-bold text-[#111827]">
          Terms of Service
        </h1>
        <p className="mt-4 text-base leading-7 text-[#5f6f84]">
          These Terms of Service govern access to and use of the TanPhatETek
          TikTok Publisher application by authorized Tan Phat ETEK personnel.
        </p>

        <section className="mt-8 rounded-xl border border-[#e1e6ef] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#111827]">Use Terms</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5f6f84]">
            {terms.map((term) => (
              <li key={term} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5 rounded-xl border border-[#e1e6ef] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#111827]">Contact</h2>
          <p className="mt-3 text-sm leading-6 text-[#5f6f84]">
            For questions about these terms, contact
            qttt.tanphatetek@gmail.com.
          </p>
        </section>
      </main>
    </PageShell>
  );
}
