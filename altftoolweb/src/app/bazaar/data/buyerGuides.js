/**
 * Pre-purchase buyer guides for the four highest-stakes categories:
 * cars, bikes, mobiles, properties.
 *
 * This is a content layer, not a data layer — every line is a real,
 * verifiable Indian process (RTO forms, Parivahan, CEIR/Sanchar Saathi,
 * RERA, sub-registrar paperwork). Editing rules:
 *
 *  - Name the check, not the number. Anything that drifts over time —
 *    tax thresholds, stamp-duty rates, re-registration windows — is
 *    phrased as "confirm the current rule on <official portal> / with
 *    your lawyer or CA", never as a figure that will silently go stale.
 *  - Imperative, compact, zero marketing. These render into prerendered
 *    HTML on the vertical's heaviest pages; every sentence must earn it.
 *  - English only. Server SEO surfaces render `en` by design (the
 *    EN/हिन्दी toggle is a client-side leaf; see docs/ALTF_BAZAAR_BLUEPRINT.md).
 *  - Verification pointers, not legal advice. The rendering component
 *    appends the disclaimer; keep individual items factual.
 *
 * Shape:
 *   { [categorySlug]: { heading, intro,
 *                       sections: [{ title, items: [string] }],
 *                       faqs: [{ question, answer }] } }
 *
 * `faqs` is handed verbatim to `createFaqJsonLd()` on the category page,
 * so the structured data always describes text that is actually rendered.
 * Server-safe: no imports, no Date, no randomness.
 */

const BUYER_GUIDES = {
  cars: {
    heading: "Used car buying checklist for India",
    intro:
      "A used car is a paperwork purchase as much as a mechanical one — every check below protects either the ownership transfer or your money.",
    sections: [
      {
        title: "Papers and portal checks",
        items: [
          "Ask for the original Registration Certificate (RC), not a photocopy. The name on the RC must match the seller's government photo ID — if it does not, stop and ask for the full ownership chain.",
          "Match the engine number and chassis (VIN) number stamped on the car against the RC, character by character.",
          "Look for a hypothecation entry on the RC. If a financier is named, the loan must be closed and the seller must hand you the financier's NOC with Form 35 to terminate the hypothecation.",
          "Check pending e-challans against the registration number on the Parivahan e-challan portal or your state transport department's site before you commit.",
          "Pull the vehicle record on Parivahan (VAHAN) or the mParivahan app: the owner serial number tells you how many owners it has had, and the record confirms it is not blacklisted.",
          "Confirm the insurance policy is active and in the seller's name, and that the PUC (Pollution Under Control) certificate is valid.",
          "For a car registered in another state, ask for the NOC (Form 28) from its home RTO and check the current re-registration rules for your state on Parivahan.",
          "Ask for the service history. Dated service-centre records let you verify the odometer reading against real entries.",
        ],
      },
      {
        title: "Inspect the car",
        items: [
          "Cold-start the engine. Knocking, blue or white smoke, or a struggling first crank of the day tells you more than any polished test drive.",
          "Check for accident repair: uneven panel gaps, paint shade or texture mismatch between panels, and weld or sealant marks inside the bonnet channels and boot floor.",
          "Sanity-check the odometer: worn pedal rubbers, a shiny steering wheel and a sagging driver's seat on a low-km car are a contradiction. Compare against the service records.",
          "Look under the carpets and inside connector plugs for silt, rust or a musty smell — the classic signs of flood damage.",
          "Test every electrical: all windows and mirrors, AC cooling at idle, infotainment, every light, horn and wipers.",
          "Check tyre manufacturing dates and wear. Uneven wear across a tyre points at alignment or suspension problems.",
          "Confirm the spare key exists and works, and that the VIN plate is factory-riveted and unaltered.",
          "Drive it: brake hard once where safe, listen for suspension clunks, and check it tracks straight with a light grip on the wheel.",
        ],
      },
      {
        title: "Closing the deal",
        items: [
          "Get Form 29 (in duplicate) and Form 30 signed by the seller, and file the ownership transfer with the RTO within the prescribed time — many states accept it online on Parivahan.",
          "Write a sale receipt with the date, time, price, odometer reading and both signatures, one copy each — it protects the seller from your future challans and you from the seller's past.",
          "Pay by a traceable method — UPI or bank transfer matching the receipt amount. Avoid cash.",
          "Apply to the insurer to transfer the policy into your name within 14 days of the sale. Third-party cover is deemed transferred, but own-damage cover needs the endorsement.",
          "If the RC shows hypothecation, route the payoff through the financier and collect the NOC and Form 35 before you hand over the balance.",
          "Collect everything physical: both keys, the original RC, policy and PUC, tools, and the service booklet.",
          "Track the transfer application until the RC actually shows your name — the transfer, not the receipt, is what makes the car yours.",
        ],
      },
    ],
    faqs: [
      {
        question: "What documents should I collect when buying a used car in India?",
        answer:
          "The original RC, a valid insurance policy, a valid PUC certificate, signed Forms 29 and 30 for the RTO transfer, the financier's NOC with Form 35 if the RC shows hypothecation, service records, both keys, and a signed sale receipt.",
      },
      {
        question: "How do I check pending challans on a used car?",
        answer:
          "Enter the registration number on the Parivahan e-challan portal or your state transport department's site. Have the seller clear them before you pay — some RTOs hold up the ownership transfer until pending challans are settled.",
      },
      {
        question: "What does hypothecation on an RC mean?",
        answer:
          "It means a lender financed the vehicle and holds a charge over it. The loan must be closed and the hypothecation terminated — with the financier's NOC and Form 35 filed at the RTO — before you can get a clean transfer.",
      },
      {
        question: "Is the seller's insurance valid after I buy the car?",
        answer:
          "Third-party cover is deemed to transfer with ownership, but you must apply to the insurer within 14 days of the sale to endorse the policy in your name. Own-damage claims can be rejected until that endorsement is done.",
      },
      {
        question: "Can I buy a car registered in another state?",
        answer:
          "Yes, but it needs an NOC (Form 28) from its home RTO and re-registration in your state within the permitted window. Timelines and road-tax refunds vary by state — check the current rules on Parivahan before committing.",
      },
      {
        question: "How do I confirm the number of previous owners?",
        answer:
          "Check the owner serial number in the vehicle record on Parivahan (VAHAN) or the mParivahan app. A third-owner car priced like a one-owner car is a negotiation point, not a footnote.",
      },
    ],
  },

  bikes: {
    heading: "Used bike buying checklist for India",
    intro:
      "Two-wheeler deals go wrong on the same three things every time — the RC, the frame and the keys. Check all three before money moves.",
    sections: [
      {
        title: "Papers and portal checks",
        items: [
          "Ask for the original RC and match the seller's government photo ID to the name on it.",
          "Match the engine number and frame (chassis) number stamped on the bike against the RC exactly — usually on the engine casing and at the steering head.",
          "If the RC shows a hypothecation entry, insist on the financier's NOC and Form 35 proving the loan is closed.",
          "Check pending challans on the Parivahan e-challan portal or your state transport site.",
          "Verify the insurance is active and the PUC certificate is valid.",
          "Pull the vehicle record on Parivahan (VAHAN) or mParivahan: confirm the owner count and registration date, and that the bike is not blacklisted.",
        ],
      },
      {
        title: "Inspect the bike",
        items: [
          "Ask for both keys. One key with a story about the other is how stolen bikes get sold.",
          "Cold-start it. A healthy engine catches within seconds; heavy smoke or a rattle at idle is engine wear you will pay for.",
          "Look for accident evidence: scrapes on the engine casing and bar ends, a repainted or dented tank, bent handlebar lock-stops, and welding or fresh paint at the frame neck.",
          "Sight the front wheel, forks and handlebar from dead ahead — they should line up perfectly. A wobble on a slow hands-light test ride suggests a bent frame or forks.",
          "Sanity-check the odometer against wear: footpeg rubber, grips, the brake-disc lip and sprocket teeth do not lie.",
          "Test all electricals: headlight high and low beam, indicators, horn, brake light, console warning lamps and the electric start.",
          "Check chain, sprocket and tyre condition — honest indicators of real usage and of your first month's spend.",
        ],
      },
      {
        title: "Closing the deal",
        items: [
          "Get Form 29 (in duplicate) and Form 30 signed, and file the ownership transfer with the RTO — many states accept it online on Parivahan.",
          "Write a signed sale receipt with the date, price, odometer reading and both parties' details, one copy each.",
          "Pay by UPI or bank transfer matching the receipt. No advance before the documents check out.",
          "Apply for the insurance to be transferred into your name within 14 days of the sale.",
          "Collect the original RC, insurance and PUC, both keys and any service records, then track the application until the RC shows your name.",
        ],
      },
    ],
    faqs: [
      {
        question: "What paperwork does a used bike sale need in India?",
        answer:
          "The original RC, valid insurance and PUC, signed Forms 29 and 30 for the RTO transfer, the financier's NOC with Form 35 if the RC shows hypothecation, and a signed sale receipt. Both keys are not paperwork, but treat them as mandatory.",
      },
      {
        question: "How can I tell if a used bike is stolen?",
        answer:
          "Match the engine and frame numbers stamped on the bike to the RC, verify the record on Parivahan (VAHAN), and insist the seller's photo ID matches the RC name. If the original RC is 'lost', ask the seller to obtain a duplicate RC from the RTO first — do not buy on promises.",
      },
      {
        question: "The RC shows a loan (hypothecation). Can I still buy the bike?",
        answer:
          "Only after the loan is closed. The seller must give you the financier's NOC and Form 35 so the hypothecation can be terminated at the RTO — without that you will not get a clean transfer.",
      },
      {
        question: "How do I spot an accident-damaged frame?",
        answer:
          "Look for welding or fresh paint at the frame neck, bent handlebar lock-stops, misaligned forks and scraped engine casings. A bike that will not track straight, or wobbles at low speed, deserves a mechanic's opinion — not a discount.",
      },
      {
        question: "Does the bike's insurance carry over to me?",
        answer:
          "Third-party cover is deemed transferred with ownership, but you must apply to the insurer within 14 days of the sale to move the policy into your name. Own-damage cover only follows once that endorsement is made.",
      },
    ],
  },

  mobiles: {
    heading: "Used mobile phone buying checklist",
    intro:
      "A used phone is safe to buy only when the IMEI, the bill and the signed-out accounts all agree — everything else is negotiation.",
    sections: [
      {
        title: "Identity and paperwork",
        items: [
          "Dial *#06# and match every IMEI shown against the box sticker and the original bill. A mismatch ends the deal.",
          "Check the IMEI on the government's Sanchar Saathi (CEIR) portal to confirm the phone is not reported lost or stolen — a blocklisted IMEI will not work on any Indian network.",
          "Ask for the original purchase bill. Brand warranty in India generally follows the device with that bill, and the purchase date tells you how much warranty is left.",
          "If the phone was bought on EMI or a finance scheme, ask for the loan-closure proof or final invoice — financed phones can carry locking apps that disable the device if instalments stop.",
          "Be wary of a bill in a third party's name with no explanation that checks out — it weakens warranty claims and your position if the phone is ever disputed.",
        ],
      },
      {
        title: "Test the phone",
        items: [
          "Make the seller sign out in front of you: iCloud/Apple ID with Find My turned off on an iPhone, and the Google account (plus any Samsung or Mi account) on Android. A phone still tied to someone else's account can be locked remotely and is unusable to you.",
          "After the sign-out, do a full factory reset in front of you and set the phone up fresh with your own SIM before paying.",
          "Check battery health: on an iPhone, Settings > Battery > Battery Health — Apple treats capacity below 80% as degraded, which is a fair price-cut argument. On Android, use the brand's diagnostics where available.",
          "Test the screen edge to edge: dead pixels, touch response, brightness range, and burn-in on a plain background.",
          "Test all cameras and lenses, speakers, microphones, the charging port with a cable, fingerprint or face unlock, Wi-Fi, Bluetooth and both SIM slots.",
          "On an iPhone, open Settings > General > About: 'Unknown Part' or non-genuine warnings reveal aftermarket screen or battery replacements.",
          "Check the liquid-damage indicator in the SIM tray slot where the model has one — a red or pink indicator means water exposure.",
        ],
      },
      {
        title: "Before you pay",
        items: [
          "Meet in person and test with your own SIM — calls, data and OTP delivery — before money moves. A phone deal that cannot happen face to face is the classic classifieds scam.",
          "Write the IMEI on the receipt along with the price, date and both names. IMEI on the box, bill and receipt should all match.",
          "Take the box, bill and any accessories the seller claimed. Chargers and cables are also a quick authenticity check.",
          "Pay by UPI or bank transfer, never an advance for courier delivery, and only after the fresh setup shows no account lock reappearing.",
        ],
      },
    ],
    faqs: [
      {
        question: "How do I check if a second-hand phone is stolen?",
        answer:
          "Dial *#06# to read the IMEI, then check it on the government's Sanchar Saathi (CEIR) portal, which flags blocklisted and stolen-reported devices. Also match the IMEI to the original bill and box — a seller with neither deserves extra suspicion.",
      },
      {
        question: "What is activation lock and why does it matter?",
        answer:
          "iPhones with Find My on stay tied to the seller's Apple ID, and Android phones stay tied to their Google account, even after a factory reset. Unless the seller signs out in front of you before you pay, the phone can be locked into a brick from anywhere.",
      },
      {
        question: "Does the manufacturer warranty transfer to me?",
        answer:
          "Most brand warranties in India attach to the device and its original bill rather than to a named owner, so keep the bill. Confirm the remaining coverage with the brand's service centre or its online warranty-check using the IMEI or serial number.",
      },
      {
        question: "What battery health is acceptable on a used iPhone?",
        answer:
          "Apple treats capacity below 80% as degraded and eligible for battery service. A reading close to that means a battery replacement is in your near future — price the phone accordingly.",
      },
      {
        question: "The seller bought the phone on EMI. Is that a problem?",
        answer:
          "It can be. Phones sold on finance schemes often carry a locking app, and the financier can disable the device remotely if instalments stop. Ask for the loan-closure letter or proof the device is fully paid before you buy.",
      },
    ],
  },

  properties: {
    heading: "Property buying checklist for India",
    intro:
      "Property is the one purchase here where you should pay professionals to verify before you pay the seller — this list is what your lawyer and CA must confirm.",
    sections: [
      {
        title: "Title and paperwork",
        items: [
          "Have a lawyer trace the title: the chain of registered sale deeds down to the current seller, with every co-owner identified. All co-owners must sign the sale.",
          "Get an Encumbrance Certificate (EC) for the property from the sub-registrar's office, covering as long a period as your lawyer advises — it lists registered mortgages and transactions against the property.",
          "For new and under-construction projects, verify the project's RERA registration number on your state's RERA portal — approvals, the promised possession date and complaints are on record there.",
          "Compare the approved building plan with what actually stands. Unapproved floors or extensions become your problem after registration, not the seller's.",
          "Ask for the Occupancy Certificate (OC) for a completed building, and up-to-date property tax receipts.",
          "For society flats, get the society's NOC, a no-dues certificate for maintenance, and the share certificate where applicable.",
          "If the seller has a running home loan on the property, involve their bank: the loan must be closed and the original documents released as part of the transaction — your lawyer structures this.",
          "Treat power-of-attorney deals as a red flag. Have your lawyer confirm a registered sale-deed chain, not just a POA.",
        ],
      },
      {
        title: "Inspect the property",
        items: [
          "Get the carpet area stated in writing in the agreement. Carpet is the usable area within your walls; super built-up adds loading for common areas — the difference is large and often the whole trick.",
          "Visit at different times of day: water pressure in the morning, noise in the evening, and damp patches after rain if you can manage it.",
          "Check walls and ceilings for structural cracks, and for fresh paint patches that might be hiding seepage.",
          "Get the parking allotment, amenities and common-area rights in writing — a verbal 'included' has no value at registration.",
          "Walk the actual unit against the plan: room sizes, balconies, and any construction deviation.",
          "Talk to neighbours and the society office. Pending disputes, water problems and the builder's track record surface in five minutes of conversation.",
        ],
      },
      {
        title: "Closing the deal",
        items: [
          "Only registration of the sale deed at the sub-registrar's office transfers ownership — an agreement to sell or a notarised paper does not. Stamp duty and registration charges are state-specific; confirm current rates with your lawyer.",
          "TDS: on purchases above the government-set threshold, the buyer must deduct tax at source and deposit it against the seller's PAN. Confirm the current threshold, rate and process with your CA before payment day.",
          "Pay through banking channels. Income-tax law penalises large cash components in property deals, and an unrecorded cash part also weakens your own position later — ask your CA.",
          "After registration, apply for mutation — updating the municipal or revenue record (khata, patta and other names vary by state) to your name — and transfer the electricity and water meters.",
          "At handover, collect every original: the full chain of sale deeds, EC, tax receipts, OC, NOCs, possession letter and all keys.",
          "If you are taking a home loan, remember the bank's legal and technical checks protect the bank's interest. They are a second opinion, not a substitute for your own lawyer.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is an Encumbrance Certificate and why do I need one?",
        answer:
          "An EC from the sub-registrar lists the registered transactions — sales, mortgages, charges — recorded against a property for the period it covers. It is how you find an undisclosed loan or a competing registered claim before your money moves. Your lawyer will tell you what period to cover.",
      },
      {
        question: "How do I verify a project's RERA registration?",
        answer:
          "Every state runs its own RERA portal. Search the project name or registration number to see its approvals, promised possession date, quarterly filings and complaints. If a project that should be registered is not, walk away or have your lawyer confirm it is genuinely exempt.",
      },
      {
        question: "What is the difference between carpet area and super built-up area?",
        answer:
          "Carpet area is the usable floor area inside your walls; built-up adds the walls themselves; super built-up adds a share of common areas like lobbies and stairs. RERA requires new projects to sell on carpet area — whatever the listing quoted, get the carpet area stated in your agreement.",
      },
      {
        question: "Do I have to deduct TDS when buying a property?",
        answer:
          "Above a government-set price threshold, the buyer must deduct tax at source from payments to the seller and deposit it against the seller's PAN. The threshold, rate and filing process change over time — confirm the current numbers with your CA before you pay.",
      },
      {
        question: "Is the bank's verification enough if I am taking a home loan?",
        answer:
          "No. The bank's legal and technical scrutiny protects the bank's security interest and can miss issues that matter to you as the owner. Hire your own lawyer for the title search and agreement review — a small cost against the asset.",
      },
      {
        question: "What are mutation and khata — do they replace registration?",
        answer:
          "No. Registration of the sale deed is what transfers ownership; mutation only updates the municipal or revenue record (called khata, patta or similar depending on the state) so tax records carry your name. Do it after registration — it matters for resale and loans later.",
      },
    ],
  },
};

/**
 * Guide for a category page, or `null` for the 20 categories that do not
 * have one. Callers must handle `null` — the page renders nothing extra.
 */
export function getBuyerGuide(categorySlug) {
  return BUYER_GUIDES[categorySlug] ?? null;
}
