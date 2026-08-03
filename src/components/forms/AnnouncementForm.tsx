"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Grade {
  id: string;
  name: string;
}

interface AnnouncementFormProps {
  mode: "create" | "edit";
  announcementId?: string;
  initial?: {
    title: string;
    content: string;
    scope: "SCHOOL_WIDE" | "GRADE_SPECIFIC";
    isImportant: boolean;
    gradeId?: string | null;
  };
}

export function AnnouncementForm({ mode, announcementId, initial }: AnnouncementFormProps) {
  const router = useRouter();
  const [grades, setGrades] = useState<Grade[]>([]);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [scope, setScope] = useState<"SCHOOL_WIDE" | "GRADE_SPECIFIC">(initial?.scope ?? "SCHOOL_WIDE");
  const [isImportant, setIsImportant] = useState(initial?.isImportant ?? false);
  const [gradeId, setGradeId] = useState(initial?.gradeId ?? "");
  const [files, setFiles] = useState<FileList | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetch("/api/form-meta")
      .then((r) => r.json())
      .then((d) => setGrades(d.grades))
      .catch(() => setError("تعذر تحميل بيانات النموذج"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (scope === "GRADE_SPECIFIC" && !gradeId) {
      setError("يجب اختيار الصف عند تحديد إعلان خاص بصف معين");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        content,
        scope,
        isImportant,
        gradeId: scope === "GRADE_SPECIFIC" ? gradeId : null,
      };

      const res = await fetch(
        mode === "create" ? "/api/announcements" : `/api/announcements/${announcementId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "حدث خطأ");
      }

      const saved = await res.json();

      if (files && files.length > 0) {
        const targetId = mode === "create" ? saved.id : announcementId;
        const formData = new FormData();
        Array.from(files).forEach((f) => formData.append("files", f));
        await fetch(`/api/announcements/${targetId}/files`, {
          method: "POST",
          body: formData,
        });
      }

      router.push("/admin/announcements");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "حدث خطأ أثناء الحفظ");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!announcementId) return;
    setSubmitting(true);
    try {
      await fetch(`/api/announcements/${announcementId}`, { method: "DELETE" });
      router.push("/admin/announcements");
      router.refresh();
    } catch {
      setError("تعذر حذف الإعلان");
      setSubmitting(false);
    }
  }

  const inputClass =
    "border border-navy-100 rounded-control px-3 py-2.5 text-sm text-navy-900 focus:border-sky-500 outline-none transition w-full";
  const labelClass = "text-sm font-medium text-navy-900 mb-1.5 block";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card p-6 flex flex-col gap-5 max-w-2xl">
      {error && (
        <div role="alert" className="bg-red-50 text-status-error text-sm rounded-control px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="title">عنوان الإعلان</label>
        <input
          id="title"
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: تعديل موعد الاختبار الشهري"
          required
        />
      </div>

      <div>
        <label className={labelClass}>نطاق الإعلان</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setScope("SCHOOL_WIDE")}
            className={`flex-1 py-2.5 rounded-control text-sm font-medium border transition ${
              scope === "SCHOOL_WIDE"
                ? "bg-navy-700 text-white border-navy-700"
                : "bg-white text-navy-700 border-navy-100"
            }`}
          >
            إعلان عام لكل المدرسة
          </button>
          <button
            type="button"
            onClick={() => setScope("GRADE_SPECIFIC")}
            className={`flex-1 py-2.5 rounded-control text-sm font-medium border transition ${
              scope === "GRADE_SPECIFIC"
                ? "bg-navy-700 text-white border-navy-700"
                : "bg-white text-navy-700 border-navy-100"
            }`}
          >
            خاص بصف معين
          </button>
        </div>
      </div>

      {scope === "GRADE_SPECIFIC" && (
        <div>
          <label className={labelClass} htmlFor="grade">الصف</label>
          <select id="grade" className={inputClass} value={gradeId} onChange={(e) => setGradeId(e.target.value)} required>
            <option value="">اختر الصف</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      )}

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isImportant}
          onChange={(e) => setIsImportant(e.target.checked)}
          className="w-4 h-4 accent-gold-500"
        />
        <span className="text-sm text-navy-900">
          إعلان هام <span className="text-navy-500">— سيظهر بشكل مميز في الصفحة الرئيسية</span>
        </span>
      </label>

      <div>
        <label className={labelClass} htmlFor="content">نص الإعلان</label>
        <textarea
          id="content"
          className={inputClass}
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="تفاصيل الإعلان..."
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="files">المرفقات (صور، PDF، Word)</label>
        <input
          id="files"
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => setFiles(e.target.files)}
          className="text-sm text-navy-500"
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-navy-50">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-navy-700 hover:bg-navy-900 disabled:opacity-60 text-white font-medium rounded-control px-6 py-2.5 text-sm transition"
          >
            {submitting ? "جاري الحفظ..." : mode === "create" ? "نشر الإعلان" : "حفظ التغييرات"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/announcements")}
            className="bg-navy-50 text-navy-700 hover:bg-navy-100 font-medium rounded-control px-6 py-2.5 text-sm transition"
          >
            إلغاء
          </button>
        </div>

        {mode === "edit" && (
          <div>
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-status-error text-sm font-medium hover:underline"
              >
                حذف الإعلان
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-navy-500">تأكيد الحذف؟</span>
                <button type="button" onClick={handleDelete} className="text-status-error text-sm font-bold">
                  نعم، احذف
                </button>
                <button type="button" onClick={() => setShowDeleteConfirm(false)} className="text-navy-500 text-sm">
                  تراجع
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
