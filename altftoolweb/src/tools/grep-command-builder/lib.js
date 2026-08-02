/**
 * Grep / ripgrep command builder.
 *
 * Flag mappings follow the GNU grep manual (GNU grep 3.x, `man grep`) and the
 * ripgrep 14.x help (`rg --help`). Every emitted flag is documented next to the
 * constant that produces it.
 */

/**
 * Short flags shared by GNU grep and ripgrep, emitted in this fixed order so the
 * same input always yields the same command string.
 * Sources: GNU grep manual §2.1 "Generic Program Information" / "Matching Control";
 * ripgrep --help.
 */
export const COMMON_FLAGS = [
  { key: "ignoreCase", flag: "i", label: "Ignore case (-i)" },
  { key: "wordMatch", flag: "w", label: "Match whole words (-w)" },
  { key: "invertMatch", flag: "v", label: "Invert match (-v)" },
  { key: "fixedStrings", flag: "F", label: "Fixed string, not regex (-F)" },
  { key: "lineNumbers", flag: "n", label: "Show line numbers (-n)" },
  { key: "countOnly", flag: "c", label: "Count matches per file (-c)" },
  { key: "filesOnly", flag: "l", label: "List matching files only (-l)" },
];

/**
 * GNU grep needs -r to descend into directories; ripgrep recurses by default and
 * instead offers --no-recursive-like behaviour via `rg pattern file` or -d 1.
 * Source: GNU grep manual §2.1.3 (-r/--recursive); rg --help ("recursively searches").
 */
export const GREP_RECURSIVE_FLAG = "r";

/** ripgrep skips hidden files by default; --hidden re-enables them (rg --help). */
export const RG_HIDDEN_FLAG = "--hidden";

/** ripgrep smart case: case-insensitive unless the pattern has an upper-case letter (-S). */
export const RG_SMART_CASE_FLAG = "-S";

/** GNU grep -E selects POSIX extended regular expressions (grep manual §2.1.2). */
export const GREP_EXTENDED_FLAG = "E";

/**
 * Characters that are safe unquoted in POSIX shells. Anything else gets wrapped
 * in single quotes with embedded single quotes escaped as '\'' (POSIX.1-2017
 * §2.2.2 Single-Quotes).
 */
const SAFE_UNQUOTED = /^[A-Za-z0-9_./:=@%^,+-]+$/;

/** Quote a value for a POSIX shell. Empty string becomes ''. */
export function shellQuote(value) {
  const str = String(value);
  if (str === "") return "''";
  if (SAFE_UNQUOTED.test(str)) return str;
  return `'${str.replace(/'/g, `'\\''`)}'`;
}

/** Split a comma or newline separated glob list into trimmed, non-empty globs. */
export function parseGlobList(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split(/[\n,]/)
    .map((glob) => glob.trim())
    .filter(Boolean);
}

/**
 * Build a grep or ripgrep command line.
 *
 * @param {object} input
 * @param {"grep"|"ripgrep"} input.engine
 * @param {string} input.pattern           Search pattern (regex unless fixedStrings).
 * @param {string} [input.searchPath]      File or directory to search; defaults to ".".
 * @param {boolean} [input.ignoreCase]
 * @param {boolean} [input.wordMatch]
 * @param {boolean} [input.invertMatch]
 * @param {boolean} [input.fixedStrings]
 * @param {boolean} [input.lineNumbers]
 * @param {boolean} [input.countOnly]
 * @param {boolean} [input.filesOnly]
 * @param {boolean} [input.recursive]      grep only; ripgrep recurses by default.
 * @param {boolean} [input.extendedRegex]  grep only (-E).
 * @param {boolean} [input.hidden]         ripgrep only (--hidden).
 * @param {boolean} [input.smartCase]      ripgrep only (-S).
 * @param {number}  [input.contextBefore]  Lines of leading context (-B N).
 * @param {number}  [input.contextAfter]   Lines of trailing context (-A N).
 * @param {string}  [input.includeGlobs]   Comma/newline separated globs to include.
 * @param {string}  [input.excludeGlobs]   Comma/newline separated globs to exclude.
 * @returns {{command:string, notes:string[]}|{error:string}}
 */
export function buildGrepCommand({
  engine = "grep",
  pattern,
  searchPath = ".",
  ignoreCase = false,
  wordMatch = false,
  invertMatch = false,
  fixedStrings = false,
  lineNumbers = false,
  countOnly = false,
  filesOnly = false,
  recursive = true,
  extendedRegex = false,
  hidden = false,
  smartCase = false,
  contextBefore = 0,
  contextAfter = 0,
  includeGlobs = "",
  excludeGlobs = "",
}) {
  if (engine !== "grep" && engine !== "ripgrep") {
    return { error: "Choose either grep or ripgrep as the engine." };
  }
  if (typeof pattern !== "string" || pattern.trim() === "") {
    return { error: "Enter a search pattern — an empty pattern matches every line." };
  }

  const before = Number(contextBefore);
  const after = Number(contextAfter);
  if (!Number.isInteger(before) || before < 0 || !Number.isInteger(after) || after < 0) {
    return { error: "Context lines must be whole numbers of 0 or more." };
  }
  if (before > 9999 || after > 9999) {
    return { error: "Context lines above 9,999 are almost certainly a mistake." };
  }

  const flagState = {
    ignoreCase,
    wordMatch,
    invertMatch,
    fixedStrings,
    lineNumbers,
    countOnly,
    filesOnly,
  };

  const notes = [];
  if (countOnly && filesOnly) {
    notes.push(
      "-c and -l both suppress normal output; -l wins in GNU grep, so you rarely want both.",
    );
  }
  if (ignoreCase && smartCase && engine === "ripgrep") {
    notes.push("-i overrides -S in ripgrep; smart case has no effect when -i is set.");
  }

  const args = [];
  let shortFlags = "";

  if (engine === "grep") {
    if (recursive) shortFlags += GREP_RECURSIVE_FLAG;
    if (extendedRegex && !fixedStrings) shortFlags += GREP_EXTENDED_FLAG;
    if (extendedRegex && fixedStrings) {
      notes.push("-E is ignored because -F treats the pattern as a literal string.");
    }
  }

  for (const { key, flag } of COMMON_FLAGS) {
    if (flagState[key]) shortFlags += flag;
  }
  if (shortFlags) args.push(`-${shortFlags}`);

  if (engine === "ripgrep") {
    if (smartCase && !ignoreCase) args.push(RG_SMART_CASE_FLAG);
    if (hidden) args.push(RG_HIDDEN_FLAG);
  }

  // -C N when both context values are equal, otherwise -B / -A separately
  // (both grep and rg accept -A/-B/-C with the same meaning).
  if (before > 0 && before === after) {
    args.push(`-C ${before}`);
  } else {
    if (before > 0) args.push(`-B ${before}`);
    if (after > 0) args.push(`-A ${after}`);
  }

  const includes = parseGlobList(includeGlobs);
  const excludes = parseGlobList(excludeGlobs);

  if (engine === "grep") {
    // GNU grep: --include/--exclude apply while descending directories (-r).
    for (const glob of includes) args.push(`--include=${shellQuote(glob)}`);
    // --exclude only ever matches a file's basename, never a full path, so a
    // glob containing "/" (e.g. "node_modules/**") can never match anything
    // via --exclude. Directories must instead be pruned with --exclude-dir,
    // which takes a bare directory name/glob (GNU grep manual §2.1.3). Peel
    // the directory name off common "DIR/**" / "DIR/" shaped globs and emit
    // --exclude-dir for those; anything else keeps using --exclude.
    for (const glob of excludes) {
      const dirName = glob.replace(/\/\*\*$/, "").replace(/\/$/, "");
      if (dirName && dirName !== glob) {
        args.push(`--exclude-dir=${shellQuote(dirName)}`);
      } else if (glob.includes("/")) {
        args.push(`--exclude=${shellQuote(glob)}`);
        notes.push(
          `"${glob}" contains a "/", but --exclude only matches a file's basename and will never match it; use a directory name (e.g. "${glob.split("/")[0]}/**") for --exclude-dir, or a bare filename glob.`,
        );
      } else {
        args.push(`--exclude=${shellQuote(glob)}`);
      }
    }
    if ((includes.length || excludes.length) && !recursive) {
      notes.push(
        "--include and --exclude only take effect while grep descends directories; add -r for them to matter.",
      );
    }
  } else {
    // ripgrep: -g GLOB includes, -g !GLOB excludes (rg --help, --glob).
    for (const glob of includes) args.push(`-g ${shellQuote(glob)}`);
    for (const glob of excludes) args.push(`-g ${shellQuote(`!${glob}`)}`);
  }

  // A pattern starting with "-" would be parsed as a flag; both tools accept
  // -e PATTERN to disambiguate (grep manual §2.1.1; rg --help -e/--regexp).
  const quotedPattern = shellQuote(pattern);
  if (pattern.startsWith("-")) {
    args.push(`-e ${quotedPattern}`);
  } else {
    args.push(quotedPattern);
  }

  // Same hazard as the pattern above: a search path starting with "-" would
  // otherwise be parsed as a flag. Neither tool has a path-specific escape
  // like -e, so use "--" to mark the end of options instead (GNU grep manual
  // §2.1, "--"; rg --help, same POSIX convention).
  const path = typeof searchPath === "string" && searchPath.trim() !== "" ? searchPath.trim() : ".";
  if (path.startsWith("-")) {
    args.push("--", shellQuote(path));
  } else {
    args.push(shellQuote(path));
  }

  const binary = engine === "ripgrep" ? "rg" : "grep";
  return { command: `${binary} ${args.join(" ")}`, notes };
}
