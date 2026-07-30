/**
 * End-to-end encryption explainer.
 *
 * Walks a message along its real path and works out, hop by hop, who can read
 * the content and who can see the metadata. Pure data and boolean logic.
 *
 * Definitions used throughout:
 *  - transportEncrypted: the link between two machines is encrypted (TLS), so a
 *    network observer sees nothing, but each machine on the path decrypts.
 *  - e2ee: only the two endpoints hold keys, so the provider's servers hold
 *    ciphertext they cannot open.
 */

/**
 * Channels, with the protections each one actually provides.
 * These flags describe documented behaviour, not marketing claims.
 */
export const CHANNELS = [
  {
    id: "sms",
    label: "SMS / MMS text message",
    transportEncrypted: false,
    e2ee: false,
    forwardSecrecy: false,
    keyVerification: false,
    encryptedBackup: false,
    metadataMinimisation: false,
    note: "There is no encryption in the SMS protocol. The message crosses carrier networks in the clear and is stored on carrier systems; SS7 weaknesses have been used to intercept messages and one-time codes.",
  },
  {
    id: "rcs",
    label: "RCS in Google Messages",
    transportEncrypted: true,
    e2ee: true,
    forwardSecrecy: true,
    keyVerification: true,
    encryptedBackup: false,
    metadataMinimisation: false,
    note: "Google Messages applies the Signal protocol to RCS chats, including group chats. It silently falls back to plain SMS when the other side is not on RCS, so check for the lock icon.",
  },
  {
    id: "email-plain",
    label: "Ordinary email (SMTP with STARTTLS)",
    transportEncrypted: true,
    e2ee: false,
    forwardSecrecy: false,
    keyVerification: false,
    encryptedBackup: false,
    metadataMinimisation: false,
    note: "STARTTLS protects each hop, but every mail server on the path decrypts and stores the full message. Opportunistic TLS also falls back to plaintext if the next server does not offer it.",
  },
  {
    id: "email-pgp",
    label: "Email with PGP or S/MIME",
    transportEncrypted: true,
    e2ee: true,
    forwardSecrecy: false,
    keyVerification: true,
    encryptedBackup: false,
    metadataMinimisation: false,
    note: "The body is end-to-end encrypted, but the subject line, sender, recipients and timestamps stay in the clear. PGP has no forward secrecy, so one compromised private key opens every message ever sent to it.",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    transportEncrypted: true,
    e2ee: true,
    forwardSecrecy: true,
    keyVerification: true,
    encryptedBackup: false,
    metadataMinimisation: false,
    note: "Messages use the Signal protocol by default. Chat backups to Google Drive or iCloud are only encrypted if you switch on end-to-end encrypted backups, which is off unless you enable it.",
  },
  {
    id: "signal",
    label: "Signal",
    transportEncrypted: true,
    e2ee: true,
    forwardSecrecy: true,
    keyVerification: true,
    encryptedBackup: true,
    metadataMinimisation: true,
    note: "End-to-end by default with the double ratchet, safety numbers you can compare, and sealed sender, which hides who sent a message from the server. Backups stay on your device behind a passphrase.",
  },
  {
    id: "imessage",
    label: "iMessage",
    transportEncrypted: true,
    e2ee: true,
    forwardSecrecy: true,
    keyVerification: true,
    encryptedBackup: false,
    metadataMinimisation: false,
    note: "End-to-end between Apple devices. If iCloud Backup is on without Advanced Data Protection, Apple holds a key that can open the message database. Green-bubble conversations fall back to SMS with no encryption at all.",
  },
  {
    id: "messenger",
    label: "Messenger or Instagram DMs",
    transportEncrypted: true,
    e2ee: true,
    forwardSecrecy: true,
    keyVerification: true,
    encryptedBackup: false,
    metadataMinimisation: false,
    note: "Personal one-to-one and group chats have been end-to-end encrypted by default since December 2023. Message requests, some community features and anything you report are handled differently.",
  },
  {
    id: "workchat",
    label: "Slack, Teams or workspace chat",
    transportEncrypted: true,
    e2ee: false,
    forwardSecrecy: false,
    keyVerification: false,
    encryptedBackup: false,
    metadataMinimisation: false,
    note: "Encrypted in transit and at rest, but the workspace owner holds the keys. Admins, compliance exports and eDiscovery can read any message, including direct messages, and that is a deliberate product feature.",
  },
  {
    id: "video-default",
    label: "Video call on default settings",
    transportEncrypted: true,
    e2ee: false,
    forwardSecrecy: false,
    keyVerification: false,
    encryptedBackup: false,
    metadataMinimisation: false,
    note: "Most conferencing tools encrypt to the media server, which decrypts to mix streams, record and transcribe. End-to-end modes exist but usually disable recording, phone dial-in and cloud transcription.",
  },
];

/** Situational switches that change who ends up with a readable copy. */
export const MODIFIERS = [
  {
    id: "cloudBackup",
    label: "Chat backup to iCloud or Google Drive is switched on",
    note: "A backup restores the plaintext, so whoever holds the backup key holds the conversation.",
  },
  {
    id: "managedDevice",
    label: "One of the devices is managed by an employer (MDM)",
    note: "Management software can capture screens, keystrokes and files after decryption, which end-to-end encryption cannot prevent.",
  },
  {
    id: "deviceShared",
    label: "A device is shared, unlocked or possibly compromised",
    note: "The endpoint is where plaintext exists. Malware, shoulder surfing and an unlocked phone all bypass the encryption entirely.",
  },
  {
    id: "screenshots",
    label: "The other person may screenshot or forward it",
    note: "Encryption controls who can read a message in transit, never what the recipient does with it afterwards.",
  },
];

/**
 * Protection weights for the 0-100 score. They total 100, so a channel with
 * every protection in place scores exactly 100. Comparison aid, not a rating.
 */
export const PROTECTIONS = [
  { id: "e2ee", label: "End-to-end encrypted content", weight: 40 },
  { id: "forwardSecrecy", label: "Forward secrecy", weight: 15 },
  { id: "encryptedBackup", label: "Backups the provider cannot open", weight: 15 },
  { id: "keyVerification", label: "You can verify the other person's key", weight: 10 },
  { id: "metadataMinimisation", label: "Metadata deliberately minimised", weight: 10 },
  { id: "endpointHygiene", label: "Both endpoints are private and unmanaged", weight: 10 },
];

/** Score bands. min is an inclusive lower bound on the 0-100 scale. */
export const SCORE_BANDS = [
  { min: 85, label: "Strong", advice: "About as private as a consumer channel gets. The weak point is now the people, not the maths." },
  { min: 60, label: "Good", advice: "Content is protected in transit and at rest; close the remaining gap listed below." },
  { min: 35, label: "Partial", advice: "Something on the path can still read the message. Treat it as private from strangers, not from the provider." },
  { min: 0, label: "Weak", advice: "Assume the content is readable by parties other than you and the recipient." },
];

/** Who sits on the path, in order. */
export const HOP_TEMPLATES = [
  {
    id: "sender",
    label: "Your device",
    always: true,
    describe: () => "Plaintext exists here by definition — this is where the message is written and encrypted.",
  },
  {
    id: "localNetwork",
    label: "Your Wi-Fi, ISP or mobile carrier",
    always: true,
    describe: (channel) =>
      channel.transportEncrypted
        ? "Sees encrypted traffic plus who you connected to and when."
        : "Sees the message itself; nothing encrypts it on this leg.",
  },
  {
    id: "provider",
    label: "The provider's servers",
    always: true,
    describe: (channel) =>
      channel.e2ee
        ? "Holds ciphertext it has no key for, but still routes, timestamps and stores the metadata."
        : "Decrypts, stores and can read the full message. This is the hop end-to-end encryption removes.",
  },
  {
    id: "backup",
    label: "Cloud backup provider",
    always: false,
    describe: (channel) =>
      channel.encryptedBackup
        ? "Holds a backup only your passphrase opens."
        : "Holds a restorable copy of the conversation in a form the backup provider can open.",
  },
  {
    id: "legal",
    label: "A lawful request to the provider",
    always: true,
    describe: (channel) =>
      channel.e2ee
        ? "Can compel metadata — who, when, how often, from which addresses — but not content the provider cannot decrypt."
        : "Can compel the stored content itself, because the provider is holding a readable copy.",
  },
  {
    id: "recipientNetwork",
    label: "Their Wi-Fi, ISP or carrier",
    always: true,
    describe: (channel) =>
      channel.transportEncrypted ? "Sees encrypted traffic only." : "Sees the message itself.",
  },
  {
    id: "recipient",
    label: "Their device",
    always: true,
    describe: () => "Plaintext again — the message has to be readable for the recipient to read it.",
  },
  {
    id: "endpointExtra",
    label: "Whoever else reaches an endpoint",
    always: false,
    describe: () =>
      "Management software, malware or a person holding an unlocked device reads plaintext after decryption. No transport protection helps here.",
  },
];

/**
 * When something can read plaintext at an endpoint, the channel's own strength
 * stops being the deciding factor, so the band is capped no matter how good the
 * cryptography is. 59 is one below the "Good" threshold, leaving "Partial" as
 * the best available label.
 */
export const ENDPOINT_EXPOSED_BAND_CAP = 59;

export function bandFor(score, endpointExposed = false) {
  const effective = endpointExposed ? Math.min(score, ENDPOINT_EXPOSED_BAND_CAP) : score;
  return SCORE_BANDS.find((band) => effective >= band.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

export function channelById(id) {
  return CHANNELS.find((channel) => channel.id === id) || null;
}

/**
 * Walk the path.
 *
 * @param {{channelId:string, modifiers:Record<string,boolean>}} input
 */
export function analyseChannel(input = {}) {
  const channel = channelById(input.channelId);
  if (!channel) {
    return { error: "Pick a channel to trace — the answer depends entirely on which one you use." };
  }
  const modifiers = input.modifiers || {};
  const cloudBackup = Boolean(modifiers.cloudBackup);
  const endpointExposed =
    Boolean(modifiers.managedDevice) || Boolean(modifiers.deviceShared) || Boolean(modifiers.screenshots);

  const hops = HOP_TEMPLATES.filter((hop) => {
    if (hop.id === "backup") return cloudBackup;
    if (hop.id === "endpointExtra") return endpointExposed;
    return hop.always;
  }).map((hop) => {
    let contentReadable;
    switch (hop.id) {
      case "sender":
      case "recipient":
      case "endpointExtra":
        contentReadable = true;
        break;
      case "localNetwork":
      case "recipientNetwork":
        contentReadable = !channel.transportEncrypted;
        break;
      case "provider":
        contentReadable = !channel.e2ee;
        break;
      case "backup":
        contentReadable = !channel.encryptedBackup;
        break;
      case "legal":
        contentReadable = !channel.e2ee || (cloudBackup && !channel.encryptedBackup);
        break;
      default:
        contentReadable = false;
    }

    // Metadata escapes almost everywhere; only the endpoints and a sealed-sender
    // provider are exceptions worth drawing.
    const isEndpoint = hop.id === "sender" || hop.id === "recipient";
    const providerHidesSender = hop.id === "provider" && channel.metadataMinimisation;
    const metadataReadable = isEndpoint || !providerHidesSender;

    return {
      ...hop,
      contentReadable,
      metadataReadable,
      detail: hop.describe(channel),
      // Parties other than the two people actually talking.
      thirdParty: !isEndpoint,
    };
  });

  const readers = hops.filter((hop) => hop.contentReadable && hop.thirdParty);
  const metadataHolders = hops.filter((hop) => hop.metadataReadable && hop.thirdParty);

  const flags = {
    e2ee: channel.e2ee,
    forwardSecrecy: channel.forwardSecrecy,
    encryptedBackup: channel.encryptedBackup || !cloudBackup,
    keyVerification: channel.keyVerification,
    metadataMinimisation: channel.metadataMinimisation,
    endpointHygiene: !endpointExposed,
  };
  const earned = PROTECTIONS.filter((item) => flags[item.id]);
  const missing = PROTECTIONS.filter((item) => !flags[item.id]);
  const score = Math.min(100, earned.reduce((sum, item) => sum + item.weight, 0));

  return {
    channel,
    hops,
    score,
    band: bandFor(score, endpointExposed),
    bandCapped: endpointExposed && score > ENDPOINT_EXPOSED_BAND_CAP,
    earned,
    missing,
    readerCount: readers.length,
    readers,
    metadataCount: metadataHolders.length,
    cloudBackup,
    endpointExposed,
  };
}

/**
 * Compare the same modifiers across two channels, so the effect of switching is
 * an actual number rather than an impression.
 */
export function compareChannels(aId, bId, modifiers) {
  const a = analyseChannel({ channelId: aId, modifiers });
  const b = analyseChannel({ channelId: bId, modifiers });
  if (a.error || b.error) return { error: a.error || b.error };
  return {
    a,
    b,
    scoreDelta: b.score - a.score,
    readerDelta: b.readerCount - a.readerCount,
  };
}

/** Plain-text summary of one analysis. */
export function formatAnalysis(result) {
  if (!result || result.error) return "";
  const lines = [
    `Who can read this — ${result.channel.label}`,
    `Protection score: ${result.score}/100 (${result.band.label})`,
    `Third parties who can read the content: ${result.readerCount}`,
    `Third parties who can see the metadata: ${result.metadataCount}`,
    "",
    ...result.hops.map(
      (hop) =>
        `${hop.label}: content ${hop.contentReadable ? "READABLE" : "encrypted"}, metadata ${hop.metadataReadable ? "visible" : "hidden"}`,
    ),
  ];
  if (result.missing.length > 0) {
    lines.push("", "Missing protections:", ...result.missing.map((item) => `- ${item.label}`));
  }
  return lines.join("\n");
}
