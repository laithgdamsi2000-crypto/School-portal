import Link from "next/link";
import { prisma } from "@/lib/prisma";

/**
 * Server component: queries run directly (no client fetch needed) since
 * this page is rendered on the server per-request. Keeps the dashboard
 * home fast and simple — no loading spinners for data that's ready by
 * the time the HTML reaches the browser.
 */
export default async function AdminDashboardPage() {
  const [homeworkCount, announcementCount, subjectCount, gradeCount, recentHomework] =
    await Promise.all([
      prisma.homework.count(),
      prisma.announcement.count(),
      prisma.subject.count(),
      prisma.grade.count(),
      prisma.homework.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { grade: true, subject: true, teacher: true },
      }),
    ]);

  const stats = [
    { label: "إجمالي الواجبات", value: homeworkCount, href: "/admin/homework" },
    { label: "الإعلانات", value: announcementCount, href: "/admin/announcements" },
    { label: "المواد الدراسية", value: subjectCount, href: "/admin/grades" },
    { label: "الصفوف", value: gradeCount, href: "/admin/grades" },
  ];

  const quickActions = [
    { label: "إضافة واجب جديد", href: "/admin/homework/new", primary: true },
    { label: "إضافة إعلان جديد", href: "/admin/announcements/new", primary: false },
    { label: "رفع ملف", href: "/admin/files", primary: false },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-navy-900">مرحباً بك</h1>
        <p className="text-navy-500 text-sm mt-1">نظرة عامة على نشاط البوابة</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-card shadow-card hover:shadow-card-hover transition p-5"
          >
            <p className="text-2xl font-bold text-navy-700 ltr-nums">{s.value}</p>
            <p className="text-sm text-navy-500 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-card shadow-card p-5">
        <h2 className="text-sm font-bold text-navy-900 mb-4">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`px-4 py-2.5 rounded-control text-sm font-medium transition ${
                a.primary
                  ? "bg-gold-500 text-navy-900 hover:bg-gold-700 hover:text-white"
                  : "bg-navy-50 text-navy-700 hover:bg-navy-100"
              }`}
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-card shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-navy-900">آخر الواجبات المضافة</h2>
          <Link href="/admin/homework" className="text-xs text-sky-700 font-medium">
            عرض الكل ←
          </Link>
        </div>

        {recentHomework.length === 0 ? (
          <p className="text-sm text-navy-300 py-8 text-center">
            لا توجد واجبات بعد — ابدأ بإضافة أول واجب
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-navy-50">
            {recentHomework.map((hw) => (
              <Link
                key={hw.id}
                href={`/admin/homework/${hw.id}/edit`}
                className="flex items-center justify-between py-3 hover:bg-navy-50 -mx-2 px-2 rounded-control transition"
              >
                <div>
                  <p className="text-sm font-medium text-navy-900">{hw.title}</p>
                  <p className="text-xs text-navy-500 mt-0.5">
                    {hw.subject.name} · {hw.grade.name}
                    {hw.teacher ? ` · ${hw.teacher.name}` : ""}
                  </p>
                </div>
                {hw.status === "IMPORTANT" && (
                  <span className="text-[11px] font-bold bg-red-50 text-status-error px-2.5 py-1 rounded-full shrink-0">
                    مهم
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
