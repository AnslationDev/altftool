"use client";

import { Modal, Button } from "@altftool/ui";
import { FileJson, FileText, Download, Copy, Check } from "lucide-react";
import { exportToJson, exportToCsv, exportToTxt, generateId } from "../utils/helpers";
import { useState } from "react";

export default function ExportDialog({ open, onClose, tabs }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const json = JSON.stringify(tabs, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Export Session" size="sm">
      <div className="space-y-3">
        <Button variant="secondary" className="w-full justify-start" onClick={() => exportToJson(tabs)}>
          <FileJson size="16" /> Export JSON
        </Button>
        <Button variant="secondary" className="w-full justify-start" onClick={() => exportToCsv(tabs)}>
          <FileText size="16" /> Export CSV
        </Button>
        <Button variant="secondary" className="w-full justify-start" onClick={() => exportToTxt(tabs)}>
          <FileText size="16" /> Export TXT
        </Button>
        <Button variant="secondary" className="w-full justify-start" onClick={handleCopy}>
          {copied ? <Check size="16" className="text-(--primary)" /> : <Copy size="16" />}
          {copied ? "Copied!" : "Copy as JSON"}
        </Button>
      </div>
    </Modal>
  );
}
