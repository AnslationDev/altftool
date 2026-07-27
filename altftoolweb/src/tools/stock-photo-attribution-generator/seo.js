const seo = {
  intro:
    "This generator turns the details of a photo — creator, title, source and licence — into a credit line formatted the way that licence expects, in plain text, HTML or Markdown. Creative Commons images follow the TASL pattern (Title, Author, Source, Licence) that Creative Commons itself recommends, while Unsplash, Pexels, Pixabay, Adobe Stock, Shutterstock and Getty images use each library's own published wording. It also flags licence conditions you have to honour, such as ShareAlike, NonCommercial and the CC 4.0 rule that modifications must be disclosed.",
  useCases: [
    "Credit a CC BY-SA 2.0 photo pulled from Flickr in a blog post, with the licence deed linked so readers can verify it.",
    "Produce the exact 'Photo by … on Unsplash' line with both links so a contributor's profile gets the referral traffic.",
    "Format an editorial Getty or Shutterstock credit that has to sit adjacent to the image in a news article.",
    "Generate the HTML snippet for a caption in a CMS where you cannot type raw anchor tags by hand.",
  ],
  benefits: [
    ["TASL by default", "Creative Commons credits follow Title, Author, Source, Licence — the order CC publishes."],
    ["Licence conditions surfaced", "Warns when a licence is NoDerivatives, NonCommercial or ShareAlike before you publish."],
    ["Three output formats", "Plain text for captions, anchor-tagged HTML for a CMS, Markdown for docs and READMEs."],
  ],
  faqs: [
    [
      "What is the correct way to attribute a Creative Commons photo?",
      "Use the TASL pattern: the image Title, the Author, the Source it came from, and the Licence — with the licence name linked to its deed, for example \"Mountain Sunrise\" by A. Rivera via Wikimedia Commons is licensed under CC BY-SA 4.0. If you cropped or edited the image, CC 4.0 licences also require you to state that it was modified.",
    ],
    [
      "Do I have to credit Unsplash, Pexels or Pixabay photos?",
      "No — those licences do not make attribution a condition of use, so a credit is courtesy rather than obligation. Each platform still publishes a preferred wording (\"Photo by [name] on Unsplash\") and linking the creator's profile is the standard way contributors get discovered.",
    ],
    [
      "What does CC0 mean for attribution?",
      "CC0 1.0 is a public domain dedication, so the creator has waived their copyright and no attribution is legally required. A credit is still good practice because it lets readers trace the source and confirms you did not lift the image from a licensed library by mistake.",
    ],
    [
      "Can I crop or recolour a Creative Commons image?",
      "Only if the licence is not a NoDerivatives one — CC BY-ND and CC BY-NC-ND prohibit publishing adapted versions. Under the other CC 4.0 licences you may adapt the work but must indicate that changes were made, and ShareAlike licences additionally require your adaptation to carry the same licence. This is informational; check the licence deed or ask a lawyer if the use is commercially significant.",
    ],
  ],
};

export default seo;
