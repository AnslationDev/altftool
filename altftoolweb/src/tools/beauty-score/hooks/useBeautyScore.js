"use client";

import { useRef, useState } from "react";
import { calculateBeautyScore } from "../services/beautyAnalyzer";

export default function useBeautyScore() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  // Bumped by every analyzeImage() call and by reset(). A completion handler only
  // applies its outcome if its own requestId still matches — otherwise a slower,
  // stale analysis (e.g. from a photo the user already moved on from) would
  // overwrite a newer analysis's result, error, or analyzing state.
  const requestIdRef = useRef(0);

  const analyzeImage = async (imageData) => {
    const requestId = (requestIdRef.current += 1);
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const img = new Image();
      img.src = imageData;

      img.onload = async () => {
        try {
          const data = await calculateBeautyScore(img);
          if (requestId !== requestIdRef.current) return;
          if (!data) {
            setError("No face detected in the image. Please try another one.");
          } else {
            setResult(data);
          }
        } catch (err) {
          if (requestId !== requestIdRef.current) return;
          if (process.env.NODE_ENV !== "production") {
            console.warn("[beauty-score] Analysis failed during calculation.", err);
          }
          setError("Analysis failed during calculation.");
        } finally {
          if (requestId === requestIdRef.current) setAnalyzing(false);
        }
      };

      img.onerror = () => {
        if (requestId !== requestIdRef.current) return;
        setError("Failed to load image.");
        setAnalyzing(false);
      };
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError("An unexpected error occurred.");
      setAnalyzing(false);
    }
  };

  const reset = () => {
    requestIdRef.current += 1;
    setResult(null);
    setError(null);
    setAnalyzing(false);
  };

  return { analyzing, result, error, analyzeImage, reset };
}
