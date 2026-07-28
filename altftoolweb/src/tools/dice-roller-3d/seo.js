const seo = {
  title: "3D Dice Roller — Roll D4 to D20 Dice Free Online",
  h1: "3D Dice Roller — Roll D4 to D20 Online",
  metaDescription:
    "Roll D4, D6, D8, D10, D12 or D20 — up to 10 dice at once, with an 800ms tumble animation, instant total and a 20-roll history. Free, in-browser.",
  intro:
    "The 3D Dice Roller throws between 1 and 10 dice of any standard polyhedral type — D4, D6, D8, D10, D12 or D20 — and totals them for you. Each face is drawn independently with JavaScript's Math.random(), mapped to a result as Math.floor(Math.random() × sides) + 1, so every face on the die is equally likely. The roll plays as an 800 ms CSS tumble — a bounce plus a random rotation of up to 720° — with the dice cycling through random faces before they settle; D4 and D6 land as classic pip faces, while D8 and larger show the rolled number. Everything runs as client-side React in your browser: no account, no network request while you roll, and nothing saved about your results.",
  useCases: [
    "Playing D&D or another tabletop RPG without physical dice — roll a single D20 for a check, or four D6 for an ability score, and read the total off the screen.",
    "Board and card games that stall for a missing D6 — everyone watches the same phone or laptop instead of hunting under the sofa.",
    "Classroom probability demos — roll 10 D6 several times in a row and compare the individual faces and totals in the roll history.",
  ],
  benefits: [
    [
      "Six die types, up to ten at a time",
      "D4, D6, D8, D10, D12 and D20 are each one tap away, and the counter runs from 1 to 10 dice per throw. Dice are tinted from an eight-color palette so you can tell them apart in the results row.",
    ],
    [
      "Every face equally likely",
      "Each die is an independent draw computed as Math.floor(Math.random() × sides) + 1 — a uniform integer between 1 and the number of sides, with no weighting and no memory of what came before.",
    ],
    [
      "Totals and a roll log you can check",
      "The individual faces and their sum appear the moment the animation ends, and the last 20 rolls stay listed with die type, dice count, every result, the total and a timestamp.",
    ],
    [
      "Nothing to install, nothing to sign up for",
      "The roller is entirely client-side. It makes no network calls while you roll and writes nothing to your device, so it works from the second the page loads.",
    ],
  ],
  faqs: [
    [
      "Is this 3D dice roller actually random?",
      "Yes — each die is an independent draw from JavaScript's Math.random(), scaled with Math.floor(Math.random() × sides) + 1, so all faces are equally likely. Math.random() is a fast pseudo-random generator rather than a cryptographic one; if you want crypto.getRandomValues()-backed rolls, AltFTool's standard Dice Roller uses that instead.",
    ],
    [
      "How many dice can I roll at once?",
      "Up to 10. The minus and plus controls are clamped between 1 and 10 dice, and every die in a throw uses the type you selected — mixing a D20 and D6s in one roll isn't supported, so roll them separately.",
    ],
    [
      "Which dice does it support?",
      "Six standard polyhedral dice: D4, D6, D8, D10, D12 and D20. D4 and D6 render as pip faces with white dots; D8, D10, D12 and D20 display the rolled number in the middle of the die.",
    ],
    [
      "Is the roll real 3D physics?",
      "No — the tumble is a CSS animation, not a physics simulation. The result is decided the instant you press Roll, then the dice bounce and spin through random faces for 800 milliseconds before settling on it. The animation never changes the outcome.",
    ],
    [
      "Does it save my roll history?",
      "It keeps the last 20 rolls, newest first, with die type, dice count, each individual face, the total and the time of the roll. That log lives in the page's memory only — reloading or leaving the page clears it, and nothing is written to your device or sent to a server.",
    ],
    [
      "Is the 3D dice roller free?",
      "Yes, free with no account and no usage limit. The whole tool is client-side JavaScript that runs in your browser, so there is nothing to install and no sign-in step before you roll.",
    ],
    [
      "Can I roll a d100 or add a +3 modifier?",
      "Not in this roller — it tops out at D20 and simply sums the dice you threw, with no modifiers. AltFTool's standard Dice Roller covers d4 through d100 and supports modifiers and running statistics.",
    ],
    [
      "How do I roll D&D stats or a D20 attack?",
      "For an attack or skill check, select D20, leave the count at 1 and press Roll Dice. For an ability score, select D6 and set the count to 4 — you get all four faces listed individually plus their total, so you can drop the lowest yourself.",
    ],
  ],
  steps: [
    "Pick a die type from the button row — D4, D6, D8, D10, D12 or D20.",
    "Set how many dice to throw with the minus and plus controls, anywhere from 1 to 10.",
    "Press Roll Dice. After the 800 ms tumble the faces settle, the individual results and total appear below, and the throw is added to your roll history.",
  ],
};

export default seo;
