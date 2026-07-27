import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const selfPath = path.relative(root, fileURLToPath(import.meta.url));
const maxTextBytes = 8 * 1024 * 1024;
const binaryExtensions = new Set([
  ".avif",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".mp3",
  ".mp4",
  ".pdf",
  ".png",
  ".ttf",
  ".webm",
  ".webp",
  ".woff",
  ".woff2",
  ".zip",
]);

function gitFiles(args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "buffer",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr.toString("utf8") || "Unable to list Git files.");
  }
  return result.stdout
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
}

function getCandidateFiles() {
  return [
    ...new Set([
      ...gitFiles(["ls-files", "-z"]),
      ...gitFiles(["ls-files", "--others", "--exclude-standard", "-z"]),
    ]),
  ].filter((file) => file !== selfPath);
}

const trackedFiles = new Set(gitFiles(["ls-files", "-z"]));

function readText(file) {
  const absolutePath = path.join(root, file);
  let stat;
  try {
    stat = fs.statSync(absolutePath);
  } catch {
    return "";
  }
  if (!stat.isFile() || stat.size > maxTextBytes) return "";
  if (binaryExtensions.has(path.extname(file).toLowerCase())) return "";

  const buffer = fs.readFileSync(absolutePath);
  if (buffer.includes(0)) return "";
  return buffer.toString("utf8");
}

function lineNumber(text, index) {
  return text.slice(0, index).split("\n").length;
}

function findPublicFirebaseKey() {
  const source = readText("altftoolweb/src/lib/firebase.js");
  return (
    source.match(
      /NEXT_PUBLIC_FIREBASE_API_KEY\s*\|\|\s*["'](AIza[0-9A-Za-z_-]{30,})["']/,
    )?.[1] || ""
  );
}

const publicFirebaseKey = findPublicFirebaseKey();
const tokenRules = [
  ["vercel-token", /vcp_[A-Za-z0-9]{35,}/g],
  ["github-token", /gh[pousr]_[A-Za-z0-9]{30,}/g],
  ["gitlab-token", /glpat-[A-Za-z0-9_-]{20,}/g],
  ["npm-token", /npm_[A-Za-z0-9]{30,}/g],
  ["aws-access-key", /AKIA[0-9A-Z]{16}/g],
  [
    "openai-key",
    /sk-(?:proj-)?[A-Za-z0-9_-]{32,}/g,
    (value) => /[A-Z]/.test(value) && /\d/.test(value),
  ],
  ["slack-token", /xox[baprs]-[A-Za-z0-9-]{32,}/g],
  ["stripe-live-key", /(?:sk|rk)_live_[A-Za-z0-9]{24,}/g],
  ["google-oauth-client-secret", /GOCSPX-[A-Za-z0-9_-]{20,}/g],
  ["sendgrid-api-key", /SG\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g],
];
const pemRules = [
  [
    "private-key",
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----\r?\n(?:(?:[A-Za-z0-9+/=]{20,})\r?\n){5,}-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  ],
  [
    "escaped-private-key",
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----\\n(?:(?:[A-Za-z0-9+/=]{20,})\\n){5,}-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  ],
];

const findings = [];
let filesScanned = 0;
const sensitiveFilenamePatterns = [
  {
    rule: "tracked-env-file",
    test: (file) =>
      /(^|\/)\.env(?:\.|$)/.test(file) && !file.endsWith(".env.example"),
  },
  {
    rule: "tracked-service-account-export",
    test: (file) =>
      /(?:firebase-adminsdk|service[-_]account|credentials).*\.json$/i.test(
        file,
      ),
  },
  {
    rule: "tracked-private-key-file",
    test: (file) => /\.(?:key|p12|pfx|pem)$/i.test(file),
  },
];

for (const file of getCandidateFiles()) {
  if (trackedFiles.has(file)) {
    for (const filenameRule of sensitiveFilenamePatterns) {
      if (filenameRule.test(file)) {
        findings.push({
          file,
          line: 1,
          rule: filenameRule.rule,
        });
      }
    }
  }

  const text = readText(file);
  if (!text) continue;
  filesScanned += 1;

  for (const [rule, regex, isCredential = () => true] of [
    ...tokenRules,
    ...pemRules,
  ]) {
    regex.lastIndex = 0;
    for (const match of text.matchAll(regex)) {
      if (!isCredential(match[0])) continue;
      findings.push({
        file,
        line: lineNumber(text, match.index),
        rule,
      });
    }
  }

  const googleKeyRegex = /AIza[0-9A-Za-z_-]{30,}/g;
  for (const match of text.matchAll(googleKeyRegex)) {
    if (publicFirebaseKey && match[0] === publicFirebaseKey) continue;
    findings.push({
      file,
      line: lineNumber(text, match.index),
      rule: "unapproved-google-api-key",
    });
  }
}

if (findings.length) {
  console.error(
    `Secret hygiene failed: ${findings.length} high-confidence credential pattern${findings.length === 1 ? "" : "s"} found.`,
  );
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} (${finding.rule})`);
  }
  console.error("Rotate exposed credentials and move them to the deployment secret store.");
  process.exitCode = 1;
} else {
  console.log(
    `Secret hygiene passed: ${filesScanned} tracked/unignored text files scanned; no high-confidence credentials found.`,
  );
}
