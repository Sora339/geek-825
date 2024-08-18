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
            <div className="text-center">
              <img
                src={userData.photoURL}
                alt={userData.name}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              {totalScore !== null && (
                <p className="text-xl mt-4">
                  これまでの総合スコア: {totalScore}
                </p>
              )}
            </div>
          ) : (
            <div>User data not found.</div>
          )}
          <div className="flex justify-center gap-3 pt-5">
            <div>
              <Link href="/game">
                <Button className="h-max bg-green-400 shadow-md hover:bg-green-500">
                  <p className="text-2xl font-bold">スタート</p>
                </Button>
              </Link>
            </div>
            <div className="pb-7">
              <Link href="/mylikes">
                <Button className="h-max bg-blue-700 shadow-md hover:bg-blue-900">
                  <p className="text-2xl font-bold">My本棚</p>
                </Button>
              </Link>
            </div>
            <div className="pb-7">
              <Link href="/gallery">
                <Button className="h-max bg-purple-700 shadow-md hover:bg-purple-900">
                  <p className="text-2xl font-bold">本棚ギャラリー</p>
                </Button>
              </Link>
            </div>
            <div className="pb-7">
              <Link href="/rankingPage">
                <Button className="h-max bg-orange-700 shadow-md hover:bg-orange-900">
                  <p className="text-2xl font-bold">ランキング</p>
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
