const seo = {
  intro:
    "Tap Glider is a one-input arcade game: every tap, click or press of Space, Up or W gives the glider an upward kick of 430 pixels per second while gravity pulls it back down at 1500 px/s², and each pillar gap you slip through is one point. The difficulty ramps with your score — the gap starts at 174 pixels and narrows by 1.6 pixels per point down to a floor of 118, while scroll speed climbs from 148 px/s to a capped 236 — so the run gets harder in a way you can feel rather than suddenly. Medals land at 10 points for bronze, 20 for silver and 40 for gold, and your best score is kept in the browser.",
  useCases: [
    "You have four minutes before a meeting and want a game you can start, lose and close without an install, an account or a tutorial",
    "You are trying to beat a friend's score on a shared laptop and need the best-score counter to keep tallying between rounds",
    "You want something playable one-handed on a phone in a queue, where a single tap is the entire control scheme",
  ],
  benefits: [
    ["Difficulty ramps by score, not by level", "Gap width and scroll speed are recalculated every point, so run 1 and run 50 feel different without any menu or setting."],
    ["Three keyboard bindings plus tap", "Space, Arrow Up, W, a click or a touch all flap, and P pauses — nothing needs configuring before you start."],
    ["Respects reduced-motion preferences", "If your system asks for reduced motion, the idle screen stops hovering and scrolling instead of animating regardless."],
  ],
  faqs: [
    [
      "How do I get a gold medal?",
      "Score 40 points. Bronze is awarded from 10 points, silver from 20 and gold from 40 — and by 35 points the gap has already narrowed to its 118-pixel minimum, so gold means holding a steady rhythm at maximum difficulty rather than surviving a new obstacle type.",
    ],
    [
      "Does the game keep getting faster forever?",
      "No, the speed is capped. Scrolling starts at 148 pixels per second and gains 2.4 per point, but the bonus stops at 88 — so from roughly 37 points onward the world moves at a constant 236 px/s and the challenge is entirely the narrow gaps.",
    ],
    [
      "Is my best score saved?",
      "Yes, in this browser only. It is written to localStorage under a per-game key and updated whenever you beat it, so it survives closing the tab but not clearing site data or moving to another browser or device. In private mode, storage may be blocked and the best score lasts only for the session.",
    ],
    [
      "Any technique for lasting longer?",
      "Flap in short, regular taps rather than waiting until you are falling fast. A flap sets your vertical speed to a fixed −430 px/s no matter how quickly you were dropping, so a rescue tap from a steep fall costs no more than a routine one — but a burst of taps pins you against the ceiling, where further flaps are wasted and you have to wait to fall back to the gap.",
    ],
  ],
};

export default seo;
