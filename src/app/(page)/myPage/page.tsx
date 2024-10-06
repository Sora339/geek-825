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
import { motion } from "framer-motion";
import Loading from "@/app/components/loading";

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

  // if (loading) {
  //   return <div className="fixed inset-0 bg-gray-900 text-white text-2xl">
  //           <div className="flex items-center justify-center h-screen">
  //             <img className="mr-4" src="/image/stack-of-books.png" alt="" />
  //             <p>Loading...</p>
  //           </div>
  //         </div>;
  // }

  return (
    <div>
      <Loading />
      <div className="bg-[url('../../public/image/bg-mypage.webp')] bg-cover bg-[rgba(0,0,0,0.60)] bg-blend-overlay bg-fixed z-0 relative">
        <div className="flex flex-col min-h-screen">
          <Header />

          <div className="container mx-auto p-4 flex-grow items-center flex gap-20">
            {userData ? (
              <div>
                <div className="container items-center bg-[url('/image/gamecard.jpg')] rounded-md w-[424px] mx-auto h-[600px]">
                  <div className="p-4">
                    <h2 className="text-white text-4xl">図書館証</h2>
                    <div className="flex items-center justify-center mt-6 gap-10">
                      <Avatar className="size-20 ml-2">
                        <AvatarImage
                          src={userData.photoURL}
                          className="size-20"
                        />
                        <AvatarFallback>{userData.name}</AvatarFallback>
                      </Avatar>
                      <div className="flex justify-center">
                        <h1 className="text-3xl text-white">{userData.name}</h1>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-2xl mt-6 mb-16">
                      入場資格 <br /> 当日 23:59まで5回限り有効
                    </p>
                  </div>
                  <div className="h-40 w-[350px] mx-auto">
                    <div className="h-40 flex flex-col justify-between">
                      <div className="flex">
                        <p className="text-3xl text-white">経験値: </p>
                        {totalScore !== null && (
                          <h1 className="text-3xl ml-auto text-white">
                            {totalScore}
                          </h1>
                        )}
                      </div>
                      <hr />
                      <div className="flex">
                        <p className="text-3xl text-white">会員ランク: </p>
                        <h1 className="text-3xl ml-auto text-white">
                          {getRank(totalScore)}
                        </h1>
                      </div>
                      <hr />
                      <div className="flex">
                        <p className="text-3xl  text-white">仮置: </p>
                        <h1 className="text-3xl ml-auto text-white">
                          30pxの実績用
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>User data not found.</div>
            )}
            <div className="border-[1px] h-[70vh]"></div>
            <div className="absolute top-16 right-14 items-center pt-28">
              <motion.div
                initial={{ x: 100 }}
                animate={{ x: -200 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="pb-16"
              >
                <Link href="/game">
                  <Button className="h-max bg-[#404040] shadow-sm hover:bg-[#303030]">
                    <p className="text-5xl ">スタート</p>
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={{ x: 100 }}
                animate={{ x: -300 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="pb-16"
              >
                <Link href="/mylikes">
                  <Button className="h-max bg-[#404040] shadow-md hover:bg-[#303030]">
                    <p className="text-5xl ">My本棚</p>
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={{ x: 100 }}
                animate={{ x: -170 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="pb-16"
              >
                <Link href="/gallery">
                  <Button className="h-max bg-[#404040] shadow-md hover:bg-[#303030]">
                    <p className="text-5xl ">ギャラリー</p>
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={{ x: 100 }}
                animate={{ x: -400 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="pb-16"
              >
                <Link href="/rankingPage">
                  <Button className="h-max bg-[#404040] shadow-md hover:bg-[#303030]">
                    <p className="text-5xl ">ランキング</p>
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MyPage;
