export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-xl font-bold text-navy-900 mb-6">تواصل معنا</h1>
      <div className="bg-white rounded-card shadow-card p-8 flex flex-col gap-5 text-sm">
        <div>
          <p className="text-navy-500 mb-1">العنوان</p>
          <p className="font-medium text-navy-900">طرابلس، ليبيا</p>
        </div>
        <div>
          <p className="text-navy-500 mb-1">الهاتف</p>
          <p className="font-medium text-navy-900 ltr-nums" dir="ltr">+218 XX-XXX-XXXX</p>
        </div>
        <div>
          <p className="text-navy-500 mb-1">البريد الإلكتروني</p>
          <p className="font-medium text-navy-900" dir="ltr">info@phoenix-school.ly</p>
        </div>
      </div>
      <p className="text-xs text-navy-300 mt-4">
        * بيانات مؤقتة للعرض — يمكن تعديلها لاحقاً من لوحة تحكم الإدارة
      </p>
    </div>
  );
}
