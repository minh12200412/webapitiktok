type FeatureCardProps = {
  title: string;
  description: string;
  accent: "cyan" | "rose" | "emerald" | "amber";
};

const accentClasses = {
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
};

export function FeatureCard({ title, description, accent }: FeatureCardProps) {
  return (
    <article className="rounded-xl border border-[#e1e6ef] bg-white p-5 shadow-sm">
      <div
        className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold ${accentClasses[accent]}`}
      >
        {title.slice(0, 1)}
      </div>
      <h3 className="text-base font-semibold text-[#1d2433]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5f6f84]">{description}</p>
    </article>
  );
}
