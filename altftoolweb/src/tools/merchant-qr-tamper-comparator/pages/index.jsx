"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  CircleHelp,
  Download,
  EyeOff,
  FileImage,
  Info,
  KeyRound,
  Landmark,
  LockKeyhole,
  QrCode,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Table2,
  Upload,
  XCircle,
} from "lucide-react";
import {
  buildCountsOnlyComparisonReport,
  compareMerchantPayloads,
  parseUpiMerchantPayload,
} from "../lib/merchantQrCompare.mjs";

const MAX_FILE_BYTES = 12 * 1024 * 1024;
const MAX_IMAGE_EDGE = 4096;

const TRUSTED_SAMPLE =
  "upi://pay?pa=example-shop%40bank&pn=Example%20Shop&mid=STORE-42&am=499.00&cu=INR&tr=ORDER-1284";
const CURRENT_SAMPLE =
  "upi://collect?pa=different-shop%40bank&pn=Example%20Shop&mid=STORE-42&am=1499.00&cu=INR&tr=ORDER-1284";

const EMPTY_SIDE = {
  payload: "",
  imageStatus: "not-used",
  imageName: "",
  candidateCount: 0,
  error: "",
};

function ActionButton({
  children,
  icon: Icon,
  onClick,
  disabled = false,
  primary = false,
  className = "",
}) {
  const variant = primary
    ? "border-primary bg-primary text-primary-foreground hover:bg-primary-hover"
    : "border-border bg-surface text-foreground hover:border-primary hover:text-primary";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 text-sm font-bold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 ${variant} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

function StatusBadge({ state }) {
  if (state === "match") {
    return (
      <span className="inline-flex items-center gap-1 rounded-pill border border-success bg-success-soft px-3 py-1 text-xs font-bold text-success">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Match
      </span>
    );
  }
  if (state === "mismatch") {
    return (
      <span className="inline-flex items-center gap-1 rounded-pill border border-danger bg-danger-soft px-3 py-1 text-xs font-bold text-danger">
        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
        Mismatch
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-pill border border-border bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
      <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
      Not checkable
    </span>
  );
}

function loadImageCanvas(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const scale = Math.min(
          1,
          MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight),
        );
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Canvas image reading is unavailable.");
        context.drawImage(image, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve({ canvas, context, width, height });
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This browser could not decode the image."));
    };
    image.src = url;
  });
}

async function scanQrImage(file) {
  const jsQR = (await import("jsqr")).default;
  const { context, width, height } = await loadImageCanvas(file);
  const overlapX = Math.round(width * 0.08);
  const overlapY = Math.round(height * 0.08);
  const halfWidth = Math.ceil(width / 2);
  const halfHeight = Math.ceil(height / 2);
  const regions = [
    [0, 0, width, height],
    [0, 0, Math.min(width, halfWidth + overlapX), height],
    [
      Math.max(0, halfWidth - overlapX),
      0,
      Math.min(width, width - halfWidth + overlapX),
      height,
    ],
    [0, 0, width, Math.min(height, halfHeight + overlapY)],
    [
      0,
      Math.max(0, halfHeight - overlapY),
      width,
      Math.min(height, height - halfHeight + overlapY),
    ],
    [0, 0, Math.min(width, halfWidth + overlapX), Math.min(height, halfHeight + overlapY)],
    [
      Math.max(0, halfWidth - overlapX),
      0,
      Math.min(width, width - halfWidth + overlapX),
      Math.min(height, halfHeight + overlapY),
    ],
    [
      0,
      Math.max(0, halfHeight - overlapY),
      Math.min(width, halfWidth + overlapX),
      Math.min(height, height - halfHeight + overlapY),
    ],
    [
      Math.max(0, halfWidth - overlapX),
      Math.max(0, halfHeight - overlapY),
      Math.min(width, width - halfWidth + overlapX),
      Math.min(height, height - halfHeight + overlapY),
    ],
  ];
  const candidates = new Set();
  regions.forEach(([x, y, regionWidth, regionHeight]) => {
    if (regionWidth < 21 || regionHeight < 21) return;
    const pixels = context.getImageData(x, y, regionWidth, regionHeight);
    const result = jsQR(pixels.data, pixels.width, pixels.height, {
      inversionAttempts: "attemptBoth",
    });
    const payload = result?.data?.trim();
    if (payload) candidates.add(payload);
  });
  return [...candidates];
}

function SideInput({
  side,
  title,
  description,
  state,
  result,
  onPayloadChange,
  onFile,
  onClear,
  fileInputRef,
}) {
  const isTrusted = side === "trusted";
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
            {isTrusted ? (
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            ) : (
              <ScanSearch className="h-5 w-5" aria-hidden="true" />
            )}
          </span>
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        <span className="rounded-pill border border-border bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
          {isTrusted ? "Baseline" : "Compare"}
        </span>
      </div>

      <label className="mt-5 block" htmlFor={`${side}-payload`}>
        <span className="mb-2 block text-xs font-bold text-muted-foreground">
          Raw UPI payload
        </span>
        <textarea
          id={`${side}-payload`}
          value={state.payload}
          onChange={(event) => onPayloadChange(event.target.value)}
          rows={8}
          spellCheck={false}
          autoCapitalize="none"
          autoComplete="off"
          placeholder="upi://pay?pa=merchant@bank&pn=Merchant&am=100&cu=INR"
          className="w-full resize-y rounded-md border border-border bg-surface-soft p-3 font-mono text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/35"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <ActionButton
          icon={Upload}
          onClick={() => fileInputRef.current?.click()}
          disabled={state.imageStatus === "reading"}
        >
          {state.imageStatus === "reading" ? "Scanning locally…" : "Upload QR image"}
        </ActionButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
        <ActionButton
          icon={RefreshCw}
          onClick={onClear}
          disabled={!state.payload && state.imageStatus === "not-used"}
        >
          Clear side
        </ActionButton>
      </div>

      {state.imageStatus !== "not-used" && state.imageStatus !== "pasted" ? (
        <div
          className={`mt-4 flex items-start gap-3 rounded-lg border p-4 ${
            state.imageStatus === "decoded"
              ? "border-success bg-success-soft"
              : state.imageStatus === "reading"
                ? "border-info bg-info-soft"
                : "border-warning bg-warning-soft"
          }`}
        >
          {state.imageStatus === "decoded" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
          ) : state.imageStatus === "reading" ? (
            <ScanSearch className="mt-0.5 h-5 w-5 shrink-0 text-info" aria-hidden="true" />
          ) : (
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
          )}
          <div>
            <p className="text-sm font-bold text-foreground">
              {state.imageStatus === "decoded"
                ? "One QR payload decoded"
                : state.imageStatus === "reading"
                  ? "Reading pixels in this browser"
                  : state.imageStatus === "multiple"
                    ? "Multiple distinct QR payloads found"
                    : "No readable QR payload found"}
            </p>
            <p className="mt-1 break-all text-xs leading-relaxed text-muted-foreground">
              {state.error ||
                `${state.imageName} · ${state.candidateCount} distinct payload found by heuristic scans.`}
            </p>
          </div>
        </div>
      ) : null}

      {state.payload && !result.ok ? (
        <div role="alert" className="mt-4 rounded-lg border border-danger bg-danger-soft p-4 text-sm text-danger">
          {result.error}
        </div>
      ) : null}

      {result.ok && result.warnings.length ? (
        <div className="mt-4 rounded-lg border border-warning bg-warning-soft p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
            <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
            Payload format notes
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-muted-foreground">
            {result.warnings.map((warning) => (
              <li key={warning.code}>{warning.label}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function downloadText(contents, filename) {
  const blob = new Blob([contents], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function MerchantQrTamperComparator() {
  const [trusted, setTrusted] = useState(EMPTY_SIDE);
  const [current, setCurrent] = useState(EMPTY_SIDE);
  const [trustedConfirmed, setTrustedConfirmed] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");
  const trustedFileRef = useRef(null);
  const currentFileRef = useRef(null);
  const scanTokensRef = useRef({ trusted: 0, current: 0 });

  const trustedResult = useMemo(
    () => parseUpiMerchantPayload(trusted.payload),
    [trusted.payload],
  );
  const currentResult = useMemo(
    () => parseUpiMerchantPayload(current.payload),
    [current.payload],
  );
  const comparison = useMemo(
    () => compareMerchantPayloads(trustedResult, currentResult),
    [trustedResult, currentResult],
  );

  const updateSide = (side, updater) => {
    if (side === "trusted") {
      setTrusted(updater);
      setTrustedConfirmed(false);
    } else {
      setCurrent(updater);
    }
    setShowResults(false);
    setError("");
  };

  const changePayload = (side, payload) => {
    scanTokensRef.current[side] += 1;
    updateSide(side, {
      ...EMPTY_SIDE,
      payload,
      imageStatus: payload ? "pasted" : "not-used",
    });
  };

  const clearSide = (side) => {
    scanTokensRef.current[side] += 1;
    updateSide(side, { ...EMPTY_SIDE });
    const input = side === "trusted" ? trustedFileRef.current : currentFileRef.current;
    if (input) input.value = "";
  };

  const handleImage = async (side, file) => {
    setShowResults(false);
    setError("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      updateSide(side, {
        ...EMPTY_SIDE,
        imageStatus: "unreadable",
        imageName: file.name,
        error: "Choose a JPEG, PNG, or WebP image.",
      });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      updateSide(side, {
        ...EMPTY_SIDE,
        imageStatus: "unreadable",
        imageName: file.name,
        error: "Choose an image smaller than 12 MB.",
      });
      return;
    }

    const token = scanTokensRef.current[side] + 1;
    scanTokensRef.current[side] = token;
    updateSide(side, {
      ...EMPTY_SIDE,
      imageStatus: "reading",
      imageName: file.name,
    });

    try {
      const candidates = await scanQrImage(file);
      if (scanTokensRef.current[side] !== token) return;
      if (!candidates.length) {
        updateSide(side, {
          ...EMPTY_SIDE,
          imageStatus: "unreadable",
          imageName: file.name,
          error:
            "No QR was decoded. Try a straight, sharp image with the full quiet border visible, or paste the raw payload.",
        });
      } else if (candidates.length > 1) {
        updateSide(side, {
          ...EMPTY_SIDE,
          imageStatus: "multiple",
          imageName: file.name,
          candidateCount: candidates.length,
          error:
            "The image is ambiguous, so no payload was selected. Crop to the intended merchant QR or paste a trusted raw payload.",
        });
      } else {
        updateSide(side, {
          ...EMPTY_SIDE,
          payload: candidates[0],
          imageStatus: "decoded",
          imageName: file.name,
          candidateCount: 1,
        });
      }
    } catch {
      if (scanTokensRef.current[side] !== token) return;
      updateSide(side, {
        ...EMPTY_SIDE,
        imageStatus: "unreadable",
        imageName: file.name,
        error:
          "The browser could not decode this QR image. Try a clearer crop or paste the raw payload.",
      });
    }
  };

  const useSamples = () => {
    scanTokensRef.current.trusted += 1;
    scanTokensRef.current.current += 1;
    setTrusted({
      ...EMPTY_SIDE,
      payload: TRUSTED_SAMPLE,
      imageStatus: "pasted",
    });
    setCurrent({
      ...EMPTY_SIDE,
      payload: CURRENT_SAMPLE,
      imageStatus: "pasted",
    });
    setTrustedConfirmed(true);
    setShowResults(false);
    setError("");
  };

  const resetAll = () => {
    scanTokensRef.current.trusted += 1;
    scanTokensRef.current.current += 1;
    setTrusted({ ...EMPTY_SIDE });
    setCurrent({ ...EMPTY_SIDE });
    setTrustedConfirmed(false);
    setShowResults(false);
    setError("");
    if (trustedFileRef.current) trustedFileRef.current.value = "";
    if (currentFileRef.current) currentFileRef.current.value = "";
  };

  const runComparison = () => {
    setError("");
    if (!trustedConfirmed) {
      setError("Confirm that the reference payload came from an independent trusted source.");
      return;
    }
    if (!trustedResult.ok || !currentResult.ok) {
      setError("Both sides need one readable upi:// payload before comparison.");
      return;
    }
    setShowResults(true);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="mx-auto max-w-4xl text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-pill border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <QrCode className="h-4 w-4" aria-hidden="true" />
              Two-source comparison
            </span>
            <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-1 text-xs font-bold text-foreground">
              <LockKeyhole className="h-4 w-4 text-primary" aria-hidden="true" />
              Images stay local
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Merchant QR Tamper Comparator
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Compare an independently trusted merchant UPI QR payload with a QR currently on
            display. The tool reads fields only—it never opens a URI or initiates payment.
          </p>
        </header>

        <section className="rounded-lg border border-danger bg-danger-soft p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
            <div>
              <h2 className="font-bold text-foreground">A comparison is not merchant verification</h2>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                Matching fields do not prove that either QR is authentic, safe, current, or
                controlled by the merchant. A changed field may be legitimate. Confirm the
                recipient and amount inside your trusted UPI app before paying. Never enter a
                UPI PIN to receive money.
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-danger bg-danger-soft p-4 text-sm text-danger"
          >
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          <ActionButton icon={FileImage} onClick={useSamples}>
            Use safe mismatch sample
          </ActionButton>
          <ActionButton icon={RefreshCw} onClick={resetAll}>
            Clear memory
          </ActionButton>
        </div>

        <section className="grid gap-6 xl:grid-cols-2">
          <SideInput
            side="trusted"
            title="Trusted reference QR"
            description="Use a payload obtained through a separate trusted source, not another copy of the possibly altered sign."
            state={trusted}
            result={trustedResult}
            onPayloadChange={(value) => changePayload("trusted", value)}
            onFile={(file) => handleImage("trusted", file)}
            onClear={() => clearSide("trusted")}
            fileInputRef={trustedFileRef}
          />
          <SideInput
            side="current"
            title="Current displayed QR"
            description="Upload or paste the QR payload currently shown on the counter, sticker, invoice, screen, or message."
            state={current}
            result={currentResult}
            onPayloadChange={(value) => changePayload("current", value)}
            onFile={(file) => handleImage("current", file)}
            onClear={() => clearSide("current")}
            fileInputRef={currentFileRef}
          />
        </section>

        <section className="rounded-lg border border-warning bg-warning-soft p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <h2 className="font-bold text-foreground">Image decoding has important limits</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                The local scanner checks the full image and overlapping regions and may find
                multiple distinct QR payloads. Finding one does not prove that only one QR is
                present. A tiny, damaged, stylized, partly hidden, low-contrast, or overlaid
                code may be missed. If multiple codes are detected, that side remains
                inconclusive until you crop the intended code or paste its raw payload.
              </p>
            </div>
          </div>
        </section>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm transition-colors hover:border-primary">
          <input
            type="checkbox"
            checked={trustedConfirmed}
            onChange={(event) => {
              setTrustedConfirmed(event.target.checked);
              setShowResults(false);
            }}
            className="mt-1 h-5 w-5 rounded-sm border-border accent-primary focus-visible:ring-2 focus-visible:ring-primary/35"
          />
          <span>
            <span className="block font-bold text-foreground">
              Independently trusted reference confirmation
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
              I obtained the reference payload independently—for example from the merchant’s
              verified billing system, official receipt, or another trusted channel—not from
              the same possibly altered display.
            </span>
          </span>
        </label>

        <div className="flex justify-center">
          <ActionButton
            icon={ArrowLeftRight}
            primary
            onClick={runComparison}
            disabled={!trusted.payload || !current.payload}
          >
            Compare selected UPI fields
          </ActionButton>
        </div>

        {showResults ? (
          <>
            <section
              className={`rounded-lg border p-5 shadow-sm ${
                comparison.state === "mismatch"
                  ? "border-danger bg-danger-soft"
                  : comparison.state === "match"
                    ? "border-success bg-success-soft"
                    : "border-border bg-surface"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {comparison.state === "mismatch"
                      ? "Selected fields differ"
                      : comparison.state === "match"
                        ? "No difference found in comparable selected fields"
                        : "Comparison is inconclusive"}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {comparison.reason} This result does not establish authenticity,
                    ownership, merchant identity, or payment safety.
                  </p>
                </div>
                <StatusBadge state={comparison.state} />
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-border bg-surface p-3">
                  <dt className="text-xs font-bold text-muted-foreground">Matching</dt>
                  <dd className="mt-1 text-2xl font-extrabold text-success">
                    {comparison.matchCount}
                  </dd>
                </div>
                <div className="rounded-md border border-border bg-surface p-3">
                  <dt className="text-xs font-bold text-muted-foreground">Mismatching</dt>
                  <dd className="mt-1 text-2xl font-extrabold text-danger">
                    {comparison.mismatchCount}
                  </dd>
                </div>
                <div className="rounded-md border border-border bg-surface p-3">
                  <dt className="text-xs font-bold text-muted-foreground">Not checkable</dt>
                  <dd className="mt-1 text-2xl font-extrabold text-foreground">
                    {comparison.notCheckableCount}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <Table2 className="h-5 w-5 text-primary" aria-hidden="true" />
                    Deterministic field comparison
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reference and transaction IDs are compared exactly after trimming.
                  </p>
                </div>
                <ActionButton
                  icon={Download}
                  onClick={() =>
                    downloadText(
                      buildCountsOnlyComparisonReport(
                        comparison,
                        trustedResult,
                        currentResult,
                        {
                          trusted: trusted.imageStatus,
                          current: current.imageStatus,
                        },
                      ),
                      "merchant-qr-comparison-counts.csv",
                    )
                  }
                >
                  Download counts-only report
                </ActionButton>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-soft text-xs uppercase text-muted-foreground">
                      <th className="px-3 py-3 font-bold">Field</th>
                      <th className="px-3 py-3 font-bold">Trusted reference</th>
                      <th className="px-3 py-3 font-bold">Current display</th>
                      <th className="px-3 py-3 font-bold">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.rows.map((row) => (
                      <tr
                        key={row.key}
                        className={`border-b last:border-0 ${
                          row.state === "mismatch"
                            ? "border-danger bg-danger-soft"
                            : "border-border"
                        }`}
                      >
                        <th className="px-3 py-3 font-bold text-foreground">{row.label}</th>
                        <td className="max-w-sm break-all px-3 py-3 font-mono text-foreground">
                          {row.trustedDisplay}
                        </td>
                        <td className="max-w-sm break-all px-3 py-3 font-mono text-foreground">
                          {row.currentDisplay}
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge state={row.state} />
                          <p className="mt-2 min-w-48 text-xs leading-relaxed text-muted-foreground">
                            {row.detail}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-lg border border-info bg-info-soft p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Info className="h-4 w-4 text-info" aria-hidden="true" />
                  Comparison normalization
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  VPA, action, and currency ignore letter case; payee names also collapse
                  repeated spaces; numeric amounts treat 100 and 100.00 as equal. Merchant
                  ID, transaction reference, and transaction ID remain case-sensitive after
                  trimming. Both-missing optional fields are marked Not checkable.
                </p>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
                <LockKeyhole className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="mt-3 font-bold text-foreground">No image upload</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Image pixels and decoded payloads stay in page memory. Clearing, refreshing,
                  closing, or leaving the tab discards them.
                </p>
              </article>
              <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
                <EyeOff className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="mt-3 font-bold text-foreground">Safe report boundary</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  The downloadable CSV contains counts and source states only—no VPA, merchant
                  name, amount, reference, raw payload, or filename.
                </p>
              </article>
              <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
                <Landmark className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="mt-3 font-bold text-foreground">Verify before payment</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Trust the recipient and amount displayed by your official UPI app—not this
                  comparison alone. Cancel if anything is unexpected.
                </p>
              </article>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
