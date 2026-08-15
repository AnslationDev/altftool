const seo = {
  title: "PNG vs LPG Cost Calculator: Compare on Equal Heat",
  metaDescription:
    "Convert LPG kg and PNG SCM to the same usable kWh, compare monthly bills with the fixed charge included, and see when the connection fee pays back.",
  steps: [
    "Choose 'LPG kilograms a month' or 'PNG cubic metres (SCM) a month' under 'I know my usage in', then enter the amount, LPG cylinder price and cylinder net weight (default 14.2 kg).",
    "Fill in the PNG rate per SCM, the monthly fixed charge and the one-time connection cost or deposit; 'Show calorific values and burner efficiency' opens the GCV and efficiency fields.",
    "Read the monthly saving, cost per usable kWh for each fuel and the months for the PNG connection cost to pay back; 'Copy result' copies the comparison.",
  ],
  intro:
    "Piped natural gas is billed by the standard cubic metre and LPG by the kilogram, so the two prices cannot be compared until both are converted to the heat they actually deliver. This comparison uses gross calorific values of about 49.6 MJ per kg for LPG and 39.75 MJ per SCM for domestic PNG, applies burner efficiency to both, and reports the monthly bill, the cost per usable kilowatt-hour and how long a PNG connection charge takes to repay itself.",
  useCases: [
    "Deciding whether to take a piped gas connection when the network reaches your building",
    "Checking whether a piped gas bill is reasonable against what cylinders used to cost you",
    "Working out how many months of savings it takes to recover the PNG security deposit",
  ],
  benefits: [
    ["Compares energy, not units", "Converts kilograms and cubic metres to the same kWh of heat in the pan."],
    ["Counts the fixed charge", "PNG meter rent is added before the comparison, so the monthly figure is the real one."],
    ["Editable calorific values", "Your PNG bill states the GCV billed — put that number in for an exact answer."],
  ],
  faqs: [
    [
      "How many SCM of PNG equal one LPG cylinder?",
      "Roughly 1.25 SCM of piped gas replaces 1 kg of LPG on gross calorific value, so a 14.2 kg domestic cylinder is about 17.7 SCM. The exact ratio depends on the calorific value your distributor bills, which is printed on the piped gas bill and varies with gas composition.",
    ],
    [
      "Is PNG cheaper than LPG?",
      "Usually yes on a per-unit-of-heat basis in cities where piped gas is available, but the margin narrows once the monthly fixed charge is included and it can reverse for very light users. Compare on cost per usable kilowatt-hour rather than on the headline rate, since a low PNG rate spread across a small volume still carries the full meter charge.",
    ],
    [
      "How much energy is in one SCM of piped natural gas?",
      "About 39.75 MJ, or roughly 9,500 kcal, on a gross calorific value basis — near 11 kWh of heat input per cubic metre. LPG carries about 49.6 MJ per kilogram, which is why a kilogram of LPG replaces more than one cubic metre of PNG.",
    ],
    [
      "Do I need a new stove to switch from LPG to PNG?",
      "Not usually a whole stove, but the burner jets must be changed. Natural gas is supplied at lower pressure and lower calorific value per cubic metre, so LPG jets starve the flame. Most manufacturers sell a conversion kit and the work should be done by an authorised technician.",
    ],
  ],
};

export default seo;
