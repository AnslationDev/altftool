"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, Square } from "lucide-react";
import { decodeFrameFast, tryQuagga } from "../utils/decodeEngine";

export default function CameraPanel({ onDetect }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);
  const busyRef = useRef(false);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");

  const stopCamera = () => {
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  };

  // Ensure the camera is released when the component unmounts or the user
  // switches back to upload mode.
  useEffect(() => stopCamera, []);

  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);

      const frame = document.createElement("canvas");
      let tick = 0;
      loopRef.current = setInterval(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || busyRef.current) return;
        busyRef.current = true;
        tick += 1;
        try {
          frame.width = video.videoWidth;
          frame.height = video.videoHeight;
          frame.getContext("2d", { willReadFrequently: true }).drawImage(video, 0, 0);

          // Fast pass every tick; Quagga (1D fallback) roughly once a second.
          let result = await decodeFrameFast(frame);
          if (!result && tick % 4 === 0 && !("BarcodeDetector" in window)) {
            result = await tryQuagga(frame.toDataURL("image/png"));
          }
          if (result) {
            const snapshot = document.createElement("canvas");
            snapshot.width = frame.width;
            snapshot.height = frame.height;
            snapshot.getContext("2d").drawImage(frame, 0, 0);
            stopCamera();
            onDetect(result, snapshot);
          }
        } finally {
          busyRef.current = false;
        }
      }, 250);
    } catch (err) {
      stopCamera();
      setError(
        err?.name === "NotAllowedError"
          ? "Camera access was denied. Allow camera permission and try again."
          : "Couldn't start the camera on this device.",
      );
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-4">
      <div className="relative overflow-hidden rounded-xl bg-foreground/90">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full ${active ? "block" : "hidden"} max-h-80 object-contain`}
        />
        {active ? (
          <>
            {/* Scan frame overlay */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-40 w-64 rounded-lg border-2 border-primary/80">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 animate-pulse bg-primary" />
              </div>
            </div>
            <p className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
              Scanning…
            </p>
          </>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-background/20 text-background">
              <Camera aria-hidden="true" size={22} />
            </span>
            <p className="text-sm font-medium text-background">
              Point your camera at a barcode or QR code
            </p>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 text-xs font-semibold text-danger">
          <AlertTriangle aria-hidden="true" size={14} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}

      <button
        type="button"
        onClick={active ? stopCamera : startCamera}
        aria-live="polite"
        className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          active
            ? "bg-danger text-primary-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {active ? (
          <>
            <Square aria-hidden="true" size={14} /> Stop Camera
          </>
        ) : (
          <>
            <Camera aria-hidden="true" size={15} /> Start Camera
          </>
        )}
      </button>
    </div>
  );
}
