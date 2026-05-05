"use client";

import { useState } from "react";
import { detectFace } from "../services/faceDetection";

export default function useImageAnalysis() {

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // NEW: store images for compare mode
  const [compareImages, setCompareImages] = useState([]);

  // Mock celebrity dataset
  const celebrities = [
    "Tom Holland",
    "Emma Watson",
    "Zendaya",
    "Chris Hemsworth",
    "Timothée Chalamet",
    "Scarlett Johansson",
    "Robert Downey Jr.",
    "Margot Robbie"
  ];

  const getCelebrityMatch = () => {
    const randomIndex = Math.floor(Math.random() * celebrities.length);
    const similarity = Math.floor(15 + Math.random() * 25);
    return {
      name: celebrities[randomIndex],
      similarity: similarity
    };
  };

  const analyzeImage = async (imageData, mode = "single") => {

    // ✅ COMPARE MODE LOGIC
    if (mode === "compare") {

      setCompareImages((prev) => {
        const updated = [...prev, imageData];

        // WAIT until 2 images
        if (updated.length < 2) {
          return updated;
        }

        // Once 2 images → run comparison
        runComparison(updated[0], updated[1]);

        return updated;
      });

      return; // stop normal flow
    }

    // ✅ SINGLE MODE (UNCHANGED)
    setAnalyzing(true);
    setError(null);

    try {
      const img = new Image();
      img.src = imageData;

      img.onload = async () => {
        const data = await detectFace(img);

        if (!data || data.length === 0) {
          setError("No face detected in the image.");
        } else {
          const celebrityMatch = getCelebrityMatch();

          const enhancedResult = data.map((face) => ({
            ...face,
            celebrityMatch
          }));

          setResult(enhancedResult);
        }

        setAnalyzing(false);
      };

    } catch {
      setError("Analysis failed.");
      setAnalyzing(false);
    }
  };

  // ✅ NEW: comparison logic
  const runComparison = async (img1, img2) => {
    setAnalyzing(true);
    setError(null);

    try {
      const image1 = new Image();
      const image2 = new Image();

      image1.src = img1;
      image2.src = img2;

      await Promise.all([
        new Promise((res) => (image1.onload = res)),
        new Promise((res) => (image2.onload = res))
      ]);

      const data1 = await detectFace(image1);
      const data2 = await detectFace(image2);

      if (!data1?.length || !data2?.length) {
        setError("Face not detected in one of the images.");
        setAnalyzing(false);
        return;
      }

      // Dummy similarity logic (since real compare is elsewhere)
      const similarity = Math.floor(60 + Math.random() * 30);

      setResult({
        type: "compare",
        similarity
      });

      setAnalyzing(false);

    } catch {
      setError("Comparison failed.");
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setCompareImages([]); // ✅ reset compare state
  };

  return { analyzing, result, error, analyzeImage, reset, setResult };
}