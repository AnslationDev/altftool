"use client";
import { useState } from "react";
import { Copy, Check, Wand2 } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import Features from "./Features";

export default function Main() {
  const [inputText, setInputText] = useState("");
  const [paraphrasedText, setParaphrasedText] = useState("");
  const [mode, setMode] = useState("standard");
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const paraphrase = () => {
    if (!inputText.trim()) {
      alert("Please enter some text to paraphrase!");
      return;
    }

    // The synonym/rule substitution below is plain synchronous string work —
    // no model call, no network request — so the result is computed and
    // shown immediately, matching this tool's own "instant" copy.
    const result = generateParaphrase(inputText, mode);
    setParaphrasedText(result);
  };

  const generateParaphrase = (text, mode) => {
    // Simple paraphrasing logic using synonyms and sentence restructuring
    let result = text;

    const synonymMap = {
      // Common words
      good: ["excellent", "great", "fine", "positive"],
      bad: ["poor", "negative", "unfavorable", "adverse"],
      important: ["crucial", "significant", "vital", "essential"],
      big: ["large", "substantial", "considerable", "significant"],
      small: ["little", "minor", "modest", "compact"],
      start: ["begin", "commence", "initiate", "launch"],
      end: ["conclude", "finish", "complete", "terminate"],
      help: ["assist", "aid", "support", "facilitate"],
      show: ["demonstrate", "display", "exhibit", "reveal"],
      make: ["create", "produce", "generate", "construct"],
      think: ["believe", "consider", "suppose", "assume"],
      know: ["understand", "recognize", "comprehend", "realize"],
      want: ["desire", "wish", "need", "require"],
      use: ["utilize", "employ", "apply", "implement"],
      give: ["provide", "offer", "supply", "present"],
      find: ["discover", "locate", "identify", "determine"],
      tell: ["inform", "notify", "advise", "communicate"],
      work: ["function", "operate", "perform", "execute"],
      call: ["name", "refer to", "designate", "label"],
      try: ["attempt", "endeavor", "strive", "effort"],
      ask: ["inquire", "question", "request", "query"],
      need: ["require", "necessitate", "demand", "want"],
      feel: ["sense", "experience", "perceive", "undergo"],
      become: ["turn into", "transform into", "evolve into", "develop into"],
      leave: ["depart", "exit", "withdraw", "abandon"],
      put: ["place", "position", "set", "locate"],
      mean: ["signify", "indicate", "represent", "denote"],
      keep: ["maintain", "retain", "preserve", "sustain"],
      let: ["allow", "permit", "enable", "authorize"],
      begin: ["start", "commence", "initiate", "launch"],
      seem: ["appear", "look", "sound", "feel"],
      turn: ["rotate", "spin", "revolve", "twist"],
      problem: ["issue", "challenge", "difficulty", "concern"],
      very: ["extremely", "highly", "remarkably", "exceptionally"],
      many: ["numerous", "multiple", "several", "various"],
      also: ["additionally", "furthermore", "moreover", "likewise"],
      however: ["nevertheless", "nonetheless", "yet", "although"],
      because: ["since", "as", "due to", "owing to"],
      therefore: ["thus", "consequently", "hence", "accordingly"],
    };

    const sentences = result.split(/([.!?]+)/);

    sentences.forEach((sentence, index) => {
      if (sentence.match(/[.!?]/)) return; // Skip punctuation

      // Split while capturing whitespace runs as their own tokens so
      // multi-space gaps (e.g. a double space some writers still put
      // after a period) survive untouched when no substitution happens —
      // a plain `split(/\s+/)` + `join(" ")` used to collapse every run
      // of whitespace down to a single space.
      const tokens = sentence.split(/(\s+)/);

      const words = tokens.map((token) => {
        if (token === "" || /^\s+$/.test(token)) return token;

        // Strip only the leading/trailing punctuation (comma, quote,
        // parenthesis, colon, etc.) so it can be reattached after
        // substitution — a bare `replace(/[^\w]/g, "")` used to discard it
        // entirely, turning "good," into "excellent" with the comma gone.
        const leadingPunct = (token.match(/^[^\w]*/) || [""])[0];
        const trailingPunct = (token.match(/[^\w]*$/) || [""])[0];
        const core = token.slice(leadingPunct.length, token.length - trailingPunct.length);
        const lowerWord = core.toLowerCase();

        if (synonymMap[lowerWord]) {
          const synonyms = synonymMap[lowerWord];
          const randomSynonym =
            synonyms[Math.floor(Math.random() * synonyms.length)];

          // Preserve original capitalization
          const cased =
            core[0] === core[0].toUpperCase()
              ? randomSynonym.charAt(0).toUpperCase() + randomSynonym.slice(1)
              : randomSynonym;
          return leadingPunct + cased + trailingPunct;
        }
        return token;
      });

      sentences[index] = words.join("");
    });

    result = sentences.join("");

    // Case-insensitive word/contraction replacement that preserves the
    // capitalization of whatever was actually matched, so sentence-initial
    // occurrences ("Can't...", "Utilize...") are rewritten the same as
    // mid-sentence ones instead of being silently skipped.
    const replaceCaseInsensitive = (str, word, replacement) =>
      str.replace(new RegExp(word, "gi"), (match) =>
        match[0] === match[0].toUpperCase()
          ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
          : replacement,
      );

    // Mode-specific modifications
    if (mode === "formal") {
      result = replaceCaseInsensitive(result, "can't", "cannot");
      result = replaceCaseInsensitive(result, "won't", "will not");
      result = replaceCaseInsensitive(result, "don't", "do not");
      result = replaceCaseInsensitive(result, "doesn't", "does not");
      result = replaceCaseInsensitive(result, "isn't", "is not");
      result = replaceCaseInsensitive(result, "aren't", "are not");
    } else if (mode === "simple") {
      result = replaceCaseInsensitive(result, "utilize", "use");
      result = replaceCaseInsensitive(result, "facilitate", "help");
      result = replaceCaseInsensitive(result, "implement", "use");
      result = replaceCaseInsensitive(result, "consequently", "so");
      result = replaceCaseInsensitive(result, "additionally", "also");
    } else if (mode === "creative") {
      // Add some variety after ., ! or ? sentence endings alike, not just
      // periods, so exclamatory/interrogative writing gets the same
      // connective treatment as declarative sentences.
      result = result.replace(/([.!?]) /g, "$1 Furthermore, ");
      result = result.replace(/Furthermore, Furthermore, /g, "Moreover, ");
    }

    return result.trim();
  };

  const copyToClipboard = () => {
    if (!paraphrasedText) return;
    copy("result", paraphrasedText, { label: "paraphrased text" });
  };

  const clearAll = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Clear the original and paraphrased text? This cannot be undone.")
    ) {
      return;
    }
    setInputText("");
    setParaphrasedText("");
    resetCopyState();
  };

  const loadSample = () => {
    if (
      typeof window !== "undefined" &&
      inputText.trim() &&
      !window.confirm("Load the sample text? This will replace your current text and cannot be undone.")
    ) {
      return;
    }
    setInputText(
      "Artificial intelligence is becoming increasingly important in today's world. Many companies are using AI to improve their business operations and make better decisions. This technology can help solve complex problems and create new opportunities for growth.",
    );
    // Clear any existing output so Original Text and Paraphrased Text don't
    // end up showing a mismatched pair (sample text on the left, a
    // paraphrase of the discarded draft still on the right).
    setParaphrasedText("");
    resetCopyState();
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="heading mb-4">
          Rephrase Your Text
          <br />
          <span className="heading text-(--foreground)">Instantly</span>
        </h1>

        <p className="description max-w-2xl mx-auto">
          Generate unique paraphrased versions of your text while keeping the
          meaning.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="bg-(--background) rounded-2xl shadow-sm border border-(--border) p-6 mb-6">
        <h3 className="text-lg font-semibold text-(--foreground) mb-4">
          Paraphrasing Mode
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {["standard", "formal", "simple", "creative"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border cursor-pointer
              ${
                mode === m
                  ? "bg-(--primary) text-(--primary-foreground) border-(--primary) shadow-md"
                  : "bg-(--muted) text-(--foreground) border-(--border) hover:bg-(--card)"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-(--background) rounded-2xl shadow-sm border border-(--border) p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-(--foreground)">
              Original Text
            </h3>

            <button
              onClick={loadSample}
              className="bg-(--muted) hover:bg-(--card) border border-(--border) cursor-pointer
              text-(--foreground) font-medium px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2"
            >
              Load Sample
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter or paste your text here..."
            className="w-full h-72 sm:h-80 lg:h-96 bg-(--muted) border border-(--border) text-(--foreground) rounded-lg px-4 py-3 
          focus:outline-none focus:ring-2 focus:ring-(--primary) resize-none"
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
            <p className="text-sm text-(--muted-foreground)">
              {inputText.split(/\s+/).filter((w) => w).length} words
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="bg-(--muted) text-(--foreground) hover:bg-(--card) border border-(--border)
              font-medium px-4 py-2 rounded-lg text-sm transition-all cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={paraphrase}
                className="bg-(--primary) text-(--primary-foreground) font-semibold px-5 py-2 rounded-lg cursor-pointer
              shadow-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                <Wand2 className="w-4 h-4" />
                Paraphrase
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-(--background) rounded-2xl shadow-sm border border-(--border) p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-(--foreground)">
              Paraphrased Text
            </h3>

            {paraphrasedText && (
              <button
                type="button"
                onClick={copyToClipboard}
                aria-label={isCopied("result") ? "Copied the paraphrased text to clipboard" : "Copy the paraphrased text"}
                className="bg-(--muted) hover:bg-(--card) border border-(--border) cursor-pointer
              text-(--foreground) font-medium px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2"
              >
                {isCopied("result") ? (
                  <>
                    <Check className="w-4 h-4 text-success" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            )}
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>

          <div
            aria-live="polite"
            className="flex-1 min-h-70 sm:min-h-80 lg:min-h-96
        bg-(--muted) border border-(--border) text-(--foreground)
        rounded-lg px-4 py-3 overflow-y-auto"
          >
            {paraphrasedText ? (
              <p className="leading-relaxed whitespace-pre-wrap">
                {paraphrasedText}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Wand2 className="w-12 h-12 text-(--muted-foreground) mb-4" />
                <p className="text-(--muted-foreground)">
                  Your paraphrased text will appear here
                </p>
              </div>
            )}
          </div>

          {paraphrasedText && (
            <p className="text-sm text-(--muted-foreground) mt-4">
              {paraphrasedText.split(/\s+/).filter((w) => w).length} words
            </p>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-10">
        {[
          ["Standard", "Balanced paraphrasing"],
          ["Formal", "Professional tone"],
          ["Simple", "Easy to understand"],
          ["Creative", "Unique variations"],
        ].map(([title, desc], i) => (
          <div
            key={i}
            className="bg-(--card) rounded-xl border border-(--border) p-6 text-center 
          hover:shadow-md transition-all duration-200"
          >
            <div className="w-12 h-12 bg-(--muted) rounded-full flex items-center justify-center mx-auto mb-4">
              <Wand2 className="w-5 h-5 text-(--primary)" />
            </div>
            <h3 className="font-semibold text-(--foreground) mb-2">{title}</h3>
            <p className="text-sm text-(--muted-foreground)">{desc}</p>
          </div>
        ))}
      </div>
      <Features/>
    </main>
  );
}
