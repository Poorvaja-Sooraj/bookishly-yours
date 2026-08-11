"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Mic, Square, Play, Pause, RotateCcw } from "lucide-react";
import { CapsuleItem } from "./types";

interface AddVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  onSaved: (capsule: CapsuleItem) => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function AddVoiceModal({
  isOpen,
  onClose,
  bookId,
  onSaved,
}: AddVoiceModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Clean up on unmount or close
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      setError("");
      setAudioBlob(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setRecordingTime(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all audio tracks from stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Microphone access denied or not supported.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleSave = async () => {
    if (!audioBlob) {
      setError("Please record audio before saving.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      // 1. Upload audio blob to backend
      const formData = new FormData();
      formData.append("file", audioBlob, "voice_recording.webm");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success || !uploadData.fileUrl) {
        throw new Error(uploadData.message || "Failed to upload audio.");
      }

      // 2. Save capsule entry in database
      const res = await fetch(`/api/books/${bookId}/capsules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "voice",
          audioUrl: uploadData.fileUrl,
          audioDuration: recordingTime,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSaved(data.capsule);
        onClose();
      } else {
        setError(data.message || "Failed to save voice capsule.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while uploading audio.");
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
            <Mic className="w-7 h-7" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-serif font-bold text-[#2C1D11]">
            Add Voice Recording
          </h3>
          <p className="text-xs font-sans text-[#6E5440]/80 mt-1">
            Record your thoughts about this book right now.
          </p>
        </div>

        {/* Animated Waveform Display */}
        <div className="flex items-center justify-center gap-1.5 h-16 mb-4">
          {[40, 65, 30, 85, 50, 95, 40, 70, 90, 60, 80, 45, 75, 35, 60, 90, 50, 70, 40].map(
            (height, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isRecording
                    ? "bg-[#3E2C23] animate-pulse"
                    : audioBlob
                    ? "bg-[#6E5440]"
                    : "bg-[#C4A890]/40"
                }`}
                style={{
                  height: isRecording
                    ? `${Math.max(15, (height * (i % 2 === 0 ? 1 : 0.7)))}%`
                    : audioBlob
                    ? `${height * 0.5}%`
                    : "20%",
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            )
          )}
        </div>

        {/* Digital Timer */}
        <div className="text-center mb-2 font-mono text-3xl font-bold text-[#2C1D11] tracking-wider">
          {formatDuration(recordingTime)}
        </div>

        {/* Status Subtitle */}
        <p className="text-xs font-sans text-[#6E5440]/70 text-center mb-6">
          {isRecording
            ? "Recording... Tap the button to stop"
            : audioBlob
            ? "Recording saved! Preview below or tap mic to re-record."
            : "Tap the mic to start recording"}
        </p>

        {/* Big Mic Button */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={handleMicClick}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center text-[#FAF7F2] transition-all cursor-pointer shadow-lg ${
              isRecording
                ? "bg-[#A93226] hover:bg-[#8B1F19] scale-105"
                : "bg-[#3E2C23] hover:bg-[#2C1D11]"
            }`}
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isRecording ? (
              <>
                <span className="absolute inset-0 rounded-full bg-[#A93226]/30 animate-ping" />
                <Square className="w-6 h-6 fill-current relative z-10" />
              </>
            ) : (
              <Mic className="w-7 h-7 relative z-10" />
            )}
          </button>
        </div>

        {/* Audio Player Preview */}
        {audioUrl && !isRecording && (
          <div className="mb-6 bg-[#F5EFE6] p-3 rounded-2xl border border-[#3E2C23]/15 flex items-center justify-between">
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={handleAudioEnded}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlayback}
                className="w-9 h-9 rounded-full bg-[#3E2C23] text-[#FAF7F2] flex items-center justify-center cursor-pointer hover:bg-[#2C1D11] transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
              <div>
                <p className="text-xs font-sans font-semibold text-[#2C1D11]">
                  Voice Preview
                </p>
                <p className="text-[10px] font-sans text-[#6E5440]/70">
                  Duration: {formatDuration(recordingTime)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={startRecording}
              className="text-[#6E5440] hover:text-[#2C1D11] text-xs font-sans flex items-center gap-1 p-1 cursor-pointer"
              title="Re-record"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {error && (
          <p className="text-xs text-[#A93226] font-sans mb-3 text-center">
            {error}
          </p>
        )}

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
            disabled={saving || !audioBlob || isRecording}
            className="flex-1 py-3 bg-[#3E2C23] hover:bg-[#2C1D11] text-[#F8F5F2] rounded-xl font-sans font-semibold text-sm transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Recording"}
          </button>
        </div>
      </div>

      {/* Bottom Hint Pill */}
      <div className="mt-4 z-10 flex items-center gap-2 bg-[#2C1D11]/90 backdrop-blur-md text-[#FAF7F2] px-4 py-2 rounded-full text-xs font-sans border border-white/10 shadow-lg">
        <span className="text-sm">🎙️</span>
        <span>Record, review, and save your voice memory.</span>
      </div>
    </div>
  );
}
