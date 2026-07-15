"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  Clipboard,
  Download,
  FileJson,
  Languages,
  Loader2,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Wand2,
} from "lucide-react";
import Header from "../components/Header";
import Panel from "../components/Panel";
import IconButton from "../components/IconButton";
import CompareBlock from "../components/CompareBlock";
import EmptyState from "../components/EmptyState";
import Features from "../components/Features";
import {
  HISTORY_LIMIT,
  MAX_INPUT_LENGTH,
  SCRIPT_LABELS,
  STORAGE_KEY,
  analyzeText,
  downloadText,
  safeReadState,
} from "../utils/segmentationUtils";
import { translateText } from "../../text-translator/utils/translate";

const TRANSLATION_TARGETS = {
  chinese: [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
  ],
  english: [{ code: "zh-CN", label: "Chinese" }],
  hindi: [{ code: "zh-CN", label: "Chinese" }],
  mixed: [
    { code: "zh-CN", label: "Chinese" },
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
  ],
};

const SOURCE_LANGUAGE_CODES = {
  chinese: "zh-CN",
  english: "en",
  hindi: "hi",
  mixed: "auto",
  unknown: "auto",
};

export default function ToolHome() {
  const savedState = useMemo(() => safeReadState(), []);
  const [inputText, setInputText] = useState(savedState.inputText || "");
  const [meaningSource, setMeaningSource] = useState(savedState.meaningSource || "");
  const [showMeanings, setShowMeanings] = useState(Boolean(savedState.showMeanings));
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState(Array.isArray(savedState.history) ? savedState.history : []);
  const [notice, setNotice] = useState("");
  const [translations, setTranslations] = useState([]);
  const [translationStatus, setTranslationStatus] = useState("idle");
  const [translationError, setTranslationError] = useState("");

  const analysis = useMemo(() => analyzeText(inputText, meaningSource), [inputText, meaningSource]);
  const filteredTokens = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return analysis.tokens;
    return analysis.tokens.filter(
      (token) =>
        token.value.toLowerCase().includes(needle) ||
        token.label.toLowerCase().includes(needle) ||
        token.meaning.toLowerCase().includes(needle)
    );
  }, [analysis.tokens, search]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ inputText, meaningSource, showMeanings, history })
    );
  }, [inputText, meaningSource, showMeanings, history]);

  useEffect(() => {
    const text = analysis.original.trim();
    if (!text) {
      const resetId = window.setTimeout(() => {
        setTranslations([]);
        setTranslationStatus("idle");
        setTranslationError("");
      }, 0);
      return () => window.clearTimeout(resetId);
    }

    const targets = TRANSLATION_TARGETS[analysis.language.type] || TRANSLATION_TARGETS.mixed;
    const sourceLang = SOURCE_LANGUAGE_CODES[analysis.language.type] || SOURCE_LANGUAGE_CODES.unknown;
    const requestId = window.setTimeout(async () => {
      setTranslationStatus("loading");
      setTranslationError("");

      try {
        const rows = await Promise.all(
          targets.map(async (target) => ({
            ...target,
            text: await translateText(text, sourceLang, target.code),
          }))
        );
        setTranslations(rows.filter((row) => row.text));
        setTranslationStatus("done");
      } catch {
        setTranslations([]);
        setTranslationStatus("error");
        setTranslationError("Translation failed. Please check your internet connection and try again.");
      }
    }, 450);

    return () => window.clearTimeout(requestId);
  }, [analysis.original, analysis.language.type]);

  const flash = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  };

  const saveSnapshot = () => {
    if (!analysis.original.trim()) return flash("Add text before saving.");
    const snapshot = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      preview: analysis.original.slice(0, 90),
      language: analysis.language.label,
      wordCount: analysis.wordCount,
      original: analysis.original,
      segmentedText: analysis.segmentedText,
      tokens: analysis.tokens.map(({ value, script, label, length, meaning }) => ({
        value,
        script,
        label,
        length,
        meaning,
      })),
      translations,
    };
    setHistory((current) =>
      [snapshot, ...current.filter((item) => item.original !== snapshot.original)].slice(0, HISTORY_LIMIT)
    );
    flash("Result saved to history.");
  };

  const copySegmented = async () => {
    if (!analysis.segmentedText) return flash("Nothing to copy yet.");
    await navigator.clipboard.writeText(analysis.segmentedText);
    flash("Segmented text copied.");
  };

  const copyMeanings = async () => {
    const rows = analysis.tokens
      .filter((token) => token.meaning)
      .map((token) => `${token.value}: ${token.meaning}`);
    if (!rows.length) return flash("No meaning rows available.");
    await navigator.clipboard.writeText(rows.join("\n"));
    flash("Meaning rows copied.");
  };

  const copyTranslations = async () => {
    const rows = translations.map((item) => `${item.label}: ${item.text}`);
    if (!rows.length) return flash("No translation available yet.");
    await navigator.clipboard.writeText(rows.join("\n"));
    flash("Translations copied.");
  };

  const exportJson = () => {
    downloadText(
      "language-segmentation-result.json",
      JSON.stringify(
        {
          original: analysis.original,
          detectedLanguage: analysis.language,
          segmentedText: analysis.segmentedText,
          wordCount: analysis.wordCount,
          characterCount: analysis.charCount,
          translations,
          tokens: analysis.tokens,
        },
        null,
        2
      ),
      "application/json;charset=utf-8"
    );
    flash("JSON exported.");
  };

  const exportTxt = () => {
    downloadText(
      "language-segmentation-result.txt",
      [
        `Detected language: ${analysis.language.label}`,
        `Words: ${analysis.wordCount}`,
        `Characters: ${analysis.charCount}`,
        "",
        "Original:",
        analysis.original,
        "",
        "Segmented:",
        analysis.segmentedText,
        "",
        "Translations:",
        translations.length
          ? translations.map((item) => `${item.label}: ${item.text}`).join("\n")
          : "No translation available.",
      ].join("\n")
    );
    flash("TXT exported.");
  };

  const resetAll = () => {
    setInputText("");
    setSearch("");
    flash("Workspace cleared.");
  };

  return (
    <main className="min-h-screen max-w-full overflow-hidden rounded-[2rem] bg-[var(--background)] text-[var(--foreground)]">
      <div className="relative isolate px-3 py-4 sm:px-5 lg:px-6">
        <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(37,99,235,0.2),transparent_30%)]" />

        <section className="mx-auto max-w-7xl space-y-4">
          <Header analysis={analysis} />

          {notice && (
            <div className="fixed right-4 top-4 z-50 rounded-2xl border border-emerald-400/40 bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-xl">
              {notice}
            </div>
          )}

          <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
            <div className="min-w-0 space-y-4">
              <div className="grid min-w-0 gap-4 2xl:grid-cols-2">
                <Panel title="Input Panel" icon={Wand2}>
                  <textarea
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    placeholder="Paste Chinese, English, Hindi, or mixed-language text..."
                    className="min-h-56 w-full max-w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30 [overflow-wrap:anywhere]"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="min-w-0 break-words text-xs text-[var(--muted-foreground)]">
                      {analysis.truncated
                        ? `Input limited to ${MAX_INPUT_LENGTH} characters for responsive parsing.`
                        : "Updates as you type. No backend required."}
                    </p>
                    <div className="flex min-w-0 flex-wrap gap-2">
                      <IconButton icon={RotateCcw} label="Clear" onClick={resetAll} disabled={!inputText} />
                      <IconButton icon={Save} label="Save" onClick={saveSnapshot} disabled={!analysis.tokens.length} />
                    </div>
                  </div>
                </Panel>

                <Panel title="Language Detection" icon={Languages}>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/80 p-3">
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                      <div className="min-w-[12rem] flex-1">
                        <p className="text-xs uppercase text-[var(--muted-foreground)]">Detected</p>
                        <h2 className="mt-1 break-words text-xl font-black leading-tight [overflow-wrap:anywhere] sm:text-2xl">
                          {analysis.language.label}
                        </h2>
                      </div>
                      <div className="shrink-0 rounded-full border border-cyan-400/30 bg-cyan-500/10 p-3">
                        <Languages className="h-5 w-5 text-cyan-500" />
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
                      <div
                        className="h-full rounded-full bg-cyan-500 transition-all duration-300"
                        style={{
                          width: `${Math.max(
                            analysis.language.confidence,
                            analysis.language.type === "mixed" ? 100 : 6
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 grid min-w-0 grid-cols-2 gap-2">
                    {["chinese", "english", "hindi", "number"].map((key) => (
                      <div key={key} className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)]/70 p-3">
                        <p className="truncate text-xs text-[var(--muted-foreground)]">{SCRIPT_LABELS[key]}</p>
                        <p className="break-words text-xl font-black">{analysis.language.counts[key] || 0}</p>
                      </div>
                    ))}
                  </div>

                  {!analysis.original.trim() && (
                    <p className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--background)]/70 p-3 text-sm text-[var(--muted-foreground)]">
                      Type text to start detection and segmentation.
                    </p>
                  )}
                </Panel>

                <div className="2xl:col-span-2">
                  <Panel title="Comparison View" icon={Check}>
                    <div className="grid gap-4">
                      <CompareBlock label="Original Text" value={analysis.original || "No input yet."} />
                      <CompareBlock label="Segmented Version" value={analysis.segmentedText || "No segmentation yet."} />
                    </div>
                  </Panel>
                </div>
              </div>

            </div>

            <aside className="min-w-0 space-y-4">
              <Panel title="Meaning Layer" icon={Languages} compact>
                <label className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)]/70 p-3 text-sm font-semibold">
                  <span className="min-w-0 break-words">Show user-provided meanings</span>
                  <input
                    type="checkbox"
                    checked={showMeanings}
                    onChange={(event) => setShowMeanings(event.target.checked)}
                    className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  />
                </label>
                <textarea
                  value={meaningSource}
                  onChange={(event) => setMeaningSource(event.target.value)}
                  placeholder={"Add optional mappings, one per line:\n中文 = Chinese language\n学习 = study"}
                  className="mt-3 min-h-20 w-full max-w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 outline-none transition focus:border-[var(--primary)] [overflow-wrap:anywhere]"
                />
                {showMeanings && (
                  <div className="mt-3 max-h-32 space-y-2 overflow-y-auto pr-1">
                    {analysis.tokens.filter((token) => token.meaning).length ? (
                      analysis.tokens
                        .filter((token) => token.meaning)
                        .map((token, index) => (
                          <div key={`${token.value}-${index}`} className="min-w-0 max-w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]/70 p-2.5">
                            <p className="break-words font-bold [overflow-wrap:anywhere]">{token.value}</p>
                            <p className="break-words text-sm text-[var(--muted-foreground)] [overflow-wrap:anywhere]">{token.meaning}</p>
                          </div>
                        ))
                    ) : (
                      <EmptyState text="Add mappings to display meanings without fake translation." compact />
                    )}
                  </div>
                )}
                <div className="mt-3">
                  <IconButton icon={Clipboard} label="Copy meanings" onClick={copyMeanings} disabled={!analysis.tokens.some((token) => token.meaning)} />
                </div>
              </Panel>

              <Panel title="Auto Translation Split" icon={Languages} compact>
                <div className="space-y-2">
                  {translationStatus === "loading" && (
                    <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)]/70 p-3 text-sm text-[var(--muted-foreground)]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Translating...
                    </div>
                  )}

                  {translationStatus === "error" && (
                    <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-500">
                      {translationError}
                    </div>
                  )}

                  {translations.length ? (
                    translations.map((item) => (
                      <div key={item.code} className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)]/70 p-3">
                        <p className="mb-1 text-[11px] font-bold uppercase text-[var(--muted-foreground)]">
                          {item.label}
                        </p>
                        <p className="break-words text-sm font-semibold leading-6 [overflow-wrap:anywhere]">
                          {item.text}
                        </p>
                      </div>
                    ))
                  ) : (
                    translationStatus !== "loading" &&
                    translationStatus !== "error" && (
                      <EmptyState text="Translations will appear here after you type." compact />
                    )
                  )}
                </div>
                <div className="mt-3">
                  <IconButton icon={Clipboard} label="Copy translations" onClick={copyTranslations} disabled={!translations.length} />
                </div>
              </Panel>

              <Panel title="History" icon={Save}>
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {history.length ? (
                    history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setInputText(item.original)}
                        className="w-full min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]/70 p-3 text-left transition hover:border-[var(--primary)]"
                      >
                        <div className="flex min-w-0 items-center justify-between gap-3">
                          <span className="min-w-0 truncate rounded-full bg-cyan-500/10 px-2 py-1 text-[10px] font-bold uppercase text-cyan-500">
                            {item.language}
                          </span>
                          <span className="shrink-0 text-xs text-[var(--muted-foreground)]">{item.wordCount} tokens</span>
                        </div>
                        <p className="mt-2 max-h-10 overflow-hidden break-words text-sm font-semibold leading-5 [overflow-wrap:anywhere]">{item.preview}</p>
                      </button>
                    ))
                  ) : (
                    <EmptyState text="Saved results will appear here." />
                  )}
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      setHistory([]);
                      flash("History cleared.");
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-400/30 px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear history
                  </button>
                )}
              </Panel>

              <Panel title="Segmentation Output" icon={BookOpen} compact>
                <div className="mb-3 flex flex-col gap-2">
                  <div className="relative min-w-0">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search tokens, scripts, or meanings"
                      className="w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--primary)]"
                    />
                  </div>
                  <div className="flex min-w-0 flex-wrap gap-2">
                    <IconButton icon={Clipboard} label="Copy" onClick={copySegmented} disabled={!analysis.tokens.length} />
                    <IconButton icon={Download} label="TXT" onClick={exportTxt} disabled={!analysis.tokens.length} />
                    <IconButton icon={FileJson} label="JSON" onClick={exportJson} disabled={!analysis.tokens.length} />
                  </div>
                </div>

                <div className="min-h-24 min-w-0 max-w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]/70 p-3">
                  {filteredTokens.length ? (
                    <div className="flex max-h-28 min-w-0 max-w-full flex-wrap gap-2 overflow-y-auto overflow-x-hidden pr-1">
                      {filteredTokens.map((token, index) => (
                        <span
                          key={`${token.id}-${index}`}
                          className="inline-flex max-w-full min-w-0 flex-wrap items-baseline gap-x-2 break-words rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-sm shadow-sm transition hover:border-cyan-400/50 hover:shadow-md [overflow-wrap:anywhere]"
                          title={`${token.label}${token.meaning ? `: ${token.meaning}` : ""}`}
                        >
                          <span className="min-w-0 max-w-full break-words font-semibold [overflow-wrap:anywhere]">
                            {token.value}
                          </span>
                          <span className="shrink-0 text-[10px] uppercase text-[var(--muted-foreground)]">{token.label}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text={analysis.tokens.length ? "No tokens match your search." : "Segmented words will appear here."} />
                  )}
                </div>
              </Panel>

            </aside>
          </section>

          <Features />
        </section>
      </div>
    </main>
  );
}
