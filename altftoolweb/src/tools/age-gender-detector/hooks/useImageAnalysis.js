"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { detectFaces, loadModels } from "../services/faceDetection";
import { getDemoSample, isDemoMode } from "../utils/demo";

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Full analysis state machine:
 * idle → loading (model) → analyzing → done | error
 * Everything runs locally in the browser — the image never leaves the device.
 */
export default function useImageAnalysis() {
  const [status, setStatus] = useState("idle"); // idle | loading | analyzing | done | error
  const [image, setImage] = useState(null); // { src, naturalWidth, naturalHeight }
  const [faces, setFaces] = useState([]);
  const [activeFace, setActiveFace] = useState(0);
  const [processingMs, setProcessingMs] = useState(0);
  const [error, setError] = useState("");
  const runId = useRef(0);

  // Demo mode: show a sample result immediately (?demo=1).
  useEffect(() => {
    if (isDemoMode()) {
      const sample = getDemoSample();
      setImage({
        src: sample.src,
        naturalWidth: sample.naturalWidth,
        naturalHeight: sample.naturalHeight,
      });
      setFaces(sample.faces);
      setProcessingMs(sample.processingMs);
      setActiveFace(0);
      setStatus("done");
    }
  }, []);

  const analyzeSrc = useCallback(async (src) => {
    const id = ++runId.current;
    setError("");
    setFaces([]);
    setActiveFace(0);
    setStatus("loading");

    try {
      const img = new Image();
      img.src = src;
      await img.decode();

      if (runId.current !== id) return;
      setImage({ src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });

      await loadModels();
      if (runId.current !== id) return;
      setStatus("analyzing");

      const startedAt = performance.now();
      const detected = await detectFaces(img);
      const elapsed = performance.now() - startedAt;

      if (runId.current !== id) return;
      setProcessingMs(elapsed);

      if (!detected.length) {
        setError(
          "No face detected. Try a clear, front-facing photo with good lighting.",
        );
        setStatus("error");
        return;
      }

      setFaces(detected);
      setStatus("done");
    } catch (err) {
      if (runId.current !== id) return;
      setError(
        err?.message?.includes("decode")
          ? "That file could not be read as an image."
          : "Analysis failed — the AI model could not be loaded. Check your connection and try again.",
      );
      setStatus("error");
    }
  }, []);

  const analyzeFile = useCallback(
    (file) => {
      if (!file) return;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Unsupported file type. Please use a JPG, PNG, or WebP image.");
        setStatus("error");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError("File is larger than 10MB. Please choose a smaller image.");
        setStatus("error");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => analyzeSrc(String(reader.result));
      reader.onerror = () => {
        setError("Could not read that file. Please try again.");
        setStatus("error");
      };
      reader.readAsDataURL(file);
    },
    [analyzeSrc],
  );

  const reset = useCallback(() => {
    runId.current += 1;
    setStatus("idle");
    setImage(null);
    setFaces([]);
    setActiveFace(0);
    setProcessingMs(0);
    setError("");
  }, []);

  return {
    status,
    image,
    faces,
    activeFace,
    setActiveFace,
    processingMs,
    error,
    analyzeFile,
    analyzeSrc,
    reset,
  };
}
