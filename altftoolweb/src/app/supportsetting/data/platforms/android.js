import {
  CloudDownload,
  HardDrive,
  UploadCloud,
  ShieldCheck,
  EyeOff,
  Wifi,
  BluetoothIcon,
  Moon,
  RefreshCw,
  Accessibility,
  RotateCcw,
  Bell,
  Volume2,
  BellOff,
  BatteryCharging,
  AppWindow,
  LayoutGrid,
  Image,
  Lock,
  KeyRound,
  MapPin,
  Nfc,
  Router,
  Shield,
  Signal,
  Keyboard,
  Clock,
  Hourglass,
  Share2,
  Users,
  Terminal,
  Info,
  Gamepad2,
  LifeBuoy,
  Siren,
  Activity,
  Archive,
  BatteryWarning,
  Captions,
  Car,
  Cast,
  Copy,
  Ear,
  FolderSearch,
  ImagePlus,
  Layers,
  MemoryStick,
  MessageSquare,
  Printer,
  Smartphone,
  Usb,
  ZoomIn,
  PenTool,
  Plane,
} from "lucide-react";

// Android Support Settings. New entries — link out to a real, verified
// official Google support article for each topic (checked live via
// WebFetch). No hotlinked screenshots, since Android's settings UI varies
// by manufacturer and version and can't be reliably illustrated with a
// single verified image.
export const androidSettings = [
  {
    id: "android-system-update",
    title: "System Update",
    icon: CloudDownload,
    platform: "android",
    category: "system-updates",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Check & Update Your Android Version",
    description:
      "System Update keeps Android current with the latest security patches and features. Google and your device manufacturer regularly release updates that improve performance and close security gaps.",
    details: [
      "You can check your current Android version and security patch date in Settings.",
      "Updates can usually be downloaded over Wi-Fi to avoid using mobile data.",
      "Some updates install automatically overnight while your phone is charging.",
      "Security-only updates are typically smaller and faster to install than full version upgrades.",
    ],
    important:
      "Devices eventually stop receiving updates after their manufacturer's support period ends — check your device's update policy if updates seem to have stopped.",
    redirectUrl: "https://support.google.com/android/answer/7680439?hl=en",
    afterImageContent: {
      heading: "How Android Updates Work",
      paragraphs: [
        "Android checks for available system updates automatically and notifies you when one is ready.",
        "You can also trigger a manual check from within Settings at any time.",
        "A restart is usually required to finish installing a system update.",
      ],
      steps: [
        "Open Settings → System → System update.",
        "Tap 'Check for update'.",
        "Download and install the update if one is available.",
        "Restart your device when prompted.",
      ],
    },
    whyItMatters:
      "Unpatched Android versions are a favorite target for malware and phishing exploits, so staying current is one of the single biggest things you can do for your phone's security. Manufacturers also tie new camera, battery, and performance improvements to these updates, meaning a stale OS quietly leaves real functionality on the table. Skipping updates for too long can also mean falling outside your device's official support window sooner than expected.",
    bestPractices: [
      "Check for updates monthly even without a notification, since some carriers stagger rollout by weeks.",
      "Connect to Wi-Fi and keep the device charging before starting a major version upgrade, since these can take 20+ minutes.",
      "Turn on overnight automatic updates so patches install without interrupting your day.",
      "Note your device's official 'end of updates' date at purchase so you can plan a replacement before support lapses.",
      "Restart the phone within a day of installing an update to make sure the patch fully takes effect.",
    ],
    commonIssues: [
      {
        issue: "Update download stalls or gets stuck at a percentage.",
        fix: "Reboot the phone, connect to a stable Wi-Fi network, confirm at least 2-3 GB of free storage, then retry.",
      },
      {
        issue: "'No updates available' even though a newer Android version exists for this model.",
        fix: "Check whether the device has passed its manufacturer's official update-support window; security patches may still continue after feature updates stop.",
      },
      {
        issue: "Battery drains noticeably faster for a day or two after installing an update.",
        fix: "This is normal while apps reindex and rebuild caches; restart the device if it hasn't settled after 2-3 days.",
      },
      {
        issue: "Update requires more free space than the device has available.",
        fix: "Temporarily move photos and videos to cloud storage or an SD card to free the space Android needs to stage the install.",
      },
    ],
    faqs: [
      {
        q: "Will updating erase my apps and photos?",
        a: "No, a standard system update never erases your data — only a factory reset does that.",
      },
      {
        q: "Why do Android updates arrive later than iOS updates?",
        a: "Android updates typically pass through both Google and your device's manufacturer or carrier for testing, adding delay compared to Apple's single-vendor rollout.",
      },
      {
        q: "Can I update over mobile data instead of Wi-Fi?",
        a: "Yes, though Android may warn you or require confirmation for large downloads to avoid surprise data charges; Wi-Fi is still recommended.",
      },
      {
        q: "What's the difference between a security patch and a full system update?",
        a: "A security patch is a smaller, more frequent fix for vulnerabilities, while a full system update can bring an entirely new Android version with new features.",
      },
    ],
    tipsAndTricks: [
      "Long-press the update notification to snooze it if you're busy, rather than dismissing it and forgetting to check later.",
      "Look up your exact model's security-update end date on the manufacturer's site so you're never caught off guard when patches stop.",
      "If an update seems to hang, a simple restart resolves the large majority of stalled installs — a full reset is rarely necessary.",
    ],
    relatedSettingIds: [
      "android-storage-cleanup",
      "android-backup-restore",
      "android-factory-reset",
    ],
    updateFrequency:
      "Security patches typically release monthly; major feature updates arrive roughly once a year.",
  },
  {
    id: "android-storage-cleanup",
    title: "Storage & Cleanup",
    icon: HardDrive,
    platform: "android",
    category: "storage-backup-data",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Free Up Storage on Your Android Device",
    description:
      "Storage settings show a breakdown of what's using space on your device — apps, photos, videos, and cached data — and offer one-tap tools to clear space safely.",
    details: [
      "Google's built-in cleanup tool can identify large or unused files and duplicate photos.",
      "Clearing an app's cache frees space without deleting your data or login for that app.",
      "Backed-up photos and videos can often be safely removed from the device to save space.",
      "Uninstalling unused apps is usually the fastest way to reclaim significant storage.",
    ],
    important:
      "Clearing an app's 'storage' (not just its cache) deletes that app's local data and settings — only its cache is safe to clear without side effects.",
    redirectUrl: "https://support.google.com/android/answer/7431795?hl=en",
    afterImageContent: {
      heading: "Understanding Storage Categories",
      paragraphs: [
        "Android groups storage usage by Apps, Photos & videos, Audio, and System.",
        "Cached data can be safely cleared at any time and will simply be rebuilt as needed.",
        "The 'Free up space' tool recommends specific files and apps you're less likely to need.",
      ],
      steps: [
        "Open Settings → Storage.",
        "Review the breakdown by category.",
        "Tap 'Free up space' for cleanup suggestions.",
        "Confirm removal of the items you no longer need.",
      ],
    },
    whyItMatters:
      "Running low on storage doesn't just block new downloads — it can slow the whole phone down, cause the camera to refuse to shoot, and even block system updates from installing. Most people accumulate large forwarded videos, duplicate photos, and orphaned app caches without realizing it. A quick cleanup routine keeps performance snappy and avoids the panic of a 'storage full' warning at the worst possible moment.",
    bestPractices: [
      "Review the storage breakdown monthly instead of waiting for a low-storage warning.",
      "Clear app cache for heavy apps like browsers and social media before considering uninstalling them.",
      "Back up photos and videos to Google Photos, then remove the on-device originals once backup is confirmed.",
      "Uninstall apps you haven't opened in 90+ days rather than just leaving them dormant.",
      "Keep at least 10% of total storage free to avoid slowdowns and failed OS update installs.",
    ],
    commonIssues: [
      {
        issue: "'Storage almost full' warning persists even after deleting several apps.",
        fix: "Check Downloads and messaging app media folders (like WhatsApp), which often accumulate large forwarded videos outside the main gallery.",
      },
      {
        issue: "Clearing an app's cache barely frees any space.",
        fix: "Check that app's individual storage detail for data stored outside cache, and only use 'Clear data' if you're prepared to lose its saved settings and logins.",
      },
      {
        issue: "Free-up-space suggestions recommend deleting photos not yet fully backed up.",
        fix: "Confirm Google Photos backup shows fully synced (not just uploading) before allowing on-device copies to be removed.",
      },
      {
        issue: "Storage fills back up again shortly after a cleanup.",
        fix: "Look for a single app generating cache repeatedly (common with video and social apps) and cap or clear its cache manually.",
      },
    ],
    faqs: [
      {
        q: "Is it safe to clear an app's cache?",
        a: "Yes, cache is always safe to clear and the app will simply regenerate it as needed.",
      },
      {
        q: "What's the difference between clearing cache and clearing storage/data?",
        a: "Cache is temporary and safe to remove; clearing storage/data wipes the app's saved settings, logins, and files, effectively resetting it.",
      },
      {
        q: "Will deleting photos from my phone also delete them from Google Photos?",
        a: "Using 'Free up space' only removes the on-device copy after confirming a backup exists; deleting directly in the Photos app can remove both, depending on your settings.",
      },
      {
        q: "Does uninstalling an app delete its data for good?",
        a: "Usually yes, unless the app ties its data to your Google Account or its own cloud service for later restore.",
      },
    ],
    tipsAndTricks: [
      "Use Settings → Storage → 'Free up space' instead of manually hunting through file managers — it's tuned to flag safe-to-remove items.",
      "Sort the Files by Google app by 'Junk files' or 'Large files' to spot hidden storage hogs like stale APKs or duplicate downloads.",
      "Turn off auto-download for media in chat apps on mobile data so storage doesn't quietly refill between cleanups.",
    ],
    relatedSettingIds: [
      "android-backup-restore",
      "android-system-update",
      "android-factory-reset",
    ],
    updateFrequency:
      "Review monthly, or immediately whenever a low-storage notification appears.",
  },
  {
    id: "android-backup-restore",
    title: "Backup & Restore",
    icon: UploadCloud,
    platform: "android",
    category: "storage-backup-data",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Back Up or Restore Your Android Device",
    description:
      "Android can automatically back up app data, call history, contacts, device settings, and photos to your Google Account, making it easy to restore everything on a new or reset device.",
    details: [
      "Backup runs automatically over Wi-Fi while your device is idle and charging.",
      "You can trigger a manual backup at any time from Settings.",
      "Photos and videos back up separately through Google Photos.",
      "Restoring a backup is offered automatically during setup on a new or reset device.",
    ],
    important:
      "Backup only protects data captured before the backup ran — back up manually before a factory reset or major update if you want to be certain everything recent is saved.",
    redirectUrl: "https://support.google.com/android/answer/2819582?hl=en",
    afterImageContent: {
      heading: "What Gets Backed Up",
      paragraphs: [
        "App data, call history, contacts, and device settings back up to your Google Account.",
        "Some apps manage their own backup and sync separately (like messaging apps with their own cloud backup).",
        "You can see your backup status and last backup time directly in Settings.",
      ],
      steps: [
        "Open Settings → System → Backup (or Google → Backup).",
        "Turn on 'Backup by Google One' if it isn't already.",
        "Tap 'Back up now' to run an immediate backup.",
      ],
    },
    whyItMatters:
      "Phones get lost, damaged, or reset far more often than people expect, and a current backup is the only thing standing between that moment and losing years of contacts, settings, and app data. Because backup runs quietly in the background, it's easy to assume it's working when it actually stalled weeks ago. Confirming backup health before you need it — not after — is what makes restoring to a new device painless instead of stressful.",
    bestPractices: [
      "Trigger a manual backup right before any major action, like a factory reset, big OS update, or trade-in.",
      "Make sure Wi-Fi and charging are both active overnight so the automatic backup actually has a chance to run.",
      "Check the 'last backup' timestamp periodically rather than assuming it's always current.",
      "Verify messaging apps like WhatsApp separately, since many use their own backup system instead of Android's built-in one.",
    ],
    commonIssues: [
      {
        issue: "Backup status shows 'Waiting for Wi-Fi' indefinitely.",
        fix: "Connect to a stable Wi-Fi network, confirm battery saver isn't restricting background activity, and try tapping 'Back up now' manually.",
      },
      {
        issue: "Restoring on a new phone brings back apps but not their data.",
        fix: "Check whether that specific app supports Android's automatic app-data backup — many banking and messaging apps require signing back into their own account instead.",
      },
      {
        issue: "The reported backup size seems too small to include everything.",
        fix: "Remember photos and videos back up separately through Google Photos, so the backup size reflects only settings and app data.",
      },
      {
        issue: "No restore option appears during setup on a new device.",
        fix: "Sign in with the exact same Google Account used for the prior backup, and confirm the old device's last backup actually completed successfully.",
      },
    ],
    faqs: [
      {
        q: "Do I need to manually start backup, or does it happen automatically?",
        a: "It runs automatically when the phone is idle, charging, and on Wi-Fi, but you can also trigger it manually any time.",
      },
      {
        q: "Where can I check what my backup actually includes?",
        a: "Open Settings → System → Backup (or Google → Backup) to see the last backup time and a summary of covered data.",
      },
      {
        q: "Does backup save my text messages?",
        a: "Yes, SMS/MMS history is typically included, though RCS chat history handling can vary depending on your messaging app.",
      },
      {
        q: "Can I restore my backup onto a different phone brand?",
        a: "Yes, since the backup is tied to your Google Account rather than a specific device, it can restore to any Android phone during setup.",
      },
    ],
    tipsAndTricks: [
      "Force an immediate manual backup right before selling or handing off a device instead of trusting the overnight schedule.",
      "Use Google One's backup section to see storage usage and manage backups across multiple devices in one place.",
      "If a restore feels incomplete, check individual apps for their own 'restore purchase/data' option, since not everything routes through Android's system backup.",
    ],
    relatedSettingIds: [
      "android-storage-cleanup",
      "android-factory-reset",
      "android-google-account-sync",
    ],
    updateFrequency:
      "Runs automatically overnight when idle and charging on Wi-Fi; trigger manually before any major device change.",
  },
  {
    id: "android-app-permissions",
    title: "App Permissions",
    icon: ShieldCheck,
    platform: "android",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage App Permissions on Android",
    description:
      "App permissions control what each app is allowed to access — camera, microphone, location, contacts, and more. You can review and change these at any time, per app or per permission type.",
    details: [
      "Permissions can be granted 'Always', 'Only while using the app', or 'Ask every time' for sensitive categories like location.",
      "Denying a permission doesn't uninstall the app — it simply limits what that app can access.",
      "You can see every app that has a given permission from one screen (e.g. every app with camera access).",
      "Some permissions can be set to auto-reset if an app hasn't been used in a while.",
    ],
    important:
      "Revoking a permission an app truly needs (like location for a maps app) can break its core functionality until access is restored.",
    redirectUrl: "https://support.google.com/android/answer/9431959?hl=en",
    afterImageContent: {
      heading: "Reviewing Permissions Two Ways",
      paragraphs: [
        "You can review permissions per app (what can this app access) or per permission (which apps can use my camera).",
        "Android periodically surfaces a permissions review reminder for sensitive permissions.",
        "Unused apps may automatically have their permissions reset for safety.",
      ],
      steps: [
        "Open Settings → Privacy (or Apps → App permissions).",
        "Choose an app to review its permissions, or a permission type to review all apps.",
        "Toggle each permission on or off as needed.",
      ],
    },
    whyItMatters:
      "Every permission you grant is a door into your phone, and apps routinely request more access than they actually need to function. Location, camera, and microphone permissions in particular can be quietly exploited for tracking or data collection if left unchecked. Reviewing permissions regularly is one of the most direct, low-effort ways to shrink your phone's overall privacy exposure.",
    bestPractices: [
      "Set location, camera, and microphone permissions to 'Only while using the app' rather than 'Always' unless there's a clear ongoing need.",
      "Review permission grants for any newly installed app within its first week of use.",
      "Turn on auto-reset for apps you rarely open so unused permissions revoke themselves.",
      "Check the per-permission view (e.g. every app with camera access) periodically, not just per-app.",
      "Deny background location access for apps like games or utilities that don't need continuous tracking.",
    ],
    commonIssues: [
      {
        issue: "An app breaks after a permission is denied.",
        fix: "Re-grant the specific permission it needs from Settings → Apps → [app] → Permissions rather than reinstalling the app.",
      },
      {
        issue: "Too many apps default to 'Always' location access.",
        fix: "Switch these individually to 'Only while using the app' unless the app is a fitness or navigation tool with a genuine always-on need.",
      },
      {
        issue: "A permission gets auto-reset for an app you use only occasionally, breaking it unexpectedly.",
        fix: "Open the app once to re-trigger the permission prompt, or manually re-enable the permission before launching it.",
      },
      {
        issue: "Can't find where a system app's permission is controlled.",
        fix: "Check Settings → Privacy → Permission manager, since some system-level permissions live there instead of on the app's own page.",
      },
    ],
    faqs: [
      {
        q: "What happens if I deny a permission an app requests?",
        a: "The app keeps working, but any feature relying on that permission — like the camera in a scanning app — simply won't function until it's granted.",
      },
      {
        q: "What does 'Ask every time' mean for location access?",
        a: "The app must request location access fresh each time it's opened, rather than remembering a prior decision.",
      },
      {
        q: "Can I see which apps recently used my microphone?",
        a: "Yes, the Privacy Dashboard shows a timeline of camera, microphone, and location access across all your apps.",
      },
      {
        q: "Why did an app's permissions reset automatically?",
        a: "Android automatically resets permissions for apps you haven't opened in several months as a built-in security measure.",
      },
    ],
    tipsAndTricks: [
      "Tap a permission type (like 'Camera') on the main Privacy page to instantly see every app with that access, instead of checking apps one by one.",
      "Use the one-time 'Only this time' option for apps you're trying out but don't fully trust yet.",
      "Turn on 'Remove permissions if app isn't used' for a set-and-forget way to shrink your exposure over time.",
    ],
    relatedSettingIds: [
      "android-privacy-dashboard",
      "android-google-account-sync",
      "android-accessibility",
    ],
  },
  {
    id: "android-privacy-dashboard",
    title: "Privacy Dashboard",
    icon: EyeOff,
    platform: "android",
    category: "privacy-permissions",
    recommended: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Review Camera, Microphone & Location Access",
    description:
      "The Privacy Dashboard gives you a timeline of exactly which apps accessed your camera, microphone, and location, and when — so you can spot anything unexpected at a glance.",
    details: [
      "See a 24-hour timeline of sensitive permission usage across all apps.",
      "Camera and microphone indicator dots appear in the status bar whenever they're actively in use.",
      "Quick Settings toggles let you disable camera or microphone access device-wide in one tap.",
      "You can jump directly from the dashboard to an app's permission settings.",
    ],
    important:
      "If you see an app accessing your camera or microphone at a time you weren't using it, review and revoke that app's permission immediately.",
    redirectUrl: "https://support.google.com/android/answer/13530434?hl=en",
    afterImageContent: {
      heading: "Using the Privacy Dashboard",
      paragraphs: [
        "The dashboard is organized by permission type, then by app and time.",
        "Device-wide camera and microphone toggles override individual app permissions temporarily.",
        "This is one of the fastest ways to audit your device's privacy after installing new apps.",
      ],
      steps: [
        "Open Settings → Privacy → Privacy dashboard.",
        "Select Camera, Microphone, or Location to see recent access.",
        "Tap an entry to review or revoke that app's permission.",
      ],
    },
    whyItMatters:
      "It's easy to grant a permission once and never think about it again, but apps can quietly access your camera, microphone, or location far more often than you'd expect. The Privacy Dashboard turns that invisible activity into a visible timeline, so unusual or unexpected access actually gets noticed instead of going unseen. It's the fastest way to catch an app overstepping before it becomes a real problem.",
    bestPractices: [
      "Check the dashboard weekly, especially right after installing new apps.",
      "Investigate any camera or microphone access you don't recognize immediately rather than dismissing it.",
      "Use the Quick Settings mic/camera toggle to disable both device-wide when you're not actively using either.",
      "Tap directly from a suspicious dashboard entry into that app's permission page to revoke access on the spot.",
    ],
    commonIssues: [
      {
        issue: "An app shows repeated microphone access even though you never use its voice features.",
        fix: "Open that app's permission settings, revoke microphone access, and confirm the app still functions normally afterward.",
      },
      {
        issue: "Apps stop working and it turns out the device-wide camera/microphone toggle was on.",
        fix: "Check Quick Settings for a camera or microphone 'off' toggle, which blocks access system-wide until switched back on.",
      },
      {
        issue: "Dashboard shows access from an app you don't remember installing.",
        fix: "Cross-check it against your app drawer; if truly unfamiliar, investigate before assuming it's a threat, since some are bundled system apps.",
      },
      {
        issue: "Location entries appear far more often than expected.",
        fix: "Look for apps using 'Always' location access in the background and switch them to 'Only while using the app'.",
      },
    ],
    faqs: [
      {
        q: "What does the small green dot in my status bar mean?",
        a: "It indicates an app is actively using your camera or microphone at that exact moment.",
      },
      {
        q: "How far back does the dashboard's history go?",
        a: "It typically shows the last 24 hours of sensitive permission usage.",
      },
      {
        q: "Can I permanently block an app from using my microphone?",
        a: "Yes, revoke the microphone permission from that app's settings; it can't use it again until you manually re-enable it.",
      },
      {
        q: "Does the Privacy Dashboard track my web browsing too?",
        a: "No, it's limited to camera, microphone, and location access — not general internet or app activity.",
      },
    ],
    tipsAndTricks: [
      "Swipe down twice for Quick Settings and look for camera/microphone toggles for an instant device-wide privacy switch.",
      "Tap directly on a timeline entry to jump straight into revoking that app's permission, skipping normal settings navigation.",
      "Check the dashboard right after a new app's first use of a sensitive permission to catch surprises early.",
    ],
    relatedSettingIds: ["android-app-permissions", "android-accessibility"],
    updateFrequency: "Review weekly, or right after installing any new app.",
  },
  {
    id: "android-wifi",
    title: "Wi-Fi Connection",
    icon: Wifi,
    platform: "android",
    category: "connectivity-network",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Connect to Wi-Fi on Android",
    description:
      "Wi-Fi settings let you view nearby networks, connect with a password or QR code, and manage saved networks including auto-reconnect behavior.",
    details: [
      "Tap a network and enter its password, or scan a QR code shared by another device.",
      "Saved networks reconnect automatically when in range unless you turn that off.",
      "You can share your current Wi-Fi network with someone else via QR code without revealing the password as text.",
      "Network details show signal strength, security type, and IP information.",
    ],
    important:
      "Be cautious connecting to open (unsecured) public Wi-Fi networks — avoid signing in to sensitive accounts on them.",
    redirectUrl: "https://support.google.com/android/answer/9075847?hl=en",
    afterImageContent: {
      heading: "Managing Saved Networks",
      paragraphs: [
        "Android remembers networks you've joined and can auto-connect the next time you're in range.",
        "You can forget a saved network to remove its password and stop automatic reconnects.",
        "Advanced options let you set a static IP or proxy per network if needed.",
      ],
      steps: [
        "Open Settings → Network & internet → Wi-Fi.",
        "Tap a network from the list.",
        "Enter the password or scan a QR code, then tap 'Connect'.",
      ],
    },
    whyItMatters:
      "Wi-Fi is how most phones handle their heaviest data use — streaming, backups, and large downloads — so a poorly managed connection directly affects both speed and mobile data costs. It's also a common attack surface: open or spoofed public networks can expose unencrypted traffic to anyone else on the same network. Keeping the saved network list clean and knowing when to avoid open Wi-Fi protects both performance and privacy.",
    bestPractices: [
      "Forget old networks you no longer use, like a previous home or hotel, to keep the saved list clean and avoid unwanted auto-reconnects.",
      "Avoid signing into banking or email apps while connected to open public Wi-Fi.",
      "Share access with a QR code instead of reading your password aloud to guests.",
      "Turn off auto-reconnect for networks you don't fully trust, like ones saved while traveling.",
      "Check the security type (WPA3 versus open) before connecting to any unfamiliar network.",
    ],
    commonIssues: [
      {
        issue: "Phone won't automatically reconnect to a known Wi-Fi network.",
        fix: "Forget the network and rejoin it fresh — a corrupted saved network profile is a common cause.",
      },
      {
        issue: "Phone keeps switching to mobile data despite a strong Wi-Fi signal.",
        fix: "Check Settings → Wi-Fi → advanced 'Switch to mobile data automatically' toggle and turn it off if the network is reliable enough.",
      },
      {
        issue: "QR code sharing doesn't appear or won't scan.",
        fix: "Confirm the phone showing the code is currently connected to that network, and that the scanning device's camera supports QR recognition.",
      },
      {
        issue: "Slow speeds despite showing full signal bars.",
        fix: "Check for network congestion and switch to the 5GHz band if available, since signal strength alone doesn't guarantee throughput.",
      },
    ],
    faqs: [
      {
        q: "Is it safe to use public Wi-Fi at a coffee shop?",
        a: "It can be risky for sensitive activity like banking; use a VPN or your mobile data instead for anything sensitive on open networks.",
      },
      {
        q: "How do I share my Wi-Fi password without saying it out loud?",
        a: "Open the network's details in Settings, tap 'Share', and let the other person scan the generated QR code.",
      },
      {
        q: "Why does my phone keep asking me to sign in on public Wi-Fi?",
        a: "Many public networks use a captive portal login page that must be completed manually each session, even on a saved network.",
      },
      {
        q: "Can I set a static IP address for a specific network?",
        a: "Yes, open the network's advanced settings, switch IP settings from DHCP to Static, and enter your values.",
      },
    ],
    tipsAndTricks: [
      "Tap and hold a saved network to jump straight to 'Forget' without opening its full details screen.",
      "Use the built-in QR share feature for guest Wi-Fi instead of writing passwords down on paper.",
      "Check the advanced network details screen for signal strength in dBm when troubleshooting a weak connection.",
    ],
    relatedSettingIds: ["android-bluetooth", "android-privacy-dashboard"],
  },
  {
    id: "android-bluetooth",
    title: "Bluetooth Devices",
    icon: BluetoothIcon,
    platform: "android",
    category: "connectivity-network",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Pair Bluetooth Devices on Android",
    description:
      "Bluetooth settings let you pair headphones, speakers, watches, and other accessories, and manage previously connected devices.",
    details: [
      "Put the accessory in pairing mode before searching for new devices.",
      "Previously paired devices reconnect automatically when powered on and nearby.",
      "You can rename or forget a paired device from its device details screen.",
      "Battery levels for many accessories are shown right in the Bluetooth settings.",
    ],
    important:
      "If pairing repeatedly fails, forget the device on both your phone and the accessory, then pair again from scratch.",
    redirectUrl: "https://support.google.com/android/answer/9417604?hl=en",
    afterImageContent: {
      heading: "Pairing a New Accessory",
      paragraphs: [
        "Android scans for nearby discoverable Bluetooth devices once Bluetooth is turned on.",
        "Fast Pair can detect certain accessories automatically with a pop-up when they're nearby.",
        "Audio devices can be set as the default media or call output right from the notification shade.",
      ],
      steps: [
        "Open Settings → Connected devices → Pair new device.",
        "Put your accessory into pairing mode.",
        "Select it from the list of available devices and confirm pairing.",
      ],
    },
    whyItMatters:
      "Bluetooth accessories like earbuds, watches, and car systems are only useful if pairing stays reliable, and a cluttered device list is one of the most common reasons a phone connects to the wrong speaker or refuses to reconnect at all. Keeping the paired-device list tidy and understanding battery indicators also helps avoid accessories dying mid-use. It's a small setting that has an outsized effect on daily convenience.",
    bestPractices: [
      "Forget accessories you no longer use to keep the paired-device list manageable and prevent accidental reconnects.",
      "Turn Bluetooth off in unfamiliar public places when not in use to reduce discoverability.",
      "Check battery indicators for earbuds and watches regularly so they don't die mid-use.",
      "Manually select your preferred output device from the notification shade if multiple accessories are paired.",
    ],
    commonIssues: [
      {
        issue: "A previously paired device won't reconnect.",
        fix: "Forget the device on the phone, power the accessory off and back on, then pair it again from scratch.",
      },
      {
        issue: "Phone automatically connects to the wrong Bluetooth speaker or headphones.",
        fix: "Forget the unwanted device, or manually select the correct output from the notification shade's media controls.",
      },
      {
        issue: "Audio cuts out or lags with wireless earbuds.",
        fix: "Move closer to reduce interference, forget and re-pair the earbuds, and check the manufacturer's app for a firmware update.",
      },
      {
        issue: "Fast Pair popup doesn't appear for a supported accessory.",
        fix: "Make sure both Bluetooth and location are turned on, since Fast Pair relies on both to detect nearby devices.",
      },
    ],
    faqs: [
      {
        q: "Why won't my phone find my Bluetooth accessory?",
        a: "Confirm the accessory is actually in pairing mode, usually triggered by a button hold, rather than just powered on.",
      },
      {
        q: "Can I connect two audio devices at the same time?",
        a: "Many Android phones support dual audio streaming to two Bluetooth devices at once — check Settings → Connected devices for this option.",
      },
      {
        q: "How do I check my earbuds' battery level?",
        a: "Open Settings → Connected devices and tap the paired accessory; battery percentage is often shown right in the device list too.",
      },
      {
        q: "Does leaving Bluetooth on drain my battery?",
        a: "Modern Bluetooth Low Energy uses minimal power while idle, so leaving it on has a negligible impact compared to older Bluetooth versions.",
      },
    ],
    tipsAndTricks: [
      "Long-press the Bluetooth Quick Settings tile to jump straight into the full device list instead of just toggling it on and off.",
      "Use Fast Pair-compatible accessories for a one-tap pop-up pairing experience instead of manual discovery.",
      "Rename devices with clear labels like 'Car' or 'Kitchen Speaker' to make switching outputs from the notification shade faster.",
    ],
    relatedSettingIds: ["android-wifi", "android-display-dark-mode"],
  },
  {
    id: "android-display-dark-mode",
    title: "Display & Dark Theme",
    icon: Moon,
    platform: "android",
    category: "display-sound-notifications",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Adjust Display Settings & Dark Theme",
    description:
      "Display settings control brightness, screen timeout, font size, and Dark theme — a system-wide dark color scheme that's easier on the eyes and can save battery on some screens.",
    details: [
      "Dark theme can be scheduled to turn on automatically at sunset or on a custom schedule.",
      "Adaptive brightness learns your preferences and adjusts screen brightness automatically.",
      "Font and display size can be scaled independently for readability.",
      "Screen timeout controls how long the display stays on before locking.",
    ],
    important:
      "Very short screen timeouts save battery but can make the screen lock while you're still reading — balance based on your habits.",
    redirectUrl: "https://support.google.com/android/answer/9730472?hl=en",
    afterImageContent: {
      heading: "Customizing Display Settings",
      paragraphs: [
        "Dark theme applies system-wide and to apps that support it, reducing glare in low light.",
        "You can schedule Dark theme to follow sunset-to-sunrise or a custom time range.",
        "Adaptive brightness uses the light sensor plus your manual adjustments to fine-tune brightness over time.",
      ],
      steps: [
        "Open Settings → Display.",
        "Turn on 'Dark theme' or tap it to set a schedule.",
        "Adjust brightness, font size, and screen timeout as needed.",
      ],
    },
    whyItMatters:
      "Display settings shape how comfortable your phone is to use for hours every day, from eye strain in low light to readability of small text. On OLED and AMOLED screens, which most modern Android phones use, Dark theme can also meaningfully reduce power draw since black pixels draw far less energy. Getting brightness, timeout, and theme right is a quality-of-life setting most people only think about after they've been squinting at their screen for months.",
    bestPractices: [
      "Schedule Dark theme to follow sunset-to-sunrise instead of switching it manually every day.",
      "Use adaptive brightness instead of a fixed level so the screen adjusts automatically across lighting conditions.",
      "Increase font or display size for readability rather than holding the phone closer to your eyes.",
      "Set a shorter screen timeout in public and a longer one at home to balance battery life and convenience.",
    ],
    commonIssues: [
      {
        issue: "Some apps don't switch to dark theme even with the system-wide setting on.",
        fix: "Check that app's own in-app theme toggle, since many require a separate setting, or enable 'Override force-dark' under Developer options for unsupported apps.",
      },
      {
        issue: "Screen turns off too quickly while reading.",
        fix: "Increase the duration in Settings → Display → Screen timeout, or use an attention-aware feature (on supported devices) that keeps the screen on while you're looking at it.",
      },
      {
        issue: "Adaptive brightness doesn't seem to learn your preferences.",
        fix: "Manually adjust brightness a few times across different lighting to help it calibrate, or turn it off and set brightness manually if it keeps misjudging.",
      },
      {
        issue: "Dark theme's sunset-to-sunrise schedule doesn't trigger at the expected time.",
        fix: "Confirm location services are enabled, since that schedule calculates sunset and sunrise based on your location.",
      },
    ],
    faqs: [
      {
        q: "Does dark theme actually save battery?",
        a: "On OLED/AMOLED screens, which most modern Android phones use, yes — black pixels draw significantly less power; on LCD screens the savings are minimal.",
      },
      {
        q: "Can dark theme turn on automatically at a specific time I choose?",
        a: "Yes, pick a custom schedule instead of sunset-to-sunrise under Display → Dark theme settings.",
      },
      {
        q: "Why does my screen look dim outdoors even at maximum brightness?",
        a: "Check for a screen protector affecting visibility, and look for a boosted outdoor brightness mode if your device offers one.",
      },
      {
        q: "Can I set dark theme for only some apps and not others?",
        a: "Some Android versions allow per-app dark theme overrides under Settings → Apps → [app] → Display, though not every app supports it.",
      },
    ],
    tipsAndTricks: [
      "Add a Dark theme toggle to Quick Settings for one-swipe access instead of digging into the Display menu.",
      "Try 'Extra dim', found near brightness controls, for comfortable nighttime reading below the usual minimum brightness.",
      "Use Bedtime mode in Digital Wellbeing to auto-enable Dark theme and grayscale together at night.",
    ],
    relatedSettingIds: ["android-accessibility", "android-bluetooth"],
  },
  {
    id: "android-google-account-sync",
    title: "Google Account Sync",
    icon: RefreshCw,
    platform: "android",
    category: "accounts-sync-family",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Google Account Sync on Android",
    description:
      "Account sync keeps Gmail, Calendar, Contacts, Photos, and other Google app data updated automatically across your devices, tied to your signed-in Google Account.",
    details: [
      "Each Google app can be toggled to sync independently.",
      "Sync typically runs in the background over Wi-Fi or mobile data.",
      "If a specific app stops updating, checking its individual sync toggle is a good first step.",
      "Multiple Google Accounts can be added and synced separately on the same device.",
    ],
    important:
      "Turning off sync for an app doesn't delete existing data on your device — it just stops new changes from updating automatically.",
    redirectUrl: "https://support.google.com/pixelphone/answer/2840875?hl=en",
    afterImageContent: {
      heading: "Troubleshooting Sync Issues",
      paragraphs: [
        "If an app isn't syncing, confirm you're signed in and have a working internet connection.",
        "Removing and re-adding the account can resolve persistent sync problems.",
        "Battery-saving modes can sometimes delay background sync — check battery optimization settings for the app if sync feels slow.",
      ],
      steps: [
        "Open Settings → Passwords & accounts (or Accounts).",
        "Select your Google Account.",
        "Review and toggle sync for individual apps and services.",
      ],
    },
    whyItMatters:
      "Sync is the invisible thread that keeps your calendar, contacts, and email consistent whether you're on your phone, tablet, or a browser, and most people never notice it until it silently breaks. A single toggled-off app can mean missed meetings or contacts that quietly fall out of date across devices. Understanding sync at the per-app level makes it much faster to isolate and fix the one thing that actually stopped working, instead of assuming your whole account is broken.",
    bestPractices: [
      "Check the individual app's sync toggle first when only one service, like Calendar, stops updating.",
      "Keep multiple Google Accounts organized by only syncing the apps you actually use under each one.",
      "Exempt time-sensitive apps from aggressive battery optimization if their sync consistently lags.",
      "Periodically confirm you're still signed in, since a silent sign-out can quietly stop sync without an obvious alert.",
    ],
    commonIssues: [
      {
        issue: "Calendar or Contacts stop updating across devices.",
        fix: "Open Settings → Accounts → [Google Account], confirm that app's sync toggle is on, then toggle it off and back on to force a refresh.",
      },
      {
        issue: "Sync appears stuck with a spinning icon that never resolves.",
        fix: "Check your internet connection, then remove and re-add the Google Account, which often clears a stuck sync state.",
      },
      {
        issue: "New emails or calendar events show up noticeably late.",
        fix: "Check battery optimization settings for Gmail or Calendar, since aggressive power-saving modes can delay background sync on some devices.",
      },
      {
        issue: "Two Google Accounts on one device cause duplicate contacts or events.",
        fix: "Check which account each app syncs with and disable sync for the account you don't want that app pulling from.",
      },
    ],
    faqs: [
      {
        q: "Will turning off sync delete data already on my phone?",
        a: "No, it only stops new changes from syncing; existing data stays put until you manually remove it.",
      },
      {
        q: "Can I sync some Google apps but not others?",
        a: "Yes, Gmail, Calendar, Contacts, Photos, and other apps each have their own independent sync toggle.",
      },
      {
        q: "Why do I have to sign back in periodically?",
        a: "Google may require re-authentication after a password change, security event, or a long stretch of inactivity to protect your account.",
      },
      {
        q: "Can I add both a work and a personal Google Account on the same phone?",
        a: "Yes, Android supports multiple accounts and lets you manage sync independently for each one.",
      },
    ],
    tipsAndTricks: [
      "Use the in-app 'Sync now' option (like inside Gmail's account settings) for a faster manual refresh than waiting on the system-wide sync.",
      "Removing and re-adding just the affected account is usually faster than a full device restart when troubleshooting sync.",
      "Check Digital Wellbeing or battery optimization exemptions for accounts tied to time-sensitive apps like Calendar.",
    ],
    relatedSettingIds: [
      "android-backup-restore",
      "android-app-permissions",
      "android-privacy-dashboard",
    ],
    updateFrequency:
      "Syncs continuously in the background; check manually if data ever seems out of date.",
  },
  {
    id: "android-accessibility",
    title: "Accessibility Settings",
    icon: Accessibility,
    platform: "android",
    category: "accessibility-language",
    recommended: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Accessibility on Android",
    description:
      "Android's Accessibility settings include TalkBack screen reading, magnification, color and contrast adjustments, and Switch Access for people who use adaptive hardware.",
    details: [
      "TalkBack reads screen content aloud and can be controlled with gestures.",
      "Magnification lets you zoom into part or all of the screen with a shortcut.",
      "Color correction and contrast settings help with various types of color vision differences.",
      "Accessibility shortcuts let you trigger your most-used feature quickly from any screen.",
    ],
    important:
      "Turning on TalkBack changes how touch gestures work system-wide — review the tutorial before enabling it for the first time.",
    redirectUrl: "https://support.google.com/accessibility/android/answer/6006564?hl=en",
    afterImageContent: {
      heading: "Finding the Right Feature",
      paragraphs: [
        "Accessibility settings are grouped by Screen readers, Display, Interaction controls, and more.",
        "Most features support an assignable shortcut (like a button combo or gesture) for quick access.",
        "Google also offers standalone accessibility apps like Lookout and Live Transcribe that integrate with these settings.",
      ],
      steps: [
        "Open Settings → Accessibility.",
        "Browse the available categories and features.",
        "Turn on the feature you need and configure its shortcut.",
      ],
    },
    whyItMatters:
      "For many users, accessibility settings aren't a nice-to-have — they're what makes the phone usable at all, whether that's TalkBack for someone who is blind or low vision, magnification for low-vision users, or Switch Access for someone using adaptive hardware. Even for people without a permanent need, these features help temporarily, like using captions in a loud room or larger text after eye strain. Knowing where these settings live and how to configure shortcuts turns a phone into a genuinely adaptable tool instead of a one-size-fits-all device.",
    bestPractices: [
      "Complete the TalkBack tutorial before relying on it daily, since it fundamentally changes how touch gestures work.",
      "Assign your most-used accessibility feature to a quick shortcut, like a button combo or gesture, for fast access.",
      "Test magnification and color correction in real-world lighting before committing to them long-term.",
      "Pair Switch Access with any external adaptive hardware ahead of time rather than troubleshooting during first use.",
      "Revisit accessibility settings after major Android updates, since feature names and locations occasionally change.",
    ],
    commonIssues: [
      {
        issue: "TalkBack makes the phone feel unusable because gestures are unfamiliar.",
        fix: "Go through Settings → Accessibility → TalkBack → Tutorial, which walks through the modified gesture set step by step.",
      },
      {
        issue: "Magnification triggers accidentally during normal use.",
        fix: "Switch the magnification trigger from a triple-tap to a dedicated button shortcut in Accessibility settings.",
      },
      {
        issue: "Color correction makes some app colors look worse instead of better.",
        fix: "Try the different correction modes (deuteranomaly, protanomaly, tritanomaly), since the right one depends on the specific color vision type.",
      },
      {
        issue: "The accessibility shortcut button doesn't launch the intended feature.",
        fix: "Re-check Settings → Accessibility → [feature] → shortcut assignment, since typically only one feature can be bound to a given shortcut trigger at a time.",
      },
    ],
    faqs: [
      {
        q: "Can I use more than one accessibility feature at once?",
        a: "Yes, features like magnification, TalkBack, and color correction can generally run simultaneously, though some combinations may need adjustment.",
      },
      {
        q: "How do I quickly turn off TalkBack if I enabled it by accident?",
        a: "Use the volume key shortcut (holding both volume keys) if it's enabled, or carefully navigate to Settings → Accessibility → TalkBack to turn it off.",
      },
      {
        q: "Are there dedicated Google apps built for accessibility?",
        a: "Yes, apps like Lookout for object and text recognition and Live Transcribe for real-time captions integrate directly with these settings.",
      },
      {
        q: "Can I make text bigger without resizing the whole display?",
        a: "Yes, font size and display size are separate sliders, so you can scale text alone without resizing icons and layout.",
      },
    ],
    tipsAndTricks: [
      "Set up the accessibility button or gesture shortcut to instantly toggle your most-used feature from nearly any screen.",
      "Try Select to Speak to have specific on-screen text read aloud without turning on full TalkBack narration.",
      "Use the accessibility shortcut menu (often power + volume up, held together) as a quick path into these settings without navigating menus.",
    ],
    relatedSettingIds: [
      "android-display-dark-mode",
      "android-app-permissions",
      "android-privacy-dashboard",
    ],
  },
  {
    id: "android-factory-reset",
    title: "Factory Reset",
    icon: RotateCcw,
    platform: "android",
    category: "troubleshooting-diagnostics",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Reset Your Android Device to Factory Settings",
    description:
      "Factory data reset erases all data on your device and restores its original settings — useful for resolving persistent software issues, or before selling or recycling the device.",
    details: [
      "Back up anything important before resetting — the process cannot be undone.",
      "Factory Reset Protection may require your Google Account sign-in after the reset for security.",
      "Removable storage (SD cards) is usually not affected by a factory reset.",
      "Some manufacturers offer a 'soft reset' (simple restart) as a lighter troubleshooting step before a full factory reset.",
    ],
    important:
      "Make sure you remember your Google Account password — Factory Reset Protection can lock the device if you can't verify ownership after resetting.",
    redirectUrl: "https://support.google.com/android/answer/6088915?hl=en",
    afterImageContent: {
      heading: "Before You Reset",
      paragraphs: [
        "Confirm your important photos, files, and app data are backed up to your Google Account.",
        "Sign out of accounts that use device-based security keys if applicable.",
        "Have your Google Account credentials ready to verify ownership after the reset.",
      ],
      steps: [
        "Open Settings → System → Reset options.",
        "Tap 'Erase all data (factory reset)'.",
        "Confirm the reset and wait for your device to restart.",
        "Sign back in with your Google Account when setup finishes.",
      ],
    },
    whyItMatters:
      "A factory reset is one of the few genuinely irreversible actions on an Android phone, wiping local data completely and restoring the device to its out-of-box state. It's often the right call for a persistent software problem, or a required step before selling, donating, or recycling a device safely. Getting the order of operations right — backup first, account removal, then reset — is the difference between a clean handoff and a locked, unusable device or permanently lost data.",
    bestPractices: [
      "Complete a full manual backup and confirm it finished before starting the reset.",
      "Remove your Google Account, screen lock, and any device-based security keys beforehand, especially if giving the device away.",
      "Write down your Google Account credentials in advance, since Factory Reset Protection will require them afterward.",
      "Remove or separately back up the SD card if you want to keep its contents outside the reset.",
    ],
    commonIssues: [
      {
        issue: "Device demands the previous owner's Google Account after reset (Factory Reset Protection lock).",
        fix: "Only proceed with a reset after fully signing out of the Google Account beforehand; if locked, the original account credentials are required to unlock it.",
      },
      {
        issue: "Reset appears to hang on the boot logo for a long time.",
        fix: "Wait at least 15-20 minutes, since first-boot setup after a reset can take a while; force a restart only if it's genuinely frozen beyond that.",
      },
      {
        issue: "Some apps' data doesn't come back after setup, even though backup was confirmed.",
        fix: "Check whether that app uses its own separate cloud login and restore process instead of Android's system backup.",
      },
      {
        issue: "Realizing too late that no backup was made before resetting.",
        fix: "Data already erased generally can't be recovered from the device itself; check individual cloud services like Photos or email that may still hold synced copies.",
      },
    ],
    faqs: [
      {
        q: "Can a factory reset be undone?",
        a: "No, once it completes the device's local data is erased; only previously backed-up data can be restored afterward.",
      },
      {
        q: "Do I need to remove my SIM card before resetting?",
        a: "Not required, but it's good practice if you're handing the device to someone else and don't want the SIM still active in it.",
      },
      {
        q: "Will a factory reset remove a forgotten screen lock PIN?",
        a: "Yes, but you'll likely still need to pass Factory Reset Protection using your Google Account afterward.",
      },
      {
        q: "Does factory reset affect an inserted SD card?",
        a: "Typically no — internal storage is wiped, but a removable SD card's contents usually remain untouched unless you choose to format it separately.",
      },
    ],
    tipsAndTricks: [
      "Use the 'Erase eSIM' option carefully if the device has an eSIM and you're giving the phone away, since it isn't removed automatically otherwise.",
      "Manually remove all accounts under Settings → Accounts before resetting for a cleaner handoff, even though the reset itself wipes them.",
      "Screenshot your backup confirmation screen as a timestamped reference if preparing a device for trade-in or resale.",
    ],
    relatedSettingIds: [
      "android-backup-restore",
      "android-google-account-sync",
      "android-storage-cleanup",
    ],
  },
  {
    id: "android-notifications",
    title: "Notifications",
    icon: Bell,
    platform: "android",
    category: "display-sound-notifications",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Control Notifications on Android",
    description:
      "Notification settings let you decide which apps can alert you, how those alerts look, and where they show up — from the lock screen to the status bar. You can manage this globally or app by app, and choose which notifications are urgent enough to break through Do Not Disturb.",
    details: [
      "Each app's notifications can be turned off entirely or split into categories (like 'promotions' versus 'order updates').",
      "Notifications can be set to Alerting (makes sound, appears at top) or Silent (no sound, lower in the list).",
      "Lock screen visibility can be set to show full content, show only that a notification exists, or hide it completely.",
      "Notification history keeps a temporary log of recent alerts, including ones you've dismissed.",
    ],
    important:
      "Turning off notifications for an app doesn't uninstall or disable it — the app still runs, it just won't alert you.",
    redirectUrl: "https://support.google.com/android/answer/9079661?hl=en",
    afterImageContent: {
      heading: "How Notifications Work on Android",
      paragraphs: [
        "Android groups notifications by app, and many apps further break their alerts into specific categories you can control individually.",
        "Notification dots on app icons and the status bar give a quick, low-friction signal before you open the notification shade.",
        "Sensitive notifications (like one-time codes) can be hidden on the lock screen even when other content is shown.",
      ],
      steps: [
        "Open Settings → Notifications.",
        "Tap 'App notifications' to manage a specific app, or adjust lock screen and status bar behavior from the main page.",
        "Select an app to turn its notifications on/off or fine-tune individual categories.",
        "Long-press any notification in the shade for a shortcut into that app's notification settings.",
      ],
    },
    whyItMatters:
      "Notifications are the single biggest source of daily phone interruptions, and unmanaged, they train you to check your phone far more than you actually need to. Getting per-app control right means the alerts that matter — a message from family, a delivery update — still get through instantly, while marketing pings and app-engagement nudges get silenced. It's also a genuine focus and mental-health lever, not just a convenience setting, since constant low-value interruptions measurably fragment attention over a day.",
    bestPractices: [
      "Turn off promotional or 'engagement' notification categories individually instead of muting a useful app entirely.",
      "Set less urgent apps to Silent so they don't make sound or appear at the top, but still show up in the shade.",
      "Hide sensitive notification content on the lock screen, especially for banking, email, and messaging apps.",
      "Review notification permissions for any newly installed app during its first week of real use.",
      "Use notification history to check whether you missed something important during a Do Not Disturb window.",
    ],
    commonIssues: [
      {
        issue: "An app's notifications stop arriving even though they're turned on in the app itself.",
        fix: "Check Settings → Notifications → [app] to confirm Android-level notification permission wasn't separately revoked.",
      },
      {
        issue: "Too many low-priority notifications make it hard to notice the important ones.",
        fix: "Set noisy apps to Silent individually rather than turning off notifications altogether, so they still appear without interrupting.",
      },
      {
        issue: "Sensitive content (like verification codes) shows in full on the lock screen.",
        fix: "Change lock screen notification visibility to 'Hide sensitive content' or 'Don't show notifications at all' under Settings → Notifications.",
      },
      {
        issue: "A notification was dismissed by accident before it could be read.",
        fix: "Open Settings → Notifications → Notification history to recover recently dismissed alerts.",
      },
    ],
    faqs: [
      {
        q: "Can I control specific types of notifications from one app, not just all or nothing?",
        a: "Yes, many apps break notifications into categories (like order updates versus promotions) that can each be toggled independently.",
      },
      {
        q: "What's the difference between Alerting and Silent notifications?",
        a: "Alerting notifications make a sound and appear at the top of the shade; Silent ones make no sound and sit lower in the list without interrupting you.",
      },
      {
        q: "Can I recover a notification I swiped away by mistake?",
        a: "Yes, Notification history keeps a temporary record of recent alerts, including ones already dismissed.",
      },
    ],
    tipsAndTricks: [
      "Long-press directly on a notification in the shade to jump straight into that app's notification settings, skipping the full Settings menu.",
      "Use per-category controls on apps like email or shopping instead of an all-or-nothing mute when only some alert types are annoying.",
    ],
    relatedSettingIds: [
      "android-sound-vibration",
      "android-do-not-disturb",
      "android-privacy-dashboard",
    ],
  },
  {
    id: "android-sound-vibration",
    title: "Sound & Vibration",
    icon: Volume2,
    platform: "android",
    category: "display-sound-notifications",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Adjust Sound & Vibration on Android",
    description:
      "Sound & Vibration settings control independent volume levels for media, ringtones, notifications, and alarms, along with vibration intensity and patterns. You can also assign custom ringtones per contact and configure haptic feedback for touch and typing.",
    details: [
      "Media, call, notification, and alarm volumes are each controlled by a separate slider.",
      "Vibration intensity for calls, notifications, and touch feedback can be adjusted independently.",
      "Custom ringtones and notification sounds can be assigned to specific contacts or apps.",
      "Vibrate mode silences ringtones while keeping a physical alert active for incoming calls and messages.",
    ],
    important:
      "Turning your ringer volume all the way down doesn't necessarily silence notification sounds or alarms — check each volume category separately.",
    redirectUrl: "https://support.google.com/android/answer/9082609?hl=en",
    afterImageContent: {
      heading: "Understanding Independent Volume Channels",
      paragraphs: [
        "Android treats ring, media, alarm, and notification volume as separate channels rather than one master volume.",
        "Pressing the physical volume buttons adjusts whichever channel is currently active (like media while a video plays).",
        "A small on-screen slider menu lets you switch between channels and expand for finer control.",
      ],
      steps: [
        "Open Settings → Sound & vibration.",
        "Adjust the sliders for Media, Call, Ring, Notification, and Alarm volume.",
        "Tap 'Vibration & haptics' to set intensity for calls, notifications, and touch feedback.",
      ],
    },
    whyItMatters:
      "Because Android splits volume into separate channels, a phone can seem 'silent' while an alarm or notification still blares at full volume at an inconvenient moment — understanding this separation avoids that surprise. Vibration and haptic settings also shape the tactile feel of everyday interactions like typing and unlocking, which many people never realize is adjustable. Getting these settings tuned to your environment, whether that's a quiet office or a noisy commute, makes the phone considerably less intrusive without missing anything important.",
    bestPractices: [
      "Set the alarm volume independently and don't rely on ring volume alone before bed.",
      "Assign distinct ringtones to close contacts so you can recognize an important call without looking at the screen.",
      "Lower haptic feedback intensity for typing if it feels distracting, while keeping call vibration strong enough to notice.",
      "Use the expanded volume panel (tap the arrow on the on-screen slider) to check all channels at once before a meeting.",
      "Test vibrate mode in a pocket or bag periodically to confirm it's strong enough to actually be noticed.",
    ],
    commonIssues: [
      {
        issue: "Phone stays silent for calls but alarms still play at full volume unexpectedly.",
        fix: "Check the Alarm volume slider separately in Settings → Sound & vibration, since it's independent from Ring volume.",
      },
      {
        issue: "A custom ringtone assigned to a contact doesn't play; the default ringtone plays instead.",
        fix: "Reassign the ringtone from the contact's own detail page rather than the global sound settings, since per-contact tones are set there.",
      },
      {
        issue: "Vibration feels too weak to notice in a pocket.",
        fix: "Increase vibration intensity under Settings → Sound & vibration → Vibration & haptics, and confirm the case isn't dampening it.",
      },
      {
        issue: "Media volume resets unexpectedly after connecting Bluetooth headphones.",
        fix: "This is often the paired device recalling its own last-used volume; adjust the level again once connected, since it's remembered per device.",
      },
    ],
    faqs: [
      {
        q: "Why does turning the ringer down not silence my notifications?",
        a: "Android controls ring, notification, media, and alarm volume as separate channels, so each needs to be adjusted individually.",
      },
      {
        q: "Can I set a different ringtone for one specific person?",
        a: "Yes, open that contact's details, tap 'Set ringtone', and choose a sound unique to them.",
      },
      {
        q: "Does vibrate mode also silence notification sounds?",
        a: "Yes, vibrate mode mutes audible alerts while still triggering a vibration for calls and messages.",
      },
    ],
    tipsAndTricks: [
      "Tap the small arrow next to the volume slider popup to reveal and adjust all volume channels at once instead of pressing buttons repeatedly.",
      "Use per-app notification sound overrides (where supported) so your highest-priority apps sound distinct from the rest.",
    ],
    relatedSettingIds: ["android-notifications", "android-do-not-disturb"],
  },
  {
    id: "android-do-not-disturb",
    title: "Do Not Disturb / Focus Mode",
    icon: BellOff,
    platform: "android",
    category: "display-sound-notifications",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Limit Interruptions with Do Not Disturb & Modes",
    description:
      "Do Not Disturb silences calls, texts, and notifications while still letting you choose specific exceptions, like starred contacts or repeat callers. Android's broader Modes system extends this with presets like Bedtime and Driving, plus fully custom modes for work or focus time.",
    details: [
      "Exceptions can allow calls or messages from starred contacts, repeat callers, or specific apps to break through.",
      "Modes can be scheduled automatically by time, calendar event, or even while a specific app is open.",
      "A repeat-caller exception lets a second call from the same number within 15 minutes ring through, useful for emergencies.",
      "Do Not Disturb can be turned on instantly from Quick Settings without setting up a full schedule.",
    ],
    important:
      "Do Not Disturb silences notifications but doesn't stop them from arriving — check notification history afterward if you were expecting something time-sensitive.",
    redirectUrl: "https://support.google.com/android/answer/9069335?hl=en",
    afterImageContent: {
      heading: "Modes vs. a Quick Toggle",
      paragraphs: [
        "A quick Do Not Disturb toggle in Quick Settings silences everything immediately, using your last configured exceptions.",
        "Custom Modes let you define different rules for different situations, like a 'Work' mode that only allows work contacts through.",
        "Scheduled modes (like Bedtime) turn on and off automatically without needing to remember to toggle them.",
      ],
      steps: [
        "Open Settings → Sound & vibration → Do Not Disturb (or Settings → Modes).",
        "Set exceptions for calls, messages, and specific apps.",
        "Create a schedule, or choose an existing preset like Bedtime or Driving.",
      ],
    },
    whyItMatters:
      "Constant interruptions from every app and message can fragment focus throughout the day, and Do Not Disturb is the most direct way to reclaim uninterrupted blocks of time without missing something genuinely urgent. The exception system means it isn't an all-or-nothing choice — a parent can still be reached by their kid's school, while marketing notifications stay silenced. Scheduled modes like Bedtime also protect sleep by automatically dimming the screen and muting alerts without requiring you to remember to turn anything on each night.",
    bestPractices: [
      "Set starred contacts and repeat callers as exceptions so genuine emergencies can still reach you.",
      "Schedule Bedtime mode automatically instead of relying on manually toggling Do Not Disturb before sleep.",
      "Create a separate custom mode for focused work blocks that only allows a narrow set of apps or contacts through.",
      "Review which apps are allowed to break through Do Not Disturb periodically, since permissions can be granted and forgotten.",
      "Use the Quick Settings toggle for short, unplanned silence rather than building a new schedule every time.",
    ],
    commonIssues: [
      {
        issue: "An important call gets silenced despite Do Not Disturb being on.",
        fix: "Add that contact to your starred contacts or allowed callers list under the Do Not Disturb exceptions.",
      },
      {
        issue: "Do Not Disturb turns off unexpectedly in the middle of a scheduled window.",
        fix: "Check for overlapping modes or a calendar event ending early, since another mode's schedule can override an active one.",
      },
      {
        issue: "Alarms don't sound even with Do Not Disturb enabled.",
        fix: "This shouldn't normally happen since alarms are exempt by default; confirm alarm volume itself hasn't been turned down separately.",
      },
      {
        issue: "Messages from a specific app still interrupt Do Not Disturb.",
        fix: "Check that app's notification importance setting, since apps marked as high priority can be configured to bypass Do Not Disturb.",
      },
    ],
    faqs: [
      {
        q: "Does Do Not Disturb block notifications completely, or just silence them?",
        a: "It silences them — notifications still arrive and can be reviewed later in the notification shade or history, they just don't alert you.",
      },
      {
        q: "Can I let a specific app always break through Do Not Disturb?",
        a: "Yes, some Android versions let you mark an app's notifications as priority so they bypass Do Not Disturb.",
      },
      {
        q: "What happens if the same person calls twice in a row during Do Not Disturb?",
        a: "If the repeat-caller exception is enabled, a second call within about 15 minutes will ring through as a likely emergency.",
      },
    ],
    tipsAndTricks: [
      "Set up a distinct 'Focus' mode for deep work that's stricter than your everyday Do Not Disturb exceptions.",
      "Use Bedtime mode's automatic Dark theme and grayscale pairing to also reduce the urge to keep scrolling at night.",
    ],
    relatedSettingIds: ["android-notifications", "android-sound-vibration"],
  },
  {
    id: "android-battery",
    title: "Battery",
    icon: BatteryCharging,
    platform: "android",
    category: "system-updates",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Battery Life & Usage on Android",
    description:
      "Battery settings show a breakdown of what's draining your charge, offer a Battery Saver mode to stretch remaining power, and let you restrict background activity for specific apps. A built-in health estimate also indicates how much capacity your battery has lost over time.",
    details: [
      "A usage graph shows battery percentage over time alongside which apps consumed the most power.",
      "Battery Saver reduces background activity, limits location accuracy, and can enable Dark theme automatically.",
      "Individual apps can be restricted from running in the background even when Battery Saver is off.",
      "Battery health information (on supported devices) estimates the battery's remaining capacity compared to new.",
    ],
    important:
      "Aggressively restricting a messaging or email app's background activity can delay notifications arriving in real time.",
    redirectUrl: "https://support.google.com/android/answer/7664692?hl=en",
    afterImageContent: {
      heading: "Diagnosing Battery Drain",
      paragraphs: [
        "The battery usage graph highlights spikes tied to specific apps or screen-on time, making drain sources easier to spot.",
        "Battery Saver can be set to turn on automatically at a chosen percentage rather than manually every time.",
        "Adaptive Battery learns which apps you use least and limits their background activity automatically.",
      ],
      steps: [
        "Open Settings → Battery.",
        "Review the usage graph and per-app breakdown for the current cycle.",
        "Turn on Battery Saver, or set it to activate automatically at a specific percentage.",
        "Tap a high-drain app to restrict its background activity if needed.",
      ],
    },
    whyItMatters:
      "Battery anxiety is one of the most common daily frustrations with any smartphone, and the difference between a phone that lasts all day and one that dies by mid-afternoon usually comes down to a handful of misbehaving background apps rather than the battery itself. Understanding the usage graph turns a vague 'my battery is bad' feeling into an actionable fix, like restricting one specific app instead of restarting the whole phone. Battery health tracking also matters long-term, since a battery naturally loses capacity over a few years, and knowing that number helps you decide when a replacement or new device actually makes sense.",
    bestPractices: [
      "Check the battery usage graph whenever drain feels unusually fast instead of assuming it's simply age-related.",
      "Set Battery Saver to activate automatically at 20% so you don't have to remember to turn it on.",
      "Restrict background activity only for apps you've confirmed are heavy drainers, not every rarely used app.",
      "Avoid letting the phone sit at 0% or 100% for extended periods, since both extremes accelerate long-term battery wear.",
      "Check battery health (where available) before assuming a new phone is needed for shortened battery life.",
    ],
    commonIssues: [
      {
        issue: "Battery drains far faster than usual after installing a new app.",
        fix: "Check that app's usage in the battery graph and restrict its background activity if it's consuming a disproportionate share.",
      },
      {
        issue: "Phone gets noticeably hot even when not in active use.",
        fix: "Check for an app stuck running in the background, remove it from a case if the phone is overheating, and avoid charging in direct sunlight.",
      },
      {
        issue: "Battery Saver doesn't seem to extend battery life much.",
        fix: "Confirm background restrictions are actually applied to your top-draining apps, since Battery Saver's default settings may not target every heavy app.",
      },
      {
        issue: "Battery percentage estimate seems inaccurate or jumps suddenly.",
        fix: "Let the phone fully discharge and recharge once to help recalibrate the percentage estimate, and update to the latest software.",
      },
    ],
    faqs: [
      {
        q: "Does closing apps from the recent apps list actually save battery?",
        a: "Usually not much — Android already manages background apps efficiently, and repeatedly reopening a closed app can use more power than leaving it paused.",
      },
      {
        q: "What does Adaptive Battery do?",
        a: "It learns which apps you use least often and limits their background activity and notifications to conserve power automatically.",
      },
      {
        q: "How can I tell if my battery has degraded significantly?",
        a: "Check Settings → Battery for a battery health or capacity estimate on supported devices, which compares current capacity to when the battery was new.",
      },
    ],
    tipsAndTricks: [
      "Tap directly into the battery usage graph's time markers to see exactly which app was active during a steep drain.",
      "Use per-app background restriction sparingly and only after confirming a genuine drain, since over-restricting can delay notifications.",
    ],
    relatedSettingIds: [
      "android-system-update",
      "android-storage-cleanup",
      "android-display-dark-mode",
    ],
  },
  {
    id: "android-apps-default-apps",
    title: "Apps & Default Apps",
    icon: AppWindow,
    platform: "android",
    category: "apps-features",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Apps & Set Default Apps on Android",
    description:
      "The Apps settings page lists every installed app along with its permissions, storage use, and battery impact, and lets you set which app opens automatically for tasks like browsing, messaging, or phone calls when more than one option is installed. This is also where you uninstall, disable, or force-stop an app directly.",
    details: [
      "Default apps can be set individually for browser, phone, messaging, and other common categories.",
      "Disabling a pre-installed system app hides it without fully uninstalling it, which can be reversed later.",
      "Force-stopping an app immediately ends all of its running processes, useful when one is frozen or misbehaving.",
      "Each app's detail page shows permissions, storage, battery, mobile data, and notification settings in one place.",
    ],
    important:
      "Clearing an app's 'storage' from this screen (not just its cache) deletes its saved logins and local data — that step can't be undone.",
    redirectUrl: "https://support.google.com/pixelphone/answer/6271667?hl=en",
    afterImageContent: {
      heading: "Choosing Default Apps",
      paragraphs: [
        "When multiple apps can handle the same action (like opening a link), Android may ask which one to use, or you can set a default in advance.",
        "Clearing a default app's setting makes Android ask again the next time that action happens.",
        "Some categories, like 'Opening links', support per-domain default apps rather than one global choice.",
      ],
      steps: [
        "Open Settings → Apps.",
        "Tap 'Default apps' to review or change the app used for browsing, calling, messaging, and more.",
        "Select a category and choose your preferred app from the list.",
      ],
    },
    whyItMatters:
      "Default apps quietly control which browser opens every link and which app answers every call, so getting them wrong means constantly being routed into an app you didn't actually mean to use. The full app list is also the fastest way to see what's actually installed, what's eating storage or battery, and what genuinely needs to be removed instead of just ignored. For troubleshooting, force-stop and disable are often the difference between a full factory reset and a thirty-second fix for one misbehaving app.",
    bestPractices: [
      "Set a default browser and messaging app deliberately rather than letting the first prompt decide by accident.",
      "Force-stop a frozen or unresponsive app before assuming a full restart is necessary.",
      "Disable pre-installed apps you never use instead of leaving them running invisibly in the background.",
      "Review the full apps list periodically to catch anything installed without your direct knowledge.",
      "Clear a default app choice if you install a preferred alternative later, so Android prompts you again.",
    ],
    commonIssues: [
      {
        issue: "Links always open in the wrong browser.",
        fix: "Go to Settings → Apps → Default apps → Browser app and select your preferred browser directly.",
      },
      {
        issue: "An app is frozen and won't respond to taps.",
        fix: "Open Settings → Apps → [app] → Force stop, then reopen it; reinstall only if the problem persists.",
      },
      {
        issue: "A pre-installed system app can't be uninstalled.",
        fix: "Use 'Disable' instead of uninstall for system apps, which hides it and stops it from running without requiring full removal.",
      },
      {
        issue: "An app keeps prompting to choose a default every single time instead of remembering the choice.",
        fix: "Check that 'Always' (not 'Just once') was selected when prompted, or set the default directly from Settings → Apps → Default apps.",
      },
    ],
    faqs: [
      {
        q: "Can I change my default browser after already picking one?",
        a: "Yes, open Settings → Apps → Default apps → Browser app at any time and select a different one.",
      },
      {
        q: "What's the difference between disabling and uninstalling an app?",
        a: "Disabling hides a pre-installed app and stops it from running while keeping it recoverable; uninstalling removes it (and its data) entirely, where allowed.",
      },
      {
        q: "Does force-stopping an app delete its data?",
        a: "No, it only ends the app's current running processes; your data and settings for that app remain intact.",
      },
    ],
    tipsAndTricks: [
      "Use each app's detail page as a one-stop view of its permissions, storage, and battery impact instead of checking multiple settings screens.",
      "Set default apps for links, messaging, and calling right after setting up a new phone, before habits form around the wrong ones.",
    ],
    relatedSettingIds: [
      "android-app-permissions",
      "android-storage-cleanup",
      "android-privacy-dashboard",
    ],
  },
  {
    id: "android-home-screen-launcher",
    title: "Home Screen & Launcher",
    icon: LayoutGrid,
    platform: "android",
    category: "personalization",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Your Home Screen & Launcher",
    description:
      "Home screen settings control which apps, shortcuts, and widgets appear on your Home screens, how many screens you have, and the overall grid layout. If you've installed a third-party launcher, this is also where you switch your default Home app.",
    details: [
      "Apps, shortcuts, and widgets can be added by long-pressing an empty area of the Home screen or an app icon.",
      "Multiple Home screens can be reordered by dragging their thumbnails in the overview view.",
      "The grid size (number of rows and columns) can typically be adjusted to fit more or fewer icons per screen.",
      "A different launcher app can be installed and set as default from Settings → Apps → Default apps → Home app.",
    ],
    important:
      "Switching to a new default launcher can reset your existing Home screen layout — some launchers offer a backup/restore option, but not all do.",
    redirectUrl: "https://support.google.com/android/answer/9440648?hl=en",
    afterImageContent: {
      heading: "Building Your Layout",
      paragraphs: [
        "Long-pressing an empty spot on the Home screen opens options for wallpaper, widgets, and Home settings.",
        "Favorites tray icons at the bottom of the screen stay fixed across every Home screen page.",
        "Third-party launchers can replace the entire Home screen experience, including gestures and app drawer style.",
      ],
      steps: [
        "Touch and hold an empty area of the Home screen.",
        "Tap 'Home settings' to adjust grid size, notification dots, and other layout options.",
        "Tap 'Widgets' or 'App info' from the same menu to add widgets or manage apps.",
      ],
    },
    whyItMatters:
      "The Home screen is the single most-touched surface on the phone, so its layout has an outsized effect on how quickly you can actually get things done versus hunting through an app drawer. A well-organized grid, sensibly placed widgets, and a favorites tray with only your most-used apps turn dozens of small daily frictions into near-instant actions. For anyone who prefers a different visual style or gesture set entirely, switching launchers is a fully supported way to reshape that experience without changing devices.",
    bestPractices: [
      "Keep only your most-used four or five apps in the fixed favorites tray for one-tap access from any screen.",
      "Use widgets sparingly for information you actually glance at daily, like calendar or weather, rather than filling every screen.",
      "Back up your layout (if your launcher supports it) before experimenting with a new grid size or launcher app.",
      "Group related apps into folders instead of spreading similar icons across multiple Home screens.",
    ],
    commonIssues: [
      {
        issue: "Home screen layout resets or scrambles after a software update.",
        fix: "Check if your launcher has a backup feature to restore the prior layout; otherwise, re-add widgets and shortcuts manually.",
      },
      {
        issue: "A new launcher was installed but the Home button still opens the old one.",
        fix: "Go to Settings → Apps → Default apps → Home app and select the new launcher explicitly.",
      },
      {
        issue: "Widgets keep resizing or moving unexpectedly.",
        fix: "Long-press the widget and drag its resize handles to lock in a size, then avoid dragging near screen edges where auto-repositioning can trigger.",
      },
      {
        issue: "Can't fit as many icons per row as before after a launcher change.",
        fix: "Check Home settings for a grid size option and increase the rows/columns count if your launcher supports it.",
      },
    ],
    faqs: [
      {
        q: "Can I use a completely different launcher app instead of the one that came with my phone?",
        a: "Yes, install a third-party launcher from the Play Store and set it as default under Settings → Apps → Default apps → Home app.",
      },
      {
        q: "How do I add a widget to my Home screen?",
        a: "Touch and hold an empty area of the Home screen, tap 'Widgets', then drag your chosen widget onto a screen.",
      },
      {
        q: "Will switching launchers delete any apps or data?",
        a: "No, it only changes the Home screen experience — your installed apps and their data remain untouched.",
      },
    ],
    tipsAndTricks: [
      "Use the Home screen overview (pinch in on the Home screen) to quickly reorder or delete entire screens at once.",
      "Try a folder for rarely used but occasionally needed apps instead of leaving them scattered across extra Home screens.",
    ],
    relatedSettingIds: [
      "android-wallpaper-style",
      "android-lock-screen",
      "android-apps-default-apps",
    ],
  },
  {
    id: "android-wallpaper-style",
    title: "Wallpaper & Style",
    icon: Image,
    platform: "android",
    category: "personalization",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Personalize Wallpaper & Style on Android",
    description:
      "Wallpaper & Style settings let you set separate images for your Home and lock screens, and on many devices, generate a matching system-wide color palette, icon shapes, and fonts based on your wallpaper's colors. Theme packs can bundle wallpapers, icons, and sounds together for a coordinated look.",
    details: [
      "Wallpapers can be chosen from preset collections, your own photos, or generated/animated options on supported devices.",
      "A color-matching feature can extract tones from your wallpaper and apply them across system menus and supported apps.",
      "Icon shape, color, and style can often be customized independently of the wallpaper itself.",
      "Daily wallpaper rotation can automatically cycle through a themed collection, though it isn't compatible with all personal photo options.",
    ],
    important:
      "Automatic color-matching (theming) based on wallpaper is only available on select Android versions and manufacturers — it isn't a universal feature across every device.",
    redirectUrl: "https://support.google.com/pixelphone/answer/7289143?hl=en",
    afterImageContent: {
      heading: "Building a Coordinated Look",
      paragraphs: [
        "Home and lock screen wallpapers can be set independently or matched together.",
        "Color-matching pulls a palette from your current wallpaper and applies it to system elements like Quick Settings and the clock.",
        "Theme packs bundle a wallpaper, icon pack, and sometimes sounds into one cohesive set that can be applied together.",
      ],
      steps: [
        "Touch and hold an empty area of the Home screen, then tap 'Wallpaper & style'.",
        "Choose a wallpaper from your photos or the preset collection.",
        "Select 'Home screen', 'Lock screen', or both to apply it.",
        "Adjust color palette, icon shape, and font options if your device supports them.",
      ],
    },
    whyItMatters:
      "Wallpaper and system styling are the most visible way a phone feels like yours rather than a device fresh out of the box, and modern color-matching takes that further by tying the whole interface's palette to a single image you chose. Beyond aesthetics, distinct Home and lock screen wallpapers can serve a practical purpose, like making it obvious at a glance whether the phone is unlocked. It's a low-stakes setting to experiment with, since nothing about wallpaper or theming affects app data or functionality.",
    bestPractices: [
      "Use a high-contrast or simple wallpaper on the lock screen so the time and notifications stay easy to read.",
      "Try the automatic color-matching feature (if available) after changing wallpaper for a quickly coordinated system look.",
      "Set Home and lock screen wallpapers separately if you want a visual cue for which state the phone is in.",
      "Revisit icon shape and style options after a major Android update, since new choices are sometimes added.",
    ],
    commonIssues: [
      {
        issue: "System colors didn't update after changing the wallpaper.",
        fix: "Confirm color-matching (theming) is turned on under Wallpaper & style, since it isn't always applied automatically on every device.",
      },
      {
        issue: "An animated or live wallpaper drains battery noticeably faster.",
        fix: "Switch to a static image instead, since animated wallpapers keep part of the display actively rendering even when idle.",
      },
      {
        issue: "A personal photo wallpaper looks cropped incorrectly on the lock screen.",
        fix: "Re-select the photo and adjust the crop frame manually before confirming, since lock and Home screen framing can differ.",
      },
      {
        issue: "Daily wallpaper rotation stopped working after choosing a personal photo.",
        fix: "Daily rotation typically only works with the built-in themed collections, not personal photos — reselect a supported collection to re-enable it.",
      },
    ],
    faqs: [
      {
        q: "Can I use different wallpapers for the Home screen and lock screen?",
        a: "Yes, when setting a wallpaper you can choose to apply it to Home screen, lock screen, or both independently.",
      },
      {
        q: "Does changing my wallpaper affect my phone's performance?",
        a: "A static wallpaper has no meaningful impact; an animated or live wallpaper can use slightly more battery since it keeps rendering.",
      },
      {
        q: "What does the automatic color-matching feature actually change?",
        a: "It extracts a palette from your current wallpaper and applies matching tones to system elements like Quick Settings, the clock, and some supported apps.",
      },
    ],
    tipsAndTricks: [
      "Combine a themed wallpaper with matching icon shapes for a fully coordinated look instead of adjusting each separately.",
      "Pick a simpler, lower-contrast section of a photo for the lock screen crop so the clock stays legible at a glance.",
    ],
    relatedSettingIds: [
      "android-home-screen-launcher",
      "android-display-dark-mode",
      "android-lock-screen",
    ],
  },
  {
    id: "android-lock-screen",
    title: "Lock Screen & Always-on Display",
    icon: Lock,
    platform: "android",
    category: "personalization",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Your Lock Screen & Always-on Display",
    description:
      "Lock screen settings control the clock style, shortcuts, and what information (like notifications and weather) appears before you unlock your phone. Always-on display, on supported devices, keeps a dimmed version of the clock and key notifications visible even while the screen is otherwise off.",
    details: [
      "Clock style, size, and color can often be customized separately from the rest of the lock screen.",
      "Two shortcut icons (like camera and flashlight) can usually be assigned to the bottom corners of the lock screen.",
      "Always-on display can be set to stay on continuously, activate on tap, or follow a custom schedule to save battery.",
      "Notification content shown on the lock screen can be set to full detail, summary only, or hidden entirely.",
    ],
    important:
      "Always-on display uses extra battery, even though it's optimized for low power draw — heavier schedules (always-on versus tap-to-show) will drain noticeably faster over a full day.",
    redirectUrl: "https://support.google.com/pixelphone/answer/16520562?hl=en",
    afterImageContent: {
      heading: "How Always-on Display Works on Android",
      paragraphs: [
        "Always-on display uses a dimmed, low-power version of the screen to show the time and select notification icons.",
        "Some devices support showing the wallpaper alongside the clock in Always-on display rather than a plain black background.",
        "A tap-to-show option lights up the full always-on view briefly instead of keeping it lit continuously.",
      ],
      steps: [
        "Touch and hold an empty area of the Home screen, then tap 'Lock screen' (or open Settings → Display & touch → Lock screen).",
        "Adjust clock style, shortcuts, and notification visibility.",
        "Open 'Always-on display' to choose Always on, Tap to show, or a custom schedule.",
      ],
    },
    whyItMatters:
      "The lock screen is the first thing you see dozens of times a day, so getting the right balance of useful information and privacy protection genuinely shapes how the phone feels to use. Always-on display in particular trades a small amount of battery life for the convenience of checking the time or a notification without fully waking the phone, which matters most for people who glance at their phone frequently throughout the day. Getting notification visibility right on the lock screen is also a real privacy setting, not just a cosmetic one, since it controls what a stranger could read on a phone left face-up on a table.",
    bestPractices: [
      "Hide sensitive notification content on the lock screen if the phone is ever visible to others, like at work or in shared spaces.",
      "Use 'Tap to show' for Always-on display instead of continuous mode if battery life matters more than glanceability.",
      "Assign lock screen shortcuts to your two most time-sensitive actions, like camera and flashlight.",
      "Schedule Always-on display to turn off overnight if you don't need the clock visible while sleeping.",
      "Revisit lock screen clock style after a major update, since new styles and layouts are occasionally added.",
    ],
    commonIssues: [
      {
        issue: "Always-on display drains noticeably more battery than expected.",
        fix: "Switch from 'Always on' to 'Tap to show' or a scheduled window under Settings → Display & touch → Always-on display.",
      },
      {
        issue: "Sensitive notification content is visible to anyone who picks up the phone.",
        fix: "Set lock screen notifications to 'Hide sensitive content' or 'Don't show notifications' under Lock screen settings.",
      },
      {
        issue: "Lock screen shortcuts open the wrong apps.",
        fix: "Reassign both shortcut icons from the Lock screen customization menu to your preferred apps.",
      },
      {
        issue: "Always-on display isn't available at all on the device.",
        fix: "Confirm the device's display technology actually supports it (typically OLED/AMOLED panels only); LCD-based phones generally don't offer this feature.",
      },
    ],
    faqs: [
      {
        q: "Does Always-on display significantly reduce battery life?",
        a: "It uses more power than a fully off screen, though it's optimized to be low-impact; 'Tap to show' or a scheduled window reduces the effect further.",
      },
      {
        q: "Can I stop notification content from showing on the lock screen?",
        a: "Yes, set lock screen notification visibility to hide sensitive content or turn off lock screen notifications entirely.",
      },
      {
        q: "Can I change which two apps appear as lock screen shortcuts?",
        a: "Yes, open Lock screen customization and reassign each corner shortcut to a different app, like camera or flashlight.",
      },
    ],
    tipsAndTricks: [
      "Match your Always-on display's wallpaper option with your regular wallpaper for a more integrated always-on look on supported devices.",
      "Set a scheduled Always-on display window (like waking hours only) as a middle ground between full battery savings and constant glanceability.",
    ],
    relatedSettingIds: [
      "android-wallpaper-style",
      "android-home-screen-launcher",
      "android-display-dark-mode",
    ],
  },
  {
    id: "android-security-screen-lock",
    title: "Security & Screen Lock",
    icon: KeyRound,
    platform: "android",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Screen Lock & Device Security on Android",
    description:
      "Screen lock is the first line of defense for everything on your phone, letting you choose a PIN, pattern, password, or biometric unlock like a fingerprint or face. It also determines whether your device's backups and stored data are encrypted, since Android ties encryption strength to having a real screen lock set.",
    details: [
      "PIN, pattern, and password locks each offer different strength and convenience trade-offs, with a longer PIN or password generally considered stronger than a pattern.",
      "Fingerprint and face unlock are layered on top of a PIN, pattern, or password, which still works as a backup if biometrics fail.",
      "Smart Lock can keep the device unlocked automatically in trusted situations, like at home or connected to a trusted Bluetooth device.",
      "A stronger screen lock is required before certain sensitive features, like tap-to-pay or app-locking tools, can be used.",
    ],
    important:
      "Removing your screen lock entirely also disables the encryption tied to it, leaving locally stored data far more exposed if the phone is lost or stolen.",
    redirectUrl: "https://support.google.com/android/answer/9079129?hl=en",
    afterImageContent: {
      heading: "How Screen Lock Works on Android",
      paragraphs: [
        "Android layers biometric options like fingerprint or face unlock on top of a required PIN, pattern, or password as the ultimate fallback.",
        "Screen lock strength also affects backup encryption and which sensitive features, like tap-to-pay, are available on the device.",
        "Smart Lock can relax the lock screen automatically in specific trusted conditions, but always with a manual override available.",
      ],
      steps: [
        "Open Settings → Security (or Security & privacy).",
        "Tap 'Screen lock' and choose PIN, pattern, or password.",
        "Follow the prompts to confirm your chosen lock.",
        "Optionally add fingerprint or face unlock from the same menu.",
      ],
    },
    whyItMatters:
      "Screen lock is the single setting standing between anyone who picks up your phone and every account, message, and photo on it, making it one of the most consequential choices you make on a new device. It also underpins device encryption, so a weak or absent lock doesn't just risk casual snooping — it can leave locally stored data much easier to extract if the phone is lost. Biometric unlock adds convenience without removing that underlying protection, since a PIN, pattern, or password is always required as a fallback.",
    bestPractices: [
      "Choose a 6+ digit PIN or a genuine password over a simple pattern, since patterns are the easiest lock type to guess by watching smudges on the screen.",
      "Set up fingerprint or face unlock for daily convenience, but keep the underlying PIN or password strong since it remains the fallback.",
      "Avoid reusing a PIN you use elsewhere, like a bank card, in case one is ever observed.",
      "Use Smart Lock's trusted-place or trusted-device options sparingly, since they intentionally weaken the lock screen in those conditions.",
      "Re-check your screen lock setting after any major Android update, since new biometric or security options are added periodically.",
    ],
    commonIssues: [
      {
        issue: "Fingerprint unlock stops recognizing a finger reliably.",
        fix: "Remove and re-enroll the fingerprint under Settings → Security → Fingerprint unlock, keeping the sensor and finger clean during setup.",
      },
      {
        issue: "Forgot the screen lock PIN, pattern, or password entirely.",
        fix: "Use the device's account recovery flow at the lock screen after enough failed attempts, or perform a factory reset as a last resort if no recovery option is available.",
      },
      {
        issue: "Face unlock works even when eyes are closed, raising a security concern.",
        fix: "Check for and enable an 'Require eyes open' or attention-check option under face unlock settings if the device supports it.",
      },
      {
        issue: "Smart Lock keeps the phone unlocked somewhere it shouldn't.",
        fix: "Review and remove that trusted place or device under Settings → Security → Smart Lock rather than disabling screen lock features entirely.",
      },
    ],
    faqs: [
      {
        q: "Is fingerprint unlock safer than a PIN?",
        a: "Fingerprint unlock is convenient and hard to replicate, but a PIN or password is still required as a fallback, so overall security depends on both being strong.",
      },
      {
        q: "Does removing my screen lock affect anything besides convenience?",
        a: "Yes, it also disables the encryption protections tied to having a lock set, making locally stored data considerably less protected.",
      },
      {
        q: "What happens if I fail to unlock my phone too many times?",
        a: "Android temporarily locks out further attempts and may prompt for your Google Account credentials or additional verification before allowing another try.",
      },
    ],
    tipsAndTricks: [
      "Set up multiple biometric options (like both a face and a fingerprint) where supported, so a hand injury or bad lighting doesn't leave you stuck typing a PIN.",
      "Use lock screen shortcuts and Smart Lock deliberately at home to reduce daily unlock friction without weakening security everywhere else.",
    ],
    relatedSettingIds: [
      "android-lock-screen",
      "android-privacy-dashboard",
      "android-factory-reset",
    ],
    updateFrequency:
      "Review after any failed unlock attempt pattern, new biometric enrollment, or major Android security update.",
  },
  {
    id: "android-location",
    title: "Location",
    icon: MapPin,
    platform: "android",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Location Access on Android",
    description:
      "Location settings control the master switch for GPS and location-based features, plus how accurately your device estimates its position using Wi-Fi and Bluetooth scanning. Turning location off device-wide overrides any individual app's permission, cutting off maps, weather, and other location-aware features at once.",
    details: [
      "The main Location toggle acts as a device-wide switch that overrides individual app permissions when turned off.",
      "Location Accuracy can use Wi-Fi and Bluetooth scanning even while those radios are otherwise off, improving indoor and urban positioning.",
      "A recent location indicator (usually a small icon in the status bar) shows when an app has just used your location.",
      "Location history and timeline features are managed separately from the core Location toggle, often through your Google Account.",
    ],
    important:
      "Turning off Wi-Fi and Bluetooth scanning for location accuracy can noticeably reduce indoor positioning quality, even with the main Location toggle still on.",
    redirectUrl: "https://support.google.com/android/answer/3467281?hl=en",
    afterImageContent: {
      heading: "How Location Works on Android",
      paragraphs: [
        "The device-wide Location toggle is the master switch; when it's off, no app can access your location regardless of its individual permission.",
        "Location Accuracy blends GPS with Wi-Fi and Bluetooth scanning to improve positioning, particularly indoors where GPS signal is weak.",
        "Per-app location permissions, covered separately under App permissions, still apply whenever the master Location toggle is on.",
      ],
      steps: [
        "Open Settings → Location.",
        "Toggle 'Use location' on or off as the device-wide switch.",
        "Tap 'Location Services' to adjust Wi-Fi/Bluetooth scanning and accuracy options.",
        "Review 'App location permissions' to fine-tune individual apps.",
      ],
    },
    whyItMatters:
      "Location is one of the most sensitive pieces of data a phone generates, capable of revealing where you live, work, and travel with far more precision than most people realize. Because the device-wide toggle overrides every individual app permission, it's also the fastest single switch to cut off location tracking entirely when you don't need it, like during travel or in a sensitive setting. Understanding the difference between the master toggle and per-app permissions prevents the common mistake of assuming one app's setting protects you everywhere.",
    bestPractices: [
      "Turn off the device-wide Location toggle entirely when you know you won't need maps, weather, or location-aware apps for a while.",
      "Keep Wi-Fi and Bluetooth scanning on for accuracy if you rely heavily on indoor navigation or find-my-device features.",
      "Review which apps have 'Always' location access periodically, since most only need it while actively in use.",
      "Check your Google Account's separate Location History or Timeline settings if you're concerned about long-term location logging, since it's independent of the device toggle.",
      "Turn location back on temporarily rather than leaving it off permanently if it's breaking navigation or weather accuracy.",
    ],
    commonIssues: [
      {
        issue: "Maps or navigation apps can't find your position at all.",
        fix: "Confirm the device-wide Location toggle is on first, since it overrides any individual app's own location permission.",
      },
      {
        issue: "Location accuracy is poor indoors or in dense urban areas despite GPS being on.",
        fix: "Turn on Wi-Fi and Bluetooth scanning for location under Settings → Location → Location Services to supplement weak GPS signal.",
      },
      {
        issue: "Battery drains faster than expected with several location-heavy apps installed.",
        fix: "Switch high-drain apps from 'Always' to 'Only while using the app' location access instead of disabling location device-wide.",
      },
      {
        issue: "A location icon keeps appearing in the status bar unexpectedly.",
        fix: "Check the Privacy Dashboard's location timeline to identify which app is requesting it, then adjust that app's permission if it's unwarranted.",
      },
    ],
    faqs: [
      {
        q: "Does turning off Location stop every app from accessing my position?",
        a: "Yes, the device-wide toggle overrides all individual app permissions, so nothing can access location while it's off.",
      },
      {
        q: "Why does my phone ask to use Wi-Fi networks for location even with Wi-Fi turned off?",
        a: "Location Accuracy can briefly scan for nearby Wi-Fi networks to improve positioning without actually connecting to the internet through them.",
      },
      {
        q: "Is my location history the same as the Location toggle?",
        a: "No, Location History or Timeline is a separate Google Account setting that logs places over time, independent of the device's real-time Location toggle.",
      },
    ],
    tipsAndTricks: [
      "Add a Location Quick Settings tile for a one-swipe way to toggle it device-wide without opening the full Settings app.",
      "Check the per-permission camera/microphone/location view in the Privacy Dashboard to see every app with location access in one place.",
    ],
    relatedSettingIds: [
      "android-app-permissions",
      "android-privacy-dashboard",
      "android-wifi",
    ],
  },
  {
    id: "android-nfc-payments",
    title: "NFC & Tap to Pay",
    icon: Nfc,
    platform: "android",
    category: "connectivity-network",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up NFC & Tap to Pay on Android",
    description:
      "NFC (Near Field Communication) is the short-range radio that lets your phone exchange data with a nearby reader, most commonly used for contactless payments through Google Wallet at supported terminals. It's also used for pairing some accessories and reading NFC tags, but payments are its most common everyday use.",
    details: [
      "NFC must be turned on, and a payment method plus a screen lock must be set up in Google Wallet before tap to pay works.",
      "Look for a contactless or Google Pay symbol at the terminal to confirm it accepts NFC payments.",
      "Holding the phone's back (where the NFC antenna sits) near the reader, rather than the screen, usually gives the most reliable read.",
      "A card, ring, or animation on screen along with a short vibration or sound typically confirms a successful contactless transaction.",
    ],
    important:
      "Contactless payments require an active screen lock — tap to pay won't function on a device with security set to 'None' or 'Swipe'.",
    redirectUrl: "https://support.google.com/wallet/answer/12060043?hl=en",
    afterImageContent: {
      heading: "How Tap to Pay Works on Android",
      paragraphs: [
        "NFC uses a very short-range radio signal, so the back of the phone needs to be close to the reader, usually within a couple of centimeters.",
        "Google Wallet acts as the default app that handles contactless payment requests once NFC detects a compatible terminal.",
        "A successful payment is usually confirmed on-screen almost instantly, without needing to open any app manually beforehand.",
      ],
      steps: [
        "Open Settings → Connected devices → Connection preferences → NFC, and turn it on.",
        "Open Google Wallet and add a card or payment method if you haven't already.",
        "Confirm a screen lock is set, since it's required for contactless payments.",
        "Hold the back of your unlocked phone near a contactless terminal to pay.",
      ],
    },
    whyItMatters:
      "Tap to pay has become one of the fastest and most common ways to check out in stores, and NFC is the underlying technology that makes it possible without ever opening a separate app. Because it requires both a screen lock and NFC to be active, understanding this setting is often the difference between a payment working instantly and a confusing failed tap at the register. NFC's short range is also a deliberate security feature, making it far harder for a payment to be intercepted from any meaningful distance compared to older wireless payment methods.",
    bestPractices: [
      "Keep NFC turned on if you regularly use tap to pay, since toggling it off between uses adds friction for minimal benefit.",
      "Set a PIN, pattern, or password screen lock, since contactless payments won't work with a weaker or absent lock.",
      "Remove a phone case with a thick metal plate or battery pack if taps are consistently failing to register.",
      "Set your preferred card as the default payment method in Google Wallet to avoid an extra selection step at checkout.",
    ],
    commonIssues: [
      {
        issue: "Tap to pay doesn't work even though NFC appears to be on.",
        fix: "Confirm a screen lock is actually set, since contactless payments are blocked entirely without one, and check that Google Wallet has a valid payment method added.",
      },
      {
        issue: "The reader doesn't detect the phone even when held close.",
        fix: "Move the back of the phone slowly across the reader, since NFC antenna placement varies by model, and remove any thick case that might be blocking the signal.",
      },
      {
        issue: "A payment is declined despite showing a valid card in Google Wallet.",
        fix: "Check with your card issuer for a hold or block, and confirm the card hasn't expired or been flagged for suspicious activity.",
      },
      {
        issue: "NFC keeps turning itself off after a restart.",
        fix: "Re-enable it under Settings → Connected devices → Connection preferences → NFC, since some devices don't preserve the setting through certain updates.",
      },
    ],
    faqs: [
      {
        q: "Do I need to open Google Wallet before tapping to pay?",
        a: "No, as long as NFC is on and a screen lock is set, simply holding the unlocked phone near the reader triggers the payment.",
      },
      {
        q: "Can NFC be used for anything besides payments?",
        a: "Yes, it's also used for pairing some Bluetooth accessories and reading NFC tags, though contactless payment is its most common everyday use.",
      },
      {
        q: "Is tap to pay safe if my phone is lost?",
        a: "It requires an active screen lock to function at all, so a lost phone without an unlocked screen can't be used to make a contactless payment.",
      },
    ],
    tipsAndTricks: [
      "Add an NFC Quick Settings tile so you can toggle it instantly instead of digging through Connected devices settings.",
      "Set a default card in Google Wallet ahead of time so checkout is a single tap with no extra app-switching at the register.",
    ],
    relatedSettingIds: [
      "android-security-screen-lock",
      "android-app-permissions",
      "android-privacy-dashboard",
    ],
  },
  {
    id: "android-hotspot-tethering",
    title: "Hotspot & Tethering",
    icon: Router,
    platform: "android",
    category: "connectivity-network",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Share Your Connection with Hotspot & Tethering",
    description:
      "Hotspot and tethering let you share your phone's mobile data connection with other devices over Wi-Fi, Bluetooth, or a USB cable. This is useful for getting a laptop online while traveling, or letting a friend's device briefly borrow your connection.",
    details: [
      "A Wi-Fi hotspot can typically connect up to 10 devices at once, depending on the phone.",
      "Bluetooth tethering uses less battery than a Wi-Fi hotspot but offers slower speeds, making it better for light, occasional use.",
      "USB tethering charges the connected device while sharing data, and works even where Wi-Fi hotspot might be restricted.",
      "Hotspot network name and password can be customized, and QR code sharing is often available just like with regular Wi-Fi.",
    ],
    important:
      "Some mobile carriers limit tethering speeds or charge extra for it separately from your regular data plan — check your plan before relying on it heavily.",
    redirectUrl: "https://support.google.com/android/answer/9059108?hl=en",
    afterImageContent: {
      heading: "How Hotspot & Tethering Work on Android",
      paragraphs: [
        "Wi-Fi hotspot turns your phone into a small wireless router, sharing its mobile data connection with nearby devices.",
        "Bluetooth and USB tethering offer alternatives that trade some speed for lower battery use or a wired, more stable connection.",
        "Connected device count, data used, and hotspot security settings can all be reviewed from the same screen.",
      ],
      steps: [
        "Open Settings → Network & internet → Hotspot & tethering.",
        "Tap 'Wi-Fi hotspot' and turn it on, or choose Bluetooth or USB tethering instead.",
        "Set or confirm the hotspot's network name and password.",
        "Connect the other device using that Wi-Fi network, Bluetooth pairing, or a USB cable.",
      ],
    },
    whyItMatters:
      "Hotspot and tethering turn a single mobile data plan into a portable internet connection for every device you carry, which matters most while traveling or during a home internet outage. Choosing the right method also matters practically — Wi-Fi hotspot is fastest but drains battery quickly, while Bluetooth tethering sips power for light browsing, and USB tethering charges the connected device while it works. Because tethered data usually counts against the same data plan (and sometimes a separate cap), understanding this setting also helps avoid surprise overage charges.",
    bestPractices: [
      "Use USB tethering when possible for a laptop, since it's both fast and charges the connected device at the same time.",
      "Choose Bluetooth tethering for light tasks like email on a tablet, since it uses far less battery than a full Wi-Fi hotspot.",
      "Set a strong hotspot password and change the default name if you'll be using it somewhere public, like a coffee shop or airport.",
      "Check your carrier's tethering allowance before a trip, since some plans cap or throttle tethered data separately from regular use.",
      "Turn the hotspot off when not actively sharing, since it continues drawing battery while broadcasting even with no devices connected.",
    ],
    commonIssues: [
      {
        issue: "Connected devices report a much slower speed than the phone's own connection.",
        fix: "Check for carrier-side tethering throttling, and try switching from Bluetooth tethering to Wi-Fi hotspot for a faster connection.",
      },
      {
        issue: "Hotspot turns off automatically after a short period.",
        fix: "Check Settings → Network & internet → Hotspot & tethering for an auto-off timer and extend or disable it if constant availability is needed.",
      },
      {
        issue: "A laptop won't recognize the phone over USB tethering.",
        fix: "Confirm USB tethering (not just charging) is selected in the USB connection options, and try a different cable if the connection isn't detected.",
      },
      {
        issue: "Mobile data usage spikes unexpectedly after using the hotspot.",
        fix: "Check the per-connection data usage under Hotspot & tethering settings, since streaming or large downloads on a tethered device count fully against your plan.",
      },
    ],
    faqs: [
      {
        q: "Does tethering use more data than using the internet directly on my phone?",
        a: "No, the data used is the same regardless of which device it's ultimately for, but it all still counts against your plan's data allowance.",
      },
      {
        q: "Which tethering method uses the least battery?",
        a: "Bluetooth tethering is the most battery-efficient, though it's noticeably slower than Wi-Fi hotspot or USB tethering.",
      },
      {
        q: "Can I use hotspot and stay connected to my own Wi-Fi at the same time?",
        a: "On many devices yes, using a feature sometimes called 'Wi-Fi hotspot with Wi-Fi', though it depends on your phone's chipset and Android version.",
      },
    ],
    tipsAndTricks: [
      "Share the hotspot password via QR code instead of typing it out, the same way you would for a regular Wi-Fi network.",
      "Rename the hotspot to something recognizable if you regularly connect multiple devices, so you can tell it apart from other nearby networks.",
    ],
    relatedSettingIds: ["android-wifi", "android-data-usage", "android-battery"],
  },
  {
    id: "android-vpn",
    title: "VPN",
    icon: Shield,
    platform: "android",
    category: "connectivity-network",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Connect to a VPN on Android",
    description:
      "VPN settings let you add, connect to, and manage virtual private networks that route your device's traffic through an encrypted tunnel, commonly used for work access or added privacy on untrusted networks. Android also supports an 'always-on VPN' mode that blocks other network traffic until the VPN connects.",
    details: [
      "VPN profiles can be added manually or, in a work context, pushed automatically by an organization's IT admin.",
      "Always-on VPN prevents any network traffic from flowing outside the VPN tunnel, closing a gap some VPN apps otherwise leave open.",
      "A persistent key icon or notification typically indicates an active VPN connection.",
      "Some devices offer a built-in, carrier-independent VPN option in addition to third-party VPN apps.",
    ],
    important:
      "A VPN encrypts and reroutes your traffic, but a low-quality or untrustworthy VPN provider can see everything passing through it — choose a reputable provider deliberately.",
    redirectUrl: "https://support.google.com/android/answer/9089766?hl=en",
    afterImageContent: {
      heading: "How VPN Works on Android",
      paragraphs: [
        "Once connected, a VPN routes your device's traffic through an encrypted tunnel to the VPN provider's server before it reaches the wider internet.",
        "Always-on VPN adds a stricter guarantee, blocking network access entirely if the VPN connection ever drops.",
        "Work profiles can have their own separate VPN configuration, distinct from whatever VPN is used for personal traffic.",
      ],
      steps: [
        "Open Settings → Network & internet → VPN.",
        "Tap the '+' icon to add a new VPN profile, or select an installed VPN app.",
        "Enter the required server and authentication details, then tap 'Save'.",
        "Tap the saved VPN entry and toggle it on to connect.",
      ],
    },
    whyItMatters:
      "A VPN is one of the most effective ways to protect your traffic on networks you don't fully trust, like public Wi-Fi at a cafe or airport, by wrapping everything in an encrypted tunnel before it leaves the device. For many people, it's also a work requirement, since organizations commonly require a VPN connection to reach internal systems securely from outside the office. Always-on VPN matters especially for anyone relying on it for genuine privacy or security, since without it, a brief VPN disconnect can silently expose regular unencrypted traffic instead of just blocking the connection.",
    bestPractices: [
      "Choose a reputable, well-reviewed VPN provider, since a VPN shifts trust from your network to that provider rather than eliminating it.",
      "Turn on always-on VPN if privacy or corporate policy genuinely depends on the connection never silently dropping out.",
      "Confirm with your IT admin which VPN profile and settings are required before configuring a work VPN manually.",
      "Check for the VPN key icon in the status bar to confirm the connection is actually active before doing anything sensitive.",
    ],
    commonIssues: [
      {
        issue: "VPN connects but internet access stops working entirely.",
        fix: "Check the VPN profile's DNS and routing settings, or contact the VPN provider, since a misconfigured profile can block traffic instead of just rerouting it.",
      },
      {
        issue: "VPN disconnects randomly throughout the day.",
        fix: "Exempt the VPN app from aggressive battery optimization, since background restrictions can silently kill its connection.",
      },
      {
        issue: "A work VPN profile won't save or connect.",
        fix: "Double check server address, authentication type, and credentials with your organization's IT admin, since a single mismatched field will fail silently.",
      },
      {
        issue: "Always-on VPN blocks all internet access when the VPN server is unreachable.",
        fix: "This is expected behavior by design; temporarily disable always-on VPN if you need general internet access while troubleshooting the VPN server itself.",
      },
    ],
    faqs: [
      {
        q: "Does a VPN make me completely anonymous online?",
        a: "No, it hides your traffic from your local network and ISP, but the VPN provider itself can potentially see your activity, so provider trust still matters.",
      },
      {
        q: "What's the difference between a regular VPN connection and always-on VPN?",
        a: "A regular VPN connection can silently drop and fall back to normal internet access; always-on VPN blocks all traffic instead of allowing an unprotected fallback.",
      },
      {
        q: "Can I use a personal VPN and a work VPN at the same time?",
        a: "Typically only one VPN can be active at a time on the main profile, though a separate work profile can maintain its own independent VPN connection.",
      },
    ],
    tipsAndTricks: [
      "Watch for the small key-shaped icon in the status bar as a quick visual confirmation that your VPN is currently connected.",
      "Test a new VPN profile on a trusted network first before relying on it somewhere sensitive, like unfamiliar public Wi-Fi.",
    ],
    relatedSettingIds: [
      "android-wifi",
      "android-privacy-dashboard",
      "android-security-screen-lock",
    ],
  },
  {
    id: "android-data-usage",
    title: "Data Usage / Network & Internet",
    icon: Signal,
    platform: "android",
    category: "connectivity-network",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Monitor & Manage Data Usage on Android",
    description:
      "Network & internet settings show a breakdown of mobile data and Wi-Fi usage per app, and let you set a data warning or hard limit to avoid unexpectedly exceeding your plan. Individual apps can also be restricted from using background data to further control consumption.",
    details: [
      "Data usage can be reviewed for a custom billing cycle date range, not just the calendar month.",
      "A data warning sends a notification at a chosen threshold, while a data limit can automatically disable mobile data once reached.",
      "Background data can be turned off per app, stopping updates and syncing while that app isn't actively open.",
      "Wi-Fi networks can be marked as metered, applying the same data-saving restrictions used for mobile data.",
    ],
    important:
      "The data usage shown on your device is an estimate and may differ slightly from your carrier's official billing measurement — check with your carrier for exact figures near a plan's limit.",
    redirectUrl: "https://support.google.com/pixelphone/answer/2819524?hl=en",
    afterImageContent: {
      heading: "How Data Usage Tracking Works on Android",
      paragraphs: [
        "Android tracks mobile and Wi-Fi data separately, and breaks each down further by individual app.",
        "A data warning and a stricter data limit can be set independently, letting you get notified before usage is actually cut off.",
        "Marking a Wi-Fi network as metered treats it like mobile data for the purposes of background restrictions and warnings.",
      ],
      steps: [
        "Open Settings → Network & internet → SIMs (or Data usage).",
        "Review the usage graph and set your billing cycle date.",
        "Tap 'Data warning & limit' to set a threshold and optional automatic cutoff.",
        "Tap an individual app to restrict its background data if needed.",
      ],
    },
    whyItMatters:
      "Unexpected overage charges or a mid-month data cutoff are frustrating and entirely avoidable once you know where your data is actually going. The per-app breakdown turns a vague sense of 'my data disappears fast' into an actionable fix, like restricting one background-heavy app instead of blaming the whole plan. Setting a data warning and limit also builds in a safety net, so a busy month or an app misbehaving in the background doesn't quietly blow past your plan before you notice.",
    bestPractices: [
      "Set both a data warning and a hard data limit slightly below your actual plan cap, giving yourself a buffer before overage charges apply.",
      "Check the per-app breakdown monthly to catch a newly installed app quietly consuming more data than expected.",
      "Restrict background data for apps you only use occasionally, rather than leaving every app free to sync at all times.",
      "Mark unfamiliar or metered Wi-Fi networks (like a mobile hotspot) as metered so background restrictions apply there too.",
      "Adjust your tracked billing cycle date to match your actual carrier billing date for an accurate month-to-date view.",
    ],
    commonIssues: [
      {
        issue: "Reported data usage on the phone doesn't match the carrier's bill.",
        fix: "Treat the on-device figure as an estimate, and check with your carrier directly if you're close to a plan limit rather than relying solely on the phone's count.",
      },
      {
        issue: "One app is responsible for a large, unexplained share of data usage.",
        fix: "Tap into that app's entry under Data usage, restrict its background data, and check whether an in-app setting (like auto-play video) is driving the usage.",
      },
      {
        issue: "Data limit cuts off mobile data earlier in the month than expected.",
        fix: "Review the configured limit and billing cycle start date under Data warning & limit, since a misconfigured cycle date can trigger the cutoff prematurely.",
      },
      {
        issue: "Apps stop syncing in the background after marking a Wi-Fi network as metered.",
        fix: "This is expected, since metered Wi-Fi applies the same background data restrictions as mobile data; unmark the network if that behavior isn't wanted.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between a data warning and a data limit?",
        a: "A data warning only sends a notification at a chosen threshold, while a data limit can automatically turn off mobile data once that threshold is reached.",
      },
      {
        q: "Does restricting background data break notifications for that app?",
        a: "It can delay them, since the app can't refresh data until actively opened, so restrict background data selectively rather than for apps needing real-time alerts.",
      },
      {
        q: "Can I track Wi-Fi data usage the same way as mobile data?",
        a: "Yes, Android tracks Wi-Fi usage separately per app, and you can mark specific Wi-Fi networks as metered to apply the same controls used for mobile data.",
      },
    ],
    tipsAndTricks: [
      "Set your tracked billing cycle date to match your carrier's actual billing date for a month-to-date view that lines up with your bill.",
      "Check the data usage screen right after a trip or heavy streaming weekend to catch any surprises before the billing cycle closes.",
    ],
    relatedSettingIds: [
      "android-wifi",
      "android-hotspot-tethering",
      "android-battery",
    ],
  },
  {
    id: "android-language-input",
    title: "Languages & Input / Keyboard",
    icon: Keyboard,
    platform: "android",
    category: "accessibility-language",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Languages, Input & Keyboard on Android",
    description:
      "Languages & input settings control your device's system language, additional keyboard languages, and features like autocorrect, voice typing, and text-to-speech. You can add multiple keyboard languages and switch between them without changing your phone's overall display language.",
    details: [
      "Additional keyboard languages can be added independently of the device's main system language.",
      "Autocorrect, next-word prediction, and glide typing can each be toggled individually within keyboard settings.",
      "Voice typing lets you dictate text directly into most text fields as an alternative to typing.",
      "A physical keyboard, when connected, has its own separate layout setting distinct from the on-screen keyboard.",
    ],
    important:
      "Voice typing and dictation support and accuracy vary significantly by language — a language that works flawlessly for typing may have much weaker voice recognition.",
    redirectUrl: "https://support.google.com/gboard/answer/7068494?hl=en",
    afterImageContent: {
      heading: "How Language & Input Settings Work on Android",
      paragraphs: [
        "The device's system language controls menus and app text, while keyboard languages control what you can type in, and the two can differ.",
        "Multiple keyboard languages can be added at once, then switched between using a spacebar gesture or a dedicated language key.",
        "Voice typing and text-to-speech each have their own language and voice options, separate from the keyboard's typing languages.",
      ],
      steps: [
        "Open Settings → System → Languages & input.",
        "Tap 'On-screen keyboard' → your keyboard app → 'Languages' to add or remove typing languages.",
        "Adjust autocorrect, prediction, and voice typing preferences from the same keyboard settings menu.",
        "Switch between installed languages while typing by holding the spacebar or tapping the language key.",
      ],
    },
    whyItMatters:
      "Typing is one of the most repeated actions on any phone, so a well-configured keyboard with the right languages and prediction settings meaningfully speeds up daily texting, emailing, and searching. For multilingual users especially, being able to add and quickly switch between keyboard languages avoids the frustration of constant autocorrect fights in the wrong language. These settings are also foundational for accessibility, since voice typing and text-to-speech depend on them working correctly for anyone who relies on dictation instead of typing.",
    bestPractices: [
      "Add every language you regularly type in up front, rather than switching your whole system language back and forth.",
      "Turn off autocorrect for languages where it consistently guesses wrong, rather than fighting it every message.",
      "Use the spacebar-hold gesture or language key to switch quickly instead of navigating back into Settings each time.",
      "Test voice typing in each of your added languages, since accuracy can vary noticeably between them.",
    ],
    commonIssues: [
      {
        issue: "Autocorrect keeps changing words into the wrong language.",
        fix: "Remove unused keyboard languages, or manually switch to the correct one before typing in a specific language.",
      },
      {
        issue: "A newly added keyboard language doesn't appear as an option while typing.",
        fix: "Confirm it was added under the specific keyboard app's own language settings, not just the device's general system language.",
      },
      {
        issue: "Voice typing produces garbled or inaccurate results.",
        fix: "Check that the correct dictation language is selected, and try in a quieter environment, since accuracy varies more by language than most people expect.",
      },
      {
        issue: "Switching keyboard languages via spacebar gesture doesn't work.",
        fix: "Confirm the language switch key or gesture is enabled under the keyboard app's settings, since it isn't always on by default.",
      },
    ],
    faqs: [
      {
        q: "Can I type in a different language without changing my phone's overall display language?",
        a: "Yes, add the language under your keyboard app's own language settings, which is entirely separate from the device's system display language.",
      },
      {
        q: "Why does autocorrect keep suggesting the wrong words?",
        a: "This often happens when too many keyboard languages are enabled at once, causing predictions to blend between them; removing unused languages usually helps.",
      },
      {
        q: "Does voice typing work offline?",
        a: "Some languages support offline voice typing after downloading a language pack, though online dictation is generally more accurate.",
      },
    ],
    tipsAndTricks: [
      "Download an offline voice typing language pack before traveling somewhere with unreliable data coverage.",
      "Enable the dedicated language-switch key on the keyboard for a faster one-tap swap between languages instead of the spacebar-hold gesture.",
    ],
    relatedSettingIds: [
      "android-accessibility",
      "android-google-account-sync",
      "android-date-time",
    ],
  },
  {
    id: "android-date-time",
    title: "Date & Time",
    icon: Clock,
    platform: "android",
    category: "system-info",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Date, Time & Time Zone on Android",
    description:
      "Date & time settings control whether your device sets the clock and time zone automatically from the network or your location, or lets you set them manually. Getting this right keeps alarms, calendar events, and timestamped messages accurate, especially while traveling across time zones.",
    details: [
      "Automatic time zone can be set using your device's location rather than relying solely on the mobile network.",
      "24-hour or 12-hour clock format can be toggled independently of the automatic time and date settings.",
      "Manual time and date entry is available for devices without a SIM or reliable network signal.",
      "World clock entries can be added for other cities alongside your device's local time.",
    ],
    important:
      "Turning off automatic time zone while traveling can cause alarms, calendar reminders, and message timestamps to silently drift out of sync with your actual location.",
    redirectUrl: "https://support.google.com/android/answer/2841106?hl=en",
    afterImageContent: {
      heading: "How Date & Time Settings Work on Android",
      paragraphs: [
        "Automatic date, time, and time zone rely on network or location data to keep the clock accurate without manual input.",
        "Location-based time zone detection tends to be more reliable while traveling than network-based detection alone.",
        "Manual settings remain available as a fallback for devices without consistent network access, like a Wi-Fi-only tablet.",
      ],
      steps: [
        "Open Settings → System → Date & time.",
        "Turn on 'Set time automatically' and 'Set time zone automatically'.",
        "Choose location-based time zone detection if traveling frequently.",
        "Adjust the clock format (12-hour or 24-hour) as preferred.",
      ],
    },
    whyItMatters:
      "Accurate date and time might seem trivial, but it quietly underpins alarms going off at the right moment, calendar invites showing correct meeting times, and message timestamps making sense across a conversation. Time zone handling in particular becomes a real problem while traveling, since a phone stuck on the wrong zone can cause someone to miss a flight or an appointment entirely. Location-based automatic time zone detection is generally more reliable than network-based detection, especially in border regions or right after landing, and knowing that distinction helps you pick the more dependable setting.",
    bestPractices: [
      "Use location-based automatic time zone detection instead of network-based if you travel internationally with any regularity.",
      "Double check the clock immediately after landing in a new time zone rather than assuming it updated instantly.",
      "Add world clock entries for frequently contacted time zones instead of doing the math manually before calling someone.",
      "Only switch to manual date and time as a temporary fix, and turn automatic settings back on once network or location access is restored.",
    ],
    commonIssues: [
      {
        issue: "Clock doesn't update to the new time zone after traveling.",
        fix: "Switch time zone detection from network-based to location-based under Settings → System → Date & time, since network detection can lag near borders.",
      },
      {
        issue: "Alarms go off an hour early or late after a time zone change.",
        fix: "Confirm the device's time zone actually updated correctly first, then check whether the individual alarm was set with a fixed time zone rather than 'follow device'.",
      },
      {
        issue: "Manually set time keeps reverting back to automatic.",
        fix: "This happens if 'Set time automatically' is still toggled on; turn it off explicitly if manual entry needs to persist.",
      },
      {
        issue: "Calendar events show at the wrong time after switching time zones.",
        fix: "Check the calendar app's own time zone setting, since some apps cache the original event time zone separately from the device clock.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between network-based and location-based time zone detection?",
        a: "Network-based relies on your mobile carrier's signal, while location-based uses GPS or other location data, which tends to update faster and more accurately while traveling.",
      },
      {
        q: "Can I set the time manually if I don't have a SIM card?",
        a: "Yes, turn off 'Set time automatically' under Date & time settings and enter the date, time, and time zone manually.",
      },
      {
        q: "Does changing the clock format affect alarms or calendar times?",
        a: "No, switching between 12-hour and 24-hour format only changes how times are displayed, not the underlying scheduled times themselves.",
      },
    ],
    tipsAndTricks: [
      "Add a world clock for any time zone you coordinate with regularly, like a remote coworker or family abroad, right from the Clock app.",
      "Switch to location-based time zone detection before a trip rather than after landing, so it's ready to update the moment you arrive.",
    ],
    relatedSettingIds: [
      "android-language-input",
      "android-system-update",
      "android-do-not-disturb",
    ],
  },
  {
    id: "android-digital-wellbeing",
    title: "Digital Wellbeing & Parental Controls",
    icon: Hourglass,
    platform: "android",
    category: "accounts-sync-family",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Track Screen Time & Set Parental Controls on Android",
    description:
      "Digital Wellbeing shows exactly how much time you spend on your phone and in each app, with tools like app timers, Focus mode, and Bedtime mode to help rebalance that. The same dashboard connects to Family Link, letting a parent set screen time limits, app approval, and content filters on a child's supervised device.",
    details: [
      "The dashboard breaks down daily and weekly screen time by app, with a running total right on the home screen widget if added.",
      "App timers pause a specific app for the rest of the day once its daily limit is reached, greying out its icon.",
      "Focus mode pauses distracting apps you choose, silencing their notifications until you turn it off or its schedule ends.",
      "Family Link extends these same tools to a child's account, adding daily screen time limits, app approval requests, and downtime schedules.",
    ],
    important:
      "Parental controls through Family Link only work once a child's account is actually set up as supervised — Digital Wellbeing's own tools alone don't restrict a device the way Family Link's remote parental controls do.",
    redirectUrl: "https://support.google.com/android/answer/9346420?hl=en",
    afterImageContent: {
      heading: "How Digital Wellbeing Works on Android",
      paragraphs: [
        "The Digital Wellbeing dashboard pulls usage data directly from the device, breaking it down by app, unlocks, and notifications received each day.",
        "App timers, Focus mode, and Bedtime mode are self-managed tools for your own device, while Family Link is a separate app for supervising a child's device remotely.",
        "Bedtime mode can automatically switch to grayscale and Dark theme at a scheduled time to reduce the pull of the screen at night.",
      ],
      steps: [
        "Open Settings → Digital Wellbeing & parental controls.",
        "Tap 'Dashboard' to review screen time by app for the day or week.",
        "Tap an app's timer icon to set a daily limit, or open 'Focus mode' / 'Bedtime mode' to configure those separately.",
        "For a child's device, tap 'Set up parental controls' to link Family Link and configure remote limits.",
      ],
    },
    whyItMatters:
      "Most people underestimate how much time they actually spend on their phone until they see it broken down by app, and that visibility alone tends to change habits more than any blocking tool could. App timers and Focus mode give a middle ground between doing nothing and deleting an app entirely, letting you rebalance use without losing access completely. For families, Family Link turns an abstract 'less screen time' goal into concrete, enforceable limits that don't depend on a child remembering to self-regulate. Bedtime mode in particular protects sleep, one of the more overlooked ways constant phone use affects daily life.",
    bestPractices: [
      "Check the weekly dashboard total at least once, since daily numbers alone can hide a habit that only shows up over several days.",
      "Set app timers on the two or three apps you actually want to cut back on rather than every app on your phone.",
      "Schedule Bedtime mode automatically instead of relying on remembering to enable Focus mode each night.",
      "Set up Family Link before handing a child their first device, rather than retrofitting supervision after habits have already formed.",
      "Revisit a child's app time limits periodically as their needs change, instead of setting them once and forgetting them.",
    ],
    commonIssues: [
      {
        issue: "An app timer doesn't actually stop the app from being used.",
        fix: "Confirm the timer was set to the correct app and hasn't been reset by manually extending it earlier that day from the pop-up prompt.",
      },
      {
        issue: "A child's device shows no parental controls despite installing Family Link.",
        fix: "Confirm the child's Google Account is genuinely set up as supervised under Family Link, since Digital Wellbeing alone doesn't apply remote restrictions.",
      },
      {
        issue: "Focus mode silences an app you actually needed notifications from.",
        fix: "Remove that specific app from the Focus mode list rather than turning the whole feature off.",
      },
      {
        issue: "Screen time totals look inaccurate compared to actual use.",
        fix: "Restart the device, since a stuck usage-tracking service is a common (if uncommon) cause of totals not updating correctly.",
      },
    ],
    faqs: [
      {
        q: "Does Digital Wellbeing work the same as Family Link?",
        a: "No, Digital Wellbeing is a self-managed set of tools for your own phone, while Family Link is a separate app used to remotely supervise a child's account and device.",
      },
      {
        q: "Can I override an app timer once it's paused the app for the day?",
        a: "Yes, a prompt lets you extend the timer temporarily, though doing this often defeats the purpose of setting one in the first place.",
      },
      {
        q: "Does Bedtime mode turn off my phone completely?",
        a: "No, it just applies Dark theme, grayscale, and Do Not Disturb on a schedule — the phone remains fully usable if you choose to use it.",
      },
    ],
    tipsAndTricks: [
      "Add the Digital Wellbeing widget directly to your home screen for an always-visible reminder of the day's screen time so far.",
      "Use grayscale mode as part of Bedtime mode specifically — a colorless screen is measurably less engaging late at night.",
    ],
    relatedSettingIds: [
      "android-multiple-users",
      "android-do-not-disturb",
      "android-notifications",
    ],
    updateFrequency:
      "Review the dashboard weekly, and revisit a child's Family Link limits every few months as needs change.",
  },
  {
    id: "android-nearby-share",
    title: "Nearby Share",
    icon: Share2,
    platform: "android",
    category: "connectivity-network",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Send Files Wirelessly with Nearby Share (Quick Share)",
    description:
      "Nearby Share — recently rebranded Quick Share — lets you send photos, videos, links, and files directly to another nearby Android device, Chromebook, or Windows PC using a mix of Bluetooth and Wi-Fi, without needing cellular data or a shared internet connection. Visibility settings control exactly who can discover your device and send you something.",
    details: [
      "Both devices need Bluetooth and Wi-Fi turned on, though an internet connection isn't required for the transfer itself.",
      "Visibility can be set to 'Everyone', 'Your devices', or 'Contacts' to control who can see and send to your device.",
      "A confirmation prompt with the sender's name appears before any file is actually accepted, so nothing downloads without approval.",
      "Transfers can also go to compatible Windows PCs and Chromebooks in addition to other Android phones.",
    ],
    important:
      "Leaving visibility set to 'Everyone' in a crowded public place can invite unsolicited transfer requests from strangers nearby — switch to 'Your devices' or 'Contacts' when you're not actively sharing.",
    redirectUrl: "https://support.google.com/android/answer/9286773?hl=en",
    afterImageContent: {
      heading: "How Nearby Share (Quick Share) Works on Android",
      paragraphs: [
        "Nearby Share uses a combination of Bluetooth for discovery and Wi-Fi Direct for the actual transfer, giving faster speeds than Bluetooth alone.",
        "The receiving device must have Nearby Share turned on and set to a visibility level that includes the sender before a request can appear.",
        "Accepted files land directly in the device's Downloads folder or the relevant app, depending on file type.",
      ],
      steps: [
        "Open Settings → Google → Devices & sharing → Quick Share (or swipe down to Quick Settings and long-press the Quick Share tile).",
        "Set your visibility to 'Everyone', 'Your devices', or 'Contacts'.",
        "From the sharing app, tap 'Share' → 'Quick Share' and select the nearby device.",
        "Accept the incoming transfer prompt on the receiving device to complete it.",
      ],
    },
    whyItMatters:
      "Nearby Share removes the friction of emailing yourself a file or plugging in a cable just to move something between two devices sitting next to each other. Because it doesn't rely on mobile data or a shared Wi-Fi network, it works reliably even somewhere with no signal at all, like on a plane or in a basement. The visibility controls also matter for privacy, since an overly open setting effectively broadcasts your device's presence and openness to transfer requests to every nearby stranger.",
    bestPractices: [
      "Keep visibility set to 'Contacts' or 'Your devices' for daily use, switching to 'Everyone' only briefly when sharing with someone new.",
      "Turn on both Bluetooth and Wi-Fi manually if a transfer seems slow to start, since Nearby Share depends on both radios.",
      "Confirm the sender's name on the confirmation prompt before accepting a transfer from an unfamiliar device.",
      "Use Nearby Share instead of a cable for quick transfers to a Chromebook or Windows PC when both support it.",
    ],
    commonIssues: [
      {
        issue: "A nearby device doesn't show up in the share list at all.",
        fix: "Confirm both devices have Bluetooth and Wi-Fi turned on and Nearby Share visibility set to include the other device, then move them closer together.",
      },
      {
        issue: "Transfers between an Android phone and a Windows PC fail or time out.",
        fix: "Update the Quick Share app on Windows to the latest version, since compatibility issues are more common there than between two Android devices.",
      },
      {
        issue: "A transfer accepted successfully but the file can't be found afterward.",
        fix: "Check the Downloads folder via the Files app first, since photos and documents often land there rather than in a dedicated gallery.",
      },
      {
        issue: "Unwanted share requests keep appearing from unfamiliar people nearby.",
        fix: "Switch visibility from 'Everyone' to 'Contacts' or 'Your devices' under Quick Share settings.",
      },
    ],
    faqs: [
      {
        q: "Does Nearby Share use my mobile data?",
        a: "No, it transfers directly between devices over Bluetooth and Wi-Fi Direct, without needing cellular data or a shared internet connection.",
      },
      {
        q: "Is Nearby Share the same thing as Quick Share?",
        a: "Yes, Google rebranded Nearby Share to Quick Share to align its Android and Windows naming, though it works the same way under the hood.",
      },
      {
        q: "Can I send files to an iPhone with Nearby Share?",
        a: "No, Nearby Share currently supports Android, Chromebook, and Windows devices — not iOS.",
      },
    ],
    tipsAndTricks: [
      "Add the Quick Share tile to Quick Settings for a one-swipe way to toggle visibility without digging through the Settings app.",
      "Select multiple files at once from the share sheet to send them in a single Nearby Share transfer instead of repeating the process.",
    ],
    relatedSettingIds: ["android-bluetooth", "android-wifi", "android-privacy-dashboard"],
  },
  {
    id: "android-multiple-users",
    title: "Multiple Users / Guest Mode",
    icon: Users,
    platform: "android",
    category: "accounts-sync-family",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Share One Android Device with Multiple Users or Guest Mode",
    description:
      "Multiple users lets several people share one Android device while keeping separate apps, accounts, wallpapers, and settings in fully isolated profiles. Guest mode offers a lighter, temporary alternative for a one-off borrower, with everything discarded once that guest session ends.",
    details: [
      "Each user profile has its own home screen, apps, Google Account, and storage allocation, invisible to other profiles.",
      "Only the device owner's profile can add or remove other user profiles and change device-wide settings like Wi-Fi.",
      "Guest mode creates a temporary session with a clean, app-store-only starting point that's erased when the guest exits.",
      "Switching between users is done from the lock screen or Quick Settings without needing to fully sign out of either profile.",
    ],
    important:
      "Anything done during a Guest session — downloaded apps, browser history, saved logins — is permanently erased the moment that guest profile is removed, so it can't be recovered afterward.",
    redirectUrl: "https://support.google.com/android/answer/2865483?hl=en",
    afterImageContent: {
      heading: "How Multiple Users & Guest Mode Work on Android",
      paragraphs: [
        "Adding a new user creates a fully separate profile, requiring that person to sign into their own Google Account and set up their own apps.",
        "Guest mode skips that setup entirely, giving a temporary user a near-stock experience without touching your personal apps or accounts.",
        "Only the primary device owner can manage other users' profiles, restrict which apps a restricted profile can access, or remove a user entirely.",
      ],
      steps: [
        "Swipe down twice to Quick Settings and tap the user icon (or open Settings → System → Multiple users).",
        "Tap 'Add user' to create a new profile, or 'Add guest' for a temporary session.",
        "Switch between existing profiles from the same Quick Settings menu or the lock screen.",
        "Remove a user or end a guest session from Settings → System → Multiple users when finished.",
      ],
    },
    whyItMatters:
      "Handing your unlocked phone to a child, friend, or family member normally means giving them access to everything on it at once, and multiple users solves that by giving each person their own genuinely separate space instead. Guest mode extends that same idea to a stranger or a one-time borrow, like letting someone make a quick call or check a map, without exposing your messages, photos, or accounts. It's a meaningfully safer alternative to just unlocking your own profile and handing over the phone as-is.",
    bestPractices: [
      "Use Guest mode by default for anyone borrowing the phone briefly, rather than handing over your own unlocked profile.",
      "Set up a full separate user profile for anyone using the device regularly, like a family member sharing a tablet.",
      "Remove a Guest session immediately after the borrower is done, rather than leaving it active indefinitely.",
      "Restrict a shared device's secondary profiles from installing new apps if it's mainly meant for a specific limited purpose, like a kids' tablet.",
    ],
    commonIssues: [
      {
        issue: "Switching users takes a long time or feels sluggish.",
        fix: "This is more common on lower-storage devices with several profiles; remove unused user profiles to free up resources.",
      },
      {
        issue: "A secondary user can't install apps or change certain settings.",
        fix: "This is expected — only the device owner's profile has full administrative control; switch to that profile to make the change.",
      },
      {
        issue: "Notifications from one user's apps don't appear while another user is active.",
        fix: "This is by design, since each profile is isolated; switch to the relevant user to see and respond to their notifications.",
      },
      {
        issue: "Ended a Guest session and realized something important wasn't saved.",
        fix: "Guest data is erased immediately and can't be recovered — going forward, save anything needed to a personal profile or cloud account before ending the session.",
      },
    ],
    faqs: [
      {
        q: "Can a secondary user see my photos, messages, or apps?",
        a: "No, each user profile is fully isolated with its own apps, accounts, and storage that other users can't access.",
      },
      {
        q: "What happens to a Guest's data when I exit Guest mode?",
        a: "It's completely erased, including any downloaded apps, browsing history, or files from that session.",
      },
      {
        q: "Can I limit what a secondary user is allowed to do?",
        a: "On many devices, yes — a 'restricted profile' option limits which pre-installed apps a secondary user can access, useful for a shared kids' tablet.",
      },
    ],
    tipsAndTricks: [
      "Use the lock screen's user-switch icon for the fastest way to jump between profiles without unlocking your own first.",
      "Set up Guest mode ahead of time (rather than in the moment) if you know you'll be handing your phone to someone at an event.",
    ],
    relatedSettingIds: [
      "android-digital-wellbeing",
      "android-security-screen-lock",
      "android-google-account-sync",
    ],
  },
  {
    id: "android-developer-options",
    title: "Developer Options",
    icon: Terminal,
    platform: "android",
    category: "system-info",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Unlock & Use Developer Options on Android",
    description:
      "Developer options is a hidden settings menu, invisible until unlocked, that exposes low-level tools like USB debugging, animation scaling, background process limits, and Bluetooth/Wi-Fi diagnostic logs. It's built for app developers and advanced troubleshooting, not everyday configuration.",
    details: [
      "The menu is unlocked by tapping the Build number, found under About phone, seven times in quick succession.",
      "A countdown ('You are now X steps away from being a developer') appears after a few taps, followed by a confirmation message once unlocked.",
      "Once unlocked, 'Developer options' appears as its own entry under Settings → System, and stays there until manually hidden or the device is reset.",
      "USB debugging, one of the most commonly used developer toggles, must be enabled to install or debug apps from a computer.",
    ],
    important:
      "Developer options exposes settings that can genuinely destabilize the device — reduce animations or limit background processes if you understand what they do, but avoid changing anything else here without a specific, informed reason.",
    redirectUrl: "https://developer.android.com/studio/debug/dev-options",
    afterImageContent: {
      heading: "How to Unlock Developer Options on Android",
      paragraphs: [
        "Developer options is intentionally hidden by default, since most of its toggles aren't meant for everyday use and could cause confusing behavior if changed accidentally.",
        "Tapping the Build number repeatedly is a deliberate 'you know what you're doing' gate rather than a bug or hidden Easter egg.",
        "Once visible, the menu can be hidden again from its own toggle at the top, though the unlock method remains the same if needed again.",
      ],
      steps: [
        "Open Settings → About phone.",
        "Tap 'Build number' seven times in a row until the developer mode confirmation appears.",
        "Enter your device PIN or password if prompted to confirm.",
        "Return to Settings → System to find the newly visible 'Developer options' menu.",
      ],
    },
    whyItMatters:
      "For app developers, Developer options is essential — USB debugging alone is required to install and test apps directly from a computer, and the same menu holds performance-profiling tools used to diagnose real bugs. For everyday users, it occasionally becomes useful for narrow troubleshooting tasks, like reducing animation speed to make the phone feel snappier or checking Wi-Fi/Bluetooth diagnostic details a support agent has asked for. The hidden unlock gate exists precisely because most of what's inside isn't meant for casual tinkering, and changing the wrong toggle can cause confusing side effects that look like a hardware problem.",
    bestPractices: [
      "Only enable USB debugging when actively connecting to a computer for development or a specific supported tool, then turn it back off.",
      "Leave settings you don't recognize at their defaults rather than experimenting to see what they do.",
      "Hide Developer options again once you're done with whatever task required it, rather than leaving the menu exposed indefinitely.",
      "Check this menu's Wi-Fi and Bluetooth logging tools only when specifically asked to by support staff diagnosing a connectivity issue.",
    ],
    commonIssues: [
      {
        issue: "Tapping Build number repeatedly doesn't seem to do anything.",
        fix: "Make sure you're tapping quickly enough in succession and are tapping the Build number row specifically, not a nearby field like the Android version.",
      },
      {
        issue: "Developer options disappeared after a factory reset or major update.",
        fix: "This is expected — the unlock isn't tied to your Google Account and must be repeated with the same seven-tap process on the Build number.",
      },
      {
        issue: "The phone feels unstable or behaves oddly after changing several settings here.",
        fix: "Use the 'Reset' option at the bottom of Developer options (or disable it entirely) to restore its settings to default without needing a full factory reset.",
      },
      {
        issue: "USB debugging won't let a computer recognize the phone.",
        fix: "Confirm USB debugging is toggled on, accept the 'Allow USB debugging' prompt that appears on the phone when connecting, and try a data-capable USB cable.",
      },
    ],
    faqs: [
      {
        q: "Is it safe to turn on Developer options?",
        a: "Simply unlocking the menu is harmless — it's changing individual toggles inside it, particularly ones you don't understand, that can cause instability.",
      },
      {
        q: "Do I need Developer options for everyday phone use?",
        a: "No, it's intended for app development and advanced troubleshooting; typical daily use never requires it.",
      },
      {
        q: "How do I hide Developer options again once I'm done with it?",
        a: "Open Developer options and toggle it off from the switch at the top of that screen, which hides the menu until re-unlocked.",
      },
    ],
    tipsAndTricks: [
      "Use the 'Window animation scale', 'Transition animation scale', and 'Animator duration scale' settings, all lowered together, for a noticeably snappier-feeling phone.",
      "Check 'Running services' here for a quick view of exactly what's active in the background if a specific app is suspected of misbehaving.",
    ],
    relatedSettingIds: [
      "android-about-phone",
      "android-recovery-safe-mode",
      "android-system-update",
    ],
  },
  {
    id: "android-about-phone",
    title: "About Phone / System Info",
    icon: Info,
    platform: "android",
    category: "system-info",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Find Your Phone's Model, Software & Hardware Details",
    description:
      "About phone is the central reference page for identifying your exact device — model number, Android version, build number, IMEI, and serial number. It's the page you'll be asked to check during a support call, a warranty claim, or when confirming whether an app is compatible with your specific device.",
    details: [
      "Model number and hardware details help identify your exact device variant, useful for finding the correct manual, case, or accessory.",
      "IMEI and serial number are commonly requested for warranty claims, carrier unlocking, or reporting a lost or stolen device.",
      "Android version and security patch level here confirm exactly what software your device is currently running.",
      "The Build number field doubles as the hidden unlock switch for Developer options when tapped seven times.",
    ],
    important:
      "Your IMEI uniquely identifies your specific physical device to carriers and manufacturers — treat it like sensitive information and only share it with a trusted party, like your carrier or the manufacturer's support team.",
    redirectUrl: "https://support.google.com/pixelphone/answer/10402530?hl=en",
    afterImageContent: {
      heading: "What You'll Find Under About Phone",
      paragraphs: [
        "About phone consolidates identifying details that would otherwise require digging through the box, SIM tray, or a separate dialer code.",
        "Software details here, like Android version and security patch date, are the same figures referenced when checking for available updates.",
        "Some manufacturers split this information across a few sub-menus, like 'Model & hardware' and 'Software information', rather than one single page.",
      ],
      steps: [
        "Open Settings → About phone.",
        "Review model number, hardware, and software information listed on this page.",
        "Tap 'IMEI' or 'Status' (naming varies by manufacturer) for IMEI, serial number, and network details.",
        "Tap 'Build number' if you specifically need to unlock Developer options.",
      ],
    },
    whyItMatters:
      "Almost every support interaction — a warranty claim, a carrier unlock request, a manufacturer repair ticket — starts with confirming exactly which device and software version you have, and About phone is where all of that lives in one place. It also matters for personal record-keeping, since having your IMEI and serial number saved somewhere separate from the phone itself is genuinely useful if the device is ever lost or stolen. For anyone troubleshooting compatibility (whether an app supports your Android version, or your device qualifies for a specific update), this page is the definitive source rather than guessing from memory.",
    bestPractices: [
      "Write down or photograph your IMEI and serial number somewhere separate from the phone itself in case it's ever lost or stolen.",
      "Check your exact Android version and security patch date here before assuming an app compatibility issue is a bug.",
      "Reference the precise model number here (not just the marketing name) when searching for accessories or repair guides.",
      "Keep this information handy before contacting carrier or manufacturer support, since it's almost always the first thing they ask for.",
    ],
    commonIssues: [
      {
        issue: "Can't find the IMEI or serial number on this screen.",
        fix: "Look for a sub-menu often labeled 'IMEI', 'Status', or 'Hardware information', since manufacturers organize About phone slightly differently.",
      },
      {
        issue: "Model number shown doesn't match the marketing name printed on the box.",
        fix: "This is normal — the internal model number (used for parts and firmware) often differs from the consumer-facing marketing name.",
      },
      {
        issue: "Software details show an older Android version than expected.",
        fix: "Cross-check against Settings → System → System update to confirm whether a pending update simply hasn't installed yet.",
      },
      {
        issue: "Tapping Build number by accident triggered the Developer options unlock sequence.",
        fix: "This is harmless — either continue if you want Developer options unlocked, or ignore it, since the menu doesn't change anything on its own.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between IMEI and serial number?",
        a: "IMEI identifies the device to cellular networks and is used for things like reporting a phone lost or stolen, while the serial number is a manufacturer-assigned identifier used mainly for warranty and repair tracking.",
      },
      {
        q: "Do I need my IMEI to switch carriers?",
        a: "Often yes, especially when requesting a carrier unlock or activating a SIM on a new network, since it uniquely verifies your specific device.",
      },
      {
        q: "Why does tapping Build number seven times unlock a hidden menu?",
        a: "It's a deliberate gate for Developer options, a set of advanced tools meant for app developers, and this repeated tap avoids exposing it to anyone browsing Settings casually.",
      },
    ],
    tipsAndTricks: [
      "Dial *#06# from the phone app as a quicker alternative to find your IMEI without navigating into Settings at all.",
      "Screenshot this page right after setting up a new phone as a quick personal record of its model and identifying numbers.",
    ],
    relatedSettingIds: [
      "android-system-update",
      "android-developer-options",
      "android-date-time",
    ],
  },
  {
    id: "android-game-mode",
    title: "Game Mode / Game Dashboard",
    icon: Gamepad2,
    platform: "android",
    category: "display-sound-notifications",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Optimize Gameplay with Game Mode & the Game Dashboard",
    description:
      "Game Dashboard is an overlay that appears during gameplay on supported devices, offering an FPS counter, screen recording, screenshot capture, and a one-tap Do Not Disturb toggle without leaving the game. Game Mode, accessed from the same overlay, lets you choose between prioritizing performance or battery life for that specific title.",
    details: [
      "The overlay is triggered from a small floating tab that appears automatically when a supported game launches.",
      "Game Mode profiles typically offer a choice between maximum performance and extended battery life, applied per game.",
      "Do Not Disturb can be toggled directly from the Dashboard so incoming calls and notifications don't interrupt a match.",
      "Screen recordings and screenshots captured from the Dashboard save directly to the device without needing a separate app.",
    ],
    important:
      "Game Dashboard and Game Mode are only available on select devices, chipsets, and Android versions (most consistently on Pixel and a handful of manufacturer skins) — its exact toggles and menu location vary and it may be entirely absent on some phones.",
    redirectUrl: "https://developer.android.com/games/gamedashboard/aboutdashboard",
    afterImageContent: {
      heading: "How Game Dashboard Works on Android",
      paragraphs: [
        "The Dashboard overlay is triggered automatically by supported games and can typically be swiped away and reopened using the small floating tab.",
        "Game Mode settings are applied on a per-game basis, so a performance-heavy title and a lightweight puzzle game can each have different profiles.",
        "Screen recording started from the Dashboard captures gameplay without the on-screen controls interfering with the recorded footage.",
      ],
      steps: [
        "Launch a supported game and look for the floating Game Dashboard tab on screen.",
        "Tap the tab to open the overlay showing FPS, Do Not Disturb, screenshot, and recording controls.",
        "Tap the Game Mode icon to choose a performance or battery-saving profile for that specific game.",
        "Adjust which games use the Dashboard from Settings → Apps & notifications → Game Dashboard (naming varies by device).",
      ],
    },
    whyItMatters:
      "Mobile gaming sessions are especially vulnerable to interruptions — a notification banner or an unexpected call can break focus at exactly the wrong moment, and Game Dashboard's built-in Do Not Disturb toggle solves that without leaving the app. The performance-versus-battery choice in Game Mode also matters directly to the experience, since a demanding game left on full performance can both drain the battery quickly and cause the device to heat up during a long session. For anyone recording or streaming gameplay, having capture tools built directly into the overlay avoids needing a separate third-party recording app entirely.",
    bestPractices: [
      "Set demanding, high-frame-rate games to the performance profile only for shorter sessions, since it draws noticeably more battery and generates more heat.",
      "Switch to the battery-saving Game Mode profile for longer play sessions away from a charger.",
      "Turn on the Dashboard's Do Not Disturb toggle before any session where interruptions would be especially disruptive, like a competitive match.",
      "Check Settings for which games are Dashboard-eligible after installing a new title, since not every game triggers the overlay automatically.",
    ],
    commonIssues: [
      {
        issue: "The Game Dashboard overlay never appears for a specific game.",
        fix: "Confirm the game is added to the Dashboard's supported list under its settings, since some titles need to be manually enabled rather than being detected automatically.",
      },
      {
        issue: "Performance mode causes the phone to get noticeably hot.",
        fix: "Switch to the battery-saving profile for that game, or take a short break to let the device cool down before continuing on performance mode.",
      },
      {
        issue: "Screen recordings from the Dashboard have choppy or low frame rate footage.",
        fix: "Close other background apps before recording, and lower the game's own in-game graphics settings if the device is struggling to sustain a high frame rate.",
      },
      {
        issue: "The floating Dashboard tab gets in the way during gameplay.",
        fix: "Drag the tab to a less obtrusive screen edge, or collapse it, since most implementations let you reposition rather than remove it entirely.",
      },
    ],
    faqs: [
      {
        q: "Is Game Dashboard available on every Android phone?",
        a: "No, it depends on the device, chipset, and Android version — it's most consistently available on Pixel devices and select manufacturer skins.",
      },
      {
        q: "Does Game Mode change settings inside the game itself?",
        a: "No, it adjusts system-level resource allocation for performance or battery life; it doesn't touch the game's own in-app graphics settings.",
      },
      {
        q: "Can I record gameplay without a separate screen recording app?",
        a: "Yes, the Game Dashboard overlay includes its own built-in screen recording and screenshot tools during supported games.",
      },
    ],
    tipsAndTricks: [
      "Enable the FPS counter briefly when a game feels laggy, to confirm whether it's a genuine performance issue or just perceived slowdown.",
      "Combine the Dashboard's Do Not Disturb toggle with a performance Game Mode profile for the least interrupted, smoothest experience during a competitive match.",
    ],
    relatedSettingIds: [
      "android-battery",
      "android-do-not-disturb",
      "android-display-dark-mode",
    ],
  },
  {
    id: "android-recovery-safe-mode",
    title: "Safe Mode & Recovery",
    icon: LifeBuoy,
    platform: "android",
    category: "troubleshooting-diagnostics",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Troubleshoot Android Problems with Safe Mode & Recovery",
    description:
      "Safe mode is a temporary boot state that disables all third-party apps, making it easy to tell whether a downloaded app is causing a crash, freeze, or battery drain. Recovery mode is a separate, more powerful boot menu — accessed with hardware buttons before Android fully loads — used for wiping the cache partition, sideloading an update, or performing a factory reset when the device won't start normally.",
    details: [
      "In Safe mode, only pre-installed system apps run, and a small watermark usually appears in the corner of the screen to confirm it's active.",
      "Exiting Safe mode is normally as simple as restarting the phone, without needing any special key combination.",
      "Recovery mode is entered with a specific button combination (commonly Power + Volume Down, though it varies by manufacturer) while the phone is off.",
      "Wiping the cache partition from Recovery mode clears temporary system files without touching personal data or installed apps.",
    ],
    important:
      "Recovery mode's menu is navigated entirely with the volume and power buttons and skips normal confirmation dialogs — selecting 'Wipe data/factory reset' by mistake can immediately erase the device with no undo.",
    redirectUrl: "https://support.google.com/pixelphone/answer/2852139?hl=en",
    afterImageContent: {
      heading: "Safe Mode vs. Recovery Mode on Android",
      paragraphs: [
        "Safe mode is meant for a phone that boots normally but behaves erratically, letting you identify whether a specific app is the cause.",
        "Recovery mode exists for more serious situations, including a phone stuck on the boot logo, unable to complete an update, or needing a factory reset without going through Settings.",
        "Neither mode is a permanent state — both are exited by restarting the device normally, back into standard Android.",
      ],
      steps: [
        "For Safe mode: press and hold the power button, then touch and hold 'Power off' when the menu appears until prompted to reboot into Safe mode.",
        "Confirm Safe mode is active by checking for the watermark text in a corner of the screen, then test whether the original problem still happens.",
        "For Recovery mode: power the device off completely, then hold the manufacturer's specific button combination (often Power + Volume Down) until the recovery menu appears.",
        "Use the volume keys to navigate and the power button to select an option in Recovery mode, choosing carefully before confirming.",
      ],
    },
    whyItMatters:
      "A phone that's crashing, freezing, or draining battery unusually fast is often the fault of one specific app rather than the operating system itself, and Safe mode isolates that possibility in under a minute without needing to uninstall anything blindly. Recovery mode covers the more serious end of troubleshooting — a device that won't boot past its logo, or one where a system update has gone wrong — situations where the normal Settings app isn't even reachable. Knowing the difference between the two, and specifically that Recovery mode skips normal confirmation prompts, prevents an accidental factory reset while trying to fix something far less drastic.",
    bestPractices: [
      "Try Safe mode first for any crash, freeze, or battery drain issue before assuming a factory reset is necessary.",
      "Uninstall the most recently installed app if a problem disappears in Safe mode and reappears once back in normal mode.",
      "Read each Recovery mode menu option carefully before selecting it, since the wrong choice can permanently erase data with no confirmation step.",
      "Back up your device before deliberately entering Recovery mode for anything beyond a simple cache wipe.",
    ],
    commonIssues: [
      {
        issue: "Phone won't exit Safe mode after a normal restart.",
        fix: "Check for a stuck volume-down key (physically or in a case), since Safe mode can sometimes be triggered by that key being held during boot.",
      },
      {
        issue: "The specific button combination for Recovery mode doesn't seem to work.",
        fix: "Look up the exact combination for your device's manufacturer and model, since it varies (some use Power + Volume Up, others Power + Volume Down).",
      },
      {
        issue: "A problem persists even after confirming it happens in Safe mode too.",
        fix: "This suggests a system-level or hardware issue rather than a third-party app; consider a factory reset or contacting manufacturer support next.",
      },
      {
        issue: "Accidentally selected 'Wipe data/factory reset' while navigating Recovery mode.",
        fix: "If not yet confirmed on a following screen, back out immediately with the volume keys; if already confirmed, the reset cannot be stopped or undone.",
      },
    ],
    faqs: [
      {
        q: "Does Safe mode delete any of my apps or data?",
        a: "No, it only temporarily disables third-party apps from running; nothing is deleted, and everything returns to normal after a restart.",
      },
      {
        q: "Is Recovery mode the same as Safe mode?",
        a: "No, Recovery mode is a separate, more powerful boot menu for tasks like factory resets or cache wipes, accessed before Android even loads, while Safe mode is a lighter in-Android troubleshooting state.",
      },
      {
        q: "What should I do if my phone is stuck on the boot logo?",
        a: "Try entering Recovery mode and wiping the cache partition first, since a full factory reset should be a last resort after that doesn't resolve it.",
      },
    ],
    tipsAndTricks: [
      "Note your specific device's Recovery mode button combination in advance, since figuring it out in the middle of an actual problem wastes valuable time.",
      "Use Safe mode as a quick, low-risk first diagnostic step any time the phone acts up right after installing a new app.",
    ],
    relatedSettingIds: [
      "android-factory-reset",
      "android-developer-options",
      "android-apps-default-apps",
    ],
  },
  {
    id: "android-emergency-sos",
    title: "Emergency SOS & Safety",
    icon: Siren,
    platform: "android",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Emergency SOS & Personal Safety Features on Android",
    description:
      "Emergency SOS lets you quickly call for help and automatically share your location with emergency contacts and first responders by pressing the power button rapidly, without needing to unlock the phone first. The broader Personal Safety app builds on this with features like Safety Check, Crisis Alerts, and Car Crash Detection on supported devices.",
    details: [
      "Emergency SOS is typically triggered by pressing the power button five or more times in quick succession, configurable in its settings.",
      "Once triggered, it can automatically call emergency services and send your location to chosen emergency contacts.",
      "Safety Check schedules a check-in at a set time, alerting your emergency contacts automatically if you don't respond.",
      "Car Crash Detection, on supported devices, uses onboard sensors to detect a severe crash and automatically calls for help if you're unresponsive.",
    ],
    important:
      "Emergency SOS's rapid power-button trigger can activate accidentally in a pocket or bag if set too sensitively — test the exact gesture deliberately once, in a safe moment, so you know how it feels rather than discovering it by accident.",
    redirectUrl: "https://support.google.com/android/answer/9319337?hl=en",
    afterImageContent: {
      heading: "How Emergency SOS Works on Android",
      paragraphs: [
        "Emergency SOS works even from the lock screen, since access to emergency help shouldn't depend on unlocking the phone first.",
        "Emergency contacts you designate receive your location and an alert automatically once SOS is triggered, without you needing to send anything manually.",
        "Additional Personal Safety features like Safety Check and Crisis Alerts run independently and can be set up without necessarily enabling every other safety feature.",
      ],
      steps: [
        "Open Settings → Safety & emergency.",
        "Tap 'Emergency SOS' to configure the trigger and choose whether it also calls emergency services automatically.",
        "Add or review your Emergency contacts under the same Safety & emergency menu.",
        "Explore 'Safety Check', 'Crisis Alerts', and 'Car Crash Detection' (where supported) to enable additional features.",
      ],
    },
    whyItMatters:
      "In a genuine emergency, the seconds spent unlocking a phone, finding the dialer, and explaining a location out loud can matter enormously, and Emergency SOS is built specifically to remove all of that friction. Automatically sharing location with emergency contacts means help can be coordinated even if the person in danger can't speak or type clearly. Features like Car Crash Detection and Safety Check extend that same protection to situations where someone might be unconscious or simply unable to reach their phone, making this one of the settings with the highest real-world stakes on the entire device.",
    bestPractices: [
      "Add at least two emergency contacts rather than just one, in case one person is unreachable when it matters.",
      "Test the Emergency SOS trigger once deliberately (canceling before it actually dials, if the option allows) so the gesture feels familiar.",
      "Keep medical information and emergency contacts updated in the Personal Safety app, especially after a move or a change in emergency contacts.",
      "Turn on Car Crash Detection if your device supports it and you regularly drive, since it specifically covers a moment you can't manually respond to.",
      "Review Safety Check's default check-in duration and adjust it to match how long your actual solo activities, like a hike or a late walk, typically take.",
    ],
    commonIssues: [
      {
        issue: "Emergency SOS triggers accidentally while the phone is in a pocket or bag.",
        fix: "Adjust the number of power-button presses required, or turn off the automatic emergency call option, under Settings → Safety & emergency → Emergency SOS.",
      },
      {
        issue: "Emergency contacts don't receive a location alert when SOS is triggered.",
        fix: "Confirm location services are turned on device-wide and that contacts were added correctly under the Emergency SOS settings, not just saved in the regular Contacts app.",
      },
      {
        issue: "Car Crash Detection isn't available on the device.",
        fix: "Confirm the specific device and region support it, since it depends on onboard sensors and isn't available on every Android phone.",
      },
      {
        issue: "A Safety Check session ends without prompting for a response.",
        fix: "Check that notifications for the Personal Safety app aren't being silenced by Do Not Disturb or battery optimization settings.",
      },
    ],
    faqs: [
      {
        q: "Does Emergency SOS work if my phone is locked?",
        a: "Yes, it's specifically designed to work from the lock screen, since emergency access shouldn't depend on unlocking the phone first.",
      },
      {
        q: "Will Emergency SOS automatically call emergency services?",
        a: "It can, depending on your configuration under Settings → Safety & emergency — this can also be turned off if you only want the contact-alert and location-sharing behavior.",
      },
      {
        q: "What is Safety Check used for?",
        a: "It schedules a check-in for a set activity, like a solo walk or date, and automatically alerts your chosen emergency contacts with your location if you don't respond in time.",
      },
    ],
    tipsAndTricks: [
      "Set up Safety Check before a specific solo activity, like a hike or a late-night walk, rather than relying only on the always-on Emergency SOS trigger.",
      "Review and refresh your Emergency SOS contacts periodically, since an outdated contact defeats the purpose of the feature entirely.",
    ],
    relatedSettingIds: [
      "android-location",
      "android-security-screen-lock",
      "android-notifications",
    ],
  },
  // --- 21 additional Android entries: Devices & Peripherals (previously
  // empty), Apps & Features, Storage & Backup, Accessibility & Language,
  // System Updates, and Troubleshooting & Diagnostics ---
{
  id: "android-connected-devices",
  title: "Connected Devices",
  icon: Smartphone,
  platform: "android",
  category: "devices-peripherals",
  frequentlyUsed: true,
  controlType: "action",
  actionLabel: "Open Connected Devices",
  heading: "Manage all paired and nearby devices",
  description:
    "Connected devices is the hub screen for every accessory linked to your phone, including Bluetooth headphones, watches, car systems, and USB or NFC connections, plus shortcuts to Cast and Nearby Share preferences.",
  details: [
    "Shows a list of currently connected and previously paired Bluetooth devices.",
    "'Pair new device' scans for nearby Bluetooth accessories.",
    "Connection preferences holds Bluetooth, Cast, NFC, driving mode, and printing settings.",
    "Tapping a paired device opens per-device options like unpairing or renaming.",
  ],
  important:
    "Some settings shown here (like NFC or Cast) are just shortcuts to their own dedicated settings screens, not unique controls.",
  redirectUrl: "https://support.google.com/android/topic/6086859",
  whyItMatters:
    "Keeping this list tidy prevents old or lost devices from auto-reconnecting or draining battery searching for a signal, and makes it much faster to find and troubleshoot a misbehaving accessory.",
  bestPractices: [
    "Remove ('forget') devices you no longer own so your phone stops trying to reconnect to them.",
    "Rename devices with descriptive names if you pair several similar accessories.",
    "Check Connection preferences after unboxing any new accessory to confirm its category-specific settings.",
  ],
  commonIssues: [
    {
      issue: "A Bluetooth device shows as paired but won't connect.",
      fix: "Unpair (forget) it from both the phone and the accessory, then pair again from scratch.",
    },
    {
      issue: "A device that's turned off still appears at the top of the list.",
      fix: "This is normal — Android keeps prior pairings until you manually remove them.",
    },
  ],
  faqs: [
    {
      q: "What's the difference between 'paired' and 'connected'?",
      a: "Paired means the device is remembered and trusted; connected means it's actively linked and exchanging data right now.",
    },
    {
      q: "Can I see battery level for connected accessories here?",
      a: "Many Bluetooth accessories (earbuds, styluses) show battery percentage next to their name if they support that feature.",
    },
  ],
  tipsAndTricks: [
    "Tap the gear icon next to a paired device for quick access to things like call/media audio routing without leaving the list.",
  ],
  relatedSettingIds: ["android-bluetooth", "android-nearby-share", "android-usb-preferences"],
  afterImageContent: {
    heading: "How Connected Devices Works",
    paragraphs: [
      "This screen consolidates connectivity settings that used to be scattered across separate menus, giving you one place to see what's paired, what's actively connected, and what preferences apply to each connection type.",
      "Selecting an individual device opens options specific to that accessory, such as toggling call audio, viewing battery level, or forgetting the pairing entirely, while Connection preferences links out to Bluetooth, Cast, NFC, printing, and driving mode settings.",
    ],
    steps: [
      "Open Settings > Connected devices.",
      "Tap 'Pair new device' to search for and connect a new accessory.",
      "Tap any device already in the list to view or change its options.",
      "Open 'Connection preferences' to adjust Bluetooth, Cast, NFC, or printing defaults.",
    ],
  },
},
{
  id: "android-printing",
  title: "Printing",
  icon: Printer,
  platform: "android",
  category: "devices-peripherals",
  controlType: "action",
  actionLabel: "Open Printing Settings",
  heading: "Set up and manage printers",
  description:
    "Printing settings let Android discover printers on your Wi-Fi network or connect to manufacturer print services, so you can print documents, photos, and web pages directly from apps using the system Print option.",
  details: [
    "Android's built-in 'Default Print Service' finds printers on the same Wi-Fi network automatically.",
    "Manufacturer print services (HP, Epson, Canon, etc.) can be installed separately for extra features.",
    "Any app with a Share or Print menu option can send jobs to a configured printer.",
    "You can add a printer manually by IP address if automatic discovery doesn't find it.",
  ],
  important:
    "Printing requires the phone and printer to be on the same Wi-Fi network unless the printer supports Bluetooth or cloud printing.",
  redirectUrl: "https://support.google.com/android",
  whyItMatters:
    "Being able to print directly from a phone saves time when you need a quick boarding pass, receipt, or document copy without transferring files to a computer first.",
  bestPractices: [
    "Install your printer manufacturer's dedicated print service for features like duplex printing and tray selection.",
    "Keep the phone and printer on the same Wi-Fi network rather than a guest network, which often blocks local discovery.",
    "Use 'Save as PDF' from the print preview screen when you just need a digital copy, not paper.",
  ],
  commonIssues: [
    {
      issue: "No printers are found during a search.",
      fix: "Confirm the printer and phone share the same Wi-Fi network, and that a print service (like Default Print Service) is enabled in Printing settings.",
    },
    {
      issue: "Print jobs stay queued and never print.",
      fix: "Reconnect the printer to Wi-Fi, restart it, and resend the job — most stuck jobs are a printer-side connectivity drop.",
    },
  ],
  faqs: [
    {
      q: "Do I need a special app to print from my phone?",
      a: "No, any app with a Print option in its Share menu can use Android's built-in printing framework.",
    },
    {
      q: "Can I print over Bluetooth instead of Wi-Fi?",
      a: "Some printers support Bluetooth printing, but it requires a manufacturer-specific print service since Android's default service is Wi-Fi based.",
    },
  ],
  tipsAndTricks: [
    "Use the print preview screen to select specific pages or a page range before sending the job, saving paper on long documents.",
  ],
  relatedSettingIds: ["android-connected-devices", "android-cast", "android-bluetooth"],
  afterImageContent: {
    heading: "How Printing Works",
    paragraphs: [
      "Android uses a modular print-service system: the built-in Default Print Service handles most Wi-Fi printers automatically, while manufacturers offer their own apps for advanced features.",
      "Once a print service is enabled, any app's Print command routes through it, showing a preview screen where you choose the printer, paper size, copies, and orientation before sending the job.",
    ],
    steps: [
      "Open Settings > Connected devices > Connection preferences > Printing.",
      "Make sure Default Print Service (or your printer's app) is turned on.",
      "From any app, tap Share or the menu, then choose Print.",
      "Select your printer, adjust options, and tap the print icon.",
    ],
  },
},
{
  id: "android-cast",
  title: "Cast",
  icon: Cast,
  platform: "android",
  category: "devices-peripherals",
  controlType: "action",
  actionLabel: "Open Cast Settings",
  heading: "Send your screen to a TV",
  description:
    "Cast lets you send audio, video, or your entire phone screen wirelessly to a Chromecast-built-in TV, Chromecast device, or other Cast-enabled speaker on the same Wi-Fi network.",
  details: [
    "Individual apps like YouTube and Spotify have their own in-app Cast button for casting just that media stream.",
    "'Cast screen' from Quick Settings mirrors your entire display, including apps without native Cast support.",
    "Cast devices must be on the same Wi-Fi network as the phone to appear as available targets.",
    "Casting audio only (rather than screen mirroring) typically uses far less battery and bandwidth.",
  ],
  important:
    "Screen mirroring shows notifications and everything else on your display, so it's worth turning off notifications before mirroring anything private.",
  redirectUrl: "https://support.google.com/chromecast",
  whyItMatters:
    "Casting turns any TV into an ad-hoc display for photos, presentations, or streaming without cables, which is especially useful for showing content to a group.",
  bestPractices: [
    "Prefer an app's built-in Cast button over full screen mirroring when available, since it's more battery- and bandwidth-efficient.",
    "Stay on the same Wi-Fi network as the Cast device — casting across networks or over mobile data isn't supported.",
    "Stop casting from the notification shade when finished rather than just closing the app, to fully release the connection.",
  ],
  commonIssues: [
    {
      issue: "The TV or speaker doesn't appear as a cast option.",
      fix: "Confirm both devices are on the same Wi-Fi network (not a guest network) and that the TV or Chromecast is powered on.",
    },
    {
      issue: "Screen mirroring shows a black screen for some video apps.",
      fix: "This is expected for DRM-protected content like some streaming apps; use the app's native Cast button instead of full screen mirroring.",
    },
  ],
  faqs: [
    {
      q: "Does casting use mobile data?",
      a: "No, both devices need to be on the same Wi-Fi network — casting doesn't work over mobile data.",
    },
    {
      q: "Can I cast without a separate Chromecast device?",
      a: "Yes, any TV with Chromecast built in, or compatible smart speakers and displays, can receive a cast without a dongle.",
    },
  ],
  tipsAndTricks: [
    "Swipe down twice for Quick Settings and tap 'Screen Cast' for a one-tap shortcut instead of digging through app menus.",
  ],
  relatedSettingIds: ["android-connected-devices", "android-wifi", "android-nearby-share"],
  afterImageContent: {
    heading: "How Cast Works",
    paragraphs: [
      "Cast uses your Wi-Fi network to stream content directly from the cloud or your device to a receiver like a Chromecast, rather than sending the video signal over a physical cable.",
      "For supported apps, casting only sends a lightweight command telling the TV what to play, so playback continues even if you leave the app; full screen mirroring instead streams your entire display in real time.",
    ],
    steps: [
      "Connect your phone and TV/Chromecast to the same Wi-Fi network.",
      "Open Quick Settings and tap 'Screen Cast', or tap the Cast icon inside a supported app.",
      "Select your TV or Cast device from the list.",
      "Tap 'Stop casting' in the notification shade when you're done.",
    ],
  },
},
{
  id: "android-usb-preferences",
  title: "USB Preferences",
  icon: Usb,
  platform: "android",
  category: "devices-peripherals",
  controlType: "action",
  actionLabel: "Open USB Preferences",
  heading: "Choose what USB connection does",
  description:
    "USB Preferences controls what happens when your phone is plugged into a computer or other USB device — whether it charges only, transfers files, shares a network connection, or acts as a MIDI/audio device.",
  details: [
    "'No data transfer' charges the phone but keeps the computer from accessing any files.",
    "'File Transfer' mounts the phone's storage so you can drag and drop photos and documents.",
    "'USB tethering' shares your phone's mobile data connection with the connected computer.",
    "'MIDI' and 'PTP' modes support specialized use cases like music equipment or camera-style photo transfer.",
  ],
  important:
    "This menu only appears while a USB cable is actually connected — it isn't accessible with nothing plugged in.",
  redirectUrl: "https://support.google.com/android/topic/6086859",
  whyItMatters:
    "Choosing the wrong USB mode is a common reason a phone 'won't connect' to a computer, since public or work computers sometimes default to charge-only for security.",
  bestPractices: [
    "Leave the default at 'No data transfer' for routine charging on unfamiliar computers or public charging stations.",
    "Switch to File Transfer only when you actively need to move files, then switch back afterward.",
    "Use a data-capable USB cable — some charge-only cables physically lack the wires needed for file transfer.",
  ],
  commonIssues: [
    {
      issue: "Computer doesn't detect the phone's storage when plugged in.",
      fix: "Pull down the USB notification and confirm the mode is set to File Transfer, not charging-only, and try a different cable.",
    },
    {
      issue: "The USB preferences menu isn't showing up.",
      fix: "Unplug and reconnect the USB cable — the menu only appears while an active USB connection is present.",
    },
  ],
  faqs: [
    {
      q: "Is 'charging only' safer on public USB ports?",
      a: "Yes, it prevents any unintended file access, which is why many phones default to it as a precaution against 'juice jacking'.",
    },
    {
      q: "Why does the phone charge slower in File Transfer mode?",
      a: "Actively transferring data can slightly reduce available charging power, though the difference is usually minor on modern cables.",
    },
  ],
  tipsAndTricks: [
    "Tap the USB charging notification directly (instead of navigating through Settings) for the fastest way to switch modes mid-session.",
  ],
  relatedSettingIds: ["android-connected-devices", "android-android-auto", "android-storage-cleanup"],
  afterImageContent: {
    heading: "How USB Preferences Works",
    paragraphs: [
      "When a USB cable connects, Android negotiates a default mode with the other device and shows a notification letting you change it. The actual options available depend on the phone and what it's plugged into.",
      "Behind the scenes, the setting controls which USB protocol the phone advertises — mass storage/MTP for file access, RNDIS for tethering, or a simple power-only mode with no data lines active.",
    ],
    steps: [
      "Connect your phone to a computer with a USB cable.",
      "Pull down the notification shade and tap the USB notification.",
      "Choose File Transfer, USB tethering, MIDI, PTP, or No data transfer.",
      "Change it again anytime from the same notification while connected.",
    ],
  },
},
{
  id: "android-android-auto",
  title: "Android Auto",
  icon: Car,
  platform: "android",
  category: "devices-peripherals",
  frequentlyUsed: true,
  controlType: "action",
  actionLabel: "Open Android Auto Settings",
  heading: "Connect your phone to your car",
  description:
    "Android Auto projects a simplified, driving-friendly interface — navigation, calls, messaging, and media — onto your car's built-in display, either over a USB cable or wirelessly on supported vehicles.",
  details: [
    "Wireless Android Auto requires both the phone and car to support it, plus Bluetooth and Wi-Fi turned on.",
    "You can customize which apps appear on the car screen and their order.",
    "Driving mode settings control voice replies and notification read-aloud behavior.",
    "A list of previously connected cars can be managed, including removing ones you no longer use.",
  ],
  important:
    "Not every car head unit supports wireless Android Auto — check your vehicle's specifications if a USB cable is required for you.",
  redirectUrl: "https://support.google.com/androidauto",
  whyItMatters:
    "A properly configured Android Auto setup keeps navigation and calls accessible with minimal glances at the phone, which is a meaningful safety factor while driving.",
  bestPractices: [
    "Use a certified, data-capable USB cable for the most reliable wired connection.",
    "Keep Bluetooth and Wi-Fi both enabled if you plan to use wireless Android Auto, since it relies on both.",
    "Review which apps are allowed on the car screen periodically to keep the interface uncluttered while driving.",
  ],
  commonIssues: [
    {
      issue: "Android Auto won't launch when the phone is plugged in.",
      fix: "Try a different USB cable and port, confirm Android Auto is updated in the Play Store, and check the car's USB port isn't charge-only.",
    },
    {
      issue: "Wireless Android Auto keeps disconnecting.",
      fix: "Forget and re-pair the car's Bluetooth connection, and make sure phone Wi-Fi isn't set to turn off automatically to save battery.",
    },
  ],
  faqs: [
    {
      q: "Do I need the Android Auto app installed?",
      a: "On most phones running recent Android versions, Android Auto is built in; older devices may need the app from the Play Store.",
    },
    {
      q: "Can I use Android Auto without a data connection?",
      a: "Basic functions like music and calls work, but live navigation and traffic data require an active mobile data or Wi-Fi connection.",
    },
  ],
  tipsAndTricks: [
    "Say 'Hey Google' while connected to control navigation, messages, and calls hands-free without touching the screen.",
  ],
  relatedSettingIds: ["android-usb-preferences", "android-bluetooth", "android-do-not-disturb"],
  afterImageContent: {
    heading: "How Android Auto Works",
    paragraphs: [
      "Android Auto acts as a bridge, taking driving-relevant apps on your phone and rendering a large-button, low-distraction version of them on your car's display, while the phone continues to do the actual processing.",
      "A wired connection uses USB for both power and data; a wireless connection instead pairs over Bluetooth to establish the link, then streams the interface over a direct Wi-Fi connection between phone and car.",
    ],
    steps: [
      "Open Settings > Connected devices > Connection preferences > Android Auto.",
      "Connect your phone to the car via USB, or pair it for wireless Android Auto if supported.",
      "Customize which apps show on the car screen under Customize launcher.",
      "Adjust notification and voice-reply behavior under driving mode settings.",
    ],
  },
},
{
  id: "android-app-info",
  title: "App Info",
  icon: AppWindow,
  platform: "android",
  category: "apps-features",
  frequentlyUsed: true,
  recommended: true,
  controlType: "action",
  actionLabel: "Open App Info",
  heading: "View and control one app's settings",
  description:
    "App info is the dedicated settings page for a single installed app, showing its permissions, storage and cache usage, notification controls, battery behavior, and options to force stop, uninstall, or disable it.",
  details: [
    "Permissions shows exactly what the app can access (camera, location, contacts, etc.) and lets you revoke any of them.",
    "Storage & cache breaks down how much space the app and its data are using, with a one-tap 'Clear cache' option.",
    "Notifications lets you fine-tune or completely mute alerts from that specific app.",
    "'Force stop' and 'Uninstall' give quick ways to kill a misbehaving app or remove it entirely.",
  ],
  important:
    "Some pre-installed system apps can only be 'disabled', not uninstalled, since they're part of the manufacturer's core software.",
  redirectUrl: "https://support.google.com/android",
  whyItMatters:
    "This is the fastest single screen for diagnosing a misbehaving app — most 'my app is broken' problems (excess battery use, stuck notifications, storage bloat) get resolved from here without needing a full reset.",
  bestPractices: [
    "Check an app's permissions here right after installing anything you didn't expect to need them.",
    "Use 'Clear cache' as a first troubleshooting step before 'Clear data', which erases the app's saved logins and settings.",
    "Force stop an app that's frozen or unresponsive instead of restarting the whole phone.",
  ],
  commonIssues: [
    {
      issue: "An app keeps crashing on launch.",
      fix: "Clear its cache first; if that doesn't help, clear data (which resets it to a fresh install) or reinstall the app entirely.",
    },
    {
      issue: "An app is using far more storage than expected.",
      fix: "Check the storage breakdown for a bloated cache or data folder and clear cache, which is safe and doesn't delete your data.",
    },
  ],
  faqs: [
    {
      q: "What's the difference between 'Force stop' and 'Uninstall'?",
      a: "Force stop just closes the app's running processes without removing it, while Uninstall deletes the app and its data from the device entirely.",
    },
    {
      q: "Can I get back to this screen from a running app?",
      a: "Yes — most Android versions let you long-press an app icon and tap 'App info' as a shortcut.",
    },
  ],
  tipsAndTricks: [
    "Long-press any app icon on the home screen and tap the info (i) button to jump straight into that app's App info screen.",
  ],
  relatedSettingIds: ["android-app-permissions", "android-special-app-access", "android-unused-apps-archiving"],
  afterImageContent: {
    heading: "How App Info Works",
    paragraphs: [
      "Every installed app has its own App info page, which Android builds automatically from the permissions the app requests, the storage it consumes, and the notification channels it defines.",
      "Changes made here — like revoking a permission or muting notifications — take effect immediately and apply only to that one app, without affecting system-wide settings or other apps.",
    ],
    steps: [
      "Open Settings > Apps, then tap the app you want to manage.",
      "Review Permissions to see and adjust what the app can access.",
      "Check Storage & cache or Notifications as needed.",
      "Use Force stop, Disable, or Uninstall from the same screen if necessary.",
    ],
  },
},
{
  id: "android-special-app-access",
  title: "Special App Access",
  icon: Layers,
  platform: "android",
  category: "apps-features",
  controlType: "action",
  actionLabel: "Open Special App Access",
  heading: "Manage advanced app permissions",
  description:
    "Special app access holds a set of sensitive, less-common permissions — like displaying over other apps, device admin access, or usage access — that aren't part of the normal runtime permission prompts.",
  details: [
    "'Display over other apps' controls which apps can draw overlays on top of everything else, like chat heads or screen dimmers.",
    "'Device admin apps' lists apps (often work profiles or security tools) with elevated control over the device.",
    "'Usage access' lets apps see your app-usage history, used by digital wellbeing and some launcher apps.",
    "'Modify system settings' and 'Unrestricted data' are additional toggles found in this same section.",
  ],
  important:
    "Because these permissions are more powerful than everyday ones, apps can't request them through a normal pop-up — you have to grant them manually here.",
  redirectUrl: "https://support.google.com/android",
  whyItMatters:
    "Overlay and device admin permissions are commonly abused by malicious apps to create fake login screens or resist uninstallation, so reviewing this list occasionally is a real security safeguard, not just housekeeping.",
  bestPractices: [
    "Periodically review 'Display over other apps' and revoke it from anything you don't recognize or no longer use.",
    "Only grant 'Device admin' access to trusted security or work-management apps.",
    "Turn off 'Usage access' for any app that doesn't have a clear reason to need your usage history.",
  ],
  commonIssues: [
    {
      issue: "An app can't be uninstalled.",
      fix: "Check Device admin apps for that app and remove its admin access first, then uninstall normally.",
    },
    {
      issue: "A suspicious overlay or fake system dialog keeps appearing.",
      fix: "Check Display over other apps for unfamiliar apps and revoke the permission, then run a security scan.",
    },
  ],
  faqs: [
    {
      q: "Why isn't a permission I need listed as a normal toggle?",
      a: "Special permissions are considered higher-risk, so Android intentionally requires you to grant them manually here rather than through an in-app prompt.",
    },
    {
      q: "Is it safe to leave 'Display over other apps' off by default?",
      a: "Yes, most apps work fine without it — only enable it for apps that specifically need overlays, like screen recorders or call-blocking tools.",
    },
  ],
  tipsAndTricks: [
    "If Play Protect flags an app, check Special app access first — malware frequently requests overlay or device admin permissions to resist removal.",
  ],
  relatedSettingIds: ["android-app-info", "android-app-permissions", "android-privacy-dashboard"],
  afterImageContent: {
    heading: "How Special App Access Works",
    paragraphs: [
      "Unlike everyday permissions such as camera or location, special access permissions are granted globally per app from this settings screen rather than through a runtime pop-up when the app first needs them.",
      "Each category in this list — overlays, device admin, usage access, and more — maps to a specific Android system capability, and only apps that have actually requested that capability appear as toggleable options.",
    ],
    steps: [
      "Open Settings > Apps > Special app access.",
      "Choose a category, such as Display over other apps or Device admin apps.",
      "Review which apps currently have that access.",
      "Toggle any app off to revoke the permission.",
    ],
  },
},
{
  id: "android-unused-apps-archiving",
  title: "Unused Apps",
  icon: Archive,
  platform: "android",
  category: "apps-features",
  controlType: "action",
  actionLabel: "Manage Unused Apps",
  heading: "Auto-manage apps you rarely open",
  description:
    "Android automatically detects apps you haven't opened in months and can revoke their runtime permissions or archive them — removing most of the app's files while keeping its icon and data so it can be quickly restored.",
  details: [
    "Permissions for unused apps (like location or camera) are auto-revoked after a period of inactivity as a privacy safeguard.",
    "Archiving replaces the app's installable files with a lightweight placeholder, freeing storage while preserving login data and settings.",
    "Tapping an archived app's icon automatically re-downloads and restores it from the Play Store.",
    "You can turn off auto-archiving per app, or manually archive an app yourself from its Play Store listing.",
  ],
  important:
    "Archiving requires a working internet connection to restore the app later — it isn't a full local backup.",
  redirectUrl: "https://support.google.com/android",
  whyItMatters:
    "This feature quietly reclaims storage and shrinks your attack surface (fewer apps holding live permissions) without you having to manually audit every rarely used app.",
  bestPractices: [
    "Let auto-archiving run for apps you genuinely use rarely, like a rideshare or airline app you open a few times a year.",
    "Manually archive large, seldom-used apps yourself instead of waiting for the automatic timer.",
    "Re-grant permissions immediately after restoring an archived app if it needs them to function.",
  ],
  commonIssues: [
    {
      issue: "An app's login or saved data disappeared after months of not opening it.",
      fix: "Check if it was archived rather than uninstalled — tapping its icon restores the app and its data from the Play Store.",
    },
    {
      issue: "A frequently used app keeps losing permissions unexpectedly.",
      fix: "Open that app at least occasionally, or manually re-enable its permissions in App info if it's incorrectly flagged as unused.",
    },
  ],
  faqs: [
    {
      q: "Is archiving the same as uninstalling?",
      a: "No, archiving keeps the app's data and icon in place and only removes the larger installable files, making it much faster to restore than a full reinstall.",
    },
    {
      q: "Can I stop a specific app from ever being archived?",
      a: "Yes, you can exclude individual apps from auto-archiving in Unused apps settings or the app's Play Store page.",
    },
  ],
  tipsAndTricks: [
    "Check Settings > Apps > Unused apps periodically to manually archive large apps yourself and free storage before Android does it automatically.",
  ],
  relatedSettingIds: ["android-app-permissions", "android-storage-cleanup", "android-app-info"],
  afterImageContent: {
    heading: "How Unused Apps Works",
    paragraphs: [
      "Android tracks how recently each app was opened and, after an extended period of inactivity, first revokes its sensitive permissions as a privacy precaution before eventually offering to archive it to save space.",
      "An archived app isn't gone — it keeps its place on your home screen and its saved data, but Android removes the larger executable files, restoring them automatically the moment you tap the icon again.",
    ],
    steps: [
      "Open Settings > Apps, then tap 'Unused apps' or check the option under an app's App info.",
      "Review which apps are eligible for archiving or have had permissions removed.",
      "Manually archive a specific app if you'd like to save space right away.",
      "Tap an archived app's icon anytime to restore it automatically.",
    ],
  },
},
{
  id: "android-clone-apps",
  title: "Dual Apps",
  icon: Copy,
  platform: "android",
  category: "apps-features",
  controlType: "action",
  actionLabel: "Set Up Dual Apps",
  heading: "Run two accounts of the same app",
  description:
    "Dual apps (branded Dual Messenger on Samsung, App Cloner or Parallel Space on others) creates a second, independent instance of a supported app so you can stay signed into two accounts — like two WhatsApp numbers — on one phone at once.",
  details: [
    "Each cloned app gets its own separate storage, notifications, and icon, distinguished with a small badge.",
    "Common candidates are messaging and social apps such as WhatsApp, Facebook, and Messenger.",
    "Cloned apps show up as a duplicate icon on the home screen alongside the original.",
    "Removing a cloned app deletes only that instance's data, leaving the original app untouched.",
  ],
  important:
    "This is a manufacturer feature, not part of stock Android — the menu name, location, and exact list of supported apps vary by brand (Samsung's is called Dual Messenger, found under Settings > Advanced features).",
  redirectUrl: "https://support.google.com/android",
  whyItMatters:
    "Dual apps lets people juggling a personal and work number, or multiple social accounts, avoid constantly logging in and out of the same app.",
  bestPractices: [
    "Only clone apps you actually need two active accounts for, since each instance keeps running in the background and uses extra memory and battery.",
    "Label or re-badge the cloned icon if your phone allows it, to avoid mixing up which account you're opening.",
    "Remove a cloned app you no longer use to reclaim the storage and background resources it holds.",
  ],
  commonIssues: [
    {
      issue: "The Dual apps / Dual Messenger feature isn't available for a specific app.",
      fix: "Not every app is supported for cloning; check the manufacturer's list of compatible apps, which is usually limited to major messaging and social apps.",
    },
    {
      issue: "Notifications from the cloned app don't distinguish it from the original.",
      fix: "Check the cloned instance's icon badge and notification channel in App info, and rename the clone if your device allows it.",
    },
  ],
  faqs: [
    {
      q: "Is this the same on every Android phone?",
      a: "No, it's an OEM add-on — Samsung calls it Dual Messenger, other brands use names like App Cloner or Parallel Space, and stock/Pixel Android doesn't include it natively.",
    },
    {
      q: "Do both app instances need separate phone numbers?",
      a: "For apps like WhatsApp that tie an account to a phone number, yes — you'll need a second number or a service that provides one for the cloned account.",
    },
  ],
  tipsAndTricks: [
    "If your phone lacks a built-in dual-app feature, a work profile (Settings > Accounts) can achieve a similar result for many apps.",
  ],
  relatedSettingIds: ["android-multiple-users", "android-app-info", "android-home-screen-launcher"],
  afterImageContent: {
    heading: "How Dual Apps Works",
    paragraphs: [
      "Manufacturers implement dual apps by running a second, sandboxed copy of the app's code with its own private storage space, so the two instances never share login sessions, messages, or files.",
      "From the user's perspective this just looks like a second icon, but under the hood Android treats the clone as a separate app package with its own permissions and notification settings that you manage independently.",
    ],
    steps: [
      "Open Settings and search for Dual apps, Dual Messenger, or App cloning (naming varies by brand).",
      "Browse the list of apps eligible for cloning.",
      "Toggle on the app you want a second instance of.",
      "Find the new cloned icon on your home screen and sign in with a different account.",
    ],
  },
},
{
  id: "android-google-photos-backup",
  title: "Google Photos Backup",
  icon: ImagePlus,
  platform: "android",
  category: "storage-backup-data",
  frequentlyUsed: true,
  recommended: true,
  controlType: "action",
  actionLabel: "Open Backup Settings",
  heading: "Auto-back up photos and videos",
  description:
    "Google Photos backup automatically uploads your camera roll to your Google Account, so photos and videos survive a lost, broken, or replaced phone and stay accessible across all your devices.",
  details: [
    "Backup quality options include Storage saver (compressed) and Original quality (full resolution, counted against your Google storage).",
    "You can choose to back up over Wi-Fi only or also allow it on mobile data.",
    "Specific folders (like screenshots or a messaging app's media folder) can be included or excluded individually.",
    "A backup status indicator in the app shows whether everything is fully synced or still uploading.",
  ],
  important:
    "Original-quality backups count against your Google Account storage quota, and running out of space will pause backup until you free up room or upgrade your plan.",
  redirectUrl: "https://support.google.com/photos/answer/6193313?hl=en",
  whyItMatters:
    "Phones get lost, stolen, or damaged far more often than people expect, and unbacked-up photos are one of the most painful, unrecoverable losses when that happens.",
  bestPractices: [
    "Confirm backup status shows fully synced (not just 'backing up') before deleting any photos from the device to save space.",
    "Choose Wi-Fi-only backup if you have a limited mobile data plan, and let it catch up whenever you're on Wi-Fi.",
    "Review excluded folders occasionally to make sure a folder you care about wasn't accidentally left out.",
  ],
  commonIssues: [
    {
      issue: "Backup is stuck at 'Waiting for Wi-Fi' even though Wi-Fi is connected.",
      fix: "Check the backup settings to confirm mobile data isn't required, or temporarily allow mobile data backup to clear the queue.",
    },
    {
      issue: "Google Account storage is full and backup has paused.",
      fix: "Free up space by managing storage in Google Photos, delete large items no longer needed, or upgrade to a paid Google One plan.",
    },
  ],
  faqs: [
    {
      q: "Does backing up delete photos from my phone?",
      a: "No, backup just uploads a copy to your Google Account — photos stay on your device until you manually free up space by removing already-backed-up items.",
    },
    {
      q: "Can I back up videos as well as photos?",
      a: "Yes, video backup works the same way as photo backup and follows the same quality and network settings.",
    },
  ],
  tipsAndTricks: [
    "Use the 'Free up space' option inside Google Photos to safely remove only photos already confirmed backed up, in a single tap.",
  ],
  relatedSettingIds: ["android-backup-restore", "android-storage-cleanup", "android-files-by-google"],
  afterImageContent: {
    heading: "How Google Photos Backup Works",
    paragraphs: [
      "Once enabled, Google Photos continuously watches your camera roll (and any other selected folders) and uploads new items in the background whenever your chosen network conditions — Wi-Fi only, or Wi-Fi plus mobile data — are met.",
      "Backed-up items sync to your Google Account and become available in Google Photos on any device you sign into, while Storage saver mode compresses files slightly to reduce how much of your quota each item uses.",
    ],
    steps: [
      "Open the Google Photos app and tap your profile photo.",
      "Tap Photos settings > Back up & sync.",
      "Turn on Back up & sync and choose a backup quality.",
      "Set whether backup can use mobile data, or restrict it to Wi-Fi only.",
    ],
  },
},
{
  id: "android-files-by-google",
  title: "Files by Google",
  icon: FolderSearch,
  platform: "android",
  category: "storage-backup-data",
  controlType: "action",
  actionLabel: "Open Files by Google",
  heading: "Browse files and free up space",
  description:
    "Files by Google is Android's built-in file manager, letting you browse, search, and organize files on your device, plus a Clean tool that surfaces junk files, duplicate photos, and unused apps you can remove in a couple of taps.",
  details: [
    "The Clean tab scans for cache files, duplicate photos, memes, screenshots, and old downloads.",
    "The Browse tab lets you navigate storage by category (Images, Videos, Documents, Apps) or by folder.",
    "Files can be shared offline to nearby devices without internet or mobile data using a built-in nearby-sharing feature.",
    "A Backup section can send selected files or photos directly to Google Drive or Google Photos.",
  ],
  important:
    "Deletions made through the Clean tool are generally permanent, so double-check duplicate-photo and screenshot suggestions before confirming.",
  redirectUrl: "https://support.google.com/files",
  whyItMatters:
    "Most people don't realize how much space downloads, duplicate images, and forwarded media quietly consume, and this app is one of the fastest ways to find and clear it without hunting through folders manually.",
  bestPractices: [
    "Review the Clean tab's suggestions before confirming a bulk delete, since duplicate detection isn't always perfect.",
    "Use the Browse tab's storage-category view to spot which type of file (video, apps, documents) is eating the most space.",
    "Take advantage of offline file sharing when transferring large files to a nearby phone without using mobile data.",
  ],
  commonIssues: [
    {
      issue: "The Clean tool suggests deleting files that are actually still needed.",
      fix: "Uncheck any suggested item before confirming — the suggestions are heuristic-based and not always accurate for every user.",
    },
    {
      issue: "Files by Google isn't preinstalled on the device.",
      fix: "Download it free from the Google Play Store; it's optional on some phones though preinstalled on many.",
    },
  ],
  faqs: [
    {
      q: "Is Files by Google the same as a phone's default file manager?",
      a: "On many phones it is preinstalled as the default, but manufacturers like Samsung also ship their own file manager, so both can be present.",
    },
    {
      q: "Does the Clean tool delete photos backed up to Google Photos?",
      a: "It can suggest removing device copies of backed-up media, but it typically flags them separately from files that have no backup at all.",
    },
  ],
  tipsAndTricks: [
    "Use the in-app offline sharing feature to transfer large files to a nearby phone at high speed without spending any mobile data.",
  ],
  relatedSettingIds: ["android-storage-cleanup", "android-google-photos-backup", "android-sd-card-storage"],
  afterImageContent: {
    heading: "How Files by Google Works",
    paragraphs: [
      "The app scans your device's storage and categorizes what it finds — junk, duplicates, large files, unused apps — presenting each category with a one-tap way to review and remove exactly what you choose.",
      "Its Browse section works like a traditional file manager, letting you dig into folders directly, while its nearby-sharing feature uses a peer-to-peer connection to move files between two phones quickly without any internet connection.",
    ],
    steps: [
      "Open the Files by Google app (or install it from Play Store).",
      "Tap the Clean tab to review junk files, duplicates, and cleanup suggestions.",
      "Select the items you want to remove and confirm deletion.",
      "Use the Browse tab to navigate storage manually by folder or file type.",
    ],
  },
},
{
  id: "android-sd-card-storage",
  title: "SD Card Storage",
  icon: MemoryStick,
  platform: "android",
  category: "storage-backup-data",
  controlType: "action",
  actionLabel: "Manage SD Card",
  heading: "Format and manage a microSD card",
  description:
    "SD card storage settings let you choose how a microSD card is used — as portable storage for easily removable files, or formatted as internal storage that extends the phone's built-in space (adoptable storage).",
  details: [
    "Portable storage keeps the card readable in other devices like cameras or computers.",
    "Adoptable/internal storage encrypts and formats the card so it's treated as part of the phone's internal storage, and apps can be installed to it.",
    "The Storage settings screen shows the SD card as a separate entry with its own used/free breakdown.",
    "'Eject' safely disconnects the card before physical removal to avoid data corruption.",
  ],
  important:
    "A card formatted as internal (adoptable) storage is tied to that specific phone and generally can't be read in another device without reformatting, which erases its contents.",
  redirectUrl: "https://support.google.com/android",
  whyItMatters:
    "Choosing the right SD card mode up front avoids a painful surprise later — the wrong choice can mean losing the ability to move files to a computer, or losing all data if the card needs to be reformatted after the fact.",
  bestPractices: [
    "Choose portable storage if you'll ever want to read the card in a camera, computer, or another phone.",
    "Choose adoptable/internal storage only if you mainly want more app-install space and won't need to remove the card often.",
    "Always use 'Eject' before physically removing the card to avoid corrupting files mid-write.",
  ],
  commonIssues: [
    {
      issue: "The phone doesn't recognize a newly inserted SD card.",
      fix: "Reseat the card, try it in another device to confirm it isn't faulty, and check it's formatted in a filesystem the phone supports (usually exFAT or FAT32).",
    },
    {
      issue: "Apps set to install to the SD card stop working after the card is removed.",
      fix: "This happens with adoptable storage since apps and data can live partly on the card; reinsert the same card or move the apps back to internal storage first.",
    },
  ],
  faqs: [
    {
      q: "Can I switch a card from portable to internal storage later?",
      a: "Yes, but doing so reformats the card and erases its existing contents, so back up any files first.",
    },
    {
      q: "Do all Android phones support SD cards?",
      a: "No, many modern phones (including most Pixels) don't have an SD card slot at all — check your specific model.",
    },
  ],
  tipsAndTricks: [
    "Back up an SD card's contents to a computer or cloud storage before switching its format, since the switch always wipes the card.",
  ],
  relatedSettingIds: ["android-storage-cleanup", "android-files-by-google", "android-backup-restore"],
  afterImageContent: {
    heading: "How SD Card Storage Works",
    paragraphs: [
      "When you insert a microSD card, Android asks whether to use it as portable storage (simple, removable, cross-device compatible) or set it up as internal storage, which encrypts and formats the card to work as an extension of the phone's built-in memory.",
      "Internal/adoptable storage lets apps be installed directly onto the card and treats it as part of total device storage in the Storage settings breakdown, while portable storage keeps it as a clearly separate, removable drive.",
    ],
    steps: [
      "Insert the microSD card and tap the notification that appears, or go to Settings > Storage.",
      "Tap the SD card entry.",
      "Choose 'Use as portable storage' or 'Format as internal storage'.",
      "Follow the on-screen prompts to complete formatting, then tap Eject before removing the card physically.",
    ],
  },
},
{
  id: "android-talkback",
  title: "TalkBack",
  icon: Ear,
  platform: "android",
  category: "accessibility-language",
  controlType: "action",
  actionLabel: "Turn On TalkBack",
  heading: "Screen reader for blind and low-vision users",
  description:
    "TalkBack is Android's built-in screen reader, describing what's on screen out loud and letting you navigate the entire phone using gestures and audio feedback instead of relying on sight.",
  details: [
    "Swipe gestures move focus between items on screen, with TalkBack reading each one aloud as you go.",
    "A double-tap activates whatever is currently focused, replacing a normal single tap.",
    "Braille display support connects external braille hardware over Bluetooth or USB.",
    "A customizable volume-key or gesture shortcut can turn TalkBack on or off quickly.",
  ],
  important:
    "Once TalkBack is on, normal tap gestures change behavior (a single tap selects rather than activates), which takes some adjustment even for sighted users testing it.",
  redirectUrl: "https://support.google.com/accessibility/android/answer/6283677?hl=en",
  whyItMatters:
    "For blind and low-vision users, TalkBack is often the only way to use a touchscreen phone independently, making it one of the most consequential accessibility features Android ships with.",
  bestPractices: [
    "Learn the basic gesture set (swipe to navigate, double-tap to activate) before relying on TalkBack for daily use.",
    "Set up the volume-key shortcut so TalkBack can be toggled quickly without needing to see the screen.",
    "Use the TalkBack tutorial built into the app to practice gestures in a safe, guided environment first.",
  ],
  commonIssues: [
    {
      issue: "TalkBack was turned on accidentally and normal taps stopped working as expected.",
      fix: "Press and hold both volume keys for a few seconds (if the shortcut is enabled), or go to Settings > Accessibility > TalkBack and turn it off.",
    },
    {
      issue: "Some apps are hard to navigate with TalkBack.",
      fix: "This usually means the app hasn't fully implemented accessibility labels; report it to the app developer, and try the app's web version as a workaround if available.",
    },
  ],
  faqs: [
    {
      q: "Does TalkBack work in every app?",
      a: "It works system-wide, but how well it works in a specific app depends on whether that app's developer implemented proper accessibility labeling.",
    },
    {
      q: "Can sighted users turn TalkBack off if it's enabled by mistake?",
      a: "Yes, holding both volume keys (if the shortcut is set up) or going through Settings > Accessibility turns it off just as easily as turning it on.",
    },
  ],
  tipsAndTricks: [
    "Use two-finger swipes to scroll through long lists faster while TalkBack is active, instead of single-finger navigation item by item.",
  ],
  relatedSettingIds: ["android-accessibility", "android-magnification", "android-live-caption"],
  afterImageContent: {
    heading: "How TalkBack Works",
    paragraphs: [
      "TalkBack intercepts your touch input and converts it into an exploration mode: instead of tapping something to open it directly, you touch or swipe to move a focus indicator, and TalkBack speaks aloud whatever is currently focused.",
      "A separate gesture — typically a double-tap anywhere on the screen — activates whatever item currently has focus, effectively replacing the single-tap gesture sighted users rely on.",
    ],
    steps: [
      "Open Settings > Accessibility > TalkBack.",
      "Turn on the TalkBack toggle and confirm in the dialog that appears.",
      "Complete the built-in tutorial to practice core gestures.",
      "Set up a volume-key shortcut so TalkBack can be toggled without navigating menus.",
    ],
  },
},
{
  id: "android-magnification",
  title: "Magnification",
  icon: ZoomIn,
  platform: "android",
  category: "accessibility-language",
  controlType: "action",
  actionLabel: "Open Magnification",
  heading: "Zoom in on the screen",
  description:
    "Magnification lets low-vision users zoom into any part of the screen using a shortcut gesture or button, temporarily or persistently enlarging content system-wide, independent of any single app's own zoom controls.",
  details: [
    "Triple-tapping the screen (if enabled) toggles magnification on and off instantly.",
    "A floating magnification button can be added for one-tap access without a gesture.",
    "You can pan around the zoomed area by dragging with two fingers while magnified.",
    "Magnification can be excluded from the keyboard and navigation bar to keep typing usable.",
  ],
  important:
    "Magnification zooms the whole screen rendering, which is different from an individual app's pinch-to-zoom on just its content.",
  redirectUrl: "https://support.google.com/accessibility/android",
  whyItMatters:
    "For users with low vision who don't need a full screen reader, magnification offers an independent way to read small text and interact with fine UI elements without switching to TalkBack.",
  bestPractices: [
    "Set up the triple-tap shortcut for the fastest way to toggle magnification on and off.",
    "Use the floating button option instead if triple-tap accidentally triggers during normal use.",
    "Practice panning with two fingers while zoomed in, since dragging works differently than normal scrolling.",
  ],
  commonIssues: [
    {
      issue: "Triple-tapping accidentally zooms the screen during normal use.",
      fix: "Switch the magnification trigger from triple-tap to the floating button in Accessibility settings to avoid accidental activation.",
    },
    {
      issue: "The keyboard becomes hard to use while magnified.",
      fix: "Enable the option to exclude the keyboard from magnification so typing stays at normal size even while the rest of the screen is zoomed.",
    },
  ],
  faqs: [
    {
      q: "Is magnification the same as increasing font size?",
      a: "No, font size only enlarges text, while magnification zooms the entire screen image, including images, icons, and buttons.",
    },
    {
      q: "Can I use magnification temporarily without leaving it on?",
      a: "Yes, a triple-tap-and-hold gesture lets you zoom in only while your finger is down, returning to normal size when you lift it.",
    },
  ],
  tipsAndTricks: [
    "Use two fingers to pinch while already magnified to adjust the zoom level continuously, rather than toggling on and off repeatedly.",
  ],
  relatedSettingIds: ["android-accessibility", "android-talkback", "android-display-dark-mode"],
  afterImageContent: {
    heading: "How Magnification Works",
    paragraphs: [
      "Magnification renders an enlarged view of a region of the screen on top of the normal display, letting you pan around the zoomed area with two-finger drags to reach different parts of the underlying content.",
      "Because it works at the system level rather than inside a single app, magnification is available everywhere on the phone — home screen, settings, browser, and third-party apps alike — regardless of whether that app has its own zoom feature.",
    ],
    steps: [
      "Open Settings > Accessibility > Magnification.",
      "Choose a shortcut, such as triple-tap the screen or tap the accessibility button.",
      "Turn on 'Magnify screen' and trigger the shortcut to test it.",
      "Adjust whether the keyboard and navigation bar are excluded from magnification.",
    ],
  },
},
{
  id: "android-live-caption",
  title: "Live Caption",
  icon: Captions,
  platform: "android",
  category: "accessibility-language",
  controlType: "action",
  actionLabel: "Turn On Live Caption",
  heading: "Automatic captions for any audio",
  description:
    "Live Caption automatically generates real-time captions for videos, podcasts, voice messages, and calls playing on the device — entirely on-device, without needing an internet connection or the media having built-in subtitles.",
  details: [
    "Works across nearly any app playing audio, not just video apps — including voice messages and games.",
    "Captions can be moved anywhere on screen and resized to a preferred text size.",
    "Live Caption can optionally caption phone calls in supported regions and devices.",
    "Profanity can be filtered from generated captions with a toggle.",
  ],
  important:
    "Live Caption captions everything algorithmically on-device, so accuracy varies with audio quality and background noise, and it isn't a substitute for professionally produced subtitles.",
  redirectUrl: "https://support.google.com/accessibility/android",
  whyItMatters:
    "Live Caption makes ordinary media instantly more accessible for deaf and hard-of-hearing users, and it's also genuinely useful for anyone watching something without sound in a quiet or loud environment.",
  bestPractices: [
    "Enable the volume-button shortcut so captions can be toggled quickly whenever needed.",
    "Reposition the caption box away from important on-screen content like video controls or subtitles already provided by an app.",
    "Turn on caption for calls if available on your device and carrier for added accessibility during phone calls.",
  ],
  commonIssues: [
    {
      issue: "Captions don't appear for a specific app's audio.",
      fix: "Confirm Live Caption is turned on and the media volume isn't muted, since Live Caption relies on the audio stream actually playing.",
    },
    {
      issue: "Captions are noticeably inaccurate for a video.",
      fix: "This is more likely with heavy background music, multiple speakers, or strong accents; there's no manual correction, but built-in app subtitles (if available) will usually be more accurate.",
    },
  ],
  faqs: [
    {
      q: "Does Live Caption require an internet connection?",
      a: "No, captions are generated entirely on-device using local speech recognition, so it works even in airplane mode.",
    },
    {
      q: "Does Live Caption work with all languages?",
      a: "Language support varies by device and Android version — check Live Caption settings for the list of currently supported languages on your phone.",
    },
  ],
  tipsAndTricks: [
    "Press and hold a volume button, then tap the Live Caption icon that appears, for a quick one-handed toggle without opening Settings.",
  ],
  relatedSettingIds: ["android-accessibility", "android-talkback", "android-sound-vibration"],
  afterImageContent: {
    heading: "How Live Caption Works",
    paragraphs: [
      "Live Caption runs a compact, on-device speech-recognition model that listens to whatever audio the phone is currently playing and converts it into text captions overlaid near the bottom of the screen in real time.",
      "Because processing happens locally rather than over the internet, captions appear with minimal delay and continue to work without a data or Wi-Fi connection, though supported languages and accuracy depend on the on-device model available for your phone.",
    ],
    steps: [
      "Open Settings > Accessibility > Live Caption.",
      "Turn on the Live Caption toggle.",
      "Play any audio or video — a caption box appears automatically near the bottom of the screen.",
      "Drag the caption box to reposition it, or tap its settings icon to adjust size and filtering.",
    ],
  },
},
{
  id: "android-security-patch-level",
  title: "Security Patch Level",
  icon: ShieldCheck,
  platform: "android",
  category: "system-updates",
  recommended: true,
  controlType: "action",
  actionLabel: "View Security Patch Date",
  heading: "Check your monthly security patch date",
  description:
    "The security patch level shows the exact month a device's known vulnerability fixes were last updated — a separate, more frequent indicator than the overall Android version number.",
  details: [
    "Located under About phone > Android version, listed as 'Android security update' or 'Security patch level'.",
    "Patch dates are typically monthly, independent of full Android version upgrades.",
    "A patch level older than a few months can indicate a device has stopped receiving regular security updates.",
    "Manufacturers publish official end-of-support dates specifying how long security patches will continue for a given model.",
  ],
  important:
    "A recent Android version number doesn't guarantee a recent security patch — always check the security patch date itself if you're evaluating a device's protection level.",
  redirectUrl: "https://support.google.com/android/answer/7680439?hl=en",
  whyItMatters:
    "The security patch level is the clearest single indicator of whether a phone is still protected against publicly known vulnerabilities, which matters enormously for banking, work, and personal data safety.",
  bestPractices: [
    "Check the security patch date whenever considering a used or older phone purchase.",
    "Compare the current patch date against the manufacturer's published support end date for your model.",
    "Install available security updates promptly rather than deferring them for weeks.",
  ],
  commonIssues: [
    {
      issue: "The security patch date hasn't changed in several months.",
      fix: "Manually check for updates in Settings > System > System update; if none are available, the device may have reached its manufacturer's end-of-support date.",
    },
    {
      issue: "Two phones with the same Android version show different patch dates.",
      fix: "This is normal — patch rollout timing varies by manufacturer and carrier even for the same Android version.",
    },
  ],
  faqs: [
    {
      q: "Where exactly do I find this on my phone?",
      a: "Go to Settings > About phone > Android version, where the security patch date is listed alongside the Android version number.",
    },
    {
      q: "How often should the security patch level update?",
      a: "Ideally monthly, though the exact cadence depends on the manufacturer; some budget devices update quarterly instead.",
    },
  ],
  tipsAndTricks: [
    "Search your exact phone model plus 'security update end date' on the manufacturer's site to know precisely how long you'll keep receiving patches.",
  ],
  relatedSettingIds: ["android-system-update", "android-play-system-update", "android-about-phone"],
  afterImageContent: {
    heading: "How Security Patch Level Works",
    paragraphs: [
      "Google publishes monthly Android Security Bulletins describing newly fixed vulnerabilities, and manufacturers then package the relevant fixes for each device model, stamping the result with the bulletin's month as the security patch level.",
      "This patch level updates independently of full Android version upgrades, meaning a phone can still receive monthly security fixes for a period even after it stops receiving new feature updates.",
    ],
    steps: [
      "Open Settings and scroll to About phone.",
      "Tap Android version.",
      "Locate the 'Android security update' or 'Security patch level' entry.",
      "Compare the date shown against your manufacturer's published support timeline for your model.",
    ],
  },
},
{
  id: "android-carrier-updates",
  title: "Carrier Software Updates",
  icon: Signal,
  platform: "android",
  category: "system-updates",
  controlType: "action",
  actionLabel: "Check Carrier Updates",
  heading: "Carrier-specific firmware and profile updates",
  description:
    "Carrier software updates deliver network-specific fixes — like updated cellular radio firmware, VoLTE/Wi-Fi calling profiles, or APN settings — separately from the general Android operating-system update process.",
  details: [
    "Often found under Settings > About phone > Carrier updates, or triggered automatically after inserting a new SIM.",
    "These updates typically don't change the Android version or add new features.",
    "Carrier updates can fix issues like dropped calls, missing VoLTE, or incorrect data/APN behavior specific to a network.",
    "Some carrier profile updates install silently in the background without a visible prompt.",
  ],
  important:
    "The exact menu location and name for carrier updates vary significantly by manufacturer and carrier, and some devices don't expose a manual check at all.",
  redirectUrl: "https://support.google.com/android",
  whyItMatters:
    "Without an up-to-date carrier profile, features like Wi-Fi calling, VoLTE HD voice, or visual voicemail can silently stop working even though the phone's core Android software is current.",
  bestPractices: [
    "Check for a manual 'Carrier updates' option after switching SIM cards or carriers.",
    "Restart the phone after inserting a new SIM to help trigger an automatic profile check.",
    "If call quality or Wi-Fi calling issues appear after a carrier switch, look here before assuming it's a hardware problem.",
  ],
  commonIssues: [
    {
      issue: "Wi-Fi calling or VoLTE isn't available after switching to a new carrier.",
      fix: "Check for a carrier settings update in About phone, restart the device, and confirm the SIM/eSIM is fully activated with the new carrier.",
    },
    {
      issue: "No 'Carrier update' option appears in Settings at all.",
      fix: "Not every manufacturer exposes a manual check; carrier profile updates on those devices install automatically and can't be triggered by the user directly.",
    },
  ],
  faqs: [
    {
      q: "Is a carrier update the same as a system update?",
      a: "No, system updates come from Google/the manufacturer and change Android itself, while carrier updates come from the network operator and adjust network-specific settings.",
    },
    {
      q: "Do I need to do anything after switching SIM cards?",
      a: "Usually not — most phones automatically fetch the new carrier's profile, though a restart can help if features like Wi-Fi calling don't appear right away.",
    },
  ],
  tipsAndTricks: [
    "If a specific carrier feature (like Wi-Fi calling) is missing after a SIM swap, toggling Airplane mode on and off can prompt the phone to re-check for a carrier profile.",
  ],
  relatedSettingIds: ["android-system-update", "android-play-system-update", "android-hotspot-tethering"],
  afterImageContent: {
    heading: "How Carrier Updates Work",
    paragraphs: [
      "Mobile carriers periodically publish small configuration and firmware packages tailored to their own network, covering things like VoLTE/Wi-Fi calling settings, APNs, and cellular radio behavior.",
      "These packages are separate from Google's or the manufacturer's Android OS updates and are typically pushed automatically when the phone detects a new SIM or periodically checks in with the carrier's provisioning servers.",
    ],
    steps: [
      "Open Settings > About phone.",
      "Look for 'Carrier updates' or a similarly named option (varies by manufacturer).",
      "Tap to manually check for an available update.",
      "Restart the phone if a new SIM was recently inserted and features seem missing.",
    ],
  },
},
{
  id: "android-play-system-update",
  title: "Google Play System Update",
  icon: RefreshCw,
  platform: "android",
  category: "system-updates",
  controlType: "action",
  actionLabel: "Check Play System Update",
  heading: "Monthly updates delivered via Play Store",
  description:
    "Google Play system update (Project Mainline) delivers security and consistency fixes to core Android components through the Play Store itself, letting Google patch critical system modules on a monthly cadence without waiting for a full manufacturer OS update.",
  details: [
    "Found under Settings > Security (or About phone) > Google Play system update, showing the current update's date.",
    "Covers modules like media codecs, permissions, and networking components that Google can update independently of the OS.",
    "Installs largely in the background and typically requires only a restart to finish applying.",
    "Runs alongside, not instead of, the manufacturer's regular full system updates.",
  ],
  important:
    "A recent Play system update date doesn't mean the full OS is current — check System update separately for the broader Android version and manufacturer patches.",
  redirectUrl: "https://support.google.com/android/answer/7680439?hl=en",
  whyItMatters:
    "Project Mainline lets Google patch some of the most safety-critical parts of Android directly, shrinking the historically long delay between a vulnerability being found and a fix actually reaching phones.",
  bestPractices: [
    "Check this date periodically alongside the regular system update, since the two are tracked separately.",
    "Restart your phone after a Play system update finishes downloading so it fully takes effect.",
    "Don't assume a current Play system update date means the whole OS is fully patched — check both.",
  ],
  commonIssues: [
    {
      issue: "The Play system update date looks outdated even though the phone was recently restarted.",
      fix: "Open Settings > Security > Google Play system update and tap Check for update, since it doesn't always show automatically on the home screen.",
    },
    {
      issue: "It's unclear whether this is the same as a regular system update.",
      fix: "It isn't — Play system update covers a specific subset of Google-controlled modules, while system update covers the full manufacturer-built OS image.",
    },
  ],
  faqs: [
    {
      q: "Do I need to do anything to get these updates?",
      a: "No, they typically download and apply automatically in the background; a restart just finalizes the process.",
    },
    {
      q: "Why does Google update this separately instead of through the normal OS update?",
      a: "It lets Google fix critical, well-isolated components across supporting Android devices quickly, without needing every manufacturer to build and test a full OS update first.",
    },
  ],
  tipsAndTricks: [
    "If an app suddenly has a media playback or permissions bug, checking whether a Play system update is pending is a quick first troubleshooting step.",
  ],
  relatedSettingIds: ["android-system-update", "android-security-patch-level", "android-carrier-updates"],
  afterImageContent: {
    heading: "How Google Play System Update Works",
    paragraphs: [
      "Certain core Android components are packaged as independently updatable modules through Project Mainline, letting Google push fixes to them directly via the Play Store, similar to how an app updates, rather than through a full device OS image.",
      "Because these modules are isolated from the rest of the OS, Google can test and release fixes faster and roll them out to eligible devices across many manufacturers simultaneously, closing security gaps well ahead of the next full system update.",
    ],
    steps: [
      "Open Settings > Security (or About phone on some devices).",
      "Tap Google Play system update.",
      "Tap Check for update to see if a new module set is available.",
      "Restart the device if prompted to finish applying it.",
    ],
  },
},
{
  id: "android-diagnostics-repair-tool",
  title: "Phone Diagnostics",
  icon: Activity,
  platform: "android",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  actionLabel: "Run Phone Diagnostics",
  heading: "Test hardware like screen, sensors, speakers",
  description:
    "Phone diagnostics tools — built into some manufacturers' software or provided by your carrier — run guided tests on hardware components like the touchscreen, speakers, cameras, sensors, and buttons to confirm they're working correctly.",
  details: [
    "Samsung Members, carrier apps (like AT&T's or Verizon's), and dialer codes are common ways to access diagnostics on different phones.",
    "Tests typically walk through touch response, display dead pixels, speaker/microphone, vibration, sensors, and connectivity one at a time.",
    "Some tools generate a shareable report useful for warranty or insurance claims.",
    "A basic diagnostic set is often accessible by dialing a manufacturer-specific test code in the phone app.",
  ],
  important:
    "There's no single universal diagnostics menu across all Android phones — availability and access method depend entirely on your manufacturer and carrier.",
  redirectUrl: "https://support.google.com/android",
  whyItMatters:
    "Running a structured hardware test can confirm whether a problem (like a black spot on screen or a quiet speaker) is a real hardware fault before you spend time on software fixes or take the phone in for repair.",
  bestPractices: [
    "Run a full diagnostic test right after buying a new or refurbished phone to catch defects within the return window.",
    "Save or screenshot a diagnostic report before a warranty or insurance claim, since some programs ask for proof of the issue.",
    "Test one suspected component in isolation (like just the speaker) rather than assuming a full diagnostic sweep is needed for a narrow issue.",
  ],
  commonIssues: [
    {
      issue: "Can't find a diagnostics menu on the phone at all.",
      fix: "Check whether your manufacturer offers a dedicated app (like Samsung Members) or search your carrier's support site for a device-specific diagnostic tool.",
    },
    {
      issue: "A diagnostic test reports a hardware failure.",
      fix: "Save the report and contact your manufacturer or carrier's support for repair or warranty options — this isn't something a software fix can resolve.",
    },
  ],
  faqs: [
    {
      q: "Does every Android phone have a built-in diagnostics tool?",
      a: "No, availability varies — some manufacturers bundle one, others rely on carrier apps or dial codes, and a few phones have no dedicated tool at all.",
    },
    {
      q: "Can diagnostics fix a hardware problem?",
      a: "No, diagnostics only identify and report issues; actual repairs need a manufacturer service center, authorized repair shop, or warranty claim.",
    },
  ],
  tipsAndTricks: [
    "Search '[your phone model] hardware test' online to find the specific dial code or app your manufacturer uses, since it isn't standardized across brands.",
  ],
  relatedSettingIds: ["android-battery-usage-troubleshoot", "android-recovery-safe-mode", "android-about-phone"],
  afterImageContent: {
    heading: "How Phone Diagnostics Works",
    paragraphs: [
      "A diagnostics tool runs a guided sequence of tests against individual hardware components, prompting you to tap patterns on the screen, listen for tones, or check that sensors respond, then reports pass or fail results for each.",
      "Because there's no single Android-wide standard for this, manufacturers and carriers each build their own version, ranging from a simple dial-code menu to a polished app with a saved history of past test results.",
    ],
    steps: [
      "Look for a manufacturer app such as Samsung Members, or check your carrier's support app for a diagnostics tool.",
      "Alternatively, search for your model's manufacturer test/dial code.",
      "Run through the guided tests for screen, speakers, sensors, and buttons.",
      "Save or screenshot the report if you need it for a warranty or repair claim.",
    ],
  },
},
{
  id: "android-send-feedback",
  title: "Send Feedback",
  icon: MessageSquare,
  platform: "android",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  actionLabel: "Send Feedback to Google",
  heading: "Report a bug directly to Google",
  description:
    "Send feedback lets you report a problem straight to Google (or an app's own developers) with an automatically attached diagnostic report and, optionally, a screenshot with areas you can highlight or blur out.",
  details: [
    "Accessible from Settings > About phone/System > Send feedback, or from within many individual Google apps.",
    "Automatically includes device information and relevant logs to help engineers diagnose the issue.",
    "A built-in screenshot annotation tool lets you circle the problem area or blur out personal information before sending.",
    "Feedback submitted this way generally isn't answered individually, but feeds into bug-fixing priorities.",
  ],
  important:
    "Feedback reports are used to identify and prioritize fixes, not as a direct support channel — for account-specific help, use the relevant app's support contact instead.",
  redirectUrl: "https://support.google.com/android",
  whyItMatters:
    "Detailed, diagnostic-attached feedback is one of the main ways Google identifies real-world bugs that don't show up in internal testing, making it a genuinely useful channel rather than a void.",
  bestPractices: [
    "Describe exactly what you were doing when the problem happened, since the automatic logs alone often aren't enough context.",
    "Blur out any personal information visible in an attached screenshot before submitting.",
    "Send feedback as soon as possible after a bug occurs, while the relevant logs are still fresh on the device.",
  ],
  commonIssues: [
    {
      issue: "Feedback was submitted but the issue was never fixed or acknowledged.",
      fix: "Individual feedback reports aren't usually answered directly; they're aggregated with similar reports, so recurring, detailed submissions are more likely to influence a fix.",
    },
    {
      issue: "Can't find the Send feedback option for a specific app.",
      fix: "Many apps place it under their own Settings or Help menu rather than the system-wide one — check that app's own settings screen.",
    },
  ],
  faqs: [
    {
      q: "Does this replace contacting customer support?",
      a: "No, it's meant for reporting bugs to engineering teams, not for account, billing, or personal support issues, which have their own dedicated contact channels.",
    },
    {
      q: "Is any personal data sent automatically?",
      a: "Device and diagnostic logs are attached automatically, but you control whether to include a screenshot and can blur sensitive areas before sending.",
    },
  ],
  tipsAndTricks: [
    "Use the built-in blur tool on the screenshot before sending if the bug involves a screen showing personal messages or account details.",
  ],
  relatedSettingIds: ["android-diagnostics-repair-tool", "android-developer-options", "android-privacy-dashboard"],
  afterImageContent: {
    heading: "How Send Feedback Works",
    paragraphs: [
      "When you trigger Send feedback, Android bundles recent system logs and device details into a report, then shows you a screen to add a written description and, optionally, a screenshot of what you were looking at.",
      "You can annotate the screenshot to circle the problem area or blur anything private before it's attached, and the whole package is sent directly to Google's (or the relevant app's) engineering teams for review.",
    ],
    steps: [
      "Open Settings and search for 'Send feedback', or find it in a specific app's Help/Settings menu.",
      "Describe the problem in as much detail as possible.",
      "Attach a screenshot if relevant, blurring out any personal information.",
      "Tap Send to submit the report.",
    ],
  },
},
{
  id: "android-battery-usage-troubleshoot",
  title: "Battery Usage",
  icon: BatteryWarning,
  platform: "android",
  category: "troubleshooting-diagnostics",
  frequentlyUsed: true,
  controlType: "action",
  actionLabel: "View Battery Usage",
  heading: "See what's draining your battery",
  description:
    "Battery usage breaks down exactly how much charge each app and system component has consumed since the last full charge, making it the go-to screen for diagnosing unexpectedly fast battery drain.",
  details: [
    "Shows a percentage and time-in-use breakdown per app over the last 24 hours or several days.",
    "Distinguishes between screen-on ('foreground') usage and background battery drain.",
    "Flags apps with unusual background activity so you can restrict their battery use directly from this screen.",
    "A battery history graph shows discharge rate over time, helpful for spotting exactly when a drain started.",
  ],
  important:
    "A single app showing high usage isn't automatically a problem — apps you actively use heavily, like navigation or streaming, are expected to top this list.",
  redirectUrl: "https://support.google.com/android",
  whyItMatters:
    "Unexplained battery drain is one of the most common phone complaints, and this screen is usually the fastest way to identify whether it's a specific app, a system process, or just heavy daily use.",
  bestPractices: [
    "Check this screen right when you notice unusually fast drain, rather than after a full day when the picture becomes murkier.",
    "Restrict background activity for apps that show high usage without matching your actual foreground use.",
    "Compare the current day's usage pattern to a normal day's rather than judging a single high number in isolation.",
  ],
  commonIssues: [
    {
      issue: "An app you barely open shows high battery usage.",
      fix: "Open that app's entry, restrict its background activity, and check its App info permissions for anything like location access it doesn't need constantly.",
    },
    {
      issue: "Battery drains fast right after installing a system or app update.",
      fix: "This is often temporary while apps reindex; give it 2-3 days, and if drain continues, check whether that specific app's usage is now abnormally high.",
    },
  ],
  faqs: [
    {
      q: "What's the difference between foreground and background usage?",
      a: "Foreground usage is battery used while you're actively looking at and using the app; background usage happens while it's running unseen, like syncing or fetching notifications.",
    },
    {
      q: "Can I stop an app from using battery in the background entirely?",
      a: "Yes, most apps can be background-restricted from their entry in Battery usage or from App info, though this may delay notifications from that app.",
    },
  ],
  tipsAndTricks: [
    "Tap into an individual app's battery entry for a direct shortcut to restrict its background usage without navigating back through App info.",
  ],
  relatedSettingIds: ["android-battery", "android-app-info", "android-diagnostics-repair-tool"],
  afterImageContent: {
    heading: "How Battery Usage Works",
    paragraphs: [
      "Android continuously tracks power consumption at the app and system level, attributing usage to whichever process was responsible — whether that's screen time, network activity, location requests, or background processing.",
      "The Battery usage screen surfaces this data as a ranked list and a discharge-over-time graph, letting you correlate a sudden drop in battery percentage with exactly which app or activity was running at that moment.",
    ],
    steps: [
      "Open Settings > Battery.",
      "Tap 'Battery usage' to see the ranked list of apps.",
      "Tap an individual app for a detailed foreground/background breakdown.",
      "Use 'Restrict' from that app's screen if its background usage looks excessive.",
    ],
  },
},
{
  id: "android-select-to-speak",
  title: "Select to Speak",
  icon: MessageSquare,
  platform: "android",
  category: "accessibility-language",
  controlType: "action",
  heading: "Tap items on screen to hear them read aloud",
  description: "Select to Speak lets you tap or draw a box around text, images, or entire screens to have Android read the content aloud using text-to-speech. It works inside apps, on the web, and even on images with detectable text.",
  details: [
    "Adds a floating icon that toggles a tap-to-read cursor",
    "Can read a single item, a selected region, or the whole screen",
    "Supports reading text found inside images via on-device recognition",
    "Playback controls let you pause, skip, or adjust reading speed",
    "Works alongside TalkBack but is designed for sighted users who need occasional reading help",
  ],
  redirectUrl: "https://support.google.com/accessibility/android/",
  whyItMatters: "Select to Speak helps people with reading difficulties, low vision, or language barriers consume on-screen content without switching to a full screen reader. Because it is opt-in per tap rather than always-on narration, it is far less disruptive for everyday use than TalkBack, making it a practical middle ground for users who only need occasional read-aloud support. It also helps sighted users multitask, such as listening to an article while doing something else.",
  bestPractices: [
    "Enable the accessibility shortcut so Select to Speak can be toggled without opening Settings",
    "Pair with a Bluetooth headset for private listening in public spaces",
    "Use the reading speed control to match comprehension needs",
    "Combine with Live Caption when watching muted media that also needs on-screen text read",
  ],
  commonIssues: [
    { issue: "Select to Speak does not read text in an image", fix: "Confirm the image-text detection option is enabled in Select to Speak settings and that the device has an internet or on-device OCR model ready" },
    { issue: "Floating icon is missing", fix: "Re-enable the feature from Settings > Accessibility > Select to Speak and confirm overlay permission is granted" },
    { issue: "Reading stops unexpectedly", fix: "Check that battery saver is not restricting background audio playback" },
  ],
  faqs: [
    { q: "Is Select to Speak the same as TalkBack?", a: "No, TalkBack narrates the whole interface continuously for blind users, while Select to Speak only reads what you specifically tap or select." },
    { q: "Can it read PDFs?", a: "Yes, as long as the PDF viewer displays selectable or recognizable text on screen." },
    { q: "Does it work offline?", a: "Reading plain on-screen text works offline; recognizing text inside images may require a downloaded language pack." },
  ],
  tipsAndTricks: [
    "Draw a box around just the paragraph you need instead of selecting the entire screen for faster playback",
    "Assign a triple-tap or button shortcut for one-handed activation",
  ],
  relatedSettingIds: ["android-talkback", "android-live-caption", "android-tts-output"],
  updateFrequency: "Rarely changed after initial setup",
  afterImageContent: {
    heading: "How Select to Speak Works",
    paragraphs: [
      "Once enabled, a small floating button appears over every screen. Tapping it activates a selection mode where a single tap on any text or image reads that item aloud.",
      "You can also drag to draw a rectangle around multiple lines or a whole article to have it read in sequence, with on-screen highlighting showing the current word.",
    ],
    steps: [
      "Open Settings",
      "Tap Accessibility",
      "Select Select to Speak",
      "Toggle the feature on and grant overlay permission",
      "Tap the floating icon, then tap any text on screen to hear it",
    ],
  },
},
{
  id: "android-color-correction",
  title: "Color Correction & Inversion",
  icon: Image,
  platform: "android",
  category: "accessibility-language",
  controlType: "action",
  heading: "Adjust how colors render for color vision deficiency",
  description: "Color Correction shifts the device's color palette to compensate for common types of color blindness (deuteranomaly, protanomaly, tritanomaly), while the related Color Inversion setting flips light and dark values for users who prefer high-contrast or low-glare screens.",
  details: [
    "Offers correction modes for red-green and blue-yellow color deficiencies",
    "Color inversion swaps light backgrounds for dark ones system-wide",
    "Changes apply globally across apps, not just system menus",
    "Can be toggled quickly via the accessibility shortcut once configured",
  ],
  redirectUrl: "https://support.google.com/accessibility/android/",
  whyItMatters: "Roughly one in twelve men and a smaller share of women have some form of color vision deficiency, which can make status indicators, charts, and app icons hard to distinguish. Color Correction remaps the palette so those distinctions become visible again, while Color Inversion serves users who are light-sensitive or prefer reversed contrast for reading. Together they make the entire OS usable rather than relying on individual apps to add their own accommodations.",
  bestPractices: [
    "Try each correction mode against a color test image to find the best match for your specific deficiency",
    "Use inversion sparingly, since some media (photos, video) can look unnatural when inverted",
    "Combine with Dark Mode instead of inversion when only reduced brightness is needed",
    "Re-check correction settings after major OS updates since color profiles can reset",
  ],
  commonIssues: [
    { issue: "Photos and videos look wrong after enabling inversion", fix: "This is expected since inversion affects all rendered pixels; disable it for media-heavy apps or switch to Dark Mode instead" },
    { issue: "Correction mode does not fix the issue", fix: "Try the other available correction modes, since deficiency types vary and one mode may work better than another" },
  ],
  faqs: [
    { q: "Does color correction change photos I take?", a: "No, it only changes how colors are displayed, not the underlying image data." },
    { q: "Is inversion the same as Dark Mode?", a: "No, Dark Mode is a designed dark theme, while inversion mathematically flips all colors and can look inconsistent in photos." },
  ],
  tipsAndTricks: [
    "Set the accessibility shortcut to instantly compare corrected and uncorrected views",
    "Use grayscale mode (also in this menu) to reduce distraction from color entirely",
  ],
  relatedSettingIds: ["android-magnification", "android-accessibility", "android-accessibility-shortcut"],
  afterImageContent: {
    heading: "How Color Correction Works",
    paragraphs: [
      "Color Correction applies a system-level color matrix transform that shifts hues so that colors which are normally hard to distinguish become more separated.",
      "Color Inversion instead flips the luminance and hue values of every pixel, effectively turning white backgrounds black and vice versa.",
    ],
    steps: [
      "Open Settings",
      "Tap Accessibility, then Text and display",
      "Select Color correction or Color inversion",
      "Toggle the feature and choose a correction mode if applicable",
    ],
  },
},
{
  id: "android-accessibility-shortcut",
  title: "Accessibility Shortcut",
  icon: Activity,
  platform: "android",
  category: "accessibility-language",
  controlType: "action",
  heading: "Assign a quick gesture to launch accessibility tools",
  description: "The Accessibility Shortcut lets you trigger a chosen accessibility feature, such as TalkBack, Magnification, or Select to Speak, from anywhere using a button combination, gesture, or on-screen icon, without navigating through Settings.",
  details: [
    "Can be bound to a volume key combo, navigation gesture, or floating button",
    "Supports assigning multiple features to toggle in sequence",
    "Available from the lock screen if enabled",
    "Configurable independently for each accessibility service installed on the device",
  ],
  redirectUrl: "https://support.google.com/accessibility/android/",
  whyItMatters: "Accessibility tools are only useful if they can be turned on quickly when needed, especially for users with motor or vision impairments who may struggle to navigate multiple settings menus in the moment. The shortcut turns a several-tap process into a single gesture, which matters most in situations like sudden vision fatigue or needing TalkBack activated by someone else handing over the phone. Lock screen availability further ensures the tool works even before the device is unlocked.",
  bestPractices: [
    "Choose a gesture that is unlikely to be triggered accidentally during normal use",
    "Enable lock screen access if the assigned feature may be needed before unlocking",
    "Test the shortcut immediately after setup to confirm it launches the intended service",
    "Limit the shortcut to one or two frequently needed tools to avoid confusion",
  ],
  commonIssues: [
    { issue: "Shortcut launches the wrong feature", fix: "Open the shortcut settings and confirm only the intended service is checked" },
    { issue: "Shortcut does not work from the lock screen", fix: "Enable the 'Allow from lock screen' option within the shortcut settings" },
  ],
  faqs: [
    { q: "Can I assign the shortcut to more than one feature?", a: "Yes, selecting multiple services makes the shortcut open a picker menu instead of toggling one directly." },
    { q: "Does the shortcut work with a connected keyboard?", a: "On supported devices, a key combination can also be configured for external keyboards." },
  ],
  tipsAndTricks: [
    "Use the two-finger long-press gesture option for a shortcut that rarely triggers by accident",
    "Pair the shortcut with Select to Speak for fast one-off reading without full-time narration",
  ],
  relatedSettingIds: ["android-talkback", "android-select-to-speak", "android-magnification"],
  afterImageContent: {
    heading: "How the Accessibility Shortcut Works",
    paragraphs: [
      "Once configured, the chosen gesture or button combination is monitored system-wide, so it works even inside third-party apps or on the lock screen if permitted.",
      "Triggering the shortcut either instantly toggles the assigned feature or opens a small menu if multiple features are assigned.",
    ],
    steps: [
      "Open Settings",
      "Tap Accessibility",
      "Select Accessibility shortcut",
      "Choose the trigger method (gesture, button, or floating icon)",
      "Pick which feature or features the shortcut should control",
    ],
  },
},
{
  id: "android-tts-output",
  title: "Text-to-Speech Output",
  icon: Volume2,
  platform: "android",
  category: "accessibility-language",
  controlType: "action",
  heading: "Choose and configure the engine that reads text aloud",
  description: "Text-to-Speech Output controls which speech synthesis engine, language, voice, and speaking rate the system uses for every feature that reads text aloud, including TalkBack, Select to Speak, and navigation prompts.",
  details: [
    "Lets you pick between Google's speech engine or a third-party alternative if installed",
    "Adjusts speech rate and pitch independently",
    "Supports downloading additional language voice packs",
    "Includes a 'Play' test button to preview changes instantly",
  ],
  redirectUrl: "https://support.google.com/accessibility/android/",
  whyItMatters: "Every read-aloud feature on Android, from screen readers to navigation apps, relies on this single underlying engine, so tuning it once improves consistency everywhere rather than configuring speech separately per app. Getting the rate and pitch right is especially important for TalkBack users, since speech that is too slow becomes tedious over long sessions while speech that is too fast can be hard to parse. Installing additional language voices also lets multilingual users hear content correctly pronounced instead of defaulting to an accented fallback voice.",
  bestPractices: [
    "Download the voice pack for each language you regularly read in to avoid robotic fallback pronunciation",
    "Increase speech rate gradually rather than jumping to maximum, since comprehension usually needs an adjustment period",
    "Use the test button after every change instead of guessing how it will sound",
    "Keep the default Google engine unless a third-party engine offers a clearly better voice",
  ],
  commonIssues: [
    { issue: "Voice sounds robotic or wrong language", fix: "Download the correct language data pack from the engine's settings menu" },
    { issue: "No sound plays during the test", fix: "Check media volume is not muted and that the correct engine is selected" },
    { issue: "Speech is too fast for TalkBack users to follow", fix: "Lower the speech rate slider and retest with the Play button" },
  ],
  faqs: [
    { q: "Can I use a different app's voices, like a navigation app's voice pack?", a: "Only if that app registers itself as a compatible text-to-speech engine in this menu." },
    { q: "Does changing the rate here affect Google Assistant's voice?", a: "No, Assistant has its own separate voice settings." },
  ],
  tipsAndTricks: [
    "Set a slightly faster rate for casual reading and a slower rate reserved for TalkBack navigation if your device allows per-feature overrides",
    "Preview a paragraph of real text rather than the short default sample for a more accurate sense of the voice",
  ],
  relatedSettingIds: ["android-select-to-speak", "android-live-caption", "android-language-input"],
  afterImageContent: {
    heading: "How Text-to-Speech Output Works",
    paragraphs: [
      "This setting configures the shared speech synthesis service that Android and third-party apps call whenever they need to read text aloud.",
      "Changing the engine, voice, rate, or pitch here updates behavior for every app that uses the standard Android TTS API, not just accessibility tools.",
    ],
    steps: [
      "Open Settings",
      "Tap Accessibility, then Text-to-speech output",
      "Choose a preferred engine",
      "Select a language and voice",
      "Adjust speech rate and pitch, then tap Play to preview",
    ],
  },
},
{
  id: "android-interaction-controls",
  title: "Interaction Controls (Touch & Hold Timeout)",
  icon: Hourglass,
  platform: "android",
  category: "accessibility-language",
  controlType: "action",
  heading: "Adjust touch & hold delay and ignore repeat touches",
  description: "Interaction Controls let you lengthen the time the screen waits before registering a touch-and-hold as a long press, and enable settings that ignore repeated or accidental touches, helping users with limited dexterity or tremors interact more reliably.",
  details: [
    "Offers short, medium, and long touch-and-hold timeout presets",
    "Includes an option to ignore repeated touches within a set time window",
    "Works system-wide across the launcher, apps, and system menus",
    "Complements the separate Touch Assistant/Assistant Menu accessibility feature",
  ],
  redirectUrl: "https://support.google.com/accessibility/android/",
  whyItMatters: "Users with hand tremors, arthritis, or limited fine motor control often trigger unintended long-presses or duplicate taps, which can lead to accidentally opening context menus, rearranging home screen icons, or double-submitting actions. Extending the touch-and-hold delay and filtering out rapid repeat touches reduces these misfires without disabling touch interaction altogether, keeping the device usable rather than frustrating.",
  bestPractices: [
    "Start with the medium timeout preset and adjust based on real usage rather than guessing",
    "Combine with a larger touch target size setting if available on the device",
    "Test common gestures like drag-and-drop after changing the timeout, since it affects those too",
    "Revisit the setting periodically if dexterity needs change over time",
  ],
  commonIssues: [
    { issue: "Long presses feel unresponsive after changing the timeout", fix: "Hold the touch slightly longer than before; the delay was intentionally increased" },
    { issue: "Drag-and-drop stops working on the home screen", fix: "Lower the timeout preset since a very long delay can make drag gestures harder to initiate" },
  ],
  faqs: [
    { q: "Does this affect typing speed?", a: "No, it only affects how long a touch must be held to count as a long press, not regular tapping." },
    { q: "Can I set a custom timeout value instead of a preset?", a: "Most devices only offer short, medium, and long presets rather than a numeric slider." },
  ],
  tipsAndTricks: [
    "Use the longest timeout when handing the device to someone with significant tremors",
    "Check this setting first if home screen icons keep getting accidentally moved",
  ],
  relatedSettingIds: ["android-accessibility", "android-accessibility-shortcut", "android-magnification"],
  afterImageContent: {
    heading: "How Interaction Controls Work",
    paragraphs: [
      "The touch and hold delay changes how many milliseconds a finger must remain in contact with the screen before the system registers a long press rather than a tap.",
      "The ignore repeated touches option adds a short cooldown window after each touch, discarding additional touches that land within that window.",
    ],
    steps: [
      "Open Settings",
      "Tap Accessibility",
      "Select Timing controls or Interaction controls",
      "Choose a touch and hold duration",
      "Enable ignore repeated touches if needed",
    ],
  },
},
{
  id: "android-add-account",
  title: "Add Account",
  icon: Users,
  platform: "android",
  category: "accounts-sync-family",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Add a Google or other account to the device",
  description: "The Add Account flow lets you sign in to a new Google Account or other supported account type (Microsoft Exchange, personal IMAP email, corporate work profile) so its data can sync with apps on the device.",
  details: [
    "Supports Google, personal email (IMAP/POP), and corporate Exchange accounts",
    "Each added account gets its own sync toggles for Contacts, Calendar, and Drive",
    "Multiple Google Accounts can be added and switched between",
    "Work accounts added this way may create a separate managed work profile",
  ],
  redirectUrl: "https://support.google.com/accounts/answer/27441",
  whyItMatters: "Most of Android's built-in apps, from Gmail to Calendar to Play Store purchases, are tied to an account, so adding the right accounts is the foundation for the whole device working correctly. Getting this step right the first time avoids issues like emails going to the wrong inbox, calendar events missing from the wrong calendar, or purchased apps not showing up because they are tied to a different Google Account than the one currently active.",
  bestPractices: [
    "Add your primary Google Account first so app installs and backups are tied to the right identity",
    "Use separate accounts for personal and work email rather than forwarding into one inbox on a managed device",
    "Review sync toggles immediately after adding an account to avoid syncing unwanted data like a second calendar",
    "Remove unused accounts periodically to reduce background sync and battery use",
  ],
  commonIssues: [
    { issue: "Account fails to add with an authentication error", fix: "Confirm two-factor codes or app passwords are entered correctly and that the account is not locked" },
    { issue: "Corporate account requires additional setup", fix: "Contact IT, since Exchange accounts may require a device policy controller or work profile" },
    { issue: "Added account does not appear in Gmail", fix: "Open Gmail's account switcher and confirm the account was added there as well" },
  ],
  faqs: [
    { q: "How many accounts can I add?", a: "Android allows multiple accounts of most types, limited mainly by device storage and manufacturer policy." },
    { q: "Does adding an account automatically sync everything?", a: "No, each data type has its own toggle that can be reviewed after the account is added." },
    { q: "Can I remove an account later?", a: "Yes, from the same Accounts menu, though removing it deletes locally synced data for that account." },
  ],
  tipsAndTricks: [
    "Use 'Add account' rather than signing into individual apps separately to keep sync settings centralized",
    "Rename accounts with ambiguous addresses so they're easier to identify in app switchers",
  ],
  relatedSettingIds: ["android-google-account-sync", "android-sync-account-data", "android-autofill-service"],
  afterImageContent: {
    heading: "How Add Account Works",
    paragraphs: [
      "This screen lists every account type supported by installed apps on the device, from Google to third-party email and enterprise accounts.",
      "After selecting a type and completing sign-in, the account appears in the main Accounts list with its own dedicated sync controls.",
    ],
    steps: [
      "Open Settings",
      "Tap Passwords & accounts (or Accounts)",
      "Tap Add account",
      "Choose the account type and complete sign-in",
      "Review and adjust the sync toggles that appear",
    ],
  },
},
{
  id: "android-sync-account-data",
  title: "Sync Individual Account Data",
  icon: RefreshCw,
  platform: "android",
  category: "accounts-sync-family",
  controlType: "action",
  heading: "Turn individual sync categories on or off per account",
  description: "Beyond the master account sync switch, each added account has granular toggles for what actually syncs, such as Contacts, Calendar, Gmail, Drive, or Photos, letting you keep some data local-only while syncing the rest.",
  details: [
    "Toggles appear per account, per data type (Contacts, Calendar, etc.)",
    "Disabling a toggle stops future sync without deleting already-downloaded data",
    "A manual 'Sync now' option forces an immediate refresh",
    "Useful for keeping a secondary account's calendar out of the main calendar app view",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "Not every account should sync every data type, especially when a device carries both personal and work or secondary accounts; syncing everything can clutter the calendar with irrelevant events or merge contact lists in confusing ways. Granular sync controls let users keep accounts logically separated, for example syncing a work account's email but not its contacts into the personal phone contact list, which matters for privacy and organization on shared or dual-use devices.",
  bestPractices: [
    "Disable Contacts sync for accounts you don't want merged into your main contact list",
    "Turn off Calendar sync for secondary accounts whose events would clutter the primary view",
    "Use manual sync sparingly since it can drain battery if triggered too often",
    "Recheck sync toggles after major app updates, since new data types sometimes get added",
  ],
  commonIssues: [
    { issue: "Calendar shows duplicate or unwanted events", fix: "Disable Calendar sync for the extra account or hide that specific calendar within the Calendar app" },
    { issue: "Contacts merged unexpectedly across accounts", fix: "Turn off Contacts sync for the account you don't want merged and manually clean up duplicates" },
    { issue: "Sync toggle reverts after a restart", fix: "Check for a device management profile that may be enforcing sync settings" },
  ],
  faqs: [
    { q: "Does disabling sync delete data already on the device?", a: "No, it only stops future updates; existing synced data remains until manually removed." },
    { q: "Can I sync Photos separately from other Google data?", a: "Yes, Google Photos backup has its own toggle independent of Contacts and Calendar sync." },
  ],
  tipsAndTricks: [
    "Use per-type sync toggles instead of removing an entire account when you only want to change one category",
    "Force a manual sync right after changing a toggle to confirm the change took effect",
  ],
  relatedSettingIds: ["android-google-account-sync", "android-add-account", "android-google-one-backup"],
  afterImageContent: {
    heading: "How Sync Individual Account Data Works",
    paragraphs: [
      "Each account maintains its own list of syncable data types, populated based on which apps are installed and support that account type.",
      "Toggling a category off pauses the background sync adapter for that specific data type while leaving other categories and other accounts unaffected.",
    ],
    steps: [
      "Open Settings",
      "Tap Passwords & accounts",
      "Select the account to manage",
      "Tap Account sync",
      "Toggle individual data types on or off",
    ],
  },
},
{
  id: "android-family-link",
  title: "Family Link Supervision",
  icon: ShieldCheck,
  platform: "android",
  category: "accounts-sync-family",
  controlType: "action",
  heading: "Supervise a child's account, screen time, and app access",
  description: "Family Link connects a child's supervised Google Account to a parent's device, allowing approval of app downloads, screen time limits, content filters, and location checks directly from Android Settings or the Family Link app.",
  details: [
    "Requires the child to sign in with a supervised Google Account",
    "Parents approve or block app and in-app purchase requests remotely",
    "Screen time limits and bedtime schedules can be set per device",
    "Location sharing lets parents see the child's device location",
  ],
  redirectUrl: "https://support.google.com/families/",
  whyItMatters: "Family Link gives parents a way to extend age-appropriate boundaries onto a child's phone or tablet without physically checking the device constantly, covering everything from what apps can be installed to how long the screen stays on each day. As kids get their first personal devices younger, having built-in, OS-level supervision reduces reliance on third-party parental control apps that may have weaker integration or privacy tradeoffs.",
  bestPractices: [
    "Set up the supervised account before handing over a new device to a child rather than retrofitting it later",
    "Review app approval requests promptly so the child isn't blocked from schoolwork apps",
    "Adjust screen time limits gradually as the child demonstrates responsible use",
    "Revisit content filters as the child ages instead of leaving default restrictive settings indefinitely",
  ],
  commonIssues: [
    { issue: "Child cannot install an approved app", fix: "Confirm the approval was completed in the Family Link app and that the child's device has synced recently" },
    { issue: "Screen time limit does not apply", fix: "Check the device's date and time settings, since incorrect clock settings can break scheduled limits" },
    { issue: "Location is not updating", fix: "Ensure location services and background data are enabled on the child's device" },
  ],
  faqs: [
    { q: "Can a child remove Family Link themselves?", a: "No, only the parent account can remove supervision, typically requiring the parent's password." },
    { q: "Does Family Link work on tablets too?", a: "Yes, it works on any Android device signed into a supervised child account." },
    { q: "What happens when the child turns 13?", a: "In most regions they can request to graduate from supervision, subject to parental review." },
  ],
  tipsAndTricks: [
    "Use the 'Ask for extra time' feature to let kids request short extensions instead of hard cutoffs",
    "Set app-specific time limits for especially distracting apps rather than one global limit",
  ],
  relatedSettingIds: ["android-multiple-users", "android-digital-wellbeing", "android-add-account"],
  afterImageContent: {
    heading: "How Family Link Supervision Works",
    paragraphs: [
      "Family Link links a child's Google Account to a parent's account, applying supervision policies that sync down to any device the child signs into.",
      "Parents manage settings remotely through the Family Link app, while limited controls also appear directly in the child device's own Settings app.",
    ],
    steps: [
      "Open Settings on the child's device",
      "Tap Google, then Parental controls (or open the Family Link app)",
      "Sign in with the parent account to link supervision",
      "Configure app approvals, screen time, and content filters",
      "Save changes, which sync automatically to the child's device",
    ],
  },
},
{
  id: "android-emergency-info",
  title: "Emergency Information / Medical ID",
  icon: Siren,
  platform: "android",
  category: "accounts-sync-family",
  controlType: "action",
  heading: "Store medical details for first responders on the lock screen",
  description: "Emergency Information lets you store medical conditions, allergies, medications, and emergency contacts so they are visible from the lock screen without unlocking the device, giving first responders critical information quickly.",
  details: [
    "Accessible from the lock screen via an 'Emergency' or 'Emergency information' link",
    "Stores medical notes, allergies, medications, and blood type",
    "Lists emergency contacts that can be called directly from the lock screen",
    "Does not require the device to be unlocked to view",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "In an accident or medical emergency, seconds matter, and a locked phone can otherwise be a barrier to first responders learning about allergies, medications, or who to contact. Because this information displays without unlocking the device, it closes a real safety gap for a feature that costs nothing to set up but can materially change outcomes in an emergency.",
  bestPractices: [
    "Fill in at least emergency contacts and any life-threatening allergies or conditions",
    "Keep the information updated after any major medication or condition change",
    "Tell a trusted family member the information exists so they know to check it during an emergency",
    "Avoid including sensitive information you would not want visible to a stranger who finds a lost phone",
  ],
  commonIssues: [
    { issue: "Emergency info does not appear on the lock screen", fix: "Confirm the lock screen 'Emergency' shortcut is enabled and that at least one field was saved" },
    { issue: "Information is missing after a phone reset", fix: "Emergency information is stored locally, not backed up to the cloud, so it must be re-entered on a new device" },
  ],
  faqs: [
    { q: "Can this information be seen without unlocking the phone?", a: "Yes, that is the entire purpose; it is accessible directly from the lock screen's emergency call screen." },
    { q: "Does it sync across devices?", a: "No, it is stored locally per device and must be set up on each one." },
    { q: "Can I hide it after setting it up?", a: "The emergency call option itself cannot be hidden, but you can remove the information you've entered at any time." },
  ],
  tipsAndTricks: [
    "Add a secondary emergency contact in case the first is unreachable",
    "Include chronic conditions like diabetes or epilepsy even if seemingly minor, since they can change emergency treatment",
  ],
  relatedSettingIds: ["android-add-account", "android-family-link"],
  afterImageContent: {
    heading: "How Emergency Information Works",
    paragraphs: [
      "Emergency Information is stored locally and linked to the lock screen's emergency dialer, which is itself reachable without a PIN, pattern, or password.",
      "Anyone who picks up the phone can tap Emergency on the lock screen and then view the saved medical details and contacts, and can call an emergency contact directly.",
    ],
    steps: [
      "Open Settings",
      "Tap Safety & emergency (or search Emergency information)",
      "Tap Medical info and enter conditions, allergies, and medications",
      "Tap Emergency contacts and add trusted contacts",
      "Confirm the info is visible from the lock screen's emergency call screen",
    ],
  },
},
{
  id: "android-autofill-service",
  title: "Autofill Service",
  icon: KeyRound,
  platform: "android",
  category: "accounts-sync-family",
  controlType: "action",
  heading: "Choose the service that fills passwords and forms",
  description: "The Autofill Service setting selects which app, such as Google Password Manager or a third-party password manager, automatically fills in saved passwords, addresses, and payment details across apps and browsers.",
  details: [
    "Supports Google's built-in Password Manager or any installed compatible autofill app",
    "Applies system-wide, including inside third-party apps, not just Chrome",
    "Can be limited to only fill passwords, or also addresses and payment methods",
    "Autofill suggestions can be reviewed and deleted per saved entry",
  ],
  redirectUrl: "https://support.google.com/accounts/",
  whyItMatters: "A consistent, system-wide autofill service reduces password reuse and typing errors by suggesting strong saved credentials directly inside login forms, whether in a browser or a native app. Choosing a dedicated password manager as the autofill service, rather than relying on individual apps to remember credentials inconsistently, is one of the simplest ways to improve both security and daily convenience.",
  bestPractices: [
    "Pick one autofill service and stick with it rather than switching frequently, which can cause missing suggestions",
    "Periodically review and remove outdated saved passwords or addresses",
    "Enable biometric confirmation for autofill on sensitive apps like banking if the service supports it",
    "Export or back up passwords through the manager's own backup feature as a safety net",
  ],
  commonIssues: [
    { issue: "Autofill does not trigger inside an app", fix: "Confirm the app's login field supports Android's autofill framework and that the correct service is selected in Settings" },
    { issue: "Wrong account's credentials are suggested", fix: "Review saved entries in the autofill service and delete duplicates or mismatched entries" },
    { issue: "Autofill service keeps resetting to default", fix: "Check for a device policy or another app requesting to become the default autofill handler" },
  ],
  faqs: [
    { q: "Is autofill data encrypted?", a: "Reputable autofill services, including Google Password Manager, encrypt stored credentials both locally and in transit." },
    { q: "Can I use two different autofill services at once?", a: "No, Android allows only one active autofill service at a time." },
    { q: "Does autofill work in all apps?", a: "Only apps built with standard Android input fields that support the autofill framework; some custom-built login screens may not." },
  ],
  tipsAndTricks: [
    "Use the autofill service's built-in password health check to find reused or weak passwords",
    "Enable payment method autofill for faster checkout in shopping apps",
  ],
  relatedSettingIds: ["android-google-account-sync", "android-add-account"],
  afterImageContent: {
    heading: "How Autofill Service Works",
    paragraphs: [
      "When a login or form field is focused, Android asks the selected autofill service whether it has a matching saved entry, then displays a suggestion strip above the keyboard.",
      "Selecting a suggestion fills the field instantly without manually typing or copying the credential.",
    ],
    steps: [
      "Open Settings",
      "Tap Passwords, passkeys & accounts (or System > Languages & input > Advanced)",
      "Tap Autofill service",
      "Choose the desired autofill provider",
      "Confirm and review saved entries within that provider",
    ],
  },
},
{
  id: "android-google-one-backup",
  title: "Google One / Device Backup",
  icon: UploadCloud,
  platform: "android",
  category: "accounts-sync-family",
  controlType: "action",
  heading: "Back up photos, app data, and device settings to the cloud",
  description: "This setting controls the automatic cloud backup of app data, call history, device settings, and photos to your Google Account, optionally using additional Google One storage, so everything can be restored when setting up a new device.",
  details: [
    "Backs up app data, call log, contacts, and device settings automatically",
    "Photo and video backup is managed separately through Google Photos",
    "Backup status and storage usage are visible from this menu",
    "Restoring a backup happens automatically during new device setup",
  ],
  redirectUrl: "https://support.google.com/one/",
  whyItMatters: "Losing, upgrading, or resetting a phone without a working backup means losing app configurations, call history, and settings that took months to build up, even if photos are separately safe. Regular backups turn a potentially painful device migration into a near-automatic process, restoring most of the previous phone's setup within minutes of signing into the new one.",
  bestPractices: [
    "Confirm backup is enabled and connected to Wi-Fi periodically, since it usually only runs on Wi-Fi and while charging",
    "Check available Google Account storage, since a full account can silently stop new backups",
    "Manually trigger a backup before major events like an OS update or trade-in",
    "Verify the backup completed successfully before wiping an old device",
  ],
  commonIssues: [
    { issue: "Backup shows as never completed", fix: "Ensure the device is connected to Wi-Fi and charging, since cellular backup is usually disabled by default" },
    { issue: "Storage is full and backup is failing", fix: "Free up Google Account storage or purchase additional Google One storage" },
    { issue: "New device is missing app data after restore", fix: "Confirm the correct Google Account was chosen during setup and that the backup for that account completed before switching devices" },
  ],
  faqs: [
    { q: "Does this back up my photos too?", a: "Photos are backed up separately through the Google Photos app's own backup setting, though both draw from the same Google Account storage." },
    { q: "Is a Google One subscription required to back up my device?", a: "No, a free storage tier is included with every Google Account; a subscription only adds more space." },
    { q: "Can I back up more than one device to the same account?", a: "Yes, each device's backup is stored separately even under the same account." },
  ],
  tipsAndTricks: [
    "Turn on Wi-Fi-only backup restrictions to avoid unexpected cellular data usage",
    "Use the 'Back up now' manual option right before selling or recycling an old phone",
  ],
  relatedSettingIds: ["android-sync-account-data", "android-google-account-sync"],
  afterImageContent: {
    heading: "How Google One Backup Works",
    paragraphs: [
      "When enabled, Android periodically uploads app data, settings, call history, and contacts to your Google Account's cloud storage in the background.",
      "During setup of a new or reset device, signing in with the same account offers to restore the most recent backup automatically.",
    ],
    steps: [
      "Open Settings",
      "Tap Google, then Backup",
      "Toggle Backup by Google One on",
      "Review backup account and storage usage",
      "Tap Back up now for an immediate manual backup",
    ],
  },
},
{
  id: "android-personal-dictionary",
  title: "Personal Dictionary",
  icon: Keyboard,
  platform: "android",
  category: "accounts-sync-family",
  controlType: "action",
  heading: "Manage custom words the keyboard learns and suggests",
  description: "The Personal Dictionary stores custom words, names, and abbreviations you've added or that the keyboard has learned, so they are recognized instead of flagged as typos and are suggested during predictive typing.",
  details: [
    "Words can be added manually or learned automatically as you type",
    "Supports per-language dictionaries when multiple keyboard languages are enabled",
    "Entries can be edited or deleted individually",
    "Synced dictionary entries can carry over to other devices signed into the same Google Account, depending on the keyboard app",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "Names, slang, technical terms, and abbreviations that aren't in a standard dictionary get flagged or autocorrected incorrectly, which is a persistent annoyance for anyone typing industry jargon, unusual names, or a second language regularly. Maintaining the personal dictionary directly fixes recurring autocorrect frustrations rather than repeatedly overriding the same correction every time it happens.",
  bestPractices: [
    "Manually add frequently used names or terms rather than waiting for the keyboard to learn them over time",
    "Periodically clean up accidentally learned typos that got added by mistake",
    "Set up a dictionary entry per language if you type in more than one regularly",
    "Back up important custom entries manually if switching to a different keyboard app",
  ],
  commonIssues: [
    { issue: "A word keeps autocorrecting despite being added", fix: "Confirm the word was added under the correct language dictionary that matches your active keyboard layout" },
    { issue: "Dictionary entries disappeared after switching keyboard apps", fix: "Personal dictionaries are often app-specific; check the new keyboard app's own dictionary settings" },
  ],
  faqs: [
    { q: "Does the personal dictionary work across all keyboard apps?", a: "Not always; some third-party keyboards maintain their own separate dictionary instead of using the system one." },
    { q: "Can I import a large list of words at once?", a: "Some keyboard apps support bulk import from a text file, though the stock dictionary editor usually requires manual entry." },
  ],
  tipsAndTricks: [
    "Add shorthand entries that expand to longer phrases if your keyboard supports text expansion",
    "Review the dictionary after a big autocorrect annoyance to catch and remove any bad learned entries",
  ],
  relatedSettingIds: ["android-language-input", "android-add-account"],
  afterImageContent: {
    heading: "How Personal Dictionary Works",
    paragraphs: [
      "Words added to the personal dictionary are stored locally and referenced by the keyboard's autocorrect and prediction engine ahead of flagging them as misspellings.",
      "As you type and repeatedly override an autocorrect suggestion, some keyboards automatically add the overridden word to this dictionary.",
    ],
    steps: [
      "Open Settings",
      "Tap System, then Languages & input",
      "Select Personal dictionary",
      "Choose a language, then tap the add button to enter a new word",
    ],
  },
},
{
  id: "android-per-app-notifications",
  title: "Notifications Per App",
  icon: Bell,
  platform: "android",
  category: "apps-features",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Control notification categories for a single app",
  description: "This app-level screen lets you fine-tune notifications for one specific app, toggling individual notification channels such as promotions, messages, or reminders, and setting importance levels without affecting notifications from any other app.",
  details: [
    "Lists individual notification channels defined by the app",
    "Each channel can be silenced, minimized, or set to alert with sound and pop-up",
    "Shows recent notification history for that app",
    "Includes shortcuts to app-specific settings like badge dots and lock screen visibility",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "Blanket notification blocking loses useful alerts along with the annoying ones, while per-app channel control lets you silence promotional pings from a shopping app while keeping order updates or delivery alerts active. This granularity is what makes it possible to keep dozens of apps installed without a constantly buzzing phone, since most notification fatigue comes from a small number of noisy channels within otherwise useful apps.",
  bestPractices: [
    "Review new apps' notification channels shortly after install rather than letting default settings run unchecked",
    "Downgrade promotional or marketing channels to silent instead of disabling all notifications from useful apps",
    "Use per-channel importance levels rather than app-wide mute when only one type of alert is unwanted",
    "Periodically audit apps with the most notification history to catch chronic over-notifiers",
  ],
  commonIssues: [
    { issue: "An app still sends unwanted alerts after muting", fix: "Check whether the alert comes from a different channel within the app, since apps can have many separate channels" },
    { issue: "Important alerts are being missed", fix: "Confirm the relevant channel is not set to Silent or minimized and that Do Not Disturb isn't blocking it" },
    { issue: "Notification history is empty", fix: "Enable notification history from the main Notifications settings screen, since it's off by default" },
  ],
  faqs: [
    { q: "What is a notification channel?", a: "It's a category an app defines for its notifications, such as 'Messages' or 'Promotions', each independently controllable." },
    { q: "Can I set a custom sound per channel?", a: "Yes, most channels allow assigning a distinct sound and vibration pattern." },
    { q: "Does this override Do Not Disturb?", a: "No, Do Not Disturb rules still apply on top of these per-app settings." },
  ],
  tipsAndTricks: [
    "Long-press a notification in the shade to jump directly to that channel's settings",
    "Set marketing or promotional channels to 'Silent' instead of off so they still appear in the notification shade without alerting",
  ],
  relatedSettingIds: ["android-notifications", "android-app-info", "android-do-not-disturb"],
  afterImageContent: {
    heading: "How Notifications Per App Works",
    paragraphs: [
      "Every app that sends notifications registers one or more channels with the system, each representing a distinct category of alert.",
      "Adjusting a channel's importance here changes how it behaves everywhere, including the lock screen, notification shade, and status bar, without touching other channels from the same app.",
    ],
    steps: [
      "Open Settings",
      "Tap Apps, then select the specific app",
      "Tap Notifications",
      "Review the list of channels and adjust importance for each",
    ],
  },
},
{
  id: "android-permission-manager",
  title: "Permission Manager",
  icon: Lock,
  platform: "android",
  category: "apps-features",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Review which apps can access camera, location, and more",
  description: "Permission Manager organizes app permissions by category, such as Camera, Location, Microphone, and Contacts, so you can see and revoke access across all apps at once instead of checking each app individually.",
  details: [
    "Groups permissions by type rather than by app for faster auditing",
    "Shows how many apps currently have each sensitive permission",
    "Supports one-time, while-in-use, and always-allow location access levels",
    "Flags apps that haven't been used recently but still hold sensitive permissions",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "Apps accumulate permissions over time, often more than they currently need, and reviewing them app-by-app is tedious enough that most people never do it. Organizing by permission type instead lets you answer a focused question like 'which apps can see my location right now' in seconds, making it realistic to actually audit and tighten privacy settings on a regular basis rather than only during initial app setup.",
  bestPractices: [
    "Review the Location and Microphone categories first, since these are the most sensitive and commonly over-granted",
    "Choose 'While using the app' over 'Always allow' for location unless background tracking is genuinely required",
    "Use one-time permissions for apps you use infrequently",
    "Revoke permissions for apps flagged as unused rather than leaving them dormant with access intact",
  ],
  commonIssues: [
    { issue: "An app stops working after a permission is revoked", fix: "Re-grant the permission if the app genuinely requires it for its core function, or check for an in-app alternative" },
    { issue: "Location permission keeps resetting to Always Allow", fix: "Check for a device policy or the app requesting permission again through its own onboarding flow" },
    { issue: "Too many apps have microphone access", fix: "Revoke access from apps that don't need voice input as a core feature, then re-grant only if a specific feature breaks" },
  ],
  faqs: [
    { q: "What's the difference between 'While using the app' and 'Always'?", a: "'While using the app' only grants access when the app is open and visible, while 'Always' permits background access even when closed." },
    { q: "Does revoking a permission delete data the app already collected?", a: "No, it only prevents future access; previously collected data remains with the app or its servers." },
    { q: "Can I see when an app last used a permission?", a: "Yes, the Privacy dashboard shows a timeline of recent permission usage alongside the Permission Manager." },
  ],
  tipsAndTricks: [
    "Check the Privacy dashboard alongside Permission Manager to see exactly when an app used a sensitive permission",
    "Set camera and microphone toggles off system-wide when not needed, which overrides all app-level permissions temporarily",
  ],
  relatedSettingIds: ["android-app-info", "android-special-app-access", "android-unused-apps-archiving"],
  afterImageContent: {
    heading: "How Permission Manager Works",
    paragraphs: [
      "Permission Manager pulls every granted permission across all installed apps and organizes them into categories like Location, Camera, and Contacts.",
      "Tapping a category lists every app with that permission, letting you change or revoke access for each without navigating to individual app pages.",
    ],
    steps: [
      "Open Settings",
      "Tap Privacy, then Permission manager",
      "Select a permission category, such as Location",
      "Tap an app to change its access level",
    ],
  },
},
{
  id: "android-adaptive-battery",
  title: "Adaptive Battery / App Battery Usage",
  icon: BatteryCharging,
  platform: "android",
  category: "apps-features",
  controlType: "action",
  heading: "Let Android learn app usage to extend battery life",
  description: "Adaptive Battery uses on-device machine learning to predict which apps you'll use next and restricts battery and background activity for apps you rarely open, while App Battery Usage shows a breakdown of exactly which apps are consuming the most power.",
  details: [
    "Learns usage patterns over several days to improve predictions",
    "Restricted apps can still send notifications but run less frequently in the background",
    "Per-app battery usage graphs show percentage drained over the last 24 hours or several days",
    "Individual apps can be manually set to 'Unrestricted', 'Optimized', or 'Restricted'",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "A handful of apps running unnecessary background tasks are usually responsible for most unexpected battery drain, and without visibility into per-app consumption it's nearly impossible to diagnose why a phone that used to last all day suddenly doesn't. Adaptive Battery automates part of the fix by deprioritizing rarely used apps, while the usage breakdown gives users the data needed to manually restrict specific offenders that the automatic system might miss.",
  bestPractices: [
    "Leave Adaptive Battery enabled for most users rather than manually managing every app",
    "Manually set critical apps like messaging or alarm apps to 'Unrestricted' so they aren't deprioritized",
    "Check the battery usage graph after a day of unusually fast drain to identify the cause",
    "Avoid restricting apps that need reliable background notifications, such as banking or ride-share apps",
  ],
  commonIssues: [
    { issue: "Notifications from an app arrive late", fix: "Set that specific app's battery usage to Unrestricted instead of Optimized or Restricted" },
    { issue: "One app dominates the battery graph unexpectedly", fix: "Open the app's battery detail page to see whether it's background or foreground usage driving the drain, and restrict background activity if appropriate" },
    { issue: "Battery still drains fast despite Adaptive Battery being on", fix: "Check for a stuck app in a wake lock loop via the battery usage details, and force-stop or reinstall it" },
  ],
  faqs: [
    { q: "Does Adaptive Battery block notifications from restricted apps?", a: "No, notifications still arrive, but the app's ability to run background tasks unprompted is reduced." },
    { q: "How long does it take Adaptive Battery to learn my habits?", a: "Typically a few days of normal use before predictions stabilize." },
    { q: "Is this the same as Battery Saver mode?", a: "No, Battery Saver is a temporary low-power mode, while Adaptive Battery is an always-on background optimization." },
  ],
  tipsAndTricks: [
    "Sort the battery usage list by background activity specifically to spot apps misbehaving while closed",
    "Combine with the Unused Apps setting to fully hibernate apps that rarely get opened",
  ],
  relatedSettingIds: ["android-app-info", "android-unused-apps-archiving", "android-do-not-disturb"],
  afterImageContent: {
    heading: "How Adaptive Battery Works",
    paragraphs: [
      "Adaptive Battery continuously ranks apps by predicted likelihood of use in the next few hours, then throttles background CPU and network access for apps ranked low.",
      "The App Battery Usage screen separately tracks and visualizes actual power draw per app, independent of whether Adaptive Battery has restricted it.",
    ],
    steps: [
      "Open Settings",
      "Tap Battery",
      "Tap Battery usage to see the per-app breakdown",
      "Tap an individual app, then Battery usage settings to change its restriction level",
    ],
  },
},
{
  id: "android-screen-pinning",
  title: "Screen Pinning",
  icon: AppWindow,
  platform: "android",
  category: "apps-features",
  controlType: "action",
  heading: "Lock the display to a single app until you unpin it",
  description: "Screen Pinning locks the device to a single app's view, preventing access to the home screen, other apps, or notifications until the pin is manually released, useful for handing a phone to someone else or running a kiosk-style demo.",
  details: [
    "Pinned apps hide the recents and home buttons or require a gesture to unpin",
    "Can optionally require a PIN, pattern, or fingerprint to unpin",
    "Notifications can be hidden while an app is pinned",
    "Activated from the Recent Apps overview by tapping an app's icon",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "Handing a phone to a child to watch a video or to a stranger for a single task, like scanning a code or filling a form, carries the risk of them wandering into messages, photos, or settings; screen pinning removes that risk by physically locking navigation to just the one app in use. It's also the standard mechanism behind many point-of-sale, kiosk, and single-purpose device deployments built on Android.",
  bestPractices: [
    "Enable the unlock requirement for unpinning if handing the device to someone you don't fully trust with access to the rest of the phone",
    "Use screen pinning before letting a child play a game app to prevent accidental navigation to app stores or browsers",
    "Test the unpin gesture beforehand so you're not stuck if you forget it under a locked pin",
    "Combine with a dedicated guest user profile for longer-term lending rather than one-off pinning",
  ],
  commonIssues: [
    { issue: "Can't unpin the app", fix: "Use the specific gesture or button combo shown when pinning started, typically holding back and overview together, or swipe up and hold" },
    { issue: "Screen pinning option is missing from Recent Apps", fix: "Enable it first from Settings > Security, since it must be turned on before it appears as an option" },
    { issue: "Notifications still show while pinned", fix: "Enable the 'hide sensitive notification content' or notification-blocking option within screen pinning settings" },
  ],
  faqs: [
    { q: "Is screen pinning the same as guest mode?", a: "No, guest mode creates a separate temporary user profile, while screen pinning locks the current session to one specific app." },
    { q: "Can calls still come through while pinned?", a: "Yes, unless notifications are specifically hidden, incoming calls can still interrupt a pinned app." },
    { q: "Does pinning work in any app?", a: "Yes, it works with virtually any app, since it's a system-level lock rather than an app-specific feature." },
  ],
  tipsAndTricks: [
    "Use screen pinning at demos or trade shows to keep a device locked to a single showcase app",
    "Require the unlock method to unpin whenever the device might be out of your sight momentarily",
  ],
  relatedSettingIds: ["android-app-info", "android-multiple-users"],
  afterImageContent: {
    heading: "How Screen Pinning Works",
    paragraphs: [
      "Once enabled in Security settings, opening Recent Apps and tapping an app's icon reveals a Pin option that locks the display to that single app.",
      "While pinned, system gestures like going home or switching apps are disabled until the specific unpin gesture or authentication is performed.",
    ],
    steps: [
      "Open Settings",
      "Tap Security (or Security & privacy)",
      "Enable Screen pinning and choose whether to require unlock to unpin",
      "Open the app to pin, then open Recent Apps and tap its icon, then Pin",
    ],
  },
},
{
  id: "android-app-timers",
  title: "App Timers",
  icon: Clock,
  platform: "android",
  category: "apps-features",
  controlType: "action",
  heading: "Set a daily usage limit that pauses an app when reached",
  description: "App Timers let you set a daily time budget for a specific app; once the limit is reached the app's icon grays out and it can't be reopened until the timer resets at midnight or is manually paused for the day.",
  details: [
    "Set independently per app rather than as one global limit",
    "App icon dims and shows a warning banner as the limit approaches",
    "Timer resets automatically at midnight local time",
    "Can be paused for the current day from the Digital Wellbeing dashboard",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "Global screen time totals rarely change behavior on their own, but a hard limit on a specific app, like a social media or game app, creates a real interruption that prompts a conscious choice to keep going or stop. Setting timers on just the one or two apps that tend to consume disproportionate time is usually far more effective than trying to manage overall phone use in the abstract.",
  bestPractices: [
    "Target the one or two most time-consuming apps rather than setting timers on everything",
    "Set realistic limits that reduce but don't eliminate use, since unrealistic limits get abandoned quickly",
    "Review actual usage data before choosing a limit so it's grounded in real habits rather than a guess",
    "Use app timers alongside bedtime mode for a more complete usage routine",
  ],
  commonIssues: [
    { issue: "App reopens even after the timer expired", fix: "Force-close the app fully, since an already-open session may continue briefly until the next check" },
    { issue: "Timer resets earlier or later than expected", fix: "Confirm the device's time zone and clock settings are correct, since the reset is tied to local midnight" },
    { issue: "Can't find the option to pause a timer for today", fix: "Open the Digital Wellbeing dashboard directly rather than the app's own settings" },
  ],
  faqs: [
    { q: "Can I bypass a timer once it expires?", a: "Yes, a temporary override option is usually available, though it's intentionally an extra step to discourage casual bypassing." },
    { q: "Do app timers work for pre-installed system apps?", a: "Most core system apps like Phone or Settings are excluded from timers by design." },
    { q: "Is this different from the overall Digital Wellbeing dashboard?", a: "Yes, the dashboard shows total usage across all apps, while timers are individual per-app caps." },
  ],
  tipsAndTricks: [
    "Set a slightly tighter timer on weekdays and a looser one on weekends by adjusting it manually",
    "Pair with grayscale mode for the target app's icon as an extra visual deterrent",
  ],
  relatedSettingIds: ["android-digital-wellbeing", "android-per-app-notifications", "android-family-link"],
  afterImageContent: {
    heading: "How App Timers Work",
    paragraphs: [
      "App Timers are configured from the Digital Wellbeing dashboard, which shows a ring chart of daily usage per app alongside an hourglass icon to set a limit.",
      "Once the set number of minutes is reached for the day, the app's icon dims on the home screen and app drawer, and opening it shows a message that the daily limit has been reached.",
    ],
    steps: [
      "Open Settings",
      "Tap Digital Wellbeing & parental controls",
      "Tap the usage dashboard ring chart to see per-app time",
      "Tap the hourglass icon next to an app",
      "Set the daily time limit in minutes",
    ],
  },
},
{
  id: "android-airplane-mode",
  title: "Airplane Mode",
  icon: Plane,
  platform: "android",
  category: "connectivity-network",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Instantly disable all wireless radios for flights or focus",
  description: "Airplane Mode simultaneously disables cellular, Wi-Fi, and Bluetooth radios with a single toggle, complying with airline requirements while optionally letting you re-enable Wi-Fi or Bluetooth individually afterward.",
  details: [
    "Disables cellular, Wi-Fi, and Bluetooth in one action",
    "Wi-Fi and Bluetooth can be manually re-enabled while Airplane Mode stays on",
    "Accessible from both Settings and the quick settings panel",
    "Blocks all outgoing and incoming calls and texts while active",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "Beyond its original purpose of complying with airline safety rules, Airplane Mode has become a fast way to cut off all connectivity at once, useful for conserving battery, avoiding interruptions during focused work, or forcing a fresh network reconnection when cellular service is misbehaving. Because it's a single toggle rather than three separate ones, it's also the quickest way to fully disconnect a device in an emergency or privacy-sensitive situation.",
  bestPractices: [
    "Re-enable Wi-Fi after turning on Airplane Mode during flights with in-flight Wi-Fi, since most airlines allow this",
    "Use Airplane Mode as a quick troubleshooting step when cellular signal seems stuck, toggling it off and on to force a network reconnect",
    "Avoid relying on Airplane Mode alone for privacy, since GPS and offline app data may still function",
    "Check that alarms still work in Airplane Mode, since they generally do not require connectivity",
  ],
  commonIssues: [
    { issue: "Wi-Fi turns off automatically after enabling Airplane Mode", fix: "This is expected; manually re-enable Wi-Fi from quick settings after Airplane Mode is on" },
    { issue: "Calls fail immediately after disabling Airplane Mode", fix: "Wait several seconds for the cellular radio to reconnect and register with the carrier network" },
    { issue: "Airplane Mode won't toggle off", fix: "Restart the device, since a stuck radio driver occasionally requires a reboot to recover" },
  ],
  faqs: [
    { q: "Does Airplane Mode disable GPS?", a: "No, GPS location can still function in Airplane Mode on most devices since it doesn't require a network connection." },
    { q: "Can I still use offline apps or music in Airplane Mode?", a: "Yes, any app or content that doesn't require an active internet connection continues to work normally." },
    { q: "Does Airplane Mode save more battery than turning off Wi-Fi and Bluetooth manually?", a: "It's roughly equivalent, but it also disables the cellular radio, which is often the largest additional battery saving." },
  ],
  tipsAndTricks: [
    "Add the Airplane Mode tile to your quick settings panel for one-swipe access",
    "Use it briefly to force a cellular network handoff if you're stuck on a weak signal after moving locations",
  ],
  relatedSettingIds: ["android-wifi", "android-bluetooth", "android-hotspot-tethering"],
  afterImageContent: {
    heading: "How Airplane Mode Works",
    paragraphs: [
      "Enabling Airplane Mode sends a command to the device's radio hardware to power down cellular, Wi-Fi, and Bluetooth chips simultaneously.",
      "After the initial toggle, Android allows Wi-Fi and Bluetooth to be switched back on independently while keeping the cellular radio off, a mode airlines increasingly permit for in-flight connectivity.",
    ],
    steps: [
      "Swipe down to open quick settings",
      "Tap the Airplane Mode icon to enable it",
      "Optionally re-enable Wi-Fi or Bluetooth from the same panel",
      "Tap the icon again to disable Airplane Mode and restore full connectivity",
    ],
  },
},
{
  id: "android-sim-esim-manager",
  title: "SIM & eSIM Manager",
  icon: Signal,
  platform: "android",
  category: "connectivity-network",
  controlType: "action",
  heading: "Manage physical SIM and eSIM profiles and mobile lines",
  description: "The SIM Manager lets you view, name, activate, or remove physical SIM cards and downloaded eSIM profiles, choose a default line for calls, texts, and data, and set up dual-SIM configurations on supported devices.",
  details: [
    "Supports activating a new eSIM by scanning a carrier QR code or using carrier apps",
    "Lets you set separate default lines for calls, texts, and mobile data",
    "Renames each SIM or eSIM for easier identification",
    "Toggles individual lines on or off without physically removing a SIM card",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "As eSIM adoption grows, especially for travel plans and dual-line setups separating work and personal numbers, the SIM Manager has become the control center for a feature that used to require physically swapping cards. Correctly configuring default lines for calls versus data avoids situations like accidentally roaming on the wrong carrier or texts going out from the wrong number.",
  bestPractices: [
    "Name each line clearly, such as 'Personal' and 'Work', to avoid confusion when switching defaults",
    "Set mobile data to the line with the better or cheaper data plan before traveling",
    "Download travel eSIMs in advance and keep them installed but toggled off until needed",
    "Remove unused eSIM profiles periodically since some carriers limit the number of profiles a device can store",
  ],
  commonIssues: [
    { issue: "New eSIM won't activate after scanning the QR code", fix: "Confirm a stable Wi-Fi connection during activation, since eSIM downloads occur over data or Wi-Fi before the profile is usable" },
    { issue: "Calls go out on the wrong line", fix: "Recheck the default line set for calls specifically, separate from the data default" },
    { issue: "Roaming charges appear unexpectedly", fix: "Disable data roaming on lines not intended for use while traveling, from within this same menu" },
  ],
  faqs: [
    { q: "Can I have a physical SIM and an eSIM active at the same time?", a: "Yes, most modern dual-SIM devices support one physical SIM alongside one or more eSIM profiles simultaneously." },
    { q: "What happens if I get a new phone?", a: "eSIM profiles generally need to be transferred or re-downloaded from the carrier for the new device; they don't move automatically." },
    { q: "Can I use two eSIMs without a physical SIM at all?", a: "Yes, on eSIM-only devices you can typically store and switch between multiple downloaded eSIM profiles." },
  ],
  tipsAndTricks: [
    "Keep a backup physical SIM as a fallback if traveling somewhere with limited eSIM carrier support",
    "Use the per-line data roaming toggle instead of Airplane Mode when you only want to block one line's roaming",
  ],
  relatedSettingIds: ["android-data-usage", "android-hotspot-tethering", "android-airplane-mode"],
  afterImageContent: {
    heading: "How SIM & eSIM Manager Works",
    paragraphs: [
      "This screen lists every active SIM slot and downloaded eSIM profile, showing carrier name, phone number, and current status for each.",
      "Selecting a line lets you rename it, toggle it on or off, or set it as the default for calls, texts, or mobile data independently of the other lines.",
    ],
    steps: [
      "Open Settings",
      "Tap Network & internet",
      "Tap SIMs (or SIM card manager)",
      "Select a SIM to rename, toggle, or set as default",
      "Tap Add eSIM to activate a new downloaded profile via QR code or carrier app",
    ],
  },
},
{
  id: "android-private-dns",
  title: "Private DNS",
  icon: Router,
  platform: "android",
  category: "connectivity-network",
  controlType: "action",
  heading: "Encrypt DNS lookups with a private DNS provider",
  description: "Private DNS routes domain name lookups through an encrypted DNS-over-TLS connection to a chosen provider, such as Google or Cloudflare, preventing networks along the way from seeing or tampering with which sites you're visiting.",
  details: [
    "Offers Automatic, Off, or Private DNS provider hostname modes",
    "Applies across both Wi-Fi and mobile data connections",
    "Common providers include Google (dns.google), Cloudflare (1dot1dot1dot1.cloudflare-dns.com), and others",
    "Works independently from, and can be combined with, a VPN",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "Standard DNS lookups are unencrypted by default, meaning any network operator, from a coffee shop router to an ISP, can see and potentially log every domain a device visits, even over an otherwise HTTPS-secured connection. Enabling Private DNS closes that visibility gap without needing a full VPN, adding a meaningful layer of privacy and tamper-resistance for a setting that takes seconds to configure.",
  bestPractices: [
    "Choose a well-known, reputable DNS provider hostname rather than an unverified third party",
    "Leave it on Automatic if unsure, since this opportunistically upgrades to encrypted DNS when the network supports it",
    "Combine with a VPN for full traffic encryption, since Private DNS alone doesn't hide browsing content, only DNS queries",
    "Test connectivity after switching providers, since some hostnames may be blocked on certain networks",
  ],
  commonIssues: [
    { issue: "Internet stops working after setting a Private DNS hostname", fix: "Verify the hostname was typed correctly, or switch back to Automatic if the chosen provider is unreachable on the current network" },
    { issue: "Some apps fail to connect despite normal browsing working", fix: "Certain corporate or public networks block non-standard DNS ports; switch to Automatic or Off on those specific networks" },
    { issue: "Setting reverts unexpectedly", fix: "Check for a network-specific override or a managed device policy enforcing DNS settings" },
  ],
  faqs: [
    { q: "Does Private DNS replace a VPN?", a: "No, it only encrypts DNS lookups; a VPN additionally encrypts and reroutes the actual traffic content." },
    { q: "Will this slow down browsing?", a: "Any slowdown is typically negligible with a reliable provider, and some providers are optimized for low latency." },
    { q: "Can my carrier still see what sites I visit if Private DNS is on?", a: "They can see encrypted traffic to an IP address, but not the plaintext domain name that a standard DNS lookup would reveal." },
  ],
  tipsAndTricks: [
    "Use a DNS provider that also offers ad or tracker blocking at the DNS level for a bonus privacy benefit",
    "Set this once system-wide rather than relying on individual apps or browsers with their own DNS settings",
  ],
  relatedSettingIds: ["android-wifi", "android-vpn", "android-data-usage"],
  afterImageContent: {
    heading: "How Private DNS Works",
    paragraphs: [
      "When set to a specific provider hostname, Android establishes an encrypted DNS-over-TLS connection to that provider for every domain name lookup the device performs.",
      "In Automatic mode, Android attempts encrypted DNS opportunistically when the current network's DNS server supports it, falling back to standard DNS otherwise.",
    ],
    steps: [
      "Open Settings",
      "Tap Network & internet",
      "Tap Private DNS",
      "Choose Automatic, Off, or Private DNS provider hostname",
      "If choosing a provider, enter its hostname and save",
    ],
  },
},
{
  id: "android-fast-pair",
  title: "Fast Pair",
  icon: BluetoothIcon,
  platform: "android",
  category: "devices-peripherals",
  controlType: "action",
  heading: "Quickly pair supported Bluetooth accessories with a tap",
  description: "Fast Pair detects nearby supported Bluetooth accessories, such as earbuds or speakers, in pairing mode and shows a one-tap notification to connect instantly, skipping the usual manual Bluetooth pairing menu.",
  details: [
    "Automatically surfaces a pairing card when a supported device is nearby and discoverable",
    "Works without opening the Bluetooth settings menu manually",
    "Can also trigger a setup notification for accessories not yet owned, when in a retail display",
    "Paired accessories sync their name and battery level to Android's Fast Pair-compatible UI",
  ],
  redirectUrl: "https://support.google.com/pixelphone/",
  whyItMatters: "Manual Bluetooth pairing, with its multi-step menu navigation and matching passcodes, is a common point of friction for less technical users setting up new earbuds or speakers. Fast Pair removes nearly all of that friction for supported accessories, turning pairing into a single notification tap, which matters most for accessory categories, like true wireless earbuds, that people pair and re-pair frequently across multiple devices.",
  bestPractices: [
    "Keep Bluetooth enabled and Fast Pair notifications on to benefit from automatic detection",
    "Check accessory packaging for a Fast Pair logo to confirm compatibility before assuming the feature will trigger",
    "Use the Bluetooth menu manually if a Fast Pair card doesn't appear within a few seconds of the accessory being in pairing mode",
    "Rename paired accessories through this menu for clearer identification across audio output switchers",
  ],
  commonIssues: [
    { issue: "Fast Pair notification never appears", fix: "Confirm the accessory is genuinely in pairing mode and that both Bluetooth and location services are enabled, since scanning relies on them" },
    { issue: "Accessory pairs but audio doesn't route correctly", fix: "Manually select the accessory from the media output switcher after pairing completes" },
    { issue: "Device shows as pairable but connection fails", fix: "Forget the device from Bluetooth settings and retry the Fast Pair flow from scratch" },
  ],
  faqs: [
    { q: "Does Fast Pair work with all Bluetooth headphones?", a: "No, only accessories specifically built with Fast Pair support show the one-tap card; others still use standard manual pairing." },
    { q: "Can Fast Pair devices also pair with other phones?", a: "Yes, standard Bluetooth pairing to other devices still works independently of Fast Pair." },
    { q: "Is Fast Pair the same as Nearby Share?", a: "No, Nearby Share transfers files between devices, while Fast Pair is specifically for connecting Bluetooth accessories." },
  ],
  tipsAndTricks: [
    "Look for the Fast Pair logo on accessory retail packaging as a quick compatibility check before buying",
    "Keep the accessory's case lid open near the phone, since many earbuds enter pairing mode automatically that way",
  ],
  relatedSettingIds: ["android-bluetooth", "android-connected-devices", "android-previously-connected-devices"],
  afterImageContent: {
    heading: "How Fast Pair Works",
    paragraphs: [
      "Fast Pair uses low-energy Bluetooth broadcasts to detect nearby supported accessories that are in discoverable pairing mode.",
      "When one is found, Android surfaces a notification card showing the accessory's name and image; tapping it completes the full Bluetooth pairing handshake automatically.",
    ],
    steps: [
      "Enable Bluetooth from quick settings or Settings",
      "Put the accessory into pairing mode as directed by its manual",
      "Wait for the Fast Pair notification card to appear",
      "Tap the card to connect instantly",
    ],
  },
},
{
  id: "android-previously-connected-devices",
  title: "Previously Connected Devices",
  icon: Clock,
  platform: "android",
  category: "devices-peripherals",
  controlType: "action",
  heading: "View and manage the history of paired accessories",
  description: "This screen lists every Bluetooth accessory, Chromecast, or other device the phone has connected to in the past, even if currently disconnected or out of range, so you can reconnect, rename, or permanently forget them.",
  details: [
    "Shows connection history beyond just currently active devices",
    "Allows forgetting a device to remove its stored pairing keys entirely",
    "Includes both Bluetooth accessories and Wi-Fi-based devices like Chromecasts",
    "Tapping a listed device attempts to reconnect if it's currently in range",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "Over months or years of use, a phone accumulates dozens of paired accessories, rental car systems, old headphones, hotel speakers, and forgetting to clean these up both clutters the pairing list and can pose a minor security consideration if a stored device's pairing key is ever misused. This screen is also the fastest way to reconnect to an accessory that dropped out of range without repeating the full pairing process.",
  bestPractices: [
    "Forget accessories you no longer own, such as an old pair of headphones or a rental car's system",
    "Use this list to quickly reconnect to a known accessory instead of starting a new pairing flow",
    "Rename ambiguous device names, like a generic manufacturer ID, for easier identification later",
    "Periodically review the list on shared or work devices where past connections may include untrusted hardware",
  ],
  commonIssues: [
    { issue: "A device won't reconnect from this list", fix: "Forget it and re-pair from scratch, since a stale pairing key is a common cause of reconnect failures" },
    { issue: "List shows a device that was never intentionally paired", fix: "Forget it immediately, particularly on a device that has been in public or shared use" },
    { issue: "Reconnecting is slow", fix: "Ensure the accessory itself is powered on and within range, since range and battery affect reconnection speed" },
  ],
  faqs: [
    { q: "Does forgetting a device delete data stored on it?", a: "No, it only removes the phone's stored pairing credentials, not any data on the accessory itself." },
    { q: "Can I see when a device was last connected?", a: "Most versions show a 'last connected' timestamp or relative time next to each entry." },
    { q: "Does this include Wi-Fi networks too?", a: "No, saved Wi-Fi networks are managed separately under Wi-Fi settings; this list is for paired accessories and cast devices." },
  ],
  tipsAndTricks: [
    "Use this list after a factory reset scare to confirm no unfamiliar devices have connected",
    "Forget rental car Bluetooth pairings before returning the vehicle to avoid leaving contact data accessible to the next renter",
  ],
  relatedSettingIds: ["android-bluetooth", "android-fast-pair", "android-connected-devices"],
  afterImageContent: {
    heading: "How Previously Connected Devices Works",
    paragraphs: [
      "This list is built from the device's stored pairing history, keeping an entry for every accessory ever successfully connected, regardless of current range or power state.",
      "Selecting an entry offers options to reconnect, rename, or forget, with forgetting permanently erasing the stored pairing key.",
    ],
    steps: [
      "Open Settings",
      "Tap Connected devices",
      "Tap See all to view the previously connected devices list",
      "Select a device to reconnect, rename, or forget",
    ],
  },
},
{
  id: "android-phone-hub-cross-device",
  title: "Phone Hub / Cross-Device Services",
  icon: Share2,
  platform: "android",
  category: "devices-peripherals",
  controlType: "action",
  heading: "Link your phone to a Chromebook for messages and files",
  description: "Cross-device services link an Android phone to a Chromebook or other trusted devices signed into the same Google Account, enabling features like viewing phone notifications, texting, checking battery level, and instantly tethering internet access from the Chromebook's Phone Hub panel.",
  details: [
    "Requires signing both devices into the same Google Account",
    "Enables Instant Tethering to auto-connect the Chromebook to the phone's hotspot",
    "Surfaces phone notifications and recent Chrome tabs directly on the linked Chromebook",
    "Individual features (messages, tethering, notifications) can be toggled independently",
  ],
  redirectUrl: "https://support.google.com/pixelphone/",
  whyItMatters: "Constantly picking up a phone to check a text or manually turning on a hotspot breaks focus when working on a laptop nearby; cross-device linking surfaces the phone's most useful functions directly inside the Chromebook interface, reducing context switching. For users in the Google ecosystem with both an Android phone and a Chromebook, this integration is one of the more distinctive productivity benefits of staying within that ecosystem.",
  bestPractices: [
    "Enable only the specific cross-device features you'll actually use to avoid unnecessary background activity",
    "Keep Bluetooth and Wi-Fi enabled on both devices, since several features depend on both radios",
    "Use Instant Tethering only when needed to avoid unexpectedly draining phone data or battery",
    "Review linked devices periodically and unlink any Chromebook no longer in regular use",
  ],
  commonIssues: [
    { issue: "Phone Hub doesn't show notifications", fix: "Confirm notification access is granted for cross-device services in the phone's notification access settings" },
    { issue: "Instant Tethering doesn't connect automatically", fix: "Ensure both devices are signed into the same account and that Bluetooth is enabled on both" },
    { issue: "Messaging feature fails to send texts from the Chromebook", fix: "Reconnect the linked devices from the Chromebook's Phone Hub settings and confirm the phone has cellular signal" },
  ],
  faqs: [
    { q: "Do both devices need to be on the same Wi-Fi network?", a: "Not necessarily for basic linking, though some features work best on the same network or with Bluetooth in range." },
    { q: "Can I link more than one Chromebook to my phone?", a: "Yes, multiple Chromebooks signed into the same account can each link to the same phone." },
    { q: "Does this drain phone battery significantly?", a: "The background connection uses minimal battery, though Instant Tethering itself uses more when actively providing internet access." },
  ],
  tipsAndTricks: [
    "Use Phone Hub's 'Do Not Disturb' sync to silence the Chromebook automatically when the phone is in Do Not Disturb",
    "Enable the eye icon feature to hide notification content on the Chromebook lock screen for added privacy",
  ],
  relatedSettingIds: ["android-connected-devices", "android-nearby-share", "android-cast"],
  afterImageContent: {
    heading: "How Cross-Device Services Work",
    paragraphs: [
      "Once both devices are signed into the same Google Account and linked, they exchange status and notification data over a secure Bluetooth and Wi-Fi connection.",
      "The Chromebook's Phone Hub panel then surfaces phone battery level, recent notifications, hotspot controls, and messaging directly without needing to touch the phone.",
    ],
    steps: [
      "Open Settings on the phone",
      "Tap Connected devices, then Connection preferences",
      "Select Cross-device services (or Phone Hub linking)",
      "Sign in and confirm the Chromebook to link",
      "Toggle individual features like notifications, tethering, and messaging",
    ],
  },
},
{
  id: "android-physical-keyboard",
  title: "Physical Keyboard Settings",
  icon: Keyboard,
  platform: "android",
  category: "devices-peripherals",
  controlType: "action",
  heading: "Configure layout and shortcuts for a connected keyboard",
  description: "Physical Keyboard settings appear once a Bluetooth or USB keyboard is connected, letting you select the correct keyboard layout, remap modifier keys, and enable keyboard shortcuts for navigating Android without touching the screen.",
  details: [
    "Auto-detects layout or lets you manually pick a language and layout variant",
    "Supports remapping Caps Lock and other modifier keys",
    "Shows a list of available system shortcuts once a keyboard is connected",
    "Settings are saved per connected keyboard device",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "Using a phone or tablet with a full physical keyboard, common in tablet-as-laptop setups, changes the interaction model enough that dedicated configuration matters, from getting special characters to type correctly for a given language layout to enabling productivity shortcuts like app switching. Without correctly configuring layout, users can end up with mismatched symbols or punctuation, which is especially disruptive for password entry and coding.",
  bestPractices: [
    "Manually verify the detected layout by testing special characters and punctuation before relying on it for extended typing",
    "Learn the core system shortcuts (like app switching and search) shown in this menu to get the most out of a physical keyboard",
    "Remap Caps Lock to a more useful function if it's rarely used in your language",
    "Reconnect and reselect layout if switching between keyboards with different regional layouts",
  ],
  commonIssues: [
    { issue: "Wrong characters appear when typing symbols", fix: "Manually select the correct keyboard layout instead of relying on auto-detection" },
    { issue: "Keyboard shortcuts don't respond", fix: "Confirm the keyboard is fully connected and recognized in the Physical keyboard settings list" },
    { issue: "Settings reset after reconnecting", fix: "Each physical keyboard stores settings by device identity; reconfigure if using a different or replacement keyboard" },
  ],
  faqs: [
    { q: "Does this work with both USB and Bluetooth keyboards?", a: "Yes, any recognized physical keyboard, wired or wireless, appears in this menu once connected." },
    { q: "Can I use multiple keyboard layouts and switch between them?", a: "Yes, multiple layouts can be added and cycled through using a keyboard shortcut." },
    { q: "Will on-screen keyboard settings also apply here?", a: "No, physical and on-screen keyboards have separate settings, though both fall under the broader Languages & input menu." },
  ],
  tipsAndTricks: [
    "Press the shortcut helper key combination shown in settings to view all available shortcuts at any time",
    "Use a keyboard with a dedicated language switch key for fast bilingual typing without menu diving",
  ],
  relatedSettingIds: ["android-language-input", "android-usb-preferences", "android-connected-devices"],
  afterImageContent: {
    heading: "How Physical Keyboard Settings Work",
    paragraphs: [
      "Once Android detects a connected physical keyboard, it adds an entry for that specific device under Physical keyboard settings.",
      "From there, layout, modifier key remapping, and shortcut references are configured per keyboard, allowing different keyboards to retain their own distinct settings.",
    ],
    steps: [
      "Connect a Bluetooth or USB keyboard to the device",
      "Open Settings",
      "Tap System, then Languages & input",
      "Select Physical keyboard",
      "Choose the connected keyboard to adjust its layout and shortcuts",
    ],
  },
},
{
  id: "android-stylus-settings",
  title: "Stylus Settings",
  icon: PenTool,
  platform: "android",
  category: "devices-peripherals",
  controlType: "action",
  heading: "Customize button actions and handwriting for a stylus",
  description: "Stylus settings let you configure what happens when a supported stylus's button is pressed, enable handwriting-to-text conversion in text fields, and adjust pointer and pressure behavior for compatible pens like Samsung's S Pen or other Bluetooth styluses.",
  details: [
    "Assigns actions to the stylus button, such as taking a screenshot or opening notes",
    "Enables handwriting recognition directly inside standard text input fields",
    "Shows battery level for Bluetooth-enabled styluses",
    "Adjusts pointer icon visibility and hover preview where supported",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "For devices that support stylus input, the pen often becomes the primary input method for note-taking and drawing, so correctly configuring button shortcuts and handwriting conversion directly affects how natural and efficient that workflow feels. Without enabling handwriting-to-text, for example, a user has to switch back to the on-screen keyboard for any text field, defeating much of the convenience of owning a stylus in the first place.",
  bestPractices: [
    "Enable handwriting-to-text if you plan to take notes with the stylus rather than typing",
    "Assign the stylus button to your most-used quick action, such as screenshot or screen-off note",
    "Check stylus battery level periodically for Bluetooth-enabled pens to avoid it dying mid-use",
    "Recalibrate or reconnect the stylus if pointer tracking feels laggy or offset",
  ],
  commonIssues: [
    { issue: "Stylus button does nothing when pressed", fix: "Confirm a specific action is assigned in Stylus settings, since some actions require it to be explicitly enabled" },
    { issue: "Handwriting isn't converting to text", fix: "Enable the handwriting recognition toggle and confirm the correct language pack is installed" },
    { issue: "Stylus disconnects frequently", fix: "Check stylus battery level and re-pair via Bluetooth settings if it's a wireless model" },
  ],
  faqs: [
    { q: "Does this work with any stylus, or only the manufacturer's own pen?", a: "Basic pressure and hover support often works with any compatible passive stylus, but button actions and Bluetooth features usually require the manufacturer's specific pen." },
    { q: "Can I use the stylus without Bluetooth?", a: "Yes, drawing and writing typically work without Bluetooth; Bluetooth is only needed for button shortcuts and battery reporting on supported pens." },
    { q: "Does handwriting recognition work offline?", a: "Yes, once the language pack is downloaded, handwriting recognition generally works without an internet connection." },
  ],
  tipsAndTricks: [
    "Set the stylus button double-press action to something different from the single-press for more shortcuts in less space",
    "Use hover preview, if supported, to see button tooltips before committing to a tap",
  ],
  relatedSettingIds: ["android-connected-devices", "android-bluetooth"],
  afterImageContent: {
    heading: "How Stylus Settings Work",
    paragraphs: [
      "When a compatible stylus is detected, either via Bluetooth pairing or digitizer proximity, Android surfaces a dedicated Stylus settings page.",
      "From there, button actions, handwriting recognition, and pointer behavior can be configured, with changes applying immediately across all apps that support stylus input.",
    ],
    steps: [
      "Open Settings",
      "Tap System (or Advanced features on some devices)",
      "Select Stylus",
      "Assign button actions and enable handwriting-to-text",
      "Pair via Bluetooth if using a wireless stylus model",
    ],
  },
},
{
  id: "android-font-display-size",
  title: "Font Size & Display Size",
  icon: ZoomIn,
  platform: "android",
  category: "display-sound-notifications",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Increase text and on-screen element size app-wide",
  description: "Font Size and Display Size sliders scale text and interface elements system-wide, independently of each other, so text can be enlarged for readability while overall layout density stays the same, or the entire UI can be scaled up including icons and spacing.",
  details: [
    "Font size scales text only, across system menus and most apps",
    "Display size scales icons, spacing, and layout density in addition to text",
    "Both include a live preview before applying changes",
    "Extreme settings may cause some third-party apps to display awkwardly",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "Default text and UI sizing is a compromise that doesn't work for everyone, particularly users with low vision or anyone using a phone at arm's length or in bright sunlight. Because both sliders apply system-wide rather than per-app, adjusting them once improves readability consistently everywhere rather than requiring changes inside each individual app that even offers its own text size option.",
  bestPractices: [
    "Adjust font size first and display size second, since they interact and are easier to tune sequentially",
    "Use the live preview to check readability before committing to an extreme setting",
    "Test a few frequently used apps after a significant size change to catch any layout issues early",
    "Consider a moderate increase rather than the maximum, since very large settings can cause more UI clipping issues",
  ],
  commonIssues: [
    { issue: "Some app layouts look broken after increasing display size", fix: "Reduce display size slightly, since not all third-party apps scale gracefully at extreme sizes" },
    { issue: "Text looks fine in Settings but not in a specific app", fix: "Check whether that app has its own separate in-app text size setting overriding the system one" },
    { issue: "Icons and text feel mismatched in size", fix: "Adjust font size and display size independently rather than assuming they move together" },
  ],
  faqs: [
    { q: "What's the difference between font size and display size?", a: "Font size only changes text, while display size scales the whole interface including icons, buttons, and spacing." },
    { q: "Will this affect photos and videos?", a: "No, media content itself is unaffected; only interface elements and text scale." },
    { q: "Can I reset to default quickly?", a: "Yes, both sliders have a default marked position that can be dragged back to instantly." },
  ],
  tipsAndTricks: [
    "Combine with bold text (if available) for an extra readability boost without further increasing size",
    "Use the accessibility shortcut to bind quick access to font size for situational adjustment, like reading in dim light",
  ],
  relatedSettingIds: ["android-display-dark-mode", "android-magnification", "android-accessibility"],
  afterImageContent: {
    heading: "How Font Size & Display Size Work",
    paragraphs: [
      "Font size applies a text scaling factor that Android and most apps respect when rendering any text element, from body copy to button labels.",
      "Display size applies a broader density scaling factor, resizing icons, touch targets, and spacing in addition to text, effectively zooming the whole interface.",
    ],
    steps: [
      "Open Settings",
      "Tap Display",
      "Select Font size or Display size",
      "Drag the slider and check the live preview",
      "Tap Apply to save the change",
    ],
  },
},
{
  id: "android-screen-timeout",
  title: "Screen Timeout",
  icon: Clock,
  platform: "android",
  category: "display-sound-notifications",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Set how long the screen stays on before locking",
  description: "Screen Timeout controls how many seconds or minutes of inactivity elapse before the display automatically turns off and locks, balancing convenience against battery use and security.",
  details: [
    "Offers preset durations typically ranging from 15 seconds to 30 minutes",
    "Some devices include an 'until manually turned off' option requiring explicit selection",
    "Works alongside, but separately from, Adaptive/Smart features that keep the screen on while you're looking at it",
    "Shorter timeouts reduce battery drain from an idle display",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "Screen timeout is a direct tradeoff between convenience and both battery life and security: a longer timeout means less frequent unlocking but more battery drained by an idle display and a longer window where an unattended, unlocked phone is accessible. Getting this setting right for your own habits, rather than leaving a manufacturer default, is one of the simplest changes that meaningfully affects both daily battery life and casual security.",
  bestPractices: [
    "Choose the shortest timeout you find tolerable to save battery and reduce unattended-phone exposure",
    "Pair a short timeout with a fast unlock method like fingerprint or face unlock to offset the inconvenience",
    "Use a longer timeout temporarily while following a recipe or reading, then revert afterward",
    "Avoid 'never turn off' settings except for specific temporary use cases, since it significantly impacts battery",
  ],
  commonIssues: [
    { issue: "Screen turns off too quickly while reading", fix: "Increase the timeout duration, or check whether an adaptive 'stay awake while looking' feature is available and enabled" },
    { issue: "Screen stays on unexpectedly long", fix: "Confirm a development setting like 'Stay awake while charging' isn't overriding the normal timeout" },
    { issue: "Timeout option is grayed out", fix: "Check for a device policy from work profile management that may be enforcing a fixed timeout" },
  ],
  faqs: [
    { q: "Does screen timeout affect video playback?", a: "No, video and media apps typically request a wake lock that keeps the screen on regardless of the timeout setting." },
    { q: "Is there a way to keep the screen on based on whether I'm looking at it?", a: "Some devices offer a face-detection-based option that prevents timeout while you're actively viewing the screen." },
    { q: "Does a shorter timeout meaningfully save battery?", a: "Yes, since the display is often one of the largest battery consumers, especially with brighter or larger screens." },
  ],
  tipsAndTricks: [
    "Use Settings search to jump directly to 'Screen timeout' instead of navigating the full Display menu",
    "Set a shorter timeout on the lock screen specifically if your device allows lock and unlock timeouts to differ",
  ],
  relatedSettingIds: ["android-display-dark-mode", "android-do-not-disturb"],
  afterImageContent: {
    heading: "How Screen Timeout Works",
    paragraphs: [
      "Once the selected number of seconds or minutes passes without any touch input, sensor activity, or active wake lock from an app, Android turns off the display and applies the lock screen.",
      "Any user interaction, including touch or, on supported devices, detected attention, resets the countdown back to the full duration.",
    ],
    steps: [
      "Open Settings",
      "Tap Display",
      "Select Screen timeout",
      "Choose a duration from the list",
    ],
  },
},
{
  id: "android-auto-rotate",
  title: "Auto-Rotate Screen",
  icon: RotateCcw,
  platform: "android",
  category: "display-sound-notifications",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Let the screen rotate automatically with device orientation",
  description: "Auto-Rotate uses the device's accelerometer to switch the display between portrait and landscape orientation as the device is physically turned, and can be toggled off to lock the screen to a single orientation.",
  details: [
    "Uses the built-in accelerometer and gyroscope to detect orientation",
    "Some devices add a face-detection option to rotate based on face orientation instead of device tilt",
    "Can be quickly toggled via a rotation icon that appears in the status bar when locked",
    "Individual apps can sometimes override the system setting, such as forcing landscape for video playback",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "Auto-rotate is essential for tasks like watching widescreen video or using landscape-optimized apps, but can also be a nuisance when lying down or reading in bed causes unwanted rotation. Having quick, reliable control over it, including the on-demand rotation icon that appears even when auto-rotate is off, lets users get the best of both a locked default orientation and situational landscape flexibility.",
  bestPractices: [
    "Leave auto-rotate off by default and use the on-screen rotate icon for occasional landscape needs if unwanted rotation is a recurring annoyance",
    "Enable face-detection-based rotation if available and if lying down frequently causes unwanted flips",
    "Check for an app-specific orientation lock if a single app keeps ignoring the system-wide setting",
    "Use the quick settings tile for fast toggling instead of navigating into Display settings each time",
  ],
  commonIssues: [
    { issue: "Screen won't rotate even with auto-rotate on", fix: "Check for an app-specific orientation lock, since some apps intentionally restrict rotation regardless of the system setting" },
    { issue: "Screen rotates unexpectedly while lying down", fix: "Turn off auto-rotate and use the manual rotation icon in the status bar when landscape is actually needed" },
    { issue: "Rotation icon doesn't appear when auto-rotate is off", fix: "Ensure the device is tilted enough to register a landscape orientation change, since the icon only appears on a detected tilt" },
  ],
  faqs: [
    { q: "Does auto-rotate work in all apps?", a: "Most apps respect the system setting, but some force a specific orientation regardless, particularly games and video players." },
    { q: "What is the difference between auto-rotate and face-based rotation?", a: "Standard auto-rotate uses the accelerometer to detect physical tilt, while face-based rotation uses the front camera to detect face orientation instead." },
    { q: "Can I lock rotation for just one app?", a: "Only if that specific app provides its own orientation lock option; the system setting is otherwise global." },
  ],
  tipsAndTricks: [
    "Add the Auto-rotate tile to quick settings for a one-swipe toggle",
    "Use the manual rotate icon that appears in the status bar for occasional landscape use without permanently enabling auto-rotate",
  ],
  relatedSettingIds: ["android-display-dark-mode", "android-screen-timeout"],
  afterImageContent: {
    heading: "How Auto-Rotate Works",
    paragraphs: [
      "Auto-Rotate continuously reads accelerometer and gyroscope data to determine the device's physical orientation relative to gravity.",
      "When enabled and a supported orientation change is detected, Android smoothly transitions the display layout between portrait and landscape, unless the active app has requested a fixed orientation.",
    ],
    steps: [
      "Swipe down to open quick settings",
      "Tap the Auto-rotate tile to toggle it",
      "Alternatively, open Settings, tap Display, then toggle Auto-rotate screen",
    ],
  },
},
{
  id: "android-one-handed-mode",
  title: "One-Handed Mode",
  icon: Smartphone,
  platform: "android",
  category: "display-sound-notifications",
  controlType: "action",
  heading: "Shrink the display to reach the top of the screen easily",
  description: "One-Handed Mode temporarily shrinks and shifts the entire screen content down toward the bottom half of the display, making it possible to reach top corners and status bar elements with one thumb on large-screen phones.",
  details: [
    "Triggered by a swipe-down gesture on the navigation bar or a dedicated shortcut",
    "Automatically reverts to full size after a short timeout or a tap outside the shrunk area",
    "Available on supported manufacturer skins and some stock Android versions",
    "Does not resize individual app content, only repositions the rendered display",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "As phone screens have grown larger, reaching the top corners or status bar with one thumb has become physically difficult for many users, particularly during one-handed situations like standing on transit or holding a bag in the other hand. One-Handed Mode addresses this directly without requiring a case, grip accessory, or permanently smaller display setting, activating only when needed.",
  bestPractices: [
    "Learn the specific trigger gesture for your device model, since it varies between manufacturers",
    "Use it situationally rather than expecting it to stay active, since it's designed to auto-revert quickly",
    "Combine with a shorter screen timeout if reachability, not just screen-on time, is the main concern",
    "Check manufacturer-specific settings menus if the feature isn't found under the standard Display menu",
  ],
  commonIssues: [
    { issue: "One-handed mode option isn't available", fix: "Confirm the specific device and Android skin supports the feature, since it's not universal across all manufacturers" },
    { issue: "Mode exits too quickly", fix: "Check for a duration or timeout setting within one-handed mode's own options, if the device offers one" },
    { issue: "Gesture doesn't trigger the mode reliably", fix: "Practice the exact swipe motion required, since it can be easy to trigger a different navigation gesture instead" },
  ],
  faqs: [
    { q: "Does one-handed mode work with gesture navigation and button navigation both?", a: "Support varies by manufacturer; some require gesture navigation to be enabled for the shrink gesture to work." },
    { q: "Does it change app layouts?", a: "No, it only shrinks and repositions the rendered screen; apps are not resized or restructured." },
    { q: "Is this the same as a reachability feature on other platforms?", a: "It serves the same general purpose of easier one-handed reach, though implementation details differ by manufacturer." },
  ],
  tipsAndTricks: [
    "Use it briefly to dismiss a notification or tap a top corner icon rather than trying to keep it active for extended use",
    "Check for an adjustable size or position setting on manufacturer skins that offer more customization",
  ],
  relatedSettingIds: ["android-display-dark-mode", "android-accessibility"],
  afterImageContent: {
    heading: "How One-Handed Mode Works",
    paragraphs: [
      "When triggered, Android scales down the rendered display output and shifts it toward the bottom of the screen, leaving the top portion blank and reachable areas within thumb range.",
      "The mode is temporary by design, automatically reverting to full screen after a short period of inactivity or when you tap the blank area above the shrunk content.",
    ],
    steps: [
      "Open Settings",
      "Tap Display",
      "Select One-handed mode (naming may vary by manufacturer)",
      "Enable the feature and note the trigger gesture shown",
      "Perform the gesture from any screen to activate it",
    ],
  },
},
{
  id: "android-independent-volume-controls",
  title: "Independent Volume Controls",
  icon: Volume2,
  platform: "android",
  category: "display-sound-notifications",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Set separate volume levels for media, calls, and alarms",
  description: "Android maintains separate volume streams for media, ringtone, notifications, calls, and alarms, each independently adjustable so, for example, media volume can be low for private listening while the alarm stream stays loud enough to wake you.",
  details: [
    "Includes distinct sliders for Media, Call, Ring & notification, and Alarm volume",
    "Accessible quickly via the physical volume buttons with an expand arrow for all sliders",
    "Notification volume can be linked to or separated from ring volume depending on device",
    "Each stream remembers its last set level independently across reboots",
  ],
  redirectUrl: "https://support.google.com/android/",
  whyItMatters: "A single master volume control would force an uncomfortable compromise, like a loud alarm meaning loud media too, or a silenced ringer meaning a silent alarm that fails to wake you up. Independent streams let each type of sound be tuned for its actual purpose, which is particularly important for the alarm stream, where accidentally low volume can mean sleeping through an important wake-up.",
  bestPractices: [
    "Set alarm volume to a level well above your typical media volume so a low media setting never risks a missed alarm",
    "Separate ring and notification volume if your device supports it, especially if calls need to be more noticeable than app pings",
    "Check call volume specifically after a software update, since it occasionally resets independently of other streams",
    "Use the expand arrow on the volume popup to review all streams at once rather than assuming the button controls the one you expect",
  ],
  commonIssues: [
    { issue: "Alarm doesn't sound loud enough despite full media volume", fix: "Adjust the alarm volume slider specifically, since it is entirely independent of the media stream" },
    { issue: "Phone rings silently despite normal notification sounds", fix: "Check that ring volume specifically hasn't been muted separately from notification volume" },
    { issue: "Volume button controls the wrong stream", fix: "Tap the expand arrow on the volume popup to select and adjust the intended stream directly" },
  ],
  faqs: [
    { q: "Why does pressing the volume button sometimes change media and sometimes ringtone volume?", a: "The physical buttons control whichever stream is currently active, such as media during playback or ringtone otherwise; use the expand arrow to target a specific stream directly." },
    { q: "Does Do Not Disturb override these individual sliders?", a: "Yes, Do Not Disturb can silence notification and call streams regardless of their individual slider positions." },
    { q: "Can alarm volume be different from ringtone volume?", a: "Yes, they are entirely separate streams and can be set to very different levels." },
  ],
  tipsAndTricks: [
    "Long-press the volume button popup to jump straight to full sound settings for finer control",
    "Set a distinct, more noticeable sound plus higher volume specifically for the alarm stream if you're a heavy sleeper",
  ],
  relatedSettingIds: ["android-sound-vibration", "android-do-not-disturb", "android-game-mode"],
  afterImageContent: {
    heading: "How Independent Volume Controls Work",
    paragraphs: [
      "Android's audio system maintains separate logical volume streams, each tracked and restored independently regardless of what the physical volume buttons most recently adjusted.",
      "Pressing the volume buttons controls the stream most contextually relevant at that moment, while the expanded volume panel exposes every stream's slider for direct adjustment.",
    ],
    steps: [
      "Press either physical volume button to open the quick volume popup",
      "Tap the down arrow or icon to expand all volume sliders",
      "Adjust Media, Call, Ring & notification, and Alarm independently",
      "Alternatively, open Settings, tap Sound & vibration, and adjust each slider there",
    ],
  },
},
{
  id: "android-themed-icons",
  title: "Themed Icons & Material You Colors",
  icon: Layers,
  platform: "android",
  category: "personalization",
  controlType: "action",
  heading: "Match app icons to your wallpaper",
  description: "Themed icons use Material You to extract a color palette from your current wallpaper and apply matching tints to supported app icons, widgets, and system menus.",
  details: [
    "Recolors compatible app icons to match the wallpaper's dominant palette",
    "Applies the same accent color across Quick Settings, widgets, and system menus",
    "Only affects apps built with adaptive/monochrome icon support",
    "Toggle is found under Wallpaper & style settings",
    "Updates automatically whenever the wallpaper changes",
  ],
  important: "Only apps that ship an adaptive themed icon will change color; most third-party apps keep their original icon.",
  redirectUrl: "https://support.google.com/android",
  whyItMatters: "Themed icons are the visual centerpiece of Android's Material You design language, letting the entire home screen feel cohesive instead of a grid of mismatched icon styles. For users who frequently change wallpapers, this setting keeps the phone feeling fresh and personal without manual re-theming. It also signals which apps have been updated with modern adaptive icon support, since only those change color. Disabling it reverts every icon to its original branded artwork, which some users prefer for faster app recognition.",
  bestPractices: [
    "Pick a wallpaper with a clear dominant color for the most noticeable theming effect",
    "Pair with a matching dark or light system theme for consistency",
    "Turn it off if you rely on brand colors to quickly spot apps",
    "Re-check theming after major app updates, since icon support can change",
  ],
  commonIssues: [
    { issue: "Most icons stay in their original colors", fix: "Themed icons only work for apps with adaptive icon support; many third-party apps have not opted in." },
    { issue: "Theme color doesn't update after changing wallpaper", fix: "Reselect the wallpaper and confirm 'Themed icons' is still toggled on in Wallpaper & style." },
    { issue: "Icons look washed out or low contrast", fix: "Switch to a wallpaper with richer color variation, since flat images produce a muted palette." },
  ],
  faqs: [
    { q: "Does this rename or replace my apps?", a: "No, it only recolors the icon artwork; app names, shortcuts, and functionality are unchanged." },
    { q: "Can I theme icons without Material You wallpaper colors?", a: "No, themed icons depend on the color palette generated from your current wallpaper." },
    { q: "Why do some folders look untinted?", a: "Folder icons only theme if every app inside supports themed icons." },
  ],
  tipsAndTricks: [
    "Try a few different wallpapers to see which palette produces the most legible themed icons",
    "Combine with dark theme for a more dramatic Material You look",
  ],
  relatedSettingIds: ["android-wallpaper-style", "android-home-screen-launcher", "android-icon-shape-grid"],
  updateFrequency: "Updates automatically when wallpaper changes",
  afterImageContent: {
    heading: "How Themed Icons Work",
    paragraphs: [
      "Android analyzes the active wallpaper to generate a Material You color palette, then applies that palette to supported app icons and system UI elements.",
      "Because theming depends on individual app support, the visual effect varies by device and by how many installed apps have adopted adaptive icons.",
    ],
    steps: [
      "Open Settings → Wallpaper & style",
      "Tap 'Themed icons' or 'Wallpaper colors'",
      "Toggle themed icons on or off",
      "Change your wallpaper to see the palette update automatically",
    ],
  },
},
{
  id: "android-icon-shape-grid",
  title: "App Icon Shape & Grid Size",
  icon: LayoutGrid,
  platform: "android",
  category: "personalization",
  controlType: "action",
  heading: "Adjust icon shape and home screen density",
  description: "Controls the outline shape used for app icons (circle, squircle, square, teardrop) and the number of rows and columns shown on the home screen grid.",
  details: [
    "Icon shape options typically include circle, squircle, rounded square, and square",
    "Grid size options range from compact (more icons per row) to spacious (fewer, larger icons)",
    "Changes apply instantly across the home screen and app drawer",
    "Available through the launcher's Home settings menu",
  ],
  redirectUrl: "https://support.google.com/android",
  whyItMatters: "Icon shape and grid density directly affect how much information fits on the home screen and how the interface feels visually. Power users who install many apps often prefer a denser grid to reduce swiping, while others prioritize larger, more legible icons for easier tapping. Because these are purely cosmetic settings with no functional trade-offs, they are a low-risk way to significantly change the phone's everyday feel.",
  bestPractices: [
    "Choose a denser grid only if you have good eyesight or a larger screen",
    "Match icon shape to your wallpaper style for visual consistency",
    "Test a layout for a day before committing, since muscle memory adjusts to icon positions",
  ],
  commonIssues: [
    { issue: "Grid size option is missing", fix: "This setting lives in the launcher app's own settings, not System settings, and may not exist on non-Pixel launchers." },
    { issue: "Icon shape doesn't apply to all apps", fix: "Some apps use custom-shaped icons that ignore the system mask; this is expected behavior." },
    { issue: "Widgets look misaligned after changing grid size", fix: "Resize or re-place widgets manually, since grid density changes can shift widget boundaries." },
  ],
  faqs: [
    { q: "Does this affect the lock screen or app drawer separately?", a: "Icon shape applies system-wide; grid size is usually specific to the home screen, with the app drawer sometimes adjustable separately." },
    { q: "Can third-party launchers use this setting?", a: "Only if installed through the default Pixel-style launcher; other launchers have their own grid and shape controls." },
  ],
  tipsAndTricks: [
    "Use a smaller grid size temporarily when reorganizing many apps",
    "Squircle and rounded-square shapes tend to match Material You theming best",
  ],
  relatedSettingIds: ["android-home-screen-launcher", "android-themed-icons", "android-wallpaper-style"],
  afterImageContent: {
    heading: "How Icon Shape & Grid Size Work",
    paragraphs: [
      "The launcher applies a mask over every app icon to enforce a consistent outline shape, then arranges icons in a grid whose row and column count you control.",
      "These are display-only settings; no app data, shortcuts, or install locations are affected.",
    ],
    steps: [
      "Long-press an empty area of the home screen",
      "Tap 'Home settings'",
      "Select 'Icon shape' or 'App icons' to change the outline",
      "Select 'Grid size' or 'Layout' to change row/column density",
    ],
  },
},
{
  id: "android-always-on-display",
  title: "Always-on Display Customization",
  icon: Moon,
  platform: "android",
  category: "personalization",
  controlType: "action",
  heading: "Show time and notifications on a dimmed screen",
  description: "Always-on Display (AOD) keeps a low-power version of the clock, notification icons, and optional 'At a Glance' info visible on the lock screen even when the phone is idle.",
  details: [
    "Choose between always showing, showing on tap, or scheduled time windows",
    "Customize which clock style and notification icons appear",
    "Can be limited to specific hours to save battery overnight",
    "Works with adaptive brightness to dim automatically in low light",
  ],
  important: "Keeping Always-on Display active continuously will noticeably reduce battery life, especially on OLED screens with static elements.",
  redirectUrl: "https://support.google.com/pixelphone",
  whyItMatters: "Always-on Display lets users glance at the time, battery, and pending notifications without fully waking the phone, which reduces unnecessary unlocks and screen-on time. It is especially useful for checking notifications discreetly in meetings or at night. However, because OLED panels consume power to light even a portion of the screen, this feature is one of the more common battery-drain culprits users overlook, making its customization options important for balancing convenience and battery life.",
  bestPractices: [
    "Use 'Tap to show' instead of always-on if battery life is a priority",
    "Schedule AOD to turn off during sleeping hours",
    "Disable it entirely when traveling without charging access",
    "Pick a minimal clock style to reduce the lit screen area",
  ],
  commonIssues: [
    { issue: "Always-on Display drains battery faster than expected", fix: "Switch to a scheduled or tap-to-show mode instead of continuous always-on." },
    { issue: "AOD doesn't turn on at all", fix: "Confirm it's enabled in Display settings and that battery saver isn't disabling it automatically." },
    { issue: "Notification icons don't appear on AOD", fix: "Check that the app's notifications are allowed to show on the lock screen in notification settings." },
  ],
  faqs: [
    { q: "Does Always-on Display work on all Android phones?", a: "It requires an OLED/AMOLED screen; most budget LCD devices don't support it." },
    { q: "Can I show album art or custom images on AOD?", a: "Some devices support custom AOD clock faces or images through display personalization menus." },
    { q: "Does AOD count as screen-on time for battery stats?", a: "Yes, it contributes to overall screen-on power draw, though at a much lower rate than full brightness." },
  ],
  tipsAndTricks: [
    "Use the scheduled option to align AOD with your typical waking hours",
    "Combine with Battery Saver's automatic AOD-disable behavior for long trips",
  ],
  relatedSettingIds: ["android-lock-screen", "android-battery", "android-screen-saver"],
  afterImageContent: {
    heading: "How Always-on Display Works",
    paragraphs: [
      "AOD renders a low-brightness, partial refresh of clock and notification data using only the OLED pixels needed, rather than lighting the full screen.",
      "Scheduling and tap-to-show modes reduce the time the panel spends lit, directly cutting the feature's battery cost.",
    ],
    steps: [
      "Open Settings → Display",
      "Tap 'Lock screen'",
      "Select 'Always Show Time and Info'",
      "Choose Always on, Tap to show, or a custom schedule",
    ],
  },
},
{
  id: "android-screen-saver",
  title: "Screen Saver (Daydream)",
  icon: Image,
  platform: "android",
  category: "personalization",
  controlType: "action",
  heading: "Show photos or clocks while charging idle",
  description: "Screen saver, also called Daydream, displays a rotating photo gallery, clock, or colors on screen while the phone is docked, charging, or idle, instead of turning the display off.",
  details: [
    "Options include Photo Table, Photo Frame, Clock, or a blank/color screen",
    "Can be linked to a Google Photos album for automatic rotation",
    "Only activates while charging or docked by default",
    "Configurable trigger conditions in Display settings",
  ],
  redirectUrl: "https://support.google.com/android",
  whyItMatters: "Screen saver turns idle charging time into a useful ambient display, similar to a digital photo frame, which is popular for bedside chargers or desk docks. Because it typically only runs while the device is plugged in, it has minimal impact on battery life compared to features like Always-on Display. It's a purely optional personalization feature, but it's one of the more visible ways to make a charging phone feel intentional rather than just idle.",
  bestPractices: [
    "Select a specific photo album rather than 'all photos' to avoid unwanted images appearing",
    "Use Clock mode on nightstands for a bedside-clock effect",
    "Pair with a dim brightness setting to avoid light pollution at night",
  ],
  commonIssues: [
    { issue: "Screen saver never activates", fix: "Confirm it's enabled and check the 'While charging' or 'While docked' trigger conditions in Display settings." },
    { issue: "Wrong photos appear in the rotation", fix: "Change the source album to a curated album instead of the full camera roll." },
    { issue: "Screen saver stays on and won't dim", fix: "Adjust screen timeout and brightness settings, since screen saver overrides normal sleep timing while active." },
  ],
  faqs: [
    { q: "Does screen saver use extra battery?", a: "It runs almost exclusively while charging, so its impact on battery percentage is minimal." },
    { q: "Can I set a screen saver instead of full screen lock?", a: "No, screen saver only shows on top of an idle unlocked state and does not replace the lock screen." },
    { q: "How do I exit the screen saver?", a: "Tap the screen or press the power button to return to normal use." },
  ],
  tipsAndTricks: [
    "Use Photo Table mode for a more dynamic, animated slideshow effect",
    "Set a dedicated 'screensaver' album synced from Google Photos for consistent content",
  ],
  relatedSettingIds: ["android-always-on-display", "android-wallpaper-style", "android-google-photos-backup"],
  afterImageContent: {
    heading: "How Screen Saver Works",
    paragraphs: [
      "Screen saver activates when defined trigger conditions are met, most commonly charging or docking, replacing the black idle screen with a rotating visual display.",
      "It draws directly from the source you configure, whether that's a static clock face or a linked photo album.",
    ],
    steps: [
      "Open Settings → Display",
      "Tap 'Screen saver'",
      "Choose Clock, Photo Frame, Photo Table, or Colors",
      "Set the activation trigger, such as while charging or docked",
    ],
  },
},
{
  id: "android-quick-settings-tiles",
  title: "Quick Settings Tile Customization",
  icon: AppWindow,
  platform: "android",
  category: "personalization",
  controlType: "action",
  heading: "Rearrange the Quick Settings panel",
  description: "Lets you add, remove, and reorder the toggle tiles shown in the Quick Settings panel accessed by swiping down from the top of the screen.",
  details: [
    "Drag tiles to reorder them or move them between active and hidden sections",
    "Add tiles for specific toggles like Flashlight, Hotspot, Screen Recorder, or NFC",
    "Some apps can add their own custom Quick Settings tiles",
    "Edited directly by tapping the pencil/edit icon in the Quick Settings panel",
  ],
  redirectUrl: "https://support.google.com/android",
  whyItMatters: "Quick Settings is one of the most frequently accessed parts of Android, since it provides one-swipe access to toggles like Wi-Fi, Bluetooth, and Flashlight. Customizing which tiles appear first saves time for the toggles used daily and reduces clutter from ones rarely touched. For users with accessibility or workflow needs, moving essential toggles to the first page also reduces the number of swipes required to reach them.",
  bestPractices: [
    "Place your most-used toggles in the first row for one-swipe access",
    "Remove tiles for features you never use to reduce panel length",
    "Add app-provided tiles from frequently used apps for faster shortcuts",
    "Periodically review the tile list after installing new apps that add tiles",
  ],
  commonIssues: [
    { issue: "Can't find the edit option", fix: "Open Quick Settings fully (swipe down twice) and tap the pencil icon at the bottom." },
    { issue: "A custom app tile disappeared after an update", fix: "Re-add the tile from the hidden tiles list, since app updates sometimes reset tile placement." },
    { issue: "Too many tiles require multiple swipes", fix: "Remove unused tiles or move them to the hidden section during editing." },
  ],
  faqs: [
    { q: "Can I add a tile for an individual app shortcut?", a: "Only apps that specifically implement a Quick Settings tile can be added; not all apps support this." },
    { q: "Do tile changes sync across devices?", a: "No, Quick Settings tile layout is stored locally per device." },
    { q: "Is there a limit to how many tiles I can add?", a: "There's no hard limit, but more tiles mean more swiping to reach later pages." },
  ],
  tipsAndTricks: [
    "Long-press a tile from the notification shade for a shortcut to editing mode",
    "Use the Screen Recorder or Flashlight tiles for one-tap access during calls or emergencies",
  ],
  relatedSettingIds: ["android-status-bar-icons", "android-notification-dots", "android-home-screen-launcher"],
  afterImageContent: {
    heading: "How Quick Settings Customization Works",
    paragraphs: [
      "Quick Settings tiles are defined by the system and by individual apps that register their own toggle; the edit mode lets you rearrange this combined list.",
      "Tile order and visibility are saved locally and persist across reboots until manually changed again.",
    ],
    steps: [
      "Swipe down twice from the top of the screen to open full Quick Settings",
      "Tap the pencil/edit icon",
      "Drag tiles between the active area and the hidden tiles list",
      "Tap the back arrow or Done to save the new layout",
    ],
  },
},
{
  id: "android-notification-dots",
  title: "Notification Dot Style",
  icon: Bell,
  platform: "android",
  category: "personalization",
  controlType: "action",
  heading: "Control the small badges on app icons",
  description: "Notification dots place a small colored badge on an app icon when it has an unread notification; this setting controls whether dots appear and how they're styled.",
  details: [
    "Toggle notification dots on or off system-wide",
    "Long-pressing an icon with a dot previews the notification without opening the app",
    "Per-app notification settings can suppress dots for specific apps",
    "Available under Notifications settings",
  ],
  redirectUrl: "https://support.google.com/android/answer/9079661",
  whyItMatters: "Notification dots give a quiet, at-a-glance signal that something needs attention without the noise of a banner or sound, which is especially useful for apps set to silent notification channels. They help users triage what to check first while scanning the home screen. Turning them off can reduce visual clutter and anxiety-inducing 'red dot' pressure for users who prefer to check apps on their own schedule rather than being cued by badges.",
  bestPractices: [
    "Disable dots for apps that generate frequent low-priority notifications",
    "Use long-press previews instead of opening apps to quickly clear a dot",
    "Keep dots enabled for messaging and calendar apps where timely awareness matters",
  ],
  commonIssues: [
    { issue: "Dots don't show up for a specific app", fix: "Check that app's individual notification permissions and confirm 'Allow notification dot' is enabled for it." },
    { issue: "Dot doesn't clear after reading a notification", fix: "Open the notification shade directly and dismiss it there, since some apps don't sync dot state instantly." },
    { issue: "Numbers instead of dots appear", fix: "This is normal on some launchers that show a notification count badge rather than a plain dot." },
  ],
  faqs: [
    { q: "Are notification dots the same as app badges on other platforms?", a: "Yes, they serve the same purpose as unread badges found on other mobile operating systems." },
    { q: "Can I change the dot color?", a: "Dot color generally follows system theming and isn't independently customizable per app." },
    { q: "Do dots work with notification-silenced apps?", a: "Yes, a dot can still appear even if sound and vibration are muted for that app." },
  ],
  tipsAndTricks: [
    "Long-press an app icon with a dot to preview and clear notifications without fully opening the app",
    "Combine with per-app notification categories to fine-tune which alerts trigger a dot",
  ],
  relatedSettingIds: ["android-quick-settings-tiles", "android-status-bar-icons", "android-home-screen-launcher"],
  afterImageContent: {
    heading: "How Notification Dots Work",
    paragraphs: [
      "When an app posts an unread notification, the system checks whether that app and the global setting both allow notification dots, then renders a small badge on the home screen icon.",
      "The badge clears automatically once the underlying notification is read or dismissed.",
    ],
    steps: [
      "Open Settings → Notifications",
      "Tap 'Notification dot on app icon' (or similar wording)",
      "Toggle dots on or off system-wide",
      "Adjust per-app dot behavior from each app's notification settings page",
    ],
  },
},
{
  id: "android-status-bar-icons",
  title: "Status Bar Icon Manager",
  icon: Signal,
  platform: "android",
  category: "personalization",
  controlType: "action",
  heading: "Choose which icons appear in the status bar",
  description: "Controls which system icons — such as Wi-Fi, Bluetooth, alarm, or hotspot — are shown in the status bar at the top of the screen, and how notification icons are displayed there.",
  details: [
    "Toggle individual system icons like Bluetooth or hotspot on or off",
    "Choose between showing all notification icons or only a limited number",
    "Some devices allow hiding the clock, battery percentage display style separately",
    "Found within Notifications or Display settings depending on device",
  ],
  redirectUrl: "https://support.google.com/android",
  whyItMatters: "The status bar is limited real estate, and too many icons crowded together can make it hard to quickly read the time, signal, or battery level. Trimming unnecessary icons improves at-a-glance readability, especially on phones with notches or punch-hole cameras that already reduce available space. This setting is particularly useful for users who want a cleaner, more minimalist top bar or who rely on specific icons (like VPN or hotspot status) being easy to spot.",
  bestPractices: [
    "Hide icons for features you rarely use, like NFC or airplane mode, to declutter the bar",
    "Keep security-relevant icons like VPN and hotspot visible for quick status checks",
    "Limit notification icon count if you use many apps with frequent alerts",
  ],
  commonIssues: [
    { issue: "Too many notification icons crowd the status bar", fix: "Limit the maximum number of notification icons shown in the status bar settings." },
    { issue: "An important icon (like VPN) is hidden", fix: "Re-enable that specific system icon in the status bar icon list." },
    { issue: "Battery percentage doesn't display next to the icon", fix: "Enable 'Show battery percentage' separately, as it's often a distinct toggle from icon visibility." },
  ],
  faqs: [
    { q: "Can I fully hide the status bar?", a: "No, the status bar itself can't be removed, only which optional icons appear within it." },
    { q: "Do hidden icons stop the underlying feature from working?", a: "No, hiding an icon only affects its visibility, not the feature's functionality." },
    { q: "Why do some OEM phones have more status bar options than stock Android?", a: "Manufacturer skins often add extra customization layers beyond the base Android settings." },
  ],
  tipsAndTricks: [
    "Reduce the notification icon limit to two or three for the cleanest look",
    "Check status bar settings after a major Android update, since new icons are sometimes added by default",
  ],
  relatedSettingIds: ["android-notification-dots", "android-quick-settings-tiles", "android-wallpaper-style"],
  afterImageContent: {
    heading: "How Status Bar Icon Management Works",
    paragraphs: [
      "Each system feature (Bluetooth, hotspot, alarm, etc.) registers an icon with the status bar; this setting controls the visibility rules the system applies when deciding what to render.",
      "Notification icon limits work independently, capping how many app icons appear before the rest are summarized.",
    ],
    steps: [
      "Open Settings → Notifications (or Display, depending on device)",
      "Tap 'Status bar'",
      "Toggle individual system icons on or off",
      "Set the maximum number of notification icons to display",
    ],
  },
},
{
  id: "android-show-passwords",
  title: "Show Passwords Toggle",
  icon: EyeOff,
  platform: "android",
  category: "privacy-permissions",
  controlType: "action",
  heading: "Reveal characters while typing passwords",
  description: "Controls whether password characters briefly appear on screen as you type them, instead of being immediately masked as dots, making it easier to verify accurate entry.",
  details: [
    "When enabled, each typed character is shown briefly before being masked",
    "Helps reduce failed login attempts caused by typos",
    "Can be disabled for added privacy in public settings",
    "Located in Privacy or Accessibility settings depending on Android version",
  ],
  redirectUrl: "https://support.google.com/accounts/answer/6197437",
  whyItMatters: "This setting balances usability against shoulder-surfing risk. Showing typed characters briefly reduces frustrating failed login attempts, especially on small keyboards or complex passwords with mixed symbols, but it also means anyone glancing at the screen during entry could catch a glimpse of the password. Users in public or shared spaces often prefer to disable this, while those in private settings may keep it on for convenience.",
  bestPractices: [
    "Disable this setting in public or shared environments to reduce shoulder-surfing risk",
    "Keep it enabled at home if you frequently mistype long passwords",
    "Use it alongside a password manager's autofill to reduce manual typing overall",
  ],
  commonIssues: [
    { issue: "Password characters flash too briefly to read", fix: "This is expected behavior for security; each character is shown only momentarily before masking." },
    { issue: "Setting doesn't appear in Settings search", fix: "Check under Accessibility or Security settings, as its exact location varies by Android version and manufacturer." },
    { issue: "Passwords still appear masked even with the toggle on", fix: "Some apps override system-level display settings with their own password field behavior." },
  ],
  faqs: [
    { q: "Does this reveal saved passwords stored elsewhere?", a: "No, this only affects the brief on-screen display while actively typing a password, not stored credential visibility." },
    { q: "Is this the same as viewing saved passwords in Password Manager?", a: "No, viewing saved passwords is a separate action requiring authentication, distinct from this typing-display toggle." },
    { q: "Does disabling it improve security significantly?", a: "It reduces shoulder-surfing risk during entry but doesn't affect password strength or storage encryption." },
  ],
  tipsAndTricks: [
    "Turn this off before using your phone in crowded public places like transit",
    "Use biometric login where available to avoid typing passwords altogether",
  ],
  relatedSettingIds: ["android-autofill-service", "android-security-screen-lock", "android-privacy-dashboard"],
  afterImageContent: {
    heading: "How Show Passwords Works",
    paragraphs: [
      "When enabled, the system briefly renders each character you type into a password field before masking it with a dot, giving quick visual confirmation of accurate entry.",
      "This behavior is a system-wide display preference respected by most, but not all, apps that use standard Android password fields.",
    ],
    steps: [
      "Open Settings → Security & privacy (or Accessibility)",
      "Find 'Show passwords' or 'Make passwords visible'",
      "Toggle the setting on or off",
      "Test by typing into any password field to confirm the behavior",
    ],
  },
},
{
  id: "android-lock-screen-notification-privacy",
  title: "Lock Screen Notification Privacy",
  icon: BellOff,
  platform: "android",
  category: "privacy-permissions",
  controlType: "action",
  heading: "Control what notifications show while locked",
  description: "Determines whether notification content, sender names, and previews appear on the lock screen before the phone is unlocked, or whether they're hidden until authentication.",
  details: [
    "Choose between showing all content, hiding sensitive content, or hiding all notifications",
    "Sensitive content hiding applies per-app based on app-provided sensitivity flags",
    "Applies specifically to the lock screen, separate from the notification shade after unlocking",
    "Configurable globally and overridable per app",
  ],
  redirectUrl: "https://support.google.com/android/answer/9079661",
  whyItMatters: "Lock screen notifications are visible to anyone who glances at an unattended or resting phone, making this one of the most consequential everyday privacy settings. Message previews, banking alerts, or one-time passcodes displayed openly can expose sensitive information to bystanders or, in worse cases, enable account takeover if a verification code is visible. Choosing to hide sensitive content strikes a balance between still knowing something arrived and protecting its details until the device is unlocked.",
  bestPractices: [
    "Set sensitive content to hidden for banking, email, and messaging apps",
    "Review this setting anytime you start using a new financial or authentication app",
    "Use 'Hide all notification content' in high-risk environments like shared offices",
    "Pair with a strong screen lock method for layered protection",
  ],
  commonIssues: [
    { issue: "OTP or verification codes are visible on the lock screen", fix: "Set lock screen notifications to hide sensitive content, or hide notifications entirely for that app." },
    { issue: "Notifications disappear from the lock screen entirely", fix: "Check that the global lock screen notification setting isn't set to 'Don't show notifications at all.'" },
    { issue: "Some apps still show full previews despite the global setting", fix: "Check that app's individual notification settings, since per-app overrides can supersede the global choice." },
  ],
  faqs: [
    { q: "Does hiding lock screen content affect notifications after unlocking?", a: "No, once unlocked, notification content displays normally in the shade regardless of this setting." },
    { q: "Can I hide content for just one app?", a: "Yes, per-app notification settings allow overriding the global lock screen privacy behavior." },
    { q: "Is this the same as Do Not Disturb?", a: "No, Do Not Disturb controls whether notifications alert you at all; this controls what's visible once they arrive on a locked screen." },
  ],
  tipsAndTricks: [
    "Hide sensitive content specifically for messaging and banking apps rather than disabling all previews",
    "Recheck this setting after a system update, as new apps can default to showing full previews",
  ],
  relatedSettingIds: ["android-lock-screen", "android-notification-dots", "android-security-screen-lock"],
  afterImageContent: {
    heading: "How Lock Screen Notification Privacy Works",
    paragraphs: [
      "When a notification arrives, the system checks both the global lock screen privacy setting and any per-app override before deciding how much content to render on the locked display.",
      "Apps that flag content as sensitive (like a banking balance) are hidden first when 'Hide sensitive content' is selected.",
    ],
    steps: [
      "Open Settings → Notifications",
      "Tap 'Notifications on lock screen'",
      "Choose Show all, Hide sensitive content, or Don't show notifications",
      "Adjust individual app overrides from each app's notification settings if needed",
    ],
  },
},
{
  id: "android-usage-diagnostics",
  title: "Usage & Diagnostics Data Sharing",
  icon: Activity,
  platform: "android",
  category: "privacy-permissions",
  controlType: "action",
  heading: "Control diagnostic data sent to Google",
  description: "Usage & diagnostics controls whether the device automatically sends crash reports, performance data, and feature usage statistics to Google to help improve Android and pre-installed apps.",
  details: [
    "Includes crash logs, battery stats, and general feature usage patterns",
    "Data is used to improve stability and prioritize future features",
    "Does not include message content or personal file contents",
    "Can be turned off at any time from Privacy settings",
  ],
  redirectUrl: "https://support.google.com/android/answer/6078260",
  whyItMatters: "Usage and diagnostics sharing is one of the main ways Google identifies bugs, crashes, and performance regressions across the huge diversity of Android devices in the wild. For privacy-conscious users, understanding exactly what's shared (technical diagnostics, not personal content) helps make an informed choice about whether the trade-off between contributing to platform improvement and minimizing outbound data is worth it. It's a low-stakes but meaningful privacy lever that many users never revisit after initial device setup.",
  bestPractices: [
    "Review this setting during initial device setup rather than accepting the default blindly",
    "Leave it enabled if you frequently report bugs, since it strengthens diagnostic reports",
    "Disable it if you prefer minimal outbound telemetry",
    "Revisit after major OS updates, since new diagnostic categories can be introduced",
  ],
  commonIssues: [
    { issue: "Unsure what data is actually being sent", fix: "Review the detailed description linked from the toggle, which lists the specific diagnostic categories collected." },
    { issue: "Setting reset after a factory reset or new device", fix: "This is expected; diagnostics preferences are set fresh on each new device setup and aren't backed up." },
    { issue: "Toggle appears greyed out", fix: "Some enterprise-managed devices lock this setting via an administrator policy." },
  ],
  faqs: [
    { q: "Is this the same as ad personalization data?", a: "No, usage and diagnostics is separate from ad personalization settings found in your Google Account." },
    { q: "Does disabling it affect app functionality?", a: "No, it only stops diagnostic reporting; apps continue to function normally." },
    { q: "Can Google identify me personally from this data?", a: "Diagnostic data is designed to be aggregated and de-identified for product improvement purposes." },
  ],
  tipsAndTricks: [
    "Check this setting right after unboxing a new phone, since it's part of the initial setup flow",
    "Pair with the Privacy Dashboard to get a fuller picture of what data leaves your device",
  ],
  relatedSettingIds: ["android-privacy-dashboard", "android-app-permissions", "android-send-feedback"],
  afterImageContent: {
    heading: "How Usage & Diagnostics Works",
    paragraphs: [
      "When enabled, the device periodically batches diagnostic logs, such as crash traces and performance metrics, and transmits them to Google's servers over your existing internet connection.",
      "The setting can be toggled independently of other privacy controls and takes effect immediately.",
    ],
    steps: [
      "Open Settings → Privacy",
      "Tap 'Usage & diagnostics' (or 'Send diagnostic data')",
      "Read the data categories listed",
      "Toggle sharing on or off",
    ],
  },
},
{
  id: "android-camera-mic-access-toggle",
  title: "Camera & Microphone Access Toggle",
  icon: ShieldCheck,
  platform: "android",
  category: "privacy-permissions",
  controlType: "action",
  heading: "Instantly cut camera and mic access for all apps",
  description: "Quick privacy toggles that disable camera and microphone access system-wide for every app at once, overriding individual app permissions until switched back on.",
  details: [
    "Accessible from Quick Settings or the Privacy settings page",
    "A green status bar indicator shows when the camera or mic is actively in use",
    "Overrides all per-app camera/microphone permissions while active",
    "Emergency calls and some system features may bypass the mic block",
  ],
  important: "Enabling this toggle can silently break video calls, voice assistants, and camera apps until it's switched back off.",
  redirectUrl: "https://support.google.com/android",
  whyItMatters: "This master toggle gives users a fast, high-confidence way to guarantee no app is secretly recording audio or video, without having to check and revoke dozens of individual app permissions. It's especially valuable during sensitive conversations, meetings, or when handing the phone to someone else temporarily. Because it overrides all app-level permissions at once, it acts as a safety net against misconfigured or malicious apps that might otherwise slip through granular permission review.",
  bestPractices: [
    "Enable both toggles when lending your phone to someone else",
    "Turn off the mic toggle when using voice assistants or making calls to avoid confusion",
    "Check the toggle first if a camera or calling app suddenly stops working",
    "Use alongside the green/orange indicator dots to spot unexpected camera or mic activity",
  ],
  commonIssues: [
    { issue: "Camera app shows a black screen or error", fix: "Check Quick Settings for an active camera-block toggle and disable it." },
    { issue: "Voice calls have no microphone audio", fix: "Disable the microphone access toggle, since it silently mutes all apps including calling apps." },
    { issue: "Toggle re-enables unexpectedly after a restart", fix: "This is expected on some devices, since the toggle is a temporary session override rather than a permanent setting." },
  ],
  faqs: [
    { q: "Does this permanently revoke app permissions?", a: "No, it's a temporary system-wide override; individual app permissions remain unchanged underneath it." },
    { q: "Can emergency services still access the microphone when blocked?", a: "Yes, emergency calling functions are generally exempt from this restriction." },
    { q: "Is there a separate indicator when the camera or mic is in use?", a: "Yes, a colored dot appears in the status bar whenever an app is actively using the camera or microphone." },
  ],
  tipsAndTricks: [
    "Add camera and mic block toggles to your Quick Settings for one-swipe access",
    "Use the mic block toggle before entering confidential meetings as an extra precaution",
  ],
  relatedSettingIds: ["android-app-permissions", "android-privacy-dashboard", "android-quick-settings-tiles"],
  afterImageContent: {
    heading: "How the Camera & Microphone Toggle Works",
    paragraphs: [
      "When active, the toggle sits above the standard permission system, blocking hardware access requests from every app regardless of their individually granted permissions.",
      "Apps attempting access while blocked typically receive an error or a blacked-out preview rather than a crash.",
    ],
    steps: [
      "Swipe down to open Quick Settings, or go to Settings → Privacy",
      "Locate the Camera access and Microphone access tiles",
      "Tap to toggle access off for all apps",
      "Tap again to restore normal per-app permission behavior",
    ],
  },
},
{
  id: "android-free-up-space",
  title: "Free Up Space Tool",
  icon: HardDrive,
  platform: "android",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Automatically identify files safe to remove",
  description: "The Free Up Space tool scans the device for large files, unused apps, duplicate downloads, and old screenshots, then suggests safe items to delete to reclaim storage.",
  details: [
    "Highlights large attachments, old downloads, and rarely-used apps",
    "Can suggest backing up photos to Google Photos before removing local copies",
    "Shows a running total of space that will be freed before confirming deletion",
    "Accessible from Settings → Storage",
  ],
  redirectUrl: "https://support.google.com/android/answer/7431795",
  whyItMatters: "Running low on storage is one of the most common Android complaints, often causing slow performance, failed app updates, and inability to take new photos. The Free Up Space tool automates what would otherwise be a tedious manual review of files and apps, surfacing the biggest offenders first so users can reclaim meaningful space in a few taps instead of hunting through folders. It's particularly valuable for less technical users who wouldn't otherwise know where storage is going.",
  bestPractices: [
    "Run this tool whenever you get a low storage notification rather than ignoring it",
    "Back up photos and videos before bulk-deleting them through the suggested cleanup",
    "Review the suggested app removal list carefully before confirming, since it includes unused apps",
    "Repeat periodically, since caches and downloads accumulate again over time",
  ],
  commonIssues: [
    { issue: "Storage fills up again quickly after cleanup", fix: "Check which apps are generating the most cache and consider clearing app data or offloading media to cloud backup." },
    { issue: "Suggested photo deletions include ones not yet backed up", fix: "Confirm Google Photos backup has fully completed before deleting local copies." },
    { issue: "Tool doesn't find much to clean", fix: "Manually check large individual apps in Storage settings, since some heavy files may not qualify as 'safe to delete.'" },
  ],
  faqs: [
    { q: "Does this tool delete anything without confirmation?", a: "No, it presents a review list and requires explicit confirmation before removing any files or apps." },
    { q: "Is this the same as clearing app cache?", a: "It can include cache clearing as one category, but it also covers file downloads, unused apps, and duplicate media." },
    { q: "Will freeing space affect app settings or logins?", a: "Removing an app's cache does not affect its login state; uninstalling an app will remove its local data." },
  ],
  tipsAndTricks: [
    "Enable automatic Google Photos backup so the tool can safely suggest removing local originals",
    "Check the 'unused apps' section regularly to uninstall apps you forgot you installed",
  ],
  relatedSettingIds: ["android-storage-cleanup", "android-clear-cache-data", "android-google-photos-backup"],
  updateFrequency: "Recommended monthly or when storage is low",
  afterImageContent: {
    heading: "How Free Up Space Works",
    paragraphs: [
      "The tool scans installed apps, cached files, downloads, and media, then ranks removal candidates by how much space they'd reclaim and how safe they are to delete.",
      "It integrates with Google Photos backup status so it can recommend removing already-backed-up originals with lower risk.",
    ],
    steps: [
      "Open Settings → Storage",
      "Tap 'Free up space'",
      "Review suggested files, apps, and media",
      "Select items and confirm deletion",
    ],
  },
},
{
  id: "android-clear-cache-data",
  title: "Cached Data Management",
  icon: Archive,
  platform: "android",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Clear temporary app cache to reclaim space",
  description: "Lets you view and clear the temporary cache files each app stores for faster loading, either per app or across all apps at once, without deleting saved account data or settings.",
  details: [
    "Cache is separate from app data, which includes logins and saved preferences",
    "Can be cleared per individual app or in bulk via a system-wide option",
    "Cache typically rebuilds automatically as apps are used again",
    "Found under each app's storage page or a global 'clear cache' shortcut",
  ],
  redirectUrl: "https://support.google.com/android/answer/7431795",
  whyItMatters: "Cache files accumulate silently in the background as apps store thumbnails, temporary downloads, and offline data to speed up future loading. Over time, heavy-use apps like browsers, social media, and streaming apps can consume gigabytes of cache without the user realizing it. Clearing cache is one of the safest storage-recovery actions available, since it never deletes account credentials or personal data, only temporary files the app will regenerate as needed.",
  bestPractices: [
    "Clear cache for browsers and social apps first, since they tend to accumulate the most",
    "Avoid clearing app data (as opposed to cache) unless you intend to reset that app's settings",
    "Use bulk cache clearing sparingly, since it can briefly slow apps down as caches rebuild",
    "Check individual app storage pages if one app seems unusually large",
  ],
  commonIssues: [
    { issue: "Storage fills up again shortly after clearing cache", fix: "This is expected for heavily used apps; cache regenerates as you continue using them." },
    { issue: "App logs out or loses settings after clearing", fix: "You likely cleared app data instead of cache; these are separate options in the same menu." },
    { issue: "No 'clear all cache' option is visible", fix: "Some Android versions require clearing cache per-app rather than through a single bulk action." },
  ],
  faqs: [
    { q: "Does clearing cache delete my photos or documents?", a: "No, cache only contains temporary app-generated files, not personal media or documents." },
    { q: "Is clearing cache safe to do regularly?", a: "Yes, it's one of the safest cleanup actions since apps automatically rebuild their cache as needed." },
    { q: "Why does an app feel slower right after clearing its cache?", a: "The app needs to reload and re-cache data it previously had stored locally, which can briefly increase load times." },
  ],
  tipsAndTricks: [
    "Clear cache for a specific app before reporting a bug, since corrupted cache is a common cause of glitches",
    "Check which apps have the largest cache footprint from the Storage settings breakdown",
  ],
  relatedSettingIds: ["android-free-up-space", "android-storage-cleanup", "android-files-by-google"],
  afterImageContent: {
    heading: "How Cached Data Management Works",
    paragraphs: [
      "Apps store cache files locally to avoid re-downloading or re-processing the same content repeatedly, which speeds up everyday use at the cost of storage space.",
      "Clearing cache removes these temporary files immediately, while leaving login sessions, saved preferences, and app data intact.",
    ],
    steps: [
      "Open Settings → Storage",
      "Tap 'Apps' or a specific app's storage entry",
      "Tap 'Clear cache'",
      "Repeat for other apps as needed, or use a bulk clear option if available",
    ],
  },
},
{
  id: "android-download-manager",
  title: "Download Manager",
  icon: FolderSearch,
  platform: "android",
  category: "storage-backup-data",
  controlType: "action",
  heading: "View and manage files downloaded from apps",
  description: "The built-in Download Manager (accessible via the Files app or browser downloads) lists files downloaded from browsers, email, and other apps, letting you open, share, or delete them from one place.",
  details: [
    "Aggregates downloads from browsers, email clients, and messaging apps",
    "Supports sorting by date, size, or file type",
    "Allows batch deletion of old or large downloaded files",
    "Accessible through the Files app's Downloads category or a browser's download history",
  ],
  redirectUrl: "https://support.google.com/android",
  whyItMatters: "Downloaded files, especially large PDFs, installers, and media, are one of the quieter contributors to storage bloat since they're often forgotten once the initial task (like reading a document) is done. Download Manager centralizes these files so users don't have to hunt through individual apps to find what's consuming space. It's also useful for locating a specific downloaded file quickly, without remembering which app originally saved it.",
  bestPractices: [
    "Periodically sort downloads by size to find and remove the largest forgotten files",
    "Move important downloads (like scanned documents) to cloud storage before deleting local copies",
    "Clear browser download history alongside the files themselves for a full cleanup",
  ],
  commonIssues: [
    { issue: "A downloaded file can't be found", fix: "Check the Files app's Downloads folder directly, since some apps save to app-specific folders instead." },
    { issue: "Deleting a download doesn't free the expected space", fix: "Confirm the file wasn't also duplicated in a cloud sync folder or another app's storage." },
    { issue: "Old downloads keep reappearing after deletion", fix: "Check for an auto-download setting in messaging or email apps that's re-saving the same attachment." },
  ],
  faqs: [
    { q: "Does deleting a download remove it from the cloud too?", a: "No, deleting a local download only removes the device copy; any cloud-stored original remains unless separately deleted." },
    { q: "Can I set a default download location?", a: "Some browsers and file managers allow choosing a default save folder, including external SD cards where supported." },
    { q: "Are downloaded APK installers safe to delete after installing an app?", a: "Yes, the installer file is no longer needed once the app is successfully installed." },
  ],
  tipsAndTricks: [
    "Use the Files app's search function to quickly locate a specific downloaded document",
    "Enable automatic old-download cleanup if your file manager offers it",
  ],
  relatedSettingIds: ["android-files-by-google", "android-storage-cleanup", "android-free-up-space"],
  afterImageContent: {
    heading: "How the Download Manager Works",
    paragraphs: [
      "Every time an app saves a file to shared storage, it's registered with the system's download provider, which the Files app and download lists read from to build a unified view.",
      "This lets you manage downloads from many different source apps in a single, consistent interface.",
    ],
    steps: [
      "Open the Files app",
      "Tap 'Downloads' in the categories list",
      "Sort or filter by date, size, or type",
      "Select files to open, share, or delete",
    ],
  },
},
{
  id: "android-google-drive-storage",
  title: "Google Drive Storage Management",
  icon: UploadCloud,
  platform: "android",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Manage files synced to Google Drive",
  description: "Controls which folders and files sync to Google Drive, shows how much of your Google storage quota is used, and lets you free space by removing large or duplicate cloud files.",
  details: [
    "Displays a breakdown of storage used by Drive, Gmail, and Photos under one Google Account quota",
    "Offers a cleanup tool to find large files, old chats, and blurry or duplicate photos",
    "Supports offline access toggles for specific files and folders",
    "Managed through the Google Drive app or Settings → Google → Manage storage",
  ],
  redirectUrl: "https://support.google.com/drive/answer/9312312",
  whyItMatters: "Google Drive storage is shared across Gmail, Photos, and Drive under one account quota, so files piling up in any one service can silently push a user toward needing a paid storage plan. Understanding and managing this shared pool helps avoid unexpected 'storage full' warnings that can block new email or photo backups. For users relying on Drive as their primary backup and file-sync solution, actively managing this storage keeps backups running smoothly without interruption.",
  bestPractices: [
    "Check the storage breakdown periodically to see which service (Drive, Gmail, Photos) is consuming the most space",
    "Empty the Drive trash regularly, since deleted files still count against quota until permanently removed",
    "Use the built-in cleanup tool to find large attachments and old chat media",
    "Consider a Google One storage upgrade if you consistently run near your quota limit",
  ],
  commonIssues: [
    { issue: "Google Account shows storage full despite few files in Drive", fix: "Check Gmail attachments and Google Photos, since both count against the same shared quota." },
    { issue: "Deleted files still count against storage", fix: "Empty the Drive trash, since deleted items remain there for 30 days by default before permanent removal." },
    { issue: "Offline files aren't available without internet", fix: "Manually enable 'Available offline' for specific files or folders before going offline." },
  ],
  faqs: [
    { q: "Is Google Drive storage the same as device storage?", a: "No, Drive storage is cloud-based and shared across your Google Account, separate from the phone's local storage." },
    { q: "Does deleting a file from the phone delete it from Drive?", a: "Only if the file is stored in Drive itself; locally downloaded copies are separate from the cloud original." },
    { q: "How much free storage does a Google Account get by default?", a: "Google provides a baseline free quota shared across Gmail, Drive, and Photos, with paid Google One plans available for more." },
  ],
  tipsAndTricks: [
    "Use the 'Manage storage' cleanup tool to quickly find and remove large forgotten email attachments",
    "Star important files so they're easy to find without searching through the full storage breakdown",
  ],
  relatedSettingIds: ["android-google-photos-backup", "android-backup-restore", "android-free-up-space"],
  afterImageContent: {
    heading: "How Google Drive Storage Management Works",
    paragraphs: [
      "Drive, Gmail, and Photos all draw from the same Google Account storage quota, so the management tool aggregates usage across all three to show one accurate total.",
      "The cleanup assistant scans for large files, old chat attachments, and duplicate or blurry photos to suggest safe removals.",
    ],
    steps: [
      "Open the Google Drive app",
      "Tap your profile icon → 'Manage storage'",
      "Review the usage breakdown by service",
      "Use the cleanup suggestions to remove unneeded files",
    ],
  },
},
{
  id: "android-switch-transfer-data",
  title: "Switch & Transfer Data from Old Phone",
  icon: Share2,
  platform: "android",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Move data from a previous device to a new one",
  description: "Guides you through transferring contacts, photos, apps, messages, and settings from an old Android or iPhone to a new device, using a cable, Wi-Fi, or cloud backup.",
  details: [
    "Supports transfer from both Android and iPhone source devices",
    "Can use a direct cable connection, Wi-Fi transfer, or a cloud backup restore",
    "Transfers contacts, photos, apps, call history, and some app data",
    "Typically launched automatically during new-device setup",
  ],
  redirectUrl: "https://support.google.com/android",
  whyItMatters: "Switching phones is one of the highest-friction moments in the Android experience, and a poor transfer can mean lost photos, missing contacts, or hours spent manually reinstalling apps and re-logging into accounts. The built-in transfer tool automates most of this process, dramatically reducing setup time for a new device and minimizing the risk of overlooked data. It's especially valuable for users switching from iPhone, where format and ecosystem differences can otherwise complicate a manual migration.",
  bestPractices: [
    "Keep both devices charged and near each other during the transfer process",
    "Back up the old device to Google Account or cloud storage before starting, as a safety net",
    "Use a cable connection when available for the fastest and most reliable transfer speed",
    "Verify photos, contacts, and key apps after the transfer completes before wiping the old device",
  ],
  commonIssues: [
    { issue: "Transfer stalls or times out midway", fix: "Move devices closer together, ensure both have sufficient battery, and retry using a cable if Wi-Fi transfer is unreliable." },
    { issue: "Some apps didn't transfer with their data", fix: "Certain apps require signing back in manually and re-downloading, since not all app data is portable between devices." },
    { issue: "Photos are missing after transfer", fix: "Confirm Google Photos backup was complete on the old device, then sign in with the same account on the new device to restore them." },
  ],
  faqs: [
    { q: "Can I transfer data from an iPhone to Android?", a: "Yes, Google provides a 'Switch to Android' tool that migrates contacts, photos, and messages from iPhone." },
    { q: "Do I need internet access for the transfer?", a: "A direct cable or Wi-Fi Direct connection can transfer data without needing full internet access, though cloud restores require it." },
    { q: "Will my apps automatically reinstall on the new phone?", a: "Yes, in most cases the tool queues your previous apps for automatic reinstallation via the Play Store." },
  ],
  tipsAndTricks: [
    "Use a USB-C to USB-C or a manufacturer-provided adapter cable for the fastest wired transfer",
    "Complete the transfer before removing the SIM card or resetting the old device",
  ],
  relatedSettingIds: ["android-backup-restore", "android-google-photos-backup", "android-factory-reset"],
  afterImageContent: {
    heading: "How Data Transfer Works",
    paragraphs: [
      "During setup, the new device prompts you to connect to the old one via cable or Wi-Fi, then requests permission to copy contacts, photos, messages, and app lists.",
      "For iPhone sources, a companion app on the old device packages exportable data for the Android device to import.",
    ],
    steps: [
      "Start setup on the new device and select 'Copy apps & data'",
      "Choose cable, Wi-Fi, or cloud backup as the transfer method",
      "Connect both devices and follow the on-screen prompts",
      "Wait for the transfer to complete, then verify contacts, photos, and apps",
    ],
  },
},
{
  id: "android-model-hardware-info",
  title: "Model & Hardware Information",
  icon: Smartphone,
  platform: "android",
  category: "system-info",
  controlType: "action",
  heading: "View your phone's model and hardware specs",
  description: "Displays the exact device model name, model number, hardware revision, and manufacturer details, useful for support calls, warranty checks, and compatibility verification.",
  details: [
    "Shows model name, model number, and hardware version",
    "Includes manufacturer and device codename in some cases",
    "Useful when checking accessory or case compatibility",
    "Found under About phone → Model & hardware",
  ],
  redirectUrl: "https://support.google.com/pixelphone/answer/10402530",
  whyItMatters: "Knowing the precise model and hardware version is essential for tasks like ordering a compatible case, checking whether a specific software update applies to your device, or providing accurate details to customer support during a warranty claim. Because many manufacturers release multiple regional or carrier variants of the same phone name, the model number is often the only reliable way to distinguish between them when troubleshooting or shopping for accessories.",
  bestPractices: [
    "Note down your model number before contacting support or filing a warranty claim",
    "Check hardware info before purchasing accessories advertised for a specific model variant",
    "Use this page to confirm you have the correct regional variant if buying components online",
  ],
  commonIssues: [
    { issue: "Model number doesn't match what's printed on the retail box", fix: "This can happen with carrier or regional variants; use the on-device model number as the authoritative source." },
    { issue: "Can't find hardware revision information", fix: "Some manufacturers only expose limited hardware detail; check the manufacturer's own support app for more depth." },
    { issue: "Support asks for information not shown here", fix: "Combine this page with IMEI/serial number details, found in a nearby About phone section." },
  ],
  faqs: [
    { q: "Is model number the same as IMEI?", a: "No, the model number identifies the device design and variant, while IMEI uniquely identifies your individual physical device." },
    { q: "Where else can I find my model number?", a: "It's often printed on the original packaging or under the SIM tray on some devices." },
    { q: "Does hardware info change after a software update?", a: "No, hardware information reflects the physical device and stays constant regardless of software updates." },
  ],
  tipsAndTricks: [
    "Screenshot this page before contacting support so the information is easy to reference",
    "Cross-check model number against manufacturer accessory listings before buying a case or charger",
  ],
  relatedSettingIds: ["android-about-phone", "android-imei-serial-number", "android-legal-information"],
  afterImageContent: {
    heading: "How Model & Hardware Info Works",
    paragraphs: [
      "This page reads identifying data stored in the device's firmware, including model designation and hardware revision, and displays it in a simple readable list.",
      "The information is static for the life of the device and doesn't change with software updates.",
    ],
    steps: [
      "Open Settings → About phone",
      "Tap 'Model & hardware' or 'Device information'",
      "View model name, model number, and hardware version",
    ],
  },
},
{
  id: "android-imei-serial-number",
  title: "IMEI & Serial Number",
  icon: Info,
  platform: "android",
  category: "system-info",
  controlType: "action",
  heading: "Find your device's unique identifiers",
  description: "Shows the IMEI (or MEID) and serial number that uniquely identify your physical device, used for warranty claims, insurance, carrier activation, and reporting a lost or stolen phone.",
  details: [
    "Dual-SIM devices typically show two separate IMEI numbers",
    "Serial number is unique to the physical hardware unit",
    "Also accessible by dialing *#06# on the phone app",
    "Required information for carrier unlock requests and insurance claims",
  ],
  important: "Keep your IMEI and serial number recorded somewhere safe, since you'll need them if the phone is ever lost or stolen and you want to report it to your carrier or police.",
  redirectUrl: "https://support.google.com/pixelphone/answer/10402530",
  whyItMatters: "IMEI and serial numbers are the definitive way to identify an individual physical device, distinct from account-based identifiers like a Google Account. Carriers use IMEI to block a reported stolen phone from connecting to any network, insurance companies require it to process claims, and manufacturers use serial numbers to verify warranty eligibility. Without this number recorded in advance, resolving a loss, theft, or warranty issue becomes significantly harder.",
  bestPractices: [
    "Record your IMEI and serial number in a secure note or password manager right after setup",
    "Use *#06# as a quick universal way to view IMEI without navigating settings",
    "Provide the IMEI immediately to your carrier if the phone is lost or stolen",
    "Keep the original purchase receipt alongside these numbers for warranty purposes",
  ],
  commonIssues: [
    { issue: "Dial code *#06# doesn't show any info", fix: "Try viewing IMEI directly through Settings → About phone → IMEI instead, as some carrier dialers restrict the code." },
    { issue: "Two IMEI numbers are shown and it's unclear which to use", fix: "Dual-SIM phones have one IMEI per SIM slot; provide both if requested by a carrier or insurer." },
    { issue: "Serial number doesn't match the box or receipt", fix: "Double check you're reading the correct field, since some listings show a similar-looking model or SKU number instead." },
  ],
  faqs: [
    { q: "Can IMEI be used to track a lost phone's location?", a: "Not directly by the owner; law enforcement can request carrier assistance using the IMEI, but everyday location tracking uses services like Find My Device instead." },
    { q: "Is the IMEI the same across a dual-SIM phone's two IMEIs?", a: "No, each SIM slot typically has its own distinct IMEI number." },
    { q: "Does resetting the phone change the IMEI?", a: "No, IMEI and serial number are hardware-tied and remain the same through factory resets and software updates." },
  ],
  tipsAndTricks: [
    "Take a screenshot of the IMEI screen right after setup and store it securely",
    "Use the IMEI to check unlock or blacklist status with your carrier before buying a used phone",
  ],
  relatedSettingIds: ["android-model-hardware-info", "android-about-phone", "android-carrier-updates"],
  afterImageContent: {
    heading: "How IMEI & Serial Number Lookup Works",
    paragraphs: [
      "The IMEI is a hardware-encoded identifier tied to the device's cellular radio, while the serial number identifies the specific manufactured unit; both are read directly from secure device firmware.",
      "These numbers never change and are used by carriers, insurers, and manufacturers to identify your exact physical device.",
    ],
    steps: [
      "Open Settings → About phone",
      "Tap 'IMEI' or 'Status information'",
      "View IMEI (or dual IMEI on dual-SIM devices) and serial number",
      "Alternatively, open the Phone app and dial *#06#",
    ],
  },
},
{
  id: "android-version-detail",
  title: "Android Version Detail Page",
  icon: Info,
  platform: "android",
  category: "system-info",
  controlType: "action",
  heading: "View detailed Android and build version info",
  description: "Shows the exact Android OS version, security patch level, build number, kernel version, and Google Play system update version installed on the device.",
  details: [
    "Displays Android version number and build number together",
    "Includes kernel version and baseband/firmware details on the same page",
    "Tapping the build number repeatedly enables Developer options",
    "Distinct from the general About phone summary page",
  ],
  redirectUrl: "https://support.google.com/android/answer/7680439",
  whyItMatters: "The detailed version page is the authoritative source for confirming exactly what software is running on a device, which matters when troubleshooting a bug, checking app compatibility, or verifying whether a promised security or feature update has actually installed. Support articles and app compatibility requirements frequently reference specific Android version and build numbers, so knowing how to find this precise information saves time when diagnosing issues or filing support tickets.",
  bestPractices: [
    "Check this page before filing a bug report so you can include exact build information",
    "Compare build number after an update to confirm it installed successfully",
    "Reference kernel and baseband version when troubleshooting connectivity issues",
  ],
  commonIssues: [
    { issue: "Build number doesn't change after an update appears to install", fix: "Restart the device, since some updates require a reboot to fully apply and reflect the new build number." },
    { issue: "Version shown doesn't match what an app requires", fix: "Confirm you're reading the Android version, not a manufacturer skin's separate version number." },
    { issue: "Tapping build number doesn't unlock Developer options", fix: "Ensure you're tapping quickly and consecutively, and enter your PIN or password if prompted partway through." },
  ],
  faqs: [
    { q: "What's the difference between Android version and build number?", a: "The Android version reflects the OS release (e.g. Android 15), while the build number is a granular identifier for the exact software package installed." },
    { q: "Where do I find the security patch date separately?", a: "It's listed on this same detail page, alongside version and build information." },
    { q: "Does this page show if a newer update is available?", a: "No, checking for available updates is a separate action found on the System update page." },
  ],
  tipsAndTricks: [
    "Tap the build number seven times as a quick way to reach Developer options",
    "Screenshot this page when reporting an issue to app or Google support for faster diagnosis",
  ],
  relatedSettingIds: ["android-about-phone", "android-developer-options", "android-security-patch-level"],
  afterImageContent: {
    heading: "How the Version Detail Page Works",
    paragraphs: [
      "This page pulls live values directly from the system's build properties, showing the precise version, build, and patch identifiers currently installed.",
      "Because it reads live system state, it always reflects the most recently applied update.",
    ],
    steps: [
      "Open Settings → About phone",
      "Tap 'Android version'",
      "Review Android version, security patch, build number, and related details",
    ],
  },
},
{
  id: "android-legal-information",
  title: "Legal Information",
  icon: Info,
  platform: "android",
  category: "system-info",
  controlType: "action",
  heading: "Review licenses and legal notices",
  description: "Provides access to open-source software licenses, third-party notices, terms of service, and privacy policy documents bundled with the Android operating system.",
  details: [
    "Lists open-source licenses for components used in Android",
    "Links to Google's Terms of Service and Privacy Policy",
    "Includes manufacturer-specific legal notices where applicable",
    "Located under About phone → Legal information",
  ],
  redirectUrl: "https://support.google.com/android",
  whyItMatters: "Legal information pages fulfill open-source licensing obligations and provide transparency about the terms governing use of the device and its bundled software. While most users rarely open this section, it's an important reference for developers checking license compliance, and for anyone wanting to understand the legal terms they agreed to during setup. It also serves as a factual record of which policies apply to the device's pre-installed software.",
  bestPractices: [
    "Reference this page if you need to verify open-source license compliance for a component",
    "Review the linked privacy policy periodically, since it can be updated over time",
    "Use this section rather than searching online if you need the manufacturer's exact legal notices",
  ],
  commonIssues: [
    { issue: "Can't find a specific component's license", fix: "Use the in-page search function within the open-source licenses list, since it can be very long." },
    { issue: "Legal information page won't load", fix: "This page is stored locally and shouldn't require internet access; try restarting the Settings app if it fails to open." },
  ],
  faqs: [
    { q: "Are these the same terms I agreed to during setup?", a: "Yes, this section provides ongoing access to the terms of service and privacy policy presented during initial device setup." },
    { q: "Does this include third-party app licenses?", a: "No, it only covers licenses for software bundled with the operating system itself, not individually installed apps." },
    { q: "Is this page the same across all Android devices?", a: "The core Android open-source licenses are similar, but manufacturers add their own additional legal notices." },
  ],
  tipsAndTricks: [
    "Use this page as a reference when auditing a device fleet for open-source compliance",
    "Bookmark the linked privacy policy URL for easier future access outside the Settings app",
  ],
  relatedSettingIds: ["android-about-phone", "android-regulatory-labels", "android-version-detail"],
  afterImageContent: {
    heading: "How Legal Information Is Organized",
    paragraphs: [
      "This section aggregates static legal documents bundled with the operating system image, including open-source license texts and policy links maintained by Google and the device manufacturer.",
      "Content here doesn't change with routine software updates but may be revised during major OS version upgrades.",
    ],
    steps: [
      "Open Settings → About phone",
      "Tap 'Legal information'",
      "Select a category such as open-source licenses, terms of service, or privacy policy",
    ],
  },
},
{
  id: "android-regulatory-labels",
  title: "Regulatory Labels",
  icon: Info,
  platform: "android",
  category: "system-info",
  controlType: "action",
  heading: "View compliance certifications and labels",
  description: "Displays the electronic version of regulatory compliance labels and certification marks (such as FCC ID, CE marking, and country-specific approvals) that would traditionally appear printed on the device.",
  details: [
    "Shows certification marks required by regulators in different countries and regions",
    "Includes the FCC ID used to look up official certification filings",
    "Serves as the digital equivalent of a printed compliance label on the device back or box",
    "Located under About phone → Regulatory labels",
  ],
  redirectUrl: "https://support.google.com/android",
  whyItMatters: "Many modern phones no longer print physical regulatory labels on the device itself, relying instead on an electronic label accessible through settings, as permitted by regulatory bodies like the FCC. This page matters for verifying a device's compliance certification, particularly when importing a phone internationally, reselling it, or researching its official regulatory filings. It's also occasionally needed by customs or import documentation processes.",
  bestPractices: [
    "Reference the FCC ID here when looking up official certification filings online",
    "Check regulatory labels before traveling internationally with a device to confirm regional certification",
    "Keep a record of this information if reselling the device, since some buyers request it",
  ],
  commonIssues: [
    { issue: "No physical label is printed on the device", fix: "This is expected on many modern phones; the electronic label in this settings page fulfills the same regulatory requirement." },
    { issue: "FCC ID doesn't return results when searched", fix: "Double-check for typos, since FCC IDs use a specific grantee code plus product code format." },
  ],
  faqs: [
    { q: "Why don't manufacturers print labels on the device anymore?", a: "Regulators allow electronic display of compliance labels as an alternative to physical printing on modern compact devices." },
    { q: "Is this the same across every country's version of the phone?", a: "No, regulatory labels vary by region since different countries have different certification requirements." },
    { q: "Can I use this page to verify a device isn't counterfeit?", a: "It can help cross-reference certification details, though it isn't a complete counterfeit detection method on its own." },
  ],
  tipsAndTricks: [
    "Search the FCC ID shown here on the FCC's public database for the official certification filing",
    "Screenshot this page before international travel if a destination requires proof of certification",
  ],
  relatedSettingIds: ["android-legal-information", "android-about-phone", "android-model-hardware-info"],
  afterImageContent: {
    heading: "How Regulatory Labels Work",
    paragraphs: [
      "The electronic label displays certification identifiers assigned to the device by regulatory agencies during the approval process required before sale in a given market.",
      "This digital label satisfies the same legal requirement as a traditional printed compliance sticker.",
    ],
    steps: [
      "Open Settings → About phone",
      "Tap 'Regulatory labels'",
      "View certification marks and identifiers such as the FCC ID",
    ],
  },
},
{
  id: "android-device-status-info",
  title: "Device Status Information",
  icon: Activity,
  platform: "android",
  category: "system-info",
  controlType: "action",
  heading: "Check network, uptime, and connection status",
  description: "Displays live technical status details including SIM status, IP address, Wi-Fi MAC address, Bluetooth address, network signal strength, and device uptime since last restart.",
  details: [
    "Shows current IP address and Wi-Fi MAC address for network troubleshooting",
    "Lists SIM status including carrier and signal information",
    "Displays device uptime since the last reboot",
    "Located under About phone → Status information",
  ],
  redirectUrl: "https://support.google.com/android",
  whyItMatters: "Status information consolidates several live technical details that are otherwise scattered across different apps and menus, making it a go-to reference during network troubleshooting or when a router, MDM system, or IT helpdesk needs a device's MAC address for allow-listing. Uptime data can also help diagnose recurring performance issues, since a device that hasn't restarted in a long time is more likely to be running with degraded memory or background processes.",
  bestPractices: [
    "Provide the Wi-Fi MAC address from this page when setting up router-level device allow-listing",
    "Check uptime periodically and restart the device if it's been running for many days without a reboot",
    "Reference SIM and signal status here when troubleshooting connectivity with your carrier",
  ],
  commonIssues: [
    { issue: "IP address shown doesn't match what's expected", fix: "Confirm whether Wi-Fi or mobile data is active, since the displayed IP corresponds to the currently connected network." },
    { issue: "MAC address appears randomized and changes between networks", fix: "This is expected behavior from MAC randomization privacy features on newer Android versions." },
    { issue: "Uptime resets unexpectedly", fix: "Check for automatic restarts triggered by system updates or scheduled reboot settings." },
  ],
  faqs: [
    { q: "Why does my Wi-Fi MAC address look different on each network?", a: "Android uses randomized MAC addresses per network by default for privacy, rather than a single fixed hardware address." },
    { q: "Does high uptime cause performance problems?", a: "It can contribute to accumulated background processes and memory pressure, which a restart typically clears." },
    { q: "Is this the same as network diagnostics tools?", a: "It provides some of the same raw data, but dedicated network diagnostics tools offer more active testing." },
  ],
  tipsAndTricks: [
    "Use the MAC address shown here for parental control or router-level device filtering setup",
    "Check this page first when an IT helpdesk asks for your device's current IP or MAC address",
  ],
  relatedSettingIds: ["android-about-phone", "android-network-sim-diagnostics", "android-developer-options"],
  afterImageContent: {
    heading: "How Device Status Information Works",
    paragraphs: [
      "This page queries live system state from the network and telephony stacks each time it's opened, so values like IP address and signal strength update in real time.",
      "Uptime is tracked from the moment the device last fully booted, resetting to zero after every restart.",
    ],
    steps: [
      "Open Settings → About phone",
      "Tap 'Status information' (or 'SIM status')",
      "Review IP address, MAC addresses, SIM status, and uptime",
    ],
  },
},
{
  id: "android-auto-update-apps",
  title: "Auto-update Apps Setting",
  icon: RefreshCw,
  platform: "android",
  category: "system-updates",
  controlType: "action",
  heading: "Control automatic app updates from Play Store",
  description: "Configures whether apps installed from the Play Store update automatically, and under what network conditions, so new versions install without manual action.",
  details: [
    "Options typically include auto-update over any network, Wi-Fi only, or never",
    "Applies globally, with the ability to disable auto-update for individual apps",
    "Updates usually install in the background when the device is idle and charging",
    "Found in the Play Store app under Settings → Network preferences",
  ],
  redirectUrl: "https://support.google.com/googleplay/answer/113412",
  whyItMatters: "Automatic app updates keep apps patched against security vulnerabilities and bugs without requiring users to remember to check manually, which is important since outdated apps are a common attack vector. At the same time, unrestricted auto-updates over mobile data can consume significant cellular data allowances, making the network preference choice meaningful for users on limited plans. This setting lets each user balance staying current against controlling data usage and update timing.",
  bestPractices: [
    "Set auto-update to Wi-Fi only if you have a limited mobile data plan",
    "Leave auto-update enabled for security-sensitive apps like browsers and banking apps",
    "Disable auto-update for specific apps where you want to control version changes manually",
    "Periodically check for manual updates if auto-update is fully disabled",
  ],
  commonIssues: [
    { issue: "Apps use unexpected mobile data for updates", fix: "Change the network preference to Wi-Fi only in Play Store settings." },
    { issue: "An app didn't update despite auto-update being enabled", fix: "Check if auto-update was individually disabled for that app on its Play Store listing page." },
    { issue: "Updates only happen very late at night", fix: "This is expected, since updates are often scheduled for idle, charging periods to minimize disruption." },
  ],
  faqs: [
    { q: "Does disabling auto-update stop security patches for apps?", a: "Yes, apps won't receive new versions, including security fixes, until manually updated." },
    { q: "Can I auto-update some apps but not others?", a: "Yes, individual apps can be excluded from auto-update on their Play Store page even with the global setting on." },
    { q: "Do system updates use this same setting?", a: "No, this only controls app updates through Play Store; OS-level system updates are managed separately." },
  ],
  tipsAndTricks: [
    "Check the Play Store's 'Manage apps & device' section to see which updates are pending",
    "Use Wi-Fi only mode while traveling internationally to avoid roaming data charges from updates",
  ],
  relatedSettingIds: ["android-play-system-update", "android-app-download-network-preference", "android-system-update"],
  updateFrequency: "Apps update automatically as new versions are published",
  afterImageContent: {
    heading: "How Auto-update Apps Works",
    paragraphs: [
      "The Play Store periodically checks for new versions of installed apps and, based on this setting, downloads and installs them automatically under the chosen network conditions.",
      "Individual app-level overrides take precedence over the global default, allowing fine control app by app.",
    ],
    steps: [
      "Open the Play Store app",
      "Tap your profile icon → Settings → Network preferences",
      "Tap 'Auto-update apps'",
      "Choose Over any network, Over Wi-Fi only, or Don't auto-update apps",
    ],
  },
},
{
  id: "android-app-download-network-preference",
  title: "App Download Network Preference",
  icon: Wifi,
  platform: "android",
  category: "system-updates",
  controlType: "action",
  heading: "Set which networks can download large app updates",
  description: "Determines whether the Play Store is allowed to download large app installations and updates over mobile data, Wi-Fi only, or asks each time for files above a certain size.",
  details: [
    "Configurable separately for app downloads versus updates in some Play Store versions",
    "Can be set to always ask before large downloads over mobile data",
    "Helps avoid unexpected data charges from large game or app installs",
    "Located in Play Store → Settings → Network preferences",
  ],
  redirectUrl: "https://support.google.com/googleplay/answer/113412",
  whyItMatters: "Modern apps, particularly games, can be several gigabytes in size, and downloading them over mobile data without restriction can quickly consume a monthly data allowance or incur overage charges. This preference gives users direct control over when large data transfers are allowed to happen, which is especially valuable for users on metered, capped, or expensive mobile data plans. It complements the auto-update setting by specifically addressing the download size threshold rather than just the auto-update toggle.",
  bestPractices: [
    "Set large downloads to Wi-Fi only if your mobile plan has a low data cap",
    "Use the 'ask every time' option if you occasionally need large downloads on the go",
    "Review this setting before traveling internationally where mobile data may be expensive",
  ],
  commonIssues: [
    { issue: "A large app download is stuck pending", fix: "Check if it's waiting for a Wi-Fi connection due to this network preference, and connect to Wi-Fi to resume." },
    { issue: "Unexpected mobile data usage from app downloads", fix: "Switch the network preference to Wi-Fi only or ask-each-time to prevent future large downloads over cellular." },
    { issue: "Setting doesn't apply to a specific app install", fix: "Some smaller apps fall below the size threshold and download regardless of network preference." },
  ],
  faqs: [
    { q: "Does this affect app updates as well as new installs?", a: "Yes, on many Play Store versions this preference applies to both new app downloads and subsequent updates." },
    { q: "What size threshold triggers this restriction?", a: "The exact threshold can vary by Play Store version, but it generally applies to larger app packages rather than small updates." },
    { q: "Can I override the restriction for a single download?", a: "Yes, when prompted you can typically choose to proceed over mobile data for that specific download." },
  ],
  tipsAndTricks: [
    "Queue large game downloads while connected to home Wi-Fi overnight",
    "Check your carrier's data usage dashboard periodically if you frequently allow downloads over mobile data",
  ],
  relatedSettingIds: ["android-auto-update-apps", "android-play-system-update", "android-storage-cleanup"],
  afterImageContent: {
    heading: "How Download Network Preference Works",
    paragraphs: [
      "Before starting a download above the size threshold, the Play Store checks this preference to decide whether to proceed automatically, wait for Wi-Fi, or prompt for confirmation.",
      "This applies independently of whether auto-update for apps is enabled, adding an extra layer of data control.",
    ],
    steps: [
      "Open the Play Store app",
      "Tap your profile icon → Settings → Network preferences",
      "Tap 'App download preference'",
      "Choose Over any network, Over Wi-Fi only, or Ask me every time",
    ],
  },
},
{
  id: "android-check-for-update",
  title: "Manual Check for System Update",
  icon: RotateCcw,
  platform: "android",
  category: "system-updates",
  controlType: "action",
  heading: "Manually check for a new Android version",
  description: "Lets you trigger an immediate check with Google or your carrier's update servers to see if a new Android OS version or patch is available, rather than waiting for an automatic notification.",
  details: [
    "Checks against your device model, carrier, and region for eligible updates",
    "Shows current version and any available update with release notes",
    "Can be used to confirm an update finished installing successfully",
    "Found under Settings → System → System update",
  ],
  redirectUrl: "https://support.google.com/android/answer/7680439",
  whyItMatters: "While Android typically notifies users automatically when an update is ready, notifications can be missed, dismissed, or delayed by network conditions. Manually checking for updates gives users direct control to confirm they're on the latest, most secure version rather than passively waiting, which is particularly useful right after a publicized security patch or feature release. It's also a common first troubleshooting step support teams ask users to perform when diagnosing device issues.",
  bestPractices: [
    "Manually check after reading about a newly released Android security patch",
    "Check for updates before troubleshooting other issues, since some bugs are already fixed in later versions",
    "Connect to Wi-Fi before checking to ensure any found update downloads quickly",
  ],
  commonIssues: [
    { issue: "No update found despite a new version being publicized", fix: "Updates often roll out in stages by region and carrier, so it may not yet be available for your specific device." },
    { issue: "Check for update gets stuck loading", fix: "Confirm you have an active internet connection and retry, or restart the device and check again." },
    { issue: "Update is available but won't download", fix: "Ensure sufficient free storage space is available, since updates require room to download and install." },
  ],
  faqs: [
    { q: "Does manually checking use extra data?", a: "The check itself uses minimal data; the actual update download is what consumes significant data if found." },
    { q: "Why does my carrier variant get updates later than unlocked models?", a: "Carrier-branded devices often require additional carrier testing and approval before an update is released to them." },
    { q: "Can I force an update to install immediately?", a: "You can download and install once found, but you can't force Google to release an update earlier than its staged rollout schedule." },
  ],
  tipsAndTricks: [
    "Check for updates right after setting up a new phone to ensure it starts on the latest version",
    "Keep the device plugged in while installing a found update to avoid interruption",
  ],
  relatedSettingIds: ["android-system-update", "android-security-patch-level", "android-scheduled-system-updates"],
  updateFrequency: "Check manually anytime; automatic checks also run periodically",
  afterImageContent: {
    heading: "How Manual Update Checks Work",
    paragraphs: [
      "Tapping 'Check for update' sends a request to Google's or your carrier's update servers with your device's model and current version to determine eligibility for a newer release.",
      "If an update is available, it begins downloading in the background, ready to install once confirmed.",
    ],
    steps: [
      "Open Settings → System",
      "Tap 'System update'",
      "Tap 'Check for update'",
      "Download and install if a new version is found",
    ],
  },
},
{
  id: "android-scheduled-system-updates",
  title: "Scheduled System Update Installs",
  icon: Clock,
  platform: "android",
  category: "system-updates",
  controlType: "action",
  heading: "Schedule when downloaded updates install",
  description: "Lets a downloaded system update install automatically overnight or at a chosen time instead of immediately, so the required restart doesn't interrupt active use of the phone.",
  details: [
    "Common options include 'install now' or 'install tonight'",
    "The device typically needs to be charging and idle for scheduled installs to trigger",
    "Reduces the chance of an update interrupting active tasks or calls",
    "Presented as part of the system update notification or installation prompt",
  ],
  redirectUrl: "https://support.google.com/android/answer/7680439",
  whyItMatters: "System updates require a restart, which can be disruptive if it happens in the middle of active use. Scheduling installation for overnight or idle periods ensures the device is ready and fully updated by the time it's needed again, without forcing an interruption during the day. This is especially useful for people who use their phone continuously for work or communication and don't want an update prompt derailing an important task.",
  bestPractices: [
    "Choose the overnight install option so updates complete without interrupting your day",
    "Keep the phone plugged in overnight when a scheduled install is pending",
    "Avoid repeatedly postponing updates, since delaying too long can leave security gaps",
  ],
  commonIssues: [
    { issue: "Scheduled install didn't happen overnight", fix: "Confirm the phone was charging and had sufficient battery, since scheduled installs typically require both conditions." },
    { issue: "Phone restarts unexpectedly during the day", fix: "Check if 'install now' was previously selected instead of a scheduled time, or if the deferral window expired." },
    { issue: "Update keeps getting postponed automatically", fix: "Manually select 'install now' if repeated automatic deferrals are preventing the update from completing." },
  ],
  faqs: [
    { q: "Can I choose a specific custom time for the install?", a: "Most devices only offer a general 'tonight' or 'now' choice rather than a precise custom time picker." },
    { q: "Does a scheduled install still require my approval first?", a: "Typically yes, you approve the update to begin download, and scheduling only affects the timing of the final restart and install." },
    { q: "What happens if I never approve the update at all?", a: "The device will continue reminding you periodically, but the update won't install until you take action." },
  ],
  tipsAndTricks: [
    "Plug your phone in before bed on nights you know an update is pending",
    "Check the system update page in the morning to confirm a scheduled install completed successfully",
  ],
  relatedSettingIds: ["android-check-for-update", "android-system-update", "android-play-system-update"],
  afterImageContent: {
    heading: "How Scheduled Updates Work",
    paragraphs: [
      "Once an update is downloaded, the system waits for the chosen trigger, typically overnight charging and idle time, before automatically completing installation and restarting.",
      "If the trigger conditions aren't met, the install is deferred and retried at the next opportunity.",
    ],
    steps: [
      "Open Settings → System → System update",
      "Download the available update if not already downloaded",
      "Choose 'Install tonight' or a similar scheduled option when prompted",
      "Leave the device charging to allow the scheduled install to complete",
    ],
  },
},
{
  id: "android-baseband-firmware-version",
  title: "Baseband & Firmware Version Info",
  icon: Info,
  platform: "android",
  category: "system-updates",
  controlType: "action",
  heading: "Check modem and firmware version numbers",
  description: "Shows the baseband (modem/radio firmware) version and other low-level firmware identifiers separate from the main Android OS version, useful for diagnosing connectivity issues.",
  details: [
    "Baseband version reflects the cellular modem firmware, updated separately from Android OS",
    "Useful when support asks for exact radio firmware during network troubleshooting",
    "Found alongside build number on the detailed version info page",
    "Updates to baseband are typically bundled within regular system updates",
  ],
  redirectUrl: "https://support.google.com/pixelphone/answer/10402530",
  whyItMatters: "The baseband, or modem firmware, governs how the device communicates with cellular networks and is updated independently of the visible Android version number. When carriers or support teams troubleshoot call quality, signal strength, or VoLTE issues, they often specifically request the baseband version rather than the general OS version, since a modem firmware mismatch can be the actual root cause. Knowing where to find this number speeds up carrier-side troubleshooting significantly.",
  bestPractices: [
    "Provide the baseband version when reporting persistent call or signal issues to your carrier",
    "Check this value after a system update if you're troubleshooting a connectivity regression",
    "Keep the device updated, since baseband fixes are usually bundled with regular system updates rather than issued separately",
  ],
  commonIssues: [
    { issue: "Baseband version shows 'unknown'", fix: "This can happen on Wi-Fi-only tablets or during certain recovery states; a full reboot often resolves it." },
    { issue: "Signal issues persist despite an updated baseband", fix: "The issue may be network-side or SIM-related rather than firmware-related; contact your carrier for further diagnosis." },
    { issue: "Baseband version doesn't change after a system update", fix: "Not every system update includes a baseband/radio firmware change, so this can be expected." },
  ],
  faqs: [
    { q: "Can I update the baseband separately from Android?", a: "No, on most consumer devices baseband updates are bundled within regular system updates rather than distributed independently." },
    { q: "Is baseband the same as SIM firmware?", a: "No, baseband refers to the device's own cellular modem firmware, while SIM firmware is managed separately by the SIM card and carrier." },
    { q: "Does a different baseband version affect Wi-Fi performance?", a: "No, baseband specifically governs cellular connectivity, not Wi-Fi." },
  ],
  tipsAndTricks: [
    "Have the baseband version ready before starting a carrier support call about signal issues",
    "Cross-reference baseband version with community forums if experiencing a known connectivity bug after an update",
  ],
  relatedSettingIds: ["android-version-detail", "android-carrier-updates", "android-device-status-info"],
  afterImageContent: {
    heading: "How Baseband Version Info Works",
    paragraphs: [
      "This value is read directly from the cellular modem's firmware and displayed alongside other build identifiers, independent of the main Android OS version number.",
      "It updates only when a system update specifically includes a new radio firmware package.",
    ],
    steps: [
      "Open Settings → About phone",
      "Tap 'Android version' or 'Status information'",
      "Locate 'Baseband version' in the listed details",
    ],
  },
},
{
  id: "android-network-sim-diagnostics",
  title: "Network & SIM Diagnostics",
  icon: Router,
  platform: "android",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  heading: "Diagnose mobile network and SIM issues",
  description: "Provides tools to check SIM status, run network diagnostics, and reset APN settings to troubleshoot problems like no signal, failed calls, or data connectivity issues.",
  details: [
    "Displays SIM status including carrier name, signal strength, and network type",
    "Allows manual APN (Access Point Name) configuration review and reset",
    "Includes toggling airplane mode as a basic connectivity reset step",
    "Found under Settings → Network & internet → SIMs",
  ],
  redirectUrl: "https://support.google.com/android",
  whyItMatters: "Mobile connectivity problems are among the most disruptive issues a phone can have, cutting off calls, texts, and data access entirely. Having a centralized place to check SIM health, verify network settings, and reset APN configuration means users can often resolve common connectivity issues themselves before needing to contact a carrier. This is particularly useful after switching SIM cards, traveling internationally, or following a software update that may have altered network settings.",
  bestPractices: [
    "Toggle airplane mode on and off first as a quick connectivity reset before deeper troubleshooting",
    "Verify SIM status shows the correct carrier name after inserting a new SIM",
    "Reset APN settings to carrier defaults if data stopped working after a manual change",
    "Check network type (4G/5G) settings if experiencing unexpectedly slow data speeds",
  ],
  commonIssues: [
    { issue: "No service despite the SIM being properly inserted", fix: "Check SIM status for errors, try airplane mode toggle, and confirm the SIM isn't reported as invalid or locked." },
    { issue: "Mobile data doesn't work after switching carriers", fix: "Reset APN settings to the new carrier's defaults, since old APN configurations can conflict." },
    { issue: "Calls fail to connect while data still works", fix: "Check VoLTE/Wi-Fi calling settings, since these can be misconfigured independently of general data connectivity." },
  ],
  faqs: [
    { q: "Will resetting APN settings delete my contacts or apps?", a: "No, APN reset only affects network connection parameters, not personal data or installed apps." },
    { q: "Does this tool work for eSIMs as well as physical SIMs?", a: "Yes, SIM status and network diagnostics apply to both physical and eSIM profiles." },
    { q: "Can I run these diagnostics without a working data connection?", a: "Yes, most SIM status and diagnostic views don't require an active data connection to display." },
  ],
  tipsAndTricks: [
    "Restart the device after resetting APN settings for changes to fully take effect",
    "Check signal strength readings here rather than relying solely on the status bar icon, which can lag behind actual conditions",
  ],
  relatedSettingIds: ["android-device-status-info", "android-carrier-updates", "android-reset-wifi-mobile-bluetooth"],
  afterImageContent: {
    heading: "How Network & SIM Diagnostics Work",
    paragraphs: [
      "This tool queries the telephony stack directly for live SIM and network registration status, then offers configuration resets for common connectivity settings like APN.",
      "Because it interacts with low-level radio settings, changes here can require a restart to fully apply.",
    ],
    steps: [
      "Open Settings → Network & internet",
      "Tap 'SIMs' and select the relevant SIM",
      "Review signal, carrier, and status details",
      "Tap 'Access Point Names' to review or reset APN configuration if needed",
    ],
  },
},
{
  id: "android-app-crash-reports",
  title: "App Crash & ANR Reports",
  icon: AppWindow,
  platform: "android",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  heading: "Review recent app crashes and freezes",
  description: "Shows a log of recent app crashes and 'Application Not Responding' (ANR) events, letting you identify which apps are unstable and access details useful for reporting bugs to developers.",
  details: [
    "Lists recent crash and freeze events with timestamps and affected app names",
    "Available through Developer options as 'App crashes' or similar",
    "Can be used alongside 'Send feedback' to attach relevant crash details",
    "Helps identify a specific misbehaving app rather than guessing which one is unstable",
  ],
  redirectUrl: "https://support.google.com/android",
  whyItMatters: "When a phone feels sluggish or unstable, it's often difficult to pinpoint whether the cause is the operating system or a single misbehaving app. The crash and ANR log provides concrete evidence, showing exactly which apps have failed and how often, which helps direct troubleshooting efforts toward uninstalling, updating, or reporting the actual offending app rather than performing unnecessary broader fixes like a factory reset.",
  bestPractices: [
    "Check this log before assuming a general device issue when only one app seems to misbehave",
    "Update or reinstall an app that appears repeatedly in the crash log",
    "Use crash details when submitting a bug report to a developer for faster resolution",
    "Review this log after enabling Developer options if experiencing unexplained slowdowns",
  ],
  commonIssues: [
    { issue: "Crash log is empty despite experiencing app crashes", fix: "Confirm Developer options is enabled, since this log typically requires it to be accessible." },
    { issue: "Same app crashes repeatedly with no clear reason", fix: "Clear that app's cache and data, or reinstall it, and monitor whether crashes continue." },
    { issue: "ANR events happen across many different apps", fix: "This can indicate a broader system resource issue, such as low storage or memory pressure, rather than a single app problem." },
  ],
  faqs: [
    { q: "What does ANR mean?", a: "ANR stands for 'Application Not Responding,' logged when an app's main thread is blocked long enough that the system considers it frozen." },
    { q: "Can I export this log to send to a developer?", a: "Some devices allow sharing crash details directly; otherwise, a full bug report can be generated for more complete data." },
    { q: "Does clearing this log fix the underlying issue?", a: "No, clearing the log only removes the history; the underlying app instability must be fixed separately." },
  ],
  tipsAndTricks: [
    "Cross-reference the crash log with recent app updates to spot a newly introduced bug",
    "Combine with the Bug Report tool for a full technical capture when reporting a persistent issue",
  ],
  relatedSettingIds: ["android-developer-options", "android-send-feedback", "android-bug-report-tool"],
  afterImageContent: {
    heading: "How App Crash Reports Work",
    paragraphs: [
      "The system logs each crash or ANR event as it happens, recording the responsible app, timestamp, and basic technical details for later review.",
      "This log is primarily intended for troubleshooting and developer bug reporting rather than everyday use.",
    ],
    steps: [
      "Open Settings → System → Developer options",
      "Scroll to find 'App crashes' or a similar diagnostics entry",
      "Review the list of recent crash and ANR events",
      "Tap an entry for more detail, or use it to inform an app update, reinstall, or bug report",
    ],
  },
},
{
  id: "android-reset-wifi-mobile-bluetooth",
  title: "Reset Wi-Fi, Mobile & Bluetooth",
  icon: RotateCcw,
  platform: "android",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  heading: "Reset all network settings to defaults",
  description: "Resets Wi-Fi networks, saved passwords, mobile network/APN settings, and Bluetooth pairings back to factory defaults, without erasing personal files, photos, or installed apps.",
  details: [
    "Removes all saved Wi-Fi networks and passwords",
    "Clears Bluetooth device pairings, requiring re-pairing afterward",
    "Resets mobile network settings including APN configuration",
    "Does not affect installed apps, photos, or other personal data",
  ],
  important: "You'll need to re-enter Wi-Fi passwords and re-pair Bluetooth devices after this reset, so make sure you know your Wi-Fi credentials beforehand.",
  redirectUrl: "https://support.google.com/pixelphone/answer/4596836",
  whyItMatters: "Persistent connectivity issues, like a phone that won't reconnect to Wi-Fi, keeps dropping Bluetooth pairings, or has scrambled mobile data settings, can often be traced to corrupted or conflicting saved network configurations that accumulate over time. Resetting just the network settings offers a middle-ground fix that's far less disruptive than a full factory reset, clearing out the likely cause without touching personal files, installed apps, or accounts.",
  bestPractices: [
    "Try this reset before resorting to a full factory reset for persistent connectivity issues",
    "Write down or have access to your home Wi-Fi password before resetting, since it will need to be re-entered",
    "Re-pair essential Bluetooth devices like headphones and car systems immediately after resetting",
  ],
  commonIssues: [
    { issue: "Forgot Wi-Fi password after resetting", fix: "Check your router's label for the default password, or retrieve it from another already-connected device before resetting if possible." },
    { issue: "Bluetooth device won't re-pair after reset", fix: "Put the device into pairing mode again and search for it fresh, since it was fully removed from the paired list." },
    { issue: "Mobile data still doesn't work after the reset", fix: "This may indicate a SIM or carrier-side issue rather than a settings problem; contact your carrier for further diagnosis." },
  ],
  faqs: [
    { q: "Will this delete my photos or apps?", a: "No, this reset is limited to network-related settings and does not touch personal files or installed apps." },
    { q: "Does this reset Wi-Fi calling and VPN settings too?", a: "Yes, saved VPN configurations and Wi-Fi calling preferences are typically included in this reset." },
    { q: "Is this the same as airplane mode toggling?", a: "No, airplane mode is a temporary connectivity toggle, while this reset permanently clears saved network configurations." },
  ],
  tipsAndTricks: [
    "Use this reset specifically when experiencing a cluster of unrelated Wi-Fi, Bluetooth, and mobile data issues at once",
    "Restart the device immediately after resetting to ensure all network stacks reinitialize cleanly",
  ],
  relatedSettingIds: ["android-network-sim-diagnostics", "android-reset-app-preferences", "android-factory-reset"],
  afterImageContent: {
    heading: "How This Reset Works",
    paragraphs: [
      "The reset clears the device's stored network configuration database, including Wi-Fi credentials, Bluetooth pairing keys, and mobile APN settings, forcing them back to factory defaults.",
      "Because this only touches network-related settings, other data such as apps, accounts, and files remain completely untouched.",
    ],
    steps: [
      "Open Settings → System → Reset options",
      "Tap 'Reset Wi-Fi, mobile & Bluetooth'",
      "Confirm the reset when prompted",
      "Reconnect to Wi-Fi networks and re-pair Bluetooth devices afterward",
    ],
  },
},
{
  id: "android-reset-app-preferences",
  title: "Reset App Preferences",
  icon: RotateCcw,
  platform: "android",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  heading: "Restore default app settings without deleting apps",
  description: "Re-enables previously disabled apps, resets default app choices, clears background data restrictions, and restores notification permissions to default, without uninstalling anything or deleting personal data.",
  details: [
    "Re-enables any apps you previously disabled",
    "Resets default apps chosen for actions like opening links or making calls",
    "Restores background data restrictions and permission preferences to default",
    "Does not delete any app data, accounts, or personal files",
  ],
  redirectUrl: "https://support.google.com/pixelphone/answer/4596836",
  whyItMatters: "Over time, users often make small app-level configuration choices, like setting one browser as default or restricting a specific app's background data, that can be forgotten and later cause confusing behavior, such as links opening in an unexpected app. Reset App Preferences offers a lightweight way to clear out this accumulated configuration debt without the drastic step of uninstalling apps or wiping personal data, restoring a cleaner default state to troubleshoot from.",
  bestPractices: [
    "Use this reset if default app behavior (like which browser opens links) seems incorrect and can't be traced to a specific setting",
    "Try this before uninstalling and reinstalling an app that seems misconfigured",
    "Re-check default apps and permissions after performing this reset, since choices will need to be made again",
  ],
  commonIssues: [
    { issue: "A previously disabled app is now active again unexpectedly", fix: "This is expected behavior, since resetting app preferences re-enables any manually disabled apps." },
    { issue: "Default app for calls or browsing changed after reset", fix: "Re-select your preferred default app the next time you're prompted, or set it manually in app settings." },
    { issue: "Notification permissions reverted for several apps", fix: "Review and re-grant notification permissions for apps where you want alerts restored." },
  ],
  faqs: [
    { q: "Does this delete any app data or logins?", a: "No, it only resets preference and permission settings, not app data, files, or account logins." },
    { q: "Will this uninstall any apps?", a: "No, all installed apps remain installed; only previously disabled apps get re-enabled." },
    { q: "Is this reversible?", a: "The reset itself can't be undone, but individual settings it changes can be manually reconfigured afterward." },
  ],
  tipsAndTricks: [
    "Use this as a lightweight troubleshooting step before more drastic resets when app behavior seems off",
    "Recheck default apps for browsing, messaging, and calling immediately after performing this reset",
  ],
  relatedSettingIds: ["android-app-permissions", "android-reset-wifi-mobile-bluetooth", "android-factory-reset"],
  afterImageContent: {
    heading: "How Reset App Preferences Works",
    paragraphs: [
      "This action clears stored preference flags across all apps, including disabled status, default app assignments, and background data restrictions, returning them to their original installed state.",
      "It does not touch the apps' actual data, files, or signed-in accounts, only the surrounding system-level preferences.",
    ],
    steps: [
      "Open Settings → Apps",
      "Tap the overflow menu (three dots) → 'Reset app preferences'",
      "Confirm the reset",
      "Re-review default apps and permissions as needed afterward",
    ],
  },
},
{
  id: "android-bug-report-tool",
  title: "Capture Bug Report Tool",
  icon: Terminal,
  platform: "android",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  heading: "Generate a detailed technical diagnostic report",
  description: "Captures a comprehensive technical snapshot of the device's current state, including system logs, running processes, and recent errors, useful for sharing with developers or Google support when troubleshooting complex bugs.",
  details: [
    "Available in interactive, full, or wear-optimized report formats depending on the device",
    "Requires Developer options to be enabled first",
    "Generated report is saved as a shareable file, not automatically transmitted",
    "Far more detailed than a standard feedback submission",
  ],
  important: "Bug reports can contain sensitive technical information such as network names and app activity, so only share them with trusted developers or official support channels.",
  redirectUrl: "https://support.google.com/pixelphone/answer/6398243",
  whyItMatters: "When an issue is too complex or intermittent for standard feedback to capture, a full bug report gives developers and Google's support team deep technical visibility into what the device was actually doing, including system logs, running processes, and error traces at the moment of the problem. This is the diagnostic tool of last resort for stubborn issues, and it's often specifically requested by app developers or Google support agents when other troubleshooting steps haven't identified the cause.",
  bestPractices: [
    "Reproduce the issue immediately before or during report generation for the most relevant logs",
    "Only share the generated report through official, trusted channels given its technical detail",
    "Use the interactive report option to add screenshots and a description of the specific issue",
    "Delete old bug report files afterward, since they can be large and are usually only needed once",
  ],
  commonIssues: [
    { issue: "Bug report option isn't available", fix: "Enable Developer options first, since the bug report tool is nested within it." },
    { issue: "Report generation takes a long time or seems stuck", fix: "This is normal for full reports, which can take several minutes to capture all system logs." },
    { issue: "Unsure where the generated report file is saved", fix: "Check the notification shade for a share prompt, or look in the Files app under the report's save location." },
  ],
  faqs: [
    { q: "Is a bug report the same as Send Feedback?", a: "No, Send Feedback is a simpler user-facing tool, while a full bug report captures much deeper technical system data." },
    { q: "Does generating a bug report send anything automatically?", a: "No, it only creates a local file that you choose to share afterward." },
    { q: "Can I read the contents of a bug report myself?", a: "Yes, though it's a raw technical log file primarily intended for developer or support analysis rather than casual reading." },
  ],
  tipsAndTricks: [
    "Use the interactive bug report option so you can annotate exactly when and how the issue occurred",
    "Generate the report as soon as possible after an issue happens, since relevant logs can be overwritten over time",
  ],
  relatedSettingIds: ["android-developer-options", "android-send-feedback", "android-app-crash-reports"],
  afterImageContent: {
    heading: "How the Bug Report Tool Works",
    paragraphs: [
      "When triggered, the system compiles logs from the kernel, running apps, and device state into a single compressed file, capturing a detailed snapshot of what was happening at that moment.",
      "The resulting file must be manually shared, typically via email or a support upload link, and is not sent anywhere automatically.",
    ],
    steps: [
      "Open Settings → System → Developer options",
      "Tap 'Bug report'",
      "Choose Full report or Interactive report",
      "Wait for capture to complete, then share the generated file as needed",
    ],
  },
},{
  id: "android-privacy-sandbox-ads",
  title: "Privacy Sandbox & Ad Topics",
  icon: ShieldCheck,
  platform: "android",
  category: "privacy-permissions",
  controlType: "action",
  heading: "Control on-device ad personalization signals",
  description:
    "Privacy Sandbox settings let you review and turn off the Topics, App Functions, and Attribution APIs that let apps show relevant ads without sending your individual browsing history to advertisers.",
  details: [
    "View and remove specific ad Topics inferred from your app usage",
    "Turn off Topics, Attribution, or Ad measurement APIs individually",
    "See which apps have recently accessed Privacy Sandbox APIs",
    "Reset your advertising ID separately from these controls",
  ],
  important: "Privacy Sandbox is designed to keep raw browsing and app-usage data on the device rather than sharing it directly with advertisers, but it still uses that data locally to select ad categories.",
  redirectUrl: "https://support.google.com/android",
  whyItMatters:
    "Privacy Sandbox represents a shift in how Android handles ad personalization, moving computation on-device instead of sending detailed usage data to ad networks, but it's still worth understanding and controlling since it's on by default for many users. Reviewing your inferred ad Topics can be genuinely surprising, showing categories inferred from apps you may not have realized reveal that much about your interests. Turning these off doesn't reduce the number of ads you see, only how targeted they are.",
  bestPractices: [
    "Periodically review your inferred Topics list and remove any that feel too revealing or simply inaccurate.",
    "Turn off Topics entirely if you'd rather see generic ads than personalized ones.",
    "Reset your advertising ID alongside disabling Topics for a more complete personalization reset.",
  ],
  commonIssues: [
    { issue: "Ads still feel personalized after turning off Topics.", fix: "Some apps use their own tracking or account-based personalization independent of Android's Privacy Sandbox controls." },
    { issue: "Topics list keeps regenerating after being cleared.", fix: "This is expected; Topics regenerate based on ongoing app usage unless the feature is disabled entirely." },
  ],
  faqs: [
    { q: "Does disabling this block all ads?", a: "No, it only reduces personalization; ads still display, just less tailored to your inferred interests." },
    { q: "Is my raw browsing history sent to advertisers?", a: "The design intent is to keep detailed data on-device, sharing only broad inferred categories rather than raw history." },
  ],
  tipsAndTricks: [
    "Check the 'App Functions' section to see exactly which installed apps have queried the Privacy Sandbox APIs recently.",
  ],
  relatedSettingIds: ["android-privacy-dashboard", "android-app-permissions", "android-location"],
  afterImageContent: {
    heading: "How Privacy Sandbox Works",
    paragraphs: [
      "Instead of individual apps tracking you across the web and other apps, Privacy Sandbox computes broad interest categories locally on the device.",
      "Advertisers query these categories through defined APIs rather than receiving raw usage logs.",
    ],
    steps: [
      "Open Settings → Privacy → Privacy Sandbox (Ads)",
      "Review your current Topics list",
      "Toggle off Topics, Attribution, or Measurement individually as desired",
      "Optionally reset your advertising ID from the same section",
    ],
  },
},
];
