const seo = {
  title: "Wallpaper App Permission Audit & Ad SDK Risk",
  metaDescription:
    "A wallpaper app needs only SET_WALLPAPER and internet. Scores 18 permissions by sensitivity and flags what to revoke: overlay, install, accessibility.",
  steps: [
    "Type the app into App name (for the report), then choose Checklist or Paste list — Paste list takes one permission per line, copied from the Play Store listing (About this app > App permissions > See more) or Settings > Apps > Permissions.",
    "In Checklist mode tick what the app holds from the 18 rows — Set wallpaper, Internet access, Display over other apps, Install other apps, Accessibility service and the rest — or start from the Typical wallpaper app, Everything granted or Clear all buttons.",
    "The Privacy score reads out of 100 with a verdict, over rows for Permissions granted, Revoke now, Worth reviewing, Justified by a core feature, Restricted / special access granted and Exposure points, then a Revoke these first list and the Every item, with its manifest name table. Copy result copies the report.",
  ],
  intro:
    "The Wallpaper App Permission Audit scores a wallpaper or live-wallpaper app against the smallest honest permission set on your phone: SET_WALLPAPER, an internet connection for the catalogue, and the system photo picker. Everything else is scored as exposure, because the usual reason for it is the bundled advertising SDK rather than any wallpaper feature. Eighteen permissions are weighted by sensitivity, with overlay, install-other-apps and accessibility access at the top — the three that turn a free wallpaper pack into an adware delivery route.",
  useCases: [
    "Check a free wallpaper pack before installing it from a search result.",
    "Work out which app is showing full-screen ads over your home screen.",
    "Audit a live wallpaper that asks for location and phone permissions.",
    "Decide between two wallpaper apps by comparing what each one holds.",
  ],
  benefits: [
    [
      "A tiny honest baseline",
      "SET_WALLPAPER plus internet is the whole legitimate set, so anything extra is visible at a glance.",
    ],
    [
      "Ad SDK behaviour named directly",
      "Overlay, install-packages and boot-start grants are explained as what they usually are rather than as features.",
    ],
    [
      "Live wallpapers judged fairly",
      "A foreground service and start-at-boot are treated as reasonable for an animated wallpaper and needless for a static one.",
    ],
  ],
  faqs: [
    [
      "What permissions does a wallpaper app actually need?",
      "SET_WALLPAPER — a normal permission with no prompt — and, if it has an online catalogue, INTERNET. To use one of your own pictures it can go through the system photo picker, which needs no permission at all. Anything more deserves an explanation.",
    ],
    [
      "Why do wallpaper apps ask for so many permissions?",
      "Because the app is usually a thin shell around an advertising SDK, and the SDK wants an advertising ID, device identifiers, the installed-app list and sometimes an overlay to show ads outside the app. The wallpapers themselves need none of it.",
    ],
    [
      "Is a wallpaper app asking to install other apps dangerous?",
      "Yes. REQUEST_INSTALL_PACKAGES lets it push an APK installer at you, which is how sideloaded adware spreads from free wallpaper packs. No wallpaper feature needs it — uninstall rather than trying to tune the permission.",
    ],
    [
      "Do live wallpapers need to run in the background?",
      "A live wallpaper legitimately uses a foreground service to run its animation and RECEIVE_BOOT_COMPLETED to restart after a reboot. A static wallpaper app has nothing to run, so the same grants there usually keep an ad SDK alive instead.",
    ],
  ],
};

export default seo;
