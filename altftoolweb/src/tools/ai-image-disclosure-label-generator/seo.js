const seo = {
  intro:
    "This generator turns a short description of how a piece of media was made into a matching disclosure set: a visible badge, a caption sentence, an alt-text ending and the IPTC Digital Source Type term that belongs inside the file. It maps each level of AI involvement to the correct IPTC NewsCodes value — trainedAlgorithmicMedia for a fully generated image, compositeWithTrainedAlgorithmicMedia for a photo with generative fill, algorithmicallyEnhanced for upscaling — and flags where the EU AI Act's Article 50 transparency duties or the FTC's testimonial rule are likely to bite. It is aimed at social teams, publishers and freelancers who need the label to be accurate rather than decorative.",
  useCases: [
    "A brand social manager captioning a fully generated hero image for Instagram and needing wording that survives the 2,200-character caption limit",
    "A newsroom picture desk recording the right IPTC digitalsourcetype value on a photo where a distraction was removed with generative fill",
    "A freelance video editor deciding whether a synthetic voice-over in a client ad needs an on-screen disclosure as well as the platform toggle",
  ],
  benefits: [
    [
      "Correct IPTC term",
      "Picks the right Digital Source Type NewsCode instead of tagging everything as AI-generated.",
    ],
    [
      "Fits the caption budget",
      "Counts characters against the platform limit and falls back to a one-sentence version when needed.",
    ],
    [
      "Flags the real obligations",
      "Warns on deepfake, commercial-endorsement and missing-C2PA cases with the rule that applies.",
    ],
  ],
  faqs: [
    [
      "Do I legally have to label AI-generated images?",
      "It depends where you publish and what the image shows. In the EU, Article 50(4) of the AI Act requires anyone deploying an AI system that produces a deep fake to disclose that the content is artificially generated or manipulated, and Article 50(2) requires providers to mark synthetic output in a machine-readable format; those transparency obligations apply from 2 August 2026. Outside that, platform policies and advertising law usually do the work instead of a general labelling statute.",
    ],
    [
      "What is the IPTC digital source type field?",
      "It is a metadata field, Iptc4xmpExt:DigitalSourceType, that records how a piece of media was produced using a controlled vocabulary published at cv.iptc.org. The values this tool uses are trainedAlgorithmicMedia (made by a model trained on sampled content), compositeWithTrainedAlgorithmicMedia (a real capture with generated parts), algorithmicMedia (procedural, no trained model), algorithmicallyEnhanced (upscaled or cleaned up) and digitalCapture (a straight photograph).",
    ],
    [
      "Do I need to disclose AI upscaling or noise reduction?",
      "Usually no. Upscaling, denoise, sharpening and auto colour do not add anything to the scene, so most platform policies and editorial codes treat them as ordinary processing and the matching IPTC value is algorithmicallyEnhanced rather than a generative term. Disclose anyway if the enhancement changed what the picture appears to show, and always disclose in news and evidentiary contexts.",
    ],
    [
      "What are Content Credentials and do they replace a caption?",
      "Content Credentials are the C2PA provenance manifest embedded in the file, and they do not replace a caption — they complement it. A manifest lets platforms apply their own label automatically and lets viewers inspect the history, but it can be stripped on export or re-upload, so a human-readable line in the caption is the part that survives. The most robust setup is both: the manifest in the file and the sentence in the post.",
    ],
  ],
};

export default seo;
