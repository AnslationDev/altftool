/**
 * Freelancer Privacy Starter Kit — separation scoring and blast-radius estimate.
 *
 * Weighting
 * ---------
 * Each control is worth 1-5 points based on how much cross-contamination it removes
 * between a solo professional's personal identity and their clients' data. The 5s go
 * to the two controls that decide whether one compromised login exposes one client or
 * all of them: multi-factor authentication on the accounts that hold client files, and
 * per-client folders with least-privilege sharing instead of one shared drive.
 *
 * Blast radius
 * ------------
 * blastRadius = ceil(totalClientDatasets x (1 - score/100))
 * A deliberately blunt illustration: the number of client datasets a single account
 * compromise could still reach once the completed controls are taken into account.
 * Datasets you no longer hold cannot be exposed, which is why a written retention
 * period is one of the higher-weighted items.
 */

/** GDPR Article 33(1): a controller must notify the supervisory authority of a personal
 *  data breach without undue delay and, where feasible, within 72 hours of becoming aware. */
export const GDPR_BREACH_NOTIFY_HOURS = 72;

/** Sanity ceiling for the client counts. */
export const MAX_CLIENTS = 500;

export const RISK_BANDS = [
  { min: 85, label: "Well separated", note: "Client data, business identity and personal life are properly compartmentalised." },
  { min: 65, label: "Mostly separated", note: "The structure is sound. Close the remaining gaps before the next big client." },
  { min: 40, label: "Partly separated", note: "One compromised login would still reach several clients at once." },
  { min: 0, label: "Blended", note: "Personal and client data share the same accounts and devices. Start with the critical items." },
];

export const CHECKLIST = [
  {
    id: "id-address",
    area: "Business identity",
    title: "Keep your home address off invoices, contracts and your website",
    action: "Use a registered business address, coworking address or post box on anything a client or the public can see.",
    why: "An invoice is forwarded, filed and sometimes published; a home address on it is permanent public exposure.",
    weight: 4,
    critical: false,
  },
  {
    id: "id-phone",
    area: "Business identity",
    title: "Use a separate work number for client contact",
    action: "A second eSIM or a VoIP number keeps client calls, OTPs and cold outreach off your personal line.",
    why: "Once your personal number is on a public profile you cannot take it back, and it becomes a SIM-swap target.",
    weight: 3,
    critical: false,
  },
  {
    id: "id-whois",
    area: "Business identity",
    title: "Turn on WHOIS privacy for your business domain",
    action: "Most registrars offer domain privacy free or cheaply; check the public record after enabling it.",
    why: "Registrant records are scraped continuously and are a common source of a freelancer's home address.",
    weight: 3,
    critical: false,
  },
  {
    id: "acc-mfa",
    area: "Accounts",
    title: "Multi-factor authentication on email, cloud storage, invoicing and payments",
    action: "Use passkeys or an authenticator app, and store recovery codes offline rather than in the same drive.",
    why: "These four accounts together hold every client file, contract and payout detail you have.",
    weight: 5,
    critical: true,
  },
  {
    id: "acc-separate",
    area: "Accounts",
    title: "Run a separate work identity from your personal one",
    action: "A distinct work email and cloud account, not an alias on the mailbox you also use for shopping and family.",
    why: "Shared accounts mean a personal phishing click lands directly in the client file store.",
    weight: 4,
    critical: true,
  },
  {
    id: "acc-manager",
    area: "Accounts",
    title: "Use a password manager and never send credentials over chat",
    action: "Share client credentials through the manager's sharing feature or the client's own SSO, not email or WhatsApp.",
    why: "Credentials pasted into chat stay in two message histories, two backups and often a desktop notification log.",
    weight: 4,
    critical: false,
  },
  {
    id: "acc-device",
    area: "Accounts",
    title: "Separate work profile on the laptop, with full-disk encryption",
    action: "Switch on BitLocker or FileVault and keep client files inside the work profile only.",
    why: "Encryption is what turns a stolen laptop into a hardware loss rather than a client-data breach.",
    weight: 4,
    critical: true,
  },
  {
    id: "cd-perclient",
    area: "Client data",
    title: "One space per client, shared with named people only",
    action: "Replace every 'anyone with the link' share with named access, and audit the list once a month.",
    why: "Link-shared folders are the single most common way one client ends up able to see another's files.",
    weight: 5,
    critical: true,
  },
  {
    id: "cd-expiry",
    area: "Client data",
    title: "Set expiry dates on shared links and remove collaborators at handover",
    action: "Make link expiry the default, and add an offboarding step that revokes access the week a project ends.",
    why: "Access almost never gets removed manually, so old contractors keep reading live client folders for years.",
    weight: 3,
    critical: false,
  },
  {
    id: "cd-retention",
    area: "Client data",
    title: "Write down a retention period and actually delete after it",
    action: "For example: working files deleted 90 days after final payment, invoices kept for the statutory tax period.",
    why: "Data you no longer hold cannot leak, and a stated retention period is what clients and auditors ask for.",
    weight: 4,
    critical: false,
  },
  {
    id: "cd-transfer",
    area: "Client data",
    title: "Transfer deliverables by expiring link, not email or chat attachments",
    action: "Attachments are copied into inbox backups and phone galleries you do not control.",
    why: "A link you can revoke is the only kind of transfer you can undo after the fact.",
    weight: 3,
    critical: false,
  },
  {
    id: "cd-backup",
    area: "Client data",
    title: "Keep an encrypted backup of work data on the 3-2-1 rule",
    action: "Three copies, two media types, one off-site — and test a restore once before you need it.",
    why: "Ransomware and a dead drive both end the same way for a solo business without a tested backup.",
    weight: 3,
    critical: false,
  },
  {
    id: "ct-dpa",
    area: "Contracts",
    title: "Put confidentiality and data-protection terms in every contract",
    action: "Where you handle personal data on a client's behalf, agree a written processing agreement covering purpose, security and deletion.",
    why: "Without written terms, neither side has agreed what you may keep, where it may be stored, or when it is deleted.",
    weight: 4,
    critical: false,
  },
  {
    id: "ct-subprocessors",
    area: "Contracts",
    title: "List the third parties you pass client data through",
    action: "Cloud storage, transcription and AI tools, your accountant, your VA — then check the client agreed to them.",
    why: "Most freelancers add a new tool mid-project and never tell the client their data now sits somewhere new.",
    weight: 3,
    critical: false,
  },
  {
    id: "ct-breach",
    area: "Contracts",
    title: "Agree a written breach process before you need one",
    action: `Who you call, what you record, and how fast you tell the client — under the GDPR the controller's clock is ${GDPR_BREACH_NOTIFY_HOURS} hours to the supervisory authority.`,
    why: "As a processor you are usually contractually required to alert the client without undue delay, and improvising costs days.",
    weight: 4,
    critical: true,
  },
  {
    id: "mn-account",
    area: "Money",
    title: "Keep a separate bank account and payment link for business income",
    action: "Client payment pages and remittance advice then never reveal your personal account details.",
    why: "Mixed accounts leak personal transactions into anything you have to show an accountant, platform or client.",
    weight: 3,
    critical: false,
  },
  {
    id: "mn-invoice",
    area: "Money",
    title: "Keep invoices in one system instead of emailing spreadsheets",
    action: "A single invoicing tool avoids client names, addresses and tax numbers scattered across old email threads.",
    why: "Spreadsheets of client details are the copies you forget about and cannot delete on request.",
    weight: 3,
    critical: false,
  },
];

export const MAX_POINTS = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

export const AREAS = CHECKLIST.reduce(
  (list, item) => (list.includes(item.area) ? list : [...list, item.area]),
  [],
);

function bandFor(percent) {
  return RISK_BANDS.find((band) => percent >= band.min) ?? RISK_BANDS[RISK_BANDS.length - 1];
}

function validCount(value, label) {
  const n = Number(value);
  if (!Number.isFinite(n)) return { error: `Enter ${label} as a plain number.` };
  const Label = label.charAt(0).toUpperCase() + label.slice(1);
  if (n < 0) return { error: `${Label} cannot be negative.` };
  if (!Number.isInteger(n)) return { error: `${Label} must be a whole number.` };
  if (n > MAX_CLIENTS) return { error: `Enter ${MAX_CLIENTS} or fewer for ${label}.` };
  return { value: n };
}

/**
 * @param {{doneIds:string[], activeClients:number, pastClients:number}} input
 */
export function assessFreelancerKit({ doneIds, activeClients, pastClients } = {}) {
  if (!Array.isArray(doneIds)) {
    return { error: "Completed items must be provided as a list." };
  }
  const active = validCount(activeClients, "active clients");
  if (active.error) return { error: active.error };
  const past = validCount(pastClients, "past clients whose files you still hold");
  if (past.error) return { error: past.error };

  const done = new Set(doneIds.filter((id) => typeof id === "string"));
  let points = 0;
  const remaining = [];
  for (const item of CHECKLIST) {
    if (done.has(item.id)) points += item.weight;
    else remaining.push(item);
  }

  const percent = MAX_POINTS > 0 ? (points / MAX_POINTS) * 100 : 0;
  const totalDatasets = active.value + past.value;
  const blastRadius = Math.ceil(totalDatasets * (1 - percent / 100));

  const areaBreakdown = AREAS.map((area) => {
    const items = CHECKLIST.filter((item) => item.area === area);
    const earned = items.reduce((sum, item) => sum + (done.has(item.id) ? item.weight : 0), 0);
    const available = items.reduce((sum, item) => sum + item.weight, 0);
    return {
      area,
      done: items.filter((item) => done.has(item.id)).length,
      total: items.length,
      percent: available > 0 ? (earned / available) * 100 : 0,
    };
  });

  const weakestArea = areaBreakdown.reduce(
    (worst, entry) => (worst === null || entry.percent < worst.percent ? entry : worst),
    null,
  );

  return {
    points,
    maxPoints: MAX_POINTS,
    percent,
    band: bandFor(percent),
    completed: CHECKLIST.length - remaining.length,
    total: CHECKLIST.length,
    remaining,
    openCritical: remaining.filter((item) => item.critical),
    nextStep: remaining.filter((item) => item.critical)[0] ?? remaining[0] ?? null,
    activeClients: active.value,
    pastClients: past.value,
    totalDatasets,
    blastRadius,
    staleShare: totalDatasets > 0 ? (past.value / totalDatasets) * 100 : 0,
    areaBreakdown,
    weakestArea,
  };
}
