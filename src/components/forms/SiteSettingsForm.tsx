"use client";

import { useState } from "react";

interface SiteSettings {
  welcomeMessage: string;
  aboutText: string;
  address: string;
  phone: string;
  email: string;
  mapQuery: string;
}

export function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const [welcomeMessage, setWelcomeMessage] = useState(initial.welcomeMessage);
  const [aboutText, setAboutText] = useState(initial.aboutText);
  const [address, setAddress] = useState(initial.address);
  const [phone, setPhone] = useState(initial.phone);
  const [email, setEmail] = useState(initial.email);
  const [mapQuery, setMapQuery] = useState(initial.mapQuery);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ welcomeMessage, aboutText, address, phone, email, mapQuery }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "حدث خطأ");
      }
      setSuccess(true);
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
    <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card p-6 flex flex-col gap-5 max-w-2xl">
      {error && (
        <div role="alert" className="bg-red-50 text-status-error text-sm rounded-control px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="bg-green-50 text-status-success text-sm rounded-control px-4 py-3">
          تم حفظ المعلومات بنجاح — التغييرات ستظهر على الموقع فوراً
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="welcomeMessage">رسالة الترحيب (تظهر في الصفحة الرئيسية)</label>
        <textarea
          id="welcomeMessage"
          className={inputClass}
          rows={4}
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="aboutText">نص "عن المدرسة"</label>
        <textarea
          id="aboutText"
          className={inputClass}
          rows={5}
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="address">العنوان</label>
        <input id="address" className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="phone">الهاتف</label>
          <input
            id="phone"
            className={`${inputClass} ltr-nums`}
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">البريد الإلكتروني</label>
          <input
            id="email"
            type="email"
            className={inputClass}
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="mapQuery">الموقع على الخريطة</label>
        <input
          id="mapQuery"
          className={inputClass}
          value={mapQuery}
          onChange={(e) => setMapQuery(e.target.value)}
          placeholder="اسم المكان أو العنوان كما يُكتب في بحث خرائط جوجل"
          required
        />
        <p className="text-xs text-navy-300 mt-1.5">
          مثال: "طرابلس، ليبيا" أو عنوان دقيق — يُستخدم لعرض الموقع في خرائط جوجل بصفحة "تواصل معنا"
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-navy-700 hover:bg-navy-900 disabled:opacity-60 text-white font-medium rounded-control px-6 py-2.5 text-sm transition self-start"
      >
        {submitting ? "جاري الحفظ..." : "حفظ المعلومات"}
      </button>
    </form>
  );
}
