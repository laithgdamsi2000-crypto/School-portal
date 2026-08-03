"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const DEFAULT_CLASS =
  "w-9 h-9 flex items-center justify-center rounded-control text-navy-700 hover:bg-navy-50 transition";

/**
 * Manual-only toggle -- no system-preference auto-switching. Reads/writes
 * localStorage("theme"); the actual no-flash-on-load application of the
 * saved preference happens via the inline script in layout.tsx, which
 * runs before paint (this component just reflects and updates that
 * state after hydration).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "التبديل للوضع الفاتح" : "التبديل للوضع الداكن"}
      className={className ?? DEFAULT_CLASS}
    >
      {isDark ? <Sun size={18} strokeWidth={2} aria-hidden="true" /> : <Moon size={18} strokeWidth={2} aria-hidden="true" />}
    </button>
  );
}
