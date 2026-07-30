/**
 * OAuth Scope Explainer — pure logic.
 *
 * Takes either a raw scope list ("openid email https://www.googleapis.com/auth/gmail.readonly")
 * or a full authorization-request URL, and explains every scope in plain language.
 *
 * No network. No DOM. No Date. Same input always gives the same output.
 *
 * Risk level is NOT a made-up number. Every catalogue entry declares four observable
 * properties and RISK_RUBRIC turns them into a level deterministically:
 *
 *   access       read | write | admin      what the token may do
 *   breadth      self | org                only the signed-in user, or every account in the org
 *   sensitivity  identity | metadata | content | communications | infrastructure | session
 *   narrow       true when the provider limits the grant to app-created / app-opened objects
 *   destructive  true when the grant includes permanent deletion or full control
 */

export const RISK_LEVELS = [
  { key: "low", rank: 1, label: "Low", blurb: "Identifies you. Grants no access to your data." },
  { key: "medium", rank: 2, label: "Medium", blurb: "Reads metadata, or writes inside a boundary the app itself created." },
  { key: "high", rank: 3, label: "High", blurb: "Reads or writes your actual content, mail, files or calendar." },
  { key: "critical", rank: 4, label: "Critical", blurb: "Full control, permanent deletion, or access to every account in the organisation." },
];

export const RISK_RUBRIC = [
  ["access = admin", "critical"],
  ["access = write and breadth = org", "critical"],
  ["access = write and sensitivity = content / communications / infrastructure", "high"],
  ["access = write, anything else", "medium"],
  ["access = read and breadth = org", "high"],
  ["access = read and sensitivity = content / communications / infrastructure", "high"],
  ["access = read and sensitivity = metadata / session", "medium"],
  ["access = read and sensitivity = identity", "low"],
  ["then: destructive = true raises the level one step, narrow = true lowers it one step", ""],
];

const rankToKey = (rank) => (RISK_LEVELS.find((item) => item.rank === rank) || RISK_LEVELS[0]).key;

export function levelForScope(entry) {
  const access = entry.access;
  const breadth = entry.breadth || "self";
  const sensitivity = entry.sensitivity || "metadata";
  const heavy = sensitivity === "content" || sensitivity === "communications" || sensitivity === "infrastructure";

  let rank;
  if (access === "admin") rank = 4;
  else if (access === "write") rank = breadth === "org" ? 4 : heavy ? 3 : 2;
  else rank = breadth === "org" || heavy ? 3 : sensitivity === "identity" ? 1 : 2;

  if (entry.destructive) rank += 1;
  if (entry.narrow) rank -= 1;
  if (rank > 4) rank = 4;
  if (rank < 1) rank = 1;
  return rankToKey(rank);
}

/* ------------------------------------------------------------------ catalogue */

const G = "https://www.googleapis.com/auth/";

const CATALOGUE_SOURCE = [
  // ---- OpenID Connect (RFC / OIDC core) ----
  ["openid", "OpenID Connect", "Sign you in", "Confirms who you are and returns an ID token. Grants no access to any data.", { access: "read", sensitivity: "identity" }],
  ["profile", "OpenID Connect", "Read your basic profile", "Name, picture, locale and username — the fields in the standard OIDC profile claim.", { access: "read", sensitivity: "identity" }],
  ["email", "OpenID Connect", "Read your email address", "The address itself and whether the provider has verified it. Not the mailbox.", { access: "read", sensitivity: "identity" }],
  ["address", "OpenID Connect", "Read your postal address", "The address claim from your account profile.", { access: "read", sensitivity: "metadata" }],
  ["phone", "OpenID Connect", "Read your phone number", "The phone_number claim and its verified flag.", { access: "read", sensitivity: "metadata" }],
  ["offline_access", "OpenID Connect", "Keep access after you close the app", "Issues a refresh token, so the app can keep acting as you for weeks or months without you being present. Revoking it is a separate step from signing out.", { access: "read", sensitivity: "session" }],

  // ---- Google ----
  [`${G}userinfo.email`, "Google", "Read your Google email address", "The address on the account, nothing inside the mailbox.", { access: "read", sensitivity: "identity" }],
  [`${G}userinfo.profile`, "Google", "Read your Google profile", "Name, profile photo and public profile fields.", { access: "read", sensitivity: "identity" }],
  ["https://mail.google.com/", "Google", "Full control of your Gmail account", "Read, compose, send and permanently delete every message and thread, including archives. This is the widest mail grant Google offers.", { access: "write", sensitivity: "communications", destructive: true }],
  [`${G}gmail.readonly`, "Google", "Read all of your mail", "Every message, thread, label and attachment in the mailbox — past and future.", { access: "read", sensitivity: "communications" }],
  [`${G}gmail.send`, "Google", "Send mail as you", "Sends messages from your address. Recipients see them as coming from you. Cannot read the mailbox.", { access: "write", sensitivity: "communications" }],
  [`${G}gmail.modify`, "Google", "Read and change all mail except permanent deletion", "Read everything, label, archive and move to trash. Permanent deletion is excluded.", { access: "write", sensitivity: "communications" }],
  [`${G}gmail.compose`, "Google", "Create, read and send drafts", "Manages drafts and sends mail as you.", { access: "write", sensitivity: "communications" }],
  [`${G}gmail.metadata`, "Google", "Read mail headers only", "Sender, recipients, subject line and labels — not message bodies or attachments.", { access: "read", sensitivity: "metadata" }],
  [`${G}drive`, "Google", "Full control of your Google Drive", "See, edit, create and permanently delete every file in Drive, including files other apps put there.", { access: "write", sensitivity: "content", destructive: true }],
  [`${G}drive.readonly`, "Google", "Read every file in your Drive", "Downloads the content of all your Drive files, not just the ones for this app.", { access: "read", sensitivity: "content" }],
  [`${G}drive.file`, "Google", "Work with files this app creates or you open with it", "Per-file access. The app cannot see anything else in Drive. This is the scope a well-behaved Drive integration asks for.", { access: "write", sensitivity: "content", narrow: true }],
  [`${G}drive.appdata`, "Google", "Store data in a hidden app folder", "A private folder only this app can see. No access to your own files.", { access: "write", sensitivity: "metadata", narrow: true }],
  [`${G}drive.metadata.readonly`, "Google", "List your files without reading them", "File names, folders, owners and sharing settings — not the contents.", { access: "read", sensitivity: "metadata" }],
  [`${G}calendar`, "Google", "Read and change all your calendars", "Full read/write on every calendar and event, including calendars shared with you.", { access: "write", sensitivity: "content" }],
  [`${G}calendar.readonly`, "Google", "Read all your calendars", "Every event, attendee list and description across all your calendars.", { access: "read", sensitivity: "content" }],
  [`${G}calendar.events`, "Google", "Read and change events on your calendars", "Events only — cannot create or delete whole calendars.", { access: "write", sensitivity: "content" }],
  [`${G}contacts`, "Google", "Read and change your contacts", "Full read/write on your address book.", { access: "write", sensitivity: "content" }],
  [`${G}contacts.readonly`, "Google", "Read your contacts", "Names, addresses, phone numbers and notes for everyone in your address book — data about other people, not just you.", { access: "read", sensitivity: "content" }],
  [`${G}spreadsheets`, "Google", "Read and change all your Google Sheets", "Every spreadsheet in the account, not only the ones you share with the app.", { access: "write", sensitivity: "content" }],
  [`${G}spreadsheets.readonly`, "Google", "Read all your Google Sheets", "Contents of every spreadsheet on the account.", { access: "read", sensitivity: "content" }],
  [`${G}documents`, "Google", "Read and change all your Google Docs", "Full read/write on every document.", { access: "write", sensitivity: "content" }],
  [`${G}photoslibrary.readonly`, "Google", "Read your Google Photos library", "Downloads photos, videos and their location metadata.", { access: "read", sensitivity: "content" }],
  [`${G}youtube.readonly`, "Google", "Read your YouTube account", "Channels, playlists and subscriptions.", { access: "read", sensitivity: "metadata" }],
  [`${G}youtube.force-ssl`, "Google", "Manage your YouTube account", "Upload, edit and delete videos, playlists and comments on your channel.", { access: "write", sensitivity: "content", destructive: true }],
  [`${G}cloud-platform`, "Google", "Full control of your Google Cloud projects", "Everything your account can do in Google Cloud: create and destroy resources, read storage buckets, change IAM. Treat this as handing over the account.", { access: "admin", breadth: "org", sensitivity: "infrastructure", destructive: true }],
  [`${G}devstorage.read_only`, "Google", "Read your Cloud Storage buckets", "Downloads objects from every bucket the account can see.", { access: "read", sensitivity: "infrastructure" }],
  [`${G}admin.directory.user`, "Google", "Manage every user in your Workspace domain", "Create, suspend and delete accounts across the whole organisation, and reset passwords.", { access: "admin", breadth: "org", sensitivity: "infrastructure", destructive: true }],
  [`${G}admin.directory.user.readonly`, "Google", "Read every user in your Workspace domain", "The full staff directory, including suspended accounts and org structure.", { access: "read", breadth: "org", sensitivity: "metadata" }],

  // ---- Microsoft Graph ----
  ["User.Read", "Microsoft Graph", "Read your own profile", "Your name, photo, job title and email address. Nothing about anyone else.", { access: "read", sensitivity: "identity" }],
  ["User.ReadBasic.All", "Microsoft Graph", "Read the basic profile of every user in the tenant", "Names, photos and addresses for the whole directory.", { access: "read", breadth: "org", sensitivity: "metadata" }],
  ["User.Read.All", "Microsoft Graph", "Read the full profile of every user in the tenant", "Complete directory records including manager chains and contact details.", { access: "read", breadth: "org", sensitivity: "metadata" }],
  ["User.ReadWrite.All", "Microsoft Graph", "Read and change every user in the tenant", "Edit any account in the directory. Normally requires an admin to consent.", { access: "write", breadth: "org", sensitivity: "infrastructure" }],
  ["Mail.Read", "Microsoft Graph", "Read your mail", "Every message and attachment in your mailbox.", { access: "read", sensitivity: "communications" }],
  ["Mail.ReadWrite", "Microsoft Graph", "Read, change and delete your mail", "Full mailbox control including moving and deleting messages.", { access: "write", sensitivity: "communications", destructive: true }],
  ["Mail.Send", "Microsoft Graph", "Send mail as you", "Sends from your address without reading the mailbox.", { access: "write", sensitivity: "communications" }],
  ["Mail.Read.Shared", "Microsoft Graph", "Read your mail and mail shared with you", "Extends mailbox read to delegated and shared mailboxes.", { access: "read", sensitivity: "communications" }],
  ["Mail.ReadWrite.All", "Microsoft Graph", "Read and change mail in every mailbox", "Tenant-wide mailbox access. One of the most abused Graph permissions in real breaches.", { access: "write", breadth: "org", sensitivity: "communications", destructive: true }],
  ["Files.Read", "Microsoft Graph", "Read your OneDrive files", "Downloads the contents of your own drive.", { access: "read", sensitivity: "content" }],
  ["Files.ReadWrite", "Microsoft Graph", "Read and change your OneDrive files", "Create, edit and delete files in your drive.", { access: "write", sensitivity: "content" }],
  ["Files.Read.All", "Microsoft Graph", "Read all files you can access", "Your drive plus every SharePoint site and shared drive you have rights to.", { access: "read", breadth: "org", sensitivity: "content" }],
  ["Files.ReadWrite.All", "Microsoft Graph", "Read and change all files you can access", "Write access across OneDrive and SharePoint.", { access: "write", breadth: "org", sensitivity: "content" }],
  ["Sites.Read.All", "Microsoft Graph", "Read items in all SharePoint sites", "Every site collection the account can reach.", { access: "read", breadth: "org", sensitivity: "content" }],
  ["Sites.ReadWrite.All", "Microsoft Graph", "Edit items in all SharePoint sites", "Write access to every site collection.", { access: "write", breadth: "org", sensitivity: "content" }],
  ["Calendars.Read", "Microsoft Graph", "Read your calendars", "Every event, attendee and body.", { access: "read", sensitivity: "content" }],
  ["Calendars.ReadWrite", "Microsoft Graph", "Read and change your calendars", "Create, edit and delete events on your behalf.", { access: "write", sensitivity: "content" }],
  ["Contacts.Read", "Microsoft Graph", "Read your contacts", "Your address book, which is data about other people.", { access: "read", sensitivity: "content" }],
  ["Directory.Read.All", "Microsoft Graph", "Read the whole directory", "Users, groups, roles, devices and app registrations across the tenant.", { access: "read", breadth: "org", sensitivity: "infrastructure" }],
  ["Directory.ReadWrite.All", "Microsoft Graph", "Read and write the whole directory", "Change directory objects tenant-wide. A stepping stone to privilege escalation.", { access: "admin", breadth: "org", sensitivity: "infrastructure" }],
  ["Group.ReadWrite.All", "Microsoft Graph", "Read and change all groups", "Create groups and change membership, which changes who can see what.", { access: "write", breadth: "org", sensitivity: "infrastructure" }],
  ["Chat.Read", "Microsoft Graph", "Read your Teams chats", "Message history in your one-to-one and group chats.", { access: "read", sensitivity: "communications" }],
  ["ChannelMessage.Read.All", "Microsoft Graph", "Read messages in all Teams channels", "Tenant-wide channel history.", { access: "read", breadth: "org", sensitivity: "communications" }],

  // ---- GitHub ----
  ["repo", "GitHub", "Full control of all your repositories", "Read and write code, issues, settings, webhooks, deploy keys and secrets in every private and public repository you can reach — including organisation repositories.", { access: "write", sensitivity: "infrastructure", destructive: true }],
  ["public_repo", "GitHub", "Write access to your public repositories", "Push code and manage issues in public repositories only.", { access: "write", sensitivity: "infrastructure" }],
  ["repo:status", "GitHub", "Read and write commit statuses", "Commit status checks only. No code access.", { access: "write", sensitivity: "metadata", narrow: true }],
  ["repo_deployment", "GitHub", "Read and write deployment statuses", "Deployment records only. No code access.", { access: "write", sensitivity: "metadata", narrow: true }],
  ["delete_repo", "GitHub", "Delete repositories", "Permanently removes repositories you administer.", { access: "admin", sensitivity: "infrastructure", destructive: true }],
  ["workflow", "GitHub", "Add and change GitHub Actions workflow files", "Lets the app commit workflow YAML, which runs code with your repository secrets.", { access: "write", sensitivity: "infrastructure" }],
  ["admin:org", "GitHub", "Full control of your organisations", "Manage members, teams, roles and org settings.", { access: "admin", breadth: "org", sensitivity: "infrastructure", destructive: true }],
  ["read:org", "GitHub", "Read organisation membership", "Teams and members of the organisations you belong to.", { access: "read", breadth: "org", sensitivity: "metadata" }],
  ["admin:repo_hook", "GitHub", "Full control of repository webhooks", "Create webhooks that receive a copy of repository events.", { access: "write", sensitivity: "infrastructure" }],
  ["user", "GitHub", "Read and change your profile", "Updates your public profile and reads all your profile data including private email addresses.", { access: "write", sensitivity: "identity" }],
  ["read:user", "GitHub", "Read your profile", "Your public profile data.", { access: "read", sensitivity: "identity" }],
  ["user:email", "GitHub", "Read your email addresses", "Including addresses you have marked private.", { access: "read", sensitivity: "identity" }],
  ["gist", "GitHub", "Write access to your gists", "Create and edit gists, including secret ones.", { access: "write", sensitivity: "content", narrow: true }],
  ["notifications", "GitHub", "Read your notifications", "Notification threads and their contents.", { access: "read", sensitivity: "metadata" }],
  ["write:packages", "GitHub", "Upload packages to GitHub Packages", "Publishes packages under your account or org.", { access: "write", sensitivity: "infrastructure" }],
  ["read:packages", "GitHub", "Download packages from GitHub Packages", "Reads published package contents.", { access: "read", sensitivity: "metadata" }],

  // ---- Slack ----
  ["channels:read", "Slack", "List public channels", "Channel names, topics and membership counts. Not messages.", { access: "read", sensitivity: "metadata" }],
  ["channels:history", "Slack", "Read message history in public channels", "Every message in the public channels the app is added to, including files shared in them.", { access: "read", sensitivity: "communications" }],
  ["groups:history", "Slack", "Read message history in private channels", "Private channel conversations.", { access: "read", sensitivity: "communications" }],
  ["im:history", "Slack", "Read direct message history", "Your one-to-one DMs.", { access: "read", sensitivity: "communications" }],
  ["chat:write", "Slack", "Post messages", "Sends messages into the workspace as the app or as you.", { access: "write", sensitivity: "communications" }],
  ["files:read", "Slack", "Read files shared in the workspace", "Downloads uploaded files and their contents.", { access: "read", sensitivity: "content" }],
  ["users:read", "Slack", "List workspace members", "Names, avatars and time zones.", { access: "read", breadth: "org", sensitivity: "metadata" }],
  ["users:read.email", "Slack", "Read members' email addresses", "Adds email addresses to the member list — personal data about colleagues.", { access: "read", breadth: "org", sensitivity: "metadata" }],
  ["admin", "Slack", "Workspace administration", "Legacy scope granting administrative actions across the workspace.", { access: "admin", breadth: "org", sensitivity: "infrastructure", destructive: true }],
];

export const SCOPE_CATALOGUE = CATALOGUE_SOURCE.reduce((map, row) => {
  const [scope, provider, title, description, props] = row;
  map[scope] = {
    scope,
    provider,
    title,
    description,
    access: props.access,
    breadth: props.breadth || "self",
    sensitivity: props.sensitivity,
    narrow: Boolean(props.narrow),
    destructive: Boolean(props.destructive),
  };
  return map;
}, {});

/** Scope A makes scope B pointless — asking for both is over-collection. */
const SUPERSEDES = {
  "https://mail.google.com/": [`${G}gmail.readonly`, `${G}gmail.send`, `${G}gmail.modify`, `${G}gmail.compose`, `${G}gmail.metadata`],
  [`${G}gmail.modify`]: [`${G}gmail.readonly`, `${G}gmail.metadata`],
  [`${G}drive`]: [`${G}drive.readonly`, `${G}drive.file`, `${G}drive.appdata`, `${G}drive.metadata.readonly`],
  [`${G}drive.readonly`]: [`${G}drive.metadata.readonly`],
  [`${G}calendar`]: [`${G}calendar.readonly`, `${G}calendar.events`],
  [`${G}contacts`]: [`${G}contacts.readonly`],
  [`${G}spreadsheets`]: [`${G}spreadsheets.readonly`],
  [`${G}cloud-platform`]: [`${G}devstorage.read_only`],
  [`${G}admin.directory.user`]: [`${G}admin.directory.user.readonly`],
  "User.ReadWrite.All": ["User.Read.All", "User.ReadBasic.All", "User.Read"],
  "User.Read.All": ["User.ReadBasic.All"],
  "Mail.ReadWrite.All": ["Mail.ReadWrite", "Mail.Read", "Mail.Read.Shared"],
  "Mail.ReadWrite": ["Mail.Read"],
  "Files.ReadWrite.All": ["Files.Read.All", "Files.ReadWrite", "Files.Read"],
  "Files.Read.All": ["Files.Read"],
  "Sites.ReadWrite.All": ["Sites.Read.All"],
  "Calendars.ReadWrite": ["Calendars.Read"],
  "Directory.ReadWrite.All": ["Directory.Read.All"],
  repo: ["public_repo", "repo:status", "repo_deployment"],
  "admin:org": ["read:org"],
  user: ["read:user", "user:email"],
};

/* ------------------------------------------------------- pattern inference */

const PATTERNS = [
  {
    test: (s) => /^https:\/\/www\.googleapis\.com\/auth\/[\w.\-]+$/.test(s),
    build(scope) {
      const tail = scope.slice(G.length);
      const readonly = /\.(readonly|read_only)$/.test(tail);
      const api = tail.split(".")[0];
      return {
        provider: "Google",
        title: `${readonly ? "Read" : "Read and change"} your ${api} data`,
        description: `Not in the built-in catalogue. The URL form is a Google API scope for the "${api}" API; the ${readonly ? "“readonly” suffix means it cannot write" : "absence of a “readonly” suffix means it can write"}. Check Google's OAuth scope list for the exact wording of the consent screen.`,
        access: readonly ? "read" : "write",
        breadth: "self",
        sensitivity: "content",
      };
    },
  },
  {
    test: (s) => /^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)*\.(Read|ReadBasic|ReadWrite|Create|Send|Manage|Selected)(\.(All|Shared))?$/.test(s),
    build(scope) {
      const parts = scope.split(".");
      const suffixAll = scope.endsWith(".All");
      const verbIndex = suffixAll || scope.endsWith(".Shared") ? parts.length - 2 : parts.length - 1;
      const verb = parts[verbIndex];
      const resource = parts.slice(0, verbIndex).join(".");
      const write = verb === "ReadWrite" || verb === "Create" || verb === "Send" || verb === "Manage";
      return {
        provider: "Microsoft Graph",
        title: `${write ? "Read and change" : "Read"} ${resource}${suffixAll ? " across the whole tenant" : ""}`,
        description: `Not in the built-in catalogue. It follows the Microsoft Graph "Resource.Verb[.All]" naming pattern: the "${verb}" verb means ${write ? "write access" : "read-only access"}${suffixAll ? ', and the ".All" suffix means every object of that type in the tenant, not just yours' : ""}. Confirm the exact wording in the Graph permissions reference.`,
        access: write ? "write" : "read",
        breadth: suffixAll ? "org" : "self",
        sensitivity: "content",
      };
    },
  },
  {
    test: (s) => /^(admin|write|read):[a-z_]+$/.test(s),
    build(scope) {
      const [verb, resource] = scope.split(":");
      return {
        provider: "GitHub",
        title: `${verb === "admin" ? "Full control of" : verb === "write" ? "Write access to" : "Read access to"} ${resource.replace(/_/g, " ")}`,
        description: `Not in the built-in catalogue. It follows GitHub's "verb:resource" scope naming, so the "${verb}" prefix sets the level of access to ${resource.replace(/_/g, " ")}. Check GitHub's scopes documentation for the precise grant.`,
        access: verb === "admin" ? "admin" : verb === "write" ? "write" : "read",
        breadth: resource === "org" ? "org" : "self",
        sensitivity: "infrastructure",
      };
    },
  },
  {
    test: (s) => /^[a-z][a-z0-9_]*(\.[a-z]+)?:(read|write|history|read\.email)$/.test(s),
    build(scope) {
      const [resource, verb] = scope.split(":");
      const write = verb === "write";
      return {
        provider: "Slack",
        title: `${write ? "Write" : "Read"} ${resource}`,
        description: `Not in the built-in catalogue. It follows Slack's "resource:verb" scope naming, so this grants ${write ? "write" : "read"} access to ${resource}. Check Slack's scope reference for the precise grant.`,
        access: write ? "write" : "read",
        breadth: "self",
        sensitivity: verb === "history" ? "communications" : "metadata",
      };
    },
  },
];

function describeScope(raw) {
  const known = SCOPE_CATALOGUE[raw];
  if (known) return { ...known, source: "catalogue", level: levelForScope(known) };

  for (const pattern of PATTERNS) {
    if (pattern.test(raw)) {
      const built = { scope: raw, narrow: false, destructive: false, ...pattern.build(raw) };
      return { ...built, source: "pattern", level: levelForScope(built) };
    }
  }

  return {
    scope: raw,
    provider: "Unknown",
    title: "Not recognised",
    description:
      "This string is not in the catalogue and does not match a known provider naming pattern, so no risk level is assigned. Look it up in the provider's own scope reference before consenting — an unexplained scope on a consent screen is itself a reason to stop.",
    access: "unknown",
    breadth: "unknown",
    sensitivity: "unknown",
    narrow: false,
    destructive: false,
    source: "unknown",
    level: "unknown",
  };
}

/* ------------------------------------------------------------ URL parsing */

function parseQuery(text) {
  const params = [];
  const queryStart = text.indexOf("?");
  if (queryStart === -1) return params;
  const hashStart = text.indexOf("#", queryStart);
  const query = text.slice(queryStart + 1, hashStart === -1 ? text.length : hashStart);
  for (const pair of query.split("&")) {
    if (!pair) continue;
    const eq = pair.indexOf("=");
    const rawKey = eq === -1 ? pair : pair.slice(0, eq);
    const rawValue = eq === -1 ? "" : pair.slice(eq + 1);
    let value = rawValue.replace(/\+/g, " ");
    try {
      value = decodeURIComponent(value);
    } catch {
      /* keep the undecoded value rather than throwing on a bad escape */
    }
    params.push({ key: decodeURIComponent(rawKey), value });
  }
  return params;
}

const FLOW_LABELS = {
  response_type: "Response type",
  client_id: "Client ID",
  redirect_uri: "Redirect URI",
  state: "State",
  nonce: "Nonce",
  code_challenge: "PKCE challenge",
  code_challenge_method: "PKCE method",
  access_type: "Access type (Google)",
  prompt: "Prompt",
  audience: "Audience",
  resource: "Resource",
  login_hint: "Login hint",
};

function analyseFlow(url, params) {
  const get = (key) => {
    const hit = params.find((item) => item.key === key);
    return hit ? hit.value : "";
  };
  const findings = [];
  const responseType = get("response_type");
  const redirectUri = get("redirect_uri");

  if (!responseType) {
    findings.push(["warn", "No response_type", "The authorization endpoint requires response_type. Without it the request is not a valid OAuth 2.0 authorization request."]);
  } else if (/\btoken\b/.test(responseType)) {
    findings.push(["fail", "Implicit flow", `response_type=${responseType} returns an access token in the URL fragment. The implicit grant is removed in OAuth 2.1 and discouraged since RFC 9700 — tokens end up in browser history, referrers and logs. Use response_type=code with PKCE.`]);
  } else if (responseType === "code") {
    findings.push(["pass", "Authorization code flow", "response_type=code keeps the token off the front channel, which is the current recommendation."]);
  }

  const challenge = get("code_challenge");
  const method = get("code_challenge_method");
  if (!challenge) {
    findings.push(["fail", "No PKCE", "There is no code_challenge parameter. RFC 9700 requires PKCE for every authorization-code request, public or confidential client, to stop an intercepted code being redeemed by an attacker."]);
  } else if (method === "S256") {
    findings.push(["pass", "PKCE with S256", "code_challenge_method=S256 sends only the SHA-256 hash of the verifier, which is the required method."]);
  } else if (method === "plain") {
    findings.push(["fail", "PKCE downgraded to plain", "code_challenge_method=plain sends the verifier itself, so anyone who sees the authorization request can replay the code. Only S256 is acceptable."]);
  } else {
    findings.push(["warn", "PKCE method not stated", "A code_challenge is present but code_challenge_method is missing, so the server defaults to plain. Set it to S256 explicitly."]);
  }

  if (!get("state")) {
    findings.push(["warn", "No state parameter", "state is the CSRF defence for the redirect: without it, an attacker can feed you their own authorization code and link their account to your session. PKCE does not replace it."]);
  } else {
    findings.push(["pass", "State present", "state is echoed back to the redirect URI so the client can reject responses it did not start."]);
  }

  const scopeValue = get("scope");
  if (/\bopenid\b/.test(scopeValue) && !get("nonce") && /\bid_token\b/.test(responseType)) {
    findings.push(["warn", "No nonce on an OIDC request", "id_token is requested without a nonce, so the ID token cannot be bound to this authorization request."]);
  }

  if (redirectUri) {
    if (/^http:\/\/(?!localhost|127\.0\.0\.1|\[::1\])/i.test(redirectUri)) {
      findings.push(["fail", "Plaintext redirect URI", `redirect_uri=${redirectUri} is plain HTTP to a non-loopback host, so the authorization code travels unencrypted.`]);
    } else if (/^urn:ietf:wg:oauth:2\.0:oob/.test(redirectUri)) {
      findings.push(["fail", "Deprecated out-of-band redirect", "The oob redirect (copy the code by hand) was shut off by Google and is disallowed by current best practice."]);
    } else if (redirectUri.includes("*")) {
      findings.push(["fail", "Wildcard redirect URI", "Wildcards in redirect_uri let an attacker redirect the code to a host they control. Registered redirect URIs must match exactly."]);
    } else {
      findings.push(["pass", "Redirect URI looks specific", "It is an exact HTTPS or loopback URI, which is what the authorization server should be matching against."]);
    }
  } else {
    findings.push(["warn", "No redirect_uri", "The request relies on the single URI registered for the client. That is allowed, but it makes the request harder to review."]);
  }

  if (get("access_type") === "offline" || /\boffline_access\b/.test(scopeValue)) {
    findings.push(["warn", "Long-lived access requested", "A refresh token will be issued, so the app can keep using these scopes long after you close the tab. Revoke it from the provider's account page, not by signing out of the app."]);
  }

  if (!get("client_id")) {
    findings.push(["warn", "No client_id", "Without client_id the authorization server cannot say which app is asking, and neither can you."]);
  }

  const endpoint = url.split("?")[0];
  if (/^http:\/\//i.test(endpoint)) {
    findings.push(["fail", "Plaintext authorization endpoint", "The authorization request itself is sent over HTTP."]);
  }

  const shown = params
    .filter((item) => item.key !== "scope")
    .map((item) => ({ key: item.key, label: FLOW_LABELS[item.key] || item.key, value: item.value }));

  return {
    endpoint,
    params: shown,
    findings: findings.map(([status, title, detail]) => ({ status, title, detail })),
  };
}

/* ------------------------------------------------------------------ public */

export function splitScopes(text) {
  return text
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * @param {string} input scope list or full authorization URL
 * @returns {{error:string}|object}
 */
export function explainScopes(input) {
  if (typeof input !== "string" || !input.trim()) {
    return { error: "Paste a scope list or a full authorization URL to explain." };
  }

  const text = input.trim();
  const isUrl = /^https?:\/\//i.test(text);
  let scopeText = text;
  let flow = null;

  if (isUrl) {
    const params = parseQuery(text);
    const scopeParam = params.find((item) => item.key === "scope" || item.key === "scopes");
    if (!scopeParam || !scopeParam.value.trim()) {
      return { error: "That URL has no scope parameter, so there is nothing to explain. Paste the full authorization URL including ?scope=…, or paste the scope list on its own." };
    }
    scopeText = scopeParam.value;
    flow = analyseFlow(text, params);
  }

  const rawScopes = splitScopes(scopeText);
  if (!rawScopes.length) {
    return { error: "No scopes found. Separate them with spaces, commas or new lines." };
  }

  const seen = new Set();
  const duplicates = [];
  const unique = [];
  for (const scope of rawScopes) {
    if (seen.has(scope)) {
      if (!duplicates.includes(scope)) duplicates.push(scope);
      continue;
    }
    seen.add(scope);
    unique.push(scope);
  }

  const scopes = unique.map(describeScope);

  const counts = { low: 0, medium: 0, high: 0, critical: 0, unknown: 0 };
  for (const item of scopes) counts[item.level] += 1;

  const ranked = scopes
    .filter((item) => item.level !== "unknown")
    .map((item) => RISK_LEVELS.find((level) => level.key === item.level).rank);
  const highest = ranked.length ? rankToKey(Math.max(...ranked)) : "unknown";

  const redundant = [];
  for (const scope of unique) {
    const covered = SUPERSEDES[scope];
    if (!covered) continue;
    for (const other of covered) {
      if (seen.has(other)) redundant.push({ scope: other, supersededBy: scope });
    }
  }

  const orgWide = scopes.filter((item) => item.breadth === "org").map((item) => item.scope);
  const destructive = scopes.filter((item) => item.destructive).map((item) => item.scope);

  return {
    mode: isUrl ? "url" : "list",
    scopes,
    duplicates,
    redundant,
    orgWide,
    destructive,
    summary: {
      total: unique.length,
      counts,
      highest,
      recognised: scopes.filter((item) => item.source === "catalogue").length,
      inferred: scopes.filter((item) => item.source === "pattern").length,
      unrecognised: counts.unknown,
    },
    flow,
  };
}

export const PROVIDERS = Array.from(new Set(CATALOGUE_SOURCE.map((row) => row[1])));

const LEVEL_LABEL = RISK_LEVELS.reduce((map, item) => {
  map[item.key] = item.label;
  return map;
}, { unknown: "Unrecognised" });

export function levelLabel(key) {
  return LEVEL_LABEL[key] || "Unrecognised";
}

/** Plain-text report for the copy button. Pure string building. */
export function formatScopeReport(result) {
  if (!result || result.error) return "";
  const lines = ["OAuth scope review", ""];
  const { counts } = result.summary;
  lines.push(`Scopes requested: ${result.summary.total}`);
  lines.push(
    `Highest level: ${levelLabel(result.summary.highest)}  (critical ${counts.critical}, high ${counts.high}, medium ${counts.medium}, low ${counts.low}, unrecognised ${counts.unknown})`,
  );
  lines.push("");

  for (const item of result.scopes) {
    lines.push(`[${levelLabel(item.level).toUpperCase()}] ${item.scope}`);
    lines.push(`  ${item.provider} — ${item.title}`);
    lines.push(`  ${item.description}`);
    lines.push("");
  }

  if (result.redundant.length) {
    lines.push("Redundant requests:");
    for (const item of result.redundant) lines.push(`  ${item.scope} is already covered by ${item.supersededBy}`);
    lines.push("");
  }
  if (result.duplicates.length) {
    lines.push(`Listed more than once: ${result.duplicates.join(", ")}`);
    lines.push("");
  }
  if (result.flow) {
    lines.push(`Authorization request: ${result.flow.endpoint}`);
    for (const finding of result.flow.findings) {
      lines.push(`  [${finding.status.toUpperCase()}] ${finding.title} — ${finding.detail}`);
    }
    lines.push("");
  }
  lines.push("Levels come from a published rubric over each scope's access, breadth and sensitivity.");
  lines.push("Nothing was sent anywhere; the review ran in the browser.");
  return lines.join("\n");
}
