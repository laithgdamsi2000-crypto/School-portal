import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { unlink } from "fs/promises";
import path from "path";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile, UploadError } from "@/lib/upload";

interface Params {
  params: { id: string };
}

async function deleteFileFromDisk(fileUrl: string) {
  try {
    await unlink(path.join(process.cwd(), "public", fileUrl));
  } catch {
    // Already gone or on ephemeral storage -- not fatal.
  }
}

/**
 * POST /api/grades/[id]/schedule — admin only, multipart/form-data with
 * one "file" entry. A grade has at most one schedule: uploading a new
 * one replaces the previous file (both the DB fields and the old file
 * on disk), it doesn't accumulate a list.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const grade = await prisma.grade.findUnique({ where: { id: params.id } });
  if (!grade) {
    return NextResponse.json({ error: "الصف غير موجود" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "لم يتم إرفاق أي ملف" }, { status: 400 });
  }

  try {
    const uploaded = await uploadFile(file, "schedules");

    if (grade.scheduleFileUrl) {
      await deleteFileFromDisk(grade.scheduleFileUrl);
    }

    const updated = await prisma.grade.update({
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
    console.error("POST /api/grades/[id]/schedule failed:", err);
    return NextResponse.json({ error: "تعذر رفع الملف" }, { status: 500 });
  }
}

/** DELETE /api/grades/[id]/schedule — admin only. Removes the current schedule. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const grade = await prisma.grade.findUnique({ where: { id: params.id } });
  if (!grade) {
    return NextResponse.json({ error: "الصف غير موجود" }, { status: 404 });
  }

  if (grade.scheduleFileUrl) {
    await deleteFileFromDisk(grade.scheduleFileUrl);
  }

  const updated = await prisma.grade.update({
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
