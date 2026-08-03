import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { teacherCreateSchema } from "@/lib/validation";
import { ZodError } from "zod";

// Never select passwordHash -- it exists on the model for a future
// teacher-login feature (see schema.prisma), and nothing today needs it
// sent to the browser, active flow or not.
const TEACHER_SELECT = { id: true, name: true, email: true, phone: true, isActive: true } as const;

/**
 * GET /api/teachers — admin-only full list (active + inactive), unlike
 * /api/form-meta which only returns active teachers for dropdowns.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const teachers = await prisma.teacher.findMany({
    orderBy: { name: "asc" },
    select: TEACHER_SELECT,
  });
  return NextResponse.json(teachers);
}

/** POST /api/teachers — admin only. */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = teacherCreateSchema.parse(body);
    const teacher = await prisma.teacher.create({ data, select: TEACHER_SELECT });
    return NextResponse.json(teacher, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "بيانات غير صالحة", details: err.errors }, { status: 400 });
    }
    console.error("POST /api/teachers failed:", err);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
