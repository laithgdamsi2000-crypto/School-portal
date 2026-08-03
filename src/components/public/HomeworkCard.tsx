import Link from "next/link";

interface HomeworkCardProps {
  homework: {
    id: string;
    title: string;
    description: string;
    status: "NORMAL" | "IMPORTANT";
    dueDate: Date | string;
    subject: { name: string };
    teacher: { name: string } | null;
    grade: { name: string };
  };
  showGrade?: boolean;
}

export function HomeworkCard({ homework, showGrade = true }: HomeworkCardProps) {
  return (
    <Link
      href={`/homework/${homework.id}`}
      className="block bg-white border border-navy-50 rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition p-5"
    >
      <div className="flex items-center justify-between mb-3">
        {homework.status === "IMPORTANT" ? (
          <span className="text-[11px] font-bold bg-red-50 text-status-error px-2.5 py-1 rounded-full">مهم</span>
        ) : (
          <span className="text-[11px] font-medium bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full">عادي</span>
        )}
      </div>
      <h3 className="text-[15px] font-bold text-navy-900 mb-1.5 line-clamp-2">{homework.title}</h3>
      <p className="text-[13px] text-navy-500 mb-3.5 line-clamp-2">{homework.description}</p>
      <div className="flex items-center justify-between text-xs text-navy-500 border-t border-navy-50 pt-3">
        <span>{homework.teacher?.name ?? homework.subject.name}</span>
        {showGrade && (
          <span className="bg-navy-50 text-navy-700 px-2.5 py-0.5 rounded-full font-medium">
            {homework.grade.name}
          </span>
        )}
      </div>
    </Link>
  );
}
