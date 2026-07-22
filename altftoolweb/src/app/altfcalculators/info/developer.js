const info = {
  "json-formatter": {
    intro: [
      "The JSON formatter turns raw JSON into a clean, readable, indented layout (beautify) or strips every optional space and newline to make it as small as possible (minify). It first parses the text so it only ever outputs valid JSON.",
      "Pretty-printing makes JSON easy to read and diff in code review; minifying shrinks payloads for APIs, config files and network transfer where whitespace is wasted bytes.",
    ],
    howToUse: [
      "Paste or type your JSON into the input box.",
      "Press Beautify to indent it, or Minify to collapse it onto one line.",
      "For beautify, choose 2 spaces, 4 spaces or a tab for indentation.",
      "Copy the formatted result with the copy button.",
    ],
    goodToKnow: [
      "Beautifying and minifying never change the data — object key order, numbers and strings stay exactly the same, only whitespace differs.",
      "The tool parses with JSON.parse, so it rejects JSON5 extras like comments, trailing commas or single-quoted strings.",
      "Object keys keep their original order; JSON itself does not define key ordering, so tools are free to preserve insertion order as this one does.",
    ],
    faqs: [
      { q: "Does formatting change my data?", a: "No. Both actions parse the JSON and re-serialise it, so values, types and key order are preserved — only indentation and spacing change." },
      { q: "Why does it reject my JSON?", a: "Common causes are trailing commas, comments, single quotes instead of double quotes, or unquoted keys. Strict JSON allows none of those; the JSON validator will point to the exact position." },
      { q: "Which indentation should I use?", a: "Two spaces is the most common convention for JSON and web config; four spaces or a tab can be easier to read for deeply nested data. It is purely cosmetic." },
    ],
  },

  "json-validator": {
    intro: [
      "The JSON validator checks whether a block of text is syntactically valid JSON. It parses your input live and either confirms it is valid — with a short summary of the top-level type and keys — or reports the exact error and where it occurred.",
      "It is the fastest way to catch the small mistakes that break JSON: a missing comma, an extra trailing comma, an unclosed bracket or a stray quote.",
    ],
    howToUse: [
      "Paste your JSON into the box.",
      "Read the live result: a green confirmation for valid JSON or a red error for invalid.",
      "If invalid, use the reported line and column to jump to the problem.",
      "Fix the issue and watch the status update as you type.",
    ],
    goodToKnow: [
      "Valid JSON allows only double-quoted strings and keys, no comments, and no trailing commas — rules stricter than JavaScript object literals.",
      "The top-level value can be an object, array, string, number, boolean or null; it does not have to be an object.",
      "Error positions come from the browser's own JSON engine, so the reported line and column match what your runtime would see.",
    ],
    faqs: [
      { q: "What is the most common JSON error?", a: "A trailing comma after the last item in an object or array, and using single quotes instead of double quotes. Both are legal in JavaScript but invalid in JSON." },
      { q: "Is a bare number or string valid JSON?", a: "Yes. Since JSON (RFC 8259), any value — including 42, \"hello\", true or null on its own — is valid JSON, not just objects and arrays." },
      { q: "Does valid mean my data is correct?", a: "It means the syntax is correct and parseable. It does not check that fields match a schema or contain the values your application expects." },
    ],
  },

  "password-generator": {
    intro: [
      "The password generator creates strong, random passwords from the character sets you choose — uppercase, lowercase, numbers and symbols. Randomness comes from the browser's cryptographic generator (crypto.getRandomValues), not the predictable Math.random.",
      "Longer passwords drawn from a larger character pool are exponentially harder to guess or brute-force. The tool shows an entropy estimate so you can see how strong each password really is.",
    ],
    formula: {
      expression: "entropy (bits) = length × log₂(pool size)",
      where: [
        ["length", "number of characters in the password"],
        ["pool size", "total distinct characters available from the selected sets"],
        ["entropy", "bits of randomness — each added bit doubles the guessing effort"],
      ],
      note: "Pool sizes: lowercase 26, uppercase 26, digits 10, symbols 24. A 16-character password from all four sets ≈ 16 × log₂(86) ≈ 103 bits.",
    },
    howToUse: [
      "Set the length between 4 and 64 characters.",
      "Toggle which character sets to include (at least one stays on).",
      "A new password appears automatically; press Generate for another.",
      "Copy it with the copy button and store it in a password manager.",
    ],
    goodToKnow: [
      "Every password includes at least one character from each selected set, then the characters are shuffled so position is not predictable.",
      "As a rough guide, under 28 bits is very weak, 60–127 bits is strong, and 128+ bits is very strong against offline attacks.",
      "Length beats complexity: a longer password from fewer sets often has more entropy than a short one packed with symbols.",
      "Passwords are generated entirely in your browser and are never sent anywhere.",
    ],
    faqs: [
      { q: "Is this random enough to be safe?", a: "Yes. It uses crypto.getRandomValues, the same cryptographically secure source browsers expose for keys and tokens, with rejection sampling to avoid bias toward certain characters." },
      { q: "How long should my password be?", a: "For important accounts aim for 16 characters or more, which gives roughly 100+ bits of entropy — far beyond what brute force can reach. Longer is always better." },
      { q: "Should I reuse a generated password?", a: "No. Generate a unique password per account and keep them in a password manager, so a breach of one service never exposes the others." },
    ],
  },

  "base64-encoder-decoder": {
    intro: [
      "Base64 encoding represents arbitrary text or binary data using only 64 printable ASCII characters (A–Z, a–z, 0–9, + and /). It is how binary content is safely carried through systems that expect text, such as email, JSON, data URLs and HTTP headers.",
      "This tool encodes text to Base64 and decodes Base64 back to text, handling full Unicode correctly by encoding through UTF-8 first.",
    ],
    howToUse: [
      "Choose Encode or Decode.",
      "Paste your text or Base64 string into the box.",
      "Read the converted output below, updated live.",
      "Copy the result with the copy button.",
    ],
    goodToKnow: [
      "Base64 grows data by about 33%: every 3 bytes become 4 characters, and output length is padded with = to a multiple of four.",
      "Encoding is not encryption — Base64 is trivially reversible and provides no security, only safe transport.",
      "This tool is UTF-8 aware, so accented letters, emoji and other non-ASCII characters round-trip correctly.",
    ],
    faqs: [
      { q: "Is Base64 a form of encryption?", a: "No. It is an encoding, fully reversible by anyone. It hides nothing and adds no security — use it for safe transport of data, never to protect secrets." },
      { q: "Why is the encoded text longer than the original?", a: "Base64 uses 4 output characters for every 3 input bytes, a roughly 33% size increase, plus '=' padding to align to a multiple of four characters." },
      { q: "Why does decoding sometimes fail?", a: "The input must be valid Base64: correct alphabet, correct length and padding. Extra spaces, line breaks in the wrong place, or URL-safe characters (- and _) can cause errors." },
    ],
  },

  "url-encoder-decoder": {
    intro: [
      "URL (percent) encoding replaces characters that are unsafe or reserved in a URL — spaces, &, ?, =, #, non-ASCII letters — with a % followed by their hexadecimal byte values. It lets you put arbitrary text safely inside a web address or query string.",
      "This tool encodes and decodes both ways, and offers two scopes: Component escapes reserved characters too (for a single query value), while Full URI leaves the structural characters of a complete URL intact.",
    ],
    howToUse: [
      "Choose Encode or Decode.",
      "Pick the scope: Component for a single value, or Full URI for a whole address.",
      "Type or paste your text; the result updates live.",
      "Copy the encoded or decoded output.",
    ],
    goodToKnow: [
      "Component mode (encodeURIComponent) escapes / ? : @ & = + $ # and space, so it is right for individual query-string values.",
      "Full URI mode (encodeURI) preserves those reserved characters, so it is meant for encoding an already-structured URL, not a lone value.",
      "A space becomes %20; in the query string it is sometimes shown as + instead, an older application/x-www-form-urlencoded convention.",
    ],
    faqs: [
      { q: "Component or Full URI — which do I need?", a: "Use Component when encoding one piece that goes inside a URL, like a search term. Use Full URI when you have a complete URL and only want illegal characters escaped without breaking its :// ? & structure." },
      { q: "Why is a space sometimes %20 and sometimes +?", a: "Percent-encoding uses %20. The + sign for a space is a separate convention from HTML form submission (application/x-www-form-urlencoded) and only applies inside query strings." },
      { q: "Does decoding always succeed?", a: "Only if the input is well-formed. A lone % or an incomplete escape like %2 is invalid and will report a malformed-URI error." },
    ],
  },

  "uuid-generator": {
    intro: [
      "A UUID (Universally Unique Identifier) is a 128-bit value written as 32 hexadecimal digits in five groups, like 550e8400-e29b-41d4-a716-446655440000. This tool generates version 4 UUIDs, whose bits are almost entirely random.",
      "UUIDs let independent systems create identifiers without a central authority while staying practically guaranteed not to collide — ideal for database keys, request IDs, file names and distributed systems.",
    ],
    howToUse: [
      "Choose how many UUIDs you need (1 to 50).",
      "Press Generate to create a fresh batch.",
      "Copy an individual UUID, or use 'Copy all' to grab the whole list.",
      "Generate again any time for new values.",
    ],
    goodToKnow: [
      "A version 4 UUID has 122 random bits (6 bits are fixed for the version and variant), giving about 5.3 × 10³⁶ possible values.",
      "The 13th hex digit is always 4 (the version) and the 17th is 8, 9, a or b (the variant) — a quick way to spot a v4 UUID.",
      "Collisions are so unlikely they are ignored in practice: you would need to generate billions of UUIDs per second for many years to have any realistic chance of a duplicate.",
      "These are generated in your browser using its cryptographic random source; nothing is sent to a server.",
    ],
    faqs: [
      { q: "Can two UUIDs ever be the same?", a: "In theory yes, but the probability is negligible. With 122 random bits, you could generate 1 billion per second for 85 years and still have only about a 50% chance of a single collision." },
      { q: "What is the difference between the UUID versions?", a: "Version 4 is random (used here). Version 1 is time and MAC-address based, and versions 3/5 are hashes of a name. Version 4 is the most common when you just need a unique random ID." },
      { q: "Are UUIDs good database keys?", a: "They are great for uniqueness and for generating IDs client-side, but their randomness can fragment index locality. Some teams use ordered variants (like UUIDv7) for better database performance." },
    ],
  },

  "jwt-decoder": {
    intro: [
      "A JWT (JSON Web Token) is a compact, URL-safe token made of three base64url-encoded parts separated by dots: a header, a payload of claims, and a signature. This tool splits the token and decodes the header and payload into readable JSON.",
      "It is handy for inspecting what an authentication token contains — the algorithm, the subject, and timing claims like when it was issued and when it expires.",
    ],
    howToUse: [
      "Paste a JWT (header.payload.signature) into the box.",
      "Read the decoded header and payload as formatted JSON.",
      "Check the human-readable issued / expires / not-before dates if present.",
      "Copy either section with its copy button.",
    ],
    goodToKnow: [
      "The token is only decoded, not verified. This tool does not check the signature, so it cannot tell you whether the token is authentic or tampered with.",
      "The payload is not encrypted — anyone can read it. Never put passwords or secrets in a JWT payload.",
      "Common timing claims are exp (expiry), iat (issued at) and nbf (not before), all stored as Unix timestamps in seconds.",
    ],
    faqs: [
      { q: "Does this verify the token's signature?", a: "No. It only decodes the header and payload for inspection. Verifying authenticity requires the signing secret or public key and must be done server-side — never trust an unverified token for authorization." },
      { q: "Is the data inside a JWT secret?", a: "No. The payload is merely base64url-encoded, so it is fully readable by anyone who holds the token. The signature protects integrity, not confidentiality." },
      { q: "Why does my token look expired?", a: "If the payload's exp claim (a Unix timestamp) is earlier than the current time, the token is past its expiry. The tool converts exp/iat/nbf to readable dates so you can check." },
    ],
  },

  "qr-code-generator": {
    intro: [
      "This tool turns any text or URL into a QR code — a two-dimensional barcode that phone cameras and scanners can read instantly. It is the quickest way to hand a link, Wi-Fi detail, contact card or message to a device without typing.",
      "The code is drawn entirely in your browser as you type, so nothing you enter leaves your device.",
    ],
    howToUse: [
      "Type or paste the text or URL you want to encode.",
      "Choose the pixel size that suits your use (screen or print).",
      "Optionally change the foreground color.",
      "Scan it with a phone camera, or screenshot it to share or print.",
    ],
    goodToKnow: [
      "More text makes a denser code with more modules; short URLs scan fastest and print most reliably.",
      "Keep strong contrast — a dark foreground on a white background — or scanners may struggle. Very light colors can fail to read.",
      "QR codes include error correction, so they still scan when a portion is dirty, damaged or covered by a small logo.",
      "The QR code standard is open (originally from Denso Wave), so codes you generate work with any compliant scanner.",
    ],
    faqs: [
      { q: "Is there a limit to how much text I can encode?", a: "QR codes can technically hold up to a few thousand characters, but the more you add the denser and harder to scan the code becomes. For links, keep the URL short." },
      { q: "Can I change the colors?", a: "Yes, you can set the foreground color. Just keep a high contrast against the white background — light or low-contrast codes often fail to scan." },
      { q: "Will the QR code expire?", a: "No. The code is a direct encoding of your text, so it works forever as long as the destination (for a URL) still exists. There is no tracking or redirect involved." },
    ],
  },

  "timestamp-converter": {
    intro: [
      "The timestamp converter translates between Unix timestamps and human-readable dates, both ways. A Unix timestamp counts the seconds (or milliseconds) elapsed since the Unix epoch — midnight UTC on 1 January 1970.",
      "Give it a timestamp and it shows the local, UTC and ISO 8601 dates; give it a date and it returns the timestamp in seconds and milliseconds. It also shows the current time so you always have a reference.",
    ],
    formula: {
      expression: "seconds = ⌊milliseconds ÷ 1000⌋   •   date = epoch + seconds",
      where: [
        ["epoch", "the reference point: 1970-01-01 00:00:00 UTC"],
        ["seconds", "whole seconds elapsed since the epoch (a Unix timestamp)"],
        ["milliseconds", "seconds × 1000, the resolution JavaScript uses internally"],
      ],
      note: "Unix time ignores leap seconds and is measured in UTC, so a timestamp is the same instant everywhere in the world.",
    },
    howToUse: [
      "To decode: enter a Unix timestamp and pick seconds or milliseconds.",
      "Read the resulting local time, UTC and ISO 8601 strings.",
      "To encode: pick a date and time to get its timestamp in seconds and milliseconds.",
      "Use the current timestamp shown at the top as a live reference.",
    ],
    goodToKnow: [
      "Unix timestamps are in UTC, so the same value represents one exact instant regardless of your time zone; only the displayed local time shifts.",
      "Programming languages differ on units: Unix tools and most APIs use seconds, while JavaScript's Date.now() uses milliseconds.",
      "The classic 32-bit signed timestamp overflows on 19 January 2038 (the 'Year 2038 problem'); modern systems use 64-bit values to avoid it.",
      "Leap seconds are not counted in Unix time, which keeps the arithmetic simple.",
    ],
    faqs: [
      { q: "Seconds or milliseconds — which should I use?", a: "It depends on the source. Unix command-line tools, databases and most REST APIs use seconds; JavaScript and many browser APIs use milliseconds. Pick the unit that matches where your number came from." },
      { q: "Why is the UTC time different from my local time?", a: "A timestamp marks one instant in UTC. Your local time is that instant shifted by your time-zone offset, so the two differ by however many hours your zone is from UTC." },
      { q: "What is the Year 2038 problem?", a: "Systems storing Unix time in a signed 32-bit integer can only count to 03:14:07 UTC on 19 January 2038, after which the value overflows. Using 64-bit timestamps fixes it for practical eternity." },
    ],
  },

  "regex-tester": {
    intro: [
      "The regex tester lets you build and try a regular expression against sample text and see every match instantly. It uses the JavaScript regular-expression engine, so what you see here matches how the pattern behaves in JavaScript code.",
      "For each match it shows the matched text, its position in the string, and any captured groups — making it easy to develop and debug patterns for search, validation and extraction.",
    ],
    howToUse: [
      "Type your pattern (the body only, without the surrounding slashes).",
      "Toggle the flags you need: g (all matches), i (ignore case), m (multiline), s (dotall).",
      "Enter or paste the text to test against.",
      "Read the match count and the table of matches with their indices and groups.",
    ],
    goodToKnow: [
      "The g flag returns every match; without it the tester shows only the first match, mirroring JavaScript's exec/matchAll behaviour.",
      "i makes matching case-insensitive, m makes ^ and $ match at line breaks, and s lets the dot (.) also match newline characters.",
      "Parentheses create capture groups, shown per match; (?<name>…) creates a named group, displayed by its name.",
      "This is the JavaScript (ECMAScript) flavour — some syntax from PCRE, Python or other engines may behave differently or be unsupported.",
    ],
    faqs: [
      { q: "Do I include the slashes around my pattern?", a: "No. Enter only the pattern body, for example \\d{3}-\\d{4}. Choose the flags with the toggle buttons instead of writing them after a closing slash." },
      { q: "Why do I only see one match?", a: "Turn on the g (global) flag. Without it, a regular expression matches just the first occurrence; with g the tester lists every match in the text." },
      { q: "What is the difference between the m and s flags?", a: "m (multiline) changes ^ and $ to match at the start and end of each line, not just the whole string. s (dotall) makes the dot match newline characters too. They are independent." },
    ],
  },
};

export default info;
