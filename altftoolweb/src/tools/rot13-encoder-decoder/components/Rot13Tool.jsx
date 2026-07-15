"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Rot13Tool() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState("encode");
  const [error, setError] = useState("");

  // ROT13 function
  const rot13 = (text) => {
    return text.replace(/[a-zA-Z]/g, (char) => {
      const code = char.charCodeAt(0);
      if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
        const base = code >= 97 ? 97 : 65;
        return String.fromCharCode(((code - base + 13) % 26) + base);
      }
      return char;
    });
  };

  const handleTransform = () => {
    if (!inputText.trim()) {
      setError("Please enter some text.");
      return;
    }

    setError("");
    setOutputText(rot13(inputText));
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setError("");
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className=" bg-[var(--background)] p-6 rounded-xl border border-[var(--border)] text-(--muted-foreground) shadow-md">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-(--foreground) mb-2">ROT13 Encoder/Decoder</h1>
        <p className="text-sm text-(--muted-foreground)">
          Encodes or decodes text by shifting each letter 13 positions in the alphabet.
        </p>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">⚠️ {error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-(--foreground)">
              {mode === "encode" ? "Input Text" : "Text to Decode"}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={mode === "encode" ? "Enter text to encode..." : "Enter text to decode..."}
              className="w-full h-32 p-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-(--foreground) resize-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-(--foreground)">
              Result
            </label>
            <div className="relative h-32">
              <div className="w-full h-full p-3 border border-[var(--border)] rounded-lg bg-[var(--surface-soft)] text-(--muted-foreground) flex items-center justify-center font-mono">
                {outputText || (mode === "encode" ? "Encoded result will appear here..." : "Decoded result will appear here...")}
              </div>
              {outputText && (
                <button
                  onClick={() => copyToClipboard(outputText)}
                  className="absolute top-2 right-2 p-1 bg-white rounded shadow hover:bg-gray-100 transition-colors"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => {
              setMode("encode");
              setOutputText(rot13(inputText));
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${mode === "encode" ? "bg-[var(--primary)] text-white shadow-md" : "bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--surface-soft)]"}`}
          >
            Encode
          </button>
          <button
            onClick={() => {
              setMode("decode");
              setOutputText(rot13(inputText));
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${mode === "decode" ? "bg-[var(--primary)] text-white shadow-md" : "bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--surface-soft)]"}`}
          >
            Decode
          </button>
          <button
            onClick={handleTransform}
            className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:brightness-110 transition-all duration-200 font-medium shadow-md"
          >
            {mode === "encode" ? "Encode Text" : "Decode Text"}
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-soft)] transition-all duration-200 font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[var(--surface-soft)] rounded-lg">
        <h3 className="text-sm font-medium text-(--foreground) mb-2">How ROT13 Works</h3>
        <ul className="text-xs text-(--muted-foreground) space-y-1">
          <li>• ROT13 replaces each letter with the letter 13 positions ahead</li>
          <li>• Applying ROT13 twice returns text to its original form</li>
          <li>• Only letters are affected - numbers and symbols remain unchanged</li>
          <li>• Case is preserved: 'A' → 'N', 'a' → 'n', 'M' → 'Z', 'm' → 'z'</li>
        </ul>
      </div>
    </div>
  );
}
