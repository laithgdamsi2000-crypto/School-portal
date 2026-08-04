import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HomeworkCard } from "@/components/public/HomeworkCard";
import { GradeScheduleTabs } from "@/components/public/GradeScheduleTabs";
import { getSectionsForGrade } from "@/lib/grade-sections";
import { PageHeader } from "@/components/public/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

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
    <div>
      <PageHeader title={grade.name}>
        <div className="flex items-center gap-2 text-xs text-navy-300 mb-3">
          <Link href="/grades" className="hover:text-white transition">الصفوف</Link>
          <span>/</span>
          <span className="text-navy-100 font-medium">{grade.name}</span>
        </div>
      </PageHeader>

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <section className="mb-10">
          <h2 className="text-sm font-bold text-navy-700 mb-4">الجداول</h2>
          <Reveal>
            <GradeScheduleTabs sections={sections} gradeName={grade.name} />
          </Reveal>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-bold text-navy-700 mb-4">الواجبات</h2>
          {homework.length === 0 ? (
            <Reveal>
              <p className="text-sm text-navy-300 py-8 text-center bg-white rounded-card shadow-card">
                لا توجد واجبات لهذا الصف بعد
              </p>
            </Reveal>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {homework.map((hw, i) => (
                <Reveal key={hw.id} delayMs={Math.min(i, 5) * 60}>
                  <HomeworkCard homework={hw} showGrade={false} />
                </Reveal>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-bold text-navy-700 mb-4">الإعلانات</h2>
          {announcements.length === 0 ? (
            <Reveal>
              <p className="text-sm text-navy-300 py-8 text-center bg-white rounded-card shadow-card">
                لا توجد إعلانات لهذا الصف بعد
              </p>
            </Reveal>
          ) : (
            <div className="flex flex-col gap-3">
              {announcements.map((a, i) => (
                <Reveal key={a.id} delayMs={Math.min(i, 6) * 60}>
                  <Link
                    href={`/announcements/${a.id}`}
                    className={`block rounded-card p-5 border transition duration-300 hover:shadow-card-hover hover:-translate-y-0.5 ${
                      a.isImportant ? "bg-gold-50 border-gold-300" : "bg-white border-navy-50"
                    }`}
                  >
                    <h3 className="text-sm font-bold text-navy-900 mb-1">{a.title}</h3>
                    <p className="text-[13px] text-navy-500 line-clamp-2">{a.content}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
