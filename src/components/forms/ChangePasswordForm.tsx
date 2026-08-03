"use client";

import { useState } from "react";

/**
 * Standalone password-change form for the logged-in admin. Not wired to
 * any list/detail flow like the other forms — just a POST-and-report card.
 */
export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "حدث خطأ");
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message ?? "حدث خطأ أثناء الحفظ");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "border border-navy-100 rounded-control px-3 py-2.5 text-sm text-navy-900 focus:border-sky-500 outline-none transition w-full";
  const labelClass = "text-sm font-medium text-navy-900 mb-1.5 block";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card p-6 flex flex-col gap-5 max-w-md">
      {error && (
        <div role="alert" className="bg-red-50 text-status-error text-sm rounded-control px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="bg-green-50 text-status-success text-sm rounded-control px-4 py-3">
          تم تغيير كلمة المرور بنجاح
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="currentPassword">كلمة المرور الحالية</label>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          className={inputClass}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="newPassword">كلمة المرور الجديدة</label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-navy-700 hover:bg-navy-900 disabled:opacity-60 text-white font-medium rounded-control px-6 py-2.5 text-sm transition self-start"
      >
        {submitting ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
      </button>
    </form>
  );
}
