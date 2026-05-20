"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

function CornerBracket({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const size = 12;
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

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(headerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
      .fromTo(
        heroRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
        "-=0.2"
      );
  }, []);

  return (
    <div className="flex flex-col h-screen select-none">
      {/* Header */}
      <header
        ref={headerRef}
        className="flex items-center justify-between px-8 py-5 border-b border-black/[0.08]"
      >
        <Link
          href="/"
          className="text-[11px] font-semibold tracking-[0.2em] uppercase"
        >
          Skinstric
        </Link>

        {/* Bracketed section label */}
        <div className="flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase">
          <CornerBracket position="tl" />
          <CornerBracket position="bl" />
          <span className="px-2">Intro</span>
          <CornerBracket position="tr" />
          <CornerBracket position="br" />
        </div>

        <Link
          href="/testing"
          className="text-[11px] tracking-[0.15em] uppercase opacity-40 hover:opacity-100 transition-opacity"
        >
          Enter Code
        </Link>
      </header>

      {/* Hero */}
      <main
        ref={heroRef}
        className="flex flex-col flex-1 justify-end px-10 pb-20 md:px-16"
      >
        <p className="text-[10px] tracking-[0.25em] uppercase text-black/30 mb-5">
          A.I. Skincare
        </p>

        <h1 className="text-5xl md:text-7xl font-semibold leading-[1.05] tracking-[-0.02em] mb-6">
          Sophisticated<br />skincare
        </h1>

        <p className="text-xs leading-relaxed text-black/50 max-w-[260px] mb-10">
          Skinstric developed an A.I. that creates a highly-personalized routine
          tailored to what your skin needs.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/testing"
            className="flex items-center gap-2 px-7 py-3 bg-black text-white text-[11px] tracking-[0.15em] uppercase hover:bg-black/80 transition-colors"
          >
            <span>◀</span>
            <span>Enter Experience</span>
          </Link>
          <Link
            href="/testing"
            className="flex items-center gap-2 px-7 py-3 border border-black text-[11px] tracking-[0.15em] uppercase hover:bg-black/[0.03] transition-colors"
          >
            <span>Take Test</span>
            <span>▶</span>
          </Link>
        </div>
      </main>

      {/* Discover A.I. */}
      <div className="px-10 pb-8 md:px-16">
        <button className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase opacity-40 hover:opacity-100 transition-opacity">
          <div className="w-4 h-4 rounded-full border border-black/50 flex items-center justify-center">
            <span className="text-[8px]">▶</span>
          </div>
          <span>Discover A.I.</span>
        </button>
      </div>
    </div>
  );
}
