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
};
