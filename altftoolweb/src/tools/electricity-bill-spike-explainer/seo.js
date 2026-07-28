const seo = {
  intro:
    "An electricity bill spike explainer takes two months of billing data — units consumed and the rupee amount actually paid for each — and splits the change in the bill into slab creep, genuine extra consumption, fixed charge, fuel surcharge, electricity duty and any other line on the bill. It is for anyone whose bill jumped far more than their usage did and who wants to know which rupees came from which cause. The split uses the telescopic slab rule that governs Indian domestic LT-1 supply: writing E(u) for the energy charge at u units and m for the rate on the first unit above the lower month's consumption, the extra units are valued at (u1 − u0) × m and everything left over in E(u1) − E(u0) is the cost of spilling into higher-priced blocks.",
  useCases: [
    "Work out how much of a doubled summer bill was a higher slab rather than a doubled air-conditioner run time",
    "Separate a newly notified fuel surcharge (FPPPA, FPPCA or FCA) from a genuine rise in consumption before disputing a bill",
    "Show a landlord or housing society exactly which rupees on a shared meter came from usage and which came from the fixed charge and duty",
    "Check whether a bill that looks wrong is actually carrying arrears or a lost subsidy rather than a metering fault",
  ],
  benefits: [
    [
      "The components add back up to your real bill",
      "Anything the modelled charges do not explain is reported as an 'other charges' line rather than absorbed, so the six pieces sum to the actual rupee difference between the two amounts you paid.",
    ],
    [
      "Slab creep is isolated exactly",
      "Extra units are priced at the marginal rate already in force, so the creep figure is exactly zero when the whole increase stayed inside one slab and positive only when it did not.",
    ],
    [
      "Honest about the tariff table",
      "The slab rates are the indicative domestic LT-1 rates shipped with AltFTool's household bill module, which carries no tariff-order date, so no date is claimed — and every charge on the page can be overridden with the figures printed on your own bill.",
    ],
  ],
  faqs: [
    [
      "Why did my electricity bill double when my usage only went up a little?",
      "Because Indian domestic slabs are telescopic and the higher blocks cost several times the first one. In Maharashtra's indicative domestic table the first 100 units are ₹4.71 each and the next block is ₹10.29 — so going from 95 to 190 units, exactly double the usage, takes the energy charge from ₹447.45 to ₹1,397.10, more than triple. Of that ₹949.65 increase only ₹447.45 is the extra units at the old ₹4.71 rate; ₹502.20 is the 90 units that landed in the ₹10.29 block. Electricity duty then rises on top of the larger base.",
    ],
    [
      "What is slab creep on an electricity bill?",
      "Slab creep is the part of a bill increase caused by units crossing into a higher-priced block rather than by consuming more. This tool measures it as the energy-charge increase minus the extra units valued at the rate already in force at the lower month's consumption, so it is exactly ₹0 when the rise stayed inside one slab. Telescopic billing means only the units above the boundary are re-priced — the whole bill is not moved to the top rate.",
    ],
    [
      "Does the fixed charge make my bill go up when I use more electricity?",
      "No. The fixed or demand charge is levied per month regardless of units — typically ₹90 to ₹125 a month on the indicative domestic tables here — so it contributes ₹0 to a month-on-month increase unless the charge itself was revised or your sanctioned load changed. It does raise the effective rate per unit in a low-usage month, because the same rupees are spread over fewer units.",
    ],
    [
      "What is FPPPA and why does it change my bill?",
      "FPPPA (also FPPCA or FCA depending on the state) is a fuel and power purchase adjustment surcharge levied in paise per unit and re-notified periodically as the utility's fuel costs move. Because it multiplies units, a surcharge revision hits a high-usage month harder: at ₹0.90 per unit a 240-unit month pays ₹216 of surcharge against ₹63 in a 70-unit month. This page takes a separate surcharge rate for each month so a mid-cycle revision shows up on its own line instead of looking like extra consumption.",
    ],
  ],
};

export default seo;
