"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { FOCUS_RING } from "./ui.jsx";

/**
 * Camera capture modal. Streams the front camera, captures a single frame
 * as a data URL, and hands it to the analyzer. Nothing is recorded.
 */
export default function WebcamDetector({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Camera access was denied or is unavailable. You can still upload a photo instead.",
          );
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function handleCapture() {
    const video = videoRef.current;
    if (!video || !ready) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    // Mirror back so the capture matches what the user saw.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    onCapture(canvas.toDataURL("image/png"));
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Take a photo with your camera"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close camera"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ backgroundColor: "color-mix(in srgb, var(--foreground) 45%, transparent)" }}
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-[16px] border border-(--border) bg-(--card) shadow-[var(--anslation-ds-shadow-lg)]">
        <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
          <h2 className="text-sm font-bold text-(--foreground)">Use Camera</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`flex h-8 w-8 items-center justify-center rounded-[8px] text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground) ${FOCUS_RING}`}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black/80">
          {error ? (
            <p className="flex h-full items-center justify-center px-8 text-center text-sm font-medium text-white">
              {error}
            </p>
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full -scale-x-100 object-cover"
            />
          )}
        </div>

        <div className="flex items-center justify-center gap-2.5 px-4 py-4">
          <button
            type="button"
            onClick={handleCapture}
            disabled={!ready || Boolean(error)}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-[8px] px-5 text-sm font-bold text-white transition hover:opacity-95 disabled:pointer-events-none disabled:opacity-60 ${FOCUS_RING}`}
            style={{ background: "var(--anslation-ds-cta-gradient)" }}
          >
            <Camera size={16} aria-hidden="true" />
            Capture Photo
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex h-11 items-center justify-center rounded-[8px] border border-(--border) bg-(--card) px-5 text-sm font-bold text-(--foreground) transition hover:border-(--primary) ${FOCUS_RING}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
