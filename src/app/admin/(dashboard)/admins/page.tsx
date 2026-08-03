import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminsManager } from "@/components/dashboard/AdminsManager";

export default async function AdminAdminsPage() {
  const session = await getServerSession(authOptions);
  const admins = await prisma.admin.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, isActive: true },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-navy-900">المديرون</h1>
        <p className="text-navy-500 text-sm mt-1">حسابات الإدارة التي يمكنها الدخول للوحة التحكم</p>
      </div>
      <AdminsManager initialAdmins={admins} currentAdminId={(session?.user as any)?.id} />
    </div>
  );
}
