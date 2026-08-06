"use client";

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Link, Wifi, User, CreditCard,
  Download, Zap, Settings, Image as ImageIcon,
  X, QrCode, Palette, Smartphone, FileSpreadsheet, Layers, Loader2,
  Activity, AlertTriangle
} from 'lucide-react';
import useHydrated from "@/hooks/useHydrated";
import { buildQrPayload } from "../lib/qrPayload.js";

// Conservative byte-mode ceiling for the error-correction level this tool
// always encodes at (level H, which tops out around 1273 bytes at version
// 40). Kept below the true limit so we can show a friendly inline warning
// before qrcode.react's encoder throws a RangeError.
const MAX_QR_BYTES = 1200;

function byteLength(value = '') {
  if (typeof TextEncoder === 'undefined') return String(value).length;
  return new TextEncoder().encode(String(value)).length;
}

export default function MainComponent() {
  // --- States ---
  const [activeTab, setActiveTab] = useState('URL');
  const [qrValue, setQrValue] = useState('https://google.com');
  const [fgColor, setFgColor] = useState('#000000');
  const bgColor = '#ffffff';
  const [size, setSize] = useState(220);
  const [customLogo, setCustomLogo] = useState(null);
  const isClient = useHydrated();

  // --- Analytics States ---
  // Local-only counter of PNGs saved from this tab (disclosed in the FAQ as
  // a placeholder, not real scan telemetry). No location/network/uptime
  // data is collected or shown -- this tool makes no network requests.
  const [scanCount, setScanCount] = useState(0);

  // --- Bulk States ---
  const [bulkData, setBulkData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkSkipped, setBulkSkipped] = useState(0);
  const [bulkError, setBulkError] = useState('');
  // Scratch value used only while previewing/exporting bulk CSV rows, kept
  // separate from qrValue (the Website tab's own input) so uploading or
  // exporting a CSV never overwrites whatever URL the user typed there.
  const [bulkQrValue, setBulkQrValue] = useState('');
  const qrCanvasRef = useRef(null);

  // Input Data States
  const [wifi, setWifi] = useState({ ssid: '', pass: '', enc: 'WPA' });
  const [vCard, setVCard] = useState({ fn: '', ln: '', tel: '', email: '' });
  const [upi, setUpi] = useState({ vpa: '', name: '', am: '' });

  // Payload construction lives in ../lib/qrPayload.js so it can be unit
  // tested: it escapes the WIFI: separators (\ ; , : "), escapes vCard
  // fields and emits the mandatory N: row with CRLF endings, percent-encodes
  // every UPI parameter (and omits an empty am=), and returns an explicit
  // error instead of silently encoding an unrelated fallback URL.
  const qrPayload = useMemo(
    () => buildQrPayload({ activeTab, url: qrValue, bulkValue: bulkQrValue, upi, vCard, wifi }),
    [activeTab, qrValue, bulkQrValue, upi, vCard, wifi],
  );
  const computedQrValue = qrPayload.value;
  const payloadError = qrPayload.error;

  const qrByteLength = useMemo(() => byteLength(computedQrValue), [computedQrValue]);
  const isTooLong = qrByteLength > MAX_QR_BYTES;

  useEffect(() => () => {
    if (customLogo) URL.revokeObjectURL(customLogo);
  }, [customLogo]);

  // --- Bulk CSV Functions ---
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      setBulkData(rows);
      setBulkSkipped(0);
      setBulkError('');
      // Preview the first row on the Bulk-scratch value only -- never touch
      // qrValue, which backs the Website tab's own input.
      setBulkQrValue(rows[0] || '');
    };
    reader.readAsText(file);
    // Let the same file be selected again after the list is cleared.
    e.target.value = '';
  };

  const clearBulkData = () => {
    setBulkData([]);
    setBulkQrValue('');
    setBulkSkipped(0);
    setBulkError('');
  };

  const downloadBulk = async () => {
    if (bulkData.length === 0 || isProcessing) return;
    setIsProcessing(true);
    setBulkError('');
    let skipped = 0;
    let downloaded = 0;
    try {
      for (let i = 0; i < bulkData.length; i++) {
        const row = bulkData[i];
        if (byteLength(row) > MAX_QR_BYTES) {
          // Too long to encode at level H -- skip rather than crash the loop;
          // reported to the user once the batch finishes.
          skipped += 1;
          continue;
        }

        // Flush the row into qrcode.react before reading its forwarded canvas
        // ref. This ties every download to the exact row being iterated and
        // avoids a timing guess that could save the previous QR twice.
        flushSync(() => setBulkQrValue(row));
        const canvas = qrCanvasRef.current;
        if (!canvas) {
          throw new Error('The QR canvas was not ready for batch export. Try again.');
        }

        // A logo is drawn after its image resolves. One animation frame lets a
        // cached/decoded logo repaint without imposing a fixed delay per row.
        if (customLogo) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }

        const link = document.createElement('a');
        link.download = `qr-bulk-${i + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        downloaded += 1;
      }
    } catch (error) {
      setBulkError(error instanceof Error ? error.message : 'Batch export failed. Try again.');
    } finally {
      // Committed in the finally block so a batch that aborts part-way still
      // counts the rows it actually saved, exactly as the per-row increment
      // used to. One state update instead of N avoids re-rendering the canvas
      // between downloads.
      if (downloaded > 0) setScanCount((prev) => prev + downloaded);
      setBulkSkipped(skipped);
      setIsProcessing(false);
    }
  };

  const downloadQR = () => {
    if (payloadError || isTooLong) return;
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-code-${activeTab}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setScanCount(prev => prev + 1);
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (file) setCustomLogo(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-8 text-(--foreground) p-5 md:p-10 max-w-7xl mx-auto font-sans">

      {/* Header Section */}
      <div className="space-y-2 mb-12 text-center">
        <h1 className="text-4xl md:text-7xl font-bold uppercase text-(--primary)">
          QR Generator
        </h1>
        <p className="text-(--muted-foreground) text-lg md:text-2xl font-medium mt-6">
          Create premium QR codes instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT: CONTROLS */}
        <div className="lg:col-span-7 space-y-6">

          <div className="flex bg-(--card) p-1.5 rounded-2xl shadow-sm border border-(--border) overflow-x-auto no-scrollbar">
            {[
              { id: 'URL', icon: <Link size={18}/>, label: 'Website' },
              { id: 'WIFI', icon: <Wifi size={18}/>, label: 'WiFi' },
              { id: 'vCARD', icon: <User size={18}/>, label: 'Contact' },
              { id: 'UPI', icon: <CreditCard size={18}/>, label: 'UPI' },
              { id: 'BULK', icon: <Layers size={18}/>, label: 'Bulk' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={isProcessing}
                title={isProcessing ? "Finish or wait for the current bulk export before switching tabs" : undefined}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl font-bold text-sm transition-all motion-reduce:transition-none flex-1 whitespace-nowrap focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 disabled:cursor-not-allowed disabled:opacity-50 ${
                  activeTab === tab.id
                  ? 'bg-(--primary) text-(--primary-foreground)'
                  : 'text-(--muted-foreground) hover:bg-(--background)'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-(--card) border border-(--border) rounded-2xl p-6 space-y-6 shadow-sm">
            <h2 className="font-semibold text-lg text-(--primary)">
              {activeTab === 'BULK' ? 'Bulk Upload' : 'Enter Details'}
            </h2>
            <div className="space-y-4">
              {activeTab === 'URL' && (
                <input
                  value={qrValue}
                  onChange={(e) => setQrValue(e.target.value)}
                  aria-label="Website URL"
                  placeholder="https://google.com"
                  className="w-full px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25 font-medium transition-all placeholder:text-(--muted-foreground)"
                />
              )}

              {activeTab === 'WIFI' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="WiFi Name (SSID)" aria-label="WiFi name (SSID)" className="px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25 transition-all placeholder:text-(--muted-foreground)" onChange={(e) => setWifi({...wifi, ssid: e.target.value})} />
                  <input placeholder="Password" type="password" aria-label="WiFi password" className="px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25 transition-all placeholder:text-(--muted-foreground)" onChange={(e) => setWifi({...wifi, pass: e.target.value})} />
                </div>
              )}

              {activeTab === 'vCARD' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="First Name" aria-label="First name" className="px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25 transition-all placeholder:text-(--muted-foreground)" onChange={(e) => setVCard({...vCard, fn: e.target.value})} />
                  <input placeholder="Last Name" aria-label="Last name" className="px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25 transition-all placeholder:text-(--muted-foreground)" onChange={(e) => setVCard({...vCard, ln: e.target.value})} />
                  <input placeholder="Phone No." aria-label="Phone number" className="px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25 transition-all placeholder:text-(--muted-foreground)" onChange={(e) => setVCard({...vCard, tel: e.target.value})} />
                  <input placeholder="Email Address" type="email" aria-label="Email address" className="px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25 transition-all placeholder:text-(--muted-foreground)" onChange={(e) => setVCard({...vCard, email: e.target.value})} />
                </div>
              )}

              {activeTab === 'UPI' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="UPI ID" aria-label="UPI ID" className="px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25 transition-all placeholder:text-(--muted-foreground)" onChange={(e) => setUpi({...upi, vpa: e.target.value})} />
                  <input placeholder="Merchant Name" aria-label="Merchant name" className="px-4 py-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25 transition-all placeholder:text-(--muted-foreground)" onChange={(e) => setUpi({...upi, name: e.target.value})} />
                </div>
              )}

              {activeTab === 'BULK' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-(--border) rounded-2xl p-8 text-center space-y-4 bg-(--background)">
                    <FileSpreadsheet className="mx-auto w-10 h-10 text-(--primary)" />
                    <p className="text-sm font-semibold text-(--muted-foreground)">Upload CSV (One URL per line)</p>
                    <input type="file" accept=".csv,.txt" onChange={handleCSVUpload} className="hidden" id="bulk-input" aria-label="Upload CSV file" />
                    <label htmlFor="bulk-input" className="inline-flex items-center min-h-[44px] px-6 py-2 bg-(--primary) text-(--primary-foreground) rounded-lg font-bold cursor-pointer hover:opacity-90 transition-colors motion-reduce:transition-none">Select File</label>
                  </div>
                  {bulkData.length > 0 && (
                    <div className="flex items-center justify-between bg-(--primary)/10 p-3 rounded-xl border border-(--primary)/20">
                      <span className="text-sm font-bold text-(--primary)">{bulkData.length} QRs Loaded</span>
                      <button onClick={clearBulkData} aria-label="Clear loaded QR list" className="text-(--danger) p-2 -m-1 rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"><X size={16}/></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-(--card) border border-(--border) rounded-2xl p-6 space-y-6 shadow-sm">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-(--primary)"><Palette size={20} className="text-(--primary)" /> Customize Style</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label htmlFor="qr-fg-color" className="text-ml font-semibold text-(--muted-foreground) uppercase">QR Color</label>
                <input id="qr-fg-color" type="color" className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-(--border) focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label htmlFor="qr-size" className="text-ml font-semibold text-(--muted-foreground) uppercase">Size</label>
                <select id="qr-size" className="w-full h-10 px-2 bg-(--background) border border-(--border) rounded-lg font-semibold text-ml focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25" value={size} onChange={(e) => setSize(Number(e.target.value))}>
                  <option value={140}>Small</option>
                  <option value={220}>Medium</option>
                  <option value={300}>Large</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-ml font-semibold text-(--muted-foreground) uppercase">Logo</label>
                <label className="w-full h-10 rounded-lg border border-(--border) flex items-center justify-center cursor-pointer text-md font-semibold bg-(--background)">
                  <ImageIcon size={14} className="mr-1"/> {customLogo ? "Added" : "Upload"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogo} aria-label="Upload logo image" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW */}
        <div className="lg:col-span-5">
          <div className="bg-(--card) border border-(--border) rounded-2xl p-8 flex flex-col items-center justify-center shadow-md sticky top-8">
            {isClient ? (
              <>
                {payloadError || isTooLong ? (
                  <div
                    role="alert"
                    className="w-full max-w-[280px] rounded-2xl border border-(--danger)/40 bg-(--danger-soft) p-6 text-center text-sm font-semibold text-(--danger)"
                  >
                    <AlertTriangle className="mx-auto mb-2 h-6 w-6" />
                    {payloadError || `This value is too long to encode as a QR code (${qrByteLength} bytes, limit ~${MAX_QR_BYTES}). Shorten it and try again.`}
                  </div>
                ) : (
                  <div style={{ backgroundColor: bgColor }} className="border border-(--border) rounded-2xl p-6 shadow-inner transition-transform hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100">
                    <QRCodeCanvas
                      id="qr-code"
                      ref={qrCanvasRef}
                      value={computedQrValue}
                      size={size}
                      bgColor={bgColor}
                      fgColor={fgColor}
                      level="H"
                      includeMargin
                      imageSettings={customLogo ? { src: customLogo, height: 40, width: 40, excavate: true } : null}
                    />
                  </div>
                )}
                <button
                  onClick={activeTab === 'BULK' ? downloadBulk : downloadQR}
                  disabled={isProcessing || (activeTab !== 'BULK' && (Boolean(payloadError) || isTooLong)) || (activeTab === 'BULK' && bulkData.length === 0)}
                  className="mt-8 w-full py-4 min-h-[44px] rounded-xl bg-(--primary) text-(--primary-foreground) font-bold hover:opacity-90 transition-all active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                   {isProcessing ? <Loader2 className="animate-spin motion-reduce:animate-none" /> : <Download className="w-5 h-5" />}
                  {activeTab === 'BULK' ? `Download Batch (${bulkData.length})` : 'Download QR'}
                </button>
                {activeTab === 'BULK' && bulkSkipped > 0 && (
                  <p role="status" className="mt-3 text-xs font-semibold text-(--warning)">
                    {bulkSkipped} row{bulkSkipped === 1 ? '' : 's'} skipped — too long to encode as a QR code.
                  </p>
                )}
                {activeTab === 'BULK' && bulkError && (
                  <p role="alert" className="mt-3 text-xs font-semibold text-(--danger)">
                    {bulkError}
                  </p>
                )}
              </>
            ) : (
              <div className="h-40 w-40 bg-(--muted) rounded-lg animate-pulse motion-reduce:animate-none" />
            )}
          </div>
        </div>
      </div>

      {/* DOWNLOAD COUNTER
          This tool makes no network requests, so there is no real scan,
          location, ISP or uptime telemetry to show -- only a local count of
          PNGs saved from this browser tab (also disclosed in the FAQ). */}
      <div className="mt-12 pt-8 border-t border-(--border)">
        <div className="flex items-center gap-3 mb-8">
          <Activity className="text-(--primary)" size={28} />
          <h2 className="text-2xl font-bold text-(--primary) uppercase tracking-tight">Session Download Counter</h2>
        </div>

        <div className="max-w-xs">
          <div className="bg-(--card) p-6 rounded-2xl border border-(--border) shadow-sm">
            <div className="flex items-center gap-3 mb-3 text-(--muted-foreground)">
              <QrCode size={18}/> <span className="text-xs font-bold uppercase">Downloads this session</span>
            </div>
            <h4 className="text-xl font-bold" role="status" aria-live="polite">{scanCount}</h4>
            <p className="text-xs text-(--muted-foreground) font-semibold uppercase mt-1">Local only, nothing uploaded</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
