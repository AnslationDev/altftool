/**
 * ufw (Uncomplicated Firewall) rule composition.
 *
 * Syntax follows ufw 0.36 (`man 8 ufw`): the simple form is
 *   ufw <action> [in|out] [on IFACE] PORT[/PROTO]
 * and the extended form is
 *   ufw <action> [in|out] [on IFACE] from SRC [port SPORT] to DST port PORT proto PROTO
 * A `comment '...'` clause may be appended to either form (ufw 0.35+).
 *
 * Pure module: nothing is executed, and no firewall state is read.
 */

export const ACTIONS = [
  { id: "allow", label: "allow", meaning: "Accept matching traffic." },
  { id: "deny", label: "deny", meaning: "Drop matching traffic silently — the client sees a timeout." },
  { id: "reject", label: "reject", meaning: "Refuse with an ICMP error so the client fails immediately." },
  {
    id: "limit",
    label: "limit",
    meaning: "Allow, but drop an IP that opens 6 or more connections in 30 seconds.",
  },
];

export const PROTOCOLS = [
  { id: "any", label: "Any (tcp and udp)" },
  { id: "tcp", label: "TCP" },
  { id: "udp", label: "UDP" },
];

export const DIRECTIONS = [
  { id: "default", label: "Default (incoming)" },
  { id: "in", label: "Incoming (in)" },
  { id: "out", label: "Outgoing (out)" },
];

/** Well-known ports as registered with IANA. */
export const COMMON_SERVICES = [
  { id: "ssh", label: "SSH", port: "22", proto: "tcp" },
  { id: "http", label: "HTTP", port: "80", proto: "tcp" },
  { id: "https", label: "HTTPS", port: "443", proto: "tcp" },
  { id: "dns", label: "DNS", port: "53", proto: "any" },
  { id: "smtp", label: "SMTP", port: "25", proto: "tcp" },
  { id: "submission", label: "SMTP submission", port: "587", proto: "tcp" },
  { id: "imaps", label: "IMAPS", port: "993", proto: "tcp" },
  { id: "postgres", label: "PostgreSQL", port: "5432", proto: "tcp" },
  { id: "mysql", label: "MySQL / MariaDB", port: "3306", proto: "tcp" },
  { id: "redis", label: "Redis", port: "6379", proto: "tcp" },
  { id: "mongodb", label: "MongoDB", port: "27017", proto: "tcp" },
  { id: "rdp", label: "RDP", port: "3389", proto: "tcp" },
  { id: "wireguard", label: "WireGuard", port: "51820", proto: "udp" },
  { id: "ntp", label: "NTP", port: "123", proto: "udp" },
];

/** Application profiles shipped by common Debian/Ubuntu packages. */
export const APP_PROFILES = [
  { id: "OpenSSH", ports: "22/tcp", from: "openssh-server" },
  { id: "Nginx Full", ports: "80,443/tcp", from: "nginx-common" },
  { id: "Nginx HTTP", ports: "80/tcp", from: "nginx-common" },
  { id: "Nginx HTTPS", ports: "443/tcp", from: "nginx-common" },
  { id: "Apache Full", ports: "80,443/tcp", from: "apache2" },
  { id: "Apache", ports: "80/tcp", from: "apache2" },
  { id: "Apache Secure", ports: "443/tcp", from: "apache2" },
  { id: "Postfix", ports: "25/tcp", from: "postfix" },
  { id: "Dovecot IMAP", ports: "143/tcp", from: "dovecot-core" },
  { id: "Samba", ports: "137,138/udp 139,445/tcp", from: "samba" },
];

/** Ports that services never bind above; the IANA range is 1-65535. */
export const MIN_PORT = 1;
export const MAX_PORT = 65535;

/** ufw's rate limit rule: 6 connections from one address within 30 seconds. */
export const LIMIT_CONNECTIONS = 6;
export const LIMIT_WINDOW_SECONDS = 30;

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const SAFE_ARG = /^[A-Za-z0-9_@%+=:,./-]+$/;

export function shellQuote(value) {
  const raw = String(value ?? "").trim();
  if (raw === "") return "''";
  if (SAFE_ARG.test(raw)) return raw;
  return `'${raw.replace(/'/g, `'\\''`)}'`;
}

function isValidIpv4(value) {
  const match = IPV4.exec(value);
  if (!match) return false;
  return match.slice(1).every((part) => {
    if (part.length > 1 && part.startsWith("0")) return false;
    const n = Number(part);
    return n >= 0 && n <= 255;
  });
}

function isValidIpv6(value) {
  // Loose but non-permissive: hex groups and at most one "::" shorthand.
  if (!/^[0-9A-Fa-f:]+$/.test(value)) return false;
  if ((value.match(/::/g) || []).length > 1) return false;
  const groups = value.split(":").filter((g) => g !== "");
  if (groups.length === 0 || groups.length > 8) return false;
  return groups.every((g) => g.length <= 4);
}

/**
 * Validate an address, optionally with a CIDR prefix. "any" is allowed.
 * @returns {{ok:true, family:string}|{ok:false, message:string}}
 */
export function parseHost(value) {
  const raw = String(value ?? "").trim();
  if (raw === "" || raw.toLowerCase() === "any") return { ok: true, family: "any" };

  const [addr, prefixRaw, ...rest] = raw.split("/");
  if (rest.length > 0) return { ok: false, message: `"${raw}" has more than one / — write it as 10.0.0.0/8.` };

  const v4 = isValidIpv4(addr);
  const v6 = !v4 && isValidIpv6(addr);
  if (!v4 && !v6) return { ok: false, message: `"${addr}" is not a valid IPv4 or IPv6 address.` };

  if (prefixRaw !== undefined) {
    const prefix = Number(prefixRaw);
    const max = v4 ? 32 : 128;
    if (!Number.isInteger(prefix) || prefix < 0 || prefix > max) {
      return { ok: false, message: `An ${v4 ? "IPv4" : "IPv6"} prefix must be between 0 and ${max}.` };
    }
  }
  return { ok: true, family: v4 ? "ipv4" : "ipv6" };
}

/**
 * Parse a ufw port specification: a single port, a comma list, or a colon range.
 * ufw requires an explicit protocol for lists and ranges.
 * @returns {{ok:true, kind:string, requiresProto:boolean, ports:number[]}|{ok:false,message:string}}
 */
export function parsePortSpec(value) {
  const raw = String(value ?? "").trim();
  if (raw === "") return { ok: false, message: "Enter a port, a list like 80,443, or a range like 6000:6010." };

  const checkPort = (token) => {
    if (!/^\d+$/.test(token)) return null;
    const port = Number(token);
    if (port < MIN_PORT || port > MAX_PORT) return null;
    return port;
  };

  if (raw.includes(":")) {
    const [lowRaw, highRaw, ...rest] = raw.split(":");
    if (rest.length > 0) return { ok: false, message: "A port range takes exactly one colon, like 6000:6010." };
    const low = checkPort(lowRaw);
    const high = checkPort(highRaw);
    if (low === null || high === null) {
      return { ok: false, message: `Ports must be whole numbers from ${MIN_PORT} to ${MAX_PORT}.` };
    }
    if (low >= high) return { ok: false, message: "In a range the first port must be lower than the second." };
    return { ok: true, kind: "range", requiresProto: true, ports: [low, high] };
  }

  if (raw.includes(",")) {
    const tokens = raw.split(",").map((t) => t.trim()).filter(Boolean);
    if (tokens.length < 2) return { ok: false, message: "A port list needs at least two ports separated by commas." };
    const ports = [];
    for (const token of tokens) {
      const port = checkPort(token);
      if (port === null) return { ok: false, message: `"${token}" is not a port between ${MIN_PORT} and ${MAX_PORT}.` };
      ports.push(port);
    }
    if (ports.length > 15) {
      return { ok: false, message: "iptables multiport accepts at most 15 ports in one rule; split it in two." };
    }
    return { ok: true, kind: "list", requiresProto: true, ports };
  }

  const single = checkPort(raw);
  if (single === null) return { ok: false, message: `Ports must be whole numbers from ${MIN_PORT} to ${MAX_PORT}.` };
  return { ok: true, kind: "single", requiresProto: false, ports: [single] };
}

/**
 * Build one ufw rule.
 * @returns {{command:string, warnings:string[], form:string}} or {error:string}
 */
export function buildUfwRule(rule = {}) {
  const {
    action = "allow",
    direction = "default",
    interfaceName = "",
    target = "port", // "port" | "app"
    port = "22",
    protocol = "tcp",
    appProfile = "OpenSSH",
    fromHost = "",
    toHost = "",
    comment = "",
  } = rule;

  const actionSpec = ACTIONS.find((item) => item.id === action);
  if (!actionSpec) return { error: "Choose allow, deny, reject or limit." };
  if (!DIRECTIONS.some((item) => item.id === direction)) return { error: "Choose a traffic direction." };
  if (target !== "port" && target !== "app") return { error: "Choose whether the rule targets a port or an app profile." };

  const proto = PROTOCOLS.some((item) => item.id === protocol) ? protocol : "any";
  const from = parseHost(fromHost);
  if (!from.ok) return { error: from.message };
  const to = parseHost(toHost);
  if (!to.ok) return { error: to.message };
  if (from.family !== "any" && to.family !== "any" && from.family !== to.family) {
    return { error: "The source and destination must be from the same address family (both IPv4 or both IPv6)." };
  }

  let portSpec = null;
  if (target === "port") {
    portSpec = parsePortSpec(port);
    if (!portSpec.ok) return { error: portSpec.message };
    if (portSpec.requiresProto && proto === "any") {
      return { error: "ufw needs an explicit tcp or udp protocol for a port list or range." };
    }
  } else if (!String(appProfile).trim()) {
    return { error: "Pick an application profile, or switch the rule target to a port." };
  }

  if (action === "limit" && proto === "udp") {
    return { error: "ufw limit uses connection tracking on TCP; it cannot rate-limit UDP." };
  }

  const iface = String(interfaceName ?? "").trim();
  if (iface && !/^[A-Za-z0-9_.@-]+$/.test(iface)) {
    return { error: "Interface names contain letters, digits, dots, dashes and underscores only." };
  }
  if (iface && direction === "default") {
    return { error: "Naming an interface requires an explicit in or out direction." };
  }

  const extended = from.family !== "any" || to.family !== "any";
  const parts = ["ufw", actionSpec.id];

  if (direction !== "default") parts.push(direction);
  if (iface) parts.push("on", iface);

  if (extended) {
    parts.push("from", from.family === "any" ? "any" : String(fromHost).trim());
    parts.push("to", to.family === "any" ? "any" : String(toHost).trim());
    if (target === "port") {
      parts.push("port", String(port).trim());
      if (proto !== "any") parts.push("proto", proto);
    } else {
      parts.push("app", shellQuote(appProfile));
    }
  } else if (target === "port") {
    parts.push(proto === "any" ? String(port).trim() : `${String(port).trim()}/${proto}`);
  } else {
    parts.push(shellQuote(appProfile));
  }

  const trimmedComment = String(comment ?? "").trim();
  if (trimmedComment) {
    if (trimmedComment.includes("'")) return { error: "Comments cannot contain a single quote." };
    parts.push("comment", shellQuote(trimmedComment));
  }

  const warnings = [];
  if (action === "limit") {
    warnings.push(
      `limit drops an address that opens ${LIMIT_CONNECTIONS} or more connections in ${LIMIT_WINDOW_SECONDS} seconds, which also blocks legitimate bursts such as a parallel scp.`,
    );
  }
  if (action === "deny") {
    warnings.push("deny drops packets silently, so clients wait for a timeout. Use reject when you want a fast, honest failure.");
  }
  if (target === "port" && portSpec && portSpec.ports.includes(22) && action !== "allow" && action !== "limit") {
    warnings.push("This rule affects SSH on port 22. Keep an open session while you apply it, or you may lock yourself out.");
  }
  if (from.family === "any" && ["3306", "5432", "6379", "27017"].includes(String(port).trim())) {
    warnings.push("Database ports should not be open to the whole internet. Restrict the source to your app subnet or a VPN range.");
  }
  if (from.family === "ipv6" || to.family === "ipv6") {
    warnings.push("IPv6 rules only take effect when IPV6=yes is set in /etc/default/ufw.");
  }
  if (!extended && direction === "out") {
    warnings.push("Outgoing rules only bite after you set the outgoing default policy to deny; by default ufw allows all egress.");
  }

  return {
    command: parts.join(" "),
    warnings,
    form: extended ? "extended" : "simple",
    action: actionSpec.id,
    meaning: actionSpec.meaning,
  };
}

/**
 * Build a safe apply order around a set of rule commands.
 * @returns {{lines:Array<[string,string]>, warnings:string[]}} or {error}
 */
export function buildUfwPlan(options = {}) {
  const {
    ruleCommands = [],
    defaultIncoming = "deny",
    defaultOutgoing = "allow",
    sshPort = "22",
    logging = "low",
    enableFirewall = true,
  } = options;

  const commands = Array.isArray(ruleCommands) ? ruleCommands.filter(Boolean) : [];
  if (!["deny", "allow", "reject"].includes(defaultIncoming)) {
    return { error: "The incoming default policy must be deny, allow or reject." };
  }
  if (!["deny", "allow", "reject"].includes(defaultOutgoing)) {
    return { error: "The outgoing default policy must be deny, allow or reject." };
  }
  if (!["off", "low", "medium", "high", "full"].includes(logging)) {
    return { error: "Logging must be off, low, medium, high or full." };
  }
  const sshSpec = parsePortSpec(sshPort);
  if (!sshSpec.ok) return { error: `SSH port: ${sshSpec.message}` };

  const lines = [
    [`sudo ufw default ${defaultIncoming} incoming`, "Set the fallback for anything no rule matches."],
    [`sudo ufw default ${defaultOutgoing} outgoing`, "Leave egress open unless you have an allow-list ready."],
    [
      `sudo ufw limit ${String(sshPort).trim()}/tcp comment 'ssh'`,
      "Add SSH before enabling the firewall, or the next reconnect will fail.",
    ],
    ...commands.map((command) => [`sudo ${command}`, "Your generated rule."]),
  ];
  if (logging !== "off") {
    lines.push([`sudo ufw logging ${logging}`, "Write blocked packets to /var/log/ufw.log."]);
  }
  if (enableFirewall) {
    lines.push(["sudo ufw enable", "Turn the firewall on and persist it across reboots."]);
  }
  lines.push(["sudo ufw status numbered", "Verify the order; rules are matched top down and the first match wins."]);

  const warnings = [
    "Rules are evaluated in order and the first match wins, so put specific allows above broad denies — use `ufw insert 1 ...` to place one at the top.",
    "Docker publishes ports straight into the nat table and bypasses ufw. Bind containers to 127.0.0.1 or use a dedicated DOCKER-USER chain.",
  ];
  if (defaultIncoming === "allow") {
    warnings.push("An allow-by-default incoming policy means the firewall blocks nothing you did not explicitly deny.");
  }
  if (defaultOutgoing === "deny") {
    warnings.push("Denying outgoing traffic breaks DNS, NTP and package updates until you allow them explicitly.");
  }

  return { lines, warnings };
}
