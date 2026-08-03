import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { teacherUpdateSchema } from "@/lib/validation";
import { ZodError } from "zod";

const TEACHER_SELECT = { id: true, name: true, email: true, phone: true, isActive: true } as const;

interface Params {
  params: { id: string };
}

/**
 * PATCH /api/teachers/[id] — admin only. Also how a teacher gets
 * deactivated (isActive: false) instead of hard-deleted -- Teacher.homeworks
 * has no cascade, so a departed teacher's name should stay attached to
 * their past homework rather than breaking those records.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = teacherUpdateSchema.parse(body);

    const existing = await prisma.teacher.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "المعلم غير موجود" }, { status: 404 });
    }

    const updated = await prisma.teacher.update({
      where: { id: params.id },
      data,
      select: TEACHER_SELECT,
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "بيانات غير صالحة", details: err.errors }, { status: 400 });
    }
    console.error("PATCH /api/teachers/[id] failed:", err);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
