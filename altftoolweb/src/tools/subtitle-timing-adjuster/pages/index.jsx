"use client";
import { useMemo, useState } from "react";
import Header from "../components/Header";
import Actions from "../components/Actions";
import Editors from "../components/Editors";
import TimingControls from "../components/TimingControls";
import SyncFeatures from "../components/SyncFeatures";
import QaMetrics from "../components/QaMetrics";
import ToolFeatures from "../components/ToolFeatures";
import HowItWorks from "../components/HowItWorks";
import { buildSrt, formatMs, parseSrt } from "../utils/srt";

export default function ToolHome() {
  const [input, setInput] = useState("");
  const [offsetMs, setOffsetMs] = useState("0");
  const [scalePct, setScalePct] = useState("100");
  const [startAtCue, setStartAtCue] = useState("1");
  const [endAtCue, setEndAtCue] = useState("");
  const [minGapMs, setMinGapMs] = useState("20");
  const [sourceFps, setSourceFps] = useState("23.976");
  const [targetFps, setTargetFps] = useState("25");
  const [applyFpsMode, setApplyFpsMode] = useState(false);
  const [trimNegative, setTrimNegative] = useState(true);
  const [removeOverlaps, setRemoveOverlaps] = useState(true);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [stripHtml, setStripHtml] = useState(false);
  const [prefixText, setPrefixText] = useState("");
  const [suffixText, setSuffixText] = useState("");
  const [error, setError] = useState("");

  const parsed = useMemo(() => parseSrt(input), [input]);

  const transformed = useMemo(() => {
    if (!parsed.length) return [];
    const startRange = Math.max(1, Number(startAtCue) || 1);
    const endRange = Number(endAtCue) || parsed.length;
    const off = Number(offsetMs) || 0;
    const scaleVal = Number(scalePct);
    const scale = Number.isFinite(scaleVal) && scaleVal > 0 ? scaleVal / 100 : 1;
    const src = Number(sourceFps);
    const dst = Number(targetFps);
    const fpsRatio =
      applyFpsMode && Number.isFinite(src) && Number.isFinite(dst) && src > 0 && dst > 0
        ? src / dst
        : 1;

    let prevEnd = 0;
    return parsed.map((cue, idx) => {
      const inRange = idx + 1 >= startRange && idx + 1 <= endRange;
      let start = cue.start;
      let end = cue.end;
      let text = cue.text;

      if (inRange) {
        start = start * fpsRatio;
        end = end * fpsRatio;
        start = start * scale + off;
        end = end * scale + off;
      }

      if (trimNegative) {
        start = Math.max(0, start);
        end = Math.max(start + 1, end);
      }

      if (removeOverlaps && inRange && idx > 0) {
        const minGap = Number(minGapMs) || 0;
        if (start < prevEnd + minGap) {
          start = prevEnd + minGap;
          end = Math.max(end, start + 1);
        }
      }

      if (trimWhitespace) {
        text = text
          .split("\n")
          .map((line) => line.trim())
          .join("\n")
          .replace(/\n{3,}/g, "\n\n");
      }

      if (stripHtml) {
        text = text.replace(/<[^>]+>/g, "");
      }

      if (findText) {
        try {
          if (useRegex) {
            const re = new RegExp(findText, "g");
            text = text.replace(re, replaceText);
          } else {
            text = text.split(findText).join(replaceText);
          }
        } catch {
          // keep original text; regex feedback handled in UI validation
        }
      }

      if (prefixText) text = `${prefixText}${text}`;
      if (suffixText) text = `${text}${suffixText}`;

      prevEnd = end;
      return { ...cue, start, end, text };
    });
  }, [
    parsed,
    startAtCue,
    endAtCue,
    offsetMs,
    scalePct,
    sourceFps,
    targetFps,
    applyFpsMode,
    trimNegative,
    removeOverlaps,
    minGapMs,
    findText,
    replaceText,
    useRegex,
    trimWhitespace,
    stripHtml,
    prefixText,
    suffixText,
  ]);

  const qa = useMemo(() => {
    if (!transformed.length) return null;
    let overlaps = 0;
    let shortCues = 0;
    let cpsWarnings = 0;
    for (let i = 0; i < transformed.length; i++) {
      const c = transformed[i];
      const dur = Math.max(1, c.end - c.start) / 1000;
      if (dur < 0.7) shortCues++;
      const cps = c.text.replace(/\s+/g, " ").trim().length / dur;
      if (cps > 20) cpsWarnings++;
      if (i > 0 && c.start < transformed[i - 1].end) overlaps++;
    }
    return {
      count: transformed.length,
      overlaps,
      shortCues,
      cpsWarnings,
      first: formatMs(transformed[0].start),
      last: formatMs(transformed[transformed.length - 1].end),
    };
  }, [transformed]);

  const output = useMemo(() => buildSrt(transformed), [transformed]);

  const regexError = useMemo(() => {
    if (!useRegex || !findText) return "";
    try {
      // validate only
      new RegExp(findText, "g");
      return "";
    } catch {
      return "Invalid regex pattern.";
    }
  }, [useRegex, findText]);

  const applyDemo = () => {
    setInput(
      `1
00:00:01,000 --> 00:00:03,500
Hello and welcome.

2
00:00:04,000 --> 00:00:06,400
This is a subtitle timing demo.

3
00:00:07,000 --> 00:00:09,000
Shift and stretch timings quickly.`
    );
  };

  const downloadOutput = () => {
    if (!output.trim()) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "adjusted-subtitles.srt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyOutput = async () => {
    if (!output.trim()) return;
    try {
      await navigator.clipboard.writeText(output);
      setError("");
    } catch {
      setError("Could not copy output to clipboard.");
    }
  };

  const buildVtt = () => {
    const body = transformed
      .map(
        (c, i) =>
          `${i + 1}\n${formatMs(c.start).replace(",", ".")} --> ${formatMs(c.end).replace(",", ".")}\n${c.text}`.trim()
      )
      .join("\n\n");
    return `WEBVTT\n\n${body}`;
  };

  const downloadVtt = () => {
    if (!output.trim()) return;
    const vtt = buildVtt();
    const blob = new Blob([vtt], { type: "text/vtt;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "adjusted-subtitles.vtt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 py-6 bg-(--background)">
      <Header />

      <div className="max-w-6xl mx-auto bg-(--card) rounded-2xl shadow-xl border border-(--border) overflow-hidden py-5">
        <div className="p-6 space-y-6">
          <Actions onLoadDemo={applyDemo} onCopyOutput={copyOutput} onDownload={downloadOutput} />
          {error && (
            <p role="alert" className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <Editors input={input} output={output} onChangeInput={setInput} />

          <TimingControls
            offsetMs={offsetMs}
            setOffsetMs={setOffsetMs}
            scalePct={scalePct}
            setScalePct={setScalePct}
            startAtCue={startAtCue}
            setStartAtCue={setStartAtCue}
            endAtCue={endAtCue}
            setEndAtCue={setEndAtCue}
          />

          <SyncFeatures
            sourceFps={sourceFps}
            setSourceFps={setSourceFps}
            targetFps={targetFps}
            setTargetFps={setTargetFps}
            minGapMs={minGapMs}
            setMinGapMs={setMinGapMs}
            applyFpsMode={applyFpsMode}
            setApplyFpsMode={setApplyFpsMode}
            trimNegative={trimNegative}
            setTrimNegative={setTrimNegative}
            removeOverlaps={removeOverlaps}
            setRemoveOverlaps={setRemoveOverlaps}
          />

          {(applyFpsMode && (Number(sourceFps) <= 0 || Number(targetFps) <= 0)) && (
            <p className="text-amber-500 text-sm">
              FPS values must be greater than 0. FPS conversion is temporarily ignored.
            </p>
          )}
          {Number(scalePct) <= 0 && (
            <p className="text-amber-500 text-sm">
              Scale percent must be greater than 0. Using 100% fallback.
            </p>
          )}

          <div className="rounded-xl border border-(--border) bg-(--background) p-4">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Pro Text Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Find text or regex pattern"
                aria-label="Find text or regex pattern"
                className="px-3 py-2 rounded-lg border border-(--border) bg-(--card) focus:outline-none focus:ring-2 focus:ring-(--primary)"
              />
              <input
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace with"
                aria-label="Replace with"
                className="px-3 py-2 rounded-lg border border-(--border) bg-(--card) focus:outline-none focus:ring-2 focus:ring-(--primary)"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                value={prefixText}
                onChange={(e) => setPrefixText(e.target.value)}
                placeholder="Prefix each cue (optional)"
                aria-label="Prefix each cue"
                className="px-3 py-2 rounded-lg border border-(--border) bg-(--card)"
              />
              <input
                value={suffixText}
                onChange={(e) => setSuffixText(e.target.value)}
                placeholder="Suffix each cue (optional)"
                aria-label="Suffix each cue"
                className="px-3 py-2 rounded-lg border border-(--border) bg-(--card)"
              />
            </div>
            {regexError && (
              <p role="alert" className="text-red-500 text-sm mb-2">
                {regexError}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setUseRegex((v) => !v)} className={`px-3 py-2 rounded-lg border ${useRegex ? "bg-(--primary) text-white border-(--primary)" : "border-(--border)"}`}>
                {useRegex ? "Regex: ON" : "Regex: OFF"}
              </button>
              <button onClick={() => setTrimWhitespace((v) => !v)} className={`px-3 py-2 rounded-lg border ${trimWhitespace ? "bg-(--primary) text-white border-(--primary)" : "border-(--border)"}`}>
                {trimWhitespace ? "Trim Whitespace: ON" : "Trim Whitespace: OFF"}
              </button>
              <button onClick={() => setStripHtml((v) => !v)} className={`px-3 py-2 rounded-lg border ${stripHtml ? "bg-(--primary) text-white border-(--primary)" : "border-(--border)"}`}>
                {stripHtml ? "Strip HTML: ON" : "Strip HTML: OFF"}
              </button>
              <button onClick={downloadVtt} className="px-3 py-2 rounded-lg border border-(--border) hover:border-(--primary)">
                Download WebVTT
              </button>
            </div>
          </div>

          <QaMetrics qa={qa} />
          <ToolFeatures />
          <HowItWorks />
        </div>
      </div>
    </div>
  );
}
