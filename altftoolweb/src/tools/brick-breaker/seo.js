const seo = {
  title: "Brick Breaker: 6 Levels, 3 Lives, Paddle Aiming",
  metaDescription:
    "Six hand-built levels and three lives. Bounce angle comes from where the ball hits the paddle. Catch W, S and M capsules. Mouse, touch or arrows.",
  steps: [
    "Move the paddle with your mouse, a touch drag or the arrow keys; A and D also work.",
    "Tap, click or press Space to launch, then strike the ball off the paddle edge to angle it sideways; press P to pause.",
    "Clear the wall to reach the Next level overlay; losing your third ball ends the run at Game over with your score and best kept.",
  ],
  intro:
    "Brick Breaker is a paddle-and-ball arcade game with six hand-built levels, three lives and three brick strengths, where the angle the ball leaves your paddle depends on where it hits — centre sends it straight up, the outer edge kicks it up to about 60 degrees sideways. Clear every brick to advance; each level raises the ball speed by a fixed step, and destroyed bricks have a 14 percent chance of dropping a capsule that widens the paddle, slows the ball or splits it into a multiball. It runs on mouse, touch drag or arrow keys, keeps your best score, and pauses itself when you switch tabs.",
  useCases: [
    "You have ten minutes between meetings and want a short arcade run that saves your best score instead of an endless scroller.",
    "You are on a phone with one hand free and need a game you can play with a thumb drag rather than on-screen buttons.",
    "You want to practise angle control — aiming the ball into a gap at the side of the wall by hitting it off the edge of the paddle instead of the middle.",
  ],
  benefits: [
    ["Aim with the paddle, not luck", "The bounce angle is taken from where the ball strikes the paddle, so you can deliberately steer the ball into a column you want to open."],
    ["Six designed layouts, not random walls", "Warm-up wall, checkerboard, pyramid, diagonal lanes, diamond and fortress are deterministic, so a level looks the same every attempt and can be learned."],
    ["Fast balls cannot tunnel through bricks", "The physics substeps movement to a maximum of 6 pixels per collision check, so a high-level ball never passes through a brick it should have hit."],
  ],
  faqs: [
    [
      "How do you control the paddle in Brick Breaker?",
      "Move it with your mouse, a touch drag, or the left and right arrow keys (A and D also work). Launch the ball with a tap, a click or Space, and press P to pause.",
    ],
    [
      "What do the falling capsules do?",
      "There are three: W widens the paddle for 12 seconds, S slows the ball to 65 percent speed for 9 seconds, and M splits the ball into a multiball, up to a maximum of 6 balls on screen. A destroyed brick drops one about 14 percent of the time, and you collect it by catching it on the paddle.",
    ],
    [
      "How is the score calculated?",
      "Every brick hit scores 10 points, and the hit that destroys a brick adds a further 20 points per strength tier. So a one-hit green brick is worth 30, and a three-hit red brick is worth 10 + 10 + 70 = 90 points in total.",
    ],
    [
      "How many levels and lives are there?",
      "Six levels and three lives. Losing your last ball costs a life and resets the ball on the paddle; losing the third ends the run, and clearing level 6 wins the game.",
    ],
  ],
};

export default seo;
