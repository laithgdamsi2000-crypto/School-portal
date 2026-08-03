import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

/**
 * DELETE /api/subjects/[id] — admin only. Subject.homeworks has no
 * cascade (Homework.subjectId is required), so deleting a subject still
 * referenced by existing homework throws Prisma's FK error (P2003) --
 * translated into a friendly message instead of a raw 500.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const existing = await prisma.subject.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "المادة غير موجودة" }, { status: 404 });
  }

  try {
    await prisma.subject.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2003") {
      return NextResponse.json(
        { error: "لا يمكن حذف هذه المادة لوجود واجبات مرتبطة بها" },
        { status: 409 }
      );
    }
    console.error("DELETE /api/subjects/[id] failed:", err);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
