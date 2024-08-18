"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Book } from "@/../src/types/game"; // 指定されたBook型をインポート
import Header from "@/app/layout/header/header";
import Footer from "@/app/layout/footer/footer";
import { Kaisei_Decol } from "next/font/google";

const Kaisei = Kaisei_Decol({
  weight: "400",
  subsets: ["latin"],
});

interface User {
  id: string;
  name: string;
  photoURL: string;
  likes: string[];
}

const Gallery = () => {
  const [userLikes, setUserLikes] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPublicUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("public", "==", true), limit(30));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Anonymous",
          photoURL: doc.data().photoURL || "/default-avatar.png",
          likes: doc.data().likes || [],
        }));
        setUserLikes(users);
      } catch (error) {
        console.error("Error fetching public users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicUsers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className={`bg-[url('../../public/image/bg-gallery.webp')] bg-cover bg-[rgba(0,0,0,0.60)] bg-blend-overlay bg-fixed ${Kaisei.className}`}
    >
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="container mx-auto p-4 flex-grow">
          <h1 className="text-3xl font-bold mb-4 text-white">本棚ギャラリー</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userLikes.map((user, index) => (
              <GalleryCard
                key={index}
                userId={user.id}
                userName={user.name}
                userPhotoURL={user.photoURL}
                bookIds={user.likes}
              />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

const GalleryCard = ({
  userId,
  userName,
  userPhotoURL,
  bookIds,
}: {
  userId: string;
  userName: string;
  userPhotoURL: string;
  bookIds: string[];
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const bookPromises = bookIds.slice(0, 3).map(async (bookId) => {
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
        });

        const fetchedBooks = await Promise.all(bookPromises);
        setBooks(fetchedBooks.filter((book) => book !== null) as Book[]);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, [bookIds]);

  const handleCardClick = () => {
    router.push(`/gallery/${userId}`);
  };

  return (
    <div
      className="border p-4 rounded shadow-md cursor-pointer bg-white"
      onClick={handleCardClick}
    >
      <div className="flex items-center mb-4">
        <Image
          src={userPhotoURL}
          alt={userName}
          width={40}
          height={40}
          className="rounded-full"
        />
        <h2 className="text-lg font-semibold ml-3">{userName}</h2>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {books.map((book) => (
          <div key={book.id} className="flex justify-center">
            {book.volumeInfo.imageLinks?.smallThumbnail && (
              <Image
                src={book.volumeInfo.imageLinks.smallThumbnail}
                alt={book.volumeInfo.title}
                width={100}
                height={150}
                objectFit="cover"
                className="rounded"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
