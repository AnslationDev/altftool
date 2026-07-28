"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImageOff,
  Loader2,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import AdminDataState, { AdminDataSkeleton } from "@/components/admin/AdminDataState";

const PAGE_SIZES = [10, 25, 50];

function getValue(row, column) {
  if (typeof column.accessorFn === "function") return column.accessorFn(row);
  if (!column.accessorKey) return undefined;
  return String(column.accessorKey)
    .split(".")
    .reduce((value, key) => (value == null ? undefined : value[key]), row);
}

function displayValue(value) {
  if (value == null || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return value;
}

function getRowLabel(row) {
  return row?.title || row?.name || row?.brandName || row?.categoryName || row?.id || "this row";
}

export function SafeTableImage({
  src,
  alt = "Preview",
  className = "h-12 w-20 rounded border border-[var(--border)] object-cover",
  fallbackClassName = "h-12 w-20 rounded border border-dashed border-[var(--border-strong)] bg-[var(--surface-soft)]",
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`grid place-items-center text-xs font-medium text-[var(--muted)] ${fallbackClassName}`}>
        <span className="inline-flex items-center gap-2">
          <ImageOff className="h-4 w-4" />
          <span className="sr-only">Image unavailable</span>
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

function StatusButton({ item, rowId, updatingStatusId, onStatusChange, setUpdatingStatusId }) {
  const isActive = item.status === "active";
  const isUpdating = updatingStatusId === rowId;

  if (!onStatusChange) {
    return (
      <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${isActive ? "bg-[var(--success-soft)] text-[var(--success-text)]" : "bg-[var(--surface-soft)] text-[var(--muted)]"}`}>
        {isActive ? "Active" : "Paused"}
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={isUpdating}
      onClick={async () => {
        setUpdatingStatusId(rowId);
        try {
          await onStatusChange(item);
        } finally {
          setUpdatingStatusId(null);
        }
      }}
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold transition hover:opacity-80 disabled:opacity-60 ${isActive ? "bg-[var(--success-soft)] text-[var(--success-text)]" : "bg-[var(--surface-soft)] text-[var(--muted)]"}`}
    >
      {isUpdating ? "Updating..." : isActive ? "Active" : "Paused"}
    </button>
  );
}

function RowActions({ item, onEdit, onDeleteSingle, onPreview, deleting = false }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        title="View"
        onClick={() => onPreview(item)}
        className="rounded-md p-1.5 text-[var(--primary)] transition hover:bg-[var(--primary-soft)]"
      >
        <ExternalLink size={16} />
      </button>

      {onEdit ? (
        <button
          type="button"
          title="Edit"
          disabled={deleting}
          onClick={() => onEdit(item)}
          className="rounded-md p-1.5 text-[var(--warning)] transition hover:bg-[var(--warning-soft)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pencil size={16} />
        </button>
      ) : null}

      {onDeleteSingle ? (
        <button
          type="button"
          title={deleting ? "Deleting" : "Delete"}
          disabled={deleting}
          onClick={() => onDeleteSingle(item)}
          className="rounded-md p-1.5 text-[var(--danger)] transition hover:bg-[var(--danger-soft)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      ) : null}
    </div>
  );
}

function DeleteConfirmDialog({ pendingDelete, busy, onCancel, onConfirm }) {
  if (!pendingDelete) return null;

  const isBulk = pendingDelete.type === "bulk";
  const title = isBulk ? "Delete selected rows?" : "Delete this row?";
  const target = isBulk
    ? `${pendingDelete.ids.length} selected row${pendingDelete.ids.length === 1 ? "" : "s"}`
    : getRowLabel(pendingDelete.row);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--danger-soft)] text-[var(--danger)]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              This will permanently delete {target}. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--danger)] px-4 text-sm font-semibold text-[var(--danger-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReusableTable({
  data = [],
  columns = [],
  loading = false,
  onEdit,
  onDeleteSingle,
  onBulkDelete,
  onStatusChange,
  enableRowSelection = true,
  confirmDeletes = false,
  emptyMessage = "No data available",
  getRowId = (row) => row.id,
  storageKey = "",
}) {
  const derivedStorageKey = useMemo(() => {
    if (storageKey) return storageKey;
    const signature = columns
      .map((column) => column.id || column.accessorKey || column.header)
      .filter(Boolean)
      .join(":");
    return signature ? `altftool-admin-table:${signature}` : "";
  }, [columns, storageKey]);
  const [rowSelection, setRowSelection] = useState({});
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deletingRowId, setDeletingRowId] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [actionError, setActionError] = useState("");
  const [query, setQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [preferencesReady, setPreferencesReady] = useState(false);

  const canSelectRows = enableRowSelection && Boolean(onBulkDelete);
  const selectedIds = Object.keys(rowSelection);

  const filteredData = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) return data;

    return data.filter((row) =>
      columns.some((column) => {
        const value = getValue(row, column);
        return String(displayValue(value)).toLowerCase().includes(trimmedQuery);
      }),
    );
  }, [columns, data, query]);

  const pageCount = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const firstVisibleRow = filteredData.length === 0 ? 0 : pageIndex * pageSize + 1;
  const lastVisibleRow = Math.min((pageIndex + 1) * pageSize, filteredData.length);
  const visibleRows = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  useEffect(() => {
    setPageIndex(0);
  }, [query, pageSize]);

  useEffect(() => {
    if (pageIndex > pageCount - 1) setPageIndex(pageCount - 1);
  }, [pageCount, pageIndex]);

  useEffect(() => {
    if (!derivedStorageKey || typeof window === "undefined") {
      setPreferencesReady(true);
      return;
    }

    try {
      const saved = JSON.parse(window.localStorage.getItem(derivedStorageKey) || "{}");
      if (typeof saved.query === "string") setQuery(saved.query);
      if (PAGE_SIZES.includes(Number(saved.pageSize))) setPageSize(Number(saved.pageSize));
    } catch {
      // Ignore broken local preferences and continue with defaults.
    } finally {
      setPreferencesReady(true);
    }
  }, [derivedStorageKey]);

  useEffect(() => {
    if (!preferencesReady || !derivedStorageKey || typeof window === "undefined") return;

    window.localStorage.setItem(
      derivedStorageKey,
      JSON.stringify({
        query,
        pageSize,
      }),
    );
  }, [derivedStorageKey, pageSize, preferencesReady, query]);

  useEffect(() => {
    const validIds = new Set(data.map((row) => String(getRowId(row))));

    setRowSelection((current) => {
      const next = Object.fromEntries(Object.entries(current).filter(([id]) => validIds.has(id)));
      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
  }, [data, getRowId]);

  function openPreviewModal(rowData) {
    setSelectedRow(rowData);
    setPreviewModal(true);
  }

  function closePreviewModal() {
    setPreviewModal(false);
    setSelectedRow(null);
  }

  async function runTableAction(action, fallbackMessage) {
    setActionError("");

    try {
      const result = await action();
      return result !== false;
    } catch (error) {
      console.error(fallbackMessage, error);
      setActionError(error?.message || fallbackMessage);
      return false;
    }
  }

  async function executeDeleteSingle(row) {
    if (!onDeleteSingle) return;

    const rowId = String(getRowId(row));
    setDeletingRowId(rowId);

    const completed = await runTableAction(
      () => onDeleteSingle(rowId, row),
      "Delete failed. Please retry after checking Firebase access.",
    );

    setDeletingRowId(null);
    return completed;
  }

  function requestDeleteSingle(row) {
    if (confirmDeletes) {
      setPendingDelete({ type: "single", row });
      return;
    }

    executeDeleteSingle(row);
  }

  async function executeBulkDelete(ids = selectedIds) {
    if (!onBulkDelete || ids.length === 0) return false;

    setBulkDeleting(true);
    const completed = await runTableAction(
      () => onBulkDelete(ids),
      "Bulk delete failed. Please retry after checking Firebase access.",
    );

    if (completed) setRowSelection({});
    setBulkDeleting(false);
    return completed;
  }

  function requestBulkDelete() {
    if (!onBulkDelete || selectedIds.length === 0) return;

    if (confirmDeletes) {
      setPendingDelete({ type: "bulk", ids: [...selectedIds] });
      return;
    }

    executeBulkDelete([...selectedIds]);
  }

  async function confirmPendingDelete() {
    const action = pendingDelete;
    if (!action) return;

    if (action.type === "bulk") {
      await executeBulkDelete(action.ids);
    } else {
      await executeDeleteSingle(action.row);
    }

    setPendingDelete(null);
  }

  async function handleStatusChange(item) {
    if (!onStatusChange) return;

    await runTableAction(
      () => onStatusChange(item),
      "Status update failed. Please retry after checking Firebase access.",
    );
  }

  function renderCell(row, column, rowIndex) {
    const rowId = getRowId(row);
    const tableRow = { original: row, index: pageIndex * pageSize + rowIndex };
    const cell = { getValue: () => getValue(row, column) };

    if (column.type === "status") {
      return (
        <StatusButton
          item={row}
          rowId={rowId}
          updatingStatusId={updatingStatusId}
          onStatusChange={onStatusChange ? handleStatusChange : undefined}
          setUpdatingStatusId={setUpdatingStatusId}
        />
      );
    }

    if (column.type === "action") {
      return (
        <RowActions
          item={row}
          onEdit={onEdit}
          onDeleteSingle={onDeleteSingle ? requestDeleteSingle : undefined}
          onPreview={openPreviewModal}
          deleting={deletingRowId === String(rowId)}
        />
      );
    }

    if (typeof column.Cell === "function") {
      return column.Cell({ row: tableRow, cell });
    }

    return displayValue(cell.getValue());
  }

  const visibleIds = visibleRows.map((row) => String(getRowId(row)));
  const allVisibleSelected = canSelectRows && visibleIds.length > 0 && visibleIds.every((id) => rowSelection[id]);

  function toggleAllVisible() {
    setRowSelection((current) => {
      const next = { ...current };
      if (allVisibleSelected) {
        visibleIds.forEach((id) => {
          delete next[id];
        });
      } else {
        visibleIds.forEach((id) => {
          next[id] = true;
        });
      }
      return next;
    });
  }

  if (loading) {
    return (
      <AdminDataState
        type="loading"
        title="Loading table data"
        message="Fetching the latest admin rows and preparing table controls."
      >
        <AdminDataSkeleton rows={6} showHeader />
      </AdminDataState>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <AdminDataState
        type="empty"
        title={emptyMessage}
        message="Once Firebase returns records, this table will unlock search, preview, status, and bulk actions."
      />
    );
  }

  return (
    <div className="max-w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search rows"
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm outline-none transition focus:border-[var(--primary)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
          <span>
            {filteredData.length} row{filteredData.length === 1 ? "" : "s"}
          </span>
          {filteredData.length > 0 ? (
            <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
              Showing {firstVisibleRow}-{lastVisibleRow}
            </span>
          ) : null}
          {selectedIds.length > 0 ? (
            <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
              {selectedIds.length} selected
            </span>
          ) : null}
          {selectedIds.length > 0 && onBulkDelete ? (
            <button
              type="button"
              onClick={() => setRowSelection({})}
              disabled={bulkDeleting}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear selection
            </button>
          ) : null}
          {selectedIds.length > 0 && onBulkDelete ? (
            <button
              type="button"
              onClick={requestBulkDelete}
              disabled={bulkDeleting}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--danger)] px-3 text-sm font-semibold text-[var(--danger-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {bulkDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {bulkDeleting ? "Deleting..." : `Delete selected (${selectedIds.length})`}
            </button>
          ) : null}
        </div>
      </div>

      {actionError ? (
        <div className="mx-4 mb-4 flex items-start gap-2 rounded-lg border border-[var(--warning)]/30 bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      ) : null}

      <div className="md:hidden">
        {visibleRows.length > 0 ? (
          <div className="grid gap-3 p-4">
            {visibleRows.map((row, rowIndex) => {
            const rowId = String(getRowId(row));
            const actionColumn = columns.find((column) => column.type === "action");
            const cardColumns = columns
              .filter((column) => column.type !== "action")
              .slice(0, 5);

            return (
              <article key={rowId || rowIndex} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-bold text-[var(--foreground)]">{getRowLabel(row)}</p>
                    <p className="mt-1 text-xs font-semibold text-[var(--muted)]">Row {pageIndex * pageSize + rowIndex + 1}</p>
                  </div>
                  {canSelectRows ? (
                    <input
                      type="checkbox"
                      checked={Boolean(rowSelection[rowId])}
                      onChange={() =>
                        setRowSelection((current) => {
                          const next = { ...current };
                          if (next[rowId]) delete next[rowId];
                          else next[rowId] = true;
                          return next;
                        })
                      }
                      className="h-4 w-4 rounded border-[var(--border)]"
                      aria-label={`Select ${getRowLabel(row)}`}
                    />
                  ) : null}
                </div>

                <dl className="mt-4 grid gap-3">
                  {cardColumns.map((column, columnIndex) => (
                    <div key={`${rowId}-${column.id || column.accessorKey || column.header || columnIndex}`} className="rounded-lg bg-[var(--surface-soft)] p-3">
                      <dt className="text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">
                        {column.header || column.accessorKey || "Value"}
                      </dt>
                      <dd className="mt-1 break-words text-sm font-semibold text-[var(--foreground)]">
                        {renderCell(row, column, rowIndex)}
                      </dd>
                    </div>
                  ))}
                </dl>

                {actionColumn ? (
                  <div className="mt-4 flex justify-end border-t border-[var(--border)] pt-3">
                    {renderCell(row, actionColumn, rowIndex)}
                  </div>
                ) : null}
              </article>
            );
            })}
          </div>
        ) : (
          <div className="p-4">
            <AdminDataState
              type="empty"
              compact
              title="No matching rows"
              message={query ? `No rows match "${query}". Clear search to return to all rows.` : emptyMessage}
              actions={query ? [{ label: "Clear search", onClick: () => setQuery(""), icon: X }] : []}
            />
          </div>
        )}
      </div>

      <div className="hidden max-w-full overflow-x-auto md:block">
        <table className="min-w-[720px] w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[var(--surface-soft)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            <tr>
              {canSelectRows ? (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    className="h-4 w-4 rounded border-[var(--border)]"
                    aria-label="Select visible rows"
                  />
                </th>
              ) : null}
              {columns.map((column, index) => (
                <th
                  key={column.id || column.accessorKey || column.header || index}
                  className="whitespace-nowrap px-4 py-3"
                  style={column.size ? { width: `${column.size}px` } : undefined}
                >
                  {column.header || column.accessorKey || ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]">
            {visibleRows.length > 0 ? (
              visibleRows.map((row, rowIndex) => {
                const rowId = String(getRowId(row));
                return (
                  <tr key={rowId || rowIndex} className="transition hover:bg-[var(--surface-soft)]">
                    {canSelectRows ? (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={Boolean(rowSelection[rowId])}
                          onChange={() =>
                            setRowSelection((current) => {
                              const next = { ...current };
                              if (next[rowId]) delete next[rowId];
                              else next[rowId] = true;
                              return next;
                            })
                          }
                          className="h-4 w-4 rounded border-[var(--border)]"
                          aria-label={`Select row ${rowIndex + 1}`}
                        />
                      </td>
                    ) : null}
                    {columns.map((column, columnIndex) => (
                      <td
                        key={`${rowId}-${column.id || column.accessorKey || column.header || columnIndex}`}
                        className="max-w-[240px] px-4 py-3 align-middle"
                      >
                        <div className="break-words">{renderCell(row, column, rowIndex)}</div>
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + (canSelectRows ? 1 : 0)} className="px-4 py-10 text-center font-medium text-[var(--muted)]">
                  <AdminDataState
                    type="empty"
                    compact
                    title="No matching rows"
                    message={query ? `No rows match "${query}". Clear search to return to all rows.` : emptyMessage}
                    actions={query ? [{ label: "Clear search", onClick: () => setQuery(""), icon: X }] : []}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Rows per page
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-[var(--foreground)]"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <span>
            Page {pageIndex + 1} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPageIndex((value) => Math.max(0, value - 1))}
            disabled={pageIndex === 0}
            className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setPageIndex((value) => Math.min(pageCount - 1, value + 1))}
            disabled={pageIndex >= pageCount - 1}
            className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <DeleteConfirmDialog
        pendingDelete={pendingDelete}
        busy={bulkDeleting || Boolean(deletingRowId)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmPendingDelete}
      />

      {previewModal && selectedRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-[var(--surface)] shadow-2xl">
            <button
              type="button"
              onClick={closePreviewModal}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--muted)] shadow-md transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
            >
              <X size={18} />
            </button>

            <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary-soft)] to-[var(--accent-soft)] px-6 py-5">
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Preview Details</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">View complete information for this row</p>
            </div>

            <div className="max-h-[85vh] overflow-y-auto px-6 py-6">
              <div className="space-y-5">
                {(selectedRow.image || selectedRow.img) && (
                  <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]">
                    <SafeTableImage
                      src={selectedRow.image || selectedRow.img}
                      alt={selectedRow.title || "Preview"}
                      className="h-72 w-full object-contain"
                      fallbackClassName="h-72 w-full rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--surface-soft)]"
                    />
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {["category", "title", "country", "offerType"].map((key) =>
                    selectedRow[key] ? (
                      <div key={key} className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                        <p className="mb-1 text-sm font-medium capitalize text-[var(--muted)]">{key.replace(/([A-Z])/g, " $1")}</p>
                        <p className="text-base font-semibold text-[var(--foreground)]">{selectedRow[key]}</p>
                      </div>
                    ) : null,
                  )}

                  {(selectedRow.discount || selectedRow.cashback || selectedRow.points || selectedRow.code) ? (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                      <p className="mb-1 text-sm font-medium text-[var(--muted)]">Saving</p>
                      <p className="text-base font-semibold text-[var(--foreground)]">
                        {selectedRow.discount || selectedRow.cashback || selectedRow.points || selectedRow.code}
                      </p>
                    </div>
                  ) : null}
                </div>

                {selectedRow.link ? (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                    <p className="mb-1 text-sm font-medium text-[var(--muted)]">Link</p>
                    <a
                      href={selectedRow.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sm font-medium text-[var(--primary)] underline underline-offset-4 hover:text-[var(--primary-hover)]"
                    >
                      {selectedRow.link}
                    </a>
                  </div>
                ) : null}

                {(selectedRow.verificationStatus || selectedRow.successRate !== undefined) ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                      <p className="mb-1 text-sm font-medium text-[var(--muted)]">Verification</p>
                      <p className="text-base font-semibold capitalize text-[var(--foreground)]">
                        {selectedRow.verificationStatus || "pending"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                      <p className="mb-1 text-sm font-medium text-[var(--muted)]">Success Rate</p>
                      <p className="text-base font-semibold text-[var(--foreground)]">
                        {Math.round(Number(selectedRow.successRate) || 0)}%
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                      <p className="mb-1 text-sm font-medium text-[var(--muted)]">Votes</p>
                      <p className="text-base font-semibold text-[var(--foreground)]">
                        {Number(selectedRow.workingVotes) || 0} working / {Number(selectedRow.failedVotes) || 0} failed
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                      <p className="mb-1 text-sm font-medium text-[var(--muted)]">Last Verified</p>
                      <p className="text-base font-semibold text-[var(--foreground)]">{selectedRow.lastVerifiedAt || "-"}</p>
                    </div>
                    {selectedRow.reviewNote ? (
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 sm:col-span-2">
                        <p className="mb-1 text-sm font-medium text-[var(--muted)]">Review Note</p>
                        <p className="text-base font-semibold text-[var(--foreground)]">{selectedRow.reviewNote}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {selectedRow?.BrandDetail?.length > 0 ? (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                    <h3 className="mb-4 text-lg font-bold text-[var(--foreground)]">Brand Details</h3>
                    <div className="space-y-4">
                      {selectedRow.BrandDetail.map((item, index) => (
                        <div key={index} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                          {(item.image || selectedRow.img) ? (
                            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]">
                              <SafeTableImage
                                src={item.image || selectedRow.img}
                                alt={item.title || "Preview"}
                                className="h-72 w-full object-contain"
                                fallbackClassName="h-72 w-full rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--surface-soft)]"
                              />
                            </div>
                          ) : null}
                          <p className="font-semibold text-[var(--foreground)]">{item.title}</p>
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="break-all text-sm font-medium text-[var(--primary)] underline underline-offset-4 hover:text-[var(--primary-hover)]"
                            >
                              {item.link}
                            </a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ReusableTable;
