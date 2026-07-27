/**
 * Shell / process exit code reference.
 *
 * Rule sources:
 *
 *  - POSIX (IEEE 1003.1, "Exit Status for Commands" §2.8.2): an exit status is an
 *    8-bit value 0–255; 0 means success, non-zero means failure. A command that is
 *    found but not executable yields 126, a command that cannot be found yields 127,
 *    and a command terminated by signal N is reported by the shell as 128+N.
 *
 *  - Bash Reference Manual §3.7.5 "Exit Status": 2 is bash's code for misuse of a
 *    builtin or a syntax error, and exit arguments outside 0–255 are taken mod 256.
 *
 *  - sysexits.h (BSD, still shipped on Linux/macOS): the 64–78 EX_* block used by
 *    mail systems and many CLIs for structured failure codes.
 *
 *  - Signal numbers follow signal(7) on Linux x86-64. Numbers for SIGBUS, SIGUSR1/2
 *    and others differ on some architectures — noted per entry where relevant.
 *
 *  - Container notes: Kubernetes and Docker surface 137 (128+SIGKILL) for OOM kills
 *    and 143 (128+SIGTERM) for graceful stops, per the Kubernetes docs on
 *    container termination.
 */

/** POSIX: an exit status is one unsigned byte. */
export const EXIT_STATUS_MAX = 255;

/** POSIX: shells report death-by-signal-N as SIGNAL_EXIT_BASE + N. */
export const SIGNAL_EXIT_BASE = 128;

/** Linux x86-64 signal numbers from signal(7), for decoding 128+N codes. */
export const SIGNAL_NAMES = {
  1: "SIGHUP",
  2: "SIGINT",
  3: "SIGQUIT",
  4: "SIGILL",
  5: "SIGTRAP",
  6: "SIGABRT",
  7: "SIGBUS",
  8: "SIGFPE",
  9: "SIGKILL",
  10: "SIGUSR1",
  11: "SIGSEGV",
  12: "SIGUSR2",
  13: "SIGPIPE",
  14: "SIGALRM",
  15: "SIGTERM",
  16: "SIGSTKFLT",
  17: "SIGCHLD",
  18: "SIGCONT",
  19: "SIGSTOP",
  20: "SIGTSTP",
  21: "SIGTTIN",
  22: "SIGTTOU",
  23: "SIGURG",
  24: "SIGXCPU",
  25: "SIGXFSZ",
  26: "SIGVTALRM",
  27: "SIGPROF",
  28: "SIGWINCH",
  29: "SIGIO",
  30: "SIGPWR",
  31: "SIGSYS",
};

/**
 * Named exit codes. source: which document defines it.
 */
export const EXIT_CODES = [
  { code: 0, name: "Success", source: "POSIX", meaning: "The command completed successfully. Every non-zero value means some kind of failure." },
  { code: 1, name: "General error", source: "convention", meaning: "Catch-all failure code. grep uses 1 for \"no lines matched\", and most programs use it for any unspecified error." },
  { code: 2, name: "Misuse of shell builtin / syntax error", source: "Bash", meaning: "Bash returns 2 for builtin misuse or a script syntax error. grep uses 2 for \"an error occurred\" (distinct from 1 = no match)." },
  { code: 64, name: "EX_USAGE", source: "sysexits.h", meaning: "Command line usage error — wrong arguments, bad flags, wrong number of parameters." },
  { code: 65, name: "EX_DATAERR", source: "sysexits.h", meaning: "Input data was incorrect in some way — only for user data, not system files." },
  { code: 66, name: "EX_NOINPUT", source: "sysexits.h", meaning: "An input file did not exist or was not readable." },
  { code: 67, name: "EX_NOUSER", source: "sysexits.h", meaning: "The user specified did not exist — classically from mail delivery." },
  { code: 68, name: "EX_NOHOST", source: "sysexits.h", meaning: "The host specified did not exist." },
  { code: 69, name: "EX_UNAVAILABLE", source: "sysexits.h", meaning: "A required service is unavailable, or a support program or file does not exist." },
  { code: 70, name: "EX_SOFTWARE", source: "sysexits.h", meaning: "Internal software error not related to the OS — the code's own bug." },
  { code: 71, name: "EX_OSERR", source: "sysexits.h", meaning: "An operating system error — cannot fork, cannot pipe, and the like." },
  { code: 72, name: "EX_OSFILE", source: "sysexits.h", meaning: "A system file (e.g. /etc/passwd) does not exist or cannot be opened." },
  { code: 73, name: "EX_CANTCREAT", source: "sysexits.h", meaning: "A user-specified output file cannot be created." },
  { code: 74, name: "EX_IOERR", source: "sysexits.h", meaning: "An error occurred while doing I/O on a file." },
  { code: 75, name: "EX_TEMPFAIL", source: "sysexits.h", meaning: "Temporary failure — retry later. Mail systems use this to requeue delivery." },
  { code: 76, name: "EX_PROTOCOL", source: "sysexits.h", meaning: "The remote system returned something impossible during a protocol exchange." },
  { code: 77, name: "EX_NOPERM", source: "sysexits.h", meaning: "Insufficient permission — not a file-permission problem (that is EX_NOINPUT/EX_CANTCREAT), but higher-level authorisation." },
  { code: 78, name: "EX_CONFIG", source: "sysexits.h", meaning: "Something was unconfigured or misconfigured." },
  { code: 126, name: "Command found but not executable", source: "POSIX", meaning: "The command exists but could not be executed — usually a missing execute permission bit, or trying to run a directory or a binary for the wrong architecture." },
  { code: 127, name: "Command not found", source: "POSIX", meaning: "The shell could not find the command — a typo, or the program is not on PATH. In containers this often means the image lacks the binary the entrypoint names." },
  { code: 128, name: "Invalid argument to exit", source: "Bash", meaning: "exit was called with a non-numeric argument. Plain 128 with no signal offset is rare and usually indicates a broken script." },
  { code: 255, name: "Exit status out of range / ssh failure", source: "convention", meaning: "exit(-1) wraps to 255. ssh also returns 255 when the connection itself failed, as opposed to the remote command's own code." },
];

/** Container-orchestrator context for common signal-death codes. */
const CONTAINER_NOTES = {
  9: "In Docker/Kubernetes, 137 almost always means the OOM killer or a forced stop: the kernel or `docker kill` sent SIGKILL. Check `kubectl describe pod` for OOMKilled.",
  15: "In Docker/Kubernetes, 143 is a graceful shutdown: `docker stop` or pod termination sent SIGTERM and the process exited before the grace period.",
  2: "130 is what you see after pressing Ctrl+C: the terminal delivered SIGINT.",
  3: "131 follows Ctrl+\\ (SIGQUIT), which also dumps core if ulimits allow.",
  11: "139 is a segmentation fault (SIGSEGV) — the process accessed invalid memory. In containers this is a crash in the binary itself, not the runtime.",
  6: "134 means the process called abort() (SIGABRT) — failed assertions, glibc heap corruption detection, or an uncaught C++ exception.",
  8: "136 is SIGFPE — fatal arithmetic error such as integer division by zero.",
  13: "141 is SIGPIPE — the process wrote to a pipe whose reader had gone, e.g. `somecmd | head` after head exits.",
  14: "142 is SIGALRM — an alarm(2) timer expired, commonly from `timeout` implementations.",
  24: "152 is SIGXCPU — the process exceeded its CPU time rlimit.",
};

/**
 * Explain an exit code.
 *
 * @param {number|string} raw the code as typed
 * @returns {object} { code, name, source, meaning, signal?, containerNote?, isSignal } or { error }
 */
export function explainExitCode(raw) {
  const text = String(raw ?? "").trim();
  if (text === "") return { error: "Enter an exit code between 0 and 255." };
  const value = Number(text);
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return { error: "An exit code is a whole number — enter an integer between 0 and 255." };
  }
  if (value < 0 || value > EXIT_STATUS_MAX) {
    // Bash takes exit arguments mod 256 (Bash manual §3.7.5); C's exit() truncates to a byte.
    const wrapped = ((value % 256) + 256) % 256;
    return {
      error: `Exit codes are one unsigned byte (0–${EXIT_STATUS_MAX}). exit(${value}) actually reports ${wrapped} — look that up instead.`,
    };
  }

  const known = EXIT_CODES.find((entry) => entry.code === value);

  // 128+N: killed by signal N. Only meaningful for N 1..31 (real-time signals 32+
  // exist but shells rarely surface them this way).
  const signalNumber = value - SIGNAL_EXIT_BASE;
  const signalName = SIGNAL_NAMES[signalNumber];
  if (value > SIGNAL_EXIT_BASE && signalName) {
    return {
      code: value,
      isSignal: true,
      signal: { number: signalNumber, name: signalName },
      name: `Terminated by ${signalName}`,
      source: "POSIX 128+N",
      meaning: `The process was killed by signal ${signalNumber} (${signalName}); the shell reports 128 + ${signalNumber} = ${value}.`,
      containerNote: CONTAINER_NOTES[signalNumber] ?? "",
    };
  }

  if (known) {
    return { ...known, isSignal: false, containerNote: "" };
  }

  return {
    code: value,
    isSignal: false,
    name: "Application-defined",
    source: "none",
    meaning:
      "No shell, POSIX or sysexits.h meaning is attached to this value — it is whatever the program's author decided. Check the program's man page or --help output.",
    containerNote: "",
  };
}

/** Rows for the browsable reference table: named codes plus common signal deaths. */
export function referenceRows() {
  const signalRows = Object.entries(SIGNAL_NAMES)
    .map(([num, name]) => ({
      code: SIGNAL_EXIT_BASE + Number(num),
      name: `Killed by ${name}`,
      source: "POSIX 128+N",
      meaning: `Signal ${num} (${name}) terminated the process.`,
    }))
    // Only the signals whose default action terminates (signal(7)) — the ignored
    // (SIGCHLD, SIGURG, SIGWINCH), continue (SIGCONT) and stop (SIGSTOP, SIGTSTP,
    // SIGTTIN, SIGTTOU) signals do not produce exit codes this way.
    .filter((row) => ![145, 146, 147, 148, 149, 150, 151, 156].includes(row.code));
  return [...EXIT_CODES, ...signalRows].sort((a, b) => a.code - b.code);
}

/** Plain-text summary for the copy button. */
export function formatExplanation(result) {
  if (!result || result.error) return "";
  const lines = [`Exit code ${result.code}: ${result.name}`, result.meaning];
  if (result.containerNote) lines.push(result.containerNote);
  lines.push(`Source: ${result.source}`);
  return lines.join("\n");
}
