const seo = {
  title: "Driver Salary Calculator with Overtime, PF",
  metaDescription:
    "Build a driver's payslip: ordinary rate from wage, duty days and hours; overtime at twice that rate; night, outstation and weekly-off pay; EPF and ESI.",
  steps: [
    "Enter Monthly wage (INR), Duty days in the month and Duty hours per day — these set the ordinary rate that overtime is paid on.",
    "Add Overtime hours in the month at the Overtime multiplier (statutory floor 2), plus Night duties, Outstation / halt days and Weekly-off days worked, and tick Deduct EPF (12%) or Apply ESI.",
    "Read Net pay in hand next to the employer's total outgo, with the ordinary rate per hour and per day, then use Copy result.",
  ],
  intro:
    "This calculator builds a driver's monthly pay from the ordinary rate of wages — monthly wage divided by duty days times duty hours — and then adds overtime at twice that rate, as Section 26 of the Motor Transport Workers Act, 1961 requires. Night duty, outstation halts, weekly-off days worked and other allowances are added on top, and EPF at 12% on wages up to ₹15,000 plus ESI at 0.75% employee and 3.25% employer on gross up to ₹21,000 are shown on both sides. Fleet owners, cab operators and families employing a driver get a payslip they can hand over.",
  useCases: [
    "Settle a month's pay for a company driver who did 20 overtime hours and two outstation nights.",
    "Compare the true cost of employing a driver directly against a monthly contract from an agency.",
    "Give a family driver a written breakdown of base wage, overtime and any advance recovered.",
  ],
  benefits: [
    ["Statutory overtime built in", "Defaults to twice the ordinary rate, the floor set by the Motor Transport Workers Act."],
    ["Both sides of the cost", "Shows net in hand and the employer's total outgo including PF, admin charges and ESI."],
    ["Hours check", "Flags when the roster pushes average weekly hours past the 48-hour normal working week."],
  ],
  faqs: [
    [
      "How is a driver's overtime rate calculated?",
      "Divide the monthly wage by contracted hours to get the ordinary hourly rate, then pay twice that for each overtime hour. On ₹18,000 a month over 26 duty days of 8 hours (208 hours), the ordinary rate is ₹86.54 an hour and overtime is ₹173.08 an hour.",
    ],
    [
      "How many hours can a driver legally work in a day?",
      "The Motor Transport Workers Act, 1961 fixes normal working hours at 8 in a day and 48 in a week, with a weekly rest day. Work beyond that attracts overtime wages and the total is capped by the daily and spread-over limits in the Act and the state rules — check the rules notified in your state before rostering long shifts.",
    ],
    [
      "Is PF and ESI compulsory for a driver?",
      "It depends on the employer, not the job. EPF applies to establishments covered by the EPF Act, at 12% from the employee and 12% from the employer on wages up to the ₹15,000 statutory ceiling; ESI applies to covered establishments while gross monthly wages are ₹21,000 or less, at 0.75% employee and 3.25% employer. A private household employing a driver directly is normally outside both, so the toggles let you switch them off.",
    ],
    [
      "What should a driver be paid for working on the weekly off?",
      "A weekly rest day is a statutory entitlement, so working it should either be compensated with a substituted rest day or paid at the overtime rate — twice the ordinary daily rate is the common practice and the default here. Record the substituted day in the attendance register so the entitlement is not simply lost.",
    ],
  ],
};

export default seo;
