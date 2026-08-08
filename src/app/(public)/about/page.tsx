import Image from "next/image";
import { getSiteSettings } from "@/lib/site-settings";
import { PageHeader } from "@/components/public/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

// See src/app/(public)/page.tsx for why this is required -- without it,
// this page is statically frozen at build time, so admin edits to
// aboutText via /admin/settings would never actually appear here until
// the next deploy despite the settings form reporting success.
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <PageHeader title="عن المدرسة" subtitle="مدرسة العنقاء · Phoenix School" maxWidth="max-w-3xl">
        <Image
          src="/logo/phoenix-logo.jpeg"
          alt="شعار مدرسة العنقاء"
          width={56}
          height={56}
          className="rounded-lg mb-3"
        />
      </PageHeader>

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <Reveal>
          <div className="bg-white rounded-card shadow-card p-8 text-navy-700 text-sm leading-8">
            <p className="whitespace-pre-line">{settings.aboutText}</p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
