/**
 * Minecraft multiplayer safety planner.
 *
 * Pure logic only: no React, no DOM, no clock reads.
 *
 * The step catalogue below mirrors the settings that actually exist in Minecraft
 * and in the Microsoft/Xbox account that Minecraft signs into. Menu paths are
 * quoted so a parent can follow them on the device.
 */

/**
 * Microsoft/Xbox treats an account as a child account below 13, matching the US
 * COPPA age threshold. Under-13 accounts must sit inside a Microsoft family
 * group and an adult has to approve online play and communication.
 */
export const CHILD_ACCOUNT_MAX_AGE = 12;

/**
 * Microsoft's family group holds one organiser plus members; Xbox privacy
 * settings for a child member can only be changed by an adult in that group.
 */
export const ADULT_CONSENT_MAX_AGE = 17;

/** Minecraft Realms hosts up to 10 players online at the same time. */
export const REALM_MAX_CONCURRENT_PLAYERS = 10;

/** Minimum age Microsoft allows for a self-managed (non-child) account in most regions. */
export const SELF_MANAGED_MIN_AGE = 13;

/** Score weight per tier. Essentials count more than nice-to-haves. */
export const TIER_WEIGHTS = { essential: 3, recommended: 2, optional: 1 };

export const EDITIONS = [
  { id: "bedrock", label: "Bedrock (console, mobile, Windows)" },
  { id: "java", label: "Java Edition (PC, Mac, Linux)" },
  { id: "both", label: "Both editions" },
];

export const PLAY_MODES = [
  { id: "solo", label: "Solo or split-screen only" },
  { id: "lan", label: "Local network with family in the house" },
  { id: "realm", label: "A private Realm with known friends" },
  { id: "public", label: "Public or featured community servers" },
];

/** How exposed each play mode is to strangers, before any settings are applied. */
export const PLAY_MODE_EXPOSURE = {
  solo: 0,
  lan: 1,
  realm: 2,
  public: 3,
};

/**
 * editions: which edition the step applies to.
 * modes:    which play modes the step applies to.
 * minAge / maxAge: inclusive age window in which the step is offered.
 */
export const STEPS = [
  {
    id: "child-account",
    title: "Sign in with a Microsoft child account inside your family group",
    where: "account.microsoft.com/family — Add a family member, then sign Minecraft in with that account",
    why: "Under-13 accounts start with online play and chat switched off, and only a parent in the family group can loosen them.",
    tier: "essential",
    editions: ["bedrock", "java", "both"],
    modes: ["solo", "lan", "realm", "public"],
    minAge: 3,
    maxAge: ADULT_CONSENT_MAX_AGE,
  },
  {
    id: "gamertag-anonymous",
    title: "Use a gamertag that gives nothing away",
    where: "Xbox app or account.xbox.com — Change gamertag (Xbox can generate one for you)",
    why: "Real name, school, town or birth year in a gamertag is the easiest way for a stranger to start a targeted conversation.",
    tier: "essential",
    editions: ["bedrock", "java", "both"],
    modes: ["solo", "lan", "realm", "public"],
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "xbox-multiplayer-privacy",
    title: "Set 'You can play with people outside of Xbox network' to Block or Friends",
    where: "account.xbox.com/Settings — Privacy & online safety > Xbox privacy > Others can see... / You can play with",
    why: "This single switch controls cross-network play and, on Bedrock, whether featured third-party servers load at all.",
    tier: "essential",
    editions: ["bedrock", "both"],
    modes: ["realm", "public", "lan", "solo"],
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "xbox-communication",
    title: "Limit 'Others can communicate with voice, text, or invites' to Friends",
    where: "account.xbox.com/Settings — Privacy & online safety > Xbox privacy > Communication & multiplayer",
    why: "Stops unknown players sending messages or party invites to the account, inside and outside Minecraft.",
    tier: "essential",
    editions: ["bedrock", "both"],
    modes: ["lan", "realm", "public"],
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "xbox-profile-visibility",
    title: "Hide the profile: real name, friends list and 'others can see if you are online'",
    where: "account.xbox.com/Settings — Privacy & online safety > Xbox privacy > Profile",
    why: "A hidden friends list and hidden real name make it much harder to trace the account to a school or neighbourhood.",
    tier: "recommended",
    editions: ["bedrock", "both"],
    modes: ["solo", "lan", "realm", "public"],
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "multiplayer-toggle-off",
    title: "Turn off 'Multiplayer Game' and 'Visible to LAN Players'",
    where: "Minecraft Bedrock — Settings > Multiplayer",
    why: "For a child who only plays alone, switching multiplayer off at the game level removes every stranger route in one move.",
    tier: "essential",
    editions: ["bedrock", "both"],
    modes: ["solo"],
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "featured-servers",
    title: "Decide about the Featured Servers tab before they find it",
    where: "Minecraft Bedrock — Play > Servers tab",
    why: "Featured servers are run by third parties with their own chat and moderation; blocking 'play with people outside Xbox network' removes the tab.",
    tier: "essential",
    editions: ["bedrock", "both"],
    modes: ["solo", "lan", "realm"],
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "chat-setting",
    title: "Set chat to Hidden or Commands-only, or turn on the profanity filter",
    where: "Java: Options > Chat Settings > Chat. Bedrock: Settings > General > Profile / chat and 'Filter profanity'",
    why: "Chat is where grooming and bullying happen. Hidden chat still lets the game work; the filter only catches words, not intent.",
    tier: "essential",
    editions: ["bedrock", "java", "both"],
    modes: ["lan", "realm", "public"],
    minAge: 3,
    maxAge: 15,
  },
  {
    id: "realm-owned-by-parent",
    title: "Own and pay for the Realm from a parent account",
    where: "Minecraft — Play > Realms > Create a Realm, signed in as the adult",
    why: `The Realm owner controls the member list, permissions and the subscription; a Realm holds up to ${REALM_MAX_CONCURRENT_PLAYERS} players online at once.`,
    tier: "essential",
    editions: ["bedrock", "java", "both"],
    modes: ["realm"],
    minAge: 3,
    maxAge: 15,
  },
  {
    id: "realm-invite-by-name",
    title: "Invite Realm members by gamertag, never by sharing the invite link",
    where: "Realm settings > Members > Invite player; use 'Reset invite link' if a link has been shared",
    why: "A Realm link forwarded into a group chat can be used by anyone who receives it until the link is reset.",
    tier: "essential",
    editions: ["bedrock", "java", "both"],
    modes: ["realm"],
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "realm-permissions",
    title: "Give friends Member or Visitor permissions, not Operator",
    where: "Realm settings > Members > per-player permission",
    why: "Visitors cannot build or use commands, so a fallout with a friend cannot end in a griefed world.",
    tier: "recommended",
    editions: ["bedrock", "java", "both"],
    modes: ["realm"],
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "server-vetting",
    title: "Vet each public server: published rules, active moderation, ideally a whitelist",
    where: "The server's own website or Discord, before adding it to the server list",
    why: "Moderation quality varies enormously between community servers and is the main thing that decides how safe chat is.",
    tier: "essential",
    editions: ["bedrock", "java", "both"],
    modes: ["public"],
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "report-and-mute",
    title: "Show them the in-game report, mute and block tools",
    where: "Java: social interactions screen (chat > player list). Bedrock: pause menu > player > Report",
    why: "A child who knows how to mute and report in the moment does not have to wait for an adult to be free.",
    tier: "recommended",
    editions: ["bedrock", "java", "both"],
    modes: ["lan", "realm", "public"],
    minAge: 6,
    maxAge: 17,
  },
  {
    id: "voice-chat-plan",
    title: "Agree where voice chat happens",
    where: "Party chat on Xbox, Discord, or a voice mod — each has its own privacy settings",
    why: "Minecraft has no built-in voice chat, so voice moves to another app whose settings you also need to lock to friends only.",
    tier: "recommended",
    editions: ["bedrock", "java", "both"],
    modes: ["realm", "public"],
    minAge: 6,
    maxAge: 17,
  },
  {
    id: "mods-from-trusted-sources",
    title: "Install mods, resource packs and launchers only from known sources",
    where: "CurseForge or Modrinth, installed by an adult account",
    why: "Third-party launchers and mods can re-enable chat, add unmoderated servers, or ship malware alongside the pack.",
    tier: "recommended",
    editions: ["java", "both"],
    modes: ["solo", "lan", "realm", "public"],
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "spend-limit",
    title: "Require approval for Minecoins and Marketplace purchases",
    where: "Microsoft Family Safety — Spending > 'Ask a parent'; remove the saved card from the child account",
    why: "Marketplace skins and coin packs are the usual route to surprise charges and to trading pressure from other players.",
    tier: "recommended",
    editions: ["bedrock", "both"],
    modes: ["solo", "lan", "realm", "public"],
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "screen-time",
    title: "Set a screen-time limit for Minecraft rather than for the whole device",
    where: "Microsoft Family Safety — Screen time > Apps and games",
    why: "An app-level limit ends the session predictably, which avoids the 'one more round, my friends are waiting' fight.",
    tier: "optional",
    editions: ["bedrock", "java", "both"],
    modes: ["solo", "lan", "realm", "public"],
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "activity-reporting",
    title: "Turn on weekly activity reporting",
    where: "Microsoft Family Safety — Activity reporting, emailed weekly",
    why: "Gives you the sites, apps and play time without reading over their shoulder, which teenagers tolerate far better.",
    tier: "optional",
    editions: ["bedrock", "java", "both"],
    modes: ["solo", "lan", "realm", "public"],
    minAge: 6,
    maxAge: 17,
  },
  {
    id: "two-step-verification",
    title: "Turn on two-step verification for the Microsoft account",
    where: "account.microsoft.com/security — Advanced security options",
    why: "Minecraft accounts with rare capes or names are actively traded, and account theft usually starts with a password reused elsewhere.",
    tier: "recommended",
    editions: ["bedrock", "java", "both"],
    modes: ["solo", "lan", "realm", "public"],
    minAge: 10,
    maxAge: 17,
  },
  {
    id: "no-personal-info-rule",
    title: "Agree the rule: no real name, school, photo or other apps with in-game friends",
    where: "A conversation, not a setting",
    why: "Most harm starts with a friendly player moving the chat to an app you have not configured. Naming that pattern in advance works better than a ban.",
    tier: "essential",
    editions: ["bedrock", "java", "both"],
    modes: ["lan", "realm", "public"],
    minAge: 5,
    maxAge: 17,
  },
];

export const BANDS = [
  { min: 90, label: "Locked down", tone: "success" },
  { min: 65, label: "Solid", tone: "success" },
  { min: 35, label: "Partial", tone: "warning" },
  { min: 0, label: "Wide open", tone: "danger" },
];

function bandFor(score) {
  return BANDS.find((band) => score >= band.min) || BANDS[BANDS.length - 1];
}

function editionMatches(step, edition) {
  if (edition === "both") return true;
  return step.editions.includes(edition);
}

/**
 * Build the applicable checklist and score it.
 *
 * @param {object} input
 * @param {number} input.childAge     age of the player in years
 * @param {string} input.edition      one of EDITIONS ids
 * @param {string} input.playMode     one of PLAY_MODES ids
 * @param {string[]} [input.completed] ids of steps already done
 * @returns {{error:string}|object}
 */
export function buildPlan({ childAge, edition, playMode, completed = [] } = {}) {
  const age = Number(childAge);
  if (!Number.isFinite(age)) return { error: "Enter the player's age in years." };
  if (age < 3 || age > 17) {
    return { error: "Enter an age between 3 and 17. Above 17 the account is no longer a child account." };
  }
  if (!EDITIONS.some((item) => item.id === edition)) {
    return { error: "Choose which edition of Minecraft they play." };
  }
  if (!PLAY_MODES.some((item) => item.id === playMode)) {
    return { error: "Choose how they play with other people." };
  }

  const doneSet = new Set(Array.isArray(completed) ? completed : []);

  const steps = STEPS.filter(
    (step) =>
      editionMatches(step, edition) &&
      step.modes.includes(playMode) &&
      age >= step.minAge &&
      age <= step.maxAge,
  ).map((step) => ({ ...step, weight: TIER_WEIGHTS[step.tier], done: doneSet.has(step.id) }));

  const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
  const doneWeight = steps.reduce((sum, step) => (step.done ? sum + step.weight : sum), 0);

  // A checklist with no applicable steps would divide by zero; guard it.
  const score = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0;

  const essentials = steps.filter((step) => step.tier === "essential");
  const essentialsMissing = essentials.filter((step) => !step.done).length;

  // The top band is only available once every essential step is done.
  let band = bandFor(score);
  if (essentialsMissing > 0 && band.label === "Locked down") band = BANDS[1];

  const needsFamilyGroup = age <= CHILD_ACCOUNT_MAX_AGE;
  const exposure = PLAY_MODE_EXPOSURE[playMode];

  return {
    steps,
    totalSteps: steps.length,
    doneSteps: steps.filter((step) => step.done).length,
    remaining: steps.filter((step) => !step.done),
    totalWeight,
    doneWeight,
    score,
    band: band.label,
    tone: band.tone,
    essentialsTotal: essentials.length,
    essentialsMissing,
    needsFamilyGroup,
    selfManagedAllowed: age >= SELF_MANAGED_MIN_AGE,
    exposure,
    maxRealmPlayers: REALM_MAX_CONCURRENT_PLAYERS,
  };
}
