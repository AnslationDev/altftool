const seo = {
  title: "Tracking Link Decoder: Strip utm, gclid, fbclid",
  metaDescription:
    "Names each of 99 tracking parameters in a URL, flags the 39 that identify one person, keeps 50 functional keys, and copies a clean link.",
  intro:
    "A tracking link decoder takes any URL and names what each of its query parameters reports back, who appended it, and whether it identifies you personally or only the campaign you arrived from — then returns the same link with the tracking removed. It matches each key against a catalogue of 99 tracking parameters and 50 functional ones, splitting the query the way the WHATWG URL standard and HTML form-encoding rules define it, and re-emits kept parameters in their original raw form so nothing that the destination page depends on is rewritten. It is for anyone about to forward a marketing email, share a YouTube or Amazon link, or paste a URL into a public channel, and 39 of the catalogued tracking keys resolve to one named individual rather than to a campaign. Parsing happens entirely in your browser with its built-in URL API; the link is never sent anywhere.",
  useCases: [
    "Check a link from a marketing email before forwarding it, so a colleague's clicks are not recorded against your name via mc_eid or _hsenc",
    "Strip the gclid, fbclid and utm_ tags off a URL before pasting it into a public chat, forum post or document",
    "Work out why a shared YouTube or Amazon link is 200 characters longer than it needs to be, and which parts are actually load-bearing",
    "Confirm that a shortened or redirector link is not carrying a session token or sign-in code before you share it",
  ],
  benefits: [
    [
      "Names the individual-level keys",
      "mc_eid, _hsenc, mkt_tok, li_fat_id, __s and 34 other catalogued keys point at one person on a sender's list — the page flags those separately from campaign labels like utm_campaign.",
    ],
    [
      "Will not break the link",
      "Functional parameters such as YouTube's v and t, a search q, Amazon's th and psc, and pagination keys are kept with the reason printed next to each. Unrecognised keys are kept too rather than guessed at.",
    ],
    [
      "Before and after character count",
      "The normalised link is measured before and after stripping, so the saving is a figure you can check yourself rather than a claim.",
    ],
    [
      "Nothing leaves the browser",
      "There are no network calls on the page. The URL is parsed by the browser's own URL API, so a link containing a session token or an email address is not transmitted anywhere by decoding it.",
    ],
  ],
  faqs: [
    [
      "Which tracking parameters can identify me personally?",
      "The ones tied to a recipient record rather than a campaign: mc_eid (Mailchimp's unique email id for one subscriber), _hsenc (an encrypted HubSpot contact token), mkt_tok (a base64 Marketo lead id), __s (Klaviyo), ck_subscriber_id, ml_subscriber, vero_id (frequently the raw email address), oly_enc_id and li_fat_id. Ad click ids such as gclid, fbclid, ttclid and msclkid are individual-level too, because each is unique to your one click and is matched back to your account by the platform's pixel on the landing page. This tool flags 39 such keys out of the 99 it catalogues.",
    ],
    [
      "If I forward a marketing email, does the sender know it was forwarded?",
      "Not directly — but every click on that link is credited to the original recipient, because the per-recipient id travels with the URL. A Mailchimp link carries mc_eid, which names one subscriber; a HubSpot link carries _hsenc, which writes the click onto that contact's CRM timeline. So the sender sees what looks like the first person clicking repeatedly, from new locations and devices, and the person you forwarded it to has their behaviour recorded under someone else's name. Removing mc_eid and _hsenc leaves the campaign id (mc_cid, _hsmi) and the page still loads.",
    ],
    [
      "What is the difference between gclid, gbraid and wbraid?",
      "gclid is Google's standard click identifier, unique to a single ad click and used for user-level conversion attribution. gbraid and wbraid are the privacy-restricted replacements Google introduced for iOS traffic after Apple's App Tracking Transparency: gbraid covers app-to-web clicks and wbraid covers web-to-app, and both are designed to measure conversions in aggregate rather than to identify one user. All three are removable — they are appended by Google when you click, not required by the destination page.",
    ],
    [
      "Which parameters must be kept, or the link stops working?",
      "The ones the destination reads to decide what to show. On YouTube that is v (the video id), t or start (the timestamp) and list plus index for a playlist. On a search page it is q, query, search, s or Amazon's k. On a product page it is id, sku, variant, or Amazon's th and psc, which select the size and colour. Pagination keys such as page, offset and limit matter too, as do lang, hl and sort. This tool protects 50 such keys and keeps anything it does not recognise, because a stripper that breaks the destination is worse than none.",
    ],
  ],
  steps: [
    "Paste or type the full URL into the box, including the https:// part if you have it — the page assumes https when no scheme is given.",
    "Read the summary panel: the count of tracking parameters removed, how many of those point at an individual, and the before and after character counts of the link.",
    "Check the Removed table to see each stripped parameter, the platform that set it, and the plain-language description of what it reports back.",
    "Check the Kept table to see which parameters were preserved and the reason each is load-bearing, so you can confirm the shortened link will still open the right page.",
    "Press Copy clean link to put the stripped URL on your clipboard, or Copy breakdown to take the whole parameter-by-parameter report as text.",
  ],
};

export default seo;
