/**
 * Base image comparison data. Sizes are approximate UNCOMPRESSED sizes of the
 * current stable tags as reported on Docker Hub / gcr.io image manifests
 * (mid-2025): scratch is empty by definition, alpine ~8 MB, distroless
 * static ~2 MB, distroless base (glibc) ~21 MB, debian slim ~75 MB,
 * ubuntu LTS ~78 MB, debian full ~117 MB. They shift a few MB between
 * releases, which is why each entry says "approx".
 *
 * Pure data + a pure ranking function. No React, no DOM.
 */

export const LIBC = {
  GLIBC: "glibc",
  MUSL: "musl",
  NONE: "none",
};

export const BASE_IMAGES = [
  {
    id: "scratch",
    name: "scratch",
    example: "FROM scratch",
    approxSizeMB: 0, // scratch is the reserved empty image — no filesystem at all
    libc: LIBC.NONE,
    hasShell: false,
    hasPackageManager: false,
    hasCaCertsByDefault: false,
    debugTooling: "None — no shell, no ls, nothing. Debug via ephemeral containers or copy tools in.",
    notes: "Only for fully static binaries (Go with CGO_ENABLED=0, Rust musl targets). You must COPY in CA certs and tzdata yourself.",
  },
  {
    id: "distroless-static",
    name: "distroless/static (Debian-based)",
    example: "FROM gcr.io/distroless/static-debian12",
    approxSizeMB: 2, // ~2 MB per the GoogleContainerTools/distroless README
    libc: LIBC.NONE,
    hasShell: false,
    hasPackageManager: false,
    hasCaCertsByDefault: true,
    debugTooling: "None in the default tag; use the :debug tag (adds busybox) or ephemeral containers.",
    notes: "Static binaries plus CA certificates, tzdata and a nonroot user — the safer alternative to scratch.",
  },
  {
    id: "alpine",
    name: "alpine",
    example: "FROM alpine:3.20",
    approxSizeMB: 8, // ~8 MB uncompressed per Docker Hub
    libc: LIBC.MUSL,
    hasShell: true,
    hasPackageManager: true, // apk
    hasCaCertsByDefault: false, // install via `apk add --no-cache ca-certificates`
    debugTooling: "busybox shell + apk to install anything on demand.",
    notes: "musl libc, not glibc: DNS resolution and some prebuilt binaries (older Node, glibc wheels for Python) behave differently or need workarounds.",
  },
  {
    id: "distroless-base",
    name: "distroless/base (glibc)",
    example: "FROM gcr.io/distroless/base-debian12",
    approxSizeMB: 21, // ~20-21 MB per the distroless README
    libc: LIBC.GLIBC,
    hasShell: false,
    hasPackageManager: false,
    hasCaCertsByDefault: true,
    debugTooling: "None in the default tag; :debug tag adds a busybox shell.",
    notes: "glibc, openssl, CA certs, tzdata — for dynamically linked binaries that need glibc but no OS tooling.",
  },
  {
    id: "debian-slim",
    name: "debian slim",
    example: "FROM debian:bookworm-slim",
    approxSizeMB: 75, // ~75 MB uncompressed per Docker Hub
    libc: LIBC.GLIBC,
    hasShell: true,
    hasPackageManager: true, // apt
    hasCaCertsByDefault: false, // install ca-certificates via apt
    debugTooling: "bash + apt; docs and locales stripped compared with full debian.",
    notes: "The pragmatic default for glibc apps that need apt but not a full distro. Language 'slim' tags (python:3.12-slim) build on it.",
  },
  {
    id: "ubuntu",
    name: "ubuntu LTS",
    example: "FROM ubuntu:24.04",
    approxSizeMB: 78, // ~78 MB uncompressed per Docker Hub
    libc: LIBC.GLIBC,
    hasShell: true,
    hasPackageManager: true, // apt
    hasCaCertsByDefault: false,
    debugTooling: "bash + apt with Ubuntu's large package universe.",
    notes: "Familiar tooling and 5-year LTS support windows; slightly larger than debian slim.",
  },
  {
    id: "debian-full",
    name: "debian (full)",
    example: "FROM debian:bookworm",
    approxSizeMB: 117, // ~117 MB uncompressed per Docker Hub
    libc: LIBC.GLIBC,
    hasShell: true,
    hasPackageManager: true,
    hasCaCertsByDefault: false,
    debugTooling: "Full userland: bash, apt, perl, docs — easiest to debug interactively.",
    notes: "Largest option; use when builds need many system packages or you are prototyping.",
  },
];

export const BINARY_TYPES = [
  { id: "static", label: "Fully static binary (Go CGO_ENABLED=0, Rust musl)" },
  { id: "dynamic-glibc", label: "Dynamically linked against glibc (most prebuilt binaries)" },
  { id: "dynamic-musl", label: "Built for musl, or I can rebuild against musl" },
  { id: "interpreted", label: "Interpreted runtime (Python, Node, Ruby, JVM...)" },
];

/**
 * Rank base images for a workload.
 *
 * Hard filters (an image failing one is excluded, with the reason):
 *  - static binaries run anywhere; glibc binaries need glibc; musl builds
 *    need musl or glibc-with-musl-compat is NOT assumed; interpreted
 *    runtimes need a package manager (to install the runtime) unless the
 *    official runtime image is used — we require a package manager.
 *  - needsShell excludes shell-less images; needsPackageManager likewise.
 * Ranking: smallest surviving image first (size is both attack surface and
 * pull time), which encodes the standard guidance "smallest image that
 * satisfies your runtime requirements".
 *
 * @returns {{ranked: [{image, fits, reasons}], best}|{error}}
 */
export function rankBaseImages({ binaryType, needsShell = false, needsPackageManager = false, needsTlsCerts = false }) {
  const type = BINARY_TYPES.find((t) => t.id === binaryType);
  if (!type) return { error: "Choose what kind of binary or runtime you are shipping." };

  const ranked = BASE_IMAGES.map((image) => {
    const reasons = [];

    if (binaryType === "dynamic-glibc" && image.libc !== LIBC.GLIBC) {
      reasons.push(
        image.libc === LIBC.MUSL
          ? "Ships musl, not glibc — glibc-linked binaries will not run without gcompat hacks."
          : "Ships no libc at all — a dynamically linked binary cannot start.",
      );
    }
    if (binaryType === "dynamic-musl" && image.libc !== LIBC.MUSL) {
      reasons.push(
        image.libc === LIBC.GLIBC
          ? "Ships glibc, not musl — a musl-linked binary needs the musl dynamic loader (ld-musl-*.so.1), which this image does not provide."
          : "Ships no libc — a dynamically linked musl binary cannot start.",
      );
    }
    if (binaryType === "interpreted" && !image.hasPackageManager) {
      reasons.push("No package manager to install the interpreter — use the official runtime image instead.");
    }
    if (needsShell && !image.hasShell) {
      reasons.push("No shell, but you said you need one (exec debugging, entrypoint scripts).");
    }
    if (needsPackageManager && !image.hasPackageManager) {
      reasons.push("No package manager, but you said you need to install OS packages at build time.");
    }

    return { image, fits: reasons.length === 0, reasons };
  }).sort((a, b) => {
    if (a.fits !== b.fits) return a.fits ? -1 : 1;
    return a.image.approxSizeMB - b.image.approxSizeMB;
  });

  const best = ranked.find((r) => r.fits);
  if (!best) {
    return {
      error:
        "No base image satisfies that combination — relax a requirement (for example, distroless :debug tags add a shell).",
    };
  }

  const caveats = [];
  if (needsTlsCerts && !best.image.hasCaCertsByDefault) {
    caveats.push(
      best.image.id === "scratch"
        ? "scratch has no CA certificates — COPY /etc/ssl/certs/ca-certificates.crt in from a build stage."
        : "Install the ca-certificates package in your Dockerfile; this base does not ship CA certs by default.",
    );
  }

  return { ranked, best, caveats };
}
