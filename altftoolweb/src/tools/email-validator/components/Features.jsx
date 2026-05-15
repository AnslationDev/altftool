"use client";

import {
  AlertTriangle,
  ClipboardCheck,
  Download,
  Globe,
  MailCheck,
  SearchCheck,
  ShieldAlert,
  Users,
} from "lucide-react";

const features = [
  {
    icon: MailCheck,
    title: "Syntax Validation",
    description:
      "Checks local part, domain, length limits, invalid dots, unsupported characters, and normalization.",
  },
  {
    icon: Globe,
    title: "DNS and MX Lookup",
    description:
      "Uses browser-side DNS-over-HTTPS to check MX records, with A and AAAA fallback signals.",
  },
  {
    icon: ShieldAlert,
    title: "Risk Signals",
    description:
      "Flags disposable domains, role-based inboxes, free providers, suspicious TLDs, and typo risk.",
  },
  {
    icon: SearchCheck,
    title: "Typo Suggestions",
    description:
      "Suggests corrections for common domain mistakes like gmai.com, hotmial.com, or outlok.com.",
  },
  {
    icon: Users,
    title: "Bulk Validation",
    description:
      "Paste lists from sheets, CRMs, or forms and validate many addresses in one run.",
  },
  {
    icon: ClipboardCheck,
    title: "Copy Report",
    description:
      "Copy a readable validation summary with status, score, DNS, and risk details.",
  },
  {
    icon: Download,
    title: "CSV Export",
    description:
      "Export bulk validation results for lead cleanup, CRM imports, or QA workflows.",
  },
  {
    icon: AlertTriangle,
    title: "Deliverability Notes",
    description:
      "Clearly separates syntax/domain checks from mailbox-existence checks that require sending or SMTP access.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pb-12">
      <div className="mb-8 text-center">
        <h2 className="subheading">Why Use This Email Validator?</h2>
        <p className="description mt-3">
          Clean signups, leads, and contact lists before they reach your CRM,
          newsletter, or outreach workflow.
        </p>
      </div>

      <div className="tool-feature-grid">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-lg border border-(--border) bg-(--card) p-5"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-(--foreground)">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
