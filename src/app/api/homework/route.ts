import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { homeworkCreateSchema, searchQuerySchema } from "@/lib/validation";
import { notify } from "@/lib/notifications";
import { ZodError } from "zod";

/**
 * GET /api/homework
 * Public — no auth required. Powers both the "browse homework" page and
 * the search bar (query params double as filters).
 *
 * Query params: q, gradeId, subjectId, teacherId, dateFrom, dateTo, page, pageSize
 */
export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const { q, gradeId, subjectId, teacherId, dateFrom, dateTo, page, pageSize } =
      searchQuerySchema.parse(params);

    const where = {
      ...(gradeId && { gradeId }),
      ...(subjectId && { subjectId }),
      ...(teacherId && { teacherId }),
      ...((dateFrom || dateTo) && {
        dueDate: {
          ...(dateFrom && { gte: dateFrom }),
          ...(dateTo && { lte: dateTo }),
        },
      }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.homework.findMany({
        where,
        include: { grade: true, subject: true, teacher: true, files: true },
        orderBy: { dueDate: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.homework.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "بيانات البحث غير صالحة", details: err.errors }, { status: 400 });
    }
    console.error("GET /api/homework failed:", err);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

/**
 * POST /api/homework
 * Admin only — enforced by middleware.ts, double-checked here defensively
 * (defense in depth: this route should never be reachable unauthenticated,
 * but we don't rely solely on the middleware layer for a mutating action).
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = homeworkCreateSchema.parse(body);

    const homework = await prisma.homework.create({
      data: {
        ...data,
        createdById: (session.user as any).id,
      },
      include: { grade: true, subject: true, teacher: true },
    });

    // Fire-and-forget style, but awaited so failures are logged rather than
    // silently lost. Today this just writes a SKIPPED notification row —
    // see lib/notifications.ts.
    await notify({
      event: "homework_created",
      title: `واجب جديد: ${homework.title}`,
      body: `تم نشر واجب جديد في مادة ${homework.subject.name} لـ ${homework.grade.name}`,
      targetRef: `homework:${homework.id}`,
    });

    return NextResponse.json(homework, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "بيانات غير صالحة", details: err.errors }, { status: 400 });
    }
    console.error("POST /api/homework failed:", err);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
