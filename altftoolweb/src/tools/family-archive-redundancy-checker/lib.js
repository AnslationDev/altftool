/**
 * Family photo archive redundancy checker — independence and 3-2-1-1-0 evaluation.
 *
 * The rules applied here are established backup practice, not invented:
 *
 *  - The 3-2-1 rule (Peter Krogh, "The DAM Book", adopted by US-CERT / CISA data-backup
 *    guidance): keep 3 copies of the data, on 2 different storage media, with 1 copy off site.
 *  - The 3-2-1-1-0 extension (Veeam and most modern backup vendors): add 1 copy that is
 *    offline, air-gapped or immutable, and require 0 errors — i.e. the copy has been
 *    restore-tested, not merely assumed to exist.
 *  - "Sync is not backup": a folder that mirrors your device (iCloud Photos, Google Photos
 *    auto-backup, Dropbox, OneDrive) propagates deletions and encryptions. It protects
 *    against a lost phone, not against an accidental delete, a bad import or ransomware.
 *  - Correlated failure: two copies that share a site, a provider or a single sign-in
 *    account fail together. Counting them as two copies overstates redundancy, so this
 *    module counts distinct FAILURE DOMAINS, not raw copies.
 *  - Silent corruption ("bit rot") is not detected by the filesystem on its own, which is
 *    why checksum verification (hashes, par2, ZFS/Btrfs scrub) is scored separately.
 *
 * Pure module: no React, no DOM, no clocks. Ages are passed in as arguments.
 */

/** The rule targets. */
export const RULE_TOTAL_COPIES = 3;
export const RULE_MEDIA_TYPES = 2;
export const RULE_OFFSITE_COPIES = 1;
export const RULE_OFFLINE_COPIES = 1;

/** The headline rule this tool exists to test: two copies that cannot fail together. */
export const REQUIRED_INDEPENDENT_DOMAINS = 2;

/** Copies that count as "checked" must have been opened and read back recently. */
export const VERIFY_INTERVAL_MONTHS = 12;
export const REQUIRED_VERIFIED_COPIES = 2;

/**
 * Places a family archive typically lives.
 *
 *  media   – storage class, for the "2 different media" test.
 *  site    – physical location, for the off-site test.
 *  domain  – failure domain. Two entries sharing a domain fail together (same house,
 *            same sign-in account, same sync graph) and count once.
 *  syncs   – true when deletions propagate to this copy, so it is not delete-proof.
 *  offline – true when the copy is normally disconnected (air-gapped / immutable).
 */
export const STORAGE_LOCATIONS = [
  {
    id: "phone",
    group: "Everyday devices",
    label: "Phone or tablet camera roll",
    media: "flash",
    site: "with-you",
    domain: "personal-device",
    syncs: true,
    offline: false,
    note: "The working copy, not a backup — it travels with you and gets dropped, stolen or wiped.",
  },
  {
    id: "laptop",
    group: "Everyday devices",
    label: "Laptop or desktop photo library",
    media: "ssd",
    site: "home",
    domain: "home-primary",
    syncs: false,
    offline: false,
    note: "Counts as a copy only if the files are actually downloaded, not placeholders streamed from the cloud.",
  },
  {
    id: "phone-cloud-sync",
    group: "Sync services",
    label: "Auto-sync to iCloud Photos / Google Photos / OneDrive",
    media: "cloud",
    site: "cloud",
    domain: "personal-device",
    syncs: true,
    offline: false,
    note: "Shares a failure domain with the phone: delete there and it disappears here too.",
  },
  {
    id: "cloud-archive",
    group: "Sync services",
    label: "Separate cloud archive, uploaded manually (different provider and account)",
    media: "cloud",
    site: "cloud",
    domain: "cloud-archive",
    syncs: false,
    offline: false,
    note: "An independent domain only if it uses a different provider and a different sign-in.",
  },
  {
    id: "backup-service",
    group: "Sync services",
    label: "Versioned backup service with deleted-file retention (Backblaze, Time Machine to cloud, etc.)",
    media: "cloud",
    site: "cloud",
    domain: "backup-service",
    syncs: false,
    offline: false,
    note: "Version history is what makes this survive an accidental delete or ransomware.",
  },
  {
    id: "external-drive-home",
    group: "Drives at home",
    label: "External hard drive kept at home",
    media: "hdd",
    site: "home",
    domain: "home-primary",
    syncs: false,
    offline: true,
    note: "Shares the house with your laptop: one fire, flood or burglary takes both.",
  },
  {
    id: "nas",
    group: "Drives at home",
    label: "Home NAS or second computer",
    media: "hdd",
    site: "home",
    domain: "home-secondary",
    syncs: false,
    offline: false,
    note: "RAID protects against a dead disk, not against deletion, theft or a power surge.",
  },
  {
    id: "drive-offsite",
    group: "Off-site copies",
    label: "Drive stored at a relative's house, office or bank locker",
    media: "hdd",
    site: "offsite",
    domain: "offsite-drive",
    syncs: false,
    offline: true,
    note: "The classic off-site copy. Its weakness is staleness — it is only as fresh as your last swap.",
  },
  {
    id: "optical",
    group: "Off-site copies",
    label: "Archival optical discs (M-DISC / BD-R) or LTO tape",
    media: "optical",
    site: "offsite",
    domain: "offsite-media",
    syncs: false,
    offline: true,
    note: "Write-once media cannot be silently rewritten, which is exactly what you want for an archive.",
  },
  {
    id: "prints",
    group: "Off-site copies",
    label: "Printed photo books or albums held by family",
    media: "print",
    site: "offsite",
    domain: "print",
    syncs: false,
    offline: true,
    note: "A partial copy at best, but the only one that survives every digital failure at once.",
  },
];

/** Habits that turn a pile of copies into an archive you can actually recover. */
export const PRACTICES = [
  {
    id: "restore-test",
    label: `Opened files from a backup copy and confirmed they still display, within the last ${VERIFY_INTERVAL_MONTHS} months`,
    weight: 5,
  },
  {
    id: "inventory",
    label: "Written inventory: what is archived, where each copy lives, and how to unlock it",
    weight: 3,
  },
  {
    id: "checksums",
    label: "Checksums or a scrubbing filesystem in use, so silent corruption is detected",
    weight: 3,
  },
  {
    id: "schedule",
    label: "A fixed refresh date for the off-site copy (calendar reminder, not good intentions)",
    weight: 4,
  },
  {
    id: "encrypted-offsite",
    label: "Off-site drives and cloud archives are encrypted, with the key stored separately",
    weight: 3,
  },
  {
    id: "successor",
    label: "One other adult knows the archive exists and can get into it without you",
    weight: 4,
  },
  {
    id: "media-age",
    label: "No copy relies on a drive older than about five years, or on a format you cannot read today",
    weight: 3,
  },
  {
    id: "recovery-contact",
    label: "Cloud accounts holding a copy have recovery contacts and 2FA backup codes saved offline",
    weight: 3,
  },
];

/** Structural requirements, scored alongside the practices above. */
export const REQUIREMENTS = [
  { id: "independent", label: `At least ${REQUIRED_INDEPENDENT_DOMAINS} independent copies that cannot fail together`, weight: 8 },
  { id: "copies", label: `At least ${RULE_TOTAL_COPIES} copies in total`, weight: 4 },
  { id: "media", label: `At least ${RULE_MEDIA_TYPES} different storage media`, weight: 4 },
  { id: "offsite", label: `At least ${RULE_OFFSITE_COPIES} copy away from the house`, weight: 6 },
  { id: "deleteproof", label: "At least 1 copy that an accidental delete cannot reach", weight: 6 },
  { id: "offline", label: `At least ${RULE_OFFLINE_COPIES} offline or write-once copy`, weight: 4 },
  { id: "verified", label: `At least ${REQUIRED_VERIFIED_COPIES} copies checked in the last ${VERIFY_INTERVAL_MONTHS} months`, weight: 5 },
];

/** Readiness bands, lower bound inclusive. */
export const BANDS = [
  { id: "fragile", min: 0, label: "Fragile — one bad day from losing it", tone: "danger" },
  { id: "partial", min: 40, label: "Partly protected", tone: "warning" },
  { id: "solid", min: 70, label: "Solid — meets the 3-2-1 rule", tone: "success" },
  { id: "resilient", min: 90, label: "Resilient — 3-2-1-1-0 in place", tone: "success" },
];

const TOTAL_WEIGHT =
  REQUIREMENTS.reduce((sum, item) => sum + item.weight, 0) +
  PRACTICES.reduce((sum, item) => sum + item.weight, 0);

export { TOTAL_WEIGHT };

function bandFor(percent) {
  let match = BANDS[0];
  for (const band of BANDS) if (percent >= band.min) match = band;
  return match;
}

const cleanIds = (value) =>
  Array.isArray(value) ? Array.from(new Set(value.map((entry) => String(entry)))) : null;

/**
 * Assess one archive.
 *
 * @param {object} input
 * @param {string[]} input.locationIds  Ids from STORAGE_LOCATIONS that hold this archive.
 * @param {string[]} input.verifiedIds  Subset of locationIds opened and checked recently.
 * @param {string[]} input.practiceIds  Ids from PRACTICES already in place.
 * @returns {object} assessment, or { error } when the input cannot be used.
 */
export function assessArchiveRedundancy({ locationIds, verifiedIds, practiceIds }) {
  const locations = cleanIds(locationIds);
  const verified = cleanIds(verifiedIds);
  const practices = cleanIds(practiceIds);

  if (!locations) return { error: "Storage locations must be supplied as a list." };
  if (!verified) return { error: "Checked copies must be supplied as a list." };
  if (!practices) return { error: "Practices must be supplied as a list." };

  const knownLocations = new Map(STORAGE_LOCATIONS.map((item) => [item.id, item]));
  const knownPractices = new Set(PRACTICES.map((item) => item.id));

  if (locations.some((id) => !knownLocations.has(id))) {
    return { error: "One of the selected storage locations is not on the list." };
  }
  if (practices.some((id) => !knownPractices.has(id))) {
    return { error: "One of the selected practices is not on the list." };
  }
  if (verified.some((id) => !locations.includes(id))) {
    return { error: "You can only mark a copy as checked if the archive is stored there." };
  }
  if (locations.length === 0) {
    return { error: "Tick at least one place where this archive is stored." };
  }

  const chosen = STORAGE_LOCATIONS.filter((item) => locations.includes(item.id));
  const verifiedSet = new Set(verified);

  const domains = new Set(chosen.map((item) => item.domain));
  const media = new Set(chosen.map((item) => item.media));
  const offsite = chosen.filter((item) => item.site === "offsite" || item.site === "cloud");
  const deleteProof = chosen.filter((item) => !item.syncs);
  const offline = chosen.filter((item) => item.offline);
  const verifiedCopies = chosen.filter((item) => verifiedSet.has(item.id));

  const met = {
    independent: domains.size >= REQUIRED_INDEPENDENT_DOMAINS,
    copies: chosen.length >= RULE_TOTAL_COPIES,
    media: media.size >= RULE_MEDIA_TYPES,
    offsite: offsite.length >= RULE_OFFSITE_COPIES,
    deleteproof: deleteProof.length >= 1,
    offline: offline.length >= RULE_OFFLINE_COPIES,
    verified: verifiedCopies.length >= REQUIRED_VERIFIED_COPIES,
  };

  let earned = 0;
  for (const req of REQUIREMENTS) if (met[req.id]) earned += req.weight;
  const practiceSet = new Set(practices);
  for (const item of PRACTICES) if (practiceSet.has(item.id)) earned += item.weight;

  let readinessPercent = Math.round((earned / TOTAL_WEIGHT) * 100);
  let band = bandFor(readinessPercent);

  // Hard rule: without two independent copies there is no redundancy, whatever else is ticked.
  const singlePointOfFailure = !met.independent;
  if (singlePointOfFailure) {
    band = BANDS[0];
    readinessPercent = Math.min(readinessPercent, BANDS[1].min - 1);
  }

  // Copies that share a failure domain with another copy — the ones that overstate safety.
  const domainCounts = new Map();
  for (const item of chosen) domainCounts.set(item.domain, (domainCounts.get(item.domain) || 0) + 1);
  const correlated = chosen
    .filter((item) => domainCounts.get(item.domain) > 1)
    .map((item) => ({ id: item.id, label: item.label, domain: item.domain }));

  const gaps = REQUIREMENTS.filter((req) => !met[req.id]).map((req) => ({
    id: req.id,
    label: req.label,
  }));
  const missingPractices = PRACTICES.filter((item) => !practiceSet.has(item.id)).map((item) => ({
    id: item.id,
    label: item.label,
  }));

  let verdict;
  if (singlePointOfFailure) {
    verdict =
      "Every copy you ticked can be destroyed by the same event. Add one copy in a different failure domain — a drive at another address, or an archive on a different provider and sign-in — before anything else.";
  } else if (!met.offsite) {
    verdict =
      "Your copies are independent of each other but all live at one address. A fire, flood or burglary still takes the lot; move one copy out of the house.";
  } else if (!met.deleteproof) {
    verdict =
      "Everything you have mirrors your device, so a mistaken delete or a ransomware run would propagate to all of it. Add one copy with version history or one that stays disconnected.";
  } else if (!met.verified) {
    verdict = `Untested copies are assumptions. Open files from ${REQUIRED_VERIFIED_COPIES} copies and confirm they still display — that is the "0 errors" half of the rule.`;
  } else if (band.id === "resilient") {
    verdict =
      "This archive meets 3-2-1-1-0. Keep the refresh date in the calendar and re-test after any hardware change.";
  } else {
    verdict =
      "The structure is sound. Close the remaining practice gaps below, especially the ones about who else can get in and how corruption would be spotted.";
  }

  return {
    readinessPercent,
    band,
    copies: chosen.length,
    independentDomains: domains.size,
    mediaTypes: media.size,
    offsiteCopies: offsite.length,
    deleteProofCopies: deleteProof.length,
    offlineCopies: offline.length,
    verifiedCopies: verifiedCopies.length,
    met,
    singlePointOfFailure,
    correlated,
    gaps,
    missingPractices,
    practicesDone: practiceSet.size,
    practicesTotal: PRACTICES.length,
    verdict,
    chosen: chosen.map((item) => ({ id: item.id, label: item.label, note: item.note })),
  };
}
