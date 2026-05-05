import { AlertCircle } from "lucide-react";

/* ── UI primitives ── */
export function Field({ label, hint, error, icon, required, children }) {
    return (
        <div className="space-y-2.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                {icon && <span className="text-gray-400">{icon}</span>}{label}
                {required && <span className="text-red-400">*</span>}
            </label>
            {children}
            {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
            {error && <p className="flex items-center gap-1 text-xs text-red-500 font-medium"><AlertCircle className="w-3 h-3 shrink-0" />{error}</p>}
        </div>
    );
}


