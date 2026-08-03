import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HomeworkForm } from "@/components/forms/HomeworkForm";

interface Props {
  params: { id: string };
}

export default async function EditHomeworkPage({ params }: Props) {
  const homework = await prisma.homework.findUnique({
    where: { id: params.id },
  });

  if (!homework) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-navy-900">تعديل الواجب</h1>
        <p className="text-navy-500 text-sm mt-1">{homework.title}</p>
      </div>
      <HomeworkForm
        mode="edit"
        homeworkId={homework.id}
        initial={{
          title: homework.title,
          description: homework.description,
          status: homework.status,
          gradeId: homework.gradeId,
          subjectId: homework.subjectId,
          teacherId: homework.teacherId,
          assignedDate: homework.assignedDate.toISOString(),
          dueDate: homework.dueDate.toISOString(),
        }}
      />
    </div>
  );
}
