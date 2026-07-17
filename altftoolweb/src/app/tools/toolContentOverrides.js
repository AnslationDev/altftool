// Hand-written, unique SEO content for tools whose auto-generated description was thin.
// Keyed by tool slug. `buildToolSeoContent()` merges these over the generated defaults so
// each page ships distinctive, human-readable copy (intro, use cases, benefits, FAQs)
// instead of category-template wording. Add more slugs here over time.

export const toolContentOverrides = {
  "age-calculator": {
    intro:
      "Age Calculator works out your exact age in years, months, days — and even total hours — from any birth date. It's handy for forms, eligibility checks, birthday countdowns, or settling the classic 'how old am I in days?' question.",
    useCases: [
      "Confirm an exact age for a job, visa, or pension eligibility form.",
      "Count down the days to a birthday, anniversary, or milestone.",
      "Work out the age gap between two people or two dates.",
    ],
    benefits: [
      ["Precise to the day", "Get years, months and days rather than a rounded number."],
      ["Any date range", "Calculate age as of today or any past/future reference date."],
      ["Private by default", "Dates are processed in your browser and never uploaded."],
    ],
    faqs: [
      ["How does the Age Calculator count months and days?", "It compares your birth date to the reference date calendar-accurately, accounting for different month lengths and leap years."],
      ["Can I calculate age for a future date?", "Yes — set any reference date to see how old someone will be on that day."],
      ["Is my birth date stored anywhere?", "No. The calculation runs entirely in your browser; nothing is sent to a server."],
    ],
  },
  "bmi-calculator": {
    intro:
      "BMI Calculator estimates your Body Mass Index from your height and weight and shows which standard category it falls in. It's a quick, private way to get a general read on weight relative to height — useful as a starting point, not a diagnosis.",
    useCases: [
      "Get a quick BMI reading before a fitness or health check-in.",
      "Compare BMI in metric or imperial units.",
      "Track changes in BMI over time as a rough trend.",
    ],
    benefits: [
      ["Metric & imperial", "Enter height/weight in cm/kg or ft/in/lb."],
      ["Instant category", "See the standard underweight / normal / overweight bands."],
      ["Educational context", "Understand what BMI can and can't tell you."],
    ],
    faqs: [
      ["Is BMI an accurate measure of health?", "BMI is a general screening tool, not a diagnosis. It doesn't account for muscle mass, age, or body composition, so treat it as one data point and consult a professional for advice."],
      ["Which units can I use?", "Both metric (cm, kg) and imperial (ft/in, lb) are supported."],
      ["Does it store my data?", "No — your height and weight stay in your browser."],
    ],
  },
  "meme-generator": {
    intro:
      "Meme Generator lets you turn any image into a shareable meme with top and bottom captions in seconds. Upload a picture or use a template, type your text, and download a clean, high-quality result — no watermarks, no signup.",
    useCases: [
      "Caption a reaction image for a group chat or social post.",
      "Make a quick branded meme for marketing or community content.",
      "Add bold, readable text overlays to any photo.",
    ],
    benefits: [
      ["No watermark", "Export memes without forced branding stamped on top."],
      ["Your images stay local", "Uploads are processed in the browser, not on a server."],
      ["Readable by default", "Classic outlined meme text that stays legible on any image."],
    ],
    faqs: [
      ["Do my uploaded images get sent anywhere?", "No. Image editing happens in your browser, so your pictures never leave your device."],
      ["Can I download in high resolution?", "Yes — the meme exports at the resolution of your source image."],
      ["Is there a watermark?", "No watermark is added to your finished meme."],
    ],
  },
  "resume-maker": {
    intro:
      "Resume Maker helps you build a clean, professional resume from a guided form and export it ready to send. Fill in your experience, skills and education, pick a tidy layout, and get a recruiter-friendly document without wrestling with a word processor.",
    useCases: [
      "Create a first resume quickly when applying for a new role.",
      "Refresh an existing resume with a cleaner, ATS-friendly layout.",
      "Tailor a focused one-page resume for a specific job.",
    ],
    benefits: [
      ["Structured sections", "Guided fields for experience, skills, education and contact."],
      ["Clean, ATS-friendly layout", "Simple formatting that applicant systems can parse."],
      ["Private", "Your details stay in your browser while you build."],
    ],
    faqs: [
      ["Will the resume work with applicant tracking systems (ATS)?", "The layouts use simple, parseable structure and standard headings to maximise ATS compatibility."],
      ["Can I edit my resume after starting?", "Yes — update any field and re-export as your details change."],
      ["Is my information uploaded anywhere?", "No, your resume data is handled locally in your browser."],
    ],
  },
  "markdown-preview": {
    intro:
      "Markdown Preview renders your Markdown as formatted HTML live, side by side, as you type. It's perfect for checking README files, documentation, or notes before you publish them, with instant feedback on headings, lists, code blocks and links.",
    useCases: [
      "Preview a GitHub README before committing it.",
      "Check formatting of docs or release notes.",
      "Draft Markdown notes and see the rendered result instantly.",
    ],
    benefits: [
      ["Live rendering", "See formatted output update as you type."],
      ["Full Markdown support", "Headings, lists, tables, code blocks and links."],
      ["Local only", "Your text is rendered in the browser, never uploaded."],
    ],
    faqs: [
      ["Does it support GitHub-flavored Markdown?", "It renders common Markdown including tables, fenced code blocks and task lists."],
      ["Can I copy the rendered HTML?", "Yes — use the output to grab the formatted result for pasting elsewhere."],
      ["Is my content stored?", "No, everything is rendered locally in your browser."],
    ],
  },
  "fake-data": {
    intro:
      "Fake Data generates realistic placeholder records — names, emails, addresses, phone numbers and more — for testing, demos and prototypes. Stop hand-typing dummy values: produce a clean batch of believable test data in one click.",
    useCases: [
      "Seed a database or form with realistic sample records.",
      "Populate a UI mockup or demo with believable content.",
      "Generate test inputs for QA without using real personal data.",
    ],
    benefits: [
      ["Realistic fields", "Names, emails, addresses, phones and more that look real."],
      ["Bulk generation", "Create many rows at once instead of typing them."],
      ["Safe & synthetic", "No real personal data — ideal for testing."],
    ],
    faqs: [
      ["Is the generated data real?", "No — all values are synthetic and randomly generated, so they're safe to use in tests and demos."],
      ["Can I generate many records at once?", "Yes, produce a batch in a single click."],
      ["Can I use it for production data?", "It's intended for testing, demos and prototypes, not real records."],
    ],
  },
  "form-builder": {
    intro:
      "Form Builder lets you assemble a working form from fields like text, email, checkboxes and dropdowns without writing code. Arrange the inputs you need, configure them, and get a form you can preview and reuse.",
    useCases: [
      "Prototype a contact or signup form quickly.",
      "Draft a survey or feedback form layout.",
      "Plan form fields before handing off to a developer.",
    ],
    benefits: [
      ["No-code assembly", "Add and arrange fields visually."],
      ["Common field types", "Text, email, select, checkbox, radio and more."],
      ["Instant preview", "See the form exactly as users will."],
    ],
    faqs: [
      ["Do I need to know how to code?", "No — you build the form visually by adding and configuring fields."],
      ["What field types are supported?", "Common inputs including text, email, dropdowns, checkboxes and radio buttons."],
      ["Where is my form data handled?", "Form building happens in your browser."],
    ],
  },
  "link-sorter": {
    intro:
      "Link Sorter cleans up a messy list of URLs — sorting them alphabetically, removing duplicates, and tidying the formatting so you can paste a long, jumbled list and get an organised one back. Great for research, outreach lists and bookmarks.",
    useCases: [
      "De-duplicate and sort a long list of research links.",
      "Clean an outreach or backlink URL list before import.",
      "Organise exported bookmarks into a tidy list.",
    ],
    benefits: [
      ["Sort & de-dupe", "Alphabetise and remove repeated URLs in one go."],
      ["Handles big lists", "Paste hundreds of links at once."],
      ["Browser-only", "Your links are processed locally, not uploaded."],
    ],
    faqs: [
      ["Can it remove duplicate links?", "Yes — duplicates are detected and removed while sorting."],
      ["How many links can I paste?", "It comfortably handles long lists of hundreds of URLs."],
      ["Are my links uploaded?", "No, sorting runs entirely in your browser."],
    ],
  },
  "emoji-hub": {
    intro:
      "Emoji Hub is a fast, searchable library of emojis you can browse by category and copy with a single click. Find the right emoji for a message, post or document without hunting through your keyboard picker.",
    useCases: [
      "Find and copy an emoji for a social post or message.",
      "Browse emojis by category to discover the right one.",
      "Grab emojis for documents, slides or spreadsheets.",
    ],
    benefits: [
      ["One-click copy", "Tap any emoji to copy it instantly."],
      ["Searchable", "Find emojis by name or keyword fast."],
      ["Organised by category", "Browse related emojis together."],
    ],
    faqs: [
      ["How do I copy an emoji?", "Click any emoji and it's copied to your clipboard, ready to paste anywhere."],
      ["Can I search for a specific emoji?", "Yes — search by name or keyword to jump straight to it."],
      ["Will emojis look the same everywhere?", "Emoji appearance depends on the device or platform displaying them, but the underlying character is standard."],
    ],
  },
  "encoded-decoded": {
    intro:
      "Encode & Decode converts text between formats like Base64, URL encoding and HTML entities — both directions, instantly. Paste a string, choose the operation, and copy the clean result, whether you're debugging, sharing data, or inspecting an encoded value.",
    useCases: [
      "Decode a Base64 string to read its contents.",
      "URL-encode a value before putting it in a query string.",
      "Encode or decode HTML entities while debugging.",
    ],
    benefits: [
      ["Two-way conversion", "Encode and decode in the same tool."],
      ["Multiple formats", "Base64, URL and HTML entity encoding."],
      ["Private", "Your text is converted locally, never uploaded."],
    ],
    faqs: [
      ["Which encodings are supported?", "Common ones including Base64, URL encoding and HTML entities."],
      ["Is my text sent to a server?", "No — encoding and decoding happen entirely in your browser."],
      ["Can I decode as well as encode?", "Yes, the tool works in both directions."],
    ],
  },
  "excel-formula": {
    intro:
      "Excel Formula helps you find and build the right spreadsheet formula for a task — describe what you want to calculate and get the correct syntax for Excel or Google Sheets, with an explanation of how it works.",
    useCases: [
      "Find the formula for a SUMIF, VLOOKUP or date calculation.",
      "Understand what an unfamiliar formula does.",
      "Build a formula for a specific spreadsheet task.",
    ],
    benefits: [
      ["Correct syntax", "Get formulas that work in Excel and Sheets."],
      ["With explanations", "Understand why a formula works, not just what to paste."],
      ["Saves trial and error", "Skip guessing argument order and separators."],
    ],
    faqs: [
      ["Does it work for Google Sheets too?", "Yes — most formulas share syntax across Excel and Google Sheets."],
      ["Can it explain an existing formula?", "Yes, it can break down what a formula does step by step."],
      ["Is it free?", "Yes, Excel Formula is free to use on AltFTool."],
    ],
  },
  "household-electricity-bill": {
    intro:
      "Household Electricity Bill Calculator estimates your monthly power cost from the appliances you use and your local tariff. Add devices, set hours of use, and see where your electricity spend actually goes — useful for budgeting and cutting waste.",
    useCases: [
      "Estimate a monthly electricity bill before it arrives.",
      "See which appliances cost the most to run.",
      "Compare the impact of using a device more or less.",
    ],
    benefits: [
      ["Appliance-level detail", "Break cost down by device and usage hours."],
      ["Your tariff", "Use your own per-unit rate for an accurate estimate."],
      ["Budget-friendly", "Spot savings opportunities before they hit your bill."],
    ],
    faqs: [
      ["How accurate is the estimate?", "It's as accurate as your inputs — using real wattage, hours and your tariff gives a close estimate."],
      ["Can I add multiple appliances?", "Yes, add as many devices as you like to build a full picture."],
      ["Does it store my data?", "No, the calculation runs in your browser."],
    ],
  },
  "life-productivity-score": {
    intro:
      "Life Productivity Score turns a short self-assessment into a single, easy-to-read score across areas like focus, habits, health and balance. It's a lightweight way to reflect on where your time and energy go and spot what to improve.",
    useCases: [
      "Run a quick monthly self-check on your habits and focus.",
      "Identify which life area is dragging your overall balance.",
      "Track your productivity score over time.",
    ],
    benefits: [
      ["Single clear score", "Condense several areas into one number."],
      ["Reflection prompts", "Answer focused questions about your routines."],
      ["Private self-assessment", "Answers stay in your browser."],
    ],
    faqs: [
      ["What does the score measure?", "It combines your answers across areas like focus, habits, health and balance into one indicative score."],
      ["Is this a scientific test?", "No — it's a reflective self-assessment to guide your own thinking, not a clinical measure."],
      ["Are my answers saved anywhere?", "No, they're processed locally in your browser."],
    ],
  },
  "ai-domain-generator": {
    intro:
      "AI Domain Generator suggests brandable, available-sounding domain names from a few keywords about your project. Skip the blank-page struggle and get a varied list of name ideas to register for a startup, product, blog or side project.",
    useCases: [
      "Brainstorm names for a new startup or product.",
      "Find a brandable domain for a blog or portfolio.",
      "Generate variations when your first choice is taken.",
    ],
    benefits: [
      ["Brandable ideas", "Names that sound like real brands, not random strings."],
      ["Keyword-driven", "Suggestions built around your topic."],
      ["Fast ideation", "Get many options in seconds."],
    ],
    faqs: [
      ["Does it check if a domain is available?", "It generates name ideas; confirm availability with a registrar before buying."],
      ["Can I guide the style of names?", "Yes — your keywords shape the suggestions."],
      ["Is it free to use?", "Yes, the generator is free on AltFTool."],
    ],
  },
  "anger-test": {
    intro:
      "Anger Test is a short, private self-reflection questionnaire that gives you a general sense of how you currently experience and express anger. It's designed for personal insight and self-awareness, not diagnosis.",
    useCases: [
      "Reflect on how you've been handling frustration lately.",
      "Get a starting point for thinking about stress management.",
      "Check in with yourself privately, without signing up.",
    ],
    benefits: [
      ["Quick & private", "A short questionnaire that stays in your browser."],
      ["Self-awareness", "A general read to prompt reflection."],
      ["No judgment", "Results are for your own insight only."],
    ],
    faqs: [
      ["Is this a clinical or diagnostic test?", "No. It's a self-reflection tool for general awareness, not a medical or psychological diagnosis. Speak to a professional for real concerns."],
      ["Are my answers stored?", "No — your responses are processed locally and not saved."],
      ["What should I do with my result?", "Use it as a prompt for reflection; for ongoing difficulties, consider talking to a qualified professional."],
    ],
  },
  "browser-fingerprint-visualizer": {
    intro:
      "Browser Fingerprint Visualizer shows the signals your browser exposes — things like screen size, fonts, timezone and hardware hints — that sites can combine to identify you. It's an eye-opening way to understand online tracking and your own digital fingerprint.",
    useCases: [
      "See how identifiable your browser is to websites.",
      "Understand what data trackers can read without cookies.",
      "Compare your fingerprint across browsers or privacy settings.",
    ],
    benefits: [
      ["Transparency", "See the actual signals your browser leaks."],
      ["Privacy education", "Understand fingerprint-based tracking."],
      ["Local analysis", "Signals are read and shown in your browser."],
    ],
    faqs: [
      ["Does this tool track me?", "No — it reads and displays your own browser's signals locally so you can see them; it doesn't store or transmit them."],
      ["What is a browser fingerprint?", "It's the combination of browser and device characteristics that, together, can uniquely identify a visitor even without cookies."],
      ["How can I reduce my fingerprint?", "Privacy-focused browsers and anti-fingerprinting settings can reduce the signals exposed."],
    ],
  },
  "expanse-tacker": {
    intro:
      "Expense Tracker helps you log everyday spending and see where your money goes by category. Add expenses as they happen, watch your totals build, and get a clear picture of your habits — no spreadsheet or signup required.",
    useCases: [
      "Track daily spending against a monthly budget.",
      "See which categories eat up most of your money.",
      "Keep a quick running total of a trip or project's costs.",
    ],
    benefits: [
      ["Category breakdown", "See spending grouped by where it goes."],
      ["Running totals", "Watch your totals update as you add entries."],
      ["Private", "Your entries stay in your browser."],
    ],
    faqs: [
      ["Do I need an account?", "No — start tracking immediately without signing up."],
      ["Can I categorise expenses?", "Yes, assign each expense a category to see where your money goes."],
      ["Is my financial data uploaded?", "No, entries are kept locally in your browser."],
    ],
  },

  "lucky-color-picker": {
    intro: "Lucky Color Picker reveals a lucky color for the day based on your mood, zodiac sign, or pure chance — with the color psychology meaning behind each pick.",
    useCases: [
      "Pick a lucky color to wear or use in a design.",
      "Discover what a color says about your current energy.",
      "Get a random color for inspiration or fun.",
    ],
    benefits: [
      ["Mood & zodiac modes", "Match colors to how you feel or your star sign."],
      ["Meaning included", "See the symbolism behind every color."],
      ["Copy the hex", "Grab the exact hex code in one click."],
    ],
    faqs: [
      ["How is my lucky color chosen?", "It blends your selected mood or zodiac sign with a randomized pick from a curated palette."],
      ["Can I copy the color code?", "Yes — copy the hex value instantly to use anywhere."],
      ["Is this scientifically based?", "It's for fun and inspiration, drawing on color psychology rather than hard science."],
    ],
  },
  "lucky-day-predictor": {
    intro: "Lucky Day Predictor estimates how lucky today is for you using simple numerology from your birth date and the day of the year — plus tailored advice.",
    useCases: [
      "Check if today is a good day to take a chance.",
      "Get a fun daily numerology reading.",
      "See your numerology and life path numbers.",
    ],
    benefits: [
      ["Personalized", "Uses your birth date for a tailored score."],
      ["Daily insight", "A fresh prediction every day."],
      ["Advice included", "Get a tip based on your luck level."],
    ],
    faqs: [
      ["How does the prediction work?", "It combines your birth-date numerology with the day of the year into a 0–100 luck score."],
      ["Is this a real prediction?", "It's a lighthearted numerology game, not a guarantee of events."],
      ["Do I need to sign up?", "No — just enter your birth date and get your reading."],
    ],
  },
  "yes-or-no-oracle": {
    intro: "Yes or No Oracle gives you a mystical yes, no, or maybe answer to any question, with ancient-oracle flair and a history of your past queries.",
    useCases: [
      "Get a quick decision when you're stuck.",
      "Ask a fun yes/no question for entertainment.",
      "Review your past oracle answers.",
    ],
    benefits: [
      ["Three outcomes", "Yes, no, or maybe — with cosmic flavor."],
      ["Question history", "Look back at what you've asked."],
      ["Instant fun", "No setup, just ask and reveal."],
    ],
    faqs: [
      ["How does the oracle decide?", "Answers are randomly weighted toward yes, with some maybe and no for variety."],
      ["Is it serious advice?", "No — it's a playful tool for entertainment, not life decisions."],
      ["Can I see past questions?", "Yes, your recent questions are saved in the session history."],
    ],
  },
  "dice-roller-3d": {
    intro: "Dice Roller (3D) lets you roll virtual dice with smooth animations and supports D4 through D20 — roll one or many at once and track your totals.",
    useCases: [
      "Roll dice for board games or D&D sessions.",
      "Practice probability with multiple dice.",
      "Get a quick random number.",
    ],
    benefits: [
      ["Many dice types", "D4, D6, D8, D10, D12, D20."],
      ["Multi-roll", "Roll up to 10 dice and see the total."],
      ["Roll history", "Review your recent results."],
    ],
    faqs: [
      ["Which dice can I roll?", "Any from D4 to D20, in counts from 1 to 10."],
      ["Is the roll truly random?", "It uses a randomized result each roll for fair outcomes."],
      ["Can I roll several at once?", "Yes — pick a count and see each value plus the total."],
    ],
  },
  "roast-generator": {
    intro: "Roast Generator delivers funny, creative roasts in styles from playful to savage — perfect for joking with friends or breaking the ice.",
    useCases: [
      "Generate a joke roast for a friend.",
      "Pick a tone that fits the moment.",
      "Copy a roast to share in chat.",
    ],
    benefits: [
      ["Multiple styles", "Playful, savage, witty, or dark humor."],
      ["Personalize", "Add a name to target the roast."],
      ["Copy easily", "One click to copy to clipboard."],
    ],
    faqs: [
      ["What roast styles are available?", "Playful, savage, witty, and dark humor — choose what fits."],
      ["Can I aim it at someone?", "Yes, add a name and the roast will call them out."],
      ["Is it meant to be mean?", "No — it's all in good fun for entertainment."],
    ],
  },
  "compliment-generator": {
    intro: "Compliment Generator creates warm, thoughtful compliments across categories like personality, appearance, and kindness — perfect for brightening someone's day.",
    useCases: [
      "Send a kind message to a friend.",
      "Find the right words for someone special.",
      "Save favorites to reuse later.",
    ],
    benefits: [
      ["Category picks", "Personality, appearance, intelligence, and more."],
      ["Favorites", "Save compliments you love."],
      ["Personalize", "Add a name to make it direct."],
    ],
    faqs: [
      ["What categories can I pick?", "Personality, appearance, intelligence, talent, kindness, or general."],
      ["Can I save compliments?", "Yes — favorite them to keep a list."],
      ["Is it free to use?", "Yes, the Compliment Generator is free on AltFTool."],
    ],
  },
  "funny-nickname-generator": {
    intro: "Funny Nickname Generator cooks up hilarious nicknames from themes like food, animals, and superheroes — with optional fancy prefixes and your own name.",
    useCases: [
      "Create a gaming or chat nickname.",
      "Generate a funny name for a friend.",
      "Add a royal or heroic prefix.",
    ],
    benefits: [
      ["Theme variety", "Food, animals, superhero, nerdy, royal, and more."],
      ["Name merge", "Blend with your own name."],
      ["Recent list", "See nicknames you've generated."],
    ],
    faqs: [
      ["What themes are supported?", "Food, animals, superhero, nerdy, royal, silly, savage, and wholesome."],
      ["Can I add a prefix?", "Yes — toggle a Sir, Lady, Captain, or similar title."],
      ["Can I include my name?", "Yes, add your name to personalize the result."],
    ],
  },
  "excuse-generator": {
    intro: "Excuse Generator whips up believable excuses for work, school, social, date, family, or travel situations — so you're never caught short.",
    useCases: [
      "Get a plausible reason for missing something.",
      "Pick the right tone for the situation.",
      "Save excuses you might reuse.",
    ],
    benefits: [
      ["Situation-based", "Work, school, social, date, family, travel."],
      ["Save favorites", "Keep a list of go-tos."],
      ["Copy fast", "One click to clipboard."],
    ],
    faqs: [
      ["Which situations are covered?", "Work, school, social, date, family, and travel."],
      ["Can I save excuses?", "Yes — favorite them to build your list."],
      ["Should I use these for real?", "They're for fun; use your judgment in real life."],
    ],
  },
  "fake-excuse-letter-generator": {
    intro: "Fake Excuse Letter Generator drafts a professional-looking excuse letter for work, school, medical, or family situations with your own details filled in.",
    useCases: [
      "Draft a formal absence note quickly.",
      "Customize with names and dates.",
      "Download or copy the letter.",
    ],
    benefits: [
      ["Template types", "Work, school, medical, family."],
      ["Editable fields", "Add names, dates, and reasons."],
      ["Export", "Copy or download as text."],
    ],
    faqs: [
      ["What letter types can I make?", "Work, school, medical, and family excuse letters."],
      ["Can I download it?", "Yes — copy or download the finished letter as a text file."],
      ["Is it a real document?", "It's a templated draft for fun or practice, not a verified record."],
    ],
  },
  "embarrassing-story-generator": {
    intro: "Embarrassing Story Generator serves up cringe-worthy, relatable stories across school, work, dating, family, social, and random themes — for laughs, not trauma.",
    useCases: [
      "Break the ice with a funny story.",
      "Get a relatable cringe for content.",
      "Save the best ones.",
    ],
    benefits: [
      ["Theme picks", "School, work, dating, family, social, random."],
      ["Save favorites", "Keep your top cringes."],
      ["Copy easily", "Share in one click."],
    ],
    faqs: [
      ["What themes are available?", "School, work, dating, family, social, and random."],
      ["Can I save stories?", "Yes — favorite them to revisit later."],
      ["Are these real stories?", "They're generated for entertainment, not real events."],
    ],
  },
  "pickup-line-generator": {
    intro: "Pickup Line Generator delivers smooth, cheesy, nerdy, funny, or witty lines to break the ice — with favorites so you can keep your best material.",
    useCases: [
      "Get a line for a dating app or chat.",
      "Match the tone to the moment.",
      "Save lines that land.",
    ],
    benefits: [
      ["Style options", "Romantic, cheesy, nerdy, funny, smooth, witty."],
      ["Favorites", "Build your go-to list."],
      ["Copy fast", "One click to clipboard."],
    ],
    faqs: [
      ["What line styles exist?", "Romantic, cheesy, nerdy, funny, smooth, and witty."],
      ["Can I save lines?", "Yes — favorite them to keep your best."],
      ["Will they actually work?", "They're for fun and confidence; results may vary!"],
    ],
  },
  "dad-joke-machine": {
    intro: "Dad Joke Machine is an endless source of groan-worthy puns and wordplay — with a reveal-the-punchline mode and favorites to save your best eye-rollers.",
    useCases: [
      "Get a clean joke for any audience.",
      "Reveal the punchline for maximum effect.",
      "Track jokes told and laughs earned.",
    ],
    benefits: [
      ["Huge library", "Dozens of classic dad jokes."],
      ["Punchline reveal", "Hide then show the punchline."],
      ["Stats & favorites", "Count jokes and save the best."],
    ],
    faqs: [
      ["How many jokes are there?", "A large built-in library of classic dad jokes."],
      ["Can I hide the punchline?", "Yes — reveal it when you're ready."],
      ["Is it family friendly?", "Yes, dad jokes are clean and suitable for all ages."],
    ],
  },
  "sarcasm-generator": {
    intro: "Sarcasm Generator produces perfectly deadpan, sarcastic responses for work, social, family, tech, or general situations — because sometimes words say the opposite.",
    useCases: [
      "Get a witty comeback for a moment.",
      "Match the sarcasm to the context.",
      "Save your favorites.",
    ],
    benefits: [
      ["Context modes", "Work, social, family, tech, general."],
      ["Save favorites", "Keep the best burns."],
      ["Copy fast", "One click to clipboard."],
    ],
    faqs: [
      ["What contexts are covered?", "Work, social, family, tech, and general."],
      ["Can I save responses?", "Yes — favorite them to reuse."],
      ["Is it mean-spirited?", "It's playful sarcasm for entertainment, not personal attacks."],
    ],
  },
  "number-guessing-game": {
    intro: "Number Guessing Game challenges you to find the secret number between 1 and 100 (or wider) with higher/lower hints and a best-score tracker.",
    useCases: [
      "Play a quick logic challenge.",
      "Practice deduction with hints.",
      "Beat your best guess count.",
    ],
    benefits: [
      ["Difficulty levels", "Easy, medium, and hard ranges."],
      ["Helpful hints", "Too high or too low feedback."],
      ["Best score", "Track your fewest attempts."],
    ],
    faqs: [
      ["What difficulties are there?", "Easy (1–50), medium (1–100), hard (1–200) with limited guesses."],
      ["How do hints work?", "You're told if your guess is too high or too low."],
      ["Is there a time limit?", "No — take your time and use the hints."],
    ],
  },
  "memory-card-game": {
    intro: "Memory Card Game is a classic pair-matching challenge with animal, food, sport, and space themes — track your moves, time, and best results.",
    useCases: [
      "Train your memory with a fun game.",
      "Compete on moves and time.",
      "Pick a difficulty that fits.",
    ],
    benefits: [
      ["Themes", "Animals, food, sports, space."],
      ["Difficulty", "Easy, medium, hard pair counts."],
      ["Stats", "Moves, time, and best time."],
    ],
    faqs: [
      ["What difficulties exist?", "Easy (4 pairs), medium (6 pairs), hard (8 pairs)."],
      ["Can I track my time?", "Yes — a timer runs while you play and records your best."],
      ["Is it touch friendly?", "Yes, it works with mouse or touch."],
    ],
  },
  "reaction-time-test": {
    intro: "Reaction Time Test measures how fast you respond when the screen turns green — a simple reflex challenge with your best time and average tracked.",
    useCases: [
      "Test your reflexes for fun.",
      "Compare scores with friends.",
      "See your average reaction.",
    ],
    benefits: [
      ["Instant feedback", "Get your time in milliseconds."],
      ["Best & average", "Track improvement over attempts."],
      ["Simple rules", "Wait for green, then click."],
    ],
    faqs: [
      ["How is reaction time measured?", "From when the screen turns green to your click, in milliseconds."],
      ["What's a good score?", "Under 250ms is excellent; under 200ms is superhuman."],
      ["Can I click too early?", "Yes — clicking before green ends the round as 'too early'."],
    ],
  },
  "fast-click-challenge": {
    intro: "Fast Click Challenge counts how many times you can click in 10 seconds and shows your clicks-per-second (CPS) so you can chase a new personal best.",
    useCases: [
      "Test your clicking speed.",
      "Compete on CPS with friends.",
      "Beat your best score.",
    ],
    benefits: [
      ["10-second timer", "A focused speed burst."],
      ["CPS tracking", "See clicks per second."],
      ["Best record", "Your top CPS is saved."],
    ],
    faqs: [
      ["How long is the challenge?", "10 seconds of non-stop clicking."],
      ["What is CPS?", "Clicks per second — your total clicks divided by 10."],
      ["Can I improve?", "Practice and a good mouse or trackpad help raise your CPS."],
    ],
  },
  "color-match-game": {
    intro: "Color Match Game tests how well you can spot a target color among close shades — and gets harder each round as the differences shrink.",
    useCases: [
      "Test your color perception.",
      "Challenge yourself across rounds.",
      "Build a high score streak.",
    ],
    benefits: [
      ["Rising difficulty", "Shades get closer each round."],
      ["Score & streak", "Earn points and keep streaks."],
      ["10 rounds", "A quick, replayable challenge."],
    ],
    faqs: [
      ["How does difficulty increase?", "The wrong options get closer to the target color each round."],
      ["How many rounds?", "10 rounds, then your final score shows."],
      ["Is it good for designers?", "It's a fun way to gauge color sensitivity, not a professional test."],
    ],
  },
  "whack-a-mole": {
    intro: "Whack-a-Mole is the classic arcade game — whack popping moles for points and dodge the bombs across a fast 30-second round.",
    useCases: [
      "Play a quick reflex game.",
      "Beat your best score.",
      "Test speed and focus.",
    ],
    benefits: [
      ["30-second rounds", "Short, replayable sessions."],
      ["Bombs", "Avoid them for a penalty."],
      ["Best score", "Your top score is saved."],
    ],
    faqs: [
      ["How long is a round?", "30 seconds of popping moles."],
      ["What do bombs do?", "Hitting one costs you points."],
      ["Is it touch friendly?", "Yes — tap or click the moles."],
    ],
  },
  "emoji-quiz": {
    intro: "Emoji Quiz shows a row of emojis and asks you to guess the word, phrase, movie, or activity — with hints and a running score across questions.",
    useCases: [
      "Guess emoji phrases for fun.",
      "Use hints when stuck.",
      "Build a high score.",
    ],
    benefits: [
      ["Many puzzles", "A rotating set of emoji clues."],
      ["Hints", "Reveal a hint if you're stuck."],
      ["Score & streak", "Track correct answers."],
    ],
    faqs: [
      ["How do I answer?", "Type what the emojis represent, then submit."],
      ["Can I get a hint?", "Yes — toggle a hint that describes the answer."],
      ["Is there a time limit?", "No — guess at your own pace."],
    ],
  },
};
