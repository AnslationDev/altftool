const seo = {
  title: "UPI QR Code Generator from Your UPI ID",
  metaDescription:
    "Type your UPI ID and payee name to get a standard upi://pay QR. Lock an amount in INR, add a note or reference, then download the code as a PNG.",
  steps: [
    "Enter your UPI ID / VPA (name@bank format) and a payee name, and tick 'Lock a fixed amount' to set an INR amount — values above ₹1,00,000 are flagged.",
    "Optionally add a payment note (up to 50 characters), a reference ID (up to 35) or a 4-digit merchant category code; the upi://pay QR redraws as you type.",
    "Click 'PNG' to download the QR as upi-qr-<your-vpa>.png, or 'Copy UPI link' to copy the raw upi://pay URI.",
  ],
  "intro": "UPI QR Code Generator turns your UPI ID into a scannable payment code. It assembles a standard upi://pay link from the payee VPA, payee name, currency (INR) and — if you want — a locked amount, a payment note, a reference ID and a merchant category code, then renders it as a QR you can download as PNG. Useful for shopkeepers, freelancers, tuition teachers, event stalls and anyone collecting payments without a POS machine.",
  "useCases": [
    "Print a counter-top QR for a shop or stall so customers can pay by scanning instead of typing your UPI ID.",
    "Send a client a QR with the invoice amount already locked in, plus the invoice number as the payment note.",
    "Collect a fixed contribution — society dues, class fees, event tickets — where everyone pays the same amount."
  ],
  "benefits": [
    [
      "Works with every UPI app",
      "The QR encodes the standard NPCI upi://pay deep link, so GPay, PhonePe, Paytm, BHIM and bank apps all read it."
    ],
    [
      "Fixed or open amount",
      "Lock an exact amount for invoices, or leave it blank so the payer types whatever they owe."
    ],
    [
      "Nothing leaves your browser",
      "The QR is drawn locally from the details you type — no account linking, no signup, no upload."
    ]
  ],
  "faqs": [
    [
      "Is a UPI QR generated here safe to use?",
      "The QR only encodes your public UPI ID and the payment details you enter — it can receive money, never send it. Still, always test-scan it yourself and confirm the payee name your app shows before printing."
    ],
    [
      "What is a VPA and where do I find mine?",
      "A VPA (virtual payment address) is your UPI ID in the form name@bank, such as priya@okhdfcbank. Any UPI app shows it on the profile or 'My UPI ID' screen."
    ],
    [
      "Is there a limit on the amount I can put in the QR?",
      "Most banks cap a single UPI transaction at ₹1,00,000, with higher limits for specific categories, so this tool flags amounts above that. Your own bank's per-transaction and daily limits still apply."
    ],
    [
      "Do I need a merchant account or a category code?",
      "No. The merchant category code is an optional 4-digit field used by registered merchants; personal collections can leave it blank."
    ]
  ]
};

export default seo;
