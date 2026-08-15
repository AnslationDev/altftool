const seo = {
  title: "Guntha to Square Feet Converter — 1 Guntha =",
  metaDescription:
    "Convert guntha to sq ft, acre, are and hectare (1 guntha = 1,089 sq ft, 40 per acre), read a 7/12 or RTC H-R-P entry, and cross-check per-guntha rates.",
  steps: [
    "Choose Start from: One unit, entering an Area and its Unit, or 7/12 entry (H-R-P) with the Hectare (H), Are (R) and Square metre (P) fields as printed on the extract.",
    "Optionally enter a Rate (₹, leave blank to skip pricing) and set Rate is quoted per — guntha, acre or another unit — to value the parcel.",
    "Read the square-feet figure with its acre-and-guntha phrasing, the full unit table, the H - R - sq m land record entry and the per-unit rate table, then press Copy result.",
  ],
  intro:
    "A guntha is one fortieth of an acre — exactly 1,089 square feet, the area of a 33 ft by 33 ft square, or 101.17 square metres. This converter moves land between guntha, acre, are, hectare, square feet, square yards and cent, and reads the hectare-are-square metre entry printed on a Maharashtra 7/12 extract or a Karnataka RTC, since revenue records are kept in metric units even where deals are still spoken in guntha. It also states the area the way it is negotiated: whole acres plus the leftover guntha.",
  useCases: [
    "Convert a 7/12 extract reading 1 hectare 20 are 50 sq m into acres and guntha before a sale.",
    "Check what a rate of Rs 15 lakh per guntha works out to per acre for a 2-acre agricultural parcel.",
    "Translate a 20 guntha plot into square feet to see how much built-up area a farmhouse plan can use.",
  ],
  benefits: [
    ["Reads the record's own format", "Takes the H, R and P columns directly and gives back guntha and acres."],
    ["Acre-and-guntha phrasing", "Shows the area as it is actually spoken in a negotiation, not just as a decimal."],
    ["Rate cross-check", "Turns a per-guntha price into per acre, per sq ft and per hectare so two quotes line up."],
  ],
  faqs: [
    [
      "How many square feet is 1 guntha?",
      "1,089 square feet, or 101.17 square metres. A guntha is one fortieth of an acre, and since an acre is 43,560 sq ft the figure is exact. It is traditionally a square of 33 ft by 33 ft.",
    ],
    [
      "How many guntha make an acre?",
      "40 guntha make one acre. So 20 guntha is half an acre (21,780 sq ft) and 10 guntha is a quarter acre. In cent terms, one guntha equals 2.5 cent.",
    ],
    [
      "What do H, R and P mean on a 7/12 extract?",
      "H is hectare, R is are (100 sq m) and P is the remaining square metres. An entry of 1-20-50 means 1 hectare, 20 are and 50 sq m, which is 12,050 sq m — about 2 acres 39 guntha. Note that P here is square metres, not the old imperial pole.",
    ],
    [
      "Is guntha the same size everywhere?",
      "Yes, unlike bigha. Because guntha is defined as one fortieth of an acre it is 1,089 sq ft in Maharashtra, Karnataka, Andhra Pradesh and anywhere else it is used. Local variation shows up in units like bigha and ground, not in guntha.",
    ],
  ],
};

export default seo;
