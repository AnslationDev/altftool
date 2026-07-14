"use client";

import { useCallback, useEffect, useRef } from "react";
import TreeNode from "./TreeNode";
import Minimap from "./Minimap";
import { getVisibleNodes } from "../utils/tree";

// Renders the interactive tree canvas with zoom/pan, minimap, and keyboard nav.
export default function TreeView({
  root,
  expanded,
  toggle,
  selectedId,
  onSelect,
  focusedId,
  setFocusedId,
  matched,
  query,
  visibleIds,
  panZoom,
}) {
  const containerRef = useRef(null);

  const visible = getVisibleNodes(root, expanded);

  // Keep DOM focus in sync with the roving focus id.
  useEffect(() => {
    if (!focusedId || !containerRef.current) return;
    const el = containerRef.current.querySelector(
      `[data-node-id="${focusedId}"]`
    );
    if (el && document.activeElement !== el) el.focus();
  }, [focusedId, visible.length]);

  const moveFocus = useCallback(
    (id) => {
      if (id) setFocusedId(id);
    },
    [setFocusedId]
  );

  const onKeyDown = useCallback(
    (e) => {
      const list = getVisibleNodes(root, expanded);
      const idx = list.findIndex((n) => n.id === focusedId);
      const current = list[idx];
      if (!current) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          if (idx < list.length - 1) moveFocus(list[idx + 1].id);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          if (idx > 0) moveFocus(list[idx - 1].id);
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          if (current.children.length > 0 && !expanded.has(current.id)) {
            toggle(current.id);
          } else if (idx < list.length - 1) {
            moveFocus(list[idx + 1].id);
          }
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          if (current.children.length > 0 && expanded.has(current.id)) {
            toggle(current.id);
          } else if (current.parent) {
            moveFocus(current.parent.id);
          }
          break;
        }
        case "Enter":
        case " ": {
          e.preventDefault();
          onSelect(current);
          if (current.children.length > 0) toggle(current.id);
          break;
        }
        case "Home": {
          e.preventDefault();
          if (list[0]) moveFocus(list[0].id);
          break;
        }
        case "End": {
          e.preventDefault();
          if (list[list.length - 1]) moveFocus(list[list.length - 1].id);
          break;
        }
        default:
          break;
      }
    },
    [root, expanded, focusedId, toggle, onSelect, moveFocus]
  );

  const handlePointerDown = useCallback(
    (e) => {
      if (e.target.closest("[data-node-id]") || e.target.closest("button")) return;
      panZoom.handlers.onPointerDown(e);
    },
    [panZoom]
  );

  return (
    <div className="relative">
      <div
        ref={containerRef}
        role="tree"
        aria-label="Folder structure tree"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={panZoom.handlers.onPointerMove}
        onPointerUp={panZoom.handlers.onPointerUp}
        onPointerLeave={panZoom.handlers.onPointerUp}
        onWheel={panZoom.handlers.onWheel}
        className={`relative h-[60vh] min-h-[360px] overflow-auto rounded-xl border border-(--border) bg-(--card) p-3 shadow-sm ${
          panZoom.isDragging.current ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
      >
        <div
          className="origin-top-left"
          style={{
            transform: `translate(${panZoom.offset.x}px, ${panZoom.offset.y}px) scale(${panZoom.scale})`,
          }}
        >
          <ul role="group" className="min-w-max">
            <TreeNode
              node={root}
              expanded={expanded}
              toggle={toggle}
              selectedId={selectedId}
              onSelect={onSelect}
              focusedId={focusedId}
              onFocusNode={setFocusedId}
              matched={matched}
              query={query}
              visibleIds={visibleIds}
            />
          </ul>
        </div>
      </div>
      <Minimap
        visible={visible}
        selectedId={selectedId}
        zoom={panZoom.scale}
        onSeek={(id) => moveFocus(id)}
      />
    </div>
  );
}
