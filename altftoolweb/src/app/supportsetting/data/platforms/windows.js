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
    imageUrl:
      "https://softwarehubs.b-cdn.net/wp-content/uploads/2024/10/HD-Audio50.jpeg",
    imageAlt: "Windows Update Settings",
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
    imageUrl:
      "https://i.pcmag.com/imagery/articles/06seN9qhHZtc6Rv8ocLmKZ2-16.fit_lim.size_1050x.png",
    imageAlt: "Reset This PC Settings",
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
    imageUrl:
      "https://img.webnots.com/2023/05/Confirm-Restart-Now-from-Advanced-Startup-Setting.jpg",
    imageAlt: "System Restart Advanced Startup Settings",
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
    imageUrl:
      "https://browserstack.wpenginepowered.com/wp-content/uploads/2024/11/Click-on-Camera-to-Allow-Access.jpg",
    imageAlt: "Camera Permission Settings",
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
    imageUrl:
      "https://media.geeksforgeeks.org/wp-content/uploads/20240318113853/Turn-on-Mic-and-Camera-Using-Site-Settings_2.png",
    imageAlt: "Microphone Permission Settings",
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
    imageUrl:
      "https://www.top-password.com/blog/wp-content/uploads/2021/04/wifi-settings.png",
    imageAlt: "WiFi Connection Settings",
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
    imageUrl:
      "https://img.kaspersky.com/kb/en-global/278876_494082_common_12378_04.png",
    imageAlt: "Network Reset Settings",
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
    imageUrl:
      "https://images.drivereasy.com/wp-content/uploads/2018/11/img_5be92aafe0cad.jpg",
    imageAlt: "Bluetooth Settings Panel",
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
    imageUrl:
      "https://www.cnet.com/a/img/resize/ab00d42266b4a5b6e2b9c90cc5570b14a70761ce/hub/2018/05/16/a945b0cf-df92-47b1-8fc2-66a4be89b8e0/windows-10-display-settings.jpg?auto=webp&width=1200",
    imageAlt: "Display Settings Interface",
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
    imageUrl:
      "https://siriusofficesolutions.com/wp-content/uploads/2025/01/windows-storage-settings.png",
    imageAlt: "Windows 11 Storage Settings",
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
    imageUrl: "https://i.sstatic.net/ite9v.png",
    imageAlt: "Windows 11 Power & Sleep Settings",
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
    imageUrl:
      "https://winaero.com/blog/wp-content/uploads/2021/07/Windows-11-Settings-System-Sound.png",
    imageAlt: "Windows 11 Sound Settings",
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
    imageUrl:
      "https://60a99bedadae98078522-a9b6cded92292ef3bace063619038eb1.ssl.cf2.rackcdn.com/images_Screenshot%202025-01-23%20161009.png",
    imageAlt: "Windows 11 Notification Settings",
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
    imageUrl:
      "https://s3.amazonaws.com/cdn.freshdesk.com/data/helpdesk/attachments/production/5158464766/original/E5AV0fe4TR7JuZnK_yuccTfgTnxo_-HXpA.png?1668029284",
    imageAlt: "Windows 11 Default Apps Settings",
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
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQmWzry3yu_sJfWcucCq37Qwcku0K4Lb1TKbHpJyGDcg&s=10",
    imageAlt: "Windows 11 Language & Region Settings",
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
    relatedSettingIds: ["microphone-permission", "windows-security", "camera-permission"],
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
];
