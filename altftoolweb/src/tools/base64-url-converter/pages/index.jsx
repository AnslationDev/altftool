"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HeaderBar from "../components/HeaderBar";
import ConverterPanels from "../components/ConverterPanels";
import QuickActions from "../components/QuickActions";
import StatCards from "../components/StatCards";
import AdvancedOptions from "../components/AdvancedOptions";
import FeatureStrip from "../components/FeatureStrip";
import { SAMPLE_BASE64, convert } from "../utils/base64url";

const MAX_SHARE_LENGTH = 2000;

// Shared-link params are read in lazy initializers (client-only tool module,
// same pattern as the sessionStorage-backed tools in this repo).
function initialParam(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    return new URLSearchParams(window.location.search).get(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export default function Base64UrlConverterPage() {
  const [direction, setDirection] = useState(() => {
    const dir = initialParam("dir", "encode");
    return dir === "decode" ? "decode" : "encode";
  });
  const [input, setInput] = useState(() => initialParam("input", ""));
  const [result, setResult] = useState({ output: "", error: "" });
  const [timeMs, setTimeMs] = useState(0);
  const [options, setOptions] = useState({
    autoConvert: true,
    removePadding: true,
    lineWrap: false,
    validate: true,
  });
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const advancedRef = useRef(null);

  const runConvert = useCallback(
    (nextInput = input, nextDirection = direction, nextOptions = options) => {
      const start = performance.now();
      const conversion = convert(nextInput, {
        direction: nextDirection,
        removePadding: nextOptions.removePadding,
        lineWrap: nextOptions.lineWrap,
        validate: nextOptions.validate,
      });
      setResult(conversion);
      setTimeMs(Math.round(performance.now() - start));
      return conversion;
    },
    [input, direction, options],
  );

  // Auto-convert while typing (debounced). Also handles direction/option
  // changes so the output always tracks the current settings.
  useEffect(() => {
    if (!options.autoConvert) return undefined;
    const id = window.setTimeout(() => runConvert(), 150);
    return () => window.clearTimeout(id);
  }, [options.autoConvert, runConvert]);

  const status = result.error ? "error" : result.output ? "success" : "ready";

  const flash = (setter) => {
    setter(true);
    window.setTimeout(() => setter(false), 1800);
  };

  const handleOptionChange = (key, value) => {
    setOptions((current) => ({ ...current, [key]: value }));
  };

  const handleSetDirection = (nextDirection) => {
    setDirection(nextDirection);
  };

  // Swap: flip direction and feed the current output back in as input.
  const handleSwap = () => {
    const nextDirection = direction === "encode" ? "decode" : "encode";
    setDirection(nextDirection);
    if (result.output) {
      setInput(result.output);
      setResult({ output: "", error: "" });
    }
  };

  const handleClearAll = () => {
    setInput("");
    setResult({ output: "", error: "" });
    setTimeMs(0);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInput(text);
    } catch {
      window.alert("Clipboard read isn't available — paste directly into the input box instead.");
    }
  };

  const handleUploadFile = async (file) => {
    try {
      setInput((await file.text()).trim());
    } catch {
      window.alert(`Couldn't read "${file.name}" as text.`);
    }
  };

  const handleSampleData = () => {
    setDirection("encode");
    setInput(SAMPLE_BASE64);
  };

  const handleCopy = async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      flash(setCopied);
    } catch {
      window.alert("Clipboard access isn't available in this browser.");
    }
  };

  const handleDownload = () => {
    if (!result.output) return;
    const url = URL.createObjectURL(new Blob([result.output], { type: "text/plain;charset=utf-8" }));
    const link = Object.assign(document.createElement("a"), {
      href: url,
      download: direction === "encode" ? "url-safe-base64.txt" : "standard-base64.txt",
    });
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!input) return;
    if (input.length > MAX_SHARE_LENGTH) {
      window.alert(`Sharing via link works up to ${MAX_SHARE_LENGTH.toLocaleString()} characters — use Download instead.`);
      return;
    }
    try {
      const url = `${window.location.origin}${window.location.pathname}?dir=${direction}&input=${encodeURIComponent(input)}`;
      await navigator.clipboard.writeText(url);
      flash(setShared);
    } catch {
      window.alert("Clipboard access isn't available in this browser.");
    }
  };

  const handleOptionsClick = () => {
    advancedRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <main className="min-h-screen bg-slate-50/40 dark:bg-slate-950/60 px-4 py-6 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <HeaderBar />

        <ConverterPanels
          direction={direction}
          input={input}
          onInputChange={setInput}
          output={result.output}
          error={result.error}
          status={status}
          onConvert={() => runConvert()}
          onSwap={handleSwap}
          onPasteClipboard={handlePasteClipboard}
          onUploadFile={handleUploadFile}
          onClearAll={handleClearAll}
          copied={copied}
          onCopy={handleCopy}
          onDownload={handleDownload}
          shared={shared}
          onShare={handleShare}
          onOptionsClick={handleOptionsClick}
        />

        <QuickActions
          direction={direction}
          onSetDirection={handleSetDirection}
          onPasteClipboard={handlePasteClipboard}
          onSampleData={handleSampleData}
          hasOutput={!!result.output}
          copied={copied}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onResetAll={handleClearAll}
        />

        <StatCards input={input} output={result.output} status={status} timeMs={timeMs} />

        <AdvancedOptions
          ref={advancedRef}
          options={options}
          onOptionChange={handleOptionChange}
          direction={direction}
          onSetDirection={handleSetDirection}
        />

        <FeatureStrip />
      </div>
    </main>
  );
}
