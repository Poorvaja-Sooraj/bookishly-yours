"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, Search, BookOpen } from "lucide-react";
import BookGrid from "./BookGrid";
import { Book } from "./BookCard";
import AddBookModal from "./AddBookModal";
import BookDetailsModal from "./BookDetailsModal";
import { useBooks } from "@/context/BookContext";

interface BooksPageContainerProps {
  pageTitle: string;
  filterStatus?: "Completed" | "Currently Reading" | "Want to Read";
}

export default function BooksPageContainer({
  pageTitle,
  filterStatus,
}: BooksPageContainerProps) {
  const { books } = useBooks();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [mode, setMode] = useState<"add" | "edit">("add");

  // Book Details modal state
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>(undefined);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Always derive selectedBook live from the context books array so progress
  // reflects backend updates immediately after a session is saved
  const selectedBook = useMemo(
    () => books.find((b) => b.id === selectedBookId),
    [books, selectedBookId]
  );

  // Lock body scroll whenever any modal is open
  useEffect(() => {
    const anyOpen = isAddBookOpen || isDetailsOpen;
    if (anyOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAddBookOpen, isDetailsOpen]);

  // 1. Filter books by category status if provided
  const categoryBooks = useMemo(() => {
    if (!filterStatus) return books;
    return books.filter((b) => b.readingStatus === filterStatus);
  }, [books, filterStatus]);

  // 2. Real-time case-insensitive search by Book Name, Author Name & Genre from first character typed
  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categoryBooks;

    return categoryBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        (book.genre && book.genre.toLowerCase().includes(query))
    );
  }, [categoryBooks, searchQuery]);

  const handleSelectBook = (book: Book) => {
    setSelectedBookId(book.id);
    setIsDetailsOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col space-y-4 sm:space-y-5 select-none">
      {/* Page Header Section: Title, Real-Time Search Bar, and + Add Book Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-[#3E2C23]/10 pb-3">
        {/* Page Title */}
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2C1D11]">
          {pageTitle}
        </h2>

        {/* Right Section: Real-time Search Input & + Add Book Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Real-time Search Bar */}
          <div className="relative flex-1 sm:w-64 md:w-72">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E5440]/60 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, authors, or genres..."
              className="w-full h-10 pl-9 pr-4 bg-[#FAF7F2] border border-[#3E2C23]/20 rounded-xl text-xs sm:text-sm font-sans text-[#2C1D11] placeholder:text-[#6E5440]/60 focus:outline-none focus:ring-2 focus:ring-[#4E3524]/20 focus:border-[#4E3524] transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E5440]/60 hover:text-[#2C1D11] text-xs cursor-pointer"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* + Add Book Button */}
          <button
            type="button"
            onClick={() => {
              setMode("add");
              setEditingBook(undefined);
              setIsAddBookOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2 bg-[#3E2C23] text-[#F8F5F2] rounded-xl text-xs sm:text-sm font-sans font-medium shadow-xs hover:bg-[#2C1D11] hover:shadow-md transition-all duration-200 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Book</span>
          </button>
        </div>
      </div>

      {/* Book Cards Grid or Empty State */}
      {filteredBooks.length > 0 ? (
        <BookGrid
          books={filteredBooks}
          onEdit={(book) => {
            setMode("edit");
            setEditingBook(book);
            setIsAddBookOpen(true);
          }}
          onSelect={handleSelectBook}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-[#FAF7F2] border border-[#3E2C23]/15 rounded-2xl p-8">
          <div className="w-16 h-16 rounded-full bg-[#EBE4D8]/80 border border-[#3E2C23]/15 flex items-center justify-center mb-3">
            <BookOpen className="w-8 h-8 text-[#4E3524]" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-[#2C1D11]">
            {searchQuery
              ? `No books found matching "${searchQuery}"`
              : `No ${pageTitle.toLowerCase()} in your collection`}
          </h3>
          <p className="text-sm font-sans text-[#6E5440]/80 mt-1 max-w-sm">
            {searchQuery
              ? "Try searching with a different book title, author name, or genre."
              : "Click the Add Book button above to add a new book."}
          </p>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => {
          setIsAddBookOpen(false);
          setEditingBook(undefined);
          setMode("add");
        }}
        defaultStatus={
          filterStatus === "Completed" ||
            filterStatus === "Currently Reading" ||
            filterStatus === "Want to Read"
            ? filterStatus
            : undefined
        }
        mode={mode}
        book={editingBook}
      />

      {/* Book Details Modal */}
      {selectedBook && isDetailsOpen && (
        <BookDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedBookId(undefined);
          }}
          book={selectedBook}
        />
      )}
    </div>
  );
}
