"use client";
import React, { useState, useEffect, useRef } from "react";

import Header from "../components/Header";
import Gauge from "../components/Gauge";
import NeonCanvas from "../components/NeonCanvas";
import Spectrum from "../components/Spectrum";
import HistoryGraph from "../components/HistoryGraph";

import ControlPanel from "../components/ControlPanel";

import { getNoiseLevel } from "../utils/useNoiseLevel";
import Features from "../components/Features";

export default function SoundDecibelChecker() {
  const [isListening, setIsListening] = useState(false);
  const [decibels, setDecibels] = useState(0);
  const [permission, setPermission] = useState(null);
  const [history, setHistory] = useState([]);
  const [frequencyData, setFrequencyData] = useState(new Array(64).fill(0));

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const streamRef = useRef(null); // ✅ ADD THIS - separate ref for stream
  const animationRef = useRef(null);
  const canvasRef = useRef(null);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermission(true);

      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;
      streamRef.current = stream; // ✅ FIXED - store stream separately

      setIsListening(true);
      setHistory([]);
      measure();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setPermission(false);
    }
  };

  const stopListening = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }

    if (streamRef.current) {
      // ✅ FIXED - use streamRef
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsListening(false);
    setDecibels(0);
    setFrequencyData(new Array(64).fill(0));
  };

  const measure = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyserRef.current.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / bufferLength);

    const db = Math.max(
      0,
      Math.min(120, Math.round(20 * Math.log10(rms) + 100)),
    );

    setDecibels(db);
    setHistory((prev) => [...prev, db].slice(-50));

    const freqDataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(freqDataArray);

    const newFreq = new Array(64).fill(0);
    for (let i = 0; i < 64; i++) {
      newFreq[i] = freqDataArray[i * 4] || 0;
    }
    setFrequencyData(newFreq);

    animationRef.current = requestAnimationFrame(measure);
  };

  useEffect(() => {
    if (!isListening || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const barWidth = width / frequencyData.length;

    frequencyData.forEach((value, index) => {
      const barHeight = (value / 255) * height * 0.8;
      const x = index * barWidth;
      const y = height - barHeight;

      const hue = (index / frequencyData.length) * 360;
      ctx.shadowBlur = 20;
      ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;

      const gradient = ctx.createLinearGradient(x, y, x, height);
      gradient.addColorStop(0, `hsl(${hue}, 100%, 60%)`);
      gradient.addColorStop(1, `hsl(${hue}, 100%, 40%)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 2, barHeight);
    });
  }, [frequencyData, isListening]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (microphoneRef.current) {
        microphoneRef.current.disconnect();
      }
      if (streamRef.current) {
        // ✅ FIXED - use streamRef
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const level = getNoiseLevel(decibels);

  return (
    <div className="min-h-screen p-4 overflow-auto bg-(--background) text-(--foreground) transition-colors">
      <div className="mx-auto max-w-6xl py-8">
        <Header />

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Gauge decibels={decibels} level={level} />
          <NeonCanvas canvasRef={canvasRef} />
        </div>

        <Spectrum frequencyData={frequencyData} />
        <HistoryGraph history={history} />

        <ControlPanel
          isListening={isListening}
          startListening={startListening}
          stopListening={stopListening}
          permission={permission}
        />

        <Features/>
      </div>
    </div>
  );
}
