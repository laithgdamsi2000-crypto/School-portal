import { HomeworkForm } from "@/components/forms/HomeworkForm";

export default function NewHomeworkPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-navy-900">إضافة واجب جديد</h1>
        <p className="text-navy-500 text-sm mt-1">سيظهر الواجب فوراً على الموقع العام بعد النشر</p>
      </div>
      <HomeworkForm mode="create" />
    </div>
  );
}
