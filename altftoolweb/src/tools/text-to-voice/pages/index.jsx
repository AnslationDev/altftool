"use client";

import React, { useState, useEffect } from "react";
import { Mic, Pause, Play, Square, Volume2, Gauge, Music } from "lucide-react";
// import HowItWorks from "../components/HowItWorks";
import Header from "../components/Header";
import Description from "../components/Description";
// import FAQSection from "../src/components/FAQs";

/* ----------------- Speech Utils ----------------- */

const getSpeechSynthesis = () =>
  typeof window !== "undefined" && "speechSynthesis" in window
    ? window.speechSynthesis
    : null;

const getVoices = () => {
  const synth = getSpeechSynthesis();
  return synth ? synth.getVoices() : [];
};

const speak = (text, options = {}) => {
  const synth = getSpeechSynthesis();
  if (!synth) {
    alert("Text-to-speech is not supported in your browser.");
    return;
  }

  synth.cancel();

  if (text !== "") {
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    if (options.voice) utterance.voice = options.voice;

    utterance.onend = options.onEnd;
    utterance.onerror = options.onError;
    utterance.onstart = options.onStart;

    synth.speak(utterance);
  }
};

const pauseSpeech = () => {
  const synth = getSpeechSynthesis();
  if (synth && synth.speaking && !synth.paused) synth.pause();
};

const resumeSpeech = () => {
  const synth = getSpeechSynthesis();
  if (synth && synth.paused) synth.resume();
};

const stopSpeech = () => {
  const synth = getSpeechSynthesis();
  if (synth) synth.cancel();
};

/* ------------------------------------------------ */

export default function TextToVoice() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  /* Load Voices */
  useEffect(() => {
    const loadVoices = () => {
      const list = getVoices();
      setVoices(list);
      if (list.length > 0 && !selectedVoice) {
        setSelectedVoice(list[0].name);
      }
    };

    loadVoices();

    const synth = getSpeechSynthesis();
    if (synth) synth.onvoiceschanged = loadVoices;

    return () => stopSpeech();
  }, [selectedVoice]);

  /* Handlers */
  const handleSpeak = () => {
    const voice = voices.find((v) => v.name === selectedVoice);
    speak(text, {
      voice,
      rate,
      pitch,
      volume,
      onStart: () => {
        setIsSpeaking(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onError: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
    });
  };

  const handlePause = () => {
    pauseSpeech();
    setIsPaused(true);
  };

  const handleResume = () => {
    resumeSpeech();
    setIsPaused(false);
  };

  const handleStop = () => {
    stopSpeech();
    setIsSpeaking(false);
    setIsPaused(false);
  };



  return (
    <div className="space-y-6 pb-6 px-5">
      {/* HEADER */}
      <Header />
      {/* BROWSER WARNING */}
      {typeof window !== "undefined" && !window.speechSynthesis && (
        <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center">
          Your browser does not support speech synthesis.
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: TEXT INPUT */}
        <div className="lg:col-span-2 space-y-6">
          {/* TEXT INPUT CARD */}
          <div className="rounded-xl bg-(--card) border border-(--border) shadow p-6">
            <h3 className="flex items-center gap-2 text-(--foreground) font-semibold text-lg mb-4">
              <Mic className="h-5 w-5 text-(--primary)" /> Text Input
            </h3>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to convert to speech..."
              className="w-full min-h-67 rounded-lg bg-(--muted) text-(--foreground) border border-(--border) p-4 resize-none"
            />
          </div>

          {/* MOBILE CONTROLS */}
          <div className="lg:hidden space-y-3 rounded-xl bg-(--card) border border-(--border) shadow p-4">
            {/* Buttons Row */}
            <div className="flex flex-wrap gap-3">
              {/* SPEAK */}
              <button
                onClick={handleSpeak}
                disabled={isSpeaking || !text.trim()}
                className="flex-1 min-w-30 px-4 py-3 cursor-pointer rounded-lg bg-(--primary) text-white font-bold disabled:opacity-40"
              >
                <Play className="w-4 h-4 inline mr-2" />
                Speak
              </button>

              {/* PAUSE */}
              <button
                onClick={handlePause}
                disabled={!isSpeaking || isPaused}
                className="flex-1 min-w-30 px-4 py-3 cursor-pointer rounded-lg bg-(--muted) text-(--foreground) disabled:opacity-40"
              >
                <Pause className="w-4 h-4 inline mr-2" />
                Pause
              </button>

              {/* RESUME */}
              <button
                onClick={handleResume}
                disabled={!isSpeaking || !isPaused}
                className="flex-1 min-w-30 px-4 py-3 cursor-pointer rounded-lg bg-(--muted) text-(--foreground) disabled:opacity-40"
              >
                <Play className="w-4 h-4 inline mr-2" />
                Resume
              </button>

              {/* STOP */}
              <button
                onClick={handleStop}
                disabled={!isSpeaking}
                className="flex-1 min-w-30 px-4 py-3 cursor-pointer rounded-lg bg-red-500 text-white font-bold disabled:opacity-40"
              >
                <Square className="w-4 h-4 inline mr-2" />
                Stop
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: SETTINGS */}
        <div className="space-y-6">
          {/* VOICE SETTINGS */}
          <div className="rounded-xl bg-(--card) border border-(--border) shadow p-6">
            <h3 className="flex items-center gap-2 text-(--foreground) font-semibold text-lg mb-4">
              <Music className="w-5 h-5 text-(--primary)" />
              Voice Settings
            </h3>

            {/* Voice Select */}
            <div className="space-y-2 mb-6">
              <label className="text-(--foreground)">Voice</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-3 py-2 bg-(--muted) border border-(--border) rounded-lg text-(--foreground)"
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Sliders */}

            {/* RATE */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-bold text-(--foreground)">
                <Gauge className="h-4 w-4" /> Speed: {rate.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            {/* PITCH */}
            <div className="space-y-2 mt-4">
              <label className="text-(--foreground) font-bold">
                Pitch: {pitch.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            {/* VOLUME */}
            <div className="space-y-2 mt-4">
              <label className="flex items-center gap-2 font-bold text-(--foreground)">
                <Volume2 className="h-4 w-4" /> Volume: {volume.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>
          </div>

          {/* DESKTOP CONTROLS */}
          <div className="hidden lg:block rounded-xl bg-(--card) border border-(--border) shadow p-6">
            <div className="flex flex-wrap gap-3">
              {/* SPEAK */}
              <button
                onClick={handleSpeak}
                disabled={isSpeaking || !text.trim()}
                className="flex-1 min-w-30 cursor-pointer px-4 py-3 rounded-lg bg-(--primary) text-white font-bold disabled:opacity-40"
              >
                <Play className="w-4 h-4 inline mr-2" />
                Speak
              </button>

              {/* PAUSE */}
              <button
                onClick={handlePause}
                disabled={!isSpeaking || isPaused}
                className="flex-1 min-w-30 px-4 py-3 cursor-pointer rounded-lg bg-(--muted) text-(--foreground) disabled:opacity-40"
              >
                <Pause className="w-4 h-4 inline mr-2" />
                Pause
              </button>

              {/* RESUME */}
              <button
                onClick={handleResume}
                disabled={!isSpeaking || !isPaused}
                className="flex-1 min-w-30 px-4 py-3 cursor-pointer rounded-lg bg-(--muted) text-(--foreground) disabled:opacity-40"
              >
                <Play className="w-4 h-4 inline mr-2" />
                Resume
              </button>

              {/* STOP */}
              <button
                onClick={handleStop}
                disabled={!isSpeaking}
                className="flex-1 min-w-30 cursor-pointer px-4 py-3 rounded-lg bg-red-500 text-white font-bold disabled:opacity-40"
              >
                <Square className="w-4 h-4 inline mr-2" />
                Stop
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: <Gauge className="w-6 h-6 text-(--primary)" />,
            title: "Customizable",
            text: "Adjust speed, pitch and volume",
          },
          {
            icon: <Music className="w-6 h-6 text-(--primary)" />,
            title: "Multiple Voices",
            text: "Choose from different voices",
          },
          {
            icon: <Mic className="w-6 h-6 text-(--primary)" />,
            title: "Accessible",
            text: "Great for accessibility tools",
          },
        ].map((f, i) => (
          <div
            key={i}
            className="rounded-xl bg-(--card) border border-(--border) shadow p-6 text-center"
          >
            <div className="w-12 h-12 bg-(--primary)/20 rounded-full flex items-center justify-center mx-auto mb-4">
              {f.icon}
            </div>
            <h3 className="font-bold text-(--foreground) mb-1">{f.title}</h3>
            <p className="text-(--muted-foreground) text-sm">{f.text}</p>
          </div>
        ))}
      </div>
   <Description/>
      {/* INFO SECTIONS */}
      {/* <div className="rounded-xl bg-(--card) border border-(--border) shadow p-6">
        <HowItWorks />
      </div> */}

      {/* <div className="rounded-xl bg-(--card) border border-(--border) shadow p-6">
        <FAQSection />
      </div> */}
    </div>
  );
}
