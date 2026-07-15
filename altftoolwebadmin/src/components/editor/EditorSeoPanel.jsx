"use client";

import React, { useMemo } from "react";
import { CircleCheck, ExternalLink, Globe, Info, TriangleAlert, X } from "lucide-react";
import { useAltfEditor } from "./EditorProvider.jsx";
import { seoAudit } from "./EditorUtils.js";

/**
 * EditorSeoPanel — live content audit: heading structure, missing image
 * alt text, internal/external links, and a table-of-contents preview
 * built from heading anchors.
 */
export default function EditorSeoPanel({ open, onClose, refreshKey }) {
  const { editor } = useAltfEditor();

  const audit = useMemo(() => {
    if (!editor || editor.isDestroyed) return null;
    return seoAudit(editor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, refreshKey, open]);

  if (!open || !audit) return null;

  return (
    <aside className="altft-seo" aria-label="SEO audit">
      <div className="altft-seo__header">
        <h3>SEO Check</h3>
        <button type="button" aria-label="Close SEO panel" onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      <div className="altft-seo__section">
        <h4>Issues</h4>
        {audit.issues.length === 0 ? (
          <p className="altft-seo__ok">
            <CircleCheck size={13} /> No structural issues found
          </p>
        ) : (
          <ul>
            {audit.issues.map((issue) => (
              <li key={issue.text} className={issue.level === "warn" ? "is-warn" : "is-info"}>
                {issue.level === "warn" ? <TriangleAlert size={12} /> : <Info size={12} />}
                {issue.text}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="altft-seo__section">
        <h4>Links</h4>
        <p className="altft-seo__stat">
          <Globe size={12} /> {audit.links.internal} internal
          <span aria-hidden="true"> · </span>
          <ExternalLink size={12} /> {audit.links.external} external
        </p>
      </div>

      <div className="altft-seo__section">
        <h4>Outline ({audit.headings.length})</h4>
        {audit.headings.length === 0 ? (
          <p className="altft-seo__muted">No headings yet</p>
        ) : (
          <ol className="altft-seo__toc">
            {audit.headings.map((heading, index) => (
              <li key={`${heading.text}-${index}`} style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}>
                <span>H{heading.level}</span> {heading.text || <em>(empty heading)</em>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}
