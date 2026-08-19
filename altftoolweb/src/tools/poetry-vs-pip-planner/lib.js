/**
 * Poetry vs pip-tools vs uv vs conda — a transparent scoring model.
 *
 * The model is additive: each answer about the project adds a fixed number of
 * points to the managers that genuinely serve that need, together with a
 * written reason. The ranking is therefore fully explainable — every point on
 * screen maps to one reason line.
 *
 * The factual claims behind each weight (lockfile formats, publishing support,
 * binary/native package handling, interpreter management, workspace support)
 * come from the tools' own documentation:
 *   - pip-tools: pip-compile pins requirements.txt per environment (github.com/jazzband/pip-tools)
 *   - Poetry: poetry.lock, dependency groups, `poetry publish` (python-poetry.org/docs)
 *   - uv: universal cross-platform uv.lock, workspaces, `uv python install`,
 *     `uv publish`, and Astral's published 10-100x pip-install benchmarks (docs.astral.sh/uv)
 *   - conda: binary non-Python packages (CUDA, MKL, GDAL); lockfiles need the
 *     separate conda-lock project (docs.conda.io, conda.github.io/conda-lock)
 *
 * Pure module: same answers -> same ranking. No dates, no randomness.
 */

export const MANAGER_IDS = ["uv", "poetry", "piptools", "conda"];

export const MANAGERS = {
  uv: { id: "uv", name: "uv", tagline: "Rust-fast all-in-one manager by Astral" },
  poetry: { id: "poetry", name: "Poetry", tagline: "pyproject-native packaging and publishing" },
  piptools: { id: "piptools", name: "pip + pip-tools", tagline: "Plain pip with pip-compile pinning" },
  conda: { id: "conda", name: "conda / mamba", tagline: "Binary packages beyond Python" },
};

export const PROJECT_TYPES = [
  { id: "app", label: "Application / service (deployed, not published)" },
  { id: "library", label: "Library published to PyPI" },
  { id: "datasci", label: "Data science / ML notebooks and pipelines" },
];

/**
 * Feature questions. Each answer=true awards `points` to the listed managers.
 * Weight scale: 1 = mild advantage, 2-3 = clear advantage, 4 = decisive.
 */
export const QUESTIONS = [
  {
    key: "nativeDeps",
    label: "Needs non-Python binaries (CUDA, GDAL, MKL, R…)",
    help: "Compiled toolchains that pip wheels often do not cover.",
    // conda's package format ships arbitrary binaries — its founding purpose;
    // decisive because pip-family managers can only install what has a wheel.
    awards: { conda: 4 },
    reasons: { conda: "conda packages ship non-Python binaries (CUDA, GDAL, MKL) that pip wheels often miss." },
  },
  {
    key: "lockfile",
    label: "Reproducible installs via a lockfile",
    help: "Everyone (and CI) installs the exact same versions.",
    // uv.lock and poetry.lock are cross-platform by design; pip-compile output
    // is pinned but per-platform; conda needs the separate conda-lock tool.
    awards: { uv: 3, poetry: 3, piptools: 2, conda: 1 },
    reasons: {
      uv: "uv.lock is a single cross-platform lockfile checked in with the project.",
      poetry: "poetry.lock pins every transitive dependency across platforms.",
      piptools: "pip-compile pins requirements.txt, though one file per platform/Python version.",
      conda: "conda needs the separate conda-lock project for real lockfiles.",
    },
  },
  {
    key: "publishPyPI",
    label: "Will be built and published to PyPI",
    help: "You run a build + upload step for releases.",
    // poetry publish is first-class; uv has uv build/uv publish; pip-tools has
    // neither (you add build + twine yourself); conda targets anaconda.org, not PyPI.
    awards: { poetry: 3, uv: 2 },
    reasons: {
      poetry: "poetry build and poetry publish cover the whole PyPI release flow.",
      uv: "uv build and uv publish handle PyPI releases without extra tools.",
    },
  },
  {
    key: "speedPriority",
    label: "Install speed matters (large CI, many envs)",
    help: "Cold installs run many times a day.",
    // Astral's benchmarks show uv resolving/installing 10-100x faster than pip;
    // pip-tools and poetry both sit on pip-speed resolvers.
    awards: { uv: 4, piptools: 1, poetry: 1 },
    reasons: {
      uv: "uv's Rust resolver installs 10-100x faster than pip in Astral's published benchmarks.",
      piptools: "pip with cached wheels is acceptable, but far slower than uv on cold installs.",
      poetry: "Poetry's resolver is the slowest of the four on large dependency trees.",
    },
  },
  {
    key: "monorepo",
    label: "Monorepo / multiple packages in one repo",
    help: "Several packages share one lockfile and tooling.",
    // uv has first-class workspaces (Cargo-style); poetry needs path deps or plugins.
    awards: { uv: 3, poetry: 1, piptools: 1 },
    reasons: {
      uv: "uv workspaces share one lockfile across many packages, Cargo-style.",
      poetry: "Poetry handles monorepos only via path dependencies or third-party plugins.",
      piptools: "pip-tools can layer -r includes across packages, with manual wiring.",
    },
  },
  {
    key: "minimalTooling",
    label: "Stay close to standard pip / requirements.txt",
    help: "Ops or platform teams expect plain pip artifacts.",
    // pip-tools emits ordinary requirements.txt consumed by vanilla pip;
    // uv pip is a drop-in pip interface that also reads requirements files.
    awards: { piptools: 3, uv: 2 },
    reasons: {
      piptools: "pip-compile output is a plain requirements.txt any vanilla pip can install.",
      uv: "uv pip is a drop-in replacement for pip commands and requirements files.",
    },
  },
  {
    key: "managePython",
    label: "Tool should also install Python versions",
    help: "No separate pyenv / system Python juggling.",
    // uv python install downloads interpreters; conda treats python itself as a package.
    awards: { uv: 3, conda: 2 },
    reasons: {
      uv: "uv python install manages interpreter versions itself, replacing pyenv.",
      conda: "conda installs Python itself as just another package in the environment.",
    },
  },
];

/** Points granted by the project type — the baseline fit before features. */
export const PROJECT_TYPE_AWARDS = {
  // Applications: all four work; pip-family and uv/poetry are the natural fit.
  app: {
    awards: { uv: 2, poetry: 2, piptools: 2, conda: 1 },
    reasons: {
      uv: "Good fit for deployed applications.",
      poetry: "Good fit for deployed applications.",
      piptools: "Good fit for deployed applications.",
      conda: "Workable for applications, but heavier than needed when deps are pure Python.",
    },
  },
  // Libraries: pyproject-based build backends (poetry-core, uv_build/hatchling) shine;
  // pip-tools is not a build tool; conda is the wrong distribution channel for PyPI.
  library: {
    awards: { uv: 3, poetry: 3, piptools: 1 },
    reasons: {
      uv: "pyproject-native builds suit a PyPI library.",
      poetry: "Poetry was designed around building and publishing libraries.",
      piptools: "pip-tools pins deps but you still need a separate build backend.",
    },
  },
  // Data science: conda's scientific stack heritage, uv's speed for notebooks.
  datasci: {
    awards: { conda: 3, uv: 2, piptools: 1 },
    reasons: {
      conda: "conda-forge carries the scientific stack (NumPy/SciPy/R/CUDA) as tested binaries.",
      uv: "uv sets up fast per-project envs for notebooks and pipelines.",
      piptools: "Workable when the whole stack has good wheels on PyPI.",
    },
  },
};

/** Awarded to every pip-family manager when there are NO native deps — pure-Python wheels are fine. */
export const NO_NATIVE_AWARD = { uv: 1, poetry: 1, piptools: 1 };
export const NO_NATIVE_REASON = "All dependencies are pure Python or have wheels, so pip-based installs are enough.";

/** Static side-by-side facts for the comparison table (sources in the header comment). */
export const COMPARISON_ROWS = [
  ["Config file", "pyproject.toml", "pyproject.toml", "requirements.in / .txt", "environment.yml"],
  ["Lockfile", "uv.lock (cross-platform)", "poetry.lock (cross-platform)", "requirements.txt (per platform)", "conda-lock (separate tool)"],
  ["Install speed", "Fastest (Rust, 10-100x pip)", "Slowest resolver of the four", "pip speed", "Slow; mamba solver helps"],
  ["Publish to PyPI", "uv build / uv publish", "poetry publish", "Needs build + twine", "Not a PyPI tool"],
  ["Non-Python binaries", "Wheels only", "Wheels only", "Wheels only", "Yes — CUDA, GDAL, MKL, R"],
  ["Manages Python itself", "Yes (uv python install)", "No", "No", "Yes (python is a package)"],
  ["Workspaces / monorepo", "First-class", "Via plugins / path deps", "Manual -r includes", "No"],
  ["Virtualenv handling", "Automatic .venv", "Automatic (own venvs)", "Manual python -m venv", "conda environments"],
];

/** Getting-started commands shown for the winning manager. */
export const STARTER_COMMANDS = {
  uv: ["curl -LsSf https://astral.sh/uv/install.sh | sh", "uv init myproject && cd myproject", "uv add requests", "uv run python main.py"],
  poetry: ["pipx install poetry", "poetry new myproject && cd myproject", "poetry add requests", "poetry run python -m myproject"],
  piptools: ["python -m venv .venv && source .venv/bin/activate", "pip install pip-tools", "echo 'requests' >> requirements.in", "pip-compile && pip-sync"],
  conda: ["conda create -n myproject python=3.12", "conda activate myproject", "conda install -c conda-forge numpy pandas", "conda env export > environment.yml"],
};

const BOOLEAN_KEYS = QUESTIONS.map((q) => q.key);

/**
 * Score the four managers for the answers given.
 * @param {{projectType:string} & Record<string, boolean>} answers
 * @returns {{ranking:Array<{id,name,tagline,score,share,reasons:string[]}>, winner:object, tie:boolean, maxScore:number}}
 *          | {error:string}
 */
export function scoreManagers(answers = {}) {
  const projectType = String(answers.projectType ?? "").trim();
  if (!PROJECT_TYPE_AWARDS[projectType]) {
    return { error: "Pick a project type (application, library or data science) to get a ranking." };
  }

  const totals = { uv: 0, poetry: 0, piptools: 0, conda: 0 };
  const reasons = { uv: [], poetry: [], piptools: [], conda: [] };

  const grant = (awards, reasonMap) => {
    for (const id of Object.keys(awards)) {
      totals[id] += awards[id];
      const reason = reasonMap?.[id];
      if (reason) reasons[id].push(reason);
    }
  };

  const typeRule = PROJECT_TYPE_AWARDS[projectType];
  grant(typeRule.awards, typeRule.reasons);

  for (const question of QUESTIONS) {
    if (answers[question.key] === true) grant(question.awards, question.reasons);
  }
  if (answers.nativeDeps !== true) {
    grant(NO_NATIVE_AWARD, { uv: NO_NATIVE_REASON, poetry: NO_NATIVE_REASON, piptools: NO_NATIVE_REASON });
  }

  const grandTotal = MANAGER_IDS.reduce((sum, id) => sum + totals[id], 0);
  // projectType always grants points, so grandTotal > 0; guard anyway so share is total.
  const safeTotal = grandTotal > 0 ? grandTotal : 1;

  // Rounding each manager's share independently (Math.round per entry) can let
  // the four displayed percentages drift a point away from 100 in total,
  // undermining the "transparent scoring" claim. Largest-remainder (Hare
  // quota) rounding instead floors every share, then hands the leftover whole
  // points to the entries with the biggest fractional remainder, so the
  // four shares always sum to exactly 100.
  const rawShares = MANAGER_IDS.map((id) => {
    const raw = (totals[id] / safeTotal) * 100;
    const base = Math.floor(raw);
    return { id, base, remainder: raw - base };
  });
  const allocated = rawShares.reduce((sum, entry) => sum + entry.base, 0);
  const remaining = Math.min(Math.max(100 - allocated, 0), rawShares.length);
  const byRemainderDesc = [...rawShares].sort(
    (a, b) => b.remainder - a.remainder || a.id.localeCompare(b.id),
  );
  const shareById = Object.fromEntries(rawShares.map((entry) => [entry.id, entry.base]));
  for (let i = 0; i < remaining; i += 1) {
    shareById[byRemainderDesc[i].id] += 1;
  }

  const ranking = MANAGER_IDS.map((id) => ({
    ...MANAGERS[id],
    score: totals[id],
    share: shareById[id],
    reasons: reasons[id],
  })).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const winner = ranking[0];
  const tie = ranking.length > 1 && ranking[1].score === winner.score;
  const maxScore = winner.score > 0 ? winner.score : 1;

  return { ranking, winner, tie, maxScore, answered: BOOLEAN_KEYS.filter((k) => answers[k] === true) };
}

/** Plain-text summary of a scoring result, for the copy button. */
export function summarizeResult(result, answers = {}) {
  if (!result || result.error) return "";
  const typeLabel = PROJECT_TYPES.find((t) => t.id === answers.projectType)?.label ?? answers.projectType;
  const lines = [
    `Python packaging pick for: ${typeLabel}`,
    `Recommendation: ${result.winner.name}${result.tie ? ` (tied with ${result.ranking[1].name})` : ""}`,
    "",
    ...result.ranking.map((entry, index) => `${index + 1}. ${entry.name} — ${entry.score} pts (${entry.share}%)`),
    "",
    `Why ${result.winner.name}:`,
    ...result.winner.reasons.map((reason) => `- ${reason}`),
    "",
    "Get started:",
    ...(STARTER_COMMANDS[result.winner.id] ?? []).map((cmd) => `  ${cmd}`),
  ];
  return lines.join("\n");
}
