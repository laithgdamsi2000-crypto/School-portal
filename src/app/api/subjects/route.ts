import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subjectCreateSchema } from "@/lib/validation";
import { ZodError } from "zod";

/**
 * GET /api/subjects — public reference data, same role as /api/form-meta
 * but subject-only. Used by the admin grades/subjects management page,
 * which needs the full list independent of any homework/announcement form.
 */
export async function GET() {
  const subjects = await prisma.subject.findMany({
    include: { grade: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(subjects);
}

/** POST /api/subjects — admin only. */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = subjectCreateSchema.parse(body);
    const subject = await prisma.subject.create({ data, include: { grade: true } });
    return NextResponse.json(subject, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "بيانات غير صالحة", details: err.errors }, { status: 400 });
    }
    console.error("POST /api/subjects failed:", err);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
