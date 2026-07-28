/**
 * Tracking Link Decoder — pure logic.
 *
 * Everything here is offline string work over the WHATWG URL grammar
 * (RFC 3986 section 3.4 defines the query component; the ampersand-separated
 * key=value convention is the HTML "application/x-www-form-urlencoded" form,
 * HTML Living Standard section 4.10.21.6). No network, no DOM, no clock.
 *
 * The parameter catalogue below is a hand-checked list of query keys that
 * advertising, email and analytics platforms append to links. Each entry names
 * the platform that documents the key, so a claim can be traced back.
 *
 * Catalogue last reviewed: 2026-07-28.
 */

/** Date the parameter catalogue below was last checked, ISO-8601. */
export const CATALOGUE_REVIEWED = "2026-07-28";

/**
 * Practical guard against absurd input. Browsers and CDNs vary, but 20,000
 * characters is far beyond any real shared link (Chrome caps display at ~2 MB,
 * most servers reject request lines over 8 KB).
 */
export const MAX_INPUT_LENGTH = 20000;

/** Query values longer than this are truncated for display only. */
const VALUE_DISPLAY_LIMIT = 72;

/** How much a parameter can expose about the person holding the link. */
export const EXPOSURE = {
  INDIVIDUAL: "individual",
  DEVICE: "device",
  CAMPAIGN: "campaign",
  NONE: "none",
  UNKNOWN: "unknown",
};

export const EXPOSURE_LABELS = {
  individual: "Identifies you personally",
  device: "Identifies your browser or device",
  campaign: "Identifies the campaign, not you",
  none: "Reveals nothing about you",
  unknown: "Unrecognised — unknown",
};

/** Display order and headings for the grouped reference table. */
export const GROUPS = [
  { id: "utm", label: "Campaign tags (UTM)" },
  { id: "adclick", label: "Advertising click IDs" },
  { id: "email", label: "Email & marketing automation" },
  { id: "social", label: "Social & share IDs" },
  { id: "retail", label: "Retail & affiliate" },
  { id: "analytics", label: "Analytics & internal campaign codes" },
  { id: "identity", label: "Direct personal identifiers" },
  { id: "functional", label: "Functional — kept" },
];

const GROUP_LABELS = GROUPS.reduce((acc, group) => {
  acc[group.id] = group.label;
  return acc;
}, {});

/**
 * Tracking parameters. Removed from the clean link.
 * n = key, g = group, x = exposure, by = who appends it, tells = what it reveals.
 */
const TRACKER_DEFS = [
  // ---- UTM campaign tags (Google Analytics / GA4 documented parameters) ----
  {
    n: "utm_source",
    g: "utm",
    x: EXPOSURE.CAMPAIGN,
    by: "The marketer who wrote the link (read by Google Analytics)",
    tells: "Which site, app or list the link was placed in — 'newsletter', 'facebook', 'partner-blog'.",
  },
  {
    n: "utm_medium",
    g: "utm",
    x: EXPOSURE.CAMPAIGN,
    by: "The marketer who wrote the link (read by Google Analytics)",
    tells: "The channel: email, cpc, social, affiliate, push. Tells them which budget line you came from.",
  },
  {
    n: "utm_campaign",
    g: "utm",
    x: EXPOSURE.CAMPAIGN,
    by: "The marketer who wrote the link (read by Google Analytics)",
    tells: "The campaign name, often including a date or offer — 'spring_sale_2026', 'winback_30day'.",
  },
  {
    n: "utm_term",
    g: "utm",
    x: EXPOSURE.CAMPAIGN,
    by: "The advertiser, or auto-tagged by the ad platform",
    tells: "The paid keyword the ad was bought against — frequently the exact phrase you typed into a search box.",
  },
  {
    n: "utm_content",
    g: "utm",
    x: EXPOSURE.CAMPAIGN,
    by: "The marketer who wrote the link",
    tells: "Which link inside the message you clicked — 'hero-button' vs 'footer-text'. Behavioural, not just campaign-level.",
  },
  {
    n: "utm_id",
    g: "utm",
    x: EXPOSURE.CAMPAIGN,
    by: "The marketer, for GA4 cost-data import",
    tells: "The campaign's ID in the ad platform, used to join your visit to what the click cost.",
  },
  {
    n: "utm_source_platform",
    g: "utm",
    x: EXPOSURE.CAMPAIGN,
    by: "GA4 auto-tagging",
    tells: "The platform that sold the click — Google Ads, Display & Video 360, Search Ads 360.",
  },
  {
    n: "utm_creative_format",
    g: "utm",
    x: EXPOSURE.CAMPAIGN,
    by: "GA4 auto-tagging",
    tells: "Creative type: display, video, search, native.",
  },
  {
    n: "utm_marketing_tactic",
    g: "utm",
    x: EXPOSURE.CAMPAIGN,
    by: "GA4 auto-tagging",
    tells: "The targeting tactic — 'remarketing' means you were followed here from a previous visit; 'prospecting' means you were not.",
  },

  // ---- Advertising click identifiers ----
  {
    n: "gclid",
    g: "adclick",
    x: EXPOSURE.INDIVIDUAL,
    by: "Google, appended automatically the moment you click a Google ad",
    tells: "A Google Click Identifier unique to your single click. With Google's tag on the landing page it stitches your visit, and anything you buy, back to that one ad impression.",
  },
  {
    n: "gbraid",
    g: "adclick",
    x: EXPOSURE.DEVICE,
    by: "Google Ads, on iOS app-to-web clicks",
    tells: "Google's privacy-restricted click id used when Apple's App Tracking Transparency blocks user-level tracking. It measures in aggregate rather than naming a person.",
  },
  {
    n: "wbraid",
    g: "adclick",
    x: EXPOSURE.DEVICE,
    by: "Google Ads, on iOS web-to-app clicks",
    tells: "The web-to-app twin of gbraid. Aggregated conversion measurement, not user-level identity.",
  },
  {
    n: "dclid",
    g: "adclick",
    x: EXPOSURE.INDIVIDUAL,
    by: "Google Campaign Manager 360 / Display & Video 360",
    tells: "Display-network click id. Ties the display ad you clicked to your later behaviour on the site.",
  },
  {
    n: "gclsrc",
    g: "adclick",
    x: EXPOSURE.CAMPAIGN,
    by: "Google auto-tagging",
    tells: "Which Google product produced the click — 'aw.ds' means it came through Search Ads 360.",
  },
  {
    n: "gad_source",
    g: "adclick",
    x: EXPOSURE.CAMPAIGN,
    by: "Google Ads auto-tagging",
    tells: "The Google surface the click came from (search results, display placement, YouTube).",
  },
  {
    n: "gad_campaignid",
    g: "adclick",
    x: EXPOSURE.CAMPAIGN,
    by: "Google Ads auto-tagging",
    tells: "The numeric Google Ads campaign ID that paid for the click.",
  },
  {
    n: "srsltid",
    g: "adclick",
    x: EXPOSURE.INDIVIDUAL,
    by: "Google Merchant Center free product listings",
    tells: "A per-click Shopping result id. Marks you as having arrived from a specific product listing in Google's results.",
  },
  {
    n: "fbclid",
    g: "adclick",
    x: EXPOSURE.INDIVIDUAL,
    by: "Meta, appended when you click a link on Facebook, Instagram or Messenger",
    tells: "Meta's click id. When the Meta Pixel loads on the destination it lets Meta match this visit back to your Facebook or Instagram account.",
  },
  {
    n: "msclkid",
    g: "adclick",
    x: EXPOSURE.INDIVIDUAL,
    by: "Microsoft Advertising (Bing) auto-tagging",
    tells: "A unique click id for a Bing/Microsoft ad, used with the UET tag to attribute what you do next.",
  },
  {
    n: "ttclid",
    g: "adclick",
    x: EXPOSURE.INDIVIDUAL,
    by: "TikTok, on ad and in-app link clicks",
    tells: "TikTok's click id. Paired with the TikTok Pixel it ties the visit to your TikTok account.",
  },
  {
    n: "li_fat_id",
    g: "adclick",
    x: EXPOSURE.INDIVIDUAL,
    by: "LinkedIn first-party ad tracking",
    tells: "LinkedIn's member-level click token. It is how a B2B advertiser learns that a specific LinkedIn member — job title, employer and all — opened the page.",
  },
  {
    n: "twclid",
    g: "adclick",
    x: EXPOSURE.INDIVIDUAL,
    by: "X (Twitter) ads",
    tells: "X's click id, matched to your X account by the site's conversion tag.",
  },
  {
    n: "epik",
    g: "adclick",
    x: EXPOSURE.INDIVIDUAL,
    by: "Pinterest",
    tells: "Pinterest's encrypted click token, used to join the visit to the Pinterest user who clicked.",
  },
  {
    n: "rdt_cid",
    g: "adclick",
    x: EXPOSURE.INDIVIDUAL,
    by: "Reddit Ads",
    tells: "Reddit's click id, read by the Reddit Pixel for conversion matching.",
  },
  {
    n: "sccid",
    g: "adclick",
    x: EXPOSURE.INDIVIDUAL,
    by: "Snapchat Ads (written ScCid)",
    tells: "Snapchat's click id for Snap Pixel conversion matching.",
  },
  {
    n: "yclid",
    g: "adclick",
    x: EXPOSURE.INDIVIDUAL,
    by: "Yandex Direct",
    tells: "Yandex's click id, joined to Yandex Metrica session data.",
  },
  {
    n: "s_kwcid",
    g: "adclick",
    x: EXPOSURE.CAMPAIGN,
    by: "Adobe Advertising / Search Ads 360",
    tells: "An encoded keyword id string (AL!…!3!…) naming the exact keyword and ad group that bought the click.",
  },
  {
    n: "tblci",
    g: "adclick",
    x: EXPOSURE.INDIVIDUAL,
    by: "Taboola content-recommendation widgets",
    tells: "Taboola's click id from a 'promoted stories' box, tied to the Taboola cookie following you across publishers.",
  },
  {
    n: "dicbo",
    g: "adclick",
    x: EXPOSURE.INDIVIDUAL,
    by: "Outbrain content-recommendation widgets",
    tells: "Outbrain's click token from a recommendation unit, tied to Outbrain's cross-publisher profile of you.",
  },
  {
    n: "oborigurl",
    g: "adclick",
    x: EXPOSURE.CAMPAIGN,
    by: "Outbrain",
    tells: "The publisher page the recommendation widget sat on — i.e. what you were reading just before.",
  },

  // ---- Email and marketing automation ----
  {
    n: "mc_cid",
    g: "email",
    x: EXPOSURE.CAMPAIGN,
    by: "Mailchimp, when the sender enables link tracking",
    tells: "Which Mailchimp campaign (which single send) the link came out of.",
  },
  {
    n: "mc_eid",
    g: "email",
    x: EXPOSURE.INDIVIDUAL,
    by: "Mailchimp, generated per recipient",
    tells: "Mailchimp's unique email id — it names ONE subscriber on the sender's list. Forward this link and every click afterwards is recorded against the original recipient, not the person you sent it to.",
  },
  {
    n: "_hsenc",
    g: "email",
    x: EXPOSURE.INDIVIDUAL,
    by: "HubSpot, on tracked marketing emails",
    tells: "An encrypted token identifying the exact HubSpot contact record the email was sent to. It writes the click onto that person's CRM timeline.",
  },
  {
    n: "_hsmi",
    g: "email",
    x: EXPOSURE.CAMPAIGN,
    by: "HubSpot",
    tells: "The HubSpot marketing-email id — which send this link belonged to.",
  },
  {
    n: "hsctatracking",
    g: "email",
    x: EXPOSURE.CAMPAIGN,
    by: "HubSpot CTA module (written hsCtaTracking)",
    tells: "A pair of GUIDs naming the specific call-to-action button that was clicked.",
  },
  {
    n: "mkt_tok",
    g: "email",
    x: EXPOSURE.INDIVIDUAL,
    by: "Adobe Marketo Engage",
    tells: "A base64 token carrying the lead id of the person the email was addressed to. Decoded, it names the recipient in the sender's database.",
  },
  {
    n: "vero_id",
    g: "email",
    x: EXPOSURE.INDIVIDUAL,
    by: "Vero email platform",
    tells: "The recipient identifier Vero uses — very often the raw email address itself, sitting in plain sight in the URL.",
  },
  {
    n: "vero_conv",
    g: "email",
    x: EXPOSURE.CAMPAIGN,
    by: "Vero",
    tells: "The Vero conversion/message id that the click is credited to.",
  },
  {
    n: "__s",
    g: "email",
    x: EXPOSURE.INDIVIDUAL,
    by: "Klaviyo",
    tells: "Klaviyo's per-recipient identifier. It attaches the visit to one profile in the sender's Klaviyo account.",
  },
  {
    n: "ck_subscriber_id",
    g: "email",
    x: EXPOSURE.INDIVIDUAL,
    by: "Kit (formerly ConvertKit)",
    tells: "The numeric subscriber id of the person the newsletter was sent to.",
  },
  {
    n: "ml_subscriber",
    g: "email",
    x: EXPOSURE.INDIVIDUAL,
    by: "MailerLite",
    tells: "The MailerLite subscriber id of the addressee.",
  },
  {
    n: "ml_subscriber_hash",
    g: "email",
    x: EXPOSURE.INDIVIDUAL,
    by: "MailerLite",
    tells: "A hash that authenticates the subscriber id above, so the pair cannot be casually forged.",
  },
  {
    n: "oly_anon_id",
    g: "email",
    x: EXPOSURE.DEVICE,
    by: "Omeda Olytics (publisher audience platform)",
    tells: "A pseudonymous visitor id for your browser, used to build a reading profile before you ever log in.",
  },
  {
    n: "oly_enc_id",
    g: "email",
    x: EXPOSURE.INDIVIDUAL,
    by: "Omeda Olytics",
    tells: "The encrypted id of a KNOWN subscriber — the logged-in, named counterpart of oly_anon_id.",
  },

  // ---- Social and share identifiers ----
  {
    n: "igshid",
    g: "social",
    x: EXPOSURE.INDIVIDUAL,
    by: "Instagram, added by its share sheet",
    tells: "Instagram's share id. It records which account shared the link and which share chain you arrived through.",
  },
  {
    n: "si",
    g: "social",
    x: EXPOSURE.INDIVIDUAL,
    by: "YouTube and Spotify share buttons",
    tells: "A share-source id created when someone pressed Share. It links your view back to the specific person or session that generated the link — which is why the same youtu.be link sent by two friends carries two different si values.",
  },
  {
    n: "feature",
    g: "social",
    x: EXPOSURE.CAMPAIGN,
    by: "YouTube",
    tells: "Which YouTube surface produced the link — 'share', 'youtu.be', 'emb_logo'.",
  },
  {
    n: "share_id",
    g: "social",
    x: EXPOSURE.INDIVIDUAL,
    by: "Various app share sheets",
    tells: "A per-share token that distinguishes one person's copy of a link from another's.",
  },
  {
    n: "fb_action_ids",
    g: "social",
    x: EXPOSURE.INDIVIDUAL,
    by: "Facebook Open Graph actions",
    tells: "The id of the Facebook action (a post or like) that carried the link.",
  },
  {
    n: "fb_source",
    g: "social",
    x: EXPOSURE.CAMPAIGN,
    by: "Facebook",
    tells: "Which part of Facebook the link was clicked in — timeline, message, notification.",
  },
  {
    n: "smid",
    g: "social",
    x: EXPOSURE.CAMPAIGN,
    by: "Publishers (New York Times among them) on social share links",
    tells: "The social medium the share came from, e.g. 'nytcore-ios-share'.",
  },

  // ---- Retail and affiliate ----
  {
    n: "tag",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon Associates — set by whoever published the link",
    tells: "The affiliate tracking id that earns a commission. It identifies the PUBLISHER, not you — but it also proves the link came from a monetised recommendation.",
  },
  {
    n: "ascsubtag",
    g: "retail",
    x: EXPOSURE.INDIVIDUAL,
    by: "Amazon Associates sub-tag, filled in by the publisher's own system",
    tells: "A free-text slot publishers stuff with their own identifiers — commonly article id plus a per-visitor session id, which makes it individual-level in practice.",
  },
  {
    n: "linkcode",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon Associates",
    tells: "Which Associates link format was used (text, image, native ad unit).",
  },
  {
    n: "linkid",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon Associates",
    tells: "A hash identifying the individual affiliate link placement.",
  },
  {
    n: "creative",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon Associates",
    tells: "The creative/banner id the click came from.",
  },
  {
    n: "creativeasin",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon Associates",
    tells: "The ASIN shown in the affiliate creative you clicked.",
  },
  {
    n: "camp",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon Associates",
    tells: "The Associates campaign number.",
  },
  {
    n: "ref_",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon internal navigation tracking",
    tells: "The exact widget and page position you clicked from — 'nav_search_1', 'sr_1_3' (search result 1, position 3).",
  },
  {
    n: "pd_rd_i",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon personalised recommendation placements",
    tells: "The ASIN of the item in the recommendation strip you clicked.",
  },
  {
    n: "pd_rd_r",
    g: "retail",
    x: EXPOSURE.INDIVIDUAL,
    by: "Amazon",
    tells: "A per-request GUID tied to your browsing session — it pins the click to one visit by one signed-in shopper.",
  },
  {
    n: "pd_rd_w",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon",
    tells: "The recommendation widget id that produced the row.",
  },
  {
    n: "pd_rd_wg",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon",
    tells: "The widget group id — which cluster of recommendations the row belonged to.",
  },
  {
    n: "pd_rd_p",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon",
    tells: "The placement id identifying where on the page the recommendation sat.",
  },
  {
    n: "pf_rd_p",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon merchandising placements",
    tells: "Placement id for a promoted/merchandised slot rather than a personalised one.",
  },
  {
    n: "pf_rd_r",
    g: "retail",
    x: EXPOSURE.INDIVIDUAL,
    by: "Amazon",
    tells: "The request GUID for a merchandised placement click — session-scoped, same exposure as pd_rd_r.",
  },
  {
    n: "pf_rd_s",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon",
    tells: "The page section the promoted slot appeared in.",
  },
  {
    n: "pf_rd_t",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon",
    tells: "The page type the promoted slot appeared on.",
  },
  {
    n: "pf_rd_i",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon",
    tells: "The item or category id associated with the promoted slot.",
  },
  {
    n: "pf_rd_m",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Amazon",
    tells: "The merchant id behind the promoted slot.",
  },
  {
    n: "spm",
    g: "retail",
    x: EXPOSURE.INDIVIDUAL,
    by: "Alibaba, AliExpress and Taobao (Super Position Model)",
    tells: "A dotted path encoding site, page, module and the exact slot you tapped — a fine-grained trail of your route through the store.",
  },
  {
    n: "scm",
    g: "retail",
    x: EXPOSURE.CAMPAIGN,
    by: "Alibaba / AliExpress",
    tells: "The recommendation algorithm and scenario that surfaced the item to you.",
  },

  // ---- Analytics and internal campaign codes ----
  {
    n: "s_cid",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "Adobe Analytics customers (news sites and large retailers)",
    tells: "The site campaign code — which internal promotion, module or newsletter slot sent you.",
  },
  {
    n: "cid",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "Whoever built the link (a generic campaign id convention)",
    tells: "A campaign code. Harmless on its own, but on some platforms it doubles as the analytics client id.",
  },
  {
    n: "icid",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "The site itself, on internal promo links",
    tells: "Internal campaign id — which banner or module on their own site you clicked.",
  },
  {
    n: "int_cid",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "The site itself",
    tells: "Another internal-campaign convention with the same meaning as icid.",
  },
  {
    n: "intcmp",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "The site itself (The Guardian and others)",
    tells: "Internal campaign code naming the on-site placement.",
  },
  {
    n: "ref",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "The marketer or partner site",
    tells: "A hand-written referrer tag naming where the link was posted. On a small number of sites it selects content instead, so check the page still loads after removal.",
  },
  {
    n: "referrer",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "The linking site",
    tells: "The same idea as ref, spelled out — the source the destination should credit.",
  },
  {
    n: "referer",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "The linking site (the classic HTTP misspelling)",
    tells: "Source attribution passed in the URL rather than the Referer header.",
  },
  {
    n: "source",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "The marketer",
    tells: "A plain-language source label, the same job as utm_source.",
  },
  {
    n: "_ga",
    g: "analytics",
    x: EXPOSURE.DEVICE,
    by: "Google Analytics cross-domain linker",
    tells: "Carries your GA client id — the pseudonymous identifier for your browser — from one domain to another so both sites see the same visitor.",
  },
  {
    n: "_gl",
    g: "analytics",
    x: EXPOSURE.DEVICE,
    by: "Google Analytics / Google Tag cross-domain linker",
    tells: "The modern linker parameter. It hands your GA and Google Ads cookie values to the next domain so the visit is not counted as new.",
  },
  {
    n: "_openstat",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "Russian ad and mail platforms",
    tells: "A base64 blob holding the service, campaign, ad and source of the click.",
  },
  {
    n: "at_medium",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "AT Internet analytics (used by the BBC among others)",
    tells: "The channel the link was distributed through.",
  },
  {
    n: "at_campaign",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "AT Internet analytics",
    tells: "The campaign the link belongs to.",
  },
  {
    n: "at_custom1",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "AT Internet analytics",
    tells: "A free-text custom slot — contents vary by publisher.",
  },
  {
    n: "ns_campaign",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "Comscore-style publisher tagging",
    tells: "The campaign name credited for the visit.",
  },
  {
    n: "ns_mchannel",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "Comscore-style publisher tagging",
    tells: "The marketing channel credited for the visit.",
  },
  {
    n: "cmpid",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "Publishers and retailers",
    tells: "A campaign id, same purpose as cid.",
  },
  {
    n: "trk",
    g: "analytics",
    x: EXPOSURE.CAMPAIGN,
    by: "LinkedIn and others on outbound links",
    tells: "Names the on-site module the link was clicked from.",
  },

  // ---- Direct personal identifiers ----
  {
    n: "email",
    g: "identity",
    x: EXPOSURE.INDIVIDUAL,
    by: "The sender, to pre-fill a form",
    tells: "Your email address, in clear text, in a URL — which means it lands in server logs, browser history and any analytics script on the page. Removing it only means typing it in yourself.",
  },
  {
    n: "e",
    g: "identity",
    x: EXPOSURE.INDIVIDUAL,
    by: "The sender (short form of email on some platforms)",
    tells: "Often a plain or lightly encoded email address. Check the value before sharing the link.",
  },
  {
    n: "uid",
    g: "identity",
    x: EXPOSURE.INDIVIDUAL,
    by: "The sending system",
    tells: "A user id pointing at one account in their database.",
  },
  {
    n: "userid",
    g: "identity",
    x: EXPOSURE.INDIVIDUAL,
    by: "The sending system",
    tells: "A user id pointing at one account in their database.",
  },
  {
    n: "user_id",
    g: "identity",
    x: EXPOSURE.INDIVIDUAL,
    by: "The sending system",
    tells: "A user id pointing at one account in their database.",
  },
  {
    n: "subscriber_id",
    g: "identity",
    x: EXPOSURE.INDIVIDUAL,
    by: "The newsletter platform",
    tells: "The list membership record for one named subscriber.",
  },
  {
    n: "recipient",
    g: "identity",
    x: EXPOSURE.INDIVIDUAL,
    by: "The email platform",
    tells: "Names the addressee, sometimes as the address itself.",
  },
  {
    n: "phone",
    g: "identity",
    x: EXPOSURE.INDIVIDUAL,
    by: "The sender, to pre-fill a form",
    tells: "Your phone number in clear text in the URL, with the same log and history exposure as an email address.",
  },
];

/**
 * Functional parameters. Kept in the clean link, each with the reason it is
 * load-bearing — a stripper that breaks the destination is worse than none.
 */
const FUNCTIONAL_DEFS = [
  { n: "v", why: "YouTube's video id. Remove it and there is no video to play." },
  { n: "list", why: "Playlist id. Removing it drops you out of the playlist." },
  { n: "index", why: "Position within the playlist." },
  { n: "t", why: "Start time in seconds. This is the timestamp someone deliberately shared.", note: "Whoever sent it chose this moment — that is a hint about intent, not about you." },
  { n: "start", why: "Start time in seconds on embedded players." },
  { n: "time_continue", why: "Resume position, in seconds." },
  { n: "q", why: "The search query the page must run. Remove it and you get an empty results page.", note: "It does contain what you searched for, so it is worth reading before forwarding." },
  { n: "query", why: "Search query — same role as q." },
  { n: "search", why: "Search query — same role as q." },
  { n: "s", why: "Search query on WordPress and many CMS sites." },
  { n: "k", why: "Amazon's search keyword. The results page is empty without it." },
  { n: "node", why: "Amazon browse-node (category) id." },
  { n: "th", why: "Amazon variant selector — which size or colour of the product is shown." },
  { n: "psc", why: "Amazon product-selection flag that pins the chosen variant." },
  { n: "page", why: "Which page of a paginated list to show." },
  { n: "p", why: "Page number or post id, depending on the CMS. Ambiguous, so kept." },
  { n: "pg", why: "Page number." },
  { n: "offset", why: "Row offset in a paginated list." },
  { n: "limit", why: "How many rows to return." },
  { n: "per_page", why: "Page size for a paginated list." },
  { n: "id", why: "The record the page is about — an article, product or ticket id." },
  { n: "pid", why: "Product or post id." },
  { n: "product_id", why: "Product id." },
  { n: "sku", why: "Stock-keeping unit — which exact item is shown." },
  { n: "variant", why: "Which product variant (Shopify and similar) is selected." },
  { n: "lang", why: "Language selection." },
  { n: "hl", why: "Google's host-language selection." },
  { n: "locale", why: "Locale selection for dates, currency and copy." },
  { n: "sort", why: "Sort order of the list." },
  { n: "order", why: "Sort direction." },
  { n: "orderby", why: "Which field the list is sorted on." },
  { n: "filter", why: "Applied filter — removing it changes what you see." },
  { n: "category", why: "Category selection." },
  { n: "tab", why: "Which tab of the page opens." },
  { n: "view", why: "Which view or layout is rendered." },
  { n: "mode", why: "Page mode, e.g. edit versus read." },
  { n: "code", why: "OAuth authorization code. The sign-in flow fails without it.", sensitive: true, note: "This is a single-use credential. Do not share this link — anyone holding it can complete the sign-in." },
  { n: "state", why: "OAuth state value that protects the sign-in against cross-site request forgery.", sensitive: true, note: "Part of a live sign-in flow. Treat the whole link as private." },
  { n: "token", why: "An access or verification token the page needs to work.", sensitive: true, note: "This is a credential in the URL. Sharing the link shares the access." },
  { n: "access_token", why: "Bearer credential required by the page.", sensitive: true, note: "Anyone with this link has whatever access the token grants." },
  { n: "session", why: "Session identifier the page needs.", sensitive: true, note: "Sharing this link can hand over your logged-in session." },
  { n: "sid", why: "Session identifier the page needs.", sensitive: true, note: "Sharing this link can hand over your logged-in session." },
  { n: "url", why: "A redirector's real destination lives here.", redirect: true, note: "This link is a redirector: it records your click before forwarding you. The destination is the URL inside this value." },
  { n: "u", why: "Short form of the redirector destination.", redirect: true, note: "This link is a redirector. The real destination is inside this value." },
  { n: "redirect", why: "Where the page sends you next.", redirect: true, note: "Removing it leaves you on the intermediary page." },
  { n: "redirect_uri", why: "OAuth return address the provider must send you back to.", redirect: true },
  { n: "next", why: "Where to go after the current step completes.", redirect: true },
  { n: "dest", why: "Destination of the redirector.", redirect: true },
  { n: "destination", why: "Destination of the redirector.", redirect: true },
  { n: "target", why: "Target the intermediary forwards to.", redirect: true },
];

/** Prefix rules applied when a key is not in the exact maps. */
const PREFIX_RULES = [
  {
    test: /^utm_/,
    def: {
      g: "utm",
      x: EXPOSURE.CAMPAIGN,
      by: "The marketer who wrote the link",
      tells: "A non-standard UTM slot. Read by analytics as campaign attribution; the value tells them how they segmented you.",
    },
  },
  {
    test: /^(pd_rd_|pf_rd_)/,
    def: {
      g: "retail",
      x: EXPOSURE.CAMPAIGN,
      by: "Amazon placement tracking",
      tells: "Part of Amazon's recommendation/merchandising placement family — which widget, slot and page produced the click.",
    },
  },
  {
    test: /^(mc_|_hs)/,
    def: {
      g: "email",
      x: EXPOSURE.CAMPAIGN,
      by: "The sender's email platform (Mailchimp or HubSpot family)",
      tells: "An email-platform tracking slot. Values in this family range from campaign ids to per-recipient tokens.",
    },
  },
  {
    test: /^(at_|ns_)/,
    def: {
      g: "analytics",
      x: EXPOSURE.CAMPAIGN,
      by: "Publisher analytics tagging (AT Internet / Comscore conventions)",
      tells: "A campaign attribution slot in a publisher's analytics scheme.",
    },
  },
];

const TRACKER_MAP = TRACKER_DEFS.reduce((acc, def) => {
  acc[def.n] = def;
  return acc;
}, Object.create(null));

const FUNCTIONAL_MAP = FUNCTIONAL_DEFS.reduce((acc, def) => {
  acc[def.n] = def;
  return acc;
}, Object.create(null));

/** How many tracking keys the catalogue names by exact match. */
export const TRACKER_COUNT = TRACKER_DEFS.length;
/** How many functional keys are protected from stripping by exact match. */
export const FUNCTIONAL_COUNT = FUNCTIONAL_DEFS.length;
/** How many catalogued tracking keys can be tied to one named person. */
export const INDIVIDUAL_TRACKER_COUNT = TRACKER_DEFS.filter(
  (def) => def.x === EXPOSURE.INDIVIDUAL,
).length;

/**
 * The full catalogue, grouped for the on-page reference table.
 * @returns {{id: string, label: string, rows: Array<object>}[]}
 */
export function catalogueByGroup() {
  const groups = GROUPS.map((group) => ({ id: group.id, label: group.label, rows: [] }));
  const byId = groups.reduce((acc, group) => {
    acc[group.id] = group;
    return acc;
  }, Object.create(null));

  for (const def of TRACKER_DEFS) {
    byId[def.g].rows.push({
      name: def.n,
      exposure: def.x,
      setter: def.by,
      tells: def.tells,
      decision: "strip",
    });
  }
  for (const def of FUNCTIONAL_DEFS) {
    byId.functional.rows.push({
      name: def.n,
      exposure: EXPOSURE.NONE,
      setter: "The destination site — the page reads this to decide what to show",
      tells: def.why,
      decision: "keep",
      sensitive: Boolean(def.sensitive),
    });
  }
  return groups.filter((group) => group.rows.length > 0);
}

/** Percent-decode without throwing on malformed sequences. */
function safeDecode(raw) {
  const plus = raw.replace(/\+/g, " ");
  try {
    return decodeURIComponent(plus);
  } catch {
    return plus;
  }
}

function truncate(value) {
  if (value.length <= VALUE_DISPLAY_LIMIT) return value;
  return `${value.slice(0, VALUE_DISPLAY_LIMIT)}…`;
}

/**
 * Classify a single query key.
 * @param {string} name raw (already percent-decoded) key
 * @returns {{decision: "strip"|"keep", group: string, groupLabel: string,
 *   exposure: string, setter: string, tells: string, note?: string,
 *   sensitive: boolean, redirect: boolean, match: "exact"|"prefix"|"unknown"}}
 */
export function classifyParam(name) {
  const key = String(name ?? "").trim().toLowerCase();

  const tracker = TRACKER_MAP[key];
  if (tracker) {
    return {
      decision: "strip",
      group: tracker.g,
      groupLabel: GROUP_LABELS[tracker.g],
      exposure: tracker.x,
      setter: tracker.by,
      tells: tracker.tells,
      sensitive: false,
      redirect: false,
      match: "exact",
    };
  }

  const functional = FUNCTIONAL_MAP[key];
  if (functional) {
    return {
      decision: "keep",
      group: "functional",
      groupLabel: GROUP_LABELS.functional,
      exposure: functional.sensitive ? EXPOSURE.INDIVIDUAL : EXPOSURE.NONE,
      setter: "The destination site — the page reads this to decide what to show",
      tells: functional.why,
      note: functional.note,
      sensitive: Boolean(functional.sensitive),
      redirect: Boolean(functional.redirect),
      match: "exact",
    };
  }

  for (const rule of PREFIX_RULES) {
    if (rule.test.test(key)) {
      return {
        decision: "strip",
        group: rule.def.g,
        groupLabel: GROUP_LABELS[rule.def.g],
        exposure: rule.def.x,
        setter: rule.def.by,
        tells: rule.def.tells,
        sensitive: false,
        redirect: false,
        match: "prefix",
      };
    }
  }

  return {
    decision: "keep",
    group: "functional",
    groupLabel: "Unrecognised — kept",
    exposure: EXPOSURE.UNKNOWN,
    setter: "Not in the catalogue",
    tells:
      "This key is not one of the tracking parameters listed here. It is kept, because removing an unknown parameter is how a link gets broken. Read the value: if it looks like an id for you rather than for the page, drop it by hand.",
    sensitive: false,
    redirect: false,
    match: "unknown",
  };
}

/** Split a raw query string (no leading '?') into ordered segments. */
function splitQuery(raw) {
  if (!raw) return [];
  return raw
    .split("&")
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      const eq = segment.indexOf("=");
      const rawName = eq === -1 ? segment : segment.slice(0, eq);
      const rawValue = eq === -1 ? "" : segment.slice(eq + 1);
      return {
        raw: segment,
        name: safeDecode(rawName),
        value: safeDecode(rawValue),
      };
    });
}

function looksLikeUrl(value) {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

/**
 * Decode a URL: name every parameter, strip the trackers, keep what the page
 * needs, and report the before/after size.
 *
 * @param {string} input any URL, with or without a scheme
 * @returns {object} result, or { error } when the input is not a web link
 */
export function decodeTrackingUrl(input) {
  const text = String(input ?? "").trim();

  if (!text) {
    return { error: "Paste a link to decode. Nothing was entered." };
  }
  if (text.length > MAX_INPUT_LENGTH) {
    return {
      error: `That is ${text.length.toLocaleString("en-IN")} characters long — past the ${MAX_INPUT_LENGTH.toLocaleString("en-IN")}-character limit this page will parse. Trim it and try again.`,
    };
  }

  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`;

  let url;
  try {
    url = new URL(candidate);
  } catch {
    return {
      error:
        "That is not a URL the browser can parse. A link needs a host, like example.com/page — spaces and stray text will stop it.",
    };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return {
      error: `This is a ${url.protocol.replace(":", "")} address, not a web link. Only http and https links carry query parameters this page can read.`,
    };
  }
  if (!url.hostname) {
    return { error: "No host found in that link, so there is nothing to open." };
  }

  const base = `${url.protocol}//${url.host}${url.pathname}`;
  const rawQuery = url.search.startsWith("?") ? url.search.slice(1) : url.search;
  const rawHash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;

  const seenNames = new Set();
  const params = [];
  const keptSegments = [];

  for (const segment of splitQuery(rawQuery)) {
    const info = classifyParam(segment.name);
    const lower = segment.name.toLowerCase();
    const duplicate = seenNames.has(lower);
    seenNames.add(lower);
    params.push({
      ...info,
      where: "query",
      name: segment.name,
      value: segment.value,
      displayValue: truncate(segment.value),
      valueLength: segment.value.length,
      duplicate,
      nestedUrl: looksLikeUrl(segment.value) ? segment.value : null,
    });
    if (info.decision === "keep") keptSegments.push(segment.raw);
  }

  // The fragment is never sent to the server in the HTTP request; scripts on
  // the page read it. Tracking still hides there, so it is parsed the same way.
  // A scroll-to-text fragment (#:~:text=…) also contains '=' but is not a
  // query — it is the browser's own directive, so it must be tested first.
  const isTextFragment = rawHash.startsWith(":~:");
  const fragmentIsQueryLike = !isTextFragment && rawHash.includes("=");
  const keptHashSegments = [];
  let hashKind = "none";

  if (rawHash && fragmentIsQueryLike) {
    hashKind = "query-like";
    for (const segment of splitQuery(rawHash)) {
      const info = classifyParam(segment.name);
      params.push({
        ...info,
        where: "fragment",
        name: segment.name,
        value: segment.value,
        displayValue: truncate(segment.value),
        valueLength: segment.value.length,
        duplicate: false,
        nestedUrl: looksLikeUrl(segment.value) ? segment.value : null,
      });
      if (info.decision === "keep") keptHashSegments.push(segment.raw);
    }
  } else if (rawHash) {
    hashKind = isTextFragment ? "text-fragment" : "anchor";
    keptHashSegments.push(rawHash);
  }

  const cleanQuery = keptSegments.length > 0 ? `?${keptSegments.join("&")}` : "";
  const cleanHash = keptHashSegments.length > 0 ? `#${keptHashSegments.join("&")}` : "";
  const clean = `${base}${cleanQuery}${cleanHash}`;

  const originalQuery = rawQuery ? `?${rawQuery}` : "";
  const originalHash = rawHash ? `#${rawHash}` : "";
  const original = `${base}${originalQuery}${originalHash}`;

  const stripped = params.filter((param) => param.decision === "strip");
  const kept = params.filter((param) => param.decision === "keep");
  const individual = stripped.filter((param) => param.exposure === EXPOSURE.INDIVIDUAL);
  const unknown = kept.filter((param) => param.match === "unknown");
  const sensitive = kept.filter((param) => param.sensitive);
  const redirects = kept.filter((param) => param.redirect && param.nestedUrl);

  const savedChars = original.length - clean.length;
  const savedPercent = original.length > 0 ? (savedChars / original.length) * 100 : 0;

  return {
    error: null,
    input: text,
    inputLength: text.length,
    original,
    originalLength: original.length,
    clean,
    cleanLength: clean.length,
    savedChars,
    savedPercent,
    host: url.host,
    path: url.pathname,
    schemeAdded: candidate !== text,
    hashKind,
    params,
    stripped,
    kept,
    counts: {
      total: params.length,
      stripped: stripped.length,
      kept: kept.length,
      individual: individual.length,
      unknown: unknown.length,
      sensitive: sensitive.length,
    },
    redirects: redirects.map((param) => ({ name: param.name, url: param.nestedUrl })),
  };
}
