"use client";

import { useRef, useState } from "react";
import { FileText } from "lucide-react";

interface Section {
  id: string;
  name: string;
  scheduleFileName: string | null;
  scheduleFileUrl: string | null;
  scheduleFileType: string | null;
  note: string | null;
}

interface GradeWithSections {
  id: string;
  name: string;
  sections: Section[];
}

export function GradeSchedulesManager({ initialGrades }: { initialGrades: GradeWithSections[] }) {
  const [grades, setGrades] = useState(initialGrades);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialGrades.flatMap((g) => g.sections.map((s) => [s.id, s.note ?? ""])))
  );
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  function updateSection(sectionId: string, patch: Partial<Section>) {
    setGrades((prev) =>
      prev.map((g) => ({
        ...g,
        sections: g.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
      }))
    );
  }

  async function handleUpload(sectionId: string, file: File) {
    setError(null);
    setBusyId(sectionId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/sections/${sectionId}/schedule`, { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "تعذر رفع الملف");
      }
      const updated = await res.json();
      updateSection(sectionId, {
        scheduleFileName: updated.scheduleFileName,
        scheduleFileUrl: updated.scheduleFileUrl,
        scheduleFileType: updated.scheduleFileType,
      });
    } catch (err: any) {
      setError(err.message ?? "تعذر رفع الملف");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(sectionId: string) {
    setError(null);
    setBusyId(sectionId);
    try {
      const res = await fetch(`/api/sections/${sectionId}/schedule`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "تعذر حذف الجدول");
      }
      updateSection(sectionId, { scheduleFileName: null, scheduleFileUrl: null, scheduleFileType: null });
    } catch (err: any) {
      setError(err.message ?? "تعذر حذف الجدول");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveNote(sectionId: string) {
    setError(null);
    setSavingNoteId(sectionId);
    try {
      const res = await fetch(`/api/sections/${sectionId}/note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteDrafts[sectionId] || null }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "تعذر حفظ الملاحظة");
      }
      const updated = await res.json();
      updateSection(sectionId, { note: updated.note });
      setNoteDrafts((prev) => ({ ...prev, [sectionId]: updated.note ?? "" }));
    } catch (err: any) {
      setError(err.message ?? "تعذر حفظ الملاحظة");
    } finally {
      setSavingNoteId(null);
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
        <div key={g.id} className="px-5 py-3.5">
          <p className="text-sm font-bold text-navy-900 mb-2">{g.name}</p>
          <div className="flex flex-col gap-2">
            {g.sections.map((s) => (
              <div key={s.id} className="flex flex-col gap-2 bg-navy-50/50 rounded-control px-3 py-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-xs font-medium text-navy-700 bg-white border border-navy-100 rounded-control w-7 h-7 flex items-center justify-center shrink-0">
                      {s.name}
                    </span>
                    {s.scheduleFileUrl ? (
                      <a
                        href={s.scheduleFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-sky-700 hover:underline min-w-0"
                      >
                        <FileText size={13} strokeWidth={2} aria-hidden="true" />
                        <span className="truncate max-w-[160px]">{s.scheduleFileName}</span>
                      </a>
                    ) : (
                      <p className="text-xs text-navy-300">لا يوجد جدول مرفوع</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      ref={(el) => { fileInputs.current[s.id] = el; }}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(s.id, file);
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      disabled={busyId === s.id}
                      onClick={() => fileInputs.current[s.id]?.click()}
                      className="text-xs font-medium px-2.5 py-1 rounded-control bg-white text-navy-700 hover:bg-navy-100 transition disabled:opacity-50"
                    >
                      {busyId === s.id ? "..." : s.scheduleFileUrl ? "استبدال" : "رفع"}
                    </button>
                    {s.scheduleFileUrl && (
                      <button
                        type="button"
                        disabled={busyId === s.id}
                        onClick={() => handleDelete(s.id)}
                        className="text-xs font-medium px-2.5 py-1 rounded-control bg-white text-navy-700 hover:bg-red-50 hover:text-status-error transition disabled:opacity-50"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <textarea
                    value={noteDrafts[s.id] ?? ""}
                    onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    placeholder="ملاحظة (مثال: الغائبون اليوم: ...)"
                    rows={2}
                    className="flex-1 text-xs border border-navy-100 rounded-control px-2.5 py-1.5 text-navy-900 focus:border-sky-500 outline-none transition resize-none"
                  />
                  <button
                    type="button"
                    disabled={savingNoteId === s.id}
                    onClick={() => handleSaveNote(s.id)}
                    className="text-xs font-medium px-2.5 py-1.5 rounded-control bg-navy-700 hover:bg-navy-900 text-white transition disabled:opacity-50 shrink-0"
                  >
                    {savingNoteId === s.id ? "..." : "حفظ الملاحظة"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
