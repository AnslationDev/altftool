const seo = {
  title: "Government Portal Password Tester: 8-14 Char Rules",
  metaDescription:
    "Check a password against the 8-14 character rule shape Indian government portals use, and see which rule fails: length, symbols, login ID, mobile or PAN.",
  steps: [
    "Type the password you are about to set into \"Candidate password\" and press Show to check what you typed.",
    "Fill Login / user ID, Registered mobile number, PAN (tax portals only) and \"Days since last change\" so reuse of those identifiers is tested.",
    "Read the Rules passed tally out of the full rule count, then the rule-by-rule list naming each constraint a portal form would reject.",
  ],
  intro:
    "Government Portal Password Tester checks a candidate password against the rule shape Indian government portals share: 8 to 14 characters, at least one uppercase letter, one lowercase letter, one digit and one special character from a short accepted list, no spaces, and nothing derived from your login ID, registered mobile number or PAN. It reports each rule separately, flags characters such as angle brackets and quotes that these forms reject as injection attempts, and estimates how long the password would survive guessing. Everything runs in the browser — no value is transmitted or stored.",
  useCases: [
    "Find out which rule a tax or provident-fund portal is rejecting when the error message just says the password is invalid.",
    "Check that a password does not reuse digits from the mobile number registered against the account.",
    "Avoid characters the portal accepts at registration but mishandles at login, which is a common cause of self-inflicted lockouts.",
    "Choose the strongest possible password inside a 14-character ceiling, where you cannot fall back on a long passphrase.",
  ],
  benefits: [
    ["Names the failing rule", "Each constraint is tested on its own line, with the reason the portal imposes it."],
    ["Knows Indian identifiers", "Validates PAN in the five-letters, four-digits, one-letter format and ten-digit mobile numbers starting 6-9."],
    ["Fully offline", "Plain client-side JavaScript — nothing is uploaded, stored or logged."],
  ],
  faqs: [
    [
      "What are the password requirements for Indian government portals?",
      "The common profile is 8 to 14 characters containing at least one uppercase letter, one lowercase letter, one digit and one special character from a restricted list such as @ # $ % & * !, with no spaces. Most also block the login ID inside the password and prompt a change roughly every 90 days. Individual portals vary, so read the rule text printed beside the password box.",
    ],
    [
      "Why does the portal reject characters like < > or a quote mark?",
      "Those characters are filtered as possible injection attempts by the form's input validation, so the password is rejected before it reaches the password rules at all. The bigger risk is a portal that accepts such a character at registration and then strips it at login, which locks you out of your own account — stick to the documented symbol list.",
    ],
    [
      "Can I use my PAN or date of birth in a government portal password?",
      "You should not, and many portals actively block it. On tax portals the PAN is often the user ID itself, and both PAN and date of birth appear on documents and acknowledgements that pass through many hands. Anything printed on a form you have submitted is a poor secret.",
    ],
    [
      "What should I do if a government portal account is compromised?",
      "Change the password immediately from a device you trust, check the registered mobile number and email on the profile in case they were altered, and enable any second factor the portal offers. Financial fraud can be reported on the national cybercrime helpline 1930 or at cybercrime.gov.in. This tool is informational and is not legal or official guidance — follow the portal's own grievance process.",
    ],
  ],
};

export default seo;
