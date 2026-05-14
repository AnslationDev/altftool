"use client";

import { useEffect, useState, useMemo } from "react";
import { extensionMap } from "@/data/extensions";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import { deleteExtension, fetchExtensions } from "./services/extensions.service";

import ExtensionsHeader from "./components/ExtensionsHeader";
import ExtensionsFilters from "./components/ExtensionsFilters";
import ExtensionsTable from "./components/ExtensionsTable";
import ExtensionModal from "./components/ExtensionModal";
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react";

const PAGE_SIZE = 12;

export default function ExtensionsPage() {
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

  const [extensions, setExtensions] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

const [bulkIds, setBulkIds] = useState([]);
const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  /* ── Filters ── */
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [chromeFilter, setChromeFilter] = useState("");

  /* ── Pagination ── */
  const [page, setPage] = useState(1);

  /* ── Load ── */
  const loadExtensions = async () => {
    setLoading(true);
    try {
      if (USE_MOCK) {
        const data = Object.entries(extensionMap).map(([slug, d]) => ({ id: slug, slug, ...d }));
        setExtensions(data);
      } else {
        setExtensions(await fetchExtensions());
      }
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: "Failed to load extensions" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExtensions(); }, []); // eslint-disable-line

  /* ── Delete single ── */
  const removeExtension = (id) => {
  if (Array.isArray(id)) {
    setBulkIds(id);
    setIsBulkDeleteModalOpen(true);
  } else {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  }
};

const confirmDelete = async () => {
  if (!deleteId) return;

  try {
    await deleteExtension(deleteId);

    emitAlert({ type: "success", message: "Extension deleted" });

    logAuditEvent({
      module: "extensions",
      action: "EXTENSION_DELETE",
      entityType: "extension",
      entityId: deleteId,
      summary: `Deleted extension ${deleteId}`,
      changes: { id: deleteId },
      route: "/extensions",
    });

    loadExtensions();
  } catch (err) {
    console.error(err);
    emitAlert({ type: "error", message: "Failed to delete extension" });
  }

  setDeleteId(null);
  setIsDeleteModalOpen(false);
};

  /* ── Bulk delete ── */
  const confirmBulkDelete = async () => {
  if (!bulkIds.length) return;

  try {
    await Promise.all(bulkIds.map((id) => deleteExtension(id)));

    emitAlert({
      type: "success",
      message: `${bulkIds.length} extension${bulkIds.length > 1 ? "s" : ""} deleted`,
    });

    logAuditEvent({
      module: "extensions",
      action: "EXTENSION_BULK_DELETE",
      entityType: "extension",
      entityId: null,
      summary: `Bulk deleted ${bulkIds.length} extensions`,
      changes: { ids: bulkIds },
      route: "/extensions",
    });

    setSelectedRows([]);
    loadExtensions();
  } catch (err) {
    console.error(err);
    emitAlert({ type: "error", message: "Bulk delete failed" });
  }

  setBulkIds([]);
  setIsBulkDeleteModalOpen(false);
};

  /* ── Selection ── */
  const toggleSelect = (id) =>
    setSelectedRows((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return extensions.filter((ext) => {
      const matchSearch = !q || ext.name?.toLowerCase().includes(q) || ext.description?.toLowerCase().includes(q);
      const matchCategory = !category || ext.category === category;
      const matchChrome = !chromeFilter
        ? true
        : chromeFilter === "chrome" ? ext.hasChromeStore : !ext.hasChromeStore;
      return matchSearch && matchCategory && matchChrome;
    });
  }, [extensions, search, category, chromeFilter]);

  /* Reset to page 1 when filters change */
  useEffect(() => setPage(1), [search, category, chromeFilter]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const toggleSelectAll = () =>
    selectedRows.length === paginated.length
      ? setSelectedRows([])
      : setSelectedRows(paginated.map((e) => e.id));

  /* ── Derived stats ── */
  const categories = [...new Set(extensions.map((e) => e.category).filter(Boolean))];
  const chromeCount = extensions.filter((e) => e.hasChromeStore).length;
  const noChromeCount = extensions.filter((e) => !e.hasChromeStore).length;
  const avgRating = extensions.length
    ? extensions.reduce((sum, e) => sum + (e.rating || 0), 0) / extensions.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-7 space-y-5">

        <ExtensionsHeader
          total={extensions.length}
          chromeCount={chromeCount}
          noChromeCount={noChromeCount}
          categories={categories.length}
          avgRating={avgRating}
          onCreate={() => setShowCreate(true)}
        />

        <ExtensionsFilters
          search={search} setSearch={setSearch}
          category={category} setCategory={setCategory}
          categories={categories}
          chromeFilter={chromeFilter} setChromeFilter={setChromeFilter}
          totalFiltered={filtered.length}
          totalAll={extensions.length}
        />

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm">Loading extensions…</span>
            </div>
          </div>
        ) : (
          <ExtensionsTable
            extensions={paginated}
            selected={selectedRows}
            toggleSelect={toggleSelect}
            toggleSelectAll={toggleSelectAll}
            onEdit={setSelected}
            onDelete={removeExtension}
          />
        )}

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} extension{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"><ChevronsLeft className="w-4 h-4 text-gray-600" /></button>
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-400">…</span>
                    ) : (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${p === page ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                        {p}
                      </button>
                    )
                  )}
              </div>
              <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"><ChevronsRight className="w-4 h-4 text-gray-600" /></button>
            </div>
          </div>
        )}

      </div>

      {showCreate && (
        <ExtensionModal onClose={() => setShowCreate(false)} refresh={loadExtensions} />
      )}
      {selected && (
        <ExtensionModal extension={selected} onClose={() => setSelected(null)} refresh={loadExtensions} />
      )}

      {isDeleteModalOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl w-80 shadow-xl">
      <h2 className="text-lg font-semibold mb-4">
        Are you sure you want to delete this extension?
      </h2>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setIsDeleteModalOpen(false)}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={confirmDelete}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

{isBulkDeleteModalOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
      <h2 className="text-lg font-semibold mb-4">
        Delete {bulkIds.length} selected extension
        {bulkIds.length > 1 ? "s" : ""}?
      </h2>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setIsBulkDeleteModalOpen(false)}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={confirmBulkDelete}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete All
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
