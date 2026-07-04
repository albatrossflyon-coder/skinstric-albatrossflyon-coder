"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const PHASE_ONE_API =
  "https://us-central1-frontend-simplified.cloudfunctions.net/skinstricPhaseOne";

function DiamondIcon({ direction, active }: { direction: "left" | "right"; active: boolean }) {
  return (
    <div
      className={`w-6 h-6 border border-black rotate-45 flex items-center justify-center shrink-0 transition-transform duration-300 ${active ? "scale-125" : "scale-100"}`}
    >
      <span className="-rotate-45 text-[8px] leading-none">
        {direction === "left" ? "◀" : "▶"}
      </span>
    </div>
  );
}

// Figma "rombuses" group: nested diamonds sharing one 2px dashed #A0A4AB border
function ConcentricDiamonds() {
  const sizes = [440, 310, 180];
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {sizes.map((s) => (
        <div
          key={s}
          className="absolute rotate-45 border-2 border-dashed border-[#A0A4AB]"
          style={{ width: s, height: s, maxWidth: "80vw", maxHeight: "80vw" }}
        />
      ))}
    </div>
  );
}

type Step = { field: "name" | "location"; question: string };

const STEPS: Step[] = [
  { field: "name", question: "Introduce Yourself" },
  { field: "location", question: "Where are you from?" },
];

export default function IntroPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const diamondRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      diamondRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
    );
  }, [stepIndex]);

  const step = STEPS[stepIndex];
  const value = step.field === "name" ? name : location;
  const setValue = step.field === "name" ? setName : setLocation;
  const hasValue = value.trim().length > 0;
  const canProceed = hasValue && !loading;

  function handleBack() {
    setError("");
    if (stepIndex === 0) {
      router.push("/testing");
      return;
    }
    setStepIndex((i) => i - 1);
  }

  async function handleProceed() {
    if (!canProceed) return;

    if (step.field === "name" && /\d/.test(name)) {
      setError("Name cannot contain numbers.");
      return;
    }
    setError("");

    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(PHASE_ONE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), location: location.trim() }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      localStorage.setItem(
        "skinstric-user",
        JSON.stringify({ name: name.trim(), location: location.trim(), ...data })
      );

      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => router.push("/testing/select-analysis"),
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex flex-col h-screen select-none bg-[#FCFCFC]">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 md:px-8 md:py-5 border-b border-black/[0.08]">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-bold uppercase">
            Skinstric
          </Link>
          <span className="text-sm font-bold uppercase text-black/50">[ Intro ]</span>
        </div>
        <p className="text-[10px] md:text-xs font-normal uppercase tracking-widest text-black/30">
          To Start Analysis
        </p>
      </header>

      <ConcentricDiamonds />

      {/* Click-to-type diamond field */}
      <main className="relative z-10 flex flex-col flex-1 items-center justify-center px-5 text-center">
        <div ref={diamondRef} className="flex flex-col items-center max-w-lg w-full">
          <p className="text-xs font-normal uppercase tracking-[0.2em] text-black/40 mb-2">
            {value ? step.question.toUpperCase() : "Click to type"}
          </p>
          <input
            key={step.field}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleProceed()}
            placeholder={step.question}
            autoFocus
            className="w-full bg-transparent text-center text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight border-b-2 border-black/70 outline-none placeholder:!text-[#1A1B1C]"
          />
          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
        </div>
      </main>

      {/* Navigation */}
      <div className="relative z-10 flex items-center justify-between px-5 py-6 md:px-8 md:pb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
        >
          <DiamondIcon direction="left" active={false} />
          <span>Back</span>
        </button>

        <button
          onClick={handleProceed}
          disabled={!canProceed}
          className={`flex items-center gap-3 text-xs font-bold uppercase tracking-widest transition-opacity duration-300 ${
            hasValue
              ? canProceed
                ? "opacity-70 hover:opacity-100"
                : "opacity-40 pointer-events-none"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <span>{loading ? "..." : "Proceed"}</span>
          <DiamondIcon direction="right" active={false} />
        </button>
      </div>
    </div>
  );
}
