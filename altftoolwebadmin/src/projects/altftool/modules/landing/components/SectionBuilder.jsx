"use client";

// Section Builder — the heart of the page editor. Owns the ordered list of
// sections and every structural action: add, reorder (native HTML5 drag-drop +
// up/down buttons for a11y/fallback), duplicate, hide, delete, collapse. It is
// fully controlled — `sections` in, `onChange(next)` out — so the edit page
// stays the single owner of save state.

import { useMemo, useRef, useState } from "react";
import {
  Plus, GripVertical, ChevronUp, ChevronDown, Copy, Trash2, Eye, EyeOff, X,
  ChevronRight, Layers,
} from "lucide-react";
import { SECTION_TYPES, sectionLabel, makeSection, makeSectionId } from "../lib/schema";
import { EDITORS, SectionEditor } from "./editors";

function AddSectionPicker({ onPick, onClose }) {
  const groups = useMemo(() => {
    const by = {};
    for (const s of SECTION_TYPES) (by[s.group] ||= []).push(s);
    return by;
  }, []);
  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface,var(--card))] p-5 shadow-[var(--shadow-lg)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-black text-[var(--foreground)]">Add a section</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--foreground)]"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          {Object.entries(groups).map(([group, list]) => (
            <div key={group}>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">{group}</p>
              <div className="grid grid-cols-2 gap-2">
                {list.map((s) => {
                  const ready = Boolean(EDITORS[s.type]);
                  return (
                    <button
                      key={s.type}
                      onClick={() => onPick(s.type)}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-left text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    >
                      <span className="truncate">{s.label}</span>
                      {!ready ? <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--muted)_16%,transparent)] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[var(--muted)]">soon</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ section, index, count, collapsed, onToggle, onPatch, onMove, onDuplicate, onDelete, onToggleHidden, landerId, drag }) {
  return (
    <div
      draggable
      onDragStart={(e) => drag.start(e, index)}
      onDragEnter={() => drag.enter(index)}
      onDragEnd={drag.end}
      onDragOver={(e) => e.preventDefault()}
      className={`rounded-xl border bg-[var(--surface,var(--card))] shadow-[var(--shadow-sm)] transition ${
        drag.overIndex === index ? "border-[var(--primary)] ring-1 ring-[var(--primary)]" : "border-[var(--border)]"
      } ${section.hidden ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="cursor-grab text-[var(--muted)] active:cursor-grabbing" title="Drag to reorder"><GripVertical className="h-4 w-4" /></span>
        <button onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <ChevronRight className={`h-4 w-4 shrink-0 text-[var(--muted)] transition ${collapsed ? "" : "rotate-90"}`} />
          <span className="truncate text-sm font-bold text-[var(--foreground)]">{sectionLabel(section.type)}</span>
          {section.hidden ? <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--warning)_16%,transparent)] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[var(--warning)]">Hidden</span> : null}
        </button>
        <div className="flex items-center gap-0.5">
          <button onClick={() => onMove(index, -1)} disabled={index === 0} title="Move up" className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
          <button onClick={() => onMove(index, 1)} disabled={index === count - 1} title="Move down" className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
          <button onClick={onToggleHidden} title={section.hidden ? "Show" : "Hide"} className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] hover:text-[var(--foreground)]">{section.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          <button onClick={onDuplicate} title="Duplicate" className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] hover:text-[var(--primary)]"><Copy className="h-4 w-4" /></button>
          <button onClick={onDelete} title="Delete" className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] hover:text-[var(--danger,#EF4444)]"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      {!collapsed ? (
        <div className="border-t border-[var(--border)] p-3.5">
          <SectionEditor type={section.type} props={section.props} patch={onPatch} landerId={landerId} />
        </div>
      ) : null}
    </div>
  );
}

export default function SectionBuilder({ sections = [], onChange, landerId }) {
  const [picking, setPicking] = useState(false);
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [overIndex, setOverIndex] = useState(-1);
  const dragFrom = useRef(-1);

  const list = Array.isArray(sections) ? sections : [];

  const setCollapse = (id, on) => setCollapsed((prev) => {
    const next = new Set(prev);
    if (on) next.add(id); else next.delete(id);
    return next;
  });

  const add = (type) => {
    onChange([...list, makeSection(type)]);
    setPicking(false);
  };
  const patchAt = (i, patch) => {
    const next = list.slice();
    next[i] = { ...next[i], props: { ...next[i].props, ...patch } };
    onChange(next);
  };
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = list.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const duplicate = (i) => {
    const next = list.slice();
    next.splice(i + 1, 0, { ...structuredClone(list[i]), id: makeSectionId() });
    onChange(next);
  };
  const remove = (i) => {
    if (!window.confirm(`Delete this ${sectionLabel(list[i].type)} section?`)) return;
    onChange(list.filter((_, idx) => idx !== i));
  };
  const toggleHidden = (i) => patchMeta(i, { hidden: !list[i].hidden });
  const patchMeta = (i, patch) => {
    const next = list.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const drag = {
    overIndex,
    start: (e, i) => { dragFrom.current = i; e.dataTransfer.effectAllowed = "move"; },
    enter: (i) => {
      setOverIndex(i);
      const from = dragFrom.current;
      if (from === -1 || from === i) return;
      const next = list.slice();
      const [moved] = next.splice(from, 1);
      next.splice(i, 0, moved);
      dragFrom.current = i;
      onChange(next);
    },
    end: () => { dragFrom.current = -1; setOverIndex(-1); },
  };

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface,var(--card))] p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-black text-[var(--foreground)]"><Layers className="h-4 w-4 text-[var(--primary)]" /> Sections</h2>
        <button onClick={() => setPicking(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 text-sm font-bold text-[var(--primary-foreground)] hover:brightness-95">
          <Plus className="h-4 w-4" /> Add section
        </button>
      </div>

      {list.length === 0 ? (
        <button onClick={() => setPicking(true)} className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-10 text-center transition hover:border-[var(--primary)]">
          <Layers className="h-6 w-6 text-[var(--primary)]" strokeWidth={1.7} />
          <span className="text-sm font-bold text-[var(--foreground)]">Add your first section</span>
          <span className="text-xs text-[var(--muted)]">Hero, Features, FAQ, CTA, Text and more.</span>
        </button>
      ) : (
        <div className="space-y-2.5">
          {list.map((section, i) => (
            <SectionCard
              key={section.id}
              section={section}
              index={i}
              count={list.length}
              collapsed={collapsed.has(section.id)}
              onToggle={() => setCollapse(section.id, !collapsed.has(section.id))}
              onPatch={(patch) => patchAt(i, patch)}
              onMove={move}
              onDuplicate={() => duplicate(i)}
              onDelete={() => remove(i)}
              onToggleHidden={() => toggleHidden(i)}
              landerId={landerId}
              drag={drag}
            />
          ))}
        </div>
      )}

      {picking && <AddSectionPicker onPick={add} onClose={() => setPicking(false)} />}
    </section>
  );
}
