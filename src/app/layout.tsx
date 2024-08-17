import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Tech Type", template: "%s|Tech Type" },
  description: "好きな技術でタイピング！文章が変わる新感覚ゲーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
        <body className={inter.className}>
          {children}
        </body>
    </html>
  );
}
