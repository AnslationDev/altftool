"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, Image as ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  createHomeService,
  deleteHomeImage,
  deleteHomeService,
  subscribeHomeServices,
  toggleHomeServiceStatus,
  updateHomeService,
  uploadHomeServiceIcon,
} from "../service/home.service";
import { Field, inputClass, textareaClass } from "../components/HomeSectionShared";

const EMPTY_SERVICE = {
  title: "",
  link: "#",
  iconUrl: "",
  iconPath: "",
  order: 0,
  active: true,
};

export default function OurServiceTab(props) {
  return {
    editor: <ServicesEditor {...props} />,
    preview: (
      <div className="space-y-4">
        <ServicesPreview draft={props.draft} />
        <ServicesList />
      </div>
    ),
  };
}

function ServicesEditor({ draft, setField, errors }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState(EMPTY_SERVICE);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState("");

  useEffect(() => {
    return subscribeHomeServices(
      (items) => {
        setServices(items);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        emitAlert({ type: "error", message: error?.message || "Failed to load services." });
      },
    );
  }, []);

  const nextOrder = useMemo(() => {
    const maxOrder = services.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0);
    return maxOrder + 1;
  }, [services]);

  useEffect(() => {
    function handleEdit(event) {
      if (event.detail) startEdit(event.detail);
    }
    window.addEventListener("careerbook-service-edit", handleEdit);
    return () => window.removeEventListener("careerbook-service-edit", handleEdit);
  }, []);

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function resetForm() {
    setEditingId("");
    setForm({ ...EMPTY_SERVICE, order: nextOrder });
    setFormErrors({});
    setUploadProgress(0);
  }

  function startEdit(service) {
    setEditingId(service.id);
    setForm({
      title: service.title || "",
      link: service.link || "#",
      iconUrl: service.iconUrl || "",
      iconPath: service.iconPath || "",
      order: Number(service.order) || 0,
      active: service.active !== false,
    });
    setFormErrors({});
  }

  async function handleIconUpload(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      emitAlert({ type: "error", message: "Please upload an image file." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      emitAlert({ type: "error", message: "Service icon must be 5MB or smaller." });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadHomeServiceIcon({ file, onProgress: setUploadProgress });
      setForm((prev) => ({ ...prev, iconUrl: uploaded.url, iconPath: uploaded.path }));
      emitAlert({ type: "success", message: "Service icon uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Icon upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function removeIcon() {
    const path = form.iconPath;
    setForm((prev) => ({ ...prev, iconUrl: "", iconPath: "" }));
    try {
      await deleteHomeImage(path);
    } catch {
      emitAlert({ type: "warning", message: "Icon removed from form, but Storage cleanup failed." });
    }
  }

  async function saveService() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Service title is required.";
    if (!form.link.trim()) nextErrors.link = "Service link is required.";
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (editingId) {
        await updateHomeService(editingId, form);
        emitAlert({ type: "success", message: "Service updated." });
      } else {
        await createHomeService({ ...form, order: Number(form.order) || nextOrder });
        emitAlert({ type: "success", message: "Service added." });
      }
      resetForm();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save service." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Section content</p>
        <div className="mt-4 space-y-4">
          <Field label="Section label" error={errors.label}>
            <input value={draft.label || ""} onChange={(event) => setField("label", event.target.value)} className={inputClass} />
          </Field>
          <Field label="Section heading" error={errors.heading}>
            <input value={draft.heading || ""} onChange={(event) => setField("heading", event.target.value)} className={inputClass} />
          </Field>
          <Field label="Section description" error={errors.description}>
            <textarea value={draft.description || ""} onChange={(event) => setField("description", event.target.value)} rows={4} className={textareaClass} />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Service card</p>
            <h3 className="mt-1 text-sm font-bold text-gray-900">{editingId ? "Edit selected service" : "Add new service"}</h3>
          </div>
          <button onClick={resetForm} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Service title" error={formErrors.title}>
            <input value={form.title} onChange={(event) => updateForm("title", event.target.value)} className={inputClass} placeholder="Mobile Marketing" />
          </Field>
          <Field label="Service link" error={formErrors.link}>
            <input value={form.link} onChange={(event) => updateForm("link", event.target.value)} className={inputClass} placeholder="/carrerbook/services/mobile" />
          </Field>
          <Field label="Display order">
            <input type="number" value={form.order} onChange={(event) => updateForm("order", event.target.value)} className={inputClass} />
          </Field>
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
              {form.iconUrl ? <img src={form.iconUrl} alt="Service icon preview" className="max-h-14 max-w-14 object-contain" /> : <ImageIcon className="h-6 w-6 text-gray-300" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800">Upload service icon/image</p>
              <p className="text-xs text-gray-400">PNG, JPG, SVG, WebP up to 5MB.</p>
              {uploading ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-gray-900" style={{ width: `${uploadProgress}%` }} /></div> : null}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
              <Upload className="h-4 w-4" /> Upload
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => handleIconUpload(event.target.files?.[0])} />
            </label>
            {form.iconUrl ? <button onClick={removeIcon} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Remove</button> : null}
          </div>
        </div>

        <button onClick={saveService} disabled={saving || uploading} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {editingId ? "Update Service" : "Add Service"}
        </button>
      </div>
    </div>
  );
}

function ServicesPreview({ draft }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    return subscribeHomeServices((items) => setServices(items.filter((item) => item.active !== false)), () => {});
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#040404] shadow-sm">
      <div className="relative min-h-[520px] bg-[linear-gradient(125deg,#1e1151_0%,#050505_32%,#050505_68%,#1b0e45_100%)] px-6 py-12 text-center text-white">
        <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,.32)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.32)_1px,transparent_1px)] [background-size:58px_58px]" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-white/70">- {draft.label || "OUR SERVICES"} -</p>
          <h2 className="mt-4 text-4xl font-black tracking-normal md:text-5xl">{draft.heading || "we do everything."}</h2>
          <span className="mx-auto mt-5 block h-1 w-16 rounded-full bg-violet-500" />
          <p className="mx-auto mt-8 max-w-3xl text-sm font-medium leading-7 text-white/82">{draft.description}</p>
        </div>
        <div className="relative z-10 mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.length ? services.map((service) => <PreviewCard key={service.id} service={service} />) : <div className="col-span-full rounded-2xl border border-white/15 bg-white/5 p-8 text-sm text-white/60">No active services yet.</div>}
        </div>
      </div>
    </div>
  );
}

function ServicesList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeHomeServices(
      (items) => {
        setServices(items);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        emitAlert({ type: "error", message: error?.message || "Failed to load services." });
      },
    );
  }, []);

  function editService(service) {
    window.dispatchEvent(new CustomEvent("careerbook-service-edit", { detail: service }));
  }

  async function toggleStatus(service) {
    try {
      await toggleHomeServiceStatus(service.id, service.active === false);
      emitAlert({ type: "success", message: "Service status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteHomeService(deleteTarget.id);
      if (deleteTarget.iconPath) {
        try {
          await deleteHomeImage(deleteTarget.iconPath);
        } catch {
          emitAlert({ type: "warning", message: "Service deleted, but Storage cleanup failed." });
        }
      }
      emitAlert({ type: "success", message: "Service deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete service." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Services list</p>
          <h3 className="mt-1 text-sm font-bold text-gray-900">{services.length} service cards</h3>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      ) : services.length ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[70px_1.2fr_1fr_80px_90px_130px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Icon</span><span>Title</span><span>Link</span><span>Order</span><span>Status</span><span>Actions</span>
            </div>
            {services.map((service) => (
              <div key={service.id} className="grid grid-cols-[70px_1.2fr_1fr_80px_90px_130px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                  {service.iconUrl ? <img src={service.iconUrl} alt="" className="max-h-8 max-w-8 object-contain" /> : <ImageIcon className="h-5 w-5 text-gray-300" />}
                </div>
                <p className="truncate font-bold text-gray-900">{service.title}</p>
                <a href={service.link || "#"} target="_blank" rel="noreferrer" className="truncate text-xs font-semibold text-blue-600">{service.link || "#"}</a>
                <span className="font-bold text-gray-600">{Number(service.order) || 0}</span>
                <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${service.active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>
                  {service.active === false ? "Inactive" : "Active"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => toggleStatus(service)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50" title={service.active === false ? "Enable" : "Disable"}>
                    {service.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => editService(service)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50" title="Edit">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(service)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm font-semibold text-gray-500">
          No services yet. Add your first service card from the left form.
        </div>
      )}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete service"
          message={`Delete "${deleteTarget.title}" from Our Services?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function PreviewCard({ service }) {
  return (
    <a href={service.link || "#"} className="group flex flex-col items-center gap-5 text-white no-underline">
      <div className="flex h-16 items-center justify-center">
        {service.iconUrl ? <img src={service.iconUrl} alt="" className="max-h-16 max-w-16 object-contain opacity-80 grayscale" /> : <ImageIcon className="h-12 w-12 text-white/60" />}
      </div>
      <span className="min-h-[68px] w-full rounded-lg border border-white/25 px-4 py-3 text-center text-sm font-black leading-6 transition group-hover:border-violet-400 group-hover:text-violet-100">
        {service.title}
      </span>
    </a>
  );
}
