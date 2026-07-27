/**
 * Terraform Provider Block Generator.
 *
 * Emits a `terraform { required_version, required_providers { ... } }` block plus
 * the matching `provider "..." { ... }` blocks, following the rules in the
 * Terraform language documentation:
 *
 *  - Provider requirements go in `required_providers` inside the `terraform`
 *    block, keyed by the provider's LOCAL NAME, with `source` and `version`.
 *  - A source address is `[<HOSTNAME>/]<NAMESPACE>/<TYPE>`; with the hostname
 *    omitted Terraform assumes the public registry, registry.terraform.io.
 *  - A `provider` block with no `alias` is the default configuration. Every
 *    additional configuration of the same provider must carry a unique `alias`,
 *    and resources select it with `provider = <local_name>.<alias>`.
 *  - Reusable child modules must NOT contain their own `provider` blocks. They
 *    declare the extra configurations they expect with `configuration_aliases`
 *    inside `required_providers`, and the caller passes them in via `providers`.
 *
 * Everything here is pure string work: same input -> same output, no clock,
 * no network, no DOM.
 */

/* ------------------------------------------------------------------ *
 * Version constraints
 * ------------------------------------------------------------------ */

/**
 * Terraform version constraint operators, from the "Version Constraints" page
 * of the Terraform language docs.
 *
 * `~>` is the pessimistic operator: it allows the RIGHTMOST component given to
 * increment and nothing to its left. `~> 5.0` means >= 5.0, < 6.0 and
 * `~> 5.31.0` means >= 5.31.0, < 5.32.0. Terraform rejects `~> 5` because the
 * operator needs at least a major and a minor component to know what may move.
 */
export const CONSTRAINT_STYLES = [
  {
    id: "pessimistic",
    label: "Pessimistic ~> (allow the rightmost part to move)",
    operator: "~>",
    minParts: 2,
    explain: (version, ceiling) => `~> ${version} allows >= ${version} and < ${ceiling}.`,
  },
  {
    id: "minimum",
    label: "Minimum >= (allow anything newer)",
    operator: ">=",
    minParts: 1,
    explain: (version) => `>= ${version} allows every later release, including the next major version.`,
  },
  {
    id: "exact",
    label: "Exact = (pin one release)",
    operator: "=",
    minParts: 1,
    explain: (version) => `= ${version} pins exactly ${version}; no upgrade happens without editing this file.`,
  },
  {
    id: "range",
    label: "Explicit range >= x, < upper bound (the long form of ~>)",
    operator: ">=",
    minParts: 1,
    explain: (version, ceiling) => `>= ${version}, < ${ceiling} is the long form of the pessimistic constraint.`,
  },
];

export function getConstraintStyle(id) {
  return CONSTRAINT_STYLES.find((style) => style.id === id) || null;
}

/** A version is 1-3 dot-separated non-negative integers, e.g. 5, 5.31, 5.31.0. */
const VERSION_PATTERN = /^\d+(\.\d+){0,2}$/;

/** Parse "5.31.0" into [5, 31, 0]; returns null when the string is not a version. */
export function parseVersionParts(version) {
  const text = String(version ?? "").trim();
  if (!VERSION_PATTERN.test(text)) return null;
  return text.split(".").map(Number);
}

/**
 * The exclusive upper bound the pessimistic operator implies: the rightmost
 * component given is the one allowed to move, so everything left of it is held
 * and the component to ITS left is bumped by one.
 *   ~> 5.0    -> < 6.0
 *   ~> 5.31.0 -> < 5.32.0
 */
export function pessimisticCeiling(version) {
  const parts = parseVersionParts(version);
  if (!parts || parts.length < 2) return null;
  const held = parts.slice(0, parts.length - 1);
  held[held.length - 1] += 1;
  // Keep the same number of components as the input, zeroing the ones dropped,
  // so ~> 5.31.0 reads as < 5.32.0 rather than the ambiguous < 5.32.
  while (held.length < parts.length) held.push(0);
  return held.join(".");
}

/**
 * Build the string that goes on the right of `version =`.
 * @returns {{error:string}|{constraint:string, explanation:string}}
 */
export function buildVersionConstraint({ version, styleId } = {}) {
  const style = getConstraintStyle(styleId);
  if (!style) return { error: "Choose how tightly to constrain the provider version." };

  const text = String(version ?? "").trim();
  if (text === "") return { error: "Enter a provider version, such as 5.31.0." };

  const parts = parseVersionParts(text);
  if (!parts) {
    return { error: `"${text}" is not a version. Use one to three numbers separated by dots, such as 5.31.0.` };
  }
  if (parts.length < style.minParts) {
    return {
      error: `The ${style.operator} operator needs at least a major and a minor version — write ${text}.0 rather than ${text}.`,
    };
  }

  if (style.id === "pessimistic") {
    const ceiling = pessimisticCeiling(text);
    return { constraint: `~> ${text}`, explanation: style.explain(text, ceiling) };
  }
  if (style.id === "range") {
    const ceiling = parts.length >= 2 ? pessimisticCeiling(text) : `${parts[0] + 1}.0`;
    return { constraint: `>= ${text}, < ${ceiling}`, explanation: style.explain(text, ceiling) };
  }
  if (style.id === "minimum") {
    return { constraint: `>= ${text}`, explanation: style.explain(text) };
  }
  return { constraint: text, explanation: style.explain(text) };
}

/* ------------------------------------------------------------------ *
 * Names and source addresses
 * ------------------------------------------------------------------ */

/**
 * Registry namespaces and provider types are lowercase alphanumeric with
 * dashes. The optional leading hostname may also contain dots.
 */
const SOURCE_PATTERN = /^(?:[a-z0-9][a-z0-9.-]*\/)?[a-zA-Z0-9][a-zA-Z0-9-]*\/[a-z0-9][a-z0-9-]*$/;

/**
 * Terraform identifiers — used for provider local names and for aliases — start
 * with a letter or underscore and continue with letters, digits, underscores or
 * dashes. Local names are conventionally all lowercase because they must match
 * the prefix of the resource type (`aws_s3_bucket` -> local name `aws`).
 */
const LOCAL_NAME_PATTERN = /^[a-z][a-z0-9_-]*$/;
const ALIAS_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_-]*$/;

export function isValidSource(source) {
  return SOURCE_PATTERN.test(String(source ?? "").trim());
}

export function isValidLocalName(name) {
  return LOCAL_NAME_PATTERN.test(String(name ?? "").trim());
}

export function isValidAlias(alias) {
  return ALIAS_PATTERN.test(String(alias ?? "").trim());
}

/** "hashicorp/aws" -> "registry.terraform.io/hashicorp/aws" */
export function expandSource(source) {
  const text = String(source ?? "").trim();
  if (!isValidSource(text)) return null;
  return text.split("/").length === 2 ? `registry.terraform.io/${text}` : text;
}

/* ------------------------------------------------------------------ *
 * Provider catalogue
 * ------------------------------------------------------------------ */

/**
 * Common providers with their real registry source addresses. Versions are the
 * current major line at the time of writing and are editable — always check the
 * registry for the release you actually want to pin.
 *
 * `requiredBlocks` holds arguments the provider will not start without: the
 * azurerm provider has required a `features` block in every provider block since
 * version 2.0.
 */
export const PROVIDER_CATALOG = [
  {
    localName: "aws",
    label: "AWS",
    source: "hashicorp/aws",
    version: "5.31.0",
    defaultArgs: 'region = "us-east-1"',
  },
  {
    localName: "azurerm",
    label: "Azure Resource Manager",
    source: "hashicorp/azurerm",
    version: "3.85.0",
    defaultArgs: "features {}",
    requiredBlocks: ["features"],
  },
  {
    localName: "google",
    label: "Google Cloud",
    source: "hashicorp/google",
    version: "5.10.0",
    defaultArgs: 'project = "my-project-id"\nregion  = "us-central1"',
  },
  {
    localName: "kubernetes",
    label: "Kubernetes",
    source: "hashicorp/kubernetes",
    version: "2.25.0",
    defaultArgs: 'config_path = "~/.kube/config"',
  },
  {
    localName: "helm",
    label: "Helm",
    source: "hashicorp/helm",
    version: "2.12.0",
    defaultArgs: "",
  },
  {
    localName: "docker",
    label: "Docker (kreuzwerker)",
    source: "kreuzwerker/docker",
    version: "3.0.2",
    defaultArgs: 'host = "unix:///var/run/docker.sock"',
  },
  {
    localName: "cloudflare",
    label: "Cloudflare",
    source: "cloudflare/cloudflare",
    version: "4.21.0",
    defaultArgs: "api_token = var.cloudflare_api_token",
  },
  {
    localName: "github",
    label: "GitHub",
    source: "integrations/github",
    version: "5.42.0",
    defaultArgs: 'owner = "my-org"',
  },
  {
    localName: "vault",
    label: "HashiCorp Vault",
    source: "hashicorp/vault",
    version: "3.24.0",
    defaultArgs: 'address = "https://vault.example.com:8200"',
  },
  {
    localName: "random",
    label: "Random",
    source: "hashicorp/random",
    version: "3.6.0",
    defaultArgs: "",
  },
  {
    localName: "local",
    label: "Local",
    source: "hashicorp/local",
    version: "2.4.1",
    defaultArgs: "",
  },
  {
    localName: "tls",
    label: "TLS",
    source: "hashicorp/tls",
    version: "4.0.5",
    defaultArgs: "",
  },
];

export function getCatalogEntry(localName) {
  return PROVIDER_CATALOG.find((entry) => entry.localName === localName) || null;
}

/* ------------------------------------------------------------------ *
 * HCL formatting
 * ------------------------------------------------------------------ */

const INDENT = "  ";

/** `terraform fmt` aligns the `=` of consecutive single-line arguments. */
export function alignAssignments(pairs) {
  const width = pairs.reduce((longest, [key]) => Math.max(longest, key.length), 0);
  return pairs.map(([key, value]) => `${key.padEnd(width)} = ${value}`);
}

function indent(lines, depth) {
  const pad = INDENT.repeat(depth);
  return lines.map((line) => (line === "" ? "" : `${pad}${line}`));
}

const ASSIGNMENT_LINE = /^([A-Za-z_][A-Za-z0-9_-]*)\s*=\s*(.+)$/;
const BLOCK_LINE = /^[A-Za-z_][A-Za-z0-9_-]*(\s+"[^"]*")*\s*\{\s*\}?$/;

/**
 * Take the raw argument text a user typed for one provider block and turn it
 * into formatted HCL lines. Consecutive `name = value` lines get their `=`
 * aligned; block lines (`features {}`, `assume_role {`) and closing braces pass
 * through. Anything else is rejected rather than silently emitted as broken HCL.
 *
 * @returns {{error:string}|{lines:string[], keys:string[]}}
 */
export function formatArguments(argsText, lineOffset = 0) {
  const raw = String(argsText ?? "");
  if (raw.trim() === "") return { lines: [], keys: [] };

  const out = [];
  const keys = [];
  let buffer = [];

  const flush = () => {
    if (buffer.length > 0) {
      out.push(...alignAssignments(buffer));
      buffer = [];
    }
  };

  const sourceLines = raw.split("\n");
  for (let index = 0; index < sourceLines.length; index += 1) {
    const line = sourceLines[index].trim();
    if (line === "") {
      flush();
      out.push("");
      continue;
    }
    const assignment = ASSIGNMENT_LINE.exec(line);
    if (assignment && !line.endsWith("{")) {
      buffer.push([assignment[1], assignment[2].trim()]);
      keys.push(assignment[1]);
      continue;
    }
    if (BLOCK_LINE.test(line) || line === "}" || line.endsWith("{") || line.endsWith("}")) {
      flush();
      out.push(line);
      if (BLOCK_LINE.test(line) || line.endsWith("{")) {
        keys.push(line.split(/[\s{]/)[0]);
      }
      continue;
    }
    return {
      error: `Line ${Math.max(1, index + 1 + lineOffset)} of the arguments, "${line}", is not valid HCL. Write one argument per line as name = value, or a nested block such as features {}.`,
    };
  }
  flush();
  while (out.length > 0 && out[out.length - 1] === "") out.pop();
  return { lines: out, keys };
}

/* ------------------------------------------------------------------ *
 * Generation
 * ------------------------------------------------------------------ */

/**
 * A sensible default floor for `required_version`. Terraform 1.0 introduced the
 * v1 compatibility promise, and 1.5 added `import` and `check` blocks, so
 * ">= 1.5.0" keeps a modern feature set available while still allowing every
 * later 1.x release.
 */
export const DEFAULT_REQUIRED_VERSION = ">= 1.5.0";

const REQUIRED_VERSION_PATTERN = /^(=|!=|>|>=|<|<=|~>)?\s*\d+(\.\d+){0,2}(\s*,\s*(=|!=|>|>=|<|<=|~>)?\s*\d+(\.\d+){0,2})*$/;

/**
 * Build the whole configuration.
 *
 * @param {object} input
 * @param {string} input.requiredVersion  Constraint for the terraform CLI itself.
 * @param {boolean} input.forModule       True when this is a reusable child module.
 * @param {Array} input.providers         [{ localName, source, version, styleId, configurations: [{ alias, args }] }]
 * @returns {{error:string}|object}
 */
export function generateTerraformConfig({ requiredVersion, forModule = false, providers } = {}) {
  if (!Array.isArray(providers) || providers.length === 0) {
    return { error: "Add at least one provider." };
  }

  const constraintText = String(requiredVersion ?? "").trim();
  if (constraintText !== "" && !REQUIRED_VERSION_PATTERN.test(constraintText)) {
    return {
      error: `"${constraintText}" is not a Terraform version constraint. Use an operator and a version, such as >= 1.5.0 or ~> 1.6.`,
    };
  }

  const warnings = [];
  const seenLocalNames = new Set();
  const prepared = [];

  for (const provider of providers) {
    const localName = String(provider?.localName ?? "").trim();
    if (!localName) return { error: "Every provider needs a local name, such as aws." };
    if (!isValidLocalName(localName)) {
      return {
        error: `"${localName}" is not a valid provider local name. Start with a lowercase letter and use only lowercase letters, digits, underscores or dashes.`,
      };
    }
    if (seenLocalNames.has(localName)) {
      return { error: `Two providers both use the local name "${localName}". Local names must be unique in a module.` };
    }
    seenLocalNames.add(localName);

    const source = String(provider?.source ?? "").trim();
    if (!isValidSource(source)) {
      return {
        error: `"${source}" is not a provider source address. Write it as namespace/type, such as hashicorp/aws, optionally with a registry hostname in front.`,
      };
    }

    const versionResult = buildVersionConstraint({ version: provider?.version, styleId: provider?.styleId });
    if (versionResult.error) return { error: `${localName}: ${versionResult.error}` };

    const configurations = Array.isArray(provider?.configurations) ? provider.configurations : [];
    const seenAliases = new Set();
    let defaultCount = 0;
    const preparedConfigs = [];

    for (const configuration of configurations) {
      const alias = String(configuration?.alias ?? "").trim();
      if (alias === "") {
        defaultCount += 1;
        if (defaultCount > 1) {
          return {
            error: `${localName} has two configurations with no alias. Only one provider block per provider may be the default; give the others an alias.`,
          };
        }
      } else {
        if (!isValidAlias(alias)) {
          return {
            error: `"${alias}" is not a valid alias for ${localName}. Start with a letter or underscore and use only letters, digits, underscores or dashes.`,
          };
        }
        if (seenAliases.has(alias)) {
          return { error: `${localName} uses the alias "${alias}" twice. Aliases must be unique per provider.` };
        }
        seenAliases.add(alias);
      }

      // The alias goes through the same formatter as the other arguments so
      // `terraform fmt`'s alignment of consecutive `=` covers it too.
      const aliasLine = alias === "" ? "" : `alias = "${alias}"\n`;
      const formatted = formatArguments(`${aliasLine}${String(configuration?.args ?? "")}`, alias === "" ? 0 : -1);
      if (formatted.error) return { error: `${localName}${alias ? `.${alias}` : ""}: ${formatted.error}` };

      const catalogEntry = getCatalogEntry(localName);
      const missing = (catalogEntry?.requiredBlocks ?? []).filter((block) => !formatted.keys.includes(block));
      for (const block of missing) {
        warnings.push(
          `The ${localName} provider will not initialise without a ${block} block — one has been added to ${alias ? `${localName}.${alias}` : `the default ${localName} configuration`}.`,
        );
        formatted.lines.push(`${block} {}`);
      }

      preparedConfigs.push({ alias, lines: formatted.lines });
    }

    if (preparedConfigs.length === 0) {
      preparedConfigs.push({ alias: "", lines: [] });
    }

    const aliasList = preparedConfigs.filter((config) => config.alias !== "").map((config) => config.alias);
    if (!forModule && aliasList.length > 0 && defaultCount === 0) {
      warnings.push(
        `${localName} has aliased configurations but no default one, so every ${localName} resource must set provider = ${localName}.${aliasList[0]} explicitly.`,
      );
    }

    prepared.push({
      localName,
      source,
      fullSource: expandSource(source),
      constraint: versionResult.constraint,
      explanation: versionResult.explanation,
      configurations: preparedConfigs,
      aliasList,
    });
  }

  if (forModule) {
    const withAliases = prepared.filter((provider) => provider.aliasList.length > 0);
    if (withAliases.length > 0) {
      warnings.push(
        "Reusable modules must not declare their own provider blocks. The aliased configurations are listed as configuration_aliases instead, and the calling module passes them in with a providers argument.",
      );
    }
  }

  /* ---- terraform block ---- */
  const terraformInner = [];
  if (constraintText !== "") {
    terraformInner.push(`required_version = "${constraintText}"`, "");
  }
  terraformInner.push("required_providers {");
  prepared.forEach((provider, index) => {
    const pairs = [
      ["source", `"${provider.source}"`],
      ["version", `"${provider.constraint}"`],
    ];
    if (forModule && provider.aliasList.length > 0) {
      pairs.push([
        "configuration_aliases",
        `[${provider.aliasList.map((alias) => `${provider.localName}.${alias}`).join(", ")}]`,
      ]);
    }
    terraformInner.push(`${INDENT}${provider.localName} = {`);
    terraformInner.push(...indent(alignAssignments(pairs), 2));
    terraformInner.push(`${INDENT}}`);
    if (index < prepared.length - 1) terraformInner.push("");
  });
  terraformInner.push("}");

  const blocks = ["terraform {", ...indent(terraformInner, 1), "}"];

  /* ---- provider blocks ---- */
  let providerBlockCount = 0;
  if (!forModule) {
    for (const provider of prepared) {
      for (const configuration of provider.configurations) {
        if (configuration.lines.length === 0) {
          blocks.push("", `provider "${provider.localName}" {}`);
        } else {
          blocks.push("", `provider "${provider.localName}" {`, ...indent(configuration.lines, 1), "}");
        }
        providerBlockCount += 1;
      }
    }
  }

  const hcl = blocks.join("\n");
  const referenceLines = prepared.flatMap((provider) =>
    provider.aliasList.map((alias) => `provider = ${provider.localName}.${alias}`),
  );

  return {
    hcl,
    providers: prepared,
    providerCount: prepared.length,
    providerBlockCount,
    aliasCount: prepared.reduce((total, provider) => total + provider.aliasList.length, 0),
    lineCount: hcl.split("\n").length,
    requiredVersion: constraintText,
    forModule,
    referenceLines,
    warnings,
  };
}
