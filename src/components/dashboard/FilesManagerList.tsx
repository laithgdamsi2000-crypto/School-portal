"use client";

import { useRef, useState } from "react";

export interface FileRow {
  id: string;
  type: "homework" | "announcement" | "general";
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

  const [title, setTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!uploadFile) {
      setError("اختر ملفاً أولاً");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", uploadFile);

      const res = await fetch("/api/files", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "تعذر رفع الملف");
      }
      const created = await res.json();

      setItems((prev) => [
        {
          id: created.id,
          type: "general",
          fileName: created.fileName,
          fileUrl: created.fileUrl,
          fileType: created.fileType,
          uploadedAtLabel: new Intl.DateTimeFormat("ar-LY").format(new Date(created.uploadedAt)),
          title: created.title,
          context: "ملف عام",
        },
        ...prev,
      ]);

      setTitle("");
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.message ?? "تعذر رفع الملف");
    } finally {
      setUploading(false);
    }
  }

  const inputClass =
    "border border-navy-100 rounded-control px-3 py-2 text-sm text-navy-900 focus:border-sky-500 outline-none transition";

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div role="alert" className="bg-red-50 text-status-error text-sm rounded-control px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleUpload} className="bg-white rounded-card shadow-card p-5 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs text-navy-500 mb-1 block" htmlFor="fileTitle">عنوان الملف</label>
          <input
            id="fileTitle"
            className={`${inputClass} w-full`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: استمارة تسجيل"
            required
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs text-navy-500 mb-1 block" htmlFor="fileInput">الملف (صورة، PDF، Word)</label>
          <input
            id="fileInput"
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            className="text-sm text-navy-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="bg-navy-700 hover:bg-navy-900 disabled:opacity-60 text-white font-medium rounded-control px-5 py-2 text-sm transition"
        >
          {uploading ? "جاري الرفع..." : "رفع الملف"}
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-navy-300 py-16 text-center bg-white rounded-card shadow-card">
          لا توجد ملفات بعد
        </p>
      ) : (
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
      )}
    </div>
  );
}
