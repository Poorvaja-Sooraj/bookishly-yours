import React from "react";
import Image from "next/image";

export default function Welcome() {
  return (
    <section className="w-full relative rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-[#3E2C23]/15 bg-[#FAF7F2] select-none shrink-0">
      <Image
        src="/static/welcome.png"
        alt="Welcome to Bookishly Yours"
        width={1920}
        height={340}
        priority
        className="w-full h-auto object-cover object-center max-h-[85px] sm:max-h-[105px] md:max-h-[120px] lg:max-h-[135px]"
      />
    </section>
  );
}
