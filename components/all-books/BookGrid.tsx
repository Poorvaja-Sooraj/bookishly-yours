import React from "react";
import BookCard, { Book } from "./BookCard";

interface BookGridProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onSelect: (book: Book) => void;
}

export default function BookGrid({
  books,
  onEdit,
  onSelect,
}: BookGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 pb-8">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onEdit={onEdit}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
