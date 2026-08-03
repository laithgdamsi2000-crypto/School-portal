import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function GradesIndexPage() {
  const grades = await prisma.grade.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { homeworks: true, announcements: true } } },
  });

  const basic = grades.filter((g) => g.order <= 9);
  const secondary = grades.filter((g) => g.order > 9);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-xl font-bold text-navy-900 mb-1">الصفوف الدراسية</h1>
      <p className="text-navy-500 text-sm mb-8">اختر الصف لعرض واجباته وإعلاناته وملفاته</p>

      <h2 className="text-sm font-bold text-navy-700 mb-3">المرحلة الأساسية</h2>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-8">
        {basic.map((g) => (
          <GradeTile key={g.id} grade={g} />
        ))}
      </div>

      <h2 className="text-sm font-bold text-navy-700 mb-3">المرحلة الثانوية</h2>
      <div className="grid grid-cols-3 gap-3">
        {secondary.map((g) => (
          <GradeTile key={g.id} grade={g} />
        ))}
      </div>
    </div>
  );
}

function GradeTile({
  grade,
}: {
  grade: { slug: string; name: string; _count: { homeworks: number; announcements: number } };
}) {
  return (
    <Link
      href={`/grades/${grade.slug}`}
      className="bg-white border border-navy-50 rounded-card shadow-card hover:border-sky-500 hover:shadow-card-hover transition text-center py-6 px-3"
    >
      <b className="block text-navy-700 text-sm font-bold mb-1.5">{grade.name}</b>
      <span className="text-[11px] text-navy-500 ltr-nums block">{grade._count.homeworks} واجب</span>
      <span className="text-[11px] text-navy-500 ltr-nums block">{grade._count.announcements} إعلان</span>
    </Link>
  );
}
