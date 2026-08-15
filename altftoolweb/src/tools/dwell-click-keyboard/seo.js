const seo = {
  title: "Dwell-Click Keyboard: Type by Hovering, No Clicking",
  metaDescription:
    "On-screen QWERTY that types when the pointer rests on a key. Dwell time adjusts 400-3000 ms; Space, Delete, Clear and Speak keys included.",
  steps: [
    "Set the \"Dwell duration\" slider to suit your pointer — it spans 400 ms to 3000 ms in 100 ms steps and starts at 1000 ms.",
    "Rest the pointer on a key in the QWERTY rows; the key highlights while the timer runs and the letter is entered when it completes, while moving away cancels it — Tab focus and an ordinary click select the same key too.",
    "Watch the message build in the text box, using the Space, Delete and Clear keys to edit it and the Speak key to read it aloud through the browser's speech synthesis.",
  ],
  intro:
    "Dwell-Click Keyboard is an on-screen QWERTY keyboard that types a letter when the pointer rests on a key for a set dwell time, with no click or button press needed. The dwell duration is adjustable from 400 ms to 3000 ms in 100 ms steps and starts at 1000 ms, and the key you are dwelling on is highlighted with a progress indicator so the pending selection is visible. It is intended for people who can move a pointer, head tracker or eye-gaze cursor accurately but find clicking painful, unreliable or impossible.",
  useCases: [
    "Someone recovering from a hand injury needs to write a short message without pressing a mouse button, so they hover each key long enough to select it instead.",
    "A carer is trialling dwell timing with a family member before buying dedicated AAC hardware, and needs to find whether 700 ms or 1600 ms produces fewer accidental selections.",
    "A head-pointer or eye-gaze user has a device that moves the cursor well but has no reliable click switch, and needs a keyboard that treats resting as selecting.",
  ],
  benefits: [
    [
      "Dwell time you can tune mid-sentence",
      "The slider spans 400–3000 ms in 100 ms increments, so tremor or slow tracking can be accommodated without restarting or reconfiguring anything.",
    ],
    [
      "Three ways to select the same key",
      "Hovering, keyboard focus via Tab and a plain click all trigger the same action, so the layout stays usable if the pointer method changes part-way through.",
    ],
    [
      "Speaks the finished text aloud",
      "A Speak key reads the composed message through the browser's built-in speech synthesis, turning the keyboard into a basic communication aid rather than just a text box.",
    ],
  ],
  faqs: [
    [
      "What is dwell clicking?",
      "Dwell clicking selects an on-screen target by keeping the pointer still over it for a preset time instead of pressing a button. Here the default is 1000 ms — hold the pointer on a key for one second and the letter is typed; move away before the timer completes and nothing is entered.",
    ],
    [
      "How do I stop accidental letters being typed?",
      "Increase the dwell duration — moving from the 1000 ms default toward the 3000 ms maximum gives more time to pass over a key without selecting it. The timer resets the moment the pointer leaves a key, so passing across the row does not queue up selections.",
    ],
    [
      "Which keys are available besides letters?",
      "The 26 letters in three QWERTY rows, plus Space, Delete, Clear and Speak. Delete removes the last character, Clear empties the whole message, and Speak reads the current text aloud using the browser's speech synthesis voice.",
    ],
    [
      "Does it work with eye-gaze or head-tracking devices?",
      "Yes, provided the device moves the standard system pointer, since selection is driven by ordinary pointer-enter and pointer-leave events. Devices that emit their own clicks work too, because clicking a key selects it immediately without waiting for the dwell timer.",
    ],
  ],
};

export default seo;
