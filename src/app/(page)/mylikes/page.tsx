"use client";

import { Book } from "@/../src/types/game";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import Header from "@/app/layout/header/header";
import Footer from "@/app/layout/footer/footer";
import Loading from "@/app/components/loading";

const MyLikes = () => {
  const [likedBooks, setLikedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async (uid: string) => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const likedBookIds = data.likes || [];

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

  const handleImageClick = (book: Book) => {
    if ('startViewTransition' in document) {
      // @ts-ignore 型エラーを無視する
      document.startViewTransition(() => {
        router.push(`/book-details/${book.id}`);
      });
    } else {
      // APIがサポートされていない場合は通常のページ遷移
      router.push(`/book-details/${book.id}`);
    }
  };
  

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 text-white text-2xl">
        <div className="flex items-center justify-center h-screen">
          <img className="mr-4" src="/image/stack-of-books.png" alt="" />
          <p className="tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Loading />
      <div className="bg-[url('/image/image_fx_-34.jpg')] bg-cover">
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="container mx-auto flex-grow">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-5xl text-white">My本棚</h1>
            </div>
            <div className="">
              <img className="h-screen w-full" src="/image/image_fx_-29.jpg" />
              <div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-8 gap-4 w-[1200px]
              absolute top-56 left-32">
                {likedBooks.map((book) => (
                  <div key={book.id}>
                    
                    <div className="flex justify-center">
                      <Image
                        src={book.volumeInfo.imageLinks?.smallThumbnail || ""}
                        alt={book.volumeInfo.title}
                        width={120}
                        height={200}
                        objectFit="cover"
                        className="rounded cursor-pointer mb-14"
                        onClick={() => handleImageClick(book)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MyLikes;
