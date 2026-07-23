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

test("production partner tags retain the configured verification and pixel IDs", async () => {
  const source = await readFile(
    new URL("../altftoolweb/src/ads/ProductionPartnerTags.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /1bc9daffdd035cbc7c5e6a6d1d9230cd/);
  assert.match(source, /quge5\.com\/88\/tag\.min\.js/);
  assert.match(source, /data-zone="248425"/);
  assert.match(source, /TABOOLA_PIXEL_ID = 2053347/);
  assert.match(source, /tb_tfa_script/);
});

test("Monetag serves its zone worker from the site root without unregistering it", async () => {
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

  assert.match(workerSource, /"domain": "auqot\.com"/);
  assert.match(workerSource, /"zoneId": 11129459/);
  assert.match(
    workerSource,
    /https:\/\/auqot\.com\/act\/files\/service-worker\.min\.js\?r=sw/,
  );
  assert.doesNotMatch(workerSource, /unregister/);
  assert.doesNotMatch(layoutSource, /legacy-service-worker-cleanup/);
});
