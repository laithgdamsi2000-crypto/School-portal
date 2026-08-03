import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile, UploadError } from "@/lib/upload";

interface Params {
  params: { id: string };
}

/**
 * POST /api/homework/[id]/files — admin only, multipart/form-data with
 * one or more "files" entries. Each file goes through the same
 * validation as every other upload path in the app (lib/upload.ts) —
 * no separate, weaker check for this route.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const homework = await prisma.homework.findUnique({ where: { id: params.id } });
  if (!homework) {
    return NextResponse.json({ error: "الواجب غير موجود" }, { status: 404 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "لم يتم إرفاق أي ملف" }, { status: 400 });
  }

  try {
    const uploaded = await Promise.all(
      files.map((file) => uploadFile(file, "homework"))
    );

    const created = await prisma.homeworkFile.createMany({
      data: uploaded.map((f) => ({
        homeworkId: params.id,
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
    console.error("POST /api/homework/[id]/files failed:", err);
    return NextResponse.json({ error: "تعذر رفع الملفات" }, { status: 500 });
  }
}
