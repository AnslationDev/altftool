const seo = {
  title: "Audiobook Length Calculator: Words to Hours",
  metaDescription:
    "Converts manuscript word count into finished hours at your narration pace, plus prep, booth and edit time, session count and MP3 size at 192 kbps.",
  steps: [
    "Enter the manuscript word count and narration pace in words per minute, or tap a preset chip — 130, 155 or 175 wpm.",
    "Adjust prep, booth and edit-and-master hours per finished hour, and the usable hours in one session, to match your workflow.",
    "Read the finished listening time, total production hours, recording sessions needed and delivery size at 192 kbps MP3; \"Working backwards\" converts target hours to words.",
  ],
  intro:
    "An audiobook reading rate calculator converts a manuscript word count into finished audio hours by dividing words by narration pace — at the standard 155 words per minute, one finished hour holds 9,300 words. It then applies production multipliers to show prep, booth and editing time, how many sessions that means, and the delivery size at the ACX spec of 192 kbps MP3. Useful for authors budgeting a self-published title, narrators quoting per finished hour, and producers scheduling studio days.",
  useCases: [
    "Estimate the runtime of a 90,000-word novel before commissioning a narrator.",
    "Work out how many three-hour booth sessions a 12-hour title will take to record.",
    "Trim a manuscript to hit a target length, such as keeping a business book under six finished hours.",
    "Check the total upload size of a title before delivering chapter files to a distributor.",
  ],
  benefits: [
    ["Finished hours, not raw time", "Results are expressed in the per-finished-hour unit that narrators and studios actually quote in."],
    ["Whole-project view", "Prep, recording, editing and proof time are separated so the schedule is realistic, not just the runtime."],
    ["Adjustable multipliers", "Change the booth and edit ratios to match your own workflow rather than a fixed industry average."],
  ],
  faqs: [
    [
      "How many words are in one hour of audiobook?",
      "About 9,300 words at the standard narration pace of 155 words per minute, which is the figure ACX publishes as the average. A slower, more deliberate read at 130 wpm gives about 7,800 words per hour, and a brisk 175 wpm read gives about 10,500.",
    ],
    [
      "How long does it take to record an audiobook?",
      "Plan on roughly 2 hours at the microphone for every finished hour when recording punch-and-roll, plus another 2 to 3 hours for editing, mastering and proof-listening, and about half an hour of prep per finished hour. A 10-hour title therefore takes 40 to 55 working hours end to end.",
    ],
    [
      "What is a finished hour in audiobook work?",
      "One hour of fully edited, mastered audio as the listener hears it. Narrators and studios price per finished hour (PFH) rather than per hour worked, because the amount of raw recording and editing behind each finished hour varies by narrator and material.",
    ],
    [
      "What file size should I expect for an audiobook?",
      "About 82 MB per hour at the ACX delivery spec of 192 kbps constant-bitrate MP3, since 192 kbps equals 24,000 bytes of audio per second. A 10-hour title is roughly 820 MB across all chapter files.",
    ],
  ],
};

export default seo;
