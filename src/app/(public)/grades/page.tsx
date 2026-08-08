import Link from "next/link";
import { BookOpen, Megaphone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/public/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

// See src/app/(public)/page.tsx for why this is required -- without it,
// this page is statically frozen at build time and homework/announcement
// counts never update.
export const dynamic = "force-dynamic";

export default async function GradesIndexPage() {
  const grades = await prisma.grade.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { homeworks: true, announcements: true } } },
  });

  const basic = grades.filter((g) => g.order <= 9);
  const secondary = grades.filter((g) => g.order > 9);

  return (
    <div>
      <PageHeader title="الصفوف الدراسية" subtitle="اختر الصف لعرض واجباته وإعلاناته وملفاته" />

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <Reveal>
          <h2 className="text-sm font-bold text-navy-700 mb-3">المرحلة الأساسية</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-8">
            {basic.map((g) => (
              <GradeTile key={g.id} grade={g} />
            ))}
          </div>
        </Reveal>

        <Reveal delayMs={100}>
          <h2 className="text-sm font-bold text-navy-700 mb-3">المرحلة الثانوية</h2>
          <div className="grid grid-cols-3 gap-3">
            {secondary.map((g) => (
              <GradeTile key={g.id} grade={g} />
            ))}
          </div>
        </Reveal>
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
      className="bg-white border border-navy-50 rounded-card shadow-card hover:border-sky-500 hover:shadow-card-hover hover:-translate-y-0.5 transition duration-300 text-center py-6 px-3"
    >
      <b className="block text-navy-700 text-sm font-bold mb-2">{grade.name}</b>
      <span className="flex items-center justify-center gap-1 text-[11px] text-navy-500 ltr-nums">
        <BookOpen size={12} strokeWidth={2} aria-hidden="true" />
        {grade._count.homeworks}
      </span>
      <span className="flex items-center justify-center gap-1 text-[11px] text-navy-500 ltr-nums mt-0.5">
        <Megaphone size={12} strokeWidth={2} aria-hidden="true" />
        {grade._count.announcements}
      </span>
    </Link>
  );
}
