"use client";

import { useState } from "react";
import Toast from "./Toast";

export default function EncoderDecoder() {
  const [input, setInput] = useState(
    "https://www.example.com/?name=Nilesh & age=25"
  );
  const [output, setOutput] = useState("");
  const [toastMsg, setToastMsg] = useState("");

const encodeURL = () => {
  if (!input.trim()) {
    setToastMsg("Please enter a URL to encode");
    return;
  }

  setOutput(encodeURIComponent(input.trim()));
  setToastMsg("URL Encoded!");
};

const decodeURL = () => {
  if (!input.trim()) {
    setToastMsg("Please enter a URL to decode");
    return;
  }

  try {
    setOutput(decodeURIComponent(input.trim()));
    setToastMsg("URL Decoded!");
  } catch {
    setOutput("");
    setToastMsg("Invalid encoded URL");
  }
};


  const clearAll = () => {
    setInput("");
    setOutput("");
      setToastMsg("Cleared!");
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setToastMsg("Copied!");
  };

  return (
    <div className="w-full grid gap-12">

      {/* INPUT SECTION */}
      <section>
        <h2 className="subheading mb-3">Input</h2>

        <textarea
          className="
            w-full h-48 p-4 rounded-xl resize-none
            bg-(--card)
            text-(--foreground)
            border border-(--border)
            placeholder:text-(--muted-foreground)
            focus:outline-none
            focus:ring-2 focus:ring-(--primary)
            transition-all
          "
          placeholder="Paste URL or text..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-5">

          <button
            onClick={encodeURL}
            className="
              flex-1 py-3 rounded-xl font-medium
              bg-(--primary)
              text-(--primary-foreground)
              hover:opacity-90
              active:scale-[0.98]
              transition-all cursor-pointer
            "
          >
            Encode
          </button>

          <button
            onClick={decodeURL}
            className="
              flex-1 py-3 rounded-xl font-medium
              border border-(--primary)
              text-(--primary)
              hover:bg-(--primary)
              hover:text-(--primary-foreground)
              active:scale-[0.98]
              transition-all cursor-pointer
            "
          >
            Decode
          </button>

          <button
            onClick={clearAll}
            className="
              flex-1 py-3 rounded-xl font-medium
              bg-(--muted)
              text-(--foreground)
              border border-(--border)
              hover:opacity-90
              active:scale-[0.98]
              transition-all cursor-pointer
            "
          >
            Clear
          </button>

        </div>
      </section>

      {/* OUTPUT SECTION */}
      <section>
        <h2 className="subheading mb-3">Output</h2>

        <textarea
          className="
            w-full h-48 p-4 rounded-xl resize-none
            bg-(--card)
            text-(--foreground)
            border border-(--border)
            focus:outline-none
          "
          placeholder="Result will appear here..."
          value={output}
          readOnly
        />

        <div className="mt-5">
          <button
            onClick={copyOutput}
            disabled={!output}
            className="
              px-6 py-2 rounded-xl font-medium
              bg-(--primary)
              text-(--primary-foreground)
              hover:opacity-90
              active:scale-[0.98]
              transition-all
              disabled:opacity-40 cursor-pointer
            "
          >
            Copy
          </button>
        </div>
      </section>

      {/* Toast */}
      {toastMsg && (
        <Toast message={toastMsg} onClose={() => setToastMsg("")} />
      )}

    </div>
  );
}
