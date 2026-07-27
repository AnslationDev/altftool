/**
 * Docker network driver semantics, encoded from the Docker Engine
 * networking documentation (docs.docker.com/engine/network/ and the
 * per-driver pages for bridge, host, none and macvlan).
 *
 * Pure data + pure functions. No React, no DOM, no network calls.
 */

/** Valid TCP/UDP port range (RFC 6335 user + dynamic space; 0 is reserved). */
export const PORT_MIN = 1;
export const PORT_MAX = 65535;

/**
 * The network modes a container can be started with via `--network`.
 * Facts per docker docs:
 *  - default bridge: NAT through docker0; containers resolve each other only
 *    by IP (automatic DNS by name works ONLY on user-defined networks);
 *    `-p` is required for the host / LAN to reach the container.
 *  - user-defined bridge: same NAT behaviour, plus an embedded DNS server so
 *    containers resolve each other by container name or network alias.
 *  - host: the container shares the host's network namespace; published ports
 *    (`-p`) are ignored with a warning; only one process can own a given port.
 *    Native on Linux; on Docker Desktop it requires enabling host networking
 *    (available since Docker Desktop 4.34).
 *  - none: only the loopback interface exists; no ingress or egress.
 *  - container:<name>: joins another container's network namespace; the two
 *    share localhost and ports must be published on the OWNING container.
 *  - macvlan: the container gets its own MAC + IP on the physical LAN; LAN
 *    peers reach it directly, but by design the Docker HOST itself cannot
 *    talk to the container over the macvlan parent interface.
 */
export const NETWORK_MODES = [
  {
    id: "bridge",
    label: "Default bridge",
    flag: "--network bridge (default)",
    dnsByName: false,
    needsPublish: true,
    isolationFromHost: true,
    linuxOnlyNote: null,
    summary:
      "NAT through docker0. Containers on it see each other by IP only; the host and LAN need -p published ports.",
  },
  {
    id: "user-bridge",
    label: "User-defined bridge",
    flag: "docker network create mynet && --network mynet",
    dnsByName: true,
    needsPublish: true,
    isolationFromHost: true,
    linuxOnlyNote: null,
    summary:
      "Same NAT model as the default bridge, plus embedded DNS: containers resolve each other by name or alias. The recommended default.",
  },
  {
    id: "host",
    label: "Host",
    flag: "--network host",
    dnsByName: false,
    needsPublish: false,
    isolationFromHost: false,
    linuxOnlyNote:
      "Native on Linux; on Docker Desktop (Mac/Windows) it must be enabled in settings (Docker Desktop 4.34+).",
    summary:
      "Shares the host network namespace. The app's port IS a host port; -p is ignored with a warning.",
  },
  {
    id: "none",
    label: "None",
    flag: "--network none",
    dnsByName: false,
    needsPublish: false,
    isolationFromHost: true,
    linuxOnlyNote: null,
    summary: "Only loopback inside the container. No ingress, no egress. For fully offline workloads.",
  },
  {
    id: "container",
    label: "container:<name> (shared namespace)",
    flag: "--network container:<name>",
    dnsByName: false,
    needsPublish: false,
    isolationFromHost: true,
    linuxOnlyNote: null,
    summary:
      "Joins another container's network namespace (the Kubernetes-pod pattern). Both share localhost; ports are published on the owning container.",
  },
  {
    id: "macvlan",
    label: "Macvlan",
    flag: "docker network create -d macvlan ... && --network mymacvlan",
    dnsByName: true,
    needsPublish: false,
    isolationFromHost: false,
    linuxOnlyNote:
      "Linux only; needs a parent interface and usually promiscuous mode. Not available on Docker Desktop.",
    summary:
      "The container gets its own MAC and IP on your physical LAN. LAN devices reach it directly; the host itself cannot (macvlan isolation).",
  },
];

/** Validate an integer port. Returns null when OK, or a message. */
function portProblem(value, name) {
  if (!Number.isInteger(value)) return `${name} must be a whole number.`;
  if (value < PORT_MIN || value > PORT_MAX) {
    return `${name} must be between ${PORT_MIN} and ${PORT_MAX}.`;
  }
  return null;
}

/**
 * Explain exactly how a container running `appPort` is reached under a given
 * network mode, with an optional `-p hostPort:appPort` publish flag.
 *
 * @param {object} input
 * @param {string} input.mode       One of NETWORK_MODES ids.
 * @param {number} input.appPort    Port the app listens on inside the container.
 * @param {boolean} input.published Whether -p hostPort:appPort was given.
 * @param {number} [input.hostPort] Host side of the publish flag.
 * @returns {object} reachability facts, or { error }.
 */
export function explainReachability({ mode, appPort, published = false, hostPort }) {
  const modeDef = NETWORK_MODES.find((m) => m.id === mode);
  if (!modeDef) return { error: "Choose a network mode." };

  const appProblem = portProblem(appPort, "The container app port");
  if (appProblem) return { error: appProblem };

  if (published) {
    const hostProblem = portProblem(hostPort, "The published host port");
    if (hostProblem) return { error: hostProblem };
  }

  const notes = [];
  let fromHost;
  let fromLan;
  let fromPeer; // another container on the same network
  let publishEffective = false;

  switch (modeDef.id) {
    case "bridge":
    case "user-bridge": {
      if (published) {
        publishEffective = true;
        fromHost = `localhost:${hostPort} (NAT to container port ${appPort})`;
        fromLan = `<host-ip>:${hostPort}`;
      } else {
        fromHost = `container-ip:${appPort} only (Linux); publish with -p to get a stable localhost port`;
        fromLan = "not reachable — no port published";
        notes.push("Without -p, nothing outside the Docker host's bridge can reach the app.");
      }
      fromPeer = modeDef.dnsByName
        ? `http://<container-name>:${appPort} — embedded DNS resolves the name`
        : `container-ip:${appPort} — the DEFAULT bridge has no automatic DNS by name`;
      if (!modeDef.dnsByName) {
        notes.push("Move to a user-defined bridge to get container-name DNS (--link is legacy).");
      }
      break;
    }
    case "host": {
      fromHost = `localhost:${appPort} — the app binds directly on the host`;
      fromLan = `<host-ip>:${appPort}`;
      fromPeer = `localhost:${appPort} for other host-network containers; <host-ip>:${appPort} for bridged ones`;
      if (published) {
        notes.push("-p is IGNORED in host mode — Docker prints a warning and publishes nothing.");
      }
      notes.push("Port conflicts with host services are possible: only one listener per port.");
      break;
    }
    case "none": {
      fromHost = "not reachable — the container has only a loopback interface";
      fromLan = "not reachable";
      fromPeer = "not reachable";
      if (published) notes.push("-p has no effect: there is no network interface to publish through.");
      break;
    }
    case "container": {
      fromHost = "via ports published on the OWNING container (publish there, not here)";
      fromLan = "via the owning container's published ports";
      fromPeer = `localhost:${appPort} for the namespace owner — both containers share one localhost`;
      if (published) {
        notes.push("-p cannot be combined with --network container:<name>; docker run rejects it.");
      }
      break;
    }
    case "macvlan": {
      fromHost =
        "NOT reachable from the Docker host itself (macvlan isolation) unless you add a macvlan sub-interface on the host";
      fromLan = `<container-lan-ip>:${appPort} — the container is a first-class LAN citizen`;
      fromPeer = `<container-name or ip>:${appPort} on the same macvlan network`;
      if (published) notes.push("-p is unnecessary on macvlan: the container's IP is directly routable on the LAN.");
      break;
    }
    default:
      return { error: "Choose a network mode." };
  }

  return {
    mode: modeDef,
    fromHost,
    fromLan,
    fromPeer,
    dnsByName: modeDef.dnsByName,
    publishEffective,
    notes,
  };
}
