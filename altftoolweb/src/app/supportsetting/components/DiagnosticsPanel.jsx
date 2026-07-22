"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Wrench } from "lucide-react";
import { Button, SectionHeader } from "@altftool/ui";

/**
 * Runs real, in-browser checks — no fabricated system stats. Each check is
 * something this website can genuinely observe about the current browser
 * session.
 */
function runDiagnostics() {
  const results = [];

  try {
    window.localStorage.setItem("__altf_diag_test", "1");
    window.localStorage.removeItem("__altf_diag_test");
    results.push({ label: "Local storage available", pass: true });
  } catch {
    results.push({ label: "Local storage available", pass: false });
  }

  results.push({ label: "Cookies enabled", pass: navigator.cookieEnabled });
  results.push({ label: "Currently online", pass: navigator.onLine });

  const nav = performance.getEntriesByType?.("navigation")?.[0];
  const loadMs = nav ? Math.round(nav.loadEventEnd - nav.startTime) : null;
  results.push({
    label: loadMs != null ? `Page loaded in ${loadMs}ms` : "Page load timing unavailable",
    pass: loadMs == null ? null : loadMs < 5000,
  });

  results.push({
    label: "JavaScript running normally",
    pass: true,
  });

  return results;
}

const DiagnosticsPanel = () => {
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    setRunning(true);
    setResults(null);
    window.setTimeout(() => {
      setResults(runDiagnostics());
      setRunning(false);
    }, 600);
  };

  return (
    <section className="support-utility-section" aria-label="Diagnostic tools">
      <SectionHeader
        title="Diagnostic Tools"
        description="Run a quick, real check of your current browser session."
        actions={
          <Button variant="secondary" size="sm" loading={running} onClick={handleRun}>
            <Wrench className="h-4 w-4" />
            Run diagnostics
          </Button>
        }
      />

      {results && (
        <ul className="support-diagnostics-list">
          {results.map((result, i) => (
            <li key={i} className="support-diagnostics-item">
              {result.pass === false ? (
                <XCircle className="h-4 w-4 support-diagnostics-fail" />
              ) : (
                <CheckCircle2 className="h-4 w-4 support-diagnostics-pass" />
              )}
              {result.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default DiagnosticsPanel;
