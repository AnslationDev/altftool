"use client";

// Master-detail section builder. Left: an ordered, drag-reorderable list of the
// page's sections (click to select). Right: the selected section's editor.
// Fully controlled — `sections` in, `onChange(next)` out — so the edit page
// stays the single owner of save state.

import { useMemo, useRef, useState } from "react";
import {
  Plus, GripVertical, ChevronUp, ChevronDown, Copy, Trash2, Eye, EyeOff, X, Layers,
} from "lucide-react";
import { SECTION_TYPES, sectionLabel, makeSection, makeSectionId } from "../lib/schema";
import { SectionEditor } from "./editors";

function AddSectionPicker({ onPick, onClose }) {
  const groups = useMemo(() => {
    const by = {};
    for (const s of SECTION_TYPES) (by[s.group] ||= []).push(s);
    return by;
  }, []);
  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface,var(--card))] p-5 shadow-[var(--shadow-lg)]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-black text-[var(--foreground)]">Add a section</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--foreground)]"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          {Object.entries(groups).map(([group, list]) => (
            <div key={group}>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">{group}</p>
              <div className="grid grid-cols-2 gap-2">
                {list.map((s) => (
                  <button key={s.type} onClick={() => onPick(s.type)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-left text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]">
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SectionBuilder({ sections = [], onChange, landerId }) {
  const list = Array.isArray(sections) ? sections : [];
  const [picking, setPicking] = useState(false);
  const [activeId, setActiveId] = useState(list[0]?.id || null);
  const [overIndex, setOverIndex] = useState(-1);
  const dragFrom = useRef(-1);

  const activeIndex = list.findIndex((s) => s.id === activeId);
  const active = activeIndex >= 0 ? list[activeIndex] : null;

  const add = (type) => {
    const s = makeSection(type);
    onChange([...list, s]);
    setActiveId(s.id);
    setPicking(false);
  };
  const patchProps = (i, patch) => {
    const next = list.slice();
    next[i] = { ...next[i], props: { ...next[i].props, ...patch } };
    onChange(next);
  };
  const patchMeta = (i, patch) => {
    const next = list.slice();
    next[i] = { ...next[i], ...patch };
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
    const copy = { ...structuredClone(list[i]), id: makeSectionId() };
    const next = list.slice();
    next.splice(i + 1, 0, copy);
    onChange(next);
    setActiveId(copy.id);
  };
  const remove = (i) => {
    if (!window.confirm(`Delete this ${sectionLabel(list[i].type)} section?`)) return;
    const removedId = list[i].id;
    const next = list.filter((_, idx) => idx !== i);
    onChange(next);
    if (activeId === removedId) setActiveId(next[Math.max(0, i - 1)]?.id || null);
  };

  const drag = {
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
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      {/* Master: section list */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface,var(--card))] p-4 shadow-[var(--shadow-sm)]">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-black text-[var(--foreground)]"><Layers className="h-4 w-4 text-[var(--primary)]" /> Page Sections</h3>
        </div>
        <p className="mb-3 text-[11px] text-[var(--muted)]">Drag to reorder · click to edit</p>

        <div className="space-y-1.5">
          {list.map((section, i) => {
            const isActive = section.id === activeId;
            return (
              <div
                key={section.id}
                draggable
                onDragStart={(e) => drag.start(e, i)}
                onDragEnter={() => drag.enter(i)}
                onDragEnd={drag.end}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => setActiveId(section.id)}
                className={`group flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 transition ${
                  isActive ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]" : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                } ${overIndex === i ? "ring-1 ring-[var(--primary)]" : ""} ${section.hidden ? "opacity-60" : ""}`}
              >
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-[var(--muted)] active:cursor-grabbing" />
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-[var(--foreground)]">{sectionLabel(section.type)}</span>
                {section.hidden ? <EyeOff className="h-3.5 w-3.5 shrink-0 text-[var(--warning,#F59E0B)]" /> : null}
                <div className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100">
                  <button onClick={(e) => { e.stopPropagation(); move(i, -1); }} disabled={i === 0} title="Up" className="grid h-6 w-6 place-items-center rounded text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); move(i, 1); }} disabled={i === list.length - 1} title="Down" className="grid h-6 w-6 place-items-center rounded text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => setPicking(true)} className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--primary)] text-sm font-bold text-[var(--primary-foreground)] hover:brightness-95">
          <Plus className="h-4 w-4" /> Add New Section
        </button>
      </div>

      {/* Detail: selected section editor */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface,var(--card))] p-5 shadow-[var(--shadow-sm)]">
        {active ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <h3 className="text-base font-black text-[var(--foreground)]">{sectionLabel(active.type)}</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => patchMeta(activeIndex, { hidden: !active.hidden })} title={active.hidden ? "Show" : "Hide"} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--foreground)]">{active.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button onClick={() => duplicate(activeIndex)} title="Duplicate" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--primary)]"><Copy className="h-4 w-4" /></button>
                <button onClick={() => remove(activeIndex)} title="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--danger,#EF4444)]"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <SectionEditor type={active.type} props={active.props} patch={(patch) => patchProps(activeIndex, patch)} landerId={landerId} />
          </>
        ) : (
          <button onClick={() => setPicking(true)} className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-16 text-center transition hover:border-[var(--primary)]">
            <Layers className="h-7 w-7 text-[var(--primary)]" strokeWidth={1.7} />
            <span className="text-sm font-bold text-[var(--foreground)]">Add your first section</span>
            <span className="text-xs text-[var(--muted)]">Hero, Features, FAQ, CTA and more.</span>
          </button>
        )}
      </div>

      {picking && <AddSectionPicker onPick={add} onClose={() => setPicking(false)} />}
    </div>
  );
}
