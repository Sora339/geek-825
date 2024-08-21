"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase/client";
import { collection, addDoc } from "firebase/firestore";
import { Book } from "@/../src/types/game"; // 提供された Book 型をインポート
import { onAuthStateChanged, User } from "firebase/auth";

const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<{
    [key: string]: boolean;
  }>({});
  const [users, setUsers] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [requestedBook, setRequestedBook] = useState<Book | null>(null);
  const [returnNotifications, setReturnNotifications] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null); // メッセージ表示用の状態
  const [user, setUser] = useState<User | null>(null); // ログインしているユーザーの情報を保持

  const baseUrl = 'https://ndlsearch.ndl.go.jp/api/opensearch';
  const query = 'Python'; // Japanese for 'computer science'
  const count = 8; // Number of books to retrieve
  const totalResults = 290; // Total number of results available (can be fetched from API)
  const seenTitles = new Set<string>(); // Track titles that have already been displayed

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      let books: Book[] = [];
      while (books.length < count) {
        try {
          console.log('Fetching random books...');
          // Generate a random start index within the range of total results
          const randomStartIndex = Math.floor(Math.random() * (totalResults - count + 1)) + 1;
          const url = `${baseUrl}?title=${encodeURIComponent(query)}&cnt=${count}&idx=${randomStartIndex}`;
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.text();
          console.log('Data received:', data);

          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, "text/xml");

          const items = Array.from(xmlDoc.getElementsByTagName("item"));
          console.log('Parsed items:', items);

          const uniqueBooks = items.map((item, index) => {
            const titleElement = item.getElementsByTagName("dc:title")[0];
            const descriptionElement = item.getElementsByTagName("dc:description")[0];
            const isbnElement = item.getElementsByTagName("dc:identifier")[0]; // Assuming this is the ISBN
            const jpECodeElement = item.getElementsByTagName("dc:identifier")[1]; // Assuming second identifier is JP-e code

            const title = titleElement ? titleElement.textContent || "No Title" : "No Title";
            if (seenTitles.has(title)) {
              return null; // Skip duplicate titles
            }
            seenTitles.add(title);

            let imageUrl = "";
            if (isbnElement) {
              const isbn = isbnElement.textContent?.replace(/-/g, '');
              imageUrl = isbn ? `https://ndlsearch.ndl.go.jp/thumbnail/${isbn}.jpg` : "";
            } else if (jpECodeElement) {
              const jpECode = jpECodeElement.textContent?.replace(/-/g, '');
              imageUrl = jpECode ? `https://ndlsearch.ndl.go.jp/thumbnail/${jpECode}.jpg` : "";
            }

            // Console log to verify the data
            console.log(`Book ${index + 1}:`);
            console.log(`ID: ${isbnElement?.textContent || jpECodeElement?.textContent || `generated-id-${index}`}`);
            console.log(`Title: ${title}`);
            console.log(`Description: ${descriptionElement ? descriptionElement.textContent : "No Description"}`);
            console.log(`Thumbnail: ${imageUrl}`);

            return {
              id: isbnElement?.textContent || jpECodeElement?.textContent || `generated-id-${index}`,
              volumeInfo: {
                title,
                description: descriptionElement ? descriptionElement.textContent || undefined : undefined,
                imageLinks: imageUrl ? { smallThumbnail: imageUrl } : undefined,
              },
              saleInfo: undefined, // NDLのデータには販売情報は含まれないため
            } as Book;
          }).filter(book => book !== null && book.volumeInfo.imageLinks !== undefined); // Filter out null and books without images

          books = books.concat(uniqueBooks as Book[]).slice(0, count);
        } catch (error) {
          console.error('Fetching books failed:', error);
          break;
        }
      }
      setBooks(books as Book[]);
      setRandomRequestedBook(books as Book[]);
      setUsers(1); // ゲームが開始されたときに最初のユーザーをセット
    };

    fetchBooks().catch((error) => {
      console.error("Error fetching books:", error);
      setBooks([]);
    });
  }, []);

  const setRandomRequestedBook = (books: Book[]) => {
    const randomBook = books[Math.floor(Math.random() * books.length)];
    setRequestedBook(randomBook);
  };

  const handleLendBook = (bookId: string) => {
    if (!requestedBook) return;

    if (bookId === requestedBook.id) {
      if (borrowedBooks[bookId]) {
        setPoints((prev) => prev - 20);
        displayMessage("この本はすでに貸出中です！"); //ネガティブレスポンス
      } else {
        setPoints((prev) => prev + 10);
        displayMessage("正しく貸し出せました。"); //ポジティブレスポンス
      }
    } else {
      setPoints((prev) => prev - 20);
      displayMessage("誤った本が選択されました。"); //ネガティブレスポンス
      return;
    }

    const returnTime = Math.random() * 25000 + 5000;

    setBorrowedBooks((prev) => ({ ...prev, [bookId]: true }));

    setTimeout(() => {
      setBorrowedBooks((prev) => {
        const updatedBorrowedBooks = { ...prev };
        delete updatedBorrowedBooks[bookId];
        return updatedBorrowedBooks;
      });

      const returnedBookTitle =
        books.find((book) => book.id === bookId)?.volumeInfo.title ||
        "不明な本";
      setReturnNotifications((prev) => [
        ...prev,
        `${returnedBookTitle} が返却されました。`,
      ]);

      setTimeout(() => {
        setReturnNotifications((prev) => prev.slice(1));
      }, 10000);
    }, returnTime);

    setRandomRequestedBook(books);
    setUsers((prev) => prev + 1); // 次の利用者をセットするときにユーザー数を増やす
  };

  const handleCheckBorrowed = (bookId: string) => {
    if (!requestedBook) return;

    if (bookId === requestedBook.id) {
      if (borrowedBooks[bookId]) {
        setPoints((prev) => prev + 10);
        displayMessage("正解！この本は貸出中です！"); //ポジティブレスポンス
      } else {
        setPoints((prev) => prev - 20);
        displayMessage("この本は貸出中ではありません。"); //ネガティブレスポンス
      }
    } else {
      setPoints((prev) => prev - 20);
      displayMessage("誤った本が選択されました。"); //ネガティブレスポンス
      return;
    }

    setRandomRequestedBook(books);
    setUsers((prev) => prev + 1); // 次の利用者をセットするときにユーザー数を増やす
  };

  const displayMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
    }, 3000); // 3秒後にメッセージを消す
  };

  const saveResultToFirestore = async (score: number) => {
    if (!user) {
      console.error("No user is logged in.");
      return;
    }

    try {
      await addDoc(collection(db, "gameResults"), {
        score,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        timestamp: new Date(),
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return {
    books,
    points,
    users,
    requestedBook,
    borrowedBooks,
    returnNotifications,
    message, // メッセージを返す
    handleLendBook,
    handleCheckBorrowed,
    saveResultToFirestore,
  };
};

export default useBooks;
