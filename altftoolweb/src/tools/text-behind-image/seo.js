const seo = {
  intro:
    "This is a poster composer that sandwiches a headline between two copies of your photo: the image is drawn once as the background, your uppercase text sits on top of it, and a second copy of the same image is blended back over the text in multiply mode so the picture reads through the letters. You control the wording, the text colour, its opacity from 10 to 100 percent and its size from 48 to 240 pixels, and the 16:10 canvas updates live. It suits anyone who wants the editorial magazine-cover look without opening a layer-based editor.",
  useCases: [
    "You are making a title card for a travel reel and want the destination name to sit inside the photo rather than float on top of it",
    "You need a quick event or gig poster where one word — a band name, a date, a place — carries the whole design over a single photograph",
    "You are testing how a headline reads against a candidate hero image before committing to it in a real design file",
  ],
  benefits: [
    ["Real blend, not a flat overlay", "The photo is composited back over the type in multiply mode, so the letters pick up the image's texture and shadows instead of sitting flatly above it."],
    ["Every control is live", "Colour, opacity and size all redraw the canvas as you drag, so you can judge legibility against the actual photo rather than guessing."],
    ["Nothing leaves the page", "Your photo is loaded as a local object URL and composed in the browser, so an unpublished shot is never uploaded anywhere."],
  ],
  faqs: [
    [
      "Does this cut the subject out of the photo automatically?",
      "No — there is no background removal or subject segmentation here. The depth effect comes from re-blending the whole image over the text at 35 percent opacity in multiply mode, which reads as 'behind' without needing a mask. For a true cutout you would need a separate background remover.",
    ],
    [
      "How do I save the finished poster?",
      "Use the Print / Save button, which opens your browser's print dialog — from there choose 'Save as PDF' (or a printer) to keep the composition. There is no separate PNG export step.",
    ],
    [
      "My text is disappearing into the picture. What should I change?",
      "Raise the text opacity toward 100 and pick a colour far from the busiest part of the photo. Opacity is adjustable between 10 and 100 percent, and because a dark scrim already sits over the background image, light text on a dark photo is usually the safest starting point.",
    ],
    [
      "How big can the text go?",
      "Up to 240 pixels, with a floor of 48. The headline wraps within 92 percent of the canvas width, so long phrases break onto extra lines rather than overflowing — short, one or two-word text holds up best at the top of that range.",
    ],
  ],
};

export default seo;
