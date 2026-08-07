"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, ClipboardList, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEEMED_SERVICE_STATUTE,
  DISPATCH_MODES,
  NOTICE_STATUSES,
  NOTICE_TYPES,
  addDays,
  formatShortDate,
  parseISODate,
  toISODate,
  trackNotices,
} from "../lib";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const SELECT = INPUT;
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const HINT = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ICON_BTN =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_PILL = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  primary: "bg-[var(--muted)] text-[var(--primary)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
};

const TONE_TEXT = {
  danger: "text-[var(--danger)]",
  warning: "text-[var(--warning)]",
  primary: "text-[var(--primary)]",
  success: "text-[var(--success)]",
};

const STATUS_META = {
  "not-dispatched": { label: "Not dispatched yet", tone: "primary" },
  "in-transit": { label: "In transit", tone: "primary" },
  "awaiting-reply": { label: "Awaiting reply", tone: "warning" },
  overdue: { label: "Reply overdue", tone: "danger" },
  replied: { label: "Reply received", tone: "success" },
  settled: { label: "Settled / withdrawn", tone: "success" },
  filed: { label: "Case filed", tone: "primary" },
};

function todayIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    .toISOString()
    .slice(0, 10);
}

/** Shift an ISO date string by whole days, staying in ISO string form. */
function shiftIso(iso, days) {
  const date = parseISODate(iso);
  if (!date) return "";
  return toISODate(addDays(date, days));
}

function buildDefaults() {
  const base = todayIso();
  return {
    today: base,
    notices: [
      {
        id: "n1",
        recipient: "Deficient Retailer Pvt Ltd",
        noticeType: "consumer",
        mode: "registered-ad",
        dispatchDate: shiftIso(base, -6),
        deliveryDate: "",
        causeOfActionDate: shiftIso(base, -400),
        trackingId: "RA123456789IN",
        replyDays: "",
        status: "auto",
      },
      {
        id: "n2",
        recipient: "Rohit Malhotra (cheque no. 004521)",
        noticeType: "cheque",
        mode: "speed-post",
        dispatchDate: shiftIso(base, -20),
        deliveryDate: shiftIso(base, -16),
        causeOfActionDate: "",
        trackingId: "EE998877665IN",
        replyDays: "",
        status: "auto",
      },
      {
        id: "n3",
        recipient: "Office of the Municipal Commissioner",
        noticeType: "government",
        mode: "registered-ad",
        dispatchDate: shiftIso(base, -70),
        deliveryDate: shiftIso(base, -63),
        causeOfActionDate: "",
        trackingId: "",
        replyDays: "",
        status: "auto",
      },
    ],
  };
}

const countdownText = (days) => {
  if (!Number.isFinite(days)) return DASH;
  if (days === 0) return "Due today";
  if (days < 0) return `${NUM.format(-days)} day${days === -1 ? "" : "s"} overdue`;
  return `${NUM.format(days)} day${days === 1 ? "" : "s"} left`;
};

export default function ToolHome() {
  const [state, setState] = useState(buildDefaults);
  const [copied, setCopied] = useState(false);
  const [seq, setSeq] = useState(0);

  const result = useMemo(
    () =>
      trackNotices({
        today: state.today,
        notices: state.notices.map((n) => ({
          ...n,
          replyDays: n.replyDays === "" || n.replyDays === undefined ? undefined : Number(n.replyDays),
        })),
      }),
    [state.today, state.notices],
  );

  const ok = !result.error;

  const setField = (key) => (event) =>
    setState((prev) => ({ ...prev, [key]: event.target.value }));

  const setItem = (id, key) => (event) => {
    const value = event.target.value;
    setState((prev) => ({
      ...prev,
      notices: prev.notices.map((n) => (n.id === id ? { ...n, [key]: value } : n)),
    }));
  };

  const addRow = () => {
    const nextId = `new-${seq}`;
    setSeq((n) => n + 1);
    setState((prev) => ({
      ...prev,
      notices: [
        ...prev.notices,
        {
          id: nextId,
          recipient: "",
          noticeType: "general",
          mode: "registered-ad",
          dispatchDate: prev.today,
          deliveryDate: "",
          causeOfActionDate: "",
          trackingId: "",
          replyDays: "",
          status: "auto",
        },
      ],
    }));
  };

  const removeRow = (id) =>
    setState((prev) => ({ ...prev, notices: prev.notices.filter((n) => n.id !== id) }));

  const reset = () => {
    setState(buildDefaults());
    setCopied(false);
  };

  const summary =
    ok && !result.empty
      ? [
          `Legal notice dispatch board as at ${formatShortDate(state.today)}`,
          `${result.total} tracked | ${result.overdueCount} overdue | ${result.openCount} open | ${result.issueCount} issue(s) flagged`,
          "",
          ...result.rows.map((row) => {
            if (row.error) return `${row.recipient} — ${row.error}`;
            const lines = [
              `${row.recipient} — ${row.type.label} via ${row.mode.label}`,
              `  Dispatched ${row.dispatchDate}; served ${row.servedOn} (${row.servedBasis === "actual" ? "actual delivery" : "assumed transit"})`,
              `  Reply deadline ${row.replyDeadline} — ${countdownText(row.daysToDeadline)} — status: ${STATUS_META[row.status]?.label ?? row.status}`,
            ];
            if (row.complaintWindow) {
              lines.push(
                `  Complaint window ${row.complaintWindow.opens} to ${row.complaintWindow.closes}`,
              );
            }
            if (row.limitation) {
              lines.push(
                `  Limitation expires ${row.limitation.expires} (${row.limitation.daysLeft} days left, anchored on ${row.limitation.anchorBasis === "cause-of-action" ? "cause of action" : "dispatch date fallback"})`,
              );
            }
            if (row.issues.length) {
              lines.push(...row.issues.map((issue) => `  ⚠ ${issue}`));
            }
            return lines.join("\n");
          }),
        ].join("\n")
      : "";

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

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Legal utilities
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Legal Notice Dispatch Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log each notice&apos;s dispatch mode, tracking ID and dates. The board works out the date
          of service, the reply deadline, the s.138 complaint window and the consumer-limitation
          countdown for you — using {DEEMED_SERVICE_STATUTE} to estimate service when no delivery
          date is on record yet.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL} htmlFor="lndt-today">
          Count from (today)
        </label>
        <input
          id="lndt-today"
          className={`${INPUT} max-w-xs`}
          type="date"
          value={state.today}
          onChange={setField("today")}
        />
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Notices</h2>
          <button type="button" className={GHOST_BTN} onClick={addRow}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add notice
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {state.notices.map((notice, index) => {
            const type = NOTICE_TYPES.find((t) => t.id === notice.noticeType) || NOTICE_TYPES[0];
            const mode = DISPATCH_MODES.find((m) => m.id === notice.mode) || DISPATCH_MODES[0];
            return (
              <div
                key={notice.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={LABEL} htmlFor={`lndt-recipient-${notice.id}`}>
                      Notice {index + 1} — recipient
                    </label>
                    <input
                      id={`lndt-recipient-${notice.id}`}
                      className={INPUT}
                      type="text"
                      placeholder="Who the notice was sent to"
                      value={notice.recipient}
                      onChange={setItem(notice.id, "recipient")}
                    />
                  </div>

                  <div>
                    <label className={LABEL} htmlFor={`lndt-type-${notice.id}`}>
                      Notice type
                    </label>
                    <select
                      id={`lndt-type-${notice.id}`}
                      className={SELECT}
                      value={notice.noticeType}
                      onChange={setItem(notice.id, "noticeType")}
                    >
                      {NOTICE_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    {type.note ? <p className={HINT}>{type.note}</p> : null}
                  </div>

                  <div>
                    <label className={LABEL} htmlFor={`lndt-mode-${notice.id}`}>
                      Dispatch mode
                    </label>
                    <select
                      id={`lndt-mode-${notice.id}`}
                      className={SELECT}
                      value={notice.mode}
                      onChange={setItem(notice.id, "mode")}
                    >
                      {DISPATCH_MODES.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <p className={HINT}>
                      Proof: {mode.proof}
                      {mode.assumedTransitDays > 0
                        ? ` — assumed ${mode.assumedTransitDays}-day transit if no delivery date is entered.`
                        : " — treated as served same day unless a delivery date says otherwise."}
                    </p>
                  </div>

                  <div>
                    <label className={LABEL} htmlFor={`lndt-tracking-${notice.id}`}>
                      Tracking / receipt ID (optional)
                    </label>
                    <input
                      id={`lndt-tracking-${notice.id}`}
                      className={INPUT}
                      type="text"
                      placeholder="e.g. RA123456789IN"
                      value={notice.trackingId}
                      onChange={setItem(notice.id, "trackingId")}
                    />
                  </div>

                  <div>
                    <label className={LABEL} htmlFor={`lndt-dispatch-${notice.id}`}>
                      Dispatch date
                    </label>
                    <input
                      id={`lndt-dispatch-${notice.id}`}
                      className={INPUT}
                      type="date"
                      value={notice.dispatchDate}
                      onChange={setItem(notice.id, "dispatchDate")}
                    />
                  </div>

                  <div>
                    <label className={LABEL} htmlFor={`lndt-delivery-${notice.id}`}>
                      Delivery date (optional — overrides the assumed transit)
                    </label>
                    <input
                      id={`lndt-delivery-${notice.id}`}
                      className={INPUT}
                      type="date"
                      value={notice.deliveryDate}
                      onChange={setItem(notice.id, "deliveryDate")}
                    />
                  </div>

                  <div>
                    <label className={LABEL} htmlFor={`lndt-replydays-${notice.id}`}>
                      Reply period (days)
                    </label>
                    <input
                      id={`lndt-replydays-${notice.id}`}
                      className={INPUT}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      placeholder={String(type.defaultReplyDays)}
                      value={notice.replyDays}
                      onChange={setItem(notice.id, "replyDays")}
                      disabled={type.fixedReplyDays}
                    />
                    <p className={HINT}>
                      {type.fixedReplyDays
                        ? `Fixed by statute at ${type.defaultReplyDays} days (${type.statute}).`
                        : `Leave blank to use the customary ${type.defaultReplyDays} days.`}
                    </p>
                  </div>

                  {type.id === "consumer" ? (
                    <div>
                      <label className={LABEL} htmlFor={`lndt-cause-${notice.id}`}>
                        Cause-of-action date (optional)
                      </label>
                      <input
                        id={`lndt-cause-${notice.id}`}
                        className={INPUT}
                        type="date"
                        value={notice.causeOfActionDate}
                        onChange={setItem(notice.id, "causeOfActionDate")}
                      />
                      <p className={HINT}>
                        The two-year limitation runs from this date under Section 69 of the
                        Consumer Protection Act, 2019. Leave blank only if you do not know it yet —
                        the board will fall back to the dispatch date, which understates elapsed
                        time.
                      </p>
                    </div>
                  ) : null}

                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className={LABEL} htmlFor={`lndt-status-${notice.id}`}>
                        Status
                      </label>
                      <select
                        id={`lndt-status-${notice.id}`}
                        className={SELECT}
                        value={notice.status}
                        onChange={setItem(notice.id, "status")}
                      >
                        {NOTICE_STATUSES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      className={ICON_BTN}
                      onClick={() => removeRow(notice.id)}
                      aria-label={`Remove ${notice.recipient || `notice ${index + 1}`}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Board summary
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok && !result.empty ? NUM.format(result.total) : "0"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok && !result.empty
                ? `${NUM.format(result.overdueCount)} overdue, ${NUM.format(result.openCount)} still open, ${NUM.format(result.issueCount)} issue(s) flagged.`
                : "Add a notice above to build the board."}
            </p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the notice dispatch board"
            className={GHOST_BTN}
            disabled={!ok || result.empty}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy board"}
          </button>
        </div>

        {ok && result.nextDeadline ? (
          <p className="mt-4 text-sm">
            Next reply deadline: <span className="font-semibold">{result.nextDeadline.recipient}</span> —{" "}
            {formatShortDate(result.nextDeadline.replyDeadline)} (
            {countdownText(result.nextDeadline.daysToDeadline)})
          </p>
        ) : null}
      </section>

      {ok && !result.empty ? (
        <section className="mt-6 grid gap-4">
          {result.rows.map((row) => (
            <div
              key={row.id}
              className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            >
              {row.error ? (
                <p className="text-sm font-medium text-[var(--danger)]">
                  {row.recipient}: {row.error}
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold">{row.recipient}</h3>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {row.type.label} · via {row.mode.label}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${TONE_PILL[STATUS_META[row.status]?.tone ?? "primary"]}`}
                    >
                      {STATUS_META[row.status]?.label ?? row.status}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-[var(--muted-foreground)]">Dispatched</dt>
                      <dd className="font-semibold">{formatShortDate(row.dispatchDate)}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted-foreground)]">
                        Served ({row.servedBasis === "actual" ? "actual delivery" : "assumed transit"})
                      </dt>
                      <dd className="font-semibold">{formatShortDate(row.servedOn)}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted-foreground)]">Reply deadline</dt>
                      <dd
                        className={`font-semibold ${row.daysToDeadline < 0 ? TONE_TEXT.danger : ""}`}
                      >
                        {formatShortDate(row.replyDeadline)} ({countdownText(row.daysToDeadline)})
                      </dd>
                    </div>
                    {row.complaintWindow ? (
                      <div>
                        <dt className="text-[var(--muted-foreground)]">Complaint window</dt>
                        <dd className="font-semibold">
                          {formatShortDate(row.complaintWindow.opens)} –{" "}
                          {formatShortDate(row.complaintWindow.closes)}
                        </dd>
                      </div>
                    ) : null}
                    {row.limitation ? (
                      <div>
                        <dt className="text-[var(--muted-foreground)]">Limitation expires</dt>
                        <dd className="font-semibold">
                          {formatShortDate(row.limitation.expires)} ({countdownText(row.limitation.daysLeft)},{" "}
                          {row.limitation.anchorBasis === "cause-of-action"
                            ? "from cause of action"
                            : "estimated from dispatch date"}
                          )
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  {row.issues.length > 0 ? (
                    <ul className="mt-4 space-y-1.5">
                      {row.issues.map((issue) => (
                        <li
                          key={issue}
                          className="flex items-start gap-2 text-xs text-[var(--warning)]"
                        >
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              )}
            </div>
          ))}
        </section>
      ) : null}

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={reset} aria-label="Reset the board to the sample notices" className={PRIMARY_BTN}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This is a scheduling aid, not legal advice. Deemed-service assumptions, statutory periods
        and limitation dates depend on facts a lawyer should confirm — the date a delivery record
        actually shows always overrides the estimate here.
      </p>
    </main>
  );
}
