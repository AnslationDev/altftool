const seo = {
  title: "Python venv Commands for Your OS, Shell",
  metaDescription:
    "Exact create, activate and install commands: bin vs Scripts, activate.fish, activate.bat or Activate.ps1, and --upgrade-deps only on Python 3.9+.",
  steps: [
    "Choose 'Operating system' (macOS, Linux or Windows) and 'Shell' — bash, zsh, fish, csh / tcsh, PowerShell, cmd.exe or Git Bash (Windows).",
    "Pick 'Python version' and 'Package manager' (pip + requirements.txt, pip-tools or uv), then name the 'Environment directory' and 'Requirements file'.",
    "The Activation command, Scripts directory and Activation script path appear above the numbered commands; 'Copy result' takes the whole setup script.",
  ],
  intro:
    "This builder emits the exact shell commands to create, activate and populate a Python virtual environment for one specific combination of operating system, shell, interpreter version and package manager. It follows the actual venv layout rules: the scripts directory is bin on POSIX and Scripts on Windows, while the activation filename is chosen by the shell — activate, activate.fish, activate.csh, activate.bat or Activate.ps1. It also flags version-dependent behaviour such as --upgrade-deps, which only exists from Python 3.9 onwards.",
  useCases: [
    "Writing the setup section of a README so contributors on macOS zsh, Ubuntu bash and Windows PowerShell all get commands that work first time.",
    "Working out why source .venv/bin/activate fails on Git Bash, where the environment lives under Scripts rather than bin.",
    "Switching a project from plain pip to pip-tools or uv and needing the equivalent compile and sync commands side by side.",
  ],
  benefits: [
    [
      "Shell-accurate, not OS-accurate",
      "Fish, csh, PowerShell, cmd and Git Bash each get their own activation script instead of one generic line.",
    ],
    [
      "Version-aware flags",
      "Flags are only emitted on interpreters that support them, and the pip upgrade becomes a separate step when they do not.",
    ],
    [
      "Names the traps",
      "The Debian python3-venv package, the PowerShell execution policy and the cost of --system-site-packages are all called out.",
    ],
  ],
  faqs: [
    [
      "How do I activate a Python virtual environment?",
      "Source the activation script that matches your shell, from the project root: source .venv/bin/activate in bash or zsh, source .venv/bin/activate.fish in fish, .venv\\Scripts\\activate.bat in cmd.exe, and . .\\.venv\\Scripts\\Activate.ps1 in PowerShell. Activation only edits PATH and the prompt for that one shell session.",
    ],
    [
      "Why does python3 -m venv fail on Ubuntu?",
      "Debian and Ubuntu ship venv in a separate package, so the module exists but ensurepip is missing and the command exits with an error telling you to install python3-venv. Installing that package with apt fixes it; nothing about the venv command itself needs to change.",
    ],
    [
      "Should I commit the .venv folder to git?",
      "No. The environment contains absolute paths in pyvenv.cfg and compiled, platform-specific binaries, so it will not work on another machine or another operating system. Commit requirements.txt, requirements.in or poetry.lock and let each machine rebuild the environment.",
    ],
    [
      "What is the difference between venv, virtualenv and uv?",
      "venv is the standard-library module present since Python 3.3 (PEP 405) and creates environments for the interpreter that runs it. virtualenv is the older third-party project that still supports older interpreters and is faster at creation. uv is a newer resolver and installer that can create the same environment layout and also download interpreters, and its uv pip subcommands mirror the pip interface so existing requirements files keep working.",
    ],
  ],
};

export default seo;
