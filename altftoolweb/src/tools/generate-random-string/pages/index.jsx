"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Copy,
  Download,
  FileSpreadsheet,
  History,
  QrCode,
  RefreshCw,
  RotateCcw,
  Shield,
  SlidersHorizontal,
  Trash2,
  Wand2,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  HISTORY_LIMIT,
  STORAGE_KEY,
  buildCsv,
  buildTxt,
  calculateEntropy,
  clampNumber,
  defaultSettings,
  downloadFile,
  generateBatch,
  loadState,
  makeHistoryItem,
} from "../utils/stringUtils";

export default function ToolHome() {
  const loaded = useMemo(() => loadState(), []);
  const [settings, setSettings] = useState(loaded.settings);
  const [history, setHistory] = useState(loaded.history);
  const [strings, setStrings] = useState(() => generateBatch(loaded.settings));
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef(null);

  const entropy = useMemo(() => calculateEntropy(settings), [settings]);
  const outputText = useMemo(() => buildTxt(strings), [strings]);
  const totalCharacters = strings.reduce((sum, value) => sum + value.length, 0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, history }));
  }, [settings, history]);

  function notify(text) {
    setNotice(text);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 1800);
  }

  function updateSetting(key, value) {
    setSettings((current) => {
      const next = { ...current, [key]: value };
      setStrings(generateBatch(next));
      return next;
    });
  }

  function regenerate(save = true) {
    const next = generateBatch(settings);
    setStrings(next);
    if (save && next.length) {
      setHistory((current) => [makeHistoryItem(next, settings), ...current].slice(0, HISTORY_LIMIT));
      notify("Generated with secure browser randomness.");
    }
  }

  async function copyValue(value, message = "Copied.") {
    await navigator.clipboard.writeText(value);
    notify(message);
  }

  function exportTxt() {
    downloadFile(outputText, "random-strings.txt", "text/plain;charset=utf-8");
    notify("TXT export downloaded.");
  }

  function exportCsv() {
    downloadFile(buildCsv(strings), "random-strings.csv", "text/csv;charset=utf-8");
    notify("CSV export downloaded.");
  }

  function reset() {
    setSettings(defaultSettings);
    setStrings(generateBatch(defaultSettings));
    notify("Settings reset.");
  }

  function clearAll() {
    setStrings([]);
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    notify("Results and history cleared.");
  }

  return (
    <main className="random-string-studio min-h-screen overflow-x-hidden px-3 py-6 text-(--foreground) sm:px-4">
      <div className="mx-auto max-w-6xl min-w-0 space-y-5">
        <Header total={strings.length} strength={entropy.label} />

        {notice && (
          <div className="animate-fade-up min-w-0 break-words rounded-xl border border-(--border) bg-(--card) px-4 py-3 text-sm font-bold text-(--foreground) shadow-lg">
            {notice}
          </div>
        )}

        <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          <div className="min-w-0 space-y-5">
            <Panel title="Settings Panel" icon={SlidersHorizontal}>
              <div className="grid gap-4 md:grid-cols-2">
                <NumberControl label="String length" value={settings.length} min={1} max={256} onChange={(value) => updateSetting("length", clampNumber(value, 1, 256))} />
                <NumberControl label="Batch count" value={settings.count} min={1} max={100} onChange={(value) => updateSetting("count", clampNumber(value, 1, 100))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Toggle label="Uppercase" hint="A-Z" checked={settings.uppercase} onChange={(value) => updateSetting("uppercase", value)} />
                <Toggle label="Lowercase" hint="a-z" checked={settings.lowercase} onChange={(value) => updateSetting("lowercase", value)} />
                <Toggle label="Numbers" hint="0-9" checked={settings.numbers} onChange={(value) => updateSetting("numbers", value)} />
                <Toggle label="Symbols" hint="!@#$%" checked={settings.symbols} onChange={(value) => updateSetting("symbols", value)} />
              </div>
              <label className="block min-w-0">
                <span className="text-sm font-bold text-(--muted-foreground)">Custom character set</span>
                <input
                  value={settings.customCharset}
                  onChange={(event) => updateSetting("customCharset", event.target.value)}
                  placeholder="ABC123@#"
                  className="mt-2 w-full rounded-xl border border-(--border) bg-(--background) px-3 py-3 text-sm outline-none transition focus:border-cyan-400"
                />
              </label>
              <Toggle label="Use custom set only" hint="Ignore default pools" checked={settings.useCustomOnly} onChange={(value) => updateSetting("useCustomOnly", value)} />
            </Panel>

            <Panel title="Pattern Builder" icon={Wand2}>
              <label className="block min-w-0">
                <span className="text-sm font-bold text-(--muted-foreground)">Pattern</span>
                <input
                  value={settings.pattern}
                  onChange={(event) => updateSetting("pattern", event.target.value)}
                  placeholder="AAA-999 or USR-####"
                  className="mt-2 w-full rounded-xl border border-(--border) bg-(--background) px-3 py-3 font-mono text-sm outline-none transition focus:border-cyan-400"
                />
              </label>
              <div className="grid gap-2 text-xs text-(--muted-foreground) sm:grid-cols-3">
                <Hint value="A" label="uppercase" />
                <Hint value="9 / #" label="number" />
                <Hint value="* / X / ?" label="dynamic pool" />
              </div>
            </Panel>

            <Panel title="Live Preview Section" icon={Shield}>
              <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <Action onClick={() => regenerate(true)} icon={RefreshCw}>Generate</Action>
                <Action onClick={() => copyValue(outputText, "All strings copied.")} icon={Copy} disabled={!strings.length}>Copy all</Action>
                <Action onClick={exportTxt} icon={Download} disabled={!strings.length}>TXT</Action>
                <Action onClick={exportCsv} icon={FileSpreadsheet} disabled={!strings.length}>CSV</Action>
                <Action onClick={reset} icon={RotateCcw}>Reset</Action>
                <Action onClick={clearAll} icon={Trash2}>Clear</Action>
              </div>
              <div className="max-h-[28rem] w-full min-w-0 overflow-auto rounded-xl border border-(--border) bg-(--background) p-2 sm:p-3">
                {strings.length ? (
                  <div className="grid min-w-0 gap-2">
                    {strings.map((value, index) => (
                      <div key={`${value}-${index}`} className="flex w-full min-w-0 items-start gap-2 overflow-hidden rounded-lg border border-(--border) bg-(--card) p-2 sm:p-3">
                        <span className="shrink-0 rounded-md bg-cyan-500/10 px-2 py-1 text-xs font-black text-cyan-500">{index + 1}</span>
                        <code className="min-w-0 flex-1 break-all font-mono text-sm leading-6">{value}</code>
                        <button onClick={() => copyValue(value, "String copied.")} className="shrink-0 rounded-lg border border-(--border) p-2 hover:bg-(--muted)" aria-label="Copy string">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm font-semibold text-(--muted-foreground)">Choose a valid character pool to generate strings.</div>
                )}
              </div>
            </Panel>
          </div>

          <aside className="min-w-0 space-y-5">
            <Panel title="Entropy Panel" icon={Shield}>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm font-bold">
                    <span>{entropy.label}</span>
                    <span>{entropy.bits.toFixed(1)} bits</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-(--background)">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 transition-all" style={{ width: `${Math.min(100, (entropy.bits / 160) * 100)}%` }} />
                  </div>
                </div>
                <Stats rows={[["Length", entropy.length], ["Charset size", entropy.charsetSize], ["Strings", strings.length], ["Characters", totalCharacters]]} />
              </div>
            </Panel>

            <Panel title="QR Section" icon={QrCode}>
              <div className="flex w-full min-w-0 justify-center overflow-hidden rounded-xl border border-(--border) bg-white p-3 sm:p-4">
                {strings[0] ? <QRCodeCanvas className="h-auto max-w-full" value={strings[0]} size={180} bgColor="#ffffff" fgColor="#0f172a" level="H" /> : <div className="grid h-[180px] min-w-0 place-items-center text-sm font-bold text-slate-500">No string</div>}
              </div>
              <p className="break-all text-xs text-(--muted-foreground)">{strings[0] || "Generate a string to preview its QR code."}</p>
            </Panel>

            <Panel title="History Section" icon={History}>
              <div className="max-h-80 space-y-2 overflow-auto pr-1">
                {history.length ? history.map((item) => (
                  <button key={item.id} onClick={() => { setSettings({ ...defaultSettings, ...item.settings }); setStrings(item.strings || []); notify("History restored."); }} className="w-full min-w-0 overflow-hidden rounded-xl border border-(--border) bg-(--background) p-3 text-left transition hover:border-cyan-400">
                    <div className="flex min-w-0 justify-between gap-2 text-xs font-bold text-(--muted-foreground)">
                      <span className="min-w-0 truncate">{new Date(item.createdAt).toLocaleString()}</span>
                      <span className="shrink-0">{item.strings?.length || 0} strings</span>
                    </div>
                    <code className="mt-2 block truncate font-mono text-sm text-(--foreground)">{item.strings?.[0]}</code>
                  </button>
                )) : <div className="rounded-xl border border-dashed border-(--border) p-6 text-center text-sm font-semibold text-(--muted-foreground)">Generated batches appear here.</div>}
              </div>
            </Panel>
          </aside>
        </section>

        <Footer />
      </div>
    </main>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="animate-fade-up w-full min-w-0 overflow-hidden space-y-4 rounded-2xl border border-(--border) bg-(--card) p-3 shadow-lg sm:p-4">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-5 w-5 shrink-0 text-cyan-500" />
        <h2 className="subheading min-w-0 truncate text-base">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function NumberControl({ label, value, min, max, onChange }) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-bold text-(--muted-foreground)">{label}</span>
      <div className="mt-2 flex min-w-0 items-center gap-3">
        <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 accent-cyan-500" />
        <input type="number" min={min} max={max} value={value} onChange={(event) => onChange(event.target.value)} className="w-16 shrink-0 rounded-xl border border-(--border) bg-(--background) px-2 py-2 text-center font-bold outline-none sm:w-20" />
      </div>
    </label>
  );
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex min-w-0 cursor-pointer items-center justify-between gap-3 rounded-xl border border-(--border) bg-(--background) p-3 transition hover:border-cyan-400">
      <span className="min-w-0">
        <span className="block truncate text-sm font-black">{label}</span>
        <span className="block truncate text-xs text-(--muted-foreground)">{hint}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 shrink-0 accent-cyan-500" />
    </label>
  );
}

function Action({ icon: Icon, children, disabled, onClick }) {
  return (
    <button disabled={disabled} onClick={onClick} className="inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-2 py-2 text-sm font-bold transition hover:border-cyan-400 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-3">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{children}</span>
    </button>
  );
}

function Hint({ value, label }) {
  return <div className="min-w-0 break-words rounded-lg border border-(--border) bg-(--background) px-3 py-2"><code className="font-bold text-cyan-500">{value}</code> means {label}</div>;
}

function Stats({ rows }) {
  return (
    <div className="grid gap-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-(--background) px-3 py-2 text-sm">
          <span className="min-w-0 truncate text-(--muted-foreground)">{label}</span>
          <span className="shrink-0 font-black">{value}</span>
        </div>
      ))}
    </div>
  );
}
