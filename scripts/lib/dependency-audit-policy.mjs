const severityRank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function evaluateDependencyAudit({
  auditResult,
  report,
  vulnerabilities,
}) {
  const executionIssues = [];

  if (auditResult?.error) {
    executionIssues.push(
      auditResult.error.message || String(auditResult.error),
    );
  }
  if (auditResult?.signal) {
    executionIssues.push(
      `npm audit terminated with signal ${auditResult.signal}`,
    );
  }
  if (![0, 1].includes(auditResult?.status)) {
    executionIssues.push(
      `npm audit returned unexpected status ${String(auditResult?.status)}`,
    );
  }
  if (!isRecord(report) || !isRecord(report.vulnerabilities)) {
    executionIssues.push("npm audit returned a malformed vulnerability report");
  }
  if (report?.error) {
    executionIssues.push(
      report.error.summary ||
        report.error.message ||
        "npm audit reported an error",
    );
  }

  const blockers = Object.entries(
    isRecord(vulnerabilities) ? vulnerabilities : {},
  ).filter(
    ([, finding]) =>
      (severityRank[finding?.severity] || 0) >= severityRank.high,
  );

  return {
    blockers,
    executionIssues,
    ok: blockers.length === 0 && executionIssues.length === 0,
  };
}
