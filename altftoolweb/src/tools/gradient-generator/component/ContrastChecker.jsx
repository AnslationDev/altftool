function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function getLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hexToRgb(hex1));
  const l2 = getLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getGrade(ratio) {
  if (ratio >= 7)   return { grade: "AAA", label: "Perfect",  color: "text-green-500" };
  if (ratio >= 4.5) return { grade: "AA",  label: "Good",     color: "text-green-400" };
  if (ratio >= 3)   return { grade: "AA*", label: "Large Only", color: "text-yellow-500" };
  return               { grade: "Fail", label: "Poor",      color: "text-red-500" };
}

export default function ContrastChecker({ gradient, color1, color2 }) {
  const whiteContrast = getContrastRatio(color1, "#ffffff");
  const blackContrast = getContrastRatio(color1, "#000000");
  const whiteContrast2 = getContrastRatio(color2, "#ffffff");
const blackContrast2 = getContrastRatio(color2, "#000000");
    const whiteWorst = Math.min(whiteContrast, whiteContrast2);
const blackWorst = Math.min(blackContrast, blackContrast2);
  const whiteGrade    = getGrade(whiteContrast);
  const blackGrade    = getGrade(blackContrast);
  const bestContrast = Math.max(whiteWorst, blackWorst);
  const bestGrade     = getGrade(bestContrast);
const suggestedText = whiteWorst >= blackWorst ? "#ffffff" : "#000000";

  return (
    <div className="p-4 border border-(--border) rounded-xl space-y-4">
      <h4 className="text-sm font-semibold">Contrast Checker</h4>

      {/* Preview */}
      <div
        className="w-full h-16 rounded-lg flex items-center justify-center gap-6 text-sm font-semibold border border-(--border)"
        style={{ background: gradient }}
      >
        <span style={{ color: "#ffffff", textShadow: "none" }}>White Text</span>
        <span style={{ color: "#000000" }}>Black Text</span>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3">
        {/* White */}
        <div className="p-3 bg-(--card) rounded-lg border border-(--border) space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-white border border-gray-200" />
            <span className="text-xs font-medium">White text</span>
          </div>
          <p className="text-lg font-bold">{whiteContrast.toFixed(2)}:1</p>
          <p className={`text-xs font-semibold ${whiteGrade.color}`}>
            {whiteGrade.grade} — {whiteGrade.label}
          </p>
        </div>

        {/* Black */}
        <div className="p-3 bg-(--card) rounded-lg border border-(--border) space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-black border border-gray-700" />
            <span className="text-xs font-medium">Black text</span>
          </div>
          <p className="text-lg font-bold">{blackContrast.toFixed(2)}:1</p>
          <p className={`text-xs font-semibold ${blackGrade.color}`}>
            {blackGrade.grade} — {blackGrade.label}
          </p>
        </div>
      </div>

      {/* Suggestion */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-lg border border-(--border)"
        style={{ background: gradient }}
      >
        <span className="text-xs" style={{ color: suggestedText }}>
          <span className="shrink-0 text-sm">✦</span> Suggested text color
        </span>
        <span
          className="text-sm font-bold font-mono"
          style={{ color: suggestedText }}
        >
          {suggestedText === "#ffffff" ? "⬜ White" : "⬛ Black"}
        </span>
      </div>

      {/* WCAG Legend */}
      <div className="flex flex-wrap gap-2 text-xs text-(--foreground)">
        <span className="text-green-500 font-medium">AAA ≥ 7:1</span>
        <span>·</span>
        <span className="text-green-400 font-medium">AA ≥ 4.5:1</span>
        <span>·</span>
        <span className="text-yellow-500 font-medium">AA* ≥ 3:1</span>
        <span>·</span>
        <span className="text-red-500 font-medium">Fail &lt; 3:1</span>
      </div>
    </div>
  );
}