// Altf Calculators — master data model (Phase 1 launch set).
// Plain data module (no JSX) so it can be imported by both server (metadata,
// sitemap) and client. `icon` is a lucide-react icon name, resolved by
// <CalcIcon />. `category` drives colour, grouping and navigation.
//
// Two descriptions, deliberately:
//   desc    — short label for grid tiles and the sidebar (kept under ~60 chars
//             so cards stay one or two lines).
//   summary — 120-158 chars, a single self-contained sentence stating what the
//             calculator computes. It is the <meta name="description">, and it
//             is the answer-first paragraph rendered directly under the <h1> on
//             /altfcalculators/[toolSlug]. Every summary is written from that
//             calculator's own info entry in ./info/*.js — never claim an input
//             or output the tool does not actually produce.

export const CALCULATORS = [
  // ============================ FINANCE ============================
  { name: "EMI Calculator", slug: "loan-emi-calculator", desc: "Monthly EMI, total interest and total payable on any loan.", summary: "The EMI Calculator works out the fixed monthly instalment on a loan from the amount, annual interest rate and tenure, plus total interest and total payable.", icon: "Landmark", category: "Finance", sidebarCategory: "Finance" },
  { name: "Home Loan Calculator", slug: "home-loan-calculator", desc: "EMI, interest and total cost for a home loan.", summary: "The Home Loan Calculator estimates the monthly EMI on a housing loan and shows the total interest and total cost over the full tenure, before taxes and fees.", icon: "Home", category: "Finance", sidebarCategory: "Finance" },
  { name: "Personal Loan Calculator", slug: "personal-loan-calculator", desc: "EMI and total cost of a personal loan.", summary: "The Personal Loan Calculator estimates the EMI on an unsecured loan from the amount, rate and tenure, showing the total interest and total repayment.", icon: "Wallet", category: "Finance", sidebarCategory: "Finance" },
  { name: "Car Loan Calculator", slug: "car-loan-calculator", desc: "EMI and interest for a car / auto loan.", summary: "The Car Loan Calculator works out the monthly EMI on a vehicle loan after your down payment, along with the total interest and the total amount repaid.", icon: "Car", category: "Finance", sidebarCategory: "Finance" },
  { name: "Mortgage Calculator", slug: "mortgage-calculator", desc: "Monthly mortgage payment with tax and insurance.", summary: "The Mortgage Calculator estimates the full monthly cost of a home by adding property tax and home insurance to the principal-and-interest payment.", icon: "Building2", category: "Finance", sidebarCategory: "Finance" },
  { name: "Mortgage Payoff Calculator", slug: "mortgage-payoff-calculator", desc: "See how extra payments shorten your mortgage.", summary: "The Mortgage Payoff Calculator simulates a loan month by month to show how much sooner it clears, and how much interest you save, with extra payments.", icon: "CalendarCheck", category: "Finance", sidebarCategory: "Finance" },
  { name: "Loan Calculator", slug: "loan-calculator", desc: "Flexible loan EMI, interest and total repayment.", summary: "The Loan Calculator computes the fixed monthly payment on any amortising loan and breaks each instalment down into its interest and principal parts.", icon: "Banknote", category: "Finance", sidebarCategory: "Finance" },
  { name: "SIP Calculator", slug: "sip-calculator", desc: "Future value of a monthly SIP investment.", summary: "The SIP Calculator estimates the future value of a fixed monthly mutual-fund investment, compounding each instalment at an assumed annual rate of return.", icon: "TrendingUp", category: "Finance", sidebarCategory: "Finance" },
  { name: "Lumpsum Calculator", slug: "lumpsum-calculator", desc: "Growth of a one-time lumpsum investment.", summary: "The Lumpsum Calculator projects how much a single one-time investment grows to over a chosen period at an assumed annual rate of compound return.", icon: "Coins", category: "Finance", sidebarCategory: "Finance" },
  { name: "FD Calculator", slug: "fd-calculator", desc: "Maturity amount and interest on a fixed deposit.", summary: "The FD Calculator estimates the maturity amount and interest earned on a fixed deposit from the deposit, rate, tenure and compounding frequency.", icon: "PiggyBank", category: "Finance", sidebarCategory: "Finance" },
  { name: "RD Calculator", slug: "rd-calculator", desc: "Maturity value of a recurring deposit.", summary: "The RD Calculator estimates the maturity value of a recurring deposit, where each monthly instalment earns interest for the time left until maturity.", icon: "CalendarPlus", category: "Finance", sidebarCategory: "Finance" },
  { name: "Compound Interest", slug: "compound-interest-calculator", desc: "See how your savings grow with compounding.", summary: "The Compound Interest Calculator shows how a principal grows when interest is added to the balance at a chosen frequency, so you earn interest on interest.", icon: "LineChart", category: "Finance", sidebarCategory: "Finance" },
  { name: "Simple Interest", slug: "simple-interest-calculator", desc: "Simple interest and the final amount.", summary: "The Simple Interest Calculator computes interest charged on the original principal only, with no compounding, and the final amount at the end of the term.", icon: "Percent", category: "Finance", sidebarCategory: "Finance" },
  { name: "Savings Goal Calculator", slug: "savings-calculator", desc: "Reach a savings goal with monthly deposits.", summary: "The Savings Goal Calculator projects the future balance of a plan with a fixed monthly deposit, an optional starting balance and an annual interest rate.", icon: "PiggyBank", category: "Finance", sidebarCategory: "Finance" },
  { name: "Investment Calculator", slug: "investment-calculator", desc: "Future value with regular contributions.", summary: "The Investment Calculator projects the future value of an initial lump sum plus ongoing monthly contributions at an assumed annual rate of return.", icon: "TrendingUp", category: "Finance", sidebarCategory: "Finance" },
  { name: "ROI Calculator", slug: "roi-calculator", desc: "Return on investment and net gain.", summary: "The ROI Calculator measures how profitable an investment was by comparing net profit to the amount originally invested, as a percentage and a net gain.", icon: "Target", category: "Finance", sidebarCategory: "Finance" },
  { name: "CAGR Calculator", slug: "cagr-calculator", desc: "Compound annual growth rate of an investment.", summary: "The CAGR Calculator finds the constant yearly rate at which an investment grew from its starting value to its ending value over a number of years.", icon: "TrendingUp", category: "Finance", sidebarCategory: "Finance" },
  { name: "GST Calculator", slug: "gst-calculator", desc: "Add or remove GST and see net / gross.", summary: "The GST Calculator adds GST to a tax-exclusive price or extracts the GST inside a tax-inclusive price, showing the net value, GST amount and gross total.", icon: "ReceiptText", category: "Finance", sidebarCategory: "Finance" },
  { name: "VAT Calculator", slug: "vat-calculator", desc: "Add or remove VAT at any rate.", summary: "The VAT Calculator separates the net, tax and gross parts of a price at any rate, adding VAT to an exclusive amount or extracting it from an inclusive one.", icon: "Receipt", category: "Finance", sidebarCategory: "Finance" },
  { name: "Income Tax Calculator", slug: "tax-calculator", desc: "Estimate income tax (India, new regime).", summary: "The Income Tax Calculator gives an indicative estimate under India's New Tax Regime for FY 2024-25, applying slab rates, the Section 87A rebate and 4% cess.", icon: "Landmark", category: "Finance", sidebarCategory: "Finance" },
  { name: "Salary Calculator", slug: "salary-calculator", desc: "Convert between hourly, monthly and annual pay.", summary: "The Salary Calculator converts pay between hourly, daily, weekly, monthly and yearly periods. Figures are gross, before tax and other deductions.", icon: "Wallet", category: "Finance", sidebarCategory: "Finance" },
  { name: "Take-Home Salary Calculator", slug: "take-home-salary-calculator", desc: "Net in-hand salary after deductions.", summary: "The Take-Home Salary Calculator estimates in-hand pay from an annual CTC by subtracting employee Provident Fund, professional tax and income tax.", icon: "HandCoins", category: "Finance", sidebarCategory: "Finance" },
  { name: "Discount Calculator", slug: "discount-calculator", desc: "Sale price and how much you save.", summary: "The Discount Calculator works out the sale price and the amount saved when a percentage discount is applied to an original price, in any currency.", icon: "BadgePercent", category: "Finance", sidebarCategory: "Finance" },
  { name: "Currency Converter", slug: "currency-converter", desc: "Convert currencies with editable rates.", summary: "The Currency Converter converts an amount between currencies using a bundled offline rate table based on the US Dollar, so the rates are approximate.", icon: "ArrowLeftRight", category: "Finance", sidebarCategory: "Finance" },
  { name: "Budget Calculator", slug: "budget-calculator", desc: "Split income with the 50/30/20 rule.", summary: "The Budget Calculator splits monthly after-tax income by the 50/30/20 rule: 50% for needs, 30% for wants and 20% for savings and debt repayment.", icon: "PieChart", category: "Finance", sidebarCategory: "Finance" },
  { name: "Tip Calculator", slug: "tip-calculator", desc: "Split the bill and tip across people.", summary: "The Tip Calculator computes the gratuity on a bill at any percentage and splits the tip, the grand total and the per-person share across a group.", icon: "Coins", category: "Finance", sidebarCategory: "Finance" },
  { name: "Unit Price Calculator", slug: "unit-price-calculator", desc: "Compare products by price per unit.", summary: "The Unit Price Calculator compares two products by price per unit so you can see which is better value when pack sizes and prices differ.", icon: "ShoppingCart", category: "Finance", sidebarCategory: "Finance" },

  // ============================ HEALTH ============================
  { name: "BMI Calculator", slug: "bmi-calculator", desc: "Body Mass Index and healthy weight range.", summary: "The BMI Calculator relates weight to height to give a Body Mass Index, its underweight, normal, overweight or obese category, and a healthy weight range.", icon: "Scale", category: "Health", sidebarCategory: "Health" },
  { name: "Calorie Calculator", slug: "calorie-calculator", desc: "Daily calories to maintain, lose or gain weight.", summary: "The Calorie Calculator estimates BMR with the Mifflin-St Jeor equation, scales it by activity into a TDEE, and gives daily targets to maintain, lose or gain.", icon: "Utensils", category: "Health", sidebarCategory: "Health" },
  { name: "BMR Calculator", slug: "bmr-calculator", desc: "Resting calories your body burns (BMR).", summary: "The BMR Calculator estimates the calories your body burns at complete rest for breathing, circulation and cell repair, using the Mifflin-St Jeor equation.", icon: "Activity", category: "Health", sidebarCategory: "Health" },
  { name: "TDEE Calculator", slug: "tdee-calculator", desc: "Total daily energy expenditure.", summary: "The TDEE Calculator multiplies your Mifflin-St Jeor BMR by an activity factor to estimate the total calories you burn in 24 hours, your maintenance level.", icon: "Gauge", category: "Health", sidebarCategory: "Health" },
  { name: "Body Fat Calculator", slug: "body-fat-calculator", desc: "Body fat % via the U.S. Navy method.", summary: "The Body Fat Calculator estimates body-fat percentage from height, neck, waist and hip tape measurements using the U.S. Navy circumference method.", icon: "Percent", category: "Health", sidebarCategory: "Health" },
  { name: "Ideal Weight Calculator", slug: "ideal-weight-calculator", desc: "Ideal body weight for your height.", summary: "The Ideal Weight Calculator estimates a healthy target weight for your height using the Devine, Robinson and Miller formulas plus the healthy BMI range.", icon: "Ruler", category: "Health", sidebarCategory: "Health" },
  { name: "Protein Calculator", slug: "protein-calculator", desc: "Daily protein target for your goals.", summary: "The Protein Calculator estimates a daily protein target in grams from your body weight and goal, as needs rise with activity and muscle-building intent.", icon: "Egg", category: "Health", sidebarCategory: "Health" },
  { name: "Macro Calculator", slug: "macro-calculator", desc: "Daily protein, carb and fat split.", summary: "The Macro Calculator splits a daily calorie target into grams of carbohydrate, protein and fat from the percentage split you choose for each macronutrient.", icon: "PieChart", category: "Health", sidebarCategory: "Health" },
  { name: "Calories Burned Calculator", slug: "calories-burned-calculator", desc: "Calories burned by activity and time.", summary: "The Calories Burned Calculator estimates the calories an activity uses from its MET value, your body weight and how long the activity lasted.", icon: "Flame", category: "Health", sidebarCategory: "Health" },
  { name: "Target Heart Rate Calculator", slug: "target-heart-rate-calculator", desc: "Your training heart-rate zones.", summary: "The Target Heart Rate Calculator estimates your maximum heart rate from your age and maps the warm-up, fat-burn, cardio and peak training zones in bpm.", icon: "HeartPulse", category: "Health", sidebarCategory: "Health" },

  // ============================ MATH ============================
  { name: "Scientific Calculator", slug: "scientific-calculator", desc: "Full scientific calculator with functions.", summary: "The Scientific Calculator evaluates whole expressions with trigonometry, logarithms, exponents, roots, factorials and the constants pi and e, in order.", icon: "FunctionSquare", category: "Math", sidebarCategory: "Math" },
  { name: "Basic Calculator", slug: "basic-calculator", desc: "Quick everyday arithmetic.", summary: "The Basic Calculator handles everyday addition, subtraction, multiplication, division and percentage, evaluating × and ÷ before + and − automatically.", icon: "Calculator", category: "Math", sidebarCategory: "Math" },
  { name: "Percentage Calculator", slug: "percentage-calculator", desc: "Percentages, change and ‘X of Y’.", summary: "The Percentage Calculator finds a percentage of a value, what one number is as a percentage of another, and the percentage change between two numbers.", icon: "Percent", category: "Math", sidebarCategory: "Math" },
  { name: "Fraction Calculator", slug: "fraction-calculator", desc: "Add, subtract, multiply and simplify fractions.", summary: "The Fraction Calculator adds, subtracts, multiplies or divides two fractions, reduces the answer to lowest terms and shows the decimal equivalent.", icon: "Divide", category: "Math", sidebarCategory: "Math" },
  { name: "Average Calculator", slug: "average-calculator", desc: "Mean, median, mode and range.", summary: "The Average Calculator finds the mean, median, mode and range of a set of numbers, describing both the centre and the spread of your data.", icon: "Sigma", category: "Math", sidebarCategory: "Math" },
  { name: "Ratio Calculator", slug: "ratio-calculator", desc: "Simplify and solve ratios.", summary: "The Ratio Calculator simplifies a ratio to its lowest terms, scales it up or down, and solves for a missing value in an equivalent ratio or proportion.", icon: "Scale", category: "Math", sidebarCategory: "Math" },
  { name: "Area Calculator", slug: "area-calculator", desc: "Area of common 2D shapes.", summary: "The Area Calculator finds the area of a rectangle, square, triangle, circle, trapezoid, parallelogram or ellipse from the dimensions you enter.", icon: "Square", category: "Math", sidebarCategory: "Math" },
  { name: "Volume Calculator", slug: "volume-calculator", desc: "Volume of common 3D shapes.", summary: "The Volume Calculator finds the space inside a cube, box, sphere, cylinder, cone or pyramid from the dimensions you enter, using each solid's formula.", icon: "Box", category: "Math", sidebarCategory: "Math" },
  { name: "Circle Calculator", slug: "circle-calculator", desc: "Radius, area and circumference.", summary: "The Circle Calculator derives every property of a circle from one measurement: enter the radius, diameter, circumference or area to get the other three.", icon: "Circle", category: "Math", sidebarCategory: "Math" },
  { name: "Triangle Calculator", slug: "triangle-calculator", desc: "Area, perimeter and sides of a triangle.", summary: "The Triangle Calculator finds a triangle's area from a base and its perpendicular height, or from all three side lengths using Heron's formula.", icon: "Triangle", category: "Math", sidebarCategory: "Math" },
  { name: "Distance Calculator", slug: "distance-calculator", desc: "Distance between two coordinates.", summary: "The Distance Calculator measures the straight-line distance between two points on a 2D plane and reports the horizontal and vertical change.", icon: "Ruler", category: "Math", sidebarCategory: "Math" },
  { name: "Surface Area Calculator", slug: "surface-area-calculator", desc: "Surface area of 3D shapes.", summary: "The Surface Area Calculator finds the total outer area of a cube, box, sphere, cylinder or cone in square units from the dimensions you enter.", icon: "Layers", category: "Math", sidebarCategory: "Math" },
  { name: "Exponent Calculator", slug: "exponent-calculator", desc: "Raise a number to any power.", summary: "The Exponent Calculator raises a base number to any power and handles positive, negative and fractional exponents, including roots written as fractions.", icon: "Superscript", category: "Math", sidebarCategory: "Math" },
  { name: "Root Calculator", slug: "root-calculator", desc: "Square, cube and nth roots.", summary: "The Root Calculator finds the square root, cube root or any n-th root of a number: the value that, multiplied by itself n times, gives that number.", icon: "Radical", category: "Math", sidebarCategory: "Math" },
  { name: "LCM Calculator", slug: "lcm-calculator", desc: "Least common multiple of numbers.", summary: "The LCM Calculator finds the least common multiple of two or more whole numbers, the smallest number they all divide into, and their greatest common factor.", icon: "Hash", category: "Math", sidebarCategory: "Math" },
  { name: "GCF / HCF Calculator", slug: "gcf-calculator", desc: "Greatest common factor of numbers.", summary: "The GCF Calculator finds the greatest common factor (HCF) of a list of whole numbers, the largest number that divides them all exactly, and their LCM.", icon: "Hash", category: "Math", sidebarCategory: "Math" },
  { name: "Factor Calculator", slug: "factor-calculator", desc: "List all factors of a number.", summary: "The Factor Calculator lists every factor of a whole number, including 1 and the number itself, and gives its prime factorization as a product of primes.", icon: "Grid2x2", category: "Math", sidebarCategory: "Math" },
  { name: "Rounding Calculator", slug: "rounding-calculator", desc: "Round to decimals or place values.", summary: "The Rounding Calculator rounds a number to a set number of decimal places or to the nearest 10, 100 or 1000, and shows the floor and ceiling values.", icon: "ArrowUpDown", category: "Math", sidebarCategory: "Math" },
  { name: "Pythagorean Theorem Calculator", slug: "pythagorean-theorem-calculator", desc: "Solve a² + b² = c².", summary: "The Pythagorean Theorem Calculator solves a right triangle's missing side: enter the two legs to find the hypotenuse, or the hypotenuse and one leg.", icon: "Triangle", category: "Math", sidebarCategory: "Math" },
  { name: "Right Triangle Calculator", slug: "right-triangle-calculator", desc: "Sides and angles of a right triangle.", summary: "The Right Triangle Calculator takes the two legs of a right-angled triangle and computes the hypotenuse, the area, the perimeter and both acute angles.", icon: "Triangle", category: "Math", sidebarCategory: "Math" },
  { name: "Quadratic Equation Solver", slug: "quadratic-equation-calculator", desc: "Solve ax² + bx + c = 0.", summary: "The Quadratic Equation Solver finds the roots of ax² + bx + c = 0 with the quadratic formula and reports the discriminant, which shows how many roots exist.", icon: "FunctionSquare", category: "Math", sidebarCategory: "Math" },
  { name: "Standard Deviation Calculator", slug: "standard-deviation-calculator", desc: "SD, variance and mean.", summary: "The Standard Deviation Calculator measures how spread out a set of numbers is around their mean, returning the standard deviation, variance and mean.", icon: "BarChart3", category: "Math", sidebarCategory: "Math" },

  // ============================ DATE & TIME ============================
  { name: "Age Calculator", slug: "age-calculator", desc: "Your exact age in years, months and days.", summary: "The Age Calculator gives an exact age in complete years, months and days between a birth date and today, or between a birth date and any date you choose.", icon: "Cake", category: "Date & Time", sidebarCategory: "Date & Time" },
  { name: "Date Calculator", slug: "date-calculator", desc: "Days between dates, or add / subtract days.", summary: "The Date Calculator finds the days between two calendar dates with a years, months and days breakdown, or adds and subtracts days from a starting date.", icon: "CalendarDays", category: "Date & Time", sidebarCategory: "Date & Time" },
  { name: "Time Calculator", slug: "time-calculator", desc: "Add or subtract times and durations.", summary: "The Time Calculator adds or subtracts two durations in hours, minutes and seconds, returning the answer in H:MM:SS and as a total in each unit.", icon: "Clock", category: "Date & Time", sidebarCategory: "Date & Time" },
  { name: "Time Duration Calculator", slug: "time-duration-calculator", desc: "Duration between two times.", summary: "The Time Duration Calculator measures the time between a start and end clock time as hours and minutes, total minutes and decimal hours, overnight included.", icon: "Hourglass", category: "Date & Time", sidebarCategory: "Date & Time" },
  { name: "Day Counter", slug: "countdown-calculator", desc: "Days until (or since) any date.", summary: "The Day Counter shows how many days remain until a target date, or have passed since one, and expresses that span in weeks and approximate months.", icon: "CalendarClock", category: "Date & Time", sidebarCategory: "Date & Time" },

  // ============================ EDUCATION ============================
  { name: "GPA Calculator", slug: "gpa-calculator", desc: "Grade point average from your courses.", summary: "The GPA Calculator turns course letter grades and credit hours into a grade point average on the 4.0 scale, weighting each course by its credit hours.", icon: "GraduationCap", category: "Education", sidebarCategory: "Education" },
  { name: "Grade Calculator", slug: "grade-calculator", desc: "Weighted grade and the score you need.", summary: "The Grade Calculator works out your current course grade from weighted assessments and the score you still need on the final to reach a target grade.", icon: "BookOpenCheck", category: "Education", sidebarCategory: "Education" },
  { name: "CGPA Calculator", slug: "cgpa-calculator", desc: "Cumulative GPA across semesters.", summary: "The CGPA Calculator combines each semester's SGPA into a single cumulative grade point average, weighting every semester by its credit load.", icon: "School", category: "Education", sidebarCategory: "Education" },
  { name: "Marks Percentage Calculator", slug: "marks-percentage-calculator", desc: "Percentage from marks obtained.", summary: "The Marks Percentage Calculator converts marks obtained and total marks into a percentage, for a single subject or across several subjects at once.", icon: "ClipboardList", category: "Education", sidebarCategory: "Education" },

  // ============================ CONVERSION ============================
  { name: "Unit Converter", slug: "unit-converter", desc: "All-in-one converter for many measurements.", summary: "The Unit Converter handles length, weight, area, volume, temperature, speed, data and time in one tool, converting through a base unit as you type.", icon: "Repeat", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Length Converter", slug: "length-converter", desc: "mm, cm, m, km, inch, foot, mile.", summary: "The Length Converter changes a distance between metric units (mm, cm, m, km) and imperial units (inch, foot, yard, mile), updating live as you type.", icon: "Ruler", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Weight Converter", slug: "weight-converter", desc: "mg, g, kg, ounce, pound, stone.", summary: "The Weight Converter switches a mass between metric units (mg, g, kg, tonne) and imperial units (ounce, pound, stone), updating live as you type.", icon: "Weight", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Area Converter", slug: "area-converter", desc: "m², ft², acre, hectare and more.", summary: "The Area Converter changes a surface measurement between metric units (mm², cm², m², hectare, km²) and imperial units (in², ft², yd², acre, mi²).", icon: "Square", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Volume Converter", slug: "volume-converter", desc: "litre, ml, gallon, cup and more.", summary: "The Volume Converter switches a capacity between metric units (mL, L, cm³, m³) and US customary units (gallon, quart, pint, cup, fluid ounce, tablespoon).", icon: "Box", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Temperature Converter", slug: "temperature-converter", desc: "Celsius, Fahrenheit and Kelvin.", summary: "The Temperature Converter translates a reading between Celsius, Fahrenheit and Kelvin, scales with different zero points, so it shifts as well as scales.", icon: "Thermometer", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Speed Converter", slug: "speed-converter", desc: "m/s, km/h, mph, knots.", summary: "The Speed Converter changes a rate of motion between metres per second, kilometres per hour, miles per hour, knots and feet per second as you type.", icon: "Gauge", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Data Storage Converter", slug: "data-storage-converter", desc: "bytes, KB, MB, GB, TB.", summary: "The Data Storage Converter changes a quantity of data between bits, bytes and both decimal (KB, MB, GB, TB, PB) and binary (KiB, MiB, GiB, TiB) multiples.", icon: "HardDrive", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Time Converter", slug: "time-converter", desc: "seconds, minutes, hours, days.", summary: "The Time Converter changes a duration between milliseconds, seconds, minutes, hours, days, weeks, months and years, updating live as you type.", icon: "Clock", category: "Conversion", sidebarCategory: "Conversion" },

  // ============================ DEVELOPER ============================
  { name: "JSON Formatter", slug: "json-formatter", desc: "Beautify and minify JSON.", summary: "The JSON Formatter beautifies raw JSON into indented, readable form or minifies it by stripping optional whitespace. It parses first, so output stays valid.", icon: "Braces", category: "Developer", sidebarCategory: "Developer" },
  { name: "JSON Validator", slug: "json-validator", desc: "Validate JSON and pinpoint errors.", summary: "The JSON Validator checks whether text is syntactically valid JSON, confirming the top-level type and keys or reporting the exact error and where it occurred.", icon: "FileJson", category: "Developer", sidebarCategory: "Developer" },
  { name: "Password Generator", slug: "password-generator", desc: "Strong random passwords.", summary: "The Password Generator creates random passwords from the character sets you pick, using the browser's crypto.getRandomValues rather than Math.random.", icon: "KeyRound", category: "Developer", sidebarCategory: "Developer" },
  { name: "Base64 Encode / Decode", slug: "base64-encoder-decoder", desc: "Encode and decode Base64.", summary: "The Base64 tool encodes text into the 64 printable ASCII characters used to carry data through text-only systems, and decodes Base64 back to plain text.", icon: "Binary", category: "Developer", sidebarCategory: "Developer" },
  { name: "URL Encode / Decode", slug: "url-encoder-decoder", desc: "Encode and decode URL components.", summary: "The URL Encoder / Decoder converts characters that are unsafe or reserved in a web address into percent-escapes, and decodes percent-encoded text back.", icon: "Link", category: "Developer", sidebarCategory: "Developer" },
  { name: "UUID Generator", slug: "uuid-generator", desc: "Generate v4 UUIDs.", summary: "The UUID Generator creates version 4 UUIDs, 128-bit identifiers written as 32 hexadecimal digits in five groups, of which 122 bits are random.", icon: "Fingerprint", category: "Developer", sidebarCategory: "Developer" },
  { name: "JWT Decoder", slug: "jwt-decoder", desc: "Decode JWT header and payload.", summary: "The JWT Decoder splits a JSON Web Token at its dots and decodes the header and payload into readable JSON. It does not verify the token's signature.", icon: "KeySquare", category: "Developer", sidebarCategory: "Developer" },
  { name: "QR Code Generator", slug: "qr-code-generator", desc: "Make a QR code from text or a URL.", summary: "The QR Code Generator turns any text or URL into a scannable QR code image that phone cameras and barcode scanners can read without typing.", icon: "QrCode", category: "Developer", sidebarCategory: "Developer" },
  { name: "Timestamp Converter", slug: "timestamp-converter", desc: "Unix time ↔ human date.", summary: "The Timestamp Converter translates both ways between Unix timestamps, the seconds or milliseconds since midnight UTC on 1 January 1970, and readable dates.", icon: "Clock", category: "Developer", sidebarCategory: "Developer" },
  { name: "Regex Tester", slug: "regex-tester", desc: "Test regular expressions live.", summary: "The Regex Tester runs a regular expression against sample text and shows every match live, using the same JavaScript regular-expression engine as your code.", icon: "Regex", category: "Developer", sidebarCategory: "Developer" },

  // ============================ CONSTRUCTION ============================
  { name: "Concrete Calculator", slug: "concrete-calculator", desc: "Concrete volume and bags needed.", summary: "The Concrete Calculator estimates the concrete needed for a rectangular pour from its length, width and thickness, in cubic metres, feet and yards.", icon: "Blocks", category: "Construction", sidebarCategory: "Construction" },
  { name: "Tile Calculator", slug: "tile-calculator", desc: "Tiles and boxes needed for an area.", summary: "The Tile Calculator divides a room area by a single tile's size to give the number of tiles and boxes needed, adding a wastage allowance for cuts.", icon: "LayoutGrid", category: "Construction", sidebarCategory: "Construction" },
  { name: "Roofing Calculator", slug: "roofing-calculator", desc: "Roof area and material estimate.", summary: "The Roofing Calculator converts a roof's flat footprint and pitch into the actual sloped surface area, then into roofing squares and shingle bundles.", icon: "Home", category: "Construction", sidebarCategory: "Construction" },
  { name: "Square Footage Calculator", slug: "square-footage-calculator", desc: "Area in square feet or metres.", summary: "The Square Footage Calculator finds the area of a rectangular space from its length and width in feet, metres, yards or inches, reporting both ft² and m².", icon: "Square", category: "Construction", sidebarCategory: "Construction" },

  // ============================ ENGINEERING ============================
  { name: "Ohm's Law Calculator", slug: "ohms-law-calculator", desc: "Solve voltage, current, resistance and power.", summary: "The Ohm's Law Calculator solves for voltage, current, resistance or power when you know any two of them, using V = I × R and the related power formulas.", icon: "Zap", category: "Engineering", sidebarCategory: "Engineering" },
  { name: "Electricity Cost Calculator", slug: "electricity-cost-calculator", desc: "Running cost of an appliance.", summary: "The Electricity Cost Calculator turns an appliance's wattage and hours of use into kilowatt-hours, then multiplies by your tariff to give the running cost.", icon: "Lightbulb", category: "Engineering", sidebarCategory: "Engineering" },
  { name: "Resistor Color Code Calculator", slug: "resistor-color-code-calculator", desc: "Decode resistor colour bands.", summary: "The Resistor Color Code Calculator decodes 4-band and 5-band resistors: pick each band's colour to get the resistance in ohms and the tolerance range.", icon: "Cpu", category: "Engineering", sidebarCategory: "Engineering" },
  { name: "Speed Calculator", slug: "speed-calculator", desc: "Speed, distance and time.", summary: "The Speed Calculator relates speed, distance and time. Enter any two and it finds the third, giving average speed, distance covered or journey time.", icon: "Gauge", category: "Engineering", sidebarCategory: "Engineering" },
  { name: "Power Calculator", slug: "power-calculator", desc: "Electrical power from V, I and R.", summary: "The Power Calculator finds electrical power in watts and kilowatts from voltage and current, current and resistance, or voltage and resistance.", icon: "BatteryCharging", category: "Engineering", sidebarCategory: "Engineering" },

  // ============================ AUTOMOBILE ============================
  { name: "Mileage Calculator", slug: "mileage-calculator", desc: "Fuel efficiency from distance and fuel.", summary: "The Mileage Calculator works out fuel efficiency from the distance covered and the fuel consumed, in your chosen units and the common alternatives.", icon: "Gauge", category: "Automobile", sidebarCategory: "Automobile" },
  { name: "Fuel Cost Calculator", slug: "fuel-cost-calculator", desc: "Estimate the fuel cost of a trip.", summary: "The Fuel Cost Calculator estimates the fuel a trip needs and what it costs from the distance, your vehicle's km per litre and the current fuel price.", icon: "Fuel", category: "Automobile", sidebarCategory: "Automobile" },
  { name: "Gas Mileage Calculator", slug: "gas-mileage-calculator", desc: "MPG or km-per-litre for a trip.", summary: "The Gas Mileage Calculator computes miles per gallon from a trip's distance and fuel used, converts it to km/L and L/100 km, and can estimate the fuel cost.", icon: "Car", category: "Automobile", sidebarCategory: "Automobile" },

  // ============================ WEATHER ============================
  { name: "Heat Index Calculator", slug: "heat-index-calculator", desc: "‘Feels like’ temperature in heat and humidity.", summary: "The Heat Index Calculator combines air temperature and relative humidity into the apparent, feels-like temperature and its National Weather Service risk band.", icon: "Sun", category: "Weather", sidebarCategory: "Weather" },
  { name: "Wind Chill Calculator", slug: "wind-chill-calculator", desc: "‘Feels like’ temperature in cold and wind.", summary: "The Wind Chill Calculator combines air temperature and wind speed into the feels-like temperature on exposed skin, because wind speeds up heat loss.", icon: "Wind", category: "Weather", sidebarCategory: "Weather" },

  // ============================ FUN ============================
  { name: "Love Calculator", slug: "love-calculator", desc: "A playful compatibility score.", summary: "The Love Calculator is a light-hearted game that turns two names into a compatibility score from 0 to 100 with a fun verdict. It is for entertainment only.", icon: "Heart", category: "Fun", sidebarCategory: "Fun" },
  { name: "Dice Roller", slug: "dice-roller", desc: "Roll one or more dice.", summary: "The Dice Roller throws any number of virtual dice with any number of sides, showing every face and the total, using the browser's cryptographic randomness.", icon: "Dices", category: "Fun", sidebarCategory: "Fun" },
];

// Ordered list of categories — drives the sidebar, drawer and home sections.
export const SIDEBAR_CATEGORIES = [
  "Finance",
  "Health",
  "Math",
  "Date & Time",
  "Education",
  "Conversion",
  "Developer",
  "Construction",
  "Engineering",
  "Automobile",
  "Weather",
  "Fun",
];

// Category metadata — each owns an accent colour used across tiles, icons and
// the tool-page header for a consistent, premium identity.
export const CATEGORIES = [
  { name: "Finance", icon: "Landmark", blurb: "Loans, EMI, interest, tax and money maths.", color: "var(--anslation-ds-success)" },
  { name: "Health", icon: "HeartPulse", blurb: "BMI, calories, macros and fitness numbers.", color: "var(--anslation-ds-danger)" },
  { name: "Math", icon: "Sigma", blurb: "Scientific, geometry, percentages and stats.", color: "var(--primary)" },
  { name: "Date & Time", icon: "CalendarClock", blurb: "Age, date gaps, durations and countdowns.", color: "var(--anslation-ds-info)" },
  { name: "Education", icon: "GraduationCap", blurb: "GPA, CGPA, grades and marks percentage.", color: "var(--anslation-ds-warning)" },
  { name: "Conversion", icon: "Repeat", blurb: "Length, weight, area, speed and data units.", color: "var(--secondary)" },
  { name: "Developer", icon: "Braces", blurb: "JSON, Base64, JWT, regex and generators.", color: "var(--primary)" },
  { name: "Construction", icon: "Blocks", blurb: "Concrete, tiles, roofing and square footage.", color: "var(--anslation-ds-warning)" },
  { name: "Engineering", icon: "Zap", blurb: "Ohm’s law, power, resistors and speed.", color: "var(--muted-foreground)" },
  { name: "Automobile", icon: "Car", blurb: "Mileage, fuel cost and gas mileage.", color: "var(--anslation-ds-danger)" },
  { name: "Weather", icon: "Sun", blurb: "Heat index and wind chill ‘feels like’.", color: "var(--secondary)" },
  { name: "Fun", icon: "Heart", blurb: "Love score and dice roller, just for fun.", color: "var(--primary)" },
];

// Hand-picked spread of the most useful calculators, surfaced on the home page.
export const POPULAR_SLUGS = [
  "loan-emi-calculator",
  "sip-calculator",
  "bmi-calculator",
  "percentage-calculator",
  "scientific-calculator",
  "age-calculator",
  "gst-calculator",
  "currency-converter",
  "password-generator",
  "tip-calculator",
];

// Convenience lookups.
export const getCalculator = (slug) => CALCULATORS.find((c) => c.slug === slug) || null;
export const getCategoryMeta = (name) => CATEGORIES.find((c) => c.name === name) || null;
export const getCategoryColor = (name) => CATEGORIES.find((c) => c.name === name)?.color || "var(--primary)";
export const getCategoryCount = (name) => CALCULATORS.filter((c) => c.sidebarCategory === name).length;
export const getPopularCalculators = () =>
  POPULAR_SLUGS.map((slug) => CALCULATORS.find((c) => c.slug === slug)).filter(Boolean);
