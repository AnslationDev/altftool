const seo = {
  title: "Bash Script Scaffold Generator – Strict Mode & Traps",
  metaDescription:
    "Generate a bash skeleton with set -Eeuo pipefail, ERR and EXIT traps, getopts parsing, logging and an optional flock guard against overlapping runs.",
  steps: [
    "Enter a Script file name, One-line description and Required commands — each command gets a command -v check — and choose the Shebang.",
    "Tick the Safety features you want: strict mode (set -Eeuo pipefail), the ERR trap, the EXIT cleanup trap with mktemp -d, log()/die() helpers, the flock guard and -v/-n flags.",
    "Review the generated script and its line count, then click Copy script to copy the ready-to-edit skeleton.",
  ],
  intro:
    "This generator produces a complete bash script skeleton with the \"unofficial strict mode\" (set -Eeuo pipefail and a newline-tab IFS), an ERR trap that reports the failing line, an EXIT cleanup trap around mktemp -d, getopts option parsing, timestamped logging and an optional flock(1) guard against overlapping runs. It is built for sysadmins and developers who want every new script to start from a safe, ShellCheck-friendly base instead of a bare shebang.",
  useCases: [
    "A sysadmin starting a nightly backup script who wants flock protection so a slow run never overlaps the next cron invocation",
    "A developer who keeps forgetting set -euo pipefail and wants a skeleton where failures stop the script instead of being ignored",
    "A team standardising its ops scripts on one layout with usage(), -v/-n flags and dependency checks for required commands",
  ],
  benefits: [
    ["Strict mode by default", "set -Eeuo pipefail plus tight IFS stops silent failures and unset-variable typos."],
    ["Traps done right", "ERR trap reports the failing line; a single EXIT trap removes the mktemp scratch dir on every exit path."],
    ["Overlap-safe", "The optional flock self-lock re-execs the script under an exclusive lock so a second copy exits immediately."],
  ],
  faqs: [
    [
      "What does set -Eeuo pipefail do in a bash script?",
      "It combines four safety switches: -e exits on any failing command, -u treats unset variables as errors, -o pipefail makes a pipeline fail if any stage fails, and -E makes ERR traps fire inside functions and subshells. Together they turn silent failures into immediate, visible errors.",
    ],
    [
      "How do I stop a cron job from running twice at the same time?",
      "Wrap the script in flock. The generated skeleton uses the self-exec pattern — it re-runs itself under flock -en on a lock file in /tmp — so a second instance exits immediately with a clear message instead of stacking up behind a slow run.",
    ],
    [
      "Why should a bash script trap EXIT instead of deleting temp files at the end?",
      "Because the last line never runs when the script errors out or is killed. A trap on EXIT runs on every exit path — success, set -e failure, or SIGTERM — so the mktemp -d scratch directory is always removed exactly once.",
    ],
    [
      "Is #!/usr/bin/env bash better than #!/bin/bash?",
      "env finds bash on the PATH, which matters on systems where bash is not in /bin — notably macOS users who install a newer bash via Homebrew, and BSDs. #!/bin/bash is fine when the script only ever targets standard Linux hosts. The generator offers both.",
    ],
  ],
};

export default seo;
