const seo = {
  intro:
    "This calculator converts Unix file permissions between numeric octal form (755) and symbolic rwx form (rwxr-xr-x), using the POSIX weights read=4, write=2, execute=1 for each of owner, group and others, plus the setuid (4), setgid (2) and sticky (1) bits in a leading fourth digit. It is built for Linux and macOS users setting modes with chmod who want to see exactly what a number grants — with warnings for risky combinations like world-writable or setuid files.",
  useCases: [
    "Reading an ls -l line like -rwsr-xr-x and confirming it means mode 4755 with setuid before touching a system binary",
    "Fixing SSH errors by checking that a private key needs chmod 600 while ~/.ssh itself needs 700",
    "Setting up a shared project directory and building 2775 (setgid + group-writable) with the checkbox grid",
  ],
  benefits: [
    ["Both directions", "Type octal or symbolic, or tick the grid — all three stay in sync instantly."],
    ["Special bits included", "Handles setuid, setgid and sticky, including the s/S and t/T distinction ls uses."],
    ["Risk warnings", "Flags world-writable files, setuid-plus-write holes and other modes that are almost never intended."],
  ],
  faqs: [
    [
      "What does chmod 755 mean?",
      "755 gives the owner read, write and execute (7 = 4+2+1), and gives group and others read and execute (5 = 4+1) — shown symbolically as rwxr-xr-x. It is the standard mode for directories and executable scripts that everyone may run but only the owner may change.",
    ],
    [
      "What is the difference between chmod 644 and 600?",
      "644 (rw-r--r--) lets the owner read and write while everyone else can read; 600 (rw-------) cuts off all access for group and others. Private material such as SSH private keys must be 600 — OpenSSH refuses keys that are readable by others.",
    ],
    [
      "What does the fourth digit in chmod 4755 do?",
      "The leading digit holds the special bits: setuid=4, setgid=2, sticky=1. 4755 sets setuid, so the program runs with the file owner's user ID regardless of who launches it — this is how passwd works. ls shows it as rwsr-xr-x, with s replacing the owner's x.",
    ],
    [
      "What does a capital S or T mean in ls -l output?",
      "A capital letter means the special bit is set but the matching execute bit is not. Lower-case s or t means both are set. For example rw-r-Sr-- is mode 2644 — setgid on a file with no group execute — which is usually a mistake worth fixing.",
    ],
  ],
};

export default seo;
