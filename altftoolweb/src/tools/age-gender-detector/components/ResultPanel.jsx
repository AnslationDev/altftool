"use client";

import { useState } from "react";
import {
  Check,
  Clock3,
  Download,
  Loader2,
  Mars,
  RefreshCw,
  ScanFace,
  TriangleAlert,
  Users,
  Venus,
} from "lucide-react";
import { toneColor } from "../utils/tones";
import { CARD, FOCUS_RING } from "./ui.jsx";

function pct(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function titleCase(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "—";
}

/* ---------------------------- corner brackets ---------------------------- */

function FaceBrackets({ image, face }) {
  if (!image || !face) return null;
  const { naturalWidth, naturalHeight } = image;
  const left = (face.box.x / naturalWidth) * 100;
  const top = (face.box.y / naturalHeight) * 100;
  const width = (face.box.width / naturalWidth) * 100;
  const height = (face.box.height / naturalHeight) * 100;

  const corner = "absolute h-5 w-5 border-(--anslation-ds-secondary)";

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
    >
      <span className={`${corner} left-0 top-0 rounded-tl-[6px] border-l-[3px] border-t-[3px]`} />
      <span className={`${corner} right-0 top-0 rounded-tr-[6px] border-r-[3px] border-t-[3px]`} />
      <span className={`${corner} bottom-0 left-0 rounded-bl-[6px] border-b-[3px] border-l-[3px]`} />
      <span className={`${corner} bottom-0 right-0 rounded-br-[6px] border-b-[3px] border-r-[3px]`} />
    </span>
  );
}

/* ------------------------------ result export ----------------------------- */

async function downloadAnnotatedResult(image, face) {
  const img = new Image();
  img.src = image.src;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight + 84;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#101827";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  // face box
  const { x, y, width, height } = face.box;
  ctx.strokeStyle = "#22d3ee";
  ctx.lineWidth = Math.max(3, canvas.width / 240);
  ctx.strokeRect(x, y, width, height);

  // caption band
  const bandY = img.naturalHeight;
  ctx.fillStyle = "#101827";
  ctx.fillRect(0, bandY, canvas.width, 84);
  ctx.fillStyle = "#f8fafc";
  ctx.font = `bold ${Math.max(20, canvas.width / 28)}px system-ui, sans-serif`;
  ctx.fillText(
    `Age ~${face.age} · ${titleCase(face.gender)} · Confidence ${pct(face.genderConfidence)}`,
    16,
    bandY + 52,
  );

  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = "age-gender-result.png";
  link.click();
}

/* --------------------------------- states --------------------------------- */

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[12px] border-2 border-dashed border-(--border) bg-(--background) px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-(--muted) text-(--muted-foreground)">
        <ScanFace size={28} aria-hidden="true" />
      </span>
      <p className="text-sm font-bold text-(--foreground)">No photo analyzed yet</p>
      <p className="max-w-[260px] text-xs leading-5 text-(--muted-foreground)">
        Upload a photo or use your camera — the estimated age and gender will appear here
        instantly.
      </p>
    </div>
  );
}

function BusyState({ status }) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[12px] border border-(--border) bg-(--background) px-6 py-14 text-center"
      role="status"
    >
      <Loader2
        size={30}
        aria-hidden="true"
        className="motion-safe:animate-spin text-(--primary-hover) dark:text-(--primary)"
      />
      <p className="text-sm font-bold text-(--foreground)">
        {status === "loading" ? "Loading AI model…" : "Analyzing face…"}
      </p>
      <p className="max-w-[260px] text-xs leading-5 text-(--muted-foreground)">
        {status === "loading"
          ? "First run downloads a small on-device model (~600KB). It stays cached after that."
          : "Estimating age and gender locally on your device."}
      </p>
    </div>
  );
}

function ErrorState({ error, onReset }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[12px] border px-6 py-14 text-center"
      style={{
        borderColor: "color-mix(in srgb, var(--anslation-ds-danger) 35%, transparent)",
        backgroundColor: "color-mix(in srgb, var(--anslation-ds-danger-soft) 55%, transparent)",
      }}
      role="alert"
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: "var(--anslation-ds-danger-soft)",
          color: "color-mix(in srgb, var(--anslation-ds-danger) 75%, var(--foreground))",
        }}
      >
        <TriangleAlert size={24} aria-hidden="true" />
      </span>
      <p className="text-sm font-bold text-(--foreground)">Detection failed</p>
      <p className="max-w-[280px] text-xs leading-5 text-(--muted-foreground)">{error}</p>
      <button
        type="button"
        onClick={onReset}
        className={`mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-(--border) bg-(--card) px-4 text-sm font-bold text-(--foreground) transition hover:border-(--primary) ${FOCUS_RING}`}
      >
        <RefreshCw size={15} aria-hidden="true" />
        Try Another Photo
      </button>
    </div>
  );
}

/* ---------------------------------- panel --------------------------------- */

export default function ResultPanel({
  status,
  image,
  faces,
  activeFace,
  setActiveFace,
  processingMs,
  error,
  onReset,
}) {
  const [downloading, setDownloading] = useState(false);
  const face = faces[activeFace] || faces[0] || null;
  const hasResult = status === "done" && face && image;

  async function handleDownload() {
    if (!hasResult || downloading) return;
    setDownloading(true);
    try {
      await downloadAnnotatedResult(image, face);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section aria-label="Detection result" className={`${CARD} flex flex-col p-4 sm:p-5`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold tracking-tight text-(--foreground)">Detection Result</h2>
        {faces.length > 1 && (
          <div className="flex gap-1.5" role="tablist" aria-label="Detected faces">
            {faces.map((item, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === activeFace}
                onClick={() => setActiveFace(index)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${FOCUS_RING} ${
                  index === activeFace
                    ? "bg-(--primary) text-(--primary-foreground)"
                    : "bg-(--muted) text-(--muted-foreground) hover:text-(--foreground)"
                }`}
              >
                Face {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {status === "idle" && <EmptyState />}
      {(status === "loading" || status === "analyzing") && <BusyState status={status} />}
      {status === "error" && <ErrorState error={error} onReset={onReset} />}

      {hasResult && (
        <div className="flex flex-1 flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {/* annotated preview */}
            <div className="relative self-start overflow-hidden rounded-[12px] border border-(--border) bg-(--muted)">
              <img
                src={image.src}
                alt="Analyzed"
                className="block h-auto w-full"
                draggable={false}
              />
              <FaceBrackets image={image} face={face} />
            </div>

            {/* headline tiles + confidence */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center justify-center rounded-[12px] border border-(--border) bg-(--background) p-4 text-center">
                  <p className="text-xs font-semibold text-(--muted-foreground)">Estimated Age</p>
                  <p className="mt-1 text-4xl font-extrabold leading-none tabular-nums text-(--primary-hover) dark:text-(--primary)">
                    {face.age}
                  </p>
                  <p className="mt-1.5 text-xs font-semibold text-(--muted-foreground)">
                    years old
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-[12px] border border-(--border) bg-(--background) p-4 text-center">
                  <p className="text-xs font-semibold text-(--muted-foreground)">Gender</p>
                  <span
                    className="mt-1.5"
                    style={{ color: toneColor(face.gender === "female" ? "danger" : "info") }}
                  >
                    {face.gender === "female" ? (
                      <Venus size={30} aria-hidden="true" />
                    ) : (
                      <Mars size={30} aria-hidden="true" />
                    )}
                  </span>
                  <p className="mt-1.5 text-lg font-extrabold leading-none text-(--foreground)">
                    {titleCase(face.gender)}
                  </p>
                </div>
              </div>

              <div className="rounded-[12px] border border-(--border) bg-(--background) p-4">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                  <span className="text-(--muted-foreground)">Confidence Score</span>
                  <span className="tabular-nums text-(--foreground)">
                    {pct(face.genderConfidence)}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={Math.round(face.genderConfidence * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Confidence score"
                  className="h-2 overflow-hidden rounded-full bg-(--muted)"
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: pct(face.genderConfidence),
                      background: "var(--anslation-ds-cta-gradient)",
                    }}
                  />
                </div>

                <dl className="mt-3 divide-y divide-(--border) text-sm">
                  <div className="flex items-center justify-between gap-2 py-2">
                    <dt className="flex items-center gap-1.5 text-(--muted-foreground)">
                      <ScanFace size={14} aria-hidden="true" /> Face Detected
                    </dt>
                    <dd
                      className="flex items-center gap-1 font-bold"
                      style={{ color: toneColor("success") }}
                    >
                      <Check size={14} aria-hidden="true" /> Yes
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2 py-2">
                    <dt className="flex items-center gap-1.5 text-(--muted-foreground)">
                      <Clock3 size={14} aria-hidden="true" /> Processing Time
                    </dt>
                    <dd className="font-bold tabular-nums text-(--foreground)">
                      {(processingMs / 1000).toFixed(1)} sec
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2 py-2">
                    <dt className="flex items-center gap-1.5 text-(--muted-foreground)">
                      <Users size={14} aria-hidden="true" /> Faces Found
                    </dt>
                    <dd className="font-bold tabular-nums text-(--foreground)">{faces.length}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onReset}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-(--border) bg-(--card) px-4 text-sm font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary-hover) dark:hover:text-(--primary) ${FOCUS_RING}`}
            >
              <RefreshCw size={16} aria-hidden="true" />
              Analyze Another
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-[8px] px-4 text-sm font-bold text-white shadow-[0_6px_16px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition hover:opacity-95 disabled:opacity-60 ${FOCUS_RING}`}
              style={{ background: "var(--anslation-ds-cta-gradient)" }}
            >
              <Download size={16} aria-hidden="true" />
              {downloading ? "Preparing…" : "Download Result"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
