import { useEffect } from "react";

/**
 * Custom hook to trigger a callback when the Escape key is pressed.
 * @param active Condition under which the Escape key handler should be active.
 * @param onEscape Callback function to execute when Escape key is pressed.
 */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, onEscape]);
}
