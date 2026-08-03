import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * 12 grades total, matching the Libyan education system:
 *   - 9 years of basic education (الصف الأول through التاسع)
 *   - 3 years of secondary (الصف الأول ثانوي through الثالث ثانوي)
 * `order` controls display order everywhere (nav, grade grid, dropdowns) —
 * always sort by this field, never by name or creation date.
 */
const GRADES = [
  { name: "الصف الأول", slug: "grade-1", order: 1 },
  { name: "الصف الثاني", slug: "grade-2", order: 2 },
  { name: "الصف الثالث", slug: "grade-3", order: 3 },
  { name: "الصف الرابع", slug: "grade-4", order: 4 },
  { name: "الصف الخامس", slug: "grade-5", order: 5 },
  { name: "الصف السادس", slug: "grade-6", order: 6 },
  { name: "الصف السابع", slug: "grade-7", order: 7 },
  { name: "الصف الثامن", slug: "grade-8", order: 8 },
  { name: "الصف التاسع", slug: "grade-9", order: 9 },
  { name: "الصف الأول ثانوي", slug: "secondary-1", order: 10 },
  { name: "الصف الثاني ثانوي", slug: "secondary-2", order: 11 },
  { name: "الصف الثالث ثانوي", slug: "secondary-3", order: 12 },
];

// General subjects available across grades. Grade-specific subjects
// (e.g. specialized secondary tracks) can be added later via the admin
// dashboard — this seed only covers the common baseline.
const SUBJECTS = [
  "اللغة العربية",
  "اللغة الإنجليزية",
  "الرياضيات",
  "العلوم",
  "الفيزياء",
  "الكيمياء",
  "الأحياء",
  "الدراسات الاجتماعية",
  "التربية الإسلامية",
  "الحاسوب",
  "التربية الفنية",
  "التربية البدنية",
];

async function main() {
  console.log("Seeding grades...");
  for (const grade of GRADES) {
    await prisma.grade.upsert({
      where: { slug: grade.slug },
      update: {},
      create: grade,
    });
  }

  console.log("Seeding subjects...");
  for (const name of SUBJECTS) {
    const exists = await prisma.subject.findFirst({ where: { name, gradeId: null } });
    if (!exists) {
      await prisma.subject.create({ data: { name } });
    }
  }

  console.log("Seeding default admin account...");
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@phoenix-school.ly";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  // NOTE: change SEED_ADMIN_PASSWORD in .env before running this in
  // anything beyond local development — this default is intentionally
  // guessable so its presence in a real deployment is obvious and gets caught.

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "مدير المدرسة",
      email: adminEmail,
      passwordHash,
    },
  });

  console.log("Done.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword} (change this password immediately)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
