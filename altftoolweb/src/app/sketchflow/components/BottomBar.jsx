import { Expand, LayoutGrid, Minus, Move, Plus } from "lucide-react";

export default function BottomBar({ zoom, tool, onZoomOut, onZoomIn, onFitToScreen, onAutoLayout, onToggleSelectMode, onFullscreen }) {
  return (
    <div className="sf-bottombar">
      <button type="button" onClick={onZoomOut} title="Zoom out">
        <Minus className="h-4 w-4" />
      </button>
      <span>{Math.round(zoom * 100)}%</span>
      <button type="button" onClick={onZoomIn} title="Zoom in">
        <Plus className="h-4 w-4" />
      </button>
      <button type="button" onClick={onFitToScreen}>
        <Expand className="h-4 w-4" /> Fit
      </button>
      <button type="button" onClick={onAutoLayout} title="Auto-layout diagram">
        <LayoutGrid className="h-4 w-4" /> Layout
      </button>
      <button type="button" onClick={onToggleSelectMode}>
        <Move className="h-4 w-4" /> {tool === "select" ? "Select" : "Draw"}
      </button>
      <button type="button" onClick={onFullscreen}>
        <Expand className="h-4 w-4" /> Fullscreen
      </button>
    </div>
  );
}
