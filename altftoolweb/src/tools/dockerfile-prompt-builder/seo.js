const seo = {
  title: "Dockerfile Prompt Builder: Multi-Stage, Non-Root",
  metaDescription:
    "Pick a runtime preset - Node, Python, Go, Java, Ruby, Rust, PHP, .NET - add port and commands, and get a prompt demanding pinned tags and a non-root USER.",
  steps: [
    "Choose a Runtime preset such as Node.js, add an optional Framework, and describe what the app does in one line.",
    "Set the Service port and the install, build and start commands (blank uses the preset), then tick hard requirements like \"Multi-stage build (small final image)\" and \"Run as non-root user\".",
    "Check the prompt word count and press Copy prompt to take the generated Dockerfile prompt to your AI assistant.",
  ],
  intro:
    "The Dockerfile Prompt Builder turns a plain description of your runtime, dependencies, port and start command into a precise AI prompt for generating a production-ready Dockerfile. It encodes Docker's published best practices — pinned base-image tags, dependency-first layer caching, multi-stage builds and a non-root user — so the assistant you paste it into cannot skip the hardening steps. It is built for developers who want a correct container build on the first generation instead of after five rounds of correction.",
  useCases: [
    "A Node.js developer containerising an Express API who wants a multi-stage build on node:22-slim with npm ci layer caching specified up front",
    "A Python team packaging a Django app who need the prompt to demand a non-root user and a HEALTHCHECK before pasting it into their AI assistant",
    "A Go engineer who wants the prompt to require a distroless final stage and a static CGO_ENABLED=0 binary without typing the conventions from memory",
  ],
  benefits: [
    ["Best practices baked in", "Every prompt can demand pinned tags, layer caching, multi-stage builds, non-root users and a .dockerignore."],
    ["Runtime presets", "Eight presets (Node, Python, Go, Java, Ruby, Rust, PHP, .NET) pre-fill the current LTS base image and install commands."],
    ["No invented dependencies", "The prompt explicitly instructs the model to use only the packages and commands you listed."],
  ],
  faqs: [
    [
      "How do I write a good prompt for generating a Dockerfile with AI?",
      "State the runtime and version, the exact dependency manifest to copy first, the install/build/start commands, the port, and the hardening you require (multi-stage, non-root, pinned tags). This tool assembles all of that into one structured prompt; vague prompts like 'write a Dockerfile for my app' are what produce bloated single-stage images running as root.",
    ],
    [
      "Why should a Dockerfile use a multi-stage build?",
      "A multi-stage build keeps compilers, package managers and build caches out of the final image, which makes it smaller and reduces the attack surface. For compiled languages the difference is dramatic — a Go builder image is over 800 MB while a distroless final stage with the binary is typically under 30 MB.",
    ],
    [
      "Why does the prompt say to copy the lock file before the source code?",
      "Docker caches each layer, so if you copy package-lock.json (or requirements.txt, go.sum, etc.) and install dependencies before copying your source, the slow install layer is reused on every rebuild where only code changed. Copying everything in one step invalidates the cache and reruns the full install on every build.",
    ],
    [
      "Should containers run as a non-root user?",
      "Yes — Docker's own best-practice documentation recommends creating a dedicated user and switching to it with the USER instruction, because a process that escapes a root container has root-equivalent leverage on shared resources. The generated prompt includes this as a hard requirement when you tick 'Run as non-root user'.",
    ],
  ],
};

export default seo;
