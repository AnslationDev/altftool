import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const requiredFiles = [
  {
    path: "packages/core/package.json",
    includes: ['"./firebasePaths": "./src/firebasePaths.js"'],
  },
  {
    path: "packages/core/src/firebasePaths.js",
    includes: [
      'ALTFT_PROJECT_ID = "altftool"',
      "ALTFT_BUYSMART_ROOT",
      'featureBrand: "featurebrand"',
      "buySmartDocPath",
    ],
  },
  {
    path: "altftoolweb/src/lib/firebase.js",
    includes: [
      "altftool-bca36.firebaseapp.com",
      'projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36"',
      "altftool-bca36.firebasestorage.app",
    ],
  },
  {
    path: "altftoolwebadmin/src/lib/firebase.js",
    includes: [
      "altftool-bca36.firebaseapp.com",
      'projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36"',
      "altftool-bca36.firebasestorage.app",
    ],
  },
  {
    path: "altftoolweb/src/app/blogs/data/firebaseBlogs.js",
    includes: [
      'process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36"',
      'const PROJECT_ID = "altftool"',
      "FIRESTORE_PARENT",
      "fetchFirebaseBlogsPage",
      "fetchFirebaseBlogBySlug",
    ],
  },
  {
    path: "firestore.rules",
    includes: [
      "match /projects/altftool/blogs/{blogId}",
      "allow read: if true;",
      "allow create, delete: if isActiveAdmin();",
      "match /projects/altftool/{document=**}",
    ],
  },
  {
    path: "storage.rules",
    includes: [
      "isSafeUpload(100 * 1024 * 1024)",
      "allow create, update: if isActiveAdmin()",
      "allow delete: if isActiveAdmin();",
    ],
  },
];

const buySmartWebFiles = [
  "altftoolweb/src/hooks/useIdleRedirect.js",
  "altftoolweb/src/app/buysmart/service.js/firebaseBuySmartCategories.js",
  "altftoolweb/src/app/buysmart/service.js/firebaseBuySmartFeature.js",
  "altftoolweb/src/app/buysmart/service.js/firebaseBuySmartHero.js",
  "altftoolweb/src/app/buysmart/service.js/firebaseBuySmartStore.js",
  "altftoolweb/src/app/buysmart/service.js/firebaseBuySmartTracking.js",
  "altftoolweb/src/app/buysmart/service.js/firebaseBuySmartTrending.js",
];

const buySmartAdminFiles = [
  "altftoolwebadmin/src/data/firebase.buySmart.js",
  "altftoolwebadmin/src/lib/analytics/moduleRegistry.js",
  "altftoolwebadmin/src/projects/altftool/modules/buysmart/services/firebaseBuySmartCategories.js",
  "altftoolwebadmin/src/projects/altftool/modules/buysmart/services/firebaseBuySmartFeatureBrand.jsx",
  "altftoolwebadmin/src/projects/altftool/modules/buysmart/services/firebaseBuySmartHero.js",
  "altftoolwebadmin/src/projects/altftool/modules/buysmart/services/firebaseBuySmartRuleSet.js",
  "altftoolwebadmin/src/projects/altftool/modules/buysmart/services/firebaseBuySmartStore.js",
  "altftoolwebadmin/src/projects/altftool/modules/buysmart/services/firebaseBuySmartTrending.js",
];

async function readProjectFile(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

function stripLineComments(content) {
  return content
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
}

async function assertIncludes(failures, contract) {
  const content = await readProjectFile(contract.path);

  for (const expected of contract.includes) {
    if (!content.includes(expected)) {
      failures.push(`${contract.path} is missing ${expected}`);
    }
  }
}

async function assertBuySmartPathHelpers(failures) {
  for (const file of buySmartWebFiles) {
    const content = stripLineComments(await readProjectFile(file));
    if (!content.includes('from "@altftool/core/firebasePaths"')) {
      failures.push(`${file} must import shared Firebase path helpers`);
    }
    if (/doc\(db,\s*["']projects["'],\s*["']altftool["'],\s*["']buySmart["']/.test(content)) {
      failures.push(`${file} must not hardcode BuySmart Firestore doc paths`);
    }
  }

  for (const file of buySmartAdminFiles) {
    const content = stripLineComments(await readProjectFile(file));
    if (!content.includes('from "@altftool/core/firebasePaths"')) {
      failures.push(`${file} must import shared Firebase path helpers`);
    }
    if (/docPath:\s*\[\s*["']projects["'],\s*["']altftool["'],\s*["']buySmart["']/.test(content)) {
      failures.push(`${file} must not hardcode BuySmart analytics doc paths`);
    }
    if (/\bROOT\s*=\s*\[\s*["']projects["'],\s*["']altftool["'],\s*["']buySmart["']/.test(content)) {
      failures.push(`${file} must not hardcode BuySmart ROOT`);
    }
  }
}

const failures = [];

for (const contract of requiredFiles) {
  await assertIncludes(failures, contract);
}

await assertBuySmartPathHelpers(failures);

if (failures.length) {
  console.error("Firebase contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Firebase contract check passed.");
