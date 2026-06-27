import { Palette } from "lucide-react";
import { PropertyButton } from "../utils/utils";

export default function PropertiesPanel({
  primary,
  selectedCount,
  includeBackground,
  title = "Properties",
  fontOptions = [],
  onStyleChange,
  onIncludeBackgroundChange,
}) {
  if (!primary) return null;

  const fonts = fontOptions.length
    ? fontOptions
    : ['"Architects Daughter", Excalifont, Virgil, system-ui, sans-serif', "system-ui, sans-serif", "Georgia, serif", "monospace"];

  return (
    <aside className="sf-panel">
      <div className="sf-panel-head">
        <Palette className="h-5 w-5" />
        <div>
          <h2>{title}</h2>
          <p>{selectedCount} selected</p>
        </div>
      </div>
      <div className="sf-field-row">
        <label>Stroke</label>
        <input type="color" value={primary.strokeColor} onChange={(event) => onStyleChange({ strokeColor: event.target.value })} />
        <input value={primary.strokeColor} onChange={(event) => onStyleChange({ strokeColor: event.target.value })} />
      </div>
      <div className="sf-field-row">
        <label>Background</label>
        <input
          type="color"
          value={primary.backgroundColor === "transparent" ? "#ffffff" : primary.backgroundColor}
          onChange={(event) => onStyleChange({ backgroundColor: event.target.value })}
        />
        <button className="sf-prop-btn" onClick={() => onStyleChange({ backgroundColor: "transparent", fillStyle: "none" })}>
          None
        </button>
      </div>
      <label className="sf-label">Fill style</label>
      <div className="sf-prop-grid">
        {["hachure", "cross-hatch", "solid", "dots", "none"].map((value) => (
          <PropertyButton key={value} active={primary.fillStyle === value} onClick={() => onStyleChange({ fillStyle: value })}>
            {value}
          </PropertyButton>
        ))}
      </div>
      <label className="sf-label">Stroke width</label>
      <div className="sf-prop-grid sf-three">
        {[1, 2, 4].map((value) => (
          <PropertyButton key={value} active={primary.strokeWidth === value} onClick={() => onStyleChange({ strokeWidth: value })}>
            {value}px
          </PropertyButton>
        ))}
      </div>
      <label className="sf-label">Stroke style</label>
      <div className="sf-prop-grid sf-three">
        {["solid", "dashed", "dotted"].map((value) => (
          <PropertyButton key={value} active={primary.strokeStyle === value} onClick={() => onStyleChange({ strokeStyle: value })}>
            {value}
          </PropertyButton>
        ))}
      </div>
      <label className="sf-label">Roughness {primary.roughness}</label>
      <input type="range" min="0" max="2" step="1" value={primary.roughness} onChange={(event) => onStyleChange({ roughness: Number(event.target.value) })} />
      <label className="sf-label">Opacity {primary.opacity}%</label>
      <input type="range" min="0" max="100" value={primary.opacity} onChange={(event) => onStyleChange({ opacity: Number(event.target.value) })} />
      {primary.type === "text" ? (
        <>
          <label className="sf-label">Text</label>
          <div className="sf-field-row">
            <input type="number" min="8" max="120" value={primary.fontSize} onChange={(event) => onStyleChange({ fontSize: Number(event.target.value) })} />
            <select value={primary.fontFamily} onChange={(event) => onStyleChange({ fontFamily: event.target.value })}>
              {fonts.map((font) => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          <div className="sf-prop-grid sf-three">
            {["left", "center", "right"].map((value) => (
              <PropertyButton key={value} active={primary.textAlign === value} onClick={() => onStyleChange({ textAlign: value })}>
                {value}
              </PropertyButton>
            ))}
          </div>
        </>
      ) : null}
      {primary.type === "arrow" ? (
        <>
          <label className="sf-label">Arrow connector</label>
          <div className="sf-prop-grid sf-three">
            {["straight", "curved", "elbow"].map((value) => (
              <PropertyButton key={value} active={primary.arrowType === value} onClick={() => onStyleChange({ arrowType: value })}>
                {value}
              </PropertyButton>
            ))}
          </div>
          <div className="sf-field-row">
            <select value={primary.startArrowhead} onChange={(event) => onStyleChange({ startArrowhead: event.target.value })}>
              {["none", "triangle", "dot", "bar"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <select value={primary.endArrowhead} onChange={(event) => onStyleChange({ endArrowhead: event.target.value })}>
              {["none", "triangle", "dot", "bar"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
        </>
      ) : null}
      <label className="sf-mini export-bg">
        <input type="checkbox" checked={includeBackground} onChange={(event) => onIncludeBackgroundChange(event.target.checked)} />
        Include export background
      </label>
    </aside>
  );
}
