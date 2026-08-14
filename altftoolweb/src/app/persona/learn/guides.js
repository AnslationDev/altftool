/*
 * AltF Persona — guides
 *
 * Six long-form pieces, each answering a question people actually type. They
 * are authored rather than generated, and each one is allowed to say the
 * unflattering thing — a guide where the answer is always "yes, and it is easy"
 * is marketing wearing a guide's clothes.
 */

export const GUIDES = [
  {
    slug: "why-the-face-keeps-changing",
    title: "Why your AI influencer's face keeps changing",
    dek: "Four causes, in the order they usually apply. Most people are doing all four at once and blaming the model.",
    minutes: 7,
    updated: "2026-08-05",
    intro:
      "The complaint is always the same: the first image was perfect and the second one is her sister. The model is rarely the reason. A prompt is not a specification, and four specific habits turn a description into a lottery ticket.",
    sections: [
      {
        heading: "One: you reworded the description",
        body: [
          "This is the biggest single cause and the hardest to notice, because the sentence still means the same thing to you. \"Long dark wavy hair\" and \"dark wavy hair past the shoulders\" are the same fact to a human reader and two different token sequences to a model, and token order changes the weighting of everything after it.",
          "The fix is mechanical rather than clever: write the descriptor once, treat it as a string, and paste it. That is the entire reason the locked line in a character sheet is rendered as code and never as prose — prose invites editing, and editing is the failure.",
        ],
      },
      {
        heading: "Two: the seed is floating",
        body: [
          "Without a pinned seed, re-running the same prompt is a fresh roll. You cannot debug a face you cannot reproduce, and most of the time people spend \"fixing the prompt\" is actually spent comparing two unrelated rolls.",
          "Pin it. Write down which seed produced the frame you kept. Change it deliberately when you want a genuinely different result, and never change it while you are trying to work out what went wrong.",
        ],
      },
      {
        heading: "Three: you changed two things at once",
        body: [
          "New outfit and new location in the same generation. The face moves, and you now have no idea which change moved it — so the next attempt changes three things, and by the fourth you are prompting at random.",
          "One variable per generation is a discipline borrowed from every other experimental practice, and it is unreasonably effective here. It also makes the shot library useful rather than decorative: a shot recipe holds the framing constant so the only thing that varies is the one thing you meant to vary.",
        ],
      },
      {
        heading: "Four: there is nothing to anchor on",
        body: [
          "A face built entirely from flattering adjectives — symmetrical, striking, beautiful — has no landmark, and a model asked for a beautiful face produces the average of every beautiful face it has seen. The average is different every time because the sampling is.",
          "One concrete asymmetric feature does more work than a paragraph of aesthetics. A gap between the front teeth. A small vertical scar through the left eyebrow. A single grey streak at the front. These survive re-rolls because they are unusual enough that the model has to actively place them rather than regress toward the mean.",
          "This is why the studio treats the distinguishing mark as a required field and warns you when you pick \"none\". Choosing none is legitimate — it just means you have moved yourself onto a more expensive production route without noticing.",
        ],
      },
      {
        heading: "When the fix is not a prompt",
        body: [
          "Above a certain level of ambition, no amount of prompt discipline is enough. Three-quarter angles, profiles, motion and unusual light all break a text-only description, because a sentence about a nose says almost nothing about its silhouette.",
          "That is what the production routes are for. If you are posting stills at a fixed distance, the prompt-only route genuinely works. If you are posting video, it does not, and knowing that before you build a workflow on it is worth more than any prompt trick.",
        ],
      },
    ],
    takeaways: [
      "Paste the descriptor, never retype it",
      "Pin the seed before you start debugging",
      "One variable per generation",
      "Give the model one concrete asymmetric feature to hold on to",
      "If it has to move, budget for a reference frame or a trained model",
    ],
  },
  {
    slug: "choosing-a-distinguishing-mark",
    title: "How to choose a distinguishing mark",
    dek: "The single highest-leverage field in a character sheet, and the one people leave blank.",
    minutes: 5,
    updated: "2026-08-05",
    intro:
      "A distinguishing mark is one concrete, asymmetric, describable feature that appears in every prompt. It is the cheapest consistency you can buy, and picking the wrong kind is why some people conclude it does not work.",
    sections: [
      {
        heading: "What makes a good one",
        body: [
          "Three properties. It must be concrete — a thing that either is or is not in the frame, not a quality. It must be asymmetric or otherwise off-centre, because symmetry is what a model regresses to. And it must be visible at the distance you actually shoot at: a small mole is useless in a full-length frame.",
          "\"Striking green eyes\" fails all three. \"Heterochromia, the left iris noticeably lighter\" passes all three.",
        ],
      },
      {
        heading: "The reliable categories",
        body: [
          "Dentition — a visible gap between the front teeth — is the strongest, because it changes the shape of a smile and a smile appears in most frames. Scars work well for the same reason: a small vertical scar through one eyebrow interrupts a line the model would otherwise draw smoothly.",
          "Pigment marks — a scatter of freckles across the nose, a single dark mole high on one cheekbone, a patch of vitiligo across the jaw — are strong at portrait distance and fade at middle distance. Structural features — a pronounced widow's peak, a cleft chin, deep dimples — survive further out.",
          "Hair details do more than any of them at scroll speed, which is why the studio treats them separately: a single grey streak at the front, an undercut on one side, a saturated dye colour. At a hundred pixels wide nobody is reading a face at all, they are recognising a silhouette.",
        ],
      },
      {
        heading: "What to avoid",
        body: [
          "Anything a beauty filter would remove, unless you also put it in the negative prompt. Models have been trained on retouched photographs, so their default behaviour is to retouch — which means the freckles you asked for are quietly airbrushed away in about one generation in three. The negative prompt AltF Persona generates specifically guards whichever mark you chose, for this reason.",
          "Also avoid anything that reads as a medical condition you would be depicting for effect. Vitiligo is on the list because it is a common, ordinary variation and rendering it respectfully is straightforward; a visible injury is not the same thing.",
        ],
      },
      {
        heading: "Choosing none",
        body: [
          "It is a legitimate choice, and the studio does not block it. It means the face has no textual anchor, which pushes the route recommendation up — usually to reference, sometimes to trained. That is not a punishment, it is the honest cost of the decision.",
          "If you are running the trained route anyway, the mark matters much less: the model has learned the face rather than been described it.",
        ],
      },
    ],
    takeaways: [
      "Concrete, asymmetric, visible at your shooting distance",
      "Dentition and scars beat pigment; hair beats everything at scroll speed",
      "Whatever you choose, guard it in the negative prompt",
      "Choosing none is fine — it just moves you to a costlier route",
    ],
  },
  {
    slug: "the-trained-route",
    title: "From one good frame to a trained model",
    dek: "What the trained route actually involves, what it buys, and the two decisions people get wrong before they start.",
    minutes: 8,
    updated: "2026-08-05",
    intro:
      "The trained route is the only one that survives odd angles, bad light and motion. It is also the only one with a real setup cost and a real lock-in, and both are worth understanding before the training run rather than after.",
    sections: [
      {
        heading: "What you are actually building",
        body: [
          "A LoRA is a small set of weights that adjusts a base model toward one subject. You invoke it by a trigger word in the prompt, and from then on the model has learned the face rather than being handed a photograph of it. That difference is why it holds at angles a reference image cannot cover — the reference only knows the view it was taken from.",
          "The practical consequence is that everything downstream gets easier. Shots you could not attempt on the reference route — profiles, walk-toward-camera, anything in motion — become ordinary.",
        ],
      },
      {
        heading: "The training set is the whole job",
        body: [
          "Twelve to twenty frames, and the variety matters more than the count. Different angles, at least two lighting setups, at least three distances. A set of twenty near-identical frames teaches the model one pose rather than one person, and you will not discover that until you ask for something the set never showed.",
          "Generate the set on the reference route first. Approve one frame, use it as a character reference, and produce the variety from there. This is the step people skip, and it is the reason most disappointing LoRAs are disappointing.",
          "Include a profile and a back-of-head frame even though you will never post them. They are what stop the model inventing the parts it never saw.",
        ],
      },
      {
        heading: "Decision one: which base model",
        body: [
          "A LoRA is bound to the base model it was trained on. Moving to a different base means retraining from the same set — which is survivable if you kept the set, and expensive if you did not.",
          "So keep the training set. Version it alongside the character sheet, in the same place, with the seed token in the folder name. The sheet plus the set is the persona; the weights are a build artefact.",
        ],
      },
      {
        heading: "Decision two: where it lives",
        body: [
          "Weights are a file, and a file has a home, a backup and an access policy. If more than one person will use the persona, decide now who can generate with it, because a LoRA that circulates is a face that can be put in frames you did not approve.",
          "This is also the point at which the ethical guardrails stop being abstract. A trained model of an invented person is a tool. A trained model of a real person, built without their written permission, is a publicity-rights problem in most of the markets this site covers, and the training set is the evidence.",
        ],
      },
      {
        heading: "What it does not fix",
        body: [
          "Hands. Packaging text. The physics of a loaded barbell. A trained face makes the face reliable and leaves every other hard thing exactly as hard, which is why the shot library still flags product-in-hand as the frame that deserves the most attention per generation.",
        ],
      },
    ],
    takeaways: [
      "Build the training set on the reference route first",
      "Variety beats volume: angles, two lights, three distances",
      "Keep the set — it is what makes the LoRA rebuildable",
      "Decide who can generate with the weights before you share them",
      "It fixes the face and nothing else",
    ],
  },
  {
    slug: "batching-a-month",
    title: "How to produce a month of content in one sitting",
    dek: "Batching is the entire operational advantage of a synthetic persona, and almost nobody uses it.",
    minutes: 6,
    updated: "2026-08-05",
    intro:
      "A human creator cannot shoot thirty posts on a Tuesday, because their life only happens once. A synthetic persona has no such constraint — and then almost everyone running one organises the work by date anyway, which throws the advantage away.",
    sections: [
      {
        heading: "Organise by setup, not by day",
        body: [
          "Look at a month of planned posts and count the distinct setups rather than the posts. A typical thirty-day plan uses six to ten framings. That means six to ten setup sessions, not thirty — and each one produces every frame in the month that needs it.",
          "The planner in AltF Persona outputs both views deliberately: the calendar, because you need to know what publishes when, and the shot list sorted by frequency, because that is the order you should actually work in.",
        ],
      },
      {
        heading: "Batch within a setup, too",
        body: [
          "Once a setup is producing usable frames, generate more than you need. The marginal cost of the eighth frame in a batch is nothing compared with the cost of coming back to that setup in three weeks and rebuilding the conditions.",
          "Keep the rejects. A frame that is wrong for the post you planned is often right for one you have not planned yet, and a bank of approved frames is what lets an account respond to something on the day.",
        ],
      },
      {
        heading: "Separate generation from publishing",
        body: [
          "These are different kinds of work and they want different states of mind. Generation is fiddly, iterative and best done in a long block. Publishing is quick, contextual and best done close to the moment.",
          "The practical version: one generation day per month, then fifteen minutes a day. The accounts that burn out are the ones doing both every day.",
        ],
      },
      {
        heading: "Where batching goes wrong",
        body: [
          "Two failure modes. The first is batching so far ahead that the content is stale by the time it publishes — reaction and trend pillars cannot be batched at all, which is why the planner keeps them to a small share of any month.",
          "The second is batching without a plan, which produces a folder of nice frames and no posts. The order matters: plan first, derive the shot list, then generate. A folder of images looking for a caption is the most common way a month of work produces nothing.",
        ],
      },
    ],
    takeaways: [
      "Count setups, not posts",
      "Over-generate inside a setup; the marginal frame is free",
      "One generation day, then fifteen minutes a day",
      "Reaction and trend content cannot be batched — plan around that",
    ],
  },
  {
    slug: "disclosure-in-practice",
    title: "The disclosure you owe, and the one you do not",
    dek: "Two obligations, where they sit, and the specific mistakes that turn a technicality into a finding.",
    minutes: 7,
    updated: "2026-08-05",
    intro:
      "Most people running an AI persona are trying to do this properly and get it wrong on placement rather than on intent. The rules are less complicated than they look, and the failures are remarkably consistent.",
    sections: [
      {
        heading: "They are two obligations",
        body: [
          "One: that the depicted creator is synthetic. Two: that the post is commercial, where it is. An #ad label says nothing about whether the person is real, and an AI label says nothing about whether money changed hands. Satisfying one has never satisfied the other, and nothing in any of the regimes on this site treats them as interchangeable.",
        ],
      },
      {
        heading: "Placement is where it actually fails",
        body: [
          "The consistent test across regulators is whether the audience saw the disclosure before engaging, not whether it existed somewhere on the page. That rules out three popular positions: below the 'more' fold, inside a hashtag block at the end, and in the bio only.",
          "The bio is necessary and not sufficient. Someone arriving on a single reel from a feed has not read your bio, and that is the majority of your audience on every short-form surface.",
          "On video, burn it into the first two seconds. Autoplay is muted and captions are collapsed; text below the video has not reached the person who scrolled past.",
        ],
      },
      {
        heading: "Language",
        body: [
          "The disclosure goes in the language of the post. ASCI is explicit about this and the reasoning generalises everywhere: a disclosure the audience cannot read has not disclosed anything. An English '#ad' on a Hindi reel is a finding against you rather than a defence.",
        ],
      },
      {
        heading: "Metadata is not optional",
        body: [
          "Most platform AI labels are driven by provenance metadata written by the generator. Leaving it intact is the low-effort half of compliance, and stripping it is the one action in this whole area that turns a disclosure question into a deception question — people who have chosen to see fewer AI images are relying on that data.",
        ],
      },
      {
        heading: "The one you do not owe",
        body: [
          "You are not obliged to narrate your workflow. Which model you used, how many re-rolls it took, whether the background is composited — none of that is a disclosure obligation, and treating it as one produces captions that are about the tool rather than about the subject.",
          "The obligation is that the audience knows the creator is not a person and knows when they are being sold to. Everything past that is craft, not compliance.",
        ],
      },
      {
        heading: "The line you cannot cross with wording",
        body: [
          "No disclosure makes a fabricated testimonial acceptable. A synthetic persona describing an experience it did not have, presented as a customer experience, is a fabricated endorsement — and in the United States the 2024 rule on fake reviews reaches exactly that. Labelling the persona as AI does not cure it, because the problem is the claim rather than the face.",
        ],
      },
    ],
    takeaways: [
      "Synthetic label and ad label are separate; you need both",
      "Front of the caption, above the fold, in the post's language",
      "Two seconds of on-screen text on any muted-autoplay surface",
      "Leave the content credentials in the file",
      "No disclosure rescues a testimonial nobody had",
    ],
  },
  {
    slug: "choosing-an-honest-niche",
    title: "Choosing a niche where a synthetic creator is honest",
    dek: "Some verticals suit an AI persona and some make it a lie. The difference is whether the content depends on lived experience.",
    minutes: 6,
    updated: "2026-08-05",
    intro:
      "The question is not whether a niche is profitable. It is whether the content genre requires the creator to have done something, because a persona cannot have done anything.",
    sections: [
      {
        heading: "The test",
        body: [
          "Ask what the audience is buying. If they are buying a method — how a thing works, what it costs, which of two options wins — a persona can deliver it honestly, because the method is real and the presenter is declared. If they are buying a testimony — this worked for me, I went there, look what happened to my skin — a persona cannot, at any price.",
          "Most niches contain both genres. The choice is not usually the niche, it is which half of the niche the account lives in.",
        ],
      },
      {
        heading: "Where it works well",
        body: [
          "Anything explanatory. Ingredient chemistry rather than results. Programming rather than transformation. Ownership cost rather than a first drive. Menu literacy rather than restaurant reviews. Routing and budgets rather than travel diaries.",
          "Anything where the subject is an object rather than a person also works: food, interiors, craft, pets, gaming. The face appears in perhaps one frame in four, the identity load collapses, and the cheapest production route holds indefinitely.",
        ],
      },
      {
        heading: "Where it is hard but possible",
        body: [
          "Fitness works if the persona teaches and never demonstrates a transformation. Beauty works if it reads labels and never shows a before-and-after of its own face. Both are viable and both die the moment the account reaches for the format everyone else in the niche uses.",
          "Wellness sits on an ethical edge rather than a factual one: enormous reach, and a synthetic person giving advice to a real one about their mind. Keep it to habit mechanics, put the disclosure in the bio and the pinned post, and stay well away from anything that reads as therapy.",
        ],
      },
      {
        heading: "Where it should not go",
        body: [
          "Anything depicting children. Anything presenting as a licensed professional — medical, legal, financial advice — because the persona cannot hold a licence and the disclosure does not create one.",
          "And any account whose core proposition is the creator's own life. There is no honest version of a synthetic person's day in the life; the format is a claim about experience, and the claim is false however clearly you label the face.",
        ],
      },
      {
        heading: "The counter-intuitive one",
        body: [
          "Gaming is the softest landing on the list, because the audience has been comfortable with invented on-screen identities for twenty years. Face time is low, the voice carries the account, and a declared AI presenter reads as a stylistic choice rather than a deception. If you are testing whether you can run a persona at all, that is the cheapest place to find out.",
        ],
      },
    ],
    takeaways: [
      "Method content is honest; testimony content is not",
      "Object-led niches collapse the identity cost — food, interiors, craft, pets",
      "Fitness and beauty work only if they teach rather than demonstrate",
      "No children, no licensed advice, no day-in-the-life",
    ],
  },
];

export const GUIDE_BY_SLUG = Object.fromEntries(
  GUIDES.map((guide) => [guide.slug, guide]),
);
