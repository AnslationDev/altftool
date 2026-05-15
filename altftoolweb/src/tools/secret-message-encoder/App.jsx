"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Binary,
  CheckCircle2,
  Clipboard,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Lock,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Unlock,
} from "lucide-react";
import {
  getTextStats,
  transformMessage,
} from "@/tools/secret-message-encoder/utils/ciphers";

const ALGORITHMS = [
  { id: "caesar", label: "Caesar", detail: "Shift alphabet characters by a custom offset.", level: "Learning" },
  { id: "rot13", label: "ROT13", detail: "Classic 13-step substitution for spoilers and puzzles.", level: "Learning" },
  { id: "atbash", label: "Atbash", detail: "Mirror alphabet mapping from A to Z.", level: "Learning" },
  { id: "base64", label: "Base64", detail: "Transport-safe text encoding for payloads.", level: "Utility" },
  { id: "url", label: "URL", detail: "Encode reserved URL characters safely.", level: "Utility" },
  { id: "binary", label: "Binary", detail: "Convert text into 8-bit binary bytes.", level: "Utility" },
  { id: "morse", label: "Morse", detail: "Encode words into dot and dash signals.", level: "Signal" },
  { id: "aes", label: "AES-GCM", detail: "Password-based AES-GCM payload using Web Crypto.", level: "Modern" },
];

const SAMPLE_MESSAGES = [
  "Meet me at 9 PM near gate 4.",
  "Launch window opens after the second signal.",
  "The backup code is hidden in plain sight.",
];

const SECURITY_NOTES = {
  caesar: "Educational cipher only. Easy to break with frequency analysis.",
  rot13: "Obfuscation only. ROT13 is reversible without a secret key.",
  atbash: "Historical cipher only. It does not provide real secrecy.",
  base64: "Encoding only. Anyone can decode Base64.",
  url: "Encoding only. Useful for URLs, not for secrecy.",
  binary: "Encoding only. Binary output is readable once converted back.",
  morse: "Signal encoding only. Best for puzzles and playful messages.",
  aes: "Modern encryption. Security depends on password strength.",
};

function Panel({ title, eyebrow, icon: Icon, action, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-(--border) bg-(--card) p-5 ${className}`}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-(--border) bg-(--background) text-(--primary)">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            {eyebrow ? <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">{eyebrow}</p> : null}
            <h2 className="text-lg font-extrabold text-(--foreground)">{title}</h2>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ tone = "info", children }) {
  const styles = {
    good: "border-green-500/30 bg-green-500/10 text-green-600",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-600",
    risk: "border-red-500/30 bg-red-500/10 text-red-600",
    info: "border-(--border) bg-(--card) text-(--foreground)",
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${styles[tone]}`}>
      {children}
    </span>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-lg border border-(--border) bg-(--background) p-4 text-center">
      <div className="mb-2 flex items-center justify-center gap-2 text-(--primary)">
        <Icon className="h-4 w-4 shrink-0" />
        <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">{label}</p>
      </div>
      <p className="break-words text-lg font-black text-(--foreground)">{value}</p>
    </div>
  );
}

function AlgorithmButton({ algorithm, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition ${
        active
          ? "border-(--primary) bg-(--section-highlight) text-(--foreground)"
          : "border-(--border) bg-(--background) text-(--foreground) hover:bg-(--card-hover-bg)"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold">{algorithm.label}</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">{algorithm.level}</p>
        </div>
        {active ? <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" /> : null}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-(--muted-foreground)">{algorithm.detail}</p>
    </button>
  );
}

function downloadText(content, fileName) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function encodeSharePayload(payload) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function decodeSharePayload(value) {
  return JSON.parse(decodeURIComponent(escape(atob(value))));
}

export default function SecretMessageEncoder() {
  const [inputText, setInputText] = useState("Meet me at 9 PM near gate 4.");
  const [outputText, setOutputText] = useState("");
  const [algorithm, setAlgorithm] = useState("caesar");
  const [shift, setShift] = useState(3);
  const [mode, setMode] = useState("encode");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");

  const activeAlgorithm = ALGORITHMS.find((item) => item.id === algorithm) || ALGORITHMS[0];
  const inputStats = useMemo(() => getTextStats(inputText), [inputText]);
  const outputStats = useMemo(() => getTextStats(outputText), [outputText]);
  const needsPassword = algorithm === "aes";
  const isModernEncryption = algorithm === "aes";

  useEffect(() => {
    try {
      const hash = window.location.hash.replace(/^#payload=/, "");
      if (!hash) return;
      const payload = decodeSharePayload(hash);
      setInputText(payload.inputText || "");
      setAlgorithm(payload.algorithm || "caesar");
      setShift(Number(payload.shift) || 3);
      setMode(payload.mode || "encode");
      window.history.replaceState(null, "", window.location.pathname);
    } catch {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setProcessing(true);
      setError("");

      try {
        const result = await transformMessage({
          text: inputText,
          algorithm,
          mode,
          shift,
          password,
        });
        if (alive) setOutputText(result);
      } catch (transformError) {
        if (alive) {
          setOutputText("");
          setError(transformError?.message || "Could not transform this message.");
        }
      } finally {
        if (alive) setProcessing(false);
      }
    };

    const timer = window.setTimeout(run, needsPassword ? 220 : 80);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [algorithm, inputText, mode, needsPassword, password, shift]);

  const markCopied = (type) => {
    setCopied(type);
    window.setTimeout(() => setCopied(""), 1600);
  };

  const handleCopy = async (value, type) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    markCopied(type);
  };

  const handleSwap = () => {
    setInputText(outputText);
    setMode((current) => (current === "encode" ? "decode" : "encode"));
  };

  const handleShare = async () => {
    const payload = encodeSharePayload({
      inputText,
      algorithm,
      shift,
      mode,
    });
    const url = `${window.location.origin}${window.location.pathname}#payload=${payload}`;
    await navigator.clipboard.writeText(url);
    markCopied("share");
  };

  const report = [
    "SECRET MESSAGE ENCODER REPORT",
    "=============================",
    "",
    `Algorithm: ${activeAlgorithm.label}`,
    `Mode: ${mode.toUpperCase()}`,
    `Shift: ${algorithm === "caesar" ? shift : "N/A"}`,
    `Input: ${inputStats.characters} chars, ${inputStats.words} words, checksum ${inputStats.checksum}`,
    `Output: ${outputStats.characters} chars, ${outputStats.words} words, checksum ${outputStats.checksum}`,
    "",
    "INPUT",
    "-----",
    inputText || "N/A",
    "",
    "OUTPUT",
    "------",
    outputText || "N/A",
  ].join("\n");

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-12 pt-8 text-(--foreground)">
      <header className="mx-auto max-w-5xl text-center">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <StatusBadge tone={error ? "risk" : "good"}>
            {error ? <AlertTriangle className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            {error ? "Needs Attention" : "Local Only"}
          </StatusBadge>
          <StatusBadge tone={mode === "encode" ? "info" : "warn"}>
            {mode === "encode" ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            {mode.toUpperCase()}
          </StatusBadge>
          <StatusBadge tone={isModernEncryption ? "good" : "warn"}>
            <Sparkles className="h-3.5 w-3.5" />
            {activeAlgorithm.level}
          </StatusBadge>
        </div>
        <h1 className="heading text-center">Secret Message Encoder</h1>
        <p className="description mx-auto mt-3 max-w-4xl text-center">
          Encode, decode, inspect, copy, share, and export secret-message payloads with classical ciphers, utility encoders, Morse, binary, and AES-GCM password encryption.
        </p>
      </header>

      <section className="tool-card-grid mt-8">
        <StatCard label="Input" value={`${inputStats.characters} chars`} icon={MessageSquareText} />
        <StatCard label="Output" value={`${outputStats.characters} chars`} icon={FileText} />
        <StatCard label="Checksum" value={outputStats.checksum} icon={ShieldCheck} />
        <StatCard label="Algorithm" value={activeAlgorithm.label} icon={KeyRound} />
      </section>

      <section className="mt-8 grid gap-6 2xl:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-6">
          <Panel title="Cipher Control" eyebrow="Mode and algorithm" icon={KeyRound}>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-(--border) bg-(--background) p-2">
              <button type="button" className={mode === "encode" ? "btn-primary w-full" : "btn-secondary w-full"} onClick={() => setMode("encode")}>
                <Lock />
                Encode
              </button>
              <button type="button" className={mode === "decode" ? "btn-primary w-full" : "btn-secondary w-full"} onClick={() => setMode("decode")}>
                <Unlock />
                Decode
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {ALGORITHMS.map((item) => (
                <AlgorithmButton key={item.id} algorithm={item} active={algorithm === item.id} onClick={() => setAlgorithm(item.id)} />
              ))}
            </div>
          </Panel>

          <Panel title="Parameters" eyebrow="Transform settings" icon={Binary}>
            {algorithm === "caesar" ? (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-(--foreground)">Shift Value</span>
                  <span className="text-2xl font-black text-(--primary)">{shift}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={shift}
                  onChange={(event) => setShift(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg border border-(--border) bg-(--background) accent-(--primary)"
                />
                <div className="mt-2 flex justify-between text-xs font-bold text-(--muted-foreground)">
                  <span>1</span>
                  <span>13</span>
                  <span>25</span>
                </div>
              </div>
            ) : null}

            {needsPassword ? (
              <div>
                <label className="text-sm font-bold text-(--foreground)" htmlFor="secret-password">
                  Password
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="secret-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Use a strong password"
                    className="min-h-11 min-w-0 flex-1 rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm font-semibold text-(--foreground) outline-none focus:border-(--primary)"
                  />
                  <button
                    type="button"
                    className="btn-secondary px-3"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
            ) : null}

            {!needsPassword && algorithm !== "caesar" ? (
              <div className="rounded-lg border border-(--border) bg-(--background) p-4">
                <p className="text-sm font-semibold leading-relaxed text-(--muted-foreground)">
                  {activeAlgorithm.label} has fixed parameters, so you can transform text instantly without extra settings.
                </p>
              </div>
            ) : null}

            <div className="mt-5 rounded-lg border border-(--border) bg-(--background) p-4">
              <div className="mb-2 flex items-center gap-2 text-(--primary)">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Security Note</p>
              </div>
              <p className="text-sm leading-relaxed text-(--muted-foreground)">{SECURITY_NOTES[algorithm]}</p>
            </div>
          </Panel>
        </div>

        <div className="grid gap-6">
          <Panel
            title="Message Workspace"
            eyebrow="Input and result"
            icon={MessageSquareText}
            action={
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-secondary" onClick={() => setInputText(SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)])}>
                  <Sparkles />
                  Sample
                </button>
                <button type="button" className="btn-secondary" onClick={() => setInputText("")}>
                  <Trash2 />
                  Clear
                </button>
              </div>
            }
          >
            <div className="grid gap-4 2xl:grid-cols-2">
              <label className="min-w-0">
                <span className="mb-2 block text-sm font-bold text-(--foreground)">Source Message</span>
                <textarea
                  value={inputText}
                  onChange={(event) => setInputText(event.target.value)}
                  placeholder="Type or paste your message..."
                  className="min-h-72 w-full resize-y rounded-lg border border-(--border) bg-(--background) p-4 font-mono text-sm leading-relaxed text-(--foreground) outline-none focus:border-(--primary)"
                />
              </label>

              <label className="min-w-0">
                <span className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-(--foreground)">
                  <span>Transformed Output</span>
                  {processing ? <span className="text-xs text-(--muted-foreground)">Processing...</span> : null}
                </span>
                <textarea
                  readOnly
                  value={outputText}
                  placeholder="Output will appear here..."
                  className="min-h-72 w-full resize-y rounded-lg border border-(--border) bg-(--background) p-4 font-mono text-sm leading-relaxed text-(--foreground) outline-none"
                />
              </label>
            </div>

            {error ? (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-600">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            ) : null}

            <div className="tool-action-grid mt-5">
              <button type="button" className="btn-primary w-full" onClick={() => handleCopy(outputText, "output")} disabled={!outputText}>
                <Copy />
                {copied === "output" ? "Copied" : "Copy Output"}
              </button>
              <button type="button" className="btn-secondary w-full" onClick={handleSwap} disabled={!outputText}>
                <RefreshCw />
                Swap
              </button>
              <button type="button" className="btn-secondary w-full" onClick={handleShare}>
                <Clipboard />
                {copied === "share" ? "Link Copied" : "Share Link"}
              </button>
              <button type="button" className="btn-secondary w-full" onClick={() => downloadText(report, "secret-message-report.txt")}>
                <Download />
                Export
              </button>
            </div>
          </Panel>

          <Panel title="Payload Intelligence" eyebrow="Audit snapshot" icon={ShieldCheck}>
            <div className="tool-card-grid">
              <StatCard label="Input Words" value={inputStats.words} icon={MessageSquareText} />
              <StatCard label="Input Bytes" value={inputStats.bytes} icon={Binary} />
              <StatCard label="Output Lines" value={outputStats.lines} icon={FileText} />
              <StatCard label="Mode" value={mode.toUpperCase()} icon={mode === "encode" ? Lock : Unlock} />
            </div>
            <div className="mt-5 rounded-lg border border-(--border) bg-(--background) p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Current Recipe</p>
              <p className="mt-2 break-words font-mono text-sm font-bold text-(--foreground)">
                {activeAlgorithm.label}
                {algorithm === "caesar" ? ` | shift ${shift}` : ""}
                {needsPassword ? " | PBKDF2 120k | AES-GCM-256" : ""}
                {` | ${mode}`}
              </p>
            </div>
          </Panel>
        </div>
      </section>

      <section className="tool-feature-grid mt-8">
        {[
          ["Private by default", "All transformations happen inside your browser session. Nothing is uploaded."],
          ["Shareable recipes", "Copy a link with the selected algorithm, mode, shift, and source text."],
          ["Export-ready", "Download a compact audit report containing inputs, outputs, checksums, and settings."],
        ].map(([title, detail]) => (
          <div key={title} className="rounded-lg border border-(--border) bg-(--card) p-5 text-center">
            <h3 className="text-base font-extrabold text-(--foreground)">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-(--muted-foreground)">{detail}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
