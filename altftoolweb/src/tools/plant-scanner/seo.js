const seo = {
  intro:
    "Plant Scanner identifies a plant from a single photo and returns the three most likely species, each with a match probability and its botanical family, genus and order. Upload an image up to 4 MB or shoot one straight from a phone camera; the scanner first checks whether the picture contains a plant at all, then ranks the candidates and links each one to its Wikipedia entry. It suits gardeners, hikers and new plant owners who have a specimen in front of them and no name for it.",
  useCases: [
    "A houseplant arrived as a gift with no label and you need the species name before you can look up its light and watering needs.",
    "You spot a seedling coming up in a border and want to know whether it is a wildflower worth keeping or a weed to pull before it sets seed.",
    "On a walk you photograph an unfamiliar shrub and want the family and genus so you can check whether the berries are anything a dog should be kept away from.",
  ],
  benefits: [
    [
      "Three ranked candidates, not one guess",
      "Each suggestion carries its own probability score, so a 62% top match next to a 30% runner-up tells you to look at both rather than trust the first.",
    ],
    [
      "Rejects non-plant photos up front",
      "The response includes an is-plant flag, so a picture of a rug or a pet is refused instead of being force-fitted to a species.",
    ],
    [
      "Full taxonomy plus a source to verify",
      "Family, genus and order are shown for every candidate alongside a Wikipedia link, so you can confirm the identification against a written description.",
    ],
  ],
  faqs: [
    [
      "What image size and format can I upload?",
      "Any standard image format up to 4 MB. Files above that limit are rejected before anything is sent, and non-image files are refused outright; on a phone the camera option captures directly from the rear-facing camera.",
    ],
    [
      "How accurate is the identification?",
      "It depends on the photo, which is why every result shows a percentage match. A clear, well-lit, centred shot of leaves, flowers or bark usually produces a confident top candidate, while a distant or cluttered frame tends to spread probability across the three suggestions.",
    ],
    [
      "Is my photo sent to a server?",
      "Yes. The image is encoded and posted to an identification service, because species recognition cannot run locally in the browser. If the service is unavailable the upload controls are disabled and no image is transmitted at all.",
    ],
    [
      "Can I use it to tell whether a plant is safe to eat or touch?",
      "No, treat it as informational only. Several toxic species closely resemble edible ones, and a percentage match is not a safety verdict; confirm any foraging or toxicity question with a local expert, a regional field guide, or poison control.",
    ],
  ],
};

export default seo;
