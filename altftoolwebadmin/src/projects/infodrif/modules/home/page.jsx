"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Home as HomeIcon, LayoutGrid, Loader2, Sparkles, Target, Workflow } from "lucide-react";
import { PageHeader, Panel } from "../../components/ui";
import { formatDate } from "./components/HomeAdminShared";
import { DEFAULT_HOME_SECTIONS, HOME_SECTIONS, subscribeHomeSection } from "./service/home.service";

const ICONS = {
  hero: Sparkles,
  "trusted-by": Target,
  "work-strategy": Workflow,
  showcase: LayoutGrid,
};

export default function InfodrifHomePage() {
  const [sections, setSections] = useState(DEFAULT_HOME_SECTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ready = new Set();
    const markReady = (key) => {
      ready.add(key);
      if (ready.size === HOME_SECTIONS.length) setLoading(false);
    };

    const unsubs = HOME_SECTIONS.map(({ key }) =>
      subscribeHomeSection(
        key,
        (data) => {
          setSections((prev) => ({ ...prev, [key]: data }));
          markReady(key);
        },
        () => markReady(key),
      ),
    );

    return () => unsubs.forEach((unsubscribe) => unsubscribe());
  }, []);

  return (
    <div className="min-h-screen bg-[var(--page,var(--background))] p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <PageHeader
          icon={HomeIcon}
          title="Infodrif Home Page"
          description="Manage every section of the Infodrif homepage from one hub."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {HOME_SECTIONS.map((section) => {
            const Icon = ICONS[section.key] || Sparkles;
            const data = sections[section.key] || DEFAULT_HOME_SECTIONS[section.key];

            return (
              <div
                key={section.key}
                className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)]">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                        Section
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-[var(--foreground)]">
                        {section.label}
                      </h2>
                      <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[var(--muted)]" />
                  ) : null}
                </div>

                <div className="mt-5">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                      Last updated
                    </p>
                    <p className="mt-2 text-sm font-bold text-[var(--foreground)]">
                      {loading ? "…" : formatDate(data?.updatedAt)}
                    </p>
                  </div>
                </div>

                <Link
                  href={section.route}
                  className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[13px] font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:bg-[color-mix(in_srgb,var(--primary)_85%,black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
                >
                  Edit {section.label}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              </div>
            );
          })}
        </div>

        <Panel eyebrow="Firestore" title="Where this content lives">
          <p className="font-mono text-sm font-bold text-[var(--foreground)]">
            projects / infodrif / homesection
          </p>
          <ul className="mt-3 space-y-1.5 text-xs font-medium text-[var(--muted)]">
            <li>
              <span className="font-semibold text-[var(--foreground)]">hero</span> — rotatingWords,
              customerAvatars, teamAvatars
            </li>
            <li>
              <span className="font-semibold text-[var(--foreground)]">trusted-by</span> — brands
            </li>
            <li>
              <span className="font-semibold text-[var(--foreground)]">work-strategy</span> —
              segments, features
            </li>
            <li>
              <span className="font-semibold text-[var(--foreground)]">showcase</span> — row1, row2,
              row3
            </li>
          </ul>
          <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
            The public site merges these documents over{" "}
            <span className="font-mono">src/data/home.json</span>. Cleared fields fall back to that
            JSON rather than rendering empty.
          </p>
        </Panel>
      </div>
    </div>
  );
}
