const seo = {
  intro:
    "Real Estate Listing Prompt Builder converts property facts into a listing prompt that already contains the numbers and the advertising rules, so the generated copy cannot drift from what you can substantiate. It computes the carpet-area rate, the loading factor between built-up and carpet area, and the carpet area in square metres using the exact conversion of 0.09290304 square metres per square foot, and it writes in the requirement to lead with carpet area as defined in section 2(k) of the Real Estate (Regulation and Development) Act 2016.",
  useCases: [
    "Publish a portal listing for an 850 sq ft carpet flat at 1.2 crore and show the honest 14,118 rupees per sq ft carpet rate instead of a flattering super built-up rate.",
    "Check the loading factor before you list: 850 sq ft carpet against 1,100 sq ft built-up is 29.4% loading, which buyers will work out anyway.",
    "Generate a rental broadcast that states the deposit in rupees rather than as a vague number of months.",
    "Produce brochure copy for a registered project that carries the RERA number in the advertisement as required of promoters.",
  ],
  benefits: [
    [
      "Carpet area leads, by default",
      "The prompt instructs the model to headline carpet area and to label any built-up figure, which is the direction the law points.",
    ],
    [
      "No invented facts",
      "Amenities, distances, approvals, appreciation and possession dates are all explicitly forbidden unless you supplied them.",
    ],
    [
      "Discriminatory framing blocked",
      "Preferences based on religion, caste, community, marital status, gender or food habits are ruled out in the prompt itself.",
    ],
  ],
  faqs: [
    [
      "What is carpet area and why does it matter in a listing?",
      "Carpet area is the net usable floor area of the apartment, excluding external walls, service shafts, balcony and open terrace but including internal partition walls, as defined in section 2(k) of the RERA Act 2016. It is the area on which sale is regulated, so quoting super built-up as the size of the home misleads the buyer even when the number is technically real.",
    ],
    [
      "How do I calculate the loading factor?",
      "Loading factor is the built-up or saleable area minus the carpet area, divided by the carpet area, expressed as a percentage. A 1,100 sq ft saleable unit with 850 sq ft carpet has 250 sq ft of loading, which is 29.4%. Anything above roughly a third is worth explaining to a buyer before they ask.",
    ],
    [
      "Does a property advertisement have to show the RERA number?",
      "For a registered project, section 11(2) of the RERA Act 2016 requires the promoter to mention the registration number and the authority's website in the advertisement. Obligations differ for agents and for individual resale owners, so confirm your position with a qualified professional rather than assuming the rule applies or does not apply to you.",
    ],
    [
      "How do I convert square feet to square metres for a listing?",
      "Multiply square feet by 0.09290304, which is the square of the international foot of 0.3048 metres. An 850 sq ft carpet area is 79.0 square metres. Many state portals and approval documents record area in square metres, so listings that carry both figures raise fewer questions.",
    ],
  ],
};

export default seo;
