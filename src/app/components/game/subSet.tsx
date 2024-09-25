import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import Loading from "../loading";

interface SubSetProps {
  isModalOpen: boolean;
  setSubject: (subject: string) => void;
  handleStartGame: () => void;
  errorMessage: string | null;
}

const SubSet: React.FC<SubSetProps> = ({
  isModalOpen,
  setSubject,
  handleStartGame,
  errorMessage,
}) => {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-[url('../../public/image/bg_1.webp')] bg-cover bg-[rgba(0,0,0,0.60)] h-full bg-blend-overlay flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">トピックを入力してください</h2>
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        <input
          type="text"
          onChange={(e) => setSubject(e.target.value)}
          placeholder="トピック (例: history)"
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <div className="flex justify-between items-center">
        <Link href="/myPage">
            <Button className="bg-green-500 text-white rounded">
              ゲーム終了
            </Button>
          </Link>
          <Button
            
            onClick={handleStartGame}
            className="bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Loading />
            決定
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubSet;
