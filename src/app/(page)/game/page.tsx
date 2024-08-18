"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Bookshelf from "@/app/components/game/Bookshelf";
import useBooks from "@/app/hooks/useBook";
import Result from "../../components/game/result";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const {
    books,
    points,
    users,
    requestedBook,
    returnNotifications,
    handleLendBook,
    handleCheckBorrowed,
    saveResultToFirestore,
    message, // メッセージを取得
  } = useBooks();

  const [timeLeft, setTimeLeft] = useState<number>(10); // 3分間のタイマー（秒単位）
  const [showResult, setShowResult] = useState<boolean>(false); // モーダル表示状態を管理
  const [userId, setUserId] = useState<string | null>(null); // userIdの状態
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // ユーザーIDを状態に保存
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleGameEnd();
    }

    const timer: ReturnType<typeof setInterval> | undefined =
      timeLeft > 0
        ? setInterval(() => setTimeLeft(timeLeft - 1), 1000)
        : undefined;
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeLeft]);

  const handleGameEnd = () => {
    saveResultToFirestore(points);
    setShowResult(true); // ゲーム終了時にモーダルを表示
  };

  const handleCloseResult = () => {
    setShowResult(false); // モーダルを閉じる
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className=" bg-[url('../../public/image/bg_1.webp')] bg-cover bg-[rgba(255,255,255,0.25)] bg-blend-lighten h-[100vh]">
      <div className="container mx-auto p-4">
        <div className="mt-8">
          <Link href={"/myPage"}>
            <Button
              onClick={handleGameEnd}
              className="mt-4 bg-green-500 text-white mb-6 py-2 px-4 rounded"
            >
              ゲーム終了
            </Button>
          </Link>
          <div className="flex">
            <div className="sticky top-0 bg-white mr-4 p-4 w-[270px]">
              <h1 className="text-3xl font-bold mb-4">本棚ゲーム</h1>
              <p className="mb-4">現在のポイント: {points}</p>
              <p className="mb-4">残り時間: {formatTime(timeLeft)}</p>{" "}
              {/* タイマーの表示 */}
              {requestedBook && (
                <div className="mb-4 h-[140px]">
                  <h2 className="text-xl">
                    利用者No.{users}の希望:
                    <br /> {requestedBook.volumeInfo.title}
                  </h2>
                  <div className="mt-2">
                    <p>{message}</p> {/* メッセージをここに表示 */}
                  </div>
                </div>
              )}
              <div className="mt-12">
                <p className="mb-2 text-xl">返却通知</p>
                {returnNotifications.map((notification, index) => (
                  <p key={index} className="bg-gray-200 p-2 rounded mb-2">
                    {notification}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <Bookshelf
                books={books}
                onLendBook={handleLendBook}
                onCheckBorrowed={handleCheckBorrowed}
              />
            </div>
          </div>
        </div>
      </div>
      {showResult && userId && (
        <Result score={points} books={books} userId={userId} />
      )}
    </div>
  );
}
