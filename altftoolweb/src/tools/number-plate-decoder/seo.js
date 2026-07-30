const seo = {
  intro:
    "The Indian Number Plate Decoder breaks a registration number into its four parts — the two-letter state or UT code, the two-digit RTO district code, the series letters and the four-digit vehicle number — and names the RTO the vehicle was registered at. It also handles the formats that do not follow that pattern: Bharat-series numbers like 22 BH 1234 A, where the leading digits are a year rather than an RTO, and diplomatic plates carrying CD, CC or UN instead of a state code. Alongside the decode it explains the nine plate colour combinations in use, from white-on-private to green-with-yellow-text for commercial EVs.",
  useCases: [
    "You are buying a used car and the seller says it is a Pune vehicle — you want to confirm that MH 12 really is the Pune RTO before the transfer paperwork starts.",
    "A dashcam clip shows a plate reading DL 3S, and you want to know why Delhi has a letter stuck to the RTO number when no other state does.",
    "You spotted a green plate with yellow lettering in traffic and want to know what it means — the colour marks an electric powertrain, the yellow text marks a commercial permit.",
  ],
  benefits: [
    [
      "Handles the formats that break the pattern",
      "Recognises BH-series and CD/CC/UN diplomatic numbers separately instead of failing them as malformed state codes.",
    ],
    [
      "Knows Delhi's class letter",
      "Splits the C, S, T, R or P out of codes like DL 1C and names the vehicle class, rather than treating it as a series letter.",
    ],
    [
      "Carries retired state codes",
      "Still decodes OR, UA, TS and DN plates and tells you what replaced them, so an older vehicle does not read as invalid.",
    ],
  ],
  faqs: [
    [
      "How do I read an Indian number plate?",
      "Read it in four blocks: state or UT code, RTO district code, series letters, then the vehicle number. In MH 12 AB 1234, MH is Maharashtra, 12 is the Pune RTO, AB is the series and 1234 is the number within that series. Each series block holds 10,000 numbers, from 0001 to 9999.",
    ],
    [
      "What does a BH number plate mean?",
      "BH is the Bharat series, a national registration that moves with you across states with no NOC and no re-registration. In 22 BH 1234 A the leading 22 is the year of first registration, not an RTO code, and road tax is paid every two years instead of fifteen years up front. It is open to central and state government staff, defence personnel, and employees of firms with offices in four or more states or UTs.",
    ],
    [
      "What do the different number plate colours mean in India?",
      "White with black text is a private vehicle and yellow with black text is commercial. Green with white text is a private electric vehicle, green with yellow text a commercial one; black with yellow text is a self-drive rental, blue with white text is diplomatic, and red is a temporary dealer registration valid for up to one month.",
    ],
    [
      "Does this tool look up the vehicle owner?",
      "No. It decodes the structure of the number itself using an offline map of state codes and RTO districts — it does not query VAHAN or any registry, and it returns no owner, chassis or insurance details. For ownership or challan records, use the official Parivahan or mParivahan services.",
    ],
  ],
};

export default seo;
