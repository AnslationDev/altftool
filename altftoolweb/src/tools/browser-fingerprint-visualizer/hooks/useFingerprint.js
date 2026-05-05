"use client";

import { useState, useEffect } from "react";
import { getCanvasFingerprint } from "../lib/fingerprint-data/canvasFingerprint";
import { getWebGLFingerprint } from "../lib/fingerprint-data/webglFingerprint";
import { getAudioFingerprint } from "../lib/fingerprint-data/audioFingerprint";
import { detectFonts } from "../lib/fingerprint-data/fontDetector";
import { getDeviceInfo } from "../lib/fingerprint-data/deviceInfo";
import { getBrowserInfo } from "../lib/fingerprint-data/browserInfo";
import { getScreenInfo } from "../lib/fingerprint-data/screenInfo";
import { getStorageInfo } from "../lib/fingerprint-data/storageInfo";
import { getMediaInfo } from "../lib/fingerprint-data/mediaInfo";
import { generateFingerprintHash } from "../lib/hashFingerprint";
import { calculateRiskScore } from "../lib/riskScore";
import { estimateUniqueness } from "../lib/uniquenessScore";
import { getTipsForScore } from "../lib/privacyTips";

export function useFingerprint() {
  const [state, setState] = useState({
    loading: true,
    progress: 0,
    currentStep: "",
    fingerprintId: null,
    signals: {
      canvas: null,
      webgl: null,
      audio: null,
      fonts: null,
      device: null,
      browser: null,
      screen: null,
      storage: null,
      media: null,
    },
    riskScore: null,
    uniqueness: null,
    privacyTips: [],
    error: null,
  });

  useEffect(() => {
    collectFingerprint();
  }, []);

  async function collectFingerprint() {
    try {
      const updateProgress = (progress, step) => {
        setState((prev) => ({ ...prev, progress, currentStep: step }));
      };

      updateProgress(5,  "Starting fingerprint collection...");

      // ── Step 1: Synchronous collectors (fast) ──
      updateProgress(10, "Reading browser information...");
      const browser = getBrowserInfo();

      updateProgress(20, "Reading screen & display info...");
      const screen = getScreenInfo();

      updateProgress(30, "Detecting fonts...");
      const fonts = detectFonts();

      updateProgress(40, "Capturing canvas fingerprint...");
      const canvas = getCanvasFingerprint();

      updateProgress(50, "Extracting WebGL fingerprint...");
      const webgl = getWebGLFingerprint();

      // ── Step 2: Async collectors in parallel ──
      updateProgress(60, "Collecting audio, device & media data...");
      const [audio, device, storage, media] = await Promise.all([
        getAudioFingerprint(),
        getDeviceInfo(),
        getStorageInfo(),
        getMediaInfo(),
      ]);

      // ── Step 3: Combine all signals ──
      const signals = {
        canvas, webgl, audio, fonts,
        device, browser, screen, storage, media,
      };

      // ── Step 4: Generate SHA-256 hash ──
      updateProgress(75, "Generating fingerprint hash...");
      const fingerprintId = await generateFingerprintHash(signals);

      // ── Step 5: Calculate scores ──
      updateProgress(85, "Calculating tracking risk score...");
      const riskScore    = calculateRiskScore(signals);
      const uniqueness   = estimateUniqueness(signals);
      const privacyTips  = getTipsForScore(riskScore.score);

      updateProgress(100, "Done!");

      // ── Step 6: Set final state ──
      setState({
        loading: false,
        progress: 100,
        currentStep: "Complete",
        fingerprintId,
        signals,
        riskScore,
        uniqueness,
        privacyTips,
        error: null,
      });

    } catch (error) {
      console.error("Fingerprint collection failed:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to collect fingerprint",
      }));
    }
  }

  const refresh = () => {
    setState((prev) => ({ ...prev, loading: true, progress: 0 }));
    collectFingerprint();
  };

  return { ...state, refresh };
}


