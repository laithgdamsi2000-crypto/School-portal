"use client";

import { useState } from "react";

interface Teacher {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
}

export function TeachersManager({ initialTeachers }: { initialTeachers: Teacher[] }) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email || null, phone: phone || null }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "حدث خطأ");
      }
      const created: Teacher = await res.json();
      setTeachers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "ar")));
      setName("");
      setEmail("");
      setPhone("");
    } catch (err: any) {
      setError(err.message ?? "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(t: Teacher) {
    setError(null);
    try {
      const res = await fetch(`/api/teachers/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !t.isActive }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "تعذر التحديث");
      }
      setTeachers((prev) => prev.map((x) => (x.id === t.id ? { ...x, isActive: !x.isActive } : x)));
    } catch (err: any) {
      setError(err.message ?? "تعذر التحديث");
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
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-navy-500 mb-1 block" htmlFor="teacherName">الاسم</label>
          <input
            id="teacherName"
            className={`${inputClass} w-full`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs text-navy-500 mb-1 block" htmlFor="teacherEmail">البريد الإلكتروني (اختياري)</label>
          <input
            id="teacherEmail"
            type="email"
            className={`${inputClass} w-full`}
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="min-w-[140px]">
          <label className="text-xs text-navy-500 mb-1 block" htmlFor="teacherPhone">الهاتف (اختياري)</label>
          <input
            id="teacherPhone"
            className={`${inputClass} w-full`}
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-navy-700 hover:bg-navy-900 disabled:opacity-60 text-white font-medium rounded-control px-4 py-2 text-sm transition"
        >
          {submitting ? "جاري الإضافة..." : "إضافة معلم"}
        </button>
      </form>

      <div className="flex flex-col divide-y divide-navy-50">
        {teachers.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-3">
            <div>
              <p className={`text-sm font-medium ${t.isActive ? "text-navy-900" : "text-navy-300 line-through"}`}>
                {t.name}
              </p>
              <p className="text-xs text-navy-500 mt-0.5" dir="ltr">
                {[t.email, t.phone].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleActive(t)}
              className={`text-xs font-medium px-3 py-1.5 rounded-control transition ${
                t.isActive
                  ? "bg-navy-50 text-navy-700 hover:bg-red-50 hover:text-status-error"
                  : "bg-navy-50 text-navy-500 hover:bg-green-50 hover:text-status-success"
              }`}
            >
              {t.isActive ? "إيقاف" : "تفعيل"}
            </button>
          </div>
        ))}
        {teachers.length === 0 && (
          <p className="text-sm text-navy-300 py-6 text-center">لا يوجد معلمون بعد</p>
        )}
      </div>
    </div>
  );
}
