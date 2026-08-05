import React from "react";
import { BookOpen } from "lucide-react";

export default function RecentActivity() {
  return (
    <section className="w-full flex-1 min-h-0 flex flex-col rounded-xl sm:rounded-2xl bg-[#FAF7F2] border border-[#3E2C23]/15 p-4 sm:p-5 md:p-6 shadow-sm overflow-hidden">
      <h2 className="text-lg md:text-xl font-serif font-bold text-[#2C1D11] border-b border-[#3E2C23]/10 pb-2.5 shrink-0">
        Recent Activity
      </h2>

      {/* Empty State */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-4 md:py-6 text-center">
        {/* Book Illustration / Icon container */}
        <div className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#EBE4D8]/80 border border-[#3E2C23]/15 shadow-inner mb-3 shrink-0">
          <BookOpen className="w-7 h-7 md:w-8 md:h-8 text-[#4E3524]" />
        </div>

        <h3 className="text-base md:text-lg font-serif font-semibold text-[#2C1D11]">
          No books added yet.
        </h3>
        <p className="text-xs md:text-sm font-sans text-[#6E5440]/80 mt-1 max-w-md leading-relaxed">
          Start building your personal library by adding your first book.
        </p>
      </div>
    </section>
  );
}
