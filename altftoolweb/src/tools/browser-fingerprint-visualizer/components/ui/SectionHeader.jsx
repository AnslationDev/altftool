"use client";



export function SectionHeader({
  icon = "",
  title = "",
  subtitle = "",
  action = null,   
  className = "",
}) {
  return (
    <div className={`flex items-start justify-between gap-3 mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        {/* Icon bubble */}
        {icon && (
          <div className="
            w-11 h-11 rounded-xl
            bg-[var(--primary)]/10
            flex items-center justify-center
            text-lg shrink-0
            transition-transform duration-200
            group-hover:scale-110
          ">
            {icon}
          </div>
        )}

        <div>
          <h3 className="
            font-semibold text-lg text-[(--card-foreground)]
            font-primary leading-tight
          ">
            {title}
          </h3>
          {subtitle && (
            <p className="text-md text-[(--muted-foreground)] mt-0.5 font-secondary">
              {subtitle}
            </p>
          )}
        </div>
      </div>

     
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}


export function DataRow({ label, value, mono = false, highlight = false }) {
  return (
    <div className="
      flex items-center justify-between
      py-2 border-b border-[(--border)]/50 last:border-0
      gap-4
    ">
      <span className="text-sm text-[(--muted-foreground)] font-secondary shrink-0">
        {label}
      </span>
      <span className={`
        text-sm text-right break-all font-medium
        ${mono ? "font-mono" : "font-secondary"}
        ${highlight
          ? "text-[(--primary)] font-medium"
          : "text-[(--card-foreground)]"
        }
      `}>
        {value ?? "—"}
      </span>
    </div>
  );
}


export function SectionDivider({ label = "" }) {
  return (
    <div className="flex items-center gap-3 my-4">
      {label && (
        <span className="text-[15px] uppercase tracking-widest text-[(--muted-foreground)] whitespace-nowrap">
          {label}
        </span>
      )}
      <div className="flex-1 h-px bg-[(--border)]" />
    </div>
  );
}