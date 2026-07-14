"use client";

import { useState, useEffect } from "react";
import { detectEmotions } from "../services/faceDetection";

export default function useEmotionAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // Load history from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("altftool_emotion_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history from sessionStorage", e);
    }
  }, []);

  const addHistoryItem = (faces, imageSrc) => {
    if (!faces || faces.length === 0) return;
    
    // Create simple summary item
    const newItem = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      faceCount: faces.length,
      dominantEmotion: faces[0].dominantEmotion,
      image: imageSrc, // Save thumbnail or source image
      faces, // Save full analytical results
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 10); // Keep last 10 entries
      try {
        sessionStorage.setItem("altftool_emotion_history", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save history to sessionStorage", e);
      }
      return updated;
    });
  };

  const analyzeImage = async (imageData) => {
    setAnalyzing(true);
    setError(null);

    try {
      const img = new Image();
      img.src = imageData;

      img.onload = async () => {
        try {
          const faces = await detectEmotions(img);

          if (!faces || faces.length === 0) {
            setError("No face detected. Please ensure your face is clearly visible and well-lit.");
            setResult(null);
          } else {
            setResult(faces);
            addHistoryItem(faces, imageData);
          }
        } catch (err) {
          console.error("Inference error:", err);
          setError("Failed to run facial expression model.");
          setResult(null);
        } finally {
          setAnalyzing(false);
        }
      };

      img.onerror = () => {
        setError("Failed to load image. Please try another image file.");
        setAnalyzing(false);
      };
    } catch (err) {
      console.error("Analysis initialization error:", err);
      setError("An unexpected error occurred during analysis.");
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setAnalyzing(false);
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      sessionStorage.removeItem("altftool_emotion_history");
    } catch (e) {
      console.error("Failed to clear sessionStorage history", e);
    }
  };

  return {
    analyzing,
    result,
    error,
    history,
    analyzeImage,
    reset,
    setResult,
    clearHistory
  };
}
