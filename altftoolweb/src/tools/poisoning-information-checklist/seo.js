const seo = {
  title: "Poison Centre Call Checklist and First Aid Script",
  metaDescription:
    "Gather the age, weight, product label and timing a poison centre asks for, get route-specific first aid, and build a script to read down the phone.",
  steps: [
    "Under \"1. Red flags — check these first\", tick anything that applies — Unresponsive or cannot be woken, Fitting or having a seizure, Taken deliberately — and set \"How was the person exposed?\" to Swallowed, In the eye, On the skin, Breathed in, Injected or Bite or sting.",
    "In \"3. What they will ask\", fill the starred required fields — age, weight in kg, the product name exactly as printed on the label, active ingredients, the largest amount that could have been taken, symptoms right now — and set \"When did it happen?\" or press \"Use the current time\".",
    "The panel reports Information gathered as a percentage plus your region's emergency number, poison information line, time since exposure and what is Still missing, then prints route-specific first aid, a Do not list and Your call script; press \"Copy result\" to take the script to the phone.",
  ],
  intro:
    "The Poisoning Information Checklist collects, in one place, the details every poison information centre asks for: who was exposed including age and weight, the exact product name and active ingredients, the largest possible amount, the route, the time it happened, current symptoms, and anything already given. It flags the red-flag signs that mean you should call an ambulance instead of a poison line, gives the first aid specific to the route of exposure, and builds a script you can read down the phone. It is an information aid, not treatment.",
  useCases: [
    "Gather the label details and weight while someone else dials, so the call is not slowed by hunting for a box.",
    "Check the correct first aid for a chemical splash in the eye before doing anything else.",
    "Confirm you should not induce vomiting after a child swallows a household cleaner.",
    "Prepare a printed sheet of local emergency and poison centre numbers before an event, camp or trek.",
  ],
  benefits: [
    ["Red flags come first", "Unresponsiveness, breathing trouble, seizure or deliberate ingestion route you straight to emergency services."],
    ["Route-specific first aid", "Swallowed, eye, skin, inhaled, injected and bite each get their own correct steps."],
    ["A script, not a form", "The answers assemble into the order a poison centre asks for them, with the gaps listed."],
  ],
  faqs: [
    [
      "What information will a poison centre ask for?",
      "Who — the person's age, weight, pregnancy and medical conditions; what — the exact product name and active ingredients from the label; how much — the largest amount that could have been taken; how — swallowed, inhaled, on the skin, in the eye, injected or a bite; when it happened; the symptoms now; and what has already been given or done. They will also want your location and a callback number.",
    ],
    [
      "Should I make someone vomit after swallowing poison?",
      "No. Inducing vomiting is no longer recommended, and syrup of ipecac has been withdrawn from paediatric guidance. Vomiting a corrosive burns the throat a second time, and vomiting a petroleum product risks it going into the lungs. Call a poison centre and follow their instructions instead.",
    ],
    [
      "How long should I rinse a chemical splash?",
      "Fifteen to twenty minutes of lukewarm running water, for both eyes and skin, and keep rinsing while you make the call. For the eye, irrigate from the inner corner outwards with the lid held open, and take contact lenses out once irrigation has started. Do not use neutralising solutions.",
    ],
    [
      "When should I call an ambulance rather than a poison centre?",
      "Immediately, if the person is unresponsive or hard to rouse, is not breathing normally, is fitting, has collapsed, has burns in the mouth or throat, has chest pain or a racing irregular pulse, or if the substance was taken deliberately. In those situations do not spend time on a checklist.",
    ],
  ],
};

export default seo;
