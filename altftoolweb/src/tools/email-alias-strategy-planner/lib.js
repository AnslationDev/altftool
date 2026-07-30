/**
 * Email alias strategy planner.
 *
 * Picks an aliasing strategy from your real constraints, then generates the
 * actual per-service addresses and validates them against the RFC limits that
 * mail servers enforce. Pure functions; no mail is sent and nothing is stored.
 */

/** RFC 5321 section 4.5.3.1.1: the local part is limited to 64 octets. */
export const MAX_LOCAL_PART = 64;

/** RFC 5321 section 4.5.3.1.2: a domain is limited to 255 octets. */
export const MAX_DOMAIN = 255;

/**
 * RFC 5321 caps a reverse-path at 256 octets including the angle brackets,
 * which leaves 254 characters for the address itself (RFC 3696 erratum 1690).
 */
export const MAX_ADDRESS = 254;

/**
 * RFC 5322 dot-atom characters allowed in an unquoted local part.
 * Kept as a character class so alias generation can validate against it.
 */
export const LOCAL_PART_ATOM = /^[A-Za-z0-9!#$%&'*+\-/=?^_`{|}~]+(\.[A-Za-z0-9!#$%&'*+\-/=?^_`{|}~]+)*$/;

/**
 * Provider support for RFC 5233 subaddressing ("plus tagging") and for the
 * other per-provider tricks. Reflects each provider's documented behaviour.
 */
export const PROVIDERS = {
  gmail: {
    id: "gmail",
    label: "Gmail / Google Workspace",
    plusTagging: true,
    dotTrick: true,
    subdomain: false,
    note: "Supports user+tag@ and also ignores every dot in the local part, so first.last@ and firstlast@ are the same mailbox.",
  },
  icloud: {
    id: "icloud",
    label: "iCloud Mail",
    plusTagging: true,
    dotTrick: false,
    subdomain: false,
    note: "Supports plus tagging, and an iCloud+ subscription adds Hide My Email, which issues real throwaway addresses that forward to you.",
  },
  outlook: {
    id: "outlook",
    label: "Outlook.com / Hotmail",
    plusTagging: true,
    dotTrick: false,
    subdomain: false,
    note: "Supports plus tagging and also lets you create a small number of true account aliases you can sign in with.",
  },
  proton: {
    id: "proton",
    label: "Proton Mail",
    plusTagging: true,
    dotTrick: false,
    subdomain: false,
    note: "Supports plus tagging on every plan; paid plans add SimpleLogin-backed aliases that hide the real mailbox entirely.",
  },
  fastmail: {
    id: "fastmail",
    label: "Fastmail",
    plusTagging: true,
    dotTrick: false,
    subdomain: true,
    note: "Supports plus tagging plus subdomain addressing (anything@tag.you.fastmail.com), which sidesteps forms that reject a plus sign.",
  },
  yahoo: {
    id: "yahoo",
    label: "Yahoo Mail",
    plusTagging: false,
    dotTrick: false,
    subdomain: false,
    note: "Does not honour plus tagging. Yahoo's own disposable-address feature is the equivalent, but it must be enabled in settings first.",
  },
  custom: {
    id: "custom",
    label: "My own domain",
    plusTagging: true,
    dotTrick: false,
    subdomain: true,
    note: "A catch-all on your own domain gives unlimited aliases you fully control, at the cost of the domain renewal and some catch-all spam.",
  },
  other: {
    id: "other",
    label: "Something else",
    plusTagging: false,
    dotTrick: false,
    subdomain: false,
    note: "Assume no provider tricks are available; a forwarding alias service is the portable answer.",
  },
};

/** What you might need an alias scheme to do. Weights total 100. */
export const REQUIREMENTS = [
  {
    id: "hideRealAddress",
    label: "The site must never learn my real address",
    weight: 30,
  },
  {
    id: "revocable",
    label: "I want to switch an alias off after a leak",
    weight: 25,
  },
  { id: "canReply", label: "I need to reply from the alias", weight: 15 },
  {
    id: "worksEverywhere",
    label: "It must survive forms that reject unusual characters",
    weight: 15,
  },
  { id: "free", label: "It has to cost nothing", weight: 15 },
];

/**
 * The five workable strategies. Capability flags are factual, not opinions:
 * "strippable" means an ordinary regex on the sender's side can recover your
 * real mailbox from the alias.
 */
export const STRATEGIES = [
  {
    id: "relay",
    name: "Forwarding alias service",
    pattern: "random-word.1234@aliasprovider.example",
    hideRealAddress: true,
    revocable: true,
    canReply: true,
    worksEverywhere: true,
    free: true,
    strippable: false,
    generated: false,
    summary:
      "A relay issues a unique address per service and forwards to your real mailbox. Turning one off stops delivery instantly and the sender never sees the real address.",
    detail:
      "Apple Hide My Email, DuckDuckGo Email Protection, Firefox Relay, SimpleLogin and addy.io all work this way. Free tiers exist; the paid tiers add unlimited aliases and reply-from support.",
    tradeoff:
      "You are trusting one more company with the contents of every forwarded mail, and if the relay shuts down you have to migrate every account.",
  },
  {
    id: "catchall",
    name: "Catch-all on your own domain",
    pattern: "service@yourdomain.example",
    hideRealAddress: false,
    revocable: true,
    canReply: true,
    worksEverywhere: true,
    free: false,
    strippable: false,
    generated: true,
    summary:
      "Every address at a domain you own lands in one mailbox. You invent an address per service on the spot and block it the moment it leaks.",
    detail:
      "Strongest attribution: a leaked address names the service that leaked it and cannot be normalised back to a shared mailbox.",
    tradeoff:
      "Costs a domain renewal, ties every alias to one domain you own, and a catch-all attracts dictionary spam — pair it with per-address allowlisting once you settle in.",
  },
  {
    id: "subdomain",
    name: "Subdomain addressing",
    pattern: "anything@service.you.example",
    hideRealAddress: false,
    revocable: true,
    canReply: true,
    worksEverywhere: false,
    free: false,
    strippable: false,
    generated: true,
    summary:
      "The tag lives in the domain instead of the local part, so it survives forms that reject a plus sign while still identifying the service.",
    detail:
      "Fastmail offers this on its own domains, and any custom domain with a wildcard MX record can do it.",
    tradeoff:
      "A minority of validators reject multi-label domains they do not recognise, and it needs a paid host or your own DNS.",
  },
  {
    id: "plus",
    name: "Plus tagging (subaddressing)",
    pattern: "you+service@provider.example",
    hideRealAddress: false,
    revocable: false,
    canReply: true,
    worksEverywhere: false,
    free: true,
    strippable: true,
    generated: true,
    summary:
      "RFC 5233 subaddressing: anything after the plus sign is a label your provider ignores when routing, so you can filter on it.",
    detail:
      "Free, instant, and supported by Gmail, iCloud, Outlook.com, Proton and Fastmail. Good enough to identify which service leaked your address.",
    tradeoff:
      "Anyone can delete the +tag to recover your real address, and a meaningful minority of signup forms reject the plus character outright.",
  },
  {
    id: "dots",
    name: "Gmail dot variations",
    pattern: "y.ou.service@gmail.example",
    hideRealAddress: false,
    revocable: false,
    canReply: true,
    worksEverywhere: true,
    free: true,
    strippable: true,
    generated: true,
    summary:
      "Gmail ignores dots in the local part, so every dot placement is the same mailbox and can be filtered separately.",
    detail:
      "Useful only as a fallback when a form rejects the plus sign, because dots are accepted by every validator.",
    tradeoff:
      "Gmail-only, trivially normalised by removing the dots, and a local part of n characters yields only 2^(n-1) distinct variants.",
  },
];

/** Naming schemes for the tag portion of a generated alias. */
export const TAG_SCHEMES = {
  service: {
    id: "service",
    label: "Service name",
    note: "Readable and instantly attributable, but guessable — someone who knows one alias can guess the rest.",
  },
  serviceYear: {
    id: "serviceYear",
    label: "Service name + year",
    note: "Adds the year you signed up, which tells you how old a leaked address is.",
  },
  serviceCode: {
    id: "serviceCode",
    label: "Service name + short code",
    note: "Appends a deterministic code derived from the service name and your secret word, so aliases cannot be guessed from one another.",
  },
};

/** Length of the deterministic suffix in serviceCode mode. */
export const CODE_LENGTH = 6;

/** FNV-1a 32-bit offset basis and prime — a standard non-cryptographic hash. */
const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/**
 * FNV-1a 32-bit. Deterministic and dependency-free. Not a security primitive:
 * it only makes aliases non-obvious to a human, it does not resist an attacker.
 */
export function fnv1a32(text) {
  let hash = FNV_OFFSET_BASIS;
  const input = String(text ?? "");
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return hash >>> 0;
}

/** Short lowercase base-36 code derived from the service name and your salt. */
export function shortCode(service, salt) {
  const raw = fnv1a32(`${String(salt ?? "")}:${String(service ?? "").toLowerCase()}`);
  return raw.toString(36).padStart(CODE_LENGTH, "0").slice(-CODE_LENGTH);
}

/** Reduce a service name to a safe alias tag: lowercase letters, digits, hyphen. */
export function slugifyService(name) {
  return String(name ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

/** Split an address once on the final "@". Returns null when malformed. */
export function splitAddress(address) {
  const value = String(address ?? "").trim();
  const at = value.lastIndexOf("@");
  if (at < 1 || at === value.length - 1) return null;
  return { local: value.slice(0, at), domain: value.slice(at + 1) };
}

/**
 * Validate an address against the length and dot-atom rules servers enforce.
 * Returns a list of plain-language problems; empty means it is well formed.
 */
export function validateAddress(address) {
  const problems = [];
  const parts = splitAddress(address);
  if (!parts) {
    problems.push("Not a valid address — it needs exactly one @ with text on both sides.");
    return problems;
  }
  if (parts.local.length > MAX_LOCAL_PART) {
    problems.push(`Local part is ${parts.local.length} characters; the limit is ${MAX_LOCAL_PART}.`);
  }
  if (parts.domain.length > MAX_DOMAIN) {
    problems.push(`Domain is ${parts.domain.length} characters; the limit is ${MAX_DOMAIN}.`);
  }
  if (address.length > MAX_ADDRESS) {
    problems.push(`Whole address is ${address.length} characters; the limit is ${MAX_ADDRESS}.`);
  }
  if (!LOCAL_PART_ATOM.test(parts.local)) {
    problems.push("Local part uses a character that needs quoting, or has a leading, trailing or doubled dot.");
  }
  if (!/^[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(parts.domain)) {
    problems.push("Domain must be dot-separated labels of letters, digits and hyphens, with at least one dot.");
  }
  return problems;
}

/**
 * Number of distinct Gmail dot variants for a local part of n characters:
 * a dot may sit in any of the n-1 internal gaps, so 2^(n-1) placements exist.
 */
export function dotVariantCapacity(localPart) {
  const clean = String(localPart ?? "").replace(/\./g, "");
  if (clean.length < 2) return 1;
  const gaps = clean.length - 1;
  // Cap the exponent so the number stays a safe integer for display.
  return gaps >= 53 ? Number.MAX_SAFE_INTEGER : 2 ** gaps;
}

/** The index-th dot variant, using the bits of index to choose gap positions. */
export function dotVariant(localPart, index) {
  const clean = String(localPart ?? "").replace(/\./g, "");
  let out = clean[0] || "";
  for (let gap = 0; gap < clean.length - 1; gap += 1) {
    if ((Math.floor(index / 2 ** gap) & 1) === 1) out += ".";
    out += clean[gap + 1];
  }
  return out;
}

function buildTag(service, scheme, salt, year) {
  const base = slugifyService(service);
  if (!base) return "";
  if (scheme === "serviceYear") return `${base}-${year}`;
  if (scheme === "serviceCode") return `${base}-${shortCode(service, salt)}`;
  return base;
}

/**
 * Score and rank strategies against the requirements you ticked.
 * The score is the share of the weight you asked for that a strategy delivers,
 * so it is 100 when a strategy satisfies every requirement you selected.
 */
export function rankStrategies(requirements = {}, providerId = "other") {
  const provider = PROVIDERS[providerId] || PROVIDERS.other;
  const wanted = REQUIREMENTS.filter((req) => requirements[req.id]);
  const wantedWeight = wanted.reduce((sum, req) => sum + req.weight, 0);

  return STRATEGIES.map((strategy) => {
    let available = true;
    let unavailableReason = "";
    if (strategy.id === "plus" && !provider.plusTagging) {
      available = false;
      unavailableReason = `${provider.label} does not honour plus tagging.`;
    }
    if (strategy.id === "dots" && !provider.dotTrick) {
      available = false;
      unavailableReason = "Only Gmail and Google Workspace ignore dots in the local part.";
    }
    if (strategy.id === "subdomain" && !provider.subdomain) {
      available = false;
      unavailableReason = `${provider.label} does not offer subdomain addressing; you would need your own domain.`;
    }
    if (strategy.id === "catchall" && providerId !== "custom") {
      available = false;
      unavailableReason = "Needs a domain you own and control the DNS for.";
    }

    const met = wanted.filter((req) => strategy[req.id]);
    const missed = wanted.filter((req) => !strategy[req.id]);
    const earned = met.reduce((sum, req) => sum + req.weight, 0);
    const fit = wantedWeight > 0 ? Math.round((earned / wantedWeight) * 100) : 0;

    return {
      ...strategy,
      available,
      unavailableReason,
      met,
      missed,
      fit,
      // Zero requirements means "fit" carries no information; the caller shows a dash.
      requirementsSelected: wanted.length,
    };
  })
    .sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return b.fit - a.fit;
    })
    .map((strategy, index) => ({ ...strategy, rank: index + 1 }));
}

/**
 * Generate the actual aliases.
 *
 * @param {{baseAddress:string, strategyId:string, services:string[], scheme:string, salt:string, year:number, aliasDomain:string}} input
 */
export function buildAliasPlan(input = {}) {
  const baseAddress = String(input.baseAddress ?? "").trim().toLowerCase();
  const strategy = STRATEGIES.find((item) => item.id === input.strategyId);
  const scheme = TAG_SCHEMES[input.scheme] ? input.scheme : "service";
  const salt = String(input.salt ?? "").trim();
  const year = Number.isFinite(Number(input.year)) ? Math.trunc(Number(input.year)) : 0;

  const services = (Array.isArray(input.services) ? input.services : String(input.services ?? "").split(/[\n,]/))
    .map((item) => String(item).trim())
    .filter(Boolean);

  if (!strategy) return { error: "Pick an alias strategy first." };
  if (!strategy.generated) {
    return {
      error:
        "A forwarding alias service creates the addresses for you, so there is nothing to generate here — use the naming convention below for the alias labels instead.",
      strategy,
    };
  }
  if (!baseAddress) return { error: "Enter the mailbox these aliases should land in." };

  const baseProblems = validateAddress(baseAddress);
  if (baseProblems.length > 0) return { error: baseProblems[0] };

  const { local, domain } = splitAddress(baseAddress);

  if (services.length === 0) {
    return { error: "List at least one service, one per line." };
  }
  if (scheme === "serviceCode" && !salt) {
    return { error: "The short-code scheme needs a secret word so the codes cannot be guessed." };
  }

  const aliasDomain = String(input.aliasDomain ?? "").trim().toLowerCase() || domain;

  if (strategy.id === "dots") {
    const capacity = dotVariantCapacity(local);
    if (services.length > capacity) {
      return {
        error: `A ${local.replace(/\./g, "").length}-character local part has only ${capacity} distinct dot placements, but you listed ${services.length} services. Use plus tagging or a catch-all instead.`,
      };
    }
  }

  const seen = new Set();
  const aliases = services.map((service, index) => {
    const tag = buildTag(service, scheme, salt, year);
    let address = "";
    let howToFilter = "";

    if (strategy.id === "plus") {
      address = `${local}+${tag}@${domain}`;
      howToFilter = `Filter on "to:${local}+${tag}@${domain}".`;
    } else if (strategy.id === "catchall") {
      address = `${tag}@${aliasDomain}`;
      howToFilter = `Filter on the recipient address, and block ${tag}@${aliasDomain} at the server the day it leaks.`;
    } else if (strategy.id === "subdomain") {
      address = `you@${tag}.${aliasDomain}`;
      howToFilter = `Filter on the subdomain ${tag}.${aliasDomain}; a wildcard MX record routes it all to one mailbox.`;
    } else if (strategy.id === "dots") {
      address = `${dotVariant(local, index)}@${domain}`;
      howToFilter = "Gmail delivers every dot variant to the same inbox; filter on the exact recipient string.";
    }

    const problems = validateAddress(address);
    const duplicate = seen.has(address);
    seen.add(address);
    if (duplicate) problems.push("Duplicate of an earlier alias — two services would share one address.");

    return { service, tag, address, howToFilter, problems, valid: problems.length === 0 };
  });

  const invalidCount = aliases.filter((item) => !item.valid).length;
  const longest = aliases.reduce((max, item) => Math.max(max, item.address.length), 0);

  return {
    strategy,
    scheme: TAG_SCHEMES[scheme],
    aliases,
    invalidCount,
    longest,
    headroom: MAX_ADDRESS - longest,
    baseAddress,
  };
}

/** Plain-text export of a generated alias plan. */
export function formatAliasPlan(result) {
  if (!result || result.error || !result.aliases) return "";
  const lines = [
    `Email alias plan — ${result.strategy.name}`,
    `Delivers to: ${result.baseAddress}`,
    `Naming scheme: ${result.scheme.label}`,
    "",
    ...result.aliases.map((item) => `${item.service}: ${item.address}${item.valid ? "" : "  [check this one]"}`),
  ];
  return lines.join("\n");
}
