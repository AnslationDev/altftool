"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle,
  Clipboard,
  Copy,
  Download,
  FileText,
  IndianRupee,
  Languages,
  Landmark,
  ListChecks,
  Mail,
  MapPin,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

const TODAY = new Date().toISOString().slice(0, 10);

const TEMPLATES = {
  general: {
    label: "General Information Request",
    subject: "Request for information under the Right to Information Act, 2005",
    points: [
      "Certified copy of records related to the above subject.",
      "Current status, action taken, and file movement details.",
      "Names/designations of officers responsible for processing the matter.",
    ],
    note: "Best for broad government information requests.",
  },
  documents: {
    label: "Certified Document Copy",
    subject: "Request for certified copies of public records under RTI Act, 2005",
    points: [
      "Certified copies of all documents, notesheets, orders, correspondence, and enclosures related to the subject.",
      "Page-wise list of records available in the concerned file.",
      "Details of any records withheld, if applicable, with reasons.",
    ],
    note: "Use when the main goal is copies of official documents.",
  },
  status: {
    label: "Application / Complaint Status",
    subject: "Request for status and action taken report under RTI Act, 2005",
    points: [
      "Present status of my application/complaint/reference number.",
      "Date-wise action taken report from receipt till date.",
      "Expected timeline for final disposal and responsible office/section.",
    ],
    note: "Useful for tracking pending applications, complaints, or services.",
  },
  funds: {
    label: "Scheme / Funds Details",
    subject: "Request for scheme, expenditure, and beneficiary details under RTI Act, 2005",
    points: [
      "Scheme-wise funds sanctioned, released, and utilized for the stated period.",
      "List of beneficiaries, works, vendors, or agencies involved, wherever publicly disclosable.",
      "Certified copies of utilization certificates, bills, approvals, and inspection reports.",
    ],
    note: "For civic, public spending, and scheme transparency requests.",
  },
};

const DELIVERY_OPTIONS = ["Email", "Postal copy", "Inspection", "Certified copies", "Any available mode"];
const FEE_OPTIONS = ["IPO", "Court fee stamp", "Demand draft", "Online payment", "BPL exemption", "As prescribed"];
const LANGUAGE_OPTIONS = ["English", "Hindi", "Simple English"];

function splitPoints(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function sentenceCase(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function buildDraft(values, points) {
  const feeLine = values.isBpl
    ? "I state that I fall under the Below Poverty Line category and request fee exemption as per applicable rules. Relevant proof can be attached wherever required."
    : `I am enclosing/paying the prescribed RTI application fee through ${values.feeMode}. If any additional copying charges are required, kindly inform me as per the applicable rules.`;

  const applicantContact = [values.phone ? `Phone: ${values.phone}` : "", values.email ? `Email: ${values.email}` : ""].filter(Boolean).join(" | ");
  const infoPoints = points.length
    ? points.map((point, index) => `${index + 1}. ${sentenceCase(point)}`).join("\n")
    : "1. [Write the exact information required]";

  if (values.language === "Hindi") {
    return [
      `दिनांक: ${formatDate(values.date) || "[Date]"}`,
      `स्थान: ${values.place || "[Place]"}`,
      "",
      "सेवा में,",
      `लोक सूचना अधिकारी (PIO),`,
      values.department || "[Department / Public Authority]",
      values.authorityAddress || "[Office Address]",
      "",
      `विषय: ${values.subject || "सूचना का अधिकार अधिनियम, 2005 के अंतर्गत सूचना प्राप्त करने हेतु आवेदन"}`,
      "",
      "महोदय/महोदया,",
      "",
      `मैं, ${values.applicantName || "[Applicant Name]"}, निवासी ${values.applicantAddress || "[Applicant Address]"}, सूचना का अधिकार अधिनियम, 2005 के अंतर्गत निम्न सूचना प्राप्त करना चाहता/चाहती हूँ:`,
      "",
      infoPoints,
      "",
      values.period ? `सूचना की अवधि: ${values.period}` : "सूचना की अवधि: [Mention relevant period if applicable]",
      `वांछित माध्यम: ${values.deliveryMode}`,
      "",
      feeLine,
      "",
      "यदि मांगी गई सूचना आपके कार्यालय से संबंधित नहीं है, तो कृपया आवेदन को संबंधित लोक प्राधिकारी को नियमानुसार अग्रेषित करने की कृपा करें।",
      "",
      "भवदीय,",
      values.applicantName || "[Applicant Name]",
      applicantContact,
      values.applicantAddress || "[Applicant Address]",
    ].join("\n");
  }

  const opener =
    values.language === "Simple English"
      ? `I, ${values.applicantName || "[Applicant Name]"}, request the following information under the Right to Information Act, 2005.`
      : `I, ${values.applicantName || "[Applicant Name]"}, resident of ${values.applicantAddress || "[Applicant Address]"}, hereby request the following information under the Right to Information Act, 2005:`;

  return [
    `Date: ${formatDate(values.date) || "[Date]"}`,
    `Place: ${values.place || "[Place]"}`,
    "",
    "To,",
    "The Public Information Officer (PIO),",
    values.department || "[Department / Public Authority]",
    values.authorityAddress || "[Office Address]",
    "",
    `Subject: ${values.subject || "Request for information under the Right to Information Act, 2005"}`,
    "",
    "Sir/Madam,",
    "",
    opener,
    "",
    "Information requested:",
    infoPoints,
    "",
    values.period ? `Period concerned: ${values.period}` : "Period concerned: [Mention relevant period if applicable]",
    `Preferred mode of receiving information: ${values.deliveryMode}`,
    "",
    feeLine,
    "",
    "If the requested information is held by another public authority, kindly transfer the application to the concerned authority as per applicable RTI provisions.",
    "",
    "Yours faithfully,",
    values.applicantName || "[Applicant Name]",
    applicantContact,
    values.applicantAddress || "[Applicant Address]",
  ].join("\n");
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-amber-500/10 text-amber-600"
        : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <article className="tool-card min-w-0 overflow-hidden !p-4 sm:!p-5 xl:!p-6">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 ${toneClass}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        <div className="min-w-0">
          <p className="break-words text-[0.68rem] font-bold uppercase tracking-wide text-[var(--muted-foreground)] sm:text-xs">{label}</p>
          <p className="mt-1 break-words text-xl font-black leading-tight text-[var(--foreground)] sm:text-2xl xl:text-3xl">{value}</p>
          {detail ? <p className="mt-2 hidden break-words text-sm text-[var(--muted-foreground)] sm:block">{detail}</p> : null}
        </div>
      </div>
    </article>
  );
}

function Field({ label, value, onChange, placeholder, textarea = false, rows = 4 }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full min-w-0 resize-y rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-medium text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
        />
      )}
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
      >
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          return (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
          );
        })}
      </select>
    </label>
  );
}

export default function RtiDraftTemplateBuilder() {
  const [values, setValues] = useState({
    template: "general",
    applicantName: "Saurabh Tiwari",
    applicantAddress: "House no. 21, Civil Lines, Jaunpur, Uttar Pradesh",
    phone: "9876543210",
    email: "applicant@example.com",
    department: "Public Information Officer, Municipal Office",
    authorityAddress: "Municipal Office, District Headquarters",
    subject: TEMPLATES.general.subject,
    period: "01 Apr 2025 to 31 Mar 2026",
    points: TEMPLATES.general.points.join("\n"),
    deliveryMode: "Email",
    feeMode: "IPO",
    language: "English",
    isBpl: false,
    date: TODAY,
    place: "Jaunpur",
  });

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const applyTemplate = (key) => {
    const template = TEMPLATES[key];
    setValues((current) => ({
      ...current,
      template: key,
      subject: template.subject,
      points: template.points.join("\n"),
    }));
  };

  const points = useMemo(() => splitPoints(values.points), [values.points]);
  const draft = useMemo(() => buildDraft(values, points), [values, points]);
  const checks = useMemo(() => {
    const items = [
      { label: "Applicant name", done: Boolean(values.applicantName.trim()) },
      { label: "Applicant address", done: Boolean(values.applicantAddress.trim()) },
      { label: "PIO / department", done: Boolean(values.department.trim()) },
      { label: "Office address", done: Boolean(values.authorityAddress.trim()) },
      { label: "Subject", done: Boolean(values.subject.trim()) },
      { label: "Information points", done: points.length > 0 },
      { label: "Date and place", done: Boolean(values.date && values.place.trim()) },
      { label: "Fee / BPL mode", done: Boolean(values.isBpl || values.feeMode) },
    ];
    const done = items.filter((item) => item.done).length;
    return { items, done, total: items.length, score: Math.round((done / items.length) * 100) };
  }, [points.length, values]);

  const wordCount = useMemo(() => draft.trim().split(/\s+/).filter(Boolean).length, [draft]);

  const copyDraft = async () => {
    if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(draft);
  };

  return (
    <main className="mx-auto w-full max-w-[1360px] px-4 pb-12 pt-8 text-[var(--foreground)] sm:px-6 sm:pt-10 lg:px-8">
      <header className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,var(--section-highlight),var(--background)_52%,rgba(59,130,246,0.08))] p-5 text-center shadow-sm sm:p-7 xl:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <Sparkles className="h-4 w-4 shrink-0" />
              Civic drafting assistant
            </span>
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-600">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Browser-side draft
            </span>
          </div>
          <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">RTI Draft Template Builder</h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
            Build a clean RTI application draft with applicant details, public authority address, exact information points, fee mode, readiness checklist, copy, and TXT export.
          </p>
        </div>

        <section className="mx-auto mt-5 grid w-full max-w-6xl grid-cols-2 gap-3 sm:mt-8 lg:grid-cols-4 xl:gap-5">
          <MetricCard icon={ListChecks} label="Info Points" value={points.length} detail="Clear numbered questions in your draft." />
          <MetricCard icon={CheckCircle} label="Ready Score" value={`${checks.score}%`} detail={`${checks.done}/${checks.total} checklist items complete.`} tone={checks.score >= 80 ? "good" : "warn"} />
          <MetricCard icon={FileText} label="Words" value={wordCount} detail="Approximate draft length." />
          <MetricCard icon={Languages} label="Language" value={values.language} detail="Draft output language mode." />
        </section>
      </header>

      <div className="mt-6 grid min-w-0 gap-6 sm:mt-10 xl:gap-8 xl:grid-cols-[minmax(420px,0.9fr)_minmax(0,1.1fr)] xl:items-start">
        <div className="contents xl:grid xl:min-w-0 xl:content-start xl:gap-6">
          <section className="tool-card order-1 min-w-0 overflow-hidden xl:p-6 xl:order-none">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Landmark className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Draft Setup</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{TEMPLATES[values.template].note}</p>
              </div>
            </div>

            <div className="grid min-w-0 gap-4">
              <SelectField
                label="RTI template"
                value={values.template}
                onChange={applyTemplate}
                options={Object.entries(TEMPLATES).map(([value, item]) => ({ value, label: item.label }))}
              />
              <Field label="Subject" value={values.subject} onChange={(value) => update("subject", value)} placeholder="Request for information..." />
              <Field label="Information points" value={values.points} onChange={(value) => update("points", value)} textarea rows={7} placeholder="Write each information point on a new line" />
              <div className="grid min-w-0 gap-4 md:grid-cols-2">
                <SelectField label="Delivery mode" value={values.deliveryMode} onChange={(value) => update("deliveryMode", value)} options={DELIVERY_OPTIONS} />
                <SelectField label="Language" value={values.language} onChange={(value) => update("language", value)} options={LANGUAGE_OPTIONS} />
              </div>
              <div className="grid min-w-0 gap-4 md:grid-cols-2">
                <SelectField label="Fee mode" value={values.feeMode} onChange={(value) => update("feeMode", value)} options={FEE_OPTIONS} />
                <label className="flex min-w-0 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3">
                  <input type="checkbox" checked={values.isBpl} onChange={(event) => update("isBpl", event.target.checked)} className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 break-words text-sm font-semibold text-[var(--foreground)]">BPL fee exemption</span>
                </label>
              </div>
            </div>

            <div className="tool-action-grid mt-6">
              <button type="button" className="btn-secondary" onClick={() => applyTemplate("general")}>
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
              <button type="button" className="btn-secondary" onClick={copyDraft}>
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button type="button" className="btn-primary" onClick={() => downloadText("rti-draft.txt", draft)}>
                <Download className="h-4 w-4" />
                TXT
              </button>
            </div>
          </section>

          <section className="tool-card order-3 min-w-0 overflow-hidden xl:p-6 xl:order-none">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <UserRound className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Applicant & Authority</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Details used in the final application letter.</p>
              </div>
            </div>
            <div className="grid min-w-0 gap-4">
              <Field label="Applicant name" value={values.applicantName} onChange={(value) => update("applicantName", value)} />
              <Field label="Applicant address" value={values.applicantAddress} onChange={(value) => update("applicantAddress", value)} textarea rows={3} />
              <div className="grid min-w-0 gap-4 md:grid-cols-2">
                <Field label="Phone" value={values.phone} onChange={(value) => update("phone", value)} />
                <Field label="Email" value={values.email} onChange={(value) => update("email", value)} />
              </div>
              <Field label="PIO / department" value={values.department} onChange={(value) => update("department", value)} />
              <Field label="Office address" value={values.authorityAddress} onChange={(value) => update("authorityAddress", value)} textarea rows={3} />
              <div className="grid min-w-0 gap-4 md:grid-cols-2">
                <Field label="Period concerned" value={values.period} onChange={(value) => update("period", value)} />
                <Field label="Place" value={values.place} onChange={(value) => update("place", value)} />
              </div>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Date</span>
                <input
                  type="date"
                  value={values.date}
                  onChange={(event) => update("date", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            </div>
          </section>

          <aside className="tool-card order-4 min-w-0 overflow-hidden xl:p-6 xl:order-none">
            <div className="mb-5 flex min-w-0 items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Readiness Checklist</h2>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Fix missing parts before sending.</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-black text-emerald-600">{checks.score}%</span>
            </div>
            <div className="mb-5 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
              <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${checks.score}%` }} />
            </div>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              {checks.items.map((item) => (
                <div key={item.label} className="flex min-w-0 items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  {item.done ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />}
                  <p className="min-w-0 break-words text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <section className="tool-card order-2 min-w-0 overflow-hidden xl:p-6 xl:sticky xl:top-24 xl:order-none xl:self-start">
          <div className="mb-6 flex min-w-0 flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Live document workspace</p>
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Generated RTI Draft</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Preview and copy the application text.</p>
              </div>
            </div>
            <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:w-auto">
              <button type="button" className="btn-secondary" onClick={copyDraft}>
                <Clipboard className="h-4 w-4" />
                Copy
              </button>
              <button type="button" className="btn-primary" onClick={() => downloadText("rti-draft.txt", draft)}>
                <Download className="h-4 w-4" />
                TXT
              </button>
            </div>
          </div>

          <div className="mb-5 grid min-w-0 gap-3 sm:grid-cols-3 xl:gap-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
                <Mail className="h-4 w-4 text-[var(--primary)]" />
                Send Mode
              </div>
              <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">{values.deliveryMode}</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
                <IndianRupee className="h-4 w-4 text-[var(--primary)]" />
                Fee
              </div>
              <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">{values.isBpl ? "BPL exemption" : values.feeMode}</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
                <CalendarDays className="h-4 w-4 text-[var(--primary)]" />
                Date
              </div>
              <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">{formatDate(values.date)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-2 shadow-[var(--shadow-md)]">
            <pre className="max-h-[620px] min-h-[360px] overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--card)] p-4 text-sm leading-7 text-[var(--foreground)] sm:min-h-[480px] xl:p-6 xl:max-h-[calc(100vh-350px)]">
              {draft}
            </pre>
          </div>

          <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="flex min-w-0 items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" />
              <p className="min-w-0 break-words text-sm font-semibold text-[var(--foreground)]">
                Review public authority address, local fee rules, and attachments before filing. This builder prepares the draft locally in your browser.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 grid min-w-0 gap-4 md:grid-cols-2 xl:mt-8 xl:grid-cols-3 xl:gap-6">
        {[
          { icon: Building2, title: "Address the PIO", body: "Send the request to the Public Information Officer of the concerned public authority." },
          { icon: ListChecks, title: "Ask Specific Questions", body: "Clear, numbered information points usually produce clearer replies." },
          { icon: MapPin, title: "Keep Proof", body: "Keep postal receipt, online acknowledgement, or office receiving copy for tracking." },
          { icon: AlertTriangle, title: "Avoid Opinions", body: "Ask for records, documents, status, or reasons recorded in files rather than explanations or opinions." },
          { icon: Send, title: "Transfer Clause", body: "The draft includes a transfer request if another authority holds the information." },
          { icon: FileText, title: "Review Before Filing", body: "This is a drafting aid. Verify fee rules, address, and local process before submission." },
        ].map(({ icon: Icon, title, body }) => (
          <article key={title} className="tool-card min-w-0 overflow-hidden">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="break-words text-lg font-black text-[var(--foreground)]">{title}</h3>
                <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">{body}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
