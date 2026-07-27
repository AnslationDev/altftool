/**
 * Python virtual environment command builder.
 *
 * Every command emitted here comes from documented behaviour, not from habit:
 *
 *  - `python -m venv` ships with CPython since 3.3 (PEP 405). Before that you needed
 *    the third-party virtualenv package.
 *  - The activation script filename is chosen by the *shell*, not the OS: venv writes
 *    `activate` (POSIX sh/bash/zsh), `activate.fish`, `activate.csh`, `activate.bat`
 *    (cmd.exe) and `Activate.ps1` (PowerShell) into the environment.
 *  - The scripts directory differs by platform: `bin` on POSIX, `Scripts` on Windows.
 *    Git Bash on Windows is the awkward case — a POSIX shell over a Windows layout,
 *    so it sources `.venv/Scripts/activate`.
 *  - `py` is the Windows Python launcher installed by the python.org installer;
 *    `py -3.12 -m venv` selects an interpreter version without touching PATH.
 *  - `--upgrade-deps` was added in Python 3.9. On older interpreters you upgrade pip
 *    manually after activation.
 *  - Debian and Ubuntu split venv out of the standard library package, so
 *    `python3 -m venv` fails there until `python3-venv` is installed via apt.
 *  - `python -m pip` is preferred over a bare `pip` because it guarantees the pip that
 *    belongs to the interpreter you just selected.
 *
 * End-of-life dates are the CPython release schedule published in the developer guide
 * (PEP 602: two years of bugfix support, then three years of security fixes).
 * The comparison date is passed in, so this module never reads the clock.
 */

/** venv entered the standard library in CPython 3.3 (PEP 405). */
const VENV_MIN_MINOR = 3;
/** `--upgrade-deps` was added to the venv module in CPython 3.9. */
const UPGRADE_DEPS_MIN_MINOR = 9;

/** CPython end-of-life dates from the official release schedule (python.org developer guide). */
export const PYTHON_EOL = {
  "3.8": "2024-10-07",
  "3.9": "2025-10-31",
  "3.10": "2026-10-31",
  "3.11": "2027-10-31",
  "3.12": "2028-10-31",
  "3.13": "2029-10-31",
  "3.14": "2030-10-31",
};

export const OPERATING_SYSTEMS = [
  { id: "macos", label: "macOS", scriptsDir: "bin", defaultShell: "zsh" },
  { id: "linux", label: "Linux", scriptsDir: "bin", defaultShell: "bash" },
  { id: "windows", label: "Windows", scriptsDir: "Scripts", defaultShell: "powershell" },
];

export const SHELLS = [
  { id: "bash", label: "bash", os: ["macos", "linux"], activateFile: "activate", source: "source" },
  { id: "zsh", label: "zsh", os: ["macos", "linux"], activateFile: "activate", source: "source" },
  { id: "fish", label: "fish", os: ["macos", "linux"], activateFile: "activate.fish", source: "source" },
  { id: "csh", label: "csh / tcsh", os: ["macos", "linux"], activateFile: "activate.csh", source: "source" },
  { id: "powershell", label: "PowerShell", os: ["windows"], activateFile: "Activate.ps1", source: "." },
  { id: "cmd", label: "cmd.exe", os: ["windows"], activateFile: "activate.bat", source: "" },
  { id: "gitbash", label: "Git Bash (Windows)", os: ["windows"], activateFile: "activate", source: "source" },
];

export const MANAGERS = [
  {
    id: "pip",
    label: "pip + requirements.txt",
    note: "The standard-library path. Nothing extra to install.",
  },
  {
    id: "pip-tools",
    label: "pip-tools (pip-compile / pip-sync)",
    note: "Keeps a human-edited .in file and a fully pinned .txt lock beside it.",
  },
  {
    id: "uv",
    label: "uv",
    note: "Creates and resolves environments itself; uv venv replaces python -m venv.",
  },
  {
    id: "poetry",
    label: "Poetry",
    note: "Owns the environment and the lock file; you rarely activate it by hand.",
  },
];

export const DEFAULT_INPUT = {
  os: "macos",
  shell: "zsh",
  pythonVersion: "3.12",
  venvDir: ".venv",
  manager: "pip",
  systemSitePackages: false,
  upgradeDeps: true,
  requirementsFile: "requirements.txt",
  addGitignore: true,
};

const OS_BY_ID = new Map(OPERATING_SYSTEMS.map((entry) => [entry.id, entry]));
const SHELL_BY_ID = new Map(SHELLS.map((entry) => [entry.id, entry]));
const MANAGER_IDS = new Set(MANAGERS.map((entry) => entry.id));

/** Shells that make sense for a given OS. */
export function shellsFor(osId) {
  return SHELLS.filter((shell) => shell.os.includes(osId));
}

/**
 * Parse a "3.12" style version into numbers.
 * @returns {{major:number, minor:number}|null}
 */
export function parsePythonVersion(value) {
  const match = /^(\d+)\.(\d+)$/.exec(String(value ?? "").trim());
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]) };
}

/**
 * Support status of a CPython minor release on a given date.
 *
 * @param {string} version  "3.12"
 * @param {string} asOfDate ISO date, e.g. "2026-07-26"
 * @returns {{ known:boolean, eol:string|null, expired:boolean|null, message:string }}
 */
export function pythonSupportStatus(version, asOfDate) {
  const key = String(version ?? "").trim();
  const eol = PYTHON_EOL[key];
  if (!eol) {
    return { known: false, eol: null, expired: null, message: "Support dates for this release are not listed here." };
  }
  const asOf = String(asOfDate ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) {
    return { known: true, eol, expired: null, message: `Python ${key} reaches end of life on ${eol}.` };
  }
  const expired = asOf > eol;
  return {
    known: true,
    eol,
    expired,
    message: expired
      ? `Python ${key} passed end of life on ${eol} and receives no further security fixes.`
      : `Python ${key} receives fixes until ${eol}.`,
  };
}

/** A directory name safe to drop straight into a shell command without quoting. */
const SAFE_DIR = /^[A-Za-z0-9._-]+$/;

/**
 * Build the full setup sequence.
 *
 * @param {object} input see DEFAULT_INPUT for the shape
 * @param {string} [asOfDate] ISO date used only for the end-of-life note
 * @returns {object} { steps, warnings, activate, deactivate, scriptsDir, script } or { error }
 */
export function buildVenvSetup(input = {}, asOfDate = "") {
  const cfg = { ...DEFAULT_INPUT, ...input };

  const os = OS_BY_ID.get(cfg.os);
  if (!os) return { error: "Choose macOS, Linux or Windows." };

  const shell = SHELL_BY_ID.get(cfg.shell);
  if (!shell) return { error: "Choose a shell." };
  if (!shell.os.includes(os.id)) {
    return { error: `${shell.label} is not a shell that runs on ${os.label}. Pick another one.` };
  }
  if (!MANAGER_IDS.has(cfg.manager)) return { error: "Choose a package manager." };

  const version = parsePythonVersion(cfg.pythonVersion);
  if (!version) return { error: "Write the Python version as major.minor, for example 3.12." };
  if (version.major !== 3) return { error: "Only CPython 3.x is covered; Python 2 has no venv module." };
  if (version.minor < VENV_MIN_MINOR) {
    return { error: `The venv module only exists from Python 3.${VENV_MIN_MINOR} onwards (PEP 405).` };
  }

  const dir = String(cfg.venvDir ?? "").trim();
  if (!dir) return { error: "Give the environment a directory name, for example .venv." };
  if (!SAFE_DIR.test(dir)) {
    return { error: "Use only letters, digits, dot, dash and underscore in the directory name — no spaces or slashes." };
  }

  const requirements = String(cfg.requirementsFile ?? "requirements.txt").trim() || "requirements.txt";
  if (!SAFE_DIR.test(requirements)) {
    return { error: "The requirements filename must not contain spaces or path separators." };
  }

  const isWindowsLayout = os.id === "windows";
  const scriptsDir = os.scriptsDir;
  const sep = isWindowsLayout && shell.id !== "gitbash" ? "\\" : "/";
  const activatePath = `${dir}${sep}${scriptsDir}${sep}${shell.activateFile}`;
  const activate =
    shell.id === "cmd" ? activatePath : `${shell.source} ${shell.id === "powershell" ? `.${sep}${activatePath}` : activatePath}`;

  // Interpreter used to CREATE the environment.
  const creator = isWindowsLayout ? `py -${cfg.pythonVersion}` : `python${cfg.pythonVersion}`;

  const venvFlags = [];
  if (cfg.systemSitePackages) venvFlags.push("--system-site-packages");
  const canUpgradeDeps = version.minor >= UPGRADE_DEPS_MIN_MINOR;
  if (cfg.upgradeDeps && canUpgradeDeps) venvFlags.push("--upgrade-deps");

  const warnings = [];
  const steps = [];

  const support = pythonSupportStatus(cfg.pythonVersion, asOfDate);
  if (support.expired) warnings.push(support.message);

  if (cfg.upgradeDeps && !canUpgradeDeps) {
    warnings.push(
      `--upgrade-deps was added in Python 3.${UPGRADE_DEPS_MIN_MINOR}; on 3.${version.minor} the pip upgrade is a separate command after activation.`,
    );
  }
  if (cfg.systemSitePackages) {
    warnings.push(
      "--system-site-packages lets the environment see globally installed packages, which makes a build reproducible only on machines with the same global state. Use it for hardware or distro packages you cannot pip-install.",
    );
  }
  if (os.id === "linux") {
    warnings.push(
      "On Debian and Ubuntu the venv module is packaged separately: install python3-venv with apt before the first run, or python3 -m venv exits with an ensurepip error.",
    );
  }
  if (shell.id === "powershell") {
    warnings.push(
      "PowerShell blocks unsigned scripts by default. If Activate.ps1 is refused, allow it for the current session only rather than changing the machine policy.",
    );
  }

  // Step 1 — check the interpreter exists.
  steps.push({
    id: "check",
    title: `Confirm Python ${cfg.pythonVersion} is installed`,
    commands: [isWindowsLayout ? `py -${cfg.pythonVersion} --version` : `python${cfg.pythonVersion} --version`],
    note: isWindowsLayout
      ? "py is the Windows Python launcher; it picks the requested version without editing PATH."
      : "Naming the minor version avoids picking up whatever python3 happens to point at today.",
  });

  // Step 2 — create.
  if (cfg.manager === "uv") {
    steps.push({
      id: "create",
      title: "Create the environment with uv",
      commands: [`uv venv ${dir} --python ${cfg.pythonVersion}`],
      note: "uv creates the same layout as python -m venv and will download the interpreter if it is missing.",
    });
  } else if (cfg.manager === "poetry") {
    steps.push({
      id: "create",
      title: "Point Poetry at the interpreter",
      commands: [
        "poetry config virtualenvs.in-project true",
        isWindowsLayout
          ? `py -${cfg.pythonVersion} -c "import sys; print(sys.executable)"`
          : `poetry env use python${cfg.pythonVersion}`,
        ...(isWindowsLayout ? ["poetry env use <the path printed above>"] : []),
      ],
      note: isWindowsLayout
        ? "Poetry needs a real interpreter path on Windows, so ask the py launcher where that version lives and pass it through. virtualenvs.in-project keeps the environment in the repository as .venv."
        : "virtualenvs.in-project keeps the environment in the repository as .venv instead of a cache directory.",
    });
  } else {
    steps.push({
      id: "create",
      title: "Create the virtual environment",
      commands: [`${creator} -m venv ${dir}${venvFlags.length ? ` ${venvFlags.join(" ")}` : ""}`],
      note: "venv copies or symlinks the interpreter and writes a pyvenv.cfg pointing back at the base install.",
    });
  }

  // Step 3 — activate.
  steps.push({
    id: "activate",
    title: `Activate it in ${shell.label}`,
    commands:
      shell.id === "powershell"
        ? ["Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass", activate]
        : [activate],
    note:
      shell.id === "gitbash"
        ? "Git Bash is a POSIX shell over a Windows layout, so the path is Scripts but the file is the plain activate script."
        : "Activation only edits PATH and the prompt for this shell session; it does not modify anything globally.",
  });

  // Step 4 — pip baseline.
  if (cfg.manager === "pip" || cfg.manager === "pip-tools") {
    const upgrade = [];
    if (!(cfg.upgradeDeps && canUpgradeDeps)) upgrade.push("python -m pip install --upgrade pip setuptools wheel");
    if (cfg.manager === "pip-tools") upgrade.push("python -m pip install pip-tools");
    if (upgrade.length) {
      steps.push({
        id: "baseline",
        title: "Bring the packaging tools up to date",
        commands: upgrade,
        note: "python -m pip guarantees the pip that belongs to the interpreter you just activated.",
      });
    }
  }

  // Step 5 — dependencies.
  if (cfg.manager === "pip") {
    steps.push({
      id: "deps",
      title: "Install and record dependencies",
      commands: [
        `python -m pip install -r ${requirements}`,
        "python -m pip install <package>",
        `python -m pip freeze > ${requirements}`,
      ],
      note: "pip freeze writes every installed package including transitive ones, which is what makes the file reproducible.",
    });
  } else if (cfg.manager === "pip-tools") {
    const inFile = requirements.replace(/\.txt$/, ".in");
    steps.push({
      id: "deps",
      title: "Compile and sync dependencies",
      commands: [
        `pip-compile ${inFile} --output-file ${requirements}`,
        `pip-sync ${requirements}`,
      ],
      note: `Edit ${inFile} by hand with loose constraints; ${requirements} is generated and fully pinned. pip-sync also uninstalls anything not in the lock.`,
    });
  } else if (cfg.manager === "uv") {
    steps.push({
      id: "deps",
      title: "Install dependencies with uv",
      commands: [
        `uv pip install -r ${requirements}`,
        `uv pip compile ${requirements.replace(/\.txt$/, ".in")} -o ${requirements}`,
        `uv pip sync ${requirements}`,
      ],
      note: "uv pip mirrors the pip command surface, so the same requirements files keep working.",
    });
  } else {
    steps.push({
      id: "deps",
      title: "Install dependencies with Poetry",
      commands: ["poetry install", "poetry add <package>", "poetry lock"],
      note: "poetry install resolves from poetry.lock when it exists, so every machine gets identical versions.",
    });
  }

  // Step 6 — ignore the directory.
  if (cfg.addGitignore) {
    let ignoreCommand;
    if (shell.id === "powershell") ignoreCommand = `Add-Content .gitignore "${dir}/"`;
    else if (shell.id === "cmd") ignoreCommand = `echo ${dir}/>> .gitignore`;
    else ignoreCommand = `echo "${dir}/" >> .gitignore`;
    steps.push({
      id: "ignore",
      title: "Keep the environment out of version control",
      commands: [ignoreCommand],
      note: "A virtual environment holds absolute paths and platform-specific binaries; it is never portable between machines.",
    });
  }

  // Step 7 — leave.
  steps.push({
    id: "deactivate",
    title: "Leave the environment",
    commands: ["deactivate"],
    note: "deactivate restores the PATH the shell had before activation. Closing the terminal has the same effect.",
  });

  const script = steps
    .map((step) => [`# ${step.title}`, ...step.commands].join("\n"))
    .join("\n\n");

  return {
    steps,
    warnings,
    activate,
    deactivate: "deactivate",
    scriptsDir,
    activatePath,
    support,
    script,
    resolved: { ...cfg, venvDir: dir, requirementsFile: requirements },
  };
}
