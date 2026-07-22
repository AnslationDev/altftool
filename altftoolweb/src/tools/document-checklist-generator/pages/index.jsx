"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  CheckSquare,
  Clipboard,
  Copy,
  Download,
  FileCheck2,
  FileText,
  FolderCheck,
  ListChecks,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";

const TEMPLATES = {
  visa: {
    label: "Visa Application",
    icon: Briefcase,
    note: "Best for tourist, business, and student visa document planning.",
    items: [
      ["Valid passport", "Identity", "High", "Original + copy", true],
      ["Visa application form", "Application", "High", "Signed printout", false],
      ["Passport-size photographs", "Identity", "Medium", "As per embassy size", false],
      ["Bank statement", "Finance", "High", "Last 3 to 6 months", false],
      ["Income tax return / Form 16", "Finance", "Medium", "Latest available year", false],
      ["Travel itinerary", "Travel", "Medium", "Flights and stay details", false],
      ["Invitation letter / cover letter", "Purpose", "Medium", "If applicable", false],
      ["Travel insurance", "Safety", "Medium", "Country-specific requirement", false],
    ],
  },
  job: {
    label: "Job Joining",
    icon: Briefcase,
    note: "For HR onboarding and first-day joining kits.",
    items: [
      ["Offer letter", "Employment", "High", "Signed copy", false],
      ["Government ID proof", "Identity", "High", "Masked copy preferred", true],
      ["PAN card", "Finance", "High", "Format checked copy", true],
      ["Bank account proof", "Payroll", "High", "Cancelled cheque or passbook", true],
      ["Education certificates", "Education", "Medium", "Highest qualification", false],
      ["Experience / relieving letters", "Employment", "Medium", "Previous employers", false],
      ["Passport-size photographs", "Identity", "Low", "2 to 4 copies", false],
      ["Address proof", "Identity", "Medium", "Utility bill, DL, passport, etc.", true],
    ],
  },
  loan: {
    label: "Home / Personal Loan",
    icon: FileText,
    note: "For loan application readiness before bank submission.",
    items: [
      ["Loan application form", "Application", "High", "Signed by applicant", false],
      ["PAN card", "KYC", "High", "Mandatory for finance checks", true],
      ["Aadhaar / address proof", "KYC", "High", "Masked copy preferred", true],
      ["Salary slips", "Income", "High", "Last 3 months", false],
      ["Bank statements", "Income", "High", "Last 6 months", false],
      ["ITR / Form 16", "Income", "Medium", "Last 2 years if needed", false],
      ["Property papers", "Collateral", "High", "For secured/home loan", false],
      ["Existing loan statements", "Liability", "Medium", "If balance transfer or refinance", false],
    ],
  },
  rental: {
    label: "Rental Agreement",
    icon: FileCheck2,
    note: "For tenant-owner agreement and move-in documentation.",
    items: [
      ["Tenant ID proof", "KYC", "High", "Masked copy preferred", true],
      ["Owner ID proof", "KYC", "High", "Masked copy preferred", true],
      ["Address proof", "KYC", "Medium", "Current/permanent address", true],
      ["Police verification form", "Compliance", "Medium", "City-specific requirement", false],
      ["Rent agreement draft", "Agreement", "High", "Review clauses carefully", false],
      ["Security deposit receipt", "Payment", "High", "Keep signed proof", false],
      ["Move-in inventory list", "Property", "Medium", "Photos recommended", false],
      ["Utility meter readings", "Property", "Low", "Electricity/water/gas", false],
    ],
  },
  admission: {
    label: "College Admission",
    icon: FolderCheck,
    note: "For admission desk, scholarship, and hostel document planning.",
    items: [
      ["Application form", "Application", "High", "Filled and signed", false],
      ["10th marksheet", "Education", "High", "Original + copies", false],
      ["12th marksheet", "Education", "High", "Original + copies", false],
      ["Transfer certificate", "Education", "Medium", "If required", false],
      ["Migration certificate", "Education", "Medium", "Board/university specific", false],
      ["Identity proof", "KYC", "High", "Masked copy preferred", true],
      ["Category / domicile certificate", "Eligibility", "Medium", "If applicable", false],
      ["Passport-size photographs", "Identity", "Low", "Multiple copies", false],
    ],
  },
  kyc: {
    label: "KYC / Account Opening",
    icon: ShieldCheck,
    note: "For bank, fintech, SIM, mutual fund, and service onboarding.",
    items: [
      ["PAN card", "Identity", "High", "Required for financial KYC", true],
      ["Aadhaar / address proof", "Identity", "High", "Masked copy preferred", true],
      ["Photograph", "Identity", "Medium", "Recent passport-size", false],
      ["Mobile number", "Contact", "High", "Active for OTP", false],
      ["Email address", "Contact", "Medium", "Accessible inbox", false],
      ["Bank account proof", "Finance", "Medium", "If payout needed", true],
      ["Nominee details", "Compliance", "Low", "For finance products", true],
      ["Signature specimen", "Compliance", "Medium", "If offline process", false],
    ],
  },
  business: {
    label: "Business Setup",
    icon: Briefcase,
    note: "For basic company, GST, banking, and vendor onboarding prep.",
    items: [
      ["Founder PAN", "KYC", "High", "Masked copy for sharing", true],
      ["Founder address proof", "KYC", "High", "Recent and readable", true],
      ["Business address proof", "Business", "High", "Utility bill/rent deed", false],
      ["Partnership deed / incorporation certificate", "Legal", "High", "As applicable", false],
      ["GST certificate", "Tax", "Medium", "If registered", false],
      ["Cancelled cheque", "Banking", "Medium", "Business account", true],
      ["Board resolution / authorization letter", "Legal", "Medium", "If company/LLP", false],
      ["Digital signature details", "Compliance", "Low", "For filings", true],
    ],
  },
};

const PRIORITY_ORDER = { High: 1, Medium: 2, Low: 3 };

function makeItem(row, index, templateKey) {
  const [name, category, priority, note, sensitive] = row;
  return {
    id: `${templateKey}-${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    category,
    priority,
    note,
    sensitive,
    checked: false,
    copies: priority === "High" ? 2 : 1,
  };
}

function createItems(templateKey) {
  return TEMPLATES[templateKey].items.map((row, index) => makeItem(row, index, templateKey));
}

function buildMarkdown(template, applicantName, deadline, items) {
  const done = items.filter((item) => item.checked).length;
  return [
    `# ${template.label} Document Checklist`,
    applicantName ? `Applicant: ${applicantName}` : "",
    deadline ? `Deadline: ${deadline}` : "",
    `Progress: ${done}/${items.length} completed`,
    "",
    ...items.map((item) => `- [${item.checked ? "x" : " "}] ${item.name} (${item.priority}) - ${item.note}`),
    "",
    "Privacy note: Share masked copies for sensitive identity and financial documents wherever accepted.",
  ]
    .filter(Boolean)
    .join("\n");
}

function exportCsv(template, applicantName, deadline, items) {
  const rows = [
    ["Template", "Applicant", "Deadline", "Document", "Category", "Priority", "Copies", "Sensitive", "Status", "Note"],
    ...items.map((item) => [
      template.label,
      applicantName,
      deadline,
      item.name,
      item.category,
      item.priority,
      item.copies,
      item.sensitive ? "Yes" : "No",
      item.checked ? "Done" : "Pending",
      item.note,
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "document-checklist.csv";
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
        : tone === "bad"
          ? "bg-rose-500/10 text-rose-600"
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

function PriorityPill({ priority }) {
  const tone =
    priority === "High"
      ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
      : priority === "Medium"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{priority}</span>;
}

export default function DocumentChecklistGenerator() {
  const [templateKey, setTemplateKey] = useState("visa");
  const [items, setItems] = useState(() => createItems("visa"));
  const [applicantName, setApplicantName] = useState("Saurabh Tiwari");
  const [deadline, setDeadline] = useState("");
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("Custom");

  const template = TEMPLATES[templateKey];
  const TemplateIcon = template.icon;

  const stats = useMemo(() => {
    const total = items.length;
    const done = items.filter((item) => item.checked).length;
    const sensitive = items.filter((item) => item.sensitive).length;
    const highPending = items.filter((item) => item.priority === "High" && !item.checked).length;
    const progress = total ? Math.round((done / total) * 100) : 0;
    const categoryCounts = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    return { total, done, pending: total - done, sensitive, highPending, progress, categoryCounts };
  }, [items]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.name.localeCompare(b.name)),
    [items],
  );

  const changeTemplate = (nextKey) => {
    setTemplateKey(nextKey);
    setItems(createItems(nextKey));
  };

  const updateItem = (id, patch) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const addCustomItem = () => {
    const name = customName.trim();
    if (!name) return;
    setItems((current) => [
      ...current,
      {
        id: `custom-${Date.now()}`,
        name,
        category: customCategory.trim() || "Custom",
        priority: "Medium",
        note: "Added manually",
        sensitive: false,
        checked: false,
        copies: 1,
      },
    ]);
    setCustomName("");
  };

  const copyMarkdown = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(buildMarkdown(template, applicantName, deadline, sortedItems));
    }
  };

  const copyPending = async () => {
    const pending = sortedItems.filter((item) => !item.checked).map((item) => `- ${item.name} (${item.priority})`).join("\n");
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(pending || "All documents completed.");
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1360px] px-4 pb-12 pt-8 text-[var(--foreground)] sm:px-6 sm:pt-10 lg:px-8">
        <header className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,var(--section-highlight),var(--background)_52%,rgba(59,130,246,0.08))] p-5 text-center shadow-sm sm:p-7 xl:p-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
              <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="min-w-0 truncate">Smart document planner</span>
              </span>
              <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-600">
                <CheckCircle className="h-4 w-4 shrink-0" />
                {stats.progress}% ready
              </span>
            </div>
            <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">Document Checklist Generator</h1>
            <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
              Generate structured document checklists for visa, job joining, loan, rental, admission, KYC, and business workflows with priority, copies, privacy flags, and export-ready output.
            </p>
          </div>

          <section className="mx-auto mt-5 grid w-full max-w-6xl grid-cols-2 gap-3 sm:mt-8 lg:grid-cols-4 xl:gap-5">
            <MetricCard icon={ListChecks} label="Total Documents" value={stats.total} detail={`${template.label} checklist selected.`} />
            <MetricCard icon={CheckCircle} label="Completed" value={stats.done} detail={`${stats.progress}% of checklist done.`} tone="good" />
            <MetricCard icon={AlertTriangle} label="High Priority Pending" value={stats.highPending} detail="Finish these before submission." tone={stats.highPending ? "warn" : "good"} />
            <MetricCard icon={ShieldCheck} label="Sensitive Docs" value={stats.sensitive} detail="Prefer masked copies when accepted." />
          </section>
        </header>

        <div className="mt-5 grid min-w-0 gap-4 sm:mt-8 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)]">
          <div className="contents xl:grid xl:min-w-0 xl:content-start xl:gap-5">
          <section className="tool-card order-1 min-w-0 overflow-hidden xl:order-none">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <TemplateIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Checklist Setup</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{template.note}</p>
              </div>
            </div>

            <label className="block min-w-0">
              <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Document workflow</span>
              <select
                value={templateKey}
                onChange={(event) => changeTemplate(event.target.value)}
                className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                {Object.entries(TEMPLATES).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-2">
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Applicant / project name</span>
                <input
                  value={applicantName}
                  onChange={(event) => setApplicantName(event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  placeholder="Name or project"
                />
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Deadline</span>
                <input
                  type="date"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            </div>

            <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="mb-3 text-sm font-bold text-[var(--foreground)]">Add custom document</p>
              <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_130px]">
                <input
                  value={customName}
                  onChange={(event) => setCustomName(event.target.value)}
                  className="h-11 min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  placeholder="Document name"
                />
                <input
                  value={customCategory}
                  onChange={(event) => setCustomCategory(event.target.value)}
                  className="h-11 min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  placeholder="Category"
                />
              </div>
              <button type="button" className="btn-primary mt-3 w-full" onClick={addCustomItem}>
                <Plus className="h-4 w-4" />
                Add Document
              </button>
            </div>

            <div className="tool-action-grid mt-6">
              <button type="button" className="btn-secondary" onClick={() => setItems(createItems(templateKey))}>
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
              <button type="button" className="btn-secondary" onClick={copyMarkdown}>
                <Clipboard className="h-4 w-4" />
                Markdown
              </button>
              <button type="button" className="btn-primary" onClick={() => exportCsv(template, applicantName, deadline, sortedItems)}>
                <Download className="h-4 w-4" />
                CSV
              </button>
            </div>
          </section>

          <article className="tool-card order-3 min-w-0 overflow-hidden xl:order-none">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <FileCheck2 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Category Breakdown</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Quickly see which document groups need attention.</p>
              </div>
            </div>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              {Object.entries(stats.categoryCounts).map(([category, count]) => (
                <div key={category} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="break-words text-sm font-bold text-[var(--muted-foreground)]">{category}</p>
                  <p className="mt-2 text-2xl font-black text-[var(--foreground)]">{count}</p>
                </div>
              ))}
            </div>
          </article>

          <aside className="tool-card order-4 min-w-0 overflow-hidden xl:order-none">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Submission Tips</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Keep documents neat and safer to share.</p>
              </div>
            </div>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {[
                "Carry originals separately from photocopies.",
                "Mask Aadhaar or other sensitive IDs wherever accepted.",
                "Keep file names clear before uploading online.",
                "Check expiry dates on passport, ID, and certificates.",
              ].map((tip) => (
                <div key={tip} className="flex min-w-0 items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                  <p className="min-w-0 break-words text-sm font-semibold text-[var(--foreground)]">{tip}</p>
                </div>
              ))}
            </div>
          </aside>
          </div>

          <section className="tool-card order-2 min-w-0 overflow-hidden xl:order-none">
            <div className="mb-5 flex min-w-0 flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Generated Checklist</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                  Check items as collected, adjust copies, and flag sensitive files.
                </p>
              </div>
              <button type="button" className="btn-secondary" onClick={copyPending}>
                <Copy className="h-4 w-4" />
                Pending
              </button>
            </div>

            <div className="space-y-3">
              {sortedItems.map((item) => (
                <article key={item.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 sm:p-4">
                  <div className="grid min-w-0 gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start">
                    <button
                      type="button"
                      onClick={() => updateItem(item.id, { checked: !item.checked })}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${
                        item.checked
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]"
                      }`}
                      aria-label={item.checked ? "Mark pending" : "Mark complete"}
                    >
                      <CheckSquare className="h-5 w-5" />
                    </button>
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className={`min-w-0 break-words text-lg font-black ${item.checked ? "text-[var(--muted-foreground)] line-through" : "text-[var(--foreground)]"}`}>
                          {item.name}
                        </h3>
                        <PriorityPill priority={item.priority} />
                        {item.sensitive ? (
                          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">Sensitive</span>
                        ) : null}
                      </div>
                      <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">
                        {item.category} · {item.note}
                      </p>
                    </div>
                    <button type="button" className="btn-secondary h-10 px-3" onClick={() => removeItem(item.id)} aria-label="Remove document">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-3">
                    <label className="block min-w-0">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Priority</span>
                      <select
                        value={item.priority}
                        onChange={(event) => updateItem(item.id, { priority: event.target.value })}
                        className="h-10 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none"
                      >
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </label>
                    <label className="block min-w-0">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Copies</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={item.copies}
                        onChange={(event) => updateItem(item.id, { copies: Math.max(1, Math.min(10, Number(event.target.value) || 1)) })}
                        className="h-10 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none"
                      />
                    </label>
                    <label className="flex min-w-0 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2">
                      <input
                        type="checkbox"
                        checked={item.sensitive}
                        onChange={(event) => updateItem(item.id, { sensitive: event.target.checked })}
                        className="h-4 w-4 shrink-0"
                      />
                      <span className="min-w-0 break-words text-sm font-semibold text-[var(--foreground)]">Privacy sensitive</span>
                    </label>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

    </main>
  );
}
