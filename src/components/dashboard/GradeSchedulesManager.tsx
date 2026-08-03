"use client";

import { useRef, useState } from "react";
import { FileText } from "lucide-react";

interface GradeSchedule {
  id: string;
  name: string;
  scheduleFileName: string | null;
  scheduleFileUrl: string | null;
  scheduleFileType: string | null;
}

export function GradeSchedulesManager({ initialGrades }: { initialGrades: GradeSchedule[] }) {
  const [grades, setGrades] = useState(initialGrades);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  async function handleUpload(gradeId: string, file: File) {
    setError(null);
    setBusyId(gradeId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/grades/${gradeId}/schedule`, { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "تعذر رفع الملف");
      }
      const updated = await res.json();
      setGrades((prev) =>
        prev.map((g) =>
          g.id === gradeId
            ? {
                ...g,
                scheduleFileName: updated.scheduleFileName,
                scheduleFileUrl: updated.scheduleFileUrl,
                scheduleFileType: updated.scheduleFileType,
              }
            : g
        )
      );
    } catch (err: any) {
      setError(err.message ?? "تعذر رفع الملف");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(gradeId: string) {
    setError(null);
    setBusyId(gradeId);
    try {
      const res = await fetch(`/api/grades/${gradeId}/schedule`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "تعذر حذف الجدول");
      }
      setGrades((prev) =>
        prev.map((g) =>
          g.id === gradeId
            ? { ...g, scheduleFileName: null, scheduleFileUrl: null, scheduleFileType: null }
            : g
        )
      );
    } catch (err: any) {
      setError(err.message ?? "تعذر حذف الجدول");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="bg-white rounded-card shadow-card divide-y divide-navy-50 overflow-hidden">
      {error && (
        <div role="alert" className="bg-red-50 text-status-error text-sm px-5 py-3">
          {error}
        </div>
      )}
      {grades.map((g) => (
        <div key={g.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-navy-900">{g.name}</p>
            {g.scheduleFileUrl ? (
              <a
                href={g.scheduleFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-sky-700 hover:underline mt-0.5"
              >
                <FileText size={13} strokeWidth={2} aria-hidden="true" />
                <span className="truncate max-w-[200px]">{g.scheduleFileName}</span>
              </a>
            ) : (
              <p className="text-xs text-navy-300 mt-0.5">لا يوجد جدول مرفوع</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              ref={(el) => { fileInputs.current[g.id] = el; }}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(g.id, file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={busyId === g.id}
              onClick={() => fileInputs.current[g.id]?.click()}
              className="text-xs font-medium px-3 py-1.5 rounded-control bg-navy-50 text-navy-700 hover:bg-navy-100 transition disabled:opacity-50"
            >
              {busyId === g.id ? "..." : g.scheduleFileUrl ? "استبدال" : "رفع"}
            </button>
            {g.scheduleFileUrl && (
              <button
                type="button"
                disabled={busyId === g.id}
                onClick={() => handleDelete(g.id)}
                className="text-xs font-medium px-3 py-1.5 rounded-control bg-navy-50 text-navy-700 hover:bg-red-50 hover:text-status-error transition disabled:opacity-50"
              >
                حذف
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
