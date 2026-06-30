"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Square,
  Volume2,
  RotateCcw,
} from "lucide-react";
import CustomSelect from "./CustomSelect";

export default function TextToSpeech({ text }) {
  const utteranceRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const handlePlay = () => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const selected = voices.find((voice) => voice.name === selectedVoice);
    if (selected) utterance.voice = selected;
    utterance.rate = rate;
    utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); };
    utterance.onend = () => { setIsPlaying(false); setIsPaused(false); };
    utterance.onerror = () => { setIsPlaying(false); setIsPaused(false); };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleResume = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleRestart = () => {
    handleStop();
    setTimeout(() => handlePlay(), 200);
  };

  const speedOptions = [
    { label: "0.7x", value: "0.7" },
    { label: "1x", value: "1" },
    { label: "1.2x", value: "1.2" },
    { label: "1.5x", value: "1.5" },
    { label: "1.75x", value: "1.75" },
    { label: "2x", value: "2" },
  ];

  return (
    <>
      <div className="hidden md:block sticky bottom-5 mt-10 z-45">
        <div className="wp-tts-player">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="wp-tts-icon-box">
                <Volume2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-(--foreground)">Text To Speech</h3>
                <p className="text-xs text-(--muted-foreground)">Listen to this chapter</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isPlaying && (
                <button onClick={handlePlay} className="wp-tts-btn wp-tts-btn-primary">
                  <Play size={18} fill="white" />
                </button>
              )}
              {isPlaying && !isPaused && (
                <button onClick={handlePause} className="wp-tts-btn wp-tts-btn-primary">
                  <Pause size={18} />
                </button>
              )}
              {isPlaying && isPaused && (
                <button onClick={handleResume} className="wp-tts-btn wp-tts-btn-primary">
                  <Play size={18} fill="white" />
                </button>
              )}
              <button onClick={handleStop} className="wp-tts-btn">
                <Square size={16} />
              </button>
              <button onClick={handleRestart} className="wp-tts-btn">
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="text-xs text-(--muted-foreground) font-medium block mb-1">Speed</label>
                <CustomSelect
                  desktopClass="md:w-[80px]"
                  value={`${rate}x`}
                  onChange={(value) => setRate(Number(value))}
                  options={speedOptions}
                />
              </div>
              <div>
                <label className="text-xs text-(--muted-foreground) font-medium block mb-1">Voice</label>
                <CustomSelect
                  value={selectedVoice}
                  onChange={setSelectedVoice}
                  placeholder="Select Voice"
                  options={voices.map((voice) => ({
                    label: voice.name,
                    value: voice.name,
                  }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden sticky bottom-5 flex justify-start z-45">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-14 h-14 rounded-full bg-(--primary) text-white shadow-lg flex items-center justify-center hover:opacity-90 transition"
        >
          <Volume2 size={24} />
        </button>

        <div
          className={`absolute bottom-16 right-0 w-[320px] max-w-[90vw] transition-all duration-300 ${
            mobileOpen
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 translate-y-4 invisible"
          }`}
        >
          <div className="wp-tts-player">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-(--primary) text-white flex items-center justify-center">
                <Volume2 size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-(--foreground)">Text To Speech</h3>
                <p className="text-xs text-(--muted-foreground)">Listen to chapter</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              {!isPlaying && (
                <button onClick={handlePlay} className="wp-tts-btn wp-tts-btn-primary">
                  <Play size={18} fill="white" />
                </button>
              )}
              {isPlaying && !isPaused && (
                <button onClick={handlePause} className="wp-tts-btn wp-tts-btn-primary">
                  <Pause size={18} />
                </button>
              )}
              {isPlaying && isPaused && (
                <button onClick={handleResume} className="wp-tts-btn wp-tts-btn-primary">
                  <Play size={18} fill="white" />
                </button>
              )}
              <button onClick={handleStop} className="wp-tts-btn">
                <Square size={16} />
              </button>
              <button onClick={handleRestart} className="wp-tts-btn">
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-(--muted-foreground) font-medium block mb-1">Speed</label>
                <CustomSelect
                  desktopClass="w-full"
                  value={`${rate}x`}
                  onChange={(value) => setRate(Number(value))}
                  options={speedOptions}
                />
              </div>
              <div>
                <label className="text-xs text-(--muted-foreground) font-medium block mb-1">Voice</label>
                <CustomSelect
                  desktopClass="w-full"
                  value={selectedVoice}
                  onChange={setSelectedVoice}
                  placeholder="Select Voice"
                  options={voices.map((voice) => ({
                    label: voice.name,
                    value: voice.name,
                  }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
