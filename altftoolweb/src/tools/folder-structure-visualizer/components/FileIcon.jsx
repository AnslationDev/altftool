"use client";

import { Folder, FolderOpen } from "lucide-react";
import { getFileGlyph } from "../utils/fileTypes";

// Renders the correct lucide icon for a tree node. Folders reflect their
// expanded state; files are tinted with the muted foreground token.
export default function FileIcon({ node, isOpen }) {
  const isFolder = node.type === "folder";
  const glyph = isFolder
    ? isOpen
      ? <FolderOpen className="h-4 w-4" strokeWidth={1.75} />
      : <Folder className="h-4 w-4" strokeWidth={1.75} />
    : getFileGlyph(node);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${
        isFolder ? "text-(--primary)" : "text-(--muted-foreground)"
      }`}
      aria-hidden="true"
    >
      {glyph}
    </span>
  );
}
