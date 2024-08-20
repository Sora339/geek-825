"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import Header from "@/app/layout/header/header";
import Footer from "@/app/layout/footer/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchUserData = async (uid: string) => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        } else {
          console.log("No such user data!");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    const fetchUserScores = async (uid: string) => {
      try {
        const q = query(
          collection(db, "gameResults"),
          where("userId", "==", uid)
        );
        const querySnapshot = await getDocs(q);
        let scoreSum = 0;

        querySnapshot.forEach((doc) => {
          scoreSum += doc.data().score;
        });

        setTotalScore(scoreSum);
      } catch (error) {
        console.error("Error fetching user scores: ", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
        fetchUserScores(user.uid);
      } else {
        console.log("User is not logged in.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-[url('../../public/image/bg-mypage.webp')] bg-cover bg-[rgba(0,0,0,0.60)] bg-blend-overlay h-[100vh]">
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="container mx-auto p-4 flex-grow">
          {userData ? (
            <div>
              <h1 className="text-7xl font-bold text-white">図書館証</h1>  
              <div>
                <img
                  src={userData.photoURL}
                  alt={userData.name}
                  className="w-24 h-24 rounded-full mb-4"
                />
                <div className="flex gap-5">
                  <p className="text-4xl text-left text-white">氏名</p>
                  <h1 className="text-4xl font-bold text-white">{userData.name}</h1>
                </div>

                <hr/>

                <div className="flex gap-5">
                  <p className="text-4xl text-left text-white">経験値</p>
                  {totalScore !== null && (<h1 className="text-4xl text-white">{totalScore}</h1> )}
                </div>

                <hr/>

                <div className="flex gap-5">
                  <p className="text-4xl text-left text-white">会員ランク</p>
                </div>

                <hr/>

              </div>
            </div>

          ) : (
            <div>User data not found.</div>
          )}
          <div className="flex justify-center gap-14 pt-5 mt-36">
            <div>
              <Link href="/game">
                <Button className="h-max bg-[#404040] shadow-md hover:bg-[#303030]">
                  <p className="text-5xl font-bold">スタート</p>
                </Button>
              </Link>
            </div>
            <div className="pb-7">
              <Link href="/mylikes">
                <Button className="h-max bg-[#404040] shadow-md hover:bg-[#303030]">
                  <p className="text-5xl font-bold">My本棚</p>
                </Button>
              </Link>
            </div>
            <div className="pb-7">
              <Link href="/gallery">
                <Button className="h-max bg-[#404040] shadow-md hover:bg-[#303030]">
                  <p className="text-5xl font-bold">本棚ギャラリー</p>
                </Button>
              </Link>
            </div>
            <div className="pb-7">
              <Link href="/rankingPage">
                <Button className="h-max bg-[#404040] shadow-md hover:bg-[#303030]">
                  <p className="text-5xl font-bold">ランキング</p>
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
