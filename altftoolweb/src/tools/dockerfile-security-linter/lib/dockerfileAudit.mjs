export const DOCKERFILE_LIMITS = Object.freeze({
  maxCharacters: 200_000,
  maxPhysicalLines: 5_000,
  maxLogicalInstructions: 2_000,
  maxStages: 100,
  maxFindings: 500,
});

export const DOCKERFILE_LIMITATIONS = Object.freeze([
  "This tool parses pasted text only. It never builds, pulls, executes, or scans an image, layer, package, command, registry, host, or network.",
  "Findings are heuristic review cues. They do not prove that an image is vulnerable, compromised, reproducible, minimal, or secure.",
  "BuildKit features, shell behavior, variables, external files, base-image contents, package repositories, ignore files, and organization policy require separate contextual review.",
]);

const SENSITIVE_NAME_PATTERN =
  /(?:^|_)(?:password|passwd|pwd|secret|token|api_?key|access_?key|private_?key|credential)(?:$|_)/i;

function makeFinding(severity, code, line, stage, title, detail) {
  return { severity, code, line, stage, title, detail };
}

function findEscapeCharacter(lines) {
  for (const rawLine of lines.slice(0, 20)) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^#\s*escape\s*=\s*([\\`])\s*$/i);
    if (match) return match[1];
    if (!trimmed.startsWith("#")) break;
  }
  return "\\";
}

function toLogicalInstructions(input) {
  const physicalLines = input.replace(/\r\n?/g, "\n").split("\n");
  if (physicalLines.length > DOCKERFILE_LIMITS.maxPhysicalLines) {
    throw new RangeError(
      `Dockerfile exceeds the ${DOCKERFILE_LIMITS.maxPhysicalLines.toLocaleString("en-US")}-line local limit.`,
    );
  }
  const escapeCharacter = findEscapeCharacter(physicalLines);
  const instructions = [];
  let buffer = "";
  let startLine = 0;

  physicalLines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const trimmed = rawLine.trim();
    if (!buffer && (!trimmed || trimmed.startsWith("#"))) return;
    if (buffer && (!trimmed || trimmed.startsWith("#"))) return;
    if (!buffer) startLine = lineNumber;

    const trailingPattern =
      escapeCharacter === "\\"
        ? /\\\s*$/
        : new RegExp(`${escapeCharacter}\\s*$`);
    const continues = trailingPattern.test(rawLine);
    const fragment = continues ? rawLine.replace(trailingPattern, "") : rawLine;
    buffer += `${buffer ? " " : ""}${fragment.trim()}`;

    if (!continues) {
      const match = buffer.match(/^([a-z]+)\s+(.*)$/is);
      if (match) {
        instructions.push({
          keyword: match[1].toUpperCase(),
          argument: match[2].trim(),
          line: startLine,
        });
      } else if (buffer.trim()) {
        instructions.push({
          keyword: "UNKNOWN",
          argument: "",
          line: startLine,
        });
      }
      buffer = "";
    }
  });

  if (buffer) {
    instructions.push({
      keyword: "UNKNOWN",
      argument: "",
      line: startLine,
      unterminated: true,
    });
  }
  if (instructions.length > DOCKERFILE_LIMITS.maxLogicalInstructions) {
    throw new RangeError(
      `Dockerfile exceeds the ${DOCKERFILE_LIMITS.maxLogicalInstructions.toLocaleString("en-US")}-instruction local limit.`,
    );
  }
  return { physicalLines, instructions, escapeCharacter };
}

function parseFrom(argument) {
  const tokens = argument.split(/\s+/).filter(Boolean);
  while (tokens[0]?.startsWith("--")) tokens.shift();
  const image = tokens[0] || "";
  const asIndex = tokens.findIndex((token) => token.toUpperCase() === "AS");
  return {
    image,
    alias: asIndex >= 0 && tokens[asIndex + 1] ? tokens[asIndex + 1] : null,
  };
}

function baseReferenceStatus(image, stageAliases) {
  if (!image || image.toLowerCase() === "scratch") return "fixed";
  if (stageAliases.has(image.toLowerCase())) return "stage-alias";
  if (image.includes("$")) return "variable";
  if (/@sha256:[a-f0-9]{64}$/i.test(image)) return "digest";
  const finalSegment = image.split("/").at(-1) || "";
  if (!finalSegment.includes(":")) return "untagged";
  if (/:latest$/i.test(finalSegment)) return "latest";
  return "tagged";
}

function packagePinCue(argument) {
  const normalized = argument.replace(/\s+/g, " ");
  const managerMatch = normalized.match(
    /(?:^|&&|;|\|\|)\s*(?:sudo\s+)?(apt-get|apt|apk)\s+(?:[^;&|]*?\s)?(?:install|add)\s+([^;&|]+)/i,
  );
  if (!managerMatch) return null;
  const manager = managerMatch[1].toLowerCase();
  const candidates = managerMatch[2]
    .trim()
    .split(/\s+/)
    .filter(
      (token) =>
        token &&
        !token.startsWith("-") &&
        !token.startsWith("$") &&
        token !== "\\" &&
        !/^(?:true|false)$/i.test(token),
    );
  if (candidates.length === 0) return null;
  const unpinned = candidates.filter((token) => {
    const equalIndex = token.indexOf("=");
    if (equalIndex <= 0) return true;
    const version = token.slice(equalIndex + 1);
    return !version || /[$*?{}[\]]/u.test(version);
  });
  return {
    manager: manager.startsWith("apt") ? "APT" : "APK",
    packageCount: candidates.length,
    unpinnedCount: unpinned.length,
  };
}

function parseCopyAddSources(argument) {
  const withoutFlags = argument.replace(/^(?:--[^\s]+\s+)*/, "").trim();
  if (!withoutFlags) return [];

  if (withoutFlags.startsWith("[")) {
    try {
      const entries = JSON.parse(withoutFlags);
      if (
        Array.isArray(entries) &&
        entries.length >= 2 &&
        entries.every((entry) => typeof entry === "string")
      ) {
        return entries.slice(0, -1);
      }
    } catch {
      return [];
    }
    return [];
  }

  const tokens = withoutFlags.match(/"(?:\\.|[^"\\])*"|'[^']*'|[^\s]+/gu) || [];
  return tokens.slice(0, -1).map((token) => {
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))
    ) {
      return token.slice(1, -1);
    }
    return token;
  });
}

function parseVariableDefinitions(keyword, argument) {
  const withoutFlags = argument.replace(/^(?:--[^\s]+\s+)*/, "");
  const parts = withoutFlags.trim().split(/\s+/).filter(Boolean);
  if (keyword === "ENV" && parts.some((part) => part.includes("="))) {
    return parts
      .filter((part) => part.includes("="))
      .map((part) => {
        const equalIndex = part.indexOf("=");
        return {
          name: part.slice(0, equalIndex),
          hasValue: part.slice(equalIndex + 1).length > 0,
        };
      });
  }
  const firstToken = parts[0] || "";
  const equalIndex = firstToken.indexOf("=");
  return [
    equalIndex >= 0
      ? {
          name: firstToken.slice(0, equalIndex),
          hasValue: firstToken.slice(equalIndex + 1).length > 0,
        }
      : { name: firstToken, hasValue: parts.length > 1 },
  ];
}

function assess(counts, instructionCount) {
  if (instructionCount === 0) {
    return {
      level: "invalid",
      label: "No Dockerfile instructions found",
      description:
        "Paste a Dockerfile containing supported instruction lines to start the local review.",
    };
  }
  if (counts.high > 0) {
    return {
      level: "action",
      label: "High-priority build cues found",
      description:
        "At least one command, secret, identity, or broad build pattern deserves review before building this Dockerfile.",
    };
  }
  if (counts.medium > 0 || counts.review > 0) {
    return {
      level: "review",
      label: "Dockerfile needs contextual review",
      description:
        "No high-priority cue was observed, but one or more reproducibility or runtime-hardening checks need attention.",
    };
  }
  return {
    level: "clear",
    label: "No configured lint cue observed",
    description:
      "The limited local rules did not flag the pasted text. This is not an image, dependency, runtime, or security validation.",
  };
}

export function analyzeDockerfile(input) {
  if (typeof input !== "string") {
    throw new TypeError("Dockerfile input must be text.");
  }
  if (input.length > DOCKERFILE_LIMITS.maxCharacters) {
    throw new RangeError(
      `Dockerfile exceeds the ${DOCKERFILE_LIMITS.maxCharacters.toLocaleString("en-US")}-character local limit.`,
    );
  }

  const { physicalLines, instructions, escapeCharacter } =
    toLogicalInstructions(input);
  const findings = [];
  const observedCounts = { high: 0, medium: 0, review: 0 };
  const findingCodeCounts = {};
  let truncated = false;
  const priority = { review: 1, medium: 2, high: 3 };
  const add = (finding) => {
    observedCounts[finding.severity] += 1;
    findingCodeCounts[finding.code] =
      (findingCodeCounts[finding.code] || 0) + 1;
    if (findings.length < DOCKERFILE_LIMITS.maxFindings) {
      findings.push(finding);
      return;
    }
    truncated = true;
    const replacementIndex = findings.findIndex(
      (stored) => priority[stored.severity] < priority[finding.severity],
    );
    if (replacementIndex >= 0) findings[replacementIndex] = finding;
  };
  const stages = [];
  const stageAliases = new Set();
  let currentStage = null;

  instructions.forEach((instruction) => {
    if (instruction.keyword === "FROM") {
      if (stages.length >= DOCKERFILE_LIMITS.maxStages) {
        throw new RangeError(
          `Dockerfile exceeds the ${DOCKERFILE_LIMITS.maxStages}-stage local limit.`,
        );
      }
      const parsed = parseFrom(instruction.argument);
      currentStage = {
        number: stages.length + 1,
        alias: parsed.alias,
        image: parsed.image,
        line: instruction.line,
        users: [],
        hasHealthcheck: false,
      };
      stages.push(currentStage);

      const baseStatus = baseReferenceStatus(parsed.image, stageAliases);
      if (baseStatus === "latest" || baseStatus === "untagged") {
        add(
          makeFinding(
            "medium",
            "floating-base-reference",
            instruction.line,
            currentStage.number,
            "Base image reference can move",
            "The FROM reference uses no tag or the latest tag. Consider a reviewed immutable digest or controlled versioning strategy.",
          ),
        );
      } else if (baseStatus === "variable") {
        add(
          makeFinding(
            "review",
            "variable-base-reference",
            instruction.line,
            currentStage.number,
            "Base image is supplied through a variable",
            "Resolve the build-time value separately to confirm its registry, versioning, and digest controls.",
          ),
        );
      }
      if (parsed.alias) stageAliases.add(parsed.alias.toLowerCase());
      return;
    }

    const stageNumber = currentStage?.number || null;
    if (!currentStage && instruction.keyword !== "ARG") {
      add(
        makeFinding(
          "review",
          "instruction-before-from",
          instruction.line,
          null,
          "Instruction appears before the first FROM",
          "Only parser directives, comments, and permitted global ARG instructions normally precede the first build stage.",
        ),
      );
    }

    if (instruction.keyword === "USER" && currentStage) {
      currentStage.users.push({
        line: instruction.line,
        value: instruction.argument.trim().split(/[:\s]/)[0].toLowerCase(),
      });
    }
    if (instruction.keyword === "HEALTHCHECK" && currentStage) {
      currentStage.hasHealthcheck = !/^none(?:\s|$)/i.test(
        instruction.argument,
      );
    }

    if (
      instruction.keyword === "RUN" &&
      /\b(?:curl|wget)\b[\s\S]{0,500}\|\s*(?:\/bin\/)?(?:ba|z|k)?sh\b/i.test(
        instruction.argument,
      )
    ) {
      add(
        makeFinding(
          "high",
          "download-piped-to-shell",
          instruction.line,
          stageNumber,
          "Downloaded content is piped to a shell",
          "Fetch, verify, and execute should be separate, reviewable steps with an authenticated origin and integrity control.",
        ),
      );
    }

    if (instruction.keyword === "ARG" || instruction.keyword === "ENV") {
      const variables = parseVariableDefinitions(
        instruction.keyword,
        instruction.argument,
      );
      for (const variable of variables) {
        if (SENSITIVE_NAME_PATTERN.test(variable.name)) {
          add(
            makeFinding(
              instruction.keyword === "ENV" || variable.hasValue
                ? "high"
                : "medium",
              instruction.keyword === "ENV"
                ? "secret-like-env"
                : "secret-like-build-arg",
              instruction.line,
              stageNumber,
              `${instruction.keyword} uses a secret-like variable name`,
              instruction.keyword === "ENV"
                ? "Environment values can persist in image configuration or layers. Use an appropriate runtime secret mechanism."
                : "Build arguments are not a secret channel and may be exposed in metadata or build history. Prefer a supported secret mount.",
            ),
          );
        }
      }
    }

    if (instruction.keyword === "RUN") {
      const packageCue = packagePinCue(instruction.argument);
      if (packageCue?.unpinnedCount > 0) {
        add(
          makeFinding(
            "medium",
            "unpinned-os-packages",
            instruction.line,
            stageNumber,
            `${packageCue.manager} install contains unpinned packages`,
            `${packageCue.unpinnedCount} of ${packageCue.packageCount} observed package arguments have no exact version expression. Confirm the intended reproducibility and update policy.`,
          ),
        );
      }
    }

    if (instruction.keyword === "COPY" || instruction.keyword === "ADD") {
      const sources = parseCopyAddSources(instruction.argument);
      if (
        sources.some(
          (source) => source === "." || source === "./" || source === "*",
        )
      ) {
        add(
          makeFinding(
            "medium",
            "broad-build-context-copy",
            instruction.line,
            stageNumber,
            "A broad build-context copy was observed",
            "Confirm the source set and ignore rules so credentials, local artifacts, and unnecessary files cannot enter build context or layers.",
          ),
        );
      }
      if (
        instruction.keyword === "ADD" &&
        sources.some((source) => /^https?:\/\//i.test(source))
      ) {
        add(
          makeFinding(
            "high",
            "remote-add",
            instruction.line,
            stageNumber,
            "ADD uses a remote URL",
            "Review origin authentication, redirects, integrity verification, caching, and extraction behavior separately.",
          ),
        );
      }
    }

    if (instruction.keyword === "UNKNOWN") {
      add(
        makeFinding(
          "review",
          instruction.unterminated
            ? "unterminated-continuation"
            : "unparsed-instruction",
          instruction.line,
          stageNumber,
          instruction.unterminated
            ? "Continuation does not terminate"
            : "Instruction could not be parsed",
          "Review the parser directive, escape character, and instruction syntax.",
        ),
      );
    }
  });

  if (stages.length === 0 && instructions.length > 0) {
    add(
      makeFinding(
        "review",
        "missing-from",
        null,
        null,
        "No FROM instruction found",
        "A standard Dockerfile build stage begins with FROM.",
      ),
    );
  }

  const finalStage = stages.at(-1);
  if (finalStage) {
    const finalUser = finalStage.users.at(-1);
    if (!finalUser) {
      add(
        makeFinding(
          "medium",
          "final-stage-user-unspecified",
          finalStage.line,
          finalStage.number,
          "Final stage does not declare USER",
          "The runtime user depends on the base image. Confirm it explicitly and use the least privilege required by the application.",
        ),
      );
    } else if (
      finalUser.value === "root" ||
      /^\+?0+(?:\.0+)?$/u.test(finalUser.value)
    ) {
      add(
        makeFinding(
          "high",
          "final-stage-root-user",
          finalUser.line,
          finalStage.number,
          "Final stage explicitly selects root",
          "Confirm whether the application can run as a dedicated non-root UID with narrower filesystem and capability access.",
        ),
      );
    }
    if (!finalStage.hasHealthcheck) {
      add(
        makeFinding(
          "review",
          "final-stage-healthcheck-missing",
          finalStage.line,
          finalStage.number,
          "No active HEALTHCHECK in the final stage",
          "If orchestration does not provide an external health probe, consider an appropriate bounded health check.",
        ),
      );
    }
  }

  const counts = observedCounts;

  return {
    findings,
    counts,
    stats: {
      charactersInspected: input.length,
      physicalLines: physicalLines.length,
      logicalInstructions: instructions.length,
      stages: stages.length,
      escapeCharacter: escapeCharacter === "\\" ? "backslash" : "backtick",
    },
    assessment: assess(counts, instructions.length),
    truncated,
    findingCodeCounts,
    limitations: [...DOCKERFILE_LIMITATIONS],
  };
}

export function buildDockerfileAuditReport(result) {
  return {
    tool: "Dockerfile Security Linter",
    scope: "Counts-only local heuristic lint",
    assessment: result.assessment.level,
    counts: { ...result.counts },
    stats: { ...result.stats },
    findingCodes:
      result.findingCodeCounts ||
      result.findings.reduce((accumulator, finding) => {
        accumulator[finding.code] = (accumulator[finding.code] || 0) + 1;
        return accumulator;
      }, {}),
    truncated: Boolean(result.truncated),
    limitations: [...DOCKERFILE_LIMITATIONS],
  };
}
