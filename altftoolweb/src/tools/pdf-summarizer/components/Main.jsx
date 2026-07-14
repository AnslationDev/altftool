"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Clock,
  Copy,
  Download,
  FileText,
  Info,
  Loader2,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const MAX_PDF_BYTES = 80 * 1024 * 1024;

const SUMMARY_MODES = {
  short: { label: "Short", description: "1-2 key sentences" },
  medium: { label: "Medium", description: "Core ideas in a paragraph" },
  detailed: { label: "Detailed", description: "Thorough multi-paragraph overview" },
  bullets: { label: "Bullet Points", description: "Key points as a list" },
  executive: { label: "Executive", description: "High-level decision-ready brief" },
};

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function sanitizeFileName(name) {
  return (
    name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "pdf-summary"
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function estimateReadingTime(wordCount) {
  const minutes = Math.max(1, Math.round(wordCount / 200));
  return `${minutes} min read`;
}

function extractKeywords(text, topN = 12) {
  const stopWords = new Set([
    "the","a","an","and","or","but","in","on","at","to","for","of","with","by",
    "from","is","it","its","this","that","are","was","were","be","been","being",
    "have","has","had","do","does","did","will","would","could","should","may",
    "might","shall","can","not","no","so","if","then","than","too","very",
    "just","about","above","after","again","all","also","any","as","because",
    "before","between","both","each","few","more","most","other","some","such",
    "into","only","own","same","through","during","out","up","down","off",
    "over","under","further","here","there","when","where","why","how","what",
    "which","who","whom","these","those","am","he","she","they","them","we",
    "his","her","their","our","my","your","me","us","him","myself","himself",
    "herself","itself","ourselves","yourselves","themselves","s","t","don","now",
    "nor","yet","either","neither","every","much","many","still","already",
    "even","well","back","just","only","also","often","never","always",
    "sometimes","however","therefore","moreover","furthermore","although",
    "though","while","since","unless","until","whether","within","without",
    "among","along","across","behind","beyond","around","upon","below",
    "beside","besides","toward","towards","per","via","etc","new","one",
    "two","first","last","also","used","using","use","using","based","made",
    "like","including","including","known","called","become","became","make",
    "made","may","must","shall","need","able","see","also","see","given",
    "let","set","put","get","got","take","took","come","came","go","went",
    "gone","say","said","know","knew","known","think","thought","find","found",
    "tell","told","ask","asked","work","works","worked","try","tried","leave",
    "left","call","called","keep","kept","turn","turned","move","moved",
    "live","lived","believe","believed","hold","held","bring","brought",
    "happen","happened","write","wrote","written","provide","provided",
    "sit","sat","stand","stood","lose","lost","pay","paid","meet","met",
    "include","included","continue","continued","set","learn","learned",
    "change","changed","lead","led","understand","understood","watch","watched",
    "follow","followed","stop","stopped","create","created","speak","spoke",
    "read","allow","added","next","year","years","time","people","way",
    "day","man","woman","child","world","life","hand","part","place",
    "case","week","company","system","program","question","work","government",
    "number","night","point","home","water","room","mother","area","money",
    "story","fact","month","lot","right","study","book","eye","job","word",
    "business","issue","side","kind","head","house","service","friend",
    "father","power","hour","game","line","end","member","members","law",
    "car","city","community","name","president","team","minute","idea",
    "body","information","back","parent","face","others","level","office",
    "door","health","person","art","war","history","party","result","change",
    "morning","reason","research","girl","guy","moment","air","teacher",
    "force","education","dog","cat","table","chair","desk","paper","pen",
    "food","music","color","image","page","web","site","data","file",
    "text","list","form","type","size","name","value","item","class",
    "order","group","case","model","plan","view","role","process","key",
    "state","condition","table","column","row","field","record","entry",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const freq = new Map();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

function splitSentences(text) {
  if (!text) return [];
  const raw = text
    .replace(/\n{2,}/g, " __PARA__ ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = raw.split(/(?<=[.!?])\s+(?=[A-Z\d"\u201C\u2018])/);
  const sentences = [];

  for (const token of tokens) {
    const parts = token.split(" __PARA__ ");
    for (const part of parts) {
      const cleaned = part.trim();
      if (cleaned.length >= 15) {
        sentences.push(cleaned);
      }
    }
  }

  return sentences;
}

function computeWordFrequencies(sentences) {
  const stopWords = new Set([
    "the","a","an","and","or","but","in","on","at","to","for","of","with","by",
    "from","is","it","its","this","that","are","was","were","be","been","being",
    "have","has","had","do","does","did","will","would","could","should","may",
    "might","shall","can","not","no","so","if","then","than","too","very",
    "just","about","above","after","again","all","also","any","as","because",
    "before","between","both","each","few","more","most","other","some","such",
    "into","only","own","same","through","during","out","up","down","off",
    "over","under","further","here","there","when","where","why","how","what",
    "which","who","whom","these","those","am","he","she","they","them","we",
    "his","her","their","our","my","your","me","us","him","new","one","two",
    "first","last","used","using","use","based","made","like","including",
    "known","called","become","may","shall","see","given","let","set","get",
    "say","said","know","knew","think","thought","find","found","tell","told",
    "ask","asked","try","tried","leave","left","call","called","keep","kept",
    "turn","turned","move","moved","live","lived","hold","held","bring","brought",
    "happen","happened","write","wrote","written","provide","provided","sit",
    "sit","stand","stood","lose","lost","pay","paid","meet","met","include",
    "included","continue","continued","learn","learned","change","changed",
    "lead","led","understand","understood","watch","watched","follow","followed",
    "stop","stopped","create","created","speak","spoke","read","allow","added",
    "next","year","years","time","people","way","day","man","woman","child",
    "world","life","hand","part","place","case","week","company","system",
    "program","question","work","government","number","night","point","home",
    "water","room","mother","area","money","story","fact","month","lot","right",
    "study","book","eye","job","word","business","issue","side","kind","head",
    "house","service","friend","father","power","hour","game","line","end",
    "member","law","car","city","community","name","president","team","minute",
    "idea","body","information","back","parent","face","level","office","door",
    "health","person","art","war","history","party","result","morning","reason",
    "research","girl","guy","moment","air","teacher","force","education",
  ]);

  const freq = new Map();
  let totalWords = 0;

  for (const sentence of sentences) {
    const words = sentence
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    for (const word of words) {
      freq.set(word, (freq.get(word) || 0) + 1);
      totalWords++;
    }
  }

  for (const [word, count] of freq) {
    freq.set(word, count / (totalWords || 1));
  }

  return freq;
}

function scoreSentence(sentence, wordFreqs, sentenceIndex, totalSentences) {
  const words = sentence
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  let score = 0;
  for (const word of words) {
    score += wordFreqs.get(word) || 0;
  }

  if (words.length > 0) {
    score /= words.length;
  }

  if (sentenceIndex === 0) score *= 1.4;
  else if (sentenceIndex === 1) score *= 1.2;
  else if (sentenceIndex === totalSentences - 1) score *= 1.3;
  else if (sentenceIndex === totalSentences - 2) score *= 1.1;

  if (sentenceIndex <= Math.floor(totalSentences * 0.15)) score *= 1.15;

  if (/\d+/.test(sentence)) score *= 1.08;

  if (/[A-Z][a-z]+ [A-Z][a-z]+/.test(sentence)) score *= 1.05;

  if (/\b(important|significant|key|main|primary|conclusion|result|finding|showed|demonstrated|indicates|suggests|therefore|however|furthermore|in conclusion|to summarize|in summary)\b/i.test(sentence)) {
    score *= 1.25;
  }

  if (sentence.endsWith(".") || sentence.endsWith("!") || sentence.endsWith("?")) {
    score *= 1.02;
  }

  return score;
}

function generateSummary(pages, mode) {
  const fullText = pages.map((p) => p.text).join("\n\n");
  const sentences = splitSentences(fullText);

  if (sentences.length === 0) return "No text could be extracted from this PDF.";
  if (sentences.length <= 2) return fullText;

  const wordFreqs = computeWordFrequencies(sentences);

  const scored = sentences.map((sentence, index) => ({
    sentence,
    score: scoreSentence(sentence, wordFreqs, index, sentences.length),
    index,
  }));

  if (mode === "short") {
    const top2 = [...scored].sort((a, b) => b.score - a.score).slice(0, 2);
    top2.sort((a, b) => a.index - b.index);
    return top2.map((s) => s.sentence).join(" ");
  }

  if (mode === "medium") {
    const top4 = [...scored].sort((a, b) => b.score - a.score).slice(0, 4);
    top4.sort((a, b) => a.index - b.index);
    return top4.map((s) => s.sentence).join(" ");
  }

  if (mode === "detailed") {
    const count = Math.min(sentences.length, Math.max(6, Math.ceil(sentences.length * 0.35)));
    const top = [...scored].sort((a, b) => b.score - a.score).slice(0, count);
    top.sort((a, b) => a.index - b.index);

    const paragraphs = [];
    let currentPara = [];
    let lastIdx = -2;

    for (const item of top) {
      if (item.index - lastIdx > 2 && currentPara.length >= 2) {
        paragraphs.push(currentPara.join(" "));
        currentPara = [];
      }
      currentPara.push(item.sentence);
      lastIdx = item.index;
    }
    if (currentPara.length) paragraphs.push(currentPara.join(" "));

    return paragraphs.join("\n\n");
  }

  if (mode === "bullets") {
    const count = Math.min(sentences.length, Math.max(5, Math.ceil(sentences.length * 0.25)));
    const top = [...scored].sort((a, b) => b.score - a.score).slice(0, count);
    top.sort((a, b) => a.index - b.index);
    return top.map((s) => `\u2022 ${s.sentence}`).join("\n");
  }

  if (mode === "executive") {
    const first = scored[0]?.sentence || "";
    const last = scored[scored.length - 1]?.sentence || "";
    const ranked = [...scored]
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    const keyPoints = ranked.filter(
      (s) => s.index !== 0 && s.index !== scored.length - 1,
    );
    const seen = new Set();
    const uniquePoints = [];
    for (const p of keyPoints) {
      if (!seen.has(p.index)) {
        seen.add(p.index);
        uniquePoints.push(p.sentence);
      }
    }

    const lines = ["Executive Summary:", ""];
    if (first) lines.push(first);
    lines.push("");
    if (uniquePoints.length > 0) {
      lines.push("Key Points:");
      for (const point of uniquePoints.slice(0, 4)) {
        lines.push(`\u2022 ${point}`);
      }
    }
    if (last && last !== first) {
      lines.push("");
      lines.push(`Conclusion: ${last}`);
    }

    return lines.join("\n");
  }

  const top4 = [...scored].sort((a, b) => b.score - a.score).slice(0, 4);
  top4.sort((a, b) => a.index - b.index);
  return top4.map((s) => s.sentence).join(" ");
}

function highlightText(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="rounded bg-yellow-200 px-0.5 text-(--foreground) dark:bg-yellow-700">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-(--border) bg-(--card) p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
            {label}
          </p>
          <p className="text-xl font-bold text-(--foreground)">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function MainComponent() {
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [activePreviewPage, setActivePreviewPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [summaryMode, setSummaryMode] = useState("medium");
  const [summary, setSummary] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchIndex, setSearchIndex] = useState(0);

  const fileInputRef = useRef(null);
  const pdfDocRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadPdfJs = async () => {
      try {
        const pdfjs = await import(
          /* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.min.mjs"
        );
        if (!mounted) return;
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs";
        setPdfjsLib(pdfjs);
      } catch (err) {
        if (mounted) {
          console.info("PDF engine is still loading.", err);
        }
      }
    };

    loadPdfJs();

    return () => {
      mounted = false;
      if (pdfDocRef.current?.destroy) {
        pdfDocRef.current.destroy();
      }
    };
  }, []);

  const totalWordCount = useMemo(() => {
    if (!pages.length) return 0;
    return pages.reduce((sum, p) => {
      const words = p.text.trim() ? p.text.trim().split(/\s+/).length : 0;
      return sum + words;
    }, 0);
  }, [pages]);

  const fullText = useMemo(() => pages.map((p) => p.text).join("\n\n"), [pages]);

  const keywords = useMemo(() => {
    if (!fullText) return [];
    return extractKeywords(fullText);
  }, [fullText]);

  const summaryWordCount = useMemo(() => {
    if (!summary) return 0;
    return summary.trim().split(/\s+/).length;
  }, [summary]);

  const currentPreviewPage = pages[activePreviewPage - 1] || null;

  const processPdfFile = useCallback(
    async (nextFile) => {
      if (!nextFile) return;
      if (
        nextFile.type !== "application/pdf" &&
        !nextFile.name.toLowerCase().endsWith(".pdf")
      ) {
        setError("Please select a valid PDF file.");
        return;
      }
      if (nextFile.size > MAX_PDF_BYTES) {
        setError(`PDF must be under ${formatBytes(MAX_PDF_BYTES)}.`);
        return;
      }
      if (!pdfjsLib) {
        setError("PDF engine is still loading. Try again in a moment.");
        return;
      }

      if (pdfDocRef.current?.destroy) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }

      setFile(nextFile);
      setPages([]);
      setPageCount(0);
      setSummary("");
      setActivePreviewPage(1);
      setSearchQuery("");
      setSearchResults([]);
      setError("");
      setCopied(false);
      setStatus("Reading PDF text layers...");
      setProgress({ done: 0, total: 0 });
      setIsLoadingPdf(true);
      setIsExtracting(true);

      try {
        const data = new Uint8Array(await nextFile.arrayBuffer());
        const loadingTask = pdfjsLib.getDocument({ data, useSystemFonts: true });
        const pdf = await loadingTask.promise;
        pdfDocRef.current = pdf;
        setPageCount(pdf.numPages);
        setProgress({ done: 0, total: pdf.numPages });

        const extractedPages = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const textContent = await page.getTextContent();
          const items = textContent.items || [];

          const lines = [];
          let currentLine = [];

          for (const item of items) {
            currentLine.push(item.str);

            if (item.hasEOL) {
              lines.push(currentLine.join(" ").replace(/\s+/g, " ").trim());
              currentLine = [];
            }
          }

          if (currentLine.length > 0) {
            lines.push(currentLine.join(" ").replace(/\s+/g, " ").trim());
          }

          const paragraphs = [];
          let currentParagraph = [];

          for (const line of lines) {
            if (!line) {
              if (currentParagraph.length > 0) {
                paragraphs.push(currentParagraph.join(" "));
                currentParagraph = [];
              }
              continue;
            }

            const isShortLine = line.length < 60;
            const endsWithPeriod = /[.!?;:]\s*$/.test(line);
            const startsWithCapital = /^[A-Z\u00C0-\u024F\d]/.test(line);

            if (
              currentParagraph.length > 0 &&
              !endsWithPeriod &&
              !startsWithCapital &&
              isShortLine
            ) {
              currentParagraph.push(line);
            } else if (
              currentParagraph.length > 0 &&
              (endsWithPeriod || startsWithCapital) &&
              !isShortLine
            ) {
              currentParagraph.push(line);
            } else if (
              currentParagraph.length > 0 &&
              !endsWithPeriod &&
              !isShortLine
            ) {
              currentParagraph.push(line);
            } else {
              if (currentParagraph.length > 0) {
                paragraphs.push(currentParagraph.join(" "));
                currentParagraph = [];
              }
              currentParagraph.push(line);
            }
          }

          if (currentParagraph.length > 0) {
            paragraphs.push(currentParagraph.join(" "));
          }

          const text = paragraphs.join("\n\n");

          extractedPages.push({ pageNumber, text, lines, paragraphs });
          setProgress({ done: pageNumber, total: pdf.numPages });
        }

        setPages(extractedPages);
        const totalWords = extractedPages.reduce((sum, p) => {
          return sum + (p.text.trim() ? p.text.trim().split(/\s+/).length : 0);
        }, 0);
        const emptyPages = extractedPages.filter((p) => !p.text).length;

        if (emptyPages === extractedPages.length) {
          setStatus("");
          setError(
            "This PDF appears to be scanned or image-based. No selectable text was found. Try a text-based PDF.",
          );
        } else {
          setStatus(
            `Extracted ${totalWords.toLocaleString("en-IN")} words from ${extractedPages.length} page${extractedPages.length === 1 ? "" : "s"}.${emptyPages ? ` ${emptyPages} page${emptyPages === 1 ? "" : "s"} had no text.` : ""}`,
          );
        }
      } catch (err) {
        console.info("PDF extraction failed:", err);
        setError(
          err?.message ||
            "Could not read this PDF. It may be password-protected or corrupted.",
        );
        setStatus("");
      } finally {
        setIsLoadingPdf(false);
        setIsExtracting(false);
      }
    },
    [pdfjsLib],
  );

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    processPdfFile(event.dataTransfer.files?.[0]);
  };

  const resetTool = () => {
    setFile(null);
    setPages([]);
    setPageCount(0);
    setActivePreviewPage(1);
    setZoom(1);
    setSummary("");
    setSummaryMode("medium");
    setSearchQuery("");
    setSearchResults([]);
    setSearchIndex(0);
    setProgress({ done: 0, total: 0 });
    setStatus("");
    setError("");
    setCopied(false);
    if (pdfDocRef.current?.destroy) {
      pdfDocRef.current.destroy();
    }
    pdfDocRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerateSummary = () => {
    if (!pages.length) return;
    setIsGenerating(true);
    setSummary("");
    setError("");

    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          const result = generateSummary(pages, summaryMode);
          setSummary(result);
          if (!result || result.startsWith("No text")) {
            setError("Could not generate a summary. The extracted text may be too short.");
          }
        } catch (err) {
          console.error("Summary generation failed:", err);
          setError("Summary generation failed. Please try again.");
        } finally {
          setIsGenerating(false);
        }
      }, 50);
    });
  };

  const copySummary = async () => {
    if (!summary) return;
    const success = await safeCopyText(summary);
    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } else {
      setError("Could not copy to clipboard.");
    }
  };

  const downloadSummary = () => {
    if (!summary || !file) return;
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `${sanitizeFileName(file.name)}-summary.txt`);
  };

  const printSummary = () => {
    if (!summary) return;
    const win = window.open("", "_blank", "width=640,height=800");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>PDF Summary</title>
      <style>body{font-family:system-ui,sans-serif;max-width:700px;margin:2rem auto;padding:0 1rem;color:#111;line-height:1.6}
      h1{font-size:1.25rem;margin-bottom:0.5rem}pre{white-space:pre-wrap;word-wrap:break-word}</style></head>
      <body><h1>PDF Summary — ${file?.name || "Document"}</h1><pre>${summary.replace(/</g, "&lt;")}</pre></body></html>`);
    win.document.close();
    win.print();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query || !fullText) {
      setSearchResults([]);
      setSearchIndex(0);
      return;
    }

    const results = [];
    const escaped = query.toLowerCase();
    pages.forEach((page) => {
      const lower = page.text.toLowerCase();
      let idx = 0;
      while ((idx = lower.indexOf(escaped, idx)) !== -1) {
        results.push({ pageNumber: page.pageNumber, position: idx });
        idx += escaped.length;
      }
    });
    setSearchResults(results);
    setSearchIndex(0);

    if (results.length > 0) {
      const firstPage = results[0].pageNumber;
      setActivePreviewPage(firstPage);
    }
  };

  const navigateSearch = (direction) => {
    if (!searchResults.length) return;
    const next =
      direction === "next"
        ? (searchIndex + 1) % searchResults.length
        : (searchIndex - 1 + searchResults.length) % searchResults.length;
    setSearchIndex(next);
    setActivePreviewPage(searchResults[next].pageNumber);
  };

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-8 text-(--foreground)">
      <div className="text-center">
        <h1 className="heading">PDF Summarizer</h1>
        <p className="description mt-3">
          Upload a PDF, extract its text, and generate a clear, structured
          summary with key points, keywords, and reading time.
        </p>
      </div>

      <section className="mt-8 rounded-lg border border-(--border) bg-(--card) p-5 sm:p-6">
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px] 2xl:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-(--foreground)">
                AI-Powered PDF Summarizer
              </h2>
              <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
                Extracts embedded text from your PDF and generates structured
                summaries locally in your browser. No uploads required.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-(--border) bg-(--background) p-4">
            <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
              Supported format
            </p>
            <p className="mt-2 text-3xl font-bold text-(--primary)">PDF</p>
            <p className="mt-2 text-sm text-(--muted-foreground)">
              Text-based PDFs with selectable content work best.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-5">
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-lg border-2 border-dashed bg-(--card) p-6 text-center transition ${
              isDragging
                ? "border-(--primary) bg-(--section-highlight)"
                : "border-(--border) hover:border-(--primary)"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              data-testid="pdf-summarizer-file-input"
              className="hidden"
              onChange={(e) => processPdfFile(e.target.files?.[0])}
            />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-(--foreground)">
              Drop PDF here
            </h2>
            <p className="mt-2 text-sm text-(--muted-foreground)">
              Works best with text-based PDFs like articles, reports, ebooks,
              research papers, and invoices.
            </p>
            <button
              type="button"
              className="btn-primary mt-5"
              onClick={() => fileInputRef.current?.click()}
              disabled={!pdfjsLib || isLoadingPdf}
            >
              {isLoadingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              {isLoadingPdf ? "Reading PDF..." : "Choose PDF"}
            </button>
          </div>

          {file && (
            <div className="rounded-lg border border-(--border) bg-(--card) p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-(--foreground)">
                    {file.name}
                  </p>
                  <p className="mt-1 text-sm text-(--muted-foreground)">
                    {formatBytes(file.size)} &bull; {pageCount || "Reading"}{" "}
                    pages
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary shrink-0"
                  onClick={resetTool}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
              </div>

              {progress.total > 0 && isExtracting && (
                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-xs font-medium text-(--muted-foreground)">
                    <span>Extracting text...</span>
                    <span>
                      {progress.done}/{progress.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-(--background)">
                    <div
                      className="h-full rounded-full bg-(--primary) transition-all"
                      style={{
                        width: `${Math.round((progress.done / progress.total) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border border-(--border) bg-(--card) p-5">
            <h2 className="font-semibold text-(--foreground)">Summary Mode</h2>
            <div className="mt-4 grid gap-2">
              {Object.entries(SUMMARY_MODES).map(([key, mode]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSummaryMode(key)}
                  className={`rounded-lg border p-3 text-left transition ${
                    summaryMode === key
                      ? "border-(--primary) bg-(--section-highlight)"
                      : "border-(--border) bg-(--background)"
                  }`}
                >
                  <span className="block text-sm font-semibold text-(--foreground)">
                    {mode.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-(--muted-foreground)">
                    {mode.description}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={handleGenerateSummary}
                disabled={!pages.length || isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {isGenerating ? "Generating..." : "Generate Summary"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={resetTool}
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {status && (
            <div
              data-testid="tool-output"
              className="flex items-center gap-3 rounded-lg border border-(--border) bg-(--section-highlight) p-4 text-(--primary)"
            >
              {isExtracting || isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <p className="font-medium">{status}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-600">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {pages.length > 0 && (
            <div className="tool-card-grid">
              <StatCard icon={FileText} label="Pages" value={pageCount} />
              <StatCard
                icon={Info}
                label="Words"
                value={totalWordCount.toLocaleString("en-IN")}
              />
              <StatCard
                icon={Clock}
                label="Reading"
                value={estimateReadingTime(totalWordCount)}
              />
              <StatCard
                icon={Search}
                label="Keywords"
                value={keywords.length}
              />
            </div>
          )}

          {summary && (
            <section className="rounded-lg border border-(--border) bg-(--card) p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-(--foreground)">
                    Summary{" "}
                    <span className="text-sm font-normal text-(--muted-foreground)">
                      ({SUMMARY_MODES[summaryMode]?.label})
                    </span>
                  </h2>
                  <p className="mt-1 text-xs text-(--muted-foreground)">
                    {summaryWordCount} words &bull;{" "}
                    {estimateReadingTime(summaryWordCount)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={copySummary}
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={downloadSummary}
                  >
                    <Download className="h-4 w-4" />
                    TXT
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={printSummary}
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                </div>
              </div>

              <div className="min-h-[200px] rounded-lg border border-(--border) bg-(--background) p-4">
                <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-(--foreground)">
                  {summary}
                </pre>
              </div>

              {keywords.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
                    Detected Keywords
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-block rounded-full border border-(--border) bg-(--muted) px-3 py-1 text-xs font-medium text-(--muted-foreground)"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="rounded-lg border border-(--border) bg-(--card) p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-(--foreground)">
                  Extracted Text Preview
                </h2>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  Browse extracted text page by page or search within it.
                </p>
              </div>
              {pageCount > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-(--border) bg-(--background) p-1.5 text-(--foreground) transition hover:bg-(--muted) disabled:opacity-40"
                    onClick={() =>
                      setActivePreviewPage(Math.max(1, activePreviewPage - 1))
                    }
                    disabled={activePreviewPage <= 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="min-w-[4rem] text-center text-sm font-medium text-(--foreground)">
                    {activePreviewPage} / {pageCount}
                  </span>
                  <button
                    type="button"
                    className="rounded-lg border border-(--border) bg-(--background) p-1.5 text-(--foreground) transition hover:bg-(--muted) disabled:opacity-40"
                    onClick={() =>
                      setActivePreviewPage(
                        Math.min(pageCount, activePreviewPage + 1),
                      )
                    }
                    disabled={activePreviewPage >= pageCount}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search inside PDF..."
                  className="w-full rounded-lg border border-(--border) bg-(--background) py-2 pl-9 pr-3 text-sm text-(--foreground) outline-none focus:border-(--primary)"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-(--muted-foreground)">
                    {searchIndex + 1} of {searchResults.length}
                  </span>
                  <button
                    type="button"
                    className="rounded-lg border border-(--border) bg-(--background) p-1.5 text-(--foreground) transition hover:bg-(--muted)"
                    onClick={() => navigateSearch("prev")}
                    aria-label="Previous match"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-(--border) bg-(--background) p-1.5 text-(--foreground) transition hover:bg-(--muted)"
                    onClick={() => navigateSearch("next")}
                    aria-label="Next match"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
              {searchQuery && searchResults.length === 0 && (
                <span className="text-xs text-red-500">No matches found</span>
              )}
            </div>

            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-(--border) bg-(--background) p-1.5 text-(--foreground) transition hover:bg-(--muted) disabled:opacity-40"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                disabled={zoom <= 0.5}
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="min-w-[3rem] text-center text-xs font-medium text-(--muted-foreground)">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                className="rounded-lg border border-(--border) bg-(--background) p-1.5 text-(--foreground) transition hover:bg-(--muted) disabled:opacity-40"
                onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                disabled={zoom >= 2}
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-[360px] overflow-auto rounded-lg border border-(--border) bg-(--background) p-4">
              {currentPreviewPage ? (
                <pre
                  className="whitespace-pre-wrap break-words text-sm leading-6 text-(--foreground)"
                  style={{ fontSize: `${zoom}rem` }}
                >
                  {searchQuery
                    ? highlightText(
                        currentPreviewPage.text ||
                          "No text on this page.",
                        searchQuery,
                      )
                    : currentPreviewPage.text || "No text on this page."}
                </pre>
              ) : (
                <div className="flex h-[320px] flex-col items-center justify-center text-center text-(--muted-foreground)">
                  <FileText className="mb-3 h-10 w-10" />
                  <p className="font-medium">
                    Upload a PDF to preview extracted text.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
