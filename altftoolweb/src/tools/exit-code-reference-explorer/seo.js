const seo = {
  intro:
    "This explorer decodes any process exit code from 0 to 255 into its meaning — POSIX shell conventions (126 not executable, 127 not found), the BSD sysexits.h EX_* block (64–78), and the 128+N rule that turns a signal death into a code, so 137 is decoded as 128 + SIGKILL(9). It is built for developers and SREs staring at echo $?, a failed CI step or a crashed container status and needing the cause in one lookup.",
  useCases: [
    "An SRE whose Kubernetes pod shows exit code 137 and needs to confirm it was SIGKILL — usually the OOM killer — before raising memory limits",
    "A developer whose CI job dies with 127 and wants to distinguish command-not-found from 126 permission problems",
    "A CLI author choosing structured failure codes and checking what sysexits.h reserves 64 through 78 for",
  ],
  benefits: [
    ["Signal maths done for you", "Any code above 128 is decomposed into 128 + N and named from the Linux signal table."],
    ["Container context", "Codes like 137, 139 and 143 include what they mean specifically in Docker and Kubernetes."],
    ["Out-of-range handling", "Enter exit(-1) or exit(300) and the tool shows the wrapped mod-256 value the shell actually reports."],
  ],
  faqs: [
    [
      "What does exit code 137 mean?",
      "Exit code 137 means the process was killed by SIGKILL (signal 9), because shells report death-by-signal-N as 128 + N and 128 + 9 = 137. In Docker and Kubernetes it almost always indicates the kernel OOM killer terminated the container for exceeding its memory limit — check kubectl describe pod for an OOMKilled reason.",
    ],
    [
      "What is the difference between exit code 126 and 127?",
      "127 means the shell could not find the command at all — a typo or a binary missing from PATH — while 126 means the command was found but could not be executed, usually a missing execute permission bit or a binary built for the wrong architecture. Both are defined by POSIX shell behaviour.",
    ],
    [
      "What does exit code 139 mean?",
      "Exit code 139 is a segmentation fault: 128 + 11, where signal 11 is SIGSEGV. The program accessed memory it was not allowed to touch — a bug in the binary or a native library, not in the shell or container runtime.",
    ],
    [
      "What is the maximum exit code a process can return?",
      "255. POSIX defines the exit status as one unsigned byte, so values outside 0–255 wrap modulo 256 — exit(-1) reports 255 and exit(256) reports 0. If your program needs to convey more than that, write to stderr or a file instead of overloading the status byte.",
    ],
  ],
};

export default seo;
