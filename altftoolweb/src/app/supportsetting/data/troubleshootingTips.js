// Short, practical troubleshooting tips per platform — complements the
// formal "Troubleshooting & Diagnostics" category settings (which link out
// to official reset/restart guides) with quick, common-issue triage.
export const TROUBLESHOOTING_TIPS = {
  windows: [
    {
      issue: "An app won't open or crashes immediately",
      tip: "Restart your PC first — it clears stuck background processes. If that doesn't help, check for pending Windows Updates, since app crashes are often caused by an outdated system component.",
    },
    {
      issue: "Wi-Fi keeps disconnecting",
      tip: "Forget the network and reconnect with the password. If it keeps happening on multiple networks, try Network Reset as a deeper fix.",
    },
    {
      issue: "PC is running slower than usual",
      tip: "Check Storage settings for low disk space and Task Manager for a runaway process — both are common, fixable causes of slowdown.",
    },
  ],
  macos: [
    {
      issue: "An app is frozen or unresponsive",
      tip: "Press Option-Command-Esc to force quit the app, then reopen it. If it keeps happening, check for a pending macOS software update.",
    },
    {
      issue: "Mac won't connect to Wi-Fi",
      tip: "Turn Wi-Fi off and on again from the menu bar, then try 'Forget This Network' and rejoin with the password.",
    },
    {
      issue: "Mac is running low on storage",
      tip: "Open Storage Management (Apple menu → About This Mac → Storage → Manage) for a breakdown and one-click cleanup recommendations.",
    },
  ],
  android: [
    {
      issue: "An app keeps crashing",
      tip: "Clear that app's cache first (Settings → Apps → the app → Storage → Clear cache) — this fixes most crash loops without losing your data.",
    },
    {
      issue: "Phone feels slow or laggy",
      tip: "Check Storage for how much free space you have — Android tends to slow down noticeably below roughly 10% free space.",
    },
    {
      issue: "Battery draining faster than usual",
      tip: "Check Settings → Battery for a list of apps by usage — one runaway app in the background is the most common cause.",
    },
  ],
  ios: [
    {
      issue: "An app is frozen or unresponsive",
      tip: "Swipe up (or double-click the Home button) and swipe the app away to force-close it, then reopen it.",
    },
    {
      issue: "iPhone won't connect to Wi-Fi",
      tip: "Toggle Wi-Fi off and back on in Settings, then use 'Forget This Network' and rejoin with the password.",
    },
    {
      issue: "iPhone Storage is almost full",
      tip: "Open Settings → General → iPhone Storage for personalized cleanup recommendations based on what's actually using space.",
    },
  ],
};
