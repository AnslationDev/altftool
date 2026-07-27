/**
 * Linux signal reference.
 *
 * Rule sources:
 *
 *  - Signal numbers, default actions (Term / Core / Ign / Stop / Cont) and the rule
 *    that SIGKILL and SIGSTOP cannot be caught, blocked or ignored come from
 *    signal(7) in the Linux man-pages. Numbers listed are the x86-64 values; SIGBUS,
 *    SIGUSR1/2, SIGCHLD, SIGCONT, SIGSTOP and friends differ on Alpha/SPARC/MIPS.
 *
 *  - The 128+N exit code convention is POSIX shell behaviour ("Exit Status for
 *    Commands", IEEE 1003.1 §2.8.2).
 *
 *  - PID 1 behaviour: the kernel delivers a signal with a default (not handler-based)
 *    action to PID 1 only if the process installed a handler for it — an unhandled
 *    SIGTERM to PID 1 is silently discarded (kernel docs, prctl/init semantics). This
 *    is why `docker stop` appears to hang on naive entrypoint scripts.
 *
 *  - docker stop sends SIGTERM, waits a grace period (10 s default), then SIGKILL.
 *    Kubernetes does the same with terminationGracePeriodSeconds (30 s default).
 */

/** POSIX: shells report death-by-signal-N as 128 + N. */
export const SIGNAL_EXIT_BASE = 128;

/** docker stop default grace period, seconds (Docker CLI docs). */
export const DOCKER_STOP_GRACE_SECONDS = 10;

/** Kubernetes terminationGracePeriodSeconds default (K8s pod lifecycle docs). */
export const K8S_GRACE_SECONDS = 30;

export const DEFAULT_ACTIONS = {
  Term: "Terminate the process",
  Core: "Terminate and dump core",
  Ign: "Ignored",
  Stop: "Stop (suspend) the process",
  Cont: "Continue if stopped",
};

/**
 * The standard Linux signals, x86-64 numbering, per signal(7).
 * catchable: whether a handler can be installed / the signal blocked.
 */
export const SIGNALS = [
  { number: 1, name: "SIGHUP", action: "Term", catchable: true, description: "Hangup of the controlling terminal, or death of the session leader. Daemons conventionally reuse it to mean \"reload configuration\" (nginx, sshd).", container: "Often repurposed for config reload: `docker kill -s HUP nginx` reloads nginx without downtime." },
  { number: 2, name: "SIGINT", action: "Term", catchable: true, description: "Interrupt from the keyboard — Ctrl+C. The polite way to stop a foreground process.", container: "Interactive `docker run` forwards Ctrl+C as SIGINT only when the container runs with a TTY attached." },
  { number: 3, name: "SIGQUIT", action: "Core", catchable: true, description: "Quit from the keyboard — Ctrl+\\. Like SIGINT but dumps core for post-mortem debugging.", container: "" },
  { number: 4, name: "SIGILL", action: "Core", catchable: true, description: "Illegal instruction — corrupted binary, or code built for a CPU feature the host lacks (e.g. AVX-512 on an older machine).", container: "Seen when an image built with -march=native runs on a different CPU." },
  { number: 5, name: "SIGTRAP", action: "Core", catchable: true, description: "Trace/breakpoint trap, used by debuggers like gdb.", container: "" },
  { number: 6, name: "SIGABRT", action: "Core", catchable: true, description: "abort() was called — failed assert(), glibc heap-corruption detection, or an uncaught C++ exception. Exit code 134.", container: "" },
  { number: 7, name: "SIGBUS", action: "Core", catchable: true, description: "Bus error: misaligned access or an mmap'd file truncated underneath the process. Number 10 on SPARC/MIPS.", container: "A classic cause is /dev/shm filling up while a file-backed mmap is in use." },
  { number: 8, name: "SIGFPE", action: "Core", catchable: true, description: "Fatal arithmetic error — integer division by zero, overflow on INT_MIN / -1. Despite the name it is not raised by IEEE-754 floating point by default.", container: "" },
  { number: 9, name: "SIGKILL", action: "Term", catchable: false, description: "Kill, immediately and unconditionally. Cannot be caught, blocked or ignored — the process gets no chance to clean up.", container: "What the OOM killer and `docker kill` send. A container that died with exit code 137 received SIGKILL." },
  { number: 10, name: "SIGUSR1", action: "Term", catchable: true, description: "User-defined signal 1. Note the default action is termination — an unhandled SIGUSR1 kills the process. Number 30 on Alpha/SPARC.", container: "Common repurposings: nginx reopens logs, Go's runtime is unaffected but many apps trigger state dumps." },
  { number: 11, name: "SIGSEGV", action: "Core", catchable: true, description: "Segmentation fault — invalid memory reference. Exit code 139.", container: "" },
  { number: 12, name: "SIGUSR2", action: "Term", catchable: true, description: "User-defined signal 2; default action is also termination. Number 31 on Alpha/SPARC.", container: "" },
  { number: 13, name: "SIGPIPE", action: "Term", catchable: true, description: "Write to a pipe or socket with no reader. The reason `yes | head` terminates cleanly; network servers usually ignore it and handle EPIPE instead.", container: "" },
  { number: 14, name: "SIGALRM", action: "Term", catchable: true, description: "Timer set by alarm(2) or setitimer(2) expired. Used to implement timeouts.", container: "" },
  { number: 15, name: "SIGTERM", action: "Term", catchable: true, description: "Termination request — the default signal of `kill`. Catchable, so well-behaved services trap it, finish in-flight work and exit. Exit code 143.", container: "`docker stop` and Kubernetes pod deletion send SIGTERM first, then SIGKILL after the grace period (10 s Docker, 30 s K8s default)." },
  { number: 16, name: "SIGSTKFLT", action: "Term", catchable: true, description: "Stack fault on coprocessor — unused on modern Linux, kept for the number's sake.", container: "" },
  { number: 17, name: "SIGCHLD", action: "Ign", catchable: true, description: "A child process stopped or terminated. Parents handle it (or wait()) to reap zombies. Number 20 on Alpha/SPARC.", container: "PID 1 in a container inherits orphaned children; if it never reaps them, zombies accumulate — use tini or `docker run --init`." },
  { number: 18, name: "SIGCONT", action: "Cont", catchable: true, description: "Resume a stopped process — the counterpart of SIGSTOP/SIGTSTP. Number differs on SPARC (19) and others.", container: "`docker unpause` uses the cgroup freezer, not SIGCONT, but the effect on the workload is similar." },
  { number: 19, name: "SIGSTOP", action: "Stop", catchable: false, description: "Stop (suspend) the process unconditionally. Like SIGKILL it cannot be caught, blocked or ignored.", container: "`docker pause` freezes via cgroups instead, which even stops SIGKILL delivery until unpaused." },
  { number: 20, name: "SIGTSTP", action: "Stop", catchable: true, description: "Terminal stop — Ctrl+Z. Unlike SIGSTOP it can be caught, which is how editors restore the screen before suspending.", container: "" },
  { number: 21, name: "SIGTTIN", action: "Stop", catchable: true, description: "A background process tried to read from the terminal.", container: "" },
  { number: 22, name: "SIGTTOU", action: "Stop", catchable: true, description: "A background process tried to write to the terminal (with tostop set).", container: "" },
  { number: 23, name: "SIGURG", action: "Ign", catchable: true, description: "Urgent (out-of-band) data arrived on a socket.", container: "" },
  { number: 24, name: "SIGXCPU", action: "Core", catchable: true, description: "CPU time rlimit (RLIMIT_CPU) exceeded. Delivered once per second past the soft limit, then SIGKILL at the hard limit.", container: "Some sandboxes use RLIMIT_CPU as a runaway-process guard; exit code 152 points here." },
  { number: 25, name: "SIGXFSZ", action: "Core", catchable: true, description: "File size rlimit (RLIMIT_FSIZE) exceeded on write.", container: "" },
  { number: 26, name: "SIGVTALRM", action: "Term", catchable: true, description: "Virtual timer expired — counts CPU time the process itself used, not wall clock.", container: "" },
  { number: 27, name: "SIGPROF", action: "Term", catchable: true, description: "Profiling timer expired — CPU time including system calls. Used by sampling profilers.", container: "" },
  { number: 28, name: "SIGWINCH", action: "Ign", catchable: true, description: "Terminal window size changed. TUI programs redraw on it.", container: "" },
  { number: 29, name: "SIGIO", action: "Term", catchable: true, description: "Asynchronous I/O ready (also called SIGPOLL). Default action terminates, which surprises people using O_ASYNC without a handler.", container: "" },
  { number: 30, name: "SIGPWR", action: "Term", catchable: true, description: "Power failure notification from a UPS daemon. Not in POSIX; Linux-specific.", container: "" },
  { number: 31, name: "SIGSYS", action: "Core", catchable: true, description: "Bad system call. The signal seccomp delivers (SECCOMP_RET_TRAP) when a filtered syscall is attempted.", container: "A process dying with SIGSYS inside Docker often hit the default seccomp profile — a syscall the profile blocks." },
];

/** Real-time signal range on Linux (signal(7)): SIGRTMIN..SIGRTMAX, typically 34..64. */
export const RT_SIGNAL_NOTE =
  "Linux also provides real-time signals SIGRTMIN (34 after glibc reserves 32–33 for threading) through SIGRTMAX (64). They have no predefined meaning, queue instead of coalescing, and are delivered lowest-number first.";

/**
 * Look up signals by number, name, or free text.
 * @param {string} raw e.g. "9", "SIGKILL", "kill", "ctrl c"
 * @returns {{ entries: Array<object> } | { error: string }}
 */
export function lookupSignal(raw) {
  const q = String(raw ?? "").trim().toLowerCase();
  if (q === "") return { error: "Type a signal number or name, e.g. 9 or SIGTERM." };

  const asNumber = Number(q);
  if (Number.isInteger(asNumber) && String(asNumber) === q) {
    if (asNumber >= 34 && asNumber <= 64) {
      return { error: `Signal ${asNumber} is a real-time signal. ${RT_SIGNAL_NOTE}` };
    }
    const byNumber = SIGNALS.filter((s) => s.number === asNumber);
    if (byNumber.length === 0) {
      return { error: `No standard Linux signal is numbered ${asNumber} (valid: 1–31, plus real-time 34–64).` };
    }
    return { entries: byNumber };
  }

  const name = q.replace(/[^a-z0-9+\\]/g, "");
  const withSig = name.startsWith("sig") ? name : `sig${name}`;
  const exact = SIGNALS.filter((s) => s.name.toLowerCase() === withSig || s.name.toLowerCase() === name);
  if (exact.length > 0) return { entries: exact };

  const partial = SIGNALS.filter(
    (s) => s.name.toLowerCase().includes(name) || s.description.toLowerCase().includes(q),
  );
  if (partial.length === 0) {
    return { error: `Nothing matches "${raw}". Try a number 1–31 or a name like SIGTERM.` };
  }
  return { entries: partial };
}

/** Exit code a shell reports when this signal kills a process, or null if it cannot. */
export function exitCodeFor(signal) {
  if (!signal || !["Term", "Core"].includes(signal.action)) return null;
  return SIGNAL_EXIT_BASE + signal.number;
}

/** Plain-text summary for the copy button. */
export function formatSignal(signal) {
  if (!signal || typeof signal.name !== "string") return "";
  const code = exitCodeFor(signal);
  return [
    `${signal.name} (signal ${signal.number})`,
    `Default action: ${DEFAULT_ACTIONS[signal.action]}`,
    `Catchable: ${signal.catchable ? "yes — can be caught, blocked or ignored" : "NO — cannot be caught, blocked or ignored"}`,
    code ? `Shell exit code when fatal: ${code} (128 + ${signal.number})` : "Does not terminate by default, so no 128+N exit code.",
    signal.description,
    signal.container ? `Containers: ${signal.container}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
