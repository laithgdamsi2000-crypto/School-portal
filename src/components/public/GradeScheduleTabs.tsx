"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, Download, Info } from "lucide-react";

interface Section {
  id: string;
  name: string;
  scheduleFileName: string | null;
  scheduleFileUrl: string | null;
  scheduleFileType: string | null;
  note: string | null;
}

/**
 * Client component so tapping a section (A/B/C) switches the displayed
 * schedule instantly -- all three sections' data is already fetched
 * server-side and passed in, so switching tabs needs no network call.
 */
export function GradeScheduleTabs({ sections, gradeName }: { sections: Section[]; gradeName: string }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const active = sections.find((s) => s.id === activeId) ?? sections[0];

  if (!active) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveId(s.id)}
            className={`px-4 py-2 rounded-control text-sm font-medium transition ${
              s.id === active.id
                ? "bg-navy-700 text-white"
                : "bg-white border border-navy-50 text-navy-700 hover:border-sky-500"
            }`}
          >
            شعبة {s.name}
          </button>
        ))}
      </div>

      {active.note && (
        <div className="flex gap-3 bg-gold-50 border border-gold-300 rounded-card p-4 mb-4">
          <Info size={18} strokeWidth={2} className="text-gold-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold text-navy-900 mb-1">ملاحظة — شعبة {active.name}</p>
            <p className="text-sm text-navy-700 whitespace-pre-line">{active.note}</p>
          </div>
        </div>
      )}

      {active.scheduleFileUrl ? (
        active.scheduleFileType === "image" ? (
          <a
            href={active.scheduleFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-card shadow-card hover:shadow-card-hover transition p-3"
          >
            <Image
              src={active.scheduleFileUrl}
              alt={`جدول حصص ${gradeName} - شعبة ${active.name}`}
              width={900}
              height={600}
              className="w-full h-auto rounded-control"
            />
          </a>
        ) : (
          <a
            href={active.scheduleFileUrl}
            download
            className="flex items-center gap-4 bg-white rounded-card shadow-card hover:shadow-card-hover transition p-5"
          >
            <div className="w-11 h-11 rounded-control bg-navy-50 text-navy-700 flex items-center justify-center shrink-0">
              <FileText size={20} strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy-900 truncate">{active.scheduleFileName}</p>
              <p className="text-xs text-navy-500 mt-0.5">اضغط لتحميل جدول الحصص</p>
            </div>
            <Download size={18} strokeWidth={2} className="text-navy-500 shrink-0" aria-hidden="true" />
          </a>
        )
      ) : (
        <p className="text-sm text-navy-300 py-8 text-center bg-white rounded-card shadow-card">
          لم يتم رفع جدول حصص لشعبة {active.name} بعد
        </p>
      )}
    </div>
  );
}
