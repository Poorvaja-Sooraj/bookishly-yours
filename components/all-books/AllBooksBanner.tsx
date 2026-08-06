import React from "react";

export default function AllBooksBanner() {
  return (
    <div className="w-full relative rounded-2xl overflow-hidden bg-[#F5EFE6] border border-[#3E2C23]/15 p-6 md:p-8 shadow-sm flex items-center justify-between min-h-[140px] md:min-h-[160px] select-none">
      {/* Left Text */}
      <div className="z-10 max-w-md">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#2C1D11] tracking-tight">
          All Books
        </h1>
        <p className="text-sm md:text-base font-sans text-[#6E5440]/90 mt-1">
          Your personal collection of books.
        </p>
      </div>

      {/* Right Vintage Artwork Illustration */}
      <div className="hidden sm:flex items-center gap-4 md:gap-6 opacity-95 shrink-0">
        {/* Book stack with small plant */}
        <svg className="w-20 h-24 md:w-24 md:h-28" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Books */}
          <rect x="15" y="80" width="60" height="14" rx="2" fill="#5C3E2B" />
          <rect x="10" y="64" width="70" height="15" rx="2" fill="#8C6747" />
          <rect x="20" y="50" width="52" height="13" rx="2" fill="#4B3425" />
          <rect x="12" y="37" width="65" height="12" rx="2" fill="#9E7A5A" />
          {/* Plant Pot */}
          <path d="M38 37L40 22H60L62 37H38Z" fill="#C4A482" />
          {/* Leaves */}
          <path d="M50 22C45 14 38 16 42 8C48 10 50 18 50 22Z" fill="#4A6B46" />
          <path d="M50 22C55 14 62 16 58 8C52 10 50 18 50 22Z" fill="#3D5A3A" />
          <path d="M50 20C48 10 54 8 50 2C46 8 48 16 50 20Z" fill="#5A7D55" />
        </svg>

        {/* Armchair */}
        <svg className="w-24 h-28 md:w-28 md:h-32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Chair Legs */}
          <rect x="25" y="100" width="6" height="15" fill="#3E2C23" rx="1" />
          <rect x="89" y="100" width="6" height="15" fill="#3E2C23" rx="1" />
          {/* Cushion */}
          <rect x="20" y="75" width="80" height="28" rx="8" fill="#D9C3B0" stroke="#8C6747" strokeWidth="2" />
          {/* Backrest */}
          <path d="M25 30C25 20 35 15 60 15C85 15 95 20 95 30V80H25V30Z" fill="#E6D5C3" stroke="#8C6747" strokeWidth="2" />
          {/* Tufting dots */}
          <circle cx="45" cy="40" r="2.5" fill="#8C6747" />
          <circle cx="75" cy="40" r="2.5" fill="#8C6747" />
          <circle cx="45" cy="60" r="2.5" fill="#8C6747" />
          <circle cx="75" cy="60" r="2.5" fill="#8C6747" />
          {/* Armrests */}
          <rect x="12" y="60" width="16" height="35" rx="6" fill="#CBB49E" stroke="#8C6747" strokeWidth="2" />
          <rect x="92" y="60" width="16" height="35" rx="6" fill="#CBB49E" stroke="#8C6747" strokeWidth="2" />
        </svg>

        {/* Monstera Plant in Woven Basket */}
        <svg className="w-20 h-28 md:w-24 md:h-32" viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Basket */}
          <path d="M25 80L30 120H70L75 80H25Z" fill="#C29B72" stroke="#8C6747" strokeWidth="2" />
          {/* Basket Weave lines */}
          <line x1="28" y1="95" x2="72" y2="95" stroke="#8C6747" strokeWidth="1.5" />
          <line x1="30" y1="108" x2="70" y2="108" stroke="#8C6747" strokeWidth="1.5" />
          {/* Leaves */}
          <path d="M50 80C30 65 20 40 35 25C50 35 50 65 50 80Z" fill="#2E4F2B" />
          <path d="M50 80C70 65 80 40 65 25C50 35 50 65 50 80Z" fill="#3D5A3A" />
          <path d="M50 75C40 50 35 30 50 10C65 30 60 50 50 75Z" fill="#4B6E47" />
          <path d="M50 85C20 75 15 55 30 45C45 55 48 75 50 85Z" fill="#2D4A2A" />
          <path d="M50 85C80 75 85 55 70 45C55 55 52 75 50 85Z" fill="#3B5738" />
        </svg>
      </div>
    </div>
  );
}
