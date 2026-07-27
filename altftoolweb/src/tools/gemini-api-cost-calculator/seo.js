const seo = {
  intro:
    "This calculator converts a Gemini API request's token mix into a dollar figure using Google's per-million-token billing: cost = (input tokens ÷ 1,000,000) × input rate + (output tokens ÷ 1,000,000) × output rate. It also applies the two rules that trip up back-of-envelope estimates — the long-context tier that raises both the input and output rate for the whole request once a prompt crosses the threshold, and the context-cache discount that bills reused tokens at a quarter of the standard input rate plus an hourly storage charge. Images and audio are converted to tokens first, at 258 tokens per 768px image tile and 32 tokens per second of audio.",
  useCases: [
    "Size the monthly bill for a Gemini 2.5 Flash feature before shipping it, from measured average prompt and completion lengths.",
    "Decide whether a 300,000-token document prompt on Gemini 2.5 Pro is worth the long-context tier or should be chunked below the threshold.",
    "Check whether an explicit context cache actually pays for itself once the per-hour storage charge is counted against the request volume.",
  ],
  benefits: [
    ["Tier-aware", "Switches to the long-context rate for the entire request, the way Google bills it, instead of pro-rating."],
    ["Multimodal in tokens", "Images and audio are tokenised before pricing, so a vision or voice feature is costed correctly."],
    ["Editable rates", "Every per-million-token rate is an input, so the tool stays accurate when list prices move."],
  ],
  faqs: [
    [
      "How is Gemini API pricing calculated?",
      "Per million tokens, priced separately for input and output. Multiply your prompt tokens by the input rate per million and your generated tokens by the output rate per million, then add them. Output is normally several times more expensive than input, so completion length usually drives the bill more than prompt length.",
    ],
    [
      "What is the long context price tier in Gemini?",
      "On Gemini 2.5 Pro the rate steps up once a single prompt exceeds 200,000 tokens, and the higher rate applies to the entire request rather than only the tokens above the line. Keeping a prompt just under that threshold, or splitting it, can roughly halve the input cost of that call.",
    ],
    [
      "How much does context caching save on Gemini?",
      "Cached input tokens are billed at about a quarter of the standard input rate, but the cache also carries a storage charge per million tokens per hour it stays alive. Caching pays off when the same large context is reused across many requests in a short window; at low request volume the storage charge can exceed the token saving.",
    ],
    [
      "How many tokens does an image cost in the Gemini API?",
      "An image whose longest side is 384 pixels or less counts as a single 258-token tile. Larger images are cropped into 768×768 tiles that each cost 258 tokens, so a large screenshot can easily cost a thousand tokens or more. Audio is billed at 32 tokens per second.",
    ],
  ],
};

export default seo;
