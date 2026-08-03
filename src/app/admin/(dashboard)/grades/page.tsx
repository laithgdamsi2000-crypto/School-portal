import { prisma } from "@/lib/prisma";
import { SubjectsManager } from "@/components/dashboard/SubjectsManager";
import { TeachersManager } from "@/components/dashboard/TeachersManager";
import { GradeSchedulesManager } from "@/components/dashboard/GradeSchedulesManager";

export default async function AdminGradesPage() {
  const [grades, subjects, teachers] = await Promise.all([
    prisma.grade.findMany({ orderBy: { order: "asc" } }),
    prisma.subject.findMany({ include: { grade: true }, orderBy: { name: "asc" } }),
    prisma.teacher.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, phone: true, isActive: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-navy-900">الصفوف والمواد</h1>
        <p className="text-navy-500 text-sm mt-1">البنية الأكاديمية للمدرسة</p>
      </div>

      <div>
        <h2 className="text-sm font-bold text-navy-900 mb-4">الصفوف والجداول</h2>
        <GradeSchedulesManager
          initialGrades={grades.map((g) => ({
            id: g.id,
            name: g.name,
            scheduleFileName: g.scheduleFileName,
            scheduleFileUrl: g.scheduleFileUrl,
            scheduleFileType: g.scheduleFileType,
          }))}
        />
        <p className="text-xs text-navy-300 mt-2">
          الصفوف ثابتة حسب النظام التعليمي الليبي (12 صفاً) ولا يمكن إضافة أو حذف صفوف من هنا — يمكن فقط رفع جدول الحصص لكل صف
        </p>
      </div>

      <div>
        <h2 className="text-sm font-bold text-navy-900 mb-4">المواد الدراسية</h2>
        <SubjectsManager
          initialSubjects={subjects.map((s) => ({ id: s.id, name: s.name, gradeName: s.grade?.name ?? null }))}
          grades={grades.map((g) => ({ id: g.id, name: g.name }))}
        />
      </div>

      <div>
        <h2 className="text-sm font-bold text-navy-900 mb-4">المعلمون</h2>
        <TeachersManager initialTeachers={teachers} />
      </div>
    </div>
  );
}
