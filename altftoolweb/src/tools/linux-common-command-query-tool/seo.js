const seo = {
  title: "Linux Command Search: 69 Commands with Examples",
  metaDescription:
    "Search 69 Linux commands by name, alias or what they do - exact names rank first. Each entry shows a man-page synopsis and copy-ready examples.",
  steps: [
    "Type into the Search box — 'compress, permissions, find files…' — or narrow the list with the Category dropdown.",
    "Exact command names outrank description matches, so cp returns cp; press Star on the entries you keep forgetting.",
    "Each result shows its usage synopsis and copy-ready examples with their own Copy buttons, and Copy cheat sheet copies every starred command with its category, usage, examples and see-also list.",
  ],
  intro:
    "The Linux Common Command Query Tool is a searchable reference for 69 everyday Linux commands, ranked by how well they match what you typed: an exact command name always outranks a match buried in a description, so typing \"cp\" returns cp rather than every command that mentions copying. Each entry carries a one-line description, a usage synopsis in manual-page form (square brackets mark optional arguments), worked examples you can copy into a shell, and related commands. Star the ones you keep forgetting and copy them out as a plain-text cheat sheet.",
  useCases: [
    "Recall the exact tar flags for creating versus extracting an archive without opening a man page.",
    "Find which command lists listening ports when you cannot remember whether it is ss, netstat or lsof.",
    "Build a starred cheat sheet of the ten commands a new team member needs on day one.",
  ],
  benefits: [
    ["Ranked search", "Name matches score 200, keywords 25 and descriptions 12, so the obvious answer comes first."],
    ["Copy-ready examples", "Every example is a complete command line, not a fragment with placeholders."],
    ["Works offline", "The whole table ships with the page — no API call, no account, no tracking."],
  ],
  faqs: [
    [
      "How do I extract a .tar.gz file?",
      "Run `tar -xzvf archive.tar.gz`. The flags read as extract (x), gzip (z), verbose (v), file (f); swap x for c to create one, as in `tar -czvf site.tar.gz site/`. Add `-C /target/dir` to extract somewhere other than the current directory.",
    ],
    [
      "What replaced ifconfig and netstat?",
      "The iproute2 suite: `ip addr show` replaces ifconfig and `ss -tulpn` replaces netstat -tulpn. Both ship by default on current Debian, Ubuntu, Fedora and RHEL, where ifconfig and netstat often are not installed at all.",
    ],
    [
      "What do the numbers in chmod 755 mean?",
      "Each digit is a three-bit permission set for owner, group and everyone else, where read is 4, write is 2 and execute is 1. So 755 means the owner can read, write and execute (4+2+1), while group and others can read and execute (4+1); 644 is the usual mode for a plain file.",
    ],
    [
      "Which command shows what is using my disk space?",
      "`du -h --max-depth=1 /home | sort -h` lists each subdirectory by size, largest last, while `df -h` shows how full each mounted filesystem is. Use df first to find the full filesystem, then du inside it to find the culprit.",
    ],
  ],
};

export default seo;
