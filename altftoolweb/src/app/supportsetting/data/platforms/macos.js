import {
  CloudDownload,
  Clock,
  Lock,
  EyeOff,
  Wifi,
  BluetoothIcon,
  Monitor,
  Bell,
  Cloud,
  Accessibility,
  RotateCcw,
  Moon,
  PanelBottom,
  PanelTop,
  Image,
  LockKeyhole,
  LayoutGrid,
  Touchpad,
  Mouse,
  Keyboard,
  Printer,
  Network,
  AppWindow,
  Puzzle,
  Search,
  ShieldCheck,
  KeyRound,
  Languages,
  CalendarClock,
  Share2,
  ScreenShare,
  LifeBuoy,
  ShieldAlert,
  Info,
  HardDrive,
  Activity,
  Barcode,
  FileText,
  Fingerprint,
  FlaskConical,
  History,
  Mail,
  Mic,
  RefreshCw,
  Sparkles,
  Users,
  UsersRound,
  Volume2,
  ZoomIn,
  BatteryFull,
  Cable,
  Camera,
  Captions,
  Cast,
  Contrast,
  Cpu,
  Disc,
  Ear,
  Gamepad2,
  Hourglass,
  MapPin,
  Megaphone,
  MousePointer2,
  Move,
  Palette,
  Smartphone,
  Sun,
  Sunset,
  Terminal,
  ToggleLeft,
  Wallet,
  Zap,
} from "lucide-react";

// macOS Support Settings. These are new entries (macOS had no coverage
// before). Per the agreed approach, they skip hotlinked screenshots (which
// can't be verified for macOS) and instead link out to a real, verified
// official Apple support article for each topic — every URL below was
// checked live via WebFetch before being included.
export const macosSettings = [
  {
    id: "macos-software-update",
    title: "Software Update",
    icon: CloudDownload,
    platform: "macos",
    category: "system-updates",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Update macOS on Your Mac",
    description:
      "Software Update in System Settings keeps macOS current with the latest security fixes, features, and app compatibility improvements. Regular updates help keep your Mac fast, stable, and protected.",
    details: [
      "macOS checks for updates automatically, or you can check manually anytime.",
      "Security responses can install in the background without a restart.",
      "Major macOS version upgrades are optional and can be scheduled for a convenient time.",
      "Automatic update options can be fine-tuned individually (security responses, app updates, macOS updates).",
    ],
    important:
      "Postponing macOS updates for a long time can leave known security issues unpatched. Install updates soon after they're offered.",
    redirectUrl: "https://support.apple.com/en-us/108382",
    afterImageContent: {
      heading: "How Software Update Works on Mac",
      paragraphs: [
        "System Settings periodically checks Apple's servers for available updates in the background.",
        "You can review what each update contains before installing it.",
        "Some updates require a restart to finish installing.",
      ],
      steps: [
        "Open System Settings → General → Software Update.",
        "Wait for macOS to check for updates, or click 'Check Now'.",
        "Review the update details and click 'Update Now' or 'Upgrade Now'.",
        "Restart your Mac if prompted.",
      ],
    },
    whyItMatters:
      "Software updates patch security vulnerabilities that attackers actively exploit, so a Mac running old software becomes a bigger target the longer it goes unpatched. Updates also fix bugs that cause crashes, battery drain, and app incompatibilities, and they're required to keep using new features in apps like Safari and Messages. Because Apple ties many security fixes to specific macOS versions, staying current is one of the single highest-impact things you can do to protect your Mac.",
    bestPractices: [
      "Turn on automatic installation for security responses and system files so critical patches land without waiting on you.",
      "Check for updates manually once a week rather than relying solely on background checks.",
      "Read the release notes before installing a major macOS upgrade, since new versions can change default settings or drop support for older apps.",
      "Back up with Time Machine before installing a major version upgrade (e.g., moving from Sonoma to Sequoia).",
      "Install security updates within a few days of release rather than deferring them indefinitely.",
    ],
    commonIssues: [
      {
        issue: "Update stalls at 'Preparing Update' or gets stuck downloading.",
        fix: "Restart the Mac, ensure at least 20GB of free storage, and retry from System Settings → General → Software Update.",
      },
      {
        issue: "Mac reports 'Your Mac is up to date' even though a new macOS version exists.",
        fix: "Some major upgrades roll out gradually to different device models; check again in a few days or download the update directly from the App Store.",
      },
      {
        issue: "A software update breaks a third-party app or driver.",
        fix: "Check the developer's site for a compatibility update, or hold off on major upgrades until third-party apps confirm support.",
      },
    ],
    faqs: [
      {
        q: "Will updating macOS delete my files?",
        a: "No, standard software updates don't erase user data, but you should still keep a current Time Machine backup before any major version upgrade as a safety net.",
      },
      {
        q: "Can I stop macOS from installing updates automatically?",
        a: "Yes — in System Settings → General → Software Update, click the info button next to automatic updates and turn off the individual options you don't want automated.",
      },
      {
        q: "What's the difference between a security response and a full macOS update?",
        a: "Security responses (labeled like 'macOS Sequoia 15.1 (a)') patch urgent vulnerabilities quickly without bundling new features, while full updates include broader fixes and sometimes new capabilities.",
      },
    ],
    tipsAndTricks: [
      "Hold Option while clicking the Apple menu to reveal 'System Information' for checking exactly which build number you're running after an update.",
      "Use `softwareupdate -l` in Terminal to list available updates without opening System Settings.",
      "Schedule major upgrades for a time you won't need the Mac for an hour or more, since the first boot after a major upgrade can take longer to finish indexing and optimizing apps.",
    ],
    relatedSettingIds: [
      "macos-time-machine-backup",
      "macos-filevault-encryption",
      "macos-erase-reset-mac",
      "macos-wifi",
    ],
    updateFrequency:
      "Check weekly; install security updates within a few days of release, and major upgrades within a few weeks once they've proven stable.",
  },
  {
    id: "macos-time-machine-backup",
    title: "Time Machine Backup",
    icon: Clock,
    platform: "macos",
    category: "storage-backup-data",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Back Up Your Mac with Time Machine",
    description:
      "Time Machine automatically backs up your entire Mac — apps, accounts, preferences, and files — to an external or network drive, so you can restore individual files or your whole system if something goes wrong.",
    details: [
      "Time Machine keeps hourly backups for the past 24 hours, daily backups for the past month, and weekly backups older than that.",
      "You can browse and restore previous versions of a file directly from Finder.",
      "A dedicated external drive is recommended and can be encrypted for extra security.",
      "Time Machine can also back up to a supported network-attached storage device.",
    ],
    important:
      "Time Machine only protects files while the backup drive is connected — keep it plugged in regularly, or use a network backup location for automatic coverage.",
    redirectUrl: "https://support.apple.com/en-us/104984",
    afterImageContent: {
      heading: "Setting Up Time Machine",
      paragraphs: [
        "The first backup includes everything on your Mac and can take a while depending on how much data you have.",
        "After the first backup, Time Machine only backs up files that have changed, making later backups much faster.",
        "You can exclude specific folders from being backed up if you want to save space.",
      ],
      steps: [
        "Connect an external drive or set up a network backup destination.",
        "Open System Settings → General → Time Machine.",
        "Click 'Add Backup Disk' and select your drive.",
        "Turn on 'Back Up Automatically' for continuous protection.",
      ],
    },
    whyItMatters:
      "A backup is the only real defense against drive failure, ransomware, accidental deletion, or a spilled coffee — without one, losing your Mac means losing everything on it. Time Machine's versioned backups also let you recover an earlier draft of a document or undo a mistake from days or weeks ago, not just restore after total loss. It's especially critical to have a current backup before any major software update or hardware repair.",
    bestPractices: [
      "Dedicate an external drive solely to Time Machine rather than sharing it with other files.",
      "Encrypt the backup drive so your backed-up data gets the same protection FileVault gives your internal disk.",
      "Keep the backup drive connected on a regular schedule (daily is ideal) rather than only occasionally.",
      "Periodically test a restore of a single file to confirm the backup is actually working.",
      "Add a second, off-site backup (like a cloud service) in addition to Time Machine as protection against theft or fire.",
    ],
    commonIssues: [
      {
        issue: "Time Machine reports the backup disk is full.",
        fix: "Time Machine automatically deletes its oldest backups to make room; if it can't keep up, use a larger drive or exclude large folders you don't need backed up.",
      },
      {
        issue: "Backups are taking a very long time or seem stuck.",
        fix: "The first backup can take hours depending on data size; later backups are incremental and much faster — check the Time Machine menu bar icon for live progress.",
      },
      {
        issue: "'Time Machine could not complete the backup' error keeps appearing.",
        fix: "Verify the drive is properly connected and not asleep, run Disk Utility's First Aid on the backup disk, or reformat and start a fresh backup if corruption persists.",
      },
    ],
    faqs: [
      {
        q: "Can I use the same external drive for Time Machine and regular file storage?",
        a: "It's not recommended — Time Machine works best with a drive dedicated entirely to backups, since it manages the disk space automatically and mixing files can cause confusion or space issues.",
      },
      {
        q: "How do I restore just one file instead of my whole Mac?",
        a: "Open Time Machine from the menu bar or Launchpad, navigate to the folder containing the file, and use the timeline on the right to browse back to the version you need.",
      },
      {
        q: "Does Time Machine back up to iCloud?",
        a: "No, Time Machine requires a local external drive or a network destination like a NAS — iCloud Drive is a separate, always-on sync service, not a Time Machine backup destination.",
      },
    ],
    tipsAndTricks: [
      "Hold Option and click the Time Machine menu bar icon to reveal a hidden 'Browse Other Backup Disks' option for checking backups on additional drives.",
      "Use Migration Assistant with a Time Machine backup to move everything to a brand-new Mac in one step.",
      "Exclude large, easily re-downloadable folders (like a big Downloads or games folder) in Time Machine's Options to speed up backups and save disk space.",
    ],
    relatedSettingIds: [
      "macos-filevault-encryption",
      "macos-apple-id-icloud",
      "macos-erase-reset-mac",
      "macos-software-update",
    ],
    updateFrequency:
      "Leave 'Back Up Automatically' on for continuous hourly backups, and verify the drive is connecting and backing up successfully at least once a week.",
  },
  {
    id: "macos-filevault-encryption",
    title: "FileVault Disk Encryption",
    icon: Lock,
    platform: "macos",
    category: "privacy-permissions",
    recommended: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Protect Your Mac with FileVault",
    description:
      "FileVault encrypts the entire startup disk on your Mac, so your data stays protected even if the device is lost or stolen. Only someone with your password or recovery key can unlock and read the disk.",
    details: [
      "Encryption happens in the background and you can keep using your Mac while it completes.",
      "You can unlock your disk with your login password, or an iCloud account, or a recovery key you store safely.",
      "Losing both your password and recovery key means your data cannot be recovered.",
      "FileVault is available for both Intel and Apple silicon Macs.",
    ],
    important:
      "Store your FileVault recovery key somewhere safe and separate from your Mac — without it (or your password), encrypted data is permanently inaccessible.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/protect-data-on-your-mac-with-filevault-mh11785/mac",
    afterImageContent: {
      heading: "Turning On FileVault",
      paragraphs: [
        "FileVault is off by default on most Macs and needs to be turned on manually.",
        "You choose how to store your recovery key: with your Apple Account or as a local recovery key you save yourself.",
        "Once enabled, new files are encrypted automatically as they're written to disk.",
      ],
      steps: [
        "Open System Settings → Privacy & Security → FileVault.",
        "Click 'Turn On' next to FileVault.",
        "Choose how to store your recovery key.",
        "Restart your Mac to begin encryption.",
      ],
    },
    whyItMatters:
      "Without FileVault, anyone who gets physical access to your Mac's drive — after theft or loss — can pull files directly off it by booting from another disk, bypassing your login password entirely. FileVault makes the entire disk unreadable without the correct credentials, which is especially important on laptops that travel with you. It's a one-time setup that runs quietly in the background, so there's little reason not to have it on.",
    bestPractices: [
      "Turn on FileVault as soon as you set up a new Mac, before you accumulate sensitive data.",
      "Store your recovery key in a password manager or a secure physical location, never in an unencrypted note on the same Mac.",
      "Link FileVault recovery to your Apple Account so Apple can help you regain access if you lose your password.",
      "Avoid disabling FileVault for performance reasons — modern Macs handle encryption with negligible slowdown.",
    ],
    commonIssues: [
      {
        issue: "Forgot both the login password and the recovery key.",
        fix: "Without either credential, FileVault-encrypted data is permanently unrecoverable — this is exactly why storing the recovery key safely up front matters, since there's no bypass that preserves the data.",
      },
      {
        issue: "Encryption seems to be taking a very long time.",
        fix: "Initial encryption runs in the background and can take several hours on drives with lots of data; you can keep using the Mac normally while progress is shown in Privacy & Security → FileVault.",
      },
      {
        issue: "A second user on the Mac can't unlock the disk at startup.",
        fix: "Add every user account that needs to log in through Privacy & Security → FileVault's 'Enable users' option, since only enabled users can unlock an encrypted disk at boot.",
      },
    ],
    faqs: [
      {
        q: "Does FileVault slow down my Mac?",
        a: "On any Mac with an Apple silicon chip or a recent SSD, the performance impact is essentially unnoticeable because encryption is handled by dedicated hardware.",
      },
      {
        q: "What happens if I lose my recovery key?",
        a: "If you still know your login password you're fine, but if you lose both your password and recovery key, the encrypted data cannot be recovered by Apple or anyone else.",
      },
      {
        q: "Is FileVault the same as my login screen password?",
        a: "No — your login password unlocks your user account, while FileVault encrypts the entire disk at a lower level so the data stays unreadable without the password or recovery key even if the drive is removed.",
      },
    ],
    tipsAndTricks: [
      "Check FileVault's current encryption progress anytime via Privacy & Security → FileVault, which shows a percentage while the initial pass is running.",
      "Use `fdesetup status` in Terminal for a quick command-line check of FileVault's on/off state.",
      "If your recovery key is stored with your Apple Account, you can retrieve it later at iforgot.apple.com if you're locked out but remember your Apple Account password.",
    ],
    relatedSettingIds: [
      "macos-time-machine-backup",
      "macos-apple-id-icloud",
      "macos-camera-mic-privacy",
      "macos-erase-reset-mac",
    ],
  },
  {
    id: "macos-camera-mic-privacy",
    title: "Camera & Microphone Privacy",
    icon: EyeOff,
    platform: "macos",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Control Camera & Microphone Access on Mac",
    description:
      "Privacy & Security settings let you review and control exactly which apps are allowed to use your Mac's camera and microphone, so you always know what has access to audio and video.",
    details: [
      "A green dot in the menu bar indicates the camera is currently in use.",
      "An orange dot indicates the microphone is currently in use.",
      "You can revoke an app's access at any time without uninstalling it.",
      "Some apps will prompt for permission the first time they need camera or microphone access.",
    ],
    important:
      "Revoking camera or microphone access from a video-calling or recording app will prevent it from working until access is restored.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/change-privacy-security-settings-on-mac-mchl211c911f/mac",
    afterImageContent: {
      heading: "Reviewing App Access",
      paragraphs: [
        "macOS keeps a per-app list for both camera and microphone permissions.",
        "You can toggle access for each app individually from the same settings pane.",
        "If an app misbehaves with your camera or mic, this is the first place to check.",
      ],
      steps: [
        "Open System Settings → Privacy & Security → Camera (or Microphone).",
        "Review the list of apps that have requested access.",
        "Toggle access on or off for each app as needed.",
      ],
    },
    whyItMatters:
      "Apps with unchecked camera or microphone access can potentially capture audio or video without you realizing it, so reviewing these permissions is a direct defense against snooping software and misconfigured apps. The menu bar indicator dots give you real-time confirmation of exactly when either is active, which helps you catch an app using them unexpectedly. This matters most on a Mac you use for video calls, since it's easy for an old app to retain access long after you stopped using it for that purpose.",
    bestPractices: [
      "Periodically review the full list of apps with camera and microphone access and revoke it from anything you no longer use.",
      "Investigate immediately if the green camera or orange microphone indicator lights up when you haven't opened a calling app.",
      "Grant access only when an app first prompts for it, rather than pre-approving apps manually.",
      "Be cautious granting camera or microphone access to browser extensions or lesser-known apps.",
    ],
    commonIssues: [
      {
        issue: "An app's camera or microphone toggle is greyed out and can't be changed.",
        fix: "Quit the app completely first — macOS locks the toggle while the app is actively using the camera or mic — then adjust the permission and relaunch the app.",
      },
      {
        issue: "A video call app suddenly can't access the camera after a macOS update.",
        fix: "Reopen Privacy & Security → Camera and confirm the app's toggle is still on, since major updates occasionally reset third-party app permissions.",
      },
      {
        issue: "The green camera indicator stays on after closing a video app.",
        fix: "Check Activity Monitor for a lingering background helper process still using the camera and force-quit it, since the dot only clears once every camera-using process ends.",
      },
    ],
    faqs: [
      {
        q: "What does it mean if I see a green dot but no app is open?",
        a: "It means some process still has an active camera session running, often a background helper for a browser or calling app; click the dot to see which app is responsible.",
      },
      {
        q: "Can I disable my camera entirely at the system level?",
        a: "There's no single system-wide camera kill switch, but removing every app's access in Privacy & Security → Camera effectively blocks all software from using it.",
      },
      {
        q: "Do websites need separate permission from apps?",
        a: "Yes — Safari and other browsers manage their own camera/microphone permissions per website in addition to the system-level app permissions in Privacy & Security.",
      },
    ],
    tipsAndTricks: [
      "Click the green or orange menu bar dot directly to see exactly which app is currently using your camera or microphone.",
      "Use Terminal's `log show` with a camera predicate for a deeper audit of past access if something seems off.",
      "Safari's per-site camera/microphone permissions live in Safari → Settings → Websites, separate from the system-wide app list.",
    ],
    relatedSettingIds: [
      "macos-filevault-encryption",
      "macos-accessibility",
      "macos-sound-notifications",
    ],
  },
  {
    id: "macos-wifi",
    title: "Wi-Fi Connection",
    icon: Wifi,
    platform: "macos",
    category: "connectivity-network",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Connect Your Mac to Wi-Fi",
    description:
      "Wi-Fi settings let you join, manage, and prioritize wireless networks on your Mac, including hidden networks and networks that require a captive-portal sign-in.",
    details: [
      "Click the Wi-Fi icon in the menu bar to see and join nearby networks quickly.",
      "Known networks are remembered and rejoined automatically when in range.",
      "You can manually add a hidden network by entering its exact name and security type.",
      "Network preferences let you reorder which known network is preferred when multiple are in range.",
    ],
    important:
      "Avoid signing in to sensitive accounts on public or unsecured Wi-Fi networks.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/connect-your-mac-to-the-internet-using-wi-fi-mchlp1180/mac",
    afterImageContent: {
      heading: "Managing Wi-Fi Networks",
      paragraphs: [
        "System Settings shows signal strength and security type for every nearby network.",
        "Forgetting a network removes its saved password, so you'll need to re-enter it to reconnect.",
        "Advanced options let you configure IP, DNS, and proxy settings per network.",
      ],
      steps: [
        "Open System Settings → Wi-Fi (or click the menu bar icon).",
        "Select a network from the list and enter its password.",
        "Turn on 'Auto-Join' so your Mac reconnects automatically next time.",
      ],
    },
    whyItMatters:
      "Wi-Fi is how most Macs get online, so a flaky or misconfigured connection affects everything from web browsing to iCloud sync and software updates. Knowing how to manage known networks, forget bad ones, and configure advanced settings like DNS helps you fix connectivity problems yourself instead of guessing. It's also the setting most directly tied to security risk, since joining the wrong network can expose your traffic to snooping.",
    bestPractices: [
      "Forget old or public networks you no longer use so your Mac doesn't attempt to auto-join them later.",
      "Avoid entering passwords or accessing sensitive accounts on open, unsecured Wi-Fi networks.",
      "Reorder preferred networks so your most trusted network (like home) takes priority when multiple are in range.",
      "Use a VPN when connecting to Wi-Fi you don't control, such as at a hotel or airport.",
    ],
    commonIssues: [
      {
        issue: "Mac won't join a network it used to connect to automatically.",
        fix: "Select the network, choose 'Forget This Network,' then rejoin and re-enter the password — this clears a corrupted saved credential.",
      },
      {
        issue: "Wi-Fi shows connected but there's no internet access.",
        fix: "Test another device on the same router, then toggle Wi-Fi off and back on, or renew the DHCP lease from the network's advanced TCP/IP tab.",
      },
      {
        issue: "Mac can't see or join a hidden network.",
        fix: "Manually add the network using its exact, case-sensitive name and correct security type via Wi-Fi → Other Networks, since hidden networks don't broadcast and won't appear in the standard list.",
      },
    ],
    faqs: [
      {
        q: "Why does my Mac keep switching to a weaker Wi-Fi network?",
        a: "macOS can prefer a network based on saved priority order rather than signal strength alone; reorder your preferred networks list in Wi-Fi's advanced options to fix this.",
      },
      {
        q: "How do I see my Wi-Fi password on Mac?",
        a: "Open Keychain Access, find the network under the 'System' or 'login' keychain, and check 'Show password' after authenticating — this only works for networks your Mac has previously joined.",
      },
      {
        q: "Is public Wi-Fi at cafes safe to use on my Mac?",
        a: "It carries some risk since traffic on open networks can potentially be intercepted; using a VPN and avoiding sensitive logins is the safer approach.",
      },
    ],
    tipsAndTricks: [
      "Option-click the Wi-Fi menu bar icon to reveal detailed diagnostic info like the exact channel, signal strength (RSSI), and transmit rate.",
      "Use Wireless Diagnostics (hold Option and click the Wi-Fi icon, then choose 'Open Wireless Diagnostics') for a guided troubleshooting assistant.",
      "Keychain Access lets you view or export saved Wi-Fi passwords for networks you've previously joined, handy when setting up a new device.",
    ],
    relatedSettingIds: [
      "macos-bluetooth",
      "macos-apple-id-icloud",
      "macos-software-update",
    ],
  },
  {
    id: "macos-bluetooth",
    title: "Bluetooth Devices",
    icon: BluetoothIcon,
    platform: "macos",
    category: "connectivity-network",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Connect Bluetooth Accessories to Mac",
    description:
      "Bluetooth settings let you pair and manage wireless accessories such as keyboards, trackpads, mice, headphones, and speakers with your Mac.",
    details: [
      "Put your accessory into pairing mode before searching for it on your Mac.",
      "Paired devices reconnect automatically when powered on and in range.",
      "You can rename, disconnect, or forget a paired device at any time.",
      "Battery levels for supported accessories are shown right in the Bluetooth menu.",
    ],
    important:
      "If a device fails to pair, try removing it from the list and pairing again from scratch — this resolves most stuck connections.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/connect-a-wireless-accessory-blth1004/mac",
    afterImageContent: {
      heading: "Pairing a New Device",
      paragraphs: [
        "macOS scans for nearby discoverable Bluetooth accessories automatically once Bluetooth is turned on.",
        "Some accessories (like Apple's own) pair almost instantly thanks to deeper system integration.",
        "Audio devices can be set as the default output right from the Bluetooth menu.",
      ],
      steps: [
        "Open System Settings → Bluetooth.",
        "Turn on Bluetooth if it isn't already.",
        "Put your accessory in pairing mode and select it from the list.",
        "Wait for 'Connected' to appear next to the device name.",
      ],
    },
    whyItMatters:
      "Bluetooth is how most people connect wireless keyboards, trackpads, AirPods, and speakers to a Mac, so a shaky pairing directly affects daily usability. Understanding how to forget and re-pair a device resolves the vast majority of Bluetooth glitches, which tend to recur if you only try reconnecting rather than starting fresh. Battery-level visibility for paired accessories also helps you avoid a device dying mid-use.",
    bestPractices: [
      "Remove ('forget') a device entirely and re-pair it from scratch at the first sign of a persistent connection issue, rather than repeatedly reconnecting.",
      "Keep Bluetooth accessory firmware and your Mac's software both up to date, since mismatched versions cause dropouts.",
      "Manually set your preferred audio accessory as the default output if macOS keeps switching outputs unexpectedly.",
      "Turn Bluetooth off when you're not using any wireless accessories to save a bit of battery and reduce interference.",
    ],
    commonIssues: [
      {
        issue: "A Bluetooth device connects but audio or input is choppy.",
        fix: "Move closer to the Mac to rule out interference, turn Wi-Fi off briefly to test for 2.4GHz conflicts, and forget/re-pair the device if the issue persists.",
      },
      {
        issue: "Device shows as paired but won't actually connect.",
        fix: "Remove the device from the Bluetooth list, restart the Mac, put the accessory back into pairing mode, and pair it again as new.",
      },
      {
        issue: "AirPods or headphones keep switching automatically between multiple Apple devices.",
        fix: "Turn off Bluetooth on the devices you're not currently using, or disable automatic device switching in the accessory's own companion settings if available.",
      },
    ],
    faqs: [
      {
        q: "Why won't my Bluetooth mouse or keyboard show up in the list?",
        a: "Make sure it's actually in pairing/discoverable mode (often a dedicated button or switch) and that its batteries have enough charge, since low-battery accessories often fail to broadcast.",
      },
      {
        q: "Can I use a Bluetooth keyboard before macOS fully starts up?",
        a: "Apple's own Bluetooth keyboards can be used at the login screen and in some pre-boot situations, but non-Apple Bluetooth keyboards generally need macOS to boot first.",
      },
      {
        q: "Does leaving Bluetooth on all the time drain battery?",
        a: "The impact is small on modern Macs, though actively connected accessories (especially audio) draw more power than Bluetooth sitting idle.",
      },
    ],
    tipsAndTricks: [
      "Hold Option and click the Bluetooth menu bar icon for extra diagnostic details about connected devices.",
      "Use the Bluetooth menu bar icon to quickly switch audio output devices without opening System Settings at all.",
      "Battery percentages for supported accessories (AirPods, Magic Keyboard, Magic Mouse) appear directly in the Bluetooth menu bar dropdown.",
    ],
    relatedSettingIds: [
      "macos-wifi",
      "macos-sound-notifications",
      "macos-displays",
    ],
  },
  {
    id: "macos-displays",
    title: "Displays Settings",
    icon: Monitor,
    platform: "macos",
    category: "display-sound-notifications",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Adjust Display Settings on Mac",
    description:
      "Displays settings let you change resolution, brightness, arrangement of multiple monitors, and features like Night Shift and True Tone for more comfortable viewing.",
    details: [
      "Choose 'Default' or a specific scaled resolution for sharper text or more screen space.",
      "Drag displays in the Arrangement view to match your physical desk setup.",
      "Night Shift automatically shifts colors warmer in the evening to reduce eye strain.",
      "External displays can be configured individually when multiple are connected.",
    ],
    important:
      "Using a non-native resolution on an external display can make text look blurry — 'Default for display' usually looks best.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/displays-settings-on-mac-mh40768/mac",
    afterImageContent: {
      heading: "Configuring Multiple Displays",
      paragraphs: [
        "macOS automatically detects connected displays and suggests recommended settings.",
        "You can mirror displays or extend your desktop across them.",
        "Night Shift and True Tone settings can be scheduled or toggled per display.",
      ],
      steps: [
        "Open System Settings → Displays.",
        "Select the display you want to adjust from the layout at the top.",
        "Change resolution, brightness, or Night Shift settings.",
        "Drag display icons to match your physical arrangement.",
      ],
    },
    whyItMatters:
      "Getting resolution and arrangement right directly affects daily comfort — text that's too small or blurry, or a second monitor arranged incorrectly, makes everyday work more tiring than it needs to be. Night Shift and True Tone settings can meaningfully reduce eye strain during long sessions, especially at night. Multi-display setups are common for Mac users, and mismatched configuration is one of the most frequent sources of frustration when adding an external monitor.",
    bestPractices: [
      "Use 'Default for display' resolution on external monitors rather than a custom scaled option, unless you specifically need more screen space.",
      "Drag display icons in the Arrangement pane to physically match your desk layout, so cursor movement between screens feels natural.",
      "Turn on Night Shift for evening use to reduce blue light and ease eye strain before bed.",
      "Set the menu bar to appear only on one display if using multiple monitors and finding it distracting on all of them.",
    ],
    commonIssues: [
      {
        issue: "External monitor text looks blurry or fuzzy.",
        fix: "Switch to the display's native resolution under 'Default for display' rather than a manually scaled 'More Space' option, since scaling non-native resolutions causes softness.",
      },
      {
        issue: "Mac doesn't detect a connected external display.",
        fix: "Check the cable and port (especially with adapters or hubs), then hold Option while clicking 'Detect Displays' in Displays settings to force a rescan.",
      },
      {
        issue: "Display arrangement keeps resetting after sleep or reconnecting a monitor.",
        fix: "Re-drag the displays into the correct arrangement, and check for a firmware or driver update for the monitor or dock, since flaky USB-C hubs are a common cause.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between mirroring and extending displays?",
        a: "Mirroring shows the same content on every display, while extending gives you separate desktop space on each display for more room to work — both are toggled in Displays settings.",
      },
      {
        q: "Why does Night Shift not seem to be doing anything?",
        a: "Check that a schedule is actually enabled, or manually turn it on for the rest of the day, and confirm your Mac's clock and location settings are correct, since Night Shift's schedule relies on them.",
      },
      {
        q: "Can I set different resolutions for each of my displays?",
        a: "Yes, Displays settings lets you select and adjust each connected display independently by clicking on it in the layout at the top of the pane.",
      },
    ],
    tipsAndTricks: [
      "Hold Option while clicking 'Detect Displays' to reveal additional resolution options that aren't shown by default.",
      "Use Mission Control settings to control whether each display has its own set of Spaces, which changes how app windows behave across monitors.",
      "True Tone can be toggled quickly from Control Center without diving into Displays settings each time.",
    ],
    relatedSettingIds: [
      "macos-sound-notifications",
      "macos-bluetooth",
      "macos-accessibility",
    ],
  },
  {
    id: "macos-sound-notifications",
    title: "Sound & Notifications",
    icon: Bell,
    platform: "macos",
    category: "display-sound-notifications",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Sound, Notifications & Focus on Mac",
    description:
      "Sound settings control input/output devices and alert volume, while Notifications & Focus let you decide which apps can interrupt you and when — including scheduled Focus modes like Work or Sleep.",
    details: [
      "Choose separate devices for sound output and input (microphone).",
      "Set per-app notification styles: banners, alerts, or none.",
      "Focus modes can silence notifications during specific hours or activities and sync across your Apple devices.",
      "Allowed-apps and allowed-people lists let priority notifications through even during Focus.",
    ],
    important:
      "Turning off notifications for system or security apps may cause you to miss important alerts, such as backup failures.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/notifications-settings-mh40583/mac",
    afterImageContent: {
      heading: "How Notifications & Focus Work Together",
      paragraphs: [
        "Notification Center groups alerts by app so you can review anything you missed.",
        "Focus settings you configure on one Apple device can sync to your others via iCloud.",
        "You can preview a Focus mode before turning it on to see exactly what will be silenced.",
      ],
      steps: [
        "Open System Settings → Notifications (or Focus).",
        "Select an app to customize its notification style, or create a new Focus.",
        "Choose allowed people and apps for that Focus.",
        "Turn the Focus on manually or schedule it automatically.",
      ],
    },
    whyItMatters:
      "Notifications and Focus modes determine how often your Mac interrupts you, which has a real effect on concentration and productivity during focused work. Getting sound input/output right is equally practical — the wrong microphone selected can silently ruin a video call. Because Focus modes sync across your Apple devices, a setting adjusted here can affect how your iPhone and iPad behave too, so it's worth understanding fully.",
    bestPractices: [
      "Set banners (not alerts) for most apps so notifications don't require dismissal and interrupt your flow less.",
      "Create a dedicated Focus mode for deep work that silences everything except calls from a short allowed-people list.",
      "Double-check the selected microphone and output device before important calls, since macOS sometimes defaults to a different connected device.",
      "Keep notifications enabled for essential system and security apps (like backup or storage warnings) even if you mute most others.",
    ],
    commonIssues: [
      {
        issue: "Notifications aren't showing up for an app at all.",
        fix: "Check System Settings → Notifications for that app and confirm 'Allow Notifications' is on and that an active Focus mode isn't silencing it.",
      },
      {
        issue: "Wrong microphone or speaker gets selected automatically when a Bluetooth device connects.",
        fix: "Manually reselect the correct input/output device in Sound settings, or in the Sound menu bar item if enabled, right before starting a call.",
      },
      {
        issue: "Focus mode doesn't sync between Mac and iPhone.",
        fix: "Confirm both devices are signed into the same Apple Account with 'Share across devices' enabled in Focus settings, and that Wi-Fi and Bluetooth are on for both.",
      },
    ],
    faqs: [
      {
        q: "How do I let a specific person's calls through during Focus?",
        a: "Edit your Focus mode's allowed people list in System Settings → Focus and add their contact so calls or messages from them break through silently.",
      },
      {
        q: "Can I schedule a Focus mode to turn on automatically?",
        a: "Yes, each Focus mode supports a time-based schedule or can trigger based on a specific app or location, configurable within its settings.",
      },
      {
        q: "Why is there no Sound icon in my menu bar?",
        a: "Enable it under Control Center settings by turning on 'Show in Menu Bar' for Sound, giving you quick access to output/input switching without opening System Settings.",
      },
    ],
    tipsAndTricks: [
      "Add the Sound menu bar icon via Control Center settings for one-click switching between audio devices.",
      "Use 'Time Sensitive' notification behavior on specific apps so they can break through Focus when truly urgent, without allowing all their notifications through otherwise.",
      "Change Notification Center's grouping option to 'Automatic' or 'Off' if you prefer notifications listed strictly by time instead of 'By App'.",
    ],
    relatedSettingIds: [
      "macos-displays",
      "macos-bluetooth",
      "macos-accessibility",
    ],
  },
  {
    id: "macos-apple-id-icloud",
    title: "Apple Account & iCloud Sync",
    icon: Cloud,
    platform: "macos",
    category: "accounts-sync-family",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Apple Account & iCloud Settings",
    description:
      "iCloud settings control which of your apps and data — Photos, Mail, Contacts, Find My Mac, and more — stay in sync across all your Apple devices, plus your iCloud storage plan.",
    details: [
      "Choose exactly which apps sync data through iCloud.",
      "iCloud Drive can optimize local storage by keeping only recently used files on-disk.",
      "Find My Mac helps you locate, lock, or erase your Mac remotely if it's lost.",
      "You can upgrade your iCloud+ storage plan directly from this settings pane.",
    ],
    important:
      "Turning off iCloud sync for an app (like Photos) can remove that app's data locally if 'Optimize storage' is on — review before disabling.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/change-icloud-settings-on-mac-mh36817/mac",
    afterImageContent: {
      heading: "What Syncs Through iCloud",
      paragraphs: [
        "Once signed in with your Apple Account, iCloud can keep Photos, Mail, Contacts, Calendars, Notes, and more in sync automatically.",
        "Family Sharing can be set up from the same Apple Account settings pane.",
        "Storage usage per app is shown so you can see what's taking up your iCloud plan.",
      ],
      steps: [
        "Open System Settings → [Your Name] (Apple Account) → iCloud.",
        "Toggle which apps should sync with iCloud.",
        "Check 'Manage Storage' to see or free up iCloud space.",
      ],
    },
    whyItMatters:
      "Your Apple Account is the hub tying together sync, purchases, Find My, and recovery options across every Apple device you own, so misconfiguring it can mean losing access to apps or data across your whole ecosystem, not just your Mac. iCloud sync is also how documents, photos, and passwords stay consistent between your Mac, iPhone, and iPad, so what's toggled on here directly affects whether your devices feel connected or out of sync. Find My Mac specifically is one of your best chances of recovering a lost or stolen Mac.",
    bestPractices: [
      "Keep Find My Mac turned on at all times so a lost or stolen Mac can be located, locked, or erased remotely.",
      "Enable two-factor authentication on your Apple Account for a major security upgrade with minimal daily friction.",
      "Review 'Manage Storage' periodically so a full iCloud plan doesn't unexpectedly block backups or Photos sync.",
      "Turn on iCloud Keychain to sync saved passwords securely across your devices instead of relying on browser-only password storage.",
    ],
    commonIssues: [
      {
        issue: "iCloud storage is full and Photos or backups stop syncing.",
        fix: "Open Manage Storage to see what's using space, delete unneeded backups or large attachments, or upgrade your iCloud+ plan.",
      },
      {
        issue: "Documents don't appear the same on Mac and iPhone.",
        fix: "Confirm iCloud Drive is enabled on both devices for the specific app, and check network connectivity, since sync pauses without an internet connection.",
      },
      {
        issue: "Signed out of Apple Account unexpectedly.",
        fix: "Sign back in with your Apple Account password and complete two-factor verification; if you don't remember your password, use 'Forgot Apple Account or password' to reset it via iforgot.apple.com.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between iCloud Drive and iCloud backup?",
        a: "iCloud Drive syncs specific files and folders live across devices, while a full backup is a point-in-time snapshot for disaster recovery — Macs rely on Time Machine rather than a full iCloud device backup.",
      },
      {
        q: "Will turning off Photos sync delete my photos?",
        a: "If 'Optimize Mac Storage' was keeping only lower-resolution local copies, turning off sync can leave you without full-resolution originals locally, so make sure originals are downloaded first or keep a separate backup.",
      },
      {
        q: "Can I share iCloud storage with my family?",
        a: "Yes, Family Sharing lets you share a single iCloud+ storage plan among family members, configurable from the same Apple Account settings pane.",
      },
    ],
    tipsAndTricks: [
      "Use 'Find My' on iCloud.com to locate, play a sound on, or remotely lock your Mac from any browser, even if the Mac is offline (it reports the last known location).",
      "iCloud Keychain can generate and autofill strong unique passwords across Safari and supported apps without needing a third-party password manager.",
      "Check exactly which apps are consuming iCloud storage from Manage Storage's per-app breakdown rather than guessing.",
    ],
    relatedSettingIds: [
      "macos-time-machine-backup",
      "macos-filevault-encryption",
      "macos-erase-reset-mac",
    ],
  },
  {
    id: "macos-accessibility",
    title: "Accessibility Settings",
    icon: Accessibility,
    platform: "macos",
    category: "accessibility-language",
    recommended: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Accessibility on Mac",
    description:
      "Accessibility settings on Mac include VoiceOver screen reading, Zoom for magnification, Voice Control, and many vision, hearing, and mobility features to make macOS easier to use.",
    details: [
      "VoiceOver reads screen content aloud and can be controlled entirely by keyboard.",
      "Zoom lets you magnify part or all of the screen with keyboard or trackpad gestures.",
      "Voice Control lets you operate your Mac entirely with spoken commands.",
      "Display accommodations include increased contrast, reduced motion, and color filters.",
    ],
    important:
      "VoiceOver changes how many keyboard shortcuts behave system-wide — review the VoiceOver quick-start tutorial before turning it on for the first time.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/change-accessibility-settings-mchlp1400/mac",
    afterImageContent: {
      heading: "Finding the Right Accessibility Feature",
      paragraphs: [
        "Accessibility settings are grouped by Vision, Hearing, Mobility, and General categories.",
        "Most features can be assigned a keyboard shortcut for quick toggling.",
        "Accessibility Shortcuts (triple-click a button) can be configured for quick access to your most-used features.",
      ],
      steps: [
        "Open System Settings → Accessibility.",
        "Browse categories (Vision, Hearing, Mobility, General).",
        "Turn on the feature you need and adjust its options.",
      ],
    },
    whyItMatters:
      "Accessibility features can be the difference between a Mac being usable or not for people with vision, hearing, or mobility differences, but many of them — like Zoom, larger cursor, or reduced motion — are genuinely useful for anyone in specific situations, such as a bright room or a shared screen during a presentation. Because these settings change fundamental interaction patterns (like how VoiceOver takes over keyboard navigation), understanding them before turning them on avoids confusion. Accessibility Shortcuts also give quick access to your most-used features without digging through menus every time.",
    bestPractices: [
      "Review the VoiceOver Quick Start Tutorial before turning it on for the first time, since it changes how many keyboard shortcuts work system-wide.",
      "Set up Accessibility Shortcuts (triple-click a designated button) for the one or two features you use most, for one-tap access.",
      "Try Reduced Motion and Increase Contrast even without a specific need, since many users find them more comfortable for everyday use.",
      "Assign a keyboard shortcut to Zoom if you frequently need to inspect small text or UI details.",
    ],
    commonIssues: [
      {
        issue: "VoiceOver changes how basic navigation and clicking work, causing confusion.",
        fix: "Use the built-in VoiceOver Quick Start Tutorial (triggered the first time you turn it on) to learn the modified keyboard commands, or turn it off with Command-F5 if it was enabled by accident.",
      },
      {
        issue: "Zoom makes the screen jump around unexpectedly while typing or scrolling.",
        fix: "Adjust Zoom's 'follow' behavior in Accessibility → Zoom settings — the options control whether zoom follows the keyboard focus, mouse, or neither.",
      },
      {
        issue: "Voice Control doesn't recognize commands accurately.",
        fix: "Use 'show numbers' or 'show names' overlay commands for more reliable targeting, and work in a quiet environment, since background noise affects recognition.",
      },
    ],
    faqs: [
      {
        q: "How do I quickly turn VoiceOver on or off without going through settings?",
        a: "Press Command-F5, ask Siri to 'turn VoiceOver on/off', or configure the Accessibility Shortcuts triple-click gesture for instant toggling.",
      },
      {
        q: "Are accessibility features only useful for people with disabilities?",
        a: "No — features like Reduced Motion, Increase Contrast, Larger Text, and Voice Control are commonly used by anyone who finds them more comfortable or convenient in a given moment.",
      },
      {
        q: "Can I set up different accessibility shortcuts for different situations?",
        a: "The triple-click Accessibility Shortcut toggles one chosen set of features; for different combinations you'll need to enable or disable individual features directly in the Accessibility settings pane.",
      },
    ],
    tipsAndTricks: [
      "Press Command-Option-F5 from anywhere, even the login screen, to open the Accessibility Shortcuts panel without navigating System Settings.",
      "Hold a modifier key while pointing at text to trigger Hover Text, which temporarily enlarges any text on screen without turning on full-time Zoom.",
      "Siri can toggle many accessibility features by voice command, useful if you need to enable something like VoiceOver before you can see the screen clearly.",
    ],
    relatedSettingIds: [
      "macos-camera-mic-privacy",
      "macos-sound-notifications",
      "macos-displays",
    ],
  },
  {
    id: "macos-erase-reset-mac",
    title: "Erase & Reset Mac",
    icon: RotateCcw,
    platform: "macos",
    category: "troubleshooting-diagnostics",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Erase Your Mac and Reset to Factory Settings",
    description:
      "Erase All Content and Settings lets you wipe your Mac back to factory defaults — useful for major troubleshooting, or before selling, trading in, or giving away your device.",
    details: [
      "Erase All Content and Settings signs you out of your Apple Account and removes all personal data.",
      "It's recommended to back up your Mac (e.g. with Time Machine) before erasing.",
      "The process is built into System Settings on modern macOS — no bootable installer required.",
      "After erasing, your Mac restarts into Setup Assistant as if it were new.",
    ],
    important:
      "This action cannot be undone. Make sure you have a current backup and know your Apple Account credentials before proceeding.",
    redirectUrl: "https://support.apple.com/en-us/102664",
    afterImageContent: {
      heading: "Before You Erase",
      paragraphs: [
        "Back up any files you want to keep using Time Machine or iCloud.",
        "Sign out of iMessage and other services if prompted, to avoid activation lock issues later.",
        "Have your Apple Account password ready, since erasing will require you to confirm your identity.",
      ],
      steps: [
        "Open System Settings → General → Transfer or Reset.",
        "Click 'Erase All Content and Settings'.",
        "Follow the prompts to confirm your Apple Account and begin erasing.",
        "Your Mac restarts into Setup Assistant once complete.",
      ],
    },
    whyItMatters:
      "Erasing a Mac correctly protects your personal data and Apple Account when selling, trading in, or giving the device away, and doing it wrong can leave your files exposed to the next owner. It's also one of the more effective troubleshooting steps for a Mac with deep, unresolvable software issues, since it returns the machine to a known-clean state. Because the action is irreversible and requires your Apple Account credentials, understanding what happens beforehand avoids being locked out of your own erased Mac.",
    bestPractices: [
      "Back up everything you want to keep with Time Machine or verify iCloud sync is complete before erasing.",
      "Sign out of iMessage and FaceTime manually beforehand to avoid phone number or email association issues on the next device.",
      "Confirm you remember your Apple Account password before starting, since Activation Lock will require it to set up the Mac again.",
      "Stay on a stable power source throughout the erase process, since interrupting it can leave the Mac in an unusable state.",
    ],
    commonIssues: [
      {
        issue: "Forgot to back up before erasing.",
        fix: "If the Mac hasn't been erased yet, stop and back up immediately with Time Machine; if it's already erased, recovery isn't possible without a prior backup, underscoring why backing up first is essential.",
      },
      {
        issue: "New owner is stuck at an Activation Lock screen after receiving the Mac.",
        fix: "The original owner must remove the Mac from their Apple Account devices list (via Find My or Apple Account settings) before Activation Lock will clear for the next user.",
      },
      {
        issue: "Erase process seems frozen or the Mac won't restart afterward.",
        fix: "Stay on stable power and wait it out, since it can take a while; if it truly hangs, force a restart and use macOS Recovery to reinstall macOS from there.",
      },
    ],
    faqs: [
      {
        q: "Do I need a bootable USB installer to erase my Mac?",
        a: "No, on modern macOS 'Erase All Content and Settings' is built directly into System Settings → General → Transfer or Reset, with no external installer required.",
      },
      {
        q: "What happens to my Apple Account after erasing?",
        a: "The erase process signs your Mac out of your Apple Account and removes it from your list of trusted devices, so make sure you know your password to set the Mac up again or to help a new owner past Activation Lock.",
      },
      {
        q: "Is erasing a Mac the same as reinstalling macOS?",
        a: "Not exactly — erasing wipes your data and settings back to factory defaults while keeping the current macOS version installed and ready for Setup Assistant, whereas a reinstall replaces the OS itself.",
      },
    ],
    tipsAndTricks: [
      "Use 'Erase All Content and Settings' instead of the older full reinstall method — it's faster and doesn't require a recovery-mode installer on modern Macs.",
      "Double-check Find My Mac is removed from your device list on iCloud.com after selling a Mac, since a lingering entry can cause Activation Lock problems for the buyer even after a successful local erase.",
      "Erasing is still worthwhile even for a non-functional Mac before donating or recycling it, since data can sometimes be recovered from drives even in broken machines.",
    ],
    relatedSettingIds: [
      "macos-time-machine-backup",
      "macos-apple-id-icloud",
      "macos-filevault-encryption",
      "macos-software-update",
    ],
  },
  {
    id: "macos-focus",
    title: "Focus",
    icon: Moon,
    platform: "macos",
    category: "display-sound-notifications",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Focus on Your Mac",
    description:
      "Focus lets you silence notifications and distractions while you concentrate on a specific task, like work, personal time, or sleep. You can allow only certain people and apps through, and each Focus can turn on automatically on a schedule or when you open a certain app.",
    details: [
      "Built-in Focus options include Do Not Disturb, Personal, Sleep, and Work, and you can create fully custom ones.",
      "Each Focus has its own allowed-people and allowed-apps list, plus optional silenced notification behavior on the Lock Screen.",
      "Focus status can automatically share with people who message you, letting them know you're focusing without revealing details.",
      "A Focus you set up on your Mac can sync across your iPhone, iPad, and Apple Watch through iCloud.",
    ],
    important:
      "Turning on a broad Focus like Do Not Disturb silences virtually everything, including calls, so double check your allowed list before relying on it during an on-call or emergency-availability period.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/set-up-a-focus-to-stay-on-task-mchl613dc43f/mac",
    afterImageContent: {
      heading: "How Focus Filters Notifications",
      paragraphs: [
        "Focus works by checking every incoming notification against the allowed list you've configured for whichever Focus is currently active.",
        "You can attach a Focus to a Home Screen page or specific menu bar item so what you see matches what you're doing.",
        "Focus Filters let compatible apps (like Calendar or Mail) show only relevant content while a specific Focus is on.",
      ],
      steps: [
        "Open System Settings → Focus.",
        "Select an existing Focus or click the + button to create a new one.",
        "Choose which people and apps are allowed to notify you.",
        "Set a schedule, or turn the Focus on manually from Control Center.",
      ],
    },
    whyItMatters:
      "Focus is the main tool for cutting down interruptions on a Mac used for deep work, so a well-configured Focus can be the difference between an hour of uninterrupted writing or coding and a dozen scattered context switches. Because Focus status syncs and can be shared with contacts, it also sets expectations with coworkers or family about when you're reachable. Getting the allowed-people list right matters especially for anyone who needs some interruptions (like a partner or manager) to always get through even during quiet time.",
    bestPractices: [
      "Build a dedicated Work Focus that allows calls or messages from just your manager and closest collaborators.",
      "Turn on 'Share Focus Status' so people know why their message isn't getting an immediate reply, without needing to explain it yourself.",
      "Schedule your Sleep Focus to start automatically each night rather than relying on remembering to turn it on.",
      "Use Focus Filters in supported apps like Calendar and Safari Tab Groups so switching Focus also switches what's on screen.",
    ],
    commonIssues: [
      {
        issue: "An important call didn't ring because Do Not Disturb was on.",
        fix: "Add that contact to your Focus's allowed people list, or enable 'Allow calls from' repeated callers so a second call within three minutes always breaks through.",
      },
      {
        issue: "Focus turned on automatically and won't turn off.",
        fix: "Check whether a schedule or Smart Activation triggered it in System Settings → Focus, and either turn it off manually from Control Center or edit its schedule.",
      },
      {
        issue: "Focus status isn't showing up for people you message.",
        fix: "Confirm 'Share Focus Status Across Devices' is on in Focus settings, and that Messages has permission to share status with that specific contact.",
      },
    ],
    faqs: [
      {
        q: "Does Focus block phone calls too?",
        a: "Yes, unless you specifically allow certain people or turn on repeated-caller override, most Focus modes will silence incoming calls along with notifications.",
      },
      {
        q: "Can I have different Focus settings on my Mac than my iPhone?",
        a: "Yes — turn off 'Share across devices' for a specific Focus if you want its on/off state to stay independent per device.",
      },
      {
        q: "What's the difference between Do Not Disturb and a custom Focus?",
        a: "Do Not Disturb is a broad, built-in Focus that silences almost everything, while a custom Focus lets you fine-tune exactly which apps, people, and Home Screen pages are relevant to that particular activity.",
      },
    ],
    tipsAndTricks: [
      "Add the Focus menu bar item via Control Center settings for one-click switching without opening System Settings.",
      "Use a location- or app-based Smart Activation trigger (like opening Xcode) so a Focus turns on automatically without a fixed schedule.",
    ],
    relatedSettingIds: [
      "macos-sound-notifications",
      "macos-lock-screen",
      "macos-menu-bar-control-center",
    ],
  },
  {
    id: "macos-desktop-dock",
    title: "Desktop & Dock",
    icon: PanelBottom,
    platform: "macos",
    category: "personalization",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize the Dock and Desktop on Mac",
    description:
      "Desktop & Dock settings control the size, position, and behavior of the Dock, along with desktop options like Stage Manager, widgets, and how windows and Mission Control behave. It's the main place to make the Dock and desktop work the way you want.",
    details: [
      "Resize the Dock, move it to the left, bottom, or right edge of the screen, and choose whether it hides automatically.",
      "Turn on 'Magnification' so icons enlarge as your pointer passes over them.",
      "Stage Manager can automatically organize open windows into a strip along the side of the screen.",
      "Choose whether desktop widgets stay visible all the time or only when you click the desktop.",
    ],
    important:
      "Turning on 'Automatically hide and show the Dock' can make it briefly harder to find if you're not used to it — try it for a day before deciding it's not for you.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/change-desktop-dock-settings-mchlp1119/mac",
    afterImageContent: {
      heading: "How Dock and Desktop Settings Fit Together",
      paragraphs: [
        "The Dock section controls size, position, and animation, while separate sections handle the desktop, Stage Manager, widgets, and Mission Control.",
        "Recent apps can be shown or hidden in the Dock separately from apps you've deliberately kept there.",
        "Widgets added to the desktop can also show on iPhone thanks to iCloud-connected widget behavior.",
      ],
      steps: [
        "Open System Settings → Desktop & Dock.",
        "Adjust Dock size, magnification, and position along the bottom, left, or right edge.",
        "Turn on Stage Manager or desktop widgets if you want them.",
        "Scroll down to Mission Control settings to fine-tune Spaces behavior.",
      ],
    },
    whyItMatters:
      "The Dock and desktop are two of the most-touched parts of macOS, so how they're configured has an outsized effect on daily comfort — a Dock that's the wrong size or position, or icons that jump around because of 'Show recent apps,' create small friction that adds up throughout the day. Stage Manager and widgets change how you multitask, so understanding what each option does before turning it on prevents surprise reorganizing of your open windows. Because this single pane controls Dock, desktop, and Mission Control together, it's worth reviewing as a whole rather than piecemeal.",
    bestPractices: [
      "Turn off 'Show recent applications in Dock' if you prefer a completely stable, unchanging set of icons.",
      "Try Dock magnification at a low level first, since a strong magnification setting can feel distracting rather than helpful.",
      "Only turn on Stage Manager if you're prepared to learn its window-grouping behavior, since it changes how clicking the desktop and switching apps works.",
      "Position the Dock on the side (left or right) if you work with a widescreen display and want to preserve vertical space.",
    ],
    commonIssues: [
      {
        issue: "The Dock keeps auto-hiding even though the setting looks off.",
        fix: "Check whether Stage Manager or a full-screen app is triggering the behavior, since some apps hide the Dock independently of the global setting.",
      },
      {
        issue: "Stage Manager rearranges windows in a confusing way.",
        fix: "Turn off Stage Manager in Desktop & Dock settings, or adjust its 'Recent Applications' and clicking behavior under the same pane.",
      },
      {
        issue: "Desktop widgets disappeared after clicking elsewhere.",
        fix: "Widgets fade when you click into an app by design if 'Show Widgets' is set to 'On Desktop Only, click to show'; change it to 'Always' in Desktop & Dock settings if you want them permanently visible.",
      },
    ],
    faqs: [
      {
        q: "Can I move the Dock to the side of the screen instead of the bottom?",
        a: "Yes, in Desktop & Dock settings choose 'Left' or 'Right' under Position on Screen.",
      },
      {
        q: "What does Dock magnification actually do?",
        a: "It enlarges Dock icons as your pointer moves over them, making it easier to pick out a specific app in a crowded Dock without needing a bigger Dock overall.",
      },
      {
        q: "Does Stage Manager replace Mission Control?",
        a: "No, they work alongside each other — Stage Manager organizes recent windows into a side strip, while Mission Control still shows an overview of all open windows and Spaces.",
      },
    ],
    tipsAndTricks: [
      "Drag the Dock's divider line to instantly resize it without opening System Settings at all.",
      "Hold Shift while resizing the Dock for a slow-motion animation, purely for fun but a good way to see the resize in detail.",
      "Right-click (or Control-click) any Dock icon for quick options like 'Keep in Dock' or 'Options → Show in Finder'.",
    ],
    relatedSettingIds: [
      "macos-mission-control",
      "macos-wallpaper-screensaver",
      "macos-displays",
    ],
  },
  {
    id: "macos-menu-bar-control-center",
    title: "Menu Bar & Control Center",
    icon: PanelTop,
    platform: "macos",
    category: "personalization",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize the Menu Bar and Control Center on Mac",
    description:
      "Control Center gives you quick access to frequently used settings like Wi-Fi, Bluetooth, Focus, and display brightness from a single menu bar icon. You can customize which controls appear in Control Center and which ones show directly in the menu bar for one-click access.",
    details: [
      "Control Center opens from its icon near the top-right of the screen, showing a grid of live, adjustable controls.",
      "Individual controls (like Sound or Now Playing) can be pinned to always show in the menu bar itself, bypassing Control Center.",
      "Menu bar item order can be rearranged by dragging with the Command key held down.",
      "Some Control Center modules, like Focus and Display, expand into a fuller panel when clicked.",
    ],
    important:
      "A crowded menu bar with too many pinned items can start truncating or hiding icons on smaller displays — keep only what you use daily pinned directly.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/use-control-center-mchl50f94f8f/mac",
    afterImageContent: {
      heading: "Choosing What Lives in Control Center vs. the Menu Bar",
      paragraphs: [
        "Every Control Center module can independently be set to also 'Show in Menu Bar' for faster one-click access.",
        "Third-party apps often add their own menu bar icons outside of Control Center's management.",
        "Control Center's layout is fixed in order but each module's visibility can be toggled individually.",
      ],
      steps: [
        "Open System Settings → Control Center.",
        "Scroll through modules like Wi-Fi, Bluetooth, Focus, and Displays.",
        "Toggle 'Show in Menu Bar' for anything you want direct one-click access to.",
        "Command-drag menu bar icons to reorder them to your preference.",
      ],
    },
    whyItMatters:
      "The menu bar and Control Center are where you'll adjust settings dozens of times a day — switching Wi-Fi networks, changing volume, or toggling a Focus — so a well-organized setup measurably speeds up small daily tasks. Because third-party apps compete for the same limited menu bar space, understanding which icons are essential versus clutter helps keep things usable, especially on smaller MacBook displays. Pinning your genuinely frequent controls (like Sound or Battery) directly to the menu bar saves the extra step of opening Control Center each time.",
    bestPractices: [
      "Pin only the two or three controls you adjust most often (like Sound, Wi-Fi, or Focus) directly to the menu bar.",
      "Remove 'Show in Menu Bar' for controls you rarely touch to reduce clutter, since they're still one click away inside Control Center.",
      "Reorder menu bar icons with Command-drag so your most-used ones sit closest to the Control Center icon.",
      "Check for a hidden overflow arrow on smaller displays if menu bar icons seem to be missing — it often just means they've been pushed off-screen.",
    ],
    commonIssues: [
      {
        issue: "A menu bar icon disappeared after connecting an external display or changing resolution.",
        fix: "Menu bar icons can get pushed off-screen when there isn't enough width; unpin a less-used item from Control Center settings to make room.",
      },
      {
        issue: "Control Center shows a module but it looks greyed out or unresponsive.",
        fix: "Quit and reopen the related app or restart the Mac, since some modules (like Now Playing) only populate when a matching app is actively running.",
      },
      {
        issue: "Reordering menu bar icons isn't working.",
        fix: "Make sure to hold Command while dragging — the icon needs the Command key held the entire time it's being repositioned, not just at the start of the drag.",
      },
    ],
    faqs: [
      {
        q: "Can I add third-party app icons to Control Center itself?",
        a: "No, Control Center only manages Apple's own system modules; third-party apps add their own separate icons directly to the menu bar.",
      },
      {
        q: "How do I remove an icon from the menu bar completely?",
        a: "Turn off 'Show in Menu Bar' for that specific module in System Settings → Control Center, or Command-drag a third-party app's icon off the menu bar to remove it.",
      },
      {
        q: "Why does Control Center look different after a macOS update?",
        a: "Apple occasionally reorganizes or adds new modules with major macOS versions, so a changed layout after upgrading is expected and can be re-customized in Control Center settings.",
      },
    ],
    tipsAndTricks: [
      "Click into a Control Center module (like Wi-Fi or Focus) rather than just its toggle to reveal a more detailed expanded panel.",
      "Use Command-drag on the Control Center icon itself, not just individual modules, to reposition its overall spot in the menu bar.",
    ],
    relatedSettingIds: [
      "macos-focus",
      "macos-sound-notifications",
      "macos-bluetooth",
    ],
  },
  {
    id: "macos-wallpaper-screensaver",
    title: "Wallpaper & Screen Saver",
    icon: Image,
    platform: "macos",
    category: "personalization",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Change Wallpaper and Screen Saver on Mac",
    description:
      "Wallpaper settings let you set the desktop picture — from Apple's built-in dynamic and aerial images to your own photos — and configure the screen saver that appears after your Mac sits idle. Recent macOS versions combine both into a single Wallpaper settings pane.",
    details: [
      "Dynamic wallpapers automatically shift throughout the day to match light and dark appearance.",
      "Aerial screen savers (drone-style footage of cities and landscapes) can also be used as slow-moving wallpaper.",
      "You can set separate wallpapers for each display when using more than one monitor.",
      "Screen saver idle time can be set independently from display sleep timing.",
    ],
    important:
      "If 'Require password after screen saver begins' isn't turned on, anyone who wakes your Mac while the screen saver is running can access it without a password — that's controlled separately, under Lock Screen settings.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/change-screen-saver-settings-mchlp1227/mac",
    afterImageContent: {
      heading: "Setting a Wallpaper and Screen Saver",
      paragraphs: [
        "Apple's built-in wallpaper collection includes still, dynamic (light/dark shifting), and aerial (moving video) options.",
        "Your own photos can be set as wallpaper individually or as a rotating slideshow from an album.",
        "Screen saver style can be set independently of wallpaper choice, or matched together automatically.",
      ],
      steps: [
        "Open System Settings → Wallpaper.",
        "Choose a built-in image, dynamic wallpaper, or your own photo.",
        "Click 'Screen Saver' on the right to choose and configure a screen saver style.",
        "Set how long your Mac should sit idle before the screen saver starts.",
      ],
    },
    whyItMatters:
      "Wallpaper and screen saver settings are mostly aesthetic, but the screen saver's idle timing and its interaction with password requirements have a real security dimension — a screen saver alone doesn't protect your Mac unless it's paired with a password requirement. Dynamic and aerial wallpapers also use a bit more system resources than a static image, which occasionally matters on older Macs or when battery life is a priority. Getting this pane set up the way you like it is a small thing that you'll look at every single day.",
    bestPractices: [
      "Pair any screen saver with 'Require password immediately' under Lock Screen settings for actual security, not just visual privacy.",
      "Use a static or dynamic (not aerial) wallpaper on battery power if you're trying to maximize battery life, since aerial video wallpapers use more energy.",
      "Set a per-display wallpaper on multi-monitor setups if you want to visually distinguish your screens at a glance.",
      "Choose a shorter idle time before the screen saver in shared or public spaces, and a longer one at a private desk.",
    ],
    commonIssues: [
      {
        issue: "Screen saver never starts even after being idle.",
        fix: "Check Battery or Energy settings for a 'Prevent automatic sleeping' option that might be keeping the Mac fully active, and confirm the idle time in Wallpaper → Screen Saver isn't set to Never.",
      },
      {
        issue: "A custom photo album stopped updating as the wallpaper slideshow.",
        fix: "Reselect the album under Wallpaper settings, since renaming or deleting the original album in Photos breaks the link.",
      },
      {
        issue: "Aerial screen saver looks choppy or won't play smoothly.",
        fix: "Aerial screen savers download high-resolution video and can stutter on a slow or metered internet connection; switch to a lower-resolution style or a static wallpaper instead.",
      },
    ],
    faqs: [
      {
        q: "Does the screen saver use a lot of battery?",
        a: "Aerial and video-based screen savers use noticeably more power than a static image or simple pattern, so switch to something simpler if you're trying to conserve battery.",
      },
      {
        q: "Can I use the same aerial video as both my wallpaper and screen saver?",
        a: "Yes, several Apple aerial and landscape options are available as both a slow-moving wallpaper and a full screen saver from the same Wallpaper settings pane.",
      },
      {
        q: "Is the screen saver a security feature by itself?",
        a: "Not on its own — it only hides the desktop visually; you need 'Require password' turned on under Lock Screen settings for it to actually protect your data.",
      },
    ],
    tipsAndTricks: [
      "Set wallpaper directly from Photos by right-clicking any image and choosing 'Set as Desktop Picture' without opening System Settings.",
      "Use a rotating photo album as your wallpaper slideshow set to change every few minutes for variety throughout the day.",
    ],
    relatedSettingIds: [
      "macos-lock-screen",
      "macos-desktop-dock",
      "macos-displays",
    ],
  },
  {
    id: "macos-lock-screen",
    title: "Lock Screen",
    icon: LockKeyhole,
    platform: "macos",
    category: "personalization",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Configure Lock Screen Settings on Mac",
    description:
      "Lock Screen settings control when your Mac requires a password after sleep or screen saver, how long it waits before locking, and what's shown at the login window — all central to protecting your Mac from casual tampering or unauthorized access.",
    details: [
      "Choose exactly how soon a password is required after the display sleeps or the screen saver starts.",
      "Login window options let you show a list of users, or hide it and require typing a name and password.",
      "You can control whether password hints, restart/shutdown buttons, or other users appear at the lock screen.",
      "Lock Screen settings also govern how quickly the display dims and turns off when idle.",
    ],
    important:
      "Setting 'Require password' to anything other than 'immediately' leaves a window of time after sleep where your Mac can be accessed without authentication.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/change-lock-screen-settings-on-mac-mh11784/mac",
    afterImageContent: {
      heading: "What Lock Screen Settings Control",
      paragraphs: [
        "Lock Screen settings sit between general display sleep timing and full security features like FileVault.",
        "The login window can be configured to show or hide the list of user accounts on a shared Mac.",
        "Combined with Touch ID (on supported Macs), a short password delay makes locking nearly frictionless.",
      ],
      steps: [
        "Open System Settings → Lock Screen.",
        "Set how long before the display turns off, on both battery and power.",
        "Choose how soon a password is required after sleep or screen saver starts.",
        "Adjust login window options, like showing or hiding the user list.",
      ],
    },
    whyItMatters:
      "Lock Screen settings are the practical front line of physical security for your Mac — they determine the actual window of time someone could pick up an unattended Mac and get in before it locks. On a shared or family Mac, hiding the user list and disabling restart/shutdown buttons at login also reduces the chance of accidental changes by someone who isn't you. Combined with Touch ID or a fast password entry, a strict Lock Screen setting adds real protection with very little day-to-day inconvenience.",
    bestPractices: [
      "Set 'Require password' to 'immediately' on any Mac that leaves the house or is used in shared spaces.",
      "Hide the list of other users at the login window on a shared family Mac to reduce accidental account switching.",
      "Pair a strict Lock Screen timeout with Touch ID (if available) so re-authenticating stays fast despite the tighter security.",
      "Disable the option to shut down or restart from the login window on Macs where only you should have that control.",
    ],
    commonIssues: [
      {
        issue: "Mac locks so quickly it interrupts presentations or media playback.",
        fix: "Temporarily extend 'Turn display off' timing before a presentation, or use Presenter Overlay/keep-awake features in the presentation app instead of changing the permanent Lock Screen setting.",
      },
      {
        issue: "Password prompt takes several seconds too long to appear after waking the Mac.",
        fix: "Check that the Mac isn't waking from a deeper sleep state, and confirm no delay is set under 'Require password' beyond 'immediately'.",
      },
      {
        issue: "A shared Mac's login window doesn't show the account you expect.",
        fix: "Check whether 'Display login window as: Name and password' is enabled instead of a user list, which hides all accounts until a name is typed manually.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between display sleep and Lock Screen settings?",
        a: "Display sleep just turns off the screen to save power, while Lock Screen settings control the separate password requirement that determines whether the Mac is actually protected once it wakes back up.",
      },
      {
        q: "Can I require a password immediately but still allow a short display-off delay?",
        a: "Yes, display sleep timing and password requirement timing are configured independently in Lock Screen settings, so you can have a longer screen-off delay with an immediate password requirement.",
      },
      {
        q: "Does Touch ID replace the need for a password?",
        a: "No, Touch ID is a faster way to authenticate but your Mac still has an underlying password, which you'll be asked for after a restart or if Touch ID fails a few times.",
      },
    ],
    tipsAndTricks: [
      "Combine a fast lock timeout with a corner-triggered hot corner to lock your screen instantly with a single mouse movement.",
      "Use Command-Control-Q as a keyboard shortcut to lock your Mac's screen instantly, without waiting for any timeout at all.",
    ],
    relatedSettingIds: [
      "macos-filevault-encryption",
      "macos-wallpaper-screensaver",
      "macos-accessibility",
    ],
  },
  {
    id: "macos-mission-control",
    title: "Mission Control & Spaces",
    icon: LayoutGrid,
    platform: "macos",
    category: "apps-features",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Organize Windows with Mission Control & Spaces on Mac",
    description:
      "Mission Control gives you a bird's-eye view of every open window and virtual desktop (called a Space) on your Mac, so you can quickly find a window or switch contexts. Spaces let you group apps by project or activity instead of piling every window onto one desktop.",
    details: [
      "Swipe up with three or four fingers on a trackpad, or press the Mission Control key, to see all open windows at once.",
      "You can create up to 16 separate Spaces, each holding its own set of app windows.",
      "Assign a specific app to always open in a particular Space from that app's Dock icon options.",
      "Full-screen apps automatically become their own dedicated Space.",
    ],
    important:
      "Deleting a Space moves its open windows to the neighboring Space rather than closing the apps — nothing is lost, but it can be momentarily confusing if you weren't expecting the shuffle.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/work-in-multiple-spaces-mh14112/mac",
    afterImageContent: {
      heading: "Building a Spaces Workflow",
      paragraphs: [
        "Spaces appear as a row of thumbnails along the top of the Mission Control view, in the order you switch between them.",
        "Each external display can have its own independent set of Spaces, or share one continuous set, depending on Mission Control settings.",
        "Mission Control also groups windows from the same app together when you view all open windows.",
      ],
      steps: [
        "Open Mission Control (swipe up with three or four fingers, or press F3/the Mission Control key).",
        "Click the + in the top-right to add a new Space.",
        "Drag windows between Spaces at the top of the Mission Control view.",
        "Switch Spaces with Control-Left/Right Arrow or a trackpad swipe.",
      ],
    },
    whyItMatters:
      "Spaces turn a Mac into something closer to multiple separate desktops, which matters a lot once you're regularly juggling more windows than fit comfortably on one screen — separating 'writing' from 'research' from 'communication' into different Spaces cuts down on visual clutter and app-hunting. Mission Control's full overview is also the fastest way to locate a specific window when you've lost track of it among a dozen open apps. For anyone doing focused project-based work, assigning apps to specific Spaces turns switching context into a single keystroke instead of a scavenger hunt.",
    bestPractices: [
      "Assign your most space-hungry, distraction-prone apps (like Mail or Slack) to a specific Space you can step away from entirely.",
      "Learn the Control-Arrow keyboard shortcuts for switching Spaces instead of relying only on trackpad swipes.",
      "Keep the number of Spaces manageable (three to five for most people) rather than creating so many that navigating between them becomes its own chore.",
      "Turn on 'Displays have separate Spaces' if you use an external monitor and want each screen to behave independently.",
    ],
    commonIssues: [
      {
        issue: "An app keeps opening on the wrong Space.",
        fix: "Right-click its Dock icon, go to Options, and either clear its assigned Space or explicitly assign it to the Space you want it to always open on.",
      },
      {
        issue: "Swiping between Spaces feels laggy or skips Spaces.",
        fix: "Check Trackpad settings to confirm 'Swipe between full-screen apps' is enabled and try a slower, more deliberate three-finger swipe.",
      },
      {
        issue: "Mission Control shows windows from the wrong Space or display.",
        fix: "Check the 'Displays have separate Spaces' setting in Mission Control settings, since turning it off consolidates everything into one continuous view.",
      },
    ],
    faqs: [
      {
        q: "How many Spaces can I create?",
        a: "macOS supports up to 16 Spaces, though most people find three to six more than enough to stay organized without adding navigation overhead.",
      },
      {
        q: "Do full-screen apps count as Spaces?",
        a: "Yes, any app you put into full-screen mode automatically becomes its own Space, appearing alongside your regular desktop Spaces in Mission Control.",
      },
      {
        q: "Can each of my displays have a different set of Spaces?",
        a: "Yes, if you turn on 'Displays have separate Spaces' in Mission Control settings, each connected display manages its own independent set of Spaces.",
      },
    ],
    tipsAndTricks: [
      "Use Control-Up Arrow as a quick keyboard shortcut into Mission Control without touching the trackpad at all.",
      "Drag a window to the very top edge of the screen while it's open to create a brand-new Space for it in one motion.",
      "Hold Option while clicking Mission Control's + button for additional Space-creation options in some macOS versions.",
    ],
    relatedSettingIds: [
      "macos-desktop-dock",
      "macos-trackpad",
      "macos-displays",
    ],
  },
  {
    id: "macos-trackpad",
    title: "Trackpad",
    icon: Touchpad,
    platform: "macos",
    category: "devices-peripherals",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Trackpad Behavior on Mac",
    description:
      "Trackpad settings control click pressure, tracking speed, scrolling direction, and the full set of multi-touch gestures used for navigating macOS — everything from a simple tap-to-click to four-finger app switching.",
    details: [
      "Point & Click options include tap-to-click, tracking speed, and click pressure (Light, Medium, or Firm).",
      "Scroll & Zoom settings control natural scrolling direction and pinch-to-zoom sensitivity.",
      "More Gestures covers swiping between full-screen apps, Spaces, Notification Center, and opening Launchpad or the desktop.",
      "External Magic Trackpads support the same gesture set as a MacBook's built-in trackpad.",
    ],
    important:
      "Turning off 'Natural scrolling' reverses the direction content moves relative to your fingers — try it for a few days before deciding it's wrong for you, since most people find it fast to adjust to.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/change-trackpad-settings-mchlp1226/mac",
    afterImageContent: {
      heading: "Getting the Most Out of Trackpad Gestures",
      paragraphs: [
        "Trackpad settings are organized into Point & Click, Scroll & Zoom, and More Gestures tabs.",
        "A small animation preview plays in System Settings whenever you hover over a gesture, showing exactly how it's performed.",
        "Gesture behavior is consistent between a MacBook's built-in trackpad and an external Magic Trackpad.",
      ],
      steps: [
        "Open System Settings → Trackpad.",
        "Adjust Point & Click options like tracking speed and click pressure.",
        "Switch to Scroll & Zoom or More Gestures tabs to review and enable specific gestures.",
        "Hover over any gesture's animation to see exactly how many fingers and what motion it uses.",
      ],
    },
    whyItMatters:
      "The trackpad is the primary pointing device on every MacBook, so its tracking speed and gesture setup directly shape how fast and comfortable everyday navigation feels. Gestures like three-finger app switching or four-finger Mission Control turn multi-step actions into a single motion, meaningfully speeding up daily work once they're second nature. Because tap-to-click and click pressure are personal preferences with real ergonomic impact, it's worth spending a few minutes tuning them rather than living with the defaults.",
    bestPractices: [
      "Turn on 'Tap to Click' if you find clicking down physically tiring over a full day of use.",
      "Set click pressure to 'Light' if you experience any hand fatigue, since it requires noticeably less physical force.",
      "Learn at least the three-finger swipe between full-screen apps/Spaces and the pinch-to-open-Launchpad gesture, since they're used constantly.",
      "Increase tracking speed a notch or two above the default if you work on a large or high-resolution external display.",
    ],
    commonIssues: [
      {
        issue: "Trackpad clicks register as right-clicks unexpectedly.",
        fix: "Check Point & Click settings for 'Secondary click' configuration, since a two-finger click or a specific corner might be set to trigger right-click behavior.",
      },
      {
        issue: "Scrolling direction feels backwards after a macOS update.",
        fix: "This is controlled by 'Natural scrolling' in Scroll & Zoom settings; toggle it if a system update reset your preference or if you simply want the opposite direction.",
      },
      {
        issue: "A specific gesture, like swiping between Spaces, stopped working.",
        fix: "Reopen Trackpad → More Gestures and confirm that gesture's checkbox is still enabled, since some macOS updates can reset gesture preferences.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between tracking speed and click pressure?",
        a: "Tracking speed controls how fast the pointer moves relative to your finger's motion, while click pressure controls how hard you need to press down for a click to register — they're independent settings.",
      },
      {
        q: "Do external Magic Trackpads support the same gestures as a MacBook's built-in trackpad?",
        a: "Yes, an external Magic Trackpad supports the identical gesture set, configured from the same Trackpad settings pane.",
      },
      {
        q: "Can I disable the trackpad entirely and only use a mouse?",
        a: "There's no dedicated system toggle to fully disable the built-in trackpad, though third-party utilities exist for this; most people just ignore it once a mouse is connected.",
      },
    ],
    tipsAndTricks: [
      "Use 'Force Click and haptic feedback' (on supported trackpads) to press firmly and look up a word, preview a file, or access other force-click shortcuts.",
      "Hover over each gesture's thumbnail animation in Trackpad settings for a quick visual reminder of exactly how many fingers and what direction it needs.",
    ],
    relatedSettingIds: [
      "macos-mouse",
      "macos-mission-control",
      "macos-accessibility",
    ],
  },
  {
    id: "macos-mouse",
    title: "Mouse",
    icon: Mouse,
    platform: "macos",
    category: "devices-peripherals",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Mouse Settings on Mac",
    description:
      "Mouse settings control tracking speed, scrolling direction, and secondary-click behavior for any connected mouse, including Apple's Magic Mouse, which also supports its own set of swipe gestures.",
    details: [
      "Tracking speed determines how far the pointer moves relative to physical mouse movement.",
      "Secondary click (right-click) can be assigned to the left side, right side, or disabled entirely.",
      "Magic Mouse supports swipe gestures for switching between full-screen apps and Spaces.",
      "Scroll direction can be set to 'Natural' or traditional, independent of a trackpad's own scroll setting.",
    ],
    important:
      "A Magic Mouse charges through the Lightning or USB-C port on its underside, so it can't be used at all while actively charging — keep a spare charge cable handy if you rely on it during the workday.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/change-mouse-settings-mchlp1138/mac",
    afterImageContent: {
      heading: "Configuring a Mouse on Mac",
      paragraphs: [
        "macOS automatically detects a connected mouse and lets you adjust its behavior from the same Mouse settings pane.",
        "Magic Mouse's swipe gestures live under a separate 'More Gestures' section, distinct from tracking and scrolling controls.",
        "Third-party mice with additional buttons may require the manufacturer's own software for full customization beyond macOS's built-in options.",
      ],
      steps: [
        "Open System Settings → Mouse.",
        "Adjust tracking speed and scrolling speed to your preference.",
        "Set secondary click to the side you want to trigger right-click.",
        "If using a Magic Mouse, review More Gestures for swipe options.",
      ],
    },
    whyItMatters:
      "Mouse tracking and scroll settings shape the feel of everyday pointing and scrolling more than most people realize, and getting them wrong can cause real friction or hand strain over a full workday. For Magic Mouse users specifically, gesture support means the mouse can replace some trackpad-style navigation, so knowing the gesture options avoids missing out on genuinely useful shortcuts. Because secondary-click side and natural scrolling are both personal preference rather than a fixed default, it's worth confirming they're set the way that feels right to you rather than leaving factory defaults in place.",
    bestPractices: [
      "Set secondary click to whichever side matches how you naturally rest your fingers, since the default isn't always the most comfortable.",
      "Turn on Magic Mouse's swipe gestures for full-screen app and Space switching if you don't already use a trackpad for that.",
      "Increase tracking speed on a large or high-resolution external display so the pointer doesn't feel sluggish crossing the screen.",
      "Keep a charge cable accessible if using a Magic Mouse, since it can't be used at all while its underside is plugged in to charge.",
    ],
    commonIssues: [
      {
        issue: "Magic Mouse becomes unresponsive or laggy.",
        fix: "Check its battery level in the Bluetooth or Mouse settings pane, and give it a quick charge, since Magic Mouse behavior degrades noticeably as its battery gets low.",
      },
      {
        issue: "Right-click isn't working on a connected mouse.",
        fix: "Open Mouse settings and confirm 'Secondary click' is assigned to a side rather than set to off, since it's disabled by default on some third-party mice until configured.",
      },
      {
        issue: "Scrolling direction feels reversed compared to a trackpad.",
        fix: "Mouse and trackpad each have independent 'Natural scrolling' settings; adjust the Mouse setting specifically if you want it to differ from your trackpad's behavior.",
      },
    ],
    faqs: [
      {
        q: "Why can't I use my Magic Mouse while it's charging?",
        a: "The charging port is on the underside of the mouse, which physically prevents it from sitting flat and tracking while a cable is plugged in — a quick few-minute charge is usually enough to get hours of use.",
      },
      {
        q: "Can I use a Magic Mouse and a trackpad at the same time with different scroll settings?",
        a: "Yes, Mouse and Trackpad each have their own independent settings pane, so natural scrolling or tracking speed can differ between the two devices.",
      },
      {
        q: "Do third-party mice support the same gesture customization as Magic Mouse?",
        a: "Basic tracking, scrolling, and click settings work the same, but multi-touch swipe gestures are specific to Magic Mouse's touch-sensitive surface and generally aren't available on standard third-party mice.",
      },
    ],
    tipsAndTricks: [
      "Check battery percentage for a Magic Mouse directly from the Bluetooth menu bar item without opening System Settings.",
      "Combine a fast tracking speed with a lower scroll speed if you want quick pointer movement but more controlled, precise scrolling.",
    ],
    relatedSettingIds: [
      "macos-trackpad",
      "macos-bluetooth",
      "macos-accessibility",
    ],
  },
  {
    id: "macos-keyboard",
    title: "Keyboard",
    icon: Keyboard,
    platform: "macos",
    category: "devices-peripherals",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Keyboard Settings on Mac",
    description:
      "Keyboard settings control key repeat speed, modifier key behavior, text input sources, and Dictation — plus Touch Bar customization on supported MacBook Pro models. It's also where you add languages and manage keyboard shortcuts across the system.",
    details: [
      "Adjust Key Repeat Rate and Delay Until Repeat with two independent sliders.",
      "Remap modifier keys like Caps Lock, Control, Option, and Command via the Modifier Keys button.",
      "Choose what the Fn/Globe key does when pressed alone — show Emoji & Symbols, switch input source, or nothing.",
      "Enable Dictation and pick whether it processes speech on-device or requires an internet connection, depending on language.",
    ],
    important:
      "Remapping a modifier key (like swapping Caps Lock for Control) applies system-wide across every app, so double check the change before walking away — a mis-set Command key can make typical shortcuts stop working entirely.",
    redirectUrl: "https://support.apple.com/guide/mac-help/keyboard-settings-kbdm162/mac",
    afterImageContent: {
      heading: "How Keyboard Settings Work on Mac",
      paragraphs: [
        "The Keyboard pane in System Settings groups options into keyboard behavior, text input sources, and Dictation.",
        "Input sources you add (like additional languages) appear in the menu bar's Input menu for quick switching.",
        "Touch Bar customization, on supported Intel MacBook Pro models, lets you choose which controls appear by default and per-app.",
      ],
      steps: [
        "Open System Settings → Keyboard.",
        "Adjust Key Repeat Rate and Delay Until Repeat sliders to taste.",
        "Click Modifier Keys to remap Caps Lock, Control, Option, or Command if desired.",
        "Add input sources or configure Dictation further down the same pane.",
      ],
    },
    whyItMatters:
      "Key repeat speed and modifier key layout directly affect typing comfort and speed, and a poorly tuned repeat rate can make holding a key down feel sluggish or overly aggressive. Remapping Caps Lock to Control (or vice versa) is one of the most common ergonomic tweaks power users make, since Caps Lock sits in an easy-to-reach spot but is rarely used for its default purpose. Dictation and additional input sources matter for anyone who writes in more than one language or prefers speaking over typing for parts of their workflow. Because keyboard shortcuts underlie almost every efficient workflow on a Mac, getting this pane right pays off throughout the day.",
    bestPractices: [
      "Remap Caps Lock to Control (or Escape) if you rarely use Caps Lock, since its default position is more ergonomic than the standard Control key.",
      "Lower Delay Until Repeat if you find yourself waiting too long for held keys to start repeating, especially useful for navigating text with arrow keys.",
      "Add only the input sources and languages you actually type in, since a long Input menu list gets harder to navigate quickly.",
      "Turn on Dictation if you frequently draft text by voice, and check whether your language supports on-device processing for better privacy.",
      "Review Touch Bar customization per-app on supported MacBook Pros so frequently used controls (like brightness or media keys) stay easy to reach.",
    ],
    commonIssues: [
      {
        issue: "Held-down key repeats far too fast or too slow after adjusting settings.",
        fix: "Re-open Keyboard settings and fine-tune both the Key Repeat Rate and Delay Until Repeat sliders together, since they interact — a fast repeat rate paired with a short delay feels very different from a fast rate with a long delay.",
      },
      {
        issue: "Swapped modifier keys (like Control and Command) are causing shortcuts to stop working as expected.",
        fix: "Open Keyboard → Modifier Keys and reset each key back to its default action, or double-check the swap was intentional and adjust muscle memory instead.",
      },
      {
        issue: "A new input source or language doesn't show up in the menu bar.",
        fix: "Confirm 'Show Input menu in menu bar' is enabled under Keyboard → Input Sources, since the menu bar icon can be hidden even when sources are added.",
      },
      {
        issue: "Dictation stops working or won't turn on.",
        fix: "Check Privacy & Security → Microphone for permission, confirm internet connectivity if the selected language requires server-based Dictation, and verify Dictation is toggled on in Keyboard settings.",
      },
    ],
    faqs: [
      {
        q: "Can I use a Windows keyboard on my Mac?",
        a: "Yes, macOS detects most third-party keyboards automatically, though you may need to specify the exact keyboard layout under Keyboard settings so certain keys (like the Windows key mapping to Command) behave correctly.",
      },
      {
        q: "Does Dictation require an internet connection?",
        a: "It depends on the language — many popular languages support enhanced offline Dictation that processes speech entirely on-device, while others still require a connection to Apple's servers.",
      },
      {
        q: "Will remapping Caps Lock affect other users on a shared Mac?",
        a: "No, modifier key remapping is saved per user account, so each person signed in to a shared Mac can have their own independent Caps Lock or Control behavior.",
      },
    ],
    tipsAndTricks: [
      "Press the Globe/Fn key alone (after setting it to 'Show Emoji & Symbols') for instant access to the emoji picker from anywhere you can type.",
      "Use Keyboard → Text Replacements to set up shortcuts like 'omw' expanding into 'On my way!' system-wide.",
    ],
    relatedSettingIds: [
      "macos-trackpad",
      "macos-mouse",
      "macos-accessibility",
    ],
  },
  {
    id: "macos-printers-scanners",
    title: "Printers & Scanners",
    icon: Printer,
    platform: "macos",
    category: "devices-peripherals",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Printers and Scanners on Mac",
    description:
      "Printers & Scanners settings let you add, configure, and manage printers and scanners connected over USB, Wi-Fi, or a network, including setting a default printer and checking on active print jobs.",
    details: [
      "Add a printer automatically when it's on the same network, or manually by IP address for less common setups.",
      "Set a default printer overall, or let macOS choose the last one used automatically.",
      "Double-click a printer in the list to open its queue and monitor or cancel print jobs in progress.",
      "Scanners connected via USB or network are configured from the same list and can save scans as PDF or image files.",
    ],
    important:
      "Many printer features (duplex printing, stapling, tray selection) only appear once the correct manufacturer driver is installed — the generic AirPrint driver macOS installs automatically covers basic printing but not every advanced option.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/printers-scanners-settings-on-mac-prtct004/mac",
    afterImageContent: {
      heading: "Adding and Managing a Printer on Mac",
      paragraphs: [
        "macOS can detect most AirPrint-compatible printers on the same network automatically, without installing separate software.",
        "For full-feature support (like advanced finishing options), install the manufacturer's driver from their website first.",
        "Print queues let you see, pause, or cancel jobs for each printer independently.",
      ],
      steps: [
        "Open System Settings → Printers & Scanners.",
        "Click Add Printer, Scanner, or Fax and select your device from the list.",
        "Set a default printer from the dropdown if you use more than one regularly.",
        "Click a printer's Open Print Queue button to monitor active jobs.",
      ],
    },
    whyItMatters:
      "A correctly configured default printer and driver setup saves time on every single print job, instead of picking the right device and settings from scratch each time. Installing the full manufacturer driver rather than relying on the generic AirPrint fallback unlocks features many people don't realize they're missing, like duplex printing or specific paper tray selection. Scanner setup in the same pane also turns your Mac into a quick way to digitize documents without separate scanning software. Because printers are shared hardware, understanding queue management here helps you diagnose a stuck job without giving up and restarting the whole print.",
    bestPractices: [
      "Install the manufacturer's full driver and software (not just relying on AirPrint) if you regularly use features like duplex printing or specific paper trays.",
      "Set your most-used printer as the default so you don't need to pick it manually for every print job.",
      "Keep printer and scanner software updated through the manufacturer's own updater, since macOS updates don't always include the latest print drivers.",
      "Remove old or unused printers from the list periodically to keep the picker menu manageable.",
      "Check the print queue immediately if a job seems stuck, rather than resending it repeatedly, since duplicate jobs pile up in the queue.",
    ],
    commonIssues: [
      {
        issue: "A print job is stuck 'in progress' and won't complete.",
        fix: "Open the printer's queue from Printers & Scanners, delete the stuck job, and if it recurs, remove and re-add the printer to reset its connection.",
      },
      {
        issue: "A previously working printer no longer appears in the list after a network change.",
        fix: "Remove the printer and add it again so macOS can rediscover it at its current network address, especially after a router replacement or Wi-Fi network change.",
      },
      {
        issue: "Scanning produces blank or corrupted pages.",
        fix: "Check that the scanner's own drivers are current, close any other app that might be using the scanner simultaneously, and try scanning at a lower resolution to rule out a memory or timeout issue.",
      },
      {
        issue: "Print quality looks lower than expected despite selecting the right paper type.",
        fix: "Confirm the manufacturer's full driver is installed rather than the generic AirPrint driver, since generic drivers often default to lower-quality print settings.",
      },
    ],
    faqs: [
      {
        q: "Do I need to install printer software, or does macOS handle everything automatically?",
        a: "macOS can print to most AirPrint printers with zero extra software, but installing the manufacturer's driver unlocks advanced features and often improves print quality and reliability.",
      },
      {
        q: "Can I print to a printer connected to someone else's Mac or a Windows PC?",
        a: "Yes, macOS supports printing to printers shared from another Mac or a Windows computer on the same network, configurable when adding the printer in Printers & Scanners.",
      },
      {
        q: "How do I cancel a print job that's already started?",
        a: "Open the printer's queue from Printers & Scanners (or click the printer icon in the Dock while it's printing) and click the X next to the job you want to cancel.",
      },
    ],
    tipsAndTricks: [
      "Click the printer icon that appears in the Dock while printing for a quick shortcut straight to that job's queue.",
      "Use 'Add Printer, Scanner, or Fax' → the IP tab to manually add a network printer that isn't being auto-discovered, using its IP address.",
    ],
    relatedSettingIds: [
      "macos-wifi",
      "macos-bluetooth",
      "macos-keyboard",
    ],
  },
  {
    id: "macos-vpn-network",
    title: "VPN & Network Profiles",
    icon: Network,
    platform: "macos",
    category: "connectivity-network",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Configure VPN and Network Profiles on Mac",
    description:
      "VPN settings let you connect to a private network over an encrypted tunnel — common for remote work — while Network preferences let you manage multiple connection profiles, proxies, and advanced TCP/IP settings for different locations or services.",
    details: [
      "Add a VPN configuration manually with server address, account, and protocol (like IKEv2), or install one via a configuration profile from your organization.",
      "A VPN status icon can be shown in the menu bar for quick connect/disconnect without opening System Settings.",
      "Network locations let you save different sets of network settings (like office vs. home) and switch between them.",
      "Advanced network settings per connection include DNS servers, proxies, and hardware (MAC address) options.",
    ],
    important:
      "Corporate VPN profiles often route all your internet traffic through your company's network while connected, which can affect access to personal sites or slow down unrelated browsing — check with your IT team about split-tunneling if that's a concern.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/set-up-a-vpn-connection-on-mac-mchlp2963/mac",
    afterImageContent: {
      heading: "Setting Up a VPN Connection on Mac",
      paragraphs: [
        "Most organizations provide either a configuration profile to install or specific server details to enter manually.",
        "Once added, a VPN service appears in Network settings and can be connected or disconnected individually.",
        "The VPN status menu bar icon shows connection state at a glance and lets you switch between multiple configured VPNs.",
      ],
      steps: [
        "Open System Settings → VPN (or Network → VPN).",
        "Click Add VPN Configuration and choose the protocol your organization uses.",
        "Enter the server address, account, and authentication details provided by your IT team or VPN provider.",
        "Turn on 'Show VPN status in menu bar' for one-click connect and disconnect.",
      ],
    },
    whyItMatters:
      "VPN access is often the only way to reach internal company resources like file servers or internal tools while working remotely, so a broken VPN configuration can block an entire day of work. Network profiles matter for anyone who regularly moves between different environments (home, office, client sites) with different proxy or DNS requirements, since manually reconfiguring network settings every time is tedious and error-prone. Getting DNS and proxy settings right in Network preferences also affects browsing speed and whether certain internal sites resolve correctly at all. Because VPN traffic is encrypted, it's also a meaningful privacy and security tool on untrusted networks like public Wi-Fi.",
    bestPractices: [
      "Get exact server address, account, and protocol details from your IT department rather than guessing, since VPN configurations rarely work with partial information.",
      "Turn on the VPN status menu bar icon so you can confirm connection state at a glance before accessing internal resources.",
      "Save separate network locations if you regularly switch between environments (like home and office) with different proxy or DNS needs.",
      "Use your organization's official configuration profile when one is provided instead of manual entry, since profiles often include additional required certificates.",
      "Disconnect from VPN when you don't need internal access, since some VPNs route all traffic through the company network and can slow down unrelated browsing.",
    ],
    commonIssues: [
      {
        issue: "VPN connects but internal company resources (like file shares) still aren't reachable.",
        fix: "Confirm DNS settings are being pushed correctly by the VPN profile under Network → VPN → Advanced, and check with IT whether split-tunneling is expected to include the resource you need.",
      },
      {
        issue: "VPN fails to connect with an authentication error.",
        fix: "Double check your username and password (and any required certificate or two-factor code), since VPN authentication failures are most often simple credential mismatches or an expired certificate.",
      },
      {
        issue: "Internet feels much slower after connecting to VPN.",
        fix: "This is expected if the VPN routes all traffic through the company network rather than split-tunneling; ask your IT team whether split-tunneling is available for non-work traffic.",
      },
      {
        issue: "A saved network location doesn't apply its expected proxy or DNS settings.",
        fix: "Re-open Network settings, select the correct location from the location switcher, and re-verify each service's (Wi-Fi, Ethernet) individual advanced settings, since a location only overrides what's explicitly configured within it.",
      },
    ],
    faqs: [
      {
        q: "Do I need special software to connect to my company's VPN?",
        a: "Not always — macOS has built-in support for common protocols like IKEv2 and L2TP over IPSec, though some organizations require a dedicated VPN client app for their specific service.",
      },
      {
        q: "What's the difference between a network location and a VPN configuration?",
        a: "A VPN configuration is one specific encrypted connection you turn on or off, while a network location is a saved bundle of settings across all your network interfaces (Wi-Fi, Ethernet, proxies) that you switch between as a whole.",
      },
      {
        q: "Is it safe to use VPN on public Wi-Fi?",
        a: "Yes, connecting to a trusted VPN is one of the more effective ways to protect your traffic on public or unsecured Wi-Fi, since it encrypts data between your Mac and the VPN server.",
      },
    ],
    tipsAndTricks: [
      "Command-click the VPN status menu bar icon area or open Network settings directly from Control Center for faster connect/disconnect without digging through System Settings.",
      "Create a dedicated 'Travel' network location with conservative proxy and DNS settings if you frequently connect from hotels or airports with captive portals.",
    ],
    relatedSettingIds: [
      "macos-wifi",
      "macos-privacy-security-hub",
      "macos-filevault-encryption",
    ],
  },
  {
    id: "macos-general-apps",
    title: "General & Default Apps",
    icon: AppWindow,
    platform: "macos",
    category: "apps-features",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage General Settings and Default Apps on Mac",
    description:
      "The General settings pane covers system-wide basics like software update, storage, and login items, while default app settings let you choose which app opens web links, email, and specific file types instead of relying on Apple's built-in apps.",
    details: [
      "Set default apps for web browsing, email, and other link types independent of which app is installed most recently.",
      "Change the default app for an individual file type via Get Info → Open With → Change All.",
      "AirDrop and Handoff visibility and behavior are configured from the same General area.",
      "Storage recommendations and optimization options live under General → Storage.",
    ],
    important:
      "Changing a file type's default app with 'Change All' applies to every existing file of that type system-wide, not just the one you right-clicked — double check before confirming if you only meant to open a single file differently.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/choose-an-app-to-open-a-file-on-mac-mh35597/mac",
    afterImageContent: {
      heading: "Choosing Default Apps on Mac",
      paragraphs: [
        "Every file type on macOS has a default app that opens it when double-clicked, which you can override per type.",
        "Default web browser and email app are set separately from individual file-type defaults, typically from each app's own preferences or System Settings → Desktop & Dock.",
        "Changing a default doesn't move or convert existing files — it only changes which app opens them going forward.",
      ],
      steps: [
        "Select a file of the type you want to change and press Command-I to open Get Info.",
        "Choose your preferred app from the 'Open with' dropdown.",
        "Click 'Change All...' to apply that app to every file of the same type.",
        "For default browser or email, open the app's own Settings/Preferences and look for a 'Default' option, or set it in System Settings.",
      ],
    },
    whyItMatters:
      "Default apps determine what happens every time you click a link, open an attachment, or double-click a document, so a mismatched default (like PDFs opening in the wrong app) creates small annoyances dozens of times a day. General settings also bundle together several system-wide basics — storage, AirDrop, Handoff — that don't fit neatly elsewhere but affect daily usability. Getting default apps set correctly once saves the repeated friction of manually choosing 'Open With' every time you interact with a particular file type. This is also one of the first things worth checking after installing a new browser or PDF reader, since installers don't always ask before changing defaults.",
    bestPractices: [
      "Set your preferred web browser and email client explicitly rather than assuming the newest-installed app is correct.",
      "Use Get Info → Change All deliberately, confirming you actually want every file of that type affected before clicking it.",
      "Revisit default apps after installing a new browser, PDF reader, or code editor, since some installers change defaults automatically without asking clearly.",
      "Turn off AirDrop or restrict it to Contacts Only under General if you don't want to receive files from strangers nearby.",
      "Check General → Storage periodically for optimization recommendations if your Mac's disk is getting full.",
    ],
    commonIssues: [
      {
        issue: "Links keep opening in the wrong browser after installing a new one.",
        fix: "Open the browser you want as default, check its own Settings for a 'Make Default Browser' option, or in some versions of macOS set it directly from Desktop & Dock → Default web browser.",
      },
      {
        issue: "PDFs or images open in an unexpected app despite changing the default once.",
        fix: "Confirm you clicked 'Change All' (not just changed the single file) in Get Info's Open With section, since only 'Change All' updates every file of that type system-wide.",
      },
      {
        issue: "AirDrop isn't visible to a nearby device even though both are online.",
        fix: "Check that AirDrop's visibility is set to 'Everyone' or 'Contacts Only' (with both devices signed in to Apple Accounts that know each other) rather than 'No One', under General → AirDrop & Handoff.",
      },
    ],
    faqs: [
      {
        q: "Does changing a file's default app move or convert the file itself?",
        a: "No, changing a default app only changes which app opens the file when double-clicked — the file's format and location stay exactly the same.",
      },
      {
        q: "Can I set a different default app for just one file, without changing every file of that type?",
        a: "Yes, use 'Open With' (not 'Change All') from the right-click menu or Get Info for a one-time or single-file-only override.",
      },
      {
        q: "Where do I set my default browser if it's not listed under Desktop & Dock?",
        a: "On some macOS versions, default browser and email app are set from within the browser or Mail app's own preferences instead of System Settings directly — look for a 'Default' or 'Make Default' option there.",
      },
    ],
    tipsAndTricks: [
      "Hold Option while right-clicking a file to reveal an 'Always Open With' quick option in some macOS versions, skipping the full Get Info panel.",
      "Use Quick Look (press Space on a selected file) to confirm what a file actually is before deciding which app should open it by default.",
    ],
    relatedSettingIds: [
      "macos-login-items",
      "macos-desktop-dock",
      "macos-software-update",
    ],
  },
  {
    id: "macos-login-items",
    title: "Login Items & Extensions",
    icon: Puzzle,
    platform: "macos",
    category: "apps-features",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Login Items and Extensions on Mac",
    description:
      "Login Items & Extensions settings control which apps and documents open automatically when you log in, plus which system extensions — like Finder add-ons, sharing options, and background helper processes — are allowed to run.",
    details: [
      "Add apps, folders, or documents to 'Open at Login' so they launch automatically every time you sign in.",
      "Allow or block background items that apps install themselves, shown in a separate list from ones you add manually.",
      "Extensions are grouped by type: Finder, Share Menu, Actions, and more, each toggled independently.",
      "A notification appears when a new app adds itself as a background login item, with a direct link to this settings pane.",
    ],
    important:
      "Too many apps set to open at login meaningfully slows down startup and can quietly consume memory and battery in the background all day — review this list periodically rather than only when something first gets added.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/change-login-items-extensions-settings-mtusr003/mac",
    afterImageContent: {
      heading: "How Login Items and Extensions Work Together",
      paragraphs: [
        "Login Items you add manually appear in one list, while background items apps add themselves appear in a separate 'Allow in the Background' list.",
        "Extensions let third-party apps add capabilities to Finder, the Share menu, or Quick Actions without you needing to open the app directly.",
        "Disabling a background item stops it from launching at login, but doesn't uninstall the app itself.",
      ],
      steps: [
        "Open System Settings → General → Login Items & Extensions.",
        "Click the + button under Open at Login to add an app, folder, or document.",
        "Review the 'Allow in the Background' list and toggle off anything you don't recognize or need.",
        "Scroll to Extensions to enable or disable Finder, Share Menu, or other extension categories.",
      ],
    },
    whyItMatters:
      "Every app set to open at login adds to your Mac's startup time and consumes memory continuously afterward, so an unchecked list of login items is one of the more common, invisible causes of a Mac that 'feels slower than it used to.' Background items are also a meaningful security and privacy checkpoint, since some apps quietly add themselves without a clear prompt, and reviewing this list is one of the more effective ways to spot something unexpected running. Extensions extend what Finder and other system features can do, but each one adds a small amount of overhead, so enabling only the ones you actually use keeps things both faster and less cluttered.",
    bestPractices: [
      "Limit Open at Login to apps you genuinely want running immediately every session, like a password manager or messaging app.",
      "Review the 'Allow in the Background' list every few months and disable anything from an app you no longer use.",
      "Investigate any background item you don't recognize before assuming it's safe, since malicious software sometimes tries to add itself this way.",
      "Only enable Finder or Share Menu extensions you actually use, since each one adds a small amount of overhead to those menus.",
      "Remove login items for apps you've uninstalled, since some leave a stale entry behind rather than removing it automatically.",
    ],
    commonIssues: [
      {
        issue: "Mac takes noticeably longer to feel usable right after logging in.",
        fix: "Open Login Items & Extensions and remove non-essential apps from Open at Login, keeping only what you truly need running immediately.",
      },
      {
        issue: "An unfamiliar item keeps appearing in the 'Allow in the Background' list.",
        fix: "Identify which installed app it belongs to (often named similarly), decide whether you still use that app, and toggle it off if you don't recognize or want it.",
      },
      {
        issue: "A Finder extension or Quick Action isn't showing up in the right-click menu.",
        fix: "Confirm it's toggled on under Login Items & Extensions → Extensions, and that the parent app has been opened at least once after installation.",
      },
      {
        issue: "Removing an app from Login Items doesn't stop a notification about it running in the background.",
        fix: "Fully quit the app (not just close its window) via its Dock icon or Activity Monitor, since some apps relaunch a background helper independently of the login item toggle until they're force-quit once.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between items I add and items in 'Allow in the Background'?",
        a: "Items you add with the + button are ones you explicitly chose to open at login, while 'Allow in the Background' lists things apps registered themselves, often without an obvious prompt, giving you a chance to review and revoke them.",
      },
      {
        q: "Does disabling a login item uninstall the app?",
        a: "No, it only stops that app from launching automatically at login — the app itself stays installed and can still be opened manually anytime.",
      },
      {
        q: "Will I be notified when a new app tries to run in the background?",
        a: "Yes, macOS shows a notification the first time an app registers a background login item, with a shortcut straight to this settings pane so you can review or block it immediately.",
      },
    ],
    tipsAndTricks: [
      "Drag an app directly into the Open at Login list from Finder instead of using the + button and file picker.",
      "Check Activity Monitor's 'CPU' or 'Energy' tabs alongside this list if your Mac feels slow, since a runaway background process is sometimes the deeper cause rather than the login item itself.",
    ],
    relatedSettingIds: [
      "macos-general-apps",
      "macos-privacy-security-hub",
      "macos-erase-reset-mac",
    ],
  },
  {
    id: "macos-siri-spotlight",
    title: "Siri & Spotlight",
    icon: Search,
    platform: "macos",
    category: "apps-features",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Siri and Spotlight Search on Mac",
    description:
      "Siri settings control your Mac's voice assistant — activation phrase, voice, and language — while Spotlight settings determine what shows up when you search with Command-Space, including which categories of results and suggestions appear.",
    details: [
      "Choose how to invoke Siri: a keyboard shortcut, 'Listen for Hey Siri', or the menu bar icon.",
      "Pick Siri's voice, language, and whether spoken responses play through your Mac's speakers or stay silent with on-screen text only.",
      "Select which content categories Spotlight searches and shows suggestions for, like Contacts, Documents, or web results.",
      "Spotlight can be restricted from showing certain categories entirely if you prefer a narrower, faster search experience.",
    ],
    important:
      "Turning off specific Spotlight categories (like 'Siri Suggestions') can also reduce related Spotlight suggestions elsewhere in macOS, such as suggested apps in Launchpad — the settings are more interconnected than they first appear.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/siri-spotlight-settings-on-mac-mchl3fd7fc15/mac",
    afterImageContent: {
      heading: "How Siri and Spotlight Work Together on Mac",
      paragraphs: [
        "Siri and Spotlight share underlying suggestion technology, which is why they're grouped in the same settings pane.",
        "Spotlight indexes your Mac's files, emails, and messages locally to return fast search results as you type.",
        "Siri can answer questions, control settings, and search the same content Spotlight indexes, but responds conversationally instead of listing results.",
      ],
      steps: [
        "Open System Settings → Siri & Spotlight.",
        "Turn on Siri and choose your activation method, language, and voice.",
        "Scroll to Spotlight and check or uncheck which categories should appear in search results.",
        "Test with Command-Space to confirm results match what you expect.",
      ],
    },
    whyItMatters:
      "Spotlight is one of the fastest ways to open an app, find a file, or do a quick calculation on a Mac, so tuning which categories it searches directly affects how useful and fast it feels for your particular workflow. Siri offers a hands-free way to control settings or get quick answers, which matters most for accessibility needs or simply keeping your hands on the keyboard longer. Because both features index and analyze your personal content (files, messages, contacts) to work well, understanding what's searched and suggested is also relevant to privacy, not just convenience. A cluttered Spotlight full of irrelevant categories slows down the exact quick-lookup task it's meant to speed up.",
    bestPractices: [
      "Turn off Spotlight categories you never search (like Fonts or Tips) to keep results faster and more relevant.",
      "Set a consistent Siri activation method (like 'Hold Command-Space') if you find yourself invoking it accidentally with a different trigger.",
      "Use Spotlight's calculator and unit-conversion abilities directly in the search field instead of opening a separate Calculator app for quick math.",
      "Review Siri's language and voice settings after a macOS update, since major updates occasionally add new voice options worth trying.",
      "Turn off 'Siri Suggestions' in Spotlight if you'd rather see only literal file and app name matches instead of guessed suggestions.",
    ],
    commonIssues: [
      {
        issue: "Spotlight results feel slow or seem to be missing recently created files.",
        fix: "Give Spotlight's index time to catch up after adding a lot of new files, or rebuild the index via Privacy & Security → Spotlight Privacy by removing and re-adding a folder to force a re-index.",
      },
      {
        issue: "'Hey Siri' doesn't respond even though it's enabled.",
        fix: "Confirm the Mac's microphone isn't muted or blocked in Privacy & Security → Microphone, and that you're within a reasonable distance in a room without much background noise.",
      },
      {
        issue: "Spotlight shows results from apps or files you'd rather it didn't search.",
        fix: "Uncheck the specific category in Siri & Spotlight settings, or add specific folders to the Spotlight Privacy exclusion list under Privacy & Security → Spotlight.",
      },
      {
        issue: "Siri gives an answer in the wrong language or accent.",
        fix: "Check Siri's Language setting in Siri & Spotlight, since it's independent from your Mac's overall system language and region settings.",
      },
    ],
    faqs: [
      {
        q: "Does Spotlight search the contents of my files, or just their names?",
        a: "Both — Spotlight indexes file contents (like text inside documents and PDFs) as well as file and folder names, which is why it can find a document by a phrase inside it, not just its title.",
      },
      {
        q: "Can I stop Spotlight from indexing a specific folder for privacy reasons?",
        a: "Yes, add that folder to the exclusion list under Privacy & Security → Spotlight, and Spotlight will stop indexing and surfacing its contents in search.",
      },
      {
        q: "Is 'Hey Siri' always listening in the background?",
        a: "When enabled, your Mac listens locally for the 'Hey Siri' phrase specifically, but doesn't send continuous audio anywhere until it detects that phrase or you manually invoke Siri.",
      },
    ],
    tipsAndTricks: [
      "Type a simple math expression or unit conversion (like '15 USD in EUR') directly into Spotlight for an instant inline answer.",
      "Use Command-Space then keep typing an app's name and press Return to launch it faster than clicking through Launchpad or the Dock.",
    ],
    relatedSettingIds: [
      "macos-general-apps",
      "macos-menu-bar-control-center",
      "macos-accessibility",
    ],
  },
  {
    id: "macos-privacy-security-hub",
    title: "Privacy & Security",
    icon: ShieldCheck,
    platform: "macos",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Review Privacy & Security Settings on Mac",
    description:
      "The Privacy & Security settings pane is the central hub for controlling app permissions, FileVault encryption, Gatekeeper protections, Lockdown Mode, and analytics sharing — essentially every major security and data-access decision on your Mac in one place.",
    details: [
      "App permission categories (Camera, Microphone, Location, Files & Folders, and more) are each listed individually with their own per-app toggles.",
      "Gatekeeper settings control whether apps from outside the App Store and identified developers can be opened, and how strictly.",
      "Lockdown Mode offers an extreme, optional protection level for people at higher risk of targeted attacks, at the cost of some app functionality.",
      "Analytics & Improvements settings let you choose whether to share crash and usage data with Apple and app developers.",
    ],
    important:
      "Lockdown Mode is meant for a small number of people facing sophisticated, targeted threats — most users don't need it, and turning it on disables or restricts several everyday features like message attachment previews and some website functionality.",
    redirectUrl: "https://support.apple.com/guide/mac-help/guard-your-privacy-mh35847/mac",
    afterImageContent: {
      heading: "How the Privacy & Security Pane Is Organized",
      paragraphs: [
        "Privacy & Security groups permission categories, FileVault, Gatekeeper (App Store & identified developers), Lockdown Mode, and analytics into one pane.",
        "Each permission category shows exactly which apps have requested and been granted access, so nothing is hidden or bundled together.",
        "Security-related settings that affect the whole Mac (like FileVault or Gatekeeper) sit alongside the more granular, per-app permission lists.",
      ],
      steps: [
        "Open System Settings → Privacy & Security.",
        "Scroll through each permission category and review which apps have access.",
        "Check FileVault and Gatekeeper (under 'Security') settings further down the same pane.",
        "Only consider Lockdown Mode if you have a specific, elevated threat concern.",
      ],
    },
    whyItMatters:
      "This single pane is where the majority of meaningful security decisions on a Mac live, from encrypting your entire disk to deciding whether an unsigned app is allowed to run at all. Because every permission category is broken out individually rather than bundled into one general 'privacy' toggle, it's realistic to review and tighten access without losing needed functionality elsewhere. Gatekeeper specifically is your Mac's main defense against accidentally running malicious software downloaded from the internet, and understanding its settings prevents both unsafe overrides and unnecessary frustration when opening a legitimate but unsigned app. Regularly revisiting this pane, rather than only when first prompted, catches permissions apps quietly accumulated over time.",
    bestPractices: [
      "Do a full pass through every permission category at least twice a year, revoking access from apps you no longer use.",
      "Keep Gatekeeper set to its default (App Store and identified developers) rather than a more permissive override, which isn't offered directly in the UI for good reason.",
      "Turn on FileVault if it isn't already, since disk encryption is one of the highest-impact settings in this entire pane.",
      "Only enable Lockdown Mode if you have a specific, credible reason to believe you're a target of sophisticated attacks, given its impact on everyday functionality.",
      "Decide deliberately on Analytics & Improvements sharing rather than leaving the default unexamined, especially on a Mac used for sensitive work.",
    ],
    commonIssues: [
      {
        issue: "An app won't open and macOS warns it's from an unidentified developer.",
        fix: "If you trust the source, Control-click (or right-click) the app and choose Open, then confirm in the dialog — this is Gatekeeper's intended one-time override path rather than a setting to disable broadly.",
      },
      {
        issue: "A once-granted permission (like Full Disk Access) stops working after a macOS update.",
        fix: "Some major updates reset certain sensitive permissions as a safety measure; reopen Privacy & Security, find the relevant category, and re-add or re-enable the app.",
      },
      {
        issue: "Turning on Lockdown Mode broke a feature in Messages or Safari.",
        fix: "This is expected — Lockdown Mode intentionally restricts message attachment previews, some web technologies, and other features; turn it off if the tradeoff isn't worth it for your situation.",
      },
      {
        issue: "Too many apps have accumulated permissions you don't remember granting.",
        fix: "Go category by category (Camera, Microphone, Files & Folders, etc.) and revoke anything from an app you don't recognize or no longer use — access can always be re-granted later if needed.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Privacy & Security here and FileVault specifically?",
        a: "FileVault is one specific feature (whole-disk encryption) that lives inside this broader Privacy & Security pane alongside app permissions, Gatekeeper, and other protections — it's a subsection, not a separate area.",
      },
      {
        q: "Should I turn on Lockdown Mode just to be extra safe?",
        a: "For most people, no — Lockdown Mode is designed for a small number of users facing targeted, sophisticated threats, and it noticeably restricts everyday app functionality in exchange for that extra protection.",
      },
      {
        q: "Does Gatekeeper stop all malware?",
        a: "No, Gatekeeper mainly checks whether an app is signed by a known developer and notarized by Apple, which blocks a lot of casual malware but isn't a complete antivirus solution on its own.",
      },
    ],
    tipsAndTricks: [
      "Use the search field at the top of System Settings and type a permission name (like 'Camera') to jump directly to its section instead of scrolling.",
      "Review the 'Analytics & Improvements' section periodically, since new toggles are sometimes added with macOS updates without much fanfare.",
    ],
    relatedSettingIds: [
      "macos-app-permissions",
      "macos-filevault-encryption",
      "macos-camera-mic-privacy",
    ],
  },
  {
    id: "macos-app-permissions",
    title: "App Permissions",
    icon: KeyRound,
    platform: "macos",
    category: "privacy-permissions",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Individual App Permissions on Mac",
    description:
      "Beyond camera and microphone, macOS tracks separate permissions for things like Full Disk Access, Files & Folders, Automation, Accessibility, and Local Network — each controlling exactly what a specific app is allowed to see or control on your Mac.",
    details: [
      "Full Disk Access lets an app read protected system locations, like Mail data or Time Machine backups, and is only needed by a small set of trusted utilities.",
      "Automation permissions control whether one app is allowed to send commands to another, such as a script controlling Music or Finder.",
      "Accessibility permission lets an app observe or control your Mac (clicks, keystrokes) on your behalf, needed by tools like window managers or remote-control software.",
      "Local Network permission determines whether an app can discover and connect to devices on your home or office network, like a smart-home hub.",
    ],
    important:
      "Full Disk Access and Accessibility are two of the most powerful permissions macOS offers — only grant them to apps you trust completely, since both allow far broader access than camera or microphone permission does.",
    redirectUrl: "https://support.apple.com/guide/mac-help/control-what-you-share-mchl2b29231a/mac",
    afterImageContent: {
      heading: "Understanding the Different Permission Categories",
      paragraphs: [
        "Each permission category under Privacy & Security controls a distinct kind of access, from files to automation to accessibility control.",
        "An app usually requests one of these permissions the first time it needs it, showing a system prompt you can allow or deny.",
        "You can review, grant, or revoke any of these permissions later without needing the app to prompt you again.",
      ],
      steps: [
        "Open System Settings → Privacy & Security.",
        "Scroll to the specific category you want to review — Full Disk Access, Automation, Accessibility, or Local Network.",
        "Toggle access on or off for each listed app.",
        "Restart the app (or your Mac, for Full Disk Access) if a permission change doesn't seem to take effect immediately.",
      ],
    },
    whyItMatters:
      "Permissions like Full Disk Access and Accessibility grant an app extremely broad power over your Mac — far beyond what camera or microphone access allows — so understanding and periodically auditing them is one of the more consequential privacy habits you can build. Automation permission specifically governs whether apps can silently control each other, which is powerful for legitimate scripting and productivity tools but also a route malicious software could exploit if left unchecked. Local Network permission matters increasingly as smart-home and IoT devices multiply, since it determines what your Mac can discover on the network around it. Because many of these permissions are granted once and then forgotten, revisiting them occasionally catches access that's no longer needed.",
    bestPractices: [
      "Grant Full Disk Access only to apps you trust completely, like a well-known backup, security, or system-utility tool.",
      "Review Accessibility permissions periodically, since this category effectively allows an app to see and control your Mac the way you do.",
      "Revoke Automation access between apps you no longer use together, especially script-based tools you tried once and abandoned.",
      "Be selective with Local Network permission for apps that don't have an obvious reason to discover nearby devices.",
      "Restart an app (or your Mac, for Full Disk Access changes) after adjusting a permission if the change doesn't seem to apply right away.",
    ],
    commonIssues: [
      {
        issue: "An app that needs Full Disk Access still can't read certain files after being granted permission.",
        fix: "Quit and reopen the app completely — some apps, and Full Disk Access specifically, only apply the new permission after a fresh launch or a Mac restart.",
      },
      {
        issue: "A script or automation stopped working after a macOS update.",
        fix: "Reopen Privacy & Security → Automation and confirm the sending and receiving apps are both still checked, since major updates occasionally reset these pairings.",
      },
      {
        issue: "An app requests Accessibility access and it's unclear whether it's legitimate.",
        fix: "Only grant Accessibility access if you recognize and trust the app's purpose (like a window manager or remote-control tool), and research unfamiliar apps before approving, since this permission allows broad control over your Mac.",
      },
      {
        issue: "A smart-home or IoT app can't find devices on the network.",
        fix: "Check Privacy & Security → Local Network and confirm the app is allowed, since macOS blocks local network discovery by default until an app is explicitly granted access.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Full Disk Access and regular file permissions?",
        a: "Regular Files & Folders permission is scoped to specific folders (like Desktop or Documents) that an app requests individually, while Full Disk Access grants broad access to nearly everything on the disk, including other apps' protected data.",
      },
      {
        q: "Why does an app need Accessibility permission just to work with keyboard shortcuts?",
        a: "Apps that create custom keyboard shortcuts, window-snapping tools, or remote-control features generally need Accessibility access because that's the system-level mechanism macOS uses to let an app observe or simulate input on your behalf.",
      },
      {
        q: "Can I see a full list of every app with Full Disk Access at once?",
        a: "Yes, Privacy & Security → Full Disk Access shows the complete list of granted apps in one place, making it a good starting point for a periodic permissions review.",
      },
    ],
    tipsAndTricks: [
      "Search 'Full Disk Access' or 'Automation' directly in System Settings' search bar to jump straight to that permission category.",
      "When in doubt about an unfamiliar app requesting Accessibility or Full Disk Access, deny it initially — you can always grant it later if a genuine feature turns out to need it.",
    ],
    relatedSettingIds: [
      "macos-privacy-security-hub",
      "macos-camera-mic-privacy",
      "macos-login-items",
    ],
  },
  {
    id: "macos-language-region",
    title: "Language & Region",
    icon: Languages,
    platform: "macos",
    category: "accessibility-language",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Language & Region Preferences on Mac",
    description:
      "Language & Region settings control which language macOS and your apps display in, plus regional formatting for dates, times, numbers, currency, and the calendar system used system-wide. You can also set different preferred languages per individual app.",
    details: [
      "Add multiple preferred languages and drag them into priority order for apps that support more than one.",
      "Region determines default formatting for dates, currency symbols, measurement units, and the first day of the week.",
      "Calendar type can be changed independently from Gregorian to Japanese, Buddhist, or other supported systems.",
      "Individual apps can be assigned a different display language than the rest of the system under 'Apps' at the bottom of the pane.",
    ],
    important:
      "Changing your primary language requires signing out and back in (or restarting) for the change to fully apply across all open apps.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/change-language-region-settings-on-mac-intl163/mac",
    afterImageContent: {
      heading: "How Language & Region Settings Apply System-Wide",
      paragraphs: [
        "macOS separates 'which language you see' from 'how dates and numbers are formatted,' so you can, for example, use an English interface with European date formatting.",
        "Region also quietly affects things like default paper size and temperature units in supporting apps.",
        "Per-app language overrides live in the same pane, letting one app (like a work tool) stay in a different language than the rest of the system.",
      ],
      steps: [
        "Open System Settings → General → Language & Region.",
        "Click the + under Preferred Languages to add another language, or drag existing ones to reorder priority.",
        "Choose your Region to set default date, number, and currency formatting.",
        "Scroll to 'Apps' to set a different language for a specific app if needed.",
      ],
    },
    whyItMatters:
      "For anyone bilingual, working across countries, or collaborating with international teams, getting language priority and regional formatting right avoids constant friction — misread dates (is 03/04 March 4th or April 3rd?) are a classic source of real scheduling mistakes. Per-app language overrides matter for people who want, say, a work app to match a colleague's language while everything else stays in their preferred one. Because so many apps and system dialogs read directly from this setting, it's one of the more foundational personalization choices on a shared or multilingual Mac.",
    bestPractices: [
      "Order your Preferred Languages list with the language you want interfaces to default to at the very top.",
      "Set Region independently of language if your date, currency, or unit conventions differ from your interface language's typical country.",
      "Use per-app language overrides sparingly, only for the specific apps where it genuinely helps, since it can get confusing with too many exceptions.",
      "Restart affected apps (or the Mac) after a language change instead of assuming it applied instantly everywhere.",
    ],
    commonIssues: [
      {
        issue: "Dates or numbers display in an unexpected format after changing Region.",
        fix: "Some apps cache formatting on launch — quit and reopen the affected app, or restart the Mac, to force it to pick up the new Region setting.",
      },
      {
        issue: "An app still displays in the wrong language after adding a new Preferred Language.",
        fix: "Check whether that specific app is listed under the 'Apps' section with its own override, since a per-app setting takes priority over the system-wide Preferred Languages order.",
      },
      {
        issue: "Keyboard input doesn't match the newly added language.",
        fix: "Adding a Preferred Language doesn't automatically add its keyboard layout — add the corresponding input source separately under Keyboard → Input Sources.",
      },
    ],
    faqs: [
      {
        q: "Can I use my Mac in one language but format dates the way another country does?",
        a: "Yes, Language and Region are independent settings — set your preferred display language in Preferred Languages and choose formatting conventions separately under Region.",
      },
      {
        q: "Do all apps support multiple languages the same way?",
        a: "No, support varies — many Apple and popular third-party apps follow your Preferred Languages list automatically, while others only ever display in one language regardless of this setting.",
      },
      {
        q: "Will changing my language delete any of my files or settings?",
        a: "No, changing Language & Region only affects display and formatting; it doesn't touch your files, though some apps may need a restart to reflect the change.",
      },
    ],
    tipsAndTricks: [
      "Hold down the language priority list order in mind when troubleshooting an app that shows mixed languages, since it usually falls back to the next language down the list for untranslated strings.",
      "Use the calendar type option if you work with a non-Gregorian calendar system regularly, rather than converting dates manually.",
    ],
    relatedSettingIds: [
      "macos-accessibility",
      "macos-keyboard",
      "macos-date-time",
    ],
  },
  {
    id: "macos-date-time",
    title: "Date & Time",
    icon: CalendarClock,
    platform: "macos",
    category: "system-info",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set the Date, Time & Time Zone on Mac",
    description:
      "Date & Time settings keep your Mac's clock accurate by syncing automatically with a network time server, or let you set the date, time, and time zone manually when automatic detection isn't appropriate.",
    details: [
      "'Set time and date automatically' uses a network time server to keep the clock accurate to the second.",
      "Time zone can also be detected automatically based on your current location, or set manually.",
      "Manual time and date entry is available for Macs without reliable internet access.",
      "A 24-hour time format toggle is available separately from the date and time itself.",
      "Menu bar clock display options (like showing the date or seconds) are configured from Control Center settings, not this pane.",
    ],
    important:
      "An incorrect date or time can break certificate validation, causing HTTPS websites, App Store sign-in, or iCloud sync to fail with confusing errors — this is one of the first things worth checking during unexplained login or connectivity problems.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/set-the-date-or-time-mchlp2996/mac",
    afterImageContent: {
      heading: "Keeping Your Mac's Clock Accurate",
      paragraphs: [
        "macOS defaults to automatic time and time zone syncing, which keeps the clock correct without any manual attention.",
        "Automatic time zone detection relies on Location Services, so it can be turned off if you'd rather set the zone manually while traveling.",
        "A manual time server address can be specified for environments (like some corporate networks) that require a specific internal server.",
      ],
      steps: [
        "Open System Settings → General → Date & Time.",
        "Turn on 'Set time and date automatically' and choose a network time server if needed.",
        "Turn on 'Set time zone automatically using current location', or set your time zone manually.",
        "Choose 24-hour time if preferred.",
      ],
    },
    whyItMatters:
      "An accurate system clock underpins far more than the menu bar display — secure connections, App Store and iCloud authentication, calendar invitations, and file timestamps all depend on your Mac's time being correct. A clock that's even a few minutes off can cause HTTPS certificate errors or failed two-factor authentication codes, since both rely on tightly synchronized time between your Mac and the server it's talking to. Automatic time zone detection also saves the easy-to-forget step of manually adjusting your clock after traveling, preventing missed meetings from a stale time zone.",
    bestPractices: [
      "Leave 'Set time and date automatically' turned on unless you have a specific reason (like an isolated network) to set it manually.",
      "Enable automatic time zone detection if you travel regularly, so meeting times adjust correctly without manual intervention.",
      "Double-check the date and time first when troubleshooting HTTPS, App Store, or iCloud sign-in errors, since a wrong clock is a common invisible cause.",
      "Use a corporate-provided time server address if your organization requires one, rather than the public Apple default.",
    ],
    commonIssues: [
      {
        issue: "Websites or the App Store show certificate or security errors.",
        fix: "Check Date & Time settings first — an incorrect clock breaks certificate validation; turn on 'Set time and date automatically' and reconnect to the internet if it's off.",
      },
      {
        issue: "Time zone doesn't update automatically after traveling.",
        fix: "Confirm Location Services is enabled for time zone detection in Privacy & Security → Location Services, since automatic time zone relies on knowing your current location.",
      },
      {
        issue: "'Set time and date automatically' is greyed out and can't be toggled.",
        fix: "This setting can be managed by a Mobile Device Management (MDM) profile on a work or school Mac; contact your IT administrator if you need it changed.",
      },
    ],
    faqs: [
      {
        q: "Why does my Mac need an internet connection to set time automatically?",
        a: "It contacts a network time server to get an accurate reading; without internet access, macOS falls back to whatever time was last set, which can drift over time without correction.",
      },
      {
        q: "Can I show seconds or the date in the menu bar clock?",
        a: "Yes, but that's configured under Control Center settings' Clock options rather than in Date & Time itself, which only governs the underlying time and time zone.",
      },
      {
        q: "Does changing time zone manually affect Calendar events?",
        a: "Events created with a specific time zone attached will still display at the correct local time; only events without an assigned time zone may shift when you change zones manually.",
      },
    ],
    tipsAndTricks: [
      "Option-click the menu bar clock for a quick way to jump straight into Date & Time or Notification Center settings on some macOS versions.",
      "If a specific corporate time server is required, enter its address manually in Date & Time rather than leaving the default Apple server, which some restrictive networks block.",
    ],
    relatedSettingIds: [
      "macos-language-region",
      "macos-about-this-mac",
      "macos-software-update",
    ],
  },
  {
    id: "macos-airdrop-handoff",
    title: "AirDrop & Handoff",
    icon: Share2,
    platform: "macos",
    category: "connectivity-network",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up AirDrop & Handoff on Mac",
    description:
      "AirDrop lets you wirelessly send files, photos, and links directly to nearby Apple devices without email or messaging apps, while Handoff lets you start something on one Apple device — like a browser tab or email draft — and pick it up instantly on your Mac.",
    details: [
      "AirDrop visibility can be set to 'No One,' 'Contacts Only,' or 'Everyone for 10 Minutes' depending on how discoverable you want to be.",
      "AirDrop requires both Wi-Fi and Bluetooth to be turned on, even though the transfer itself doesn't use your internet connection.",
      "Handoff shows a small icon in the Dock (or on the Lock Screen of a nearby device) letting you resume an in-progress task instantly.",
      "Handoff works across Safari tabs, Mail drafts, Maps, Pages, and many other apps that support the feature on both devices.",
    ],
    important:
      "Setting AirDrop to 'Everyone for 10 Minutes' makes your Mac discoverable to any nearby Apple device, not just people you know — it automatically reverts to a more restricted setting after the window closes, but treat it as temporarily public in the meantime.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/change-airdrop-continuity-settings-mchl6a407f99/mac",
    afterImageContent: {
      heading: "How AirDrop & Handoff Work on Mac",
      paragraphs: [
        "AirDrop creates a direct peer-to-peer connection between devices using a combination of Wi-Fi and Bluetooth, so no internet connection or shared network is required.",
        "Handoff relies on being signed in to the same Apple Account with Bluetooth and Wi-Fi enabled on both devices, and both devices need to be near each other.",
        "Both features are grouped under the same General settings pane because they rely on similar proximity and device-discovery technology.",
      ],
      steps: [
        "Open System Settings → General → AirDrop & Handoff.",
        "Choose who can discover your Mac via AirDrop: No One, Contacts Only, or Everyone for 10 Minutes.",
        "Turn on 'Allow Handoff between this Mac and your iCloud devices'.",
        "Make sure Wi-Fi and Bluetooth are both on for either feature to work reliably.",
      ],
    },
    whyItMatters:
      "AirDrop is often the fastest way to move a file or photo between your own devices or share with someone nearby, cutting out the extra steps of emailing yourself a file or uploading to cloud storage first. Handoff removes the friction of context-switching between devices, letting a thought started on your iPhone continue exactly where you left off on your Mac's larger screen. Because both features rely on device discovery, understanding the visibility settings also matters for privacy — an overly permissive AirDrop setting means strangers nearby can see your Mac as a share target.",
    bestPractices: [
      "Set AirDrop visibility to 'Contacts Only' as your default, switching to 'Everyone for 10 Minutes' only when you need to receive from someone not in your contacts.",
      "Keep both Wi-Fi and Bluetooth turned on if you regularly rely on AirDrop or Handoff, since either feature silently fails without both radios active.",
      "Turn off Handoff for a specific app you don't want appearing on other devices, if that app supports granular control, rather than disabling Handoff system-wide.",
      "Sign in to the same Apple Account with two-factor authentication on all your devices, since Handoff and AirDrop's Contacts Only mode both depend on that identity match.",
    ],
    commonIssues: [
      {
        issue: "A nearby device doesn't show up as an AirDrop recipient.",
        fix: "Confirm both devices have Wi-Fi and Bluetooth turned on, aren't in Personal Hotspot mode, and check that AirDrop visibility isn't set to 'No One' on either device.",
      },
      {
        issue: "Handoff icon doesn't appear in the Dock for an in-progress task on another device.",
        fix: "Verify both devices are signed into the same Apple Account, are within roughly 30 feet of each other, and have 'Allow Handoff' turned on in their respective settings.",
      },
      {
        issue: "AirDrop transfer starts but then fails partway through.",
        fix: "Move the devices closer together to improve the Bluetooth/Wi-Fi peer connection, and retry — large files are especially sensitive to interference or distance during an AirDrop transfer.",
      },
    ],
    faqs: [
      {
        q: "Does AirDrop use my internet data?",
        a: "No, AirDrop creates a direct connection between devices using Wi-Fi and Bluetooth radios, so it works even without an internet connection and doesn't count against mobile data.",
      },
      {
        q: "Can I use Handoff between my Mac and someone else's iPhone?",
        a: "No, Handoff only works between devices signed in to the same Apple Account, since it's designed to continue your own activity across your own devices.",
      },
      {
        q: "Is it safe to leave AirDrop set to 'Everyone'?",
        a: "Apple limits 'Everyone' visibility to a 10-minute window specifically because leaving it on indefinitely would make your Mac discoverable to any nearby stranger, not just people you know.",
      },
    ],
    tipsAndTricks: [
      "Drag a file directly onto a recipient's icon in the Finder sidebar's AirDrop section instead of using the Share menu each time.",
      "Look for the small Handoff icon at the left edge of the Dock (near the Trash) to instantly jump into whatever you were doing on another device.",
    ],
    relatedSettingIds: [
      "macos-wifi",
      "macos-bluetooth",
      "macos-apple-id-icloud",
    ],
  },
  {
    id: "macos-screen-sharing",
    title: "Screen Sharing & Remote Login",
    icon: ScreenShare,
    platform: "macos",
    category: "connectivity-network",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Screen Sharing & Remote Login on Mac",
    description:
      "Screen Sharing lets you view and control another Mac's screen remotely (or let someone control yours), while Remote Login enables secure command-line (SSH) access to your Mac from another computer. Both are toggled independently under Sharing settings.",
    details: [
      "Screen Sharing can be limited to specific users or administrators only, rather than allowing all users access.",
      "A Mac being shared shows a small screen-sharing icon in the menu bar while a session is active.",
      "Remote Login uses the SSH protocol and can be restricted to specific user accounts rather than all accounts.",
      "Both features can be turned on temporarily for a single troubleshooting session and turned back off afterward.",
    ],
    important:
      "Turning on Remote Login opens an SSH port that's reachable from your local network (and the wider internet if port-forwarded) — restrict it to specific users and turn it off when not actively needed.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/share-the-screen-of-another-mac-mh14066/mac",
    afterImageContent: {
      heading: "Turning On Screen Sharing & Remote Login",
      paragraphs: [
        "Screen Sharing and Remote Login are both found in the same Sharing settings pane, alongside File Sharing and other network services.",
        "Screen Sharing works over a local network directly, or remotely if paired with a service like Back to My Mac's modern equivalent or a VPN into the network.",
        "Remote Login is aimed at more technical users who need Terminal-based access rather than a full graphical desktop view.",
      ],
      steps: [
        "Open System Settings → General → Sharing.",
        "Turn on Screen Sharing and choose which users are allowed to connect.",
        "Turn on Remote Login separately if you need SSH command-line access, and restrict it to specific users.",
        "Turn either service off again once you no longer need remote access.",
      ],
    },
    whyItMatters:
      "Screen Sharing is one of the fastest ways to help a family member troubleshoot their Mac remotely, or to access your own Mac's full desktop from another Apple device without extra software. Remote Login gives more technical users command-line access for scripting, file transfers, or server-style administration tasks that don't need a full graphical session. Because both features open network-reachable services, understanding exactly who's allowed to connect — and turning them off when not in active use — is an important, often-overlooked security practice.",
    bestPractices: [
      "Restrict Screen Sharing and Remote Login to specific named users rather than 'All users' whenever possible.",
      "Turn off both services when you're not actively using them, rather than leaving them on indefinitely just in case.",
      "Use a strong, unique account password on any Mac with Remote Login enabled, since SSH access is only as secure as the account credentials behind it.",
      "Prefer a VPN or trusted network connection over exposing Remote Login directly to the open internet via port forwarding.",
    ],
    commonIssues: [
      {
        issue: "Can't connect to Screen Sharing from another device on the same network.",
        fix: "Confirm Screen Sharing is turned on under Sharing settings and that the connecting user account is included in the allowed list, then try connecting via Finder → Network or by entering vnc://[Mac's IP address].",
      },
      {
        issue: "SSH connection to Remote Login is refused.",
        fix: "Verify Remote Login is toggled on in Sharing settings, that the specific user attempting to connect is allowed, and that no firewall rule elsewhere on the network is blocking port 22.",
      },
      {
        issue: "Screen Sharing session is very laggy or low quality.",
        fix: "Lower the display quality/color setting within the Screen Sharing app's preferences, and check that both Macs have a strong, stable network connection, since performance depends heavily on bandwidth.",
      },
    ],
    faqs: [
      {
        q: "Is Screen Sharing the same as Messages screen sharing during a call?",
        a: "No, this system-level Screen Sharing is a persistent service you turn on for ongoing remote access, while the screen-sharing option inside a FaceTime or Messages call is a temporary, session-based feature unrelated to this setting.",
      },
      {
        q: "Do I need a static IP address to use Remote Login?",
        a: "Not for local network access, since your Mac's local IP or hostname works fine; reaching it from outside your network requires either a static/reachable address, port forwarding, or a VPN into that network.",
      },
      {
        q: "Can I limit Screen Sharing to just one specific person?",
        a: "Yes, under Sharing settings you can choose 'Only these users' and add specific accounts instead of allowing every user on the Mac to initiate or receive a screen sharing session.",
      },
    ],
    tipsAndTricks: [
      "Connect to another Mac's Screen Sharing directly from Finder's sidebar under 'Network' by double-clicking its name and choosing 'Share Screen'.",
      "Use `ssh username@hostname.local` from Terminal on another Mac for quick Remote Login access without typing a full IP address.",
    ],
    relatedSettingIds: [
      "macos-vpn-network",
      "macos-app-permissions",
      "macos-wifi",
    ],
  },
  {
    id: "macos-recovery-mode",
    title: "macOS Recovery",
    icon: LifeBuoy,
    platform: "macos",
    category: "troubleshooting-diagnostics",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Use macOS Recovery to Repair or Reinstall macOS",
    description:
      "macOS Recovery is a built-in set of utilities for reinstalling macOS, restoring from a Time Machine backup, repairing a damaged disk, and resetting a forgotten password — all accessible without needing a working copy of macOS already running.",
    details: [
      "On Apple silicon Macs, hold the power button at startup until 'Loading startup options' appears, then choose Options.",
      "On Intel Macs, hold Command-R immediately at startup until the Apple logo or a spinning globe appears.",
      "Recovery includes Disk Utility for repairing or erasing disks, a Reinstall macOS option, and a Restore from Time Machine Backup option.",
      "A password reset utility is available from Recovery's Utilities menu for a forgotten login password.",
    ],
    important:
      "Reinstalling macOS from Recovery does not normally erase your files, but running Disk Utility's Erase function does — read each option carefully before confirming, since some Recovery actions are destructive and others aren't.",
    redirectUrl: "https://support.apple.com/en-us/102518",
    afterImageContent: {
      heading: "What You Can Do From macOS Recovery",
      paragraphs: [
        "Recovery boots into a lightweight environment separate from your normal startup disk, which is why it still works even if macOS itself won't start.",
        "Internet Recovery can download a fresh copy of macOS directly from Apple's servers if your local recovery data is damaged or missing.",
        "Some options, like Restore from Time Machine Backup, require an external drive with a valid backup already connected.",
      ],
      steps: [
        "Shut down your Mac completely, then start it back up.",
        "Apple silicon: hold the power button until 'Loading startup options' appears, then click Options. Intel: hold Command-R immediately at startup.",
        "Select your preferred language, then choose a utility from the macOS Utilities window.",
        "Follow the on-screen steps for reinstalling macOS, restoring a backup, or repairing the disk.",
      ],
    },
    whyItMatters:
      "macOS Recovery is the safety net that makes serious troubleshooting possible even when the Mac won't start up normally — without it, a corrupted system install could mean a trip to a repair shop instead of a self-service fix at home. Disk Utility's First Aid tool inside Recovery can catch and repair disk errors that cause crashes or won't-boot situations before they get worse. Because Recovery works independently of your normal startup disk, it's also the standard path for erasing a Mac properly before selling it, or reinstalling macOS entirely after a serious software problem.",
    bestPractices: [
      "Keep a current Time Machine backup so Recovery's 'Restore from Time Machine Backup' option is actually usable if you ever need it.",
      "Run Disk Utility's First Aid from Recovery at the first sign of repeated freezes or crashes, before assuming a full reinstall is necessary.",
      "Know your Apple Account password before relying on Recovery, since reinstalling macOS or turning off Find My both require authentication.",
      "Stay on stable power (or a charged battery) throughout any Recovery-based repair or reinstall, since interrupting it can leave the Mac in a worse state.",
    ],
    commonIssues: [
      {
        issue: "Mac won't boot into Recovery Mode at all.",
        fix: "On Apple silicon Macs, force a shutdown and try again, holding the power button specifically until 'Loading startup options' appears; on Intel Macs, try Internet Recovery with Option-Command-R if standard Command-R doesn't work.",
      },
      {
        issue: "Disk Utility in Recovery shows the startup disk as greyed out or unavailable.",
        fix: "Select the disk's parent container (not just the volume) in Disk Utility's sidebar, and if it still won't mount, this can indicate a hardware-level drive failure needing professional repair.",
      },
      {
        issue: "Reinstalling macOS from Recovery gets stuck or fails partway through.",
        fix: "Confirm a stable internet connection (reinstalling downloads macOS fresh in most cases), keep the Mac plugged in, and retry — a flaky Wi-Fi connection is the most common cause of a stalled reinstall.",
      },
    ],
    faqs: [
      {
        q: "Will using macOS Recovery erase my files?",
        a: "Reinstalling macOS through Recovery typically preserves your files, but using Disk Utility's Erase option inside Recovery does wipe the disk — read each option's description carefully before proceeding.",
      },
      {
        q: "Can I reset a forgotten login password from Recovery?",
        a: "Yes, macOS Utilities in Recovery includes a password reset option, though it may require Apple Account verification depending on your account setup.",
      },
      {
        q: "What's the difference between local Recovery and Internet Recovery?",
        a: "Local Recovery uses a hidden recovery partition already on your disk, while Internet Recovery downloads a fresh copy directly from Apple's servers — useful if local recovery data is missing or damaged.",
      },
    ],
    tipsAndTricks: [
      "Use Disk Utility's First Aid from Recovery periodically if you notice recurring beachballs or crashes, even before things get bad enough to need a reinstall.",
      "On Apple silicon Macs, Recovery also offers a 'Revert to previous macOS' style path in some situations if a fresh install is preferred over an in-place repair — check the available options in the Utilities window.",
    ],
    relatedSettingIds: [
      "macos-erase-reset-mac",
      "macos-time-machine-backup",
      "macos-activation-lock",
    ],
  },
  {
    id: "macos-activation-lock",
    title: "Activation Lock (Find My Mac)",
    icon: ShieldAlert,
    platform: "macos",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Understand Activation Lock on Mac",
    description:
      "Activation Lock automatically protects your Mac the moment Find My Mac is turned on, requiring your Apple Account password or device passcode before anyone can turn off Find My, erase the Mac, or reactivate it after an erase — making a lost or stolen Mac far less useful to whoever has it.",
    details: [
      "Activation Lock is available on Macs with Apple silicon or a T2 Security Chip, running macOS Catalina or later.",
      "It turns on automatically as soon as Find My Mac is enabled — there's no separate toggle to switch on independently.",
      "Two-factor authentication must be enabled on the Apple Account for Activation Lock to be active.",
      "Removing a sold or given-away Mac from your device list at iCloud.com or via Find My clears Activation Lock for the next owner.",
    ],
    important:
      "If you sell, trade in, or give away a Mac without removing it from your Apple Account's device list first, the next owner will be stuck at an Activation Lock screen they cannot bypass without your credentials.",
    redirectUrl: "https://support.apple.com/en-us/102541",
    afterImageContent: {
      heading: "How Activation Lock Protects a Lost or Stolen Mac",
      paragraphs: [
        "Activation Lock ties a Mac's activation status directly to your Apple Account, independent of whether the drive has been erased.",
        "Even a full erase and macOS reinstall doesn't remove Activation Lock — only signing out properly or removing the device from your account does.",
        "Apple can assist with disabling Activation Lock for the rightful owner if proof of purchase is provided and self-service options aren't available.",
      ],
      steps: [
        "Open System Settings → [Your Name] → iCloud, and confirm Find My Mac is turned on to activate the lock automatically.",
        "Before selling or giving away a Mac, use Erase All Content and Settings, which signs out of Find My as part of the process.",
        "If a Mac wasn't signed out first, remove it from Devices at iCloud.com/find using its original Apple Account.",
        "A new owner enters the original owner's Apple Account credentials at setup only if Activation Lock wasn't cleared beforehand.",
      ],
    },
    whyItMatters:
      "Activation Lock is one of the strongest deterrents against Mac theft, because it makes a stolen device essentially worthless to resell or reactivate without the original owner's credentials. Unlike a simple password, it survives a full disk erase and macOS reinstall, so wiping the Mac doesn't remove the protection the way it would with older, less secure systems. For legitimate buyers of a used Mac, understanding Activation Lock is equally important, since a Mac stuck at this screen from a previous owner who didn't remove it properly can be effectively unusable without their cooperation.",
    bestPractices: [
      "Keep Find My Mac turned on continuously so Activation Lock stays active in case of loss or theft.",
      "Always use 'Erase All Content and Settings' (not just a manual disk erase) before selling, trading in, or gifting a Mac, since it properly signs out of Find My.",
      "Double-check Devices at iCloud.com after selling a Mac to confirm it's been removed from your account, especially if you skipped the built-in erase flow.",
      "Ask for proof that Activation Lock has been cleared before buying a used Mac, ideally by seeing the seller remove it from their account in your presence.",
    ],
    commonIssues: [
      {
        issue: "A newly purchased used Mac is stuck asking for a previous owner's Apple Account.",
        fix: "Contact the previous owner and ask them to remove the Mac from their Devices list at iCloud.com/find, since only they (or Apple, with proof of purchase) can clear it.",
      },
      {
        issue: "Forgot which Apple Account is locking a Mac after a factory reset.",
        fix: "Check any documentation, receipts, or purchase records tied to the Mac to identify the account, since Activation Lock provides limited hints about the original account on-screen for privacy reasons.",
      },
      {
        issue: "Erased a Mac before removing it from Find My, and it's now locked.",
        fix: "Sign in with the same Apple Account credentials used before erasing to complete setup normally — the Mac isn't actually locked to a stranger's account, it's simply asking you to confirm it's still you.",
      },
    ],
    faqs: [
      {
        q: "Does erasing a Mac remove Activation Lock?",
        a: "No, a disk erase alone doesn't clear Activation Lock — only properly signing out of Find My (which 'Erase All Content and Settings' does automatically) or removing the device from your Apple Account does.",
      },
      {
        q: "Can I turn on Activation Lock without turning on Find My Mac?",
        a: "No, Activation Lock isn't a separate toggle — it activates automatically the moment Find My Mac is turned on, and turns off only when Find My Mac is turned off or removed.",
      },
      {
        q: "What if I buy a used Mac and the seller is unreachable to remove Activation Lock?",
        a: "Apple can help disable Activation Lock if you have valid proof of purchase for that specific Mac, though the process can take time and isn't guaranteed without adequate documentation.",
      },
    ],
    tipsAndTricks: [
      "Check a used Mac's Activation Lock status before buying by looking up its serial number, since some third-party checker tools can flag a locked device in advance.",
      "Remove a Mac from Find My immediately after completing a sale, rather than waiting, to avoid forgetting the step later.",
    ],
    relatedSettingIds: [
      "macos-apple-id-icloud",
      "macos-erase-reset-mac",
      "macos-privacy-security-hub",
    ],
  },
  {
    id: "macos-about-this-mac",
    title: "About This Mac",
    icon: Info,
    platform: "macos",
    category: "system-info",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "View System Information in About This Mac",
    description:
      "About This Mac (accessible from the Apple menu) shows your Mac's model, chip or processor, memory, macOS version, and serial number at a glance, plus a detailed system report and storage breakdown for deeper troubleshooting.",
    details: [
      "The Overview tab shows macOS version, chip/processor, memory (RAM), and serial number in one summary screen.",
      "The Displays tab lists connected monitors and their resolutions.",
      "The Storage tab shows a visual breakdown of what's using space, similar to General → Storage in System Settings.",
      "'System Report' (via the More Info button) opens a full technical inventory of hardware, network, and software details.",
    ],
    important:
      "Your serial number and exact macOS build number, both needed for many support and warranty interactions, are found here — it's worth knowing this location before you need it urgently.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/view-about-settings-mchlea7173f3/mac",
    afterImageContent: {
      heading: "What Each Tab in About This Mac Shows",
      paragraphs: [
        "Clicking the Apple menu and choosing 'About This Mac' opens a quick-reference window before you'd need to dig into System Settings at all.",
        "The System Report accessed from here provides far more technical detail than the summary window, useful for AppleCare calls or advanced diagnostics.",
        "Storage and Displays tabs mirror similar information available elsewhere in System Settings, gathered here for convenience.",
      ],
      steps: [
        "Click the Apple menu in the top-left corner of the screen.",
        "Choose 'About This Mac'.",
        "Review the Overview tab for chip, memory, and macOS version, or switch tabs for Displays and Storage.",
        "Click 'More Info…' or 'System Report' for the full technical detail view.",
      ],
    },
    whyItMatters:
      "About This Mac is the fastest way to answer the exact questions AppleCare, a repair technician, or a piece of software's system requirements page will ask: which chip, how much memory, which macOS version, and the serial number. Knowing where to find this quickly matters most in stressful moments, like verifying warranty status after a hardware problem or checking compatibility before a major purchase or upgrade. The Storage tab also gives a fast visual sense of what's filling up your disk without navigating deeper into System Settings.",
    bestPractices: [
      "Check 'About This Mac' before contacting support so you already have your serial number, model, and macOS version ready.",
      "Use the Storage tab as a quick first check when your disk feels full, before diving into deeper storage management tools.",
      "Note your exact macOS version and build number here when troubleshooting a bug, since some issues are specific to a particular build.",
      "Keep a note of your serial number somewhere accessible (like a password manager) in case your Mac is ever lost, stolen, or needs warranty service.",
    ],
    commonIssues: [
      {
        issue: "Can't remember where to find the Mac's serial number.",
        fix: "Open the Apple menu → About This Mac; the serial number is listed directly in the Overview tab, and can also be copied by right-clicking or Control-clicking it.",
      },
      {
        issue: "About This Mac shows an older macOS version than expected after an update.",
        fix: "Restart the Mac if you haven't since installing the update, since the version shown won't reflect an update that's downloaded but not yet applied with a restart.",
      },
      {
        issue: "Storage tab in About This Mac shows different numbers than Finder's 'Get Info' on the disk.",
        fix: "This is expected — About This Mac's Storage tab accounts for purgeable space and system data differently than a simple Finder disk size, so small discrepancies are normal.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between About This Mac and System Report?",
        a: "About This Mac gives a quick summary of the essentials (chip, memory, macOS version), while System Report (opened via 'More Info…') provides an exhaustive technical inventory of hardware, software, and network details.",
      },
      {
        q: "How do I check if my Mac is still covered under AppleCare or warranty?",
        a: "Note your serial number from About This Mac's Overview tab, then check coverage status at Apple's official Check Coverage page using that serial number.",
      },
      {
        q: "Does About This Mac show my exact macOS build number, not just the version?",
        a: "Yes, clicking the version number in the Overview tab reveals the specific build number, useful when a bug or compatibility issue is tied to a particular build rather than the general release.",
      },
    ],
    tipsAndTricks: [
      "Click directly on the macOS version number in About This Mac's Overview tab to cycle through and reveal the build number and serial number in place.",
      "Right-click (or Control-click) the serial number in About This Mac to quickly copy it without retyping.",
    ],
    relatedSettingIds: [
      "macos-storage-management",
      "macos-software-update",
      "macos-date-time",
    ],
  },
  {
    id: "macos-storage-management",
    title: "Storage Management",
    icon: HardDrive,
    platform: "macos",
    category: "storage-backup-data",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage and Optimize Storage on Mac",
    description:
      "Storage settings show a visual breakdown of exactly what's using space on your Mac's disk, plus built-in recommendations — like storing files in iCloud or automatically emptying the Trash — to free up space without manually hunting for large files yourself.",
    details: [
      "A colored bar chart breaks down storage usage by category: Apps, Documents, Photos, System Data, and more.",
      "'Store in iCloud' can offload older files, photos, and Messages attachments while keeping them accessible on demand.",
      "'Empty Trash Automatically' permanently removes items from Trash after they've sat there for 30 days.",
      "Clicking into any category shows the individual large files or apps contributing to it, so you can review before deleting.",
    ],
    important:
      "'System Data' can appear surprisingly large and isn't fully user-deletable — it includes caches, logs, and support files that mostly shrink on their own over time rather than through direct manual deletion.",
    redirectUrl:
      "https://support.apple.com/guide/mac-help/optimize-storage-space-sysp4ee93ca4/mac",
    afterImageContent: {
      heading: "Freeing Up Storage Space on Mac",
      paragraphs: [
        "The Storage pane calculates usage by scanning your disk, which can take a moment to fully populate when first opened.",
        "Recommendations are personalized based on what's actually taking up the most space on your specific Mac.",
        "Reviewing large files directly (rather than relying only on automatic recommendations) often reveals old downloads or duplicate files worth deleting manually.",
      ],
      steps: [
        "Open System Settings → General → Storage.",
        "Wait for the bar chart to finish calculating your Mac's current usage.",
        "Review the Recommendations section and turn on options like 'Store in iCloud' or 'Empty Trash Automatically'.",
        "Click into individual categories (like Documents or Apps) to review and remove specific large files.",
      ],
    },
    whyItMatters:
      "Running low on disk space can slow down an entire Mac, since macOS needs free space for virtual memory swapping, temporary files, and software updates — a nearly full disk often manifests as general sluggishness rather than an obvious storage warning. The Storage pane turns an otherwise tedious manual hunt for space-hogging files into a guided, visual process with built-in one-click recommendations. Understanding categories like System Data also prevents the common mistake of assuming that number represents deletable junk, when much of it is caches and support files macOS manages on its own.",
    bestPractices: [
      "Turn on 'Store in iCloud' if you have available iCloud storage and want older files automatically offloaded while staying accessible on demand.",
      "Review large individual files in the Documents and Downloads categories periodically rather than waiting until the disk is nearly full.",
      "Enable 'Empty Trash Automatically' so deleted files don't silently continue occupying space for months in the Trash.",
      "Don't try to manually clear 'System Data' with third-party cleaner apps — most of it is managed automatically by macOS and shrinks on its own over time.",
    ],
    commonIssues: [
      {
        issue: "'System Data' shows an unusually large and growing amount of space used.",
        fix: "This is often temporary system caches, logs, or a stuck update file; restart the Mac, keep it updated, and check again after a few days rather than trying to manually delete files in this category.",
      },
      {
        issue: "Storage bar chart doesn't add up to the total disk capacity.",
        fix: "Some space is reserved for macOS itself and purgeable content that's counted differently; this discrepancy is expected and isn't a sign of a problem.",
      },
      {
        issue: "Deleted large files but available storage didn't increase.",
        fix: "Empty the Trash manually (or wait for automatic emptying) since files aren't actually freed until removed from Trash, and some apps store their own separate caches that need clearing within the app itself.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between this Storage pane and About This Mac's Storage tab?",
        a: "They show largely the same underlying data — About This Mac's Storage tab is a quick-glance version, while General → Storage provides the fuller breakdown with actionable recommendations.",
      },
      {
        q: "Is it safe to turn on 'Store in iCloud' for Photos and Documents?",
        a: "Yes, it keeps a smaller local copy while the full-resolution or full file stays in iCloud, downloading automatically on demand when you open it — you'll need enough iCloud storage and an internet connection to access offloaded files.",
      },
      {
        q: "Why does 'System Data' take up so much space right after a big macOS update?",
        a: "Update-related caches and installer leftovers temporarily inflate this category; it typically shrinks on its own within a few days as macOS cleans up automatically.",
      },
    ],
    tipsAndTricks: [
      "Click directly into a storage category's bar segment to jump straight to a sortable list of the largest files within it.",
      "Check the Storage pane right after a major macOS upgrade if space seems tight, since temporary installer files are a common, self-resolving cause.",
    ],
    relatedSettingIds: [
      "macos-about-this-mac",
      "macos-time-machine-backup",
      "macos-apple-id-icloud",
    ],
  },
  // --- 20 additional macOS entries: rounding out Accounts & Family, System
  // Updates, Storage & Backup, System Info, Accessibility & Language, and
  // Troubleshooting & Diagnostics to match native System Settings' depth ---
{
    id: "macos-family-sharing",
    title: "Family Sharing",
    icon: Users,
    platform: "macos",
    category: "accounts-sync-family",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "Open Family Sharing",
    heading: "Share Subscriptions & Purchases With Family",
    description:
      "Family Sharing links up to six Apple IDs into one group so everyone can share iCloud+ storage, App Store and iTunes purchases, and subscriptions like Apple Music, Apple TV+, and Apple Arcade — without sharing passwords. It also gives parents tools like Ask to Buy and Screen Time to manage what kids can access.",
    details: [
      "Share one iCloud+ storage plan across the whole family group instead of buying separate plans.",
      "Turn on Ask to Buy so a child's purchase or download requires a parent's approval first.",
      "Share a family photo album, shared calendar, and Find My locations automatically.",
      "Add or remove family members, or leave the group, from System Settings at any time.",
    ],
    important:
      "You can belong to only one Family Sharing group at a time, and the organizer's payment method is charged for everyone's shared purchases.",
    redirectUrl: "https://support.apple.com/en-us/HT201060",
    afterImageContent: {
      heading: "How Family Sharing Works",
      paragraphs: [
        "One adult acts as the family organizer, invites up to five other people, and their payment method is used for all shared purchases and subscriptions billed to the group.",
        "Each family member keeps their own Apple ID, apps, and personal data — Family Sharing only shares the specific items you choose to turn on, like purchases, storage, or location.",
      ],
      steps: [
        "Open System Settings → [your name] → Family Sharing.",
        "Click 'Add Member' and invite them by email or set up a child account.",
        "Choose which features to share: purchases, iCloud+ storage, location, or a shared calendar.",
        "Turn on 'Ask to Buy' for any child members who need purchase approval.",
      ],
    },
    whyItMatters:
      "Family Sharing avoids paying for the same subscriptions and storage plans multiple times across a household, and it gives parents real oversight over what children buy and how much time they spend on apps. Losing track of who's in your family group or which payment method is attached can lead to surprise charges, so it's worth reviewing periodically.",
    bestPractices: [
      "Review shared purchases and storage usage occasionally so the organizer isn't surprised by the bill.",
      "Set up Ask to Buy for every child in the group, not just younger kids.",
      "Confirm the family organizer role is assigned to someone who'll keep the group's payment method current.",
    ],
    commonIssues: [
      {
        issue: "An invited family member never receives the invitation.",
        fix: "Ask them to check the Mail app and Messages for the invite, confirm their Apple ID email is correct, or resend the invite from Family Sharing settings.",
      },
      {
        issue: "Purchased apps or subscriptions aren't showing up for a family member.",
        fix: "Confirm 'Share My Purchases' is turned on for that person and that they've signed out and back into the App Store on their device.",
      },
    ],
    faqs: [
      {
        q: "Does everyone in the family see each other's photos and messages?",
        a: "No — only the specific shared album, calendar, and location you enable are visible; personal photos, messages, and app data stay private to each Apple ID.",
      },
      {
        q: "Can a child leave Family Sharing on their own?",
        a: "No, only the family organizer or a parent/guardian member can remove a child account from the group.",
      },
    ],
    tipsAndTricks: [
      "Use the shared Family calendar for household events so everyone sees updates automatically without a separate invite.",
    ],
    relatedSettingIds: ["macos-apple-id-icloud", "macos-users-groups", "macos-internet-accounts"],
  },
  {
    id: "macos-internet-accounts",
    title: "Internet Accounts",
    icon: Mail,
    platform: "macos",
    category: "accounts-sync-family",
    controlType: "action",
    actionLabel: "Open Internet Accounts",
    heading: "Manage Mail, Contacts & Calendar Accounts",
    description:
      "Internet Accounts is where you add non-Apple email, contacts, and calendar accounts — like Google, Microsoft Exchange, Yahoo, or a standard IMAP account — so they sync into Mail, Contacts, Calendar, and Notes. It's separate from your Apple ID and handles every other account you use on the Mac.",
    details: [
      "Add Google, Microsoft Exchange, Yahoo, or generic IMAP/CardDAV/CalDAV accounts.",
      "Choose exactly which apps each account syncs to — Mail, Contacts, Calendar, Notes, or Reminders.",
      "Temporarily disable an account without deleting it by turning off its toggle.",
      "Remove an account entirely, which also removes its synced data from this Mac.",
    ],
    redirectUrl: "https://support.apple.com/guide/mac-help/welcome/mac",
    afterImageContent: {
      heading: "How Internet Accounts Syncing Works",
      paragraphs: [
        "Once you add an account, macOS periodically syncs its mail, events, and contacts in the background so they stay current across Mail, Calendar, and Contacts without manual refreshing.",
        "Each account can be scoped independently — for example, syncing a work account's calendar but not its contacts — which keeps unrelated data out of apps where you don't want it.",
      ],
      steps: [
        "Open System Settings → Internet Accounts.",
        "Click 'Add Account' and choose the account type (Google, Exchange, Yahoo, or Other).",
        "Sign in and grant macOS permission to access the account.",
        "Toggle which apps (Mail, Contacts, Calendar, Notes) should sync with that account.",
      ],
    },
    whyItMatters:
      "This is the single control panel for every non-Apple account feeding your Mac's built-in apps, so a misconfigured or duplicated account here is the most common reason mail stops arriving or calendar events go missing. Keeping it tidy also limits what data third-party or work accounts can see on a personal Mac.",
    bestPractices: [
      "Turn off syncing for apps you don't use with a given account instead of leaving everything on by default.",
      "Remove accounts you no longer use rather than just disabling them, to avoid stale sync conflicts.",
      "For work or school accounts, only enable the specific data types your organization requires.",
    ],
    commonIssues: [
      {
        issue: "New mail or calendar invites from an account stop appearing.",
        fix: "Open System Settings → Internet Accounts, select the account, and confirm Mail/Calendar is still toggled on; re-enter the password if it shows an error.",
      },
      {
        issue: "Removing an account also deletes contacts or calendars you wanted to keep.",
        fix: "Export contacts or calendars first, or keep the account added but turn off only the app syncing you don't want, rather than deleting the account outright.",
      },
    ],
    faqs: [
      {
        q: "Is my Apple ID's iCloud Mail managed here too?",
        a: "No, iCloud is managed under System Settings → [your name] → iCloud; Internet Accounts is specifically for non-Apple accounts like Google or Exchange.",
      },
      {
        q: "Can I add more than one Google or Exchange account?",
        a: "Yes, you can add multiple accounts of the same type, and each shows up separately in Mail, Contacts, and Calendar.",
      },
    ],
    tipsAndTricks: [
      "If a work Exchange account requires periodic re-authentication, re-enter it here rather than deleting and re-adding the whole account.",
    ],
    relatedSettingIds: ["macos-apple-id-icloud", "macos-general-apps", "macos-family-sharing"],
  },
  {
    id: "macos-users-groups",
    title: "Users & Groups",
    icon: UsersRound,
    platform: "macos",
    category: "accounts-sync-family",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "Open Users & Groups",
    heading: "Add & Manage Accounts On This Mac",
    description:
      "Users & Groups lets you create additional accounts for other people who use this Mac, decide whether each one is an administrator or a standard user, and organize accounts into groups for permission purposes. It's the foundation for keeping multiple people's files and settings separate on a shared Mac.",
    details: [
      "Create standard, administrator, or Sharing Only user accounts.",
      "Set up a Guest User account that doesn't require a password and clears its data on logout.",
      "Choose which apps and content a managed or child account can access.",
      "Configure automatic login for a specific user account at startup.",
    ],
    important:
      "Every Mac needs at least one administrator account — don't demote the only admin account to standard, or you can lock yourself out of key settings.",
    redirectUrl: "https://support.apple.com/guide/mac-help/welcome/mac",
    afterImageContent: {
      heading: "How User Accounts Work on Mac",
      paragraphs: [
        "Each user account gets its own home folder, desktop, documents, and app preferences, so multiple people can share one Mac without seeing each other's files.",
        "Administrator accounts can install software, change system-wide settings, and manage other users; standard accounts can use the Mac but need an admin password for system-level changes.",
      ],
      steps: [
        "Open System Settings → Users & Groups.",
        "Click 'Add Account' and choose the account type.",
        "Enter a name, account name, and password for the new user.",
        "Set the account's permission level (Standard or Administrator) and click 'Create User'.",
      ],
    },
    whyItMatters:
      "Giving each person their own account keeps files, browser history, and settings private on a shared Mac, and limiting most accounts to standard permissions reduces the damage malware or accidental changes can do. A Mac with only one shared admin account for the whole household is much easier to misconfigure or compromise.",
    bestPractices: [
      "Keep only one or two administrator accounts and make everyone else a standard user.",
      "Use Screen Time and content restrictions on child accounts instead of sharing an adult's login.",
      "Remove accounts for people who no longer use the Mac rather than leaving them dormant.",
    ],
    commonIssues: [
      {
        issue: "A standard user can't install an app or change a system setting.",
        fix: "This is expected — have an administrator enter their password when prompted, or temporarily grant the user admin rights in Users & Groups if appropriate.",
      },
      {
        issue: "Deleting a user account asks whether to keep their home folder.",
        fix: "Choose 'Keep the home folder' if you might need their files later, or save it as a disk image; only choose delete if you're certain the data isn't needed.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between a standard and administrator account?",
        a: "Administrators can install software, change system-wide settings, and manage other user accounts, while standard users can use installed apps and personal settings but need an admin password for system-level changes.",
      },
      {
        q: "Can two people be logged in at the same time?",
        a: "Yes, macOS supports Fast User Switching, which keeps one user's session running in the background while another logs in.",
      },
    ],
    tipsAndTricks: [
      "Enable Fast User Switching from the menu bar to jump between accounts without fully logging out.",
    ],
    relatedSettingIds: ["macos-sign-in-password", "macos-login-items", "macos-family-sharing"],
  },
  {
    id: "macos-sign-in-password",
    title: "Password & Sign-in",
    icon: Fingerprint,
    platform: "macos",
    category: "accounts-sync-family",
    frequentlyUsed: true,
    recommended: true,
    controlType: "action",
    actionLabel: "Open Password & Sign-in Settings",
    heading: "Change Your Password & Sign-in Method",
    description:
      "This settings area covers your Mac account password, Touch ID fingerprint enrollment, and AutoFill for passwords and passkeys saved in your keychain. It's where you change your login password and decide how quickly Touch ID or a password is required to unlock the Mac.",
    details: [
      "Change the password used to log into and unlock this Mac.",
      "Enroll up to three fingerprints for Touch ID on supported Macs.",
      "Turn on AutoFill so saved passwords and passkeys fill in automatically in apps and Safari.",
      "See which apps and websites are allowed to use Touch ID or your password for sign-in.",
    ],
    important:
      "If you forget your account password and don't have FileVault recovery options set up, you can permanently lose access to your files.",
    redirectUrl: "https://support.apple.com/guide/mac-help/welcome/mac",
    afterImageContent: {
      heading: "How Sign-in & Password Settings Work",
      paragraphs: [
        "Your account password unlocks the Mac, authorizes system changes, and is tied to keychain encryption, so changing it updates how your saved passwords are protected too.",
        "Touch ID (on supported Macs and keyboards) lets you unlock the Mac, approve purchases, and authenticate in apps without typing your password each time, while still falling back to the password when needed.",
      ],
      steps: [
        "Open System Settings → [your name] → Sign-in & Security (or Touch ID & Password on supported models).",
        "Click 'Change Password' and enter your current and new password.",
        "Under Touch ID, click 'Add Fingerprint' and follow the prompts to enroll.",
        "Review which actions (unlock, Apple Pay, password AutoFill) Touch ID is allowed to approve.",
      ],
    },
    whyItMatters:
      "Your login password is the last line of defense protecting every file, saved credential, and encrypted volume on your Mac, so a weak or reused password undermines every other security setting. Touch ID makes strong security practical day to day by removing the friction of typing a long password repeatedly.",
    bestPractices: [
      "Use a unique, strong password rather than reusing one from another account or service.",
      "Enroll Touch ID if your Mac supports it so you're not tempted to use a weaker, easier-to-type password.",
      "Store your password's hint or a recovery method somewhere safe rather than relying on memory alone.",
    ],
    commonIssues: [
      {
        issue: "Touch ID stops recognizing a fingerprint reliably.",
        fix: "Delete the fingerprint entry and re-enroll it, making sure your finger fully covers the sensor and the surface is clean and dry.",
      },
      {
        issue: "Forgot the account password and can't log in.",
        fix: "Use your Apple ID to reset it at the login screen if enabled, or boot into Recovery Mode and use Reset Password from the Utilities menu.",
      },
    ],
    faqs: [
      {
        q: "Does changing my Mac password change my Apple ID password too?",
        a: "No, they're separate unless you specifically set your Mac account to use your Apple ID password for login.",
      },
      {
        q: "Is Touch ID data stored anywhere Apple or apps can access it?",
        a: "No, fingerprint data is stored only in the Secure Enclave on your Mac and never leaves the device or gets shared with apps or Apple.",
      },
    ],
    tipsAndTricks: [
      "Use the Keychain Access app to review or clean up saved passwords tied to your account.",
    ],
    relatedSettingIds: ["macos-users-groups", "macos-lock-screen", "macos-filevault-encryption"],
  },
  {
    id: "macos-automatic-updates",
    title: "Automatic Updates",
    icon: RefreshCw,
    platform: "macos",
    category: "system-updates",
    recommended: true,
    controlType: "toggle",
    actionLabel: "Open Automatic Update Options",
    heading: "Control How Updates Install Automatically",
    description:
      "This is the set of individual toggles inside Software Update that decide whether macOS checks for updates, downloads them, and installs security responses, system files, and app updates without asking you each time. You can automate the whole pipeline or keep manual approval at any step.",
    details: [
      "Toggle 'Check for updates' to control whether macOS looks for new updates in the background.",
      "Toggle 'Download new updates when available' to pre-fetch updates before you approve installing them.",
      "Toggle automatic installation separately for macOS updates, app updates, and security responses.",
      "Security responses and system files can be set to install immediately without waiting for a restart.",
    ],
    redirectUrl: "https://support.apple.com/en-us/108382",
    afterImageContent: {
      heading: "How Automatic Update Settings Work",
      paragraphs: [
        "Each automatic update option is independent, so you can, for example, let critical security responses install instantly while still manually approving major macOS version upgrades.",
        "Even with everything automated, major upgrades still show a notification and generally wait for you to restart, since they can take significant time to install.",
      ],
      steps: [
        "Open System Settings → General → Software Update.",
        "Click the info button (ⓘ) next to 'Automatic Updates'.",
        "Turn on or off each option: check, download, install macOS updates, install app updates, install security responses.",
        "Close the panel — changes apply immediately.",
      ],
    },
    whyItMatters:
      "Automating security-critical updates closes the window between a vulnerability being disclosed and your Mac being protected, which matters most for security responses that patch actively exploited issues. Leaving everything manual is fine for control, but it only helps if you actually remember to check regularly.",
    bestPractices: [
      "Keep 'Install Security Responses and system files' turned on even if you prefer manual control over macOS version upgrades.",
      "Leave 'Check for updates' on at minimum so you're notified promptly even if you install manually.",
      "Review update settings after a major macOS upgrade, since some options can reset to defaults.",
    ],
    commonIssues: [
      {
        issue: "Automatic updates seem to never actually install.",
        fix: "Confirm the Mac isn't set to sleep overnight (updates often install while idle and connected to power), and check that all four automatic toggles are enabled.",
      },
      {
        issue: "An update installed automatically at an inconvenient time.",
        fix: "Turn off automatic installation for macOS updates specifically while keeping security responses automated, so major installs wait for your approval.",
      },
    ],
    faqs: [
      {
        q: "Do automatic updates require my Mac to be plugged in?",
        a: "Larger downloads and installs generally happen more reliably on power and Wi-Fi, but macOS will still check and download on battery in most cases.",
      },
      {
        q: "Can I automate security patches without automating full macOS version upgrades?",
        a: "Yes — the 'Install Security Responses and system files' toggle is separate from the 'Install macOS updates' toggle, so you can automate one without the other.",
      },
    ],
    tipsAndTricks: [
      "Run `softwareupdate --schedule on` in Terminal to enable automatic checking from the command line on managed Macs.",
    ],
    relatedSettingIds: ["macos-software-update", "macos-rapid-security-response", "macos-update-history"],
  },
  {
    id: "macos-update-history",
    title: "Update History",
    icon: History,
    platform: "macos",
    category: "system-updates",
    controlType: "action",
    actionLabel: "View Update History",
    heading: "See Every Update Installed On This Mac",
    description:
      "Update History lists every macOS update, security response, and Apple software update that has ever been installed on this Mac, along with the date and version number. It's the fastest way to confirm exactly what's been patched and when.",
    details: [
      "Shows the name, version number, and install date of every past update.",
      "Includes major macOS upgrades, minor updates, and Rapid Security Responses.",
      "Useful for confirming a specific security patch was actually applied.",
      "Read-only — you can't reinstall or remove past updates from this list.",
    ],
    redirectUrl: "https://support.apple.com/en-us/108382",
    afterImageContent: {
      heading: "How Update History Works",
      paragraphs: [
        "Every time Software Update completes an installation, macOS logs it with a timestamp, so Update History builds an ongoing, permanent record for that Mac.",
        "This log is separate from the App Store's 'Purchased' or update history, and only covers system-level macOS and Apple software updates.",
      ],
      steps: [
        "Open System Settings → General → Software Update.",
        "Click the info button (ⓘ) next to 'Automatic Updates', or scroll to find 'Update History'.",
        "Click 'Update History' to see the full list.",
        "Scroll through entries to confirm the date a specific update installed.",
      ],
    },
    whyItMatters:
      "When troubleshooting a problem that started 'after an update,' Update History lets you pinpoint exactly which update and date to investigate instead of guessing. It's also useful evidence when confirming compliance with a required security patch level for work or school devices.",
    bestPractices: [
      "Check Update History after reported issues to see if they line up with a recent install.",
      "Reference it before contacting support so you can state your exact macOS build and patch date.",
      "Cross-check a critical security response's install date here if you're unsure it actually applied.",
    ],
    commonIssues: [
      {
        issue: "An update you expected doesn't appear in the list.",
        fix: "Check System Settings → General → Software Update to see if it's still pending, since Update History only logs completed installs.",
      },
      {
        issue: "You need the exact macOS build number, not just the version name.",
        fix: "Go to Apple menu → About This Mac and click the version number to reveal the specific build number.",
      },
    ],
    faqs: [
      {
        q: "Can I undo or roll back an update from this list?",
        a: "No, Update History is a read-only log; rolling back generally requires reinstalling macOS from Recovery or restoring from a Time Machine backup made before the update.",
      },
      {
        q: "Does Update History include App Store app updates?",
        a: "No, it only covers macOS system updates and Apple software updates; app update history is tracked separately in the App Store.",
      },
    ],
    tipsAndTricks: [
      "Run `softwareupdate --history` in Terminal to view the same list without opening System Settings.",
    ],
    relatedSettingIds: ["macos-software-update", "macos-automatic-updates", "macos-about-this-mac"],
  },
  {
    id: "macos-beta-updates",
    title: "Beta Updates",
    icon: FlaskConical,
    platform: "macos",
    category: "system-updates",
    controlType: "toggle",
    actionLabel: "Manage Beta Updates",
    heading: "Enroll In Public Or Developer macOS Betas",
    description:
      "Beta Updates lets you opt this Mac into pre-release macOS software — either the public beta or, with a developer account, the developer beta — so you can try upcoming features before they're officially released. Beta software is less stable and should only run on a Mac you don't depend on daily.",
    details: [
      "Choose between no beta program, the public beta, or a developer beta track.",
      "Beta installs appear alongside regular options in Software Update once enrolled.",
      "You can opt out at any time, though downgrading a beta version usually requires a full reinstall.",
      "Beta updates can include experimental features not yet finalized for public release.",
    ],
    important:
      "Beta software can be unstable, drain battery faster, and break third-party apps — avoid installing it on your primary work Mac.",
    redirectUrl: "https://support.apple.com/guide/mac-help/welcome/mac",
    afterImageContent: {
      heading: "How Beta Enrollment Works",
      paragraphs: [
        "Enrolling links your Mac to Apple's beta software program, which then makes pre-release update profiles available through the same Software Update panel you use for normal updates.",
        "Public betas are typically a build or two behind developer betas and get slightly more testing first, though both can still contain bugs and unfinished features.",
      ],
      steps: [
        "Open System Settings → General → Software Update.",
        "Click the info button (ⓘ) next to 'Beta Updates'.",
        "Choose the beta track you want to enroll in, or select 'Off' to opt out.",
        "Return to Software Update and install the beta version when it appears.",
      ],
    },
    whyItMatters:
      "Betas let developers test app compatibility ahead of public release and let enthusiasts try new features early, but running unfinished software on a Mac you rely on for work or important files risks data loss and unexpected crashes. Understanding the tradeoff keeps beta enthusiasm from turning into a real outage.",
    bestPractices: [
      "Only install betas on a secondary Mac or a separate partition, never your only Mac.",
      "Back up fully with Time Machine immediately before installing any beta.",
      "Opt out of the beta program well before the next major macOS release if you want to return to stable software cleanly.",
    ],
    commonIssues: [
      {
        issue: "An app stops working correctly after installing a beta.",
        fix: "Check the developer's site for a compatibility update, or avoid using that app until you return to a stable macOS release.",
      },
      {
        issue: "You want to leave the beta program and go back to a stable release.",
        fix: "Turn off Beta Updates in Software Update, then reinstall macOS from Recovery Mode using the latest stable version, restoring from a pre-beta backup.",
      },
    ],
    faqs: [
      {
        q: "Is the public beta the same as the developer beta?",
        a: "They're closely related but the developer beta is typically released earlier and requires a (free or paid) Apple Developer account, while the public beta is open to anyone and arrives slightly later.",
      },
      {
        q: "Can I downgrade from a beta back to a stable macOS version without losing data?",
        a: "Not directly — you generally need to erase the disk and reinstall a stable macOS version, then restore your data from a backup made before installing the beta.",
      },
    ],
    tipsAndTricks: [
      "Install betas on an external bootable drive to test new features without touching your main system volume.",
    ],
    relatedSettingIds: ["macos-software-update", "macos-automatic-updates", "macos-time-machine-backup"],
  },
  {
    id: "macos-rapid-security-response",
    title: "Rapid Security Responses",
    icon: ShieldAlert,
    platform: "macos",
    category: "system-updates",
    recommended: true,
    controlType: "toggle",
    actionLabel: "Manage Security Response Settings",
    heading: "Get Emergency Security Patches Fast",
    description:
      "Rapid Security Responses are small, fast-turnaround updates Apple issues between full macOS releases to patch urgent, actively exploited security issues. They install quickly, often without a restart, and are labeled with a letter suffix like 'macOS Sonoma 14.5 (a)'.",
    details: [
      "Install independently of full macOS version updates, usually within days of a threat being identified.",
      "Often apply without requiring a full restart of the Mac.",
      "Can be removed individually if one causes a compatibility problem, unlike regular updates.",
      "Show up with a letter suffix (a, b, c) appended to the macOS version number.",
    ],
    redirectUrl: "https://support.apple.com/en-us/HT201222",
    afterImageContent: {
      heading: "How Rapid Security Responses Work",
      paragraphs: [
        "Apple designed these as lightweight, targeted patches so critical fixes — like a browser engine vulnerability being actively exploited — can reach Macs in days instead of waiting for the next full macOS update cycle.",
        "Because they're narrowly scoped, they carry less risk of side effects than a full system update, which is part of why Apple can push them out and let you install automatically with more confidence.",
      ],
      steps: [
        "Open System Settings → General → Software Update.",
        "Click the info button (ⓘ) next to 'Automatic Updates'.",
        "Confirm 'Install Security Responses and system files' is turned on.",
        "If a response has already installed, check Update History to confirm the version and date.",
      ],
    },
    whyItMatters:
      "These patches exist specifically to close vulnerabilities that attackers are already exploiting in the wild, so a delay in installing one leaves a known, active hole open. Leaving this automated is one of the lowest-effort, highest-impact security decisions you can make.",
    bestPractices: [
      "Keep automatic installation for security responses turned on at all times.",
      "Don't remove an installed security response unless it's causing a confirmed, specific compatibility problem.",
      "Check Update History after major news about a security exploit to confirm the relevant patch has installed.",
    ],
    commonIssues: [
      {
        issue: "A Rapid Security Response causes a specific app or website to misbehave.",
        fix: "Go to System Settings → General → About and use the 'Remove & Reinstall Software Update' option if available, or wait for Apple's follow-up fix, which usually arrives quickly.",
      },
      {
        issue: "The version number looks unfamiliar, like '14.5 (a)'.",
        fix: "That's expected — the letter suffix indicates a Rapid Security Response layered on top of the base version, not a separate macOS release.",
      },
    ],
    faqs: [
      {
        q: "Do Rapid Security Responses require a restart?",
        a: "Usually not — they're designed to apply quickly, often without interrupting what you're doing, though occasionally one may ask for a restart.",
      },
      {
        q: "Are Rapid Security Responses optional?",
        a: "They can be turned off along with other automatic update options, but since they patch actively exploited vulnerabilities, leaving them enabled is strongly recommended.",
      },
    ],
    tipsAndTricks: [
      "Run `softwareupdate -l` in Terminal to check quickly whether a Rapid Security Response is available before it appears in System Settings.",
    ],
    relatedSettingIds: ["macos-automatic-updates", "macos-software-update", "macos-privacy-security-hub"],
  },
  {
    id: "macos-optimize-storage",
    title: "Optimize Storage",
    icon: Sparkles,
    platform: "macos",
    category: "storage-backup-data",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "Open Storage Recommendations",
    heading: "Free Up Space With Storage Recommendations",
    description:
      "Optimize Storage is a set of Apple-recommended actions — like storing files in iCloud, auto-emptying the Trash, and removing watched TV shows and movies — that free up local disk space with minimal effort. It's found inside About This Mac's Storage settings.",
    details: [
      "'Store in iCloud' moves older files, photos, and messages to iCloud and keeps only recent items stored locally.",
      "'Optimize Storage' in the Photos and TV apps removes full-resolution originals or watched content once they're safely in iCloud or already viewed.",
      "'Empty Trash Automatically' permanently deletes items that have been in the Trash for more than 30 days.",
      "'Reduce Clutter' helps you find and manually review large files and downloads taking up space.",
    ],
    important:
      "Turning on 'Store in iCloud' requires enough iCloud storage for your files and a stable internet connection to keep everything accessible.",
    redirectUrl: "https://support.apple.com/guide/mac-help/optimize-storage-space-sysp4ee93ca4/mac",
    afterImageContent: {
      heading: "How Storage Recommendations Work",
      paragraphs: [
        "Each recommendation targets a specific category of space usage — photos, messages, downloads, or the Trash — and can be turned on individually rather than all at once.",
        "Files moved to iCloud under 'Store in iCloud' aren't deleted; they're downloaded back automatically when you open them, provided you have an internet connection.",
      ],
      steps: [
        "Open System Settings → General → Storage.",
        "Wait for the storage breakdown to calculate, then click 'Recommendations' or view the suggestions.",
        "Turn on 'Store in iCloud', 'Optimize Storage', or 'Empty Trash Automatically' as needed.",
        "Review 'Documents' for large files you can manually delete or move to external storage.",
      ],
    },
    whyItMatters:
      "A nearly full startup disk slows macOS down, can prevent updates from installing, and risks running out of space entirely, which can cause crashes or corrupted files. These recommendations reclaim space automatically without you having to manually hunt through folders.",
    bestPractices: [
      "Turn on 'Empty Trash Automatically' so deleted files don't quietly consume space for months.",
      "Only enable 'Store in iCloud' if you have enough iCloud storage purchased to cover your library.",
      "Revisit the storage breakdown every few months, since 'Other' and app data can grow silently.",
    ],
    commonIssues: [
      {
        issue: "Storage doesn't free up immediately after turning on a recommendation.",
        fix: "Optimization runs in the background and can take time, especially for large photo libraries; ensure the Mac stays connected to Wi-Fi and power while it works.",
      },
      {
        issue: "Files stored in iCloud aren't available without an internet connection.",
        fix: "Manually download files you'll need offline ahead of time, or turn off 'Optimize Mac Storage' for that specific library if you need everything local.",
      },
    ],
    faqs: [
      {
        q: "Does 'Store in iCloud' delete my files?",
        a: "No, it keeps files in iCloud and only removes the local copy from your Mac when space is needed, automatically re-downloading them when you open them again.",
      },
      {
        q: "What counts as 'Other' in the storage breakdown?",
        a: "'Other' typically includes app caches, system files, disk images, and files macOS can't categorize into a specific type like Documents or Photos.",
      },
    ],
    tipsAndTricks: [
      "Hold Option and click the Apple menu, then choose System Information → Storage for a more detailed breakdown than the Storage settings pane shows.",
    ],
    relatedSettingIds: ["macos-storage-management", "macos-icloud-drive", "macos-about-this-mac"],
  },
  {
    id: "macos-icloud-drive",
    title: "iCloud Drive",
    icon: Cloud,
    platform: "macos",
    category: "storage-backup-data",
    frequentlyUsed: true,
    controlType: "toggle",
    actionLabel: "Open iCloud Drive Settings",
    heading: "Sync Files & Folders Across Your Devices",
    description:
      "iCloud Drive keeps your files in sync across every device signed into the same Apple ID, and can automatically include your Desktop and Documents folders so they're backed up and accessible from any Mac, iPhone, or iPad. Files sync in the background and are accessible from the Finder sidebar or iCloud.com.",
    details: [
      "Turn on 'Desktop & Documents Folders' to sync everything in those folders to iCloud automatically.",
      "Choose which apps are allowed to store their documents in iCloud Drive.",
      "Access iCloud Drive files from the Finder sidebar, iCloud.com, or any device signed into the same Apple ID.",
      "Share individual iCloud Drive files or folders with other people via a link.",
    ],
    important:
      "Turning on Desktop & Documents syncing moves those folders' contents into iCloud storage, which counts against your iCloud+ storage plan quota.",
    redirectUrl: "https://support.apple.com/guide/mac-help/welcome/mac",
    afterImageContent: {
      heading: "How iCloud Drive Syncing Works",
      paragraphs: [
        "Files you save into iCloud Drive (or into a synced Desktop/Documents folder) upload automatically and become available on every other device signed into the same Apple ID, with changes merging as you edit on different devices.",
        "To save local space, macOS can offload rarely used files to iCloud and keep only a placeholder locally, downloading the full file automatically the moment you open it.",
      ],
      steps: [
        "Open System Settings → [your name] → iCloud → iCloud Drive.",
        "Turn on iCloud Drive if it isn't already enabled.",
        "Turn on 'Desktop & Documents Folders' to sync those folders automatically.",
        "Choose which additional apps can store documents in iCloud Drive.",
      ],
    },
    whyItMatters:
      "Syncing your working files means you can pick up exactly where you left off on another Mac or an iPad, and it acts as an extra layer of protection if your Mac's internal drive fails. But it also means those files depend on iCloud storage space and an internet connection to fully stay current.",
    bestPractices: [
      "Check your iCloud storage plan before turning on Desktop & Documents syncing for a large existing folder.",
      "Use Optimize Mac Storage so older files offload automatically instead of filling your local disk.",
      "Don't treat iCloud Drive as your only backup — pair it with Time Machine for full-system protection.",
    ],
    commonIssues: [
      {
        issue: "Files show a cloud icon and won't open without internet access.",
        fix: "Files with a cloud download icon haven't been downloaded locally yet; connect to the internet and click the file to force it to download.",
      },
      {
        issue: "iCloud Drive says storage is full and stops syncing new files.",
        fix: "Upgrade your iCloud+ storage plan, or free up space by removing large files or turning off syncing for folders you don't need in the cloud.",
      },
    ],
    faqs: [
      {
        q: "What happens to my Desktop and Documents files if I turn off syncing?",
        a: "macOS gives you the option to keep a local copy of everything or keep the files only in iCloud Drive, so you choose before any data is removed from the Mac.",
      },
      {
        q: "Is iCloud Drive the same as Time Machine backup?",
        a: "No, iCloud Drive syncs specific folders and files for access across devices, while Time Machine creates versioned backups of your entire system to an external or network drive.",
      },
    ],
    tipsAndTricks: [
      "Right-click a synced file in Finder and choose 'Download Now' to force it local before going somewhere without internet access.",
    ],
    relatedSettingIds: ["macos-apple-id-icloud", "macos-optimize-storage", "macos-storage-management"],
  },
  {
    id: "macos-external-storage",
    title: "External Storage",
    icon: HardDrive,
    platform: "macos",
    category: "storage-backup-data",
    controlType: "action",
    actionLabel: "Open Disk Utility",
    heading: "Manage External Drives On Your Mac",
    description:
      "External Storage covers how macOS handles USB, Thunderbolt, and network-attached drives connected to your Mac — formatting them, choosing a file system, ejecting safely, and deciding which ones are eligible for Time Machine backups. Disk Utility is the main tool for managing these drives.",
    details: [
      "Format external drives as APFS, Mac OS Extended, or exFAT depending on how you'll use them.",
      "Erase, partition, or repair a drive's directory structure using Disk Utility's First Aid.",
      "Choose whether a connected external drive can be selected as a Time Machine backup disk.",
      "Safely eject drives from Finder or the menu bar before physically disconnecting them.",
    ],
    important:
      "Always eject an external drive properly before unplugging it — disconnecting without ejecting can corrupt files or the entire disk's directory structure.",
    redirectUrl: "https://support.apple.com/guide/disk-utility/welcome/mac",
    afterImageContent: {
      heading: "How External Storage Is Managed",
      paragraphs: [
        "When you connect an external drive, macOS mounts it and shows it in Finder's sidebar and on the desktop (if enabled), and it stays available to any app until you eject it or disconnect the Mac.",
        "The file system format you choose determines compatibility: APFS works best for Mac-only use, exFAT is readable by both Mac and Windows, and Mac OS Extended (Journaled) is the older Mac-native format.",
      ],
      steps: [
        "Connect the external drive via USB, Thunderbolt, or your network.",
        "Open Disk Utility (Applications → Utilities → Disk Utility) to view, format, or repair the drive.",
        "Select the drive and choose Erase to format it, picking a file system that matches your needs.",
        "Eject the drive from Finder's sidebar before physically disconnecting it.",
      ],
    },
    whyItMatters:
      "External drives are where most people keep backups, large media libraries, or overflow storage, so understanding formatting and safe ejection prevents avoidable data loss and corrupted disks. Choosing the wrong file system can also make a drive unreadable on other computers you need to use it with.",
    bestPractices: [
      "Format drives as APFS for Mac-only backup or storage use, or exFAT if you need cross-platform compatibility.",
      "Run Disk Utility's First Aid periodically on drives you use heavily to catch directory errors early.",
      "Keep at least one drive dedicated solely to backups rather than mixing backups with everyday file storage.",
    ],
    commonIssues: [
      {
        issue: "An external drive doesn't appear in Finder or Disk Utility.",
        fix: "Try a different cable or port, check Finder → Settings → Sidebar to confirm external disks are set to show, and restart the Mac if it still isn't detected.",
      },
      {
        issue: "macOS says the drive isn't readable and needs to be formatted.",
        fix: "The drive's directory structure may be corrupted or it's formatted for a different OS; try Disk Utility's First Aid first, and only reformat if repair fails and you don't need the existing data.",
      },
    ],
    faqs: [
      {
        q: "Can I use the same external drive on both a Mac and a Windows PC?",
        a: "Yes, if you format it as exFAT, which both operating systems can read and write to; APFS and Mac OS Extended are not natively writable on Windows.",
      },
      {
        q: "Why does macOS warn me before ejecting a drive that's 'in use'?",
        a: "It means a file on that drive is still open in an app; close the file or app first, then eject to avoid losing unsaved changes or corrupting the disk.",
      },
    ],
    tipsAndTricks: [
      "Hold the mouse button down at startup, or use the Startup Disk pane, to boot from an external drive if it contains a bootable macOS installer.",
    ],
    relatedSettingIds: ["macos-storage-management", "macos-time-machine-backup", "macos-startup-disk"],
  },
  {
    id: "macos-system-report",
    title: "System Report",
    icon: FileText,
    platform: "macos",
    category: "system-info",
    controlType: "action",
    actionLabel: "Open System Information",
    heading: "View Detailed Hardware & Software Info",
    description:
      "System Report (opened via the System Information app) provides a full technical inventory of your Mac — every connected device, installed application, network configuration, and hardware component — far beyond the summary shown in About This Mac. It's the tool Apple Support usually asks you to check when diagnosing hardware issues.",
    details: [
      "Lists detailed hardware specs: processor, memory modules, graphics, storage, and connected displays.",
      "Shows every USB, Bluetooth, Thunderbolt, and network device currently connected.",
      "Displays installed applications along with their version numbers and install locations.",
      "Includes diagnostic logs useful for troubleshooting crashes or hardware faults.",
    ],
    redirectUrl: "https://support.apple.com/guide/mac-help/welcome/mac",
    afterImageContent: {
      heading: "How System Report Works",
      paragraphs: [
        "System Information scans the Mac's hardware and software in real time each time you open it, organizing everything into categories in a sidebar you can browse through.",
        "It's read-only — you can view and export details as a report, but you can't change settings from within the app itself.",
      ],
      steps: [
        "Hold Option and click the Apple menu, then choose 'System Information'.",
        "Alternatively, open About This Mac and click 'More Info', then 'System Report'.",
        "Browse the sidebar categories like Hardware, Network, or Software.",
        "Use File → Save or Export to save a copy of the report if support asks for it.",
      ],
    },
    whyItMatters:
      "When troubleshooting hardware problems, compatibility issues, or verifying exact specs before selling or upgrading a Mac, System Report gives the precise technical detail that About This Mac's summary leaves out. Support technicians frequently rely on this exported report to diagnose issues remotely.",
    bestPractices: [
      "Export a System Report before contacting Apple Support so you can share it directly.",
      "Check the Storage and Memory sections here for precise numbers if About This Mac feels too high-level.",
      "Review connected USB and Bluetooth devices here if a peripheral isn't being recognized elsewhere.",
    ],
    commonIssues: [
      {
        issue: "A connected accessory doesn't show up anywhere in System Report.",
        fix: "Try a different port or cable, and check whether the device needs its own driver installed before macOS will detect it.",
      },
      {
        issue: "The report looks overwhelming with too much information.",
        fix: "Use the sidebar to jump directly to the relevant category (like Memory or Displays) instead of scrolling through the entire report.",
      },
    ],
    faqs: [
      {
        q: "Is System Report the same as About This Mac?",
        a: "No, About This Mac gives a quick summary, while System Report (accessible from within it) provides the full detailed technical inventory of hardware and software.",
      },
      {
        q: "Can I use System Report to check my Mac's serial number?",
        a: "Yes, the Hardware Overview section at the top of System Report lists the serial number along with the model identifier and hardware UUID.",
      },
    ],
    tipsAndTricks: [
      "Use File → Export in System Information to save a shareable text report for troubleshooting with support or a technician.",
    ],
    relatedSettingIds: ["macos-about-this-mac", "macos-serial-warranty", "macos-storage-management"],
  },
  {
    id: "macos-startup-disk",
    title: "Startup Disk",
    icon: HardDrive,
    platform: "macos",
    category: "system-info",
    controlType: "action",
    actionLabel: "Open Startup Disk Settings",
    heading: "Choose Which Disk Your Mac Boots From",
    description:
      "Startup Disk lets you select which internal or external bootable volume your Mac uses when it powers on, useful if you have multiple macOS installations, a bootable backup, or a Windows partition via Boot Camp on an Intel Mac. Apple silicon Macs manage most of this through Startup Security Utility instead.",
    details: [
      "Shows every bootable volume currently connected and available to start up from.",
      "Lets you set a default startup disk so the Mac boots into it automatically.",
      "On Intel Macs, holding Option at startup shows a temporary boot picker without changing the default.",
      "Includes access to restart directly into macOS Recovery from the same panel.",
    ],
    important:
      "On Apple silicon Macs, changing the default startup volume and enabling external boot both require going through Startup Security Utility in Recovery Mode.",
    redirectUrl: "https://support.apple.com/en-us/102603",
    afterImageContent: {
      heading: "How Startup Disk Selection Works",
      paragraphs: [
        "macOS scans connected drives for valid, bootable system installations and lists them so you can choose which one loads when the Mac starts up.",
        "This is especially useful for testing a new macOS version on a separate drive without disturbing your main system, or for booting into a bootable Time Machine backup for recovery.",
      ],
      steps: [
        "Open System Settings → General → Startup Disk.",
        "Click the lock icon and authenticate if prompted.",
        "Select the volume you want to boot from by default.",
        "Click 'Restart' to boot into the selected disk immediately, or leave it set for next time.",
      ],
    },
    whyItMatters:
      "Choosing the wrong startup disk, or not knowing how to change it, can leave you unable to boot into the system you need — especially when troubleshooting, running a bootable backup, or dual-booting Windows on an Intel Mac. Knowing this setting also matters when installing macOS on a second internal or external volume for testing.",
    bestPractices: [
      "Reset the startup disk back to your main internal volume after testing an external boot drive.",
      "Label external bootable drives clearly so you don't accidentally boot into the wrong one.",
      "On Apple silicon Macs, use Startup Security Utility in Recovery to manage external boot permissions securely.",
    ],
    commonIssues: [
      {
        issue: "Mac boots into the wrong volume after connecting an external drive.",
        fix: "Open Startup Disk in System Settings and confirm the correct default is selected, or hold Option at startup to manually choose the boot volume for that session only.",
      },
      {
        issue: "An external bootable drive doesn't appear as an option.",
        fix: "Confirm the drive actually contains a valid macOS installation, and on Apple silicon Macs, check that external booting is allowed in Startup Security Utility.",
      },
    ],
    faqs: [
      {
        q: "How do I boot into a different disk just once, without changing my default?",
        a: "On Intel Macs, hold Option at startup to bring up a temporary boot picker; on Apple silicon Macs, press and hold the power button at startup to reach Startup Options.",
      },
      {
        q: "Can I select a network drive as my startup disk?",
        a: "No, startup disks must be locally connected, bootable volumes — network drives aren't supported as startup options.",
      },
    ],
    tipsAndTricks: [
      "Press and hold the power button on an Apple silicon Mac at startup to reach Startup Options, which includes Startup Disk selection and Recovery.",
    ],
    relatedSettingIds: ["macos-recovery-mode", "macos-erase-reset-mac", "macos-external-storage"],
  },
  {
    id: "macos-serial-warranty",
    title: "Serial Number & Coverage",
    icon: Barcode,
    platform: "macos",
    category: "system-info",
    controlType: "action",
    actionLabel: "Check Coverage Status",
    heading: "Find Your Mac's Serial Number & AppleCare Status",
    description:
      "This is where you locate your Mac's serial number and check whether it's still covered by Apple's limited warranty or an AppleCare+ plan. You'll need the serial number for support calls, insurance claims, or verifying coverage before a repair.",
    details: [
      "Find the serial number under About This Mac or physically on some Mac models' underside or box.",
      "Use the serial number to check warranty and AppleCare+ status on Apple's coverage site.",
      "See the original purchase and estimated coverage expiration dates.",
      "Confirm eligibility for free repairs on specific known issues covered by Apple's repair programs.",
    ],
    redirectUrl: "https://support.apple.com/en-us/HT204073",
    afterImageContent: {
      heading: "How to Check Serial Number & Coverage",
      paragraphs: [
        "The serial number uniquely identifies your specific Mac and is tied to its manufacture date, model, and any AppleCare+ plan purchased for it.",
        "Apple's coverage checker uses this number to instantly show whether your Mac is in or out of warranty, and whether it qualifies for any active repair programs.",
      ],
      steps: [
        "Click the Apple menu → About This Mac to view the serial number.",
        "Copy the serial number, or click it to reveal more identifying details.",
        "Go to Apple's 'Check Coverage' website and enter the serial number.",
        "Review the warranty, AppleCare+, and repair program status shown.",
      ],
    },
    whyItMatters:
      "Knowing your coverage status before a hardware problem happens saves time and money — you'll know immediately whether a repair is free, discounted, or full price. The serial number is also required for insurance claims, trade-ins, and verifying a used Mac's authenticity and history before buying it.",
    bestPractices: [
      "Write down or screenshot your serial number somewhere safe in case the Mac won't turn on later.",
      "Check coverage status right after buying AppleCare+ to confirm it was applied correctly.",
      "Verify a used Mac's serial number and coverage status before buying it secondhand.",
    ],
    commonIssues: [
      {
        issue: "The Mac won't turn on, so you can't find the serial number in About This Mac.",
        fix: "Check the original packaging, purchase receipt, or the bottom of older Mac models, which often have it printed physically.",
      },
      {
        issue: "Apple's coverage checker shows unexpected or no coverage.",
        fix: "Confirm you entered the serial number correctly, and contact Apple Support directly if you believe the coverage shown doesn't match your purchase.",
      },
    ],
    faqs: [
      {
        q: "Where else can I find my Mac's serial number besides About This Mac?",
        a: "It's often printed on the original box, the receipt, or physically on the Mac itself depending on the model, and it's also listed in System Report under Hardware Overview.",
      },
      {
        q: "Does checking my coverage status cost anything?",
        a: "No, checking your warranty or AppleCare+ status on Apple's site is free and just requires your serial number.",
      },
    ],
    tipsAndTricks: [
      "Right-click (or Control-click) the macOS version number in About This Mac to quickly copy the serial number to your clipboard.",
    ],
    relatedSettingIds: ["macos-about-this-mac", "macos-system-report", "macos-recovery-mode"],
  },
  {
    id: "macos-voiceover",
    title: "VoiceOver",
    icon: Volume2,
    platform: "macos",
    category: "accessibility-language",
    controlType: "toggle",
    actionLabel: "Open VoiceOver Settings",
    heading: "Navigate Your Mac With Spoken Descriptions",
    description:
      "VoiceOver is macOS's built-in screen reader, describing aloud what's on screen — windows, buttons, text, and images — so you can use the entire Mac without seeing the display. It works through keyboard commands and gestures rather than a mouse.",
    details: [
      "Reads aloud text, buttons, menus, and images (using descriptions) as you navigate.",
      "Uses a dedicated set of keyboard shortcuts called the VoiceOver modifier (Control + Option by default).",
      "Includes a Trackpad Commander mode for gesture-based navigation on MacBooks.",
      "Comes with an interactive VoiceOver Training tutorial built into macOS.",
    ],
    important:
      "Turning on VoiceOver changes how basic navigation works system-wide; if you're new to it, run the built-in tutorial before relying on it fully.",
    redirectUrl: "https://support.apple.com/guide/voiceover/welcome/mac",
    afterImageContent: {
      heading: "How VoiceOver Works",
      paragraphs: [
        "Once enabled, VoiceOver adds a moving highlight (the VoiceOver cursor) around whatever item it's describing, and you navigate by keyboard commands or trackpad gestures rather than looking at the screen.",
        "VoiceOver understands most native macOS and many third-party apps out of the box, reading labels, buttons, and content aloud with adjustable speech rate and voice.",
      ],
      steps: [
        "Open System Settings → Accessibility → VoiceOver.",
        "Turn on the VoiceOver toggle (or press Command-F5).",
        "Complete the VoiceOver Quick Start or Training tutorial that appears.",
        "Adjust voice, speech rate, and verbosity from the VoiceOver Utility that opens alongside it.",
      ],
    },
    whyItMatters:
      "VoiceOver makes it possible for people who are blind or have low vision to use a Mac fully and independently, and it's built in at no extra cost rather than requiring third-party software. Even sighted users sometimes use it temporarily, like when a display is damaged or unavailable.",
    bestPractices: [
      "Complete the built-in VoiceOver Training before daily use so the keyboard commands become familiar.",
      "Adjust speech rate gradually — experienced users often speed it up significantly beyond the default.",
      "Use VoiceOver Utility to fine-tune verbosity so it doesn't read out more detail than you need.",
    ],
    commonIssues: [
      {
        issue: "VoiceOver turns on unexpectedly and is hard to turn off without seeing the screen.",
        fix: "Press Command-F5 again, or hold Command while pressing the Touch ID button (on supported Macs) to toggle VoiceOver off.",
      },
      {
        issue: "A specific app doesn't read correctly with VoiceOver.",
        fix: "Check for an app update, since accessibility support depends on the developer implementing proper labels; report the issue to the app's developer if it persists.",
      },
    ],
    faqs: [
      {
        q: "Can I use VoiceOver with a mouse instead of only the keyboard?",
        a: "Yes, VoiceOver supports mouse and trackpad interaction alongside keyboard navigation, though many users find keyboard commands faster once learned.",
      },
      {
        q: "Does VoiceOver work with Braille displays?",
        a: "Yes, VoiceOver supports a wide range of refreshable Braille displays, configurable in VoiceOver Utility under the Braille category.",
      },
    ],
    tipsAndTricks: [
      "Press Command-F5 anywhere to toggle VoiceOver on or off quickly without opening System Settings.",
    ],
    relatedSettingIds: ["macos-accessibility", "macos-zoom-magnifier", "macos-voice-control"],
  },
  {
    id: "macos-zoom-magnifier",
    title: "Zoom",
    icon: ZoomIn,
    platform: "macos",
    category: "accessibility-language",
    controlType: "toggle",
    actionLabel: "Open Zoom Settings",
    heading: "Magnify Your Screen For Easier Viewing",
    description:
      "Zoom is macOS's built-in screen magnifier, letting you enlarge everything on the display using keyboard shortcuts, trackpad gestures, or the mouse scroll wheel, without needing a separate magnifying app. It works independently of display resolution settings.",
    details: [
      "Zoom in and out using customizable keyboard shortcuts or trackpad/mouse gestures.",
      "Choose between Full Screen zoom or a resizable Picture-in-Picture magnified window.",
      "Adjust maximum zoom level and how smoothly the view tracks your cursor.",
      "Enable 'Hover Text' to magnify just the area under your cursor in large text.",
    ],
    redirectUrl: "https://support.apple.com/guide/mac-help/welcome/mac",
    afterImageContent: {
      heading: "How Zoom Works",
      paragraphs: [
        "Zoom magnifies the actual screen content in real time rather than changing display resolution, so text and images stay sharp instead of becoming pixelated.",
        "You can keep Zoom following your mouse cursor, your keyboard focus, or the text insertion point, depending on which best matches how you work.",
      ],
      steps: [
        "Open System Settings → Accessibility → Zoom.",
        "Turn on 'Use keyboard shortcuts to zoom' or 'Use scroll gesture with modifier keys to zoom'.",
        "Choose Full Screen or Picture-in-Picture zoom style.",
        "Adjust zoom follow behavior and maximum zoom level to your preference.",
      ],
    },
    whyItMatters:
      "Zoom gives people with low vision a way to comfortably read small text and interface details without needing external magnification hardware or software. It's also handy temporarily for presentations, demos, or checking fine visual detail in an image.",
    bestPractices: [
      "Use Picture-in-Picture mode if you want magnification without losing full-screen context of the rest of the display.",
      "Pair Zoom with larger system text sizes for a more consistently readable interface.",
      "Set a comfortable maximum zoom level so scrolling doesn't overshoot into unreadable extremes.",
    ],
    commonIssues: [
      {
        issue: "Zoom doesn't respond to the scroll gesture.",
        fix: "Confirm 'Use scroll gesture with modifier keys to zoom' is turned on in Accessibility → Zoom, and check which modifier key (like Control) is required.",
      },
      {
        issue: "The zoomed view feels jumpy or hard to control.",
        fix: "Lower the maximum zoom level or change the zoom style between Full Screen and Picture-in-Picture to find a smoother experience.",
      },
    ],
    faqs: [
      {
        q: "Does Zoom change my screen resolution?",
        a: "No, it magnifies the existing display content without altering the actual resolution, so image and text quality stay sharp.",
      },
      {
        q: "Can I use Zoom and VoiceOver at the same time?",
        a: "Yes, both accessibility features can run simultaneously, though VoiceOver users often rely less on visual magnification.",
      },
    ],
    tipsAndTricks: [
      "Use Command-Option-8 to toggle Zoom on or off, and Command-Option-'=' or '-' to zoom in and out once enabled.",
    ],
    relatedSettingIds: ["macos-accessibility", "macos-voiceover", "macos-displays"],
  },
  {
    id: "macos-voice-control",
    title: "Voice Control",
    icon: Mic,
    platform: "macos",
    category: "accessibility-language",
    controlType: "toggle",
    actionLabel: "Open Voice Control Settings",
    heading: "Control Your Mac Entirely By Voice",
    description:
      "Voice Control lets you operate your entire Mac — clicking, typing, opening apps, and navigating menus — using only spoken commands, with all speech processing done on-device for privacy. It's built for people who can't use a traditional mouse and keyboard, but works for anyone who wants hands-free control.",
    details: [
      "Overlay numbered grids and labels on screen so you can say a number or name to click anything.",
      "Dictate text directly into any text field using natural speech.",
      "Create custom voice commands mapped to specific actions or keyboard shortcuts.",
      "Works fully offline, since speech recognition processes locally on the Mac.",
    ],
    important:
      "Voice Control requires a clear, quiet environment and a working microphone to recognize commands reliably.",
    redirectUrl: "https://support.apple.com/guide/mac-help/welcome/mac",
    afterImageContent: {
      heading: "How Voice Control Works",
      paragraphs: [
        "When enabled, Voice Control listens continuously for its command vocabulary and for dictated text, converting speech into clicks, keystrokes, and typed text without needing an internet connection.",
        "Turning on 'Show numbers' or 'Show names' overlays interactive labels on buttons, links, and controls so you can select anything precisely just by speaking its number or label.",
      ],
      steps: [
        "Open System Settings → Accessibility → Voice Control.",
        "Turn on the Voice Control toggle.",
        "Say 'Show numbers' to overlay clickable labels, or 'Show names' for text labels.",
        "Say 'Show commands' or open the Command list to see all available voice commands.",
      ],
    },
    whyItMatters:
      "Voice Control gives people with limited mobility full, independent access to a Mac without needing an external switch device or assistant, and doing recognition entirely on-device means your speech isn't sent anywhere for processing. It's a meaningful accessibility feature that also doubles as a genuine hands-free option for anyone with a temporary injury.",
    bestPractices: [
      "Use a quiet room and a good external or headset microphone for more reliable recognition.",
      "Learn the core navigation commands (like 'Go to sleep' and 'Show numbers') before relying on it for daily tasks.",
      "Create custom commands for actions you perform often to speed up repetitive workflows.",
    ],
    commonIssues: [
      {
        issue: "Voice Control frequently mishears commands or names.",
        fix: "Check the microphone's input level in Sound settings, reduce background noise, and consider using an external microphone for better accuracy.",
      },
      {
        issue: "You need to temporarily stop Voice Control from listening without turning it off.",
        fix: "Say 'Go to sleep' to pause listening, and 'Wake up' to resume without disabling the feature entirely.",
      },
    ],
    faqs: [
      {
        q: "Does Voice Control send my voice data to Apple?",
        a: "No, Voice Control processes all speech recognition on-device, so your voice data doesn't need to leave the Mac or connect to the internet.",
      },
      {
        q: "Can I use Voice Control and Dictation at the same time?",
        a: "Voice Control includes its own dictation mode for typing text, so you generally use Voice Control's built-in commands rather than switching to separate Dictation while it's active.",
      },
    ],
    tipsAndTricks: [
      "Say 'Show numbers' in any app to instantly reveal clickable number labels over every visible control.",
    ],
    relatedSettingIds: ["macos-accessibility", "macos-voiceover", "macos-siri-spotlight"],
  },
  {
    id: "macos-safe-mode",
    title: "Safe Mode",
    icon: LifeBuoy,
    platform: "macos",
    category: "troubleshooting-diagnostics",
    controlType: "action",
    actionLabel: "Learn How to Start in Safe Mode",
    heading: "Start Up macOS In Minimal Diagnostic Mode",
    description:
      "Safe Mode starts your Mac with only essential system software and drivers loaded, skipping login items, most fonts, and system caches. It's a diagnostic first step used to determine whether a startup problem is caused by third-party software or a deeper system issue.",
    details: [
      "Skips loading non-essential kernel extensions, login items, and startup apps.",
      "Automatically runs a basic check of the startup disk during boot.",
      "Clears certain system caches, which can resolve some performance or startup glitches on its own.",
      "Disables some features and apps temporarily, like video capture in certain apps, while active.",
    ],
    important:
      "The Mac will run noticeably slower in Safe Mode and some apps or features won't work — this is expected and not a sign of a new problem.",
    redirectUrl: "https://support.apple.com/guide/mac-help/welcome/mac",
    afterImageContent: {
      heading: "How Safe Mode Diagnoses Problems",
      paragraphs: [
        "By stripping startup down to only what's essential, Safe Mode isolates whether a crash, freeze, or slow startup is caused by a third-party login item, font, or extension rather than macOS itself.",
        "If a problem disappears in Safe Mode but returns in normal startup, that strongly suggests the cause is something loading at login rather than a core system fault.",
      ],
      steps: [
        "Shut down the Mac completely.",
        "On Apple silicon Macs, press and hold the power button until 'Loading startup options' appears, then hold Shift while clicking Continue in Safe Mode; on Intel Macs, hold Shift immediately after powering on.",
        "Log in if prompted; you should see 'Safe Boot' in the login window or About This Mac.",
        "Test the issue, then restart normally (without holding any keys) to exit Safe Mode.",
      ],
    },
    whyItMatters:
      "Safe Mode is often the fastest way to tell whether a crash or slowdown is caused by something you installed versus a deeper macOS or hardware fault, saving time before jumping to a full reinstall. It's a standard first troubleshooting step Apple Support itself asks users to try.",
    bestPractices: [
      "Try Safe Mode before more drastic steps like reinstalling macOS or erasing the disk.",
      "Note whether the problem you're diagnosing actually goes away in Safe Mode — that result matters for next steps.",
      "Remove or update suspect login items and extensions if Safe Mode resolves the issue.",
    ],
    commonIssues: [
      {
        issue: "The Mac won't enter Safe Mode no matter how the keys are held.",
        fix: "Make sure you're pressing Shift immediately at the right moment (right after the startup chime/logo on Intel, or from the startup options screen on Apple silicon), and try again after a full shutdown rather than a restart.",
      },
      {
        issue: "A problem persists even in Safe Mode.",
        fix: "This suggests the issue isn't caused by a third-party login item or extension; consider checking hardware diagnostics or reinstalling macOS from Recovery.",
      },
    ],
    faqs: [
      {
        q: "Will Safe Mode delete any of my files or apps?",
        a: "No, Safe Mode is purely a diagnostic startup mode and doesn't remove or change any files, apps, or settings.",
      },
      {
        q: "Why is everything slower and some apps missing in Safe Mode?",
        a: "Safe Mode intentionally skips loading non-essential software and disables some graphics acceleration, so reduced performance and limited app functionality are expected while it's active.",
      },
    ],
    tipsAndTricks: [
      "Check About This Mac while in Safe Mode — it should say 'Boot Mode: Safe' near the software details, confirming you're actually in Safe Mode.",
    ],
    relatedSettingIds: ["macos-recovery-mode", "macos-login-items", "macos-activity-monitor"],
  },
  {
    id: "macos-diagnostics-usage-data",
    title: "Analytics & Improvements",
    icon: Activity,
    platform: "macos",
    category: "troubleshooting-diagnostics",
    controlType: "toggle",
    actionLabel: "Open Analytics Settings",
    heading: "Control Diagnostic Data Shared With Apple",
    description:
      "Analytics & Improvements controls whether your Mac automatically sends crash reports and usage analytics to Apple, and optionally to third-party app developers, to help them find and fix bugs. It's separate from location services and general privacy settings, focused specifically on diagnostic and usage data.",
    details: [
      "Toggle whether Mac Analytics data (crash logs, feature usage patterns) is shared with Apple.",
      "Separately choose whether analytics are also shared with third-party app developers.",
      "Review the actual analytics data that's been collected before it's sent.",
      "Turning this off doesn't affect required security or update-check network traffic.",
    ],
    redirectUrl: "https://support.apple.com/guide/mac-help/welcome/mac",
    afterImageContent: {
      heading: "How Analytics Sharing Works",
      paragraphs: [
        "When enabled, macOS periodically bundles anonymized crash logs and usage statistics and sends them to Apple, which uses them in aggregate to identify bugs and prioritize fixes.",
        "This data is separate from telemetry required for core functions like checking for software updates, so turning analytics off doesn't break basic Mac functionality.",
      ],
      steps: [
        "Open System Settings → Privacy & Security → Analytics & Improvements.",
        "Turn 'Share Mac Analytics' on or off.",
        "Turn 'Share With App Developers' on or off separately if desired.",
        "Click 'Analytics Data' to review specific reports that have been generated.",
      ],
    },
    whyItMatters:
      "Sharing analytics helps Apple and developers find and fix bugs faster across millions of devices, but some users prefer to minimize any data leaving their Mac even in anonymized form. Understanding this toggle lets you make an informed choice rather than leaving it on a default you never reviewed.",
    bestPractices: [
      "Review what's actually in the Analytics Data list occasionally if you're curious what's collected.",
      "Turn off developer sharing specifically if you're fine helping Apple but not third-party companies.",
      "Don't confuse this with required update checks — turning analytics off is safe and won't stop security updates.",
    ],
    commonIssues: [
      {
        issue: "Unsure whether turning this off affects app functionality.",
        fix: "It doesn't — analytics sharing is purely diagnostic reporting and has no effect on how apps or macOS actually run.",
      },
      {
        issue: "Analytics Data list appears empty even with sharing turned on.",
        fix: "Reports generate as crashes or specific events occur, so an empty list often just means nothing reportable has happened recently.",
      },
    ],
    faqs: [
      {
        q: "Is this data linked to my identity?",
        a: "Apple states that analytics data collected this way is designed to be anonymized and not directly tied to your Apple ID or personal identity.",
      },
      {
        q: "Do I need analytics turned on to receive software updates?",
        a: "No, software updates and security responses are handled separately in Software Update and aren't dependent on this analytics toggle.",
      },
    ],
    tipsAndTricks: [
      "Check the Analytics Data log after an app crash to see the exact crash report you could optionally share with the app's developer.",
    ],
    relatedSettingIds: ["macos-privacy-security-hub", "macos-activity-monitor", "macos-software-update"],
  },
  {
    id: "macos-activity-monitor",
    title: "Activity Monitor",
    icon: Activity,
    platform: "macos",
    category: "troubleshooting-diagnostics",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "Open Activity Monitor",
    heading: "Diagnose CPU, Memory & Energy Problems",
    description:
      "Activity Monitor is macOS's built-in tool for seeing exactly what's using your Mac's CPU, memory, energy, disk, and network resources in real time, broken down by individual app and process. It's the first place to look when the Mac feels slow, hot, or the fan is running loudly.",
    details: [
      "Shows live CPU, Memory, Energy, Disk, and Network usage tabs, each sortable by app.",
      "Lets you force-quit an unresponsive or runaway app directly from the toolbar.",
      "Displays which apps are consuming the most energy, useful for diagnosing battery drain.",
      "Includes a floating Dock icon graph option for at-a-glance CPU or network monitoring.",
    ],
    redirectUrl: "https://support.apple.com/guide/activity-monitor/welcome/mac",
    afterImageContent: {
      heading: "How Activity Monitor Helps Diagnose Issues",
      paragraphs: [
        "Each tab in Activity Monitor tracks a different system resource, so sorting the CPU tab by '% CPU' or the Memory tab by 'Memory' quickly reveals which specific app is responsible for a slowdown.",
        "A process using close to 100% of a CPU core continuously, or memory pressure showing red in the Memory tab, are strong signals of a specific app misbehaving rather than a general system problem.",
      ],
      steps: [
        "Open Activity Monitor (Applications → Utilities → Activity Monitor, or search with Spotlight).",
        "Click the CPU, Memory, Energy, Disk, or Network tab depending on the symptom.",
        "Click the column header (like '% CPU') to sort and find the top resource user.",
        "Select the problem process and click the Stop (X) button to force it to quit if needed.",
      ],
    },
    whyItMatters:
      "Activity Monitor turns a vague 'my Mac feels slow' complaint into a specific, actionable diagnosis by showing exactly which app or process is responsible. It's essential for catching runaway processes, battery-draining apps, or memory leaks before they cause a crash or force a restart.",
    bestPractices: [
      "Check the Memory tab's 'Memory Pressure' graph, not just app RAM usage, to judge real memory strain.",
      "Sort by Energy Impact when troubleshooting unexpectedly fast battery drain on a MacBook.",
      "Quit and reopen a specific app that's misbehaving before force-quitting through Activity Monitor as a last resort.",
    ],
    commonIssues: [
      {
        issue: "An app is unresponsive and won't quit normally.",
        fix: "Select it in Activity Monitor's Process list and click the Stop button, then choose 'Force Quit' to close it immediately.",
      },
      {
        issue: "CPU usage stays high even after closing visible apps.",
        fix: "Check the full process list for background helper processes or system services using excessive CPU, and restart the Mac if usage doesn't settle after investigating.",
      },
    ],
    faqs: [
      {
        q: "Is it safe to force-quit any process I don't recognize?",
        a: "No — many unfamiliar-looking process names are legitimate system services; only force-quit processes tied to a specific app you know is misbehaving.",
      },
      {
        q: "What does 'Memory Pressure' actually mean?",
        a: "It's a graph showing how hard macOS is working to manage available memory; green means comfortable, yellow means memory is getting tight, and red means the Mac is under significant memory strain.",
      },
    ],
    tipsAndTricks: [
      "Go to View → Dock Icon in Activity Monitor to show a live CPU or network graph directly in the Dock for constant monitoring.",
    ],
    relatedSettingIds: ["macos-storage-management", "macos-login-items", "macos-safe-mode"],
  },
{
  id: "macos-switch-control",
  title: "Switch Control",
  icon: ToggleLeft,
  platform: "macos",
  category: "accessibility-language",
  controlType: "action",
  heading: "Navigate your Mac using adaptive switches",
  description: "Switch Control lets you operate your entire Mac using one or more adaptive switches, a game controller, or the keyboard instead of a mouse and trackpad, by scanning through onscreen items and selecting with a button press.",
  details: [
    "Supports external USB or Bluetooth switches, or keys on the keyboard as virtual switches",
    "Auto scanning, manual scanning, and single-switch step scanning modes",
    "Customizable scanning speed, switch actions, and onscreen keyboard behavior",
    "Point Mode allows fine cursor movement using a switch-driven crosshair",
    "Works with the Accessibility Keyboard panel editor for custom control panels",
  ],
  important: "Switch Control scanning can feel slow at first; most users need to tune scanning speed and switch assignments before it becomes usable day to day.",
  redirectUrl: "https://support.apple.com/guide/mac-help/use-switch-control-mh43607/mac",
  whyItMatters: "For people with limited mobility who cannot reliably use a mouse, trackpad, or standard keyboard, Switch Control is often the only practical way to independently operate a Mac. It turns the entire interface into a set of scannable, selectable regions, so a single physical action, such as pressing a button or a sip-and-puff switch, can stand in for clicking, typing, and dragging. Because it is deeply integrated into macOS rather than a third-party add-on, it works consistently across system apps and most third-party software without extra setup per app.",
  bestPractices: [
    "Start with a slower scanning speed and increase it gradually as you build familiarity",
    "Use the Switches pane to test a new adaptive switch before assigning it to an action",
    "Combine Switch Control with Dwell or Pointer Control features for a hybrid input setup",
    "Save custom scanning panels so they carry over between sessions",
  ],
  commonIssues: [
    { issue: "Scanning highlight skips over needed controls", fix: "Open Switch Control settings and enable Group Highlighting or adjust the navigation style to item-by-item instead of group scanning." },
    { issue: "A connected switch is not recognized", fix: "Re-pair the Bluetooth switch in Bluetooth settings, then add it again under Accessibility > Switch Control > Switches." },
    { issue: "Scanning is too fast to react to", fix: "Lower the Auto Scanning time interval in Switch Control > Timing settings." },
  ],
  faqs: [
    { q: "Can I use my keyboard as a switch without extra hardware?", a: "Yes, any key can be assigned as a virtual switch, so you can try Switch Control before buying adaptive hardware." },
    { q: "Does Switch Control work outside of Apple apps?", a: "Yes, it scans and controls most standard macOS interface elements regardless of which app built them." },
    { q: "Can I use more than one switch?", a: "Yes, multiple switches can be assigned to different actions such as Select, Move to Next Item, or Activate Menu." },
  ],
  tipsAndTricks: [
    "Turn on the switch stabilization option if you have tremors that cause accidental double presses.",
    "Use recipes to chain multiple switch actions into a single custom gesture.",
  ],
  relatedSettingIds: ["macos-accessibility", "macos-voice-control", "macos-pointer-control"],
  updateFrequency: "Set up once, then adjust occasionally as needs change",
  afterImageContent: {
    heading: "How Switch Control Works",
    paragraphs: [
      "Switch Control divides the screen into scannable groups and items, highlighting each in turn while waiting for a switch press to make a selection.",
      "Once an item is selected, a menu of available actions appears, such as clicking, dragging, or opening a contextual menu, so the whole interaction can be driven from one or two physical inputs.",
      "The Accessibility Keyboard can be enabled alongside Switch Control to provide a customizable onscreen panel of buttons and gestures.",
    ],
    steps: [
      "Open System Settings → Accessibility → Switch Control",
      "Turn on Switch Control and add a switch under the Switches section",
      "Adjust Timing to set scanning speed and auto-select delay",
      "Choose a scanning style, such as Auto Scanning or Manual Scanning",
      "Practice selecting items on the Desktop before use in other apps",
    ],
  },
},
{
  id: "macos-captions",
  title: "Captions",
  icon: Captions,
  platform: "macos",
  category: "accessibility-language",
  controlType: "action",
  heading: "Customize closed captions and subtitles",
  description: "Captions settings control how closed captions and subtitles appear across macOS, including text style, background, and size, and let you require captions whenever available in supported media.",
  details: [
    "Style options for font, size, color, background, and edge style",
    "Preview pane shows live sample text as you adjust styling",
    "Option to prefer closed captions and SDH over standard subtitles",
    "Applies system-wide across apps like TV, Podcasts, and QuickTime Player that use system caption rendering",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/change-captions-settings-for-accessibility-mh43180/mac",
  whyItMatters: "Legible captions matter for people who are deaf or hard of hearing, but also for anyone watching video in a noisy space, a quiet office, or a language they are still learning. Because caption preferences live at the system level, they carry consistently across apps rather than needing to be reconfigured in every video player, which reduces friction and makes captioned content genuinely usable rather than a fallback.",
  bestPractices: [
    "Increase font size and add a background box for better readability on smaller displays",
    "Turn on 'Prefer closed captions and SDH' if you want captions to include non-speech sound cues",
    "Test caption styling using the built-in preview before watching long-form content",
    "Use a high-contrast caption style if you also use Increase Contrast elsewhere in Accessibility",
  ],
  commonIssues: [
    { issue: "Captions do not appear in a video app", fix: "Confirm the content actually includes a caption track, and enable captions from that app's own playback controls in addition to system settings." },
    { issue: "Caption text is hard to read over bright video", fix: "Increase the background opacity or switch to a solid background style in Captions settings." },
    { issue: "Caption style changes do not apply", fix: "Quit and reopen the video app after changing caption style, since some apps cache the previous style on launch." },
  ],
  faqs: [
    { q: "Do these settings turn captions on for every video automatically?", a: "No, they only style captions; you still need to enable captions within each piece of content that offers them, unless the app respects a system-wide always-on preference." },
    { q: "Can I set different styles for different apps?", a: "No, caption styling is a single system-wide preference applied wherever macOS renders captions." },
    { q: "Is this the same as VoiceOver captions?", a: "No, this controls media captions and subtitles, not VoiceOver's spoken output." },
  ],
  tipsAndTricks: [
    "Choose a semi-transparent background if you find solid black boxes too distracting over video.",
    "Larger caption text pairs well with a Mac connected to a TV or projector at a distance.",
  ],
  relatedSettingIds: ["macos-accessibility", "macos-sound-recognition", "macos-zoom-magnifier"],
  afterImageContent: {
    heading: "How Captions Settings Work",
    paragraphs: [
      "macOS provides a single style engine for closed captions and subtitles that supported apps draw from, so changes made here apply consistently across the system.",
      "The settings pane includes live style controls plus a preview line of dialogue rendered in your chosen font, color, and background so you can judge legibility before committing.",
      "A separate toggle lets you prefer SDH-style captions, which include descriptions of music and sound effects rather than dialogue alone.",
    ],
    steps: [
      "Open System Settings → Accessibility → Captions",
      "Adjust Style options including font, size, and background",
      "Use the preview text to check readability",
      "Toggle 'Prefer closed captions and SDH' if desired",
    ],
  },
},
{
  id: "macos-sound-recognition",
  title: "Sound Recognition",
  icon: Ear,
  platform: "macos",
  category: "accessibility-language",
  controlType: "action",
  heading: "Get alerts when your Mac hears certain sounds",
  description: "Sound Recognition uses on-device listening to detect sounds such as a doorbell, smoke alarm, or crying baby, and shows a notification on screen so people who are deaf or hard of hearing do not miss them.",
  details: [
    "Built-in categories include fire alarm, doorbell, siren, car horn, and appliance beeps",
    "Notifications appear as an on-screen alert when a matching sound is detected",
    "Processing happens on-device for privacy rather than sending audio to a server",
    "Individual sound categories can be toggled on or off",
  ],
  important: "Sound Recognition is an assistive aid and should not be relied on as the sole way to detect emergencies like fire or smoke alarms.",
  redirectUrl: "https://support.apple.com/guide/mac-help/accessibility-features-for-hearing-mchlb4f015b1/mac",
  whyItMatters: "Many everyday cues, like a smoke alarm, a knock at the door, or a running dishwasher's end-of-cycle beep, are easy to miss for someone who is deaf or hard of hearing, especially when focused on a screen with headphones on. Sound Recognition closes that gap by turning ambient audio events into visible alerts, giving people more independence at home or in the office without needing separate specialized hardware.",
  bestPractices: [
    "Enable only the sound categories that are relevant to your environment to reduce notification noise",
    "Keep the Mac's built-in or connected microphone unobstructed for reliable detection",
    "Pair with visual alert options elsewhere in Accessibility for a fuller notification experience",
    "Test each enabled category using the built-in sound check when first setting it up",
  ],
  commonIssues: [
    { issue: "Sounds are not detected reliably", fix: "Check that the correct input microphone is selected in Sound settings and that it is not muted or blocked." },
    { issue: "Too many false alerts", fix: "Disable categories prone to false positives in your environment, such as appliance beeps in a noisy kitchen." },
    { issue: "No alert appears even though the sound played", fix: "Confirm Notifications are allowed for Sound Recognition alerts in Notification settings." },
  ],
  faqs: [
    { q: "Does Sound Recognition record or upload audio?", a: "No, detection happens on-device and audio is not stored or transmitted." },
    { q: "Can I add custom sounds?", a: "The feature relies on Apple's built-in trained categories rather than user-defined custom sounds." },
    { q: "Does it work with external microphones?", a: "Yes, as long as the microphone is selected as the active sound input device." },
  ],
  tipsAndTricks: [
    "Combine with Flash Screen for alerts so a notification is accompanied by a visible screen flash.",
    "Position your Mac's microphone toward the room rather than facing a wall for better pickup.",
  ],
  relatedSettingIds: ["macos-accessibility", "macos-captions", "macos-sound-output-input"],
  afterImageContent: {
    heading: "How Sound Recognition Works",
    paragraphs: [
      "Sound Recognition continuously analyzes audio picked up by the active microphone against a set of trained sound models built into macOS.",
      "When a match for an enabled category is found, macOS surfaces an on-screen alert describing the detected sound so it can be noticed even without audio cues.",
      "Because matching happens locally, there is no dependency on an internet connection for the feature to function.",
    ],
    steps: [
      "Open System Settings → Accessibility → Sound Recognition",
      "Turn on Sound Recognition",
      "Enable the specific sound categories you want alerts for",
      "Confirm the correct microphone is selected as the sound input",
    ],
  },
},
{
  id: "macos-display-accommodations",
  title: "Display Accommodations",
  icon: Contrast,
  platform: "macos",
  category: "accessibility-language",
  controlType: "action",
  heading: "Reduce motion, increase contrast, and adjust color",
  description: "Display Accommodations groups visual comfort settings such as Reduce Motion, Increase Contrast, Differentiate Without Color, and color filters, letting you tune how the interface renders for visual comfort or color vision differences.",
  details: [
    "Reduce Motion limits animations like zoom and parallax effects",
    "Increase Contrast adds stronger borders and reduces transparency",
    "Differentiate Without Color adds shapes or patterns instead of relying on color alone",
    "Color Filters include options for various forms of color blindness and a general color tint",
    "Contrast and saturation sliders offer additional fine-tuning",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/change-display-preferences-for-accessibility-unac089/mac",
  whyItMatters: "Interface motion, low contrast, and color-only indicators can make macOS harder or even physically uncomfortable to use for people with vestibular sensitivity, low vision, or color vision deficiency. Display Accommodations lets those users adjust the visual language of the system directly rather than requiring every app to be individually redesigned, which means accessibility gains apply broadly and immediately across virtually all software running on the Mac.",
  bestPractices: [
    "Turn on Reduce Motion if animations trigger discomfort or distraction",
    "Combine Increase Contrast with a larger pointer size for better visibility",
    "Choose the color filter type that matches your specific color vision profile rather than a generic one",
    "Revisit Display Accommodations after macOS updates since new visual effects are occasionally added",
  ],
  commonIssues: [
    { issue: "Some third-party apps still show heavy animation", fix: "Reduce Motion primarily affects system-drawn animations; check the app's own settings for a separate motion toggle." },
    { issue: "Color filter makes some UI harder to read instead of easier", fix: "Try a different filter type or adjust the intensity slider, since filters are not one-size-fits-all." },
    { issue: "Increased contrast makes some app icons look odd", fix: "This is expected in a few third-party apps that have not adopted increased-contrast icon variants; it does not affect functionality." },
  ],
  faqs: [
    { q: "Is Reduce Motion the same as Reduce Transparency?", a: "No, they are separate toggles; Reduce Motion targets animation while Reduce Transparency targets translucent interface backgrounds." },
    { q: "Will Display Accommodations change my desktop wallpaper colors?", a: "Color filters can visually tint the entire screen including wallpaper, but they do not alter the underlying image file." },
    { q: "Can I schedule these settings to turn on automatically?", a: "These settings do not have a built-in schedule, though they can be toggled quickly via Accessibility Shortcuts." },
  ],
  tipsAndTricks: [
    "Add Display Accommodations toggles to the Accessibility Shortcut panel for quick access from the menu bar.",
    "Use Pointer outline color adjustments here alongside contrast changes for a more visible cursor.",
  ],
  relatedSettingIds: ["macos-accessibility", "macos-zoom-magnifier", "macos-appearance"],
  afterImageContent: {
    heading: "How Display Accommodations Work",
    paragraphs: [
      "Display Accommodations settings apply system-level rendering changes, such as suppressing certain animation curves or boosting UI element contrast, rather than modifying individual apps.",
      "Color Filters work by applying a real-time color transformation across the whole display, which can be tuned by type and intensity.",
      "Most options here take effect immediately without requiring a restart or app relaunch.",
    ],
    steps: [
      "Open System Settings → Accessibility → Display",
      "Toggle Reduce Motion, Reduce Transparency, or Increase Contrast as needed",
      "Open Color Filters to enable and choose a filter type if needed",
      "Adjust the intensity slider to fine-tune the filter",
    ],
  },
},
{
  id: "macos-pointer-control",
  title: "Pointer Control",
  icon: MousePointer2,
  platform: "macos",
  category: "accessibility-language",
  controlType: "action",
  heading: "Customize pointer size, color, and movement",
  description: "Pointer Control provides accessibility-focused cursor options, including size and color customization, Dwell Control for click-free selection, and Head Pointer for hands-free cursor movement using the camera.",
  details: [
    "Adjustable pointer size and outline/fill color for visibility",
    "Dwell Control clicks automatically when the pointer pauses over an item",
    "Head Pointer moves the cursor using head movement tracked by the camera",
    "Alternate control methods menu for trackpad, mouse, and other input customization",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/change-pointer-control-settings-accessibility-unac899/mac",
  whyItMatters: "A default-sized, thin cursor can be genuinely hard to track for people with low vision, and clicking a physical button is not possible for everyone. Pointer Control addresses both problems: larger, higher-contrast cursors make the pointer easier to locate on screen, while Dwell Control and Head Pointer offer entirely hands-free ways to interact with the Mac, extending usability to people who cannot use a traditional mouse or trackpad at all.",
  bestPractices: [
    "Increase pointer size gradually until it is comfortably visible without becoming distracting",
    "Pair Dwell Control with a longer dwell time at first to avoid accidental clicks",
    "Use Head Pointer in good, consistent lighting for more reliable camera tracking",
    "Combine with Display Accommodations' Increase Contrast for maximum pointer visibility",
  ],
  commonIssues: [
    { issue: "Dwell Control clicks too eagerly", fix: "Increase the dwell time delay in Pointer Control settings so brief pauses do not trigger a click." },
    { issue: "Head Pointer loses tracking", fix: "Improve lighting on your face and reposition the camera so your head stays within frame." },
    { issue: "Enlarged pointer still hard to find", fix: "Use the 'shake pointer to locate' system feature alongside pointer size increases for quicker location." },
  ],
  faqs: [
    { q: "Does Head Pointer require special hardware?", a: "No, it uses the Mac's built-in or connected camera; no additional hardware is required." },
    { q: "Can I use Dwell Control with a trackpad at the same time?", a: "Yes, Dwell Control can supplement rather than replace standard pointing devices." },
    { q: "Will a larger pointer affect app layouts?", a: "No, pointer size is purely a visual accessibility setting and does not change how apps are laid out." },
  ],
  tipsAndTricks: [
    "Try a bright outline color like yellow if you have difficulty distinguishing the default black-and-white pointer.",
    "Use the Dwell Control menu to switch actions like right-click or drag without a physical button.",
  ],
  relatedSettingIds: ["macos-accessibility", "macos-switch-control", "macos-trackpad"],
  afterImageContent: {
    heading: "How Pointer Control Works",
    paragraphs: [
      "Pointer Control settings adjust how the system cursor is rendered and how pointer movement can be generated, independent of the physical input device in use.",
      "Dwell Control monitors pointer position and triggers a click action after the pointer remains stationary for a configurable duration.",
      "Head Pointer uses the camera to track head position and translates that movement into on-screen pointer motion in real time.",
    ],
    steps: [
      "Open System Settings → Accessibility → Pointer Control",
      "Adjust pointer size and color under Appearance",
      "Enable Alternate Control Methods for Dwell Control or Head Pointer",
      "Fine-tune dwell time or tracking sensitivity as needed",
    ],
  },
},
{
  id: "macos-screen-time",
  title: "Screen Time",
  icon: Hourglass,
  platform: "macos",
  category: "accounts-sync-family",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Track and manage device usage",
  description: "Screen Time shows how much time you or a child spend in apps and on websites, and lets you set app limits, downtime schedules, and content restrictions that sync across signed-in Apple devices.",
  details: [
    "Usage reports broken down by app category and website",
    "App Limits to cap daily time in specific apps or categories",
    "Downtime schedules that restrict device use outside chosen hours",
    "Content & Privacy Restrictions for purchases, explicit content, and privacy settings",
    "Syncs across devices signed in with the same Apple Account",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/what-is-screen-time-mchlfb0b5864/mac",
  whyItMatters: "Screen Time turns vague concerns about device usage into concrete, actionable data, which helps both adults trying to build healthier habits and parents managing a child's device access. Because settings sync across a person's Apple devices, limits and restrictions set on a Mac carry over to an iPhone or iPad automatically, so managing screen habits does not require separately configuring each device.",
  bestPractices: [
    "Review the weekly usage summary to spot habit changes rather than only daily numbers",
    "Set App Limits on categories rather than individual apps to cover substitutes like different browsers",
    "Use downtime schedules aligned with actual routines like bedtime rather than arbitrary hours",
    "Set a separate Screen Time passcode from the device passcode when managing a child's account",
  ],
  commonIssues: [
    { issue: "Screen Time settings do not sync to another device", fix: "Confirm both devices are signed in with the same Apple Account and have Screen Time turned on with sharing enabled." },
    { issue: "A blocked app still opens", fix: "Check whether the limit applies to the specific app version or category, and confirm the restriction has not expired for the day." },
    { issue: "Forgotten Screen Time passcode", fix: "Use Apple Account recovery through Screen Time settings, or reset it using the parent's Apple Account credentials." },
  ],
  faqs: [
    { q: "Is Screen Time only for children's accounts?", a: "No, any Apple Account holder can use it to monitor and limit their own usage." },
    { q: "Can I temporarily allow more time for a limited app?", a: "Yes, a one-time extension request can be granted directly from the limit notification." },
    { q: "Does Screen Time track usage in Safari private browsing?", a: "Yes, website usage is still tracked by category even in private browsing windows." },
  ],
  tipsAndTricks: [
    "Use 'Always Allowed' to keep essential apps like Phone or Messages available even during downtime.",
    "Check the Screen Time widget in Notification Center for a quick usage glance without opening settings.",
  ],
  relatedSettingIds: ["macos-family-sharing", "macos-apple-id-icloud", "macos-users-groups"],
  updateFrequency: "Reports refresh daily and weekly",
  afterImageContent: {
    heading: "How Screen Time Works",
    paragraphs: [
      "Screen Time collects local usage data for apps and websites on the Mac and combines it with data from other devices signed into the same Apple Account for a combined report.",
      "Limits and restrictions configured on one device are pushed to other devices in near real time when Share Across Devices is enabled.",
      "For managed child accounts, a separate Screen Time passcode prevents changes to restrictions without parental approval.",
    ],
    steps: [
      "Open System Settings → Screen Time",
      "Turn on Screen Time and review the usage report",
      "Set App Limits or Downtime under the respective sections",
      "Enable Share Across Devices to sync settings",
      "Set a Screen Time passcode if managing another person's account",
    ],
  },
},
{
  id: "macos-icloud-keychain",
  title: "iCloud Keychain",
  icon: KeyRound,
  platform: "macos",
  category: "accounts-sync-family",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Sync passwords and passkeys securely",
  description: "iCloud Keychain securely stores and syncs passwords, passkeys, and payment information across your Apple devices using end-to-end encryption, and can autofill them in Safari and other apps.",
  details: [
    "End-to-end encrypted syncing across signed-in Apple devices",
    "Stores website passwords, Wi-Fi passwords, and passkeys",
    "AutoFill support in Safari and password fields system-wide",
    "Security recommendations flag reused or compromised passwords",
    "Works alongside the standalone Passwords app for browsing saved credentials",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/set-icloud-keychain-autofill-information-mac-mh43699/mac",
  whyItMatters: "Reusing weak passwords across accounts is one of the most common causes of account compromise, and iCloud Keychain directly counters that by making strong, unique, auto-generated passwords as convenient as a weak reused one. Because syncing is end-to-end encrypted, not even Apple can read the stored credentials, which gives users password manager-level security built into the operating system without needing a separate third-party service.",
  bestPractices: [
    "Turn on Security Recommendations to get alerts about weak or reused passwords",
    "Enable two-factor authentication on your Apple Account since it protects Keychain sync",
    "Regularly review saved passwords in the Passwords app and remove old, unused entries",
    "Use suggested strong passwords when creating new accounts instead of typing your own",
  ],
  commonIssues: [
    { issue: "Passwords are not syncing to another Mac or iPhone", fix: "Verify iCloud Keychain is turned on for both devices under Apple ID/iCloud settings and that two-factor authentication is active." },
    { issue: "AutoFill is not offering a saved password", fix: "Check that AutoFill Passwords is enabled in Safari's AutoFill settings and that the site matches the saved entry's domain." },
    { issue: "A device shows as no longer approved for Keychain", fix: "Sign out and back in to iCloud on that device, then re-approve it from a trusted device when prompted." },
  ],
  faqs: [
    { q: "Is iCloud Keychain the same as the Passwords app?", a: "iCloud Keychain is the underlying secure storage and sync system; the Passwords app is the interface used to view and manage what it stores." },
    { q: "Can I export my passwords from iCloud Keychain?", a: "Yes, saved passwords can be exported as an encrypted or plain-text file from the Passwords app for backup or migration." },
    { q: "Does iCloud Keychain store credit card numbers?", a: "Yes, it can store payment card information for AutoFill, separate from Wallet passes." },
  ],
  tipsAndTricks: [
    "Use the built-in password generator when signing up for new accounts to avoid ever typing a weak password.",
    "Check the Security Recommendations list periodically even if you have not had a breach notification.",
  ],
  relatedSettingIds: ["macos-apple-id-icloud", "macos-sign-in-password", "macos-passwords-app"],
  afterImageContent: {
    heading: "How iCloud Keychain Works",
    paragraphs: [
      "iCloud Keychain encrypts saved credentials on-device before they are synced through iCloud, using keys tied to your trusted devices so data remains unreadable in transit and at rest.",
      "When a saved site or app is encountered again, AutoFill offers the matching credential without exposing the underlying password until authenticated with Touch ID or your account password.",
      "Passkeys, a newer passwordless credential type, are stored and synced the same way, replacing traditional passwords for supporting sites.",
    ],
    steps: [
      "Open System Settings → [Your Name] → iCloud → Passwords and Keychain",
      "Turn on Sync this Mac",
      "Open Safari → Settings → AutoFill to confirm passwords are included",
      "Review saved items anytime in the Passwords app",
    ],
  },
},
{
  id: "macos-game-center",
  title: "Game Center",
  icon: Gamepad2,
  platform: "macos",
  category: "accounts-sync-family",
  controlType: "action",
  heading: "Manage your gaming profile and social features",
  description: "Game Center settings control your public gaming profile, friends list, and social features like leaderboards and achievements that sync across Apple devices for supported games.",
  details: [
    "Public profile with nickname, photo, and status",
    "Friends list and friend request management",
    "Options to control who can see your activity or invite you to games",
    "Achievement and leaderboard tracking across compatible games",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/game-center-settings-on-mac-mchle962c097/mac",
  whyItMatters: "Game Center is the social and identity layer underneath cross-device gaming on Apple platforms, letting achievements, leaderboards, and saved progress follow a player between a Mac, iPhone, and iPad rather than being locked to one machine. Managing its privacy controls matters because, left at default settings, it can expose activity or invite requests to a broader audience than intended.",
  bestPractices: [
    "Set who can see your Nickname and invite you to games to Friends Only if you prefer privacy",
    "Use a nickname that does not reveal your real identity if playing with strangers online",
    "Review the friends list periodically and remove requests from unknown accounts",
    "Turn off Game Center notifications separately if achievement alerts become distracting",
  ],
  commonIssues: [
    { issue: "Game progress does not carry over between devices", fix: "Confirm Game Center is signed in with the same Apple Account on both devices and that the specific game supports cloud saves." },
    { issue: "Unwanted friend requests keep arriving", fix: "Set the 'who can send you friend requests' option to a more restrictive setting under Game Center privacy." },
    { issue: "Achievements are not updating", fix: "Check your internet connection and confirm the game itself is up to date, since achievement sync depends on the game's own Game Center integration." },
  ],
  faqs: [
    { q: "Is Game Center required to play games on Mac?", a: "No, many games work without it, but cross-device saves, leaderboards, and multiplayer invites typically require it." },
    { q: "Can I use a different nickname than my Apple Account name?", a: "Yes, your Game Center nickname is separate from your Apple Account name and can be changed." },
    { q: "Does Game Center cost anything?", a: "No, it is a free service included with your Apple Account." },
  ],
  tipsAndTricks: [
    "Check the Games app for a unified view of Game Center friends' activity and achievements across titles.",
    "Use Game Center's 'Recently Played' to quickly relaunch games you tried across devices.",
  ],
  relatedSettingIds: ["macos-apple-id-icloud", "macos-game-controllers", "macos-family-sharing"],
  afterImageContent: {
    heading: "How Game Center Works",
    paragraphs: [
      "Game Center links your Apple Account to a persistent gaming identity that participating games use to store achievements, leaderboard scores, and saved progress in the cloud.",
      "Privacy controls determine what other players, including friends and strangers, can see about your activity or send you, such as invitations and requests.",
      "Progress synced through Game Center is tied to your Apple Account, so signing in on a new Mac restores prior game data automatically for supported titles.",
    ],
    steps: [
      "Open System Settings → Game Center",
      "Sign in with your Apple Account if not already signed in",
      "Edit your Nickname and profile photo as desired",
      "Adjust privacy options for friend requests and activity status",
    ],
  },
},
{
  id: "macos-wallet-apple-pay",
  title: "Wallet & Apple Pay",
  icon: Wallet,
  platform: "macos",
  category: "accounts-sync-family",
  controlType: "action",
  heading: "Manage cards and payments for Apple Pay",
  description: "Wallet & Apple Pay settings let you add and manage credit, debit, and transit cards for use with Apple Pay on the web and in apps, and configure default cards and shipping information.",
  details: [
    "Add and remove cards linked to your Apple Account",
    "Set a default card for Apple Pay purchases",
    "Manage default shipping address and contact info for faster checkout",
    "View recent transactions for supported cards",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/use-wallet-apple-pay-on-mac-mchl4773988b/mac",
  whyItMatters: "Apple Pay on the Mac lets people complete purchases in Safari and supported apps using Touch ID or a nearby paired iPhone, without ever typing a card number into a website. This reduces the number of places a card number is stored online and can meaningfully cut down on checkout friction and card-skimming risk compared with manually entering payment details on every site.",
  bestPractices: [
    "Set a default card that matches your most frequently used payment method",
    "Remove old or expired cards promptly to keep the card list accurate",
    "Keep a default shipping address up to date for faster checkout",
    "Enable Apple Pay only on Macs you personally control given its access to stored payment methods",
  ],
  commonIssues: [
    { issue: "Apple Pay button does not appear on a checkout page", fix: "Confirm the site supports Apple Pay and that Safari is the browser being used, since not all browsers support it on Mac." },
    { issue: "Payment fails despite a valid card", fix: "Check that the Mac has an internet connection and, on Macs without Touch ID, that a paired iPhone or Apple Watch is nearby to confirm the payment." },
    { issue: "A card cannot be added", fix: "Contact the card issuer to confirm the card is enabled for Apple Pay, since some cards or banks are not yet supported." },
  ],
  faqs: [
    { q: "Do I need Touch ID to use Apple Pay on Mac?", a: "No, Macs without Touch ID can confirm payments using a nearby paired iPhone or Apple Watch instead." },
    { q: "Is my card number shared with merchants?", a: "No, Apple Pay uses a device-specific number and transaction code instead of sharing the actual card number." },
    { q: "Can I use Apple Pay in apps as well as Safari?", a: "Yes, any app that integrates Apple Pay checkout can use cards saved here." },
  ],
  tipsAndTricks: [
    "Add a transit card here if your city's transit system supports Apple Pay for tap-to-ride use on paired devices.",
    "Use Wallet's transaction history as a quick way to spot an unfamiliar charge.",
  ],
  relatedSettingIds: ["macos-apple-id-icloud", "macos-icloud-keychain", "macos-sign-in-password"],
  afterImageContent: {
    heading: "How Wallet & Apple Pay Work",
    paragraphs: [
      "Cards added to Wallet are tokenized, meaning a unique device-specific number represents the card rather than storing or transmitting the real card number during purchases.",
      "On checkout, Safari or a supporting app requests payment authorization, which is confirmed using Touch ID, a device passcode, or a nearby paired Apple device.",
      "Shipping and contact information saved here can be offered automatically to speed up checkout forms that support Apple Pay's contact autofill.",
    ],
    steps: [
      "Open System Settings → Wallet & Apple Pay",
      "Click Add Card and follow the prompts to verify with your bank",
      "Set a default card for future purchases",
      "Update default shipping address and contact details as needed",
    ],
  },
},
{
  id: "macos-two-factor-auth",
  title: "Apple Account Security",
  icon: ShieldCheck,
  platform: "macos",
  category: "accounts-sync-family",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Manage two-factor authentication and trusted devices",
  description: "Apple Account Security settings manage two-factor authentication, trusted phone numbers, trusted devices, and recovery options that protect sign-in to your Apple Account across all your devices.",
  details: [
    "List of trusted devices that can receive verification codes",
    "Trusted phone numbers for SMS or voice verification codes",
    "Generate app-specific passwords for third-party apps that need Apple Account access",
    "Account Recovery contact and Recovery Key setup for added protection",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/factor-authentication-apple-account-mchl8bd4e9c2/mac",
  whyItMatters: "Your Apple Account is the key to iCloud data, purchase history, Find My, and iCloud Keychain, so its security settings are some of the highest-impact settings on the entire Mac. Two-factor authentication means a stolen password alone is not enough to access the account, since a code from a trusted device or phone number is also required, substantially reducing the risk of account takeover.",
  bestPractices: [
    "Keep at least one trusted phone number updated in case a trusted device is lost",
    "Set up a Recovery Key or Recovery Contact for added protection against account lockout",
    "Generate a unique app-specific password for each third-party app that requests Apple Account sign-in",
    "Review the trusted devices list periodically and remove devices you no longer own",
  ],
  commonIssues: [
    { issue: "Not receiving two-factor verification codes", fix: "Confirm the trusted phone number is current and that the device has cellular or internet connectivity to receive SMS or push codes." },
    { issue: "Locked out after losing all trusted devices", fix: "Use Account Recovery with a Recovery Key or Recovery Contact if one was set up in advance." },
    { issue: "A third-party app asks for the account password directly", fix: "Generate and use an app-specific password instead of the primary account password for that app." },
  ],
  faqs: [
    { q: "Can I turn off two-factor authentication?", a: "For newer Apple Accounts it is required and cannot be disabled, since it is core to account security." },
    { q: "What is a Recovery Key used for?", a: "It is an alternative 28-character code used to regain access to the account if normal recovery methods are unavailable." },
    { q: "Are app-specific passwords required for every third-party app?", a: "Only for apps that do not support Sign in with Apple and need direct Apple Account access, such as some email clients." },
  ],
  tipsAndTricks: [
    "Store a Recovery Key somewhere safe and offline rather than only in digital notes.",
    "Add a trusted phone number in a different country code if you travel frequently and switch SIMs.",
  ],
  relatedSettingIds: ["macos-apple-id-icloud", "macos-sign-in-password", "macos-icloud-keychain"],
  afterImageContent: {
    heading: "How Apple Account Security Works",
    paragraphs: [
      "Two-factor authentication requires both your password and a six-digit verification code sent to a trusted device or phone number whenever you sign in from a new device or browser.",
      "Trusted devices are ones already signed in and verified with your Apple Account, and they can generate verification codes even without cellular service.",
      "Recovery options, including a Recovery Key and Recovery Contact, exist as a safety net in case all trusted devices and phone numbers become unavailable.",
    ],
    steps: [
      "Open System Settings → [Your Name] → Sign-In & Security",
      "Review Two-Factor Authentication status and trusted phone numbers",
      "Add or remove trusted devices as needed",
      "Set up a Recovery Key or Recovery Contact under advanced security options",
    ],
  },
},
{
  id: "macos-extensions",
  title: "Extensions",
  icon: Puzzle,
  platform: "macos",
  category: "apps-features",
  controlType: "action",
  heading: "Manage Finder, Share, and system extensions",
  description: "Extensions settings let you enable or disable add-ons that other apps install into Finder, the Share menu, Today widgets, and other system surfaces, giving you control over what third-party code can hook into.",
  details: [
    "Finder extensions add custom icons, actions, or sidebar items",
    "Share Menu extensions add destinations like cloud services to the Share sheet",
    "Action extensions add right-click quick actions in Finder",
    "Grouped alongside Login Items in the same settings pane for a unified view of what runs automatically",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/change-login-items-extensions-settings-mtusr003/mac",
  whyItMatters: "Extensions are a common way for apps to quietly extend their reach across the system, whether that is adding a cloud storage option to every Share menu or inserting a Finder sidebar shortcut. Reviewing this list periodically helps catch extensions left behind by uninstalled apps, and gives visibility into what third-party code is actively integrated into core system surfaces like Finder and the Share menu.",
  bestPractices: [
    "Periodically review enabled extensions and disable ones tied to apps you no longer use",
    "Disable Share Menu extensions you never use to keep that menu shorter and faster to scan",
    "Check Finder extensions after installing cloud storage or utility apps, since many add one silently",
    "Investigate any extension you do not recognize before leaving it enabled",
  ],
  commonIssues: [
    { issue: "A Finder sidebar item or icon overlay will not go away", fix: "Find the related extension in Extensions settings and toggle it off, then relaunch Finder." },
    { issue: "Share menu has too many entries", fix: "Disable unused Share Menu extensions from the Extensions list to trim the menu." },
    { issue: "An extension reappears after being disabled", fix: "The parent app may be re-enabling it on launch; check that app's own preferences for an extension toggle." },
  ],
  faqs: [
    { q: "Is this the same as browser extensions?", a: "No, this covers system-level Finder, Share, and Action extensions; browser extensions are managed separately within each browser." },
    { q: "Does disabling an extension uninstall the app?", a: "No, it only stops that specific extension from being active; the parent app remains installed." },
    { q: "Why are Login Items and Extensions combined in one settings pane?", a: "Apple grouped them together since both represent background functionality apps add without an active window." },
  ],
  tipsAndTricks: [
    "Use this pane right after installing a new utility app to see exactly what it added to the system.",
    "Disable extensions one at a time if troubleshooting a Finder slowdown, to isolate the cause.",
  ],
  relatedSettingIds: ["macos-login-items", "macos-general-apps", "macos-mission-control"],
  afterImageContent: {
    heading: "How Extensions Work",
    paragraphs: [
      "macOS exposes defined extension points, such as Finder Sync, Share Menu, and Action extensions, that apps can register into during installation.",
      "The Extensions settings pane lists every registered extension grouped by the app that installed it and by extension type, with a simple toggle to enable or disable each one.",
      "Disabling an extension here removes its presence from the relevant system surface immediately without needing to uninstall the parent app.",
    ],
    steps: [
      "Open System Settings → General → Login Items & Extensions",
      "Scroll to the Extensions section",
      "Expand a category like Finder Extensions or Share Menu",
      "Toggle individual extensions on or off as needed",
    ],
  },
},
{
  id: "macos-passwords-app",
  title: "Passwords App",
  icon: Lock,
  platform: "macos",
  category: "apps-features",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Browse, organize, and share saved credentials",
  description: "The Passwords app provides a dedicated interface for viewing, organizing, and sharing the passwords, passkeys, Wi-Fi passwords, and verification codes stored in iCloud Keychain, separate from Safari's AutoFill settings.",
  details: [
    "Organized views for Passwords, Passkeys, Codes, Wi-Fi, and Security notifications",
    "Shared groups let household or team members access a set of credentials together",
    "Built-in verification code generator for two-factor sign-ins",
    "Security tab flags reused, weak, or leaked passwords",
  ],
  redirectUrl: "https://support.apple.com/guide/passwords/the-passwords-app-mchl901b1b95/mac",
  whyItMatters: "Before this app existed, saved credentials were buried inside Safari's settings, which made it easy to forget how many accounts were actually stored or overlook weak, reused passwords. Having a standalone Passwords app makes credential management a first-class task rather than an afterthought, and Shared Groups make it realistic to securely share things like a family streaming password without texting it in plain text.",
  bestPractices: [
    "Check the Security tab periodically for compromised or reused password warnings",
    "Use Shared Groups instead of messaging or emailing passwords to family or teammates",
    "Store verification codes here for accounts that support built-in two-factor codes",
    "Delete entries for accounts you have closed to keep the list accurate",
  ],
  commonIssues: [
    { issue: "A saved password is missing after updating macOS", fix: "Confirm iCloud Keychain sync is enabled, since the Passwords app reads directly from Keychain data." },
    { issue: "Shared Group member cannot see an added password", fix: "Confirm they accepted the share invitation and that the password was added to the shared group rather than kept private." },
    { issue: "Verification codes are not generating", fix: "Re-scan the setup QR code or re-enter the secret key for that account's two-factor setup." },
  ],
  faqs: [
    { q: "Is the Passwords app a separate service from iCloud Keychain?", a: "No, it is a front-end for the same underlying iCloud Keychain data, just presented in a dedicated app." },
    { q: "Can I import passwords from another password manager?", a: "Yes, the app supports importing from a CSV file exported by most password managers." },
    { q: "Do Shared Group members see my other private passwords?", a: "No, only passwords explicitly added to the shared group are visible to its members." },
  ],
  tipsAndTricks: [
    "Use the built-in verification code feature to avoid needing a separate authenticator app for many services.",
    "Search directly within the app to jump to a saved login instead of digging through Safari.",
  ],
  relatedSettingIds: ["macos-icloud-keychain", "macos-sign-in-password", "macos-family-sharing"],
  afterImageContent: {
    heading: "How the Passwords App Works",
    paragraphs: [
      "The Passwords app reads and writes to the same end-to-end encrypted iCloud Keychain store used for Safari AutoFill, presenting it in a searchable, categorized interface.",
      "Shared Groups create an encrypted subset of entries accessible to invited people, who must accept an invitation before gaining access.",
      "Security recommendations are generated by comparing stored passwords against patterns of reuse and known compromised credential lists, without exposing plaintext passwords externally.",
    ],
    steps: [
      "Open the Passwords app from Launchpad or System Settings → Passwords",
      "Authenticate with Touch ID or your account password",
      "Browse or search saved Passwords, Passkeys, and Wi-Fi entries",
      "Create a Shared Group under the sidebar to share select credentials",
    ],
  },
},
{
  id: "macos-game-controllers",
  title: "Game Controllers",
  icon: Gamepad2,
  platform: "macos",
  category: "apps-features",
  controlType: "action",
  heading: "Pair and configure game controllers",
  description: "Game Controllers settings let you pair Bluetooth controllers such as PlayStation DualSense, Xbox Wireless Controllers, and MFi controllers with your Mac, and customize button mapping for supported games.",
  details: [
    "Bluetooth pairing management for supported controller models",
    "Per-controller button remapping for compatible games",
    "Battery level display for paired controllers",
    "Home Button and Menu Button behavior customization",
  ],
  redirectUrl: "https://support.apple.com/guide/games/connect-a-game-controller-devf8cec167c/mac",
  whyItMatters: "Native game controller support means Mac gaming does not require third-party drivers or workaround software just to get a controller recognized, since macOS handles pairing and button mapping directly at the system level. This matters increasingly as more games ship with full controller support on Mac, and consistent system-level remapping means preferences carry across every compatible game rather than needing per-game configuration.",
  bestPractices: [
    "Charge the controller before extended use, since Bluetooth game controllers can draw more power than typical accessories",
    "Remap buttons here rather than per-game when a mapping preference applies across your whole library",
    "Keep controller firmware updated through the manufacturer's companion app when available",
    "Unpair controllers you no longer use to keep the Bluetooth device list manageable",
  ],
  commonIssues: [
    { issue: "Controller will not pair", fix: "Put the controller into pairing mode per its manual, then pair it from Bluetooth settings rather than Game Controllers directly." },
    { issue: "Controller disconnects during gameplay", fix: "Move closer to the Mac to reduce Bluetooth interference, and check the controller's battery level." },
    { issue: "Button mapping does not apply in a specific game", fix: "Confirm the game supports macOS controller remapping; some games use their own independent control scheme." },
  ],
  faqs: [
    { q: "Which controllers are supported?", a: "Most MFi-certified controllers, along with recent PlayStation DualSense and Xbox Wireless Controllers, are supported natively." },
    { q: "Can I use a wired controller?", a: "Yes, many controllers also support a wired USB connection in addition to Bluetooth." },
    { q: "Does remapping work in every game?", a: "Only in games that use the system's standard controller framework; some games implement their own separate control mapping." },
  ],
  tipsAndTricks: [
    "Use the Game Overlay, accessible via a controller button combination, to check controller status without leaving a game.",
    "Pair the controller directly through Bluetooth settings first if it does not appear immediately in Game Controllers.",
  ],
  relatedSettingIds: ["macos-bluetooth", "macos-game-center", "macos-mouse"],
  afterImageContent: {
    heading: "How Game Controllers Settings Work",
    paragraphs: [
      "macOS uses a built-in Game Controller framework that recognizes supported Bluetooth and USB controllers automatically once paired, exposing their inputs to any game that adopts the framework.",
      "The Game Controllers settings pane surfaces connected controllers along with battery status and remapping options that apply system-wide for supporting titles.",
      "Button remapping is stored per controller, so preferences persist across games and even across different Macs if paired again with the same Apple Account signed in.",
    ],
    steps: [
      "Open System Settings → Game Controllers",
      "Pair a new controller via Bluetooth settings if not already listed",
      "Select the controller to view battery status and options",
      "Adjust button remapping under the controller's settings if supported",
    ],
  },
},
{
  id: "macos-universal-control",
  title: "Universal Control",
  icon: Move,
  platform: "macos",
  category: "apps-features",
  controlType: "action",
  heading: "Control an iPad or another Mac with one keyboard and mouse",
  description: "Universal Control lets you use a single keyboard and mouse or trackpad to work seamlessly across a Mac and a nearby iPad or second Mac, and drag content such as files and images between them.",
  details: [
    "Works over Wi-Fi and Bluetooth without any cabling once set up",
    "Move the cursor off the edge of one screen and onto another device's screen",
    "Drag and drop files, images, and text directly between connected devices",
    "Supports connecting up to two additional nearby devices at once",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/keyboard-mouse-control-mac-ipad-mchl412faecf/mac",
  whyItMatters: "For people who work across a Mac and an iPad side by side, Universal Control removes the friction of physically switching input devices or using a separate remote-desktop app just to move a file or a line of text between them. It effectively turns two or three separate devices into one extended, controllable workspace, which especially benefits designers, writers, and anyone using an iPad as a secondary reference or drawing surface next to a Mac.",
  bestPractices: [
    "Position devices physically in the arrangement that matches their onscreen Display arrangement for intuitive cursor movement",
    "Keep both devices signed in with the same Apple Account and near each other with Wi-Fi and Bluetooth enabled",
    "Disable Universal Control when not in use if you frequently work near other people's Macs to avoid accidental connections",
    "Use drag and drop between devices for quick file transfers instead of AirDrop for small, frequent moves",
  ],
  commonIssues: [
    { issue: "Cursor will not move to the other device", fix: "Confirm both devices have Wi-Fi, Bluetooth, and Handoff turned on, and are signed in with the same Apple Account." },
    { issue: "Universal Control disconnects randomly", fix: "Move devices closer together and reduce Wi-Fi network congestion, since range and interference affect the connection." },
    { issue: "A nearby device does not appear as an option", fix: "Check that the device meets compatibility requirements and that Universal Control is enabled in its own settings." },
  ],
  faqs: [
    { q: "Do I need to be on the same Wi-Fi network?", a: "It works best on the same network, but can also function using peer-to-peer Bluetooth and Wi-Fi in range." },
    { q: "Can I use Universal Control with three devices at once?", a: "Yes, up to two additional devices can be connected alongside the Mac you are controlling from." },
    { q: "Does it work with a Magic Keyboard case on the iPad?", a: "Yes, but you can only actively type on one device's keyboard at a time; the cursor determines which device receives input." },
  ],
  tipsAndTricks: [
    "Arrange devices in Displays settings to match their physical desk layout for a natural cursor handoff.",
    "Drag a photo straight from Preview on the Mac onto a Notes page open on the iPad to move it instantly.",
  ],
  relatedSettingIds: ["macos-airdrop-handoff", "macos-wifi", "macos-bluetooth"],
  afterImageContent: {
    heading: "How Universal Control Works",
    paragraphs: [
      "Universal Control detects nearby compatible Apple devices signed into the same Apple Account and establishes a peer-to-peer connection over Wi-Fi and Bluetooth.",
      "Once connected, pushing the mouse cursor toward the edge of one screen shared with another device seamlessly transfers keyboard and pointer input to that device.",
      "Files and content dragged across the cursor boundary are transferred between devices in real time, similar to a local drag-and-drop operation.",
    ],
    steps: [
      "Open System Settings → Displays → Advanced (or Universal Control button)",
      "Enable 'Allow your cursor and keyboard to move between any nearby Mac or iPad'",
      "Bring a compatible, signed-in device physically close to the Mac",
      "Move the cursor to the shared screen edge to begin controlling the other device",
    ],
  },
},
{
  id: "macos-ethernet",
  title: "Ethernet",
  icon: Cable,
  platform: "macos",
  category: "connectivity-network",
  controlType: "action",
  heading: "Configure wired network connections",
  description: "Ethernet settings manage wired network connections through built-in Ethernet ports or USB and Thunderbolt adapters, including IP configuration, DNS, and connection priority relative to Wi-Fi.",
  details: [
    "Automatic or manual IP address configuration (DHCP, BootP, or manual)",
    "Custom DNS server and search domain entry",
    "Service order controls whether Ethernet or Wi-Fi takes priority when both are connected",
    "Support for multiple Ethernet adapters shown as separate services",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/ethernet-settings-on-mac-mh11939/mac",
  whyItMatters: "A wired Ethernet connection typically offers more consistent latency and throughput than Wi-Fi, which matters for tasks like large file transfers, video conferencing, or working with network-attached storage. Correctly configuring Ethernet, including its priority relative to Wi-Fi, ensures the Mac actually uses the faster, more reliable connection instead of silently falling back to wireless.",
  bestPractices: [
    "Set Ethernet above Wi-Fi in Network service order if you want it prioritized automatically",
    "Use DHCP unless your network administrator has specifically provided static IP details",
    "Label multiple Ethernet adapters descriptively if you regularly switch between networks",
    "Verify a solid link light on the adapter or port if a wired connection is not showing as active",
  ],
  commonIssues: [
    { issue: "Mac still uses Wi-Fi even with Ethernet connected", fix: "Reorder network services in Network settings' three-dot menu so Ethernet is listed above Wi-Fi." },
    { issue: "Ethernet adapter is not detected", fix: "Confirm the adapter is compatible with your Mac's port type and try a different cable or port to rule out a hardware fault." },
    { issue: "No internet access despite an active Ethernet link", fix: "Check DNS and IP configuration, and try renewing the DHCP lease from the Ethernet service's TCP/IP settings." },
  ],
  faqs: [
    { q: "Do all Macs have a built-in Ethernet port?", a: "No, many current Mac laptops require a USB-C or Thunderbolt to Ethernet adapter since they lack a built-in port." },
    { q: "Can I use Ethernet and Wi-Fi at the same time?", a: "Yes, both can be active simultaneously, with the service order determining which is preferred for outgoing traffic." },
    { q: "Is Ethernet faster than Wi-Fi?", a: "Typically yes for consistency and latency, though maximum speed depends on your specific router, adapter, and cabling." },
  ],
  tipsAndTricks: [
    "Use a Thunderbolt to 10GbE adapter for high-throughput tasks like editing video off network storage.",
    "Check the small colored status dot next to each network service in settings to quickly see which connections are active.",
  ],
  relatedSettingIds: ["macos-wifi", "macos-thunderbolt-bridge", "macos-proxies"],
  afterImageContent: {
    heading: "How Ethernet Settings Work",
    paragraphs: [
      "Each physical or adapter-based Ethernet connection appears as a separate network service that can be independently configured with its own IP and DNS settings.",
      "macOS uses the network service order list to decide which active connection handles outgoing traffic when multiple services, such as Ethernet and Wi-Fi, are connected at once.",
      "Advanced settings allow manual IP configuration for environments that require static addressing rather than automatic DHCP assignment.",
    ],
    steps: [
      "Open System Settings → Network",
      "Select the Ethernet service from the sidebar",
      "Configure IP settings under Details, choosing DHCP or Manual",
      "Reorder services via the three-dot menu → Set Service Order if needed",
    ],
  },
},
{
  id: "macos-firewall",
  title: "Firewall",
  icon: ShieldAlert,
  platform: "macos",
  category: "connectivity-network",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Block unwanted incoming network connections",
  description: "The built-in Firewall controls which apps and services are allowed to accept incoming network connections, adding a layer of protection against unauthorized access while connected to any network.",
  details: [
    "Per-app rules to allow or block incoming connections",
    "Stealth Mode to prevent the Mac from responding to network probes",
    "Automatically allows signed apps and built-in services by default when enabled",
    "Firewall logging for reviewing blocked connection attempts",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/block-connections-to-your-mac-with-a-firewall-mh34041/mac",
  whyItMatters: "On shared or untrusted networks, such as public Wi-Fi, an active firewall reduces the attack surface by blocking unsolicited incoming connections that could otherwise probe for open services or vulnerabilities. It is a foundational, low-effort security layer that works underneath whatever apps you are running, complementing rather than replacing safe browsing habits and up-to-date software.",
  bestPractices: [
    "Turn on Stealth Mode when frequently using public or untrusted networks",
    "Review the app rules list periodically and remove entries for apps you have uninstalled",
    "Allow incoming connections only for apps you specifically expect to receive them, such as file-sharing or remote-access tools",
    "Keep the firewall enabled by default and only disable temporarily for specific troubleshooting",
  ],
  commonIssues: [
    { issue: "A local network app like a media server cannot be discovered", fix: "Add the app to the Firewall's allowed list, or temporarily disable the firewall to confirm it is the cause before permanently allowing it." },
    { issue: "File sharing between Macs on the same network fails", fix: "Confirm File Sharing is both enabled in Sharing settings and allowed through the Firewall's app rules." },
    { issue: "Firewall setting reverts after a major macOS update", fix: "Re-enable Firewall and re-add custom app rules if a major upgrade reset network preferences." },
  ],
  faqs: [
    { q: "Does the Firewall block outgoing connections too?", a: "No, macOS's built-in Firewall primarily manages incoming connections, not outgoing traffic." },
    { q: "Is Stealth Mode the same as being invisible on a network?", a: "It prevents the Mac from responding to certain network probing techniques like ping, but the Mac can still be visible through other means such as file sharing announcements." },
    { q: "Do I still need the Firewall if I use a VPN?", a: "Yes, a VPN encrypts and routes traffic but does not replace the local incoming-connection filtering the Firewall provides." },
  ],
  tipsAndTricks: [
    "Combine Stealth Mode with disabling unused sharing services in Sharing settings for a tighter security posture on public networks.",
    "Check Firewall Options' logging output when diagnosing why a specific local app cannot connect.",
  ],
  relatedSettingIds: ["macos-vpn-network", "macos-screen-sharing", "macos-wifi"],
  afterImageContent: {
    heading: "How the Firewall Works",
    paragraphs: [
      "When enabled, the Firewall inspects incoming network connection requests and compares them against a list of explicitly allowed apps and services, blocking anything not permitted.",
      "Built-in macOS services required for normal operation, and apps signed with a valid Apple Developer certificate, are generally allowed automatically unless configured otherwise.",
      "Stealth Mode adds an extra layer by making the Mac ignore certain probing requests entirely rather than responding with a 'connection refused' message, making it harder to detect on a network.",
    ],
    steps: [
      "Open System Settings → Network → Firewall",
      "Turn on Firewall",
      "Click Options to review or add per-app rules",
      "Enable Stealth Mode under Options for additional protection",
    ],
  },
},
{
  id: "macos-proxies",
  title: "Proxies",
  icon: Network,
  platform: "macos",
  category: "connectivity-network",
  controlType: "action",
  heading: "Configure network proxy servers",
  description: "Proxy settings let you route web and other network traffic for a given network connection through a specified proxy server, either configured manually or automatically via a PAC file or auto-discovery protocol.",
  details: [
    "Support for HTTP, HTTPS, SOCKS, FTP, and streaming proxy protocols",
    "Automatic proxy configuration via URL (PAC file) or auto-discovery",
    "Per-network-service proxy configuration, so different networks can use different proxies",
    "Bypass list for hosts and domains that should skip the proxy",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/change-proxy-settings-on-mac-mchlp2591/mac",
  whyItMatters: "Proxy configuration is most often required in managed corporate or school networks that route traffic through a filtering or monitoring proxy for security and compliance reasons. Getting it right ensures internal resources, VPN-gated systems, and internet access all work correctly, while an incorrect proxy setting can silently break internet connectivity in ways that look like a broader network problem.",
  bestPractices: [
    "Get exact proxy server details from your network administrator rather than guessing values",
    "Use the bypass list to exclude local or internal addresses that should not go through the proxy",
    "Prefer automatic proxy configuration (PAC or auto-discovery) when your organization provides it, since it adapts automatically",
    "Disable proxies you no longer need, since a stale proxy configuration is a common cause of intermittent connectivity issues",
  ],
  commonIssues: [
    { issue: "No internet access after configuring a proxy", fix: "Double-check the proxy server address and port for typos, and confirm the proxy server is actually reachable and running." },
    { issue: "Some sites load but others do not through the proxy", fix: "Check whether HTTPS proxy settings are configured separately from HTTP, since they can differ." },
    { issue: "Proxy settings do not apply to a specific app", fix: "Some apps use their own network stack and ignore system proxy settings; check that app's own network preferences." },
  ],
  faqs: [
    { q: "Do proxy settings apply system-wide?", a: "They apply to most apps that use the system network stack, though some apps may bypass system proxy configuration." },
    { q: "Is a proxy the same as a VPN?", a: "No, a proxy typically routes specific protocols like web traffic, while a VPN usually encrypts and tunnels all network traffic." },
    { q: "Can I set different proxies for Wi-Fi and Ethernet?", a: "Yes, proxy settings are configured per network service, so Wi-Fi and Ethernet can each have independent settings." },
  ],
  tipsAndTricks: [
    "Use the 'Exclude simple hostnames' bypass option to keep local network device access fast and proxy-free.",
    "Test the proxy in a browser first before assuming it is a system-wide configuration problem.",
  ],
  relatedSettingIds: ["macos-ethernet", "macos-vpn-network", "macos-firewall"],
  afterImageContent: {
    heading: "How Proxy Settings Work",
    paragraphs: [
      "When a proxy is configured, network requests matching the specified protocol are routed through the proxy server instead of connecting directly to the destination.",
      "Automatic configuration methods, such as a PAC file, let a network administrator centrally control proxy behavior without each Mac needing manual entry.",
      "The bypass list excludes specified hosts or domains from proxy routing, which is commonly used for local network resources.",
    ],
    steps: [
      "Open System Settings → Network → select a network service → Proxies",
      "Choose the proxy protocol to configure, such as Web Proxy (HTTP)",
      "Enter the proxy server address and port, or provide a PAC configuration URL",
      "Add any required bypass domains, then click OK to apply",
    ],
  },
},
{
  id: "macos-thunderbolt-bridge",
  title: "Thunderbolt Bridge",
  icon: Zap,
  platform: "macos",
  category: "connectivity-network",
  controlType: "action",
  heading: "Network two Macs directly over Thunderbolt",
  description: "Thunderbolt Bridge creates a direct, high-speed network connection between two Macs connected with a Thunderbolt cable, useful for fast file transfers or Target Disk Mode-style workflows without a router.",
  details: [
    "Appears as its own network service once a Thunderbolt cable is connected between two Macs",
    "Supports IP configuration just like Ethernet or Wi-Fi services",
    "Offers significantly higher throughput than typical Wi-Fi or standard Ethernet",
    "Useful for migrating large amounts of data directly between two Macs",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/ip-thunderbolt-connect-mac-computers-mchld53dd2f5/mac",
  whyItMatters: "When moving very large amounts of data between two Macs, such as during a computer migration or transferring a large video project, a direct Thunderbolt connection can be dramatically faster and more reliable than going through Wi-Fi or a shared network switch. It essentially turns a simple cable into a private, high-bandwidth network link between exactly two machines.",
  bestPractices: [
    "Use a certified Thunderbolt cable rather than a generic USB-C cable for full speed",
    "Set static IP addresses on each Mac's Thunderbolt Bridge service if automatic addressing does not connect promptly",
    "Use Thunderbolt Bridge specifically for large local transfers rather than everyday internet access",
    "Disconnect the cable when finished to avoid confusion with other active network services",
  ],
  commonIssues: [
    { issue: "Thunderbolt Bridge service does not appear", fix: "Confirm the cable and ports on both Macs support Thunderbolt, and that the cable is fully seated on both ends." },
    { issue: "The two Macs cannot see each other over the bridge", fix: "Manually assign compatible static IP addresses to each Mac's Thunderbolt Bridge service, such as 169.254.1.1 and 169.254.1.2." },
    { issue: "Transfer speeds are lower than expected", fix: "Confirm both Macs and the cable support the same Thunderbolt generation, since mismatched hardware can cap speed to the slowest component." },
  ],
  faqs: [
    { q: "Do I need special software for Thunderbolt Bridge?", a: "No, it is built into macOS and appears automatically as a network service once a compatible cable connects two Macs." },
    { q: "Can I use Thunderbolt Bridge for internet sharing?", a: "It is primarily designed for direct Mac-to-Mac networking rather than sharing an internet connection, though internet sharing can technically be layered on top." },
    { q: "Is this the same as Target Disk Mode?", a: "No, Target Disk Mode shares a Mac's storage as an external drive, while Thunderbolt Bridge creates a standard IP network connection." },
  ],
  tipsAndTricks: [
    "Use Migration Assistant over a Thunderbolt Bridge connection for the fastest possible Mac-to-Mac data migration.",
    "Rename the Thunderbolt Bridge service in Network settings if you use it often, to make it easier to find.",
  ],
  relatedSettingIds: ["macos-ethernet", "macos-airdrop-handoff", "macos-storage-management"],
  afterImageContent: {
    heading: "How Thunderbolt Bridge Works",
    paragraphs: [
      "When a Thunderbolt cable connects two Macs, macOS automatically creates a Thunderbolt Bridge network service on each machine that functions like a private point-to-point Ethernet connection.",
      "IP addressing can be assigned automatically via link-local addressing or configured manually for a predictable, reliable connection.",
      "Because the connection bypasses any router or switch, its throughput is limited mainly by the Thunderbolt generation of the cable and both Macs' ports rather than network congestion.",
    ],
    steps: [
      "Connect both Macs with a Thunderbolt cable",
      "Open System Settings → Network on each Mac",
      "Confirm the Thunderbolt Bridge service appears and shows as connected",
      "Assign IP addresses manually if automatic addressing does not connect",
    ],
  },
},
{
  id: "macos-personal-hotspot",
  title: "Personal Hotspot",
  icon: Smartphone,
  platform: "macos",
  category: "connectivity-network",
  controlType: "action",
  heading: "Connect to an iPhone or iPad's cellular internet",
  description: "Personal Hotspot settings let a Mac connect to the internet through a nearby iPhone or iPad's cellular data connection, either automatically via Instant Hotspot or by manually joining the hotspot network.",
  details: [
    "Instant Hotspot shows nearby personal hotspots directly in the Wi-Fi menu without a password",
    "Displays signal strength and battery level of the source device",
    "Automatically connects when Wi-Fi is unavailable if enabled",
    "Works over Wi-Fi, Bluetooth, or USB depending on the paired device connection",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/iphone-ipad-connect-mac-internet-mchl7594e36f/mac",
  whyItMatters: "When traveling or working somewhere without reliable Wi-Fi, being able to tap into an iPhone's cellular connection directly from the Mac's Wi-Fi menu, without hunting for a password, keeps work uninterrupted. Instant Hotspot in particular removes the usual friction of manual hotspot setup since it relies on the same Apple Account and Bluetooth pairing already trusted between your devices.",
  bestPractices: [
    "Keep the iPhone or iPad's Bluetooth and Wi-Fi both on for Instant Hotspot to appear reliably",
    "Monitor cellular data usage when relying on Personal Hotspot for extended work sessions",
    "Keep the source device plugged in or charged, since hotspot mode increases battery drain",
    "Use a USB cable connection for the most stable and fastest hotspot link when both devices are stationary",
  ],
  commonIssues: [
    { issue: "iPhone's hotspot does not appear in the Mac's Wi-Fi list", fix: "Confirm both devices are signed in with the same Apple Account and have Bluetooth and Wi-Fi enabled, then keep them close together." },
    { issue: "Connection drops frequently", fix: "Check cellular signal strength on the source device and move to an area with better coverage." },
    { issue: "Hotspot is available but very slow", fix: "Confirm the cellular plan has available data and check whether Low Data Mode is enabled on the source device." },
  ],
  faqs: [
    { q: "Does Personal Hotspot require a separate hotspot plan?", a: "It depends on the carrier; some plans include hotspot data by default while others charge extra or require it be added." },
    { q: "Can multiple Macs connect to the same hotspot at once?", a: "Yes, though shared cellular data and speed will be divided among connected devices." },
    { q: "Does this drain the iPhone's battery quickly?", a: "Yes, acting as a hotspot uses more battery than normal use, so keeping it charged is recommended for longer sessions." },
  ],
  tipsAndTricks: [
    "Use Instant Hotspot as a fast fallback whenever your regular Wi-Fi network briefly drops.",
    "Rename the Personal Hotspot in the source device's settings for easier identification if multiple family hotspots are nearby.",
  ],
  relatedSettingIds: ["macos-wifi", "macos-bluetooth", "macos-airdrop-handoff"],
  afterImageContent: {
    heading: "How Personal Hotspot Works",
    paragraphs: [
      "Instant Hotspot uses Bluetooth to detect a nearby trusted iPhone or iPad and lists its hotspot directly in the Mac's Wi-Fi menu without requiring a manually entered password.",
      "Selecting the hotspot establishes a Wi-Fi connection routed through the source device's cellular data, functioning like any other internet-providing Wi-Fi network.",
      "The Mac displays the source device's remaining battery and signal strength so you can judge connection reliability at a glance.",
    ],
    steps: [
      "Ensure the iPhone or iPad is signed in with the same Apple Account and has Bluetooth on",
      "Open the Wi-Fi menu on the Mac and look under Personal Hotspots",
      "Select the device's hotspot to connect automatically",
      "Monitor the connected device's battery and data usage during use",
    ],
  },
},
{
  id: "macos-battery",
  title: "Battery",
  icon: BatteryFull,
  platform: "macos",
  category: "devices-peripherals",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Monitor and manage battery health and power",
  description: "Battery settings show battery level history, condition, and power usage by app on Mac laptops, and let you configure power modes and options like optimized battery charging.",
  details: [
    "Battery Health section shows maximum capacity and cycle count",
    "Power Mode selection between Low Power, Automatic, and High Power (on supported models)",
    "Optimized Battery Charging slows charging past 80% to reduce battery aging",
    "Usage history graph showing battery level and screen-on time over the past 24 hours or 10 days",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/change-battery-settings-mchlfc3b7879/mac",
  whyItMatters: "Lithium-ion batteries degrade with every full charge cycle, and features like Optimized Battery Charging directly extend a MacBook's usable lifespan by reducing time spent at a full charge, which is when batteries age fastest. Being able to see cycle count and maximum capacity also gives an early, objective signal of when a battery may need service, rather than only noticing a problem once daily battery life has already dropped noticeably.",
  bestPractices: [
    "Leave Optimized Battery Charging enabled for daily use to slow long-term battery aging",
    "Use Low Power Mode when working away from an outlet for longer battery life",
    "Check Battery Health periodically, especially on Macs more than a couple of years old",
    "Avoid routinely running the battery all the way to 0% or leaving it at 100% plugged in for extended periods",
  ],
  commonIssues: [
    { issue: "Battery health shows 'Service Recommended'", fix: "Have the battery evaluated at an Apple Store or authorized service provider, since this indicates significantly reduced capacity or an irregularity." },
    { issue: "Battery drains faster than expected", fix: "Check the App usage list in Battery settings to identify apps consuming disproportionate energy, and consider quitting or updating them." },
    { issue: "Mac stays at 80% charge and won't go higher", fix: "This can happen with Optimized Battery Charging if the Mac has learned your routine; unplug and replug, or temporarily disable the feature if 100% is needed immediately." },
  ],
  faqs: [
    { q: "What does cycle count mean?", a: "One cycle equals using an amount of battery equal to 100% of capacity, whether from a single full discharge or several partial ones added together." },
    { q: "Does Low Power Mode affect display brightness?", a: "It can reduce some background activity and performance, and may dim the display slightly, to extend battery runtime." },
    { q: "Is it bad to keep my MacBook plugged in all the time?", a: "Optimized Battery Charging and battery health management are designed to make this safe for the battery over the long term." },
  ],
  tipsAndTricks: [
    "Use the 24-hour battery graph to correlate specific usage spikes with faster battery drain.",
    "Switch to High Power Mode temporarily on supported models for demanding tasks like video export.",
  ],
  relatedSettingIds: ["macos-displays", "macos-storage-management", "macos-software-update"],
  updateFrequency: "Updates continuously while in use",
  afterImageContent: {
    heading: "How Battery Settings Work",
    paragraphs: [
      "macOS tracks battery charge level, cycle count, and per-app energy usage continuously, aggregating this into the graphs and lists shown in Battery settings.",
      "Battery Health Management learns your daily charging pattern over time and adjusts the charge curve to reduce time spent at full charge without disrupting availability when you need it.",
      "Power Mode settings adjust CPU and GPU performance scaling to trade off between battery life and peak performance depending on the selected mode.",
    ],
    steps: [
      "Open System Settings → Battery",
      "Review the Battery Level graph and Battery Health details",
      "Choose a Power Mode under the Power Mode section if available on your Mac",
      "Toggle Optimized Battery Charging under Battery Health if desired",
    ],
  },
},
{
  id: "macos-cds-dvds",
  title: "CDs & DVDs",
  icon: Disc,
  platform: "macos",
  category: "devices-peripherals",
  controlType: "action",
  heading: "Set default actions for inserted discs",
  description: "CDs & DVDs settings let you choose what happens automatically when you insert a music CD, picture CD, video DVD, or blank disc into a connected optical drive, such as opening a specific app.",
  details: [
    "Separate default action settings for music CDs, picture CDs, video DVDs, and blank discs",
    "Options include opening a chosen app, running a script, or doing nothing",
    "Applies to external USB SuperDrives since modern Macs lack built-in optical drives",
    "Settings persist across different discs of the same type",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/choose-mac-insert-a-cd-dvd-mchlp1354/mac",
  whyItMatters: "Even though modern Macs no longer include a built-in optical drive, many people still use an external USB SuperDrive to rip old music collections, watch legacy DVDs, or archive old photo CDs, and this pane controls what happens the moment such a disc is connected. Setting sensible defaults avoids an unwanted app launching every time, or conversely, having to manually locate and open the right app each time a disc is inserted.",
  bestPractices: [
    "Set music CDs to open your preferred media app so ripping or listening starts immediately",
    "Choose 'Ignore' for disc types you rarely use to avoid unwanted apps launching automatically",
    "Set blank discs to open a specific burning app if you frequently create backup or audio discs",
    "Eject discs properly through Finder rather than physically forcing the drive when possible",
  ],
  commonIssues: [
    { issue: "The wrong app opens automatically when a disc is inserted", fix: "Change the corresponding disc type's default action in CDs & DVDs settings to the app you actually want." },
    { issue: "No app opens at all for a disc type", fix: "Check that the setting for that disc type is not set to Ignore, and choose an appropriate app instead." },
    { issue: "An external optical drive is not recognized", fix: "Confirm the SuperDrive is properly connected via USB and try a different port, since some drives need direct connection rather than through a hub." },
  ],
  faqs: [
    { q: "Do current Macs have a CD/DVD drive built in?", a: "No, current Mac models require an external USB SuperDrive or third-party optical drive for CDs and DVDs." },
    { q: "Can I set different actions for music versus video discs?", a: "Yes, each disc type has its own independent default action setting." },
    { q: "Will this setting affect ripping software I already use?", a: "No, it only controls what launches automatically on insert; you can still manually open any app to work with the disc." },
  ],
  tipsAndTricks: [
    "Set picture CDs to open Photos automatically if you regularly import from old photo CDs.",
    "Use 'Run script' for advanced automated workflows, such as automatically backing up disc contents on insert.",
  ],
  relatedSettingIds: ["macos-storage-management", "macos-printers-scanners", "macos-general-apps"],
  afterImageContent: {
    heading: "How CDs & DVDs Settings Work",
    paragraphs: [
      "macOS detects the type of disc inserted, whether it is a music CD, video DVD, picture CD, or blank disc, and checks the corresponding default action configured in this pane.",
      "If an app is selected as the default action, that app launches automatically and is typically handed the disc to process, such as a media player beginning playback.",
      "These preferences apply the same way whether the optical drive is a legacy internal one or a modern external USB SuperDrive.",
    ],
    steps: [
      "Connect an external optical drive if your Mac does not have one built in",
      "Open System Settings → General → CDs & DVDs",
      "Choose a default action for each disc type from its dropdown menu",
      "Insert a disc to confirm the chosen app or action triggers correctly",
    ],
  },
},
{
  id: "macos-dictation",
  title: "Dictation",
  icon: Mic,
  platform: "macos",
  category: "devices-peripherals",
  controlType: "action",
  heading: "Turn speech into text anywhere you type",
  description: "Dictation lets you speak instead of type in nearly any text field on the Mac, converting speech to text using either on-device processing or enhanced online recognition depending on the language and settings.",
  details: [
    "Toggle-able keyboard shortcut to start and stop dictation, such as pressing the Fn key twice",
    "Language selection independent of the system display language",
    "Offline (on-device) dictation available for many languages on supported Macs",
    "Automatic punctuation option that inserts punctuation from spoken cues",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/use-dictation-mh40584/mac",
  whyItMatters: "Dictation offers a genuinely fast alternative input method for people who type slowly, have RSI or other conditions that make prolonged typing uncomfortable, or simply think faster than they can type. Because it works inside virtually any standard text field system-wide, it does not require switching to a special app, and on-device processing options mean dictation can work reliably even without an internet connection on supported hardware.",
  bestPractices: [
    "Enable Automatic Punctuation to reduce manual cleanup after dictating longer passages",
    "Use on-device dictation, if available for your language, for better privacy and offline reliability",
    "Speak in a quiet environment and close to the microphone for higher transcription accuracy",
    "Learn basic dictation commands like 'new paragraph' and 'question mark' to reduce post-editing",
  ],
  commonIssues: [
    { issue: "Dictation shortcut does not activate", fix: "Confirm the shortcut is not already assigned to another function elsewhere, and re-enable Dictation from settings if needed." },
    { issue: "Transcription accuracy is poor", fix: "Check the selected dictation language matches what you are speaking, and reduce background noise near the microphone." },
    { issue: "Dictation requires internet unexpectedly", fix: "Confirm your language is supported for on-device dictation, since not every language offers an offline option." },
  ],
  faqs: [
    { q: "Is Dictation the same as Voice Control?", a: "No, Dictation converts speech to typed text, while Voice Control lets you operate the entire interface, including clicking and navigating, by voice." },
    { q: "Does Dictation send my voice to Apple's servers?", a: "Only when using enhanced online dictation for languages without on-device support; on-device dictation processes speech locally." },
    { q: "Can I dictate in a language different from my system language?", a: "Yes, Dictation language can be set independently from the Mac's overall system language." },
  ],
  tipsAndTricks: [
    "Double-tap the assigned shortcut key to quickly start dictating without reaching for the mouse.",
    "Say punctuation explicitly, like 'comma' or 'period', for more predictable results than relying solely on automatic punctuation.",
  ],
  relatedSettingIds: ["macos-voice-control", "macos-language-region", "macos-sound-output-input"],
  afterImageContent: {
    heading: "How Dictation Works",
    paragraphs: [
      "When activated, Dictation captures audio from the selected microphone and converts spoken words into text inserted at the current cursor position in the active text field.",
      "Depending on the selected language and Mac model, processing happens either entirely on-device or is sent securely for enhanced online recognition when on-device support is unavailable.",
      "Automatic Punctuation analyzes speech patterns and pauses to insert commas, periods, and other punctuation without requiring you to say them explicitly, though manual punctuation commands still work.",
    ],
    steps: [
      "Open System Settings → Keyboard → Dictation",
      "Turn on Dictation and choose a language",
      "Select a shortcut key to trigger Dictation",
      "Enable Automatic Punctuation if desired, then test in any text field",
    ],
  },
},
{
  id: "macos-bluetooth-accessory-battery",
  title: "Bluetooth Accessory Details",
  icon: BluetoothIcon,
  platform: "macos",
  category: "devices-peripherals",
  controlType: "action",
  heading: "Check battery level and firmware for paired accessories",
  description: "Clicking a paired Bluetooth accessory in Bluetooth settings, such as AirPods, a Magic Keyboard, or a Magic Mouse, shows detailed information including battery percentage, firmware version, and connection options specific to that device.",
  details: [
    "Battery percentage shown for supported accessories like AirPods and Magic peripherals",
    "Firmware version display for eligible devices",
    "Options to forget or rename the specific accessory",
    "Some accessories expose extra controls here, such as noise control settings for AirPods",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/blth23/mac",
  whyItMatters: "Wireless accessories running low on battery can disconnect at inconvenient moments, and having per-device battery and firmware visibility directly in Bluetooth settings makes it easy to catch a low Magic Mouse or aging AirPods before they die mid-use. This level of detail also helps when troubleshooting a flaky accessory, since outdated firmware or a failing battery are both common, identifiable causes of unreliable Bluetooth connections.",
  bestPractices: [
    "Check accessory battery levels periodically rather than waiting for a low-battery notification",
    "Keep accessory firmware updated when prompted, since it can resolve connectivity bugs",
    "Rename accessories descriptively if you manage several similar devices, such as multiple Magic Keyboards",
    "Forget and re-pair an accessory here if it repeatedly disconnects, rather than only toggling Bluetooth off and on",
  ],
  commonIssues: [
    { issue: "Battery percentage is not shown for an accessory", fix: "Not all Bluetooth accessories report battery level to macOS; this is limited mostly to Apple-made or MFi-certified devices." },
    { issue: "Firmware update option does not appear", fix: "Ensure the accessory is charged and stays connected and nearby, since some firmware updates only install under those conditions." },
    { issue: "Accessory details show as disconnected despite being paired", fix: "Toggle Bluetooth off and on, or forget and re-pair the device if it continues showing as disconnected." },
  ],
  faqs: [
    { q: "Why can I see battery levels for AirPods but not for a third-party mouse?", a: "Battery reporting depends on the accessory manufacturer implementing support for it; not all Bluetooth devices provide this data." },
    { q: "Does checking accessory details drain the battery faster?", a: "No, viewing details simply reads status already reported by the accessory and does not affect its battery." },
    { q: "Can I update accessory firmware manually?", a: "Firmware updates for most Apple accessories install automatically when conditions are met; there is typically no manual installer." },
  ],
  tipsAndTricks: [
    "Add the Control Center Bluetooth module for a quick glance at connected accessory battery levels without opening System Settings.",
    "Check firmware version here before contacting support for a persistent accessory issue.",
  ],
  relatedSettingIds: ["macos-bluetooth", "macos-mouse", "macos-keyboard"],
  afterImageContent: {
    heading: "How Bluetooth Accessory Details Work",
    paragraphs: [
      "Supported Bluetooth accessories periodically report status information, including battery level and firmware version, to macOS over the existing Bluetooth connection.",
      "Selecting a paired device in Bluetooth settings surfaces this reported data along with device-specific controls that vary by accessory type.",
      "Firmware updates, when available, are typically downloaded and applied automatically in the background while the accessory is connected and sufficiently charged.",
    ],
    steps: [
      "Open System Settings → Bluetooth",
      "Click the info button next to a paired accessory",
      "Review battery level and firmware version shown",
      "Use Forget This Device here if you need to unpair and re-pair it",
    ],
  },
},
{
  id: "macos-appearance",
  title: "Appearance",
  icon: Palette,
  platform: "macos",
  category: "display-sound-notifications",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Choose Light, Dark, or Auto system appearance",
  description: "Appearance settings control whether macOS uses a Light or Dark theme, or automatically switches between them based on time of day, along with accent color, highlight color, and sidebar icon size preferences.",
  details: [
    "Light, Dark, and Auto appearance modes",
    "Accent color customization for buttons, menus, and controls",
    "Highlight color for selected text and items, independent of accent color",
    "Sidebar icon size options across Finder and other apps",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/use-a-light-or-dark-appearance-mchl52e1c2d2/mac",
  whyItMatters: "Appearance is one of the most visible and frequently adjusted settings on the Mac, directly affecting visual comfort in different lighting conditions, such as reduced eye strain from Dark Mode at night. Beyond comfort, consistent accent and highlight colors help maintain visual clarity across the system, and Auto mode removes the need to manually switch themes as daylight changes throughout the day.",
  bestPractices: [
    "Use Auto appearance if you want the system to match ambient daylight without manual switching",
    "Pick an accent color with good contrast against both Light and Dark backgrounds if you switch between them",
    "Combine Dark Mode with Night Shift for a more complete low-light viewing setup",
    "Test readability of your chosen highlight color in dense text documents before committing to it",
  ],
  commonIssues: [
    { issue: "Some apps do not follow the system's Dark Mode setting", fix: "Check that app's own appearance preference, since some third-party apps require a separate in-app toggle." },
    { issue: "Auto mode switches at an inconvenient time", fix: "Auto mode follows sunrise and sunset for your location; manually choose Light or Dark instead if you prefer fixed timing." },
    { issue: "Accent color does not apply everywhere", fix: "Some system elements use a neutral graphite option regardless of accent color choice, which is expected behavior." },
  ],
  faqs: [
    { q: "Does Dark Mode save battery?", a: "On Macs with OLED-adjacent or similar display technology it can have a modest effect, but the benefit on typical Mac displays is primarily visual comfort rather than significant battery savings." },
    { q: "Can I schedule Dark Mode for specific hours instead of sunset/sunrise?", a: "No, Auto mode is tied to daylight, not a custom schedule; choose manually if you need fixed timing." },
    { q: "Is accent color the same as wallpaper-based theming?", a: "No, accent color is chosen independently and does not automatically match your wallpaper." },
  ],
  tipsAndTricks: [
    "Choose 'Multicolor' accent to let system icons and controls use a wider range of colors instead of a single tint.",
    "Pair a smaller sidebar icon size with Dark Mode for a denser, more compact Finder view.",
  ],
  relatedSettingIds: ["macos-wallpaper", "macos-night-shift", "macos-display-accommodations"],
  afterImageContent: {
    heading: "How Appearance Settings Work",
    paragraphs: [
      "macOS applies the chosen appearance mode system-wide, adjusting window backgrounds, menus, and controls to either a light or dark color scheme.",
      "Auto mode calculates local sunrise and sunset based on the Mac's location or time zone setting to switch appearance automatically without manual input.",
      "Accent and highlight colors are applied as tinting layers across supported interface elements, independent of the overall Light or Dark theme selected.",
    ],
    steps: [
      "Open System Settings → General → Appearance",
      "Choose Light, Dark, or Auto",
      "Select an Accent Color and Highlight Color",
      "Choose a Sidebar Icon Size preference if desired",
    ],
  },
},
{
  id: "macos-wallpaper",
  title: "Wallpaper",
  icon: Image,
  platform: "macos",
  category: "display-sound-notifications",
  controlType: "action",
  heading: "Set desktop pictures and dynamic wallpapers",
  description: "Wallpaper settings let you choose a still image, Apple's dynamic or live wallpapers that change with time of day, or your own photo collection to display as the Desktop background, with independent options per display.",
  details: [
    "Built-in Dynamic Desktop wallpapers that shift appearance through the day",
    "Support for still images, including your own photos",
    "Option to show different wallpapers on each connected display",
    "Wallpaper can optionally sync with the Lock Screen picture",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/choose-your-desktop-picture-mchlp3013/mac",
  whyItMatters: "While largely a personalization feature, wallpaper choice also intersects with practical concerns like icon visibility and eye comfort during long work sessions, since a busy or high-contrast image can make desktop icons harder to read. Dynamic Desktop wallpapers add a subtle ambient cue tied to time of day, and independent per-display wallpaper support is especially useful for multi-monitor setups where each screen serves a different purpose.",
  bestPractices: [
    "Choose a lower-contrast image if you keep many icons visible directly on the Desktop",
    "Use different static wallpapers per display to help visually distinguish monitors in a multi-screen setup",
    "Pick a Dynamic Desktop wallpaper if you want subtle time-of-day variation without manual changes",
    "Keep wallpaper file sizes reasonable if selecting a very large custom photo, for smoother performance",
  ],
  commonIssues: [
    { issue: "Wallpaper looks stretched or blurry", fix: "Choose a higher-resolution image, or adjust the fill option (Fill Screen, Fit to Screen, Stretch to Fill) to better match the display's native resolution." },
    { issue: "Wallpaper does not sync to the Lock Screen", fix: "Check the wallpaper pairing option, since some custom wallpapers are not automatically linked to a matching Lock Screen." },
    { issue: "Dynamic wallpaper appears static", fix: "Confirm 'Dynamic Desktop' is selected rather than a single still frame variant of that same image set." },
  ],
  faqs: [
    { q: "Can I use a video as wallpaper?", a: "No, standard Desktop wallpaper supports still and Dynamic Desktop images, not video; Screen Saver supports some motion content separately." },
    { q: "Will changing wallpaper affect Lock Screen widgets?", a: "No, Lock Screen widgets are configured separately even if the wallpaper image is shared between Desktop and Lock Screen." },
    { q: "Can each display really have a different wallpaper?", a: "Yes, when Displays have Separate Spaces enabled, each display can be assigned its own independent wallpaper." },
  ],
  tipsAndTricks: [
    "Use a subtle, single-tone wallpaper on a secondary monitor dedicated to reference material for less visual distraction.",
    "Right-click a photo in Photos and choose 'Set Desktop Picture' as a quick shortcut instead of browsing in settings.",
  ],
  relatedSettingIds: ["macos-appearance", "macos-lock-screen", "macos-displays"],
  afterImageContent: {
    heading: "How Wallpaper Settings Work",
    paragraphs: [
      "macOS renders the selected wallpaper image or Dynamic Desktop sequence as the Desktop background, recalculating brightness and tone throughout the day for Dynamic options.",
      "Wallpaper selection is stored per Space when Displays have Separate Spaces enabled, allowing different desktops or displays to show different images.",
      "An optional pairing setting links the chosen Desktop wallpaper to the Lock Screen picture so both stay visually consistent.",
    ],
    steps: [
      "Open System Settings → Wallpaper",
      "Browse Dynamic, Stills, or your own Photos albums",
      "Select an image or Dynamic Desktop set to apply it",
      "Adjust the fill option and Lock Screen pairing as desired",
    ],
  },
},
{
  id: "macos-night-shift",
  title: "Night Shift",
  icon: Sunset,
  platform: "macos",
  category: "display-sound-notifications",
  controlType: "action",
  heading: "Shift display colors warmer in the evening",
  description: "Night Shift automatically shifts the colors of your display to the warmer end of the spectrum in the evening, based on a schedule or sunset-to-sunrise timing, to reduce blue light exposure before bed.",
  details: [
    "Schedule options for Sunset to Sunrise or a custom time range",
    "Adjustable color temperature slider from slightly warm to very warm",
    "Manual 'Turn On Until Tomorrow' toggle for one-off use",
    "Applies independently from Dark Mode, which affects interface color rather than display color temperature",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/change-night-shift-settings-mchl9d976e85/mac",
  whyItMatters: "Blue light exposure in the evening is commonly associated with disrupted sleep patterns, and Night Shift offers a simple, automatic way to reduce that exposure during typical nighttime computer use without needing to remember to adjust anything manually. Because it can run on a sunset-to-sunrise schedule tied to your Mac's location, the feature adapts through the seasons without requiring reconfiguration.",
  bestPractices: [
    "Use Sunset to Sunrise scheduling so the feature adjusts automatically as daylight hours change through the year",
    "Set a warmer color temperature if you use the Mac close to bedtime",
    "Turn off Night Shift temporarily for color-sensitive work like photo or video editing",
    "Combine with Dark Mode in the evening for a more complete low-light setup",
  ],
  commonIssues: [
    { issue: "Night Shift does not turn on automatically", fix: "Confirm Location Services is enabled for accurate sunset/sunrise timing, or switch to a custom scheduled time range instead." },
    { issue: "Colors look too warm or distracting", fix: "Lower the color temperature slider toward the 'Less Warm' end of the range." },
    { issue: "Night Shift interferes with color-accurate work", fix: "Temporarily disable it, or schedule work sessions outside its active hours, since it is not intended for color-critical tasks." },
  ],
  faqs: [
    { q: "Is Night Shift the same as Dark Mode?", a: "No, Night Shift changes the display's color temperature toward warmer tones, while Dark Mode changes the interface's overall color scheme." },
    { q: "Does Night Shift affect external displays?", a: "Support varies by display and connection type; some external monitors do not support Night Shift's color adjustment." },
    { q: "Can I schedule Night Shift for specific fixed hours instead of sunset/sunrise?", a: "Yes, a Custom schedule option lets you set fixed start and end times." },
  ],
  tipsAndTricks: [
    "Use the manual 'Turn On Until Tomorrow' option from Control Center for one-off late-night sessions without changing your regular schedule.",
    "Pair a warmer Night Shift setting with reduced screen brightness for a gentler evening viewing experience.",
  ],
  relatedSettingIds: ["macos-true-tone", "macos-appearance", "macos-displays"],
  afterImageContent: {
    heading: "How Night Shift Works",
    paragraphs: [
      "Night Shift uses the Mac's clock and, when enabled, location data to calculate sunset and sunrise times, automatically shifting display color temperature warmer during evening and night hours.",
      "The color temperature slider adjusts how strong the warm shift is, applied as a real-time color transformation across the entire display output.",
      "Because it is purely a color rendering adjustment, Night Shift does not affect underlying image or video files, only how they are displayed while active.",
    ],
    steps: [
      "Open System Settings → Displays → Night Shift",
      "Choose a schedule: Off, Custom, or Sunset to Sunrise",
      "Adjust the Color Temperature slider to taste",
      "Use 'Turn On Until Tomorrow' for a temporary manual override",
    ],
  },
},
{
  id: "macos-true-tone",
  title: "True Tone",
  icon: Sun,
  platform: "macos",
  category: "display-sound-notifications",
  controlType: "action",
  heading: "Automatically adjust display color to ambient light",
  description: "True Tone uses the Mac's ambient light sensors to automatically adjust the display's white balance to match the surrounding lighting conditions, making white appear consistently natural under different light sources.",
  details: [
    "Simple on/off toggle available on supported Mac displays and built-in laptop screens",
    "Uses ambient light sensors to continuously adjust white balance in real time",
    "Available separately from Night Shift, which is time-based rather than light-based",
    "Only available on Macs and displays with the required ambient light sensor hardware",
  ],
  redirectUrl: "https://support.apple.com/en-us/102147",
  whyItMatters: "Without True Tone, a display's white point stays fixed regardless of the room's lighting, which can make the screen look unnaturally blue-tinted under warm indoor lighting or unnaturally warm under cool daylight. By dynamically adjusting to match ambient light, True Tone keeps colors, and especially whites, looking more consistent and natural to the eye as you move between rooms or as lighting changes throughout the day.",
  bestPractices: [
    "Leave True Tone enabled for general use to reduce perceived color shifts between environments",
    "Disable True Tone temporarily for color-critical work like photo editing or print-matching",
    "Keep the ambient light sensor unobstructed, since covering it can cause inconsistent adjustments",
    "Use alongside Night Shift for a fuller adaptive color experience across day and night",
  ],
  commonIssues: [
    { issue: "True Tone option is missing from Displays settings", fix: "Confirm your specific Mac model and display include an ambient light sensor, since not all models support the feature." },
    { issue: "Colors shift noticeably when moving between rooms", fix: "This is expected True Tone behavior as it responds to different ambient lighting; disable it if consistent, unadjusted color is required." },
    { issue: "True Tone appears to have no effect", fix: "Check that the ambient light sensor is not covered by a case, sticker, or external attachment near the camera housing." },
  ],
  faqs: [
    { q: "Is True Tone the same as Night Shift?", a: "No, True Tone reacts to ambient light in real time, while Night Shift follows a time-based schedule regardless of actual room lighting." },
    { q: "Does True Tone work on all external displays?", a: "No, it requires specific Apple-made or compatible displays with an ambient light sensor and supporting hardware." },
    { q: "Should I turn off True Tone for photo editing?", a: "Yes, for the most accurate and consistent color evaluation, professionals typically disable True Tone along with Night Shift." },
  ],
  tipsAndTricks: [
    "Toggle True Tone off briefly to compare how much it is currently adjusting your display's white balance.",
    "Combine with Reference Mode, on supported Pro Display models, for the most accurate professional color workflows.",
  ],
  relatedSettingIds: ["macos-night-shift", "macos-displays", "macos-appearance"],
  afterImageContent: {
    heading: "How True Tone Works",
    paragraphs: [
      "True Tone reads ambient light color temperature and brightness from onboard sensors and continuously recalculates the display's white balance to match.",
      "The adjustment happens at the hardware and software rendering level, so it applies system-wide across all apps and content, not just specific ones.",
      "Because it responds to real-time lighting conditions rather than a fixed schedule, True Tone updates immediately when the Mac is moved to a differently lit environment.",
    ],
    steps: [
      "Open System Settings → Displays",
      "Locate the True Tone toggle for a supported display",
      "Turn True Tone on or off",
      "Move between differently lit rooms to observe the automatic adjustment",
    ],
  },
},
{
  id: "macos-sound-output-input",
  title: "Sound Output & Input",
  icon: Volume2,
  platform: "macos",
  category: "display-sound-notifications",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Choose and configure audio devices",
  description: "Sound Output & Input settings let you select which speakers or headphones play audio and which microphone captures it, and adjust device-specific levels like output volume balance and input gain.",
  details: [
    "Separate device lists for Output and Input, including built-in, USB, and Bluetooth audio devices",
    "Independent volume level and left/right balance controls for output",
    "Input level meter and gain slider for microphones",
    "Automatic switching behavior when a new audio device connects or disconnects",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/change-the-sound-output-settings-mchlp2256/mac",
  whyItMatters: "Choosing the correct audio output and input device is essential for anything from a video call to media playback, and misconfigured device selection is one of the most common reasons someone appears to have no audio or cannot be heard on a call. Because Macs frequently connect to multiple audio devices, such as built-in speakers, headphones, and a conferencing speakerphone, explicit control over which one is active avoids relying entirely on automatic switching, which does not always choose the device you actually want.",
  bestPractices: [
    "Manually select the correct output and input device before starting an important call rather than assuming automatic switching chose correctly",
    "Watch the input level meter while speaking to confirm your microphone is actually picking up audio",
    "Set a lower default output volume if you frequently switch to headphones to avoid a jarring volume jump",
    "Rename or identify similarly named Bluetooth audio devices to avoid selecting the wrong one",
  ],
  commonIssues: [
    { issue: "No sound plays despite volume being up", fix: "Check that the correct output device is selected, since audio may be routing to a disconnected or unintended device." },
    { issue: "Other people cannot hear you on a call", fix: "Verify the correct microphone is selected as input and check the input level meter for activity while speaking." },
    { issue: "Audio automatically switches to the wrong device", fix: "Manually select the preferred device each time, or disconnect unused Bluetooth audio devices that keep taking priority." },
  ],
  faqs: [
    { q: "Can I use different apps with different audio devices simultaneously?", a: "Not natively without third-party audio routing software; by default, the system output/input selection applies system-wide." },
    { q: "Why does my Bluetooth headset sound worse for calls than for music?", a: "Many Bluetooth headsets switch to a lower-quality call-optimized audio profile automatically when the microphone is in use." },
    { q: "Does raising input gain improve microphone quality?", a: "It increases volume but not clarity; excessive gain can introduce background noise or distortion." },
  ],
  tipsAndTricks: [
    "Use the Sound module in Control Center for quick output device switching without opening full settings.",
    "Test your microphone with the built-in level meter before an important recording or call to catch issues early.",
  ],
  relatedSettingIds: ["macos-sound-notifications", "macos-bluetooth", "macos-dictation"],
  afterImageContent: {
    heading: "How Sound Output & Input Settings Work",
    paragraphs: [
      "macOS maintains a list of all currently available output and input audio devices, including built-in hardware and any connected USB or Bluetooth devices, and routes system audio to whichever is selected as active.",
      "Output settings include a balance control for stereo positioning and a volume level independent of the menu bar volume control, though both stay in sync.",
      "Input settings include a real-time level meter so you can visually confirm microphone pickup, along with a gain slider to boost or reduce sensitivity.",
    ],
    steps: [
      "Open System Settings → Sound",
      "Select the Output tab and choose the desired playback device",
      "Select the Input tab and choose the desired microphone",
      "Adjust volume, balance, or input gain sliders as needed",
    ],
  },
},
{
  id: "macos-appearance-light-dark",
  title: "Appearance (Light, Dark & Auto)",
  icon: Moon,
  platform: "macos",
  category: "personalization",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Switch between Light, Dark, or Auto",
  description: "Choose whether macOS displays a light, dark, or automatically switching interface theme across the Dock, menu bar, Finder, and supported apps.",
  details: [
    "Light, Dark, and Auto options under System Settings → Appearance",
    "Auto switches the theme based on time of day",
    "Applies system-wide to windows, sidebars, and menus",
    "Works independently of your desktop wallpaper choice",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT208976",
  whyItMatters: "Appearance mode affects readability and eye strain, especially in low-light environments where Dark Mode reduces glare. Many users also prefer Dark Mode for aesthetics or to make photo and video content stand out against darker chrome. Because the setting applies system-wide, it is one of the most frequently adjusted personalization options on the Mac. Auto mode removes the need to manually toggle it as daylight changes throughout the day.",
  bestPractices: [
    "Use Auto if you work at varying times of day",
    "Pair Dark Mode with a darker desktop wallpaper for consistency",
    "Check third-party app support since not all apps fully adopt Dark Mode",
    "Revisit accent color choice after switching themes for contrast",
  ],
  commonIssues: [
    { issue: "Some apps stay light even in Dark Mode", fix: "The app must explicitly support Dark Mode; check for an in-app appearance setting or app update." },
    { issue: "Auto mode switches at an inconvenient time", fix: "Switch to a fixed Light or Dark setting instead of Auto." },
    { issue: "Photos or design work look different after switching", fix: "Toggle back to Light Mode temporarily for accurate color judgment." },
  ],
  faqs: [
    { q: "Does Dark Mode save battery?", a: "On Macs with standard LCD displays there is minimal battery impact, though OLED-style displays elsewhere can benefit more." },
    { q: "Can I schedule Dark Mode for specific hours instead of sunrise/sunset?", a: "No, Auto is tied to daylight; there is no custom schedule option in System Settings." },
    { q: "Will changing Appearance affect my wallpaper?", a: "No, wallpaper is a separate setting, though some dynamic wallpapers do change alongside Appearance." },
  ],
  tipsAndTricks: [
    "Use keyboard-free toggling via Control Center's Display quick controls",
    "Combine with a dynamic desktop wallpaper for a smoother day/night transition",
  ],
  relatedSettingIds: ["macos-wallpaper-screensaver", "macos-accent-highlight-color"],
  updateFrequency: "Set once, adjust as needed",
  afterImageContent: {
    heading: "How Appearance Mode Works",
    paragraphs: [
      "Appearance mode controls the overall color scheme macOS renders for system chrome and any app that opts into Dark Mode support.",
      "Auto mode uses your Mac's clock and, if enabled, your location to estimate sunrise and sunset, switching automatically without user input.",
    ],
    steps: [
      "Open System Settings",
      "Select Appearance in the sidebar",
      "Choose Light, Dark, or Auto at the top of the pane",
      "Adjust accent and highlight color below if desired",
    ],
  },
},
{
  id: "macos-accent-highlight-color",
  title: "Accent Color & Highlight Color",
  icon: Sparkles,
  platform: "macos",
  category: "personalization",
  controlType: "action",
  heading: "Customize button and selection colors",
  description: "Set the accent color used for buttons, checkboxes, and links, and a separate highlight color used for selected text and list items.",
  details: [
    "Found under System Settings → Appearance",
    "Accent color changes buttons, sliders, and toggles",
    "Highlight color changes selected text and list rows",
    "Multicolor option restores classic per-control tinting",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/change-general-preferences-mchlp1611/mac",
  whyItMatters: "Accent and highlight colors are a lightweight but visible way to personalize the Mac interface beyond wallpaper and theme. They also improve usability for some users by making active controls and selected content easier to spot at a glance. Because these colors persist across nearly every native app, the choice has an outsized visual impact relative to how quickly it can be changed.",
  bestPractices: [
    "Pick an accent color with enough contrast against both Light and Dark mode",
    "Use the Multicolor option if you prefer the classic macOS look",
    "Match highlight color to accent color for visual consistency",
  ],
  commonIssues: [
    { issue: "Accent color doesn't appear in some third-party apps", fix: "Not all apps read the system accent color; check the app's own theme settings." },
    { issue: "Highlight color is hard to read with certain text colors", fix: "Choose a highlight color with strong contrast, or switch to a system default." },
  ],
  faqs: [
    { q: "Can I use a custom hex color?", a: "No, only the preset swatches Apple provides are selectable in System Settings." },
    { q: "Does this affect Safari or Mail icons?", a: "No, it affects UI controls and selection highlighting, not app icons." },
  ],
  tipsAndTricks: [
    "Choose Multicolor to mimic the original macOS button styling",
    "Re-check accent color after switching Light/Dark since contrast can shift",
  ],
  relatedSettingIds: ["macos-appearance-light-dark", "macos-wallpaper-screensaver"],
  afterImageContent: {
    heading: "How Accent & Highlight Color Work",
    paragraphs: [
      "Accent color is applied to interactive controls like buttons and toggles across macOS and Apple's built-in apps.",
      "Highlight color is used specifically when text or items are selected, and can be set independently of the accent color.",
    ],
    steps: [
      "Open System Settings",
      "Select Appearance",
      "Choose a swatch under Accent color",
      "Choose a swatch under Highlight color",
    ],
  },
},
{
  id: "macos-focus-do-not-disturb",
  title: "Focus & Do Not Disturb",
  icon: EyeOff,
  platform: "macos",
  category: "personalization",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Silence notifications during Focus modes",
  description: "Create and schedule Focus modes such as Do Not Disturb, Work, or Personal that filter which notifications and apps can interrupt you.",
  details: [
    "Managed under System Settings → Focus",
    "Built-in modes include Do Not Disturb, Personal, Sleep, and Work",
    "Custom Focus modes can allow specific people and apps",
    "Focus status can sync across Apple devices signed into the same Apple ID",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT212608",
  whyItMatters: "Focus modes reduce interruptions during deep work, meetings, or personal time by filtering notifications rather than requiring users to silence everything or dig through every app's settings individually. Because Focus can sync across iPhone, iPad, and Mac, it gives a consistent do-not-disturb experience regardless of which device is active. Well-configured Focus modes strike a balance between staying reachable for urgent contacts and avoiding constant distraction.",
  bestPractices: [
    "Allow calls from starred contacts even during strict Focus modes",
    "Schedule Work and Sleep Focus modes to activate automatically",
    "Share Focus status so contacts know when you're unavailable",
    "Review allowed apps periodically as your notification needs change",
  ],
  commonIssues: [
    { issue: "Notifications still come through during Focus", fix: "Check that the app isn't explicitly allowed in the active Focus mode's settings." },
    { issue: "Focus doesn't sync between Mac and iPhone", fix: "Confirm 'Share across devices' is enabled in Focus settings on both devices." },
    { issue: "Focus turns on unexpectedly", fix: "Check for an active schedule or Smart Activation trigger tied to a calendar event or location." },
  ],
  faqs: [
    { q: "Can I create a custom Focus mode?", a: "Yes, tap the plus button in Focus settings to build a custom mode with its own allowed people and apps." },
    { q: "Does Focus block all notifications?", a: "By default it silences most, but you can explicitly allow specific people and apps through." },
    { q: "Will people know I have Focus on?", a: "Only if you enable Share Focus Status, which lets Messages notify senders you may not see their message right away." },
  ],
  tipsAndTricks: [
    "Use Focus filters to hide unrelated Safari tabs or Calendar events while a mode is active",
    "Add a Focus toggle to Control Center for one-tap access",
  ],
  relatedSettingIds: ["macos-sound-notifications", "macos-menu-bar-control-center"],
  afterImageContent: {
    heading: "How Focus Modes Work",
    paragraphs: [
      "Focus modes filter incoming notifications based on rules you define, allowing only selected people and apps to interrupt you.",
      "Modes can be turned on manually, scheduled by time, or triggered automatically by location or a calendar event.",
    ],
    steps: [
      "Open System Settings",
      "Select Focus in the sidebar",
      "Choose a built-in mode or add a custom one",
      "Configure allowed people, apps, and an optional schedule",
    ],
  },
},
{
  id: "macos-stage-manager",
  title: "Stage Manager",
  icon: PanelTop,
  platform: "macos",
  category: "personalization",
  controlType: "action",
  heading: "Organize windows with Stage Manager",
  description: "Enable Stage Manager to automatically arrange open windows into a single focused workspace with recent windows shown as thumbnails along the side.",
  details: [
    "Toggle available in Control Center or System Settings → Desktop & Dock",
    "Groups related windows together when clicked",
    "Options to show recent apps and desktop widgets in the strip",
    "Works alongside Mission Control and Spaces",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT213315",
  whyItMatters: "Stage Manager reduces visual clutter for users who work with many open windows by keeping one task front and center while others wait as thumbnails. It is particularly useful on smaller-screen Macs where traditional overlapping windows quickly become unmanageable. Because it can be toggled on demand, users can switch between Stage Manager's structured layout and macOS's traditional freeform windowing depending on the task.",
  bestPractices: [
    "Enable 'Show recent apps' if you frequently switch between a small set of tasks",
    "Combine with Mission Control for multi-desktop workflows",
    "Disable it if you prefer manually arranging overlapping windows",
  ],
  commonIssues: [
    { issue: "Windows disappear unexpectedly", fix: "They're minimized to the side strip, not closed; click the thumbnail to bring them back." },
    { issue: "Apps don't group as expected", fix: "Manually drag a window onto another in the strip to create a custom group." },
    { issue: "Desktop icons are hidden", fix: "Turn on 'Show items' for Desktop in the Stage Manager settings." },
  ],
  faqs: [
    { q: "Does Stage Manager work with external displays?", a: "Yes, each display can have its own Stage Manager arrangement." },
    { q: "Can I use Stage Manager with Mission Control's Spaces?", a: "Yes, they work together, though the workflow differs from Stage Manager's single-stage focus." },
  ],
  tipsAndTricks: [
    "Drag a window onto a recent-apps thumbnail to group them",
    "Use a keyboard shortcut or Control Center to toggle Stage Manager quickly",
  ],
  relatedSettingIds: ["macos-desktop-dock", "macos-hot-corners"],
  afterImageContent: {
    heading: "How Stage Manager Works",
    paragraphs: [
      "Stage Manager keeps one active window (or window group) centered on screen while other open windows collapse into thumbnails along the side.",
      "Clicking a thumbnail brings that window or group to the center, replacing the current stage.",
    ],
    steps: [
      "Open System Settings",
      "Select Desktop & Dock",
      "Scroll to Stage Manager and turn it on",
      "Configure recent apps and desktop item visibility",
    ],
  },
},
{
  id: "macos-hot-corners",
  title: "Hot Corners",
  icon: Monitor,
  platform: "macos",
  category: "personalization",
  controlType: "action",
  heading: "Assign actions to screen corners",
  description: "Set each corner of your screen to instantly trigger an action such as Mission Control, Desktop, Notification Center, or starting a screen saver when you move your cursor there.",
  details: [
    "Configured under System Settings → Desktop & Dock → Hot Corners",
    "Four independent corners, each with its own assignable action",
    "Options include Mission Control, Application Windows, Desktop, and Screen Saver",
    "Can be combined with modifier keys for additional actions",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/hot-corners-mchl3dbcc4a3/mac",
  whyItMatters: "Hot corners give users a fast, mouse-driven shortcut to common actions without memorizing keyboard combinations. They're especially useful for quickly revealing the desktop, triggering Mission Control, or locking the screen when stepping away. Because the trigger is purely spatial, hot corners are also easy to use accidentally, so configuring them thoughtfully avoids unwanted interruptions.",
  bestPractices: [
    "Avoid assigning frequently-brushed corners to disruptive actions like sleep or screen saver",
    "Use modifier-key variants to add extra actions without conflicts",
    "Assign one corner to 'Desktop' for quick file access during multitasking",
  ],
  commonIssues: [
    { issue: "A corner triggers unintentionally", fix: "Reassign that corner to '-' (none) or add a modifier key requirement." },
    { issue: "Hot corner doesn't respond", fix: "Check that the cursor actually reaches the extreme pixel corner, not just near it." },
  ],
  faqs: [
    { q: "Can I require a key press along with reaching the corner?", a: "Yes, each corner has a dropdown for an optional modifier key like Shift or Command." },
    { q: "Do hot corners work in full-screen apps?", a: "Yes, they remain active even when an app is in full-screen mode." },
  ],
  tipsAndTricks: [
    "Set one corner to instantly start the screen saver as a quick privacy lock",
    "Use 'Application Windows' on a corner for fast window switching within one app",
  ],
  relatedSettingIds: ["macos-desktop-dock", "macos-lock-screen"],
  afterImageContent: {
    heading: "How Hot Corners Work",
    paragraphs: [
      "Hot corners watch for the cursor reaching one of the four screen corners and immediately trigger the assigned action.",
      "Each corner is independent, so you can mix system actions like Mission Control with utility actions like starting the screen saver.",
    ],
    steps: [
      "Open System Settings",
      "Select Desktop & Dock",
      "Click Hot Corners at the bottom of the pane",
      "Choose an action for each corner from the dropdown menus",
    ],
  },
},
{
  id: "macos-location-services",
  title: "Location Services",
  icon: MapPin,
  platform: "macos",
  category: "privacy-permissions",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Control which apps can access your location",
  description: "Manage system-wide Location Services and grant or deny individual apps and system features permission to use your Mac's estimated location.",
  details: [
    "Master toggle plus a per-app permission list under Privacy & Security → Location Services",
    "System Services section covers features like Find My and time zone setting",
    "A purple arrow in the menu bar indicates recent location use",
    "Precise location can be denied even when general access is allowed",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT204690",
  whyItMatters: "Location data is one of the most sensitive pieces of information a Mac can share, since it can reveal daily routines, home and work addresses, and travel patterns. Granular per-app controls let users enable location for genuinely useful features, like accurate weather or Find My, while blocking apps that have no real need for it. Reviewing this list periodically helps catch apps that requested access once and no longer need it.",
  bestPractices: [
    "Deny location access for apps that don't need it to function",
    "Keep System Services location on for Find My and time zone accuracy",
    "Review the location access list after installing new apps",
    "Watch for the location arrow indicator in the menu bar",
  ],
  commonIssues: [
    { issue: "Time zone won't update automatically while traveling", fix: "Ensure 'Set time zone' is enabled under System Services in Location Services." },
    { issue: "An app keeps asking for location permission", fix: "Grant or permanently deny it in Location Services rather than dismissing the prompt each time." },
    { issue: "Weather or Maps show the wrong location", fix: "Confirm Location Services is enabled system-wide and for that specific app." },
  ],
  faqs: [
    { q: "Can I turn off location for just one app?", a: "Yes, each app has its own toggle in the Location Services list." },
    { q: "Does disabling Location Services affect Find My Mac?", a: "Yes, Find My requires location access to report your Mac's position if lost." },
    { q: "What does the arrow icon in the menu bar mean?", a: "It indicates an app or system service has recently accessed your location." },
  ],
  tipsAndTricks: [
    "Click 'Details' next to System Services to see background location use by macOS itself",
    "Disable location for browsers if you prefer manually entering your location on websites",
  ],
  relatedSettingIds: ["macos-privacy-security-hub", "macos-app-permissions"],
  afterImageContent: {
    heading: "How Location Services Works",
    paragraphs: [
      "macOS estimates your location using Wi-Fi network data and, on supported hardware, GPS, then shares it only with apps and services you explicitly authorize.",
      "The master toggle controls the entire feature, while individual switches beneath it fine-tune access on a per-app basis.",
    ],
    steps: [
      "Open System Settings",
      "Select Privacy & Security, then Location Services",
      "Enable or disable the master toggle",
      "Adjust individual app permissions in the list below",
    ],
  },
},
{
  id: "macos-full-disk-access",
  title: "Full Disk Access",
  icon: HardDrive,
  platform: "macos",
  category: "privacy-permissions",
  controlType: "action",
  heading: "Grant apps unrestricted file system access",
  description: "Authorize specific apps, usually backup, security, or automation tools, to read protected locations across your entire disk that are normally off-limits.",
  details: [
    "Located under Privacy & Security → Full Disk Access",
    "Required by many backup, antivirus, and file-sync utilities",
    "Grants access to Mail, Messages, Safari data, and Time Machine backups",
    "Apps must be manually added or removed from the list",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/change-privacy-preferences-mh32356/mac",
  whyItMatters: "Full Disk Access is one of the most powerful permissions on macOS because it bypasses the normal per-folder protections covering Mail, Messages, and other sensitive data stores. Utilities like backup software or terminal-based tools genuinely need it to function correctly, but granting it carelessly to unfamiliar apps creates significant privacy risk. Because it's granted per app rather than system-wide, users retain precise control over exactly which tools can see everything.",
  bestPractices: [
    "Only grant Full Disk Access to apps you trust and that clearly require it",
    "Remove access for apps you've uninstalled but that remain in the list",
    "Re-authorize the app if it stops working after a macOS update, as permissions can reset",
  ],
  commonIssues: [
    { issue: "A backup or sync tool can't access certain files", fix: "Add the app to Full Disk Access and restart it." },
    { issue: "Terminal-based scripts can't read protected folders", fix: "Add Terminal (or the specific shell/app) to Full Disk Access." },
    { issue: "App stops working after a macOS update", fix: "Re-grant Full Disk Access, since major updates sometimes reset the permission." },
  ],
  faqs: [
    { q: "Is Full Disk Access the same as admin access?", a: "No, it's a distinct macOS privacy permission unrelated to account admin status." },
    { q: "Can I grant Full Disk Access temporarily?", a: "There's no built-in expiration; you must manually toggle it off when no longer needed." },
  ],
  tipsAndTricks: [
    "Use the search field at the top of Privacy & Security to jump straight to Full Disk Access",
    "Drag an app directly into the list instead of using the Add button if it's easier",
  ],
  relatedSettingIds: ["macos-app-permissions", "macos-privacy-security-hub"],
  afterImageContent: {
    heading: "How Full Disk Access Works",
    paragraphs: [
      "macOS protects certain folders and data stores, like Mail and Time Machine backups, from being read by apps by default, even with normal file permissions.",
      "Adding an app to Full Disk Access removes those extra protections specifically for that app, letting it read essentially anything on the disk.",
    ],
    steps: [
      "Open System Settings",
      "Select Privacy & Security, then Full Disk Access",
      "Click the plus button and select the app",
      "Enable the toggle next to the app and restart it if prompted",
    ],
  },
},
{
  id: "macos-screen-recording-permission",
  title: "Screen Recording Permission",
  icon: ScreenShare,
  platform: "macos",
  category: "privacy-permissions",
  controlType: "action",
  heading: "Approve apps that can capture your screen",
  description: "Control which apps are allowed to record or capture the contents of your screen, a permission required by screen-sharing, recording, and streaming tools.",
  details: [
    "Located under Privacy & Security → Screen Recording",
    "Required by video conferencing apps' screen-share features",
    "Also used by screenshot, recording, and streaming utilities",
    "App must be relaunched after being granted permission",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/change-privacy-preferences-mh32356/mac",
  whyItMatters: "Screen Recording permission gates a capability that could otherwise be exploited to silently capture passwords, messages, and other sensitive on-screen content. Requiring explicit user approval per app closes off a common attack vector used by malicious software. For everyday use, this permission is what makes legitimate features like video call screen sharing and screen recording software work correctly.",
  bestPractices: [
    "Only approve apps you recognize and intentionally installed",
    "Revoke access for apps no longer used for screen sharing or recording",
    "Relaunch an app immediately after granting permission for it to take effect",
  ],
  commonIssues: [
    { issue: "Screen share appears black in a video call", fix: "Grant Screen Recording permission to the conferencing app and restart it." },
    { issue: "Permission toggle doesn't take effect", fix: "Quit and reopen the app after enabling the toggle; a live relaunch is required." },
    { issue: "An unfamiliar app requests screen recording access", fix: "Deny it unless you can verify the app's legitimacy and purpose." },
  ],
  faqs: [
    { q: "Why does Zoom or Teams need this permission?", a: "Screen sharing features capture your display contents, which macOS treats the same as any screen recording." },
    { q: "Does this affect built-in screenshots?", a: "No, macOS's own Screenshot tool doesn't require this user-granted permission." },
  ],
  tipsAndTricks: [
    "Check this list periodically since it's a common vector for spyware to abuse",
    "Use it alongside Camera & Microphone privacy settings for a full audit of capture permissions",
  ],
  relatedSettingIds: ["macos-camera-mic-privacy", "macos-privacy-security-hub"],
  afterImageContent: {
    heading: "How Screen Recording Permission Works",
    paragraphs: [
      "Any app wanting to capture pixels from your display, whether for a single screenshot-like grab or continuous recording, must first be granted this permission.",
      "macOS prompts automatically the first time an app attempts screen capture, and the choice is remembered in this settings list.",
    ],
    steps: [
      "Open System Settings",
      "Select Privacy & Security, then Screen Recording",
      "Enable the toggle for the app requesting access",
      "Quit and relaunch the app to apply the change",
    ],
  },
},
{
  id: "macos-apple-advertising",
  title: "Apple Advertising",
  icon: Megaphone,
  platform: "macos",
  category: "privacy-permissions",
  controlType: "action",
  heading: "Manage personalized Apple ads",
  description: "Turn Personalized Ads on or off to control whether Apple uses your activity within its own apps, like the App Store and News, to show more relevant advertising.",
  details: [
    "Located under Privacy & Security → Apple Advertising",
    "Only affects ads shown within Apple's own apps, not third-party ads",
    "Turning it off shows generic rather than interest-based ads",
    "Separate from third-party app tracking permissions",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT205223",
  whyItMatters: "Apple Advertising settings determine whether your on-device activity within Apple's own apps, such as searches in the App Store, is used to tailor the ads you see there. Because this setting is scoped narrowly to Apple's advertising network, it does not control broader third-party ad tracking across the web, which is a common point of confusion. Disabling it is a quick privacy improvement with no functional downside for most users.",
  bestPractices: [
    "Turn off Personalized Ads if you prefer Apple not use your activity for ad targeting",
    "Understand this doesn't block ads entirely, only personalization",
    "Pair with browser tracking prevention settings for broader ad privacy",
  ],
  commonIssues: [
    { issue: "Still seeing ads after disabling Personalized Ads", fix: "This is expected; the setting removes personalization, not the ads themselves." },
    { issue: "Confusion with third-party app tracking prompts", fix: "Those are controlled separately under each app's own tracking permission, not this setting." },
  ],
  faqs: [
    { q: "Does this affect ads on websites I visit in Safari?", a: "No, this setting only covers ads within Apple's own apps like the App Store and News." },
    { q: "Will turning this off remove App Store search ads?", a: "It removes personalization of those ads but they may still appear in a generic form." },
  ],
  tipsAndTricks: [
    "Check this setting once after setting up a new Mac since it's on by default",
    "Review it again after signing into a new Apple ID",
  ],
  relatedSettingIds: ["macos-diagnostics-usage-data", "macos-privacy-security-hub"],
  afterImageContent: {
    heading: "How Apple Advertising Works",
    paragraphs: [
      "Apple's own advertising network uses on-device signals, like App Store browsing and download history, to select more relevant ads within Apple apps.",
      "This toggle controls only that personalization step; it does not disable ads or affect advertising from other companies.",
    ],
    steps: [
      "Open System Settings",
      "Select Privacy & Security, then Apple Advertising",
      "Toggle Personalized Ads off or on",
    ],
  },
},
{
  id: "macos-icloud-desktop-documents-sync",
  title: "Documents & Desktop iCloud Sync",
  icon: Cloud,
  platform: "macos",
  category: "storage-backup-data",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Sync your Desktop and Documents to iCloud",
  description: "Automatically upload the contents of your Desktop and Documents folders to iCloud Drive so they stay backed up and accessible from other signed-in devices.",
  details: [
    "Enabled per-Mac under Apple ID → iCloud → iCloud Drive → Desktop & Documents Folders",
    "Files move into iCloud Drive but keep the same folder location in Finder",
    "Frees local space by offloading older files when Optimize Mac Storage is on",
    "Counts against your overall iCloud storage plan",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT206985",
  whyItMatters: "Syncing Desktop and Documents protects everyday working files from local disk failure and makes them instantly available on any other Mac, iPhone, or iPad signed into the same iCloud account. It's especially valuable for users who frequently switch machines or need a safety net beyond a single local backup. Because it interacts with local storage optimization, understanding this setting is also key to diagnosing why files sometimes show as available only online.",
  bestPractices: [
    "Confirm you have enough iCloud storage before enabling on a Mac with large folders",
    "Enable on every Mac using the same Apple ID for consistent syncing",
    "Use Finder's cloud status column to see which files are downloaded locally",
    "Pair with Time Machine, since iCloud sync isn't a substitute for versioned backup",
  ],
  commonIssues: [
    { issue: "Desktop files disappear after enabling on a new Mac", fix: "Wait for the initial sync to complete; files are downloading from iCloud, not lost." },
    { issue: "Running out of iCloud storage", fix: "Upgrade your iCloud+ storage plan or remove large unneeded files from Desktop/Documents." },
    { issue: "Files show a cloud icon instead of opening instantly", fix: "Click the file to trigger download, or ensure a stable internet connection." },
  ],
  faqs: [
    { q: "Does this replace Time Machine backups?", a: "No, iCloud sync keeps one current copy in the cloud but doesn't provide the version history Time Machine offers." },
    { q: "What happens if I turn it off?", a: "macOS asks whether to keep a local copy of everything or keep only files stored in iCloud Drive." },
    { q: "Does this work with an external Documents folder?", a: "No, it only syncs the default user-level Desktop and Documents folders." },
  ],
  tipsAndTricks: [
    "Use Finder's 'Remove Download' option to free local space on files you don't need offline",
    "Check sync status in the iCloud Drive area of System Settings if uploads seem stalled",
  ],
  relatedSettingIds: ["macos-icloud-drive", "macos-optimize-storage"],
  afterImageContent: {
    heading: "How Desktop & Documents Sync Works",
    paragraphs: [
      "Once enabled, macOS treats your Desktop and Documents folders as part of iCloud Drive, continuously syncing changes in the background.",
      "Files can appear locally or as cloud-only placeholders depending on available disk space and whether Optimize Mac Storage is active.",
    ],
    steps: [
      "Open System Settings and click your name at the top (Apple ID)",
      "Select iCloud, then iCloud Drive",
      "Enable Desktop & Documents Folders",
      "Wait for the initial sync to complete",
    ],
  },
},
{
  id: "macos-migration-assistant",
  title: "Migration Assistant",
  icon: RefreshCw,
  platform: "macos",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Transfer data from an old Mac or backup",
  description: "Move apps, files, user accounts, and settings from another Mac, a Time Machine backup, or a Windows PC onto your current Mac using the built-in Migration Assistant utility.",
  details: [
    "Located in Applications → Utilities → Migration Assistant",
    "Supports transfer over Wi-Fi, Ethernet, Thunderbolt cable, or from a backup disk",
    "Can migrate a single user account or an entire system",
    "Also used during initial macOS Setup Assistant for new Mac setup",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT204350",
  whyItMatters: "Migration Assistant eliminates the tedious process of manually reinstalling apps and reconfiguring settings when moving to a new Mac, preserving hours of setup work. Because it can pull from a Time Machine backup as well as a live Mac, it also serves as a recovery path after a full disk erase. Choosing a direct cable connection over Wi-Fi can dramatically cut down transfer time for users with large amounts of data.",
  bestPractices: [
    "Use a wired connection (Ethernet or Thunderbolt) for large transfers to save time",
    "Ensure both Macs are updated to compatible macOS versions before migrating",
    "Keep both Macs plugged into power during the entire transfer",
    "Back up the source Mac first in case interruption occurs",
  ],
  commonIssues: [
    { issue: "Migration Assistant can't find the other Mac", fix: "Ensure both Macs are on the same network or connected directly, and that firewalls aren't blocking the connection." },
    { issue: "Transfer is extremely slow", fix: "Switch from Wi-Fi to a wired connection between the two Macs." },
    { issue: "Migration fails partway through", fix: "Ensure sufficient free disk space on the destination Mac and retry the transfer." },
  ],
  faqs: [
    { q: "Can I migrate from a Windows PC?", a: "Yes, using the separate Windows Migration Assistant app installed on the PC." },
    { q: "Will migrating overwrite my existing files?", a: "You can choose to merge data or migrate into a new user account to avoid conflicts." },
    { q: "Can I migrate from a Time Machine backup on an external drive?", a: "Yes, Migration Assistant supports restoring directly from a connected Time Machine backup disk." },
  ],
  tipsAndTricks: [
    "Run migration overnight for very large data sets",
    "Disconnect unnecessary peripherals during migration to reduce interference",
  ],
  relatedSettingIds: ["macos-time-machine-backup", "macos-external-storage"],
  afterImageContent: {
    heading: "How Migration Assistant Works",
    paragraphs: [
      "Migration Assistant reads data from a source Mac, Time Machine backup, or Windows PC and copies user accounts, apps, and settings to the destination Mac.",
      "It runs on both the source and destination simultaneously when transferring Mac-to-Mac, pairing them securely before the transfer begins.",
    ],
    steps: [
      "Open Migration Assistant from Applications → Utilities",
      "Choose how to transfer: from a Mac, Time Machine backup, or PC",
      "Select the specific data (accounts, apps, settings) to migrate",
      "Confirm and wait for the transfer to complete",
    ],
  },
},
{
  id: "macos-disk-utility-partition",
  title: "Disk Utility: Partition & Format Drives",
  icon: HardDrive,
  platform: "macos",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Partition, format, and erase disks",
  description: "Use Disk Utility to create or resize partitions, format internal or external drives to a specific file system, and erase disks before reuse.",
  details: [
    "Located in Applications → Utilities → Disk Utility",
    "Supports APFS, Mac OS Extended, and exFAT/MS-DOS formats",
    "Can create multiple partitions or a single-container APFS volume group",
    "Shows all connected internal and external storage devices",
  ],
  redirectUrl: "https://support.apple.com/guide/disk-utility/welcome/mac",
  whyItMatters: "Disk Utility is the primary tool for preparing storage devices for use with a Mac, whether that means formatting a new external drive, reclaiming space by resizing a partition, or fully erasing a drive before selling or repurposing it. Choosing the right file system format directly affects compatibility with Windows, older Macs, and specific use cases like Time Machine or bootable installers. Understanding partitioning also matters for users setting up dual-boot configurations or dedicated backup volumes.",
  bestPractices: [
    "Use APFS for drives used exclusively with modern Macs",
    "Use exFAT for drives shared between Mac and Windows",
    "Back up any data on a drive before erasing or repartitioning it",
    "Choose GUID Partition Map for drives that need to boot a Mac",
  ],
  commonIssues: [
    { issue: "A drive isn't recognized by Windows after formatting", fix: "Reformat as exFAT or MS-DOS (FAT) instead of APFS or Mac OS Extended." },
    { issue: "Can't resize a partition", fix: "Ensure no data occupies the space being reclaimed, and that the volume isn't currently in use." },
    { issue: "Erase option is grayed out", fix: "Unmount other volumes using the disk, or boot from Recovery Mode to erase the startup disk." },
  ],
  faqs: [
    { q: "What's the difference between erasing and formatting?", a: "Erasing removes all data and rewrites the file system; formatting refers to the file system type chosen during that process." },
    { q: "Can I undo a partition change?", a: "No, partitioning changes are immediate and data in resized or removed partitions can be lost." },
    { q: "Which format should I choose for a Time Machine backup disk?", a: "APFS or Mac OS Extended (Journaled) are supported; Disk Utility will guide you when setting up the backup." },
  ],
  tipsAndTricks: [
    "Use the First Aid tab to verify a drive's health before repartitioning",
    "Name volumes clearly to avoid confusion when multiple drives are connected",
  ],
  relatedSettingIds: ["macos-external-storage", "macos-disk-utility-first-aid"],
  afterImageContent: {
    heading: "How Disk Utility Partitioning Works",
    paragraphs: [
      "Disk Utility presents every connected physical disk and its volumes in a sidebar, letting you select one to partition, format, or erase.",
      "APFS containers can hold multiple volumes that share free space dynamically, differing from traditional fixed-size partitions.",
    ],
    steps: [
      "Open Disk Utility from Applications → Utilities",
      "Select the disk or volume in the sidebar",
      "Choose Partition, Erase, or First Aid from the toolbar",
      "Confirm the file system format and apply changes",
    ],
  },
},
{
  id: "macos-icloud-plus-features",
  title: "iCloud+ Features",
  icon: Cloud,
  platform: "macos",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Manage Private Relay, Hide My Email, and more",
  description: "Enable and configure premium iCloud+ features such as iCloud Private Relay, Hide My Email, and HomeKit Secure Video storage tied to your paid iCloud storage plan.",
  details: [
    "Located under Apple ID → iCloud in System Settings",
    "Includes Private Relay, Hide My Email, and custom email domain",
    "Available on any paid iCloud+ storage tier, not just the top plan",
    "Some features, like Private Relay, can be paused per network",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT210590",
  whyItMatters: "iCloud+ features extend basic iCloud storage into a set of privacy and convenience tools bundled at no extra cost once you subscribe to any paid storage tier. Private Relay masks browsing traffic from network observers, while Hide My Email lets users create disposable addresses to reduce spam and tracking tied to their real email. Because many users don't realize these are included with iCloud+, reviewing this settings page often reveals underused value in an existing subscription.",
  bestPractices: [
    "Enable Hide My Email when signing up for services you don't fully trust",
    "Pause Private Relay only when troubleshooting a specific network issue",
    "Review generated Hide My Email addresses periodically and deactivate unused ones",
  ],
  commonIssues: [
    { issue: "A website doesn't work correctly with Private Relay on", fix: "Temporarily disable Private Relay for that specific network in Wi-Fi settings." },
    { issue: "Emails sent to a Hide My Email address aren't arriving", fix: "Check that the alias is still active and check Mail's spam or junk folder." },
    { issue: "iCloud+ features are greyed out", fix: "Confirm you're subscribed to a paid iCloud storage tier, as the free tier doesn't include them." },
  ],
  faqs: [
    { q: "Do I need the top storage tier for iCloud+ features?", a: "No, any paid tier starting at the smallest paid plan includes the full iCloud+ feature set." },
    { q: "Does Private Relay work like a VPN?", a: "It's similar in that it hides your IP address from websites, but it only applies to Safari browsing traffic and some system traffic, not all apps." },
  ],
  tipsAndTricks: [
    "Use Hide My Email directly from Safari's autofill when signing up for new accounts",
    "Check iCloud+ feature availability if a feature seems missing after a plan downgrade",
  ],
  relatedSettingIds: ["macos-icloud-drive", "macos-download-your-data"],
  afterImageContent: {
    heading: "How iCloud+ Features Work",
    paragraphs: [
      "iCloud+ bundles several privacy and convenience features with any paid iCloud storage subscription, activated automatically once you subscribe.",
      "Each feature, like Private Relay or Hide My Email, can be individually enabled, configured, or paused from this settings area.",
    ],
    steps: [
      "Open System Settings and click your name (Apple ID)",
      "Select iCloud",
      "Choose the iCloud+ feature to configure, such as Private Relay or Hide My Email",
      "Toggle it on and adjust its specific options",
    ],
  },
},
{
  id: "macos-download-your-data",
  title: "Download a Copy of Your Data",
  icon: CloudDownload,
  platform: "macos",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Request an export of your Apple ID data",
  description: "Request a downloadable archive of the personal data associated with your Apple ID, including iCloud content, purchase history, and account details, through the Data & Privacy portal.",
  details: [
    "Initiated from Apple ID → Privacy & Security → Get a copy of your data",
    "Lets you choose specific categories of data to include",
    "Delivered as a downloadable archive after a processing period",
    "Separate from local Time Machine or iCloud Drive backups",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT208502",
  whyItMatters: "This feature gives users a way to obtain a portable copy of everything Apple holds under their account, supporting transparency and easing migration away from Apple services if desired. It's also useful for personal archiving of purchase history, iCloud content, and account activity that isn't otherwise easily exportable. Because the request can take time to prepare, it's best used proactively rather than during an urgent data-loss situation.",
  bestPractices: [
    "Select only the data categories you actually need to keep the archive manageable",
    "Download the archive promptly once ready, as the link expires after a set period",
    "Use a secure, encrypted location to store the exported data given its sensitivity",
  ],
  commonIssues: [
    { issue: "Request is taking a long time to prepare", fix: "Large accounts with extensive iCloud content can take several days; this is expected." },
    { issue: "Download link expired", fix: "Submit a new data request through the Data & Privacy portal." },
    { issue: "Archive is missing certain content", fix: "Confirm the relevant category was selected when the request was submitted." },
  ],
  faqs: [
    { q: "Is this the same as an iCloud backup?", a: "No, this is a one-time data export for transparency and portability, not a restorable backup." },
    { q: "How long does Apple take to prepare the archive?", a: "It can take up to seven days, depending on the amount of data requested." },
    { q: "Can I request this from a Mac without an iPhone?", a: "Yes, the request can be made through System Settings on a Mac or via appleid.apple.com." },
  ],
  tipsAndTricks: [
    "Request smaller, category-specific exports if you only need particular data",
    "Cross-check the archive against Time Machine backups for a complete personal record",
  ],
  relatedSettingIds: ["macos-icloud-plus-features", "macos-icloud-drive"],
  afterImageContent: {
    heading: "How Data Export Requests Work",
    paragraphs: [
      "Apple compiles the requested categories of account data into an archive on its servers, a process that can take from a few hours up to about a week.",
      "Once ready, you're notified and given a limited-time link to download the completed archive.",
    ],
    steps: [
      "Open System Settings and click your name (Apple ID)",
      "Select Privacy & Security, then scroll to Get a copy of your data",
      "Choose the data categories to include",
      "Submit the request and wait for the download notification",
    ],
  },
},
{
  id: "macos-sharing-computer-name",
  title: "Sharing & Computer Name",
  icon: Share2,
  platform: "macos",
  category: "system-info",
  controlType: "action",
  heading: "Set your Mac's network name and identity",
  description: "View and change the name your Mac uses on local networks and AirDrop, and manage which sharing services like File Sharing or Screen Sharing are enabled.",
  details: [
    "Located under System Settings → General → Sharing",
    "Computer name appears in Finder's Network sidebar and AirDrop",
    "Individual toggles for File Sharing, Screen Sharing, Remote Login, and more",
    "Local hostname (.local) is derived automatically from the computer name",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/change-your-computer-name-mchlp2322/mac",
  whyItMatters: "Your Mac's computer name is its identity on local networks, appearing when other devices browse for AirDrop recipients, shared folders, or screen sharing targets. A clear, recognizable name makes it far easier to pick the right device out of a list on a network with multiple Macs, especially in offices or shared households. This pane also centralizes the toggles for services that expose your Mac to the local network, making it an important stop for both convenience and security review.",
  bestPractices: [
    "Give your Mac a distinct, recognizable name if multiple Macs share a network",
    "Only enable sharing services you actively use",
    "Turn off Remote Login and Remote Management unless specifically needed",
    "Review the sharing list after connecting to unfamiliar networks",
  ],
  commonIssues: [
    { issue: "Mac doesn't appear correctly in AirDrop", fix: "Rename it under Sharing to something distinct, then verify Wi-Fi and Bluetooth are both on." },
    { issue: "Can't connect to shared files from another Mac", fix: "Confirm File Sharing is enabled and the correct folders and users are authorized." },
    { issue: "Local hostname doesn't match the computer name", fix: "Retype the computer name field to force the .local hostname to regenerate." },
  ],
  faqs: [
    { q: "Does renaming my Mac affect my Apple ID?", a: "No, the computer name is purely a local network identity, separate from your Apple ID." },
    { q: "Can two Macs on the same network share the same name?", a: "They can display the same name, though macOS will typically append a number to the local hostname to keep it unique." },
    { q: "Is Screen Sharing the same as remote desktop apps?", a: "It provides similar functionality using Apple's built-in protocol, without needing third-party remote desktop software." },
  ],
  tipsAndTricks: [
    "Use a short, unique name to make your Mac easy to spot in AirDrop and Finder sidebars",
    "Disable unused sharing services before connecting to public Wi-Fi",
  ],
  relatedSettingIds: ["macos-about-this-mac", "macos-system-report"],
  afterImageContent: {
    heading: "How Sharing & Computer Name Works",
    paragraphs: [
      "The computer name is broadcast over the local network via Bonjour, letting other Apple devices discover your Mac for AirDrop, file sharing, and more.",
      "Each sharing service listed below the name operates independently, opening a specific network port or protocol only while enabled.",
    ],
    steps: [
      "Open System Settings",
      "Select General, then Sharing",
      "Edit the computer name field at the top",
      "Toggle individual sharing services on or off as needed",
    ],
  },
},
{
  id: "macos-configuration-profiles",
  title: "Profiles (Device Management)",
  icon: FileText,
  platform: "macos",
  category: "system-info",
  controlType: "action",
  heading: "View installed configuration profiles",
  description: "See configuration profiles installed on your Mac by an employer, school, or manually, which can enforce settings like Wi-Fi configurations, restrictions, or MDM enrollment.",
  details: [
    "Appears as a Profiles pane in System Settings only when profiles are installed",
    "Shows profile source, install date, and settings it controls",
    "Common for MDM-enrolled work or school-managed Macs",
    "Profiles can be removed only if not locked by an administrator",
  ],
  redirectUrl: "https://support.apple.com/guide/deployment/welcome/web",
  whyItMatters: "Configuration profiles can silently apply significant changes to a Mac's behavior, from enforcing Wi-Fi settings to restricting certain features or enrolling the device in full mobile device management. Being able to see exactly what's installed, and by whom, gives users transparency into managed aspects of their Mac, which is especially important on personally-owned devices used for work. For IT-managed fleets, this pane is also the standard place to confirm MDM enrollment status.",
  bestPractices: [
    "Review installed profiles periodically on any Mac used for work or school",
    "Only install a profile if you trust and understand its source",
    "Contact your IT administrator before removing a profile on a managed Mac",
  ],
  commonIssues: [
    { issue: "Can't remove a profile", fix: "It may be locked by MDM; contact the administrator who deployed it." },
    { issue: "Unexpected restrictions appear after installing an app", fix: "Check the Profiles pane for a profile installed alongside that app or network." },
    { issue: "No Profiles pane appears in System Settings", fix: "This is normal; the pane only shows when at least one profile is installed." },
  ],
  faqs: [
    { q: "Are configuration profiles the same as MDM enrollment?", a: "MDM enrollment uses a profile, but not every profile implies full MDM management." },
    { q: "Can a profile see my personal data?", a: "Depending on its scope, a management profile can enforce policies and, in some cases, access certain device information." },
    { q: "How do I know who installed a profile?", a: "The Profiles pane lists the signing organization and installation source for each profile." },
  ],
  tipsAndTricks: [
    "Check this pane after joining a new corporate or school Wi-Fi network that required a profile",
    "Use it to confirm removal of a profile after leaving a job or school that managed your Mac",
  ],
  relatedSettingIds: ["macos-privacy-security-hub", "macos-users-groups"],
  afterImageContent: {
    heading: "How Configuration Profiles Work",
    paragraphs: [
      "A configuration profile is a signed file that applies a defined set of settings, restrictions, or enrollment instructions to the Mac when installed.",
      "Profiles can come from an MDM server automatically, or be manually installed from a file provided by an organization.",
    ],
    steps: [
      "Open System Settings",
      "Select Profiles in the sidebar (visible only if profiles exist)",
      "Click a profile to view its details and source",
      "Remove it using the minus button if it's not administrator-locked",
    ],
  },
},
{
  id: "macos-app-store-auto-updates",
  title: "App Store Automatic App Updates",
  icon: RefreshCw,
  platform: "macos",
  category: "system-updates",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Auto-update apps from the App Store",
  description: "Control whether apps downloaded from the Mac App Store update automatically in the background as new versions become available.",
  details: [
    "Toggle located under System Settings → General → Software Update → Advanced, or in App Store preferences",
    "Applies only to apps installed via the Mac App Store",
    "Independent from macOS system update settings",
    "Updates can still be checked and installed manually from the App Store's Updates tab",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT202180",
  whyItMatters: "Keeping App Store apps current ensures users benefit from bug fixes, security patches, and new features without needing to remember to check manually. Because this setting is separate from macOS system updates, users can choose different automation levels for the operating system versus individual apps. For apps with frequent updates, disabling auto-update can also be a deliberate choice to avoid unexpected interface or behavior changes mid-workflow.",
  bestPractices: [
    "Leave automatic app updates on for most users to stay current on security fixes",
    "Disable it only for apps where version stability is critical, and update those manually with review",
    "Check the App Store's Updates tab periodically even with auto-update enabled",
  ],
  commonIssues: [
    { issue: "An app updated unexpectedly and changed behavior", fix: "Disable automatic updates and manage that app's updates manually going forward." },
    { issue: "Updates aren't installing automatically", fix: "Confirm the toggle is enabled and the Mac has an active internet connection." },
    { issue: "An update fails repeatedly", fix: "Delete and reinstall the app from the App Store, or check available disk space." },
  ],
  faqs: [
    { q: "Does this update macOS itself?", a: "No, macOS system updates are controlled separately under Software Update." },
    { q: "Can I update just one app manually while leaving auto-update on for others?", a: "Yes, manual updates from the App Store work regardless of the automatic setting." },
    { q: "Do updates download over cellular on a Mac?", a: "Macs don't use cellular by default, but updates will use whatever active network connection is available." },
  ],
  tipsAndTricks: [
    "Check the App Store's Purchased tab to see update history for installed apps",
    "Use Launchpad or the App Store icon badge to spot pending updates quickly",
  ],
  relatedSettingIds: ["macos-software-update", "macos-automatic-updates"],
  afterImageContent: {
    heading: "How App Store Automatic Updates Work",
    paragraphs: [
      "When enabled, the App Store checks periodically for new versions of installed apps and downloads and installs them in the background.",
      "This setting operates independently of macOS's own software update mechanism, which governs system and security updates.",
    ],
    steps: [
      "Open System Settings",
      "Select General, then Software Update",
      "Click the info button next to Automatic Updates",
      "Toggle 'Install app updates from the App Store' as desired",
    ],
  },
},
{
  id: "macos-update-now-vs-upgrade-later",
  title: "Update Now vs. Upgrade Later",
  icon: CloudDownload,
  platform: "macos",
  category: "system-updates",
  controlType: "action",
  heading: "Choose a minor update or a full OS upgrade",
  description: "When both are available, decide whether to install just the latest security or point update for your current macOS version, or perform a full upgrade to the newest major macOS release.",
  details: [
    "Presented as separate 'Update Now' and 'Upgrade Now' buttons in Software Update",
    "Update Now applies smaller patches without changing your macOS version",
    "Upgrade Now moves to a newer major macOS release with larger changes",
    "Older Macs may only see Update Now if they're ineligible for the newest major version",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT201222",
  whyItMatters: "Distinguishing between a minor update and a major upgrade matters because major upgrades introduce broader interface and compatibility changes that can affect app support, while minor updates focus narrowly on fixes and security patches with lower risk. Users who depend on specific software compatibility often prefer staying on Update Now for as long as reasonably possible, while those wanting the newest features choose Upgrade Now. Understanding this distinction avoids the common surprise of an unintended major OS upgrade.",
  bestPractices: [
    "Check app compatibility before choosing Upgrade Now on a work Mac",
    "Choose Update Now if you only need the latest security patch",
    "Wait a few weeks after a major release before upgrading if stability is a priority",
    "Back up your Mac before either type of installation",
  ],
  commonIssues: [
    { issue: "Only Upgrade Now is shown, no minor update option", fix: "This happens once Apple stops issuing separate updates for your prior macOS version; back up before proceeding." },
    { issue: "Uncertain which option was previously chosen", fix: "Check About This Mac for the current macOS version and build number." },
    { issue: "Upgrade Now is unavailable on an older Mac", fix: "The Mac may not meet the minimum hardware requirements for the newest macOS version." },
  ],
  faqs: [
    { q: "Does Update Now include security fixes?", a: "Yes, Update Now installs the latest supported patches, including security content, for your current macOS version." },
    { q: "Can I go back after choosing Upgrade Now?", a: "Downgrading macOS is possible only via a full erase and reinstall from a backup, and isn't officially straightforward." },
    { q: "How long does Apple support the previous two macOS versions with updates?", a: "Apple typically provides security updates for the current and two prior macOS versions, though duration varies by release." },
  ],
  tipsAndTricks: [
    "Read release notes for the major upgrade before committing if you rely on specific pro apps",
    "Use Update Now to stay secure while waiting out early bugs in a brand-new major release",
  ],
  relatedSettingIds: ["macos-software-update", "macos-update-history"],
  afterImageContent: {
    heading: "How Update Now vs. Upgrade Later Works",
    paragraphs: [
      "macOS separates smaller, more frequent patches from large annual feature releases, presenting both as distinct options when available.",
      "Choosing one doesn't forfeit the other permanently; you can still upgrade later once you're ready to move to the newest major version.",
    ],
    steps: [
      "Open System Settings",
      "Select General, then Software Update",
      "Review the available options shown, such as Update Now and Upgrade Now",
      "Select the appropriate option and confirm installation",
    ],
  },
},
{
  id: "macos-update-install-scheduling",
  title: "Update Installation Scheduling",
  icon: CalendarClock,
  platform: "macos",
  category: "system-updates",
  controlType: "action",
  heading: "Control when downloaded updates install",
  description: "Fine-tune whether macOS installs downloaded updates immediately, overnight, or only after explicit confirmation, minimizing disruption during active work sessions.",
  details: [
    "Configured within Software Update → Automatic Updates advanced options",
    "Downloading updates can be separated from installing them",
    "Security responses can be set to install automatically even if other updates aren't",
    "A restart is required to finish most macOS installations",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT201222",
  whyItMatters: "Separating the download and installation stages of an update lets users keep a Mac current without risking an unexpected restart in the middle of active work. This is especially valuable for professionals running long processes or presentations, where an automatic restart could be disruptive or costly. Fine-grained control over installation timing helps balance staying secure against maintaining an uninterrupted workflow.",
  bestPractices: [
    "Keep 'Download new updates when available' on even if you delay installation",
    "Schedule installs for overnight or downtime hours when possible",
    "Leave automatic installation of security responses on for baseline protection",
    "Manually check before a big presentation or deadline to avoid a surprise restart",
  ],
  commonIssues: [
    { issue: "Mac restarts unexpectedly to finish an update", fix: "Disable automatic installation and install updates manually at a convenient time instead." },
    { issue: "Updates download but never install", fix: "Enable 'Install macOS updates' in the Automatic Updates settings, or install manually from Software Update." },
    { issue: "Unsaved work was lost during an automatic restart", fix: "Enable auto-save in apps where possible, and adjust update timing settings to avoid working hours." },
  ],
  faqs: [
    { q: "Can updates install without any restart?", a: "Some smaller updates and security responses can install without a restart, but most macOS updates require one." },
    { q: "Is there a way to fully disable automatic installation but keep downloads?", a: "Yes, toggle off 'Install macOS updates' while leaving 'Download new updates when available' on." },
    { q: "Will macOS warn me before restarting for an update?", a: "Yes, it typically provides advance notice and a countdown before an automatic restart." },
  ],
  tipsAndTricks: [
    "Leave your Mac connected to power and Wi-Fi overnight to allow scheduled installs to complete",
    "Check Software Update the morning after a scheduled install to confirm it completed",
  ],
  relatedSettingIds: ["macos-automatic-updates", "macos-software-update"],
  afterImageContent: {
    heading: "How Update Scheduling Works",
    paragraphs: [
      "macOS treats downloading and installing updates as separate steps, each with its own toggle under Automatic Updates.",
      "When installation is automatic, macOS chooses a low-usage time, often overnight, and warns before restarting to complete the process.",
    ],
    steps: [
      "Open System Settings",
      "Select General, then Software Update",
      "Click the info button next to Automatic Updates",
      "Adjust download and install toggles individually",
    ],
  },
},
{
  id: "macos-managed-updates-deferral",
  title: "Managed Updates (Enterprise/School)",
  icon: ShieldAlert,
  platform: "macos",
  category: "system-updates",
  controlType: "action",
  heading: "View update policies set by an organization",
  description: "See when an employer or school's device management policy is deferring, restricting, or controlling macOS update availability on a managed Mac.",
  details: [
    "Indicated by a message such as 'This update is managed by your organization' in Software Update",
    "Deferral periods can delay a specific update from appearing for a set number of days",
    "Some organizations require updates within a compliance deadline",
    "Managed settings originate from an MDM profile, not local user preference",
  ],
  redirectUrl: "https://support.apple.com/guide/deployment/welcome/web",
  whyItMatters: "On enterprise or education-managed Macs, IT departments often intentionally delay rolling out new macOS versions to allow time for compatibility testing across internal software before wide deployment. Understanding that an update is being withheld by policy rather than a technical problem prevents unnecessary troubleshooting on the user's part. It also clarifies who to contact, since local settings changes typically cannot override an administrator's deferral or compliance policy.",
  bestPractices: [
    "Contact your IT administrator if an expected update doesn't appear",
    "Don't attempt to bypass a managed deferral, as this can violate compliance policy",
    "Check for a Profiles entry to confirm the Mac is under management",
    "Keep other non-managed apps and settings updated independently where allowed",
  ],
  commonIssues: [
    { issue: "An update won't appear even though it's publicly available", fix: "This is likely an intentional deferral set by your organization's MDM policy; contact IT." },
    { issue: "Compliance warning about an outdated macOS version", fix: "Install the required update promptly, or contact IT if unable to comply by the deadline." },
    { issue: "Uncertain if a Mac is managed", fix: "Check the Profiles pane in System Settings for an MDM enrollment profile." },
  ],
  faqs: [
    { q: "Can I remove a managed update deferral myself?", a: "No, only the organization's MDM administrator can change or remove a deferral policy." },
    { q: "Does managed deferral affect security updates too?", a: "It can, though many organizations prioritize security updates separately from feature upgrades." },
    { q: "Will I be notified before a mandatory managed update installs?", a: "Typically yes, though the specific notice period depends on the organization's policy." },
  ],
  tipsAndTricks: [
    "Ask IT for the expected rollout timeline if a needed feature is in a newer macOS version",
    "Keep personal data backed up separately, since managed Macs may enforce updates on a schedule outside your control",
  ],
  relatedSettingIds: ["macos-software-update", "macos-configuration-profiles"],
  afterImageContent: {
    heading: "How Managed Update Deferral Works",
    paragraphs: [
      "An MDM profile can instruct macOS to hide or delay specific updates from appearing in Software Update for a defined period.",
      "This allows organizations to test compatibility internally before their fleet of Macs receives a new macOS version.",
    ],
    steps: [
      "Open System Settings",
      "Select General, then Software Update",
      "Look for a note indicating the update is managed by your organization",
      "Contact your IT administrator for more detail on the deferral or compliance timeline",
    ],
  },
},
{
  id: "macos-update-command-line",
  title: "Update macOS from the Command Line",
  icon: Terminal,
  platform: "macos",
  category: "system-updates",
  controlType: "action",
  heading: "Check and install updates via softwareupdate",
  description: "Use the built-in softwareupdate command-line tool in Terminal to list, download, and install macOS updates without opening System Settings, useful for scripting and remote management.",
  details: [
    "Accessed via the softwareupdate command in Terminal",
    "The -l flag lists available updates; -i installs a specific update",
    "Useful for scripted deployments and remote or headless Macs",
    "Requires administrator privileges for most operations",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT201222",
  whyItMatters: "The command-line update tool gives administrators and power users a scriptable way to check for and apply updates, which is essential for managing multiple Macs or headless systems without a graphical session. It mirrors the same update mechanism used by System Settings, so results are consistent with the graphical interface. This approach is particularly valuable in IT environments that automate maintenance tasks across a fleet of machines via remote scripts.",
  bestPractices: [
    "Run softwareupdate -l first to review available updates before installing",
    "Use sudo for commands that require administrator privileges",
    "Schedule command-line update checks during low-usage windows on managed systems",
    "Test scripts on a single Mac before deploying broadly",
  ],
  commonIssues: [
    { issue: "Command returns 'No new software available' unexpectedly", fix: "Confirm the Mac has an active internet connection and isn't restricted by a managed deferral policy." },
    { issue: "Installation requires a restart mid-script", fix: "Use the --restart flag deliberately or schedule installs where a restart is acceptable." },
    { issue: "Permission denied running the command", fix: "Prefix the command with sudo and enter an administrator password." },
  ],
  faqs: [
    { q: "Is this different from using the App Store or Software Update pane?", a: "No, it uses the same underlying update service, just accessed via Terminal instead of a graphical interface." },
    { q: "Can this install a major macOS upgrade, not just minor updates?", a: "Yes, with the correct flags it can download and install full macOS upgrades, though this requires more disk space and time." },
    { q: "Do I need special software to use this?", a: "No, softwareupdate is built into every Mac and requires only Terminal access." },
  ],
  tipsAndTricks: [
    "Use 'softwareupdate --history' to review a log of previously installed updates",
    "Combine with remote management tools like SSH for maintaining headless Macs",
  ],
  relatedSettingIds: ["macos-software-update", "macos-update-history"],
  afterImageContent: {
    heading: "How Command-Line Updates Work",
    paragraphs: [
      "The softwareupdate tool communicates with the same Apple update servers used by the graphical Software Update pane, returning available updates as text output.",
      "Administrators can script checks, downloads, and installs, making it a common building block in automated Mac fleet management.",
    ],
    steps: [
      "Open Terminal from Applications → Utilities",
      "Run 'softwareupdate -l' to list available updates",
      "Run 'sudo softwareupdate -i <update-name>' to install a specific update",
      "Restart if prompted to complete installation",
    ],
  },
},
{
  id: "macos-disk-utility-first-aid",
  title: "Disk Utility First Aid",
  icon: HardDrive,
  platform: "macos",
  category: "troubleshooting-diagnostics",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Repair disk errors with First Aid",
  description: "Run Disk Utility's First Aid tool to check a disk or volume for directory and file system errors and attempt automatic repair.",
  details: [
    "Available in Disk Utility under Applications → Utilities",
    "Can be run on internal, external, and APFS container volumes",
    "Startup disk repairs often require running from Recovery Mode",
    "Reports errors even if it cannot fully repair them",
  ],
  redirectUrl: "https://support.apple.com/guide/disk-utility/repair-a-storage-device-dskutl1040/mac",
  whyItMatters: "First Aid is the primary built-in tool for diagnosing and fixing file system corruption that can cause crashes, slow performance, or files that won't open. Running it periodically, and especially after an unexpected shutdown or crash, helps catch small directory issues before they escalate into data loss. Because the startup disk generally can't be repaired while actively in use, First Aid's integration with Recovery Mode is essential for resolving deeper system volume issues.",
  bestPractices: [
    "Run First Aid on external drives periodically, especially after improper ejection",
    "Use Recovery Mode's Disk Utility to repair the startup disk",
    "Back up important data before attempting repairs on a drive showing errors",
    "Re-run First Aid if the first pass reports it fixed some but not all issues",
  ],
  commonIssues: [
    { issue: "First Aid can't repair the startup disk while booted normally", fix: "Restart into Recovery Mode and run First Aid from there instead." },
    { issue: "First Aid reports errors it can't fix", fix: "Back up the data immediately and consider reformatting or replacing the drive." },
    { issue: "Process seems to hang for a long time", fix: "Large or heavily fragmented drives can take significantly longer; avoid interrupting the process." },
  ],
  faqs: [
    { q: "Does First Aid recover deleted files?", a: "No, it repairs file system structure, not individual deleted files." },
    { q: "How often should I run First Aid?", a: "Occasionally as preventive maintenance, or immediately after a crash, improper shutdown, or drive errors." },
    { q: "Can First Aid damage my data?", a: "It's designed to be safe, but a backup beforehand is recommended for any drive already showing symptoms of failure." },
  ],
  tipsAndTricks: [
    "Check the SMART status shown in Disk Utility as a first indicator of drive health",
    "Run First Aid on an external drive right after any instance of improper ejection",
  ],
  relatedSettingIds: ["macos-disk-utility-partition", "macos-recovery-mode"],
  afterImageContent: {
    heading: "How Disk Utility First Aid Works",
    paragraphs: [
      "First Aid scans the selected volume's file system structure for inconsistencies, comparing it against what the directory expects to find.",
      "When issues are found, it attempts automatic repair, reporting a summary of what was checked and fixed at the end of the process.",
    ],
    steps: [
      "Open Disk Utility from Applications → Utilities",
      "Select the disk or volume in the sidebar",
      "Click First Aid in the toolbar",
      "Click Run and review the results when finished",
    ],
  },
},
{
  id: "macos-apple-diagnostics",
  title: "Apple Diagnostics",
  icon: Cpu,
  platform: "macos",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  heading: "Run a hardware test on your Mac",
  description: "Use Apple Diagnostics, launched at startup, to test your Mac's hardware components including memory, logic board, and battery for underlying issues.",
  details: [
    "Started by holding D at startup, or via Recovery Mode on Apple silicon Macs",
    "Tests memory, storage controller, battery, and other internal components",
    "Produces a reference code that support staff can use to identify issues",
    "Does not test third-party or external peripherals",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT202731",
  whyItMatters: "Apple Diagnostics provides an authoritative, hardware-level test independent of macOS itself, which is valuable when software-level troubleshooting doesn't explain a persistent problem like random restarts or battery issues. Because it runs outside the normal operating system, it can catch failures that wouldn't necessarily surface through everyday use. The reference codes it produces streamline conversations with Apple Support or an Apple Store, pointing directly to the likely faulty component.",
  bestPractices: [
    "Disconnect unnecessary external peripherals before running Diagnostics",
    "Ensure the Mac has a stable internet connection, as recent versions may need it",
    "Note the reference code exactly if contacting Apple Support afterward",
    "Run Diagnostics when experiencing unexplained crashes, shutdowns, or hardware symptoms",
  ],
  commonIssues: [
    { issue: "Diagnostics won't start when holding D at boot", fix: "Ensure you're pressing the key immediately at startup, and check keyboard connection on external keyboards." },
    { issue: "Test reports a reference code but no clear explanation", fix: "Search the reference code on Apple's support site or provide it directly to Apple Support." },
    { issue: "Diagnostics can't run due to no internet connection", fix: "Connect to Wi-Fi when prompted, as some diagnostic content is fetched online." },
  ],
  faqs: [
    { q: "Is Apple Diagnostics free to run?", a: "Yes, it's built into every Mac and free to use at any time." },
    { q: "Does it fix problems it finds?", a: "No, it only identifies issues; repairs require service through Apple or an authorized provider." },
    { q: "Can I run it on an Apple silicon Mac the same way?", a: "The process differs slightly; on Apple silicon Macs it's accessed through the startup options rather than holding D." },
  ],
  tipsAndTricks: [
    "Run Diagnostics before a hardware repair appointment to have a reference code ready",
    "Repeat the test if a first run is inconclusive, especially for intermittent issues",
  ],
  relatedSettingIds: ["macos-serial-warranty", "macos-recovery-mode"],
  afterImageContent: {
    heading: "How Apple Diagnostics Works",
    paragraphs: [
      "Apple Diagnostics boots into a minimal environment separate from macOS and runs a series of automated hardware tests across major components.",
      "At the end, it displays any reference codes for detected issues, which correspond to specific known hardware problems.",
    ],
    steps: [
      "Shut down the Mac completely",
      "Turn it on and immediately hold the D key (or use Startup Options on Apple silicon)",
      "Follow on-screen prompts to select a language and connect to Wi-Fi if needed",
      "Review the results and reference codes when testing completes",
    ],
  },
},
{
  id: "macos-console-system-logs",
  title: "Console: View System Logs",
  icon: FileText,
  platform: "macos",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  heading: "Inspect system and app logs",
  description: "Use the Console app to view real-time and historical system logs, crash reports, and diagnostic messages generated by macOS and installed apps.",
  details: [
    "Located in Applications → Utilities → Console",
    "Sidebar organizes logs by device, process, and crash reports",
    "Search and filter tools help narrow down relevant entries",
    "Live streaming view shows log messages as they happen",
  ],
  redirectUrl: "https://support.apple.com/guide/console/welcome/mac",
  whyItMatters: "Console exposes the detailed, low-level messages macOS and apps generate internally, which is often the only way to pinpoint the exact cause of a crash, freeze, or unexpected behavior. While the raw output can be dense for casual users, filtering by process or time window narrows it down to something actionable, especially when working with Apple Support or a developer to diagnose an issue. It's a foundational troubleshooting tool for anyone going beyond basic restart-and-retry fixes.",
  bestPractices: [
    "Filter by the specific app or process name to cut through unrelated noise",
    "Reproduce the issue while Console is actively streaming to capture relevant logs",
    "Export a log excerpt when sharing details with Apple Support or a developer",
    "Check the Crash Reports section first for app-specific failures",
  ],
  commonIssues: [
    { issue: "Log output is overwhelming and hard to parse", fix: "Use the search field and process filters to narrow results to a specific app or time range." },
    { issue: "Can't find a crash report for a recent app crash", fix: "Check under the 'Crash Reports' section in the sidebar rather than the general log stream." },
    { issue: "Logs stop updating", fix: "Click the Start/Stop streaming button to resume live capture." },
  ],
  faqs: [
    { q: "Do I need technical expertise to use Console?", a: "Basic use like finding crash reports is accessible to most users, though deep log analysis benefits from technical familiarity." },
    { q: "Can Console show logs from other Apple devices?", a: "Yes, if enabled, it can show logs from a connected iPhone or iPad in the sidebar." },
    { q: "How far back do logs go?", a: "Retention varies, but recent activity, typically the past several days, is generally available." },
  ],
  tipsAndTricks: [
    "Use the 'Now' marker before reproducing an issue to quickly jump to relevant new entries",
    "Save a filtered log search as a preset for issues you troubleshoot frequently",
  ],
  relatedSettingIds: ["macos-activity-monitor", "macos-diagnostics-usage-data"],
  afterImageContent: {
    heading: "How Console Works",
    paragraphs: [
      "Console reads from macOS's unified logging system, which continuously records structured messages from the OS and running apps.",
      "Its sidebar and search tools let you narrow a large stream of messages down to entries relevant to a specific app, process, or time window.",
    ],
    steps: [
      "Open Console from Applications → Utilities",
      "Select a device or log source from the sidebar",
      "Use the search field to filter by process or keyword",
      "Reproduce the issue and review the captured log entries",
    ],
  },
},
{
  id: "macos-reinstall-macos",
  title: "Reinstall macOS",
  icon: RotateCcw,
  platform: "macos",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  heading: "Reinstall macOS without erasing data",
  description: "Reinstall the current version of macOS over your existing system through Recovery Mode, replacing system files while keeping your apps, settings, and personal data intact.",
  details: [
    "Accessed via Recovery Mode's 'Reinstall macOS' option",
    "Repairs corrupted system files without erasing user data",
    "Requires a stable internet connection to download installation files",
    "Different from Erase and reinstall, which wipes the disk first",
  ],
  redirectUrl: "https://support.apple.com/en-us/HT204904",
  whyItMatters: "Reinstalling macOS in place is a middle-ground troubleshooting step that can resolve persistent system-level glitches or corrupted files without the drastic step of erasing the entire disk. It's often recommended when problems persist after other fixes like Safe Mode or First Aid haven't resolved the issue but a full data wipe still feels premature. Because personal files, apps, and settings remain untouched, it carries far less risk than a full erase, making it a common escalation point in structured troubleshooting.",
  bestPractices: [
    "Back up your Mac before reinstalling, even though data is normally preserved",
    "Ensure a stable internet connection and sufficient battery or power before starting",
    "Try Safe Mode and First Aid first, since reinstalling won't fix hardware issues",
    "Allow the process to complete uninterrupted, as it can take significant time to download and install",
  ],
  commonIssues: [
    { issue: "Reinstall doesn't fix the original problem", fix: "The issue may be hardware-related; run Apple Diagnostics or consider an Erase and reinstall instead." },
    { issue: "Process stalls or fails during download", fix: "Check network connectivity and retry, or connect to a different Wi-Fi network." },
    { issue: "Not enough disk space to reinstall", fix: "Free up space using Storage Management before starting the reinstall." },
  ],
  faqs: [
    { q: "Will I lose my files during a standard reinstall?", a: "No, a standard 'Reinstall macOS' from Recovery preserves your existing files, apps, and settings." },
    { q: "How long does reinstalling macOS take?", a: "It varies with internet speed and Mac performance, typically ranging from thirty minutes to a few hours." },
    { q: "Do I need my Apple ID password?", a: "Yes, Recovery Mode may ask you to sign in to verify ownership before proceeding." },
  ],
  tipsAndTricks: [
    "Stay connected to power throughout the entire process on a laptop",
    "Use a wired Ethernet connection if available for a faster, more reliable download",
  ],
  relatedSettingIds: ["macos-recovery-mode", "macos-erase-reset-mac"],
  afterImageContent: {
    heading: "How Reinstalling macOS Works",
    paragraphs: [
      "Recovery Mode downloads a fresh copy of macOS system files and installs them over the existing system, replacing corrupted or modified files.",
      "User data, apps, and settings in the user folder are left in place since this process targets system-level files rather than the entire disk.",
    ],
    steps: [
      "Restart the Mac and enter Recovery Mode",
      "Select Reinstall macOS from the utilities window",
      "Follow the prompts, selecting the startup disk if asked",
      "Wait for the download and installation to complete, then restart",
    ],
  },
},
{
  id: "macos-force-quit-apps",
  title: "Force Quit Unresponsive Apps",
  icon: AppWindow,
  platform: "macos",
  category: "troubleshooting-diagnostics",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Close a frozen or unresponsive app",
  description: "Use the Force Quit Applications window to immediately close an app that has stopped responding, without needing to restart the entire Mac.",
  details: [
    "Opened via Option-Command-Escape or the Apple menu",
    "Lists all currently open apps, flagging unresponsive ones",
    "Force quitting discards unsaved changes in that app",
    "Distinct from Activity Monitor, which shows deeper process details",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/quit-or-force-quit-apps-mh40040/mac",
  whyItMatters: "Force Quit is the fastest way to recover from a single frozen app without disrupting everything else running on the Mac, avoiding an unnecessary full restart. It's one of the most commonly used troubleshooting actions because app freezes are a routine, if occasional, part of everyday computer use. Knowing the keyboard shortcut and understanding that unsaved work will be lost helps users respond quickly and confidently when an app stops responding.",
  bestPractices: [
    "Wait a few seconds to confirm an app is truly unresponsive before force quitting",
    "Save work frequently in apps prone to occasional freezes",
    "Use Activity Monitor for a more detailed look if force quitting doesn't resolve the issue",
    "Relaunch the app after force quitting to confirm normal operation resumes",
  ],
  commonIssues: [
    { issue: "Force Quit window won't open", fix: "Try the Apple menu → Force Quit as an alternative to the keyboard shortcut." },
    { issue: "An app immediately freezes again after relaunching", fix: "Check for pending updates to the app, or investigate further using Activity Monitor and Console." },
    { issue: "Unsaved work was lost after force quitting", fix: "Check the app for an auto-recovery or auto-save feature next time it opens." },
  ],
  faqs: [
    { q: "Does force quitting an app close background processes it started?", a: "Usually yes, though some helper processes may need to be separately quit via Activity Monitor." },
    { q: "Is force quitting the same as force restarting the Mac?", a: "No, force quitting closes a single app, while force restarting reboots the entire Mac." },
    { q: "Can I force quit Finder?", a: "Yes, Finder can be force quit and will automatically relaunch itself." },
  ],
  tipsAndTricks: [
    "Learn the Option-Command-Escape shortcut for instant access during a freeze",
    "Right-click a frozen app's Dock icon while holding Option for a quick Force Quit option",
  ],
  relatedSettingIds: ["macos-activity-monitor", "macos-console-system-logs"],
  afterImageContent: {
    heading: "How Force Quit Works",
    paragraphs: [
      "Force Quit sends a termination signal directly to the selected app's process, bypassing its normal, potentially stuck, shutdown routine.",
      "Because it skips the app's usual save prompts, any unsaved changes in open documents within that app are lost.",
    ],
    steps: [
      "Press Option-Command-Escape, or choose Force Quit from the Apple menu",
      "Select the unresponsive app from the list",
      "Click Force Quit and confirm",
      "Relaunch the app once it has closed",
    ],
  },
},{
  id: "macos-shortcuts-app",
  title: "Shortcuts App",
  icon: Sparkles,
  platform: "macos",
  category: "apps-features",
  controlType: "action",
  heading: "Automate repetitive tasks with custom workflows",
  description:
    "The Shortcuts app lets you build multi-step automations that run apps, files, and system actions in sequence, either manually, on a schedule, or triggered by an event.",
  details: [
    "Build shortcuts from a library of app and system actions using a drag-and-drop editor",
    "Run shortcuts from the menu bar, Spotlight, or a keyboard shortcut",
    "Set up automations that trigger on events like a specific time, app launch, or connecting to Wi-Fi",
    "Shortcuts sync via iCloud so the same automation is available on iPhone and iPad too",
  ],
  redirectUrl: "https://support.apple.com/guide/shortcuts-mac/welcome/mac",
  whyItMatters:
    "Shortcuts turns repetitive multi-step tasks, like resizing a batch of images or renaming files by a pattern, into a single click or automatic trigger, saving real time for anyone who does the same manual steps often. Because it replaced Automator as Apple's primary automation tool, it's increasingly where new automation capability appears first. It's also approachable for non-programmers, using a visual block-based editor rather than requiring scripting knowledge.",
  bestPractices: [
    "Start with Apple's built-in shortcut gallery templates before building one from scratch.",
    "Use the 'Quick Actions' integration to run shortcuts directly from the Finder right-click menu.",
    "Name shortcuts clearly since they'll also appear in Spotlight search and Siri.",
    "Test automations on non-critical files first, especially ones that rename or delete files in bulk.",
  ],
  commonIssues: [
    { issue: "A shortcut that worked on iPhone doesn't run the same way on Mac.", fix: "Some actions are iOS-only; check the action list for a 'Not available on Mac' indicator when building cross-platform shortcuts." },
    { issue: "An automation doesn't trigger automatically as expected.", fix: "Confirm the automation is enabled and its trigger conditions (time, app, network) are configured correctly under the Automation tab." },
  ],
  faqs: [
    { q: "Do I need to know how to code?", a: "No, Shortcuts uses a visual editor with pre-built actions, no scripting required." },
    { q: "Can shortcuts run without me opening the app?", a: "Yes, automations can run in the background on a schedule or trigger, with or without confirmation depending on how you configure them." },
  ],
  tipsAndTricks: [
    "Add a shortcut to the menu bar for one-click access without opening the full app.",
  ],
  relatedSettingIds: ["macos-mission-control", "macos-general-apps", "macos-siri-spotlight"],
  afterImageContent: {
    heading: "How Shortcuts Automations Work",
    paragraphs: [
      "Each shortcut is a sequence of actions that pass data from one step to the next, similar to a simple visual script.",
      "Automations differ from shortcuts you run manually in that they can fire based on a trigger without any interaction.",
    ],
    steps: [
      "Open the Shortcuts app from Launchpad or Spotlight",
      "Click the + button to create a new shortcut",
      "Drag actions from the right-hand library into the workflow",
      "Save and run it manually, or add a trigger under the Automation tab",
    ],
  },
},
{
  id: "macos-screenshots-app",
  title: "Screenshots & Screen Recording",
  icon: Image,
  platform: "macos",
  category: "apps-features",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Configure capture shortcuts and save location",
  description:
    "The Screenshot toolbar (opened with Shift-Command-5) controls where captures are saved, whether the pointer is included, a capture timer, and lets you record all or part of the screen as a video.",
  details: [
    "Choose to save captures to the Desktop, Documents, Clipboard, Mail, or Preview",
    "Set a 5 or 10 second timer before capture for menu interactions",
    "Toggle whether floating thumbnails appear after a capture",
    "Record the full screen or a selected portion as a video with or without audio",
  ],
  redirectUrl: "https://support.apple.com/en-us/102646",
  whyItMatters:
    "Screenshots and screen recordings are one of the most frequently used features for support requests, tutorials, and quick sharing, so having the save location and shortcuts set up correctly removes friction from something done many times a day. Changing the default save location from Desktop, for example, keeps a fast-typing user's desktop from filling up with stray screenshot files. The floating thumbnail can also be a helpful quick-edit shortcut, or an unwanted distraction depending on workflow.",
  bestPractices: [
    "Set captures to save directly to the Clipboard if you mostly paste screenshots into chat apps rather than saving files.",
    "Disable the floating thumbnail if you find it distracting during multi-step workflows.",
    "Use the timer option to capture menus or tooltips that disappear when you click.",
  ],
  commonIssues: [
    { issue: "Screenshots pile up on the Desktop.", fix: "Change the save location to a dedicated Screenshots folder from the Options menu in the Screenshot toolbar." },
    { issue: "Screen recordings have no audio.", fix: "Select a microphone under the Options menu before starting the recording; audio isn't captured by default." },
  ],
  faqs: [
    { q: "What shortcut opens the screenshot toolbar?", a: "Shift-Command-5 opens the toolbar with all capture options." },
    { q: "Can I record just one window?", a: "Yes, choose 'Record Selected Portion' or the window capture option from the toolbar." },
  ],
  tipsAndTricks: [
    "Press Control along with a capture shortcut to copy directly to the clipboard instead of saving a file.",
  ],
  relatedSettingIds: ["macos-mission-control", "macos-storage-management", "macos-icloud-drive"],
  afterImageContent: {
    heading: "How the Screenshot Toolbar Works",
    paragraphs: [
      "The toolbar is a lightweight overlay that stays open for quick repeated captures without needing to reopen a menu each time.",
      "Recordings are saved as .mov files using the same destination configured for still screenshots.",
    ],
    steps: [
      "Press Shift-Command-5 to open the Screenshot toolbar",
      "Choose a capture or recording mode from the toolbar buttons",
      "Click Options to set save location, timer, and microphone",
      "Click Capture or Record to begin",
    ],
  },
},
{
  id: "macos-continuity-camera-sidecar",
  title: "Continuity Camera & Sidecar",
  icon: Camera,
  platform: "macos",
  category: "devices-peripherals",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Use your iPhone or iPad as a Mac webcam or display",
  description:
    "Continuity Camera lets your iPhone act as a high-quality webcam or document scanner for your Mac, while Sidecar turns a nearby iPad into a wired or wireless second display or graphics tablet.",
  details: [
    "Automatically use a nearby iPhone as the default webcam in video call apps",
    "Enable Desk View to show an overhead view of your desk during calls",
    "Extend or mirror your Mac's display onto an iPad with Sidecar",
    "Use an Apple Pencil on the iPad as a pressure-sensitive input for Mac apps like Preview or Photoshop",
  ],
  important: "Both features require the devices to be signed into the same Apple ID and have Bluetooth, Wi-Fi, and Handoff enabled.",
  redirectUrl: "https://support.apple.com/en-us/104227",
  whyItMatters:
    "Continuity Camera gives Mac users access to a phone-quality camera sensor without buying a separate webcam, a meaningful upgrade for anyone doing frequent video calls on a laptop with a mediocre built-in camera. Sidecar effectively adds a second, pressure-sensitive display for the cost of an iPad the user may already own, which is valuable for designers and anyone who benefits from extra screen real estate on the go. Both lean on Apple's ecosystem integration to avoid extra cables or third-party software for common creative and communication needs.",
  bestPractices: [
    "Mount the iPhone with a stand or clip made for Continuity Camera for a stable, elevated angle.",
    "Use Sidecar wired via USB-C for the lowest input latency when drawing with Apple Pencil.",
    "Close Sidecar when not needed since it keeps the iPad's screen active and draining battery.",
  ],
  commonIssues: [
    { issue: "The iPhone doesn't appear as a camera option in a video call app.", fix: "Confirm both devices are on the same Apple ID, Wi-Fi and Bluetooth are on, and the iPhone is unlocked and nearby." },
    { issue: "Sidecar shows the iPad as unavailable.", fix: "Check that Handoff is enabled on both devices under General settings and that the iPad supports Sidecar (Apple Pencil-compatible models from recent years)." },
  ],
  faqs: [
    { q: "Does Continuity Camera work wirelessly?", a: "Yes, though a wired USB connection is also supported and offers a more stable connection." },
    { q: "Can I use a non-Apple Pencil with Sidecar?", a: "No, Sidecar's pressure-sensitive input specifically requires an Apple Pencil." },
  ],
  tipsAndTricks: [
    "Use Desk View alongside your normal camera feed during calls to show physical documents or sketches in real time.",
  ],
  relatedSettingIds: ["macos-airdrop-handoff", "macos-displays", "macos-bluetooth"],
  afterImageContent: {
    heading: "How Continuity Camera and Sidecar Work",
    paragraphs: [
      "Continuity Camera streams video from the iPhone's camera app directly into macOS as a virtual webcam, selectable in any app that lists cameras.",
      "Sidecar extends the Mac's display pipeline to the iPad over Wi-Fi or USB, rendering it as an additional connected display.",
    ],
    steps: [
      "Ensure both devices are signed into the same Apple ID with Bluetooth, Wi-Fi, and Handoff on",
      "For Continuity Camera, select your iPhone as the camera source in a video app",
      "For Sidecar, click the Screen Mirroring icon in Control Center and choose your iPad",
      "Adjust display arrangement for Sidecar under System Settings → Displays",
    ],
  },
},
{
  id: "macos-airplay-receiver",
  title: "AirPlay Receiver",
  icon: Cast,
  platform: "macos",
  category: "devices-peripherals",
  controlType: "action",
  heading: "Let other devices stream audio and video to your Mac",
  description:
    "AirPlay Receiver turns your Mac into an AirPlay destination, so an iPhone, iPad, or other Mac can stream its screen or audio directly to your Mac's display and speakers.",
  details: [
    "Choose who can AirPlay to this Mac: Everyone, Everyone on the same network, or Current User",
    "Require a passcode for connections from unknown devices",
    "Toggle whether AirPlaying pauses if the Mac isn't the active window",
  ],
  redirectUrl: "https://support.apple.com/en-us/102000",
  whyItMatters:
    "AirPlay Receiver is especially useful when a Mac has a larger or higher-quality display than the sending device, letting a phone's screen or a presentation be mirrored quickly without cables during meetings or casual sharing at home. Restricting who can connect matters in office or shared environments, since an unsecured receiver could let anyone on the same Wi-Fi network start streaming to your screen unexpectedly. It's a lightweight alternative to a dedicated AirPlay-enabled TV or speaker.",
  bestPractices: [
    "Set access to 'Current User' on a Mac used in a shared space to prevent unwanted connections.",
    "Enable the passcode requirement when using this on a network you don't fully control, like a coworking space.",
    "Turn the receiver off entirely when not in active use to avoid unexpected background connections.",
  ],
  commonIssues: [
    { issue: "A phone can't find the Mac as an AirPlay option.", fix: "Confirm both devices are on the same Wi-Fi network and AirPlay Receiver is turned on under General settings." },
    { issue: "Unexpected AirPlay connection requests appear.", fix: "Tighten the 'Allow AirPlay for' setting to 'Current User' or enable a passcode requirement." },
  ],
  faqs: [
    { q: "Does this work over a different network?", a: "No, both devices generally need to be on the same Wi-Fi network unless using a wired peer-to-peer connection." },
    { q: "Can I stream from a non-Apple device?", a: "No, AirPlay is an Apple protocol, so only Apple devices or apps with AirPlay support can stream to it." },
  ],
  tipsAndTricks: [
    "Use AirPlay Receiver combined with an external display to effectively add a wireless 'second monitor' for a phone or tablet.",
  ],
  relatedSettingIds: ["macos-displays", "macos-wifi", "macos-screen-sharing"],
  afterImageContent: {
    heading: "How AirPlay Receiver Works",
    paragraphs: [
      "Once enabled, the Mac advertises itself on the local network as an AirPlay destination that compatible devices can discover and connect to.",
      "Access restrictions and the optional passcode control who is allowed to initiate a connection.",
    ],
    steps: [
      "Open System Settings → General → AirDrop & Handoff",
      "Turn on AirPlay Receiver",
      "Set 'Allow AirPlay for' to the desired access level",
      "Optionally enable 'Require password' for extra security",
    ],
  },
},
{
  id: "macos-sound-effects-alerts",
  title: "Sound Effects & Alert Volume",
  icon: Volume2,
  platform: "macos",
  category: "display-sound-notifications",
  controlType: "action",
  heading: "Configure the system alert sound and its volume",
  description:
    "Sound Effects settings control which alert sound plays for system notifications and errors, its volume relative to media playback, and whether interface actions like Trash emptying play a sound.",
  details: [
    "Choose from a list of built-in alert sound options",
    "Set alert volume independently from overall media output volume",
    "Toggle sound effects for interface actions like Trash emptying or volume changes",
    "Play user interface feedback sounds for keyboard volume/brightness key presses",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/change-sound-effects-mchlp2246/mac",
  whyItMatters:
    "The system alert sound is one of the most frequently heard sounds on a Mac, so picking one that's noticeable without being jarring genuinely affects daily comfort, especially in office or shared environments. Setting alert volume independently from media volume prevents the common annoyance of a loud notification chime interrupting quiet music listening, or an inaudible alert getting missed while media is loud. Turning off minor interface sounds, like the Trash empty sound, is a common preference for users who find them distracting.",
  bestPractices: [
    "Lower the alert volume slider independently if notification sounds feel jarring compared to your media volume.",
    "Choose a distinct, less common alert sound if you often mistake system notifications for other apps' sounds.",
    "Turn off interface sound effects on a Mac used in quiet shared spaces like a library or open office.",
  ],
  commonIssues: [
    { issue: "Alert sounds are much louder or quieter than expected relative to media.", fix: "Adjust the dedicated alert volume slider, since it's independent from the main output volume." },
    { issue: "No sound plays on notifications at all.", fix: "Check that both the alert sound isn't set to 'None' and that Do Not Disturb / Focus isn't muting alerts." },
  ],
  faqs: [
    { q: "Can I add a custom alert sound?", a: "Yes, custom AIFF sound files placed in the correct Library/Sounds folder appear in the alert sound list." },
    { q: "Does this affect app-specific notification sounds?", a: "No, many apps use their own notification sound separate from the system alert sound." },
  ],
  tipsAndTricks: [
    "Preview each alert sound by clicking it in the list before committing to a choice.",
  ],
  relatedSettingIds: ["macos-sound-output-input", "macos-focus", "macos-sound-notifications"],
  afterImageContent: {
    heading: "How Sound Effects Settings Work",
    paragraphs: [
      "The chosen alert sound plays through your current output device whenever the system needs to get your attention outside of app-specific notification sounds.",
      "Interface sound effects are short, low-volume cues tied to specific actions like emptying the Trash or adjusting volume with keyboard keys.",
    ],
    steps: [
      "Open System Settings → Sound",
      "Select an alert sound from the list under the Sound Effects section",
      "Adjust the alert volume slider to taste",
      "Toggle interface sound effect options as desired",
    ],
  },
},
{
  id: "macos-notification-center-widgets",
  title: "Notification Center Widgets",
  icon: LayoutGrid,
  platform: "macos",
  category: "display-sound-notifications",
  controlType: "action",
  heading: "Customize the widgets shown in Notification Center",
  description:
    "Notification Center's widget gallery lets you add, remove, and resize glanceable widgets for weather, calendar, reminders, and other apps, arranged in a stack you can scroll through.",
  details: [
    "Add widgets from any app that supports them via the widget gallery",
    "Choose small, medium, or large widget sizes where supported",
    "Reorder widgets by dragging them within Notification Center",
    "Some widgets support Smart Stacks that rotate automatically based on relevance",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/use-widgets-mchl52c99a1a/mac",
  whyItMatters:
    "Widgets in Notification Center give a quick-glance summary of information, like the next calendar event or today's weather, without needing to open a full app, which is a small but frequent time saver throughout the day. Because Notification Center is reachable from anywhere via a click or trackpad gesture, well-chosen widgets act like a personal dashboard layered on top of whatever you're currently working on. This is distinct from Desktop widgets, which sit directly on the desktop instead of the side panel.",
  bestPractices: [
    "Keep the widget stack focused on 3-5 genuinely useful widgets rather than adding every available option.",
    "Use Smart Stacks for widgets you check inconsistently throughout the day, letting the system surface the most relevant one.",
    "Resize a frequently checked widget, like Calendar, to a larger size for more detail at a glance.",
  ],
  commonIssues: [
    { issue: "A widget isn't available for a particular app.", fix: "Not every app ships a widget; check the widget gallery to confirm the app supports one, and update the app if it hasn't been updated recently." },
    { issue: "Widgets aren't updating with current information.", fix: "Ensure the source app is allowed background refresh and is signed into the correct account." },
  ],
  faqs: [
    { q: "Can I put the same widgets on my desktop?", a: "Yes, many widgets can also be dragged onto the desktop directly, separate from the Notification Center panel." },
    { q: "Do widgets sync across devices?", a: "Widget presence doesn't sync automatically; each Mac's Notification Center is configured independently." },
  ],
  tipsAndTricks: [
    "Click and hold a widget for quick access to size and configuration options without leaving the panel.",
  ],
  relatedSettingIds: ["macos-desktop-dock", "macos-menu-bar-control-center", "macos-focus"],
  afterImageContent: {
    heading: "How Notification Center Widgets Work",
    paragraphs: [
      "Widgets pull live data from their source app and refresh periodically or when the app has new information to show.",
      "The widget gallery lists every installed app that provides at least one widget, grouped for easy browsing.",
    ],
    steps: [
      "Click the date and time in the menu bar to open Notification Center",
      "Scroll to the bottom of the widgets column and click Edit Widgets",
      "Drag a widget from the gallery into your stack",
      "Choose a size if the widget supports multiple sizes",
    ],
  },
},
{
  id: "macos-login-window-appearance",
  title: "Login Window Appearance & Message",
  icon: LockKeyhole,
  platform: "macos",
  category: "personalization",
  controlType: "action",
  heading: "Customize the pre-login screen background and text",
  description:
    "Login window settings control what appears before anyone signs in, including whether user accounts are listed by name or require typing a username, and an optional custom message.",
  details: [
    "Choose to display a list of users or require typing both name and password",
    "Show or hide the password hint after failed attempts",
    "Set a custom login message, often used for lost-device contact information",
    "Show or hide the Restart, Sleep, and Shut Down buttons at the login screen",
  ],
  important: "Some of these options, like login window text, are managed through Sharing preferences or profiles on managed Macs rather than a single unified page.",
  redirectUrl: "https://support.apple.com/guide/mac-help/change-login-window-settings-mchlp2410/mac",
  whyItMatters:
    "The login window is the very first thing anyone sees when turning on a Mac, so its configuration matters both for security and for practical scenarios like a lost laptop. Requiring name and password entry instead of showing a user list adds a layer of obscurity against casual access attempts. A custom login message with contact information is a small but genuinely useful step for recovering a lost or found device, since a good Samaritan can see how to reach the owner before ever unlocking it.",
  bestPractices: [
    "Set a custom login message with a backup contact method if the Mac travels frequently, like a work laptop.",
    "Switch to 'Name and password' entry instead of a user list on Macs used in public or semi-public settings.",
    "Hide the Restart/Sleep/Shut Down buttons on shared or kiosk-style Macs to reduce accidental interruptions.",
  ],
  commonIssues: [
    { issue: "Can't find where to set a login message.", fix: "Login message options are typically set via Sharing preferences' computer name/message settings or through a configuration profile on managed devices." },
    { issue: "The user list still shows even after switching to name/password entry.", fix: "Confirm the change was applied under Login Options in Users & Groups, and restart the Mac to ensure it takes effect." },
  ],
  faqs: [
    { q: "Can I set a custom background image for the login screen?", a: "The login screen generally uses the current desktop wallpaper on modern macOS versions rather than a separately configurable image." },
    { q: "Is a login message visible before or after entering a password?", a: "It's visible before login, making it useful for reaching the owner of a lost device." },
  ],
  tipsAndTricks: [
    "Keep the login message brief since long text can be hard to read against certain wallpaper backgrounds.",
  ],
  relatedSettingIds: ["macos-lock-screen", "macos-users-groups", "macos-sign-in-password"],
  afterImageContent: {
    heading: "How Login Window Settings Work",
    paragraphs: [
      "These settings apply system-wide before anyone authenticates, distinct from personalization settings that apply only after sign-in.",
      "Some options require administrator privileges to change, since they affect the security posture of the entire machine.",
    ],
    steps: [
      "Open System Settings → Users & Groups",
      "Click Login Options at the bottom of the user list",
      "Choose between displaying a user list or requiring name and password",
      "Set an optional login message if desired",
    ],
  },
},
{
  id: "macos-contacts-calendar-access",
  title: "Contacts & Calendar Access Permissions",
  icon: Users,
  platform: "macos",
  category: "privacy-permissions",
  controlType: "action",
  heading: "Control which apps can read your contacts and calendars",
  description:
    "This privacy page lists every app that has requested access to your Contacts, Calendars, or Reminders, and lets you grant or revoke that access individually per app.",
  details: [
    "See every app currently granted Contacts, Calendars, or Reminders access",
    "Revoke access for any app with a single toggle",
    "New requests trigger a permission prompt the first time an app tries to read this data",
    "Separate lists exist for Contacts, Calendars, and Reminders under Privacy & Security",
  ],
  redirectUrl: "https://support.apple.com/guide/mac-help/control-access-to-contacts-mchl211c911f/mac",
  whyItMatters:
    "Contacts and calendar data are among the most sensitive categories of personal information on a Mac, since they reveal relationships, schedules, and often physical addresses or phone numbers of people who never consented to have an app access their information. Reviewing this list periodically helps catch apps that requested access for a one-time feature but retained it indefinitely. It's especially relevant after removing an app, since access grants can sometimes persist as stale entries until manually cleared.",
  bestPractices: [
    "Revoke access for any app you no longer actively use that appears in this list.",
    "Be cautious granting Contacts access to lesser-known apps, since exported contact data can't be easily 'taken back' once shared.",
    "Review this list after installing a new productivity or social app that requested broad permissions during setup.",
  ],
  commonIssues: [
    { issue: "An app stops syncing contacts after being toggled off here.", fix: "This is expected behavior; re-enable access if the app genuinely needs it for a feature you use." },
    { issue: "A removed app still appears in the list.", fix: "Stale entries sometimes remain until a restart or macOS periodically cleans the list; it can typically be ignored since the app can no longer access anything." },
  ],
  faqs: [
    { q: "Does revoking access delete data the app already has?", a: "No, it only prevents future access; any data the app already synced or stored remains until you delete it within that app." },
    { q: "Will I be asked again if I revoke and the app tries again?", a: "Yes, the app will trigger a new permission prompt the next time it attempts access." },
  ],
  tipsAndTricks: [
    "Check this list right after granting permission to a new app if you're unsure exactly what you agreed to.",
  ],
  relatedSettingIds: ["macos-app-permissions", "macos-camera-mic-privacy", "macos-privacy-security-hub"],
  afterImageContent: {
    heading: "How Contacts & Calendar Permissions Work",
    paragraphs: [
      "macOS enforces per-app, per-category permission checks the first time an app attempts to read Contacts, Calendars, or Reminders data.",
      "Once granted, access persists silently until manually revoked from this settings page.",
    ],
    steps: [
      "Open System Settings → Privacy & Security",
      "Select Contacts, Calendars, or Reminders from the list",
      "Review which apps have access",
      "Toggle off access for any app you want to restrict",
    ],
  },
},
{
  id: "macos-version-build-number",
  title: "macOS Version & Build Number",
  icon: Info,
  platform: "macos",
  category: "system-info",
  controlType: "action",
  heading: "Quickly find your exact macOS version for support calls",
  description:
    "Clicking the macOS version number in About This Mac reveals the exact build number, useful when a support agent, developer, or compatibility check needs more precision than the marketing version name.",
  details: [
    "The main About This Mac panel shows the marketing version, like macOS Sonoma 14.5",
    "Clicking the version number once reveals the build number",
    "Clicking again reveals the full hardware and software UUID",
    "Useful for filing bug reports or checking software compatibility requirements",
  ],
  redirectUrl: "https://support.apple.com/en-us/109033",
  whyItMatters:
    "Many support workflows and compatibility requirements ask for the exact build number rather than just the marketing version name, since two Macs running 'the same' macOS version can be on different build numbers if one hasn't installed the latest point update. This distinction matters most when troubleshooting a bug that was fixed in a specific point release, or when a developer's compatibility notes reference an exact build. It's a small but frequently needed piece of information that isn't obvious unless you know to click through.",
  bestPractices: [
    "Note the build number before contacting support so you don't need to look it up mid-call.",
    "Compare build numbers when troubleshooting an issue that behaves differently on two Macs running what looks like the same OS version.",
    "Keep macOS updated to the latest build within your version to ensure you have the newest security patches.",
  ],
  commonIssues: [
    { issue: "Can't find the build number anywhere obvious.", fix: "It's hidden by design; click directly on the version number text in About This Mac to reveal it." },
    { issue: "Build number doesn't match what a compatibility guide expects.", fix: "Run Software Update to install the latest point release for your macOS version." },
  ],
  faqs: [
    { q: "What does the build number look like?", a: "It's a short alphanumeric code, such as 23F79, distinct from the version number like 14.5." },
    { q: "Do I need this for everyday use?", a: "No, it's mainly useful for support requests, developer compatibility checks, and bug reports." },
  ],
  tipsAndTricks: [
    "Hold Option while clicking the Apple menu to reveal a 'System Information' shortcut with even more detail than About This Mac.",
  ],
  relatedSettingIds: ["macos-about-this-mac", "macos-software-update", "macos-system-report"],
  afterImageContent: {
    heading: "How Version and Build Numbers Work",
    paragraphs: [
      "The marketing version name (like Sonoma) maps to a version number (14.x), which in turn maps to a specific build number for each point release.",
      "Build numbers increment with every update, including minor security patches that don't change the visible version number.",
    ],
    steps: [
      "Click the Apple menu and select About This Mac",
      "Click once on the macOS version number to reveal the build number",
      "Click again to reveal the hardware and software serial identifiers",
    ],
  },
},
{
  id: "macos-legal-regulatory",
  title: "Legal & Regulatory",
  icon: FileText,
  platform: "macos",
  category: "system-info",
  controlType: "action",
  heading: "View software licenses and regulatory certifications",
  description:
    "The Legal & Regulatory page contains the macOS software license agreement, open-source acknowledgments, and regulatory certification marks required for different countries and regions.",
  details: [
    "Read the full macOS Software License Agreement",
    "View acknowledgments for open-source components used in macOS",
    "See regulatory compliance marks (FCC, CE, and others) relevant to your region",
  ],
  redirectUrl: "https://support.apple.com/en-us/102236",
  whyItMatters:
    "While rarely opened casually, this page matters for compliance, legal, and IT documentation purposes, particularly for organizations that need to reference exact license terms or regulatory certifications for procurement and audit requirements. The open-source acknowledgments are also relevant for developers curious about which open-source projects Apple builds into macOS. It's one of the few places where this information is centralized rather than scattered across separate documents.",
  bestPractices: [
    "Reference this page directly when IT or legal teams need official license text rather than searching third-party sources.",
    "Check regulatory marks here if a country-specific compliance question comes up for a fleet of managed Macs.",
  ],
  commonIssues: [
    { issue: "Can't find country-specific regulatory information.", fix: "Regulatory marks are limited to what's applicable to your current region/locale setting; switch region temporarily if you need to check another market's marks." },
  ],
  faqs: [
    { q: "Is this the same agreement I accepted during setup?", a: "Yes, it's the same Software License Agreement presented and accepted during initial macOS setup." },
    { q: "Does this list every open-source library used in macOS?", a: "It lists major open-source acknowledgments, though not necessarily an exhaustive list of every dependency." },
  ],
  tipsAndTricks: [
    "Search within the page (Command-F) if looking for a specific licensing clause rather than reading the entire document.",
  ],
  relatedSettingIds: ["macos-about-this-mac", "macos-system-report", "macos-serial-warranty"],
  afterImageContent: {
    heading: "How Legal & Regulatory Info Is Organized",
    paragraphs: [
      "This page is generated based on your Mac's model and region settings, so the exact regulatory marks shown can vary between devices.",
      "License and acknowledgment text is static per macOS version, updating only when you install a new macOS release.",
    ],
    steps: [
      "Open System Settings → General → Legal & Regulatory",
      "Browse the license agreement, acknowledgments, or regulatory sections",
      "Use Command-F to search for specific terms within the document",
    ],
  },
},
];
