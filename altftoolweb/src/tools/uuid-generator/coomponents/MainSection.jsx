"use client";
import { useState } from "react";
import { Key, Copy, RefreshCw, Check, Sparkles } from "lucide-react";

export default function MainSection() {
  const [uuids, setUuids] = useState([]);
  const [count, setCount] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [version, setVersion] = useState("v4");

  function generateUUIDv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function generateUUIDv1() {
    const timestamp = Date.now();
    const random = Math.random().toString(16).substring(2, 15);
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

  function copyToClipboard(uuid, idx) {
    navigator.clipboard.writeText(uuid);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  function copyAll() {
    navigator.clipboard.writeText(uuids.join("\n"));
    setCopiedIndex("all");
    setTimeout(() => setCopiedIndex(null), 1500);
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
          Generate Unique <br />
          <span className="text-(--foreground) text-3xl sm:text-4xl md:text-6xl  ">
            UUIDs Instantly
          </span>
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
            <label className="text-(--foreground) text-sm mb-2 block">
              Version
            </label>

            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full bg-(--background) border border-(--border) text-(--foreground) rounded-lg px-4 py-3 focus:ring-2 focus:ring-(--primary)"
            >
              <option value="v4">UUID v4 (Random)</option>
              <option value="v1">UUID v1 (Timestamp)</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-(--foreground) text-sm mb-2 block">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) =>
                setCount(
                  Math.min(100, Math.max(1, Number(e.target.value) || 1)),
                )
              }
              className="w-full bg-(--background) border border-(--border) text-(--foreground) rounded-lg px-4 py-3 focus:ring-2 focus:ring-(--primary)"
            />
          </div>

          {/* Generate Button */}
          <div className="sm:col-span-2 flex items-end">
            <button
              onClick={generateUUIDs}
              className="w-full bg-(--primary) hover:bg-(--primary)/90 text-(--primary-foreground) px-6 py-3 rounded-lg flex justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Generate UUIDs
            </button>
          </div>
        </div>

        <div className="bg-(--muted) border border-(--border) rounded-lg p-4">
          <p className="text-(--muted-foreground) text-sm">
            <strong>UUID v4:</strong> Random • <strong>UUID v1:</strong>{" "}
            Timestamp-based
          </p>
        </div>
      </div>

      {/* Results */}
      {uuids.length > 0 && (
        <div className="bg-(--card) border border-(--border) rounded-2xl p-6 sm:p-8 shadow">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold text-(--foreground)">
              Generated UUIDs
            </h2>

            <button
              onClick={copyAll}
              className="bg-(--muted) hover:bg-(--muted)/80 text-(--foreground) px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
            >
              {copiedIndex === "all" ? (
                <Check className="text-green-500" />
              ) : (
                <Copy />
              )}
              Copy All
            </button>
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
                  className="bg-(--background) border border-(--border) px-3 py-2 rounded-lg cursor-pointer"
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
