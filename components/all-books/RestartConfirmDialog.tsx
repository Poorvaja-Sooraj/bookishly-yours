"use client";

interface RestartConfirmDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function RestartConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
}: RestartConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-sm bg-[#FAF7F2] rounded-2xl border border-[#3E2C23]/20 shadow-2xl p-6 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-[#F5EFE6] border border-[#3E2C23]/15 flex items-center justify-center mx-auto mb-3 text-2xl">
          🔄
        </div>
        <h3 className="text-lg font-serif font-bold text-[#2C1D11] mb-2">
          Restart Reading?
        </h3>
        <p className="text-xs font-sans text-[#6E5440]/80 leading-relaxed mb-6">
          This book is already marked as completed. Would you like to restart
          reading from page 0 for a new session?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 bg-[#EBE4D8] hover:bg-[#E0D5C5] text-[#3E2C23] border border-[#3E2C23]/15 rounded-xl font-sans font-medium text-xs transition-colors cursor-pointer"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-[#3E2C23] hover:bg-[#2C1D11] text-[#F8F5F2] rounded-xl font-sans font-semibold text-xs transition-colors cursor-pointer shadow-sm"
          >
            Yes, Restart
          </button>
        </div>
      </div>
    </div>
  );
}
