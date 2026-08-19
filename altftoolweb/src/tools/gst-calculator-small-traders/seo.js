const seo = {
  title: "GST Calculator, Small Traders: Composition or Not",
  metaDescription:
    "Checks your state's Rs 40/20/10 lakh registration threshold, whether the composition scheme is still open, and which leaves more margin at one price.",
  steps: [
    "Pick your Kind of business - Trader / retailer of goods, Manufacturer, Restaurant or Service provider - and your State or union territory.",
    "Enter Annual turnover / receipts (INR), Annual purchases, GST inclusive (INR) and both GST rates, then tick I sell to customers in other states if you do.",
    "Read the Better scheme for you, your state's registration threshold, the composition ceiling and levy rate, and any eligibility blockers listed.",
  ],
  intro:
    "This calculator answers three questions for a small Indian business at once: whether turnover has crossed the GST registration threshold in its own state under section 22 read with Notification 10/2019-CT, whether the composition scheme in section 10 of the CGST Act is still open, and which of the two schemes leaves more margin at the same selling price. It compares the 1% composition levy for traders and manufacturers, 5% for restaurants and 6% for service providers against the regular scheme's output tax less input tax credit. Built for kirana stores, small manufacturers, eateries and single-state service firms deciding how to register.",
  useCases: [
    "A kirana store in Maharashtra at Rs 60 lakh turnover choosing between composition and regular registration",
    "A trader in Meghalaya checking whether the Rs 40 lakh or the Rs 20 lakh registration threshold applies",
    "A restaurant owner comparing the 5% composition levy against 5% output GST with no input tax credit",
  ],
  benefits: [
    ["State-specific thresholds", "Uses the actual Rs 40 lakh, Rs 20 lakh or Rs 10 lakh limit for the state you pick."],
    ["Margin, not just tax", "Compares money left in the business, since a composition dealer cannot pass on the levy."],
    ["Eligibility blockers named", "Flags the turnover ceiling and the section 10(2)(c) bar on inter-state sales."],
  ],
  faqs: [
    [
      "What is the GST registration limit for a small trader?",
      "Rs 40 lakh of aggregate turnover for a person supplying goods only, in most states. It stays at Rs 20 lakh in Arunachal Pradesh, Meghalaya, Puducherry, Sikkim, Telangana and Uttarakhand, and at Rs 10 lakh in Manipur, Mizoram, Nagaland and Tripura. For service providers the base limit is Rs 20 lakh.",
    ],
    [
      "What is the composition scheme turnover limit?",
      "Rs 1.5 crore in the preceding financial year for suppliers of goods, reduced to Rs 75 lakh in Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura and Uttarakhand. Service providers have a separate Rs 50 lakh option under section 10(2A) at 6%.",
    ],
    [
      "Can a composition dealer charge GST on the bill?",
      "No. Section 10(4) bars a composition taxpayer from collecting tax from the recipient and from taking input tax credit, so the levy is a cost against your margin. Composition invoices must carry the words 'composition taxable person, not eligible to collect tax on supplies'.",
    ],
    [
      "Is composition always cheaper than the regular scheme?",
      "No. Composition wins when your margin is wide and your purchases carry little input tax; the regular scheme wins when input tax credit is large or your customers are registered businesses who want to claim the credit you charge them. Compare both at your own numbers and confirm with a GST practitioner before filing CMP-02.",
    ],
  ],
};

export default seo;
