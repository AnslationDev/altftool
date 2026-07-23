"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ScanSearch, Sparkles, Eraser, Info, FlaskConical } from "lucide-react";
import ResultsPanel from "./ResultsPanel";
import { analyzeDeliverability, SAMPLE_EMAIL, SAMPLE_EMAIL_RISKY } from "../lib/deliverabilityEngine";
import { getHistory, pushHistory, clearHistory } from "../lib/reportUtils";

const INPUT_CLASS =
  "w-full rounded-xl border border-(--border) bg-(--background) px-3.5 py-2.5 text-sm text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25";

export default function MainSection() {
  const [subject, setSubject] = useState("");
  const [sender, setSender] = useState("");
  const [mode, setMode] = useState("plain");
  const [body, setBody] = useState("");
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [result, setResult] = useState(null);
  const [analyzedKey, setAnalyzedKey] = useState("");
  const [history, setHistory] = useState([]);
  const textareaRef = useRef(null);

  const currentKey = `${mode}|${subject}|${sender}|${body}`;
  const dirty = Boolean(result) && analyzedKey !== currentKey;
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function runAnalysis(inputs) {
    const next = analyzeDeliverability(inputs);
    setResult(next);
    setAnalyzedKey(`${inputs.mode}|${inputs.subject}|${inputs.sender}|${inputs.body}`);
    if (next.hasContent && inputs.body.trim().length > 20) {
      setHistory(
        pushHistory({
          subject: inputs.subject,
          sender: inputs.sender,
          mode: inputs.mode,
          body: inputs.body,
          score: next.overallScore,
          risk: next.riskLevel,
        }),
      );
    }
  }

  function handleAnalyze() {
    if (!body.trim() && !subject.trim()) return;
    runAnalysis({ mode, subject, sender, body });
  }

  // Optional real-time mode: debounce so the engine runs after the user
  // pauses, not on every keystroke.
  useEffect(() => {
    if (!autoAnalyze || (!body.trim() && !subject.trim())) return undefined;
    const handle = window.setTimeout(() => runAnalysis({ mode, subject, sender, body }), 700);
    return () => window.clearTimeout(handle);
  }, [autoAnalyze, mode, subject, sender, body]);

  function handleClear() {
    setSubject("");
    setSender("");
    setBody("");
    setResult(null);
    setAnalyzedKey("");
  }

  function loadSample(sample) {
    setSubject(sample.subject);
    setSender(sample.sender);
    setMode(sample.mode);
    setBody(sample.body);
    setResult(null);
    setAnalyzedKey("");
  }

  function handleLoadHistory(entry) {
    setSubject(entry.subject);
    setSender(entry.sender || "");
    setMode(entry.mode || "plain");
    setBody(entry.body);
    setResult(null);
    setAnalyzedKey("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="bg-(--background) text-(--foreground)">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:py-8">
        {/* Hero */}
        <div className="mb-6 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--primary)/10 px-3 py-1 text-xs font-semibold text-(--primary)">
            <Send className="h-3.5 w-3.5" aria-hidden="true" /> Email Marketing
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Email Deliverability{" "}
            <span className="bg-gradient-to-r from-(--primary) to-(--secondary) bg-clip-text text-transparent">Predictor</span>
          </h1>
          <p className="mt-2 max-w-3xl text-(--muted-foreground) sm:text-lg">
            Audit your email before you hit send — spam signals, subject quality, link safety, structure and best
            practices, scored with transparent rules entirely in your browser.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-info/30 bg-info-soft px-4 py-3 text-xs leading-relaxed text-info">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            This is a <strong>content-based prediction</strong>, not a measurement of real inbox placement. Actual
            delivery also depends on sender reputation and SPF/DKIM/DMARC authentication — test those with your email
            provider before a real send.
          </span>
        </div>

        {/* On desktop both columns share a fixed viewport-height row: the
            editor stays put while the (much taller) results column scrolls
            inside its own pane. position:sticky can't be used here because a
            platform wrapper (overflow-x-auto) creates a scroll container that
            disables viewport-sticky behavior. */}
        <div className="grid grid-cols-1 items-start gap-5 lg:h-[82vh] lg:min-h-[560px] lg:grid-cols-2 lg:items-stretch">
          <div className="rounded-2xl border border-(--card-border) bg-(--card)/80 p-5 shadow-lg backdrop-blur-xl lg:h-full lg:overflow-y-auto">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="edp-subject" className="mb-1 block text-xs font-semibold text-(--muted-foreground)">
                  Subject line
                </label>
                <input id="edp-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your February product update is here" className={INPUT_CLASS} />
              </div>
              <div>
                <label htmlFor="edp-sender" className="mb-1 block text-xs font-semibold text-(--muted-foreground)">
                  Sender email <span className="font-normal">(optional)</span>
                </label>
                <input id="edp-sender" type="email" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="team@yourcompany.com" className={INPUT_CLASS} />
              </div>
              <div>
                <label htmlFor="edp-mode" className="mb-1 block text-xs font-semibold text-(--muted-foreground)">
                  Content mode
                </label>
                <select id="edp-mode" value={mode} onChange={(e) => setMode(e.target.value)} className={INPUT_CLASS}>
                  <option value="plain">Plain text</option>
                  <option value="html">HTML source</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="edp-body" className="mb-1 block text-xs font-semibold text-(--muted-foreground)">
                  Email {mode === "html" ? "HTML" : "content"}
                </label>
                <textarea
                  id="edp-body"
                  ref={textareaRef}
                  rows={14}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={mode === "html" ? "<html>…paste your email HTML…</html>" : "Write or paste your email content…"}
                  spellCheck={mode === "plain"}
                  className={`${INPUT_CLASS} resize-y font-mono text-[13px] leading-relaxed`}
                />
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-(--muted-foreground)">
                  <span>
                    {body.length} characters · {words} word{words === 1 ? "" : "s"} · ~{Math.max(1, Math.round(words / 200))} min read
                  </span>
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input type="checkbox" checked={autoAnalyze} onChange={(e) => setAutoAnalyze(e.target.checked)} className="h-3.5 w-3.5 accent-(--primary)" />
                    Auto-analyze as I type
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!body.trim() && !subject.trim()}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-foreground) shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ScanSearch className="h-4 w-4" aria-hidden="true" /> Analyze
              </button>
              <button
                type="button"
                onClick={() => loadSample(SAMPLE_EMAIL)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) px-3 py-2 text-sm font-medium text-(--muted-foreground) hover:border-(--primary) hover:text-(--primary)"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Good sample
              </button>
              <button
                type="button"
                onClick={() => loadSample(SAMPLE_EMAIL_RISKY)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) px-3 py-2 text-sm font-medium text-(--muted-foreground) hover:border-warning hover:text-warning"
              >
                <FlaskConical className="h-4 w-4" aria-hidden="true" /> Risky sample
              </button>
              {(body || subject) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) px-3 py-2 text-sm font-medium text-(--muted-foreground) hover:border-danger hover:text-danger"
                >
                  <Eraser className="h-4 w-4" aria-hidden="true" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Results column — scrolls within its own pane on desktop */}
          <div className="min-h-0 lg:h-full lg:overflow-y-auto lg:pr-1">
            <ResultsPanel result={result} dirty={dirty} history={history} onLoadHistory={handleLoadHistory} onClearHistory={() => setHistory(clearHistory())} />
          </div>
        </div>

      </div>
    </div>
  );
}
