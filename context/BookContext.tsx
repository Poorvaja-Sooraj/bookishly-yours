"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { Book } from "@/components/all-books/BookCard";

interface RecordSessionData {
  startPage: number;
  endPage: number;
  duration: number; // seconds
}

interface BookContextType {
  books: Book[];
  loading: boolean;
  fetchBooks: () => Promise<void>;
  addBook: (book: Omit<Book, "id">) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  updateBook: (
    id: string,
    updatedBook: Omit<Book, "id">
  ) => Promise<void>;
  recordSession: (
    bookId: string,
    sessionData: RecordSessionData
  ) => Promise<Book | void>;
  stats: {
    total: number;
    completed: number;
    currentlyReading: number;
    wantToRead: number;
  };
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/books");
      const data = await response.json();

      if (data.success) {
        setBooks(data.books);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const deleteBook = async (id: string) => {
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        await fetchBooks();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateBook = async (
    id: string,
    updatedBook: Omit<Book, "id">
  ) => {
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBook),
      });

      const data = await response.json();

      if (data.success) {
        await fetchBooks();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addBook = async (newBookData: Omit<Book, "id">) => {
    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBookData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchBooks();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const recordSession = async (
    bookId: string,
    sessionData: RecordSessionData
  ): Promise<Book | void> => {
    try {
      const response = await fetch(`/api/books/${bookId}/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh global book list
        await fetchBooks();
        // Return updated book for immediate local state sync
        return data.book as Book;
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const stats = useMemo(() => {
    const total = books.length;
    const completed = books.filter((b) => b.readingStatus === "Completed").length;
    const currentlyReading = books.filter(
      (b) => b.readingStatus === "Currently Reading"
    ).length;
    const wantToRead = books.filter((b) => b.readingStatus === "Want to Read").length;

    return { total, completed, currentlyReading, wantToRead };
  }, [books]);

  return (
    <BookContext.Provider
      value={{
        books,
        loading,
        fetchBooks,
        addBook,
        deleteBook,
        updateBook,
        recordSession,
        stats,
      }}
    >
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBooks must be used within a BookProvider");
  }
  return context;
}
