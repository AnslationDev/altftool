const seo = {
  title: "Space Rocks: Asteroid-Style Shooter in Your Browser",
  metaDescription:
    "Thrust-and-drift asteroid shooter: rocks split from large to small for 20, 50 and 100 points, waves add rocks and speed, keyboard or touch controls.",
  steps: [
    "Press Start on the overlay, then rotate with Left/Right or A/D, thrust with Up or W and fire with Space — or use the on-screen touch pads on a phone.",
    "Shoot every rock: large rocks split into two mediums and mediums into two smalls, scoring 20, 50 and 100 points; clear the field to start the next, faster wave.",
    "Watch Score, Best, Wave and Lives in the header; P pauses, and the Game over overlay reports your score and wave with a Play again button, best score saved in-browser.",
  ],
  intro:
    "Space Rocks is a browser remake of the classic vector asteroid shooter: you fly a thrust-and-drift ship around a wrapping playfield, shooting drifting rocks that split from large into two mediums and then into two smalls before vanishing. It is for anyone who wants a couple of minutes of arcade reflex play with real inertia physics rather than a game where the ship stops when you let go. You start with three lives, clear every rock to advance a wave, and each wave adds a rock and a little speed.",
  useCases: [
    "You have five minutes between meetings and want a quick reflex game that starts instantly with no account, install or tutorial.",
    "You are showing someone what early-1980s arcade physics felt like — momentum, screen wrap, no braking — and want a playable example rather than a video clip.",
    "You are chasing your own high score on a phone and need on-screen thumb pads instead of a keyboard.",
  ],
  benefits: [
    [
      "Momentum you have to fly against",
      "The ship accelerates at 250 px/s² up to a 340 px/s cap with exponential drag, so stopping means turning around and thrusting — the drift is the game.",
    ],
    [
      "Smaller rocks are worth more",
      "A large rock scores 20, a medium 50 and a small 100, so finishing the splits pays far better than picking off big targets and running.",
    ],
    [
      "Waves scale on two axes",
      "Each wave adds one rock, up to 8, and multiplies rock speed up to 1.7x, so the field gets busier and faster rather than just bigger.",
    ],
  ],
  faqs: [
    [
      "What are the controls?",
      "Left/Right or A/D rotate, Up or W thrusts, Space fires and P pauses. On touch screens the same actions are on-screen pads, so the game is playable one-handed on a phone.",
    ],
    [
      "How many bullets can I fire at once?",
      "Four shots can be alive at a time, with a 0.22-second cooldown between them, and each bullet expires after travelling 400 pixels. That limit is what stops you clearing a wave by holding fire — you have to aim.",
    ],
    [
      "What happens when a rock is destroyed?",
      "A large rock splits into two mediums, each medium splits into two smalls, and smalls are destroyed outright. Clearing every rock on screen ends the wave, and the next wave spawns rocks away from your ship so you are not killed on arrival.",
    ],
    [
      "How many lives do I get, and am I safe after respawning?",
      "Three lives. After a hit the ship reappears about 1.2 seconds later at the centre with roughly 2.6 seconds of invulnerability, shown as a shield ring, giving you time to fly clear before it wears off.",
    ],
  ],
};

export default seo;
