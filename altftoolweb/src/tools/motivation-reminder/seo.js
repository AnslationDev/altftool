const seo = {
  intro:
    "Motivation Reminder schedules daily browser notifications at times you choose: you set an HH:MM time and a message, and a timer checks the clock once every 60 seconds and fires a Web Notification when the current minute matches. Each reminder can be toggled on or off or deleted, and there are ten preset quotes to drop into the message field if you would rather not write your own. Reminders are saved in your browser's localStorage, so they persist between visits without an account.",
  useCases: [
    "You keep losing focus mid-afternoon and want a 14:30 nudge with your own one-line reason for the project you are working on.",
    "You are building a morning routine and want three staggered prompts, 06:30, 09:00 and 21:00, that you can switch off individually on weekends rather than deleting.",
    "You want to check what a reminder will actually look like on your desktop before you rely on it, using the test notification button once permission is granted.",
  ],
  benefits: [
    [
      "Your words, not stock affirmations",
      "The message field is free text; the ten built-in quotes are optional starting points you can click to prefill and then edit.",
    ],
    [
      "Toggle without losing the reminder",
      "Each entry has an enable switch separate from delete, so a reminder you pause for a week is still there when you want it back.",
    ],
    [
      "No account and no server",
      "Reminders live in localStorage on the device that created them, so there is no sign-up and no synced profile holding your notes.",
    ],
  ],
  faqs: [
    [
      "Do reminders fire when the tab is closed?",
      "No. The check runs on a timer inside the open page, once per minute, so the tab must stay open for a reminder to fire. For alerts that survive a closed browser, use your operating system's clock or calendar app.",
    ],
    [
      "Why am I not getting any notifications?",
      "Almost always because browser notification permission has not been granted. Click Enable Notifications and accept the browser prompt; if you previously blocked notifications for the site, the prompt will not reappear and you have to re-allow it in the browser's site settings.",
    ],
    [
      "Where are my reminders stored?",
      "In your browser's localStorage under the key motivationReminders on the device you created them on. They are not uploaded, which also means they do not appear on your phone or in a different browser, and clearing site data removes them.",
    ],
    [
      "How precise is the reminder time?",
      "To the minute. The check compares the current hour and minute against the reminder time every 60 seconds, and each reminder fires once per matching minute, so it can land anywhere within that minute rather than exactly on the second.",
    ],
  ],
};

export default seo;
