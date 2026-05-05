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
          className="pointer-events-none fixed z-[9999] px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap bg-gray-900 text-white shadow-xl"
          style={direction === "bottom"
            ? { top: pos.top, left: pos.left, transform: "translateX(-50%)" }
            : { top: pos.top, left: pos.left, transform: "translateX(-50%) translateY(-100%)" }}>
          {label}
          {direction === "bottom"
            ? <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-gray-900" />
            : <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-gray-900" />}
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
  if (sorted === "asc")  return <ChevronUp   className="w-3.5 h-3.5 text-blue-500" />;
  if (sorted === "desc") return <ChevronDown className="w-3.5 h-3.5 text-blue-500" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 group-hover/hd:text-gray-500 transition-colors" />;
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
      <div className={`w-0.5 h-5 rounded-full transition-colors ${header.column.getIsResizing() ? "bg-blue-500" : "bg-gray-300 group-hover/rz:bg-blue-400"}`} />
    </div>
  );
}

/* ════════════════════════════════════════
   Column Panel
════════════════════════════════════════ */
function ColumnPanel({ table, onClose }) {
  return (
    <div className="absolute right-0 top-11 z-50 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 animate-in fade-in slide-in-from-top-1 duration-150">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Columns</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
      <div className="space-y-0.5">
        {table.getAllLeafColumns().map((col) => {
          if (["select", "actions"].includes(col.id)) return null;
          const visible = col.getIsVisible();
          return (
            <label key={col.id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 cursor-pointer group transition-colors">
              <div className={`w-4 h-4 rounded-[5px] border flex items-center justify-center transition-all ${visible ? "bg-blue-500 border-blue-500" : "border-gray-300 group-hover:border-gray-400"}`}>
                {visible && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <input type="checkbox" className="sr-only" checked={visible} onChange={col.getToggleVisibilityHandler()} />
              <span className={`text-sm transition-colors ${visible ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                {col.columnDef.header}
              </span>
              {visible
                ? <Eye   className="w-3 h-3 text-gray-300 ml-auto" />
                : <EyeOff className="w-3 h-3 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
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
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide">
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
    <div className="relative shrink-0 w-16 h-9 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
      {src && !err ? (
        <img src={src} alt={title} onError={() => setErr(true)} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
          <span className="text-indigo-400 font-bold text-sm">{title?.[0]?.toUpperCase()}</span>
        </div>
      )}
      {badge && (
        <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold bg-black/50 text-white px-1 rounded leading-tight">
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
          className="p-1.5 rounded-lg hover:bg-blue-50 transition">
          <Pencil className="w-4 h-4 text-blue-500" />
        </button>
      </Tooltip>
      <Tooltip label="Delete">
        <button
          onClick={(e) => {e.stopPropagation(); onDelete(item);} }
          className="p-1.5 rounded-lg hover:bg-red-50 transition">
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </Tooltip>
      {link && (
        <Tooltip label="Open">
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition inline-flex">
            <ExternalLink className="w-4 h-4 text-gray-500" />
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
      className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
    />
  ),
  cell: ({ row }) => (
    <input
      type="checkbox"
      checked={selected.includes(row.original.id)}
      onChange={() => toggleSelect(row.original.id)}
      onClick={(e) => e.stopPropagation()}
      className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
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
                <span className="font-semibold text-gray-900 text-sm truncate block leading-tight max-w-[180px]">
                  {item.title}
                </span>
                {newIds.has(item.id) && <NewBadge />}
              </div>
              {item.subtitle && (
                <span className="text-[11px] text-indigo-500 font-medium mt-0.5 block truncate">{item.subtitle}</span>
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
        <span className="text-sm text-gray-700 line-clamp-2 leading-snug">{getValue() || "—"}</span>
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
            <span className="font-bold text-gray-900 text-sm">{price || "—"}</span>
            {oldPrice && (
              <span className="text-[11px] text-gray-400 line-through">{oldPrice}</span>
            )}
            {discount && (
              <span className="text-[10px] font-semibold text-emerald-600">{discount}</span>
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
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline truncate max-w-[140px]">
            <Globe2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
          </a>
        ) : <span className="text-gray-300 text-xs">—</span>;
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
                <span className="font-semibold text-gray-900 text-sm truncate block">{item.title}</span>
                {newIds.has(item.id) && <NewBadge />}
              </div>
              {item.subtitle && (
                <span className="text-[11px] text-indigo-500 font-medium mt-0.5 block truncate">{item.subtitle}</span>
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
          <span className="flex items-center gap-1 text-xs text-gray-500 truncate max-w-[180px]">
            <ImageIcon className="w-3 h-3 shrink-0 text-gray-400" />
            <span className="truncate">{url}</span>
          </span>
        ) : <span className="text-gray-300 text-xs">—</span>;
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
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline truncate max-w-[160px]">
            <Globe2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
          </a>
        ) : <span className="text-gray-300 text-xs">—</span>;
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
                <span className="font-semibold text-gray-900 text-sm truncate block">{item.headline}</span>
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
        <span className="text-sm text-gray-600 line-clamp-2 leading-snug">{getValue() || "—"}</span>
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
          <span className="flex items-center gap-1 text-xs text-gray-500 truncate max-w-[180px]">
            <ImageIcon className="w-3 h-3 shrink-0 text-gray-400" />
            <span className="truncate">{url}</span>
          </span>
        ) : <span className="text-gray-300 text-xs">—</span>;
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
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline truncate max-w-[140px]">
            <Globe2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
          </a>
        ) : <span className="text-gray-300 text-xs">—</span>;
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
    <tr className="bg-gradient-to-b from-indigo-50/40 to-transparent border-b border-indigo-100/60">
      <td colSpan={colSpan} className="px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">

          {/* Preview */}
          <div className="sm:col-span-4 space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <LayoutGrid className="w-3 h-3" />Preview
            </p>
            {imgSrc ? (
              <div className="rounded-2xl overflow-hidden border border-indigo-100 bg-white shadow-sm aspect-video">
                <img src={imgSrc} alt={title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 aspect-video flex flex-col items-center justify-center gap-2 text-gray-400">
                <BookOpen className="w-6 h-6 text-gray-300" />
                <span className="text-xs font-medium">No preview</span>
              </div>
            )}

            {/* Meta chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.offer && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  <Zap className="w-3 h-3" />{item.offer}
                </span>
              )}
              {item.city && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full capitalize">
                  <MapPin className="w-3 h-3" />{item.city}
                </span>
              )}
              {item.area && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full capitalize">
                  {item.area}
                </span>
              )}
              {link && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  <Globe2 className="w-3 h-3" />Has Link
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="sm:col-span-8 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base leading-tight">{title}</h3>
                {subline && <p className="text-sm text-gray-500 mt-0.5">{subline}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
                  <Pencil className="w-3 h-3" />Edit
                </button>
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors">
                    <ExternalLink className="w-3 h-3" />Visit
                  </a>
                )}
              </div>
            </div>

            {/* flashSale / trendingSale pricing */}
            {isProduct && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pricing</p>
                <div className="flex items-baseline gap-3 flex-wrap">
                  {item.price && (
                    <span className="text-xl font-bold text-gray-900">{item.price}</span>
                  )}
                  {item.oldPrice && (
                    <span className="text-sm text-gray-400 line-through">{item.oldPrice}</span>
                  )}
                  {item.discount && (
                    <span className="text-sm font-bold text-emerald-600">{item.discount}</span>
                  )}
                </div>
                {item.productTitle && (
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.productTitle}</p>
                )}
              </div>
            )}

            {/* dealOfTheDay image path */}
            {isDotd && item.image && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Image Path</p>
                <p className="text-xs font-mono text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 break-all">
                  {item.image}
                </p>
              </div>
            )}

            {/* hero hero image path */}
            {isHero && item.heroImage && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hero Image</p>
                <p className="text-xs font-mono text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 break-all">
                  {item.heroImage}
                </p>
              </div>
            )}

            {/* CTA Link */}
            {link && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {isDotd ? "Link" : "CTA Link"}
                </p>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-blue-600 hover:underline break-all">
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
  // nearby (fallback)
  return data.filter((item) =>
    item.title?.toLowerCase().includes(q) ||
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
};

/* ════════════════════════════════════════
   Main SalesTable
════════════════════════════════════════ */
export default function SalesTable({ data = [], activeTab, onEdit, onDelete }) {
  const [selected,        setSelected]        = useState([]);
  const [expandedId,      setExpandedId]      = useState(null);
  const [sorting,         setSorting]         = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnSizing,    setColumnSizing]    = useState({});
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [isFullscreen,    setIsFullscreen]    = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [hoveredRowId,    setHoveredRowId]    = useState(null);

  const columnPanelRef = useRef(null);
  const searchRef      = useRef(null);

  /* ── Reset on tab change ── */
  useEffect(() => {
    setSelected([]);
    setExpandedId(null);
    setSearchQuery("");
    setColumnVisibility({});
    setSorting([]);
  }, [activeTab]);

  /* ── New-badge tracking ── */
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

  /* ── Selection helpers ── */
  const toggleSelect    = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleSelectAll = ()   => setSelected((p) => p.length === filteredData.length ? [] : filteredData.map((d) => d.id));

  /* ── Filtered data ── */
  const filteredData = useMemo(
    () => filterByType(data, searchQuery, activeTab),
    [data, searchQuery, activeTab]
  );

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
                  <span className="font-semibold text-gray-900 text-sm truncate block">{item.title}</span>
                  {newIds.has(item.id) && <NewBadge />}
                </div>
                {item.subTitle && (
                  <span className="text-[11px] text-indigo-500 font-medium mt-0.5 block truncate">{item.subTitle}</span>
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
            <span className="text-xs bg-rose-50 text-rose-600 font-bold px-2 py-1 rounded-full inline-block w-fit">
              {getValue() || "—"}
            </span>
            {row.original.offerText && (
              <span className="text-[11px] text-gray-400 pl-1">{row.original.offerText}</span>
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
              <span className="font-bold text-gray-900 text-sm">{fmt(salePrice)}</span>
              {originalPrice > 0 && <span className="text-[11px] text-gray-400 line-through">{fmt(originalPrice)}</span>}
            </div>
          );
        },
      },
      {
        accessorKey: "city", header: "Location", size: 140,
        cell: ({ getValue, row }) => (
          <div className="flex flex-col gap-0.5">
            {getValue() ? (
              <span className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />{getValue()}
              </span>
            ) : null}
            {row.original.area && <span className="text-[11px] text-gray-400 pl-4">{row.original.area}</span>}
            {!getValue() && !row.original.area && <span className="text-xs text-gray-300">Online</span>}
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

  const totalCount    = data.length;
  const filteredCount = filteredData.length;

  /* ── Outside click: column panel ── */
  useEffect(() => {
    const h = (e) => { if (columnPanelRef.current && !columnPanelRef.current.contains(e.target)) setShowColumnPanel(false); };
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
      if ((e.ctrlKey || e.metaKey) && e.key === "f") { e.preventDefault(); searchRef.current?.focus(); }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const typeLabel    = TYPE_LABELS[activeTab] || "Sales";
  const wrapperClass = isFullscreen
    ? "fixed inset-0 z-50 bg-white flex flex-col"
    : "bg-white rounded-2xl border border-gray-200/80 shadow-sm flex flex-col overflow-hidden";

  return (
    <div className={wrapperClass}>

      {/* ── Top Toolbar ── */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-100 shrink-0">
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${typeLabel.toLowerCase()}… (⌘F)`}
            className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs text-gray-400 shrink-0">
          {searchQuery && filteredCount !== totalCount ? (
            <><span className="font-semibold text-gray-600">{filteredCount}</span> of {totalCount}</>
          ) : (
            <><span className="font-semibold text-gray-600">{totalCount}</span> {typeLabel.toLowerCase()}{totalCount !== 1 ? "s" : ""}</>
          )}
        </span>

        <div className="flex items-center gap-1.5 ml-auto">
          <div className="relative" ref={columnPanelRef}>
            <Tooltip label="Manage columns" direction="bottom">
              <button
                onClick={() => setShowColumnPanel((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${showColumnPanel ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"}`}>
                <Columns3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Columns</span>
              </button>
            </Tooltip>
            {showColumnPanel && <ColumnPanel table={table} onClose={() => setShowColumnPanel(false)} />}
          </div>

          <Tooltip label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} direction="bottom">
            <button
              onClick={() => setIsFullscreen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ── Bulk Action Bar ── */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{selected.length}</span>
            </div>
            <span className="text-sm font-semibold text-red-700">
              {selected.length} item{selected.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected([])}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1.5 rounded-lg hover:bg-white/60 transition-colors">
              Clear selection
            </button>
            <button 
            onClick={() => onDelete(selected)}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm shadow-red-200 hover:shadow-red-300">
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
              <tr key={hg.id} className="bg-gray-50/95 backdrop-blur-sm border-b border-gray-200/70">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize(), position: "relative" }}
                    className="px-5 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest select-none group/hd">
                    <div
                      className={`flex items-center gap-1.5 ${header.column.getCanSort() ? "cursor-pointer hover:text-gray-800 transition-colors" : ""}`}
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

          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Search className="w-6 h-6 text-gray-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-600">No {typeLabel.toLowerCase()} found</p>
                      {searchQuery && (
                        <p className="text-xs text-gray-400">
                          No results for "<span className="font-medium">{searchQuery}</span>"{" · "}
                          <button onClick={() => setSearchQuery("")} className="text-blue-500 hover:underline">clear search</button>
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
                          ? "bg-blue-50/80 hover:bg-blue-50"
                          : isExpanded
                            ? "bg-indigo-50/40"
                            : "hover:bg-gray-50/80"
                        }`}>
                      {isNew && (
                        <td
                          className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400 rounded-r"
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
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50/80 border-t border-gray-100 shrink-0">
        <p className="text-xs text-gray-400">
          Showing{" "}
          <span className="font-semibold text-gray-600">{filteredCount}</span>{" "}
          of{" "}
          <span className="font-semibold text-gray-600">{totalCount}</span>{" "}
          {typeLabel.toLowerCase()}{totalCount !== 1 ? "s" : ""}
        </p>
        {searchQuery && filteredCount !== totalCount && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-blue-500 hover:text-blue-700 font-medium hover:underline transition-colors">
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
}