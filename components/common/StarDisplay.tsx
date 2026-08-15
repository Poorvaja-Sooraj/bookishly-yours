import React from "react";
import { Star } from "lucide-react";

interface StarDisplayProps {
  rating: number;
  size?: string;
  showNumeric?: boolean;
  numericSize?: string;
}

/**
 * Renders a 5-star rating display with support for full, half, and empty stars.
 */
export default function StarDisplay({
  rating,
  size = "w-4 h-4",
  showNumeric = false,
  numericSize = "text-xs",
}: StarDisplayProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        if (s <= Math.floor(rating)) {
          return (
            <Star
              key={s}
              className={`${size} fill-[#F5A623] text-[#F5A623]`}
            />
          );
        }
        if (s === Math.ceil(rating) && rating % 1 !== 0) {
          return (
            <span key={s} className={`relative ${size} inline-block`}>
              <Star className={`${size} text-[#D5C9B8] absolute inset-0`} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: "50%" }}
              >
                <Star
                  className={`${size} fill-[#F5A623] text-[#F5A623]`}
                />
              </span>
            </span>
          );
        }
        return <Star key={s} className={`${size} text-[#D5C9B8]`} />;
      })}
      {showNumeric && (
        <span className={`${numericSize} font-sans font-bold text-[#2C1D11] ml-0.5`}>
          {rating}
        </span>
      )}
    </div>
  );
}
