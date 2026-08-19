"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitBranch, RotateCcw } from "lucide-react";

import {
  CASE_STYLES,
  EVENT_TYPES,
  MAX_TOPIC_NAME_LENGTH,
  MESSAGE_TYPES,
  SEPARATORS,
  TEMPLATES,
  buildTopicNames,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const RETRY_TIER_OPTIONS = [
  { id: "none", label: "No retry topics", minutes: [] },
  { id: "two", label: "5 min and 30 min", minutes: [5, 30] },
  { id: "three", label: "5 min, 30 min and 2 h", minutes: [5, 30, 120] },
];

const DEFAULTS = {
  templateId: "standard",
  separatorId: "dot",
  caseStyle: "lower",
  env: "prod",
  messageType: "evt",
  domain: "orders",
  entity: "order",
  eventType: "created",
  version: "1",
  retryTierId: "two",
  includeDlq: true,
};

export default function ToolHome() {
  const [templateId, setTemplateId] = useState(DEFAULTS.templateId);
  const [separatorId, setSeparatorId] = useState(DEFAULTS.separatorId);
  const [caseStyle, setCaseStyle] = useState(DEFAULTS.caseStyle);
  const [env, setEnv] = useState(DEFAULTS.env);
  const [messageType, setMessageType] = useState(DEFAULTS.messageType);
  const [domain, setDomain] = useState(DEFAULTS.domain);
  const [entity, setEntity] = useState(DEFAULTS.entity);
  const [eventType, setEventType] = useState(DEFAULTS.eventType);
  const [version, setVersion] = useState(DEFAULTS.version);
  const [retryTierId, setRetryTierId] = useState(DEFAULTS.retryTierId);
  const [includeDlq, setIncludeDlq] = useState(DEFAULTS.includeDlq);
  const [copied, setCopied] = useState(false);

  const retryTiersMinutes = useMemo(
    () => RETRY_TIER_OPTIONS.find((option) => option.id === retryTierId)?.minutes ?? [],
    [retryTierId],
  );

  const result = useMemo(
    () =>
      buildTopicNames({
        templateId,
        separatorId,
        caseStyle,
        env,
        messageType,
        domain,
        entity,
        eventType,
        version,
        retryTiersMinutes,
        includeDlq,
      }),
    [templateId, separatorId, caseStyle, env, messageType, domain, entity, eventType, version, retryTiersMinutes, includeDlq],
  );

  const hasError = Boolean(result.error);
  const dash = "—";
  const activeTemplate = TEMPLATES.find((item) => item.id === templateId);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `# Kafka topic naming — ${result.template.label}`,
      "",
      ...result.allNames,
      "",
      `Consumer group: ${result.consumerGroup}`,
      `ACL prefix: ${result.aclPrefix}`,
      `Length: ${result.length} / ${MAX_TOPIC_NAME_LENGTH} characters`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTemplateId(DEFAULTS.templateId);
    setSeparatorId(DEFAULTS.separatorId);
    setCaseStyle(DEFAULTS.caseStyle);
    setEnv(DEFAULTS.env);
    setMessageType(DEFAULTS.messageType);
    setDomain(DEFAULTS.domain);
    setEntity(DEFAULTS.entity);
    setEventType(DEFAULTS.eventType);
    setVersion(DEFAULTS.version);
    setRetryTierId(DEFAULTS.retryTierId);
    setIncludeDlq(DEFAULTS.includeDlq);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GitBranch className="h-4 w-4" aria-hidden="true" />
          Messaging
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Kafka Topic Naming Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compose a topic name from message type, domain, entity, event and schema version — then check
          it against Kafka&apos;s real rules: 249 characters, legal charset, and the dot-versus-underscore
          collision the broker rejects.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kt-template">
              Naming template
            </label>
            <select
              id="kt-template"
              className={`mt-2 ${INPUT_CLASS}`}
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
            >
              {TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
            {activeTemplate && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{activeTemplate.note}</p>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kt-separator">
              Separator
            </label>
            <select
              id="kt-separator"
              className={`mt-2 ${INPUT_CLASS}`}
              value={separatorId}
              onChange={(event) => setSeparatorId(event.target.value)}
            >
              {SEPARATORS.map((separator) => (
                <option key={separator.id} value={separator.id}>
                  {separator.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kt-case">
              Case
            </label>
            <select
              id="kt-case"
              className={`mt-2 ${INPUT_CLASS}`}
              value={caseStyle}
              onChange={(event) => setCaseStyle(event.target.value)}
            >
              {CASE_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kt-env">
              Environment
            </label>
            <input
              id="kt-env"
              className={`mt-2 ${INPUT_CLASS}`}
              value={env}
              onChange={(event) => setEnv(event.target.value)}
              disabled={!activeTemplate?.tokens.includes("env")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kt-messagetype">
              Message type
            </label>
            <select
              id="kt-messagetype"
              className={`mt-2 ${INPUT_CLASS}`}
              value={messageType}
              onChange={(event) => setMessageType(event.target.value)}
              disabled={!activeTemplate?.tokens.includes("messageType")}
            >
              {MESSAGE_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kt-domain">
              Domain (bounded context)
            </label>
            <input
              id="kt-domain"
              className={`mt-2 ${INPUT_CLASS}`}
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kt-entity">
              Entity
            </label>
            <input
              id="kt-entity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={entity}
              onChange={(event) => setEntity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kt-eventtype">
              Event type
            </label>
            <input
              id="kt-eventtype"
              list="kt-eventtype-options"
              className={`mt-2 ${INPUT_CLASS}`}
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
              disabled={!activeTemplate?.tokens.includes("eventType")}
            />
            <datalist id="kt-eventtype-options">
              {EVENT_TYPES.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kt-version">
              Schema version
            </label>
            <input
              id="kt-version"
              className={`mt-2 ${INPUT_CLASS}`}
              value={version}
              onChange={(event) => setVersion(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kt-retry">
              Retry topics
            </label>
            <select
              id="kt-retry"
              className={`mt-2 ${INPUT_CLASS}`}
              value={retryTierId}
              onChange={(event) => setRetryTierId(event.target.value)}
            >
              {RETRY_TIER_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex min-h-11 items-center gap-3 self-end text-sm font-semibold" htmlFor="kt-dlq">
            <input
              id="kt-dlq"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={includeDlq}
              onChange={(event) => setIncludeDlq(event.target.checked)}
            />
            Add a dead-letter topic
          </label>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Topic name
            </p>
            <p className="mt-1 break-all text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? dash : result.topic}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fill in the segments above to build a name."
                : `${result.length} of ${MAX_TOPIC_NAME_LENGTH} characters, ${result.remaining} to spare`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated topic names"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy names"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Segments", hasError ? dash : String(result.segments.length)],
            ["Separator", hasError ? dash : result.separator.label.split("  ")[0]],
            ["Suggested retention", hasError ? dash : result.messageTypeInfo?.retention || "Set per message type"],
            ["Consumer group", hasError ? dash : result.consumerGroup],
            ["ACL prefix", hasError ? dash : result.aclPrefix],
            ["Metric-namespace key", hasError ? dash : result.collisionKey],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-all text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.validation.valid && (
          <div
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            <ul className="list-disc space-y-1 pl-4">
              {result.validation.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {!hasError && result.validation.valid && result.companionIssues.length === 0 && (
          <p className="mt-4 text-sm font-semibold text-[var(--success)]">
            Legal on any Kafka broker: charset, length and collision checks all pass.
          </p>
        )}

        {!hasError && result.validation.valid && result.companionIssues.length > 0 && (
          <div
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            The main topic name is legal, but {result.companionIssues.length === 1 ? "a companion topic" : "companion topics"} below
            {" "}
            {result.companionIssues.length === 1 ? "is" : "are"} not — see the issues listed under each one.
          </div>
        )}
      </section>

      {!hasError && result.companions.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
          <h2 className="text-base font-semibold">Companion topics</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Role</th>
                  <th scope="col" className="py-2 font-semibold">Topic</th>
                </tr>
              </thead>
              <tbody>
                {result.companions.map((companion) => {
                  const issue = result.companionIssues.find((item) => item.name === companion.name);
                  return (
                    <tr key={companion.name} className="border-b border-[var(--border)] last:border-0 align-top">
                      <td className="py-2 pr-3 font-semibold">{companion.role}</td>
                      <td className="py-2">
                        <span className="break-all font-mono text-xs">{companion.name}</span>
                        <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{companion.why}</span>
                        {issue && (
                          <ul
                            role="alert"
                            className="mt-2 list-disc space-y-1 rounded-md bg-[var(--danger-soft)] px-3 py-2 pl-6 text-xs font-medium text-[var(--danger)]"
                          >
                            {issue.issues.map((message) => (
                              <li key={message}>{message}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Kafka accepts a lot of names it will later make you regret. Agree one template per cluster, put
        it in a lint rule on topic creation, and only change it behind a version bump.
      </p>
    </main>
  );
}
