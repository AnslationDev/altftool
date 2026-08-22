const seo = {
  title: "Motorcycle Engine Comparison",
  metaDescription:
    "Compare two bikes on specific power, torque density, BMEP = 2π × nᵣ × torque ÷ swept volume, power-to-weight and mean piston speed at peak power.",
  steps: [
    "For Engine A and Engine B choose 'Start from a published spec' — Hero Splendor Plus through Kawasaki Ninja 650 — or leave it on Custom / edited.",
    "Enter Displacement (cc), Peak power (PS), Peak power rpm, Peak torque (Nm), Kerb weight (kg) and Stroke (mm, optional), then pick Four-stroke or Two-stroke.",
    "The table returns Specific power (PS/L), BMEP (bar), Mean piston speed at peak power (m/s) and the City tractability index; 'Copy result' copies the lot.",
  ],
  intro:
    "Engine displacement comparison puts two motorcycle engines side by side on the derived figures that displacement alone hides: specific power in PS per litre, torque density in Nm per litre, brake mean effective pressure, power-to-weight and mean piston speed at peak power. BMEP is computed from the textbook relation BMEP = 2π x nᵣ x torque ÷ swept volume (nᵣ = 2 for a four-stroke), which is why a 350 cc single making 27 Nm and a 650 cc twin making 64 Nm can be judged on the same scale. It is aimed at buyers and students who want to know why a 155 cc sport bike feels nothing like a 155 cc commuter.",
  useCases: [
    "Deciding between a 200 cc performance single and a 350 cc long-stroke cruiser when both quote similar power-to-weight",
    "Explaining in an automobile engineering assignment why BMEP, not displacement, measures how highly an engine is tuned",
    "Checking whether a bike's peak torque at 4,000 rpm really will be easier in traffic than a rival that peaks at 8,000 rpm",
  ],
  benefits: [
    ["Size-neutral metrics", "Specific power and BMEP let a 110 cc and a 650 cc be compared fairly."],
    ["Shows the stress", "Mean piston speed reveals how hard an engine works to make its peak power."],
    ["Transparent heuristics", "The tractability index publishes its weights instead of hiding them."],
  ],
  faqs: [
    [
      "Does more cc always mean a faster bike?",
      "No. Acceleration follows power-to-weight, not displacement — a 155 cc sport bike at roughly 130 PS per tonne will out-accelerate a 350 cc classic at about 104 PS per tonne. Displacement only sets how much air the engine can move per cycle; tune, gearing and weight decide the result.",
    ],
    [
      "What is BMEP and what is a good value?",
      "Brake mean effective pressure is the average pressure that would produce the engine's measured torque over one power stroke, calculated as 2π x nᵣ x torque ÷ swept volume. Naturally aspirated petrol motorcycle engines typically sit between 9 and 13 bar; forced-induction engines go well past 15 bar.",
    ],
    [
      "What is a normal mean piston speed?",
      "Production four-stroke motorcycles usually run 12 to 22 m/s at peak power, calculated as 2 x stroke x rpm ÷ 60. Racing engines exceed 24 m/s, which is why they need shorter service intervals — friction and inertial loads rise sharply with piston speed.",
    ],
    [
      "Why does peak torque rpm matter more than the torque figure?",
      "Because it decides how often you have to change down. An engine making peak torque at 4,000 rpm pulls cleanly from walking pace in city traffic, while one peaking at 8,000 rpm feels flat until you rev it, even if its headline Nm number is higher.",
    ],
  ],
};

export default seo;
