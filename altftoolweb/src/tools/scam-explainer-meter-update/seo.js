const seo = {
  title: "Electricity Meter Update Scam: SMS Red Flags",
  metaDescription:
    "Scores the disconnection SMS on 12 red flags and tests its deadline against the 15 clear days' notice Section 56(1) of the Electricity Act requires.",
  steps: [
    "Tick what the message asks for from the twelve weighted red flags, four of which are marked decisive on their own.",
    "Enter the date the notice reached you and the date supply is said to be cut, and tick whether it arrived in writing.",
    "Read the red-flag score, the clear days of notice against the 15 that Section 56(1) requires, and what the UPI PIN really authorises.",
  ],
  intro:
    "The electricity meter update scam is a smishing script in which an SMS warns that supply will be cut the same evening over an unpaid bill, and the follow-up call ends with a remote-access app install or a UPI collect request. This explainer walks the seven stages, scores the message on a weighted twelve-point checklist, and tests the claimed deadline against Section 56(1) of the Electricity Act, 2003, which permits disconnection for non-payment only after not less than fifteen clear days' notice in writing.",
  useCases: [
    "An SMS at 8 pm says power will be disconnected at 9:30 tonight and gives a 10-digit number to call.",
    "Checking whether a disconnection notice you received actually gives the fifteen clear days the Act requires.",
    "Understanding why the ten-rupee verification payment matters — it is the PIN entry, not the amount.",
    "Explaining to an elderly relative why reading out a nine-digit code from a support app hands over the phone.",
  ],
  benefits: [
    [
      "Tests the deadline against statute",
      "Counts clear days between the notice and the cut-off and compares them with the Section 56(1) minimum.",
    ],
    [
      "Settles the UPI question",
      "A PIN only ever authorises money leaving your account — never a refund, never a credit.",
    ],
    [
      "Lists the real payment routes",
      "The DISCOM's own app, an authorised centre, BBPS, or the number printed on your paper bill.",
    ],
  ],
  faqs: [
    [
      "How much notice must an electricity company give before cutting supply?",
      "Section 56(1) of the Electricity Act, 2003 requires not less than fifteen clear days' notice in writing before supply is cut off for non-payment. Clear days exclude both the day the notice is served and the day of the proposed disconnection, so a message threatening disconnection the same evening has no legal basis whatsoever.",
    ],
    [
      "Do I need to enter my UPI PIN to receive money or a refund?",
      "No. A UPI PIN only ever authorises money leaving your account. Credits arrive with no action from you at all. Anyone asking you to enter a PIN to receive a refund, verify an account or complete a ten-rupee check is asking you to approve a debit.",
    ],
    [
      "Why does the caller want me to install a support app?",
      "Because remote-support and screen-sharing apps let them see your screen and, with accessibility permission, operate your phone. The code the app displays is the pairing invitation — reading it out completes the connection. From that point they can watch you type a PIN and read one-time password notifications.",
    ],
    [
      "How can I check whether I really owe an electricity bill?",
      "Open your distribution company's own app or website by typing the address yourself, and look up your consumer number from a past paper bill. You can also pay through Bharat Bill Payment System in your bank app, where the biller appears by its registered name. Never use a number, link or app that arrived in the warning message.",
    ],
  ],
};

export default seo;
