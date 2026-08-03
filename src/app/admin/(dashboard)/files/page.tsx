import { prisma } from "@/lib/prisma";
import { FilesManagerList, type FileRow } from "@/components/dashboard/FilesManagerList";

/**
 * Same "pull from both HomeworkFile and AnnouncementFile" pattern as the
 * public downloads page (src/app/(public)/downloads/page.tsx) -- admins
 * need to see and manage the same combined set, plus a delete action.
 */
export default async function AdminFilesPage() {
  const [homeworkFiles, announcementFiles] = await Promise.all([
    prisma.homeworkFile.findMany({
      include: { homework: { include: { grade: true, subject: true } } },
      orderBy: { uploadedAt: "desc" },
    }),
    prisma.announcementFile.findMany({
      include: { announcement: true },
      orderBy: { uploadedAt: "desc" },
    }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat("ar-LY");

  const combined = [
    ...homeworkFiles.map((f) => ({
      id: f.id,
      type: "homework" as const,
      fileName: f.fileName,
      fileUrl: f.fileUrl,
      fileType: f.fileType,
      uploadedAt: f.uploadedAt,
      title: f.homework.title,
      context: `${f.homework.subject.name} · ${f.homework.grade.name}`,
    })),
    ...announcementFiles.map((f) => ({
      id: f.id,
      type: "announcement" as const,
      fileName: f.fileName,
      fileUrl: f.fileUrl,
      fileType: f.fileType,
      uploadedAt: f.uploadedAt,
      title: f.announcement.title,
      context: "إعلان",
    })),
  ].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

  const files: FileRow[] = combined.map(({ uploadedAt, ...rest }) => ({
    ...rest,
    uploadedAtLabel: dateFormatter.format(uploadedAt),
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-navy-900">إدارة الملفات</h1>
        <p className="text-navy-500 text-sm mt-1">جميع الملفات المرفوعة مع الواجبات والإعلانات</p>
      </div>
      <FilesManagerList files={files} />
    </div>
  );
}
