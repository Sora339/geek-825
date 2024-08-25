import "./globals.css";

import type { Metadata } from "next";
import { Kaisei_Decol } from "next/font/google";

const Kaisei = Kaisei_Decol({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Maclay Rush", template: "%s|Maclay Rush" },
  description: "敏腕図書館司書を目指して！新感覚書籍探索ゲーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="bg-[#252525]">
        <body className={Kaisei.className}>
          {children}
        </body>
    </html>
  );
}
