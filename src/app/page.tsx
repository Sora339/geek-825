"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { Kaisei_Decol } from "next/font/google";
import Link from "next/link";

const Kaisei = Kaisei_Decol({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        router.push("/myPage"); // Redirect to myPage.tsx if the user is logged in
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div
      className={`relative bg-[url('/image/bg-top.webp')] bg-cover bg-[rgba(0,0,0,0.40)] bg-blend-overlay h-[100vh] flex items-center justify-center text-white ${Kaisei.className}`}
    >
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-40 z-10"></div>
      <div className="relative z-20 text-center px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          新感覚書籍探索ゲーム
        </h1>
        <h2 className="text-5xl md:text-7xl mb-12">Maclay Rush</h2>
        <p className="text-xl md:text-2xl">会員証を手に取ってはじめる</p>
      </div>
      <div className="absolute  right-[20%] bottom-[10%] z-20">
        <Link href={"/auth"}>
          <div className="text-center rotate-12 bg-[url('/image/card.webp')] bg-contain h-[120px] w-[200px] bg-[#dddddd] text-black text-sm rounded-lg px-6 py-3 cursor-pointer hover:bg-gray-400 inline-block">
            会員証
            <br />
            <p className="mt-4">心躍る本の世界へ</p>
          </div>
        </Link>
      </div>
      <p className="absolute bottom-4 left-0 right-0 text-center text-sm md:text-base">
        ©2024 created by マクレイ図書館職員
      </p>
    </div>
  );
}
