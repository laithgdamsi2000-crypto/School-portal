import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

/**
 * Wraps every page in the (dashboard) route group — /admin, /admin/homework,
 * /admin/announcements, etc. /admin/login is a SIBLING directory outside
 * this group, not a child of it, so it is never wrapped by this layout.
 * That separation matters: this layout redirects to /admin/login when
 * unauthenticated, and if /admin/login were nested inside this same
 * layout, that redirect would target the page it's already rendering —
 * an infinite redirect loop (this previously caused ERR_TOO_MANY_REDIRECTS
 * in production).
 *
 * This is a SECOND layer of protection on top of middleware.ts — the
 * middleware blocks the request before it reaches here, but checking the
 * session again here means this layout is safe even if it were ever
 * reused somewhere the middleware matcher doesn't cover. Defense in depth,
 * not redundancy for its own sake.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-navy-50 flex">
      <DashboardSidebar adminName={session.user?.name ?? "الإدارة"} />
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
