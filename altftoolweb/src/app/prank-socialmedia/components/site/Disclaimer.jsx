import { ShieldAlert } from "lucide-react";
function Disclaimer() {
  return <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        This tool is for <strong>parody, entertainment, and educational mockup</strong> purposes only.
        Misuse for fraud, misinformation, or impersonation is strictly prohibited.
      </p>
    </div>;
}
export {
  Disclaimer
};
