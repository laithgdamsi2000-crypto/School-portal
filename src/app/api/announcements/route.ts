import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { announcementCreateSchema } from "@/lib/validation";
import { notify } from "@/lib/notifications";
import { ZodError } from "zod";

/**
 * GET /api/announcements — public. Supports filtering by grade (a grade
 * page shows both that grade's own announcements AND school-wide ones —
 * see the OR clause below) and an important-only flag for the homepage's
 * "important notices" section.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const gradeId = searchParams.get("gradeId");
  const importantOnly = searchParams.get("important") === "true";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10) || 20));

  const where = {
    ...(gradeId && {
      OR: [{ scope: "SCHOOL_WIDE" as const }, { gradeId }],
    }),
    ...(importantOnly && { isImportant: true }),
  };

  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      include: { grade: true, files: true },
      orderBy: [{ isImportant: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.announcement.count({ where }),
  ]);

  return NextResponse.json({
    items,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

/** POST /api/announcements — admin only. */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = announcementCreateSchema.parse(body);

    const announcement = await prisma.announcement.create({
      data: {
        ...data,
        createdById: (session.user as any).id,
      },
      include: { grade: true },
    });

    await notify({
      event: "announcement_created",
      title: `إعلان جديد: ${announcement.title}`,
      body:
        announcement.scope === "SCHOOL_WIDE"
          ? "إعلان جديد لجميع الصفوف"
          : `إعلان جديد لـ ${announcement.grade?.name ?? ""}`,
      targetRef: `announcement:${announcement.id}`,
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "بيانات غير صالحة", details: err.errors }, { status: 400 });
    }
    console.error("POST /api/announcements failed:", err);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
