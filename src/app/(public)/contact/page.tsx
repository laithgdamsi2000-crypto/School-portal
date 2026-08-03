import { MapPin, Phone, Mail } from "lucide-react";

const CONTACT_ITEMS = [
  { Icon: MapPin, label: "العنوان", value: "طرابلس، ليبيا", dir: "rtl" as const },
  { Icon: Phone, label: "الهاتف", value: "+218 XX-XXX-XXXX", dir: "ltr" as const },
  { Icon: Mail, label: "البريد الإلكتروني", value: "info@phoenix-school.ly", dir: "ltr" as const },
];

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-xl font-bold text-navy-900 mb-1">تواصل معنا</h1>
      <p className="text-navy-500 text-sm mb-8">يسعدنا تواصلكم مع إدارة مدرسة العنقاء (Phoenix School)</p>

      <div className="bg-white rounded-card shadow-card divide-y divide-navy-50 overflow-hidden">
        {CONTACT_ITEMS.map(({ Icon, label, value, dir }) => (
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

      <p className="text-xs text-navy-300 mt-4">
        * بيانات مؤقتة للعرض — يمكن تعديلها لاحقاً من لوحة تحكم الإدارة
      </p>
    </div>
  );
}
