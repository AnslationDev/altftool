"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  CATEGORIES,
  CRITICALITIES,
  SAFE_HANDOVER_PCT,
  STATUSES,
  buildHandoverDocument,
  computeHandoverReadiness,
} from "../lib";

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ITEMS = [
  { id: "i1", name: "AWS production console", categoryId: "systems", criticalityId: "critical", statusId: "transferred", successor: "Karan Mehta", note: "Break-glass access sits with the platform team; my IAM user should be disabled on my last day." },
  { id: "i2", name: "Monthly regulatory close", categoryId: "recurring", criticalityId: "critical", statusId: "in-progress", successor: "Karan Mehta", note: "Due on the 7th working day of each month. One dry run still pending." },
  { id: "i3", name: "Vendor: DataCorp feed", categoryId: "contacts", criticalityId: "important", statusId: "not-started", successor: "", note: "Renewal conversation due in November." },
  { id: "i4", name: "Team runbook", categoryId: "documents", criticalityId: "routine", statusId: "transferred", successor: "Karan Mehta", note: "" },
];

const DEFAULTS = {
  employeeName: "Priya Nair",
  designation: "Senior Analyst",
  department: "Risk",
  managerName: "A. Verma",
  successorName: "Karan Mehta",
  documentDate: "2026-09-01",
  lastWorkingDay: "2026-09-15",
  contactAfterExitDays: "15",
  closingNote: "",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [nextId, setNextId] = useState(5);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const updateItem = (id, key, value) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));

  const addItem = () => {
    const id = `i${nextId}`;
    setNextId((value) => value + 1);
    setItems((prev) => [
      ...prev,
      { id, name: "", categoryId: "systems", criticalityId: "important", statusId: "not-started", successor: "", note: "" },
    ]);
  };

  const removeItem = (id) => setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));

  const report = useMemo(
    () =>
      computeHandoverReadiness({
        items,
        todayISO: form.documentDate,
        lastWorkingDayISO: form.lastWorkingDay,
      }),
    [items, form.documentDate, form.lastWorkingDay],
  );

  const doc = useMemo(
    () =>
      buildHandoverDocument({
        employeeName: form.employeeName,
        designation: form.designation,
        department: form.department,
        managerName: form.managerName,
        successorName: form.successorName,
        lastWorkingDayISO: form.lastWorkingDay,
        documentDateISO: form.documentDate,
        contactAfterExitDays: Number(form.contactAfterExitDays),
        closingNote: form.closingNote,
        report,
      }),
    [form, report],
  );

  const error = report.error || doc.error || "";

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setItems(DEFAULT_ITEMS);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Exit documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Employee Handover Document Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List what you own, mark how far each item has got, and get a readiness score weighted by
          criticality — so one undocumented production system cannot hide behind twenty tidy ones.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your exit</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="document-date">Today's date</label>
            <input id="document-date" className={INPUT} type="date" value={form.documentDate} onChange={set("documentDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="last-working-day">Last working day</label>
            <input id="last-working-day" className={INPUT} type="date" value={form.lastWorkingDay} onChange={set("lastWorkingDay")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="employee-name">Your name</label>
            <input id="employee-name" className={INPUT} value={form.employeeName} onChange={set("employeeName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="designation">Designation</label>
            <input id="designation" className={INPUT} value={form.designation} onChange={set("designation")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="department">Department</label>
            <input id="department" className={INPUT} value={form.department} onChange={set("department")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="manager-name">Reporting manager</label>
            <input id="manager-name" className={INPUT} value={form.managerName} onChange={set("managerName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="successor-name">Primary successor</label>
            <input id="successor-name" className={INPUT} value={form.successorName} onChange={set("successorName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="contact-days">Reachable for how many days after exit</label>
            <input id="contact-days" className={INPUT} type="number" inputMode="numeric" min="0" step="1"
              value={form.contactAfterExitDays} onChange={set("contactAfterExitDays")} />
          </div>
        </div>
      </section>

      {error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Handover readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? "—" : `${report.readinessPct}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? "Fix the inputs above." : report.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={GHOST_BTN} aria-label="Copy the readiness summary"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : [
                        `Handover readiness: ${report.readinessPct}%`,
                        `Items: ${report.itemCount} (${report.doneCount} transferred, ${report.openCount} open)`,
                        `Days left: ${report.daysRemaining}`,
                        `Critical still open: ${report.blockers.map((item) => item.name).join("; ") || "none"}`,
                      ].join("\n"),
                  "summary",
                )
              }
            >
              {copied === "summary" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "summary" ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!error && (
          <>
            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]" role="img"
              aria-label={`Handover readiness is ${report.readinessPct} percent`}>
              <span className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, report.readinessPct))}%` }} />
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Items in scope", `${report.itemCount}`],
                ["Fully transferred", `${report.doneCount}`],
                ["Still open", `${report.openCount}`],
                ["Critical items not transferred", `${report.blockers.length}`],
                ["Items with no named owner", `${report.unowned.length}`],
                ["Days left before your last day", `${report.daysRemaining}`],
                ["Open items per remaining day", `${report.itemsPerDay}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {report.blockers.length > 0 && (
              <div role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                <p className="font-semibold">Critical items still open:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {report.blockers.map((item) => (
                    <li key={item.name}>{item.name} — {item.status.label.toLowerCase()}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Area</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Items</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Open</th>
                    <th scope="col" className="py-2 text-right font-semibold">Ready</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byCategory.map((group) => (
                    <tr key={group.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{group.label}</td>
                      <td className="py-2 pr-3 text-right">{group.count}</td>
                      <td className="py-2 pr-3 text-right">{group.open}</td>
                      <td className="py-2 text-right font-semibold">{group.readinessPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Sign-off mark is {SAFE_HANDOVER_PCT}% with no critical item left open. Weights: critical 3,
              important 2, routine 1.
            </p>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">What you are handing over</h2>
          <button type="button" onClick={addItem} className={GHOST_BTN} aria-label="Add a handover item">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add item
          </button>
        </div>
        <div className="mt-4 grid gap-5">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-md border border-[var(--border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Item {index + 1}</p>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove item ${index + 1}`}
                    className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                )}
              </div>
              <div className="mt-3 grid gap-4">
                <div>
                  <label className={LABEL} htmlFor={`name-${item.id}`}>What it is</label>
                  <input id={`name-${item.id}`} className={INPUT} value={item.name}
                    onChange={(event) => updateItem(item.id, "name", event.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={LABEL} htmlFor={`category-${item.id}`}>Area</label>
                    <select id={`category-${item.id}`} className={INPUT} value={item.categoryId}
                      onChange={(event) => updateItem(item.id, "categoryId", event.target.value)}>
                      {CATEGORIES.map((category) => (
                        <option key={category.id} value={category.id}>{category.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL} htmlFor={`criticality-${item.id}`}>Criticality</label>
                    <select id={`criticality-${item.id}`} className={INPUT} value={item.criticalityId}
                      onChange={(event) => updateItem(item.id, "criticalityId", event.target.value)}>
                      {CRITICALITIES.map((level) => (
                        <option key={level.id} value={level.id}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL} htmlFor={`status-${item.id}`}>Status</label>
                    <select id={`status-${item.id}`} className={INPUT} value={item.statusId}
                      onChange={(event) => updateItem(item.id, "statusId", event.target.value)}>
                      {STATUSES.map((status) => (
                        <option key={status.id} value={status.id}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL} htmlFor={`successor-${item.id}`}>Handed to</label>
                    <input id={`successor-${item.id}`} className={INPUT} value={item.successor}
                      onChange={(event) => updateItem(item.id, "successor", event.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={LABEL} htmlFor={`note-${item.id}`}>Note (no passwords)</label>
                  <textarea id={`note-${item.id}`} rows={2} className={AREA} value={item.note}
                    onChange={(event) => updateItem(item.id, "note", event.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Record where a credential lives and who owns it — never the credential itself. Access should
          be re-issued through provisioning, not shared.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Handover document</h2>
          <button type="button" className={PRIMARY_BTN} aria-label="Copy the handover document"
            onClick={() => copy(doc.error ? "" : doc.body, "doc")}>
            {copied === "doc" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied === "doc" ? "Copied!" : "Copy document"}
          </button>
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="closing-note">Closing paragraph (optional)</label>
          <textarea id="closing-note" rows={2} className={AREA} value={form.closingNote} onChange={set("closingNote")}
            placeholder="Leave blank to use a neutral request for sign-off." />
        </div>
        {doc.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {doc.error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">{doc.wordCount} words</p>
            <pre className="mt-3 max-h-[30rem] overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {doc.body}
            </pre>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything you enter stays in your browser. The readiness score is a planning aid, not a
        compliance sign-off — your employer's own exit checklist still governs.
      </p>
    </main>
  );
}
