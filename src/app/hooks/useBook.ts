"use client";

import { useEffect, useState, useRef } from "react";
import { db, auth } from "../../lib/firebase/client";
import { collection, addDoc } from "firebase/firestore";
import { Book } from "@/../src/types/game"; // 共通の型をインポート
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

  const returnTimersRef = useRef<NodeJS.Timeout[]>([]); // 返却タイマーを管理するRef

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

  const fetchBooks = async () => {
    let allBooks: Book[] = [];
    const titleSet = new Set<string>();

    while (allBooks.length < 8) {
      const randomStartIndex = Math.floor(Math.random() * 400);
      console.log(randomStartIndex);
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=8&startIndex=${randomStartIndex}&orderBy=newest&langRestrict=ja`
      );
      const data = await response.json();

      const uniqueBooks = (data.items || []).filter((book: Book) => {
        const title = book.volumeInfo.title;
        if (!titleSet.has(title)) {
          titleSet.add(title);
          return true;
        }
        return false;
      });

      allBooks = [...allBooks, ...uniqueBooks];
      allBooks = allBooks.slice(0, 8); // 必要な8冊だけ残す
    }

    setBooks(allBooks);
    setRandomRequestedBook(allBooks);
    setUsers(1); // ゲームが開始されたときに最初のユーザーをセット
  };

  useEffect(() => {
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
        // 本がすでに貸出中の場合、20ポイント減点し、メッセージを表示
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

    const returnTimer = setTimeout(() => {
      setBorrowedBooks((prev) => {
        const updatedBorrowedBooks = { ...prev };
        delete updatedBorrowedBooks[bookId];
        return updatedBorrowedBooks;
      });

      const returnedBookTitle =
        books.find((book) => book.id === bookId)?.volumeInfo.title ||
        "不明な本";

      // 最新の返却通知をリストの先頭に追加
      setReturnNotifications((prev) => [
        `${returnedBookTitle} が返却されました。`,
        ...prev,
      ]);

      // 10秒後に返却通知を消す
      const notificationTimer = setTimeout(() => {
        setReturnNotifications((prev) => prev.slice(0, prev.length - 1)); // 最新の通知から削除
      }, 10000);

      returnTimersRef.current.push(notificationTimer);
    }, returnTime);

    returnTimersRef.current.push(returnTimer);

    setRandomRequestedBook(books);
    setUsers((prev) => prev + 1); // 次の利用者をセットするときにユーザー数を増やす
  };

  const handleCheckBorrowed = (bookId: string) => {
    // この関数の実装が必要です
    // 例えば、貸出中の本をチェックしてポイントを増減するロジックをここに追加します
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
    }

    setRandomRequestedBook(books);
    setUsers((prev) => prev + 1); // 次の利用者をセット
  };

  const clearAllTimers = () => {
    returnTimersRef.current.forEach(clearTimeout);
    returnTimersRef.current = [];
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

  const resetGame = () => {
    clearAllTimers(); // すべてのタイマーをクリア
    setPoints(0); // ポイントをリセット
    setUsers(0); // ユーザー数をリセット
    setBorrowedBooks({}); // 貸出中の本をリセット
    setReturnNotifications([]); // 返却通知をリセット
    fetchBooks(); // 本のフェッチをやり直す
  };

  const clearBorrowedBooks = () => {
    clearAllTimers(); // すべてのタイマーをクリア
    setBorrowedBooks({}); // 貸出中の本をリセット
    setReturnNotifications([]); // 返却通知をリセット
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
    handleCheckBorrowed, // handleCheckBorrowedを返す
    saveResultToFirestore,
    resetGame, // リセット関数を返す
    clearBorrowedBooks, // 貸出中の本をリセットする関数を返す
  };
};

export default useBooks;
