import assert from "node:assert/strict";
import test from "node:test";
import {
  buildParityReport,
  renderParityMarkdown,
} from "../scripts/check-live-deploy-parity.mjs";

function localSnapshot() {
  return {
    healthManifest: {
      generatedAt: "2026-05-20T00:00:00.000Z",
      tools: {
        total: 231,
      },
      qa: {
        total: 40,
        registered: 40,
      },
    },
    routeQa: {
      checkedAt: "2026-05-20T00:10:00.000Z",
      ok: true,
      score: 100,
      totals: {
        routes: 162,
      },
    },
    blogContent: {
      generatedAt: "2026-05-20T00:20:00.000Z",
      ok: true,
      score: 100,
      totals: {
        total: 31,
        ready: 31,
      },
    },
  };
}

function liveSnapshot(overrides = {}) {
  return {
    webUrl: "https://altftool.com",
    fetchedAt: "2026-05-20T01:00:00.000Z",
    health: {
      status: 200,
      payload: {
        service: "altftool-web",
        overall: {
          score: 100,
          status: "healthy",
        },
        release: {
          commitSha: "abcdef1234567890",
        },
        tools: {
          total: 231,
          priorityRegistered: 40,
        },
        content: {
          localBlogs: 31,
        },
        firebase: {
          score: 100,
          liveBlogs: 1,
        },
      },
    },
    sitemap: {
      status: 200,
      locCount: 300,
      hasUrlSet: true,
      hasPriorityTool: true,
      hasPriorityBlog: true,
    },
    rss: {
      status: 200,
      hasRss: true,
      itemCount: 31,
    },
    blogs: {
      status: 200,
      posts: 100,
      source: "live-or-unspecified",
      firstSlug: "example",
    },
    ...overrides,
  };
}

test("production parity report passes when live signals match local release expectations", async () => {
  const report = await buildParityReport({
    localSnapshot: localSnapshot(),
    liveSnapshot: liveSnapshot(),
    expectedCommit: "abcdef1234567890",
    dirtyFiles: [],
    strict: true,
    requireCommit: true,
  });

  assert.equal(report.status, "ready");
  assert.equal(report.counts.block, 0);
  assert.equal(report.counts.warn, 0);
  assert.equal(report.local.tools, 231);
  assert.equal(report.live.sitemapLocs, 300);
  assert.ok(report.checks.every((check) => check.status === "pass"));
});

test("production parity strict mode blocks stale live commits", async () => {
  const report = await buildParityReport({
    localSnapshot: localSnapshot(),
    liveSnapshot: liveSnapshot(),
    expectedCommit: "fedcba9876543210",
    dirtyFiles: [],
    strict: true,
    requireCommit: true,
  });
  const commitCheck = report.checks.find((check) => check.key === "release-commit");

  assert.equal(report.status, "blocked");
  assert.equal(commitCheck?.status, "block");
  assert.match(commitCheck?.detail || "", /does not match expected/);
});

test("production parity markdown summarizes checks without secrets", async () => {
  const report = await buildParityReport({
    localSnapshot: localSnapshot(),
    liveSnapshot: liveSnapshot({
      sitemap: {
        status: 200,
        locCount: 10,
        hasUrlSet: true,
        hasPriorityTool: false,
        hasPriorityBlog: true,
      },
    }),
    expectedCommit: "abcdef1234567890",
    dirtyFiles: [],
    strict: false,
    requireCommit: true,
  });
  const markdown = renderParityMarkdown(report);

  assert.match(markdown, /## AltFTool Production Parity/);
  assert.match(markdown, /\| Check \| Status \| Score \| Detail \| Next action \|/);
  assert.match(markdown, /Sitemap parity/);
  assert.match(markdown, /Attention Needed/);
  assert.doesNotMatch(markdown, /PRIVATE KEY-----/);
  assert.doesNotMatch(markdown, /vcp_[A-Za-z0-9]/);
});
