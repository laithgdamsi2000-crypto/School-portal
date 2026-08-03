"use client";

import { useState } from "react";

export interface FileRow {
  id: string;
  type: "homework" | "announcement";
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAtLabel: string;
  title: string;
  context: string;
}

const FILE_TYPE_LABEL: Record<string, string> = {
  image: "صورة",
  pdf: "PDF",
  docx: "Word",
};

export function FilesManagerList({ files }: { files: FileRow[] }) {
  const [items, setItems] = useState(files);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(file: FileRow) {
    setError(null);
    setDeletingId(file.id);
    try {
      const res = await fetch(`/api/files/${file.id}?type=${file.type}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "تعذر حذف الملف");
      }
      setItems((prev) => prev.filter((f) => f.id !== file.id));
    } catch (err: any) {
      setError(err.message ?? "تعذر حذف الملف");
    } finally {
      setDeletingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-navy-300 py-16 text-center bg-white rounded-card shadow-card">
        لا توجد ملفات بعد
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div role="alert" className="bg-red-50 text-status-error text-sm rounded-control px-4 py-3">
          {error}
        </div>
      )}
      <div className="bg-white rounded-card shadow-card divide-y divide-navy-50 overflow-hidden">
        {items.map((f) => (
          <div key={f.id} className="flex items-center justify-between gap-4 py-4 px-5">
            <a href={f.fileUrl} download className="min-w-0 flex-1 hover:opacity-80 transition">
              <p className="text-sm font-medium text-navy-900 truncate">{f.fileName}</p>
              <p className="text-xs text-navy-500 mt-0.5 truncate">
                {f.title} · {f.context} · {f.uploadedAtLabel}
              </p>
            </a>
            <span className="text-[11px] font-medium bg-navy-50 text-navy-700 px-2.5 py-1 rounded-full shrink-0">
              {FILE_TYPE_LABEL[f.fileType] ?? f.fileType}
            </span>
            <button
              type="button"
              onClick={() => handleDelete(f)}
              disabled={deletingId === f.id}
              className="text-status-error text-xs font-medium hover:underline shrink-0 disabled:opacity-50"
            >
              {deletingId === f.id ? "جاري الحذف..." : "حذف"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
