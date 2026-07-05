"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { RiCameraLine } from "react-icons/ri";
import { DiamondIcon } from "@/components/DiamondIcon";
import { STORAGE_KEYS } from "@/lib/storageKeys";

const PHASE_TWO_API =
  "https://us-central1-frontend-simplified.cloudfunctions.net/skinstricPhaseTwo";

type Stage = "starting" | "live" | "captured";

function ResultTips() {
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 text-center px-4 w-full max-w-md">
      <p className="text-[10px] uppercase tracking-widest text-black/40 mb-2">
        To get better results make sure to have
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-widest text-black/60">
        <span>◇ Neutral expression</span>
        <span>◇ Frontal pose</span>
        <span>◇ Adequate lighting</span>
      </div>
    </div>
  );
}

export default function CameraPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("starting");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      contentRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );

    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setStage("live");
      } catch {
        if (!cancelled) setPermissionDenied(true);
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, []);

  // The <video> element only mounts once stage leaves "starting", so the
  // stream can't be attached until after that render — do it here instead
  // of inline in startCamera, where videoRef.current would still be null.
  useEffect(() => {
    if (stage === "live" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [stage]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror to match live preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    stopCamera();
    setStage("captured");
    setError("");
  }, []);

  function retake() {
    // Reload the page — matches the spec ("Back arrow reloads page")
    window.location.reload();
  }

  async function handleProceed() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setLoading(true);
    setError("");

    try {
      const base64 = canvas.toDataURL("image/jpeg", 0.9).split(",")[1];

      const res = await fetch(PHASE_TWO_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (!res.ok) throw new Error("API error");

      const { data } = await res.json();
      localStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify(data));

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

      {/* Camera area */}
      <main ref={contentRef} className="flex flex-col flex-1 relative overflow-hidden">
        {permissionDenied ? (
          <div className="flex flex-1 items-center justify-center flex-col gap-4 px-8 text-center">
            <p className="text-sm text-black/60">Camera access was denied.</p>
            <p className="text-xs text-black/40">
              Enable camera permissions in your browser settings and reload the page.
            </p>
            <button
              onClick={retake}
              className="mt-4 px-6 py-2 border border-black/20 text-xs font-bold tracking-widest uppercase hover:bg-black/5 transition-colors"
            >
              Reload
            </button>
          </div>
        ) : stage === "starting" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rotate-45 border-2 border-dashed border-[#A0A4AB] flex items-center justify-center">
              <RiCameraLine size={20} className="-rotate-45 text-black/50" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-black/50">
              Setting up camera ...
            </p>
            <ResultTips />
          </div>
        ) : (
          <>
            {/* Live video — mirrored so it feels natural */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover [transform:scaleX(-1)] ${
                stage === "captured" ? "hidden" : ""
              }`}
            />

            {/* Captured still */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full object-cover ${
                stage === "live" ? "hidden" : ""
              }`}
            />

            {/* Capture button (live only) */}
            {stage === "live" && (
              <button
                onClick={capture}
                className="absolute bottom-24 right-8 z-10 flex flex-col items-center gap-2 group"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">
                  Take Picture
                </span>
                <div className="w-14 h-14 rounded-full bg-white/80 border border-black/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <RiCameraLine size={22} />
                </div>
              </button>
            )}

            {/* Captured overlay label */}
            {stage === "captured" && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-black/50">
                  Great shot!
                </span>
              </div>
            )}

            <ResultTips />

            {error && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Navigation */}
      <div className="relative z-10 flex items-center justify-between px-5 py-6 md:px-8 md:pb-8">
        <button
          onClick={stage === "captured" ? retake : () => router.push("/testing/select-analysis")}
          className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
        >
          <DiamondIcon direction="left" active={false} />
          <span>Back</span>
        </button>

        {stage === "captured" && (
          <button
            onClick={handleProceed}
            disabled={loading}
            className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest disabled:opacity-20 opacity-70 hover:opacity-100 transition-opacity"
          >
            <span>{loading ? "Analyzing..." : "Proceed"}</span>
            <DiamondIcon direction="right" active={false} />
          </button>
        )}
      </div>
    </div>
  );
}
