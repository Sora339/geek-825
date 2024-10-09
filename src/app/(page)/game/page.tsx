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
import Image from "next/image";
import SubSet from "@/app/components/game/subSet"; // モーダルコンポーネントのインポート
import Loading from "@/app/components/loading";

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
    resetGame, // リセット関数を取得
    clearBorrowedBooks, // 貸出中の本と通知をリセットする関数を取得
    message, // メッセージを取得
    isModalOpen, // モーダルの表示状態
    setSubject, // subjectを設定する関数
    handleStartGame, // ゲーム開始の関数
    errorMessage, // エラーメッセージ
    isBooksReady, // 本が揃っているかの状態
  } = useBooks();

  const [timeLeft, setTimeLeft] = useState<number>(180); // 3分間のタイマー（秒単位）
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
    if (isBooksReady && timeLeft > 0) {
      const timer: ReturnType<typeof setInterval> = setInterval(() => {
        setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
      }, 1000);

      return () => clearInterval(timer);
    }

    if (timeLeft === 0) {
      handleGameEnd();
    }
  }, [timeLeft, isBooksReady]); // 依存配列に isBooksReady を追加

  const handleGameEnd = () => {
    saveResultToFirestore(points);
    clearBorrowedBooks(); // ゲーム終了時に貸出中の本と返却通知をリセット
    setShowResult(true); // ゲーム終了時にモーダルを表示
  };

  const handleCloseResult = () => {
    setShowResult(false); // モーダルを閉じる
  };

  const handleResetGame = () => {
    setTimeLeft(180); // タイマーをリセット
    setShowResult(false); // 結果モーダルを非表示
    resetGame(); // ゲーム状態をリセット（本の再フェッチと通知クリア含む）
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div>
      <Loading />
      <div className="bg-[url('/image/bg_1.webp')] bg-cover bg-[rgba(0,0,0,0.60)] bg-blend-overlay">
        <div className="h-screen mx-auto md:scale-50 lg:scale-75 xl:scale-100">
          <div className="h-full flex flex-col justify-center ">
            <div className="container flex justify-between">
              <div>
                <p className="text-white text-3xl">現在のポイント: {points}</p>
                <p className="text-white text-2xl mb-2">
                  残り時間: {formatTime(timeLeft)}
                </p>{" "}
              </div>
              <Button
                onClick={handleGameEnd}
                className="mt-4 bg-green-500 text-white mb-6 py-2 px-4 rounded"
              >
                ゲーム終了
              </Button>
            </div>
            <div className="flex gap-12 items-center justify-center">
              <div className="top-0 h-full w-fit">
                <div
                  className="bg-[url('../../public/image/clipboard.png')] 
                bg-contain container bg-no-repeat h-full pt-12 w-[338px]"
                >
                  <Image
                    src={"/image/cus_" + (users % 8) + ".webp"}
                    alt="customer"
                    priority
                    width={200}
                    height={200}
                    className="mx-auto mb-2 rounded-xl"
                  ></Image>

                  {requestedBook && (
                    <div className="mb-4">
                      <h2 className="text-xl h-[20%] hidden-scrollbar overflow-y-scroll">
                        利用者No.{users}の希望:
                        <br /> {requestedBook.volumeInfo.title}
                      </h2>
                      <div className="mt-2 h-[10px]">
                        {/* メッセージの色を変更 */}
                        <p
                          style={{
                            color:
                              message === "正しく貸し出せました。" ||
                              message === "正解！この本は貸出中です！"
                                ? "green"
                                : "red",
                          }}
                        >
                          {message}
                        </p>
                      </div>
                    </div>
                  )}
                  <p className="mb-2 text-xl">返却通知</p>
                  <div className="h-[35%] overflow-y-scroll hidden-scrollbar">
                    {returnNotifications.map((notification, index) => (
                      <p key={index} className="bg-gray-200 p-2 rounded mb-2">
                        {notification}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-full w-fit">
                <Bookshelf
                  books={books}
                  onLendBook={handleLendBook}
                  onCheckBorrowed={handleCheckBorrowed}
                />
              </div>
            </div>
          </div>
        </div>
        <SubSet
          isModalOpen={isModalOpen}
          setSubject={setSubject}
          handleStartGame={handleStartGame}
          errorMessage={errorMessage}
        />
        {showResult && userId && (
          <Result
            score={points}
            books={books}
            userId={userId}
            onReset={handleResetGame}
          />
        )}
      </div>
    </div>
  );
}
