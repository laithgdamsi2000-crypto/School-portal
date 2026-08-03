import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/homework", label: "الواجبات" },
  { href: "/grades", label: "الصفوف" },
  { href: "/announcements", label: "الإعلانات" },
  { href: "/downloads", label: "التحميلات" },
  { href: "/about", label: "عن المدرسة" },
  { href: "/contact", label: "تواصل معنا" },
];

export function PublicHeader() {
  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-navy-50 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3.5">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo/phoenix-logo.jpeg"
            alt="شعار مدرسة العنقاء"
            width={42}
            height={42}
            className="rounded-lg"
          />
          <div>
            <p className="font-bold text-sm text-navy-900">مدرسة العنقاء</p>
            <p className="text-xs text-navy-500">Phoenix School</p>
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

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/search"
            aria-label="بحث"
            className="w-9 h-9 flex items-center justify-center rounded-control text-navy-700 hover:bg-navy-50 transition"
          >
            <Search size={18} strokeWidth={2} />
          </Link>
          <Link
            href="/admin/login"
            className="bg-navy-700 hover:bg-navy-900 text-white text-sm font-medium rounded-control px-5 py-2.5 transition"
          >
            دخول الإدارة
          </Link>
        </div>
      </div>
    </header>
  );
}
