const seo = {
  intro:
    "Every UPI payment passes three ceilings at once — the NPCI cap for that payment category, your own bank's per-payment and per-day cap, and whatever is left of the day's quota in both rupees and transaction count — and the smallest of them decides whether the payment goes through. This checker takes the payment type, your bank's caps and what you have already spent today, then names the binding limit, says whether the payment will succeed, and shows how many transactions of the NPCI daily count of 20 you have left. It covers person-to-person and merchant payments, the raised categories for capital markets, IPOs, tax and verified hospitals and schools, plus UPI Lite, UPI 123Pay and AutoPay mandates.",
  useCases: [
    "A payment of 60,000 fails and you need to know whether it was the bank's cap or the daily quota that stopped it.",
    "You are applying for an IPO through UPI and want to confirm your bank allows a mandate above 1 lakh.",
    "You just linked a new bank account and cannot understand why only small transfers are going through.",
  ],
  benefits: [
    ["Names the binding constraint", "Instead of a generic limit list you get the one ceiling that is actually blocking this payment."],
    ["Counts transactions, not just rupees", "The NPCI limit of 20 payments per account per day stops people long before they hit the rupee cap."],
    ["Covers the separate rails", "UPI Lite, UPI 123Pay and AutoPay mandates have their own ceilings and are handled distinctly from ordinary UPI."],
  ],
  faqs: [
    [
      "What is the maximum UPI transaction limit per day?",
      "The general NPCI ceiling is 1,00,000 per transaction and per day, with a standard limit of 20 UPI transactions per bank account per day. Specific verified categories go higher: 2,00,000 for capital markets, collections, insurance and foreign inward remittances, and 5,00,000 for IPO and RBI Retail Direct, tax payments, and verified hospitals and educational institutions.",
    ],
    [
      "Why is my UPI limit lower than 1 lakh?",
      "Because your bank has set its own cap inside the NPCI ceiling, and that cap is what applies. Banks commonly use 25,000, 50,000 or 1,00,000, and some apply a lower figure for the first few days after an account is linked. The limit shown inside your bank's UPI app is the authoritative one.",
    ],
    [
      "What is the UPI limit for a newly added bank account?",
      "Typically 5,000 for the first 24 hours after the account is linked or the UPI PIN is reset. This is a fraud-control measure rather than an NPCI ceiling, so the exact figure and window vary by bank — the restriction lifts automatically once the period ends.",
    ],
    [
      "What is the UPI Lite limit and does it use my daily quota?",
      "UPI Lite is an on-device wallet holding at most 5,000, and each payment is capped at 1,000. Because no UPI PIN is entered and the money has already left your account, Lite payments do not consume the 20-transaction daily count on your bank account, which is exactly why it exists for small everyday payments.",
    ],
  ],
};

export default seo;
