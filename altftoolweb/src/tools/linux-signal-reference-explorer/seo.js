const seo = {
  title: "Linux Signal Reference: Numbers, Exit Codes, PID 1",
  metaDescription:
    "Look up all 31 signal(7) signals by number, name or keyword — default action, catchability, 128+N exit code, kill command, and PID 1 container notes.",
  steps: [
    "Type a signal number, name or keyword — e.g. 9, SIGTERM, ctrl+c or seccomp — into the \"Signal number, name or keyword\" field, or tap a quick chip such as SIGKILL or SIGSEGV.",
    "Read the Best match card: the signal's default action, whether it is catchable/blockable, the 128+N shell exit code when fatal, and the kill -N command to send it.",
    "Click \"Copy result\" to copy the signal summary, or click any name in the \"All 31 standard signals\" table to load that signal's details.",
  ],
  intro:
    "This explorer documents all 31 standard Linux signals from the signal(7) man page — number, default action (terminate, core dump, ignore, stop or continue), whether the signal can be caught, and the 128+N exit code a shell reports when it kills a process. It is written for developers and SREs debugging killed processes, container shutdowns and CI failures, including PID 1 behaviour that makes docker stop hang on naive entrypoints.",
  useCases: [
    "An engineer whose container ignores docker stop and needs to understand why PID 1 discards an unhandled SIGTERM",
    "A developer choosing between SIGTERM and SIGKILL for a graceful-shutdown design and checking which signals a handler can intercept",
    "An SRE mapping a crash exit code like 134, 139 or 152 back to the signal (SIGABRT, SIGSEGV, SIGXCPU) that caused it",
  ],
  benefits: [
    ["Complete signal(7) data", "All 31 standard signals with default action, catchability and typical cause in one searchable table."],
    ["Exit code cross-reference", "Every fatal signal shows its 128+N shell exit code, so 137 and SIGKILL are one lookup apart."],
    ["Container-aware notes", "Covers OOM kills, seccomp SIGSYS deaths, zombie reaping and the Docker and Kubernetes stop sequences."],
  ],
  faqs: [
    [
      "What is the difference between SIGTERM and SIGKILL?",
      "SIGTERM (signal 15) is a polite, catchable termination request — a process can trap it, finish work and exit cleanly. SIGKILL (signal 9) cannot be caught, blocked or ignored: the kernel terminates the process immediately with no cleanup. That is why docker stop sends SIGTERM first and only escalates to SIGKILL after the grace period (10 seconds by default, 30 in Kubernetes).",
    ],
    [
      "Which Linux signals cannot be caught or ignored?",
      "Exactly two: SIGKILL (9) and SIGSTOP (19). Every other signal can have a handler installed or be blocked. This is by design, so an administrator can always terminate or suspend a runaway process no matter what it does.",
    ],
    [
      "Why doesn't my Docker container stop with SIGTERM?",
      "Because your process runs as PID 1, and the kernel only delivers a signal to PID 1 if the process installed a handler for it — an unhandled SIGTERM is silently discarded. Fix it by handling SIGTERM in your application, using an init shim like tini (docker run --init), or using the shell exec form so your binary, not a shell, is PID 1.",
    ],
    [
      "What signal is Ctrl+C and what exit code does it produce?",
      "Ctrl+C sends SIGINT, signal 2, to the foreground process group. If the process dies from it, the shell reports exit code 130 — 128 plus the signal number. Ctrl+Z sends SIGTSTP (suspend) and Ctrl+\\ sends SIGQUIT, which also dumps core.",
    ],
  ],
};

export default seo;
