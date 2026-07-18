"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Save, Search, Trash2, Wallet } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_PRICING_SETTINGS,
  EMPTY_PRICING_PLAN,
  createPricingPlan,
  deletePricingPlan,
  resetPricingSettings,
  savePricingSettings,
  subscribePricingPlans,
  subscribePricingSettings,
  togglePricingPlanStatus,
  updatePricingPlan,
} from "../service/partners.service";
import {
  ActionHeader,
  Field,
  ModalShell,
  Panel,
  StatCard,
  StatusBadge,
  StatusToggle,
  TableSkeletonRows,
  cardClass,
  formatDate,
  inputClass,
  outlineButtonClass,
  primaryButtonClass,
  selectClass,
  textareaClass,
} from "../components/PartnersAdminShared";

const ROUTE = "/infodrif/partners/pricing";

export default function InfodrifPartnersPricingPage() {
  const [saved, setSaved] = useState(DEFAULT_PRICING_SETTINGS);
  const [draft, setDraft] = useState(DEFAULT_PRICING_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsErrors, setSettingsErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalPlan, setModalPlan] = useState(null);
  const [planSaving, setPlanSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribePricingSettings(
      (data) => {
        setSaved(data);
        setDraft(data);
        setSettingsLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load pricing settings." });
        setSettingsLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    return subscribePricingPlans(
      (data) => {
        setPlans(data);
        setPlansLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load pricing plans." });
        setPlansLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  function setField(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSettingsErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function saveSettings() {
    const nextErrors = {};
    if (!draft.heading?.trim()) nextErrors.heading = "Heading is required.";
    if (!draft.paragraph?.trim()) nextErrors.paragraph = "Paragraph is required.";
    if (!draft.togglePrimaryLabel?.trim()) {
      nextErrors.togglePrimaryLabel = "Primary toggle label is required.";
    }
    if (!draft.toggleSecondaryLabel?.trim()) {
      nextErrors.toggleSecondaryLabel = "Secondary toggle label is required.";
    }
    setSettingsErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSettingsSaving(true);
    try {
      await savePricingSettings(draft);
      emitAlert({ type: "success", message: "Pricing settings saved." });
      logAuditEvent({
        module: "partners",
        action: "PARTNERS_PRICING_SETTINGS_UPDATE",
        entityType: "partnersPricingSettings",
        entityId: "pricing",
        summary: "Updated Infodrif partners pricing settings",
        changes: draft,
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save pricing settings." });
    } finally {
      setSettingsSaving(false);
    }
  }

  async function handleResetSettings() {
    setSettingsSaving(true);
    try {
      await resetPricingSettings();
      emitAlert({ type: "success", message: "Pricing settings reset." });
      logAuditEvent({
        module: "partners",
        action: "PARTNERS_PRICING_SETTINGS_RESET",
        entityType: "partnersPricingSettings",
        entityId: "pricing",
        summary: "Reset Infodrif partners pricing settings",
        route: ROUTE,
      });
      setConfirmReset(false);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Reset failed." });
    } finally {
      setSettingsSaving(false);
    }
  }

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [plans],
  );

  const filteredPlans = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return sortedPlans.filter((plan) => {
      const matchesSearch =
        !queryText ||
        [plan.name, plan.price].some((value) =>
          String(value || "").toLowerCase().includes(queryText),
        );
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? plan.active : !plan.active);
      return matchesSearch && matchesStatus;
    });
  }, [search, sortedPlans, statusFilter]);

  const activeCount = plans.filter((plan) => plan.active).length;
  const nextOrder = plans.length ? Math.max(...plans.map((plan) => Number(plan.order || 0))) + 1 : 0;

  async function handleSavePlan(form) {
    setPlanSaving(true);
    try {
      if (modalPlan?.id) {
        await updatePricingPlan(modalPlan.id, form);
        emitAlert({ type: "success", message: "Plan updated." });
        logAuditEvent({
          module: "partners",
          action: "PARTNERS_PRICING_PLAN_UPDATE",
          entityType: "partnersPricingPlan",
          entityId: modalPlan.id,
          summary: `Updated pricing plan ${form.name}`,
          changes: form,
          route: ROUTE,
        });
      } else {
        const id = await createPricingPlan(form);
        emitAlert({ type: "success", message: "Plan added." });
        logAuditEvent({
          module: "partners",
          action: "PARTNERS_PRICING_PLAN_CREATE",
          entityType: "partnersPricingPlan",
          entityId: id,
          summary: `Created pricing plan ${form.name}`,
          changes: form,
          route: ROUTE,
        });
      }
      setModalPlan(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save plan." });
    } finally {
      setPlanSaving(false);
    }
  }

  async function handleDeletePlan() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deletePricingPlan(deleteTarget.id);
      emitAlert({ type: "success", message: `"${deleteTarget.name}" deleted.` });
      logAuditEvent({
        module: "partners",
        action: "PARTNERS_PRICING_PLAN_DELETE",
        entityType: "partnersPricingPlan",
        entityId: deleteTarget.id,
        summary: `Deleted pricing plan ${deleteTarget.name}`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete plan." });
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleToggle(plan) {
    try {
      await togglePricingPlanStatus(plan.id, !plan.active);
      emitAlert({
        type: "success",
        message: `${plan.name} set to ${plan.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update plan status." });
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 pb-6">
      <ActionHeader
        title="Partners — Pricing"
        description="Edit the pricing intro copy, plan toggle labels, and the plan cards."
        lastUpdated={formatDate(saved.updatedAt)}
        dirty={dirty}
        saving={settingsSaving}
        onSave={saveSettings}
        onReset={() => setConfirmReset(true)}
      />

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-5">
        <Panel title="Pricing settings">
          {settingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-md bg-surface-soft" />
              ))}
            </div>
          ) : (
            <>
              <Field label="Heading" required error={settingsErrors.heading}>
                <input
                  value={draft.heading || ""}
                  onChange={(event) => setField("heading", event.target.value)}
                  className={inputClass}
                  placeholder="Pricing list"
                />
              </Field>

              <Field label="Paragraph" required error={settingsErrors.paragraph}>
                <textarea
                  rows={2}
                  value={draft.paragraph || ""}
                  onChange={(event) => setField("paragraph", event.target.value)}
                  className={textareaClass}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Toggle primary label"
                  required
                  error={settingsErrors.togglePrimaryLabel}
                >
                  <input
                    value={draft.togglePrimaryLabel || ""}
                    onChange={(event) => setField("togglePrimaryLabel", event.target.value)}
                    className={inputClass}
                    placeholder="Premium"
                  />
                </Field>
                <Field
                  label="Toggle secondary label"
                  required
                  error={settingsErrors.toggleSecondaryLabel}
                >
                  <input
                    value={draft.toggleSecondaryLabel || ""}
                    onChange={(event) => setField("toggleSecondaryLabel", event.target.value)}
                    className={inputClass}
                    placeholder="Starter"
                  />
                </Field>
                <Field
                  label="Default active plan"
                  hint="Must match a plan name below."
                  error={settingsErrors.defaultActivePlan}
                >
                  <input
                    value={draft.defaultActivePlan || ""}
                    onChange={(event) => setField("defaultActivePlan", event.target.value)}
                    className={inputClass}
                    placeholder="Premium"
                    list="infodrif-pricing-plan-names"
                  />
                  <datalist id="infodrif-pricing-plan-names">
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.name} />
                    ))}
                  </datalist>
                </Field>
              </div>
            </>
          )}
        </Panel>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Plans" value={plansLoading ? "-" : plans.length} />
          <StatCard label="Active" value={plansLoading ? "-" : activeCount} tone="success" />
          <StatCard
            label="Inactive"
            value={plansLoading ? "-" : plans.length - activeCount}
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
                placeholder="Search plans"
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
              {filteredPlans.length} of {plans.length} plans
            </span>
            <button
              type="button"
              onClick={() => setModalPlan({ ...EMPTY_PRICING_PLAN, order: nextOrder })}
              className={primaryButtonClass}
            >
              <Plus className="h-4 w-4" />
              Add Plan
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-soft text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Bullets</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {plansLoading ? (
                  <TableSkeletonRows columns={6} />
                ) : filteredPlans.length ? (
                  filteredPlans.map((plan) => (
                    <tr key={plan.id} className="transition hover:bg-surface-soft">
                      <td className="px-4 py-3 font-semibold text-foreground">{plan.order}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{plan.name}</td>
                      <td className="px-4 py-3 text-muted">{plan.price}</td>
                      <td className="max-w-sm px-4 py-3 text-muted">
                        <span className="line-clamp-2 text-xs">
                          {(plan.bullets || []).join(" · ") || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => handleToggle(plan)}>
                          <StatusBadge active={plan.active} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setModalPlan(plan)}
                            className="rounded-md p-2 text-primary transition hover:bg-primary-soft"
                            aria-label={`Edit ${plan.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(plan)}
                            className="rounded-md p-2 text-danger transition hover:bg-danger-soft"
                            aria-label={`Delete ${plan.name}`}
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
                      <Wallet className="mx-auto h-8 w-8 text-muted" />
                      <p className="mt-3 text-sm font-semibold text-foreground">No plans found</p>
                      <p className="mt-1 text-xs text-muted">Add the first Infodrif pricing plan.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalPlan ? (
        <PricingPlanModal
          plan={modalPlan.id ? modalPlan : null}
          defaults={modalPlan}
          saving={planSaving}
          onClose={() => setModalPlan(null)}
          onSave={handleSavePlan}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete pricing plan"
          message={`Delete the "${deleteTarget.name}" plan from the partners page?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDeletePlan}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset pricing settings"
          message="Reset the pricing intro copy and toggle labels back to defaults?"
          confirmText="Reset"
          loading={settingsSaving}
          onConfirm={handleResetSettings}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}

function PricingPlanModal({ plan, defaults, saving, onClose, onSave }) {
  const [form, setForm] = useState(() => {
    const base = plan || defaults || EMPTY_PRICING_PLAN;
    return {
      ...base,
      bullets: Array.isArray(base.bullets) && base.bullets.length ? base.bullets : [""],
    };
  });
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(plan?.id);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function updateBullet(index, value) {
    setForm((prev) => {
      const bullets = [...prev.bullets];
      bullets[index] = value;
      return { ...prev, bullets };
    });
    setErrors((prev) => ({ ...prev, bullets: "" }));
  }

  function addBullet() {
    setForm((prev) => ({ ...prev, bullets: [...prev.bullets, ""] }));
  }

  function removeBullet(index) {
    setForm((prev) => ({
      ...prev,
      bullets: prev.bullets.length > 1 ? prev.bullets.filter((_, i) => i !== index) : prev.bullets,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name?.trim()) nextErrors.name = "Name is required.";
    if (!form.price?.trim()) nextErrors.price = "Price is required.";
    if (!form.bullets.some((bullet) => bullet.trim())) {
      nextErrors.bullets = "At least one bullet is required.";
    }
    if (Number.isNaN(Number(form.order)) || Number(form.order) < 0) {
      nextErrors.order = "Order must be zero or higher.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave({ ...form, bullets: form.bullets.map((bullet) => bullet.trim()).filter(Boolean) });
  }

  return (
    <ModalShell
      eyebrow="Pricing plan"
      title={isEdit ? "Edit plan" : "Add plan"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <button type="button" onClick={onClose} className={outlineButtonClass}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className={primaryButtonClass}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? "Update plan" : "Add plan"}
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required error={errors.name}>
          <input
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={inputClass}
            placeholder="Premium"
          />
        </Field>
        <Field label="Price" required error={errors.price}>
          <input
            value={form.price}
            onChange={(event) => updateField("price", event.target.value)}
            className={inputClass}
            placeholder="$49.99"
          />
        </Field>
      </div>

      <Field label="Bullets" required error={errors.bullets}>
        <div className="space-y-2">
          {form.bullets.map((bullet, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={bullet}
                onChange={(event) => updateBullet(index, event.target.value)}
                className={inputClass}
                placeholder={`Bullet ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeBullet(index)}
                disabled={form.bullets.length === 1}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border text-danger transition hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Remove bullet ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addBullet}
          className="mt-2 inline-flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs font-semibold text-muted transition hover:bg-surface-soft hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add bullet
        </button>
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
