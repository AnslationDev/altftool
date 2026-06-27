import { Minus, Plus, Pipette } from "lucide-react";

const LASER_COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Yellow", value: "#eab308" },
  { name: "Purple", value: "#a855f7" },
  { name: "White", value: "#ffffff" },
  { name: "Custom", value: "custom" },
];

export default function LaserPanel({ size, color, onSizeChange, onColorChange }) {
  return (
    <aside className="sf-laser-panel">
      <div className="sf-laser-head">Laser Pen</div>

      <div className="sf-laser-section">
        <label>Size</label>
        <div className="sf-laser-size-row">
          <button
            type="button"
            className="sf-laser-size-btn"
            onClick={() => onSizeChange(Math.max(2, size - 2))}
          >
            <Minus className="h-3 w-3" />
          </button>
          <input
            type="range"
            min="2"
            max="40"
            step="1"
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
          />
          <button
            type="button"
            className="sf-laser-size-btn"
            onClick={() => onSizeChange(Math.min(40, size + 2))}
          >
            <Plus className="h-3 w-3" />
          </button>
          <span className="sf-laser-size-label">{size}px</span>
        </div>
      </div>

      <div className="sf-laser-section">
        <label>Color</label>
        <div className="sf-laser-colors">
          {LASER_COLORS.map((c) =>
            c.value === "custom" ? (
              <label key="custom" className={`sf-laser-color-btn ${color && !LASER_COLORS.slice(0, -1).some(p => p.value === color) ? "is-active" : ""}`} title="Custom color">
                <Pipette className="h-4 w-4" />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="sf-laser-color-input"
                />
              </label>
            ) : (
              <button
                key={c.value}
                type="button"
                className={`sf-laser-color-btn ${color === c.value ? "is-active" : ""}`}
                style={{ backgroundColor: c.value }}
                title={c.name}
                onClick={() => onColorChange(c.value)}
              />
            )
          )}
        </div>
      </div>

      <div className="sf-laser-section">
        <label>Preview</label>
        <div className="sf-laser-preview">
          <svg width="120" height="32" viewBox="0 0 120 32">
            <line
              x1="8" y1="16" x2="112" y2="16"
              stroke={color}
              strokeWidth={Math.max(2, size * 0.6)}
              strokeLinecap="round"
              opacity="0.9"
            />
            <circle cx="8" cy="16" r={Math.max(2, size * 0.4)} fill={color} opacity="0.6" />
            <circle cx="112" cy="16" r={Math.max(2, size * 0.4)} fill={color} opacity="0.6" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
