const seo = {
  intro:
    "This tool builds a dated filing calendar for an Indian sole proprietorship from the registrations you actually hold — GST scheme, TDS, EPF and ESI, tax audit and presumptive taxation. It applies the statutory dates in the CGST Rules and the Income-tax Act: GSTR-1 on the 11th, GSTR-3B on the 20th, QRMP payments on the 25th, advance tax on 15 June, 15 September, 15 December and 15 March, and the section 139(1) return date of 31 July or 31 October. A proprietor has no ROC filings, so the year is shorter than a company's — but missing a GST return still costs late fees per day.",
  useCases: [
    "Print a one-page year plan for a freelancer on QRMP so the 13th, 22nd and 25th never get confused.",
    "Check whether a proprietorship crossing Rs 2 crore turnover has picked up the GSTR-9 annual return.",
    "See at a glance which filings fall in the next 30 days before a holiday or a trip.",
    "Explain to a new client which of the twelve TDS challans and four quarterly statements apply to them.",
  ],
  benefits: [
    ["Only what applies to you", "Composition, QRMP and monthly GST produce entirely different calendars — pick one and the rest disappear."],
    ["Every date is statutory", "Each entry cites the rule it comes from, so you can check it against the notification."],
    ["Sorted by urgency", "The next filing is shown first, with days remaining, and past dates can be hidden."],
  ],
  faqs: [
    [
      "What are the GST return due dates for a small proprietor?",
      "A monthly filer files GSTR-1 by the 11th and GSTR-3B by the 20th of the following month. Under QRMP, GSTR-1 is quarterly by the 13th of the month after the quarter, GSTR-3B is due on the 22nd or the 24th depending on your state group, and tax is deposited in Form PMT-06 by the 25th in the first two months of each quarter.",
    ],
    [
      "When does a sole proprietor have to file the income tax return?",
      "31 July following the financial year where no tax audit applies, and 31 October where a section 44AB audit does apply, under section 139(1). A belated or revised return can be filed until 31 December of the assessment year, with a late fee under section 234F, after which only an updated return under section 139(8A) remains.",
    ],
    [
      "Does a proprietor pay advance tax in four instalments?",
      "A regular assessee pays 15% by 15 June, 45% cumulative by 15 September, 75% by 15 December and 100% by 15 March, under section 211. A proprietor taxed presumptively under section 44AD or 44ADA pays the entire advance tax in a single instalment by 15 March.",
    ],
    [
      "Does a sole proprietorship have any ROC or annual filing?",
      "No. A proprietorship is not a separate legal entity, so there is no MCA registration, no AOC-4 or MGT-7, and no annual general meeting. Its compliance is limited to tax, GST and, if it employs people, EPF, ESI and state professional tax and shops-and-establishment renewals.",
    ],
  ],
};

export default seo;
