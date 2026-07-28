const seo = {
  title: "Skincare Routine Quiz — Free Skin Care Guide by Type",
  h1: "Skin Care Guide: Build Your Skincare Routine in 3 Questions",
  metaDescription:
    "Answer 3 questions — skin type, concern, morning or night — and get a numbered skincare routine with per-step timings and tips. Free, no signup.",
  intro:
    "The Skin Care Guide is a three-question quiz that turns your answers into an ordered, numbered routine. It joins your choices into a lookup key — skin type, concern and time of day, as in oily_acne_morning — and matches that key against a built-in routine map: four hand-written routines (Oil-Control Morning, Hydrating Anti-Aging Night, Brightening Morning, Gentle Calming Night) plus a five-step Basic Skincare Routine that any unmatched combination falls back to. There is no AI model and no server call: the whole quiz runs in React state in your browser, so your answers are never uploaded, and the Print Routine button simply opens your browser's own print dialog.",
  useCases: [
    "Working out the correct order to apply products — cleanser, toner, serum, moisturiser, then sunscreen — instead of guessing from a shelf of bottles",
    "Getting a starting routine for a specific pairing, such as oily and acne-prone skin in the morning or dry, ageing skin at night",
    "Printing or saving a routine card to PDF to keep by the bathroom mirror or take to a shop when buying products",
  ],
  benefits: [
    [
      "Order and timing, not just a product list",
      "Every routine is numbered in application order, and each step carries a time estimate (1-2 minutes), so a full routine reads as 6 to 8 minutes rather than an open-ended chore.",
    ],
    [
      "Routines matched to a real combination",
      "Four combinations have a purpose-written routine — oily + acne + morning, dry + anti-ageing + night, combination + dark spots + morning, normal + sensitivity + night — each with its own three pro tips, such as introducing retinol only 2-3 times per week.",
    ],
    [
      "Nothing is sent anywhere",
      "Your answers live only in the page's React state. The tool makes no network requests and writes nothing to storage, so there is no account, no upload and no saved profile.",
    ],
    [
      "Three questions, then print",
      "A progress bar moves 33% to 67% to 100%, a Back button lets you change an answer, and one button hands the finished routine to your browser's print dialog for paper or PDF.",
    ],
  ],
  faqs: [
    [
      "What order should you apply skincare products in?",
      "Cleanser first, then toner, serum, moisturiser, and sunscreen last in the morning. That is exactly the sequence the tool's Basic Skincare Routine lays out — five steps totalling about 6 minutes — and the targeted routines follow the same thin-to-thick logic, for example gel cleanser, vitamin C serum, niacinamide, lightweight moisturiser, SPF 50 for combination skin with dark spots.",
    ],
    [
      "Is this skincare quiz free, and do I need to sign up?",
      "Yes, it is free and there is no signup. The quiz is three multiple-choice questions handled entirely by client-side React state — the code makes no API calls and no login is involved, so nothing about your skin is transmitted or stored.",
    ],
    [
      "How many questions is the skincare routine quiz?",
      "Three: your skin type (oily, dry, combination or normal), your main concern (acne and breakouts, anti-ageing, dark spots or sensitivity), and whether you want a morning, night or both routine. It takes well under a minute, and a Back button appears from question two onwards if you want to change an answer.",
    ],
    [
      "Does this tool use AI to generate the routine?",
      "No. It is a fixed decision map, not a model. Your three answers form a key such as oily_acne_morning, and four of those keys have a dedicated routine written into the code; every other combination returns the five-step Basic Skincare Routine. That means results are consistent and repeatable, but they are general templates rather than an individual assessment.",
    ],
    [
      "What is a good morning routine for oily, acne-prone skin?",
      "The tool's Oil-Control Morning Routine runs five steps in about 6 minutes: gentle foaming cleanser, salicylic acid toner, niacinamide serum, oil-free moisturiser, then broad-spectrum SPF 50. Its tips note that skipping moisturiser backfires, because dehydrated skin tends to produce more oil.",
    ],
    [
      "Can I get a morning and a night routine at the same time?",
      "Not in one pass. Choosing Both resolves to the morning key internally, so you get the morning-side routine — or the Basic routine if that pairing has no dedicated morning entry. To see the evening version, use Take Quiz Again and pick Night on the third question.",
    ],
    [
      "Can I save or print my routine?",
      "You can print it — the Print Routine button opens your browser's standard print dialog, where you can choose a printer or Save as PDF. There is no save or account feature, and because the answers are held only in page state, reloading or leaving the page clears the result.",
    ],
    [
      "Is this medical advice for skin conditions?",
      "No. The tool outputs general routine templates and ingredient categories, not a diagnosis or treatment plan. Patch test anything new, and take persistent acne, rashes, pigmentation or reactions to a qualified dermatologist rather than to a quiz.",
    ],
  ],
  steps: [
    "Pick your skin type: oily (shiny, prone to acne), dry (flaky, tight), combination (oily T-zone, dry cheeks) or normal.",
    "Choose your main concern — acne and breakouts, anti-ageing, dark spots or sensitivity — then whether the routine is for morning, night or both.",
    "Read the numbered routine with per-step timings and its three pro tips, then use Print Routine to print or save as PDF, or Take Quiz Again to try a different combination.",
  ],
};

export default seo;
