import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/public/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

const FILE_TYPE_LABEL: Record<string, string> = {
  image: "صورة",
  pdf: "PDF",
  docx: "Word",
  excel: "Excel",
};

interface Props {
  params: { id: string };
}

export default async function AnnouncementDetailPage({ params }: Props) {
  const announcement = await prisma.announcement.findUnique({
    where: { id: params.id },
    include: { grade: true, files: true },
  });

  if (!announcement) {
    notFound();
  }

  return (
    <div>
      <PageHeader title={announcement.title} maxWidth="max-w-3xl">
        <div className="flex items-center gap-2 text-xs text-navy-300 mb-3">
          <Link href="/announcements" className="hover:text-white transition">الإعلانات</Link>
          <span>/</span>
          <span className="text-navy-100 font-medium truncate">{announcement.title}</span>
        </div>
      </PageHeader>

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <Reveal>
          <div className="bg-white rounded-card shadow-card p-6 md:p-8 flex flex-col gap-5">
            <div className="flex items-center gap-2 flex-wrap">
              {announcement.isImportant && (
                <span className="text-[11px] font-bold bg-red-50 text-status-error px-2.5 py-1 rounded-full">مهم</span>
              )}
              <span className="text-[11px] font-medium bg-navy-50 text-navy-700 px-2.5 py-1 rounded-full">
                {announcement.scope === "SCHOOL_WIDE" ? "إعلان عام" : announcement.grade?.name}
              </span>
              <span className="text-[11px] text-navy-500 ltr-nums">
                {new Intl.DateTimeFormat("ar-LY").format(announcement.createdAt)}
              </span>
            </div>

            <p className="text-navy-700 text-sm leading-8 whitespace-pre-line">{announcement.content}</p>
          </div>
        </Reveal>

        {announcement.files.length > 0 && (
          <Reveal delayMs={100}>
            <div className="mt-6">
              <h2 className="text-sm font-bold text-navy-700 mb-4">المرفقات</h2>
              <div className="bg-white rounded-card shadow-card divide-y divide-navy-50 overflow-hidden">
                {announcement.files.map((f) => (
                  <a
                    key={f.id}
                    href={f.fileUrl}
                    download
                    className="flex items-center gap-4 py-4 px-5 hover:bg-navy-50 transition"
                  >
                    <div className="w-10 h-10 rounded-control bg-navy-50 text-navy-700 flex items-center justify-center shrink-0">
                      <FileText size={18} strokeWidth={2} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-900 truncate">{f.fileName}</p>
                      <p className="text-xs text-navy-500 mt-0.5">{FILE_TYPE_LABEL[f.fileType] ?? f.fileType}</p>
                    </div>
                    <Download size={16} strokeWidth={2} className="text-navy-500 shrink-0" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
