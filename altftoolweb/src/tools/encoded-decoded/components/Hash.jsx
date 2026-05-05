"use client"

import React, { useState, useEffect, useCallback } from "react";

const HashGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [hashes, setHashes] = useState({ md5: "", sha1: "", sha256: "" });

  // --- 1. MD5 Manual Logic ---
  const md5 = (str) => {
    let k = [], i = 0;
    for (; i < 64; ) k[i] = 0 | (Math.abs(Math.sin(++i)) * 4294967296);
    let b, c, d, j, x = [], str2 = unescape(encodeURIComponent(str)),
      t = str2.length, h = [b = 0x67452301, c = 0xefcdab89, ~b, ~c],
      m = [];
    for (i = 0; i < t; i++) m[i >> 2] |= (str2.charCodeAt(i) & 0xff) << ((i % 4) << 3);
    m[t >> 2] |= 0x80 << ((t % 4) << 3);
    m[((t + 8) >> 6 << 4) + 14] = t * 8;
    for (i = 0; i < m.length; i += 16) {
      let a = [...h];
      for (j = 0; j < 64; j++) {
        let f = j < 16 ? (h[1] & h[2]) | (~h[1] & h[3]) : j < 32 ? (h[3] & h[1]) | (~h[3] & h[2]) : j < 48 ? h[1] ^ h[2] ^ h[3] : h[2] ^ (h[1] | ~h[3]);
        let tmp = h[3];
        h[3] = h[2]; h[2] = h[1];
        h[1] = h[1] + ((f = h[0] + f + k[j] + (m[i + (j < 16 ? j : j < 32 ? (5 * j + 1) % 16 : j < 48 ? (3 * j + 5) % 16 : (7 * j) % 16)] | 0)) << (f = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][(j >> 4 << 2) | (j & 3)]) | f >>> (32 - f));
        h[0] = tmp;
      }
      for (j = 0; j < 4; j++) h[j] = (h[j] + a[j]) | 0;
    }
    let res = "";
    for (i = 0; i < 32; i++) res += ((h[i >> 3] >> ((i % 8) << 2)) & 0xf).toString(16);
    return res;
  };

  // --- 2. SHA Logic ---
  const generateHashes = useCallback(async (text) => {
    if (!text) {
      setHashes({ md5: "", sha1: "", sha256: "" });
      return;
    }
    try {
      const msgBuffer = new TextEncoder().encode(text);
      const getCryptoHash = async (algo) => {
        const hashBuffer = await window.crypto.subtle.digest(algo, msgBuffer);
        return Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0")).join("");
      };
      const [s1, s256] = await Promise.all([getCryptoHash("SHA-1"), getCryptoHash("SHA-256")]);
      setHashes({ md5: md5(text), sha1: s1, sha256: s256 });
    } catch (e) {
      console.error("Hashing failed", e);
    }
  }, []);

  useEffect(() => {
    generateHashes(inputText);
  }, [inputText, generateHashes]);

  const handleClear = () => {
    setInputText("");
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 border border-(--border) rounded-2xl mt-[-40]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-(--foreground)">Hash Generator Panel</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleClear} 
            className="text-1xl px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      <textarea
        placeholder="Enter text here ..."
        className="w-full h-32 p-4 mb-6 rounded-xl bg-(--card) border border-(--border) text-(--foreground) transition-all font-light text-2xl placeholder:text-gray-500/50"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <HashBox title="MD5" value={hashes.md5} />
        <HashBox title="SHA-1" value={hashes.sha1} />
        <HashBox title="SHA-256" value={hashes.sha256} />
      </div>
    </div>
  );
};

const HashBox = ({ title, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-[150px] p-6 bg-(--card) border border-(--border) rounded-xl hover:shadow-md transition-shadow group relative">
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-light text-(--foreground) opacity-30 uppercase">{title}</span>
        <button 
          onClick={handleCopy}  
          className={`text-[15px] px-2 py-1 rounded transition-all font-medium ${
            copied 
              ? "bg-blue-500 text-white" 
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="text-xl font-mono break-all text-(--foreground) opacity-80 mt-auto">
        {value || <span className="opacity-30 italic font-sans text-[18px]">Waiting for input...</span>}
      </div>
    </div>
  );
};

export default HashGenerator;