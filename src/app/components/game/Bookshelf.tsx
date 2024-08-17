import React from 'react';
import Book from './Book';

interface Book {
  id: string;
  volumeInfo: {
    title: string;
  };
}

interface BookshelfProps {
  books: Book[];
  onLendBook: (bookId: string) => void;
  onCheckBorrowed: (bookId: string) => void;
}

const Bookshelf: React.FC<BookshelfProps> = ({ books, onLendBook, onCheckBorrowed }) => {
  return (
    <div>
      <div className="flex gap-4 overflow-x-scroll">
        {books.length > 0 ? (
          books.map((book) => (
            <Book
              key={book.id}
              id={book.id}
              title={book.volumeInfo.title}
              isBorrowed={false} // ここは借用状態を反映するように設定する必要があります
              onLendBook={onLendBook}
              onCheckBorrowed={onCheckBorrowed}
            />
          ))
        ) : (
          <p>Loading books...</p> // 書籍データがロードされるまでの代替表示
        )}
      </div>
    </div>
  );
};

export default Bookshelf;
