import React from "react";
import Image from "next/image";
import Link from "next/link";

const Flourish = () => (
  <div className="flex items-center justify-center space-x-4 mt-3 mb-1 md:mb-3 animate-fade-in animation-delay-150 relative z-10">
    <div className="h-[1px] w-12 md:w-16 bg-[#3E2C23]/25" />
    <span className="text-[#3E2C23]/50 text-xs select-none">♥</span>
    <div className="h-[1px] w-12 md:w-16 bg-[#3E2C23]/25" />
  </div>
);

export default function Hero() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[#F8F5F2] bg-[url('/landing_bg_mb.png')] md:bg-[url('/landing_bg_desk.png')] bg-cover md:bg-[length:100%_100%] bg-center bg-no-repeat px-6 pt-8 pb-12 md:pt-12 md:pb-24 text-center select-none overflow-hidden">
      
      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-3xl w-full">
        
        {/* Logo Container - Pure logo without any blurred box or white overlay */}
        <div className="relative w-full max-w-[680px] h-auto mt-6 md:mt-0 -mb-5 animate-fade-in flex items-center justify-center">
          <Image
            src="/branding/logo_bgremoved.png"
            alt="Bookishly Yours Logo"
            width={1408}
            height={636}
            priority
            className="w-full h-auto object-contain select-none pointer-events-none filter drop-shadow-[0_4px_12px_rgba(44,29,17,0.16)]"
          />
        </div>

        {/* Separator / Flourish */}
        <Flourish />

        {/* Tagline / Description */}
        <p className="relative z-10 text-[#2C1D11] text-lg md:text-xl font-normal leading-relaxed max-w-xl mx-auto tracking-wide animate-fade-in animation-delay-150">
          Every book leaves behind a memory. <br />
          Preserve not just the stories you read, but the person you were while reading them.
        </p>

        {/* Onboarding Button */}
        <div className="relative z-10 pt-6 md:pt-12 animate-fade-in animation-delay-300">
          <Link
            href="/auth"
            className="inline-block px-8 py-3.5 bg-[#3E2C23] text-[#F8F5F2] rounded-full text-base md:text-lg font-medium shadow-lg shadow-[#3E2C23]/25 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-[2px] hover:shadow-xl hover:shadow-[#3E2C23]/35 active:scale-[0.98]"
          >
            Start Your Reading Journey
          </Link>
        </div>
      </div>
    </div>
  );
}
