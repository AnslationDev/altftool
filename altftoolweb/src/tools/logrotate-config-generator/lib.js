/**
 * logrotate rule generation — directives and semantics per logrotate(8)
 * (the logrotate.conf(5) man page shipped with logrotate 3.x on Debian/RHEL).
 *
 * Key rules encoded here:
 *  - One block per log pattern: "<path> { directives }".
 *  - rotate N keeps N old logs; rotate 0 removes old versions immediately.
 *  - size/maxsize/minsize take a number with optional k, M or G suffix.
 *  - copytruncate and create are alternative strategies — using both is a
 *    conflict (copytruncate never re-creates the file, so create is ignored).
 *  - delaycompress only makes sense together with compress, and is needed when
 *    a daemon may keep writing to the old file briefly after rotation.
 *  - sharedscripts runs postrotate once for the whole pattern instead of once
 *    per matched file.
 *
 * Pure module — no React, no DOM.
 */

/** Rotation frequencies logrotate accepts (logrotate(8)). */
export const FREQUENCIES = [
  { id: "daily", label: "daily" },
  { id: "weekly", label: "weekly" },
  { id: "monthly", label: "monthly" },
  { id: "yearly", label: "yearly" },
  { id: "none", label: "size-based only (no time directive)" },
];

/** size/maxsize/minsize value syntax: digits + optional k/M/G suffix (logrotate(8)). */
export const SIZE_PATTERN = /^\d+[kMG]?$/;

/** File modes for create: 3 or 4 octal digits. */
const MODE_PATTERN = /^[0-7]{3,4}$/;
/** POSIX portable user/group name. */
const NAME_PATTERN = /^[a-z_][a-z0-9_-]*\$?$/;

/** Typical retention presets, expressed in rotations. */
export const RETENTION_HINTS = [
  { frequency: "daily", rotate: 14, label: "14 daily rotations ≈ two weeks" },
  { frequency: "weekly", rotate: 8, label: "8 weekly rotations ≈ two months" },
  { frequency: "monthly", rotate: 12, label: "12 monthly rotations = one year" },
];

/**
 * Build the logrotate config block.
 * @returns {{config:string, directives:string[], warnings:string[]}} or {error}
 */
export function buildLogrotateConfig(options = {}) {
  const {
    logPath = "/var/log/myapp/*.log",
    frequency = "daily",
    rotateCount = 14,
    compress = true,
    delaycompress = true,
    missingok = true,
    notifempty = true,
    dateext = true,
    copytruncate = false,
    useCreate = true,
    createMode = "0640",
    createUser = "root",
    createGroup = "adm",
    sizeType = "none", // none | size | maxsize | minsize
    sizeValue = "100M",
    olddir = "",
    postrotate = "",
    sharedscripts = true,
  } = options;

  const path = String(logPath ?? "").trim();
  if (!path) return { error: "Enter the log file path or glob, e.g. /var/log/myapp/*.log." };
  if (!path.startsWith("/")) return { error: "logrotate needs an absolute path starting with /." };
  if (/\s/.test(path) && !path.startsWith('"')) {
    return { error: "A path containing spaces must be wrapped in double quotes." };
  }

  const rotations = Number(rotateCount);
  if (!Number.isFinite(rotations) || !Number.isInteger(rotations) || rotations < 0) {
    return { error: "rotate must be a whole number of 0 or more." };
  }
  if (rotations > 10000) return { error: "Keeping more than 10,000 rotations is almost certainly a mistake." };

  const freq = FREQUENCIES.find((item) => item.id === frequency);
  if (!freq) return { error: "Choose a rotation frequency." };

  const directives = [];
  const warnings = [];

  if (freq.id !== "none") directives.push(freq.id);

  if (sizeType !== "none") {
    const size = String(sizeValue ?? "").trim();
    if (!SIZE_PATTERN.test(size)) {
      return { error: "Size must be digits with an optional k, M or G suffix, e.g. 100M." };
    }
    directives.push(`${sizeType} ${size}`);
    if (sizeType === "size" && freq.id !== "none") {
      warnings.push(
        "\"size\" REPLACES the time schedule — rotation happens only when the file exceeds the size. Use \"maxsize\" to combine size with the daily/weekly schedule.",
      );
    }
  } else if (freq.id === "none") {
    return { error: "Pick a time frequency or a size trigger — with neither, the rule never rotates." };
  }

  directives.push(`rotate ${rotations}`);
  if (rotations === 0) {
    warnings.push("rotate 0 deletes the old log immediately instead of keeping any history.");
  }

  if (compress) {
    directives.push("compress");
    if (delaycompress) directives.push("delaycompress");
  } else if (delaycompress) {
    warnings.push("delaycompress does nothing without compress — it was ignored.");
  }

  if (missingok) directives.push("missingok");
  if (notifempty) directives.push("notifempty");
  if (dateext) directives.push("dateext");

  if (copytruncate) {
    directives.push("copytruncate");
    warnings.push(
      "copytruncate copies then truncates in place: log lines written between the copy and the truncate are lost. Prefer create + a reload signal when the daemon supports reopening its log.",
    );
    if (useCreate) {
      warnings.push("create is ignored when copytruncate is used — the original file is never removed. It was left out.");
    }
  } else if (useCreate) {
    const mode = String(createMode ?? "").trim();
    const user = String(createUser ?? "").trim();
    const group = String(createGroup ?? "").trim();
    if (!MODE_PATTERN.test(mode)) return { error: "create mode must be 3 or 4 octal digits, e.g. 0640." };
    if (!NAME_PATTERN.test(user)) return { error: `"${user}" is not a valid user name for create.` };
    if (!NAME_PATTERN.test(group)) return { error: `"${group}" is not a valid group name for create.` };
    directives.push(`create ${mode} ${user} ${group}`);
  } else {
    warnings.push(
      "With neither create nor copytruncate, many daemons keep writing to the rotated (renamed) file until restarted.",
    );
  }

  const oldDirValue = String(olddir ?? "").trim();
  if (oldDirValue) {
    if (!oldDirValue.startsWith("/") && !oldDirValue.startsWith(".")) {
      return { error: "olddir must be an absolute path or a path relative to the log directory." };
    }
    directives.push(`olddir ${oldDirValue}`);
    warnings.push("olddir must already exist and (unless it is on the same device) createolddir may be needed — logrotate will not create it by default.");
  }

  const post = String(postrotate ?? "").trim();
  if (post) {
    if (sharedscripts) directives.push("sharedscripts");
    directives.push("postrotate");
    for (const line of post.split("\n")) directives.push(`    ${line.trim()}`);
    directives.push("endscript");
    if (copytruncate) {
      warnings.push("postrotate with copytruncate is unusual — copytruncate exists precisely to avoid signalling the daemon.");
    }
  }

  // Top-level directives indent 4 spaces; script lines (already prefixed with
  // 4 spaces above) end up at 8, nested inside postrotate...endscript.
  const body = directives.map((directive) => `    ${directive}`).join("\n");
  const config = `${path} {\n${body}\n}`;

  return {
    config,
    directiveCount: directives.filter((d) => !d.startsWith("    ")).length,
    warnings,
    installHint: `Save as /etc/logrotate.d/${suggestFileName(path)} and test with: logrotate -d /etc/logrotate.d/${suggestFileName(path)}`,
  };
}

/** Derive a sensible /etc/logrotate.d/ file name from the log path. */
export function suggestFileName(logPath) {
  const raw = String(logPath ?? "").trim();
  const parts = raw.split("/").filter(Boolean);
  // Prefer the directory name under /var/log, else the file stem.
  let candidate = "";
  const logIndex = parts.indexOf("log");
  if (logIndex >= 0 && parts.length > logIndex + 1) {
    candidate = parts[logIndex + 1];
  } else if (parts.length > 0) {
    candidate = parts[parts.length - 1];
  }
  candidate = candidate.replace(/\*.*$/, "").replace(/\.[a-z0-9]+$/i, "").replace(/[^A-Za-z0-9._-]/g, "");
  return candidate || "myapp";
}
