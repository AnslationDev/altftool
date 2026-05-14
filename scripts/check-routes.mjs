import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const bannedRoutePatterns = [
  {
    label: "legacy public category route",
    pattern: /\/categories\/all/g,
    roots: ["altftoolweb/src"],
  },
  {
    label: "singular blog route",
    pattern: /href=["']\/blog["']/g,
    roots: ["altftoolweb/src"],
  },
  {
    label: "relative Exclusive Deals route",
    pattern: /href=\{`exclusivedeals\//g,
    roots: ["altftoolweb/src"],
  },
  {
    label: "legacy LeadTree credit card route",
    pattern: /\/leadtree\/creditcard/g,
    roots: ["altftoolwebadmin/src"],
  },
  {
    label: "legacy LeadTree expert videos route",
    pattern: /\/leadtree\/expertvideos/g,
    roots: ["altftoolwebadmin/src"],
  },
  {
    label: "camelCase AltFTool route",
    pattern: /\/altftool\/trendingVideos/g,
    roots: ["altftoolwebadmin/src"],
  },
];

const expectedPublicPages = [
  "altftoolweb/src/app/(marketing)/page.jsx",
  "altftoolweb/src/app/tools/page.jsx",
  "altftoolweb/src/app/tools/[category]/page.jsx",
  "altftoolweb/src/app/tools/[category]/[slug]/page.jsx",
  "altftoolweb/src/app/tools/all/api-stress-estimator/page.jsx",
  "altftoolweb/src/app/extensions/page.jsx",
  "altftoolweb/src/app/exclusivedeals/page.jsx",
  "altftoolweb/src/app/buysmart/page.jsx",
  "altftoolweb/src/app/sale/page.jsx",
  "altftoolweb/src/app/academy/page.jsx",
  "altftoolweb/src/app/blogs/page.jsx",
  "altftoolweb/src/app/brandrating/page.jsx",
  "altftoolweb/src/app/news/page.jsx",
  "altftoolweb/src/app/news/topics/[topic]/page.jsx",
  "altftoolweb/src/app/api/health/route.js",
  "altftoolweb/src/app/rss.xml/route.js",
  "altftoolweb/src/app/desktop/page.jsx",
  "altftoolweb/src/app/trendingvids/page.jsx",
  "altftoolweb/src/app/supportsetting/page.jsx",
  "altftoolwebadmin/src/app/(protected)/[project]/page.jsx",
  "altftoolwebadmin/src/app/not-found.jsx",
];

async function pathExists(relativePath) {
  try {
    await stat(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(startDir) {
  const absStart = path.join(root, startDir);
  const entries = await readdir(absStart, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;

    const relative = path.join(startDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(relative)));
    } else if (/\.(jsx?|mjs|css)$/.test(entry.name)) {
      files.push(relative);
    }
  }

  return files;
}

async function assertNoBannedRoutes() {
  const failures = [];

  for (const rule of bannedRoutePatterns) {
    for (const scanRoot of rule.roots) {
      const files = await collectFiles(scanRoot);

      for (const file of files) {
        const content = await readFile(path.join(root, file), "utf8");
        if (rule.pattern.test(content)) {
          failures.push(`${rule.label}: ${file}`);
        }
        rule.pattern.lastIndex = 0;
      }
    }
  }

  return failures;
}

async function parseProjectModules(projectId) {
  const configPath = path.join(root, `altftoolwebadmin/src/projects/${projectId}/config.js`);
  const content = await readFile(configPath, "utf8");
  const moduleBlock = content.match(/modules:\s*{([\s\S]*?)\n\s*},\n};/);
  if (!moduleBlock) return [];

  return [...moduleBlock[1].matchAll(/^\s*([A-Za-z0-9_]+):\s*{\s*label:\s*"([^"]+)"[\s\S]*?}/gm)].map(
    ([, key, label]) => ({ key, label }),
  );
}

async function assertAdminModulesImplemented() {
  const failures = [];

  for (const projectId of ["altftool", "leadtree"]) {
    const modules = await parseProjectModules(projectId);

    for (const module of modules) {
      const pagePath = `altftoolwebadmin/src/projects/${projectId}/modules/${module.key}/page.jsx`;
      if (!(await pathExists(pagePath))) {
        failures.push(`${projectId}/${module.key} (${module.label}) has no module page`);
      }
    }
  }

  return failures;
}

const failures = [
  ...(await Promise.all(
    expectedPublicPages.map(async (page) =>
      (await pathExists(page)) ? null : `missing public route page: ${page}`,
    ),
  )).filter(Boolean),
  ...(await assertNoBannedRoutes()),
  ...(await assertAdminModulesImplemented()),
];

if (failures.length) {
  console.error("Route check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Route check passed.");
