import { Book } from "@/../src/types/game"; // 共通の型をインポート
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { IoHeartOutline, IoHeartSharp } from "react-icons/io5";
import { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client"; // 先ほどのコードにあったFirestoreの初期化

interface ResultProps {
  score: number;
  books: Book[];
  userId: string;
}

export default function Result({ score, books, userId }: ResultProps) {
  const [likedBooks, setLikedBooks] = useState<string[]>([]);

  useEffect(() => {
    const fetchLikedBooks = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setLikedBooks(data.likes || []);
        }
      } catch (error) {
        console.error("Error fetching liked books: ", error);
      }
    };
    fetchLikedBooks();
  }, [userId]);

  const handleLike = async (bookId: string) => {
    const userDocRef = doc(db, "users", userId);
  
    try {
      if (likedBooks.includes(bookId)) {
        await updateDoc(userDocRef, {
          likes: arrayRemove(bookId),
        });
        setLikedBooks(likedBooks.filter((id) => id !== bookId));
      } else {
        await updateDoc(userDocRef, {
          likes: arrayUnion(bookId),
        });
        setLikedBooks([...likedBooks, bookId]);
      }
    } catch (error) {
      console.error("Error updating likes: ", error);
    }
  };
  

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
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{book.volumeInfo.title}</h2>
                <button onClick={() => handleLike(book.id)}>  
                  {likedBooks.includes(book.id) ? (
                    <div className="flex gap-1">
                      <p>お気に入り</p>
                      <IoHeartSharp className="text-red-500 text-2xl" />
                    </div>
                  ) : (
                    <IoHeartOutline className="text-gray-500 text-2xl" />
                  )}
                </button>
              </div>
              <div className="flex mt-2">
                <div>
                  {book.volumeInfo.imageLinks?.smallThumbnail && (
                    <div className="relative mb-2 mr-2 w-[200px] h-[350px]">
                      <Image
                        src={book.volumeInfo.imageLinks.smallThumbnail}
                        alt={book.volumeInfo.title}
                        fill
                        sizes="200px"
                        style={{
                          objectFit: 'contain',
                          objectPosition: 'center',
                        }}
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
