const seo = {
  intro:
    "The Utility App Permission Audit scores flashlight, junk-cleaner and battery-saver apps against the job they advertise, and returns a 0-100 privacy score plus a ranked revoke list. It is the app class with the widest gap between function and permissions: Android's torch API (CameraManager.setTorchMode) needs no permission at all, yet flashlight apps routinely hold Camera, Location and Contacts. Special app access grants — All files access, usage access, overlays and accessibility — carry the heaviest weight because Google Play requires a core-functionality declaration for each.",
  useCases: [
    "Check a flashlight app that asks for the Camera permission before you install it.",
    "Audit a 'phone booster' that requested accessibility access after an update.",
    "Explain to a family member why the cleaner app on their phone shows full-screen ads outside the app.",
    "Decide whether a battery-saver app is worth keeping once you see what it holds.",
  ],
  benefits: [
    [
      "Calibrated to a two-button app",
      "The baseline is what a torch or cleaner actually needs, so anything extra shows up immediately.",
    ],
    [
      "Special app access gets its own weight",
      "Overlays, usage access and accessibility are scored as the highest tier, not lumped in with ordinary permissions.",
    ],
    [
      "Tells you where the setting lives",
      "Each recommendation names the Settings path, including the Special app access screens most people never open.",
    ],
  ],
  faqs: [
    [
      "Does a flashlight app need camera permission?",
      "No. Since Android 6 an app can switch the LED on with CameraManager.setTorchMode without holding the CAMERA permission at all. A torch app asking for Camera is asking for something the torch does not use — and the built-in Quick Settings torch tile needs no app.",
    ],
    [
      "Are phone cleaner and booster apps safe?",
      "Most are unnecessary — Android has managed background processes and cached files automatically since version 8 — and they are a common vehicle for aggressive ad SDKs. Judge one by what it asks for: All files access, overlay permission or accessibility in a cleaner is a reason to uninstall rather than to tune.",
    ],
    [
      "Why is 'Display over other apps' dangerous?",
      "SYSTEM_ALERT_WINDOW lets an app draw on top of every other app, which is how full-screen ads appear outside the app that served them and how tapjacking overlays hide what button you are really pressing. Turn it off under Settings > Apps > Special app access.",
    ],
    [
      "What is All files access and who should have it?",
      "MANAGE_EXTERNAL_STORAGE gives an app read and write access to shared storage — documents, downloads, other apps' media. Google Play permits it only for a narrow set of uses such as file managers, backup and anti-virus, so a torch, cleaner or battery saver holding it is outside the policy.",
    ],
  ],
};

export default seo;
