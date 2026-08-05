"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  BookCheck,
  Bookmark,
  Library,
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({
  mobileOpen = false,
  setMobileOpen,
}: SidebarProps) {
  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, active: true },
    { label: "All Books", icon: Library, active: false },
    { label: "Completed Books", icon: BookCheck, active: false },
    { label: "Currently Reading", icon: BookOpen, active: false },
    { label: "Want to Read", icon: Bookmark, active: false },
  ];

  const renderContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-[#2C1D11] text-[#F8F5F2] shadow-2xl justify-between p-4 md:p-5 select-none border-r border-[#3E2C23]/40">
      {/* Top Logo & Brand */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-5 pb-3 border-b border-[#3E2C23]/60">
          <Link href="/dashboard" className="block relative w-full h-16 md:h-20 lg:h-22 max-w-[230px] lg:max-w-[250px]">
            <Image
              src="/branding/logo_bgremoved.png"
              alt="Bookishly Yours Logo"
              fill
              sizes="260px"
              priority
              className="object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
            />
          </Link>
          {isMobile && (
            <button
              onClick={() => setMobileOpen?.(false)}
              className="text-[#D4C3B3] hover:text-[#F8F5F2] p-1.5 rounded-lg hover:bg-[#3E2C23] transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Navigation items (UI-only) */}
        <nav className="space-y-1 md:space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-sans font-medium transition-all duration-200 cursor-pointer ${
                  item.active
                    ? "bg-[#4E3524] text-[#F8F5F2] shadow-md border border-[#6E5440]/30 font-semibold"
                    : "text-[#D4C3B3] hover:bg-[#3E2C23]/80 hover:text-[#F8F5F2]"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${item.active ? "text-[#E6B89C]" : "text-[#B8A08C]"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logout Button (UI only) */}
      <div className="pt-3 border-t border-[#3E2C23]/60">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-sans font-medium text-[#E8A598] hover:bg-[#3E2C23] hover:text-[#FFC4B8] transition-colors cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5 text-[#E8A598]" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 md:flex-col md:fixed md:inset-y-0 md:left-0 z-30">
        {renderContent(false)}
      </aside>

      {/* Mobile Backdrop & Overlay Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#17110C]/65 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen?.(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#2C1D11] shadow-2xl transition duration-300 transform ease-in-out">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
