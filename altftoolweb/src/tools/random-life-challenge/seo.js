const seo = {
  intro:
    "Random Life Challenge rolls a self-improvement task at random from a 19-challenge deck spanning fitness, mindfulness, learning, kindness and adventure, then tracks it to completion with XP, levels and badges. Each challenge carries a difficulty of easy, medium or hard and a fixed XP value from 10 to 40, and timed ones — a 90-second plank, a 2-minute cold shower, a 5-minute meditation — come with a built-in countdown. Your XP, streak, completed log and level (one level per 100 XP) are stored in your own browser, so progress survives a refresh without an account.",
  useCases: [
    "You have decided to do one small thing for yourself each day but keep defaulting to your phone — rolling a challenge removes the deciding step and hands you a task you can finish before the momentum fades.",
    "You have twenty minutes and want it to count, so you filter to easy challenges only and take whatever comes up rather than spending ten of those minutes choosing.",
    "You are deliberately working on your comfort zone and filter to the Adventure category, chasing the Comfort Breaker badge that unlocks after three of them.",
  ],
  benefits: [
    ["Filter before you roll", "Pick a category and a difficulty first, so a random pick still fits the energy and time you actually have."],
    ["Timed challenges run their own clock", "Challenges with a fixed duration start a countdown in the card, so a 90-second plank or 5-minute meditation is timed where you accepted it."],
    ["Never re-rolls what you are already doing", "Challenges sitting in your active list are excluded from the draw, so accepting several in a row gives you five different tasks."],
  ],
  faqs: [
    [
      "How many challenges are there and how is XP awarded?",
      "There are 19 challenges across five categories, each worth a fixed 10 to 40 XP depending on difficulty — easy tasks pay 10 to 15 XP, hard ones like a 2-minute cold shower pay up to 40. XP is added only when you mark a challenge complete.",
    ],
    [
      "How do levels work?",
      "Your level is your lifetime XP divided by 100, plus one — so you start at level 1, cross into level 2 at 100 XP and level 3 at 200 XP. There is no cap, and XP is never deducted for cancelling a challenge.",
    ],
    [
      "What are the badges and how do I unlock them?",
      "There are five: Initiator for your first completion, Adventurer at 100 lifetime XP, Habit Master at 300 XP, Streak Seeker at a streak count of 3, and Comfort Breaker after three Adventure challenges. They unlock automatically as soon as you cross the threshold.",
    ],
    [
      "Is my progress saved, and can I start over?",
      "Progress is saved in your browser's local storage, so it persists on this device and browser but does not follow you to another one, and clearing site data wipes it. The Reset button clears XP, streak, completions and badge progress in one step and cannot be undone. These are general wellbeing prompts, not a fitness or medical programme — skip anything that does not suit your health and ask a professional if unsure.",
    ],
  ],
};

export default seo;
