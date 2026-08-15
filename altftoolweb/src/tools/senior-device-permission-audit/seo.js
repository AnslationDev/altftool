const seo = {
  title: "Senior Phone App Permission Audit: Rank Apps",
  steps: [
    "In 'Apps and permissions', type one app per line as App | permissions | usage note, or load the 'Example phone' preset to see the format.",
    "Keep the 'Use plain-language guidance' toggle on to add senior-friendly action wording to each row's suggested conversation.",
    "Read the 'app(s) to review' result and the table's 'Suggested conversation' column — apps scoring 5 or more are marked 'Review now'; Copy or Download saves the table.",
  ],
  intro:
    "This audit turns a list of the apps on a phone into a ranked shortlist of which ones to question first, by counting how many of nine sensitive permissions each app holds and adding weight when the app is barely used. You type one line per app — name, the permissions it has, and how often it gets opened — and get a table telling you which entries deserve a conversation. It is written for adult children and carers sitting down with a parent or grandparent to tidy up a phone together.",
  useCases: [
    "You are visiting your mother and going through her phone settings screen by screen, and want a written shortlist of which apps to open first rather than tapping through fifty of them.",
    "A free flashlight or game app on your father's phone turns out to hold camera, microphone, contacts and location, and you want to show him plainly why that combination is worth questioning.",
    "You are preparing for a family conversation about a phone and want a printable table of apps and their access so nothing is decided from memory in the moment.",
  ],
  benefits: [
    [
      "Ranks by risk, not alphabetically",
      "An app with four sensitive permissions that nobody has opened in months rises above the banking app that is used every week.",
    ],
    [
      "Gives you the sentence to say",
      "With plain-language guidance on, each row comes with wording aimed at a conversation rather than a settings menu.",
    ],
    [
      "Changes nothing on the device",
      "It produces a list to discuss; every actual permission change stays a deliberate decision made on the phone itself.",
    ],
  ],
  faqs: [
    [
      "Which permissions does it count as sensitive?",
      "Nine: microphone, camera, contacts, location, SMS, phone, accessibility, files and photos. Any of these appearing in an app's permission list adds to that app's score.",
    ],
    [
      "How does it decide an app needs reviewing now?",
      "Each app scores one point per sensitive permission, plus two more if the usage note contains rare, never or unused. A score of 5 or more is flagged Review now, 3 or 4 is Review, and anything under 3 is marked lower concern.",
    ],
    [
      "How do I enter the apps?",
      "One app per line, with three parts separated by the pipe character: app name, then the permissions it holds, then how often it is used — for example Flashlight | camera, microphone, contacts, location | rarely used. The permissions and usage parts can be left blank and the row still appears.",
    ],
    [
      "Is it safe to turn off everything it flags?",
      "No — a high score means worth asking about, not remove. Accessibility, emergency, authenticator, banking, caregiver and medical apps often genuinely need broad permissions, and switching one off can lock someone out of an account or disable a safety feature. Change one permission at a time, know how to reverse it, and check the app still works before moving on.",
    ],
  ],
};

export default seo;
