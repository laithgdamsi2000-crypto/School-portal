import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * GET /api/setup?key=YOUR_SECRET
 *
 * A one-time, browser-visitable substitute for running `prisma db seed`
 * from a terminal. Built specifically so someone with no command-line
 * experience can finish setup by visiting a URL after deploying to Vercel.
 *
 * SECURITY: requires a secret key (SETUP_SECRET_KEY env var) matching a
 * query parameter — without this, anyone who found the URL could
 * overwrite the admin password. After using this once, remove the
 * SETUP_SECRET_KEY environment variable on Vercel (or delete this route
 * entirely) so the endpoint can never be used again.
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

const SUBJECTS = [
  "اللغة العربية", "اللغة الإنجليزية", "الرياضيات", "العلوم", "الفيزياء",
  "الكيمياء", "الأحياء", "الدراسات الاجتماعية", "التربية الإسلامية",
  "الحاسوب", "التربية الفنية", "التربية البدنية",
];

function htmlPage(title: string, body: string, ok: boolean) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>${title}</title>
<style>
  body{font-family:Tahoma,sans-serif; background:${ok ? "#eeedf7" : "#fbe9e0"}; padding:40px 20px; text-align:center;}
  .box{max-width:480px; margin:0 auto; background:#fff; border-radius:16px; padding:32px; box-shadow:0 4px 16px rgba(0,0,0,.1);}
  h1{color:${ok ? "#3b3480" : "#c23b3b"}; font-size:18px; margin-bottom:16px;}
  p{color:#333; font-size:14px; line-height:1.8;}
  code{background:#f1f1f1; padding:2px 8px; border-radius:6px; direction:ltr; display:inline-block;}
</style></head>
<body><div class="box"><h1>${title}</h1>${body}</div></body></html>`;
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const expectedKey = process.env.SETUP_SECRET_KEY;

  if (!expectedKey) {
    return new NextResponse(
      htmlPage(
        "الإعداد غير مفعّل",
        "<p>لم يتم ضبط SETUP_SECRET_KEY في متغيرات البيئة. أضفه من إعدادات Vercel أولاً.</p>",
        false
      ),
      { status: 403, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (!key || key !== expectedKey) {
    return new NextResponse(
      htmlPage("مفتاح غير صحيح", "<p>الرابط يحتاج <code>?key=...</code> مطابق لقيمة SETUP_SECRET_KEY.</p>", false),
      { status: 403, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  try {
    for (const grade of GRADES) {
      await prisma.grade.upsert({ where: { slug: grade.slug }, update: {}, create: grade });
    }

    for (const name of SUBJECTS) {
      const exists = await prisma.subject.findFirst({ where: { name, gradeId: null } });
      if (!exists) await prisma.subject.create({ data: { name } });
    }

    const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@phoenix-school.ly";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.admin.upsert({
      where: { email: adminEmail },
      update: {},
      create: { name: "مدير المدرسة", email: adminEmail, passwordHash },
    });

    return new NextResponse(
      htmlPage(
        "تم الإعداد بنجاح ✓",
        `<p>تم إنشاء 12 صفاً دراسياً و12 مادة، وحساب المدير جاهز.</p>
         <p>البريد الإلكتروني للدخول: <code>${adminEmail}</code></p>
         <p style="color:#c23b3b; font-weight:bold; margin-top:16px;">
           مهم جداً: احذف الآن متغير SETUP_SECRET_KEY من إعدادات Vercel
           حتى لا يستطيع أحد آخر زيارة هذا الرابط.
         </p>
         <p><a href="/admin/login">اذهب لصفحة تسجيل دخول الإدارة ←</a></p>`,
        true
      ),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (err) {
    console.error("Setup failed:", err);
    return new NextResponse(
      htmlPage("حدث خطأ", `<p>تعذر إكمال الإعداد. تفاصيل الخطأ في سجلات Vercel (Logs).</p>`, false),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}
