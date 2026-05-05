"use client";

export default function Options({ caseSensitive, setCaseSensitive }) {
  return (
    <label
      className="
        inline-flex items-center gap-3
        text-sm
        text-(--muted-foreground)
        cursor-pointer
        select-none
      "
    >
      <input
        type="checkbox"
        checked={caseSensitive}
        onChange={() => setCaseSensitive(!caseSensitive)}
        className="
          h-4 w-4
          rounded
          border border-(--border)
          accent-(--primary)
          focus:ring-2 focus:ring-(--primary)
          transition cursor-pointer
        "
      />
      <span className="text-(--foreground)">
        Case sensitive
      </span>
    </label>
  );
}
