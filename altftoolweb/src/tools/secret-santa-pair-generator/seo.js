const seo = {
  title: "Secret Santa Generator With Exclusions & Reveal Codes",
  metaDescription:
    "Shuffles until nobody draws themselves, an excluded pair or last year’s person, then hands out six-character reveal codes. Export CSV or JSON.",
  steps: [
    "Paste names into \"Participants (one per line or comma-separated)\" and add blocked pairs under \"Exclusions (format: Name A - Name B)\".",
    "Optionally paste last year's draw into Previous-Year Pairings, set the Attempt Limit, then press Generate Pairings.",
    "Read Generated Pairings and the Anonymous Reveal Codes, then use Copy All, Export JSON or Export CSV to save secret-santa-pairs.csv.",
  ],
  intro:
    "The Secret Santa Pair Generator assigns every participant exactly one gift recipient by Fisher-Yates shuffling the recipient list and re-shuffling until no one draws themselves, no excluded pair appears, and no last-year repeat slips through. You paste names one per line or comma-separated, add exclusions as \"Name A - Name B\" (blocked in both directions), and get the full pairing list plus per-person reveal codes you can hand out so nobody sees the whole draw. It suits family draws, office gift exchanges and friend groups that need couples or housemates kept apart.",
  useCases: [
    "Your office exchange has two married couples in it, and you need a draw where neither spouse can pull the other without redoing the whole thing by hand.",
    "You are running the same friend group's exchange for a second year and want to paste in last year's pairs so nobody gets the identical person twice.",
    "You are the organiser but also a participant, so you need reveal codes to distribute rather than a list you have already read.",
  ],
  benefits: [
    [
      "Tells you when a draw is mathematically impossible",
      "Before shuffling, it checks every participant for at least one legal recipient and names the people who have none, instead of silently retrying forever.",
    ],
    [
      "Exclusions and last-year pairs are both symmetric",
      "Writing \"Arun - Neha\" blocks Arun-to-Neha and Neha-to-Arun, so you enter each relationship once rather than twice.",
    ],
    [
      "Keeps the organiser out of the secret",
      "Each participant gets a random six-character code; a person enters only their own code to see their recipient, and the CSV or JSON export is there when you do want the full record.",
    ],
  ],
  faqs: [
    [
      "How does it stop someone drawing their own name?",
      "It shuffles the recipient list, checks every giver against its rules, and discards the whole shuffle if a single position fails — so a self-match, an excluded pair or a repeat from last year can never survive into the output. The retry runs up to your attempt limit, which defaults to 5,000 and is floored at 200.",
    ],
    [
      "Can two people be assigned to each other?",
      "Yes. The generator produces a valid permutation with no fixed points, not a single closed chain, so a mutual A-gives-to-B and B-gives-to-A pair is legal unless you list that pair as an exclusion.",
    ],
    [
      "What happens if my exclusions make a draw impossible?",
      "You get a message naming the participants who have no valid recipient left, or a prompt to relax exclusions or raise the attempt limit if the constraints are merely very tight. A small group with many exclusions is the usual cause — six people with three blocked couples leaves very few legal arrangements.",
    ],
    [
      "Do duplicate names cause a problem?",
      "No. Names are trimmed and deduplicated as they are parsed, so pasting the same person twice yields one entry rather than two — but two different people with the identical name will collapse into one, so distinguish them (for example \"Ravi K\" and \"Ravi S\").",
    ],
  ],
};

export default seo;
