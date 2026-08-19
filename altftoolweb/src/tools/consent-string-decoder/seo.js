const seo = {
  title: "TC String Decoder for IAB TCF v2.2",
  metaDescription:
    "Unpacks a TCF v2/v2.2 TC String's bit fields in your browser: purposes, special features, vendor IDs, timestamps and CMP id. No vendor list fetched.",
  steps: [
    "Paste the string into the 'TC String' box — a bare string, a euconsent-v2= cookie line, or a URL containing gdpr_consent= all work.",
    "The page decodes the core segment locally into 'Core string header': TCF version, CMP id, Global Vendor List version, and the Created and LastUpdated timestamps.",
    "Read the Purposes, Special features, Vendors and Publisher restrictions sections plus the 'Consistency checks', then press 'Copy decoded JSON'.",
  ],
  intro:
    "A TC String is the IAB Europe Transparency & Consent Framework's record of what a user agreed to. It looks like an opaque blob — `CP1TeJAP5UWFQAHADBENB7Eo…` — because it is a raw bit stream packed into web-safe Base64: 6 bits of version, two 36-bit timestamps, a 12-bit CMP id, then bitfields for the eleven purposes, the two special features, and every vendor id. This decoder unpacks those fields in your browser and shows what each bit actually permits. It reads vendor IDs, not vendor names: resolving an id to a company requires the Global Vendor List, which is a network fetch, and this page makes none.",
  useCases: [
    "Work out why a tag is still firing by checking whether the string really grants purpose 1 and the vendor's own id, rather than trusting the CMP dashboard",
    "Prove during a GDPR audit exactly what a stored consent record contains, including its creation timestamp and the policy version it was written against",
    "Catch a broken CMP integration where the string sets both consent and legitimate interest on one purpose, or asserts legitimate interest on a purpose that TCF v2.2 made consent-only",
  ],
  benefits: [
    ["Real bit-field decoding", "Field offsets come from the TCF v2 specification — not a keyword search. Range and bitfield vendor encodings are both handled, as are the Disclosed Vendors and Publisher TC segments."],
    ["Policy checks, not guesses", "Flags legitimate interest on consent-only purposes, both legal bases on one purpose, timestamps that run backwards, CMP id 0, and policy versions older than TCF v2.2."],
    ["Nothing leaves the page", "The string is decoded locally. No vendor list is downloaded and no consent record is transmitted, which matters when the string is a subject's personal data."],
  ],
  faqs: [
    [
      "What is inside a TC String?",
      "A core segment plus optional extra segments, separated by dots. The core packs a 6-bit version, 36-bit Created and LastUpdated timestamps in deciseconds, CMP id and version, consent screen and language, Global Vendor List version, TCF policy version, a 12-bit special-feature bitfield, two 24-bit purpose bitfields (consent and legitimate interest), and then variable-length vendor sections and publisher restrictions.",
    ],
    [
      "Why does it show vendor numbers instead of company names?",
      "Vendor names live in the Global Vendor List, a JSON file published by IAB Europe and fetched over the network. This tool is deliberately offline, so it reports the ids and ranges the string encodes and leaves the lookup to you. The ids are stable, so vendor 755 is the same vendor in every string.",
    ],
    [
      "What does PurposeOneTreatment mean?",
      "It is a single bit telling vendors that purpose 1 — storing and accessing information on a device — was not disclosed to this user, so the purpose-1 bit must not be relied on. It exists for jurisdictions where the publisher handles device storage under a separate national rule rather than through the framework.",
    ],
    [
      "Can it decode Google Additional Consent or GPP strings?",
      "No. It reads TCF v2 and v2.2 strings, identified by a version field of 2. A TCF v1 string is detected and named as such but not decoded, because v1 used a different bit layout and was retired in 2020. Google's Additional Consent format and the IAB Global Privacy Platform string are separate specifications and are not parsed here.",
    ],
  ],
};

export default seo;
