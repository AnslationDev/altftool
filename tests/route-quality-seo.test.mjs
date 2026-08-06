import assert from "node:assert/strict";
import test from "node:test";
import {
  collectSitemapPaths,
  extractAdvertisedSitemapUrls,
  extractSitemapLocations,
  readRenderedSitemapXml,
  renderCompiledSitemapRoute,
} from "../scripts/lib/rendered-sitemap.mjs";
import {
  compileNoindexResponseHeaderRules,
  hasNoindexResponseHeader,
} from "../scripts/lib/rendered-route-policies.mjs";
import {
  classifyRenderedContentQuality,
  passesStrictQuality,
} from "../scripts/lib/route-quality-policy.mjs";
import { isIntentionalSitemapOmission } from "../scripts/lib/sitemap-coverage-policy.mjs";

test("robots sitemap declarations are extracted without treating Host as a sitemap", () => {
  const urls = extractAdvertisedSitemapUrls(`
Host: https://www.altftool.com
Sitemap: https://www.altftool.com/sitemap.xml
Sitemap: https://www.altftool.com/ideas/sitemap.xml
  `);

  assert.deepEqual(urls, [
    "https://www.altftool.com/sitemap.xml",
    "https://www.altftool.com/ideas/sitemap.xml",
  ]);
});

test("sitemap collection unions urlsets and recursively follows sitemap indexes", async () => {
  const documents = new Map([
    [
      "https://www.altftool.com/sitemap.xml",
      `<?xml version="1.0"?><urlset><url><loc>https://www.altftool.com/tools/all/json</loc></url></urlset>`,
    ],
    [
      "https://www.altftool.com/lexicon/sitemap.xml",
      `<?xml version="1.0"?><sitemapindex>
        <sitemap><loc>https://www.altftool.com/lexicon/sitemap/pages</loc></sitemap>
        <sitemap><loc>https://www.altftool.com/lexicon/sitemap/words-1</loc></sitemap>
      </sitemapindex>`,
    ],
    [
      "https://www.altftool.com/lexicon/sitemap/pages",
      `<urlset><url><loc>https://www.altftool.com/lexicon/learn</loc></url></urlset>`,
    ],
    [
      "https://www.altftool.com/lexicon/sitemap/words-1",
      `<urlset><url><loc>https://www.altftool.com/lexicon/word/a&amp;b/</loc></url></urlset>`,
    ],
  ]);

  const result = await collectSitemapPaths({
    sitemapUrls: [
      "https://www.altftool.com/sitemap.xml",
      "https://www.altftool.com/lexicon/sitemap.xml",
    ],
    readSitemap: async (url) => documents.get(url),
  });

  assert.deepEqual([...result.paths].sort(), [
    "/lexicon/learn",
    "/lexicon/word/a&b",
    "/tools/all/json",
  ]);
  assert.equal(result.documents.size, 4);
});

test("sitemap collection de-duplicates cyclic sitemap indexes", async () => {
  const index = "https://www.altftool.com/sitemap.xml";
  const child = "https://www.altftool.com/sitemap/child";
  const documents = new Map([
    [
      index,
      `<sitemapindex><sitemap><loc>${child}</loc></sitemap></sitemapindex>`,
    ],
    [
      child,
      `<sitemapindex><sitemap><loc>${index}</loc></sitemap></sitemapindex>`,
    ],
  ]);

  const result = await collectSitemapPaths({
    sitemapUrls: [index],
    readSitemap: async (url) => documents.get(url),
  });

  assert.equal(result.documents.size, 2);
  assert.equal(result.paths.size, 0);
});

test("compiled sitemap rendering forwards request and dynamic route params", async () => {
  const request = new Request("https://www.altftool.com/lexicon/sitemap/pages");
  const routeContext = { params: Promise.resolve({ shard: "pages" }) };
  let received;

  const xml = await renderCompiledSitemapRoute("virtual-route", {
    loadModule: () => ({
      routeModule: {
        userland: {
          GET: async (...args) => {
            received = args;
            return new Response("<urlset />");
          },
        },
      },
    }),
    request,
    routeContext,
  });

  assert.equal(xml, "<urlset />");
  assert.equal(received[0], request);
  assert.equal(received[1], routeContext);
});

test("static sitemap output still takes precedence over dynamic rendering", async () => {
  let dynamicCalls = 0;
  const xml = await readRenderedSitemapXml({
    staticOutputPath: "static.xml",
    dynamicRoutePath: "dynamic.js",
    readText: async () =>
      "<urlset><url><loc>https://www.altftool.com/</loc></url></urlset>",
    renderDynamicRoute: async () => {
      dynamicCalls += 1;
      return "<urlset />";
    },
  });

  assert.equal(extractSitemapLocations(xml)[0], "https://www.altftool.com/");
  assert.equal(dynamicCalls, 0);
});

test("compiled X-Robots-Tag rules classify response-header noindex routes", () => {
  const rules = compileNoindexResponseHeaderRules({
    headers: [
      {
        source: "/bops/:path*",
        regex: "^/bops(?:/(.*))?/?$",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/assets/:path*",
        regex: "^/assets(?:/(.*))?/?$",
        headers: [{ key: "Cache-Control", value: "public" }],
      },
    ],
  });

  assert.equal(rules.length, 1);
  assert.equal(hasNoindexResponseHeader("/bops/insurance", rules), true);
  assert.equal(hasNoindexResponseHeader("/tools/all/json", rules), false);
});

test("only documented Lexicon crawl-policy omissions bypass sitemap coverage", () => {
  assert.equal(
    isIntentionalSitemapOmission({
      route: "/lexicon/rhymes/ability",
      title: "66 words that rhyme with ability | AltFTool",
    }),
    true,
  );
  assert.equal(
    isIntentionalSitemapOmission({
      route: "/lexicon/word-of-the-day/2026-08-06",
      title: "Word of the day, Thursday, 6 August 2026 — example | AltFTool",
    }),
    true,
  );
  assert.equal(
    isIntentionalSitemapOmission({
      route: "/lexicon/word/a-few",
      title: "a few — meaning, pronunciation and definition | AltFTool",
    }),
    true,
  );
  assert.equal(
    isIntentionalSitemapOmission({
      route: "/lexicon/word/merry-go-round",
      title:
        "merry-go-round — meaning, pronunciation and definition | AltFTool",
    }),
    false,
  );
  assert.equal(
    isIntentionalSitemapOmission({
      route: "/tools/all/json-formatter",
      title: "JSON Formatter | AltFTool",
    }),
    false,
  );
});

test("strict quality blocks hard metadata failures but retains ideal-length advisories", () => {
  const advisory = classifyRenderedContentQuality({
    title: "T".repeat(71),
    titleCount: 1,
    description: "D".repeat(166),
    descriptionCount: 1,
    h1Count: 1,
  });
  assert.deepEqual(advisory.issues, []);
  assert.deepEqual(advisory.advisories, [
    "Long title (71)",
    "Non-ideal description (166)",
  ]);
  assert.equal(
    passesStrictQuality({
      routesWithIssues: 0,
      routesWithAdvisories: 2000,
      indexConflicts: 0,
      missingCanonicalTargets: 0,
    }),
    true,
  );

  const invalid = classifyRenderedContentQuality({
    title: "T".repeat(141),
    titleCount: 1,
    description: "D".repeat(39),
    descriptionCount: 1,
    h1Count: 0,
  });
  assert.equal(invalid.issues.length, 3);
  assert.equal(
    passesStrictQuality({
      routesWithIssues: 1,
      indexConflicts: 0,
      missingCanonicalTargets: 0,
    }),
    false,
  );
});
