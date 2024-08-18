"use client";
import LoginButton from "@/app/layout/header/LoginButton";
import Image from "next/image";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import Footer from "@/app/layout/footer/footer";
import Header from "@/app/layout/header/header";
import AuthHeader from "./header";

const Login = async () => {
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
    <div className="flex flex-col min-h-screen" style={{ scrollbarGutter: 'stable' }}>
      <AuthHeader />
      <div className="container mx-auto h-[calc(100vh-80px-80px)]">
        <div className="flex h-full items-center justify-center">
          <div>
            <h2 className="mb-7 text-center text-[30px] font-bold">
              さあ、まだ見ぬ本の世界へ
            </h2>
            <div className="mb-[50px] flex justify-center">
              <LoginButton />
            </div>
            <div className="flex justify-center">
              <Image
                src="/images/auth/pc-boy.png"
                width="300"
                height="300"
                alt="pc-boy"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
