import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary:
    "border-transparent bg-[#121827] text-white shadow-sm hover:bg-[#20293a]",
  secondary:
    "border-[#d7dde8] bg-white text-[#1d2433] shadow-sm hover:border-[#b9c2d1] hover:bg-[#f8fafc]",
  ghost: "border-transparent text-[#37506e] hover:bg-white/70",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition ${variants[variant]}`}
    >
      {children}
    </Link>
  );
}
