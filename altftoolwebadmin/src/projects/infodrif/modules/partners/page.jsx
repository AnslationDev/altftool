"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Handshake,
  Layers,
  Loader2,
  Sparkles,
  Tag,
  Wallet,
} from "lucide-react";
import {
  PARTNERS_SECTIONS,
  subscribeFeatureItems,
  subscribeFeaturesSettings,
  subscribePartnersHero,
  subscribePricingPlans,
  subscribePricingSettings,
  subscribeServiceFeatureCards,
} from "./service/partners.service";
import { cardClass, eyebrowClass, formatDate } from "./components/PartnersAdminShared";

const ICONS = {
  hero: Sparkles,
  "service-features": Layers,
  features: Tag,
  pricing: Wallet,
};

export default function InfodrifPartnersPage() {
  const [updatedAt, setUpdatedAt] = useState({});
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ready = new Set();
    const markReady = (key) => {
      ready.add(key);
      if (ready.size === 4) setLoading(false);
    };
    const stamp = (key) => (data) => {
      setUpdatedAt((prev) => ({ ...prev, [key]: data?.updatedAt }));
      markReady(key);
    };
    const count = (key) => (items) => {
      setCounts((prev) => ({ ...prev, [key]: items.length }));
    };
    const fail = (key) => () => markReady(key);

    const unsubs = [
      subscribePartnersHero(stamp("hero"), fail("hero")),
      subscribeFeaturesSettings(stamp("features"), fail("features")),
      subscribePricingSettings(stamp("pricing"), fail("pricing")),
      subscribeServiceFeatureCards(
        (items) => {
          count("service-features")(items);
          markReady("service-features");
        },
        fail("service-features"),
      ),
      subscribeFeatureItems(count("features"), () => {}),
      subscribePricingPlans(count("pricing"), () => {}),
    ];

    return () => unsubs.forEach((unsubscribe) => unsubscribe());
  }, []);

  const ITEM_LABELS = {
    "service-features": "cards",
    features: "items",
    pricing: "plans",
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-sm)]">
            <Handshake className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Infodrif Partners Page</h1>
            <p className="text-sm text-muted">
              Manage every section of the Infodrif partners page from one hub.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {PARTNERS_SECTIONS.map((section) => {
            const Icon = ICONS[section.key] || Sparkles;
            const itemLabel = ITEM_LABELS[section.key];
            return (
              <div key={section.key} className={`${cardClass} p-5`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className={eyebrowClass}>Section</p>
                      <h2 className="mt-1 text-lg font-bold text-foreground">{section.label}</h2>
                      <p className="mt-2 max-w-lg text-sm leading-6 text-muted">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted" /> : null}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Metric
                    label={itemLabel ? `Published ${itemLabel}` : "Content"}
                    value={
                      itemLabel
                        ? counts[section.key] === undefined
                          ? "-"
                          : String(counts[section.key])
                        : "Settings only"
                    }
                  />
                  <Metric label="Last Updated" value={formatDate(updatedAt[section.key])} />
                </div>

                <Link
                  href={section.route}
                  className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Edit {section.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className={`${cardClass} p-5`}>
          <p className={eyebrowClass}>Firestore Flow</p>
          <p className="mt-3 text-sm font-semibold text-foreground">projects / infodrif / partners</p>
          <p className="mt-2 text-xs font-medium text-muted">
            hero · service-features (+ cards) · features (+ items) · pricing (+ plans)
          </p>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-border bg-surface-soft p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-2 inline-flex rounded-md bg-surface px-2.5 py-1 text-sm font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}
