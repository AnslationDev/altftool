const seo = {
  title: "Reverse Image Search Planner for Your Own Photos",
  metaDescription:
    "Ranks Google Lens, Bing, Yandex and TinEye by what each can actually do, lists the crops to submit, and scores exposure. No photo is uploaded.",
  steps: [
    "Enter 'Photos to audit' — 1 to 50 in one sitting — and pick from 'What are you trying to find?': copies of this exact photo, other photos of my face, whether the location is identifiable, or what text is readable in the frame.",
    "Tick the boxes under 'What do these photos contain?' — shows my face clearly, same photo used on more than one account, shows my home or building exterior, a vehicle number plate, a work badge or office interior, GPS EXIF still in the original, a child's face — each with its weight shown.",
    "Read the Exposure score out of 100 with total searches and hands-on time, then follow 'Step 1 — submit these versions of each photo', 'Step 2 — run them in this order' with an Open link per engine, and 'Step 3 — fix what you found'; Copy plan takes the whole plan.",
  ],
  intro:
    "This planner turns a description of your profile photos into an ordered reverse-image audit: it ranks Google Lens, Bing Visual Search, Yandex Images and TinEye by what each can actually do, lists the crops to submit, and scores the exposure the photos carry. The ranking reflects real engine capability — TinEye finds copies of the same photograph but never a different photo of the same person, and Google deliberately does not offer face matching, while Yandex is the strongest free engine at face similarity. Nothing is uploaded; the tool only produces the plan you then run yourself.",
  useCases: [
    "Check before a job search whether your LinkedIn headshot also appears on a scraper site or a fake dating profile.",
    "Test whether the background of an avatar identifies your building, using a background-only crop with every person removed.",
    "Find the oldest published copy of a photo someone reposted, using TinEye's sort-by-oldest to establish who used it first.",
    "Work out which accounts share one photo, so you can break the cross-platform link before an audit finds it for you.",
  ],
  benefits: [
    ["Ranked by real capability", "Engines are ordered by what they can technically do for your goal, not by popularity."],
    ["Crop strategy included", "Face-only, background-only and text crops each answer a different exposure question."],
    ["Time estimate up front", "Photos multiplied by crops multiplied by engines, at three minutes a search, so you know what you are committing to."],
  ],
  faqs: [
    [
      "Which reverse image search is best for finding photos of a person?",
      "Yandex Images is the strongest free option for finding a different photograph of the same face; Google and TinEye will not do it. Google Lens deliberately does not offer face matching, and TinEye matches only copies of the exact image, including resized and cropped derivatives.",
    ],
    [
      "Does uploading a photo to a reverse image search make it public?",
      "The engine receives your image and may retain it under its own privacy policy, but mainstream reverse-image engines do not add uploads to their public index. Paid face-search services are the real concern, because submitting your face hands a biometric template to a company whose business is selling face lookups.",
    ],
    [
      "Do social networks remove GPS data from my photos?",
      "The major platforms strip EXIF, including the GPS IFD at tag 0x8825, when you upload. Files you send directly — email attachments, chat file transfers, cloud share links to the original — usually keep the coordinates, so strip EXIF yourself before sharing a source file.",
    ],
    [
      "How do I get a copy of my photo taken down from another site?",
      "Start with the host's own reporting form, quoting the exact URL and the original you hold; most platforms honour a copyright or impersonation report from the person in or behind the photo. Keep the URL list from your audit as evidence, and consult a lawyer if the use is defamatory or the site ignores the request.",
    ],
  ],
};

export default seo;
