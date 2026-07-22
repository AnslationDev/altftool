"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshCw,
  Copy,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Shield,
  Download,
  Image as ImageIcon,
  Clipboard,
  Zap,
  Lock,
  Minus,
  Plus,
  Settings,
  SlidersHorizontal,
  Palette,
} from "lucide-react";

const CHARSETS = {
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lower: "abcdefghijkmnpqrstuvwxyz",
  digits: "23456789",
  symbols: "!@#$%&*?",
};

const AMBIGUOUS = "O0o1IlB8S5Z2";

const PALETTES = {
  multicolor: ["#1e3a5f", "#16a34a", "#475569", "#2563eb", "#0f766e"],
  navy: ["#14284a"],
  black: ["#111827"],
  primary: ["#2563eb"],
};

const FONT_STYLES = {
  distorted: { label: "Distorted", family: "serif", weight: "700", rotate: 1 },
  clean: { label: "Clean", family: "system-ui, sans-serif", weight: "600", rotate: 0.35 },
  bold: { label: "Bold", family: "system-ui, sans-serif", weight: "900", rotate: 0.7 },
  mono: { label: "Monospace", family: "monospace", weight: "700", rotate: 0.5 },
};

const COMPLEXITY = {
  easy: { label: "Easy", rotate: 0.15, jitter: 4, sizeVar: 4 },
  medium: { label: "Medium", rotate: 0.4, jitter: 10, sizeVar: 8 },
  hard: { label: "Hard", rotate: 0.7, jitter: 16, sizeVar: 14 },
};

const CaptchaGenerator = () => {
  // --- settings state ---
  const [length, setLength] = useState(6);
  const [complexity, setComplexity] = useState("medium");
  const [charsets, setCharsets] = useState({
    upper: true,
    lower: true,
    digits: true,
    symbols: false,
  });
  const [noise, setNoise] = useState(60);
  const [lines, setLines] = useState(40);
  const [fontStyle, setFontStyle] = useState("distorted");

  // --- advanced state ---
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);

  // --- appearance state ---
  const [palette, setPalette] = useState("multicolor");
  const [background, setBackground] = useState("gradient");

  // --- runtime state ---
  const [tab, setTab] = useState("settings");
  const [captcha, setCaptcha] = useState("");
  const [seed, setSeed] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [message, setMessage] = useState(null);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const canvasRef = useRef(null);

  const activeChars = useMemo(() => {
    let pool = Object.keys(charsets)
      .filter((k) => charsets[k])
      .map((k) => CHARSETS[k])
      .join("");
    if (!pool) pool = CHARSETS.upper + CHARSETS.digits;
    if (excludeAmbiguous)
      pool = pool
        .split("")
        .filter((c) => !AMBIGUOUS.includes(c))
        .join("");
    return pool || CHARSETS.digits;
  }, [charsets, excludeAmbiguous]);

  const randomText = useCallback(
    (len) => {
      let out = "";
      const arr = new Uint32Array(len);
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        crypto.getRandomValues(arr);
      } else {
        for (let i = 0; i < len; i++) arr[i] = Math.floor(Math.random() * 1e9);
      }
      for (let i = 0; i < len; i++) out += activeChars[arr[i] % activeChars.length];
      return out;
    },
    [activeChars],
  );

  const regenerate = useCallback(() => {
    setCaptcha(randomText(length));
    setSeed((s) => s + 1);
    setUserInput("");
    setMessage(null);
  }, [randomText, length]);

  // initial + settings-driven regeneration
  useEffect(() => {
    setCaptcha(randomText(length));
    setSeed((s) => s + 1);
  }, [randomText, length]);

  // --- canvas drawing ---
  const drawCaptcha = useCallback(
    (canvas, text) => {
      if (!canvas || !text) return;
      const ctx = canvas.getContext("2d");
      const rectW = 640;
      const rectH = 180;
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      canvas.width = rectW * dpr;
      canvas.height = rectH * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = rectW;
      const h = rectH;
      ctx.clearRect(0, 0, w, h);

      // background
      if (background === "plain") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
      } else if (background === "soft") {
        ctx.fillStyle = "#f1f5f9";
        ctx.fillRect(0, 0, w, h);
      } else {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, "#f8fafc");
        g.addColorStop(1, "#eef3f8");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // noise dots — density from slider
      const dotCount = Math.round((noise / 100) * 220);
      for (let i = 0; i < dotCount; i++) {
        ctx.fillStyle = `rgba(30,41,59,${0.04 + Math.random() * 0.1})`;
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // curved lines — count from slider
      const lineCount = Math.round((lines / 100) * 8);
      for (let i = 0; i < lineCount; i++) {
        ctx.strokeStyle = `rgba(71,85,105,${0.08 + Math.random() * 0.12})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(-10, Math.random() * h);
        ctx.bezierCurveTo(
          w * 0.3,
          Math.random() * h,
          w * 0.7,
          Math.random() * h,
          w + 10,
          Math.random() * h,
        );
        ctx.stroke();
      }

      // text
      const conf = COMPLEXITY[complexity];
      const font = FONT_STYLES[fontStyle];
      const colors = PALETTES[palette];
      const charCount = text.length;
      const baseSize = Math.min(h * 0.55, ((w - 80) / charCount) * 1.15);
      const padding = 40;
      const availableWidth = w - 2 * padding;
      const charSpacing = availableWidth / charCount;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < charCount; i++) {
        const ch = text[i];
        const x = padding + charSpacing * i + charSpacing / 2 + (Math.random() - 0.5) * conf.jitter;
        const y = h / 2 + (Math.random() - 0.5) * conf.jitter * 1.4;
        const angle = (Math.random() - 0.5) * conf.rotate * font.rotate;
        const size = baseSize - Math.random() * conf.sizeVar;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.font = `${font.weight} ${Math.round(size)}px ${font.family}`;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillText(ch, 0, 0);
        ctx.restore();
      }
    },
    [noise, lines, complexity, fontStyle, palette, background],
  );

  useEffect(() => {
    drawCaptcha(canvasRef.current, captcha);
  }, [captcha, seed, drawCaptcha]);

  // --- actions ---
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(captcha);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `captcha-${captcha}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch {
      handleDownload();
    }
  };

  const verify = () => {
    if (!userInput)
      return setMessage({ ok: false, text: "Please enter the captcha text" });
    const a = caseSensitive ? userInput.trim() : userInput.trim().toLowerCase();
    const b = caseSensitive ? captcha : captcha.toLowerCase();
    if (a === b) setMessage({ ok: true, text: "Correct — verification passed!" });
    else setMessage({ ok: false, text: "Incorrect — please try again." });
  };

  const toggleCharset = (key) => {
    setCharsets((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!Object.values(next).some(Boolean)) return prev; // keep at least one
      return next;
    });
  };

  // --- UI helpers ---
  const tabs = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "advanced", label: "Advanced", icon: SlidersHorizontal },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  const SettingRow = ({ title, subtitle, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-(--border) last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-(--foreground)">{title}</p>
        <p className="text-xs text-(--muted-foreground) mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-(--primary)" : "bg-(--border)"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  const Slider = ({ value, onChange }) => (
    <div className="flex items-center gap-3 w-full sm:w-64">
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-(--primary)"
      />
      <span className="text-sm font-medium text-(--foreground) w-11 text-right">{value}%</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-(--background) py-6 sm:py-10 md:py-12 px-3 sm:px-4 md:px-6">
      <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-(--primary)/10 shrink-0">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-(--primary)" />
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-(--foreground) tracking-tight">
              CAPTCHA Generator
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-(--muted-foreground) max-w-2xl mx-auto px-2">
            Create secure CAPTCHAs for your application
          </p>
        </div>

        {/* Preview Card */}
        <div className="bg-(--card) border border-(--border) rounded-2xl shadow-sm p-4 sm:p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-base sm:text-lg font-bold text-(--foreground)">CAPTCHA Preview</h2>
            <span className="flex items-center gap-2 text-xs sm:text-sm text-(--muted-foreground)">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Preview
            </span>
          </div>

          <div className="relative">
            <div className="rounded-xl border border-(--border) overflow-hidden bg-white">
              <canvas ref={canvasRef} className="block w-full h-auto" aria-label="CAPTCHA image" />
            </div>
            <button
              onClick={regenerate}
              aria-label="Regenerate captcha"
              className="absolute left-1/2 -bottom-5 -translate-x-1/2 w-11 h-11 rounded-full bg-(--primary) text-white shadow-lg flex items-center justify-center hover:bg-(--primary)/90 active:scale-95 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-9">
            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-2 h-11 rounded-xl border border-(--border) text-(--primary) font-medium text-sm hover:bg-(--primary)/5 transition-colors"
            >
              {copiedText ? <CheckCircle className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
              {copiedText ? "Copied!" : "Copy Text"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 h-11 rounded-xl bg-(--primary) text-white font-medium text-sm hover:bg-(--primary)/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handleCopyImage}
              className="flex items-center justify-center gap-2 h-11 rounded-xl border border-(--border) text-(--primary) font-medium text-sm hover:bg-(--primary)/5 transition-colors"
            >
              {copiedImage ? <CheckCircle className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
              {copiedImage ? "Copied!" : "Copy Image"}
            </button>
          </div>
        </div>

        {/* Tabs Card */}
        <div className="bg-(--card) border border-(--border) rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-(--border)">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  tab === id
                    ? "text-(--primary) border-(--primary) bg-(--primary)/5"
                    : "text-(--muted-foreground) border-transparent hover:text-(--foreground)"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          <div className="px-4 sm:px-5 md:px-6 py-2">
            {tab === "settings" && (
              <>
                <SettingRow title="Length" subtitle="Number of characters">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLength((l) => Math.max(4, l - 1))}
                      aria-label="Decrease length"
                      className="w-9 h-9 rounded-lg border border-(--border) flex items-center justify-center text-(--primary) hover:bg-(--primary)/5 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 h-9 rounded-lg border border-(--border) flex items-center justify-center text-sm font-semibold text-(--foreground)">
                      {length}
                    </span>
                    <button
                      onClick={() => setLength((l) => Math.min(10, l + 1))}
                      aria-label="Increase length"
                      className="w-9 h-9 rounded-lg border border-(--border) flex items-center justify-center text-(--primary) hover:bg-(--primary)/5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </SettingRow>

                <SettingRow title="Complexity" subtitle="Character complexity level">
                  <select
                    value={complexity}
                    onChange={(e) => setComplexity(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-(--border) bg-(--background) text-sm font-medium text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/30"
                  >
                    {Object.entries(COMPLEXITY).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </SettingRow>

                <SettingRow title="Characters" subtitle="Select character set">
                  <div className="flex flex-wrap items-center gap-4">
                    {[
                      { key: "upper", label: "A-Z" },
                      { key: "lower", label: "a-z" },
                      { key: "digits", label: "0-9" },
                      { key: "symbols", label: "!@#" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={charsets[key]}
                          onChange={() => toggleCharset(key)}
                          className="w-4 h-4 rounded accent-(--primary)"
                        />
                        <span className="text-sm font-medium text-(--foreground)">{label}</span>
                      </label>
                    ))}
                  </div>
                </SettingRow>

                <SettingRow title="Noise" subtitle="Add random noise">
                  <Slider value={noise} onChange={setNoise} />
                </SettingRow>

                <SettingRow title="Lines" subtitle="Add random lines">
                  <Slider value={lines} onChange={setLines} />
                </SettingRow>

                <SettingRow title="Font Style" subtitle="Select font style">
                  <select
                    value={fontStyle}
                    onChange={(e) => setFontStyle(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-(--border) bg-(--background) text-sm font-medium text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/30"
                  >
                    {Object.entries(FONT_STYLES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </SettingRow>
              </>
            )}

            {tab === "advanced" && (
              <>
                <SettingRow title="Case Sensitive" subtitle="Verification must match letter case">
                  <Toggle checked={caseSensitive} onChange={() => setCaseSensitive((v) => !v)} />
                </SettingRow>

                <SettingRow
                  title="Exclude Ambiguous"
                  subtitle="Skip confusing characters like O, 0, I, l"
                >
                  <Toggle
                    checked={excludeAmbiguous}
                    onChange={() => setExcludeAmbiguous((v) => !v)}
                  />
                </SettingRow>

                <div className="py-4">
                  <p className="text-sm font-semibold text-(--foreground)">Test Verification</p>
                  <p className="text-xs text-(--muted-foreground) mt-0.5 mb-3">
                    Try solving the current CAPTCHA
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter captcha text..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && verify()}
                      className="flex-1 h-11 px-4 rounded-xl border border-(--border) bg-(--background) text-(--foreground) text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)/30 transition-all"
                    />
                    <button
                      onClick={verify}
                      className="px-6 h-11 bg-(--primary) text-white font-medium text-sm rounded-xl hover:bg-(--primary)/90 transition-all active:scale-95"
                    >
                      Verify
                    </button>
                  </div>
                  {message && (
                    <div
                      className={`mt-3 p-3.5 rounded-xl flex items-center gap-3 ${
                        message.ok
                          ? "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
                          : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {message.ok ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 flex-shrink-0" />
                      )}
                      <span className="font-medium text-sm">{message.text}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {tab === "appearance" && (
              <>
                <SettingRow title="Text Color" subtitle="Character color scheme">
                  <select
                    value={palette}
                    onChange={(e) => setPalette(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-(--border) bg-(--background) text-sm font-medium text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/30"
                  >
                    <option value="multicolor">Multicolor</option>
                    <option value="navy">Navy</option>
                    <option value="black">Black</option>
                    <option value="primary">Blue</option>
                  </select>
                </SettingRow>

                <SettingRow title="Background" subtitle="Canvas background style">
                  <select
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-(--border) bg-(--background) text-sm font-medium text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/30"
                  >
                    <option value="gradient">Gradient</option>
                    <option value="plain">Plain White</option>
                    <option value="soft">Soft Gray</option>
                  </select>
                </SettingRow>
              </>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={regenerate}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-(--primary) text-white font-semibold text-base hover:bg-(--primary)/90 active:scale-[0.99] transition-all shadow-sm"
        >
          <RefreshCw className="w-5 h-5" />
          Generate New CAPTCHA
        </button>

        {/* Feature Trio */}
        <div className="bg-(--card) border border-(--border) rounded-2xl shadow-sm p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-500" />
              </span>
              <div>
                <p className="text-sm font-semibold text-(--foreground)">Secure</p>
                <p className="text-xs text-(--muted-foreground) mt-0.5">
                  Strong protection against bots
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/10 flex-shrink-0">
                <Zap className="w-5 h-5 text-green-500" />
              </span>
              <div>
                <p className="text-sm font-semibold text-(--foreground)">Fast</p>
                <p className="text-xs text-(--muted-foreground) mt-0.5">
                  Instant generation &amp; preview
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 flex-shrink-0">
                <Lock className="w-5 h-5 text-purple-500" />
              </span>
              <div>
                <p className="text-sm font-semibold text-(--foreground)">Private</p>
                <p className="text-xs text-(--muted-foreground) mt-0.5">
                  No data stored, 100% private
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-(--muted-foreground) text-center">
          Note: This demo generates and verifies captchas entirely in your browser. For production
          use, generation and validation must occur on the server.
        </p>
      </div>
    </div>
  );
};

export default CaptchaGenerator;
