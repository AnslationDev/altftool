const seo = {
  title: "Compliment Generator — 48 Free Random Compliments",
  h1: "Compliment Generator — 48 Compliments Across 6 Categories",
  metaDescription:
    "Free compliment generator with 48 hand-written compliments across 6 categories — personality, looks, talent, kindness and more. Add a name, copy in one tap.",
  intro:
    "The Compliment Generator draws a line at random from 48 hand-written compliments — eight each in personality, appearance, intelligence, talent, kindness and general — using a uniform `Math.floor(Math.random() * list.length)` pick over the category you選 selected. All 48 lines are bundled into the page itself: there is no language model, no API call and no account, so the compliment appears the instant you press the button. Type a recipient's name and the line is rebuilt as a greeting, lowercasing the first word so it reads naturally: \"Hey Priya — your smile could light up the darkest room.\"",
  useCases: [
    "Finish a birthday card or thank-you note when \"happy birthday\" on its own feels thin — pick the kindness or personality set and copy the line straight in.",
    "Write a team shout-out that names a specific quality, choosing the talent or intelligence category instead of another generic \"great work\".",
    "Unstick a toast, caption or message by generating several lines, hearting the ones that sound like you, and rewriting from there.",
  ],
  benefits: [
    [
      "Six categories, not one pile",
      "Personality, appearance, intelligence, talent, kindness and general each hold eight lines, so the compliment matches the thing you actually want to praise.",
    ],
    [
      "Personalised with a name",
      "Enter a name and the compliment is rebuilt as a greeting — \"Hey Sam — you have such a warm and welcoming presence.\" The opener is picked from Hey, Hi, Yo and Oh.",
    ],
    [
      "One-tap copy",
      "The copy button writes the finished line to your clipboard through the browser's Clipboard API, ready to paste into a message, card or caption.",
    ],
    [
      "Nothing is sent anywhere",
      "The full list ships inside the page. No sign-up, no API request, and the name you type never leaves your device.",
    ],
  ],
  faqs: [
    [
      "What is a compliment generator?",
      "It's a tool that gives you a ready-written compliment at the press of a button. This one holds 48 compliments sorted into six categories — personality, appearance, intelligence, talent, kindness and general — and picks one at random from whichever category you choose, optionally addressing it to a name you enter.",
    ],
    [
      "Does this compliment generator use AI?",
      "No. It selects from a fixed list of 48 human-written compliments rather than generating new text with a language model. That means the output is predictable and always readable, but the same line can come up again — each category holds eight, drawn with equal probability, so repeats appear before you have seen all eight.",
    ],
    [
      "Is the compliment generator free and does it need an account?",
      "Yes, it's free, and there is no sign-up or login. Every compliment is part of the page you already loaded, so pressing Generate makes no network request and nothing about your use is sent to a server.",
    ],
    [
      "Can I put someone's name in the compliment?",
      "Yes. Type a name in the optional field and the tool prefixes a greeting — Hey, Hi, Yo or Oh — then lowercases the first letter of the compliment so it flows: \"Hi Maya — your positive energy is absolutely contagious.\" Leave the field blank and you get the compliment on its own.",
    ],
    [
      "What are the compliment categories?",
      "Six: Personality, Appearance, Intelligence, Talent, Kindness and General. Appearance covers style, smile and presence; intelligence covers problem-solving and curiosity; kindness covers generosity and compassion; general covers broad encouragement such as \"You're capable of incredible things.\"",
    ],
    [
      "Are my favourite compliments saved?",
      "Only while the tab is open. The heart button keeps up to 20 compliments in a list on the page, but they are held in memory — refreshing or closing the tab clears them, and nothing is written to browser storage or to a server. Copy anything you want to keep.",
    ],
    [
      "What makes a good compliment?",
      "Specific beats general. \"Your problem-solving skills are truly impressive\" lands harder than \"you're great\" because it names something the person did. Use the category picker to aim at one trait — a talent, a kindness, a way of thinking — and edit the wording so it sounds like you rather than a template.",
    ],
    [
      "Can I use these compliments in a card, text or social post?",
      "Yes. Press the copy icon and the line goes to your clipboard as plain text, ready to paste into a message, greeting card, caption or email. There's no watermark, attribution requirement or usage limit.",
    ],
  ],
  steps: [
    "Choose a category: Personality, Appearance, Intelligence, Talent, Kindness or General.",
    "Optionally type the recipient's name, then press Generate Compliment for a random line from that category.",
    "Use the copy icon to send it to your clipboard, the refresh icon to draw another, or the heart to keep it in the favourites list.",
  ],
};

export default seo;
