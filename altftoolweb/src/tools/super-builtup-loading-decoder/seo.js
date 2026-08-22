const seo = {
  title: "Super Built-Up vs Carpet Area: Price per Sq Ft",
  metaDescription:
    "Restate two flats on one RERA carpet-area basis and get the real rate per sq ft of carpet, with the loading each quote implies on all three denominators.",
  intro:
    "A super built-up loading decoder converts two differently-quoted flats onto one common carpet-area basis and returns the true price per square foot of carpet for each. It is for buyers comparing listings where one project advertises super built-up area and another advertises carpet area, so the headline rates are not measuring the same thing. Carpet area follows section 2(k) of the Real Estate (Regulation and Development) Act, 2016 — the net usable floor area within the apartment, excluding external walls, service shafts, exclusive balcony or verandah and exclusive open terrace, but including internal partition walls — and loading is computed as (super built-up − carpet) ÷ carpet, with the built-up and super built-up denominators supported as well.",
  useCases: [
    "Compare a 1,200 sq ft super built-up flat at Rs 96 lakh against an 850 sq ft carpet flat at Rs 78 lakh on the same per-usable-foot basis",
    "Work out the carpet area a project is actually delivering when the brochure gives only super built-up area and a loading percentage",
    "Check which denominator a seller's loading figure uses, since 30% on carpet, 18.18% on built-up and 23.08% on super built-up can all describe one identical flat",
    "Convert a quote given in square metres into rupees per square foot of carpet before comparing it with a square-foot listing",
  ],
  benefits: [
    [
      "One common basis",
      "Both offers are restated as carpet area in sq ft and sq m, so the two price-per-square-foot figures are finally measuring the same floor.",
    ],
    [
      "All three loading conventions",
      "The loading you enter is restated on carpet, on built-up and on super built-up, which shows immediately which convention a listing's number implies.",
    ],
    [
      "The gap the quote hides",
      "Alongside the advertised rate the page shows the rupees per square foot added once only usable floor is counted, plus the square footage you cannot walk on.",
    ],
    [
      "Contradictions are flagged",
      "If the loading and the wall-and-balcony premium you enter imply a super built-up area smaller than the built-up area, the page says so instead of printing a confident wrong number.",
    ],
  ],
  faqs: [
    [
      "What is carpet area under RERA?",
      "Section 2(k) of the Real Estate (Regulation and Development) Act, 2016 defines carpet area as the net usable floor area of an apartment, excluding the area covered by external walls, areas under services shafts, exclusive balcony or verandah area and exclusive open terrace area, but including the area covered by the internal partition walls of the apartment. Since RERA came into force, the agreement for sale must state this figure, which is why it is the only basis on which two projects can be compared honestly.",
    ],
    [
      "How is loading factor calculated?",
      "Loading = (super built-up area − carpet area) ÷ carpet area. A flat with 923 sq ft carpet sold as 1,200 sq ft super built-up has a loading of (1200 − 923) ÷ 923 = 30%. The same flat reads as 23.08% if the seller divides by super built-up instead — (1200 − 923) ÷ 1200 — and as 18.18% if it is divided by a 1,015 sq ft built-up area, so the denominator has to be established before two loading figures can be compared.",
    ],
    [
      "What is the difference between carpet, built-up and super built-up area?",
      "Carpet area is the usable floor inside the flat as defined in RERA section 2(k). Built-up area adds the thickness of the walls and the balcony or verandah, typically 10% to 15% above carpet. Super built-up area adds a proportionate share of common areas — lobbies, staircases, lifts, corridors, and in some projects the clubhouse — and it has no statutory definition, which is why the share loaded on varies between projects.",
    ],
    [
      "How do I find the real price per square foot from a super built-up quote?",
      "Divide the total price by the carpet area, not by the quoted area. A Rs 96 lakh flat advertised at 1,200 sq ft super built-up looks like Rs 8,000 per sq ft, but at 30% loading the carpet area is 923.08 sq ft, so the real rate is Rs 10,400 per square foot of carpet — Rs 2,400 more per foot than the advertised figure.",
    ],
  ],
  steps: [
    "Enter the quoted area for Project A and pick whether that number is carpet, built-up or super built-up area, along with the unit (sq ft or sq m).",
    "Enter the loading percentage the seller quotes and choose which area it is measured on — carpet, built-up or super built-up.",
    "Enter the total price for Project A, then repeat the same three inputs for Project B.",
    "Adjust the wall and balcony premium if the project states how much built-up exceeds carpet; it only affects the result when a built-up figure is part of a quote.",
    "Read the headline price per square foot of carpet for both projects, the percentage difference per usable foot, and the loading each seller's figure implies on all three denominators.",
  ],
};

export default seo;
