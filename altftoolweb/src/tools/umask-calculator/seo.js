const seo = {
  title: "Umask Calculator - File and Directory Permissions",
  metaDescription:
    "See the modes any umask yields - files 666 & ~umask, directories 777 & ~umask - with presets 022, 002, 027, 077 and a reverse lookup from a target mode.",
  steps: [
    "Enter an octal mask (up to 4 digits) in the \"Umask value\" field, or click a Common values preset: 022, 002, 027, 077 or 000.",
    "Read \"New files get\" (666 & ~umask) and \"New directories get\" (777 & ~umask) in octal and symbolic form, with per-class removed bits and a warning when the mask leaves files world-writable.",
    "Click \"Copy result\" to copy the umask plus both resulting modes, or type a 3-digit target into \"Directory mode you want\" for the reverse lookup — it answers with \"Use umask N\" and the file mode that follows.",
  ],
  intro:
    "This calculator shows the exact permissions any umask value produces, using the POSIX rule that new files get 666 & ~umask and new directories get 777 & ~umask. It is built for Linux and Unix administrators tuning /etc/login.defs, shell profiles or systemd UMask= settings, and it also works backwards — enter the directory mode you want and get the umask that produces it.",
  useCases: [
    "Checking why new files come out 664 instead of 644 and confirming the shell umask is 002 rather than 022",
    "Hardening a server by testing umask 027 or 077 before writing it into /etc/login.defs or a service's UMask= directive",
    "Setting up a shared group directory and working backwards from the target mode 2775 to the umask 002 that supports it",
  ],
  benefits: [
    ["Files and directories together", "Shows both results at once, since the 666 and 777 bases give different outcomes for the same umask."],
    ["Reverse lookup", "Enter the directory mode you want and get the umask that yields it, plus the file mode that follows."],
    ["Danger flags", "Warns when a umask leaves files world-writable or strips permissions from the owner."],
  ],
  faqs: [
    [
      "What permissions does umask 022 give?",
      "New files get 644 (rw-r--r--) and new directories get 755 (rwxr-xr-x). The mask clears the write bit for group and others: 666 & ~022 = 644 for files, 777 & ~022 = 755 for directories. 022 is the default on most Linux distributions.",
    ],
    [
      "Why do new files never have execute permission regardless of umask?",
      "Because programs request mode 666, not 777, when creating regular files — the execute bit is absent before the umask is even applied, and a umask can only remove bits, never add them. Directories are requested at 777, which is why they do end up executable (searchable).",
    ],
    [
      "What is the difference between umask 022 and 002?",
      "022 removes group write, giving files 644 and directories 755; 002 keeps group write, giving 664 and 775. Distributions using user-private groups (Debian, Ubuntu, Fedora) often default to 002 because each user has their own primary group, making group write harmless for personal files.",
    ],
    [
      "Is umask 077 more secure?",
      "Yes for confidentiality — 077 gives files 600 and directories 700, so only the owner has any access. It is common on hardened servers and for service accounts, but on shared project machines it breaks group collaboration, so teams usually pick 027 as a middle ground.",
    ],
  ],
};

export default seo;
