"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  MonitorCheck,
  MousePointer2,
  Plus,
  ShieldCheck,
  Square,
  Trash2,
} from "lucide-react";

import {
  MIN_ZONE_SIZE,
  PRIVACY_CHECKLIST_ITEMS,
  normalizeZone,
  summarizeChecklist,
  updateZone,
  zoneFromDrag,
} from "../lib/privacyZones.mjs";

const PRESET_ZONES = [
  {
    label: "Browser tabs",
    zone: { x: 0, y: 0, width: 100, height: 12 },
  },
  {
    label: "Notification corner",
    zone: { x: 70, y: 0, width: 30, height: 20 },
  },
  {
    label: "Taskbar or dock",
    zone: { x: 0, y: 90, width: 100, height: 10 },
  },
];

function stopMediaStream(stream) {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    track.onended = null;
    track.stop();
  }
}

function pointInPreview(event, element) {
  const rectangle = element.getBoundingClientRect();
  if (!rectangle.width || !rectangle.height) return null;

  return {
    x: ((event.clientX - rectangle.left) / rectangle.width) * 100,
    y: ((event.clientY - rectangle.top) / rectangle.height) * 100,
  };
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-[var(--foreground)]">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PrivacyZone({ zone, index, onChange, onRemove }) {
  const fields = [
    { key: "x", label: "Left" },
    { key: "y", label: "Top" },
    { key: "width", label: "Width" },
    { key: "height", label: "Height" },
  ];

  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-[var(--foreground)]">
            {index + 1}. {zone.label}
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Solid preview cover</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          aria-label={`Remove ${zone.label}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="text-xs font-semibold text-[var(--foreground)]">
            <span className="flex items-center justify-between gap-2">
              {field.label}
              <span className="font-mono text-[var(--muted-foreground)]">
                {Math.round(zone[field.key])}%
              </span>
            </span>
            <input
              type="range"
              min={
                field.key === "width" || field.key === "height"
                  ? MIN_ZONE_SIZE
                  : 0
              }
              max="100"
              step="1"
              value={zone[field.key]}
              onChange={(event) => onChange({ [field.key]: Number(event.target.value) })}
              className="mt-2 w-full accent-[var(--primary)]"
            />
          </label>
        ))}
      </div>
    </article>
  );
}

export default function ScreenSharePrivacyGuard() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const overlayRef = useRef(null);
  const zoneSequence = useRef(1);

  const [isStarting, setIsStarting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState("");
  const [surfaceType, setSurfaceType] = useState("");
  const [videoDimensions, setVideoDimensions] = useState({ width: 16, height: 9 });
  const [zones, setZones] = useState([]);
  const [drag, setDrag] = useState(null);
  const [checkedItems, setCheckedItems] = useState([]);

  const checklistSummary = useMemo(
    () => summarizeChecklist(checkedItems),
    [checkedItems],
  );

  const disconnectPreview = useCallback((stopTracks = true) => {
    const currentStream = streamRef.current;
    streamRef.current = null;

    if (stopTracks) stopMediaStream(currentStream);
    if (videoRef.current) videoRef.current.srcObject = null;

    setIsSharing(false);
    setIsStarting(false);
    setSurfaceType("");
    setDrag(null);
  }, []);

  useEffect(
    () => () => {
      stopMediaStream(streamRef.current);
      streamRef.current = null;
    },
    [],
  );

  const startPreview = async () => {
    setError("");

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError("This browser does not support private screen preview. Try a current desktop browser.");
      return;
    }

    setIsStarting(true);
    let nextStream = null;

    try {
      nextStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const previousStream = streamRef.current;
      const videoTrack = nextStream.getVideoTracks()[0];

      if (videoRef.current) {
        videoRef.current.srcObject = nextStream;
        await videoRef.current.play();
      }

      streamRef.current = nextStream;
      stopMediaStream(previousStream);
      setZones([]);
      setCheckedItems([]);
      setSurfaceType(videoTrack?.getSettings?.().displaySurface || "selected surface");
      setIsSharing(true);
      setIsStarting(false);

      if (videoTrack) {
        videoTrack.onended = () => {
          if (streamRef.current !== nextStream) return;
          streamRef.current = null;
          if (videoRef.current) videoRef.current.srcObject = null;
          setIsSharing(false);
          setSurfaceType("");
          setDrag(null);
        };
      }
    } catch (captureError) {
      stopMediaStream(nextStream);
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        if (streamRef.current) videoRef.current.play().catch(() => {});
      }
      setIsStarting(false);
      const wasCancelled =
        captureError?.name === "NotAllowedError" || captureError?.name === "AbortError";
      setError(
        wasCancelled
          ? "No surface was selected. Your browser did not start a preview."
          : "The selected surface could not be previewed. Check browser permissions and try again.",
      );
    }
  };

  const addPresetZone = (preset) => {
    const id = `privacy-zone-${zoneSequence.current}`;
    zoneSequence.current += 1;
    setZones((current) => [
      ...current,
      normalizeZone({ ...preset.zone, id, label: preset.label }),
    ]);
  };

  const handlePointerDown = (event) => {
    if (!isSharing || event.button !== 0 || !overlayRef.current) return;
    const point = pointInPreview(event, overlayRef.current);
    if (!point) return;

    overlayRef.current.setPointerCapture(event.pointerId);
    setDrag({ pointerId: event.pointerId, start: point, current: point });
  };

  const handlePointerMove = (event) => {
    if (!drag || drag.pointerId !== event.pointerId || !overlayRef.current) return;
    const point = pointInPreview(event, overlayRef.current);
    if (point) setDrag((current) => ({ ...current, current: point }));
  };

  const finishDrag = (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;

    const finalPoint = overlayRef.current
      ? pointInPreview(event, overlayRef.current) || drag.current
      : drag.current;
    const id = `privacy-zone-${zoneSequence.current}`;
    const nextZone = zoneFromDrag(drag.start, finalPoint, {
      id,
      label: `Custom cover ${zoneSequence.current}`,
    });

    setDrag(null);
    if (!nextZone) return;

    zoneSequence.current += 1;
    setZones((current) => [...current, nextZone]);
  };

  const previewAspectRatio = `${videoDimensions.width} / ${videoDimensions.height}`;
  const draftZone = drag
    ? zoneFromDrag(drag.start, drag.current, { id: "draft", label: "New cover" })
    : null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="border-b border-[var(--border)] bg-[var(--section-highlight)] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-[var(--primary)]">
                <MonitorCheck className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wide">Private preflight</span>
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--foreground)]">
                Screen Share Privacy Guard
              </h1>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
                Rehearse a selected screen or window, mark sensitive areas, and complete a
                privacy check before opening your meeting app.
              </p>
            </div>

            <div className="flex flex-wrap gap-2" aria-label="Privacy guarantees">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-bold text-[var(--foreground)]">
                <LockKeyhole className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                No upload
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-bold text-[var(--foreground)]">
                <EyeOff className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                No recording
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
          <div className="flex gap-3 rounded-lg border border-[var(--success)] bg-[var(--success-soft)] p-4">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
              aria-hidden="true"
            />
            <div>
              <p className="font-bold text-[var(--foreground)]">What this tool does</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                The selected surface stays in this browser tab. Covers and checklist choices
                are held in memory and disappear when the page closes.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]"
              aria-hidden="true"
            />
            <div>
              <p className="font-bold text-[var(--foreground)]">Important limitation</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Preview covers do not change what Zoom, Meet, Teams, or another app shares.
                Hide sensitive content in the source app before going live.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,0.8fr)]">
        <Section
          title="1. Select and inspect a surface"
          description="Capture starts only after you press the button and accept the browser picker."
        >
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={startPreview}
              disabled={isStarting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              {isStarting
                ? "Waiting for browser…"
                : isSharing
                  ? "Choose another surface"
                  : "Start private preview"}
            </button>

            {isSharing ? (
              <button
                type="button"
                onClick={() => disconnectPreview(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                <Square className="h-4 w-4" aria-hidden="true" />
                Stop preview
              </button>
            ) : null}

            <p className="text-xs font-semibold text-[var(--muted-foreground)]" aria-live="polite">
              {isSharing
                ? `Previewing: ${surfaceType}`
                : "Nothing is being captured"}
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              className="mt-4 flex gap-3 rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-sm text-[var(--foreground)]"
            >
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]"
                aria-hidden="true"
              />
              <p>{error}</p>
            </div>
          ) : null}

          <div
            className="relative mt-4 w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--canvas)]"
            style={{ aspectRatio: previewAspectRatio }}
          >
            <video
              ref={videoRef}
              muted
              playsInline
              className={`h-full w-full object-contain ${isSharing ? "block" : "hidden"}`}
              onLoadedMetadata={(event) => {
                const { videoWidth, videoHeight } = event.currentTarget;
                if (videoWidth && videoHeight) {
                  setVideoDimensions({ width: videoWidth, height: videoHeight });
                }
              }}
              aria-label="Private preview of the selected surface"
            />

            {!isSharing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <MonitorCheck
                  className="h-10 w-10 text-[var(--muted-foreground)]"
                  aria-hidden="true"
                />
                <p className="mt-3 font-bold text-[var(--foreground)]">No live preview</p>
                <p className="mt-1 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
                  Select a screen, window, or tab to inspect it locally. Audio is never
                  requested.
                </p>
              </div>
            ) : (
              <>
                <div
                  ref={overlayRef}
                  role="application"
                  tabIndex={0}
                  aria-label="Privacy cover drawing area. Drag to add a solid preview cover."
                  className="absolute inset-0 cursor-crosshair touch-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={finishDrag}
                  onPointerCancel={() => setDrag(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setDrag(null);
                  }}
                >
                  {zones.map((zone, index) => (
                    <div
                      key={zone.id}
                      className="pointer-events-none absolute flex items-center justify-center overflow-hidden border border-[var(--border-strong)] bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                      style={{
                        left: `${zone.x}%`,
                        top: `${zone.y}%`,
                        width: `${zone.width}%`,
                        height: `${zone.height}%`,
                      }}
                    >
                      <span className="truncate px-2 text-xs font-black">
                        Cover {index + 1}
                      </span>
                    </div>
                  ))}
                  {draftZone ? (
                    <div
                      className="pointer-events-none absolute border-2 border-dashed border-[var(--primary)] bg-[var(--primary)]/20"
                      style={{
                        left: `${draftZone.x}%`,
                        top: `${draftZone.y}%`,
                        width: `${draftZone.width}%`,
                        height: `${draftZone.height}%`,
                      }}
                    />
                  ) : null}
                </div>

                <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-[var(--card)] px-3 py-1.5 text-xs font-bold text-[var(--foreground)] shadow-sm">
                  <MousePointer2 className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden="true" />
                  Drag to add a preview-only cover
                </span>
              </>
            )}
          </div>
        </Section>

        <Section
          title="2. Privacy checklist"
          description="A manual local checklist—no OCR, AI, screenshots, or content analysis."
        >
          <div
            className={`mb-4 flex items-center gap-3 rounded-lg border p-4 ${
              checklistSummary.ready
                ? "border-[var(--success)] bg-[var(--success-soft)]"
                : "border-[var(--border)] bg-[var(--section-highlight)]"
            }`}
            aria-live="polite"
          >
            {checklistSummary.ready ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" aria-hidden="true" />
            ) : (
              <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
            )}
            <div>
              <p className="font-bold text-[var(--foreground)]">
                {checklistSummary.ready
                  ? "Manual checks complete"
                  : `${checklistSummary.remaining} checks remaining`}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {checklistSummary.completed} of {checklistSummary.total} confirmed
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {PRIVACY_CHECKLIST_ITEMS.map((item) => {
              const isChecked = checkedItems.includes(item.id);
              return (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 transition hover:border-[var(--border-strong)]"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      setCheckedItems((current) =>
                        current.includes(item.id)
                          ? current.filter((id) => id !== item.id)
                          : [...current, item.id],
                      )
                    }
                    className="peer sr-only"
                  />
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary)] peer-focus-visible:ring-offset-2 ${
                      isChecked
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border-strong)] bg-[var(--card)]"
                    }`}
                    aria-hidden="true"
                  >
                    {isChecked ? <Check className="h-3.5 w-3.5" /> : null}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-[var(--foreground)]">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {item.detail}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </Section>
      </div>

      <Section
        title="3. Mark areas to hide in the source app"
        description="Drag over the preview or add a preset, then use the sliders for precise placement."
      >
        <div className="flex flex-wrap gap-2">
          {PRESET_ZONES.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => addPresetZone(preset)}
              disabled={!isSharing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {preset.label}
            </button>
          ))}

          {zones.length ? (
            <button
              type="button"
              onClick={() => setZones([])}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-bold text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear covers
            </button>
          ) : null}
        </div>

        {!isSharing ? (
          <div className="mt-4 flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--section-highlight)] p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              Start a private preview first so every cover can be positioned against the
              surface you plan to inspect.
            </p>
          </div>
        ) : zones.length ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {zones.map((zone, index) => (
              <PrivacyZone
                key={zone.id}
                zone={zone}
                index={index}
                onChange={(patch) =>
                  setZones((current) =>
                    current.map((item) =>
                      item.id === zone.id ? updateZone(item, patch) : item,
                    ),
                  )
                }
                onRemove={() =>
                  setZones((current) => current.filter((item) => item.id !== zone.id))
                }
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--background)] p-6 text-center">
            <MousePointer2
              className="mx-auto h-7 w-7 text-[var(--muted-foreground)]"
              aria-hidden="true"
            />
            <p className="mt-2 font-bold text-[var(--foreground)]">No preview covers yet</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Drag across the live preview or add one of the common presets.
            </p>
          </div>
        )}
      </Section>

      <section className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-bold text-[var(--foreground)]">Before you go live</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
              <li>Hide or move every item marked by a cover in the original app.</li>
              <li>Prefer one clean application window instead of the entire screen.</li>
              <li>Use your meeting app&apos;s own preview and confirm the selected surface again.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
