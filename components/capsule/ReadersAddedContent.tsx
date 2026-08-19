"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Mic, Camera, Edit3 } from "lucide-react";
import { CapsuleItem, CapsuleType } from "./types";
import AddToCapsuleModal from "./AddToCapsuleModal";
import CapsuleCategoryModal from "./CapsuleCategoryModal";

interface ReadersAddedContentProps {
  bookId: string;
}

export default function ReadersAddedContent({
  bookId,
}: ReadersAddedContentProps) {
  const [capsules, setCapsules] = useState<CapsuleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Category modal state (opened when clicking one of the 3 tab cards)
  const [activeCategoryModal, setActiveCategoryModal] = useState<CapsuleType | null>(null);

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch capsules from API
  const fetchCapsules = useCallback(async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/books/${bookId}/capsules`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setCapsules(data.capsules || []);
      }
    } catch (err) {
      console.error("Failed to fetch capsules:", err);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCapsules();

    const handleCapsuleSaved = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.bookId === bookId) {
        if (customEvent.detail?.capsule) {
          const newCap = customEvent.detail.capsule;
          setCapsules((prev) => [newCap, ...prev.filter((c) => c.id !== newCap.id)]);
        }
      }
    };

    window.addEventListener("capsuleSaved", handleCapsuleSaved);
    return () => {
      window.removeEventListener("capsuleSaved", handleCapsuleSaved);
    };
  }, [bookId, fetchCapsules]);

  // Counts for 3 categories
  const voiceCount = capsules.filter((c) => c.type === "voice").length;
  const photoCount = capsules.filter((c) => c.type === "photo").length;
  const textCount = capsules.filter((c) => c.type === "text").length;

  const handleDeleteCapsule = async (id: string) => {
    try {
      const res = await fetch(`/api/books/${bookId}/capsules/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCapsules((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete capsule item:", err);
    }
  };

  const handleCapsuleAdded = (newCapsule: CapsuleItem) => {
    setCapsules((prev) => [newCapsule, ...prev]);
  };

  const handleCapsuleUpdated = (updatedCapsule: CapsuleItem) => {
    setCapsules((prev) =>
      prev.map((c) => (c.id === updatedCapsule.id ? updatedCapsule : c))
    );
  };

  return (
    <div className="bg-[#F5EFE6]/60 rounded-2xl border border-[#3E2C23]/10 p-5 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-serif font-bold text-[#2C1D11]">
          Reader&apos;s Added Content
        </h3>
      </div>

      {/* 3 Metric Cards / Category Tabs */}
      <div className="grid grid-cols-3 gap-3">
        {/* Voice Recordings Card */}
        <button
          type="button"
          onClick={() => setActiveCategoryModal("voice")}
          className="flex flex-col items-center justify-center p-3.5 bg-[#FAF7F2] hover:bg-[#F2EADF] border border-[#3E2C23]/15 rounded-2xl transition-all cursor-pointer shadow-2xs hover:scale-[1.02] group"
        >
          <div className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center mb-1 group-hover:bg-[#3E2C23] group-hover:text-[#FAF7F2] transition-colors">
            <Mic className="w-4 h-4 text-[#3E2C23] group-hover:text-[#FAF7F2]" />
          </div>
          <span className="text-xl font-serif font-bold text-[#2C1D11]">
            {loading ? "..." : voiceCount}
          </span>
          <span className="text-[11px] font-sans text-[#6E5440]/80">
            Voice Recordings
          </span>
        </button>

        {/* Photos Card */}
        <button
          type="button"
          onClick={() => setActiveCategoryModal("photo")}
          className="flex flex-col items-center justify-center p-3.5 bg-[#FAF7F2] hover:bg-[#F2EADF] border border-[#3E2C23]/15 rounded-2xl transition-all cursor-pointer shadow-2xs hover:scale-[1.02] group"
        >
          <div className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center mb-1 group-hover:bg-[#3E2C23] group-hover:text-[#FAF7F2] transition-colors">
            <Camera className="w-4 h-4 text-[#3E2C23] group-hover:text-[#FAF7F2]" />
          </div>
          <span className="text-xl font-serif font-bold text-[#2C1D11]">
            {loading ? "..." : photoCount}
          </span>
          <span className="text-[11px] font-sans text-[#6E5440]/80">
            Photos
          </span>
        </button>

        {/* Thoughts (Text Entries) Card */}
        <button
          type="button"
          onClick={() => setActiveCategoryModal("text")}
          className="flex flex-col items-center justify-center p-3.5 bg-[#FAF7F2] hover:bg-[#F2EADF] border border-[#3E2C23]/15 rounded-2xl transition-all cursor-pointer shadow-2xs hover:scale-[1.02] group"
        >
          <div className="w-8 h-8 rounded-full bg-[#F5EFE6] flex items-center justify-center mb-1 group-hover:bg-[#3E2C23] group-hover:text-[#FAF7F2] transition-colors">
            <Edit3 className="w-4 h-4 text-[#3E2C23] group-hover:text-[#FAF7F2]" />
          </div>
          <span className="text-xl font-serif font-bold text-[#2C1D11]">
            {loading ? "..." : textCount}
          </span>
          <span className="text-[11px] font-sans text-[#6E5440]/80">
            Text Entries
          </span>
        </button>
      </div>

      {/* Category Modal (Opened when clicking a card) */}
      {activeCategoryModal && (
        <CapsuleCategoryModal
          isOpen={!!activeCategoryModal}
          onClose={() => setActiveCategoryModal(null)}
          bookId={bookId}
          category={activeCategoryModal}
          capsules={capsules}
          onCapsuleDeleted={handleDeleteCapsule}
          onCapsuleAdded={handleCapsuleAdded}
          onCapsuleUpdated={handleCapsuleUpdated}
        />
      )}

      {/* Creation Choice Modal */}
      <AddToCapsuleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        bookId={bookId}
        onSaved={handleCapsuleAdded}
      />
    </div>
  );
}
