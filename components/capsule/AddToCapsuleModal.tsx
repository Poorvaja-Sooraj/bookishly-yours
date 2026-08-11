"use client";

import React, { useState } from "react";
import { X, Mic, Image as ImageIcon, FileText } from "lucide-react";
import AddCardModal from "./AddCardModal";
import AddVoiceModal from "./AddVoiceModal";
import AddPhotosModal from "./AddPhotosModal";
import { CapsuleItem } from "./types";

interface AddToCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  onSaved?: (capsule: CapsuleItem) => void;
  initialOption?: "text" | "voice" | "photo" | null;
}

export default function AddToCapsuleModal({
  isOpen,
  onClose,
  bookId,
  onSaved,
  initialOption = null,
}: AddToCapsuleModalProps) {
  const [activeSubModal, setActiveSubModal] = useState<
    "text" | "voice" | "photo" | null
  >(initialOption);

  // Sync initialOption if passed directly
  React.useEffect(() => {
    if (isOpen) {
      setActiveSubModal(initialOption);
    }
  }, [isOpen, initialOption]);

  if (!isOpen) return null;

  const handleCapsuleSaved = (capsule: CapsuleItem) => {
    if (onSaved) {
      onSaved(capsule);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("capsuleSaved", { detail: { bookId, capsule } })
      );
    }
    setActiveSubModal(null);
    onClose();
  };

  return (
    <>
      {/* ── Option Choice Modal ── */}
      {activeSubModal === null && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onClose}
          />

          <div className="relative z-10 w-full max-w-lg bg-[#FAF7F2] rounded-3xl border border-[#3E2C23]/15 shadow-2xl overflow-hidden animate-fade-in p-6 sm:p-8 text-center">
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 text-[#6E5440]/60 hover:text-[#2C1D11] p-1.5 rounded-full hover:bg-[#3E2C23]/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <h3 className="text-2xl font-serif font-bold text-[#2C1D11] mb-2">
              Add to Capsule
            </h3>
            <p className="text-xs font-sans text-[#6E5440]/80 mb-8">
              Capture this moment and save it in your book capsule.
            </p>

            {/* 3 Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Option 1: Add Card (Text) */}
              <button
                type="button"
                onClick={() => setActiveSubModal("text")}
                className="flex flex-col items-center justify-center p-5 bg-[#F5EFE6] hover:bg-[#EAE1D3] border border-[#3E2C23]/15 rounded-2xl transition-all duration-200 cursor-pointer group hover:scale-[1.03] shadow-xs"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#3E2C23]/15 flex items-center justify-center text-[#3E2C23] mb-3 group-hover:bg-[#3E2C23] group-hover:text-[#FAF7F2] transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="font-serif font-semibold text-sm text-[#2C1D11]">
                  Add Card
                </span>
                <span className="text-[11px] font-sans text-[#6E5440]/70 mt-0.5">
                  (Text)
                </span>
              </button>

              {/* Option 2: Add Voice Recording */}
              <button
                type="button"
                onClick={() => setActiveSubModal("voice")}
                className="flex flex-col items-center justify-center p-5 bg-[#F5EFE6] hover:bg-[#EAE1D3] border border-[#3E2C23]/15 rounded-2xl transition-all duration-200 cursor-pointer group hover:scale-[1.03] shadow-xs"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#3E2C23]/15 flex items-center justify-center text-[#3E2C23] mb-3 group-hover:bg-[#3E2C23] group-hover:text-[#FAF7F2] transition-colors">
                  <Mic className="w-6 h-6" />
                </div>
                <span className="font-serif font-semibold text-sm text-[#2C1D11]">
                  Add Voice
                </span>
                <span className="text-[11px] font-sans text-[#6E5440]/70 mt-0.5">
                  Recording
                </span>
              </button>

              {/* Option 3: Add Photos */}
              <button
                type="button"
                onClick={() => setActiveSubModal("photo")}
                className="flex flex-col items-center justify-center p-5 bg-[#F5EFE6] hover:bg-[#EAE1D3] border border-[#3E2C23]/15 rounded-2xl transition-all duration-200 cursor-pointer group hover:scale-[1.03] shadow-xs"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#3E2C23]/15 flex items-center justify-center text-[#3E2C23] mb-3 group-hover:bg-[#3E2C23] group-hover:text-[#FAF7F2] transition-colors">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <span className="font-serif font-semibold text-sm text-[#2C1D11]">
                  Add Photos
                </span>
                <span className="text-[11px] font-sans text-[#6E5440]/70 mt-0.5">
                  &nbsp;
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub Modals */}
      <AddCardModal
        isOpen={activeSubModal === "text"}
        onClose={() => {
          setActiveSubModal(null);
          if (initialOption) onClose();
        }}
        bookId={bookId}
        onSaved={handleCapsuleSaved}
      />

      <AddVoiceModal
        isOpen={activeSubModal === "voice"}
        onClose={() => {
          setActiveSubModal(null);
          if (initialOption) onClose();
        }}
        bookId={bookId}
        onSaved={handleCapsuleSaved}
      />

      <AddPhotosModal
        isOpen={activeSubModal === "photo"}
        onClose={() => {
          setActiveSubModal(null);
          if (initialOption) onClose();
        }}
        bookId={bookId}
        onSaved={handleCapsuleSaved}
      />
    </>
  );
}
