"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client"; // Firebase 設定
import { onAuthStateChanged } from "firebase/auth";

const GamePage = () => {
  const [isFirstPlay, setIsFirstPlay] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkFirstPlay = async (uid: string) => {
      try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          // 初めてプレイするかどうかの判定
          if (data.hasPlayedBefore) {
            setIsFirstPlay(false); // 既にプレイしたことがある
          } else {
            setIsFirstPlay(true); // 初めてプレイする
            // 初めてプレイしたことをFirestoreに記録
            await setDoc(userDocRef, { hasPlayedBefore: true }, { merge: true });
          }
        } else {
          // ドキュメントが存在しない場合（新規ユーザー）
          setIsFirstPlay(true);
          await setDoc(userDocRef, { hasPlayedBefore: true });
        }
      } catch (error) {
        console.error("Error checking first play:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        checkFirstPlay(user.uid);
      } else {
        router.push("/auth"); // ログインしていない場合はログインページへリダイレクト
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {isFirstPlay ? (
        <div className="p-8 bg-blue-100 rounded-lg text-center">
          <h1 className="text-4xl font-bold mb-4"></h1>
          <p className="text-lg mb-4"></p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Start Your First Adventure
          </button>
        </div>
      ) : (
        <div className="p-8 bg-green-100 rounded-lg text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-lg mb-4">Good to see you again. Continue where you left off!</p>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg">
            Continue Your Journey
          </button>
        </div>
      )}
    </div>
  );
};

export default GamePage;
