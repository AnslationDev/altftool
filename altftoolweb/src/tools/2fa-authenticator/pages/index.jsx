"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Copy,
  Database,
  Eye,
  EyeOff,
  Hash,
  KeyRound,
  Lock,
  LockKeyhole,
  Plus,
  QrCode,
  RefreshCw,
  ScanLine,
  Settings2,
  Shield,
  ShieldCheck,
  Sparkles,
  Timer,
  Trash2,
  Unlock,
  Upload,
  User,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import {
  ALGORITHMS,
  DIGIT_OPTIONS,
  PERIOD_OPTIONS,
  formatCode,
  generateTOTP,
  isValidSecret,
  parseOtpAuthUri,
} from "../lib/totp";
import * as vault from "../lib/vault";

// Security: no hardcoded/demo secret. The tool must never generate an OTP until
// the user explicitly provides their own Base32 secret or scans a QR code.
const CLIPBOARD_CLEAR_MS = 30000;
const AUTO_LOCK_MS = 5 * 60 * 1000;

const HERO_BADGES = [
  { icon: ShieldCheck, label: "100% Client-Side" },
  { icon: Database, label: "No Data Stored" },
  { icon: Zap, label: "Works Offline" },
  { icon: Clock, label: "RFC 6238 Compatible" },
];

const FEATURES = [
  { icon: Lock, title: "Privacy First", text: "Everything runs in your browser. Your secrets never leave your device." },
  { icon: Database, title: "Zero Storage", text: "We don't store your secrets. No database. No cloud. Just you and your device." },
  { icon: Zap, title: "Instant & Accurate", text: "Generate codes instantly with precise 30-second synchronization." },
  { icon: ShieldCheck, title: "Wide Compatibility", text: "Works with Google Authenticator, Authy, Microsoft Authenticator, 2FAS and many more." },
  { icon: WifiOff, title: "Works Offline", text: "No internet? No problem. Generate codes anytime, anywhere." },
];

const STEPS = [
  { icon: KeyRound, title: "Add Your Account", text: "Enter your secret key manually or scan the QR code provided by your service." },
  { icon: ShieldCheck, title: "Generate Code", text: "We use TOTP (Time-based One-Time Password) algorithm to generate secure codes." },
  { icon: Timer, title: "Auto Refresh", text: "A new code is generated every 30 seconds automatically." },
  { icon: ClipboardCheck, title: "Copy & Use", text: "Copy the code and use it to verify your identity securely." },
];

const TRUST_LEFT = [
  { title: "100% Client-Side", text: "All processing happens in your browser" },
  { title: "No Tracking", text: "We don't track or collect anything" },
];

const TRUST_RIGHT = [
  { title: "AES-256 Encrypted", text: "Secrets are encrypted before they're stored" },
  { title: "Your Control", text: "You are in control of your data" },
];

const ADVANCED_INFO = [
  { icon: Settings2, title: "Algorithm", text: "Choose between SHA1, SHA256, SHA512" },
  { icon: Hash, title: "Digits", text: "Select 6 or 8 digit codes" },
  { icon: Clock, title: "Period", text: "Customize time period (15s, 30s, 45s, 60s)" },
  { icon: CalendarClock, title: "Counter / Time", text: "Advanced users can set custom time" },
];

/* ---------------------------------------------------------------------------
 * Decorative QR pattern (deterministic — SSR/hydration safe)
 * ------------------------------------------------------------------------- */
const QR_N = 17;
const QR_CELLS = (() => {
  const cells = [];
  for (let row = 0; row < QR_N; row++) {
    for (let col = 0; col < QR_N; col++) {
      const inFinder =
        (row < 5 && col < 5) || (row < 5 && col >= QR_N - 5) || (row >= QR_N - 5 && col < 5);
      if (!inFinder && (row * 3 + col * 7 + row * col) % 7 < 3) cells.push([row, col]);
    }
  }
  return cells;
})();

/* ---------------------------------------------------------------------------
 * Brand glyphs (inline SVG, no external requests)
 * ------------------------------------------------------------------------- */
function GoogleGlyph({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function MicrosoftGlyph({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 21 21" className={className} aria-hidden>
      <rect x="0" y="0" width="10" height="10" fill="#f25022" />
      <rect x="11" y="0" width="10" height="10" fill="#7fba00" />
      <rect x="0" y="11" width="10" height="10" fill="#00a4ef" />
      <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
    </svg>
  );
}

function GitHubGlyph({ className = "h-6 w-6 text-white" }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function AwsGlyph({ dark = false }) {
  return (
    <span className="flex flex-col items-center leading-none" aria-hidden>
      <span className={`text-[11px] font-extrabold tracking-tight ${dark ? "text-white" : "text-slate-800 dark:text-slate-100"}`}>
        aws
      </span>
      <svg viewBox="0 0 24 8" className="mt-0.5 h-2 w-6">
        <path d="M2 2c5 4.5 15 4.5 20 0" stroke="#f90" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M19.5 1.2 22 2l-.9 2.4" stroke="#f90" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function FacebookGlyph({ className = "h-5 w-5 text-white" }) {
  return (
    <svg viewBox="0 0 320 512" className={className} fill="currentColor" aria-hidden>
      <path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4.4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="white" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="0.7" fill="white" stroke="none" />
      </svg>
    </span>
  );
}

function DiscordGlyph({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 640 512" className={className} fill="#5865F2" aria-hidden>
      <path d="M524.531 69.836a1.5 1.5 0 0 0-.764-.7A485.065 485.065 0 0 0 404.081 32.03a1.816 1.816 0 0 0-1.923.91 337.461 337.461 0 0 0-14.9 30.6 447.848 447.848 0 0 0-134.426 0 309.541 309.541 0 0 0-15.135-30.6 1.89 1.89 0 0 0-1.924-.91 483.689 483.689 0 0 0-119.688 37.107 1.712 1.712 0 0 0-.788.676C39.068 183.651 18.186 294.69 28.43 404.354a2.016 2.016 0 0 0 .765 1.375 487.666 487.666 0 0 0 146.825 74.189 1.9 1.9 0 0 0 2.063-.676 348.2 348.2 0 0 0 30.014-48.815 1.86 1.86 0 0 0-1.019-2.588 321.173 321.173 0 0 1-45.868-21.853 1.885 1.885 0 0 1-.185-3.126c3.082-2.309 6.166-4.711 9.109-7.137a1.819 1.819 0 0 1 1.9-.256c96.229 43.917 200.41 43.917 295.5 0a1.812 1.812 0 0 1 1.924.233c2.944 2.426 6.027 4.851 9.132 7.16a1.884 1.884 0 0 1-.162 3.126 301.407 301.407 0 0 1-45.89 21.83 1.875 1.875 0 0 0-1 2.611 391.055 391.055 0 0 0 30.014 48.815 1.864 1.864 0 0 0 2.063.7A486.048 486.048 0 0 0 610.7 405.729a1.882 1.882 0 0 0 .765-1.352C623.729 277.594 590.933 167.465 524.531 69.836ZM222.491 337.58c-28.972 0-52.844-26.587-52.844-59.239s23.409-59.241 52.844-59.241c29.665 0 53.306 26.82 52.843 59.239 0 32.654-23.41 59.241-52.843 59.241Zm195.38 0c-28.971 0-52.843-26.587-52.843-59.239s23.409-59.241 52.843-59.241c29.667 0 53.307 26.82 52.844 59.239 0 32.654-23.177 59.241-52.844 59.241Z" />
    </svg>
  );
}

function DropboxGlyph({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 528 512" className={className} fill="#0061FF" aria-hidden>
      <path d="M264.4 116.3l-132 84.3 132 84.3-132 84.3L0 284.1l132.3-84.3L0 116.3 132.3 32l132.1 84.3zM131.6 395.7l132-84.3 132 84.3-132 84.3-132-84.3zm132.8-111.6l132-84.3-132-83.6L395.7 32 528 116.3l-132.3 84.3L528 284.9l-132.3 84.3-131.3-85.1z" />
    </svg>
  );
}

const SERVICES = [
  { name: "Google", chipClass: "", node: <GoogleGlyph /> },
  { name: "Microsoft", chipClass: "", node: <MicrosoftGlyph /> },
  { name: "GitHub", chipClass: "!bg-slate-900 !border-slate-900", node: <GitHubGlyph /> },
  { name: "AWS", chipClass: "", node: <AwsGlyph /> },
  { name: "Facebook", chipClass: "!bg-[#1877F2] !border-[#1877F2]", node: <FacebookGlyph /> },
  { name: "Instagram", chipClass: "", node: <InstagramGlyph /> },
  { name: "Discord", chipClass: "", node: <DiscordGlyph /> },
  { name: "Dropbox", chipClass: "", node: <DropboxGlyph /> },
  { name: "Coinbase", chipClass: "!bg-[#0052FF] !border-[#0052FF]", node: <span className="text-lg font-extrabold text-white">C</span> },
  { name: "And More", chipClass: "", node: <span className="text-lg font-bold tracking-widest text-[var(--muted-foreground)]">···</span> },
];

/* ---------------------------------------------------------------------------
 * Decorative components
 * ------------------------------------------------------------------------- */
function DashedArrow() {
  return (
    <svg viewBox="0 0 34 12" className="mt-6 hidden h-3 w-8 shrink-0 text-blue-200 lg:block dark:text-slate-700" fill="none" aria-hidden>
      <path d="M1 6h24" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 3" strokeLinecap="round" />
      <path d="M26 2l6 4-6 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StepConnector() {
  return (
    <div className="mt-8 hidden flex-1 items-center px-1 lg:flex" aria-hidden>
      <div className="flex-1 border-t-2 border-dashed border-blue-100 dark:border-slate-700" />
      <svg viewBox="0 0 8 12" className="ml-0.5 h-3 w-2 text-blue-200 dark:text-slate-600" fill="none">
        <path d="M1 1l6 5-6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ShieldMark({ className = "h-24 w-24", idPrefix = "sm" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${idPrefix}-grad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path d="M32 3l23 8.5V30c0 14.8-9.8 25.1-23 30.6C18.8 55.1 9 44.8 9 30V11.5z" fill={`url(#${idPrefix}-grad)`} />
      <path d="M32 3l23 8.5V30c0 14.8-9.8 25.1-23 30.6z" fill="#1d4ed8" opacity="0.32" />
      <path d="M25.5 28v-4.5a6.5 6.5 0 0 1 13 0V28" stroke="#dbeafe" strokeWidth="3.6" fill="none" strokeLinecap="round" />
      <rect x="21.5" y="27.5" width="21" height="15.5" rx="3.5" fill="#1e3a8a" />
      <circle cx="32" cy="34" r="2.4" fill="#93c5fd" />
      <rect x="30.9" y="35" width="2.2" height="4.2" rx="1.1" fill="#93c5fd" />
    </svg>
  );
}

function PhoneIllustration({ code }) {
  return (
    <div className="relative hidden w-48 shrink-0 lg:block" aria-hidden>
      <div className="absolute -left-4 -top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-600/30">
        <ShieldCheck className="h-5 w-5 text-white" />
      </div>
      <div className="ml-4 w-40 rotate-6 rounded-[1.9rem] bg-gradient-to-br from-indigo-500 to-violet-500 p-1.5 shadow-xl shadow-indigo-500/25">
        <div className="rounded-[1.5rem] bg-white p-3 dark:bg-slate-950">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="mx-auto mb-2 w-fit rounded-md bg-blue-50 px-2 py-1 font-mono text-[11px] font-bold tracking-widest text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            {code ? formatCode(code) : "•••  •••"}
          </div>
          <svg viewBox="0 0 68 68" className="mx-auto block h-24 w-24 text-slate-900 dark:text-slate-100">
            {[[0, 0], [48, 0], [0, 48]].map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <rect x={x} y={y} width="20" height="20" fill="currentColor" />
                <rect x={x + 4} y={y + 4} width="12" height="12" className="fill-white dark:fill-slate-950" />
                <rect x={x + 8} y={y + 8} width="4" height="4" fill="currentColor" />
              </g>
            ))}
            {QR_CELLS.map(([row, col]) => (
              <rect key={`${row}-${col}`} x={col * 4} y={row * 4} width="4" height="4" fill="currentColor" />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */
function loadImageData(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(data);
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });
}

function Card({ className = "", children }) {
  return (
    <section
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-shadow dark:shadow-black/20 ${className}`}
    >
      {children}
    </section>
  );
}

function AccountAvatar({ name }) {
  const key = String(name || "").trim().toLowerCase();
  const base = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full";
  if (key === "google") {
    return (
      <span className={`${base} border border-[var(--border)] bg-white dark:bg-slate-100`}>
        <GoogleGlyph className="h-5 w-5" />
      </span>
    );
  }
  if (key === "github") {
    return (
      <span className={`${base} bg-slate-900 ring-1 ring-slate-700`}>
        <GitHubGlyph className="h-5 w-5 text-white" />
      </span>
    );
  }
  if (key === "aws") {
    return (
      <span className={`${base} bg-slate-900 ring-1 ring-slate-700`}>
        <AwsGlyph dark />
      </span>
    );
  }
  return (
    <span className={`${base} bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300`}>
      {String(name || "AC").slice(0, 2).toUpperCase()}
    </span>
  );
}

/* (FAQ now lives in the site's SEO section to avoid duplication.)
 *
 * ---------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------- */
export default function ToolHome() {
  const [tab, setTab] = useState("manual");
  const [secret, setSecret] = useState(""); // start empty — no OTP until user input
  const [accountName, setAccountName] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [algorithm, setAlgorithm] = useState("SHA1");
  const [digits, setDigits] = useState(6);
  const [period, setPeriod] = useState(30);
  const [advancedOpen, setAdvancedOpen] = useState(true);

  const [now, setNow] = useState(0);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [copied, setCopied] = useState(false);
  const [justGenerated, setJustGenerated] = useState(false);

  // Saved accounts — secrets are kept ONLY in a ref (never React state / DevTools).
  const secretsRef = useRef(new Map());
  const [accountsMeta, setAccountsMeta] = useState([]); // {id,name,email,algorithm,digits,period}
  const [accountCodes, setAccountCodes] = useState({});
  const [copiedId, setCopiedId] = useState("");
  const [showAllAccounts, setShowAllAccounts] = useState(false);

  const [recent, setRecent] = useState([]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [qrStatus, setQrStatus] = useState("");
  const [toast, setToast] = useState("");

  // Vault status
  const [vaultReady, setVaultReady] = useState(false);
  const [vaultState, setVaultState] = useState({ supported: true, mode: "none", locked: false });
  const [securityOpen, setSecurityOpen] = useState(false);

  // Passphrase modal
  const [ppModal, setPpModal] = useState(null); // "enable" | "change" | "disable"
  const [pp1, setPp1] = useState("");
  const [pp2, setPp2] = useState("");
  const [unlockInput, setUnlockInput] = useState("");
  const [ppError, setPpError] = useState("");
  const [ppBusy, setPpBusy] = useState(false);

  const fileInputRef = useRef(null);
  const lastRecordedRef = useRef("");
  const clipboardTimer = useRef(null);
  const autoLockTimer = useRef(null);
  const vaultModeRef = useRef("none");

  vaultModeRef.current = vaultState.mode;

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  /* -------- account memory helpers (secrets via ref, never state) -------- */
  const buildFullAccounts = (meta) =>
    meta
      .map((m) => ({ ...m, secret: secretsRef.current.get(m.id) || "" }))
      .filter((a) => a.secret);

  const applyAccounts = (accounts) => {
    const map = new Map();
    const meta = accounts.map((a) => {
      map.set(a.id, a.secret);
      return { id: a.id, name: a.name, email: a.email, algorithm: a.algorithm, digits: a.digits, period: a.period };
    });
    secretsRef.current = map;
    setAccountsMeta(meta);
  };

  const clearSecretsFromMemory = () => {
    secretsRef.current.clear();
    secretsRef.current = new Map();
    setAccountsMeta([]);
    setAccountCodes({});
  };

  const persistAccounts = async (meta) => {
    try {
      await vault.saveAccounts(buildFullAccounts(meta));
    } catch {
      showToast("Could not save to encrypted storage.");
    }
  };

  /* ---------------- init vault + clock ---------------- */
  useEffect(() => {
    let alive = true;
    (async () => {
      const status = await vault.initVault();
      if (!alive) return;
      setVaultState({ supported: status.supported, mode: status.mode, locked: status.locked });
      if (status.supported && !status.locked) {
        try {
          const accounts = await vault.loadAccounts();
          if (alive) applyAccounts(accounts);
        } catch {
          /* locked or unreadable — leave empty */
        }
      }
      if (alive) setVaultReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  /* ---------------- clear sensitive memory on unload / tab-hide ---------------- */
  useEffect(() => {
    const clearAll = () => {
      vault.lock();
      secretsRef.current.clear();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && vaultModeRef.current === "passphrase") {
        // start / keep the auto-lock countdown while the tab is hidden
        scheduleAutoLock();
      }
    };
    window.addEventListener("beforeunload", clearAll);
    window.addEventListener("pagehide", clearAll);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", clearAll);
      window.removeEventListener("pagehide", clearAll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- inactivity auto-lock (passphrase mode) ---------------- */
  const doLock = () => {
    vault.lock();
    clearSecretsFromMemory();
    setSecurityOpen(false);
    setVaultState((v) => ({ ...v, locked: true }));
  };

  function scheduleAutoLock() {
    if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
    if (vaultModeRef.current !== "passphrase") return;
    autoLockTimer.current = setTimeout(() => {
      if (vaultModeRef.current === "passphrase") doLock();
    }, AUTO_LOCK_MS);
  }

  useEffect(() => {
    const onActivity = () => scheduleAutoLock();
    if (vaultState.mode === "passphrase" && !vaultState.locked) {
      scheduleAutoLock();
      window.addEventListener("pointerdown", onActivity);
      window.addEventListener("keydown", onActivity);
    }
    return () => {
      if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultState.mode, vaultState.locked]);

  /* ---------------- active code ---------------- */
  const activeCounter = useMemo(() => (period ? Math.floor(now / 1000 / period) : 0), [now, period]);

  useEffect(() => {
    if (!now) return undefined;
    const trimmed = secret.trim();
    if (!trimmed) {
      setCode("");
      setCodeError("");
      return undefined;
    }
    if (!isValidSecret(trimmed)) {
      setCode("");
      setCodeError("Enter a valid Base32 secret key (letters A-Z and digits 2-7).");
      return undefined;
    }
    let cancelled = false;
    generateTOTP({ secret: trimmed, digits, period, algorithm, timestamp: now })
      .then((value) => {
        if (!cancelled) {
          setCode(value);
          setCodeError("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCode("");
          setCodeError("Unable to generate code.");
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret, digits, period, algorithm, activeCounter]);

  useEffect(() => {
    if (!code) return;
    if (lastRecordedRef.current === code) return;
    lastRecordedRef.current = code;
    const stamp = now || Date.now();
    setRecent((prev) => [{ code, time: stamp }, ...prev].slice(0, 12));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  /* ---------------- saved account codes (secrets read from ref) ---------------- */
  const secondBucket = Math.floor(now / 1000);
  useEffect(() => {
    if (!now || accountsMeta.length === 0) {
      setAccountCodes({});
      return undefined;
    }
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        accountsMeta.map(async (meta) => {
          const secretValue = secretsRef.current.get(meta.id);
          if (!secretValue) return [meta.id, ""];
          try {
            const value = await generateTOTP({
              secret: secretValue,
              digits: meta.digits || 6,
              period: meta.period || 30,
              algorithm: meta.algorithm || "SHA1",
              timestamp: now,
            });
            return [meta.id, value];
          } catch {
            return [meta.id, ""];
          }
        }),
      );
      if (!cancelled) setAccountCodes(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountsMeta, secondBucket]);

  /* ---------------- derived timing ---------------- */
  const windowMs = Math.max(1, period) * 1000;
  const remainingMs = now ? windowMs - (now % windowMs) : windowMs;
  const secondsLeft = Math.max(0, Math.ceil(remainingMs / 1000));
  const fraction = Math.max(0, Math.min(1, remainingMs / windowMs));
  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - fraction);

  /* ---------------- actions ---------------- */
  const handleGenerate = () => {
    const trimmed = secret.trim();
    if (!trimmed || !isValidSecret(trimmed)) {
      setCodeError("Enter a valid Base32 secret key (letters A-Z and digits 2-7).");
      return;
    }
    setNow(Date.now());
    setJustGenerated(true);
    setTimeout(() => setJustGenerated(false), 900);
  };

  const scheduleClipboardClear = () => {
    if (clipboardTimer.current) clearTimeout(clipboardTimer.current);
    clipboardTimer.current = setTimeout(() => {
      safeCopyText("").catch(() => {});
    }, CLIPBOARD_CLEAR_MS);
  };

  const copyActive = async () => {
    if (!code) return;
    const okCopy = await safeCopyText(code);
    setCopied(okCopy);
    if (okCopy) scheduleClipboardClear();
    setTimeout(() => setCopied(false), 1200);
  };

  const copyAccount = async (id) => {
    const value = accountCodes[id];
    if (!value) return;
    const okCopy = await safeCopyText(value);
    if (okCopy) {
      setCopiedId(id);
      scheduleClipboardClear();
      setTimeout(() => setCopiedId(""), 1200);
    }
  };

  const saveCurrent = async () => {
    if (vaultState.locked) {
      showToast("Unlock your vault first.");
      return;
    }
    const trimmed = secret.trim();
    if (!isValidSecret(trimmed)) {
      setCodeError("Enter a valid Base32 secret key before saving.");
      return;
    }
    const account = vault.sanitizeAccount({
      id: vault.makeId(),
      name: accountName.trim() || "My Account",
      email: "",
      secret: trimmed,
      algorithm,
      digits,
      period,
    });
    if (!account) return;
    secretsRef.current.set(account.id, account.secret);
    const nextMeta = [
      { id: account.id, name: account.name, email: account.email, algorithm: account.algorithm, digits: account.digits, period: account.period },
      ...accountsMeta,
    ];
    setAccountsMeta(nextMeta);
    await persistAccounts(nextMeta);
    // clear the entered secret from memory/state once it is safely encrypted
    setSecret("");
    setAccountName("");
    showToast("Account saved & encrypted");
  };

  const removeAccount = async (id) => {
    secretsRef.current.delete(id); // wipe secret from memory immediately
    const nextMeta = accountsMeta.filter((m) => m.id !== id);
    setAccountsMeta(nextMeta);
    setAccountCodes((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    await persistAccounts(nextMeta);
  };

  const handleQrFile = async (file) => {
    if (!file) return;
    setQrStatus("Reading QR code...");
    try {
      const jsQR = (await import("jsqr")).default;
      const imageData = await loadImageData(file);
      const result = jsQR(imageData.data, imageData.width, imageData.height);
      if (!result?.data) {
        setQrStatus("No QR code found in that image. Try a clearer screenshot.");
        return;
      }
      const parsed = parseOtpAuthUri(result.data);
      if (parsed) {
        setSecret(parsed.secret);
        setAccountName(parsed.issuer || parsed.label || "");
        setAlgorithm(parsed.algorithm);
        setDigits(parsed.digits);
        setPeriod(parsed.period);
        setTab("manual");
        setQrStatus(`Imported ${parsed.issuer || parsed.label || "account"} from QR code.`);
        return;
      }
      const raw = result.data.trim();
      if (isValidSecret(raw)) {
        setSecret(raw);
        setTab("manual");
        setQrStatus("Secret key imported from QR code.");
        return;
      }
      setQrStatus("That QR code is not a valid otpauth key.");
    } catch {
      setQrStatus("Could not read that image. Try a clearer QR screenshot.");
    }
  };

  /* ---------------- passphrase management ---------------- */
  const closeModal = () => {
    setPpModal(null);
    setPp1("");
    setPp2("");
    setPpError("");
    setPpBusy(false);
  };

  const doEnablePassphrase = async () => {
    if (pp1.length < 8) {
      setPpError("Use at least 8 characters.");
      return;
    }
    if (pp1 !== pp2) {
      setPpError("Passphrases don't match.");
      return;
    }
    setPpBusy(true);
    try {
      await vault.enablePassphrase(pp1, buildFullAccounts(accountsMeta));
      setVaultState((v) => ({ ...v, mode: "passphrase", locked: false }));
      closeModal();
      showToast("Passphrase protection enabled");
    } catch {
      setPpError("Could not enable passphrase.");
      setPpBusy(false);
    }
  };

  const doChangePassphrase = async () => {
    if (pp1.length < 8) {
      setPpError("Use at least 8 characters.");
      return;
    }
    if (pp1 !== pp2) {
      setPpError("Passphrases don't match.");
      return;
    }
    setPpBusy(true);
    try {
      await vault.enablePassphrase(pp1, buildFullAccounts(accountsMeta));
      closeModal();
      showToast("Passphrase changed");
    } catch {
      setPpError("Could not change passphrase.");
      setPpBusy(false);
    }
  };

  const doDisablePassphrase = async () => {
    setPpBusy(true);
    try {
      await vault.disablePassphrase(buildFullAccounts(accountsMeta));
      setVaultState((v) => ({ ...v, mode: "device", locked: false }));
      closeModal();
      showToast("Passphrase removed — now protected by device key");
    } catch {
      setPpError("Could not remove passphrase.");
      setPpBusy(false);
    }
  };

  const doUnlock = async () => {
    if (!unlockInput) return;
    setPpBusy(true);
    setPpError("");
    try {
      const accounts = await vault.unlockWithPassphrase(unlockInput);
      applyAccounts(accounts);
      setVaultState((v) => ({ ...v, locked: false }));
      setUnlockInput("");
    } catch (error) {
      setPpError(error?.message || "Unlock failed.");
    } finally {
      setPpBusy(false);
    }
  };

  useEffect(() => () => {
    if (clipboardTimer.current) clearTimeout(clipboardTimer.current);
    if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
    secretsRef.current.clear();
    vault.lock();
  }, []);

  const displayCode = code ? formatCode(code) : "---  ---";
  const visibleAccounts = showAllAccounts ? accountsMeta : accountsMeta.slice(0, 3);
  const visibleRecent = showAllRecent ? recent : recent.slice(0, 5);
  const timeLabel = (stamp) => {
    try {
      return new Date(stamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "";
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)]/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40";
  const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)] disabled:cursor-not-allowed disabled:opacity-60";

  const isLockedVault = vaultState.mode === "passphrase" && vaultState.locked;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        {/* ================= HERO ================= */}
        <section className="relative pt-2">
          <div aria-hidden className="pointer-events-none absolute -top-10 left-1/2 h-64 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/5" />
          <div className="relative flex items-start justify-center gap-6">
            <div className="relative hidden w-40 shrink-0 pt-1 lg:block" aria-hidden>
              <div className="absolute left-2 top-2 h-28 w-28 rounded-full bg-blue-200/40 blur-2xl dark:bg-blue-500/10" />
              <ShieldMark className="relative h-28 w-28 drop-shadow-xl" idPrefix="hero" />
              <Sparkles className="absolute right-4 top-0 h-4 w-4 text-blue-400" />
              <span className="absolute bottom-1 left-0 h-2 w-2 rounded-full bg-indigo-300/80" />
            </div>

            <div className="max-w-2xl flex-1 text-center">
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                2FA{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400">
                  Authenticator
                </span>
              </h1>
              <p className="mt-3 text-base leading-7 text-[var(--muted-foreground)]">
                Generate secure TOTP authentication codes in your browser.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                {HERO_BADGES.map((badge) => (
                  <span
                    key={badge.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-3.5 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] shadow-sm"
                  >
                    <badge.icon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>

            <PhoneIllustration code={code} />
          </div>
        </section>

        {/* ================= MAIN 3-COLUMN WORKSPACE ================= */}
        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {/* --- 1. Add account --- */}
          <Card className="p-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="text-lg font-bold text-emerald-500">1</span>
              <h2 className="text-lg font-semibold">Add Your Account</h2>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTab("manual")}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                  tab === "manual"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <KeyRound className="h-4 w-4" />
                Enter Secret Key
              </button>
              <button
                type="button"
                onClick={() => setTab("qr")}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                  tab === "qr"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <QrCode className="h-4 w-4" />
                Scan QR Code
              </button>
            </div>

            {tab === "manual" ? (
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Secret Key (Base32)</label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={secret}
                    onChange={(event) => setSecret(event.target.value)}
                    placeholder="Enter your secret key"
                    spellCheck={false}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    className={`${inputClass} pr-10 font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((value) => !value)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
                    aria-label={showSecret ? "Hide secret" : "Show secret"}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">Format: 16–32 character Base32 key (letters A–Z, digits 2–7)</p>
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Scan or upload a QR code</label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-7 text-center transition hover:border-blue-500 hover:bg-blue-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                    <ScanLine className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold">Upload QR code image</span>
                  <span className="text-xs text-[var(--muted-foreground)]">We decode it on your device — nothing is uploaded.</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleQrFile(event.target.files?.[0])} />
                {qrStatus && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                    <Upload className="h-3.5 w-3.5" />
                    {qrStatus}
                  </p>
                )}
              </div>
            )}

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-semibold">Account Name (Optional)</label>
              <div className="relative">
                <input
                  type="text"
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  placeholder="e.g. Google, GitHub, AWS"
                  maxLength={60}
                  className={`${inputClass} pr-10`}
                />
                <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setAdvancedOpen((value) => !value)}
                className="flex w-full items-center justify-between text-sm font-semibold"
              >
                Advanced Options
                <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
              </button>
              {advancedOpen && (
                <div className="mt-3.5 grid grid-cols-3 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Algorithm</span>
                    <select value={algorithm} onChange={(event) => setAlgorithm(event.target.value)} className={`${inputClass} px-2 py-2`}>
                      {ALGORITHMS.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Digits</span>
                    <select value={digits} onChange={(event) => setDigits(Number(event.target.value))} className={`${inputClass} px-2 py-2`}>
                      {DIGIT_OPTIONS.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Period</span>
                    <select value={period} onChange={(event) => setPeriod(Number(event.target.value))} className={`${inputClass} px-2 py-2`}>
                      {PERIOD_OPTIONS.map((item) => (
                        <option key={item} value={item}>{item} sec</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </div>

            <button type="button" onClick={handleGenerate} className={`${primaryBtn} mt-5 w-full`}>
              <Zap className="h-4 w-4" />
              Generate Code
            </button>
          </Card>

          {/* --- 2. Live code --- */}
          <Card className="flex flex-col p-6">
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">2</span>
                <h2 className="text-lg font-semibold">Your Authentication Code</h2>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live
              </span>
            </div>

            {codeError ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-[var(--background)] p-6 text-center">
                <Lock className="mb-2 h-7 w-7 text-[var(--muted-foreground)]" />
                <p className="text-sm text-[var(--muted-foreground)]">{codeError}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 rounded-2xl border border-blue-200/70 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                  <div className={`flex-1 text-center font-mono text-4xl font-bold tracking-wide text-blue-600 transition-transform sm:text-5xl dark:text-blue-300 ${justGenerated ? "scale-105" : ""}`}>
                    {displayCode}
                  </div>
                  <button
                    type="button"
                    onClick={copyActive}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-600 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:border-blue-500/30 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
                    aria-label="Copy code"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">Your code will refresh in</p>

                <div className="my-4 flex justify-center">
                  <div className="relative h-32 w-32">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r={ringRadius} className="fill-none stroke-[var(--muted)]" strokeWidth="8" />
                      <circle cx="60" cy="60" r={ringRadius} className="fill-none stroke-blue-600 dark:stroke-blue-400" strokeWidth="8" strokeLinecap="round" strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{secondsLeft}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">Seconds</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400" style={{ width: `${fraction * 100}%` }} />
                </div>

                <button
                  type="button"
                  onClick={copyActive}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-[var(--card)] px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:border-blue-500/30 dark:text-blue-300 dark:hover:bg-blue-500/10"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy Code"}
                </button>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[["Algorithm", algorithm], ["Digits", digits], ["Period", `${period} sec`]].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-[var(--muted)] px-2 py-2.5">
                      <p className="text-[11px] font-medium text-[var(--muted-foreground)]">{label}</p>
                      <p className="mt-0.5 text-sm font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* --- 3. Saved accounts (encrypted vault) --- */}
          <Card className="flex flex-col p-6 lg:col-span-2 xl:col-span-1">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Saved Accounts</h2>
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  title={vaultState.mode === "passphrase" ? "Encrypted with your passphrase (zero-knowledge)" : "Encrypted with a non-extractable device key"}
                >
                  <ShieldCheck className="h-3 w-3" />
                  Encrypted
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSecurityOpen((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                  aria-label="Vault security settings"
                  title="Vault security"
                >
                  <Settings2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={saveCurrent}
                  disabled={isLockedVault}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:opacity-50"
                  aria-label="Save current account"
                  title="Save the account you're currently editing"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* security panel */}
            {securityOpen && (
              <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-sm">
                <div className="flex items-start gap-2">
                  <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {vaultState.mode === "passphrase" ? "Passphrase protected (zero-knowledge)" : "Device-key encrypted"}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-[var(--muted-foreground)]">
                      {vaultState.mode === "passphrase"
                        ? "Your accounts are encrypted with your passphrase. It is never stored — only you can unlock them."
                        : "Encrypted with a non-extractable key bound to this browser profile. Add a passphrase for zero-knowledge protection."}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {vaultState.mode !== "passphrase" ? (
                    <button type="button" onClick={() => setPpModal("enable")} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700">
                      <LockKeyhole className="h-3.5 w-3.5" /> Add passphrase
                    </button>
                  ) : (
                    <>
                      <button type="button" onClick={doLock} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700">
                        <Lock className="h-3.5 w-3.5" /> Lock now
                      </button>
                      <button type="button" onClick={() => setPpModal("change")} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)]">
                        Change passphrase
                      </button>
                      <button type="button" onClick={() => setPpModal("disable")} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10">
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* body: loading / locked / empty / list */}
            {!vaultReady ? (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-10 text-center">
                <span className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Loading vault...
                </span>
              </div>
            ) : isLockedVault ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-8 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                  <Lock className="h-6 w-6" />
                </span>
                <p className="text-sm font-semibold">Vault locked</p>
                <p className="mb-3 mt-1 text-xs text-[var(--muted-foreground)]">Enter your passphrase to unlock your saved accounts.</p>
                <input
                  type="password"
                  value={unlockInput}
                  onChange={(event) => setUnlockInput(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && doUnlock()}
                  placeholder="Master passphrase"
                  className={`${inputClass} mb-2 text-center`}
                  autoComplete="off"
                />
                {ppError && <p className="mb-2 text-xs font-medium text-rose-500">{ppError}</p>}
                <button type="button" onClick={doUnlock} disabled={ppBusy || !unlockInput} className={`${primaryBtn} w-full`}>
                  <Unlock className="h-4 w-4" />
                  {ppBusy ? "Unlocking..." : "Unlock"}
                </button>
              </div>
            ) : accountsMeta.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-10 text-center">
                <ShieldCheck className="mb-2 h-8 w-8 text-[var(--muted-foreground)]" />
                <p className="text-sm font-medium">No saved accounts yet</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Add a secret key and tap <span className="font-semibold">+</span> to store it, encrypted, on this device.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleAccounts.map((meta) => {
                  const accountCode = accountCodes[meta.id];
                  const accountPeriod = Math.max(1, meta.period || 30);
                  const accountLeft = now ? Math.ceil((accountPeriod * 1000 - (now % (accountPeriod * 1000))) / 1000) : accountPeriod;
                  return (
                    <div key={meta.id} className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-3.5 shadow-sm transition hover:border-blue-300/60 dark:hover:border-blue-500/30">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <AccountAvatar name={meta.name} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{meta.name}</p>
                            {meta.email ? <p className="truncate text-[11px] text-[var(--muted-foreground)]">{meta.email}</p> : null}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button type="button" onClick={() => copyAccount(meta.id)} className="rounded-md p-1 text-[var(--muted-foreground)] transition hover:text-blue-600 dark:hover:text-blue-400" aria-label="Copy code">
                            {copiedId === meta.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                          <button type="button" onClick={() => removeAccount(meta.id)} className="rounded-md p-1 text-[var(--muted-foreground)] opacity-0 transition hover:text-rose-500 group-hover:opacity-100" aria-label="Remove account">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <button type="button" onClick={() => copyAccount(meta.id)} className="flex items-center gap-2 font-mono text-xl font-bold tracking-wide text-blue-600 transition hover:opacity-80 dark:text-blue-300" title="Copy code">
                          <RefreshCw className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                          {accountCode ? formatCode(accountCode) : "•••  •••"}
                        </button>
                        <span className="relative flex h-9 w-9 items-center justify-center text-[11px] font-semibold text-[var(--muted-foreground)]">
                          <svg className="absolute inset-0 h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15" className="fill-none stroke-[var(--muted)]" strokeWidth="3" />
                            <circle cx="18" cy="18" r="15" className="fill-none stroke-blue-600 dark:stroke-blue-400" strokeWidth="3" strokeLinecap="round" strokeDasharray={2 * Math.PI * 15} strokeDashoffset={2 * Math.PI * 15 * (1 - accountLeft / accountPeriod)} />
                          </svg>
                          {accountLeft}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isLockedVault && accountsMeta.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllAccounts((value) => !value)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
              >
                {showAllAccounts ? "Show Less" : "View All Accounts"}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </Card>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="p-5 hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-600/20">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="text-sm font-semibold">{feature.title}</h3>
              </div>
              <p className="mt-2.5 text-xs leading-5 text-[var(--muted-foreground)]">{feature.text}</p>
            </Card>
          ))}
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <Card className="p-6 sm:p-8">
          <h2 className="text-center text-2xl font-bold">How It Works</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:flex lg:items-start lg:gap-2">
            {STEPS.map((step, index) => (
              <div key={step.title} className="contents">
                <div className="text-center lg:w-48 lg:shrink-0">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                    <step.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold">{index + 1}. {step.title}</h3>
                  <p className="mx-auto mt-1.5 max-w-[15rem] text-xs leading-5 text-[var(--muted-foreground)]">{step.text}</p>
                </div>
                {index < STEPS.length - 1 && <StepConnector />}
              </div>
            ))}
          </div>
        </Card>

        {/* ================= SUPPORTED APPS ================= */}
        <Card className="p-6 sm:p-8">
          <h2 className="text-center text-2xl font-bold">Supported Apps &amp; Services</h2>
          <p className="mt-1.5 text-center text-sm text-[var(--muted-foreground)]">Works with all major authenticator-supported platforms</p>
          <div className="mt-8 flex flex-wrap items-start justify-center gap-5">
            {SERVICES.map((service, index) => (
              <div key={service.name} className="contents">
                <div className="flex w-16 flex-col items-center gap-2 text-center">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-white shadow-md dark:bg-slate-800 ${service.chipClass}`}>
                    {service.node}
                  </span>
                  <span className="text-[11px] font-medium text-[var(--muted-foreground)]">{service.name}</span>
                </div>
                {index < SERVICES.length - 1 && <DashedArrow />}
              </div>
            ))}
          </div>
        </Card>

        {/* ================= ADVANCED / SECURITY / RECENT ================= */}
        <section className="grid gap-6 lg:grid-cols-[1fr_1.4fr_1fr]">
          <Card className="p-6">
            <h3 className="text-base font-semibold">Advanced Options</h3>
            <div className="mt-4 space-y-4">
              {ADVANCED_INFO.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-lg bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">Perfect for advanced users and developers.</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-center text-base font-semibold">Security You Can Trust</h3>
            <div className="@container mt-5">
              <div className="grid items-center gap-5 @[22rem]:grid-cols-[1fr_auto_1fr]">
                <div className="relative order-first mx-auto w-fit @[22rem]:order-none">
                  <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300/30 blur-xl dark:bg-blue-500/20" aria-hidden />
                  <ShieldMark className="relative h-24 w-24 drop-shadow-lg" idPrefix="sec" />
                </div>
                <div className="order-none grid grid-cols-1 gap-4 @[15rem]:grid-cols-2 @[22rem]:grid-cols-1 @[22rem]:-order-1">
                  {TRUST_LEFT.map((item) => (
                    <div key={item.title} className="flex items-start gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold">{item.title}</p>
                        <p className="mt-0.5 text-[11px] leading-4 text-[var(--muted-foreground)]">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-4 @[15rem]:grid-cols-2 @[22rem]:grid-cols-1">
                  {TRUST_RIGHT.map((item) => (
                    <div key={item.title} className="flex items-start gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold">{item.title}</p>
                        <p className="mt-0.5 text-[11px] leading-4 text-[var(--muted-foreground)]">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 rounded-xl bg-blue-50 px-3 py-3 text-center dark:bg-blue-500/10">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Your security is our priority.</p>
              <p className="mt-0.5 text-xs text-blue-600/80 dark:text-blue-300/70">We built this tool with privacy and transparency at its core.</p>
            </div>
          </Card>

          <Card className="flex flex-col p-6">
            <h3 className="text-base font-semibold">Recent Codes</h3>
            <div className="mt-4 flex-1 space-y-2">
              {recent.length === 0 ? (
                <p className="rounded-xl bg-[var(--background)] px-3 py-8 text-center text-xs text-[var(--muted-foreground)]">Generated codes will appear here.</p>
              ) : (
                visibleRecent.map((item, index) => (
                  <div key={`${item.code}-${item.time}-${index}`} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5">
                    <span className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <Clock className="h-3.5 w-3.5" />
                      {timeLabel(item.time)}
                    </span>
                    <span className="font-mono text-sm font-bold tracking-wide">{formatCode(item.code)}</span>
                  </div>
                ))
              )}
            </div>
            {recent.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllRecent((value) => !value)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
              >
                {showAllRecent ? "Show Less" : "View Full History"}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </Card>
        </section>

        {/* ================= FOOTER LINE ================= */}
        <section className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-6 py-4 text-sm dark:border-blue-500/20 dark:bg-blue-500/10 sm:flex-row">
          <span className="flex items-center gap-2 text-[var(--foreground)]">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            This tool is free, open to everyone, and built with privacy first.
          </span>
          <span className="text-[var(--muted-foreground)]">
            Made with <span className="text-rose-500">❤</span> for a safer internet.
          </span>
        </section>
      </div>

      {/* ================= TOAST ================= */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-xl dark:bg-slate-100 dark:text-slate-900" role="status">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
            {toast}
          </span>
        </div>
      )}

      {/* ================= PASSPHRASE MODAL ================= */}
      {ppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} aria-hidden />
          <div className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
            <button type="button" onClick={closeModal} className="absolute right-4 top-4 rounded-md p-1 text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
              <LockKeyhole className="h-5 w-5" />
            </div>

            {ppModal === "disable" ? (
              <>
                <h3 className="text-lg font-semibold">Remove passphrase?</h3>
                <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
                  Your accounts will be re-encrypted with the device key instead. They stay encrypted, but no passphrase will be required to view them on this profile.
                </p>
                {ppError && <p className="mt-3 text-sm font-medium text-rose-500">{ppError}</p>}
                <div className="mt-5 flex gap-2">
                  <button type="button" onClick={closeModal} className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold transition hover:bg-[var(--muted)]">Cancel</button>
                  <button type="button" onClick={doDisablePassphrase} disabled={ppBusy} className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60">{ppBusy ? "Removing..." : "Remove"}</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">{ppModal === "change" ? "Change passphrase" : "Protect with a passphrase"}</h3>
                <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
                  {ppModal === "change"
                    ? "Set a new master passphrase. It encrypts your vault and is never stored."
                    : "Add a master passphrase for zero-knowledge encryption. It's never stored — if you forget it, your saved accounts can't be recovered."}
                </p>
                <div className="mt-4 space-y-3">
                  <input type="password" value={pp1} onChange={(e) => setPp1(e.target.value)} placeholder="Master passphrase" className={inputClass} autoComplete="new-password" />
                  <input type="password" value={pp2} onChange={(e) => setPp2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (ppModal === "change" ? doChangePassphrase() : doEnablePassphrase())} placeholder="Confirm passphrase" className={inputClass} autoComplete="new-password" />
                </div>
                {ppError && <p className="mt-3 text-sm font-medium text-rose-500">{ppError}</p>}
                <div className="mt-5 flex gap-2">
                  <button type="button" onClick={closeModal} className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold transition hover:bg-[var(--muted)]">Cancel</button>
                  <button type="button" onClick={ppModal === "change" ? doChangePassphrase : doEnablePassphrase} disabled={ppBusy} className={`${primaryBtn} flex-1`}>
                    {ppBusy ? "Saving..." : ppModal === "change" ? "Save" : "Enable"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
