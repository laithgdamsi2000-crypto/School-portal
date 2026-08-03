import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HomeworkCard } from "@/components/public/HomeworkCard";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { getSiteSettings } from "@/lib/site-settings";

export default async function HomePage() {
  const [siteSettings, homeworkCount, announcementCount, subjectCount, gradeCount, latestHomework, importantAnnouncements, grades] =
    await Promise.all([
      getSiteSettings(),
      prisma.homework.count(),
      prisma.announcement.count(),
      prisma.subject.count(),
      prisma.grade.count(),
      prisma.homework.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { grade: true, subject: true, teacher: true },
      }),
      prisma.announcement.findMany({
        where: { isImportant: true },
        orderBy: { createdAt: "desc" },
        take: 2,
        include: { grade: true },
      }),
      prisma.grade.findMany({
        orderBy: { order: "asc" },
        include: { _count: { select: { homeworks: true } } },
      }),
    ]);

  const basicGrades = grades.filter((g) => g.order <= 9);
  const secondaryGrades = grades.filter((g) => g.order > 9);

  return (
    <>
      {/* Hero -- staggered fade-in-up on load, pure CSS (above the fold,
          so it animates immediately rather than waiting on a scroll observer) */}
      <section className="bg-gradient-to-b from-navy-900 to-navy-700 text-white px-6 pt-16 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <span
            className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-500 text-gold-300 text-xs font-medium px-4 py-1.5 rounded-full mb-6 animate-fade-in-up"
          >
            العام الدراسي 2026 - 2027
          </span>
          <h1
            className="text-3xl md:text-4xl font-black leading-snug mb-4 animate-fade-in-up [animation-delay:100ms]"
          >
            كل ما يخص واجبات وإعلانات أبنائكم
            <br />
            في مكان واحد
          </h1>
          <p
            className="text-navy-100 max-w-lg mx-auto mb-8 animate-fade-in-up [animation-delay:200ms]"
          >
            تابعوا الواجبات اليومية، الإعلانات المدرسية، والملفات القابلة للتحميل لجميع الصفوف بسهولة وفي أي وقت.
          </p>
          <div className="flex items-center justify-center gap-3.5 flex-wrap animate-fade-in-up [animation-delay:300ms]">
            <Link
              href="/homework"
              className="bg-gold-500 hover:bg-gold-700 text-navy-900 hover:text-white font-bold rounded-control px-7 py-3.5 text-sm transition duration-300 hover:-translate-y-0.5"
            >
              تصفح واجبات اليوم
            </Link>
            <Link
              href="/grades"
              className="border border-white/30 hover:bg-white/10 text-white font-medium rounded-control px-7 py-3.5 text-sm transition duration-300 hover:-translate-y-0.5"
            >
              تصفح الصفوف الدراسية
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-[2] animate-fade-in-up [animation-delay:400ms]">
        <div className="bg-white rounded-card shadow-card-hover grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-navy-50 overflow-hidden">
          {[
            { label: "واجب منشور", value: homeworkCount },
            { label: "إعلان مدرسي", value: announcementCount },
            { label: "مادة دراسية", value: subjectCount },
            { label: "صف دراسي", value: gradeCount },
          ].map((s) => (
            <div key={s.label} className="text-center py-6">
              <b className="block text-2xl font-black text-navy-700 ltr-nums">
                <CountUp value={s.value} />
              </b>
              <span className="text-xs text-navy-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Welcome message -- admin-editable via /admin/settings */}
      <section className="max-w-5xl mx-auto px-6 pt-16">
        <Reveal>
          <div className="bg-white rounded-card shadow-card p-6 md:p-8 border-r-4 border-gold-500 flex flex-col gap-2">
            <h2 className="text-sm font-bold text-navy-900">كلمة ترحيب</h2>
            <p className="text-navy-700 text-sm leading-8">{siteSettings.welcomeMessage}</p>
          </div>
        </Reveal>
      </section>

      {/* Latest homework */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <Reveal>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-navy-900">واجبات اليوم</h2>
            <Link href="/homework" className="text-xs font-medium text-sky-700">عرض جميع الواجبات ←</Link>
          </div>
        </Reveal>
        {latestHomework.length === 0 ? (
          <Reveal delayMs={100}>
            <p className="text-sm text-navy-300 py-10 text-center bg-white rounded-card shadow-card">
              لا توجد واجبات منشورة بعد
            </p>
          </Reveal>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {latestHomework.map((hw, i) => (
              <Reveal key={hw.id} delayMs={i * 100}>
                <HomeworkCard homework={hw} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Important announcements */}
      {importantAnnouncements.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <Reveal>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-navy-900">إعلانات هامة</h2>
              <Link href="/announcements" className="text-xs font-medium text-sky-700">عرض جميع الإعلانات ←</Link>
            </div>
          </Reveal>
          <div className="flex flex-col gap-3">
            {importantAnnouncements.map((a, i) => (
              <Reveal key={a.id} delayMs={i * 100}>
                <Link
                  href={`/announcements/${a.id}`}
                  className="flex gap-4 bg-gold-50 border border-gold-300 rounded-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition duration-300"
                >
                  <div className="w-9 h-9 rounded-control bg-gold-500 text-white font-bold flex items-center justify-center shrink-0">!</div>
                  <div>
                    <h3 className="text-sm font-bold text-navy-900 mb-1">{a.title}</h3>
                    <p className="text-[13px] text-navy-500 line-clamp-2">{a.content}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Grade grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <Reveal>
          <h2 className="text-xl font-bold text-navy-900 mb-6">تصفح حسب الصف الدراسي</h2>
        </Reveal>
        <Reveal delayMs={100}>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {basicGrades.map((g) => (
              <Link
                key={g.id}
                href={`/grades/${g.slug}`}
                className="bg-white border border-navy-50 rounded-card shadow-card hover:border-sky-500 hover:shadow-card-hover hover:-translate-y-0.5 transition duration-300 text-center py-4 px-2"
              >
                <b className="block text-navy-700 text-[13px] font-bold">{g.name.replace("الصف ", "")}</b>
                <span className="text-[11px] text-navy-500 ltr-nums">{g._count.homeworks} واجب</span>
              </Link>
            ))}
            {secondaryGrades.length > 0 && (
              <div className="col-span-3 md:col-span-6 flex items-center gap-3 text-xs font-medium text-navy-500 my-1">
                <span className="flex-1 h-px bg-navy-50" />
                المرحلة الثانوية
                <span className="flex-1 h-px bg-navy-50" />
              </div>
            )}
            {secondaryGrades.map((g) => (
              <Link
                key={g.id}
                href={`/grades/${g.slug}`}
                className="bg-white border border-navy-50 rounded-card shadow-card hover:border-sky-500 hover:shadow-card-hover hover:-translate-y-0.5 transition duration-300 text-center py-4 px-2"
              >
                <b className="block text-navy-700 text-[13px] font-bold">{g.name.replace("الصف ", "")}</b>
                <span className="text-[11px] text-navy-500 ltr-nums">{g._count.homeworks} واجب</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>
    </>
  );
}
