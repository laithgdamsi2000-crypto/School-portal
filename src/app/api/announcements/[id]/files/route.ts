import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile, UploadError } from "@/lib/upload";

interface Params {
  params: { id: string };
}

/**
 * POST /api/announcements/[id]/files — admin only.
 * Video attachments are in the requirements as a future item; lib/upload.ts
 * doesn't allowlist video MIME types yet on purpose (video needs different
 * size limits and likely a streaming-friendly storage backend, not the
 * same path as images/PDF/Word) — add that as its own deliberate change
 * when video support is actually built, not by quietly widening the
 * existing allowlist.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const announcement = await prisma.announcement.findUnique({ where: { id: params.id } });
  if (!announcement) {
    return NextResponse.json({ error: "الإعلان غير موجود" }, { status: 404 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "لم يتم إرفاق أي ملف" }, { status: 400 });
  }

  try {
    const uploaded = await Promise.all(
      files.map((file) => uploadFile(file, "announcements"))
    );

    const created = await prisma.announcementFile.createMany({
      data: uploaded.map((f) => ({
        announcementId: params.id,
        fileName: f.fileName,
        fileUrl: f.fileUrl,
        fileType: f.fileType,
        fileSizeKb: f.fileSizeKb,
      })),
    });

    return NextResponse.json({ count: created.count }, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("POST /api/announcements/[id]/files failed:", err);
    return NextResponse.json({ error: "تعذر رفع الملفات" }, { status: 500 });
  }
}
