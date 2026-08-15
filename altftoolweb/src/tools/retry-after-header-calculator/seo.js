const seo = {
  title: "Retry-After Calculator: delay-seconds",
  metaDescription:
    "Build an RFC 9110 Retry-After value in both forms, IMF-fixdate in GMT and whole seconds, with the 429/503 backoff table and a parser check.",
  steps: [
    "Choose \"Wait a fixed amount\" and enter \"Wait\" with a \"Unit\" of seconds, minutes, hours or days, or choose \"Come back at a set time\" and set \"Retry at (your local time)\".",
    "Pick the \"Response status\", then fill \"Base delay (seconds)\", \"Multiplier per attempt\", \"Cap (seconds)\" and a \"Jitter strategy\" for the backoff schedule.",
    "\"Send this header\" shows the delay-seconds form and the HTTP-date form side by side — press \"Copy result\", or paste an existing value into \"Check a value you already have\" to see how a client would read it.",
  ],
  intro:
    "This calculator turns a wait you want to impose into a Retry-After field value that conforms to RFC 9110 section 10.2.3, where the grammar is strictly an HTTP-date or delay-seconds = 1*DIGIT. It renders both forms side by side, formats the date as an IMF-fixdate in GMT as required for senders by RFC 9110 section 5.6.7, and builds the exponential backoff table behind a 429 or 503 so each successive rejection pushes the client further out. It also parses a value you already have and tells you whether a client would accept it.",
  useCases: [
    "An API team adding 429 responses to a rate limiter and needing the exact number of seconds until the token bucket refills, expressed as digits with no unit suffix.",
    "A platform engineer announcing a maintenance window that ends at 02:00 UTC and wanting the IMF-fixdate string to put on the 503 responses served by the holding page.",
    "Debugging a client that ignores your throttling, by pasting the value you send and confirming it is not something malformed like \"120s\" or \"2 minutes\".",
  ],
  benefits: [
    ["Rejects malformed values", "Catches decimals, signs and unit suffixes that silently make the header unparseable."],
    ["Correct date format", "Emits IMF-fixdate in GMT with fixed English day and month names, not a locale-dependent string."],
    ["Backoff you can ship", "Shows the capped, jittered schedule so a retry storm spreads out instead of arriving in lockstep."],
  ],
  faqs: [
    [
      "What is the correct format for the Retry-After header?",
      "Either a non-negative whole number of seconds, such as \"Retry-After: 120\", or an HTTP-date, such as \"Retry-After: Wed, 21 Oct 2015 07:28:00 GMT\". RFC 9110 defines delay-seconds as 1*DIGIT, so there is no unit suffix, no decimal point and no minus sign. A sender generating the date form must use IMF-fixdate in GMT.",
    ],
    [
      "Should Retry-After be in seconds or a date?",
      "Prefer seconds. A count of seconds is immune to clock skew between your server and the client, while a date is only correct if both clocks agree. Use the date form when you are announcing a fixed maintenance window whose end time is genuinely known in wall-clock terms.",
    ],
    [
      "Is Retry-After required on a 429 response?",
      "No. RFC 6585 section 4, which defines 429 Too Many Requests, says the response can include Retry-After, not that it must. Sending it is strongly recommended, because without it a client has no signal other than guessing and will usually retry too soon.",
    ],
    [
      "Does Retry-After: 0 mean anything?",
      "Yes — it is valid and means the client may retry immediately. Because delay-seconds is defined as one or more digits, zero is expressible but a negative value is not. If your target time has already passed, clamp to 0 rather than sending a negative number, which a conforming client will discard as unparseable.",
    ],
  ],
};

export default seo;
