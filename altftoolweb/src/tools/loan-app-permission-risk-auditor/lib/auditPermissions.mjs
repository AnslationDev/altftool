const PERMISSION_DEFINITIONS = [
  {
    name: "READ_CONTACTS",
    group: "contacts",
    groupLabel: "Contacts",
    attention: "high",
    explanation:
      "Can expose a person’s saved names and phone numbers, which may reveal their social graph.",
  },
  {
    name: "WRITE_CONTACTS",
    group: "contacts",
    groupLabel: "Contacts",
    attention: "high",
    explanation: "Can add, edit, or remove entries in the device contact list.",
  },
  {
    name: "GET_ACCOUNTS",
    group: "contacts",
    groupLabel: "Contacts and accounts",
    attention: "medium",
    explanation: "Can reveal accounts registered on some older Android versions.",
  },
  {
    name: "READ_SMS",
    group: "sms",
    groupLabel: "SMS",
    attention: "high",
    explanation: "Can read text messages, which may include private conversations or one-time codes.",
  },
  {
    name: "RECEIVE_SMS",
    group: "sms",
    groupLabel: "SMS",
    attention: "high",
    explanation: "Can receive or observe incoming SMS messages.",
  },
  {
    name: "SEND_SMS",
    group: "sms",
    groupLabel: "SMS",
    attention: "high",
    explanation: "Can send text messages, potentially creating charges or contacting others.",
  },
  {
    name: "RECEIVE_MMS",
    group: "sms",
    groupLabel: "SMS",
    attention: "high",
    explanation: "Can receive multimedia messages.",
  },
  {
    name: "READ_CALL_LOG",
    group: "call_logs",
    groupLabel: "Calls and call logs",
    attention: "high",
    explanation: "Can reveal who was called, when, and for how long.",
  },
  {
    name: "WRITE_CALL_LOG",
    group: "call_logs",
    groupLabel: "Calls and call logs",
    attention: "high",
    explanation: "Can alter the device call history.",
  },
  {
    name: "PROCESS_OUTGOING_CALLS",
    group: "call_logs",
    groupLabel: "Calls and call logs",
    attention: "high",
    explanation: "Can observe or redirect outgoing calls on older Android versions.",
  },
  {
    name: "READ_PHONE_STATE",
    group: "call_logs",
    groupLabel: "Calls and phone state",
    attention: "medium",
    explanation: "Can inspect phone and call state and, on older versions, some device identifiers.",
  },
  {
    name: "READ_PHONE_NUMBERS",
    group: "call_logs",
    groupLabel: "Calls and phone state",
    attention: "medium",
    explanation: "Can access phone numbers associated with the device.",
  },
  {
    name: "CALL_PHONE",
    group: "call_logs",
    groupLabel: "Calls and phone state",
    attention: "medium",
    explanation: "Can start a phone call without opening the dialer for confirmation.",
  },
  {
    name: "READ_EXTERNAL_STORAGE",
    group: "storage_media",
    groupLabel: "Files and media",
    attention: "medium",
    explanation: "Can read shared storage on Android versions where this permission applies.",
  },
  {
    name: "WRITE_EXTERNAL_STORAGE",
    group: "storage_media",
    groupLabel: "Files and media",
    attention: "medium",
    explanation: "Can modify shared storage on Android versions where this permission applies.",
  },
  {
    name: "MANAGE_EXTERNAL_STORAGE",
    group: "storage_media",
    groupLabel: "Files and media",
    attention: "high",
    explanation: "Requests broad access to files in shared storage.",
  },
  {
    name: "READ_MEDIA_IMAGES",
    group: "storage_media",
    groupLabel: "Files and media",
    attention: "medium",
    explanation: "Can read photos and images selected by Android’s media permission model.",
  },
  {
    name: "READ_MEDIA_VIDEO",
    group: "storage_media",
    groupLabel: "Files and media",
    attention: "medium",
    explanation: "Can read videos selected by Android’s media permission model.",
  },
  {
    name: "READ_MEDIA_AUDIO",
    group: "storage_media",
    groupLabel: "Files and media",
    attention: "medium",
    explanation: "Can read audio files selected by Android’s media permission model.",
  },
  {
    name: "BIND_ACCESSIBILITY_SERVICE",
    group: "accessibility",
    groupLabel: "Accessibility service",
    attention: "high",
    explanation:
      "An enabled accessibility service may observe screen content and perform interface actions; the manifest declaration alone does not enable it.",
  },
  {
    name: "ACCESS_COARSE_LOCATION",
    group: "location",
    groupLabel: "Location",
    attention: "medium",
    explanation: "Can obtain approximate device location while allowed.",
  },
  {
    name: "ACCESS_FINE_LOCATION",
    group: "location",
    groupLabel: "Location",
    attention: "medium",
    explanation: "Can obtain precise device location while allowed.",
  },
  {
    name: "ACCESS_BACKGROUND_LOCATION",
    group: "location",
    groupLabel: "Location",
    attention: "high",
    explanation: "Can request location access while the app is not visibly in use.",
  },
  {
    name: "REQUEST_INSTALL_PACKAGES",
    group: "install_packages",
    groupLabel: "Install unknown apps",
    attention: "high",
    explanation: "Can ask Android to install app packages from outside the usual store flow.",
  },
  {
    name: "INSTALL_PACKAGES",
    group: "install_packages",
    groupLabel: "Package installation",
    attention: "high",
    explanation:
      "Can install packages when granted to a privileged or system app; ordinary apps do not normally receive it.",
  },
  {
    name: "SYSTEM_ALERT_WINDOW",
    group: "overlay",
    groupLabel: "Display over other apps",
    attention: "high",
    explanation: "Can place content over other apps after the user grants special access.",
  },
  {
    name: "BIND_DEVICE_ADMIN",
    group: "device_admin",
    groupLabel: "Device administrator",
    attention: "high",
    explanation:
      "May be associated with a device-admin receiver; activation is a separate user-controlled step.",
  },
  {
    name: "DEVICE_ADMIN_ENABLED",
    group: "device_admin",
    groupLabel: "Device administrator",
    attention: "high",
    explanation: "Indicates a device-admin receiver declaration rather than a normal runtime permission.",
  },
];

const DEFINITION_BY_NAME = new Map(
  PERMISSION_DEFINITIONS.map((definition) => [definition.name, definition]),
);

const ATTENTION_ORDER = { high: 3, medium: 2, low: 1, none: 0 };

const COMBINATION_RULES = [
  {
    id: "social-graph-communications",
    level: "high",
    title: "Social graph plus communications history",
    matches: (groups) =>
      groups.has("contacts") && (groups.has("sms") || groups.has("call_logs")),
    explanation:
      "Contacts combined with messages or call history could expose both a person’s social graph and communication patterns. In a lending app, verify why both are genuinely necessary.",
  },
  {
    id: "screen-control-overlay",
    level: "high",
    title: "Accessibility service plus screen overlay",
    matches: (groups) => groups.has("accessibility") && groups.has("overlay"),
    explanation:
      "If separately enabled by the user, these special-access capabilities can combine screen observation or interaction with content displayed over other apps.",
  },
  {
    id: "screen-control-messages",
    level: "high",
    title: "Accessibility service plus SMS access",
    matches: (groups) => groups.has("accessibility") && groups.has("sms"),
    explanation:
      "If granted and enabled, this combination may expose both interface activity and incoming message content, including sensitive codes.",
  },
  {
    id: "persistent-control",
    level: "high",
    title: "Device administration plus screen control",
    matches: (groups) =>
      groups.has("device_admin") &&
      (groups.has("accessibility") || groups.has("overlay")),
    explanation:
      "Device-admin activation combined with accessibility or overlay access deserves careful review because it may make unwanted control harder to notice or remove.",
  },
  {
    id: "background-location-social",
    level: "high",
    title: "Background location plus personal network data",
    matches: (groups, permissions) =>
      permissions.has("ACCESS_BACKGROUND_LOCATION") &&
      (groups.has("contacts") || groups.has("sms") || groups.has("call_logs")),
    explanation:
      "Continuous location combined with contacts or communications data can create a detailed profile of a person and their relationships.",
  },
  {
    id: "sideload-storage",
    level: "medium",
    title: "Package installation plus broad file access",
    matches: (groups) =>
      groups.has("install_packages") && groups.has("storage_media"),
    explanation:
      "The ability to request app installs alongside file access may support a sideloading flow. Confirm the product feature and distribution source.",
  },
  {
    id: "bulk-personal-data",
    level: "medium",
    title: "Files or media plus personal communications",
    matches: (groups) =>
      groups.has("storage_media") &&
      (groups.has("contacts") || groups.has("sms") || groups.has("call_logs")),
    explanation:
      "This combination spans multiple stores of personal data. A narrowly scoped loan workflow rarely needs unrestricted access to all of them.",
  },
  {
    id: "location-social-profile",
    level: "medium",
    title: "Location plus social or call data",
    matches: (groups) =>
      groups.has("location") &&
      (groups.has("contacts") || groups.has("call_logs")),
    explanation:
      "Location combined with contacts or call information can enable deeper personal profiling than either permission alone.",
  },
];

const GROUP_REMEDIATION = {
  contacts:
    "Open Android Settings → Apps → the app → Permissions, then deny Contacts unless it is essential to a feature you chose.",
  sms: "Deny SMS access unless the app clearly explains a necessary function; enter verification codes manually when possible.",
  call_logs:
    "Deny Phone and Call logs access unless a clearly explained core feature requires it.",
  storage_media:
    "Prefer Android’s file or photo picker over broad storage access, and share only the specific document needed.",
  accessibility:
    "Open Settings → Accessibility → Installed apps/services and turn off the service if you did not intentionally enable and need it.",
  location:
    "Choose approximate or while-in-use location where possible, or deny it when lending features do not need your location.",
  install_packages:
    "Open Special app access → Install unknown apps and disable permission for the source unless you intentionally use it.",
  overlay:
    "Open Special app access → Display over other apps and disable it when the app has no clear, trusted need.",
  device_admin:
    "Open Security settings → Device admin apps and deactivate the app before uninstalling it if you no longer trust it.",
};

function normalizePermissionName(value) {
  const upper = String(value || "").trim().toUpperCase();
  const androidIndex = upper.lastIndexOf("ANDROID.PERMISSION.");
  if (androidIndex >= 0) {
    return upper
      .slice(androidIndex + "ANDROID.PERMISSION.".length)
      .replace(/[^A-Z0-9_].*$/, "");
  }
  return upper.replace(/[^A-Z0-9_]/g, "");
}

function detectInputKind(input) {
  return /<\s*(?:manifest|uses-permission|application|service|receiver)\b/i.test(input)
    ? "AndroidManifest XML"
    : "Permission list";
}

export function parsePermissionInput(rawInput) {
  const input = String(rawInput || "");
  const occurrences = [];
  const fullPermissionPattern = /android\.permission\.([A-Z0-9_]+)/gi;

  for (const match of input.matchAll(fullPermissionPattern)) {
    occurrences.push(match[1].toUpperCase());
  }

  if (/android\.app\.action\.DEVICE_ADMIN_ENABLED/i.test(input)) {
    occurrences.push("DEVICE_ADMIN_ENABLED");
  }

  const shorthandInput = input
    .replace(/android\.permission\.[A-Z0-9_]+/gi, " ")
    .replace(/android\.app\.action\.DEVICE_ADMIN_ENABLED/gi, " ");
  for (const token of shorthandInput.match(/[A-Z][A-Z0-9_]{2,}/gi) || []) {
    const normalized = normalizePermissionName(token);
    if (DEFINITION_BY_NAME.has(normalized)) occurrences.push(normalized);
  }

  const counts = new Map();
  for (const name of occurrences) counts.set(name, (counts.get(name) || 0) + 1);

  const fullAndroidPermissions = [
    ...input.matchAll(/android\.permission\.([A-Z0-9_]+)/gi),
  ].map((match) => match[1].toUpperCase());

  const permissionNames = [...new Set([...occurrences, ...fullAndroidPermissions])].sort();
  const permissions = permissionNames.map((name) => {
    const definition = DEFINITION_BY_NAME.get(name);
    return definition
      ? { ...definition, classified: true }
      : {
          name,
          group: "other",
          groupLabel: "Other declared permission",
          attention: "none",
          explanation:
            "This permission is outside this tool’s focused sensitive-access checklist; review it in Android documentation.",
          classified: false,
        };
  });

  return {
    inputKind: detectInputKind(input),
    permissions,
    duplicates: [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => left.name.localeCompare(right.name)),
  };
}

function buildGroups(permissions) {
  const grouped = new Map();

  for (const permission of permissions.filter((item) => item.classified)) {
    if (!grouped.has(permission.group)) {
      grouped.set(permission.group, {
        id: permission.group,
        label: permission.groupLabel,
        attention: permission.attention,
        permissions: [],
      });
    }
    const group = grouped.get(permission.group);
    group.permissions.push(permission);
    if (ATTENTION_ORDER[permission.attention] > ATTENTION_ORDER[group.attention]) {
      group.attention = permission.attention;
    }
  }

  return [...grouped.values()].sort(
    (left, right) =>
      ATTENTION_ORDER[right.attention] - ATTENTION_ORDER[left.attention] ||
      left.label.localeCompare(right.label),
  );
}

function getReviewLevel(groups, combinations) {
  const hasHighCombination = combinations.some((item) => item.level === "high");
  const highGroupCount = groups.filter((group) => group.attention === "high").length;
  const hasMediumCombination = combinations.some((item) => item.level === "medium");

  if (hasHighCombination || highGroupCount >= 3) {
    return {
      key: "high",
      label: "High-attention review",
      summary:
        "Multiple sensitive capabilities or a concerning combination is declared. Confirm necessity and deny access that is not essential.",
    };
  }
  if (highGroupCount > 0 || hasMediumCombination) {
    return {
      key: "medium",
      label: "Elevated review",
      summary:
        "At least one sensitive capability deserves a clear product explanation before it is granted.",
    };
  }
  if (groups.length > 0) {
    return {
      key: "low",
      label: "Review recommended",
      summary:
        "The focused checklist found permissions worth reviewing, but no high-attention combination.",
    };
  }
  return {
    key: "none",
    label: "No focused signal found",
    summary:
      "None of the permissions in this focused checklist were detected. This is not a complete security or trust assessment.",
  };
}

function buildRemediation(groups) {
  const steps = groups
    .map((group) => GROUP_REMEDIATION[group.id])
    .filter(Boolean);

  if (groups.some((group) => ["accessibility", "overlay"].includes(group.id))) {
    steps.push(
      "If this access was active unexpectedly, change important account credentials from a different trusted device and review recent account activity.",
    );
  }

  steps.push(
    "If you experienced threats or coercion, preserve screenshots and messages, then contact an official consumer-protection or cybercrime channel in your region.",
  );

  return [...new Set(steps)];
}

export function analyzePermissionInput(rawInput) {
  const parsed = parsePermissionInput(rawInput);
  const groups = buildGroups(parsed.permissions);
  const groupIds = new Set(groups.map((group) => group.id));
  const permissionNames = new Set(parsed.permissions.map((permission) => permission.name));
  const combinations = COMBINATION_RULES.filter((rule) =>
    rule.matches(groupIds, permissionNames),
  ).map(({ matches: _matches, ...rule }) => rule);

  return {
    ...parsed,
    groups,
    combinations,
    reviewLevel: getReviewLevel(groups, combinations),
    remediation: buildRemediation(groups),
    classifiedCount: parsed.permissions.filter((permission) => permission.classified).length,
    unclassifiedCount: parsed.permissions.filter((permission) => !permission.classified).length,
  };
}

export function buildAuditReport(audit) {
  const lines = [
    "Loan App Permission Risk Auditor",
    `Input type: ${audit.inputKind}`,
    `Declared permissions found: ${audit.permissions.length}`,
    `Focused sensitive permissions: ${audit.classifiedCount}`,
    `Review level: ${audit.reviewLevel.label}`,
    "",
    audit.reviewLevel.summary,
    "",
    "Permission groups",
    ...(audit.groups.length
      ? audit.groups.flatMap((group) => [
          `- ${group.label} (${group.attention} attention)`,
          ...group.permissions.map(
            (permission) => `  • ${permission.name}: ${permission.explanation}`,
          ),
        ])
      : ["- No focused permission group detected."]),
    "",
    "Combination checks",
    ...(audit.combinations.length
      ? audit.combinations.map(
          (combination) =>
            `- ${combination.title} (${combination.level} attention): ${combination.explanation}`,
        )
      : ["- No focused combination detected."]),
    "",
    "Safer next steps",
    ...audit.remediation.map((step) => `- ${step}`),
    "",
    "Important: A manifest declaration does not prove that access was granted, used, abusive, or fraudulent. This local checklist is not a malware scan or legal determination.",
  ];

  return lines.join("\n");
}

export { PERMISSION_DEFINITIONS };
