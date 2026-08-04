import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile, UploadError } from "@/lib/upload";

/**
 * POST /api/files — admin only. Uploads a standalone file not attached
 * to any homework or announcement (school forms, circulars, general
 * downloads) -- shown in the admin File Manager and the public
 * /downloads page alongside HomeworkFile/AnnouncementFile entries.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string | null)?.trim();

  if (!title || title.length < 2) {
    return NextResponse.json({ error: "أدخل عنواناً للملف" }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ error: "لم يتم إرفاق أي ملف" }, { status: 400 });
  }

  try {
    const uploaded = await uploadFile(file, "general");
    const created = await prisma.generalFile.create({
      data: {
        title,
        fileName: uploaded.fileName,
        fileUrl: uploaded.fileUrl,
        fileType: uploaded.fileType,
        fileSizeKb: uploaded.fileSizeKb,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("POST /api/files failed:", err);
    return NextResponse.json({ error: "تعذر رفع الملف" }, { status: 500 });
  }
}
