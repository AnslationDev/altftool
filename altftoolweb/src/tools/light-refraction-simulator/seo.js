const seo = {
  title: "Snell's Law Simulator: Refraction and Critical Angle",
  metaDescription:
    "Drag the incident angle 0–89° between air, water, glass and diamond. Solves n₁sinθ₁ = n₂sinθ₂ live and flags total internal reflection past θc.",
  steps: [
    "Pick \"Incident Medium 1 (n₁)\" and \"Refracting Medium 2 (n₂)\" from Air (1.0003), Water (1.333), Glass (1.52) or Diamond (2.417).",
    "Drag the \"Incident Angle (θ₁)\" slider anywhere from 0° to 89°; the canvas redraws the incident, reflected and refracted rays against the dashed Normal Line.",
    "Read the Optical Telemetry panel for Refraction Angle (θ₂), Critical Angle (θc) and Relative Ratio (n₁/n₂) — θ₂ reads TIR once the ray is totally internally reflected.",
  ],
  intro:
    "The Light Refraction Simulator draws a laser hitting a boundary between two media and solves Snell's law, n₁ sin θ₁ = n₂ sin θ₂, for the refracted angle in real time as you drag the incident angle from 0° to 89°. Pick the incident and refracting medium from air (n = 1.0003), water (1.333), glass (1.52) or diamond (2.417) and the canvas redraws the incident, reflected and refracted rays against the normal line. When the geometry has no solution the tool flags Total Internal Reflection and reports the critical angle from sin θc = n₂ / n₁.",
  useCases: [
    "Checking why a straw looks bent in a glass of water — set air to water at 45° and see the ray swing to about 32° from the normal",
    "Teaching a class why fibre optics and diamond sparkle work, by stepping the incident angle past the 24.45° diamond-to-air critical angle and watching the refracted ray vanish",
    "Sanity-checking a physics homework answer for θ₂ before writing it up, with the ratio n₁/n₂ shown alongside so you can see which way the light should bend",
  ],
  benefits: [
    ["Snell's law solved live", "θ₂, the critical angle and the n₁/n₂ ratio update on every slider step instead of after a submit."],
    ["Total internal reflection made visible", "When sin θ₂ exceeds 1 the refracted ray disappears and the reflected ray brightens, so the cutoff is something you see, not just read."],
    ["Both directions of the boundary", "Either medium can be the incident one, so you can compare bending toward the normal and away from it with the same setup."],
  ],
  faqs: [
    [
      "What is Snell's law?",
      "Snell's law states that n₁ sin θ₁ = n₂ sin θ₂, where n is a medium's refractive index and θ is the angle measured from the normal — the line perpendicular to the boundary, not the surface itself. The simulator solves it for θ₂ = arcsin((n₁/n₂) sin θ₁) each time you move the angle slider.",
    ],
    [
      "What is the critical angle for water to air?",
      "About 48.6°, from sin θc = n₂/n₁ = 1.0003/1.333. Beyond that angle light hitting the water surface from below is entirely reflected back into the water, which is why the surface looks mirrored when you are underwater looking up at a shallow angle.",
    ],
    [
      "Why does light bend toward the normal going into glass?",
      "Because glass has the higher refractive index (1.52 against 1.0003 for air), so sin θ₂ must be smaller than sin θ₁ to keep both sides of Snell's law equal. Going the other way, from the denser medium into the rarer one, the ray bends away from the normal and can reflect entirely once past the critical angle.",
    ],
    [
      "When does Total Internal Reflection happen?",
      "Only when light travels from a higher index into a lower one and the incident angle exceeds the critical angle — 41.15° for glass to air and 24.45° for diamond to air. If n₂ is greater than n₁ there is no critical angle at all, and the tool shows N/A.",
    ],
  ],
};

export default seo;
