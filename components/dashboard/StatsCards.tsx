"use client";

import React from "react";
import { Library, BookCheck, BookOpen, Bookmark } from "lucide-react";
import { useBooks } from "@/context/BookContext";

export default function StatsCards() {
  const { stats: liveStats } = useBooks();

  const stats = [
    {
      title: "Total Books",
      value: liveStats.total,
      icon: Library,
      color: "bg-[#1A2B4C]/10 text-[#1A2B4C]",
    },
    {
      title: "Completed Books",
      value: liveStats.completed,
      icon: BookCheck,
      color: "bg-[#1A2B4C]/10 text-[#1A2B4C]",
    },
    {
      title: "Currently Reading",
      value: liveStats.currentlyReading,
      icon: BookOpen,
      color: "bg-[#1A2B4C]/10 text-[#1A2B4C]",
    },
    {
      title: "Want to Read",
      value: liveStats.wantToRead,
      icon: Bookmark,
      color: "bg-[#1A2B4C]/10 text-[#1A2B4C]",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-3.5 shrink-0 select-none">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FAF7F2] border border-[#3E2C23]/15 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div>
              <p className="text-[11px] md:text-xs font-sans font-medium text-[#6E5440]/80 tracking-wide uppercase">
                {stat.title}
              </p>
              <p className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-[#2C1D11] mt-0.5">
                {stat.value}
              </p>
            </div>
            <div className={`p-2.5 sm:p-3 rounded-xl ${stat.color} shadow-xs`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </section>
  );
}
