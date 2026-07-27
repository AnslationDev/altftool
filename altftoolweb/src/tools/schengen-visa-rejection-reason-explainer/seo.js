const seo = {
  intro:
    "This explainer decodes the numbered tick-boxes on a Schengen visa refusal form and turns each one into a checklist of the evidence that normally answers it. Every Schengen consulate refuses on the same standard form set out in Annex VI of the Visa Code, Regulation (EC) No 810/2009 as amended by Regulation (EU) 2019/1155, so box 2, box 3 and box 11 mean exactly the same thing whether the decision came from Paris, Warsaw or Lisbon. Select the grounds that were ticked on your notice to see what the officer was actually saying, how serious it is, and what to fix before you reapply.",
  useCases: [
    "You received a refusal form with box 11 ticked and want to know what evidence of ties would have changed the outcome.",
    "You are deciding between appealing under Article 32(3) and simply reapplying with a stronger file.",
    "A travel agent filed your application, the file came back refused on document authenticity, and you need to work out what to verify yourself before trying again.",
  ],
  benefits: [
    ["Reads the actual form", "Grounds are mapped to the Annex VI box numbers and the Visa Code articles behind them, not to guesswork."],
    ["Separates paperwork from credibility", "An insurance gap is a one-day fix; a doubt about your intention to return needs a different application entirely."],
    ["Gives you a scored checklist", "Tick off each fix and see how much of the refusal reason you have actually closed before you pay another fee."],
  ],
  faqs: [
    [
      "What does it mean when box 11 is ticked on a Schengen refusal?",
      "Box 11 means the consulate had reasonable doubts about your intention to leave the Schengen area before the visa expired, under Article 32(1)(b) of the Visa Code. It is a judgement on the strength of your home ties as shown in the file - employment, income, dependants, property, prior travel - and not an accusation of dishonesty, so it is answered with more evidence of what you are returning to rather than with an apology.",
    ],
    [
      "Can I appeal a Schengen visa refusal, and how long do I have?",
      "Yes. Article 32(3) of the Visa Code gives a right of appeal, brought against the Member State that took the decision and conducted under that state's own national law. The deadline is set nationally and is printed on the refusal form itself, so read the bottom of the form: the windows are short, often counted in weeks from notification, and they differ between countries.",
    ],
    [
      "How much travel insurance does a Schengen visa need?",
      "Article 15 of the Visa Code requires travel medical insurance of at least EUR 30,000, covering emergency medical care, urgent hospital treatment and repatriation, valid throughout the Schengen area for the full period of the requested stay. A policy that is a few days short, or valid only for the destination country, is enough on its own to trigger box 7.",
    ],
    [
      "How soon can I reapply after a Schengen visa refusal?",
      "There is no mandatory waiting period - you may reapply the next day and pay the fee again. In practice a reapplication only succeeds if something in the file has changed, so fix the specific ground first: a missing insurance certificate can be cured immediately, while a doubt about your intention to return usually needs months of new evidence, and an alert in the Schengen Information System has to be lifted by the state that entered it before any consulate can approve you.",
    ],
  ],
};

export default seo;
