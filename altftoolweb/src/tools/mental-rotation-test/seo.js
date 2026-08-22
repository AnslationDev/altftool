const seo = {
  title: "Mental Rotation Test: 15-Trial Spatial Reasoning",
  metaDescription:
    "Judge rotated vs mirrored block figures in 15 keyboard trials. Get accuracy, average reaction time and a spatial grade in the Shepard-Metzler style.",
  steps: [
    "Press \"Start Test (15 Trials)\" and study each pair: a Target Shape shown beside a Comparison figure that is either rotated or mirrored.",
    "Answer with the right arrow (or the \"Same (Rotated)\" button) if the figures match after rotation, or the left arrow (\"Different (Mirrored)\") if the comparison is a mirror image — each response is timed from the moment the pair appears.",
    "After trial 15, read your Spatial Grade with accuracy out of 15 and average reaction time in milliseconds, then press \"Retake Test\" to run again.",
  ],
  intro:
    "The Mental Rotation Test presents 15 same-or-different trials in which a target block figure is shown beside a comparison figure that has either been rotated by 90, 180 or 270 degrees, or mirrored and then rotated. You answer with the right arrow for same and the left arrow for different, and the test records accuracy plus reaction time on every trial. It is a browser version of the classic Shepard-Metzler paradigm for anyone curious about their spatial visualisation ability.",
  useCases: [
    "You are preparing for an aptitude battery for engineering, aviation or the armed forces where spatial reasoning is a scored section, and you want to see how quickly you can judge rotated figures.",
    "You are teaching a psychology class about mental rotation and want students to feel for themselves that response time rises as the rotation angle grows.",
    "You are choosing between hobbies like CAD, chess or 3D modelling and want a rough read on whether manipulating shapes in your head comes easily to you.",
  ],
  benefits: [
    ["Mirror trials, not just rotations", "The \"different\" pairs are horizontally flipped before being rotated, so you cannot pass by matching block counts — you have to check handedness."],
    ["Reaction time per trial", "Every response is timed from the moment the pair appears, so you get an average response time alongside accuracy rather than a bare score."],
    ["Keyboard-driven trials", "Left and right arrow keys answer each trial with a 400 ms gap before the next, keeping response times comparable across the run."],
  ],
  faqs: [
    [
      "How many trials are there and how long does it take?",
      "15 trials, typically a few minutes. Roughly half the pairs are genuine rotations and half are mirror images, decided at random per trial, so guessing consistently lands near 50%.",
    ],
    [
      "What counts as a good score?",
      "This test grades 80% or above as excellent, 60-79% as average and below 60% as below average. Accuracy alone is not the whole picture — a high score with a very long average response time means you are solving the rotation rather than seeing it.",
    ],
    [
      "What is mental rotation actually measuring?",
      "It measures spatial visualisation: your ability to hold a figure in working memory and transform it. In the original Shepard and Metzler work, response time increased roughly linearly with the angle of rotation, which is why the task is treated as evidence of an analogue mental transformation rather than a lookup.",
    ],
    [
      "Can I get better with practice?",
      "Practice reliably improves speed and accuracy on this kind of task, though how far the gain transfers to other spatial skills is debated. Repeated runs here will also benefit from familiarity with the five base figures, so treat later scores as practice effects rather than a change in underlying ability.",
    ],
  ],
};

export default seo;
