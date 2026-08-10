const seo = {
  title: "Chore Chart Maker: Round-Robin Rota for Any Household",
  metaDescription:
    "Deals chores out round-robin — chore 1 to person 1, wrapping back at the end — so any two people differ by at most one chore. Same lists, same chart.",
  intro:
    "The Chore Chart Maker takes a list of chores and a list of people and deals the chores out round-robin, so chore number 1 goes to the first person, chore 2 to the second, and the count wraps back to the start once everyone has one. It is built for households, flatshares and classrooms that want an assignment nobody can argue with, and it returns a two-column chart of every chore next to the name it landed on. Because the order is fixed by position rather than chosen at random, the same two lists always produce the same chart.",
  useCases: [
    "Four housemates keep arguing over who took the bins out last — paste the six weekly chores and the four names, and the wrap-around order settles it without anyone volunteering or being volunteered.",
    "A parent splitting Saturday jobs between three kids wants each one to get a different first task each week; reordering the name list shifts everybody one slot down the rotation.",
    "A teacher assigning classroom duties to a group of students needs a printable list showing exactly which duty belongs to which name before the term starts.",
  ],
  benefits: [
    [
      "Even by construction",
      "With N people, the workload gap between any two of them is at most one chore, because assignment wraps position by position.",
    ],
    [
      "Reproducible, not random",
      "The same chores and the same name order always yield the same chart, so there is nothing to re-roll and nothing to dispute.",
    ],
    [
      "Rotation by reordering",
      "Move a name to the top of the list and every chore shifts one slot, which gives you next week's rotation from the same input.",
    ],
  ],
  faqs: [
    [
      "How does it decide who gets which chore?",
      "It walks the chore list in order and assigns chore at position i to the person at position i modulo the number of people. With three names and six chores, person one gets chores 1 and 4, person two gets 2 and 5, person three gets 3 and 6.",
    ],
    [
      "What happens if there are more chores than people?",
      "The name list simply repeats. Ten chores across four people gives two people three chores each and two people two chores each — the maximum difference in any split is one chore.",
    ],
    [
      "Can I make the chores rotate week to week?",
      "Yes, by rotating the name list. Cut the first name and paste it at the bottom, and every chore moves one person along, which is the standard way to run a weekly rota from the same chore list.",
    ],
    [
      "Are the chores assigned randomly?",
      "No. The assignment is strictly positional, so there is no shuffling and no luck involved. If you want a different pairing, change the order of the lines you paste in rather than re-running the tool.",
    ],
  ],
};

export default seo;
