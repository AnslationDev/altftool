"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Download,
  EyeOff,
  FileText,
  Info,
  ListChecks,
  LockKeyhole,
  NotebookPen,
  PauseCircle,
  ShieldAlert,
} from "lucide-react";

import {
  ACCESSED_DATE,
  buildEvidencePack,
  CHANNEL_OPTIONS,
  createCheckState,
  createEmptyIncident,
  EVIDENCE_TYPES,
  evidencePackFilename,
  getPreparationSummary,
  hasPreparedContent,
  IMMEDIATE_STEPS,
  INCIDENT_FIELDS,
  OFFICIAL_SOURCES,
  TRANSFER_OPTIONS,
} from "../lib/emergencyAssistant.mjs";

const INPUT_CLASS =
  "mt-2 min-h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:shadow-[var(--anslation-ds-focus-ring)]";

function ProgressCard({ icon: Icon, label, value, detail }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div>
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

function CheckboxCard({ checked, detail, id, label, onChange }) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
        checked
          ? "border-primary bg-primary-soft"
          : "border-border bg-background hover:bg-surface-soft"
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded-sm border-border accent-primary focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
      />
      <span>
        <span className="font-semibold text-foreground">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-muted-foreground">
          {detail}
        </span>
      </span>
    </label>
  );
}

function IncidentField({ field, value, onChange }) {
  if (field.type === "select-channel" || field.type === "select-transfer") {
    const options =
      field.type === "select-channel" ? CHANNEL_OPTIONS : TRANSFER_OPTIONS;
    return (
      <label htmlFor={`incident-${field.id}`}>
        <span className="text-sm font-semibold text-foreground">{field.label}</span>
        <select
          id={`incident-${field.id}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={INPUT_CLASS}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.multiline) {
    return (
      <label
        htmlFor={`incident-${field.id}`}
        className={field.fullWidth ? "md:col-span-2" : ""}
      >
        <span className="text-sm font-semibold text-foreground">{field.label}</span>
        <textarea
          id={`incident-${field.id}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={field.maxLength}
          rows={field.fullWidth ? 6 : 4}
          placeholder={field.placeholder}
          className={`${INPUT_CLASS} resize-y`}
        />
      </label>
    );
  }

  return (
    <label htmlFor={`incident-${field.id}`}>
      <span className="text-sm font-semibold text-foreground">{field.label}</span>
      <input
        id={`incident-${field.id}`}
        type={field.type || "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={field.maxLength}
        placeholder={field.placeholder}
        autoComplete="off"
        className={INPUT_CLASS}
      />
    </label>
  );
}

export default function DigitalArrestEmergencyAssistant() {
  const [incident, setIncident] = useState(createEmptyIncident);
  const [steps, setSteps] = useState(() => createCheckState(IMMEDIATE_STEPS));
  const [evidence, setEvidence] = useState(() => createCheckState(EVIDENCE_TYPES));
  const [downloaded, setDownloaded] = useState(false);

  const summary = useMemo(
    () => getPreparationSummary(incident, steps, evidence),
    [incident, steps, evidence],
  );
  const canDownload = useMemo(
    () => hasPreparedContent(incident, steps, evidence),
    [incident, steps, evidence],
  );

  function updateIncident(fieldId, value) {
    setIncident((current) => ({ ...current, [fieldId]: value }));
    setDownloaded(false);
  }

  function updateCheck(setter, itemId, checked) {
    setter((current) => ({ ...current, [itemId]: checked }));
    setDownloaded(false);
  }

  function downloadPack() {
    if (!canDownload) return;
    const createdAt = new Date();
    const text = buildEvidencePack({ incident, steps, evidence, createdAt });
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = evidencePackFilename(createdAt);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
    setDownloaded(true);
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <ShieldAlert aria-hidden="true" className="h-4 w-4" />
              Calm emergency checklist
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Digital Arrest Emergency Assistant
            </h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg">
              Pause, protect your accounts, preserve original evidence, and organise
              incident notes locally. This assistant does not decide whether a caller
              is genuine or fraudulent.
            </p>
          </div>
          <div className="shrink-0 rounded-lg border border-border bg-surface-soft px-4 py-3 text-sm">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <EyeOff aria-hidden="true" className="h-4 w-4 text-primary" />
              No upload · No lookup
            </p>
            <p className="mt-1 text-muted-foreground">
              No calls, link opening, submission, or storage
            </p>
          </div>
        </div>
      </header>

      <section
        className="mt-6 rounded-xl border border-info bg-info-soft p-5 shadow-sm sm:p-6"
        aria-labelledby="official-guidance-heading"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface text-info">
            <Info aria-hidden="true" className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-info">
              Official Government of India guidance
            </p>
            <h2
              id="official-guidance-heading"
              className="mt-1 text-xl font-bold text-foreground"
            >
              Police and government agencies do not carry out a “digital arrest”
              over a phone or video call.
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground">
              I4C states that real law enforcement does not arrest people digitally
              and Indian law has no concept of a digital arrest. An official PMO
              address also states that investigative agencies do not conduct this
              kind of enquiry through a phone call or a video call, and government
              agencies do not demand money in this manner.
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              This does not determine who contacted you. Verify independently and
              preserve what happened.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <ProgressCard
          icon={ListChecks}
          label="Immediate steps"
          value={`${summary.completedSteps} of ${summary.totalSteps}`}
          detail="Marked by you; this is not a safety score."
        />
        <ProgressCard
          icon={Archive}
          label="Evidence types"
          value={`${summary.notedEvidence} of ${summary.totalEvidence}`}
          detail="A manifest only; no evidence is uploaded."
        />
        <ProgressCard
          icon={NotebookPen}
          label="Incident fields"
          value={`${summary.recordedFields} of ${summary.totalFields}`}
          detail="Recorded locally in this browser tab."
        />
      </div>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
            <PauseCircle aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Do these first</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Marking an item only records your progress. It does not verify the
              caller or report the incident.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {IMMEDIATE_STEPS.map((step) => (
            <CheckboxCard
              key={step.id}
              id={`step-${step.id}`}
              checked={Boolean(steps[step.id])}
              label={step.title}
              detail={step.detail}
              onChange={(checked) => updateCheck(setSteps, step.id, checked)}
            />
          ))}
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-lg border border-warning bg-warning-soft p-4">
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-warning"
          />
          <div>
            <p className="font-semibold text-foreground">If there is physical danger</p>
            <p className="mt-1 text-sm leading-6 text-foreground">
              Move to a safer place and seek help through a trusted local channel.
              Do not rely on contact details supplied by the caller.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <Archive aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Evidence preservation
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Mark what you already have. Nothing is uploaded, read, or copied by
                this tool.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {EVIDENCE_TYPES.map((item) => (
              <CheckboxCard
                key={item.id}
                id={`evidence-${item.id}`}
                checked={Boolean(evidence[item.id])}
                label={item.label}
                detail={item.detail}
                onChange={(checked) =>
                  updateCheck(setEvidence, item.id, checked)
                }
              />
            ))}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-lg border border-border bg-surface-soft p-4">
            <LockKeyhole
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            />
            <p className="text-sm leading-6 text-foreground">
              Keep originals untouched. A screenshot or exported note can help with
              review, but it does not replace the original message, file, recording,
              or transaction record.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <FileText aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Local incident notes
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Record observable facts and exact wording. Avoid adding passwords,
                authentication codes, payment secrets, or unnecessary identity data.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {INCIDENT_FIELDS.map((field) => (
              <IncidentField
                key={field.id}
                field={field}
                value={incident[field.id]}
                onChange={(value) => updateIncident(field.id, value)}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground">
              Download the evidence organiser
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Creates a plain-text file in your browser from the notes and boxes
              above. It is not original evidence, an official report, a fraud
              verdict, or legal advice.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadPack}
            disabled={!canDownload}
            className="btn-primary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            Download local notes
          </button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
          {downloaded
            ? "Local text file created. Keep it with—not instead of—the originals."
            : canDownload
              ? "Ready to create locally. No data will be sent."
              : "Mark a checklist item or add an incident detail to enable the download."}
        </p>
      </section>

      <section
        className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6"
        aria-labelledby="sources-heading"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
            <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 id="sources-heading" className="text-2xl font-bold text-foreground">
              Official sources
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Addresses are shown as plain text for transparency. This tool does not
              open them. Accessed {ACCESSED_DATE}.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {OFFICIAL_SOURCES.map((source) => (
            <article
              key={source.url}
              className="min-w-0 rounded-lg border border-border bg-surface-soft p-4"
            >
              <h3 className="font-semibold text-foreground">{source.title}</h3>
              <p className="mt-1 text-xs font-semibold text-primary">
                {source.publisher}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {source.supports}
              </p>
              <code className="mt-3 block select-all break-all text-xs leading-5 text-foreground">
                {source.url}
              </code>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
