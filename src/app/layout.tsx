import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مدرسة العنقاء | البوابة الإلكترونية",
  description: "بوابة الواجبات والإعلانات المدرسية لأولياء الأمور والطلاب - مدرسة العنقاء",
};

// Logo file lives at /public/logo/phoenix-logo.jpeg — reference it in the
// header/nav component as <Image src="/logo/phoenix-logo.jpeg" ... />.
// A true vector (SVG) version of the logo, if the school has one, would
// render more crisply at small sizes (favicon, nav) than this raster export.

/**
 * dir="rtl" here is what makes the entire app right-to-left — Tailwind's
 * spacing/flex utilities respond to this automatically in v3.3+ (ms-*, me-*,
 * ps-*, pe-* map to the correct physical side). Components should prefer
 * these logical utilities over left-*/right-* so RTL isn't fought page by page.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
