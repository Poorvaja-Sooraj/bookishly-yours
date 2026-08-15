import { useEffect } from "react";

/**
 * Custom hook to lock body (and optionally html) scrolling when a modal/overlay is open.
 * Saves and restores previous overflow styles.
 * @param active Condition under which scrolling should be locked.
 * @param lockHtml Whether to also lock documentElement (html) scrolling. Defaults to false.
 */
export function useScrollLock(active: boolean, lockHtml = false) {
  useEffect(() => {
    if (!active) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    if (lockHtml) {
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      if (lockHtml) {
        document.documentElement.style.overflow = prevHtmlOverflow;
      }
    };
  }, [active, lockHtml]);
}
