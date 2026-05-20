"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

const PHASE_TWO_API =
  "https://us-central1-frontend-simplified.cloudfunctions.net/skinstricPhaseTwo";

type Stage = "live" | "captured";

export default function CameraPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("live");
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
    startCamera();
    return () => stopCamera();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setPermissionDenied(true);
    }
  }

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
      className="flex flex-col h-screen bg-black text-white select-none"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 relative z-10">
        <Link href="/" className="text-[11px] font-semibold tracking-[0.2em] uppercase">
          Skinstric
        </Link>
        <span className="text-[11px] tracking-[0.15em] uppercase opacity-30">
          {stage === "live" ? "Camera" : "Preview"}
        </span>
        <div className="w-20" />
      </header>

      {/* Camera area */}
      <main ref={contentRef} className="flex flex-col flex-1 relative overflow-hidden">
        {permissionDenied ? (
          <div className="flex flex-1 items-center justify-center flex-col gap-4 px-8 text-center">
            <p className="text-sm opacity-60">Camera access was denied.</p>
            <p className="text-[11px] opacity-40">
              Enable camera permissions in your browser settings and reload the page.
            </p>
            <button
              onClick={retake}
              className="mt-4 px-6 py-2 border border-white/20 text-[11px] tracking-widest uppercase hover:bg-white/10 transition-colors"
            >
              Reload
            </button>
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
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
                <button
                  onClick={capture}
                  className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform"
                  aria-label="Capture photo"
                >
                  <div className="w-10 h-10 rounded-full bg-white" />
                </button>
              </div>
            )}

            {/* Captured overlay label */}
            {stage === "captured" && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="text-[11px] tracking-[0.2em] uppercase bg-black/60 px-3 py-1.5">
                  Photo captured
                </span>
              </div>
            )}

            {error && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
                <p className="text-[11px] text-red-400">{error}</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Navigation */}
      <div className="flex items-center justify-between px-8 pb-8 pt-4 border-t border-white/10 relative z-10">
        <button
          onClick={stage === "live" ? () => router.push("/testing/select-analysis") : retake}
          className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase opacity-40 hover:opacity-100 transition-opacity"
        >
          <span>◀</span>
          <span>Back</span>
        </button>

        {stage === "captured" && (
          <button
            onClick={handleProceed}
            disabled={loading}
            className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase disabled:opacity-20 hover:opacity-60 transition-opacity"
          >
            <span>{loading ? "Analyzing..." : "Proceed"}</span>
            <span>▶</span>
          </button>
        )}
      </div>
    </div>
  );
}
