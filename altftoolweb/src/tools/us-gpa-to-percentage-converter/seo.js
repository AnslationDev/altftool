const seo = {
  intro:
    "This converter turns a US 4.0-scale GPA back into an approximate percentage using the linear formula (GPA ÷ 4 × 100) that most application forms specify, and also reports the nearest US letter grade with its standard classroom percentage band (A = 93-96%, B = 83-86%, and so on). It is built for US-educated students filling in Indian or other national application forms that demand a percentage instead of a GPA.",
  useCases: [
    "A US-schooled applicant to an Indian university entering the percentage equivalent of a 3.5 GPA on an admission form",
    "A scholarship application that asks for marks in percent when the transcript only shows a 4.0-scale GPA",
    "An employer's HR portal that validates the marks field as 0-100 and rejects GPA values",
  ],
  benefits: [
    ["Two readings", "Linear GPA ÷ 4 × 100 plus the letter-grade percentage band, so you can cite either."],
    ["Standard band table", "Uses the common US registrar scale from A+ (97-100) down to F (below 60)."],
    ["Weighted GPA guard", "Flags GPAs above 4.0 instead of producing a misleading percentage."],
  ],
  faqs: [
    [
      "What percentage is a 3.5 GPA?",
      "87.5% by the linear conversion (3.5 ÷ 4 × 100), which is the formula most forms expect. By letter-grade bands a 3.5 sits between B+ and A-, roughly the 87-92% classroom range, so quoting 87.5% with the method named is the defensible answer.",
    ],
    [
      "How do I convert a 4.0 GPA to a percentage?",
      "A 4.0 GPA converts to 100% linearly, but it is more honestly described as an A/A+ average, which corresponds to roughly 93-100% in US classrooms. US registrars do not certify percentage equivalents, so state the conversion method whenever a form requires one.",
    ],
    [
      "Is GPA to percentage conversion official?",
      "No — US institutions report GPA only and do not issue percentage equivalents. When a foreign form demands a percentage, the accepted practice is to apply a stated method (usually GPA ÷ 4 × 100), attach the original transcript, and let the receiving institution evaluate it.",
    ],
    [
      "Why is my weighted GPA above 4.0 and can I convert it?",
      "Weighted GPAs add bonus points for Honors (+0.5) and AP/IB (+1.0) courses, so they can reach 5.0, and there is no standard percentage mapping for them. Convert your unweighted 4.0-scale GPA instead, which is what universities compare across applicants.",
    ],
  ],
};

export default seo;
