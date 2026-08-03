import { AnnouncementForm } from "@/components/forms/AnnouncementForm";

export default function NewAnnouncementPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-navy-900">إضافة إعلان جديد</h1>
        <p className="text-navy-500 text-sm mt-1">سيظهر الإعلان فوراً على الموقع العام بعد النشر</p>
      </div>
      <AnnouncementForm mode="create" />
    </div>
  );
}
