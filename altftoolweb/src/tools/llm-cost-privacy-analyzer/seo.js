const seo = {
  title: "LLM Cost & Privacy Analyzer for API Usage Logs",
  metaDescription:
    "Total tokens per model from a JSON, JSONL, CSV or TSV log up to 8 MB, price them with your own per-million rates, and count PII patterns in prompts.",
  steps: [
    "Drop a usage log on the Upload File dropzone or switch to the Paste Log Text tab — .json, .jsonl, .csv, .tsv and .txt are accepted up to 8 MB.",
    "In Token Pricing Rates, replace the example presets with your own contracted rates per million tokens; a \"*\" entry prices any model not named.",
    "Read the per-model cost table and the counts-only privacy findings, then take a JSON Summary, CSV Report or Markdown Summary that excludes prompt content and model names.",
  ],
  intro:
    "LLM Cost & Privacy Analyzer reads an AI usage log — JSON, JSONL, CSV or TSV — in the browser, totals input and output tokens per model, and prices them with rate tables you supply yourself, using cost = (tokens ÷ 1,000,000) × your rate per million. Alongside the cost breakdown it scans message and prompt fields for personal-data patterns such as email addresses, phone numbers, payment cards, IP addresses and API keys, and reports only counts per category — never the matched values. It is built for the engineer or finance owner who has an export of API usage and needs a spend figure and a privacy sanity check without sending that log to a third party.",
  useCases: [
    "Reconciling a provider invoice against your own request log by pasting your contracted per-million rates and comparing the totals model by model",
    "Checking whether prompts shipped to an LLM contain personal data before an audit, by seeing how many email, phone or card patterns the message fields contain",
    "Working out which model is eating the budget when one service calls four of them, using the per-model table sorted by total tokens",
  ],
  benefits: [
    ["No pricing assumptions baked in", "Costs come only from rate tables you enter, so the numbers reflect your contract rather than a list price that changed last quarter."],
    ["Token fields found wherever they hide", "It looks for usage.input_tokens, prompt_tokens, inputTokens and a dozen other spellings, and flattens nested records up to five levels deep."],
    ["Privacy findings are counts only", "The scan reports how many matches of each category it saw; the exported report deliberately excludes model names, log content and the matched strings."],
  ],
  faqs: [
    [
      "How is the estimated cost calculated?",
      "Each record's cost is (input tokens ÷ 1,000,000) × your input rate plus (output tokens ÷ 1,000,000) × your output rate. Rates come from a JSON table you paste, with a \"*\" entry acting as the fallback for any model not listed by name; a record with tokens it cannot allocate to input or output is left unpriced rather than guessed.",
    ],
    [
      "How big a log can it handle?",
      "Up to 8 MiB of source text and 5,000 records, with the privacy scan reading the first 500,000 characters of content fields. If either limit is hit the results are marked as truncated so you know the totals cover only part of the file.",
    ],
    [
      "What counts as a privacy signal?",
      "Content fields — content, prompt, message, input, text, requestBody and responseBody — are pattern-matched for categories including email addresses, phone numbers, payment cards, bank and IBAN numbers, national IDs, IP and MAC addresses, and keys or tokens. Pattern matching finds likely instances, not all of them, so a zero count is not proof a log is clean.",
    ],
    [
      "Are the built-in rate presets current pricing?",
      "No — the preset buttons only pre-fill the rate table with example figures so you can see the format. Provider pricing changes often, so replace them with your own contracted rates per million tokens before trusting any total.",
    ],
  ],
};

export default seo;
