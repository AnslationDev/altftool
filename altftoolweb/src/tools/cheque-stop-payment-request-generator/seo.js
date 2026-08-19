const seo = {
  title: "Cheque Stop Payment Letter Generator, India",
  metaDescription:
    "Draft a stop payment instruction with the 6-digit cheque number and IFSC checked, the 3-month validity date worked out and the fee totalled with tax.",
  steps: [
    "Fill the Account block — account holder name, account number, bank, branch, IFSC in the HDFC0001234 form, and MICR.",
    "Under Cheque, enter the 6-digit cheque number, the 'Date written on the cheque', the 'Date of this request' and the amount, or tick 'Stop a range of cheque numbers, not just one'.",
    "'Total stop payment charge' and the ready-to-send Stop payment letter appear below, with warnings if the cheque is already stale; press Copy letter.",
  ],
  intro:
    "A stop payment request is the written instruction telling your bank not to honour a cheque you have already issued. This generator writes that letter with the details a branch actually needs, checks the cheque number against the 6-digit CTS-2010 format and the IFSC against its 11-character pattern, works out the date the cheque stops being presentable under the RBI's three-month validity rule, and totals the stop payment charge with tax. For account holders whose cheque was lost, stolen, wrongly written, or superseded by a payment made another way.",
  useCases: [
    "Stop a single cheque posted to the wrong payee and confirm how many days of presentation validity are left.",
    "Cover a whole run of leaves from a stolen chequebook and see what the per-cheque charge adds up to.",
    "Discover that a cheque dated seven months ago is already stale, so the fee would buy nothing.",
    "Keep a stop instruction alive on a post-dated cheque right through to the end of its validity, not just to the cheque date.",
  ],
  benefits: [
    [
      "Validity clock, not guesswork",
      "The three-month expiry date is calculated from the date on the cheque and compared with the day you write.",
    ],
    [
      "Format checks before you post",
      "Cheque number, IFSC and MICR are validated against their real formats, so the branch is not sent a typo.",
    ],
    [
      "Charges totalled honestly",
      "Per-cheque or per-request charging, multiplied out across the range, with tax added.",
    ],
  ],
  faqs: [
    [
      "How long is a cheque valid in India?",
      "Three months from the date written on it. The Reserve Bank of India reduced validity from six months to three with effect from 1 April 2012, and the rule covers cheques, demand drafts, pay orders and banker's cheques alike. A cheque presented after that date is returned as stale, so a stop payment on an expired cheque achieves nothing.",
    ],
    [
      "How do I stop a cheque payment?",
      "Give the bank a written instruction quoting the account number, the cheque number, the date and amount on the cheque, the payee, and the reason. Most banks also accept the instruction through net banking or the phone, but follow it with the letter and insist on a written confirmation with a service request number - that acknowledgement is what proves the bank had notice in time.",
    ],
    [
      "Can I be prosecuted for stopping a cheque?",
      "Possibly, if the cheque was issued to discharge a real debt. Indian courts have held that instructing the bank to stop payment does not by itself take a cheque outside section 138 of the Negotiable Instruments Act, 1881, so a stop payment used to avoid a legitimate liability can still lead to proceedings. Where the underlying payment is genuinely disputed, take legal advice and put your reasons to the payee in writing.",
    ],
    [
      "What does the IFSC on a cheque look like?",
      "Eleven characters: four letters identifying the bank, then a compulsory zero in the fifth position, then six characters identifying the branch - HDFC0001234, for example. The 9 digits at the far left of the MICR band at the bottom of the cheque are a different code, made up of a 3-digit city code, a 3-digit bank code and a 3-digit branch code.",
    ],
  ],
};

export default seo;
