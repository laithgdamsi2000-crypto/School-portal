import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";
import { SiteSettingsForm } from "@/components/forms/SiteSettingsForm";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AdminSettingsPage() {
  const [session, siteSettings] = await Promise.all([
    getServerSession(authOptions),
    getSiteSettings(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-navy-900">الإعدادات</h1>
        <p className="text-navy-500 text-sm mt-1">إدارة حساب المدير ومعلومات المدرسة المعروضة على الموقع</p>
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

      <div>
        <h2 className="text-sm font-bold text-navy-900 mb-4">معلومات المدرسة والتواصل</h2>
        <SiteSettingsForm initial={siteSettings} />
      </div>
    </div>
  );
}
