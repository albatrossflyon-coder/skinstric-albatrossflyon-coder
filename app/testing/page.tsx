"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const VALID_CODE = "CfbKtsghNgHVlFyt1lY2RdDfQsowB2zo7XA5zWoxoeKHoiUj#8XawtihnzH7w_jfdvGgk0IwW7EkpKrQc7p62X5VSnM0";

function Diamond({
  size,
  variant,
  className,
}: {
  size: number;
  variant: "light" | "medium" | "dark";
  className?: string;
}) {
  const fills: Record<string, string> = {
    light: "transparent",
    medium: "rgba(0,0,0,0.06)",
    dark: "rgba(0,0,0,0.85)",
  };
  const strokes: Record<string, string> = {
    light: "rgba(0,0,0,0.15)",
    medium: "rgba(0,0,0,0.25)",
    dark: "rgba(0,0,0,0.85)",
  };

  return (
    <div
      className={`absolute ${className}`}
      style={{
        width: size,
        height: size,
        transform: "rotate(45deg)",
        background: fills[variant],
        border: `1px solid ${strokes[variant]}`,
      }}
    />
  );
}

export default function TestingPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
    );
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim() === VALID_CODE) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => router.push("/testing/intro"),
      });
    } else {
      setError("Invalid code. Please try again.");
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen relative overflow-hidden select-none"
    >
      {/* Decorative diamonds */}
      <Diamond size={340} variant="light" className="-top-24 -right-24" />
      <Diamond size={180} variant="medium" className="top-1/3 -right-10" />
      <Diamond size={80} variant="dark" className="bottom-32 right-40" />

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-black/[0.08] relative z-10">
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
      <main className="flex flex-col flex-1 items-center justify-center px-8 relative z-10">
        <div ref={formRef} className="w-full max-w-md text-center">
          <p className="text-[10px] tracking-[0.25em] uppercase text-black/30 mb-8">
            To Start Analysis
          </p>
          <h1 className="text-2xl font-semibold tracking-tight mb-10">
            Enter Code to Start Analysis
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
            <div className="w-full border-b border-black/20 pb-2">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                placeholder="Click to Type"
                className="w-full text-center text-sm tracking-widest bg-transparent placeholder:text-black/20 placeholder:tracking-widest placeholder:uppercase"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-[11px] text-red-500 tracking-wide">{error}</p>
            )}

            <button
              type="submit"
              className="mt-4 px-8 py-2.5 bg-black text-white text-[11px] tracking-[0.15em] uppercase hover:bg-black/80 transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </main>

      {/* Back */}
      <div className="px-8 pb-8 relative z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase opacity-40 hover:opacity-100 transition-opacity"
        >
          <span>◀</span>
          <span>Back</span>
        </Link>
      </div>
    </div>
  );
}
