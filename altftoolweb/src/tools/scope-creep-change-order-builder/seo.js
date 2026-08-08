const seo = {
  title: "Scope Creep Change Order Builder: Price + Deadline",
  metaDescription:
    "Price an out-of-scope client request as extra hours x your rate plus expenses, with the calendar-day deadline extension and an acceptance clause.",
  steps: [
    "Fill Project, 'Original included scope' and 'New request', or click the 'Extra pages' example preset to load a worked case.",
    "Enter Additional hours, your Hourly / blended rate, Additional expenses and 'Deadline extension (days)' — the Result panel recomputes as you type.",
    "Read the '<total> change-order value' with its '<n> calendar-day extension' caption and the acceptance line, then Copy it or Download scope-creep-change-order-builder.txt.",
  ],
  intro:
    "The Scope-Creep Change-Order Builder prices an out-of-scope client request as (additional hours × your hourly or blended rate) + additional expenses, and pairs that figure with a calendar-day deadline extension. You type the original included scope, the new request, the hours it adds and your rate, and it returns a change-order value with the old scope, the requested change and an acceptance line spelling out price, schedule, dependencies, revision count and the authorized approver. It is for freelancers and small agencies who need to say 'yes, and here is what it costs' in writing before starting the extra work.",
  useCases: [
    "A web designer whose five-page contract just grew by three landing pages and a second revision round, and who needs a number and a new delivery date to send back before touching the work.",
    "A video editor asked for 'one more quick cut' for the fourth time, wanting a written record that each request added billable hours rather than absorbing them silently.",
    "A two-person studio whose client changed the brief mid-project, needing to show the approver exactly which items were in the original scope and which are new before invoicing.",
  ],
  benefits: [
    [
      "Prices time and money together",
      "Returns both the labour-plus-expenses total and the calendar-day extension, so the schedule impact is never left implicit while only the fee gets negotiated.",
    ],
    [
      "Keeps the original scope on the page",
      "The output restates what was included and what is being added side by side, which is the comparison that actually settles a scope dispute.",
    ],
    [
      "Builds in an acceptance clause",
      "Every change order ends with a line requiring confirmation of price, schedule, dependencies, revision count and who is authorized to approve it.",
    ],
  ],
  faqs: [
    [
      "How do you price a scope change?",
      "Multiply the extra hours the request will take by your hourly or blended rate, then add any new hard costs such as stock assets, licences or subcontractor fees. That is exactly the calculation here: labour = hours × rate, and the change-order value = labour + expenses, so 18 extra hours at a rate of 1,500 plus 3,000 in expenses comes to 30,000.",
    ],
    [
      "What is a change order and how is it different from a new contract?",
      "A change order is an amendment to an existing agreement that adds specific work, cost and time to it, rather than replacing it. It works because it names the original scope, states only the delta, and requires a signature from an authorized approver — which is why the generated summary lists all three.",
    ],
    [
      "Should I charge for every small extra request?",
      "Price them all, then decide which to waive as a deliberate gesture rather than by default. Logging each one at hours × rate is what turns a vague sense of scope creep into a number you can either bill or visibly discount; a run of unbilled 'quick' requests is the usual way a fixed-fee project loses money.",
    ],
    [
      "How much should I extend the deadline by?",
      "Add at least the working days the extra hours consume, then pad for review cycles and any dependency the new work introduces. The tool takes your extension in calendar days and prints it alongside the price so the client approves both at once; a change order that moves cost but not the date usually just moves the overrun somewhere less visible.",
    ],
  ],
};

export default seo;
