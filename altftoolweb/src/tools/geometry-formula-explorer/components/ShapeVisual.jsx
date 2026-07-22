export default function ShapeVisual({ shapeId, values }) {
  const color = "var(--primary)";

  const renderShape = () => {
    switch (shapeId) {
      case "circle":
        return (
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle cx="100" cy="100" r="70" fill="none" stroke={color} strokeWidth="2.5" />
            <line x1="100" y1="100" x2="170" y2="100" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="135" y="95" textAnchor="middle" className="fill-[var(--foreground)] text-xs font-bold">r</text>
          </svg>
        );
      case "rectangle":
        return (
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <rect x="30" y="50" width="140" height="100" fill="none" stroke={color} strokeWidth="2.5" />
            <text x="100" y="170" textAnchor="middle" className="fill-[var(--foreground)] text-xs font-bold">l</text>
            <text x="190" y="105" textAnchor="middle" className="fill-[var(--foreground)] text-xs font-bold">w</text>
          </svg>
        );
      case "triangle":
        return (
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <polygon points="100,30 30,170 170,170" fill="none" stroke={color} strokeWidth="2.5" />
            <line x1="100" y1="170" x2="100" y2="30" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="100" y="190" textAnchor="middle" className="fill-[var(--foreground)] text-xs font-bold">b</text>
            <text x="115" y="100" className="fill-[var(--foreground)] text-xs font-bold">h</text>
          </svg>
        );
      case "trapezoid":
        return (
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <polygon points="60,50 140,50 170,150 30,150" fill="none" stroke={color} strokeWidth="2.5" />
            <text x="100" y="40" textAnchor="middle" className="fill-[var(--foreground)] text-xs font-bold">a</text>
            <text x="100" y="170" textAnchor="middle" className="fill-[var(--foreground)] text-xs font-bold">b</text>
            <line x1="100" y1="50" x2="100" y2="150" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="115" y="105" className="fill-[var(--foreground)] text-xs font-bold">h</text>
          </svg>
        );
      case "parallelogram":
        return (
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <polygon points="60,50 170,50 140,150 30,150" fill="none" stroke={color} strokeWidth="2.5" />
            <text x="115" y="40" textAnchor="middle" className="fill-[var(--foreground)] text-xs font-bold">b</text>
            <line x1="170" y1="50" x2="170" y2="150" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="185" y="105" className="fill-[var(--foreground)] text-xs font-bold">h</text>
          </svg>
        );
      case "ellipse":
        return (
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <ellipse cx="100" cy="100" rx="80" ry="50" fill="none" stroke={color} strokeWidth="2.5" />
            <line x1="100" y1="100" x2="180" y2="100" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="100" y1="100" x2="100" y2="50" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="145" y="95" className="fill-[var(--foreground)] text-xs font-bold">a</text>
            <text x="108" y="75" className="fill-[var(--foreground)] text-xs font-bold">b</text>
          </svg>
        );
      case "sphere":
        return (
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle cx="100" cy="100" r="65" fill="none" stroke={color} strokeWidth="2.5" />
            <ellipse cx="100" cy="100" rx="65" ry="20" fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 3" />
            <line x1="100" y1="100" x2="165" y2="100" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="135" y="95" className="fill-[var(--foreground)] text-xs font-bold">r</text>
          </svg>
        );
      case "cylinder":
        return (
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <ellipse cx="100" cy="50" rx="50" ry="15" fill="none" stroke={color} strokeWidth="2" />
            <line x1="50" y1="50" x2="50" y2="150" stroke={color} strokeWidth="2.5" />
            <line x1="150" y1="50" x2="150" y2="150" stroke={color} strokeWidth="2.5" />
            <ellipse cx="100" cy="150" rx="50" ry="15" fill="none" stroke={color} strokeWidth="2" />
            <text x="100" y="200" textAnchor="middle" className="fill-[var(--foreground)] text-xs font-bold">h</text>
            <text x="130" y="45" className="fill-[var(--foreground)] text-xs font-bold">r</text>
          </svg>
        );
      case "cone":
        return (
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <polygon points="100,30 40,160 160,160" fill="none" stroke={color} strokeWidth="2.5" />
            <ellipse cx="100" cy="160" rx="60" ry="15" fill="none" stroke={color} strokeWidth="2" />
            <line x1="100" y1="30" x2="100" y2="160" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="115" y="95" className="fill-[var(--foreground)] text-xs font-bold">h</text>
            <text x="140" y="170" className="fill-[var(--foreground)] text-xs font-bold">r</text>
          </svg>
        );
      case "rectangular_prism":
        return (
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <rect x="40" y="50" width="100" height="80" fill="none" stroke={color} strokeWidth="2" />
            <polygon points="40,50 70,30 170,30 140,50" fill="none" stroke={color} strokeWidth="2" />
            <line x1="140" y1="50" x2="140" y2="130" stroke={color} strokeWidth="2" />
            <text x="90" y="145" textAnchor="middle" className="fill-[var(--foreground)] text-xs font-bold">l</text>
            <text x="155" y="95" className="fill-[var(--foreground)] text-xs font-bold">w</text>
            <text x="25" y="100" className="fill-[var(--foreground)] text-xs font-bold">h</text>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-48 items-center justify-center p-4">
      {renderShape()}
    </div>
  );
}
