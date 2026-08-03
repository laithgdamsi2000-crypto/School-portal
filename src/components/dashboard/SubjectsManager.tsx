"use client";

import { useState } from "react";

interface Subject {
  id: string;
  name: string;
  gradeName: string | null;
}
interface Grade {
  id: string;
  name: string;
}

export function SubjectsManager({
  initialSubjects,
  grades,
}: {
  initialSubjects: Subject[];
  grades: Grade[];
}) {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [name, setName] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, gradeId: gradeId || null }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "حدث خطأ");
      }
      const created = await res.json();
      setSubjects((prev) =>
        [...prev, { id: created.id, name: created.name, gradeName: created.grade?.name ?? null }].sort(
          (a, b) => a.name.localeCompare(b.name, "ar")
        )
      );
      setName("");
      setGradeId("");
    } catch (err: any) {
      setError(err.message ?? "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "تعذر حذف المادة");
      }
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.message ?? "تعذر حذف المادة");
    }
  }

  const inputClass =
    "border border-navy-100 rounded-control px-3 py-2 text-sm text-navy-900 focus:border-sky-500 outline-none transition";

  return (
    <div className="bg-white rounded-card shadow-card p-5 flex flex-col gap-4">
      {error && (
        <div role="alert" className="bg-red-50 text-status-error text-sm rounded-control px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs text-navy-500 mb-1 block" htmlFor="subjectName">اسم المادة</label>
          <input
            id="subjectName"
            className={`${inputClass} w-full`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="min-w-[160px]">
          <label className="text-xs text-navy-500 mb-1 block" htmlFor="subjectGrade">خاصة بصف (اختياري)</label>
          <select
            id="subjectGrade"
            className={inputClass}
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
          >
            <option value="">عامة لكل الصفوف</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-navy-700 hover:bg-navy-900 disabled:opacity-60 text-white font-medium rounded-control px-4 py-2 text-sm transition"
        >
          {submitting ? "جاري الإضافة..." : "إضافة مادة"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => (
          <span
            key={s.id}
            className="flex items-center gap-2 bg-navy-50 text-navy-700 text-xs font-medium px-3 py-1.5 rounded-full"
          >
            {s.name}
            {s.gradeName ? ` · ${s.gradeName}` : ""}
            <button
              type="button"
              onClick={() => handleDelete(s.id)}
              className="text-navy-300 hover:text-status-error transition"
              aria-label={`حذف ${s.name}`}
            >
              ×
            </button>
          </span>
        ))}
        {subjects.length === 0 && (
          <p className="text-sm text-navy-300">لا توجد مواد بعد</p>
        )}
      </div>
    </div>
  );
}
