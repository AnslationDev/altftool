const seo = {
  title: "Tar Command Builder – GNU tar with Correct Flag Order",
  metaDescription:
    "Assemble GNU tar commands to create, extract or list archives — compression, --exclude placement, -C and quoting handled, every flag explained.",
  steps: [
    "Pick a Mode (Create, Extract or List), name the \"Archive file\" and choose Compression — \"Auto (from file extension)\" reads the filter from the filename.",
    "Add \"Paths to archive (one per line)\" or the -C directory, \"Exclude patterns (one per line)\", and toggles like \"Verbose (-v)\" or \"Preserve permissions (-p)\".",
    "Copy the assembled GNU tar line with \"Copy command\" and check the \"What each flag does\" table beneath it.",
  ],
  intro:
    "This builder assembles a ready-to-run GNU tar command for creating, extracting or listing an archive, with the compression filter, exclude patterns and quoting worked out for you. It follows the flag semantics documented in GNU tar 1.35, including the rule that --exclude must appear before the member names and that -C changes directory for everything after it. Useful for anyone who writes backup scripts occasionally and re-reads the man page every time.",
  useCases: [
    "Packing a website directory into a gzip tarball while skipping node_modules and log files",
    "Extracting a release tarball straight into /opt and dropping its wrapper folder with --strip-components=1",
    "Listing the contents of an archive you did not create before you let it write anything to disk",
  ],
  benefits: [
    ["Correct flag order", "Position-sensitive options like --exclude and -C are placed where GNU tar actually honours them."],
    ["Safe quoting", "Paths with spaces or brackets are wrapped in POSIX single quotes so the shell cannot re-split them."],
    ["Every flag explained", "Each option in the generated line comes with a one-line description, so you learn the command rather than just paste it."],
  ],
  faqs: [
    [
      "What is the difference between tar -czf and tar -cJf?",
      "-z pipes the archive through gzip and -J through xz. gzip is faster and available everywhere; xz usually produces a file 20-40% smaller but takes far longer and needs much more memory to compress.",
    ],
    [
      "How do I extract a tar.gz into a specific folder?",
      "Use tar -xzf archive.tar.gz -C /target/dir. The target directory must already exist — tar will not create it — and without -C the archive unpacks into your current working directory.",
    ],
    [
      "What does --strip-components=1 do?",
      "It removes the first path component from every member as it is extracted, which is how you unpack a release tarball that wraps everything in a project-1.2.3/ folder directly into the current directory.",
    ],
    [
      "Why does tar say 'Removing leading / from member names'?",
      "GNU tar strips the leading slash from absolute paths so an archive can never overwrite system files on extraction. To avoid the warning, cd into the parent with -C and add relative paths instead.",
    ],
  ],
};

export default seo;
