/**
 * Kubernetes Service manifest generation, following the core/v1 Service API
 * (kubernetes.io/docs/concepts/services-networking/service/) and the name
 * validation rules in k8s.io/apimachinery (validation.go):
 *
 *  - Service names must be RFC 1035 DNS labels: lowercase alphanumeric or
 *    '-', starting with a letter, ending alphanumeric, max 63 characters
 *    (stricter than RFC 1123 because the name becomes a DNS A record).
 *  - Ports are 1-65535; NodePorts must fall in the cluster's service node
 *    port range, DEFAULT 30000-32767 (kube-apiserver
 *    --service-node-port-range).
 *  - targetPort defaults to port; nodePort is only meaningful for NodePort
 *    and LoadBalancer services.
 *
 * Pure functions only — YAML is assembled by hand, no dependencies.
 */

/** RFC 1035 label: what core/v1 Service names must satisfy. */
export const RFC1035_LABEL_REGEX = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
export const NAME_MAX_LENGTH = 63;

/** Default kube-apiserver --service-node-port-range. */
export const NODE_PORT_MIN = 30000;
export const NODE_PORT_MAX = 32767;

export const PORT_MIN = 1;
export const PORT_MAX = 65535;

export const SERVICE_TYPES = ["ClusterIP", "NodePort", "LoadBalancer"];
export const PROTOCOLS = ["TCP", "UDP", "SCTP"];

/** Label keys/values per kubernetes.io/docs/concepts/overview/working-with-objects/labels. */
const LABEL_NAME_REGEX = /^[A-Za-z0-9]([-A-Za-z0-9_.]*[A-Za-z0-9])?$/;
const LABEL_VALUE_MAX = 63;

/** RFC 1123 DNS subdomain: what the optional "prefix/" part of a label key must satisfy. */
const DNS_SUBDOMAIN_REGEX = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
const DNS_SUBDOMAIN_MAX = 253;

/** Validate a DNS-1035 name; returns null when OK. */
export function validateServiceName(name) {
  if (typeof name !== "string" || name.trim() === "") return "Service name is required.";
  const n = name.trim();
  if (n.length > NAME_MAX_LENGTH) return `Name is ${n.length} chars; RFC 1035 labels max out at ${NAME_MAX_LENGTH}.`;
  if (!RFC1035_LABEL_REGEX.test(n)) {
    return "Name must be lowercase letters, digits and '-', start with a letter and end alphanumeric (RFC 1035).";
  }
  return null;
}

/**
 * Parse "key=value" lines into selector pairs.
 * @returns {{selector: object}|{error}}
 */
export function parseSelector(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Add at least one selector label (key=value) — without it the Service matches no pods." };
  }
  const selector = {};
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) return { error: `Selector line "${line}" is not key=value.` };
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    // Key may carry an optional DNS prefix: prefix/name.
    const parts = key.split("/");
    if (parts.length > 2 || key === "") return { error: `Selector key "${key}" is invalid.` };
    const namePart = parts[parts.length - 1];
    if (namePart.length > LABEL_VALUE_MAX || !LABEL_NAME_REGEX.test(namePart)) {
      return { error: `Selector key "${key}" is invalid (alphanumeric with '-', '_', '.', max 63 chars).` };
    }
    if (parts.length === 2) {
      const prefixPart = parts[0];
      if (prefixPart.length > DNS_SUBDOMAIN_MAX || !DNS_SUBDOMAIN_REGEX.test(prefixPart)) {
        return {
          error: `Selector key "${key}" has an invalid DNS prefix (lowercase RFC 1123 subdomain, max ${DNS_SUBDOMAIN_MAX} chars).`,
        };
      }
    }
    if (value !== "" && (value.length > LABEL_VALUE_MAX || !LABEL_NAME_REGEX.test(value))) {
      return { error: `Selector value "${value}" is invalid (alphanumeric with '-', '_', '.', max 63 chars).` };
    }
    selector[key] = value;
  }
  if (Object.keys(selector).length === 0) {
    return { error: "Add at least one selector label (key=value) — without it the Service matches no pods." };
  }
  return { selector };
}

function validPort(value) {
  return Number.isInteger(value) && value >= PORT_MIN && value <= PORT_MAX;
}

/**
 * Build a core/v1 Service manifest.
 *
 * @param {object} input
 * @param {string} input.name
 * @param {string} [input.namespace]
 * @param {string} input.type            One of SERVICE_TYPES.
 * @param {string} input.selectorText    key=value lines.
 * @param {Array}  input.ports           [{name, port, targetPort, nodePort, protocol}]
 * @param {boolean} [input.headless]     ClusterIP: None for stateful DNS.
 * @returns {{yaml, warnings}|{error}}
 */
export function buildServiceYaml({ name, namespace = "", type, selectorText, ports, headless = false }) {
  const nameProblem = validateServiceName(name);
  if (nameProblem) return { error: nameProblem };

  if (!SERVICE_TYPES.includes(type)) return { error: "Choose a Service type." };

  if (namespace.trim() !== "") {
    const nsProblem = validateServiceName(namespace.trim());
    if (nsProblem) return { error: `Namespace: ${nsProblem}` };
  }

  const parsed = parseSelector(selectorText);
  if (parsed.error) return { error: parsed.error };

  if (!Array.isArray(ports) || ports.length === 0) return { error: "Add at least one port mapping." };

  const warnings = [];
  const cleanPorts = [];
  const seenNames = new Set();
  const seenPortProtocol = new Set();

  for (let i = 0; i < ports.length; i += 1) {
    const p = ports[i];
    const port = Number(p.port);
    if (!validPort(port)) return { error: `Port #${i + 1}: "port" must be a whole number 1-65535.` };

    const targetRaw = String(p.targetPort ?? "").trim();
    let targetPort = null;
    if (targetRaw !== "") {
      const asNumber = Number(targetRaw);
      if (Number.isInteger(asNumber)) {
        if (!validPort(asNumber)) return { error: `Port #${i + 1}: targetPort must be 1-65535 (or a named container port).` };
        targetPort = asNumber;
      } else if (/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(targetRaw) && targetRaw.length <= 15) {
        // IANA_SVC_NAME: named ports are max 15 chars, lowercase alnum + '-'.
        targetPort = targetRaw;
      } else {
        return { error: `Port #${i + 1}: "${targetRaw}" is neither a port number nor a valid named port (max 15 chars).` };
      }
    }

    const protocol = PROTOCOLS.includes(p.protocol) ? p.protocol : "TCP";

    let nodePort = null;
    const nodeRaw = String(p.nodePort ?? "").trim();
    if (nodeRaw !== "") {
      if (type === "ClusterIP") {
        return { error: `Port #${i + 1}: nodePort is only valid on NodePort or LoadBalancer services.` };
      }
      const np = Number(nodeRaw);
      if (!Number.isInteger(np) || np < NODE_PORT_MIN || np > NODE_PORT_MAX) {
        return {
          error: `Port #${i + 1}: nodePort ${nodeRaw} is outside the default range ${NODE_PORT_MIN}-${NODE_PORT_MAX}.`,
        };
      }
      nodePort = np;
    }

    const portName = String(p.name ?? "").trim();
    if (ports.length > 1 && portName === "") {
      return { error: `Port #${i + 1}: the API requires every port to be named when a Service has more than one port.` };
    }
    if (portName !== "") {
      if (!/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(portName) || portName.length > 15) {
        return { error: `Port #${i + 1}: name "${portName}" is invalid (lowercase, digits, '-', max 15 chars).` };
      }
      if (seenNames.has(portName)) return { error: `Two ports share the name "${portName}".` };
      seenNames.add(portName);
    }

    const portProtocolKey = `${port}/${protocol}`;
    if (seenPortProtocol.has(portProtocolKey)) {
      return { error: `Port #${i + 1}: another port already uses port ${port}/${protocol} — the second definition would be non-functional.` };
    }
    seenPortProtocol.add(portProtocolKey);

    cleanPorts.push({ name: portName, port, targetPort, nodePort, protocol });
  }

  if (headless && type !== "ClusterIP") {
    return { error: "A headless service (clusterIP: None) must be type ClusterIP." };
  }
  if (type === "NodePort" && cleanPorts.every((p) => p.nodePort === null)) {
    warnings.push("No nodePort set — the control plane will auto-allocate one from 30000-32767.");
  }
  if (type === "LoadBalancer") {
    warnings.push("LoadBalancer needs a cloud controller (or MetalLB on bare metal) to provision the external IP.");
  }

  const lines = [];
  lines.push("apiVersion: v1");
  lines.push("kind: Service");
  lines.push("metadata:");
  lines.push(`  name: ${name.trim()}`);
  if (namespace.trim() !== "") lines.push(`  namespace: ${namespace.trim()}`);
  lines.push("spec:");
  lines.push(`  type: ${type}`);
  if (headless) lines.push("  clusterIP: None");
  lines.push("  selector:");
  for (const [key, value] of Object.entries(parsed.selector)) {
    lines.push(`    ${JSON.stringify(key)}: ${JSON.stringify(value)}`);
  }
  lines.push("  ports:");
  for (const p of cleanPorts) {
    lines.push(`    - port: ${p.port}`);
    if (p.name !== "") lines.push(`      name: ${p.name}`);
    lines.push(`      protocol: ${p.protocol}`);
    if (p.targetPort !== null && p.targetPort !== p.port) {
      lines.push(`      targetPort: ${typeof p.targetPort === "string" ? JSON.stringify(p.targetPort) : p.targetPort}`);
    }
    if (p.nodePort !== null) lines.push(`      nodePort: ${p.nodePort}`);
  }

  return { yaml: lines.join("\n"), warnings, selector: parsed.selector, ports: cleanPorts };
}
