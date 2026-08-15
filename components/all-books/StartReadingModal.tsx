"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Timer, Flag } from "lucide-react";
import WheelPicker from "@/components/common/WheelPicker";
import { useBooks } from "@/context/BookContext";
import { Book } from "./BookCard";
import AddToCapsuleModal from "@/components/capsule/AddToCapsuleModal";
import FinishBookModal from "@/components/all-books/FinishBookModal";

type Step = "start-page" | "timer" | "end-page";

interface StartReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onSessionSaved: (updatedBook: Book) => void;
  isRestarting?: boolean;
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
  isRestarting = false,
}: StartReadingModalProps) {
  const { recordSession } = useBooks();

  const [step, setStep] = useState<Step>("start-page");

  // Start page picker
  const startMin = isRestarting ? 0 : Math.max(0, book.currentPage);
  const startMax = Math.max(startMin, book.totalPages - 1);
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
  const [isCapsuleModalOpen, setIsCapsuleModalOpen] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [finishModalBook, setFinishModalBook] = useState<Book | null>(null);
  const wasRunningRef = useRef(false);
  const prevIsOpenRef = useRef(false);

  // Reset when modal transitions from closed to open
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setElapsed(0);
      setIsPaused(false);
      setIsCapsuleModalOpen(false);
      setShowCloseConfirm(false);
      setFinishModalBook(null);
      wasRunningRef.current = false;
      const initStart = isRestarting ? 0 : Math.max(0, book.currentPage);
      setStartPage(initStart);
      setEndPage(Math.min(initStart + 1, book.totalPages));

      // Show start-page picker if restarting or if starting page is before the end
      if (isRestarting || initStart < book.totalPages) {
        setStep("start-page");
      } else {
        setStartPage(book.totalPages);
        setStep("timer");
      }
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    prevIsOpenRef.current = isOpen;
  }, [isOpen, book.currentPage, book.totalPages, isRestarting]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Triggered when user clicks Close (X) button or backdrop
  const handleCloseClick = useCallback(() => {
    if (step === "start-page") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      onClose();
    } else {
      setIsPaused(true);
      setShowCloseConfirm(true);
    }
  }, [step, onClose]);

  // Handle Escape key press to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showCloseConfirm && !isCapsuleModalOpen && !finishModalBook) {
        handleCloseClick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showCloseConfirm, isCapsuleModalOpen, finishModalBook, handleCloseClick]);

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

  const handleOpenCapsuleFromTimer = () => {
    if (!isPaused && step === "timer") {
      wasRunningRef.current = true;
      setIsPaused(true); // Automatically pause timer first
    } else {
      wasRunningRef.current = false;
    }
    setIsCapsuleModalOpen(true);
  };

  const handleCloseCapsuleModal = () => {
    setIsCapsuleModalOpen(false);
    // If timer was running before opening capsule, resume automatically
    if (wasRunningRef.current && step === "timer") {
      setIsPaused(false);
      wasRunningRef.current = false;
    }
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
        const b = updatedBook as Book;
        onSessionSaved(b);
        if (b.readingStatus === "Completed" || b.currentPage >= b.totalPages) {
          setFinishModalBook(b);
          return;
        }
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // User selects "Yes" in confirmation dialog
  const handleConfirmSave = async () => {
    setShowCloseConfirm(false);
    await handleSaveSession();
  };

  // User selects "No" in confirmation dialog
  const handleConfirmDiscard = () => {
    setShowCloseConfirm(false);
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
          onClick={handleCloseClick}
        />

        <div className="relative z-10 w-full max-w-sm">
          {/* ─── STEP 1: Start Page Picker ─── */}
          {step === "start-page" && (
            <div className="bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#3E2C23]/15 p-6 animate-fade-in">
              <button
                type="button"
                onClick={handleCloseClick}
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
                onClick={handleCloseClick}
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

              <div className="flex gap-3 justify-center mb-3">
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

              {/* Add Capsule Button */}
              <button
                type="button"
                onClick={handleOpenCapsuleFromTimer}
                className="w-full py-3 bg-[#3E2C23] hover:bg-[#2C1D11] text-[#FAF7F2] rounded-xl font-sans font-semibold text-sm transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <span>✨ Add Capsule</span>
              </button>
            </div>
          )}

          {/* ─── STEP 3: End Page Picker ─── */}
          {step === "end-page" && (
            <div className="bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#3E2C23]/15 p-6 animate-fade-in">
              <button
                type="button"
                onClick={handleCloseClick}
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
                {saving
                  ? "Saving..."
                  : endPage >= book.totalPages
                    ? "Finish Book 🎉"
                    : "Save Session"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog on Close */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowCloseConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-[#FAF7F2] rounded-2xl border border-[#3E2C23]/20 shadow-2xl p-6 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-[#F5EFE6] border border-[#3E2C23]/15 flex items-center justify-center mx-auto mb-3 text-2xl">
              ⏱️
            </div>
            <h3 className="text-lg font-serif font-bold text-[#2C1D11] mb-2">
              Save Reading Session?
            </h3>
            <p className="text-xs font-sans text-[#6E5440]/80 leading-relaxed mb-6">
              Would you like to save your reading progress for this session before closing?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="flex-1 py-2.5 bg-[#EBE4D8] hover:bg-[#E0D5C5] text-[#3E2C23] border border-[#3E2C23]/15 rounded-xl font-sans font-medium text-xs transition-colors cursor-pointer"
              >
                No, Discard
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="flex-1 py-2.5 bg-[#3E2C23] hover:bg-[#2C1D11] text-[#F8F5F2] rounded-xl font-sans font-semibold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Book Capsule modal */}
      <AddToCapsuleModal
        isOpen={isCapsuleModalOpen}
        onClose={handleCloseCapsuleModal}
        bookId={book.id}
      />

      {/* Finish Book Modal when book is completed */}
      {finishModalBook && (
        <FinishBookModal
          isOpen={!!finishModalBook}
          onClose={() => {
            setFinishModalBook(null);
            onClose();
          }}
          book={finishModalBook}
          onFinished={(updatedB) => {
            onSessionSaved(updatedB);
          }}
        />
      )}
    </>
  );
}
