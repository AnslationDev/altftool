const seo = {
  intro:
    "The Password Reuse Breach Checklist scores your response to a breach involving a password you also used elsewhere, across 18 weighted steps grouped by the window each one belongs in — first 24 hours, first week, first month, and ongoing. Because a reused password is only as dangerous as the number of other accounts it also unlocks, the tool starts by asking which account categories share it — primary email, banking, work, shopping, social — and turns that into a blast-radius score. The checklist itself is weighted the same way: closing the email and financial rotation path and turning on 2FA as a backstop count for far more than rotating a forum login. Enter the date you found out and the tool flags which steps have already slipped past their window.",
  useCases: [
    "A breach notification says your password was exposed in plaintext or as a cracked hash, and you reuse that password on other sites.",
    "A 'have I been pwned' style check flags your email against a new breach and you need an ordered plan instead of changing passwords at random.",
    "You just realised your email account uses the same password as an old, breached shopping site and want to know what to rotate first.",
    "You are helping a family member or colleague respond to a credential-stuffing warning from their bank or employer.",
  ],
  benefits: [
    [
      "Ordered by blast radius, not alphabetically",
      "Email and banking accounts are rotated before social or shopping logins, because either one can reset or drain accounts beyond itself.",
    ],
    [
      "2FA scored as a real backstop",
      "Turning on two-factor authentication on the accounts that matter counts as much as rotating the password itself, since it is what survives the next accidental reuse.",
    ],
    [
      "Nothing leaves the browser",
      "You tick account categories and checklist steps, never actual passwords or account names — the tool stores no credentials at all.",
    ],
  ],
  faqs: [
    [
      "My password was in a breach — what should I change first?",
      "The breached site itself, then your primary email, then anything financial. Email goes early even if it was not the breached account, because it is the account every other password reset flows through — rotating it first limits how far a credential-stuffing run can spread while you work through the rest of the list.",
    ],
    [
      "Is it enough to just change the password on the site that was breached?",
      "No. Automated credential-stuffing tools take a leaked email-and-password pair and try it against many other sites without a human involved. If you reused the password anywhere else, that account is exposed regardless of whether its own database was ever touched.",
    ],
    [
      "Does two-factor authentication matter if I already changed the password?",
      "Yes — it is the backstop for the next mistake, not a replacement for rotating the leaked one. Passwords get reused again by accident eventually; 2FA means a correct password on its own is no longer enough to get in, which is why the checklist scores it separately from rotation.",
    ],
    [
      "Why does the checklist recommend a password manager instead of just remembering new passwords?",
      "Because reuse happens precisely when remembering a different strong password for every account stops being realistic. A password manager generates and fills a unique one automatically, so there is no 'everywhere' left to search through by hand the next time a breach notice arrives.",
    ],
  ],
};

export default seo;
