"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LayoutGrid, Loader2, Megaphone, Sparkles } from "lucide-react";
import { ADVERTISER_SECTIONS, DEFAULT_ADVERTISER_SECTIONS, subscribeAdvertiserSection } from "./service/advertiser.service";

const ICONS = {
  "hero-section": Sparkles,
  "traffic-types": Megaphone,
};

export default function AdvertiserPage() {
  const [sections, setSections] = useState(DEFAULT_ADVERTISER_SECTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ready = new Set();
    const unsubs = ADVERTISER_SECTIONS.map(({ key }) =>
      subscribeAdvertiserSection(
        key,
        (data) => {
          ready.add(key);
          setSections((prev) => ({ ...prev, [key]: data }));
          if (ready.size === ADVERTISER_SECTIONS.length) setLoading(false);
        },
        () => {
          ready.add(key);
          if (ready.size === ADVERTISER_SECTIONS.length) setLoading(false);
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
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CareerBook Advertiser Admin</h1>
              <p className="text-sm text-gray-500">Manage the advertiser hero and traffic-type cards.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {ADVERTISER_SECTIONS.map((section) => {
            const Icon = ICONS[section.key] || Sparkles;
            const data = sections[section.key] || DEFAULT_ADVERTISER_SECTIONS[section.key];
            return (
              <div key={section.key} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Component Name</p>
                      <h2 className="mt-1 text-lg font-bold text-gray-900">{section.label}</h2>
                      <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">{section.description}</p>
                    </div>
                  </div>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : null}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Metric label="Current Status" value={data.active !== false ? "Active" : "Inactive"} tone={data.active !== false ? "green" : "gray"} />
                  <Metric label="Last Updated" value={formatDate(data.updatedAt)} />
                </div>

                <Link href={`/carrerbook/advertiser/${section.key}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700">
                  Edit {section.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Firebase Flow</p>
          <p className="mt-3 text-sm font-bold text-gray-900">projects / carrerbook / advertiser</p>
          <p className="mt-2 text-xs font-semibold text-gray-500">hero-section, traffic-types, traffic-types/cards</p>
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
