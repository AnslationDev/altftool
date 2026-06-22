import {
  Download,
  Grid3X3,
  Menu,
  Moon,
  Redo2,
  Save,
  Shapes,
  Sparkles,
  Sun,
  Undo2,
  Upload,
} from "lucide-react";

export default function TopBar({
  currentToolLabel,
  dark,
  grid,
  history,
  onGridChange,
  onGridStepChange,
  onUndo,
  onRedo,
  onExportPng,
  onExportSvg,
  onSave,
  onLoad,
  onToggleTheme,
  onOpenPalette,
}) {
  return (
    <header className="sf-topbar">
      <div className="sf-brand">
        <Sparkles className="h-5 w-5" />
        <div>
          <h1>SketchFlow</h1>
          <p>Hand-drawn infinite whiteboard</p>
        </div>
      </div>
      <div className="sf-options">
        <span className="sf-pill">{currentToolLabel}</span>
        <label className="sf-mini">
          <Grid3X3 className="h-4 w-4" />
          <input
            type="checkbox"
            checked={grid.enabled}
            onChange={(event) => onGridChange(event.target.checked)}
          />
          Grid
        </label>
        <input
          className="sf-step"
          type="number"
          min="8"
          max="128"
          value={grid.step}
          onChange={(event) => onGridStepChange(event.target.value)}
        />
      </div>
      <div className="sf-actions">
        <button className="sf-icon-btn" onClick={onUndo} disabled={!history.past.length} title="Undo (Cmd/Ctrl+Z)">
          <Undo2 className="h-5 w-5" />
        </button>
        <button className="sf-icon-btn" onClick={onRedo} disabled={!history.future.length} title="Redo (Cmd/Ctrl+Shift+Z / Ctrl+Y)">
          <Redo2 className="h-5 w-5" />
        </button>
        <button className="sf-icon-btn" onClick={onExportPng} title="Export PNG">
          <Download className="h-5 w-5" />
        </button>
        <button className="sf-icon-btn" onClick={onExportSvg} title="Export SVG">
          <Shapes className="h-5 w-5" />
        </button>
        <button className="sf-icon-btn" onClick={onSave} title="Save .sketchflow">
          <Save className="h-5 w-5" />
        </button>
        <button className="sf-icon-btn" onClick={onLoad} title="Load file">
          <Upload className="h-5 w-5" />
        </button>
        <button className="sf-icon-btn" onClick={onToggleTheme} title="Theme">
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button className="sf-icon-btn" onClick={onOpenPalette} title="Command palette">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
