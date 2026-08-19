"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Welcome from "@/components/dashboard/Welcome";
import { BookProvider } from "@/context/BookContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <BookProvider>
      <div className="min-h-screen bg-[#F8F5F2] flex flex-col md:flex-row text-[#2C1D11]">
        {/* Fixed Left Sidebar */}
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Mobile Topbar with Hamburger Menu */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#2C1D11] text-[#F8F5F2] border-b border-[#3E2C23]/50 sticky top-0 z-20 shadow-md">
          <Link href="/dashboard" className="relative w-36 h-9">
            <Image
              src="/branding/logo.png"
              alt="Bookishly Yours Logo"
              fill
              sizes="150px"
              priority
              className="object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
            />
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-[#D4C3B3] hover:text-[#F8F5F2] rounded-xl hover:bg-[#3E2C23] transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Single Unified Page Scroll Container with Stable Scrollbar Gutter */}
        <main className="flex-1 md:pl-64 lg:pl-72 w-full min-h-screen overflow-y-auto [scrollbar-gutter:stable]">
          <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* Welcome Banner */}
            <Welcome />

            {/* Sub-Page Content */}
            {children}
          </div>
        </main>
      </div>
    </BookProvider>
  );
}
