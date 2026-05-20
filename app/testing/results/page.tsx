"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type CategoryKey = "race" | "age" | "gender";

type AnalysisData = {
  race: Record<string, number>;
  age: Record<string, number>;
  gender: Record<string, number>;
};

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  race: "Race / Ethnicity",
  age: "Age Range",
  gender: "Gender",
};

function sortedEntries(obj: Record<string, number>): [string, number][] {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

function ScoreBar({
  label,
  value,
  isSelected,
  onClick,
}: {
  label: string;
  value: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between py-2 px-3 transition-colors text-left ${
        isSelected ? "bg-black text-white" : "hover:bg-black/[0.03]"
      }`}
    >
      <span className="text-[11px] tracking-wide">{label}</span>
      <span className="text-[11px] font-mono tabular-nums">
        {(value * 100).toFixed(2)}%
      </span>
    </button>
  );
}

export default function ResultsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("race");
  const [selections, setSelections] = useState<Record<CategoryKey, string>>({
    race: "",
    age: "",
    gender: "",
  });
  const [data, setData] = useState<AnalysisData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("skinstric-analysis");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AnalysisData;
        setData(parsed);
        // Pre-select top result per category
        const top = (obj: Record<string, number>) =>
          sortedEntries(obj)[0]?.[0] ?? "";
        setSelections({
          race: top(parsed.race),
          age: top(parsed.age),
          gender: top(parsed.gender),
        });
      } catch {
        // malformed data
      }
    }

    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
    );
  }, []);

  function selectEntry(category: CategoryKey, label: string) {
    setSelections((prev) => ({ ...prev, [category]: label }));
  }

  const entries = data ? sortedEntries(data[activeCategory]) : [];

  return (
    <div ref={containerRef} className="flex flex-col h-screen select-none">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-black/[0.08]">
        <Link href="/" className="text-[11px] font-semibold tracking-[0.2em] uppercase">
          Skinstric
        </Link>
        <span className="text-[11px] tracking-[0.15em] uppercase opacity-30">
          A.I. Analysis
        </span>
        <div className="w-20" />
      </header>

      <main ref={contentRef} className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {!data ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[11px] tracking-widest uppercase opacity-30">
              No analysis data found.{" "}
              <Link href="/testing/select-analysis" className="underline">
                Start over
              </Link>
            </p>
          </div>
        ) : (
          <>
            {/* Left sidebar — confirmed selections */}
            <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-black/[0.08] flex flex-row md:flex-col justify-start md:justify-center gap-6 md:gap-0 px-5 py-4 md:px-6 md:py-8 shrink-0 overflow-x-auto">
              <p className="text-[10px] tracking-[0.2em] uppercase text-black/30 mb-6">
                Predicted
              </p>
              {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map((cat) => (
                <div key={cat} className="mb-5">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-black/30 mb-1">
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <p className="text-sm font-medium">
                    {selections[cat] || "—"}
                  </p>
                </div>
              ))}
            </aside>

            {/* Right — category tabs + scores */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex border-b border-black/[0.08] overflow-x-auto shrink-0">
                {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-4 text-[11px] tracking-[0.15em] uppercase transition-colors ${
                      activeCategory === cat
                        ? "border-b-2 border-black font-semibold"
                        : "opacity-30 hover:opacity-60"
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-black/30 px-3 mb-3">
                  Probability — click to select
                </p>
                {entries.map(([label, value]) => (
                  <ScoreBar
                    key={label}
                    label={label}
                    value={value}
                    isSelected={selections[activeCategory] === label}
                    onClick={() => selectEntry(activeCategory, label)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Navigation */}
      <div className="flex items-center justify-between px-8 pb-8 border-t border-black/[0.08] pt-4">
        <Link
          href="/testing/select-analysis"
          className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase opacity-40 hover:opacity-100 transition-opacity"
        >
          <span>◀</span>
          <span>Back</span>
        </Link>
        <Link
          href="/testing/camera"
          className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase opacity-40 hover:opacity-100 transition-opacity"
        >
          <span>Proceed</span>
          <span>▶</span>
        </Link>
      </div>
    </div>
  );
}
