import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/search?q=... — public, unified search across both content
 * types. This is deliberately separate from /api/homework's own search
 * (which stays for the dedicated browse page's filters) — this endpoint
 * exists for the single global search box that doesn't know or care
 * which content type the answer lives in, per the spec's requirement
 * that search cover homework AND announcements AND teacher/subject names
 * from one box.
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ homework: [], announcements: [] });
  }

  const [homework, announcements] = await Promise.all([
    prisma.homework.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { subject: { name: { contains: q, mode: "insensitive" } } },
          { teacher: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: { grade: true, subject: true, teacher: true },
      orderBy: { dueDate: "desc" },
      take: 20,
    }),
    prisma.announcement.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { grade: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return NextResponse.json({ homework, announcements });
}
