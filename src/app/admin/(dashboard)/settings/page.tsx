import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-navy-900">الإعدادات</h1>
        <p className="text-navy-500 text-sm mt-1">إدارة حساب المدير</p>
      </div>

      <div className="bg-white rounded-card shadow-card p-6 max-w-md flex flex-col gap-1">
        <p className="text-xs text-navy-500">الاسم</p>
        <p className="text-sm font-medium text-navy-900 mb-3">{session?.user?.name}</p>
        <p className="text-xs text-navy-500">البريد الإلكتروني</p>
        <p className="text-sm font-medium text-navy-900" dir="ltr">{session?.user?.email}</p>
      </div>

      <div>
        <h2 className="text-sm font-bold text-navy-900 mb-4">تغيير كلمة المرور</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
