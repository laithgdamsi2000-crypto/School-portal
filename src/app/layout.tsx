import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مدرسة العنقاء (Phoenix School) | البوابة الإلكترونية",
  description: "بوابة الواجبات والإعلانات المدرسية لأولياء الأمور والطلاب - مدرسة العنقاء (Phoenix School)",
};

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
