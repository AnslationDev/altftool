const seo = {
  title: "Face Shape Detector — Free AI Analysis From a Photo",
  h1: "Face Shape Detector",
  metaDescription:
    "Upload a photo to detect your face shape — oval, round, square, heart, diamond or oblong — from 68 facial landmarks, entirely in your browser.",
  intro:
    "The Face Shape Detector places 68 facial landmarks on a photo you upload and works out whether your face reads as oval, round, square, heart, diamond or oblong from the proportions between those points. It runs face-api.js (the maintained @vladmandic fork) on TensorFlow.js inside your browser, using two models — TinyFaceDetector at a 320-pixel input size to find the face, and the 68-point landmark network to map it — served from this site rather than a third-party API. Your photo is read into an in-memory canvas and analysed on your own device, so it is never uploaded to a server. The classification itself is geometric rather than a trained shape classifier: it compares face width against face height, and forehead width taken from the outer brow landmarks against jaw width, to pick the closest of the six shapes.",
  useCases: [
    "Working out which glasses frames, haircut or fringe advice actually applies to you before a salon or optician appointment",
    "Settling the oval-versus-round question with measured facial proportions instead of holding a photo next to a diagram",
    "Checking the same face across a few photos to see how much angle, lighting and hair position move the result",
  ],
  benefits: [
    [
      "68-point landmark geometry",
      "The shape comes from measured distances between detected landmarks — width against height, forehead against jaw — not from a rough eyeball of a thumbnail.",
    ],
    [
      "Nothing leaves your device",
      "The image is turned into a local object URL, drawn to a canvas in the page, and analysed there. No upload, no server round trip, no stored copy.",
    ],
    [
      "Six shapes, one named answer",
      "Oval, round, square, heart, diamond and oblong, with a single shape returned and a confidence figure alongside it.",
    ],
    [
      "Free, no signup",
      "No account, no credits and no usage limit — the models download once and then run locally.",
    ],
  ],
  faqs: [
    [
      "How do I find out my face shape?",
      "Upload a clear, front-facing photo — the detector places 68 landmarks on your face and compares the proportions between them to name one of six shapes. It is the same comparison you would do by hand with a tape measure across forehead, cheekbones, jawline and face length, done from the landmark coordinates instead.",
    ],
    [
      "How accurate is a face shape detector?",
      "It is a measured estimate, not a verdict. Landmark detection on a clear front-facing photo is reliable, but the shape is then decided by fixed ratio thresholds — face width against height, and forehead width against jaw width — so a face sitting near a boundary can read as oval in one photo and square in another. Head tilt, camera distance, hair covering the forehead or jaw, and wide-angle phone lenses all shift those ratios.",
    ],
    [
      "What face shapes can it detect?",
      "Six: oval, round, square, heart, diamond and oblong. Round and square are separated by how wide the face is relative to its height, oblong by a face noticeably longer than it is wide, and heart versus diamond by whether the forehead is wider or narrower than the jaw.",
    ],
    [
      "Does the face shape detector upload my photo?",
      "No. The file you choose stays in the browser as an object URL, is drawn onto a canvas in the page, and is analysed by models running in your own tab. No network request carries the image, and nothing persists once you reset or close the page.",
    ],
    [
      "Is this face shape detector free?",
      "Yes — free, with no account, no signup and no cap on how many photos you analyse. The detection and landmark models are downloaded from this site and then run on your device, so there is nothing per-use to meter.",
    ],
    [
      "Why does it say no face detected?",
      "The detector did not find a face in the image. The usual causes are a face that is small in the frame, turned too far to the side, strongly backlit or shadowed, or a very low-resolution photo. Analysis runs at a 320-pixel input size, so a head-and-shoulders crop in even light works far better than a full-body shot.",
    ],
    [
      "Can I use my webcam instead of uploading a photo?",
      "No — this tool accepts an image file only, either by clicking the drop zone to browse or by dragging a photo onto it. Take the picture with your camera app first, then upload it.",
    ],
  ],
  steps: [
    "Click the drop zone to browse for an image, or drag a front-facing photo onto it — hair back off the forehead and jaw, face square to the camera, even lighting.",
    "Wait while the face detection and 68-point landmark models load and run in your browser; the first analysis takes a few seconds because the model weights are fetched.",
    "Read the detected shape with its confidence figure and the facial proportion readouts below it, then choose Analyze Another to try a different photo.",
  ],
};

export default seo;
