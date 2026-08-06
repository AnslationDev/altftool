"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import useHydrated from "@/hooks/useHydrated";
import TypeSelector from "./TypeSelector";
import InputForms from "./InputForms";
import QRControls from "./QRControls";
import QRPreview from "./QRPreview";
import History from "./History";

const MAX_HISTORY = 10;
const STORAGE_KEY = "altftool-qr-history";
const HISTORY_TYPES = new Set([
  "URL",
  "TEXT",
  "EMAIL",
  "PHONE",
  "SMS",
  "WHATSAPP",
  "WIFI",
  "VCARD",
  "LOCATION",
  "CALENDAR",
]);
const HISTORY_PREVIEW = "Content not saved for privacy.";

function toHistoryMetadata(item) {
  const type = typeof item?.type === "string" ? item.type.toUpperCase() : "";
  if (!HISTORY_TYPES.has(type)) return null;

  return {
    type,
    label: `${type === "WIFI" ? "Wi-Fi" : type === "VCARD" ? "vCard" : type} QR code`,
    preview: HISTORY_PREVIEW,
    timestamp: Number.isFinite(item?.timestamp) ? item.timestamp : Date.now(),
  };
}

function normalizeHistory(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map(toHistoryMetadata)
    .filter(Boolean)
    .slice(0, MAX_HISTORY);
}

function loadHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    // Older versions saved a payload preview (and briefly a complete form
    // snapshot), which could include Wi-Fi credentials or contact details.
    // Keep those entries usable as type shortcuts while immediately migrating
    // the stored data to metadata-only records.
    const items = normalizeHistory(JSON.parse(raw));
    saveHistory(items);
    return items;
  } catch {
    // A malformed legacy value may still contain private payload text.
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    return [];
  }
}

function saveHistory(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeHistory(items)));
  } catch {
    // If a legacy value cannot be replaced, remove it rather than leave
    // credentials or contact data behind in localStorage.
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
}

export default function MainComponent() {
  const isClient = useHydrated();

  const [activeType, setActiveType] = useState("URL");
  const [formData, setFormData] = useState({
    url: "https://example.com",
    text: "",
    email: "",
    emailSubject: "",
    emailBody: "",
    phone: "",
    smsPhone: "",
    smsMessage: "",
    whatsappPhone: "",
    whatsappMessage: "",
    wifiSsid: "",
    wifiPass: "",
    wifiEnc: "WPA",
    vcardFn: "",
    vcardLn: "",
    vcardTel: "",
    vcardEmail: "",
    vcardOrg: "",
    vcardUrl: "",
    lat: "",
    lng: "",
    locationLabel: "",
    calTitle: "",
    calStart: "",
    calEnd: "",
    calDesc: "",
    calLocation: "",
  });

  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [transparentBg, setTransparentBg] = useState(false);
  const [size, setSize] = useState(220);
  const [margin, setMargin] = useState(8);
  const [errorLevel, setErrorLevel] = useState("M");
  const [customLogo, setCustomLogo] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    return () => {
      if (customLogo) URL.revokeObjectURL(customLogo);
    };
  }, [customLogo]);

  const computedValue = useMemo(() => {
    switch (activeType) {
      case "TEXT":
        return formData.text || "";

      case "URL":
        return formData.url || "";

      case "EMAIL": {
        const to = formData.email || "";
        const subject = encodeURIComponent(formData.emailSubject || "");
        const body = encodeURIComponent(formData.emailBody || "");
        if (!to) return "";
        let mailto = `mailto:${to}`;
        const params = [];
        if (subject) params.push(`subject=${subject}`);
        if (body) params.push(`body=${body}`);
        if (params.length) mailto += `?${params.join("&")}`;
        return mailto;
      }

      case "PHONE":
        return formData.phone ? `tel:${formData.phone}` : "";

      case "SMS": {
        const phone = formData.smsPhone || "";
        const msg = encodeURIComponent(formData.smsMessage || "");
        if (!phone) return "";
        return msg ? `sms:${phone}?body=${msg}` : `sms:${phone}`;
      }

      case "WHATSAPP": {
        const phone = (formData.whatsappPhone || "").replace(/[^0-9]/g, "");
        const msg = encodeURIComponent(formData.whatsappMessage || "");
        if (!phone) return "";
        return msg
          ? `https://wa.me/${phone}?text=${msg}`
          : `https://wa.me/${phone}`;
      }

      case "WIFI": {
        const rawSsid = formData.wifiSsid || "";
        if (!rawSsid) return "";
        // Escape WIFI payload delimiters so SSIDs/passwords containing them
        // are decoded as field values rather than QR grammar.
        const escapeWifiField = (value) =>
          String(value).replace(/([\\;,":])/g, "\\$1");
        const ssid = escapeWifiField(rawSsid);
        const pass = escapeWifiField(formData.wifiPass || "");
        const enc = formData.wifiEnc || "WPA";
        return `WIFI:S:${ssid};T:${enc};P:${pass};;`;
      }

      case "VCARD": {
        const fn = formData.vcardFn || "";
        const ln = formData.vcardLn || "";
        const tel = formData.vcardTel || "";
        const email = formData.vcardEmail || "";
        const org = formData.vcardOrg || "";
        const url = formData.vcardUrl || "";
        if (!fn && !ln) return "";
        let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${fn} ${ln}\nN:${ln};${fn};;;`;
        if (org) vcard += `\nORG:${org}`;
        if (tel) vcard += `\nTEL:${tel}`;
        if (email) vcard += `\nEMAIL:${email}`;
        if (url) vcard += `\nURL:${url}`;
        vcard += `\nEND:VCARD`;
        return vcard;
      }

      case "LOCATION": {
        const lat = formData.lat || "";
        const lng = formData.lng || "";
        if (!lat || !lng) return "";
        return `geo:${lat},${lng}`;
      }

      case "CALENDAR": {
        const title = formData.calTitle || "";
        const start = formData.calStart || "";
        const end = formData.calEnd || "";
        const desc = formData.calDesc || "";
        const loc = formData.calLocation || "";
        if (!title) return "";
        const formatDT = (val) => {
          if (!val) return "";
          // `datetime-local` is a local wall-clock value. Parse it in the
          // browser's timezone before serializing the calendar value as UTC.
          const date = new Date(val);
          if (Number.isNaN(date.getTime())) return "";
          return date
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}Z$/, "Z");
        };
        const startUtc = formatDT(start);
        const endUtc = formatDT(end);
        let ical = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}`;
        if (startUtc) ical += `\nDTSTART:${startUtc}`;
        if (endUtc) ical += `\nDTEND:${endUtc}`;
        if (desc) ical += `\nDESCRIPTION:${desc}`;
        if (loc) ical += `\nLOCATION:${loc}`;
        ical += `\nEND:VEVENT\nEND:VCALENDAR`;
        return ical;
      }

      default:
        return "";
    }
  }, [activeType, formData]);

  const handleLogo = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo file must be under 2MB");
        return;
      }
      setCustomLogo(URL.createObjectURL(file));
    }
  }, []);

  const removeLogo = useCallback(() => {
    if (customLogo) URL.revokeObjectURL(customLogo);
    setCustomLogo(null);
  }, [customLogo]);

  const addToHistory = useCallback((value, type) => {
    if (!value || !value.trim()) return;
    const entry = toHistoryMetadata({ type, timestamp: Date.now() });
    if (!entry) return;
    setHistory((prev) => {
      // Metadata-only entries cannot restore private content. Keep one recent
      // shortcut per QR type instead of persisting payloads to distinguish them.
      const next = [entry, ...prev.filter((item) => item.type !== entry.type)].slice(
        0,
        MAX_HISTORY
      );
      saveHistory(next);
      return next;
    });
  }, []);

  const handleTypeChange = useCallback(
    (newType) => {
      if (computedValue && computedValue.trim()) {
        addToHistory(computedValue, activeType);
      }
      setActiveType(newType);
    },
    [activeType, computedValue, addToHistory]
  );

  const handleHistorySelect = useCallback((item) => {
    if (HISTORY_TYPES.has(item?.type)) setActiveType(item.type);
  }, []);

  const handleHistoryClear = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Clear all saved QR code history? This cannot be undone.")
    ) {
      return;
    }
    setHistory([]);
    saveHistory([]);
  }, []);

  return (
    <div className="space-y-8 text-(--foreground) p-5 md:p-10 max-w-7xl mx-auto font-sans">
      <div className="space-y-2 mb-12 text-center">
        <h1 className="text-4xl md:text-7xl font-bold uppercase tool-heading-accent">
          Text to QR Code
        </h1>
        <p className="text-(--muted-foreground) text-lg md:text-2xl font-medium mt-6">
          Generate professional QR codes instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <TypeSelector activeType={activeType} onTypeChange={handleTypeChange} />

          <div className="bg-(--card) border border-(--border) rounded-2xl p-6 space-y-6 shadow-sm">
            <h2 className="font-semibold text-lg text-(--primary)">
              Enter Details
            </h2>
            <InputForms
              activeType={activeType}
              formData={formData}
              setFormData={setFormData}
            />
          </div>

          <QRControls
            fgColor={fgColor}
            setFgColor={setFgColor}
            bgColor={bgColor}
            setBgColor={setBgColor}
            transparentBg={transparentBg}
            setTransparentBg={setTransparentBg}
            size={size}
            setSize={setSize}
            margin={margin}
            setMargin={setMargin}
            errorLevel={errorLevel}
            setErrorLevel={setErrorLevel}
            customLogo={customLogo}
            handleLogo={handleLogo}
            removeLogo={removeLogo}
          />

          <History
            history={history}
            onSelect={handleHistorySelect}
            onClear={handleHistoryClear}
          />
        </div>

        <div className="lg:col-span-5">
          {isClient ? (
            <QRPreview
              computedValue={computedValue}
              fgColor={fgColor}
              bgColor={bgColor}
              transparentBg={transparentBg}
              size={size}
              margin={margin}
              errorLevel={errorLevel}
              customLogo={customLogo}
            />
          ) : (
            <div className="bg-(--card) border border-(--border) rounded-2xl p-8 flex flex-col items-center justify-center shadow-md">
              <div className="h-52 w-52 bg-(--muted) rounded-lg animate-pulse" />
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        input::placeholder,
        textarea::placeholder {
          color: var(--input-placeholder, #94a3b8) !important;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
