"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  User,
  Tag,
  FileText,
  Bookmark,
  ChevronDown,
  Library,
} from "lucide-react";
import { useBooks } from "@/context/BookContext";
import { Book } from "./BookCard";
import Image from "next/image";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: "Completed" | "Currently Reading" | "Want to Read";

  mode?: "add" | "edit";
  book?: Book;
}

export default function AddBookModal({
  isOpen,
  onClose,
  defaultStatus,
  mode = "add",
  book,
}: AddBookModalProps) {
  const { addBook, updateBook } = useBooks();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [readingStatus, setReadingStatus] = useState<
    "Completed" | "Currently Reading" | "Want to Read" | ""
  >(defaultStatus || "Completed");
  const [genre, setGenre] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);


  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      if (mode === "edit" && book) {
        setTitle(book.title);
        setAuthor(book.author);
        setGenre(book.genre);
        setReadingStatus(book.readingStatus);
        setTotalPages(book.totalPages);
        setCurrentPage(book.currentPage);
      } else {
        setTitle("");
        setAuthor("");
        setGenre("");
        setTotalPages(0);
        setCurrentPage(0);
        setReadingStatus(defaultStatus || "Completed");
      }
    }
  }, [isOpen, mode, book, defaultStatus]);


  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else if (mode === "edit" && book?.coverImage) {
      setPreviewUrl(book.coverImage);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile, mode, book]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle Escape key press to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bookTitle = title.trim() || "Untitled Book";
    const bookAuthor = author.trim() || "Unknown Author";
    const status = readingStatus || "Completed";
    const imageUrl = await uploadImage();

    const finalImage =
      imageUrl || (mode === "edit" && book ? book.coverImage : "");

    if (mode === "edit" && book) {
      await updateBook(book.id, {
        title: bookTitle,
        author: bookAuthor,
        coverImage: finalImage,
        genre,
        readingStatus: status,
        totalPages,
        currentPage,
      });
    } else {
      await addBook({
        title: bookTitle,
        author: bookAuthor,
        coverImage: finalImage,
        genre,
        readingStatus: status,
        totalPages,
        currentPage,
      });
    }
    setTitle("");
    setAuthor("");
    setGenre("");
    setTotalPages(0);
    setCurrentPage(0);
    setReadingStatus(defaultStatus || "Completed");
    onClose();
  };

  const uploadImage = async () => {
    if (!selectedFile) return "";

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        return data.imageUrl;
      }

      return "";
    } catch (error) {
      console.error(error);
      return "";
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
      {/* Blurred / Dimmed Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-[#17110C]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card Container */}
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-book-modal-title"
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-2xl sm:rounded-3xl border border-[#3E2C23]/20 shadow-2xl overflow-hidden z-10 animate-fade-in my-auto max-h-[92vh] flex flex-col active:scale-[0.99] transition-transform duration-200"
      >
        {/* Header Section */}
        <div className="relative bg-[#F3EBE0]/80 border-b border-[#3E2C23]/10 px-6 py-5 flex flex-col items-center justify-center text-center shrink-0">
          {/* Top-Right Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#6E5440]/60 hover:text-[#2C1D11] p-2 rounded-full hover:bg-[#3E2C23]/10 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#3E2C23]/40 focus-visible:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Decorative Top Stamp */}
          <div className="w-10 h-10 rounded-full bg-[#EBE4D8] border border-[#C4A890]/50 flex items-center justify-center mb-2 shadow-xs">
            <svg
              width="22"
              height="22"
              viewBox="0 0 100 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 38C38 38 20 22 8 22C4 22 2 24 2 28C2 38 20 54 50 54C80 54 98 38 98 28C98 24 96 22 92 22C80 22 62 38 50 38Z"
                fill="#3E2C23"
                opacity="0.9"
              />
              <circle cx="50" cy="18" r="4" fill="#3E2C23" />
              <circle cx="22" cy="34" r="2" fill="#7A5A3E" />
              <circle cx="78" cy="34" r="2" fill="#7A5A3E" />
              <circle cx="34" cy="28" r="1.5" fill="#7A5A3E" />
              <circle cx="66" cy="28" r="1.5" fill="#7A5A3E" />
            </svg>
          </div>

          <h2
            id="add-book-modal-title"
            className="text-2xl sm:text-3xl font-serif font-bold text-[#2C1D11] tracking-tight"
          >
            {mode === "edit" ? "Edit Book" : "Add Book"}
          </h2>
          <p className="text-xs sm:text-sm font-sans text-[#6E5440]/80 mt-0.5">
            {mode === "edit"
              ? "Update your book details."
              : "Add a new book to your collection."}
          </p>
        </div>

        {/* Modal Form Body */}
        <div className="p-5 sm:p-6 space-y-4 md:space-y-5 overflow-y-auto flex-1">
          {/* Row 1: Book Cover Upload (Left) & Book Name / Author Name (Right) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Book Cover Upload Box */}
            <div className="flex flex-col">
              <label className="block text-xs sm:text-sm font-sans font-semibold text-[#2C1D11] mb-1.5">
                Book Cover <span className="text-[#A93226]">*</span>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="border-2 border-dashed border-[#C4A890]/70 bg-[#F4EDE2]/50 hover:bg-[#F0E6D8]/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-colors min-h-[160px] h-full relative group overflow-hidden">
                  {previewUrl ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden shadow-xs flex items-center justify-center bg-[#FAF7F2]">
                      <Image
                        src={previewUrl}
                        alt="Book cover preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
                        <Library className="w-5 h-5 mb-1" />
                        <span className="text-xs font-sans font-semibold">
                          Change Cover
                        </span>
                        {selectedFile && (
                          <span className="text-[10px] opacity-90 max-w-[90%] truncate mt-0.5 font-sans">
                            {selectedFile.name}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] shadow-xs flex items-center justify-center mb-2 text-[#4E3524]">
                        <Library className="w-5 h-5" />
                      </div>

                      <p className="font-sans font-semibold text-xs sm:text-sm text-[#2C1D11]">
                        Upload Cover
                      </p>

                      <p className="text-[11px] font-sans text-[#6E5440]/70 mt-0.5">
                        JPG, PNG or WEBP
                      </p>

                      <p className="text-[11px] font-sans text-[#6E5440]/60 mt-0.5">
                        Max 2MB
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* Book Name & Author Name */}
            <div className="flex flex-col justify-between space-y-3">
              {/* Book Name */}
              <div>
                <label className="block text-xs sm:text-sm font-sans font-semibold text-[#2C1D11] mb-1.5">
                  Book Name <span className="text-[#A93226]">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-[#6E5440]/70 pointer-events-none">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter book name"
                    className="w-full h-11 pl-9 pr-3.5 bg-[#FAF7F2] border border-[#3E2C23]/20 rounded-xl text-xs sm:text-sm font-sans text-[#2C1D11] placeholder:text-[#6E5440]/50 focus:outline-none focus:ring-2 focus:ring-[#4E3524]/20 focus:border-[#4E3524] transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Author Name */}
              <div>
                <label className="block text-xs sm:text-sm font-sans font-semibold text-[#2C1D11] mb-1.5">
                  Author Name <span className="text-[#A93226]">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-[#6E5440]/70 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter author name"
                    className="w-full h-11 pl-9 pr-3.5 bg-[#FAF7F2] border border-[#3E2C23]/20 rounded-xl text-xs sm:text-sm font-sans text-[#2C1D11] placeholder:text-[#6E5440]/50 focus:outline-none focus:ring-2 focus:ring-[#4E3524]/20 focus:border-[#4E3524] transition-all shadow-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Reading Status & Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reading Status */}
            <div>
              <label className="block text-xs sm:text-sm font-sans font-semibold text-[#2C1D11] mb-1.5">
                Reading Status <span className="text-[#A93226]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-[#6E5440]/70 pointer-events-none">
                  <BookOpen className="w-4 h-4" />
                </div>
                <select
                  value={readingStatus}
                  onChange={(e) =>
                    setReadingStatus(
                      e.target.value as "Completed" | "Currently Reading" | "Want to Read"
                    )
                  }
                  className="w-full h-11 pl-9 pr-8 bg-[#FAF7F2] border border-[#3E2C23]/20 rounded-xl text-xs sm:text-sm font-sans text-[#2C1D11] appearance-none focus:outline-none focus:ring-2 focus:ring-[#4E3524]/20 focus:border-[#4E3524] transition-all shadow-xs cursor-pointer"
                >
                  <option value="" disabled className="text-[#6E5440]/50">
                    Select status
                  </option>
                  <option value="Completed">Completed</option>
                  <option value="Currently Reading">Currently Reading</option>
                  <option value="Want to Read">Want to Read</option>
                </select>
                <div className="absolute right-3 text-[#6E5440]/70 pointer-events-none">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Genre */}
            <div>
              <label className="block text-xs sm:text-sm font-sans font-semibold text-[#2C1D11] mb-1.5">
                Genre <span className="text-[#A93226]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-[#6E5440]/70 pointer-events-none">
                  <Tag className="w-4 h-4" />
                </div>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full h-11 pl-9 pr-8 bg-[#FAF7F2] border border-[#3E2C23]/20 rounded-xl text-xs sm:text-sm font-sans text-[#2C1D11] appearance-none focus:outline-none focus:ring-2 focus:ring-[#4E3524]/20 focus:border-[#4E3524] transition-all shadow-xs cursor-pointer"
                >
                  <option value="" disabled className="text-[#6E5440]/50">
                    Select genre
                  </option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Biography">Biography</option>
                  <option value="Self-Help">Self-Help</option>
                  <option value="Romance">Romance</option>
                </select>
                <div className="absolute right-3 text-[#6E5440]/70 pointer-events-none">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Total Number of Pages & Currently on Page */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Number of Pages */}
            <div>
              <label className="block text-xs sm:text-sm font-sans font-semibold text-[#2C1D11] mb-1.5">
                Total Number of Pages <span className="text-[#A93226]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-[#6E5440]/70 pointer-events-none">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  value={totalPages}
                  onChange={(e) => setTotalPages(Number(e.target.value))}
                  placeholder="Enter total pages"
                  className="w-full h-11 pl-9 pr-3.5 bg-[#FAF7F2] border border-[#3E2C23]/20 rounded-xl text-xs sm:text-sm font-sans text-[#2C1D11] placeholder:text-[#6E5440]/50 focus:outline-none focus:ring-2 focus:ring-[#4E3524]/20 focus:border-[#4E3524] transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Currently on Page */}
            <div>
              <label className="block text-xs sm:text-sm font-sans font-semibold text-[#2C1D11] mb-1.5">
                Currently on Page <span className="text-[#A93226]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-[#6E5440]/70 pointer-events-none">
                  <Bookmark className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  placeholder="Enter current page (0 if starting)"
                  className="w-full h-11 pl-9 pr-3.5 bg-[#FAF7F2] border border-[#3E2C23]/20 rounded-xl text-xs sm:text-sm font-sans text-[#2C1D11] placeholder:text-[#6E5440]/50 focus:outline-none focus:ring-2 focus:ring-[#4E3524]/20 focus:border-[#4E3524] transition-all shadow-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section with Leaf Flourish Line & Action Buttons */}
        <div className="px-6 py-4 border-t border-[#3E2C23]/10 bg-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Centered Decorative Leaf Flourish Line */}
          <div className="hidden sm:flex items-center justify-center flex-1 space-x-3 text-[#7A5A3E]/40">
            <div className="h-[1px] w-16 bg-[#3E2C23]/15" />
            <span className="text-xs">🌿</span>
            <div className="h-[1px] w-16 bg-[#3E2C23]/15" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#EBE4D8] text-[#3E2C23] border border-[#3E2C23]/15 hover:bg-[#E0D5C5] rounded-xl text-xs sm:text-sm font-sans font-medium transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              disabled={uploading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-[#4E3524] text-[#F8F5F2] hover:bg-[#3E2C23] rounded-xl text-xs sm:text-sm font-sans font-medium shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <BookOpen className="w-4 h-4" />
              <span>
                {uploading
                  ? "Uploading..."
                  : mode === "edit"
                    ? "Update Book"
                    : "Add Book"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
