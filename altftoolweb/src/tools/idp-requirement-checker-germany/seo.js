const seo = {
  intro:
    "This checker tells you whether Germany expects an International Driving Permit alongside your national licence, based on the country that issued the licence, how long you are staying and your age. It applies Section 29 of the Fahrerlaubnis-Verordnung, which requires a foreign national licence to carry a translation unless it was issued in the EU or EEA, is an IDP, or follows the Annex 6 layout of the 1968 Vienna Convention. It is aimed at visitors hiring a car and at people moving to Germany who need to know when the six-month clock in Section 29(1) FeV starts.",
  useCases: [
    "Deciding before a road trip whether your US, Canadian or Australian state licence needs an IDP at a German rental desk",
    "Working out the exact date a non-EU licence stops being usable after you register an address in Germany",
    "Checking whether a stay of more than 185 days will make Germany treat you as ordinarily resident even though you consider it a long visit",
  ],
  benefits: [
    ["Names the actual rule", "Each verdict cites the section of the Fahrerlaubnis-Verordnung it comes from, not a vague travel-blog claim."],
    ["Dates the six-month window", "If you take up ordinary residence, the tool returns the calendar date your foreign licence stops working."],
    ["Flags the age trap", "Section 29(3) FeV voids a foreign licence held by anyone under 18, which catches younger US drivers."],
  ],
  faqs: [
    [
      "Do I need an international driving permit to drive in Germany?",
      "Only if your licence was issued outside the EU or EEA and does not follow the standardised Annex 6 layout. Section 29(2) of the Fahrerlaubnis-Verordnung requires such a licence to be accompanied by a translation, and an International Driving Permit is expressly accepted as that translation. EU and EEA licences need nothing extra, and UK and Swiss photocards follow the standard layout, so they are accepted on their own.",
    ],
    [
      "How long can I drive in Germany on a foreign licence?",
      "For the whole of a genuine visit, and for six months once you have your ordinary residence in Germany. Section 29(1) FeV sets that six-month limit, extendable to twelve months on application if the stay will not exceed a year. Ordinary residence is defined in Section 7 FeV as living in the country at least 185 days in a calendar year for personal reasons, so a long stay triggers the clock even without a residence permit.",
    ],
    [
      "Does Germany accept both types of international driving permit?",
      "Yes. Germany is a contracting party to both the 1949 Geneva Convention and the 1968 Vienna Convention on Road Traffic, so either format is recognised. A 1949 Geneva permit is valid for one year from issue and a 1968 Vienna permit for up to three years or until the national licence expires, whichever comes first, so check the expiry covers your trip.",
    ],
    [
      "Can I get an international driving permit after I arrive in Germany?",
      "No. An IDP can only be issued by the country that issued your national licence, so it has to be arranged before you travel — through AAA or AATA in the United States, the CAA in Canada, your RTO in India, or the equivalent authority elsewhere. If your issuing country is party to neither convention, no valid IDP exists and you need a sworn German translation instead, from ADAC, AvD, a German consular office or a court-sworn translator. This is general information; check your own position with a German driving licence authority.",
    ],
  ],
};

export default seo;
