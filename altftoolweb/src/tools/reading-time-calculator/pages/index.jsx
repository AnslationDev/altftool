"use client";

import { useCallback, useMemo, useState } from "react";
import {
  BookOpen,
  Clipboard,
  Copy,
  FileDown,
  RotateCcw,
  Trash2,
  Printer,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const SAMPLE_TEXT = `Reading is a fundamental skill that impacts every area of life. Whether you're a student absorbing new concepts, a professional staying current with industry trends, or a casual reader enjoying a novel, the speed at which you read directly affects your productivity and comprehension.

The average adult reads between 200 and 300 words per minute. However, this number varies widely depending on the complexity of the material, the reader's familiarity with the subject, and the purpose of reading. For instance, technical documentation often requires slower, more deliberate reading, while fiction can be consumed at a faster pace.

Understanding your reading speed can help you plan your study sessions, manage your reading lists, and set realistic goals for completing books and articles. This calculator provides real-time statistics so you can track your reading performance and identify areas for improvement.

Whether you're preparing for an exam, writing a blog post, or simply curious about how fast you read, this tool gives you all the metrics you need in one clean, easy-to-use interface.`;

const READING_SPEEDS = [
  { label: "Slow", wpm: 150 },
  { label: "Average", wpm: 200 },
  { label: "Fast", wpm: 250 },
  { label: "Professional", wpm: 300 },
];

const COMMON_WORDS = new Set([
  "a","an","and","are","as","at","be","by","for","from","in","is","it",
  "of","on","or","that","the","this","to","with","your","you","was",
  "were","been","being","have","has","had","do","does","did","but",
  "not","no","nor","so","if","then","than","too","very","can","will",
  "just","should","now","also","more","some","any","each","much",
]);

function StatCard({ label, value, accent }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
      <p className={`mt-2 break-words text-2xl font-semibold ${accent ? "text-[var(--primary)]" : "text-[var(--foreground)]"}`}>
        {value}
      </p>
    </div>
  );
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

function downloadPdfFile(filename, content) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>${filename}</title><style>body{font-family:system-ui,sans-serif;max-width:700px;margin:2rem auto;padding:0 1rem;color:#111827;line-height:1.6}h1{font-size:1.5rem;margin-bottom:1rem}pre{white-space:pre-wrap;word-wrap:break-word}</style></head><body><h1>${filename.replace(/\.pdf$/i, "")}</h1><pre>${content}</pre><script>window.onload=function(){window.print();window.close();}<\/script></body></html>`);
  w.document.close();
}

function getReadingDifficulty(avgWordLen, avgSentenceLen) {
  const score = avgWordLen * 0.5 + avgSentenceLen * 0.3;
  if (score < 4) return { label: "Easy", color: "text-green-600" };
  if (score < 5.5) return { label: "Medium", color: "text-yellow-600" };
  if (score < 7) return { label: "Hard", color: "text-orange-600" };
  return { label: "Very Hard", color: "text-red-600" };
}

function getReadabilityRecommendation(difficulty) {
  switch (difficulty) {
    case "Easy":
      return "Your text is easy to read. Great for a broad audience.";
    case "Medium":
      return "Moderate complexity. Suitable for general audiences with some focus.";
    case "Hard":
      return "Complex text. Consider simplifying sentences and using common words.";
    case "Very Hard":
      return "Very dense text. Break into shorter sentences and replace jargon.";
    default:
      return "";
  }
}

export default function ToolHome() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [wpm, setWpm] = useState(200);
  const [customWpm, setCustomWpm] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeSpeed, setActiveSpeed] = useState("Average");

  const handleSpeedSelect = useCallback((label, value) => {
    setActiveSpeed(label);
    setWpm(value);
    setCustomWpm("");
  }, []);

  const handleCustomWpm = useCallback((e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomWpm(val);
    if (val) {
      const num = parseInt(val, 10);
      if (num > 0 && num <= 1000) {
        setWpm(num);
        setActiveSpeed("Custom");
      }
    }
  }, []);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        words: 0, characters: 0, noSpaces: 0, sentences: 0, paragraphs: 0,
        readingMinutes: 0, speakingMinutes: 0, avgWordLength: "0",
        avgSentenceLength: "0", longestWord: "", shortestWord: "",
        uniqueWords: 0, vocabularyRichness: "0", topWords: [],
        difficulty: "Easy", difficultyColor: "text-green-600",
        recommendation: "Enter some text to see statistics.",
        keywordDensity: [],
      };
    }

    const wordList = trimmed.match(/\b[\w'-]+\b/g) || [];
    const words = wordList.length;
    const characters = text.length;
    const noSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim()).length || 0;
    const paragraphs = trimmed.split(/\n{2,}/).filter(s => s.trim()).length || 0;

    const readingMinutes = words > 0 ? Math.ceil(words / wpm) : 0;
    const speakingMinutes = words > 0 ? Math.ceil(words / 150) : 0;

    const avgWordLength = words
      ? (wordList.reduce((sum, w) => sum + w.length, 0) / words).toFixed(1)
      : "0";
    const avgSentenceLength = sentences
      ? (words / sentences).toFixed(1)
      : "0";

    const longestWord = wordList.reduce((l, w) => w.length > l.length ? w : l, "");
    const shortestWord = wordList.reduce((s, w) => (!s || w.length < s.length) ? w : s, "");

    const normalized = wordList.map(w => w.toLowerCase().replace(/^'|'$/g, ""));
    const uniqueSet = new Set(normalized);
    const uniqueWords = uniqueSet.size;
    const vocabularyRichness = words ? ((uniqueWords / words) * 100).toFixed(1) : "0";

    const frequency = new Map();
    normalized.forEach(w => {
      if (w.length < 3 || COMMON_WORDS.has(w)) return;
      frequency.set(w, (frequency.get(w) || 0) + 1);
    });
    const topWords = [...frequency.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 6);

    const allWordFreq = new Map();
    normalized.forEach(w => {
      allWordFreq.set(w, (allWordFreq.get(w) || 0) + 1);
    });
    const keywordDensity = [...allWordFreq.entries()]
      .filter(([w]) => w.length >= 4 && !COMMON_WORDS.has(w))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({ word, count, density: ((count / words) * 100).toFixed(2) }));

    const difficulty = getReadingDifficulty(parseFloat(avgWordLength), parseFloat(avgSentenceLength));

    return {
      words, characters, noSpaces, sentences, paragraphs,
      readingMinutes, speakingMinutes, avgWordLength, avgSentenceLength,
      longestWord, shortestWord, uniqueWords, vocabularyRichness,
      topWords, difficulty: difficulty.label, difficultyColor: difficulty.color,
      recommendation: getReadabilityRecommendation(difficulty.label),
      keywordDensity,
    };
  }, [text, wpm]);

  const summaryText = useMemo(() => [
    "Reading Time Calculator Results",
    "=".repeat(35),
    `Reading Time:  ${stats.readingMinutes} min`,
    `Speaking Time: ${stats.speakingMinutes} min`,
    `Words:         ${stats.words}`,
    `Characters:    ${stats.characters}`,
    `No Spaces:     ${stats.noSpaces}`,
    `Sentences:     ${stats.sentences}`,
    `Paragraphs:    ${stats.paragraphs}`,
    `Avg Word Len:  ${stats.avgWordLength}`,
    `Avg Sent Len:  ${stats.avgSentenceLength}`,
    `Longest Word:  ${stats.longestWord || "N/A"}`,
    `Shortest Word: ${stats.shortestWord || "N/A"}`,
    `Unique Words:  ${stats.uniqueWords}`,
    `Vocab Richness:${stats.vocabularyRichness}%`,
    `Difficulty:    ${stats.difficulty}`,
    `Reading Speed: ${wpm} WPM`,
    "",
    "Top Words:",
    ...stats.topWords.map(([w, c]) => `  ${w}: ${c}`),
    "",
    "Keyword Density:",
    ...stats.keywordDensity.map(k => `  ${k.word}: ${k.density}% (${k.count})`),
  ].join("\n"), [stats, wpm]);

  const handleCopy = async () => {
    setCopied(await safeCopyText(summaryText));
    setTimeout(() => setCopied(false), 1200);
  };

  const handleDownloadTxt = () => downloadTextFile("reading-time-report.txt", summaryText);
  const handleDownloadPdf = () => downloadPdfFile("reading-time-report.pdf", summaryText);
  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HERO */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <BookOpen className="h-4 w-4" />
            Writing utility
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
            Reading Time Calculator
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Estimate reading time, word count, and readability metrics for any text in real time.
          </p>
        </section>

        {/* READING SPEED SELECTOR */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="mb-3 text-lg font-semibold">Reading speed</h2>
          <div className="flex flex-wrap items-center gap-2">
            {READING_SPEEDS.map(({ label, wpm: speed }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleSpeedSelect(label, speed)}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  activeSpeed === label
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {label} <span className="ml-1 text-xs opacity-70">({speed} WPM)</span>
              </button>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={customWpm}
                onChange={handleCustomWpm}
                placeholder="Custom"
                className="w-24 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
                aria-label="Custom reading speed in words per minute"
              />
              <span className="text-xs text-[var(--muted-foreground)]">WPM</span>
            </div>
          </div>
        </section>

        {/* MAIN GRID: INPUT + STATS */}
        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
          {/* TEXT INPUT */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Text input</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setText(SAMPLE_TEXT)}
                  className="btn-secondary min-h-10 px-3 py-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Sample
                </button>
                <button
                  type="button"
                  onClick={() => setText("")}
                  className="btn-secondary min-h-10 px-3 py-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[430px] w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-7 outline-none focus:border-[var(--primary)]"
              placeholder="Paste or type your text here to calculate reading time..."
              aria-label="Text input for reading time calculation"
            />
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--muted-foreground)]">
              <span>{stats.words.toLocaleString()} words</span>
              <span>{stats.characters.toLocaleString()} characters</span>
              <span>{stats.sentences} sentences</span>
            </div>
          </div>

          {/* STATS PANEL */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="tool-card-grid">
              <StatCard label="Reading Time" value={`${stats.readingMinutes} min`} accent />
              <StatCard label="Speaking Time" value={`${stats.speakingMinutes} min`} />
              <StatCard label="Words" value={stats.words.toLocaleString()} />
              <StatCard label="Characters" value={stats.characters.toLocaleString()} />
              <StatCard label="No Spaces" value={stats.noSpaces.toLocaleString()} />
              <StatCard label="Sentences" value={stats.sentences} />
              <StatCard label="Paragraphs" value={stats.paragraphs} />
              <StatCard label="Avg Word Length" value={stats.avgWordLength} />
              <StatCard label="Avg Sentence Length" value={`${stats.avgSentenceLength} words`} />
              <StatCard label="Unique Words" value={stats.uniqueWords.toLocaleString()} />
              <StatCard label="Vocab Richness" value={`${stats.vocabularyRichness}%`} />
              <StatCard label="Reading Speed" value={`${wpm} WPM`} />
            </div>

            {/* READING DIFFICULTY */}
            <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Reading difficulty</p>
              <div className="mt-2 flex items-center gap-3">
                <span className={`text-lg font-bold ${stats.difficultyColor}`}>{stats.difficulty}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{stats.recommendation}</p>
            </div>

            {/* TOP WORDS */}
            <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Top terms</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {stats.topWords.length ? (
                  stats.topWords.map(([word, count]) => (
                    <span key={word} className="rounded-[7px] border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)]">
                      {word} <span className="text-[var(--muted-foreground)]">{count}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[var(--muted-foreground)]">Type more text to see repeated terms.</span>
                )}
              </div>
            </div>

            {/* KEYWORD DENSITY */}
            {stats.keywordDensity.length > 0 && (
              <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Keyword density</p>
                <div className="mt-3 space-y-2">
                  {stats.keywordDensity.map(({ word, count, density }) => (
                    <div key={word} className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-[var(--foreground)]">{word}</span>
                      <span className="text-[var(--muted-foreground)]">{density}% ({count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LONGEST / SHORTEST WORD */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Longest word</p>
                <p className="mt-2 break-words text-sm font-semibold text-[var(--foreground)]">
                  {stats.longestWord || "\u00A0"}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Shortest word</p>
                <p className="mt-2 break-words text-sm font-semibold text-[var(--foreground)]">
                  {stats.shortestWord || "\u00A0"}
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={handleCopy} className="btn-primary w-full">
                <Clipboard className="h-4 w-4" />
                {copied ? "Copied!" : "Copy results"}
              </button>
              <button type="button" onClick={handleDownloadTxt} className="btn-secondary w-full">
                <FileDown className="h-4 w-4" />
                Download TXT
              </button>
              <button type="button" onClick={handleDownloadPdf} className="btn-secondary w-full">
                <FileDown className="h-4 w-4" />
                Download PDF
              </button>
              <button type="button" onClick={handlePrint} className="btn-secondary w-full">
                <Printer className="h-4 w-4" />
                Print report
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
