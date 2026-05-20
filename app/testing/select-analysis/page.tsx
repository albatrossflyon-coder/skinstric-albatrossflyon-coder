"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { RiImageLine, RiCameraLine } from "react-icons/ri";

function Diamond({
  size,
  variant,
  className,
}: {
  size: number;
  variant: "light" | "medium" | "dark";
  className?: string;
}) {
  const styles: Record<string, { bg: string; border: string }> = {
    light:  { bg: "transparent",        border: "rgba(0,0,0,0.12)" },
    medium: { bg: "rgba(0,0,0,0.06)",   border: "rgba(0,0,0,0.20)" },
    dark:   { bg: "rgba(0,0,0,0.85)",   border: "rgba(0,0,0,0.85)" },
  };
  const s = styles[variant];
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        transform: "rotate(45deg)",
        background: s.bg,
        border: `1px solid ${s.border}`,
      }}
    />
  );
}

type Option = "gallery" | "camera";

export default function SelectAnalysisPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<Option | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
    );
  }, []);

  function handleSelect(option: Option) {
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: () =>
        router.push(option === "gallery" ? "/testing/upload" : "/testing/camera"),
    });
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen relative overflow-hidden select-none"
    >
      {/* Decorative diamonds */}
      <Diamond size={300} variant="light"  className="-top-20 -right-20" />
      <Diamond size={140} variant="medium" className="top-1/2 -right-8" />
      <Diamond size={60}  variant="dark"   className="bottom-28 right-36" />

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-black/[0.08] relative z-10">
        <Link href="/" className="text-[11px] font-semibold tracking-[0.2em] uppercase">
          Skinstric
        </Link>
        <span className="text-[11px] tracking-[0.15em] uppercase opacity-30">
          Testing
        </span>
        <div className="w-20" />
      </header>

      {/* Content */}
      <main className="flex flex-col flex-1 items-center justify-center px-8 relative z-10">
        <div ref={cardsRef} className="w-full max-w-2xl text-center">
          <p className="text-[10px] tracking-[0.25em] uppercase text-black/30 mb-3">
            Setup your test
          </p>
          <h1 className="text-2xl font-semibold tracking-tight mb-10">
            Grant camera access to get an A.I. analysis of your skin
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            {/* Gallery */}
            <button
              onMouseEnter={() => setHovered("gallery")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleSelect("gallery")}
              className={`flex flex-col items-center justify-center gap-4 w-full sm:w-52 h-44 sm:h-52 border transition-all duration-200 ${
                hovered === "gallery"
                  ? "border-black bg-black text-white"
                  : "border-black/20 bg-white text-black hover:border-black/40"
              }`}
            >
              <RiImageLine size={32} />
              <div className="text-center">
                <p className="text-[11px] font-semibold tracking-[0.15em] uppercase">
                  Upload Photo
                </p>
                <p className="text-[10px] tracking-wide opacity-50 mt-1">
                  From gallery
                </p>
              </div>
            </button>

            {/* Camera */}
            <button
              onMouseEnter={() => setHovered("camera")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleSelect("camera")}
              className={`flex flex-col items-center justify-center gap-4 w-full sm:w-52 h-44 sm:h-52 border transition-all duration-200 ${
                hovered === "camera"
                  ? "border-black bg-black text-white"
                  : "border-black/20 bg-white text-black hover:border-black/40"
              }`}
            >
              <RiCameraLine size={32} />
              <div className="text-center">
                <p className="text-[11px] font-semibold tracking-[0.15em] uppercase">
                  Take Selfie
                </p>
                <p className="text-[10px] tracking-wide opacity-50 mt-1">
                  Use camera
                </p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Navigation */}
      <div className="flex items-center justify-between px-8 pb-8 relative z-10">
        <Link
          href="/testing/intro"
          className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase opacity-40 hover:opacity-100 transition-opacity"
        >
          <span>◀</span>
          <span>Back</span>
        </Link>
        <div className="w-20" />
      </div>
    </div>
  );
}
