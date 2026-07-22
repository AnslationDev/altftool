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
];
