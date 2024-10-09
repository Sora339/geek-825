"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import Header from "@/app/layout/header/header";
import Footer from "@/app/layout/footer/footer";
import Loading from "@/app/components/loading";

type GameResult = {
  userId: string;
  userName: string;
  score: number;
};

const Ranking = () => {
  const [rankings, setRankings] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [highScore, setHighScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchCurrentUser = () => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUserId(user.uid);
          fetchUserHighScore(user.uid); // ユーザーのハイスコアを取得
        } else {
          setCurrentUserId(null);
        }
      });
      return () => unsubscribe();
    };

    const fetchUserHighScore = async (userId: string) => {
      try {
        const q = query(
          collection(db, "gameResults"),
          where("userId", "==", userId),
          orderBy("score", "desc")
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const highestScore = querySnapshot.docs[0].data().score;
          setHighScore(highestScore);
        }
      } catch (error) {
        console.error("Error fetching user high score: ", error);
      }
    };

    const fetchRankings = async () => {
      try {
        const q = query(
          collection(db, "gameResults"),
          orderBy("score", "desc"),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const fetchedRankings: GameResult[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedRankings.push({
            userId: data.userId,
            userName: data.userName,
            score: data.score,
          });
        });

        setRankings(fetchedRankings);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching rankings: ", error);
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchRankings();
  }, []);

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
      <div
        className="bg-[url('../../public/image/bg-ranking.webp')] bg-cover bg-[rgba(0,0,0,0.60)] bg-blend-overlay bg-fixed"
      >
        <div className="flex flex-col min-h-[calc(100vh-10rem)]">
          <div className="container mx-auto p-4 flex-grow">
            <h1 className="text-5xl text-white mb-4">ランキング</h1>
            <div className="mx-auto h-[700px] w-[570px] pt-24 bg-[url('../../public/image/bg_ranking2.webp')] bg-cover bg-[rgba(0,0,0,0.60)] bg-blend-overlay">
              {highScore !== null && (
                <div className=" p-4 rounded text-center">
                  <h2 className="text-white mt-2 text-xl">
                    あなたのハイスコア: {highScore}
                  </h2>
                </div>
              )}
              <table className="mx-auto w-[340px]">
                <thead>
                  <tr className="text-white">
                    <th>順位</th>
                    <th>ユーザー名</th>
                    <th>スコア</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((ranking, index) => (
                    <tr
                      key={index}
                      className={
                        ranking.userId === currentUserId ? "text-yellow-300" : "text-white"
                      }
                    >
                      <td className="text-center px-4 py-2">{index + 1}</td>
                      <td className="text-center px-4 py-2">{ranking.userName}</td>
                      <td className="text-center px-4 py-2">{ranking.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ranking;
