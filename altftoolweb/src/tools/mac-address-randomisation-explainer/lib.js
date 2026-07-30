/**
 * MAC Randomisation Explainer — parses a MAC address and reads the two flag
 * bits IEEE 802 defines in the first octet, then explains what a randomised
 * address does to home-network rules.
 *
 * Pure module: no React, no DOM, no clocks, no network lookups. Every exported
 * function is total — unusable input returns { error } rather than a guess.
 *
 * The rules implemented here come from IEEE Std 802-2014, clause 8.2:
 *   bit 0 of the first octet (0x01) = I/G bit: 0 individual, 1 group/multicast
 *   bit 1 of the first octet (0x02) = U/L bit: 0 universally administered
 *                                              (assigned from an IEEE OUI),
 *                                              1 locally administered
 * Operating systems generate private Wi-Fi addresses by setting the U/L bit and
 * clearing the I/G bit, which is why a randomised address always has 2, 6, A or
 * E as the second hex digit.
 */

/** Bit masks from IEEE Std 802-2014 clause 8.2, applied to the first octet. */
export const IG_BIT_MASK = 0x01;
export const UL_BIT_MASK = 0x02;

/** A MAC-48 address is six octets, so twelve hexadecimal digits. */
export const MAC_HEX_DIGITS = 12;

/** The only second hex digits an OS-generated random unicast address can have. */
export const RANDOM_SECOND_NIBBLES = ["2", "6", "A", "E"];

/**
 * Well-known addresses worth naming rather than merely classifying.
 * Matching is on the canonical uppercase colon form or an octet prefix.
 */
const SPECIAL_ADDRESSES = [
  {
    match: (hex) => hex === "FFFFFFFFFFFF",
    label: "Broadcast address",
    note: "FF:FF:FF:FF:FF:FF is the Ethernet broadcast address — every station on the segment accepts it. It is not a device identity.",
  },
  {
    match: (hex) => hex === "000000000000",
    label: "All-zero address",
    note: "00:00:00:00:00:00 is a placeholder, not a real interface. Software shows it when an address is unset or has been hidden.",
  },
  {
    match: (hex) => hex.startsWith("01005E"),
    label: "IPv4 multicast address",
    note: "01:00:5E:xx:xx:xx is the range Ethernet uses to carry IPv4 multicast, so this is traffic addressing rather than a device.",
  },
  {
    match: (hex) => hex.startsWith("3333"),
    label: "IPv6 multicast address",
    note: "33:33:xx:xx:xx:xx carries IPv6 multicast, including neighbour discovery. It identifies a group, not a device.",
  },
];

/**
 * Accepts the four formats people paste: colon, hyphen, Cisco dotted-quad and
 * bare hex. Returns the twelve uppercase hex digits, or null if it is not a MAC.
 */
function toHexDigits(raw) {
  if (typeof raw !== "string") return null;
  const stripped = raw.trim().toUpperCase().replace(/[\s:.-]/g, "");
  if (stripped.length !== MAC_HEX_DIGITS) return null;
  if (!/^[0-9A-F]+$/.test(stripped)) return null;
  return stripped;
}

/** Groups twelve hex digits into the canonical colon-separated form. */
function toColonForm(hex) {
  return (hex.match(/.{2}/g) || []).join(":");
}

/**
 * Home-network features that depend on a device keeping one stable MAC address.
 * `breaksWhenRandom` is true where a per-network or rotating address defeats the
 * feature outright, false where it merely makes the list harder to read.
 */
export const NETWORK_IMPACTS = [
  {
    id: "dhcp-reservation",
    label: "Static DHCP reservation for a device",
    breaksWhenRandom: true,
    detail:
      "The reservation is keyed on the MAC, so a new random address gets a new lease from the pool and the device stops appearing at its fixed IP.",
  },
  {
    id: "mac-filter",
    label: "MAC address allow-list on the router",
    breaksWhenRandom: true,
    detail:
      "The device is refused the moment its address changes. MAC filtering was never a security control anyway — addresses are visible in the clear and trivially spoofed.",
  },
  {
    id: "parental-controls",
    label: "Per-device parental controls and schedules",
    breaksWhenRandom: true,
    detail:
      "Rules bound to a MAC silently stop applying after a rotation, which usually looks like the control failing rather than the address changing.",
  },
  {
    id: "qos",
    label: "Per-device QoS or bandwidth limits",
    breaksWhenRandom: true,
    detail:
      "The limit follows the address, so the device reappears as a new unlimited client.",
  },
  {
    id: "presence",
    label: "Presence detection for home automation",
    breaksWhenRandom: true,
    detail:
      "Arrival and departure automations that watch for a known MAC lose the device. Use a per-network fixed private address, or presence via the phone's own app.",
  },
  {
    id: "device-list",
    label: "Reading the router's connected-device list",
    breaksWhenRandom: false,
    detail:
      "The list still works, but names look unfamiliar and one phone can appear several times over a few weeks.",
  },
  {
    id: "captive-portal",
    label: "Captive portals and paid Wi-Fi sessions",
    breaksWhenRandom: false,
    detail:
      "The session is tied to the address, so a rotation means signing in again — annoying rather than broken.",
  },
  {
    id: "venue-tracking",
    label: "Shop and venue Wi-Fi tracking of your movements",
    breaksWhenRandom: true,
    detail:
      "This is the point of randomisation: a rotating address stops passive scanners linking your visits into one profile.",
  },
];

/**
 * How the major platforms handle Wi-Fi MAC randomisation. Kept as data so the
 * component renders it without knowing the rules.
 */
export const OS_BEHAVIOUR = [
  {
    id: "ios",
    platform: "iOS and iPadOS 14+",
    defaultState: "On by default",
    detail:
      "Private Wi-Fi Address gives each network its own random address that stays the same for that network. Later releases add a rotating option for networks you have not joined.",
  },
  {
    id: "android",
    platform: "Android 10+",
    defaultState: "On by default",
    detail:
      "A per-SSID randomised address is used by default. Android 12 and later also offer a non-persistent mode that draws a new address on each connection.",
  },
  {
    id: "macos",
    platform: "macOS",
    defaultState: "On for new networks",
    detail:
      "Recent macOS versions carry the same private Wi-Fi address feature as iOS, selectable per network as fixed or rotating.",
  },
  {
    id: "windows",
    platform: "Windows 10 and 11",
    defaultState: "Off by default",
    detail:
      "Settings > Network & internet > Wi-Fi has a Random hardware addresses switch, global and per-network, but it is not enabled unless you turn it on.",
  },
  {
    id: "linux",
    platform: "Linux with NetworkManager",
    defaultState: "Varies by distribution",
    detail:
      "wifi.cloned-mac-address controls it: `stable` derives a consistent address per network, `random` draws a new one each time, `permanent` uses the hardware address.",
  },
];

/**
 * Parse and classify a MAC address.
 *
 * @param {string} raw address in colon, hyphen, dotted or bare hex form
 * @returns {object} classification, or { error } for anything that is not a MAC
 */
export function explainMac(raw) {
  if (typeof raw !== "string" || raw.trim() === "") {
    return { error: "Enter a MAC address, for example 3A:2F:19:8C:41:0D." };
  }

  const hex = toHexDigits(raw);
  if (!hex) {
    return {
      error:
        "That is not a MAC address. It needs 12 hexadecimal digits, written as 3A:2F:19:8C:41:0D, 3A-2F-19-8C-41-0D, 3a2f.198c.410d or 3a2f198c410d.",
    };
  }

  const octets = (hex.match(/.{2}/g) || []).map((pair) => parseInt(pair, 16));
  const firstOctet = octets[0];
  const multicast = (firstOctet & IG_BIT_MASK) === IG_BIT_MASK;
  const locallyAdministered = (firstOctet & UL_BIT_MASK) === UL_BIT_MASK;
  const secondNibble = hex.charAt(1);

  const special = SPECIAL_ADDRESSES.find((entry) => entry.match(hex)) || null;

  // An OS-generated private address is locally administered and unicast, which
  // forces the second hex digit to 2, 6, A or E.
  const likelyRandomised =
    !special && locallyAdministered && !multicast && RANDOM_SECOND_NIBBLES.includes(secondNibble);

  let kind;
  let headline;
  let meaning;

  if (special) {
    kind = "special";
    headline = special.label;
    meaning = special.note;
  } else if (multicast) {
    kind = "multicast";
    headline = "Group (multicast) address";
    meaning =
      "The I/G bit is set, so this addresses a group of receivers rather than one interface. It never identifies a single device.";
  } else if (likelyRandomised) {
    kind = "randomised";
    headline = "Randomised (locally administered) address";
    meaning =
      "The U/L bit is set and the address is unicast — the signature of a private Wi-Fi address generated by the operating system. There is no manufacturer behind it, and it may change per network or over time.";
  } else if (locallyAdministered) {
    kind = "local";
    headline = "Locally administered address";
    meaning =
      "The U/L bit is set, so this address was assigned by software rather than burned in at the factory: a virtual machine, a container bridge, a manually spoofed interface or a randomised address.";
  } else {
    kind = "universal";
    headline = "Real hardware address";
    meaning =
      "The U/L bit is clear, so the first three octets are an IEEE-assigned OUI identifying the manufacturer. This address is stable and follows the device between networks.";
  }

  const oui = toColonForm(hex).slice(0, 8);

  const affected = NETWORK_IMPACTS.filter((entry) => entry.breaksWhenRandom);

  return {
    input: raw.trim(),
    normalised: toColonForm(hex),
    hyphenForm: (hex.match(/.{2}/g) || []).join("-"),
    bareForm: hex,
    octets,
    firstOctet,
    firstOctetBinary: firstOctet.toString(2).padStart(8, "0"),
    secondNibble,
    multicast,
    locallyAdministered,
    likelyRandomised,
    kind,
    headline,
    meaning,
    oui: locallyAdministered ? null : oui,
    ouiNote: locallyAdministered
      ? "No manufacturer lookup is possible: locally administered addresses are not drawn from an IEEE OUI."
      : `Look ${oui} up in the IEEE OUI registry to identify the manufacturer.`,
    stableIdentifier: kind === "universal",
    impacts: NETWORK_IMPACTS,
    brokenByRandomisation: kind === "randomised" ? affected.length : 0,
    totalImpacts: NETWORK_IMPACTS.length,
  };
}

/**
 * Round-trip helper: which second hex digit a given first octet produces once an
 * operating system sets the U/L bit and clears the I/G bit for a private address.
 *
 * @param {number} octet the original first octet, 0-255
 * @returns {object} { octet, privateOctet, secondNibble } or { error }
 */
export function toPrivateFirstOctet(octet) {
  const value = Number(octet);
  if (!Number.isInteger(value) || value < 0 || value > 255) {
    return { error: "A first octet is a whole number between 0 and 255." };
  }
  const privateOctet = (value | UL_BIT_MASK) & ~IG_BIT_MASK & 0xff;
  return {
    octet: value,
    privateOctet,
    hex: privateOctet.toString(16).toUpperCase().padStart(2, "0"),
    secondNibble: privateOctet.toString(16).toUpperCase().padStart(2, "0").charAt(1),
  };
}
