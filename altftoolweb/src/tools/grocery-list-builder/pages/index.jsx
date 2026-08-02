"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Carrot,
  Check,
  Cookie,
  Copy,
  FileDown,
  History,
  ListChecks,
  Milk,
  Package,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  ShoppingCart,
  Snowflake,
  Soup,
  Sparkles,
  SprayCan,
  Trash2,
  WandSparkles,
  Wheat,
  X,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import {
  ALL_CATEGORIES,
  CATEGORIES,
  CATEGORY_BY_ID,
  STARTER_LISTS,
  UNITS,
  detectCategory,
} from "../data";

const STORAGE_KEY = "altf:grocery-list-builder:state";

const CATEGORY_ICONS = {
  produce: Carrot,
  dairy: Milk,
  staples: Wheat,
  spices: Soup,
  snacks: Cookie,
  frozen: Snowflake,
  household: SprayCan,
  personal: Sparkles,
  other: Package,
};

let uidSeed = 0;
const uid = (prefix) => `${prefix}${Date.now().toString(36)}${(uidSeed += 1).toString(36)}`;

const formatQty = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(value) || 0);

function readState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    return false;
  }
  return true;
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function CategoryBadge({ categoryId, className = "h-4 w-4" }) {
  const Icon = CATEGORY_ICONS[categoryId] || Package;
  return <Icon className={className} aria-hidden="true" />;
}

function ItemRow({ item, shoppingMode, onToggle, onQty, onUnit, onCategory, onRemove }) {
  return (
    <li
      className={`rounded-md border px-3 py-2 transition ${
        item.checked
          ? "border-[var(--border)] bg-[var(--muted)]"
          : "border-[var(--border)] bg-[var(--background)]"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={item.checked}
          aria-label={`${item.checked ? "Uncheck" : "Check off"} ${item.name}`}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border transition ${
            item.checked
              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
          }`}
        >
          {item.checked && <Check className="h-4 w-4" />}
        </button>

        {shoppingMode ? (
          <button
            type="button"
            onClick={onToggle}
            className="flex flex-1 items-baseline justify-between gap-3 text-left"
          >
            <span
              className={`text-sm font-semibold ${
                item.checked ? "text-[var(--muted-foreground)] line-through" : ""
              }`}
            >
              {item.name}
            </span>
            <span
              className={`shrink-0 text-sm ${
                item.checked
                  ? "text-[var(--muted-foreground)] line-through"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              {formatQty(item.qty)} {item.unit}
            </span>
          </button>
        ) : (
          <>
            <span
              className={`flex-1 text-sm font-semibold ${
                item.checked ? "text-[var(--muted-foreground)] line-through" : ""
              }`}
            >
              {item.name}
            </span>
            <div className="flex shrink-0 items-center gap-1.5">
              <label className="sr-only" htmlFor={`qty-${item.id}`}>
                Quantity for {item.name}
              </label>
              <input
                id={`qty-${item.id}`}
                type="number"
                min="0"
                step="0.5"
                value={item.qty}
                onChange={(event) => onQty(Number(event.target.value))}
                className="h-9 w-16 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
              <label className="sr-only" htmlFor={`unit-${item.id}`}>
                Unit for {item.name}
              </label>
              <select
                id={`unit-${item.id}`}
                value={item.unit}
                onChange={(event) => onUnit(event.target.value)}
                className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-1.5 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor={`cat-${item.id}`}>
                Category for {item.name}
              </label>
              <select
                id={`cat-${item.id}`}
                value={item.categoryId}
                onChange={(event) => onCategory(event.target.value)}
                className="hidden h-9 max-w-[140px] rounded-md border border-[var(--border)] bg-[var(--background)] px-1.5 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)] sm:block"
              >
                {ALL_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove ${item.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}

export default function ToolHome() {
  const [lists, setLists] = useState(STARTER_LISTS);
  const [activeListId, setActiveListId] = useState(STARTER_LISTS[0].id);
  const [history, setHistory] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const [draftName, setDraftName] = useState("");
  const [draftQty, setDraftQty] = useState(1);
  const [draftUnit, setDraftUnit] = useState("pcs");
  const [unitTouched, setUnitTouched] = useState(false);
  const [draftCategory, setDraftCategory] = useState("auto");

  const [shoppingMode, setShoppingMode] = useState(false);
  const [browseCategory, setBrowseCategory] = useState("produce");
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = readState();
    if (saved && Array.isArray(saved.lists) && saved.lists.length > 0) {
      setLists(saved.lists);
      setActiveListId(
        saved.lists.some((list) => list.id === saved.activeListId)
          ? saved.activeListId
          : saved.lists[0].id
      );
    }
    if (saved && Array.isArray(saved.history)) setHistory(saved.history);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeState({ lists, activeListId, history });
  }, [hydrated, lists, activeListId, history]);

  const activeList = useMemo(
    () => lists.find((list) => list.id === activeListId) || lists[0],
    [lists, activeListId]
  );

  const updateActiveList = useCallback(
    (updater) => {
      setLists((prev) => prev.map((list) => (list.id === activeListId ? updater(list) : list)));
    },
    [activeListId]
  );

  const detected = useMemo(() => detectCategory(draftName), [draftName]);
  const resolvedCategory =
    draftCategory === "auto" ? detected?.categoryId || "other" : draftCategory;
  const effectiveUnit = unitTouched
    ? draftUnit
    : CATEGORY_BY_ID[resolvedCategory]?.defaultUnit || "pcs";

  const rememberItem = useCallback((item) => {
    setHistory((prev) => {
      const key = `${item.name.toLowerCase()}|${item.unit}`;
      const stamp = Date.now();
      const exists = prev.some((entry) => entry.key === key);
      const next = exists
        ? prev.map((entry) =>
            entry.key === key ? { ...entry, count: entry.count + 1, at: stamp } : entry
          )
        : [
            ...prev,
            {
              key,
              name: item.name,
              qty: item.qty,
              unit: item.unit,
              categoryId: item.categoryId,
              count: 1,
              at: stamp,
            },
          ];
      return next.sort((a, b) => b.count - a.count || b.at - a.at).slice(0, 40);
    });
  }, []);

  const addItem = useCallback(
    ({ name, qty, unit, categoryId }) => {
      const clean = String(name || "").trim();
      if (!clean) return;
      const amount = Number(qty) > 0 ? Number(qty) : 1;
      updateActiveList((list) => {
        const existing = list.items.find(
          (item) => item.name.toLowerCase() === clean.toLowerCase() && item.unit === unit
        );
        if (existing) {
          return {
            ...list,
            items: list.items.map((item) =>
              item.id === existing.id
                ? { ...item, qty: Number((item.qty + amount).toFixed(2)), checked: false }
                : item
            ),
          };
        }
        return {
          ...list,
          items: [
            ...list.items,
            { id: uid("i"), name: clean, qty: amount, unit, categoryId, checked: false },
          ],
        };
      });
    },
    [updateActiveList]
  );

  const submitDraft = () => {
    if (!draftName.trim()) return;
    addItem({
      name: draftName,
      qty: draftQty,
      unit: effectiveUnit,
      categoryId: resolvedCategory,
    });
    setDraftName("");
    setDraftQty(1);
    setDraftCategory("auto");
    setUnitTouched(false);
  };

  const toggleItem = (item) => {
    updateActiveList((list) => ({
      ...list,
      items: list.items.map((entry) =>
        entry.id === item.id ? { ...entry, checked: !entry.checked } : entry
      ),
    }));
    if (!item.checked) rememberItem(item);
  };

  const patchItem = (id, patch) => {
    updateActiveList((list) => ({
      ...list,
      items: list.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const removeItem = (id) => {
    updateActiveList((list) => ({ ...list, items: list.items.filter((item) => item.id !== id) }));
  };

  const clearChecked = () => {
    updateActiveList((list) => ({ ...list, items: list.items.filter((item) => !item.checked) }));
  };

  const clearAll = () => {
    if (!window.confirm("Empty this list? All items will be removed.")) return;
    updateActiveList((list) => ({ ...list, items: [] }));
  };

  const createList = () => {
    const name = newListName.trim();
    if (!name) return;
    const id = uid("list-");
    setLists((prev) => [...prev, { id, name, items: [] }]);
    setActiveListId(id);
    setNewListName("");
    setShowNewList(false);
  };

  const deleteList = () => {
    if (lists.length <= 1) return;
    if (!window.confirm(`Delete "${activeList.name}" and all its items?`)) return;
    const remaining = lists.filter((list) => list.id !== activeListId);
    setLists(remaining);
    setActiveListId(remaining[0].id);
  };

  const commitRename = () => {
    const name = renameValue.trim();
    if (name) updateActiveList((list) => ({ ...list, name }));
    setRenaming(false);
  };

  const grouped = useMemo(
    () =>
      ALL_CATEGORIES.map((category) => ({
        category,
        items: activeList.items
          .filter(
            (item) => (CATEGORY_BY_ID[item.categoryId] ? item.categoryId : "other") === category.id
          )
          .slice()
          .sort((a, b) => Number(a.checked) - Number(b.checked)),
      })).filter((group) => group.items.length > 0),
    [activeList]
  );

  const stats = useMemo(() => {
    const total = activeList.items.length;
    const done = activeList.items.filter((item) => item.checked).length;
    return { total, done, left: total - done, progress: total ? (done / total) * 100 : 0 };
  }, [activeList]);

  const restock = useMemo(() => {
    const present = new Set(activeList.items.map((item) => item.name.toLowerCase()));
    return history.filter((entry) => !present.has(entry.name.toLowerCase())).slice(0, 12);
  }, [activeList, history]);

  const inListNames = useMemo(
    () => new Set(activeList.items.map((item) => item.name.toLowerCase())),
    [activeList]
  );

  const shareText = useMemo(() => {
    const lines = [`${activeList.name} — ${stats.total} item${stats.total === 1 ? "" : "s"}`, ""];
    grouped.forEach(({ category, items }) => {
      lines.push(category.label.toUpperCase());
      items.forEach((item) => {
        lines.push(`${item.checked ? "[x]" : "[ ]"} ${item.name} — ${formatQty(item.qty)} ${item.unit}`);
      });
      lines.push("");
    });
    if (!grouped.length) lines.push("(empty list)", "");
    lines.push(`${new Date().toLocaleDateString("en-IN")} · ALTFTool Smart Grocery List Builder`);
    return lines.join("\n");
  }, [activeList, grouped, stats.total]);

  const copyList = async () => {
    const success = await safeCopyText(shareText);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const browse = CATEGORIES.find((category) => category.id === browseCategory) || CATEGORIES[0];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ShoppingCart className="h-4 w-4" />
            Shop faster
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Smart Grocery List Builder</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Type an item and it lands in the right aisle automatically. Keep separate weekly, party
            and monthly lists, tick items off as you shop, and share a clean list with anyone in one
            tap. Everything stays on your device.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">
                Quick add
              </h2>

              <label className="mt-4 block">
                <span className="text-sm font-semibold">Item name</span>
                <input
                  type="text"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") submitDraft();
                  }}
                  placeholder="e.g. paneer, haldi, dishwash liquid"
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>

              <div className="mt-3 flex min-h-9 items-center gap-2 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                <WandSparkles className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
                {draftName.trim() ? (
                  <span>
                    {detected ? (
                      <>
                        Matched <strong className="text-[var(--foreground)]">{detected.keyword}</strong>{" "}
                        &rarr;{" "}
                        <strong className="text-[var(--primary)]">
                          {CATEGORY_BY_ID[detected.categoryId].label}
                        </strong>
                      </>
                    ) : (
                      <>No keyword match &rarr; filed under <strong>Other</strong>. Pick a category below.</>
                    )}
                  </span>
                ) : (
                  <span>Auto-sorts into 8 aisles from a built-in keyword map.</span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold">Quantity</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={draftQty}
                    onChange={(event) => setDraftQty(Number(event.target.value))}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Unit</span>
                  <select
                    value={effectiveUnit}
                    onChange={(event) => {
                      setDraftUnit(event.target.value);
                      setUnitTouched(true);
                    }}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-3 block">
                <span className="text-sm font-semibold">Category</span>
                <select
                  value={draftCategory}
                  onChange={(event) => setDraftCategory(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  <option value="auto">
                    Auto &mdash; {CATEGORY_BY_ID[resolvedCategory]?.label || "Other"}
                  </option>
                  {ALL_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={submitDraft}
                disabled={!draftName.trim()}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)] transition disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add to {activeList.name}
              </button>
            </div>

            {restock.length > 0 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-[var(--primary)]" />
                  <h2 className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">
                    Restock suggestions
                  </h2>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  Things you have ticked off before and that are not on this list right now. Tap to
                  add them back.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {restock.map((entry) => (
                    <button
                      key={entry.key}
                      type="button"
                      onClick={() =>
                        addItem({
                          name: entry.name,
                          qty: entry.qty,
                          unit: entry.unit,
                          categoryId: entry.categoryId,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                    >
                      <Plus className="h-3 w-3 text-[var(--primary)]" />
                      {entry.name}
                      <span className="text-[10px] font-normal">
                        {formatQty(entry.qty)} {entry.unit}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">
                Common items
              </h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setBrowseCategory(category.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition ${
                      browseCategory === category.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <CategoryBadge categoryId={category.id} className="h-3.5 w-3.5" />
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-2">
                {browse.common.map((entry) => {
                  const added = inListNames.has(entry.name.toLowerCase());
                  return (
                    <button
                      key={entry.name}
                      type="button"
                      onClick={() =>
                        addItem({
                          name: entry.name,
                          qty: entry.qty,
                          unit: entry.unit,
                          categoryId: browse.id,
                        })
                      }
                      className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-xs font-semibold transition ${
                        added
                          ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--primary)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      <span className="truncate">{entry.name}</span>
                      {added ? (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => {
                      setActiveListId(list.id);
                      setRenaming(false);
                    }}
                    className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                      list.id === activeList.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {list.name}
                    <span className="rounded-full bg-[var(--muted)] px-1.5 text-[10px] font-bold text-[var(--foreground)]">
                      {list.items.length}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowNewList((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  <Plus className="h-4 w-4" />
                  New list
                </button>
              </div>

              {showNewList && (
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <label className="flex-1">
                    <span className="text-sm font-semibold">List name</span>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(event) => setNewListName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") createList();
                      }}
                      placeholder="e.g. Diwali shopping"
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={createList}
                    className="h-12 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewList(false)}
                    className="btn-secondary h-12 px-4 text-sm"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
                {renaming ? (
                  <div className="flex flex-1 items-center gap-2">
                    <label className="sr-only" htmlFor="rename-list">
                      Rename list
                    </label>
                    <input
                      id="rename-list"
                      type="text"
                      value={renameValue}
                      onChange={(event) => setRenameValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") commitRename();
                        if (event.key === "Escape") setRenaming(false);
                      }}
                      className="h-10 flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                    <button
                      type="button"
                      onClick={commitRename}
                      className="h-10 rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)]"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold">{activeList.name}</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setRenameValue(activeList.name);
                        setRenaming(true);
                      }}
                      aria-label="Rename list"
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={deleteList}
                      disabled={lists.length <= 1}
                      aria-label="Delete list"
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)] disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShoppingMode((prev) => !prev)}
                  aria-pressed={shoppingMode}
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    shoppingMode
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  <ListChecks className="h-4 w-4" />
                  {shoppingMode ? "Shopping mode on" : "Shopping mode"}
                </button>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <p className="font-semibold" aria-live="polite">
                    {stats.done} of {stats.total} in the cart
                  </p>
                  <p className="text-[var(--muted-foreground)]">
                    {stats.left} left &middot; {Math.round(stats.progress)}%
                  </p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${stats.progress}%`, background: "var(--primary)" }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={copyList} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy / share"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      `${activeList.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`,
                      shareText
                    )
                  }
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <FileDown className="h-4 w-4" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={clearChecked}
                  disabled={stats.done === 0}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  <Check className="h-4 w-4" />
                  Clear ticked
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={stats.total === 0}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  <RotateCcw className="h-4 w-4" />
                  Empty list
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
              {grouped.length === 0 ? (
                <div className="rounded-md bg-[var(--muted)] p-8 text-center">
                  <ShoppingCart className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
                  <p className="mt-3 text-sm font-semibold">This list is empty</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Add an item on the left, or tap a common item to get going.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {grouped.map(({ category, items }) => {
                    const done = items.filter((item) => item.checked).length;
                    return (
                      <div key={category.id}>
                        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
                          <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase text-[var(--primary)]">
                            <CategoryBadge categoryId={category.id} />
                            {category.label}
                          </h3>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {category.aisle} &middot; {done}/{items.length}
                          </span>
                        </div>
                        <ul className="mt-3 grid gap-2">
                          {items.map((item) => (
                            <ItemRow
                              key={item.id}
                              item={item}
                              shoppingMode={shoppingMode}
                              onToggle={() => toggleItem(item)}
                              onQty={(qty) => patchItem(item.id, { qty })}
                              onUnit={(unit) => patchItem(item.id, { unit })}
                              onCategory={(categoryId) => patchItem(item.id, { categoryId })}
                              onRemove={() => removeItem(item.id)}
                            />
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
              <h2 className="text-sm font-semibold">How the auto-sorting works</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Every item name is matched word-by-word against a built-in keyword map of roughly 500
                Indian and English grocery terms across 8 aisles. The longest matching keyword wins,
                so &ldquo;hair oil&rdquo; goes to Personal Care while plain &ldquo;oil&rdquo; goes to
                Atta, Dal &amp; Rice. Plurals are handled, and anything unmatched lands in
                &ldquo;Other&rdquo; where you can set the aisle yourself.
              </p>
            </div>
          </div>
        </section>

        <div id="grocery-print-area" className="hidden">
          <div className="grocery-print-sheet">
            <h1>{activeList.name}</h1>
            <p>
              {stats.total} items &middot; {new Date().toLocaleDateString("en-IN")}
            </p>
            {grouped.map(({ category, items }) => (
              <div key={category.id} className="grocery-print-group">
                <h2>
                  {category.label} ({items.length})
                </h2>
                <ul>
                  {items.map((item) => (
                    <li key={item.id}>
                      <span className="grocery-print-box">{item.checked ? "x" : ""}</span>
                      <span className="grocery-print-name">{item.name}</span>
                      <span className="grocery-print-qty">
                        {formatQty(item.qty)} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="grocery-print-foot">ALTFTool &middot; Smart Grocery List Builder</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #grocery-print-area {
            display: block !important;
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          #grocery-print-area * {
            visibility: visible;
            color: black !important;
            background: transparent !important;
            border-color: black !important;
          }
          .grocery-print-sheet h1 { font-size: 22px; font-weight: 700; margin: 0 0 2px; }
          .grocery-print-sheet > p { font-size: 11px; margin: 0 0 14px; }
          .grocery-print-group { break-inside: avoid; page-break-inside: avoid; margin: 0 0 12px; }
          .grocery-print-group h2 {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            border-bottom: 1px solid black;
            padding: 0 0 3px;
            margin: 0 0 6px;
          }
          .grocery-print-group ul { list-style: none; margin: 0; padding: 0; }
          .grocery-print-group li {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            padding: 3px 0;
          }
          .grocery-print-box {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 1px solid black !important;
            font-size: 9px;
            line-height: 12px;
            text-align: center;
          }
          .grocery-print-name { flex: 1; }
          .grocery-print-qty { font-size: 11px; }
          .grocery-print-foot { font-size: 9px; margin-top: 16px; }
          @page { margin: 14mm; }
        }
      `}</style>
    </main>
  );
}
