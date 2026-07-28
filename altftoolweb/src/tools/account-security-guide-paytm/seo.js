const seo = {
  "intro": "This guide is a weighted, 15-control checklist for a Paytm account: app lock, UPI PIN rules, automatic payments, wallet auto top-up, Postpaid limits and the scam patterns behind most UPI losses. The rule that matters most is an NPCI rule rather than a Paytm setting: the UPI PIN authorises money leaving your account and is never required to receive a payment. Five controls are marked critical and the score stays at 69% until all five are done. This is general security information, not financial advice; contact your bank and the 1930 helpline about any actual loss.",
  "useCases": [
    "Locking down the app after losing a phone, or before handing an old handset on.",
    "Explaining to a first-time UPI user why nobody ever needs their PIN to send them money.",
    "Finding the automatic payment that keeps debiting after a free trial ended.",
    "Checking a Paytm Postpaid balance and limit that nobody in the household has looked at."
  ],
  "benefits": [
    [
      "Covers wallet, UPI and credit together",
      "Paytm mixes a wallet balance, UPI, saved cards and Postpaid, and each is scored for what it can spend."
    ],
    [
      "Built on rules, not folklore",
      "The PIN and QR guidance comes from how UPI works across all apps, so it stays true if you switch to another one."
    ],
    [
      "Nothing is collected",
      "The checklist runs entirely in your browser and never asks for a phone number, UPI ID, PIN or OTP."
    ]
  ],
  "faqs": [
    [
      "Can someone take money from my Paytm without my UPI PIN?",
      "Not through UPI, because every UPI debit needs the PIN. The routes that do not are the wallet balance and UPI Lite, which are designed for small payments without a PIN, plus any automatic payment mandate you have already approved. That is why the checklist covers app lock, auto top-up and mandates alongside the PIN."
    ],
    [
      "Is a UPI PIN ever needed to receive money on Paytm?",
      "No. Receiving is free of any PIN entry, and scanning a QR code always sends money rather than collecting it. Treat every refund, prize or buyer payment that asks you to enter a PIN or scan a code as an attempt to debit your account."
    ],
    [
      "How do I stop recurring debits on Paytm?",
      "Open Balance and History > Automatic Payments and cancel the mandates you no longer want, and switch off automatic add money to the wallet in the payment settings. Approved mandates continue to debit on schedule without asking for your PIN again, so cancelling in the app is the only reliable stop."
    ],
    [
      "What should I do if my phone with Paytm is stolen?",
      "Block the SIM with your mobile operator first so OTPs stop arriving, then use Paytm's lost-phone route to block the wallet, and change the passwords of the email and bank accounts tied to the number. Report any fraudulent transaction to your bank and to 1930 the same day."
    ]
  ]
};

export default seo;
