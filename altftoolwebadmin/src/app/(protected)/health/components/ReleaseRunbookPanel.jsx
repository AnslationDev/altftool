"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Database,
  Globe2,
  Rocket,
  SearchCheck,
  TerminalSquare,
  XCircle,
} from "lucide-react";
import { StatusBadge } from "./HealthShared";
import { copyTextWithFallback } from "./clipboard";

const RELEASE_RUNBOOK_SECTIONS = [
  {
    title: "Release gates",
    icon: Rocket,
    items: [
      {
        label: "Release doctor",
        command: "npm run release:doctor",
        detail: "Combines saved health reports, Firebase live checks, Vercel readiness, and production freshness.",
      },
      {
        label: "Strict CI gate",
        command: "npm run release:doctor:strict",
        detail: "Fails on blockers or warnings and is the final no-surprises release check.",
      },
      {
        label: "Safe release preflight",
        command: "npm run release:preflight",
        detail: "Builds web/admin, runs Firebase checks, starts a local web monitor, and stops before deploy.",
      },
      {
        label: "Local release confidence",
        command: "npm run validate:ux-release",
        detail: "Runs route, blog, tool, and admin UX release checks before deployment.",
      },
      {
        label: "Runtime quality gates",
        command: "npm run validate:runtime-quality",
        detail: "Combines strict route QA, Firebase live data, Firebase integrity, and performance budget checks.",
      },
      {
        label: "Saved doctor artifact",
        command: "npm run release:doctor:report",
        detail: "Refreshes the admin dashboard artifact with the latest release-doctor checks.",
      },
      {
        label: "Release history artifact",
        command: "npm run release:history:report",
        detail: "Appends the latest report scores so the admin dashboard can compare trends.",
      },
      {
        label: "Full production validation",
        command: "npm run validate:release",
        detail: "Adds live Firebase, security, visual, and Lighthouse coverage.",
      },
    ],
  },
  {
    title: "Firebase health",
    icon: Database,
    items: [
      {
        label: "Public live data",
        command: "npm run firebase:live-check:strict",
        detail: "Confirms public Firestore data is readable and strict live-data score stays at 100.",
      },
      {
        label: "Data integrity",
        command: "npm run firebase:integrity:strict",
        detail: "Validates sampled public content slugs, URLs, display fields, duplicate data, and inactive rows.",
      },
      {
        label: "Admin write access",
        command: "npm run firebase:admin-write-check",
        detail: "Confirms Admin SDK credentials can write and clean up a health document.",
      },
    ],
  },
  {
    title: "Content and SEO",
    icon: SearchCheck,
    items: [
      {
        label: "Blog content health",
        command: "npm run content:blogs:report",
        detail: "Refreshes the saved blog depth, source, FAQ, and link report.",
      },
      {
        label: "Blog SEO links",
        command: "npm run seo:blog-links-live",
        detail: "Checks live internal links and crawl-safe blog routing.",
      },
    ],
  },
  {
    title: "Production monitor",
    icon: Globe2,
    items: [
      {
        label: "Public and admin monitor",
        command: "npm run monitor:production:strict",
        detail: "Checks web, admin login, authenticated admin health, and Firebase live data.",
      },
      {
        label: "Deploy parity",
        command: "npm run deploy:parity:strict",
        detail: "Compares the live public site against the current release contract.",
      },
      {
        label: "Performance budget",
        command: "npm run performance:budget:strict",
        detail: "Checks web/admin bundles, public media, stale image refs, and tool lazy-load boundaries.",
      },
      {
        label: "Production links",
        command: "npm run monitor:links:report",
        detail: "Refreshes the saved production link and image probe for dashboard review.",
      },
    ],
  },
];

export default function ReleaseRunbookPanel({
  deploy,
  production,
  firebaseAdmin,
  firebaseLiveData,
  firebaseDataIntegrity,
  performanceBudget,
  productionLinks,
  releaseDoctorArtifact,
}) {
  const [copiedCommand, setCopiedCommand] = useState("");
  const secrets = [
    { label: "Vercel token", ok: Boolean(deploy?.results?.every((result) => result.present?.some((item) => item.names?.includes("VERCEL_TOKEN")))) },
    { label: "Web project", ok: Boolean(deploy?.results?.find((result) => result.name === "web")?.ok) },
    { label: "Admin project", ok: Boolean(deploy?.results?.find((result) => result.name === "admin")?.ok) },
    { label: "Firebase Admin", ok: Boolean(firebaseAdmin?.adminSdkReady && firebaseAdmin?.firestoreReadable) },
    { label: "Live data", ok: Boolean(firebaseLiveData?.ok) },
    { label: "Data integrity", ok: Boolean(firebaseDataIntegrity?.ok) },
    { label: "Performance", ok: Boolean(performanceBudget?.ok) },
    { label: "Production links", ok: Boolean(productionLinks?.ok) },
    { label: "Doctor artifact", ok: Boolean(releaseDoctorArtifact?.status === "ready") },
    { label: "Production freshness", ok: Number(production?.score || 0) >= 90 },
  ];
  const copyCommand = async (command) => {
    if (await copyTextWithFallback(command)) {
      setCopiedCommand(command);
      window.setTimeout(() => setCopiedCommand(""), 1600);
      return;
    }

    setCopiedCommand("");
  };

  return (
    <section id="release-runbook-panel" className="border border-gray-200 bg-white p-5 shadow-sm rounded-md xl:col-span-3" data-testid="release-runbook-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-950 text-white">
            <TerminalSquare className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Runbook</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Release Operations</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              Fast checks for deploy confidence, Firebase health, content quality, and production monitoring.
            </p>
          </div>
        </div>
        <StatusBadge
          ok={secrets.every((item) => item.ok)}
          label={secrets.every((item) => item.ok) ? "Ready" : "Review"}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {secrets.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-md border border-gray-100 bg-gray-50 p-3">
            <span className="text-sm font-semibold text-gray-900">{item.label}</span>
            {item.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {RELEASE_RUNBOOK_SECTIONS.map((section) => {
          const Icon = section.icon;

          return (
            <div key={section.title} className="rounded-md border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-md bg-white text-gray-700">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-950">{section.title}</h3>
              </div>

              <div className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <div key={item.command} className="rounded-md border border-gray-200 bg-white p-3">
                    <p className="text-sm font-semibold text-gray-950">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">{item.detail}</p>
                    <div className="mt-3 flex items-stretch gap-2">
                      <code className="min-w-0 flex-1 overflow-x-auto rounded border border-gray-200 bg-gray-950 px-3 py-2 font-mono text-xs font-semibold text-white">
                        {item.command}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyCommand(item.command)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
                        title={`Copy ${item.command}`}
                        aria-label={`Copy ${item.command}`}
                      >
                        {copiedCommand === item.command ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
