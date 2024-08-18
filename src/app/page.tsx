'use client'

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import About from "./components/top/about/about";
import HowToPlay from "./components/top/howToPlay/howToPlay";
import Footer from "./layout/footer/footer";
import Header from "./layout/header/header";
import StartButton from "./components/top/startButton";

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
    <div>
      <Header />
      <div className="flex min-h-screen flex-col items-center font-sans">
        <div className="mb-8 flex w-full flex-col items-center">
          <Image
            src="/image/bg_1.webp"
            alt="High-tech computer setup"
            className="h-[80vh] w-full object-cover"
            width="1000"
            height="500"
            priority
          />
          <About />
          <HowToPlay />
          <StartButton />
        </div>
      </div>
      <Footer />
    </div>
  );
}
