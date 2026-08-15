"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, Trophy, Sparkles, X, ArrowRight } from "lucide-react";
import { Book } from "@/lib/types/book";
import { useBooks } from "@/context/BookContext";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";

interface FinishBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onFinished?: (updatedBook: Book) => void;
}

import { formatDate, formatDuration } from "@/lib/format-utils";
import StarDisplay from "@/components/common/StarDisplay";

export default function FinishBookModal({
  isOpen,
  onClose,
  book,
  onFinished,
}: FinishBookModalProps) {
  const { fetchBooks } = useBooks();
  const [step, setStep] = useState<"rating" | "summary">("rating");
  const [rating, setRating] = useState<number>(book.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [updatedBook, setUpdatedBook] = useState<Book | null>(null);

  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const handleFinishBook = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/books/${book.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
        }),
      });

      const data = await res.json();
      if (data.success && data.book) {
        setUpdatedBook(data.book);
        if (onFinished) onFinished(data.book);
        await fetchBooks();
        setStep("summary");
      }
    } catch (err) {
      console.error("Failed to save book rating:", err);
    } finally {
      setSaving(false);
    }
  };

  /** Compute rating value from mouse position within a star's bounding box */
  const handleStarClick = (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    setRating(isLeftHalf ? starIndex - 0.5 : starIndex);
  };

  const handleStarHover = (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    setHoverRating(isLeftHalf ? starIndex - 0.5 : starIndex);
  };

  const displayRating = hoverRating || rating;
  const displayBook = updatedBook || book;

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={step === "summary" ? onClose : undefined}
      />

      <div className="relative z-10 w-full max-w-lg bg-[#FAF7F2] rounded-3xl border border-[#3E2C23]/20 shadow-2xl overflow-hidden animate-fade-in">
        {/* Step 1: Rating */}
        {step === "rating" && (
          <div className="p-6 sm:p-8 text-center">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 text-[#6E5440]/60 hover:text-[#2C1D11] p-1.5 rounded-full hover:bg-[#3E2C23]/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-[#F5E8C7] border border-[#E4D1A0] flex items-center justify-center mx-auto mb-4 text-[#3E2C23] shadow-sm">
              <Trophy className="w-8 h-8 text-[#B8860B]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5EFE6] border border-[#3E2C23]/15 rounded-full text-xs font-sans font-semibold text-[#3E2C23] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
              <span>Book Completed!</span>
            </div>

            <h2 className="text-2xl font-serif font-bold text-[#2C1D11] mb-1">
              Congratulations!
            </h2>
            <p className="text-xs font-sans text-[#6E5440]/80 mb-6 max-w-xs mx-auto">
              You finished reading <span className="font-semibold text-[#2C1D11]">&quot;{book.title}&quot;</span>. How would you rate this book?
            </p>

            {/* Half-Star Rating Picker */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= Math.floor(displayRating);
                const halfFilled = !filled && star === Math.ceil(displayRating) && displayRating % 1 !== 0;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseMove={(e) => handleStarHover(star, e)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={(e) => handleStarClick(star, e)}
                    className="p-1.5 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    {filled ? (
                      <Star className="w-9 h-9 fill-[#F5A623] text-[#F5A623] drop-shadow-xs" />
                    ) : halfFilled ? (
                      <span className="relative w-9 h-9 inline-block">
                        <Star className="w-9 h-9 text-[#D5C9B8] absolute inset-0" />
                        <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                          <Star className="w-9 h-9 fill-[#F5A623] text-[#F5A623] drop-shadow-xs" />
                        </span>
                      </span>
                    ) : (
                      <Star className="w-9 h-9 text-[#D5C9B8] hover:text-[#C4B39C] transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Current rating label */}
            <p className="text-sm font-sans font-semibold text-[#3E2C23] mb-8">
              {displayRating > 0 ? `${displayRating} / 5` : "Tap a star to rate"}
            </p>

            <button
              type="button"
              onClick={handleFinishBook}
              disabled={saving}
              className="w-full py-3.5 bg-[#3E2C23] hover:bg-[#2C1D11] text-[#F8F5F2] rounded-2xl font-sans font-semibold text-sm transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{saving ? "Saving..." : "Finish Book"}</span>
              {!saving && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Step 2: Book Completed Celebration Summary Screen */}
        {step === "summary" && (
          <div className="p-6 sm:p-8 text-center max-h-[85vh] overflow-y-auto">
            {/* Header Sparkles */}
            <div className="w-16 h-16 rounded-full bg-[#F5E8C7] border border-[#E4D1A0] flex items-center justify-center mx-auto mb-3 text-3xl shadow-sm animate-bounce">
              🎉
            </div>

            <h2 className="text-2xl font-serif font-bold text-[#2C1D11] mb-1">
              Book Completed!
            </h2>
            <p className="text-xs font-sans text-[#6E5440]/80 mb-6">
              Saved permanently in your Bookish Capsule
            </p>

            {/* Book Info Card */}
            <div className="bg-[#F5EFE6] border border-[#3E2C23]/15 rounded-2xl p-4 mb-5 flex items-center gap-4 text-left">
              {displayBook.coverImage ? (
                <div className="relative w-16 h-24 rounded-lg overflow-hidden border border-[#3E2C23]/15 shrink-0">
                  <Image
                    src={displayBook.coverImage}
                    alt={displayBook.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-24 rounded-lg bg-[#3E2C23] text-[#FAF7F2] flex items-center justify-center text-center p-1.5 shrink-0">
                  <span className="font-serif text-[10px] font-bold leading-tight">
                    {displayBook.title}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-bold text-base text-[#2C1D11] truncate">
                  {displayBook.title}
                </h3>
                <p className="text-xs font-sans text-[#6E5440]/80 mb-2 truncate">
                  by {displayBook.author}
                </p>

                {/* Rating stars display — supports half stars */}
                <div className="flex items-center gap-1">
                  <StarDisplay rating={displayBook.rating || rating} size="w-4 h-4" showNumeric numericSize="text-xs" />
                  <span className="text-xs font-sans font-bold text-[#2C1D11]">
                    /5
                  </span>
                </div>
              </div>
            </div>

            {/* Reading Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              <div className="bg-[#FAF7F2] border border-[#3E2C23]/10 rounded-xl p-3 text-center">
                <span className="text-[10px] font-sans text-[#6E5440]/70 uppercase block">Total Time</span>
                <span className="text-sm font-serif font-bold text-[#2C1D11]">
                  {formatDuration(displayBook.totalTimeSpent || 0)}
                </span>
              </div>
              <div className="bg-[#FAF7F2] border border-[#3E2C23]/10 rounded-xl p-3 text-center">
                <span className="text-[10px] font-sans text-[#6E5440]/70 uppercase block">Sessions</span>
                <span className="text-sm font-serif font-bold text-[#2C1D11]">
                  {displayBook.sessionsCount || 1}
                </span>
              </div>
              <div className="bg-[#FAF7F2] border border-[#3E2C23]/10 rounded-xl p-3 text-center">
                <span className="text-[10px] font-sans text-[#6E5440]/70 uppercase block">Pages</span>
                <span className="text-sm font-serif font-bold text-[#2C1D11]">
                  {displayBook.totalPages}
                </span>
              </div>
            </div>

            {/* Date Range */}
            <p className="text-xs font-sans text-[#6E5440]/80 mb-5 bg-[#F5EFE6]/60 py-2 px-3 rounded-xl border border-[#3E2C23]/10 inline-block">
              📅 Read from <span className="font-semibold text-[#2C1D11]">{formatDate(displayBook.startedDate, "N/A")}</span> to <span className="font-semibold text-[#2C1D11]">{formatDate(displayBook.finishedDate || new Date(), "N/A")}</span>
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 bg-[#3E2C23] hover:bg-[#2C1D11] text-[#F8F5F2] rounded-2xl font-sans font-semibold text-sm transition-colors cursor-pointer shadow-md"
            >
              Close &amp; View Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
