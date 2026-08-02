// Altf Calculators — per-calculator SEO title and meta description.
//
// Plain data module (no JSX) so the route's generateMetadata, JSON-LD and any
// audit script can all read the same strings.
//
// WHY THIS FILE EXISTS
// --------------------
// The route used to derive its metadata from `toolsData.js`:
//   title       = `${name} — Free Online Calculator`
//   description = the catalogue `desc`
// Both were wrong at the rendered budget.
//
// TITLE. `src/app/altfcalculators/layout.jsx` sets
// `title.template = "%s | AltF Calculators"`, so 19 characters are appended to
// every authored title (this section does NOT get the root layout's
// " | AltFTool"). With a 60-character mobile SERP budget that leaves 41
// characters to author in. `${name} — Free Online Calculator` spent 25 of them
// on the suffix alone, so 103 of 103 titles rendered over 60.
//
// A previous attempt at this appended the word "Calculator" to every catalogue
// name when it was missing. That is factually wrong for the 20-odd entries that
// are not calculators — JSON Formatter, JSON Validator, Password Generator,
// UUID Generator, JWT Decoder, Regex Tester, the eight converters, Dice Roller.
// The rule below therefore never appends a noun: it only appends qualifiers
// ("— Free Online", "— Free") that are true of every entry in the catalogue,
// and falls back to the bare catalogue name. No entry can be mislabelled.
//
// DESCRIPTION. `trimMetaDescription` in src/platform/seo/generateMetadata.js
// passes any string under 160 characters through verbatim when it ends in
// . ! or ? — so these are authored at 150-158 characters and end in a period.
// The catalogue `desc` values are 24-49 character sentence fragments; every one
// of them rendered below the ~70-character floor where a snippet stops being
// worth a click. Each description below was written from that calculator's own
// TOOL_INFO entry (src/app/altfcalculators/info/*.js) and its implementation in
// src/app/altfcalculators/tools/ — no capability is claimed that the tool does
// not have.

// Explicit extension so plain `node` can load this module for an audit without
// the webpack resolver.
import { CALCULATORS } from "./toolsData.js";

/** Appended by altfcalculators/layout.jsx `title.template`. */
export const CALCULATOR_TITLE_SUFFIX = " | AltF Calculators";

/** Mobile SERPs truncate hardest; 60 is the rendered budget. */
export const CALCULATOR_TITLE_MAX = 60;

/** What is left for the route to author once the suffix is appended. */
export const CALCULATOR_AUTHORED_TITLE_MAX =
  CALCULATOR_TITLE_MAX - CALCULATOR_TITLE_SUFFIX.length;

/** Snippet floor / hard cap enforced by trimMetaDescription. */
export const CALCULATOR_DESCRIPTION_BOUNDS = { min: 150, max: 158 };

// Ordered longest-first. Nothing here names a tool type, so it is safe to apply
// to a formatter, a validator or a converter as well as a calculator.
const TITLE_QUALIFIERS = [" — Free Online", " — Free", ""];

/**
 * Authored title for a calculator, sized so `name + qualifier + suffix` stays
 * within CALCULATOR_TITLE_MAX. Returns the bare name when even the shortest
 * qualifier would overflow.
 */
export function buildCalculatorTitle(name) {
  const base = String(name || "").trim();
  if (!base) return "Free Online Calculators";

  for (const qualifier of TITLE_QUALIFIERS) {
    const candidate = `${base}${qualifier}`;
    if (candidate.length <= CALCULATOR_AUTHORED_TITLE_MAX) return candidate;
  }

  return base.slice(0, CALCULATOR_AUTHORED_TITLE_MAX).trim();
}

const DESCRIPTIONS = {
  // ============================ FINANCE ============================
  "loan-emi-calculator":
    "Work out the fixed monthly EMI on any loan from the amount, annual interest rate and tenure, and see the total interest and total payable before you borrow.",
  "home-loan-calculator":
    "Estimate the monthly EMI on a housing loan from the amount, annual rate and tenure in years or months, with the total interest and total cost over the term.",
  "personal-loan-calculator":
    "Estimate the EMI on an unsecured personal loan from the amount, annual interest rate and tenure, then check the total interest and the full repayment cost.",
  "car-loan-calculator":
    "Work out the EMI on a car loan after your down payment: enter the on-road price, rate and tenure to see the amount borrowed, interest and total payable.",
  "mortgage-calculator":
    "Estimate the full monthly cost of a home — principal and interest plus property tax and insurance — so you see the real sum leaving your account every month.",
  "mortgage-payoff-calculator":
    "See how paying a little extra each month shortens your mortgage. Enter the balance, rate and payment to compare payoff time and interest with and without it.",
  "loan-calculator":
    "Calculate the fixed monthly payment on any amortising loan from the amount, annual rate and term, with totals and the first year of the amortization schedule.",
  "sip-calculator":
    "Estimate the future value of a monthly SIP from your instalment, an expected annual return and the years invested, split into amount invested and returns.",
  "lumpsum-calculator":
    "Project how a one-time investment grows from the amount, an expected annual rate of return and the number of years, split into capital and estimated returns.",
  "fd-calculator":
    "Estimate the maturity amount of a fixed deposit from the principal, annual interest rate, tenure in years and compounding frequency, with the interest earned.",
  "rd-calculator":
    "Estimate the maturity value of a recurring deposit from your monthly instalment, annual rate and tenure in months, with total deposited and interest earned.",
  "compound-interest-calculator":
    "See how a principal grows when interest compounds. Enter the amount, annual rate, years and compounding frequency for the final balance and interest earned.",
  "simple-interest-calculator":
    "Work out simple interest charged on the original principal alone, with no compounding. Enter the amount, annual rate and years for the interest and total.",
  "savings-calculator":
    "Project a savings plan of monthly deposits plus an optional starting balance, and see the final balance split into your own contributions and interest earned.",
  "investment-calculator":
    "Project a portfolio that starts with a lump sum and adds a fixed monthly contribution, with the future value split into total invested and estimated returns.",
  "roi-calculator":
    "Measure return on investment from the amount invested and the value returned, with the net profit, total ROI percentage and the annualized return over years.",
  "cagr-calculator":
    "Find the compound annual growth rate between an investment's start and end value over a number of years, with the total growth percentage and absolute gain.",
  "gst-calculator":
    "Add GST to a tax-exclusive price or extract the GST already inside a tax-inclusive one, at any rate, showing the net value, the tax and the gross total.",
  "vat-calculator":
    "Add VAT to a net price or remove the VAT already included in a gross price, at any rate you set, showing the tax amount alongside the net and gross figures.",
  "tax-calculator":
    "Estimate income tax under India's New Tax Regime for FY 2024-25 from your gross income and taxpayer type, with slab tax, the 4% cess and your effective rate.",
  "salary-calculator":
    "Convert pay between hourly, daily, weekly, monthly and yearly figures using your own hours and days per week, so you can compare offers on the same basis.",
  "take-home-salary-calculator":
    "Estimate monthly in-hand pay from your annual CTC after employee PF, professional tax and income tax, with the full deduction breakdown behind the figure.",
  "discount-calculator":
    "Enter an original price and a discount percentage to see the final sale price and exactly how much you save, so you can compare offers during a sale quickly.",
  "currency-converter":
    "Convert an amount between currencies with a bundled offline rate table, a swap button and the rate used — approximate figures for travel and budgeting.",
  "budget-calculator":
    "Split your monthly after-tax income into needs, wants and savings with the 50/30/20 rule, and edit the three percentages to match your own money goals.",
  "tip-calculator":
    "Work out the tip on a bill at a preset or custom percentage, then split the total across a group to see the grand total and exactly what each person owes.",
  "unit-price-calculator":
    "Compare two products by their price per unit to see which is genuinely cheaper whatever the pack sizes, with the better value and the difference highlighted.",

  // ============================ HEALTH ============================
  "bmi-calculator":
    "Calculate Body Mass Index from your height and weight in metric or imperial units, see which category it falls in and the healthy weight range for a height.",
  "calorie-calculator":
    "Estimate your daily calorie needs from the Mifflin-St Jeor BMR equation and an activity factor, with targets for maintaining, losing or gaining weight.",
  "bmr-calculator":
    "Find your Basal Metabolic Rate — the calories you burn at rest — with the Mifflin-St Jeor equation, then apply an activity level for your full daily needs.",
  "tdee-calculator":
    "Find your Total Daily Energy Expenditure from your BMR and activity level: the maintenance calorie figure that any fat-loss or weight-gain plan starts from.",
  "body-fat-calculator":
    "Estimate body-fat percentage with the U.S. Navy tape method from your height, neck and waist measurements (plus hip for women), and the category it falls in.",
  "ideal-weight-calculator":
    "Compare healthy target weights for your height from the Devine, Robinson and Miller formulas, alongside the weight range that matches a healthy BMI band.",
  "protein-calculator":
    "Estimate your daily protein target in grams from your body weight and training goal, with a sensible range around it to spread across three or four meals.",
  "macro-calculator":
    "Split a daily calorie target into grams of carbohydrate, protein and fat using a balanced, low-carb or high-protein split you can track in a food app.",
  "calories-burned-calculator":
    "Estimate the calories an activity burns from its MET value, your body weight and the minutes you exercised, with the per-minute burn rate alongside it.",
  "target-heart-rate-calculator":
    "See your warm-up, fat-burn, cardio and peak heart-rate zones in bpm from your age, or add a resting pulse for the more personal Karvonen training zones.",

  // ============================ MATH ============================
  "scientific-calculator":
    "Type a whole expression with trigonometry, logarithms, exponents, roots, factorials, pi and e, evaluated in the correct order in degrees or radians mode.",
  "basic-calculator":
    "Do everyday addition, subtraction, multiplication, division and percentages, with a live preview of the answer and standard operator precedence applied.",
  "percentage-calculator":
    "Find a percentage of a number, work out what X is as a percent of Y, or measure the percentage increase or decrease between an old value and a new one.",
  "fraction-calculator":
    "Add, subtract, multiply or divide two fractions and get the answer reduced to lowest terms, with its decimal value and mixed-number form where relevant.",
  "average-calculator":
    "Paste numbers separated by commas, spaces or new lines to get the mean, median, mode and range of the set, plus the count and sum they were derived from.",
  "ratio-calculator":
    "Simplify a ratio to its lowest terms, read its decimal and percentage equivalents, and solve for the missing value in an equivalent ratio or proportion.",
  "area-calculator":
    "Find the area of a rectangle, square, triangle, circle, trapezoid, parallelogram or ellipse from its dimensions, with the substituted working shown below.",
  "volume-calculator":
    "Find the volume of a cube, box, sphere, cylinder, cone or pyramid from its dimensions, with the substituted formula shown alongside the result in cubic units.",
  "circle-calculator":
    "Enter any one of a circle's radius, diameter, circumference or area and the other three are derived for you instantly, using the standard circle formulas.",
  "triangle-calculator":
    "Find a triangle's area from a base and height, or from all three sides with Heron's formula, which also returns the perimeter and checks the sides can exist.",
  "distance-calculator":
    "Measure the straight-line distance between two points on a plane from their x and y coordinates, with the horizontal and vertical change shown alongside.",
  "surface-area-calculator":
    "Find the total outer surface area of a cube, box, sphere, cylinder or cone from its dimensions — the material needed to paint, wrap or coat the whole solid.",
  "exponent-calculator":
    "Raise any base to a power, including negative and fractional exponents, and read the result with the expression written out beside it for a quick check.",
  "root-calculator":
    "Find the square root, cube root or any n-th root of a number, with a built-in verification step that raises the result back to the power you asked it to undo.",
  "lcm-calculator":
    "Find the least common multiple of two or more whole numbers, with their greatest common factor shown alongside it, useful for adding or comparing fractions.",
  "gcf-calculator":
    "Find the greatest common factor (HCF) of two or more whole numbers with the Euclidean algorithm, and read their least common multiple right alongside it.",
  "factor-calculator":
    "List every factor of a whole number up to 10,000,000, along with the total count and the prime factorization whose primes multiply back to give that number.",
  "rounding-calculator":
    "Round a number to a chosen number of decimal places or to the nearest 10, 100 or 1000, with the rounded-down and rounded-up values shown alongside it.",
  "pythagorean-theorem-calculator":
    "Solve a right triangle with a² + b² = c²: find the hypotenuse from the two legs, or find a missing leg from the hypotenuse and the leg you already know.",
  "right-triangle-calculator":
    "Enter the two legs of a right triangle to get the hypotenuse, area, perimeter and both acute angles, from the Pythagorean theorem and basic trigonometry.",
  "quadratic-equation-calculator":
    "Solve ax² + bx + c = 0 with the quadratic formula, and read the discriminant, the real roots and the parabola's vertex and axis of symmetry alongside them.",
  "standard-deviation-calculator":
    "Measure how far a set of numbers spreads around its mean, as either a population or a sample standard deviation, with the variance, mean and count shown.",

  // ============================ DATE & TIME ============================
  "age-calculator":
    "Find an exact age in complete years, months and days as of today or any date you choose, with the same span totalled in months, weeks, days and hours.",
  "date-calculator":
    "Count the days between two dates with a years, months and days breakdown, or add and subtract days, weeks, months or years to find the resulting date.",
  "time-calculator":
    "Add or subtract two durations given in hours, minutes and seconds, and read the answer in H:MM:SS plus the totals in hours, in minutes and in seconds.",
  "time-duration-calculator":
    "Measure the elapsed time between a start and an end clock time, including shifts past midnight, as hours and minutes, total minutes and decimal hours.",
  "countdown-calculator":
    "Count the days remaining until a target date, or the days since one that has already passed, with the same span also shown in weeks and approximate months.",

  // ============================ EDUCATION ============================
  "gpa-calculator":
    "Turn your course letter grades and credit hours into a GPA on the 4.0 scale, with the total credit hours and quality points the average was built from.",
  "grade-calculator":
    "Work out your current weighted course grade from each assessment's score and weight, then find the score you need on the final exam to hit a target grade.",
  "cgpa-calculator":
    "Combine each semester's SGPA and credit load into a cumulative CGPA on the 10-point scale, with the approximate percentage from the CGPA × 9.5 conversion.",
  "marks-percentage-calculator":
    "Convert marks into a percentage from a single score, or add a row per subject to get the overall percentage across all of them, with its grade band shown.",

  // ============================ CONVERSION ============================
  "unit-converter":
    "Convert length, weight, area, volume, temperature, speed, data and time units in one place, with a grid showing every unit in the category you have picked.",
  "length-converter":
    "Convert a length between mm, cm, m, km, inch, foot, yard and mile as you type, with a grid of every other unit and a swap button to reverse the direction.",
  "weight-converter":
    "Convert a mass between mg, g, kg, tonne, ounce, pound and stone live as you type, with the result plus a grid showing the same value in every other unit.",
  "area-converter":
    "Convert an area between mm², cm², m², hectare, km², in², ft², yd², acre and mi² as you type, with a grid showing the value in every one of those units.",
  "volume-converter":
    "Convert a volume between millilitres, litres, cm³ and m³ and the US gallon, quart, pint, cup, fluid ounce, tablespoon and teaspoon, updated live as you type.",
  "temperature-converter":
    "Convert a temperature between Celsius, Fahrenheit and Kelvin, negative values included, and read the equivalent figure on all three scales at the same time.",
  "speed-converter":
    "Convert a speed between metres per second, kilometres per hour, miles per hour, knots and feet per second, with a grid showing the value in every unit.",
  "data-storage-converter":
    "Convert data between bits, bytes and decimal KB, MB, GB, TB and PB as well as binary KiB, MiB, GiB and TiB — the 1000 against 1024 difference, explained.",
  "time-converter":
    "Convert a duration between milliseconds, seconds, minutes, hours, days, weeks, months and years, using average month and year lengths for calendar units.",

  // ============================ DEVELOPER ============================
  "json-formatter":
    "Beautify JSON with two-space, four-space or tab indentation, or minify it onto a single line. The text is parsed first, so the output is always valid JSON.",
  "json-validator":
    "Check whether text is valid JSON as you type: a summary of the top-level type and keys when it parses, or the exact error and position when it does not.",
  "password-generator":
    "Generate strong random passwords from 4 to 64 characters using the browser's crypto API, with selectable character sets and an entropy estimate in bits.",
  "base64-encoder-decoder":
    "Encode text to Base64 or decode Base64 back to text, with full Unicode handled correctly through UTF-8 and the result updating live as you type it in.",
  "url-encoder-decoder":
    "Percent-encode or decode text for a web address, choosing component scope for a single query value or full URI scope to leave a whole URL's structure intact.",
  "uuid-generator":
    "Generate up to 50 random version 4 UUIDs at once, copy any single value or copy the whole list, and refresh the batch whenever you need new identifiers.",
  "jwt-decoder":
    "Paste a JSON Web Token to decode its header and payload into readable JSON, with the issued, expires and not-before claims shown as human-readable dates.",
  "qr-code-generator":
    "Turn any text or URL into a scannable QR code drawn in your browser, with a choice of pixel size and foreground colour. Nothing you type is ever uploaded.",
  "timestamp-converter":
    "Convert a Unix timestamp in seconds or milliseconds into local, UTC and ISO 8601 dates, or turn a date back into a timestamp, with the current time shown.",
  "regex-tester":
    "Test a JavaScript regular expression against sample text and see every match with its position and captured groups, using the g, i, m and s flags you need.",

  // ============================ CONSTRUCTION ============================
  "concrete-calculator":
    "Estimate the concrete a slab, footing or column needs from its length, width and thickness, in cubic metres, feet and yards, plus an approximate bag count.",
  "tile-calculator":
    "Work out how many tiles and boxes a floor or wall needs from the room area, the tile size, a wastage allowance for cuts and the number of tiles per box.",
  "roofing-calculator":
    "Turn a roof footprint and its pitch into the real sloped surface area, then into the roofing squares and shingle bundles you need to price and order it.",
  "square-footage-calculator":
    "Find the area of a space in square feet and square metres from a length and width in feet, metres, yards or inches, with an optional price per square foot.",

  // ============================ ENGINEERING ============================
  "ohms-law-calculator":
    "Enter any two of voltage, current and resistance to solve for the third with Ohm's law, and see the power the circuit dissipates alongside the answer.",
  "electricity-cost-calculator":
    "Estimate what an appliance costs to run from its wattage, hours per day and number of days, plus your tariff per kWh, with the energy used and daily cost.",
  "resistor-color-code-calculator":
    "Decode a 4-band or 5-band resistor by picking each band colour, and read the resistance with k and M scaling plus its tolerance minimum and maximum values.",
  "speed-calculator":
    "Enter any two of speed, distance and time to solve for the third, using average speed over the whole trip — kilometres and hours give a result in km/h.",
  "power-calculator":
    "Find electrical power in watts and kilowatts from voltage and current, from current and resistance, or from voltage and resistance — whichever pair you know.",

  // ============================ AUTOMOBILE ============================
  "mileage-calculator":
    "Work out your vehicle's fuel economy from the distance covered and the fuel it used, shown as km/L, miles per gallon and litres per 100 km side by side.",
  "fuel-cost-calculator":
    "Estimate a journey's fuel bill from the trip distance, your vehicle's mileage in km per litre and the price per litre, with the litres needed and cost per km.",
  "gas-mileage-calculator":
    "Work out miles per gallon from a trip's distance and the gallons it used, with the metric equivalents and, if you add a fuel price, the cost per mile.",

  // ============================ WEATHER ============================
  "heat-index-calculator":
    "Turn an air temperature and relative humidity into a feels-like heat index using the U.S. National Weather Service formula, with a heat-stress risk category.",
  "wind-chill-calculator":
    "Turn an air temperature and wind speed into a feels-like wind chill using the 2001 North American formula, with an approximate frostbite-risk warning.",

  // ============================ FUN ============================
  "love-calculator":
    "A light-hearted game that turns two names into a compatibility percentage with a playful verdict. Purely for fun — the same names always give the same score.",
  "dice-roller":
    "Roll up to ten virtual dice with 4, 6, 8, 10, 12 or 20 sides and read every face plus the combined total, for board games, tabletop RPGs and classrooms.",
};

/**
 * Title + description for a calculator slug, or null when the slug is unknown.
 * An unknown slug must not mint a page, so callers 404 rather than inventing
 * copy from the URL.
 */
export function getCalculatorSeo(slug) {
  const tool = CALCULATORS.find((item) => item.slug === slug);
  if (!tool) return null;

  return {
    tool,
    title: buildCalculatorTitle(tool.name),
    // A slug with no authored description falls back to the catalogue copy
    // rather than to invented capabilities.
    description: DESCRIPTIONS[slug] || tool.desc,
  };
}

export { DESCRIPTIONS as CALCULATOR_DESCRIPTIONS };
