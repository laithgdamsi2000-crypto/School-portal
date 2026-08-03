import { prisma } from "@/lib/prisma";

const DEFAULT_SECTION_NAMES = ["A", "B", "C"];

/**
 * Lazily creates the default sections for a grade the first time they're
 * needed, instead of relying on a seed step -- there's no reliable seed
 * path against the live database (the one-time /api/setup route is
 * deleted after first use per DEPLOYMENT.md, and prisma/seed.ts only
 * runs locally). Idempotent: does nothing once sections already exist.
 */
export async function getSectionsForGrade(gradeId: string) {
  const existing = await prisma.gradeSection.findMany({
    where: { gradeId },
    orderBy: { order: "asc" },
  });
  if (existing.length > 0) return existing;

  await prisma.gradeSection.createMany({
    data: DEFAULT_SECTION_NAMES.map((name, i) => ({ gradeId, name, order: i + 1 })),
    skipDuplicates: true,
  });

  return prisma.gradeSection.findMany({
    where: { gradeId },
    orderBy: { order: "asc" },
  });
}
