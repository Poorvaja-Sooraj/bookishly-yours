"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MoreVertical, Trash2, Star, StarHalf } from "lucide-react";
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
  rating?: number;
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
  const [imgError, setImgError] = useState(false);
  const { deleteBook } = useBooks();

  const handleDelete = async () => {
    await deleteBook(book.id);
    setMenuOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(book);
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`Book: ${book.title} by ${book.author}`}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col bg-[#FAF7F2] border border-[#3E2C23]/15 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E2C23]/40"
    >
      {/* Top right 3 dots action button & dropdown menu */}
      <div className="relative flex justify-end mb-1 z-20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className="text-[#6E5440]/70 hover:text-[#2C1D11] p-1.5 rounded-full hover:bg-[#3E2C23]/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E2C23]/40"
          aria-label={`Options for ${book.title}`}
        >
          <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Dropdown Menu Popup */}
        {menuOpen && (
          <>
            {/* Click outside backdrop */}
            <div
              className="fixed inset-0 z-30"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
              }}
            />

            <div className="absolute right-0 top-8 z-40 min-w-[140px] bg-[#FAF7F2] border border-[#3E2C23]/20 rounded-xl shadow-lg p-1 animate-fade-in space-y-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(book);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-sans font-medium text-[#2C1D11] hover:bg-[#F2E8DC] rounded-lg transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E2C23]/40"
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
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-sans font-medium text-[#A93226] hover:bg-[#FADBD8]/40 rounded-lg transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A93226]/40"
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
        className="relative w-full aspect-[2/3] max-h-[220px] sm:max-h-[260px] rounded-lg sm:rounded-xl overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-[1.02] flex flex-col items-center justify-center p-2.5 text-center cursor-pointer"
        onClick={() => onSelect?.(book)}
      >
        {book.coverImage && !imgError ? (
          <Image
            src={book.coverImage}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-between p-3 rounded-lg sm:rounded-xl text-center relative overflow-hidden border border-black/10"
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
              <p className="font-serif font-bold text-xs sm:text-sm leading-tight tracking-wide drop-shadow-xs">
                {book.title}
              </p>
              <p className="text-[10px] sm:text-xs font-sans mt-1.5 opacity-80 italic">
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
        className="mt-2 text-center flex flex-col items-center justify-center cursor-pointer"
        onClick={() => onSelect?.(book)}
      >
        <h3 className="font-serif font-bold text-xs sm:text-sm text-[#2C1D11] line-clamp-1 w-full" title={book.title}>
          {book.title}
        </h3>
        <p className="font-sans text-[11px] sm:text-xs text-[#6E5440]/80 mt-0.5 line-clamp-1 w-full" title={book.author}>
          {book.author}
        </p>
        {/* Star rating — only shown after user has submitted a rating */}
        {(book.rating ?? 0) > 0 && (
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((s) => {
              const r = book.rating ?? 0;
              if (s <= Math.floor(r)) {
                return <Star key={s} className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />;
              }
              if (s === Math.ceil(r) && r % 1 !== 0) {
                return (
                  <span key={s} className="relative w-3.5 h-3.5 inline-block">
                    <Star className="w-3.5 h-3.5 text-[#D5C9B8] absolute inset-0" />
                    <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                      <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                    </span>
                  </span>
                );
              }
              return <Star key={s} className="w-3.5 h-3.5 text-[#D5C9B8]" />;
            })}
            <span className="text-[10px] font-sans font-bold text-[#2C1D11] ml-0.5">
              {book.rating}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
