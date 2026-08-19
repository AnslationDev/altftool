const seo = {
  title: "Attendance Calculator: Classes to Skip at 75%",
  metaDescription:
    "Work out your attendance percentage, how many classes in a row you must attend to reach 75%, and how many you can still skip — with the algebra shown.",
  intro:
    "The Attendance Percentage Calculator works out your current attendance as attended ÷ total held × 100 and then answers the question that actually matters: how many classes in a row you must attend to reach the cutoff, using x ≥ (p × total − attended) ÷ (1 − p), or how many you can skip while staying above it, using z ≤ attended ÷ p − total. Enter the classes remaining in the semester and it also reports your maximum safe bunks, your final percentage if you attend everything, and your final percentage if you attend nothing. It shows the algebra behind each answer, with one-click targets at 65%, 70%, 75%, 80% and 85%.",
  useCases: [
    "You are at 42 of 50 classes with a 75% requirement and want to know how many lectures you can miss before the department flags you — the answer is 6.",
    "You have fallen to 60% with a 75% cutoff and need to know whether recovery is even possible this term, and how many consecutive classes it would take (30, from 30 of 50).",
    "There are 30 classes left before the exam form deadline and you want your maximum safe bunks and your finishing percentage under best and worst cases before planning a trip home.",
  ],
  benefits: [
    ["Answers the skip question, not just the percentage", "It converts your position into a concrete count of classes you can miss or must attend, rather than leaving you to solve the inequality yourself."],
    ["Shows the algebra", "Each answer prints the working, including the unrounded figure before it is floored or ceilinged, so you can verify it against your college's own rounding."],
    ["Warns when the target is already unreachable", "If perfect attendance for every remaining class still finishes below the cutoff, it says so explicitly instead of quietly showing an impossible target."],
  ],
  faqs: [
    [
      "How do I calculate attendance percentage?",
      "Divide classes attended by total classes held and multiply by 100. Attending 42 of 50 classes gives 42 ÷ 50 × 100 = 84%. Only classes actually held count in the denominator, so a cancelled lecture changes nothing.",
    ],
    [
      "How many classes can I skip and still keep 75%?",
      "Skippable classes z satisfy attended ÷ (total + z) ≥ 0.75, so z ≤ attended ÷ 0.75 − total, rounded down. At 42 of 50 that is 42 ÷ 0.75 − 50 = 6 classes. Every class you skip after that drops you below the cutoff.",
    ],
    [
      "How many classes must I attend to get back to the required percentage?",
      "Attend x consecutive classes where x ≥ (p × total − attended) ÷ (1 − p), with p as the required fraction. From 30 of 50 with a 75% target that is (37.5 − 30) ÷ 0.25 = 30 classes in a row. The closer the requirement is to 100%, the faster this number explodes.",
    ],
    [
      "What if even perfect attendance is not enough?",
      "The semester planner detects this and says so: it compares your best possible finish, (attended + remaining) ÷ (total + remaining), against your target. When that is still short, no amount of attending fixes it, and the next step is your course coordinator and whatever condonation or medical-leave rules your institution has — check your own handbook, since cutoffs and rounding rules vary by university.",
    ],
  ],
};

export default seo;
