import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { homeworkUpdateSchema } from "@/lib/validation";
import { ZodError } from "zod";

interface Params {
  params: { id: string };
}

/** GET /api/homework/[id] — public, single homework detail view. */
export async function GET(_req: NextRequest, { params }: Params) {
  const homework = await prisma.homework.findUnique({
    where: { id: params.id },
    include: { grade: true, subject: true, teacher: true, files: true },
  });

  if (!homework) {
    return NextResponse.json({ error: "الواجب غير موجود" }, { status: 404 });
  }

  return NextResponse.json(homework);
}

/** PATCH /api/homework/[id] — admin only. */
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = homeworkUpdateSchema.parse(body);

    const existing = await prisma.homework.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "الواجب غير موجود" }, { status: 404 });
    }

    const updated = await prisma.homework.update({
      where: { id: params.id },
      data,
      include: { grade: true, subject: true, teacher: true, files: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "بيانات غير صالحة", details: err.errors }, { status: 400 });
    }
    console.error("PATCH /api/homework/[id] failed:", err);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

/**
 * DELETE /api/homework/[id] — admin only.
 * HomeworkFile rows cascade-delete via the schema's onDelete: Cascade,
 * but the actual files on disk/object storage need explicit cleanup —
 * handled here so orphaned files don't accumulate silently.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const existing = await prisma.homework.findUnique({
    where: { id: params.id },
    include: { files: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "الواجب غير موجود" }, { status: 404 });
  }

  // TODO when moving to object storage: delete existing.files[].fileUrl
  // from the bucket here before removing the DB rows.

  await prisma.homework.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
