import { MapPin, Phone, Mail } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const contactItems = [
    { Icon: MapPin, label: "العنوان", value: settings.address, dir: "rtl" as const },
    { Icon: Phone, label: "الهاتف", value: settings.phone, dir: "ltr" as const },
    { Icon: Mail, label: "البريد الإلكتروني", value: settings.email, dir: "ltr" as const },
  ];

  const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(settings.mapQuery)}&output=embed`;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-xl font-bold text-navy-900 mb-1">تواصل معنا</h1>
      <p className="text-navy-500 text-sm mb-8">يسعدنا تواصلكم مع إدارة مدرسة العنقاء (Phoenix School)</p>

      <div className="bg-white rounded-card shadow-card divide-y divide-navy-50 overflow-hidden mb-6">
        {contactItems.map(({ Icon, label, value, dir }) => (
          <div key={label} className="flex items-center gap-4 p-5">
            <div className="w-11 h-11 rounded-control bg-navy-50 text-navy-700 flex items-center justify-center shrink-0">
              <Icon size={20} strokeWidth={2} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-navy-500 mb-0.5">{label}</p>
              <p className="font-medium text-navy-900 text-sm ltr-nums" dir={dir}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <iframe
          title="موقع المدرسة على الخريطة"
          src={mapEmbedSrc}
          className="w-full h-72 border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
