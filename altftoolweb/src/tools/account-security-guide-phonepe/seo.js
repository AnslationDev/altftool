const seo = {
  "intro": "This guide is a weighted, 15-control checklist for PhonePe and UPI: app lock, a UPI PIN that is not guessable, autopay mandate cleanup, transaction limits, and the PIN discipline that stops the scams behind most UPI losses. The single most important rule is an NPCI rule rather than a PhonePe setting: a UPI PIN authorises money leaving your account and is never needed to receive money. Five controls are marked critical and the score is capped at 69% until all five are done. It is general security information, not financial advice; contact your bank and the 1930 helpline for anything involving an actual loss.",
  "useCases": [
    "Setting up a new phone and getting the app lock, SIM PIN and UPI PIN right before moving money.",
    "Teaching a parent or first-time UPI user why a PIN is never needed to receive a payment.",
    "Auditing autopay mandates after a subscription keeps debiting long past the free trial.",
    "Hardening the account after an unexpected collect request or a call claiming to be PhonePe support."
  ],
  "benefits": [
    [
      "Aimed at the real attack",
      "Most UPI losses come from an authorised payment made under pressure, so the habits are scored as heavily as the settings."
    ],
    [
      "NPCI rules, not folklore",
      "Limits and PIN behaviour come from the UPI rules that apply across every app, so the guidance holds if you switch apps."
    ],
    [
      "Nothing is collected",
      "The checklist runs in your browser and never asks for your UPI ID, PIN, bank details or phone number."
    ]
  ],
  "faqs": [
    [
      "Do I ever need to enter my UPI PIN to receive money?",
      "No. Under UPI rules the PIN authorises a debit from your account, so it is only ever required when money leaves. Anyone asking for a PIN, or sending a QR code, so you can accept a refund, a sale payment or a prize is arranging a payment out of your account."
    ],
    [
      "What is the UPI transaction limit on PhonePe?",
      "NPCI sets the ceiling for most UPI transfers at Rs 1,00,000 per transaction and per day, and a newly registered user is capped at Rs 5,000 in the first 24 hours. Some categories such as hospitals, education and capital markets have higher ceilings, and your own bank may apply a lower limit of its own."
    ],
    [
      "Someone got money out of my PhonePe. What do I do first?",
      "Call 1930, the national cybercrime financial-fraud helpline, and file at cybercrime.gov.in, then report it in the app under Help and inform your bank. Speed matters because a transfer reported early can sometimes be held before it is withdrawn further down the chain."
    ],
    [
      "Why should I never install AnyDesk or TeamViewer for customer support?",
      "Those apps give the caller a live view of your screen and, in many cases, control of the phone, which lets them read OTPs and watch you type the UPI PIN. No genuine bank, payment app or government helpline needs remote access to your device, so treat the request itself as proof the call is fraudulent."
    ]
  ]
};

export default seo;
