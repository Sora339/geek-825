"use client";
import LoginButton from "@/app/layout/header/LoginButton";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import Footer from "@/app/layout/footer/footer";
import AuthHeader from "./header";
import { Kaisei_Decol } from "next/font/google";

const Kaisei = Kaisei_Decol({
  weight: "400",
  subsets: ["latin"],
});

const Login = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      // userがセットされたタイミングでリダイレクト
      router.push("/myPage");
    }
  }, [user, router]);

  return (
    <div className={`bg-[url('../../public/image/bg-top.webp')] bg-cover bg-[rgba(0,0,0,0.60)] bg-blend-overlay h-[100vh] ${Kaisei.className}`}>
      <div
        className="flex flex-col min-h-screen"
        style={{ scrollbarGutter: "stable" }}
      >
        <AuthHeader />
        <div className="container mx-auto h-[calc(100vh-80px-80px)]">
          <div className="flex h-full items-center justify-center">
            <div>
              <h2 className="mb-7 text-white text-center text-[30px] font-bold">
                さあ、まだ見ぬ本の世界へ
              </h2>
              <div className="mb-[50px] flex justify-center">
                <LoginButton />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Login;
