const seo = {
  intro:
    "Under Section 10(13A) of the Income-tax Act, the tax-free part of your house rent allowance is the lowest of three figures: the actual HRA received, rent paid minus 10% of basic + DA, and 50% of basic + DA in a metro or 40% elsewhere. This calculator takes your monthly basic + DA, HRA and rent, shows all three rule amounts side by side, and reports which one binds, the exempt and taxable HRA per month and per year, and the tax that exemption saves at your slab. It is for salaried employees under the old tax regime working out what to claim or what their payroll declaration should say.",
  useCases: [
    "Your employer's investment declaration window is open and you need the annual HRA exemption figure to enter before the deadline",
    "Deciding whether to renew at a higher rent, by checking whether your exemption is already capped by the 50%/40% rule so extra rent buys no extra relief",
    "Comparing the old and new regimes for the year, since the HRA exemption is one of the main deductions you lose by switching",
  ],
  benefits: [
    ["All three rules shown, not just the answer", "You see the actual-HRA, rent-minus-10% and 50%/40% figures together, so it is obvious which one is limiting your claim and why."],
    ["Metro and non-metro handled explicitly", "A single toggle switches the third rule between 50% and 40% of basic + DA, which is the difference most manual calculations get wrong."],
    ["Monthly and annual, plus the tax effect", "Exempt and taxable HRA appear per month and per year, and the exempt amount is multiplied by your chosen slab to show what it is actually worth."],
  ],
  faqs: [
    [
      "How is HRA exemption calculated?",
      "It is the least of three amounts: actual HRA received; rent paid minus 10% of basic + DA; and 50% of basic + DA if you live in a metro or 40% if you do not. On ₹50,000 basic + DA, ₹20,000 HRA and ₹18,000 rent in a metro, the three come to ₹20,000, ₹13,000 and ₹25,000, so ₹13,000 a month is exempt and ₹7,000 is taxable.",
    ],
    [
      "Which cities count as metro for HRA?",
      "Only four — Delhi, Mumbai, Kolkata and Chennai — qualify for the 50% limit; every other city, including Bengaluru, Hyderabad, Pune and Gurugram, uses 40%. On ₹50,000 basic + DA that is a ₹25,000 versus ₹20,000 ceiling, so picking the wrong one can overstate the claim by ₹60,000 a year.",
    ],
    [
      "Can I claim HRA under the new tax regime?",
      "No. The Section 10(13A) exemption is available only under the old regime, which is why the summary this tool copies says so explicitly. If you have opted for the new regime, your entire HRA is taxable and this calculation only matters for comparing the two.",
    ],
    [
      "What proof do I need to claim HRA?",
      "Rent receipts and a rent agreement are the usual evidence, and where annual rent exceeds ₹1,00,000 employers require the landlord's PAN as well. You must genuinely be paying rent for accommodation you occupy and not own — this page is informational, so confirm your own position with a chartered accountant or tax adviser before filing.",
    ],
  ],
};

export default seo;
