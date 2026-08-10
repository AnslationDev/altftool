const seo = {
  title: "Baby Wake Window Planner: Nap Schedule by Age & Bedtime",
  metaDescription:
    "Give it age, wake time and target bedtime; it picks the nap count and exact nap clock times that land on your bedtime, using AASM totals to 36 months.",
  intro:
    "The Baby Wake Window Planner turns a baby's age, morning wake time and target bedtime into a full nap schedule by solving span = naps x nap length + (naps + 1) x wake window, then choosing the nap count whose required awake stretch sits closest to the middle of the age-appropriate range. It is built for parents and carers of children up to 36 months who want the day to actually end at the bedtime they picked. Nap length is derived rather than guessed: total daily sleep for the age (AASM consensus ranges from 4 months, National Sleep Foundation below that) minus the typical overnight portion, divided across the naps.",
  useCases: [
    "Your 7-month-old wakes at 06:30 and you want a 19:00 bedtime — you need to know whether that day holds two naps or three, and how long each has to be.",
    "You are in the middle of the 3-to-2 nap transition and want to see what awake stretch each nap count would demand before deciding which one to try tomorrow.",
    "You are writing a handover sheet for a grandparent or nanny and need nap start and end clock times, not vague advice like 'nap after two hours'.",
  ],
  benefits: [
    [
      "Solves for the bedtime you chose",
      "Most wake-window charts fix the window and let bedtime land wherever it falls; this works backwards from your target bedtime and tells you the window that reaches it.",
    ],
    [
      "Picks the nap count for you",
      "It tests every plausible nap count for the age band, prefers the ones whose required window lands inside the published range, and breaks ties by closeness to the range midpoint.",
    ],
    [
      "Flags a day that does not add up",
      "If the required window is shorter or longer than the age range, or the bedtime falls outside the usual 17:30 to 20:30 span, the plan says so instead of quietly producing an unrealistic schedule.",
    ],
  ],
  faqs: [
    [
      "What is a wake window?",
      "A wake window is the stretch a baby can stay comfortably awake between sleeps. The planner uses ranges from common paediatric sleep practice that widen with age: roughly 45 to 60 minutes at 0 to 1 month, 105 to 150 minutes at 4 to 6 months, 180 to 240 minutes at 9 to 12 months, and 300 to 420 minutes at 2 to 3 years.",
    ],
    [
      "How many hours should my baby sleep in 24 hours?",
      "The planner uses 12 to 16 hours for 4 to 12 months and 11 to 14 hours for 1 to 2 years, which are the AASM consensus recommendations endorsed by the AAP. Below 4 months the AASM declined to issue a recommendation, so the National Sleep Foundation newborn range of 14 to 17 hours is used instead.",
    ],
    [
      "Why does it say the naps do not fit my wake time and bedtime?",
      "That message means the daytime sleep the age needs is longer than the gap you left between waking and bedtime, so no positive wake window exists. Move bedtime later or the wake time earlier. The planner also rejects days under 4 hours or over 16 hours from wake to bedtime as input errors.",
    ],
    [
      "Does this replace advice from a paediatrician?",
      "No — it is an informational planner built on published age ranges, not a medical assessment of your child. Every baby varies, and sleep problems, unusual sleep totals, or concerns about growth and feeding should go to your paediatrician or health visitor.",
    ],
  ],
};

export default seo;
