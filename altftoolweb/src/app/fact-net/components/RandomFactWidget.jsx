"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Shuffle, Sparkles, Volume2, VolumeX } from "lucide-react";

export default function RandomFactWidget({ facts = [] }) {
  const pool = useMemo(() => facts.filter((item) => item.fact), [facts]);
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [animate, setAnimate] = useState(false);
  const currentFact = pool[index] || null;

  function handleShuffle() {
    if (pool.length < 2) return;
    setAnimate(true);
    window.setTimeout(() => {
      setIndex((value) => (value + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length);
      setCopied(false);
      setAnimate(false);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
      }
    }, 180);
  }

  async function handleCopy() {
    if (!currentFact) return;
    try {
      await navigator.clipboard.writeText(currentFact.fact);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function handleSpeech() {
    if (!currentFact || !window.speechSynthesis) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentFact.fact);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  if (!currentFact) return null;

  return (
    <section className="fn-random fn-sidebar-card">
      <div className="fn-random-head">
        <span className="fn-kicker">
          <Sparkles className="fn-icon" />
          Random Fact
        </span>
        <span className="fn-chip">{currentFact.categoryPath}</span>
      </div>

      <div className={animate ? "fn-random-shuffle" : ""}>
        <blockquote className="fn-random-fact">{currentFact.fact}</blockquote>
        <cite className="fn-random-meta">{currentFact.title}</cite>
      </div>

      <div className="fn-random-actions">
        <button type="button" onClick={handleCopy} className={`fn-small-action ${copied ? "fn-action-success" : ""}`}>
          {copied ? <Check className="fn-icon" /> : <Copy className="fn-icon" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={handleSpeech}
          className={`fn-small-action ${speaking ? "fn-action-primary" : ""}`}
        >
          {speaking ? <VolumeX className="fn-icon" /> : <Volume2 className="fn-icon" />}
          {speaking ? "Stop" : "Listen"}
        </button>
        <button type="button" onClick={handleShuffle} className="fn-button fn-button-primary">
          <Shuffle className="fn-icon" />
          Show Another
        </button>
      </div>
    </section>
  );
}
