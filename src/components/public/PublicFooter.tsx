import Link from "next/link";
import Image from "next/image";

const QUICK_LINKS = [
  { href: "/homework", label: "الواجبات" },
  { href: "/grades", label: "الصفوف الدراسية" },
  { href: "/announcements", label: "الإعلانات" },
  { href: "/downloads", label: "التحميلات" },
];

const ABOUT_LINKS = [
  { href: "/about", label: "عن المدرسة" },
  { href: "/contact", label: "تواصل معنا" },
  { href: "/admin/login", label: "دخول الإدارة" },
];

export function PublicFooter() {
  return (
    <footer className="bg-navy-900 text-navy-100 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 sm:grid-cols-3">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-3">
            <Image
              src="/logo/phoenix-logo.jpeg"
              alt="شعار مدرسة العنقاء"
              width={38}
              height={38}
              className="rounded-lg"
            />
            <div>
              <p className="font-bold text-sm text-white">مدرسة العنقاء</p>
              <p className="text-xs text-navy-300">Phoenix School</p>
            </div>
          </Link>
          <p className="text-xs text-navy-300 leading-6 max-w-[220px]">
            البوابة الإلكترونية للواجبات والإعلانات المدرسية لأولياء الأمور والطلاب.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-white mb-3">روابط سريعة</h3>
          <ul className="flex flex-col gap-2">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-xs text-navy-300 hover:text-gold-300 transition">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold text-white mb-3">عن البوابة</h3>
          <ul className="flex flex-col gap-2">
            {ABOUT_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-xs text-navy-300 hover:text-gold-300 transition">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="max-w-6xl mx-auto px-6 py-5 text-xs text-navy-300 text-center">
          © {new Date().getFullYear()} مدرسة العنقاء (Phoenix School) — جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}
