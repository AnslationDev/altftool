"use client";

import { useState, useRef } from "react";
import { Button, Card } from "@altftool/ui";
import { Upload, Code, Link as LinkIcon, Clipboard, FileText } from "lucide-react";

export default function UploadPanel({ onProcess, onManualAdd }) {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const fileRef = useRef(null);

  const handlePaste = () => {
    if (text.trim()) {
      onProcess(text, "auto");
      setText("");
    }
  };

  const handleManualUrl = () => {
    if (url.trim()) {
      onManualAdd(url);
      setUrl("");
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      onProcess(content, "auto");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <Card className="p-4">
        <h4 className="text-xs font-semibold text-(--foreground) uppercase tracking-wider mb-3">
          Import Session Data
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex gap-2 mb-2">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleManualUrl(); }}
                placeholder="Enter URL manually..."
                aria-label="URL to add manually"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-(--border) bg-(--card) text-(--foreground) focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25"
              />
              <Button variant="primary" size="sm" className="active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:ring-[3px] focus-visible:ring-(--primary)" onClick={handleManualUrl} disabled={!url.trim()}>
                <LinkIcon size="14" /> Add
              </Button>
            </div>
          </div>

          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste JSON session data, CSV URLs, or bookmark exports..."
              aria-label="Session data to analyze"
              className="w-full h-28 px-3 py-2 text-sm rounded-lg border border-(--border) bg-(--card) text-(--foreground) resize-none focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25 font-mono"
            />
            <div className="flex gap-2 mt-2">
              <Button variant="primary" size="sm" className="active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:ring-[3px] focus-visible:ring-(--primary)" onClick={handlePaste} disabled={!text.trim()}>
                <Clipboard size="14" /> Analyze
              </Button>
              <label className="flex-1">
                <Button variant="secondary" size="sm" className="w-full" as="span">
                  <Upload size="14" /> Import File
                </Button>
                <input ref={fileRef} type="file" accept=".json,.csv,.txt,.html" onChange={handleFile} className="hidden" aria-label="Import session file" />
              </label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
