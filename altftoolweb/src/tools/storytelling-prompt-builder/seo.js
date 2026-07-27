const seo = {
  intro:
    "The Storytelling Prompt Builder turns a one-line premise into a complete fiction-writing prompt with a real narrative arc, point of view, tone, pacing and ending baked in. It structures the story around classic frameworks — Syd Field's three-act structure, the Campbell/Vogler Hero's Journey, Freytag's pyramid or kishōtenketsu — and adds craft constraints such as show-don't-tell and consistent viewpoint. It is built for writers, hobbyists and game designers who want AI story drafts with proper structure instead of meandering output.",
  useCases: [
    "A fiction writer generating a 3,000-word short story draft that follows the three-act structure with a proper midpoint reversal",
    "A tabletop game master creating twist-driven side stories using the kishōtenketsu structure, where the third beat recasts everything before it",
    "A writing student comparing how the same premise plays out under the Hero's Journey versus Freytag's pyramid",
  ],
  benefits: [
    ["Four classic story arcs", "Three-act, Hero's Journey, Freytag's pyramid and kishōtenketsu, each expanded into concrete numbered beats."],
    ["Craft constraints included", "The prompt enforces a single point of view, a held tone, chosen pacing and show-don't-tell rules."],
    ["Ending control", "Choose a resolved, ambiguous or fairly-clued twist ending instead of letting the model default to a tidy wrap-up."],
  ],
  faqs: [
    [
      "How do I write a good story prompt for ChatGPT or Claude?",
      "Give the model a premise, a structure and constraints — not just a topic. A strong storytelling prompt names the narrative arc with its beats (for example the three-act structure: setup ending in an inciting incident, confrontation with a midpoint reversal, then climax and resolution), fixes the point of view and tone, and adds craft rules like showing emotion through action rather than naming it. This builder assembles all of that from your inputs.",
    ],
    [
      "What is the three-act structure in storytelling?",
      "The three-act structure divides a story into setup (about the first quarter, ending in an inciting incident), confrontation (about half the story, with escalating obstacles and a midpoint reversal) and resolution (the final quarter, containing the climax). It was formalised for screenwriting by Syd Field in his 1979 book Screenplay and is the most widely taught story shape in Western fiction and film.",
    ],
    [
      "What is kishōtenketsu and how is it different from Western story structure?",
      "Kishōtenketsu is a four-part East Asian narrative structure — ki (introduction), shō (development), ten (twist) and ketsu (conclusion) — that builds a story around an unexpected recontextualisation rather than around conflict. Unlike the three-act structure, it does not require an antagonist or escalating obstacles, which makes it well suited to quiet, twist-driven short fiction.",
    ],
    [
      "How long is flash fiction versus a short story?",
      "Flash fiction is usually capped at 1,000 to 1,500 words, while most markets define a short story as roughly 1,500 to 7,500 words — the SFWA, for instance, classes anything under 7,500 words as a short story for its awards. This builder targets about 1,000 words for flash, 3,000 for a standard short story and 6,000 for a long short story.",
    ],
  ],
};

export default seo;
