"use client";

import React from "react";
import { BookOpen, Award, TrendingUp, Sparkles } from "lucide-react";
import { useBooks } from "@/context/BookContext";

export default function Statistics() {
  const { stats, books } = useBooks();

  // Percentage calculations
  const total = stats.total || 1;
  const completedPct = Math.round((stats.completed / total) * 100);
  const readingPct = Math.round((stats.currentlyReading / total) * 100);
  const wantPct = Math.round((stats.wantToRead / total) * 100);

  return (
    <section className="w-full rounded-xl sm:rounded-2xl bg-[#FAF7F2] border border-[#3E2C23]/15 p-5 md:p-6 shadow-sm select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-[#3E2C23]/10 pb-3 mb-5">
        <h2 className="text-lg md:text-xl font-serif font-bold text-[#2C1D11] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#4E3524]" />
          <span>Statistics</span>
        </h2>
        <span className="text-xs font-sans text-[#6E5440]/70 italic">
          Reading Overview
        </span>
      </div>

      {/* Main Grid: Reading Progress Bar & Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left 2 Cols: Reading Distribution Progress */}
        <div className="md:col-span-2 space-y-4 bg-[#F5EFE6]/60 rounded-xl p-4 border border-[#3E2C23]/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-serif font-semibold text-[#2C1D11]">
                Collection Distribution
              </h3>
              <span className="text-xs font-sans text-[#6E5440]/80">
                {stats.total} total {stats.total === 1 ? "book" : "books"}
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full h-3 rounded-full bg-[#EBE4D8] overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${completedPct}%` }}
                className="bg-[#4E3524] transition-all duration-500"
                title={`Completed: ${completedPct}%`}
              />
              <div
                style={{ width: `${readingPct}%` }}
                className="bg-[#1A2B4C] transition-all duration-500"
                title={`Currently Reading: ${readingPct}%`}
              />
              <div
                style={{ width: `${wantPct}%` }}
                className="bg-[#C4A482] transition-all duration-500"
                title={`Want to Read: ${wantPct}%`}
              />
            </div>
          </div>

          {/* Status Breakdown Legend Pills */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
            <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#3E2C23]/10">
              <p className="text-[10px] font-sans uppercase font-medium text-[#6E5440]/70">
                Completed
              </p>
              <p className="text-base font-serif font-bold text-[#4E3524] mt-0.5">
                {stats.completed} <span className="text-xs text-[#6E5440]/60 font-sans font-normal">({completedPct}%)</span>
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#3E2C23]/10">
              <p className="text-[10px] font-sans uppercase font-medium text-[#6E5440]/70">
                Reading
              </p>
              <p className="text-base font-serif font-bold text-[#1A2B4C] mt-0.5">
                {stats.currentlyReading} <span className="text-xs text-[#6E5440]/60 font-sans font-normal">({readingPct}%)</span>
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#3E2C23]/10">
              <p className="text-[10px] font-sans uppercase font-medium text-[#6E5440]/70">
                Want to Read
              </p>
              <p className="text-base font-serif font-bold text-[#8C6747] mt-0.5">
                {stats.wantToRead} <span className="text-xs text-[#6E5440]/60 font-sans font-normal">({wantPct}%)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Vintage Reading Insight Card */}
        <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#3E2C23]/15 flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-[#4E3524]">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-sm font-serif font-semibold text-[#2C1D11]">
              Reading Goal
            </h3>
          </div>
          <p className="text-xs font-sans text-[#6E5440]/80 leading-relaxed italic my-auto">
            &ldquo;A reader lives a thousand lives before he dies. The man who never reads lives only one.&rdquo;
          </p>
          <div className="pt-2 border-t border-[#3E2C23]/10 flex items-center justify-between text-xs font-sans text-[#4E3524]">
            <span className="flex items-center gap-1 font-medium">
              <Award className="w-3.5 h-3.5" />
              Active Reader
            </span>
            <span className="font-serif font-bold text-sm">
              {stats.completed} Read
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
