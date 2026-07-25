export default function AlertItem({ id, text, variant, onClose }) {
  const base =
    "px-4 py-3 rounded-xl shadow-md text-sm font-medium flex items-center justify-between min-w-[250px]";

  const variants = {
    success: "bg-green-500 text-[var(--primary-foreground)]",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-black",
    info: "bg-[var(--primary-muted)] text-[var(--foreground)] border border-[var(--border)]",
  };

  return (
    <div className={`${base} ${variants[variant] || variants.success}`}>
      <span>{text}</span>
      <button
        type="button"
        onClick={() => onClose(id)}
        aria-label="Dismiss alert"
        className="ml-1 -my-2 -mr-1.5 inline-flex items-center justify-center rounded-lg p-2.5 text-xs opacity-70 transition-opacity duration-150 hover:opacity-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transition-none"
      >
        ✕
      </button>
    </div>
  );
}