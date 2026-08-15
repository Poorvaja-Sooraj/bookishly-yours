"use client";

import React, { useState, useEffect } from "react";
import { X, Bookmark, Type as TypeIcon } from "lucide-react";
import { CapsuleItem } from "./types";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  onSaved: (capsule: CapsuleItem) => void;
  editCapsule?: CapsuleItem | null;
}

const COLOR_OPTIONS = [
  { id: "cream", hex: "#FAF7F2", border: "#E2D9CC" },
  { id: "yellow", hex: "#F5E8C7", border: "#E4D1A0" },
  { id: "green", hex: "#D4E7D7", border: "#B5D4BB" },
  { id: "blue", hex: "#D0E5F2", border: "#ACCEDF" },
  { id: "purple", hex: "#E2D9F3", border: "#C7B9E3" },
  { id: "rust", hex: "#E8C9C4", border: "#D5A59E" },
];

export default function AddCardModal({
  isOpen,
  onClose,
  bookId,
  onSaved,
  editCapsule = null,
}: AddCardModalProps) {
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].hex);
  const [isSerif, setIsSerif] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!editCapsule;

  // Pre-fill when editing
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen && editCapsule) {
      setContent(editCapsule.content || "");
      setSelectedColor(editCapsule.color || COLOR_OPTIONS[0].hex);
      setError("");
    } else if (isOpen && !editCapsule) {
      setContent("");
      setSelectedColor(COLOR_OPTIONS[0].hex);
      setError("");
    }
  }, [isOpen, editCapsule]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!content.trim()) {
      setError("Please enter some text before saving.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const url = isEditing
        ? `/api/books/${bookId}/capsules/${editCapsule!.id}`
        : `/api/books/${bookId}/capsules`;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEditing ? {} : { type: "text" }),
          content: content.trim(),
          color: selectedColor,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSaved(data.capsule);
        setContent("");
        onClose();
      } else {
        setError(data.message || "Failed to save card.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex flex-col items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md bg-[#FAF7F2] rounded-3xl border border-[#3E2C23]/15 shadow-2xl overflow-hidden animate-fade-in p-6 sm:p-7">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#6E5440]/60 hover:text-[#2C1D11] p-1.5 rounded-full hover:bg-[#3E2C23]/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Icon */}
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-[#F5EFE6] border border-[#3E2C23]/15 flex items-center justify-center text-[#3E2C23] shadow-xs">
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <line x1="8" y1="8" x2="16" y2="8" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="8" y1="16" x2="12" y2="16" />
            </svg>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-5">
          <h3 className="text-xl font-serif font-bold text-[#2C1D11]">
            {isEditing ? "Edit Card" : "Add Card"}
          </h3>
          <p className="text-xs font-sans text-[#6E5440]/80 mt-1">
            {isEditing
              ? "Update your thought, quote, or reflection."
              : "Write down your thoughts, quotes, or anything you want to remember."}
          </p>
        </div>

        {/* Text Area */}
        <div
          className="rounded-2xl p-4 border border-[#3E2C23]/15 shadow-inner transition-colors mb-4 relative"
          style={{ backgroundColor: selectedColor }}
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 1000))}
            placeholder="Write something..."
            rows={5}
            className={`w-full bg-transparent resize-none border-none outline-none text-sm text-[#2C1D11] placeholder:text-[#6E5440]/50 ${isSerif ? "font-serif" : "font-sans"
              }`}
          />
          <div className="text-right text-[11px] font-sans text-[#6E5440]/60 select-none">
            {content.length} / 1000
          </div>
        </div>

        {error && (
          <p className="text-xs text-[#A93226] font-sans mb-3 text-center">
            {error}
          </p>
        )}

        {/* Styling controls: Font style button & Color Palette */}
        <div className="flex items-center justify-between gap-3 mb-6 bg-[#F5EFE6]/60 p-2.5 rounded-2xl border border-[#3E2C23]/10">
          {/* Font Toggle */}
          <button
            type="button"
            onClick={() => setIsSerif((p) => !p)}
            className={`flex items-center justify-center px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${isSerif
              ? "bg-[#3E2C23] text-[#FAF7F2] border-[#3E2C23]"
              : "bg-[#FAF7F2] text-[#3E2C23] border-[#3E2C23]/20"
              }`}
            title="Toggle Font (Serif / Sans)"
          >
            <TypeIcon className="w-3.5 h-3.5 mr-1" />
            <span>{isSerif ? "Serif" : "Sans"}</span>
          </button>

          {/* Color Dots */}
          <div className="flex items-center gap-2">
            {COLOR_OPTIONS.map((c) => {
              const isSelected = selectedColor === c.hex;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  className={`w-6 h-6 rounded-full cursor-pointer transition-all ${isSelected
                    ? "ring-2 ring-[#3E2C23] ring-offset-2 scale-110"
                    : "hover:scale-105"
                    }`}
                  style={{
                    backgroundColor: c.hex,
                    border: `1.5px solid ${c.border}`,
                  }}
                  aria-label={`Select color ${c.id}`}
                />
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-[#EBE4D8] hover:bg-[#E0D5C5] text-[#3E2C23] rounded-xl font-sans font-semibold text-sm transition-colors cursor-pointer border border-[#3E2C23]/15"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#3E2C23] hover:bg-[#2C1D11] text-[#F8F5F2] rounded-xl font-sans font-semibold text-sm transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Bookmark className="w-4 h-4" />
            {saving ? "Saving..." : isEditing ? "Update Card" : "Save Card"}
          </button>
        </div>
      </div>

      {/* Bottom Hint Pill */}
      <div className="mt-4 z-10 flex items-center gap-2 bg-[#2C1D11]/90 backdrop-blur-md text-[#FAF7F2] px-4 py-2 rounded-full text-xs font-sans border border-white/10 shadow-lg">
        <span className="text-sm">📖</span>
        <span>Your card will be saved inside this book&apos;s capsule.</span>
      </div>
    </div>
  );
}

