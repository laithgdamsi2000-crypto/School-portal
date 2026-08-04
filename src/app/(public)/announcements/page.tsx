import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/public/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    include: { grade: true },
    orderBy: [{ isImportant: "desc" }, { createdAt: "desc" }],
    take: 30,
  });

  return (
    <div>
      <PageHeader title="الإعلانات" subtitle="آخر إعلانات المدرسة" maxWidth="max-w-3xl" />

      <div className="max-w-3xl mx-auto px-6 pb-16">
        {announcements.length === 0 ? (
          <Reveal>
            <p className="text-sm text-navy-300 py-16 text-center bg-white rounded-card shadow-card">
              لا توجد إعلانات بعد
            </p>
          </Reveal>
        ) : (
          <div className="flex flex-col gap-3">
            {announcements.map((a, i) => (
              <Reveal key={a.id} delayMs={Math.min(i, 6) * 60}>
                <Link
                  href={`/announcements/${a.id}`}
                  className={`rounded-card p-5 border transition duration-300 hover:shadow-card-hover hover:-translate-y-0.5 flex gap-4 ${
                    a.isImportant ? "bg-gold-50 border-gold-300" : "bg-white border-navy-50"
                  }`}
                >
                  {a.isImportant && (
                    <div className="w-9 h-9 rounded-control bg-gold-500 text-white font-bold flex items-center justify-center shrink-0">!</div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h2 className="text-sm font-bold text-navy-900">{a.title}</h2>
                    </div>
                    <p className="text-[13px] text-navy-500 line-clamp-2 mb-2">{a.content}</p>
                    <p className="text-[11px] text-navy-500">
                      {a.scope === "SCHOOL_WIDE" ? "إعلان عام" : a.grade?.name} ·{" "}
                      {new Intl.DateTimeFormat("ar-LY").format(a.createdAt)}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
