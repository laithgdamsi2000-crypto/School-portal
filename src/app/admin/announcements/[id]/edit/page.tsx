import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnnouncementForm } from "@/components/forms/AnnouncementForm";

interface Props {
  params: { id: string };
}

export default async function EditAnnouncementPage({ params }: Props) {
  const announcement = await prisma.announcement.findUnique({
    where: { id: params.id },
  });

  if (!announcement) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-navy-900">تعديل الإعلان</h1>
        <p className="text-navy-500 text-sm mt-1">{announcement.title}</p>
      </div>
      <AnnouncementForm
        mode="edit"
        announcementId={announcement.id}
        initial={{
          title: announcement.title,
          content: announcement.content,
          scope: announcement.scope,
          isImportant: announcement.isImportant,
          gradeId: announcement.gradeId,
        }}
      />
    </div>
  );
}
