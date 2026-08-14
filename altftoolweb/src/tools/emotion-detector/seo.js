const seo = {
  title: "Emotion Detector: 7 Expression Scores per Face",
  metaDescription:
    "Scores every detected face across happy, sad, angry, surprised, fearful, disgusted and neutral. face-api.js runs in your browser — no upload.",
  steps: [
    "Choose Upload Photo or Live Webcam, then drop a JPG, PNG or WEBP under 10MB onto the Select Photo area.",
    "Wait while \"Running AI Face Analytics...\" shows — the Tiny Face Detector runs at inputSize 512 with scoreThreshold 0.5 and traces 68 facial landmarks.",
    "Read the Analysis Report: Dominant Mood, an Emotion Matrix bar for all seven expressions, and Technical Integrity scored out of 100, then hit Download, Share or Copy.",
  ],
  intro:
    "The Emotion Detector runs face-api.js models in your browser to find faces in a photo or webcam frame and score each one across seven expression classes — happy, sad, angry, surprised, fearful, disgusted and neutral — returning a confidence value for every class rather than a single label. It uses the Tiny Face Detector at a 512px input size with a 0.5 score threshold, plus the 68-point facial landmark model to trace jaw, brows, eyes, nose and mouth. Models are downloaded once and everything after that runs locally with WebGL, so no image is ever uploaded.",
  useCases: [
    "You are reviewing a batch of portrait shots for a campaign and want to check which frames actually read as happy rather than neutral before sending a shortlist.",
    "You are building an accessibility or UX demo and need a local, no-server way to show live expression scores from a webcam feed.",
    "You are teaching a class about computer vision and want students to see the 68 landmark points and the full seven-way probability distribution on their own faces.",
  ],
  benefits: [
    [
      "Full probability distribution per face",
      "Every detected face returns a score for all seven expressions, so you can see a 0.61 happy alongside a 0.28 neutral instead of just the winning label.",
    ],
    [
      "Image quality is scored too",
      "Each face gets a 0-100 quality read built from average brightness, edge strength and detection score, surfaced as lighting, blur and visibility ratings so you know when a low confidence is the photo's fault.",
    ],
    [
      "Multiple faces in one pass",
      "detectAllFaces returns every face above the threshold, each with its own bounding box, landmarks and emotion matrix.",
    ],
  ],
  faqs: [
    [
      "Which emotions can it detect?",
      "Seven: happy, sad, angry, surprised, fearful, disgusted and neutral. These are the classes the face-api.js expression network was trained on, and each face gets a confidence score for all seven that sum to roughly 1.",
    ],
    [
      "Are my photos or webcam video uploaded anywhere?",
      "No. The detection and landmark models are fetched once from this site and then run entirely in your browser tab via WebGL; the image data itself never leaves your device. Recent results are kept in sessionStorage — the last 10 entries — and clear when you close the tab.",
    ],
    [
      "Why does it miss a face in my photo?",
      "The Tiny Face Detector only reports faces scoring above 0.5 confidence at a 512-pixel input size, so small, heavily angled, partially covered or poorly lit faces get dropped. The quality panel flags this: average brightness under 80 is rated Poor lighting, and low edge strength is reported as High blur.",
    ],
    [
      "How accurate is facial emotion detection?",
      "Treat the output as an estimate of facial expression, not of what a person feels. These models infer from muscle geometry alone and are affected by lighting, camera angle, glasses, facial hair and cultural differences in expression — they should never be used to make decisions about individuals in hiring, security, healthcare or education.",
    ],
  ],
};

export default seo;
