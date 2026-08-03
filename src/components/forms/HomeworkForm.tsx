"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Grade {
  id: string;
  name: string;
}
interface Subject {
  id: string;
  name: string;
}
interface Teacher {
  id: string;
  name: string;
}

interface HomeworkFormProps {
  mode: "create" | "edit";
  homeworkId?: string;
  initial?: {
    title: string;
    description: string;
    status: "NORMAL" | "IMPORTANT";
    gradeId: string;
    subjectId: string;
    teacherId?: string | null;
    assignedDate: string; // ISO date
    dueDate: string;
  };
}

/**
 * Shared between /admin/homework/new and /admin/homework/[id]/edit.
 * One form, two modes — keeps validation/UX identical rather than
 * maintaining two near-duplicate forms that drift apart over time.
 */
export function HomeworkForm({ mode, homeworkId, initial }: HomeworkFormProps) {
  const router = useRouter();
  const [meta, setMeta] = useState<{ grades: Grade[]; subjects: Subject[]; teachers: Teacher[] } | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<"NORMAL" | "IMPORTANT">(initial?.status ?? "NORMAL");
  const [gradeId, setGradeId] = useState(initial?.gradeId ?? "");
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? "");
  const [teacherId, setTeacherId] = useState(initial?.teacherId ?? "");
  const [assignedDate, setAssignedDate] = useState(initial?.assignedDate?.slice(0, 10) ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate?.slice(0, 10) ?? "");
  const [files, setFiles] = useState<FileList | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetch("/api/form-meta")
      .then((r) => r.json())
      .then(setMeta)
      .catch(() => setError("تعذر تحميل بيانات النموذج"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        title,
        description,
        status,
        gradeId,
        subjectId,
        teacherId: teacherId || null,
        assignedDate,
        dueDate,
      };

      const res = await fetch(
        mode === "create" ? "/api/homework" : `/api/homework/${homeworkId}`,
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

      // Upload attachments, if any, against the now-existing homework id
      if (files && files.length > 0) {
        const targetId = mode === "create" ? saved.id : homeworkId;
        const formData = new FormData();
        Array.from(files).forEach((f) => formData.append("files", f));
        await fetch(`/api/homework/${targetId}/files`, {
          method: "POST",
          body: formData,
        });
      }

      router.push("/admin/homework");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "حدث خطأ أثناء الحفظ");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!homeworkId) return;
    setSubmitting(true);
    try {
      await fetch(`/api/homework/${homeworkId}`, { method: "DELETE" });
      router.push("/admin/homework");
      router.refresh();
    } catch {
      setError("تعذر حذف الواجب");
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
        <label className={labelClass} htmlFor="title">عنوان الواجب</label>
        <input
          id="title"
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: الرياضيات — الفصل الثالث"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="grade">الصف</label>
          <select id="grade" className={inputClass} value={gradeId} onChange={(e) => setGradeId(e.target.value)} required>
            <option value="">اختر الصف</option>
            {meta?.grades.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="subject">المادة</label>
          <select id="subject" className={inputClass} value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
            <option value="">اختر المادة</option>
            {meta?.subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="teacher">المعلم (اختياري)</label>
          <select id="teacher" className={inputClass} value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
            <option value="">بدون تحديد</option>
            {meta?.teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="status">الحالة</label>
          <select id="status" className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="NORMAL">عادي</option>
            <option value="IMPORTANT">مهم</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="assignedDate">تاريخ التكليف</label>
          <input id="assignedDate" type="date" className={`${inputClass} ltr-nums`} value={assignedDate} onChange={(e) => setAssignedDate(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass} htmlFor="dueDate">تاريخ التسليم</label>
          <input id="dueDate" type="date" className={`${inputClass} ltr-nums`} value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="description">وصف الواجب</label>
        <textarea
          id="description"
          className={inputClass}
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="تفاصيل الواجب المطلوب..."
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
            {submitting ? "جاري الحفظ..." : mode === "create" ? "نشر الواجب" : "حفظ التغييرات"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/homework")}
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
                حذف الواجب
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
