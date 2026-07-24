"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BellOff,
  CalendarCheck,
  CalendarClock,
  Check,
  ClipboardCopy,
  Download,
  Eye,
  FileText,
  Fingerprint,
  Link2Off,
  LockKeyhole,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";

import {
  DEFAULT_OPTIONS,
  scrubCalendar,
} from "../lib/calendarPrivacy.mjs";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const PREVIEW_LIMIT = 8;
const MODE_OPTIONS = [
  { value: "keep", label: "Keep unchanged" },
  { value: "generalize", label: "Generalize" },
  { value: "remove", label: "Remove" },
];

const SAMPLE_CALENDAR = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example//Safe sample//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:sample-planning-42@example.test
DTSTART;TZID=Asia/Kolkata:20260812T103000
DTEND;TZID=Asia/Kolkata:20260812T113000
SUMMARY:Partner launch planning
ORGANIZER;CN="Sample Organizer":mailto:organizer@example.test
ATTENDEE;CN="Sample Attendee";ROLE=REQ-PARTICIPANT:mailto:attendee@example.test
LOCATION:Example Office\\, Floor 4
DESCRIPTION:Internal launch notes\\nJoin https://meet.google.com/abc-defg-hij
CONFERENCE;VALUE=URI:https://meet.google.com/abc-defg-hij
RRULE:FREQ=WEEKLY;COUNT=3
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

const SELECT_CLASS =
  "min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:shadow-[var(--anslation-ds-focus-ring)]";

function ModeSelect({ id, label, help, value, onChange }) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className="mt-1 block min-h-10 text-xs leading-5 text-muted-foreground">
        {help}
      </span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 ${SELECT_CLASS}`}
      >
        {MODE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleRow({ id, icon: Icon, label, help, checked, onChange }) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-surface-soft"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded-sm border-border text-primary accent-primary focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
      />
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <span>
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {help}
        </span>
      </span>
    </label>
  );
}

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function EventPreview({ events, title, emptyText }) {
  return (
    <section aria-labelledby={`${title.replaceAll(" ", "-").toLowerCase()}-title`}>
      <div className="flex items-center justify-between gap-3">
        <h3
          id={`${title.replaceAll(" ", "-").toLowerCase()}-title`}
          className="text-lg font-bold text-foreground"
        >
          {title}
        </h3>
        <span className="rounded-full border border-border bg-surface-soft px-3 py-1 text-xs font-semibold text-muted-foreground">
          {events.length} event{events.length === 1 ? "" : "s"}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-border bg-background p-5 text-center text-sm text-muted-foreground">
          {emptyText}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {events.slice(0, PREVIEW_LIMIT).map((event) => (
            <article
              key={`${event.index}-${event.start}-${event.summary}`}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-semibold text-foreground">
                    {event.summary}
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                    {event.start || "Start not supplied"}
                    {event.end ? ` → ${event.end}` : event.duration ? ` · ${event.duration}` : ""}
                  </p>
                </div>
                {event.recurring ? (
                  <span className="rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning">
                    Recurring
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border px-2 py-1">
                  {event.attendeeCount} attendee{event.attendeeCount === 1 ? "" : "s"}
                </span>
                {event.timezone ? (
                  <span className="rounded-full border border-border px-2 py-1">
                    {event.timezone}
                  </span>
                ) : null}
                {event.alarmCount ? (
                  <span className="rounded-full border border-border px-2 py-1">
                    {event.alarmCount} alarm{event.alarmCount === 1 ? "" : "s"}
                  </span>
                ) : null}
              </div>
            </article>
          ))}
          {events.length > PREVIEW_LIMIT ? (
            <p className="text-center text-xs text-muted-foreground">
              Preview shows the first {PREVIEW_LIMIT} events. All {events.length} events
              are included in the export.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

export default function CalendarPrivacyScrubber() {
  const [source, setSource] = useState("");
  const [fileName, setFileName] = useState("calendar.ics");
  const [options, setOptions] = useState({ ...DEFAULT_OPTIONS });
  const [fileError, setFileError] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => scrubCalendar(source, options),
    [options, source],
  );

  function updateOption(name, value) {
    setOptions((current) => ({ ...current, [name]: value }));
    setCopied(false);
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      setFileError("Choose an ICS file smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    try {
      const text = await file.text();
      setSource(text);
      setFileName(file.name.toLowerCase().endsWith(".ics") ? file.name : `${file.name}.ics`);
      setFileError("");
      setCopied(false);
    } catch {
      setFileError("This file could not be read in the browser.");
    }
    event.target.value = "";
  }

  async function copyOutput() {
    if (!result.ok || !result.output) return;
    const success = await safeCopyText(result.output);
    setCopied(success);
    if (success) window.setTimeout(() => setCopied(false), 1600);
  }

  function downloadOutput() {
    if (!result.ok || !result.output) return;
    const safeBaseName =
      fileName
        .replace(/\.ics$/i, "")
        .replace(/[^a-z0-9._-]+/gi, "-")
        .replace(/^-+|-+$/g, "") || "calendar";
    const url = URL.createObjectURL(
      new Blob([result.output], { type: "text/calendar;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeBaseName}-scrubbed.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const processedCount = result.stats
    ? result.stats.titlesProcessed +
      result.stats.attendeesProcessed +
      result.stats.organizersProcessed +
      result.stats.locationsProcessed +
      result.stats.descriptionsProcessed +
      result.stats.conferenceLinksRemoved +
      result.stats.alarmsRemoved +
      result.stats.uidsProcessed
    : 0;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="rounded-xl border border-border bg-surface p-5 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <CalendarCheck aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          Calendar Privacy Scrubber
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          Review and clean an ICS calendar before sharing it. Generalize identities,
          remove private event details and optionally shift dates while preserving
          event durations.
        </p>
        <div className="mx-auto mt-5 flex max-w-3xl items-start gap-3 rounded-lg border border-success/30 bg-success-soft p-4 text-left">
          <LockKeyhole
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-success"
          />
          <div>
            <p className="font-semibold text-foreground">Local-only by design</p>
            <p className="mt-1 text-sm leading-6 text-foreground">
              Files are read and transformed in this browser tab. The tool never
              connects to a calendar, uploads data, uses a network service or stores
              your file.
            </p>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <section className="tool-card min-w-0" aria-labelledby="calendar-input-title">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                <Upload aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h2
                  id="calendar-input-title"
                  className="text-2xl font-bold text-foreground"
                >
                  Add an ICS calendar
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Choose a file up to 2 MB or paste its plain-text contents.
                </p>
              </div>
            </div>

            <label className="mt-5 block" htmlFor="calendar-file">
              <span className="mb-2 block text-sm font-semibold text-foreground">
                Calendar file
              </span>
              <input
                id="calendar-file"
                type="file"
                accept=".ics,text/calendar"
                onChange={handleFile}
                className="block min-h-11 w-full cursor-pointer rounded-md border border-border bg-background text-sm text-muted-foreground file:mr-4 file:min-h-11 file:border-0 file:bg-primary-soft file:px-4 file:font-semibold file:text-primary hover:file:bg-surface-soft focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>
            {fileError ? (
              <p className="mt-2 text-sm font-medium text-danger" role="alert">
                {fileError}
              </p>
            ) : null}

            <div className="my-5 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                or paste
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <label className="block" htmlFor="calendar-source">
              <span className="mb-2 block text-sm font-semibold text-foreground">
                ICS text
              </span>
              <textarea
                id="calendar-source"
                value={source}
                onChange={(event) => {
                  setSource(event.target.value);
                  setFileError("");
                  setCopied(false);
                }}
                rows={12}
                spellCheck={false}
                autoCapitalize="none"
                autoComplete="off"
                placeholder={"BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n…"}
                className="min-h-56 w-full resize-y rounded-md border border-border bg-background px-4 py-3 font-mono text-xs leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => {
                  setSource(SAMPLE_CALENDAR);
                  setFileName("safe-sample.ics");
                  setFileError("");
                  setCopied(false);
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
              >
                <RefreshCw aria-hidden="true" className="h-4 w-4" />
                Safe example
              </button>
              <button
                type="button"
                onClick={() => {
                  setSource("");
                  setFileName("calendar.ics");
                  setFileError("");
                  setCopied(false);
                }}
                disabled={!source}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  setOptions({ ...DEFAULT_OPTIONS });
                  setCopied(false);
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
              >
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                Safe defaults
              </button>
            </div>
          </section>

          <section className="tool-card min-w-0" aria-labelledby="privacy-controls-title">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                <ShieldCheck aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h2
                  id="privacy-controls-title"
                  className="text-2xl font-bold text-foreground"
                >
                  Privacy controls
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  “Generalize” keeps a field’s place in the event but replaces its
                  private value.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <ModeSelect
                id="summary-mode"
                label="Event title"
                help="Replace titles with numbered private-event labels."
                value={options.summary}
                onChange={(value) => updateOption("summary", value)}
              />
              <ModeSelect
                id="attendee-mode"
                label="Attendee names & emails"
                help="Replace each identity while preserving non-identity participation fields."
                value={options.attendees}
                onChange={(value) => updateOption("attendees", value)}
              />
              <ModeSelect
                id="organizer-mode"
                label="Organizer"
                help="Replace or remove organizer name, email and delegation metadata."
                value={options.organizer}
                onChange={(value) => updateOption("organizer", value)}
              />
              <ModeSelect
                id="location-mode"
                label="Location"
                help="Replace physical or virtual location text."
                value={options.location}
                onChange={(value) => updateOption("location", value)}
              />
              <ModeSelect
                id="description-mode"
                label="Description & notes"
                help="Covers description, comment and alternate-description fields."
                value={options.description}
                onChange={(value) => updateOption("description", value)}
              />
              <label className="block" htmlFor="uid-mode">
                <span className="text-sm font-semibold text-foreground">Event UID</span>
                <span className="mt-1 block min-h-10 text-xs leading-5 text-muted-foreground">
                  Replacing keeps a local identifier without exposing the original.
                </span>
                <select
                  id="uid-mode"
                  value={options.uid}
                  onChange={(event) => updateOption("uid", event.target.value)}
                  className={`mt-2 ${SELECT_CLASS}`}
                >
                  <option value="keep">Keep unchanged</option>
                  <option value="replace">Replace safely</option>
                  <option value="remove">Remove</option>
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-3">
              <ToggleRow
                id="remove-conference-links"
                icon={Link2Off}
                label="Remove conference links"
                help="Removes standard and recognized vendor meeting-link properties."
                checked={options.removeConferenceUrls}
                onChange={(value) => updateOption("removeConferenceUrls", value)}
              />
              <ToggleRow
                id="remove-alarms"
                icon={BellOff}
                label="Remove event alarms"
                help="Removes complete VALARM blocks, including reminder text."
                checked={options.removeAlarms}
                onChange={(value) => updateOption("removeAlarms", value)}
              />
            </div>

            <label className="mt-5 block" htmlFor="shift-days">
              <span className="text-sm font-semibold text-foreground">
                Shift event dates
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Enter −3650 to 3650 days. Start/end dates, recurrence IDs and
                inclusion/exclusion dates move together; times and durations stay the
                same.
              </span>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="shift-days"
                  type="number"
                  min="-3650"
                  max="3650"
                  step="1"
                  value={options.shiftDays}
                  onChange={(event) => updateOption("shiftDays", event.target.value)}
                  className="min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="shrink-0 text-sm font-medium text-muted-foreground">
                  days
                </span>
              </div>
            </label>
          </section>
        </div>

        <div className="space-y-6">
          <section
            className="tool-card min-w-0"
            aria-labelledby="scrubbed-result-title"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <CalendarClock aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <h2
                    id="scrubbed-result-title"
                    className="text-2xl font-bold text-foreground"
                  >
                    Scrubbed calendar
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Changes update locally as you adjust the controls.
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  result.ok
                    ? "bg-success-soft text-success"
                    : "bg-surface-soft text-muted-foreground"
                }`}
              >
                {result.ok ? "Ready to review" : "Waiting for valid ICS"}
              </span>
            </div>

            {!result.ok ? (
              <div
                className={`mt-5 rounded-lg border p-5 ${
                  source
                    ? "border-danger/30 bg-danger-soft"
                    : "border-border bg-background"
                }`}
                role={source ? "alert" : undefined}
              >
                <div className="flex items-start gap-3">
                  {source ? (
                    <AlertTriangle
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 shrink-0 text-danger"
                    />
                  ) : (
                    <FileText
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">
                      {source ? "Calendar needs attention" : "No calendar added yet"}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
                      {result.errors.map((error) => (
                        <li key={error}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <MetricCard
                    icon={CalendarCheck}
                    label="Events"
                    value={result.stats.events}
                    detail="VEVENT entries processed"
                  />
                  <MetricCard
                    icon={Eye}
                    label="Fields changed"
                    value={processedCount}
                    detail="Removed or generalized values"
                  />
                  <MetricCard
                    icon={CalendarClock}
                    label="Dates shifted"
                    value={result.stats.shiftedDateValues}
                    detail={
                      Number(options.shiftDays)
                        ? `${options.shiftDays} day shift requested`
                        : "Date shifting is off"
                    }
                  />
                  <MetricCard
                    icon={BellOff}
                    label="Alarms removed"
                    value={result.stats.alarmsRemoved}
                    detail="Complete VALARM components"
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={copyOutput}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
                  >
                    {copied ? (
                      <Check aria-hidden="true" className="h-4 w-4 text-success" />
                    ) : (
                      <ClipboardCopy aria-hidden="true" className="h-4 w-4" />
                    )}
                    {copied ? "Copied" : "Copy scrubbed ICS"}
                  </button>
                  <button
                    type="button"
                    onClick={downloadOutput}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
                  >
                    <Download aria-hidden="true" className="h-4 w-4" />
                    Download scrubbed ICS
                  </button>
                </div>
              </>
            )}
          </section>

          {result.ok ? (
            <section className="tool-card min-w-0" aria-labelledby="review-title">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <Eye aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <h2 id="review-title" className="text-2xl font-bold text-foreground">
                    Review before sharing
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Compare the local source preview with the values in the export.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-6">
                <EventPreview
                  events={result.sourceEvents}
                  title="Source preview"
                  emptyText="No event entries were found."
                />
                <EventPreview
                  events={result.events}
                  title="Scrubbed preview"
                  emptyText="No event entries remain in the scrubbed file."
                />
              </div>

              <details className="mt-6 rounded-lg border border-border bg-background p-4">
                <summary className="cursor-pointer text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]">
                  Inspect generated ICS text
                </summary>
                <textarea
                  readOnly
                  value={result.output}
                  rows={12}
                  aria-label="Generated scrubbed ICS text"
                  className="mt-4 min-h-56 w-full resize-y rounded-md border border-border bg-surface px-4 py-3 font-mono text-xs leading-6 text-foreground outline-none focus:border-primary focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </details>
            </section>
          ) : null}

          <section className="tool-card min-w-0" aria-labelledby="limitations-title">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-warning-soft text-warning">
                <AlertTriangle aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h2
                  id="limitations-title"
                  className="text-2xl font-bold text-foreground"
                >
                  Important review limits
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  ICS files can contain provider-specific fields that no generic
                  scrubber can interpret safely.
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-3">
              {(result.warnings.length
                ? result.warnings
                : [
                    "Recurring rules are preserved, not expanded into every future occurrence.",
                    "Timezone definitions are preserved; date shifting does not rewrite daylight-saving rules.",
                    "Calendar-level metadata, attachments and unknown vendor fields require manual review.",
                  ]
              ).map((warning) => (
                <li
                  key={warning}
                  className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning-soft p-4 text-sm leading-6 text-foreground"
                >
                  <AlertTriangle
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                  />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                <Users aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  Review identities
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                <MapPin aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  Review locations
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                <Fingerprint
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-primary"
                />
                <span className="text-xs font-semibold text-foreground">
                  Review metadata
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
