"use client";

import Modal from "./Modal";

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-2">
      <span className="text-sm text-(--foreground)">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? "bg-(--primary)" : "bg-(--muted)"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}

export default function SettingsModal({ open, onClose, settings, onChange }) {
  const set = (patch) => onChange({ ...settings, ...patch });

  return (
    <Modal open={open} onClose={onClose} title="Editor Settings" maxWidth="max-w-md">
      <div className="space-y-1">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-(--foreground)">Font size</span>
          <input
            type="number"
            min={10}
            max={28}
            value={settings.fontSize}
            onChange={(e) => set({ fontSize: Number(e.target.value) || 14 })}
            className="w-20 rounded-md border border-(--border) bg-(--background) px-2 py-1 text-sm text-(--foreground) outline-none focus:border-(--primary)"
          />
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-(--foreground)">Tab size</span>
          <select
            value={settings.tabSize}
            onChange={(e) => set({ tabSize: Number(e.target.value) })}
            className="rounded-md border border-(--border) bg-(--background) px-2 py-1 text-sm text-(--foreground) outline-none focus:border-(--primary)"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-(--foreground)">Auto-run delay (ms)</span>
          <input
            type="number"
            min={0}
            max={3000}
            step={100}
            value={settings.runDelay}
            onChange={(e) => set({ runDelay: Number(e.target.value) || 0 })}
            className="w-20 rounded-md border border-(--border) bg-(--background) px-2 py-1 text-sm text-(--foreground) outline-none focus:border-(--primary)"
          />
        </div>

        <div className="my-2 border-t border-(--border)" />

        <Toggle label="Word wrap" checked={settings.wordWrap} onChange={(v) => set({ wordWrap: v })} />
        <Toggle label="Minimap" checked={settings.minimap} onChange={(v) => set({ minimap: v })} />
        <Toggle label="Auto-run on edit" checked={settings.autoRun} onChange={(v) => set({ autoRun: v })} />
        <Toggle label="Auto-save to browser" checked={settings.autoSave} onChange={(v) => set({ autoSave: v })} />
      </div>
    </Modal>
  );
}
