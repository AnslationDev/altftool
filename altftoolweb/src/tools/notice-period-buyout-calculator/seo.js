const seo = {
  title: "Notice Period Buyout Calculator for India (INR)",
  metaDescription:
    "Per-day salary from Basic + DA or gross × unserved notice days after leave set-off — buyout, optional 18% GST and net cost after reimbursement.",
  steps: [
    "Enter 'Monthly Basic + DA' and other allowances in INR, choose 'Buyout is charged on' (Basic + DA only or Full monthly gross) and the 'Per-day salary basis' (30 days, 26 working days or calendar year / 365), then set contract notice days, days you will serve, adjustable leave and any new-employer reimbursement.",
    "'Notice buyout payable' recomputes live — unserved days times per-day salary — with rows for leave adjusted, buyout amount, GST at 18% if the 'Employer invoices GST' checkbox is ticked, total payable and net cost after reimbursement.",
    "Press 'Copy result' for the line-by-line recovery note or 'Reset'; the 30/60/90-day preset buttons switch the contract notice period in one click.",
  ],
  intro:
    "The Notice Period Buyout Calculator tells you what leaving early actually costs. It converts your monthly salary into a per-day rate on the base your contract specifies — Basic + DA or full gross — and multiplies it by the notice days you will not serve, after setting off any leave balance your employer allows you to adjust. It is built for employees weighing an early joining date, and for HR teams issuing a recovery note.",
  useCases: [
    "You have a 90-day notice period, your new employer wants you in 30 days, and you need to know the recovery amount before you negotiate the offer.",
    "You are checking whether 15 days of unused earned leave can be adjusted against the shortfall so the buyout drops.",
    "Your new company offers to reimburse the buyout up to a cap and you want the net out-of-pocket figure after that reimbursement.",
  ],
  benefits: [
    ["Uses your real salary split", "Charge the buyout on Basic + DA or on full gross, exactly as your appointment letter states."],
    ["Leave set-off built in", "Adjusted leave days are deducted from the shortfall before the per-day rate is applied."],
    ["Negotiation-ready numbers", "Shows the buyout, optional GST, reimbursement offset and net cost so you can quote a figure with confidence."],
  ],
  faqs: [
    [
      "How is notice period buyout calculated in India?",
      "The usual formula is unserved notice days multiplied by per-day salary, where per-day salary is the contractual base (commonly Basic + DA) divided by 30 or by the number of working days in the month. There is no statutory formula — the amount comes from your employment contract.",
    ],
    [
      "Is buyout charged on Basic salary or on gross or CTC?",
      "It depends entirely on the wording of your appointment letter. Many Indian employers recover on Basic + DA, some on gross, and a few on full CTC, which is the most expensive for the employee. Check the clause before you agree to a date.",
    ],
    [
      "Can leave balance be adjusted against the notice period?",
      "Many companies allow accrued earned leave to offset part of the notice, but it is a policy decision, not a right. Some employers insist leave be encashed in the settlement instead of adjusted, which leaves the full shortfall payable.",
    ],
    [
      "Is GST payable on notice pay recovery?",
      "Several employers historically added 18% GST to notice pay recovery, but multiple CESTAT and AAR rulings and a 2022 CBIC circular have held that notice pay recovery is not a supply and is not liable to GST. The toggle is provided only for employers that still invoice it — treat this as general information, not tax advice.",
    ],
  ],
};

export default seo;
