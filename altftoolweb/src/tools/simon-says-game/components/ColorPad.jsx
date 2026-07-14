"use client";

const PAD_STYLES = {
  green: {
    base: "bg-emerald-600 hover:brightness-110",
    active: "bg-emerald-400 shadow-[0_0_40px_rgba(16,163,127,0.7)]",
    dark: "dark:bg-emerald-800 dark:active:bg-emerald-400",
  },
  red: {
    base: "bg-red-500 hover:brightness-110",
    active: "bg-red-300 shadow-[0_0_40px_rgba(239,68,68,0.7)]",
    dark: "dark:bg-red-800 dark:active:bg-red-300",
  },
  yellow: {
    base: "bg-yellow-400 hover:brightness-110",
    active: "bg-yellow-200 shadow-[0_0_40px_rgba(250,204,21,0.7)]",
    dark: "dark:bg-yellow-700 dark:active:bg-yellow-300",
  },
  blue: {
    base: "bg-blue-500 hover:brightness-110",
    active: "bg-blue-300 shadow-[0_0_40px_rgba(59,130,246,0.7)]",
    dark: "dark:bg-blue-800 dark:active:bg-blue-300",
  },
};

export default function ColorPad({ color, isFlashing, onClick, disabled }) {
  const style = PAD_STYLES[color] || PAD_STYLES.green;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${color} pad`}
      className={`
        relative w-full aspect-square rounded-xl border-2 border-white/10
        transition-all duration-150 ease-out
        focus:outline-none focus:ring-4 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]
        ${isFlashing ? style.active : style.base}
        ${disabled && !isFlashing ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}
        ${style.dark}
      `}
    >
      {isFlashing && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-xl animate-pulse bg-white/20"
        />
      )}
    </button>
  );
}
