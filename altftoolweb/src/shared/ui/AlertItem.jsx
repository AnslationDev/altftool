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
        onClick={() => onClose(id)}
        className="ml-3 text-xs opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}