import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/stats — public (also used on the homepage's stats strip).
 * Cheap counts only — no per-row data — so this stays fast even as
 * homework/announcements grow into the thousands.
 */
export async function GET() {
  const [homeworkCount, announcementCount, subjectCount, gradeCount, recentHomework] =
    await Promise.all([
      prisma.homework.count(),
      prisma.announcement.count(),
      prisma.subject.count(),
      prisma.grade.count(),
      prisma.homework.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { grade: true, subject: true },
      }),
    ]);

  return NextResponse.json({
    homeworkCount,
    announcementCount,
    subjectCount,
    gradeCount,
    recentActivity: recentHomework,
  });
}
