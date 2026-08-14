"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Camera, Video } from "lucide-react";
import {
  DEFAULT_SPEC,
  normaliseSpec,
  recommendRoute,
  specToQuery,
} from "@altftool/core/persona/compose";
import { buildPlan, buildShotList } from "@altftool/core/persona/plan";
import {
  NICHES,
  PILLARS,
  PLATFORMS,
  PRODUCTION_ROUTES,
} from "@altftool/core/persona/taxonomy";
import MonthGrid from "../_components/MonthGrid";
import { RouteChip, Stamp } from "../_components/Shell";

/*
 * The planner runs on a spec, so it accepts one from the studio through the
 * query string. Without one it plans against the default persona rather than
 * showing an empty state — a planner that demands you go somewhere else first
 * is a planner nobody uses.
 */
export default function PlaybookClient({ initialSpec }) {
  const [spec, setSpec] = useState(() => normaliseSpec(initialSpec || DEFAULT_SPEC));
  const [routeOverride, setRouteOverride] = useState("auto");

  const set = (key, value) =>
    setSpec((current) => normaliseSpec({ ...current, [key]: value }));

  const togglePillar = (id) =>
    setSpec((current) => {
      const has = current.pillars.includes(id);
      const pillars = has
        ? current.pillars.filter((entry) => entry !== id)
        : [...current.pillars, id].slice(0, 5);
      return normaliseSpec({ ...current, pillars });
    });

  const recommended = useMemo(() => recommendRoute(spec), [spec]);
  const route = useMemo(
    () =>
      routeOverride === "auto"
        ? recommended
        : { id: routeOverride, route: PRODUCTION_ROUTES.find((r) => r.id === routeOverride) },
    [routeOverride, recommended],
  );

  const plan = useMemo(() => buildPlan(spec, { route }), [spec, route]);
  const shotList = useMemo(() => buildShotList(plan), [plan]);
  const studioHref = useMemo(() => `/persona/studio?${specToQuery(spec)}`, [spec]);

  return (
    <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-8 sm:px-6 lg:px-8">
      {/* ------------------------------ Controls -------------------------- */}
      <div className="psn-sheet rounded-xl p-5">
        <div className="grid gap-5 lg:grid-cols-3">
          <Control label="Niche">
            <select
              value={spec.niche}
              onChange={(event) => set("niche", event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {NICHES.map((niche) => (
                <option key={niche.slug} value={niche.slug}>
                  {niche.label}
                </option>
              ))}
            </select>
          </Control>

          <Control label="Platform" hint={`${plan.platform.cadencePerWeek} posts a week`}>
            <select
              value={spec.platform}
              onChange={(event) => set("platform", event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {PLATFORMS.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.label}
                </option>
              ))}
            </select>
          </Control>

          <Control
            label="Production route"
            hint={
              routeOverride === "auto"
                ? `Recommended: ${recommended.route.label}`
                : "Overriding the recommendation"
            }
          >
            <select
              value={routeOverride}
              onChange={(event) => setRouteOverride(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="auto">Auto — use the recommendation</option>
              {PRODUCTION_ROUTES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </Control>
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <Stamp className="mb-2">
            Content pillars — {spec.pillars.length}/5. Empty uses the niche defaults.
          </Stamp>
          <div className="flex flex-wrap gap-1.5">
            {PILLARS.map((pillar) => (
              <button
                key={pillar.id}
                type="button"
                aria-pressed={spec.pillars.includes(pillar.id)}
                onClick={() => togglePillar(pillar.id)}
                className="psn-option rounded-full px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {pillar.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------ Summary --------------------------- */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Posts", value: plan.summary.posts, note: `${plan.summary.restDays} rest days` },
          { label: "Video / still", value: `${plan.summary.videos} / ${plan.summary.stills}` },
          { label: "Distinct setups", value: plan.summary.distinctShots, note: "batch these" },
          {
            label: "Production time",
            value: `${Math.round(plan.summary.productionMinutes / 60)}h`,
            note: plan.summary.setupMinutes
              ? `plus ${plan.summary.setupMinutes} min one-off setup`
              : "no setup needed",
          },
        ].map((item) => (
          <div key={item.label} className="psn-sheet rounded-xl p-4">
            <Stamp>{item.label}</Stamp>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {item.value}
            </p>
            {item.note ? (
              <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <RouteChip route={plan.route} size="lg" />
        <p className="text-sm text-muted-foreground">{plan.route.blurb}</p>
        <Link
          href={studioHref}
          prefetch={false}
          className="ml-auto text-sm font-semibold"
          style={{ color: "var(--psn-accent-text)" }}
        >
          Edit this persona in the studio →
        </Link>
      </div>

      <MonthGrid plan={plan} className="mt-8" />

      {/* ------------------------------- Weeks ---------------------------- */}
      <div className="mt-10 space-y-10">
        {plan.weeks.map((week) => (
          <section key={week.index}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Week {week.index} — {week.title}
              </h2>
              <span className="psn-stamp">{week.posts} posts</span>
            </div>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
              {week.goal}
            </p>

            <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
              {week.days
                .filter((day) => !day.rest)
                .map((day) => {
                  const Icon = day.kind === "video" ? Video : Camera;
                  return (
                    <div
                      key={day.day}
                      className="grid gap-2 bg-background p-4 sm:grid-cols-[4rem_1fr_11rem]"
                    >
                      <div className="psn-seed text-xs text-muted-foreground">
                        Day {day.day}
                      </div>
                      <div>
                        <p className="text-[15px] font-medium text-foreground">
                          {day.hook}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {day.pillar.label} · {day.pillar.blurb}
                        </p>
                      </div>
                      <div className="text-sm sm:text-right">
                        <Link
                          href={`/persona/shots/${day.shot?.slug}`}
                          prefetch={false}
                          className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline"
                        >
                          <Icon
                            className={`h-3.5 w-3.5 psn-kind-${day.kind}`}
                            aria-hidden="true"
                          />
                          {day.shot?.title}
                        </Link>
                        <p className="psn-seed mt-0.5 text-xs text-muted-foreground">
                          {day.format} · ~{day.effortMinutes}m
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        ))}
      </div>

      {/* ----------------------------- Shot list -------------------------- */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Batch the month by setup
        </h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          Batching is the entire operational advantage of a synthetic persona and
          almost nobody uses it, because their calendar is organised by date. Set
          up once per row, generate everything that row needs, move on.
        </p>

        <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {shotList.map((row) => (
            <div
              key={row.shot.slug}
              className="grid gap-2 bg-background p-4 sm:grid-cols-[1fr_auto]"
            >
              <div>
                <Link
                  href={`/persona/shots/${row.shot.slug}`}
                  prefetch={false}
                  className="font-medium text-foreground hover:underline"
                >
                  {row.shot.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {row.shot.framing}
                </p>
              </div>
              <div className="psn-seed shrink-0 text-xs text-muted-foreground sm:text-right">
                ×{row.count}
                <span className="block">days {row.days.join(", ")}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Control({ label, hint, children }) {
  return (
    <div>
      <label className="block">
        <span className="psn-stamp mb-2 block">{label}</span>
        {children}
      </label>
      {hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
