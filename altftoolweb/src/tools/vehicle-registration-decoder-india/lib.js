/**
 * Decoding an Indian registration number.
 *
 * A modern plate is built as: state code, RTO office code, letter series, and a
 * four-digit serial — MH 12 AB 1234. The Bharat (BH) series introduced by
 * GSR 594(E) of 26 August 2021 replaces the state block with the year of first
 * registration, so 22 BH 1234 AA carries no state at all.
 *
 * Plate colours follow Rule 50 and Rule 51 of the Central Motor Vehicles Rules,
 * 1989, with green plates for battery electric vehicles added by GSR 749(E) of
 * 2018.
 *
 * Everything here is offline pattern work. No registry is queried, so a decoded
 * number is an explanation of the format, not a confirmation that the vehicle exists.
 */

/** State and union territory codes. */
export const STATE_CODES = {
  AN: "Andaman and Nicobar Islands",
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CG: "Chhattisgarh",
  CH: "Chandigarh",
  DD: "Dadra and Nagar Haveli and Daman and Diu",
  DL: "Delhi",
  DN: "Dadra and Nagar Haveli (pre-2020 series)",
  GA: "Goa",
  GJ: "Gujarat",
  HP: "Himachal Pradesh",
  HR: "Haryana",
  JH: "Jharkhand",
  JK: "Jammu and Kashmir",
  KA: "Karnataka",
  KL: "Kerala",
  LA: "Ladakh",
  LD: "Lakshadweep",
  MH: "Maharashtra",
  ML: "Meghalaya",
  MN: "Manipur",
  MP: "Madhya Pradesh",
  MZ: "Mizoram",
  NL: "Nagaland",
  OD: "Odisha",
  OR: "Odisha (series used before the 2011 rename)",
  PB: "Punjab",
  PY: "Puducherry",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TG: "Telangana (series adopted from 2024)",
  TN: "Tamil Nadu",
  TR: "Tripura",
  TS: "Telangana",
  UA: "Uttarakhand (series used before the 2007 rename)",
  UK: "Uttarakhand",
  UP: "Uttar Pradesh",
  WB: "West Bengal",
};

/**
 * Widely cited RTO office codes for major cities. This is a shortlist, not the
 * full register — every state transport department publishes its own complete
 * list and codes are added as new offices open.
 */
export const RTO_OFFICES = {
  AP31: "Visakhapatnam",
  AS01: "Guwahati (Kamrup)",
  BR01: "Patna",
  CG04: "Raipur",
  CH01: "Chandigarh",
  GA01: "Panaji",
  GJ01: "Ahmedabad",
  GJ05: "Surat",
  GJ06: "Vadodara",
  GJ18: "Gandhinagar",
  HR26: "Gurugram",
  HR51: "Faridabad",
  JH01: "Ranchi",
  JK01: "Srinagar",
  JK02: "Jammu",
  KA01: "Bengaluru (Koramangala)",
  KA02: "Bengaluru (Rajajinagar)",
  KA03: "Bengaluru (Indiranagar)",
  KA04: "Bengaluru (Yeshwanthpur)",
  KA05: "Bengaluru (Jayanagar)",
  KA09: "Mysuru",
  KA19: "Mangaluru",
  KL01: "Thiruvananthapuram",
  KL07: "Ernakulam",
  MH01: "Mumbai (South)",
  MH02: "Mumbai (West)",
  MH03: "Mumbai (East)",
  MH04: "Thane",
  MH05: "Kalyan",
  MH12: "Pune",
  MH14: "Pimpri-Chinchwad",
  MH15: "Nashik",
  MH20: "Chhatrapati Sambhajinagar",
  MH31: "Nagpur",
  MH43: "Navi Mumbai",
  MP04: "Bhopal",
  MP09: "Indore",
  OD02: "Bhubaneswar",
  PY01: "Puducherry",
  RJ14: "Jaipur",
  RJ19: "Jodhpur",
  TN01: "Chennai (Central)",
  TN38: "Coimbatore",
  TS09: "Hyderabad (Central)",
  UK07: "Dehradun",
  UP14: "Ghaziabad",
  UP16: "Gautam Buddha Nagar (Noida)",
  UP32: "Lucknow",
  UP65: "Varanasi",
  UP80: "Agra",
  WB02: "Kolkata (Beltala)",
};

/** Plate colours and what they mean — CMVR Rules 50 and 51, and GSR 749(E) of 2018. */
export const PLATE_COLOURS = [
  { id: "white", label: "White plate, black letters", meaning: "Private, non-transport vehicle." },
  { id: "yellow", label: "Yellow plate, black letters", meaning: "Commercial transport vehicle — taxi, bus, goods carrier." },
  { id: "green-white", label: "Green plate, white letters", meaning: "Privately owned battery electric vehicle." },
  { id: "green-yellow", label: "Green plate, yellow letters", meaning: "Commercial battery electric vehicle." },
  { id: "black-yellow", label: "Black plate, yellow letters", meaning: "Self-drive rental vehicle." },
  { id: "blue", label: "Blue plate, white letters", meaning: "Vehicle of a foreign diplomatic mission." },
  { id: "red", label: "Red plate with the state emblem", meaning: "Reserved for the President and state Governors; a plain red plate is used for temporary registration in some states." },
];

/** Delhi codes 1 to 13 are zonal offices inside the city. */
const DELHI_ZONE_MAX = 13;

/** The BH series starts here, so an earlier year cannot be genuine. */
export const BH_SERIES_FIRST_YEAR = 2021;

const RE_STANDARD = /^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/;
const RE_BH = /^(\d{2})BH(\d{4})([A-HJ-NP-Z]{1,2})$/;
const RE_DIPLOMATIC = /^(\d{1,3})(CD|CC|UN)(\d{1,4})$/;

export function normalise(raw) {
  if (typeof raw !== "string") return "";
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

/**
 * Position of a letter series in the A, B, ... Z, AA, AB, ... ordering,
 * counting from 1. Used to say how many blocks of 9,999 came before it.
 */
export function seriesIndex(series) {
  if (typeof series !== "string" || series.length === 0) return 0;
  if (!/^[A-Z]+$/.test(series)) return 0;
  let index = 0;
  for (const letter of series) {
    index = index * 26 + (letter.charCodeAt(0) - 64);
  }
  return index;
}

/** Numbers issued in a state before the given series and serial were reached. */
export const SERIALS_PER_SERIES = 9999;

export function approximateVehiclesBefore(series, serial) {
  const index = seriesIndex(series);
  const number = Number(serial);
  if (!Number.isFinite(number) || number < 0) return null;
  if (index === 0) return number;
  return (index - 1) * SERIALS_PER_SERIES + number;
}

/**
 * Decode a registration number.
 * @param {string} raw
 * @returns {object} decoded fields, or { error } when the number cannot be read
 */
export function decodeRegistration(raw) {
  if (typeof raw !== "string" || raw.trim() === "") {
    return { error: "Enter a registration number to decode." };
  }
  const compact = normalise(raw);
  if (compact.length === 0) return { error: "Nothing left after removing punctuation." };
  if (compact.length > 11) {
    return { error: "That is longer than any Indian registration format." };
  }

  const bh = RE_BH.exec(compact);
  if (bh) {
    const [, yy, serial, series] = bh;
    const year = 2000 + Number(yy);
    return {
      kind: "bh",
      kindLabel: "Bharat (BH) series",
      input: raw,
      compact,
      canonical: `${yy} BH ${serial} ${series}`,
      fields: [
        ["Year of first registration", String(year)],
        ["Series code", "BH — Bharat series, valid across India"],
        ["Serial", serial],
        ["Letter series", series],
      ],
      story:
        "A BH number is registered centrally rather than by a state RTO, so the owner can move between states without re-registering the vehicle or paying road tax again in the new state. Road tax is paid in two-year blocks for the first fourteen years.",
      notes: [
        "Eligibility is limited — central and state government employees, defence personnel, and employees of private companies with offices in four or more states or union territories.",
        "The letter block runs from AA to ZZ but skips I and O so they are not confused with 1 and 0.",
        year < BH_SERIES_FIRST_YEAR
          ? `The BH series only began in ${BH_SERIES_FIRST_YEAR}, so a year of ${year} cannot be right.`
          : "",
      ].filter(Boolean),
    };
  }

  const dip = RE_DIPLOMATIC.exec(compact);
  if (dip) {
    const [, country, code, serial] = dip;
    const meaning =
      code === "CD"
        ? "Corps Diplomatique — an embassy vehicle"
        : code === "CC"
          ? "Consular Corps — a consulate vehicle"
          : "A United Nations mission vehicle";
    return {
      kind: "diplomatic",
      kindLabel: "Diplomatic plate",
      input: raw,
      compact,
      canonical: `${country} ${code} ${serial}`,
      fields: [
        ["Country code", country],
        ["Mission type", `${code} — ${meaning}`],
        ["Serial", serial],
      ],
      story:
        "Diplomatic registrations are allotted centrally through the Ministry of External Affairs rather than by a state RTO, which is why there is no state code. The plate is blue with white lettering.",
      notes: ["Country codes are assigned by the Ministry of External Affairs and are not public trivia — the same number means nothing outside that list."],
    };
  }

  const std = RE_STANDARD.exec(compact);
  if (!std) {
    return {
      error:
        "That does not match a state registration, the BH series or a diplomatic plate. Check the letters and the four-digit serial.",
    };
  }

  const [, state, rtoRaw, series, serialRaw] = std;
  const stateName = STATE_CODES[state];
  if (!stateName) {
    return { error: `"${state}" is not a recognised state or union territory code.` };
  }

  const rtoNumber = Number(rtoRaw);
  const key = `${state}${String(rtoNumber).padStart(2, "0")}`;
  let office = RTO_OFFICES[key] || "";
  if (!office && state === "DL" && rtoNumber >= 1 && rtoNumber <= DELHI_ZONE_MAX) {
    office = "a zonal office inside Delhi";
  }
  const serial = serialRaw.padStart(4, "0");

  // A three-letter group is a vehicle-class letter (private car, taxi, etc.)
  // followed by the real two-letter series — e.g. Delhi's DL 8C AF 5010
  // groups as RTO "8C" plus series "AF", not one continuous three-letter
  // series. Split it here so the series-position estimate is computed from
  // only the genuine series, and the canonical display groups the same way
  // the explanatory note below describes.
  const classCode = series.length === 3 ? series.slice(0, 1) : "";
  const seriesForIndex = classCode ? series.slice(1) : series;
  const rtoDisplay = classCode ? `${rtoRaw}${classCode}` : rtoRaw;
  const before = approximateVehiclesBefore(seriesForIndex, serial);

  const notes = [];
  if (!office) {
    notes.push(
      `RTO code ${rtoRaw} is not in this shortlist — the full register of office codes for ${stateName} is published by its transport department.`,
    );
  }
  if (series.length === 0) {
    notes.push(
      "No letter series at all, which marks an early plate issued before the series letters were introduced.",
    );
  }
  if (classCode) {
    notes.push(
      `Three letters usually means the first is a vehicle class code, the way Delhi writes DL 8C AF 5010 with C for a private car — so ${classCode} is read with the RTO number (${rtoDisplay}) and ${seriesForIndex} is the actual letter series.`,
    );
  }
  if (/[IO]/.test(series)) {
    notes.push("The letters I and O are normally avoided in a series so they are not read as 1 and 0.");
  }

  return {
    kind: "standard",
    kindLabel: "Standard state series",
    input: raw,
    compact,
    canonical: [state, rtoDisplay, seriesForIndex, serial].filter(Boolean).join(" "),
    state,
    stateName,
    rto: rtoRaw,
    office,
    series: seriesForIndex,
    classCode,
    serial,
    seriesPosition: seriesIndex(seriesForIndex),
    approxIssuedBefore: before,
    fields: [
      ["State or union territory", `${state} — ${stateName}`],
      ["RTO office code", office ? `${rtoRaw} — ${office}` : `${rtoRaw} — office not in the shortlist`],
      ...(classCode ? [["Vehicle class code", `${classCode} — grouped with the RTO number as ${rtoDisplay}`]] : []),
      ["Letter series", seriesForIndex || "none"],
      ["Serial", serial],
    ],
    story: seriesForIndex
      ? `${state} is ${stateName} and ${rtoDisplay} identifies the registering office${classCode ? " and vehicle class" : ""}. Series ${seriesForIndex} is number ${seriesIndex(seriesForIndex)} in the A, B … Z, AA, AB sequence, and each series carries serials 0001 to 9999 before the next one opens.`
      : `${state} is ${stateName} and ${rtoRaw} identifies the registering office. This plate has no letter series, which places it early in that office's history.`,
    notes,
  };
}
