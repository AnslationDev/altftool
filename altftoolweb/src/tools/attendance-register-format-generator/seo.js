const seo = {
  title: "Form D Attendance Register Format for Any Wage Month",
  metaDescription:
    "One column per calendar day with leap years handled, weekly offs marked WO, holidays PH, the code legend printed, and CSV for Excel or Google Sheets.",
  steps: [
    "Enter \"Name of establishment\", pick the \"Wage month\" and \"Year\", choose the \"Weekly off day\", and list \"Paid holiday dates (day numbers)\" such as 1, 14, 26.",
    "Paste your staff into \"Employees — one per line, as 'code, name'\" and tick \"Include the overtime hours column\" if the sheet needs it.",
    "The register renders with one column per calendar day, WO and PH already marked and the marking-code legend printed underneath; \"Copy CSV\" puts the whole grid on the clipboard for Excel or Google Sheets.",
  ],
  intro:
    "This generator lays out an attendance register for one wage month: a header block for the establishment, one row per employee, one column per calendar day, and totals for days worked, days absent and overtime hours. The column structure follows Form D, the combined Attendance Register introduced by the Ease of Compliance to Maintain Registers under various Labour Laws Rules, 2017, which replaced 56 separate registers under nine central labour laws with five. It is aimed at HR and admin staff in factories, shops, contract-labour sites and small offices who keep attendance on paper or in a spreadsheet.",
  useCases: [
    "Print a fresh muster sheet at the start of every wage month with Sundays already marked WO and the national holidays marked PH.",
    "Hand a supervisor a shop-floor sheet for 40 workers that already carries the employee codes, so only the daily marking is left to do.",
    "Export the layout as CSV and open it in Excel or Google Sheets as the starting grid for a payroll attendance file.",
    "Rebuild a February sheet correctly in a leap year, when a 28-column template silently drops the 29th.",
  ],
  benefits: [
    [
      "Correct day count every month",
      "Uses the Gregorian leap rule, so February gets 29 columns in 2028 and 28 in 2029 without manual editing.",
    ],
    [
      "Weekly offs and holidays pre-marked",
      "Weekly off days are filled with WO and the holiday dates you enter with PH, so no one has to count Sundays by hand.",
    ],
    [
      "Legend printed on the sheet",
      "The ten marking codes are listed under the table so P, HD, LWP and OD mean the same thing to every supervisor.",
    ],
  ],
  faqs: [
    [
      "Which form is the attendance register in India?",
      "Form D under the Ease of Compliance to Maintain Registers under various Labour Laws Rules, 2017 is the combined attendance register. Those rules merged 56 registers under nine central labour laws — including the muster rolls in Form V of the Minimum Wages (Central) Rules, 1950 and Form XVI of the Contract Labour Central Rules, 1971 — into five registers: Employee, Wages, Loans and recoveries, Attendance, and Rest days and leave.",
    ],
    [
      "How long do I have to keep an attendance register?",
      "Three years from the date of the last entry made in it, under the 2017 combined-register rules. Many establishments keep them longer because inspections, PF and ESIC queries and wage disputes can reach further back.",
    ],
    [
      "Can the attendance register be kept electronically?",
      "Yes. The 2017 rules expressly allow the registers to be maintained in electronic form, and later central rules permit an electronic register with a digital or electronic signature. The CSV export here is meant to be the starting grid for that electronic copy.",
    ],
    [
      "What do the codes P, WO, PH and LWP mean on a muster sheet?",
      "P is a full shift present, WO is the weekly off, PH is a paid or festival holiday, and LWP is leave without pay. These letters are payroll convention rather than statute — the law prescribes the columns, so printing the legend on the sheet is what keeps the marking unambiguous.",
    ],
  ],
};

export default seo;
