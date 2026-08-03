import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

/**
 * Wraps every page under /admin (except /admin/login).
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
