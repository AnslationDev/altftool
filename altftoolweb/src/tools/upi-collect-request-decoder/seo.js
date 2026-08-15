const seo = {
  title: "UPI Collect Request Decoder: Read It Before",
  steps: [
    "Paste the upi:// URI or QR text into the \"UPI URI or QR text\" box, or press Example to load a sample payload.",
    "Read the Decoded request panel: the action label, Payee, Payee UPI ID and Stated amount, plus warnings for duplicate or invisible-Unicode parameters.",
    "Press Copy report for the full field list, or Clear to wipe the payload — decoding happens in this tab with no network lookup.",
  ],
  intro:
    "The UPI Collect Request Decoder parses a pasted upi:// URI in your browser and shows you exactly what it would do — whether it is a collect request that debits you, a pay intent that credits someone else, or a mandate that authorises recurring debits — along with every parameter it carries. It reads the 17 standard UPI fields (pa, pn, am, mam, cu, tn, tr, tid, mc, mid, msid, mtid, mode, orgid, purpose, url, sign), flags anything unrecognised, and prints a plain-language warning for each risk it finds. It is for anyone who has been sent a payment link or QR text and wants to read it before opening a payment app.",
  useCases: [
    "Someone on a marketplace chat sends you a 'refund link' — you paste the upi:// text and see the action is collect, which takes money out rather than paying it in.",
    "A QR sticker at a shop scans to a long string and you want to check the payee UPI ID and the fixed amount before you tap approve.",
    "A merchant support team is debugging why an intent opens with a blank amount, and needs to see whether am is missing, malformed, or contradicted by mam.",
  ],
  benefits: [
    [
      "Names the action, not just the fields",
      "collect and request are labelled as debits, pay as an outgoing payment, and mandate as a recurring authorisation, each with the specific consequence spelled out.",
    ],
    [
      "Catches payloads built to mislead",
      "It flags duplicate parameters that different apps may resolve differently, and invisible or bidirectional Unicode controls (U+200B–U+200F, U+202A–U+202E, U+2066–U+2069, U+FEFF) that can make a payee ID render backwards.",
    ],
    [
      "Validates the money fields",
      "The payee ID is checked against the name@provider pattern, the amount must be a positive number with at most two decimal places, currency other than INR is called out, and a mam greater than am is reported as an inconsistent payload.",
    ],
  ],
  faqs: [
    [
      "Does approving a UPI collect request send me money or take money?",
      "It takes money from your account. A collect request asks you to pay the person who sent it, so approving it with your UPI PIN debits you — receiving money never requires you to enter a UPI PIN.",
    ],
    [
      "What do pa, pn, am, tr and tn mean in a UPI link?",
      "pa is the payee UPI ID, pn the payee name, am the amount, tr the transaction reference and tn the transaction note. The decoder labels all 17 recognised parameters and lists anything outside that set as an unrecognised field rather than guessing at its meaning.",
    ],
    [
      "Can this tool tell me if a UPI payment request is a scam?",
      "No — it explains the payload's format and highlights risky patterns, but it cannot verify who owns a UPI ID. Treat it as informational: even when a payload decodes cleanly, confirm the payee and amount inside your own bank or UPI app before approving anything, and report suspected fraud to your bank.",
    ],
    [
      "Why does it say the signature is not verified?",
      "The decoder only displays the sign field; it performs no cryptographic check of the signer. It parses the URI locally in your browser and makes no network calls, so it has no issuer keys to validate a signature against.",
    ],
  ],
};

export default seo;
