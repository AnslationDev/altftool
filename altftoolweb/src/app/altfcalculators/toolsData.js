// Altf Calculators — master data model (Phase 1 launch set).
// Plain data module (no JSX) so it can be imported by both server (metadata,
// sitemap) and client. `icon` is a lucide-react icon name, resolved by
// <CalcIcon />. `category` drives colour, grouping and navigation.

export const CALCULATORS = [
  // ============================ FINANCE ============================
  { name: "EMI Calculator", slug: "loan-emi-calculator", desc: "Monthly EMI, total interest and total payable on any loan.", icon: "Landmark", category: "Finance", sidebarCategory: "Finance" },
  { name: "Home Loan Calculator", slug: "home-loan-calculator", desc: "EMI, interest and total cost for a home loan.", icon: "Home", category: "Finance", sidebarCategory: "Finance" },
  { name: "Personal Loan Calculator", slug: "personal-loan-calculator", desc: "EMI and total cost of a personal loan.", icon: "Wallet", category: "Finance", sidebarCategory: "Finance" },
  { name: "Car Loan Calculator", slug: "car-loan-calculator", desc: "EMI and interest for a car / auto loan.", icon: "Car", category: "Finance", sidebarCategory: "Finance" },
  { name: "Mortgage Calculator", slug: "mortgage-calculator", desc: "Monthly mortgage payment with tax and insurance.", icon: "Building2", category: "Finance", sidebarCategory: "Finance" },
  { name: "Mortgage Payoff Calculator", slug: "mortgage-payoff-calculator", desc: "See how extra payments shorten your mortgage.", icon: "CalendarCheck", category: "Finance", sidebarCategory: "Finance" },
  { name: "Loan Calculator", slug: "loan-calculator", desc: "Flexible loan EMI, interest and total repayment.", icon: "Banknote", category: "Finance", sidebarCategory: "Finance" },
  { name: "SIP Calculator", slug: "sip-calculator", desc: "Future value of a monthly SIP investment.", icon: "TrendingUp", category: "Finance", sidebarCategory: "Finance" },
  { name: "Lumpsum Calculator", slug: "lumpsum-calculator", desc: "Growth of a one-time lumpsum investment.", icon: "Coins", category: "Finance", sidebarCategory: "Finance" },
  { name: "FD Calculator", slug: "fd-calculator", desc: "Maturity amount and interest on a fixed deposit.", icon: "PiggyBank", category: "Finance", sidebarCategory: "Finance" },
  { name: "RD Calculator", slug: "rd-calculator", desc: "Maturity value of a recurring deposit.", icon: "CalendarPlus", category: "Finance", sidebarCategory: "Finance" },
  { name: "Compound Interest", slug: "compound-interest-calculator", desc: "See how your savings grow with compounding.", icon: "LineChart", category: "Finance", sidebarCategory: "Finance" },
  { name: "Simple Interest", slug: "simple-interest-calculator", desc: "Simple interest and the final amount.", icon: "Percent", category: "Finance", sidebarCategory: "Finance" },
  { name: "Savings Goal Calculator", slug: "savings-calculator", desc: "Reach a savings goal with monthly deposits.", icon: "PiggyBank", category: "Finance", sidebarCategory: "Finance" },
  { name: "Investment Calculator", slug: "investment-calculator", desc: "Future value with regular contributions.", icon: "TrendingUp", category: "Finance", sidebarCategory: "Finance" },
  { name: "ROI Calculator", slug: "roi-calculator", desc: "Return on investment and net gain.", icon: "Target", category: "Finance", sidebarCategory: "Finance" },
  { name: "CAGR Calculator", slug: "cagr-calculator", desc: "Compound annual growth rate of an investment.", icon: "TrendingUp", category: "Finance", sidebarCategory: "Finance" },
  { name: "GST Calculator", slug: "gst-calculator", desc: "Add or remove GST and see net / gross.", icon: "ReceiptText", category: "Finance", sidebarCategory: "Finance" },
  { name: "VAT Calculator", slug: "vat-calculator", desc: "Add or remove VAT at any rate.", icon: "Receipt", category: "Finance", sidebarCategory: "Finance" },
  { name: "Income Tax Calculator", slug: "tax-calculator", desc: "Estimate income tax (India, new regime).", icon: "Landmark", category: "Finance", sidebarCategory: "Finance" },
  { name: "Salary Calculator", slug: "salary-calculator", desc: "Convert between hourly, monthly and annual pay.", icon: "Wallet", category: "Finance", sidebarCategory: "Finance" },
  { name: "Take-Home Salary Calculator", slug: "take-home-salary-calculator", desc: "Net in-hand salary after deductions.", icon: "HandCoins", category: "Finance", sidebarCategory: "Finance" },
  { name: "Discount Calculator", slug: "discount-calculator", desc: "Sale price and how much you save.", icon: "BadgePercent", category: "Finance", sidebarCategory: "Finance" },
  { name: "Currency Converter", slug: "currency-converter", desc: "Convert currencies with editable rates.", icon: "ArrowLeftRight", category: "Finance", sidebarCategory: "Finance" },
  { name: "Budget Calculator", slug: "budget-calculator", desc: "Split income with the 50/30/20 rule.", icon: "PieChart", category: "Finance", sidebarCategory: "Finance" },
  { name: "Tip Calculator", slug: "tip-calculator", desc: "Split the bill and tip across people.", icon: "Coins", category: "Finance", sidebarCategory: "Finance" },
  { name: "Unit Price Calculator", slug: "unit-price-calculator", desc: "Compare products by price per unit.", icon: "ShoppingCart", category: "Finance", sidebarCategory: "Finance" },

  // ============================ HEALTH ============================
  { name: "BMI Calculator", slug: "bmi-calculator", desc: "Body Mass Index and healthy weight range.", icon: "Scale", category: "Health", sidebarCategory: "Health" },
  { name: "Calorie Calculator", slug: "calorie-calculator", desc: "Daily calories to maintain, lose or gain weight.", icon: "Utensils", category: "Health", sidebarCategory: "Health" },
  { name: "BMR Calculator", slug: "bmr-calculator", desc: "Resting calories your body burns (BMR).", icon: "Activity", category: "Health", sidebarCategory: "Health" },
  { name: "TDEE Calculator", slug: "tdee-calculator", desc: "Total daily energy expenditure.", icon: "Gauge", category: "Health", sidebarCategory: "Health" },
  { name: "Body Fat Calculator", slug: "body-fat-calculator", desc: "Body fat % via the U.S. Navy method.", icon: "Percent", category: "Health", sidebarCategory: "Health" },
  { name: "Ideal Weight Calculator", slug: "ideal-weight-calculator", desc: "Ideal body weight for your height.", icon: "Ruler", category: "Health", sidebarCategory: "Health" },
  { name: "Protein Calculator", slug: "protein-calculator", desc: "Daily protein target for your goals.", icon: "Egg", category: "Health", sidebarCategory: "Health" },
  { name: "Macro Calculator", slug: "macro-calculator", desc: "Daily protein, carb and fat split.", icon: "PieChart", category: "Health", sidebarCategory: "Health" },
  { name: "Calories Burned Calculator", slug: "calories-burned-calculator", desc: "Calories burned by activity and time.", icon: "Flame", category: "Health", sidebarCategory: "Health" },
  { name: "Target Heart Rate Calculator", slug: "target-heart-rate-calculator", desc: "Your training heart-rate zones.", icon: "HeartPulse", category: "Health", sidebarCategory: "Health" },

  // ============================ MATH ============================
  { name: "Scientific Calculator", slug: "scientific-calculator", desc: "Full scientific calculator with functions.", icon: "FunctionSquare", category: "Math", sidebarCategory: "Math" },
  { name: "Basic Calculator", slug: "basic-calculator", desc: "Quick everyday arithmetic.", icon: "Calculator", category: "Math", sidebarCategory: "Math" },
  { name: "Percentage Calculator", slug: "percentage-calculator", desc: "Percentages, change and ‘X of Y’.", icon: "Percent", category: "Math", sidebarCategory: "Math" },
  { name: "Fraction Calculator", slug: "fraction-calculator", desc: "Add, subtract, multiply and simplify fractions.", icon: "Divide", category: "Math", sidebarCategory: "Math" },
  { name: "Average Calculator", slug: "average-calculator", desc: "Mean, median, mode and range.", icon: "Sigma", category: "Math", sidebarCategory: "Math" },
  { name: "Ratio Calculator", slug: "ratio-calculator", desc: "Simplify and solve ratios.", icon: "Scale", category: "Math", sidebarCategory: "Math" },
  { name: "Area Calculator", slug: "area-calculator", desc: "Area of common 2D shapes.", icon: "Square", category: "Math", sidebarCategory: "Math" },
  { name: "Volume Calculator", slug: "volume-calculator", desc: "Volume of common 3D shapes.", icon: "Box", category: "Math", sidebarCategory: "Math" },
  { name: "Circle Calculator", slug: "circle-calculator", desc: "Radius, area and circumference.", icon: "Circle", category: "Math", sidebarCategory: "Math" },
  { name: "Triangle Calculator", slug: "triangle-calculator", desc: "Area, perimeter and sides of a triangle.", icon: "Triangle", category: "Math", sidebarCategory: "Math" },
  { name: "Distance Calculator", slug: "distance-calculator", desc: "Distance between two coordinates.", icon: "Ruler", category: "Math", sidebarCategory: "Math" },
  { name: "Surface Area Calculator", slug: "surface-area-calculator", desc: "Surface area of 3D shapes.", icon: "Layers", category: "Math", sidebarCategory: "Math" },
  { name: "Exponent Calculator", slug: "exponent-calculator", desc: "Raise a number to any power.", icon: "Superscript", category: "Math", sidebarCategory: "Math" },
  { name: "Root Calculator", slug: "root-calculator", desc: "Square, cube and nth roots.", icon: "Radical", category: "Math", sidebarCategory: "Math" },
  { name: "LCM Calculator", slug: "lcm-calculator", desc: "Least common multiple of numbers.", icon: "Hash", category: "Math", sidebarCategory: "Math" },
  { name: "GCF / HCF Calculator", slug: "gcf-calculator", desc: "Greatest common factor of numbers.", icon: "Hash", category: "Math", sidebarCategory: "Math" },
  { name: "Factor Calculator", slug: "factor-calculator", desc: "List all factors of a number.", icon: "Grid2x2", category: "Math", sidebarCategory: "Math" },
  { name: "Rounding Calculator", slug: "rounding-calculator", desc: "Round to decimals or place values.", icon: "ArrowUpDown", category: "Math", sidebarCategory: "Math" },
  { name: "Pythagorean Theorem Calculator", slug: "pythagorean-theorem-calculator", desc: "Solve a² + b² = c².", icon: "Triangle", category: "Math", sidebarCategory: "Math" },
  { name: "Right Triangle Calculator", slug: "right-triangle-calculator", desc: "Sides and angles of a right triangle.", icon: "Triangle", category: "Math", sidebarCategory: "Math" },
  { name: "Quadratic Equation Solver", slug: "quadratic-equation-calculator", desc: "Solve ax² + bx + c = 0.", icon: "FunctionSquare", category: "Math", sidebarCategory: "Math" },
  { name: "Standard Deviation Calculator", slug: "standard-deviation-calculator", desc: "SD, variance and mean.", icon: "BarChart3", category: "Math", sidebarCategory: "Math" },

  // ============================ DATE & TIME ============================
  { name: "Age Calculator", slug: "age-calculator", desc: "Your exact age in years, months and days.", icon: "Cake", category: "Date & Time", sidebarCategory: "Date & Time" },
  { name: "Date Calculator", slug: "date-calculator", desc: "Days between dates, or add / subtract days.", icon: "CalendarDays", category: "Date & Time", sidebarCategory: "Date & Time" },
  { name: "Time Calculator", slug: "time-calculator", desc: "Add or subtract times and durations.", icon: "Clock", category: "Date & Time", sidebarCategory: "Date & Time" },
  { name: "Time Duration Calculator", slug: "time-duration-calculator", desc: "Duration between two times.", icon: "Hourglass", category: "Date & Time", sidebarCategory: "Date & Time" },
  { name: "Day Counter", slug: "countdown-calculator", desc: "Days until (or since) any date.", icon: "CalendarClock", category: "Date & Time", sidebarCategory: "Date & Time" },

  // ============================ EDUCATION ============================
  { name: "GPA Calculator", slug: "gpa-calculator", desc: "Grade point average from your courses.", icon: "GraduationCap", category: "Education", sidebarCategory: "Education" },
  { name: "Grade Calculator", slug: "grade-calculator", desc: "Weighted grade and the score you need.", icon: "BookOpenCheck", category: "Education", sidebarCategory: "Education" },
  { name: "CGPA Calculator", slug: "cgpa-calculator", desc: "Cumulative GPA across semesters.", icon: "School", category: "Education", sidebarCategory: "Education" },
  { name: "Marks Percentage Calculator", slug: "marks-percentage-calculator", desc: "Percentage from marks obtained.", icon: "ClipboardList", category: "Education", sidebarCategory: "Education" },

  // ============================ CONVERSION ============================
  { name: "Unit Converter", slug: "unit-converter", desc: "All-in-one converter for many measurements.", icon: "Repeat", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Length Converter", slug: "length-converter", desc: "mm, cm, m, km, inch, foot, mile.", icon: "Ruler", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Weight Converter", slug: "weight-converter", desc: "mg, g, kg, ounce, pound, stone.", icon: "Weight", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Area Converter", slug: "area-converter", desc: "m², ft², acre, hectare and more.", icon: "Square", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Volume Converter", slug: "volume-converter", desc: "litre, ml, gallon, cup and more.", icon: "Box", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Temperature Converter", slug: "temperature-converter", desc: "Celsius, Fahrenheit and Kelvin.", icon: "Thermometer", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Speed Converter", slug: "speed-converter", desc: "m/s, km/h, mph, knots.", icon: "Gauge", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Data Storage Converter", slug: "data-storage-converter", desc: "bytes, KB, MB, GB, TB.", icon: "HardDrive", category: "Conversion", sidebarCategory: "Conversion" },
  { name: "Time Converter", slug: "time-converter", desc: "seconds, minutes, hours, days.", icon: "Clock", category: "Conversion", sidebarCategory: "Conversion" },

  // ============================ DEVELOPER ============================
  { name: "JSON Formatter", slug: "json-formatter", desc: "Beautify and minify JSON.", icon: "Braces", category: "Developer", sidebarCategory: "Developer" },
  { name: "JSON Validator", slug: "json-validator", desc: "Validate JSON and pinpoint errors.", icon: "FileJson", category: "Developer", sidebarCategory: "Developer" },
  { name: "Password Generator", slug: "password-generator", desc: "Strong random passwords.", icon: "KeyRound", category: "Developer", sidebarCategory: "Developer" },
  { name: "Base64 Encode / Decode", slug: "base64-encoder-decoder", desc: "Encode and decode Base64.", icon: "Binary", category: "Developer", sidebarCategory: "Developer" },
  { name: "URL Encode / Decode", slug: "url-encoder-decoder", desc: "Encode and decode URL components.", icon: "Link", category: "Developer", sidebarCategory: "Developer" },
  { name: "UUID Generator", slug: "uuid-generator", desc: "Generate v4 UUIDs.", icon: "Fingerprint", category: "Developer", sidebarCategory: "Developer" },
  { name: "JWT Decoder", slug: "jwt-decoder", desc: "Decode JWT header and payload.", icon: "KeySquare", category: "Developer", sidebarCategory: "Developer" },
  { name: "QR Code Generator", slug: "qr-code-generator", desc: "Make a QR code from text or a URL.", icon: "QrCode", category: "Developer", sidebarCategory: "Developer" },
  { name: "Timestamp Converter", slug: "timestamp-converter", desc: "Unix time ↔ human date.", icon: "Clock", category: "Developer", sidebarCategory: "Developer" },
  { name: "Regex Tester", slug: "regex-tester", desc: "Test regular expressions live.", icon: "Regex", category: "Developer", sidebarCategory: "Developer" },

  // ============================ CONSTRUCTION ============================
  { name: "Concrete Calculator", slug: "concrete-calculator", desc: "Concrete volume and bags needed.", icon: "Blocks", category: "Construction", sidebarCategory: "Construction" },
  { name: "Tile Calculator", slug: "tile-calculator", desc: "Tiles and boxes needed for an area.", icon: "LayoutGrid", category: "Construction", sidebarCategory: "Construction" },
  { name: "Roofing Calculator", slug: "roofing-calculator", desc: "Roof area and material estimate.", icon: "Home", category: "Construction", sidebarCategory: "Construction" },
  { name: "Square Footage Calculator", slug: "square-footage-calculator", desc: "Area in square feet or metres.", icon: "Square", category: "Construction", sidebarCategory: "Construction" },

  // ============================ ENGINEERING ============================
  { name: "Ohm's Law Calculator", slug: "ohms-law-calculator", desc: "Solve voltage, current, resistance and power.", icon: "Zap", category: "Engineering", sidebarCategory: "Engineering" },
  { name: "Electricity Cost Calculator", slug: "electricity-cost-calculator", desc: "Running cost of an appliance.", icon: "Lightbulb", category: "Engineering", sidebarCategory: "Engineering" },
  { name: "Resistor Color Code Calculator", slug: "resistor-color-code-calculator", desc: "Decode resistor colour bands.", icon: "Cpu", category: "Engineering", sidebarCategory: "Engineering" },
  { name: "Speed Calculator", slug: "speed-calculator", desc: "Speed, distance and time.", icon: "Gauge", category: "Engineering", sidebarCategory: "Engineering" },
  { name: "Power Calculator", slug: "power-calculator", desc: "Electrical power from V, I and R.", icon: "BatteryCharging", category: "Engineering", sidebarCategory: "Engineering" },

  // ============================ AUTOMOBILE ============================
  { name: "Mileage Calculator", slug: "mileage-calculator", desc: "Fuel efficiency from distance and fuel.", icon: "Gauge", category: "Automobile", sidebarCategory: "Automobile" },
  { name: "Fuel Cost Calculator", slug: "fuel-cost-calculator", desc: "Estimate the fuel cost of a trip.", icon: "Fuel", category: "Automobile", sidebarCategory: "Automobile" },
  { name: "Gas Mileage Calculator", slug: "gas-mileage-calculator", desc: "MPG or km-per-litre for a trip.", icon: "Car", category: "Automobile", sidebarCategory: "Automobile" },

  // ============================ WEATHER ============================
  { name: "Heat Index Calculator", slug: "heat-index-calculator", desc: "‘Feels like’ temperature in heat and humidity.", icon: "Sun", category: "Weather", sidebarCategory: "Weather" },
  { name: "Wind Chill Calculator", slug: "wind-chill-calculator", desc: "‘Feels like’ temperature in cold and wind.", icon: "Wind", category: "Weather", sidebarCategory: "Weather" },

  // ============================ FUN ============================
  { name: "Love Calculator", slug: "love-calculator", desc: "A playful compatibility score.", icon: "Heart", category: "Fun", sidebarCategory: "Fun" },
  { name: "Dice Roller", slug: "dice-roller", desc: "Roll one or more dice.", icon: "Dices", category: "Fun", sidebarCategory: "Fun" },
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
