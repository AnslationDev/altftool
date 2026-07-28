"use client";

import { Fragment, useMemo, useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
} from "@tanstack/react-table";
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Pencil, Trash2, ExternalLink,
  Columns3, Maximize2, Minimize2, X, Check, Search,
  LayoutGrid, SlidersHorizontal,
  Globe2, Eye, EyeOff,
  BookOpen, MapPin, Zap, Tag, DollarSign,
  Image as ImageIcon, Link, AlignLeft, Type,
} from "lucide-react";

/* ════════════════════════════════════════
   Portal Tooltip
════════════════════════════════════════ */
function Tooltip({ label, children, direction = "top" }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos(direction === "bottom"
      ? { top: r.bottom + 8, left: r.left + r.width / 2 }
      : { top: r.top - 8, left: r.left + r.width / 2 });
  }, [direction]);
  const hide = useCallback(() => setPos(null), []);

  const tip = pos && typeof document !== "undefined"
    ? createPortal(
        <div
          className="pointer-events-none fixed z-[9999] px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap bg-[var(--foreground)] text-[var(--background)] shadow-xl"
          style={direction === "bottom"
            ? { top: pos.top, left: pos.left, transform: "translateX(-50%)" }
            : { top: pos.top, left: pos.left, transform: "translateX(-50%) translateY(-100%)" }}>
          {label}
          {direction === "bottom"
            ? <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-[var(--foreground)]" />
            : <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[var(--foreground)]" />}
        </div>, document.body)
    : null;

  return (
    <>
      <div ref={ref} className="inline-flex" onMouseEnter={show} onMouseLeave={hide}>{children}</div>
      {tip}
    </>
  );
}

/* ════════════════════════════════════════
   Sort Icon
════════════════════════════════════════ */
function SortIcon({ sorted }) {
  if (sorted === "asc")  return <ChevronUp   className="w-3.5 h-3.5 text-[var(--primary)]" />;
  if (sorted === "desc") return <ChevronDown className="w-3.5 h-3.5 text-[var(--primary)]" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-[var(--muted)]/50 group-hover/hd:text-[var(--muted)] transition-colors" />;
}

/* ════════════════════════════════════════
   Resize Handle
════════════════════════════════════════ */
function ResizeHandle({ header }) {
  return (
    <div
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      onClick={(e) => e.stopPropagation()}
      className={`absolute right-0 top-0 h-full w-4 flex items-center justify-center cursor-col-resize select-none touch-none group/rz z-10 ${header.column.getIsResizing() ? "opacity-100" : "opacity-0 hover:opacity-100"}`}>
      <div className={`w-0.5 h-5 rounded-full transition-colors ${header.column.getIsResizing() ? "bg-[var(--primary)]" : "bg-[var(--border-strong)] group-hover/rz:bg-[var(--primary)]"}`} />
    </div>
  );
}

/* ════════════════════════════════════════
   Column Panel
════════════════════════════════════════ */
function ColumnPanel({ table, onClose }) {
  return (
    <div className="absolute right-0 top-11 z-50 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-3 animate-in fade-in slide-in-from-top-1 duration-150">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--muted)]" />
          <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Columns</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-[var(--surface-soft)] rounded-lg transition-colors">
          <X className="w-3.5 h-3.5 text-[var(--muted)]" />
        </button>
      </div>
      <div className="space-y-0.5">
        {table.getAllLeafColumns().map((col) => {
          if (["select", "actions"].includes(col.id)) return null;
          const visible = col.getIsVisible();
          return (
            <label key={col.id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[var(--surface-soft)] cursor-pointer group transition-colors">
              <div className={`w-4 h-4 rounded-[5px] border flex items-center justify-center transition-all ${visible ? "bg-[var(--primary)] border-[var(--primary)]" : "border-[var(--border-strong)] group-hover:border-[var(--muted)]"}`}>
                {visible && <Check className="w-2.5 h-2.5 text-[var(--primary-foreground)]" />}
              </div>
              <input type="checkbox" className="sr-only" checked={visible} onChange={col.getToggleVisibilityHandler()} />
              <span className={`text-sm transition-colors ${visible ? "text-[var(--foreground)] font-medium" : "text-[var(--muted)]"}`}>
                {col.columnDef.header}
              </span>
              {visible
                ? <Eye   className="w-3 h-3 text-[var(--muted)]/50 ml-auto" />
                : <EyeOff className="w-3 h-3 text-[var(--muted)]/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   New Badge
════════════════════════════════════════ */
function NewBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--success-soft)] text-[var(--success-text)] uppercase tracking-wide">
      New
    </span>
  );
}

/* ════════════════════════════════════════
   Thumbnail cell — shared
════════════════════════════════════════ */
function ThumbCell({ src, title, badge }) {
  const [err, setErr] = useState(false);
  return (
    <div className="relative shrink-0 w-16 h-9 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface-soft)]">
      {src && !err ? (
        <img src={src} alt={title} onError={() => setErr(true)} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[var(--accent-soft)]">
          <span className="text-[var(--accent)] font-bold text-sm">{title?.[0]?.toUpperCase()}</span>
        </div>
      )}
      {badge && (
        /* Scrim sits on top of arbitrary photo content, so it needs
           guaranteed light-on-dark contrast in both themes rather than a
           surface token — var(--overlay) is already dark in both light and
           dark mode, paired here with literal white text. Same carve-out
           reasoning as the categorical palette in ads/components/AdsTable.jsx. */
        <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold bg-[var(--overlay)] text-white px-1 rounded leading-tight">
          {badge}
        </span>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Action buttons — shared
════════════════════════════════════════ */
function ActionCell({ item, onEdit, onDelete, linkKey = "ctaLink" }) {
  const link = item[linkKey] || item.ctaLink || item.link;
  return (
    <div className="flex gap-1 items-center">
      <Tooltip label="Edit">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(item); }}
          className="p-1.5 rounded-lg hover:bg-[var(--primary-soft)] transition">
          <Pencil className="w-4 h-4 text-[var(--primary)]" />
        </button>
      </Tooltip>
      <Tooltip label="Delete">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
          className="p-1.5 rounded-lg hover:bg-[var(--danger-soft)] transition">
          <Trash2 className="w-4 h-4 text-[var(--danger)]" />
        </button>
      </Tooltip>
      {link && (
        <Tooltip label="Open">
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-soft)] transition inline-flex">
            <ExternalLink className="w-4 h-4 text-[var(--muted)]" />
          </a>
        </Tooltip>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Per-type COLUMN DEFINITIONS
════════════════════════════════════════ */

/* ── Select checkbox column (shared) ── */
const selectCol = (selected, allSelected, someSelected, toggleSelect, toggleSelectAll) => ({
  id: "select",
  header: () => (
    <input
      type="checkbox"
      checked={allSelected}
      ref={(el) => { if (el) el.indeterminate = someSelected; }}
      onChange={toggleSelectAll}
      className="w-4 h-4 rounded accent-[var(--primary)] cursor-pointer"
    />
  ),
  cell: ({ row }) => (
    <input
      type="checkbox"
      checked={selected.includes(row.original.id)}
      onChange={() => toggleSelect(row.original.id)}
      onClick={(e) => e.stopPropagation()}
      className="w-4 h-4 rounded accent-[var(--primary)] cursor-pointer"
    />
  ),
  size: 48,
  enableSorting: false,
});

/* ── flashSale / trendingSale columns ── */
function buildProductColumns({ selected, allSelected, someSelected, toggleSelect, toggleSelectAll, newIds, onEdit, onDelete }) {
  return [
    selectCol(selected, allSelected, someSelected, toggleSelect, toggleSelectAll),
    {
      id: "title",
      accessorKey: "title",
      header: "Product",
      size: 280,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <ThumbCell src={item.image} title={item.title} badge="SALE" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--foreground)] text-sm truncate block leading-tight max-w-[180px]">
                  {item.title}
                </span>
                {newIds.has(item.id) && <NewBadge />}
              </div>
              {item.subtitle && (
                <span className="text-[11px] text-[var(--accent)] font-medium mt-0.5 block truncate">{item.subtitle}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "productTitle",
      accessorKey: "productTitle",
      header: "Product Title",
      size: 240,
      cell: ({ getValue }) => (
        <span className="text-sm text-[var(--foreground)] line-clamp-2 leading-snug">{getValue() || "—"}</span>
      ),
    },
    {
      id: "price",
      header: "Price",
      size: 150,
      accessorFn: (row) => row.price,
      cell: ({ row }) => {
        const { price, oldPrice, discount } = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-[var(--foreground)] text-sm">{price || "—"}</span>
            {oldPrice && (
              <span className="text-[11px] text-[var(--muted)] line-through">{oldPrice}</span>
            )}
            {discount && (
              <span className="text-[10px] font-semibold text-[var(--success-text)]">{discount}</span>
            )}
          </div>
        );
      },
    },
    {
      id: "ctaLink",
      header: "CTA Link",
      size: 160,
      accessorFn: (row) => row.ctaLink,
      cell: ({ getValue }) => {
        const url = getValue();
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline truncate max-w-[140px]">
            <Globe2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
          </a>
        ) : <span className="text-[var(--muted)] text-xs">—</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      size: 100,
      cell: ({ row }) => <ActionCell item={row.original} onEdit={onEdit} onDelete={onDelete} />,
    },
  ];
}

/* ── dealOfTheDay columns ── */
function buildDotdColumns({ selected, allSelected, someSelected, toggleSelect, toggleSelectAll, newIds, onEdit, onDelete }) {
  return [
    selectCol(selected, allSelected, someSelected, toggleSelect, toggleSelectAll),
    {
      id: "title",
      accessorKey: "title",
      header: "Category",
      size: 260,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <ThumbCell src={item.image} title={item.title} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--foreground)] text-sm truncate block">{item.title}</span>
                {newIds.has(item.id) && <NewBadge />}
              </div>
              {item.subtitle && (
                <span className="text-[11px] text-[var(--accent)] font-medium mt-0.5 block truncate">{item.subtitle}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "image",
      header: "Image",
      size: 200,
      accessorFn: (row) => row.image,
      cell: ({ getValue }) => {
        const url = getValue();
        return url ? (
          <span className="flex items-center gap-1 text-xs text-[var(--muted)] truncate max-w-[180px]">
            <ImageIcon className="w-3 h-3 shrink-0 text-[var(--muted)]" />
            <span className="truncate">{url}</span>
          </span>
        ) : <span className="text-[var(--muted)] text-xs">—</span>;
      },
    },
    {
      id: "link",
      header: "Link",
      size: 180,
      accessorFn: (row) => row.link,
      cell: ({ getValue }) => {
        const url = getValue();
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline truncate max-w-[160px]">
            <Globe2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
          </a>
        ) : <span className="text-[var(--muted)] text-xs">—</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      size: 100,
      cell: ({ row }) => <ActionCell item={row.original} onEdit={onEdit} onDelete={onDelete} linkKey="link" />,
    },
  ];
}

/* ── hero columns ── */
function buildHeroColumns({ selected, allSelected, someSelected, toggleSelect, toggleSelectAll, newIds, onEdit, onDelete }) {
  return [
    selectCol(selected, allSelected, someSelected, toggleSelect, toggleSelectAll),
    {
      id: "headline",
      accessorKey: "headline",
      header: "Headline",
      size: 240,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <ThumbCell src={item.heroImage} title={item.headline} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--foreground)] text-sm truncate block">{item.headline}</span>
                {newIds.has(item.id) && <NewBadge />}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "subtext",
      accessorKey: "subtext",
      header: "Subtext",
      size: 240,
      cell: ({ getValue }) => (
        <span className="text-sm text-[var(--muted)] line-clamp-2 leading-snug">{getValue() || "—"}</span>
      ),
    },
    {
      id: "heroImage",
      header: "Hero Image",
      size: 200,
      accessorFn: (row) => row.heroImage,
      cell: ({ getValue }) => {
        const url = getValue();
        return url ? (
          <span className="flex items-center gap-1 text-xs text-[var(--muted)] truncate max-w-[180px]">
            <ImageIcon className="w-3 h-3 shrink-0 text-[var(--muted)]" />
            <span className="truncate">{url}</span>
          </span>
        ) : <span className="text-[var(--muted)] text-xs">—</span>;
      },
    },
    {
      id: "ctaLink",
      header: "CTA Link",
      size: 160,
      accessorFn: (row) => row.ctaLink,
      cell: ({ getValue }) => {
        const url = getValue();
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline truncate max-w-[140px]">
            <Globe2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
          </a>
        ) : <span className="text-[var(--muted)] text-xs">—</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      size: 100,
      cell: ({ row }) => <ActionCell item={row.original} onEdit={onEdit} onDelete={onDelete} />,
    },
  ];
}

/* ════════════════════════════════════════
   Expanded detail row — adapts per type
════════════════════════════════════════ */
function ExpandedRow({ item, colSpan, onEdit }) {
  const type = item.type;

  const isProduct  = type === "flashSale" || type === "trendingSale";
  const isDotd     = type === "dealOfTheDay";
  const isHero     = type === "hero";

  const imgSrc  = isHero ? item.heroImage : item.image;
  const title   = isHero ? item.headline  : item.title;
  const subline = isHero ? item.subtext   : item.subtitle || item.subTitle;
  const link    = item.ctaLink || item.link;

  return (
    <tr className="bg-[var(--accent-soft)]/40 border-b border-[var(--accent)]/20">
      <td colSpan={colSpan} className="px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">

          {/* Preview */}
          <div className="sm:col-span-4 space-y-2">
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-1.5">
              <LayoutGrid className="w-3 h-3" />Preview
            </p>
            {imgSrc ? (
              <div className="rounded-2xl overflow-hidden border border-[var(--accent)]/20 bg-[var(--surface)] shadow-sm aspect-video">
                <img src={imgSrc} alt={title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] aspect-video flex flex-col items-center justify-center gap-2 text-[var(--muted)]">
                <BookOpen className="w-6 h-6 text-[var(--muted)]/60" />
                <span className="text-xs font-medium">No preview</span>
              </div>
            )}

            {/* Meta chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.offer && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--danger-text)] bg-[var(--danger-soft)] border border-[var(--danger)]/30 px-2 py-0.5 rounded-full">
                  <Zap className="w-3 h-3" />{item.offer}
                </span>
              )}
              {item.city && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent)]/30 px-2 py-0.5 rounded-full capitalize">
                  <MapPin className="w-3 h-3" />{item.city}
                </span>
              )}
              {item.area && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--info)] bg-[var(--info-soft)] border border-[var(--info)]/30 px-2 py-0.5 rounded-full capitalize">
                  {item.area}
                </span>
              )}
              {link && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)] bg-[var(--primary-soft)] border border-[var(--primary)]/30 px-2 py-0.5 rounded-full">
                  <Globe2 className="w-3 h-3" />Has Link
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="sm:col-span-8 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-[var(--foreground)] text-base leading-tight">{title}</h3>
                {subline && <p className="text-sm text-[var(--muted)] mt-0.5">{subline}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] bg-[var(--primary-soft)] hover:opacity-90 border border-[var(--primary)]/30 rounded-xl transition-colors">
                  <Pencil className="w-3 h-3" />Edit
                </button>
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--muted)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl transition-colors">
                    <ExternalLink className="w-3 h-3" />Visit
                  </a>
                )}
              </div>
            </div>

            {/* flashSale / trendingSale pricing */}
            {isProduct && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Pricing</p>
                <div className="flex items-baseline gap-3 flex-wrap">
                  {item.price && (
                    <span className="text-xl font-bold text-[var(--foreground)]">{item.price}</span>
                  )}
                  {item.oldPrice && (
                    <span className="text-sm text-[var(--muted)] line-through">{item.oldPrice}</span>
                  )}
                  {item.discount && (
                    <span className="text-sm font-bold text-[var(--success-text)]">{item.discount}</span>
                  )}
                </div>
                {item.productTitle && (
                  <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">{item.productTitle}</p>
                )}
              </div>
            )}

            {/* dealOfTheDay image path */}
            {isDotd && item.image && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Image Path</p>
                <p className="text-xs font-mono text-[var(--muted)] bg-[var(--surface-soft)] px-3 py-2 rounded-lg border border-[var(--border)] break-all">
                  {item.image}
                </p>
              </div>
            )}

            {/* hero image path */}
            {isHero && item.heroImage && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Hero Image</p>
                <p className="text-xs font-mono text-[var(--muted)] bg-[var(--surface-soft)] px-3 py-2 rounded-lg border border-[var(--border)] break-all">
                  {item.heroImage}
                </p>
              </div>
            )}

            {/* CTA Link */}
            {link && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                  {isDotd ? "Link" : "CTA Link"}
                </p>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-[var(--primary)] hover:underline break-all">
                  {link}
                </a>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ════════════════════════════════════════
   Search filter — adapts per type
════════════════════════════════════════ */
function filterByType(data, query, type) {
  if (!query.trim()) return data;
  const q = query.toLowerCase();

  if (type === "flashSale" || type === "trendingSale") {
    return data.filter((item) =>
      item.title?.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.productTitle?.toLowerCase().includes(q) ||
      item.price?.toLowerCase().includes(q) ||
      item.discount?.toLowerCase().includes(q)
    );
  }
  if (type === "dealOfTheDay") {
    return data.filter((item) =>
      item.title?.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q)
    );
  }
  if (type === "hero") {
    return data.filter((item) =>
      item.headline?.toLowerCase().includes(q) ||
      item.subtext?.toLowerCase().includes(q)
    );
  }
  // nearby / all (fallback)
  return data.filter((item) =>
    item.title?.toLowerCase().includes(q) ||
    item.subtitle?.toLowerCase().includes(q) ||
    item.headline?.toLowerCase().includes(q) ||
    item.subTitle?.toLowerCase().includes(q) ||
    item.area?.toLowerCase().includes(q) ||
    item.city?.toLowerCase().includes(q) ||
    item.offer?.toLowerCase().includes(q)
  );
}

/* ════════════════════════════════════════
   Type label helper
════════════════════════════════════════ */
const TYPE_LABELS = {
  flashSale:    "Flash Sale",
  trendingSale: "Trending Sale",
  dealOfTheDay: "Deal of the Day",
  hero:         "Hero",
  nearby:       "Nearby Deals",
  all:          "Sale",
};

/* ════════════════════════════════════════
   Main SalesTable
════════════════════════════════════════ */
export default function SalesTable({ data = [], selected, toggleSelect, toggleSelectAll, activeTab, onEdit, onDelete }) {
  const [expandedId,       setExpandedId]       = useState(null);
  const [sorting,          setSorting]          = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnSizing,     setColumnSizing]     = useState({});
  const [showColumnPanel,  setShowColumnPanel]  = useState(false);
  const [isFullscreen,     setIsFullscreen]     = useState(false);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [hoveredRowId,     setHoveredRowId]     = useState(null);

  const columnPanelRef = useRef(null);
  const searchRef      = useRef(null);

  /* ── Reset on tab change ── */
  useEffect(() => {
    setExpandedId(null);
    setSearchQuery("");
    setColumnVisibility({});
    setSorting([]);
  }, [activeTab]);

  /* ── New-badge tracking (mirrors ExtensionsTable pattern) ── */
  const initialIdsRef = useRef(null);
  const [newIds, setNewIds] = useState(new Set());
  useEffect(() => {
    if (initialIdsRef.current === null) {
      initialIdsRef.current = new Set(data.map((a) => a.id));
      return;
    }
    const fresh = data.filter((a) => !initialIdsRef.current.has(a.id)).map((a) => a.id);
    if (fresh.length > 0) {
      setNewIds((prev) => new Set([...prev, ...fresh]));
      initialIdsRef.current = new Set(data.map((a) => a.id));
      const t = setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          fresh.forEach((id) => next.delete(id));
          return next;
        });
      }, 10000);
      return () => clearTimeout(t);
    }
  }, [data]);

  /* ── Sorted + filtered data (mirrors ExtensionsTable pattern) ── */
  const filteredData = useMemo(() => {
    // Sort newest first — use createdAt if available, fall back to id comparison
    const sorted = [...data].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        // Handle both Firestore Timestamps and plain date strings/numbers
        const aTime = a.createdAt?.toMillis?.() ?? new Date(a.createdAt).getTime();
        const bTime = b.createdAt?.toMillis?.() ?? new Date(b.createdAt).getTime();
        return bTime - aTime;
      }
      // Fallback: numeric or string id
      const aId = typeof a.id === "number" ? a.id : parseInt(a.id, 10) || 0;
      const bId = typeof b.id === "number" ? b.id : parseInt(b.id, 10) || 0;
      return bId - aId;
    });

    return filterByType(sorted, searchQuery, activeTab);
  }, [data, searchQuery, activeTab]);

  const totalCount    = data.length;
  const filteredCount = filteredData.length;

  const allSelected  = filteredData.length > 0 && selected.length === filteredData.length;
  const someSelected = selected.length > 0 && selected.length < filteredData.length;

  /* ── Build columns by tab ── */
  const columns = useMemo(() => {
    const shared = { selected, allSelected, someSelected, toggleSelect, toggleSelectAll, newIds, onEdit, onDelete };

    if (activeTab === "flashSale" || activeTab === "trendingSale" || activeTab === "all")
      return buildProductColumns(shared);
    if (activeTab === "dealOfTheDay") return buildDotdColumns(shared);
    if (activeTab === "hero")         return buildHeroColumns(shared);

    // Fallback: nearby / unknown — keep original nearby columns
    return [
      selectCol(selected, allSelected, someSelected, toggleSelect, toggleSelectAll),
      {
        id: "title", accessorKey: "title", header: "Store", size: 280,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3 min-w-0">
              <ThumbCell src={item.image} title={item.title} badge={item.offer ? "SALE" : undefined} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--foreground)] text-sm truncate block">{item.title}</span>
                  {newIds.has(item.id) && <NewBadge />}
                </div>
                {item.subTitle && (
                  <span className="text-[11px] text-[var(--accent)] font-medium mt-0.5 block truncate">{item.subTitle}</span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "offer", header: "Offer", size: 130,
        cell: ({ getValue, row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs bg-[var(--danger-soft)] text-[var(--danger-text)] font-bold px-2 py-1 rounded-full inline-block w-fit">
              {getValue() || "—"}
            </span>
            {row.original.offerText && (
              <span className="text-[11px] text-[var(--muted)] pl-1">{row.original.offerText}</span>
            )}
          </div>
        ),
      },
      {
        id: "price", header: "Price", size: 150,
        accessorFn: (row) => row.salePrice,
        cell: ({ row }) => {
          const { salePrice, originalPrice, currency = "₹" } = row.original;
          const fmt = (n) => n ? `${currency}${Number(n).toLocaleString("en-IN")}` : "—";
          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-[var(--foreground)] text-sm">{fmt(salePrice)}</span>
              {originalPrice > 0 && <span className="text-[11px] text-[var(--muted)] line-through">{fmt(originalPrice)}</span>}
            </div>
          );
        },
      },
      {
        accessorKey: "city", header: "Location", size: 140,
        cell: ({ getValue, row }) => (
          <div className="flex flex-col gap-0.5">
            {getValue() ? (
              <span className="flex items-center gap-1 text-xs text-[var(--foreground)] font-medium">
                <MapPin className="w-3 h-3 text-[var(--accent)] shrink-0" />{getValue()}
              </span>
            ) : null}
            {row.original.area && <span className="text-[11px] text-[var(--muted)] pl-4">{row.original.area}</span>}
            {!getValue() && !row.original.area && <span className="text-xs text-[var(--muted)]">Online</span>}
          </div>
        ),
      },
      {
        id: "actions", header: "Actions", enableSorting: false, size: 100,
        cell: ({ row }) => <ActionCell item={row.original} onEdit={onEdit} onDelete={onDelete} />,
      },
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selected, allSelected, someSelected, newIds]);

  /* ── Table instance ── */
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnVisibility, columnSizing },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    getRowId: (row) => String(row.id),
  });

  /* ── Outside click: column panel ── */
  useEffect(() => {
    const h = (e) => {
      if (columnPanelRef.current && !columnPanelRef.current.contains(e.target))
        setShowColumnPanel(false);
    };
    if (showColumnPanel) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showColumnPanel]);

  /* ── Escape: exit fullscreen ── */
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setIsFullscreen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  /* ── Fullscreen: lock scroll ── */
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isFullscreen]);

  /* ── Cmd/Ctrl+F: focus search ── */
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const typeLabel    = TYPE_LABELS[activeTab] || "Sale";
  const wrapperClass = isFullscreen
    ? "fixed inset-0 z-50 bg-[var(--surface)] flex flex-col"
    : "bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm flex flex-col overflow-hidden";

  return (
    <div className={wrapperClass}>

      {/* ── Top Toolbar ── */}
      <div className="flex items-center gap-3 px-5 py-3 bg-[var(--surface)] border-b border-[var(--border)] shrink-0">
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${typeLabel.toLowerCase()}s… (⌘F)`}
            className="w-full pl-9 pr-8 py-2 text-sm bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl focus:outline-none focus:[box-shadow:var(--focus-ring)] focus:border-[var(--primary)] transition-all placeholder:text-[var(--muted)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs text-[var(--muted)] shrink-0">
          {searchQuery && filteredCount !== totalCount ? (
            <><span className="font-semibold text-[var(--foreground)]">{filteredCount}</span> of {totalCount}</>
          ) : (
            <><span className="font-semibold text-[var(--foreground)]">{totalCount}</span> {typeLabel.toLowerCase()}{totalCount !== 1 ? "s" : ""}</>
          )}
        </span>

        <div className="flex items-center gap-1.5 ml-auto">
          <div className="relative" ref={columnPanelRef}>
            <Tooltip label="Manage columns" direction="bottom">
              <button
                onClick={() => setShowColumnPanel((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${showColumnPanel ? "bg-[var(--primary-soft)] border-[var(--primary)]/30 text-[var(--primary)]" : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:border-[var(--border-strong)]"}`}>
                <Columns3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Columns</span>
              </button>
            </Tooltip>
            {showColumnPanel && <ColumnPanel table={table} onClose={() => setShowColumnPanel(false)} />}
          </div>

          <Tooltip label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} direction="bottom">
            <button
              onClick={() => setIsFullscreen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:border-[var(--border-strong)] transition-all">
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ── Bulk Action Bar ── */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 bg-[var(--danger-soft)] border-b border-[var(--danger)]/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-[var(--danger)] flex items-center justify-center">
              <span className="text-[10px] font-bold text-[var(--danger-foreground)]">{selected.length}</span>
            </div>
            <span className="text-sm font-semibold text-[var(--danger-text)]">
              {selected.length} item{selected.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSelectAll()}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] font-medium px-2 py-1.5 rounded-lg hover:bg-[var(--surface)]/60 transition-colors">
              Clear selection
            </button>
            <button
              onClick={() => onDelete(selected)}
              className="flex items-center gap-1.5 bg-[var(--danger)] hover:opacity-90 active:opacity-80 text-[var(--danger-foreground)] text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm">
              <Trash2 className="w-3.5 h-3.5" />
              Delete {selected.length > 1 ? `${selected.length} items` : "item"}
            </button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className={`overflow-auto flex-1 ${isFullscreen ? "min-h-0" : ""}`}>
        <table className="text-sm" style={{ width: table.getTotalSize(), minWidth: "100%" }}>
          <thead className="sticky top-0 z-20">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-[var(--surface-soft)]/95 backdrop-blur-sm border-b border-[var(--border)]">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize(), position: "relative" }}
                    className="px-5 py-4 text-left text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest select-none group/hd">
                    <div
                      className={`flex items-center gap-1.5 ${header.column.getCanSort() ? "cursor-pointer hover:text-[var(--foreground)] transition-colors" : ""}`}
                      onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <SortIcon sorted={header.column.getIsSorted()} />}
                    </div>
                    {header.column.getCanResize() && <ResizeHandle header={header} />}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-[var(--border)]">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-center">
                      <Search className="w-6 h-6 text-[var(--muted)]/60" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[var(--foreground)]">No {typeLabel.toLowerCase()}s found</p>
                      {searchQuery && (
                        <p className="text-xs text-[var(--muted)]">
                          No results for "<span className="font-medium">{searchQuery}</span>"{" · "}
                          <button onClick={() => setSearchQuery("")} className="text-[var(--primary)] hover:underline">clear search</button>
                        </p>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const item       = row.original;
                const isSelected = selected.includes(item.id);
                const isExpanded = expandedId === String(item.id);
                const isNew      = newIds.has(item.id);

                return (
                  <Fragment key={`${row.id}-${row.index}`}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : String(item.id))}
                      onMouseEnter={() => setHoveredRowId(item.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                      className={`cursor-pointer transition-all duration-150 relative
                        ${isNew ? "animate-in fade-in slide-in-from-top-2 duration-500" : ""}
                        ${isSelected
                          ? "bg-[var(--primary-soft)]/80 hover:bg-[var(--primary-soft)]"
                          : isExpanded
                            ? "bg-[var(--accent-soft)]/40"
                            : "hover:bg-[var(--surface-soft)]/80"
                        }`}>
                      {isNew && (
                        <td
                          className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--success)] rounded-r"
                          style={{ display: "block", position: "absolute" }}
                        />
                      )}
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className="px-5 py-4 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>

                    {isExpanded && (
                      <ExpandedRow
                        item={item}
                        colSpan={columns.length}
                        onEdit={onEdit}
                      />
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-[var(--surface-soft)]/80 border-t border-[var(--border)] shrink-0">
        <p className="text-xs text-[var(--muted)]">
          Showing{" "}
          <span className="font-semibold text-[var(--foreground)]">{filteredCount}</span>{" "}
          of{" "}
          <span className="font-semibold text-[var(--foreground)]">{totalCount}</span>{" "}
          {typeLabel.toLowerCase()}{totalCount !== 1 ? "s" : ""}
        </p>
        {searchQuery && filteredCount !== totalCount && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-[var(--primary)] hover:opacity-80 font-medium hover:underline transition-colors">
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
}
