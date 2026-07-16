"use client";

// FaceSelector: overlay rendered over the preview image when multiple faces
// are detected. Lets the user pick which face to edit (requirement #18).
// Pure UI, does not alter the surrounding layout.

export default function FaceSelector({ faces, imageSrc, onSelect }) {
  if (!faces || faces.length < 2) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-full h-full">
        <img src={imageSrc} alt="Faces" className="w-full h-full object-contain pointer-events-none" />
        <div className="absolute inset-0">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-[var(--card)] text-xs font-medium text-[var(--foreground)] shadow-lg border border-[var(--border)]">
            Multiple faces detected — tap a face to edit
          </div>
          {faces.map((f, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className="absolute rounded-lg border-2 border-dashed border-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/25 transition-colors"
              style={{
                left: `${(f.x / (faces._w || 1)) * 100}%`,
                top: `${(f.y / (faces._h || 1)) * 100}%`,
                width: `${(f.width / (faces._w || 1)) * 100}%`,
                height: `${(f.height / (faces._h || 1)) * 100}%`,
              }}
              aria-label={`Edit face ${i + 1}`}
            >
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[var(--primary)] text-white text-[10px] font-bold">
                {i + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
