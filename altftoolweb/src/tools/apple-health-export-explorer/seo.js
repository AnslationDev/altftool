const seo = {
  title: "Apple Health export.xml: Summarize Records by Type",
  steps: [
    "Paste your Apple Health export.xml text into the 'Apple Health export.xml content or Record lines' box, or load the 'Two records' example.",
    "Set 'Maximum records to summarize' — the default is 5,000 and the field accepts up to 50,000 Record elements.",
    "Read the Type / Count / Unit / Mean / Min / Max table, then use Copy or Download to save it as apple-health-export-explorer.txt.",
  ],
  metaDescription:
    "Explore an Apple Health export locally with readable summaries and charts, while keeping the selected health data in the browser.",
  intro:
    "The Apple Health Export Explorer reads the <Record> elements out of an Apple Health export.xml and summarizes them by data type — count, unit, mean, minimum and maximum for each — so you can see what is actually inside a multi-hundred-megabyte export without opening it in a spreadsheet. It strips the HKQuantityTypeIdentifier / HKCategoryTypeIdentifier prefix so types read as StepCount or HeartRate rather than raw keys, and it processes up to 50,000 records per run (5,000 by default). It runs on text you paste, so the export never leaves your device.",
  useCases: [
    "You requested your Apple Health export to share readings with a doctor and want to check which metrics it actually contains, and over what value range, before sending anything.",
    "You are building an app that ingests Apple Health XML and need a quick view of the type names and units present in a real export so you can write the right parser.",
    "Your step count looks wrong in a third-party app, so you paste the StepCount Record lines and compare the min, max and mean the raw file reports against what the app shows.",
  ],
  benefits: [
    ["Type-level summary, not a raw dump", "Records are grouped by health type with count, unit, mean to four decimal places, and min/max, sorted with the most numerous type first."],
    ["Readable type names", "The HK…Identifier prefix is stripped automatically, so HKQuantityTypeIdentifierHeartRate is shown simply as HeartRate."],
    ["Handles partial pastes", "It scans for <Record …/> elements anywhere in the text, so a fragment copied out of a huge export works as well as a whole file section."],
  ],
  faqs: [
    [
      "How many records can it summarize at once?",
      "Up to 50,000 Record elements per run, with a default limit of 5,000. Records past the limit are ignored rather than truncating the file, so raise the limit if the count reported back is lower than you expected.",
    ],
    [
      "Where do I get the export.xml file?",
      "In the Health app on iPhone, open your profile and choose the option to export all health data; iOS produces a zip archive containing export.xml. Unzip it, open export.xml in a text editor, and paste the section you want to inspect.",
    ],
    [
      "What parts of the export are not covered?",
      "Only <Record> elements and their attributes are read. Nested workout and route data, clinical records, provenance and device metadata, and timezone semantics are not parsed, so the mean and range are simple statistics over the value attribute, not clinically adjusted figures.",
    ],
    [
      "Can this tell me whether my readings are healthy?",
      "No — it reports what your file contains and nothing more. The mean, min and max are arithmetic summaries of raw sensor values, with no interpretation of context, accuracy or health meaning; discuss anything concerning with a clinician who can see the full picture.",
    ],
  ],
};

export default seo;
