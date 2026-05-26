type StatusBadgeProps = {
  children: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
};

const tones = {
  default: "border-[#d8dee8] bg-white text-[#526178]",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-cyan-200 bg-cyan-50 text-cyan-700",
};

export function StatusBadge({ children, tone = "default" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
