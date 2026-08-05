"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
//import Header from "@/components/dashboard/Header";
import Welcome from "@/components/dashboard/Welcome";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#F8F5F2] flex flex-col md:flex-row text-[#2C1D11]">
      {/* Sidebar Component */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Mobile Topbar with Hamburger Menu */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#2C1D11] text-[#F8F5F2] border-b border-[#3E2C23]/50 sticky top-0 z-20 shadow-md">
        <Link href="/dashboard" className="relative w-36 h-9">
          <Image
            src="/branding/logo_bgremoved.png"
            alt="Bookishly Yours Logo"
            fill
            sizes="150px"
            priority
            className="object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
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

      {/* Main Content Area - Single Viewport on Desktop */}
      <main className="flex-1 md:pl-64 lg:pl-72 w-full h-full flex flex-col overflow-y-auto md:overflow-hidden">
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 h-full flex flex-col space-y-3 md:space-y-4 max-w-7xl mx-auto w-full">
          {/* Header Banner 
          <Header />
          */}

          {/* Welcome Banner */}
          <Welcome />

          {/* Statistics Cards */}
          <StatsCards />

          {/* Recent Activity Card */}
          <RecentActivity />
        </div>
      </main>
    </div>
  );
}
