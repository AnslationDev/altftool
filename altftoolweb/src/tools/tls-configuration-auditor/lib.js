/**
 * TLS Configuration Auditor — pure logic.
 *
 * Reads text that describes a TLS setup — an `openssl s_client` transcript, an
 * `openssl x509 -text` certificate dump, an nmap ssl-enum-ciphers table, or an
 * nginx / Apache TLS block — and reports what protocol versions, cipher suites,
 * key sizes and certificate properties it actually contains.
 *
 * Nothing here touches the network, the clock or a random source. The one piece
 * of outside state, the reference date used for certificate expiry, is passed in
 * explicitly as `asOf`, so a given (text, asOf) pair always yields the same audit.
 */

export const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info", "good"];

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export const PROTOCOLS = {
  SSLv2: {
    label: "SSL 2.0",
    severity: "critical",
    note: "Prohibited by RFC 6176 since 2011. Broken key exchange and no handshake integrity; still offering it enables the DROWN attack against other services that share the key.",
  },
  SSLv3: {
    label: "SSL 3.0",
    severity: "critical",
    note: "Deprecated by RFC 7568. The CBC padding design is what POODLE attacks; there is no configuration that makes it safe.",
  },
  "TLSv1.0": {
    label: "TLS 1.0",
    severity: "high",
    note: "Formally deprecated by RFC 8996 (2021) and disallowed by PCI DSS since June 2018. Uses MD5+SHA-1 in the PRF and has no AEAD suites.",
  },
  "TLSv1.1": {
    label: "TLS 1.1",
    severity: "high",
    note: "Deprecated alongside TLS 1.0 by RFC 8996. It fixed the BEAST IV problem and nothing else; no AEAD, no modern signature algorithms.",
  },
  "TLSv1.2": {
    label: "TLS 1.2",
    severity: "good",
    note: "Still current and safe when limited to AEAD suites with forward secrecy. Keep it for client compatibility alongside TLS 1.3.",
  },
  "TLSv1.3": {
    label: "TLS 1.3",
    severity: "good",
    note: "Every suite is AEAD with forward secrecy, static RSA key exchange and renegotiation are gone, and the handshake is one round trip.",
  },
};

/** Map any spelling of a protocol version onto a PROTOCOLS key. */
export function normaliseProtocol(token) {
  const t = String(token).trim().toLowerCase().replace(/\s+/g, "");
  if (t === "sslv2" || t === "ssl2" || t === "ssl2.0" || t === "sslv2.0") return "SSLv2";
  if (t === "sslv3" || t === "ssl3" || t === "ssl3.0" || t === "sslv3.0") return "SSLv3";
  if (t === "tlsv1" || t === "tls1" || t === "tlsv1.0" || t === "tls1.0" || t === "tlsv1_0") return "TLSv1.0";
  if (t === "tlsv1.1" || t === "tls1.1" || t === "tlsv1_1") return "TLSv1.1";
  if (t === "tlsv1.2" || t === "tls1.2" || t === "tlsv1_2") return "TLSv1.2";
  if (t === "tlsv1.3" || t === "tls1.3" || t === "tlsv1_3") return "TLSv1.3";
  return null;
}

const TLS13_SUITES = new Set([
  "TLS_AES_128_GCM_SHA256",
  "TLS_AES_256_GCM_SHA384",
  "TLS_CHACHA20_POLY1305_SHA256",
  "TLS_AES_128_CCM_SHA256",
  "TLS_AES_128_CCM_8_SHA256",
]);

/**
 * Break a cipher suite name (OpenSSL or IANA spelling) into its parts and say
 * what is wrong with it. Returns { error } when the string is not a suite name.
 */
export function classifyCipher(raw) {
  const name = String(raw || "").trim();
  if (!name) return { error: "Empty cipher suite name." };
  const upper = name.toUpperCase().replace(/^TLS13-/, "TLS_");
  const canonical = upper.replace(/-/g, "_");

  const issues = [];
  let kx = null;
  let auth = null;
  let bulk = null;
  let bits = null;
  let mode = null;
  let mac = null;
  let tls13 = false;

  if (TLS13_SUITES.has(canonical)) {
    tls13 = true;
    kx = "ECDHE or DHE (negotiated separately in TLS 1.3)";
    auth = "certificate signature (negotiated separately in TLS 1.3)";
  }

  const has = (needle) => canonical.includes(needle);

  if (!tls13) {
    if (has("ECDHE") || has("EECDH")) kx = "ECDHE";
    else if (has("AECDH")) kx = "anonymous ECDH";
    else if (has("ADH")) kx = "anonymous DH";
    else if (has("DHE") || has("EDH")) kx = "DHE";
    else if (has("ECDH")) kx = "static ECDH";
    else if (has("SRP")) kx = "SRP";
    else if (has("KRB5")) kx = "Kerberos";
    else if (canonical.startsWith("PSK") || has("_PSK")) kx = "PSK";
    else if (has("_DH_")) kx = "static DH";
    else kx = "RSA key transport";

    if (has("ECDSA")) auth = "ECDSA";
    else if (has("_DSS") || has("DSS")) auth = "DSA";
    else if (kx === "anonymous ECDH" || kx === "anonymous DH") auth = "none";
    else if (has("PSK") && !has("RSA")) auth = "pre-shared key";
    else auth = "RSA";
  }

  if (has("CHACHA20")) {
    bulk = "ChaCha20";
    bits = 256;
    mode = "POLY1305";
  } else if (has("AES_256") || has("AES256")) {
    bulk = "AES";
    bits = 256;
  } else if (has("AES_128") || has("AES128")) {
    bulk = "AES";
    bits = 128;
  } else if (has("AES")) {
    bulk = "AES";
  } else if (has("CAMELLIA_256") || has("CAMELLIA256")) {
    bulk = "Camellia";
    bits = 256;
  } else if (has("CAMELLIA")) {
    bulk = "Camellia";
    bits = 128;
  } else if (has("ARIA")) {
    bulk = "ARIA";
  } else if (has("3DES") || has("DES_EDE3") || has("DES_CBC3") || has("DESCBC3")) {
    bulk = "3DES";
    bits = 112;
  } else if (has("RC4")) {
    bulk = "RC4";
  } else if (has("RC2")) {
    bulk = "RC2";
  } else if (has("IDEA")) {
    bulk = "IDEA";
  } else if (has("SEED")) {
    bulk = "SEED";
  } else if (has("DES")) {
    bulk = "DES";
    bits = 56;
  } else if (has("NULL")) {
    bulk = "none";
  }

  if (!mode) {
    if (has("GCM")) mode = "GCM";
    else if (has("CCM_8") || has("CCM8")) mode = "CCM_8";
    else if (has("CCM")) mode = "CCM";
    else if (has("CBC") || bulk === "3DES" || bulk === "DES") mode = "CBC";
    else if (bulk === "AES" || bulk === "Camellia") mode = "CBC";
  }

  if (has("SHA384")) mac = "SHA-384";
  else if (has("SHA256")) mac = "SHA-256";
  else if (has("POLY1305")) mac = "Poly1305 (AEAD tag)";
  else if (has("MD5")) mac = "MD5";
  else if (has("SHA")) mac = "SHA-1";

  if (!bulk && !tls13) {
    return { error: `"${name}" does not look like a TLS cipher suite name.` };
  }

  const aead = tls13 || mode === "GCM" || mode === "CCM" || mode === "CCM_8" || bulk === "ChaCha20";
  const forwardSecrecy =
    tls13 || kx === "ECDHE" || kx === "DHE" || kx === "anonymous DH" || kx === "anonymous ECDH";

  if (bulk === "none") {
    issues.push({ severity: "critical", text: "NULL encryption: the record layer sends plaintext. Authentication may still happen, but anyone on the path reads everything." });
  }
  if (canonical.includes("EXPORT") || canonical.startsWith("EXP_") || canonical.startsWith("EXP")) {
    issues.push({ severity: "critical", text: "Export-grade suite with a deliberately crippled key. This is what FREAK and Logjam downgrade a connection to." });
  }
  if (auth === "none") {
    issues.push({ severity: "critical", text: "Anonymous key exchange: no certificate is verified, so any machine on the path can be the server." });
  }
  if (bulk === "RC4") {
    issues.push({ severity: "critical", text: "RC4 is prohibited in TLS by RFC 7465; its keystream biases leak plaintext from repeated requests." });
  }
  if (bulk === "DES") {
    issues.push({ severity: "critical", text: "Single DES has a 56-bit key and is brute-forceable." });
  }
  if (bulk === "3DES") {
    issues.push({ severity: "high", text: "3DES has a 64-bit block, so SWEET32 recovers plaintext from a long-lived connection. Effective security is about 112 bits at best." });
  }
  if (bulk === "RC2" || bulk === "IDEA" || bulk === "SEED") {
    issues.push({ severity: "medium", text: `${bulk} is an obsolete cipher that no current client needs.` });
  }
  if (mac === "MD5") {
    issues.push({ severity: "high", text: "MD5 as the record MAC. Collision resistance is long gone and it should not appear in any negotiated suite." });
  }
  if (!forwardSecrecy && bulk !== "none") {
    issues.push({
      severity: "high",
      text:
        kx === "RSA key transport"
          ? "No forward secrecy: the premaster secret is encrypted to the server's long-term RSA key, so anyone who later obtains that key decrypts recorded traffic. This is also the suite family ROBOT attacks."
          : "No forward secrecy: a static key-exchange key means recorded traffic stays decryptable once that key leaks.",
    });
  }
  if (!aead && mode === "CBC" && bulk !== "none") {
    issues.push({ severity: "medium", text: "CBC with a separate MAC rather than an AEAD. This is the construction behind Lucky13 and the padding-oracle family; prefer GCM or ChaCha20-Poly1305." });
  }
  if (mac === "SHA-1" && !aead && bulk !== "none") {
    issues.push({ severity: "low", text: "SHA-1 HMAC. HMAC-SHA1 is not itself broken, but it marks a pre-2013 suite with no AEAD replacement path." });
  }

  const worst = issues.reduce((acc, issue) => {
    const rank = SEVERITY_ORDER.indexOf(issue.severity);
    return rank !== -1 && rank < acc ? rank : acc;
  }, SEVERITY_ORDER.length);
  const worstSeverity = worst === SEVERITY_ORDER.length ? "good" : SEVERITY_ORDER[worst];

  let grade;
  if (worstSeverity === "critical") grade = "insecure";
  else if (worstSeverity === "high") grade = "weak";
  else if (worstSeverity === "medium") grade = "legacy";
  else if (worstSeverity === "low") grade = "acceptable";
  else grade = tls13 ? "modern" : "strong";

  return {
    name,
    tls13,
    keyExchange: kx,
    authentication: auth,
    cipher: bulk,
    keyBits: bits,
    mode,
    mac,
    aead,
    forwardSecrecy,
    issues,
    severity: worstSeverity,
    grade,
  };
}

/** Parse an OpenSSL date such as "Feb 10 23:59:59 2026 GMT" into epoch ms. */
export function parseOpensslDate(value) {
  const match = String(value).trim().match(/^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})\s+(\d{4})/);
  if (!match) return null;
  const month = MONTHS[match[1].toLowerCase()];
  if (month === undefined) return null;
  const day = Number(match[2]);
  const year = Number(match[6]);
  if (day < 1 || day > 31) return null;
  return Date.UTC(year, month, day, Number(match[3]), Number(match[4]), Number(match[5]));
}

/** Parse a YYYY-MM-DD reference date into epoch ms at 00:00 UTC. */
export function parseIsoDate(value) {
  const match = String(value || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return Date.UTC(year, month - 1, day);
}

const CIPHER_TOKEN = /\b(?:TLS13-|TLS_)?(?:ECDHE|EECDH|AECDH|ECDH|DHE|EDH|ADH|SRP|PSK|KRB5|RSA|AES|CAMELLIA|ARIA|SEED|IDEA|DES|RC4|RC2|NULL|EXP|CHACHA20)[A-Z0-9]*(?:[-_][A-Z0-9]+)+\b/g;

function collectCiphers(text) {
  const found = new Map();
  const matches = String(text).toUpperCase().match(CIPHER_TOKEN) || [];
  for (const token of matches) {
    if (found.has(token)) continue;
    const info = classifyCipher(token);
    if (info.error) continue;
    found.set(token, info);
  }
  return [...found.values()];
}

function pushProtocol(map, key, mode, evidence) {
  if (!key) return;
  const existing = map.get(key);
  if (existing) {
    if (!existing.modes.includes(mode)) existing.modes.push(mode);
    if (evidence && !existing.evidence.includes(evidence)) existing.evidence.push(evidence);
    return;
  }
  map.set(key, { key, ...PROTOCOLS[key], modes: [mode], evidence: evidence ? [evidence] : [] });
}

function grab(text, regex) {
  const match = String(text).match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Main entry point.
 * @param {string} text  pasted TLS output or config
 * @param {{ asOf?: string }} options  asOf is a YYYY-MM-DD reference date for expiry maths
 */
export function auditTls(text, options) {
  if (typeof text !== "string" || !text.trim()) {
    return { error: "Paste openssl s_client output, a certificate dump, an nmap cipher table or an nginx/Apache TLS block first." };
  }
  const asOfMs = parseIsoDate(options && options.asOf);
  const sources = [];
  if (/SSL-Session:|SSL handshake has read|CONNECTED\(/.test(text)) sources.push("openssl s_client transcript");
  if (/Signature Algorithm:|Not After\s*:/.test(text)) sources.push("certificate dump");
  if (/ssl_protocols|ssl_ciphers|ssl_prefer_server_ciphers/.test(text)) sources.push("nginx TLS block");
  if (/SSLProtocol|SSLCipherSuite|SSLHonorCipherOrder/.test(text)) sources.push("Apache TLS block");
  if (/ssl-enum-ciphers|least strength/.test(text)) sources.push("nmap ssl-enum-ciphers");

  const protocols = new Map();
  const findings = [];
  const addFinding = (severity, title, detail, evidence) =>
    findings.push({ id: `${findings.length}-${title}`, severity, title, detail, evidence: evidence || null });

  // --- negotiated protocol / cipher (openssl s_client) ---
  const negotiated = grab(text, /^\s*Protocol\s*:\s*(\S+)/m) || grab(text, /^New,\s*([^,]+),\s*Cipher is/m);
  if (negotiated) pushProtocol(protocols, normaliseProtocol(negotiated), "negotiated", `Protocol : ${negotiated}`);
  const negotiatedCipher = grab(text, /^\s*Cipher\s*:\s*(\S+)/m) || grab(text, /^New,\s*[^,]+,\s*Cipher is\s+(\S+)/m);

  // --- nmap section headers list every protocol the server offers ---
  const nmapProtocols = String(text).match(/^\s*\|?\s*(SSLv2|SSLv3|TLSv1\.[0-3]|TLSv1)\s*:/gm) || [];
  for (const line of nmapProtocols) {
    const token = line.replace(/[|:\s]/g, "");
    pushProtocol(protocols, normaliseProtocol(token), "offered", line.trim());
  }

  // --- nginx ssl_protocols ---
  const nginxProtocols = grab(text, /ssl_protocols\s+([^;]+);/);
  if (nginxProtocols) {
    for (const token of nginxProtocols.trim().split(/\s+/)) {
      pushProtocol(protocols, normaliseProtocol(token), "enabled in config", `ssl_protocols ${nginxProtocols.trim()};`);
    }
  }

  // --- Apache SSLProtocol ---
  const apacheProtocols = grab(text, /^\s*SSLProtocol\s+(.+)$/m);
  if (apacheProtocols) {
    let sawAll = false;
    for (const token of apacheProtocols.trim().split(/\s+/)) {
      if (/^[-+]?all$/i.test(token)) {
        sawAll = !token.startsWith("-");
        continue;
      }
      if (token.startsWith("-")) continue;
      pushProtocol(protocols, normaliseProtocol(token.replace(/^\+/, "")), "enabled in config", `SSLProtocol ${apacheProtocols.trim()}`);
    }
    if (sawAll) {
      addFinding(
        "medium",
        "SSLProtocol uses `all`",
        "`all` means every version the linked OpenSSL supports, so anything not explicitly subtracted stays on. List the versions you want instead: SSLProtocol -all +TLSv1.2 +TLSv1.3.",
        `SSLProtocol ${apacheProtocols.trim()}`,
      );
    }
  }

  for (const entry of protocols.values()) {
    if (entry.severity === "critical" || entry.severity === "high") {
      addFinding(entry.severity, `${entry.label} is ${entry.modes.join(" and ")}`, entry.note, entry.evidence[0] || null);
    }
  }
  const modern = [...protocols.values()].filter((p) => p.key === "TLSv1.2" || p.key === "TLSv1.3");
  if (protocols.size && modern.length === protocols.size) {
    addFinding("good", "Only current protocol versions present", `${modern.map((p) => p.label).join(" and ")} — no deprecated version appears in this text.`, null);
  }
  if (protocols.size && ![...protocols.values()].some((p) => p.key === "TLSv1.3")) {
    addFinding("low", "TLS 1.3 not seen", "Nothing in this text shows TLS 1.3 being offered. It removes static RSA key exchange, renegotiation and CBC entirely, and costs one round trip less.", null);
  }

  // --- ciphers ---
  const ciphers = collectCiphers(text);
  for (const cipher of ciphers) {
    const serious = cipher.issues.filter((issue) => issue.severity === "critical" || issue.severity === "high");
    if (serious.length) {
      addFinding(
        serious.some((issue) => issue.severity === "critical") ? "critical" : "high",
        `Cipher suite ${cipher.name} is ${cipher.grade}`,
        serious.map((issue) => issue.text).join(" "),
        cipher.name,
      );
    }
  }

  // --- OpenSSL cipher string (nginx ssl_ciphers / Apache SSLCipherSuite) ---
  const cipherString = grab(text, /ssl_ciphers\s+([^;]+);/) || grab(text, /^\s*SSLCipherSuite\s+(.+)$/m);
  let cipherStringTokens = null;
  if (cipherString) {
    const tokens = cipherString.trim().replace(/^['"]|['"]$/g, "").split(/[:,]/).filter(Boolean);
    const exclusions = tokens.filter((t) => t.startsWith("!")).map((t) => t.slice(1).toUpperCase());
    cipherStringTokens = { raw: cipherString.trim(), tokens, exclusions };
    const wanted = [
      ["ANULL", "critical", "anonymous suites (no certificate check at all)"],
      ["ENULL", "critical", "NULL-encryption suites"],
      ["EXPORT", "critical", "export-grade suites"],
      ["RC4", "high", "RC4"],
      ["3DES", "high", "3DES (SWEET32)"],
      ["MD5", "high", "MD5-MAC suites"],
    ];
    const missing = wanted.filter(([token]) => !exclusions.includes(token));
    const broad = tokens.some((t) => /^(ALL|DEFAULT|COMPLEMENTOFDEFAULT|MEDIUM|LOW)$/i.test(t));
    if (broad && missing.length) {
      addFinding(
        "high",
        "Cipher string is a broad group with gaps",
        `The list contains a wide keyword (${tokens.filter((t) => /^(ALL|DEFAULT|COMPLEMENTOFDEFAULT|MEDIUM|LOW)$/i.test(t)).join(", ")}) and does not exclude ${missing.map(([, , label]) => label).join(", ")}. Whatever those groups pull in from the local OpenSSL build is offered.`,
        cipherString.trim(),
      );
    } else if (missing.length && missing.length < wanted.length) {
      addFinding(
        "medium",
        "Cipher string exclusions are incomplete",
        `Not excluded: ${missing.map(([, , label]) => label).join(", ")}. Add !${missing.map(([token]) => (token === "ANULL" ? "aNULL" : token === "ENULL" ? "eNULL" : token)).join(":!")} unless the enumerated list already leaves them out.`,
        cipherString.trim(),
      );
    }
  }

  const preferServer = grab(text, /ssl_prefer_server_ciphers\s+(\w+)\s*;/) || grab(text, /^\s*SSLHonorCipherOrder\s+(\w+)/m);
  if (preferServer && /^(off|false)$/i.test(preferServer)) {
    addFinding("low", "Client chooses the cipher suite", "Server-side ordering is off, so a client picks from the offered list. With a TLS 1.2 list that still contains legacy suites, an old or hostile client can steer the connection to the weakest one you allow.", `prefer server ciphers: ${preferServer}`);
  }

  // --- handshake properties ---
  const tempKey = grab(text, /Server Temp Key:\s*(.+)/);
  if (tempKey) {
    const bits = Number((tempKey.match(/(\d+)\s*bits?/) || [])[1]);
    if (/^DH\b/i.test(tempKey) && Number.isFinite(bits) && bits < 2048) {
      addFinding("high", `Finite-field DH group is only ${bits} bits`, "Groups of 1024 bits and below are inside reach of a precomputation attack (Logjam). Use a 2048-bit or larger group, or move to ECDHE.", `Server Temp Key: ${tempKey}`);
    } else if (/ECDH/i.test(tempKey)) {
      addFinding("good", "Ephemeral ECDH key exchange in use", `${tempKey} — the session key is discarded after the connection, so recorded traffic stays unreadable if the certificate key later leaks.`, `Server Temp Key: ${tempKey}`);
    }
  }

  const compression = grab(text, /^\s*Compression:\s*(.+)$/m);
  if (compression && !/^none$/i.test(compression.trim())) {
    addFinding("high", "TLS compression enabled", `Compression: ${compression}. Compressing before encryption leaks secret data through ciphertext length — that is the CRIME attack.`, `Compression: ${compression}`);
  }

  if (/Secure Renegotiation IS NOT supported/i.test(text)) {
    addFinding("medium", "No RFC 5746 secure renegotiation", "The peer does not support the renegotiation_info extension, which is what stops an attacker prefixing their own plaintext to your session.", "Secure Renegotiation IS NOT supported");
  }

  const publicKeyBits = Number(grab(text, /Server public key is\s+(\d+)\s*bit/) || grab(text, /Public-Key:\s*\((\d+)\s*bit\)/) || "");
  const keyAlgorithm = grab(text, /Public Key Algorithm:\s*(\S+)/);
  if (Number.isFinite(publicKeyBits) && publicKeyBits > 0) {
    const ecc = /ec/i.test(keyAlgorithm || "") || publicKeyBits <= 521;
    if (!ecc && publicKeyBits < 2048) {
      addFinding("critical", `RSA key is only ${publicKeyBits} bits`, "Public CAs stopped issuing under 2048-bit RSA in 2013 and browsers reject these chains. 2048 bits is the floor, 3072 the conservative choice.", `Server public key is ${publicKeyBits} bit`);
    } else if (ecc && publicKeyBits < 256) {
      addFinding("high", `Elliptic-curve key is only ${publicKeyBits} bits`, "Curves below P-256 do not meet the 128-bit security target expected of a TLS certificate today.", `Public key: ${publicKeyBits} bit`);
    }
  }

  const sigAlg = grab(text, /Signature Algorithm:\s*(\S+)/);
  if (sigAlg) {
    if (/md5/i.test(sigAlg)) {
      addFinding("critical", "Certificate signed with MD5", `Signature Algorithm: ${sigAlg}. MD5 collisions have been practical since 2008 and were used to forge a real CA certificate.`, sigAlg);
    } else if (/sha1|-sha1/i.test(sigAlg)) {
      addFinding("high", "Certificate signed with SHA-1", `Signature Algorithm: ${sigAlg}. Browsers stopped trusting SHA-1 chains in 2017 after the SHAttered collision.`, sigAlg);
    }
  }

  // --- certificate ---
  const notBeforeRaw = grab(text, /Not Before\s*:\s*(.+)/);
  const notAfterRaw = grab(text, /Not After\s*:\s*(.+)/);
  const notBefore = notBeforeRaw ? parseOpensslDate(notBeforeRaw) : null;
  const notAfter = notAfterRaw ? parseOpensslDate(notAfterRaw) : null;
  const sans = [...new Set((String(text).match(/DNS:([A-Za-z0-9*._-]+)/g) || []).map((s) => s.slice(4)))];
  const certificate = {
    subject: grab(text, /^\s*(?:subject=|Subject:)\s*(.+)$/m),
    issuer: grab(text, /^\s*(?:issuer=|Issuer:)\s*(.+)$/m),
    commonName: grab(text, /CN\s*=\s*([^,\n/]+)/),
    signatureAlgorithm: sigAlg,
    keyAlgorithm,
    keyBits: Number.isFinite(publicKeyBits) && publicKeyBits > 0 ? publicKeyBits : null,
    notBeforeRaw,
    notAfterRaw,
    sans,
    lifetimeDays: notBefore !== null && notAfter !== null ? Math.floor((notAfter - notBefore) / 86400000) : null,
    daysRemaining: null,
    expired: null,
    notYetValid: null,
  };

  if (notAfter !== null && asOfMs !== null) {
    certificate.daysRemaining = Math.trunc((notAfter - asOfMs) / 86400000);
    certificate.expired = certificate.daysRemaining < 0;
    if (certificate.expired) {
      addFinding("critical", "Certificate has expired", `Not After ${notAfterRaw} is ${Math.abs(certificate.daysRemaining)} day(s) before the reference date. Every browser will refuse the connection.`, `Not After : ${notAfterRaw}`);
    } else if (certificate.daysRemaining <= 14) {
      addFinding("high", `Certificate expires in ${certificate.daysRemaining} day(s)`, `Not After ${notAfterRaw}. Renewal automation should already have fired.`, `Not After : ${notAfterRaw}`);
    } else if (certificate.daysRemaining <= 30) {
      addFinding("medium", `Certificate expires in ${certificate.daysRemaining} day(s)`, `Not After ${notAfterRaw}. Inside the usual renewal window.`, `Not After : ${notAfterRaw}`);
    }
  }
  if (notBefore !== null && asOfMs !== null && notBefore > asOfMs) {
    certificate.notYetValid = true;
    addFinding("critical", "Certificate is not valid yet", `Not Before ${notBeforeRaw} is after the reference date, so clients reject it as premature. Check the issuing system's clock.`, `Not Before: ${notBeforeRaw}`);
  }
  if (certificate.lifetimeDays !== null && certificate.lifetimeDays > 398) {
    addFinding("medium", `Certificate lifetime is ${certificate.lifetimeDays} days`, "Public TLS certificates issued since September 2020 may not exceed 398 days; browsers reject longer public chains. A longer span means either a private CA or a certificate no public client will accept.", `${notBeforeRaw} → ${notAfterRaw}`);
  }

  // --- chain verification ---
  const verifyCodeMatch = String(text).match(/Verify return code:\s*(\d+)\s*\(([^)]*)\)/);
  const verifyErrors = [...String(text).matchAll(/verify error:num=(\d+):([^\n]+)/g)].map((m) => ({ code: Number(m[1]), text: m[2].trim() }));
  const chain = {
    verifyCode: verifyCodeMatch ? Number(verifyCodeMatch[1]) : null,
    verifyText: verifyCodeMatch ? verifyCodeMatch[2].trim() : null,
    errors: verifyErrors,
  };
  if (chain.verifyCode !== null && chain.verifyCode !== 0) {
    const selfSigned = chain.verifyCode === 18 || chain.verifyCode === 19;
    addFinding(
      selfSigned ? "high" : "medium",
      `Chain verification failed (code ${chain.verifyCode})`,
      `${chain.verifyText}. ${selfSigned ? "A self-signed certificate is only usable where you have distributed the certificate to clients yourself." : "Most often the server is not sending its intermediate certificate, so it validates in a browser that has cached the intermediate and fails everywhere else."}`,
      `Verify return code: ${chain.verifyCode} (${chain.verifyText})`,
    );
  } else if (chain.verifyCode === 0) {
    addFinding("good", "Chain verified against the local trust store", "Verify return code: 0 (ok) — openssl built a complete path from the presented chain to a trusted root.", "Verify return code: 0 (ok)");
  }

  const ocsp = grab(text, /OCSP response:\s*(.+)/);
  if (ocsp && /no response sent/i.test(ocsp)) {
    addFinding("low", "No OCSP stapling", "The server sends no stapled revocation proof, so each client that checks revocation has to contact the CA itself — slower, and a privacy leak of who visits your site.", `OCSP response: ${ocsp}`);
  }

  if (!protocols.size && !ciphers.length && !certificate.notAfterRaw && !cipherStringTokens) {
    return {
      error:
        "Nothing recognisable found. This reads openssl s_client transcripts, `openssl x509 -text` certificate dumps, nmap ssl-enum-ciphers tables and nginx/Apache TLS blocks — paste one of those.",
    };
  }

  findings.sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0, good: 0 };
  for (const finding of findings) counts[finding.severity] += 1;

  return {
    sources,
    asOf: options && options.asOf ? options.asOf : null,
    protocols: [...protocols.values()],
    negotiatedCipher,
    ciphers,
    cipherString: cipherStringTokens,
    certificate,
    chain,
    findings,
    counts,
  };
}

/** Plain-text report for the copy button. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = ["TLS CONFIGURATION AUDIT"];
  if (result.sources.length) lines.push(`Input recognised as: ${result.sources.join(", ")}`);
  if (result.asOf) lines.push(`Reference date for expiry: ${result.asOf}`);
  lines.push("");
  lines.push("PROTOCOL VERSIONS");
  if (result.protocols.length) {
    for (const protocol of result.protocols) {
      lines.push(`  ${protocol.label} (${protocol.modes.join(", ")}) — ${protocol.severity}`);
    }
  } else {
    lines.push("  none stated in the pasted text");
  }
  lines.push("");
  lines.push("CIPHER SUITES");
  if (result.ciphers.length) {
    for (const cipher of result.ciphers) {
      lines.push(`  ${cipher.name} — ${cipher.grade}`);
      lines.push(`      kx ${cipher.keyExchange} · auth ${cipher.authentication} · ${cipher.cipher}${cipher.keyBits ? `-${cipher.keyBits}` : ""}${cipher.mode ? `/${cipher.mode}` : ""} · mac ${cipher.mac || "n/a"}`);
      for (const issue of cipher.issues) lines.push(`      [${issue.severity}] ${issue.text}`);
    }
  } else {
    lines.push("  none stated in the pasted text");
  }
  if (result.certificate.notAfterRaw) {
    lines.push("");
    lines.push("CERTIFICATE");
    if (result.certificate.subject) lines.push(`  subject ${result.certificate.subject}`);
    if (result.certificate.issuer) lines.push(`  issuer  ${result.certificate.issuer}`);
    lines.push(`  valid   ${result.certificate.notBeforeRaw || "?"} → ${result.certificate.notAfterRaw}`);
    if (result.certificate.daysRemaining !== null) lines.push(`  ${result.certificate.daysRemaining} day(s) remaining at the reference date`);
    if (result.certificate.sans.length) lines.push(`  SANs    ${result.certificate.sans.join(", ")}`);
  }
  lines.push("");
  lines.push("FINDINGS");
  for (const finding of result.findings) {
    lines.push(`  [${finding.severity.toUpperCase()}] ${finding.title}`);
    lines.push(`      ${finding.detail}`);
  }
  lines.push("");
  lines.push("Parsed locally from pasted text. No handshake was performed, so anything absent from the paste is simply unknown here.");
  return lines.join("\n");
}

export const SAMPLE_OPENSSL = `CONNECTED(00000003)
depth=0 CN = legacy.example.com
verify error:num=20:unable to get local issuer certificate
---
Server certificate
subject=CN = legacy.example.com
issuer=C = US, O = Example CA, CN = Example Intermediate CA
---
Server Temp Key: DH, 1024 bits
---
New, TLSv1.0, Cipher is DES-CBC3-SHA
Server public key is 1024 bit
Secure Renegotiation IS NOT supported
Compression: zlib compression
OCSP response: no response sent
SSL-Session:
    Protocol  : TLSv1.0
    Cipher    : DES-CBC3-SHA
    Verify return code: 20 (unable to get local issuer certificate)
---
Certificate:
    Data:
        Version: 3 (0x2)
        Signature Algorithm: sha1WithRSAEncryption
        Issuer: C = US, O = Example CA, CN = Example Intermediate CA
        Validity
            Not Before: Nov 12 00:00:00 2025 GMT
            Not After : Feb 10 23:59:59 2026 GMT
        Subject: CN = legacy.example.com
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (1024 bit)
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:legacy.example.com, DNS:www.legacy.example.com`;

export const SAMPLE_NGINX = `server {
    listen 443 ssl http2;
    server_name shop.example.com;

    ssl_certificate     /etc/ssl/shop.crt;
    ssl_certificate_key /etc/ssl/shop.key;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers HIGH:MEDIUM:!aNULL;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
}`;
