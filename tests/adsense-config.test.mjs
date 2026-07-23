import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  ADSENSE_CLIENT,
  ADSENSE_PUBLISHER_ID,
  isAdsenseProductionDeployment,
  isAdsenseProductionHost,
} from "../altftoolweb/src/ads/adsenseConfig.js";

test("AdSense only activates for a production deployment", () => {
  assert.equal(
    isAdsenseProductionDeployment({
      NODE_ENV: "production",
      AWS_BRANCH: "main",
    }),
    true,
  );
  assert.equal(
    isAdsenseProductionDeployment({
      NODE_ENV: "production",
      AWS_BRANCH: "beta",
    }),
    false,
  );
  assert.equal(
    isAdsenseProductionDeployment({
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
    }),
    false,
  );
  assert.equal(
    isAdsenseProductionDeployment({
      NODE_ENV: "development",
      NEXT_PUBLIC_SITE_URL: "https://www.altftool.com",
    }),
    false,
  );
  assert.equal(
    isAdsenseProductionDeployment({
      NODE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://www.altftool.com",
    }),
    true,
  );
  assert.equal(
    isAdsenseProductionDeployment({
      NEXT_PUBLIC_SITE_URL: "https://www.altftool.com",
    }),
    true,
  );
  assert.equal(
    isAdsenseProductionDeployment({
      NODE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3002",
    }),
    false,
  );
});

test("AdSense production host matching is exact", () => {
  assert.equal(isAdsenseProductionHost("altftool.com"), true);
  assert.equal(isAdsenseProductionHost("https://www.altftool.com/blogs"), true);
  assert.equal(isAdsenseProductionHost("preview.altftool.com"), false);
  assert.equal(isAdsenseProductionHost("altftool.com.example.com"), false);
});

test("ads.txt authorizes the configured AdSense publisher", async () => {
  const adsTxt = await readFile(
    new URL("../altftoolweb/public/ads.txt", import.meta.url),
    "utf8",
  );

  assert.equal(ADSENSE_CLIENT, `ca-${ADSENSE_PUBLISHER_ID}`);
  assert.match(
    adsTxt,
    new RegExp(
      `^google\\.com, ${ADSENSE_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0$`,
      "m",
    ),
  );
});

test("production layout only includes Google ad monetization", async () => {
  const source = await readFile(
    new URL("../altftoolweb/src/app/layout.jsx", import.meta.url),
    "utf8",
  );
  const forbiddenIntegrations = [
    /monetag/i,
    /quge5/i,
    /auqot/i,
    /11129459/,
    /248425/,
    /taboola/i,
    /skimresources/i,
    /skimlinks/i,
    /mitgo-verification/i,
  ];

  assert.match(source, /ProductionAdSenseScript/);
  assert.match(source, /GoogleAdUnit/);
  assert.match(source, /AW-17780489814/);

  for (const pattern of forbiddenIntegrations) {
    assert.doesNotMatch(source, pattern);
  }

  for (const removedComponent of [
    "../altftoolweb/src/ads/ProductionPartnerTags.jsx",
    "../altftoolweb/src/ads/ProductionSkimlinksScript.jsx",
  ]) {
    await assert.rejects(
      readFile(new URL(removedComponent, import.meta.url), "utf8"),
      (error) => error?.code === "ENOENT",
    );
  }
});

test("legacy third-party worker retires itself without external imports", async () => {
  const [workerSource, layoutSource] = await Promise.all([
    readFile(
      new URL("../altftoolweb/public/sw.js", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../altftoolweb/src/app/layout.jsx", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(workerSource, /registration\.unregister/);
  assert.doesNotMatch(workerSource, /importScripts|https?:\/\//);
  assert.doesNotMatch(workerSource, /monetag|quge5|auqot|taboola/i);
  assert.match(layoutSource, /retire-third-party-service-worker/);
  assert.match(layoutSource, /registration\.unregister/);
});
