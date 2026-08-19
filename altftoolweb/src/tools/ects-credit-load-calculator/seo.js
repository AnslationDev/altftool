const seo = {
  title: "ECTS Credit Load Calculator: Credits per Semester",
  metaDescription:
    "See how many ECTS you must earn each remaining semester and the 25-30 h/credit workload per week; loads over 30 ECTS are flagged as overload.",
  steps: [
    "Enter 'Total ECTS your degree requires' — or tap a preset like 'Bachelor — 180 ECTS (3 years)' — plus ECTS already earned and Semesters remaining.",
    "Adjust 'Workload hours per ECTS (25–30)' and 'Weeks of study per semester' to match your programme.",
    "Read ECTS needed per semester with workload hours per semester and per week — anything above 30 ECTS is flagged — then press Copy result.",
  ],
  intro:
    "This planner calculates how many ECTS credits you must earn in each remaining semester to graduate on time, and converts that load into study hours using the ECTS Users' Guide standard of 60 credits per academic year, 30 per full-time semester and 25-30 workload hours per credit. It flags plans that exceed the standard 30-ECTS semester as overloads. It is built for students at European universities balancing course selection, thesis semesters and part-time work.",
  useCases: [
    "A bachelor's student with 90 of 180 ECTS done checking whether three remaining semesters keeps them at a normal 30-credit load",
    "A master's student who failed two modules recalculating the per-semester load needed to still finish in four semesters",
    "An exchange-bound student testing how a lighter 20-ECTS semester abroad shifts the load onto later semesters",
  ],
  benefits: [
    ["Official ECTS arithmetic", "Uses the Users' Guide standards: 60 ECTS/year, 30/semester, 25-30 hours per credit."],
    ["Real workload hours", "Translates credits into hours per semester and per week you can sanity-check against your calendar."],
    ["Overload warning", "Anything above 30 ECTS per semester is flagged so you can plan an extra term instead."],
  ],
  faqs: [
    [
      "How many ECTS credits is full-time study?",
      "60 ECTS per academic year, which is 30 ECTS per semester — this is the definition in the European Commission's ECTS Users' Guide. Registering for more than 30 in a semester is an overload that many universities require special approval for.",
    ],
    [
      "How many hours of study is one ECTS credit?",
      "25 to 30 hours of total workload per credit under the ECTS Users' Guide, counting lectures, seminars, self-study and exams. A standard 30-ECTS semester therefore represents roughly 750-900 hours, or about 40-45 hours per week across a 20-week semester.",
    ],
    [
      "How many ECTS do I need for a bachelor's or master's degree?",
      "A Bologna bachelor's requires 180 ECTS (3 years) or 240 ECTS (4 years), and a master's requires 60-120 ECTS depending on length. A combined bachelor-plus-master pathway totals at least 300 ECTS in most countries.",
    ],
    [
      "Can I take more than 30 ECTS in one semester?",
      "Often yes, but with limits — many universities cap registration around 35-42 ECTS or require dean's approval above the standard 30. Before planning an overload semester, check your examination regulations; spreading credits into a summer term is frequently the safer route.",
    ],
  ],
};

export default seo;
