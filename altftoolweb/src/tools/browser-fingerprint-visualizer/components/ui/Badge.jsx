"use client";



export  function Badge({ label, variant = "blue", size = "sm", dot = false }) {
  const variants = {
    green: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      dot: "bg-emerald-500",
      border: "border-emerald-500/20",
    },
    yellow: {
      bg: "bg-amber-400/10",
      text: "text-amber-400",
      dot: "bg-amber-400",
      border: "border-amber-400/20",
    },
    red: {
      bg: "bg-rose-500/10",
      text: "text-rose-500",
      dot: "bg-rose-500",
      border: "border-rose-500/20",
    },
    blue: {
      bg: "bg-[var(--primary)]/10",
      text: "text-[var(--primary)]",
      dot: "bg-[var(--primary)]",
      border: "border-[var(--primary)]/20",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-500",
      dot: "bg-cyan-500",
      border: "border-cyan-500/20",
    },
    gray: {
      bg: "bg-[var(--muted)]",
      text: "text-[var(--muted-foreground)]",
      dot: "bg-[var(--muted-foreground)]",
      border: "border-[var(--border)]",
    },
    purple: {
      bg: "bg-violet-500/10",
      text: "text-violet-500",
      dot: "bg-violet-500",
      border: "border-violet-500/20",
    },
  };

  const sizes = {
    xs: "text-[10px] px-2 py-0.5",
    sm: "text-xs px-2.5 py-1",
    md: "text-sm px-3 py-1.5",
  };

  const v = variants[variant] || variants.blue;
  const s = sizes[size] || sizes.sm;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full border
        ${v.bg} ${v.text} ${v.border} ${s}
        transition-colors duration-200
      `}
    >
      {dot && (
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${v.dot} animate-pulse-soft`} />
      )}
      {label}
    </span>
  );
}

/**
 * StatusBadge — convenience wrapper for enabled/disabled/blocked states
 */
export function StatusBadge({ value }) {
  if (value === true || value === "Enabled" || value === "Available") {
    return <Badge label="Enabled" variant="green" dot />;
  }
  if (value === false || value === "Disabled" || value === "Blocked") {
    return <Badge label="Disabled" variant="red" dot />;
  }
  if (value === "Unknown" || value === null || value === undefined) {
    return <Badge label="Unknown" variant="gray" />;
  }
  return <Badge label={String(value)} variant="blue" />;
}


export function RiskBadge({ level }) {
  const map = {
    Low: "green",
    Medium: "yellow",
    High: "red",
  };
  return <Badge label={level} variant={map[level] || "gray"} dot size="md" />;
}

/**
 * ImpactBadge — for privacy tip impact levels
 */
export function ImpactBadge({ impact }) {
  const map = {
    "Very High": "red",
    High: "orange",
    Medium: "yellow",
    Low: "gray",
  };

  // orange uses amber styles
  const variantMap = {
    "Very High": "red",
    High: "yellow",
    Medium: "cyan",
    Low: "gray",
  };

  

  return <Badge label={`${impact} Impact`} variant={variantMap[impact] || "gray"} size="xs" />;
}




export function StatusDot({ available = true, size = "sm" }) {
  const sizes = { sm: "w-2 h-2", md: "w-3 h-3" };
  return (
    <span
      className={[
        "inline-block rounded-full flex-shrink-0",
        sizes[size],
        available
          ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]"
          : "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]",
      ].join(" ")}
    />
  );
}