const seo = {
  title: "Environment Variable Name Checker – POSIX & Prefix Rules",
  metaDescription:
    "Check names against POSIX [A-Za-z_][A-Za-z0-9_]*, UPPER_SNAKE_CASE, reserved names like PATH, and risky prefixes like GITHUB_ and NEXT_PUBLIC_.",
  steps: [
    "Paste names into the 'Variable names' box — one per line, comma separated, or whole .env lines — starting from the built-in example list.",
    "Checks run live against the POSIX rule [A-Za-z_][A-Za-z0-9_]*, UPPER_SNAKE_CASE convention, reserved names like PATH and IFS, and prefixes like GITHUB_, LD_ and NEXT_PUBLIC_.",
    "Read the per-name OK / Warning / Error verdicts with reasons plus the Names checked / Errors / Warnings / Clean counts, then click 'Copy report'.",
  ],
  intro:
    "This tool checks environment variable names against the POSIX portable rule [A-Za-z_][A-Za-z0-9_]* (IEEE Std 1003.1, section 8.1), the UPPER_SNAKE_CASE convention, reserved system names such as PATH and IFS, and platform-owned prefixes like GITHUB_, LD_, npm_ and NEXT_PUBLIC_. It is for developers naming new configuration variables who want them to work identically in shells, Docker, CI runners and frontend build tools.",
  useCases: [
    "Vet the variable names in a new service's configuration before they harden into deploy scripts, Helm charts and CI secrets.",
    "Catch a NEXT_PUBLIC_ or VITE_ prefixed secret before the framework inlines the credential into the public browser bundle.",
    "Check that names invented on a Node-only project (hyphens, dots, lowercase) will survive a move to docker --env-file or a POSIX shell.",
  ],
  benefits: [
    ["Standards-based", "The core rule is POSIX IEEE Std 1003.1 §8.1, so an accepted name is portable across shells, exec environments and Docker."],
    ["Platform prefix knowledge", "Flags GITHUB_ (rejected by GitHub Actions), LD_/DYLD_ (linker-interpreted), npm_, AWS_, KUBERNETES_ and more, each with the reason."],
    ["Secret-exposure guard", "A secret-looking name under a client-exposing prefix like NEXT_PUBLIC_ is reported as an error, not a style nit."],
  ],
  faqs: [
    [
      "What characters are allowed in an environment variable name?",
      "Portably: an uppercase or lowercase letter or underscore, followed by letters, digits or underscores — the POSIX pattern [A-Za-z_][A-Za-z0-9_]*. Hyphens, dots and names starting with a digit may work in some language-level parsers like npm's dotenv, but shells, docker --env-file and most CI systems reject them.",
    ],
    [
      "Why can't I create a custom GITHUB_ environment variable in GitHub Actions?",
      "GitHub's documentation reserves the GITHUB_ prefix for variables the runner itself sets (GITHUB_SHA, GITHUB_REF and so on), and attempts to set a custom GITHUB_-prefixed variable via the environment files API fail with an error. Use a project-specific prefix instead.",
    ],
    [
      "Is it safe to put a secret in a NEXT_PUBLIC_ variable?",
      "No. Next.js inlines every NEXT_PUBLIC_ variable into the JavaScript shipped to browsers at build time, so the value becomes public to anyone who opens dev tools. The same applies to VITE_, REACT_APP_, GATSBY_ and EXPO_PUBLIC_ prefixes — keep secrets in server-only variables.",
    ],
    [
      "Should environment variables be uppercase?",
      "By convention, yes — POSIX section 8.1 notes that uppercase names are used by the system and standard utilities, while lowercase names are reserved for application and shell-local use. UPPER_SNAKE_CASE also prevents case-confusion bugs, because environment lookups are case-sensitive on Linux but case-insensitive on Windows.",
    ],
  ],
};

export default seo;
