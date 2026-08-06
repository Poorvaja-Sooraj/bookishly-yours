"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface WheelPickerProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  itemHeight?: number;
  visibleCount?: number;
}

const ITEM_HEIGHT = 48;
const VISIBLE_COUNT = 5;

export default function WheelPicker({
  min,
  max,
  value,
  onChange,
  itemHeight = ITEM_HEIGHT,
  visibleCount = VISIBLE_COUNT,
}: WheelPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const centerOffset = Math.floor(visibleCount / 2);
  const containerHeight = visibleCount * itemHeight;

  // Scroll to the selected value
  const scrollToValue = useCallback(
    (val: number, smooth = true) => {
      const container = containerRef.current;
      if (!container) return;
      const index = val - min;
      const targetScrollTop = index * itemHeight;
      container.scrollTo({
        top: targetScrollTop,
        behavior: smooth ? "smooth" : "instant",
      });
    },
    [min, itemHeight]
  );

  // Snap to nearest item after scroll ends
  const snapToNearest = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const index = Math.round(container.scrollTop / itemHeight);
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    const newVal = min + clamped;
    if (newVal !== value) {
      onChange(newVal);
    }
    // Ensure snapped
    container.scrollTo({ top: clamped * itemHeight, behavior: "smooth" });
  }, [itemHeight, items.length, min, onChange, value]);

  const handleScroll = useCallback(() => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    isScrolling.current = true;
    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
      snapToNearest();
    }, 120);
  }, [snapToNearest]);

  // Sync scroll when value changes externally
  useEffect(() => {
    if (!isScrolling.current) {
      scrollToValue(value, false);
    }
  }, [value, scrollToValue]);

  // Initial scroll without animation
  useEffect(() => {
    scrollToValue(value, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (val: number) => {
    onChange(val);
    scrollToValue(val, true);
  };

  return (
    <div
      className="relative select-none"
      style={{ height: containerHeight, width: "100%" }}
    >
      {/* Top & bottom fade gradients */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{
          height: itemHeight * centerOffset,
          background:
            "linear-gradient(to bottom, rgba(250,247,242,1) 0%, rgba(250,247,242,0) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{
          height: itemHeight * centerOffset,
          background:
            "linear-gradient(to top, rgba(250,247,242,1) 0%, rgba(250,247,242,0) 100%)",
        }}
      />

      {/* Active selection highlight box */}
      <div
        className="absolute inset-x-3 z-0 bg-[#F0E6D8] rounded-xl border border-[#C4A890]/50"
        style={{
          top: centerOffset * itemHeight,
          height: itemHeight,
        }}
      />

      {/* Scrollable list */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-scroll no-scrollbar"
        style={{
          paddingTop: centerOffset * itemHeight,
          paddingBottom: centerOffset * itemHeight,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {items.map((item) => {
          const isActive = item === value;
          return (
            <div
              key={item}
              onClick={() => handleClick(item)}
              className={`flex items-center justify-center cursor-pointer transition-all duration-150 font-sans ${
                isActive
                  ? "text-[#3E2C23] font-bold text-lg"
                  : "text-[#6E5440]/60 font-normal text-base"
              }`}
              style={{ height: itemHeight }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}
