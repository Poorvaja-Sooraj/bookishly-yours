import React from "react";
import BookCard from "./BookCard";
import { Book } from "@/lib/types/book";

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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pb-6">
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
