export const ACCESSED_DATE = "24 July 2026";

export const OBSERVED_SYMPTOMS = [
  {
    id: "network-loss",
    label: "Unexpected loss of mobile service",
    detail: "No service in a usual coverage area for a sustained period.",
    domains: ["carrier"],
  },
  {
    id: "sim-change-notice",
    label: "Unrequested SIM, eSIM, or replacement notice",
    detail: "A carrier message or email refers to a change you did not request.",
    domains: ["carrier", "evidence"],
  },
  {
    id: "auth-delivery-stopped",
    label: "Expected sign-in messages stopped arriving",
    detail: "Messages normally used for account access are no longer reaching you.",
    domains: ["carrier", "email", "accounts-sessions"],
  },
  {
    id: "financial-activity",
    label: "Unrecognised financial activity",
    detail: "A bank, card, wallet, beneficiary, or payment alert is unfamiliar.",
    domains: ["bank-payment", "evidence"],
  },
  {
    id: "email-security-change",
    label: "Unexpected email security change",
    detail: "A password, recovery method, forwarding, or sign-in alert is unfamiliar.",
    domains: ["email", "accounts-sessions", "evidence"],
  },
  {
    id: "account-session-alert",
    label: "Unfamiliar sign-in or linked-device alert",
    detail: "A messaging, social, cloud, or work account shows an unknown session.",
    domains: ["accounts-sessions", "evidence"],
  },
  {
    id: "unrecognised-messages",
    label: "Messages or posts you did not create",
    detail: "Activity appeared from one of your accounts without your action.",
    domains: ["accounts-sessions", "evidence"],
  },
  {
    id: "device-lost",
    label: "Phone or SIM is lost or stolen",
    detail: "The device or physical SIM is no longer under your control.",
    domains: [
      "carrier",
      "bank-payment",
      "email",
      "accounts-sessions",
      "evidence",
    ],
  },
  {
    id: "unknown-connection",
    label: "An unfamiliar mobile connection is linked to your identity",
    detail: "You independently found a connection that you do not recognise.",
    domains: ["carrier", "evidence"],
  },
];

export const ACCOUNT_GROUPS = [
  {
    id: "mobile",
    label: "Mobile connection or eSIM",
    detail: "Your primary mobile service or replacement process.",
    domains: ["carrier"],
  },
  {
    id: "bank",
    label: "Bank or card access",
    detail: "Any banking relationship tied to the affected mobile connection.",
    domains: ["bank-payment"],
  },
  {
    id: "payment",
    label: "Payment app or wallet",
    detail: "Any payment service tied to the affected connection.",
    domains: ["bank-payment"],
  },
  {
    id: "email",
    label: "Primary email",
    detail: "The inbox used to recover other accounts.",
    domains: ["email"],
  },
  {
    id: "messaging",
    label: "Messaging accounts",
    detail: "Apps with mobile-linked profiles or web sessions.",
    domains: ["accounts-sessions"],
  },
  {
    id: "social",
    label: "Social accounts",
    detail: "Profiles using the mobile connection or email for recovery.",
    domains: ["accounts-sessions"],
  },
  {
    id: "cloud",
    label: "Cloud or device account",
    detail: "Storage, device backup, or device-management accounts.",
    domains: ["accounts-sessions"],
  },
  {
    id: "work",
    label: "Work or business account",
    detail: "Employer, business, or collaboration access.",
    domains: ["accounts-sessions"],
  },
  {
    id: "identity-linked",
    label: "Identity-linked online service",
    detail: "An important service using the affected connection for recovery.",
    domains: ["accounts-sessions"],
  },
];

export const RECOVERY_DOMAINS = [
  {
    id: "carrier",
    title: "Carrier & SIM control",
    description:
      "Verify the service change and secure the connection through an independently sourced official operator channel.",
    priorityWhenSelected: "Start first",
    reviewLabel: "Review first",
    actions: [
      {
        id: "carrier-official-channel",
        label:
          "I used an official operator channel found independently, not a detail from an unexpected message.",
      },
      {
        id: "carrier-verify-change",
        label:
          "I reported the unexpected loss of control and asked whether a SIM, eSIM, replacement, or port request occurred.",
      },
      {
        id: "carrier-secure",
        label:
          "I followed the operator’s official process to secure or restore the connection.",
      },
      {
        id: "carrier-reference",
        label:
          "I preserved the service-request time and acknowledgement without recording secrets here.",
      },
      {
        id: "carrier-connections-review",
        label:
          "I independently reviewed mobile connections issued in my name through the official Sanchar Saathi service.",
      },
      {
        id: "carrier-lost-device",
        label:
          "If the handset was lost or stolen, I used Sanchar Saathi’s official lost-handset process.",
      },
    ],
  },
  {
    id: "bank-payment",
    title: "Bank & payment protection",
    description:
      "Review affected financial access promptly through each provider’s independently sourced official process.",
    priorityWhenSelected: "Start promptly",
    reviewLabel: "Review if linked",
    actions: [
      {
        id: "bank-review",
        label:
          "I reviewed recent financial alerts and activity from a trusted device.",
      },
      {
        id: "bank-report",
        label:
          "I promptly notified each affected provider through its official reporting process.",
      },
      {
        id: "bank-protect",
        label:
          "I requested the protections that each affected provider makes available for further unauthorised activity.",
      },
      {
        id: "bank-reference",
        label:
          "I preserved transaction details, report times, and acknowledgements outside this tool.",
      },
    ],
  },
  {
    id: "email",
    title: "Primary email recovery",
    description:
      "Secure the inbox that can reset other accounts, using a trusted device and the provider’s own controls.",
    priorityWhenSelected: "Secure next",
    reviewLabel: "Review if linked",
    actions: [
      {
        id: "email-password",
        label:
          "I set a new, unique password through the email provider’s own recovery flow.",
      },
      {
        id: "email-recovery",
        label:
          "I reviewed recovery methods, forwarding, and filter rules for unfamiliar changes.",
      },
      {
        id: "email-sessions",
        label:
          "I signed out other or unfamiliar email sessions where that control was available.",
      },
      {
        id: "email-auth",
        label:
          "I enabled a stronger sign-in method not solely dependent on the affected SIM, if supported.",
      },
    ],
  },
  {
    id: "accounts-sessions",
    title: "Accounts & active sessions",
    description:
      "Review messaging, social, cloud, device, and work sessions that may remain active after SIM control changes.",
    priorityWhenSelected: "Review sessions",
    reviewLabel: "Review after email",
    actions: [
      {
        id: "sessions-review",
        label:
          "I reviewed active sessions and linked devices on important accounts.",
      },
      {
        id: "sessions-preserve",
        label:
          "I captured relevant evidence before changing or removing unfamiliar sessions.",
      },
      {
        id: "sessions-signout",
        label:
          "I signed out unfamiliar sessions using each provider’s own controls.",
      },
      {
        id: "sessions-passwords",
        label:
          "I replaced reused passwords, starting with accounts tied to the primary email or mobile connection.",
      },
      {
        id: "sessions-activity",
        label:
          "I reviewed recent messages, posts, profile changes, and recovery settings.",
      },
    ],
  },
  {
    id: "evidence",
    title: "Evidence preservation",
    description:
      "Keep original context and timestamps while recording what happened and what official actions were taken.",
    priorityWhenSelected: "Preserve throughout",
    reviewLabel: "Preserve throughout",
    actions: [
      {
        id: "evidence-network",
        label:
          "I recorded the network state, approximate time, and device context.",
      },
      {
        id: "evidence-notices",
        label:
          "I preserved carrier, sign-in, reset, and financial notifications.",
      },
      {
        id: "evidence-records",
        label:
          "I preserved relevant session screens, messages, emails, and transaction records.",
      },
      {
        id: "evidence-timeline",
        label:
          "I created a timeline and kept official acknowledgement references without secrets or full identifiers.",
      },
      {
        id: "evidence-originals",
        label:
          "I kept original files and messages unchanged and retained their context.",
      },
    ],
  },
];

export const EVIDENCE_TYPES = [
  {
    id: "network-state",
    label: "Network-state screenshot and approximate time",
  },
  {
    id: "carrier-notice",
    label: "Carrier change notice or service acknowledgement",
  },
  {
    id: "security-alert",
    label: "Sign-in, password, recovery, or linked-device alert",
  },
  {
    id: "financial-record",
    label: "Transaction alert, receipt, or statement",
  },
  {
    id: "communications",
    label: "Relevant message, email, or post",
  },
  {
    id: "session-screen",
    label: "Active-session or linked-device screen",
  },
  {
    id: "timeline",
    label: "Incident timeline and official acknowledgements",
  },
];

export const OFFICIAL_SOURCES = [
  {
    title: "BE(A)WARE — SIM swap / SIM cloning guidance",
    publisher: "Reserve Bank of India",
    url: "https://rbidocs.rbi.org.in/rdocs/content/pdfs/BEAWARE07032022.pdf",
    supports:
      "Treats sustained mobile-network loss in a normal environment as a reason to verify with the operator and advises keeping SIM identity credentials private.",
  },
  {
    title: "Customer protection for unauthorised electronic banking transactions",
    publisher: "Reserve Bank of India",
    url: "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11040",
    supports:
      "Advises customers to notify their bank of unauthorised electronic transactions promptly through the bank’s official reporting arrangements.",
  },
  {
    title: "Citizen telecom services, including Sanchar Saathi",
    publisher: "Department of Telecommunications",
    url: "https://eservices.dot.gov.in/",
    supports:
      "Lists services to review mobile connections issued in your name, report suspected communications, and block a lost or stolen handset.",
  },
  {
    title: "DoT directions on SIM binding and active web sessions",
    publisher: "Ministry of Communications / Press Information Bureau",
    url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2197146",
    supports:
      "Explains that communication accounts and long-lived web sessions can remain usable without the underlying SIM, supporting a separate session review.",
  },
  {
    title: "National Cybercrime Reporting Portal FAQ",
    publisher: "Indian Cybercrime Coordination Centre, Ministry of Home Affairs",
    url: "https://www.cybercrime.gov.in/webform/FAQ.aspx",
    supports:
      "Lists supporting material such as receipts, statements, emails, web addresses, chats, screenshots, videos, images, and documents.",
  },
  {
    title: "Citizen manual for reporting other cybercrime",
    publisher: "Ministry of Home Affairs",
    url: "https://cybercrime.gov.in/UploadMedia/MHA-CitizenManualReportOtherCyberCrime-v10.pdf",
    supports:
      "Includes SIM-swap complaint preparation such as incident timing, communications, transaction information, and supporting screenshots.",
  },
];

export const ALL_ACTIONS = RECOVERY_DOMAINS.flatMap((domain) => domain.actions);

export function createSelectionState(items) {
  return Object.fromEntries(items.map((item) => [item.id, false]));
}

export function createActionState() {
  return createSelectionState(ALL_ACTIONS);
}

function countSelected(items, state) {
  return items.filter((item) => Boolean(state[item.id])).length;
}

function triggerCountForDomain(domainId, symptoms, accounts) {
  const symptomCount = OBSERVED_SYMPTOMS.filter(
    (item) => symptoms[item.id] && item.domains.includes(domainId),
  ).length;
  const accountCount = ACCOUNT_GROUPS.filter(
    (item) => accounts[item.id] && item.domains.includes(domainId),
  ).length;
  return symptomCount + accountCount;
}

export function buildRecoveryPlan(symptoms, accounts, actions) {
  return RECOVERY_DOMAINS.map((domain) => {
    const triggerCount =
      domain.id === "evidence"
        ? countSelected(OBSERVED_SYMPTOMS, symptoms) +
          countSelected(ACCOUNT_GROUPS, accounts)
        : triggerCountForDomain(domain.id, symptoms, accounts);
    const completedActions = domain.actions.filter((action) =>
      Boolean(actions[action.id]),
    ).length;

    return {
      ...domain,
      triggerCount,
      completedActions,
      totalActions: domain.actions.length,
      prioritised:
        triggerCount > 0 || completedActions > 0 || domain.id === "evidence",
      priorityLabel:
        triggerCount > 0 || completedActions > 0 || domain.id === "evidence"
          ? domain.priorityWhenSelected
          : domain.reviewLabel,
    };
  });
}

export function getRecoverySummary({
  symptoms = createSelectionState(OBSERVED_SYMPTOMS),
  accounts = createSelectionState(ACCOUNT_GROUPS),
  actions = createActionState(),
  evidence = createSelectionState(EVIDENCE_TYPES),
} = {}) {
  const plan = buildRecoveryPlan(symptoms, accounts, actions);
  return {
    selectedSymptoms: countSelected(OBSERVED_SYMPTOMS, symptoms),
    totalSymptoms: OBSERVED_SYMPTOMS.length,
    selectedAccounts: countSelected(ACCOUNT_GROUPS, accounts),
    totalAccounts: ACCOUNT_GROUPS.length,
    completedActions: countSelected(ALL_ACTIONS, actions),
    totalActions: ALL_ACTIONS.length,
    preservedEvidence: countSelected(EVIDENCE_TYPES, evidence),
    totalEvidence: EVIDENCE_TYPES.length,
    prioritisedDomains: plan.filter((domain) => domain.prioritised).length,
    totalDomains: plan.length,
    plan,
  };
}

export function hasRecoverySelections(states = {}) {
  return [states.symptoms, states.accounts, states.actions, states.evidence].some(
    (state) => state && Object.values(state).some(Boolean),
  );
}

function formatCreatedAt(createdAt) {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  return Number.isNaN(date.getTime()) ? "Not recorded" : date.toISOString();
}

export function buildCountsOnlyReport({
  symptoms = createSelectionState(OBSERVED_SYMPTOMS),
  accounts = createSelectionState(ACCOUNT_GROUPS),
  actions = createActionState(),
  evidence = createSelectionState(EVIDENCE_TYPES),
  createdAt = new Date(),
} = {}) {
  const summary = getRecoverySummary({ symptoms, accounts, actions, evidence });
  const lines = [
    "SIM SWAP RECOVERY PACK — COUNTS-ONLY SUMMARY",
    `Created locally: ${formatCreatedAt(createdAt)}`,
    "",
    "PRIVACY",
    "This file contains counts only. It excludes selected symptom names, account categories, identifiers, secrets, and evidence contents.",
    "",
    "LIMITS",
    "This is an organiser, not proof of a SIM swap, legal advice, an official report, or a guarantee of account or money recovery.",
    "The tool does not contact providers, access accounts, inspect a SIM, perform a live lookup, or submit a report.",
    "",
    "SELECTION COUNTS",
    `Observed symptoms selected: ${summary.selectedSymptoms} of ${summary.totalSymptoms}`,
    `Account groups selected: ${summary.selectedAccounts} of ${summary.totalAccounts}`,
    `Evidence types marked preserved: ${summary.preservedEvidence} of ${summary.totalEvidence}`,
    `Recovery actions completed: ${summary.completedActions} of ${summary.totalActions}`,
    `Recovery domains prioritised: ${summary.prioritisedDomains} of ${summary.totalDomains}`,
    "",
    "DOMAIN COMPLETION COUNTS",
  ];

  for (const domain of summary.plan) {
    lines.push(
      `${domain.title}: ${domain.completedActions} of ${domain.totalActions} completed`,
    );
  }

  lines.push(
    "",
    "STATIC RECOVERY ORDER",
    "Carrier and SIM control; bank and payment protection; primary email recovery; account and session review; evidence preservation throughout.",
    "",
    "OFFICIAL SOURCES",
  );

  for (const source of OFFICIAL_SOURCES) {
    lines.push(`${source.title} — ${source.publisher}`);
    lines.push(source.url);
    lines.push(`Accessed: ${ACCESSED_DATE}`);
  }

  return `${lines.join("\n")}\n`;
}

export function countsOnlyFilename(createdAt = new Date()) {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const stamp = Number.isNaN(date.getTime())
    ? "undated"
    : date.toISOString().slice(0, 10);
  return `sim-swap-recovery-counts-${stamp}.txt`;
}
