import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateDependencyAudit } from "../scripts/lib/dependency-audit-policy.mjs";

function auditReport(vulnerabilities = {}) {
  return { auditReportVersion: 2, vulnerabilities };
}

describe("dependency audit policy", () => {
  it("passes status 1 after every accepted high finding is filtered", () => {
    const report = auditReport({
      "react-router": { severity: "high" },
      "react-router-dom": { severity: "high" },
    });
    const result = evaluateDependencyAudit({
      auditResult: { status: 1, signal: null },
      report,
      vulnerabilities: {},
    });

    assert.equal(result.ok, true);
    assert.deepEqual(result.blockers, []);
  });

  it("fails when an unaccepted high or critical finding remains", () => {
    const report = auditReport({ unknown: { severity: "critical" } });
    const result = evaluateDependencyAudit({
      auditResult: { status: 1, signal: null },
      report,
      vulnerabilities: report.vulnerabilities,
    });

    assert.equal(result.ok, false);
    assert.deepEqual(
      result.blockers.map(([name]) => name),
      ["unknown"],
    );
  });

  it("fails npm audit errors even when no blocker was parsed", () => {
    const report = {
      error: { summary: "registry unavailable" },
      vulnerabilities: {},
    };
    const result = evaluateDependencyAudit({
      auditResult: { status: 1, signal: null },
      report,
      vulnerabilities: {},
    });

    assert.equal(result.ok, false);
    assert.match(result.executionIssues.join(" "), /registry unavailable/);
  });

  it("fails malformed reports and unexpected process failures", () => {
    const result = evaluateDependencyAudit({
      auditResult: { status: 2, signal: null },
      report: {},
      vulnerabilities: {},
    });

    assert.equal(result.ok, false);
    assert.match(result.executionIssues.join(" "), /unexpected status 2/);
    assert.match(result.executionIssues.join(" "), /malformed/);
  });
});
