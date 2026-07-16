"use client";

import { useState, useCallback, useRef } from "react";
import { ImageAnalyzer } from "../utils/imageAnalyzer";

function simulateProgress(callback, startDelay) {
  return new Promise((resolve) => {
    let progress = 0;
    const increments = [
      { to: 15, interval: 80 },
      { to: 30, interval: 120 },
      { to: 50, interval: 150 },
      { to: 70, interval: 100 },
      { to: 85, interval: 180 },
      { to: 95, interval: 60 },
    ];

    const runIncrements = async () => {
      for (const inc of increments) {
        while (progress < inc.to) {
          await new Promise((r) => setTimeout(r, inc.interval));
          progress = Math.min(progress + 1, inc.to);
          callback(progress);
        }
      }
      const result = await callback(progress);
      progress = 100;
      callback(100);
      resolve(result);
    };

    setTimeout(runIncrements, startDelay);
  });
}

export function useImageDetection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("report");
  const imageRef = useRef(null);

  const analyzeImage = useCallback(async (newFile) => {
    if (!newFile) return;

    try {
      setError(null);
      setAnalysis(null);
      setIsAnalyzing(true);
      setProgress(0);

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      const objectUrl = URL.createObjectURL(newFile);
      setFile(newFile);
      setPreview(objectUrl);

      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = objectUrl;
      });

      imageRef.current = img;

      const result = await simulateProgress(
        async (p) => {
          if (p >= 95) {
            const analysisResult = await ImageAnalyzer.analyzeImage(newFile, img);
            return analysisResult;
          }
          return null;
        },
        100
      );

      if (result) {
        setAnalysis(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try a different image.");
    } finally {
      setIsAnalyzing(false);
      setProgress(100);
    }
  }, [preview]);

  const removeImage = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setAnalysis(null);
    setIsAnalyzing(false);
    setError(null);
    setProgress(0);
    imageRef.current = null;
  }, [preview]);

  const replaceImage = useCallback(
    (newFile) => {
      removeImage();
      setTimeout(() => {
        analyzeImage(newFile);
      }, 50);
    },
    [removeImage, analyzeImage]
  );

  const getReportData = useCallback(() => {
    if (!analysis) return null;
    return {
      toolName: "AI Fake Image Detector",
      generatedAt: new Date().toISOString(),
      summary: analysis.summary,
      detailedAnalysis: analysis.detailedAnalysis,
      technicalInfo: analysis.technicalInfo,
      recommendations: analysis.recommendations,
    };
  }, [analysis]);

  return {
    file,
    preview,
    analysis,
    isAnalyzing,
    error,
    progress,
    activeTab,
    setActiveTab,
    analyzeImage,
    removeImage,
    replaceImage,
    getReportData,
  };
}
