import { defineConfig, devices } from "@playwright/test";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";
const webPort = new URL(webUrl).port || "3002";
const adminPort = new URL(adminUrl).port || "3001";
const reuseExistingServer = process.env.ALTFT_REUSE_SERVER === "true";
const skipAdminServer = process.env.ALTFT_SKIP_ADMIN_SERVER === "true";
const serverMode = process.env.ALTFT_PLAYWRIGHT_SERVER || "dev";
const webServerMode = process.env.ALTFT_PLAYWRIGHT_WEB_SERVER || serverMode;
const adminServerMode = process.env.ALTFT_PLAYWRIGHT_ADMIN_SERVER || serverMode;
const webServerCommand = webServerMode === "production"
  ? `npm --prefix altftoolweb run start -- -p ${webPort}`
  : `npm --prefix altftoolweb run dev -- -p ${webPort}`;
const adminServerCommand = adminServerMode === "production"
  ? `npm --prefix altftoolwebadmin run start -- -p ${adminPort}`
  : `npm --prefix altftoolwebadmin run dev -- -p ${adminPort}`;

const webServers = [
  {
    command: webServerCommand,
    url: webUrl,
    reuseExistingServer,
    timeout: 120_000,
  },
];

if (!skipAdminServer) {
  webServers.push({
    command: adminServerCommand,
    url: `${adminUrl}/login`,
    reuseExistingServer,
    timeout: 120_000,
  });
}

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  timeout: 45_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "initial",
      maxDiffPixelRatio: 0.01,
      scale: "css",
      stylePath: "./tests/styles/visual-stable.css",
      threshold: 0.22,
      pathTemplate: "{testDir}/__screenshots__{/projectName}/{testFilePath}/{arg}{ext}",
    },
  },
  workers: process.env.CI ? 2 : 3,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: webUrl,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: webServers,
});
