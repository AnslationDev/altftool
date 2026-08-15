const seo = {
  title: "Shared Resource Booking Conflict Resolver",
  metaDescription:
    "Paste booking requests as resource, start, end, requester and priority; clashes go to the lowest priority number, with an optional buffer in minutes.",
  steps: [
    "Paste one request per line into 'Requested bookings' as Resource | start | end | requester | priority (lower wins).",
    "Set 'Buffer between bookings (minutes)' so back-to-back requests on the same resource count as a conflict instead of a clean handover.",
    "Read the decision table — each row marked Accepted or 'Needs reschedule' with a reason naming the requester it 'Conflicts with' — plus the accepted-requests count.",
  ],
  intro:
    "Give this resolver a list of booking requests — resource, start, end, requester and a priority number — and it works through them in time order, accepting each one that fits and flagging the rest, awarding any clash to the lowest priority number. You can also set a buffer in minutes that keeps accepted bookings apart, so back-to-back requests count as a conflict rather than a tidy handover. It is for whoever ends up arbitrating the one meeting room, the shared van or the single good camera.",
  useCases: [
    "Three teams have asked for the same room on the same morning and you want a written decision that points at the priority rule rather than at you.",
    "A pool car needs 30 minutes between users for refuelling and inspection, so two bookings that merely touch at 09:00 must not both be approved.",
    "You are consolidating a week of equipment requests from a form and need to know which ones actually clash before you start emailing people back.",
  ],
  benefits: [
    [
      "States a reason for every decision",
      "Each row is marked Accepted or Needs reschedule and names the requester it lost to, so the outcome is defensible in writing.",
    ],
    [
      "Buffers count as conflict",
      "A turnaround gap is enforced on both sides of an accepted booking, which catches the adjacent bookings a plain overlap check would pass.",
    ],
    [
      "A higher-priority request can displace one already accepted",
      "Bookings are not simply first come first served — a later line with a better priority takes the slot and the earlier one is sent back for rescheduling.",
    ],
  ],
  faqs: [
    [
      "How do I enter the bookings?",
      "One per line, five parts separated by the pipe character: resource, start, end, requester, priority — for example Room A | 2026-07-25 09:00 | 2026-07-25 10:00 | Asha | 2. A line with an unreadable date, or an end at or before its start, is ignored rather than counted.",
    ],
    [
      "Which request wins a clash?",
      "The one with the lowest priority number — 1 beats 2. If two requests share a priority the earlier start time wins, and if those are also equal the line entered first wins. Leave the priority off and that request is treated as 999, so it loses to anything numbered.",
    ],
    [
      "What does the buffer do?",
      "It pads every accepted booking on both sides. With a 15-minute buffer, a booking ending at 10:00 blocks anything starting before 10:15, so the two are reported as a conflict instead of being approved back to back. The default is 0, which means only genuine overlaps clash.",
    ],
    [
      "Does it book anything or notify people?",
      "No. It reads the text you paste, decides locally, and prints a table — nothing is written to a calendar and no one is emailed. Treat it as a transparent decision aid: agree the priority scheme and tie-breaks with the group first, and account for accessibility needs and other factors it cannot see before the result becomes the final answer.",
    ],
  ],
};

export default seo;
