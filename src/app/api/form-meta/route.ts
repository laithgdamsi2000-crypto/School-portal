import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Without this, Next.js statically pre-renders this route handler at
// build time (it reads no dynamic API) and serves that frozen JSON to
// every caller thereafter -- confirmed live via x-vercel-cache: PRERENDER.
// Since HomeworkForm/AnnouncementForm use this to populate their grade/
// subject/teacher dropdowns, any subject or teacher added after the last
// deploy would silently never appear as an option.
export const dynamic = "force-dynamic";

/**
 * GET /api/form-meta — public, read-only reference data for populating
 * <select> options in admin forms (and public search filters). Kept as
 * one endpoint rather than three (/grades, /subjects, /teachers) since
 * every form that needs one of these needs all three, and it's one
 * network round-trip instead of three.
 */
export async function GET() {
  const [grades, subjects, teachers] = await Promise.all([
    prisma.grade.findMany({ orderBy: { order: "asc" } }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.teacher.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ grades, subjects, teachers });
}
