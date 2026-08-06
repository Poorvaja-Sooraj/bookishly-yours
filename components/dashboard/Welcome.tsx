import React from "react";
import Image from "next/image";

export default function Welcome() {
  return (
    <section className="w-full relative rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-[#3E2C23]/15 bg-[#FAF7F2] select-none shrink-0 flex items-center">
      <Image
        src="/static/welcome.png"
        alt="Welcome to Bookishly Yours"
        width={1920}
        height={340}
        priority
        className="w-full h-auto object-cover object-center max-h-[140px] sm:max-h-[175px] md:max-h-[200px] lg:max-h-[220px]"
      />
      {/* Vintage Calligraphic Cursive Quote Overlay on Left (2 lines) */}
      <div className="absolute left-20 sm:left-24 md:left-28 lg:left-32 top-1/2 -translate-y-1/2 max-w-[60%] sm:max-w-[50%] md:max-w-[45%] pointer-events-none">
        <p className="font-[family-name:var(--font-great-vibes)] text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#4A3222] leading-tight drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] tracking-wide">
          &ldquo;You will never be alone <br />
          if you have got a book.&rdquo;
        </p>
      </div>
    </section>
  );
}
