/**
 * kubectl command assembly, following the flag semantics documented in
 * `kubectl --help` and kubernetes.io/docs/reference/kubectl/:
 *
 *  - -n/--namespace and -A/--all-namespaces are mutually exclusive; kubectl
 *    errors with "a resource cannot be retrieved by name across all
 *    namespaces" or simply ignores -n, so we reject the combination.
 *  - --dry-run takes none|client|server since kubectl 1.18 (the bare
 *    --dry-run boolean form was removed).
 *  - -o/--output accepts json|yaml|wide|name|jsonpath|custom-columns...
 *  - logs/exec/port-forward operate on a single resource, not selectors
 *    (logs does allow -l); get/describe/delete accept -l selectors.
 *  - delete requires a name, a selector, or --all.
 *
 * Pure functions only.
 */

export const VERBS = [
  { id: "get", label: "get — list or read resources" },
  { id: "describe", label: "describe — detailed state + events" },
  { id: "delete", label: "delete — remove resources" },
  { id: "logs", label: "logs — container logs" },
  { id: "exec", label: "exec — run a command in a container" },
  { id: "apply", label: "apply — apply a manifest file" },
  { id: "scale", label: "scale — set replica count" },
  { id: "port-forward", label: "port-forward — tunnel a local port" },
  { id: "rollout-restart", label: "rollout restart — rolling restart" },
];

export const RESOURCES = [
  "pods",
  "deployments",
  "services",
  "nodes",
  "namespaces",
  "configmaps",
  "secrets",
  "ingresses",
  "statefulsets",
  "daemonsets",
  "jobs",
  "cronjobs",
  "events",
];

/** --dry-run values since kubectl 1.18. */
export const DRY_RUN_VALUES = ["none", "client", "server"];

export const OUTPUT_FORMATS = ["", "wide", "yaml", "json", "name", "jsonpath={.items[*].metadata.name}"];

/** Verbs that take a resource type argument. */
const RESOURCE_VERBS = new Set(["get", "describe", "delete", "scale", "rollout-restart"]);
/** Verbs that accept -l label selectors. */
const SELECTOR_VERBS = new Set(["get", "describe", "delete", "logs"]);
/** Verbs that accept -o output formats. */
const OUTPUT_VERBS = new Set(["get", "apply", "delete", "scale"]);
/** Verbs that accept --dry-run. */
const DRY_RUN_VERBS = new Set(["apply", "delete", "scale"]);

/** Quote a shell argument with single quotes when it contains unsafe chars. */
export function shellQuote(value) {
  const s = String(value);
  if (/^[A-Za-z0-9_@%+=:,./-]+$/.test(s)) return s;
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

/**
 * Build a kubectl command string.
 *
 * @param {object} input
 * @returns {{command, notes}|{error}}
 */
export function buildKubectlCommand({
  verb,
  resource = "pods",
  name = "",
  namespace = "",
  allNamespaces = false,
  selector = "",
  output = "",
  dryRun = "none",
  file = "",
  container = "",
  follow = false,
  previous = false,
  replicas = "",
  localPort = "",
  remotePort = "",
  command = "",
}) {
  const verbDef = VERBS.find((v) => v.id === verb);
  if (!verbDef) return { error: "Choose a kubectl verb." };

  const trimmedName = name.trim();
  const trimmedNs = namespace.trim();
  const trimmedSelector = selector.trim();
  const notes = [];
  const parts = ["kubectl"];

  if (allNamespaces && trimmedNs !== "") {
    return { error: "-A (--all-namespaces) and -n <namespace> are mutually exclusive — pick one." };
  }
  if (allNamespaces && trimmedName !== "") {
    return { error: "A resource cannot be retrieved by NAME across all namespaces — drop -A or the name." };
  }
  if (trimmedSelector !== "" && trimmedName !== "") {
    return { error: "kubectl rejects a name combined with -l selector — use one or the other." };
  }

  switch (verb) {
    case "get":
    case "describe":
    case "delete": {
      parts.push(verb, resource);
      if (trimmedName !== "") parts.push(shellQuote(trimmedName));
      if (verb === "delete" && trimmedName === "" && trimmedSelector === "") {
        return { error: "delete needs a name or a -l selector (or --all, which this builder deliberately omits)." };
      }
      break;
    }
    case "logs": {
      if (trimmedName === "" && trimmedSelector === "") {
        return { error: "logs needs a pod name or a -l selector." };
      }
      parts.push("logs");
      if (trimmedName !== "") parts.push(shellQuote(trimmedName));
      break;
    }
    case "exec": {
      if (trimmedName === "") return { error: "exec needs a pod name." };
      parts.push("exec", "-it", shellQuote(trimmedName));
      break;
    }
    case "apply": {
      if (file.trim() === "") return { error: "apply needs a file — set the manifest path for -f." };
      parts.push("apply", "-f", shellQuote(file.trim()));
      break;
    }
    case "scale": {
      const n = Number(replicas);
      if (!Number.isInteger(n) || n < 0) {
        return { error: "scale needs a whole-number replica count of 0 or more." };
      }
      if (trimmedName === "") return { error: "scale needs the resource name (e.g. deployments web)." };
      parts.push("scale", `${resource}/${trimmedName}`, `--replicas=${n}`);
      break;
    }
    case "port-forward": {
      if (trimmedName === "") return { error: "port-forward needs a pod or service name." };
      const lp = Number(localPort);
      const rp = Number(remotePort);
      if (!Number.isInteger(lp) || lp < 1 || lp > 65535) return { error: "Local port must be 1-65535." };
      if (!Number.isInteger(rp) || rp < 1 || rp > 65535) return { error: "Remote port must be 1-65535." };
      parts.push("port-forward", shellQuote(trimmedName), `${lp}:${rp}`);
      break;
    }
    case "rollout-restart": {
      if (trimmedName === "") return { error: "rollout restart needs the resource name (e.g. deployments/web)." };
      parts.push("rollout", "restart", `${resource}/${trimmedName}`);
      break;
    }
    default:
      return { error: "Choose a kubectl verb." };
  }

  if (trimmedNs !== "") parts.push("-n", shellQuote(trimmedNs));
  if (allNamespaces) parts.push("-A");

  if (trimmedSelector !== "") {
    if (!SELECTOR_VERBS.has(verb)) {
      return { error: `-l selectors do not apply to "${verb}" — it targets a single named resource.` };
    }
    parts.push("-l", shellQuote(trimmedSelector));
  }

  if (verb === "logs") {
    if (container.trim() !== "") parts.push("-c", shellQuote(container.trim()));
    if (follow) parts.push("-f");
    if (previous) parts.push("--previous");
  }
  if (verb === "exec") {
    if (container.trim() !== "") parts.push("-c", shellQuote(container.trim()));
    parts.push("--", command.trim() === "" ? "/bin/sh" : command.trim());
  }

  if (output !== "") {
    if (!OUTPUT_VERBS.has(verb)) {
      notes.push(`-o output formats are ignored by "${verb}"; flag omitted.`);
    } else {
      parts.push("-o", shellQuote(output));
    }
  }

  if (dryRun !== "none") {
    if (!DRY_RUN_VALUES.includes(dryRun)) return { error: "--dry-run must be none, client or server." };
    if (!DRY_RUN_VERBS.has(verb)) {
      notes.push(`--dry-run applies to mutating verbs (apply, delete, scale); flag omitted for "${verb}".`);
    } else {
      parts.push(`--dry-run=${dryRun}`);
      if (dryRun === "server") notes.push("server dry-run sends the request through admission but persists nothing.");
    }
  }

  if (verb === "get" && trimmedNs === "" && !allNamespaces && resource !== "nodes" && resource !== "namespaces") {
    notes.push("No namespace given — kubectl uses the current context's namespace (usually default).");
  }
  if (RESOURCE_VERBS.has(verb) && (resource === "nodes" || resource === "namespaces") && trimmedNs !== "") {
    return { error: `${resource} are cluster-scoped — a namespace flag does not apply.` };
  }

  return { command: parts.join(" "), notes };
}
