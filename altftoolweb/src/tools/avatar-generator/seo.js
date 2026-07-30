const seo = {
  intro:
    "The Avatar Generator builds a vector portrait as inline SVG from seven feature choices — face shape, eyes, eyebrows, mouth, hair, facial hair and accessory — across four illustration styles, four editable colours and six background treatments. Every avatar is produced by a seeded mulberry32 pseudo-random generator, so the same seed always redraws exactly the same face and any avatar you like can be reproduced later. It is for anyone who needs a profile picture, a placeholder headshot or a set of matching team portraits without hiring an illustrator or using a photo of themselves.",
  useCases: [
    "Replacing a photo on a public profile with something recognisable but not identifying, when you would rather not have your face indexed by search engines.",
    "Filling a design mockup or a demo user list with distinct-looking people, using a different seed per user so the faces stay stable across screenshots.",
    "Making a matching set for a small team: pick one style and background, then vary skin, hair and features so the avatars read as a family rather than a random collection.",
  ],
  benefits: [
    [
      "Same seed, same face, every time",
      "Generation runs through a deterministic hash-and-PRNG chain rather than a random draw, so a seed you keep will regenerate the identical avatar months later — no need to archive the file.",
    ],
    [
      "Vector under the hood, sharp at any size",
      "The avatar is drawn as SVG on a 240x240 canvas and exported at three times pixel density, so a 32-pixel favicon and a 720-pixel profile picture come off the same source without softening.",
    ],
    [
      "Randomise, then take control",
      "Randomise and the curated palette generator give you a starting point, and every field stays editable afterwards — you are not stuck rerolling until something lands.",
    ],
  ],
  faqs: [
    [
      "How many different avatars can it make?",
      "Over 550 million distinct combinations from the built-in options alone: 4 styles, 6 backgrounds, 3 face shapes, 4 eye types, 3 eyebrow types, 4 mouths, 5 hairstyles, 3 facial-hair options, 4 accessories, 6 skin tones, 8 hair colours, 8 background colours and 7 accent colours. Custom colour values push it far higher.",
    ],
    [
      "Does this use AI to generate faces?",
      "No. Despite the AI-style label, there is no model and no image generation — the avatar is drawn from explicit SVG shapes chosen by a seeded pseudo-random number generator. The practical upshot is that nothing is uploaded, output is instant, and results are reproducible rather than one-off.",
    ],
    [
      "What formats can I export?",
      "PNG download at 3x pixel ratio, and copy to clipboard as a PNG image where the browser supports the async clipboard with ClipboardItem. If it does not, the copy falls back to an SVG data URL you can paste into a text field or editor.",
    ],
    [
      "Can I use the avatar commercially?",
      "The avatars are generated from geometric shapes in your own browser and are not derived from any photograph or third-party artwork, so there is no model release or stock licence involved. If it will represent a brand or appear in a paid product, check the site's terms for the current usage position.",
    ],
  ],
};

export default seo;
