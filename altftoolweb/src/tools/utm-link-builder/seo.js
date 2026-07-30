// Title/description are written against the measured Search Console query set
// for this cluster (7 days to 2026-07-27), not guessed. Across the 14 "utm
// builder"-class queries that drew ~1,400 impressions and ZERO clicks, the word
// "tool" appears in 7 of them (~548 impressions), "tracking" in 3 (~218) and
// "campaign" in 2 (~170) — while "url" appears in NONE. So "URL Generator" was
// spending the two most valuable title slots on a term nobody searched. "UTM
// Builder" stays first because "utm builder" (383 impressions) is the head
// query and 84% of this site's clicks are mobile, where the title truncates
// hardest. 46 chars, so the layout's " | AltFTool" suffix still fits under 65.
const seo = {
  title: "UTM Builder Tool: Free Campaign Tracking Links",
  // Unchanged on purpose. Main.jsx renders a client-side <h1>UTM Builder</h1>
  // with ssr:false, and its comment records that the two headings must read
  // identically or the URL reports two different subjects to Google. Change
  // both together or neither.
  h1: "UTM Builder",
  // 148 chars — trimMetaDescription hard-caps at 160, so this arrives whole
  // instead of being clipped mid-sentence in the snippet.
  metaDescription:
    "Build a UTM tracking link free: paste your URL, tap a preset for Google, Facebook, Instagram or email, and copy the tagged campaign link. No signup.",
  intro:
    "This UTM builder turns any page address into a tracked campaign URL — the same job people look for under UTM generator, campaign URL builder or link tagging tool. It appends the five standard Google Analytics campaign parameters — utm_source, utm_medium, utm_campaign, utm_term and utm_content, plus an optional utm_id — and normalises every value as you type, converting spaces to underscores and stripping characters outside A–Z, 0–9, underscore and hyphen. The destination is checked with the browser's own URL parser and only http:// or https:// is accepted, so a link that builds is a link that works. Six one-click presets fill source and medium for Google Ads, Facebook, Instagram, LinkedIn, Twitter/X and email newsletters, the preview colour-codes the five standard parameters as they are added, and the builder itself works entirely in the page — no account, and nothing you type is uploaded.",
  useCases: [
    "You are scheduling the same landing page across four channels this week and need four links whose source and medium will not collide in the analytics report.",
    "Last month's report shows 'Facebook', 'facebook' and 'FB' as three separate sources, and you want the next campaign tagged consistently from the start.",
    "You are A/B testing two versions of a newsletter button and need utm_content to tell which one drove the clicks.",
    "You are handing a link to a partner, affiliate or creator and want the campaign name to match the one already used in your reporting.",
    "You are tagging a paid search landing page and want utm_term to carry the keyword you are bidding on.",
  ],
  benefits: [
    [
      "Values are cleaned before they reach the URL",
      "Spaces become underscores and stray punctuation is removed, which prevents the broken or split rows that appear when a campaign name contains a space, ampersand or emoji.",
    ],
    [
      "Existing query strings survive",
      "Parameters are written with searchParams.set on a parsed URL, so a destination that already carries its own query keeps it and any repeated UTM key is replaced rather than duplicated.",
    ],
    [
      "Presets encode the convention for you",
      "Google Ads fills source=google, medium=cpc; Instagram, LinkedIn and Twitter/X fill medium=social; the newsletter preset fills source=newsletter, medium=email — the standard pairings, applied identically every time.",
    ],
  ],
  faqs: [
    // First two entries answer measured queries the page was not addressing.
    // "what is utm builder" drew 56 impressions at position 17.9 with no
    // click, and the synonym queries ("utm generator tool", "utm creator
    // tool", "utm tagging tool", "utm parameter tool") add ~286 more — all
    // asking for this exact tool under a different name. Both answers are
    // definitional and describe only behaviour verified in Main.jsx.
    [
      "What is a UTM builder?",
      "A UTM builder is a form that writes campaign tracking parameters onto a link for you instead of you typing them by hand. You give it the destination page and the campaign details — where the link is going and what to call the campaign — and it returns the same page address with utm_source, utm_medium and utm_campaign appended in the format analytics tools expect. The point is consistency: typed by hand, one campaign easily becomes three rows in your report because of a capital letter, a space or a stray ampersand.",
    ],
    [
      "Is a UTM generator the same as a UTM builder?",
      "Yes — UTM builder, UTM generator, UTM link builder, campaign URL builder, UTM tagging tool and UTM parameter tool all describe the same job: adding utm_ parameters to a URL so analytics can attribute the click. There is no technical difference between them, only naming. This page does that job, including the optional utm_term, utm_content and utm_id fields.",
    ],
    [
      "What is a UTM parameter?",
      "A UTM parameter is a tag added to the end of a link — ?utm_source=newsletter&utm_medium=email — that tells your analytics where the click came from. The link opens exactly the same page; the extra values exist only for the report. Anyone can type them by hand, and a UTM builder simply keeps the spelling, spacing and punctuation identical every time.",
    ],
    [
      "What are the five UTM parameters and why does each one matter?",
      "utm_source names the specific origin (google, newsletter, partner_blog) and is what separates one referrer from another. utm_medium describes the kind of traffic (cpc, email, social) and is what lets you total all paid or all email traffic at once. utm_campaign groups every link belonging to one push, so a launch reads as a single line instead of twenty. utm_term records the paid keyword behind a click. utm_content separates two links inside the same email or ad — a header button from a footer button. Source, medium and campaign are the three worth filling every time; term and content matter when you need to compare inside one campaign. The builder also offers utm_id, an optional identifier for joining a link to a campaign record.",
    ],
    [
      "How do I build a UTM tracking link?",
      "Paste the destination URL, then click the preset for where the link is going — Google Ads, Facebook, Instagram, LinkedIn, Twitter/X or Email Newsletter — which fills utm_source and utm_medium and moves the cursor to the campaign name. Type the campaign, open Optional if you also need term, content or a campaign ID, and the tagged link appears in the preview panel as you type, colour-coded by parameter. Copy Tracking Link puts it on your clipboard.",
    ],
    [
      "Is this UTM builder free?",
      "Yes — no signup, no limit on how many links you build, and nothing to install. The builder runs entirely in your browser: it sends nothing you type anywhere and stores nothing, so the URLs you tag stay on your device.",
    ],
    [
      "What if my destination URL already has a query string?",
      "It survives. Parameters are written with searchParams.set on the parsed URL, so an existing ?ref=partner stays where it is and the UTM tags are appended after it. If the URL already carries a utm_ key, the value you enter replaces it instead of adding a second copy of the same parameter.",
    ],
    [
      "Which characters are stripped from my UTM values?",
      "Spaces become underscores, and anything outside letters, numbers, underscore and hyphen is removed before it reaches the link — so “Summer Sale 2026!” is written as Summer_Sale_2026. That is what stops one campaign splitting into several report rows because of a stray ampersand, comma or emoji. Case is left exactly as you typed it.",
    ],
    [
      "Should UTM values be uppercase or lowercase?",
      "Use lowercase consistently. Google Analytics treats utm_source=Facebook and utm_source=facebook as two different sources, which splits one campaign across multiple report rows — the builder strips punctuation and spaces for you, but it does not change case, so pick one convention and stick to it.",
    ],
    [
      "Why is my URL rejected?",
      "The base URL must parse as a valid absolute URL with an http: or https: scheme. Typing example.com alone fails and prompts you to add https:// at the start; other schemes such as ftp: or mailto: are not accepted.",
    ],
    [
      "Where do these tags show up in analytics?",
      "GA4 and any tool that follows the same convention read utm_source, utm_medium and utm_campaign into their source, medium and campaign dimensions, with utm_term and utm_content reported alongside them. The values are attributed to the visit that began with the tagged click, which is why tagged links belong on ads, emails and social posts rather than on internal navigation.",
    ],
    [
      "Do UTM tags slow down or hurt SEO on the destination page?",
      "They add query parameters, which can create duplicate URLs for the same page in a crawler's view. The usual practice is to keep tagged links to campaign traffic — ads, email and social posts — rather than internal navigation, and to let the page's canonical tag point at the clean URL.",
    ],
    [
      "Does the UTM builder work on a phone?",
      "Yes. It is one responsive form in a normal mobile browser: the platform presets are tap targets, the preview updates as you type, and Copy Tracking Link uses your phone's clipboard, so you can tag a link and paste it straight into a scheduled post.",
    ],
  ],
  steps: [
    "Paste the destination URL — it has to start with http:// or https://, and the builder tells you if it does not.",
    "Click the preset for the channel you are posting to, or type utm_source and utm_medium yourself, then name the campaign.",
    "Check the colour-coded preview, open Optional for term, content or a campaign ID, and copy the finished tracking link.",
  ],
};

export default seo;
