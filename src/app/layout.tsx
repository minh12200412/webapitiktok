import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TanPhatETek TikTok Publisher",
  description:
    "Internal TikTok publishing tool for authorized Tan Phat ETEK departments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
