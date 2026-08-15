const seo = {
  title: "Strip utm, gclid & fbclid Tracking From URLs",
  metaDescription:
    "Clean up to 200 links at once: removes utm_, gclid, fbclid, msclkid and mc_eid, keeps the rest byte-for-byte, and lists what it took off each link.",
  steps: [
    "Paste your links into the 'Links, one per line' textarea, whose placeholder is https://example.com/page?utm_source=… . Over 200 lines it stops with 'That is more than 200 links — split the list into smaller batches.'",
    "Leave 'Also strip site-specific tags' unticked to keep Amazon affiliate tags and YouTube share ids, or tick it to drop those too. The Parameters removed count and Characters saved update as you type.",
    "Take the output from the Cleaned links box with Copy result. Each row beneath lists the cleaned URL with a chip such as −utm_source or −fbclid for every parameter dropped, or 'Nothing to remove on this one.'",
  ],
  intro:
    "Tracking parameters are the part of a link that identifies the campaign, the ad click or the individual recipient — utm_source and its family, gclid from Google Ads, fbclid from Meta, msclkid from Bing, mc_eid from Mailchimp — and none of them affect which page loads. This tool removes them from one link or two hundred, matching both an explicit list and prefix rules such as utm_, pk_ and mtm_, and passes through everything it keeps with the original encoding intact. Site-specific tags like an Amazon affiliate tag or a YouTube share id sit behind a separate switch, because removing those changes who gets credit for the click.",
  useCases: [
    "Cleaning a link before pasting it into a group chat, so you are not forwarding the recipient id from the email you got it in.",
    "Tidying a list of campaign URLs exported from an analytics report into their canonical form.",
    "Removing an affiliate tag from a product link you want to share neutrally.",
    "Comparing two links that point at the same page but arrived through different campaigns.",
  ],
  benefits: [
    ["Bulk and local", "Paste up to 200 links at once; nothing is uploaded, so links from private inboxes stay private."],
    ["Encoding is preserved", "The query is rebuilt by splitting on the ampersand rather than re-encoding, so surviving parameters are byte-for-byte what you pasted."],
    ["Says what it removed", "Every removed parameter is listed with the platform that reads it, so you can see when a link was carrying a personal identifier."],
  ],
  faqs: [
    [
      "What does utm_source mean in a URL?",
      "It names the campaign source for analytics — the newsletter, the social post or the partner site the visit came from. UTM parameters (utm_source, utm_medium, utm_campaign, utm_term, utm_content) originated with Urchin, the analytics product Google acquired in 2005, and they have no effect on which page is served.",
    ],
    [
      "Is it safe to delete gclid and fbclid from a link?",
      "Yes for reading the page. gclid is the Google Click Identifier and fbclid the Facebook Click Identifier; both exist to attribute a visit back to an ad click and neither is needed to load the content. The only consequence is that the advertiser cannot match your visit to the click.",
    ],
    [
      "Can a link in an email identify me personally?",
      "Yes. Parameters such as mc_eid from Mailchimp, vero_id, and various subscriber-hash fields identify the individual recipient, so forwarding the link as you received it can reveal which subscriber you are. Those are removed here by default.",
    ],
    [
      "Will stripping parameters ever break a link?",
      "Rarely, but it can. Some sites carry working state in the query string — a search term, a page number, a video start time — and this tool deliberately leaves parameters it does not recognise alone for exactly that reason. Open a cleaned link once before sharing it widely.",
    ],
  ],
};

export default seo;
