const seo = {
  title: "Landlord PAN for HRA: the ₹1,00,000 Rent Threshold",
  metaDescription:
    "Test your annual rent against the ₹1,00,000 PAN limit, the ₹3,000 receipt relaxation and the ₹50,000 section 194-IB TDS trigger, shared flats included.",
  steps: [
    "Enter Total monthly rent for the house (INR), Months of rent paid this financial year and Your share of the rent (%) if you split the flat with someone.",
    "Tick Landlord has given you a PAN or Landlord is a non-resident (NRI) as they apply, and pick the Section 194-IB rate to apply — 2% on or after 1 October 2024, or 5% up to 30 September 2024.",
    "Annual rent paid by you comes back with the verdict on the landlord's PAN, your distance from the ₹1,00,000 threshold and any Rent TDS payable by you, plus a What you have to produce list marking each proof Required or Not mandatory.",
  ],
  intro:
    "This checker tells you which rent proofs your HRA claim legally needs: it compares the rent you pay against the ₹1,00,000 annual limit at which CBDT Circular 8/2013 makes the landlord's PAN compulsory, the ₹3,000 monthly relaxation for rent receipts, and the ₹50,000 monthly trigger for section 194-IB rent TDS. Enter the total rent, how many months you paid and your share if you split the flat, and it returns the annual figure plus a checklist of what your employer and the Income Tax Department can ask for. It also shows the tax you would have to deduct yourself, including the 20% no-PAN rate capped at one month's rent.",
  useCases: [
    "A salaried employee paying ₹9,000 a month checking whether crossing ₹1,08,000 for the year means chasing the landlord for a PAN before the December proof-submission deadline.",
    "Two flatmates on a ₹70,000 flat working out whether either of them individually crosses the ₹50,000 monthly line that makes section 194-IB TDS their personal responsibility.",
    "A tenant whose landlord refuses to share a PAN, confirming that a written no-PAN declaration with name and address is the accepted substitute.",
  ],
  benefits: [
    ["Three thresholds in one answer", "Receipts, PAN disclosure and rent TDS are checked together instead of one at a time."],
    ["Handles shared flats", "Applies your percentage share first, because both limits look at the rent you personally pay."],
    ["Shows the no-PAN cost", "Quantifies the 20% deduction under section 206AA and the last-month-rent cap that limits it."],
  ],
  faqs: [
    [
      "At what rent is the landlord's PAN compulsory for HRA?",
      "The landlord's PAN is compulsory once the rent you pay in a financial year exceeds ₹1,00,000, which works out to about ₹8,333 a month for a full twelve months. Below that, CBDT Circular 8/2013 lets the employer accept the claim on receipts alone.",
    ],
    [
      "What if my landlord does not have a PAN?",
      "Get a signed declaration from the landlord stating they hold no PAN, together with their name and full address, and submit that to your employer instead. The circular expressly allows this route, and you should keep a copy with your rent receipts.",
    ],
    [
      "Do I have to deduct TDS on the rent I pay?",
      "Only if you pay more than ₹50,000 a month to a resident landlord, in which case section 194-IB applies at 2% from 1 October 2024 (5% before that). It is deducted once, in the last month of the financial year or the tenancy, then paid using Form 26QC within 30 days.",
    ],
    [
      "Are rent receipts needed if my rent is small?",
      "Where the rent is ₹3,000 a month or less, an employer may accept the HRA claim without receipts under the Circular 8/2013 relaxation. That relaxation only covers the employer's TDS working, so keep receipts and bank transfer proof in case an assessing officer asks later.",
    ],
  ],
};

export default seo;
