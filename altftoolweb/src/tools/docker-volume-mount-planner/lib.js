/**
 * Docker mount planning rules, taken from the Docker Engine storage documentation
 * (docs.docker.com/engine/storage: "Volumes", "Bind mounts", "tmpfs mounts") and the
 * `docker run` reference for the -v / --mount flags, plus the Compose file
 * specification for the `volumes` service field (short and long syntax).
 */

/**
 * Volume names must match the Docker daemon's RestrictedNamePattern
 * (moby/moby daemon/names): start with an alphanumeric, then alphanumerics,
 * underscore, dot or dash.
 */
export const VOLUME_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;

/**
 * Bind-propagation values accepted by `--mount type=bind,bind-propagation=...`.
 * `rprivate` is the Docker default (docker run reference, bind-propagation table).
 */
export const PROPAGATION_MODES = [
  "rprivate",
  "private",
  "rshared",
  "shared",
  "rslave",
  "slave",
];
export const DEFAULT_PROPAGATION = "rprivate";

/** tmpfs-size accepts a byte count with an optional b/k/m/g suffix (docker run reference). */
export const TMPFS_SIZE_PATTERN = /^\d+(?:b|k|m|g)?$/i;

export const MOUNT_TYPES = [
  {
    id: "bind",
    label: "Bind mount (host path)",
    summary:
      "Maps an existing host directory or file into the container. Content is managed by the host; great for live source code in development.",
  },
  {
    id: "volume",
    label: "Named volume (Docker managed)",
    summary:
      "Storage created and managed by Docker under its own storage area. Survives container removal; the right default for databases and persistent data.",
  },
  {
    id: "tmpfs",
    label: "tmpfs (in-memory, Linux only)",
    summary:
      "A memory-backed mount that is never written to disk and disappears when the container stops. Use for secrets and scratch space.",
  },
];

/**
 * Bind mount vs named volume decision guidance, condensed from the
 * "Choose the right type of mount" section of the Docker storage docs.
 */
export const GUIDANCE_ROWS = [
  ["Who manages the data", "You, on the host filesystem", "Docker, under /var/lib/docker/volumes"],
  ["Pre-populated from image content", "No — host path shadows the image path", "Yes — an empty named volume copies existing image content on first use"],
  ["Portable across hosts / in Compose files", "Depends on host paths existing", "Yes — created on demand by name"],
  ["Best for", "Live source code, config files you edit on the host", "Databases, upload stores, anything that must outlive the container"],
  ["Backup story", "Back up the host directory directly", "docker run --rm -v vol:/data busybox tar czf - /data"],
];

const isAbsolutePosixPath = (value) => typeof value === "string" && value.startsWith("/");

/**
 * Plan a single container mount and emit every common syntax for it.
 *
 * @param {object} input
 * @param {"bind"|"volume"|"tmpfs"} input.type
 * @param {string} input.source      Host path (bind) or volume name (volume). Ignored for tmpfs.
 * @param {string} input.target      Absolute path inside the container.
 * @param {boolean} [input.readOnly]
 * @param {string} [input.propagation]  Bind propagation mode (bind mounts only).
 * @param {""|"z"|"Z"} [input.selinux]  SELinux relabel option (bind mounts, -v syntax only).
 * @param {string} [input.tmpfsSize]    e.g. "100m" (tmpfs only, empty = unlimited within the 50% RAM default).
 * @returns {object} { cliV, cliMount, composeShort, composeLong, warnings, meta } or { error }.
 */
export function planMount({
  type,
  source = "",
  target = "",
  readOnly = false,
  propagation = DEFAULT_PROPAGATION,
  selinux = "",
  tmpfsSize = "",
}) {
  if (!MOUNT_TYPES.some((m) => m.id === type)) {
    return { error: "Choose a mount type: bind, volume or tmpfs." };
  }

  const trimmedTarget = String(target).trim();
  if (!trimmedTarget) {
    return { error: "Enter the container path (target) for the mount." };
  }
  if (!isAbsolutePosixPath(trimmedTarget)) {
    return { error: "The container path must be absolute — it has to start with / ." };
  }
  if (/\s/.test(trimmedTarget)) {
    return { error: "Container paths with spaces are not supported in -v syntax. Remove the space." };
  }

  const warnings = [];
  const trimmedSource = String(source).trim();

  if (type === "bind") {
    if (!trimmedSource) {
      return { error: "Bind mounts need a host path as the source." };
    }
    if (/\s/.test(trimmedSource)) {
      return { error: "Host paths with spaces break the colon-separated -v syntax. Use --mount only, or remove the space." };
    }
    if (!isAbsolutePosixPath(trimmedSource)) {
      // docker run treats a non-absolute -v source as a *volume name*, a classic footgun.
      if (trimmedSource.startsWith("./") || trimmedSource.startsWith("../") || trimmedSource === ".") {
        warnings.push(
          "Relative paths only work in Compose files (resolved against the compose file directory). Plain `docker run -v` would treat this as a volume name — use an absolute path or $(pwd).",
        );
      } else {
        return {
          error:
            "Host path must be absolute (start with /) or start with ./ for Compose. Otherwise docker run silently treats it as a named volume.",
        };
      }
    }
    if (!PROPAGATION_MODES.includes(propagation)) {
      return { error: `Bind propagation must be one of: ${PROPAGATION_MODES.join(", ")}.` };
    }
  }

  if (type === "volume") {
    if (trimmedSource && !VOLUME_NAME_PATTERN.test(trimmedSource)) {
      return {
        error:
          "Volume names must start with a letter or digit and contain only letters, digits, dots, dashes and underscores.",
      };
    }
    if (!trimmedSource) {
      warnings.push(
        "No volume name given — Docker will create an anonymous volume with a random 64-character name. Name it so you can find and reuse it.",
      );
    }
  }

  if (type === "tmpfs") {
    if (trimmedSource) {
      warnings.push("tmpfs mounts have no source — the source field is ignored.");
    }
    if (tmpfsSize && !TMPFS_SIZE_PATTERN.test(String(tmpfsSize).trim())) {
      return { error: "tmpfs size must be a number with an optional b, k, m or g suffix, e.g. 100m." };
    }
  }

  const useSelinux = type === "bind" && (selinux === "z" || selinux === "Z");
  if (selinux === "Z") {
    warnings.push(
      "The Z option relabels the host content as private to this one container. Never use it on system directories like /home or /usr — the relabel is applied recursively on the host.",
    );
  }
  const nonDefaultPropagation = type === "bind" && propagation !== DEFAULT_PROPAGATION;

  let cliV = "";
  let cliMount = "";
  let composeShort = "";
  let composeLong = "";

  if (type === "tmpfs") {
    const size = String(tmpfsSize).trim().toLowerCase();
    cliV = `--tmpfs ${trimmedTarget}${size ? `:size=${size}` : ""}`;
    cliMount = `--mount type=tmpfs,target=${trimmedTarget}${size ? `,tmpfs-size=${size}` : ""}`;
    composeShort = "# tmpfs has no short syntax with a size option — use long syntax";
    composeLong = [
      "volumes:",
      "  - type: tmpfs",
      `    target: ${trimmedTarget}`,
      ...(size ? ["    tmpfs:", `      size: ${size}`] : []),
    ].join("\n");
  } else {
    const vOptions = [];
    if (readOnly) vOptions.push("ro");
    if (useSelinux) vOptions.push(selinux);
    if (nonDefaultPropagation) vOptions.push(propagation);
    const vSource = trimmedSource || "";
    cliV = `-v ${vSource ? `${vSource}:` : ""}${trimmedTarget}${vOptions.length ? `:${vOptions.join(",")}` : ""}`;

    const mountParts = [`type=${type}`];
    if (trimmedSource) mountParts.push(`source=${trimmedSource}`);
    mountParts.push(`target=${trimmedTarget}`);
    if (readOnly) mountParts.push("readonly");
    if (nonDefaultPropagation) mountParts.push(`bind-propagation=${propagation}`);
    cliMount = `--mount ${mountParts.join(",")}`;
    if (useSelinux) {
      warnings.push(
        "SELinux relabelling (z/Z) is only available with -v and Compose short syntax, not with --mount.",
      );
    }

    const shortOpts = [];
    if (readOnly) shortOpts.push("ro");
    if (useSelinux) shortOpts.push(selinux);
    composeShort = `volumes:\n  - ${vSource ? `${vSource}:` : ""}${trimmedTarget}${shortOpts.length ? `:${shortOpts.join(",")}` : ""}`;

    const longLines = ["volumes:", `  - type: ${type}`];
    if (trimmedSource) longLines.push(`    source: ${trimmedSource}`);
    longLines.push(`    target: ${trimmedTarget}`);
    if (readOnly) longLines.push("    read_only: true");
    if (nonDefaultPropagation) longLines.push("    bind:", `      propagation: ${propagation}`);
    composeLong = longLines.join("\n");

    if (type === "volume") {
      composeLong += trimmedSource
        ? `\n\n# top-level declaration\nvolumes:\n  ${trimmedSource}: {}`
        : "";
    }
  }

  if (type === "bind" && !readOnly) {
    warnings.push(
      "The container can write to this host path. Add read-only if the container only needs to read it.",
    );
  }

  return {
    cliV,
    cliMount,
    composeShort,
    composeLong,
    warnings,
    meta: {
      type,
      source: type === "tmpfs" ? "(memory)" : trimmedSource || "(anonymous)",
      target: trimmedTarget,
      readOnly: Boolean(readOnly),
      propagation: type === "bind" ? propagation : "n/a",
    },
  };
}
