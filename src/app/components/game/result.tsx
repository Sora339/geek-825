import { Book } from "@/../src/types/game"; // 共通の型をインポート
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface ResultProps {
  score: number;
  books: Book[];
}

export default function Result({ score, books }: ResultProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-4">ゲーム結果</h1>
          <div className="flex gap-4">
          <Link href={"/game"}>
            <Button className="mt-4 bg-green-500 text-white mb-6 py-2 px-4 rounded">
              やり直す
            </Button>
          </Link>
          <Link href={"/myPage"}>
            <Button className="mt-4 bg-red-500 text-white mb-6 py-2 px-4 rounded">
              マイページ
            </Button>
          </Link>
          <Link href={"/rankingPage"}>
            <Button className="mt-4 bg-yellow-500 text-white mb-6 py-2 px-4 rounded">
              ランキング
            </Button>
          </Link>
          </div>
        </div>
        <p className="mb-4">最終スコア: {score}</p>
        <div className="max-h-[400px] overflow-y-auto">
          {books.map((book) => (
            <div key={book.id} className="mb-4 p-4 border rounded">
              <h2 className="text-xl font-semibold">{book.volumeInfo.title}</h2>
              <div className="flex mt-2">
                <div>
                  {book.volumeInfo.imageLinks?.smallThumbnail && (
                    <div className="relative mb-2 mr-2 w-[200px] h-[350px]">
                      <Image
                        src={book.volumeInfo.imageLinks.smallThumbnail}
                        alt={book.volumeInfo.title}
                        layout="fill"
                        objectFit="contain"
                        objectPosition="center"
                        className="rounded"
                      />
                    </div>
                  )}
                </div>
                <p className="ml-4">
                  {book.volumeInfo.description || "説明がありません。"}
                </p>
              </div>
              {book.saleInfo?.saleability === "FOR_SALE" &&
                book.saleInfo?.buyLink && (
                  <a
                    href={book.saleInfo.buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    購入リンク
                  </a>
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
