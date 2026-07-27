/**
 * Pure tar command composition.
 *
 * Flag semantics follow GNU tar 1.35 (`man 1 tar` / `tar --help`). The short
 * options used here (-c, -x, -t, -f, -v, -p, -C, -k, -h, -S) are also accepted
 * by bsdtar/libarchive, so the generated commands run on Linux and macOS.
 * No shell is invoked anywhere in this module — it only builds a string.
 */

/** Operating modes. Exactly one of these must be present in a tar invocation. */
export const MODES = [
  {
    id: "create",
    flag: "c",
    label: "Create",
    summary: "Create a new archive from the paths you list.",
  },
  {
    id: "extract",
    flag: "x",
    label: "Extract",
    summary: "Unpack an existing archive onto disk.",
  },
  {
    id: "list",
    flag: "t",
    label: "List",
    summary: "Print the table of contents without writing any file.",
  },
];

/**
 * Compression filters. `short` is the single-letter form that can be clustered
 * with the other short flags; `long` is used when tar has no short letter.
 * --zstd was added in GNU tar 1.31 (2019), so it is flagged as newer.
 */
export const COMPRESSIONS = [
  {
    id: "none",
    short: "",
    long: "",
    canonicalExtension: ".tar",
    extensions: [".tar"],
    label: "None (.tar)",
    note: "No compression. Fastest, largest output — right for already-compressed media.",
  },
  {
    id: "gzip",
    short: "z",
    long: "--gzip",
    canonicalExtension: ".tar.gz",
    extensions: [".tar.gz", ".tgz"],
    label: "gzip (.tar.gz)",
    note: "Universally available and fast. The safe default for anything you will share.",
  },
  {
    id: "bzip2",
    short: "j",
    long: "--bzip2",
    canonicalExtension: ".tar.bz2",
    extensions: [".tar.bz2", ".tbz2", ".tbz"],
    label: "bzip2 (.tar.bz2)",
    note: "Smaller than gzip but noticeably slower to compress and decompress.",
  },
  {
    id: "xz",
    short: "J",
    long: "--xz",
    canonicalExtension: ".tar.xz",
    extensions: [".tar.xz", ".txz"],
    label: "xz (.tar.xz)",
    note: "Best ratio of the classics; compression is memory hungry and slow.",
  },
  {
    id: "zstd",
    short: "",
    long: "--zstd",
    canonicalExtension: ".tar.zst",
    extensions: [".tar.zst", ".tzst"],
    label: "zstd (.tar.zst)",
    note: "Near-gzip speed with xz-like ratios. Needs GNU tar 1.31+ and the zstd binary.",
  },
];

/** Highest supported value for --strip-components; deeper is almost always a mistake. */
export const MAX_STRIP_COMPONENTS = 20;

/** Characters that never need shell quoting in POSIX sh. */
const SAFE_ARG = /^[A-Za-z0-9_@%+=:,./-]+$/;

/** Quote a single shell argument using POSIX single-quote escaping. */
export function shellQuote(value) {
  const raw = String(value ?? "").trim();
  if (raw === "") return "''";
  if (SAFE_ARG.test(raw)) return raw;
  return `'${raw.replace(/'/g, `'\\''`)}'`;
}

/** Split a textarea into a clean list of non-empty lines. */
export function toList(value) {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getMode(id) {
  return MODES.find((mode) => mode.id === id) ?? null;
}

export function getCompression(id) {
  return COMPRESSIONS.find((item) => item.id === id) ?? null;
}

/**
 * Infer the compression filter from an archive file name.
 * Returns null when the extension is not a recognised tar extension.
 */
export function detectCompression(archive) {
  const name = String(archive ?? "").trim().toLowerCase();
  if (!name) return null;
  for (const item of COMPRESSIONS) {
    if (item.id === "none") continue;
    if (item.extensions.some((ext) => name.endsWith(ext))) return item.id;
  }
  if (name.endsWith(".tar")) return "none";
  return null;
}

/**
 * Build a tar command line.
 *
 * @returns {{command:string, flags:Array<[string,string]>, warnings:string[],
 *            mode:string, compression:string}} or {error:string}
 */
export function buildTarCommand(options = {}) {
  const {
    mode = "create",
    archive = "",
    sources = [],
    compression = "auto",
    verbose = false,
    preservePermissions = false,
    keepOldFiles = false,
    followSymlinks = false,
    sparse = false,
    showProgress = false,
    changeDir = "",
    stripComponents = 0,
    excludes = [],
  } = options;

  const modeSpec = getMode(mode);
  if (!modeSpec) return { error: "Choose create, extract or list as the tar mode." };

  const archivePath = String(archive ?? "").trim();
  if (!archivePath) return { error: "Enter an archive file name, for example backup.tar.gz." };

  const sourceList = Array.isArray(sources) ? sources.map((s) => String(s).trim()).filter(Boolean) : [];
  if (modeSpec.id === "create" && sourceList.length === 0) {
    return { error: "Creating an archive needs at least one file or directory to add." };
  }

  const strip = Number(stripComponents);
  if (!Number.isFinite(strip) || !Number.isInteger(strip) || strip < 0) {
    return { error: "Strip components must be a whole number of 0 or more." };
  }
  if (strip > MAX_STRIP_COMPONENTS) {
    return { error: `Strip components above ${MAX_STRIP_COMPONENTS} would discard the whole path.` };
  }

  const detected = detectCompression(archivePath);
  const resolvedId = compression === "auto" ? detected ?? "none" : compression;
  const comp = getCompression(resolvedId);
  if (!comp) return { error: "Choose a supported compression filter." };

  const excludeList = Array.isArray(excludes) ? excludes.map((e) => String(e).trim()).filter(Boolean) : [];
  const dir = String(changeDir ?? "").trim();

  const flags = [];
  const parts = ["tar"];

  // Long-form compression filters cannot join the short cluster.
  if (comp.long && !comp.short) {
    parts.push(comp.long);
    flags.push([comp.long, `Filter the archive through ${comp.id}.`]);
  }

  let cluster = modeSpec.flag;
  flags.push([`-${modeSpec.flag}`, modeSpec.summary]);

  if (comp.short) {
    cluster += comp.short;
    flags.push([`-${comp.short}`, `Filter the archive through ${comp.id}.`]);
  }
  if (verbose) {
    cluster += "v";
    flags.push(["-v", "List each member as it is processed."]);
  }
  if (modeSpec.id === "extract" && preservePermissions) {
    cluster += "p";
    flags.push(["-p", "Restore stored permission bits (already the default for root)."]);
  }
  if (modeSpec.id === "extract" && keepOldFiles) {
    cluster += "k";
    flags.push(["-k", "Never overwrite an existing file; skip it instead."]);
  }
  if (modeSpec.id === "create" && followSymlinks) {
    cluster += "h";
    flags.push(["-h", "Follow symlinks and store the file they point to."]);
  }
  if (modeSpec.id === "create" && sparse) {
    cluster += "S";
    flags.push(["-S", "Store sparse files efficiently instead of writing the holes."]);
  }
  cluster += "f";
  flags.push(["-f", "Use the named archive file rather than the default tape device."]);
  parts.push(`-${cluster}`);
  parts.push(shellQuote(archivePath));

  if (showProgress) {
    parts.push("--checkpoint=1000", "--checkpoint-action=dot");
    flags.push(["--checkpoint", "Print one dot every 1000 records as a cheap progress bar."]);
  }

  // --exclude is position sensitive in GNU tar: it must precede the member names.
  for (const pattern of excludeList) {
    parts.push(`--exclude=${shellQuote(pattern)}`);
  }
  if (excludeList.length > 0) {
    flags.push(["--exclude", "Skip any path matching the glob pattern."]);
  }

  if (modeSpec.id === "extract") {
    if (strip > 0) {
      parts.push(`--strip-components=${strip}`);
      flags.push(["--strip-components", `Drop the first ${strip} leading path component(s) on extract.`]);
    }
    if (dir) {
      parts.push("-C", shellQuote(dir));
      flags.push(["-C", "Change to this directory before extracting."]);
    }
  }

  if (modeSpec.id === "create") {
    if (dir) {
      parts.push("-C", shellQuote(dir));
      flags.push(["-C", "Change to this directory before reading the paths that follow."]);
    }
    for (const source of sourceList) parts.push(shellQuote(source));
  }

  if (modeSpec.id === "list" && sourceList.length > 0) {
    for (const source of sourceList) parts.push(shellQuote(source));
  }

  const warnings = [];
  if (compression !== "auto" && detected && detected !== comp.id) {
    warnings.push(
      `The file name looks like ${detected} but you picked ${comp.id}. Rename it to ${comp.canonicalExtension} so the archive is self-describing.`,
    );
  }
  if (compression === "auto" && detected === null) {
    warnings.push(
      `"${archivePath}" has no recognised tar extension, so no compression filter was added. Add ${COMPRESSIONS[1].canonicalExtension} to compress with gzip.`,
    );
  }
  if (modeSpec.id === "create" && sourceList.some((s) => s.startsWith("/"))) {
    warnings.push(
      "Absolute source paths make tar strip the leading slash and warn. Use -C to change directory and add relative paths instead.",
    );
  }
  if (modeSpec.id === "create" && dir && sourceList.some((s) => s.startsWith("/"))) {
    warnings.push("With -C set, the paths after it are resolved inside that directory, not from /.");
  }
  if (modeSpec.id === "extract" && !dir) {
    warnings.push(
      "Without -C the archive unpacks into your current working directory. List it first with -t if you did not create it.",
    );
  }
  if (modeSpec.id === "extract" && preservePermissions) {
    warnings.push("-p only restores setuid and group bits meaningfully when tar runs as root.");
  }
  if (comp.id === "zstd") {
    warnings.push("--zstd needs GNU tar 1.31 or newer plus the zstd binary; older hosts must pipe through zstd -d.");
  }
  if (modeSpec.id === "create" && followSymlinks) {
    warnings.push("-h can duplicate data or loop forever if a symlink points at an ancestor directory.");
  }

  return {
    command: parts.join(" "),
    flags,
    warnings,
    mode: modeSpec.id,
    compression: comp.id,
    archiveExtensionHint: comp.canonicalExtension,
    memberCount: sourceList.length,
  };
}
