"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers, Loader2, Pencil, Plus, Save, Search, Trash2 } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  EMPTY_SERVICE_FEATURE_CARD,
  SERVICE_FEATURE_ICON_IDS,
  createServiceFeatureCard,
  deleteServiceFeatureCard,
  subscribeServiceFeatureCards,
  toggleServiceFeatureCardStatus,
  updateServiceFeatureCard,
} from "../service/partners.service";
import {
  ActionHeader,
  Field,
  ModalShell,
  StatCard,
  StatusBadge,
  StatusToggle,
  TableSkeletonRows,
  cardClass,
  inputClass,
  outlineButtonClass,
  primaryButtonClass,
  selectClass,
  textareaClass,
} from "../components/PartnersAdminShared";

const ROUTE = "/infodrif/partners/service-features";

export default function InfodrifPartnersServiceFeaturesPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalCard, setModalCard] = useState(null);
  const [cardSaving, setCardSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeServiceFeatureCards(
      (data) => {
        setCards(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load service feature cards." });
        setLoading(false);
      },
    );
  }, []);

  const sortedCards = useMemo(
    () => [...cards].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [cards],
  );

  const filteredCards = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return sortedCards.filter((card) => {
      const matchesSearch =
        !queryText ||
        [card.title, card.description, card.iconId].some((value) =>
          String(value || "").toLowerCase().includes(queryText),
        );
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? card.active : !card.active);
      return matchesSearch && matchesStatus;
    });
  }, [search, sortedCards, statusFilter]);

  const activeCount = cards.filter((card) => card.active).length;
  const nextOrder = cards.length ? Math.max(...cards.map((card) => Number(card.order || 0))) + 1 : 0;

  async function handleSaveCard(form) {
    setCardSaving(true);
    try {
      if (modalCard?.id) {
        await updateServiceFeatureCard(modalCard.id, form);
        emitAlert({ type: "success", message: "Service feature card updated." });
        logAuditEvent({
          module: "partners",
          action: "PARTNERS_SERVICE_FEATURE_UPDATE",
          entityType: "partnersServiceFeatureCard",
          entityId: modalCard.id,
          summary: `Updated service feature card ${form.title}`,
          changes: form,
          route: ROUTE,
        });
      } else {
        const id = await createServiceFeatureCard(form);
        emitAlert({ type: "success", message: "Service feature card added." });
        logAuditEvent({
          module: "partners",
          action: "PARTNERS_SERVICE_FEATURE_CREATE",
          entityType: "partnersServiceFeatureCard",
          entityId: id,
          summary: `Created service feature card ${form.title}`,
          changes: form,
          route: ROUTE,
        });
      }
      setModalCard(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save card." });
    } finally {
      setCardSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteServiceFeatureCard(deleteTarget.id);
      emitAlert({ type: "success", message: `"${deleteTarget.title}" deleted.` });
      logAuditEvent({
        module: "partners",
        action: "PARTNERS_SERVICE_FEATURE_DELETE",
        entityType: "partnersServiceFeatureCard",
        entityId: deleteTarget.id,
        summary: `Deleted service feature card ${deleteTarget.title}`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete card." });
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleToggle(card) {
    try {
      await toggleServiceFeatureCardStatus(card.id, !card.active);
      emitAlert({
        type: "success",
        message: `${card.title} set to ${card.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update card status." });
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 pb-6">
      <ActionHeader
        title="Partners — Service Features"
        description="Manage the four icon cards shown below the partners hero."
      />

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Cards" value={loading ? "-" : cards.length} />
          <StatCard label="Active" value={loading ? "-" : activeCount} tone="success" />
          <StatCard
            label="Inactive"
            value={loading ? "-" : cards.length - activeCount}
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
                placeholder="Search cards"
                className="w-48 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={selectClass}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="ml-auto text-xs font-medium text-muted">
              {filteredCards.length} of {cards.length} cards
            </span>
            <button
              type="button"
              onClick={() => setModalCard({ ...EMPTY_SERVICE_FEATURE_CARD, order: nextOrder })}
              className={primaryButtonClass}
            >
              <Plus className="h-4 w-4" />
              Add Card
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-soft text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Icon ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <TableSkeletonRows columns={6} />
                ) : filteredCards.length ? (
                  filteredCards.map((card) => (
                    <tr key={card.id} className="transition hover:bg-surface-soft">
                      <td className="px-4 py-3 font-semibold text-foreground">{card.order}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-primary-soft px-2 py-1 font-mono text-xs font-semibold text-primary">
                          {card.iconId}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">{card.title}</td>
                      <td className="max-w-sm px-4 py-3 text-muted">
                        <span className="line-clamp-2 text-xs">{card.description}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => handleToggle(card)}>
                          <StatusBadge active={card.active} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setModalCard(card)}
                            className="rounded-md p-2 text-primary transition hover:bg-primary-soft"
                            aria-label={`Edit ${card.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(card)}
                            className="rounded-md p-2 text-danger transition hover:bg-danger-soft"
                            aria-label={`Delete ${card.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center">
                      <Layers className="mx-auto h-8 w-8 text-muted" />
                      <p className="mt-3 text-sm font-semibold text-foreground">No cards found</p>
                      <p className="mt-1 text-xs text-muted">
                        Add the first Infodrif service feature card.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalCard ? (
        <ServiceFeatureCardModal
          card={modalCard.id ? modalCard : null}
          nextOrder={modalCard.order ?? nextOrder}
          saving={cardSaving}
          onClose={() => setModalCard(null)}
          onSave={handleSaveCard}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete service feature card"
          message={`Delete "${deleteTarget.title}" from the partners page?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function ServiceFeatureCardModal({ card, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(card || { ...EMPTY_SERVICE_FEATURE_CARD, order: nextOrder });
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(card?.id);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.title?.trim()) nextErrors.title = "Title is required.";
    if (!form.description?.trim()) nextErrors.description = "Description is required.";
    if (!form.iconId?.trim()) nextErrors.iconId = "Icon id is required.";
    if (Number.isNaN(Number(form.order)) || Number(form.order) < 0) {
      nextErrors.order = "Order must be zero or higher.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form);
  }

  return (
    <ModalShell
      eyebrow="Service feature card"
      title={isEdit ? "Edit card" : "Add card"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <button type="button" onClick={onClose} className={outlineButtonClass}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className={primaryButtonClass}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? "Update card" : "Add card"}
          </button>
        </>
      }
    >
      <Field label="Title" required error={errors.title}>
        <input
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          className={inputClass}
          placeholder="Easy management"
        />
      </Field>

      <Field label="Description" required error={errors.description}>
        <textarea
          rows={3}
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          className={textareaClass}
          placeholder="Pelentesque facilisis. Nulla imperdiet sit amet magna."
        />
      </Field>

      <Field
        label="Icon ID"
        required
        error={errors.iconId}
        hint="Ties the card to its inline SVG gradient on the public site (fc1–fc4). Editable, but keep it to one of the known ids."
      >
        <select
          value={form.iconId}
          onChange={(event) => updateField("iconId", event.target.value)}
          className={`${selectClass} w-full`}
        >
          {SERVICE_FEATURE_ICON_IDS.map((iconId) => (
            <option key={iconId} value={iconId}>
              {iconId}
            </option>
          ))}
          {SERVICE_FEATURE_ICON_IDS.includes(form.iconId) ? null : (
            <option value={form.iconId}>{form.iconId} (custom)</option>
          )}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Order" error={errors.order}>
          <input
            type="number"
            min="0"
            value={form.order}
            onChange={(event) => updateField("order", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Status">
          <StatusToggle active={form.active} onToggle={() => updateField("active", !form.active)} />
        </Field>
      </div>
    </ModalShell>
  );
}
