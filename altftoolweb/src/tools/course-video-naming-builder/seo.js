const seo = {
  intro:
    "Course Video Naming Builder converts a module-and-lesson outline into one consistent, zero-padded file name per lesson using a pattern you control. It slugifies titles into kebab, snake or Pascal case, strips the characters Windows forbids in a file name, keeps every name inside the 255-byte per-name limit used by ext4, APFS and NTFS, and flags duplicates and reserved device names such as CON or LPT1. Built for course creators, editors and VAs who need raw footage, edits and uploads to sort in teaching order on any machine.",
  useCases: [
    "Name 60 raw camera files for a multi-module course before handing the folder to an editor, so every clip sorts in lesson order.",
    "Re-number a course after inserting a new lesson in the middle, by changing the outline once instead of renaming files by hand.",
    "Standardise names across a team where one person writes Lesson 1.mp4 and another writes 01_lesson.MP4.",
    "Check whether long lesson titles will break a sync tool that rejects file names over 255 bytes.",
  ],
  benefits: [
    ["Sorts correctly", "Zero-padded numbers keep lesson 2 ahead of lesson 10 in every file manager and upload queue."],
    ["Cross-platform safe", "Removes the < > : \" / \\ | ? * characters Windows rejects and warns about reserved device names."],
    ["Pattern driven", "Change the pattern once and every lesson in the course is renamed to match."],
  ],
  faqs: [
    [
      "What is the best naming convention for course videos?",
      "Use a fixed pattern that puts sortable numbers before free text, such as COURSE_M01_L03_topic-title.mp4. Zero-pad module and lesson numbers to at least two digits, use hyphens or underscores instead of spaces, and keep the same pattern for raw footage, edits and final uploads so files line up side by side.",
    ],
    [
      "Why do my videos sort as 1, 10, 11, 2 instead of in order?",
      "Because file managers sort names as text, not numbers, so \"10\" comes before \"2\". Zero-padding fixes it: 01, 02, 10, 11 sort correctly as plain text. Two digits covers up to 99 lessons; use three if a module could exceed that.",
    ],
    [
      "Which characters should I never use in a video file name?",
      "Avoid < > : \" / \\ | ? * and control characters — Windows rejects all of them — plus leading or trailing spaces and dots. Also avoid the reserved device names CON, PRN, AUX, NUL, COM1-COM9 and LPT1-LPT9, which cannot be used as a file name even with an extension.",
    ],
    [
      "How long can a video file name be?",
      "A single file name is limited to 255 bytes on ext4 and 255 characters on APFS and NTFS, and the full path is capped separately (260 characters on Windows unless long paths are enabled). Accented and non-Latin characters use two to four bytes each, so a name that looks short can still hit the limit.",
    ],
  ],
};

export default seo;
