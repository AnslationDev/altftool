const seo = {
  title: "JWT Decoder — Decode JWT Token Header & Payload",
  h1: "JWT Decoder",
  metaDescription:
    "Free JWT decoder: paste a token to read its Base64url header and payload, see each claim's type, and check exp and iat in local time. Nothing is uploaded.",
  intro:
    "The JWT Decoder splits a JSON Web Token on its dots and turns each Base64url segment back into standard Base64 — swapping `-` for `+` and `_` for `/`, then padding with `=` to a multiple of four — before running it through the browser's built-in atob(), a UTF-8 TextDecoder and JSON.parse. Header and payload appear as formatted JSON the instant you paste, alongside a claims table and the exp and iat timestamps converted into your own time zone. It decodes only: the signature is never checked, no key is requested, and because the whole thing runs as JavaScript in the page, the token makes no network request and never leaves your device.",
  useCases: [
    "Work out why an API keeps returning 401 by reading the token's exp against your own clock instead of guessing at the Unix timestamp.",
    "Confirm which algorithm and type an identity provider actually issued — HS256, RS256, typ: JWT — before wiring up verification on the server.",
    "Inspect custom claims such as roles, scopes or tenant IDs in a token copied out of an Authorization header in browser dev tools.",
  ],
  benefits: [
    [
      "Expiry in plain language",
      "exp and iat arrive as Unix seconds; the tool multiplies by 1000, formats them in your local time zone, and adds a relative delta — 'Expires in 3h', 'Expired 12d ago' — rounded to minutes under an hour, hours under a day, days beyond.",
    ],
    [
      "Every claim with its JSON type",
      "The payload table lists each claim next to its type — string, number, boolean, object, array or null — so you can spot a scope that arrived as a string when your code expects an array.",
    ],
    [
      "UTF-8 safe decoding",
      "Segments go through a TextDecoder rather than raw atob() output, so claims containing accented or non-Latin characters decode correctly instead of turning into mojibake.",
    ],
    [
      "Copy or download the result",
      "Copy the header, the payload, or a combined bundle, or save it as altftool-jwt-decoded.json containing the header, the payload and the signature length.",
    ],
  ],
  faqs: [
    [
      "How do I decode a JWT token?",
      "Paste it into the box — the tool splits the string on its dots and Base64url-decodes the first two segments into the header and payload. No key or password is needed, because those two parts of a JWT are only encoded, not encrypted. Output updates as you type, and the Sample button loads a demo HS256 token if you want to see the layout first.",
    ],
    [
      "Is it safe to decode a JWT online?",
      "With this tool the token stays on your machine: decoding uses the browser's own atob() and TextDecoder, there is no fetch, no upload and no server round trip. Still treat any live token as a credential — anyone holding it can use it until it expires — so prefer an expired or test token when you are going to screenshot the result.",
    ],
    [
      "Does this tool verify the JWT signature?",
      "No. It decodes only. The third segment is displayed and its length is reported, but it is never checked against a secret or public key, so a token with a garbage signature still shows its claims. Verify on your server with a library such as jose, jsonwebtoken or PyJWT using the issuer's shared secret or JWKS public key.",
    ],
    [
      "Can I decode a JWT without the secret key?",
      "Yes. The header and payload are Base64url text, not ciphertext, so anyone with the token can read every claim in it. The signing key only proves the token has not been altered — it does not hide the contents. That is why nothing confidential should ever be placed in a JWT payload.",
    ],
    [
      "Why does my token show as expired?",
      "Because the exp claim, read as Unix seconds and multiplied by 1000, is earlier than your device's current time. The status panel then reads 'Expired' and shows how long ago. If your machine's clock is wrong, or the issuing server's clock drifts from it, a valid token can look expired here — check the exact date shown in the Expires row.",
    ],
    [
      "What does the 'Invalid token' message mean?",
      "It appears when the string does not split into at least two dot-separated parts, or when one of those parts is not valid Base64url containing JSON. The usual causes are a partially copied token, an included 'Bearer ' prefix, surrounding quotation marks, or line breaks inserted in the middle by a terminal or log viewer. Leading and trailing whitespace is trimmed automatically.",
    ],
    [
      "Does it work with unsigned or two-part tokens?",
      "Yes. Only the header and payload are required, so a token with alg set to none and nothing after the second dot decodes normally and the signature row reads 'Unsigned'. Tokens with a third segment show its length instead.",
    ],
    [
      "Is this JWT decoder free?",
      "Yes — free, with no account, no sign-in and no usage limit. The page is a static tool and the decode is a handful of lines of JavaScript running in your own browser tab, so there is nothing to meter.",
    ],
  ],
  steps: [
    "Paste the JSON Web Token into the Paste JWT box. The status panel, claims overview and JSON views update as you type; the Sample button loads a demo token and Clear empties the field.",
    "Read the Claims overview for the algorithm, type, subject, issued-at date, expiry date, relative expiry and signature length, then scroll to the Payload claims table to see every claim with its JSON type and value.",
    "Copy the header, the payload or the combined decoded bundle to your clipboard, or use Download JSON to save it as altftool-jwt-decoded.json.",
  ],
};

export default seo;
