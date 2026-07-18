"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Image as ImageIcon,
  Loader2,
  PanelsTopLeft,
  Target,
  Users,
} from "lucide-react";
import {
  DEFAULT_ABOUT_HERO,
  DEFAULT_ABOUT_MISSION_VISION,
  DEFAULT_ABOUT_TEAM_PREVIEW,
  DEFAULT_ABOUT_VALUES_SETTINGS,
  subscribeAboutHero,
  subscribeAboutMissionVision,
  subscribeAboutTeamPreview,
  subscribeAboutValuesSettings,
} from "./service/about.service";
import { formatDate } from "./components/AboutShared";

const ABOUT_SECTIONS = [
  {
    key: "hero",
    label: "Hero Section",
    description: "Eyebrow, heading, subtitle, and SEO copy for the About page banner.",
    icon: ImageIcon,
    subscribe: subscribeAboutHero,
    defaults: DEFAULT_ABOUT_HERO,
  },
  {
    key: "mission-vision",
    label: "Mission & Vision",
    description: "The mission statement block and vision statement block.",
    icon: Target,
    subscribe: subscribeAboutMissionVision,
    defaults: DEFAULT_ABOUT_MISSION_VISION,
  },
  {
    key: "values",
    label: "Values",
    description: "Section heading plus the value cards shown on the About page.",
    icon: Heart,
    subscribe: subscribeAboutValuesSettings,
    defaults: DEFAULT_ABOUT_VALUES_SETTINGS,
  },
  {
    key: "team-preview",
    label: "Team Preview",
    description: "Section heading for the team teaser (members live in the Team module).",
    icon: Users,
    subscribe: subscribeAboutTeamPreview,
    defaults: DEFAULT_ABOUT_TEAM_PREVIEW,
  },
];

export default function AnslicAboutPage() {
  const [sections, setSections] = useState(() =>
    ABOUT_SECTIONS.reduce((acc, section) => {
      acc[section.key] = section.defaults;
      return acc;
    }, {}),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ready = new Set();
    const unsubs = ABOUT_SECTIONS.map((section) =>
      section.subscribe(
        (data) => {
          ready.add(section.key);
          setSections((prev) => ({ ...prev, [section.key]: data }));
          if (ready.size === ABOUT_SECTIONS.length) setLoading(false);
        },
        () => {
          ready.add(section.key);
          if (ready.size === ABOUT_SECTIONS.length) setLoading(false);
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
              <PanelsTopLeft className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Anslic About</h1>
              <p className="text-sm text-gray-500">
                Manage the About page hero, mission &amp; vision, values, and team preview heading.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {ABOUT_SECTIONS.map((section) => {
            const Icon = section.icon;
            const data = sections[section.key] || section.defaults;
            return (
              <div key={section.key} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Component Name
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-gray-900">{section.label}</h2>
                      <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">{section.description}</p>
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
                  href={`/anslic/about/${section.key}`}
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
          <p className="mt-3 text-sm font-bold text-gray-900">projects / anslic / about</p>
          <p className="mt-2 text-xs font-semibold text-gray-500">
            hero, mission-vision, values, values/items, team-preview
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
