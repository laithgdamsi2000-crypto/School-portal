import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminAnnouncementsListPage() {
  const announcements = await prisma.announcement.findMany({
    include: { grade: true },
    orderBy: [{ isImportant: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-900">الإعلانات</h1>
          <p className="text-navy-500 text-sm mt-1">{announcements.length} إعلان</p>
        </div>
        <Link
          href="/admin/announcements/new"
          className="bg-gold-500 hover:bg-gold-700 hover:text-white text-[#221d4d] font-medium rounded-control px-5 py-2.5 text-sm transition"
        >
          + إضافة إعلان
        </Link>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {announcements.length === 0 ? (
          <p className="text-sm text-navy-300 py-12 text-center">لا توجد إعلانات بعد</p>
        ) : (
          <div className="divide-y divide-navy-50">
            {announcements.map((a) => (
              <Link
                key={a.id}
                href={`/admin/announcements/${a.id}/edit`}
                className="flex items-center justify-between gap-4 py-4 px-5 hover:bg-navy-50 transition"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate">{a.title}</p>
                  <p className="text-xs text-navy-500 mt-1">
                    {a.scope === "SCHOOL_WIDE" ? "كل المدرسة" : a.grade?.name}
                    {" · "}
                    {new Intl.DateTimeFormat("ar-LY").format(a.createdAt)}
                  </p>
                </div>
                {a.isImportant && (
                  <span className="text-[11px] font-bold bg-red-50 text-status-error px-2.5 py-1 rounded-full shrink-0">
                    هام
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
