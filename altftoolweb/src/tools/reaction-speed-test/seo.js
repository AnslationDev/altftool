const seo = {
  title: "Reaction Speed Test: Your Click Time",
  metaDescription:
    "Click when the screen turns green after a random 2-5 s wait. Graded Elite under 150 ms to over 350 ms, with best and average over your last 10 attempts.",
  steps: [
    "Click the panel while it reads 'Click to Start'; it turns amber, shows 'Get Ready...' and holds for a random 2000 to 5000 ms.",
    "Click the instant the panel turns green and reads 'CLICK NOW!' — clicking during the amber phase returns 'Too Soon!' and is discarded.",
    "Your time appears in ms with its band from Elite (under 150 ms) to Keep Practicing (over 350 ms); Best, Average and Attempts cover your last 10 goes.",
  ],
  intro:
    "Reaction Speed Test measures how many milliseconds pass between the screen turning green and your click, then grades the result on a five-band scale from Elite (under 150 ms) to Keep Practicing (over 350 ms). Each round waits a random 2 to 5 seconds before the green signal, so you cannot anticipate it, and clicking early is caught and scored as Too Soon rather than counted. It keeps your last 10 attempts with a running best and average, which is the number worth watching — a single trial says very little about your true reflex speed.",
  useCases: [
    "You want to know whether your reflexes are genuinely fast or just feel fast, so you run ten trials and compare your average against the 200-250 ms Above Average band rather than trusting one lucky click.",
    "You are curious whether coffee, a bad night's sleep, or an hour of gaming actually moves your numbers, and you want a repeatable ten-attempt average to test it before and after.",
    "You and a friend are arguing about who has quicker hands, and you each take ten goes on the same setup so the comparison is on best and average, not one showoff attempt.",
  ],
  benefits: [
    [
      "Randomised wait defeats anticipation",
      "The green signal fires after an unpredictable 2000-5000 ms delay, so you cannot time the click by rhythm.",
    ],
    [
      "Early clicks are caught, not rewarded",
      "Clicking during the amber Get Ready phase returns Too Soon and the attempt is discarded instead of logged as a fast score.",
    ],
    [
      "Grades the result, not just the number",
      "Every attempt is labelled against a fixed five-band scale and stored alongside your best and rolling average of the last 10 tries.",
    ],
  ],
  faqs: [
    [
      "What is a good reaction time on this test?",
      "Under 250 ms is above average and under 200 ms is genuinely quick. The scale here is Elite below 150 ms, Pro 150-200 ms, Above Average 200-250 ms, Average 250-350 ms, and above 350 ms flagged for practice. Most adults clicking a mouse land somewhere in the 200-300 ms range.",
    ],
    [
      "Why do I have to wait so long before the green appears?",
      "The delay is deliberately randomised between 2 and 5 seconds so you cannot learn the timing and click from memory. A fixed delay would measure your rhythm rather than your reaction.",
    ],
    [
      "What happens if I click too early?",
      "You get a Too Soon screen and that attempt is not added to your history, so it cannot inflate your best or average. Click again to start a fresh round.",
    ],
    [
      "How many attempts should I do before trusting the number?",
      "Use the average over all 10 stored attempts rather than any single score. Reaction times vary by tens of milliseconds trial to trial, so one fast click is noise; the average is the figure that actually moves when your alertness changes.",
    ],
  ],
};

export default seo;
