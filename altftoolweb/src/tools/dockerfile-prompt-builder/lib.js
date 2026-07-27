/**
 * Dockerfile Prompt Builder — assembles a precise natural-language prompt that an
 * AI coding assistant can turn into a production-quality Dockerfile.
 *
 * The runtime presets encode widely documented Docker official-image conventions:
 * slim/alpine variants for smaller images, multi-stage builds separating the build
 * toolchain from the runtime layer, and non-root users per the Docker security
 * best-practice docs (docs.docker.com/build/building/best-practices).
 */

/**
 * Runtime presets. `baseImage` is the current LTS-tagged official image on Docker Hub
 * (node:22 is Node.js LTS "Jod" until Oct 2027; python:3.12 is a maintained stable line;
 * go 1.23, eclipse-temurin 21 LTS, ruby 3.3, php 8.3, .NET 8 LTS until Nov 2026).
 * `lockFile` is the file that must be copied before installing so the dependency layer caches.
 */
export const RUNTIME_PRESETS = [
  {
    id: "node",
    label: "Node.js",
    baseImage: "node:22-slim",
    lockFile: "package.json + package-lock.json",
    installCommand: "npm ci",
    buildCommand: "npm run build",
    startCommand: "node dist/server.js",
    defaultPort: 3000,
    compiled: false,
  },
  {
    id: "python",
    label: "Python",
    baseImage: "python:3.12-slim",
    lockFile: "requirements.txt (or pyproject.toml + lock)",
    installCommand: "pip install --no-cache-dir -r requirements.txt",
    buildCommand: "",
    startCommand: "gunicorn app:app --bind 0.0.0.0:8000",
    defaultPort: 8000,
    compiled: false,
  },
  {
    id: "go",
    label: "Go",
    baseImage: "golang:1.23 (build) -> gcr.io/distroless/static (run)",
    lockFile: "go.mod + go.sum",
    installCommand: "go mod download",
    buildCommand: "CGO_ENABLED=0 go build -o /app/server ./cmd/server",
    startCommand: "/app/server",
    defaultPort: 8080,
    compiled: true,
  },
  {
    id: "java",
    label: "Java (JVM)",
    baseImage: "eclipse-temurin:21-jdk (build) -> eclipse-temurin:21-jre (run)",
    lockFile: "pom.xml or build.gradle",
    installCommand: "mvn -q dependency:go-offline",
    buildCommand: "mvn -q package -DskipTests",
    startCommand: "java -jar app.jar",
    defaultPort: 8080,
    compiled: true,
  },
  {
    id: "ruby",
    label: "Ruby",
    baseImage: "ruby:3.3-slim",
    lockFile: "Gemfile + Gemfile.lock",
    installCommand: "bundle install --without development test",
    buildCommand: "",
    startCommand: "bundle exec puma -C config/puma.rb",
    defaultPort: 3000,
    compiled: false,
  },
  {
    id: "rust",
    label: "Rust",
    baseImage: "rust:1.80 (build) -> debian:bookworm-slim (run)",
    lockFile: "Cargo.toml + Cargo.lock",
    installCommand: "cargo fetch",
    buildCommand: "cargo build --release",
    startCommand: "/app/server",
    defaultPort: 8080,
    compiled: true,
  },
  {
    id: "php",
    label: "PHP",
    baseImage: "php:8.3-fpm-alpine",
    lockFile: "composer.json + composer.lock",
    installCommand: "composer install --no-dev --optimize-autoloader",
    buildCommand: "",
    startCommand: "php-fpm",
    defaultPort: 9000,
    compiled: false,
  },
  {
    id: "dotnet",
    label: ".NET",
    baseImage: "mcr.microsoft.com/dotnet/sdk:8.0 (build) -> mcr.microsoft.com/dotnet/aspnet:8.0 (run)",
    lockFile: "*.csproj",
    installCommand: "dotnet restore",
    buildCommand: "dotnet publish -c Release -o /app/publish",
    startCommand: "dotnet App.dll",
    defaultPort: 8080,
    compiled: true,
  },
];

/** TCP port range limits (IANA): valid user-facing ports are 1-65535. */
export const PORT_MIN = 1;
export const PORT_MAX = 65535;

export const OPTIONAL_REQUIREMENTS = [
  {
    id: "multiStage",
    label: "Multi-stage build (small final image)",
    line: "Use a multi-stage build: install and compile in a builder stage, then copy only the runtime artefacts into a minimal final stage.",
  },
  {
    id: "nonRoot",
    label: "Run as non-root user",
    line: "Create a dedicated non-root user and group in the final stage and switch to it with USER before CMD (Docker security best practice).",
  },
  {
    id: "healthcheck",
    label: "HEALTHCHECK instruction",
    line: "Add a HEALTHCHECK instruction that probes the service port and fails after 3 consecutive unhealthy checks.",
  },
  {
    id: "layerCache",
    label: "Optimise layer caching",
    line: "Copy the dependency manifest/lock files and install dependencies BEFORE copying the application source, so the dependency layer is cached between builds.",
  },
  {
    id: "dockerignore",
    label: "Include .dockerignore",
    line: "Also produce a matching .dockerignore excluding VCS folders, local env files, node_modules/venv/target style folders and build output.",
  },
  {
    id: "compose",
    label: "docker-compose service block",
    line: "Also produce a docker-compose.yml service block wiring the image, port mapping, env vars and a restart policy.",
  },
];

function sanitizeLine(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Builds the Dockerfile prompt.
 * Returns { prompt, sections } or { error }.
 */
export function buildDockerfilePrompt({
  runtimeId,
  framework = "",
  appDescription = "",
  port,
  installCommand = "",
  buildCommand = "",
  startCommand = "",
  envVars = "",
  systemDeps = "",
  requirements = [],
}) {
  const preset = RUNTIME_PRESETS.find((r) => r.id === runtimeId);
  if (!preset) {
    return { error: "Pick a runtime so the prompt can name a base image." };
  }

  const portNumber = Number(port);
  if (!Number.isInteger(portNumber) || portNumber < PORT_MIN || portNumber > PORT_MAX) {
    return {
      error: `Port must be a whole number between ${PORT_MIN} and ${PORT_MAX}.`,
    };
  }

  const start = sanitizeLine(startCommand) || preset.startCommand;
  if (!start) {
    return { error: "Enter the command that starts the app so CMD can be defined." };
  }

  const install = sanitizeLine(installCommand) || preset.installCommand;
  const build = sanitizeLine(buildCommand) || preset.buildCommand;
  const fw = sanitizeLine(framework);
  const desc = sanitizeLine(appDescription);

  const envList = String(envVars ?? "")
    .split(/[\n,]+/)
    .map((v) => v.trim())
    .filter(Boolean);
  const sysList = String(systemDeps ?? "")
    .split(/[\n,]+/)
    .map((v) => v.trim())
    .filter(Boolean);

  const chosen = OPTIONAL_REQUIREMENTS.filter((o) => requirements.includes(o.id));

  const lines = [];
  lines.push(
    `Write a production-ready Dockerfile for a ${preset.label}${fw ? ` (${fw})` : ""} application${desc ? `: ${desc}` : "."}`,
  );
  lines.push("");
  lines.push("Runtime and dependencies:");
  lines.push(`- Base image: ${preset.baseImage} (pin this tag; do not use :latest).`);
  lines.push(`- Dependency manifest to copy first: ${preset.lockFile}.`);
  lines.push(`- Install dependencies with: ${install}.`);
  if (build) lines.push(`- Build step: ${build}.`);
  if (sysList.length > 0) {
    lines.push(
      `- System packages needed at build or runtime: ${sysList.join(", ")} (install in one RUN layer and clean the package cache).`,
    );
  }
  lines.push("");
  lines.push("Runtime behaviour:");
  lines.push(`- The service listens on port ${portNumber}; add EXPOSE ${portNumber}.`);
  lines.push(`- Start command (exec-form CMD): ${start}.`);
  if (envList.length > 0) {
    lines.push(
      `- Environment variables consumed at runtime (declare with ENV or document them; never bake secrets into the image): ${envList.join(", ")}.`,
    );
  }
  if (chosen.length > 0) {
    lines.push("");
    lines.push("Hard requirements:");
    chosen.forEach((c) => lines.push(`- ${c.line}`));
  }
  lines.push("");
  lines.push(
    "Output only the Dockerfile (plus any extra files requested above) in fenced code blocks, followed by a 3-line explanation of the layer structure. Do not invent dependencies that were not listed.",
  );

  return {
    prompt: lines.join("\n"),
    runtimeLabel: preset.label,
    baseImage: preset.baseImage,
    port: portNumber,
    requirementCount: chosen.length,
    envCount: envList.length,
    wordCount: lines.join(" ").split(/\s+/).filter(Boolean).length,
  };
}
