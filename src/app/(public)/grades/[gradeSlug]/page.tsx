import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HomeworkCard } from "@/components/public/HomeworkCard";
import { GradeScheduleTabs } from "@/components/public/GradeScheduleTabs";
import { getSectionsForGrade } from "@/lib/grade-sections";

interface Props {
  params: { gradeSlug: string };
}

export default async function GradeDetailPage({ params }: Props) {
  const grade = await prisma.grade.findUnique({ where: { slug: params.gradeSlug } });

  if (!grade) {
    notFound();
  }

  const [sections, homework, announcements] = await Promise.all([
    getSectionsForGrade(grade.id),
    prisma.homework.findMany({
      where: { gradeId: grade.id },
      include: { grade: true, subject: true, teacher: true },
      orderBy: { dueDate: "desc" },
      take: 20,
    }),
    prisma.announcement.findMany({
      where: { OR: [{ scope: "SCHOOL_WIDE" }, { gradeId: grade.id }] },
      orderBy: [{ isImportant: "desc" }, { createdAt: "desc" }],
      take: 10,
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center gap-2 text-xs text-navy-500 mb-4">
        <Link href="/grades" className="hover:text-navy-700">الصفوف</Link>
        <span>/</span>
        <span className="text-navy-700 font-medium">{grade.name}</span>
      </div>
      <h1 className="text-xl font-bold text-navy-900 mb-8">{grade.name}</h1>

      <section className="mb-10">
        <h2 className="text-sm font-bold text-navy-700 mb-4">الجداول</h2>
        <GradeScheduleTabs sections={sections} gradeName={grade.name} />
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-bold text-navy-700 mb-4">الواجبات</h2>
        {homework.length === 0 ? (
          <p className="text-sm text-navy-300 py-8 text-center bg-white rounded-card shadow-card">
            لا توجد واجبات لهذا الصف بعد
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {homework.map((hw) => (
              <HomeworkCard key={hw.id} homework={hw} showGrade={false} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold text-navy-700 mb-4">الإعلانات</h2>
        {announcements.length === 0 ? (
          <p className="text-sm text-navy-300 py-8 text-center bg-white rounded-card shadow-card">
            لا توجد إعلانات لهذا الصف بعد
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {announcements.map((a) => (
              <Link
                key={a.id}
                href={`/announcements/${a.id}`}
                className={`rounded-card p-5 border transition hover:shadow-card-hover ${
                  a.isImportant ? "bg-gold-50 border-gold-300" : "bg-white border-navy-50"
                }`}
              >
                <h3 className="text-sm font-bold text-navy-900 mb-1">{a.title}</h3>
                <p className="text-[13px] text-navy-500 line-clamp-2">{a.content}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
