"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const PHASE_ONE_API =
  "https://us-central1-frontend-simplified.cloudfunctions.net/skinstricPhaseOne";

function CornerBracket({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const size = 14;
  const paths: Record<string, string> = {
    tl: `M${size} 0 L0 0 L0 ${size}`,
    tr: `M0 0 L${size} 0 L${size} ${size}`,
    bl: `M0 0 L0 ${size} L${size} ${size}`,
    br: `M${size} 0 L${size} ${size} L0 ${size}`,
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <path d={paths[position]} stroke="#1a1a1a" strokeWidth={1.5} />
    </svg>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-1">
        <CornerBracket position="tl" />
        <CornerBracket position="bl" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-black/40 px-1">
          {label}
        </span>
        <CornerBracket position="tr" />
        <CornerBracket position="br" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full border-b border-black/20 py-2 text-sm tracking-wide bg-transparent placeholder:text-black/20 focus:border-black transition-colors"
      />
      {error && (
        <p className="mt-1 text-[11px] text-red-500">{error}</p>
      )}
    </div>
  );
}

export default function IntroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
    );
  }, []);

  function validate(): boolean {
    if (/\d/.test(name)) {
      setNameError("Name cannot contain numbers.");
      return false;
    }
    setNameError("");
    return true;
  }

  async function handleProceed(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (!name.trim() || !location.trim()) return;

    setLoading(true);
    setApiError("");

    try {
      const res = await fetch(PHASE_ONE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), location: location.trim() }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      localStorage.setItem("skinstric-user", JSON.stringify({ name: name.trim(), location: location.trim(), ...data }));

      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => router.push("/testing/select-analysis"),
      });
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const canProceed = name.trim().length > 0 && location.trim().length > 0 && !loading;

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen select-none"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-black/[0.08]">
        <Link
          href="/"
          className="text-[11px] font-semibold tracking-[0.2em] uppercase"
        >
          Skinstric
        </Link>
        <span className="text-[11px] tracking-[0.15em] uppercase opacity-30">
          Testing
        </span>
        <div className="w-20" />
      </header>

      {/* Form */}
      <main className="flex flex-col flex-1 items-center justify-center px-5 md:px-8">
        <div ref={formRef} className="w-full max-w-sm">
          <p className="text-[10px] tracking-[0.25em] uppercase text-black/30 mb-3">
            To Start Analysis
          </p>
          <h1 className="text-2xl font-semibold tracking-tight mb-8">
            Introduce Yourself
          </h1>

          <form onSubmit={handleProceed} className="flex flex-col gap-8">
            <Field
              label="Your Name"
              value={name}
              onChange={(v) => {
                setName(v);
                setNameError("");
              }}
              error={nameError}
              placeholder="Enter name"
              autoFocus
            />
            <Field
              label="Your Location"
              value={location}
              onChange={setLocation}
              placeholder="Enter location"
            />

            {apiError && (
              <p className="text-[11px] text-red-500">{apiError}</p>
            )}
          </form>
        </div>
      </main>

      {/* Navigation */}
      <div className="flex items-center justify-between px-8 pb-8">
        <Link
          href="/testing"
          className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase opacity-40 hover:opacity-100 transition-opacity"
        >
          <span>◀</span>
          <span>Back</span>
        </Link>

        <button
          onClick={handleProceed}
          disabled={!canProceed}
          className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase disabled:opacity-20 hover:opacity-60 transition-opacity"
        >
          <span>{loading ? "..." : "Proceed"}</span>
          <span>▶</span>
        </button>
      </div>
    </div>
  );
}
