const seo = {
  title: "Indian Number Plate Decoder: State, RTO, Series",
  metaDescription:
    "Type a plate like MH 12 AB 1234 to split it into state, RTO office, letter series and serial. Reads BH-series and CD/CC/UN plates too, offline.",
  steps: [
    "Type the plate into Registration number, which shows the MH 12 AB 1234 format, or tap one of the example plate buttons underneath.",
    "The decoder matches what you typed against the standard state format, the Bharat BH-series pattern and diplomatic CD, CC and UN plates, with no online lookup.",
    "Read Decoded number with its plate kind, then the State or union territory, RTO office code, Letter series and Serial rows, and press Copy result.",
  ],
  intro:
    "This decoder splits an Indian registration number into the four blocks it is built from — the two-letter state or union territory code, the RTO office code, the letter series and the four-digit serial — and explains what each one means. It also reads Bharat BH-series numbers, which carry a year of first registration instead of a state, and diplomatic CD, CC and UN plates. Nothing is queried online: it explains the format of the number you type, which is why it works offline and reveals nothing about any owner.",
  useCases: [
    "Working out which state and city a car in front of you was registered in from its plate",
    "Understanding what the extra letter in a Delhi plate such as DL 8C AF 5010 stands for",
    "Checking what a green plate or a BH-series number on a used car listing actually implies",
  ],
  benefits: [
    ["Every block explained", "State, RTO office, series and serial are labelled rather than just echoed back."],
    ["BH and diplomatic covered", "Reads the two formats that carry no state code at all."],
    ["No lookup, no tracking", "Runs entirely in your browser and returns nothing about any individual."],
  ],
  faqs: [
    [
      "What do the numbers on an Indian number plate mean?",
      "In MH 12 AB 1234, MH is Maharashtra, 12 is the RTO office that registered the vehicle — Pune in this case — AB is the letter series, and 1234 is the serial within that series. Each series runs from 0001 to 9999 before the next series opens, moving A, B … Z, then AA, AB and onward.",
    ],
    [
      "What is a BH series number plate?",
      "A Bharat-series registration, introduced by GSR 594(E) in August 2021, written as year, BH, a four-digit serial and one or two letters — for example 22 BH 1234 AA. It is registered centrally, so the owner can move between states without re-registering the vehicle, and road tax is paid in two-year blocks. Eligibility is limited to government and defence personnel and to employees of companies with offices in four or more states or union territories.",
    ],
    [
      "What does a green number plate mean in India?",
      "A battery electric vehicle. Green plates were introduced by GSR 749(E) in 2018 — white lettering on green for a privately owned electric vehicle, yellow lettering on green for a commercial one. A white plate with black letters is an ordinary private vehicle and a yellow plate is commercial transport.",
    ],
    [
      "Can I find out who owns a vehicle from its number plate?",
      "Not from this tool, and not in general. Vehicle particulars are available through the government's Parivahan and mParivahan services, but owner contact details are withheld — the ministry masked them after privacy concerns. Report a vehicle to the traffic police rather than trying to trace an owner yourself.",
    ],
  ],
};

export default seo;
