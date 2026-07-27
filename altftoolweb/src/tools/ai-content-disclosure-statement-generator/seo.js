const seo = {
  intro:
    "This generator writes the three disclosure texts a single AI-assisted asset normally needs — a full statement for the page, a short label to sit beside the asset, and a metadata credit line for provenance — and then lists which published obligations that asset engages. The obligations come from Articles 50(2) and 50(4) of Regulation (EU) 2024/1689, the EU AI Act, whose transparency duties apply from 2 August 2026, alongside FTC clear-and-conspicuous expectations and the labelling rules of YouTube, Meta and TikTok. It is built for content, social and brand teams publishing AI-assisted images, video, audio and text across several channels at once.",
  useCases: [
    "A social team publishing the same AI-generated image to Instagram and a paid campaign, needing both a caption label and an ad-safe statement",
    "A studio releasing an AI voice-over and working out whether the deep fake disclosure in Article 50(4) applies",
    "An editorial team labelling AI-drafted explainers on a public-interest topic and naming who holds editorial responsibility",
  ],
  benefits: [
    ["Three formats from one answer", "Long statement, short label and a C2PA-style credit line, so the same asset is labelled consistently everywhere."],
    ["Obligations, not vibes", "Names the specific provision or platform rule engaged by the asset type, realism, subject and channel."],
    ["Refuses the one unsafe case", "Will not produce a label for a photorealistic depiction of a real person published without human review."],
  ],
  faqs: [
    [
      "When do the EU AI Act's AI disclosure rules start applying?",
      "The AI Act entered into force on 1 August 2024 and its general application date, which covers the Article 50 transparency obligations, is 2 August 2026. Article 50(2) requires synthetic audio, image, video and text to be marked in a machine-readable format and be detectable as artificially generated. Article 50(4) requires deployers to disclose deep fakes, and to disclose AI-generated text published to inform the public on matters of public interest unless it underwent human review with someone holding editorial responsibility.",
    ],
    [
      "Do I have to label an AI-generated image on Instagram or TikTok?",
      "Yes, if it is realistic. Meta applies 'AI info' labelling and can detect provenance signals such as C2PA Content Credentials embedded by the generating tool; TikTok requires creators to use its AI-generated content toggle and also reads Content Credentials; YouTube requires creators to disclose realistic altered or synthetic content in the upload flow. Where the file carries no provenance metadata, the platform relies on your own declaration.",
    ],
    [
      "What counts as a deep fake under the AI Act?",
      "Article 50(4) addresses AI-generated or AI-manipulated image, audio or video content that resembles real persons, objects, places or events and would falsely appear authentic. In practice the combination that matters is photorealism plus an identifiable real person or a real-looking event — stylised illustration and obviously synthetic art are a different case. Labelling is also not a substitute for consent from anyone depicted.",
    ],
    [
      "Is a site-wide AI policy page enough of a disclosure?",
      "Generally no. FTC guidance treats a disclosure as effective only when it is clear and conspicuous — placed with the content or claim it qualifies, not behind a link or in a separate policy page. Put the short label with the asset, keep the full statement on the same page, and preserve any machine-readable marking the generating tool applied rather than stripping it during export.",
    ],
  ],
};

export default seo;
