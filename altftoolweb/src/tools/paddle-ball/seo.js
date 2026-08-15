const seo = {
  title: "Paddle Ball Arcade: Two-Paddle Rally Game, First",
  metaDescription:
    "Play a two-paddle rally game in your browser — W/S vs arrow keys or touch, three computer difficulties, speed rising every hit, first to 7 points wins.",
  steps: [
    "Pick Vs Computer or 2 Players, choose Easy, Medium or Hard, and press Start match",
    "Move your paddle with W/S or the arrow keys, or drag on your half of the court — every return speeds the ball up and edge hits angle it sharply",
    "First side to 7 points wins; the Rally and Best rally counters track your streak, and Play again restarts the match",
  ],
  intro:
    "Paddle Ball Arcade is a browser remake of the classic two-paddle rally game, where the first side to reach 7 points wins the match. You steer your paddle with W/S, the arrow keys, or a finger drag on the court, and the ball leaves your paddle at an angle set by how far from the paddle's centre you hit it — up to roughly 53 degrees off the horizontal at the very edge. Play alone against a three-level computer opponent or hand the other half of the screen to a second player.",
  useCases: [
    "You have ten minutes between meetings and want a quick game that loads instantly and finishes in one sitting — a race to 7 points usually takes a couple of minutes.",
    "Two people are sharing one laptop or tablet and want a head-to-head match: the left paddle takes W/S or the left half of the screen, the right paddle takes the arrow keys or the right half.",
    "You are practising reaction timing and want a measurable target, so you keep restarting to push your longest rally past the personal best the game remembers for you.",
  ],
  benefits: [
    [
      "Angle control, not luck",
      "The rebound direction is computed from where the ball struck the paddle face, so aiming at an opponent's weak side is a real skill rather than a coin flip.",
    ],
    [
      "Rallies that genuinely escalate",
      "Every successful return multiplies ball speed by about 4.5%, climbing from a 380 px/s serve toward a 940 px/s ceiling, so long rallies get harder instead of looping forever.",
    ],
    [
      "An opponent you can actually match",
      "Three difficulty levels change both how fast the computer paddle tracks the ball and how much aim error it carries each serve, so Easy misses often and Hard almost never does.",
    ],
  ],
  faqs: [
    [
      "How many points do you need to win a game?",
      "Seven points wins the match. Each time the ball goes past a paddle the other side scores one point, and the game ends the moment either score reaches 7.",
    ],
    [
      "Can two people play on the same device?",
      "Yes — switch to 2 Players mode and each side gets its own controls. The left paddle uses W/S or drags on the left half of the court, the right paddle uses the arrow keys or drags on the right half.",
    ],
    [
      "Does the ball get faster during a rally?",
      "Yes. The ball starts each serve at 380 pixels per second and gains about 4.5% speed on every paddle hit, capped at 940 pixels per second so the game stays playable no matter how long the rally runs.",
    ],
    [
      "How do I make the ball go where I want?",
      "Hit it off-centre. The bounce angle is proportional to the distance between the ball and the middle of your paddle, reaching about 53 degrees off horizontal at the paddle tips, so centre hits send it flat and edge hits send it steep.",
    ],
  ],
};

export default seo;
