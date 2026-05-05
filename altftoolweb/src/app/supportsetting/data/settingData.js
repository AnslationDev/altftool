
import { RotateCcw, Camera, Mic, Wifi, RefreshCw ,BluetoothIcon, Monitor,CloudDownload,HardDrive } from "lucide-react";

export const settingsData = [
  {
  id: "windows-update",
  title: "Windows Update",
  icon: CloudDownload,
  heading: "Manage Windows Updates",
  description:
    "Windows Update allows you to download and install the latest security patches, feature updates, and performance improvements. Keeping your system updated helps protect against vulnerabilities and ensures optimal performance.",
  details: [
    "Updates include security patches, bug fixes, and new features.",
    "You can pause updates temporarily if needed.",
    "Feature updates may take longer to install than regular updates.",
    "Restart may be required after installing updates."
  ],
  important:
    "Delaying critical security updates may leave your system vulnerable to threats. Always install important updates as soon as possible.",
  redirectUrl: "ms-settings:windowsupdate",
  imageUrl: "https://softwarehubs.b-cdn.net/wp-content/uploads/2024/10/HD-Audio50.jpeg",
  imageAlt: "Windows Update Settings",
  afterImageContent: {
    heading: "How Windows Update Works",
    paragraphs: [
      "Windows Update automatically checks for new updates in the background.",
      "You can manually check for updates anytime from the Settings panel.",
      "Optional updates such as drivers and preview builds are available under advanced options."
    ],
    steps: [
      "Open Settings → Windows Update.",
      "Click 'Check for updates'.",
      "Download and install available updates.",
      "Restart your device if prompted."
    ]
  }
},
{
  id: "windows-reset",
  title: "Windows Reset",
  icon: HardDrive,
  heading: "Reset This PC",
  description:
    "Windows Reset allows you to reinstall the operating system while choosing whether to keep your personal files or remove everything. This option is useful when your PC is experiencing serious performance issues, system corruption, or persistent software problems.",
  details: [
    "You can choose between 'Keep my files' or 'Remove everything'.",
    "Reset reinstalls Windows using local files or cloud download.",
    "All installed applications will be removed during the reset.",
    "The process may take 20–60 minutes depending on your system."
  ],
  important:
    "Although you can choose to keep personal files, all installed applications and custom settings will be removed. Always back up important data before performing a reset.",
  redirectUrl: "ms-settings:recovery",
  imageUrl: "https://i.pcmag.com/imagery/articles/06seN9qhHZtc6Rv8ocLmKZ2-16.fit_lim.size_1050x.png",
  imageAlt: "Reset This PC Settings",
  afterImageContent: {
    heading: "Understanding the Reset Process",
    paragraphs: [
      "Resetting your PC reinstalls Windows to fix major system issues without requiring external installation media.",
      "The 'Keep my files' option removes apps and settings but preserves personal documents.",
      "The 'Remove everything' option performs a full wipe, suitable when selling or transferring the device.",
      "You can choose between local reinstall or cloud download depending on your internet availability."
    ],
    steps: [
      "Open Settings → System → Recovery.",
      "Under 'Reset this PC', click 'Reset PC'.",
      "Choose 'Keep my files' or 'Remove everything'.",
      "Select Local reinstall or Cloud download.",
      "Follow on-screen instructions to complete the reset."
    ]
  }
},
  {
    id: "system-restart",
    title: "System Restart",
    icon: RefreshCw,
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
    imageUrl: "https://img.webnots.com/2023/05/Confirm-Restart-Now-from-Advanced-Startup-Setting.jpg",
    imageAlt: "System Restart Advanced Startup Settings",
    afterImageContent: {
    heading: "How Restart Works in Windows",
    paragraphs: [
      "When you restart your PC, Windows closes all running applications, logs out active users, and reinitializes system drivers.",
      "Restarting refreshes memory (RAM) and stops background services that may be causing performance issues.",
      "If updates are pending, Windows may apply them during the restart process."
    ],
    steps: [
      "Click Start → Power → Restart.",
      "Wait while Windows shuts down and boots back up.",
      "Sign back in and reopen your applications."
    ]
  }
  },

  {
    id: "camera-permission",
    title: "Camera Permission",
    icon: Camera,
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
    imageUrl: "https://browserstack.wpenginepowered.com/wp-content/uploads/2024/11/Click-on-Camera-to-Allow-Access.jpg",
    imageAlt: "Camera Permission Settings",
    afterImageContent: {
  heading: "Understanding Camera Privacy Settings",
  paragraphs: [
    "Windows allows you to control camera access at both the system and individual app levels. This ensures that only trusted applications can use your device’s camera.",
    "You can disable camera access completely for all apps or selectively allow access for specific applications.",
    "If your camera is not working in a video app, checking permission settings is one of the first troubleshooting steps."
  ],
  steps: [
    "Open Settings → Privacy & Security → Camera.",
    "Turn on 'Camera access' for the device.",
    "Enable 'Let apps access your camera'.",
    "Toggle access on or off for individual apps."
  ]
}

  },

  {
    id: "microphone-permission",
    title: "Microphone Permission",
    icon: Mic,
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
    imageUrl: "https://media.geeksforgeeks.org/wp-content/uploads/20240318113853/Turn-on-Mic-and-Camera-Using-Site-Settings_2.png",
    imageAlt: "Microphone Permission Settings",
    afterImageContent: {
  heading: "Managing Microphone Access in Windows",
  paragraphs: [
    "Microphone permissions allow you to control which applications can capture audio from your device.",
    "Windows provides separate toggles for desktop apps and Microsoft Store apps.",
    "If your voice is not detected during calls or recordings, checking microphone permissions and input device selection can resolve the issue."
  ],
  steps: [
    "Go to Settings → Privacy & Security → Microphone.",
    "Enable 'Microphone access' for the device.",
    "Turn on 'Let apps access your microphone'.",
    "Review and manage individual app permissions."
  ]
}

  },

  {
    id: "wifi-connection",
    title: "WiFi Connection",
    icon: Wifi,
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
    imageUrl: "https://www.top-password.com/blog/wp-content/uploads/2021/04/wifi-settings.png",
    imageAlt: "WiFi Connection Settings",
    afterImageContent: {
  heading: "How WiFi Settings Work",
  paragraphs: [
    "WiFi settings allow you to connect to available wireless networks and manage saved connections.",
    "Windows automatically reconnects to trusted networks when 'Connect automatically' is enabled.",
    "Advanced settings allow you to configure IP address, DNS server, and network profile (Public or Private)."
  ],
  steps: [
    "Click the network icon in the taskbar.",
    "Select an available WiFi network.",
    "Enter the network password.",
    "Choose 'Connect automatically' if desired."
  ]
}

  },

  {
    id: "network-reset",
    title: "Network Reset",
    icon: RotateCcw,
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
    imageUrl: "https://img.kaspersky.com/kb/en-global/278876_494082_common_12378_04.png",
    imageAlt: "Network Reset Settings",
    afterImageContent: {
  heading: "What Happens During a Network Reset",
  paragraphs: [
    "A network reset removes and reinstalls all network adapters on your device.",
    "All saved WiFi networks, VPN configurations, and custom network settings will be deleted.",
    "This is a powerful troubleshooting step when experiencing persistent connectivity problems."
  ],
  steps: [
    "Open Settings → Network & Internet.",
    "Select Advanced network settings.",
    "Click 'Network reset'.",
    "Confirm by selecting 'Reset now' and restart your PC."
  ]
}

  },
  {
  id: "bluetooth-settings",
  title: "Bluetooth Settings",
  icon: BluetoothIcon,
  heading: "Manage Bluetooth Devices",
  description:
    "Bluetooth settings allow you to connect wireless devices such as headphones, keyboards, mice, and smartphones to your PC. You can pair, remove, and manage connected devices easily.",
  details: [
    "Bluetooth must be turned on before pairing devices.",
    "Paired devices reconnect automatically when in range.",
    "You can remove devices that you no longer use.",
    "Troubleshooting options are available if pairing fails."
  ],
  important:
    "Ensure Bluetooth is enabled on both your PC and the device you are trying to connect. Keep devices within range during pairing.",
  redirectUrl: "ms-settings:bluetooth",
  imageUrl: "https://images.drivereasy.com/wp-content/uploads/2018/11/img_5be92aafe0cad.jpg",
  imageAlt: "Bluetooth Settings Panel",
  afterImageContent: {
    heading: "Pairing a Bluetooth Device",
    paragraphs: [
      "Bluetooth allows secure short-range wireless communication between devices.",
      "Once paired, devices reconnect automatically when Bluetooth is enabled.",
      "If connection issues occur, removing and re-pairing the device often resolves the problem."
    ],
    steps: [
      "Open Settings → Bluetooth & devices.",
      "Turn on Bluetooth.",
      "Click 'Add device'.",
      "Select your device from the list and complete pairing."
    ]
  }
},{
  id: "display-settings",
  title: "Display Settings",
  icon: Monitor,
  heading: "Adjust Display Settings",
  description:
    "Display settings allow you to adjust screen resolution, brightness, scaling, and multiple monitor configurations. Proper display configuration improves visual clarity and productivity.",
  details: [
    "Change resolution to match your monitor’s recommended settings.",
    "Adjust brightness to reduce eye strain.",
    "Use scaling to make text and apps larger.",
    "Configure multiple displays for extended or duplicate mode."
  ],
  important:
    "Using unsupported resolutions may result in display distortion. Always use recommended settings for best performance.",
  redirectUrl: "ms-settings:display",
  imageUrl: "https://www.cnet.com/a/img/resize/ab00d42266b4a5b6e2b9c90cc5570b14a70761ce/hub/2018/05/16/a945b0cf-df92-47b1-8fc2-66a4be89b8e0/windows-10-display-settings.jpg?auto=webp&width=1200",
  imageAlt: "Display Settings Interface",
  afterImageContent: {
    heading: "Customizing Your Display",
    paragraphs: [
      "Windows automatically detects connected monitors and applies recommended settings.",
      "You can rearrange multiple displays to match your physical setup.",
      "Advanced display options allow you to adjust refresh rate and color settings."
    ],
    steps: [
      "Open Settings → System → Display.",
      "Select the display you want to adjust.",
      "Modify resolution, scaling, or orientation.",
      "Click 'Apply' to confirm changes."
    ]
  }
}


];