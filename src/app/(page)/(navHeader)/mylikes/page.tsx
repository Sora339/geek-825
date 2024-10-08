"use client";

import { Book } from "@/../src/types/game";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDoc, doc, updateDoc, arrayRemove } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { IoHeartSharp } from "react-icons/io5";
import { FaLock, FaUnlockAlt } from "react-icons/fa";
import Header from "@/app/layout/header/header";
import Footer from "@/app/layout/footer/footer";
import Loading from "@/app/components/loading";

const MyLikes = () => {
  const [likedBooks, setLikedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async (uid: string) => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const likedBookIds = data.likes || [];
          setIsPublic(data.public || false); // 公開設定の初期値を設定

          const bookPromises = likedBookIds.map((bookId: string) =>
            fetchBookDetails(bookId)
          );

          const books = await Promise.all(bookPromises);
          setLikedBooks(books.filter((book) => book !== null) as Book[]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchBookDetails = async (bookId: string): Promise<Book | null> => {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes/${bookId}`
      );
      if (response.ok) {
        const bookData = await response.json();
        return bookData as Book;
      } else {
        console.error(`Failed to fetch details for book ID: ${bookId}`);
        return null;
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserData(user.uid);
      } else {
        router.push("/auth");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLike = async (bookId: string) => {
    if (!userId) return;

    const confirmUnike = confirm("この本をいいねから削除しますか？");
    if (!confirmUnike) {
      return;
    }

    try {
      // Firestoreからいいねを削除
      await updateDoc(doc(db, "users", userId), {
        likes: arrayRemove(bookId),
      });

      // ローカルの状態からも削除
      setLikedBooks(likedBooks.filter((book) => book.id !== bookId));
    } catch (error) {
      console.error("Failed to remove like:", error);
    }
  };

  const togglePublic = async () => {
    if (!userId) return;

    try {
      // 公開設定をトグルする
      const newPublicState = !isPublic;
      setIsPublic(newPublicState);

      // Firestoreに保存
      await updateDoc(doc(db, "users", userId), {
        public: newPublicState,
      });
    } catch (error) {
      console.error("Failed to update public setting:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Loading />
      <div className="bg-[url('../../public/image/bg-gallery.webp')] bg-cover bg-[rgba(0,0,0,0.60)] bg-blend-overlay bg-fixed">
        <div className="flex flex-col min-h-screen">
          <div className="container mx-auto p-4 flex-grow">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-5xl text-white">My本棚</h1>
              <button onClick={togglePublic} className="text-xl">
                {isPublic ? (
                  <div className="flex items-center gap-2">
                    <FaUnlockAlt className="text-green-500" />
                    <span className="text-white">公開する</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FaLock className="text-red-500" />
                    <span className="text-white">公開しない</span>
                  </div>
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {likedBooks.map((book) => (
                <div
                  key={book.id}
                  className="border p-2 rounded h-[400px] overflow-y-scroll bg-white"
                >
                  <div className="justify-between items-center">
                    <button
                      className="w-full"
                      onClick={() => handleLike(book.id)}
                    >
                      <div className="flex gap-1 justify-end">
                        <p>お気に入り</p>
                        <IoHeartSharp className="text-red-500 text-2xl" />
                      </div>
                    </button>
                    <h2 className="text-xl font-semibold">
                      {book.volumeInfo.title}
                    </h2>
                  </div>
                  {book.volumeInfo.imageLinks?.smallThumbnail && (
                    <div className="flex justify-center">
                      <Image
                        src={book.volumeInfo.imageLinks.smallThumbnail}
                        alt={book.volumeInfo.title}
                        width={128}
                        height={200}
                        objectFit="cover"
                        className="rounded mt-2 mb-2"
                      />
                    </div>
                  )}
                  <p className="mb-2">
                    {book.volumeInfo.description?.replace(/<wbr>/g, "")}
                  </p>
                  {book.saleInfo?.saleability === "FOR_SALE" &&
                    book.saleInfo.buyLink && (
                      <div className="text-right">
                        <a
                          href={book.saleInfo.buyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 ml-auto"
                        >
                          購入リンク
                        </a>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyLikes;
