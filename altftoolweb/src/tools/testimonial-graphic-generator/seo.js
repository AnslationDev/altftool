const seo = {
  title: "Testimonial Graphic Generator: Quote Cards as PNG",
  metaDescription:
    "Set a quote, name, job title, company and half-star rating, pick a size such as 1080x1350 or 1080x1920, and download the card as a PNG.",
  steps: [
    "Type the testimonial and fill in the name, job title, company, source or date and a star rating from 0 to 5 in halves.",
    "Choose a placement size such as Instagram portrait at 1080x1350 or Story at 1080x1920, and pick a palette.",
    "Check the export size, quote contrast and story safe area, then press PNG to download testimonial-<preset>-<width>x<height>.png.",
  ],
  intro:
    "A testimonial graphic is a customer quote set as an image with the reviewer's name, role, company and star rating attached, and this generator lays one out at the exact pixel size each placement needs. Stars are drawn as true five-point polygons with the golden-ratio inner radius, half stars included, and the quote type is auto-fitted so a two-line and a six-line testimonial both sit correctly on the card. It also scores how complete the attribution is, because a quote with a full name, job title and company reads very differently from an anonymous one.",
  useCases: [
    "Turn a five-star G2 or Trustpilot review into a 1080x1350 Instagram post and a 1080x1920 story without redesigning it twice.",
    "Build a matching set of customer cards for a LinkedIn carousel so the whole sequence shares one palette and layout.",
    "Drop a testimonial slide into a 1920x1080 sales deck with the rating and the reviewer's title already in place.",
    "Check that a light card on a light background still clears the 4.5:1 contrast threshold before a campaign goes out.",
  ],
  benefits: [
    ["Proper star geometry", "Ten-vertex stars with a 0.382 inner radius and half-star clipping, not a font glyph that shifts between devices."],
    ["Attribution scoring", "Weights name, title, company, rating and source so you can see what is missing before you publish."],
    ["Fits any length", "Word wrap plus a font-size search keeps a 40-word testimonial inside the card at a readable size."],
  ],
  faqs: [
    [
      "What makes a testimonial graphic convincing?",
      "A full name, a job title and a company. Readers discount anonymous or first-name-only quotes heavily, which is why this tool weights those three fields at 70% of the attribution score and treats the star rating and the source date as the remaining 30%.",
    ],
    [
      "Do I need permission to publish a customer testimonial?",
      "Generally yes. Using someone's name, job title, employer or likeness in marketing normally needs their consent, and in several markets that consent has to be recorded. Get it in writing before you post, and check with your legal team if the review came from a third-party platform with its own terms.",
    ],
    [
      "What size should a testimonial post be?",
      "1080x1350 for an Instagram feed post, 1080x1920 for a story or Reel, 1200x627 for LinkedIn and 1920x1080 for a deck slide. On story sizes keep the content out of the top 250 and bottom 420 pixels, which the app covers with its own interface.",
    ],
    [
      "How long should the quote be?",
      "One or two sentences, roughly 120 to 200 characters, is what actually gets read in a feed. This tool sets a hard limit at 420 characters because beyond that the type has to shrink below a readable size on a phone.",
    ],
  ],
};

export default seo;
