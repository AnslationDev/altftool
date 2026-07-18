"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Home as HomeIcon,
  Info,
  Layers,
  Loader2,
  MessageSquareQuote,
  Newspaper,
  Rocket,
  Sparkles,
  Users,
} from "lucide-react";
import { DEFAULT_HOME_SECTIONS, HOME_SECTIONS, subscribeHomeSection } from "./service/home.service";

const ICONS = {
  hero: Sparkles,
  "about-preview": Info,
  "services-preview": Layers,
  testimonials: MessageSquareQuote,
  "team-preview": Users,
  cta: Rocket,
  "blog-preview": Newspaper,
};

export default function AnslicHomePage() {
  const [sections, setSections] = useState(DEFAULT_HOME_SECTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ready = new Set();
    const unsubs = HOME_SECTIONS.map(({ key }) =>
      subscribeHomeSection(
        key,
        (data) => {
          ready.add(key);
          setSections((prev) => ({ ...prev, [key]: data }));
          if (ready.size === HOME_SECTIONS.length) setLoading(false);
        },
        () => {
          ready.add(key);
          if (ready.size === HOME_SECTIONS.length) setLoading(false);
        },
      ),
    );
    return () => unsubs.forEach((unsubscribe) => unsubscribe());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <HomeIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Anslic Home Page</h1>
              <p className="text-sm text-gray-500">
                Manage every section of the Anslic homepage from one hub.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {HOME_SECTIONS.map((section) => {
            const Icon = ICONS[section.key] || Sparkles;
            const data = sections[section.key] || DEFAULT_HOME_SECTIONS[section.key];
            return (
              <div
                key={section.key}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Section
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-gray-900">{section.label}</h2>
                      <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : null}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Metric
                    label="Current Status"
                    value={data.active !== false ? "Active" : "Inactive"}
                    tone={data.active !== false ? "green" : "gray"}
                  />
                  <Metric label="Last Updated" value={formatDate(data.updatedAt)} />
                </div>

                <Link
                  href={section.route}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
                >
                  Edit {section.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Firebase Flow</p>
          <p className="mt-3 text-sm font-bold text-gray-900">projects / anslic / homesection</p>
          <p className="mt-2 text-xs font-semibold text-gray-500">
            hero, about-preview, services-preview, testimonials (+ items), team-preview, cta, blog-preview
          </p>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone = "gray" }) {
  const toneClass = tone === "green" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700";
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-sm font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function formatDate(value) {
  const date = value?.toDate?.() || null;
  if (!date) return "Not saved yet";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(date);
}
