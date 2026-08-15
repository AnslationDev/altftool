const seo = {
  title: "Photo Editor App Permission Audit: 0-100 Privacy",
  metaDescription:
    "Score a photo editor's permissions against the system photo picker baseline: 0-100 privacy score, ranked revoke list and each grant's manifest name.",
  intro:
    "The Photo Editor App Permission Audit scores an image-editing app against the system photo picker baseline: since Android 13 and iOS 14 an app can receive the one file you chose with no permission at all. Anything beyond that — full-library access, All files access, ACCESS_MEDIA_LOCATION for the GPS tags inside your photos, and cloud upload of originals for AI filters — is scored as an extra the app has to justify. You get a 0-100 privacy score, a ranked revoke list and the manifest name of each grant.",
  useCases: [
    "Switch an editor from full gallery access to 'Select photos' and see the score change.",
    "Check whether an AI retouch feature is uploading your originals to a server.",
    "Audit a free editor that started showing ads after an update.",
    "Decide which of two editors to keep based on what each one can reach.",
  ],
  benefits: [
    [
      "Photo picker as the baseline",
      "The safest way to edit one image needs no permission at all, so full-library grants have to earn their place.",
    ],
    [
      "Covers EXIF location",
      "ACCESS_MEDIA_LOCATION gives an app a map of where you shoot without ever asking for the Location permission.",
    ],
    [
      "Treats cloud processing as a permission",
      "Server-side filters copy your originals off the device, which the audit scores alongside the runtime grants.",
    ],
  ],
  faqs: [
    [
      "Does a photo editor need access to all my photos?",
      "No. Android 13's photo picker and iOS 14's Limited Access hand the app only the image you selected, with no permission prompt. Full-library access is convenient for batch editing but exposes every screenshot and document photo you have taken.",
    ],
    [
      "What is ACCESS_MEDIA_LOCATION and should I allow it?",
      "It lets an app read the GPS coordinates your camera embedded in each photo. Denying it does not stop editing — it only stops the app from learning where every picture was taken — so allow it solely if you need the map or geotag feature.",
    ],
    [
      "Are AI photo filters uploading my pictures?",
      "Often, yes. Background removal, upscaling and one-tap retouch usually run on the vendor's servers, which means the original image and any faces in it leave your device. Check the privacy policy for retention and the terms for the licence you grant over uploaded images.",
    ],
    [
      "How do I stop a photo editor from seeing my whole gallery?",
      "On Android 14 open Settings > Apps > the app > Permissions > Photos and videos and choose 'Select photos'. On iOS open Settings > the app > Photos and choose 'Limited Access', then pick only the images it should see.",
    ],
  ],
};

export default seo;
