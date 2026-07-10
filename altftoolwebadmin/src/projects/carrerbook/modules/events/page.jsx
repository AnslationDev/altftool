"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Clock,
  Copy,
  Eye,
  GripVertical,
  Image as ImageIcon,
  Info,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_EVENTS_PAGE,
  deleteEventImage,
  resetEventsPage,
  saveEventsPage,
  subscribeEventsPage,
  uploadEventImage,
} from "./service/events.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const TABS = [
  { key: "hero", label: "Hero Section", icon: Sparkles },
  { key: "info", label: "Hero Info Card", icon: Info },
  { key: "cards", label: "Event Cards", icon: CalendarDays },
  { key: "modal", label: "Event Detail Modal", icon: Eye },
  { key: "status", label: "Status / Preview", icon: BadgeCheck },
];

export default function CareerBookEventsAdminPage() {
  const [activeTab, setActiveTab] = useState("hero");
  const [draft, setDraft] = useState(DEFAULT_EVENTS_PAGE);
  const [saved, setSaved] = useState(DEFAULT_EVENTS_PAGE);
  const [selectedEventId, setSelectedEventId] = useState(DEFAULT_EVENTS_PAGE.events[0]?.id || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [resetOpen, setResetOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeEventsPage(
      (data) => {
        setDraft(data);
        setSaved(data);
        setSelectedEventId((current) => (data.events.some((item) => item.id === current) ? current : data.events[0]?.id || ""));
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load Events page content." });
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const selectedEvent = draft.events.find((item) => item.id === selectedEventId) || draft.events[0] || null;
  const activeLabel = TABS.find((tab) => tab.key === activeTab)?.label || "Events Section";

  function setHeroField(key, value) {
    setDraft((prev) => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
    setErrors((prev) => ({ ...prev, [`hero.${key}`]: "" }));
  }

  function setInfoField(key, value) {
    setDraft((prev) => ({ ...prev, heroInfoCard: { ...prev.heroInfoCard, [key]: value } }));
    setErrors((prev) => ({ ...prev, [`heroInfoCard.${key}`]: "" }));
  }

  function updateInfoChip(id, key, value) {
    setDraft((prev) => ({
      ...prev,
      heroInfoCard: {
        ...prev.heroInfoCard,
        chips: prev.heroInfoCard.chips.map((chip) => (chip.id === id ? { ...chip, [key]: key === "sortOrder" ? Number(value) || 0 : value } : chip)),
      },
    }));
  }

  function addInfoChip() {
    setDraft((prev) => ({
      ...prev,
      heroInfoCard: {
        ...prev.heroInfoCard,
        chips: [...prev.heroInfoCard.chips, { id: `chip-${Date.now()}`, label: "", active: true, sortOrder: prev.heroInfoCard.chips.length + 1 }],
      },
    }));
  }

  function deleteInfoChip(id) {
    setDraft((prev) => ({ ...prev, heroInfoCard: { ...prev.heroInfoCard, chips: prev.heroInfoCard.chips.filter((chip) => chip.id !== id) } }));
  }

  function updateEvent(id, key, value) {
    setDraft((prev) => ({
      ...prev,
      events: prev.events.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, [key]: key === "sortOrder" ? Number(value) || 0 : value };
        if (key === "slug") next.slug = slugify(value);
        if (key === "title" && !item.slug) next.slug = slugify(value);
        return next;
      }),
    }));
    setErrors((prev) => ({ ...prev, [`${id}.${key}`]: "" }));
  }

  function addEvent() {
    const id = `event-${Date.now()}`;
    const nextOrder = draft.events.reduce((max, item) => Math.max(max, Number(item.sortOrder) || 0), 0) + 1;
    const nextEvent = {
      ...DEFAULT_EVENTS_PAGE.events[0],
      id,
      title: "New CareerBook Event",
      slug: `new-careerbook-event-${nextOrder}`,
      sortOrder: nextOrder,
      imageUrl: "",
      imagePath: "",
      modalBadges: [],
      highlights: [],
    };
    setDraft((prev) => ({ ...prev, events: [...prev.events, nextEvent] }));
    setSelectedEventId(id);
    setActiveTab("cards");
  }

  function duplicateEvent(item) {
    if (!item) return;
    const id = `event-${Date.now()}`;
    const nextOrder = draft.events.reduce((max, event) => Math.max(max, Number(event.sortOrder) || 0), 0) + 1;
    setDraft((prev) => ({
      ...prev,
      events: [...prev.events, { ...item, id, title: `${item.title} Copy`, slug: `${item.slug || "event"}-copy`, sortOrder: nextOrder }],
    }));
    setSelectedEventId(id);
  }

  function deleteEvent(id) {
    setDraft((prev) => {
      const nextEvents = prev.events.filter((item) => item.id !== id);
      setSelectedEventId(nextEvents[0]?.id || "");
      return { ...prev, events: nextEvents };
    });
  }

  function updateEventList(id, listKey, itemId, key, value) {
    setDraft((prev) => ({
      ...prev,
      events: prev.events.map((event) =>
        event.id === id
          ? { ...event, [listKey]: (event[listKey] || []).map((item) => (item.id === itemId ? { ...item, [key]: key === "sortOrder" ? Number(value) || 0 : value } : item)) }
          : event,
      ),
    }));
  }

  function addEventListItem(id, listKey, textKey) {
    setDraft((prev) => ({
      ...prev,
      events: prev.events.map((event) =>
        event.id === id
          ? { ...event, [listKey]: [...(event[listKey] || []), { id: `${listKey}-${Date.now()}`, [textKey]: "", active: true, sortOrder: (event[listKey] || []).length + 1 }] }
          : event,
      ),
    }));
  }

  function deleteEventListItem(id, listKey, itemId) {
    setDraft((prev) => ({
      ...prev,
      events: prev.events.map((event) => (event.id === id ? { ...event, [listKey]: (event[listKey] || []).filter((item) => item.id !== itemId) } : event)),
    }));
  }

  async function handleUpload(eventId, file) {
    if (!file) return;
    setUploadingId(eventId);
    setUploadProgress(0);
    try {
      const current = draft.events.find((item) => item.id === eventId);
      const uploaded = await uploadEventImage({ file, onProgress: setUploadProgress });
      if (current?.imagePath) await deleteEventImage(current.imagePath).catch(() => {});
      updateEvent(eventId, "imageUrl", uploaded.url);
      updateEvent(eventId, "imagePath", uploaded.path);
      emitAlert({ type: "success", message: "Event image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploadingId("");
      setUploadProgress(0);
    }
  }

  async function removeImage(eventId) {
    const current = draft.events.find((item) => item.id === eventId);
    if (current?.imagePath) await deleteEventImage(current.imagePath).catch(() => {});
    updateEvent(eventId, "imageUrl", "");
    updateEvent(eventId, "imagePath", "");
  }

  function resetForm() {
    setDraft(saved);
    setErrors({});
  }

  async function handleSave() {
    const nextErrors = validateEventsPage(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      emitAlert({ type: "error", message: "Please fix the highlighted Events fields." });
      return;
    }
    setSaving(true);
    try {
      await saveEventsPage(draft);
      emitAlert({ type: "success", message: "Events page saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save Events page." });
    } finally {
      setSaving(false);
    }
  }

  async function handleResetDefaults() {
    setResetLoading(true);
    try {
      await resetEventsPage();
      emitAlert({ type: "success", message: "Events page reset to defaults." });
      setResetOpen(false);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Reset failed." });
    } finally {
      setResetLoading(false);
    }
  }

  const editor =
    activeTab === "hero" ? (
      <HeroEditor draft={draft} errors={errors} setDraft={setDraft} setHeroField={setHeroField} />
    ) : activeTab === "info" ? (
      <HeroInfoEditor data={draft.heroInfoCard} errors={errors} setInfoField={setInfoField} updateChip={updateInfoChip} addChip={addInfoChip} deleteChip={deleteInfoChip} />
    ) : activeTab === "cards" ? (
      <EventCardsEditor events={draft.events} selectedEvent={selectedEvent} setSelectedEventId={setSelectedEventId} updateEvent={updateEvent} addEvent={addEvent} duplicateEvent={duplicateEvent} deleteEvent={deleteEvent} handleUpload={handleUpload} removeImage={removeImage} uploadingId={uploadingId} uploadProgress={uploadProgress} errors={errors} />
    ) : activeTab === "modal" ? (
      <EventModalEditor events={draft.events} selectedEvent={selectedEvent} setSelectedEventId={setSelectedEventId} updateEvent={updateEvent} updateEventList={updateEventList} addEventListItem={addEventListItem} deleteEventListItem={deleteEventListItem} errors={errors} />
    ) : (
      <StatusEditor draft={draft} setDraft={setDraft} dirty={dirty} />
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CareerBook Events Page</h1>
              <p className="text-sm text-gray-500">Manage Events & Product Showcases content from Firebase.</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving || loading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Section
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isActive ? "border-teal-700 bg-teal-700 text-white" : "border-gray-200 bg-white text-gray-900"}`}>
                <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${isActive ? "bg-white/10" : "bg-gray-100"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="block text-sm font-bold">{tab.label}</span>
                <span className={`mt-3 inline-flex rounded-lg px-2 py-1 text-xs font-bold ${draft.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {draft.active ? "Active" : "Inactive"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Status</p>
              <p className="mt-1 text-sm font-semibold text-gray-700">{dirty ? "Unsaved changes" : "All changes saved"}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={resetForm} disabled={!dirty} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                <RefreshCw className="h-4 w-4" /> Reset Form
              </button>
              <button onClick={() => setResetOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Reset Defaults
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{activeLabel}</p>
              <h2 className="mt-1 text-base font-bold text-gray-900">Section edit form</h2>
            </div>
            {loading ? <div className="space-y-3">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />)}</div> : editor}
          </section>

          <section className="space-y-4">
            <p className="text-sm font-bold text-gray-700">Live preview</p>
            <EventsLivePreview data={draft} selectedEvent={selectedEvent} />
          </section>
        </div>
      </div>

      {resetOpen ? <DeleteConfirmModal title="Reset Events Page" message="Reset the Events page back to default content?" loading={resetLoading} onConfirm={handleResetDefaults} onCancel={() => setResetOpen(false)} /> : null}
    </div>
  );
}

function HeroEditor({ draft, errors, setDraft, setHeroField }) {
  return (
    <div className="space-y-4">
      <Field label="Eyebrow"><input value={draft.hero.eyebrow} onChange={(event) => setHeroField("eyebrow", event.target.value)} className={inputClass} /></Field>
      <Field label="Heading" error={errors["hero.heading"]}><input value={draft.hero.heading} onChange={(event) => setHeroField("heading", event.target.value)} className={inputClass} /></Field>
      <Field label="Subtitle" error={errors["hero.subtitle"]}><textarea value={draft.hero.subtitle} onChange={(event) => setHeroField("subtitle", event.target.value)} rows={5} className={textareaClass} /></Field>
      <button onClick={() => setDraft((prev) => ({ ...prev, active: !prev.active }))} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${draft.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
        <span>{draft.active ? "Events page active" : "Events page inactive"}</span>
        <span className={`h-2.5 w-2.5 rounded-full ${draft.active ? "bg-emerald-500" : "bg-gray-400"}`} />
      </button>
    </div>
  );
}

function HeroInfoEditor({ data, errors, setInfoField, updateChip, addChip, deleteChip }) {
  return (
    <div className="space-y-4">
      <button onClick={() => setInfoField("active", !data.active)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${data.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
        <span>{data.active ? "Hero info card active" : "Hero info card inactive"}</span>
        <span className={`h-2.5 w-2.5 rounded-full ${data.active ? "bg-emerald-500" : "bg-gray-400"}`} />
      </button>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Eyebrow"><input value={data.eyebrow} onChange={(event) => setInfoField("eyebrow", event.target.value)} className={inputClass} /></Field>
        <Field label="CTA Label"><input value={data.ctaLabel} onChange={(event) => setInfoField("ctaLabel", event.target.value)} className={inputClass} /></Field>
      </div>
      <Field label="Title" error={errors["heroInfoCard.title"]}><input value={data.title} onChange={(event) => setInfoField("title", event.target.value)} className={inputClass} /></Field>
      <Field label="Description" error={errors["heroInfoCard.description"]}><textarea value={data.description} onChange={(event) => setInfoField("description", event.target.value)} rows={4} className={textareaClass} /></Field>
      <Field label="CTA Link"><input value={data.ctaLink} onChange={(event) => setInfoField("ctaLink", event.target.value)} className={inputClass} /></Field>
      <Repeater title="Hero chips" items={data.chips} textKey="label" placeholder="Chip label" onAdd={addChip} onUpdate={updateChip} onDelete={deleteChip} />
    </div>
  );
}

function EventCardsEditor({ events, selectedEvent, setSelectedEventId, updateEvent, addEvent, duplicateEvent, deleteEvent, handleUpload, removeImage, uploadingId, uploadProgress, errors }) {
  return (
    <div className="space-y-4">
      <EventSelector events={events} selectedEvent={selectedEvent} setSelectedEventId={setSelectedEventId} addEvent={addEvent} duplicateEvent={duplicateEvent} deleteEvent={deleteEvent} />
      {selectedEvent ? (
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <button onClick={() => updateEvent(selectedEvent.id, "active", !selectedEvent.active)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${selectedEvent.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white text-gray-500"}`}>
            <span>{selectedEvent.active ? "Event active" : "Event inactive"}</span>
            <span className={`h-2.5 w-2.5 rounded-full ${selectedEvent.active ? "bg-emerald-500" : "bg-gray-400"}`} />
          </button>
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <Field label="Title" error={errors[`${selectedEvent.id}.title`]}><input value={selectedEvent.title} onChange={(event) => updateEvent(selectedEvent.id, "title", event.target.value)} className={inputClass} /></Field>
            <Field label="Sort Order"><input type="number" value={selectedEvent.sortOrder} onChange={(event) => updateEvent(selectedEvent.id, "sortOrder", event.target.value)} className={inputClass} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug"><input value={selectedEvent.slug} onChange={(event) => updateEvent(selectedEvent.id, "slug", event.target.value)} className={inputClass} /></Field>
            <Field label="Top Image Badge"><input value={selectedEvent.topImageBadge} onChange={(event) => updateEvent(selectedEvent.id, "topImageBadge", event.target.value)} className={inputClass} /></Field>
            <Field label="Category"><input value={selectedEvent.category} onChange={(event) => updateEvent(selectedEvent.id, "category", event.target.value)} className={inputClass} /></Field>
            <Field label="Secondary Tag"><input value={selectedEvent.secondaryTag} onChange={(event) => updateEvent(selectedEvent.id, "secondaryTag", event.target.value)} className={inputClass} /></Field>
          </div>
          <ImageUploader event={selectedEvent} uploading={uploadingId === selectedEvent.id} uploadProgress={uploadProgress} handleUpload={handleUpload} removeImage={removeImage} updateEvent={updateEvent} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Date"><input value={selectedEvent.dateValue} onChange={(event) => updateEvent(selectedEvent.id, "dateValue", event.target.value)} className={inputClass} /></Field>
            <Field label="Time"><input value={selectedEvent.timeValue} onChange={(event) => updateEvent(selectedEvent.id, "timeValue", event.target.value)} className={inputClass} /></Field>
            <Field label="Location"><input value={selectedEvent.locationValue} onChange={(event) => updateEvent(selectedEvent.id, "locationValue", event.target.value)} className={inputClass} /></Field>
          </div>
          <Field label="Short Description" error={errors[`${selectedEvent.id}.description`]}><textarea value={selectedEvent.description} onChange={(event) => updateEvent(selectedEvent.id, "description", event.target.value)} rows={4} className={textareaClass} /></Field>
          <Field label="Product Focus" error={errors[`${selectedEvent.id}.productFocus`]}><textarea value={selectedEvent.productFocus} onChange={(event) => updateEvent(selectedEvent.id, "productFocus", event.target.value)} rows={3} className={textareaClass} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Organizer"><input value={selectedEvent.organizerValue} onChange={(event) => updateEvent(selectedEvent.id, "organizerValue", event.target.value)} className={inputClass} /></Field>
            <Field label="Button Label"><input value={selectedEvent.buttonLabel} onChange={(event) => updateEvent(selectedEvent.id, "buttonLabel", event.target.value)} className={inputClass} /></Field>
          </div>
        </div>
      ) : <EmptyState />}
    </div>
  );
}

function EventModalEditor({ events, selectedEvent, setSelectedEventId, updateEvent, updateEventList, addEventListItem, deleteEventListItem, errors }) {
  return (
    <div className="space-y-4">
      <EventSelector events={events} selectedEvent={selectedEvent} setSelectedEventId={setSelectedEventId} />
      {selectedEvent ? (
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <Field label="Modal Title" error={errors[`${selectedEvent.id}.modalTitle`]}><input value={selectedEvent.modalTitle} onChange={(event) => updateEvent(selectedEvent.id, "modalTitle", event.target.value)} className={inputClass} /></Field>
          <Field label="Modal Subtitle" error={errors[`${selectedEvent.id}.modalSubtitle`]}><textarea value={selectedEvent.modalSubtitle} onChange={(event) => updateEvent(selectedEvent.id, "modalSubtitle", event.target.value)} rows={3} className={textareaClass} /></Field>
          <Repeater title="Modal badges" items={selectedEvent.modalBadges} textKey="label" placeholder="Badge label" onAdd={() => addEventListItem(selectedEvent.id, "modalBadges", "label")} onUpdate={(itemId, key, value) => updateEventList(selectedEvent.id, "modalBadges", itemId, key, value)} onDelete={(itemId) => deleteEventListItem(selectedEvent.id, "modalBadges", itemId)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product Card Title"><input value={selectedEvent.modalProductTitle} onChange={(event) => updateEvent(selectedEvent.id, "modalProductTitle", event.target.value)} className={inputClass} /></Field>
            <Field label="Why Card Title"><input value={selectedEvent.modalWhyTitle} onChange={(event) => updateEvent(selectedEvent.id, "modalWhyTitle", event.target.value)} className={inputClass} /></Field>
          </div>
          <Field label="Product Card Description"><textarea value={selectedEvent.modalProductDescription} onChange={(event) => updateEvent(selectedEvent.id, "modalProductDescription", event.target.value)} rows={3} className={textareaClass} /></Field>
          <Field label="Why Card Description"><textarea value={selectedEvent.modalWhyDescription} onChange={(event) => updateEvent(selectedEvent.id, "modalWhyDescription", event.target.value)} rows={3} className={textareaClass} /></Field>
          <Field label="Audience Title"><input value={selectedEvent.modalAudienceTitle} onChange={(event) => updateEvent(selectedEvent.id, "modalAudienceTitle", event.target.value)} className={inputClass} /></Field>
          <Field label="Audience Description"><textarea value={selectedEvent.modalAudienceDescription} onChange={(event) => updateEvent(selectedEvent.id, "modalAudienceDescription", event.target.value)} rows={3} className={textareaClass} /></Field>
          <Repeater title="Modal highlights" items={selectedEvent.highlights} textKey="text" placeholder="Highlight text" onAdd={() => addEventListItem(selectedEvent.id, "highlights", "text")} onUpdate={(itemId, key, value) => updateEventList(selectedEvent.id, "highlights", itemId, key, value)} onDelete={(itemId) => deleteEventListItem(selectedEvent.id, "highlights", itemId)} />
        </div>
      ) : <EmptyState />}
    </div>
  );
}

function EventSelector({ events, selectedEvent, setSelectedEventId, addEvent, duplicateEvent, deleteEvent }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-widest text-gray-400">Events</p><h3 className="mt-1 text-sm font-bold text-gray-900">{events.length} event cards</h3></div>
        {addEvent ? <button onClick={addEvent} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"><Plus className="h-4 w-4" /> Add Event</button> : null}
      </div>
      <div className="grid gap-2">
        {[...events].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)).map((event) => (
          <button key={event.id} onClick={() => setSelectedEventId(event.id)} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm ${selectedEvent?.id === event.id ? "border-teal-700 bg-teal-50 text-teal-900" : "border-gray-200 bg-white text-gray-700"}`}>
            <span className="min-w-0 truncate font-semibold">{event.title || "Untitled event"}</span>
            <span className={`shrink-0 rounded-lg px-2 py-1 text-xs font-bold ${event.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{event.active ? "Active" : "Inactive"}</span>
          </button>
        ))}
      </div>
      {selectedEvent && duplicateEvent ? (
        <div className="mt-3 flex gap-2">
          <button onClick={() => duplicateEvent(selectedEvent)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"><Copy className="h-4 w-4" /> Duplicate</button>
          <button onClick={() => deleteEvent(selectedEvent.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Delete</button>
        </div>
      ) : null}
    </div>
  );
}

function ImageUploader({ event, uploading, uploadProgress, handleUpload, removeImage, updateEvent }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-widest text-gray-400">Event Image</p><p className="mt-1 text-sm font-semibold text-gray-700">{event.imageUrl ? "Image connected" : "Gradient placeholder will show until upload"}</p></div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {uploading ? `${uploadProgress}%` : "Upload"}
          <input type="file" accept="image/*" className="hidden" onChange={(changeEvent) => handleUpload(event.id, changeEvent.target.files?.[0])} />
        </label>
      </div>
      {event.imageUrl ? <img src={event.imageUrl} alt={event.imageAlt || event.title} className="mt-4 h-44 w-full rounded-xl object-cover" /> : <div className="mt-4 flex h-44 items-center justify-center rounded-xl bg-[radial-gradient(circle_at_top,#4b2aa0,#120b2e)] text-white"><ImageIcon className="h-8 w-8" /></div>}
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input value={event.imageAlt} onChange={(changeEvent) => updateEvent(event.id, "imageAlt", changeEvent.target.value)} className={inputClass} placeholder="Image alt text" />
        <button onClick={() => removeImage(event.id)} disabled={!event.imageUrl} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Remove</button>
      </div>
    </div>
  );
}

function StatusEditor({ draft, setDraft, dirty }) {
  const activeEvents = draft.events.filter((event) => event.active !== false).length;
  return (
    <div className="space-y-4">
      <button onClick={() => setDraft((prev) => ({ ...prev, active: !prev.active }))} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${draft.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
        <span>{draft.active ? "Events page active" : "Events page inactive"}</span>
        <span className={`h-2.5 w-2.5 rounded-full ${draft.active ? "bg-emerald-500" : "bg-gray-400"}`} />
      </button>
      <div className="grid gap-3 sm:grid-cols-3"><MiniMetric label="Total Events" value={draft.events.length} /><MiniMetric label="Active Events" value={activeEvents} /><MiniMetric label="Unsaved" value={dirty ? "Yes" : "No"} /></div>
    </div>
  );
}

function EventsLivePreview({ data, selectedEvent }) {
  const activeEvents = [...(data.events || [])].filter((event) => event.active !== false).sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
  const previewEvent = selectedEvent || activeEvents[0];
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#090716] shadow-sm">
      <div className="relative min-h-[760px] bg-[radial-gradient(circle_at_top,#39206e_0%,#0c071a_42%,#05040c_100%)] p-7 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.22)_1px,transparent_1px)] [background-size:68px_68px]" />
        <div className="relative z-10">
          <span className="inline-flex rounded-full bg-[#f4c542]/15 px-3 py-1 text-xs font-black text-[#f4c542]">{data.hero.eyebrow}</span>
          <h2 className="mt-5 text-5xl font-black tracking-normal">{data.hero.heading || "Events & Product Showcases"}</h2>
          <p className="mt-5 max-w-3xl text-base font-semibold leading-8 text-white/82">{data.hero.subtitle}</p>
          {data.heroInfoCard.active ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-5">
              <p className="text-xs font-black uppercase tracking-widest text-[#f4c542]">{data.heroInfoCard.eyebrow}</p>
              <h3 className="mt-2 text-2xl font-black">{data.heroInfoCard.title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/75">{data.heroInfoCard.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">{data.heroInfoCard.chips.filter((chip) => chip.active !== false).map((chip) => <span key={chip.id} className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-bold text-white/80">{chip.label}</span>)}</div>
            </div>
          ) : null}
          <div id="events" className="mt-8 grid gap-4 md:grid-cols-2">{activeEvents.length ? activeEvents.map((event) => <PreviewCard key={event.id} event={event} selected={previewEvent?.id === event.id} />) : <div className="rounded-xl border border-white/10 bg-white/[0.06] p-6 text-center text-sm text-white/55">No active events yet.</div>}</div>
          {previewEvent ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/45 p-5">
              <div className="flex flex-wrap gap-2">{previewEvent.modalBadges.filter((badge) => badge.active !== false).map((badge) => <span key={badge.id} className="rounded-full bg-[#f4c542]/15 px-3 py-1 text-xs font-black text-[#f4c542]">{badge.label}</span>)}</div>
              <h3 className="mt-4 text-3xl font-black">{previewEvent.modalTitle}</h3>
              <p className="mt-3 text-sm leading-7 text-white/78">{previewEvent.modalSubtitle}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2"><PreviewPanel title={previewEvent.modalProductTitle} text={previewEvent.modalProductDescription} /><PreviewPanel title={previewEvent.modalWhyTitle} text={previewEvent.modalWhyDescription} /></div>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.06] p-4"><h4 className="font-black text-[#f4c542]">{previewEvent.modalAudienceTitle}</h4><p className="mt-2 text-sm leading-7 text-white/75">{previewEvent.modalAudienceDescription}</p></div>
              <ul className="mt-4 space-y-2 text-sm text-white/80">{previewEvent.highlights.filter((item) => item.active !== false).map((item) => <li key={item.id} className="rounded-xl bg-white/[0.06] px-3 py-2">{item.text}</li>)}</ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ event, selected }) {
  return (
    <article className={`overflow-hidden rounded-2xl border bg-white/[0.06] ${selected ? "border-[#f4c542]/60" : "border-white/10"}`}>
      {event.imageUrl ? <img src={event.imageUrl} alt={event.imageAlt || event.title} className="h-36 w-full object-cover" /> : <div className="flex h-36 items-center justify-center bg-[radial-gradient(circle_at_top,#4b2aa0,#120b2e)]"><ImageIcon className="h-7 w-7 text-white/60" /></div>}
      <div className="p-4">
        <div className="flex flex-wrap gap-2 text-xs font-black"><span className="rounded-full bg-[#f4c542]/15 px-2 py-1 text-[#f4c542]">{event.category}</span><span className="rounded-full bg-white/10 px-2 py-1 text-white/75">{event.secondaryTag}</span></div>
        <h3 className="mt-3 text-lg font-black">{event.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/72">{event.description}</p>
        <div className="mt-4 grid gap-2 text-xs text-white/75"><span className="inline-flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" />{event.dateValue}</span><span className="inline-flex items-center gap-2"><Clock className="h-3.5 w-3.5" />{event.timeValue}</span><span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{event.locationValue}</span></div>
      </div>
    </article>
  );
}

function PreviewPanel({ title, text }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4"><h4 className="font-black text-[#f4c542]">{title}</h4><p className="mt-2 text-sm leading-7 text-white/75">{text}</p></div>;
}

function Repeater({ title, items, textKey, placeholder, onAdd, onUpdate, onDelete }) {
  const sortedItems = [...(items || [])].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</p><button onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"><Plus className="h-4 w-4" /> Add</button></div>
      <div className="mt-3 space-y-3">
        {sortedItems.map((item) => (
          <div key={item.id} className="grid gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-[auto_1fr_90px_auto_auto]">
            <GripVertical className="mt-3 h-4 w-4 text-gray-300" />
            <input value={item[textKey] || ""} onChange={(event) => onUpdate(item.id, textKey, event.target.value)} className={inputClass} placeholder={placeholder} />
            <input type="number" value={item.sortOrder} onChange={(event) => onUpdate(item.id, "sortOrder", event.target.value)} className={inputClass} />
            <button onClick={() => onUpdate(item.id, "active", !item.active)} className={`rounded-lg px-2.5 py-1 text-xs font-bold ${item.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{item.active ? "Active" : "Inactive"}</button>
            <button onClick={() => onDelete(item.id)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function validateEventsPage(values) {
  const errors = {};
  if (!values.hero?.heading?.trim()) errors["hero.heading"] = "Heading is required.";
  if (!values.hero?.subtitle?.trim()) errors["hero.subtitle"] = "Subtitle is required.";
  if (!values.heroInfoCard?.title?.trim()) errors["heroInfoCard.title"] = "Info card title is required.";
  if (!values.heroInfoCard?.description?.trim()) errors["heroInfoCard.description"] = "Info card description is required.";
  (values.events || []).forEach((event) => {
    if (!event.title?.trim()) errors[`${event.id}.title`] = "Event title is required.";
    if (!event.description?.trim()) errors[`${event.id}.description`] = "Event description is required.";
    if (!event.productFocus?.trim()) errors[`${event.id}.productFocus`] = "Product focus is required.";
    if (!event.modalTitle?.trim()) errors[`${event.id}.modalTitle`] = "Modal title is required.";
    if (!event.modalSubtitle?.trim()) errors[`${event.id}.modalSubtitle`] = "Modal subtitle is required.";
  });
  return errors;
}

function Field({ label, error, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>{children}{error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}</label>;
}

function MiniMetric({ label, value }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-3"><p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p><p className="mt-1 text-lg font-black text-gray-900">{value}</p></div>;
}

function EmptyState() {
  return <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm font-semibold text-gray-500">Add or select an event to edit.</div>;
}

function slugify(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
