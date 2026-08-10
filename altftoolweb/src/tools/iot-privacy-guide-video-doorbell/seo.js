const seo = {
  title: "Video Doorbell Privacy Setup: Score 15 Controls",
  metaDescription:
    "Tick 15 weighted controls across account, framing, recordings and network, and see how many days of clips your card or plan holds before overwrite.",
  intro:
    "This guide scores a video doorbell installation against fifteen weighted controls covering account access, camera framing, recording retention and network isolation, and estimates how many days of clips your card or cloud plan actually holds. Controls that stop a stranger opening the live view are weighted highest, and any missing critical control caps the score so a well-framed camera on a weak account never reads as safe. It suits anyone setting up a doorbell that overlooks a shared path, a pavement or a neighbour's door.",
  useCases: [
    "Setting up a new doorbell and wanting the privacy zones, motion zones and audio decision made before the first recording lands in the cloud.",
    "A neighbour has complained that your camera watches their front door, and you need a defensible record of the masking and framing you applied.",
    "Working out whether a 32 GB card is enough at 2K, or whether the older clips are already being overwritten before you would ever review them.",
    "Auditing an inherited installation after moving in, where old shared users and installer accounts may still have live-view rights.",
  ],
  benefits: [
    ["Weighted, not a flat list", "Two-step verification and shared-user cleanup outrank cosmetic settings, so the score reflects real exposure."],
    ["Storage maths included", "Bitrate, clip length and event count turn into the number of days your footage survives before overwrite."],
    ["Neighbour-aware", "Zones, audio and signage are treated as part of the setup rather than optional extras."],
  ],
  faqs: [
    [
      "Can my doorbell camera legally record the pavement or my neighbour's door?",
      "Usually yes for genuine home security, but once the camera captures beyond your own boundary most data protection regimes expect you to justify it, minimise it and tell people it is there. In the UK the ICO says the household exemption from UK GDPR does not apply to footage of areas outside your property, so use privacy zones, put up a notice, and take proper legal advice if a neighbour formally objects.",
    ],
    [
      "Should I turn off audio recording on a video doorbell?",
      "Turn it off unless you have a specific reason to keep it. Audio is regulated far more strictly than video — several US states require all parties to consent to recording a conversation — and a doorbell microphone can pick up speech several metres past your boundary, well beyond what the camera needs to see.",
    ],
    [
      "How much storage does a doorbell use per day?",
      "At 1080p, roughly 2 Mbps of H.264 video, a 30-second clip is about 7.5 MB, so 25 events a day is around 190 MB — a 32 GB card holds about 170 days. Move to 4K at 8 Mbps and the same 25 events use about 750 MB a day, which fills that card in around six weeks.",
    ],
    [
      "Is local SD-card storage safer than cloud recording?",
      "Local storage keeps footage off a vendor's servers and out of scope for bulk requests, but the card can be stolen with the device and is rarely encrypted at rest. The stronger combination is local or end-to-end encrypted recording plus two-step verification on the account; end-to-end encryption normally disables server-side features such as person detection, so choose knowingly.",
    ],
  ],
};

export default seo;
