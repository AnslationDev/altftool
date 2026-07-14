export default function Logo({ light = false, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand via-brand-purple to-brand-cyan shadow-lg shadow-brand/30">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 17l5-6 4 4 5-7 4 5" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-white dark:ring-ink" />
      </div>
      <span
        className={`text-lg font-extrabold tracking-tight ${
          light ? "text-white" : "text-ink dark:text-white"
        }`}
      >
        Apex<span className="gt">Boost</span>
      </span>
    </div>
  );
}
