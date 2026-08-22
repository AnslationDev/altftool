const seo = {
  title: "AI Object Counter: 80 COCO Classes in Browser",
  metaDescription:
    "Runs COCO-SSD via TensorFlow.js in your tab to box and tally 80 object classes; re-threshold from 10-95% without re-detecting. Images never uploaded.",
  intro:
    "AI Object Counter runs the COCO-SSD detector on TensorFlow.js inside your browser to find and count the 80 everyday object classes in the COCO dataset — people, cars, bottles, chairs, dogs, laptops and the rest — drawing a labelled bounding box around each one and a per-class tally beside it. The model is run once at a 20% confidence floor and the results are re-filtered live by a slider, so you can raise or lower the threshold and watch the count change without re-detecting. Nothing is uploaded: the model weights are fetched once and the image is processed on a canvas in the tab.",
  useCases: [
    "You photographed a car park or a shelf and need a defensible count rather than eyeballing it, with a box drawn around each object you can check",
    "You are checking a crowd photo and want to see how the person count changes between a 40% and a 70% confidence threshold before you quote a number",
    "You are prototyping a computer-vision idea and want to know whether an off-the-shelf COCO detector even sees the objects in your sample images",
  ],
  benefits: [
    [
      "Re-threshold without re-running",
      "Detection happens once at a 20% floor and the confidence slider filters client-side, so changing the threshold is instant instead of a fresh model pass.",
    ],
    [
      "Per-detection evidence",
      "Every detection gets a cropped 96x72 thumbnail and its own confidence score, so you can see exactly what the model counted rather than trusting a total.",
    ],
    [
      "Survives a bad GPU path",
      "If WebGL warmup stalls past 45 seconds the loader falls back to the CPU backend and retries, so detection still completes on machines where GPU acceleration misbehaves.",
    ],
  ],
  faqs: [
    [
      "What objects can it detect?",
      "The 80 COCO categories — person, bicycle, car, motorcycle, bus, truck, traffic light, dog, cat, bottle, cup, chair, laptop, cell phone and so on. Anything outside that list, including faces, text, logos and specialised industrial parts, will not be counted no matter how clear it is in the photo.",
    ],
    [
      "What confidence threshold should I use?",
      "The default is 40%, which is a reasonable balance for clear photos. Lower it toward the 20% floor when objects are small or partly hidden and you would rather over-count and prune manually; raise it above 60% when a false positive costs more than a miss.",
    ],
    [
      "Why did it miss objects in a crowded photo?",
      "The tool uses the lite_mobilenet_v2 base of COCO-SSD, which trades accuracy for speed and struggles with heavily overlapping, very small, or partly occluded objects. Cropping the image into sections and counting each one usually recovers more than lowering the threshold does.",
    ],
    [
      "Does my image get uploaded?",
      "No. The COCO-SSD weights are downloaded to your browser once, and detection runs there via TensorFlow.js — the image itself is only ever drawn to a local canvas. After the first load, detection works with the network disconnected.",
    ],
  ],
};

export default seo;
