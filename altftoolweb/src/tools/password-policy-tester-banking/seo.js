const seo = {
  intro:
    "Bank Password Policy Tester checks a candidate net-banking password against the rule set retail banks publish: 8 to 20 characters, at least one uppercase letter, one lowercase letter, one digit and one special character from a restricted list, no spaces, no run of three identical characters, and nothing taken from your user ID or date of birth. Each rule is reported separately, so you see exactly which constraint a rejected password broke instead of a generic error. It also estimates strength in bits of entropy and converts that into guessing time at three realistic attack rates, because passing a bank's form and being hard to guess are two different things.",
  useCases: [
    "Work out why the net-banking form keeps rejecting a password without telling you which rule failed.",
    "Check that a new password does not contain your customer ID or date of birth, the two details a bank already holds on file.",
    "Show a family member why Name@BirthYear passes every complexity box and is still weak.",
    "Compare a 10-character mixed password with a 16-character one before you set it, using the estimated cracking times.",
  ],
  benefits: [
    ["Names the failing rule", "Every constraint is tested and reported on its own line, with the reason banks impose it."],
    ["Separates policy from strength", "Shows both whether the form would accept it and how long guessing it would actually take."],
    ["Nothing leaves the device", "The evaluation is plain JavaScript in your browser — no network request, no storage, no logging."],
  ],
  faqs: [
    [
      "What are the password rules for net banking in India?",
      "Most retail banks require 8 to 20 characters with at least one uppercase letter, one lowercase letter, one digit and one special character from a short accepted list such as ! @ # $ % ^ & *. Spaces are rejected, the password cannot contain your user ID, and a change is usually forced roughly every 180 days. The exact window differs by bank, so check the rule text shown on your own login page.",
    ],
    [
      "Why does my bank limit the password to 20 characters?",
      "The cap is a legacy of older core-banking and middleware systems that stored or passed the value through fixed-length fields. It is a real constraint rather than a security decision, and it matters because it rules out long passphrases — so within 20 characters you should maximise variety and avoid anything derived from personal data.",
    ],
    [
      "Is a password like Name@1985 strong enough for a bank account?",
      "No. A capitalised first name, a symbol and a birth year satisfy every complexity checkbox while collapsing the real search space to a few million combinations that standard cracking rules generate automatically. Your date of birth is on every KYC form the bank holds, which is why banks explicitly forbid using it.",
    ],
    [
      "What should I do if I think someone knows my net-banking password?",
      "Change it immediately from a device you trust, then check the account for transactions you do not recognise. In India, the RBI's customer-protection framework gives you zero liability for unauthorised electronic transactions if you report them to the bank within three working days of receiving the communication, with limited liability after that — so report to the bank first and get an acknowledgement. This tool is informational and is not a substitute for your bank's own guidance.",
    ],
  ],
};

export default seo;
