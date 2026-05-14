import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const publicRoot = path.join(root, "altftoolweb", "public");
const sourceRoot = path.join(root, "altftoolweb", "src");

const imageExtensions = new Set([
  ".avif",
  ".gif",
  ".jpg",
  ".jpeg",
  ".png",
  ".svg",
  ".webp",
]);

const sourceExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".md",
  ".mdx",
]);

const maxPublicImageKiB = Number(process.env.ALTFT_MAX_PUBLIC_IMAGE_KIB || 3_000);

const criticalAssets = [
  {
    file: "altftoolweb/public/extension/hero.jpg",
    maxKiB: Number(process.env.ALTFT_EXTENSION_HERO_MAX_KIB || 450),
  },
  {
    file: "altftoolweb/public/academy/hero/banner-academy.jpg",
    maxKiB: Number(process.env.ALTFT_ACADEMY_HERO_MAX_KIB || 500),
  },
  {
    file: "altftoolweb/public/academy/hero/banner-acad2.jpg",
    maxKiB: Number(process.env.ALTFT_ACADEMY_HERO_ALT_MAX_KIB || 500),
  },
  {
    file: "altftoolweb/public/trending/game/Flappy.jpg",
    maxKiB: Number(process.env.ALTFT_BLOG_GAME_COVER_MAX_KIB || 500),
  },
  {
    file: "altftoolweb/public/images/featured5.jpg",
    maxKiB: Number(process.env.ALTFT_FEATURED_IMAGE_MAX_KIB || 450),
  },
  {
    file: "altftoolweb/public/images/featured6.jpg",
    maxKiB: Number(process.env.ALTFT_FEATURED_ALT_IMAGE_MAX_KIB || 450),
  },
  {
    file: "altftoolweb/public/continue.jpg",
    maxKiB: Number(process.env.ALTFT_CONTINUE_EMPTY_STATE_MAX_KIB || 350),
  },
  {
    file: "altftoolweb/public/amaz.jpg",
    maxKiB: Number(process.env.ALTFT_OFFER_CARD_BANNER_MAX_KIB || 350),
  },
  {
    file: "altftoolweb/public/banners/vertical.jpg",
    maxKiB: Number(process.env.ALTFT_VERTICAL_AD_MAX_KIB || 450),
  },
];

const forbiddenCriticalReferences = [
  {
    pattern: "/extension/hero.png",
    replacement: "/extension/hero.jpg",
  },
  {
    pattern: "/academy/hero/banner-academy.png",
    replacement: "/academy/hero/banner-academy.jpg",
  },
  {
    pattern: "/academy/hero/banner-acad2.png",
    replacement: "/academy/hero/banner-acad2.jpg",
  },
  {
    pattern: "/images/featured5.png",
    replacement: "/images/featured5.jpg",
  },
  {
    pattern: "/images/featured6.png",
    replacement: "/images/featured6.jpg",
  },
  {
    pattern: "/continue.png",
    replacement: "/continue.jpg",
  },
  {
    pattern: "/amaz.png",
    replacement: "/amaz.jpg",
  },
  {
    pattern: "/banners/vertical.png",
    replacement: "/banners/vertical.jpg",
  },
];

async function walk(dir, filter) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath, filter);
    if (entry.isFile() && filter(fullPath)) return [fullPath];
    return [];
  }));

  return files.flat();
}

function bytesToKiB(bytes) {
  return bytes / 1024;
}

function formatKiB(bytes) {
  return `${bytesToKiB(bytes).toFixed(1)} KiB`;
}

async function checkCriticalAssets() {
  const failures = [];
  const rows = [];

  for (const asset of criticalAssets) {
    const fullPath = path.join(root, asset.file);
    const fileStat = await stat(fullPath);
    const sizeKiB = bytesToKiB(fileStat.size);
    rows.push({
      file: asset.file,
      size: formatKiB(fileStat.size),
      max: `${asset.maxKiB} KiB`,
    });

    if (sizeKiB > asset.maxKiB) {
      failures.push(`${asset.file}: ${formatKiB(fileStat.size)} exceeds ${asset.maxKiB} KiB`);
    }
  }

  return { rows, failures };
}

async function checkPublicImages() {
  const files = await walk(publicRoot, (file) => imageExtensions.has(path.extname(file).toLowerCase()));
  const rows = await Promise.all(files.map(async (file) => {
    const fileStat = await stat(file);
    return {
      file: path.relative(root, file),
      bytes: fileStat.size,
    };
  }));

  rows.sort((a, b) => b.bytes - a.bytes);

  const failures = rows
    .filter((row) => bytesToKiB(row.bytes) > maxPublicImageKiB)
    .map((row) => `${row.file}: ${formatKiB(row.bytes)} exceeds ${maxPublicImageKiB} KiB`);

  return {
    topImages: rows.slice(0, 10).map((row) => ({
      file: row.file,
      size: formatKiB(row.bytes),
    })),
    failures,
  };
}

async function checkForbiddenReferences() {
  const sourceFiles = await walk(sourceRoot, (file) => sourceExtensions.has(path.extname(file).toLowerCase()));
  const failures = [];

  for (const file of sourceFiles) {
    const content = await readFile(file, "utf8");
    for (const rule of forbiddenCriticalReferences) {
      if (content.includes(rule.pattern)) {
        failures.push(
          `${path.relative(root, file)} still references ${rule.pattern}; use ${rule.replacement}`,
        );
      }
    }
  }

  return failures;
}

const [critical, publicImages, forbiddenReferenceFailures] = await Promise.all([
  checkCriticalAssets(),
  checkPublicImages(),
  checkForbiddenReferences(),
]);

const failures = [
  ...critical.failures,
  ...publicImages.failures,
  ...forbiddenReferenceFailures,
];

console.log("Public media budget audit:");
console.log(JSON.stringify({
  criticalAssets: critical.rows,
  maxPublicImage: `${maxPublicImageKiB} KiB`,
  topImages: publicImages.topImages,
}, null, 2));

if (failures.length) {
  console.error("Public media budget check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Public media budget check passed.");
