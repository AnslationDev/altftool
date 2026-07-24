"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Captions,
  Check,
  Copy,
  Download,
  Eye,
  FileText,
  Keyboard,
  Mic,
  Pause,
  Play,
  Printer,
  RotateCcw,
  ScanLine,
  Speech,
  Square,
  Volume2,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const card =
  "rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]";
const input =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)]";
const primaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50";

const TOOL_META = {
  "adjustable-reading-reformatter": {
    title: "Adjustable Reading Reformatter",
    description:
      "Tune text size, spacing, line width, contrast, and alignment locally for a more comfortable reading view.",
    icon: Eye,
  },
  "bionic-reading-converter": {
    title: "Bionic Reading Converter",
    description:
      "Emphasize the beginning of each word to create an optional visual reading aid without changing the original text.",
    icon: FileText,
  },
  "live-caption-overlay": {
    title: "Live Caption Overlay",
    description:
      "Use the browser speech-recognition engine to display adjustable live captions; audio stays under the browser engine's controls.",
    icon: Captions,
  },
  "low-vision-camera-magnifier": {
    title: "Low-Vision Camera Magnifier",
    description:
      "Magnify a live camera view with zoom, contrast, grayscale, and inversion controls.",
    icon: Camera,
  },
  "dwell-click-keyboard": {
    title: "Dwell-Click Keyboard",
    description:
      "Type by holding the pointer over large keys for a configurable dwell duration—no click required.",
    icon: Keyboard,
  },
  "switch-scanning-communicator": {
    title: "Switch-Scanning Communicator",
    description:
      "Cycle through phrases automatically and select the highlighted phrase with Space, Enter, or a large on-screen switch.",
    icon: ScanLine,
  },
  "aac-phrase-board": {
    title: "AAC Phrase Board",
    description:
      "Tap large phrase tiles to speak common requests, with a private custom phrase field.",
    icon: Speech,
  },
  "high-contrast-document-recolor": {
    title: "High-Contrast Document Recolor",
    description:
      "Preview and export an uploaded page image with adjustable contrast, grayscale, brightness, and inversion.",
    icon: Eye,
  },
  "slow-speech-playback-trainer": {
    title: "Slow Speech Playback Trainer",
    description:
      "Play a local audio file more slowly, preserve pitch where supported, and loop difficult segments.",
    icon: Volume2,
  },
  "lip-read-practice-mirror": {
    title: "Lip-Read Practice Mirror",
    description:
      "Use a mirrored, zoomable camera view and short local recordings for slow-motion lip-reading practice.",
    icon: Camera,
  },
  "big-button-medical-info-card": {
    title: "Big-Button Medical Info Card",
    description:
      "Create a large-text, printable emergency information card with medicines, allergies, conditions, and contacts.",
    icon: FileText,
  },
  "braille-embosser-sheet-maker": {
    title: "Braille Embosser Sheet Maker",
    description:
      "Convert basic Latin text to Grade-1 Unicode Braille and download a BRF-style ASCII draft for review.",
    icon: FileText,
  },
  "focus-reading-mask": {
    title: "Focus Reading Mask",
    description:
      "Highlight one line at a time and dim surrounding text, with keyboard-friendly previous/next controls.",
    icon: Eye,
  },
  "one-handed-keyboard-trainer": {
    title: "One-Handed Keyboard Trainer",
    description:
      "Practice short typing prompts with left- or right-hand key groups and receive speed and accuracy feedback.",
    icon: Keyboard,
  },
  "voice-steadiness-visualizer": {
    title: "Voice Steadiness Visualizer",
    description:
      "Show non-diagnostic microphone volume and estimated pitch consistency without uploading recordings.",
    icon: Mic,
  },
};

export default function AssistiveTool({ slug }) {
  const meta = TOOL_META[slug] || TOOL_META["adjustable-reading-reformatter"];
  const Icon = meta.icon;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className={card}>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Icon className="h-4 w-4" aria-hidden="true" />
            Assistive reading &amp; communication
          </div>
          <h1 className="text-3xl font-semibold leading-tight">{meta.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
            {meta.description}
          </p>
        </section>

        <div className="mt-4">
          <ToolWorkspace slug={slug} />
        </div>

        <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
          This browser-based aid is not a medical device, diagnosis, emergency
          service, or substitute for individualized accessibility support.
          Camera, microphone, speech, and file features run only after your
          explicit action and depend on browser/device support.
        </p>
      </div>
    </main>
  );
}

function ToolWorkspace({ slug }) {
  switch (slug) {
    case "adjustable-reading-reformatter":
      return <ReadingReformatter />;
    case "bionic-reading-converter":
      return <BionicReading />;
    case "live-caption-overlay":
      return <LiveCaptions />;
    case "low-vision-camera-magnifier":
      return <CameraMagnifier />;
    case "dwell-click-keyboard":
      return <DwellKeyboard />;
    case "switch-scanning-communicator":
      return <SwitchCommunicator />;
    case "aac-phrase-board":
      return <AacBoard />;
    case "high-contrast-document-recolor":
      return <DocumentRecolor />;
    case "slow-speech-playback-trainer":
      return <AudioTrainer />;
    case "lip-read-practice-mirror":
      return <LipReadMirror />;
    case "big-button-medical-info-card":
      return <MedicalCard />;
    case "braille-embosser-sheet-maker":
      return <BrailleMaker />;
    case "focus-reading-mask":
      return <FocusMask />;
    case "one-handed-keyboard-trainer":
      return <OneHandTrainer />;
    case "voice-steadiness-visualizer":
      return <VoiceSteadiness />;
    default:
      return null;
  }
}

function WorkspaceGrid({ controls, preview }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className={card}>{controls}</div>
      <div className={card}>{preview}</div>
    </section>
  );
}

function FieldLabel({ children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-semibold text-[var(--foreground)]"
    >
      {children}
    </label>
  );
}

function ReadingReformatter() {
  const [text, setText] = useState(
    "Reading should adapt to the reader. Paste text here, then tune the controls until the page feels comfortable.",
  );
  const [size, setSize] = useState(22);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [letterSpacing, setLetterSpacing] = useState(0.02);
  const [width, setWidth] = useState(64);
  const [align, setAlign] = useState("left");

  return (
    <WorkspaceGrid
      controls={
        <div className="grid gap-4">
          <FieldLabel htmlFor="reading-text">Reading text</FieldLabel>
          <textarea
            id="reading-text"
            className={`${input} min-h-52`}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <RangeControl
            label={`Font size · ${size}px`}
            min={14}
            max={42}
            step={1}
            value={size}
            onChange={setSize}
          />
          <RangeControl
            label={`Line height · ${lineHeight.toFixed(1)}`}
            min={1.2}
            max={2.4}
            step={0.1}
            value={lineHeight}
            onChange={setLineHeight}
          />
          <RangeControl
            label={`Letter spacing · ${letterSpacing.toFixed(2)}em`}
            min={0}
            max={0.18}
            step={0.01}
            value={letterSpacing}
            onChange={setLetterSpacing}
          />
          <RangeControl
            label={`Line width · ${width}ch`}
            min={32}
            max={90}
            step={2}
            value={width}
            onChange={setWidth}
          />
          <FieldLabel htmlFor="reading-align">Alignment</FieldLabel>
          <select
            id="reading-align"
            className={input}
            value={align}
            onChange={(event) => setAlign(event.target.value)}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="justify">Justified</option>
          </select>
        </div>
      }
      preview={
        <>
          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            Reading preview
          </p>
          <div className="mt-4 overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-5">
            <p
              style={{
                fontSize: `${size}px`,
                lineHeight,
                letterSpacing: `${letterSpacing}em`,
                maxWidth: `${width}ch`,
                textAlign: align,
              }}
              className="mx-auto whitespace-pre-wrap"
            >
              {text || "Add text to preview it."}
            </p>
          </div>
        </>
      }
    />
  );
}

function RangeControl({ label, min, max, step, value, onChange }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-[var(--primary)]"
      />
    </label>
  );
}

function BionicReading() {
  const [text, setText] = useState(
    "Bionic emphasis is optional. Compare the output with the original and use whichever view feels easier.",
  );
  const [ratio, setRatio] = useState(0.45);
  const words = useMemo(() => text.split(/(\s+)/), [text]);

  return (
    <WorkspaceGrid
      controls={
        <div className="grid gap-4">
          <FieldLabel htmlFor="bionic-text">Source text</FieldLabel>
          <textarea
            id="bionic-text"
            className={`${input} min-h-64`}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <RangeControl
            label={`Emphasized prefix · ${Math.round(ratio * 100)}%`}
            min={0.25}
            max={0.75}
            step={0.05}
            value={ratio}
            onChange={setRatio}
          />
          <CopyButton text={text} />
        </div>
      }
      preview={
        <>
          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            Emphasized preview
          </p>
          <p className="mt-4 whitespace-pre-wrap text-lg leading-8">
            {words.map((token, index) => {
              if (/^\s+$/.test(token)) return token;
              const count = Math.max(1, Math.ceil(token.length * ratio));
              return (
                <span key={`${index}-${token}`}>
                  <strong>{token.slice(0, count)}</strong>
                  {token.slice(count)}
                </span>
              );
            })}
          </p>
        </>
      }
    />
  );
}

function LiveCaptions() {
  const recognitionRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [supported, setSupported] = useState(true);
  const [language, setLanguage] = useState("en-IN");
  const [fontSize, setFontSize] = useState(30);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");

  const stop = useCallback(() => {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    setRunning(false);
    setInterim("");
  }, []);

  useEffect(() => () => recognitionRef.current?.stop?.(), []);

  const start = () => {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setSupported(false);
      return;
    }
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.onresult = (event) => {
      let nextFinal = "";
      let nextInterim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript || "";
        if (event.results[index].isFinal) nextFinal += transcript;
        else nextInterim += transcript;
      }
      if (nextFinal) setFinalText((current) => `${current} ${nextFinal}`.trim());
      setInterim(nextInterim);
    };
    recognition.onerror = () => setRunning(false);
    recognition.onend = () => setRunning(false);
    recognition.start();
    recognitionRef.current = recognition;
    setSupported(true);
    setRunning(true);
  };

  return (
    <WorkspaceGrid
      controls={
        <div className="grid gap-4">
          <FieldLabel htmlFor="caption-language">Recognition language</FieldLabel>
          <select
            id="caption-language"
            className={input}
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            disabled={running}
          >
            <option value="en-IN">English (India)</option>
            <option value="hi-IN">Hindi (India)</option>
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
          </select>
          <RangeControl
            label={`Caption size · ${fontSize}px`}
            min={18}
            max={54}
            step={2}
            value={fontSize}
            onChange={setFontSize}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={primaryButton}
              onClick={running ? stop : start}
            >
              {running ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {running ? "Stop captions" : "Start captions"}
            </button>
            <button
              type="button"
              className={secondaryButton}
              onClick={() => {
                setFinalText("");
                setInterim("");
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </button>
          </div>
          {!supported ? (
            <p className="text-sm text-[var(--destructive)]">
              This browser does not expose the Web Speech Recognition API.
            </p>
          ) : null}
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">
            Recognition behavior and network use are controlled by your browser
            or operating system. Do not use it for confidential speech unless
            you understand that engine.
          </p>
        </div>
      }
      preview={
        <div
          aria-live="polite"
          className="min-h-72 rounded-md border border-[var(--border)] bg-[var(--foreground)] p-6 text-[var(--background)]"
          style={{ fontSize: `${fontSize}px` }}
        >
          <p className="leading-snug">
            {finalText || interim
              ? `${finalText} ${interim}`.trim()
              : "Captions appear here after you start and grant microphone permission."}
          </p>
        </div>
      }
    />
  );
}

function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");

  const stop = useCallback(() => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera capture is not supported in this browser.");
      return;
    }
    try {
      stop();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setError("");
      setActive(true);
    } catch (cameraError) {
      setError(cameraError?.message || "Camera permission was not available.");
    }
  }, [stop]);

  useEffect(() => stop, [stop]);
  return { videoRef, streamRef, active, error, start, stop };
}

function CameraMagnifier() {
  const { videoRef, active, error, start, stop } = useCamera();
  const [zoom, setZoom] = useState(1.5);
  const [contrast, setContrast] = useState(1.2);
  const [invert, setInvert] = useState(false);
  const [grayscale, setGrayscale] = useState(false);

  return (
    <WorkspaceGrid
      controls={
        <div className="grid gap-4">
          <button
            type="button"
            className={active ? secondaryButton : primaryButton}
            onClick={active ? stop : start}
          >
            <Camera className="h-4 w-4" />
            {active ? "Stop camera" : "Start camera"}
          </button>
          <RangeControl
            label={`Zoom · ${zoom.toFixed(1)}×`}
            min={1}
            max={5}
            step={0.1}
            value={zoom}
            onChange={setZoom}
          />
          <RangeControl
            label={`Contrast · ${contrast.toFixed(1)}×`}
            min={0.7}
            max={3}
            step={0.1}
            value={contrast}
            onChange={setContrast}
          />
          <Toggle
            label="Invert colors"
            checked={invert}
            onChange={setInvert}
          />
          <Toggle
            label="Grayscale"
            checked={grayscale}
            onChange={setGrayscale}
          />
          {error ? (
            <p className="text-sm text-[var(--destructive)]">{error}</p>
          ) : null}
        </div>
      }
      preview={
        <div className="relative min-h-80 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--muted)]">
          <video
            ref={videoRef}
            muted
            playsInline
            className="h-full min-h-80 w-full object-cover"
            style={{
              transform: `scale(${zoom})`,
              filter: `contrast(${contrast}) invert(${invert ? 1 : 0}) grayscale(${grayscale ? 1 : 0})`,
            }}
          />
          {!active ? (
            <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-[var(--muted-foreground)]">
              Start the camera to magnify a nearby page or object.
            </p>
          ) : null}
        </div>
      }
    />
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 text-sm font-semibold">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--primary)]"
      />
      {label}
    </label>
  );
}

const KEY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
  ["Space", "Delete", "Clear", "Speak"],
];

function DwellKeyboard() {
  const [text, setText] = useState("");
  const [duration, setDuration] = useState(1000);
  const timerRef = useRef(null);
  const [dwelling, setDwelling] = useState("");

  const activate = useCallback((key) => {
    if (key === "Space") setText((current) => `${current} `);
    else if (key === "Delete") setText((current) => current.slice(0, -1));
    else if (key === "Clear") setText("");
    else if (key === "Speak") speak(text);
    else setText((current) => current + key.toLowerCase());
  }, [text]);

  const enter = (key) => {
    clearTimeout(timerRef.current);
    setDwelling(key);
    timerRef.current = setTimeout(() => {
      activate(key);
      setDwelling("");
    }, duration);
  };
  const leave = () => {
    clearTimeout(timerRef.current);
    setDwelling("");
  };
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <section className={card}>
      <div className="grid gap-4">
        <RangeControl
          label={`Dwell duration · ${duration} ms`}
          min={400}
          max={3000}
          step={100}
          value={duration}
          onChange={setDuration}
        />
        <textarea
          className={`${input} min-h-28 text-xl`}
          aria-label="Dwell keyboard text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Dwell over keys to type…"
        />
        <div className="grid gap-2" onPointerLeave={leave}>
          {KEY_ROWS.map((row) => (
            <div key={row.join("-")} className="flex flex-wrap justify-center gap-2">
              {row.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`${secondaryButton} relative min-w-12 overflow-hidden ${
                    dwelling === key ? "border-[var(--primary)] text-[var(--primary)]" : ""
                  }`}
                  onPointerEnter={() => enter(key)}
                  onPointerLeave={leave}
                  onFocus={() => enter(key)}
                  onBlur={leave}
                  onClick={() => activate(key)}
                >
                  {key}
                  {dwelling === key ? (
                    <span
                      className="absolute inset-x-0 bottom-0 h-1 origin-left animate-pulse bg-[var(--primary)]"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const DEFAULT_PHRASES = [
  "Yes",
  "No",
  "Please wait",
  "I need help",
  "I need water",
  "I am uncomfortable",
  "Please call my contact",
  "Thank you",
];

function SwitchCommunicator() {
  const [phrasesText, setPhrasesText] = useState(DEFAULT_PHRASES.join("\n"));
  const phrases = useMemo(
    () => phrasesText.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
    [phrasesText],
  );
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [intervalMs, setIntervalMs] = useState(1500);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (!running || !phrases.length) return undefined;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % phrases.length),
      intervalMs,
    );
    return () => window.clearInterval(timer);
  }, [running, intervalMs, phrases.length]);

  const choose = useCallback(() => {
    const phrase = phrases[index] || "";
    if (!phrase) return;
    setSelected(phrase);
    speak(phrase);
  }, [phrases, index]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code !== "Space" && event.code !== "Enter") return;
      event.preventDefault();
      choose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [choose]);

  return (
    <WorkspaceGrid
      controls={
        <div className="grid gap-4">
          <FieldLabel htmlFor="switch-phrases">Phrases, one per line</FieldLabel>
          <textarea
            id="switch-phrases"
            className={`${input} min-h-52`}
            value={phrasesText}
            onChange={(event) => {
              setPhrasesText(event.target.value);
              setIndex(0);
            }}
          />
          <RangeControl
            label={`Scan interval · ${intervalMs} ms`}
            min={600}
            max={4000}
            step={100}
            value={intervalMs}
            onChange={setIntervalMs}
          />
          <button
            type="button"
            className={primaryButton}
            onClick={() => setRunning((current) => !current)}
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Pause scanning" : "Start scanning"}
          </button>
        </div>
      }
      preview={
        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {phrases.map((phrase, phraseIndex) => (
              <div
                key={phrase}
                className={`rounded-md border p-4 text-lg font-semibold ${
                  phraseIndex === index
                    ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                {phrase}
              </div>
            ))}
          </div>
          <button
            type="button"
            className={`${primaryButton} min-h-20 text-xl`}
            onClick={choose}
          >
            Select highlighted phrase
          </button>
          <p aria-live="polite" className="text-center text-lg font-semibold">
            {selected ? `Selected: ${selected}` : "Press Space or Enter to select"}
          </p>
        </div>
      }
    />
  );
}

function AacBoard() {
  const [phrases, setPhrases] = useState(DEFAULT_PHRASES);
  const [custom, setCustom] = useState("");
  const [last, setLast] = useState("");

  const select = (phrase) => {
    setLast(phrase);
    speak(phrase);
  };
  const add = () => {
    const phrase = custom.trim();
    if (!phrase || phrases.includes(phrase)) return;
    setPhrases((current) => [...current, phrase].slice(0, 24));
    setCustom("");
  };

  return (
    <section className={card}>
      <div className="flex flex-wrap gap-2">
        <input
          className={`${input} min-w-60 flex-1`}
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") add();
          }}
          placeholder="Add a private phrase"
          aria-label="Custom phrase"
        />
        <button type="button" className={primaryButton} onClick={add}>
          Add phrase
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {phrases.map((phrase) => (
          <button
            key={phrase}
            type="button"
            className={`${secondaryButton} min-h-24 text-lg`}
            onClick={() => select(phrase)}
          >
            <Volume2 className="h-5 w-5" />
            {phrase}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="mt-4 text-center text-lg font-semibold">
        {last ? `Spoken: ${last}` : "Tap a phrase to speak it"}
      </p>
    </section>
  );
}

function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

function useObjectUrl() {
  const [url, setUrl] = useState("");
  const update = useCallback((file) => {
    setUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : "";
    });
  }, []);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return [url, update];
}

function DocumentRecolor() {
  const [url, setFile] = useObjectUrl();
  const imageRef = useRef(null);
  const [contrast, setContrast] = useState(1.8);
  const [brightness, setBrightness] = useState(1);
  const [invert, setInvert] = useState(false);
  const [grayscale, setGrayscale] = useState(true);

  const filter = `contrast(${contrast}) brightness(${brightness}) invert(${invert ? 1 : 0}) grayscale(${grayscale ? 1 : 0})`;
  const download = () => {
    const image = imageRef.current;
    if (!image?.naturalWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    context.filter = filter;
    context.drawImage(image, 0, 0);
    const link = document.createElement("a");
    link.download = "high-contrast-page.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <WorkspaceGrid
      controls={
        <div className="grid gap-4">
          <FieldLabel htmlFor="recolor-file">Page image</FieldLabel>
          <input
            id="recolor-file"
            type="file"
            accept="image/*"
            className={input}
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <RangeControl
            label={`Contrast · ${contrast.toFixed(1)}×`}
            min={0.5}
            max={4}
            step={0.1}
            value={contrast}
            onChange={setContrast}
          />
          <RangeControl
            label={`Brightness · ${brightness.toFixed(1)}×`}
            min={0.5}
            max={2}
            step={0.1}
            value={brightness}
            onChange={setBrightness}
          />
          <Toggle label="Invert" checked={invert} onChange={setInvert} />
          <Toggle label="Grayscale" checked={grayscale} onChange={setGrayscale} />
          <button
            type="button"
            className={primaryButton}
            onClick={download}
            disabled={!url}
          >
            <Download className="h-4 w-4" />
            Export PNG
          </button>
        </div>
      }
      preview={
        <div className="grid min-h-80 place-items-center overflow-auto rounded-md border border-[var(--border)] bg-[var(--muted)] p-4">
          {url ? (
            // A user-selected local object URL does not need Next image handling.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imageRef}
              src={url}
              alt="Recolored local page preview"
              style={{ filter }}
              className="max-h-[70vh] max-w-full"
            />
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              Choose a page image to preview it.
            </p>
          )}
        </div>
      }
    />
  );
}

function AudioTrainer() {
  const [url, setFile] = useObjectUrl();
  const audioRef = useRef(null);
  const [rate, setRate] = useState(0.75);
  const [loop, setLoop] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    audio.preservesPitch = true;
    audio.loop = loop;
  }, [rate, loop, url]);

  return (
    <section className={card}>
      <div className="grid gap-4">
        <FieldLabel htmlFor="speech-audio">Local audio file</FieldLabel>
        <input
          id="speech-audio"
          type="file"
          accept="audio/*"
          className={input}
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
        <RangeControl
          label={`Playback speed · ${rate.toFixed(2)}×`}
          min={0.35}
          max={1.25}
          step={0.05}
          value={rate}
          onChange={setRate}
        />
        <Toggle label="Loop the file" checked={loop} onChange={setLoop} />
        <audio ref={audioRef} src={url || undefined} controls className="w-full" />
        <p className="text-xs text-[var(--muted-foreground)]">
          Pitch preservation depends on browser support. Use the player&apos;s
          seek control to repeat a short segment.
        </p>
      </div>
    </section>
  );
}

function LipReadMirror() {
  const {
    videoRef,
    streamRef,
    active,
    error,
    start,
    stop,
  } = useCamera();
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [zoom, setZoom] = useState(1.6);
  const [rate, setRate] = useState(0.6);

  useEffect(
    () => () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    },
    [recordedUrl],
  );

  const beginRecording = () => {
    const stream = streamRef.current;
    if (!stream || typeof MediaRecorder === "undefined") return;
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || "video/webm",
      });
      setRecordedUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(blob);
      });
      setRecording(false);
    };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  };

  return (
    <WorkspaceGrid
      controls={
        <div className="grid gap-4">
          <button
            type="button"
            className={active ? secondaryButton : primaryButton}
            onClick={active ? stop : start}
          >
            <Camera className="h-4 w-4" />
            {active ? "Stop camera" : "Start camera"}
          </button>
          <RangeControl
            label={`Mouth-area zoom · ${zoom.toFixed(1)}×`}
            min={1}
            max={4}
            step={0.1}
            value={zoom}
            onChange={setZoom}
          />
          <button
            type="button"
            className={recording ? secondaryButton : primaryButton}
            onClick={
              recording
                ? () => recorderRef.current?.stop()
                : beginRecording
            }
            disabled={!active}
          >
            {recording ? <Square className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            {recording ? "Stop recording" : "Record short practice"}
          </button>
          <RangeControl
            label={`Replay speed · ${rate.toFixed(2)}×`}
            min={0.35}
            max={1}
            step={0.05}
            value={rate}
            onChange={setRate}
          />
          {error ? (
            <p className="text-sm text-[var(--destructive)]">{error}</p>
          ) : null}
        </div>
      }
      preview={
        <div className="grid gap-4">
          <div className="relative min-h-72 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--muted)]">
            <video
              ref={videoRef}
              muted
              playsInline
              className="h-full min-h-72 w-full object-cover"
              style={{ transform: `scaleX(-1) scale(${zoom})` }}
            />
          </div>
          {recordedUrl ? (
            <video
              src={recordedUrl}
              controls
              playsInline
              className="w-full rounded-md border border-[var(--border)]"
              onLoadedMetadata={(event) => {
                event.currentTarget.playbackRate = rate;
                event.currentTarget.preservesPitch = true;
              }}
              onRateChange={(event) => {
                if (Math.abs(event.currentTarget.playbackRate - rate) > 0.01) {
                  event.currentTarget.playbackRate = rate;
                }
              }}
            />
          ) : null}
        </div>
      }
    />
  );
}

function MedicalCard() {
  const [data, setData] = useState({
    name: "Name",
    conditions: "Important conditions",
    medicines: "Current medicines and doses",
    allergies: "Allergies",
    contact: "Emergency contact and phone",
    clinician: "Clinician / care team",
  });
  const set = (key, value) => setData((current) => ({ ...current, [key]: value }));
  const text = `MEDICAL INFORMATION\nName: ${data.name}\nConditions: ${data.conditions}\nMedicines: ${data.medicines}\nAllergies: ${data.allergies}\nEmergency contact: ${data.contact}\nClinician: ${data.clinician}`;

  return (
    <WorkspaceGrid
      controls={
        <div className="grid gap-3">
          {Object.entries(data).map(([key, value]) => (
            <label key={key} className="grid gap-1 text-sm font-semibold">
              {key[0].toUpperCase() + key.slice(1)}
              <textarea
                className={input}
                value={value}
                onChange={(event) => set(key, event.target.value)}
              />
            </label>
          ))}
          <div className="flex flex-wrap gap-2">
            <CopyButton text={text} />
            <button
              type="button"
              className={secondaryButton}
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>
      }
      preview={
        <article className="rounded-md border-2 border-[var(--foreground)] bg-[var(--background)] p-6 text-xl leading-relaxed">
          <h2 className="text-3xl font-bold">Medical information</h2>
          {Object.entries(data).map(([key, value]) => (
            <section key={key} className="mt-4">
              <h3 className="text-sm font-bold uppercase text-[var(--muted-foreground)]">
                {key}
              </h3>
              <p className="whitespace-pre-wrap font-semibold">{value || "—"}</p>
            </section>
          ))}
        </article>
      }
    />
  );
}

const BRAILLE = {
  a: "⠁", b: "⠃", c: "⠉", d: "⠙", e: "⠑", f: "⠋", g: "⠛", h: "⠓",
  i: "⠊", j: "⠚", k: "⠅", l: "⠇", m: "⠍", n: "⠝", o: "⠕", p: "⠏",
  q: "⠟", r: "⠗", s: "⠎", t: "⠞", u: "⠥", v: "⠧", w: "⠺", x: "⠭",
  y: "⠽", z: "⠵", " ": " ", ".": "⠲", ",": "⠂", "?": "⠦", "!": "⠖",
  "-": "⠤", "'": "⠄",
};
const BRF = {
  a: "A", b: "B", c: "C", d: "D", e: "E", f: "F", g: "G", h: "H",
  i: "I", j: "J", k: "K", l: "L", m: "M", n: "N", o: "O", p: "P",
  q: "Q", r: "R", s: "S", t: "T", u: "U", v: "V", w: "W", x: "X",
  y: "Y", z: "Z", " ": " ", ".": "4", ",": "1", "?": "8", "!": "6",
  "-": "-", "'": "'",
};

function BrailleMaker() {
  const [text, setText] = useState("Braille is read by touch.");
  const [columns, setColumns] = useState(32);
  const braille = useMemo(() => toBraille(text, columns, BRAILLE), [text, columns]);
  const brf = useMemo(() => toBraille(text, columns, BRF), [text, columns]);

  const download = () => {
    const blob = new Blob([brf], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "braille-draft.brf";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <WorkspaceGrid
      controls={
        <div className="grid gap-4">
          <FieldLabel htmlFor="braille-text">Latin source text</FieldLabel>
          <textarea
            id="braille-text"
            className={`${input} min-h-56`}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <RangeControl
            label={`Cells per line · ${columns}`}
            min={20}
            max={42}
            step={1}
            value={columns}
            onChange={setColumns}
          />
          <button type="button" className={primaryButton} onClick={download}>
            <Download className="h-4 w-4" />
            Download BRF draft
          </button>
        </div>
      }
      preview={
        <div className="grid gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
              Unicode Braille preview
            </p>
            <pre className="mt-2 whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-2xl leading-relaxed">
              {braille}
            </pre>
          </div>
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">
            Grade-1 draft only. Numbers, capitalization, contractions,
            language rules, page dimensions, and the target embosser&apos;s BRF
            profile require review by a competent Braille user/transcriber.
          </p>
        </div>
      }
    />
  );
}

function toBraille(text, columns, map) {
  const converted = [...text.toLowerCase()]
    .map((character) => map[character] ?? "⍰")
    .join("");
  const lines = [];
  for (let index = 0; index < converted.length; index += columns) {
    lines.push(converted.slice(index, index + columns));
  }
  return lines.join("\n");
}

function FocusMask() {
  const [text, setText] = useState(
    "Focus on one line at a time.\nUse the previous and next buttons.\nThe surrounding lines remain available but visually quieter.\nYou can also edit the source text.",
  );
  const lines = useMemo(() => text.split(/\r?\n/), [text]);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (index >= lines.length) setIndex(Math.max(0, lines.length - 1));
  }, [index, lines.length]);

  return (
    <WorkspaceGrid
      controls={
        <div className="grid gap-4">
          <FieldLabel htmlFor="focus-text">Text, one focus line per row</FieldLabel>
          <textarea
            id="focus-text"
            className={`${input} min-h-64`}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <p className="text-sm text-[var(--muted-foreground)]">
            Line {Math.min(index + 1, lines.length)} of {lines.length}
          </p>
        </div>
      }
      preview={
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={secondaryButton}
              onClick={() => setIndex((current) => Math.max(0, current - 1))}
              disabled={index === 0}
            >
              Previous line
            </button>
            <button
              type="button"
              className={primaryButton}
              onClick={() =>
                setIndex((current) => Math.min(lines.length - 1, current + 1))
              }
              disabled={index >= lines.length - 1}
            >
              Next line
            </button>
          </div>
          <div className="grid gap-2 text-xl leading-8">
            {lines.map((line, lineIndex) => (
              <p
                key={`${lineIndex}-${line}`}
                className={`rounded-md px-3 py-2 transition ${
                  lineIndex === index
                    ? "bg-[var(--muted)] font-semibold text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] opacity-40"
                }`}
              >
                {line || " "}
              </p>
            ))}
          </div>
        </div>
      }
    />
  );
}

const PROMPTS = [
  "Small steps build steady skills.",
  "Comfort and accuracy come before speed.",
  "Take a pause whenever your hand feels tired.",
  "Accessible practice should adapt to you.",
];

function OneHandTrainer() {
  const [hand, setHand] = useState("left");
  const [promptIndex, setPromptIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState(0);
  const prompt = PROMPTS[promptIndex];
  const elapsedMinutes = startTime
    ? Math.max((Date.now() - startTime) / 60000, 1 / 60)
    : 0;
  const matches = [...typed].filter(
    (character, index) => character === prompt[index],
  ).length;
  const accuracy = typed.length ? Math.round((matches / typed.length) * 100) : 100;
  const wpm = elapsedMinutes
    ? Math.round(
        typed.trim().split(/\s+/).filter(Boolean).length / elapsedMinutes,
      )
    : 0;

  const next = () => {
    setPromptIndex((current) => (current + 1) % PROMPTS.length);
    setTyped("");
    setStartTime(0);
  };

  return (
    <WorkspaceGrid
      controls={
        <div className="grid gap-4">
          <FieldLabel htmlFor="training-hand">Practice hand</FieldLabel>
          <select
            id="training-hand"
            className={input}
            value={hand}
            onChange={(event) => setHand(event.target.value)}
          >
            <option value="left">Left hand</option>
            <option value="right">Right hand</option>
          </select>
          <div className="rounded-md border border-[var(--border)] bg-[var(--muted)] p-4">
            <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
              Suggested key group
            </p>
            <p className="mt-2 font-mono text-xl font-semibold">
              {hand === "left" ? "Q W E R T · A S D F G · Z X C V B" : "Y U I O P · H J K L · N M"}
            </p>
          </div>
          <button type="button" className={secondaryButton} onClick={next}>
            New prompt
          </button>
        </div>
      }
      preview={
        <div className="grid gap-4">
          <p className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-xl font-semibold leading-8">
            {prompt}
          </p>
          <textarea
            className={`${input} min-h-40 text-lg`}
            value={typed}
            onChange={(event) => {
              if (!startTime) setStartTime(Date.now());
              setTyped(event.target.value);
            }}
            placeholder="Type the prompt here…"
            aria-label="Typing practice"
          />
          <div className="grid gap-2 sm:grid-cols-3">
            <Metric label="Accuracy" value={`${accuracy}%`} />
            <Metric label="Approx. WPM" value={wpm} />
            <Metric label="Characters" value={`${typed.length}/${prompt.length}`} />
          </div>
          {typed === prompt ? (
            <p className="inline-flex items-center gap-2 font-semibold text-[var(--primary)]">
              <Check className="h-4 w-4" />
              Prompt complete
            </p>
          ) : null}
        </div>
      }
    />
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function VoiceSteadiness() {
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  const [volume, setVolume] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [history, setHistory] = useState([]);

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
    audioContextRef.current?.close?.();
    audioContextRef.current = null;
    setActive(false);
  }, []);
  useEffect(() => stop, [stop]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      context.createMediaStreamSource(stream).connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);
      streamRef.current = stream;
      audioContextRef.current = context;
      setActive(true);
      setError("");

      let lastUpdate = 0;
      const loop = (time) => {
        analyser.getFloatTimeDomainData(buffer);
        if (time - lastUpdate > 180) {
          const rms = Math.sqrt(
            buffer.reduce((sum, sample) => sum + sample * sample, 0) /
              buffer.length,
          );
          const nextVolume = Math.min(100, Math.round(rms * 500));
          const nextPitch = estimatePitch(buffer, context.sampleRate);
          setVolume(nextVolume);
          setPitch(nextPitch);
          setHistory((current) =>
            [...current, { volume: nextVolume, pitch: nextPitch }].slice(-40),
          );
          lastUpdate = time;
        }
        frameRef.current = requestAnimationFrame(loop);
      };
      frameRef.current = requestAnimationFrame(loop);
    } catch (microphoneError) {
      setError(microphoneError?.message || "Microphone permission was not available.");
    }
  };

  const voiced = history.filter((item) => item.pitch > 0);
  const averagePitch = voiced.length
    ? voiced.reduce((sum, item) => sum + item.pitch, 0) / voiced.length
    : 0;
  const pitchSpread = voiced.length
    ? Math.sqrt(
        voiced.reduce(
          (sum, item) => sum + (item.pitch - averagePitch) ** 2,
          0,
        ) / voiced.length,
      )
    : 0;
  const averageVolume = history.length
    ? history.reduce((sum, item) => sum + item.volume, 0) / history.length
    : 0;

  return (
    <WorkspaceGrid
      controls={
        <div className="grid gap-4">
          <button
            type="button"
            className={active ? secondaryButton : primaryButton}
            onClick={active ? stop : start}
          >
            <Mic className="h-4 w-4" />
            {active ? "Stop microphone" : "Start microphone"}
          </button>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            Sustain a comfortable vowel or read a short sentence. The tool
            estimates fundamental frequency and volume locally; background
            noise, microphones, and voice quality can make pitch unavailable.
          </p>
          {error ? (
            <p className="text-sm text-[var(--destructive)]">{error}</p>
          ) : null}
        </div>
      }
      preview={
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label="Current volume" value={`${volume}/100`} />
            <Metric
              label="Estimated pitch"
              value={pitch ? `${Math.round(pitch)} Hz` : "—"}
            />
            <Metric
              label="Average volume"
              value={averageVolume.toFixed(1)}
            />
            <Metric
              label="Pitch spread"
              value={voiced.length ? `${pitchSpread.toFixed(1)} Hz` : "—"}
            />
          </div>
          <div className="flex h-40 items-end gap-1 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
            {history.map((item, index) => (
              <span
                key={`${index}-${item.volume}-${item.pitch}`}
                className="min-w-1 flex-1 bg-[var(--primary)]"
                style={{ height: `${Math.max(2, item.volume)}%` }}
                title={`Volume ${item.volume}; pitch ${Math.round(item.pitch || 0)} Hz`}
              />
            ))}
          </div>
        </div>
      }
    />
  );
}

function estimatePitch(buffer, sampleRate) {
  let rms = 0;
  for (const sample of buffer) rms += sample * sample;
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.01) return 0;

  let bestOffset = -1;
  let bestCorrelation = 0;
  const minOffset = Math.floor(sampleRate / 500);
  const maxOffset = Math.min(
    Math.floor(sampleRate / 70),
    Math.floor(buffer.length / 2),
  );
  for (let offset = minOffset; offset <= maxOffset; offset += 1) {
    let correlation = 0;
    for (let index = 0; index < buffer.length - offset; index += 1) {
      correlation += buffer[index] * buffer[index + offset];
    }
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }
  return bestOffset > 0 ? sampleRate / bestOffset : 0;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!(await safeCopyText(text))) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button type="button" className={secondaryButton} onClick={copy}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
