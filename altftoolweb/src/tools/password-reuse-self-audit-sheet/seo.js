const seo = {
  intro:
    "Password Reuse Self Audit Sheet groups your accounts into reuse clusters from nicknames you give each shared password — it never asks for the password itself. Each account is weighted by what an attacker would actually reach, with your primary email and password manager ranked highest because nearly every other reset link is delivered through them. The output is the percentage of your account value sitting behind a shared password, the clusters that create it, and the order in which to change them. The attack being modelled is credential stuffing: a username and password pair leaked from one breached site, replayed automatically across hundreds of others.",
  useCases: [
    "Working out which account to change first after a breach notification naming a site you use.",
    "Turning a vague sense that you 'reuse a few passwords' into a concrete, ordered list of eight changes.",
    "Showing a family member why the old forum password mattering at all depends on where else it appears.",
    "Planning a migration to a password manager by mapping which accounts share a family before you start.",
  ],
  benefits: [
    [
      "No password ever entered",
      "You type nicknames like 'the 2019 one', so the sheet works without handling a single real secret.",
    ],
    [
      "Ordered by blast radius",
      "Clusters are ranked by the value they expose, not by how many accounts they contain.",
    ],
    [
      "Entirely local",
      "The clustering runs in your browser tab; nothing is uploaded, saved or sent anywhere.",
    ],
  ],
  faqs: [
    [
      "Why is reusing passwords dangerous if the password is strong?",
      "Because strength stops mattering once the password has leaked. In credential stuffing, an attacker takes username and password pairs from one breached site and replays them automatically across other services — the pair only has to match. A 20-character password reused on a forum that gets breached is as usable to the attacker as a weak one.",
    ],
    [
      "Which password should I change first?",
      "The one on your primary email or password manager, if either shares a password with anything else. Password resets for your other accounts are delivered to that inbox, so it is the account that unlocks the rest. After that, work down by value: banking and government, then work and cloud storage, then everything else.",
    ],
    [
      "Do small variations like adding a number count as reuse?",
      "Yes. Attackers run rule-based mutations — appending digits, swapping letters for symbols, incrementing a year — over the passwords they already have, so 'Summer2019!' and 'Summer2020!' belong in the same family here. Label them as one family unless the two passwords share no common base.",
    ],
    [
      "Does this tool see or store my passwords?",
      "No. It only ever receives the account names, tier choices and family nicknames you type, and it processes them in your browser. Nothing is transmitted to a server and nothing is written to storage, so closing the tab clears the sheet.",
    ],
  ],
};

export default seo;
