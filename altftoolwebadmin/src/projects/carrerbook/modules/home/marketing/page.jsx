"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, Image as ImageIcon, Loader2, Plus, Search, Trash2, Upload, X } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  createMarketingRow,
  deleteHomeImage,
  deleteMarketingRow,
  subscribeMarketingRows,
  toggleMarketingRowStatus,
  updateMarketingRow,
  uploadMarketingColumnImage,
} from "../service/home.service";
import { Field, inputClass, textareaClass } from "../components/HomeSectionShared";

const MARKETING_TABLES = [
  { key: "cpl", label: "CPL Lead Generation" },
  { key: "cps", label: "CPS - Affiliate Marketing Services" },
  { key: "cpi", label: "CPI - App Install Services" },
];

const EMPTY_ROW = {
  title: "",
  columns: [{ id: "column-1", type: "text", text: "", imageUrl: "", imagePath: "" }],
  order: 0,
  active: true,
};

export default function MarketingTab(props) {
  return {
    editor: <MarketingSettings {...props} />,
    preview: <MarketingWorkspace draft={props.draft} />,
  };
}

function MarketingSettings({ draft, setField, errors }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Section settings</p>
        <div className="mt-4 space-y-4">
          <Field label="Section title" error={errors.title}>
            <input value={draft.title || ""} onChange={(event) => setField("title", event.target.value)} className={inputClass} placeholder="Marketing" />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Marketing Management</p>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Use the right-side tabs to manage independent CPL, CPS, and CPI tables. Each row can include text columns or uploaded image/icon columns.
        </p>
      </div>
    </div>
  );
}

function MarketingWorkspace({ draft }) {
  const [activeTable, setActiveTable] = useState("cpl");

  return (
    <div className="space-y-4">
      <MarketingPreview draft={draft} activeTable={activeTable} />
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {MARKETING_TABLES.map((table) => (
            <button
              key={table.key}
              onClick={() => setActiveTable(table.key)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${activeTable === table.key ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              {table.label}
            </button>
          ))}
        </div>
        <MarketingTableManager table={MARKETING_TABLES.find((item) => item.key === activeTable)} />
      </div>
    </div>
  );
}

function MarketingPreview({ draft, activeTable }) {
  const [rows, setRows] = useState([]);
  const table = MARKETING_TABLES.find((item) => item.key === activeTable);

  useEffect(() => {
    return subscribeMarketingRows(activeTable, (items) => setRows(items.filter((item) => item.active !== false)), () => {});
  }, [activeTable]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#050505] p-6 text-white shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-violet-300">Marketing</p>
          <h2 className="mt-2 text-4xl font-black tracking-normal">{draft.title || "Marketing"}</h2>
        </div>
        <p className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/70">{table?.label}</p>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-[620px] w-full border-collapse text-left text-sm">
          <tbody>
            {rows.length ? rows.slice(0, 5).map((row) => (
              <tr key={row.id} className="border-t border-white/10 first:border-t-0">
                <th className="w-44 bg-white/[0.06] px-4 py-4 font-black">{row.title}</th>
                {(row.columns || []).map((column) => (
                  <td key={column.id} className="px-4 py-4 text-white/75">
                    {column.type === "image" && column.imageUrl ? <img src={column.imageUrl} alt="" className="h-9 max-w-[100px] object-contain" /> : column.text}
                  </td>
                ))}
              </tr>
            )) : (
              <tr><td className="px-4 py-8 text-center text-white/55">No active rows yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MarketingTableManager({ table }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    return subscribeMarketingRows(
      table.key,
      (items) => {
        setRows(items);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        emitAlert({ type: "error", message: error?.message || "Failed to load marketing rows." });
      },
    );
  }, [table.key]);

  const filteredRows = useMemo(() => {
    const search = query.trim().toLowerCase();
    return rows
      .filter((row) => {
        const matchesSearch = !search || row.title?.toLowerCase().includes(search);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && row.active !== false) ||
          (statusFilter === "inactive" && row.active === false);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [rows, query, statusFilter]);

  async function toggleStatus(row) {
    try {
      await toggleMarketingRowStatus(table.key, row.id, row.active === false);
      emitAlert({ type: "success", message: "Marketing row status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update row status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteMarketingRow(table.key, deleteTarget.id);
      for (const column of deleteTarget.columns || []) {
        if (column.imagePath) {
          try {
            await deleteHomeImage(column.imagePath);
          } catch {
            emitAlert({ type: "warning", message: "Row deleted, but one image cleanup failed." });
          }
        }
      }
      emitAlert({ type: "success", message: "Marketing row deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete row." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{table.label}</p>
          <h3 className="mt-1 text-sm font-bold text-gray-900">{rows.length} table rows</h3>
        </div>
        <button onClick={() => setModalState({ mode: "create", row: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">
          <Plus className="h-4 w-4" /> Add New Row
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_190px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search by row title" />
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}</div>
      ) : filteredRows.length ? (
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[1.2fr_110px_80px_90px_130px_130px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Row Title</span><span>Columns</span><span>Order</span><span>Status</span><span>Created</span><span>Actions</span>
            </div>
            {filteredRows.map((row) => (
              <RowSummary key={row.id} row={row} tableKey={table.key} onEdit={() => setModalState({ mode: "edit", row })} onDelete={() => setDeleteTarget(row)} onToggle={() => toggleStatus(row)} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm font-semibold text-gray-500">
          No rows found. Add a row or adjust the search/filter.
        </div>
      )}

      {modalState ? <MarketingRowModal table={table} mode={modalState.mode} row={modalState.row} rows={rows} onClose={() => setModalState(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete marketing row"
          message={`Delete "${deleteTarget.title}" from ${table.label}?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function RowSummary({ row, onEdit, onDelete, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-t border-gray-100">
      <div className="grid grid-cols-[1.2fr_110px_80px_90px_130px_130px] items-center gap-3 px-3 py-3 text-sm">
        <button onClick={() => setExpanded(!expanded)} className="truncate text-left font-bold text-gray-900">{row.title}</button>
        <span className="text-xs font-bold text-gray-600">{(row.columns || []).length}</span>
        <span className="font-bold text-gray-600">{Number(row.order) || 0}</span>
        <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${row.active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>{row.active === false ? "Inactive" : "Active"}</span>
        <span className="text-xs font-semibold text-gray-500">{formatDate(row.createdAt)}</span>
        <div className="flex gap-2">
          <button onClick={onToggle} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{row.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
          <button onClick={onEdit} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
          <button onClick={onDelete} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      {expanded ? (
        <div className="grid gap-2 bg-gray-50 px-3 py-3 sm:grid-cols-2">
          {(row.columns || []).map((column, index) => (
            <div key={column.id || index} className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Column {index + 1} - {column.type}</p>
              {column.type === "image" ? (column.imageUrl ? <img src={column.imageUrl} alt="" className="mt-2 h-12 max-w-[140px] object-contain" /> : <p className="mt-2 text-sm text-gray-400">No image</p>) : <p className="mt-2 text-sm font-semibold text-gray-700">{column.text || "Empty"}</p>}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MarketingRowModal({ table, mode, row, rows, onClose }) {
  const nextOrder = useMemo(() => rows.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1, [rows]);
  const [form, setForm] = useState(() => ({
    title: row?.title || "",
    columns: row?.columns?.length ? row.columns : EMPTY_ROW.columns,
    order: Number(row?.order) || nextOrder,
    active: row?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function updateColumn(index, patch) {
    setForm((prev) => {
      const columns = [...prev.columns];
      columns[index] = { ...columns[index], ...patch };
      return { ...prev, columns };
    });
    setErrors((prev) => ({ ...prev, columns: "" }));
  }

  function addColumn() {
    setForm((prev) => ({
      ...prev,
      columns: [...prev.columns, { id: `column-${Date.now()}`, type: "text", text: "", imageUrl: "", imagePath: "" }],
    }));
  }

  async function removeColumn(index) {
    const column = form.columns[index];
    setForm((prev) => ({ ...prev, columns: prev.columns.filter((_, itemIndex) => itemIndex !== index) }));
    if (column?.imagePath) {
      try {
        await deleteHomeImage(column.imagePath);
      } catch {
        emitAlert({ type: "warning", message: "Column removed, but image cleanup failed." });
      }
    }
  }

  async function uploadColumnImage(index, file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      emitAlert({ type: "error", message: "Column image must be an image file." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      emitAlert({ type: "error", message: "Column image must be 5MB or smaller." });
      return;
    }
    const key = `${index}`;
    setUploadingKey(key);
    setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
    try {
      const uploaded = await uploadMarketingColumnImage({ tableKey: table.key, file, onProgress: (progress) => setUploadProgress((prev) => ({ ...prev, [key]: progress })) });
      updateColumn(index, { type: "image", imageUrl: uploaded.url, imagePath: uploaded.path, text: "" });
      emitAlert({ type: "success", message: "Column image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploadingKey("");
    }
  }

  async function save() {
    const validColumns = form.columns.filter((column) => (column.type === "image" ? column.imageUrl : column.text?.trim()));
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Row title is required.";
    if (!validColumns.length) nextErrors.columns = "Add at least one column value.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      const payload = { ...form, columns: validColumns };
      if (mode === "edit") {
        await updateMarketingRow(table.key, row.id, payload);
        emitAlert({ type: "success", message: "Marketing row updated." });
      } else {
        await createMarketingRow(table.key, payload);
        emitAlert({ type: "success", message: "Marketing row added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save marketing row." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{table.label}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">{mode === "edit" ? "Update marketing row" : "Add marketing row"}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_160px_160px]">
            <Field label="Row title" error={errors.title}>
              <input value={form.title} onChange={(event) => setField("title", event.target.value)} className={inputClass} placeholder="Verticals" />
            </Field>
            <Field label="Display order">
              <input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} />
            </Field>
            <Field label="Status">
              <button onClick={() => setField("active", !form.active)} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${form.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                <span>{form.active ? "Active" : "Inactive"}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${form.active ? "bg-emerald-500" : "bg-gray-400"}`} />
              </button>
            </Field>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Column values</p>
                {errors.columns ? <p className="mt-1 text-xs font-medium text-red-500">{errors.columns}</p> : null}
              </div>
              <button onClick={addColumn} className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white"><Plus className="h-3.5 w-3.5" /> Add Column</button>
            </div>
            <div className="mt-4 space-y-3">
              {form.columns.map((column, index) => (
                <div key={column.id || index} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Column {index + 1}</p>
                    <button onClick={() => removeColumn(index)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[130px_1fr]">
                    <select value={column.type} onChange={(event) => updateColumn(index, { type: event.target.value, text: "", imageUrl: "", imagePath: "" })} className={inputClass}>
                      <option value="text">Text</option>
                      <option value="image">Image/Icon</option>
                    </select>
                    {column.type === "image" ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex h-14 w-20 items-center justify-center rounded-lg border border-gray-200 bg-white">
                          {column.imageUrl ? <img src={column.imageUrl} alt="" className="max-h-10 max-w-16 object-contain" /> : <ImageIcon className="h-5 w-5 text-gray-300" />}
                        </div>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
                          <Upload className="h-4 w-4" /> Upload
                          <input type="file" accept="image/*" className="hidden" disabled={uploadingKey === `${index}`} onChange={(event) => uploadColumnImage(index, event.target.files?.[0])} />
                        </label>
                        {uploadingKey === `${index}` ? <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-gray-900" style={{ width: `${uploadProgress[index] || 0}%` }} /></div> : null}
                      </div>
                    ) : (
                      <textarea value={column.text || ""} onChange={(event) => updateColumn(index, { text: event.target.value })} rows={2} className={textareaClass} placeholder="Column text value" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || Boolean(uploadingKey)} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {mode === "edit" ? "Update Row" : "Add Row"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  const date = value?.toDate?.() || null;
  if (!date) return "-";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(date);
}
