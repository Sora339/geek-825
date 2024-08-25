// /app/mypage/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Header from "@/app/layout/header/header";
import Footer from "@/app/layout/footer/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserData = {
  name: string;
  photoURL: string;
};

const MyPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth");
        setLoading(false);
      } else {
        fetchUserData(user.uid);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserData = async (uid: string) => {
    try {
      const response = await fetch(`/api/user?uid=${uid}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const { userData, totalScore } = await response.json();
      setUserData(userData);
      setTotalScore(totalScore);
    } catch (error) {
      console.error("Error fetching user data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const getRank = (score: number | null): string => {
    if (score === null) return "新米司書";
    if (score >= 3000) return "図書館長";
    if (score >= 2000) return "上級司書";
    if (score >= 1000) return "熟練司書";
    if (score >= 500) return "若手司書";
    return "新米司書";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="bg-[url('../../public/image/bg-mypage.webp')] bg-cover bg-[rgba(0,0,0,0.60)] bg-blend-overlay bg-fixed"
    >
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="container mx-auto p-4 flex-grow">
          {userData ? (
            <div>
              <h1 className="text-5xl text-white">図書館証</h1>
              <div className="flex mt-36 gap-24 justify-center items-center">
                <div>
                  <Avatar className="mx-auto size-48">
                    <AvatarImage src={userData.photoURL} className="size-48" />
                    <AvatarFallback>{userData.name}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="h-40 w-[500px]">
                  <div className="h-40 flex flex-col justify-between">
                    <div className="flex gap-5">
                      <p className="text-4xl  text-white">氏名: </p>
                      <h1 className="text-4xl ml-auto text-white">
                        {userData.name}
                      </h1>
                    </div>
                    <hr />
                    <div className="flex gap-5">
                      <p className="text-4xl text-white">経験値: </p>
                      {totalScore !== null && (
                        <h1 className="text-4xl ml-auto text-white">
                          {totalScore}
                        </h1>
                      )}
                    </div>
                    <hr />
                    <div className="flex gap-5">
                      <p className="text-4xl text-white">会員ランク: </p>
                      <h1 className="text-4xl ml-auto text-white">
                        {getRank(totalScore)}
                      </h1>
                    </div>
                    <hr />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>User data not found.</div>
          )}
          <div className="flex justify-center gap-14 pt-5 mt-36">
            <div>
              <Link href="/game">
                <Button className="h-max bg-[#404040] shadow-md hover:bg-[#303030]">
                  <p className="text-5xl ">スタート</p>
                </Button>
              </Link>
            </div>
            <div className="pb-7">
              <Link href="/mylikes">
                <Button className="h-max bg-[#404040] shadow-md hover:bg-[#303030]">
                  <p className="text-5xl ">My本棚</p>
                </Button>
              </Link>
            </div>
            <div className="pb-7">
              <Link href="/gallery">
                <Button className="h-max bg-[#404040] shadow-md hover:bg-[#303030]">
                  <p className="text-5xl ">ギャラリー</p>
                </Button>
              </Link>
            </div>
            <div className="pb-7">
              <Link href="/rankingPage">
                <Button className="h-max bg-[#404040] shadow-md hover:bg-[#303030]">
                  <p className="text-5xl ">ランキング</p>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default MyPage;
