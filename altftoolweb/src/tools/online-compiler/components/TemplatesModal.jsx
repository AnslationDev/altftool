"use client";

import Modal from "./Modal";
import { TEMPLATES } from "../utils/templates";

export default function TemplatesModal({ open, onClose, onPick }) {
  return (
    <Modal open={open} onClose={onClose} title="Starter Templates" maxWidth="max-w-2xl">
      <p className="mb-4 text-sm text-(--muted-foreground)">
        Choose a starter template to replace the current editors.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => onPick(t.name)}
            className="rounded-xl border border-(--border) bg-(--background) px-3 py-4 text-left text-sm font-medium text-(--foreground) transition hover:border-(--primary) hover:bg-(--primary)/5"
          >
            {t.name}
          </button>
        ))}
      </div>
    </Modal>
  );
}
