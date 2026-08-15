const seo = {
  title: "Calendar Privacy Scrubber: Redact ICS Before Sharing",
  metaDescription:
    "Replace ICS event titles, attendees, locations and notes with placeholders, strip meeting links and shift dates - all in your browser.",
  steps: [
    "Under Add an ICS calendar, pick a Calendar file up to 2 MB or paste its plain-text contents into the box.",
    "Set Event title, Attendee names & emails, Organizer, Location and Description & notes to keep, generalize or remove, toggle Remove conference links and Remove event alarms, and enter Shift event dates between -3650 and 3650 days.",
    "Scrubbed calendar updates live with Events, Fields changed, Dates shifted and Alarms removed counts; use Copy scrubbed ICS or Download scrubbed ICS to save the -scrubbed.ics file.",
  ],
  intro:
    "This tool rewrites an ICS calendar file in your browser, replacing the identifying parts of each event with neutral placeholders before you share it. Working line by line over RFC 5545 content lines, it can generalize event titles to \"Private event 3\", attendees to \"Attendee 2\" at a redacted.invalid address, locations to \"Private location\" and descriptions to \"Private event details\" — or delete those fields outright — while stripping the CN, EMAIL, DIR, SENT-BY and DELEGATED-TO parameters that carry real names. It is for anyone who has to hand over a calendar for scheduling, an audit or a support ticket without handing over who they met and where.",
  useCases: [
    "A scheduling assistant or contractor needs your availability, and exporting the raw calendar would also hand them every client name, address and meeting link",
    "You are filing a bug report against a calendar app and need a reproducible ICS that keeps the broken recurrence rule but none of the real content",
    "You want to share a busy/free pattern with a researcher or team lead and shift every date so the underlying schedule cannot be matched back to real events",
  ],
  benefits: [
    [
      "Per-field control, not one blanket redaction",
      "Title, attendees, organizer, location and description each get their own keep / generalize / remove setting, so you can preserve structure while dropping only what identifies you.",
    ],
    [
      "Meeting links removed by pattern, not by guesswork",
      "It matches Google Meet, Zoom, Teams, Webex, Whereby, Jitsi, GoToMeeting and BlueJeans hosts plus the vendor X-GOOGLE-CONFERENCE and X-MICROSOFT-ONLINEMEETING properties, and any joinable URL hiding inside a description.",
    ],
    [
      "Reproduces valid ICS on the way out",
      "Output is re-folded at the 75-byte content-line limit and re-parsed for validity, so the scrubbed file still imports into a calendar app rather than failing halfway.",
    ],
  ],
  faqs: [
    [
      "What exactly gets replaced when I choose \"generalize\"?",
      "Titles become \"Private event N\", each attendee becomes \"Attendee N\" with a synthetic attendee-N-M@redacted.invalid address, locations become \"Private location\" and descriptions become \"Private event details\". The identity parameters CN, EMAIL, DIR, SENT-BY, DELEGATED-TO, DELEGATED-FROM and MEMBER are stripped from those lines in every mode except keep.",
    ],
    [
      "Can I shift the dates so the schedule cannot be matched back?",
      "Yes — a shift of anywhere from −3650 to +3650 days is applied together to DTSTART, DTEND, RECURRENCE-ID, RDATE and EXDATE so the event structure stays consistent. If a date field in an event cannot be shifted safely as a group it is left unchanged and counted in a warning rather than silently corrupted.",
    ],
    [
      "Does it remove reminders and event IDs too?",
      "It can. VALARM blocks are dropped by default, taking reminder offsets and any alarm text with them, and each event's UID can be kept, replaced with a fresh value or removed entirely — useful because a UID often leaks the originating account or system.",
    ],
    [
      "What does it deliberately leave alone?",
      "Calendar-level metadata, attachments, unknown vendor-specific properties, TZID references and VTIMEZONE blocks are preserved, and recurrence rules are kept but not expanded. Review the exported file in a calendar app before sharing — the tool reports exactly what it changed, but it does not claim to catch every possible identifier.",
    ],
  ],
};

export default seo;
