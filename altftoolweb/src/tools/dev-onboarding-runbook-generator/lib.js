/**
 * Package managers used as the install channel per operating system.
 * Homebrew is the de-facto macOS choice; apt ships with Ubuntu/Debian;
 * winget ships with Windows 11 and Windows 10 21H1+.
 */
export const OPERATING_SYSTEMS = [
  { key: "macos", label: "macOS (Homebrew)", manager: "brew install" },
  { key: "ubuntu", label: "Ubuntu / Debian (apt)", manager: "sudo apt install -y" },
  { key: "windows", label: "Windows 11 (winget + WSL2)", manager: "winget install --id" },
];

/**
 * Per-tool minutes are wall-clock estimates for an unattended install on a
 * normal office connection; they are used only to size the day, not to bill.
 */
export const BASE_TOOLS = [
  { name: "Git", macos: "brew install git", ubuntu: "sudo apt install -y git", windows: "winget install --id Git.Git", verify: "git --version", minutes: 5 },
  { name: "Editor (VS Code)", macos: "brew install --cask visual-studio-code", ubuntu: "sudo snap install code --classic", windows: "winget install --id Microsoft.VisualStudioCode", verify: "code --version", minutes: 10 },
  { name: "Docker", macos: "brew install --cask docker", ubuntu: "sudo apt install -y docker.io docker-compose-plugin", windows: "winget install --id Docker.DockerDesktop", verify: "docker run --rm hello-world", minutes: 20 },
];

/**
 * Language toolchains. Each entry pins to a currently supported release line
 * so a new joiner does not land on an end-of-life runtime.
 */
export const STACK_PRESETS = [
  {
    key: "node",
    label: "Node.js / TypeScript",
    tools: [
      { name: "nvm (Node version manager)", macos: "brew install nvm", ubuntu: "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash", windows: "winget install --id CoreyButler.NVMforWindows", verify: "nvm --version", minutes: 10 },
      { name: "Node.js LTS", macos: "nvm install --lts", ubuntu: "nvm install --lts", windows: "nvm install lts", verify: "node -v && npm -v", minutes: 5 },
      { name: "pnpm", macos: "corepack enable && corepack prepare pnpm@latest --activate", ubuntu: "corepack enable && corepack prepare pnpm@latest --activate", windows: "corepack enable", verify: "pnpm -v", minutes: 3 },
    ],
    firstRun: ["pnpm install", "cp .env.example .env", "pnpm dev"],
  },
  {
    key: "python",
    label: "Python",
    tools: [
      { name: "pyenv", macos: "brew install pyenv", ubuntu: "curl https://pyenv.run | bash", windows: "winget install --id pyenv-win.pyenv-win", verify: "pyenv --version", minutes: 10 },
      { name: "Python 3.12", macos: "pyenv install 3.12 && pyenv global 3.12", ubuntu: "pyenv install 3.12 && pyenv global 3.12", windows: "pyenv install 3.12.4", verify: "python --version", minutes: 12 },
      { name: "uv (installer and resolver)", macos: "brew install uv", ubuntu: "curl -LsSf https://astral.sh/uv/install.sh | sh", windows: "winget install --id astral-sh.uv", verify: "uv --version", minutes: 3 },
    ],
    firstRun: ["uv venv", "source .venv/bin/activate", "uv pip install -r requirements.txt", "pytest -q"],
  },
  {
    key: "java",
    label: "Java / Kotlin (JVM)",
    tools: [
      { name: "SDKMAN!", macos: "curl -s https://get.sdkman.io | bash", ubuntu: "curl -s https://get.sdkman.io | bash", windows: "winget install --id Microsoft.OpenJDK.21", verify: "sdk version", minutes: 8 },
      { name: "JDK 21 (LTS)", macos: "sdk install java 21-tem", ubuntu: "sdk install java 21-tem", windows: "winget install --id Microsoft.OpenJDK.21", verify: "java -version", minutes: 10 },
      { name: "Gradle", macos: "sdk install gradle", ubuntu: "sdk install gradle", windows: "winget install --id Gradle.Gradle", verify: "gradle -v", minutes: 6 },
    ],
    firstRun: ["./gradlew build", "./gradlew test"],
  },
  {
    key: "go",
    label: "Go",
    tools: [
      { name: "Go toolchain", macos: "brew install go", ubuntu: "sudo apt install -y golang-go", windows: "winget install --id GoLang.Go", verify: "go version", minutes: 8 },
      { name: "golangci-lint", macos: "brew install golangci-lint", ubuntu: "go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest", windows: "winget install --id golangci-lint.golangci-lint", verify: "golangci-lint --version", minutes: 5 },
    ],
    firstRun: ["go mod download", "go test ./...", "go run ./cmd/api"],
  },
  {
    key: "dotnet",
    label: ".NET",
    tools: [
      { name: ".NET SDK 8 (LTS)", macos: "brew install --cask dotnet-sdk", ubuntu: "sudo apt install -y dotnet-sdk-8.0", windows: "winget install --id Microsoft.DotNet.SDK.8", verify: "dotnet --info", minutes: 12 },
    ],
    firstRun: ["dotnet restore", "dotnet build", "dotnet test"],
  },
  {
    key: "ruby",
    label: "Ruby / Rails",
    tools: [
      { name: "rbenv", macos: "brew install rbenv ruby-build", ubuntu: "sudo apt install -y rbenv", windows: "winget install --id RubyInstallerTeam.Ruby.3.3", verify: "rbenv --version", minutes: 8 },
      { name: "Ruby 3.3", macos: "rbenv install 3.3.5 && rbenv global 3.3.5", ubuntu: "rbenv install 3.3.5 && rbenv global 3.3.5", windows: "ruby -v", verify: "ruby -v", minutes: 15 },
      { name: "Bundler", macos: "gem install bundler", ubuntu: "gem install bundler", windows: "gem install bundler", verify: "bundle -v", minutes: 3 },
    ],
    firstRun: ["bundle install", "bin/rails db:setup", "bin/rails server"],
  },
];

/** Access requests, each with the team that usually grants it. */
export const ACCESS_ITEMS = [
  { key: "sso", label: "SSO / identity provider account", owner: "IT" },
  { key: "email", label: "Work email and calendar", owner: "IT" },
  { key: "chat", label: "Chat workspace and team channels", owner: "Team lead" },
  { key: "repo", label: "Source control organisation (read + write on team repos)", owner: "Platform" },
  { key: "ci", label: "CI system (view builds, re-run jobs)", owner: "Platform" },
  { key: "cloud", label: "Cloud console, read-only in production", owner: "Platform" },
  { key: "secrets", label: "Secrets manager / vault, dev scope only", owner: "Security" },
  { key: "tickets", label: "Issue tracker and the team board", owner: "Team lead" },
  { key: "errors", label: "Error tracking and log search", owner: "Platform" },
  { key: "vpn", label: "VPN or zero-trust client", owner: "IT" },
  { key: "oncall", label: "On-call/paging tool (shadow only for the first rotation)", owner: "SRE" },
  { key: "design", label: "Design tool, view access", owner: "Design" },
];

/** Minutes budgeted for each access request to be raised and granted. */
export const MINUTES_PER_ACCESS_REQUEST = 15;

/** Minutes budgeted per repository to clone, install and run once. */
export const MINUTES_PER_REPO = 20;

/** A working day used for the "does this fit in day one?" check. */
export const WORKING_DAY_MINUTES = 8 * 60;

const clean = (value) => String(value == null ? "" : value).trim();

/** A literal "|" inside a GitHub-flavoured markdown table cell must be escaped. */
const cell = (value) => clean(value).replace(/\|/g, "\\|");

/** Total the setup time for the chosen tools, access requests and repos. */
export function estimateSetupMinutes({ tools = [], accessCount = 0, repoCount = 0 } = {}) {
  const toolMinutes = (Array.isArray(tools) ? tools : []).reduce((sum, tool) => {
    const value = Number(tool && tool.minutes);
    return sum + (Number.isFinite(value) && value > 0 ? value : 0);
  }, 0);
  const access = Math.max(0, Math.floor(Number(accessCount) || 0));
  const repos = Math.max(0, Math.floor(Number(repoCount) || 0));
  const total =
    toolMinutes + access * MINUTES_PER_ACCESS_REQUEST + repos * MINUTES_PER_REPO;
  return {
    toolMinutes,
    accessMinutes: access * MINUTES_PER_ACCESS_REQUEST,
    repoMinutes: repos * MINUTES_PER_REPO,
    totalMinutes: total,
    fitsInOneDay: total <= WORKING_DAY_MINUTES,
  };
}

/** Format minutes as "3h 20m" / "45m". */
export function formatDuration(minutes) {
  const value = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

/**
 * Build the day-one runbook.
 *
 * @returns {{ markdown: string, estimate: object, toolCount: number,
 *   accessCount: number } | { error: string }}
 */
export function generateRunbook(input = {}) {
  const {
    teamName = "",
    role = "Software Engineer",
    stack = "node",
    os = "macos",
    repos = [],
    accessKeys = [],
    buddy = "",
    firstTask = "",
    includeDayTwo = true,
  } = input;

  const stackEntry = STACK_PRESETS.find((item) => item.key === stack);
  if (!stackEntry) return { error: "Pick a language stack from the list." };

  const osEntry = OPERATING_SYSTEMS.find((item) => item.key === os);
  if (!osEntry) return { error: "Pick an operating system from the list." };

  const team = clean(teamName);
  if (team === "") return { error: "Name the team so the runbook has an owner." };

  const repoList = (Array.isArray(repos) ? repos : []).map(clean).filter(Boolean);
  if (repoList.length === 0) {
    return { error: "Add at least one repository — day one is not done until the app runs locally." };
  }

  const access = ACCESS_ITEMS.filter((item) => (accessKeys || []).includes(item.key));
  if (access.length === 0) {
    return { error: "Select at least one access request — nobody starts with zero accounts." };
  }

  const tools = BASE_TOOLS.concat(stackEntry.tools);
  const estimate = estimateSetupMinutes({
    tools,
    accessCount: access.length,
    repoCount: repoList.length,
  });

  const lines = [
    `# Day-one runbook — ${team}`,
    "",
    `Role: ${clean(role) || "Software Engineer"} · Stack: ${stackEntry.label} · Machine: ${osEntry.label}`,
    `Estimated hands-on time: ${formatDuration(estimate.totalMinutes)}${estimate.fitsInOneDay ? "" : " — this will not fit in one day, split it across day one and two"}`,
    "",
    "## 0. Before the first coffee",
    "",
    "- [ ] Laptop unboxed, disk encryption on, OS updates applied",
    "- [ ] Password manager installed and the team vault shared",
    buddy ? `- [ ] Say hello to your onboarding buddy: ${clean(buddy)}` : "- [ ] Ask your lead who your onboarding buddy is",
    "",
    "## 1. Access requests (raise these first — they queue)",
    "",
    "| Access | Request from | Done |",
    "| --- | --- | --- |",
    ...access.map((item) => `| ${cell(item.label)} | ${cell(item.owner)} | [ ] |`),
    "",
    `Budgeted at ${MINUTES_PER_ACCESS_REQUEST} minutes each (${formatDuration(estimate.accessMinutes)} total) — raise every request now and carry on with the installs while they are approved.`,
    "",
    "## 2. Toolchain",
    "",
    "| Tool | Install | Verify |",
    "| --- | --- | --- |",
    ...tools.map(
      (tool) =>
        `| ${cell(tool.name)} | \`${cell(tool[osEntry.key] || tool.macos)}\` | \`${cell(tool.verify)}\` |`,
    ),
    "",
    "## 3. Repositories",
    "",
    ...repoList.flatMap((repo) => [
      `### ${repo}`,
      "",
      "```bash",
      `git clone ${repo}`,
      "```",
      "",
      ...stackEntry.firstRun.map((step) => `- [ ] \`${step}\``),
      "",
    ]),
    "## 4. Prove the environment works",
    "",
    "- [ ] The app boots locally and serves its health endpoint",
    "- [ ] The test suite passes on a clean checkout",
    "- [ ] The linter and formatter run without changes on `main`",
    "- [ ] You can open a draft pull request from a scratch branch",
    "",
  ];

  if (clean(firstTask)) {
    lines.push(
      "## 5. First task",
      "",
      clean(firstTask),
      "",
      "Aim to merge something small on day one or two — a doc fix or a log message counts. The point is to walk the whole path: branch, review, CI, merge, deploy.",
      "",
    );
  }

  if (includeDayTwo) {
    lines.push(
      "## Day two and the first week",
      "",
      "- [ ] Read the top three architecture decision records for this service",
      "- [ ] Walk the production dashboard with someone on call and learn what normal looks like",
      "- [ ] Shadow one on-call handover before joining a rotation",
      "- [ ] Book 1:1s with the two teams you depend on most",
      "- [ ] Write down every step in this runbook that was wrong and fix it — you are the last person who will notice",
      "",
    );
  }

  return {
    markdown: `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`,
    estimate,
    toolCount: tools.length,
    accessCount: access.length,
    repoCount: repoList.length,
    stackLabel: stackEntry.label,
    osLabel: osEntry.label,
  };
}
