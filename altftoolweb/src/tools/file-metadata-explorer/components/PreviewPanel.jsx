"use client";

import { useState, useEffect } from "react";

export default function PreviewPanel({ fileData }) {
  const [preview, setPreview] = useState(null);
  const [type, setType] = useState(null);

  useEffect(() => {
    if (!fileData?.file) { setPreview(null); return; }
    const f = fileData.file;
    const mime = f.type;

    if (mime.startsWith("image/")) {
      setType("image");
      const url = URL.createObjectURL(f);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (mime.startsWith("text/") || f.name.match(/\.(md|json|xml|csv|html|css|js|jsx|ts|tsx|yml|yaml|sh|bat|py|rb|java|c|cpp|h|rs|go|php)$/)) {
      setType("text");
      f.text().then((t) => setPreview(t.slice(0, 2000)));
    } else if (mime.startsWith("audio/")) {
      setType("audio");
      const url = URL.createObjectURL(f);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (mime.startsWith("video/")) {
      setType("video");
      const url = URL.createObjectURL(f);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setType(null);
      setPreview(null);
    }
  }, [fileData]);

  if (!fileData) return null;

  return (
    <div className="rounded-xl border border-(--border) overflow-hidden bg-(--card)">
      <div className="px-3 py-2 bg-(--muted) border-b border-(--border) text-xs font-semibold text-(--foreground)">
        Preview
      </div>
      <div className="p-3 max-h-64 overflow-auto">
        {type === "image" && preview && (
          <img src={preview} alt="Preview" className="max-w-full max-h-56 rounded-lg object-contain mx-auto" />
        )}
        {type === "text" && preview && (
          <pre className="text-xs font-mono text-(--foreground) whitespace-pre-wrap break-all leading-relaxed">
            {preview}
            {fileData.file.size > 2000 && (
              <span className="block mt-2 text-(--muted-foreground) italic">
                ... truncated ({fileData.file.size} bytes total)
              </span>
            )}
          </pre>
        )}
        {type === "audio" && preview && (
          <audio controls src={preview} className="w-full" />
        )}
        {type === "video" && preview && (
          <video controls src={preview} className="w-full max-h-56 rounded-lg" />
        )}
        {!type && (
          <div className="text-center text-sm text-(--muted-foreground) py-8">
            No preview available for this file type
          </div>
        )}
      </div>
    </div>
  );
}
