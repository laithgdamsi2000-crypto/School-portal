"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  LayoutDashboard,
  BookOpen,
  Megaphone,
  FolderOpen,
  School,
  Users,
  Settings,
  LogOut,
  Home,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_ITEMS = [
  { href: "/admin", label: "الرئيسية", Icon: LayoutDashboard },
  { href: "/admin/homework", label: "الواجبات", Icon: BookOpen },
  { href: "/admin/announcements", label: "الإعلانات", Icon: Megaphone },
  { href: "/admin/files", label: "إدارة الملفات", Icon: FolderOpen },
  { href: "/admin/grades", label: "الصفوف والمواد", Icon: School },
  { href: "/admin/admins", label: "المديرون", Icon: Users },
  { href: "/admin/settings", label: "الإعدادات", Icon: Settings },
];

/**
 * Was `hidden md:flex` with no fallback -- below md, admins had zero
 * navigation inside /admin/*, not even a way to sign out. This adds a
 * slim mobile topbar (hamburger) that opens the same nav/sign-out
 * content as a slide-in drawer. The desktop <aside> is untouched.
 */
export function DashboardSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function NavContent() {
    return (
      <>
        <div className="px-3 pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-control text-sm font-medium text-navy-100 hover:bg-white/5 transition"
          >
            <Home size={18} strokeWidth={2} aria-hidden="true" />
            العودة للموقع
          </Link>
        </div>
        <div className="mx-3 my-2 border-t border-white/10" />

        <nav className="flex-1 px-3 pb-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-control text-sm font-medium transition ${
                  active
                    ? "bg-gold-500 text-[#221d4d]"
                    : "text-navy-100 hover:bg-white/5"
                }`}
              >
                <item.Icon size={18} strokeWidth={2} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 pb-3">
            <p className="text-xs text-navy-300">مسجل الدخول باسم</p>
            <p className="text-sm font-medium truncate">{adminName}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-control text-sm text-navy-100 hover:bg-white/5 transition"
          >
            <LogOut size={18} strokeWidth={2} aria-hidden="true" />
            تسجيل الخروج
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden flex items-center justify-between bg-navy-900 text-white px-4 py-3 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <Image src="/logo/phoenix-logo.jpeg" alt="شعار مدرسة العنقاء" width={30} height={30} className="rounded-lg" />
          <span className="font-bold text-sm">مدرسة العنقاء</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle className="w-9 h-9 flex items-center justify-center rounded-control text-navy-100 hover:bg-white/5 transition" />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="فتح القائمة"
            aria-expanded={open}
            className="w-9 h-9 flex items-center justify-center rounded-control text-navy-100 hover:bg-white/5 transition"
          >
            <Menu size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <aside className="w-64 bg-navy-900 text-white flex flex-col shrink-0">
            <div className="flex items-center justify-between px-5 py-6 border-b border-white/10">
              <span className="font-bold text-sm">القائمة</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق القائمة"
                className="w-8 h-8 flex items-center justify-center rounded-control text-navy-100 hover:bg-white/5 transition"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <NavContent />
          </aside>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="w-64 bg-navy-900 text-white flex-col shrink-0 hidden md:flex">
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <Image
            src="/logo/phoenix-logo.jpeg"
            alt="شعار مدرسة العنقاء"
            width={38}
            height={38}
            className="rounded-lg"
          />
          <div className="flex-1">
            <p className="font-bold text-sm">مدرسة العنقاء</p>
            <p className="text-navy-300 text-xs">Phoenix School</p>
          </div>
          <ThemeToggle className="w-8 h-8 flex items-center justify-center rounded-control text-navy-100 hover:bg-white/5 transition shrink-0" />
        </div>
        <NavContent />
      </aside>
    </>
  );
}
