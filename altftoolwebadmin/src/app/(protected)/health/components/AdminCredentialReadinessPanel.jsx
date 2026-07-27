import { KeyRound, TerminalSquare } from "lucide-react";
import { StatusBadge } from "./HealthShared";

function getAdminCredentialIssueText(firebaseAdmin) {
  const missing = firebaseAdmin?.missing || [];
  const invalid = firebaseAdmin?.invalid || [];
  const issues = [];

  if (missing.length) {
    issues.push(`Missing ${missing.join(", ")}`);
  }
  if (invalid.length) {
    issues.push(...invalid);
  }

  return issues;
}

export default function AdminCredentialReadinessPanel({ firebaseAdmin }) {
  const isReady = firebaseAdmin?.adminSdkReady && firebaseAdmin?.firestoreReadable;
  const issues = getAdminCredentialIssueText(firebaseAdmin);
  const setupSteps = [
    "Create or select a Firebase service account for the altftool-bca36 project.",
    "Add either FIREBASE_SERVICE_ACCOUNT JSON or the three split env vars in altftoolwebadmin/.env.local.",
    "Keep the private key as the full PEM value with escaped newlines when it is stored in one line.",
    "Run the dry-run check first, then the live write check before release.",
  ];

  return (
    <section
      className={`border p-5 shadow-sm rounded-md ${
        isReady ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
      } xl:col-span-3`}
      id="admin-credential-readiness-panel"
      data-testid="admin-credential-readiness-panel"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          {/*
            The raw --success/--warning tokens are tuned as accents, not as tile
            fills behind --anslation-ds-status-foreground: in light theme that
            foreground is #ffffff, and white on #f59e0b is only ~2.1:1. Mixing
            the token 65% with black keeps the fill theme-aware while restoring
            AA in BOTH themes — warning 4.8:1 light / 4.9:1 dark, success 6.7:1
            light / 4.7:1 dark against the per-theme status foreground.
          */}
          <div
            className={`grid h-9 w-9 place-items-center rounded-md ${
              isReady
                ? "bg-[color-mix(in_srgb,var(--success)_65%,black)]"
                : "bg-[color-mix(in_srgb,var(--warning)_65%,black)]"
            } text-[var(--anslation-ds-status-foreground)]`}
          >
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${isReady ? "text-emerald-700" : "text-amber-700"}`}>
              Admin write access
            </p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">
              {isReady ? "Firebase Admin writes are ready" : "Firebase Admin writes need credentials"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
              Public Firebase reads can work while Admin SDK writes stay disabled. Admin mutations need a complete
              service-account email and full private key before live write checks can pass.
            </p>
          </div>
        </div>
        <StatusBadge ok={isReady} label={isReady ? "Write ready" : "Write blocked"} />
      </div>

      {issues.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {issues.map((issue) => (
            <span
              key={issue}
              className="max-w-full break-words rounded border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-amber-800"
            >
              {issue}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
        <div className="border border-white/70 bg-white/80 p-3 rounded-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Setup path</p>
          <ol className="mt-3 space-y-2">
            {setupSteps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6 text-gray-700">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-gray-950 text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="border border-white/70 bg-white/80 p-3 rounded-md">
          <div className="flex items-center gap-2">
            <TerminalSquare className="h-4 w-4 text-gray-700" />
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Verification commands</p>
          </div>
          <div className="mt-3 space-y-2">
            {[
              "npm run env:readiness",
              "npm run firebase:admin-write-check:dry-run",
              "npm run firebase:admin-write-check",
            ].map((command) => (
              <code
                key={command}
                className="block overflow-x-auto rounded border border-gray-200 bg-gray-950 px-3 py-2 font-mono text-xs font-semibold text-white"
              >
                {command}
              </code>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-gray-600">
            Full env examples live in docs/DEVELOPER_GUIDE.md under Firebase Admin credential setup.
          </p>
        </div>
      </div>
    </section>
  );
}
