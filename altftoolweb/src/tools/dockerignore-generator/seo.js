const seo = {
  intro:
    "This generator builds a sectioned .dockerignore file from your toolchain (Node, Python, Go, Rust, Java, .NET, PHP, Ruby) plus cross-cutting groups for version control, secrets, editor clutter, CI configs and logs. Patterns follow the Docker build-context rules — Go filepath.Match syntax extended with ** and ! negation, matched relative to the context root — and duplicates across selections are removed automatically.",
  useCases: [
    "A Node developer whose docker build uploads a 400 MB context because node_modules and .git are not excluded",
    "A team hardening a pipeline by keeping .env, *.pem and *.key files out of the build context so secrets never reach image layers",
    "A monorepo maintainer combining Python and Node presets with custom patterns for local data folders",
  ],
  benefits: [
    ["Stack-aware presets", "Each toolchain gets its documented local artifacts: node_modules, __pycache__, Rust target/, .NET bin/ and obj/, and more."],
    ["Secrets stay out", "The env group excludes .env files and private keys, preventing accidental COPY . leaks into images."],
    ["Deduplicated sections", "Overlapping patterns (like target/ from Rust and Maven) appear once, under a commented section header."],
  ],
  faqs: [
    [
      "What does a .dockerignore file do?",
      "It excludes files from the build context that the Docker client sends to the daemon (or BuildKit) before a build, so ignored files cannot be COPYed into the image and do not slow the upload. On large projects excluding .git and dependency folders routinely cuts the context from hundreds of megabytes to a few.",
    ],
    [
      "Should node_modules be in .dockerignore?",
      "Yes, in the standard workflow where the Dockerfile runs npm ci or npm install inside the image — the host's node_modules may contain platform-specific binaries that break the container. The one exception is a Dockerfile that deliberately COPYs a prebuilt node_modules or bundle, which would then fail.",
    ],
    [
      "Does .dockerignore use the same syntax as .gitignore?",
      "It is similar but not identical: .dockerignore uses Go's filepath.Match rules extended with ** for any number of directories and ! for exceptions, matched against paths relative to the context root. Notably, a bare name like node_modules matches only at the root — use **/node_modules to ignore it at any depth.",
    ],
    [
      "Should the Dockerfile itself be in .dockerignore?",
      "You can list Dockerfile and .dockerignore to shrink the context slightly, and modern BuildKit still builds fine because it reads the Dockerfile directly rather than from the context. Avoid this only if some tooling in your pipeline expects the Dockerfile inside the context.",
    ],
  ],
};

export default seo;
