const seo = {
  title: "Oxygen Requirement Calculator: FiO2 by Device",
  metaDescription:
    "Classify SpO2 as normal to critical, estimate FiO2 at about 4% per L/min, and compare nasal cannula, simple mask, rebreathers and Venturi.",
  steps: [
    "Enter Current SpO2 (%) and pick an Age Group — Adult, Child (1-12 yrs), Infant, Neonate or COPD / Chronic Lung Disease; Weight (kg) is optional.",
    "Choose a Device Type and Flow Rate (L/min) — picking Venturi also shows the colour-coded adapter table — then press Calculate.",
    "Read the hypoxemia level, All Devices Comparison and Recommendations, then press Copy Report or Download for an Oxygen_Report_94SpO2_*.txt file.",
  ],
  intro:
    "The Oxygen Requirement Calculator classifies a patient's SpO2 into normal, mild, moderate, severe or critical hypoxemia, estimates the FiO2 delivered by a chosen device at a given flow rate using the roughly 4% per litre per minute rule, and compares five delivery devices side by side. It applies target saturations of 94–98% for most adults and children and 88–92% where a COPD-style controlled-oxygen target applies. It is an educational reference for students and clinicians revising oxygen delivery — every real prescribing decision belongs to the treating clinician.",
  useCases: [
    "A nursing or paramedic student is revising oxygen delivery and wants to see how FiO2 changes across nasal cannula, simple mask, partial rebreather, non-rebreather and Venturi at each device's usable flow range.",
    "You are checking the Venturi colour-to-FiO2 mapping — which adapter gives 28% and what flow it needs — before a practical assessment.",
    "You want to reason through why a COPD target of 88–92% changes the device choice compared with a standard 94–98% target, and produce a written summary of the comparison.",
  ],
  benefits: [
    ["Device comparison, not a single answer", "Five delivery devices are shown together with each one's flow range and resulting FiO2, so the trade-off between comfort and oxygen concentration is visible at once."],
    ["Targets that change with the patient group", "Neonate, infant, child, adult and COPD each carry their own target saturation band, and the guidance text calls out the COPD controlled-oxygen case specifically, rather than applying one universal target to everyone."],
    ["Produces a documentable summary", "The report lists parameters, classification, device, flow, estimated FiO2 and the device comparison as plain text you can copy or download for teaching notes."],
  ],
  faqs: [
    [
      "What FiO2 does a nasal cannula deliver?",
      "Roughly 24% to 44%, working from a 1–6 L/min flow range with each additional litre per minute adding about 4% FiO2. These are estimates: actual delivered FiO2 varies with the patient's respiratory rate and tidal volume, which is why cannulae are called low-flow devices.",
    ],
    [
      "What SpO2 counts as hypoxemia?",
      "This tool treats 96% and above as normal, 94–95% as mild, 90–93% as moderate, 85–89% as severe and below 85% as critical hypoxemia. Most adults are targeted to 94–98%, while patients at risk of CO2 retention are commonly targeted to 88–92%.",
    ],
    [
      "Why is the oxygen target lower in COPD?",
      "Because over-oxygenation in patients at risk of hypercapnia can worsen CO2 retention, guidance commonly sets a controlled target of 88–92% rather than 94–98%. A Venturi mask is preferred in that situation because it delivers a fixed, known FiO2 regardless of the patient's breathing pattern, and an arterial blood gas is typically checked after 30–60 minutes.",
    ],
    [
      "Why does a simple face mask need at least 5 L/min?",
      "Below about 5 L/min there is not enough fresh gas flow to flush exhaled air out of the mask, so the patient rebreathes their own CO2. That is why a simple mask runs 5–10 L/min, while a non-rebreather with its reservoir bag and one-way valves runs 10–15 L/min to keep the bag inflated.",
    ],
  ],
};

export default seo;
