import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { unlink } from "fs/promises";
import path from "path";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

/**
 * DELETE /api/files/[id]?type=homework|announcement|general — admin
 * only. These are three separate tables (see schema), so the caller
 * must say which one this id belongs to. Deletes the DB row first,
 * then best-effort removes the file from disk -- a missing file on
 * disk (e.g. after a Vercel redeploy, since local storage is ephemeral
 * there -- see DEPLOYMENT.md) is not treated as a failure.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type");
  if (type !== "homework" && type !== "announcement" && type !== "general") {
    return NextResponse.json({ error: "نوع الملف غير صالح" }, { status: 400 });
  }

  const file =
    type === "homework"
      ? await prisma.homeworkFile.findUnique({ where: { id: params.id } })
      : type === "announcement"
      ? await prisma.announcementFile.findUnique({ where: { id: params.id } })
      : await prisma.generalFile.findUnique({ where: { id: params.id } });

  if (!file) {
    return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
  }

  if (type === "homework") {
    await prisma.homeworkFile.delete({ where: { id: params.id } });
  } else if (type === "announcement") {
    await prisma.announcementFile.delete({ where: { id: params.id } });
  } else {
    await prisma.generalFile.delete({ where: { id: params.id } });
  }

  try {
    await unlink(path.join(process.cwd(), "public", file.fileUrl));
  } catch {
    // Already gone or on ephemeral storage -- not fatal, the DB row is the source of truth.
  }

  return NextResponse.json({ success: true });
}
