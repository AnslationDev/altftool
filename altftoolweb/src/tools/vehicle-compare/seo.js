const seo = {
  title: "Car Comparison — Compare Two Cars Side by Side",
  h1: "Vehicle Compare — Side-by-Side Car Specification Comparison",
  metaDescription:
    "Compare two 2024 Indian SUVs side by side — price, ARAI mileage, power and safety — with the better figure bolded. Sample base-variant spec data, free, no signup.",
  intro:
    "Vehicle Compare puts two models from a six-car 2024 India shortlist — Hyundai Creta, Kia Seltos, Maruti Brezza, Mahindra Scorpio-N, Tata Nexon and Toyota Innova Hycross — into a single three-column grid across four specs: ex-showroom price, ARAI mileage, maximum power and safety rating. Each row is scored by direction rather than opinion: the lower number wins on price, the higher number wins on mileage, power and safety, and the winning cell is bolded in the accent colour, with ties left unmarked. Above the grid, three proportional bars size each value as value ÷ larger value × 100%, and prices are converted to the Indian lakh/crore scale, so a gap in mileage, power or price is readable before you parse a digit. Each of the six models carries its own reference figures — rounded from published base-variant, ARAI and NCAP data — compiled into the page. The tool makes no network request of any kind, so nothing you select is uploaded, but the numbers are indicative base-trim figures, not a live price feed; confirm current pricing and variant-specific specs with the manufacturer or a dealer.",
  useCases: [
    "Laying two shortlisted SUVs on one screen across price, mileage, power and safety instead of flipping between two brochure PDFs or browser tabs.",
    "Showing a first-time buyer how spec trade-offs actually work — the proportional bars make a price gap or a power gap obvious without reading numbers.",
    "Using the four-row grid as a checklist of the figures worth writing down before a dealership visit or test drive.",
  ],
  benefits: [
    [
      "Side by side, not tab by tab",
      "Both vehicles occupy one three-column grid — specification, vehicle 1, vehicle 2 — so all four figures line up on the same row. Picking a model on one side disables it on the other, so you can't accidentally compare a car against itself.",
    ],
    [
      "The better figure is marked for you",
      "Price is scored lower-is-better; mileage, maximum power and safety rating are higher-is-better. The tool reads the first number out of each value ('21.0 kmpl' becomes 21.0, '5 Stars' becomes 5), compares them, and bolds the winning cell. Equal values are left unhighlighted rather than guessed.",
    ],
    [
      "Proportional bars, not just digits",
      "Price, power and mileage each get a bar sized against the larger of the two values, so the gap is visual. Amounts of ₹1,00,000 and up render as lakh, ₹1,00,00,000 and up as crore, and smaller figures use en-IN digit grouping.",
    ],
    [
      "Nothing leaves your device",
      "The comparison is client-side React with zero network calls — no account, no upload, no usage limit, and no record of which vehicles you looked at.",
    ],
  ],
  faqs: [
    [
      "are the prices in this car comparison tool live?",
      "No. Each of the six models has its own fixed reference record — rounded, base-variant price, ARAI mileage, maximum power and NCAP-style safety rating — built into the page, so the figures do change with which two vehicles you pick, but they are not pulled from a live pricing feed. Use it to see how the side-by-side layout and scoring work, then confirm actual ex-showroom price, variant-specific mileage and current safety rating with the manufacturer or dealer.",
    ],
    [
      "which cars can I compare?",
      "Six 2024 India-market models: Hyundai Creta, Kia Seltos, Maruti Brezza, Mahindra Scorpio-N, Tata Nexon and Toyota Innova Hycross. You select two at a time from the dropdowns, and the model you pick on one side is greyed out on the other.",
    ],
    [
      "how does the tool decide which vehicle wins a spec?",
      "By the direction of the number. Price is treated as lower-is-better; mileage, maximum power and safety rating are higher-is-better. It extracts the first numeric value from each cell with a regular expression, compares the two, and bolds the better one in the accent colour. If both values are identical, neither cell is highlighted.",
    ],
    [
      "what specifications does it compare?",
      "Four: ex-showroom price, ARAI mileage in kmpl, maximum power in HP, and safety rating in stars. Price, power and mileage also appear as proportional bars in the visualiser above the grid; safety rating appears in the grid only.",
    ],
    [
      "is the vehicle comparison tool free and does it need an account?",
      "Yes to free, no to an account. There is no signup, no paywall and no usage limit. Selecting vehicles and pressing Compare triggers no network request at all — the whole thing runs in your browser.",
    ],
    [
      "why does the price show as 12.00 Lakh instead of rupees?",
      "Because values of ₹1,00,000 or more are converted to the Indian lakh/crore scale to two decimal places — ₹1,00,000 and above become lakh, ₹1,00,00,000 and above become crore. Anything below a lakh is printed in full with en-IN grouping, such as ₹99,000.",
    ],
    [
      "does it compare on-road price, EMI or running cost?",
      "No — only ex-showroom price is shown, so insurance, registration, road tax, accessories and dealer charges are excluded. For loan and ownership maths, AltFTool has separate car loan EMI, car ownership cost and car depreciation calculators.",
    ],
    [
      "is any of my data sent to a server?",
      "No. Pressing Compare runs a brief on-screen loading state and then renders the built-in dataset locally in React. There is no API call, no upload and no storage of your selections.",
    ],
  ],
  steps: [
    "Choose your first car from the Select Vehicle 1 dropdown — six 2024 models are listed, and your pick is disabled on the opposite side.",
    "Choose the second car, then press Compare. A short loading state runs before the results appear; Reset clears both selections.",
    "Read the three proportional bars for price, power and mileage, then the four-row grid beneath, where the better figure in each row is bolded.",
  ],
};

export default seo;
