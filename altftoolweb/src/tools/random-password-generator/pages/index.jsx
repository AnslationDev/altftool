"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Shield,
  ShieldCheck,
  Zap,
  Check,
  Eye,
  EyeOff,
  Copy,
  QrCode,
  RefreshCw,
  KeyRound,
  TrendingUp,
  Bookmark,
  Crown,
  ArrowRight,
  Code2,
  Globe,
  Trash2,
  Settings2,
  FileText,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

/* ---------------- secure generation logic ---------------- */
const POOLS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  space: " ",
  brackets: "{}[]()",
};
const SIMILAR = /[Il1LoO0]/g;

function randomIndex(max) {
  if (max <= 0) return 0;
  const arr = new Uint32Array(1);
  const limit = 0xffffffff - (0xffffffff % max);
  do {
    crypto.getRandomValues(arr);
  } while (arr[0] >= limit);
  return arr[0] % max;
}

function activePools(options) {
  const keys = ["upper", "lower", "numbers", "symbols", "space", "brackets"];
  let pools = keys.filter((k) => options[k]).map((k) => POOLS[k]);
  if (!options.similar) pools = pools.map((p) => p.replace(SIMILAR, ""));
  return pools.filter(Boolean);
}

function makePassword(length, options) {
  const pools = activePools(options);
  const chars = pools.join("");
  if (!chars) return "";
  const required = pools.map((p) => p[randomIndex(p.length)]);
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () => chars[randomIndex(chars.length)]);
  const arr = [...required, ...rest];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

function poolSize(options) {
  return activePools(options).reduce((t, p) => t + p.length, 0);
}

function evalStrength(length, options) {
  const entropy = Math.round(length * Math.log2(Math.max(poolSize(options), 1)));
  let score = Math.min(99, Math.round(entropy / 1.35));
  let label = "Very Strong";
  let level = "Excellent";
  let color = "var(--rpg-green)";
  if (entropy < 40) {
    label = "Weak";
    level = "Poor";
    color = "var(--rpg-danger)";
    score = Math.min(score, 35);
  } else if (entropy < 60) {
    label = "Fair";
    level = "Fair";
    color = "var(--rpg-amber)";
  } else if (entropy < 80) {
    label = "Strong";
    level = "Good";
    color = "var(--rpg-green)";
  }
  const crackTime =
    entropy >= 110
      ? "10 quintillion+ years"
      : entropy >= 90
        ? "billions of years"
        : entropy >= 70
          ? "thousands of years"
          : entropy >= 50
            ? "a few years"
            : "minutes";
  return { entropy, score, label, level, color, crackTime };
}

function colorize(pw) {
  return pw.split("").map((ch, i) => {
    if (/[0-9]/.test(ch)) return <span key={i} className="rpg-n">{ch}</span>;
    if (/[^A-Za-z0-9]/.test(ch)) return <span key={i} className="rpg-s">{ch}</span>;
    return <span key={i}>{ch}</span>;
  });
}

function timeLabel() {
  const d = new Date();
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

const SEED_HISTORY = [
  { pw: "A8#mL2@QvP9!Xe7$", bars: 6, time: "May 19, 10:24 AM" },
  { pw: "kL9$zN2@WpQd67Ty#", bars: 6, time: "May 19, 10:20 AM" },
  { pw: "Zp7@rT5#vBql29Lm$", bars: 3, time: "May 19, 10:15 AM" },
  { pw: "qR4$hY8@LmN34#bV%", bars: 6, time: "May 19, 10:10 AM" },
  { pw: "mT6@pL1#zQwE55yR", bars: 3, time: "May 19, 10:05 AM" },
];

const SEED_ACTIVITY = [
  { icon: KeyRound, tint: "blue", text: "Generated new password", time: "10:24 AM" },
  { icon: Copy, tint: "green", text: "Copied password to clipboard", time: "10:24 AM" },
  { icon: RefreshCw, tint: "amber", text: "Changed password length to 24", time: "10:23 AM" },
  { icon: Settings2, tint: "sky", text: "Enabled symbols in settings", time: "10:22 AM" },
  { icon: FileText, tint: "rose", text: "Generated passphrase", time: "10:20 AM" },
];

const CHAR_OPTIONS = [
  { k: "upper", label: "Uppercase (A–Z)", real: true },
  { k: "similar", label: "Similar Characters (Il1Lo0)", real: true },
  { k: "lower", label: "Lowercase (a–z)", real: true },
  { k: "ambiguous", label: "Ambiguous Characters ({ } [ ] ...)", real: false },
  { k: "numbers", label: "Numbers (0–9)", real: true },
  { k: "ext", label: "Extended ASCII", real: false },
  { k: "symbols", label: "Symbols (!@#$%)", real: true },
  { k: "exclude", label: "Exclude Characters", real: false },
  { k: "space", label: "Space", real: true },
  { k: "brackets", label: "Brackets ({ } [ ])", real: true },
];

/* ---------------- component ---------------- */
export default function ToolHome() {
  const [length, setLength] = useState(24);
  const [options, setOptions] = useState({
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
    similar: false,
    ambiguous: false,
    ext: false,
    exclude: false,
    space: false,
    brackets: false,
  });
  const [mins, setMins] = useState({ u: 2, l: 2, n: 2, s: 2 });
  const [toggles, setToggles] = useState({ avoidDup: true, pronounce: false, passphrase: false });
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(true);
  const [history, setHistory] = useState(SEED_HISTORY);
  const [genCount, setGenCount] = useState(562);
  const [copyCount, setCopyCount] = useState(143);

  const strength = useMemo(() => evalStrength(length, options), [length, options]);

  const generate = useCallback(() => {
    const pw = makePassword(length, options) || "—";
    setPassword(pw);
    setGenCount((c) => c + 1);
    const s = evalStrength(length, options);
    const bars = s.score >= 80 ? 6 : s.score >= 55 ? 4 : 3;
    setHistory((h) => [{ pw, bars, time: `May 19, ${timeLabel()}` }, ...h].slice(0, 6));
  }, [length, options]);

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, options]);

  const copyPassword = useCallback(async () => {
    const ok = await safeCopyText(password);
    if (ok) setCopyCount((c) => c + 1);
  }, [password]);

  const toggleOption = (k) => setOptions((o) => ({ ...o, [k]: !o[k] }));
  const stepMin = (k, d) => setMins((m) => ({ ...m, [k]: Math.max(0, Math.min(8, m[k] + d)) }));
  const flip = (k) => setToggles((t) => ({ ...t, [k]: !t[k] }));

  const pct = ((length - 8) / (128 - 8)) * 100;
  const filledBars = Math.round((strength.score / 100) * 6);
  const arcLen = 166;
  const arcOffset = 4 + (arcLen - 4) * (1 - strength.score / 100);

  return (
    <div className="rpg">
      <style>{RPG_CSS}</style>

      {/* HERO */}
      <header className="rpg-hero">
        <div className="rpg-wrap rpg-hero-grid">
          <div>
            <span className="rpg-pill">
              <Shield size={14} /> 100% Secure&nbsp;·&nbsp;Private&nbsp;·&nbsp;No Storage
            </span>
            <h1 className="rpg-h1">
              Generate Strong,
              <span className="rpg-accent">Secure Passwords</span>
            </h1>
            <p className="rpg-sub">Create random, highly secure passwords with advanced options. Your security is our priority.</p>
            <div className="rpg-feats">
              <div className="rpg-feat"><span className="rpg-fi"><Shield size={17} /></span><div><b>Military Grade</b><span>Encryption</span></div></div>
              <div className="rpg-feat"><span className="rpg-fi"><ShieldCheck size={17} /></span><div><b>Zero Knowledge</b><span>We don&apos;t store anything</span></div></div>
              <div className="rpg-feat"><span className="rpg-fi"><Zap size={17} /></span><div><b>Instant Results</b><span>Generated in one click</span></div></div>
            </div>
          </div>
          <div className="rpg-art">
            <div className="rpg-badge-mini">* * * *</div>
            <div className="rpg-dot rpg-d1"><Shield size={18} /></div>
            <div className="rpg-dot rpg-d2"><KeyRound size={18} /></div>
            <div className="rpg-dot rpg-d3"><Check size={18} /></div>
            <div className="rpg-shield">
              <svg viewBox="0 0 210 250" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="rpgSg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#93c5fd" />
                    <stop offset="1" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <path d="M105 8l88 34v72c0 60-40 104-88 128C57 218 17 174 17 114V42L105 8z" fill="url(#rpgSg)" opacity="0.95" />
                <path d="M105 26l70 27v62c0 49-33 85-70 105-37-20-70-56-70-105V53l70-27z" fill="#1e40af" opacity="0.25" />
                <rect x="72" y="112" width="66" height="54" rx="10" fill="#fff" />
                <path d="M84 112v-14a21 21 0 0142 0v14" stroke="#fff" strokeWidth="10" fill="none" />
                <circle cx="105" cy="135" r="8" fill="#2563eb" />
                <rect x="101" y="135" width="8" height="16" rx="4" fill="#2563eb" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <main className="rpg-wrap rpg-stage">
        {/* PASSWORD + STRENGTH */}
        <section className="rpg-card rpg-pw-card">
          <div className="rpg-pw-grid">
            <div>
              <div className="rpg-sec-title">Your Generated Password</div>
              <div className="rpg-pw-display">
                <div className="rpg-pw-text">{revealed ? colorize(password) : "•".repeat(password.length)}</div>
                <div className="rpg-pw-icons">
                  <button className="rpg-icon-btn" title="Show / Hide" onClick={() => setRevealed((r) => !r)}>
                    {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button className="rpg-icon-btn rpg-pri" title="Copy" onClick={copyPassword}><Copy size={18} /></button>
                </div>
              </div>
              <div className="rpg-pw-actions">
                <button className="rpg-btn rpg-primary" onClick={generate}><Zap size={16} /> Generate New</button>
                <button className="rpg-btn" onClick={copyPassword}><Copy size={16} /> Copy Password</button>
                <button className="rpg-btn rpg-icononly" title="QR code"><QrCode size={16} /></button>
              </div>
            </div>
            <div className="rpg-divider">
              <div className="rpg-strength-head">
                <div className="rpg-sec-title">Password Strength</div>
                <span className="rpg-vstrong" style={{ color: strength.color }}><ShieldCheck size={14} /> {strength.label}</span>
              </div>
              <div className="rpg-gauge-row">
                <div className="rpg-gauge">
                  <svg width="130" height="88" viewBox="0 0 130 88">
                    <path d="M12 82a53 53 0 0 1 106 0" fill="none" stroke="var(--rpg-track)" strokeWidth="11" strokeLinecap="round" />
                    <path d="M12 82a53 53 0 0 1 106 0" fill="none" stroke={strength.color} strokeWidth="11" strokeLinecap="round" strokeDasharray={arcLen} strokeDashoffset={arcOffset} />
                  </svg>
                  <div className="rpg-gnum">{strength.score}</div>
                  <div className="rpg-glbl">Score</div>
                </div>
                <div className="rpg-metrics">
                  <div className="rpg-metric"><span className="rpg-muted">Entropy</span><b>{strength.entropy} bits</b></div>
                  <div className="rpg-metric"><span className="rpg-muted">Crack Time</span><b>{strength.crackTime}</b></div>
                  <div className="rpg-metric rpg-noborder"><span className="rpg-muted">Security Level</span><span style={{ color: strength.color, fontWeight: 700 }}>{strength.level}</span></div>
                </div>
              </div>
              <div className="rpg-bars">
                {Array.from({ length: 6 }).map((_, i) => (
                  <i key={i} style={{ background: i < filledBars ? strength.color : "var(--rpg-track)" }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="rpg-card rpg-stats">
          <div className="rpg-stat"><span className="rpg-si" style={{ background: "#eff4ff", color: "#2563eb" }}><KeyRound size={20} /></span><div><div className="rpg-v">{genCount}</div><div className="rpg-k">Generated</div></div></div>
          <div className="rpg-stat"><span className="rpg-si" style={{ background: "#e9f9ef", color: "#16a34a" }}><TrendingUp size={20} /></span><div><div className="rpg-v">92%</div><div className="rpg-k">Strong Passwords</div></div></div>
          <div className="rpg-stat"><span className="rpg-si" style={{ background: "#fff5e6", color: "#d97706" }}><Copy size={20} /></span><div><div className="rpg-v">{copyCount}</div><div className="rpg-k">Copied Today</div></div></div>
          <div className="rpg-stat"><span className="rpg-si" style={{ background: "#f3efff", color: "#7c3aed" }}><Bookmark size={20} /></span><div><div className="rpg-v">38</div><div className="rpg-k">Saved Passwords</div></div></div>
        </section>

        {/* SETTINGS */}
        <section className="rpg-two">
          <div className="rpg-card rpg-pad">
            <div className="rpg-h5">Customize Your Password</div>
            <div className="rpg-len-row">
              <span className="rpg-muted rpg-sm">Password Length</span>
              <div className="rpg-lenbox">{length}</div>
            </div>
            <input
              type="range"
              min="8"
              max="128"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="rpg-range"
              style={{ "--pct": pct + "%" }}
            />
            <div className="rpg-range-ends"><span>8</span><span>128</span></div>
            <div className="rpg-opts-title">Character Options</div>
            <div className="rpg-opts">
              {CHAR_OPTIONS.map((opt) => (
                <label key={opt.k} className={`rpg-chk${options[opt.k] ? "" : " rpg-off"}`}>
                  <input type="checkbox" checked={!!options[opt.k]} onChange={() => toggleOption(opt.k)} />
                  <span className="rpg-mk"><Check size={13} /></span>
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="rpg-card rpg-pad">
            <div className="rpg-h5">Advanced Settings</div>
            {[
              { k: "u", label: "Minimum Uppercase" },
              { k: "l", label: "Minimum Lowercase" },
              { k: "n", label: "Minimum Numbers" },
              { k: "s", label: "Minimum Symbols" },
            ].map((row) => (
              <div key={row.k} className="rpg-adv-row">
                <span>{row.label}</span>
                <div className="rpg-stepper">
                  <button onClick={() => stepMin(row.k, -1)}>−</button>
                  <input value={mins[row.k]} readOnly />
                  <button onClick={() => stepMin(row.k, 1)}>+</button>
                </div>
              </div>
            ))}
            <div className="rpg-adv-row"><span>Avoid Duplicate Characters</span><button className={`rpg-sw${toggles.avoidDup ? " rpg-on" : ""}`} onClick={() => flip("avoidDup")} aria-label="Avoid duplicate characters" /></div>
            <div className="rpg-adv-row"><span>Pronounceable Password</span><button className={`rpg-sw${toggles.pronounce ? " rpg-on" : ""}`} onClick={() => flip("pronounce")} aria-label="Pronounceable password" /></div>
            <div className="rpg-adv-row rpg-noborder"><span>Generate Passphrase Mode</span><button className={`rpg-sw${toggles.passphrase ? " rpg-on" : ""}`} onClick={() => flip("passphrase")} aria-label="Passphrase mode" /></div>
          </div>
        </section>

        {/* BEST PRACTICES */}
        <section className="rpg-bp">
          <div className="rpg-bicon"><Zap size={22} /></div>
          <h4 className="rpg-bp-title">Password Best Practices</h4>
          <div className="rpg-bp-item"><Check size={16} className="rpg-ok" /> Use at least 16 characters for maximum security.</div>
          <div className="rpg-bp-item"><Check size={16} className="rpg-ok" /> Enable Two-Factor Authentication (MFA).</div>
          <div className="rpg-bp-item"><Check size={16} className="rpg-ok" /> Never reuse passwords across multiple accounts.</div>
          <div className="rpg-bp-item"><Check size={16} className="rpg-ok" /> Avoid using dictionary words or personal info.</div>
        </section>

        {/* HISTORY + ACTIVITY */}
        <section className="rpg-hist">
          <div className="rpg-card rpg-pad">
            <div className="rpg-card-head"><b>Password History</b><a className="rpg-link" href="#history">View All</a></div>
            <table className="rpg-table">
              <thead><tr><th>Password</th><th>Strength</th><th>Created Time</th><th>Actions</th></tr></thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={i}>
                    <td className="rpg-monocell">{row.pw.length > 17 ? row.pw.slice(0, 17) : row.pw}</td>
                    <td>
                      <span className="rpg-strbar">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <i key={j} className={j < row.bars ? (row.bars >= 6 ? "rpg-g" : "rpg-a") : ""} />
                        ))}
                      </span>
                    </td>
                    <td className="rpg-muted">{row.time}</td>
                    <td><span className="rpg-rowact"><Copy size={15} /><Trash2 size={15} className="rpg-del" /></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rpg-card rpg-pad">
            <div className="rpg-card-head"><b>Recent Activity</b><a className="rpg-link" href="#activity">View All</a></div>
            <div>
              {SEED_ACTIVITY.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} className={`rpg-act${i === SEED_ACTIVITY.length - 1 ? " rpg-noborder" : ""}`}>
                    <span className="rpg-ai" data-tint={a.tint}><Icon size={16} /></span>
                    <span className="rpg-at">{a.text}</span>
                    <span className="rpg-atime">{a.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PRO */}
        <section className="rpg-pro">
          <div className="rpg-crown"><Crown size={26} /></div>
          <div>
            <h3>Unlock More with AltFTool Pro</h3>
            <p>Get unlimited history, cloud sync, and advanced password management across all your devices.</p>
          </div>
          <button className="rpg-up">Upgrade to Pro <ArrowRight size={16} /></button>
        </section>

        {/* FOOTER */}
        <section className="rpg-foot">
          <div className="rpg-ff"><span className="rpg-ffi"><Shield size={18} /></span><div><b>No Data Storage</b><span>We never store or track your passwords.</span></div></div>
          <div className="rpg-ff"><span className="rpg-ffi"><Code2 size={18} /></span><div><b>Open Source Friendly</b><span>Transparent, auditable and developer trusted.</span></div></div>
          <div className="rpg-ff"><span className="rpg-ffi"><Globe size={18} /></span><div><b>Works Everywhere</b><span>Accessible on all devices and modern browsers.</span></div></div>
        </section>
        <div className="rpg-copy">© 2025 AltFTool. All rights reserved.</div>
      </main>
    </div>
  );
}

/* ---------------- scoped styles ---------------- */
const RPG_CSS = `
.rpg{
  --rpg-page:var(--background,#f4f6fb); --rpg-surface:var(--card,#fff); --rpg-soft:#eef3f8;
  --rpg-border:var(--border,#e6ebf2); --rpg-border-strong:#d5deea;
  --rpg-text:var(--foreground,#0f172a); --rpg-muted:var(--muted-foreground,#64748b); --rpg-muted2:#94a3b8;
  --rpg-blue:#2563eb; --rpg-green:#16a34a; --rpg-amber:#f59e0b; --rpg-danger:#e11d48;
  --rpg-track:#e6ebf2; --rpg-radius:16px;
  background:var(--rpg-page); color:var(--rpg-text);
  font-family:"Geist",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}
[data-theme="dark"] .rpg{
  --rpg-page:#070d18; --rpg-surface:#101827; --rpg-soft:#142033; --rpg-border:#1e293b; --rpg-border-strong:#243449;
  --rpg-text:#f8fafc; --rpg-muted:#94a3b8; --rpg-muted2:#64748b; --rpg-track:#1e293b;
}
.rpg *{box-sizing:border-box}
.rpg .rpg-wrap{max-width:1000px;margin:0 auto;padding:0 20px}
.rpg .rpg-card{background:var(--rpg-surface);border:1px solid var(--rpg-border);border-radius:var(--rpg-radius);box-shadow:0 1px 2px rgba(15,23,42,.06)}
.rpg .rpg-muted{color:var(--rpg-muted)} .rpg .rpg-sm{font-size:13.5px}
.rpg button{font-family:inherit;cursor:pointer}
.rpg .rpg-monocell,.rpg .rpg-pw-text,.rpg .rpg-badge-mini{font-family:"Geist Mono",ui-monospace,SFMono-Regular,Menlo,monospace}

.rpg .rpg-hero{background:radial-gradient(1200px 500px at 78% 25%,rgba(59,130,246,.25),transparent 60%),linear-gradient(135deg,#0a1024,#101a3a 55%,#1b1746);color:#fff;padding:56px 0 120px;overflow:hidden}
.rpg .rpg-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:24px;align-items:center}
.rpg .rpg-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);color:#c7d5ee;padding:7px 14px;border-radius:999px;font-size:12.5px;font-weight:600}
.rpg .rpg-h1{font-size:52px;line-height:1.05;font-weight:800;margin:20px 0 0;letter-spacing:-1px}
.rpg .rpg-accent{display:block;background:linear-gradient(90deg,#3b82f6,#60a5fa);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.rpg .rpg-sub{color:#aebbd4;font-size:16px;line-height:1.6;margin:18px 0 26px;max-width:440px}
.rpg .rpg-feats{display:flex;gap:26px;flex-wrap:wrap}
.rpg .rpg-feat{display:flex;gap:10px;align-items:flex-start}
.rpg .rpg-fi{width:34px;height:34px;border-radius:9px;background:rgba(59,130,246,.16);display:grid;place-items:center;flex:0 0 auto;color:#93c5fd}
.rpg .rpg-feat b{font-size:13.5px;display:block} .rpg .rpg-feat span{font-size:12px;color:#93a2be}
.rpg .rpg-art{position:relative;height:340px}
.rpg .rpg-shield{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:210px;height:250px;filter:drop-shadow(0 30px 50px rgba(37,99,235,.45))}
.rpg .rpg-badge-mini{position:absolute;left:6%;top:44%;background:rgba(17,26,58,.7);border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:8px 12px;color:#cdd9f0;letter-spacing:2px;font-size:14px}
.rpg .rpg-dot{position:absolute;width:40px;height:40px;border-radius:11px;background:rgba(20,30,64,.75);border:1px solid rgba(255,255,255,.12);display:grid;place-items:center;color:#8fb0f5}
.rpg .rpg-d1{right:8%;top:20%} .rpg .rpg-d2{right:2%;top:54%} .rpg .rpg-d3{left:18%;top:12%}

.rpg .rpg-stage{margin-top:-92px;position:relative;z-index:2;padding-bottom:60px}
.rpg .rpg-pw-card{padding:26px}
.rpg .rpg-pw-grid{display:grid;grid-template-columns:1.35fr 1fr;gap:26px}
.rpg .rpg-divider{border-left:1px solid var(--rpg-border);padding-left:26px}
.rpg .rpg-sec-title{font-size:15px;font-weight:700}
.rpg .rpg-pw-display{margin-top:14px;background:var(--rpg-soft);border:1px solid var(--rpg-border);border-radius:12px;padding:18px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.rpg .rpg-pw-text{font-size:26px;letter-spacing:1px;font-weight:600;word-break:break-all}
.rpg .rpg-pw-text .rpg-n{color:var(--rpg-blue)} .rpg .rpg-pw-text .rpg-s{color:#e11d48}
.rpg .rpg-pw-icons{display:flex;gap:10px;flex:0 0 auto}
.rpg .rpg-icon-btn{width:44px;height:44px;border-radius:10px;border:1px solid var(--rpg-border);background:var(--rpg-surface);display:grid;place-items:center;color:var(--rpg-muted)}
.rpg .rpg-icon-btn.rpg-pri{background:var(--rpg-blue);border-color:var(--rpg-blue);color:#fff}
.rpg .rpg-pw-actions{display:flex;gap:12px;margin-top:16px;flex-wrap:wrap}
.rpg .rpg-btn{height:48px;border-radius:11px;border:1px solid var(--rpg-border);background:var(--rpg-surface);color:var(--rpg-text);padding:0 20px;font-weight:600;font-size:14px;display:flex;align-items:center;gap:9px}
.rpg .rpg-btn.rpg-primary{background:var(--rpg-blue);border-color:var(--rpg-blue);color:#fff;box-shadow:0 8px 20px rgba(37,99,235,.28)}
.rpg .rpg-btn.rpg-icononly{padding:0 14px}
.rpg .rpg-strength-head{display:flex;align-items:center;justify-content:space-between}
.rpg .rpg-vstrong{font-weight:700;font-size:13px;display:inline-flex;align-items:center;gap:6px}
.rpg .rpg-gauge-row{display:flex;align-items:center;gap:20px;margin-top:8px}
.rpg .rpg-gauge{position:relative;width:130px;height:88px;flex:0 0 auto}
.rpg .rpg-gnum{position:absolute;left:0;right:0;top:40px;text-align:center;font-size:30px;font-weight:800}
.rpg .rpg-glbl{position:absolute;left:0;right:0;top:72px;text-align:center;font-size:11px;color:var(--rpg-muted)}
.rpg .rpg-metrics{flex:1}
.rpg .rpg-metric{display:flex;justify-content:space-between;font-size:13px;padding:7px 0;border-bottom:1px dashed var(--rpg-border)}
.rpg .rpg-metric.rpg-noborder{border-bottom:0}
.rpg .rpg-bars{display:flex;gap:8px;margin-top:16px}
.rpg .rpg-bars i{height:8px;flex:1;border-radius:6px}

.rpg .rpg-stats{display:grid;grid-template-columns:repeat(4,1fr);margin-top:22px;padding:20px 8px}
.rpg .rpg-stat{display:flex;align-items:center;gap:14px;padding:0 18px;border-right:1px solid var(--rpg-border)}
.rpg .rpg-stat:last-child{border-right:0}
.rpg .rpg-si{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;flex:0 0 auto}
.rpg .rpg-v{font-size:22px;font-weight:800;line-height:1}
.rpg .rpg-k{font-size:12.5px;color:var(--rpg-muted);margin-top:3px}

.rpg .rpg-two{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:22px}
.rpg .rpg-pad{padding:24px}
.rpg .rpg-h5{font-size:16px;font-weight:700;margin:0 0 18px}
.rpg .rpg-len-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.rpg .rpg-lenbox{min-width:60px;height:34px;padding:0 10px;border:1px solid var(--rpg-border);border-radius:9px;display:grid;place-items:center;font-weight:700;font-size:14px}
.rpg .rpg-range{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:6px;background:linear-gradient(90deg,var(--rpg-blue) var(--pct,60%),var(--rpg-soft) var(--pct,60%));outline:none;margin:12px 0 4px}
.rpg .rpg-range::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:var(--rpg-blue);border:3px solid #fff;box-shadow:0 2px 6px rgba(37,99,235,.5);cursor:pointer}
.rpg .rpg-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:var(--rpg-blue);border:3px solid #fff;cursor:pointer}
.rpg .rpg-range-ends{display:flex;justify-content:space-between;font-size:12px;color:var(--rpg-muted2)}
.rpg .rpg-opts-title{font-size:13px;font-weight:700;margin:22px 0 12px}
.rpg .rpg-opts{display:grid;grid-template-columns:1fr 1fr;gap:12px 18px}
.rpg .rpg-chk{display:flex;align-items:center;gap:10px;font-size:13.5px;color:var(--rpg-text);cursor:pointer;user-select:none}
.rpg .rpg-chk input{display:none}
.rpg .rpg-mk{width:20px;height:20px;border-radius:6px;border:1.5px solid var(--rpg-border-strong);display:grid;place-items:center;color:#fff;flex:0 0 auto}
.rpg .rpg-mk svg{opacity:0}
.rpg .rpg-chk input:checked + .rpg-mk{background:var(--rpg-blue);border-color:var(--rpg-blue)}
.rpg .rpg-chk input:checked + .rpg-mk svg{opacity:1}
.rpg .rpg-chk.rpg-off{color:var(--rpg-muted2)}
.rpg .rpg-adv-row{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid var(--rpg-border);font-size:14px}
.rpg .rpg-adv-row.rpg-noborder{border-bottom:0}
.rpg .rpg-stepper{display:flex;align-items:center;border:1px solid var(--rpg-border);border-radius:9px;overflow:hidden}
.rpg .rpg-stepper input{width:40px;border:0;text-align:center;font-weight:700;font-size:14px;padding:6px 0;background:var(--rpg-surface);color:var(--rpg-text)}
.rpg .rpg-stepper button{width:30px;border:0;background:var(--rpg-soft);color:var(--rpg-muted);font-size:15px;height:34px}
.rpg .rpg-sw{width:44px;height:26px;border-radius:999px;background:var(--rpg-border-strong);position:relative;transition:.2s;flex:0 0 auto;border:0;padding:0}
.rpg .rpg-sw.rpg-on{background:var(--rpg-blue)}
.rpg .rpg-sw::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.rpg .rpg-sw.rpg-on::after{left:21px}

.rpg .rpg-bp{margin-top:22px;background:linear-gradient(135deg,#eff4ff,#f5f8ff);border:1px solid #dbe6fb;border-radius:var(--rpg-radius);padding:24px;display:grid;grid-template-columns:auto 1fr 1fr;gap:18px 40px;align-items:start}
[data-theme="dark"] .rpg .rpg-bp{background:linear-gradient(135deg,#0e1a33,#101a2e);border-color:#1e335c}
.rpg .rpg-bicon{width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,#3b82f6,#6366f1);display:grid;place-items:center;grid-row:span 3;color:#fff}
.rpg .rpg-bp-title{grid-column:2/4;margin:0;color:var(--rpg-blue);font-size:16px;font-weight:700}
.rpg .rpg-bp-item{display:flex;gap:9px;font-size:13.5px;color:var(--rpg-text);align-items:flex-start;opacity:.92}
.rpg .rpg-ok{color:var(--rpg-green);flex:0 0 auto;margin-top:1px}

.rpg .rpg-hist{margin-top:22px;display:grid;grid-template-columns:1.25fr 1fr;gap:22px}
.rpg .rpg-card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.rpg .rpg-card-head b{font-size:16px}
.rpg .rpg-link{color:var(--rpg-blue);font-size:13px;font-weight:600;text-decoration:none}
.rpg .rpg-table{width:100%;border-collapse:collapse}
.rpg .rpg-table th{text-align:left;font-size:11.5px;text-transform:uppercase;letter-spacing:.4px;color:var(--rpg-muted2);font-weight:600;padding:12px 6px;border-bottom:1px solid var(--rpg-border)}
.rpg .rpg-table td{padding:12px 6px;font-size:13px;border-bottom:1px solid var(--rpg-border)}
.rpg .rpg-strbar{display:inline-flex;gap:3px}
.rpg .rpg-strbar i{width:8px;height:8px;border-radius:50%;background:var(--rpg-border-strong)}
.rpg .rpg-strbar i.rpg-g{background:var(--rpg-green)} .rpg .rpg-strbar i.rpg-a{background:var(--rpg-amber)}
.rpg .rpg-rowact{display:flex;gap:10px;color:var(--rpg-muted2)}
.rpg .rpg-rowact .rpg-del{color:#e11d48;cursor:pointer} .rpg .rpg-rowact svg{cursor:pointer}
.rpg .rpg-act{display:flex;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid var(--rpg-border)}
.rpg .rpg-act.rpg-noborder{border-bottom:0}
.rpg .rpg-ai{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;flex:0 0 auto}
.rpg .rpg-ai[data-tint=blue]{background:#eff4ff;color:#2563eb}
.rpg .rpg-ai[data-tint=green]{background:#e9f9ef;color:#16a34a}
.rpg .rpg-ai[data-tint=amber]{background:#fff5e6;color:#d97706}
.rpg .rpg-ai[data-tint=sky]{background:#eef7ff;color:#0ea5e9}
.rpg .rpg-ai[data-tint=rose]{background:#fdeef0;color:#e11d48}
.rpg .rpg-at{font-size:13.5px;font-weight:500}
.rpg .rpg-atime{margin-left:auto;font-size:12px;color:var(--rpg-muted2)}

.rpg .rpg-pro{margin-top:24px;background:linear-gradient(120deg,#101a3a,#152a63 60%,#1e2b6b);border-radius:var(--rpg-radius);padding:26px 28px;display:flex;align-items:center;gap:20px;color:#fff}
.rpg .rpg-crown{width:60px;height:60px;border-radius:14px;background:linear-gradient(135deg,#3b82f6,#6366f1);display:grid;place-items:center;flex:0 0 auto}
.rpg .rpg-pro h3{margin:0 0 4px;font-size:19px}
.rpg .rpg-pro p{margin:0;color:#b9c5e0;font-size:13.5px;max-width:520px}
.rpg .rpg-up{margin-left:auto;background:#fff;color:#0f1e3d;border:0;border-radius:11px;height:48px;padding:0 22px;font-weight:700;display:flex;align-items:center;gap:8px}

.rpg .rpg-foot{margin-top:26px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:26px 0}
.rpg .rpg-ff{display:flex;gap:12px;align-items:flex-start}
.rpg .rpg-ffi{width:40px;height:40px;border-radius:11px;background:var(--rpg-soft);display:grid;place-items:center;color:var(--rpg-blue);flex:0 0 auto}
.rpg .rpg-ff b{font-size:14px} .rpg .rpg-ff span{font-size:12.5px;color:var(--rpg-muted);display:block;margin-top:2px}
.rpg .rpg-copy{text-align:center;color:var(--rpg-muted2);font-size:12.5px;padding:8px 0 40px}

@media(max-width:880px){
  .rpg .rpg-hero-grid,.rpg .rpg-pw-grid,.rpg .rpg-two,.rpg .rpg-hist,.rpg .rpg-foot,.rpg .rpg-bp{grid-template-columns:1fr}
  .rpg .rpg-stats{grid-template-columns:1fr 1fr;gap:16px}
  .rpg .rpg-stat{border-right:0}
  .rpg .rpg-art{display:none}
  .rpg .rpg-h1{font-size:36px}
  .rpg .rpg-divider{border-left:0;border-top:1px solid var(--rpg-border);padding-left:0;padding-top:20px}
  .rpg .rpg-bp-title{grid-column:1}
}
`;
