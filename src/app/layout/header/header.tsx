"use client";

import Image from "next/image";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useEffect, useState } from "react";
import LoginButton from "./LoginButton";
import LogOutButton from "./logOutButton";
import StartButton from "@/app/components/top/startButton";
import { Kaisei_Decol } from "next/font/google";
import { Crown, GalleryHorizontalEnd, LibraryBig } from "lucide-react";
import BgmPlayer from "@/app/components/bgmPlay";
import HowToPlaySection from "@/app/components/top/howToPlay/howToSection";

const Kaisei = Kaisei_Decol({
  weight: "400",
  subsets: ["latin"],
});

const Header = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);
  return (
    <div className={Kaisei.className}>
      <header className="bg-[#252525] h-[80px]">
        <div
          className="container flex h-full max-w-[1200px] items-center justify-between"
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="flex gap-20 items-center">
            <Link href="/" className="flex">
              <h1 className="flex items-center text-white text-3xl font-bold">
                Maclay Rush
              </h1>
            </Link>
            <nav>
              <ul className="text-white flex gap-10">
                <li>
                  <Link className="flex gap-2" href="/mylikes">
                    <LibraryBig />
                    My本棚
                  </Link>
                </li>
                <li>
                  <Link className="flex gap-2" href="/gallery">
                    <GalleryHorizontalEnd />
                    ギャラリー
                  </Link>
                </li>
                <li>
                  <Link className="flex gap-2" href="/rankingPage">
                    <Crown />
                    ランキング
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex gap-5">
            <div>
              <BgmPlayer />
            </div>
            <div>
              <HowToPlaySection />
            </div>
            {user ? (
              <div>
                <LogOutButton />
              </div>
            ) : (
              <div>
                <StartButton />
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
