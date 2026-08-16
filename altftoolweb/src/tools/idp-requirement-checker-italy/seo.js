const seo = {
  title: "Italy IDP Checker: Do You Need One?",
  steps: [
    "Choose where your licence was issued, what you already hold, and why you are in Italy from the three dropdowns.",
    "Add the date you arrive, an optional departure date and your age in years; the verdict recalculates as you type.",
    "Read the verdict, the \"How long your licence works here\" row and the \"Carry in the car\" list, then press Copy result.",
  ],
  intro:
    "This checker tells you whether Italy expects an International Driving Permit alongside your national licence, based on where the licence was issued, why you are in the country and your age. It applies Article 135 of the Codice della Strada, which lets a non-EU licence be used in Italy only when it is accompanied by an International Driving Permit or a sworn Italian translation, and Article 136, which stops that licence working once you have held registered residence for more than a year. Italy is party to both the 1949 Geneva and the 1968 Vienna Conventions, so either permit format counts.",
  useCases: [
    "Deciding before a Tuscany road trip whether a US or Australian licence needs a permit at the hire desk",
    "Working out the date a non-EU licence stops working after registering residenza anagrafica with an Italian comune",
    "Confirming that an EU, UK or Swiss licence needs nothing extra at all",
  ],
  benefits: [
    ["Names the article", "Every verdict cites the Codice della Strada article it comes from rather than repeating hire-desk folklore."],
    ["Dates the one-year limit", "For residents the tool returns the calendar date the foreign licence stops being usable in Italy."],
    ["Flags the exam trap", "Says whether your country has a conversion agreement, or whether residency means sitting the Italian theory and practical exams."],
  ],
  faqs: [
    [
      "Do I need an international driving permit to drive in Italy?",
      "Only if your licence was issued outside the EU and EEA. Article 135 of the Codice della Strada requires such a licence to be accompanied by an International Driving Permit or a sworn Italian translation, so a US, Australian, Canadian, Indian or Japanese licence needs one. EU and EEA licences are recognised in their own right, UK photocard licences are accepted for visits without a permit, and a Swiss licence already carries Italian among its printed languages.",
    ],
    [
      "How long can I drive in Italy on a foreign licence?",
      "For the whole of a genuine visit, and for one year once you register residence. Article 136 makes a non-EU licence unusable in Italy after the holder has held residenza anagrafica in a comune for more than 12 months, counted from the date the comune registers you rather than from your arrival. An EU or EEA licence has no such limit and stays valid until it expires.",
    ],
    [
      "Does Italy accept a 1949 Geneva or a 1968 Vienna international driving permit?",
      "Both. Italy is a contracting party to the 1949 Geneva Convention and the 1968 Vienna Convention on Road Traffic, so either booklet satisfies Article 135. The Geneva permit runs for one year from issue; the Vienna permit for up to three years, or until the national licence expires, whichever comes first. Neither is valid on its own - it must be shown with the original licence it translates.",
    ],
    [
      "Can I swap my American licence for an Italian one?",
      "No. Italy has no licence-conversion agreement with the United States, so a US licence holder who becomes resident cannot exchange it and must pass the Italian theory exam and practical test, normally through a driving school. The same applies to Australian, Chinese and Indian licences. Countries Italy does have agreements with, including Switzerland, Japan and South Korea, can convert at the Motorizzazione Civile. This is general information rather than legal advice - check the current reciprocity list before you rely on it.",
    ],
  ],
};

export default seo;
