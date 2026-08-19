const seo = {
  title: "Docker HEALTHCHECK Generator: Dockerfile, Compose",
  metaDescription:
    "Generate matching Dockerfile HEALTHCHECK and compose blocks — curl, wget or nc probes — plus worst-case time to unhealthy: (retries−1)×interval+timeout.",
  steps: [
    "Pick a 'Probe type' — HTTP via curl, HTTP via wget (busybox/alpine images), TCP port open via nc, or Custom command — and set 'Container port' and 'Health endpoint path'.",
    "Tune 'Interval (s)', 'Timeout (s)', 'Retries' and 'Start period (s)', optionally ticking 'Add --start-interval (Engine 25.0+)'.",
    "Read 'Worst-case time to unhealthy' and take the Dockerfile HEALTHCHECK line plus the docker-compose block together with 'Copy both'.",
  ],
  intro:
    "This generator writes a Dockerfile HEALTHCHECK instruction and the matching Compose healthcheck block — probe command, --interval, --timeout, --retries, --start-period and the newer --start-interval — using the real defaults from the Dockerfile reference (30s interval, 30s timeout, 3 retries, 0s start period). It also computes the worst-case time before Docker marks a failing container unhealthy, (retries − 1) × interval + timeout, so you can tune detection speed deliberately.",
  useCases: [
    "Adding an HTTP health probe to a Node or Go API image and choosing between curl and busybox wget based on what the image ships",
    "Tuning a database container so orchestrators wait through a slow startup using start_period instead of inflated retries",
    "Working out why a dead container took 90 seconds to show unhealthy and cutting detection time to under 15 seconds",
  ],
  benefits: [
    ["Both formats at once", "One set of inputs yields the Dockerfile instruction and the docker-compose healthcheck block with identical timing."],
    ["Detection math shown", "The worst-case unhealthy time (retries − 1) × interval + timeout is computed live as you tune values."],
    ["Image-aware probes", "curl, busybox-wget and nc variants are generated with the right flags, plus a custom-command option for databases."],
  ],
  faqs: [
    [
      "What are the default values for Docker HEALTHCHECK?",
      "Per the Dockerfile reference: --interval=30s, --timeout=30s, --retries=3, --start-period=0s, and --start-interval=5s (the last requiring Docker Engine 25.0+). With these defaults a container that dies takes up to (3−1)×30+30 = 90 seconds to be marked unhealthy.",
    ],
    [
      "How long until Docker marks a container unhealthy?",
      "It takes retries consecutive probe failures, so from the first failing probe's start the worst case is (retries − 1) × interval + timeout. The defaults give 90 seconds; an interval of 5s, timeout of 3s and 3 retries cuts that to 13 seconds at the cost of more frequent probing.",
    ],
    [
      "What does start_period do in a Docker healthcheck?",
      "It is a boot grace window: probe failures during start_period do not count toward the retry limit, but a single success immediately marks the container healthy and ends the grace period. Use it for apps with slow initialisation instead of raising retries, which would also slow failure detection later.",
    ],
    [
      "Why does my HEALTHCHECK fail with curl not found?",
      "Many production images — distroless, alpine without extras, slim variants — do not include curl. Use the busybox wget probe (wget -q --tries=1 --spider) on alpine-based images, a language-native check like node -e with an http.get, or install curl explicitly in the final image stage.",
    ],
  ],
};

export default seo;
