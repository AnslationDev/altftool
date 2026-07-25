"use client";

import { useState } from "react";
import { Modal, Button } from "@altftool/ui";
import { Download, Upload, FileJson, FileText } from "lucide-react";
import { downloadJSON } from "../utils/helpers";

export default function ImportExport({ open, onClose, entries, onImport }) {
  const [importText, setImportText] = useState("");

  const handleExport = () => {
    downloadJSON(entries, `wheel-entries-${Date.now()}.json`);
  };

  const handleImportText = () => {
    try {
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed)) {
        onImport(parsed);
        onClose();
        setImportText("");
      }
    } catch {
      const lines = importText.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        onImport(lines);
        onClose();
        setImportText("");
      }
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) onImport(data);
      } catch {
        const lines = ev.target.result.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length > 0) onImport(lines);
      }
      onClose();
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <Modal open={open} onClose={onClose} title="Import / Export" size="sm">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-(--foreground) mb-2">Export</p>
          <Button variant="secondary" className="w-full justify-start" onClick={handleExport}>
            <Download size="16" /> Download JSON ({entries.length} entries)
          </Button>
        </div>
        <div>
          <p className="text-xs font-semibold text-(--foreground) mb-2">Import JSON</p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='["Entry 1", "Entry 2"] or one per line'
            aria-label="Entries to import, JSON or one per line"
            className="w-full h-24 px-3 py-2 text-sm rounded-lg border border-(--border) bg-(--card) text-(--foreground) resize-none focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25"
          />
          <div className="flex gap-2 mt-2">
            <Button variant="primary" size="sm" onClick={handleImportText} disabled={!importText.trim()}>
              <Upload size="14" /> Import
            </Button>
            <label className="flex-1">
              <Button variant="outline" size="sm" className="w-full" as="span">
                <FileJson size="14" /> From File
              </Button>
              <input type="file" accept=".json,.csv,.txt" onChange={handleFile} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
