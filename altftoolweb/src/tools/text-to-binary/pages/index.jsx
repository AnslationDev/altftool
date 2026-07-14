"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import {
  Binary,
  Clipboard,
  RotateCcw,
  ArrowLeftRight,
  FileDown,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const SAMPLE_TEXT = "Hello, World!";
const SAMPLE_BINARY = "01001000 01100101 01101100 01101100 01101111 00101100 00100000 01010111 01101111 01110010 01101100 01100100 00100001";

function textToBinary(text) {
  return [...text].map((ch) => ch.charCodeAt(0).toString(2).padStart(8, "0")).join(" ");
}

function binaryToText(binary) {
  const bytes = binary.trim().split(/\s+/).filter(Boolean);
  return bytes
    .map((b) => {
      if (!/^[01]+$/.test(b)) return null;
      return String.fromCharCode(parseInt(b, 2));
    })
    .join("");
}

function isValidBinary(str) {
  return /^[01\s]+$/.test(str.trim());
}

function downloadTextFile(filename, content) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ToolHome() {
  const [textInput, setTextInput] = useState("");
  const [binaryInput, setBinaryInput] = useState("");
  const [copied, setCopied] = useState(0);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("to-binary");
  const outputRef = useRef(null);

  const handleTextChange = useCallback((val) => {
    setTextInput(val);
    setError("");
    if (val) {
      setBinaryInput(textToBinary(val));
      setMode("to-binary");
    } else {
      setBinaryInput("");
    }
  }, []);

  const handleBinaryChange = useCallback((val) => {
    setBinaryInput(val);
    setError("");
    if (val) {
      if (!isValidBinary(val)) {
        setError("Binary input can only contain 0, 1 and spaces");
        setTextInput("");
        return;
      }
      setTextInput(binaryToText(val));
      setMode("from-binary");
    } else {
      setTextInput("");
    }
  }, []);

  const output = useMemo(() => {
    if (mode === "to-binary") return binaryInput;
    return textInput;
  }, [mode, binaryInput, textInput]);

  const swap = useCallback(() => {
    setTextInput(binaryInput);
    setBinaryInput(textInput);
    setMode((m) => (m === "to-binary" ? "from-binary" : "to-binary"));
  }, [binaryInput, textInput]);

  const handleClear = useCallback(() => {
    setTextInput("");
    setBinaryInput("");
    setError("");
    setCopied(0);
  }, []);

  const handleSample = useCallback(() => {
    setTextInput(SAMPLE_TEXT);
    setBinaryInput(SAMPLE_BINARY);
    setMode("to-binary");
    setError("");
  }, []);

  const copyOutput = async () => {
    if (!output) return;
    setCopied(1);
    await safeCopyText(output);
    setTimeout(() => setCopied(0), 1200);
  };

  const copyInput = async (val) => {
    if (!val) return;
    setCopied(2);
    await safeCopyText(val);
    setTimeout(() => setCopied(0), 1200);
  };

  const downloadOutput = () => {
    if (!output) return;
    const ext = mode === "to-binary" ? ".txt" : ".txt";
    downloadTextFile(`binary-output${ext}`, output);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Binary className="h-4 w-4" />
            Developer utility
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
            Text to Binary / Binary to Text
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Convert any text to binary code or decode binary back to readable text.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Binary className="h-4 w-4 text-[var(--primary)]" />
                {mode === "to-binary" ? "Text Input" : "Binary Input"}
              </h2>
              <div className="flex gap-2">
                <button type="button" onClick={handleSample} className="btn-secondary min-h-10 px-3 py-2">
                  <RotateCcw className="h-4 w-4" />
                  Sample
                </button>
                <button type="button" onClick={handleClear} className="btn-secondary min-h-10 px-3 py-2">
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </div>
            <textarea
              value={mode === "to-binary" ? textInput : binaryInput}
              onChange={(e) =>
                mode === "to-binary"
                  ? handleTextChange(e.target.value)
                  : handleBinaryChange(e.target.value)
              }
              className="min-h-[240px] w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm font-mono leading-7 outline-none focus:border-[var(--primary)]"
              placeholder={
                mode === "to-binary"
                  ? "Type or paste text here..."
                  : "Paste binary code here (space-separated 8-bit values)..."
              }
            />
            <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>
                {mode === "to-binary" ? textInput.length : binaryInput.replace(/\s/g, "").length} character(s)
              </span>
              <button
                type="button"
                onClick={() => copyInput(mode === "to-binary" ? textInput : binaryInput)}
                className="flex items-center gap-1 hover:text-[var(--primary)] cursor-pointer"
              >
                <Clipboard className="h-3 w-3" />
                {copied === 2 ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Binary className="h-4 w-4 text-[var(--primary)]" />
                {mode === "to-binary" ? "Binary Output" : "Text Output"}
              </h2>
              <button type="button" onClick={swap} className="btn-secondary min-h-10 px-3 py-2">
                <ArrowLeftRight className="h-4 w-4" />
                Swap
              </button>
            </div>
            <textarea
              readOnly
              ref={outputRef}
              value={output}
              className="min-h-[240px] w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4 text-sm font-mono leading-7 outline-none cursor-default"
              placeholder={
                mode === "to-binary"
                  ? "Binary output will appear here..."
                  : "Text output will appear here..."
              }
            />
            <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>
                {mode === "to-binary" ? binaryInput.replace(/\s/g, "").length : textInput.length} character(s)
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={copyOutput}
                  className="flex items-center gap-1 hover:text-[var(--primary)] cursor-pointer"
                >
                  <Clipboard className="h-3 w-3" />
                  {copied === 1 ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={downloadOutput}
                  className="flex items-center gap-1 hover:text-[var(--primary)] cursor-pointer"
                >
                  <FileDown className="h-3 w-3" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="text-lg font-semibold mb-4">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">Text → Binary</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Each character is converted to its ASCII code, then to an 8-bit binary number. Words are separated by spaces.
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">Binary → Text</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Binary strings (space-separated 8-bit values) are parsed and converted back to their ASCII characters.
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">Auto Mode</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Type in either field and the result updates instantly. Use Swap to switch input/output sides.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
