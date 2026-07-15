import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, Input } from "@altftool/ui";
import {
  Users, Plus, X, Upload, Download, Search, Shuffle,
  RotateCcw, AlertTriangle, List, ChevronDown,
} from "lucide-react";
import { parseCSV } from "../utils/helpers";

export default function NameSelector({
  names, winners, selected, history, isAnimating, search, multipleCount,
  filteredNames, duplicates,
  onAdd, onAddMultiple, onRemove, onClear, onPickOne, onPickMultiple,
  onReset, onExclude, onClearHistory, onSearch, onMultipleCount,
}) {
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const items = parseCSV(text);
      if (items.length > 0) onAddMultiple(items);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleBulkAdd = () => {
    const items = bulkText.split("\n").map((s) => s.trim()).filter(Boolean);
    if (items.length > 0) onAddMultiple(items);
    setBulkText("");
    setShowBulk(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">
            Names ({names.length})
          </h4>
          <div className="flex gap-1">
            <button onClick={() => setShowBulk(!showBulk)} className="p-1 rounded hover:bg-(--muted) text-(--muted-foreground)"><Upload size="14" /></button>
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="p-1 rounded hover:bg-(--muted) text-(--muted-foreground)"><Download size="14" /></button>
            {names.length > 0 && <button onClick={onClear} className="p-1 rounded hover:bg-(--muted) text-(--muted-foreground)"><X size="14" /></button>}
          </div>
        </div>

        {duplicates.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs">
            <AlertTriangle size="12" />
            {duplicates.length} duplicate{duplicates.length > 1 ? "s" : ""} found
          </div>
        )}

        {showBulk ? (
          <div className="space-y-2">
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Paste names (one per line)..."
              className="w-full h-24 px-3 py-2 text-sm rounded-lg border border-(--border) bg-(--card) text-(--foreground) resize-none focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleBulkAdd}>Add All</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowBulk(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Add name..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  onAdd(e.target.value);
                  e.target.value = "";
                }
              }}
              className="flex-1"
            />
            <Button variant="primary" size="sm" onClick={() => {
              const input = document.querySelector('[placeholder="Add name..."]');
              if (input && input.value.trim()) {
                onAdd(input.value);
                input.value = "";
              }
            }}>
              <Plus size="16" />
            </Button>
          </div>
        )}

        <div className="relative">
          <Search size="14" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--muted-foreground)" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-(--border) bg-(--card) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
          />
        </div>

        <div className="max-h-52 overflow-y-auto space-y-0.5 custom-scrollbar">
          {filteredNames.map((name) => (
            <div key={name} className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-(--muted) group transition text-sm">
              <span className="flex-1 text-(--foreground) truncate">{name}</span>
              <button onClick={() => onRemove(name)} className="opacity-0 group-hover:opacity-100 p-0.5 text-(--muted-foreground) hover:text-(--danger) transition">
                <X size="12" />
              </button>
            </div>
          ))}
        </div>

        {multipleCount > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-(--muted-foreground)">Pick</span>
            <input
              type="number"
              min="1"
              max={filteredNames.length}
              value={multipleCount}
              onChange={(e) => onMultipleCount(Math.max(1, Math.min(filteredNames.length, Number(e.target.value) || 1)))}
              className="w-14 px-2 py-1 text-sm rounded-lg border border-(--border) bg-(--card) text-(--foreground) text-center focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
            <span className="text-xs text-(--muted-foreground)">winners</span>
          </div>
        )}
      </Card>

      <Card className="p-4 text-center flex flex-col items-center justify-center min-h-[200px]">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="space-y-2"
            >
              <Users size="32" className="mx-auto text-(--primary)" />
              <p className="text-lg font-bold text-(--foreground)">{selected}</p>
              <p className="text-xs text-(--muted-foreground)">{winners.length} selected</p>
            </motion.div>
          ) : (
            <div className="text-(--muted-foreground)">
              <Shuffle size="32" className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Pick a name!</p>
            </div>
          )}
        </AnimatePresence>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex gap-2">
          <Button variant="primary" className="flex-1" size="sm" onClick={onPickOne} disabled={filteredNames.length === 0 || isAnimating}>
            Pick One
          </Button>
          <Button variant="secondary" className="flex-1" size="sm" onClick={onPickMultiple} disabled={filteredNames.length < multipleCount}>
            Pick {multipleCount}
          </Button>
        </div>

        {(winners.length > 0 || selected) && (
          <Button variant="ghost" size="sm" className="w-full" onClick={onReset}>
            <RotateCcw size="14" /> Reset
          </Button>
        )}

        {history.length > 0 && (
          <>
            <div className="flex items-center justify-between pt-2 border-t border-(--border)">
              <span className="text-xs font-semibold text-(--foreground)">History ({history.length})</span>
              <button onClick={onClearHistory} className="text-xs text-(--muted-foreground) hover:text-(--danger)">Clear</button>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-0.5 custom-scrollbar">
              {history.slice(0, 10).map((h) => (
                <div key={h.id} className="flex justify-between items-center text-xs px-2 py-1 rounded bg-(--muted)">
                  <span className="text-(--foreground)">{h.name}</span>
                  <span className="text-(--muted-foreground)">{new Date(h.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
