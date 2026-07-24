"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Download,
  FileKey2,
  Fingerprint,
  GitBranch,
  Info,
  Link2,
  ListOrdered,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Plus,
  RotateCcw,
  ShieldAlert,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";

import {
  applySha256EventHashChain,
  buildCanonicalRecord,
  buildCountsOnlyReport,
  DIGEST_ALGORITHMS,
  EVENT_TYPES,
  LIMITATIONS,
  LIMITS,
  stableCanonicalStringify,
  validateEvidenceChainDraft,
} from "../lib/evidenceChain.mjs";

function createEvidenceItem(key, id = "") {
  return {
    _key: key,
    id,
    label: "",
    digestAlgorithm: "SHA-256",
    digest: "",
  };
}

function createEvent(key, eventId = "", evidenceItemId = "") {
  return {
    _key: key,
    eventId,
    evidenceItemId,
    type: "acquisition",
    timestamp: "",
    timezone: "",
    actor: "",
    recipient: "",
    location: "",
    note: "",
  };
}

function initialDraft() {
  return {
    caseReference: "",
    evidenceItems: [createEvidenceItem("evidence-1", "EV-001")],
    events: [createEvent("event-1", "EVENT-001", "EV-001")],
  };
}

function downloadJsonText(filename, text) {
  const objectUrl = URL.createObjectURL(
    new Blob([text], { type: "application/json;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

function FieldLabel({ children, optional = false }) {
  return (
    <span className="mb-2 block text-sm font-semibold text-foreground">
      {children}
      {optional ? (
        <span className="ml-1 font-normal text-muted-foreground">
          (optional)
        </span>
      ) : null}
    </span>
  );
}

function MetricCard({ detail, icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
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

function IssueList({ issues, tone }) {
  if (!issues.length) return null;
  const styles =
    tone === "warning"
      ? "border-warning bg-warning-soft"
      : "border-danger bg-danger-soft";
  const heading =
    tone === "warning"
      ? `${issues.length} review note${issues.length === 1 ? "" : "s"}`
      : `${issues.length} validation issue${issues.length === 1 ? "" : "s"}`;
  return (
    <div className={`rounded-lg border p-4 ${styles}`} role="alert">
      <p className="font-semibold text-foreground">{heading}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
        {issues.map((issue, index) => (
          <li key={`${issue.code}-${issue.path}-${index}`}>{issue.message}</li>
        ))}
      </ul>
    </div>
  );
}

export default function EvidenceChainOrganizer() {
  const countersRef = useRef({ evidence: 2, event: 2 });
  const runTokenRef = useRef(0);
  const [draft, setDraft] = useState(initialDraft);
  const [includeHashChain, setIncludeHashChain] = useState(true);
  const [validation, setValidation] = useState(null);
  const [prepared, setPrepared] = useState(null);
  const [busy, setBusy] = useState(false);
  const [operationError, setOperationError] = useState("");

  const evidenceOptions = useMemo(
    () =>
      [
        ...new Set(
          draft.evidenceItems
            .map((item) => item.id.trim())
            .filter(Boolean),
        ),
      ],
    [draft.evidenceItems],
  );

  function invalidatePrepared() {
    runTokenRef.current += 1;
    setValidation(null);
    setPrepared(null);
    setOperationError("");
  }

  function updateDraft(updater) {
    invalidatePrepared();
    setDraft((current) => updater(current));
  }

  function updateEvidenceItem(key, field, value) {
    updateDraft((current) => ({
      ...current,
      evidenceItems: current.evidenceItems.map((item) =>
        item._key === key ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function addEvidenceItem() {
    if (draft.evidenceItems.length >= LIMITS.maxEvidenceItems) return;
    const next = countersRef.current.evidence;
    countersRef.current.evidence += 1;
    updateDraft((current) => ({
      ...current,
      evidenceItems: [
        ...current.evidenceItems,
        createEvidenceItem(
          `evidence-${next}`,
          `EV-${String(next).padStart(3, "0")}`,
        ),
      ],
    }));
  }

  function removeEvidenceItem(key) {
    updateDraft((current) => ({
      ...current,
      evidenceItems: current.evidenceItems.filter((item) => item._key !== key),
    }));
  }

  function updateEvent(key, field, value) {
    updateDraft((current) => ({
      ...current,
      events: current.events.map((event) =>
        event._key === key ? { ...event, [field]: value } : event,
      ),
    }));
  }

  function addEvent() {
    if (draft.events.length >= LIMITS.maxEvents) return;
    const next = countersRef.current.event;
    countersRef.current.event += 1;
    updateDraft((current) => ({
      ...current,
      events: [
        ...current.events,
        createEvent(
          `event-${next}`,
          `EVENT-${String(next).padStart(3, "0")}`,
          current.evidenceItems[0]?.id.trim() || "",
        ),
      ],
    }));
  }

  function removeEvent(key) {
    updateDraft((current) => ({
      ...current,
      events: current.events.filter((event) => event._key !== key),
    }));
  }

  function moveEvent(index, direction) {
    const destination = index + direction;
    if (destination < 0 || destination >= draft.events.length) return;
    updateDraft((current) => {
      const events = [...current.events];
      [events[index], events[destination]] = [
        events[destination],
        events[index],
      ];
      return { ...current, events };
    });
  }

  function toggleHashChain(checked) {
    invalidatePrepared();
    setIncludeHashChain(checked);
  }

  async function prepareExports() {
    const nextValidation = validateEvidenceChainDraft(draft);
    setValidation(nextValidation);
    setPrepared(null);
    setOperationError("");
    if (!nextValidation.ok) return;

    const token = runTokenRef.current + 1;
    runTokenRef.current = token;
    setBusy(true);

    try {
      let record = buildCanonicalRecord(draft);
      if (includeHashChain) {
        record = await applySha256EventHashChain(record);
      }
      if (runTokenRef.current !== token) return;
      const countsReport = buildCountsOnlyReport(record, nextValidation);
      setPrepared({
        record,
        fullText: `${stableCanonicalStringify(record)}\n`,
        countsReport,
        countsText: `${stableCanonicalStringify(countsReport)}\n`,
      });
    } catch {
      if (runTokenRef.current === token) {
        setOperationError(
          includeHashChain
            ? "The SHA-256 event chain could not be prepared in this browser. Turn off the optional chain or try a current browser."
            : "The canonical exports could not be prepared in this browser.",
        );
      }
    } finally {
      if (runTokenRef.current === token) setBusy(false);
    }
  }

  function reset() {
    runTokenRef.current += 1;
    countersRef.current = { evidence: 2, event: 2 };
    setDraft(initialDraft());
    setIncludeHashChain(true);
    setValidation(null);
    setPrepared(null);
    setBusy(false);
    setOperationError("");
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <GitBranch aria-hidden="true" className="h-4 w-4" />
              Local custody ledger
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Evidence Chain Organizer
            </h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg">
              Record evidence identifiers and digests, organize chronological
              custody events, validate references, and create deterministic JSON
              without sending private handling details anywhere.
            </p>
          </div>
          <div className="shrink-0 rounded-lg border border-border bg-surface-soft px-4 py-3 text-sm">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <LockKeyhole aria-hidden="true" className="h-4 w-4 text-primary" />
              No network · No storage
            </p>
            <p className="mt-1 text-muted-foreground">
              Data remains in this browser tab until export
            </p>
          </div>
        </div>
      </header>

      <section className="mt-6 rounded-xl border border-warning bg-warning-soft p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface text-warning">
            <ShieldAlert aria-hidden="true" className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              An organized record is not independent proof
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground">
              This tool does not sign, notarize, authenticate, verify, or establish
              legal admissibility. A matching digest or event hash chain only helps
              detect changes relative to the recorded values and sequence.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
            <FileKey2 aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Working reference
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              This value is private user data and appears only in the full export.
            </p>
          </div>
        </div>
        <label className="mt-5 block max-w-2xl">
          <FieldLabel optional>Private case or matter reference</FieldLabel>
          <input
            type="text"
            className="input-field min-h-11 w-full"
            maxLength={LIMITS.maxLabelLength}
            value={draft.caseReference}
            disabled={busy}
            onChange={(event) =>
              updateDraft((current) => ({
                ...current,
                caseReference: event.target.value,
              }))
            }
            placeholder="Example: Internal reference 2026-07"
            autoComplete="off"
          />
        </label>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <Fingerprint aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Evidence item registry
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Record existing digests; this organizer does not open or hash
                evidence files.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2"
            onClick={addEvidenceItem}
            disabled={
              busy || draft.evidenceItems.length >= LIMITS.maxEvidenceItems
            }
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add evidence item
          </button>
        </div>

        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Up to {LIMITS.maxEvidenceItems} items. IDs are case-sensitive. Digests
          are normalized to lowercase in the canonical full export.
        </p>

        <div className="mt-5 space-y-4">
          {draft.evidenceItems.map((item, index) => (
            <article
              key={item._key}
              className="rounded-lg border border-border bg-surface-soft p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-foreground">
                  Evidence item {index + 1}
                </h3>
                <button
                  type="button"
                  className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2 text-danger"
                  onClick={() => removeEvidenceItem(item._key)}
                  disabled={busy}
                  aria-label={`Remove evidence item ${index + 1}`}
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  Remove
                </button>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <FieldLabel>Evidence item ID</FieldLabel>
                  <input
                    type="text"
                    className="input-field min-h-11 w-full font-mono"
                    maxLength={LIMITS.maxIdLength}
                    value={item.id}
                    disabled={busy}
                    onChange={(event) =>
                      updateEvidenceItem(item._key, "id", event.target.value)
                    }
                    placeholder="EV-001"
                    autoComplete="off"
                  />
                </label>
                <label className="block">
                  <FieldLabel optional>Private label</FieldLabel>
                  <input
                    type="text"
                    className="input-field min-h-11 w-full"
                    maxLength={LIMITS.maxLabelLength}
                    value={item.label}
                    disabled={busy}
                    onChange={(event) =>
                      updateEvidenceItem(item._key, "label", event.target.value)
                    }
                    placeholder="Example: Working copy of device image"
                    autoComplete="off"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Recorded digest algorithm</FieldLabel>
                  <select
                    className="input-field min-h-11 w-full"
                    value={item.digestAlgorithm}
                    disabled={busy}
                    onChange={(event) =>
                      updateEvidenceItem(
                        item._key,
                        "digestAlgorithm",
                        event.target.value,
                      )
                    }
                  >
                    {DIGEST_ALGORITHMS.map((algorithm) => (
                      <option key={algorithm.value} value={algorithm.value}>
                        {algorithm.value}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <FieldLabel>Recorded hexadecimal digest</FieldLabel>
                  <input
                    type="text"
                    className="input-field min-h-11 w-full font-mono"
                    maxLength={
                      DIGEST_ALGORITHMS.find(
                        (algorithm) =>
                          algorithm.value === item.digestAlgorithm,
                      )?.hexadecimalLength || 128
                    }
                    value={item.digest}
                    disabled={busy}
                    onChange={(event) =>
                      updateEvidenceItem(item._key, "digest", event.target.value)
                    }
                    placeholder={
                      item.digestAlgorithm === "SHA-512"
                        ? "128 hexadecimal characters"
                        : "64 hexadecimal characters"
                    }
                    autoCapitalize="none"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <ListOrdered aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Chronological custody events
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Enter events from earliest to latest. Use the arrow controls to fix
                sequence order without rewriting entries.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2"
            onClick={addEvent}
            disabled={busy || draft.events.length >= LIMITS.maxEvents}
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add custody event
          </button>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-lg border border-info bg-info-soft p-4">
          <Clock3
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-info"
          />
          <p className="text-sm leading-6 text-foreground">
            Timestamps must include <strong>Z</strong> or a numeric UTC offset.
            The exact timestamp and separate timezone label you enter are preserved;
            timezone labels are descriptive user data and are not independently
            verified.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          {draft.events.map((event, index) => (
            <article
              key={event._key}
              className="rounded-lg border border-border bg-surface-soft p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Sequence {index + 1}
                  </p>
                  <h3 className="mt-1 font-semibold text-foreground">
                    {EVENT_TYPES.find((type) => type.value === event.type)
                      ?.label || "Custody event"}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary inline-flex min-h-11 min-w-11 items-center justify-center"
                    onClick={() => moveEvent(index, -1)}
                    disabled={busy || index === 0}
                    aria-label={`Move event ${index + 1} earlier`}
                  >
                    <ChevronUp aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="btn-secondary inline-flex min-h-11 min-w-11 items-center justify-center"
                    onClick={() => moveEvent(index, 1)}
                    disabled={busy || index === draft.events.length - 1}
                    aria-label={`Move event ${index + 1} later`}
                  >
                    <ChevronDown aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2 text-danger"
                    onClick={() => removeEvent(event._key)}
                    disabled={busy}
                    aria-label={`Remove event ${index + 1}`}
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <label className="block">
                  <FieldLabel>Event ID</FieldLabel>
                  <input
                    type="text"
                    className="input-field min-h-11 w-full font-mono"
                    maxLength={LIMITS.maxIdLength}
                    value={event.eventId}
                    disabled={busy}
                    onChange={(changeEvent) =>
                      updateEvent(
                        event._key,
                        "eventId",
                        changeEvent.target.value,
                      )
                    }
                    placeholder="EVENT-001"
                    autoComplete="off"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Evidence item reference</FieldLabel>
                  <select
                    className="input-field min-h-11 w-full font-mono"
                    value={event.evidenceItemId}
                    disabled={busy}
                    onChange={(changeEvent) =>
                      updateEvent(
                        event._key,
                        "evidenceItemId",
                        changeEvent.target.value,
                      )
                    }
                  >
                    <option value="">Choose an evidence ID</option>
                    {evidenceOptions.map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                    {event.evidenceItemId &&
                    !evidenceOptions.includes(event.evidenceItemId) ? (
                      <option value={event.evidenceItemId}>
                        {event.evidenceItemId} (unresolved)
                      </option>
                    ) : null}
                  </select>
                </label>
                <label className="block">
                  <FieldLabel>Event type</FieldLabel>
                  <select
                    className="input-field min-h-11 w-full"
                    value={event.type}
                    disabled={busy}
                    onChange={(changeEvent) =>
                      updateEvent(event._key, "type", changeEvent.target.value)
                    }
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block lg:col-span-2">
                  <FieldLabel>Timestamp with UTC offset</FieldLabel>
                  <input
                    type="text"
                    className="input-field min-h-11 w-full font-mono"
                    maxLength={LIMITS.maxTimestampLength}
                    value={event.timestamp}
                    disabled={busy}
                    onChange={(changeEvent) =>
                      updateEvent(
                        event._key,
                        "timestamp",
                        changeEvent.target.value,
                      )
                    }
                    placeholder="2026-07-24T14:30:00+05:30"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Timezone label</FieldLabel>
                  <input
                    type="text"
                    className="input-field min-h-11 w-full"
                    maxLength={LIMITS.maxTimezoneLength}
                    value={event.timezone}
                    disabled={busy}
                    onChange={(changeEvent) =>
                      updateEvent(
                        event._key,
                        "timezone",
                        changeEvent.target.value,
                      )
                    }
                    placeholder="Asia/Kolkata or UTC"
                    autoComplete="off"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Actor / current handler</FieldLabel>
                  <input
                    type="text"
                    className="input-field min-h-11 w-full"
                    maxLength={LIMITS.maxPersonLength}
                    value={event.actor}
                    disabled={busy}
                    onChange={(changeEvent) =>
                      updateEvent(event._key, "actor", changeEvent.target.value)
                    }
                    placeholder="User-entered name, role, or identifier"
                    autoComplete="off"
                  />
                </label>
                <label className="block">
                  <FieldLabel
                    optional={
                      event.type !== "transfer" && event.type !== "return"
                    }
                  >
                    Recipient
                  </FieldLabel>
                  <input
                    type="text"
                    className="input-field min-h-11 w-full"
                    maxLength={LIMITS.maxPersonLength}
                    value={event.recipient}
                    disabled={busy}
                    onChange={(changeEvent) =>
                      updateEvent(
                        event._key,
                        "recipient",
                        changeEvent.target.value,
                      )
                    }
                    placeholder="Required for transfer and return"
                    autoComplete="off"
                  />
                </label>
                <label className="block">
                  <FieldLabel optional>Location</FieldLabel>
                  <input
                    type="text"
                    className="input-field min-h-11 w-full"
                    maxLength={LIMITS.maxLocationLength}
                    value={event.location}
                    disabled={busy}
                    onChange={(changeEvent) =>
                      updateEvent(
                        event._key,
                        "location",
                        changeEvent.target.value,
                      )
                    }
                    placeholder="User-entered physical or logical location"
                    autoComplete="off"
                  />
                </label>
                <label className="block lg:col-span-3">
                  <FieldLabel optional>Handling note</FieldLabel>
                  <textarea
                    className="input-field min-h-28 w-full resize-y"
                    maxLength={LIMITS.maxNoteLength}
                    value={event.note}
                    disabled={busy}
                    onChange={(changeEvent) =>
                      updateEvent(event._key, "note", changeEvent.target.value)
                    }
                    placeholder="Record observable handling details; avoid unsupported conclusions."
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                <Link2 aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Validate and prepare exports
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Validation checks item and event references, unique IDs, required
                  fields, digest format, acquisition position, and chronological
                  order.
                </p>
              </div>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-soft p-4">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 rounded-sm border-border accent-primary"
                checked={includeHashChain}
                disabled={busy}
                onChange={(event) => toggleHashChain(event.target.checked)}
              />
              <span>
                <span className="block font-semibold text-foreground">
                  Add optional SHA-256 event hash chain
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  Covers canonical event payloads in validated sequence. It does
                  not cover the evidence registry, prove authenticity, or prevent
                  someone from recomputing an edited chain.
                </span>
              </span>
            </label>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary inline-flex min-h-11 items-center justify-center gap-2"
              onClick={() => void prepareExports()}
              disabled={busy}
            >
              {busy ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                />
              ) : (
                <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              )}
              {busy ? "Preparing locally…" : "Validate & prepare"}
            </button>
            <button
              type="button"
              className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2"
              onClick={reset}
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Clear session
            </button>
          </div>
        </div>

        {validation ? (
          <div className="mt-5 space-y-3" aria-live="polite">
            {validation.ok ? (
              <div className="flex items-start gap-3 rounded-lg border border-success bg-success-soft p-4">
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-success"
                />
                <p className="text-sm leading-6 text-foreground">
                  References, required fields, digest formats, and event chronology
                  passed the organizer’s structural checks.
                </p>
              </div>
            ) : null}
            <IssueList issues={validation.errors} tone="danger" />
            <IssueList issues={validation.warnings} tone="warning" />
          </div>
        ) : null}

        {operationError ? (
          <p
            className="mt-5 rounded-lg border border-danger bg-danger-soft p-4 text-sm leading-6 text-foreground"
            role="alert"
          >
            {operationError}
          </p>
        ) : null}
      </section>

      {prepared ? (
        <section
          className="mt-6 rounded-xl border border-success bg-success-soft p-5 shadow-sm sm:p-6"
          aria-labelledby="exports-heading"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 h-6 w-6 shrink-0 text-success"
            />
            <div>
              <h2
                id="exports-heading"
                className="text-2xl font-bold text-foreground"
              >
                Local exports are ready
              </h2>
              <p className="mt-1 text-sm leading-6 text-foreground">
                The private full export contains all entered values. The separate
                counts-only report contains aggregate counts and static limitations
                but no IDs, digests, timestamps, timezones, people, locations,
                notes, or event hashes.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={FileKey2}
              label="Evidence items"
              value={prepared.record.evidenceItems.length}
              detail="Sorted by case-sensitive item ID."
            />
            <MetricCard
              icon={ListOrdered}
              label="Custody events"
              value={prepared.record.events.length}
              detail="Preserved in validated entered order."
            />
            <MetricCard
              icon={AlertTriangle}
              label="Review notes"
              value={validation?.warnings.length || 0}
              detail="Non-blocking chronology observations."
            />
            <MetricCard
              icon={GitBranch}
              label="Event chain"
              value={prepared.record.hashChain.enabled ? "Included" : "Off"}
              detail="Optional SHA-256 change detection."
            />
          </div>

          {prepared.record.hashChain.enabled ? (
            <div className="mt-5 rounded-lg border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Final event hash
              </p>
              <code className="mt-2 block select-all break-all text-xs leading-5 text-foreground">
                {prepared.record.hashChain.finalEventHash}
              </code>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                This value summarizes this event-chain sequence under the documented
                recipe. It is not a signature, trusted timestamp, or external
                verification.
              </p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2"
              onClick={() =>
                downloadJsonText(
                  "private-evidence-chain.canonical.json",
                  prepared.fullText,
                )
              }
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              Download private full export
            </button>
            <button
              type="button"
              className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2"
              onClick={() =>
                downloadJsonText(
                  "evidence-chain-counts-only.json",
                  prepared.countsText,
                )
              }
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              Download counts only
            </button>
          </div>
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-border bg-surface-soft p-5">
          <Users aria-hidden="true" className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold text-foreground">
            People fields are assertions
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Actor and recipient entries are recorded exactly as user data; this
            tool does not verify identity, authority, or consent.
          </p>
        </article>
        <article className="rounded-xl border border-border bg-surface-soft p-5">
          <MapPin aria-hidden="true" className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold text-foreground">
            Locations are not verified
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Physical and logical locations are private descriptive text and are
            not checked against device, network, or geolocation data.
          </p>
        </article>
        <article className="rounded-xl border border-border bg-surface-soft p-5">
          <Info aria-hidden="true" className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold text-foreground">
            Preserve source records separately
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Keep originals and authoritative records under your applicable
            procedures. This browser organizer is only a working record.
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface-soft p-5">
        <div className="flex items-start gap-3">
          <XCircle
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-warning"
          />
          <div>
            <h2 className="font-semibold text-foreground">
              Interpretation limits
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
              {LIMITATIONS.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
