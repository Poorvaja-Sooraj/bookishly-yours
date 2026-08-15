"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Calendar,
  BookOpen,
  Globe,
  Clock,
  BarChart2,
  Trash2,
  ChevronDown,
  Play,
} from "lucide-react";
import { Book } from "@/lib/types/book";
import StartReadingModal from "./StartReadingModal";
import { useBooks } from "@/context/BookContext";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";
import ReadersAddedContent from "@/components/capsule/ReadersAddedContent";
import StarDisplay from "@/components/common/StarDisplay";
import RestartConfirmDialog from "./RestartConfirmDialog";

interface BookDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
}

import { formatDate, formatDuration } from "@/lib/format-utils";
import { ReadingStatus } from "@/lib/types/book";

function calcPagesPerHour(
  totalTimeSpent: number,
  pagesRead: number
): number {
  if (!totalTimeSpent || totalTimeSpent === 0) return 0;
  const hours = totalTimeSpent / 3600;
  return Math.round(pagesRead / hours);
}

function calcReadingPeriod(
  startedDate?: string | Date | null,
  finishedDate?: string | Date | null
): string {
  if (!startedDate) return "—";
  const start = new Date(startedDate).getTime();
  const end = finishedDate ? new Date(finishedDate).getTime() : new Date().getTime();
  if (isNaN(start) || isNaN(end)) return "—";
  const diffTime = Math.abs(end - start);
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  return `${diffDays} ${diffDays === 1 ? "day" : "days"}`;
}

function getProgressMessage(pct: number): string {
  if (pct === 0) return "Start your reading journey! 🌟";
  if (pct < 25) return "Great start! Keep going 📖";
  if (pct < 50) return "You're doing great! Keep it up ✨";
  if (pct < 75) return "Halfway there! Amazing progress 🚀";
  if (pct < 100) return "Almost done! The finish line is near 🏁";
  return "You finished it! Congratulations 🎉";
}

const STATUS_OPTIONS = ["Want to Read", "Currently Reading", "Completed"] as const;

const STATUS_DOT_COLOR: Record<ReadingStatus, string> = {
  "Want to Read": "#C4A890",
  "Currently Reading": "#4E8C6F",
  "Completed": "#4E3524",
};

// ─── Extraction Helpers ────────────────────────────────────────────────────────

function BookMetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-[#6E5440]/70">
        {icon} {label}
      </span>
      <span className="text-[#2C1D11] font-medium">
        {value}
      </span>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="bg-[#FAF7F2] rounded-xl border border-[#3E2C23]/10 p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-[#4E3524] mb-1">
        {icon}
      </div>
      <p className="text-base font-serif font-bold text-[#2C1D11]">
        {value}
      </p>
      <p className="text-[10px] font-sans text-[#6E5440]/70 mt-0.5">
        {label}
      </p>
    </div>
  );
}

interface DateFieldProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
}

function DateField({ label, value, hint }: DateFieldProps) {
  return (
    <div>
      <p className="text-sm font-serif font-semibold text-[#2C1D11] mb-2">
        {label}
      </p>
      <div className="flex items-center gap-1.5 text-[#2C1D11]">
        <Calendar className="w-4 h-4 text-[#6E5440]/70" />
        <span className="text-sm font-sans">
          {value}
        </span>
      </div>
      {hint && (
        <p className="text-[11px] font-sans text-[#6E5440]/60 mt-0.5">
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Circular Progress SVG ────────────────────────────────────────────────────

function CircularProgress({ pct }: { pct: number }) {
  const radius = 42;
  const stroke = 8;
  const norm = radius - stroke / 2;
  const circ = 2 * Math.PI * norm;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        {/* Background track */}
        <circle
          cx={50}
          cy={50}
          r={norm}
          fill="none"
          stroke="#EBE4D8"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx={50}
          cy={50}
          r={norm}
          fill="none"
          stroke="#3E2C23"
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-serif font-bold text-[#2C1D11] leading-none">
          {pct}%
        </p>
        <p className="text-[10px] font-sans text-[#6E5440]/70 mt-0.5">
          Completed
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function BookDetailsModal({
  isOpen,
  onClose,
  book: initialBook,
}: BookDetailsModalProps) {
  const { updateBook, deleteBook } = useBooks();

  // Local book state (keeps in sync when session is saved)
  const [book, setBook] = useState<Book>(initialBook);
  const [startReadingOpen, setStartReadingOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  // Sync local state if parent changes (e.g., edit saves or session recorded)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setBook(initialBook);
  }, [initialBook]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useScrollLock(isOpen, true);
  useEscapeKey(isOpen && !startReadingOpen && !showRestartConfirm, onClose);

  const pagesRead = book.currentPage ?? 0;
  const pagesLeft = Math.max(0, book.totalPages - pagesRead);
  const pct = book.totalPages > 0 ? Math.round((pagesRead / book.totalPages) * 100) : 0;
  const totalTimeSpent = book.totalTimeSpent ?? 0;
  const sessionsCount = book.sessionsCount ?? 0;
  const pagesPerHour = calcPagesPerHour(totalTimeSpent, pagesRead);
  const readingPeriod = calcReadingPeriod(book.startedDate, book.finishedDate);

  const [isRestarting, setIsRestarting] = useState(false);

  const handleStartReadingClick = () => {
    if (book.readingStatus === "Completed" || pagesRead >= book.totalPages) {
      setShowRestartConfirm(true);
    } else {
      setIsRestarting(false);
      setStartReadingOpen(true);
    }
  };

  const handleConfirmRestart = () => {
    setShowRestartConfirm(false);
    setIsRestarting(true);
    setStartReadingOpen(true);
  };

  const handleCancelRestart = () => {
    setShowRestartConfirm(false);
    setIsRestarting(false);
  };

  const handleSessionSaved = useCallback(
    (updatedBook: Book) => {
      setBook(updatedBook);
    },
    []
  );

  const handleStatusChange = async (newStatus: ReadingStatus) => {
    setUpdatingStatus(true);
    setStatusDropdownOpen(false);
    const updated: Omit<Book, "id"> = {
      ...book,
      readingStatus: newStatus,
      finishedDate:
        newStatus === "Completed" && !book.finishedDate
          ? new Date()
          : book.finishedDate,
    };
    await updateBook(book.id, updated);
    setBook((prev) => ({
      ...prev,
      readingStatus: newStatus,
      finishedDate: updated.finishedDate,
    }));
    setUpdatingStatus(false);
  };

  const handleRemoveFromShelf = async () => {
    await deleteBook(book.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main backdrop — overflow-hidden keeps background page locked */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <div
          className="fixed inset-0 bg-[#17110C]/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal card — scroll is contained inside the card only */}
        <div className="relative z-10 w-full max-w-3xl bg-[#FAF7F2] rounded-2xl sm:rounded-3xl border border-[#3E2C23]/15 shadow-2xl overflow-hidden animate-fade-in max-h-[92vh] flex flex-col my-auto">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-[#6E5440]/60 hover:text-[#2C1D11] p-2 rounded-full hover:bg-[#3E2C23]/10 transition-colors cursor-pointer"
            aria-label="Close book details"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row overflow-y-auto md:overflow-hidden flex-1 min-h-0">
            {/* ── LEFT PANEL ── */}
            <div className="md:w-[280px] shrink-0 flex flex-col items-center pt-8 pb-6 px-6 border-b md:border-b-0 md:border-r border-[#3E2C23]/10 bg-[#FAF7F2] md:overflow-y-auto">
              {/* Book Cover */}
              <div className="w-[155px] h-[230px] rounded-xl overflow-hidden shadow-lg mb-5 shrink-0">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    width={155}
                    height={230}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center p-3 text-center"
                    style={{ backgroundColor: "#3E2C23", color: "#FAF7F2" }}
                  >
                    <p className="font-serif font-bold text-sm leading-tight">
                      {book.title}
                    </p>
                    <p className="text-[10px] font-sans mt-2 opacity-80 italic">
                      {book.author}
                    </p>
                  </div>
                )}
              </div>

              {/* Title & Author */}
              <h2 className="text-xl font-serif font-bold text-[#2C1D11] text-center leading-tight mb-1">
                {book.title}
              </h2>
              <p className="text-sm font-sans text-[#6E5440] text-center mb-3">
                {book.author}
              </p>

              {/* Genre badges */}
              <div className="flex flex-wrap gap-1.5 justify-center mb-5">
                {book.genre.split(",").map((g) => (
                  <span
                    key={g.trim()}
                    className="px-3 py-1 bg-[#EDE5D8] text-[#4E3524] text-[11px] font-sans font-medium rounded-full border border-[#C4A890]/50"
                  >
                    {g.trim()}
                  </span>
                ))}
              </div>

              {/* Star rating — only visible after user has submitted a rating */}
              {(book.rating ?? 0) > 0 && (
                <div className="flex items-center gap-1 mb-5">
                  <StarDisplay
                    rating={book.rating ?? 0}
                    size="w-4 h-4"
                    showNumeric
                    numericSize="text-xs"
                  />
                  <span className="text-xs font-sans font-bold text-[#2C1D11]">
                    /5
                  </span>
                </div>
              )}

              {/* Start Reading button */}
              <button
                type="button"
                onClick={handleStartReadingClick}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#3E2C23] hover:bg-[#2C1D11] text-[#F8F5F2] rounded-xl font-sans font-semibold text-sm transition-colors cursor-pointer shadow-sm mb-6"
              >
                <Play className="w-4 h-4 fill-[#F8F5F2]" />
                Start Reading
              </button>

              {/* Book Meta Info */}
              <div className="w-full space-y-3 text-xs font-sans border-t border-[#3E2C23]/10 pt-4">
                {/* Status with dropdown */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#6E5440]/70">
                    <Clock className="w-3.5 h-3.5" /> Status
                  </span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setStatusDropdownOpen((p) => !p)}
                      disabled={updatingStatus}
                      className="flex items-center gap-1 text-[#2C1D11] font-medium cursor-pointer hover:text-[#4E3524] transition-colors disabled:opacity-60"
                    >
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{
                          backgroundColor:
                            STATUS_DOT_COLOR[
                            book.readingStatus as ReadingStatus
                            ] ?? "#C4A890",
                        }}
                      />
                      {book.readingStatus}
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    </button>

                    {statusDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setStatusDropdownOpen(false)}
                        />
                        <div className="absolute right-0 top-6 z-40 min-w-[160px] bg-[#FAF7F2] border border-[#3E2C23]/20 rounded-xl shadow-lg p-1 animate-fade-in">
                          {STATUS_OPTIONS.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleStatusChange(s)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-sans font-medium text-[#2C1D11] hover:bg-[#F2E8DC] rounded-lg transition-colors cursor-pointer text-left"
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: STATUS_DOT_COLOR[s] }}
                              />
                              {s}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Added on */}
                <BookMetaRow
                  icon={<Calendar className="w-3.5 h-3.5" />}
                  label="Added on"
                  value={formatDate(book.createdAt)}
                />

                {/* Pages */}
                <BookMetaRow
                  icon={<BookOpen className="w-3.5 h-3.5" />}
                  label="Pages"
                  value={`${book.totalPages} pages.`}
                />

                {/* Language */}
                <BookMetaRow
                  icon={<Globe className="w-3.5 h-3.5" />}
                  label="Language"
                  value={book.language ?? "English"}
                />
              </div>

              {/* Remove from shelf */}
              <button
                type="button"
                onClick={handleRemoveFromShelf}
                className="mt-6 flex items-center gap-1.5 text-[#A93226] hover:text-[#8B1F19] text-xs font-sans font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove from Shelf
              </button>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 p-5 md:p-6 space-y-4 md:overflow-y-auto">
              {/* Reading Progress Card */}
              <div className="bg-[#F5EFE6]/60 rounded-2xl border border-[#3E2C23]/10 p-5">
                <h3 className="text-lg font-serif font-bold text-[#2C1D11] mb-4">
                  Reading Progress
                </h3>

                {/* Stats row */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  {/* Pages read */}
                  <div className="text-center">
                    <p className="text-2xl font-serif font-bold text-[#2C1D11]">
                      {pagesRead}
                    </p>
                    <p className="text-[11px] font-sans text-[#6E5440]/70 mt-0.5">
                      Pages read
                    </p>
                  </div>

                  {/* Circular donut */}
                  <CircularProgress pct={pct} />

                  {/* Pages left */}
                  <div className="text-center">
                    <p className="text-2xl font-serif font-bold text-[#2C1D11]">
                      {pagesLeft}
                    </p>
                    <p className="text-[11px] font-sans text-[#6E5440]/70 mt-0.5">
                      Pages left
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-[#EBE4D8] overflow-hidden mb-3">
                  <div
                    className="h-full bg-[#3E2C23] rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className="text-xs font-sans text-[#6E5440]/80 italic">
                  {getProgressMessage(pct)}
                </p>
              </div>

              {/* Reader's Added Content Section */}
              <ReadersAddedContent bookId={book.id} />

              {/* Reading Statistics Card */}
              <div className="bg-[#F5EFE6]/60 rounded-2xl border border-[#3E2C23]/10 p-5">
                <h3 className="text-lg font-serif font-bold text-[#2C1D11] mb-4">
                  Reading Statistics
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Total Time */}
                  <StatCard
                    icon={<Clock className="w-3.5 h-3.5" />}
                    value={formatDuration(totalTimeSpent)}
                    label="Total Time"
                  />

                  {/* Sessions */}
                  <StatCard
                    icon={<BookOpen className="w-3.5 h-3.5" />}
                    value={sessionsCount}
                    label="Sessions"
                  />

                  {/* Pages/Hour */}
                  <StatCard
                    icon={<BarChart2 className="w-3.5 h-3.5 rotate-90" />}
                    value={pagesPerHour}
                    label="Pages/Hour"
                  />

                  {/* Reading Period */}
                  <StatCard
                    icon={<Calendar className="w-3.5 h-3.5" />}
                    value={readingPeriod}
                    label="Reading Period"
                  />
                </div>
              </div>

              {/* Started / Finish Date Card */}
              <div className="bg-[#F5EFE6]/60 rounded-2xl border border-[#3E2C23]/10 p-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Started Date */}
                  <DateField
                    label="Started Date"
                    value={formatDate(book.startedDate)}
                  />

                  {/* Finish Date */}
                  <DateField
                    label="Finish Date"
                    value={book.finishedDate ? formatDate(book.finishedDate) : "—"}
                    hint={!book.finishedDate ? "Not finished yet" : undefined}
                  />
                </div>
              </div>

              {/* Footer hint */}
              <p className="text-[11px] font-sans text-[#6E5440]/50 text-center">
                ℹ️ Start reading and stop the timer after your session to update your progress.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Restart Confirmation Dialog Modal */}
      <RestartConfirmDialog
        isOpen={showRestartConfirm}
        onCancel={handleCancelRestart}
        onConfirm={handleConfirmRestart}
      />

      {/* Start Reading multi-step modal (stacks above the details modal) */}
      <StartReadingModal
        isOpen={startReadingOpen}
        onClose={() => {
          setStartReadingOpen(false);
          setIsRestarting(false);
        }}
        book={book}
        isRestarting={isRestarting}
        onSessionSaved={handleSessionSaved}
      />
    </>
  );
}
