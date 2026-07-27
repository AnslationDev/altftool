/**
 * Vagrantfile generator.
 *
 * Output follows the Vagrantfile schema in HashiCorp's docs
 * (developer.hashicorp.com/vagrant/docs/vagrantfile):
 *  - Vagrant.configure("2") — configuration version 2 is current for Vagrant 1.1+
 *  - config.vm.network "forwarded_port" / "private_network"
 *  - config.vm.synced_folder, config.vm.provider, config.vm.provision
 *
 * Networking limits worth encoding:
 *  - TCP/UDP ports are 1..65535; host ports below 1024 need root on the host
 *    (Vagrant forwarded-port docs).
 *  - VirtualBox 6.1.28+ restricts host-only networks to 192.168.56.0/21 by
 *    default (VirtualBox manual, "Host-Only Networks"), so static IPs outside
 *    that range trigger a warning.
 */

export const BOX_OPTIONS = [
  { id: "ubuntu/jammy64", label: "Ubuntu 22.04 LTS (ubuntu/jammy64)" },
  { id: "bento/ubuntu-24.04", label: "Ubuntu 24.04 LTS (bento/ubuntu-24.04)" },
  { id: "debian/bookworm64", label: "Debian 12 (debian/bookworm64)" },
  { id: "generic/rocky9", label: "Rocky Linux 9 (generic/rocky9)" },
  { id: "archlinux/archlinux", label: "Arch Linux (archlinux/archlinux)" },
  { id: "custom", label: "Custom box name…" },
];

export const PROVISIONER_OPTIONS = [
  { id: "none", label: "None" },
  { id: "shell-inline", label: "Shell (inline script)" },
  { id: "shell-path", label: "Shell (script file)" },
  { id: "ansible", label: "Ansible playbook" },
];

export const NETWORK_OPTIONS = [
  { id: "none", label: "NAT only (default)" },
  { id: "dhcp", label: "Private network — DHCP" },
  { id: "static", label: "Private network — static IP" },
];

/** RFC 1123 hostname label: alphanumerics and hyphens, no leading/trailing hyphen. */
const HOSTNAME_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/** Valid TCP/UDP port range. */
export const PORT_MIN = 1;
export const PORT_MAX = 65535;
/** Ports below this need root privileges on the host (well-known port range). */
export const PRIVILEGED_PORT_LIMIT = 1024;

/** Practical provider bounds so typos do not produce unbootable VMs. */
export const MEMORY_MIN_MB = 256;
export const MEMORY_MAX_MB = 262144; // 256 GiB
export const CPUS_MIN = 1;
export const CPUS_MAX = 64;

/** VirtualBox default host-only range 192.168.56.0/21 → 192.168.56.0 - 192.168.63.255. */
const VBOX_HOSTONLY_BASE = [192, 168, 56];
const VBOX_HOSTONLY_THIRD_OCTET_MAX = 63;

export function parseIpv4(value) {
  const match = IPV4_PATTERN.exec(String(value ?? "").trim());
  if (!match) return null;
  const octets = match.slice(1).map(Number);
  if (octets.some((octet) => octet > 255)) return null;
  return octets;
}

/** Is the address inside VirtualBox's default host-only range 192.168.56.0/21? */
export function inVirtualBoxHostOnlyRange(octets) {
  return (
    octets[0] === VBOX_HOSTONLY_BASE[0] &&
    octets[1] === VBOX_HOSTONLY_BASE[1] &&
    octets[2] >= VBOX_HOSTONLY_BASE[2] &&
    octets[2] <= VBOX_HOSTONLY_THIRD_OCTET_MAX
  );
}

/** Parse "8080:80, 8443:443" into [{host, guest}] or { error }. */
export function parseForwardedPorts(text) {
  const ports = [];
  const warnings = [];
  const tokens = String(text ?? "")
    .split(/[\s,]+/)
    .filter(Boolean);
  for (const token of tokens) {
    const parts = token.split(":");
    if (parts.length !== 2) {
      return { error: `"${token}" — write forwarded ports as host:guest, e.g. 8080:80.` };
    }
    const host = Number(parts[0]);
    const guest = Number(parts[1]);
    if (
      !Number.isInteger(host) ||
      !Number.isInteger(guest) ||
      host < PORT_MIN ||
      host > PORT_MAX ||
      guest < PORT_MIN ||
      guest > PORT_MAX
    ) {
      return { error: `"${token}" — ports must be whole numbers between ${PORT_MIN} and ${PORT_MAX}.` };
    }
    if (ports.some((port) => port.host === host)) {
      return { error: `Host port ${host} is forwarded twice — each host port can be used once.` };
    }
    if (host < PRIVILEGED_PORT_LIMIT) {
      warnings.push(`Host port ${host} is privileged (<1024) — vagrant up will need root on the host.`);
    }
    ports.push({ host, guest });
  }
  return { ports, warnings };
}

/** Escape a value for a double-quoted Ruby string. */
function rubyString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/#\{/g, '\\#{');
}

/**
 * Generate the Vagrantfile.
 * @returns {object} { text, warnings, summary } or { error }
 */
export function generateVagrantfile({
  box,
  customBox = "",
  hostname,
  memoryMb,
  cpus,
  network = "none",
  staticIp = "",
  forwardedPorts = "",
  syncedHost = "",
  syncedGuest = "",
  provisioner = "none",
  shellInline = "",
  shellPath = "",
  playbookPath = "",
}) {
  const warnings = [];

  const boxName = box === "custom" ? String(customBox).trim() : String(box ?? "").trim();
  if (boxName === "") return { error: "Choose a box or enter a custom box name." };
  if (!/^[\w.-]+(\/[\w.-]+)?$/.test(boxName)) {
    return { error: `"${boxName}" does not look like a Vagrant box name (user/box).` };
  }

  const host = String(hostname ?? "").trim();
  if (host !== "" && !HOSTNAME_PATTERN.test(host)) {
    return { error: "Hostname must be letters, digits and hyphens (RFC 1123), max 63 chars." };
  }

  const memory = Number(memoryMb);
  if (!Number.isFinite(memory) || memory < MEMORY_MIN_MB || memory > MEMORY_MAX_MB) {
    return { error: `Memory must be between ${MEMORY_MIN_MB} and ${MEMORY_MAX_MB} MB.` };
  }
  const cpuCount = Number(cpus);
  if (!Number.isInteger(cpuCount) || cpuCount < CPUS_MIN || cpuCount > CPUS_MAX) {
    return { error: `CPUs must be a whole number between ${CPUS_MIN} and ${CPUS_MAX}.` };
  }
  if (memory < 512) {
    warnings.push("Under 512 MB of RAM boots most boxes but package installs may fail.");
  }

  const portResult = parseForwardedPorts(forwardedPorts);
  if (portResult.error) return { error: portResult.error };
  warnings.push(...portResult.warnings);

  let ipOctets = null;
  if (network === "static") {
    ipOctets = parseIpv4(staticIp);
    if (!ipOctets) return { error: "Enter a valid IPv4 address for the static private network." };
    if (!inVirtualBoxHostOnlyRange(ipOctets)) {
      warnings.push(
        "VirtualBox 6.1.28+ only allows host-only IPs in 192.168.56.0/21 by default — other ranges need /etc/vbox/networks.conf.",
      );
    }
    if (ipOctets[3] === 0 || ipOctets[3] === 255) {
      return { error: "The last octet cannot be 0 or 255 — those are network/broadcast addresses." };
    }
  }

  const sync = String(syncedHost).trim() !== "" && String(syncedGuest).trim() !== "";
  if ((String(syncedHost).trim() === "") !== (String(syncedGuest).trim() === "")) {
    return { error: "Fill both the host and guest path for the synced folder, or leave both empty." };
  }
  if (sync && !String(syncedGuest).trim().startsWith("/")) {
    return { error: "The guest synced-folder path must be absolute (start with /)." };
  }

  if (provisioner === "shell-inline" && String(shellInline).trim() === "") {
    return { error: "Enter the inline shell script, or switch the provisioner to None." };
  }
  if (provisioner === "shell-path" && String(shellPath).trim() === "") {
    return { error: "Enter the shell script path, or switch the provisioner to None." };
  }
  if (provisioner === "ansible" && String(playbookPath).trim() === "") {
    return { error: "Enter the playbook path, or switch the provisioner to None." };
  }

  const lines = [
    "# -*- mode: ruby -*-",
    "# vi: set ft=ruby :",
    "",
    'Vagrant.configure("2") do |config|',
    `  config.vm.box = "${rubyString(boxName)}"`,
  ];
  if (host !== "") lines.push(`  config.vm.hostname = "${rubyString(host)}"`);

  portResult.ports.forEach(({ host: hostPort, guest }) => {
    lines.push(`  config.vm.network "forwarded_port", guest: ${guest}, host: ${hostPort}`);
  });
  if (network === "dhcp") {
    lines.push('  config.vm.network "private_network", type: "dhcp"');
  } else if (network === "static") {
    lines.push(`  config.vm.network "private_network", ip: "${ipOctets.join(".")}"`);
  }
  if (sync) {
    lines.push(
      `  config.vm.synced_folder "${rubyString(String(syncedHost).trim())}", "${rubyString(String(syncedGuest).trim())}"`,
    );
  }

  lines.push(
    "",
    '  config.vm.provider "virtualbox" do |vb|',
    `    vb.memory = "${Math.round(memory)}"`,
    `    vb.cpus = ${cpuCount}`,
    "  end",
  );

  if (provisioner === "shell-inline") {
    lines.push("", '  config.vm.provision "shell", inline: <<-SHELL');
    String(shellInline)
      .split("\n")
      .forEach((scriptLine) => lines.push(`    ${scriptLine}`));
    lines.push("  SHELL");
  } else if (provisioner === "shell-path") {
    lines.push("", `  config.vm.provision "shell", path: "${rubyString(String(shellPath).trim())}"`);
  } else if (provisioner === "ansible") {
    lines.push(
      "",
      '  config.vm.provision "ansible" do |ansible|',
      `    ansible.playbook = "${rubyString(String(playbookPath).trim())}"`,
      "  end",
    );
  }

  lines.push("end", "");

  return {
    text: lines.join("\n"),
    warnings,
    summary: {
      box: boxName,
      memory: Math.round(memory),
      cpus: cpuCount,
      forwardedPorts: portResult.ports.length,
      network,
      provisioner,
    },
  };
}
