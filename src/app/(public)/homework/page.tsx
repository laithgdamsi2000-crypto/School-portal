import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HomeworkCard } from "@/components/public/HomeworkCard";

interface Props {
  searchParams: { q?: string; gradeId?: string; subjectId?: string; page?: string };
}

const PAGE_SIZE = 12;

export default async function HomeworkBrowsePage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const { q, gradeId, subjectId } = searchParams;

  const where = {
    ...(gradeId && { gradeId }),
    ...(subjectId && { subjectId }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const [items, total, grades, subjects] = await Promise.all([
    prisma.homework.findMany({
      where,
      include: { grade: true, subject: true, teacher: true },
      orderBy: { dueDate: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.homework.count({ where }),
    prisma.grade.findMany({ orderBy: { order: "asc" } }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (gradeId) params.set("gradeId", gradeId);
    if (subjectId) params.set("subjectId", subjectId);
    params.set("page", String(p));
    return `/homework?${params.toString()}`;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-xl font-bold text-navy-900 mb-1">الواجبات</h1>
      <p className="text-navy-500 text-sm mb-6">{total} واجب</p>

      <form className="bg-white rounded-card shadow-card p-4 flex flex-wrap gap-3 mb-8" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="ابحث بالعنوان، المادة، أو المعلم..."
          className="border border-navy-100 rounded-control px-3 py-2.5 text-sm flex-1 min-w-[220px] focus:border-sky-500 outline-none"
        />
        <select name="gradeId" defaultValue={gradeId} className="border border-navy-100 rounded-control px-3 py-2.5 text-sm focus:border-sky-500 outline-none">
          <option value="">كل الصفوف</option>
          {grades.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <select name="subjectId" defaultValue={subjectId} className="border border-navy-100 rounded-control px-3 py-2.5 text-sm focus:border-sky-500 outline-none">
          <option value="">كل المواد</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button type="submit" className="bg-navy-700 hover:bg-navy-900 text-white rounded-control px-6 py-2.5 text-sm font-medium transition">
          بحث
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-navy-300 py-16 text-center bg-white rounded-card shadow-card">
          لا توجد نتائج مطابقة لبحثك
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {items.map((hw) => (
            <HomeworkCard key={hw.id} homework={hw} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-control text-sm ltr-nums ${
                p === page ? "bg-navy-700 text-white" : "bg-white text-navy-700 hover:bg-navy-50 border border-navy-50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
