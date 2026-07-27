"use client";

import { Eye, Pencil, Trash2, AlertTriangle, CheckSquare, Square } from "lucide-react";

const ACTIONS = [
  {
    key: "read",
    label: "Read",
    desc: "View data and lists",
    icon: <Eye className="w-3.5 h-3.5" />,
    checked: "bg-[var(--primary-soft)] border-[var(--primary)]/40 text-[var(--primary)]",
    unchecked: "hover:bg-[var(--surface-soft)]",
  },
  {
    key: "write",
    label: "Write",
    desc: "Create or update items",
    icon: <Pencil className="w-3.5 h-3.5" />,
    checked: "bg-[var(--primary-soft)] border-[var(--primary)]/40 text-[var(--primary)]",
    unchecked: "hover:bg-[var(--surface-soft)]",
  },
  {
    key: "delete",
    label: "Delete",
    desc: "Permanently remove items",
    icon: <Trash2 className="w-3.5 h-3.5" />,
    danger: true,
    checked: "bg-[var(--danger-soft)] border-[var(--danger)]/40 text-[var(--danger)]",
    unchecked: "hover:bg-[var(--danger-soft)]/50",
  },
];

// modules:        { [moduleKey]: string (label) }
// permissions:    { [moduleKey]: { read, write, delete } }
// setPermissions: (newPermissionsObject) => void   ← plain object, NOT an updater fn
export default function PermissionMatrix({ modules = {}, permissions = {}, setPermissions }) {
  // Called with the full new permissions object — never uses updater pattern
  const toggle = (module, action) => {
    setPermissions({
      ...permissions,
      [module]: {
        ...permissions[module],
        [action]: !permissions[module]?.[action],
      },
    });
  };

  const setAll = (module, value) => {
    setPermissions({
      ...permissions,
      [module]: { read: value, write: value, delete: value },
    });
  };

  const grantAll = () => {
    const all = {};
    Object.keys(modules).forEach((key) => {
      all[key] = { read: true, write: true, delete: true };
    });
    setPermissions(all);
  };

  const clearAll = () => setPermissions({});

  const moduleKeys = Object.keys(modules);

  if (!moduleKeys.length) {
    return <p className="text-xs text-[var(--muted)] italic py-2">No modules defined for this project.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between py-1">
        <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
          {moduleKeys.length} module{moduleKeys.length !== 1 ? "s" : ""}
        </span>
        <div className="flex gap-1.5">
          <button type="button" onClick={grantAll}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-soft)] transition">
            <CheckSquare className="w-3 h-3" />Grant All
          </button>
          <button type="button" onClick={clearAll}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-soft)] transition">
            <Square className="w-3 h-3" />Clear All
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {moduleKeys.map((key) => {
          const label = modules[key];
          const p = permissions?.[key] || {};
          const allEnabled = !!(p.read && p.write && p.delete);
          const someEnabled = !!(p.read || p.write || p.delete);

          return (
            <div key={key} className={`rounded-xl border transition-all ${
              p.delete ? "border-[var(--danger)]/30 bg-[var(--danger-soft)]/20" : someEnabled ? "border-[var(--primary)]/20 bg-[var(--primary-soft)]/10" : "border-[var(--border)] bg-[var(--surface)]"
            }`}>
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    aria-label={`Toggle all permissions for ${label}`}
                    checked={allEnabled}
                    ref={(el) => { if (el) el.indeterminate = someEnabled && !allEnabled; }}
                    onChange={() => setAll(key, !allEnabled)}
                    className="w-3.5 h-3.5 accent-[var(--primary)] cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-[var(--foreground)]">{label}</span>
                  {p.delete && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-[var(--danger)] bg-[var(--danger-soft)] px-1.5 py-0.5 rounded">
                      <AlertTriangle className="w-2.5 h-2.5" />DELETE
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setAll(key, true)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-soft)] transition">All</button>
                  <button type="button" onClick={() => setAll(key, false)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-soft)] transition">None</button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 px-4 pb-3">
                {ACTIONS.map(({ key: action, label, desc, icon, danger, checked, unchecked }) => {
                  const isChecked = !!p[action];
                  return (
                    <label key={action}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition select-none ${
                        isChecked ? checked : `border-[var(--border)] ${unchecked}`
                      }`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(key, action)}
                        className={`w-3.5 h-3.5 cursor-pointer ${danger ? "accent-[var(--danger)]" : "accent-[var(--primary)]"}`}
                      />
                      <div className="min-w-0">
                        <div className={`flex items-center gap-1 text-xs font-bold ${isChecked ? (danger ? "text-[var(--danger)]" : "text-[var(--foreground)]") : "text-[var(--muted)]"}`}>
                          <span className={isChecked ? "" : "text-[var(--border-strong)]"}>{icon}</span>
                          {label}
                        </div>
                        <div className="text-[10px] text-[var(--muted)] leading-tight mt-0.5 truncate">{desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {p.delete && (
                <div className="mx-4 mb-3 flex items-center gap-1.5 text-xs text-[var(--danger)] bg-[var(--danger-soft)] border border-[var(--danger)]/30 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Delete permission grants irreversible access to this module.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}