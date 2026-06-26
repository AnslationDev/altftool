import {
  Download,
  Grid3X3,
  Menu,
  Moon,
  Redo2,
  Save,
  Share2,
  Shapes,
  Sun,
  Undo2,
  Upload,
  Circle,
  Frame,
  Image as ImageIcon,
  MousePointer2,
  Palette,
  PenLine,
  Sparkles,
  Square,
  Zap,
} from "lucide-react";

const BRAND_ICONS = {
  Sparkles,
  PenLine,
  Palette,
  Shapes,
  MousePointer2,
  Square,
  Circle,
  Zap,
  Frame,
  Image: ImageIcon,
};

function BrandIcon({ name, ...props }) {
  const Cmp = BRAND_ICONS[name] || Sparkles;
  return <Cmp {...props} />;
}

export default function TopBar({
  appName = "SketchFlow",
  tagline = "Hand-drawn infinite whiteboard",
  brandIconKey = "Sparkles",
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
  onShare,
  onToggleTheme,
  onOpenPalette,
}) {
  return (
    <header className="sf-topbar">
      <div className="sf-brand">
        <BrandIcon name={brandIconKey} className="h-5 w-5" />
        <div>
          <h1>{appName}</h1>
          <p>{tagline}</p>
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
        <button className="sf-icon-btn" onClick={onShare} title="Share via link">
          <Share2 className="h-5 w-5" />
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
