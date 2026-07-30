const seo = {
  intro:
    "The Superpower Generator turns a hero name and a suit colour into a complete comic-book persona — a power with its own rules, a comic weakness that undercuts it, and a one-line origin story. It works by hashing the characters of your alter-ego name together with your chosen colour and mapping the result onto a hand-written set of powers, so the same name and colour always give you the same hero. Type a name, pick one of six colours, and you get a card you can screenshot for a profile, a party game or a writing prompt.",
  useCases: [
    "Kicking off a team icebreaker where everyone types their own name, reads out their power and weakness, and the room finds out who got the pizza teleportation.",
    "Stuck on a character sheet for a tabletop session and wanting an absurd power-plus-flaw pairing to build a personality around.",
    "Making a birthday card or classroom worksheet where each child's name generates their own hero persona and origin story.",
  ],
  benefits: [
    ["Same name, same hero, every time", "Results come from a hash of your name and colour rather than a random roll, so you can regenerate your persona later and get the identical card."],
    ["Powers come with a catch", "Each power ships with a weakness and an origin, which is what makes it usable as a character rather than a one-word label."],
    ["Colour changes the outcome", "Your suit colour feeds into the hash, so the same name across the six colours can land on different heroes."],
  ],
  faqs: [
    [
      "Will I get the same superpower every time I enter my name?",
      "Yes — the result is derived deterministically from your name and colour, so re-entering both gives the identical power, weakness and origin. Change either one to see a different result.",
    ],
    [
      "How many superpowers can it produce?",
      "There are eight hand-written powers, each with its own weakness and origin story, and six suit colours feeding the selection. That gives 48 name-plus-colour routes into the set, so a small change to your name usually lands you somewhere new.",
    ],
    [
      "Can I use the result for a character in my story or game?",
      "Yes, the personas are original comic-style inventions written for this tool and are meant to be used as prompts. They are deliberately absurd, so treat them as a starting point to build on rather than a finished character.",
    ],
    [
      "Why does my weakness sound sillier than my power?",
      "That is intentional — every power is paired with a flaw that undercuts it, because a power with no cost is dull to play or write. It is the same structure as classic comics, just with a lighter touch.",
    ],
  ],
};

export default seo;
