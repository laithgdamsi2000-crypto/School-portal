"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { HomeworkCard } from "@/components/public/HomeworkCard";

interface SearchResults {
  homework: any[];
  announcements: any[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQ.length < 2) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(initialQ)}`)
      .then((r) => r.json())
      .then(setResults)
      .finally(() => setLoading(false));
  }, [initialQ]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  const hasResults = results && (results.homework.length > 0 || results.announcements.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-xl font-bold text-navy-900 mb-6">البحث</h1>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن واجب، إعلان، مادة، أو معلم..."
          className="flex-1 border border-navy-100 rounded-control px-4 py-3 text-sm focus:border-sky-500 outline-none"
          autoFocus
        />
        <button
          type="submit"
          className="bg-navy-700 hover:bg-navy-900 text-white rounded-control px-7 py-3 text-sm font-medium transition"
        >
          بحث
        </button>
      </form>

      {loading && <p className="text-sm text-navy-500 text-center py-10">جاري البحث...</p>}

      {!loading && initialQ.length >= 2 && !hasResults && (
        <p className="text-sm text-navy-300 text-center py-16 bg-white rounded-card shadow-card">
          لا توجد نتائج لـ «{initialQ}»
        </p>
      )}

      {results && results.homework.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-bold text-navy-700 mb-4">
            الواجبات ({results.homework.length})
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {results.homework.map((hw) => (
              <HomeworkCard key={hw.id} homework={hw} />
            ))}
          </div>
        </section>
      )}

      {results && results.announcements.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-navy-700 mb-4">
            الإعلانات ({results.announcements.length})
          </h2>
          <div className="flex flex-col gap-3">
            {results.announcements.map((a) => (
              <Link
                key={a.id}
                href={`/announcements/${a.id}`}
                className="bg-white border border-navy-50 rounded-card p-5 hover:shadow-card-hover transition"
              >
                <h3 className="text-sm font-bold text-navy-900 mb-1">{a.title}</h3>
                <p className="text-[13px] text-navy-500 line-clamp-2">{a.content}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
