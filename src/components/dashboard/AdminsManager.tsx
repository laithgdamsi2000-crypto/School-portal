"use client";

import { useState } from "react";

interface Admin {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export function AdminsManager({
  initialAdmins,
  currentAdminId,
}: {
  initialAdmins: Admin[];
  currentAdminId: string;
}) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "حدث خطأ");
      }
      const created: Admin = await res.json();
      setAdmins((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "ar")));
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message ?? "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(a: Admin) {
    setError(null);
    try {
      const res = await fetch(`/api/admins/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !a.isActive }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "تعذر التحديث");
      }
      setAdmins((prev) => prev.map((x) => (x.id === a.id ? { ...x, isActive: !x.isActive } : x)));
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
          <label className="text-xs text-navy-500 mb-1 block" htmlFor="adminName">الاسم</label>
          <input
            id="adminName"
            className={`${inputClass} w-full`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs text-navy-500 mb-1 block" htmlFor="adminEmail">البريد الإلكتروني</label>
          <input
            id="adminEmail"
            type="email"
            className={`${inputClass} w-full`}
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="min-w-[160px]">
          <label className="text-xs text-navy-500 mb-1 block" htmlFor="adminPassword">كلمة المرور المبدئية</label>
          <input
            id="adminPassword"
            type="password"
            className={`${inputClass} w-full`}
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-navy-700 hover:bg-navy-900 disabled:opacity-60 text-white font-medium rounded-control px-4 py-2 text-sm transition"
        >
          {submitting ? "جاري الإضافة..." : "إضافة مدير"}
        </button>
      </form>

      <div className="flex flex-col divide-y divide-navy-50">
        {admins.map((a) => {
          const isSelf = a.id === currentAdminId;
          return (
            <div key={a.id} className="flex items-center justify-between py-3">
              <div>
                <p className={`text-sm font-medium ${a.isActive ? "text-navy-900" : "text-navy-300 line-through"}`}>
                  {a.name} {isSelf && <span className="text-[11px] font-normal text-sky-700">(أنت)</span>}
                </p>
                <p className="text-xs text-navy-500 mt-0.5" dir="ltr">{a.email}</p>
              </div>
              {!isSelf && (
                <button
                  type="button"
                  onClick={() => toggleActive(a)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-control transition ${
                    a.isActive
                      ? "bg-navy-50 text-navy-700 hover:bg-red-50 hover:text-status-error"
                      : "bg-navy-50 text-navy-500 hover:bg-green-50 hover:text-status-success"
                  }`}
                >
                  {a.isActive ? "إيقاف" : "تفعيل"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
