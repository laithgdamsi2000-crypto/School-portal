import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: { page?: string; gradeId?: string; q?: string };
}

const PAGE_SIZE = 15;

/**
 * Server-rendered list with filters read from the URL (searchParams) —
 * this means filtered/paginated views are shareable/bookmarkable links,
 * and back/forward browser navigation works correctly, unlike client-side
 * filter state that resets on reload.
 */
export default async function AdminHomeworkListPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const gradeId = searchParams.gradeId;
  const q = searchParams.q;

  const where = {
    ...(gradeId && { gradeId }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const [items, total, grades] = await Promise.all([
    prisma.homework.findMany({
      where,
      include: { grade: true, subject: true, teacher: true },
      orderBy: { dueDate: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.homework.count({ where }),
    prisma.grade.findMany({ orderBy: { order: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (gradeId) params.set("gradeId", gradeId);
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/admin/homework?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-900">الواجبات</h1>
          <p className="text-navy-500 text-sm mt-1">{total} واجب</p>
        </div>
        <Link
          href="/admin/homework/new"
          className="bg-gold-500 hover:bg-gold-700 hover:text-white text-navy-900 font-medium rounded-control px-5 py-2.5 text-sm transition"
        >
          + إضافة واجب
        </Link>
      </div>

      {/* Filters */}
      <form className="bg-white rounded-card shadow-card p-4 flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="ابحث في العنوان أو الوصف..."
          className="border border-navy-100 rounded-control px-3 py-2 text-sm flex-1 min-w-[200px] focus:border-sky-500 outline-none"
        />
        <select
          name="gradeId"
          defaultValue={gradeId}
          className="border border-navy-100 rounded-control px-3 py-2 text-sm focus:border-sky-500 outline-none"
        >
          <option value="">كل الصفوف</option>
          {grades.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-navy-50 text-navy-700 hover:bg-navy-100 rounded-control px-5 py-2 text-sm font-medium transition"
        >
          بحث
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {items.length === 0 ? (
          <p className="text-sm text-navy-300 py-12 text-center">لا توجد نتائج</p>
        ) : (
          <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr className="border-b border-navy-50 text-navy-500 text-xs">
                <th className="text-right py-3 px-4 font-medium">العنوان</th>
                <th className="text-right py-3 px-4 font-medium w-28">الصف</th>
                <th className="text-right py-3 px-4 font-medium w-32">المادة</th>
                <th className="text-right py-3 px-4 font-medium w-28 ltr-nums">تاريخ التسليم</th>
                <th className="text-right py-3 px-4 font-medium w-20">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {items.map((hw) => (
                <tr key={hw.id} className="border-b border-navy-50 last:border-0 hover:bg-navy-50 transition">
                  <td className="py-3 px-4">
                    <Link href={`/admin/homework/${hw.id}/edit`} className="font-medium text-navy-900 hover:text-sky-700 truncate block">
                      {hw.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-navy-500 truncate">{hw.grade.name}</td>
                  <td className="py-3 px-4 text-navy-500 truncate">{hw.subject.name}</td>
                  <td className="py-3 px-4 text-navy-500 ltr-nums">
                    {new Intl.DateTimeFormat("ar-LY").format(hw.dueDate)}
                  </td>
                  <td className="py-3 px-4">
                    {hw.status === "IMPORTANT" ? (
                      <span className="text-[11px] font-bold bg-red-50 text-status-error px-2.5 py-1 rounded-full">مهم</span>
                    ) : (
                      <span className="text-[11px] font-medium bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full">عادي</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-control text-sm ltr-nums ${
                p === page ? "bg-navy-700 text-white" : "bg-white text-navy-700 hover:bg-navy-50"
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
