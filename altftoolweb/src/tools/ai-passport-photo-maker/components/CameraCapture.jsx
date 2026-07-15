"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Check, RotateCcw } from "lucide-react";
import { Button } from "@altftool/ui";

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [captured, setCaptured] = useState(null);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch {
      setError("Camera is not available. Please use file upload instead.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        setCaptured(dataUrl);
      }
    }, "image/jpeg", 0.95);
  };

  const retake = () => {
    setCaptured(null);
  };

  const accept = () => {
    if (captured) {
      onCapture(captured);
    }
  };

  const close = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-(--card) shadow-lg"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Camera capture"
        >
          <div className="flex items-center justify-between border-b border-(--border) px-5 py-3">
            <h2 className="text-sm font-semibold text-(--foreground)">Capture Photo</h2>
            <button
              type="button"
              onClick={close}
              className="rounded-lg p-1.5 text-(--muted-foreground) transition-colors hover:bg-(--muted) hover:text-(--foreground) focus:outline-none focus:ring-3 focus:ring-(--primary)/35"
              aria-label="Close camera"
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative bg-black">
            {error ? (
              <div className="flex h-64 items-center justify-center p-6">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : captured ? (
              <img src={captured} alt="Captured" className="w-full object-contain" />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full object-contain"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex items-center justify-center gap-4 border-t border-(--border) px-5 py-4">
            {error ? (
              <Button variant="ghost" onClick={close}>
                Close
              </Button>
            ) : captured ? (
              <>
                <Button
                  variant="ghost"
                  onClick={retake}
                  className="flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  Retake
                </Button>
                <Button
                  onClick={accept}
                  className="flex items-center gap-2"
                  style={{ backgroundColor: "var(--primary)", color: "white" }}
                >
                  <Check size={16} />
                  Accept
                </Button>
              </>
            ) : (
              <button
                type="button"
                onClick={captureFrame}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-md transition-transform hover:scale-110 focus:outline-none focus:ring-3 focus:ring-white/50"
                aria-label="Take photo"
              >
                <Camera size={22} />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
