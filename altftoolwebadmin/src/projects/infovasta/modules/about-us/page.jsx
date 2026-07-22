"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, FileText, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_ABOUT_MAIN,
  DEFAULT_ABOUT_PAGE,
  createAboutStat,
  createAboutTimelineItem,
  createAboutValue,
  deleteAboutStat,
  deleteAboutTimelineItem,
  deleteAboutValue,
  saveAboutMain,
  saveAboutPage,
  subscribeAboutMain,
  subscribeAboutPage,
  subscribeAboutStats,
  subscribeAboutTimeline,
  subscribeAboutValues,
  toggleAboutStatStatus,
  toggleAboutTimelineItemStatus,
  toggleAboutValueStatus,
  updateAboutStat,
  updateAboutTimelineItem,
  updateAboutValue,
} from "./service/about.service";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass =
  "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMPTY_STAT = { label: "", value: 0, suffix: "", order: 0, active: true };
const EMPTY_VALUE = { title: "", icon: "", color: "", text: "", order: 0, active: true };
const EMPTY_TIMELINE = { year: "", title: "", text: "", order: 0, active: true };

function paragraphsToText(value) {
  return Array.isArray(value) ? value.join("\n\n") : String(value || "");
}

function nextOrder(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1;
}

export default function AboutUsPage() {
  const [main, setMain] = useState(DEFAULT_ABOUT_MAIN);
  const [page, setPage] = useState(DEFAULT_ABOUT_PAGE);
  const [stats, setStats] = useState([]);
  const [values, setValues] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statModal, setStatModal] = useState(null);
  const [valueModal, setValueModal] = useState(null);
  const [timelineModal, setTimelineModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubMain = subscribeAboutMain(
      (data) => {
        setMain(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load about main." });
        setLoading(false);
      },
    );
    const unsubPage = subscribeAboutPage(
      (data) => setPage(data),
      () => emitAlert({ type: "error", message: "Failed to load about page content." }),
    );
    const unsubStats = subscribeAboutStats(
      (items) => setStats(items),
      () => emitAlert({ type: "error", message: "Failed to load stats." }),
    );
    const unsubValues = subscribeAboutValues(
      (items) => setValues(items),
      () => emitAlert({ type: "error", message: "Failed to load values." }),
    );
    const unsubTimeline = subscribeAboutTimeline(
      (items) => setTimeline(items),
      () => emitAlert({ type: "error", message: "Failed to load timeline." }),
    );
    return () => {
      unsubMain();
      unsubPage();
      unsubStats();
      unsubValues();
      unsubTimeline();
    };
  }, []);

  const sortedStats = useMemo(
    () => [...stats].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
    [stats],
  );
  const sortedValues = useMemo(
    () => [...values].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
    [values],
  );
  const sortedTimeline = useMemo(
    () => [...timeline].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
    [timeline],
  );

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.kind === "stat") await deleteAboutStat(deleteTarget.item.id);
      if (deleteTarget.kind === "value") await deleteAboutValue(deleteTarget.item.id);
      if (deleteTarget.kind === "timeline") await deleteAboutTimelineItem(deleteTarget.item.id);
      emitAlert({ type: "success", message: "Item deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete item." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Infovasta About</h1>
            <p className="text-sm text-gray-500">Manage the about page mission/vision, page content, stats, values, and timeline.</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}</div>
        ) : (
          <>
            <MainCard main={main} setMain={setMain} />
            <PageContentCard page={page} setPage={setPage} />
            <StatsCard
              items={sortedStats}
              onAdd={() => setStatModal({ mode: "create", item: null })}
              onEdit={(item) => setStatModal({ mode: "edit", item })}
              onToggle={async (item) => {
                try {
                  await toggleAboutStatStatus(item.id, item.active === false);
                  emitAlert({ type: "success", message: "Stat status updated." });
                } catch (error) {
                  emitAlert({ type: "error", message: error?.message || "Failed to update status." });
                }
              }}
              onDelete={(item) => setDeleteTarget({ kind: "stat", item })}
            />
            <ValuesCard
              items={sortedValues}
              onAdd={() => setValueModal({ mode: "create", item: null })}
              onEdit={(item) => setValueModal({ mode: "edit", item })}
              onToggle={async (item) => {
                try {
                  await toggleAboutValueStatus(item.id, item.active === false);
                  emitAlert({ type: "success", message: "Value status updated." });
                } catch (error) {
                  emitAlert({ type: "error", message: error?.message || "Failed to update status." });
                }
              }}
              onDelete={(item) => setDeleteTarget({ kind: "value", item })}
            />
            <TimelineCard
              items={sortedTimeline}
              onAdd={() => setTimelineModal({ mode: "create", item: null })}
              onEdit={(item) => setTimelineModal({ mode: "edit", item })}
              onToggle={async (item) => {
                try {
                  await toggleAboutTimelineItemStatus(item.id, item.active === false);
                  emitAlert({ type: "success", message: "Timeline item status updated." });
                } catch (error) {
                  emitAlert({ type: "error", message: error?.message || "Failed to update status." });
                }
              }}
              onDelete={(item) => setDeleteTarget({ kind: "timeline", item })}
            />
          </>
        )}
      </div>

      {statModal ? <StatModal mode={statModal.mode} item={statModal.item} items={stats} onClose={() => setStatModal(null)} /> : null}
      {valueModal ? <ValueModal mode={valueModal.mode} item={valueModal.item} items={values} onClose={() => setValueModal(null)} /> : null}
      {timelineModal ? <TimelineModal mode={timelineModal.mode} item={timelineModal.item} items={timeline} onClose={() => setTimelineModal(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete item"
          message={`Delete "${deleteTarget.item.title || deleteTarget.item.label || deleteTarget.item.year}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

/* --------------------------------- main ------------------------------------ */

function MainCard({ main, setMain }) {
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setMain((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await saveAboutMain(main);
      emitAlert({ type: "success", message: "Mission & vision saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save mission & vision." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard eyebrow="Main" title="Mission & vision" onSave={save} saving={saving}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mission"><textarea value={main.mission || ""} onChange={(event) => setField("mission", event.target.value)} rows={5} className={textareaClass} /></Field>
        <Field label="Vision"><textarea value={main.vision || ""} onChange={(event) => setField("vision", event.target.value)} rows={5} className={textareaClass} /></Field>
      </div>
    </SectionCard>
  );
}

/* ------------------------------ page content -------------------------------- */

function PageContentCard({ page, setPage }) {
  const [saving, setSaving] = useState(false);
  const storyText = paragraphsToText(page.story?.paragraphs);

  function setField(key, value) {
    setPage((prev) => ({ ...prev, [key]: value }));
  }

  function setNested(section, key, value) {
    setPage((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  }

  function setStoryText(value) {
    setPage((prev) => ({ ...prev, story: { ...prev.story, paragraphs: value.split(/\n\s*\n/) } }));
  }

  async function save() {
    setSaving(true);
    try {
      await saveAboutPage(page);
      emitAlert({ type: "success", message: "Page content saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save page content." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard eyebrow="Page Content" title="About page (pages/about)" onSave={save} saving={saving}>
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Meta</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Meta Title"><input value={page.meta?.title || ""} onChange={(event) => setNested("meta", "title", event.target.value)} className={inputClass} /></Field>
            <Field label="Meta Description"><input value={page.meta?.description || ""} onChange={(event) => setNested("meta", "description", event.target.value)} className={inputClass} /></Field>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Hero</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Eyebrow"><input value={page.hero?.eyebrow || ""} onChange={(event) => setNested("hero", "eyebrow", event.target.value)} className={inputClass} /></Field>
            <Field label="Title"><input value={page.hero?.title || ""} onChange={(event) => setNested("hero", "title", event.target.value)} className={inputClass} /></Field>
            <Field label="Highlight"><input value={page.hero?.highlight || ""} onChange={(event) => setNested("hero", "highlight", event.target.value)} className={inputClass} /></Field>
          </div>
          <div className="mt-4">
            <Field label="Description"><textarea value={page.hero?.description || ""} onChange={(event) => setNested("hero", "description", event.target.value)} rows={2} className={textareaClass} /></Field>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Story</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow"><input value={page.story?.eyebrow || ""} onChange={(event) => setNested("story", "eyebrow", event.target.value)} className={inputClass} /></Field>
            <Field label="Heading"><input value={page.story?.heading || ""} onChange={(event) => setNested("story", "heading", event.target.value)} className={inputClass} /></Field>
            <Field label="Image URL"><input value={page.story?.image || ""} onChange={(event) => setNested("story", "image", event.target.value)} className={inputClass} /></Field>
            <Field label="Image Alt"><input value={page.story?.imageAlt || ""} onChange={(event) => setNested("story", "imageAlt", event.target.value)} className={inputClass} /></Field>
          </div>
          <div className="mt-4">
            <Field label="Paragraphs (separate each with a blank line)">
              <textarea value={storyText} onChange={(event) => setStoryText(event.target.value)} rows={8} className={textareaClass} placeholder={"First paragraph...\n\nSecond paragraph..."} />
            </Field>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Mission / Vision Labels</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mission Label"><input value={page.missionLabel || ""} onChange={(event) => setField("missionLabel", event.target.value)} className={inputClass} /></Field>
            <Field label="Mission Icon (Ionicons name)"><input value={page.missionIcon || ""} onChange={(event) => setField("missionIcon", event.target.value)} className={inputClass} placeholder="rocket-outline" /></Field>
            <Field label="Vision Label"><input value={page.visionLabel || ""} onChange={(event) => setField("visionLabel", event.target.value)} className={inputClass} /></Field>
            <Field label="Vision Icon (Ionicons name)"><input value={page.visionIcon || ""} onChange={(event) => setField("visionIcon", event.target.value)} className={inputClass} placeholder="eye-outline" /></Field>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Values Section Heading</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow"><input value={page.valuesSection?.eyebrow || ""} onChange={(event) => setNested("valuesSection", "eyebrow", event.target.value)} className={inputClass} /></Field>
            <Field label="Heading"><input value={page.valuesSection?.heading || ""} onChange={(event) => setNested("valuesSection", "heading", event.target.value)} className={inputClass} /></Field>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Timeline Section Heading</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow"><input value={page.timelineSection?.eyebrow || ""} onChange={(event) => setNested("timelineSection", "eyebrow", event.target.value)} className={inputClass} /></Field>
            <Field label="Heading"><input value={page.timelineSection?.heading || ""} onChange={(event) => setNested("timelineSection", "heading", event.target.value)} className={inputClass} /></Field>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Closing CTA</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Heading"><input value={page.cta?.heading || ""} onChange={(event) => setNested("cta", "heading", event.target.value)} className={inputClass} /></Field>
            <Field label="Button Label"><input value={page.cta?.label || ""} onChange={(event) => setNested("cta", "label", event.target.value)} className={inputClass} /></Field>
            <Field label="Button Href"><input value={page.cta?.href || ""} onChange={(event) => setNested("cta", "href", event.target.value)} className={inputClass} placeholder="/contact-us" /></Field>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* --------------------------------- stats ------------------------------------ */

function StatsCard({ items, onAdd, onEdit, onToggle, onDelete }) {
  return (
    <CollectionCard
      eyebrow="Stats"
      title={`${items.length} stats`}
      onAdd={onAdd}
      addLabel="Add Stat"
      columns={["Label", "Value", "Suffix", "Status", "Actions"]}
      gridCols="grid-cols-[1.4fr_100px_100px_90px_120px]"
      emptyText="No stats yet."
      rows={items.map((item) => (
        <div key={item.id} className="grid grid-cols-[1.4fr_100px_100px_90px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
          <p className="truncate font-bold text-gray-900">{item.label}</p>
          <span className="text-xs font-semibold text-gray-500">{item.value}</span>
          <span className="text-xs font-semibold text-gray-500">{item.suffix}</span>
          <StatusBadge active={item.active !== false} />
          <RowActions item={item} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    />
  );
}

function StatModal({ mode, item, items, onClose }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_STAT,
    ...item,
    order: Number(item?.order) || nextOrder(items),
    active: item?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function save() {
    const nextErrors = {};
    if (!form.label.trim()) nextErrors.label = "Label is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await updateAboutStat(item.id, form);
        emitAlert({ type: "success", message: "Stat updated." });
      } else {
        await createAboutStat(form);
        emitAlert({ type: "success", message: "Stat added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save stat." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={mode === "edit" ? "Edit Stat" : "Add Stat"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Label" error={errors.label}><input value={form.label} onChange={(event) => setField("label", event.target.value)} className={inputClass} /></Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Value"><input type="number" value={form.value} onChange={(event) => setField("value", event.target.value)} className={inputClass} /></Field>
          <Field label="Suffix"><input value={form.suffix} onChange={(event) => setField("suffix", event.target.value)} className={inputClass} placeholder="+" /></Field>
          <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
        </div>
        <StatusToggle active={form.active} onToggle={() => setField("active", !form.active)} />
      </div>
      <ModalFooter saving={saving} onCancel={onClose} onSave={save} mode={mode} />
    </ModalShell>
  );
}

/* --------------------------------- values ------------------------------------ */

function ValuesCard({ items, onAdd, onEdit, onToggle, onDelete }) {
  return (
    <CollectionCard
      eyebrow="Values"
      title={`${items.length} values`}
      onAdd={onAdd}
      addLabel="Add Value"
      columns={["Title", "Text", "Icon", "Status", "Actions"]}
      gridCols="grid-cols-[1fr_1.4fr_110px_90px_120px]"
      emptyText="No values yet."
      rows={items.map((item) => (
        <div key={item.id} className="grid grid-cols-[1fr_1.4fr_110px_90px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
          <p className="truncate font-bold text-gray-900">{item.title}</p>
          <p className="truncate text-xs font-semibold text-gray-500">{item.text}</p>
          <span className="truncate text-xs font-semibold text-gray-500">{item.icon}</span>
          <StatusBadge active={item.active !== false} />
          <RowActions item={item} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    />
  );
}

function ValueModal({ mode, item, items, onClose }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_VALUE,
    ...item,
    order: Number(item?.order) || nextOrder(items),
    active: item?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function save() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.text.trim()) nextErrors.text = "Text is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await updateAboutValue(item.id, form);
        emitAlert({ type: "success", message: "Value updated." });
      } else {
        await createAboutValue(form);
        emitAlert({ type: "success", message: "Value added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save value." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={mode === "edit" ? "Edit Value" : "Add Value"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Title" error={errors.title}><input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
        <Field label="Text" error={errors.text}><textarea value={form.text} onChange={(event) => setField("text", event.target.value)} rows={4} className={textareaClass} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Icon (Ionicons name)"><input value={form.icon} onChange={(event) => setField("icon", event.target.value)} className={inputClass} placeholder="analytics-sharp" /></Field>
          <Field label="Color (HSL triplet)"><input value={form.color} onChange={(event) => setField("color", event.target.value)} className={inputClass} placeholder="174, 77%, 50%" /></Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
          <StatusToggle active={form.active} onToggle={() => setField("active", !form.active)} />
        </div>
      </div>
      <ModalFooter saving={saving} onCancel={onClose} onSave={save} mode={mode} />
    </ModalShell>
  );
}

/* -------------------------------- timeline ------------------------------------ */

function TimelineCard({ items, onAdd, onEdit, onToggle, onDelete }) {
  return (
    <CollectionCard
      eyebrow="Timeline"
      title={`${items.length} milestones`}
      onAdd={onAdd}
      addLabel="Add Milestone"
      columns={["Year", "Title", "Text", "Status", "Actions"]}
      gridCols="grid-cols-[90px_1fr_1.4fr_90px_120px]"
      emptyText="No timeline milestones yet."
      rows={items.map((item) => (
        <div key={item.id} className="grid grid-cols-[90px_1fr_1.4fr_90px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
          <span className="text-xs font-bold text-gray-500">{item.year}</span>
          <p className="truncate font-bold text-gray-900">{item.title}</p>
          <p className="truncate text-xs font-semibold text-gray-500">{item.text}</p>
          <StatusBadge active={item.active !== false} />
          <RowActions item={item} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    />
  );
}

function TimelineModal({ mode, item, items, onClose }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_TIMELINE,
    ...item,
    order: Number(item?.order) || nextOrder(items),
    active: item?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function save() {
    const nextErrors = {};
    if (!form.year.trim()) nextErrors.year = "Year is required.";
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await updateAboutTimelineItem(item.id, form);
        emitAlert({ type: "success", message: "Timeline item updated." });
      } else {
        await createAboutTimelineItem(form);
        emitAlert({ type: "success", message: "Timeline item added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save timeline item." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={mode === "edit" ? "Edit Milestone" : "Add Milestone"} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Year" error={errors.year}><input value={form.year} onChange={(event) => setField("year", event.target.value)} className={inputClass} placeholder="2024" /></Field>
          <Field label="Title" error={errors.title}><input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} /></Field>
        </div>
        <Field label="Text"><textarea value={form.text} onChange={(event) => setField("text", event.target.value)} rows={4} className={textareaClass} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
          <StatusToggle active={form.active} onToggle={() => setField("active", !form.active)} />
        </div>
      </div>
      <ModalFooter saving={saving} onCancel={onClose} onSave={save} mode={mode} />
    </ModalShell>
  );
}

/* -------------------------------- shared UI --------------------------------- */

function SectionCard({ eyebrow, title, onSave, saving, disabled, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{eyebrow}</p>
          <h2 className="mt-1 text-base font-bold text-gray-900">{title}</h2>
        </div>
        <button onClick={onSave} disabled={saving || disabled} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function CollectionCard({ eyebrow, title, onAdd, addLabel, columns, gridCols, emptyText, rows }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{eyebrow}</p>
          <h2 className="mt-1 text-base font-bold text-gray-900">{title}</h2>
        </div>
        <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
        <div className="min-w-[680px]">
          <div className={`grid ${gridCols} bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400`}>
            {columns.map((column) => <span key={column}>{column}</span>)}
          </div>
          {rows.length ? rows : <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">{emptyText}</div>}
        </div>
      </div>
    </div>
  );
}

function RowActions({ item, onToggle, onEdit, onDelete }) {
  return (
    <div className="flex gap-2">
      <button onClick={() => onToggle(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
      <button onClick={() => onEdit(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
      <button onClick={() => onDelete(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{active ? "Active" : "Inactive"}</span>
  );
}

function StatusToggle({ active, onToggle }) {
  return (
    <Field label="Status">
      <button type="button" onClick={onToggle} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
        <span>{active ? "Active" : "Inactive"}</span>
        <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"}`} />
      </button>
    </Field>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Details</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ saving, onCancel, onSave, mode }) {
  return (
    <div className="mt-5 flex justify-end gap-3">
      <button onClick={onCancel} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
      <button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {mode === "edit" ? "Update" : "Add"}
      </button>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}
