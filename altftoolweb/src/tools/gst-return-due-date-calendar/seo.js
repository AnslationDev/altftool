const seo = {
  intro:
    "This calendar generates every GST return due date for a chosen financial year based on how you are registered: GSTR-1 on the 11th and GSTR-3B on the 20th for monthly filers, IFF on the 13th and PMT-06 on the 25th with quarterly GSTR-3B on the 22nd or 24th for QRMP filers, CMP-08 on the 18th for composition dealers, and the 31 December annual return. Dates follow section 39 of the CGST Act read with Rules 59 to 62 and Notification No. 29/2021-Central Tax, which fixed the two QRMP state groups. Useful for practitioners and finance teams laying out a compliance schedule.",
  useCases: [
    "A practitioner building a year-long filing schedule for a client at the start of April",
    "A QRMP filer in Maharashtra confirming whether their quarterly GSTR-3B falls on the 22nd or the 24th",
    "A composition dealer checking the CMP-08 quarterly dates alongside the annual GSTR-4",
  ],
  benefits: [
    ["Registration-aware", "Six taxpayer profiles, from monthly regular filers to ISD and OIDAR suppliers."],
    ["QRMP state groups", "Applies the 22nd or 24th quarterly GSTR-3B date based on your state."],
    ["Countdown", "Shows the next three deadlines and how many days away the first one is."],
  ],
  faqs: [
    [
      "What is the due date for GSTR-3B?",
      "The 20th of the following month for a monthly filer. Under the QRMP scheme the quarterly GSTR-3B is due on the 22nd of the month after the quarter for the group X states and the 24th for the group Y states, as notified by Notification No. 29/2021-Central Tax.",
    ],
    [
      "What is the due date for GSTR-1?",
      "The 11th of the following month for a monthly filer, and the 13th of the month after the quarter for a QRMP filer. QRMP taxpayers can also upload B2B invoices in the first two months of the quarter through the Invoice Furnishing Facility by the 13th.",
    ],
    [
      "When is the GST annual return due?",
      "GSTR-9, and GSTR-9C where turnover exceeds Rs 5 crore, are due by 31 December following the end of the financial year. A composition taxpayer files GSTR-4 instead, due by 30 June following the year.",
    ],
    [
      "What happens if a GST return is filed late?",
      "A late fee runs under section 47 of the CGST Act for each day of delay, capped by notification and reduced for nil returns, and interest at 18% per annum accrues under section 50 on any tax paid late. The portal also blocks the next period's GSTR-1 until the previous GSTR-3B is filed.",
    ],
  ],
};

export default seo;
