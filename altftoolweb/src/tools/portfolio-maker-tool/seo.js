const seo = {
  intro:
    "Portfolio Maker turns a short form — name, professional title, bio, contact links, up to three projects and up to four skills — into a finished single-page portfolio layout with a gradient hero, project cards and skill badges. You fill the fields, press generate, and the rendered page appears immediately, with empty fields simply left out rather than showing blanks. It suits students, career changers and freelancers who need a presentable profile page today and do not want to start from a blank editor.",
  useCases: [
    "You are applying for your first developer role, have three side projects and need a single page that presents them better than a bullet list in a CV.",
    "A freelancer wants a clean profile to link from a proposal, with an email link and GitHub and LinkedIn icons already wired up.",
    "You are drafting the content for a portfolio site and want to see how your bio and project blurbs read in a real layout before committing them to a builder.",
  ],
  benefits: [
    [
      "Structure decided for you",
      "The layout fixes the hard part — hero, featured projects, skills, contact — so the only work left is writing the words that go in each slot.",
    ],
    [
      "Blank fields disappear",
      "Projects without a name and unused skill slots are filtered out of the render, so a two-project portfolio looks deliberate rather than half-finished.",
    ],
    [
      "Usernames, not full URLs",
      "Enter just your GitHub and LinkedIn handles and the correct profile links are built for you, which removes the most common broken-link mistake.",
    ],
  ],
  faqs: [
    [
      "How many projects and skills can I add?",
      "Three projects and four skills. Each project takes a name plus an optional description, and any project left unnamed is dropped from the layout entirely.",
    ],
    [
      "Can I download the portfolio as an HTML file?",
      "No — the output is a live preview rendered in the page, not an exported file or a hosted site. Use it to draft and see the layout, then copy your finished text into a site builder or static-site template for publishing.",
    ],
    [
      "Do I need to enter full profile URLs?",
      "Only for your website. GitHub and LinkedIn take the username alone, and the tool builds github.com and linkedin.com/in links around it; the email field becomes a mailto link.",
    ],
    [
      "Is my information saved?",
      "No. Everything you type stays in the page for the current session and is not stored in the browser or sent to a server, so copy anything you want to keep before you navigate away.",
    ],
  ],
};

export default seo;
