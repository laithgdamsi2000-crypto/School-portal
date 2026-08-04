import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile, deleteUploadedFile, UploadError } from "@/lib/upload";

interface Params {
  params: { id: string };
}

/**
 * POST /api/sections/[id]/schedule — admin only, multipart/form-data
 * with one "file" entry. A section has at most one schedule: uploading
 * a new one replaces the previous file (DB fields + old blob).
 */
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const section = await prisma.gradeSection.findUnique({ where: { id: params.id } });
  if (!section) {
    return NextResponse.json({ error: "الشعبة غير موجودة" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "لم يتم إرفاق أي ملف" }, { status: 400 });
  }

  try {
    const uploaded = await uploadFile(file, "schedules");

    if (section.scheduleFileUrl) {
      await deleteUploadedFile(section.scheduleFileUrl);
    }

    const updated = await prisma.gradeSection.update({
      where: { id: params.id },
      data: {
        scheduleFileName: uploaded.fileName,
        scheduleFileUrl: uploaded.fileUrl,
        scheduleFileType: uploaded.fileType,
        scheduleFileSizeKb: uploaded.fileSizeKb,
        scheduleUpdatedAt: new Date(),
      },
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("POST /api/sections/[id]/schedule failed:", err);
    return NextResponse.json({ error: "تعذر رفع الملف" }, { status: 500 });
  }
}

/** DELETE /api/sections/[id]/schedule — admin only. Removes the current schedule. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const section = await prisma.gradeSection.findUnique({ where: { id: params.id } });
  if (!section) {
    return NextResponse.json({ error: "الشعبة غير موجودة" }, { status: 404 });
  }

  if (section.scheduleFileUrl) {
    await deleteUploadedFile(section.scheduleFileUrl);
  }

  const updated = await prisma.gradeSection.update({
    where: { id: params.id },
    data: {
      scheduleFileName: null,
      scheduleFileUrl: null,
      scheduleFileType: null,
      scheduleFileSizeKb: null,
      scheduleUpdatedAt: null,
    },
  });

  return NextResponse.json(updated);
}
