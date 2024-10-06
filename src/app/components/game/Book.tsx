'use client'

import React from 'react';

interface BookProps {
  id: string;
  title: string;
  isBorrowed: boolean;
  onLendBook: (bookId: string) => void;
  onCheckBorrowed: (bookId: string) => void;
}

const Book: React.FC<BookProps> = ({ id, title, isBorrowed, onLendBook, onCheckBorrowed }) => {
  return (
    <div className="p-4 pl-3 h-[700px] rounded bg-[url('../../public/image/gamebooks.png')] bg-contain bg-no-repeat text-white flex flex-col items-center py-20">
      <style jsx>{`
        .writing-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
      <h2 className="text-lg font-semibold writing-vertical flex-grow">{title}</h2>
      <div className="mt-2 flex flex-col items-center justify-end flex-grow">
        <button
          onClick={() => onLendBook(id)}
          className={`py-1 w-14 mb-2 rounded text-white ${isBorrowed ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500'}`}
          disabled={isBorrowed}
        >
          貸出
        </button>
        <button
          onClick={() => onCheckBorrowed(id)}
          className="py-1 w-14 rounded bg-red-500 text-white"
        >
          貸出中
        </button>
      </div>
    </div>
  );
};

export default Book;
