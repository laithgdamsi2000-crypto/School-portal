import { prisma } from "@/lib/prisma";
import { SubjectsManager } from "@/components/dashboard/SubjectsManager";
import { TeachersManager } from "@/components/dashboard/TeachersManager";
import { GradeSchedulesManager } from "@/components/dashboard/GradeSchedulesManager";
import { getSectionsForGrade } from "@/lib/grade-sections";

export default async function AdminGradesPage() {
  const [grades, subjects, teachers] = await Promise.all([
    prisma.grade.findMany({ orderBy: { order: "asc" } }),
    prisma.subject.findMany({ include: { grade: true }, orderBy: { name: "asc" } }),
    prisma.teacher.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, phone: true, isActive: true },
    }),
  ]);

  const gradesWithSections = await Promise.all(
    grades.map(async (g) => ({
      id: g.id,
      name: g.name,
      sections: (await getSectionsForGrade(g.id)).map((s) => ({
        id: s.id,
        name: s.name,
        scheduleFileName: s.scheduleFileName,
        scheduleFileUrl: s.scheduleFileUrl,
        scheduleFileType: s.scheduleFileType,
      })),
    }))
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-navy-900">الصفوف والمواد</h1>
        <p className="text-navy-500 text-sm mt-1">البنية الأكاديمية للمدرسة</p>
      </div>

      <div>
        <h2 className="text-sm font-bold text-navy-900 mb-4">الصفوف والشعب والجداول</h2>
        <GradeSchedulesManager initialGrades={gradesWithSections} />
        <p className="text-xs text-navy-300 mt-2">
          الصفوف ثابتة حسب النظام التعليمي الليبي (12 صفاً)، وكل صف مقسّم لثلاث شعب (A/B/C) — يمكن رفع جدول حصص منفصل لكل شعبة
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
