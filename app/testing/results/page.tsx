"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { DiamondIcon } from "@/components/DiamondIcon";
import { STORAGE_KEYS } from "@/lib/storageKeys";

type CategoryKey = "race" | "age" | "gender";

type AnalysisData = {
  race: Record<string, number>;
  age: Record<string, number>;
  gender: Record<string, number>;
};

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  race: "Race",
  age: "Age",
  gender: "Sex",
};

function sortedEntries(obj: Record<string, number> | undefined): [string, number][] {
  return obj ? Object.entries(obj).sort((a, b) => b[1] - a[1]) : [];
}

// Figma frame 013/014: a ring showing the selected entry's confidence, big % centered
function ConfidenceRing({ percent }: { percent: number }) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent);

  return (
    <div className="relative w-[220px] h-[220px] shrink-0">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#E5E5E5" strokeWidth="2" />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#1A1B1C"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-semibold">
          {Math.round(percent * 100)}
          <span className="text-base align-top">%</span>
        </span>
      </div>
    </div>
  );
}

function topEntry(obj: Record<string, number>): string {
  return sortedEntries(obj)[0]?.[0] ?? "";
}

export default function ResultsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("race");
  const [data, setData] = useState<AnalysisData | null>(null);
  const [selections, setSelections] = useState<Record<CategoryKey, string>>({
    race: "",
    age: "",
    gender: "",
  });
  const [confirmed, setConfirmed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // localStorage only exists client-side; reading it here (not in a lazy
  // useState initializer) keeps the first client render matching the SSR
  // output, then fills in real data right after — avoids a hydration mismatch.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ANALYSIS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AnalysisData;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData(parsed);
        setSelections({
          race: topEntry(parsed.race),
          age: topEntry(parsed.age),
          gender: topEntry(parsed.gender),
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

  function resetCategory() {
    if (!data) return;
    const top = sortedEntries(data[activeCategory])[0]?.[0] ?? "";
    selectEntry(activeCategory, top);
  }

  const entries = data ? sortedEntries(data[activeCategory]) : [];
  const selectedLabel = selections[activeCategory];
  const selectedValue = data ? data[activeCategory]?.[selectedLabel] ?? 0 : 0;

  return (
    <div ref={containerRef} className="relative flex flex-col h-screen select-none bg-[#FCFCFC]">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 md:px-8 md:py-5 border-b border-black/[0.08]">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-bold uppercase">
            Skinstric
          </Link>
          <span className="text-sm font-bold uppercase text-black/50">[ Analysis ]</span>
        </div>
      </header>

      <main ref={contentRef} className="flex flex-col flex-1 overflow-hidden px-5 py-6 md:px-8">
        {!data ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs uppercase tracking-widest text-black/40">
              No analysis data found.{" "}
              <Link href="/testing/select-analysis" className="underline">
                Start over
              </Link>
            </p>
          </div>
        ) : confirmed ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center gap-8">
            <div className="w-16 h-16 rotate-45 border-2 border-black flex items-center justify-center">
              <span className="-rotate-45 text-xl">✓</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-black/30 mb-2">
                A.I. Analysis Confirmed
              </p>
              <h1 className="text-3xl font-bold tracking-tight">Demographics Locked In</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
              {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map((cat) => (
                <div key={cat}>
                  <p className="text-sm font-medium capitalize">{selections[cat]}</p>
                  <p className="text-[10px] uppercase tracking-widest text-black/40">
                    {CATEGORY_LABELS[cat]}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/testing/select-analysis"
              className="text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity underline"
            >
              Start New Analysis
            </Link>
          </div>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-widest text-black/30 mb-1">A.I. Analysis</p>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Demographics</h1>
            <p className="text-[10px] uppercase tracking-widest text-black/30 mb-8">
              Predicted race &amp; age
            </p>

            <div className="flex flex-col md:flex-row flex-1 gap-8 overflow-hidden">
              {/* Left — category selector */}
              <aside className="flex md:flex-col gap-2 md:w-48 shrink-0 overflow-x-auto">
                {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-left px-4 py-3 transition-colors shrink-0 ${
                      activeCategory === cat ? "bg-black text-white" : "bg-black/[0.03] hover:bg-black/[0.06]"
                    }`}
                  >
                    <p className="text-sm font-medium capitalize">{selections[cat] || "—"}</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-50">
                      {CATEGORY_LABELS[cat]}
                    </p>
                  </button>
                ))}
              </aside>

              {/* Center — selected value + confidence ring */}
              <div className="flex-1 flex items-center gap-8 min-w-0">
                <p className="text-2xl font-medium capitalize shrink-0 hidden lg:block">
                  {selectedLabel}
                </p>
                <div className="flex-1 flex items-center justify-center">
                  <ConfidenceRing percent={selectedValue} />
                </div>
              </div>

              {/* Right — ranked confidence list */}
              <div className="md:w-64 shrink-0 overflow-y-auto border-t md:border-t-0 md:border-l border-black/[0.08] md:pl-6 pt-4 md:pt-0">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-black/30 mb-2 px-1">
                  <span>{CATEGORY_LABELS[activeCategory]}</span>
                  <span>A.I. Confidence</span>
                </div>
                {entries.map(([label, value]) => {
                  const isSelected = selectedLabel === label;
                  return (
                    <button
                      key={label}
                      onClick={() => selectEntry(activeCategory, label)}
                      className="w-full flex items-center justify-between py-2 px-1 text-left hover:bg-black/[0.03] transition-colors"
                    >
                      <span className="flex items-center gap-2 text-xs capitalize">
                        <span className="text-[8px]">{isSelected ? "◆" : "◇"}</span>
                        {label}
                      </span>
                      <span className="text-xs font-mono tabular-nums">
                        {(value * 100).toFixed(0)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] uppercase tracking-widest text-black/30 text-center mt-4">
              If A.I. estimate is wrong, select the correct one.
            </p>
          </>
        )}
      </main>

      {/* Navigation */}
      {!confirmed && (
        <div className="relative z-10 flex items-center justify-between px-5 py-6 md:px-8 md:pb-8 border-t border-black/[0.08]">
          <Link
            href="/testing/select-analysis"
            className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
          >
            <DiamondIcon direction="left" active={false} />
            <span>Back</span>
          </Link>

          {data && (
            <div className="flex items-center gap-3">
              <button
                onClick={resetCategory}
                className="px-5 py-2 border border-black/20 text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setConfirmed(true)}
                className="px-5 py-2 bg-[#1A1B1C] text-[#FCFCFC] text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-colors"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
