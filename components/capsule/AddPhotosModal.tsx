"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Camera, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { CapsuleItem } from "./types";

interface AddPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  onSaved: (capsule: CapsuleItem) => void;
}

type TabType = "upload" | "camera";

export default function AddPhotosModal({
  isOpen,
  onClose,
  bookId,
  onSaved,
}: AddPhotosModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Clean up camera stream and object URL
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === "camera" && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const startCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera.");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo_${Date.now()}.png`, {
            type: "image/png",
          });
          setSelectedFile(file);
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          stopCamera();
        }
      }, "image/png");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError("");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError("");
    }
  };

  const removePhoto = () => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (activeTab === "camera") {
      startCamera();
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      setError("Please select or capture a photo first.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // 1. Upload photo to backend
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success || (!uploadData.imageUrl && !uploadData.fileUrl)) {
        throw new Error(uploadData.message || "Failed to upload photo.");
      }

      const imageUrl = uploadData.imageUrl || uploadData.fileUrl;

      // 2. Save capsule entry in DB
      const res = await fetch(`/api/books/${bookId}/capsules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "photo",
          imageUrl,
          caption: caption.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSaved(data.capsule);
        onClose();
      } else {
        setError(data.message || "Failed to save photo capsule.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while uploading photo.");
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
            <ImageIcon className="w-7 h-7" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-5">
          <h3 className="text-xl font-serif font-bold text-[#2C1D11]">
            Add Photos
          </h3>
          <p className="text-xs font-sans text-[#6E5440]/80 mt-1">
            Capture or upload photos related to this moment.
          </p>
        </div>

        {/* Tabs: Upload / Camera */}
        <div className="flex border-b border-[#3E2C23]/15 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-2 text-xs font-sans font-semibold border-b-2 text-center transition-colors cursor-pointer ${
              activeTab === "upload"
                ? "border-[#3E2C23] text-[#3E2C23]"
                : "border-transparent text-[#6E5440]/60 hover:text-[#2C1D11]"
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("camera")}
            className={`flex-1 py-2 text-xs font-sans font-semibold border-b-2 text-center transition-colors cursor-pointer ${
              activeTab === "camera"
                ? "border-[#3E2C23] text-[#3E2C23]"
                : "border-transparent text-[#6E5440]/60 hover:text-[#2C1D11]"
            }`}
          >
            Camera
          </button>
        </div>

        {/* Selected Image Preview if available */}
        {previewUrl ? (
          <div className="relative mb-4 rounded-2xl overflow-hidden border border-[#3E2C23]/15 aspect-[4/3] bg-black/5 group">
            <Image
              src={previewUrl}
              alt="Photo preview"
              fill
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors cursor-pointer"
              title="Remove photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Tab 1: Upload */}
            {activeTab === "upload" && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#3E2C23]/25 rounded-2xl p-6 text-center bg-[#F5EFE6]/40 hover:bg-[#F5EFE6] transition-colors cursor-pointer mb-4 relative"
              >
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-10 h-10 rounded-full bg-[#EBE4D8] flex items-center justify-center mx-auto mb-2 text-[#3E2C23]">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-sans font-semibold text-[#2C1D11]">
                  Drag & drop your photos here or click to browse
                </p>
                <p className="text-[10px] font-sans text-[#6E5440]/60 mt-1">
                  JPG, PNG, WebP up to 10MB
                </p>
              </div>
            )}

            {/* Tab 2: Camera */}
            {activeTab === "camera" && (
              <div className="relative rounded-2xl overflow-hidden border border-[#3E2C23]/15 aspect-[4/3] bg-black mb-4 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                {isCameraActive && (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="absolute bottom-3 bg-[#3E2C23] hover:bg-[#2C1D11] text-[#FAF7F2] px-4 py-2 rounded-full font-sans font-semibold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo</span>
                  </button>
                )}
              </div>
            )}
          </>
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
            disabled={saving || !selectedFile}
            className="flex-1 py-3 bg-[#3E2C23] hover:bg-[#2C1D11] text-[#F8F5F2] rounded-xl font-sans font-semibold text-sm transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Photos"}
          </button>
        </div>
      </div>

      {/* Bottom Hint Pill */}
      <div className="mt-4 z-10 flex items-center gap-2 bg-[#2C1D11]/90 backdrop-blur-md text-[#FAF7F2] px-4 py-2 rounded-full text-xs font-sans border border-white/10 shadow-lg">
        <span className="text-sm">📷</span>
        <span>Add photos to keep your memories visual.</span>
      </div>
    </div>
  );
}
