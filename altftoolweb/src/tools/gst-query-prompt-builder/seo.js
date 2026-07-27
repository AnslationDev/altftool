const seo = {
  intro:
    "This builder frames a GST question as an AI prompt with informational, non-advisory guardrails: it anchors the answer to the governing sections of the CGST Act, demands a citation for every substantive statement, and forbids the model from concluding on your specific liability. It also runs a real registration check against the section 22 thresholds (Rs 40 lakh for goods, Rs 20 lakh for services, Rs 10 lakh in special category states) and computes statutory return due dates. Built for Indian business owners and freelancers who use AI to understand GST before talking to their CA.",
  useCases: [
    "A freelancer at Rs 18 lakh turnover asking whether registration is needed, with the Rs 20 lakh services threshold and section 24 overrides framed into the prompt",
    "A trader checking the ITC conditions under sections 16 and 17(5) with the prompt forcing GSTR-2B matching and the 180-day payment rule into the answer",
    "A composition dealer looking up the statutory CMP-08 and GSTR-4 due dates and building a notice-reply outline for a section 73 demand",
  ],
  benefits: [
    ["Statute-anchored prompts", "Each of ten topics carries its governing sections, rules and known traps, so the AI reasons from the law, not vibes."],
    ["Real threshold check", "Section 22/24 registration logic with the actual Rs 40/20/10 lakh figures runs on your turnover before the prompt is built."],
    ["Non-advisory by design", "The prompt orders the model to separate settled law from contested positions and to route final conclusions to a CA."],
  ],
  faqs: [
    [
      "What is the turnover limit for GST registration?",
      "Rs 40 lakh aggregate turnover for suppliers of goods in normal category states and Rs 20 lakh for services, under section 22 of the CGST Act read with Notification 10/2019-Central Tax; in the special category states of Manipur, Mizoram, Nagaland and Tripura the limits are Rs 20 lakh and Rs 10 lakh. Section 24 makes registration compulsory regardless of turnover for cases like inter-state supply of goods and selling through e-commerce operators that collect TCS.",
    ],
    [
      "Can I use ChatGPT or other AI for GST questions?",
      "As an explainer, yes — but only with guardrails, because GST rates and rules change by notification faster than model training data. A safe prompt forces citations to sections and rules, forbids the model from stating rates from memory, and ends by listing what to verify on the GST portal and what to ask a chartered accountant.",
    ],
    [
      "What are the due dates for GSTR-1 and GSTR-3B?",
      "Under the CGST Rules, monthly GSTR-1 is due by the 11th and GSTR-3B by the 20th of the following month; quarterly GSTR-1 under QRMP is due by the 13th after the quarter ends. CBIC extends dates by notification fairly often, so the statutory date is the starting point, not a guarantee — check the portal for the current period.",
    ],
    [
      "Is the answer from this tool professional tax advice?",
      "No — the tool and the prompts it builds are informational only. They reproduce published thresholds and statutory due dates and force the AI to show the law behind its statements, but how the law applies to your facts (aggregate turnover composition, blocked credits, place of supply) must be confirmed by a chartered accountant.",
    ],
  ],
};

export default seo;
