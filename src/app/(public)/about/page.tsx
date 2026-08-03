import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Image
          src="/logo/phoenix-logo.jpeg"
          alt="شعار مدرسة العنقاء"
          width={56}
          height={56}
          className="rounded-lg shrink-0"
        />
        <div>
          <h1 className="text-xl font-bold text-navy-900">عن المدرسة</h1>
          <p className="text-navy-500 text-sm">مدرسة العنقاء · Phoenix School</p>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card p-8 text-navy-700 text-sm leading-8">
        <p>
          مدرسة العنقاء مدرسة خاصة تلتزم بتقديم تعليم متميز يجمع بين الأصالة والحداثة،
          ونسعى من خلال هذه البوابة الإلكترونية لتسهيل التواصل بين المدرسة وأولياء الأمور
          والطلاب، من خلال إتاحة الواجبات اليومية والإعلانات والملفات المهمة في مكان واحد
          يسهل الوصول إليه في أي وقت.
        </p>
      </div>
    </div>
  );
}
