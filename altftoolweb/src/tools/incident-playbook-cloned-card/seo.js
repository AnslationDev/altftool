const seo = {
  title: "Cloned Card Fraud Playbook: RBI Liability Deadlines",
  metaDescription:
    "Block, report on 1930 and notify in writing — then see your RBI liability: nil inside 3 working days, capped at ₹5,000/10,000/25,000 by day 7.",
  steps: [
    "Enter the date the bank's alert reached you, the date you notified the bank, the disputed amount in INR, and any extra bank holidays that fell in that gap.",
    "Pick your account or card type — each option lists its own cap — and choose how the loss arose; working days are counted excluding Sundays and the second and fourth Saturday of each month.",
    "Read the liability figure and its band (Zero customer liability, Limited liability, Decided by the bank's policy, or Loss borne until you reported), plus the shadow-reversal, 90-day resolution and Ombudsman dates, then press Copy result.",
  ],
  intro:
    "This playbook sets out the order of actions after an unauthorised card transaction — block, report on 1930, notify the bank in writing, dispute, document — and then works out where you stand under the Reserve Bank of India circular on limiting customer liability in unauthorised electronic banking transactions, dated 6 July 2017. Reporting within three working days of the bank's communication carries zero liability in a third-party breach; a delay of four to seven working days caps liability at the lower of the transaction value and 5,000, 10,000 or 25,000 rupees depending on the account type. The working-day count treats Sundays and the second and fourth Saturday of each month as non-working.",
  useCases: [
    "A debit alert appears for a card in your pocket and you need to know what to do in the next ten minutes.",
    "Working out whether you reported inside the three-working-day zero-liability window once weekend closures are excluded.",
    "Checking the date by which the bank must shadow-reverse the disputed amount after your written notification.",
    "Preparing an evidence pack before escalating a stalled dispute to the Banking Ombudsman.",
  ],
  benefits: [
    [
      "Counts real bank working days",
      "Excludes Sundays and the second and fourth Saturday, plus any branch holidays you add.",
    ],
    [
      "Applies the correct Table 2 cap",
      "5,000 for a BSBD account, 10,000 for most savings accounts and smaller credit cards, 25,000 for larger ones.",
    ],
    [
      "Puts dates on the bank's obligations",
      "Ten working days to reverse, ninety days to resolve, thirty days before the Ombudsman route opens.",
    ],
  ],
  faqs: [
    [
      "What is my liability if my card is cloned and money is taken?",
      "In a third-party breach where neither you nor the bank was at fault, your liability is nil if you notify the bank within three working days of receiving its communication about the transaction. A delay of four to seven working days caps your per-transaction liability at the lower of the transaction value and your account-type limit — 5,000 rupees for a BSBD account, 10,000 for most savings accounts and credit cards with a limit up to 5 lakh, and 25,000 for other current accounts and larger credit cards. Beyond seven working days, the bank's board-approved policy applies.",
    ],
    [
      "How quickly must the bank reverse a disputed transaction?",
      "The RBI circular requires the bank to credit the disputed amount to your account within ten working days of your notification, as a shadow reversal while the case is investigated, and it may not insist on an FIR as a precondition. The complaint itself must be resolved and liability established within ninety days of receipt.",
    ],
    [
      "What should I do in the first hour after an unauthorised transaction?",
      "Block the card through the bank's app or the number on the back of the card, then call the national cyber crime helpline 1930 so the beneficiary account can be put on hold, then notify the bank in writing and get a complaint reference number. Speed matters most in that order — blocking stops further attempts, and the 1930 call is what makes a freeze on the receiving account possible.",
    ],
    [
      "Does sharing an OTP mean I lose everything?",
      "Where the loss arises from your own sharing of a PIN, OTP, CVV or password, you bear the loss on transactions occurring up to the point you report it — but every debit after you notify the bank is the bank's liability. That makes reporting time-critical even when you believe you were at fault. If the amount is significant or the bank disputes your account of events, take advice from a qualified professional.",
    ],
  ],
};

export default seo;
