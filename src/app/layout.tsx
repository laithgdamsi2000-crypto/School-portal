import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مدرسة العنقاء (Phoenix School) | البوابة الإلكترونية",
  description: "بوابة الواجبات والإعلانات المدرسية لأولياء الأمور والطلاب - مدرسة العنقاء (Phoenix School)",
};

// Runs before paint so a returning visitor who picked dark mode never
// sees a flash of the light theme. Manual-only (no system-preference
// fallback) -- matches ThemeToggle.tsx, which is the only way "theme"
// ever gets written to localStorage.
const THEME_INIT_SCRIPT = `
  try {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
