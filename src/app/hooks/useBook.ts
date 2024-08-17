'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '../../lib/firebase/client';
import { collection, addDoc } from 'firebase/firestore';
import { Book } from '@/../src/types/game';  // 共通の型をインポート
import { onAuthStateChanged, User } from 'firebase/auth';

const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<{ [key: string]: boolean }>({});
  const [users, setUsers] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [requestedBook, setRequestedBook] = useState<Book | null>(null);
  const [returnNotifications, setReturnNotifications] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null); // メッセージ表示用の状態
  const [user, setUser] = useState<User | null>(null); // ログインしているユーザーの情報を保持

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
      const randomStartIndex = Math.floor(Math.random() * 800); // 0から1000までのランダムな開始インデックスを生成
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=8&startIndex=${randomStartIndex}&orderBy=newest&langRestrict=ja`);
      const data = await response.json();
      setBooks(data.items || []);
      setRandomRequestedBook(data.items || []);
      setUsers(1); // ゲームが開始されたときに最初のユーザーをセット
    };

    fetchBooks().catch(error => {
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

    if (borrowedBooks[bookId]) {
      // 本がすでに貸出中の場合、20ポイント減点し、メッセージを表示
      setPoints(prev => prev - 20);
      displayMessage('この本はすでに貸出中です！');
      return;
    }

    if (bookId === requestedBook.id) {
      setPoints(prev => prev + 10);
      displayMessage('正しく貸し出せました。');  // 正しく貸出ができた場合のメッセージ
    } else {
      setPoints(prev => prev - 20);
      displayMessage('正しく貸し出せませんでした。');
    }

    const returnTime = Math.random() * 25000 + 5000;

    setBorrowedBooks(prev => ({ ...prev, [bookId]: true }));

    setTimeout(() => {
      setBorrowedBooks(prev => {
        const updatedBorrowedBooks = { ...prev };
        delete updatedBorrowedBooks[bookId];
        return updatedBorrowedBooks;
      });

      const returnedBookTitle = books.find(book => book.id === bookId)?.volumeInfo.title || '不明な本';
      setReturnNotifications(prev => [...prev, `${returnedBookTitle} が返却されました。`]);

      setTimeout(() => {
        setReturnNotifications(prev => prev.slice(1));
      }, 10000);

    }, returnTime);

    setRandomRequestedBook(books);
    setUsers(prev => prev + 1); // 次の利用者をセットするときにユーザー数を増やす
  };

  const handleCheckBorrowed = (bookId: string) => {
    if (borrowedBooks[bookId]) {
      setPoints(prev => prev + 10);
      displayMessage('この本は貸出中です！');
    } else {
      setPoints(prev => prev - 20);
      displayMessage('この本は貸出中ではありません。');
    }
    // 次の利用者をセット
    setRandomRequestedBook(books);
    setUsers(prev => prev + 1); // 次の利用者をセットするときにユーザー数を増やす
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
