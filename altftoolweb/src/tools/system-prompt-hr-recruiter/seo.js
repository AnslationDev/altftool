const seo = {
  intro:
    "This builder generates a system prompt for an AI recruiting assistant with fairness and privacy constraints written in as hard rules — never inferring protected characteristics, avoiding proxy criteria like postcodes and career gaps, and keeping every hiring decision with a human. The rule text reflects US protected classes under Title VII, the ADEA, the ADA and GINA, plus GDPR-style data minimisation. It is for recruiters and HR teams who want AI drafting help without drifting into regulated automated decision-making.",
  useCases: [
    "An in-house recruiter setting up an assistant that drafts job descriptions and outreach while structurally barred from scoring candidates on protected traits",
    "An HR lead preparing for a NYC Local Law 144 conversation by ensuring the assistant's prompt states that humans make every employment decision",
    "A startup founder who hires occasionally and wants screening questions that map one-to-one to written job requirements instead of gut feel",
  ],
  benefits: [
    ["Fairness as hard rules", "Protected-characteristic, proxy-criteria and structured-criteria rules are written into the prompt, not left to model defaults."],
    ["Human-decision safeguard", "A one-click rule keeps the assistant drafting and summarising while humans make every screening and hiring call."],
    ["Privacy constraints included", "Data minimisation, confidentiality between candidates and no-PII-echo rules based on GDPR vocabulary."],
  ],
  faqs: [
    [
      "Can I legally use AI to screen job candidates?",
      "In many places yes, but with growing conditions: New York City's Local Law 144 requires an independent bias audit and candidate notice before using an automated employment decision tool, the EU AI Act classifies recruitment AI as high-risk, and Illinois regulates AI video-interview analysis. The safest pattern — and this builder's default — is AI that drafts and structures while a human makes every actual decision. Confirm your jurisdiction's rules with employment counsel.",
    ],
    [
      "What are protected characteristics an AI recruiter must never use?",
      "Under US federal law: race, colour, religion, sex and national origin (Title VII), age 40 and over (ADEA), disability (ADA) and genetic information (GINA); many states and other countries add sexual orientation, gender identity, marital status and pregnancy. A good prompt also bans proxies for these — names, photos, postcodes, graduation years and career gaps — because a model can discriminate through proxies without ever naming the protected trait.",
    ],
    [
      "How do I make an AI hiring assistant fair?",
      "Constrain it to the same written, job-related criteria for every candidate, require it to quote evidence for every judgement, ban inference of protected characteristics and their proxies, and keep the final decision with a human. Prompt rules reduce risk but do not eliminate model bias, so pair them with structured interviews and periodic review of outcomes across candidate groups.",
    ],
    [
      "What candidate data can an AI assistant use under GDPR?",
      "Only what is necessary for the recruitment purpose — GDPR Article 5(1)(c) data minimisation — and candidates must be informed how their data is processed. In practice that means the assistant works from submitted applications and stated public professional profiles, does not speculate about health, family or finances, and never spreads one candidate's details into another candidate's file. This tool encodes those limits as prompt rules; your data-processing basis still needs its own legal review.",
    ],
  ],
};

export default seo;
