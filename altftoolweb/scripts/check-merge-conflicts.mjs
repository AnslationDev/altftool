#!/usr/bin/env node
/**
 * Fails the build when a tracked file still contains conflict markers.
 *
 * A merge resolved by committing `<<<<<<<` is not rare on shared branches:
 * `canonical-web/feature/top10` carried them in both a component and
 * package-lock.json, and the lockfile one would have broken `npm ci` on the
 * builder before a line of application code compiled.
 *
 * webpack does report the component case, but four minutes into a build and
 * only for files it happens to reach; a lockfile or a stylesheet it never
 * parses would have shipped. `git grep` answers the same question across the
 * whole tree in well under a second, so there is no reason to learn it late.
 */
import { execFileSync } from "node:child_process";

// `git grep -I` skips binaries. The pattern is anchored: a bare `<<<<<<<`
// inside a string or a diff fixture in test data is not a conflict, and
// flagging those would train everyone to ignore this check.
const PATTERN = "^(<{7}|={7}|>{7})( |$)";

let output = "";
try {
  output = execFileSync(
    "git",
    ["grep", "-I", "-n", "-E", PATTERN, "--", ".", ":!*.md"],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
} catch (error) {
  // git grep exits 1 with no output when nothing matches — the good case.
  if (error.status === 1 && !error.stdout) {
    console.log("Merge conflict guard: OK (no conflict markers tracked).");
    process.exit(0);
  }
  throw error;
}

const lines = output.split("\n").filter(Boolean);
const byFile = new Map();
for (const line of lines) {
  const [file] = line.split(":", 1);
  byFile.set(file, (byFile.get(file) || 0) + 1);
}

console.error(
  `Merge conflict guard: ${byFile.size} tracked file(s) contain conflict markers.\n`,
);
for (const [file, count] of byFile) {
  console.error(`  ${file} — ${count} marker line(s)`);
}
console.error(
  "\nA merge was committed unresolved. Resolve the file and commit the result;\n" +
    "a lockfile in this state fails `npm ci` before the build starts.",
);
process.exit(1);
