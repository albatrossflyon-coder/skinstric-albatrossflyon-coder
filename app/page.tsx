"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

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

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [hoverSide, setHoverSide] = useState<"left" | "right" | null>(null);

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
    <div className="relative flex flex-col min-h-screen select-none bg-[#FCFCFC]">
      {/* Header */}
      <header
        ref={headerRef}
        className="relative z-10 flex items-center justify-between px-5 py-4 md:px-8 md:py-5 border-b border-black/[0.08]"
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-bold uppercase">
            Skinstric
          </Link>
          <span className="text-sm font-bold uppercase text-black/50">
            [ Intro ]
          </span>
        </div>
        <Link
          href="/testing"
          className="bg-[#1A1B1C] text-[#FCFCFC] text-[10px] font-bold uppercase px-4 py-2 hover:bg-black/80 transition-colors"
        >
          Enter Code
        </Link>
      </header>

      {/* Decorative corner diamonds — isolated clipping layer so the oversized rotated shapes never interfere with page content stacking */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 rotate-45 w-[602px] h-[602px] border-2 border-dashed border-[#A0A4AB]" />
        <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 rotate-45 w-[602px] h-[602px] border-2 border-dashed border-[#A0A4AB]" />
      </div>

      {/* Hero — shifts away from whichever side button is hovered (reference site behavior) */}
      <main
        ref={heroRef}
        className={`relative z-10 flex flex-col flex-1 items-center justify-center text-center px-5 py-16 transition-transform duration-300 ${
          hoverSide === "right" ? "md:-translate-x-24 lg:-translate-x-40" : hoverSide === "left" ? "md:translate-x-24 lg:translate-x-40" : "translate-x-0"
        }`}
      >
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold leading-[1.05] tracking-[-0.02em] mb-5 md:mb-6 max-w-[680px]">
          Sophisticated<br />skincare
        </h1>
      </main>

      {/* Description — Figma spec: bottom-left corner, 14px, regular weight, uppercase, #1A1B1C */}
      <p className="hidden md:block absolute left-8 bottom-8 z-10 text-sm leading-6 font-normal uppercase text-[#1A1B1C] max-w-[320px]">
        Skinstric developed an A.I. that creates a highly-personalized routine
        tailored to what your skin needs.
      </p>

      {/* Discover A.I. — left edge, vertically centered. Disappears when Take Test is hovered. */}
      <button
        onMouseEnter={() => setHoverSide("left")}
        onMouseLeave={() => setHoverSide(null)}
        className={`hidden md:flex items-center gap-4 absolute left-8 top-1/2 -translate-y-1/2 z-10 text-sm font-bold uppercase transition-opacity duration-300 ${
          hoverSide === "right" ? "opacity-0 pointer-events-none" : "opacity-70 hover:opacity-100"
        }`}
      >
        <DiamondIcon direction="left" active={hoverSide === "left"} />
        <span>Discover A.I.</span>
      </button>

      {/* Take Test — right edge, vertically centered. Disappears when Discover A.I. is hovered. */}
      <Link
        href="/testing"
        onMouseEnter={() => setHoverSide("right")}
        onMouseLeave={() => setHoverSide(null)}
        className={`hidden md:flex items-center gap-4 absolute right-8 top-1/2 -translate-y-1/2 z-10 text-sm font-bold uppercase transition-opacity duration-300 ${
          hoverSide === "left" ? "opacity-0 pointer-events-none" : "opacity-70 hover:opacity-100"
        }`}
      >
        <span>Take Test</span>
        <DiamondIcon direction="right" active={hoverSide === "right"} />
      </Link>

      {/* Mobile fallback — visible only when desktop edge layout is hidden */}
      <div className="flex md:hidden flex-col items-center gap-3 px-5 pb-6">
        <p className="text-sm font-normal uppercase leading-6 text-[#1A1B1C] text-center max-w-[320px] mb-2">
          Skinstric developed an A.I. that creates a highly-personalized routine
          tailored to what your skin needs.
        </p>
        <button className="flex items-center gap-2 text-sm font-bold uppercase opacity-70">
          <DiamondIcon direction="left" active={false} />
          <span>Discover A.I.</span>
        </button>
        <Link
          href="/testing"
          className="flex items-center gap-2 text-sm font-bold uppercase opacity-70"
        >
          <span>Take Test</span>
          <DiamondIcon direction="right" active={false} />
        </Link>
      </div>
    </div>
  );
}
