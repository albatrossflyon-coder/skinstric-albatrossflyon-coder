"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { RiUploadLine } from "react-icons/ri";

const PHASE_TWO_API =
  "https://us-central1-frontend-simplified.cloudfunctions.net/skinstricPhaseTwo";

export default function UploadPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
    );
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setError("");
    };
    reader.readAsDataURL(file);
  }

  async function handleProceed() {
    if (!preview) return;
    setLoading(true);
    setError("");

    try {
      // Strip the data URI prefix to send raw base64
      const base64 = preview.split(",")[1];

      const res = await fetch(PHASE_TWO_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      localStorage.setItem("skinstric-analysis", JSON.stringify(data));

      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => router.push("/testing/results"),
      });
    } catch {
      setError("Could not analyze photo. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen select-none"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-black/[0.08]">
        <Link href="/" className="text-[11px] font-semibold tracking-[0.2em] uppercase">
          Skinstric
        </Link>
        <span className="text-[11px] tracking-[0.15em] uppercase opacity-30">
          Testing
        </span>
        <div className="w-20" />
      </header>

      {/* Content */}
      <main className="flex flex-col flex-1 items-center justify-center px-8">
        <div ref={contentRef} className="w-full max-w-sm text-center">
          <p className="text-[10px] tracking-[0.25em] uppercase text-black/30 mb-3">
            A.I. Analysis
          </p>
          <h1 className="text-2xl font-semibold tracking-tight mb-8">
            Upload a Photo
          </h1>

          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            className="relative w-full aspect-square max-w-[280px] mx-auto border border-dashed border-black/20 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-black/40 hover:bg-black/[0.02] transition-all overflow-hidden mb-6"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <>
                <RiUploadLine size={28} className="opacity-30" />
                <p className="text-[11px] tracking-wide uppercase opacity-30">
                  Click to upload
                </p>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {error && (
            <p className="text-[11px] text-red-500 mb-4">{error}</p>
          )}
        </div>
      </main>

      {/* Navigation */}
      <div className="flex items-center justify-between px-8 pb-8">
        <Link
          href="/testing/select-analysis"
          className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase opacity-40 hover:opacity-100 transition-opacity"
        >
          <span>◀</span>
          <span>Back</span>
        </Link>

        <button
          onClick={handleProceed}
          disabled={!preview || loading}
          className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase disabled:opacity-20 hover:opacity-60 transition-opacity"
        >
          <span>{loading ? "Analyzing..." : "Proceed"}</span>
          <span>▶</span>
        </button>
      </div>
    </div>
  );
}
