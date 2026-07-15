"use client";

import { useState } from "react";
import { calculateBeautyScore } from "../services/beautyAnalyzer";

export default function useBeautyScore() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyzeImage = async (imageData) => {
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const img = new Image();
      img.src = imageData;

      img.onload = async () => {
        try {
          const data = await calculateBeautyScore(img);
          if (!data) {
            setError("No face detected in the image. Please try another one.");
          } else {
            setResult(data);
          }
        } catch (err) {
          setError("Analysis failed during calculation.");
        } finally {
          setAnalyzing(false);
        }
      };

      img.onerror = () => {
        setError("Failed to load image.");
        setAnalyzing(false);
      };
    } catch (err) {
      setError("An unexpected error occurred.");
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setAnalyzing(false);
  };

  return { analyzing, result, error, analyzeImage, reset };
}
