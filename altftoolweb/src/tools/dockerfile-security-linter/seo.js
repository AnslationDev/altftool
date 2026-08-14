const seo = {
  title: "Dockerfile Security Linter: root, :latest, curl to bash",
  metaDescription:
    "Paste a Dockerfile and get line-numbered findings for curl piped to a shell, ADD from a URL, :latest bases, secret-like ENV and a root final stage.",
  steps: [
    "Paste your build file into the Dockerfile source box, or press Choose file to pick a Dockerfile, or Load hardened sample for a digest-pinned multi-stage example.",
    "Press Run local inspection; backslash continuations are joined into logical instructions and each FROM ... AS stage is tracked separately, with no image built, pulled or executed.",
    "Read the Stages, Instructions, High and Review cues counts plus each entry under Review findings with its Line number and stage, then press Download report to save dockerfile-audit-counts-only.json, or Copy report.",
  ],
  intro:
    "The Dockerfile Security Linter parses a pasted Dockerfile into logical instructions — honouring line continuations and the # escape parser directive — and flags roughly a dozen risky build patterns at high, medium or review severity, each with the line number and build stage it came from. It catches curl or wget piped straight into a shell, ADD from a remote URL, ENV and ARG names that look like secrets, :latest or untagged base images, unpinned apt/apk installs, COPY . into the image, a final stage still running as root, and a missing HEALTHCHECK. It reads text only: it never builds, pulls, runs or scans an image, so findings are review cues rather than proof of a vulnerability.",
  useCases: [
    "You inherited a service's Dockerfile and want a first pass on it before the next build, specifically to see whether the final stage ever drops from root to a USER.",
    "A pull request adds a RUN line that pipes an install script from the internet into bash, and you want the specific line number and a plain explanation to paste into the review.",
    "You are chasing non-reproducible builds and need to find every FROM on :latest or with no tag, plus every apt-get install where the package versions are not pinned.",
  ],
  benefits: [
    [
      "Multi-stage aware",
      "Tracks each FROM ... AS stage separately, so root-user and missing-healthcheck findings apply to the stage that actually ships, not to a discarded builder.",
    ],
    [
      "Parses like a builder does",
      "Joins backslash continuations into one logical instruction and respects a # escape=` directive, so a rule is not missed just because a RUN spans ten lines.",
    ],
    [
      "Severity that reflects exposure",
      "A secret-like name on ENV is rated high because the value persists in image configuration, while the same name on a valueless ARG is rated medium.",
    ],
  ],
  faqs: [
    [
      "Why is piping curl into bash flagged in a Dockerfile?",
      "Because fetching and executing in one step leaves nothing to review or verify — whatever the URL returns at build time runs with full build privileges. Splitting it into fetch, verify the checksum or signature, then execute makes the step auditable, so this pattern is rated high severity.",
    ],
    [
      "Should a Dockerfile pin the base image tag?",
      "Yes — a bare image name or one ending in :latest is flagged because the base can change between builds. Pinning to a specific version tag, or better a @sha256: digest, is treated as fixed and produces no finding.",
    ],
    [
      "Is it a problem if my container runs as root?",
      "The linter raises a high-severity finding when the final stage's last USER is root (or UID 0), and a medium one when no USER is set at all, since the build then defaults to root. Adding a non-root USER before the final CMD limits what a compromised process can reach.",
    ],
    [
      "Can I paste a very large Dockerfile?",
      "Up to 200,000 characters, 5,000 physical lines, 2,000 logical instructions and 100 build stages; beyond that the parse stops with a limit message. Up to 500 findings are counted internally, with high-severity ones kept in preference to lower ones if that cap is hit, but only the first 100 are shown as individual cards on screen — the aggregate counts and exported rule totals still reflect every one of the up-to-500.",
    ],
  ],
};

export default seo;
