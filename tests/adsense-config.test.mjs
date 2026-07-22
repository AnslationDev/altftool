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
