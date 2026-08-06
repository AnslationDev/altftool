import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  readRenderedSitemapXml,
  renderCompiledSitemapRoute,
} from "../scripts/lib/rendered-sitemap.mjs";

describe("rendered sitemap reader", () => {
  it("prefers the legacy static build artifact when it exists", async () => {
    let renderedDynamicRoute = false;
    const xml = await readRenderedSitemapXml({
      staticOutputPath: "/build/sitemap.xml.body",
      dynamicRoutePath: "/build/sitemap.xml/route.js",
      readText: async () =>
        "<urlset><url><loc>https://altftool.com/static</loc></url></urlset>",
      renderDynamicRoute: async () => {
        renderedDynamicRoute = true;
        return "";
      },
    });

    assert.match(xml, /\/static/);
    assert.equal(renderedDynamicRoute, false);
  });

  it("falls back only when the static artifact does not exist", async () => {
    const xml = await readRenderedSitemapXml({
      staticOutputPath: "/build/sitemap.xml.body",
      dynamicRoutePath: "/build/sitemap.xml/route.js",
      readText: async () => {
        const error = new Error("not found");
        error.code = "ENOENT";
        throw error;
      },
      dynamicRouteWorkingDirectory: "/workspace/altftoolweb",
      renderDynamicRoute: async (routePath, { workingDirectory }) => {
        assert.equal(routePath, "/build/sitemap.xml/route.js");
        assert.equal(workingDirectory, "/workspace/altftoolweb");
        return "<urlset><url><loc>https://altftool.com/dynamic</loc></url></urlset>";
      },
    });

    assert.match(xml, /\/dynamic/);
  });

  it("executes the compiled GET with an isolated no-store cache", async () => {
    const tempDir = mkdtempSync(join(tmpdir(), "altftool-sitemap-route-"));
    const appRoot = join(tempDir, "altftoolweb");
    mkdirSync(join(appRoot, "public", "data"), { recursive: true });
    writeFileSync(
      join(appRoot, "public", "data", "manifest.json"),
      '{"route":"exact-route-output"}',
    );
    const routePath = join(tempDir, "route.cjs");
    const previousWorkingDirectory = process.cwd();
    const previousCache = { marker: "preserve-me" };
    globalThis.__incrementalCache = previousCache;
    writeFileSync(
      routePath,
      `module.exports.routeModule = { userland: { GET: async () => {
        const { readFileSync } = require("node:fs");
        if (!globalThis.__incrementalCache || await globalThis.__incrementalCache.get() !== null) {
          throw new Error("missing no-store cache");
        }
        const { route } = JSON.parse(readFileSync("public/data/manifest.json", "utf8"));
        return new Response(\`<urlset><url><loc>https://altftool.com/\${route}</loc></url></urlset>\`, {
          headers: { "content-type": "application/xml" }
        });
      } } };\n`,
    );

    try {
      const xml = await renderCompiledSitemapRoute(routePath, {
        workingDirectory: appRoot,
      });
      assert.match(xml, /\/exact-route-output/);
      assert.equal(globalThis.__incrementalCache, previousCache);
      assert.equal(process.cwd(), previousWorkingDirectory);
    } finally {
      delete globalThis.__incrementalCache;
      rmSync(tempDir, { force: true, recursive: true });
    }
  });

  it("does not hide non-ENOENT static artifact failures", async () => {
    const permissionError = Object.assign(new Error("permission denied"), {
      code: "EACCES",
    });

    await assert.rejects(
      readRenderedSitemapXml({
        staticOutputPath: "/build/sitemap.xml.body",
        dynamicRoutePath: "/build/sitemap.xml/route.js",
        readText: async () => {
          throw permissionError;
        },
      }),
      permissionError,
    );
  });
});
