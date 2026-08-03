"use client";

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
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "الرئيسية", Icon: LayoutDashboard },
  { href: "/admin/homework", label: "الواجبات", Icon: BookOpen },
  { href: "/admin/announcements", label: "الإعلانات", Icon: Megaphone },
  { href: "/admin/files", label: "إدارة الملفات", Icon: FolderOpen },
  { href: "/admin/grades", label: "الصفوف والمواد", Icon: School },
  { href: "/admin/admins", label: "المديرون", Icon: Users },
  { href: "/admin/settings", label: "الإعدادات", Icon: Settings },
];

export function DashboardSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-navy-900 text-white flex flex-col shrink-0 hidden md:flex">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <Image
          src="/logo/phoenix-logo.jpeg"
          alt="شعار مدرسة العنقاء"
          width={38}
          height={38}
          className="rounded-lg"
        />
        <div>
          <p className="font-bold text-sm">مدرسة العنقاء</p>
          <p className="text-navy-300 text-xs">لوحة التحكم</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
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
                  ? "bg-gold-500 text-navy-900"
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
    </aside>
  );
}
