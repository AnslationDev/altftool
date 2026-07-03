"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Edit3, Eye, EyeOff, Image as ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  createWhyChooseFeature,
  deleteHomeImage,
  deleteWhyChooseFeature,
  subscribeWhyChooseFeatures,
  toggleWhyChooseFeatureStatus,
  updateWhyChooseFeature,
  uploadWhyChooseFeatureIcon,
  uploadWhyChooseImage,
} from "../service/home.service";
import { Field, inputClass, textareaClass } from "../components/HomeSectionShared";

const EMPTY_FEATURE = {
  title: "",
  description: "",
  iconUrl: "",
  iconPath: "",
  order: 0,
  active: true,
};

const IMAGE_SLOTS = [
  { index: 1, label: "Image 1" },
  { index: 2, label: "Image 2" },
  { index: 3, label: "Image 3" },
];

export default function WhyChooseUsTab(props) {
  return {
    editor: <WhyChooseEditor {...props} />,
    preview: (
      <div className="space-y-4">
        <WhyChoosePreview draft={props.draft} />
        <FeatureList />
      </div>
    ),
  };
}

function WhyChooseEditor({ draft, setField, errors }) {
  const [features, setFeatures] = useState([]);
  const [form, setForm] = useState(EMPTY_FEATURE);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingFeature, setUploadingFeature] = useState(false);
  const [featureProgress, setFeatureProgress] = useState(0);
  const [imageUploading, setImageUploading] = useState("");
  const [imageProgress, setImageProgress] = useState({});

  useEffect(() => {
    return subscribeWhyChooseFeatures(
      (items) => setFeatures(items),
      (error) => emitAlert({ type: "error", message: error?.message || "Failed to load features." }),
    );
  }, []);

  useEffect(() => {
    function handleEdit(event) {
      if (!event.detail) return;
      setEditingId(event.detail.id);
      setForm({
        title: event.detail.title || "",
        description: event.detail.description || "",
        iconUrl: event.detail.iconUrl || "",
        iconPath: event.detail.iconPath || "",
        order: Number(event.detail.order) || 0,
        active: event.detail.active !== false,
      });
      setFormErrors({});
    }
    window.addEventListener("careerbook-why-feature-edit", handleEdit);
    return () => window.removeEventListener("careerbook-why-feature-edit", handleEdit);
  }, []);

  const nextOrder = useMemo(() => {
    const maxOrder = features.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0);
    return maxOrder + 1;
  }, [features]);

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function resetFeatureForm() {
    setEditingId("");
    setForm({ ...EMPTY_FEATURE, order: nextOrder });
    setFormErrors({});
    setFeatureProgress(0);
  }

  async function uploadSectionImage(slot, file) {
    if (!validateImageFile(file, "Image")) return;
    setImageUploading(slot);
    setImageProgress((prev) => ({ ...prev, [slot]: 0 }));
    try {
      const uploaded = await uploadWhyChooseImage({
        file,
        slot,
        onProgress: (progress) => setImageProgress((prev) => ({ ...prev, [slot]: progress })),
      });
      setField(`${slot}Url`, uploaded.url);
      setField(`${slot}Path`, uploaded.path);
      emitAlert({ type: "success", message: "Image uploaded. Save section to publish it." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setImageUploading("");
    }
  }

  async function removeSectionImage(slot) {
    const path = draft[`${slot}Path`];
    setField(`${slot}Url`, "");
    setField(`${slot}Path`, "");
    try {
      await deleteHomeImage(path);
      emitAlert({ type: "success", message: "Image removed from section." });
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  async function uploadFeatureIcon(file) {
    if (!validateImageFile(file, "Feature icon")) return;
    setUploadingFeature(true);
    setFeatureProgress(0);
    try {
      const uploaded = await uploadWhyChooseFeatureIcon({ file, onProgress: setFeatureProgress });
      setForm((prev) => ({ ...prev, iconUrl: uploaded.url, iconPath: uploaded.path }));
      emitAlert({ type: "success", message: "Feature icon uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Icon upload failed." });
    } finally {
      setUploadingFeature(false);
    }
  }

  async function removeFeatureIcon() {
    const path = form.iconPath;
    setForm((prev) => ({ ...prev, iconUrl: "", iconPath: "" }));
    try {
      await deleteHomeImage(path);
    } catch {
      emitAlert({ type: "warning", message: "Icon removed from form, but Storage cleanup failed." });
    }
  }

  async function saveFeature() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Feature title is required.";
    if (!form.description.trim()) nextErrors.description = "Feature description is required.";
    if (!form.iconUrl) nextErrors.iconUrl = "Feature icon is required.";
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (editingId) {
        await updateWhyChooseFeature(editingId, form);
        emitAlert({ type: "success", message: "Feature updated." });
      } else {
        await createWhyChooseFeature({ ...form, order: Number(form.order) || nextOrder });
        emitAlert({ type: "success", message: "Feature added." });
      }
      resetFeatureForm();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save feature." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Section content</p>
        <div className="mt-4 space-y-4">
          <Field label="Section label">
            <input value={draft.label || ""} onChange={(event) => setField("label", event.target.value)} className={inputClass} placeholder="A FEW WORDS" />
          </Field>
          <Field label="Section heading" error={errors.heading}>
            <input value={draft.heading || ""} onChange={(event) => setField("heading", event.target.value)} className={inputClass} placeholder="Why Choose Us" />
          </Field>
          <Field label="Section description" error={errors.description}>
            <textarea value={draft.description || ""} onChange={(event) => setField("description", event.target.value)} rows={4} className={textareaClass} />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Three section images</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {IMAGE_SLOTS.map(({ index, label }) => {
            const slot = `image${index}`;
            return (
              <ImageSlot
                key={slot}
                label={label}
                url={draft[`${slot}Url`]}
                error={errors[`${slot}Url`]}
                uploading={imageUploading === slot}
                progress={imageProgress[slot] || 0}
                onUpload={(file) => uploadSectionImage(slot, file)}
                onRemove={() => removeSectionImage(slot)}
              />
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Feature management</p>
            <h3 className="mt-1 text-sm font-bold text-gray-900">{editingId ? "Edit selected feature" : "Add new feature"}</h3>
          </div>
          <button onClick={resetFeatureForm} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Feature title" error={formErrors.title}>
            <input value={form.title} onChange={(event) => updateForm("title", event.target.value)} className={inputClass} placeholder="Modern Technologies" />
          </Field>
          <Field label="Display order">
            <input type="number" value={form.order} onChange={(event) => updateForm("order", event.target.value)} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Feature description" error={formErrors.description}>
              <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} rows={3} className={textareaClass} />
            </Field>
          </div>
          <Field label="Status">
            <button onClick={() => updateForm("active", !form.active)} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${form.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
              <span>{form.active ? "Active" : "Inactive"}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${form.active ? "bg-emerald-500" : "bg-gray-400"}`} />
            </button>
          </Field>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-gray-200 bg-white">
              {form.iconUrl ? <img src={form.iconUrl} alt="Feature icon preview" className="max-h-14 max-w-14 object-contain" /> : <ImageIcon className="h-6 w-6 text-gray-300" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800">Upload feature icon/image</p>
              <p className="text-xs text-gray-400">Required for each feature.</p>
              {formErrors.iconUrl ? <p className="mt-1 text-xs font-medium text-red-500">{formErrors.iconUrl}</p> : null}
              {uploadingFeature ? <ProgressBar value={featureProgress} /> : null}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
              <Upload className="h-4 w-4" /> Upload
              <input type="file" accept="image/*" className="hidden" disabled={uploadingFeature} onChange={(event) => uploadFeatureIcon(event.target.files?.[0])} />
            </label>
            {form.iconUrl ? <button onClick={removeFeatureIcon} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Remove</button> : null}
          </div>
        </div>

        <button onClick={saveFeature} disabled={saving || uploadingFeature} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {editingId ? "Update Feature" : "Add Feature"}
        </button>
      </div>
    </div>
  );
}

function ImageSlot({ label, url, error, uploading, progress, onUpload, onRemove }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
        {url ? <img src={url} alt={`${label} preview`} className="h-full w-full object-cover" /> : <ImageIcon className="h-7 w-7 text-gray-300" />}
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-widest text-gray-500">{label}</p>
      {error ? <p className="mt-1 text-xs font-medium text-red-500">{error}</p> : null}
      {uploading ? <ProgressBar value={progress} /> : null}
      <div className="mt-3 flex gap-2">
        <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700">
          <Upload className="h-3.5 w-3.5" /> Upload
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => onUpload(event.target.files?.[0])} />
        </label>
        {url ? <button onClick={onRemove} className="rounded-lg border border-red-200 px-3 py-2 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button> : null}
      </div>
    </div>
  );
}

function WhyChoosePreview({ draft }) {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    return subscribeWhyChooseFeatures((items) => setFeatures(items.filter((item) => item.active !== false)), () => {});
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#080808] p-6 text-white shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="grid grid-cols-2 gap-3">
          <PreviewImage url={draft.image1Url} className="col-span-2 aspect-[1.9]" />
          <PreviewImage url={draft.image2Url} className="aspect-square" />
          <PreviewImage url={draft.image3Url} className="aspect-square" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-violet-300">{draft.label || "A FEW WORDS"}</p>
          <h2 className="mt-3 text-4xl font-black tracking-normal">{draft.heading || "Why Choose Us"}</h2>
          <p className="mt-4 text-sm leading-7 text-white/70">{draft.description}</p>
          <div className="mt-6 space-y-4">
            {features.length ? features.slice(0, 3).map((feature) => (
              <div key={feature.id} className="flex gap-3">
                <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-200">
                  {feature.iconUrl ? <img src={feature.iconUrl} alt="" className="h-5 w-5 object-contain" /> : <CheckCircle2 className="h-5 w-5" />}
                </span>
                <div>
                  <h3 className="text-sm font-black">{feature.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-white/60">{feature.description}</p>
                </div>
              </div>
            )) : <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/55">No active features yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureList() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeWhyChooseFeatures(
      (items) => {
        setFeatures(items);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        emitAlert({ type: "error", message: error?.message || "Failed to load features." });
      },
    );
  }, []);

  function editFeature(feature) {
    window.dispatchEvent(new CustomEvent("careerbook-why-feature-edit", { detail: feature }));
  }

  async function toggleFeature(feature) {
    try {
      await toggleWhyChooseFeatureStatus(feature.id, feature.active === false);
      emitAlert({ type: "success", message: "Feature status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteWhyChooseFeature(deleteTarget.id);
      if (deleteTarget.iconPath) {
        try {
          await deleteHomeImage(deleteTarget.iconPath);
        } catch {
          emitAlert({ type: "warning", message: "Feature deleted, but Storage cleanup failed." });
        }
      }
      emitAlert({ type: "success", message: "Feature deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete feature." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Feature list</p>
        <h3 className="mt-1 text-sm font-bold text-gray-900">{features.length} feature items</h3>
      </div>
      {loading ? (
        <div className="mt-4 space-y-2">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-gray-100" />)}</div>
      ) : features.length ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[70px_1fr_1.4fr_80px_90px_130px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Icon</span><span>Title</span><span>Description</span><span>Order</span><span>Status</span><span>Actions</span>
            </div>
            {features.map((feature) => (
              <div key={feature.id} className="grid grid-cols-[70px_1fr_1.4fr_80px_90px_130px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                  {feature.iconUrl ? <img src={feature.iconUrl} alt="" className="max-h-8 max-w-8 object-contain" /> : <ImageIcon className="h-5 w-5 text-gray-300" />}
                </div>
                <p className="truncate font-bold text-gray-900">{feature.title}</p>
                <p className="truncate text-xs font-medium text-gray-500">{feature.description}</p>
                <span className="font-bold text-gray-600">{Number(feature.order) || 0}</span>
                <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${feature.active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>
                  {feature.active === false ? "Inactive" : "Active"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => toggleFeature(feature)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50" title={feature.active === false ? "Enable" : "Disable"}>
                    {feature.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => editFeature(feature)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50" title="Edit">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(feature)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm font-semibold text-gray-500">
          No features yet. Add the first feature from the left form.
        </div>
      )}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete feature"
          message={`Delete "${deleteTarget.title}" from Why Choose Us?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function PreviewImage({ url, className }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${className}`}>
      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs font-semibold text-white/40">Upload image</div>}
    </div>
  );
}

function ProgressBar({ value }) {
  return <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-gray-900" style={{ width: `${value}%` }} /></div>;
}

function validateImageFile(file, label) {
  if (!file) return false;
  if (!file.type.startsWith("image/")) {
    emitAlert({ type: "error", message: `${label} must be an image file.` });
    return false;
  }
  if (file.size > 8 * 1024 * 1024) {
    emitAlert({ type: "error", message: `${label} must be 8MB or smaller.` });
    return false;
  }
  return true;
}
