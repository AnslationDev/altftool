const seo = {
  title: "Speed Dating Planner: Every Pair Meets Once",
  metaDescription:
    "Circle-method round-robin for speed dating or networking: n-1 rounds, no repeated pair, a start time per round and the total running time.",
  steps: [
    "Paste one name per line into Participants, or load the Six participants preset that fills in Asha, Ben, Chirag, Dia, Eli and Faye.",
    "Set Minutes per meeting and Break between rounds; the circle method holds the first name fixed and rotates the rest one seat a round, and an odd list gains a (sitting out) placeholder so 9 people run as 10.",
    "Read the headline count of non-repeating round(s) and the total minutes, then work down the Round, Starts, Participant A, Participant B and Type table - rows marked Break are the sit-out.",
  ],
  intro:
    "The Speed-Date Rotation Planner builds a round-robin schedule using the circle method — one participant stays fixed while the rest rotate one seat each round — so every person meets every other person exactly once and no pair ever repeats. Paste a list of names, set the minutes per meeting and the break between rounds, and you get a table of rounds with each pairing, its start time in minutes from the beginning, and the total running time. It is for anyone running speed dating, speed networking, mentor matching, interview carousels or classroom conversation rotations.",
  useCases: [
    "You are running a 20-person networking night and need to know before you book the room whether one-to-one rounds will fit in 90 minutes or whether you should cut the meetings to four minutes.",
    "A hackathon has 9 mentors and 9 teams and you want a printed sheet telling each table who arrives next, without two teams turning up at the same mentor.",
    "You are pairing students for language practice in class and need every pair to happen once, plus a clear start time per round so you can call the switch on a timer.",
  ],
  benefits: [
    [
      "Guarantees every pair meets exactly once",
      "The circle-method rotation is a proven round-robin construction: with n people you get n−1 rounds if n is even, or n rounds with one bye per round if n is odd — and no duplicate pairing anywhere in the table.",
    ],
    [
      "Handles odd group sizes with an explicit bye",
      "An odd list gets a BYE added, and the row that draws it is labelled Break rather than silently dropped, so nobody is left standing without knowing why.",
    ],
    [
      "Gives you a clock, not just pairings",
      "Each round shows its start offset in minutes from meetings plus breaks, and the total run time is calculated up front so you can size the session against your venue slot.",
    ],
  ],
  faqs: [
    [
      "How many rounds does a speed dating session need?",
      "With an even number of participants it needs n−1 rounds — 6 people take 5 rounds, 20 people take 19. Each round runs n/2 conversations in parallel, so the round count, not the head count, drives how long the evening lasts.",
    ],
    [
      "What happens if I have an odd number of people?",
      "A placeholder called BYE is added to make the count even, so 9 participants are scheduled as 10 and run for 9 rounds. Each round one real person is paired with BYE and their row is marked Break — that sit-out rotates, so it does not fall on the same person twice.",
    ],
    [
      "How long will the whole session take?",
      "Total time is rounds x minutes per meeting plus (rounds − 1) x break, because the last round is not followed by a break. Six people at 5-minute meetings with 1-minute breaks come to 29 minutes; the same settings with 16 people come to 89 minutes.",
    ],
    [
      "Can the same two people be scheduled together twice?",
      "No. Within the n−1 rounds the rotation produces, each unordered pair appears exactly once — that is the defining property of the circle method. If you want a second pass, run the session again rather than extending the round count.",
    ],
  ],
};

export default seo;
