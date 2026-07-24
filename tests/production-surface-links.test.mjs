import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import {
  buildProductionSurfaceLinkReport,
  renderProductionSurfaceLinkMarkdown,
} from "../scripts/check-production-surface-links.mjs";

function htmlPage({ title = "AltFTool Test Page", canonical = "/", body = "", description = "A complete test page for AltFTool production surface checks.", og = true } = {}) {
  return `<!doctype html>
    <html>
      <head>
        <title>${title}</title>
        <meta name="description" content="${description}">
        ${canonical ? `<link rel="canonical" href="${canonical}">` : ""}
        ${og ? `
          <meta property="og:title" content="${title}">
          <meta property="og:description" content="${description}">
          <meta property="og:url" content="${canonical || "/"}">
        ` : ""}
      </head>
      <body>${body}</body>
    </html>`;
}

async function withServer(routes, run) {
  const server = createServer((request, response) => {
    const route = routes[request.url] || routes[new URL(request.url, "http://localhost").pathname];

    if (!route) {
      response.writeHead(404, { "content-type": "text/plain" });
      response.end("missing");
      return;
    }

    const status = route.status || 200;
    const headers = route.headers || { "content-type": "text/html; charset=utf-8" };
    response.writeHead(status, headers);
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    response.end(route.body || "");
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const { port } = server.address();
    return await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("production surface link report catches broken internal links and images", async () => {
  await withServer(
    {
      "/sitemap.xml": {
        headers: { "content-type": "application/xml" },
        body: "<?xml version=\"1.0\"?><urlset></urlset>",
      },
      "/": {
        body: htmlPage({
          canonical: "/",
          body: `
            <h1>Home</h1>
            <a href="/ok">Good link</a>
            <a href="/missing">Broken link</a>
            <img src="/image.png" alt="Good">
          `,
        }),
      },
      "/tools/all": {
        body: htmlPage({
          canonical: "",
          og: false,
          body: `
            <h1>Tools</h1>
            <a href="/ok">Good link</a>
            <img src="/missing-image.png" alt="Broken">
          `,
        }),
      },
      "/ok": {
        body: htmlPage({
          canonical: "/ok",
          body: "<h1>OK</h1>",
        }),
      },
      "/image.png": {
        headers: { "content-type": "image/png" },
        body: "png",
      },
      "/missing": {
        status: 404,
        headers: { "content-type": "text/plain" },
        body: "missing",
      },
      "/missing-image.png": {
        status: 404,
        headers: { "content-type": "text/plain" },
        body: "missing",
      },
    },
    async (baseUrl) => {
      const report = await buildProductionSurfaceLinkReport({
        baseUrl,
        criticalPaths: ["/", "/tools/all"],
        limit: 2,
        linkLimitPerPage: 10,
        imageLimitPerPage: 10,
        timeoutMs: 1000,
      });

      assert.equal(report.ok, false);
      assert.equal(report.totals.pages, 2);
      assert.ok(report.failures.some((failure) => failure.targetUrl?.endsWith("/missing")));
      assert.ok(report.failures.some((failure) => failure.targetUrl?.endsWith("/missing-image.png")));
      assert.ok(report.warnings.some((warning) => /canonical/.test(warning.message)));
    },
  );
});

test("production surface link report passes clean pages and renders Markdown", async () => {
  await withServer(
    {
      "/sitemap.xml": {
        headers: { "content-type": "application/xml" },
        body: "",
      },
      "/": {
        body: htmlPage({
          canonical: "/",
          body: `
            <h1>Home</h1>
            <a href="/ok">Good link</a>
            <img src="/image.png" alt="Good">
          `,
        }),
      },
      "/ok": {
        body: htmlPage({
          canonical: "/ok",
          body: "<h1>OK</h1>",
        }),
      },
      "/image.png": {
        headers: { "content-type": "image/png" },
        body: "png",
      },
    },
    async (baseUrl) => {
      const report = await buildProductionSurfaceLinkReport({
        baseUrl,
        criticalPaths: ["/"],
        limit: 1,
        linkLimitPerPage: 10,
        imageLimitPerPage: 10,
        timeoutMs: 1000,
      });
      const markdown = renderProductionSurfaceLinkMarkdown(report);

      assert.equal(report.ok, true);
      assert.equal(report.totals.failures, 0);
      assert.match(markdown, /Production Surface Link Report/);
      assert.doesNotMatch(JSON.stringify(report), /PRIVATE KEY-----/);
      assert.doesNotMatch(markdown, /PRIVATE KEY-----/);
    },
  );
});

test("production surface link report accepts www and apex canonical aliases", async () => {
  const baseUrl = "https://altftool.com";
  const page = htmlPage({
    canonical: "https://www.altftool.com/",
    body: "<h1>Home</h1>",
  });
  const fetchImpl = async (input) => {
    const url = new URL(input);
    const body = url.pathname === "/sitemap.xml"
      ? "<?xml version=\"1.0\"?><urlset></urlset>"
      : page;
    const contentType = url.pathname === "/sitemap.xml"
      ? "application/xml"
      : "text/html; charset=utf-8";

    return new Response(body, {
      status: 200,
      headers: { "content-type": contentType },
    });
  };

  const report = await buildProductionSurfaceLinkReport({
    baseUrl,
    criticalPaths: ["/"],
    fetchImpl,
    limit: 1,
    strict: true,
  });

  assert.equal(report.ok, true);
  assert.equal(report.totals.warnings, 0);
});

test("production surface link report retries one transient timeout", async () => {
  const baseUrl = "https://www.altftool.com";
  let slowAttempts = 0;
  const fetchImpl = async (input) => {
    const url = new URL(input);

    if (url.pathname === "/slow" && slowAttempts++ === 0) {
      throw new DOMException("Timed out", "AbortError");
    }

    const body = url.pathname === "/sitemap.xml"
      ? "<?xml version=\"1.0\"?><urlset></urlset>"
      : htmlPage({
          canonical: url.pathname,
          body: url.pathname === "/" ? "<a href=\"/slow\">Slow route</a>" : "<h1>Slow route</h1>",
        });
    const contentType = url.pathname === "/sitemap.xml"
      ? "application/xml"
      : "text/html; charset=utf-8";

    return new Response(body, {
      status: 200,
      headers: { "content-type": contentType },
    });
  };

  const report = await buildProductionSurfaceLinkReport({
    baseUrl,
    criticalPaths: ["/"],
    fetchImpl,
    limit: 1,
    strict: true,
  });

  assert.equal(report.ok, true);
  assert.equal(report.totals.failures, 0);
  assert.ok(slowAttempts >= 2);
});
