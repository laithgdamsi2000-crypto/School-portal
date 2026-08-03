import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sectionNoteUpdateSchema } from "@/lib/validation";
import { ZodError } from "zod";

interface Params {
  params: { id: string };
}

/**
 * PATCH /api/sections/[id]/note — admin only. Sets (or clears, with
 * note: null) the section's free-text note -- one box, always
 * overwritten, no history kept.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { note } = sectionNoteUpdateSchema.parse(body);

    const existing = await prisma.gradeSection.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "الشعبة غير موجودة" }, { status: 404 });
    }

    const trimmed = note?.trim() || null;

    const updated = await prisma.gradeSection.update({
      where: { id: params.id },
      data: { note: trimmed, noteUpdatedAt: trimmed ? new Date() : null },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "بيانات غير صالحة", details: err.errors }, { status: 400 });
    }
    console.error("PATCH /api/sections/[id]/note failed:", err);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
