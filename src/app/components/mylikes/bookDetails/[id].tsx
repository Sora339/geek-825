"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Book } from "@/../src/types/game";
import Loading from "@/app/components/loading";
import Header from "@/app/layout/header/header";
import Footer from "@/app/layout/footer/footer";

const BookDetails = ({ params }: { params: { id: string } }) => {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${id}`
        );
        if (response.ok) {
          const bookData = await response.json();
          setBook(bookData);
        } else {
          console.error("Failed to fetch book details");
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center text-xl mt-10">
        本の詳細が見つかりませんでした。
      </div>
    );
  }

  const imageUrl =
    book.volumeInfo.imageLinks?.smallThumbnail;

  return (
    <div>
      <Header />
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-semibold mb-4">{book.volumeInfo.title}</h1>
        <div className="flex justify-center mb-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={book.volumeInfo.title}
              className="rounded"
            />
          ) : (
            <p>画像が見つかりません。</p>
          )}
        </div>
        <p>{book.volumeInfo.description}</p>
        <div className="mt-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            戻る
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookDetails;