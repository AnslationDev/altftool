const seo = {
  title: "Etsy Photo Size & 4:3 Thumbnail Crop Checker",
  metaDescription:
    "Check an Etsy photo against the 2000 px rule, JPG/PNG/GIF formats and the 10-photo limit — and see the exact % the 4:3 search thumbnail crops away.",
  steps: [
    "Enter the photo's Width (px), Height (px), File size (MB) and File type — JPG, PNG, GIF, WebP, HEIC or TIFF — plus how many photos the listing already has, or tap a preset like '4:3 landscape' or 'Square'.",
    "Tick 'This is the first photo (the one cropped for search results)' if the image will lead the listing — the 4:3 crop and orientation checks apply only to that photo.",
    "Read the verdict — 'Listing-ready', 'Usable, but the thumbnail suffers' or 'Fix before you list' — with the exact percentage the 4:3 thumbnail trims and the photo slots left, then hit 'Copy report'.",
  ],
  intro:
    "This checker tests an Etsy listing photo against the guidance in Etsy's Seller Handbook: at least 2000 px on the shortest side so the enlarged view stays sharp, JPG, GIF or PNG file types, a maximum of 10 photos per listing, and the 4:3 crop Etsy applies to the first photo in search results. Because that crop is where most sellers lose part of their product, the tool reports the exact percentage of your image the thumbnail discards.",
  useCases: [
    "See how much of a square product photo the 4:3 search thumbnail cuts off before you list.",
    "Check whether a portrait shot should be the first photo or moved further down the gallery.",
    "Confirm a phone photo is large enough for Etsy's enlarged listing view.",
    "Find out how many of the 10 photo slots you have left on a listing.",
  ],
  benefits: [
    ["Thumbnail crop in numbers", "Turns your aspect ratio into the exact share the 4:3 search crop removes."],
    ["First photo treated differently", "Crop and orientation rules apply only to the photo that appears in search."],
    ["Honest about limits", "Etsy's own guidance is applied as published; practical advice is labelled as advice, not as a rule."],
  ],
  faqs: [
    [
      "What size should Etsy listing photos be?",
      "At least 2000 pixels on the shortest side. Etsy lets buyers enlarge listing photos, so anything smaller goes soft the moment someone looks closely. Landscape photos around 3000 x 2250 px match the search thumbnail shape exactly and lose nothing to cropping.",
    ],
    [
      "How does Etsy crop the first listing photo?",
      "Search results show the primary photo in a 4:3 frame, so a centre crop is applied. A square photo loses about 25% of its height that way, and a 2:3 portrait loses about 50%. Leave space around the product so the crop never clips it.",
    ],
    [
      "How many photos can an Etsy listing have?",
      "Up to 10. Etsy encourages using all of them — scale shots, detail shots, packaging and the item in use — because listings with a full gallery answer more buyer questions before the message tab.",
    ],
    [
      "Which file types does Etsy accept for listing photos?",
      "JPG, GIF and PNG. WebP and HEIC are not accepted, so convert an iPhone HEIC export before uploading. JPG is the usual choice for photography because it keeps file sizes small enough to upload reliably.",
    ],
  ],
};

export default seo;
