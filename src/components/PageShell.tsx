import Link from "next/link";
import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f8fb] text-[#1d2433]">
      <header className="border-b border-[#e1e6ef] bg-white/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-lg font-bold tracking-normal">
            TanPhat ETEK
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm font-medium text-[#5f6f84]">
            <Link className="hover:text-[#1d2433]" href="/tiktok-publisher-demo">
              Demo
            </Link>
            <Link className="hover:text-[#1d2433]" href="/admin/tiktok-accounts">
              Accounts
            </Link>
            <Link className="hover:text-[#1d2433]" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-[#1d2433]" href="/terms">
              Terms
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-[#e1e6ef] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-sm text-[#6d7c91] sm:flex-row sm:items-center sm:justify-between">
          <span>Tan Phat ETEK internal TikTok publishing review app.</span>
          <span>Contact: qttt.tanphatetek@gmail.com</span>
        </div>
      </footer>
    </div>
  );
}
