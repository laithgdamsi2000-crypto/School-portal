"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/homework", label: "الواجبات" },
  { href: "/grades", label: "الصفوف" },
  { href: "/announcements", label: "الإعلانات" },
  { href: "/downloads", label: "التحميلات" },
  { href: "/about", label: "عن المدرسة" },
  { href: "/contact", label: "تواصل معنا" },
];

/**
 * The nav links were `hidden lg:flex` with no mobile fallback at all --
 * below the lg breakpoint there was no way to reach /homework, /grades,
 * /announcements, etc. except by typing the URL. This adds a hamburger
 * menu that only exists below lg (the desktop row is untouched).
 */
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="bg-white/90 dark:bg-navy-900/90 backdrop-blur-sm border-b border-navy-50 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Image
            src="/logo/phoenix-logo.jpeg"
            alt="شعار مدرسة العنقاء"
            width={38}
            height={38}
            className="rounded-lg shrink-0"
          />
          <div className="min-w-0">
            <p className="font-bold text-sm text-navy-900 truncate">مدرسة العنقاء</p>
            <p className="text-xs text-navy-500 truncate">Phoenix School</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-navy-700 hover:text-gold-700 transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />
          <Link
            href="/search"
            aria-label="بحث"
            className="w-9 h-9 flex items-center justify-center rounded-control text-navy-700 hover:bg-navy-50 transition"
          >
            <Search size={18} strokeWidth={2} />
          </Link>
          <Link
            href="/admin/login"
            className="hidden lg:inline-block bg-navy-700 hover:bg-navy-900 text-white text-sm font-medium rounded-control px-5 py-2.5 transition"
          >
            دخول الإدارة
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-control text-navy-700 hover:bg-navy-50 transition"
          >
            {open ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-navy-50 bg-white dark:bg-navy-900 px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2.5 rounded-control text-sm font-medium text-navy-700 hover:bg-navy-50 transition"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/admin/login"
            className="mt-2 text-center bg-navy-700 hover:bg-navy-900 text-white text-sm font-medium rounded-control px-5 py-2.5 transition"
          >
            دخول الإدارة
          </Link>
        </nav>
      )}
    </header>
  );
}
