const seo = {
  title: "One-Handed Typing Practice for Left or Right Hand",
  metaDescription:
    "Type short prompts using one hand's QWERTY key group. Accuracy is scored character by character against the prompt, alongside approximate WPM.",
  steps: [
    "Choose Left hand or Right hand in the 'Practice hand' select; the 'Suggested key group' panel shows Q W E R T · A S D F G · Z X C V B or Y U I O P · H J K L · N M.",
    "Type the sentence shown into the box labelled 'Type the prompt here…' — timing starts on your first keystroke, and 'New prompt' loads the next sentence and clears the box.",
    "Watch the Accuracy, Approx. WPM and Characters tiles update as you type; 'Prompt complete' appears once your text matches the prompt exactly.",
  ],
  intro:
    "The One-Handed Keyboard Trainer gives you short typing prompts to practise with a single hand, showing the key group that hand covers on a standard QWERTY board — Q W E R T · A S D F G · Z X C V B for the left, Y U I O P · H J K L · N M for the right — and scoring each attempt for accuracy and approximate words per minute. Accuracy is measured character by character against the prompt, so a mistyped letter shows up immediately rather than at the end. It is for people typing one-handed after an injury, with a limb difference, or while the other hand is occupied.",
  useCases: [
    "You are in a cast for six weeks and need to keep working, so you want structured practice on the hand you can still use instead of hunting for keys in a real document.",
    "An occupational therapist has suggested one-handed typing practice and you want short, low-pressure prompts with a visible accuracy number to track progress between sessions.",
    "You hold a baby or a phone with one hand most of the day and want to build enough single-hand speed that replying does not mean putting everything down.",
  ],
  benefits: [
    ["Shows the key group, not just the text", "Each hand selection lists the exact QWERTY keys that hand naturally reaches, so you learn a reach pattern rather than improvising."],
    ["Character-level accuracy", "Every typed character is compared with the same position in the prompt, so the accuracy percentage reflects real errors instead of only counting finished words."],
    ["Accuracy before speed", "Accuracy, approximate WPM and a characters-completed counter are shown side by side, and the prompts themselves are short sentences designed to be finished comfortably."],
  ],
  faqs: [
    [
      "Which keys does each hand cover when typing one-handed?",
      "On a standard QWERTY layout the left hand covers Q W E R T, A S D F G and Z X C V B; the right hand covers Y U I O P, H J K L and N M. The trainer displays the group for whichever hand you select so you can practise reaching the far side of your half without looking down.",
    ],
    [
      "What is a realistic one-handed typing speed?",
      "One-handed typing on a standard keyboard typically settles well below two-handed speed, so treat your own baseline from the first few prompts as the number to beat rather than a general benchmark. The trainer's WPM figure starts counting from your first keystroke and updates as you type.",
    ],
    [
      "How is accuracy calculated here?",
      "It is the share of typed characters that match the prompt at the same position, expressed as a percentage. Because it is positional, a single dropped letter shifts everything after it and the score falls sharply — which is deliberate, since inserted or missing characters are the errors that cost the most time to fix.",
    ],
    [
      "Should I switch to a one-handed keyboard layout?",
      "Only if you will be typing one-handed long term. Layouts such as one-handed Dvorak can help permanent single-hand users but require relearning from scratch, so for a temporary injury it is usually faster to practise the standard layout — which is what these prompts and key groups are built around.",
    ],
  ],
};

export default seo;
