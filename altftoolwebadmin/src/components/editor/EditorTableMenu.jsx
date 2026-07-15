"use client";

import React from "react";
import {
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  Columns3,
  Combine,
  Rows3,
  Split,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import { useAltfEditor } from "./EditorProvider.jsx";

/**
 * EditorTableMenu — contextual table controls, shown while the caret is
 * inside a table. Covers rows, columns, merge/split, header row/column.
 */
export default function EditorTableMenu() {
  const { editor, readOnly } = useAltfEditor();
  if (!editor || readOnly || !editor.isActive("table")) return null;

  const actions = [
    { icon: ArrowUpToLine, label: "Row above", run: () => editor.chain().focus().addRowBefore().run() },
    { icon: ArrowDownToLine, label: "Row below", run: () => editor.chain().focus().addRowAfter().run() },
    { icon: ArrowLeftToLine, label: "Col left", run: () => editor.chain().focus().addColumnBefore().run() },
    { icon: ArrowRightToLine, label: "Col right", run: () => editor.chain().focus().addColumnAfter().run() },
    { icon: Rows3, label: "Delete row", run: () => editor.chain().focus().deleteRow().run() },
    { icon: Columns3, label: "Delete col", run: () => editor.chain().focus().deleteColumn().run() },
    {
      icon: Combine,
      label: "Merge cells",
      run: () => editor.chain().focus().mergeCells().run(),
      disabled: !editor.can().mergeCells(),
    },
    {
      icon: Split,
      label: "Split cell",
      run: () => editor.chain().focus().splitCell().run(),
      disabled: !editor.can().splitCell(),
    },
    { icon: Rows3, label: "Header row", run: () => editor.chain().focus().toggleHeaderRow().run() },
    { icon: Columns3, label: "Header col", run: () => editor.chain().focus().toggleHeaderColumn().run() },
  ];

  return (
    <div className="altft-table-menu" role="toolbar" aria-label="Table controls">
      <span className="altft-table-menu__title">
        <TableIcon size={12} /> Table
      </span>
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          disabled={action.disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={action.run}
          className="altft-table-menu__button"
        >
          <action.icon size={12} /> {action.label}
        </button>
      ))}
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor.chain().focus().deleteTable().run()}
        className="altft-table-menu__button is-danger"
      >
        <Trash2 size={12} /> Delete table
      </button>
    </div>
  );
}
