import { NextResponse } from "next/server";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { getAdminDb, getFirebaseAdminConfigStatus } from "@/lib/firebaseAdmin";
import { createFirebaseLiveDataReport } from "@altftool/core/firebaseLiveData";
import { createVercelDeployReadinessReport } from "@altftool/core/deployReadiness";
import healthManifest from "@/data/healthManifest.json";

export const dynamic = "force-dynamic";

function clampScore(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeUrl(value = "") {
  return String(value || "").trim().replace(/\/+$/, "");
}

function appendPath(baseUrl, suffix) {
  if (!baseUrl) return "";
  return `${baseUrl}${suffix.startsWith("/") ? suffix : `/${suffix}`}`;
}

function currentCommitSha() {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    null
  );
}

async function buildFirebaseAdminReadiness() {
  const config = getFirebaseAdminConfigStatus();
  const checks = [
    {
      key: "projectId",
      label: "Project ID",
      detail: config.projectId || "FIREBASE_PROJECT_ID is not configured.",
      ok: !config.missing.includes("FIREBASE_PROJECT_ID"),
    },
    {
      key: "clientEmail",
      label: "Service-account email",
      detail: config.clientEmailConfigured
        ? "Service-account email is configured."
        : "FIREBASE_CLIENT_EMAIL is not configured.",
      ok:
        config.clientEmailConfigured &&
        !config.invalid.some((message) => message.includes("FIREBASE_CLIENT_EMAIL")),
    },
    {
      key: "privateKey",
      label: "Private key",
      detail: config.privateKeyConfigured
        ? "Private key is configured and never returned by this endpoint."
        : "FIREBASE_PRIVATE_KEY is not configured.",
      ok:
        config.privateKeyConfigured &&
        config.privateKeyLooksComplete &&
        !config.invalid.some((message) => message.includes("FIREBASE_PRIVATE_KEY")),
    },
  ];
  const firestoreProbe = {
    key: "firestoreRead",
    label: "Firestore Admin SDK read",
    detail: config.ok ? "Reading admins collection." : "Skipped until Admin SDK credentials are ready.",
    ok: false,
    skipped: !config.ok,
  };

  if (config.ok) {
    try {
      await getAdminDb().collection("admins").limit(1).get();
      firestoreProbe.ok = true;
      firestoreProbe.skipped = false;
      firestoreProbe.detail = "Admin SDK can read Firestore.";
    } catch (error) {
      firestoreProbe.error = error?.message || "Firestore read failed.";
      firestoreProbe.detail = firestoreProbe.error;
      firestoreProbe.skipped = false;
    }
  }

  const allChecks = [...checks, firestoreProbe];
  const score = clampScore((allChecks.filter((check) => check.ok).length / allChecks.length) * 100);

  return {
    score,
    status: config.ok && firestoreProbe.ok ? "ready" : config.ok ? "read-failed" : "needs-config",
    projectId: config.projectId,
    adminSdkReady: config.ok,
    firestoreReadable: firestoreProbe.ok,
    missing: config.missing,
    invalid: config.invalid,
    checks: allChecks,
  };
}

async function buildFirebaseLiveDataReadiness() {
  try {
    const report = await createFirebaseLiveDataReport({
      env: process.env,
      timeoutMs: 4500,
    });

    return {
      ...report,
      passingChecks: report.checks.filter((check) => check.ok).length,
      totalChecks: report.checks.length,
    };
  } catch (error) {
    const message = error?.name === "AbortError" ? "Timed out." : error?.message || "Firebase live data check failed.";

    return {
      generatedAt: new Date().toISOString(),
      ok: false,
      status: "unavailable",
      score: 0,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36",
      checks: [
        {
          key: "firebaseLiveData",
          label: "Firebase live data",
          detail: message,
          error: message,
          ok: false,
        },
      ],
      sections: {},
      failures: [message],
      passingChecks: 0,
      totalChecks: 1,
    };
  }
}

function buildVercelDeployReadiness() {
  const report = createVercelDeployReadinessReport({
    env: process.env,
  });
  const totals = report.results.reduce(
    (summary, result) => {
      summary.present += result.present.length;
      summary.missing += result.missing.length;
      return summary;
    },
    { present: 0, missing: 0 },
  );
  const total = totals.present + totals.missing;

  return {
    ...report,
    score: clampScore(total ? (totals.present / total) * 100 : 0),
    missingSecrets: report.results.flatMap((result) =>
      result.missing.map((item) => ({
        target: result.name,
        label: item.label,
        names: item.names,
        displayName: item.displayName,
      })),
    ),
  };
}

async function fetchJsonWithTimeout(url, timeoutMs = 3500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const startedAt = performance.now();
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });
    const text = await response.text();
    let payload;

    try {
      payload = JSON.parse(text);
    } catch {
      const contentType = response.headers.get("content-type") || "unknown content type";
      throw new Error(`Health endpoint returned non-JSON (${response.status}, ${contentType}).`);
    }

    return {
      response,
      payload,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function buildProductionFreshness() {
  const webUrl = normalizeUrl(
    process.env.ALTFT_MONITOR_WEB_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://altftool.com",
  );
  const healthUrl = appendPath(webUrl, "/api/health");
  const expectedCommit = currentCommitSha();

  if (!webUrl) {
    return {
      score: 0,
      status: "not-configured",
      url: null,
      healthUrl: null,
      expectedCommit,
      productionCommit: null,
      checks: [
        {
          key: "webUrl",
          label: "Production web URL",
          detail: "ALTFT_MONITOR_WEB_URL or NEXT_PUBLIC_SITE_URL",
          ok: false,
        },
      ],
    };
  }

  const checks = [
    {
      key: "webUrl",
      label: "Production web URL",
      detail: webUrl,
      ok: true,
    },
  ];

  try {
    const { response, payload, durationMs } = await fetchJsonWithTimeout(healthUrl);
    const productionCommit = payload?.release?.commitSha || null;
    const commitMatches = !expectedCommit || !productionCommit || expectedCommit === productionCommit;
    const healthOk = response.ok && ["healthy", "watch"].includes(payload?.overall?.status);

    checks.push(
      {
        key: "healthEndpoint",
        label: "Public health endpoint",
        detail: `${response.status} in ${durationMs}ms`,
        ok: response.ok,
      },
      {
        key: "publicHealth",
        label: "Public web health",
        detail: payload?.overall?.label || payload?.overall?.status || "Unknown",
        ok: healthOk,
      },
      {
        key: "commitFreshness",
        label: "Deployment freshness",
        detail: productionCommit
          ? `production ${productionCommit.slice(0, 8)}${expectedCommit ? `, expected ${expectedCommit.slice(0, 8)}` : ""}`
          : "Production commit is not exposed yet.",
        ok: commitMatches && Boolean(productionCommit || !expectedCommit),
      },
    );

    const score = clampScore((checks.filter((check) => check.ok).length / checks.length) * 100);

    return {
      score,
      status: score >= 90 ? "fresh" : score >= 60 ? "watch" : "stale",
      url: webUrl,
      healthUrl,
      expectedCommit,
      productionCommit,
      durationMs,
      publicHealth: payload?.overall || null,
      checks,
    };
  } catch (error) {
    checks.push({
      key: "healthEndpoint",
      label: "Public health endpoint",
      detail: healthUrl,
      ok: false,
      error: error?.name === "AbortError" ? "Timed out." : error?.message || "Request failed.",
    });

    return {
      score: clampScore((checks.filter((check) => check.ok).length / checks.length) * 100),
      status: "stale-or-unavailable",
      url: webUrl,
      healthUrl,
      expectedCommit,
      productionCommit: null,
      checks,
      error: error?.name === "AbortError" ? "Timed out." : error?.message || "Production health check failed.",
    };
  }
}

function buildRecommendations({
  tools,
  qa,
  seo,
  content,
  automation,
  firebaseAdmin,
  firebaseLiveData,
  deploy,
  production,
}) {
  const recommendations = [];

  if (tools.missingEntry || tools.missingConfig) {
    recommendations.push(
      `Fix ${tools.missingEntry} missing entry files and ${tools.missingConfig} missing config files before adding more tools.`,
    );
  }

  if (tools.orphanToolDirs.length) {
    recommendations.push(
      `${tools.orphanToolDirs.length} tool folders are not registered. Add them to the registry or archive them.`,
    );
  }

  if (tools.registryWithoutDir.length) {
    recommendations.push(
      `${tools.registryWithoutDir.length} registered tools do not have source folders.`,
    );
  }

  if (seo.score < 100) {
    recommendations.push("Complete sitemap, robots, metadata, and JSON-LD coverage for crawl readiness.");
  }

  if (qa.score < 100) {
    recommendations.push(
      `Keep the top ${qa.total} tool route QA pack green before shipping public tool updates.`,
    );
  }

  if (content.score < 100) {
    recommendations.push("Refresh fallback content data so blogs, stores, deals, and news all stay populated.");
  }

  if (automation.score < 100) {
    recommendations.push("Keep smoke and route audits wired into full validation before every release.");
  }

  if (firebaseAdmin.score < 100) {
    recommendations.push("Configure Firebase Admin service-account env vars before testing admin write actions in production.");
  }

  if (firebaseLiveData.score < 100) {
    recommendations.push("Fix Firebase live-data reads so public content modules keep loading real Firestore data.");
  }

  if (deploy.score < 100) {
    recommendations.push("Add the missing Vercel deploy secrets so web and admin production deployments can run from CI.");
  }

  if (production.score < 100) {
    recommendations.push("Deploy the latest public web build, then confirm the production /api/health endpoint reports a fresh commit.");
  }

  if (!recommendations.length) {
    recommendations.push("System health is clean. Keep using validate:full before release pushes.");
  }

  return recommendations;
}

export async function GET(request) {
  try {
    await verifySuperAdminRequest(request);

    const { tools, qa, seo, content, automation } = healthManifest;
    const [firebaseAdmin, firebaseLiveData, production] = await Promise.all([
      buildFirebaseAdminReadiness(),
      buildFirebaseLiveDataReadiness(),
      buildProductionFreshness(),
    ]);
    const deploy = buildVercelDeployReadiness();

    const overallScore = clampScore(
      tools.averageScore * 0.22 +
        qa.score * 0.14 +
        seo.score * 0.08 +
        content.score * 0.08 +
        automation.score * 0.08 +
        firebaseAdmin.score * 0.1 +
        firebaseLiveData.score * 0.1 +
        deploy.score * 0.1 +
        production.score * 0.1,
    );
    const status = overallScore >= 90 ? "healthy" : overallScore >= 75 ? "watch" : "attention";

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      manifest: {
        schemaVersion: healthManifest.schemaVersion,
        generatedAt: healthManifest.generatedAt,
      },
      overall: {
        score: overallScore,
        status,
        label:
          status === "healthy"
            ? "Release ready"
            : status === "watch"
              ? "Needs review"
              : "Needs attention",
      },
      tools,
      qa,
      seo,
      content,
      automation,
      firebaseAdmin,
      firebaseLiveData,
      deploy,
      production,
      recommendations: buildRecommendations({
        tools,
        qa,
        seo,
        content,
        automation,
        firebaseAdmin,
        firebaseLiveData,
        deploy,
        production,
      }),
    });
  } catch (error) {
    const message = error?.message || "Health audit failed.";
    const status = message === "Unauthorized" ? 401 : 500;
    console.error("Health audit failed:", error);

    return NextResponse.json({ error: message }, { status });
  }
}
