"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_OFFERS_SETTINGS,
  deleteOffer,
  saveOffersSettings,
  subscribeOffers,
  subscribeOffersSettings,
  toggleOfferStatus,
} from "./service/offers.service";

const ROUTE = "/infodrif/offers";

const inputClass =
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:shadow-[var(--focus-ring)]";
const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-sm)] transition hover:opacity-90 disabled:opacity-60";
const cardClass = "rounded-lg border border-border bg-surface shadow-[var(--shadow-sm)]";

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

function StatCard({ label, value, tone = "muted" }) {
  const toneClass = {
    muted: "bg-surface-soft text-foreground",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
  }[tone];

  return (
    <div className={`${cardClass} p-4`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</p>
      <p className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-xl font-bold ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-success-soft text-success ring-1 ring-[color-mix(in_srgb,var(--success)_35%,transparent)]"
          : "bg-surface-soft text-muted ring-1 ring-border"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-success" : "bg-[var(--muted)]"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function InfodrifOffersPage() {
  const [settings, setSettings] = useState(DEFAULT_OFFERS_SETTINGS);
  const [draft, setDraft] = useState(DEFAULT_OFFERS_SETTINGS);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubSettings = subscribeOffersSettings(
      (data) => {
        setSettings(data);
        setDraft(data);
      },
      () => emitAlert({ type: "error", message: "Failed to load offers settings." }),
    );

    const unsubOffers = subscribeOffers(
      (data) => {
        setOffers(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load offers." });
        setLoading(false);
      },
    );

    return () => {
      unsubSettings();
      unsubOffers();
    };
  }, []);

  const sortedOffers = useMemo(
    () => [...offers].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [offers],
  );

  const filteredOffers = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return sortedOffers.filter((offer) => {
      const matchesSearch =
        !queryText ||
        [offer.name, offer.category, offer.slug, offer.commissionType].some((value) =>
          String(value || "").toLowerCase().includes(queryText),
        );
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? offer.active : !offer.active);
      return matchesSearch && matchesStatus;
    });
  }, [search, sortedOffers, statusFilter]);

  const activeCount = offers.filter((offer) => offer.active).length;

  function setField(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveSettings() {
    setSettingsSaving(true);
    try {
      await saveOffersSettings(draft);
      emitAlert({ type: "success", message: "Offers settings saved." });
      logAuditEvent({
        module: "offers",
        action: "OFFERS_SETTINGS_UPDATE",
        entityType: "offersSettings",
        entityId: "settings",
        summary: "Updated Infodrif offers page copy",
        changes: draft,
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save offers settings." });
    } finally {
      setSettingsSaving(false);
    }
  }

  async function handleToggle(offer) {
    try {
      await toggleOfferStatus(offer.id, !offer.active);
      emitAlert({
        type: "success",
        message: `${offer.name} set to ${offer.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update offer status." });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteOffer(deleteTarget.id);
      emitAlert({ type: "success", message: `"${deleteTarget.name}" deleted.` });
      logAuditEvent({
        module: "offers",
        action: "OFFER_DELETE",
        entityType: "offerItem",
        entityId: deleteTarget.id,
        summary: `Deleted offer ${deleteTarget.name}`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete offer." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-sm)]">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Infodrif Offers</h1>
              <p className="text-sm text-muted">
                Manage offer page copy and the published affiliate offers.
              </p>
            </div>
          </div>
          <Link href={`${ROUTE}/add-offer`} className={primaryButtonClass}>
            <Plus className="h-4 w-4" />
            Add Offer
          </Link>
        </div>

        <section className={`${cardClass} p-5`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                Page copy
              </p>
              <h2 className="mt-1 text-base font-bold text-foreground">
                Offer page labels &amp; CTAs
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setDraft(settings)}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted transition hover:bg-surface-soft hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Highlights heading">
              <input
                value={draft.highlightsHeading || ""}
                onChange={(event) => setField("highlightsHeading", event.target.value)}
                className={inputClass}
                placeholder="Highlights"
              />
            </Field>
            <Field label="FAQ heading">
              <input
                value={draft.faqHeading || ""}
                onChange={(event) => setField("faqHeading", event.target.value)}
                className={inputClass}
                placeholder="FAQ"
              />
            </Field>
            <Field label="Payout label">
              <input
                value={draft.payoutLabel || ""}
                onChange={(event) => setField("payoutLabel", event.target.value)}
                className={inputClass}
                placeholder="Payout:"
              />
            </Field>
            <Field label="Cookie label">
              <input
                value={draft.cookieLabel || ""}
                onChange={(event) => setField("cookieLabel", event.target.value)}
                className={inputClass}
                placeholder="Cookie:"
              />
            </Field>
            <Field label="Primary CTA label">
              <input
                value={draft.primaryCtaLabel || ""}
                onChange={(event) => setField("primaryCtaLabel", event.target.value)}
                className={inputClass}
                placeholder="Get affiliate"
              />
            </Field>
            <Field label="Primary CTA href">
              <input
                value={draft.primaryCtaHref || ""}
                onChange={(event) => setField("primaryCtaHref", event.target.value)}
                className={inputClass}
                placeholder="#"
              />
            </Field>
            <Field label="Secondary CTA label">
              <input
                value={draft.secondaryCtaLabel || ""}
                onChange={(event) => setField("secondaryCtaLabel", event.target.value)}
                className={inputClass}
                placeholder="Become a partner"
              />
            </Field>
            <Field label="Secondary CTA href">
              <input
                value={draft.secondaryCtaHref || ""}
                onChange={(event) => setField("secondaryCtaHref", event.target.value)}
                className={inputClass}
                placeholder="/partners"
              />
            </Field>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={settingsSaving}
              className={primaryButtonClass}
            >
              {settingsSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Offer Settings
            </button>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Offers" value={loading ? "-" : offers.length} />
          <StatCard label="Active" value={loading ? "-" : activeCount} tone="success" />
          <StatCard
            label="Inactive"
            value={loading ? "-" : offers.length - activeCount}
            tone="warning"
          />
        </div>

        <div className={cardClass}>
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-surface-soft px-3">
              <Search className="h-4 w-4 text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search offers"
                className="w-56 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:shadow-[var(--focus-ring)]"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="ml-auto text-xs font-medium text-muted">
              {filteredOffers.length} of {offers.length} offers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-soft text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Payout</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Cookie</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={8} className="px-4 py-3">
                        <div className="h-9 animate-pulse rounded-md bg-surface-soft" />
                      </td>
                    </tr>
                  ))
                ) : filteredOffers.length ? (
                  filteredOffers.map((offer) => (
                    <tr key={offer.id} className="transition hover:bg-surface-soft">
                      <td className="px-4 py-3 font-semibold text-foreground">{offer.order}</td>
                      <td className="max-w-[260px] px-4 py-3">
                        <p className="font-semibold text-foreground">{offer.name}</p>
                        <p className="truncate text-xs text-muted">/{offer.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">{offer.category || "-"}</td>
                      <td className="px-4 py-3 text-muted">{offer.payout || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">
                          {offer.commissionType || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">{offer.cookie || "-"}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => handleToggle(offer)}>
                          <StatusBadge active={offer.active} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`${ROUTE}/edit-offer/${encodeURIComponent(offer.id)}`}
                            className="rounded-md p-2 text-primary transition hover:bg-primary-soft"
                            aria-label={`Edit ${offer.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(offer)}
                            className="rounded-md p-2 text-danger transition hover:bg-danger-soft"
                            aria-label={`Delete ${offer.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-14 text-center">
                      <Tag className="mx-auto h-8 w-8 text-muted" />
                      <p className="mt-3 text-sm font-semibold text-foreground">No offers found</p>
                      <p className="mt-1 text-xs text-muted">Add the first Infodrif offer.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete offer"
          message={`Delete "${deleteTarget.name}" from the Infodrif offers?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}
