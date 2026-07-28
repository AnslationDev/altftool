const seo = {
  "intro": "This guide is a weighted, 15-control checklist for Indian net banking that works at any bank: distinct login and transaction passwords, an app-based token in place of SMS, the beneficiary cooling period, lower daily transfer limits, per-card channel controls, low alert thresholds and the RBI reporting deadline. It leans on rules that apply across banks rather than one bank's menu wording: RBI's additional factor of authentication, the customer-set card controls banks must offer, and the circular on limiting customer liability in unauthorised electronic transactions. Four controls are marked critical and the score is capped at 69% until all four are done. Informational only, not legal or financial advice: your bank's own terms govern any dispute.",
  "useCases": [
    "Setting up net banking on a new account and changing the passwords printed in the welcome kit.",
    "Lowering transfer and card limits for an elderly parent who only makes small routine payments.",
    "Acting quickly after an unauthorised debit, while the three-working-day reporting window is still open.",
    "Reviewing beneficiaries and standing instructions on an account nobody has checked in years."
  ],
  "benefits": [
    [
      "Bank-neutral",
      "Every control exists in some form at every Indian bank, so the list survives switching banks or a redesigned website."
    ],
    [
      "Built on RBI rules",
      "Card controls, the additional factor of authentication and the liability deadlines are regulatory, not one bank's policy."
    ],
    [
      "Nothing is collected",
      "The page runs in your browser and never asks for an account number, customer ID, password or OTP."
    ]
  ],
  "faqs": [
    [
      "How long do I have to report an unauthorised bank transaction in India?",
      "Under the RBI circular on limiting customer liability, reporting within three working days of noticing the transaction normally leaves you with zero liability. Reporting on the fourth to seventh working day limits your liability to a capped amount that varies by account type, and longer delays are governed by the bank's own policy, so report the same day you see it."
    ],
    [
      "Why does my bank make me wait before sending money to a new payee?",
      "The cooling period, commonly up to 24 hours with a low limit on the first transfers, exists so that a beneficiary added by someone else cannot be used immediately. It is the window in which the bank's alert reaches you and you can react, which is why it is worth keeping rather than asking for it to be waived."
    ],
    [
      "Can I switch off international use on my debit card?",
      "Yes. RBI requires banks to let customers enable or disable each channel separately, including international, online, contactless and ATM use, and to set a spending limit on each. You can do it from the bank's app or net banking, and switch international back on only for the days you travel."
    ],
    [
      "Is an app-based token safer than an SMS OTP?",
      "Generally yes, because an SMS OTP is delivered to whoever controls your mobile number, which a SIM swap transfers to an attacker. An in-app soft token generates the code on your registered device instead, so it does not travel over the phone network and keeps working where there is no signal."
    ]
  ]
};

export default seo;
