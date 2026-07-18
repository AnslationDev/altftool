"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Link2,
  PanelBottom,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  Field,
  IconButton,
  ModalShell,
  PageHeader,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatCard,
  StatusBadge,
  TableEmptyState,
  TableSkeletonRows,
  inputClass,
  isSafeUrl,
  textareaClass,
} from "../../components/ui";
import {
  DEFAULT_FOOTER_SETTINGS,
  FOOTER_LINK_GROUPS,
  FOOTER_SOCIAL_ICONS,
  createFooterLink,
  deleteFooterLink,
  saveFooterSettings,
  subscribeFooterLinks,
  subscribeFooterSettings,
  toggleFooterLinkStatus,
  updateFooterLink,
} from "./service/footer.service";

const ROUTE = "/infodrif/footer";

const EMPTY_LINK = {
  title: "",
  url: "",
  group: "company",
  icon: "",
  order: 0,
  active: true,
};

const GROUP_LABELS = Object.fromEntries(
  FOOTER_LINK_GROUPS.map((group) => [group.value, group.label]),
);

/**
 * Settings fields, in the order they appear in the public footer. The `key` of
 * each entry is the Firestore field name and must stay identical to the site's
 * `src/data/footer.json` settings keys.
 */
const SETTINGS_SECTIONS = [
  {
    title: "Brand",
    fields: [
      { key: "logoInitials", label: "Logo initials", placeholder: "ID" },
      { key: "logoText", label: "Logo text", placeholder: "InfoDrift" },
      { key: "blurb", label: "Brand blurb", type: "textarea", full: true },
      { key: "tagline", label: "Tagline", full: true },
    ],
  },
  {
    title: "Contact",
    fields: [
      { key: "address", label: "Address", placeholder: "Gurugram, Haryana" },
      { key: "mapsUrl", label: "Google Maps URL", placeholder: "https://…" },
      { key: "email", label: "Email", type: "email", placeholder: "hello@infodrift.com" },
      { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
    ],
  },
  {
    title: "Column headings",
    fields: [
      { key: "companyHeading", label: "Company heading", placeholder: "Company" },
      { key: "topicsHeading", label: "Topics heading", placeholder: "Topics" },
    ],
  },
  {
    title: "Connect",
    fields: [
      { key: "connectHeading", label: "Connect heading", placeholder: "Let's Connect" },
      { key: "connectCtaLabel", label: "Connect CTA label", placeholder: "Start a conversation" },
      { key: "connectBlurb", label: "Connect blurb", type: "textarea", full: true },
    ],
  },
  {
    title: "Legal",
    fields: [{ key: "copyright", label: "Copyright", full: true }],
  },
];

function GroupBadge({ group }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
      {GROUP_LABELS[group] || group}
    </span>
  );
}

function LinkModal({ link, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(link || { ...EMPTY_LINK, order: nextOrder });
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(link?.id);
  const isSocial = form.group === "social";

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateLink(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave({ ...form, icon: form.group === "social" ? form.icon : "" });
  };

  return (
    <ModalShell
      eyebrow="Footer link"
      title={isEdit ? "Edit footer link" : "Add footer link"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" loading={saving} icon={Save} disabled={saving}>
            {isEdit ? "Update link" : "Add link"}
          </PrimaryButton>
        </>
      }
    >
      <Field label="Group" hint="Which footer column this link belongs to.">
        <select
          value={form.group}
          onChange={(event) => updateField("group", event.target.value)}
          className={inputClass}
        >
          {FOOTER_LINK_GROUPS.map((group) => (
            <option key={group.value} value={group.value}>
              {group.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Link title" error={errors.title}>
        <input
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          className={inputClass}
          placeholder={isSocial ? "LinkedIn" : "About Us"}
        />
      </Field>

      <Field label="Link URL" error={errors.url}>
        <input
          value={form.url}
          onChange={(event) => updateField("url", event.target.value)}
          className={inputClass}
          placeholder={isSocial ? "https://www.linkedin.com" : "/about"}
        />
      </Field>

      {isSocial ? (
        <Field label="Icon" error={errors.icon} hint="Only social links render an icon.">
          <select
            value={form.icon || ""}
            onChange={(event) => updateField("icon", event.target.value)}
            className={inputClass}
          >
            <option value="">Select an icon…</option>
            {FOOTER_SOCIAL_ICONS.map((icon) => (
              <option key={icon.value} value={icon.value}>
                {icon.label}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

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
          <button
            type="button"
            onClick={() => updateField("active", !form.active)}
            aria-pressed={form.active}
            className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] ${
              form.active
                ? "border-[color-mix(in_srgb,var(--success)_35%,var(--border))] bg-[var(--success-soft)] text-[var(--success)]"
                : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]"
            }`}
          >
            <span>{form.active ? "Active" : "Inactive"}</span>
            <span className="h-2.5 w-2.5 rounded-full bg-current" />
          </button>
        </Field>
      </div>
    </ModalShell>
  );
}

export default function InfodrifFooterPage() {
  const [settings, setSettings] = useState(DEFAULT_FOOTER_SETTINGS);
  const [settingsDraft, setSettingsDraft] = useState(DEFAULT_FOOTER_SETTINGS);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [linkSaving, setLinkSaving] = useState(false);
  const [settingsErrors, setSettingsErrors] = useState({});
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalLink, setModalLink] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let settingsReady = false;
    let linksReady = false;

    const markReady = () => {
      if (settingsReady && linksReady) setLoading(false);
    };

    const unsubSettings = subscribeFooterSettings(
      (data) => {
        settingsReady = true;
        setSettings(data);
        setSettingsDraft(data);
        markReady();
      },
      () => {
        settingsReady = true;
        emitAlert({ type: "error", message: "Failed to load footer settings" });
        markReady();
      },
    );

    const unsubLinks = subscribeFooterLinks(
      (data) => {
        linksReady = true;
        setLinks(data);
        markReady();
      },
      () => {
        linksReady = true;
        emitAlert({ type: "error", message: "Failed to load footer links" });
        markReady();
      },
    );

    return () => {
      unsubSettings();
      unsubLinks();
    };
  }, []);

  const sortedLinks = useMemo(
    () =>
      [...links].sort(
        (a, b) =>
          String(a.group || "").localeCompare(String(b.group || "")) ||
          Number(a.order || 0) - Number(b.order || 0),
      ),
    [links],
  );

  const filteredLinks = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return sortedLinks.filter((link) => {
      const matchesSearch =
        !queryText ||
        link.title?.toLowerCase().includes(queryText) ||
        link.url?.toLowerCase().includes(queryText);
      const matchesGroup = groupFilter === "all" || link.group === groupFilter;
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? link.active : !link.active);
      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [groupFilter, search, sortedLinks, statusFilter]);

  const activeCount = links.filter((link) => link.active).length;

  const nextOrderForGroup = (group) => {
    const groupLinks = links.filter((link) => link.group === group);
    return groupLinks.length
      ? Math.max(...groupLinks.map((link) => Number(link.order || 0))) + 1
      : 0;
  };

  const updateSettingsDraft = (key, value) => {
    setSettingsDraft((prev) => ({ ...prev, [key]: value }));
    setSettingsErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSaveSettings = async () => {
    const errors = validateSettings(settingsDraft);
    setSettingsErrors(errors);
    if (Object.keys(errors).length) return;

    setSettingsSaving(true);
    try {
      await saveFooterSettings(settingsDraft);
      emitAlert({ type: "success", message: "Footer settings saved." });
      logAuditEvent({
        module: "footer",
        action: "FOOTER_SETTINGS_UPDATE",
        entityType: "footerSettings",
        entityId: "settings",
        summary: "Updated Infodrif footer settings",
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save settings." });
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleSaveLink = async (form) => {
    setLinkSaving(true);
    try {
      if (modalLink?.id) {
        await updateFooterLink(modalLink.id, form);
        emitAlert({ type: "success", message: "Footer link updated." });
        logAuditEvent({
          module: "footer",
          action: "FOOTER_LINK_UPDATE",
          entityType: "footerLink",
          entityId: modalLink.id,
          summary: `Updated footer link ${form.title} (${form.group})`,
          changes: form,
          route: ROUTE,
        });
      } else {
        await createFooterLink(form);
        emitAlert({ type: "success", message: "Footer link added." });
        logAuditEvent({
          module: "footer",
          action: "FOOTER_LINK_CREATE",
          entityType: "footerLink",
          summary: `Created footer link ${form.title} (${form.group})`,
          changes: form,
          route: ROUTE,
        });
      }
      setModalLink(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save footer link." });
    } finally {
      setLinkSaving(false);
    }
  };

  const handleDeleteLink = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteFooterLink(deleteTarget.id);
      emitAlert({ type: "success", message: `"${deleteTarget.title}" deleted.` });
      logAuditEvent({
        module: "footer",
        action: "FOOTER_LINK_DELETE",
        entityType: "footerLink",
        entityId: deleteTarget.id,
        summary: `Deleted footer link ${deleteTarget.title} (${deleteTarget.group})`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete footer link." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (link) => {
    try {
      await toggleFooterLinkStatus(link.id, !link.active);
      emitAlert({
        type: "success",
        message: `${link.title} set to ${link.active ? "inactive" : "active"}.`,
      });
      logAuditEvent({
        module: "footer",
        action: "FOOTER_LINK_UPDATE",
        entityType: "footerLink",
        entityId: link.id,
        summary: `Set footer link ${link.title} to ${link.active ? "inactive" : "active"}`,
        route: ROUTE,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update link status." });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <PageHeader
          icon={PanelBottom}
          title="Infodrif Footer"
          description="Manage footer copy, contact details, and every link column."
          actions={
            <PrimaryButton
              icon={Plus}
              onClick={() =>
                setModalLink({
                  ...EMPTY_LINK,
                  group: groupFilter === "all" ? "company" : groupFilter,
                  order: nextOrderForGroup(groupFilter === "all" ? "company" : groupFilter),
                })
              }
            >
              Add Footer Link
            </PrimaryButton>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Links" value={loading ? "-" : links.length} />
          <StatCard label="Active Links" value={loading ? "-" : activeCount} tone="success" />
          <StatCard
            label="Link Groups"
            value={loading ? "-" : new Set(links.map((link) => link.group)).size}
            tone="warning"
          />
        </div>

        <Panel
          eyebrow="Footer content"
          title="Copy & contact details"
          actions={
            <SecondaryButton
              icon={RefreshCw}
              onClick={() => setSettingsDraft(settings)}
              className="h-9 px-3 text-xs"
            >
              Reset
            </SecondaryButton>
          }
        >
          <div className="space-y-6">
            {SETTINGS_SECTIONS.map((section) => (
              <div key={section.title}>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                  {section.title}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {section.fields.map((field) => (
                    <div key={field.key} className={field.full ? "sm:col-span-2" : ""}>
                      <Field label={field.label} error={settingsErrors[field.key]}>
                        {field.type === "textarea" ? (
                          <textarea
                            rows={3}
                            value={settingsDraft[field.key] ?? ""}
                            onChange={(event) => updateSettingsDraft(field.key, event.target.value)}
                            className={textareaClass}
                            placeholder={field.placeholder}
                          />
                        ) : (
                          <input
                            type={field.type || "text"}
                            value={settingsDraft[field.key] ?? ""}
                            onChange={(event) => updateSettingsDraft(field.key, event.target.value)}
                            className={inputClass}
                            placeholder={field.placeholder}
                          />
                        )}
                      </Field>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <PrimaryButton
              onClick={handleSaveSettings}
              loading={settingsSaving}
              icon={Save}
              disabled={settingsSaving}
            >
              Save Footer Settings
            </PrimaryButton>
          </div>
        </Panel>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search footer links"
                aria-label="Search footer links"
                className={`${inputClass} w-56 pl-8`}
              />
            </div>
            <select
              value={groupFilter}
              onChange={(event) => setGroupFilter(event.target.value)}
              aria-label="Filter by group"
              className={`${inputClass} w-auto`}
            >
              <option value="all">All groups</option>
              {FOOTER_LINK_GROUPS.map((group) => (
                <option key={group.value} value={group.value}>
                  {group.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              className={`${inputClass} w-auto`}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="ml-auto text-xs font-medium text-[var(--muted)]">
              {filteredLinks.length} of {links.length} links
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                  <th className="px-4 py-3">Group</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">URL</th>
                  <th className="px-4 py-3">Icon</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <TableSkeletonRows colSpan={7} />
                ) : filteredLinks.length ? (
                  filteredLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-[var(--surface-soft)]">
                      <td className="px-4 py-3">
                        <GroupBadge group={link.group} />
                      </td>
                      <td className="px-4 py-3 font-semibold text-[var(--muted)]">{link.order}</td>
                      <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                        {link.title}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-[var(--surface-soft)] px-2 py-1 text-xs font-medium text-[var(--muted)]">
                          {link.url}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-[var(--muted)]">
                        {link.icon || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(link)}
                          aria-label={`Toggle ${link.title} status`}
                          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
                        >
                          <StatusBadge active={link.active} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <IconButton
                            icon={Pencil}
                            tone="primary"
                            onClick={() => setModalLink(link)}
                            aria-label={`Edit ${link.title}`}
                          />
                          <IconButton
                            icon={Trash2}
                            tone="danger"
                            onClick={() => setDeleteTarget(link)}
                            aria-label={`Delete ${link.title}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <TableEmptyState
                    icon={Link2}
                    title="No footer links found"
                    description="Add company, topic, social, or legal links for the Infodrif footer."
                    colSpan={7}
                  />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalLink ? (
        <LinkModal
          link={modalLink.id ? modalLink : null}
          nextOrder={modalLink.order ?? 0}
          saving={linkSaving}
          onClose={() => setModalLink(null)}
          onSave={handleSaveLink}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete footer link"
          message={`Delete "${deleteTarget.title}" from the Infodrif footer?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDeleteLink}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function validateSettings(values) {
  const errors = {};
  if (!values.logoText?.trim()) {
    errors.logoText = "Logo text is required.";
  }
  if (!values.logoInitials?.trim()) {
    errors.logoInitials = "Logo initials are required.";
  }
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (values.mapsUrl && !isSafeUrl(values.mapsUrl)) {
    errors.mapsUrl = "Use a valid http/https URL.";
  }
  return errors;
}

function validateLink(values) {
  const errors = {};
  if (!values.title?.trim()) {
    errors.title = "Title is required.";
  }
  if (!values.url?.trim()) {
    errors.url = "URL is required.";
  } else if (!isSafeUrl(values.url)) {
    errors.url = "Use a relative path or a valid http/https URL.";
  }
  if (values.group === "social" && !values.icon) {
    errors.icon = "Pick an icon for social links.";
  }
  if (Number.isNaN(Number(values.order)) || Number(values.order) < 0) {
    errors.order = "Order must be zero or higher.";
  }
  return errors;
}
