"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { RiImageLine, RiCameraLine } from "react-icons/ri";
import { DiamondIcon } from "@/components/DiamondIcon";

type Option = "gallery" | "camera";

export default function SelectAnalysisPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<Option | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      contentRef.current,
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

      {/* Two diamond options, mirrored left/right like the landing page nav */}
      <main ref={contentRef} className="relative z-10 flex flex-1 items-center justify-center px-5 md:px-16">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-16 md:gap-0">
          <button
            onMouseEnter={() => setHovered("camera")}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleSelect("camera")}
            className="flex items-center gap-4 group"
          >
            <div
              className={`w-24 h-24 md:w-28 md:h-28 rotate-45 border-2 flex items-center justify-center transition-all duration-300 ${
                hovered === "camera" ? "border-black scale-110" : "border-black/30"
              }`}
            >
              <RiCameraLine size={28} className="-rotate-45" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-left max-w-[140px] opacity-70 group-hover:opacity-100 transition-opacity">
              Allow A.I. to scan your surface
            </span>
          </button>

          <button
            onMouseEnter={() => setHovered("gallery")}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleSelect("gallery")}
            className="flex flex-row-reverse items-center gap-4 group"
          >
            <div
              className={`w-24 h-24 md:w-28 md:h-28 rotate-45 border-2 flex items-center justify-center transition-all duration-300 ${
                hovered === "gallery" ? "border-black scale-110" : "border-black/30"
              }`}
            >
              <RiImageLine size={28} className="-rotate-45" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-right max-w-[140px] opacity-70 group-hover:opacity-100 transition-opacity">
              A.I. will access gallery
            </span>
          </button>
        </div>
      </main>

      {/* Navigation */}
      <div className="relative z-10 flex items-center px-5 py-6 md:px-8 md:pb-8">
        <Link
          href="/testing/intro"
          className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
        >
          <DiamondIcon direction="left" active={false} />
          <span>Back</span>
        </Link>
      </div>
    </div>
  );
}
