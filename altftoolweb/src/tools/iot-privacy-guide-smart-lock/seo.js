const seo = {
  title: "Smart Lock Security Checklist & Code-Guess Timer",
  metaDescription:
    "Sixteen weighted controls across app account, keypad codes, door hardware and offline fallback, plus how long a code survives guessing under your lockout.",
  steps: [
    "Tick the controls you already have in the App account, Codes and keys, Physical security and Offline fallback groups, where Critical items carry the most weight.",
    "Under \"How long your keypad code survives guessing\" set Code length (digits), Seconds to key one attempt and a Lockout preset such as \"5 wrong tries, then 60 seconds\", and tick the predictable-code box if it is a date, birth year, repeat or keypad run.",
    "Read the Lock security score out of 100 with its band, the \"Controls completed\" count and \"Average time to guess the code\", then press Copy result.",
  ],
  intro:
    "This checklist audits a smart lock across sixteen weighted controls — app account protection, keypad and guest codes, door hardware and the offline fallback — and estimates how long a keypad code survives guessing using a 10^n search with your lock's actual lockout rule. Controls that let someone else open the door, or leave you locked out, carry the most weight, and any missing critical control caps the score. It is written for anyone fitting a retrofit or replacement lock at a front door, a rental or a holiday let.",
  useCases: [
    "Handing over a holiday let or Airbnb and needing per-guest codes that expire rather than one shared code everyone keeps.",
    "Deciding between a 4-digit and a 6-digit entry code once the lock's own lockout delay is taken into account.",
    "Cleaning up a lock inherited with a house or flat, where old tenants, cleaners and the installer may still hold app access.",
    "Planning what happens when the batteries die or the internet goes down, before it happens on a wet evening.",
  ],
  benefits: [
    ["Weighted by consequence", "Two-factor on the app account and a changed factory code outrank convenience settings."],
    ["Code maths, not slogans", "Digits, seconds per attempt and the lockout rule combine into an average time to guess."],
    ["Covers the door, not just the app", "Strike plate screws and letterbox fishing sit alongside passwords, because that is how doors actually fail."],
  ],
  faqs: [
    [
      "Is a 4-digit smart lock code enough?",
      "For a lock with no lockout, no: 10,000 combinations at two seconds a try averages about 2.8 hours of standing at the keypad. With a typical five-tries-then-60-seconds lockout the same code averages around 19 hours, and moving to six digits pushes it past a decade — so six digits plus a lockout is the practical minimum.",
    ],
    [
      "Can a smart lock be opened if the Wi-Fi or power goes out?",
      "Bluetooth and Z-Wave locks keep working locally because the keypad and the radio pairing do not depend on the internet, and the batteries are in the lock. Cloud-dependent models may refuse remote unlocking during an outage, so test yours with the router switched off and keep a mechanical key or override route stored off-site.",
    ],
    [
      "How do I give a cleaner or a delivery access without sharing my code?",
      "Create a named user with their own code and, where the lock supports it, a schedule or single-use limit — for example valid 09:00 to 12:00 on one date. That keeps the access log meaningful, lets you revoke one person without changing everyone else's code, and stops the code being passed on afterwards.",
    ],
    [
      "What is letterbox fishing and does it affect smart locks?",
      "It is hooking a wire through the letterbox to turn the thumb-turn from outside, and retrofit smart locks are especially exposed because they mount on that thumb-turn. A letterbox cowl, a restrictor, or a lock with a shielded thumb-turn removes the attack; no app setting can.",
    ],
  ],
};

export default seo;
