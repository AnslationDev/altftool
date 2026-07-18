"use client";

import { useMemo, useRef, useState } from "react";
import {
  Copy,
  Download,
  Eye,
  EyeOff,
  Info,
  Printer,
  ShieldCheck,
  Smartphone,
  Wifi,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { safeCopyText } from "@/shared/utils/clipboard";

const securityOptions = [
  { value: "WPA", label: "WPA / WPA2 / WPA3 (most home networks)" },
  { value: "WEP", label: "WEP (older legacy routers)" },
  { value: "nopass", label: "None (open network)" },
];

const escapeWifiValue = (value) => value.replace(/([\\;,:"])/g, "\\$1");

function buildWifiString({ ssid, security, password, hidden }) {
  const parts = [`WIFI:T:${security}`, `S:${escapeWifiValue(ssid)}`];
  if (security !== "nopass") parts.push(`P:${escapeWifiValue(password)}`);
  if (hidden) parts.push("H:true");
  return `${parts.join(";")};;`;
}

const sanitizeFileName = (value) =>
  value
    .trim()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "network";

export default function ToolHome() {
  const [ssid, setSsid] = useState("Home-WiFi");
  const [security, setSecurity] = useState("WPA");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [cardLabel, setCardLabel] = useState("");
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef(null);

  const trimmedSsid = ssid.trim();
  const wifiString = useMemo(
    () => buildWifiString({ ssid: trimmedSsid, security, password, hidden }),
    [trimmedSsid, security, password, hidden]
  );

  const handleSecurityChange = (event) => {
    const next = event.target.value;
    setSecurity(next);
    if (next === "nopass") {
      setPassword("");
      setShowPassword(false);
    }
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `wifi-qr-${sanitizeFileName(trimmedSsid)}.png`;
    link.click();
  };

  const copyString = async () => {
    const success = await safeCopyText(wifiString);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const passwordTooShort = security === "WPA" && password.length > 0 && password.length < 8;
  const passwordMissing = security !== "nopass" && password.length === 0;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Wifi className="h-4 w-4" />
            Offline QR maker
          </div>
          <h1 className="text-4xl font-semibold leading-tight">WiFi QR Code Generator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Turn your network name and password into a QR code guests can scan to join instantly, then download it as
            a PNG or print a ready-made table card. Everything is generated in your browser.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-4">
              <label className="block">
                <span className="text-sm font-semibold">Network name (SSID)</span>
                <input
                  type="text"
                  value={ssid}
                  onChange={(event) => setSsid(event.target.value)}
                  placeholder="Home-WiFi"
                  autoComplete="off"
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Security</span>
                <select
                  value={security}
                  onChange={handleSecurityChange}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {securityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Password</span>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={security === "nopass"}
                    placeholder={security === "nopass" ? "Open network, no password" : "Enter WiFi password"}
                    autoComplete="off"
                    className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 pr-12 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={security === "nopass"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[var(--muted-foreground)] transition hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordTooShort ? (
                  <span className="mt-2 block text-xs font-semibold text-[var(--anslation-ds-danger)]">
                    WPA passwords are 8 to 63 characters, this one looks too short.
                  </span>
                ) : security === "nopass" ? (
                  <span className="mt-2 block text-xs text-[var(--muted-foreground)]">
                    Open network: anyone can join without a password.
                  </span>
                ) : (
                  <span className="mt-2 block text-xs text-[var(--muted-foreground)]">
                    Stored only in this page, never sent anywhere.
                  </span>
                )}
              </label>

              <label className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3">
                <input
                  type="checkbox"
                  checked={hidden}
                  onChange={(event) => setHidden(event.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <span className="text-sm font-semibold">Hidden network</span>
                <span className="ml-auto text-xs text-[var(--muted-foreground)]">SSID not broadcast</span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Card label (optional)</span>
                <input
                  type="text"
                  value={cardLabel}
                  onChange={(event) => setCardLabel(event.target.value)}
                  placeholder="Guest WiFi"
                  autoComplete="off"
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-2 block text-xs text-[var(--muted-foreground)]">
                  Shown as the heading on the printed card.
                </span>
              </label>
            </div>

            <p className="mt-5 flex items-start gap-2 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--anslation-ds-success)]" />
              Private by design: the QR code is generated locally in your browser. Your SSID and password are never
              uploaded, logged, or stored on any server.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Your WiFi QR code</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={downloadPng}
                  disabled={!trimmedSsid}
                  className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-semibold text-[var(--primary-foreground)] transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  disabled={!trimmedSsid}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Printer className="h-4 w-4" />
                  Print card
                </button>
                <button
                  type="button"
                  onClick={copyString}
                  disabled={!trimmedSsid}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy code text"}
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center">
              {trimmedSsid ? (
                <div className="rounded-lg bg-white p-4 shadow-[var(--anslation-ds-shadow-sm)]">
                  <QRCodeCanvas
                    ref={canvasRef}
                    value={wifiString}
                    size={256}
                    marginSize={2}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="M"
                  />
                </div>
              ) : (
                <div className="flex h-72 w-72 items-center justify-center rounded-lg border-2 border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted-foreground)]">
                  Enter a network name to generate your QR code
                </div>
              )}
              <p className="mt-3 max-w-md text-center text-xs leading-5 text-[var(--muted-foreground)]">
                The code always sits on a white tile, even in dark mode. That is intentional: cameras need dark
                modules on a light background to scan reliably.
              </p>
              {passwordMissing && trimmedSsid ? (
                <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                  <Info className="h-3.5 w-3.5 text-[var(--primary)]" />
                  Add the password before sharing, or phones will fail to join.
                </p>
              ) : null}
            </div>

            <div className="mt-6 rounded-md bg-[var(--muted)] p-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Encoded payload</p>
              <code className="mt-1 block break-all font-mono text-sm">{wifiString}</code>
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Format: WIFI:T:&lt;security&gt;;S:&lt;ssid&gt;;P:&lt;password&gt;;H:true;; and the special characters{" "}
              <code className="font-mono">{'\\ ; , : "'}</code> in your name or password are escaped automatically so
              every scanner reads them correctly.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Smartphone className="h-5 w-5 text-[var(--primary)]" />
            How guests scan it
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="font-semibold">iPhone and iPad</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
                <li>Open the built-in Camera app.</li>
                <li>Point it at the QR code for a second.</li>
                <li>Tap the Join Network banner that appears.</li>
              </ol>
            </div>
            <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="font-semibold">Android</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
                <li>Open the Camera app or Google Lens.</li>
                <li>Point it at the QR code.</li>
                <li>Tap the connect prompt. On older phones, use the QR scanner in WiFi settings.</li>
              </ol>
            </div>
          </div>
        </section>

        <style>{`
          #altf-wifi-print { display: none; }
          @media print {
            body * { visibility: hidden !important; }
            #altf-wifi-print, #altf-wifi-print * { visibility: visible !important; }
            #altf-wifi-print {
              display: flex !important;
              position: fixed;
              inset: 0;
              align-items: center;
              justify-content: center;
              background: #ffffff;
              z-index: 9999;
            }
            #altf-wifi-print .altf-wifi-print-card {
              width: 360px;
              border: 2px solid #111111;
              border-radius: 16px;
              padding: 32px 28px;
              text-align: center;
              color: #111111;
              background: #ffffff;
            }
            #altf-wifi-print .altf-wifi-print-title {
              font-size: 24px;
              font-weight: 700;
              margin: 0;
            }
            #altf-wifi-print .altf-wifi-print-sub {
              font-size: 14px;
              margin: 6px 0 0;
            }
            #altf-wifi-print .altf-wifi-print-qr {
              display: flex;
              justify-content: center;
              margin: 20px 0;
            }
            #altf-wifi-print .altf-wifi-print-ssid {
              font-size: 16px;
              font-weight: 600;
              margin: 0;
              word-break: break-all;
            }
            #altf-wifi-print .altf-wifi-print-hint {
              font-size: 12px;
              margin: 10px 0 0;
              color: #444444;
            }
          }
        `}</style>
        <div id="altf-wifi-print" aria-hidden="true">
          <div className="altf-wifi-print-card">
            <p className="altf-wifi-print-title">{cardLabel.trim() || "Scan to join our WiFi"}</p>
            {cardLabel.trim() ? <p className="altf-wifi-print-sub">Scan to join our WiFi</p> : null}
            <div className="altf-wifi-print-qr">
              {trimmedSsid ? (
                <QRCodeCanvas value={wifiString} size={220} marginSize={2} bgColor="#FFFFFF" fgColor="#000000" level="M" />
              ) : null}
            </div>
            <p className="altf-wifi-print-ssid">Network: {trimmedSsid}</p>
            <p className="altf-wifi-print-hint">Point your phone camera at the code to connect automatically</p>
          </div>
        </div>
      </div>
    </main>
  );
}
