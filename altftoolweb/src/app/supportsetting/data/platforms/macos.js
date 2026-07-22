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
];
