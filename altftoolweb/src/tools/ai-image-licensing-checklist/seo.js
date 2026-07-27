const seo = {
  intro:
    "This checklist scores how ready an AI-generated image is for commercial use across eight usage-rights questions — licence tier, real-person likeness, trademarks, artist-style prompts, copyrightability, indemnification, platform rules and record-keeping. High-risk items weigh double, and any high-risk failure marks the image not ready regardless of the overall score. It reflects documented positions such as the US Copyright Office's March 2023 guidance that purely AI-generated material is not copyrightable, and provider terms like Midjourney's non-commercial free tier.",
  useCases: [
    "A small business owner verifying an AI hero image is safe to use on a paid landing page before launch",
    "A freelancer documenting a licensing check for a client deliverable that includes generated illustrations",
    "A marketer screening campaign images for likeness, logo and artist-style issues before an ad platform submission",
  ],
  benefits: [
    ["Risk-weighted score", "High-risk items (licence, likeness, trademarks) count double, and any one of them failing flags the image as not ready."],
    ["Grounded in real rules", "Items cite verifiable positions — Copyright Office guidance, Midjourney's CC BY-NC free tier, Firefly and Getty indemnification."],
    ["Copyable audit record", "Export the full answered checklist with the score as a text record for the project file."],
  ],
  faqs: [
    [
      "Can I use AI-generated images commercially?",
      "Usually yes, if your plan's terms grant commercial rights — but the rights come from the provider's licence, not from copyright law, and they differ by tier. Midjourney, for example, licenses free-tier images under CC BY-NC 4.0 (non-commercial only) while paid subscribers receive commercial usage rights; OpenAI grants ownership of DALL·E outputs to the user under its terms.",
    ],
    [
      "Do I own the copyright to an AI-generated image?",
      "In the United States, a purely AI-generated image is not protected by copyright at all: the Copyright Office's March 2023 registration guidance holds that copyright requires human authorship. You can often use the image commercially under the provider's licence, but you may be unable to stop anyone else from copying it unless your own creative additions — selection, editing, composition — add protectable human authorship.",
    ],
    [
      "What are the biggest legal risks of using AI images in marketing?",
      "Three issues rank highest: a licence tier that does not actually permit commercial use, a recognisable real person (right-of-publicity and privacy claims), and visible trademarks or trade dress (infringement independent of copyright). Each of these is a high-risk item in this checklist, and any one failing means the image should not be published until it is resolved.",
    ],
    [
      "Does any AI image tool protect me if I get sued?",
      "A few enterprise offerings do: Adobe Firefly and Getty Images' generative tool include IP indemnification for commercial customers, meaning the vendor defends covered claims over the output. Most consumer tools offer no indemnity and place the risk on the user, which is why indemnification is a checklist item for high-stakes projects. This tool is informational — consult an IP lawyer for significant commercial uses.",
    ],
  ],
};

export default seo;
