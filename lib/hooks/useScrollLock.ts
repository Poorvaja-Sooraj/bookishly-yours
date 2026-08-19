import { useEffect } from "react";

// Global lock counter to handle nested or overlapping modals safely
let activeLockCount = 0;
let savedBodyOverflow: string | null = null;
let savedHtmlOverflow: string | null = null;

/**
 * Custom hook to lock body (and optionally html) scrolling when a modal/overlay is open.
 * Uses reference counting so overlapping or unmounting modals cleanly restore scrolling.
 * @param active Condition under which scrolling should be locked.
 * @param lockHtml Whether to also lock documentElement (html) scrolling. Defaults to false.
 */
export function useScrollLock(active: boolean, lockHtml = false) {
  useEffect(() => {
    if (!active) return;

    if (activeLockCount === 0) {
      savedBodyOverflow = document.body.style.overflow;
      savedHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      if (lockHtml) {
        document.documentElement.style.overflow = "hidden";
      }
    } else if (lockHtml && document.documentElement.style.overflow !== "hidden") {
      document.documentElement.style.overflow = "hidden";
    }

    activeLockCount++;

    return () => {
      activeLockCount = Math.max(0, activeLockCount - 1);
      if (activeLockCount === 0) {
        document.body.style.overflow = savedBodyOverflow ?? "";
        document.documentElement.style.overflow = savedHtmlOverflow ?? "";
        savedBodyOverflow = null;
        savedHtmlOverflow = null;
      }
    };
  }, [active, lockHtml]);
}

