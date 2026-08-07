const seo = {
  intro:
    "This explainer scores how much an account depends on receiving mail later — password resets, login codes, payment notices, receipts, longevity — and turns that score into a verdict on whether a disposable address is safe. It compares four kinds of address by the properties that actually decide the outcome: how long each keeps a delivered message, whether the inbox is readable without a password, whether the address can still serve as your account-recovery inbox, and whether signup forms reject it. Open 10-minute inboxes have no authentication at all, so any login code sitting in one is readable by anyone who types the same address.",
  useCases: [
    "Decide in a few seconds whether a gated PDF download deserves a throwaway or an alias.",
    "Understand why a temporary address on a shopping order costs you the return window and the warranty.",
    "Explain to a team why magic-link sign-in makes the email address a permanent authentication factor.",
    "Check whether an inbox that expires after an hour can still hold a confirmation you need next week.",
  ],
  benefits: [
    ["Weighted lockout score", "Five concrete dependencies, weighted to 100, instead of a vague warning."],
    ["Retention checked against your need", "A one-hour inbox is compared directly with the number of days you said you need."],
    ["Four address types side by side", "Public throwaway, account-backed temp inbox, forwarding alias and your ordinary mailbox."],
  ],
  faqs: [
    [
      "Is it safe to use a temporary email for signing up?",
      "It is safe for anything that ends after the first message — a download link, a one-off coupon, a gated report. It is unsafe the moment the account has a password reset, a login code or a payment attached, because losing the inbox loses the account with no way for support to verify you.",
    ],
    [
      "Can anyone read a temporary email inbox?",
      "For the open 10-minute-mail style services, yes. There is no password: whoever types the same address sees the same inbox, and the popular ones use predictable address patterns. Never let a one-time code, reset link or invoice land in one.",
    ],
    [
      "Why do websites block disposable email addresses?",
      "Signup forms check the domain against public blocklists of known disposable providers to stop repeat free trials, one-per-customer abuse and throwaway spam accounts. A forwarding alias on a normal or custom domain is not on those lists, which is why it gets accepted where a throwaway does not.",
    ],
    [
      "What should I use instead of a disposable email?",
      "A forwarding alias: a unique address per service that delivers into your real mailbox and can be disabled the day it starts receiving spam. You keep every message permanently, you can still reply, and you keep the attribution that tells you which company leaked the address.",
    ],
  ],
};

export default seo;
