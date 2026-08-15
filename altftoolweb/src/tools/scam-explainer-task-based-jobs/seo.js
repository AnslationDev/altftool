const seo = {
  title: "Task-Based Job Scam: What the Deposit Ladder",
  metaDescription:
    "Model the like-and-review job scam as a geometric deposit ladder, and see the balance the app displays beside the cash that left your bank.",
  steps: [
    "Under 'Model the ladder', enter 'Paid per starter task (INR)', 'Starter tasks that really paid' and 'First deposit asked for (INR)' — the seed payouts that genuinely withdrew, and the first round you would fund yourself.",
    "Set 'Each deposit is this many times the last' (1 to 10), 'Deposit rounds' (1 to 20) and 'Commission promised on each deposit (%)'. There is no calculate button: the ladder recomputes as you type.",
    "Read 'What your bank account actually did' against the balance the app displays, work down the Round / Deposit / App balance / Real position table, tick what applies under 'What has happened to you?' for a red-flag score with its money-mule warning, then press 'Copy briefing'.",
  ],
  intro:
    "Task-based work-from-home scams pay you first. A few trivial tasks — liking videos, rating hotels — earn a small commission that really does withdraw, and then the tasks become 'prepaid': you deposit your own money to unlock a higher commission, and each round is a multiple of the one before. This explainer models that ladder as the geometric series it is, showing the balance the app displays against the cash that actually left your bank, and scores the offer against the red flags that define it, including the account-lending request that turns a victim into a money mule.",
  useCases: [
    "See what five doubling deposit rounds actually total before agreeing to the first one.",
    "Show a family member the difference between the wallet balance on screen and their real bank position.",
    "Check an unsolicited Telegram or WhatsApp job offer against the pattern before replying.",
    "Find the right reporting steps after deposits have already been made or an account was lent out.",
  ],
  benefits: [
    [
      "The ladder as arithmetic",
      "Deposits are summed as a geometric progression, so a Rs 1,000 opening round shows its real five-round total.",
    ],
    [
      "Two numbers side by side",
      "The displayed wallet and the true cash position diverge on screen, which is the whole illusion in one table.",
    ],
    [
      "Money-mule warning",
      "Flags the receive-and-forward request separately, because that consequence outlives the money.",
    ],
  ],
  faqs: [
    [
      "Why did the first few task payments actually arrive?",
      "Because they are the cost of the con. Paying a few hundred rupees in genuine, withdrawable commission is what makes the first deposit feel safe, and it is trivially cheap against a deposit ladder that runs into tens of thousands.",
    ],
    [
      "Is a job that asks for a deposit ever genuine?",
      "No. A genuine employer pays you and never requires you to fund tasks, buy a starter kit, pay a registration or security fee, or top up a wallet to unlock earnings. Any request for money flowing from you to the employer ends the conversation.",
    ],
    [
      "Why can I see a large balance that will not withdraw?",
      "That balance is a number in the operator's own database, not money held for you anywhere. Each new obstacle — wrong task order, incomplete combination, tax, VIP upgrade — appears only after a deposit, and no further payment releases anything.",
    ],
    [
      "What happens if I let them use my bank account?",
      "Receiving money for someone else and passing it on can make you the traceable link in their fraud: the account may be frozen and you can be questioned as a participant regardless of what you were told. Report it yourself at cybercrime.gov.in or on 1930 rather than waiting, and take legal advice — this is informational, not legal advice.",
    ],
  ],
};

export default seo;
