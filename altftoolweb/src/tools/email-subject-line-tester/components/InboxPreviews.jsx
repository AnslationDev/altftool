"use client";

import { Mail } from "lucide-react";
import Card from "./ui/Card";

export default function InboxPreviews({ subject, previews }) {
  if (!subject) {
    return (
      <Card className="p-6 text-sm text-(--muted-foreground)">
        Type a subject line to preview truncation across Gmail, Outlook and Apple Mail.
      </Card>
    );
  }

  const clients = Object.values(previews);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {clients.map((client) => (
        <Card key={client.id} className="p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-(--foreground)">{client.label}</span>
            <span className="text-right text-[11px] text-(--muted-foreground)">{client.note}</span>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-(--border) bg-(--background) p-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-(--foreground)">Your Brand</span>
                <span className="shrink-0 text-xs text-(--muted-foreground)">9:41 AM</span>
              </div>
              <p className="truncate text-sm text-(--foreground)/90">{client.visible}</p>
            </div>
          </div>
          {client.truncated && (
            <p className="mt-2 text-xs text-warning">
              Truncated — {client.hiddenChars} character{client.hiddenChars === 1 ? "" : "s"} hidden on this client.
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
