const seo = {
  intro:
    "This explainer dissects the fake bank OTP message — the \"your account is suspended, share the OTP to reactivate\" SMS — one line at a time, naming the tell in each sentence and why it works. A built-in scanner scores any message you paste against 13 weighted markers of the same scam family, from OTP and CVV requests to APK downloads, and separately inspects every link: the registrable domain, punycode, userinfo tricks, shorteners and bare IP hosts. It is for anyone who wants to recognise the next one on sight rather than memorise a blocklist.",
  useCases: [
    "Check an unexpected SMS claiming your net banking is suspended before tapping anything in it.",
    "Show an older relative exactly which words in a scam message are doing the work, instead of just telling them to be careful.",
    "Work out whether a link like sbi-secure-verify.top actually belongs to the bank, by reading the registrable domain rather than the brand word.",
    "Train a support or branch team on the difference between a genuine transaction alert and a credential-harvesting one.",
  ],
  benefits: [
    [
      "Weighted, not binary",
      "Each marker carries a weight, so an OTP request scores 14 points and a generic greeting scores 5 — the verdict reflects what actually separates a scam from a real alert.",
    ],
    [
      "Real link parsing",
      "The scanner reads the registrable domain, handles two-level suffixes like co.in, and refangs bad[.]top and hxxp:// so a safely pasted link is still analysed.",
    ],
    [
      "Nothing leaves the tab",
      "The rules run in your browser, so a message you are unsure about is never uploaded anywhere.",
    ],
  ],
  faqs: [
    [
      "Will a bank ever ask for my OTP?",
      "No. No bank and no bank employee is permitted to ask for an OTP, PIN, CVV or password — by SMS, email or phone. Genuine bank alerts carry the opposite instruction, and any request to share a code is a scam regardless of who the caller claims to be.",
    ],
    [
      "How do I tell if a link in a bank SMS is fake?",
      "Read the registrable domain — the last two labels immediately before the first single slash. In sbi-secure-verify.top/login the site is sbi-secure-verify.top, not State Bank; the brand word can appear anywhere in a hostname because the owner of that domain chose it.",
    ],
    [
      "What should I do if I already shared an OTP or card details?",
      "Call 1930, the national cyber-crime helpline, immediately and file a complaint at cybercrime.gov.in — reporting within the first hours gives the best chance of the receiving account being frozen. Also call your bank on the number printed on your card and ask for the card and net banking access to be blocked.",
    ],
    [
      "Why is installing an APK from a bank SMS so dangerous?",
      "A sideloaded banking APK requests SMS and accessibility permissions, which lets it read the OTPs arriving on your phone and operate the screen on its own. That is the step that converts a phishing page into a completed transfer, and no bank distributes its app outside the Play Store or App Store.",
    ],
  ],
};

export default seo;
