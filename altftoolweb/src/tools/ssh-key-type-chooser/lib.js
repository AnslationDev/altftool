/**
 * SSH key type comparison and ssh-keygen command generation.
 *
 * Security strengths come from NIST SP 800-57 Part 1 Rev. 5, Table 2
 * ("Comparable security strengths"): RSA-2048 = 112 bits, RSA-3072 = 128 bits,
 * RSA-7680 = 192 bits; ECC with a 256-bit curve = 128 bits, 384-bit = 192 bits,
 * 512+-bit = 256 bits. Ed25519 uses Curve25519 and targets the same ~128-bit
 * level. OpenSSH availability comes from the OpenSSH release notes:
 * ECDSA in 5.7 (2011), Ed25519 in 6.5 (2014), FIDO2 *-sk keys in 8.2 (2020).
 *
 * Pure module: no crypto is performed and no key is ever generated here.
 */

/** Compatibility targets the user can pick. */
export const TARGETS = [
  {
    id: "current",
    label: "Current only (OpenSSH 8.2+, 2020 and newer — required for FIDO2 keys)",
    minOpenSsh: 8.2,
  },
  {
    id: "modern",
    label: "Modern (OpenSSH 6.5+, GitHub, GitLab, current Linux)",
    minOpenSsh: 6.5,
  },
  {
    id: "mixed",
    label: "Mixed fleet (some hosts on OpenSSH 5.7-6.4)",
    minOpenSsh: 5.7,
  },
  {
    id: "legacy",
    label: "Legacy appliances (pre-2011 OpenSSH, old network gear)",
    minOpenSsh: 0,
  },
];

/** Security strength floors a policy might demand, in bits. */
export const SECURITY_FLOORS = [112, 128, 192, 256];

/** ssh-keygen -a accepts a rounds count; 16 is the current default, 100 is the common hardened value. */
export const DEFAULT_KDF_ROUNDS = 100;
export const MIN_KDF_ROUNDS = 1;
export const MAX_KDF_ROUNDS = 1000;

export const KEY_TYPES = [
  {
    id: "ed25519",
    label: "Ed25519",
    family: "edwards",
    keygenType: "ed25519",
    keygenBits: null,
    securityBits: 128,
    securityNote: "Curve25519 at the same ~128-bit level as RSA-3072, in a 32-byte key.",
    publicKeyBytes: 32,
    signatureBytes: 64,
    minOpenSsh: 6.5,
    hardware: false,
    fipsFriendly: false,
    speed: "Fastest sign and verify of the three families.",
    summary: "The default choice for new keys since 2014: small, fast, and immune to the nonce-reuse failure that breaks ECDSA.",
  },
  {
    id: "ed25519-sk",
    label: "Ed25519-sk (FIDO2 hardware)",
    family: "edwards",
    keygenType: "ed25519-sk",
    keygenBits: null,
    securityBits: 128,
    securityNote: "Ed25519 with the private scalar held inside a FIDO2 authenticator.",
    publicKeyBytes: 32,
    signatureBytes: 64,
    minOpenSsh: 8.2,
    hardware: true,
    fipsFriendly: false,
    speed: "Signing waits for a physical touch on the security key.",
    summary: "Private key material never leaves the security key, so a compromised laptop cannot leak it.",
  },
  {
    id: "ecdsa-sk",
    label: "ECDSA-sk (FIDO2 hardware)",
    family: "ecdsa",
    keygenType: "ecdsa-sk",
    keygenBits: null,
    securityBits: 128,
    securityNote: "NIST P-256 held inside a FIDO2 authenticator.",
    publicKeyBytes: 65,
    signatureBytes: 64,
    minOpenSsh: 8.2,
    hardware: true,
    fipsFriendly: true,
    speed: "Signing waits for a physical touch on the security key.",
    summary: "Use when the authenticator firmware predates Ed25519 support and only offers P-256.",
  },
  {
    id: "ecdsa-p256",
    label: "ECDSA nistp256",
    family: "ecdsa",
    keygenType: "ecdsa",
    keygenBits: 256,
    securityBits: 128,
    securityNote: "256-bit NIST curve, 128-bit strength per SP 800-57 Table 2.",
    publicKeyBytes: 65,
    signatureBytes: 64,
    minOpenSsh: 5.7,
    hardware: false,
    fipsFriendly: true,
    speed: "Fast, though slower to verify than Ed25519.",
    summary: "Widely accepted in compliance-driven environments that only validate NIST curves.",
  },
  {
    id: "ecdsa-p384",
    label: "ECDSA nistp384",
    family: "ecdsa",
    keygenType: "ecdsa",
    keygenBits: 384,
    securityBits: 192,
    securityNote: "384-bit NIST curve, 192-bit strength per SP 800-57 Table 2.",
    publicKeyBytes: 97,
    signatureBytes: 96,
    minOpenSsh: 5.7,
    hardware: false,
    fipsFriendly: true,
    speed: "Roughly three times the signing cost of P-256.",
    summary: "The usual answer when a policy demands a 192-bit security floor.",
  },
  {
    id: "ecdsa-p521",
    label: "ECDSA nistp521",
    family: "ecdsa",
    keygenType: "ecdsa",
    keygenBits: 521,
    securityBits: 256,
    securityNote: "521-bit NIST curve, 256-bit strength per SP 800-57 Table 2.",
    publicKeyBytes: 133,
    signatureBytes: 132,
    minOpenSsh: 5.7,
    hardware: false,
    fipsFriendly: true,
    speed: "Slowest of the NIST curves and rarely necessary.",
    summary: "Only worth it when a written policy names a 256-bit floor.",
  },
  {
    id: "rsa-2048",
    label: "RSA 2048",
    family: "rsa",
    keygenType: "rsa",
    keygenBits: 2048,
    securityBits: 112,
    securityNote: "112-bit strength per SP 800-57 Table 2; NIST deprecated 112-bit signing after 2030.",
    publicKeyBytes: 256,
    signatureBytes: 256,
    minOpenSsh: 0,
    hardware: false,
    fipsFriendly: true,
    speed: "Slow key generation, moderate signing.",
    summary: "The lowest RSA size still worth generating, and only for hardware that accepts nothing better.",
  },
  {
    id: "rsa-3072",
    label: "RSA 3072",
    family: "rsa",
    keygenType: "rsa",
    keygenBits: 3072,
    securityBits: 128,
    securityNote: "128-bit strength per SP 800-57 Table 2 — the RSA size that matches Ed25519.",
    publicKeyBytes: 384,
    signatureBytes: 384,
    minOpenSsh: 0,
    hardware: false,
    fipsFriendly: true,
    speed: "Noticeably slower to generate than 2048.",
    summary: "The right RSA size when you need RSA at all: same strength as Ed25519, far smaller than 4096.",
  },
  {
    id: "rsa-4096",
    label: "RSA 4096",
    family: "rsa",
    keygenType: "rsa",
    keygenBits: 4096,
    securityBits: 128,
    securityNote:
      "Not tabulated by NIST; it sits above the 128-bit mark of RSA-3072 but well below the 192-bit mark of RSA-7680.",
    publicKeyBytes: 512,
    signatureBytes: 512,
    minOpenSsh: 0,
    hardware: false,
    fipsFriendly: true,
    speed: "Slowest to generate; every handshake carries a 512-byte signature.",
    summary: "Popular by habit rather than by analysis — it buys little over 3072 and costs size on every connection.",
  },
];

/** Family preference: Edwards first, then NIST curves, then RSA. */
const FAMILY_RANK = { edwards: 0, ecdsa: 1, rsa: 2 };

export function getKeyType(id) {
  return KEY_TYPES.find((item) => item.id === id) ?? null;
}

export function getTarget(id) {
  return TARGETS.find((item) => item.id === id) ?? null;
}

const SAFE_ARG = /^[A-Za-z0-9_@%+=:,./~-]+$/;

/** Quote a single shell argument using POSIX single-quote escaping. */
export function shellQuote(value) {
  const raw = String(value ?? "").trim();
  if (raw === "") return "''";
  if (SAFE_ARG.test(raw)) return raw;
  return `'${raw.replace(/'/g, `'\\''`)}'`;
}

/**
 * Rank the key types against a set of constraints.
 *
 * Rule order: eliminate anything that cannot work (hardware, OpenSSH version,
 * security floor), then sort by family preference and, inside a family, by the
 * smallest key that still clears the floor.
 *
 * @returns {{recommended:object, ranked:object[], rejected:object[]}} or {error}
 */
export function rankKeyTypes(constraints = {}) {
  const { target = "modern", hardwareToken = false, fipsRequired = false, securityFloor = 128 } = constraints;

  const targetSpec = getTarget(target);
  if (!targetSpec) return { error: "Choose a compatibility target." };

  const floor = Number(securityFloor);
  if (!Number.isFinite(floor) || floor <= 0) {
    return { error: "The security floor must be a positive number of bits." };
  }
  if (!SECURITY_FLOORS.includes(floor)) {
    return { error: `Pick one of the standard strength levels: ${SECURITY_FLOORS.join(", ")} bits.` };
  }

  const ranked = [];
  const rejected = [];

  for (const type of KEY_TYPES) {
    const reasons = [];
    if (hardwareToken !== type.hardware) {
      rejected.push({
        ...type,
        reason: hardwareToken
          ? "Not backed by a FIDO2 security key."
          : "Requires a FIDO2 security key plugged in for every login.",
      });
      continue;
    }
    if (type.minOpenSsh > targetSpec.minOpenSsh) {
      rejected.push({ ...type, reason: `Needs OpenSSH ${type.minOpenSsh}+, newer than your compatibility target.` });
      continue;
    }
    if (type.securityBits < floor) {
      rejected.push({ ...type, reason: `Provides ${type.securityBits}-bit strength, below your ${floor}-bit floor.` });
      continue;
    }

    let familyRank = FAMILY_RANK[type.family];
    if (fipsRequired && type.family === "edwards") {
      // FIPS 186-5 (Feb 2023) approves EdDSA, but most validated modules in the
      // field still ship only ECDSA and RSA, so it is ranked below them here.
      familyRank += 2;
      reasons.push("EdDSA is approved in FIPS 186-5 but many validated modules still do not implement it.");
    }
    if (fipsRequired && !type.fipsFriendly) {
      reasons.push("Confirm your validated module lists this algorithm on its certificate.");
    }
    if (type.securityBits > floor) {
      reasons.push(`Exceeds your ${floor}-bit floor with ${type.securityBits}-bit strength.`);
    } else {
      reasons.push(`Meets your ${floor}-bit floor exactly.`);
    }
    reasons.push(`Public key ${type.publicKeyBytes} bytes, signature ${type.signatureBytes} bytes.`);
    reasons.push(`Available from OpenSSH ${type.minOpenSsh || "3.x"} onwards.`);

    ranked.push({ ...type, familyRank, reasons });
  }

  if (ranked.length === 0) {
    if (hardwareToken && targetSpec.minOpenSsh < 8.2) {
      return {
        error:
          "FIDO2 (-sk) keys were added in OpenSSH 8.2, so they need the current-only compatibility target.",
      };
    }
    if (hardwareToken && floor > 128) {
      return {
        error:
          "FIDO2 security keys sign with Ed25519 or NIST P-256, both rated 128-bit, so no hardware key can meet a higher floor.",
      };
    }
    return {
      error:
        "No key type satisfies those constraints together. Lower the security floor, or widen the compatibility target.",
    };
  }

  ranked.sort((a, b) => {
    if (a.familyRank !== b.familyRank) return a.familyRank - b.familyRank;
    if (a.securityBits !== b.securityBits) return a.securityBits - b.securityBits;
    return a.publicKeyBytes - b.publicKeyBytes;
  });

  return { recommended: ranked[0], ranked, rejected, floor, target: targetSpec.id };
}

/**
 * Build the ssh-keygen command and the follow-up commands for a chosen type.
 *
 * @returns {{command:string, followUps:Array<[string,string]>, warnings:string[]}} or {error}
 */
export function buildKeygenCommand(options = {}) {
  const {
    typeId = "ed25519",
    keyPath = "~/.ssh/id_ed25519",
    comment = "",
    kdfRounds = DEFAULT_KDF_ROUNDS,
    residentKey = false,
    verifyRequired = false,
    remoteHost = "",
  } = options;

  const type = getKeyType(typeId);
  if (!type) return { error: "Choose a key type before generating the command." };

  const path = String(keyPath ?? "").trim();
  if (!path) return { error: "Enter the file path for the new key, for example ~/.ssh/id_ed25519." };

  const rounds = Number(kdfRounds);
  if (!Number.isFinite(rounds) || !Number.isInteger(rounds)) {
    return { error: "KDF rounds must be a whole number." };
  }
  if (rounds < MIN_KDF_ROUNDS || rounds > MAX_KDF_ROUNDS) {
    return { error: `KDF rounds must be between ${MIN_KDF_ROUNDS} and ${MAX_KDF_ROUNDS}.` };
  }
  if (!type.hardware && (residentKey || verifyRequired)) {
    return { error: "Resident and verify-required options only apply to FIDO2 (-sk) key types." };
  }

  const parts = ["ssh-keygen", "-t", type.keygenType];
  if (type.keygenBits) parts.push("-b", String(type.keygenBits));
  parts.push("-a", String(rounds));
  if (residentKey) parts.push("-O", "resident");
  if (verifyRequired) parts.push("-O", "verify-required");
  const trimmedComment = String(comment ?? "").trim();
  if (trimmedComment) parts.push("-C", shellQuote(trimmedComment));
  parts.push("-f", shellQuote(path));

  const followUps = [
    [`ssh-keygen -lf ${shellQuote(`${path}.pub`)}`, "Print the fingerprint so you can verify the key you just made."],
    [`chmod 600 ${shellQuote(path)}`, "OpenSSH refuses to use a private key that other users can read."],
    ['eval "$(ssh-agent -s)"', "Start an agent in the current shell so the passphrase is typed once."],
    [`ssh-add ${shellQuote(path)}`, "Load the key into the agent."],
  ];
  if (String(remoteHost).trim()) {
    followUps.push([
      `ssh-copy-id -i ${shellQuote(`${path}.pub`)} ${shellQuote(String(remoteHost).trim())}`,
      "Append the public key to the remote authorized_keys file.",
    ]);
  }

  const warnings = [];
  warnings.push("Never pass the passphrase with -N on the command line; let ssh-keygen prompt so it stays out of shell history.");
  if (rounds < 16) {
    warnings.push("ssh-keygen already defaults to 16 KDF rounds; a lower value weakens the encryption of the private key file.");
  }
  if (type.hardware) {
    warnings.push("Enrol a second security key and add both public keys before you rely on this one — a lost token means lost access.");
  }
  if (type.family === "rsa") {
    warnings.push("RSA keys still work, but the old ssh-rsa (SHA-1) signature algorithm has been disabled by default since OpenSSH 8.8; the server must support rsa-sha2-256 or rsa-sha2-512.");
  }
  if (type.family === "ecdsa" && !type.hardware) {
    warnings.push("ECDSA signatures leak the private key if the random nonce ever repeats, so avoid it on hosts with weak entropy such as freshly imaged VMs.");
  }
  if (type.securityBits <= 112) {
    warnings.push("112-bit strength is deprecated for signing after 2030 in NIST SP 800-57; plan a rotation.");
  }
  if (residentKey) {
    warnings.push("A resident key is stored on the token itself and can be extracted by anyone holding it plus the PIN.");
  }

  return {
    command: parts.join(" "),
    followUps,
    warnings,
    typeId: type.id,
    publicKeyPath: `${path}.pub`,
  };
}
