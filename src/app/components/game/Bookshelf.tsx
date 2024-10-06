import Book from "./Book";


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
    <div className="flex gap-4 overflow-x-scroll hidden-scrollbar justify-end h-fit w-fit">
      {books.map((book) => (
        <Book
          key={book.id}
          id={book.id}
          title={book.volumeInfo.title}
          isBorrowed={false} // ここは借用状態を反映するように設定する必要があります
          onLendBook={onLendBook}
          onCheckBorrowed={onCheckBorrowed}
        />
      ))}
    </div>
  );
};

export default Bookshelf;
