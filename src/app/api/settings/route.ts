import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/site-settings";
import { siteSettingsUpdateSchema } from "@/lib/validation";
import { ZodError } from "zod";

/**
 * GET /api/settings — public. Powers the homepage welcome message and
 * the Contact page. Never 404s/empties -- falls back to
 * DEFAULT_SITE_SETTINGS if no row has been saved yet.
 */
export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

/**
 * PATCH /api/settings — admin only. There's no seed step guaranteed to
 * have run against the live database (the one-time /api/setup route is
 * deleted after first use per DEPLOYMENT.md), so this creates the row
 * on first save rather than assuming one already exists.
 */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = siteSettingsUpdateSchema.parse(body);

    const existing = await prisma.siteSettings.findFirst();
    const updated = existing
      ? await prisma.siteSettings.update({ where: { id: existing.id }, data })
      : await prisma.siteSettings.create({ data: { ...DEFAULT_SITE_SETTINGS, ...data } });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "بيانات غير صالحة", details: err.errors }, { status: 400 });
    }
    console.error("PATCH /api/settings failed:", err);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
