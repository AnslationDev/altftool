"use client";

import { ChevronRight, Code2, Globe, Lock } from "lucide-react";

export const USE_CASES = [
  {
    id: "totp",
    icon: Lock,
    title: "TOTP / 2FA Secrets",
    subtitle: "Google Authenticator, Authy, etc.",
    input: "my-2fa-secret-key-2026",
    options: { alphabetCase: "upper", paddingMode: "without", lineLength: "" },
  },
  {
    id: "dnssec",
    icon: Globe,
    title: "DNSSEC NSEC3",
    subtitle: "Domain Name System Security",
    input: "example.com",
    options: { alphabetCase: "upper", paddingMode: "with", lineLength: "" },
  },
  {
    id: "config",
    icon: Code2,
    title: "Configuration Encoding",
    subtitle: "App configs, tokens & keys",
    input: '{"api_key":"sk_live_abc123","region":"ap-south-1"}',
    options: { alphabetCase: "upper", paddingMode: "with", lineLength: "64" },
  },
];

export default function UseCasesCard({ onApply }) {
  return (
    <section aria-label="Popular use cases" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-bold text-foreground">Popular Use Cases</h2>
      <ul className="mt-4 space-y-2">
        {USE_CASES.map((useCase) => (
          <li key={useCase.id}>
            <button
              type="button"
              onClick={() => onApply(useCase)}
              title={`Load a ${useCase.title} example`}
              className="group flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <useCase.icon aria-hidden="true" size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-foreground">
                  {useCase.title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {useCase.subtitle}
                </span>
              </span>
              <ChevronRight
                aria-hidden="true"
                size={16}
                className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
