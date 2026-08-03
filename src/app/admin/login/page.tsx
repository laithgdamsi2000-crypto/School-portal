"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

/**
 * Admin login. A few deliberate choices:
 *  - Generic error message regardless of whether the email or password was
 *    wrong (never confirm/deny an account exists — see auth.ts).
 *  - Client-side validation is UX only; the real validation happens server
 *    side in auth.ts (never trust the client).
 *  - Loading state disables the submit button to prevent double-submits
 *    hitting the rate-sensitive auth endpoint twice.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo/phoenix-logo.jpeg"
            alt="شعار مدرسة العنقاء"
            width={64}
            height={64}
            className="rounded-lg mb-3"
          />
          <h1 className="text-white text-lg font-bold">مدرسة العنقاء</h1>
          <p className="text-navy-100 text-sm">لوحة تحكم الإدارة</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-card shadow-card p-6 flex flex-col gap-4"
        >
          {error && (
            <div
              role="alert"
              className="bg-red-50 text-status-error text-sm rounded-control px-4 py-3"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-navy-900">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              className="border border-navy-100 rounded-control px-3 py-2.5 text-sm text-navy-900 text-right focus:border-sky-500 outline-none transition"
              placeholder="admin@phoenix-school.ly"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-navy-900">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-navy-100 rounded-control px-3 py-2.5 text-sm text-navy-900 focus:border-sky-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-navy-700 hover:bg-navy-900 disabled:opacity-60 text-white font-medium rounded-control py-2.5 text-sm transition mt-2"
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <p className="text-center text-navy-300 text-xs mt-6">
          هذه الصفحة مخصصة لإدارة المدرسة فقط
        </p>
      </div>
    </div>
  );
}
