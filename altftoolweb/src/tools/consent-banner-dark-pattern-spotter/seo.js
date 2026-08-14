const seo = {
  title: "Cookie Banner Dark Pattern Checker: 14 Tricks Scored",
  metaDescription:
    "Tick what a cookie banner does and score it against 14 patterns EU regulators name, with the rule each one runs into and how to refuse.",
  steps: [
    "Under 'What does the banner do?' tick everything you can see across the four groups — Removing the choice, Steering the eye, Misleading labels and Wearing you down — covering 14 patterns from 'No refuse button on the first screen' to 'Non-essential toggles switched on by default' and 'Advertising hidden under legitimate interest'.",
    "Enter 'Clicks to accept everything' and 'Clicks to refuse everything', each between 1 and 20, so the extra clicks refusal costs are counted.",
    "Read the Manipulation score percentage with its band, the 'Patterns found, worst first' list showing each Severity out of 5 plus the rule it runs into, and the 'What to do on this banner' steps, then press 'Copy report'.",
  ],
  intro:
    "Consent Banner Dark Pattern Spotter scores a cookie banner against 14 manipulative design techniques that EU regulators have named directly, plus the click asymmetry between accepting and refusing. Each pattern is tied to the rule it runs into — GDPR Article 4(11) on freely given consent, Recital 32 on pre-ticked boxes, Article 7(3) on withdrawal being as easy as consent, and the EDPB Cookie Banner Taskforce report adopted in January 2023. The output is a manipulation percentage, the findings ranked by severity, and the exact steps to refuse on the banner in front of you.",
  useCases: [
    "Working out how to actually say no on a news site whose banner only offers 'Accept all' and 'Manage options'.",
    "Teaching a class or a team to recognise the difference between a lawful banner and a steered one.",
    "Reviewing your own site's consent flow before a privacy audit, using the same checklist regulators publish.",
    "Explaining to a colleague why a default-on 'legitimate interest' tab is not the same as consent.",
  ],
  benefits: [
    [
      "Every pattern cites a rule",
      "Findings reference the specific article, recital or regulator position rather than general opinion.",
    ],
    [
      "Measures the click asymmetry",
      "Counts the extra clicks refusal costs, the single most consistent signal that a banner is steering you.",
    ],
    [
      "Gives you the next step",
      "The advice adapts to what you ticked, so you know whether to open a hidden tab or clear the site's cookies.",
    ],
  ],
  faqs: [
    [
      "Is a cookie banner without a reject button legal in the EU?",
      "The common position of EU data protection authorities, set out in the EDPB Cookie Banner Taskforce report of January 2023, is that a refuse option should be available on the first layer of the banner. Making refusal require an extra step into a settings panel while acceptance takes one click is one of the most frequently complained-about designs, and several national authorities have issued fines over exactly this asymmetry.",
    ],
    [
      "Are pre-ticked cookie boxes allowed?",
      "No. GDPR Recital 32 states that silence, pre-ticked boxes and inactivity do not constitute consent, and the Court of Justice confirmed this in Planet49 (C-673/17, October 2019). Non-essential categories must be switched off by default, so consent comes from a deliberate action rather than from the visitor not noticing a toggle.",
    ],
    [
      "What counts as a strictly necessary cookie?",
      "Only what is required to deliver the service the visitor actually asked for — session handling, authentication, security, load balancing, and remembering items in a basket. The exemption in Article 5(3) of the ePrivacy Directive does not cover analytics, audience measurement for the site owner's own benefit, or advertising, so listing those as strictly necessary removes a choice the visitor is entitled to make.",
    ],
    [
      "What is 'legitimate interest' in a cookie banner?",
      "It is a second set of toggles, usually switched on by default and placed on a separate tab, claiming a legal basis other than consent for the same tracking. The EDPB taskforce flagged this as a problem: where consent is required to store or read information on a device, legitimate interest cannot be used to reinstate processing that the visitor has just refused. Always open that tab and switch it off as well.",
    ],
  ],
};

export default seo;
