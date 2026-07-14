"use client";

import React, { useMemo, useState } from "react";
import {
  CheckSquare,
  ClipboardCheck,
  Copy,
  Download,
  FileCheck2,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Tags,
} from "lucide-react";

const projectTypes = ["Web Application", "Mobile App", "API / Backend", "Data / Analytics", "Design / UX", "Infrastructure"];
const teamSizes = ["Small (2-5 people)", "Medium (6-10 people)", "Large (11+ people)", "Enterprise / Multi-team"];
const complianceOptions = ["SOC2", "HIPAA", "GDPR", "PCI-DSS"];

const baseChecklist = {
  "Web Application": [
    "Feature matches the agreed acceptance criteria and user flow.",
    "Responsive behavior is checked on mobile, tablet, and desktop breakpoints.",
    "Loading, empty, error, and success states are reviewed.",
    "Accessibility basics are covered: labels, keyboard focus, contrast, and semantic structure.",
  ],
  "Mobile App": [
    "Feature works on the target iOS and Android device range.",
    "Offline, poor-network, and permission-denied states are handled.",
    "Touch targets, gestures, and navigation patterns are verified.",
    "Crash-free behavior is checked for the main user path.",
  ],
  "API / Backend": [
    "Endpoint behavior matches the contract and documented response schema.",
    "Validation, authorization, rate limits, and error responses are covered.",
    "Database changes are migrated safely and rollback notes are documented.",
    "Logs and metrics are available for production troubleshooting.",
  ],
  "Data / Analytics": [
    "Source data, transformations, and definitions are documented.",
    "Data quality checks cover freshness, completeness, duplicates, and nulls.",
    "Dashboard or report numbers are reconciled against a trusted source.",
    "Owners know how to monitor failures and refresh delays.",
  ],
  "Design / UX": [
    "Final design matches the approved problem, audience, and interaction goals.",
    "Edge cases, empty states, and responsive variants are included.",
    "Copy, labels, and visual hierarchy are reviewed with stakeholders.",
    "Handoff includes specs, assets, and implementation notes.",
  ],
  Infrastructure: [
    "Infrastructure change is reviewed, versioned, and reproducible.",
    "Security groups, secrets, permissions, and network exposure are checked.",
    "Monitoring, alerts, backups, and rollback steps are ready.",
    "Cost and capacity impact are understood before release.",
  ],
};

const universalItems = [
  "Code or implementation has been peer reviewed.",
  "Automated or manual tests cover the main success path and key edge cases.",
  "Product owner or stakeholder has reviewed the completed work.",
  "Documentation, release notes, or support notes are updated where needed.",
  "No critical bugs, blockers, or unresolved high-risk follow-ups remain.",
];

const complianceItems = {
  SOC2: "SOC2 controls are considered, with audit-relevant evidence linked or documented.",
  HIPAA: "HIPAA-sensitive data paths are reviewed for privacy, access control, and logging.",
  GDPR: "GDPR requirements are checked for consent, retention, deletion, and data minimization.",
  "PCI-DSS": "PCI-DSS payment data handling is reviewed and sensitive card data is not exposed.",
};

const teamSizeItems = {
  "Small (2-5 people)": "Checklist is lightweight enough for a small team to follow every sprint.",
  "Medium (6-10 people)": "Ownership is clear across product, engineering, QA, and design.",
  "Large (11+ people)": "Cross-team dependencies, release coordination, and sign-offs are documented.",
  "Enterprise / Multi-team": "Governance, approvals, audit trail, and operational readiness are complete.",
};

const benefits = [
  ["End the done debate", "Everyone shares the same quality bar before a story moves to complete."],
  ["Catch gaps earlier", "Security, compliance, testing, and docs become part of normal delivery."],
  ["Estimate more honestly", "Teams plan for the full work, not only the coding portion."],
  ["Onboard faster", "New teammates can see the working agreement instead of guessing unwritten rules."],
];

function buildChecklist({ projectType, techStack, compliance, teamSize }) {
  const stack = techStack.trim();
  const stackItems = stack
    ? [
        `Implementation is verified against the selected stack: ${stack}.`,
        `Stack-specific risks, build steps, and deployment notes for ${stack} are documented.`,
      ]
    : ["Technical assumptions and environment requirements are documented."];

  return [
    ...(baseChecklist[projectType] || baseChecklist["Web Application"]),
    ...stackItems,
    ...compliance.map((item) => complianceItems[item]),
    teamSizeItems[teamSize],
    ...universalItems,
  ].filter(Boolean);
}

function formatChecklist(items, form) {
  return `Definition of Done Checklist
Project Type: ${form.projectType}
Team Size: ${form.teamSize}
Tech Stack: ${form.techStack.trim() || "Not specified"}
Compliance: ${form.compliance.length ? form.compliance.join(", ") : "None"}

${items.map((item) => `- [ ] ${item}`).join("\n")}`;
}

export default function DefinitionOfDoneGeneratorApp() {
  const [form, setForm] = useState({
    projectType: "Web Application",
    techStack: "",
    compliance: [],
    teamSize: "Small (2-5 people)",
  });
  const [generated, setGenerated] = useState(false);
  const [message, setMessage] = useState("");

  const checklist = useMemo(() => buildChecklist(form), [form]);
  const output = useMemo(() => formatChecklist(checklist, form), [checklist, form]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    if (generated) setMessage("Checklist updated in real time.");
  }

  function toggleCompliance(item) {
    setForm((current) => {
      const exists = current.compliance.includes(item);
      return {
        ...current,
        compliance: exists ? current.compliance.filter((value) => value !== item) : [...current.compliance, item],
      };
    });
    if (generated) setMessage("Checklist updated in real time.");
  }

  function generateChecklist(event) {
    event.preventDefault();
    setGenerated(true);
    setMessage("Definition of Done generated. Adjust inputs to update it in real time.");
  }

  async function copyChecklist() {
    await navigator.clipboard.writeText(output);
    setMessage("Definition of Done copied.");
  }

  function downloadChecklist() {
    const blob = new Blob([output], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "definition-of-done-checklist.txt";
    link.click();
    URL.revokeObjectURL(link.href);
    setMessage("Definition of Done downloaded.");
  }

  return (
    <div className="definition-of-done-generator min-h-screen overflow-x-hidden bg-(--background) py-8 font-secondary text-(--foreground)">
      <div className="section-container space-y-8 px-4 sm:px-6">
        <header className="section-header">
          <div className="mx-auto mb-3 flex w-fit items-center justify-center gap-3 text-(--primary)">
            <ListChecks className="h-8 w-8 shrink-0" />
            <h1 className="section-title mb-0 text-(--primary)">Free Definition of Done Generator</h1>
          </div>
          <p className="section-subtitle mx-auto mb-0">
            Generate a comprehensive DoD checklist tailored to your project, tech stack, and compliance needs
          </p>
        </header>

        {message && <div className="rounded-lg border border-(--border) bg-(--card) px-4 py-3 text-sm font-bold text-(--primary)">{message}</div>}

        <main className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
          <section className="rounded-lg border border-(--border) bg-(--card) p-4 shadow-lg">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-(--muted) text-(--primary)">
                <ListChecks className="h-5 w-5" />
              </div>
              <h2 className="subheading break-words">Generate Definition of Done</h2>
            </div>

            <form onSubmit={generateChecklist} className="space-y-3">
              <Select label="Project Type" value={form.projectType} onChange={(value) => updateField("projectType", value)} options={projectTypes} helper="Select the type of project your team is working on." />
              <Field label="Tech Stack (Optional)" value={form.techStack} onChange={(value) => updateField("techStack", value)} placeholder="E.g., React, Node.js, PostgreSQL, AWS..." helper="Specify your tech stack for more relevant checklist items." />

              <div className="min-w-0">
                <div className="mb-3 text-sm font-black text-(--foreground)">Compliance Requirements (Optional)</div>
                <div className="grid grid-cols-2 gap-2">
                  {complianceOptions.map((item) => (
                    <label key={item} className="flex min-w-0 items-center gap-2 rounded-lg border border-(--border) bg-(--background) px-2 py-2 text-sm font-bold text-(--foreground)">
                      <input className="h-4 w-4 accent-(--primary)" type="checkbox" checked={form.compliance.includes(item)} onChange={() => toggleCompliance(item)} />
                      <span className="min-w-0 whitespace-nowrap">{item}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">Select any compliance frameworks your project must follow.</p>
              </div>

              <Select label="Team Size" value={form.teamSize} onChange={(value) => updateField("teamSize", value)} options={teamSizes} helper="Larger teams benefit from more process-oriented items." />

              <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-(--primary) px-4 py-2.5 text-sm font-black text-(--primary-foreground) shadow-md transition hover:bg-(--primary-hover)">
                <Sparkles className="h-4 w-4" />
                Generate Definition of Done
              </button>
            </form>

            {generated && (
              <div className="mt-5 border-t border-(--border) pt-4">
                <div className="flex min-w-0 flex-col gap-3">
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-(--primary)">Live Checklist</div>
                    <h2 className="subheading mt-1 break-words">Definition of Done</h2>
                  </div>
                  <div className="grid w-full min-w-0 grid-cols-2 gap-2">
                    <IconButton onClick={copyChecklist} icon={Copy} label="Copy" />
                    <IconButton onClick={downloadChecklist} icon={Download} label="Export" />
                  </div>
                </div>

                <div className="mt-4 grid max-h-[360px] gap-2 overflow-y-auto pr-1">
                  {checklist.map((item) => (
                    <div key={item} className="flex min-h-[48px] gap-2 rounded-lg border border-(--border) bg-(--background) p-3 text-sm leading-6 text-(--muted-foreground)">
                      <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-(--primary)" />
                      <span className="min-w-0 break-words">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-lg border border-(--border) bg-(--card) shadow-lg">
            <div className="grid min-h-[220px] place-items-center bg-(--section-highlight) p-5 text-center">
              <div className="max-w-lg">
                <ShieldCheck className="mx-auto h-10 w-10 text-(--primary)" />
                <h2 className="subheading mt-3 break-words">Ready to Generate Your Definition of Done?</h2>
                <p className="section-subtitle mx-auto mt-2 mb-0 break-words text-sm">
                  Select your project type and options to get started. Your live checklist will appear under the generator card and update as inputs change.
                </p>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex min-w-0 flex-col gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-(--primary)">Preview</div>
                  <h2 className="subheading mt-1 break-words">Checklist Summary</h2>
                </div>
                <div className="grid w-full min-w-0 grid-cols-2 gap-2">
                  <IconButton onClick={copyChecklist} icon={Copy} label="Copy" />
                  <IconButton onClick={downloadChecklist} icon={Download} label="Export" />
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {checklist.slice(0, 4).map((item) => (
                  <div key={item} className="flex min-h-[52px] gap-2 rounded-lg border border-(--border) bg-(--background) p-3 text-sm leading-6 text-(--muted-foreground)">
                    <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-(--primary)" />
                    <span className="min-w-0 break-words">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <section className="rounded-lg border border-(--border) bg-(--card) p-4 shadow-md sm:p-5">
          <div className="mb-4 flex min-w-0 items-center gap-3">
            <Tags className="h-7 w-7 shrink-0 text-(--primary)" />
            <h2 className="break-words text-2xl font-black leading-tight text-(--foreground)">Build a Definition of Done that actually gets used</h2>
          </div>
          <div className="space-y-3">
            <p className="text-base leading-7 text-(--muted-foreground)">
              A Definition of Done is a shared checklist that spells out what done means for your team. Without one, teams often discover quality, testing, documentation, or release gaps too late.
            </p>
            <p className="text-base leading-7 text-(--muted-foreground)">
              This generator creates a DoD checklist matched to your project type, tech stack, team size, and compliance requirements. Review it with your team, remove what does not apply, and bring it to sprint planning.
            </p>
          </div>
        </section>

        <section className="space-y-5">
          <div className="section-header">
            <h2 className="break-words text-2xl font-black leading-tight text-(--foreground) sm:text-3xl">Why teams with a clear DoD ship better software</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {benefits.map(([title, text]) => (
              <article key={title} className="min-h-[132px] rounded-lg border border-(--border) bg-(--card) p-4 shadow-md">
                <h3 className="subheading text-lg">{title}</h3>
                <p className="section-subtitle mt-3 mb-0 text-sm sm:text-base">{text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <style jsx global>{`
        .definition-of-done-generator * {
          min-width: 0;
        }
      `}</style>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, helper }) {
  return (
    <label className="block">
      <span className="mb-1 block px-2 text-sm font-bold text-(--muted-foreground)">{label}</span>
      <input className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) outline-none transition placeholder:text-(--input-placeholder) focus:border-(--primary) focus:ring-2 focus:ring-(--primary)" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {helper && <span className="mt-1.5 block text-sm leading-5 text-(--muted-foreground)">{helper}</span>}
    </label>
  );
}

function Select({ label, value, onChange, options, helper }) {
  return (
    <label className="block">
      <span className="mb-1 block px-2 text-sm font-bold text-(--muted-foreground)">{label}</span>
      <select className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {helper && <span className="mt-1.5 block text-sm leading-5 text-(--muted-foreground)">{helper}</span>}
    </label>
  );
}

function IconButton({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="inline-flex min-w-[92px] items-center justify-center gap-2 rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm font-bold text-(--foreground) transition hover:border-(--primary)">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
