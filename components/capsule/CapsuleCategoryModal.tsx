"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Plus,
  Play,
  Pause,
  Trash2,
  Volume2,
  Calendar,
  Mic,
  Camera,
  Edit3,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import { CapsuleItem, CapsuleType } from "./types";
import AddToCapsuleModal from "./AddToCapsuleModal";
import AddCardModal from "./AddCardModal";
import { useEscapeKey } from "@/lib/hooks/useEscapeKey";

interface CapsuleCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  category: CapsuleType;
  capsules: CapsuleItem[];
  onCapsuleDeleted: (id: string) => void;
  onCapsuleAdded: (capsule: CapsuleItem) => void;
  onCapsuleUpdated?: (capsule: CapsuleItem) => void;
}

import { formatDate, formatDuration } from "@/lib/format-utils";

export default function CapsuleCategoryModal({
  isOpen,
  onClose,
  bookId,
  category,
  capsules,
  onCapsuleDeleted,
  onCapsuleAdded,
  onCapsuleUpdated,
}: CapsuleCategoryModalProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [editingCapsule, setEditingCapsule] = useState<CapsuleItem | null>(null);

  // Audio playback state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEscapeKey(
    isOpen && !selectedPhoto && !isAddModalOpen && !editingCapsule,
    onClose
  );

  if (!isOpen) return null;

  const categoryItems = capsules.filter((c) => c.type === category);

  const getCategoryTitle = () => {
    switch (category) {
      case "voice":
        return "Voice Recordings";
      case "photo":
        return "Photos";
      case "text":
        return "Thoughts & Reflections";
    }
  };

  const getCategorySubtitle = () => {
    switch (category) {
      case "voice":
        return "Listen to your recorded thoughts and audio memories.";
      case "photo":
        return "Visual moments captured while reading this book.";
      case "text":
        return "Written thoughts, quotes, and reflections.";
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case "voice":
        return <Mic className="w-5 h-5 text-[#3E2C23]" />;
      case "photo":
        return <Camera className="w-5 h-5 text-[#3E2C23]" />;
      case "text":
        return <Edit3 className="w-5 h-5 text-[#3E2C23]" />;
    }
  };

  const getAddButtonText = () => {
    switch (category) {
      case "voice":
        return "Add Voice Recording";
      case "photo":
        return "Add Photos";
      case "text":
        return "Add Thought";
    }
  };

  // Audio controls
  const togglePlayAudio = (id: string) => {
    const audioEl = audioRefs.current[id];
    if (!audioEl) return;

    if (playingId === id) {
      audioEl.pause();
      setPlayingId(null);
    } else {
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId].pause();
      }
      audioEl.play();
      setPlayingId(id);
    }
  };

  const handleTimeUpdate = (id: string) => {
    const audioEl = audioRefs.current[id];
    if (audioEl && audioEl.duration) {
      const pct = (audioEl.currentTime / audioEl.duration) * 100;
      setAudioProgress((prev) => ({ ...prev, [id]: pct }));
    }
  };

  const handleAudioEnded = (id: string) => {
    setPlayingId(null);
    setAudioProgress((prev) => ({ ...prev, [id]: 0 }));
  };

  const handleEditSaved = (updatedCapsule: CapsuleItem) => {
    if (onCapsuleUpdated) {
      onCapsuleUpdated(updatedCapsule);
    }
    setEditingCapsule(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          onClick={onClose}
        />

        <div className="relative z-10 w-full max-w-lg bg-[#FAF7F2] rounded-3xl border border-[#3E2C23]/15 shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-[#3E2C23]/10 flex items-center justify-between bg-[#FAF7F2] sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] border border-[#3E2C23]/15 flex items-center justify-center">
                {getCategoryIcon()}
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2C1D11]">
                  {getCategoryTitle()}
                </h3>
                <p className="text-xs font-sans text-[#6E5440]/70">
                  {getCategorySubtitle()}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-[#6E5440]/60 hover:text-[#2C1D11] p-1.5 rounded-full hover:bg-[#3E2C23]/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar / Add Button */}
          <div className="px-6 py-3 bg-[#F5EFE6]/50 border-b border-[#3E2C23]/10 flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[#6E5440]/80">
              Total Items: {categoryItems.length}
            </span>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3E2C23] hover:bg-[#2C1D11] text-[#FAF7F2] rounded-xl font-sans font-medium text-xs transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{getAddButtonText()}</span>
            </button>
          </div>

          {/* Items Content Area */}
          <div className="p-6 overflow-y-auto flex-1">
            {categoryItems.length === 0 ? (
              /* Empty State */
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F5EFE6] border border-[#3E2C23]/15 flex items-center justify-center text-[#3E2C23]/60 mb-3">
                  {getCategoryIcon()}
                </div>
                <h4 className="text-base font-serif font-bold text-[#2C1D11] mb-1">
                  No {getCategoryTitle().toLowerCase()} added yet
                </h4>
                <p className="text-xs font-sans text-[#6E5440]/70 max-w-xs mb-5">
                  Save your memories, thoughts, and recordings in your book capsule.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#3E2C23] hover:bg-[#2C1D11] text-[#FAF7F2] rounded-xl font-sans font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{getAddButtonText()}</span>
                </button>
              </div>
            ) : (
              /* Non-empty Items List */
              <div className="space-y-3">
                {/* Voice Recordings */}
                {category === "voice" &&
                  categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#3E2C23]/15 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <audio
                        ref={(el) => {
                          if (el) audioRefs.current[item.id] = el;
                        }}
                        src={item.audioUrl}
                        onTimeUpdate={() => handleTimeUpdate(item.id)}
                        onEnded={() => handleAudioEnded(item.id)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => togglePlayAudio(item.id)}
                        className="w-10 h-10 rounded-full bg-[#3E2C23] hover:bg-[#2C1D11] text-[#FAF7F2] flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-xs"
                      >
                        {playingId === item.id ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs font-sans text-[#2C1D11] mb-1.5">
                          <span className="font-semibold flex items-center gap-1">
                            <Volume2 className="w-3.5 h-3.5 text-[#6E5440]" />
                            Voice Note
                          </span>
                          <span className="text-xs font-mono font-medium text-[#6E5440]">
                            {formatDuration(item.audioDuration || 0, "mmss")}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#EBE4D8] rounded-full overflow-hidden mb-1.5">
                          <div
                            className="h-full bg-[#3E2C23] rounded-full transition-all duration-200"
                            style={{
                              width: `${audioProgress[item.id] || 0}%`,
                            }}
                          />
                        </div>
                        <p className="text-[11px] font-sans text-[#6E5440]/60 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.createdAt)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onCapsuleDeleted(item.id)}
                        className="text-[#6E5440]/50 hover:text-[#A93226] p-2 rounded-xl hover:bg-[#A93226]/10 transition-colors cursor-pointer shrink-0"
                        title="Delete recording"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                {/* Photos Grid */}
                {category === "photo" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-[#3E2C23]/15 shadow-xs bg-black/5 cursor-pointer"
                        onClick={() => setSelectedPhoto(item.imageUrl || null)}
                      >
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            alt="Capsule photo"
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex items-end justify-between">
                          <span className="text-[10px] font-sans text-white/90">
                            {formatDate(item.createdAt)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCapsuleDeleted(item.id);
                            }}
                            className="bg-black/60 hover:bg-[#A93226] text-white p-1.5 rounded-full transition-colors cursor-pointer"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Thoughts Cards */}
                {category === "text" &&
                  categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl p-4 border border-[#3E2C23]/15 shadow-xs flex flex-col justify-between"
                      style={{ backgroundColor: item.color || "#FAF7F2" }}
                    >
                      <p className="text-sm font-serif text-[#2C1D11] whitespace-pre-wrap leading-relaxed mb-3">
                        {item.content}
                      </p>
                      <div className="flex items-center justify-between text-xs font-sans text-[#6E5440]/70 pt-2.5 border-t border-black/5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(item.createdAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingCapsule(item)}
                            className="text-[#6E5440]/50 hover:text-[#3E2C23] p-1.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                            title="Edit card"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onCapsuleDeleted(item.id)}
                            className="text-[#6E5440]/50 hover:text-[#A93226] p-1.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                            title="Delete card"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox for Photo View */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setSelectedPhoto(null)}
          />
          <div className="relative z-10 max-w-2xl max-h-[85vh] w-full rounded-2xl overflow-hidden shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-[75vh]">
              <Image
                src={selectedPhoto}
                alt="Enlarged photo"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal for this category */}
      <AddToCapsuleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        bookId={bookId}
        onSaved={(newCapsule) => {
          onCapsuleAdded(newCapsule);
          setIsAddModalOpen(false);
        }}
        initialOption={category}
      />

      {/* Edit Card Modal for text capsules */}
      {editingCapsule && (
        <AddCardModal
          isOpen={!!editingCapsule}
          onClose={() => setEditingCapsule(null)}
          bookId={bookId}
          onSaved={handleEditSaved}
          editCapsule={editingCapsule}
        />
      )}
    </>
  );
}

