const seo = {
  title: "Garden Fence Calculator: Posts, Bays & Concrete",
  metaDescription:
    "Turn a fence length into a take-off: posts, evenly re-spread bays, panels, wire and post-hole concrete with cement bags at a 1:2:4 mix.",
  steps: [
    "Enter the Total fence length or perimeter, unit and Total gate width, then pick a Fence style — it fills in typical spacing, panel width and strand count.",
    "Set Maximum post spacing, Fence height above ground, Post section width (mm) and corners, and tick the closed-perimeter box if the run returns to its start.",
    "Read Posts required with bays, panels, wire, buried depth and 50 kg cement bags at a 1:2:4 mix, then press Copy result.",
  ],
  intro:
    "A fence take-off is a chain of three counts — bays, then posts, then the concrete under them — and this calculator runs all three from one length. It divides the run (minus gate openings) by your maximum post spacing, rounds bays up and re-spreads the spacing evenly so the last bay is not a stub, then sizes each post hole by the standard fencing rule of burying one third of the above-ground height with a 600 mm minimum, in a hole three times the post's width.",
  useCases: [
    "You are fencing a 40 m plot boundary with one 1 m gate and need the post count before going to the timber yard.",
    "You want to know how many bags of cement to buy for 18 post holes rather than guessing and returning half of them.",
    "You are comparing a 1.83 m panel fence against strained wire and want the material list for each side by side.",
  ],
  benefits: [
    ["Spacing that actually divides", "Rounds bays up and re-spreads them evenly, so you never finish a run on an awkward 40 cm bay."],
    ["Concrete per hole, not guesswork", "Computes hole volume less the post itself, then converts to cement bags at a 1:2:4 nominal mix."],
    ["Corner posts counted separately", "End and corner posts carry side load and need bracing — they are listed apart from line posts."],
  ],
  faqs: [
    [
      "How far apart should fence posts be?",
      "Between 1.8 m and 3 m centre to centre depending on the fence. Prefab panels fix the spacing at the panel width, usually 1.83 m; picket and close-board runs at 2.4 m; post-and-rail at up to 2.7 m; and strained wire or chain link at up to 3 m. Wider spacing sags, and a taller fence needs the posts closer because of wind load.",
    ],
    [
      "How deep should a fence post go into the ground?",
      "Bury about one third of the above-ground height, with 600 mm as the practical minimum. A 1.2 m fence therefore takes a 600 mm hole and a 1.8 m post; a 1.8 m fence takes a 600 mm hole by the same rule but is usually set deeper, around 750 mm, because wind load rises steeply with height.",
    ],
    [
      "How much concrete does one fence post need?",
      "About 35–40 litres for a 100 mm post in a 300 mm hole 600 mm deep, once the post's own volume is subtracted. Ten such posts come to roughly 0.36 m³ of concrete, which is around three 50 kg bags of cement in a 1:2:4 mix plus sand and aggregate.",
    ],
    [
      "How many posts do I need for a fence?",
      "One more than the number of bays for an open run, and exactly the same as the number of bays for a closed loop that returns to its start. Adding a gate opens the loop, so a gated perimeter needs the extra post too — the two gate posts are the run's end posts.",
    ],
  ],
};

export default seo;
