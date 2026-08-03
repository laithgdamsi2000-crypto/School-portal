import { prisma } from "@/lib/prisma";

/**
 * Fallback used only if the SiteSettings table is empty (e.g. a database
 * that predates this feature and never had the one-time /api/setup or
 * an admin save run against it). Never written to the DB by a read --
 * only PATCH /api/settings creates the real row, on first save.
 */
export const DEFAULT_SITE_SETTINGS = {
  welcomeMessage:
    "أهلاً وسهلاً بكم في بوابة مدرسة العنقاء الإلكترونية — نتمنى لأبنائنا الطلاب عاماً دراسياً موفقاً.",
  address: "طرابلس، ليبيا",
  phone: "+218 XX-XXX-XXXX",
  email: "info@phoenix-school.ly",
  mapQuery: "طرابلس، ليبيا",
};

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findFirst();
  return settings ?? DEFAULT_SITE_SETTINGS;
}
