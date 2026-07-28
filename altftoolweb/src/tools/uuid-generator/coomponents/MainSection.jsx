"use client";
import { useState } from "react";
import { Key, Copy, RefreshCw, Check, Sparkles, FileDown } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

export default function MainSection() {
  const [uuids, setUuids] = useState([]);
  const [count, setCount] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [version, setVersion] = useState("v4");

  function generateUUIDv4() {
    if (typeof crypto?.randomUUID === "function") return crypto.randomUUID();

    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  function generateUUIDv1() {
    const timestamp = Date.now();
    const randomBytes = crypto.getRandomValues(new Uint8Array(10));
    const random = [...randomBytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    const timeHex = timestamp.toString(16).padStart(12, "0");
    return `${timeHex.substring(0, 8)}-${timeHex.substring(
      8,
      12,
    )}-1${random.substring(0, 3)}-${random.substring(3, 7)}-${random.substring(
      7,
      19,
    )}`;
  }

  function generateUUIDs() {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(version === "v4" ? generateUUIDv4() : generateUUIDv1());
    }
    setUuids(arr);
    setCopiedIndex(null);
  }

  async function copyToClipboard(uuid, idx) {
    await safeCopyText(uuid);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  async function copyAll() {
    await safeCopyText(uuids.join("\n"));
    setCopiedIndex("all");
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  function downloadAll() {
    const url = URL.createObjectURL(new Blob([uuids.join("\n")], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `altftool-${version}-uuids.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-(--primary)/10 border border-(--primary)/30 rounded-full px-4 py-2 mb-6">
          <Sparkles className="w-4 h-4 text-(--primary)" />
          <span className="text-(--primary) text-sm font-medium">
            Fast & Secure
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-(--primary) mb-6">
          UUID Generator
        </h1>

        <p className="text-(--muted-foreground) text-lg max-w-2xl mx-auto">
          Create universally unique identifiers for your apps, APIs, and
          databases.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-(--card) border border-(--border) rounded-2xl p-6 sm:p-8 shadow mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Version */}
          <div>
            <label htmlFor="uuid-version" className="text-(--foreground) text-sm mb-2 block">
              Version
            </label>

            <select
              id="uuid-version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full bg-(--background) border border-(--border) text-(--foreground) rounded-lg px-4 py-3 outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25"
            >
              <option value="v4">UUID v4 (Random)</option>
              <option value="v1">UUID v1 (Timestamp)</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="uuid-count" className="text-(--foreground) text-sm mb-2 block">
              Quantity
            </label>

            <input
              id="uuid-count"
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) =>
                setCount(
                  Math.min(100, Math.max(1, Number(e.target.value) || 1)),
                )
              }
              className="w-full bg-(--background) border border-(--border) text-(--foreground) rounded-lg px-4 py-3 outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25"
            />
          </div>

          {/* Generate Button */}
          <div className="sm:col-span-2 flex items-end">
            <button
              onClick={generateUUIDs}
              className="w-full min-h-[44px] bg-(--primary) hover:bg-(--primary)/90 text-(--primary-foreground) px-6 py-3 rounded-lg flex justify-center gap-2 transition-transform active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
            >
              <RefreshCw className="w-5 h-5" />
              Generate UUIDs
            </button>
          </div>
        </div>

        <div className="bg-(--muted) border border-(--border) rounded-lg p-4">
          <p className="text-(--muted-foreground) text-sm">
            <strong>UUID v4:</strong> Crypto random • <strong>UUID v1:</strong>{" "}
            Timestamp-style with crypto random node data
          </p>
        </div>
      </div>

      {/* Results */}
      {uuids.length > 0 && (
        <div className="bg-(--card) border border-(--border) rounded-2xl p-6 sm:p-8 shadow">
          <div className="flex flex-wrap justify-between gap-3 mb-6">
            <h2 className="text-2xl font-bold text-(--foreground)">
              Generated UUIDs
            </h2>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyAll}
                className="bg-(--muted) hover:bg-(--muted)/80 text-(--foreground) px-3 py-2 min-h-[44px] rounded-lg flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
              >
                {copiedIndex === "all" ? (
                  <Check className="text-green-500" />
                ) : (
                  <Copy />
                )}
                Copy All
              </button>
              <button
                onClick={downloadAll}
                className="bg-(--muted) hover:bg-(--muted)/80 text-(--foreground) px-3 py-2 min-h-[44px] rounded-lg flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
              >
                <FileDown />
                Download
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {uuids.map((uuid, i) => (
              <div
                key={i}
                className="bg-(--muted) border border-(--border) rounded-lg p-4 flex justify-between items-center"
              >
                <code className="text-(--primary) font-mono break-all">
                  {uuid}
                </code>

                <button
                  onClick={() => copyToClipboard(uuid, i)}
                  aria-label={copiedIndex === i ? "Copied" : `Copy UUID ${i + 1}`}
                  className="bg-(--background) border border-(--border) px-3 py-2 min-h-[44px] min-w-[44px] rounded-lg cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
                >
                  {copiedIndex === i ? (
                    <Check className="text-green-500" />
                  ) : (
                    <Copy className="text-(--foreground)" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {uuids.length === 0 && (
        <div className="bg-(--card) border border-(--border) rounded-2xl p-12 text-center">
          <Key className="mx-auto mb-4 text-(--primary)" />
          <h3 className="text-xl font-semibold text-(--foreground) mb-2">
            No UUIDs Generated Yet
          </h3>
          <p className="text-(--muted-foreground)">
            Click “Generate UUIDs” to create identifiers
          </p>
        </div>
      )}
    </main>
  );
}
