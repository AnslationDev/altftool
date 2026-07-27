const seo = {
  intro:
    "This checker tells you whether GST e-invoicing under Rule 48(4) of the CGST Rules applies to your business, from which date it started, and whether the 30-day IRP reporting window binds you. The test is PAN-level aggregate turnover in any financial year from 2017-18 onwards, measured against the notified thresholds that stepped down from Rs 500 crore in October 2020 to Rs 5 crore in August 2023. It is built for accountants, finance teams and business owners who need a defensible answer before their next B2B invoice goes out.",
  useCases: [
    "A trading firm whose turnover touched Rs 6 crore in FY 2022-23 and then fell to Rs 4 crore wants to know if e-invoicing still applies",
    "A goods transport agency billing corporate clients wants to confirm it is outside the mandate despite a large turnover",
    "A manufacturer with Rs 40 crore turnover checks the last date to upload a 15 April invoice to the IRP before the 30-day window closes",
  ],
  benefits: [
    ["Turnover history matters", "Applies the any-year-since-2017-18 test, not just last year's books."],
    ["Entity carve-outs built in", "Flags SEZ units, banks, insurers, GTAs and multiplexes as exempt regardless of size."],
    ["Reporting window included", "Shows the 30-day IRP deadline for taxpayers with turnover of Rs 10 crore or more."],
  ],
  faqs: [
    [
      "What is the current turnover limit for e-invoicing under GST?",
      "E-invoicing applies where PAN-level aggregate turnover exceeds Rs 5 crore, the threshold notified from 1 August 2023 by Notification 10/2023 – Central Tax. The test looks at any financial year from 2017-18 onwards, so crossing Rs 5 crore even once brings you in.",
    ],
    [
      "If my turnover falls below Rs 5 crore, can I stop generating e-invoices?",
      "No. Once your aggregate turnover has exceeded a notified threshold in any financial year from 2017-18, the obligation is permanent and a later drop in turnover does not switch it off. You must keep reporting B2B, export and SEZ documents to an IRP.",
    ],
    [
      "Who is exempt from e-invoicing even with a large turnover?",
      "SEZ units, insurance companies, banking companies, financial institutions and NBFCs, goods transport agencies supplying road transport of goods, passenger transport service suppliers, multiplex cinema exhibitors, and government departments and local authorities. Note that SEZ developers are covered — only SEZ units are carved out.",
    ],
    [
      "How many days do I have to upload an invoice to the IRP?",
      "Taxpayers with annual aggregate turnover of Rs 10 crore or more must report a document to the IRP within 30 days of the document date; the window applied to Rs 100 crore and above from 1 November 2023 and was extended to Rs 10 crore and above from 1 April 2025. A late document is rejected outright, and without an IRN your buyer cannot claim input tax credit on it. Confirm the current advisory on the e-invoice portal, since the limit is set administratively by GSTN.",
    ],
  ],
};

export default seo;
