import { prisma } from "@/lib/prisma";

const FILE_TYPE_LABEL: Record<string, string> = {
  image: "صورة",
  pdf: "PDF",
  docx: "Word",
};

/**
 * Pulls files from both HomeworkFile and AnnouncementFile into one list,
 * since parents don't think in terms of "which table is this file in" —
 * they just want everything downloadable in one place, per the spec's
 * "File Center" section.
 */
export default async function DownloadsPage() {
  const [homeworkFiles, announcementFiles, generalFiles] = await Promise.all([
    prisma.homeworkFile.findMany({
      include: { homework: { include: { grade: true, subject: true } } },
      orderBy: { uploadedAt: "desc" },
      take: 50,
    }),
    prisma.announcementFile.findMany({
      include: { announcement: true },
      orderBy: { uploadedAt: "desc" },
      take: 50,
    }),
    prisma.generalFile.findMany({ orderBy: { uploadedAt: "desc" }, take: 50 }),
  ]);

  const combined = [
    ...homeworkFiles.map((f) => ({
      id: f.id,
      fileName: f.fileName,
      fileUrl: f.fileUrl,
      fileType: f.fileType,
      uploadedAt: f.uploadedAt,
      context: `${f.homework.subject.name} · ${f.homework.grade.name}`,
      title: f.homework.title,
    })),
    ...announcementFiles.map((f) => ({
      id: f.id,
      fileName: f.fileName,
      fileUrl: f.fileUrl,
      fileType: f.fileType,
      uploadedAt: f.uploadedAt,
      context: "إعلان",
      title: f.announcement.title,
    })),
    ...generalFiles.map((f) => ({
      id: f.id,
      fileName: f.fileName,
      fileUrl: f.fileUrl,
      fileType: f.fileType,
      uploadedAt: f.uploadedAt,
      context: "ملف عام",
      title: f.title,
    })),
  ].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-xl font-bold text-navy-900 mb-1">مركز التحميلات</h1>
      <p className="text-navy-500 text-sm mb-8">أوراق العمل، الملاحظات الدراسية، وخطابات المدرسة</p>

      {combined.length === 0 ? (
        <p className="text-sm text-navy-300 py-16 text-center bg-white rounded-card shadow-card">
          لا توجد ملفات بعد
        </p>
      ) : (
        <div className="bg-white rounded-card shadow-card divide-y divide-navy-50 overflow-hidden">
          {combined.map((f) => (
            <a
              key={f.id}
              href={f.fileUrl}
              download
              className="flex items-center justify-between gap-4 py-4 px-5 hover:bg-navy-50 transition"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-navy-900 truncate">{f.fileName}</p>
                <p className="text-xs text-navy-500 mt-0.5 truncate">{f.title} · {f.context}</p>
              </div>
              <span className="text-[11px] font-medium bg-navy-50 text-navy-700 px-2.5 py-1 rounded-full shrink-0">
                {FILE_TYPE_LABEL[f.fileType] ?? f.fileType}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
