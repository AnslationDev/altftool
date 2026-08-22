const seo = {
  title: "Festival Day Planner: Queue, Exit & Last Train",
  metaDescription:
    "Builds the day backwards from the gate: queue growth from lane throughput, exit clear time at 82 people/min per metre, and the margin on the last service.",
  steps: [
    "Under \"The event\" enter Expected attendance, \"Standing area (m², 0 to skip)\", Start time and Finish time.",
    "Under \"Getting in\" set \"Search lanes or turnstiles\", \"People per lane per minute\", \"Share arriving in the peak (%)\", \"Peak window before the start (min)\" and \"Queue time you will accept (min)\"; under \"Getting out and home\" pick an Exit route — \"Level exits and gateways\" at 82/min per metre or \"Stairways or a stepped exit\" at 73/min per metre — plus \"Total exit width (m)\", the travel times and \"Last service home\".",
    "\"Leave home at\" gives your departure time, over rows for Gate capacity, \"Queue if you arrive at the last moment\", \"Time to clear the whole venue\", \"Margin on the last service\" and \"Latest you can leave your spot\", alongside \"The day, in order\" and Crowd density; \"Copy plan\" copies the timeline.",
  ],
  intro:
    "Builds a festival day backwards from the gate using crowd-engineering arithmetic rather than guesswork. The entry queue is a deterministic fluid model — while arrivals outrun the gates, the queue grows at the difference between the two rates, so arriving t minutes into the peak means (arrival rate minus service rate) times t people stand in front of you. The exit uses the UK Guide to Safety at Sports Grounds figures of 82 persons per minute per metre of level exit width and 73 per metre for stairways, and crowd density is checked against the same guidance's limit of 4.7 people per square metre.",
  useCases: [
    "Deciding whether to leave the headline set ten minutes early to make the last train home",
    "Working out how early to reach the gate when 20,000 people arrive through eight search lanes in one hour",
    "Checking whether the exit width at a small venue is remotely adequate for the crowd it sells to",
  ],
  benefits: [
    ["Queue maths, not folklore", "Shows what arriving at the last moment actually costs, in minutes, from the gate throughput."],
    ["Exit time from published rates", "Uses the Green Guide's rates of passage, so the clear time is a real figure you can plan around."],
    ["The last service checked", "Tells you the latest moment you can leave your spot and still reach the stop in time."],
  ],
  faqs: [
    [
      "How early should I arrive at a festival?",
      "Early enough to be near the front of the peak arrival window rather than the back of it. If 10,000 people arrive in the hour before the start through gates processing 96 a minute, the queue grows by about 70 people a minute — so turning up at the last moment means roughly 44 minutes standing still, while arriving 45 minutes early means about 10.",
    ],
    [
      "How long does it take a crowd to leave a venue?",
      "Divide the crowd by the exit capacity. The UK Guide to Safety at Sports Grounds allows a maximum rate of passage of 82 persons per minute per metre of width for level exit routes and 73 per metre for stairways, so 20,000 people through 12 metres of level exit takes about 20 minutes. The same guidance uses an eight-minute criterion for emergency evacuation to a place of safety.",
    ],
    [
      "What crowd density is dangerous?",
      "Independent movement is largely gone by about 4 people per square metre, and the Green Guide caps standing accommodation at 4.7 per square metre. Below about 2 per square metre people move freely. If you cannot choose your own direction, that is the signal to move towards an edge, not to push forward — and to know where two separate exits are before you need them.",
    ],
    [
      "Is it worth leaving a concert early to beat the crowd?",
      "Usually yes, and the saving is larger than people expect. If only about 15% of the crowd leaves before the end, they clear the exits in a fraction of the full clear time — often three minutes instead of ten or more — which is frequently the difference between catching the last service and not. Weigh that against missing the encore, and check the venue's own advice on re-entry and exit routes.",
    ],
  ],
};

export default seo;
