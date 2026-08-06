"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Timer, Flag } from "lucide-react";
import WheelPicker from "@/components/common/WheelPicker";
import { useBooks } from "@/context/BookContext";
import { Book } from "./BookCard";

type Step = "start-page" | "timer" | "end-page";

interface StartReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onSessionSaved: (updatedBook: Book) => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export default function StartReadingModal({
  isOpen,
  onClose,
  book,
  onSessionSaved,
}: StartReadingModalProps) {
  const { recordSession } = useBooks();

  const [step, setStep] = useState<Step>("start-page");

  // Start page picker
  const startMin = Math.max(0, book.currentPage);
  const startMax = Math.max(0, book.totalPages - 1);
  const [startPage, setStartPage] = useState(startMin);

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // End page picker
  const endMin = startPage;
  const endMax = book.totalPages;
  const [endPage, setEndPage] = useState(Math.min(startPage + 1, book.totalPages));

  const [saving, setSaving] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("start-page");
      setElapsed(0);
      setIsPaused(false);
      const initStart = Math.max(0, book.currentPage);
      setStartPage(initStart);
      setEndPage(Math.min(initStart + 1, book.totalPages));
    }
  }, [isOpen, book.currentPage, book.totalPages]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Timer tick
  useEffect(() => {
    if (step === "timer" && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [step, isPaused]);

  const handleStartReading = () => {
    setElapsed(0);
    setIsPaused(false);
    setEndPage(Math.min(startPage + 1, book.totalPages));
    setStep("timer");
  };

  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
  };

  const handleStop = () => {
    setIsPaused(true);
    setEndPage(Math.min(startPage + 1, book.totalPages));
    setStep("end-page");
  };

  const handleSaveSession = async () => {
    setSaving(true);
    try {
      const updatedBook = await recordSession(book.id, {
        startPage,
        endPage,
        duration: elapsed,
      });
      if (updatedBook) {
        onSessionSaved(updatedBook as Book);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Blurred backdrop on top of the details modal */}
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={handleClose}
        />

        <div className="relative z-10 w-full max-w-sm">
          {/* ─── STEP 1: Start Page Picker ─── */}
          {step === "start-page" && (
            <div className="bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#3E2C23]/15 p-6 animate-fade-in">
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 text-[#6E5440]/60 hover:text-[#2C1D11] p-1.5 rounded-full hover:bg-[#3E2C23]/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📖</span>
                <h3 className="text-base font-serif font-bold text-[#2C1D11]">
                  Where are you starting from?
                </h3>
              </div>
              <p className="text-xs font-sans text-[#6E5440]/70 mb-4">
                Select the page number you&apos;re starting from
              </p>

              {/* Wheel Picker */}
              <div className="border border-[#3E2C23]/15 rounded-2xl bg-[#FAF7F2] overflow-hidden mb-4">
                <WheelPicker
                  min={startMin}
                  max={startMax}
                  value={startPage}
                  onChange={setStartPage}
                />
              </div>

              <p className="text-xs font-sans text-[#6E5440]/60 text-center mb-4">
                Total pages: {book.totalPages}
              </p>

              <button
                type="button"
                onClick={handleStartReading}
                className="w-full py-3 bg-[#3E2C23] hover:bg-[#2C1D11] text-[#F8F5F2] rounded-xl font-sans font-semibold text-sm transition-colors cursor-pointer shadow-sm"
              >
                ▶ Start Reading
              </button>
            </div>
          )}

          {/* ─── STEP 2: Live Timer ─── */}
          {step === "timer" && (
            <div className="bg-white rounded-2xl shadow-2xl border border-[#3E2C23]/10 p-8 animate-fade-in text-center">
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 text-[#6E5440]/60 hover:text-[#2C1D11] p-1.5 rounded-full hover:bg-[#3E2C23]/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 mb-2 text-[#6E5440]/80">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-sans font-medium">Reading Time</span>
              </div>

              {/* Digital timer display */}
              <div
                className="font-mono font-bold tracking-widest text-[#3E2C23] mb-2 leading-none"
                style={{ fontSize: "clamp(2.5rem, 10vw, 3.5rem)" }}
              >
                {formatTime(elapsed)}
              </div>

              <p className="text-xs font-sans text-[#6E5440]/60 mb-8">
                Page {startPage}
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={handlePauseResume}
                  className="flex items-center gap-2 px-6 py-3 bg-[#F0E6D8] hover:bg-[#EAD9C5] text-[#3E2C23] rounded-xl font-sans font-semibold text-sm transition-colors cursor-pointer border border-[#C4A890]/50"
                >
                  {isPaused ? (
                    <>▶ Resume</>
                  ) : (
                    <><span className="text-base font-bold leading-none">⏸</span> Pause</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleStop}
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#FFF5F5] text-[#3E2C23] rounded-xl font-sans font-semibold text-sm transition-colors cursor-pointer border border-[#C4A890]/50"
                >
                  <span className="w-3 h-3 bg-[#3E2C23] rounded-sm inline-block" />
                  Stop
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: End Page Picker ─── */}
          {step === "end-page" && (
            <div className="bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#3E2C23]/15 p-6 animate-fade-in">
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 text-[#6E5440]/60 hover:text-[#2C1D11] p-1.5 rounded-full hover:bg-[#3E2C23]/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <Flag className="w-5 h-5 text-[#3E2C23]" />
                <h3 className="text-base font-serif font-bold text-[#2C1D11]">
                  Great session!
                </h3>
              </div>
              <p className="text-xs font-sans text-[#6E5440]/70 mb-4">
                Select the last page you read
              </p>

              {/* End Page Wheel Picker */}
              <div className="border border-[#3E2C23]/15 rounded-2xl bg-[#FAF7F2] overflow-hidden mb-4">
                <WheelPicker
                  min={endMin}
                  max={endMax}
                  value={endPage}
                  onChange={setEndPage}
                />
              </div>

              <p className="text-xs font-sans text-[#6E5440]/60 text-center mb-4">
                Started from page {startPage} &bull; Total pages: {book.totalPages}
              </p>

              <button
                type="button"
                onClick={handleSaveSession}
                disabled={saving}
                className="w-full py-3 bg-[#3E2C23] hover:bg-[#2C1D11] text-[#F8F5F2] rounded-xl font-sans font-semibold text-sm transition-colors cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Session"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
