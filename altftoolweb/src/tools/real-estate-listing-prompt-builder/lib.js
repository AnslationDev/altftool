/**
 * Real Estate Listing Prompt Builder
 *
 * Converts raw property facts into a structured listing prompt, and computes
 * the three numbers an Indian property listing is judged on before the copy is
 * written: the carpet-area rate, the loading factor, and the carpet area in
 * square metres.
 *
 * Rules and constants used:
 *   - Carpet area is the statutory unit for advertising and sale under the Real
 *     Estate (Regulation and Development) Act 2016, section 2(k): the net
 *     usable floor area, excluding the external walls, service shafts,
 *     balcony and open terrace, but including internal partition walls.
 *   - Loading factor is the industry term for the gap between the saleable or
 *     built-up area and the carpet area, expressed as a percentage of carpet.
 *   - 1 square foot = 0.09290304 square metres exactly (international foot,
 *     defined as 0.3048 m since the 1959 international yard and pound
 *     agreement).
 *   - Section 11(2) of the same Act requires a promoter to state the RERA
 *     registration number and the authority's website in every advertisement
 *     for a registered project.
 */

/** Exact conversion: (0.3048 m)^2. */
export const SQFT_TO_SQM = 0.09290304;

/** One lakh and one crore in the Indian numbering system. */
export const ONE_LAKH = 100000;
export const ONE_CRORE = 10000000;

export const MONTHS_PER_YEAR = 12;

/** Sanity bound on floors; the tallest Indian residential towers are under this. */
export const MAX_FLOORS = 200;

export const LISTING_TYPES = [
  { id: "sale", label: "For sale" },
  { id: "rent", label: "For rent" },
];

export const FURNISHING = [
  { id: "unfurnished", label: "Unfurnished" },
  { id: "semi", label: "Semi-furnished" },
  { id: "full", label: "Fully furnished" },
];

export const FACING = [
  { id: "east", label: "East" },
  { id: "west", label: "West" },
  { id: "north", label: "North" },
  { id: "south", label: "South" },
  { id: "north-east", label: "North-east" },
  { id: "north-west", label: "North-west" },
  { id: "south-east", label: "South-east" },
  { id: "south-west", label: "South-west" },
];

export const CHANNELS = [
  {
    id: "portal",
    label: "Property portal listing",
    brief: "a full listing description for a property portal",
    limitNote: "Portals usually truncate the description in search results after two or three lines.",
  },
  {
    id: "whatsapp",
    label: "WhatsApp broadcast",
    brief: "a short broadcast message for a buyer group",
    limitNote: "Keep it under about 700 characters so it does not collapse behind a Read more link.",
  },
  {
    id: "social",
    label: "Social post",
    brief: "a social post caption with the key facts up front",
    limitNote: "The first two lines carry the whole message on mobile feeds.",
  },
  {
    id: "brochure",
    label: "Brochure or flyer",
    brief: "brochure copy with a headline, a body block and a facts panel",
    limitNote: "Printed copy has no character limit but a facts panel beats paragraphs.",
  },
];

/** Format rupees the way Indian listings quote them. */
export function formatIndianPrice(value) {
  if (!Number.isFinite(value) || value <= 0) return "not quoted";
  if (value >= ONE_CRORE) {
    const crore = value / ONE_CRORE;
    return `${crore.toFixed(crore >= 10 ? 1 : 2)} crore`;
  }
  if (value >= ONE_LAKH) {
    const lakh = value / ONE_LAKH;
    return `${lakh.toFixed(lakh >= 10 ? 1 : 2)} lakh`;
  }
  return new Intl.NumberFormat("en-IN").format(Math.round(value));
}

function round(value, places) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/**
 * Build the listing prompt and the derived area and price figures.
 *
 * @param {object} input
 * @param {string} input.listingType      "sale" or "rent"
 * @param {number} input.bedrooms         BHK count
 * @param {number} input.bathrooms
 * @param {number} input.carpetSqft       carpet area in square feet
 * @param {number} input.builtUpSqft      built-up or saleable area in square feet
 * @param {number} input.floor            the unit's floor
 * @param {number} input.totalFloors
 * @param {number} input.price            total sale price, or monthly rent
 * @param {number} input.depositMonths    security deposit in months (rent only)
 * @param {number} input.ageYears         age of the building in years
 * @param {string} input.locality
 * @param {string} input.city
 * @param {string} input.facing
 * @param {string} input.furnishing
 * @param {string} input.highlights       free text: amenities, landmarks
 * @param {string} input.channel          a CHANNELS id
 * @param {boolean} input.reraRegistered  is this a RERA-registered project ad
 * @param {string} input.reraNumber
 * @returns {object|{error:string}}
 */
export function buildListingPrompt({
  listingType = "sale",
  bedrooms = 2,
  bathrooms = 2,
  carpetSqft = 0,
  builtUpSqft = 0,
  floor = 0,
  totalFloors = 0,
  price = 0,
  depositMonths = 0,
  ageYears = 0,
  locality = "",
  city = "",
  facing = "east",
  furnishing = "semi",
  highlights = "",
  channel = "portal",
  reraRegistered = false,
  reraNumber = "",
} = {}) {
  if (!LISTING_TYPES.some((type) => type.id === listingType)) {
    return { error: "Pick whether the property is for sale or for rent." };
  }
  const channelSpec = CHANNELS.find((item) => item.id === channel);
  if (!channelSpec) return { error: "Pick one of the supported listing channels." };

  const carpet = Number(carpetSqft);
  const builtUp = Number(builtUpSqft);
  const amount = Number(price);
  const beds = Number(bedrooms);
  const baths = Number(bathrooms);
  const unitFloor = Number(floor);
  const floors = Number(totalFloors);
  const age = Number(ageYears);
  const deposit = Number(depositMonths);

  if (![carpet, builtUp, amount, beds, baths, unitFloor, floors, age, deposit].every(Number.isFinite)) {
    return { error: "Every numeric field needs a number." };
  }
  if (carpet <= 0) return { error: "Carpet area must be greater than zero." };
  if (builtUp > 0 && builtUp < carpet) {
    return { error: "Built-up area cannot be smaller than carpet area." };
  }
  if (amount <= 0) {
    return {
      error:
        listingType === "rent" ? "Enter the monthly rent." : "Enter the asking price.",
    };
  }
  if (beds < 0 || beds > 20) return { error: "Bedroom count should be between 0 and 20." };
  if (baths < 0 || baths > 20) return { error: "Bathroom count should be between 0 and 20." };
  if (floors < 0 || floors > MAX_FLOORS) {
    return { error: `Total floors should be between 0 and ${MAX_FLOORS}.` };
  }
  if (floors > 0 && unitFloor > floors) {
    return { error: "The unit cannot be on a floor above the building's top floor." };
  }
  if (unitFloor < 0) return { error: "Floor number cannot be negative. Use 0 for ground floor." };
  if (age < 0 || age > 200) return { error: "Building age should be between 0 and 200 years." };
  if (deposit < 0 || deposit > 36) {
    return { error: "Security deposit should be between 0 and 36 months of rent." };
  }
  if (reraRegistered && !String(reraNumber).trim()) {
    return {
      error:
        "A RERA-registered project advertisement must carry the registration number. Enter it or switch the toggle off.",
    };
  }

  const ratePerSqft = amount / carpet;
  const loadingPercent = builtUp > 0 ? ((builtUp - carpet) / carpet) * 100 : null;
  const carpetSqm = carpet * SQFT_TO_SQM;
  const builtUpSqm = builtUp > 0 ? builtUp * SQFT_TO_SQM : null;
  const depositAmount = listingType === "rent" ? amount * deposit : null;
  const annualRent = listingType === "rent" ? amount * MONTHS_PER_YEAR : null;

  const localityText = [String(locality).trim(), String(city).trim()].filter(Boolean).join(", ");
  const facingLabel = FACING.find((item) => item.id === facing)?.label || "East";
  const furnishingLabel = FURNISHING.find((item) => item.id === furnishing)?.label || "Semi-furnished";

  const priceLines =
    listingType === "rent"
      ? [
          `- Rent: ${formatIndianPrice(amount)} rupees a month (${formatIndianPrice(annualRent)} rupees a year).`,
          `- Security deposit: ${deposit} month${deposit === 1 ? "" : "s"}${
            depositAmount > 0 ? `, which is ${formatIndianPrice(depositAmount)} rupees` : ""
          }.`,
          `- Rate: ${round(ratePerSqft, 2)} rupees per sq ft of carpet area per month.`,
        ]
      : [
          `- Asking price: ${formatIndianPrice(amount)} rupees.`,
          `- Rate: ${Math.round(ratePerSqft)} rupees per sq ft of carpet area.`,
        ];

  const areaLines = [
    `- Carpet area: ${round(carpet, 0)} sq ft (${round(carpetSqm, 1)} sq m), as defined in section 2(k) of the RERA Act 2016.`,
  ];
  if (builtUp > 0) {
    areaLines.push(
      `- Built-up or saleable area: ${round(builtUp, 0)} sq ft (${round(builtUpSqm, 1)} sq m).`,
      `- Loading factor: ${round(loadingPercent, 1)}% over carpet. Quote carpet area first; the built-up figure may be mentioned second and must be labelled.`,
    );
  } else {
    areaLines.push("- No built-up area supplied. Do not mention or estimate one.");
  }

  const complianceLines = [
    "- Quote carpet area as the headline area figure. Never present built-up or super built-up area as the size of the home.",
    "- Do not state or imply any preference or restriction based on religion, caste, community, marital status, gender or food habits.",
    "- Do not promise appreciation, rental yield, resale value or possession dates that were not supplied above.",
    "- Do not invent amenities, distances, school names, metro stations or approvals. If a distance is not given, describe proximity in general terms or leave it out.",
  ];
  if (reraRegistered) {
    complianceLines.push(
      `- This is a RERA-registered project. Include the registration number ${String(reraNumber).trim()} and a reference to the state RERA website, as required of promoters by section 11(2) of the RERA Act 2016.`,
    );
  } else {
    complianceLines.push(
      "- No RERA registration number was supplied, so do not display, imply or fabricate one.",
    );
  }

  const highlightText = String(highlights).trim();

  const lines = [
    "You are a property copywriter who writes listings that a serious buyer trusts. You write plainly and never pad with adjectives.",
    "",
    "PROPERTY FACTS",
    `- Type: ${beds} BHK${baths > 0 ? ` with ${baths} bathroom${baths === 1 ? "" : "s"}` : ""}, ${listingType === "rent" ? "available on rent" : "for sale"}.`,
    `- Location: ${localityText || "location not supplied - do not invent one"}.`,
    `- Floor: ${unitFloor === 0 ? "ground floor" : `floor ${unitFloor}`}${floors > 0 ? ` of ${floors}` : ""}.`,
    `- Facing: ${facingLabel}. Furnishing: ${furnishingLabel}.`,
    `- Age of building: ${age === 0 ? "new or ready to move" : `${age} year${age === 1 ? "" : "s"}`}.`,
    ...areaLines,
    ...priceLines,
    highlightText
      ? `- Owner's notes: ${highlightText}`
      : "- No extra highlights supplied. Work only from the facts above.",
    "",
    "TASK",
    `Write ${channelSpec.brief}. ${channelSpec.limitNote}`,
    "",
    "STRUCTURE",
    "1. One opening line naming the configuration, locality and carpet area.",
    "2. A short paragraph on the layout and what daily life in it is like.",
    "3. A short paragraph on the building and the immediate locality.",
    "4. A facts block listing area, floor, facing, furnishing, age and price.",
    "5. One closing line with the next step for an interested buyer.",
    "",
    "COMPLIANCE AND ACCURACY",
    ...complianceLines,
    "",
    "STYLE",
    "- No superlatives without a fact behind them: no luxurious, no prime, no unmatched.",
    "- Short sentences. No exclamation marks.",
    "- Return the listing only, with no commentary.",
  ];

  const prompt = lines.join("\n");

  return {
    prompt,
    charCount: prompt.length,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
    ratePerSqft,
    loadingPercent,
    carpetSqm,
    builtUpSqm,
    depositAmount,
    annualRent,
    listingType,
    channel: channelSpec,
  };
}
