import { AlertTriangle, CheckCircle2, Rocket, XCircle } from "lucide-react";
import { ScoreBar } from "./HealthShared";

export default function DeployReadinessPanel({ deploy }) {
  const results = deploy?.results || [];
  const missingSecrets = deploy?.missingSecrets || [];
  const isLinkedNeedsToken = deploy?.status === "linked-needs-token";
  const uniqueMissingSecrets = Array.from(
    new Map(missingSecrets.map((secret) => [secret.displayName, secret])).values(),
  );

  return (
    <section id="deploy-readiness-panel" className="border border-gray-200 bg-white p-5 shadow-sm rounded-md" data-testid="deploy-readiness-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gray-950 text-white">
            <Rocket className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Deployment</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Vercel Deploy Readiness</h2>
          </div>
        </div>
        <span
          className={`inline-flex rounded border px-2 py-1 text-xs font-bold ${
            deploy?.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : isLinkedNeedsToken
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {deploy?.ok ? "Ready" : isLinkedNeedsToken ? "Token needed" : "Blocked"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {results.map((result) => {
          const missingOnlyToken =
            result.missing.length > 0 &&
            result.missing.every((item) => (item.names || []).some((name) => name === "VERCEL_TOKEN" || name === "VERCEL_TOKEN_FILE"));
          const resultLinkedNeedsToken = Boolean(result.projectLink && missingOnlyToken);

          return (
            <div
              key={result.name}
              className={`border p-3 rounded-md ${
                result.ok
                  ? "border-emerald-100 bg-emerald-50"
                  : resultLinkedNeedsToken
                    ? "border-amber-100 bg-amber-50"
                    : "border-gray-100 bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-950">{result.label}</p>
                  <p className="mt-1 break-words font-mono text-xs text-gray-500">{result.projectRoot}</p>
                  {result.projectLink?.projectName ? (
                    <p className="mt-1 break-words text-xs font-semibold text-gray-600">
                      Linked project: {result.projectLink.projectName}
                    </p>
                  ) : null}
                </div>
                {result.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : resultLinkedNeedsToken ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(result.missing.length ? result.missing : result.present).map((item) => (
                  <span
                    key={`${result.name}-${item.displayName}`}
                    className={`rounded border px-2 py-1 text-[11px] font-bold ${
                      result.missing.length && !resultLinkedNeedsToken
                        ? "border-rose-200 bg-white text-rose-700"
                        : resultLinkedNeedsToken
                          ? "border-amber-200 bg-white text-amber-800"
                          : "border-emerald-200 bg-white text-emerald-700"
                    }`}
                  >
                    {result.missing.length ? item.displayName : item.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {uniqueMissingSecrets.length > 0 ? (
        <div
          className={`mt-4 border p-3 rounded-md ${
            isLinkedNeedsToken ? "border-amber-100 bg-amber-50" : "border-rose-100 bg-rose-50"
          }`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${
              isLinkedNeedsToken ? "text-amber-700" : "text-rose-700"
            }`}
          >
            {isLinkedNeedsToken ? "Secure deploy token needed" : "Missing GitHub Actions Secrets"}
          </p>
          {isLinkedNeedsToken ? (
            <p className="mt-2 text-sm leading-6 text-amber-800">
              Web and admin projects are linked locally. Add the token only in a secure CI or deploy environment.
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            {uniqueMissingSecrets.map((secret) => (
              <span
                key={secret.displayName}
                className={`max-w-full break-all rounded border bg-white px-2.5 py-1 font-mono text-xs font-bold ${
                  isLinkedNeedsToken ? "border-amber-200 text-amber-800" : "border-rose-200 text-rose-700"
                }`}
              >
                {secret.displayName}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 rounded-md">
          Web and admin deploy secrets are available to CI.
        </div>
      )}

      <ScoreBar score={deploy?.score || 0} />
    </section>
  );
}
