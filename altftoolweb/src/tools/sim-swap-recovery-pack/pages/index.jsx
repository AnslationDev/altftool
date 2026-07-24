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
  KeyRound,
  Landmark,
  ListChecks,
  LockKeyhole,
  MailCheck,
  MonitorSmartphone,
  ShieldAlert,
  Smartphone,
  WalletCards,
} from "lucide-react";

import {
  ACCESSED_DATE,
  ACCOUNT_GROUPS,
  buildCountsOnlyReport,
  buildRecoveryPlan,
  countsOnlyFilename,
  createActionState,
  createSelectionState,
  EVIDENCE_TYPES,
  getRecoverySummary,
  hasRecoverySelections,
  OBSERVED_SYMPTOMS,
  OFFICIAL_SOURCES,
} from "../lib/recoveryPack.mjs";

const DOMAIN_ICONS = {
  carrier: Smartphone,
  "bank-payment": Landmark,
  email: MailCheck,
  "accounts-sessions": MonitorSmartphone,
  evidence: Archive,
};

function SelectionCard({ checked, detail, id, label, onChange }) {
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
        {detail ? (
          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
            {detail}
          </span>
        ) : null}
      </span>
    </label>
  );
}

function MetricCard({ detail, icon: Icon, label, value }) {
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

function RecoveryDomainCard({ domain, actions, onActionChange }) {
  const Icon = DOMAIN_ICONS[domain.id] || ListChecks;

  return (
    <article
      className={`rounded-xl border p-5 shadow-sm sm:p-6 ${
        domain.prioritised
          ? "border-primary bg-primary-soft"
          : "border-border bg-surface"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface text-primary">
            <Icon aria-hidden="true" className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {domain.priorityLabel}
            </p>
            <h3 className="mt-1 text-xl font-bold text-foreground">
              {domain.title}
            </h3>
          </div>
        </div>
        <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground">
          {domain.completedActions} of {domain.totalActions} done
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {domain.description}
      </p>
      <p className="mt-2 text-xs font-semibold text-foreground">
        {domain.triggerCount
          ? `${domain.triggerCount} selected indicator${
              domain.triggerCount === 1 ? "" : "s"
            } relate to this area.`
          : "No selected indicator directly points here; review if it is linked to the affected mobile connection."}
      </p>

      <div className="mt-4 space-y-3">
        {domain.actions.map((action) => (
          <SelectionCard
            key={action.id}
            id={`action-${action.id}`}
            checked={Boolean(actions[action.id])}
            label={action.label}
            onChange={(checked) => onActionChange(action.id, checked)}
          />
        ))}
      </div>
    </article>
  );
}

export default function SimSwapRecoveryPack() {
  const [symptoms, setSymptoms] = useState(() =>
    createSelectionState(OBSERVED_SYMPTOMS),
  );
  const [accounts, setAccounts] = useState(() =>
    createSelectionState(ACCOUNT_GROUPS),
  );
  const [actions, setActions] = useState(createActionState);
  const [evidence, setEvidence] = useState(() =>
    createSelectionState(EVIDENCE_TYPES),
  );
  const [downloaded, setDownloaded] = useState(false);

  const summary = useMemo(
    () => getRecoverySummary({ symptoms, accounts, actions, evidence }),
    [symptoms, accounts, actions, evidence],
  );
  const plan = useMemo(
    () => buildRecoveryPlan(symptoms, accounts, actions),
    [symptoms, accounts, actions],
  );
  const canDownload = useMemo(
    () => hasRecoverySelections({ symptoms, accounts, actions, evidence }),
    [symptoms, accounts, actions, evidence],
  );

  function updateSelection(setter, itemId, checked) {
    setter((current) => ({ ...current, [itemId]: checked }));
    setDownloaded(false);
  }

  function downloadCounts() {
    if (!canDownload) return;
    const createdAt = new Date();
    const report = buildCountsOnlyReport({
      symptoms,
      accounts,
      actions,
      evidence,
      createdAt,
    });
    const objectUrl = URL.createObjectURL(
      new Blob([report], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = countsOnlyFilename(createdAt);
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
              Local recovery organiser
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              SIM Swap Recovery Pack
            </h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg">
              Select what you observed and which account groups may be linked. The
              tool prioritises a recovery checklist without inspecting your SIM,
              accessing accounts, or deciding that a SIM swap occurred.
            </p>
          </div>
          <div className="shrink-0 rounded-lg border border-border bg-surface-soft px-4 py-3 text-sm">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <EyeOff aria-hidden="true" className="h-4 w-4 text-primary" />
              Private by design
            </p>
            <p className="mt-1 text-muted-foreground">
              No lookup · No upload · No stored history
            </p>
          </div>
        </div>
      </header>

      <section className="mt-6 rounded-xl border border-info bg-info-soft p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface text-info">
            <Info aria-hidden="true" className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-info">
              Important first distinction
            </p>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              Sudden service loss is a reason to verify—not proof of a SIM swap.
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground">
              RBI awareness guidance says sustained mobile-network loss in a normal
              environment should be checked with the mobile operator to confirm
              whether an unauthorised duplicate may have been issued. Use only an
              independently sourced official operator channel.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-warning bg-warning-soft p-4">
        <div className="flex items-start gap-3">
          <KeyRound
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-warning"
          />
          <div>
            <p className="font-semibold text-foreground">
              Do not enter sensitive access data
            </p>
            <p className="mt-1 text-sm leading-6 text-foreground">
              This tool has no text fields and never asks for passwords, one-time
              codes, payment secrets, recovery codes, or full account, card, mobile,
              or identity numbers.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={AlertTriangle}
          label="Symptoms selected"
          value={summary.selectedSymptoms}
          detail={`From ${summary.totalSymptoms} observable options; not a diagnosis.`}
        />
        <MetricCard
          icon={WalletCards}
          label="Account groups"
          value={summary.selectedAccounts}
          detail={`From ${summary.totalAccounts} broad categories; no identifiers.`}
        />
        <MetricCard
          icon={ListChecks}
          label="Actions completed"
          value={`${summary.completedActions} of ${summary.totalActions}`}
          detail="Progress marked by you; no action is performed here."
        />
        <MetricCard
          icon={Archive}
          label="Evidence types"
          value={`${summary.preservedEvidence} of ${summary.totalEvidence}`}
          detail="Marked only; evidence never enters the tool."
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <AlertTriangle aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                What did you observe?
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Select only what you personally noticed. Each item can have other
                explanations.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {OBSERVED_SYMPTOMS.map((symptom) => (
              <SelectionCard
                key={symptom.id}
                id={`symptom-${symptom.id}`}
                checked={Boolean(symptoms[symptom.id])}
                label={symptom.label}
                detail={symptom.detail}
                onChange={(checked) =>
                  updateSelection(setSymptoms, symptom.id, checked)
                }
              />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <LockKeyhole aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Which account groups may be linked?
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Select categories only. Do not enter account names, addresses, or
                identifiers.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {ACCOUNT_GROUPS.map((account) => (
              <SelectionCard
                key={account.id}
                id={`account-${account.id}`}
                checked={Boolean(accounts[account.id])}
                label={account.label}
                detail={account.detail}
                onChange={(checked) =>
                  updateSelection(setAccounts, account.id, checked)
                }
              />
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6" aria-labelledby="recovery-order-heading">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <ListChecks aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2
                id="recovery-order-heading"
                className="text-2xl font-bold text-foreground"
              >
                Your prioritised recovery order
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                The tool highlights related domains but never contacts a provider,
                accesses an account, or guarantees recovery. Work from a trusted
                device where possible.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {plan.map((domain) => (
            <RecoveryDomainCard
              key={domain.id}
              domain={domain}
              actions={actions}
              onActionChange={(actionId, checked) =>
                updateSelection(setActions, actionId, checked)
              }
            />
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Archive aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Evidence preserved outside this tool
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Mark evidence types only after saving them somewhere you control.
              Keep originals and their context unchanged.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {EVIDENCE_TYPES.map((item) => (
            <SelectionCard
              key={item.id}
              id={`evidence-${item.id}`}
              checked={Boolean(evidence[item.id])}
              label={item.label}
              onChange={(checked) =>
                updateSelection(setEvidence, item.id, checked)
              }
            />
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                <FileText aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Download counts-only progress
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The text file contains totals and per-domain completion counts. It
                  excludes selected item names, account categories, identifiers,
                  secrets, and evidence contents.
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={downloadCounts}
            disabled={!canDownload}
            className="btn-primary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            Download counts
          </button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
          {downloaded
            ? "Counts-only file created locally."
            : canDownload
              ? "Ready to create locally. No selection details will be included."
              : "Select at least one item to enable the counts-only download."}
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
              Official Indian sources
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Addresses are plain text and are never opened by this tool. Accessed{" "}
              {ACCESSED_DATE}.
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
