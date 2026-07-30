/**
 * URL tracking-parameter stripper.
 *
 * Pure string handling — no React, no DOM, no network. The query is rebuilt by
 * splitting on "&" rather than through URLSearchParams, so the encoding of the
 * parameters that survive is byte-for-byte what you pasted.
 */

/**
 * Tracking parameters grouped by who reads them. Everything here is telemetry:
 * removing it changes who is credited for the click, never which page loads.
 */
export const TRACKING_GROUPS = [
  {
    id: "utm",
    label: "Campaign tags (UTM)",
    note: "Read by analytics platforms to attribute a visit to a campaign. Originally from Urchin, the product Google bought and turned into Analytics.",
    params: [
      "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id",
      "utm_name", "utm_cid", "utm_reader", "utm_referrer", "utm_source_platform",
      "utm_creative_format", "utm_marketing_tactic", "utm_pubreferrer", "utm_swu", "utm_brand",
    ],
  },
  {
    id: "google",
    label: "Google advertising",
    note: "Click identifiers written by Google Ads. gclid ties the visit to a specific ad click and is matched back to your Ads account.",
    params: ["gclid", "gclsrc", "gbraid", "wbraid", "dclid", "gad_source", "gad_campaignid", "srsltid", "gs_l", "ved", "ei", "gi"],
  },
  {
    id: "meta",
    label: "Meta / Facebook / Instagram",
    note: "fbclid is the Facebook Click Identifier; igshid and igsh identify an Instagram share. They let the platform join the visit to the profile that clicked.",
    params: ["fbclid", "fb_action_ids", "fb_action_types", "fb_ref", "fb_source", "igshid", "igsh", "ig_rid", "mibextid"],
  },
  {
    id: "microsoft",
    label: "Microsoft and Bing",
    note: "msclkid is the Microsoft Click ID used by Bing Ads for conversion matching.",
    params: ["msclkid", "mc_cid_ms", "cvid", "form", "sk", "sp", "sc", "qs", "pq"],
  },
  {
    id: "social",
    label: "Other social platforms",
    note: "Per-platform click and share identifiers from X, TikTok, LinkedIn, Reddit, Pinterest and Snapchat.",
    params: [
      "twclid", "ttclid", "tt_medium", "tt_content", "li_fat_id", "trk", "trkCampaign",
      "rdt_cid", "share_id", "$deep_link", "epik", "ScCid", "guccounter", "guce_referrer", "guce_referrer_sig",
    ],
  },
  {
    id: "email",
    label: "Email marketing",
    note: "These are the most personal of the lot: mc_eid, vero_id and similar identify the individual recipient, so a link you forward can reveal which subscriber you are.",
    params: [
      "mc_cid", "mc_eid", "_hsenc", "_hsmi", "hsCtaTracking", "__hssc", "__hstc", "__hsfp",
      "mkt_tok", "vero_id", "vero_conv", "ml_subscriber", "ml_subscriber_hash", "oly_anon_id", "oly_enc_id",
      "_ke", "ck_subscriber_id", "sc_customer", "sc_channel", "sc_campaign", "sc_publisher", "sc_detail", "sc_content",
      "__s", "elqTrackId", "elqTrack", "assetType", "recipient_id",
    ],
  },
  {
    id: "analytics",
    label: "Self-hosted and other analytics",
    note: "Matomo (formerly Piwik), Yandex, Adobe and similar platforms use their own campaign parameter names.",
    params: [
      "pk_campaign", "pk_kwd", "pk_keyword", "pk_medium", "pk_source", "pk_content", "pk_cid",
      "mtm_campaign", "mtm_keyword", "mtm_medium", "mtm_source", "mtm_content", "mtm_cid", "mtm_group", "mtm_placement",
      "piwik_campaign", "piwik_kwd", "yclid", "ymclid", "_openstat", "s_kwcid", "ef_id",
      "cmpid", "CMP", "ns_campaign", "ns_mchannel", "ns_source", "ns_linkname", "ns_fee",
      "ICID", "icid", "wickedid", "rb_clickid", "otc", "wt_zmc", "wtrid",
    ],
  },
  {
    id: "news",
    label: "Publisher campaign tags",
    note: "Newsroom analytics tags added by BBC, Guardian and similar sites when a link is shared.",
    params: ["at_medium", "at_campaign", "at_custom1", "at_custom2", "at_custom3", "at_custom4", "at_link_origin", "CMP_BUNIT", "CMP_TU"],
  },
];

/**
 * Prefix rules. Anything starting with these is telemetry by convention, which
 * catches the custom fields platforms invent without an update here.
 */
export const TRACKING_PREFIXES = [
  "utm_", "pk_", "mtm_", "piwik_", "hsa_", "vero_", "oly_", "_bta_", "ml_subscriber",
  "matomo_", "at_custom", "ns_", "sc_", "fb_action", "elq", "trk_", "wt_",
];

/**
 * Site-specific parameters. Removing these is usually fine but can change
 * behaviour — an Amazon "tag" is an affiliate credit, a YouTube "t" is a start
 * time — so they are only removed when you ask for the deeper clean.
 */
export const SITE_SPECIFIC_GROUPS = [
  {
    id: "amazon",
    label: "Amazon",
    note: "tag is the affiliate credit, ref and pd_rd_* record which carousel or search you came from. The product page loads identically without them.",
    params: [
      "tag", "ref", "ref_", "pf_rd_p", "pf_rd_r", "pf_rd_s", "pf_rd_t", "pf_rd_i", "pf_rd_m",
      "pd_rd_i", "pd_rd_r", "pd_rd_w", "pd_rd_wg", "psc", "th", "linkCode", "linkId",
      "creative", "creativeASIN", "ascsubtag", "smid", "qid", "sr", "sprefix", "crid", "_encoding", "content-id",
    ],
  },
  {
    id: "youtube",
    label: "YouTube",
    note: "si identifies the share, pp encodes playback settings, feature records where the click came from. Note that t (start time) is deliberately not touched.",
    params: ["si", "pp", "feature", "ab_channel", "kw", "app"],
  },
  {
    id: "marketplace",
    label: "Marketplaces",
    note: "AliExpress spm and scm, eBay _trkparms and campid, Flipkart affid — attribution rather than product identity.",
    params: [
      "spm", "scm", "scm_id", "aff_platform", "aff_trace_key", "aff_short_key", "algo_pvid", "algo_exp_id", "btsid", "ws_ab_test",
      "_trkparms", "_trksid", "campid", "customid", "toolid", "mkevt", "mkcid", "mkrid",
      "affid", "affExtParam1", "affExtParam2", "cmpid_fk", "otracker", "otracker1", "ppt", "ppn", "ssid",
    ],
  },
  {
    id: "misc",
    label: "Other referral tags",
    note: "Generic referral and source fields used across many sites.",
    params: ["ref_src", "ref_url", "referrer", "source", "src", "campaign", "partner", "affiliate", "aff", "irclickid", "irgwc"],
  },
];

/** Human notes for the parameters people ask about most. */
export const PARAM_NOTES = {
  gclid: "Google Click Identifier — ties this visit to one paid ad click.",
  fbclid: "Facebook Click Identifier — lets Meta join the visit to the account that clicked.",
  msclkid: "Microsoft Click ID, used by Bing Ads for conversion matching.",
  mc_eid: "Mailchimp recipient ID — identifies the individual subscriber, so forwarding the link forwards your identity.",
  vero_id: "Vero recipient identifier, frequently the email address itself in encoded form.",
  igshid: "Instagram share identifier, added when a link is shared from the app.",
  utm_source: "Names the campaign source in analytics. Has no effect on which page loads.",
  srsltid: "Google Shopping/Merchant listing identifier appended by search result links.",
  si: "YouTube share identifier added by the Share button.",
  tag: "Amazon Associates affiliate tag — credits a commission to whoever shared the link.",
};

const CORE_PARAM_SET = new Set(
  TRACKING_GROUPS.flatMap((g) => g.params.map((p) => p.toLowerCase())),
);
const SITE_PARAM_SET = new Set(
  SITE_SPECIFIC_GROUPS.flatMap((g) => g.params.map((p) => p.toLowerCase())),
);
const GROUP_OF = new Map();
for (const group of TRACKING_GROUPS) for (const p of group.params) GROUP_OF.set(p.toLowerCase(), group.label);
for (const group of SITE_SPECIFIC_GROUPS) for (const p of group.params) GROUP_OF.set(p.toLowerCase(), group.label);

/** Would this parameter name be stripped? */
export function classifyParam(name, { aggressive = false } = {}) {
  const key = String(name ?? "").trim().toLowerCase();
  if (!key) return null;
  if (CORE_PARAM_SET.has(key)) return { key, group: GROUP_OF.get(key) ?? "Tracking", tier: "core" };
  if (TRACKING_PREFIXES.some((prefix) => key.startsWith(prefix))) {
    return { key, group: "Prefix rule", tier: "core" };
  }
  if (aggressive && SITE_PARAM_SET.has(key)) return { key, group: GROUP_OF.get(key) ?? "Site-specific", tier: "site" };
  return null;
}

function splitPairs(queryString) {
  return queryString
    .split("&")
    .filter((chunk) => chunk.length > 0)
    .map((chunk) => {
      const eq = chunk.indexOf("=");
      const rawKey = eq === -1 ? chunk : chunk.slice(0, eq);
      let key = rawKey;
      try {
        key = decodeURIComponent(rawKey.replace(/\+/g, " "));
      } catch {
        key = rawKey;
      }
      return { raw: chunk, key: key.trim() };
    });
}

/**
 * Strip tracking parameters from a single URL.
 *
 * @param {string} rawUrl
 * @param {{aggressive?: boolean}} options
 * @returns {{error:string,input:string}|{input:string,cleaned:string,removed:Array,kept:Array,savedChars:number}}
 */
export function stripOne(rawUrl, { aggressive = false } = {}) {
  const input = String(rawUrl ?? "").trim();
  if (!input) return { error: "Empty line.", input };
  if (/\s/.test(input)) return { error: "Contains a space — paste one link per line.", input };
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(input) && !/^[^/?#]+\.[a-z]{2,}/i.test(input)) {
    return { error: "This does not look like a web address.", input };
  }

  const hashIndex = input.indexOf("#");
  const withoutHash = hashIndex === -1 ? input : input.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? "" : input.slice(hashIndex + 1);

  const qIndex = withoutHash.indexOf("?");
  const base = qIndex === -1 ? withoutHash : withoutHash.slice(0, qIndex);
  const query = qIndex === -1 ? "" : withoutHash.slice(qIndex + 1);

  const removed = [];
  const kept = [];

  const filterPairs = (pairs, where) =>
    pairs.filter((pair) => {
      const hit = classifyParam(pair.key, { aggressive });
      if (hit) {
        removed.push({ key: pair.key, raw: pair.raw, group: hit.group, tier: hit.tier, where });
        return false;
      }
      kept.push({ key: pair.key, raw: pair.raw, where });
      return true;
    });

  const keptQuery = filterPairs(splitPairs(query), "query");

  // A fragment that is really a query ("#utm_source=x&a=b") gets the same
  // treatment; a plain anchor such as "#section-2" is left alone.
  const fragmentIsQuery = fragment.includes("=") && !/\s/.test(fragment);
  const keptFragment = fragmentIsQuery ? filterPairs(splitPairs(fragment), "fragment") : null;

  let cleaned = base;
  if (keptQuery.length) cleaned += `?${keptQuery.map((p) => p.raw).join("&")}`;
  if (fragmentIsQuery) {
    if (keptFragment.length) cleaned += `#${keptFragment.map((p) => p.raw).join("&")}`;
  } else if (fragment) {
    cleaned += `#${fragment}`;
  }

  return {
    input,
    cleaned,
    removed,
    kept,
    savedChars: Math.max(0, input.length - cleaned.length),
  };
}

/**
 * Strip tracking parameters from every line of the input.
 *
 * @returns {{error:string}|{results:Array,totalRemoved:number,totalLinks:number,savedChars:number}}
 */
export function stripTracking(text, { aggressive = false } = {}) {
  const raw = String(text ?? "");
  const lines = raw.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);

  if (!lines.length) return { error: "Paste one or more links, one per line." };
  if (lines.length > 200) return { error: "That is more than 200 links — split the list into smaller batches." };

  const results = lines.map((line) => stripOne(line, { aggressive }));
  const usable = results.filter((r) => !r.error);

  return {
    results,
    totalLinks: results.length,
    totalRemoved: usable.reduce((sum, r) => sum + r.removed.length, 0),
    savedChars: usable.reduce((sum, r) => sum + r.savedChars, 0),
    failed: results.length - usable.length,
    cleanedText: usable.map((r) => r.cleaned).join("\n"),
  };
}
