"use client";

export default function OfflineBadge() {
  return (
    <div className="flex items-center justify-center gap-2 py-1.5 px-4 rounded-full border border-(--border) bg-(--muted)/30 w-fit mx-auto">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse sm:inline-block shrink-0 hidden" />
      <span className="text-xs text-(--muted-foreground)">
        100% in-browser · your files never leave this device
      </span>
    </div>
  );
}