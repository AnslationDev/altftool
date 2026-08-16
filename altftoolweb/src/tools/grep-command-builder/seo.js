const seo = {
  title: "Grep & Ripgrep Command Builder: Safe Quoting",
  metaDescription:
    "Build a grep or ripgrep command from checkboxes — case, whole word, -A/-B context, include/exclude globs — with POSIX single-quote escaping done for you.",
  steps: [
    "Pick GNU grep or ripgrep (rg) from the Engine dropdown, type your Search pattern and the File or directory to search, and set Context lines before (-B), Context lines after (-A) and comma-separated Include and Exclude globs.",
    "Tick the Matching and output flags checkboxes; grep-only options like Recurse into directories (-r) and Extended regex (-E) swap for ripgrep's Search hidden files (--hidden) and Smart case (-S) when you switch engine.",
    "The quoted command appears under Your command with plain-language notes on conflicting flags; press Copy command to put it on the clipboard or Reset to restore the defaults.",
  ],
  intro:
    "This builder assembles a ready-to-paste grep or ripgrep command from checkboxes for case handling, whole-word matching, context lines (-A/-B/-C), include and exclude globs, and output modes like -l and -c. Every pattern and glob is quoted with POSIX single-quote rules, so patterns containing spaces, apostrophes or shell metacharacters run exactly as written. It is built for developers and sysadmins who know what they want to find but not which flag spelling GNU grep or rg uses for it.",
  useCases: [
    "Searching a JavaScript repo for TODO or FIXME comments while excluding node_modules and limiting matches to *.js and *.jsx files",
    "Building a case-insensitive whole-word grep over /var/log with two lines of context around each hit for incident triage",
    "Converting a familiar GNU grep invocation into its ripgrep equivalent, including -g glob syntax and the --hidden flag",
  ],
  benefits: [
    ["Safe shell quoting", "Patterns with quotes, spaces or metacharacters are wrapped using POSIX single-quote escaping automatically."],
    ["Both engines", "The same options render as GNU grep flags (--include, -r, -E) or ripgrep flags (-g, -S, --hidden) with one switch."],
    ["Flag conflicts flagged", "Combinations like -c with -l or -E with -F produce a plain-language warning instead of silent surprises."],
  ],
  faqs: [
    [
      "How do I grep recursively but only in certain file types?",
      "Use grep -r --include='*.ext' PATTERN DIR, or with ripgrep rg -g '*.ext' PATTERN DIR. GNU grep's --include and --exclude filters only apply while it is descending directories, so they need -r to have any effect; ripgrep recurses and respects .gitignore by default.",
    ],
    [
      "What is the difference between grep -A, -B and -C?",
      "-A N prints N lines after each match, -B N prints N lines before it, and -C N prints N lines on both sides. -C N is exactly equivalent to -A N -B N, which is why this builder collapses equal before/after values into a single -C flag.",
    ],
    [
      "How do I search for a pattern that starts with a dash?",
      "Pass it with -e, for example grep -e '-foo' file, otherwise grep parses the pattern as a flag and errors. Both GNU grep and ripgrep support -e/--regexp for this, and the builder adds it automatically whenever your pattern begins with a hyphen.",
    ],
    [
      "Does ripgrep search hidden files and gitignored files?",
      "Not by default. ripgrep skips hidden files and directories and anything matched by .gitignore; add --hidden to include hidden files and --no-ignore to bypass ignore files, or -uu as a shorthand for both. GNU grep has no such filtering and searches whatever it is pointed at.",
    ],
  ],
};

export default seo;
