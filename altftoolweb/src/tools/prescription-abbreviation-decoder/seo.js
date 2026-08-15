const seo = {
  title: "Prescription Abbreviation Decoder: BD, TDS, PRN & 5/7",
  metaDescription:
    "Paste a sig like '1 tab PO TDS 5/7' to decode each abbreviation, get doses per day, course length and total tablets — with ISMP unsafe-shorthand flags.",
  steps: [
    "Paste the sig into 'Directions from the prescription', or tap an example chip such as 'T. Amoxicillin 500mg 1 tab PO TDS 5/7 PC'.",
    "The decoder translates each abbreviation and works out doses per day, the gap between doses and the course length in days.",
    "Read the Total to dispense figure, check any red error-prone-abbreviation flags, then click Copy decode for the full breakdown.",
  ],
  intro:
    "Prescription shorthand is abbreviated Latin: BD is bis in die (twice a day), TDS is ter die sumendum (three times a day), HS is hora somni (at bedtime) and PRN is pro re nata (as needed). This decoder translates a whole sig line, works out doses per day, the gap between doses, the course length written as 5/7 or 3/12, and the total number of tablets that adds up to — and it flags shorthand that appears on the ISMP list of error-prone abbreviations.",
  useCases: [
    "Read a hospital discharge summary that says “1 tab PO QDS 5/7 PC” and work out that it means twenty tablets over five days, after food.",
    "Check how many capsules a three-month prescription written as “1 cap OD 3/12” should come to before you leave the pharmacy counter.",
    "Look up what OM, ON, AC and PC mean when a parent's medicine chart uses them without explanation.",
    "Spot unsafe shorthand such as “U” for unit or a naked decimal like “.5 mg” in a handwritten note before it is transcribed.",
  ],
  benefits: [
    ["Decodes a whole line", "Frequency, timing, route, form and duration are pulled out of one paste, not looked up one at a time."],
    ["Does the arithmetic", "Doses per day multiplied by course length gives the quantity to dispense, so a short-supply is obvious."],
    ["Flags known hazards", "Abbreviations on the ISMP error-prone list, trailing zeros and naked decimals are highlighted with the reason."],
  ],
  faqs: [
    [
      "What does BD, TDS and QDS mean on a prescription?",
      "BD means twice a day (bis in die), TDS means three times a day (ter die sumendum) and QDS means four times a day (quater die sumendum). The American equivalents are BID, TID and QID. Roughly, twice a day is every 12 hours, three times a day every 8 hours and four times a day every 6 hours, unless the label says otherwise.",
    ],
    [
      "What does 5/7 mean on a prescription?",
      "It is the course length written as a fraction with the time unit on the bottom: 5/7 is five days, 2/52 is two weeks and 3/12 is three months. This convention is common in UK and Indian prescribing. Combined with the frequency it gives the quantity — 1 tablet TDS for 5/7 is 15 tablets.",
    ],
    [
      "What does PRN mean and how is it different from STAT?",
      "PRN is pro re nata, meaning take only when needed, and a safe PRN instruction always carries a maximum in 24 hours and a reason such as “for pain”. STAT is statim, meaning give one dose immediately. SOS (si opus sit) sits between them and means one dose if necessary.",
    ],
    [
      "Which prescription abbreviations are considered unsafe?",
      "The ISMP list of error-prone abbreviations includes U for unit (read as 0 or 4, turning 4U into 40), IU for international unit (read as IV), QD and QOD (confused with QID), µg for microgram (read as mg, a 1000-fold error), cc for millilitre, trailing zeros such as 1.0 mg and naked decimals such as .5 mg. If any of these appear on something you have been given, ask the pharmacist to confirm the dose before taking it.",
    ],
  ],
};

export default seo;
