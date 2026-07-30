import {
  RotateCcw,
  Camera,
  Mic,
  Wifi,
  RefreshCw,
  BluetoothIcon,
  Monitor,
  CloudDownload,
  HardDrive,
  Database,
  Power,
  Volume2,
  Bell,
  AppWindow,
  Languages,
  ShieldCheck,
  Users,
  Moon,
  Palette,
  Paintbrush,
  Lock,
  PanelBottom,
  Menu,
  Mouse,
  Keyboard,
  Touchpad,
  PenTool,
  Printer,
  Globe,
  RadioTower,
  Package,
  Puzzle,
  Rocket,
  Accessibility,
  Shield,
  ListChecks,
  Clock,
  ClipboardList,
  Layers,
  ScreenShare,
  CloudUpload,
  LifeBuoy,
  KeyRound,
  Wrench,
  Cpu,
  MonitorCog,
  Type,
  Info,
  Settings,
  Trash2,
  History,
  Share2,
  Gamepad2,
  LockKeyhole,
  Mail,
  UserPlus,
  Briefcase,
  Fingerprint,
  Link,
  CircleUserRound,
  Activity,
  Cable,
  Contrast,
  Ear,
  FlaskConical,
  FolderCog,
  HardDriveDownload,
  ListRestart,
  Map,
  MapPin,
  MessageSquareWarning,
  MonitorSmartphone,
  MousePointer2,
  Pause,
  Plane,
  PlayCircle,
  Route,
  SlidersHorizontal,
  Sparkles,
  SunMedium,
  Terminal,
  TextCursor,
  Timer,
  Usb,
  Video,
  Volume1,
} from "lucide-react";

// Windows Support Settings. The original 14 entries are preserved verbatim
// (content, redirectUrl, images) — only category/platform/frequentlyUsed
// metadata was added so they can be grouped and filtered like every other
// platform's settings. 2 new entries (windows-security, windows-family-safety)
// were added to round out the Privacy and Accounts categories.
export const windowsSettings = [
  {
    id: "windows-update",
    title: "Windows Update",
    icon: CloudDownload,
    platform: "windows",
    category: "system-updates",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Manage Windows Updates",
    description:
      "Windows Update allows you to download and install the latest security patches, feature updates, and performance improvements. Keeping your system updated helps protect against vulnerabilities and ensures optimal performance.",
    details: [
      "Updates include security patches, bug fixes, and new features.",
      "You can pause updates temporarily if needed.",
      "Feature updates may take longer to install than regular updates.",
      "Restart may be required after installing updates.",
    ],
    important:
      "Delaying critical security updates may leave your system vulnerable to threats. Always install important updates as soon as possible.",
    redirectUrl: "ms-settings:windowsupdate",
    whyItMatters:
      "Windows Update is the primary channel Microsoft uses to patch security vulnerabilities before attackers can exploit them, and it also delivers driver fixes and performance improvements that keep your hardware running smoothly. Skipping updates for too long leaves known exploits unpatched and can cause a backlog of large downloads that disrupt your work later. It's the single setting most responsible for whether your PC stays protected against ransomware and zero-day exploits.",
    bestPractices: [
      "Check for updates manually at least once a week rather than waiting for the automatic background check.",
      "Install cumulative security updates within a few days of release instead of pausing them indefinitely.",
      "Restart your PC promptly when prompted so pending updates finish installing correctly.",
      "Use 'Pause updates' only for short periods around important deadlines, not as a permanent setting.",
      "Review the update history periodically to spot failed installs that may need manual troubleshooting.",
    ],
    commonIssues: [
      {
        issue: "An update repeatedly fails to install and rolls back.",
        fix: "Run the built-in Windows Update Troubleshooter (Settings → System → Troubleshoot → Other troubleshooters) or manually download the update from the Microsoft Update Catalog.",
      },
      {
        issue: "Update download appears stuck at a percentage for hours.",
        fix: "Restart the Windows Update service via services.msc, or clear the SoftwareDistribution cache folder and retry.",
      },
      {
        issue: "PC keeps restarting for updates at inconvenient times.",
        fix: "Set active hours in Windows Update → Advanced options so restarts are scheduled outside your working hours.",
      },
      {
        issue: "Feature update won't install due to insufficient disk space.",
        fix: "Free up space with Storage Sense or an external drive before retrying the update.",
      },
    ],
    faqs: [
      {
        q: "Can I permanently stop Windows Update from installing updates?",
        a: "Not permanently through the standard interface — you can pause up to 5 weeks at a time, but Windows will eventually require you to update before pausing again.",
      },
      {
        q: "Why does my PC restart automatically after an update?",
        a: "Some updates require a restart to replace files that are in use by the operating system; Windows schedules this outside your defined active hours whenever possible.",
      },
      {
        q: "Are optional updates safe to install?",
        a: "Optional updates such as driver updates are generally safe, but it's fine to skip preview feature updates unless you specifically want to test upcoming features early.",
      },
    ],
    tipsAndTricks: [
      "Use 'Get the latest updates as soon as they're available' in Advanced options to opt into updates the moment they roll out to your device group.",
      "Let Windows learn your active hours automatically instead of manually configuring a fixed window.",
      "Check Update history to see exactly which KB articles were installed if you need to reference them in a support ticket.",
    ],
    relatedSettingIds: ["windows-security", "windows-reset", "storage-settings"],
    updateFrequency: "Check weekly; installs automatically in the background",
    afterImageContent: {
      heading: "How Windows Update Works",
      paragraphs: [
        "Windows Update automatically checks for new updates in the background.",
        "You can manually check for updates anytime from the Settings panel.",
        "Optional updates such as drivers and preview builds are available under advanced options.",
      ],
      steps: [
        "Open Settings → Windows Update.",
        "Click 'Check for updates'.",
        "Download and install available updates.",
        "Restart your device if prompted.",
      ],
    },
  },
  {
    id: "windows-reset",
    title: "Windows Reset",
    icon: HardDrive,
    platform: "windows",
    category: "troubleshooting-diagnostics",
    controlType: "action",
    heading: "Reset This PC",
    description:
      "Windows Reset allows you to reinstall the operating system while choosing whether to keep your personal files or remove everything. This option is useful when your PC is experiencing serious performance issues, system corruption, or persistent software problems.",
    details: [
      "You can choose between 'Keep my files' or 'Remove everything'.",
      "Reset reinstalls Windows using local files or cloud download.",
      "All installed applications will be removed during the reset.",
      "The process may take 20–60 minutes depending on your system.",
    ],
    important:
      "Although you can choose to keep personal files, all installed applications and custom settings will be removed. Always back up important data before performing a reset.",
    redirectUrl: "ms-settings:recovery",
    whyItMatters:
      "Resetting Windows is often the fastest way to recover from deep system corruption, malware that survives normal removal tools, or a PC that's become unbearably slow after years of software buildup — without needing a USB recovery drive. Because it reinstalls the OS from a recovery image or the cloud, it gives you a clean slate while optionally preserving your personal files. This makes it a powerful last resort before a full reinstall or a costly repair shop visit.",
    bestPractices: [
      "Back up personal files to an external drive or OneDrive before starting, even when using 'Keep my files'.",
      "Note down your installed applications and license keys beforehand, since all apps are removed regardless of which option you choose.",
      "Choose 'Cloud download' when your local recovery image may be corrupted or outdated.",
      "Keep your laptop plugged into power for the entire process to avoid an interrupted reset.",
    ],
    commonIssues: [
      {
        issue: "Reset fails with 'There was a problem resetting your PC'.",
        fix: "Try the alternate reinstall method (switch between Cloud download and Local reinstall) or run the reset from Advanced Startup (Shift+Restart) instead.",
      },
      {
        issue: "The process gets stuck at a percentage for a long time.",
        fix: "Wait at least 1-2 hours before assuming it's frozen; if it truly stalls, force a shutdown and retry using a bootable Windows installation USB.",
      },
      {
        issue: "Cloud download option is unavailable or grayed out.",
        fix: "Confirm you have an active internet connection and at least 4GB of free space, since cloud reset downloads a fresh Windows image.",
      },
    ],
    faqs: [
      {
        q: "Will 'Keep my files' really keep everything I need?",
        a: "It keeps files in your user profile folders like Documents and Pictures, but it removes all installed apps, drivers, and most settings, so back up anything outside those folders separately.",
      },
      {
        q: "How is Reset different from a clean install using installation media?",
        a: "Reset uses a built-in recovery image and requires no external media, but a clean install from USB gives you more control over partitioning and lets you resolve issues Reset can't fix, like a corrupted recovery partition.",
      },
      {
        q: "Do I need my Windows product key after resetting?",
        a: "No, if Windows was already activated on this device, it will reactivate automatically after the reset using its digital license tied to your hardware.",
      },
    ],
    tipsAndTricks: [
      "Access Reset from the login screen (hold Shift while clicking Restart, then Troubleshoot) if you can't get into Windows normally.",
      "Use 'Remove everything' with the 'Clean data' option before selling or donating a PC so files can't be recovered with data-recovery tools.",
      "Check available disk space first — Cloud download needs more free space than Local reinstall.",
    ],
    relatedSettingIds: ["windows-update", "storage-settings", "system-restart"],
    afterImageContent: {
      heading: "Understanding the Reset Process",
      paragraphs: [
        "Resetting your PC reinstalls Windows to fix major system issues without requiring external installation media.",
        "The 'Keep my files' option removes apps and settings but preserves personal documents.",
        "The 'Remove everything' option performs a full wipe, suitable when selling or transferring the device.",
        "You can choose between local reinstall or cloud download depending on your internet availability.",
      ],
      steps: [
        "Open Settings → System → Recovery.",
        "Under 'Reset this PC', click 'Reset PC'.",
        "Choose 'Keep my files' or 'Remove everything'.",
        "Select Local reinstall or Cloud download.",
        "Follow on-screen instructions to complete the reset.",
      ],
    },
  },
  {
    id: "system-restart",
    title: "System Restart",
    icon: RefreshCw,
    platform: "windows",
    category: "troubleshooting-diagnostics",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Restart Your System",
    description:
      "System Restart allows you to safely reboot your PC, clearing temporary files and refreshing all running processes. This can resolve many common issues such as slow performance, unresponsive applications, and minor software glitches.",
    details: [
      "Save all open work before initiating a restart to prevent data loss.",
      "A standard restart typically takes 1–3 minutes depending on your hardware.",
      "Scheduled restarts can be configured through your operating system's power settings.",
      "If your system becomes unresponsive, a hard restart (holding the power button for 10 seconds) should be used as a last resort.",
    ],
    important:
      "Unsaved work will be lost during a system restart. Always save and close all applications before proceeding.",
    redirectUrl: "ms-settings:recovery",
    whyItMatters:
      "A simple restart clears out memory leaks, kills stuck background processes, and lets pending updates or driver changes take effect — often solving problems that look far more serious than they are. Many 'application not responding' and general sluggishness issues disappear after a restart because Windows discards any corrupted in-memory state built up during your session. It's the cheapest, lowest-risk troubleshooting step available before touching more advanced settings.",
    bestPractices: [
      "Save open documents and close apps that don't auto-save before restarting.",
      "Restart weekly even if your PC feels fine, since sleep alone never fully clears memory the way a restart does.",
      "Use Restart instead of Shut Down when troubleshooting, since Shut Down on Windows 11 uses Fast Startup and doesn't fully reset system state.",
      "If the PC is frozen, wait at least 30 seconds before holding the power button to force a restart.",
    ],
    commonIssues: [
      {
        issue: "PC hangs on the 'Restarting' screen for an extended time.",
        fix: "Wait 10-15 minutes for any pending update to finish applying; if it truly freezes, force a hard restart by holding the power button for 10 seconds.",
      },
      {
        issue: "Apps reopen automatically after restart in a way you didn't want.",
        fix: "Turn off 'Automatically save my restartable apps and restart them' in Settings → Accounts → Sign-in options.",
      },
      {
        issue: "System restarts unexpectedly on its own.",
        fix: "Check Windows Update's active hours and Event Viewer's System log for automatic-update or crash-triggered restarts.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Restart and Shut Down then Power On?",
        a: "Restart always performs a full reboot and clears all session state, while Shut Down can use Fast Startup (hibernating the kernel session) on Windows 11 by default, so it doesn't always fully reset things the way a Restart does.",
      },
      {
        q: "Why does Windows sometimes restart without asking me?",
        a: "This usually happens after a scheduled update installs outside your configured active hours, or after a critical system error forces an automatic recovery reboot.",
      },
      {
        q: "Is it bad to restart my PC every day?",
        a: "No, restarting daily is generally healthy for a Windows PC and can prevent the gradual slowdown that comes from long uptimes with many background apps running.",
      },
    ],
    tipsAndTricks: [
      "Hold Shift while clicking Restart from the Start menu to boot directly into Advanced Startup Options instead of a normal restart.",
      "Use 'shutdown /r /t 0' in a Command Prompt or Run dialog for an instant restart without confirmation dialogs.",
      "If a restart hangs repeatedly, boot into Safe Mode via Advanced Startup to isolate whether a startup app or driver is the cause.",
    ],
    relatedSettingIds: ["windows-reset", "power-sleep", "windows-update"],
    afterImageContent: {
      heading: "How Restart Works in Windows",
      paragraphs: [
        "When you restart your PC, Windows closes all running applications, logs out active users, and reinitializes system drivers.",
        "Restarting refreshes memory (RAM) and stops background services that may be causing performance issues.",
        "If updates are pending, Windows may apply them during the restart process.",
      ],
      steps: [
        "Click Start → Power → Restart.",
        "Wait while Windows shuts down and boots back up.",
        "Sign back in and reopen your applications.",
      ],
    },
  },
  {
    id: "camera-permission",
    title: "Camera Permission",
    icon: Camera,
    platform: "windows",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Manage Camera Access",
    description:
      "Camera Permission controls which applications are allowed to access your device's camera. Managing these permissions helps protect your privacy and ensures that only trusted applications can capture video or images.",
    details: [
      "Navigate to Settings → Privacy → Camera to view and manage app permissions.",
      "Toggle individual app access on or off based on your preference.",
      "A camera indicator light will appear whenever an application is actively using the camera.",
      "Revoking camera access from an app does not uninstall it – you can re-enable access at any time.",
    ],
    important:
      "Some video conferencing and communication apps require camera access to function properly. Disabling access may prevent these apps from working.",
    redirectUrl: "ms-settings:privacy-webcam",
    whyItMatters:
      "Camera permission settings are your main defense against apps silently activating your webcam without your knowledge, which matters for anyone doing video calls, remote work, or simply keeping personal spaces private. Because so many apps request camera access during install, most users have no idea how many programs can actually see through their webcam until they review this list. Tightening these permissions closes a real privacy gap without breaking the apps you actually rely on for video calls.",
    bestPractices: [
      "Review the full app list periodically and revoke access for anything you no longer use or don't recognize.",
      "Only allow camera access for apps you've deliberately installed for video calls, streaming, or photography.",
      "Keep the camera privacy indicator light or on-screen notification enabled so you always know when it's active.",
      "Disable camera access for desktop apps you don't trust while still allowing it for browser-based video meetings if needed.",
    ],
    commonIssues: [
      {
        issue: "A video call app can't detect the camera even though permission looks correct.",
        fix: "Check that 'Let desktop apps access your camera' is also enabled, not just the Microsoft Store app toggle, since desktop and Store apps use separate settings.",
      },
      {
        issue: "Camera works in one app but not another.",
        fix: "Close any other app that might already be holding the camera open, since Windows generally allows only one application to access the camera at a time.",
      },
      {
        issue: "Camera permission toggle is missing or grayed out entirely.",
        fix: "Check Group Policy or MDM restrictions if this is a work/school-managed device, since IT policy can override user-level camera settings.",
      },
    ],
    faqs: [
      {
        q: "How do I know if an app is using my camera right now?",
        a: "Look for the small camera icon in the notification area, or check Settings → Privacy & Security → Camera → 'Recent activity' to see which apps have accessed it.",
      },
      {
        q: "Does turning off camera access uninstall the app?",
        a: "No, it only blocks that app from using the camera hardware; the app remains installed and you can re-enable access anytime.",
      },
      {
        q: "Can malware bypass these permission settings?",
        a: "Legitimate protections rely on Windows enforcing these permissions at the OS level, so keeping Windows Security active alongside these settings gives you layered protection against unauthorized camera access.",
      },
    ],
    tipsAndTricks: [
      "Use the physical camera privacy shutter on your laptop, if it has one, as a hardware-level backup to the software toggle.",
      "Check 'Camera access history' under advanced camera settings to audit exactly when and which app last used your webcam.",
      "If a webcam cover isn't available, a small piece of opaque tape works as a zero-cost physical safeguard.",
    ],
    relatedSettingIds: ["microphone-permission", "windows-security", "windows-family-safety"],
    afterImageContent: {
      heading: "Understanding Camera Privacy Settings",
      paragraphs: [
        "Windows allows you to control camera access at both the system and individual app levels. This ensures that only trusted applications can use your device's camera.",
        "You can disable camera access completely for all apps or selectively allow access for specific applications.",
        "If your camera is not working in a video app, checking permission settings is one of the first troubleshooting steps.",
      ],
      steps: [
        "Open Settings → Privacy & Security → Camera.",
        "Turn on 'Camera access' for the device.",
        "Enable 'Let apps access your camera'.",
        "Toggle access on or off for individual apps.",
      ],
    },
  },
  {
    id: "microphone-permission",
    title: "Microphone Permission",
    icon: Mic,
    platform: "windows",
    category: "privacy-permissions",
    controlType: "action",
    heading: "Manage Microphone Access",
    description:
      "Microphone Permission lets you control which applications can use your device's microphone. This is essential for maintaining privacy and preventing unauthorized audio recording by untrusted software.",
    details: [
      "Go to Settings → Privacy → Microphone to review which apps have access.",
      "Disable access for apps you do not recognize or no longer use.",
      "When an app is actively using the microphone, an indicator icon will appear in the system tray.",
      "Voice assistants and dictation features require microphone access to operate.",
    ],
    important:
      "Only allow microphone access to trusted applications. Malicious or unnecessary apps with microphone permission could record audio without your knowledge and compromise your privacy.",
    redirectUrl: "ms-settings:privacy-microphone",
    whyItMatters:
      "Microphone access is one of the most privacy-sensitive permissions on your PC because an app that can record audio can pick up private conversations happening nowhere near your screen. Beyond privacy, misconfigured microphone permissions are a leading cause of 'no one can hear me' complaints during calls, since the wrong app or device may be selected. Getting this right protects both your privacy and your ability to be heard clearly in meetings.",
    bestPractices: [
      "Grant microphone access only to communication and recording apps you actively use.",
      "Periodically check 'Recent activity' under microphone settings to see which apps have actually used it.",
      "Set your correct physical microphone as the default input device, separate from granting app-level permission.",
      "Turn off microphone access for background or rarely used apps that don't need real-time audio.",
    ],
    commonIssues: [
      {
        issue: "Other participants can't hear you in a video call despite the mic looking fine.",
        fix: "Check that the app has microphone permission enabled AND that the correct physical device is selected as the default input in Sound settings, not just a permission toggle.",
      },
      {
        issue: "Microphone volume is too low or picks up excessive background noise.",
        fix: "Open Sound settings → Input device properties and adjust input volume, or enable 'Noise suppression' if your driver supports it.",
      },
      {
        issue: "A desktop app can't access the microphone even though the toggle is on.",
        fix: "Enable 'Let desktop apps access your microphone' separately, since it's a distinct setting from the general Microsoft Store app toggle.",
      },
    ],
    faqs: [
      {
        q: "Can an app record audio in the background without me knowing?",
        a: "Only if you've granted it microphone permission and it's designed to do so covertly; Windows shows an indicator icon whenever any app is actively using the microphone, which is worth checking regularly.",
      },
      {
        q: "Why do voice assistants stop working after a Windows update?",
        a: "Updates occasionally reset privacy toggles or default device selections, so it's worth re-checking microphone permission and default input device after major updates.",
      },
      {
        q: "Does disabling microphone access affect Windows dictation and voice typing?",
        a: "Yes, since dictation and voice typing rely on the same microphone permission; disabling it system-wide will also break these accessibility features.",
      },
    ],
    tipsAndTricks: [
      "Use Win+H to trigger voice typing anywhere text can be entered — it relies on the same permission you're managing here.",
      "Check per-app volume levels in the Volume Mixer if one app's microphone input sounds too quiet compared to others.",
      "Disable 'Let apps use my microphone' entirely and re-enable only for specific apps if you want the tightest possible control.",
    ],
    relatedSettingIds: ["camera-permission", "sound-settings", "windows-security"],
    afterImageContent: {
      heading: "Managing Microphone Access in Windows",
      paragraphs: [
        "Microphone permissions allow you to control which applications can capture audio from your device.",
        "Windows provides separate toggles for desktop apps and Microsoft Store apps.",
        "If your voice is not detected during calls or recordings, checking microphone permissions and input device selection can resolve the issue.",
      ],
      steps: [
        "Go to Settings → Privacy & Security → Microphone.",
        "Enable 'Microphone access' for the device.",
        "Turn on 'Let apps access your microphone'.",
        "Review and manage individual app permissions.",
      ],
    },
  },
  {
    id: "wifi-connection",
    title: "WiFi Connection",
    icon: Wifi,
    platform: "windows",
    category: "connectivity-network",
    frequentlyUsed: true,
    controlType: "action",
    heading: "WiFi Connection Settings",
    description:
      "WiFi Connection settings allow you to view, connect to, and manage wireless networks. You can configure automatic connections, set network priorities, and troubleshoot connectivity issues from this panel.",
    details: [
      "Click the network icon in the system tray to see available WiFi networks.",
      "Select your preferred network and enter the password to connect.",
      "Enable 'Connect automatically' to rejoin trusted networks without manual intervention.",
      "If you experience slow speeds, try moving closer to the router or switching to a 5GHz band if available.",
      "Use the 'Forget network' option to remove saved credentials for networks you no longer use.",
    ],
    important:
      "Public WiFi networks may not be secure. Avoid accessing sensitive information such as banking or personal accounts on unsecured networks.",
    redirectUrl: "ms-settings:network-wifi",
    whyItMatters:
      "Your WiFi connection is the foundation for nearly everything you do online, so a poorly configured network profile can quietly expose your PC to other devices on the same network or cause frustrating drops and slowdowns. Setting network profiles correctly (Public vs Private) controls whether your PC is discoverable by others sharing the same WiFi, which matters a lot on shared or public networks like cafes and airports. Getting reconnection and priority settings right also saves you from manually reconnecting every time you're back in range of a known network.",
    bestPractices: [
      "Set unfamiliar or public networks to 'Public' so your PC isn't discoverable and file sharing stays off.",
      "Set home and work networks to 'Private' so you can use printer sharing and other local network features.",
      "Forget old or unused saved networks periodically to reduce the risk of automatically joining a spoofed network with the same name.",
      "Avoid logging into sensitive accounts over open public WiFi without a VPN.",
    ],
    commonIssues: [
      {
        issue: "PC repeatedly disconnects from WiFi or drops to a weaker signal.",
        fix: "Update the wireless adapter driver from Device Manager, or disable the power-saving setting for the WiFi adapter under adapter properties → Power Management.",
      },
      {
        issue: "'Connect automatically' isn't working for a trusted network.",
        fix: "Forget the network and reconnect while checking the 'Connect automatically' box, since a corrupted saved profile can silently ignore the setting.",
      },
      {
        issue: "WiFi shows connected but there's no actual internet access.",
        fix: "Run the Network Troubleshooter or renew your IP with 'ipconfig /release' followed by 'ipconfig /renew' in Command Prompt.",
      },
    ],
    faqs: [
      {
        q: "Why does my WiFi work on some devices but not this PC?",
        a: "This usually points to a driver, IP configuration, or DNS issue local to this device rather than a router problem, since other devices connecting fine rules out the router itself.",
      },
      {
        q: "Should I choose Public or Private network for my home WiFi?",
        a: "Choose Private for your home network so you can access shared printers and files, and reserve Public for networks you don't fully trust, like coffee shops or hotels.",
      },
      {
        q: "Why is my 5GHz network not showing up in the WiFi list?",
        a: "Your router may have 5GHz disabled, or your PC's adapter may only support 2.4GHz — check your router's band settings and your network adapter's specifications.",
      },
    ],
    tipsAndTricks: [
      'Use \'netsh wlan show profile name="NetworkName" key=clear\' in Command Prompt to view a saved WiFi password without opening network properties.',
      "Prioritize a specific network when multiple saved networks are in range by adjusting profile order with 'netsh wlan set profileorder'.",
      "Switch to the 5GHz band manually if your router broadcasts both bands and you're getting interference on 2.4GHz.",
    ],
    relatedSettingIds: ["network-reset", "bluetooth-settings", "windows-security"],
    afterImageContent: {
      heading: "How WiFi Settings Work",
      paragraphs: [
        "WiFi settings allow you to connect to available wireless networks and manage saved connections.",
        "Windows automatically reconnects to trusted networks when 'Connect automatically' is enabled.",
        "Advanced settings allow you to configure IP address, DNS server, and network profile (Public or Private).",
      ],
      steps: [
        "Click the network icon in the taskbar.",
        "Select an available WiFi network.",
        "Enter the network password.",
        "Choose 'Connect automatically' if desired.",
      ],
    },
  },
  {
    id: "network-reset",
    title: "Network Reset",
    icon: RotateCcw,
    platform: "windows",
    category: "troubleshooting-diagnostics",
    controlType: "action",
    heading: "Reset Network Configuration",
    description:
      "Network Reset restores all networking components to their factory default settings. This includes removing all saved WiFi networks, resetting TCP/IP stack, and clearing DNS cache. Use this as a troubleshooting step when other network fixes have not resolved your issue.",
    details: [
      "Go to Settings → Network & Internet → Advanced network settings → Network reset.",
      "Click 'Reset now' and confirm the action. Your PC will restart automatically.",
      "After the reset, you will need to re-enter WiFi passwords and reconfigure VPN connections.",
      "This process removes all network adapters and resets networking components to default.",
    ],
    important:
      "A network reset will remove all saved WiFi passwords and VPN configurations. Make sure you have this information available before proceeding.",
    redirectUrl: "ms-settings:network-reset",
    whyItMatters:
      "Network Reset exists specifically for the frustrating cases where regular troubleshooting — restarting the router, forgetting a network, updating drivers — simply doesn't fix a broken connection. By reinstalling every network adapter and wiping the TCP/IP stack, it clears out corrupted configurations that build up over time from VPNs, malware, or conflicting network software. It's a nuclear option, but often the fastest way to recover a PC that's stopped connecting to any network at all.",
    bestPractices: [
      "Try smaller fixes first, like restarting the router or running the Network Troubleshooter, before resorting to a full reset.",
      "Write down or export your VPN configuration and WiFi passwords before resetting, since all of them will be removed.",
      "Only perform a reset when normal connectivity troubleshooting has genuinely failed.",
      "Reinstall or reconfigure any third-party VPN or firewall software after the reset, since their virtual adapters get removed too.",
    ],
    commonIssues: [
      {
        issue: "VPN client stops working correctly after a network reset.",
        fix: "Reinstall the VPN client software so it can recreate its virtual network adapter, which the reset removes along with everything else.",
      },
      {
        issue: "Ethernet or WiFi adapter disappears from Device Manager after resetting.",
        fix: "Restart the PC again and, if the adapter still doesn't reappear, reinstall the adapter driver manually from the manufacturer's website.",
      },
      {
        issue: "Network reset doesn't fix the original connectivity problem.",
        fix: "The issue may be hardware-related (router, cable, or physical adapter failure) rather than software, so test with a different device on the same network to isolate the cause.",
      },
    ],
    faqs: [
      {
        q: "Will a network reset delete my files or installed apps?",
        a: "No, it only affects network adapters and configuration — saved WiFi passwords, VPN profiles, and network settings are removed, but your files and applications are untouched.",
      },
      {
        q: "How is Network Reset different from Windows Reset?",
        a: "Network Reset only reinstalls networking components and clears network configuration, while Windows Reset reinstalls the entire operating system and affects all installed apps.",
      },
      {
        q: "Do I need to reinstall my network adapter driver after resetting?",
        a: "Usually not — Windows automatically reinstalls the built-in driver for detected adapters, but manufacturer-specific drivers with extra features may need manual reinstallation.",
      },
    ],
    tipsAndTricks: [
      "Run 'ipconfig /flushdns' and 'netsh winsock reset' individually first — they fix many of the same issues with far less disruption than a full network reset.",
      "Note your router's WiFi password on your phone beforehand so you're not locked out of reconnecting after the reset and restart.",
      "Check Device Manager immediately after the restart to confirm all expected network adapters reappeared correctly.",
    ],
    relatedSettingIds: ["wifi-connection", "bluetooth-settings", "windows-security"],
    afterImageContent: {
      heading: "What Happens During a Network Reset",
      paragraphs: [
        "A network reset removes and reinstalls all network adapters on your device.",
        "All saved WiFi networks, VPN configurations, and custom network settings will be deleted.",
        "This is a powerful troubleshooting step when experiencing persistent connectivity problems.",
      ],
      steps: [
        "Open Settings → Network & Internet.",
        "Select Advanced network settings.",
        "Click 'Network reset'.",
        "Confirm by selecting 'Reset now' and restart your PC.",
      ],
    },
  },
  {
    id: "bluetooth-settings",
    title: "Bluetooth Settings",
    icon: BluetoothIcon,
    platform: "windows",
    category: "connectivity-network",
    controlType: "action",
    heading: "Manage Bluetooth Devices",
    description:
      "Bluetooth settings allow you to connect wireless devices such as headphones, keyboards, mice, and smartphones to your PC. You can pair, remove, and manage connected devices easily.",
    details: [
      "Bluetooth must be turned on before pairing devices.",
      "Paired devices reconnect automatically when in range.",
      "You can remove devices that you no longer use.",
      "Troubleshooting options are available if pairing fails.",
    ],
    important:
      "Ensure Bluetooth is enabled on both your PC and the device you are trying to connect. Keep devices within range during pairing.",
    redirectUrl: "ms-settings:bluetooth",
    whyItMatters:
      "Bluetooth settings control every wireless accessory experience on your PC, from a mouse and keyboard to headphones and phone-to-PC file sharing, so a misconfigured pairing can mean lag, dropouts, or a device that just won't connect. Because Bluetooth devices can also be a subtle attack surface if left discoverable, keeping this panel tidy is both a convenience and a light security measure. Removing old, unused device pairings also prevents accidental reconnections to devices you no longer own.",
    bestPractices: [
      "Remove paired devices you no longer use to keep the device list clean and avoid accidental reconnections.",
      "Keep devices within about 30 feet during initial pairing, since range issues are a common cause of failed pairing.",
      "Turn Bluetooth off when not in use on laptops to save battery, especially during travel.",
      "Update Bluetooth drivers from Device Manager if a specific device keeps disconnecting.",
    ],
    commonIssues: [
      {
        issue: "A device won't pair no matter how many times you try.",
        fix: "Remove the device from both your PC and the device itself, restart Bluetooth on the PC, and put the accessory back into pairing mode before retrying.",
      },
      {
        issue: "Paired headphones or speakers keep disconnecting randomly.",
        fix: "Update the Bluetooth adapter driver, and check for interference from other 2.4GHz devices like WiFi routers or microwaves.",
      },
      {
        issue: "Audio through Bluetooth headphones lags behind video.",
        fix: "Switch the headphones to a dedicated media/A2DP profile if supported, since some dual-role profiles introduce noticeable audio delay.",
      },
    ],
    faqs: [
      {
        q: "Why does my PC show a Bluetooth device as connected but I can't hear audio through it?",
        a: "Windows may still be routing audio to a different output device — check Sound settings and manually select the Bluetooth device as your default playback device.",
      },
      {
        q: "Can I use Bluetooth to transfer files between my phone and PC?",
        a: "Yes, once paired, you can use the 'Send or receive files via Bluetooth' option in Bluetooth & devices settings to transfer files directly between devices.",
      },
      {
        q: "Is it safe to leave Bluetooth on all the time?",
        a: "Generally yes for everyday use, though turning it off when not needed reduces the minimal discoverability risk and helps conserve battery on laptops.",
      },
    ],
    tipsAndTricks: [
      "Use the Bluetooth icon in Quick Settings (Win+A) to toggle it on or off instantly without opening the full Settings app.",
      "Check 'More Bluetooth options' → COM Ports tab if you need serial communication with older Bluetooth hardware like some GPS devices.",
      "Rename a paired device in its device properties to something recognizable if you own multiples of the same accessory model.",
    ],
    relatedSettingIds: ["wifi-connection", "sound-settings", "network-reset"],
    afterImageContent: {
      heading: "Pairing a Bluetooth Device",
      paragraphs: [
        "Bluetooth allows secure short-range wireless communication between devices.",
        "Once paired, devices reconnect automatically when Bluetooth is enabled.",
        "If connection issues occur, removing and re-pairing the device often resolves the problem.",
      ],
      steps: [
        "Open Settings → Bluetooth & devices.",
        "Turn on Bluetooth.",
        "Click 'Add device'.",
        "Select your device from the list and complete pairing.",
      ],
    },
  },
  {
    id: "display-settings",
    title: "Display Settings",
    icon: Monitor,
    platform: "windows",
    category: "display-sound-notifications",
    controlType: "action",
    heading: "Adjust Display Settings",
    description:
      "Display settings allow you to adjust screen resolution, brightness, scaling, and multiple monitor configurations. Proper display configuration improves visual clarity and productivity.",
    details: [
      "Change resolution to match your monitor's recommended settings.",
      "Adjust brightness to reduce eye strain.",
      "Use scaling to make text and apps larger.",
      "Configure multiple displays for extended or duplicate mode.",
    ],
    important:
      "Using unsupported resolutions may result in display distortion. Always use recommended settings for best performance.",
    redirectUrl: "ms-settings:display",
    whyItMatters:
      "Display settings determine whether text and images look crisp or blurry, and getting resolution and scaling right directly affects eye strain during long work sessions. For anyone using multiple monitors, correct display arrangement also determines whether your mouse and windows move logically between screens instead of behaving unpredictably. Since many laptops and monitors default to non-ideal settings out of the box, a few minutes here noticeably improves daily comfort and productivity.",
    bestPractices: [
      "Always use your monitor's native resolution, listed as 'Recommended' in the resolution dropdown, for the sharpest image.",
      "Set scaling to 100-150% depending on screen size and distance rather than leaving text uncomfortably small or overly large.",
      "Arrange multiple monitors in Settings to match their actual physical left-right position for natural cursor movement.",
      "Set your primary monitor explicitly if the taskbar or Start menu opens on the wrong screen.",
    ],
    commonIssues: [
      {
        issue: "Text and icons look blurry on a high-resolution monitor.",
        fix: "Increase the scaling percentage under Settings → Display → Scale, since running a 4K display at 100% scale makes elements too small and often blurry when apps aren't DPI-aware.",
      },
      {
        issue: "External monitor isn't detected at all.",
        fix: "Click 'Detect' under Display settings, try a different video cable/port, and confirm the monitor's input source matches the connected port.",
      },
      {
        issue: "Cursor jumps to the wrong monitor when moving between screens.",
        fix: "Rearrange the monitor thumbnails in Display settings to reflect their true physical layout on your desk.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between resolution and scaling?",
        a: "Resolution controls the actual pixel grid the display renders, while scaling adjusts how large text and UI elements appear without changing the underlying resolution — high-res screens typically need higher scaling to stay readable.",
      },
      {
        q: "Why does my external monitor show a black screen when connected?",
        a: "This usually means Windows hasn't detected a new display or the input source on the monitor doesn't match the connected cable; try Win+P to cycle projection modes or click 'Detect'.",
      },
      {
        q: "Can I use different scaling on each of my monitors?",
        a: "Yes, Windows lets you set scaling independently per monitor under Settings → System → Display by selecting each display and adjusting its own scale value.",
      },
    ],
    tipsAndTricks: [
      "Press Win+P for a quick menu to switch between PC screen only, duplicate, extend, and second screen only modes.",
      "Use Win+Shift+Left/Right Arrow to instantly move an active window to an adjacent monitor.",
      "Enable HDR under Display settings if both your monitor and content support it for noticeably better contrast and color.",
    ],
    relatedSettingIds: ["sound-settings", "power-sleep", "notifications-settings"],
    afterImageContent: {
      heading: "Customizing Your Display",
      paragraphs: [
        "Windows automatically detects connected monitors and applies recommended settings.",
        "You can rearrange multiple displays to match your physical setup.",
        "Advanced display options allow you to adjust refresh rate and color settings.",
      ],
      steps: [
        "Open Settings → System → Display.",
        "Select the display you want to adjust.",
        "Modify resolution, scaling, or orientation.",
        "Click 'Apply' to confirm changes.",
      ],
    },
  },
  {
    id: "storage-settings",
    title: "Storage Settings",
    icon: Database,
    platform: "windows",
    category: "storage-backup-data",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Manage Storage & Disk Space",
    description:
      "Storage Settings let you view how much disk space is being used by apps, system files, temporary files, and media. You can free up space automatically using Storage Sense or manually remove unwanted files.",
    details: [
      "View a breakdown of storage usage by category (apps, system, media, temp files).",
      "Enable Storage Sense to automatically delete temporary files and empty the Recycle Bin.",
      "Move new content to a different drive to save space on your main disk.",
      "Uninstall unused apps directly from the storage overview.",
    ],
    important:
      "Deleting files through Storage Sense is permanent once removed from the Recycle Bin. Review what will be cleared before enabling automatic cleanup.",
    redirectUrl: "ms-settings:storagesense",
    whyItMatters:
      "Running low on disk space slows down Windows, can block critical updates from installing, and eventually prevents you from saving new files entirely, so keeping tabs on storage is essential upkeep rather than a one-time task. Storage Sense automates the tedious work of clearing temp files and emptying the Recycle Bin, which most users never do manually. Understanding what's actually consuming your space also helps you decide whether you need a bigger drive or simply need to clean up neglected downloads and duplicate media.",
    bestPractices: [
      "Enable Storage Sense and set it to run automatically rather than relying on manual cleanup.",
      "Review 'Cleanup recommendations' periodically to catch large unused files and old Windows installation backups.",
      "Move large media libraries like Photos, Videos, or Music to a secondary drive if your main drive is filling up.",
      "Uninstall apps you haven't used in months directly from the storage breakdown view instead of hunting through the general app list.",
    ],
    commonIssues: [
      {
        issue: "'Windows.old' folder is taking up tens of gigabytes after an update.",
        fix: "Use 'Cleanup recommendations' under Storage settings or Disk Cleanup's 'Clean up system files' option to remove it once you're confident you don't need to roll back.",
      },
      {
        issue: "Storage Sense doesn't seem to free up as much space as expected.",
        fix: "Check its configured schedule and thresholds under Storage Sense settings — by default it may only run monthly and leave recent downloads untouched.",
      },
      {
        issue: "Drive shows nearly full but the visible file sizes don't add up.",
        fix: "Check for hidden system files, System Restore points, or hibernation files (hiberfil.sys) using Disk Cleanup's system file cleanup option.",
      },
    ],
    faqs: [
      {
        q: "Is it safe to let Storage Sense delete files automatically?",
        a: "Yes for its default targets like temporary files and old Recycle Bin contents, but review its Downloads folder cleanup setting carefully, since by default it can delete old downloads you might still want.",
      },
      {
        q: "How do I see what's using the most space on my drive?",
        a: "Open Settings → System → Storage and click your main drive to see a categorized breakdown by apps, system files, temporary files, and media.",
      },
      {
        q: "Can I change where new apps and files are saved by default?",
        a: "Yes, under Storage → Advanced storage settings → Where new content is saved, you can redirect apps, documents, music, and more to a different drive.",
      },
    ],
    tipsAndTricks: [
      "Use 'Cleanup recommendations' to find and remove large files you forgot about, sorted by how much space they'll free up.",
      "Configure Storage Sense to delete files in Downloads after a set number of days if you tend to forget about old downloads.",
      "Check 'Temporary files' under the storage breakdown for a safe one-click way to clear caches without affecting personal data.",
    ],
    relatedSettingIds: ["windows-update", "windows-reset", "power-sleep"],
    updateFrequency: "Review monthly; Storage Sense runs automatically on its own schedule",
    afterImageContent: {
      heading: "How Storage Management Works",
      paragraphs: [
        "Windows scans your drives and categorizes used space so you can quickly see what's taking up the most room.",
        "Storage Sense runs automatically in the background based on the schedule you set, freeing up space without manual effort.",
        "You can also change the default save location for new apps, documents, music, pictures, and videos.",
      ],
      steps: [
        "Open Settings → System → Storage.",
        "Review the storage breakdown for your main drive.",
        "Turn on Storage Sense and configure its schedule.",
        "Click 'Cleanup recommendations' to remove unnecessary files.",
      ],
    },
  },
  {
    id: "power-sleep",
    title: "Power & Sleep",
    icon: Power,
    platform: "windows",
    category: "system-updates",
    recommended: true,
    controlType: "action",
    heading: "Manage Power & Sleep Settings",
    description:
      "Power & Sleep settings let you control when your screen turns off and when your device goes to sleep while idle. Adjusting these settings can help balance battery life and performance.",
    details: [
      "Set separate timers for screen off and sleep, on battery and when plugged in.",
      "Shorter sleep timers help save battery on laptops.",
      "You can disable sleep entirely for tasks that require the PC to stay awake.",
      "Additional power plans are available under 'Additional power settings'.",
    ],
    important:
      "Disabling sleep for long periods while on battery can drain your device faster and generate more heat.",
    redirectUrl: "ms-settings:powersleep",
    whyItMatters:
      "Power & Sleep settings are the main lever for balancing battery life against convenience on a laptop, and misconfigured timers are one of the most common reasons people find their laptop dead in a bag or, conversely, needlessly draining battery while idle on a desk. For desktops, these settings matter less for battery but still affect how quickly the monitor turns off and whether background tasks like downloads or backups get interrupted by sleep. Getting the balance right avoids both premature battery drain and constant re-login annoyance.",
    bestPractices: [
      "Set a shorter sleep timer on battery power (5-10 minutes) than when plugged in to conserve battery life.",
      "Disable sleep temporarily only for specific tasks like large downloads or backups rather than leaving it off permanently.",
      "Use 'Additional power settings' to fine-tune advanced options like hard disk sleep timing and USB selective suspend.",
      "Match your screen-off timer to a shorter duration than your sleep timer so the display doesn't stay lit needlessly before the system sleeps.",
    ],
    commonIssues: [
      {
        issue: "Laptop won't sleep even after the configured idle timer passes.",
        fix: "Check for background apps or an open video call preventing sleep, or run 'powercfg /requests' in an elevated Command Prompt to see what's keeping the system awake.",
      },
      {
        issue: "PC wakes up unexpectedly from sleep.",
        fix: "Disable 'Allow this device to wake the computer' for mice, keyboards, or network adapters in Device Manager, or check 'powercfg /lastwake' to identify the cause.",
      },
      {
        issue: "Laptop battery drains significantly even while asleep.",
        fix: "Check if Modern Standby is enabled via 'powercfg /a' — some hardware configurations keep components partially active during Modern Standby, draining battery faster than traditional sleep.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Sleep and Hibernate?",
        a: "Sleep keeps your session in RAM using minimal power for a fast wake-up, while Hibernate saves the session to disk and powers off completely, using no battery but taking slightly longer to resume.",
      },
      {
        q: "Why does my laptop feel warm inside my bag even though I closed the lid?",
        a: "This usually means it didn't actually go to sleep — check your lid-close action under 'Additional power settings' → 'Choose what closing the lid does' to confirm it's set to Sleep.",
      },
      {
        q: "Will changing sleep settings affect scheduled tasks like backups?",
        a: "Yes, if your PC sleeps mid-backup the task will pause; consider using wake timers in Additional power settings or scheduling backups during hours you know the PC will be active.",
      },
    ],
    tipsAndTricks: [
      "Run 'powercfg /energy' in an elevated Command Prompt to generate a report identifying what's draining battery or preventing efficient sleep.",
      "Use 'powercfg /lastwake' to diagnose exactly what woke your PC from sleep the last time it happened.",
      "Create a custom power plan for specific scenarios, like a presentation-mode plan that disables sleep and screen timeout entirely.",
    ],
    relatedSettingIds: ["display-settings", "windows-update", "system-restart"],
    afterImageContent: {
      heading: "How Power & Sleep Settings Work",
      paragraphs: [
        "Windows uses separate timers for turning off the screen and putting the whole system to sleep.",
        "These timers can be configured differently depending on whether the device is plugged in or running on battery.",
        "Advanced power settings allow finer control, including hibernate and hybrid sleep options.",
      ],
      steps: [
        "Open Settings → System → Power & battery.",
        "Select 'Screen and sleep'.",
        "Adjust the timers for screen off and sleep.",
        "Click 'Additional power settings' for advanced options.",
      ],
    },
  },
  {
    id: "sound-settings",
    title: "Sound Settings",
    icon: Volume2,
    platform: "windows",
    category: "display-sound-notifications",
    controlType: "action",
    heading: "Manage Sound & Audio Devices",
    description:
      "Sound Settings allow you to select input and output devices, adjust volume levels per app, and troubleshoot audio issues such as no sound or distorted playback.",
    details: [
      "Choose your default output (speakers/headphones) and input (microphone) devices.",
      "Use the volume mixer to adjust levels independently for each app.",
      "Test your speakers and microphone directly from this panel.",
      "Enable spatial sound for a more immersive audio experience if supported.",
    ],
    important:
      "If sound stops working after a Windows update, check that the correct output device is selected before reinstalling audio drivers.",
    redirectUrl: "ms-settings:sound",
    whyItMatters:
      "Sound settings determine which device is actually listening or speaking during your calls, and picking the wrong input or output device is one of the most common reasons people get told 'we can't hear you' in a meeting. Beyond calls, the per-app volume mixer lets you keep notification dings quiet while your music or video stays at a comfortable level, which is a small but daily quality-of-life improvement. Because Windows sometimes switches default devices automatically when you plug something in, checking this panel is a frequent first troubleshooting step for audio problems.",
    bestPractices: [
      "Set your preferred speakers/headphones and microphone explicitly rather than relying on Windows to auto-select the right device.",
      "Use the Volume Mixer to lower notification and system sound volume relative to media and call apps.",
      "Test your microphone and speakers directly in Sound settings before joining an important call.",
      "Enable spatial sound only if your headphones or speakers actually support it, since forcing it on unsupported hardware can distort audio.",
    ],
    commonIssues: [
      {
        issue: "No sound plays through speakers or headphones after plugging in new hardware.",
        fix: "Check that the new device wasn't automatically set as default output when you didn't want it to be, and manually reselect the correct output device in Sound settings.",
      },
      {
        issue: "Audio crackles, pops, or stutters intermittently.",
        fix: "Update or roll back the audio driver in Device Manager, and disable audio enhancements under the device's advanced properties, since enhancement processing is a frequent cause of crackling.",
      },
      {
        issue: "One app is much louder or quieter than everything else.",
        fix: "Open the Volume Mixer (right-click the speaker icon → Open Volume Mixer) and adjust that app's slider independently of the master volume.",
      },
    ],
    faqs: [
      {
        q: "Why did my sound suddenly stop working after a Windows update?",
        a: "Updates occasionally reset the default output device or reinstall audio drivers, so check Sound settings first, then run the built-in audio troubleshooter if the correct device is already selected.",
      },
      {
        q: "What is spatial sound and should I turn it on?",
        a: "Spatial sound simulates directional, 3D-like audio for compatible headphones and speakers; it's worth enabling for gaming or movies if your hardware supports formats like Dolby Atmos, but it can sound worse on basic stereo hardware.",
      },
      {
        q: "Can I have different volume levels for different apps at the same time?",
        a: "Yes, the Volume Mixer lets you set an independent volume for each running app so, for example, you can keep music quiet while a video call stays at full volume.",
      },
    ],
    tipsAndTricks: [
      "Right-click the speaker icon in the taskbar for a quick device switcher instead of opening full Settings.",
      "Use 'Listen to this device' in microphone properties to monitor your mic input live through your speakers for testing.",
      "Assign specific apps to specific audio devices via 'App volume and device preferences' if you want calls routed to headphones while music plays through speakers.",
    ],
    relatedSettingIds: ["microphone-permission", "bluetooth-settings", "notifications-settings"],
    afterImageContent: {
      heading: "Understanding Sound Settings",
      paragraphs: [
        "Windows lets you manage multiple audio devices and switch between them quickly from the taskbar or Settings.",
        "The volume mixer gives you granular control over how loud each individual app is, independent of the master volume.",
        "Audio troubleshooting tools can automatically detect and fix common playback or recording issues.",
      ],
      steps: [
        "Open Settings → System → Sound.",
        "Select your output and input devices.",
        "Adjust the volume mixer for individual apps.",
        "Run 'Troubleshoot common sound problems' if issues persist.",
      ],
    },
  },
  {
    id: "notifications-settings",
    title: "Notifications",
    icon: Bell,
    platform: "windows",
    category: "display-sound-notifications",
    controlType: "action",
    heading: "Manage Notifications & Alerts",
    description:
      "Notification settings let you control which apps can send alerts, how they appear, and when Do Not Disturb (Focus Assist) is active to reduce interruptions.",
    details: [
      "Turn notifications on or off globally or per individual app.",
      "Enable Focus Assist to silence notifications during specific hours or activities.",
      "Customize whether notifications show previews or banners on the lock screen.",
      "Priority apps can be set to always notify you, even during Focus Assist.",
    ],
    important:
      "Disabling notifications for security or system apps may cause you to miss important alerts, such as low battery or update warnings.",
    redirectUrl: "ms-settings:notifications",
    whyItMatters:
      "Notification settings determine how often your workflow gets interrupted, and left unmanaged, they can bury genuinely important alerts — like a security warning or low battery notice — under a flood of app promotions and casual pings. Focus Assist gives you a way to silence non-critical interruptions during deep work or presentations without losing important alerts entirely, since priority apps can still get through. Tuning this once saves you from either notification fatigue or missing something you actually needed to see.",
    bestPractices: [
      "Disable notifications individually for apps that send frequent, low-value alerts rather than turning off notifications system-wide.",
      "Set up Focus Assist automatic rules for specific times, like working hours, or activities, like duplicating your display for presentations.",
      "Keep notifications enabled for Windows Security and Windows Update so you don't miss critical system alerts.",
      "Turn off lock screen previews for sensitive apps like messaging or email to prevent private content from showing when your screen is locked.",
    ],
    commonIssues: [
      {
        issue: "Important alerts get silenced during a presentation or game without you realizing.",
        fix: "Add exceptions in Focus Assist's priority list for apps you always want to hear from, such as calendar reminders or messaging apps.",
      },
      {
        issue: "Too many notification banners pop up and disrupt your work.",
        fix: "Turn off notifications for individual noisy apps in Settings → Notifications instead of disabling everything, keeping only the alerts you actually care about.",
      },
      {
        issue: "Notifications stop appearing entirely after enabling Focus Assist.",
        fix: "Check whether Focus Assist is stuck on 'Alarms only' or 'Priority only' and adjust it back to 'Off' or reconfigure your priority list.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Focus Assist and simply turning off notifications?",
        a: "Focus Assist silences notifications only during the conditions you set, like specific hours or full-screen apps, while still logging them for later, whereas disabling notifications for an app blocks them entirely, all the time.",
      },
      {
        q: "Why do I miss notifications that I know were sent?",
        a: "Check the Notification Center (click the date/time in the taskbar) since missed notifications are stored there, and also confirm the sending app hasn't been silenced by a Focus Assist rule.",
      },
      {
        q: "Can I stop notification previews from showing on the lock screen?",
        a: "Yes, under Notifications settings you can turn off 'Show notifications on the lock screen' or manage it per app to prevent sensitive content from appearing before you unlock your PC.",
      },
    ],
    tipsAndTricks: [
      "Click the date and time in the taskbar to open Notification Center and review anything you dismissed too quickly.",
      "Set Focus Assist to activate automatically 'When playing a game' so notifications never interrupt full-screen gameplay.",
      "Use automatic rules to enable Focus Assist during duplicate/mirrored display mode so presentations never get interrupted by a popup.",
    ],
    relatedSettingIds: ["sound-settings", "display-settings", "windows-security"],
    afterImageContent: {
      heading: "How Notifications Work in Windows",
      paragraphs: [
        "Windows lets you manage notification behavior at both the system level and per individual app.",
        "Focus Assist automatically limits notifications during set hours, full-screen apps, or gaming sessions.",
        "You can review missed notifications anytime from the Notification Center.",
      ],
      steps: [
        "Open Settings → System → Notifications.",
        "Toggle notifications on or off for specific apps.",
        "Set up Focus Assist automatic rules.",
        "Customize banner and lock screen notification behavior.",
      ],
    },
  },
  {
    id: "default-apps",
    title: "Default Apps",
    icon: AppWindow,
    platform: "windows",
    category: "system-updates",
    controlType: "action",
    heading: "Manage Default Apps",
    description:
      "Default Apps settings let you choose which application opens specific file types and links by default, such as your browser, email client, photo viewer, or music player.",
    details: [
      "Set a default web browser, email client, and media player.",
      "Assign default apps for specific file extensions (e.g. .pdf, .jpg).",
      "Reset all defaults to the Microsoft-recommended settings if needed.",
      "Some apps may prompt you to set them as default during installation.",
    ],
    important:
      "Changing your default browser or email client may affect how links and attachments open across other apps on your system.",
    redirectUrl: "ms-settings:defaultapps",
    whyItMatters:
      "Default app associations decide which program actually opens when you click a link, open an email attachment, or double-click a photo, so getting them right saves you from repeatedly redirecting files to the app you actually meant to use. This is especially relevant right after installing a new browser, PDF reader, or media player, since many apps don't automatically become your default without an explicit change here. Misconfigured defaults are also a common source of confusion when opening links from other apps unexpectedly launches the wrong program.",
    bestPractices: [
      "Set your default browser explicitly after installing a new one, since installation alone doesn't always make it the system default.",
      "Assign default apps by file type, like .pdf or .jpg, individually if you want different apps for different formats rather than one blanket browser default.",
      "Use the 'Reset' option if defaults become inconsistent after installing multiple similar apps, such as several PDF readers.",
      "Check default apps again after major Windows updates, since some updates have reset custom defaults back to Microsoft's recommendations.",
    ],
    commonIssues: [
      {
        issue: "Links keep opening in Microsoft Edge instead of your preferred browser.",
        fix: "Go to Settings → Apps → Default apps, search for your browser, and manually assign it to both the .htm/.html file types and the HTTP/HTTPS protocols.",
      },
      {
        issue: "A newly installed app doesn't appear as an option for its file type.",
        fix: "Confirm the app was installed correctly and registered its file associations, then manually search for it under Default apps rather than relying on an install-time prompt.",
      },
      {
        issue: "PDF files open in the wrong reader after installing a new PDF app.",
        fix: "Search for '.pdf' specifically under Default apps → 'Choose default apps by file type' and select your preferred reader there.",
      },
    ],
    faqs: [
      {
        q: "Why didn't my new browser become the default automatically?",
        a: "Windows requires an explicit user confirmation to change default apps for security and consistency reasons, so most installers can only prompt you rather than silently changing the default.",
      },
      {
        q: "What happens if I click 'Reset' next to an app in Default apps settings?",
        a: "It removes that specific app's default assignments and reverts affected file types and links back to Microsoft's recommended defaults, such as Edge for browsing and Photos for images.",
      },
      {
        q: "Can I set different apps as default for different file types within the same category?",
        a: "Yes, for example you can set one video player as default for .mp4 files and a different one for .mkv files by configuring each extension individually.",
      },
    ],
    tipsAndTricks: [
      "Use 'Set defaults by app' when you want one app to claim every file type and link it commonly supports in a single click, instead of configuring each extension manually.",
      "Check 'Choose default apps by file type' directly if a specific extension keeps opening in the wrong program.",
      "After changing a default browser, also verify PDF association separately if that browser doubles as a PDF viewer, since it can silently take over .pdf files too.",
    ],
    relatedSettingIds: ["display-settings", "windows-update"],
    afterImageContent: {
      heading: "How Default Apps Work",
      paragraphs: [
        "Windows uses default app associations to decide which program opens a file or link automatically.",
        "You can set defaults broadly (by app) or granularly (by specific file type or protocol).",
        "Resetting defaults restores Microsoft's recommended app associations across the system.",
      ],
      steps: [
        "Open Settings → Apps → Default apps.",
        "Search for the app you want to set as default.",
        "Assign it to the relevant file types or links.",
        "Use 'Reset' to restore Microsoft-recommended defaults if needed.",
      ],
    },
  },
  {
    id: "language-region",
    title: "Language & Region",
    icon: Languages,
    platform: "windows",
    category: "accessibility-language",
    controlType: "action",
    heading: "Manage Language & Region Settings",
    description:
      "Language & Region settings let you configure your display language, keyboard layouts, regional date/time formats, and add additional languages for typing and speech.",
    details: [
      "Add or remove display and input languages.",
      "Change regional formats for date, time, and currency.",
      "Download language packs for offline typing and speech recognition.",
      "Set a preferred keyboard layout for each installed language.",
    ],
    important:
      "Changing your display language may require signing out or restarting your device for changes to fully apply.",
    redirectUrl: "ms-settings:regionlanguage",
    whyItMatters:
      "Language and region settings affect far more than just menu text — they control date formats, currency symbols, keyboard layouts, and even how spell-check and autocorrect behave across every app on your system. For multilingual users or anyone who splits time between countries, correctly configuring input languages avoids the daily annoyance of typing accents or special characters incorrectly. Getting the regional format right also matters practically, since it affects how forms, spreadsheets, and financial software interpret dates and numbers.",
    bestPractices: [
      "Set your regional format to match your actual location even if your display language differs, so dates and currency display correctly.",
      "Download the full language pack, not just the keyboard layout, if you need speech recognition or spell-check in that language.",
      "Assign a distinct keyboard shortcut to quickly switch between installed languages if you type in more than one regularly.",
      "Restart or sign out after changing the display language to ensure the change fully applies across all apps.",
    ],
    commonIssues: [
      {
        issue: "Some apps still show the old language after switching the system display language.",
        fix: "Fully sign out and back in, or restart the PC, since many apps only pick up the new display language at the next login rather than instantly.",
      },
      {
        issue: "Keyboard produces the wrong characters or symbols.",
        fix: "Check that the correct keyboard layout, not just language, is selected, since a language can have multiple layout variants like QWERTY vs QWERTZ.",
      },
      {
        issue: "Date and number formats look wrong in spreadsheets despite the correct display language.",
        fix: "Change the regional format separately under Language & region, since display language and regional format (date/currency/number formatting) are independent settings.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between display language and regional format?",
        a: "Display language controls the language of menus and system text, while regional format controls how dates, times, currency, and numbers are formatted — you can have an English display language with a different country's regional formatting.",
      },
      {
        q: "Do I need to restart my PC after adding a new language?",
        a: "Not always for typing, but the full display language change typically requires signing out or restarting for every app to reflect it correctly.",
      },
      {
        q: "Can I use multiple keyboard layouts for the same language?",
        a: "Yes, you can add multiple layouts, like US and UK English, under the language's keyboard options and switch between them using the language bar or a keyboard shortcut.",
      },
    ],
    tipsAndTricks: [
      "Use Win+Space to quickly cycle between installed input languages and keyboard layouts without touching Settings.",
      "Use Win+period to open the emoji panel, which also includes special characters and symbols useful for non-English typing.",
      "Download offline speech and handwriting packs for a language before traveling if you plan to use dictation without reliable internet.",
    ],
    relatedSettingIds: ["default-apps", "notifications-settings"],
    afterImageContent: {
      heading: "How Language & Region Settings Work",
      paragraphs: [
        "Windows supports multiple display and input languages simultaneously, letting you switch between them quickly.",
        "Regional settings control how dates, times, and currency are formatted throughout the system.",
        "Language packs can be downloaded for offline use, including speech and handwriting recognition support.",
      ],
      steps: [
        "Open Settings → Time & Language → Language & region.",
        "Click 'Add a language' to install a new one.",
        "Set your preferred display language and region format.",
        "Restart or sign out if prompted to apply changes.",
      ],
    },
  },
  // --- New Windows entries ---
  {
    id: "windows-security",
    title: "Windows Security",
    icon: ShieldCheck,
    platform: "windows",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Manage Windows Security & Antivirus",
    description:
      "Windows Security is the built-in protection center for virus & threat protection, firewall & network protection, and device health. It runs Microsoft Defender Antivirus and lets you review recent scans and threats.",
    details: [
      "Run quick, full, or custom antivirus scans on demand.",
      "Review the firewall and network protection status for each network profile.",
      "Check app & browser control settings that guard against phishing and malicious downloads.",
      "View device performance and health reports.",
    ],
    important:
      "If you install a third-party antivirus, Windows Security automatically steps back for real-time protection — you can still use it to review overall device health.",
    redirectUrl: "ms-settings:windowsdefender",
    afterImageContent: {
      heading: "How Windows Security Works",
      paragraphs: [
        "Windows Security bundles antivirus, firewall, and device health monitoring into a single dashboard.",
        "Microsoft Defender Antivirus updates its threat definitions automatically through Windows Update.",
        "You can whitelist trusted files or folders under 'Virus & threat protection settings' if a scan flags something you trust.",
      ],
      steps: [
        "Open Settings → Privacy & Security → Windows Security.",
        "Select 'Virus & threat protection' to run a scan.",
        "Review 'Firewall & network protection' for your active network profile.",
        "Check 'Device performance & health' for an overall status summary.",
      ],
    },
    whyItMatters:
      "Windows Security is your first line of defense against malware, ransomware, and network intrusions, and it's already running for free whether you notice it or not. Understanding what it's telling you means you can catch a real threat early instead of dismissing a warning you don't recognize.",
    bestPractices: [
      "Run a quick scan at least once a week, and a full scan monthly or after downloading files from unfamiliar sources.",
      "Keep 'Tamper Protection' turned on so malware can't quietly disable your antivirus.",
      "Review the firewall's active network profile whenever you connect to a new network, especially public Wi-Fi.",
      "Don't install a second full antivirus suite alongside Windows Security — running two real-time scanners at once causes conflicts and slowdowns.",
    ],
    commonIssues: [
      {
        issue: "Windows Security shows a red or yellow warning icon.",
        fix: "Open the app and check which section is flagged (virus protection, firewall, or account) — it usually names the exact problem and offers a one-click fix.",
      },
      {
        issue: "A trusted file keeps getting quarantined.",
        fix: "Add it as an exclusion under 'Virus & threat protection settings' → 'Exclusions', but only for files and folders you fully trust.",
      },
      {
        issue: "Real-time protection appears greyed out or won't turn on.",
        fix: "This usually means a third-party antivirus is installed and active — uninstall it if you no longer want it, then Windows Security will resume automatically.",
      },
    ],
    faqs: [
      {
        q: "Do I need to buy separate antivirus software?",
        a: "No — Microsoft Defender Antivirus inside Windows Security provides solid baseline protection for most users at no extra cost. Third-party suites add extra features some people want, but they aren't required.",
      },
      {
        q: "Will scanning slow down my PC?",
        a: "A quick scan uses minimal resources and usually finishes in a few minutes. Full scans are more intensive, so it's best to run them when you're not actively working.",
      },
      {
        q: "Does Windows Security protect against phishing links?",
        a: "Yes, partly — SmartScreen (under App & browser control) warns you about known malicious sites and downloads, though it's not a substitute for being cautious with email links.",
      },
    ],
    tipsAndTricks: [
      "Pin the Windows Security app to your taskbar so you can check its status without digging through Settings.",
      "Use 'Core isolation' under Device security for extra protection against firmware-level attacks, if your hardware supports it.",
    ],
    relatedSettingIds: ["camera-permission", "microphone-permission", "network-reset"],
  },
  {
    id: "windows-family-safety",
    title: "Family Safety",
    icon: Users,
    platform: "windows",
    category: "accounts-sync-family",
    recommended: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Microsoft Family Safety",
    description:
      "Microsoft Family Safety lets you create a family group to manage screen time limits, content filters, spending, and location sharing for children's Windows, Xbox, and mobile devices from one place.",
    details: [
      "Create a family group and invite members from account.microsoft.com/family.",
      "Set screen time schedules and app/game limits per child.",
      "Filter web content and set appropriate age ratings for apps and games.",
      "Optionally enable location sharing so family members can see each other on a map.",
    ],
    important:
      "Family Safety settings are managed through your Microsoft account online, not directly inside the local Settings app.",
    redirectUrl: "https://support.microsoft.com/en-us/family-safety/set-up-microsoft-family-safety",
    afterImageContent: {
      heading: "How Family Safety Works",
      paragraphs: [
        "Family Safety is managed centrally through your Microsoft account online, then applied automatically to every Windows, Xbox, Android, and iOS device your family members sign into.",
        "Screen time limits, content filters, and spending controls sync in near real time once a device is online, so a schedule you set from your phone takes effect on a child's PC shortly after.",
        "Weekly activity reports summarize app usage, web browsing, and screen time per child so you can review trends instead of watching in real time.",
      ],
      steps: [
        "Go to account.microsoft.com/family and sign in with the organizer's Microsoft account.",
        "Select 'Add a family member' and invite a child or adult by email.",
        "Once they accept, open their profile to set screen time schedules, content filters, and spending limits.",
        "Review the weekly activity email or the Family Safety app together with your child.",
      ],
    },
    whyItMatters:
      "Family Safety gives parents real visibility into what kids are doing across Windows, Xbox, and mobile devices — screen time, app installs, web content — without needing to check each device separately. It turns scattered parental-control settings into one place you actually check.",
    bestPractices: [
      "Set age-appropriate content filters for web browsing and the Microsoft Store before handing a device to a child.",
      "Review the weekly activity report together with your child rather than only using it to restrict access silently.",
      "Set screen time limits per app or game, not just a single overall daily limit, so homework apps aren't blocked along with games.",
      "Enable location sharing only for family members who've agreed to it — it's opt-in for a reason.",
    ],
    commonIssues: [
      {
        issue: "A child's screen time limit isn't being enforced on a specific device.",
        fix: "Confirm that device is actually signed in with the child's Microsoft account and connected to the internet — Family Safety limits only apply to devices linked to that account.",
      },
      {
        issue: "Activity reporting shows nothing for a device.",
        fix: "Activity reporting needs to be turned on separately per child in the Family Safety app or account.microsoft.com/family — it's off by default on new accounts.",
      },
      {
        issue: "A teen keeps requesting more screen time.",
        fix: "Use the 'More time' request feature — teens can send a request from their device, and a parent can approve it remotely for that day only.",
      },
    ],
    faqs: [
      {
        q: "Does Family Safety work on non-Windows devices?",
        a: "Yes — it also covers Xbox consoles and has companion apps for Android and iOS, so limits and reports follow the child's account across devices.",
      },
      {
        q: "Can my child see that I'm monitoring their activity?",
        a: "Family Safety is designed to be transparent rather than covert — children signed into a monitored account will generally see reminders about screen time limits and restrictions.",
      },
      {
        q: "Is Family Safety free?",
        a: "The core features are free with a Microsoft account; some advanced features are bundled with a Microsoft 365 Family subscription.",
      },
    ],
    tipsAndTricks: [
      "Use 'Ask a parent' prompts so a child can request purchase or app-install approval instead of being flatly blocked.",
      "Set different bedtime schedules for school nights versus weekends instead of one fixed screen-time cutoff.",
    ],
    relatedSettingIds: ["microphone-permission", "windows-security", "camera-permission", "windows-email-accounts", "windows-other-users"],
  },
  // --- 7 additional Windows entries: Accounts & Family, matching native Windows' "Accounts" page ---
  {
    id: "windows-email-accounts",
    title: "Email & Accounts",
    icon: Mail,
    platform: "windows",
    category: "accounts-sync-family",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "Open Email & Accounts",
    heading: "Manage Accounts Used by Email, Calendar, and Other Apps",
    description:
      "Email & Accounts lists every account — Microsoft, work/school, or other — that your installed apps (Mail, Calendar, OneDrive, and third-party apps) are allowed to use to sync data. You can add new accounts here or remove ones apps no longer need.",
    details: [
      "Shows accounts used specifically for syncing email, contacts, and calendars — separate from your main Windows sign-in account.",
      "Add a Microsoft, Google, Yahoo, iCloud, or generic IMAP/POP account.",
      "Remove an account here to stop every app on this PC from accessing it, without deleting the account itself.",
      "Your main sign-in account (shown at the top) can't be removed from this page.",
    ],
    redirectUrl: "ms-settings:emailandaccounts",
    afterImageContent: {
      heading: "How Email & Accounts Works",
      paragraphs: [
        "This page is a permissions hub, not the Mail app itself — it controls which accounts apps on this PC are allowed to read from and sync to, independent of which app you actually use to check email.",
        "Adding an account here makes it available to the built-in Mail and Calendar apps immediately; other apps (like Outlook) may need you to also sign in inside the app itself the first time.",
      ],
      steps: [
        "Open Settings > Accounts > Email & accounts.",
        "Select 'Add an account' and choose the account type (Microsoft, Google, Outlook, Yahoo, or Other).",
        "Sign in and grant the requested permissions (mail, contacts, calendar).",
        "The account now appears in Mail, Calendar, and any other app that supports it.",
      ],
    },
    whyItMatters:
      "Keeping this list accurate matters when you share a PC, leave a job, or stop using an old email provider — an account you forget to remove here keeps syncing quietly in the background, even after you've changed its password elsewhere.",
    bestPractices: [
      "Remove accounts for jobs or services you no longer use, rather than leaving them signed in indefinitely.",
      "Use a personal Microsoft account for personal syncing and a separate work/school account for work data, instead of mixing both on one account.",
      "If an app stops syncing, check here first — often the account's token has expired and just needs re-entering the password.",
    ],
    commonIssues: [
      {
        issue: "Mail app shows an account error or stops receiving new mail.",
        fix: "Open Email & Accounts, select the affected account, and choose 'Manage' to re-enter your password — sync tokens occasionally expire and need refreshing.",
      },
      {
        issue: "Removed an account here but an app still shows old cached emails.",
        fix: "This is expected — removing the account stops new syncing, but some apps keep a local cache until you clear their app data separately.",
      },
    ],
    faqs: [
      {
        q: "Does removing an account here delete it permanently?",
        a: "No — it only disconnects it from this PC. The account itself (and its emails, contacts, etc.) still exists wherever it's hosted.",
      },
      {
        q: "Can I use Email & Accounts to change my Windows sign-in password?",
        a: "No — password changes for your Microsoft account are done through account.microsoft.com or Windows' Sign-in options, not this page.",
      },
    ],
    tipsAndTricks: [
      "If you only need read-only calendar access from a work account, some providers let you add it as a subscribed calendar instead of a full synced account — lighter weight and easier to remove later.",
    ],
    relatedSettingIds: ["windows-sign-in-options", "windows-your-info", "windows-family-safety"],
  },
  {
    id: "windows-other-users",
    title: "Other Users",
    icon: UserPlus,
    platform: "windows",
    category: "accounts-sync-family",
    controlType: "action",
    actionLabel: "Open Other Users",
    heading: "Add or Remove Additional Accounts on This PC",
    description:
      "Other Users lets you add separate sign-in accounts for other people who share this PC — family members, guests, or coworkers — each getting their own desktop, files, and settings, isolated from yours.",
    details: [
      "Add a family member's Microsoft account or a local account with no Microsoft sign-in.",
      "Each added user gets their own separate desktop, documents, and app settings.",
      "Remove a user and optionally delete their account data from this specific PC.",
      "Set an added account as a child account to enable Family Safety controls automatically.",
    ],
    redirectUrl: "ms-settings:otherusers",
    afterImageContent: {
      heading: "How Other Users Works",
      paragraphs: [
        "Every account you add here is a fully separate Windows profile — files, desktop layout, installed app data, and browser history stay isolated from every other account on the PC, similar to separate user accounts on a shared family computer.",
        "Adding someone as a child automatically links their sign-in to Family Safety, so screen time and content filters apply the moment they log in, without any extra setup.",
      ],
      steps: [
        "Open Settings > Accounts > Other users.",
        "Select 'Add account' and choose whether it's a family member or someone else.",
        "Enter their email, or choose 'I don't have this person's sign-in information' to create a local account.",
        "The new account appears on the sign-in screen the next time the PC restarts or locks.",
      ],
    },
    whyItMatters:
      "Sharing one Windows account between multiple people means everyone sees each other's files, browser history, and app settings — a separate account per person keeps that private and prevents accidental changes to someone else's setup.",
    bestPractices: [
      "Give each person who regularly uses the PC their own account rather than one shared login.",
      "Use the child-account option for kids so Family Safety controls apply automatically instead of being set up separately.",
      "Remove a user's account (and optionally their data) once they stop using the PC, especially for guests or former coworkers.",
    ],
    commonIssues: [
      {
        issue: "A newly added user can't sign in.",
        fix: "Confirm the invite was accepted — Microsoft-account invites require the other person to accept before the account becomes active on this PC.",
      },
      {
        issue: "Removing a user doesn't free up disk space.",
        fix: "Removing the account leaves their files by default unless you explicitly choose to delete the account's data during removal.",
      },
    ],
    faqs: [
      {
        q: "Can another user see my files?",
        a: "No — each Windows account has its own separate user folder that other standard accounts can't access by default.",
      },
      {
        q: "Does adding a local account require an internet connection?",
        a: "No — local accounts (without a Microsoft sign-in) can be created and used entirely offline.",
      },
    ],
    tipsAndTricks: [
      "Set up a dedicated 'Guest'-style local account for visitors instead of sharing your own login temporarily.",
    ],
    relatedSettingIds: ["windows-family-safety", "windows-work-school-access"],
  },
  {
    id: "windows-work-school-access",
    title: "Access Work or School",
    icon: Briefcase,
    platform: "windows",
    category: "accounts-sync-family",
    controlType: "action",
    actionLabel: "Open Access Work or School",
    heading: "Connect This PC to a Work or School Organization",
    description:
      "Access Work or School lets you connect this PC to an organization's Azure AD / Microsoft Entra environment so you can access company or school email, apps, and resources, and so IT can apply required security policies.",
    details: [
      "Connect using a work or school account to gain access to organization-managed resources like SharePoint, Teams, or internal apps.",
      "Organizations may require this connection before allowing access to email or shared files from this device.",
      "IT administrators can enforce security policies (like requiring a PIN or encryption) once connected.",
      "You can disconnect an organization account at any time, which removes its managed policies from this PC.",
    ],
    redirectUrl: "ms-settings:workplace",
    afterImageContent: {
      heading: "How Access Work or School Works",
      paragraphs: [
        "Connecting here is different from just signing into Outlook or Teams with a work email — it registers this specific device with the organization's identity system, which is what lets IT apply device-level policies rather than just app-level sign-in.",
        "Some organizations require this connection before they'll allow access to sensitive resources at all, as a way of confirming the device meets their security requirements.",
      ],
      steps: [
        "Open Settings > Accounts > Access work or school.",
        "Select 'Connect' and enter your work or school email address.",
        "Follow your organization's sign-in and verification steps, which may include multi-factor authentication.",
        "Once connected, organization-managed apps and policies become available automatically.",
      ],
    },
    whyItMatters:
      "Many organizations won't grant access to company email, files, or internal tools until a device is formally connected this way — it's often the step people miss when a new work laptop or personal PC can't reach company resources.",
    bestPractices: [
      "Only connect personal devices to an organization you trust, since IT can apply security policies (and in managed cases, remotely wipe organization data) once connected.",
      "Disconnect from an organization's account promptly if you leave that job or school.",
      "Keep your device's Windows version and security patches current — many organizations require this before granting access.",
    ],
    commonIssues: [
      {
        issue: "Connection fails with a 'can't reach your organization' error.",
        fix: "Check your internet connection and confirm the work/school email is correct — some organizations also require you to be on a specific network or VPN for the initial connection.",
      },
      {
        issue: "Organization apps say the device isn't compliant.",
        fix: "This usually means a required policy (like a PIN, encryption, or antivirus) isn't met yet — check Settings > Accounts > Access work or school > Info for the specific requirement.",
      },
    ],
    faqs: [
      {
        q: "Can my employer see everything on my personal PC after I connect it?",
        a: "No — organization policies typically apply only to managed work data and apps, not your entire personal PC, though the exact scope depends on what your IT department configures.",
      },
      {
        q: "What happens if I disconnect from my organization?",
        a: "You lose access to that organization's managed resources and any policies it applied are removed, but your personal files and accounts are unaffected.",
      },
    ],
    tipsAndTricks: [
      "If a company app won't launch, check this page first — it often just needs you to reconnect after a password change.",
    ],
    relatedSettingIds: ["windows-other-users", "windows-security"],
  },
  {
    id: "windows-passkeys",
    title: "Passkeys",
    icon: KeyRound,
    platform: "windows",
    category: "accounts-sync-family",
    recommended: true,
    controlType: "action",
    actionLabel: "Open Passkey Settings",
    heading: "Sign In Without a Password Using Your Face, Fingerprint, or PIN",
    description:
      "Passkeys let you sign into supported websites and apps using Windows Hello (your face, fingerprint, or PIN) instead of typing a password — they're stored securely on this device and can't be phished or reused if a website is breached.",
    details: [
      "Passkeys are created per website or app, the same way passwords are, but stored as encrypted device credentials instead of text.",
      "Signing in with a passkey uses the same Windows Hello face, fingerprint, or PIN prompt as unlocking your PC.",
      "Passkeys saved to your Microsoft account can sync to your other Windows devices.",
      "You can view and remove saved passkeys from Settings > Accounts > Passkeys at any time.",
    ],
    redirectUrl: "ms-settings:signinoptions",
    afterImageContent: {
      heading: "How Passkeys Work",
      paragraphs: [
        "A passkey is a cryptographic key pair — the private half never leaves your device, so there's nothing for an attacker to steal even if the website itself is breached, unlike a password stored in a database.",
        "Because the sign-in prompt is the same Windows Hello check you already use to unlock your PC, passkeys are usually faster to use than typing a password and solving a two-factor code.",
      ],
      steps: [
        "On a supported website, choose 'Sign in with a passkey' or 'Create a passkey' during account setup.",
        "Windows prompts you to verify with your face, fingerprint, or PIN.",
        "The passkey is saved to this device (and your Microsoft account, if enabled) automatically.",
        "Next time you sign in, choose the passkey option and verify with Windows Hello — no password needed.",
      ],
    },
    whyItMatters:
      "Passwords remain one of the most common ways accounts get compromised — through reuse, phishing, or data breaches at the website itself. Passkeys remove that risk entirely for the sites that support them, without making sign-in any slower.",
    bestPractices: [
      "Enable passkeys first on your most important accounts — email and financial accounts — since those carry the most risk if compromised.",
      "Keep Windows Hello (face, fingerprint, or PIN) set up and working, since it's required to actually use a passkey.",
      "Don't disable password sign-in entirely until you've confirmed passkey sign-in works reliably on each site you use it for.",
    ],
    commonIssues: [
      {
        issue: "A website's passkey sign-in prompt doesn't appear.",
        fix: "Confirm the website actually supports passkeys and that you're using an up-to-date browser — passkey support varies by site and browser version.",
      },
      {
        issue: "Passkey created on one PC doesn't show up on another device.",
        fix: "Passkey syncing requires the same Microsoft account to be signed in on both devices with syncing enabled — check Settings > Accounts > Passkeys on each device.",
      },
    ],
    faqs: [
      {
        q: "Do passkeys replace my Windows sign-in PIN?",
        a: "No — they're separate. Your Windows Hello PIN/face/fingerprint unlocks this PC; passkeys use that same verification to sign into individual websites and apps.",
      },
      {
        q: "What happens if I lose my PC — can someone use my passkeys?",
        a: "Passkeys still require your Windows Hello verification (face, fingerprint, or PIN) to use, so having the physical device alone isn't enough to sign in with them.",
      },
    ],
    tipsAndTricks: [
      "Check Settings > Accounts > Passkeys periodically and remove ones for accounts you've closed or no longer use.",
    ],
    relatedSettingIds: ["windows-sign-in-options", "windows-security"],
  },
  {
    id: "windows-sign-in-options",
    title: "Sign-in Options",
    icon: Fingerprint,
    platform: "windows",
    category: "accounts-sync-family",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "Open Sign-in Options",
    heading: "Choose How You Unlock and Sign Into Windows",
    description:
      "Sign-in Options controls every way you can sign into this PC — Windows Hello face and fingerprint recognition, PIN, security key, or password — and lets you require sign-in after sleep for extra security.",
    details: [
      "Set up or change your PIN, which is tied to this specific device and never sent over the internet.",
      "Enable Windows Hello face or fingerprint recognition if your PC has the required camera or sensor.",
      "Choose whether Windows requires sign-in immediately after sleep, or after a delay.",
      "Set up a physical security key as an additional or alternative sign-in method.",
    ],
    redirectUrl: "ms-settings:signinoptions",
    afterImageContent: {
      heading: "How Sign-in Options Works",
      paragraphs: [
        "A Windows PIN is actually more secure than a password in one important way: it's tied to this specific device's hardware and never travels over the internet, so it can't be stolen from a server breach the way a password can.",
        "Windows Hello face and fingerprint recognition use dedicated hardware to store a mathematical representation of your face or fingerprint locally — the actual image is never saved or uploaded anywhere.",
      ],
      steps: [
        "Open Settings > Accounts > Sign-in options.",
        "Choose a sign-in method — Windows Hello Face, Fingerprint, PIN, Security key, or Password.",
        "Follow the setup prompts, which typically involve verifying your current password once.",
        "Optionally set 'For improved security, only allow Windows Hello sign-in' to require biometric or PIN sign-in instead of a password.",
      ],
    },
    whyItMatters:
      "How you sign in is the first line of defense for everything on this PC — a weak or reused password undermines every other security setting. Windows Hello and PIN sign-in are both faster and meaningfully harder to compromise remotely than a typed password.",
    bestPractices: [
      "Set up Windows Hello face or fingerprint recognition if your hardware supports it — it's faster than a PIN and can't be shoulder-surfed.",
      "Require sign-in immediately after sleep on laptops that leave the house, not just at home.",
      "Keep a PIN set up even if you mainly use Windows Hello, as a reliable fallback if the camera or fingerprint sensor ever fails.",
    ],
    commonIssues: [
      {
        issue: "Windows Hello face recognition stops working after a Windows update.",
        fix: "Go to Sign-in options, remove the existing Windows Hello Face setup, and set it up again — this re-registers it with the updated drivers.",
      },
      {
        issue: "Forgot your PIN.",
        fix: "Select 'I forgot my PIN' on the sign-in screen, which lets you verify with your Microsoft account password and set a new PIN.",
      },
    ],
    faqs: [
      {
        q: "Is a PIN less secure than a password since it's shorter?",
        a: "No — a PIN is tied to this specific device and processed locally by the Trusted Platform Module, so it can't be used remotely even if intercepted, unlike a password which works from anywhere.",
      },
      {
        q: "Can I remove password sign-in entirely?",
        a: "You can require Windows Hello/PIN for everyday sign-in, but a password or recovery method typically still exists on the account for account-recovery scenarios.",
      },
    ],
    tipsAndTricks: [
      "If you share your PC with family, each person's PIN and Windows Hello setup stays private to their own account.",
    ],
    relatedSettingIds: ["windows-passkeys", "windows-security", "windows-bitlocker"],
  },
  {
    id: "windows-your-info",
    title: "Your Info",
    icon: CircleUserRound,
    platform: "windows",
    category: "accounts-sync-family",
    controlType: "action",
    actionLabel: "Open Your Info",
    heading: "View and Manage Your Sign-in Account Details",
    description:
      "Your Info shows the account currently signed into this PC — your name, profile picture, and whether it's a local or Microsoft account — with quick links to manage your Microsoft account online.",
    details: [
      "Shows whether you're signed in with a Microsoft account or a local account.",
      "Change your profile picture from a file or camera.",
      "Link out to account.microsoft.com to manage payment info, subscriptions, and privacy.",
      "Switch from a local account to a Microsoft account, or vice versa, from this page.",
    ],
    redirectUrl: "ms-settings:yourinfo",
    afterImageContent: {
      heading: "How Your Info Works",
      paragraphs: [
        "This page is mostly a summary and jumping-off point — actual account management (billing, subscriptions, security) happens on account.microsoft.com, which this page links to directly for a Microsoft account.",
        "A local account keeps everything on this PC only, with no cloud sync of settings or files, while a Microsoft account enables sync, cloud backup, and Microsoft Store purchases.",
      ],
      steps: [
        "Open Settings > Accounts > Your info.",
        "Select 'Change profile picture' to update your photo, or 'Manage my Microsoft account' to open account.microsoft.com.",
        "If on a local account, select 'Sign in with a Microsoft account instead' to switch and enable sync.",
      ],
    },
    whyItMatters:
      "Knowing whether you're on a local or Microsoft account explains a lot of other behavior — like why settings, files, or app purchases don't follow you to another PC. This page is the quickest way to check and change that.",
    bestPractices: [
      "Switch to a Microsoft account if you want your settings, files, and Microsoft Store purchases to sync across devices.",
      "Keep a recognizable profile picture set if this PC is shared, so it's obvious at a glance whose account is signed in.",
    ],
    commonIssues: [
      {
        issue: "Profile picture doesn't update everywhere (e.g., still old on the sign-in screen).",
        fix: "Sign out and back in, or restart the PC — the sign-in screen picture is cached separately and doesn't always refresh instantly.",
      },
      {
        issue: "Switching to a Microsoft account fails.",
        fix: "Confirm you're connected to the internet and the Microsoft account isn't already the maximum number of devices for your account type; otherwise remove an older linked device first at account.microsoft.com/devices.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between a local and Microsoft account?",
        a: "A local account stays only on this PC with no cloud sync; a Microsoft account syncs settings and enables features like Find My Device, OneDrive backup, and Microsoft Store purchases across devices.",
      },
      {
        q: "Can I have a different name on Windows than my Microsoft account?",
        a: "The display name on this PC generally follows your Microsoft account name; to change it, update your name at account.microsoft.com and it syncs back down.",
      },
    ],
    tipsAndTricks: [
      "Use 'Manage my Microsoft account' from this page instead of searching for account.microsoft.com separately — it signs you in automatically.",
    ],
    relatedSettingIds: ["windows-sign-in-options", "windows-email-accounts"],
  },
  {
    id: "windows-linked-devices",
    title: "Linked Devices",
    icon: Link,
    platform: "windows",
    category: "accounts-sync-family",
    controlType: "action",
    actionLabel: "Open Linked Devices",
    heading: "See and Manage Phones and Devices Linked to Your Microsoft Account",
    description:
      "Linked Devices shows phones and other PCs connected to your Microsoft account, enabling features like continuing a browser tab from your phone on this PC, or seeing your phone's photos and notifications through the Link to Windows / Phone Link app.",
    details: [
      "Shows every phone or device currently linked to your Microsoft account for cross-device features.",
      "Link an Android or iPhone using the Phone Link app for messages, photos, and notification mirroring.",
      "Remove a linked device here to stop cross-device features without changing anything on the phone itself.",
      "Cross-device copy-paste and 'continue on PC' features rely on devices listed here.",
    ],
    redirectUrl: "ms-settings:crossdevice",
    afterImageContent: {
      heading: "How Linked Devices Works",
      paragraphs: [
        "Linking a phone here is what powers the Phone Link app's ability to show your phone's notifications, photos, and messages directly on this PC, and lets you copy text or a link on your phone and paste it here.",
        "The connection uses your Microsoft account as the bridge — both the phone and this PC must be signed into the same Microsoft account for linking to work.",
      ],
      steps: [
        "Open Settings > Accounts > Linked devices (or Settings > Mobile devices, depending on Windows version).",
        "Select 'Add a device' and follow the prompt to scan a QR code with your phone or open the Phone Link app.",
        "Grant the requested permissions on your phone (notifications, contacts, messages) for the features you want.",
        "Your phone now appears in Linked Devices, and Phone Link becomes fully functional.",
      ],
    },
    whyItMatters:
      "This is the setting people forget exists but rely on constantly once set up — it's what lets you answer a text message or check a notification without picking up your phone while working on this PC.",
    bestPractices: [
      "Only grant notification and message access to devices you personally own and trust.",
      "Remove a device from this list promptly if you sell, lose, or replace the linked phone.",
      "If cross-device copy-paste feels unreliable, confirm Bluetooth is on for both devices — it's used for the nearby-device handshake.",
    ],
    commonIssues: [
      {
        issue: "Phone Link shows 'device not linked' even after setup.",
        fix: "Confirm both the phone and PC are signed into the same Microsoft account, and that the phone has an active internet connection — linking relies on both being online simultaneously during setup.",
      },
      {
        issue: "Notifications from the phone stop appearing on the PC.",
        fix: "Reopen the Phone Link app and confirm notification access permission is still granted on the phone — Android sometimes revokes it after a phone restart or update.",
      },
    ],
    faqs: [
      {
        q: "Do I need the same Microsoft account on my phone and PC?",
        a: "Yes — linking requires both devices to be signed into the same Microsoft account.",
      },
      {
        q: "Can I link more than one phone?",
        a: "Yes, Windows supports linking multiple phones, though only one can be the 'active' device for certain features like calling at a time.",
      },
    ],
    tipsAndTricks: [
      "Use the 'continue on PC' feature to hand off a webpage you're reading on your phone straight to this PC's browser.",
    ],
    relatedSettingIds: ["windows-nearby-sharing", "windows-your-info"],
  },
  // --- 13 additional Windows entries: personalization, devices & peripherals, connectivity ---
  {
    id: "windows-focus-assist",
    title: "Focus Assist",
    icon: Moon,
    platform: "windows",
    category: "display-sound-notifications",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Manage Focus Assist",
    description:
      "Focus Assist (formerly Quiet Hours) automatically silences notification banners and sounds so alerts don't interrupt you during focused work, gaming, or presentations. You can trigger it manually or set automatic rules for specific times, duplicated displays, or full-screen games, and choose whether only alarms or also priority contacts still get through.",
    details: [
      "Choose between 'Priority only' (lets selected apps/contacts through) or 'Alarms only' (blocks everything else).",
      "Build a priority list of specific apps, and optionally specific contacts for calls and texts.",
      "Set automatic rules for time windows, duplicate display detection, or full-screen games.",
      "Missed notifications are still logged and appear in Notification Center once Focus Assist turns off.",
    ],
    important:
      "Turning Focus Assist on manually from Quick Settings (Win+A) overrides your automatic rules until you turn it off yourself, so a manually enabled session doesn't end just because a scheduled rule's time window passes.",
    redirectUrl: "ms-settings:quiethours",
    whyItMatters:
      "Focus Assist is the difference between deep, uninterrupted work and constantly glancing at banner popups from chat apps, games, and background software. Because it can trigger automatically based on real signals like a presentation (duplicated display) or a full-screen game, you don't have to remember to turn it on before every meeting. For anyone who works from a laptop that also handles personal chat apps, it's the cleanest way to keep an important calendar reminder visible while muting everything else. Left unconfigured, most people either get too many interruptions or accidentally silence something they actually needed to see.",
    bestPractices: [
      "Add your calendar and video-calling apps to the priority list so meeting reminders always break through.",
      "Turn on the 'When I'm playing a game' automatic rule if you use a PC for gaming, since full-screen games generate the most interruption-prone notification spam.",
      "Set a recurring automatic rule for standard working hours rather than remembering to toggle Focus Assist manually every morning.",
      "Review your priority list after installing new communication apps, since new apps default to not being on it.",
    ],
    commonIssues: [
      {
        issue: "An important call or reminder was silenced during Focus Assist.",
        fix: "Add that specific app or contact to the priority list under 'Customize your priority list' so it always gets through regardless of the active rule.",
      },
      {
        issue: "Focus Assist won't turn off automatically after a scheduled meeting ends.",
        fix: "Check whether it was enabled manually from Quick Settings; manual activation stays on until you turn it off yourself, independent of any automatic rule's end time.",
      },
      {
        issue: "The 'When I'm playing a game' rule never seems to trigger.",
        fix: "Confirm the game is actually running in true full-screen (not borderless windowed) mode, since Windows detects this rule based on full-screen exclusive mode.",
      },
    ],
    faqs: [
      {
        q: "Does Focus Assist block sound as well as visual notifications?",
        a: "Yes, both the banner and the notification sound are suppressed for anything not on your priority list or set to Alarms only.",
      },
      {
        q: "Will I lose notifications permanently while Focus Assist is on?",
        a: "No, they're stored and shown in a summary in Notification Center as soon as Focus Assist turns off, so nothing is deleted.",
      },
      {
        q: "Can I let just one specific contact's calls through during Focus Assist?",
        a: "Yes, under 'Customize your priority list' you can add specific contacts so their calls and texts still notify you even on Priority only mode.",
      },
    ],
    tipsAndTricks: [
      "Open Quick Settings with Win+A for a one-click toggle between Off, Priority only, and Alarms only without opening the full Settings app.",
      "Combine the 'duplicate my display' automatic rule with presentation software so Focus Assist turns on the moment you start screen-sharing.",
    ],
    relatedSettingIds: ["notifications-settings", "sound-settings", "display-settings"],
    afterImageContent: {
      heading: "How Focus Assist Works",
      paragraphs: [
        "Focus Assist sits between full notifications and Do Not Disturb, letting you choose exactly what still gets through while you're concentrating.",
        "Automatic rules evaluate conditions like time of day, display duplication, or a full-screen app in the foreground, and enable Focus Assist without you needing to remember to turn it on.",
        "When Focus Assist ends, a summary notification shows what you missed, so nothing genuinely disappears.",
      ],
      steps: [
        "Open Settings → System → Focus assist.",
        "Choose Off, Priority only, or Alarms only.",
        "Click 'Customize your priority list' to add apps and contacts.",
        "Scroll to 'Automatic rules' and enable the ones that fit your schedule.",
      ],
    },
  },
  {
    id: "windows-personalization",
    title: "Personalization",
    icon: Palette,
    platform: "windows",
    category: "personalization",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Customize Windows Personalization",
    description:
      "Personalization is the hub for changing how Windows looks and feels — desktop background, accent colors, themes, lock screen, Start menu layout, and taskbar behavior all live under this one settings category. It's the starting point for making a shared or new PC feel like your own.",
    details: [
      "Set a background image, solid color, or slideshow for your desktop.",
      "Choose an accent color and whether it applies to title bars and Start.",
      "Switch between light and dark mode, or match Windows to app defaults.",
      "Access dedicated sub-pages for Themes, Lock screen, Start, and Taskbar from here.",
    ],
    important:
      "Some personalization options, particularly custom themes and certain accent color effects, are disabled by your organization's Group Policy on managed work or school devices.",
    redirectUrl: "ms-settings:personalization",
    whyItMatters:
      "Personalization settings don't change functionality, but they have an outsized effect on how comfortable and recognizable your PC feels, especially if you share it with family members who each want their own look under separate accounts. Dark mode specifically reduces eye strain in low light and can noticeably extend battery life on OLED laptop screens. Because this page is the entry point to Themes, Lock screen, Start, and Taskbar, it's worth knowing it exists as the umbrella even if you usually jump straight to a sub-page.",
    bestPractices: [
      "Match accent color to your background using the 'Automatic' accent color option so title bars and Start always look coordinated.",
      "Use dark mode in low-light environments and light mode in bright rooms rather than picking one permanently based on preference alone.",
      "Save a personalization combination you like as a named theme so you can switch back after experimenting.",
      "Check contrast between your accent color and text before applying it broadly, since some bright colors reduce readability in title bars.",
    ],
    commonIssues: [
      {
        issue: "Accent color changes don't apply to the taskbar or Start menu.",
        fix: "Enable 'Show accent color on Start, taskbar, and action center' under Colors, since the accent color toggle for the desktop and window borders is separate from this one.",
      },
      {
        issue: "Personalization options are greyed out on a work laptop.",
        fix: "This is usually enforced by organizational Group Policy; check with your IT department, since it can't be overridden from the Settings app.",
      },
      {
        issue: "Slideshow background stops rotating images.",
        fix: "Confirm the selected folder still contains images and that 'Shuffle the picture order' and the change frequency are configured under Background → Slideshow settings.",
      },
    ],
    faqs: [
      {
        q: "Does changing personalization settings affect PC performance?",
        a: "No, background images, colors, and themes are purely cosmetic and have no meaningful impact on performance, though a slideshow background does use marginally more resources than a static image.",
      },
      {
        q: "Can each user account have different personalization settings on the same PC?",
        a: "Yes, personalization settings including background, colors, and themes are saved per user account, so each sign-in can look completely different.",
      },
      {
        q: "What's the difference between Personalization and Themes?",
        a: "Personalization is the umbrella category for all visual settings, while Themes lets you save and switch between complete combinations of background, color, sounds, and mouse cursor as a single reusable package.",
      },
    ],
    tipsAndTricks: [
      "Right-click the desktop and choose Personalize as a shortcut straight into this settings page without going through the Start menu.",
      "Use Windows Spotlight as your background option for a rotating set of curated high-quality images instead of managing your own folder.",
    ],
    relatedSettingIds: ["windows-themes", "windows-lock-screen", "windows-taskbar"],
    afterImageContent: {
      heading: "How Personalization Ties Together",
      paragraphs: [
        "Personalization acts as the parent category for every visual customization option in Windows, branching into Background, Colors, Themes, Lock screen, Start, and Taskbar sub-pages.",
        "Changes made here, like an accent color, automatically flow through to compatible parts of the interface including Start, taskbar, and title bars.",
        "Saving your current combination of background, color, and sounds as a custom theme lets you switch your entire look back and forth in one click.",
      ],
      steps: [
        "Open Settings → Personalization.",
        "Select Background to set an image, solid color, or slideshow.",
        "Select Colors to choose light/dark mode and an accent color.",
        "Save your combination under Themes if you want to reuse it later.",
      ],
    },
  },
  {
    id: "windows-themes",
    title: "Themes",
    icon: Paintbrush,
    platform: "windows",
    category: "personalization",
    controlType: "action",
    heading: "Manage Windows Themes",
    description:
      "Themes bundle a desktop background, color scheme, sound scheme, and mouse cursor set into a single saved combination you can switch between instantly. Windows includes several built-in themes, and you can download more or save your own custom combination.",
    details: [
      "Apply a built-in theme (like Glow, Captured Motion, or Sunrise) with one click.",
      "Save your current background, color, and sound setup as a new custom theme.",
      "Download additional themes from the Microsoft Store's theme collection.",
      "Delete custom themes you no longer want from the theme list.",
    ],
    important:
      "Deleting a theme removes it from your list permanently, but any background images or sounds it used remain on your PC unless you delete those files separately.",
    redirectUrl: "ms-settings:themes",
    whyItMatters:
      "Themes save you from manually reconfiguring background, colors, and sounds every time you want to switch your PC's look for a season, mood, or shared-device profile. They're especially useful on shared family PCs where each person wants a distinctly different look without creating separate custom settings from scratch each time. Because a theme also includes a sound scheme, applying one changes not just how your PC looks but how it sounds during common interactions like errors and notifications.",
    bestPractices: [
      "Save your preferred combination as a named custom theme before experimenting with a downloaded one, so you can always revert.",
      "Check a downloaded theme's included background slideshow for very large image sets if you're on a metered connection, since it may download several images at once.",
      "Turn off the sound scheme in a theme individually if you like the visuals but find its notification sounds distracting.",
      "Clean up unused custom themes periodically to keep the theme list easy to scan.",
    ],
    commonIssues: [
      {
        issue: "A downloaded theme won't fully apply, missing sounds or cursors.",
        fix: "Confirm the theme pack finished downloading completely from the Microsoft Store before applying it, since a partial download can silently skip some components.",
      },
      {
        issue: "Applying a new theme unexpectedly changes your accent color.",
        fix: "Switch the accent color mode from 'Automatic' back to 'Manual' under Colors after applying the theme if you want to keep your own chosen color.",
      },
      {
        issue: "A custom theme disappeared from the list.",
        fix: "Custom themes are tied to your user profile, so this typically only happens after a profile reset or reinstall — recreate it by reapplying your preferred background, color, and sound combination and saving it again.",
      },
    ],
    faqs: [
      {
        q: "Do themes affect app appearance, or just Windows itself?",
        a: "Themes primarily control the desktop, window borders, and system sounds; most third-party apps use their own light/dark setting independent of your Windows theme.",
      },
      {
        q: "Can I share a custom theme with someone else?",
        a: "Yes, Windows lets you export a .deskthemepack file for a custom theme that another person can open on their own PC to apply the same combination.",
      },
      {
        q: "Are Microsoft Store themes free?",
        a: "The vast majority of official Microsoft theme packs are free downloads, though some third-party curated collections may be paid.",
      },
    ],
    tipsAndTricks: [
      "Search 'themes' directly in the Microsoft Store app to browse seasonal and photography-based theme packs Microsoft doesn't always surface in Settings.",
      "Pair a dark-toned theme with dark mode enabled under Colors for a fully consistent dark appearance across backgrounds and UI.",
    ],
    relatedSettingIds: ["windows-personalization", "windows-lock-screen", "sound-settings"],
    afterImageContent: {
      heading: "How Windows Themes Work",
      paragraphs: [
        "A theme is essentially a saved snapshot of your Background, Colors, Sounds, and Mouse cursor settings bundled together.",
        "Applying a theme instantly swaps all four of those settings at once instead of changing each individually.",
        "Themes downloaded from the Microsoft Store often include a matching slideshow of images along with a coordinated accent color.",
      ],
      steps: [
        "Open Settings → Personalization → Themes.",
        "Click a built-in theme to preview and apply it instantly.",
        "Adjust background, color, sound, or cursor individually if you want to customize further.",
        "Click 'Save theme' to store your current combination under a custom name.",
      ],
    },
  },
  {
    id: "windows-lock-screen",
    title: "Lock Screen",
    icon: Lock,
    platform: "windows",
    category: "personalization",
    controlType: "action",
    heading: "Customize the Lock Screen",
    description:
      "Lock Screen settings control the image, slideshow, or Windows Spotlight photo shown before you sign in, plus which apps can show quick status glances like unread email count or your next calendar event. It's the first thing you and anyone walking by sees on a locked PC.",
    details: [
      "Choose a single picture, a slideshow from a folder, or Windows Spotlight for rotating curated images.",
      "Pick which app shows detailed status (like Mail or Calendar) and which show only a small glance icon.",
      "Toggle whether the lock screen shows on the sign-in screen background too.",
      "Enable 'fun facts, tips, and more from Windows' if you want Spotlight trivia overlays.",
    ],
    important:
      "Detailed status apps on the lock screen can reveal private information, like unread email counts or upcoming calendar events, to anyone who can see your locked screen.",
    redirectUrl: "ms-settings:lockscreen",
    whyItMatters:
      "The lock screen is visible to anyone who glances at your PC while it's locked but not shut down, so what you choose to show there is a small but real privacy decision, not just a cosmetic one. Windows Spotlight is popular because it surfaces genuinely well-curated photography without any manual folder management, refreshing itself automatically. For shared or public-facing PCs, keeping detailed status apps turned off prevents passersby from seeing personal calendar or email previews without unlocking anything.",
    bestPractices: [
      "Turn off detailed status for Mail or Calendar on any PC other people might glance at, like a shared living room device.",
      "Use Windows Spotlight if you want fresh imagery without maintaining your own photo folder.",
      "Point a custom slideshow at a dedicated 'Lock screen photos' folder rather than your entire Pictures library, so private personal photos aren't included by accident.",
      "Disable the 'fun facts, tips, and more' overlay if you find Spotlight's occasional trivia captions distracting.",
    ],
    commonIssues: [
      {
        issue: "Windows Spotlight images repeat too often or don't change.",
        fix: "Confirm you're connected to the internet regularly, since Spotlight needs periodic connectivity to download new images, and check 'Get fun facts...' is enabled to force a refresh.",
      },
      {
        issue: "A slideshow folder shows a 'no suitable photos' error.",
        fix: "Make sure the selected folder contains at least a handful of standard image formats (JPG, PNG, BMP) and isn't empty or full of unsupported file types.",
      },
      {
        issue: "Sensitive calendar details are visible on the lock screen.",
        fix: "Go to 'Choose an app to show detailed status' and set it to 'None', or switch that specific app to only show a glance icon instead of full detail.",
      },
    ],
    faqs: [
      {
        q: "Does the lock screen picture also become my sign-in screen background?",
        a: "Only if you enable 'Show the lock screen background picture on the sign-in screen'; otherwise Windows uses a separate default sign-in background.",
      },
      {
        q: "Can I turn off Windows Spotlight completely?",
        a: "Yes, switch the background option to Picture or Slideshow instead of Windows Spotlight if you'd rather use your own images.",
      },
      {
        q: "Do lock screen settings apply to every user on a shared PC?",
        a: "No, lock screen background and app status settings are saved per user account, so each person signing into the same PC can configure their own.",
      },
    ],
    tipsAndTricks: [
      "Right-click a Windows Spotlight image on the lock screen and choose 'I like this image' or 'I don't like this image' to help Windows tune future picks.",
      "Use a slideshow limited to a small, curated folder so you don't wait through dozens of unrelated photos while unlocking.",
    ],
    relatedSettingIds: ["windows-personalization", "windows-themes", "windows-security"],
    afterImageContent: {
      heading: "How the Lock Screen Works",
      paragraphs: [
        "The lock screen appears whenever your PC is locked or first turned on, before you actually sign in with your PIN or password.",
        "Windows Spotlight downloads new curated images periodically when connected to the internet, giving you a different photo without any manual setup.",
        "App status icons on the lock screen pull live data, like unread count, without needing to unlock the PC first.",
      ],
      steps: [
        "Open Settings → Personalization → Lock screen.",
        "Choose Windows Spotlight, a Picture, or a Slideshow for the background.",
        "Select which app shows detailed status under 'Choose an app to show detailed status'.",
        "Toggle 'Show the lock screen background picture on the sign-in screen' if desired.",
      ],
    },
  },
  {
    id: "windows-taskbar",
    title: "Taskbar",
    icon: PanelBottom,
    platform: "windows",
    category: "personalization",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Customize the Taskbar",
    description:
      "Taskbar settings control which icons appear, how they're aligned, and which system tray items show by default. This is where you manage pinned apps, the search box, widgets, and corner icons like clock, network, and volume.",
    details: [
      "Align taskbar icons to the center (default) or left.",
      "Choose which system tray icons always show versus which stay hidden in the overflow menu.",
      "Toggle the search box, Task view, Widgets, and Chat buttons on or off.",
      "Turn on 'Automatically hide the taskbar' for more screen space.",
    ],
    important:
      "Some corner icons, like network or volume, can be individually hidden from the taskbar but will still be accessible through the hidden icons overflow arrow — hiding an icon does not disable the underlying feature.",
    redirectUrl: "ms-settings:taskbar",
    whyItMatters:
      "The taskbar is the part of Windows you interact with dozens of times a day, so small configuration choices here compound into real daily friction or convenience. Left-aligning the taskbar, for instance, is a meaningful workflow change for anyone coming from Windows 10, while auto-hide reclaims vertical screen space on smaller laptop displays. Getting system tray icon visibility right also means you can glance at battery, volume, or network status instantly instead of hunting through an overflow menu.",
    bestPractices: [
      "Switch to left alignment if you're used to older Windows versions and find center alignment disorienting.",
      "Keep frequently checked icons like battery, volume, and network set to always show rather than buried in overflow.",
      "Enable auto-hide only on smaller screens where the reclaimed space genuinely matters, since it adds a small delay each time you need the taskbar.",
      "Turn off taskbar elements you never use, like Widgets or Chat, to reduce visual clutter and accidental clicks.",
    ],
    commonIssues: [
      {
        issue: "An app's icon is missing from the system tray.",
        fix: "Click the small up-arrow to check the hidden icons overflow menu, or open 'Other system tray icons' in Settings and toggle that app's icon to always show.",
      },
      {
        issue: "Taskbar keeps auto-hiding when you don't want it to.",
        fix: "Turn off 'Automatically hide the taskbar' under Taskbar behaviors, since this setting is separate from any per-app fullscreen behavior.",
      },
      {
        issue: "Taskbar icons look too large or too small after a display or scaling change.",
        fix: "Toggle 'Use small taskbar buttons' under Taskbar behaviors, or adjust display scaling since taskbar icon size partly follows your overall scale setting.",
      },
    ],
    faqs: [
      {
        q: "Can I move the taskbar to the top or side of the screen like older Windows versions?",
        a: "Not through standard Settings in current Windows versions — the taskbar is locked to the bottom of the screen without third-party tools.",
      },
      {
        q: "Why did my pinned apps disappear after a Windows update?",
        a: "Major feature updates occasionally reset taskbar layout to defaults; re-pin your apps by right-clicking them in Start or File Explorer and choosing 'Pin to taskbar'.",
      },
      {
        q: "What's the difference between Task view and Widgets buttons?",
        a: "Task view shows all open windows and virtual desktops, while Widgets opens a personalized feed of news, weather, and calendar info — both can be hidden independently if you don't use them.",
      },
    ],
    tipsAndTricks: [
      "Middle-click a taskbar icon to open a new instance of that app instantly instead of right-clicking for a menu.",
      "Shift+click a taskbar icon to open a new window of an already-running app, useful for apps that otherwise just switch focus.",
      "Use Win+number (like Win+1) to launch or switch to the app pinned in that taskbar position.",
    ],
    relatedSettingIds: ["windows-start-menu", "windows-personalization", "notifications-settings"],
    afterImageContent: {
      heading: "How Taskbar Customization Works",
      paragraphs: [
        "The taskbar hosts pinned and running apps, system tray icons, and quick controls, and nearly every visible element can be toggled or repositioned from Settings.",
        "Taskbar alignment (center vs left) changes where the Start button and pinned icons sit, which matters most for anyone used to older Windows versions.",
        "System tray behavior is split between always-visible icons and an overflow menu accessed by clicking the small up-arrow.",
      ],
      steps: [
        "Open Settings → Personalization → Taskbar.",
        "Expand 'Taskbar items' to toggle Search, Task view, Widgets, and Chat.",
        "Expand 'Taskbar behaviors' to change alignment or enable auto-hide.",
        "Click 'Other system tray icons' to choose which icons always show.",
      ],
    },
  },
  {
    id: "windows-start-menu",
    title: "Start Menu",
    icon: Menu,
    platform: "windows",
    category: "personalization",
    controlType: "action",
    heading: "Customize the Start Menu",
    description:
      "Start menu settings let you control which folders appear next to the power button, how many pinned app rows and recommended file rows show, and whether recently added or most-used apps surface automatically. It's where you shape the layout you see every time you click Start.",
    details: [
      "Choose the layout balance between 'More pins' and 'More recommendations'.",
      "Toggle 'Show recently added apps' and 'Show most used apps'.",
      "Toggle 'Show recently opened items' for jump lists and the recommended section.",
      "Add folders like Documents, Downloads, or Settings next to the power button via 'Folders'.",
    ],
    important:
      "Turning off 'Show recently opened items' also disables jump lists (right-click recent file history) in the Start menu and taskbar, not just the recommended section.",
    redirectUrl: "ms-settings:personalization-start",
    whyItMatters:
      "The Start menu is often the very first thing you interact with after signing in, so its layout directly affects how quickly you reach the apps and files you actually need. Choosing more pins over recommendations suits people who organize their own app grid, while more recommendations helps people who mostly reopen recent documents. Adding folder shortcuts next to the power button turns Start into a faster launcher for File Explorer locations you'd otherwise dig for separately.",
    bestPractices: [
      "Choose 'More pins' if you deliberately organize a curated app grid, or 'More recommendations' if you mostly reopen recent files.",
      "Add Documents, Downloads, and Settings as folder shortcuts if you frequently jump to them.",
      "Turn off 'Show recently added apps' on a shared or work PC to avoid revealing what software was just installed.",
      "Unpin default apps you never use immediately after a fresh install to keep the pinned grid relevant.",
    ],
    commonIssues: [
      {
        issue: "Start menu shows apps or files you'd rather not have visible to others.",
        fix: "Turn off 'Show recently opened items in Start, Jump Lists, and File Explorer' under Personalization → Start.",
      },
      {
        issue: "Pinned app grid resets after a major Windows update.",
        fix: "Re-pin your preferred apps; major feature updates occasionally reset the Start layout to Microsoft's defaults.",
      },
      {
        issue: "Folder shortcuts next to the power button aren't showing.",
        fix: "Check that they're actually toggled on under Personalization → Start → Folders, since none are enabled by default besides File Explorer and Settings.",
      },
    ],
    faqs: [
      {
        q: "Can I resize the Start menu itself, not just the layout inside it?",
        a: "Yes, on Windows 11 you can drag the top edge of an expanded Start menu to make it taller, showing more pinned app rows.",
      },
      {
        q: "Does removing 'recommended' items delete my recent file history?",
        a: "No, it only hides them from the Start menu view; your actual recent files and jump list history in File Explorer are unaffected unless you separately clear that history.",
      },
      {
        q: "Why do some apps I never opened show up as 'most used'?",
        a: "Windows sometimes counts background launches, like a startup app opening automatically, toward usage frequency, which can surface apps you didn't manually open.",
      },
    ],
    tipsAndTricks: [
      "Drag and drop apps between folders in the pinned grid to create your own named app groups.",
      "Right-click any pinned app and choose 'Move to top' to keep your most-used shortcuts in the same spot every time.",
      "Press the Windows key and start typing immediately — Start's search works from any point in the menu without clicking the search box first.",
    ],
    relatedSettingIds: ["windows-taskbar", "windows-personalization", "default-apps"],
    afterImageContent: {
      heading: "How Start Menu Customization Works",
      paragraphs: [
        "The Start menu layout is split into a pinned apps grid and a 'Recommended' section showing recent files and suggested apps.",
        "The layout slider lets you shift emphasis toward more pinned app rows or more recommended content depending on how you use Start.",
        "Folder shortcuts next to the power button give one-click access to system locations without needing to pin them separately.",
      ],
      steps: [
        "Open Settings → Personalization → Start.",
        "Choose a layout under 'Layout: pins or recommendations'.",
        "Toggle recently added and most used app visibility.",
        "Click 'Folders' to choose which system folders appear next to Power.",
      ],
    },
  },
  {
    id: "windows-mouse",
    title: "Mouse",
    icon: Mouse,
    platform: "windows",
    category: "devices-peripherals",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Configure Mouse Settings",
    description:
      "Mouse settings control pointer speed, scroll behavior, primary button assignment, and additional pointer options for both wired and Bluetooth mice. This is where you fine-tune how the cursor responds to physical movement and clicks.",
    details: [
      "Swap the primary mouse button for left-handed use.",
      "Adjust how many lines scroll per wheel notch, or scroll one screen at a time.",
      "Set cursor speed and enable/disable 'Enhance pointer precision'.",
      "Choose whether inactive windows scroll when you hover over them without clicking.",
    ],
    important:
      "Enhance pointer precision applies acceleration that changes cursor speed based on how fast you physically move the mouse, which many gamers intentionally disable for consistent aim.",
    redirectUrl: "ms-settings:mousetouchpad",
    whyItMatters:
      "Mouse settings might look like minor preferences, but pointer precision and speed directly affect accuracy for everything from clicking small UI elements to competitive gaming. Enhance pointer precision in particular is a frequent point of confusion since it adds acceleration many creative and gaming users prefer off for predictable 1:1 movement. The primary button swap is also an accessibility essential for left-handed users, turning an off-the-shelf right-handed mouse into a fully usable left-handed one.",
    bestPractices: [
      "Disable 'Enhance pointer precision' if you play competitive games or do precise design work that benefits from consistent, non-accelerated movement.",
      "Set scroll wheel lines to a lower number if you frequently overshoot while scrolling through long documents.",
      "Swap the primary button early if you're left-handed, rather than adapting to a right-handed default.",
      "Test cursor speed changes by actually using the pointer for a few minutes rather than judging by the settings preview alone.",
    ],
    commonIssues: [
      {
        issue: "Cursor movement feels inconsistent or 'floaty' during precise tasks like design work.",
        fix: "Turn off 'Enhance pointer precision', since its acceleration curve can make identical physical movements produce different on-screen distances.",
      },
      {
        issue: "Scrolling jumps too many lines at once in documents or web pages.",
        fix: "Lower the 'Multiple lines at a time' value under Mouse → Scrolling to a smaller number for finer control.",
      },
      {
        issue: "A gaming mouse's extra buttons don't work as expected.",
        fix: "Install the manufacturer's dedicated software, since Windows' built-in Mouse settings only cover standard clicks, scroll, and pointer behavior, not custom side-button mapping.",
      },
    ],
    faqs: [
      {
        q: "Does 'Enhance pointer precision' make my mouse more accurate?",
        a: "Not necessarily — it adds acceleration so the cursor moves further when you move the mouse quickly, which some users find more natural and others find less predictable for precise work.",
      },
      {
        q: "Can I use different cursor speeds for different monitors?",
        a: "No, cursor speed is a single global setting that applies across all connected displays.",
      },
      {
        q: "Will these settings work the same for a Bluetooth mouse as a wired one?",
        a: "Yes, once paired, a Bluetooth mouse uses the exact same Mouse settings page as a wired USB mouse.",
      },
    ],
    tipsAndTricks: [
      "Hold Ctrl while scrolling in many apps, including File Explorer and browsers, to zoom instead of scroll — this is separate from the wheel line setting.",
      "Use the 'Additional mouse settings' link for legacy Control Panel options like double-click speed and pointer trail effects not exposed in the modern Settings page.",
    ],
    relatedSettingIds: ["windows-touchpad", "windows-keyboard", "display-settings"],
    afterImageContent: {
      heading: "How Mouse Settings Work",
      paragraphs: [
        "Windows applies your cursor speed and pointer precision settings globally across every app, not per-application.",
        "Scroll wheel behavior can be set to a fixed number of lines or a full screen per notch, and applies to the wheel's vertical scrolling specifically.",
        "The primary button swap remaps left and right click functions system-wide, useful for left-handed users without needing a different physical mouse.",
      ],
      steps: [
        "Open Settings → Bluetooth & devices → Mouse.",
        "Adjust the cursor speed slider to your preference.",
        "Toggle 'Enhance pointer precision' on or off.",
        "Set the number of lines to scroll per wheel notch under 'Scrolling'.",
      ],
    },
  },
  {
    id: "windows-keyboard",
    title: "Keyboard",
    icon: Keyboard,
    platform: "windows",
    category: "devices-peripherals",
    controlType: "action",
    heading: "Configure Keyboard & Typing Settings",
    description:
      "Keyboard settings cover autocorrect, text suggestions, and physical/touch keyboard behavior through the Typing settings page, alongside language-specific layout options managed under Language & region. This is where you tune how Windows interprets and assists your typing.",
    details: [
      "Turn autocorrect and text suggestions on or off for physical typing.",
      "Enable multilingual text suggestions if you type in more than one language.",
      "Configure the touch keyboard's appearance and behavior separately from the physical one.",
      "Adjust advanced keyboard settings, including a manual hardware keyboard layout override.",
    ],
    important:
      "Text suggestions and autocorrect only apply to apps that support Windows' built-in typing suggestions — many professional and coding apps intentionally opt out, so you won't see suggestions everywhere.",
    redirectUrl: "ms-settings:typing",
    whyItMatters:
      "Keyboard and typing settings quietly shape the accuracy of nearly everything you type, from catching typos in real time to correctly interpreting special characters on a non-US layout. Getting the hardware keyboard layout right matters especially for anyone using an imported or non-standard keyboard, since a mismatched layout produces the wrong characters for punctuation and symbols. For multilingual typists, enabling suggestions across languages avoids constantly fighting autocorrect meant for a different language.",
    bestPractices: [
      "Turn off autocorrect if you frequently type technical terms, code snippets, or names it keeps incorrectly 'fixing'.",
      "Enable multilingual text suggestions if you regularly switch between two or more installed languages.",
      "Override the hardware keyboard layout manually if symbols or punctuation keys produce the wrong characters.",
      "Check advanced keyboard settings after connecting an imported or unusual keyboard, since Windows may guess its layout incorrectly.",
    ],
    commonIssues: [
      {
        issue: "Certain keys produce the wrong symbol or punctuation mark.",
        fix: "Open 'Advanced keyboard settings' and manually override the hardware keyboard layout instead of relying on Windows' automatic detection.",
      },
      {
        issue: "Autocorrect keeps changing intentional technical terms or names.",
        fix: "Turn off 'Autocorrect misspelled words' under Typing settings, or add the term to your custom dictionary if the app supports it.",
      },
      {
        issue: "Touch keyboard doesn't appear when tapping a text field on a touchscreen device.",
        fix: "Check that the touch keyboard is enabled under Typing → touch keyboard settings, and confirm it isn't manually disabled via the taskbar's touch keyboard icon settings.",
      },
    ],
    faqs: [
      {
        q: "Where do I change my actual keyboard layout, like switching from QWERTY to a different language layout?",
        a: "That's managed under Settings → Time & language → Language & region, by adding or selecting the input language and its associated keyboard layout.",
      },
      {
        q: "Does turning off text suggestions also disable spell-check everywhere?",
        a: "No, spell-check in specific apps like Word or a browser is usually controlled by that app's own settings, separate from the system-wide typing suggestions toggle.",
      },
      {
        q: "Can I use a different keyboard layout for each installed language?",
        a: "Yes, each installed language can have its own default keyboard layout, and you can switch between them with Win+Space.",
      },
    ],
    tipsAndTricks: [
      "Use Win+H anywhere text can be entered to dictate text using voice typing instead of the physical keyboard.",
      "Check 'Advanced keyboard settings' for the option to set an input method per app window rather than switching globally every time.",
    ],
    relatedSettingIds: ["windows-mouse", "language-region", "windows-touchpad"],
    afterImageContent: {
      heading: "How Keyboard & Typing Settings Work",
      paragraphs: [
        "Typing settings apply system-wide autocorrect and suggestion behavior wherever Windows' built-in text input handling is used.",
        "The physical keyboard layout itself is tied to your installed input language, managed separately under Language & region.",
        "Advanced keyboard settings let you override the detected hardware layout if Windows guesses it incorrectly.",
      ],
      steps: [
        "Open Settings → Time & language → Typing.",
        "Toggle autocorrect and highlight misspelled words.",
        "Enable multilingual text suggestions if needed.",
        "Open 'Advanced keyboard settings' to override the hardware layout if it's detected incorrectly.",
      ],
    },
  },
  {
    id: "windows-touchpad",
    title: "Touchpad",
    icon: Touchpad,
    platform: "windows",
    category: "devices-peripherals",
    controlType: "action",
    heading: "Configure Touchpad Settings",
    description:
      "Touchpad settings let you adjust sensitivity, enable or disable tap-to-click, and configure multi-finger gestures for switching apps, virtual desktops, and zooming. These options only appear on laptops with a built-in precision touchpad.",
    details: [
      "Turn the touchpad off entirely, or automatically disable it when a mouse is connected.",
      "Adjust touchpad sensitivity from most sensitive to least sensitive.",
      "Enable or disable tap-to-click and configure two, three, and four-finger gestures.",
      "Customize what each multi-finger swipe does, like switching desktops or opening Task view.",
    ],
    important:
      "The full gesture customization panel and sensitivity slider only appear for laptops with a genuine Windows Precision Touchpad; older non-precision touchpads show a much more limited settings page and rely on the manufacturer's own driver software instead.",
    redirectUrl: "ms-settings:devices-touchpad",
    whyItMatters:
      "Touchpad configuration directly affects how natural navigating a laptop feels day to day, and the wrong sensitivity setting is one of the most common sources of accidental clicks or an unresponsive-feeling trackpad. Multi-finger gestures, once learned, can meaningfully speed up switching between apps and virtual desktops without ever touching the keyboard or a mouse. Because gesture support depends on having a genuine Precision Touchpad, checking this page is also a quick way to confirm whether your laptop's trackpad hardware supports the newer gesture set at all.",
    bestPractices: [
      "Lower sensitivity if the palm of your hand triggers accidental clicks or cursor jumps while typing.",
      "Enable 'Automatically disable the touchpad when a mouse is connected' if you often plug in an external mouse and don't want the touchpad interfering.",
      "Learn the default three and four-finger gestures for Task view and virtual desktop switching, since they meaningfully speed up multitasking.",
      "Turn off tap-to-click if you find yourself triggering unwanted clicks while resting fingers on the pad.",
    ],
    commonIssues: [
      {
        issue: "Cursor jumps unexpectedly while typing.",
        fix: "Lower touchpad sensitivity, and confirm 'Tap to click' isn't triggering from incidental palm contact while your hands rest on the keyboard.",
      },
      {
        issue: "Multi-finger gestures stopped working after a Windows update.",
        fix: "Check that your laptop's touchpad driver is up to date via Windows Update or the manufacturer's site, since a driver update sometimes resets gesture settings to default.",
      },
      {
        issue: "Touchpad settings page shows very limited options compared to expected.",
        fix: "Your touchpad may not be a Windows Precision Touchpad; check the manufacturer's own touchpad utility software for extended gesture and sensitivity options instead.",
      },
    ],
    faqs: [
      {
        q: "Why don't I see gesture customization options at all?",
        a: "Your laptop's touchpad hardware may not support Windows Precision Touchpad drivers; in that case gestures and detailed settings are managed by the manufacturer's own trackpad software instead.",
      },
      {
        q: "Can I completely disable the touchpad while using an external mouse?",
        a: "Yes, enable 'Automatically disable the touchpad when a mouse is connected' so it stops responding whenever a mouse is plugged in or paired.",
      },
      {
        q: "Do touchpad gestures work the same across every laptop brand?",
        a: "The core Windows-defined gestures work consistently on any genuine Precision Touchpad, though some manufacturers add extra proprietary gestures through their own software layered on top.",
      },
    ],
    tipsAndTricks: [
      "Swipe three fingers up to open Task view, and three fingers left or right to switch between virtual desktops, both without touching the keyboard.",
      "Pinch with two fingers to zoom in supported apps like Photos and most web browsers, the same as a touchscreen pinch gesture.",
    ],
    relatedSettingIds: ["windows-mouse", "windows-keyboard", "power-sleep"],
    afterImageContent: {
      heading: "How Touchpad Gestures Work",
      paragraphs: [
        "Windows Precision Touchpads report raw finger position data directly to Windows, letting the OS handle gestures natively instead of relying on manufacturer driver software.",
        "Multi-finger gestures are mapped to system actions like Task view, virtual desktop switching, and Show Desktop by default, but each can be reassigned.",
        "Sensitivity settings change how much pressure or movement is needed before the touchpad registers a tap or drag.",
      ],
      steps: [
        "Open Settings → Bluetooth & devices → Touchpad.",
        "Adjust the sensitivity slider if taps register too easily or not easily enough.",
        "Toggle 'Tap to click' and 'Tap with two fingers to right-click' as needed.",
        "Expand 'Three-finger gestures' and 'Four-finger gestures' to customize swipe actions.",
      ],
    },
  },
  {
    id: "windows-pen-ink",
    title: "Pen & Windows Ink",
    icon: PenTool,
    platform: "windows",
    category: "devices-peripherals",
    controlType: "action",
    heading: "Configure Pen & Windows Ink Settings",
    description:
      "Pen settings control how Windows responds to a stylus on touchscreen devices, including which hand you write with, shortcut actions for the pen's button, and the Windows Ink Workspace for sketching and screen annotation. This only appears on devices with pen/stylus support.",
    details: [
      "Set whether you write with your right or left hand to adjust palm-rejection behavior.",
      "Assign actions to the pen's button, like single-click, double-click, and press-and-hold.",
      "Enable or disable the Windows Ink Workspace icon in the taskbar.",
      "Adjust handwriting personalization so recognition improves for your specific writing style.",
    ],
    important:
      "Palm rejection quality depends heavily on your pen and screen hardware working together correctly — even correct handedness settings may not fully prevent accidental palm touches on some older digitizer hardware.",
    redirectUrl: "ms-settings:pen",
    whyItMatters:
      "For anyone using a 2-in-1 laptop, tablet, or drawing display, pen settings determine whether writing and sketching feel natural or constantly interrupted by accidental palm touches. Assigning a useful action to the pen's button, like launching Snip & Sketch, turns the stylus into a much faster tool for quick annotations and screenshots. Handwriting personalization specifically pays off over time, since Windows genuinely gets better at reading your particular handwriting the more samples it has.",
    bestPractices: [
      "Set your correct handedness immediately when first setting up a new pen-enabled device, since it directly affects palm rejection accuracy.",
      "Assign the pen button's double-click to a frequently used action like Snip & Sketch instead of leaving it on the default.",
      "Run through the handwriting personalization exercises if you take handwritten notes often, since recognition accuracy improves noticeably afterward.",
      "Keep the Windows Ink Workspace icon visible in the taskbar if you regularly use sketch notes or screen annotation.",
    ],
    commonIssues: [
      {
        issue: "The screen registers your palm as touch input while writing.",
        fix: "Confirm handedness is set correctly under Pen settings, and check that palm rejection is supported and enabled in your device manufacturer's pen driver software.",
      },
      {
        issue: "Pen button shortcuts don't do anything when pressed.",
        fix: "Reassign the action under Pen & Windows Ink settings, since a pen or driver update can occasionally reset button actions to 'Nothing'.",
      },
      {
        issue: "Handwriting recognition consistently misreads certain letters.",
        fix: "Redo the handwriting personalization training samples specifically for the letters or symbols it keeps misreading.",
      },
    ],
    faqs: [
      {
        q: "Does every laptop support Windows Ink?",
        a: "No, Windows Ink and pen settings only appear on devices with a compatible touchscreen and stylus, typically 2-in-1s, tablets, and dedicated drawing displays.",
      },
      {
        q: "Can I use a third-party stylus, or does it need to be the manufacturer's own pen?",
        a: "Many third-party styluses work as basic touch input, but full pressure sensitivity and button shortcuts usually require a pen matching your device's specific digitizer technology.",
      },
      {
        q: "What's the difference between the Windows Ink Workspace and just writing directly in an app?",
        a: "The Ink Workspace is a quick-launch panel for sketch notes, whiteboard, and screen sketching tools, while writing directly in a supporting app (like OneNote) uses that app's own ink handling instead.",
      },
    ],
    tipsAndTricks: [
      "Use Win+Shift+S with a pen to trigger Snip & Sketch and annotate a screenshot immediately with ink.",
      "Try pressing and holding the pen button as a shortcut to open a blank Whiteboard canvas for quick sketches during a call.",
    ],
    relatedSettingIds: ["windows-mouse", "windows-touchpad", "display-settings"],
    afterImageContent: {
      heading: "How Pen & Windows Ink Works",
      paragraphs: [
        "Windows Ink lets a compatible pen interact directly with the screen for handwriting, sketching, and annotating documents or screenshots.",
        "The pen's physical button can trigger a configurable shortcut, like opening a blank Whiteboard note or taking a screen snip, without touching the screen first.",
        "Handwriting recognition improves over time as Windows learns your specific stroke patterns through the personalization feature.",
      ],
      steps: [
        "Open Settings → Bluetooth & devices → Pen & Windows Ink.",
        "Set whether you're right or left-handed for palm rejection.",
        "Configure single-click, double-click, and press-and-hold pen button actions.",
        "Open 'Handwriting personalization' to train recognition on your writing style.",
      ],
    },
  },
  {
    id: "windows-printers-scanners",
    title: "Printers & Scanners",
    icon: Printer,
    platform: "windows",
    category: "devices-peripherals",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Manage Printers & Scanners",
    description:
      "Printers & Scanners settings let you add, remove, and manage printing and scanning devices connected via USB, network, or Bluetooth. From here you can set a default printer, view print queues, and run scans directly from connected multi-function devices.",
    details: [
      "Add a new printer or scanner automatically, or manually by IP address for network devices.",
      "Set a specific printer as default, or let Windows manage it automatically based on recent use.",
      "Open the print queue to pause, cancel, or reorder pending print jobs.",
      "Run the printer troubleshooter directly from a device's settings page if it stops responding.",
    ],
    important:
      "'Let Windows manage my default printer' automatically switches your default to whichever printer you used most recently, which can be surprising if you occasionally print to a different device than usual.",
    redirectUrl: "ms-settings:printers",
    whyItMatters:
      "Printer configuration is one of the more persistently frustrating parts of using a PC, and this settings page is the first stop for both setting up a new device and troubleshooting one that's stopped responding. Getting the default printer right avoids the common annoyance of documents silently printing to the wrong device, especially in homes or offices with more than one printer. Because scanning shares the same underlying device list, keeping printer entries current also keeps scanning functional without needing separate configuration.",
    bestPractices: [
      "Turn off 'Let Windows manage my default printer' if you consistently use the same printer and don't want it to switch automatically.",
      "Remove old or disconnected printer entries so the device list and default printer selection stay accurate.",
      "Use the manufacturer's full driver package instead of the generic Windows driver if you need advanced features like duplex printing or ink-level monitoring.",
      "Clear a stuck print queue promptly, since a jammed job can block every subsequent print request to that printer.",
    ],
    commonIssues: [
      {
        issue: "A print job is stuck and nothing else will print to that printer.",
        fix: "Open the print queue for that printer, cancel the stuck job, and if it won't clear, restart the Print Spooler service via services.msc.",
      },
      {
        issue: "Windows keeps switching the default printer unexpectedly.",
        fix: "Turn off 'Let Windows manage my default printer' under Printers & scanners settings and manually select your preferred default instead.",
      },
      {
        issue: "A network printer shows offline even though it's powered on.",
        fix: "Confirm the printer and PC are on the same network, then remove and re-add the printer, or run the built-in printer troubleshooter from its device page.",
      },
    ],
    faqs: [
      {
        q: "Why does scanning open a different app than the printer settings page?",
        a: "Windows Scan is a separate app for the actual scanning workflow, but it pulls its device list from the same scanners configured under Printers & scanners settings.",
      },
      {
        q: "Can I print to a printer that's connected to someone else's PC on the network?",
        a: "Yes, if that PC has printer sharing enabled and your network profile is set to Private, you can add their shared printer from your own device list.",
      },
      {
        q: "Do I need to install manufacturer software, or does Windows handle everything?",
        a: "Windows' built-in drivers handle basic printing for most modern printers, but manufacturer software often unlocks extra features like ink-level monitoring, advanced scanning modes, or wireless setup wizards.",
      },
    ],
    tipsAndTricks: [
      "Use 'Add a Bluetooth, wireless, or network-discoverable printer' if a printer isn't found automatically the first time.",
      "Right-click a printer in the device list and choose 'Printer properties' for advanced options like paper size defaults and print quality that aren't in the main Settings page.",
    ],
    relatedSettingIds: ["bluetooth-settings", "wifi-connection", "windows-security"],
    afterImageContent: {
      heading: "How Printer & Scanner Management Works",
      paragraphs: [
        "Windows automatically discovers printers and scanners on the same network or connected directly via USB or Bluetooth.",
        "Each added device gets its own driver and queue, letting you manage print jobs independently per printer.",
        "Scanning from a multi-function printer uses the Windows Scan app, which pulls directly from the same device list configured here.",
      ],
      steps: [
        "Open Settings → Bluetooth & devices → Printers & scanners.",
        "Click 'Add device' and select your printer or scanner from the discovered list.",
        "Set your preferred default printer, or leave Windows to manage it automatically.",
        "Click a specific printer and select 'Open print queue' to manage pending jobs.",
      ],
    },
  },
  {
    id: "windows-vpn",
    title: "VPN",
    icon: Globe,
    platform: "windows",
    category: "connectivity-network",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Manage VPN Connections",
    description:
      "VPN settings let you add, connect, and manage Virtual Private Network profiles for securely routing your traffic through a work, school, or personal VPN server. This is where you configure server details, sign-in info, and whether the VPN connects automatically.",
    details: [
      "Add a VPN profile manually or import one provided by your organization's IT department.",
      "Choose the VPN type (like IKEv2, L2TP, or PPTP) to match what the server requires.",
      "Enable 'Allow VPN over metered networks' if you need it to connect on mobile data.",
      "Set a VPN to connect automatically whenever you're not on your trusted network.",
    ],
    important:
      "A VPN app installed from a third-party provider (like a consumer privacy VPN) usually manages its own connection outside this Settings page — this panel primarily covers manually configured or IT-provided VPN profiles.",
    redirectUrl: "ms-settings:network-vpn",
    whyItMatters:
      "VPN configuration matters most for remote work, since many company resources are only reachable once you're connected through the corporate VPN, and for anyone concerned about privacy on public networks. A correctly configured VPN profile encrypts your traffic end-to-end, which is especially relevant on untrusted networks like airport or cafe WiFi. Getting the protocol and server details wrong is one of the most common reasons remote employees can't reach internal company systems, so this panel is often the first troubleshooting stop for that exact problem.",
    bestPractices: [
      "Get the exact server address, VPN type, and authentication method from your IT department rather than guessing, since a mismatched protocol simply fails to connect.",
      "Enable 'Allow VPN over metered networks' if you need reliable access while tethered to a phone's mobile data.",
      "Set the VPN to connect automatically for work profiles you use daily, to avoid forgetting to enable it before accessing internal resources.",
      "Remove old or unused VPN profiles, especially ones tied to a former employer or expired subscription.",
    ],
    commonIssues: [
      {
        issue: "VPN connection fails immediately after entering credentials.",
        fix: "Double check the VPN type matches exactly what the server expects (IKEv2 vs L2TP vs SSTP, for example), since a mismatched protocol is one of the most common causes of an immediate failure.",
      },
      {
        issue: "VPN connects but you can't reach internal company resources.",
        fix: "Confirm split-tunneling or DNS settings with your IT department, since a successful VPN connection doesn't guarantee correct internal DNS resolution is also configured.",
      },
      {
        issue: "VPN won't connect over a mobile hotspot or cellular data.",
        fix: "Enable 'Allow VPN over metered networks' in the VPN's advanced options, since Windows blocks some VPN traffic on metered connections by default.",
      },
    ],
    faqs: [
      {
        q: "Is the built-in Windows VPN client the same as a commercial VPN app like a privacy service?",
        a: "No, this panel manages manually configured or IT-provided VPN profiles; most commercial consumer VPN services install their own dedicated app that manages the connection separately.",
      },
      {
        q: "Does a VPN slow down my internet connection?",
        a: "Usually somewhat, since encrypting and routing traffic through a remote server adds overhead, though the impact varies depending on the VPN server's location and load.",
      },
      {
        q: "Can I have more than one VPN profile and switch between them?",
        a: "Yes, you can add multiple VPN profiles, for example one for work and one for personal use, and connect to only one at a time from the network icon or VPN settings.",
      },
    ],
    tipsAndTricks: [
      "Click the network icon in the taskbar for a quick VPN connect/disconnect toggle instead of opening full Settings each time.",
      "Check 'Advanced options' on a VPN profile for per-connection proxy settings if your organization requires a specific proxy configuration alongside the VPN.",
    ],
    relatedSettingIds: ["wifi-connection", "network-reset", "windows-mobile-hotspot"],
    afterImageContent: {
      heading: "How VPN Connections Work",
      paragraphs: [
        "A VPN profile encrypts your traffic and routes it through a remote server, masking your actual location and network from sites and services you connect to.",
        "Windows supports several VPN protocols, and the correct one must match what your VPN server or provider requires to establish a connection.",
        "Once configured, a VPN profile can be set to connect automatically or manually toggled from the network icon in the taskbar.",
      ],
      steps: [
        "Open Settings → Network & internet → VPN.",
        "Click 'Add VPN' and enter the connection name, server address, and VPN type.",
        "Enter your sign-in credentials or select the appropriate authentication method.",
        "Click the new VPN profile and select 'Connect' to test it.",
      ],
    },
  },
  {
    id: "windows-mobile-hotspot",
    title: "Mobile Hotspot",
    icon: RadioTower,
    platform: "windows",
    category: "connectivity-network",
    controlType: "action",
    heading: "Manage Mobile Hotspot",
    description:
      "Mobile Hotspot lets you share your PC's internet connection (WiFi, Ethernet, or cellular) with other nearby devices over WiFi, Bluetooth, or a USB cable. It's useful for sharing a wired connection with a phone, or a cellular data plan with a laptop that lacks its own SIM.",
    details: [
      "Choose which connection to share, like WiFi or Ethernet, if more than one is available.",
      "Set a custom network name and password for the hotspot other devices will connect to.",
      "Choose the sharing method: WiFi, Bluetooth, or USB, depending on device compatibility.",
      "Enable 'Turn off hotspot automatically when no devices are connected' to save battery.",
    ],
    important:
      "Sharing a metered cellular connection through Mobile Hotspot can burn through a mobile data cap quickly if connected devices run large downloads or updates in the background.",
    redirectUrl: "ms-settings:network-mobilehotspot",
    whyItMatters:
      "Mobile Hotspot is a genuinely useful fallback when a hotel or venue only offers a single wired Ethernet connection but you need WiFi for a phone or tablet, or when your laptop has a cellular SIM you want to share with a nearby device that doesn't. It turns a single internet connection into a shared one without needing a dedicated travel router. Understanding the metered-connection warning matters most for anyone sharing cellular data, since forgetting it's on can unexpectedly consume a data cap through background updates on connected devices.",
    bestPractices: [
      "Set a strong, unique hotspot password rather than leaving the auto-generated one if you'll be sharing it verbally in a public space.",
      "Enable 'Turn off hotspot automatically when no devices are connected' to avoid unnecessarily draining battery on a laptop.",
      "Choose Ethernet as the shared connection when available, since sharing over WiFi both hosts the hotspot and uses that same adapter to receive the source connection.",
      "Keep an eye on data usage if sharing a cellular connection, especially with devices that auto-update in the background.",
    ],
    commonIssues: [
      {
        issue: "Mobile Hotspot won't turn on at all.",
        fix: "Confirm you actually have an active internet connection to share first, since Windows won't enable the hotspot without a working source connection selected.",
      },
      {
        issue: "Devices connect to the hotspot but have no internet access.",
        fix: "Check that the correct source connection is selected under 'Share my internet connection from', since it may be pointed at an inactive adapter.",
      },
      {
        issue: "Sharing over WiFi disconnects your own PC from its WiFi network.",
        fix: "Share your Ethernet connection instead if available, or accept that WiFi-sharing mode uses your WiFi adapter to broadcast rather than receive, which some hardware can't do simultaneously.",
      },
    ],
    faqs: [
      {
        q: "Does using Mobile Hotspot use more of my data plan than normal?",
        a: "No more than the connected devices would use on their own, but you're now responsible for tracking combined usage across every device instead of just your PC.",
      },
      {
        q: "Can I use Mobile Hotspot to share a VPN connection?",
        a: "Generally no — a VPN's encrypted tunnel exists at the app or system level on the sharing PC and typically isn't extended automatically to devices connected through the hotspot.",
      },
      {
        q: "How many devices can connect to a Windows Mobile Hotspot at once?",
        a: "Windows supports up to 8 connected devices at a time, though actual usable speed and stability depend heavily on your PC's hardware and the strength of the shared source connection.",
      },
    ],
    tipsAndTricks: [
      "Click the network icon in the taskbar for a quick Mobile Hotspot toggle instead of opening full Settings every time.",
      "Rename the hotspot to something recognizable if you frequently connect multiple personal devices to it, so it's easy to pick out among nearby networks.",
    ],
    relatedSettingIds: ["wifi-connection", "windows-vpn", "network-reset"],
    afterImageContent: {
      heading: "How Mobile Hotspot Works",
      paragraphs: [
        "Mobile Hotspot turns your PC's existing internet connection into a shareable WiFi network, Bluetooth connection, or wired USB link for other devices.",
        "Windows creates a virtual wireless access point using your WiFi adapter when sharing over WiFi, which briefly disconnects your own WiFi if it's the connection being shared out.",
        "Connected devices see the hotspot as a normal WiFi network and use the custom name and password you configure.",
      ],
      steps: [
        "Open Settings → Network & internet → Mobile hotspot.",
        "Choose which connection to share from the 'Share my internet connection from' dropdown.",
        "Set a network name and password under 'Properties'.",
        "Turn on 'Mobile hotspot' and connect your other device using the displayed credentials.",
      ],
    },
  },
  // --- 13 additional Windows entries: apps & features, accessibility, privacy, system info ---
  {
    id: "windows-apps",
    title: "Apps & Features",
    icon: Package,
    platform: "windows",
    category: "apps-features",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Manage Installed Apps",
    description:
      "Apps & Features lists every application installed on your PC, including size, install date, and whether it came from the Microsoft Store or a traditional installer. From here you can uninstall software you no longer need, modify or repair certain apps, and move installed apps to a different drive to free up space on your main disk.",
    details: [
      "Sort the app list by name, size, or install date to find what's taking up space or hasn't been used in a while.",
      "Click an app's three-dot menu (or click it directly) to see Uninstall, Modify, and Move options where available.",
      "Not every app supports 'Modify' or 'Move' — many simple Store apps only offer Uninstall.",
      "Use the search box at the top of the list to jump straight to a specific app instead of scrolling.",
    ],
    important:
      "Uninstalling an app removes its program files but can leave behind configuration folders and registry entries, which matters if you're troubleshooting a corrupted install by reinstalling from scratch.",
    redirectUrl: "ms-settings:appsfeatures",
    whyItMatters:
      "Apps & Features is the most direct way to see exactly what's installed on your PC and reclaim disk space from software you no longer use, without hunting through the old Control Panel. It's also the first stop for repairing a misbehaving app before resorting to a full uninstall and reinstall, since some apps expose a 'Modify' or 'Repair' option here that fixes corrupted files without losing your settings. Keeping this list trimmed down also reduces the number of background services and startup hooks competing for resources.",
    bestPractices: [
      "Sort by size periodically to spot large apps you installed once and forgot about.",
      "Try 'Modify' or 'Repair' before uninstalling and reinstalling an app that's behaving oddly, since it's faster and preserves saved settings.",
      "Move large apps like games to a secondary drive if your main drive is filling up and the app supports it.",
      "Uninstall trial software and bundled utilities that came preinstalled on a new PC if you don't use them.",
      "Check an app's publisher name before uninstalling something unfamiliar, since some system-critical components appear in this list too.",
    ],
    commonIssues: [
      {
        issue: "An app's Uninstall button is greyed out.",
        fix: "The app may be a required system component or installed for all users by an administrator — try uninstalling from an elevated (Run as administrator) context, or check if it's managed by your organization's IT policy.",
      },
      {
        issue: "Uninstalling an app doesn't free up as much space as expected.",
        fix: "Check for leftover user data folders under AppData, since most uninstallers remove program files but leave personal settings and cached data behind intentionally.",
      },
      {
        issue: "A preinstalled Windows app won't uninstall from this list.",
        fix: "Some built-in apps require PowerShell's 'Get-AppxPackage' and 'Remove-AppxPackage' cmdlets to remove, since they aren't exposed through the standard Uninstall button.",
      },
    ],
    faqs: [
      {
        q: "Does uninstalling an app here delete my documents created with it?",
        a: "No, personal files you created and saved yourself (like a Word document or a saved project) are stored separately and aren't touched by uninstalling the app that made them.",
      },
      {
        q: "Why do some apps show 'Move' as an option and others don't?",
        a: "Only apps installed to a drive-agnostic location, mostly Microsoft Store apps, support moving; traditional desktop installers often hard-code their install path and require a full uninstall/reinstall to change drives.",
      },
      {
        q: "Is it safe to uninstall apps I don't recognize?",
        a: "Research the publisher name first — many are legitimate drivers or utilities bundled with hardware, but if you truly don't need it and it's not a core Windows component, removing it is generally safe.",
      },
    ],
    tipsAndTricks: [
      "Use the sort-by-size view right after a Windows feature update to spot the 'Windows.old' backup and other large temporary leftovers.",
      "Right-click the Start button and choose 'Installed apps' as a quicker shortcut into this exact list.",
    ],
    relatedSettingIds: ["windows-optional-features", "windows-startup-apps", "storage-settings"],
    afterImageContent: {
      heading: "How Apps & Features Works",
      paragraphs: [
        "Windows scans both Microsoft Store apps and traditionally installed desktop programs to build a single combined list here.",
        "Uninstalling calls each app's own uninstaller behind the scenes, so the exact removal process varies slightly by app.",
        "Apps that support drive-agnostic installation can be moved between drives directly from this page without a full reinstall.",
      ],
      steps: [
        "Open Settings → Apps → Installed apps.",
        "Search or sort the list to find the app you want to manage.",
        "Click the three-dot menu next to the app.",
        "Choose Uninstall, Modify, or Move depending on what's available.",
      ],
    },
  },
  {
    id: "windows-optional-features",
    title: "Optional Features",
    icon: Puzzle,
    platform: "windows",
    category: "apps-features",
    controlType: "action",
    heading: "Add or Remove Optional Windows Features",
    description:
      "Optional Features lets you install additional Windows components that aren't part of the default setup, such as OpenSSH Client, additional language handwriting packs, or legacy tools like Windows Media Player. It's a separate list from Windows Features (the older 'Turn Windows features on or off' dialog), which handles larger platform components like Hyper-V or .NET Framework 3.5.",
    details: [
      "Click 'View features' or 'Add a feature' to browse available optional components.",
      "Search by name if you know the specific feature you need, like 'SSH' or 'Notepad'.",
      "Some features require a restart after installing or removing them.",
      "'More Windows features' at the bottom links to the older Control Panel-style dialog for deeper platform components.",
    ],
    important:
      "Removing an optional feature that another installed app depends on can break that app until you reinstall the feature, so confirm nothing relies on a component before removing it.",
    redirectUrl: "ms-settings:optionalfeatures",
    whyItMatters:
      "Optional Features is where you find developer and power-user tools Windows doesn't install by default, like the OpenSSH client for command-line remote connections, without needing a third-party download. It's also how you remove components you'll never use, like legacy apps that shipped with Windows years ago, to slightly reduce clutter and attack surface. Because some apps and scripts silently depend on a specific optional feature being present, this page is a common troubleshooting stop when a command-line tool or protocol suddenly stops working.",
    bestPractices: [
      "Search for the exact feature name before assuming it's not available — the list is long and not alphabetically obvious at a glance.",
      "Install the OpenSSH Client if you regularly connect to Linux servers or other machines via SSH from Command Prompt or PowerShell.",
      "Restart promptly after installing a feature that requests it, since some features don't fully register until the next boot.",
      "Leave features you don't recognize alone rather than removing them speculatively, since some support other installed software indirectly.",
    ],
    commonIssues: [
      {
        issue: "An 'ssh' command isn't recognized in PowerShell or Command Prompt.",
        fix: "Install 'OpenSSH Client' from Optional Features, since it isn't included by default on most Windows installations.",
      },
      {
        issue: "A feature shows as installed but doesn't seem to work.",
        fix: "Restart your PC — many optional features, especially ones touching system services, don't fully activate until after a reboot.",
      },
      {
        issue: "Can't find a feature like Hyper-V or .NET Framework 3.5 in this list.",
        fix: "Larger platform components live under 'More Windows features' (the classic Control Panel dialog) linked at the bottom of the Optional Features page, not in the main list itself.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Optional Features and 'Turn Windows features on or off'?",
        a: "Optional Features covers smaller add-ons like language tools and OpenSSH, while the older 'Turn Windows features on or off' dialog (reachable via 'More Windows features') handles larger platform subsystems like Hyper-V, WSL, and .NET Framework 3.5.",
      },
      {
        q: "Do I need an internet connection to add an optional feature?",
        a: "Usually yes, since most optional features are downloaded from Windows Update on demand rather than stored locally on the installation media.",
      },
      {
        q: "Will removing an optional feature free up much disk space?",
        a: "Generally not much for individual small features, though removing several unused language packs or legacy apps together can add up to a noticeable amount.",
      },
    ],
    tipsAndTricks: [
      "Install 'Notepad' explicitly here if a clean install removed the classic version you expected and you want the traditional experience back.",
      "Check 'Add a feature' periodically after major Windows updates, since Microsoft occasionally adds new optional components worth knowing about.",
    ],
    relatedSettingIds: ["windows-apps", "windows-update", "language-region"],
    afterImageContent: {
      heading: "How Optional Features Works",
      paragraphs: [
        "Optional Features pulls its component list and installers directly from Windows Update, so most additions require an active internet connection.",
        "Each feature is scoped narrowly, unlike the larger platform toggles found in the older 'Turn Windows features on or off' dialog.",
        "Some features integrate with command-line tools or specific apps and won't be noticeable in the interface until you actually use the related tool.",
      ],
      steps: [
        "Open Settings → Apps → Optional features.",
        "Click 'View features' or 'Add a feature'.",
        "Search for or select the feature you want to install.",
        "Click Next and Install, then restart if prompted.",
      ],
    },
  },
  {
    id: "windows-startup-apps",
    title: "Startup Apps",
    icon: Rocket,
    platform: "windows",
    category: "apps-features",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Manage Apps That Run at Startup",
    description:
      "Startup Apps controls which programs automatically launch in the background when you sign in to Windows. Each app is labeled with an impact rating (Low, Medium, or High) based on how much it slows down startup, so you can quickly identify and disable the ones actually worth turning off.",
    details: [
      "Toggle any listed app off to stop it from launching automatically at sign-in.",
      "Impact ratings are calculated from actual measured effect on boot time, not app size.",
      "Disabling an app here doesn't uninstall it — you can still open it manually anytime.",
      "Sort by 'Startup impact' to quickly find the worst offenders instead of scanning the whole list.",
    ],
    important:
      "Some apps you disable here re-enable themselves after their own update, so it's worth rechecking this list occasionally rather than assuming a one-time cleanup is permanent.",
    redirectUrl: "ms-settings:startupapps",
    whyItMatters:
      "Every app set to launch at startup adds to the time between pressing the power button and actually being able to use your PC, and background apps you never manually open are pure waste sitting in memory. This page turns a vague sense that 'my PC takes forever to start' into an actionable list ranked by real measured impact, rather than guesswork. Trimming genuinely unnecessary startup apps is one of the highest-value, lowest-risk performance tweaks available, since it costs nothing and doesn't remove any software.",
    bestPractices: [
      "Sort by 'Startup impact' and disable High-impact apps you don't need running the moment you sign in.",
      "Keep security software and sync clients like OneDrive enabled at startup, since delaying them defeats their purpose.",
      "Recheck this list after installing new software, since many installers add themselves to startup without asking.",
      "Disable an app here rather than uninstalling it if you still want to use it occasionally, just not automatically.",
    ],
    commonIssues: [
      {
        issue: "PC takes noticeably longer to become responsive after signing in.",
        fix: "Sort Startup Apps by impact and disable High-impact entries you don't need running immediately, especially ones you rarely open manually.",
      },
      {
        issue: "A disabled app keeps reappearing as enabled after updates.",
        fix: "Some apps silently re-register themselves at startup during their own update process — disable it again, or check that app's own settings for a 'launch at startup' option to turn off at the source.",
      },
      {
        issue: "An app isn't listed here even though it clearly launches at sign-in.",
        fix: "Some startup entries are registered through Task Scheduler or a Windows service rather than the standard startup mechanism, and won't appear on this page — check Task Scheduler's Task Scheduler Library for scheduled logon triggers instead.",
      },
    ],
    faqs: [
      {
        q: "Does disabling a startup app close it permanently?",
        a: "No, it only stops the app from launching automatically when you sign in — you can still open it manually anytime the same way you always would.",
      },
      {
        q: "How is the startup impact rating calculated?",
        a: "Windows measures the actual CPU and disk usage each app causes during the startup window over recent boots, rather than estimating it from the app's installed size.",
      },
      {
        q: "Why did an app I disabled start launching at startup again?",
        a: "Software updates occasionally re-register an app's startup entry without asking, so it's worth periodically rechecking this list, especially after updating frequently-used apps.",
      },
    ],
    tipsAndTricks: [
      "Cross-check High-impact apps here against Task Manager's Startup tab (Ctrl+Shift+Esc), which shows the same list with a slightly different layout some people find easier to scan.",
      "Disable startup entries for apps you only use occasionally rather than daily, keeping true background essentials like antivirus and cloud sync enabled.",
    ],
    relatedSettingIds: ["windows-apps", "power-sleep", "system-restart"],
    afterImageContent: {
      heading: "How Startup Apps Works",
      paragraphs: [
        "Windows tracks every app registered to launch automatically at sign-in and measures its real effect on your boot time.",
        "Impact ratings update over time as Windows gathers more data across your actual startup sessions.",
        "Disabling an entry here only removes its automatic launch trigger — the app itself remains fully installed and usable.",
      ],
      steps: [
        "Open Settings → Apps → Startup.",
        "Sort the list by 'Startup impact' if available.",
        "Toggle off any app you don't need launching automatically.",
        "Restart your PC to confirm the change takes effect.",
      ],
    },
  },
  {
    id: "windows-accessibility",
    title: "Accessibility",
    icon: Accessibility,
    platform: "windows",
    category: "accessibility-language",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Configure Accessibility Features",
    description:
      "Accessibility settings (renamed from Ease of Access in earlier Windows versions) bring together vision, hearing, and interaction tools like Magnifier, Narrator, high contrast themes, live captions, and Sticky Keys. These features are designed to make Windows usable regardless of visual, auditory, or mobility needs, but many are genuinely useful for anyone.",
    details: [
      "Enable Magnifier to zoom into any part of the screen with a keyboard shortcut.",
      "Turn on Narrator for a full screen-reader experience that reads interface elements and text aloud.",
      "Enable Live captions to generate real-time captions for any audio playing on your PC, even without built-in subtitles.",
      "Configure Sticky Keys, Filter Keys, or Toggle Keys under Keyboard for alternative input handling.",
    ],
    important:
      "Some accessibility features, particularly Narrator and high contrast themes, change keyboard shortcuts and visual layout significantly enough that apps you use daily may look or behave differently until you adjust.",
    redirectUrl: "ms-settings:easeofaccess",
    whyItMatters:
      "Accessibility features remove real barriers for people with visual, hearing, or motor impairments, but several of them, like Live captions and Magnifier, are also genuinely handy for anyone in a noisy room or reading fine print on a small screen. Because these tools are built into Windows itself, they work consistently across every app without needing separate paid software. Knowing this hub exists means you can quickly turn on exactly the accommodation you need, whether that's temporary (captions in a loud cafe) or a permanent daily necessity.",
    bestPractices: [
      "Learn the Magnifier shortcut (Win + Plus) even if you don't use it daily, since it's useful for reading fine print or checking pixel-level detail occasionally.",
      "Turn on Live captions before watching a video in a quiet public space instead of relying on the video's own subtitle support, which isn't always available.",
      "Test high contrast themes if you find default color schemes hard to read, rather than assuming standard display settings are your only option.",
      "Set up Sticky Keys if pressing multiple keys simultaneously (like Ctrl+Alt+Delete) is physically difficult.",
    ],
    commonIssues: [
      {
        issue: "Narrator starts unexpectedly and reads everything aloud.",
        fix: "Press Ctrl+Win+Enter to toggle Narrator off quickly, since that's the default shortcut that also turns it on, and it's easy to trigger accidentally.",
      },
      {
        issue: "Live captions don't appear during a video call.",
        fix: "Confirm Live captions is turned on from Accessibility settings or its own keyboard shortcut, and check that the caption window isn't minimized or positioned off-screen on a multi-monitor setup.",
      },
      {
        issue: "High contrast mode makes some apps look broken or unreadable.",
        fix: "Older or poorly updated apps sometimes don't fully support high contrast theming — try a different high contrast theme variant, or disable it only when using that specific app.",
      },
    ],
    faqs: [
      {
        q: "Do accessibility features slow down my PC?",
        a: "Most, like Magnifier or captions, use minimal resources; Narrator uses slightly more while actively reading, but none meaningfully affect general performance when turned off.",
      },
      {
        q: "Can I use Live captions without an internet connection?",
        a: "Yes, once the caption language pack has been downloaded once, Live captions processes audio locally and works fully offline.",
      },
      {
        q: "Is Narrator the same as third-party screen readers like JAWS or NVDA?",
        a: "Narrator is Microsoft's built-in screen reader and covers most everyday needs at no cost, though some users with more advanced requirements still prefer dedicated third-party screen readers for specific compatibility reasons.",
      },
    ],
    tipsAndTricks: [
      "Use Win+Ctrl+C to quickly toggle color filters on or off if you've configured one for color blindness support.",
      "Combine Live captions with the 'caption position' setting to keep captions from covering important parts of a shared screen during a call.",
    ],
    relatedSettingIds: ["language-region", "display-settings", "sound-settings"],
    afterImageContent: {
      heading: "How Accessibility Settings Work",
      paragraphs: [
        "Accessibility brings together tools for vision, hearing, interaction, and cognition into a single settings category, each independently configurable.",
        "Most accessibility features work system-wide, layering on top of whatever app is currently open rather than needing per-app setup.",
        "Live captions and Narrator both use on-device processing after their initial setup, so they continue working without an internet connection.",
      ],
      steps: [
        "Open Settings → Accessibility.",
        "Choose a category like Vision, Hearing, or Interaction.",
        "Toggle the specific feature you need, such as Magnifier or Live captions.",
        "Adjust its sub-settings, like zoom level or caption style, to your preference.",
      ],
    },
  },
  {
    id: "windows-privacy-security",
    title: "Privacy & Security",
    icon: Shield,
    platform: "windows",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Manage the Privacy & Security Hub",
    description:
      "Privacy & Security is the central hub introduced in Windows 11 that groups Windows Security (antivirus and firewall), sign-in options, app permissions, and general privacy controls like diagnostic data and activity history into one settings category. It's the starting point for auditing everything related to your PC's security and data posture in one place.",
    details: [
      "Access Windows Security's virus, firewall, and device health status directly from this hub.",
      "Review 'App permissions' to see and control what data individual apps can access.",
      "Adjust 'General' privacy toggles like advertising ID, tailored experiences, and app launch tracking.",
      "Manage 'Activity history' to control whether your activity is sent to Microsoft for cross-device timeline features.",
    ],
    important:
      "Some privacy toggles under 'General' are set to their most permissive option by default during initial Windows setup, so it's worth reviewing them once rather than assuming defaults match your preference.",
    redirectUrl: "ms-settings:privacy",
    whyItMatters:
      "Privacy & Security consolidates what used to be scattered across several separate menus into a single hub, making it realistic to actually review your full privacy and security posture in one sitting instead of hunting through multiple pages. Because it's also the home for Windows Security, it doubles as your entry point for checking antivirus and firewall status alongside more data-focused settings like diagnostic reporting. For anyone setting up a new PC, this is the single most efficient place to lock down defaults before regular use begins.",
    bestPractices: [
      "Walk through each sub-section once after setting up a new PC rather than leaving every default untouched.",
      "Turn off 'Let apps show me personalized ads' under General if you don't want your activity used for ad targeting.",
      "Review 'App permissions' periodically, since new apps you install may request access you don't remember granting.",
      "Check Windows Security's status from this hub regularly, since it surfaces here exactly the same as opening the dedicated Windows Security app.",
    ],
    commonIssues: [
      {
        issue: "Can't find a specific privacy toggle that used to be somewhere else in older Windows versions.",
        fix: "Windows 11 reorganized several settings from separate 'Privacy' and 'Update & Security' pages into this single hub, so check both 'App permissions' and 'General' sub-pages before assuming a setting was removed.",
      },
      {
        issue: "Windows Security shows a warning inside this hub.",
        fix: "Click directly into the flagged section (usually Virus & threat protection or Firewall & network protection) for a specific description of the problem and a one-click fix where available.",
      },
      {
        issue: "Activity history keeps syncing across devices even though you don't want it to.",
        fix: "Turn off 'Store my activity history on this device' under Activity history, and also review the linked Microsoft account privacy dashboard, since cross-device sync depends on both settings.",
      },
    ],
    faqs: [
      {
        q: "Is Privacy & Security the same as the old standalone Privacy settings page?",
        a: "It's the successor and superset — Windows 11 merged the old Privacy page with Windows Security and some Update & Security items into this single combined hub.",
      },
      {
        q: "Do I need to configure every sub-section, or only the ones I care about?",
        a: "Only the ones relevant to you — many, like advertising ID or activity history, are optional conveniences you can safely ignore if they don't concern you, while Windows Security is worth checking regardless.",
      },
      {
        q: "Does turning off diagnostic data collection affect Windows Update or security patches?",
        a: "No, reducing diagnostic data to 'Required' still allows Windows Update to function normally; it only limits the amount of optional telemetry Microsoft receives.",
      },
    ],
    tipsAndTricks: [
      "Use the search box at the top of Settings and type 'privacy' to jump directly into whichever sub-section you need without navigating the full hub each time.",
      "Bookmark 'App permissions' specifically if you check it more often than the broader hub, since it's one level deeper in the menu.",
    ],
    relatedSettingIds: ["windows-security", "windows-permissions", "camera-permission"],
    afterImageContent: {
      heading: "How the Privacy & Security Hub Works",
      paragraphs: [
        "Privacy & Security acts as a parent category linking to Windows Security, app permissions, and general data-handling toggles, each living on its own sub-page.",
        "Settings here apply system-wide and affect every app and user account differently depending on their own permission grants.",
        "Some settings, like activity history, also interact with your Microsoft account's online privacy dashboard rather than staying purely local to the device.",
      ],
      steps: [
        "Open Settings → Privacy & Security.",
        "Select Windows Security to check antivirus and firewall status.",
        "Select App permissions to review what data individual apps can access.",
        "Scroll to General to adjust advertising ID, tailored experiences, and related toggles.",
      ],
    },
  },
  {
    id: "windows-permissions",
    title: "App Permissions",
    icon: ListChecks,
    platform: "windows",
    category: "privacy-permissions",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Review App Permissions by Category",
    description:
      "App Permissions organizes privacy controls by capability rather than by app, letting you see at a glance which installed apps can access location, contacts, calendar, file system, and a dozen other data types. Instead of checking each app individually, you pick a permission type and review every app that has requested it.",
    details: [
      "Select a permission category (Location, Contacts, Calendar, etc.) to see every app that has requested it.",
      "Toggle access on or off per app within that category, or turn the entire category off system-wide.",
      "Some categories, like File system access, list apps that can read your entire user profile if granted broad access.",
      "Desktop apps installed outside the Microsoft Store aren't always listed here, since traditional Win32 apps can bypass this permission model.",
    ],
    important:
      "This page only reliably governs Microsoft Store apps and modern UWP apps — traditional desktop software installed the old-fashioned way can often access these same resources without appearing in this list at all.",
    redirectUrl: "https://support.microsoft.com/en-us/windows/apps/app-permissions",
    whyItMatters:
      "Organizing permissions by capability instead of by app makes it realistic to answer a specific question like 'which apps can see my location right now' in a few seconds instead of checking every installed app one by one. This view is especially useful for catching an app that quietly requested broad access during setup and that you'd otherwise never think to check individually. Because new apps request permissions the first time they need them, revisiting this page periodically catches access grants that have accumulated since you last looked.",
    bestPractices: [
      "Review the Location and Microphone categories most often, since they're the most sensitive to accidental oversharing.",
      "Turn off an entire category system-wide if no app you use genuinely needs it, rather than managing dozens of individual app toggles.",
      "Recheck this list a few weeks after installing several new apps, since permission grants accumulate quietly over time.",
      "Remember that this page doesn't fully cover traditional desktop apps, so pair it with general caution about what you install rather than relying on it as a complete picture.",
    ],
    commonIssues: [
      {
        issue: "An app that clearly uses your location isn't listed under the Location category.",
        fix: "It may be a traditional Win32 desktop app that accesses location through a different mechanism outside this Store-app-oriented permission model, so check that app's own in-app privacy settings instead.",
      },
      {
        issue: "Turning off a permission category breaks a feature you actually wanted.",
        fix: "Re-enable the category and instead disable access for only the specific apps you're concerned about, rather than blocking the entire category.",
      },
      {
        issue: "A newly installed app isn't requesting permission for something it clearly needs.",
        fix: "Some apps request permissions the first time that specific feature is used rather than at install time, so try using the relevant feature once and check back here afterward.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between this page and the individual permission pages like Camera or Microphone settings?",
        a: "They show the same underlying data — App Permissions is a category-first index that links out to the same dedicated pages, like Camera or Microphone, that also exist as standalone settings.",
      },
      {
        q: "Does denying a permission here uninstall or disable the app?",
        a: "No, it only blocks that specific capability; the app remains fully installed and functional except for the feature that relied on the blocked permission.",
      },
      {
        q: "Why do some categories list far more apps than others?",
        a: "Broadly useful permissions like notifications or file system access tend to be requested by many more apps than narrower ones like radios or call history, which only apps with a genuine specific need request.",
      },
    ],
    tipsAndTricks: [
      "Start with categories you consider most sensitive, like Location and Camera, rather than trying to review all of them in one sitting.",
      "Use this view right after a big app-installation spree, like setting up a new PC, to catch anything that over-requested access.",
    ],
    relatedSettingIds: ["windows-privacy-security", "camera-permission", "microphone-permission"],
    afterImageContent: {
      heading: "How App Permissions Works",
      paragraphs: [
        "Windows tracks which apps have requested each type of sensitive data or hardware access and surfaces them grouped by category on this page.",
        "Toggling a permission category off system-wide blocks every app in that category at once, while individual app toggles let you fine-tune exceptions.",
        "This permission model is built primarily around Microsoft Store and UWP apps, so traditional desktop software isn't always fully represented here.",
      ],
      steps: [
        "Open Settings → Privacy & Security → App permissions.",
        "Select a specific permission category, like Location or Contacts.",
        "Review which apps currently have access.",
        "Toggle individual apps or the entire category on or off as needed.",
      ],
    },
  },
  {
    id: "windows-time-date",
    title: "Date & Time",
    icon: Clock,
    platform: "windows",
    category: "system-info",
    controlType: "action",
    heading: "Set Date, Time & Time Zone",
    description:
      "Date & Time settings control your system clock, time zone, and whether Windows sets these automatically using your location and an internet time server. Correct time settings matter well beyond the clock display — they affect file timestamps, certificate validation, scheduled tasks, and login to network resources.",
    details: [
      "Enable 'Set time automatically' to sync with an internet time server rather than manual entry.",
      "Enable 'Set time zone automatically' to detect your zone based on location services.",
      "Manually adjust date, time, or time zone if automatic detection is unavailable or incorrect.",
      "Choose between 12-hour and 24-hour time formats, and adjust the date format shown in the taskbar.",
    ],
    important:
      "A clock that's significantly out of sync can cause authentication failures with services like Kerberos-based corporate networks, Wi-Fi captive portals, or even TLS certificate validation in your browser, well beyond just showing the wrong time.",
    redirectUrl: "ms-settings:dateandtime",
    whyItMatters:
      "An incorrect system clock causes problems far more disruptive than a wrong-looking taskbar display — expired-looking security certificates, failed domain sign-ins, and scheduled tasks or backups running at the wrong moment all trace back to time settings. Automatic time zone detection is especially useful for laptops that travel between regions, since manually adjusting the clock every time you land somewhere new is easy to forget. Getting this right once, and leaving it on automatic, removes an entire category of confusing intermittent errors from your troubleshooting list.",
    bestPractices: [
      "Leave 'Set time automatically' and 'Set time zone automatically' both on unless you have a specific reason to manage them manually.",
      "Enable location services if time zone auto-detection isn't working, since it relies on the same location data as Windows' Maps and Weather apps.",
      "Manually correct the time zone immediately after traveling if automatic detection hasn't caught up yet and you need accurate meeting times.",
      "Check this page first if you're getting unexplained certificate or sign-in errors, since a drifted clock is a surprisingly common root cause.",
    ],
    commonIssues: [
      {
        issue: "The clock is consistently a few minutes off despite automatic sync being enabled.",
        fix: "Click 'Sync now' under Additional clock settings, or check that the configured time server (time.windows.com by default) is reachable, since a blocked NTP port can silently prevent syncing.",
      },
      {
        issue: "Time zone doesn't update automatically after traveling.",
        fix: "Confirm location services are enabled system-wide under Privacy & Security → Location, since automatic time zone detection depends on it.",
      },
      {
        issue: "Browser or corporate app shows certificate or authentication errors.",
        fix: "Check that the system clock is accurate, since even a few minutes of drift can cause TLS certificate validation or Kerberos-based sign-in failures.",
      },
    ],
    faqs: [
      {
        q: "Why would I ever turn off automatic time and time zone settings?",
        a: "Mainly in specialized environments, like a lab machine intentionally isolated from the internet or a VM that needs to simulate a specific date, where automatic syncing isn't appropriate.",
      },
      {
        q: "Does an incorrect clock actually affect anything besides the visual time display?",
        a: "Yes, significantly — file timestamps, scheduled tasks, certificate validation, and domain authentication protocols like Kerberos all depend on reasonably accurate system time.",
      },
      {
        q: "Can I show both 12-hour and 24-hour formats depending on the app?",
        a: "No, the time format setting here is system-wide; individual apps generally follow whatever format Windows is set to rather than offering their own independent choice.",
      },
    ],
    tipsAndTricks: [
      "Click the clock in the taskbar and select 'Adjust date/time' as a quick shortcut into this exact settings page.",
      "Add additional clocks for other time zones under 'Additional clocks' if you regularly coordinate with people elsewhere, so they show in the taskbar's calendar flyout.",
    ],
    relatedSettingIds: ["language-region", "windows-update", "notifications-settings"],
    afterImageContent: {
      heading: "How Date & Time Settings Work",
      paragraphs: [
        "Windows syncs your clock against an internet time server (NTP) by default, correcting small amounts of drift automatically in the background.",
        "Automatic time zone detection uses the same location services framework as Maps and Weather, rather than a dedicated time-specific mechanism.",
        "Format settings for date and time apply system-wide, affecting the taskbar clock, File Explorer timestamps, and most apps that display dates.",
      ],
      steps: [
        "Open Settings → Time & language → Date & time.",
        "Toggle 'Set time automatically' and 'Set time zone automatically' on.",
        "Click 'Sync now' under Additional clock settings if the time looks incorrect.",
        "Adjust date and time format preferences further down the page if needed.",
      ],
    },
  },
  {
    id: "windows-clipboard",
    title: "Clipboard History",
    icon: ClipboardList,
    platform: "windows",
    category: "apps-features",
    controlType: "action",
    heading: "Manage Clipboard History & Sync",
    description:
      "Clipboard settings let you keep a scrollable history of everything you've recently copied, not just the single most recent item, and paste from any entry using Win+V. You can also sync your clipboard across multiple PCs signed into the same Microsoft account and pin frequently used snippets so they don't get pushed out by newer copies.",
    details: [
      "Enable Clipboard history to start keeping multiple recent copied items instead of just the last one.",
      "Press Win+V to open the clipboard history panel and paste from any recent entry.",
      "Pin frequently reused text or images so they stay available even as you copy new items.",
      "Turn on 'Sync across devices' to share clipboard history with other PCs signed into the same Microsoft account.",
    ],
    important:
      "Clipboard history and sync can retain sensitive copied text, like passwords or personal information, across sessions and devices, so clear it periodically if you regularly copy sensitive data.",
    redirectUrl: "ms-settings:clipboard",
    whyItMatters:
      "Standard copy-paste only remembers a single item, so accidentally copying something new before pasting the last thing means it's gone for good — Clipboard history fixes that by keeping a scrollable log you can paste from at any point. Syncing across devices is genuinely useful for anyone working across a desktop and laptop, letting you copy a link on one machine and paste it on the other without emailing it to yourself. Because it stores your actual copied content, understanding what it retains and how to clear it is a small but real privacy consideration.",
    bestPractices: [
      "Pin snippets you paste often, like a signature or common code block, so they survive even after copying many other things.",
      "Clear clipboard history periodically if you frequently copy passwords, tokens, or other sensitive text.",
      "Enable cross-device sync only on devices you personally use and trust, since it shares content between them automatically.",
      "Use Win+V as your default paste-review habit once enabled, since it becomes far more useful than a single-item clipboard once you're used to it.",
    ],
    commonIssues: [
      {
        issue: "Win+V doesn't open the clipboard history panel.",
        fix: "Confirm Clipboard history is toggled on under Settings → System → Clipboard, since the shortcut does nothing until the feature is enabled at least once.",
      },
      {
        issue: "Clipboard content doesn't appear on your other PC.",
        fix: "Check that 'Sync across devices' is turned on and both PCs are signed in with the same Microsoft account, since sync requires both conditions.",
      },
      {
        issue: "Old sensitive text keeps showing up in the clipboard history panel.",
        fix: "Click 'Clear all' in the Win+V panel, or turn off clipboard history entirely if you'd rather it not retain anything beyond the single most recent copy.",
      },
    ],
    faqs: [
      {
        q: "How many items does Clipboard history keep?",
        a: "It keeps a limited number of recent unpinned items (older ones get pushed out as you copy more), while pinned items stay indefinitely until you unpin or delete them.",
      },
      {
        q: "Is clipboard sync encrypted between my devices?",
        a: "Yes, Microsoft transmits synced clipboard data over an encrypted connection tied to your signed-in Microsoft account.",
      },
      {
        q: "Does clipboard history work with copied images, or just text?",
        a: "It works with both plain text and images, though very large images may not sync across devices as reliably as small text snippets.",
      },
    ],
    tipsAndTricks: [
      "Press Win+V and start typing to filter the clipboard history list down to entries containing that text.",
      "Pin a frequently used address or phrase so it's always the first thing available in the Win+V panel.",
    ],
    relatedSettingIds: ["windows-keyboard", "windows-multitasking", "default-apps"],
    afterImageContent: {
      heading: "How Clipboard History Works",
      paragraphs: [
        "Once enabled, Windows keeps a running list of recently copied text and images instead of overwriting the clipboard with each new copy.",
        "The Win+V panel lets you browse, pin, and paste from any entry in that history, not just the most recent one.",
        "When sync is enabled, clipboard entries are transmitted securely to other devices signed into the same Microsoft account.",
      ],
      steps: [
        "Open Settings → System → Clipboard.",
        "Toggle 'Clipboard history' on.",
        "Turn on 'Sync across devices' if you want clipboard content shared with your other PCs.",
        "Press Win+V anytime to view, pin, or paste from your clipboard history.",
      ],
    },
  },
  {
    id: "windows-multitasking",
    title: "Multitasking & Virtual Desktops",
    icon: Layers,
    platform: "windows",
    category: "apps-features",
    controlType: "action",
    heading: "Configure Multitasking & Snap Layouts",
    description:
      "Multitasking settings control Snap layouts (arranging windows into preset grid positions), Snap Assist behavior, and how Alt+Tab and virtual desktops handle switching between open windows. These features let you organize multiple apps on screen simultaneously and keep unrelated tasks separated across different virtual desktops.",
    details: [
      "Enable Snap layouts to see grid options when hovering over a window's maximize button.",
      "Configure whether snapping a window automatically suggests other open windows to fill remaining space.",
      "Choose whether Alt+Tab shows all open windows or only windows from the current virtual desktop.",
      "Set whether the taskbar shows windows from all desktops or only the active one.",
    ],
    important:
      "Setting Alt+Tab to show only the current desktop's windows can make an app feel like it's 'disappeared' if you forget which virtual desktop you left it open on.",
    redirectUrl: "ms-settings:multitasking",
    whyItMatters:
      "Snap layouts and virtual desktops turn a single monitor into something closer to a multi-screen workflow, letting you keep a document, browser, and chat app arranged and separated without constantly resizing windows manually. Virtual desktops in particular are valuable for separating work and personal contexts, or keeping a distracting app off the desktop you use for focused work. Getting the Alt+Tab and taskbar cross-desktop behavior configured to match how you actually think about your desktops prevents the common confusion of an app seeming to vanish.",
    bestPractices: [
      "Learn your preferred Snap layout shortcut (hover the maximize button, or Win+Z) so arranging multiple windows becomes second nature.",
      "Set Alt+Tab to show windows from all desktops if you don't rigidly separate tasks by desktop, to avoid ever feeling like an app went missing.",
      "Use separate virtual desktops for genuinely distinct contexts, like 'Work' and 'Personal', rather than creating more than you can mentally track.",
      "Turn off Snap Assist's suggestion prompt if you find the automatic window-filling behavior distracting rather than helpful.",
    ],
    commonIssues: [
      {
        issue: "An open app seems to have disappeared entirely.",
        fix: "Check other virtual desktops via Task view (Win+Tab), since Alt+Tab may be configured to show only the current desktop's windows, hiding apps open elsewhere.",
      },
      {
        issue: "Snap layouts don't appear when hovering over the maximize button.",
        fix: "Confirm 'Snap layouts' under Multitasking settings is enabled, since some organizations disable it via Group Policy on managed devices.",
      },
      {
        issue: "Snapping a window doesn't suggest other open windows to fill the rest of the screen.",
        fix: "Enable 'When I snap a window, show what I can snap next to it' under Multitasking settings, since this Snap Assist behavior can be toggled off independently of Snap layouts themselves.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Snap layouts and virtual desktops?",
        a: "Snap layouts arrange multiple windows within a single desktop's screen space, while virtual desktops create entirely separate desktop workspaces you switch between, each with its own set of open windows.",
      },
      {
        q: "Can each virtual desktop have a different wallpaper?",
        a: "Yes, right-click a desktop in Task view and choose 'Choose background' to set a distinct wallpaper, making it easier to tell desktops apart visually.",
      },
      {
        q: "Do virtual desktops slow down my PC by keeping more apps running?",
        a: "No, virtual desktops are just different views of the same set of running apps and windows — creating more desktops doesn't itself use additional resources beyond the apps you already have open.",
      },
    ],
    tipsAndTricks: [
      "Use Win+Ctrl+D to instantly create a new virtual desktop, and Win+Ctrl+Left/Right to switch between them without opening Task view first.",
      "Use Win+Z as a keyboard-only alternative to hovering over the maximize button for triggering Snap layouts.",
    ],
    relatedSettingIds: ["windows-taskbar", "display-settings", "windows-start-menu"],
    afterImageContent: {
      heading: "How Multitasking Settings Work",
      paragraphs: [
        "Snap layouts and Snap Assist govern how windows arrange themselves within a single desktop's visible screen space.",
        "Virtual desktops are separate, independently trackable workspaces, each capable of holding its own distinct set of open windows.",
        "Alt+Tab and taskbar visibility settings determine whether switching tools show windows from every virtual desktop or only the active one.",
      ],
      steps: [
        "Open Settings → System → Multitasking.",
        "Toggle 'Snap windows' and configure Snap Assist suggestions.",
        "Choose whether Alt+Tab shows windows from all desktops or only the current one.",
        "Adjust taskbar cross-desktop visibility to match your preference.",
      ],
    },
  },
  {
    id: "windows-remote-desktop",
    title: "Remote Desktop",
    icon: ScreenShare,
    platform: "windows",
    category: "connectivity-network",
    controlType: "action",
    heading: "Enable Remote Desktop Access",
    description:
      "Remote Desktop lets you connect to this PC from another Windows device, or from Mac, iOS, and Android using the Remote Desktop app, over your local network or the internet. Once enabled, you can control this PC's full desktop remotely, which is useful for accessing a work computer from home or troubleshooting a family member's PC.",
    details: [
      "Toggle 'Remote Desktop' on to allow incoming connections to this PC.",
      "Only user accounts explicitly added under 'User accounts' can connect, beyond the PC's own administrator.",
      "Note this PC's name shown on the Remote Desktop settings page — you'll need it to connect from another device.",
      "Advanced settings let you require Network Level Authentication for an added layer of connection security.",
    ],
    important:
      "Remote Desktop as a host (accepting incoming connections) is only available on Windows 11 Pro, Enterprise, and Education editions — Windows 11 Home can connect out to other PCs but cannot accept incoming Remote Desktop connections.",
    redirectUrl: "ms-settings:remotedesktop",
    whyItMatters:
      "Remote Desktop turns any other device into a full window into this PC, letting you finish work left on your office computer from home, or help a less technical family member by controlling their screen directly instead of talking them through steps over the phone. Because it opens a genuine remote-control channel, correctly restricting which accounts can connect and requiring Network Level Authentication matters for keeping that access limited to people you actually trust. It's one of the most powerful convenience features in Windows precisely because it's also one of the most sensitive to leave misconfigured.",
    bestPractices: [
      "Keep 'Require devices to use Network Level Authentication' enabled, since it authenticates the connecting user before a full remote session even starts.",
      "Add only the specific user accounts that genuinely need remote access under 'User accounts', rather than relying solely on the built-in administrator account.",
      "Use a VPN when connecting over the internet rather than exposing Remote Desktop's port directly to your router, unless you fully understand the security tradeoffs of doing otherwise.",
      "Turn Remote Desktop off when you don't expect to need it for an extended period, rather than leaving it enabled indefinitely by default.",
    ],
    commonIssues: [
      {
        issue: "Can't connect to a PC even though Remote Desktop is enabled.",
        fix: "Confirm the target PC's edition is Pro, Enterprise, or Education (Home can't accept incoming connections), and check that it's awake, not asleep, since sleep interrupts availability.",
      },
      {
        issue: "Connection succeeds locally but fails from outside your home network.",
        fix: "Connecting over the internet requires either port forwarding on your router (not generally recommended without a VPN) or a VPN connection into your home network first, since Remote Desktop isn't exposed to the internet by default.",
      },
      {
        issue: "'The user account does not have permission' error when trying to connect.",
        fix: "Add the connecting account explicitly under Remote Desktop's 'User accounts' section on the host PC, since only added accounts (plus the PC's own administrator) are permitted by default.",
      },
    ],
    faqs: [
      {
        q: "Do I need Windows 11 Pro to use Remote Desktop at all?",
        a: "Only to accept incoming connections as the host — Windows 11 Home can still be used to connect out to a Pro, Enterprise, or Education PC using the Remote Desktop client app.",
      },
      {
        q: "Is Remote Desktop the same as third-party tools like TeamViewer or AnyDesk?",
        a: "It accomplishes a similar goal but works differently — Remote Desktop is built directly into Windows and typically used within a trusted network or via VPN, while third-party tools often route through their own relay servers designed for easier internet-wide access.",
      },
      {
        q: "Can more than one person connect to the same PC via Remote Desktop at once?",
        a: "On standard Windows 11 editions, a new Remote Desktop connection signs out the local session, so only one interactive session is active at a time, unlike Windows Server which supports multiple concurrent sessions.",
      },
    ],
    tipsAndTricks: [
      "Note the exact PC name shown on this settings page before leaving the building, since you'll need it (or the local IP address) to initiate a connection later.",
      "Use the Remote Desktop app's saved connections feature so you don't have to re-enter the PC name and credentials every time you connect to the same machine.",
    ],
    relatedSettingIds: ["windows-vpn", "wifi-connection", "windows-security"],
    afterImageContent: {
      heading: "How Remote Desktop Works",
      paragraphs: [
        "Remote Desktop streams this PC's full display and accepts keyboard and mouse input from the connecting device, effectively giving you the same control as sitting in front of it.",
        "Network Level Authentication verifies the connecting user's credentials before a full desktop session is established, reducing exposure to unauthenticated connection attempts.",
        "Only explicitly permitted user accounts, plus the PC's administrator, can establish a session by default.",
      ],
      steps: [
        "Open Settings → System → Remote Desktop.",
        "Toggle 'Remote Desktop' on and confirm the prompt.",
        "Click 'User accounts' to add any additional accounts allowed to connect.",
        "Note the PC name shown, then use the Remote Desktop app on another device to connect to it.",
      ],
    },
  },
  {
    id: "windows-backup",
    title: "Backup",
    icon: CloudUpload,
    platform: "windows",
    category: "storage-backup-data",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Back Up Your PC with Windows Backup",
    description:
      "Windows Backup uses OneDrive to continuously back up your Desktop, Documents, and Pictures folders, along with your list of installed apps, saved Wi-Fi network passwords, and select personalization settings like your theme and wallpaper. It's designed to make restoring your setup on a new PC, or after a reset, far less painful than starting from scratch.",
    details: [
      "Enable folder backup for Desktop, Documents, and Pictures to sync them continuously to OneDrive.",
      "Choose whether to also remember your installed apps list and preferences for easier setup on a new PC.",
      "Backed-up settings restore automatically when you sign into a new or reset PC with the same Microsoft account.",
      "Check 'Manage sync settings' if backup appears paused or stuck.",
    ],
    important:
      "This backs up specific folders and settings, not your entire drive — it isn't a substitute for a full image backup if you need to fully restore a PC from complete failure without reinstalling Windows.",
    redirectUrl: "ms-settings:backup",
    whyItMatters:
      "Losing a laptop, having a drive fail, or simply setting up a new PC is far less stressful when your Desktop, Documents, and Pictures are already safely synced to OneDrive rather than trapped on a single failed or misplaced device. Remembering your installed apps and preferences also meaningfully speeds up getting a replacement PC back to a familiar, usable state instead of manually reinstalling and reconfiguring everything by memory. Because it runs continuously in the background once enabled, it protects you without requiring you to remember to manually back up on any regular schedule.",
    bestPractices: [
      "Enable folder backup for Desktop, Documents, and Pictures as soon as you set up a new PC, rather than waiting until after you've lost something.",
      "Check your OneDrive storage quota periodically, since backed-up folders count against your account's storage limit and large media libraries can fill it quickly.",
      "Don't treat this as a replacement for a full system image backup if you specifically need to restore an entire drive, including apps and system files, without reinstalling Windows.",
      "Verify sync status occasionally rather than assuming it's always running silently in the background without issues.",
    ],
    commonIssues: [
      {
        issue: "Folder backup shows 'Paused' and files aren't syncing.",
        fix: "Open OneDrive from the system tray and check for a sync error, low storage warning, or paused state that needs to be manually resumed.",
      },
      {
        issue: "OneDrive storage fills up quickly after enabling folder backup.",
        fix: "Review what's inside Desktop, Documents, and Pictures for large files that don't need to live there, or upgrade your Microsoft 365 storage plan if you need more space.",
      },
      {
        issue: "A new PC doesn't automatically restore your backed-up settings after signing in.",
        fix: "Confirm you signed in with the exact same Microsoft account used for the original backup, and give it some time, since restoring installed app lists and preferences isn't always instantaneous.",
      },
    ],
    faqs: [
      {
        q: "Does Windows Backup back up my entire hard drive?",
        a: "No, it specifically covers designated folders (Desktop, Documents, Pictures), installed app lists, saved Wi-Fi passwords, and select settings — it isn't a full disk image backup.",
      },
      {
        q: "Do I need a paid Microsoft 365 subscription to use this?",
        a: "A free Microsoft account includes some OneDrive storage sufficient for modest use, but larger folders will need a paid Microsoft 365 plan for enough space to back up everything.",
      },
      {
        q: "What happens to my backed-up files if I stop paying for extra OneDrive storage?",
        a: "Your files remain safe, but if you exceed the free storage limit, OneDrive stops syncing new changes until you free up space or restore paid storage.",
      },
    ],
    tipsAndTricks: [
      "Right-click the OneDrive icon in the system tray for a quick view of current sync status and any pending issues without opening full Settings.",
      "Combine this with a separate full image backup tool if you want both convenient folder-level protection and a complete disaster-recovery option.",
    ],
    relatedSettingIds: ["storage-settings", "windows-reset", "windows-recovery"],
    updateFrequency: "Runs continuously in the background; review sync status and storage quota monthly",
    afterImageContent: {
      heading: "How Windows Backup Works",
      paragraphs: [
        "Windows Backup uses your existing OneDrive connection to continuously sync designated folders as files change, rather than running on a fixed schedule.",
        "Installed app lists and select settings are saved to your Microsoft account so they can be reapplied automatically when you sign into a new or reset PC.",
        "Because it's folder- and settings-based rather than a full disk image, it complements but doesn't replace dedicated full-system backup tools.",
      ],
      steps: [
        "Open Settings → Accounts → Windows backup.",
        "Turn on folder backup for Desktop, Documents, and Pictures.",
        "Toggle whether to remember your apps and preferences.",
        "Check 'Manage sync settings' periodically to confirm everything is syncing correctly.",
      ],
    },
  },
  {
    id: "windows-recovery",
    title: "Recovery",
    icon: LifeBuoy,
    platform: "windows",
    category: "troubleshooting-diagnostics",
    controlType: "action",
    heading: "Access Windows Recovery Options",
    description:
      "Recovery brings together the tools for fixing a Windows PC that won't start correctly or is having serious problems, including Advanced startup (for Safe Mode, Startup Repair, and command-line recovery tools), System Restore, and Fix problems using Windows Update. It's a broader troubleshooting toolkit than Reset This PC alone, covering scenarios where a full reset is more than you need.",
    details: [
      "Click 'Restart now' under Advanced startup to reboot into a menu with Safe Mode, Startup Repair, and Command Prompt recovery options.",
      "Use 'Fix problems using Windows Update' to let Windows attempt an automatic repair by reinstalling recent updates.",
      "Access System Restore (if enabled) through Advanced startup's 'System Restore' option to roll back recent system changes.",
      "Reset This PC is also linked from here, for cases where lighter recovery options haven't resolved the issue.",
    ],
    important:
      "System Restore is not enabled by default on most Windows 11 installations, so having a restore point available when you actually need one requires having turned it on in advance under 'Configure Restore Points' via the classic System Properties dialog.",
    redirectUrl: "ms-settings:recovery",
    whyItMatters:
      "Recovery is the toolkit you reach for before deciding a full Reset This PC is necessary, covering lighter interventions like Safe Mode for isolating a problematic driver, or Startup Repair for fixing boot issues without touching your installed apps and files at all. Advanced startup in particular is accessible even when Windows won't boot normally, since it can be triggered from the sign-in screen itself. Knowing these options exist, and confirming System Restore is actually turned on before you need it, can be the difference between a five-minute fix and a full reinstall.",
    bestPractices: [
      "Turn on System Restore proactively through 'Configure Restore Points' (search for it in Start), since it's off by default and useless if enabled only after a problem already occurred.",
      "Try Safe Mode via Advanced startup first when troubleshooting a boot issue you suspect is driver-related, before considering a full reset.",
      "Use 'Fix problems using Windows Update' specifically when your PC won't start shortly after installing an update, since it targets that exact scenario.",
      "Reserve Reset This PC for when lighter recovery options genuinely haven't resolved the issue, rather than jumping straight to it.",
    ],
    commonIssues: [
      {
        issue: "PC won't boot normally and you need to reach recovery options.",
        fix: "Hold the power button to force a shutdown three times in a row during boot to trigger Windows' Automatic Repair environment, which leads into the same Advanced startup menu.",
      },
      {
        issue: "System Restore option isn't available when you need it.",
        fix: "This means restore points were never enabled on this PC — going forward, turn on System Restore via 'Configure Restore Points' so points exist the next time you need one.",
      },
      {
        issue: "'Fix problems using Windows Update' doesn't resolve a boot issue.",
        fix: "Try Advanced startup's Safe Mode instead to isolate whether a third-party driver or startup app is the actual cause before considering Reset This PC.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Recovery and Reset This PC?",
        a: "Recovery is the umbrella page covering lighter tools like Safe Mode, Startup Repair, and System Restore, while Reset This PC (linked from here) is the more drastic option that reinstalls Windows entirely.",
      },
      {
        q: "Can I access Recovery options if Windows won't start at all?",
        a: "Yes, forcing three consecutive failed boot attempts (by holding the power button during startup) triggers Windows' Automatic Repair, which leads into the same Advanced startup menu accessible from within Windows.",
      },
      {
        q: "Does using System Restore delete my personal files?",
        a: "No, System Restore only reverts system files, installed apps, and settings to an earlier restore point — your personal documents and files are not affected.",
      },
    ],
    tipsAndTricks: [
      "Hold Shift while clicking Restart from the Start menu's power options as a quick way to reach Advanced startup without going through Settings.",
      "Create a manual restore point right before installing a risky driver or major software change, rather than relying only on automatically scheduled ones.",
    ],
    relatedSettingIds: ["windows-reset", "windows-backup", "system-restart"],
    updateFrequency: "No routine schedule — used only when troubleshooting, but confirm System Restore is turned on once in advance",
    afterImageContent: {
      heading: "How Windows Recovery Works",
      paragraphs: [
        "Advanced startup boots into a separate recovery environment outside your normal Windows installation, letting you run repair tools even if Windows itself won't start.",
        "System Restore, when enabled, keeps periodic snapshots of system files and settings that you can roll back to without affecting personal files.",
        "'Fix problems using Windows Update' specifically targets boot issues caused by a recently installed update by attempting an automatic repair.",
      ],
      steps: [
        "Open Settings → System → Recovery.",
        "Click 'Restart now' under Advanced startup to reach Safe Mode, Startup Repair, or System Restore.",
        "Alternatively, click 'Fix problems using Windows Update' if a recent update seems to be the cause.",
        "Use 'Reset this PC' from the same page only if lighter recovery options don't resolve the issue.",
      ],
    },
  },
  {
    id: "windows-activation",
    title: "Activation",
    icon: KeyRound,
    platform: "windows",
    category: "system-info",
    controlType: "action",
    heading: "Check Windows Activation Status",
    description:
      "Activation shows whether your copy of Windows is genuinely licensed and linked to your hardware or Microsoft account, which edition you're running, and lets you enter a new product key or upgrade to a different edition, like from Home to Pro. A properly activated Windows unlocks full personalization options and removes the persistent activation watermark.",
    details: [
      "View your current activation status and the specific Windows edition installed.",
      "Enter a new product key here to activate Windows or upgrade to Pro from Home.",
      "Use 'Troubleshoot' if activation shows an error despite believing your license is valid.",
      "Add a Microsoft account to your digital license for easier reactivation after major hardware changes.",
    ],
    important:
      "Replacing major hardware, particularly the motherboard, can invalidate a digital license's hardware fingerprint and require reactivation — linking your license to a Microsoft account beforehand makes recovering activation afterward much easier.",
    redirectUrl: "ms-settings:activation",
    whyItMatters:
      "An unactivated Windows installation nags you with a persistent watermark and blocks access to personalization options like changing your desktop background, which is a real daily annoyance beyond just the legal licensing concern. Checking this page after a fresh install, a motherboard swap, or a Reset This PC confirms your license reactivated correctly rather than assuming it did. Linking your digital license to a Microsoft account specifically pays off if you ever need to prove ownership and reactivate after significant hardware changes.",
    bestPractices: [
      "Link your digital license to a Microsoft account before making major hardware changes, since it makes reactivation afterward far simpler.",
      "Check activation status after any Reset This PC or clean install to confirm it reactivated automatically as expected.",
      "Use the built-in 'Troubleshoot' option before purchasing a new license if activation shows an error, since it resolves many common cases automatically.",
      "Keep your original product key or purchase confirmation accessible in case you ever need to manually re-enter it.",
    ],
    commonIssues: [
      {
        issue: "Windows shows 'Not activated' after a hardware change or reset.",
        fix: "Open Activation and click 'Troubleshoot', then choose 'I changed hardware on this device recently' if your digital license was already linked to a Microsoft account.",
      },
      {
        issue: "A valid product key won't activate.",
        fix: "Confirm the key matches your installed edition (Home keys won't activate a Pro installation, for example), and check it hasn't already been used on the maximum allowed number of devices for that license type.",
      },
      {
        issue: "Persistent activation watermark remains even though Activation shows 'Windows is activated'.",
        fix: "This is usually a display refresh issue — restart the PC or explorer.exe, since the watermark occasionally lags behind the actual activation state shown in Settings.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between a digital license and a product key?",
        a: "A digital license is tied to your hardware and/or Microsoft account and reactivates automatically without re-entering anything, while a product key is a manually entered 25-character code used for a fresh activation or edition upgrade.",
      },
      {
        q: "Can I upgrade from Windows Home to Pro without reinstalling?",
        a: "Yes, entering a Pro product key (or purchasing an upgrade) under Activation triggers an in-place upgrade that keeps your files and apps intact.",
      },
      {
        q: "Does an unactivated Windows installation stop working eventually?",
        a: "No, it continues to function for daily use, but you lose access to certain personalization settings and see a persistent activation watermark until it's properly activated.",
      },
    ],
    tipsAndTricks: [
      "Run 'slmgr /xpr' in an elevated Command Prompt for a quick command-line check of your activation expiration status, useful for volume-licensed or KMS-activated devices.",
      "Add your Microsoft account under Activation right after a fresh install specifically so a future motherboard replacement doesn't leave you stuck.",
    ],
    relatedSettingIds: ["windows-update", "windows-security", "windows-time-date"],
    afterImageContent: {
      heading: "How Windows Activation Works",
      paragraphs: [
        "Windows checks your license against Microsoft's activation servers, either through a digital license tied to your hardware and Microsoft account or a manually entered product key.",
        "A digital license generally reactivates automatically after a clean install or reset on the same hardware, without needing to re-enter a key.",
        "Significant hardware changes, especially replacing the motherboard, can break the hardware fingerprint a digital license depends on, requiring the Troubleshoot flow to relink it.",
      ],
      steps: [
        "Open Settings → System → Activation.",
        "Review your current activation status and Windows edition.",
        "Click 'Change product key' to enter a new key or upgrade editions.",
        "Use 'Troubleshoot' if activation shows an error you weren't expecting.",
      ],
    },
  },
  // --- 12 final Windows entries: troubleshooting, devices, personalization, system info, storage, connectivity, accessibility, gaming, encryption ---
  {
    id: "windows-troubleshoot",
    title: "Troubleshoot",
    icon: Wrench,
    platform: "windows",
    category: "troubleshooting-diagnostics",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Run Windows Troubleshooters",
    description:
      "Troubleshoot gathers Windows' built-in automated diagnostic tools in one place, covering internet connections, audio playback and recording, printers, Bluetooth, Windows Update, and more. Each troubleshooter runs a scripted sequence of checks against the specific feature it targets and applies a fix automatically wherever it safely can, instead of requiring you to already know the underlying cause.",
    details: [
      "Open 'Other troubleshooters' to browse every diagnostic tool grouped by category, such as Internet Connections, Printer, or Playing Audio.",
      "Each troubleshooter reports what it checked, what it found, and whether it applied a fix automatically.",
      "Some troubleshooters pause partway through to ask a clarifying question, like which specific device is affected.",
      "'Recommended troubleshooting' can let Windows run relevant troubleshooters automatically the moment it detects a matching problem.",
    ],
    important:
      "A troubleshooter reporting 'no problems found' only means it didn't detect the specific conditions it's scripted to check for, not that your system is definitely problem-free.",
    redirectUrl: "ms-settings:troubleshoot",
    whyItMatters:
      "Troubleshoot turns vague symptoms like 'my internet feels slow' or 'sound isn't working' into a structured diagnostic pass instead of guesswork, and it's often the fastest way to resolve common issues without searching forums for the right fix. Because these tools run the same checks Microsoft support agents would typically walk you through manually, running one first can save real time before escalating to a support call. For less technical users especially, it's a safe first step that rarely makes a problem worse and frequently resolves it outright.",
    bestPractices: [
      "Run the specific troubleshooter that matches your symptom, like 'Playing Audio' for sound issues, rather than trying every one you see.",
      "Read the troubleshooter's summary at the end even when it reports finding nothing, since it sometimes explains what it checked and what to try next.",
      "Enable 'Recommended troubleshooting' at its default 'Ask me before running' level so you stay aware of what's being run automatically.",
      "Restart the affected app or device after a troubleshooter applies a fix, since some changes don't take effect until then.",
      "Treat a resolved troubleshooter result as a first fix, not a final diagnosis, if the same problem recurs shortly after.",
    ],
    commonIssues: [
      {
        issue: "The troubleshooter closes immediately without showing any results.",
        fix: "Run it again from an administrator account, since certain troubleshooters, particularly ones touching system services, silently fail without elevated permissions.",
      },
      {
        issue: "A troubleshooter says it fixed the problem, but the issue immediately returns.",
        fix: "Restart the PC to let the applied fix fully take effect, and if it still recurs, treat that as a sign the actual cause needs deeper investigation, like Device Manager or Event Viewer.",
      },
      {
        issue: "'Other troubleshooters' doesn't list a tool for your specific problem.",
        fix: "Search directly for the classic Control Panel troubleshooter pack via 'Find and fix other problems' or check the specific feature's own settings page for a dedicated repair option.",
      },
    ],
    faqs: [
      {
        q: "Do troubleshooters ever make a problem worse?",
        a: "It's rare — troubleshooters are designed to be conservative and generally only reset settings to known-good defaults, though resetting a customized configuration back to default is occasionally more disruptive than the original issue.",
      },
      {
        q: "Can I see what a troubleshooter actually changed?",
        a: "The results screen at the end lists what it checked and fixed in plain language, though it doesn't always show the exact technical setting it modified.",
      },
      {
        q: "Should I run a troubleshooter before contacting support?",
        a: "Yes, it's a reasonable first step for common issues and can resolve many problems immediately, though persistent or unusual issues still benefit from direct support afterward.",
      },
    ],
    tipsAndTricks: [
      "Right-click the Start button and search 'troubleshoot' as a quicker way to jump straight into this page.",
      "Check the audio, network, and Windows Update troubleshooters first for the most common everyday issues, since they cover the majority of typical complaints.",
    ],
    relatedSettingIds: ["windows-update", "windows-recovery", "system-restart"],
    afterImageContent: {
      heading: "How Windows Troubleshooters Work",
      paragraphs: [
        "Each troubleshooter is a small scripted diagnostic tool that checks a specific feature against a known list of common misconfigurations and failure points.",
        "When a troubleshooter finds a matching issue, it attempts an automatic fix using the same techniques a support technician would apply manually.",
        "Recommended troubleshooting can trigger relevant tools automatically in the background when Windows detects a matching problem signature, if you've allowed it to.",
      ],
      steps: [
        "Open Settings → System → Troubleshoot.",
        "Click 'Other troubleshooters' to see the full list by category.",
        "Select the troubleshooter matching your issue and click 'Run'.",
        "Follow any on-screen prompts and review the summary once it finishes.",
      ],
    },
  },
  {
    id: "windows-device-manager",
    title: "Device Manager",
    icon: Cpu,
    platform: "windows",
    category: "devices-peripherals",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Hardware with Device Manager",
    description:
      "Device Manager is a classic Windows tool (devmgmt.msc) that lists every piece of hardware attached to your PC — display adapters, network adapters, storage controllers, USB devices, and more — organized into categories. It's where you update, roll back, disable, or uninstall a specific driver, and where a small yellow warning icon points you directly at hardware Windows is having trouble with.",
    details: [
      "Expand a hardware category to see individual devices, and right-click one for Update driver, Disable device, or Uninstall device.",
      "A yellow warning triangle on a device usually means a driver problem; check its Properties → General tab for the exact error code.",
      "'Roll Back Driver' (Properties → Driver tab) reverts to the previously installed driver if a recent update caused a regression.",
      "'Show hidden devices' under the View menu reveals devices that have been unplugged but whose drivers remain installed.",
    ],
    important:
      "Device Manager is a legacy Control Panel-style tool with no equivalent page in the modern Settings app — you open it via Win+X, search, or running devmgmt.msc directly, not through ms-settings.",
    redirectUrl:
      "https://support.microsoft.com/en-us/windows/update-drivers-through-device-manager-in-windows-ec62f46c-ff14-c91d-eead-d7126dc1f7b6",
    whyItMatters:
      "Device Manager is the most direct way to see exactly what hardware Windows recognizes and how healthy each device's driver actually is, which matters the moment something like a webcam, network adapter, or graphics card starts behaving oddly. Because it exposes error codes and lets you roll back a driver update in a couple of clicks, it's often faster than uninstalling and reinstalling software blindly. For anyone troubleshooting hardware that suddenly stopped working after an update, this is usually the very first place to look.",
    bestPractices: [
      "Check Device Manager for yellow warning icons first whenever a specific piece of hardware stops working, before assuming it's a bigger system problem.",
      "Use 'Roll Back Driver' immediately after a driver update causes a regression, while the previous driver is still available to restore.",
      "Prefer Windows Update or the manufacturer's official driver download over generic 'Update driver' searches for hardware with known compatibility issues.",
      "Avoid disabling a device you don't recognize without researching it first, since some entries represent essential chipset or system components.",
      "Use 'Scan for hardware changes' under the Action menu if a newly connected device doesn't appear automatically.",
    ],
    commonIssues: [
      {
        issue: "A device shows a yellow warning triangle in the list.",
        fix: "Open its Properties → General tab to read the specific error code, then try 'Update driver' or check the manufacturer's website for a driver matching that exact error.",
      },
      {
        issue: "A driver update makes a device stop working correctly.",
        fix: "Open the device's Properties → Driver tab and click 'Roll Back Driver' to restore the previous version, if the button isn't greyed out.",
      },
      {
        issue: "A device that was recently unplugged still shows up.",
        fix: "Enable 'Show hidden devices' under the View menu, then right-click the greyed-out entry and select Uninstall device to remove its leftover driver registration.",
      },
      {
        issue: "'Update driver' says the best driver is already installed, but a known fix exists.",
        fix: "Download the manufacturer's driver package directly and choose 'Browse my computer for drivers' instead, since Windows' automatic search doesn't always surface the newest manufacturer release.",
      },
    ],
    faqs: [
      {
        q: "Is Device Manager the same as the Settings app's device list?",
        a: "No, Settings → Bluetooth & devices manages user-facing peripherals like mice and printers, while Device Manager exposes the full underlying hardware and driver stack, including internal components you'd never see in Settings.",
      },
      {
        q: "Can I permanently delete a driver from Device Manager?",
        a: "Uninstalling a device removes its currently installed driver, and checking 'Delete the driver software for this device' during uninstall also removes the driver package itself, though Windows may reinstall a default driver automatically if the hardware is still connected.",
      },
      {
        q: "Why does Device Manager show unfamiliar entries like 'System devices' or 'Unknown device'?",
        a: "These typically represent internal chipset components or hardware Windows couldn't fully identify a driver for — an 'Unknown device' usually needs a specific driver installed from the motherboard or laptop manufacturer.",
      },
    ],
    tipsAndTricks: [
      "Press Win+X and select Device Manager for the fastest way to open it without searching.",
      "Sort the device tree by connection instead of type (View menu) to see exactly which physical port or hub a problematic device is attached through.",
    ],
    relatedSettingIds: ["windows-update", "windows-optional-features", "windows-graphics"],
    afterImageContent: {
      heading: "How Device Manager Works",
      paragraphs: [
        "Device Manager reads hardware and driver information directly from Windows' internal device tree, organizing every recognized component into expandable categories.",
        "Driver actions like Update, Roll Back, and Uninstall operate on the specific driver package bound to that device, without affecting other similar hardware.",
        "Because it's a legacy MMC snap-in rather than a modern Settings page, it opens in its own window instead of inside the Settings app.",
      ],
      steps: [
        "Right-click the Start button and select Device Manager, or run 'devmgmt.msc' from the Run dialog.",
        "Expand the category containing the hardware you want to check.",
        "Right-click the specific device and choose Update driver, Disable, or Uninstall as needed.",
        "Restart the PC if prompted, especially after installing or rolling back a driver.",
      ],
    },
  },
  {
    id: "windows-graphics",
    title: "Graphics Settings",
    icon: MonitorCog,
    platform: "windows",
    category: "devices-peripherals",
    controlType: "action",
    heading: "Configure Per-App Graphics Preferences",
    description:
      "Graphics Settings lets you assign specific apps to your PC's high-performance or power-saving GPU on laptops with both integrated and dedicated graphics, override the automatically chosen graphics preference, and enable Auto HDR and Variable Refresh Rate for supported games. It's most relevant on 2-in-1s and gaming laptops with more than one graphics processor installed.",
    details: [
      "Add a specific app and set its preference to 'Power saving' (integrated GPU) or 'High performance' (dedicated GPU).",
      "Enable 'Auto HDR' to extend the color and contrast range of supported SDR games automatically, on an HDR-capable display.",
      "Enable 'Variable refresh rate' if your monitor and GPU both support adaptive sync technologies like G-Sync or FreeSync.",
      "Enable 'Optimizations for windowed games' to improve responsiveness for games running in a window rather than full screen.",
    ],
    important:
      "Graphics preference only applies to laptops or desktops with more than one graphics processor — on a system with a single GPU, the per-app override options have nothing to switch between and won't change performance.",
    redirectUrl: "ms-settings:display-advancedgraphics",
    whyItMatters:
      "On a laptop with both an integrated and dedicated GPU, letting Windows decide which one an app uses can lead to a game running on the weaker integrated chip, or a simple utility unnecessarily waking the power-hungry dedicated GPU and draining the battery faster. Manually assigning graphics preference per app fixes both problems at once — better performance where you need it, and better battery life everywhere else. Auto HDR and Variable Refresh Rate specifically improve visual quality and smoothness in games that support them, often noticeably, for no cost beyond enabling the toggle.",
    bestPractices: [
      "Set demanding games and creative apps to 'High performance' explicitly rather than trusting Windows' automatic detection, especially for less common software.",
      "Set background utilities and simple productivity apps to 'Power saving' to keep the dedicated GPU idle and extend battery life.",
      "Enable Variable refresh rate only if you've confirmed both your monitor and GPU support a compatible adaptive sync standard.",
      "Turn on Auto HDR only on a display that's actually HDR-capable, since it does nothing useful on a standard SDR monitor.",
      "Recheck graphics preference assignments after installing a new game, since it isn't added to the list automatically.",
    ],
    commonIssues: [
      {
        issue: "A game runs poorly despite having a capable dedicated GPU installed.",
        fix: "Add the game manually under Graphics settings and set its preference to 'High performance' instead of relying on the automatic default.",
      },
      {
        issue: "Battery drains quickly even during light everyday use.",
        fix: "Check whether background apps are set to 'High performance' unnecessarily, and switch them to 'Power saving' so the dedicated GPU can stay idle.",
      },
      {
        issue: "Variable refresh rate option is greyed out or unavailable.",
        fix: "Confirm both the monitor and the connection (DisplayPort or HDMI, depending on the standard) support adaptive sync, since the toggle only appears when compatible hardware is detected.",
      },
    ],
    faqs: [
      {
        q: "Does changing graphics preference apply immediately, or does the app need to restart?",
        a: "The app needs to be closed and reopened, since the graphics preference is applied when the app launches, not while it's already running.",
      },
      {
        q: "Is Auto HDR the same as native HDR support in a game?",
        a: "No, Auto HDR is an approximation applied by Windows to standard-range (SDR) games, while native HDR is authored by the game developer directly — both can look great, but native HDR is generally more accurate.",
      },
      {
        q: "Can I set a default graphics preference for all apps instead of configuring each individually?",
        a: "There's no single global override for every app, but you can set the default preference for the two main global options (Windows default) and add exceptions per app as needed.",
      },
    ],
    tipsAndTricks: [
      "Use 'Browse' under Graphics settings to add a specific .exe directly if an app doesn't show up in the recently-used app list.",
      "Check your GPU manufacturer's own control panel (like NVIDIA Control Panel) for additional per-app graphics options beyond what Windows exposes here.",
    ],
    relatedSettingIds: ["display-settings", "windows-device-manager", "windows-game-mode"],
    afterImageContent: {
      heading: "How Graphics Settings Work",
      paragraphs: [
        "On systems with more than one GPU, Windows decides at launch time which processor an app uses, based on either its own default logic or a manual override you've configured here.",
        "Auto HDR analyzes and extends the color range of supported SDR games in real time, without needing developer-added HDR support.",
        "Variable refresh rate settings coordinate with your monitor and GPU driver to reduce screen tearing and stuttering during fluctuating frame rates.",
      ],
      steps: [
        "Open Settings → System → Display → Graphics.",
        "Click 'Browse' or select a recently used app to add it to the list.",
        "Click the app and choose 'Options' to set High performance or Power saving.",
        "Toggle Auto HDR and Variable refresh rate near the top of the page if supported.",
      ],
    },
  },
  {
    id: "windows-fonts",
    title: "Fonts",
    icon: Type,
    platform: "windows",
    category: "personalization",
    controlType: "action",
    heading: "Manage Installed Fonts",
    description:
      "Fonts settings let you preview every typeface installed on your PC, download additional fonts from the Microsoft Store, and install new ones by dragging a font file directly onto the page. Every font installed here becomes available system-wide, appearing in the font list of every app that lets you choose one, from word processors to design software.",
    details: [
      "Scroll or search the installed font list, and click any font to preview its full character set and available weights.",
      "Drag and drop a .ttf or .otf font file onto the Fonts page, or double-click it in File Explorer, to install it.",
      "Click 'Get more fonts in Microsoft Store' to browse and install additional free typefaces.",
      "Uninstall a font directly from its preview page if you no longer need it.",
    ],
    important:
      "Fonts installed only for your user account won't be visible to other accounts on a shared PC or in apps running with elevated administrator permissions — install 'for all users' if you need broader availability.",
    redirectUrl: "ms-settings:fonts",
    whyItMatters:
      "Fonts settings are the one place that affects typography across literally every app on your PC, so installing a font once here makes it available everywhere instead of configuring it app by app. This matters most for anyone doing design work, branded document creation, or presentations that require a specific corporate or licensed typeface not included with Windows by default. Being able to preview a font's full character set before committing also helps confirm it actually includes the symbols, accents, or weights a specific project needs.",
    bestPractices: [
      "Preview a new font's full character set before relying on it for a document that needs special characters or multiple weights.",
      "Install fonts 'for all users' on a shared or work PC so every account can access them, rather than defaulting to just your own profile.",
      "Remove fonts you installed for a one-off project once you're done, to keep the font picker in your apps easier to scan.",
      "Check font licensing terms before installing a downloaded font for commercial or business documents, since not all free fonts permit commercial use.",
    ],
    commonIssues: [
      {
        issue: "A newly installed font doesn't appear in an already-open app's font list.",
        fix: "Close and reopen the app, since most software only refreshes its available font list when it starts, not while it's already running.",
      },
      {
        issue: "A font installed by one user account isn't visible when a different user signs in.",
        fix: "Reinstall it using 'Install for all users' (right-click the font file and choose that option) instead of the default per-user install.",
      },
      {
        issue: "An installed font displays incorrectly or is missing certain characters.",
        fix: "The font file itself may be an incomplete or corrupted download; uninstall it and get a fresh copy from the original source or the Microsoft Store.",
      },
    ],
    faqs: [
      {
        q: "Do fonts installed from the Microsoft Store cost anything?",
        a: "Most fonts available through 'Get more fonts in Microsoft Store' are free, though the store occasionally lists paid premium font families as well.",
      },
      {
        q: "Can I install a font without opening the Fonts settings page at all?",
        a: "Yes, double-clicking a .ttf or .otf file in File Explorer opens a small preview window with an Install button, which achieves the same result without visiting Settings.",
      },
      {
        q: "Will uninstalling a font break documents that already use it?",
        a: "The document will typically substitute a default font for any text using the removed typeface, so it's worth reinstalling the original font if you need the document to display exactly as originally formatted.",
      },
    ],
    tipsAndTricks: [
      "Type a specific font name directly into the search box at the top of the Fonts page instead of scrolling through the full alphabetical list.",
      "Use the font preview page's sample text field to type your own text and check exactly how a font renders your specific project's wording.",
    ],
    relatedSettingIds: ["windows-personalization", "language-region", "default-apps"],
    afterImageContent: {
      heading: "How Fonts Settings Work",
      paragraphs: [
        "Windows stores installed fonts in a shared system location that every app queries when building its own font selection list.",
        "Installing 'for all users' places the font where every account on the PC can see it, while a standard install keeps it scoped to your own profile.",
        "Fonts downloaded through the Microsoft Store install through the same underlying mechanism as manually dragged font files.",
      ],
      steps: [
        "Open Settings → Personalization → Fonts.",
        "Drag a font file onto the page, or click 'Get more fonts in Microsoft Store'.",
        "Click any installed font to preview its character set and available weights.",
        "Click 'Uninstall' on a font's preview page if you want to remove it.",
      ],
    },
  },
  {
    id: "windows-about-system-info",
    title: "About / System Information",
    icon: Info,
    platform: "windows",
    category: "system-info",
    frequentlyUsed: true,
    controlType: "action",
    heading: "View Device & Windows Specifications",
    description:
      "About shows your PC's core specifications at a glance — processor, installed RAM, device ID, and system type — alongside your exact Windows edition, version, and build number. It's the single quickest place to find the information support technicians, driver downloads, and compatibility checks almost always ask for first.",
    details: [
      "View processor model, installed RAM, and whether you're running 32-bit or 64-bit Windows under 'Device specifications'.",
      "Check 'Windows specifications' for your exact edition (Home, Pro, etc.), version number, and OS build.",
      "Click 'Copy' to copy your full device specifications to the clipboard for pasting into a support request.",
      "Access 'Rename this PC', 'Product key and activation', and 'Related links' like System protection directly from this page.",
    ],
    important:
      "The Windows version and build number shown here directly determines which features and security fixes your PC has, so a build far behind current releases can be worth investigating even if everything otherwise seems to work fine.",
    redirectUrl: "ms-settings:about",
    whyItMatters:
      "Nearly every troubleshooting guide, driver download page, and support conversation starts by asking for your exact Windows edition, version, and hardware specs, and this page answers all of it in one screen without hunting through multiple menus. Checking your OS build here is also a quick way to confirm whether a specific feature update has actually installed, since Windows Update's own status can occasionally lag behind reality. For anyone buying software or hardware, comparing minimum requirements against your actual RAM, processor, and system type here avoids a wasted purchase.",
    bestPractices: [
      "Use the 'Copy' button to grab your full specifications instantly whenever a support request or forum post asks for them, instead of retyping details manually.",
      "Check your OS build number here after a feature update to confirm it actually installed, rather than assuming from Windows Update's status page alone.",
      "Note your system type (64-bit vs 32-bit) before downloading any driver or software, since installers built for the wrong architecture simply won't run.",
      "Bookmark this page mentally as your starting point whenever an app or game's system requirements need checking against your actual hardware.",
    ],
    commonIssues: [
      {
        issue: "You need your Windows edition or build number for a support ticket but can't remember it.",
        fix: "Open About and read 'Windows specifications' directly, or use the 'Copy' button under Device specifications to grab everything at once.",
      },
      {
        issue: "A driver or app installer fails, complaining about the wrong system architecture.",
        fix: "Check 'System type' under Device specifications to confirm 64-bit vs 32-bit, and download the matching installer version instead.",
      },
      {
        issue: "Windows Update says a feature update installed, but the build number here doesn't match what you expected.",
        fix: "Restart the PC, since some feature updates fully register their new build number only after a subsequent restart completes any pending finalization steps.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between the OS build number and the version number?",
        a: "The version number (like 23H2) identifies the broader feature update release, while the build number is a more granular identifier that also reflects cumulative updates applied on top of that version.",
      },
      {
        q: "Can I rename my PC from this page?",
        a: "Yes, 'Rename this PC' is linked directly from About, though the new name only fully takes effect after a restart.",
      },
      {
        q: "Does this page show my product key?",
        a: "No, it links to a separate Activation page for license and product key details rather than displaying the key itself here.",
      },
    ],
    tipsAndTricks: [
      "Press Win+Pause/Break on keyboards that still have that key as a fast legacy shortcut into a similar system information view.",
      "Run 'winver' from the Run dialog (Win+R) for an even quicker popup showing just your Windows version and build number.",
    ],
    relatedSettingIds: ["windows-activation", "windows-advanced-system-settings", "windows-update"],
    afterImageContent: {
      heading: "How About / System Information Works",
      paragraphs: [
        "About reads hardware identification data directly from the system firmware and installed components to build the Device specifications section.",
        "Windows specifications are pulled from the operating system's own version registry, updating automatically as feature updates and cumulative updates install.",
        "The Copy button formats all of this information as plain text, ready to paste into an email, support ticket, or forum post.",
      ],
      steps: [
        "Open Settings → System → About.",
        "Review Device specifications for processor, RAM, and system type.",
        "Review Windows specifications for edition, version, and build number.",
        "Click 'Copy' if you need to share these details with someone else.",
      ],
    },
  },
  {
    id: "windows-advanced-system-settings",
    title: "Advanced System Settings",
    icon: Settings,
    platform: "windows",
    category: "system-info",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Configure Advanced System Properties",
    description:
      "Advanced System Settings (opened via sysdm.cpl or 'Advanced system settings' in search) is a legacy System Properties dialog covering performance options like visual effects and virtual memory, system startup and recovery behavior, user profile management, and manual environment variable editing. These controls predate the modern Settings app and remain the only place for several deeper configuration options.",
    details: [
      "Performance tab: adjust visual effects for best appearance or best performance, and configure virtual memory (paging file) size manually.",
      "Advanced tab → Startup and Recovery: set the default OS in a dual-boot setup and control what happens during a system crash (like whether to write a memory dump).",
      "Advanced tab → Environment Variables: view and edit user and system-level variables like PATH, often needed for development tools.",
      "System Protection tab: enable System Restore points per drive and manage existing restore points.",
    ],
    important:
      "Editing the system PATH environment variable incorrectly, such as deleting an existing entry instead of appending to it, can break command-line tools and even some installed applications until it's corrected.",
    redirectUrl:
      "https://support.microsoft.com/en-us/windows/tips-to-improve-pc-performance-in-windows-b3b3ef5b-5953-fb6a-2528-4bbed82fba96",
    whyItMatters:
      "This dialog holds several settings with no modern Settings app equivalent, including manual virtual memory sizing, environment variables, and System Restore configuration, making it essential for developers, power users, and anyone troubleshooting deep performance or memory issues. Virtual memory and visual effects tuning specifically matter on lower-RAM systems, where the wrong paging file size or excessive animation overhead can measurably slow things down. Because environment variables like PATH affect how command-line tools locate executables, correctly editing them here is often required after manually installing developer tools that don't ship a proper installer.",
    bestPractices: [
      "Leave virtual memory on 'Automatically manage paging file size' unless you have a specific, informed reason to set a custom size manually.",
      "Append new entries to PATH with a semicolon separator rather than replacing the existing value outright, to avoid breaking other tools that depend on it.",
      "Enable System Protection on your main drive if it isn't already, so a restore point exists before you need one.",
      "Choose 'Adjust for best performance' on older or lower-spec hardware if animations feel sluggish, then selectively re-enable specific effects you actually miss.",
      "Create a manual restore point under System Protection before editing environment variables or virtual memory settings, in case you need to revert quickly.",
    ],
    commonIssues: [
      {
        issue: "A command-line tool isn't recognized even though it's clearly installed.",
        fix: "Check the PATH variable under Environment Variables to confirm the tool's install folder is actually listed, and add it if missing, then reopen any open Command Prompt or PowerShell windows to pick up the change.",
      },
      {
        issue: "PC runs low on memory during heavy multitasking despite having a reasonable amount of RAM.",
        fix: "Check virtual memory settings under the Performance tab and ensure 'Automatically manage paging file size' is enabled, or increase the custom size if it's been manually capped too low.",
      },
      {
        issue: "System Restore isn't available when you need to roll back a recent change.",
        fix: "Check the System Protection tab to confirm restore points are actually enabled for that drive, since it's off by default on many Windows 11 installations.",
      },
      {
        issue: "Windows feels visually sluggish with animations and transparency enabled.",
        fix: "Open Performance Options from the Advanced tab and either choose 'Adjust for best performance' or manually uncheck specific effects like 'Animate windows when minimizing and maximizing'.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between this dialog and the modern System settings page?",
        a: "The modern Settings app covers everyday options like display and power, while Advanced System Settings exposes deeper, less frequently needed configuration like virtual memory, environment variables, and crash-time recovery behavior that Microsoft hasn't migrated to the newer interface.",
      },
      {
        q: "Do I need administrator rights to change these settings?",
        a: "Yes, most changes here, including environment variables at the system level and virtual memory settings, require administrator permissions and will prompt for elevation if you're not already running as one.",
      },
      {
        q: "Is it safe to edit environment variables if I'm not a developer?",
        a: "Generally yes if you're only viewing them, but avoid editing PATH or other system variables unless you know specifically what you're changing, since incorrect edits can affect how installed software locates its own files.",
      },
    ],
    tipsAndTricks: [
      "Search 'advanced system settings' directly from the Start menu as the fastest way to open this dialog without navigating through Settings.",
      "Run 'sysdm.cpl' from the Run dialog (Win+R) to jump straight to the System Properties dialog this page is part of.",
    ],
    relatedSettingIds: ["windows-about-system-info", "storage-settings", "power-sleep"],
    afterImageContent: {
      heading: "How Advanced System Settings Works",
      paragraphs: [
        "This dialog is a legacy Control Panel-style interface that predates the modern Settings app, organized into tabs for Computer Name, Hardware, Advanced, and System Protection.",
        "The Advanced tab itself branches into three dedicated sub-dialogs for Performance, User Profiles, and Startup and Recovery, each covering a distinct area of configuration.",
        "Because several of these controls, like virtual memory and environment variables, have no modern Settings app equivalent, this dialog remains necessary for certain troubleshooting and development scenarios.",
      ],
      steps: [
        "Search 'Advanced system settings' from the Start menu, or run sysdm.cpl.",
        "Select the Advanced tab in the System Properties dialog that opens.",
        "Click 'Settings' under Performance, or 'Environment Variables' near the bottom, depending on what you need to configure.",
        "Apply your changes and restart if prompted, especially after editing virtual memory settings.",
      ],
    },
  },
  {
    id: "windows-storage-sense",
    title: "Storage Sense",
    icon: Trash2,
    platform: "windows",
    category: "storage-backup-data",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Automate Disk Cleanup with Storage Sense",
    description:
      "Storage Sense automatically frees up disk space by deleting temporary files, emptying the Recycle Bin after a set number of days, and clearing out old files from your Downloads folder on a schedule you configure. Once set up, it runs quietly in the background so you don't have to remember to manually clean up disk clutter yourself.",
    details: [
      "Turn Storage Sense on to enable automatic background cleanup, or run it immediately with 'Run Storage Sense now'.",
      "Set how often it runs automatically: during low disk space, or on a daily, weekly, or monthly schedule.",
      "Configure separate retention periods for temporary files, Recycle Bin contents, and the Downloads folder.",
      "Enable cloud content cleanup to make locally-synced OneDrive files that haven't been opened recently 'online-only' again to save local space.",
    ],
    important:
      "By default, Storage Sense's Downloads folder cleanup can delete files that have simply been sitting there for a set number of days, regardless of whether you still need them, so review that specific setting carefully before enabling it.",
    redirectUrl: "ms-settings:storagepolicies",
    whyItMatters:
      "Storage Sense automates exactly the kind of routine disk cleanup most people mean to do manually but rarely actually get around to, which is why drives quietly fill up with temp files and forgotten downloads over months of everyday use. Because it can also convert rarely-used OneDrive files back to cloud-only placeholders, it helps keep a smaller local drive from filling up even when you're syncing a much larger cloud library. Setting it up once and trusting it to run on schedule is a meaningfully better strategy than remembering to run Disk Cleanup manually every so often.",
    bestPractices: [
      "Set Downloads folder cleanup to a longer interval, like 60 days, or disable it entirely if you tend to leave important files sitting there.",
      "Enable automatic cloud content cleanup if you sync a large OneDrive library to a smaller local drive, so local space doesn't fill up with rarely-used files.",
      "Run Storage Sense manually right after a big Windows feature update to quickly reclaim space from leftover update files.",
      "Review what Storage Sense actually cleared the first few times it runs automatically, so you understand its behavior before trusting it fully unattended.",
      "Pair Storage Sense's ongoing automatic cleanup with an occasional manual check of 'Cleanup recommendations' for larger one-off files it doesn't target.",
    ],
    commonIssues: [
      {
        issue: "An important file recently placed in Downloads was unexpectedly deleted.",
        fix: "Check the configured retention period under Storage Sense's Downloads folder setting and lengthen it or turn that specific rule off, since it deletes based on file age regardless of importance.",
      },
      {
        issue: "Storage Sense doesn't seem to free up as much space as expected.",
        fix: "Confirm it's actually scheduled to run automatically rather than only manually, and check that cloud content cleanup is enabled if a large synced OneDrive library is part of the problem.",
      },
      {
        issue: "OneDrive files keep becoming 'online-only' sooner than you'd like.",
        fix: "Increase or disable the 'free up space by making files online-only if not opened for over X days' setting under Storage Sense's cloud content section.",
      },
    ],
    faqs: [
      {
        q: "Can I recover a file Storage Sense deleted from the Recycle Bin?",
        a: "Only if it hasn't yet passed your configured retention period and you catch it before Storage Sense's next scheduled run — once permanently removed from the Recycle Bin, it typically requires third-party data recovery software.",
      },
      {
        q: "Does Storage Sense delete files from OneDrive itself, or just the local copy?",
        a: "It only changes rarely-used synced files to online-only locally, freeing local disk space while keeping the actual files safely stored in the cloud.",
      },
      {
        q: "Is Storage Sense the same tool as the older Disk Cleanup utility?",
        a: "They overlap in purpose, but Storage Sense runs automatically on a schedule and integrates with OneDrive, while Disk Cleanup is a manual, one-time tool without OneDrive-aware cloud content management.",
      },
    ],
    tipsAndTricks: [
      "Click 'Run Storage Sense now' immediately after a major feature update to reclaim space from leftover installation files right away instead of waiting for the next scheduled run.",
      "Set a longer Recycle Bin retention period if you routinely realize you need a deleted file back a few weeks later.",
    ],
    relatedSettingIds: ["storage-settings", "windows-file-history", "windows-backup"],
    updateFrequency: "Runs automatically on its configured schedule; review retention settings every few months",
    afterImageContent: {
      heading: "How Storage Sense Works",
      paragraphs: [
        "Storage Sense runs in the background according to the schedule you set, checking temporary files, the Recycle Bin, and Downloads against your configured retention periods.",
        "When enabled, it can also mark infrequently accessed OneDrive files as online-only, removing their local copy while keeping them accessible from the cloud on demand.",
        "Running it manually via 'Run Storage Sense now' applies the exact same rules immediately instead of waiting for its next scheduled pass.",
      ],
      steps: [
        "Open Settings → System → Storage → Storage Sense.",
        "Turn on Storage Sense and choose how often it runs automatically.",
        "Set retention periods for temporary files, Recycle Bin, and Downloads.",
        "Configure cloud content cleanup if you sync a large OneDrive library.",
      ],
    },
  },
  {
    id: "windows-file-history",
    title: "File History",
    icon: History,
    platform: "windows",
    category: "storage-backup-data",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Back Up Files with File History",
    description:
      "File History is a legacy Control Panel backup tool that continuously copies versions of files in your libraries, desktop, contacts, and favorites to an external drive or network location. Unlike a single backup snapshot, it keeps multiple versions over time, letting you restore not just a deleted file but an earlier version of one you've since changed.",
    details: [
      "Connect an external drive or select a network location before turning File History on for the first time.",
      "Add or remove folders from backup coverage by including them in your libraries.",
      "Use 'Restore personal files' to browse through previous versions and pick a specific point in time to recover from.",
      "Configure how often File History saves copies and how long versions are kept under 'Advanced settings'.",
    ],
    important:
      "File History requires a drive to be connected (or a reachable network location) at the moment it runs — if your external drive is unplugged for an extended period, no new versions are saved until you reconnect it.",
    redirectUrl:
      "https://support.microsoft.com/en-us/windows/backup-and-restore-with-file-history-7bf065bf-f1ea-0a78-c1cf-7dcf51cc8bfc",
    whyItMatters:
      "File History protects against more than just a failed drive — its version history also recovers you from accidentally overwriting or badly editing a file, since you can restore a version from before the mistake, not just the most recent backup. Because it targets specific folders and updates continuously rather than requiring a manual full backup routine, it fits well as an always-on safety net running quietly in the background. For anyone who's ever needed 'yesterday's version' of a document rather than just today's, this is the tool built specifically for that scenario.",
    bestPractices: [
      "Use a dedicated external drive that stays connected as much as possible, rather than one you frequently unplug and move elsewhere.",
      "Add any folders you actively work in but that live outside your default libraries, since File History only backs up included library locations by default.",
      "Set the version retention under Advanced settings to 'Until space is needed' if you want the longest practical history without manual management.",
      "Test 'Restore personal files' occasionally to confirm your backup is actually working and versions are genuinely being saved.",
    ],
    commonIssues: [
      {
        issue: "File History says it hasn't run in a long time.",
        fix: "Reconnect the designated backup drive, since File History only saves new versions while its target drive or network location is actually reachable.",
      },
      {
        issue: "A folder you use daily isn't being backed up.",
        fix: "Add it to one of your libraries (Documents, Pictures, etc.) under File Explorer, since File History only covers folders included in a library, the desktop, contacts, and favorites by default.",
      },
      {
        issue: "The backup drive fills up with old versions.",
        fix: "Adjust 'Keep saved versions' under Advanced settings to a shorter retention window, or manually clean up very old versions if you no longer need them.",
      },
    ],
    faqs: [
      {
        q: "How is File History different from Windows Backup (the OneDrive-based one)?",
        a: "File History backs up to a local external drive or network share and keeps multiple versions over time, while Windows Backup syncs specific folders continuously to OneDrive in the cloud rather than a physical drive.",
      },
      {
        q: "Can I use File History with more than one external drive?",
        a: "You can only actively back up to one designated drive at a time, though you can switch the target drive later and File History will continue versioning to the new location going forward.",
      },
      {
        q: "Does File History back up my entire PC, including apps and system files?",
        a: "No, it only covers personal files in libraries, the desktop, contacts, and favorites — it isn't a full system image backup and won't restore installed applications or system settings.",
      },
    ],
    tipsAndTricks: [
      "Search 'File History' directly from the Start menu, since it's a Control Panel item without a dedicated modern Settings page or ms-settings link.",
      "Right-click a specific file in File Explorer and check its 'Previous Versions' tab (if available) as a quicker way to restore a single file without opening the full File History interface.",
    ],
    relatedSettingIds: ["windows-backup", "windows-storage-sense", "storage-settings"],
    updateFrequency: "Saves new versions continuously while the target drive is connected; review retention settings periodically",
    afterImageContent: {
      heading: "How File History Works",
      paragraphs: [
        "File History periodically scans included library folders, the desktop, contacts, and favorites, saving a new version of any file that's changed since the last scan.",
        "Multiple versions of the same file are kept over time according to your configured retention setting, rather than being overwritten by each new save.",
        "Restoring uses a visual timeline, letting you step backward through previous versions of a folder or file until you find the one you need.",
      ],
      steps: [
        "Search 'File History' from the Start menu to open the Control Panel item.",
        "Connect an external drive or select a network location, then turn File History on.",
        "Click 'Advanced settings' to configure how often it saves and how long versions are kept.",
        "Use 'Restore personal files' to browse and recover a previous version when needed.",
      ],
    },
  },
  {
    id: "windows-nearby-sharing",
    title: "Nearby Sharing",
    icon: Share2,
    platform: "windows",
    category: "connectivity-network",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Share Files with Nearby Devices",
    description:
      "Nearby Sharing lets you send files, photos, and links wirelessly to another nearby Windows PC using Bluetooth and WiFi together, without needing a shared network drive, email, or a USB stick. Both the sending and receiving PC need Nearby Sharing turned on and Bluetooth enabled for it to work.",
    details: [
      "Turn Nearby Sharing on and choose whether to receive from 'Everyone nearby' or only 'My devices'.",
      "Set where received files are saved, defaulting to your Downloads folder.",
      "Share directly from File Explorer's right-click 'Share' option, or from the Share button in supporting apps.",
      "Both devices need Bluetooth turned on and to be within roughly close range for discovery to work.",
    ],
    important:
      "Setting Nearby Sharing to 'Everyone nearby' makes your PC's Bluetooth name and general availability visible to any nearby device attempting to share, not just people you know are trying to send you something.",
    redirectUrl:
      "https://support.microsoft.com/en-us/windows/share-things-with-nearby-devices-in-windows-0efbfe40-e3e2-581b-13f4-1a0e9936c2d9",
    whyItMatters:
      "Nearby Sharing solves the common annoyance of needing to move a file between two nearby PCs without emailing it to yourself, hunting for a USB drive, or setting up network sharing permissions. Because it works over Bluetooth and WiFi directly between devices, it doesn't require both PCs to be on the same network or signed into the same account, making it genuinely useful in shared offices, classrooms, or homes with multiple family PCs. Understanding the 'Everyone nearby' versus 'My devices' distinction also matters, since the more open setting trades some privacy for convenience.",
    bestPractices: [
      "Set Nearby Sharing to 'My devices' if you primarily share between your own PCs signed into the same Microsoft account, for a tighter and more private default.",
      "Turn Nearby Sharing off when you're not actively using it in a public space, rather than leaving 'Everyone nearby' on indefinitely.",
      "Confirm Bluetooth is enabled on both devices before troubleshooting further, since it's a common and easily missed requirement.",
      "Change the default save location for received files if Downloads isn't where you'd prefer shared content to land.",
    ],
    commonIssues: [
      {
        issue: "A nearby PC doesn't appear as a sharing option.",
        fix: "Confirm both PCs have Bluetooth turned on and Nearby Sharing enabled, and keep them within a few feet of each other during the initial share attempt.",
      },
      {
        issue: "Nearby Sharing worked before but has stopped working recently.",
        fix: "Toggle Nearby Sharing off and back on on both devices, and check that neither PC's Bluetooth adapter driver needs an update in Device Manager.",
      },
      {
        issue: "You're unsure who could see your PC while Nearby Sharing is active.",
        fix: "Switch from 'Everyone nearby' to 'My devices' if you only intend to share between PCs signed into your own Microsoft account.",
      },
    ],
    faqs: [
      {
        q: "Does Nearby Sharing work between a Windows PC and a phone?",
        a: "No, Nearby Sharing is a Windows-to-Windows feature; sharing between a PC and a phone typically requires a different method, like Bluetooth file transfer, cloud storage, or a manufacturer-specific cross-device app.",
      },
      {
        q: "Do both PCs need to be on the same WiFi network?",
        a: "Not strictly — Nearby Sharing can use Bluetooth alone for discovery and smaller transfers, though being on the same network can improve transfer speed for larger files.",
      },
      {
        q: "Can I choose exactly where a received file is saved each time?",
        a: "Not per transfer, but you can change the default save folder for all received files under Nearby Sharing's settings if Downloads isn't where you want them.",
      },
    ],
    tipsAndTricks: [
      "Right-click any file in File Explorer and choose 'Share' as the quickest way to start a Nearby Sharing transfer without opening a separate app.",
      "Keep both devices unlocked and awake during the transfer, since Nearby Sharing can pause or fail if either PC goes to sleep mid-transfer.",
    ],
    relatedSettingIds: ["bluetooth-settings", "wifi-connection", "windows-mobile-hotspot"],
    afterImageContent: {
      heading: "How Nearby Sharing Works",
      paragraphs: [
        "Nearby Sharing uses Bluetooth to discover nearby compatible devices and WiFi Direct or an existing network to actually transfer the file content.",
        "Both the sending and receiving PC must have Nearby Sharing and Bluetooth enabled for the discovery and transfer process to succeed.",
        "Received files land in your configured default folder, typically Downloads, ready to open immediately after the transfer completes.",
      ],
      steps: [
        "Open Settings → System → Nearby sharing.",
        "Turn Nearby sharing on and choose 'Everyone nearby' or 'My devices'.",
        "On the sending PC, right-click a file in File Explorer and choose Share.",
        "Select the nearby device from the list and accept the transfer on the receiving PC.",
      ],
    },
  },
  {
    id: "windows-voice-typing",
    title: "Voice Typing",
    icon: Mic,
    platform: "windows",
    category: "accessibility-language",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Dictate Text with Voice Typing",
    description:
      "Voice Typing lets you dictate text directly into any text field using your PC's microphone instead of a physical keyboard, powered by online speech recognition. Triggered with Win+H, it includes automatic punctuation, voice commands for corrections, and support for multiple dictation languages.",
    details: [
      "Press Win+H in any text field to open the voice typing toolbar and start dictating.",
      "Enable 'Automatic punctuation' so pauses in speech insert periods and commas without you needing to say them explicitly.",
      "Say commands like 'delete that' or 'new line' while dictating for basic hands-free editing.",
      "Change the dictation language from the voice typing toolbar's settings icon if you type in more than one language.",
    ],
    important:
      "Voice typing requires an active internet connection, since it relies on Microsoft's online speech recognition service rather than fully offline processing.",
    redirectUrl:
      "https://support.microsoft.com/en-us/windows/use-voice-typing-to-talk-instead-of-type-on-your-pc-fec94565-c4bd-329d-e59a-af033fa5689f",
    whyItMatters:
      "Voice typing turns hands-free dictation into a built-in Windows feature rather than something you need dedicated third-party software for, which matters for accessibility, for anyone who types faster by speaking than typing, and for quick messages when your hands are occupied. Automatic punctuation and voice commands for basic editing mean you can produce reasonably clean text without touching the keyboard at all in many cases. Because it requires an internet connection, understanding that dependency upfront avoids the confusion of voice typing silently failing to work while offline.",
    bestPractices: [
      "Enable automatic punctuation if you don't want to manually say 'period' or 'comma' throughout your dictation.",
      "Speak in a normal, steady pace and pause briefly between sentences, since automatic punctuation relies on those pauses to place breaks correctly.",
      "Set your dictation language explicitly if you regularly switch languages, rather than assuming it will detect the correct one automatically.",
      "Use voice commands like 'delete that' immediately after a mistake rather than switching to the keyboard mid-dictation, to keep the flow hands-free.",
    ],
    commonIssues: [
      {
        issue: "Win+H doesn't open the voice typing toolbar.",
        fix: "Confirm your cursor is actually active inside a text field first, and check that microphone permission and access are enabled under Privacy & Security → Microphone.",
      },
      {
        issue: "Voice typing stops working with no error message.",
        fix: "Check your internet connection, since voice typing relies entirely on Microsoft's online speech recognition service and won't function offline.",
      },
      {
        issue: "Dictated text has frequent punctuation or capitalization errors.",
        fix: "Speak with clearer, more deliberate pauses between sentences, and confirm 'Automatic punctuation' is enabled in the voice typing toolbar's settings.",
      },
    ],
    faqs: [
      {
        q: "Can I use voice typing without an internet connection?",
        a: "No, voice typing depends on Microsoft's online speech recognition service, so it won't work without an active internet connection.",
      },
      {
        q: "Is voice typing the same as Windows Speech Recognition?",
        a: "No, they're separate features — voice typing dictates text into any text field via Win+H, while Windows Speech Recognition is a more extensive tool for controlling the entire PC by voice, including opening apps and clicking buttons.",
      },
      {
        q: "Can I dictate in a language other than English?",
        a: "Yes, click the settings icon on the voice typing toolbar to choose from several supported dictation languages before you start speaking.",
      },
    ],
    tipsAndTricks: [
      "Say 'stop listening' or press Win+H again to pause voice typing without closing the text field you're working in.",
      "Combine voice typing with a good external or headset microphone for noticeably more accurate transcription than a laptop's built-in mic in a noisy room.",
    ],
    relatedSettingIds: ["windows-accessibility", "language-region", "windows-keyboard"],
    afterImageContent: {
      heading: "How Voice Typing Works",
      paragraphs: [
        "Voice typing streams your speech to Microsoft's online speech recognition service, which returns transcribed text directly into whatever field your cursor is active in.",
        "Automatic punctuation analyzes natural pauses in your speech to insert periods, commas, and other punctuation without you needing to say them aloud.",
        "Voice commands like 'delete that' and 'new line' are recognized separately from dictated text, letting you make basic edits without switching to the keyboard.",
      ],
      steps: [
        "Click into any text field where you want to dictate.",
        "Press Win+H to open the voice typing toolbar.",
        "Wait for the 'Listening...' indicator and begin speaking.",
        "Say 'stop listening' or press Win+H again to end dictation.",
      ],
    },
  },
  {
    id: "windows-game-mode",
    title: "Game Mode",
    icon: Gamepad2,
    platform: "windows",
    category: "display-sound-notifications",
    controlType: "action",
    heading: "Optimize Performance with Game Mode",
    description:
      "Game Mode prioritizes system resources for the game you're actively playing, preventing Windows Update from installing updates or restarting the PC mid-session, and reducing background activity that could interrupt gameplay. It's a single toggle designed to squeeze more consistent performance out of the same hardware during full-screen gaming.",
    details: [
      "Turn Game Mode on to have Windows deprioritize background tasks in favor of the active game.",
      "Game Mode automatically prevents Windows Update from restarting the PC while a game is running.",
      "It works alongside, not instead of, driver-level game optimization features from GPU manufacturers like NVIDIA or AMD.",
      "Game Mode applies automatically to games recognized by Windows without needing per-game configuration.",
    ],
    important:
      "Game Mode's performance impact varies significantly by game and hardware — on some systems it provides a noticeable smoothness improvement, while on others, especially those with plenty of spare CPU and GPU headroom, the difference is barely measurable.",
    redirectUrl: "ms-settings:gaming-gamemode",
    whyItMatters:
      "Game Mode exists specifically to stop Windows' own background housekeeping, like driver installation checks or scheduled restarts, from interrupting a game session at the worst possible moment. For lower and mid-range hardware in particular, deprioritizing background tasks can meaningfully reduce stutter and frame drops caused by competing CPU and disk activity. Because it's a single toggle with no real downside for gaming, there's little reason to leave it off if you regularly play full-screen games on the PC.",
    bestPractices: [
      "Leave Game Mode enabled by default, since it has essentially no downside during gaming and no effect at all during normal desktop use.",
      "Pair Game Mode with your GPU manufacturer's own game-optimization software (like NVIDIA GeForce Experience) for a fuller optimization stack rather than relying on Game Mode alone.",
      "Don't expect Game Mode alone to fix serious performance issues rooted in outdated drivers or insufficient hardware, since it optimizes scheduling, not raw capability.",
      "Check that a game is actually running in true full-screen or borderless mode if Game Mode doesn't seem to engage, since detection can be less reliable in windowed mode.",
    ],
    commonIssues: [
      {
        issue: "Game Mode doesn't seem to improve performance at all.",
        fix: "Confirm the game is recognized and running in full-screen or borderless mode, and check that background apps, not general system load, were actually the bottleneck to begin with.",
      },
      {
        issue: "A scheduled Windows Update restart interrupts a game session anyway.",
        fix: "Confirm Game Mode is turned on before starting the game, since its update-suppression behavior only applies once a supported game is actively running and recognized.",
      },
      {
        issue: "Frame rate stutters occur even with Game Mode on.",
        fix: "Check for outdated GPU drivers via Device Manager or the manufacturer's own updater, since Game Mode manages scheduling priority but doesn't replace proper driver updates.",
      },
    ],
    faqs: [
      {
        q: "Does Game Mode increase my FPS directly?",
        a: "Not by boosting raw hardware performance — it reduces background interference and scheduling conflicts, which can indirectly reduce stutter and improve consistency, especially on systems with less headroom to spare.",
      },
      {
        q: "Is Game Mode the same as a GPU manufacturer's performance mode?",
        a: "No, Game Mode is a Windows-level scheduling and background-activity feature, while GPU-specific tools like NVIDIA GeForce Experience or AMD Software optimize driver-level settings — the two work well together rather than replacing each other.",
      },
      {
        q: "Can Game Mode cause any downsides while gaming?",
        a: "It's designed to have essentially no downside for full-screen games, though on rare occasions some background recording or streaming software has reported reduced priority while Game Mode is active.",
      },
    ],
    tipsAndTricks: [
      "Press Win+G to open the Xbox Game Bar during a session, which shows whether Game Mode is currently active for that specific game.",
      "Check Graphics settings for per-app 'High performance' GPU assignment alongside Game Mode for the fullest combined optimization on laptops with two GPUs.",
    ],
    relatedSettingIds: ["windows-graphics", "display-settings", "power-sleep"],
    afterImageContent: {
      heading: "How Game Mode Works",
      paragraphs: [
        "Game Mode adjusts Windows' background task scheduling to favor the actively running game whenever it's recognized as a full-screen or borderless game.",
        "It automatically defers Windows Update installations and restart prompts while a supported game session is active, resuming normal update behavior once you exit.",
        "Because it operates at the OS scheduling level, it complements rather than replaces GPU driver-level optimization tools from manufacturers like NVIDIA and AMD.",
      ],
      steps: [
        "Open Settings → Gaming → Game Mode.",
        "Toggle Game Mode on.",
        "Launch a full-screen or borderless game to let Windows automatically apply the optimization.",
        "Press Win+G during a session to confirm Game Mode's status via the Xbox Game Bar overlay.",
      ],
    },
  },
  {
    id: "windows-bitlocker",
    title: "BitLocker Device Encryption",
    icon: LockKeyhole,
    platform: "windows",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    heading: "Encrypt Your Drive with Device Encryption",
    description:
      "Device Encryption (built on BitLocker technology) encrypts your entire system drive so its contents are unreadable to anyone without your Windows sign-in credentials or a separate recovery key, even if the physical drive is removed and connected to another PC. It's automatically available on many modern PCs that meet specific hardware requirements, and can be extended to additional drives on Pro, Enterprise, and Education editions.",
    details: [
      "Check whether Device Encryption is already on for your system drive, since many newer PCs enable it automatically during setup.",
      "Turn on Device Encryption manually if it's available but currently off, which requires signing in with a Microsoft account.",
      "Your recovery key is automatically saved to your Microsoft account online, letting you retrieve it if you're ever locked out.",
      "Pro, Enterprise, and Education editions can additionally use the full BitLocker Drive Encryption Control Panel tool to encrypt removable and secondary drives with more configuration options.",
    ],
    important:
      "Losing access to your recovery key while also being locked out of your Microsoft account can mean permanently losing access to your encrypted data — save or print your recovery key somewhere separate from the PC itself as a backup.",
    redirectUrl: "ms-settings:deviceencryption",
    whyItMatters:
      "Device Encryption protects your data from a real and common risk: a lost or stolen laptop, where an unencrypted drive lets anyone with physical access simply remove it and read your files on another machine. Because encryption happens transparently in the background once enabled, it costs you essentially nothing in daily convenience while closing a genuine security gap. For anyone storing sensitive personal or work data on a portable device, having this on is one of the highest-value, lowest-effort security decisions available in Windows.",
    bestPractices: [
      "Confirm your recovery key is actually saved to your Microsoft account (or printed/saved elsewhere) before relying on Device Encryption being fully protective.",
      "Enable Device Encryption on every portable device that holds sensitive files, not just your primary daily-use laptop.",
      "Keep your Microsoft account credentials secure and recoverable, since losing access to that account can complicate retrieving your recovery key later.",
      "Use the full BitLocker Control Panel tool on Pro, Enterprise, or Education editions if you need to encrypt a removable USB drive or a secondary internal disk.",
      "Avoid disabling Device Encryption temporarily for unrelated troubleshooting unless specifically instructed to, since re-encryption takes time to complete afterward.",
    ],
    commonIssues: [
      {
        issue: "Windows asks for a recovery key unexpectedly at startup.",
        fix: "This is usually triggered by a significant hardware or firmware change (like a BIOS update); retrieve your recovery key from your Microsoft account's device page at account.microsoft.com to unlock the drive.",
      },
      {
        issue: "Device Encryption option doesn't appear in Settings at all.",
        fix: "Your specific hardware may not meet Device Encryption's requirements (like Modern Standby or a TPM 2.0 chip); check if your edition supports the full BitLocker Control Panel tool instead, which has broader hardware compatibility.",
      },
      {
        issue: "You're not sure whether your drive is actually encrypted.",
        fix: "Check Settings → Privacy & Security → Device encryption for its current status, or run 'manage-bde -status' in an elevated Command Prompt for a detailed per-drive breakdown.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Device Encryption and full BitLocker?",
        a: "Device Encryption is a simplified, automatically-managed version available on more editions and hardware configurations, while full BitLocker (Pro, Enterprise, Education) offers more granular control, including encrypting removable drives and choosing specific encryption methods.",
      },
      {
        q: "Does encryption slow down my PC noticeably?",
        a: "On modern hardware with built-in encryption acceleration, the performance impact is generally negligible for everyday use.",
      },
      {
        q: "What happens to my recovery key if I sell or give away my PC?",
        a: "You should decrypt the drive or fully reset the PC beforehand, since your recovery key remains tied to your Microsoft account and the new owner won't have legitimate access to your encrypted data anyway.",
      },
    ],
    tipsAndTricks: [
      "Visit account.microsoft.com/devices to check or retrieve saved BitLocker recovery keys for any of your devices from another computer or phone.",
      "Run 'manage-bde -status' in an elevated Command Prompt for a detailed technical view of encryption status beyond what the Settings page shows.",
    ],
    relatedSettingIds: ["windows-security", "windows-activation", "storage-settings"],
    afterImageContent: {
      heading: "How Device Encryption Works",
      paragraphs: [
        "Device Encryption uses your PC's TPM (Trusted Platform Module) chip to securely store encryption keys, unlocking the drive automatically when you sign in normally.",
        "Your recovery key acts as a backup unlock method, used when Windows detects a significant hardware or startup configuration change it can't automatically verify as trusted.",
        "On Pro, Enterprise, and Education editions, the full BitLocker Control Panel tool extends the same underlying encryption technology to additional drives with more manual configuration options.",
      ],
      steps: [
        "Open Settings → Privacy & Security → Device encryption.",
        "Check whether encryption is already on, since many PCs enable it automatically.",
        "Turn it on if available and sign in with a Microsoft account when prompted.",
        "Verify your recovery key is saved by checking account.microsoft.com/devices.",
      ],
    },
  },
{
  id: "windows-narrator",
  title: "Narrator",
  icon: Ear,
  platform: "windows",
  category: "accessibility-language",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Turn on the built-in screen reader",
  description: "Narrator is the screen reader built into Windows 11 that reads aloud on-screen text, describes buttons and controls, and lets you operate the entire system with the keyboard or touch instead of a mouse.",
  details: [
    "Toggle Narrator on or off, or set it to start automatically at sign-in",
    "Pick a voice, speaking speed, pitch, and volume",
    "Adjust verbosity for links, formatting, and image descriptions",
    "Choose what Narrator highlights on screen as it reads",
    "Enable scan mode for easier reading of web pages and long documents",
  ],
  important: "Once enabled, Narrator captures many keyboard shortcuts for its own commands, so unfamiliar users may find navigation confusing at first.",
  redirectUrl: "ms-settings:easeofaccess-narrator",
  whyItMatters: "Narrator is often the difference between a usable and an unusable PC for people who are blind or have low vision, and it also helps sighted users who want an audio description of what's happening on screen. Because it ships with Windows at no extra cost, it removes a major barrier to entry compared with paid third-party screen readers. It also matters for accessibility compliance in workplaces and schools that must provide assistive technology. Learning its shortcuts (Caps Lock as the Narrator key) turns a mouse-dependent interface into one that's fully operable by keyboard. It can also be launched from the sign-in screen, which is critical for setting up a new PC independently.",
  bestPractices: [
    "Learn the Narrator key (Caps Lock or Insert) before relying on it daily",
    "Use Narrator Home to walk through the basics the first time you turn it on",
    "Pick a natural-sounding Windows voice and adjust the rate to a comfortable speed",
    "Combine Narrator with high contrast or larger text size for low-vision users",
  ],
  commonIssues: [
    { issue: "Narrator reads too fast or too slow to follow", fix: "Open Narrator settings and adjust the speaking rate slider until it's comfortable." },
    { issue: "Keyboard shortcuts stop working as expected", fix: "Remember Narrator intercepts many keys; use the Narrator key combination to pass a key through to the app." },
    { issue: "Narrator won't start automatically at sign-in", fix: "Enable the 'Use Narrator before sign-in' and 'automatically start after sign-in' options in Narrator settings." },
  ],
  faqs: [
    { q: "Is Narrator free?", a: "Yes, it is built into every edition of Windows 11 at no extra cost." },
    { q: "Can I use Narrator on the lock screen?", a: "Yes, pressing Ctrl+Win+Enter on the sign-in screen starts Narrator before you log in." },
    { q: "Does Narrator work with web browsers?", a: "Yes, it works with Microsoft Edge and most modern browsers, including scan mode for easier page reading." },
  ],
  tipsAndTricks: [
    "Press Ctrl+Win+Enter anywhere, including the lock screen, to toggle Narrator instantly",
    "Use Narrator's QuickStart guide the first time to learn core commands without guesswork",
  ],
  relatedSettingIds: ["windows-accessibility", "windows-voice-access", "windows-text-size"],
  updateFrequency: "Set up once, adjust occasionally",
  afterImageContent: {
    heading: "How Narrator Works",
    paragraphs: [
      "Narrator runs as a background service that hooks into the Windows UI Automation framework, reading text and describing controls as focus moves around the screen.",
      "It supports both keyboard and touch input, with gestures for swiping through content on tablets and touchscreens.",
      "Voice, verbosity, and navigation behavior are all independently configurable, so the experience can be tuned for screen reading, low vision, or motor accessibility needs.",
    ],
    steps: [
      "Open Settings → Accessibility → Narrator",
      "Toggle Narrator on, or press Ctrl+Win+Enter",
      "Choose a voice and adjust speed, pitch, and volume",
      "Configure verbosity and startup behavior as needed",
    ],
  },
},
{
  id: "windows-contrast-themes",
  title: "Contrast Themes",
  icon: Contrast,
  platform: "windows",
  category: "accessibility-language",
  controlType: "action",
  heading: "Apply high-contrast color themes",
  description: "Contrast themes apply high-contrast color combinations across Windows and apps, making text and UI elements easier to distinguish for people with low vision or light sensitivity.",
  details: [
    "Choose from built-in themes like Aquatic, Desert, Dusk, and Night sky",
    "Customize individual colors for text, hyperlinks, backgrounds, and buttons",
    "Set a keyboard shortcut to quickly toggle contrast themes on or off",
    "Save a custom theme for reuse across devices",
  ],
  redirectUrl: "ms-settings:easeofaccess-highcontrast",
  whyItMatters: "Standard color schemes can make text and boundaries between UI elements hard to distinguish for users with low vision, color blindness, or light sensitivity. Contrast themes dramatically increase the visual separation between foreground and background elements, reducing eye strain and improving readability without needing third-party software. This is also useful in bright environments, like outdoor or window-lit workspaces, where standard contrast washes out. Because the setting applies system-wide, it affects the taskbar, File Explorer, and most built-in apps consistently, giving a predictable experience.",
  bestPractices: [
    "Try each built-in theme before customizing colors from scratch",
    "Enable the contrast theme keyboard shortcut so it can be toggled quickly when needed",
    "Pair a contrast theme with a larger text size for maximum readability",
    "Test custom color combinations for adequate contrast ratio before saving",
  ],
  commonIssues: [
    { issue: "Some third-party apps look broken in a contrast theme", fix: "Older apps that hardcode colors may render poorly; switch themes off for those sessions or report the issue to the app developer." },
    { issue: "Contrast theme keeps turning off unexpectedly", fix: "Check if the assigned keyboard shortcut is being triggered accidentally and reassign or disable it." },
    { issue: "Custom colors are hard to read", fix: "Increase the contrast between background and text colors when customizing a theme." },
  ],
  faqs: [
    { q: "Is this the same as Windows' old High Contrast mode?", a: "Yes, it was renamed to Contrast themes in Windows 11 but works the same way." },
    { q: "Can I create my own theme?", a: "Yes, you can customize each color category and save it as a new named theme." },
    { q: "Does it affect the desktop wallpaper?", a: "Yes, contrast themes replace the wallpaper with a solid background color for maximum clarity." },
  ],
  tipsAndTricks: [
    "Use Left Alt+Left Shift+Print Screen as the classic shortcut to toggle contrast quickly",
    "Combine with the Text Cursor settings to make the cursor stand out further",
  ],
  relatedSettingIds: ["windows-accessibility", "windows-visual-effects", "windows-text-size"],
  afterImageContent: {
    heading: "How Contrast Themes Work",
    paragraphs: [
      "Contrast themes override the standard color palette across Windows with a set of high-contrast foreground and background colors optimized for readability.",
      "Each element category, such as text, hyperlinks, and button faces, can be individually assigned a color from a curated palette.",
      "Themes are saved system-wide and persist across sign-ins and app launches once applied.",
    ],
    steps: [
      "Open Settings → Accessibility → Contrast themes",
      "Select a built-in theme from the dropdown",
      "Optionally customize individual color categories",
      "Select Apply, and enable the keyboard shortcut if desired",
    ],
  },
},
{
  id: "windows-text-size",
  title: "Text Size",
  icon: Type,
  platform: "windows",
  category: "accessibility-language",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Increase text size across Windows",
  description: "Text size lets you enlarge text in most Windows apps and menus independently of overall display scaling, making content easier to read without shrinking the layout of everything else.",
  details: [
    "Drag a slider to preview and apply larger text in real time",
    "Applies to File Explorer, Settings, and many built-in apps",
    "Works independently from display scaling and resolution",
    "Reverts easily by moving the slider back to the default position",
  ],
  redirectUrl: "ms-settings:easeofaccess-textsize",
  whyItMatters: "Many users find default text sizes too small to read comfortably, especially on high-resolution or small-format displays, and increasing text size is one of the simplest accessibility improvements available. Unlike full display scaling, which enlarges everything including icons and spacing, text size targeting keeps layouts compact while making words easier to read. This is particularly valuable for users with mild vision impairment who don't need a full magnifier. It's also a quick fix for glare-heavy or low-quality monitors where small fonts blur together.",
  bestPractices: [
    "Use the live preview pane to find a comfortable size before applying",
    "Combine with display scaling if text size alone isn't enough",
    "Reset to default if an app's layout breaks with larger text",
    "Revisit this setting after connecting a new or different-sized monitor",
  ],
  commonIssues: [
    { issue: "Increasing text size doesn't affect all apps", fix: "Text size only affects apps that support the accessibility text API; some third-party apps use display scaling instead." },
    { issue: "Text looks blurry after increasing size", fix: "Sign out and back in, or restart the app, so it can redraw at the new text size." },
    { issue: "Layout elements overlap after enlarging text", fix: "Reduce the text size slightly or use display scaling instead for that specific app." },
  ],
  faqs: [
    { q: "Does this change my screen resolution?", a: "No, it only enlarges text rendering, leaving resolution and most spacing unchanged." },
    { q: "Is this different from display scaling?", a: "Yes, display scaling enlarges everything uniformly, while text size targets only text." },
    { q: "Will this affect all installed apps?", a: "Only apps built with modern Windows UI frameworks respond to this setting; some legacy apps won't change." },
  ],
  tipsAndTricks: [
    "Use Ctrl+Scroll wheel within many apps for a quick temporary zoom instead",
    "Check the live preview text sample before committing to a size",
  ],
  relatedSettingIds: ["windows-accessibility", "display-settings", "windows-visual-effects"],
  afterImageContent: {
    heading: "How Text Size Works",
    paragraphs: [
      "Text size adjusts the font rendering scale used by apps that support the Windows accessibility text-scaling API, independent of the overall display scale factor.",
      "A live preview box shows a sample sentence so you can judge readability before applying changes system-wide.",
      "Because it targets text specifically, most icons, spacing, and window sizes remain unchanged, preserving screen real estate.",
    ],
    steps: [
      "Open Settings → Accessibility → Text size",
      "Drag the slider and review the live preview",
      "Select Apply to update text across supported apps",
    ],
  },
},
{
  id: "windows-text-cursor",
  title: "Text Cursor",
  icon: TextCursor,
  platform: "windows",
  category: "accessibility-language",
  controlType: "action",
  heading: "Customize the blinking text cursor",
  description: "Text cursor settings let you change the color, size, and indicator of the blinking cursor that appears when typing, making it easier to locate on screen.",
  details: [
    "Enable a text cursor indicator that adds a colored glow around the cursor",
    "Choose from preset indicator colors or pick a custom color",
    "Adjust cursor thickness for greater visibility",
    "Preview changes live before applying them",
  ],
  redirectUrl: "ms-settings:easeofaccess-cursor",
  whyItMatters: "The blinking text cursor is easy to lose track of on busy screens or for users with low vision, which can slow down typing and editing tasks considerably. Adding a bold, colored indicator around the cursor makes it instantly identifiable, reducing the time spent hunting for where text will be inserted. This is a small setting with an outsized daily impact for anyone who writes, edits, or codes for long stretches. It also benefits users with attention or tracking difficulties who lose their place easily while reading or editing.",
  bestPractices: [
    "Increase cursor thickness first before adding a color indicator",
    "Choose a high-contrast indicator color relative to your desktop theme",
    "Test cursor visibility across both light and dark apps",
    "Revisit after changing your display's contrast theme, since visibility needs may shift",
  ],
  commonIssues: [
    { issue: "Cursor indicator doesn't appear in some apps", fix: "Some legacy or non-standard text fields don't support the indicator overlay; this is an app limitation." },
    { issue: "Indicator color blends into the background", fix: "Choose a custom indicator color with stronger contrast against your typical background colors." },
    { issue: "Cursor still hard to see despite changes", fix: "Increase both thickness and indicator size together for maximum visibility." },
  ],
  faqs: [
    { q: "Does this change the mouse pointer too?", a: "No, mouse pointer appearance is a separate setting; this only affects the blinking text-entry cursor." },
    { q: "Can I turn off the indicator later?", a: "Yes, simply toggle the indicator off to return to the default thin cursor." },
    { q: "Does a thicker cursor affect typing speed?", a: "No, it's purely visual and has no effect on input performance." },
  ],
  tipsAndTricks: [
    "Combine a bold indicator color with contrast themes for maximum visibility",
    "Try a mid-range thickness first, since an overly thick cursor can obscure nearby characters",
  ],
  relatedSettingIds: ["windows-accessibility", "windows-mouse-pointer-touch", "windows-contrast-themes"],
  afterImageContent: {
    heading: "How Text Cursor Customization Works",
    paragraphs: [
      "This setting layers an optional colored indicator around the standard blinking text cursor and lets you adjust its width independently of the operating system's default rendering.",
      "Changes apply system-wide to any text field that uses the standard Windows text input caret.",
      "A live preview box updates instantly as you adjust thickness and indicator color.",
    ],
    steps: [
      "Open Settings → Accessibility → Text cursor",
      "Toggle on the text cursor indicator if desired",
      "Choose an indicator color and adjust cursor thickness",
      "Review the live preview and close Settings",
    ],
  },
},
{
  id: "windows-mouse-pointer-touch",
  title: "Mouse Pointer and Touch",
  icon: MousePointer2,
  platform: "windows",
  category: "accessibility-language",
  controlType: "action",
  heading: "Resize and recolor the mouse pointer",
  description: "This page controls the size, color, and style of the mouse pointer and touch indicator, making them easier to see and track across the screen.",
  details: [
    "Choose pointer size from small to extra-large using a slider",
    "Select a pointer style, including white, black, inverted, or a custom color",
    "Enable a visual touch indicator that shows a circle where you tap the screen",
    "Preview the pointer changes live before applying",
  ],
  redirectUrl: "ms-settings:easeofaccess-mousepointer",
  whyItMatters: "A small default pointer can be difficult to spot on large or high-resolution monitors, especially for users with low vision or those who frequently lose track of the cursor while multitasking across several windows. Increasing pointer size and choosing a high-contrast color meaningfully reduces the time and effort needed to locate the cursor. The touch indicator is also valuable for presentations and tutorials on touchscreens, since it visibly shows the audience where a tap occurred. Together these options make pointing devices more usable for a wider range of vision abilities and use cases.",
  bestPractices: [
    "Increase pointer size incrementally and test on your actual monitor setup",
    "Choose an inverted or custom-color pointer if the default blends into your desktop background",
    "Enable the touch indicator when giving touchscreen demonstrations or tutorials",
    "Re-check pointer visibility after switching between light and dark themes",
  ],
  commonIssues: [
    { issue: "Pointer reverts to default size in some full-screen games", fix: "Games that use exclusive fullscreen mode with custom cursors can override system pointer settings; this is expected behavior." },
    { issue: "Touch indicator doesn't appear", fix: "Confirm your device has a touchscreen and that the touch indicator toggle is enabled." },
    { issue: "Custom pointer color looks the same as before", fix: "Some apps use their own cursor graphics that ignore system color settings." },
  ],
  faqs: [
    { q: "Does this affect touchpad cursor behavior?", a: "No, this only changes the pointer's appearance, not touchpad sensitivity or gestures." },
    { q: "Can I set a custom pointer color?", a: "Yes, Windows 11 lets you pick any color for the pointer, not just the presets." },
    { q: "Will this slow down my PC?", a: "No, pointer size and color changes have no measurable performance impact." },
  ],
  tipsAndTricks: [
    "Use the largest pointer size temporarily when screen sharing so viewers can follow your cursor easily",
    "Pair a custom pointer color with contrast themes for the most visible combination",
  ],
  relatedSettingIds: ["windows-mouse", "windows-touchpad", "windows-text-cursor"],
  afterImageContent: {
    heading: "How Mouse Pointer and Touch Settings Work",
    paragraphs: [
      "This page controls the rendered size and color scheme of the system mouse pointer, independent of pointer speed or acceleration settings found elsewhere.",
      "The touch indicator overlays a temporary visual circle at each point of contact on touchscreen-enabled devices.",
      "All changes are previewed live and apply immediately without requiring a restart.",
    ],
    steps: [
      "Open Settings → Accessibility → Mouse pointer and touch",
      "Adjust the pointer size slider",
      "Select a pointer style or custom color",
      "Toggle the touch indicator on if using a touchscreen",
    ],
  },
},
{
  id: "windows-visual-effects",
  title: "Visual Effects",
  icon: Sparkles,
  platform: "windows",
  category: "accessibility-language",
  controlType: "action",
  heading: "Reduce animations and transparency effects",
  description: "Visual effects settings let you turn off animations, transparency, and auto-hiding scroll bars to create a simpler, calmer, and more predictable interface.",
  details: [
    "Toggle transparency effects for the taskbar and window backgrounds",
    "Turn off animations used when opening, closing, and minimizing windows",
    "Disable auto-hiding scroll bars so they're always visible",
    "Simplify and personalize the appearance of borders and controls",
  ],
  redirectUrl: "ms-settings:easeofaccess-visualeffects",
  whyItMatters: "Animations, transparency, and moving UI elements can be distracting or even disorienting for users with attention difficulties, vestibular disorders, or certain cognitive conditions, and this setting provides a quick way to reduce visual motion system-wide. Turning off transparency also improves text legibility for users with low vision, since it removes background bleed-through behind menus and the taskbar. Always-visible scroll bars help users who have difficulty triggering the auto-hide behavior with a mouse or touchpad. Collectively, these options make Windows calmer and more predictable without disabling any core functionality.",
  bestPractices: [
    "Turn off animations first if you experience motion sensitivity or distraction",
    "Disable transparency for better text contrast on busy wallpapers",
    "Enable always-visible scroll bars if auto-hide behavior is hard to trigger reliably",
    "Test each toggle individually to identify exactly what improves your comfort",
  ],
  commonIssues: [
    { issue: "Taskbar still looks transparent after disabling the toggle", fix: "Sign out and back in, since some transparency changes require a session refresh to fully apply." },
    { issue: "Some third-party apps still animate", fix: "This setting only controls built-in Windows animations, not every third-party application's own effects." },
    { issue: "Scroll bars take up more space after enabling always-visible mode", fix: "This is expected behavior; disable the toggle again if the extra space is undesirable." },
  ],
  faqs: [
    { q: "Will turning off animations improve performance?", a: "It can provide a minor performance benefit on lower-end hardware, though its main purpose is accessibility." },
    { q: "Does this affect the Start menu?", a: "Yes, Start menu and taskbar transparency are both controlled by this setting." },
    { q: "Can I turn off just one effect and keep the rest?", a: "Yes, each visual effect toggle can be adjusted independently." },
  ],
  tipsAndTricks: [
    "Disable transparency before adjusting contrast themes for the cleanest baseline",
    "Combine reduced animations with Focus Assist for the calmest desktop experience",
  ],
  relatedSettingIds: ["windows-accessibility", "windows-contrast-themes", "windows-game-mode"],
  afterImageContent: {
    heading: "How Visual Effects Settings Work",
    paragraphs: [
      "This page exposes toggles for the underlying Windows composition engine features that control transparency, animation, and scroll bar auto-hide behavior.",
      "Each toggle can be changed independently, letting you fine-tune exactly which effects are reduced.",
      "Changes generally apply immediately, though some transparency effects refresh fully only after signing out and back in.",
    ],
    steps: [
      "Open Settings → Accessibility → Visual effects",
      "Turn off Transparency effects if desired",
      "Turn off Animation effects if desired",
      "Enable Always show scrollbars for constant visibility",
    ],
  },
},
{
  id: "windows-voice-access",
  title: "Voice Access",
  icon: Mic,
  platform: "windows",
  category: "accessibility-language",
  controlType: "action",
  heading: "Control your PC entirely by voice",
  description: "Voice access lets you control your PC and author text using only your voice, including opening apps, clicking on-screen elements by number labels, and dictating and editing documents hands-free.",
  details: [
    "Enable voice access and choose whether it starts automatically at sign-in",
    "Turn on number labels or grid overlays to click any on-screen element by voice",
    "Use a customizable wake word to activate listening on demand",
    "Access a built-in command guide for supported voice commands",
  ],
  important: "Voice access requires an internet connection the first time to download the speech model, though recognition then runs on-device.",
  redirectUrl: "ms-settings:easeofaccess-speechrecognition",
  whyItMatters: "Voice access gives people with mobility or repetitive strain limitations a way to fully operate Windows without a mouse or keyboard, opening up computing for users who otherwise couldn't use a PC independently. Because it runs on-device rather than requiring a constant cloud connection, it's also fast and works reliably offline once set up. It's distinct from dictation tools in that it controls the operating system itself, not just text entry, letting users launch apps, click buttons, and navigate menus by voice. For many users with conditions like arthritis, carpal tunnel syndrome, or paralysis, this feature is a genuine assistive technology rather than a convenience.",
  bestPractices: [
    "Review the built-in command guide before relying on voice access for daily tasks",
    "Use number overlays for precise clicking instead of trying to describe elements verbally",
    "Set a distinct wake word if you share a room with others to avoid accidental activation",
    "Pair with Narrator if you also need audio feedback about what's on screen",
  ],
  commonIssues: [
    { issue: "Voice access doesn't recognize commands accurately", fix: "Retrain recognition by speaking clearly in a quiet environment and reviewing the command guide for exact phrasing." },
    { issue: "Feature won't turn on", fix: "Confirm your Windows edition and hardware meet the minimum requirements, and check for the initial speech model download." },
    { issue: "Wake word triggers accidentally from background noise", fix: "Change to a more distinctive wake word or switch to manual activation." },
  ],
  faqs: [
    { q: "Is this the same as Voice Typing?", a: "No, Voice Typing is for dictating text into fields, while Voice access controls the whole operating system, including clicking and app launching." },
    { q: "Does it work offline?", a: "Yes, after the initial one-time setup download, voice access recognition runs locally on the device." },
    { q: "Which languages are supported?", a: "Support varies by Windows version; check the command guide for the current list of supported languages." },
  ],
  tipsAndTricks: [
    "Say 'show numbers' to overlay clickable numbers on every visible element",
    "Say 'what can I say' at any time to bring up context-relevant commands",
  ],
  relatedSettingIds: ["windows-voice-typing", "windows-narrator", "windows-accessibility"],
  updateFrequency: "Set up once, revisit if commands change",
  afterImageContent: {
    heading: "How Voice Access Works",
    paragraphs: [
      "Voice access uses an on-device speech recognition engine to interpret spoken commands and translate them into mouse, keyboard, and system actions.",
      "Number and grid overlays let you reference any visible UI element without needing to know its exact name.",
      "A dictation mode also allows full text authoring and editing, including punctuation and formatting commands, entirely by voice.",
    ],
    steps: [
      "Open Settings → Accessibility → Speech",
      "Turn on Voice access",
      "Follow the setup wizard to download the speech model",
      "Say 'voice access wake up' to start controlling your PC",
    ],
  },
},
{
  id: "windows-find-my-device",
  title: "Find My Device",
  icon: MapPin,
  platform: "windows",
  category: "accounts-sync-family",
  controlType: "action",
  heading: "Locate a lost or stolen PC",
  description: "Find My Device uses your Microsoft account to record your PC's last known location, helping you locate it on a map if it's ever lost or stolen.",
  details: [
    "Enable or disable location tracking tied to your Microsoft account",
    "View your device's last known location from account.microsoft.com",
    "Requires location services and an active internet connection to update",
    "Works alongside device encryption for stronger loss protection",
  ],
  important: "Find My Device requires location services to be turned on system-wide; disabling location services elsewhere will prevent this feature from updating.",
  redirectUrl: "ms-settings:findmydevice",
  whyItMatters: "A lost or stolen laptop represents both a financial loss and a security risk, since it may contain personal files, saved passwords, and access to online accounts. Find My Device gives you a fighting chance of recovering the machine by showing its last known location, which can be shared with local authorities. It also provides peace of mind for anyone who regularly travels with their laptop, such as students or business travelers. Combined with encryption and a strong sign-in method, it forms part of a layered defense against data exposure if a device is misplaced.",
  bestPractices: [
    "Turn on Find My Device as soon as you set up a new PC",
    "Keep location services enabled system-wide so location data stays current",
    "Pair with device encryption so data stays protected even if the device isn't recovered",
    "Check the account portal periodically to confirm location reporting is working",
  ],
  commonIssues: [
    { issue: "Device location isn't updating", fix: "Verify location services are turned on and the device has an active internet connection." },
    { issue: "Feature is greyed out", fix: "Confirm you're signed in with a Microsoft account rather than a local-only account, since Find My Device requires it." },
    { issue: "Location shown is outdated", fix: "The location only refreshes when the device connects to the internet; a powered-off device won't update." },
  ],
  faqs: [
    { q: "Does this let me remotely wipe my PC?", a: "No, Find My Device only shows location; remote wipe requires a business or Intune-managed device." },
    { q: "Does it work without an internet connection?", a: "No, the device must be online to report its current location." },
    { q: "Is this the same as Find My iPhone?", a: "It serves a similar purpose but is Microsoft's implementation for Windows PCs specifically." },
  ],
  tipsAndTricks: [
    "Check account.microsoft.com/devices from any browser to view your PC's last known location",
    "Enable this alongside a strong lock screen PIN for layered protection against theft",
  ],
  relatedSettingIds: ["windows-your-info", "windows-backup", "windows-sign-in-options"],
  updateFrequency: "Check occasionally, or immediately after loss",
  afterImageContent: {
    heading: "How Find My Device Works",
    paragraphs: [
      "Once enabled, Windows periodically reports the device's approximate location to your Microsoft account using available location data such as Wi-Fi and GPS where present.",
      "The last known location can be viewed by signing into the Microsoft account device management portal from any browser.",
      "Location reporting stops updating once the device goes offline, so the map reflects the last moment it had connectivity.",
    ],
    steps: [
      "Open Settings → Accounts → Find my device",
      "Turn on the Find my device toggle",
      "Ensure Location services are enabled in Privacy settings",
      "Visit account.microsoft.com/devices to view location later",
    ],
  },
},
{
  id: "windows-video-playback",
  title: "Video Playback",
  icon: Video,
  platform: "windows",
  category: "apps-features",
  controlType: "action",
  heading: "Tune video quality and battery options",
  description: "Video playback settings control how Windows plays video content, including automatic quality adjustments, HDR video streaming, and battery-saving options for video apps.",
  details: [
    "Enable automatic video quality adjustment based on network conditions",
    "Turn on battery-saving options that lower quality when unplugged",
    "Enable HDR video streaming on supported displays",
    "Adjust video processing options for supported graphics hardware",
  ],
  redirectUrl: "ms-settings:videoplayback",
  whyItMatters: "Video streaming is one of the most common daily activities on a PC, and these settings directly affect both visual quality and battery life during playback. Enabling battery-saving options can meaningfully extend runtime on a laptop during long flights or workdays away from a charger. HDR video settings matter increasingly as more displays and streaming services support high dynamic range content, and getting the setting wrong can mean paying for 4K HDR content but never actually seeing the benefit. For users on metered or unreliable connections, automatic quality adjustment prevents buffering interruptions.",
  bestPractices: [
    "Enable battery saving video quality if you frequently watch video unplugged",
    "Turn on HDR video streaming only if your display supports HDR to avoid washed-out colors on unsupported panels",
    "Leave automatic quality adjustment on for the smoothest playback on variable connections",
    "Revisit these settings after connecting a new external HDR monitor",
  ],
  commonIssues: [
    { issue: "Video looks washed out after enabling HDR streaming", fix: "Turn off HDR video streaming unless your display is confirmed HDR-capable and HDR is enabled in Display settings." },
    { issue: "Video quality drops unexpectedly while on battery", fix: "This is expected if battery saving video quality is enabled; disable it if you prefer full quality regardless of power source." },
    { issue: "Playback stutters even with good internet", fix: "Check hardware acceleration settings in the browser or app being used, as this page only affects native Windows video processing." },
  ],
  faqs: [
    { q: "Does this affect YouTube or Netflix quality?", a: "It can influence apps that use Windows' built-in media pipeline, though many streaming services manage their own quality settings within the browser or app." },
    { q: "Will HDR video drain my battery faster?", a: "HDR processing can use more power, so battery saving mode will automatically reduce quality when unplugged if enabled." },
    { q: "Do I need special hardware for HDR video?", a: "Yes, both your display and graphics hardware need to support HDR for this setting to have a visible effect." },
  ],
  tipsAndTricks: [
    "Check Display settings to confirm HDR is enabled at the system level before troubleshooting video HDR issues",
    "Turn off automatic quality adjustment temporarily to force maximum quality on a known-fast connection",
  ],
  relatedSettingIds: ["windows-hdr-settings", "display-settings", "windows-apps"],
  afterImageContent: {
    heading: "How Video Playback Settings Work",
    paragraphs: [
      "This page configures the Windows media pipeline used by apps that rely on built-in video decoding and playback services rather than their own custom engines.",
      "Battery saving options automatically cap video resolution and frame processing when the device switches to battery power.",
      "HDR video streaming settings coordinate with your display's HDR capability to determine whether high dynamic range content is requested from supported apps.",
    ],
    steps: [
      "Open Settings → Apps → Video playback",
      "Toggle battery saving video quality as preferred",
      "Enable HDR video streaming if your display supports it",
      "Adjust automatic video quality settings for your network",
    ],
  },
},
{
  id: "windows-offline-maps",
  title: "Offline Maps",
  icon: Map,
  platform: "windows",
  category: "apps-features",
  controlType: "action",
  heading: "Download maps for offline use",
  description: "Offline maps lets you download regional map data to your device so the Maps app and navigation features work without an active internet connection.",
  details: [
    "Download maps for specific countries, states, or regions",
    "Set automatic map updates over Wi-Fi",
    "Choose where map data is stored, including on a secondary drive",
    "Delete downloaded maps to free up storage space",
  ],
  redirectUrl: "ms-settings:maps",
  whyItMatters: "Offline maps are valuable for travel to areas with poor or expensive mobile data, such as road trips through rural regions or international travel where data roaming is costly. Having maps cached locally means navigation and search still work even in a dead zone, which can be genuinely important for safety on unfamiliar routes. It also reduces data usage for users on limited or metered connections who still want to use mapping features regularly. For laptop users without built-in cellular connectivity, offline maps are often the only way to have reliable navigation away from Wi-Fi.",
  bestPractices: [
    "Download maps for your home region and any upcoming travel destinations before you go",
    "Enable automatic updates over Wi-Fi so downloaded maps stay current",
    "Move map storage to a secondary drive if your system drive is low on space",
    "Delete old regional maps you no longer need to reclaim storage",
  ],
  commonIssues: [
    { issue: "Maps take up too much storage", fix: "Delete maps for regions you no longer need from the offline maps management page." },
    { issue: "Downloaded maps aren't updating", fix: "Confirm automatic updates over Wi-Fi is enabled and the device connects to Wi-Fi periodically." },
    { issue: "Download fails or stalls", fix: "Check available storage space and try downloading a smaller region or a stable Wi-Fi connection." },
  ],
  faqs: [
    { q: "Do offline maps work with turn-by-turn navigation?", a: "Yes, the Maps app can provide navigation using offline data when there's no internet connection." },
    { q: "How much storage do maps use?", a: "This varies significantly by region size, from tens of megabytes for small areas to several gigabytes for large countries." },
    { q: "Can I download maps for another country before traveling?", a: "Yes, you can search for and download any supported region in advance." },
  ],
  tipsAndTricks: [
    "Download maps the night before a trip while connected to Wi-Fi to avoid using mobile data",
    "Set map storage to an SD card or secondary drive on storage-constrained devices",
  ],
  relatedSettingIds: ["windows-apps", "windows-optional-features"],
  updateFrequency: "Update before travel",
  afterImageContent: {
    heading: "How Offline Maps Work",
    paragraphs: [
      "Offline maps downloads and stores compressed regional map data locally so the Maps app can render and search without a live connection.",
      "Automatic updates check for newer map data periodically whenever the device is connected to Wi-Fi.",
      "Storage location for map data can be changed independently of other app storage settings.",
    ],
    steps: [
      "Open Settings → Apps → Offline maps",
      "Select Download maps and choose a region",
      "Enable Automatically update maps over Wi-Fi",
      "Manage or delete downloaded regions as needed",
    ],
  },
},
{
  id: "windows-apps-for-websites",
  title: "Apps for Websites",
  icon: Globe,
  platform: "windows",
  category: "apps-features",
  controlType: "action",
  heading: "Manage app links that open from websites",
  description: "Apps for websites shows which installed apps are registered to open links from specific websites directly, instead of opening them in a browser.",
  details: [
    "View a list of apps and the website domains they're associated with",
    "Turn off an app's ability to open links from a specific domain",
    "See which apps have registered deep-link handling on your PC",
    "Understand how links behave before clicking them in Mail, Edge, or other apps",
  ],
  redirectUrl: "ms-settings:appsforwebsites",
  whyItMatters: "Many modern apps register themselves to intercept links to their associated website, such as a social media app opening instead of the browser when you tap a shared link. This can be convenient, but it can also be surprising or unwanted if you'd rather always view content in a browser. Managing these associations gives you control over your browsing experience and prevents apps from hijacking links without your consent. It's especially relevant for shared or work devices where consistent, predictable link behavior matters for training and support purposes.",
  bestPractices: [
    "Review this list after installing a new app that seems to intercept links unexpectedly",
    "Disable app link handling for services you'd always rather view in a browser",
    "Revisit periodically, since new app installs can silently register new associations",
    "Use this alongside Default Apps if you also want to change your default browser",
  ],
  commonIssues: [
    { issue: "A link always opens the wrong app instead of the browser", fix: "Find the associated app in this list and turn off its website link handling." },
    { issue: "An app that should open links isn't listed", fix: "Not all apps register for this feature; check the app's own settings for link-handling preferences instead." },
    { issue: "Changes don't seem to apply", fix: "Restart the app or sign out and back in for the association change to take full effect." },
  ],
  faqs: [
    { q: "Does this affect my default browser?", a: "No, this only controls specific apps intercepting specific website domains, not your overall default browser." },
    { q: "Why does an app open instead of my browser?", a: "The app has registered itself as the handler for that website's links, which this page lets you disable." },
    { q: "Is this the same as Default Apps?", a: "It's related but more specific, focusing only on website-to-app link associations rather than file type defaults." },
  ],
  tipsAndTricks: [
    "Check this list first if a shared link keeps opening an unwanted app",
    "Combine with Default Apps settings for full control over what opens what",
  ],
  relatedSettingIds: ["default-apps", "windows-apps"],
  afterImageContent: {
    heading: "How Apps for Websites Works",
    paragraphs: [
      "Windows apps can register URI and domain associations during installation, allowing them to intercept links that would otherwise open in a browser.",
      "This settings page lists every registered association and lets you disable individual app-to-website links.",
      "Disabling an association causes future links from that domain to open in the default browser instead.",
    ],
    steps: [
      "Open Settings → Apps → Apps for websites",
      "Review the list of apps and their associated domains",
      "Toggle off any association you don't want",
      "Restart the affected app if changes don't apply immediately",
    ],
  },
},
{
  id: "windows-app-execution-aliases",
  title: "App Execution Aliases",
  icon: SlidersHorizontal,
  platform: "windows",
  category: "apps-features",
  controlType: "action",
  heading: "Manage command-line shortcuts for apps",
  description: "App execution aliases, found under Advanced app settings, let you enable or disable command-line names that launch installed apps directly from a terminal or the Run box.",
  details: [
    "View which apps have registered a command-line alias",
    "Turn individual aliases on or off to resolve command name conflicts",
    "Access other advanced app behaviors like archiving and reset options",
    "See which alias name corresponds to which installed app",
  ],
  redirectUrl: "ms-settings:advanced-appsettings",
  whyItMatters: "App execution aliases let developers and power users launch apps by typing a short command in a terminal instead of searching through the Start menu, which speeds up common workflows significantly. However, alias name conflicts can occur, especially with tools like Python, where an alias can unintentionally intercept a command meant for a different installed program. Understanding and managing this page prevents confusing situations where typing a familiar command opens the Microsoft Store or the wrong app entirely. It's a small but important setting for developers who rely heavily on the command line.",
  bestPractices: [
    "Disable an alias if it's intercepting a command name you need for a different tool",
    "Check this page first if a terminal command unexpectedly opens the Microsoft Store",
    "Review after installing command-line-heavy tools like Python or Node.js",
    "Leave aliases enabled for apps you intentionally want to launch from the terminal",
  ],
  commonIssues: [
    { issue: "Typing 'python' in the terminal opens the Microsoft Store", fix: "Disable the Python app execution alias here after installing Python from another source." },
    { issue: "An app's command-line shortcut stopped working", fix: "Check that its alias toggle wasn't accidentally turned off on this page." },
    { issue: "Can't find an expected app in the list", fix: "Only apps that register a command-line alias during installation appear here; not all apps support this." },
  ],
  faqs: [
    { q: "What is an app execution alias?", a: "It's a registered command-line name that launches an installed app directly, similar to a shortcut but usable from a terminal." },
    { q: "Why would I disable one?", a: "To resolve a naming conflict where the alias intercepts a command meant for a differently installed version of a tool." },
    { q: "Is this only for developers?", a: "It's most relevant to developers and command-line users, though anyone troubleshooting a terminal command issue may need it." },
  ],
  tipsAndTricks: [
    "Disable the Python aliases here if you install Python from python.org to avoid Store redirection",
    "Use this page as a first troubleshooting step whenever a terminal command opens an unexpected app",
  ],
  relatedSettingIds: ["windows-apps", "default-apps", "windows-optional-features"],
  afterImageContent: {
    heading: "How App Execution Aliases Work",
    paragraphs: [
      "When certain apps install, they can register a short command-line name with Windows that, when typed into a terminal or Run box, launches that app directly.",
      "This page lists every registered alias and lets you individually enable or disable each one to resolve naming conflicts.",
      "Disabling an alias doesn't uninstall the app; it only removes its command-line shortcut registration.",
    ],
    steps: [
      "Open Settings → Apps → Advanced app settings",
      "Select App execution aliases",
      "Toggle individual aliases on or off",
      "Retest the command in a terminal to confirm the change",
    ],
  },
},
{
  id: "windows-airplane-mode",
  title: "Airplane Mode",
  icon: Plane,
  platform: "windows",
  category: "connectivity-network",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Disable all wireless radios instantly",
  description: "Airplane mode instantly turns off Wi-Fi, Bluetooth, cellular, and GPS radios all at once, which is required during flights and useful anytime you want to quickly disable wireless connectivity.",
  details: [
    "Toggle all wireless radios off with a single switch",
    "Selectively re-enable Wi-Fi or Bluetooth while airplane mode is on",
    "Access airplane mode quickly from the Quick Settings flyout",
    "View which radios are currently active or disabled",
  ],
  redirectUrl: "ms-settings:network-airplanemode",
  whyItMatters: "Airline regulations often require passengers to disable wireless transmissions during portions of a flight, making airplane mode a mandatory feature for travelers rather than a convenience. Beyond air travel, it's also a fast way to conserve battery life on a laptop when wireless connectivity isn't needed, since radios consume power even when idle. It's useful in sensitive environments like hospitals or secure facilities where wireless transmissions may need to be minimized. The ability to selectively re-enable Wi-Fi while keeping cellular off also supports common real-world scenarios like in-flight Wi-Fi.",
  bestPractices: [
    "Enable airplane mode before boarding a flight, then turn Wi-Fi back on if in-flight Wi-Fi is available",
    "Use airplane mode to extend battery life during long work sessions without network needs",
    "Add the Quick Settings shortcut for one-tap access instead of navigating the full Settings app",
    "Confirm Bluetooth peripherals disconnect as expected when airplane mode is enabled",
  ],
  commonIssues: [
    { issue: "Wi-Fi won't turn back on after enabling airplane mode", fix: "Use the Quick Settings flyout to manually re-enable Wi-Fi while keeping other radios off." },
    { issue: "Airplane mode turns on unexpectedly", fix: "Check for a physical airplane mode key or function key combination on your keyboard that may have been pressed accidentally." },
    { issue: "Bluetooth accessories disconnect when Wi-Fi is re-enabled", fix: "Bluetooth remains off separately from Wi-Fi; toggle it back on individually if needed." },
  ],
  faqs: [
    { q: "Does airplane mode turn off my keyboard and mouse if they're Bluetooth?", a: "Yes, Bluetooth accessories disconnect unless you re-enable Bluetooth after airplane mode is on." },
    { q: "Can I still use Wi-Fi in airplane mode?", a: "Yes, you can manually turn Wi-Fi back on while the rest of the radios stay disabled." },
    { q: "Does this affect wired ethernet connections?", a: "No, airplane mode only controls wireless radios, not wired network connections." },
  ],
  tipsAndTricks: [
    "Pin the airplane mode toggle to Quick Settings for one-click access from the taskbar",
    "Check a laptop's physical function key row, since many have a dedicated airplane mode key",
  ],
  relatedSettingIds: ["wifi-connection", "bluetooth-settings", "windows-mobile-hotspot"],
  afterImageContent: {
    heading: "How Airplane Mode Works",
    paragraphs: [
      "Airplane mode issues a single command that disables the Wi-Fi, Bluetooth, cellular, and GPS radios simultaneously at the hardware or driver level.",
      "Individual radios like Wi-Fi or Bluetooth can be manually re-enabled afterward without leaving airplane mode entirely.",
      "The setting is also accessible from the Quick Settings flyout for faster access than the full Settings app.",
    ],
    steps: [
      "Open Settings → Network & internet → Airplane mode",
      "Toggle airplane mode on or off",
      "Optionally re-enable Wi-Fi or Bluetooth individually",
      "Or use the Quick Settings icon in the taskbar for one-click access",
    ],
  },
},
{
  id: "windows-proxy-settings",
  title: "Proxy Settings",
  icon: Route,
  platform: "windows",
  category: "connectivity-network",
  controlType: "action",
  heading: "Configure a proxy server for network traffic",
  description: "Proxy settings let you route your PC's internet traffic through a proxy server, either automatically detected or manually configured, which is often required on corporate or school networks.",
  details: [
    "Enable automatic proxy setup detection using a script",
    "Manually enter a proxy server address and port",
    "Set exceptions for local addresses that should bypass the proxy",
    "Turn on automatic detection of network proxy settings",
  ],
  important: "Incorrect proxy configuration can block all internet access, so confirm settings with your network administrator before making manual changes.",
  redirectUrl: "ms-settings:network-proxy",
  whyItMatters: "Many corporate, school, and institutional networks require traffic to route through a proxy server for content filtering, monitoring, or security purposes, making correct proxy configuration essential for internet access in those environments. Misconfigured proxy settings are also a common cause of 'no internet access' errors that are actually connectivity issues at the application layer rather than the physical network layer. Understanding this page helps troubleshoot situations where Wi-Fi shows as connected but web browsing still fails. For remote and hybrid workers, proxy settings are sometimes required to access internal company resources securely.",
  bestPractices: [
    "Get exact proxy server details from your IT department rather than guessing",
    "Use automatic detection first, since many networks broadcast proxy configuration automatically",
    "Add local network addresses to the bypass list to avoid unnecessary proxy routing",
    "Disable manual proxy settings when moving to a network that doesn't require one",
  ],
  commonIssues: [
    { issue: "Internet stops working after enabling a manual proxy", fix: "Verify the proxy server address and port are correct, or disable the manual proxy if it's no longer needed on the current network." },
    { issue: "Some apps can't connect even though the browser works", fix: "Certain apps don't respect system proxy settings and may need their own separate proxy configuration." },
    { issue: "Automatic detection doesn't find a proxy", fix: "Confirm the network actually broadcasts a proxy auto-config script, or enter settings manually if provided by an administrator." },
  ],
  faqs: [
    { q: "Do I need a proxy for home internet?", a: "No, most home networks don't require a proxy; this is primarily used on corporate, school, or public networks." },
    { q: "What's the difference between automatic and manual proxy setup?", a: "Automatic setup detects proxy settings from the network or a script, while manual setup requires entering the server address and port yourself." },
    { q: "Will a proxy slow down my internet?", a: "It can add latency depending on the proxy server's performance and location, though this varies by network." },
  ],
  tipsAndTricks: [
    "Keep a note of your organization's proxy address and port for quick re-entry after a Windows reset",
    "Use the bypass list to exclude internal company sites if they load slowly through the proxy",
  ],
  relatedSettingIds: ["wifi-connection", "windows-vpn", "windows-ethernet"],
  afterImageContent: {
    heading: "How Proxy Settings Work",
    paragraphs: [
      "Proxy settings determine whether your PC's network traffic is routed directly to the internet or through an intermediary proxy server first.",
      "Automatic detection can use a proxy auto-configuration script broadcast by the network, removing the need for manual entry.",
      "Manual configuration requires the exact server address, port, and any bypass addresses provided by a network administrator.",
    ],
    steps: [
      "Open Settings → Network & internet → Proxy",
      "Enable Automatically detect settings, or",
      "Turn on manual proxy setup and enter the server address and port",
      "Add any bypass addresses and save the configuration",
    ],
  },
},
{
  id: "windows-ethernet",
  title: "Ethernet",
  icon: Cable,
  platform: "windows",
  category: "connectivity-network",
  controlType: "action",
  heading: "Configure your wired network connection",
  description: "Ethernet settings manage your PC's wired network adapter, including IP configuration, connection metering, and network profile type for a plugged-in cable connection.",
  details: [
    "View wired connection status, speed, and IP address details",
    "Switch between automatic (DHCP) and manual IP address configuration",
    "Set the network as metered to limit background data usage",
    "Choose the network profile type as private or public for firewall behavior",
  ],
  redirectUrl: "ms-settings:network-ethernet",
  whyItMatters: "A wired ethernet connection typically offers faster, more stable, and lower-latency performance than Wi-Fi, making this page important for gaming, video conferencing, and large file transfers. Correctly setting the network profile to private or public directly affects firewall rules and file-sharing visibility, which matters for both security and functionality on shared networks. Manual IP configuration is sometimes required in office, lab, or advanced home network setups where static addressing is used. Marking a wired connection as metered can also help control data usage in environments with capped or expensive connections.",
  bestPractices: [
    "Set home networks to private and public networks like cafes or offices to public for appropriate firewall protection",
    "Use automatic DHCP configuration unless your network specifically requires a static IP",
    "Check link speed here to confirm you're getting expected gigabit performance from your cable and adapter",
    "Mark a connection as metered if you're on a capped or pay-per-use wired connection",
  ],
  commonIssues: [
    { issue: "Ethernet shows connected but no internet access", fix: "Check IP configuration, or try switching between automatic and manual settings if a static IP was previously misconfigured." },
    { issue: "File sharing doesn't work over ethernet", fix: "Confirm the network profile is set to Private, since Public profiles restrict discovery and sharing by default." },
    { issue: "Connection speed is slower than expected", fix: "Check the reported link speed on this page; a mismatched or damaged cable can negotiate a lower speed than the adapter supports." },
  ],
  faqs: [
    { q: "Should my home network be private or public?", a: "Private, since it enables features like file sharing and network discovery that are safe on a trusted home network." },
    { q: "Is ethernet faster than Wi-Fi?", a: "Generally yes, wired connections offer more consistent speed and lower latency than wireless." },
    { q: "Can I set a static IP address here?", a: "Yes, switch IP assignment to manual and enter the address, subnet, and gateway details." },
  ],
  tipsAndTricks: [
    "Check the link speed reading here first when troubleshooting slower-than-expected wired performance",
    "Set public networks to the Public profile to reduce your PC's visibility to other devices",
  ],
  relatedSettingIds: ["wifi-connection", "windows-proxy-settings", "windows-vpn"],
  afterImageContent: {
    heading: "How Ethernet Settings Work",
    paragraphs: [
      "This page displays real-time status for the wired network adapter, including connection speed, IPv4 and IPv6 addresses, and DNS servers in use.",
      "IP configuration can be switched between automatic DHCP assignment and manually entered static values.",
      "The network profile setting, private or public, controls how visible the PC is to other devices and which firewall rules apply.",
    ],
    steps: [
      "Open Settings → Network & internet → Ethernet",
      "Review connection status and speed",
      "Set the network profile to Private or Public as appropriate",
      "Edit IP assignment if a static address is required",
    ],
  },
},
{
  id: "windows-data-usage",
  title: "Data Usage",
  icon: Activity,
  platform: "windows",
  category: "connectivity-network",
  controlType: "action",
  heading: "Track network data consumption",
  description: "Data usage shows how much network data your PC has consumed over Wi-Fi and ethernet in the past 30 days, broken down by app, helping you identify what's using bandwidth.",
  details: [
    "View total data usage over the last 30 days by network",
    "See a per-app breakdown of data consumption",
    "Set a data limit to receive warnings as usage approaches the cap",
    "Reset usage statistics to start tracking from a specific date",
  ],
  redirectUrl: "ms-settings:datausage",
  whyItMatters: "For users on capped or metered internet plans, such as mobile hotspots, satellite internet, or limited home broadband, tracking data usage prevents unexpected overage charges or throttling. The per-app breakdown is especially useful for identifying an app quietly consuming large amounts of background data, such as cloud backup or update services. Setting a data limit provides proactive warnings before a cap is reached rather than discovering the problem only after service is throttled. This page is also a helpful diagnostic tool for understanding whether a specific app or one network is responsible for unusually high consumption.",
  bestPractices: [
    "Set a data limit slightly below your actual plan cap to leave a safety margin",
    "Check the per-app breakdown periodically to catch unexpected high-usage apps early",
    "Mark metered connections in the Wi-Fi or ethernet settings so apps reduce background usage automatically",
    "Reset the usage counter at the start of each billing cycle for accurate tracking",
  ],
  commonIssues: [
    { issue: "Usage numbers don't match my ISP's reported data", fix: "Windows only tracks usage from this device, not the whole household or network, so totals will naturally differ." },
    { issue: "One app is using far more data than expected", fix: "Check the per-app breakdown and consider limiting background data or updates for that specific app." },
    { issue: "Data limit warnings aren't appearing", fix: "Confirm a data limit has been set for the correct network under this page's settings." },
  ],
  faqs: [
    { q: "Does this track data used by other devices on my network?", a: "No, it only measures data used by this specific PC, not your whole home network." },
    { q: "Can I set a hard cap that blocks internet access?", a: "No, Windows will warn you as you approach a set limit, but it doesn't automatically block internet access." },
    { q: "Does marking a network as metered save data automatically?", a: "Yes, many apps and Windows Update reduce background data usage automatically on networks marked as metered." },
  ],
  tipsAndTricks: [
    "Mark a mobile hotspot connection as metered immediately to reduce background data drain",
    "Check this page right after a large Windows Update to see how much data it consumed",
  ],
  relatedSettingIds: ["wifi-connection", "windows-mobile-hotspot", "windows-ethernet"],
  updateFrequency: "Check monthly on metered plans",
  afterImageContent: {
    heading: "How Data Usage Tracking Works",
    paragraphs: [
      "Windows records data sent and received by each network adapter and app over rolling 30-day windows, updating totals in near real time.",
      "The per-app breakdown attributes usage based on which process transmitted or received the data.",
      "An optional data limit can be configured per network to trigger warning notifications as usage approaches the threshold.",
    ],
    steps: [
      "Open Settings → Network & internet → Data usage",
      "Review overall usage and the per-app breakdown",
      "Select Set limit to configure a warning threshold",
      "Reset usage statistics if starting a new billing period",
    ],
  },
},
{
  id: "windows-autoplay",
  title: "AutoPlay",
  icon: PlayCircle,
  platform: "windows",
  category: "devices-peripherals",
  controlType: "action",
  heading: "Choose what happens when media is inserted",
  description: "AutoPlay settings control what Windows does automatically when you insert removable media or connect a device, such as a USB drive, memory card, or camera.",
  details: [
    "Turn AutoPlay on or off globally for all removable media",
    "Set a default action for removable drives, such as opening File Explorer",
    "Choose a specific behavior for memory cards separately from USB drives",
    "Set default actions per device the first time it's connected",
  ],
  redirectUrl: "ms-settings:autoplay",
  whyItMatters: "AutoPlay determines the very first interaction you have with a newly connected drive, camera, or memory card, and getting the default action right saves repetitive clicking every time media is inserted. It's also a security consideration, since AutoPlay historically was exploited to automatically launch malicious software from infected removable drives, which is why Windows disabled AutoRun-based execution by default years ago. For photographers and content creators who frequently import from cameras or SD cards, setting the right default action, such as automatically opening the Photos import screen, meaningfully speeds up their workflow. Disabling AutoPlay entirely is a reasonable choice for users who prefer manually browsing removable media instead.",
  bestPractices: [
    "Set 'Open folder to view files' as the default for USB drives if you prefer manual control",
    "Choose an import action for memory cards if you regularly transfer photos from a camera",
    "Turn off AutoPlay entirely on shared or public-facing PCs for predictability",
    "Review device-specific defaults periodically, since Windows remembers your last choice per device",
  ],
  commonIssues: [
    { issue: "AutoPlay dialog doesn't appear when inserting media", fix: "Check that the global AutoPlay toggle is turned on in this settings page." },
    { issue: "Wrong app opens automatically every time", fix: "Change the default action for that specific media type, or reset the remembered choice for that device." },
    { issue: "AutoPlay behaves differently for different drives", fix: "Windows remembers per-device choices; adjust or reset the specific drive's default action here." },
  ],
  faqs: [
    { q: "Is AutoPlay a security risk?", a: "Modern Windows AutoPlay no longer automatically executes programs from removable media, greatly reducing the historical risk." },
    { q: "Can I set different defaults for USB drives and memory cards?", a: "Yes, this page allows separate default actions for removable drives and memory cards." },
    { q: "Does AutoPlay affect connected phones?", a: "Yes, connecting a phone via USB can also trigger an AutoPlay prompt depending on the phone's connection mode." },
  ],
  tipsAndTricks: [
    "Set memory cards to open the Photos app import screen for a faster photo transfer workflow",
    "Turn AutoPlay off completely if you find the popup dialog more annoying than useful",
  ],
  relatedSettingIds: ["windows-usb-settings", "windows-device-manager"],
  afterImageContent: {
    heading: "How AutoPlay Works",
    paragraphs: [
      "AutoPlay detects when removable media, such as a USB drive or memory card, is connected and prompts or automatically triggers a default action based on the media's content type.",
      "Default actions can be configured separately for removable drives and memory cards, and Windows remembers individual device preferences after the first connection.",
      "The feature can be disabled entirely for users who prefer to browse newly connected devices manually through File Explorer.",
    ],
    steps: [
      "Open Settings → Bluetooth & devices → AutoPlay",
      "Toggle AutoPlay for removable devices on or off",
      "Choose default actions for removable drives and memory cards",
      "Reconnect a device to confirm the new default behavior",
    ],
  },
},
{
  id: "windows-usb-settings",
  title: "USB Settings",
  icon: Usb,
  platform: "windows",
  category: "devices-peripherals",
  controlType: "action",
  heading: "Manage USB connection notifications and power",
  description: "USB settings control notifications for USB connection issues and battery-saving behavior for USB devices when your PC is running on battery power.",
  details: [
    "Enable notifications when there are problems connecting a USB device",
    "Turn on battery saving to suspend idle USB devices while on battery",
    "View a summary of recent USB connection issues",
    "Access troubleshooting suggestions for common USB errors",
  ],
  redirectUrl: "ms-settings:usb",
  whyItMatters: "USB connectivity problems, like a device drawing too much power or failing to enumerate correctly, can be confusing to diagnose without clear feedback, and this page's notifications help surface those issues immediately. Battery saving for USB devices helps laptop users extend runtime by suspending idle peripherals like external drives or webcams when unplugged. This setting is particularly relevant for professionals connecting external monitors, docking stations, and multiple peripherals, since power delivery issues on battery can otherwise cause silent disconnects. Understanding this page also speeds up troubleshooting when a USB device intermittently disconnects during battery use.",
  bestPractices: [
    "Enable notifications for USB connection problems so issues surface immediately rather than being discovered later",
    "Turn off USB battery saving if you experience unexpected disconnects of external drives or accessories on battery",
    "Check this page first when a bus-powered external drive behaves erratically while unplugged",
    "Keep battery saving on for average use to maximize runtime with low-power peripherals like mice and keyboards",
  ],
  commonIssues: [
    { issue: "External hard drive disconnects randomly on battery", fix: "Turn off USB battery saving, since it can suspend high-power devices to save energy." },
    { issue: "No warning appears when a USB device fails to connect properly", fix: "Enable the notification toggle for USB connection issues on this page." },
    { issue: "A USB webcam stops working after the laptop sits idle", fix: "Disable battery saving for USB devices if the webcam is being suspended between uses." },
  ],
  faqs: [
    { q: "Does this affect USB device speed?", a: "No, this page controls notifications and power behavior, not data transfer speed." },
    { q: "Will USB battery saving affect my mouse or keyboard?", a: "Low-power devices like mice and keyboards are generally unaffected, while high-power devices like external drives are more likely to be suspended." },
    { q: "Where do I see detailed USB errors?", a: "Device Manager provides more detailed diagnostic information for individual USB device errors." },
  ],
  tipsAndTricks: [
    "Turn off USB battery saving specifically before doing a large file transfer to an external drive unplugged from power",
    "Pair with Device Manager for deeper diagnostics if a USB device continues to misbehave after adjusting these settings",
  ],
  relatedSettingIds: ["windows-autoplay", "windows-device-manager"],
  afterImageContent: {
    heading: "How USB Settings Work",
    paragraphs: [
      "This page configures system-level behavior for USB connection notifications and power management independent of individual device drivers.",
      "Battery saving for USB devices suspends idle or low-priority peripherals to reduce power draw while the PC runs on battery.",
      "Connection notifications alert you when Windows detects a USB enumeration or power delivery problem.",
    ],
    steps: [
      "Open Settings → Bluetooth & devices → USB",
      "Toggle notifications for USB connection issues",
      "Toggle USB battery saving on or off",
      "Reconnect the affected device to test the change",
    ],
  },
},
{
  id: "windows-cameras-device",
  title: "Cameras",
  icon: Camera,
  platform: "windows",
  category: "devices-peripherals",
  controlType: "action",
  heading: "Manage connected camera devices",
  description: "The Cameras page lists built-in and connected external cameras, letting you view their status, adjust default camera effects, and jump into per-camera settings like exposure and framing.",
  details: [
    "View all detected built-in and USB-connected cameras",
    "Set default Windows Studio Effects like background blur or eye contact where supported",
    "Adjust brightness, framing, and camera-specific properties",
    "Enable or disable individual cameras when multiple are connected",
  ],
  redirectUrl: "ms-settings:camera",
  whyItMatters: "With hybrid and remote work now common, the camera is one of the most frequently used peripherals for video calls, making it worth configuring well beyond just plugging it in. Windows Studio Effects, available on many newer laptops with dedicated AI hardware, can automatically blur backgrounds or keep eye contact appear more natural without needing third-party conferencing app plugins. Being able to select which camera is active matters increasingly as users connect external webcams or capture cards alongside a built-in laptop camera. Proper camera configuration also helps troubleshoot situations where a conferencing app can't find or correctly use the expected camera.",
  bestPractices: [
    "Enable background blur through Windows Studio Effects if your hardware supports it, for consistent blur across all apps",
    "Disable unused built-in cameras if you exclusively use an external webcam to avoid app confusion",
    "Adjust exposure and framing settings here rather than only inside individual conferencing apps",
    "Check this page first if a video call app can't detect your expected camera",
  ],
  commonIssues: [
    { issue: "A video call app is using the wrong camera", fix: "Check which camera is enabled or prioritized here, and disable any camera you don't want apps to detect." },
    { issue: "Windows Studio Effects options are missing", fix: "This feature requires specific AI-accelerated hardware (NPU) not present on all PCs." },
    { issue: "Camera image looks dim or improperly framed", fix: "Adjust brightness and framing settings directly on this page for that specific camera." },
  ],
  faqs: [
    { q: "Do all PCs support Windows Studio Effects?", a: "No, these effects require a neural processing unit (NPU), which is only present on certain newer devices." },
    { q: "Can I use multiple cameras at once?", a: "Windows can detect multiple cameras, but most apps will only use one active camera at a time, selectable within the app." },
    { q: "Does disabling a camera here uninstall its driver?", a: "No, disabling just prevents it from being used or detected by apps; the driver remains installed." },
  ],
  tipsAndTricks: [
    "Turn on automatic framing if available to keep yourself centered during video calls without manual adjustment",
    "Check per-camera brightness settings if your video looks washed out only through certain apps",
  ],
  relatedSettingIds: ["windows-device-manager", "windows-autoplay"],
  afterImageContent: {
    heading: "How Camera Settings Work",
    paragraphs: [
      "This page enumerates every camera device Windows detects, whether built into a laptop or connected externally over USB.",
      "On supported hardware, Windows Studio Effects apply AI-based processing such as background blur directly at the operating system level so it works consistently across apps.",
      "Individual camera properties like brightness and framing can be adjusted per device without needing to open a separate app.",
    ],
    steps: [
      "Open Settings → Bluetooth & devices → Cameras",
      "Select the camera you want to configure",
      "Adjust Windows Studio Effects and camera properties",
      "Enable or disable specific cameras as needed",
    ],
  },
},
{
  id: "windows-night-light",
  title: "Night Light",
  icon: SunMedium,
  platform: "windows",
  category: "display-sound-notifications",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Reduce blue light in the evening",
  description: "Night light shifts your display's color temperature to warmer tones at scheduled times, reducing blue light exposure that can interfere with sleep and cause eye strain in the evening.",
  details: [
    "Toggle Night light on manually or set an automatic schedule",
    "Adjust color temperature strength with a slider",
    "Schedule Night light to match sunset and sunrise for your location",
    "Set custom on and off times independent of sunset and sunrise",
  ],
  redirectUrl: "ms-settings:nightlight",
  whyItMatters: "Extended screen exposure to blue-heavy light in the evening has been linked to disrupted sleep patterns, since blue light suppresses melatonin production more than warmer tones do. Night light provides a simple, automatic way to reduce this exposure without needing external blue-light-filtering glasses or software. For users who work late or use their PC right before bed, this setting can noticeably reduce eye strain and make the transition to sleep easier. Because it can be scheduled automatically to local sunset and sunrise, it requires no ongoing manual effort once configured.",
  bestPractices: [
    "Set Night light to follow your local sunset and sunrise for a fully automatic schedule",
    "Increase the strength slider gradually to find a comfortable warmth level",
    "Turn off Night light temporarily for color-accurate work like photo or video editing",
    "Pair with a lower overall brightness in the evening for additional eye comfort",
  ],
  commonIssues: [
    { issue: "Night light doesn't turn on automatically", fix: "Confirm location services are enabled so Windows can calculate accurate sunset and sunrise times, or set a custom schedule instead." },
    { issue: "Colors look too orange for design work", fix: "Temporarily disable Night light while doing color-sensitive tasks like photo editing." },
    { issue: "Night light setting is missing entirely", fix: "Some external monitors or graphics configurations may not support this feature; check monitor and driver compatibility." },
  ],
  faqs: [
    { q: "Does Night light affect all connected monitors?", a: "In most cases yes, though behavior can vary depending on monitor and graphics driver support." },
    { q: "Is Night light the same as Dark mode?", a: "No, Dark mode changes app color schemes, while Night light shifts the color temperature of everything displayed." },
    { q: "Can I schedule custom times instead of sunset and sunrise?", a: "Yes, you can set specific manual on and off times instead of using location-based scheduling." },
  ],
  tipsAndTricks: [
    "Use the strength slider preview to test warmth levels before committing to a schedule",
    "Add a Quick Settings shortcut for Night light to toggle it instantly without opening full Settings",
  ],
  relatedSettingIds: ["display-settings", "windows-hdr-settings"],
  afterImageContent: {
    heading: "How Night Light Works",
    paragraphs: [
      "Night light adjusts the color temperature rendering of connected displays, shifting output toward warmer tones and reducing blue light output.",
      "A schedule can be set to activate automatically based on your location's sunset and sunrise times, or using custom fixed hours.",
      "The intensity of the warm shift can be fine-tuned with a strength slider to balance comfort and color accuracy.",
    ],
    steps: [
      "Open Settings → System → Display → Night light",
      "Turn Night light on, or set it to schedule",
      "Adjust the strength slider to your preference",
      "Choose sunset-to-sunrise or a custom schedule",
    ],
  },
},
{
  id: "windows-hdr-settings",
  title: "HDR Settings",
  icon: Monitor,
  platform: "windows",
  category: "display-sound-notifications",
  controlType: "action",
  heading: "Enable high dynamic range on your display",
  description: "HDR settings let you turn on high dynamic range on a supported display, adjust HDR brightness balance, and stream HDR video content for a wider range of colors and contrast.",
  details: [
    "Turn HDR on or off for each connected supported display",
    "Adjust the SDR content brightness balance while HDR is active",
    "Use Windows HDR Calibration for a more accurate tuning experience",
    "Check HDR certification and capability details for your display",
  ],
  important: "HDR requires both a compatible display and cable; using an unsupported monitor or connection can result in washed-out or inaccurate colors.",
  redirectUrl: "ms-settings:display-hdr",
  whyItMatters: "HDR-capable displays can show a much wider range of brightness and color than standard displays, producing noticeably more vivid and realistic images in supported games, movies, and photos. However, enabling HDR on Windows sometimes makes regular, non-HDR content look washed out or overly dim by default, which is why the SDR brightness balance adjustment exists. Getting HDR configured correctly is important for anyone who has invested in an HDR-capable monitor or TV, since leaving it misconfigured wastes the display's actual capability. The calibration tool helps ensure the improvement is real rather than a color-shifted approximation.",
  bestPractices: [
    "Use the Windows HDR Calibration app after enabling HDR for the most accurate results",
    "Adjust SDR content brightness if everyday apps look too dim once HDR is turned on",
    "Confirm your cable and port support the necessary bandwidth for HDR at your display's resolution and refresh rate",
    "Turn off HDR for older or unsupported apps that render color incorrectly under it",
  ],
  commonIssues: [
    { issue: "Everything looks washed out or too dark after enabling HDR", fix: "Adjust the SDR content brightness slider, or run the Windows HDR Calibration tool for a more accurate baseline." },
    { issue: "HDR toggle is missing or greyed out", fix: "Confirm your display and cable both support HDR; not all monitors or connection types do." },
    { issue: "Games don't look noticeably different with HDR on", fix: "Confirm the specific game has HDR enabled in its own graphics settings, since HDR must be supported at the app level too." },
  ],
  faqs: [
    { q: "Do I need a special cable for HDR?", a: "Often yes; older HDMI or DisplayPort cables may lack the bandwidth required for HDR at higher resolutions and refresh rates." },
    { q: "Why does non-HDR content look worse after turning on HDR?", a: "Standard content isn't authored for HDR brightness ranges, which is why the SDR brightness balance setting exists to compensate." },
    { q: "Is HDR the same as 4K?", a: "No, they're independent; HDR refers to dynamic range and color, not resolution." },
  ],
  tipsAndTricks: [
    "Run the HDR Calibration app from the Microsoft Store for a guided, more accurate setup",
    "Toggle HDR off quickly from Quick Settings when working with color-critical SDR content",
  ],
  relatedSettingIds: ["display-settings", "windows-night-light", "windows-video-playback"],
  afterImageContent: {
    heading: "How HDR Settings Work",
    paragraphs: [
      "HDR settings enable an extended brightness and color range pipeline for displays that report HDR support to Windows.",
      "Because SDR and HDR content are authored for different brightness ranges, a balance adjustment compensates so everyday apps remain comfortably visible once HDR is active.",
      "The Windows HDR Calibration tool walks through a guided process to fine-tune black levels, peak brightness, and color balance for your specific display.",
    ],
    steps: [
      "Open Settings → System → Display → HDR",
      "Toggle Use HDR for the selected display",
      "Adjust the SDR content brightness slider",
      "Run Windows HDR Calibration for finer tuning",
    ],
  },
},
{
  id: "windows-volume-mixer",
  title: "Volume Mixer",
  icon: Volume1,
  platform: "windows",
  category: "display-sound-notifications",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Set independent volume levels per app",
  description: "Volume mixer lets you control the output volume of individual running apps independently, and assign specific apps to different output or input devices.",
  details: [
    "Adjust volume sliders independently for each currently running app",
    "Assign a specific app's audio output to a particular speaker or headset",
    "Mute individual apps without muting the whole system",
    "Set separate input devices for apps that use a microphone",
  ],
  redirectUrl: "ms-settings:apps-volume",
  whyItMatters: "Different apps often have wildly inconsistent default volume levels, and a single system-wide volume control forces awkward compromises, like a notification sound blasting over quiet background music. Volume mixer solves this by giving each running app its own independent level, so you can keep a video call comfortably loud while muting a noisy browser tab entirely. Assigning specific apps to specific audio devices is also valuable for setups with multiple speakers or headsets, such as routing game audio to a headset while music plays through desktop speakers. This level of control is especially useful for streamers, gamers, and anyone regularly running multiple audio sources simultaneously.",
  bestPractices: [
    "Lower notification and system sound volume relative to media apps to avoid jarring interruptions",
    "Assign conferencing apps to a headset output separately from general media playback through speakers",
    "Mute background apps individually instead of muting the whole system during a call",
    "Revisit mixer levels after installing a new communication or media app for the first time",
  ],
  commonIssues: [
    { issue: "An app is louder or quieter than expected relative to others", fix: "Open Volume mixer and adjust that specific app's slider independently of the master volume." },
    { issue: "Audio plays through the wrong speaker or headset", fix: "Assign the correct output device to that app directly within Volume mixer." },
    { issue: "Volume mixer doesn't show a running app", fix: "The app may not be actively producing audio yet; it typically appears once it starts playing sound." },
  ],
  faqs: [
    { q: "Does Volume mixer save settings between sessions?", a: "Yes, per-app volume and device assignments generally persist across restarts for the same app." },
    { q: "Can I route different apps to different speakers at the same time?", a: "Yes, each app can be assigned its own independent output device." },
    { q: "Is this different from the main volume slider?", a: "Yes, the main slider controls overall system volume, while Volume mixer controls each app independently." },
  ],
  tipsAndTricks: [
    "Right-click the speaker icon in the taskbar for a quick shortcut into the volume mixer",
    "Set your microphone input per app here if a conferencing app is using the wrong input device",
  ],
  relatedSettingIds: ["sound-settings", "windows-focus-assist"],
  afterImageContent: {
    heading: "How Volume Mixer Works",
    paragraphs: [
      "Volume mixer maintains an independent volume level and device assignment for every app currently producing or capturing audio.",
      "Settings are tied to each app and generally persist across sessions once configured.",
      "Both output (speaker/headset) and input (microphone) devices can be assigned separately per app for more advanced audio routing.",
    ],
    steps: [
      "Open Settings → System → Sound → Volume mixer",
      "Adjust the volume slider for each listed app",
      "Assign an output or input device per app if needed",
      "Close Settings; changes apply immediately",
    ],
  },
},
{
  id: "windows-advanced-display-settings",
  title: "Advanced Display Settings",
  icon: MonitorCog,
  platform: "windows",
  category: "display-sound-notifications",
  controlType: "action",
  heading: "Fine-tune resolution and refresh rate",
  description: "Advanced display settings show detailed information about each connected display, including exact resolution, refresh rate, bit depth, and color format, with options to change them individually.",
  details: [
    "Select and change the refresh rate for each connected display",
    "View and adjust exact resolution, including custom options",
    "Check color format and bit depth details for supported displays",
    "View display adapter properties and driver information",
  ],
  redirectUrl: "ms-settings:display-advanced",
  whyItMatters: "Refresh rate has a significant impact on how smooth motion appears, which matters greatly for gaming and everyday scrolling comfort on displays capable of higher rates than the Windows default. Many high-refresh-rate monitors default to 60Hz until manually changed here, meaning users can be missing out on hardware capability they already paid for without realizing it. This page is also where display or graphics issues are diagnosed at a technical level, such as confirming whether a monitor is actually receiving the intended resolution and color depth. For creative professionals, verifying color format and bit depth ensures the display is rendering content as accurately as the hardware allows.",
  bestPractices: [
    "Check and manually set the highest supported refresh rate if it isn't already selected by default",
    "Verify resolution matches your display's native resolution for the sharpest image",
    "Confirm color format settings if working on color-critical creative tasks",
    "Recheck this page after connecting a new monitor or updating graphics drivers",
  ],
  commonIssues: [
    { issue: "A 144Hz or higher monitor is stuck at 60Hz", fix: "Manually select the higher refresh rate here, since Windows sometimes defaults to the lowest supported rate." },
    { issue: "Display resolution looks blurry or stretched", fix: "Set the resolution to the display's native value listed on this page." },
    { issue: "Colors look inaccurate for professional work", fix: "Check the color format and bit depth settings and adjust if the display supports a higher-quality mode." },
  ],
  faqs: [
    { q: "Why isn't my monitor showing its maximum refresh rate as an option?", a: "This is usually a cable or port limitation; ensure you're using a cable and port combination that supports the higher bandwidth required." },
    { q: "Does changing refresh rate affect performance?", a: "Higher refresh rates can slightly increase GPU load, but the smoother motion is generally worth it for supported hardware." },
    { q: "What is bit depth?", a: "It refers to how many distinct color shades a display can render; higher bit depth produces smoother color gradients." },
  ],
  tipsAndTricks: [
    "Check this page immediately after buying a high-refresh-rate monitor to confirm it isn't defaulting to 60Hz",
    "Use the native resolution listed here as the baseline before troubleshooting any blurriness complaints",
  ],
  relatedSettingIds: ["display-settings", "windows-graphics", "windows-multiple-displays"],
  afterImageContent: {
    heading: "How Advanced Display Settings Work",
    paragraphs: [
      "This page queries each connected display's EDID and driver information to present detailed technical capabilities, including supported resolutions and refresh rates.",
      "Changing the refresh rate or resolution here reconfigures the signal Windows sends to that specific display without affecting others.",
      "Color format and bit depth options depend on both the display's certified capabilities and the cable or port connection quality.",
    ],
    steps: [
      "Open Settings → System → Display → Advanced display",
      "Select the display you want to configure",
      "Choose the desired refresh rate and resolution",
      "Review color format and bit depth details if needed",
    ],
  },
},
{
  id: "windows-multiple-displays",
  title: "Multiple Displays",
  icon: MonitorSmartphone,
  platform: "windows",
  category: "display-sound-notifications",
  controlType: "action",
  heading: "Arrange and extend across several screens",
  description: "Multiple displays settings let you arrange, extend, duplicate, or switch between several connected monitors, and configure how your desktop spans across them.",
  details: [
    "Drag display icons to match your physical monitor arrangement",
    "Choose to extend, duplicate, or show on only one display",
    "Identify which physical monitor corresponds to each numbered icon",
    "Set a different primary display among multiple connected monitors",
  ],
  redirectUrl: "ms-settings:display",
  whyItMatters: "A correctly arranged multi-monitor setup makes moving the mouse and dragging windows between screens feel natural, matching the way the physical monitors sit on your desk, while a mismatched arrangement causes constant confusion. Extending the desktop across multiple displays significantly increases usable screen real estate for multitasking, which is one of the most impactful productivity upgrades available. Being able to quickly switch to duplicate mode is essential for presentations, where the same content needs to appear on a projector or external display. Setting the correct primary display also determines where the taskbar and new windows appear by default, which affects daily workflow.",
  bestPractices: [
    "Drag the display icons to physically match your monitor layout on the desk",
    "Use the Identify button to confirm which numbered icon corresponds to which physical screen",
    "Set your main working monitor as the primary display for correct taskbar placement",
    "Switch to duplicate mode with Win+P during presentations for quick screen mirroring",
  ],
  commonIssues: [
    { issue: "Mouse jumps to the wrong screen when moving between monitors", fix: "Rearrange the display icons in settings to match your actual physical monitor positions." },
    { issue: "Second monitor isn't detected", fix: "Check the cable connection and select Detect on this page, or update graphics drivers." },
    { issue: "Taskbar appears on the wrong monitor", fix: "Set the desired monitor as the primary display, or adjust taskbar display settings separately." },
  ],
  faqs: [
    { q: "What's the difference between extend and duplicate?", a: "Extend spreads your desktop across multiple screens for more space, while duplicate mirrors the same content on all screens." },
    { q: "Can I use more than two monitors?", a: "Yes, as many as your graphics hardware and ports support can be arranged and used simultaneously." },
    { q: "Can each monitor have a different resolution or refresh rate?", a: "Yes, each display can be configured independently under Advanced display settings." },
  ],
  tipsAndTricks: [
    "Press Win+P for a quick keyboard shortcut to switch between extend, duplicate, and single-display modes",
    "Use Identify to instantly confirm monitor numbering before rearranging icons",
  ],
  relatedSettingIds: ["display-settings", "windows-advanced-display-settings", "windows-graphics"],
  afterImageContent: {
    heading: "How Multiple Display Arrangement Works",
    paragraphs: [
      "Windows represents each connected display as a numbered, draggable icon that you position to reflect their real-world physical arrangement.",
      "The chosen layout determines how the mouse cursor and dragged windows move between screens at the matching edges.",
      "Display mode options let you extend the desktop across all screens, duplicate the same image on all of them, or show output on only one at a time.",
    ],
    steps: [
      "Open Settings → System → Display",
      "Drag display icons to match your physical setup",
      "Select Identify to confirm which icon is which monitor",
      "Choose extend, duplicate, or single-display mode as needed",
    ],
  },
},
{
  id: "windows-colors",
  title: "Colors & Accent Color",
  icon: Palette,
  platform: "windows",
  category: "personalization",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Customize your accent color",
  description: "Controls the accent color used across Start, taskbar, title bars, and other UI elements, and lets you choose whether Windows should surface a color automatically from your background.",
  details: [
    "Pick a custom accent color or let Windows choose one from your wallpaper",
    "Show accent color on Start and taskbar",
    "Show accent color on title bars and window borders",
    "Choose between light, dark, and custom app/system mode combinations",
  ],
  redirectUrl: "ms-settings:colors",
  whyItMatters: "Accent color is one of the most visible personalization choices in Windows, affecting how buttons, selections, and highlighted elements stand out throughout the shell and in many apps. Getting it right can improve visual clarity for users who rely on strong contrast to spot focused elements, while a poorly chosen combination can make text or icons hard to read, especially against title bars. It's also a quick way to make a shared or work PC feel personal without touching deeper system settings.",
  bestPractices: [
    "Choose a color with enough contrast against both light and dark backgrounds if you switch modes often",
    "Enable 'Show accent color on Start and taskbar' for quicker visual orientation",
    "Avoid very light accent colors on title bars if you have low vision, as text contrast can suffer",
    "Let Windows auto-pick from your background for a coordinated look with minimal effort",
  ],
  commonIssues: [
    { issue: "Accent color doesn't seem to change anything visible", fix: "Enable the title bar and Start/taskbar accent toggles, since the color swatch alone only affects a subset of UI elements." },
    { issue: "Text is hard to read after picking a bright accent", fix: "Switch to a darker or more muted custom color, or revert to 'Automatic' so Windows balances contrast for you." },
    { issue: "Accent color looks different in some apps", fix: "Some apps use their own theming and don't inherit the system accent color; this is expected behavior." },
  ],
  faqs: [
    { q: "Does accent color affect all apps?", a: "No, only apps built with Windows UI frameworks that respect system accent settings will reflect the change; many third-party apps have their own theme controls." },
    { q: "Can I sync my accent color across devices?", a: "Yes, if you sign in with a Microsoft account and have personalization sync enabled in your account settings." },
    { q: "What's the difference between accent color and theme?", a: "Accent color is one component of a theme; a theme also bundles wallpaper, sounds, and mouse cursors." },
  ],
  tipsAndTricks: [
    "Toggle 'Automatic' on and off quickly to preview several accent options pulled from your wallpaper palette",
    "Pair a custom accent color with dark mode for a high-contrast, modern look",
  ],
  relatedSettingIds: ["windows-themes", "windows-personalization", "windows-background-spotlight"],
  afterImageContent: {
    heading: "How Colors Settings Work",
    paragraphs: [
      "The Colors page lets you choose between light, dark, or custom modes for Windows and apps independently, then layer an accent color on top.",
      "When 'Automatic' is enabled, Windows analyzes your desktop background and picks a complementary accent color, updating it if you change your wallpaper.",
    ],
    steps: [
      "Open Settings → Personalization → Colors",
      "Choose your mode: Light, Dark, or Custom",
      "Toggle 'Automatically pick an accent color from my background' on or off",
      "Select a color swatch or click 'View colors' for more options",
      "Enable accent color on Start/taskbar or title bars as desired",
    ],
  },
},
{
  id: "windows-background-spotlight",
  title: "Background & Windows Spotlight",
  icon: Sparkles,
  platform: "windows",
  category: "personalization",
  controlType: "action",
  heading: "Set wallpaper or enable Spotlight",
  description: "Controls your desktop background, including static pictures, slideshows, solid colors, and Windows Spotlight, which automatically rotates curated images and can show fun facts on your desktop.",
  details: [
    "Choose Picture, Solid color, Slideshow, or Windows Spotlight",
    "Set slideshow folder and change frequency",
    "Enable 'fun facts, tips, and more' overlay text with Spotlight",
    "Choose picture fit: Fill, Fit, Stretch, Tile, Center, or Span",
  ],
  redirectUrl: "ms-settings:personalization-background",
  whyItMatters: "Your desktop background is the first thing you see every time you minimize windows or return to your desktop, so it has an outsized effect on how personalized and pleasant a PC feels to use. Windows Spotlight in particular keeps the experience fresh without any manual effort, automatically delivering new high-quality images, though it also introduces occasional promotional content some users prefer to disable. Choosing the right fit mode also matters practically, since a mismatched image can look stretched or blurry on high-resolution or multi-monitor setups.",
  bestPractices: [
    "Use Windows Spotlight if you want variety without managing your own photo folder",
    "Turn off the 'fun facts' overlay if you find the text distracting on a clean desktop",
    "For multiple monitors with different resolutions, use 'Fit' or 'Fill' instead of 'Stretch' to avoid distortion",
    "Store slideshow images locally rather than on a network drive to prevent slow loading on wake",
  ],
  commonIssues: [
    { issue: "Windows Spotlight image never changes", fix: "Check your internet connection, since Spotlight downloads new images periodically and needs connectivity to refresh." },
    { issue: "Slideshow stopped picking new photos", fix: "Confirm the selected folder still exists and contains supported image formats, then reselect it if needed." },
    { issue: "Background looks blurry or pixelated", fix: "Switch the fit option to 'Fill' or use a higher-resolution source image that matches your screen resolution." },
  ],
  faqs: [
    { q: "Does Windows Spotlight use my data or photos?", a: "No, Spotlight only downloads curated images from Microsoft; it doesn't access your personal photos unless you choose the Picture or Slideshow option." },
    { q: "Can I save a Spotlight image I like?", a: "Yes, right-click the desktop icon area or use the Spotlight icon that appears on the desktop to save the current image." },
    { q: "Can lock screen and desktop use different Spotlight settings?", a: "Yes, lock screen background is configured separately from the desktop background." },
  ],
  tipsAndTricks: [
    "Right-click a Spotlight-provided desktop image for a quick 'I like this image' or 'Learn more' option",
    "Combine a slideshow with a short interval for a rotating gallery effect during long work sessions",
  ],
  relatedSettingIds: ["windows-lock-screen", "windows-themes", "windows-colors"],
  afterImageContent: {
    heading: "How Background Settings Work",
    paragraphs: [
      "The Background page controls what renders behind your desktop icons and windows, offering static, dynamic, and curated options.",
      "Windows Spotlight periodically fetches new images from Microsoft's servers and can also surface small interactive prompts tied to the image content.",
    ],
    steps: [
      "Open Settings → Personalization → Background",
      "Choose Picture, Solid color, Slideshow, or Windows Spotlight from the dropdown",
      "Configure the specific options shown for your selection, such as folder or fit",
      "Optionally toggle the Spotlight fun-facts overlay",
    ],
  },
},
{
  id: "windows-touch-keyboard",
  title: "Touch Keyboard Personalization",
  icon: Keyboard,
  platform: "windows",
  category: "personalization",
  controlType: "action",
  heading: "Customize the on-screen touch keyboard",
  description: "Lets you personalize the appearance and behavior of the on-screen touch keyboard used on tablets, touchscreens, and 2-in-1 devices, including theme, key sound, and text suggestions.",
  details: [
    "Choose a touch keyboard theme or create a custom color scheme",
    "Enable or disable key press sounds and animations",
    "Turn text suggestions and autocorrect on or off for the touch keyboard",
    "Adjust keyboard size and enable the traditional, split, or floating layout",
  ],
  redirectUrl: "ms-settings:devicestyping-touchkeyboard",
  whyItMatters: "On touch-enabled laptops and tablets, the on-screen keyboard is a primary input method, so its layout, size, and responsiveness directly affect typing speed and accuracy. Custom themes and larger key sizes can meaningfully help users with limited dexterity or visual impairments type more comfortably. Because touch keyboard settings are separate from the physical keyboard and general typing settings, many users never find them despite relying on the on-screen keyboard daily.",
  bestPractices: [
    "Enable key press sounds if you rely on audio feedback for accurate typing",
    "Use the split layout for easier thumb-typing while holding a tablet",
    "Increase key size for touchscreens if you frequently mistype adjacent keys",
    "Turn off animations on lower-powered devices to reduce input lag",
  ],
  commonIssues: [
    { issue: "Touch keyboard theme changes don't stick", fix: "Make sure you're editing the active theme and not creating an unsaved custom theme; select 'Save' before closing." },
    { issue: "Touch keyboard doesn't appear automatically", fix: "Enable 'Show touch keyboard when not in tablet mode and there's no keyboard attached' in taskbar settings." },
    { issue: "Key sounds are too loud or distracting", fix: "Disable 'Play key sounds as I type' in the touch keyboard settings." },
  ],
  faqs: [
    { q: "Does this affect my physical keyboard too?", a: "No, these settings only apply to the on-screen touch keyboard, not a physical or Bluetooth keyboard." },
    { q: "Can I resize the touch keyboard?", a: "Yes, you can switch between full, split, and compact layouts and drag to resize where supported." },
    { q: "Why don't I see a touch keyboard icon on my taskbar?", a: "Right-click the taskbar and enable the touch keyboard icon, or check that your device supports touch input." },
  ],
  tipsAndTricks: [
    "Use the emoji panel button on the touch keyboard for quick emoji, GIF, and symbol insertion",
    "Try the floating keyboard layout on larger tablets for one-handed typing near the edge of the screen",
  ],
  relatedSettingIds: ["windows-fonts", "windows-device-usage"],
  afterImageContent: {
    heading: "How Touch Keyboard Settings Work",
    paragraphs: [
      "This page controls the visual theme and behavior of the software keyboard that appears on touch-capable Windows devices.",
      "Settings here are separate from the general Typing settings, which control autocorrect and suggestions more broadly across input methods.",
    ],
    steps: [
      "Open Settings → Personalization → Touch keyboard",
      "Pick a built-in theme or select 'Create new theme'",
      "Adjust background, key, and text colors if customizing",
      "Toggle key sounds and text suggestions to your preference",
    ],
  },
},
{
  id: "windows-device-usage",
  title: "Device Usage",
  icon: Layers,
  platform: "windows",
  category: "personalization",
  controlType: "action",
  heading: "Tell Windows how you use this PC",
  description: "Lets you tell Windows how you primarily use the device, such as Gaming, Family, Creativity, Business, School, or Entertainment, so it can tailor recommendations, tips, and pre-installed app suggestions accordingly.",
  details: [
    "Select one or more usage categories that describe this device",
    "Influences suggested apps, tips, and notifications shown by Windows",
    "Can be updated at any time as your usage changes",
    "Separate from account-level Microsoft advertising preferences",
  ],
  redirectUrl: "ms-settings:personalization-deviceusage",
  whyItMatters: "Device usage tailoring shapes the recommendations, tips notifications, and even some pre-installed app suggestions Windows shows you, so an inaccurate selection can lead to irrelevant clutter like gaming tips on a strictly work laptop. For shared or managed devices, setting this accurately helps keep the experience focused and reduces noise from suggestions that don't apply. It's a lightweight way to make Windows feel more relevant without granting any additional data access beyond what's already collected.",
  bestPractices: [
    "Select only the categories that genuinely reflect how the device is used",
    "Revisit this setting after repurposing a device, such as turning a gaming PC into a work machine",
    "Combine with 'tailored experiences' privacy settings if you want to limit related personalized suggestions",
    "Leave it unset if you'd rather not receive any usage-based recommendations",
  ],
  commonIssues: [
    { issue: "Irrelevant app suggestions keep appearing", fix: "Review and narrow down your selected device usage categories to better match actual usage." },
    { issue: "Setting doesn't seem to change anything immediately", fix: "Recommendations update gradually over time and after restarts, not instantly." },
    { issue: "Option is missing or grayed out", fix: "This feature requires an up-to-date Windows 11 build; check Windows Update if the page looks different than expected." },
  ],
  faqs: [
    { q: "Does this send data to Microsoft?", a: "It informs on-device and cloud-driven recommendations, similar to other personalization features tied to your Microsoft account if signed in." },
    { q: "Can I select more than one usage type?", a: "Yes, you can select multiple categories that apply to your device." },
    { q: "Is this the same as tailored experiences in Privacy settings?", a: "No, tailored experiences controls whether diagnostic data personalizes tips and offers, while device usage is a direct self-reported category." },
  ],
  tipsAndTricks: [
    "Set this after a fresh install to speed up getting relevant default app suggestions",
    "Pair with Start menu layout customization for a setup that matches your workflow",
  ],
  relatedSettingIds: ["windows-personalization", "windows-start-menu", "windows-touch-keyboard"],
  afterImageContent: {
    heading: "How Device Usage Works",
    paragraphs: [
      "Device Usage is a self-reported profile that Windows uses to weight which suggestions, tips, and optional apps are most likely to be relevant to you.",
      "It doesn't restrict functionality; it only influences what's proactively suggested by the system.",
    ],
    steps: [
      "Open Settings → Personalization → Device usage",
      "Toggle on the categories that best describe how you use this PC",
      "Toggle off any categories that no longer apply",
      "Close Settings; recommendations adjust over time",
    ],
  },
},
{
  id: "windows-location-privacy",
  title: "Location Privacy",
  icon: MapPin,
  platform: "windows",
  category: "privacy-permissions",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Control which apps see your location",
  description: "Manages whether Windows and individual apps can access your device's location, including the master location toggle and per-app permissions for location data.",
  details: [
    "Turn location services on or off system-wide",
    "Grant or deny location access per installed app",
    "View and clear recent location activity history",
    "Set default location for when precise location isn't available",
  ],
  important: "Turning off location system-wide will disable location-based features in Maps, Weather, Find My Device, and other apps even if those apps individually request permission.",
  redirectUrl: "ms-settings:privacy-location",
  whyItMatters: "Location data is among the most sensitive information a device can share, since it can reveal your home address, daily routine, and real-time whereabouts to any app granted access. Reviewing this list regularly prevents apps you no longer use, or apps that don't need continuous location, from tracking you in the background. It's also directly tied to security features like Find My Device, so understanding the tradeoffs here matters for both privacy and device recovery.",
  bestPractices: [
    "Grant location access only to apps that clearly need it, like Maps or Weather",
    "Prefer 'while using the app' over 'always' for location permission when the option is available",
    "Review the location access history periodically to spot unexpected background usage",
    "Keep location enabled if you rely on Find My Device for theft or loss recovery",
  ],
  commonIssues: [
    { issue: "Weather or Maps app shows the wrong location", fix: "Check that location services are enabled system-wide and the specific app has permission granted." },
    { issue: "An app keeps asking for location permission", fix: "Grant or permanently deny the permission from this settings page instead of dismissing the in-app prompt repeatedly." },
    { issue: "Find My Device isn't working", fix: "Ensure both system-wide location and the Find My Device setting are enabled." },
  ],
  faqs: [
    { q: "Does turning off location stop all tracking?", a: "It stops apps from accessing GPS or network-based location through Windows, but apps can still infer approximate location from your IP address." },
    { q: "Can I set a default location?", a: "Yes, Windows lets you set a default location used when precise location can't be determined." },
    { q: "Does this affect desktop PCs without GPS?", a: "Yes, Windows can still estimate location using Wi-Fi and IP address data even without a GPS sensor." },
  ],
  tipsAndTricks: [
    "Use the per-app list to quickly audit which apps have ever requested location access",
    "Disable location for rarely used apps instead of revoking system-wide access if you still want it for core apps",
  ],
  relatedSettingIds: ["windows-find-my-device", "windows-privacy-security", "windows-permissions"],
  afterImageContent: {
    heading: "How Location Privacy Works",
    paragraphs: [
      "This page has a master switch for location services plus a granular list of every app that has requested location access.",
      "Windows combines GPS, Wi-Fi positioning, and IP-based estimation depending on your hardware to determine location.",
    ],
    steps: [
      "Open Settings → Privacy & security → Location",
      "Toggle 'Location services' on or off system-wide",
      "Scroll to the app list and toggle individual app permissions",
      "Review 'Recent activity' to see which apps accessed location recently",
    ],
  },
},
{
  id: "windows-diagnostics-feedback",
  title: "Diagnostics & Feedback",
  icon: MessageSquareWarning,
  platform: "windows",
  category: "privacy-permissions",
  controlType: "action",
  heading: "Manage diagnostic data sent to Microsoft",
  description: "Controls how much diagnostic and usage data your device sends to Microsoft, along with feedback frequency, tailored experiences, and options to view or delete diagnostic data.",
  details: [
    "Choose between Required and Optional diagnostic data levels",
    "Toggle 'tailored experiences' that use diagnostic data for tips and recommendations",
    "View diagnostic data through the Diagnostic Data Viewer",
    "Set how often Windows asks for feedback and delete existing diagnostic data",
  ],
  redirectUrl: "ms-settings:privacy-feedback",
  whyItMatters: "Diagnostic data settings determine how much telemetry about your device's performance, crashes, and usage patterns is transmitted to Microsoft, which is a meaningful privacy consideration for security-conscious users and organizations. Choosing 'Required' diagnostic data minimizes what leaves the device while still allowing Windows Update and basic security functions to work correctly. This page also controls how often Windows interrupts you with feedback prompts, which affects daily annoyance levels independent of the privacy implications.",
  bestPractices: [
    "Select 'Required diagnostic data' if you want the minimum data sharing needed for core functionality",
    "Turn off tailored experiences if you don't want diagnostic data influencing tips and ads",
    "Set feedback frequency to 'Never' or 'Occasionally' to reduce interruptions",
    "Use the Diagnostic Data Viewer if you want to audit exactly what's collected",
  ],
  commonIssues: [
    { issue: "Diagnostic Data Viewer app isn't installed", fix: "Install it from the Microsoft Store using the link provided directly on this settings page." },
    { issue: "Too many feedback prompts appear", fix: "Lower the 'Windows should ask for my feedback' frequency to Never or Occasionally." },
    { issue: "Unsure what data was already sent", fix: "Use the 'Delete diagnostic data' button to clear data already stored in the cloud tied to your device." },
  ],
  faqs: [
    { q: "Can I stop diagnostic data collection entirely?", a: "No, Windows always sends a minimal 'Required' level needed for security and update functionality; you can't disable it completely on most editions." },
    { q: "Does this affect Windows Update?", a: "No, Required diagnostic data is sufficient for Windows Update to function normally." },
    { q: "What is tailored experiences?", a: "It's a feature that uses your diagnostic data to personalize tips, ads, and recommendations shown by Microsoft apps and services." },
  ],
  tipsAndTricks: [
    "Enterprise and Education editions may have additional 'Security' diagnostic level options via policy",
    "Combine with Activity History settings for a fuller picture of what's shared with Microsoft",
  ],
  relatedSettingIds: ["windows-activity-history", "windows-privacy-security", "windows-location-privacy"],
  afterImageContent: {
    heading: "How Diagnostics & Feedback Works",
    paragraphs: [
      "This page governs the telemetry pipeline between your device and Microsoft, along with related feedback prompts and tailored recommendations.",
      "Diagnostic data levels differ by Windows edition, with some managed enterprise devices offering an additional 'Security' tier that sends minimal data.",
    ],
    steps: [
      "Open Settings → Privacy & security → Diagnostics & feedback",
      "Choose Required or Optional diagnostic data",
      "Toggle tailored experiences on or off",
      "Set feedback frequency and optionally delete existing diagnostic data",
    ],
  },
},
{
  id: "windows-activity-history",
  title: "Activity History",
  icon: History,
  platform: "windows",
  category: "privacy-permissions",
  controlType: "action",
  heading: "Manage your device activity timeline",
  description: "Controls whether Windows stores a history of your app and browsing activity locally and, if signed in, syncs it to Microsoft to power features like Timeline-style continuity across devices.",
  details: [
    "Toggle whether Windows stores your activity history on this device",
    "Control whether activity history syncs to Microsoft with your account",
    "Clear existing activity history for your account",
    "Manage which Microsoft account activity data is tied to",
  ],
  redirectUrl: "ms-settings:privacy-activityhistory",
  whyItMatters: "Activity history creates a record of the apps you've used and documents you've opened, which is convenient for resuming work across devices but also represents a detailed log of your behavior if left unmanaged. On shared or public computers, leaving this enabled can expose your recent activity to the next person who logs into the same account. Clearing it periodically or disabling sync is a simple way to limit how much behavioral history accumulates in the cloud tied to your Microsoft account.",
  bestPractices: [
    "Disable activity history entirely on public or shared computers",
    "Clear existing history periodically if you keep the feature enabled",
    "Only sync activity to Microsoft if you actively use cross-device continuity features",
    "Review this setting after signing into a new Microsoft account on the device",
  ],
  commonIssues: [
    { issue: "Old activity keeps appearing after disabling the setting", fix: "Use the 'Clear' button on this page to remove previously stored history; disabling only stops new collection." },
    { issue: "Activity isn't syncing across devices", fix: "Confirm you're signed in with the same Microsoft account and both toggles are enabled on each device." },
    { issue: "Concerned about privacy on a work PC", fix: "Disable both storage and syncing toggles, especially on devices managed or shared with others." },
  ],
  faqs: [
    { q: "Is this the same as browser history?", a: "No, it's broader and includes app usage across the OS, though some browsers also contribute activity data if integrated." },
    { q: "Does turning this off delete past data immediately?", a: "No, you need to use the 'Clear' option separately to remove existing stored history." },
    { q: "Who can see my activity history?", a: "Only your signed-in account and, if synced, Microsoft's servers associated with your account; other users on the same device with separate accounts can't see it." },
  ],
  tipsAndTricks: [
    "Use the Microsoft privacy dashboard online to review and manage activity data tied to your account from any browser",
    "Clear activity history before lending your PC to someone else temporarily",
  ],
  relatedSettingIds: ["windows-diagnostics-feedback", "windows-privacy-security"],
  afterImageContent: {
    heading: "How Activity History Works",
    paragraphs: [
      "Activity history logs app and document usage locally, and optionally uploads it to Microsoft's cloud so it can be resumed from another signed-in device.",
      "It's separate from browser history and diagnostic data, focused specifically on continuity features.",
    ],
    steps: [
      "Open Settings → Privacy & security → Activity history",
      "Toggle 'Store my activity history on this device'",
      "Toggle 'Send my activity history to Microsoft'",
      "Click 'Clear' to remove existing stored activity",
    ],
  },
},
{
  id: "windows-onedrive-sync",
  title: "OneDrive Sync Settings",
  icon: CloudUpload,
  platform: "windows",
  category: "storage-backup-data",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Manage OneDrive file syncing",
  description: "Configures how OneDrive syncs files between this PC and the cloud, including which folders sync, Files On-Demand behavior, and bandwidth limits for uploads and downloads.",
  details: [
    "Choose which OneDrive folders sync to this specific device",
    "Enable Files On-Demand to save local disk space",
    "Set upload and download bandwidth limits",
    "Pause syncing temporarily or view sync activity and errors",
  ],
  redirectUrl: "ms-settings:storagesense",
  whyItMatters: "OneDrive sync settings determine both how much local storage your cloud files consume and how reliably your documents stay backed up and available across devices. Files On-Demand in particular can free up significant disk space on smaller SSDs by keeping files cloud-only until opened, but misconfiguring folder selection can lead to unexpectedly large downloads or missing files when offline. For anyone relying on OneDrive as a de facto backup, understanding these settings prevents sync conflicts, storage surprises, and confusion about which files are actually available offline.",
  bestPractices: [
    "Enable Files On-Demand on devices with limited local storage",
    "Selectively sync only the folders you actually need on a given device",
    "Set bandwidth limits if OneDrive syncing slows down your internet during work hours",
    "Check the OneDrive activity center periodically for sync errors or conflicts",
  ],
  commonIssues: [
    { issue: "Files show a cloud-only icon and won't open offline", fix: "Right-click the file or folder and choose 'Always keep on this device' before going offline." },
    { issue: "OneDrive is using too much disk space", fix: "Enable Files On-Demand so files stay in the cloud until you open them." },
    { issue: "Sync is stuck or shows an error icon", fix: "Open the OneDrive activity center from the taskbar to view specific error details and resolve conflicts." },
  ],
  faqs: [
    { q: "Is this the same as Windows Backup?", a: "No, Windows Backup focuses on settings and app lists, while OneDrive sync handles actual file and folder synchronization." },
    { q: "Can I sync different folders on different PCs?", a: "Yes, folder sync selection is configured per device, not account-wide." },
    { q: "Does Files On-Demand delete my files?", a: "No, files remain in the cloud and download automatically when opened; nothing is deleted." },
  ],
  tipsAndTricks: [
    "Use 'Free up space' in File Explorer to convert local files back to cloud-only without deleting them",
    "Right-click OneDrive folders to see real-time storage usage for what's synced locally",
  ],
  relatedSettingIds: ["windows-backup", "windows-storage-sense", "windows-file-history"],
  afterImageContent: {
    heading: "How OneDrive Sync Settings Work",
    paragraphs: [
      "OneDrive sync is managed through its own settings app, accessible from the cloud icon in the system tray, separate from core Windows storage settings.",
      "Files On-Demand keeps a placeholder for every cloud file locally, downloading the full content only when you open it.",
    ],
    steps: [
      "Click the OneDrive cloud icon in the system tray",
      "Open Help & Settings → Settings",
      "Go to the Account tab to choose folders to sync",
      "Go to the Settings tab to enable Files On-Demand and set bandwidth limits",
    ],
  },
},
{
  id: "windows-disk-cleanup",
  title: "Disk Cleanup",
  icon: Trash2,
  platform: "windows",
  category: "storage-backup-data",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Remove temporary and unneeded files",
  description: "Scans your drive for temporary files, system caches, old Windows update files, and other reclaimable data, then lets you safely delete them to free up disk space.",
  details: [
    "Scan and select categories of files to remove, like temp files or recycle bin contents",
    "Clean up system files, including previous Windows installation leftovers",
    "Remove Windows Update cleanup and delivery optimization files",
    "View how much space each category will reclaim before deleting",
  ],
  important: "Removing 'Previous Windows installation(s)' files means you can no longer roll back to the prior Windows version, so only clean these once you're confident the current install is stable.",
  redirectUrl: "ms-settings:storagesense",
  whyItMatters: "Over time, Windows accumulates temporary installer files, update caches, error reports, and other clutter that can consume tens of gigabytes without providing any ongoing value. Disk Cleanup gives a clear, itemized view of what's safe to remove versus what requires caution, which matters especially on smaller SSDs where every gigabyte counts. It's also one of the fastest ways to recover space after a major Windows feature update, which often leaves behind a large rollback package.",
  bestPractices: [
    "Run Disk Cleanup after major Windows feature updates to remove old installation files",
    "Use 'Clean up system files' for the fullest scan, including Windows Update leftovers",
    "Review each category before deleting rather than selecting everything blindly",
    "Empty the Recycle Bin regularly if you don't need long-term file recovery",
  ],
  commonIssues: [
    { issue: "Disk Cleanup shows very little reclaimable space", fix: "Run 'Clean up system files' instead of the basic scan to include Windows Update and system caches." },
    { issue: "Can't roll back to previous Windows version after cleanup", fix: "This is expected once previous installation files are deleted; there's no way to recover them afterward." },
    { issue: "Disk space doesn't seem to increase after cleanup", fix: "Restart the PC, since some temporary files are only released after a reboot." },
  ],
  faqs: [
    { q: "Is Disk Cleanup safe to run regularly?", a: "Yes, for standard categories like temporary files and recycle bin contents; be more cautious with system file categories tied to rollback options." },
    { q: "How is this different from Storage Sense?", a: "Storage Sense automates similar cleanup continuously in the background, while Disk Cleanup is a manual, one-time scan and delete tool." },
    { q: "Can I recover deleted files afterward?", a: "Generally no, files removed through Disk Cleanup bypass the Recycle Bin and are not easily recoverable." },
  ],
  tipsAndTricks: [
    "Sort categories by size to prioritize cleaning the biggest space consumers first",
    "Combine with Storage Sense for ongoing automated cleanup between manual runs",
  ],
  relatedSettingIds: ["windows-storage-sense", "storage-settings", "windows-disks-volumes"],
  afterImageContent: {
    heading: "How Disk Cleanup Works",
    paragraphs: [
      "Disk Cleanup scans your selected drive for categories of removable files and presents them with estimated space savings before you confirm deletion.",
      "It's a legacy tool that still ships with Windows 11 alongside the newer Storage Sense automated cleanup feature.",
    ],
    steps: [
      "Search for 'Disk Cleanup' in the Start menu",
      "Select the drive you want to clean and click OK",
      "Review the list of file categories and check the ones to remove",
      "Click 'Clean up system files' for a deeper scan if needed",
      "Click OK and confirm deletion",
    ],
  },
},
{
  id: "windows-storage-spaces",
  title: "Storage Spaces",
  icon: HardDrive,
  platform: "windows",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Pool drives for redundancy or capacity",
  description: "Lets you combine multiple physical drives into a single resilient storage pool, protecting against individual drive failure or expanding usable capacity across devices.",
  details: [
    "Create a storage pool from two or more physical drives",
    "Choose resiliency type: Simple, Two-way mirror, or Parity",
    "Monitor pool health and available capacity",
    "Add new drives to an existing pool to expand storage",
  ],
  important: "Storage Spaces resiliency protects against drive failure but is not a substitute for a separate backup, since it doesn't protect against accidental deletion, ransomware, or catastrophic loss of the whole PC.",
  redirectUrl: "ms-settings:storagesense",
  whyItMatters: "Storage Spaces gives everyday users access to enterprise-style redundant storage without needing a dedicated NAS or RAID controller, which is valuable for anyone storing large media libraries or important files across multiple drives. Choosing the right resiliency type is a meaningful tradeoff between usable capacity and protection against a failed drive, so understanding the options prevents both wasted space and false confidence in data safety. It's particularly relevant for desktop users with several internal or external drives who want a single, expandable, fault-tolerant volume.",
  bestPractices: [
    "Use Two-way mirror or Parity if drive failure protection matters more than raw capacity",
    "Only pool drives you're comfortable dedicating entirely to the pool, since they can't easily be used individually afterward",
    "Still maintain a separate backup even with resiliency enabled",
    "Monitor pool health regularly and replace failing drives promptly",
  ],
  commonIssues: [
    { issue: "Pool shows a 'Warning' or 'At risk' health status", fix: "Check for a failed or disconnected drive in the pool and replace it as soon as possible." },
    { issue: "Available capacity is much lower than total drive size", fix: "This is expected with mirror or parity resiliency, which sacrifices raw capacity for redundancy." },
    { issue: "Can't remove a drive from an active pool", fix: "You must first prepare the drive for removal within Storage Spaces to safely migrate its data before disconnecting it." },
  ],
  faqs: [
    { q: "Is Storage Spaces the same as RAID?", a: "It's conceptually similar but implemented in software by Windows rather than a hardware RAID controller." },
    { q: "Can I use external USB drives?", a: "Yes, though performance and reliability are generally better with internal or dedicated external enclosures." },
    { q: "What happens if a drive fails in a mirrored pool?", a: "Data remains accessible from the surviving drive copy; you should replace the failed drive to restore full redundancy." },
  ],
  tipsAndTricks: [
    "Label physical drives clearly if using multiple external drives in a pool to simplify future maintenance",
    "Start with Parity resiliency for the best balance of capacity and protection on three or more drives",
  ],
  relatedSettingIds: ["windows-disks-volumes", "storage-settings", "windows-backup"],
  afterImageContent: {
    heading: "How Storage Spaces Works",
    paragraphs: [
      "Storage Spaces groups physical drives into a pool, then creates one or more virtual drives from that pool with a chosen level of redundancy.",
      "Data is distributed and, depending on resiliency type, duplicated across drives so the pool can tolerate a certain number of drive failures.",
    ],
    steps: [
      "Search for 'Storage Spaces' in the Start menu",
      "Click 'Create a new pool and storage space'",
      "Select the drives to include and click 'Create pool'",
      "Choose a resiliency type and set the size for the new virtual drive",
      "Click 'Create storage space' to finish",
    ],
  },
},
{
  id: "windows-removable-storage",
  title: "Removable Storage Access",
  icon: HardDriveDownload,
  platform: "windows",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Control USB and removable drive behavior",
  description: "Manages how Windows handles removable storage devices like USB drives and SD cards, including connection notifications, battery usage behavior, and transfer settings.",
  details: [
    "Enable or disable notifications for USB connection issues",
    "Choose battery saver behavior when USB devices are connected",
    "Review connected USB device history and status",
    "Configure default actions for removable drives via AutoPlay settings",
  ],
  redirectUrl: "ms-settings:usb",
  whyItMatters: "Removable storage settings affect both convenience and security, since USB drives are a common vector for both accidental data loss and, in shared or business environments, malware transfer. Controlling AutoPlay behavior prevents unwanted programs from launching automatically when a drive is inserted, while USB notification settings help you catch power or connection issues before they cause a failed file transfer. For laptop users, USB battery saver settings can also meaningfully affect battery life when peripherals are frequently connected.",
  bestPractices: [
    "Disable AutoPlay's automatic app launching for unfamiliar removable drives",
    "Enable USB connection notifications to catch power-related connection failures early",
    "Safely eject removable drives before disconnecting to avoid data corruption",
    "Review AutoPlay defaults periodically, especially after installing new software that changes them",
  ],
  commonIssues: [
    { issue: "USB drive isn't recognized", fix: "Try a different USB port, check Device Manager for driver errors, or test the drive on another PC." },
    { issue: "AutoPlay keeps launching the wrong app", fix: "Adjust default AutoPlay actions for removable drives and memory cards in Settings." },
    { issue: "USB devices disconnect randomly to save battery", fix: "Adjust USB battery saver settings if this is disrupting an actively used peripheral." },
  ],
  faqs: [
    { q: "Does this control USB security policies?", a: "Basic access behavior is here, but stricter removable storage restrictions are typically managed via Group Policy or MDM in business environments." },
    { q: "Can I block all USB drives from this page?", a: "Not directly; blocking USB storage device classes generally requires Group Policy, registry, or third-party endpoint management tools." },
    { q: "Why does my laptop disconnect USB devices on battery?", a: "USB selective suspend or battery saver settings may power down idle USB ports to conserve battery." },
  ],
  tipsAndTricks: [
    "Use 'Safely Remove Hardware' in the system tray before unplugging drives to prevent corruption",
    "Check Device Manager's USB section if a drive shows connection notifications but doesn't appear in File Explorer",
  ],
  relatedSettingIds: ["storage-settings", "windows-onedrive-sync", "windows-bitlocker"],
  afterImageContent: {
    heading: "How Removable Storage Access Works",
    paragraphs: [
      "This page centralizes USB connection settings, including notifications and power management behavior for attached peripherals and removable drives.",
      "AutoPlay, configured separately, determines what happens automatically when a removable drive is inserted.",
    ],
    steps: [
      "Open Settings → Bluetooth & devices → USB",
      "Toggle 'Notify me if there are issues connecting to USB devices'",
      "Adjust USB battery saver preferences if shown",
      "Open Settings → Bluetooth & devices → AutoPlay to set default drive actions",
    ],
  },
},
{
  id: "windows-save-locations",
  title: "Default Save Locations",
  icon: FolderCog,
  platform: "windows",
  category: "storage-backup-data",
  controlType: "action",
  heading: "Choose where new content is saved",
  description: "Lets you set the default drive for new apps, documents, music, pictures, and videos, which is especially useful when a PC has both a small system drive and a larger secondary drive.",
  details: [
    "Choose a default install drive for new apps",
    "Set default save locations for documents, music, pictures, and videos",
    "Move existing folders to a different drive if space allows",
    "View available space on each connected drive at a glance",
  ],
  redirectUrl: "ms-settings:savelocations",
  whyItMatters: "On devices with a small primary SSD paired with a larger secondary drive, correctly configuring default save locations prevents the system drive from filling up with new apps and media that could instead live on more spacious storage. This is particularly important for budget laptops and gaming PCs where the OS drive is often the fastest but smallest available option. Setting this up correctly once avoids the recurring hassle of manually redirecting installers and save dialogs to a different drive.",
  bestPractices: [
    "Point new app installs to a secondary drive if your system drive has limited free space",
    "Move large media libraries, like Pictures or Videos, off the system drive when possible",
    "Confirm the target drive has enough space before moving existing folders",
    "Revisit this setting after adding or replacing a drive",
  ],
  commonIssues: [
    { issue: "Changing the default location doesn't move existing files", fix: "Use the 'Move' option prompted when changing a folder location, or manually move files afterward." },
    { issue: "New drive doesn't appear as an option", fix: "Confirm the drive is initialized and formatted with a recognized file system in Disk Management." },
    { issue: "Some apps still install to the system drive despite the setting", fix: "Certain apps hardcode their install path regardless of this default; use the app's own installer options if available." },
  ],
  faqs: [
    { q: "Does this move files automatically?", a: "New content follows the new default, but existing files require using the move prompt or manually relocating them." },
    { q: "Can I set different drives for different content types?", a: "Yes, apps, documents, music, pictures, and videos each have independent default location settings." },
    { q: "Will this affect where Windows itself is installed?", a: "No, this only affects new app installs and personal content, not the operating system's own location." },
  ],
  tipsAndTricks: [
    "Combine with Storage Sense to keep the system drive clean automatically going forward",
    "Check available space on each drive from this same page before committing to a change",
  ],
  relatedSettingIds: ["storage-settings", "windows-disks-volumes", "windows-storage-sense"],
  afterImageContent: {
    heading: "How Default Save Locations Work",
    paragraphs: [
      "This page lets you redirect where Windows defaults to for new installs and content by content type and target drive.",
      "It's found under Storage's advanced settings and complements, rather than replaces, manually moving individual folders.",
    ],
    steps: [
      "Open Settings → System → Storage",
      "Click 'Advanced storage settings' → 'Where new content is saved'",
      "Select a different drive from the dropdown next to each content type",
      "Confirm the move if prompted for existing folders",
    ],
  },
},
{
  id: "windows-disks-volumes",
  title: "Manage Disks and Volumes",
  icon: Database,
  platform: "windows",
  category: "storage-backup-data",
  controlType: "action",
  heading: "View and manage drive partitions",
  description: "Provides a modern interface to view all connected physical disks and their volumes, letting you create, resize, format, or delete partitions without opening the legacy Disk Management console.",
  details: [
    "View all physical disks with capacity and health status",
    "Create, shrink, extend, or delete volumes",
    "Format a volume with a chosen file system and drive letter",
    "Set a drive offline or initialize a new uninitialized disk",
  ],
  important: "Deleting or reformatting a volume permanently erases its data, so back up important files before making partition changes.",
  redirectUrl: "ms-settings:disksandvolumes",
  whyItMatters: "Partition management directly affects how storage is organized on a PC, whether you're carving out space for a dual-boot setup, resizing a partition after upgrading a drive, or troubleshooting a disk that Windows isn't recognizing correctly. Having this available directly in Settings, rather than only in the older Disk Management console, makes routine tasks like extending a volume into unallocated space more approachable for everyday users. Mistakes here can be destructive, so understanding the tool before making changes is important.",
  bestPractices: [
    "Back up important data before resizing, deleting, or reformatting any volume",
    "Leave a small amount of unallocated space when shrinking a volume for future flexibility",
    "Use the correct file system for your use case, such as NTFS for internal drives or exFAT for cross-platform external drives",
    "Double-check drive letters and disk numbers before deleting a volume to avoid removing the wrong one",
  ],
  commonIssues: [
    { issue: "New drive shows as 'Not Initialized'", fix: "Select the disk and choose 'Initialize' before you can create volumes on it." },
    { issue: "Can't extend a volume even with unallocated space available", fix: "The unallocated space must be immediately adjacent to the volume you're trying to extend; use the legacy Disk Management console for advanced repositioning if needed." },
    { issue: "Volume shows as healthy but data is missing", fix: "Check whether the correct drive letter is assigned, or if the volume was accidentally reformatted." },
  ],
  faqs: [
    { q: "Is this the same as the classic Disk Management tool?", a: "It covers most of the same core functionality with a modernized interface, though some advanced tasks still require the classic console." },
    { q: "Can I resize the Windows system partition?", a: "Yes, though shrinking it requires enough contiguous free space and extending it requires adjacent unallocated space." },
    { q: "What file systems are supported?", a: "NTFS, FAT32, and exFAT are commonly available depending on drive size and intended use." },
  ],
  tipsAndTricks: [
    "Use exFAT for large external drives shared between Windows and macOS",
    "Check disk health status here periodically to catch early signs of a failing drive",
  ],
  relatedSettingIds: ["storage-settings", "windows-storage-spaces", "windows-save-locations"],
  afterImageContent: {
    heading: "How Manage Disks and Volumes Works",
    paragraphs: [
      "This page lists every physical disk connected to your PC along with the volumes on each, offering direct actions like resize, format, and delete.",
      "It's built to handle most everyday partition tasks without requiring the older Disk Management MMC console.",
    ],
    steps: [
      "Open Settings → System → Storage",
      "Click 'Advanced storage settings' → 'Disks & volumes'",
      "Select a disk or volume to view details",
      "Choose an action such as Properties, Format, Shrink volume, or Delete volume",
    ],
  },
},
{
  id: "windows-rename-pc",
  title: "Rename This PC",
  icon: PenTool,
  platform: "windows",
  category: "system-info",
  controlType: "action",
  heading: "Change your device's network name",
  description: "Lets you change the device name Windows uses to identify this PC on networks, in file sharing, and when pairing devices like Bluetooth accessories.",
  details: [
    "View the current device name",
    "Rename the PC to something more identifiable",
    "Requires a restart to fully apply the new name",
    "Affects how the device appears on your local network and to other users",
  ],
  important: "You must restart your PC for the new device name to take full effect across all network services.",
  redirectUrl: "ms-settings:about",
  whyItMatters: "Your PC's device name shows up when sharing files over a home network, pairing Bluetooth devices, connecting to a corporate domain, or identifying the device in router admin pages. A default auto-generated name like 'DESKTOP-XXXXXXX' makes it hard to tell devices apart on a network with multiple computers, while a clear custom name like 'Living-Room-PC' or 'Work-Laptop' saves confusion during troubleshooting or file sharing. It's a small change but one that meaningfully improves day-to-day clarity in multi-device households or offices.",
  bestPractices: [
    "Use a short, descriptive name without spaces or special characters for maximum compatibility",
    "Avoid including personally identifying information in the device name if the PC will be used on public networks",
    "Rename immediately after setup, before the default name gets referenced elsewhere",
    "Restart promptly after renaming to ensure network services pick up the change",
  ],
  commonIssues: [
    { issue: "New name doesn't appear on the network yet", fix: "Restart the PC, since the name change requires a reboot to propagate to networking services." },
    { issue: "Rename option is grayed out", fix: "On domain-joined business PCs, renaming may require administrator or IT department permissions." },
    { issue: "Special characters aren't accepted", fix: "Use only letters, numbers, and hyphens; Windows restricts certain characters in device names for compatibility." },
  ],
  faqs: [
    { q: "Does renaming affect my files or apps?", a: "No, renaming the PC only changes its network identity, not your files, apps, or user account." },
    { q: "Can I rename a domain-joined work computer?", a: "Often this requires IT administrator involvement due to domain policies." },
    { q: "Does this change my Microsoft account name?", a: "No, the device name and your Microsoft account display name are completely separate." },
  ],
  tipsAndTricks: [
    "Use consistent naming conventions across household devices, like 'Kitchen-PC' or 'Office-Laptop', to simplify network browsing",
    "Check the new name from another device on the same network after restarting to confirm the change propagated",
  ],
  relatedSettingIds: ["windows-about-system-info", "windows-domain-workgroup"],
  afterImageContent: {
    heading: "How Rename This PC Works",
    paragraphs: [
      "The device name is stored as part of Windows' network identity configuration and is broadcast to other devices during network discovery and file sharing.",
      "Renaming requires administrator rights and a restart to fully take effect across all services that reference the old name.",
    ],
    steps: [
      "Open Settings → System → About",
      "Click 'Rename this PC' under Device specifications",
      "Enter a new name and click Next",
      "Restart when prompted to complete the change",
    ],
  },
},
{
  id: "windows-system-restore",
  title: "System Protection & Restore Points",
  icon: ListRestart,
  platform: "windows",
  category: "system-info",
  controlType: "action",
  heading: "Create and manage restore points",
  description: "Configures System Restore, which periodically saves snapshots of system files and settings so you can roll the PC back to an earlier working state after a problematic driver or software installation.",
  details: [
    "Enable or disable System Restore per drive",
    "Create a manual restore point before making risky changes",
    "Adjust how much disk space is reserved for restore points",
    "Roll back the system to a previous restore point when needed",
  ],
  important: "System Restore reverts system files, settings, and installed programs, but it does not affect personal files like documents or photos.",
  redirectUrl: "ms-settings:about",
  whyItMatters: "System Restore is a safety net that can undo the damage from a bad driver update, a misbehaving software install, or an unwanted system change without requiring a full reset or reinstall. Creating a manual restore point before major changes, like installing unfamiliar software or manually editing system settings, gives you an easy way back if something goes wrong. Because it's disabled by default on some drives and configurations, checking that it's actually active is worthwhile before you need it in an emergency.",
  bestPractices: [
    "Enable System Restore on your system drive if it isn't already active",
    "Create a manual restore point before installing unfamiliar drivers or system-level software",
    "Allocate enough disk space for restore points so multiple recent snapshots are retained",
    "Don't rely on System Restore as a substitute for backing up personal files",
  ],
  commonIssues: [
    { issue: "System Restore is turned off", fix: "Open System Protection settings and enable protection for the desired drive." },
    { issue: "Restore points aren't being created automatically", fix: "Check available disk space allocated to System Restore and increase it if it's set too low." },
    { issue: "A restore point failed partway through", fix: "Restart the PC and try restoring again, or select an earlier restore point if available." },
  ],
  faqs: [
    { q: "Will System Restore delete my personal files?", a: "No, it only affects system files, installed programs, and settings, not personal documents or photos." },
    { q: "How long are restore points kept?", a: "This depends on allocated disk space; older restore points are automatically deleted to make room for new ones." },
    { q: "Is this the same as a full system backup?", a: "No, System Restore is much narrower in scope and isn't a replacement for a proper file or image backup." },
  ],
  tipsAndTricks: [
    "Create a restore point manually right before a major Windows feature update if you want extra rollback flexibility",
    "Access restore points quickly by searching 'Create a restore point' in the Start menu",
  ],
  relatedSettingIds: ["windows-about-system-info", "windows-backup", "windows-reset"],
  afterImageContent: {
    heading: "How System Protection Works",
    paragraphs: [
      "System Protection periodically saves snapshots of system state called restore points, which can be used to revert changes without affecting personal files.",
      "It's accessed through the classic System Properties dialog, linked from the About page in Settings.",
    ],
    steps: [
      "Open Settings → System → About",
      "Click 'System protection' under Related links",
      "Select the drive and click 'Configure' to enable protection",
      "Click 'Create' to make a manual restore point, or 'System Restore' to roll back",
    ],
  },
},
{
  id: "windows-environment-variables",
  title: "Environment Variables",
  icon: Terminal,
  platform: "windows",
  category: "system-info",
  controlType: "action",
  heading: "Edit system and user environment variables",
  description: "Lets advanced users view and edit environment variables such as PATH, TEMP, and custom variables that control how applications, scripts, and the command line locate files and behave.",
  details: [
    "View and edit user-specific environment variables",
    "View and edit system-wide environment variables",
    "Edit the PATH variable to add or remove executable search locations",
    "Create new custom environment variables for development tools",
  ],
  important: "Editing system environment variables incorrectly, especially PATH, can break command-line tools or installed applications; note the original value before making changes.",
  redirectUrl: "ms-settings:about",
  whyItMatters: "Environment variables control how the command line, scripts, and many applications locate executables, temporary storage, and configuration data, making them foundational for developers, IT administrators, and power users running custom tools. A correctly configured PATH variable is often required for command-line tools like Git, Python, or Node.js to work from any terminal window without typing full file paths. Misconfiguring or accidentally deleting entries here is a common source of 'command not recognized' errors after installing new development tools.",
  bestPractices: [
    "Back up or note the current PATH value before making edits, in case you need to revert",
    "Add new entries to PATH rather than replacing the entire value",
    "Use user-level variables for personal tools and system-level variables only when all users need access",
    "Restart open terminal windows after editing variables, since existing sessions won't see the change",
  ],
  commonIssues: [
    { issue: "A command-line tool isn't recognized after installing it", fix: "Check whether its install location was added to PATH, and add it manually if missing." },
    { issue: "PATH variable was accidentally overwritten", fix: "Restore from a noted backup of the original value, or reinstall affected tools to have them re-register their PATH entries." },
    { issue: "Changes don't apply to already-open command prompts", fix: "Close and reopen the terminal or command prompt window, since it only reads variables at launch." },
  ],
  faqs: [
    { q: "What's the difference between user and system variables?", a: "User variables apply only to the currently signed-in account, while system variables apply to all users on the device." },
    { q: "Do I need administrator rights to edit these?", a: "Editing system-level variables requires administrator rights; user-level variables don't." },
    { q: "Can editing this break Windows?", a: "Incorrect edits, especially to PATH, can break command-line tools and some applications, though core Windows functionality is generally unaffected." },
  ],
  tipsAndTricks: [
    "Use the 'Edit text' option in the variable editor to see and edit PATH as a single string rather than a list, useful for bulk edits",
    "Development tool installers often manage PATH entries automatically, so manual edits are usually only needed for custom or portable tools",
  ],
  relatedSettingIds: ["windows-about-system-info", "windows-advanced-system-settings"],
  afterImageContent: {
    heading: "How Environment Variables Work",
    paragraphs: [
      "Environment variables are key-value pairs that Windows and applications read at startup to locate resources or adjust behavior, such as where temporary files are stored.",
      "They're split into user-specific and system-wide scopes, edited through the classic System Properties dialog.",
    ],
    steps: [
      "Open Settings → System → About",
      "Click 'Advanced system settings' under Related links",
      "Click 'Environment Variables' on the Advanced tab",
      "Select a variable to edit, or click 'New' to add one, under User or System variables",
    ],
  },
},
{
  id: "windows-domain-workgroup",
  title: "Domain or Workgroup Settings",
  icon: Globe,
  platform: "windows",
  category: "system-info",
  controlType: "action",
  heading: "Join a domain or workgroup",
  description: "Lets you configure whether this PC belongs to a home network workgroup or a business network domain, which affects sign-in options, network resource access, and group policy management.",
  details: [
    "View current workgroup or domain membership",
    "Join or leave a Windows domain for business network integration",
    "Change workgroup name for local network grouping",
    "Access advanced network identification settings",
  ],
  important: "Joining or leaving a domain typically requires a restart and domain administrator credentials, and can change available sign-in options and applied policies.",
  redirectUrl: "ms-settings:about",
  whyItMatters: "Domain membership determines whether a PC is managed centrally by an organization's IT department, receiving group policies, centralized authentication, and shared network resource access, versus operating independently in a simple home workgroup. For anyone setting up a PC for a business environment, correctly joining the domain is often a prerequisite for accessing shared drives, printers, and internal resources. For home users, workgroup names mostly matter for organizing device discovery on a local network and rarely need to be changed from the default.",
  bestPractices: [
    "Only join a domain if instructed by your organization's IT department, using provided credentials",
    "Keep workgroup names consistent across home devices for easier network browsing",
    "Confirm network connectivity to the domain controller before attempting to join",
    "Restart after changing domain or workgroup membership to fully apply the change",
  ],
  commonIssues: [
    { issue: "Can't join the domain", fix: "Verify network connectivity to the domain controller and confirm you have valid domain administrator credentials." },
    { issue: "Domain-joined PC won't show shared network resources", fix: "Confirm the account is properly authenticated to the domain and check with IT about resource permissions." },
    { issue: "Workgroup name change doesn't seem to help device discovery", fix: "Ensure network discovery is enabled in Network & Internet settings on all devices involved." },
  ],
  faqs: [
    { q: "What's the difference between a domain and a workgroup?", a: "A domain is centrally managed by a server, typically in businesses, while a workgroup is a simple peer-to-peer grouping common in homes." },
    { q: "Can I join a domain on Windows 11 Home?", a: "No, joining a domain requires Windows 11 Pro, Enterprise, or Education." },
    { q: "Does leaving a domain delete my files?", a: "No, but it may remove access to domain-based accounts and resources that were signed in through the domain." },
  ],
  tipsAndTricks: [
    "Use Azure AD / Microsoft Entra join instead of a traditional domain join for cloud-managed business environments",
    "Note your current workgroup or domain name before making changes in case you need to revert",
  ],
  relatedSettingIds: ["windows-about-system-info", "windows-rename-pc"],
  afterImageContent: {
    heading: "How Domain or Workgroup Settings Work",
    paragraphs: [
      "This setting determines the network identification model your PC uses: a simple workgroup for peer-to-peer home networking, or a domain managed by a central server for business environments.",
      "It's accessed through the classic Computer Name tab of System Properties, linked from the About page.",
    ],
    steps: [
      "Open Settings → System → About",
      "Click 'Domain or workgroup' under Related links",
      "Click 'Network ID' or 'Change' to modify membership",
      "Enter required credentials and restart when prompted",
    ],
  },
},
{
  id: "windows-uac-settings",
  title: "User Account Control Settings",
  icon: ShieldCheck,
  platform: "windows",
  category: "system-info",
  controlType: "action",
  heading: "Adjust admin approval prompt behavior",
  description: "Controls how often Windows prompts for confirmation before allowing apps or processes to make changes that require administrator privileges, balancing security against interruption frequency.",
  details: [
    "Choose from four notification levels, from always notify to never notify",
    "Understand what each level allows to run without a prompt",
    "See recommendations for balancing security and convenience",
    "Applies system-wide to all administrator and standard user accounts",
  ],
  important: "Setting User Account Control to 'Never notify' significantly reduces protection against unauthorized system changes and malware; it is not recommended for most users.",
  redirectUrl: "ms-settings:about",
  whyItMatters: "User Account Control is a core defense against malware and unauthorized changes, requiring explicit approval before software can modify system settings or install at the administrator level. Lowering this setting reduces prompt fatigue but also removes a meaningful barrier that has historically stopped many types of malicious software from silently making system-level changes. Understanding the tradeoffs at each notification level helps users make an informed choice rather than disabling protection just to avoid occasional interruptions.",
  bestPractices: [
    "Keep UAC at the default 'Notify me only when apps try to make changes' level for most users",
    "Avoid setting UAC to 'Never notify' except in isolated, tightly controlled testing environments",
    "Pay attention to what each prompt is actually requesting before approving it",
    "Use a standard (non-administrator) account for daily use alongside UAC for stronger protection",
  ],
  commonIssues: [
    { issue: "UAC prompts appear too frequently", fix: "Lower to the default recommended level if it was previously set higher, rather than disabling UAC entirely." },
    { issue: "Some legacy software won't run properly with UAC enabled", fix: "Try running the app in compatibility mode or as administrator rather than lowering system-wide UAC protection." },
    { issue: "Unsure if a UAC prompt is legitimate", fix: "Verify the program name and publisher shown in the prompt before approving, especially for unexpected prompts." },
  ],
  faqs: [
    { q: "Does disabling UAC improve performance?", a: "No, UAC has negligible performance impact; disabling it only removes a security prompt, not a performance bottleneck." },
    { q: "What's the safest UAC level?", a: "The default 'Notify me only when apps try to make changes to my computer' level is recommended for most users." },
    { q: "Can malware bypass UAC?", a: "Some sophisticated malware has used UAC bypass techniques historically, which is why keeping Windows and security software updated matters alongside UAC itself." },
  ],
  tipsAndTricks: [
    "Combine UAC with a standard user account for daily tasks to add another layer of protection beyond the prompt itself",
    "Review the UAC slider's built-in descriptions for each level before changing it, since they explain the security tradeoff clearly",
  ],
  relatedSettingIds: ["windows-privacy-security", "windows-security", "windows-about-system-info"],
  afterImageContent: {
    heading: "How UAC Settings Work",
    paragraphs: [
      "User Account Control intercepts actions that require administrator-level privileges and requires explicit approval before they proceed.",
      "The classic slider control offers four levels ranging from always notifying with a dimmed desktop to never notifying at all.",
    ],
    steps: [
      "Search for 'User Account Control' or 'UAC' in the Start menu",
      "Open 'Change User Account Control settings'",
      "Move the slider to your desired notification level",
      "Click OK and confirm the UAC prompt to apply the change",
    ],
  },
},
{
  id: "windows-delivery-optimization",
  title: "Delivery Optimization",
  icon: Share2,
  platform: "windows",
  category: "system-updates",
  controlType: "action",
  heading: "Manage peer-to-peer update sharing",
  description: "Configures Delivery Optimization, which lets your PC download Windows Update and app files from other PCs on your network or the internet in addition to Microsoft's servers, and optionally share your own downloaded updates with others.",
  details: [
    "Enable or disable downloading updates from other PCs",
    "Choose between PCs on your local network only or PCs on the internet too",
    "Set upload and download bandwidth limits for optimization traffic",
    "View activity monitor showing data downloaded and uploaded",
  ],
  redirectUrl: "ms-settings:delivery-optimization",
  whyItMatters: "Delivery Optimization can significantly speed up update downloads and reduce internet bandwidth usage in households or offices with multiple Windows devices, since updates only need to be downloaded once from Microsoft and can then be shared locally. However, allowing uploads to PCs across the internet uses your upload bandwidth to help other users worldwide, which some users prefer to limit or disable, especially on metered or limited connections. Understanding and tuning these settings prevents unexpected bandwidth consumption while still benefiting from faster local update delivery when appropriate.",
  bestPractices: [
    "Restrict sharing to 'PCs on my local network' if you want faster updates without contributing bandwidth to strangers",
    "Set upload bandwidth limits if Delivery Optimization is affecting your internet performance",
    "Disable Delivery Optimization entirely on metered or limited data connections",
    "Check the activity monitor periodically to understand actual bandwidth impact",
  ],
  commonIssues: [
    { issue: "Internet feels slower during update downloads", fix: "Set explicit bandwidth limits for Delivery Optimization or restrict it to local network sharing only." },
    { issue: "Unexpected upload data usage", fix: "Disable 'PCs on the internet' sharing to stop uploading to devices outside your local network." },
    { issue: "Updates download slowly despite Delivery Optimization enabled", fix: "Check that other PCs on the network have already downloaded the same update, since there's nothing to share otherwise." },
  ],
  faqs: [
    { q: "Is this the same as torrenting updates?", a: "It uses a similar peer-to-peer concept, sharing update files between PCs instead of relying solely on Microsoft's servers." },
    { q: "Does this share my personal files?", a: "No, only Windows Update and Microsoft Store app files are shared, never personal data." },
    { q: "Can I disable this completely?", a: "Yes, you can turn off downloading from other PCs and rely solely on Microsoft's servers." },
  ],
  tipsAndTricks: [
    "Enable local network sharing in offices or households with many Windows PCs to noticeably speed up rollout of large updates",
    "Use the Advanced options to fine-tune upload limits separately for foreground and background activity",
  ],
  relatedSettingIds: ["windows-update", "windows-update-advanced-options", "windows-optional-updates"],
  afterImageContent: {
    heading: "How Delivery Optimization Works",
    paragraphs: [
      "Delivery Optimization caches downloaded update and app files locally and shares them with other eligible PCs upon request, reducing redundant downloads from Microsoft.",
      "You control the scope of sharing, ranging from local-network-only to internet-wide peer sharing.",
    ],
    steps: [
      "Open Settings → Windows Update → Advanced options",
      "Click 'Delivery Optimization'",
      "Toggle 'Allow downloads from other PCs' on or off",
      "Choose the sharing scope and adjust Advanced options for bandwidth limits",
    ],
  },
},
{
  id: "windows-insider-program",
  title: "Windows Insider Program",
  icon: FlaskConical,
  platform: "windows",
  category: "system-updates",
  controlType: "action",
  heading: "Get early preview Windows builds",
  description: "Lets you enroll this PC in the Windows Insider Program to receive pre-release Windows builds ahead of general availability, choosing a channel that matches your appetite for new features versus stability.",
  details: [
    "Link a Microsoft account to join the Insider Program",
    "Choose a channel: Canary, Dev, Beta, or Release Preview",
    "Receive preview builds with new features before public release",
    "Leave the Insider Program to return to standard release builds",
  ],
  important: "Insider builds, especially Dev and Canary channels, can be unstable and are not recommended for primary production machines; use a secondary or test device when possible.",
  redirectUrl: "ms-settings:windowsinsider",
  whyItMatters: "The Windows Insider Program gives enthusiasts, developers, and IT professionals early access to upcoming Windows features and changes, which is valuable for testing compatibility with existing software or simply exploring what's coming next. Each channel represents a different point on the stability-versus-freshness spectrum, from the highly experimental Canary channel to the near-final Release Preview channel that closely mirrors what will ship publicly. Because preview builds can contain bugs, crashes, or unfinished features, understanding the channel differences prevents accidentally destabilizing an important daily-use PC.",
  bestPractices: [
    "Use the Release Preview channel if you want early access with minimal instability risk",
    "Avoid enrolling your primary work PC in the Dev or Canary channels",
    "Back up important data before joining any Insider channel, since preview builds carry higher risk of issues",
    "Leave the Insider Program well before a stable release cycle if you want to return to fully supported builds",
  ],
  commonIssues: [
    { issue: "PC becomes unstable after joining an Insider channel", fix: "Switch to a more stable channel like Release Preview, or leave the Insider Program and reset to the current public release." },
    { issue: "Can't find the option to leave the program", fix: "Use the 'Stop getting preview builds' option on this settings page, noting that a full return to the public release may require a clean install in some cases." },
    { issue: "Apps or drivers stop working after a preview build update", fix: "Check for updated drivers or app versions compatible with the preview build, or roll back to a previous build via Recovery options." },
  ],
  faqs: [
    { q: "Is the Windows Insider Program free?", a: "Yes, it's free to join with any Microsoft account." },
    { q: "Can I switch between channels?", a: "Yes, though moving to a less experimental channel sometimes requires waiting for that channel's build to catch up or performing a clean install." },
    { q: "Will I always get updates before everyone else?", a: "Only while enrolled and depending on channel; Release Preview builds are closest to what ships to the general public shortly after." },
  ],
  tipsAndTricks: [
    "Use a virtual machine or secondary PC to try Dev or Canary builds risk-free",
    "Submit feedback through the Feedback Hub while testing preview builds to help shape the final release",
  ],
  relatedSettingIds: ["windows-update", "windows-update-history", "windows-feedback-hub"],
  afterImageContent: {
    heading: "How the Windows Insider Program Works",
    paragraphs: [
      "Joining links your device to a Microsoft account and enrolls it to receive pre-release builds through Windows Update, ahead of the general public release.",
      "Different channels balance how experimental versus stable the builds are, letting you choose your comfort level.",
    ],
    steps: [
      "Open Settings → Windows Update → Windows Insider Program",
      "Click 'Get started' and link a Microsoft account",
      "Choose a channel: Canary, Dev, Beta, or Release Preview",
      "Restart and check Windows Update to receive the first preview build",
    ],
  },
},
{
  id: "windows-update-history",
  title: "Update History",
  icon: History,
  platform: "windows",
  category: "system-updates",
  controlType: "action",
  heading: "Review installed updates and uninstall them",
  description: "Shows a chronological list of every update installed on this PC, including quality updates, feature updates, and driver updates, with the ability to uninstall problematic recent updates.",
  details: [
    "View a chronological list of installed quality and feature updates",
    "See installation dates and update KB numbers",
    "Uninstall a recently installed update causing issues",
    "Access links to related update troubleshooting tools",
  ],
  redirectUrl: "ms-settings:windowsupdate-history",
  whyItMatters: "Update History is essential for diagnosing when a problem started, since correlating a new issue with a recently installed update's date is often the fastest way to identify the cause. Being able to uninstall a specific problematic update, rather than resetting or reinstalling the entire system, can quickly resolve issues introduced by a buggy patch while Microsoft prepares a fix. For IT support scenarios, this page also provides the exact KB numbers needed to reference known issues in Microsoft's official documentation.",
  bestPractices: [
    "Check Update History first when troubleshooting a new issue that appeared after a restart",
    "Note the specific KB number when researching a known issue with a recent update",
    "Uninstall a recent update carefully, understanding it may be reinstalled automatically later unless paused",
    "Keep Update History as a reference before contacting support, since they'll often ask for recent update details",
  ],
  commonIssues: [
    { issue: "Uninstalled update reinstalls itself automatically", fix: "Pause updates temporarily or use 'Windows Update' settings to defer the specific update while a fix is pending." },
    { issue: "Can't find a specific KB number in the list", fix: "Some driver and definition updates may be grouped separately or listed under a different category in the history." },
    { issue: "Uninstall option isn't available for an update", fix: "Some update types, particularly major feature updates and older quality updates, cannot be uninstalled after a certain period." },
  ],
  faqs: [
    { q: "How far back does Update History go?", a: "It typically shows a substantial history of recent updates, though very old entries may eventually be trimmed." },
    { q: "Can I uninstall a feature update from here?", a: "Feature updates are generally uninstalled through Recovery options within 10 days of installation, not directly from Update History." },
    { q: "Does uninstalling an update remove its security fixes?", a: "Yes, so only uninstall an update if it's causing a specific problem outweighing the security benefit temporarily." },
  ],
  tipsAndTricks: [
    "Search a KB number from this page directly in a browser to quickly find Microsoft's official known issues documentation",
    "Cross-reference the update date with when a new problem started for fast troubleshooting",
  ],
  relatedSettingIds: ["windows-update", "windows-pause-updates", "windows-optional-updates"],
  afterImageContent: {
    heading: "How Update History Works",
    paragraphs: [
      "This page pulls installation records for every update applied through Windows Update, organized by category and date.",
      "It's a diagnostic tool as much as a record, giving direct access to uninstall options for recent problematic updates.",
    ],
    steps: [
      "Open Settings → Windows Update → Update history",
      "Browse the list grouped by Quality, Driver, Definition, and other update types",
      "Click 'Uninstall updates' to open the list of removable recent updates",
      "Select the specific update and click Uninstall",
    ],
  },
},
{
  id: "windows-active-hours",
  title: "Active Hours",
  icon: Timer,
  platform: "windows",
  category: "system-updates",
  controlType: "action",
  heading: "Prevent restarts during your work hours",
  description: "Lets you define a time window during which Windows will avoid automatically restarting the PC to install updates, ensuring you're not interrupted during typical working or usage hours.",
  details: [
    "Set a start and end time for your active hours window",
    "Choose automatic adjustment based on your actual usage patterns",
    "Restarts for updates are scheduled outside this window when possible",
    "Maximum active hours span is limited to a set number of hours",
  ],
  redirectUrl: "ms-settings:windowsupdate-activehours",
  whyItMatters: "Active Hours prevents one of the most disruptive experiences in Windows: an automatic restart for updates happening in the middle of active work, a presentation, or a video call. By defining when you typically use the PC, Windows schedules restarts for update installation outside that window instead, usually overnight or during other low-usage periods. This is especially valuable for anyone with an irregular but predictable schedule where the default active hours window doesn't match actual usage patterns.",
  bestPractices: [
    "Set active hours to cover your actual typical usage window, including any evening use",
    "Enable automatic adjustment if your schedule varies day to day and you want Windows to learn it",
    "Extend active hours before a known busy day or important presentation",
    "Combine with Pause Updates for guaranteed protection during critical events beyond the active hours limit",
  ],
  commonIssues: [
    { issue: "PC still restarted during active hours", fix: "Confirm the active hours window was saved correctly and covers the actual time; a pending restart may also force through if delayed too long." },
    { issue: "Can't extend active hours far enough", fix: "Active hours have a maximum span; use Pause Updates for longer protection windows beyond that limit." },
    { issue: "Automatic adjustment doesn't match my schedule", fix: "Switch to manually setting active hours if the automatic detection isn't tracking your usage accurately." },
  ],
  faqs: [
    { q: "Does this stop updates from downloading?", a: "No, updates still download in the background; active hours only prevents automatic restarts during that window." },
    { q: "What happens if a restart is needed but active hours never has a gap?", a: "Windows will eventually prompt for or force a restart if it's been delayed too long, even during active hours, to ensure the device stays updated." },
    { q: "Is there a maximum active hours range?", a: "Yes, there's a capped maximum span; for full protection during a longer event, use Pause Updates instead." },
  ],
  tipsAndTricks: [
    "Turn on automatic active hours adjustment for a few weeks to let Windows learn your real pattern before customizing manually",
    "Check active hours the night before an important all-day event and extend if needed",
  ],
  relatedSettingIds: ["windows-update", "windows-pause-updates", "power-sleep"],
  afterImageContent: {
    heading: "How Active Hours Works",
    paragraphs: [
      "Active Hours tells Windows Update when you're typically using the PC so it can avoid scheduling automatic restarts during that window.",
      "Windows can also learn your usage pattern automatically over time if you enable adjustment based on activity.",
    ],
    steps: [
      "Open Settings → Windows Update → Advanced options",
      "Click 'Active hours'",
      "Toggle automatic adjustment, or manually set start and end times",
      "Save the changes to apply the new restart-avoidance window",
    ],
  },
},
{
  id: "windows-pause-updates",
  title: "Pause Updates",
  icon: Pause,
  platform: "windows",
  category: "system-updates",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Temporarily stop Windows Update",
  description: "Lets you temporarily halt the download and installation of Windows updates for a set period, useful when you need a stable, unchanged system for a presentation, event, or compatibility testing.",
  details: [
    "Pause updates for a selectable number of weeks",
    "Automatically resumes updating once the pause period ends",
    "Prevents both feature and quality updates during the pause",
    "Can be resumed manually at any time before the pause period ends",
  ],
  important: "Pausing updates for extended periods delays important security patches, so resume updating as soon as your reason for pausing has passed.",
  redirectUrl: "ms-settings:windowsupdate",
  whyItMatters: "Pause Updates provides direct control over one of the most common sources of unwanted disruption: an update installing or a restart being required at an inconvenient moment. For anyone preparing for an important presentation, a critical work deadline, or simply wanting a stable environment during a specific event, pausing gives predictable behavior without permanently disabling updates altogether. Because it automatically resumes after the selected period, it strikes a balance between short-term convenience and staying reasonably current on security patches.",
  bestPractices: [
    "Use the shortest pause duration that covers your actual need, rather than the maximum available",
    "Resume updates manually once your event or deadline has passed, rather than waiting for the automatic resume",
    "Avoid leaving updates paused indefinitely, since this delays important security fixes",
    "Combine with Active Hours for milder day-to-day restart protection instead of pausing entirely when possible",
  ],
  commonIssues: [
    { issue: "Pause option is grayed out", fix: "There's typically a maximum consecutive pause duration; once reached, you must resume and let updates install before pausing again." },
    { issue: "Updates resumed earlier than expected", fix: "Check the exact pause end date shown on the Windows Update page, since it counts down from when it was initially set." },
    { issue: "Still seeing a restart prompt while paused", fix: "Confirm the pause is still active; a pending restart from an update installed just before pausing may still require completion." },
  ],
  faqs: [
    { q: "How long can I pause updates for?", a: "You can pause in increments up to a maximum total period, after which you must let updates install before pausing again." },
    { q: "Does pausing stop security updates too?", a: "Yes, pausing halts all update types, including security patches, for the duration selected." },
    { q: "Can I resume early?", a: "Yes, click 'Resume updates' on the Windows Update page at any time before the pause period ends." },
  ],
  tipsAndTricks: [
    "Set a personal reminder to resume updates manually rather than relying solely on the automatic resume date",
    "Use this instead of disabling the Windows Update service entirely, which can cause other issues",
  ],
  relatedSettingIds: ["windows-update", "windows-active-hours", "windows-update-history"],
  afterImageContent: {
    heading: "How Pause Updates Works",
    paragraphs: [
      "Pausing updates instructs Windows Update to skip all download and installation activity until the selected pause period ends.",
      "It's designed for short-term use and automatically resumes normal update behavior afterward.",
    ],
    steps: [
      "Open Settings → Windows Update",
      "Find the 'Pause updates' option and select a duration from the dropdown",
      "Confirm the pause; the page will show the resume date",
      "Click 'Resume updates' at any time to end the pause early",
    ],
  },
},
{
  id: "windows-optional-updates",
  title: "Optional Updates & Driver Updates",
  icon: MonitorCog,
  platform: "windows",
  category: "system-updates",
  controlType: "action",
  heading: "Install optional driver and feature updates",
  description: "Lists optional updates not automatically installed, including driver updates from hardware manufacturers, feature previews, and monthly non-security quality updates you can choose to install manually.",
  details: [
    "View available driver updates from device manufacturers",
    "Install optional non-security quality updates ahead of the next mandatory rollout",
    "See optional feature updates you can opt into individually",
    "Select specific updates to install rather than all at once",
  ],
  redirectUrl: "ms-settings:windowsupdate-optionalupdates",
  whyItMatters: "Optional updates give access to newer drivers and minor fixes before they're bundled into the next mandatory update, which can resolve hardware compatibility issues, improve performance, or add small features ahead of schedule. Because these updates are optional rather than automatic, checking this page periodically is the only way to discover an updated driver for a printer, graphics card, or other peripheral that Windows Update won't install on its own. It's particularly useful for resolving specific hardware issues where a newer driver is known to fix a problem but hasn't yet reached general rollout.",
  bestPractices: [
    "Check this page after experiencing a hardware-specific issue, since a driver update here may resolve it",
    "Install optional quality updates only if you want early access to non-security fixes",
    "Review each optional update individually rather than installing everything automatically",
    "Uninstall an optional driver update via Device Manager if it introduces new problems",
  ],
  commonIssues: [
    { issue: "No optional updates are listed", fix: "This is normal if there are currently no optional updates available for your specific hardware and software configuration." },
    { issue: "Installed driver causes new hardware issues", fix: "Roll back the driver through Device Manager's driver properties, or wait for a subsequent fix." },
    { issue: "Optional update keeps reappearing after uninstalling", fix: "Use 'Show or hide updates' troubleshooting tool to hide a specific update you don't want reinstalled." },
  ],
  faqs: [
    { q: "Are optional updates safe to install?", a: "Generally yes, though as with any update there's a small risk of introducing new issues, so install with awareness of what you're changing." },
    { q: "Will optional updates install automatically eventually?", a: "Quality updates typically get bundled into the next mandatory cumulative update; driver updates usually remain optional unless critical." },
    { q: "How do I find manufacturer-specific driver updates?", a: "Check this page first, and also consider the manufacturer's own driver support tool or website for the most complete driver options." },
  ],
  tipsAndTricks: [
    "Check optional updates after installing a new peripheral if it isn't working perfectly out of the box",
    "Use Device Manager to roll back a specific driver if an optional update causes a regression",
  ],
  relatedSettingIds: ["windows-update", "windows-update-history", "windows-delivery-optimization"],
  afterImageContent: {
    heading: "How Optional Updates Work",
    paragraphs: [
      "This page surfaces updates, primarily drivers and select quality fixes, that Windows Update has identified as available but not mandatory for your device.",
      "You choose individually which of these to install rather than having them applied automatically.",
    ],
    steps: [
      "Open Settings → Windows Update → Advanced options",
      "Click 'Optional updates'",
      "Expand Driver updates or Other updates categories",
      "Check the boxes for updates you want and click Download & install",
    ],
  },
},
{
  id: "windows-update-advanced-options",
  title: "Windows Update Advanced Options",
  icon: Wrench,
  platform: "windows",
  category: "system-updates",
  controlType: "action",
  heading: "Fine-tune update delivery behavior",
  description: "Centralizes advanced Windows Update controls, including updating other Microsoft products alongside Windows, restart notifications, metered connection behavior, and download prioritization.",
  details: [
    "Enable updates for other Microsoft products when you update Windows",
    "Get notified when a restart is required to finish updating",
    "Control whether updates download over metered connections",
    "Enable download prioritization for faster foreground app updates",
  ],
  redirectUrl: "ms-settings:windowsupdate-options",
  whyItMatters: "This page consolidates several update behavior toggles that individually seem minor but collectively shape how disruptive or seamless the update experience feels day to day. Enabling updates for other Microsoft products ensures Office and other Microsoft apps stay current alongside Windows itself through a single update mechanism, reducing the number of separate update prompts you have to manage. For users on limited or metered data plans, controlling whether updates download automatically over such connections can prevent unexpected data usage or overage charges.",
  bestPractices: [
    "Enable 'Receive updates for other Microsoft products' to keep Office and other Microsoft apps current automatically",
    "Turn on restart notifications so you're never caught off guard by a pending restart",
    "Disable update downloads over metered connections if you have a limited data plan",
    "Review these options after a major Windows feature update, since defaults can occasionally reset",
  ],
  commonIssues: [
    { issue: "Office or other Microsoft apps aren't updating automatically", fix: "Enable 'Receive updates for other Microsoft products when you update Windows' on this page." },
    { issue: "Updates are consuming mobile hotspot data unexpectedly", fix: "Mark the connection as metered in Network settings and disable update downloads over metered connections here." },
    { issue: "No restart notification appeared before an automatic restart", fix: "Enable the 'notify me' toggle for restarts on this page to get advance warning next time." },
  ],
  faqs: [
    { q: "Does this control feature update deferral?", a: "Feature update deferral options may appear here on some editions, particularly Pro and Enterprise, alongside other advanced controls." },
    { q: "What products are covered by 'other Microsoft products'?", a: "This mainly includes Microsoft Office and certain other first-party Microsoft applications." },
    { q: "Is this different from Delivery Optimization?", a: "Yes, Delivery Optimization is specifically about peer-to-peer update sharing, while this page covers broader update behavior settings." },
  ],
  tipsAndTricks: [
    "Combine metered connection restrictions with a mobile hotspot to avoid accidental large downloads while traveling",
    "Check this page if updates seem to behave unexpectedly after a Windows feature update, since some options can reset",
  ],
  relatedSettingIds: ["windows-update", "windows-delivery-optimization", "default-apps"],
  afterImageContent: {
    heading: "How Windows Update Advanced Options Work",
    paragraphs: [
      "Advanced options gather several independent update-related toggles that affect notification behavior, cross-product updating, and network usage.",
      "These settings persist across most feature updates but are worth checking periodically to ensure they still reflect your preferences.",
    ],
    steps: [
      "Open Settings → Windows Update → Advanced options",
      "Toggle 'Receive updates for other Microsoft products' as desired",
      "Enable restart notification preferences",
      "Adjust metered connection and download prioritization toggles",
    ],
  },
},
{
  id: "windows-get-help",
  title: "Get Help App",
  icon: LifeBuoy,
  platform: "windows",
  category: "troubleshooting-diagnostics",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Access guided support and live chat",
  description: "Opens the Get Help app, Microsoft's built-in support tool that provides guided troubleshooting for common Windows problems and can connect you to a live support agent when self-service steps don't resolve an issue.",
  details: [
    "Search for guided troubleshooting on common Windows problems",
    "Run automated diagnostic and repair steps for specific issues",
    "Connect to a Microsoft support agent via chat when needed",
    "Check warranty and support eligibility for your device",
  ],
  redirectUrl: "ms-settings:troubleshoot",
  whyItMatters: "Get Help centralizes Microsoft's official support resources directly on the device, reducing the need to search the web for potentially outdated or unreliable troubleshooting advice from unofficial sources. Its guided flows can automatically run diagnostic and repair steps for common issues like audio, printing, or update problems, often resolving them without requiring deep technical knowledge. For issues that guided troubleshooting can't fix, the built-in path to a live Microsoft support agent is a legitimate, verified support channel, which matters given how many search results for tech support are scams.",
  bestPractices: [
    "Start with Get Help before searching the web for troubleshooting advice, since it's an official Microsoft channel",
    "Let the guided diagnostics run fully before manually attempting fixes yourself",
    "Have your device model and problem details ready before starting a live chat session",
    "Check warranty status through Get Help if you're unsure whether your device qualifies for support",
  ],
  commonIssues: [
    { issue: "Get Help app is missing or won't open", fix: "Reinstall it from the Microsoft Store, since it's a separate app from core Settings." },
    { issue: "Guided troubleshooting doesn't resolve the issue", fix: "Use the option to connect with a live support agent through the app for further assistance." },
    { issue: "Long wait times for live chat support", fix: "Try during off-peak hours, or use the guided self-service diagnostics first to rule out common causes." },
  ],
  faqs: [
    { q: "Is Get Help free to use?", a: "Yes, the app and its guided diagnostics are free; some in-warranty or paid support options may apply depending on your situation." },
    { q: "Is this the same as Feedback Hub?", a: "No, Get Help focuses on resolving problems you're currently having, while Feedback Hub is for reporting bugs and suggesting features." },
    { q: "Can Get Help fix hardware problems?", a: "It can diagnose some hardware-related issues and guide you toward warranty service options, but it can't physically repair hardware." },
  ],
  tipsAndTricks: [
    "Type your issue in plain language in the Get Help search bar for the most relevant guided troubleshooting flow",
    "Use Get Help's diagnostic reports as a reference when explaining your issue to a live support agent",
  ],
  relatedSettingIds: ["windows-troubleshoot", "windows-feedback-hub", "windows-recovery"],
  afterImageContent: {
    heading: "How Get Help Works",
    paragraphs: [
      "Get Help is a standalone app that combines searchable guided troubleshooting articles with automated diagnostic scripts and a live agent chat option.",
      "It's maintained directly by Microsoft, keeping its guidance current with the latest known issues and fixes.",
    ],
    steps: [
      "Search for 'Get Help' in the Start menu",
      "Type a description of your issue in the search bar",
      "Follow the guided troubleshooting steps presented",
      "Select 'Contact Support' if you need to escalate to a live agent",
    ],
  },
},
{
  id: "windows-feedback-hub",
  title: "Feedback Hub",
  icon: MessageSquareWarning,
  platform: "windows",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  heading: "Report bugs and suggest features to Microsoft",
  description: "Opens the Feedback Hub app, which lets you report bugs, log performance problems with diagnostic traces, and upvote or suggest new features that Microsoft's Windows engineering teams review.",
  details: [
    "Submit a bug report with screenshots and diagnostic recordings",
    "Suggest new features or vote on existing suggestions from other users",
    "Browse quests, which are targeted feedback requests from Microsoft",
    "Track the status of feedback you've previously submitted",
  ],
  redirectUrl: "ms-settings:troubleshoot",
  whyItMatters: "Feedback Hub is the direct channel through which everyday user reports influence future Windows updates and bug fixes, especially valuable for Windows Insiders testing preview builds where issues are actively being triaged. Submitting detailed feedback with a diagnostic trace can help Microsoft's engineers reproduce and fix an issue far more effectively than a report without technical detail. Even for users on stable Windows releases, well-documented bug reports and feature suggestions contribute to the long-term direction of the operating system.",
  bestPractices: [
    "Include a 'Recreate my problem' recording when submitting a bug report for faster diagnosis",
    "Search existing feedback before submitting a duplicate report, and upvote if you find a match",
    "Be specific about steps to reproduce an issue rather than describing symptoms vaguely",
    "Check quests periodically if you're an Insider, since they highlight areas Microsoft specifically wants tested",
  ],
  commonIssues: [
    { issue: "Feedback Hub app is missing", fix: "Reinstall it from the Microsoft Store, as it's a separate app from Settings." },
    { issue: "Can't find where to check the status of submitted feedback", fix: "Use the 'My Feedback' section within the app to track submissions." },
    { issue: "Recording a problem fails to launch", fix: "Restart the Feedback Hub app or ensure it has the necessary permissions to record your screen." },
  ],
  faqs: [
    { q: "Does Microsoft respond to every submission?", a: "Not individually, but heavily upvoted or duplicated issues are more likely to get engineering attention and visible status updates." },
    { q: "Is Feedback Hub only for Insiders?", a: "No, anyone running Windows 11 can use it, though Insiders see additional targeted quests." },
    { q: "Can I report a problem anonymously?", a: "Feedback is tied to your Microsoft account, though diagnostic data shared follows Microsoft's standard privacy practices." },
  ],
  tipsAndTricks: [
    "Use the 'Recreate my problem' feature to automatically attach relevant diagnostic logs to your report",
    "Filter feedback by category to find and upvote issues similar to ones you've experienced",
  ],
  relatedSettingIds: ["windows-get-help", "windows-insider-program", "windows-diagnostics-feedback"],
  afterImageContent: {
    heading: "How Feedback Hub Works",
    paragraphs: [
      "Feedback Hub routes user-submitted bug reports and suggestions into Microsoft's internal engineering triage systems, with visibility into upvotes and community duplicates.",
      "It also hosts targeted 'quests' during Insider testing periods, asking users to specifically evaluate certain features.",
    ],
    steps: [
      "Search for 'Feedback Hub' in the Start menu",
      "Choose 'Report a problem' or 'Suggest a feature'",
      "Describe the issue and optionally record steps to reproduce it",
      "Select a category and submit the feedback",
    ],
  },
},
{
  id: "windows-task-manager",
  title: "Task Manager Performance Monitoring",
  icon: Activity,
  platform: "windows",
  category: "troubleshooting-diagnostics",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Monitor CPU, memory, and startup impact",
  description: "Opens Task Manager, which shows real-time resource usage across CPU, memory, disk, GPU, and network, lets you end unresponsive processes, and manage which apps launch automatically at startup.",
  details: [
    "View real-time CPU, memory, disk, GPU, and network usage per process",
    "End unresponsive or resource-heavy applications",
    "Disable unnecessary startup apps to speed up boot time",
    "Review the Performance tab for detailed hardware utilization graphs",
  ],
  redirectUrl: "ms-settings:troubleshoot",
  whyItMatters: "Task Manager is the primary built-in tool for diagnosing why a PC feels slow, whether it's a runaway process consuming CPU, a memory leak, or too many startup apps competing for resources during boot. Being able to quickly identify and end an unresponsive application prevents having to restart the entire PC just to recover from one frozen program. The Startup tab specifically addresses one of the most common causes of slow boot times, letting you selectively disable apps that don't need to launch automatically every time.",
  bestPractices: [
    "Sort processes by CPU or memory usage to quickly spot what's consuming the most resources",
    "Disable unnecessary startup apps rather than leaving everything enabled by default",
    "Use the Performance tab's graphs to identify sustained versus temporary spikes in usage",
    "Check the Details tab for more granular process information when troubleshooting a specific issue",
  ],
  commonIssues: [
    { issue: "A process shows high CPU usage constantly", fix: "Identify the process, check if it's a known issue with that application, and consider ending or updating it." },
    { issue: "PC boots slowly", fix: "Open the Startup tab in Task Manager and disable high-impact apps that don't need to launch automatically." },
    { issue: "Ending a process doesn't stop the problem", fix: "Some processes restart automatically if managed by a service; check Services or the app's own settings instead." },
  ],
  faqs: [
    { q: "Is it safe to end any process?", a: "No, ending certain system processes can cause instability; only end processes you recognize as safe to close, typically user applications." },
    { q: "How do I open Task Manager quickly?", a: "Press Ctrl+Shift+Esc for instant access, or right-click the taskbar and select Task Manager." },
    { q: "What does 'startup impact' mean?", a: "It's Windows' estimate of how much a given app slows down boot time when set to launch automatically." },
  ],
  tipsAndTricks: [
    "Use Ctrl+Shift+Esc as the fastest way to open Task Manager directly, bypassing other menus",
    "Right-click a process for options like 'Open file location' or 'Search online' to identify unfamiliar processes",
  ],
  relatedSettingIds: ["windows-troubleshoot", "windows-memory-diagnostic", "windows-event-viewer"],
  afterImageContent: {
    heading: "How Task Manager Works",
    paragraphs: [
      "Task Manager reads real-time system performance counters and process information directly from the operating system kernel, presenting them in organized tabs.",
      "It doubles as both a diagnostic tool for resource usage and a direct control point for managing running applications and startup behavior.",
    ],
    steps: [
      "Press Ctrl+Shift+Esc to open Task Manager directly",
      "Review the Processes tab for current resource usage",
      "Check the Performance tab for detailed hardware graphs",
      "Open the Startup apps tab to manage what launches at boot",
    ],
  },
},
{
  id: "windows-memory-diagnostic",
  title: "Windows Memory Diagnostic",
  icon: Cpu,
  platform: "windows",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  heading: "Test your RAM for hardware errors",
  description: "Runs the built-in Windows Memory Diagnostic tool, which restarts your PC and tests physical RAM for errors that can cause crashes, blue screens, or general instability.",
  details: [
    "Schedule a memory test to run on the next restart",
    "Choose between Standard and Extended test modes",
    "Automatically restarts and returns to Windows after testing completes",
    "View test results in Windows after the diagnostic finishes",
  ],
  important: "Running the diagnostic requires an immediate or scheduled restart, and the PC is unusable for normal tasks for several minutes while the test runs.",
  redirectUrl: "ms-settings:troubleshoot",
  whyItMatters: "Faulty RAM is a common but often overlooked cause of seemingly random crashes, blue screens, and data corruption, and unlike software issues, memory errors can be difficult to diagnose through normal troubleshooting alone. The Windows Memory Diagnostic tool provides a straightforward, built-in way to rule hardware memory problems in or out without needing third-party software, which is especially useful before deciding whether to replace RAM modules. Running this test after experiencing unexplained system instability is often one of the more effective early diagnostic steps.",
  bestPractices: [
    "Run this test if you're experiencing frequent, unexplained crashes or blue screens",
    "Use Extended test mode for a more thorough check if the Standard test doesn't reveal an issue but problems persist",
    "Save any open work before running the test, since it requires an immediate restart",
    "Consider testing each RAM module individually in a system with multiple sticks if errors are found",
  ],
  commonIssues: [
    { issue: "Test reports errors found", fix: "Try reseating RAM modules first, then test each module individually to identify which one is faulty and needs replacement." },
    { issue: "Results aren't shown after restart", fix: "Check the Windows Event Viewer under Windows Logs → System for the memory diagnostic results if they didn't appear automatically." },
    { issue: "Test takes a very long time", fix: "Extended test mode is thorough but can take significantly longer than Standard mode; let it complete or switch modes for a quicker check." },
  ],
  faqs: [
    { q: "Will this test damage my RAM?", a: "No, it's a safe, non-destructive read/write test designed specifically to check RAM integrity." },
    { q: "How long does the test take?", a: "Standard mode usually takes several minutes, while Extended mode can take considerably longer depending on installed RAM capacity." },
    { q: "What should I do if errors are found?", a: "Reseat the RAM modules and retest; persistent errors typically indicate a module that needs to be replaced." },
  ],
  tipsAndTricks: [
    "Run the test overnight if using Extended mode on a system with a large amount of RAM",
    "Check Event Viewer afterward if you missed the on-screen results notification",
  ],
  relatedSettingIds: ["windows-task-manager", "windows-event-viewer", "system-restart"],
  afterImageContent: {
    heading: "How Windows Memory Diagnostic Works",
    paragraphs: [
      "The tool restarts your PC into a specialized pre-boot environment that runs a series of read/write patterns against your physical RAM to detect errors.",
      "After testing completes, Windows automatically boots back to your desktop and displays or logs the results.",
    ],
    steps: [
      "Search for 'Windows Memory Diagnostic' in the Start menu",
      "Choose 'Restart now and check for problems'",
      "Wait for the PC to restart and run the test automatically",
      "Check the notification or Event Viewer after Windows restarts for results",
    ],
  },
},
{
  id: "windows-event-viewer",
  title: "Event Viewer",
  icon: ClipboardList,
  platform: "windows",
  category: "troubleshooting-diagnostics",
  controlType: "action",
  heading: "Review detailed system and app logs",
  description: "Opens Event Viewer, an advanced diagnostic tool that logs detailed records of system events, application errors, security events, and warnings, useful for pinpointing the exact cause of crashes or failures.",
  details: [
    "Browse Windows Logs categories: Application, Security, Setup, and System",
    "Filter events by type: Error, Warning, Information, or Critical",
    "View detailed error codes and descriptions for troubleshooting",
    "Create custom views to track specific recurring issues",
  ],
  redirectUrl: "ms-settings:troubleshoot",
  whyItMatters: "Event Viewer provides the most detailed, low-level record of what's actually happening on a Windows PC, capturing crash details, driver failures, and application errors that other troubleshooting tools might only summarize vaguely. For advanced users and IT professionals, cross-referencing the exact event ID and timestamp from a crash with Event Viewer logs is often the fastest way to identify the specific faulting driver or application. While it can be overwhelming for casual users due to its volume of technical detail, learning to filter and read Critical and Error entries turns it into a powerful diagnostic resource.",
  bestPractices: [
    "Filter by Critical and Error levels first to cut through informational noise",
    "Note the exact time of a crash or issue, then look for corresponding log entries around that timestamp",
    "Search the specific Event ID online alongside the source application for targeted troubleshooting guidance",
    "Create a custom view for recurring issues you want to monitor over time",
  ],
  commonIssues: [
    { issue: "Too many entries to make sense of the logs", fix: "Filter by Critical and Error levels and narrow the time range around when the issue occurred." },
    { issue: "Can't determine what caused a crash from the log alone", fix: "Note the Event ID and source, then search Microsoft documentation or community forums for that specific combination." },
    { issue: "Application log is empty for a specific app", fix: "Not all applications log to Event Viewer; check the app's own logging or diagnostic features instead." },
  ],
  faqs: [
    { q: "Is Event Viewer safe for regular users to use?", a: "Yes, it's read-only for viewing purposes and doesn't risk system changes unless you're specifically clearing logs or configuring advanced settings." },
    { q: "What's the difference between the log categories?", a: "Application covers software events, System covers OS and driver events, Security covers audit and login events, and Setup covers installation-related events." },
    { q: "Can Event Viewer show why my PC crashed with a blue screen?", a: "Yes, checking the System log around the crash timestamp often reveals the faulting driver or hardware component." },
  ],
  tipsAndTricks: [
    "Use 'Filter Current Log' to quickly narrow results by event level and time range instead of scrolling manually",
    "Right-click an event and choose 'Attach Task to This Event' to get notified automatically if it recurs",
  ],
  relatedSettingIds: ["windows-task-manager", "windows-memory-diagnostic", "windows-troubleshoot"],
  afterImageContent: {
    heading: "How Event Viewer Works",
    paragraphs: [
      "Event Viewer reads structured log files that Windows and installed applications continuously write to, organized into categorized logs with severity levels.",
      "Each entry includes a timestamp, source, Event ID, and description, giving a detailed forensic trail for troubleshooting.",
    ],
    steps: [
      "Search for 'Event Viewer' in the Start menu",
      "Expand Windows Logs in the left pane",
      "Select Application, System, or another relevant log category",
      "Use 'Filter Current Log' to narrow by severity and time range",
    ],
  },
},{
  id: "windows-sync-settings",
  title: "Sync Your Settings",
  icon: RefreshCw,
  platform: "windows",
  category: "accounts-sync-family",
  controlType: "action",
  heading: "Roam preferences across your Windows devices",
  description:
    "Sync your settings uses your Microsoft account to roam preferences such as theme, language, passwords, and other Windows settings across every PC you sign into.",
  details: [
    "Toggle individual sync categories: Theme, Passwords, Language preferences, Other Windows settings",
    "Requires being signed in with a Microsoft account rather than a local account",
    "Syncs automatically in the background whenever connected to the internet",
    "Works independently from Windows Backup, which syncs files and apps rather than preferences",
  ],
  redirectUrl: "ms-settings:sync",
  whyItMatters:
    "For anyone who regularly switches between a desktop, laptop, and a secondary Windows PC, sync settings removes the tedium of manually reconfiguring the same preferences on every device. It is especially useful for passwords saved in Microsoft Edge and for keeping a consistent visual theme without extra setup. Because it is a lighter-weight sync than a full backup, it applies changes quickly across devices. Understanding the distinction between this and Windows Backup helps avoid confusion about why some things (settings) show up automatically while others (files) require a separate backup step.",
  bestPractices: [
    "Turn off syncing for categories you intentionally want to differ between devices, like a different theme on a work PC.",
    "Make sure you're signed in with the same Microsoft account on every device you want to sync.",
    "Pair with Windows Backup for a complete picture: settings sync here, files and apps sync there.",
    "Check this page first if a changed setting isn't appearing on your other PC.",
  ],
  commonIssues: [
    { issue: "A setting changed on one PC isn't appearing on another.", fix: "Confirm both devices are signed in with the same Microsoft account and connected to the internet, then allow a few minutes for sync to complete." },
    { issue: "Sync toggles are greyed out.", fix: "This happens when signed in with a local account; switch to a Microsoft account to enable sync." },
    { issue: "Saved passwords aren't syncing to Edge on another device.", fix: "Check that both 'Passwords' sync here and Edge's own sync toggle are both enabled." },
  ],
  faqs: [
    { q: "Does this sync my files too?", a: "No, this only syncs settings and preferences; use Windows Backup or OneDrive for files." },
    { q: "Can I sync only some categories?", a: "Yes, each category (Theme, Passwords, Language, Other Windows settings) has its own toggle." },
    { q: "Does this work with a local account?", a: "No, sync requires a Microsoft account." },
  ],
  tipsAndTricks: [
    "If you just reset your PC, sign in with your Microsoft account early so settings begin syncing before you start reconfiguring things manually.",
  ],
  relatedSettingIds: ["windows-backup", "windows-your-info", "windows-sign-in-options"],
  afterImageContent: {
    heading: "How Settings Sync Works",
    paragraphs: [
      "Sync uses your Microsoft account as the anchor, pushing changes from one signed-in PC to your account and pulling them down on others.",
      "Each sync category can be toggled independently, so you can choose to sync your theme but not your saved passwords, for example.",
    ],
    steps: [
      "Open Settings → Accounts → Windows backup (or Sync your settings on older builds)",
      "Confirm you're signed in with a Microsoft account",
      "Toggle on the categories you want to sync",
      "Repeat sign-in and toggle steps on your other Windows PCs",
    ],
  },
},
{
  id: "windows-phone-link",
  title: "Phone Link",
  icon: MonitorSmartphone,
  platform: "windows",
  category: "apps-features",
  frequentlyUsed: true,
  controlType: "action",
  heading: "Connect your Android or iPhone to your PC",
  description:
    "Phone Link pairs your smartphone with your PC so you can view and reply to texts, see notifications, make calls, and access photos without picking up your phone.",
  details: [
    "Pair an Android phone for full features (apps, notifications, calls, messages) or an iPhone for a lighter feature set",
    "Mirror and control select Android apps directly from your PC",
    "View recent photos from your phone in a synced gallery",
    "Send and receive SMS/RCS messages from the desktop",
  ],
  important: "iPhone support is more limited than Android because Apple restricts background access; calls and messages work, but app mirroring does not.",
  redirectUrl: "ms-settings:mobile-devices",
  whyItMatters:
    "Phone Link cuts down on context switching by surfacing your phone's texts, calls, and notifications right on the screen you're already working on, which is a real productivity gain for anyone who's tired of picking up their phone every few minutes. For Android users specifically, app mirroring effectively turns the PC into a secondary phone screen, useful for quick replies in messaging apps that don't have a desktop client. It also matters for accessibility, since some users find typing on a full keyboard easier than a phone's on-screen one.",
  bestPractices: [
    "Keep Bluetooth enabled on both devices for the most reliable connection.",
    "Use the companion 'Link to Windows' app on Android for the full feature set rather than relying on default pairing alone.",
    "Disable app mirroring for apps you don't want visible on a shared or work PC screen.",
    "Re-pair if you switch Wi-Fi networks frequently and notice sync delays.",
  ],
  commonIssues: [
    { issue: "Phone Link shows as disconnected even though the phone is nearby.", fix: "Ensure both devices are on the same Wi-Fi network and Bluetooth is on, then reopen the Phone Link app on the phone." },
    { issue: "Notifications from the phone aren't appearing on the PC.", fix: "Check notification access permissions were granted to Phone Link on the phone during setup." },
    { issue: "App mirroring isn't available.", fix: "This is an Android-only feature on supported devices; iPhone doesn't support app mirroring." },
  ],
  faqs: [
    { q: "Does this work with any phone?", a: "Most modern Android and iPhone models are supported, though the feature set differs significantly between the two." },
    { q: "Do I need the phone unlocked for messages to sync?", a: "No, once paired, notifications and messages sync in the background." },
    { q: "Can I unpair a phone?", a: "Yes, from this same settings page you can remove a linked device at any time." },
  ],
  tipsAndTricks: [
    "Pin the Phone Link app to your taskbar for one-click access to recent texts and calls.",
  ],
  relatedSettingIds: ["windows-linked-devices", "bluetooth-settings", "notifications-settings"],
  afterImageContent: {
    heading: "How Phone Link Works",
    paragraphs: [
      "Phone Link connects to your phone over Bluetooth and Wi-Fi, relaying notifications, messages, and calls through a background service.",
      "Android devices get the deepest integration, including the ability to open and interact with individual apps in a window on the PC.",
    ],
    steps: [
      "Open Settings → Bluetooth & devices → Mobile devices",
      "Turn on 'Allow this PC to access your mobile devices'",
      "Select 'Add a device' and scan the QR code with your phone's camera",
      "Follow the prompts in the Phone Link app to finish pairing",
    ],
  },
},
{
  id: "windows-general-privacy",
  title: "General Privacy Options",
  icon: Shield,
  platform: "windows",
  category: "privacy-permissions",
  controlType: "action",
  heading: "Control broad, cross-app privacy toggles",
  description:
    "General privacy options cover system-wide toggles that don't belong to a specific permission, including advertising ID personalization, app launch tracking for Start menu suggestions, and website language list access.",
  details: [
    "Turn off the advertising ID used to personalize ads across apps",
    "Disable letting apps show personalized content based on how often you use them",
    "Control whether websites can access your Windows language list to serve localized content",
    "Manage SmartScreen-related content suggestions in Settings",
  ],
  redirectUrl: "ms-settings:privacy-general",
  whyItMatters:
    "These toggles are easy to overlook because none of them individually feels significant, but together they control how much of your usage pattern is shared with advertisers and how personalized your Windows experience is across apps you didn't explicitly grant a permission to. Turning off the advertising ID, for instance, doesn't stop ads but does stop them from being tailored to your behavior across different apps. This page is a common first stop for anyone doing a general privacy cleanup pass on a new or shared PC.",
  bestPractices: [
    "Turn off the advertising ID if you'd rather not have cross-app ad personalization, especially on a shared or work device.",
    "Review this page after a major Windows feature update, since new toggles are sometimes added here.",
    "Combine with the dedicated Location, Camera, and Microphone privacy pages for a complete privacy pass.",
    "Don't expect these toggles to block ads entirely — they only limit personalization, not ad display itself.",
  ],
  commonIssues: [
    { issue: "Ads still appear after disabling the advertising ID.", fix: "This is expected; the toggle stops personalization, not ad display, since many apps show generic ads regardless." },
    { issue: "Start menu suggestions still feel personalized after disabling tracking.", fix: "Some suggestions come from Microsoft account activity rather than local app-launch tracking, and are managed separately in your Microsoft account privacy dashboard." },
  ],
  faqs: [
    { q: "Does turning these off remove ads from Windows entirely?", a: "No, it only reduces personalization; some built-in ad surfaces remain regardless of this setting." },
    { q: "Is this the same as browser privacy settings?", a: "No, this only covers system-level Windows toggles, not your browser's own tracking protections." },
  ],
  tipsAndTricks: [
    "Reset your advertising ID from this page if you want to start fresh without changing any other privacy settings.",
  ],
  relatedSettingIds: ["windows-privacy-security", "windows-permissions", "camera-permission"],
  afterImageContent: {
    heading: "How General Privacy Works",
    paragraphs: [
      "This page groups miscellaneous, system-wide privacy toggles that apply across many apps rather than one specific permission category.",
      "Most toggles here affect personalization and suggestion quality rather than blocking functionality outright.",
    ],
    steps: [
      "Open Settings → Privacy & security → General",
      "Review each toggle description before turning it off",
      "Restart apps that use personalized suggestions for the change to fully apply",
    ],
  },
},
{
  id: "windows-pc-health-check",
  title: "PC Health Check & Upgrade Eligibility",
  icon: Activity,
  platform: "windows",
  category: "system-info",
  controlType: "action",
  heading: "Check hardware eligibility for feature upgrades",
  description:
    "PC Health Check reports whether your device meets the hardware requirements (TPM 2.0, Secure Boot, supported CPU) for the latest Windows feature upgrade, alongside a quick overview of battery and storage health.",
  details: [
    "Shows a pass/fail result for each Windows 11 hardware requirement",
    "Displays battery capacity health on supported laptops",
    "Surfaces storage space warnings before you attempt a major upgrade",
    "Links directly to guidance for resolving any failed requirement",
  ],
  important: "PC Health Check is a separate Microsoft Store app rather than a built-in Settings page; the About page links out to it rather than embedding its results directly.",
  redirectUrl: "ms-settings:about",
  whyItMatters:
    "Before attempting a major Windows feature upgrade, checking hardware eligibility avoids the frustration of a failed or blocked install partway through. Requirements like TPM 2.0 and Secure Boot are enforced strictly for Windows 11, and older PCs frequently fail silently without an obvious explanation unless this check is run first. It also gives a battery health snapshot that's otherwise hard to find without third-party tools, useful for deciding whether a laptop battery needs replacing.",
  bestPractices: [
    "Run this before attempting any major feature upgrade, not after hitting an error.",
    "If TPM shows as disabled rather than absent, check your PC's UEFI/BIOS firmware settings, since it's often just turned off.",
    "Revisit this periodically on older hardware to track battery health degradation over time.",
  ],
  commonIssues: [
    { issue: "TPM shows as 'not available' even though the CPU is listed as compatible.", fix: "Enter UEFI/BIOS firmware settings and enable TPM (sometimes labeled fTPM or PTT), since it's often present but disabled by default." },
    { issue: "The eligibility check fails with no specific reason given.", fix: "Download and run the standalone PC Health Check app from Microsoft for a more detailed breakdown than the About page summary." },
  ],
  faqs: [
    { q: "Is this the same as Windows Update?", a: "No, this only checks eligibility and hardware health; it doesn't install anything itself." },
    { q: "Can I upgrade if my PC fails a requirement?", a: "Officially, no supported path exists, though some enthusiasts use unsupported workarounds at their own risk." },
  ],
  tipsAndTricks: [
    "Check TPM status directly by running 'tpm.msc' from the Run dialog for a more technical view than the Health Check summary.",
  ],
  relatedSettingIds: ["windows-about-system-info", "windows-update", "windows-activation"],
  afterImageContent: {
    heading: "How PC Health Check Works",
    paragraphs: [
      "The tool queries your motherboard firmware, CPU model, and TPM chip status against Microsoft's published requirement list.",
      "Battery health is estimated by comparing current maximum capacity against the battery's original design capacity.",
    ],
    steps: [
      "Open Settings → System → About",
      "Look for the Windows 11 upgrade eligibility link, or install the PC Health Check app from the Microsoft Store",
      "Run the check and review any failed requirements",
      "Follow the linked guidance to resolve issues like disabled TPM",
    ],
  },
},
];
