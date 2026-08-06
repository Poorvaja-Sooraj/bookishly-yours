"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MoreVertical, Trash2 } from "lucide-react";
import { useBooks } from "@/context/BookContext";

export interface ReadingSession {
  startPage: number;
  endPage: number;
  duration: number; // seconds
  createdAt: string | Date;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  genre: string;
  readingStatus: "Completed" | "Currently Reading" | "Want to Read";
  totalPages: number;
  currentPage: number;

  // Extended reading tracking fields
  language?: string;
  startedDate?: string | Date | null;
  finishedDate?: string | Date | null;
  totalTimeSpent?: number; // seconds
  sessionsCount?: number;
  sessions?: ReadingSession[];
  createdAt?: string | Date;

  // UI-only fields
  coverBg?: string;
  coverTextColor?: string;
  coverAccentColor?: string;
}

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onSelect?: (book: Book) => void;
}

export default function BookCard({
  book,
  onEdit,
  onSelect,
}: BookCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { deleteBook } = useBooks();

  const handleDelete = async () => {
    await deleteBook(book.id);
    setMenuOpen(false);
  };

  return (
    <div className="group relative flex flex-col bg-[#FAF7F2] border border-[#3E2C23]/15 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all duration-200 select-none">
      {/* Top right 3 dots action button & dropdown menu */}
      <div className="relative flex justify-end mb-2 z-20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className="text-[#6E5440]/70 hover:text-[#2C1D11] p-1.5 rounded-full hover:bg-[#3E2C23]/10 transition-colors cursor-pointer"
          aria-label={`Options for ${book.title}`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Dropdown Menu Popup */}
        {menuOpen && (
          <>
            {/* Click outside backdrop */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setMenuOpen(false)}
            />

            <div className="absolute right-0 top-8 z-40 min-w-[140px] bg-[#FAF7F2] border border-[#3E2C23]/20 rounded-xl shadow-lg p-1 animate-fade-in space-y-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(book);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-sans font-medium text-[#2C1D11] hover:bg-[#F2E8DC] rounded-lg transition-colors cursor-pointer text-left"
              >
                ✏️
                <span>Edit Book</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-sans font-medium text-[#A93226] hover:bg-[#FADBD8]/40 rounded-lg transition-colors cursor-pointer text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Book</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Book Cover Area — clickable to open details */}
      <div
        className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-[1.02] flex flex-col items-center justify-center p-3 text-center cursor-pointer"
        onClick={() => onSelect?.(book)}
      >
        {book.coverImage ? (
          <Image
            src={book.coverImage}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-between p-3.5 rounded-xl text-center relative overflow-hidden border border-black/10"
            style={{ backgroundColor: book.coverBg || "#3E2C23", color: book.coverTextColor || "#FAF7F2" }}
          >
            {/* Subtle cover texture overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20 pointer-events-none" />

            {/* Top decorative accent */}
            <div
              className="w-8 h-1 rounded-full opacity-60 my-1"
              style={{ backgroundColor: book.coverAccentColor || "#FAF7F2" }}
            />

            {/* Book Cover Title & Author Text */}
            <div className="my-auto relative z-10 px-1">
              <p className="font-serif font-bold text-sm sm:text-base leading-tight tracking-wide drop-shadow-xs">
                {book.title}
              </p>
              <p className="text-[10px] sm:text-xs font-sans mt-2 opacity-80 italic">
                {book.author}
              </p>
            </div>

            {/* Bottom decorative accent */}
            <div
              className="w-12 h-0.5 rounded-full opacity-40 mb-1"
              style={{ backgroundColor: book.coverAccentColor || "#FAF7F2" }}
            />
          </div>
        )}
      </div>

      {/* Below Cover Text — also clickable */}
      <div
        className="mt-3.5 text-center flex flex-col items-center justify-center cursor-pointer"
        onClick={() => onSelect?.(book)}
      >
        <h3 className="font-serif font-bold text-sm sm:text-base text-[#2C1D11] line-clamp-1 w-full" title={book.title}>
          {book.title}
        </h3>
        <p className="font-sans text-xs sm:text-sm text-[#6E5440]/80 mt-0.5 line-clamp-1 w-full" title={book.author}>
          {book.author}
        </p>
      </div>
    </div>
  );
}
