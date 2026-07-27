const seo = {
  intro:
    "This builder divides LinkedIn's 220-character headline field into the positioning segments you choose — role, niche, proof, call to action — and writes an AI prompt that carries that exact character budget, your search keywords and your goal into the instruction. It also measures a draft headline against the limit and shows the opening characters that survive truncation in search results and comment threads. The same run produces a second prompt for the 2,600-character About section.",
  useCases: [
    "A product manager applying for director roles who needs a headline recruiters will find when they search a job title, not a clever tagline",
    "A freelance designer rewriting a headline so it names the client outcome rather than the job title, and an About section that ends with a clear next step",
    "A consultant checking whether a 240-character draft will even save, and which of four target keywords fall inside the visible opening",
  ],
  benefits: [
    ["Hard limits enforced", "Budgets against LinkedIn's real 220-character headline and 2,600-character About maximums."],
    ["Front-load check", "Shows which keywords land in the opening characters that readers see before the headline is cut off."],
    ["Cliché filter", "The prompt bans buzzwords like guru, rockstar and results-driven, and flags them in your draft."],
  ],
  faqs: [
    [
      "How many characters can a LinkedIn headline be?",
      "220 characters. LinkedIn raised the member headline limit from 120 to 220 characters in 2020, and the field simply will not save text beyond that. The About section is separate and allows up to 2,600 characters.",
    ],
    [
      "What should I put in my LinkedIn headline?",
      "Lead with the job title someone would type into search, then the niche or industry, then one concrete proof point. Recruiters search by title, so 'Product Manager | Fintech Payments | UPI success 88% to 96%' is found where 'Turning ideas into impact' is not.",
    ],
    [
      "Does the whole headline show everywhere on LinkedIn?",
      "No. The full 220 characters appear on your profile page, but search results, comment threads and connection requests show a shortened version, and how much is shown varies by device and screen width. Put the term you most want to be found for at the very start.",
    ],
    [
      "Can I just paste an AI-written headline straight onto my profile?",
      "Check it first. Models routinely invent job titles, employers, certifications and metrics, so verify every claim against your real record — the prompt this tool generates explicitly tells the model to leave a bracketed blank rather than fabricate a number.",
    ],
  ],
};

export default seo;
