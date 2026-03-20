import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "./theme-script";

export const metadata: Metadata = {
  title: "plactice_math - 数学概念学習",
  description: "数学の概念を一歩ずつ理解するための学習アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
