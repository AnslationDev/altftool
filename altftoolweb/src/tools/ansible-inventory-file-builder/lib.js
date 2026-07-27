/**
 * Ansible inventory builder.
 *
 * The spec syntax mirrors Ansible's own INI inventory format
 * (docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html):
 *   [group]            hosts follow, one per line, with optional key=value vars
 *   [group:children]   member group names follow, one per line
 *   [group:vars]       group variables follow, one key=value per line
 * Hosts before any [group] header land in "ungrouped", exactly as Ansible does.
 * Numeric host ranges use Ansible's inclusive [start:end] syntax, e.g. web[01:05].
 */

/** Ansible's implicit group for hosts outside any explicit group. */
export const UNGROUPED = "ungrouped";

/** Inclusive numeric range pattern per Ansible docs: web[01:05] means web01..web05. */
const RANGE_PATTERN = /\[(\d+):(\d+)\]/;

/** Valid group names: Ansible warns on anything but letters, digits and underscores. */
const GROUP_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const SECTION_PATTERN = /^\[([^\]]+)\]$/;

/** How many real hosts a host entry expands to (1 when it has no range). */
export function hostCount(hostName) {
  const match = RANGE_PATTERN.exec(hostName);
  if (!match) return 1;
  const start = Number(match[1]);
  const end = Number(match[2]);
  if (end < start) return 0; // backwards range matches nothing
  return end - start + 1;
}

/**
 * Parse the spec text into an inventory model.
 * @returns {object} { groups, order, errors, warnings }
 *   groups: { [name]: { hosts: [{name, vars:{}}], vars: {}, children: [] } }
 */
export function parseInventorySpec(text) {
  const errors = [];
  const warnings = [];
  const groups = {};
  const order = [];

  const ensureGroup = (name) => {
    if (!groups[name]) {
      groups[name] = { hosts: [], vars: {}, children: [] };
      order.push(name);
    }
    return groups[name];
  };

  let mode = "hosts";
  let current = UNGROUPED;

  const lines = String(text ?? "").split(/\r?\n/);
  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    const lineNo = index + 1;
    if (line === "" || line.startsWith("#") || line.startsWith(";")) return;

    const section = SECTION_PATTERN.exec(line);
    if (section) {
      const header = section[1].trim();
      const parts = header.split(":");
      const groupName = parts[0].trim();
      const kind = (parts[1] ?? "").trim();
      if (!GROUP_NAME_PATTERN.test(groupName)) {
        errors.push(`Line ${lineNo}: group name "${groupName}" — use letters, digits and underscores, starting with a letter.`);
        return;
      }
      if (kind !== "" && kind !== "children" && kind !== "vars") {
        errors.push(`Line ${lineNo}: unknown section suffix ":${kind}" — only :children and :vars exist.`);
        return;
      }
      ensureGroup(groupName);
      current = groupName;
      mode = kind === "" ? "hosts" : kind;
      return;
    }

    if (mode === "hosts") {
      const tokens = line.split(/\s+/);
      const hostName = tokens[0];
      const vars = {};
      let broken = false;
      tokens.slice(1).forEach((token) => {
        const eq = token.indexOf("=");
        if (eq <= 0) {
          errors.push(`Line ${lineNo}: "${token}" is not a key=value host variable.`);
          broken = true;
          return;
        }
        vars[token.slice(0, eq)] = token.slice(eq + 1);
      });
      if (broken) return;
      const group = ensureGroup(current);
      if (group.hosts.some((host) => host.name === hostName)) {
        warnings.push(`Line ${lineNo}: host "${hostName}" repeated in [${current}] — kept once.`);
        return;
      }
      group.hosts.push({ name: hostName, vars });
      return;
    }

    if (mode === "children") {
      const childName = line.split(/\s+/)[0];
      if (!GROUP_NAME_PATTERN.test(childName)) {
        errors.push(`Line ${lineNo}: child group name "${childName}" is invalid.`);
        return;
      }
      if (!groups[childName]) {
        warnings.push(`Line ${lineNo}: child group "${childName}" was not defined — created empty.`);
        ensureGroup(childName);
      }
      const group = groups[current];
      if (childName === current) {
        errors.push(`Line ${lineNo}: group "${current}" cannot be its own child.`);
        return;
      }
      if (!group.children.includes(childName)) group.children.push(childName);
      return;
    }

    // mode === "vars"
    const eq = line.indexOf("=");
    if (eq <= 0) {
      errors.push(`Line ${lineNo}: "${line}" is not a key=value group variable.`);
      return;
    }
    groups[current].vars[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  });

  // Detect child cycles (a -> b -> a) which Ansible rejects.
  const visiting = new Set();
  const safe = new Set();
  const hasCycle = (name, trail) => {
    if (safe.has(name)) return false;
    if (visiting.has(name)) {
      errors.push(`Circular :children chain: ${[...trail, name].join(" -> ")}.`);
      return true;
    }
    visiting.add(name);
    const cycle = (groups[name]?.children ?? []).some((child) => hasCycle(child, [...trail, name]));
    visiting.delete(name);
    if (!cycle) safe.add(name);
    return cycle;
  };
  order.forEach((name) => hasCycle(name, []));

  return { groups, order, errors, warnings };
}

/** Emit the canonical INI form of a parsed model. */
export function emitIni(model) {
  const lines = [];
  model.order.forEach((name) => {
    const group = model.groups[name];
    if (name === UNGROUPED && group.hosts.length === 0) return;
    if (group.hosts.length > 0 || (group.children.length === 0 && Object.keys(group.vars).length === 0)) {
      lines.push(`[${name}]`);
      group.hosts.forEach((host) => {
        const vars = Object.entries(host.vars)
          .map(([key, value]) => `${key}=${value}`)
          .join(" ");
        lines.push(vars ? `${host.name} ${vars}` : host.name);
      });
      lines.push("");
    }
    if (group.children.length > 0) {
      lines.push(`[${name}:children]`);
      group.children.forEach((child) => lines.push(child));
      lines.push("");
    }
    if (Object.keys(group.vars).length > 0) {
      lines.push(`[${name}:vars]`);
      Object.entries(group.vars).forEach(([key, value]) => lines.push(`${key}=${value}`));
      lines.push("");
    }
  });
  return lines.join("\n").trim() + "\n";
}

/** Quote a YAML scalar only when needed. */
function yamlValue(value) {
  if (/^-?\d+(\.\d+)?$/.test(value)) return value;
  if (value === "true" || value === "false" || value === "null") return value;
  if (/^[A-Za-z0-9._\-/]+$/.test(value)) return value;
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Emit the YAML inventory form. Groups that are children of another group are
 * nested under their (first) parent; the rest sit under all.children, matching
 * the structure in Ansible's inventory guide.
 */
export function emitYaml(model) {
  const childNames = new Set();
  model.order.forEach((name) => {
    model.groups[name].children.forEach((child) => childNames.add(child));
  });

  const emitted = new Set();
  const emitGroup = (name, indent) => {
    if (emitted.has(name)) return [`${indent}${name}:`]; // cycle/diamond guard: bare reference
    emitted.add(name);
    const group = model.groups[name];
    const lines = [`${indent}${name}:`];
    const inner = indent + "  ";
    if (Object.keys(group.vars).length > 0) {
      lines.push(`${inner}vars:`);
      Object.entries(group.vars).forEach(([key, value]) =>
        lines.push(`${inner}  ${key}: ${yamlValue(value)}`),
      );
    }
    if (group.hosts.length > 0) {
      lines.push(`${inner}hosts:`);
      group.hosts.forEach((host) => {
        const varEntries = Object.entries(host.vars);
        if (varEntries.length === 0) {
          lines.push(`${inner}  ${host.name}:`);
        } else {
          lines.push(`${inner}  ${host.name}:`);
          varEntries.forEach(([key, value]) =>
            lines.push(`${inner}    ${key}: ${yamlValue(value)}`),
          );
        }
      });
    }
    if (group.children.length > 0) {
      lines.push(`${inner}children:`);
      group.children.forEach((child) => lines.push(...emitGroup(child, inner + "  ")));
    }
    return lines;
  };

  const lines = ["all:", "  children:"];
  model.order.forEach((name) => {
    if (childNames.has(name)) return; // nested under its parent instead
    if (name === UNGROUPED && model.groups[name].hosts.length === 0) return;
    lines.push(...emitGroup(name, "    "));
  });
  return lines.join("\n") + "\n";
}

/**
 * Build both formats plus stats from the raw spec text.
 * @returns {object} { ini, yaml, stats, warnings } or { error, warnings }
 */
export function buildInventory(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Enter at least one group or host line." };
  }
  const model = parseInventorySpec(text);
  if (model.errors.length > 0) {
    return { error: model.errors.join(" "), warnings: model.warnings };
  }
  const groupNames = model.order.filter(
    (name) => !(name === UNGROUPED && model.groups[name].hosts.length === 0),
  );
  let totalHosts = 0;
  const seen = new Set();
  groupNames.forEach((name) => {
    model.groups[name].hosts.forEach((host) => {
      if (!seen.has(host.name)) {
        seen.add(host.name);
        totalHosts += hostCount(host.name);
      }
    });
  });
  if (groupNames.length === 0) {
    return { error: "The spec parsed but contains no groups or hosts." };
  }
  return {
    ini: emitIni(model),
    yaml: emitYaml(model),
    warnings: model.warnings,
    stats: {
      groups: groupNames.length,
      hosts: totalHosts,
      childLinks: groupNames.reduce((sum, name) => sum + model.groups[name].children.length, 0),
      vars: groupNames.reduce(
        (sum, name) =>
          sum +
          Object.keys(model.groups[name].vars).length +
          model.groups[name].hosts.reduce((s, host) => s + Object.keys(host.vars).length, 0),
        0,
      ),
    },
  };
}
