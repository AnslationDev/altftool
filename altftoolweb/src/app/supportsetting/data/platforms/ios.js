import {
  CloudDownload,
  HardDrive,
  Cloud,
  EyeOff,
  Lock,
  Wifi,
  BluetoothIcon,
  Sun,
  Accessibility,
  Users,
  RotateCcw,
  Bell,
  Volume2,
  Moon,
  Battery,
  Info,
  SlidersHorizontal,
  LayoutGrid,
  Image,
  Clock4,
  MapPin,
  Signal,
  Router,
  ShieldCheck,
  Share2,
  Search,
  Keyboard,
  Globe,
  Clock,
  LocateFixed,
  Wallet,
  Store,
  Compass,
  Siren,
  Gamepad2,
} from "lucide-react";

// iOS Support Settings (iPhone/iPad). New entries — link out to a real,
// verified official Apple support article for each topic (checked live via
// WebFetch). No hotlinked screenshots, matching the same approach used for
// macOS and Android.
export const iosSettings = [
  {
    id: "ios-software-update",
    title: "Software Update",
    icon: CloudDownload,
    platform: "ios",
    category: "system-updates",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Update Your iPhone or iPad",
    description:
      "Software Update keeps iOS current with the latest security fixes, features, and app compatibility. You can update wirelessly, overnight while charging, or via a computer.",
    details: [
      "iOS can download and install updates automatically overnight while charging and connected to Wi-Fi.",
      "You can check for and install updates manually at any time.",
      "Security Responses can install important fixes faster, without waiting for a full iOS version update.",
      "Updates typically require enough free storage and battery (or being plugged in) to install.",
    ],
    important:
      "Very old devices may stop receiving new iOS versions — check whether your specific model is still supported if updates no longer appear.",
    redirectUrl: "https://support.apple.com/en-us/118575",
    afterImageContent: {
      heading: "How iOS Updates Work",
      paragraphs: [
        "Your iPhone checks Apple's servers for available updates and notifies you when one is ready.",
        "Automatic Updates can be turned on so updates install with no action needed from you.",
        "A restart is required to finish installing most iOS updates.",
      ],
      steps: [
        "Open Settings → General → Software Update.",
        "Wait for iOS to check for updates, or tap 'Check for Updates'.",
        "Tap 'Download and Install'.",
        "Enter your passcode and let your device restart when prompted.",
      ],
    },
    whyItMatters:
      "Every iOS update bundles the security patches that close vulnerabilities discovered since the last release, so delaying updates leaves known exploits open on your device. Updates also fix bugs affecting battery life, app crashes, and connectivity, and they're required for many new App Store apps to keep working correctly. Skipping updates for too long can eventually mean losing compatibility with newer app versions and accessories.",
    bestPractices: [
      "Turn on Automatic Updates so security fixes install overnight without you having to remember.",
      "Plug your iPhone in and connect to Wi-Fi before bed so overnight updates actually have a chance to run.",
      "Check manually before a big trip or event, since Apple sometimes ships urgent Security Responses outside the normal update cycle.",
      "Keep at least a few GB of free storage available, since large iOS updates can fail to download when storage is tight.",
      "Restart your device promptly after an update finishes installing rather than leaving it in the 'update pending restart' state.",
    ],
    commonIssues: [
      {
        issue: "Update download stalls at 'Verifying Update' or gets stuck for hours",
        fix: "Restart the iPhone, reconnect to Wi-Fi, and retry from Settings → General → Software Update; if it still stalls, temporarily disable a VPN or content filter that may be blocking Apple's servers.",
      },
      {
        issue: "'Not Enough Storage' error prevents the update from downloading",
        fix: "Free up space in Settings → General → iPhone Storage, or let iOS use its temporary 'offload apps to make room' option during the update.",
      },
      {
        issue: "Automatic Updates never seem to run overnight",
        fix: "Confirm the device is charging, locked, and connected to Wi-Fi at night, and that Settings → General → Software Update → Automatic Updates has both toggles enabled.",
      },
      {
        issue: "An older iPhone no longer shows the newest iOS version available",
        fix: "Check Apple's published device compatibility list for that iOS version — some hardware has reached its final supported release and this is expected, not a bug.",
      },
    ],
    faqs: [
      {
        q: "Will updating my iPhone delete my data?",
        a: "No, a standard software update preserves your apps, photos, and settings — only an 'Erase All Content and Settings' reset deletes data, not a regular iOS update.",
      },
      {
        q: "Can I skip an iOS update and go straight to a newer one?",
        a: "Yes, you can usually update directly to the latest available version; iOS doesn't require installing every intermediate version in sequence.",
      },
      {
        q: "Why does my iPhone ask me to update over Wi-Fi only?",
        a: "Large iOS update files can be several gigabytes, so Apple defaults to Wi-Fi to avoid surprise cellular data charges, though newer iOS versions do allow cellular updates for smaller files.",
      },
      {
        q: "Is it safe to keep using my iPhone while an update downloads in the background?",
        a: "Yes, you can keep using your device normally while the update downloads; it only requires you to stop and restart once you tap 'Install'.",
      },
    ],
    tipsAndTricks: [
      "You can see your exact current iOS build number under Settings → General → About if support needs it for troubleshooting.",
      "Enable 'Security Responses & System Files' installation separately if you want critical patches applied even faster, without waiting on full iOS releases.",
      "If an update keeps failing over Wi-Fi, connecting to a computer with Finder (Mac) or iTunes (Windows) can complete the install when the wireless method won't.",
    ],
    relatedSettingIds: ["ios-iphone-storage", "ios-icloud-backup", "ios-reset-iphone"],
    updateFrequency:
      "Check for updates at least monthly if Automatic Updates is off, and install Security Responses as soon as they appear since they patch actively exploited vulnerabilities.",
  },
  {
    id: "ios-iphone-storage",
    title: "iPhone Storage",
    icon: HardDrive,
    platform: "ios",
    category: "storage-backup-data",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Storage on iPhone",
    description:
      "iPhone Storage shows exactly what's using space on your device and offers one-tap recommendations — like offloading unused apps or reviewing large attachments — to free up room.",
    details: [
      "Offloading an app removes the app itself but keeps its documents and data for when you reinstall it.",
      "Recommendations are personalized based on what's actually taking up space on your device.",
      "You can review storage used by individual apps, photos, messages, and system data.",
      "iCloud Photos with 'Optimize iPhone Storage' keeps lightweight versions locally to save space.",
    ],
    important:
      "Deleting an app (rather than offloading it) permanently removes its local data unless that data is backed up elsewhere.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/manage-storage-on-iphone-iph47c931112/ios",
    afterImageContent: {
      heading: "Freeing Up Space",
      paragraphs: [
        "The Storage screen ranks apps by how much space they use, largest first.",
        "Recommendations may include offloading unused apps or reviewing large video attachments in Messages.",
        "iOS periodically updates its recommendations as your usage changes.",
      ],
      steps: [
        "Open Settings → General → iPhone Storage.",
        "Wait for the storage breakdown to load.",
        "Review the recommendations and tap one to act on it.",
        "Check individual apps for anything you no longer need.",
      ],
    },
    whyItMatters:
      "Running low on storage quietly breaks core iPhone functions — the camera refuses to take photos, apps crash on launch, and iOS updates fail to download. Because iPhone Storage shows exactly which apps and file types are eating your space, it turns a vague 'my phone is full' problem into a specific, fixable list. Regularly clearing space also keeps backups and updates running smoothly instead of stalling partway through.",
    bestPractices: [
      "Offload apps you rarely use instead of deleting them outright, so their data is preserved for a quick reinstall later.",
      "Turn on 'Optimize iPhone Storage' for Photos so full-resolution originals stay safely in iCloud while lightweight versions live on your device.",
      "Review the Messages attachments section periodically — years of received videos and photos can quietly consume tens of gigabytes.",
      "Act on the personalized recommendations at the top of the Storage screen first, since they're calculated from your actual usage.",
    ],
    commonIssues: [
      {
        issue: "'Other' or 'System Data' takes up an unexpectedly large amount of space",
        fix: "Restart the iPhone to clear cached data, and check Safari's website data and app caches, which often account for this category.",
      },
      {
        issue: "Storage still looks full right after deleting a lot of photos",
        fix: "Empty the 'Recently Deleted' album in Photos, since deleted items stay recoverable there for 30 days and still count against storage.",
      },
      {
        issue: "An app reports it needs to be reinstalled after being offloaded",
        fix: "This is expected — offloading removes the app binary but keeps its documents; tap the greyed-out icon to redownload it from the App Store.",
      },
      {
        issue: "iCloud Photos shows photos as taking space even with Optimize Storage on",
        fix: "Give the device time on Wi-Fi and power to finish thinning local copies; it doesn't happen instantly after enabling the setting.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between offloading and deleting an app?",
        a: "Offloading removes the app itself but keeps its saved data and documents, so reinstalling later restores everything; deleting removes the app and its local data together.",
      },
      {
        q: "Why does 'iPhone Storage' show a different total than the About screen?",
        a: "The About screen shows raw capacity, while iPhone Storage reflects usable space after the operating system and system reserves, so the numbers won't match exactly.",
      },
      {
        q: "Does offloading unused apps delete my saved documents or game progress?",
        a: "No, offloading intentionally preserves that data locally so it's restored automatically the next time you reinstall the app from the App Store.",
      },
    ],
    tipsAndTricks: [
      "Tap directly on the colored storage bar at the top of the screen to see which category (Apps, Photos, Media, System) a particular segment represents.",
      "Enable 'Offload Unused Apps' under App Store settings so iOS automatically offloads rarely used apps only when storage actually runs low.",
      "The app list is already sorted by size, so the biggest single offender is usually right at the top rather than buried among many small apps.",
    ],
    relatedSettingIds: ["ios-icloud-backup", "ios-software-update", "ios-reset-iphone"],
    updateFrequency:
      "Glance at the Storage screen monthly, or immediately whenever you get a low-storage warning or an update fails to download.",
  },
  {
    id: "ios-icloud-backup",
    title: "iCloud Backup",
    icon: Cloud,
    platform: "ios",
    category: "storage-backup-data",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Back Up Your iPhone or iPad with iCloud",
    description:
      "iCloud Backup automatically saves a copy of your photos, app data, device settings, and more, so you can restore everything on a new or reset device.",
    details: [
      "Automatic backups happen when your device is locked, connected to power, and on Wi-Fi.",
      "You can trigger a manual backup at any time from Settings.",
      "Backup size depends on your iCloud storage plan — you may need to upgrade for larger backups.",
      "Restoring from a backup is offered automatically during setup on a new or erased device.",
    ],
    important:
      "If your iCloud storage is full, automatic backups will stop — free up space or upgrade your plan to keep backups current.",
    redirectUrl: "https://support.apple.com/en-us/108366",
    afterImageContent: {
      heading: "What's Included in an iCloud Backup",
      paragraphs: [
        "Backups include app data, device settings, home screen layout, and iMessage/text messages.",
        "Photos and videos are typically stored via iCloud Photos rather than the device backup itself.",
        "You can see the date and size of your last backup right in Settings.",
      ],
      steps: [
        "Open Settings → [Your Name] → iCloud → iCloud Backup.",
        "Turn on 'Back Up This iPhone' if it isn't already.",
        "Tap 'Back Up Now' to run an immediate backup over Wi-Fi.",
      ],
    },
    whyItMatters:
      "A current iCloud Backup is the difference between a lost or damaged iPhone being a minor inconvenience and a genuine disaster — it's what lets you restore messages, photos, app data, and your entire home screen layout onto a replacement device. Because backups run automatically overnight, most people never think about them until they desperately need one, which is exactly when an outdated or missing backup causes real data loss. It's one of the few settings where 'set it and forget it' only works if you actually confirm it's working.",
    bestPractices: [
      "Charge your iPhone overnight on a known Wi-Fi network so the automatic backup condition (locked, charging, Wi-Fi) is reliably met.",
      "Check the 'last backed up' date in Settings periodically rather than assuming backups are happening silently.",
      "Upgrade your iCloud+ storage plan if backups are failing due to space, rather than disabling backup for large apps just to fit.",
      "Run a manual 'Back Up Now' before major events like an iOS update, a trade-in, or travel, so you have a fresh restore point.",
    ],
    commonIssues: [
      {
        issue: "Backup hasn't run in weeks despite iCloud Backup being turned on",
        fix: "Confirm the phone is actually locked and charging on Wi-Fi overnight — a case blocking the charging cable or a habit of using the phone at night can silently prevent it.",
      },
      {
        issue: "'Not Enough iCloud Storage' blocks the backup from completing",
        fix: "Either free up iCloud space by removing old backups of unused devices, or upgrade to a larger iCloud+ storage tier.",
      },
      {
        issue: "A newly restored iPhone seems to be missing recent messages or photos",
        fix: "Make sure you restored from the most recent backup date, not an older one, and give iCloud Photos time to finish downloading full-resolution images after setup.",
      },
      {
        issue: "Backup is stuck on 'Estimating time remaining' indefinitely",
        fix: "Turn Wi-Fi off and back on, or restart the device, then retry the manual backup — this usually resolves a stalled network handshake with iCloud.",
      },
    ],
    faqs: [
      {
        q: "Does iCloud Backup include my photos?",
        a: "If iCloud Photos is enabled, your photos are stored and synced there directly rather than duplicated inside the device backup; if iCloud Photos is off, photos are included in the backup itself.",
      },
      {
        q: "How much iCloud storage do I actually need for backups?",
        a: "It depends on your data, but the free 5GB tier is rarely enough for a full backup with photos — most users need at least the 50GB or 200GB iCloud+ tier.",
      },
      {
        q: "Can I back up over cellular data instead of Wi-Fi?",
        a: "Automatic backups require Wi-Fi by default; a manual backup triggered from Settings can sometimes use cellular, but this can consume significant data depending on backup size.",
      },
      {
        q: "What happens to my old backups when I get a new iPhone?",
        a: "Old backups remain in iCloud until you delete them or they age out for storage reasons; you can manage and delete backups for specific devices from the iCloud storage settings.",
      },
    ],
    tipsAndTricks: [
      "Under Settings → [Your Name] → iCloud → Manage Account Storage → Backups, you can see and delete backups for devices you no longer own to free up space.",
      "You can choose which specific apps are included in your iCloud backup from the same Backup screen, excluding large ones you don't need preserved.",
      "Before restoring a new device, back up your current iPhone one last time so nothing from the last few hours or days gets missed.",
    ],
    relatedSettingIds: ["ios-iphone-storage", "ios-reset-iphone", "ios-software-update"],
    updateFrequency:
      "Automatic backups run daily whenever conditions are met (locked, charging, Wi-Fi); verify the 'last backed up' date at least weekly if you're not sure it's running consistently.",
  },
  {
    id: "ios-privacy-permissions",
    title: "Privacy & Permissions",
    icon: EyeOff,
    platform: "ios",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Control App Access to Camera, Microphone & Location",
    description:
      "The Privacy & Security hub lets you review and control exactly which apps can access your Camera, Microphone, Location Services, Contacts, Photos, and more.",
    details: [
      "An orange dot in the status bar means the microphone is currently in use; a green dot means the camera is.",
      "Location Services can be set per app to Never, Ask Next Time, While Using, or Always.",
      "App Privacy Report shows how often apps have accessed sensitive data and contacted other domains.",
      "Tapping any category (like Camera) lists every app that has requested that permission.",
    ],
    important:
      "Denying location access to navigation or delivery apps will prevent core features like turn-by-turn directions from working.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/control-access-to-information-in-apps-iph251e92810/ios",
    afterImageContent: {
      heading: "Reviewing Permissions by Category",
      paragraphs: [
        "iOS groups permissions by data type (Camera, Microphone, Location, Contacts, Photos, etc.).",
        "You can jump straight to any app's individual permission settings from its category listing.",
        "The App Privacy Report gives a longer-term view of how apps have used the permissions you granted.",
      ],
      steps: [
        "Open Settings → Privacy & Security.",
        "Select a category (e.g. Camera or Microphone).",
        "Review which apps have access and toggle any off as needed.",
      ],
    },
    whyItMatters:
      "Apps can quietly request access to your camera, microphone, precise location, contacts, and photo library, and without regular review those permissions tend to accumulate far beyond what's actually needed. Location and microphone access in particular can be used for tracking or advertising purposes well beyond the feature you originally granted them for. Reviewing this hub regularly is one of the highest-leverage privacy habits on iPhone because it directly controls what data leaves your device.",
    bestPractices: [
      "Set location access to 'While Using the App' instead of 'Always' unless a feature genuinely requires background location, like Find My or a delivery app.",
      "Review the App Privacy Report every few weeks to see which apps are actually using the permissions you granted and how often.",
      "Restrict Photos access to 'Selected Photos' for apps that don't need your entire library, rather than granting full access by default.",
      "Pay attention to the orange and green status bar dots — they indicate live microphone or camera use and are worth investigating if they appear unexpectedly.",
    ],
    commonIssues: [
      {
        issue: "A navigation or delivery app stops working correctly after location access is restricted",
        fix: "Set that specific app's location permission back to 'While Using the App' or 'Always' rather than 'Never', since core navigation features depend on it.",
      },
      {
        issue: "Green or orange dot appears in the status bar with no obvious app open",
        fix: "Open Control Center to see which app is listed as recently using the camera or microphone, and check that app's individual permissions if it's unfamiliar.",
      },
      {
        issue: "An app keeps re-requesting a permission you already denied",
        fix: "This is normal behavior for some apps on relaunch; if it becomes intrusive, review the app's settings directly rather than repeatedly dismissing the system prompt.",
      },
      {
        issue: "Photos access shows 'Limited' and an app can't see images you just took",
        fix: "Go to that app's Photos permission and add the new photos to its selected access, or switch it to 'All Photos' if you trust the app.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between 'While Using the App' and 'Always' for location?",
        a: "'While Using the App' only shares location when the app is open and active, while 'Always' allows background location access even when the app is closed, which is rarely necessary outside of navigation, fitness tracking, or Find My-style apps.",
      },
      {
        q: "Does turning off Microphone access for an app break voice features entirely?",
        a: "Yes, an app cannot process any audio input without microphone permission, so voice memos, voice search, or calling features within that specific app will stop functioning until access is restored.",
      },
      {
        q: "Can I see which apps have accessed my location recently?",
        a: "Yes, Settings → Privacy & Security → Location Services shows a recent indicator next to any app that has used your location in the last 24 hours.",
      },
    ],
    tipsAndTricks: [
      "Tap the 'i' info icon next to an app's location setting to see a small map preview of the precision level it's currently allowed.",
      "Turn off 'Precise Location' for apps like weather or shopping that only need your general area, keeping exact GPS coordinates private.",
      "Use App Privacy Report's 'Network Contacts' view to spot apps quietly communicating with third-party domains you don't recognize.",
    ],
    relatedSettingIds: ["ios-face-id-passcode", "ios-wifi", "ios-screen-time-family"],
    updateFrequency:
      "Do a full permissions review every couple of months, and immediately after installing any new app that requests sensitive access.",
  },
  {
    id: "ios-face-id-passcode",
    title: "Face ID & Passcode",
    icon: Lock,
    platform: "ios",
    category: "privacy-permissions",
    recommended: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Face ID and Passcode on iPhone",
    description:
      "Face ID (or Touch ID) and Passcode settings control how you unlock your iPhone, authorize purchases, and protect sensitive data with biometric or code-based security.",
    details: [
      "You can register multiple Face ID appearances or fingerprints for more reliable recognition.",
      "A passcode is always required as a backup to Face ID or Touch ID.",
      "You can choose which features require Face ID: unlocking, Apple Pay, App Store purchases, and more.",
      "Erase Data can be turned on to wipe the device after 10 failed passcode attempts.",
    ],
    important:
      "If you forget your passcode, you may need to erase your device to regain access — always keep a way to recover your Apple Account.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/set-up-face-id-iph6d162927a/ios",
    afterImageContent: {
      heading: "Setting Up Face ID",
      paragraphs: [
        "Face ID setup involves slowly moving your head in a circle so the camera can capture your face from multiple angles.",
        "You can add an Alternate Appearance to improve recognition for changes like glasses or facial hair.",
        "Face ID and passcode settings are grouped in one place for quick review.",
      ],
      steps: [
        "Open Settings → Face ID & Passcode.",
        "Enter your current passcode.",
        "Tap 'Set Up Face ID' and follow the on-screen motion prompts.",
        "Choose which features should use Face ID.",
      ],
    },
    whyItMatters:
      "Face ID and your passcode are the single point of failure protecting everything else on your iPhone — messages, banking apps, saved passwords, and photos are all only as secure as this setting. Because a passcode is always required as a fallback, weak or simple passcodes undermine even a well-configured Face ID setup. This is also the setting that determines what happens after failed unlock attempts, making it central to what happens if your phone is lost or stolen.",
    bestPractices: [
      "Use a 6-digit or custom alphanumeric passcode instead of a 4-digit one, since it's dramatically harder to guess or shoulder-surf.",
      "Register an Alternate Appearance in Face ID if you regularly wear glasses, a hat, or have facial hair changes, to reduce failed unlock attempts.",
      "Enable Face ID for App Store purchases and Apple Pay to avoid separately re-entering passwords for those actions.",
      "Turn on 'Erase Data After 10 Failed Attempts' only if you're confident about your backup situation, since it's irreversible once triggered.",
    ],
    commonIssues: [
      {
        issue: "Face ID stops recognizing your face after wearing a mask or new glasses",
        fix: "Add an Alternate Appearance in Settings → Face ID & Passcode → 'Set Up an Alternate Appearance' rather than resetting Face ID entirely.",
      },
      {
        issue: "iPhone keeps asking for the passcode instead of using Face ID",
        fix: "This happens after a restart, after 48 hours of no unlock, or after several failed Face ID attempts — all are intentional security fallbacks, not a bug.",
      },
      {
        issue: "Forgot the passcode and can't get back in",
        fix: "Use 'Erase iPhone' from the passcode entry screen (after enough failed attempts) or connect to a computer in recovery mode, then restore from your most recent iCloud or computer backup.",
      },
      {
        issue: "Face ID setup fails repeatedly during the initial scan",
        fix: "Make sure nothing (a screen protector edge, dirt, or a case) is blocking the TrueDepth camera area, and try setup again in better lighting.",
      },
    ],
    faqs: [
      {
        q: "Is Face ID or a strong passcode more secure?",
        a: "They work together — Face ID is convenient for daily unlocking, but the passcode remains the ultimate fallback and is what protects the device if Face ID fails or is disabled, so both need to be strong.",
      },
      {
        q: "Can someone unlock my phone by holding it up to my face while I'm asleep?",
        a: "Face ID includes attention awareness that checks your eyes are open and directed at the device by default, which makes this much harder, though you can require a more deliberate look for extra protection.",
      },
      {
        q: "What happens if I enter the wrong passcode too many times?",
        a: "After several failed attempts iOS adds increasing time delays between tries, and if 'Erase Data' is enabled, the device wipes itself entirely after 10 consecutive failures.",
      },
      {
        q: "Does Face ID work with sunglasses on?",
        a: "Face ID can work with many sunglasses since it uses infrared, not just visible light, but very dark or infrared-blocking lenses may prevent recognition.",
      },
    ],
    tipsAndTricks: [
      "Double-clicking the side button at the Lock Screen brings up Apple Pay directly, using Face ID for authentication without unlocking the whole phone first.",
      "You can disable the 'attention-aware' requirement under Accessibility settings if you find the deliberate-glance requirement for Face ID inconvenient or inaccessible.",
      "Set up Face ID indoors under normal lighting rather than in very bright sunlight or complete darkness for the most reliable initial scan.",
    ],
    relatedSettingIds: ["ios-privacy-permissions", "ios-reset-iphone", "ios-icloud-backup"],
  },
  {
    id: "ios-wifi",
    title: "Wi-Fi Connection",
    icon: Wifi,
    platform: "ios",
    category: "connectivity-network",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Connect Your iPhone to Wi-Fi",
    description:
      "Wi-Fi settings let you join nearby networks, share passwords instantly between Apple devices, and manage previously joined networks.",
    details: [
      "Nearby networks are listed automatically with signal strength shown.",
      "Password sharing lets a nearby iPhone or Mac send you a saved Wi-Fi password directly.",
      "Known networks reconnect automatically unless you tell your device to forget them.",
      "'Ask to Join Networks' controls whether iOS prompts you when no known network is in range.",
    ],
    important:
      "Avoid signing in to sensitive accounts while connected to open, password-free public Wi-Fi networks.",
    redirectUrl: "https://support.apple.com/en-us/111107",
    afterImageContent: {
      heading: "Joining and Managing Networks",
      paragraphs: [
        "iOS shows every nearby network along with a lock icon for secured networks.",
        "Forgetting a network removes its saved password so you'll need to re-enter it later.",
        "Private Wi-Fi Address settings can be adjusted per network for extra privacy.",
      ],
      steps: [
        "Open Settings → Wi-Fi.",
        "Tap a network and enter its password (or accept a shared password prompt).",
        "Confirm the network shows 'Connected' with a checkmark.",
      ],
    },
    whyItMatters:
      "Your Wi-Fi connection determines whether backups, software updates, and iCloud Photos sync happen automatically in the background, since most of those tasks are restricted to Wi-Fi to avoid cellular data charges. Joining the wrong network, especially an open public one, also has real privacy implications since data can be more easily intercepted on unsecured networks. Managing known networks properly also solves the everyday annoyance of a phone stubbornly reconnecting to a weak or outdated network instead of a stronger one nearby.",
    bestPractices: [
      "Forget old or no-longer-used networks (like a previous home or a hotel) so your iPhone doesn't waste time trying to reconnect to networks with saved but outdated passwords.",
      "Leave 'Ask to Join Networks' set to 'Notify' so you're aware of available networks without being interrupted by every weak signal in range.",
      "Avoid logging into sensitive accounts like banking apps while connected to open, password-free public Wi-Fi.",
      "Keep Private Wi-Fi Address enabled for most networks, which is the default and recommended setting to limit device tracking.",
    ],
    commonIssues: [
      {
        issue: "iPhone connects to a weak or wrong known network instead of a stronger one nearby",
        fix: "Forget the weaker network in Settings → Wi-Fi so the device stops prioritizing it, then reconnect to the preferred network manually.",
      },
      {
        issue: "Wi-Fi password sharing prompt never appears when a nearby friend's iPhone tries to join your network",
        fix: "Make sure both devices have Wi-Fi and Bluetooth on, are unlocked, and that the receiving device's Apple Account email is in the other person's Contacts.",
      },
      {
        issue: "Wi-Fi keeps disconnecting and reconnecting repeatedly",
        fix: "Forget the network and rejoin with the password entered fresh, or restart the router, since this is often a router-side lease or interference issue rather than an iPhone problem.",
      },
      {
        issue: "'Ask to Join Networks' constantly interrupts with prompts for weak public networks",
        fix: "Change the setting from 'Ask' to 'Notify' or 'Off' under Settings → Wi-Fi → Ask to Join Networks.",
      },
    ],
    faqs: [
      {
        q: "Why won't my iPhone show a nearby Wi-Fi network that I know exists?",
        a: "The network may be using a 5GHz-only or hidden SSID that some settings filter out, or it might be out of effective range despite showing full bars on another device.",
      },
      {
        q: "Is it safe to use free Wi-Fi at a coffee shop or airport?",
        a: "It's reasonably safe for general browsing, but avoid entering passwords or banking details on open networks, or use a VPN for sensitive activity.",
      },
      {
        q: "What does 'Private Wi-Fi Address' actually do?",
        a: "It uses a different, randomized network identifier (MAC address) for each Wi-Fi network you join, making it harder for networks to track your device across visits or locations.",
      },
    ],
    tipsAndTricks: [
      "You can share your Wi-Fi password with someone nearby just by holding their unlock screen close to yours while their device tries to join — no need to read the password aloud.",
      "Tap the small 'i' icon next to any joined network to view or copy its password if you have a stored device passcode or Face ID handy.",
      "Turn off Wi-Fi Assist under Settings → Cellular if you want your phone to strictly stay on Wi-Fi rather than quietly switching to cellular for a weak signal.",
    ],
    relatedSettingIds: ["ios-bluetooth", "ios-privacy-permissions", "ios-software-update"],
  },
  {
    id: "ios-bluetooth",
    title: "Bluetooth Devices",
    icon: BluetoothIcon,
    platform: "ios",
    category: "connectivity-network",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Connect Bluetooth Accessories to iPhone",
    description:
      "Bluetooth settings let you pair AirPods, headphones, speakers, keyboards, and other accessories, and manage previously connected devices.",
    details: [
      "Apple accessories like AirPods often pair instantly with a pop-up animation when nearby.",
      "Third-party accessories need to be put into pairing mode before they appear in the list.",
      "You can rename, disconnect, or forget any paired device from its details screen.",
      "Battery levels for supported accessories are shown right on the Bluetooth settings screen.",
    ],
    important:
      "If an accessory won't reconnect, forget it on your iPhone and re-pair it from scratch — this resolves most stuck connections.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/connect-bluetooth-accessories-iph3c50f191/ios",
    afterImageContent: {
      heading: "Pairing a New Accessory",
      paragraphs: [
        "iOS scans for nearby discoverable Bluetooth accessories automatically once Bluetooth is on.",
        "Audio accessories can be selected as the active output right from Control Center.",
        "Some accessories support automatic switching between your Apple devices.",
      ],
      steps: [
        "Open Settings → Bluetooth.",
        "Turn on Bluetooth if it isn't already.",
        "Put your accessory into pairing mode and tap it under 'Other Devices'.",
      ],
    },
    whyItMatters:
      "Bluetooth settings govern how reliably your AirPods, car stereo, smartwatch, and other accessories connect, and a cluttered or outdated device list is the most common cause of pairing headaches. Because multiple paired devices can compete for an audio connection, understanding this screen helps you control exactly which accessory your iPhone talks to at any moment. It's also relevant to battery life, since Bluetooth scanning left on unnecessarily can contribute to background power drain.",
    bestPractices: [
      "Forget accessories you no longer own or use regularly to keep the device list clean and avoid connection conflicts.",
      "Rename frequently used accessories with recognizable names (like 'Car Stereo' or 'Work AirPods') so switching audio output is faster from Control Center.",
      "Keep only one audio accessory actively connected at a time if you're having trouble with audio routing between multiple paired devices.",
      "Check battery levels for supported accessories directly in the Bluetooth settings screen instead of relying on a separate app.",
    ],
    commonIssues: [
      {
        issue: "AirPods or headphones won't reconnect after working fine previously",
        fix: "Forget the device under Settings → Bluetooth, then put it back into pairing mode and re-pair it from scratch — this resolves the vast majority of stuck connections.",
      },
      {
        issue: "Audio plays from the wrong device (like a car speaker instead of headphones)",
        fix: "Open Control Center and tap the audio output icon to manually select the correct connected Bluetooth device.",
      },
      {
        issue: "A Bluetooth accessory appears in the list but won't connect",
        fix: "Ensure the accessory itself is charged, in range, and not currently connected to another device, since many Bluetooth accessories can only pair to one device at a time.",
      },
      {
        issue: "Bluetooth turns back on by itself after being turned off from Control Center",
        fix: "Control Center's Bluetooth toggle only disconnects temporarily and resets at 5 a.m. or on a location change — turn it off from Settings → Bluetooth instead for it to stay off.",
      },
    ],
    faqs: [
      {
        q: "Why does Bluetooth turn back on automatically after I turn it off?",
        a: "Toggling Bluetooth off from Control Center is a temporary disconnect, by design, so it can still support features like Find My and AirDrop; turn it off in Settings for a persistent off state.",
      },
      {
        q: "Can two people share one pair of AirPods on separate iPhones?",
        a: "AirPods can only actively play audio to one device at a time, though Audio Sharing lets two nearby sets of AirPods listen to the same source from a single iPhone temporarily.",
      },
      {
        q: "Why does my accessory show up as 'Not Connected' even though it's on?",
        a: "It may already be connected to a different device, be out of Bluetooth range, or need its pairing forgotten and redone if the connection has become corrupted.",
      },
    ],
    tipsAndTricks: [
      "Long-press the audio card in Control Center to quickly switch between multiple connected Bluetooth audio devices without opening Settings.",
      "Enable Audio Sharing to temporarily let a second pair of AirPods or Beats headphones listen to the same audio from your iPhone.",
      "Tap the 'i' next to a connected accessory to access device-specific controls, like double-tap actions or noise control settings, that don't appear anywhere else.",
    ],
    relatedSettingIds: ["ios-wifi", "ios-display-brightness", "ios-accessibility"],
  },
  {
    id: "ios-display-brightness",
    title: "Display & Brightness",
    icon: Sun,
    platform: "ios",
    category: "display-sound-notifications",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Adjust Display & Brightness on iPhone",
    description:
      "Display & Brightness settings control screen brightness, True Tone, Dark Mode, text size, and Night Shift for warmer colors in the evening.",
    details: [
      "Auto-Brightness adjusts the screen based on ambient light automatically.",
      "Dark Mode can follow a schedule (sunset to sunrise, or custom hours) or stay on manually.",
      "Night Shift shifts colors warmer at a scheduled time to reduce blue light before bed.",
      "Text size and Bold Text improve readability system-wide.",
    ],
    important:
      "Very low brightness combined with certain accessibility filters can make some content hard to read — check your settings if the screen looks unusually dim or tinted.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/adjust-screen-brightness-color-balance-iph60ba71065/ios",
    afterImageContent: {
      heading: "Customizing Display Settings",
      paragraphs: [
        "Dark Mode changes the whole system's color scheme to a darker palette, and many apps adapt automatically.",
        "Night Shift and True Tone both affect color temperature but work independently of each other.",
        "Display Zoom offers a larger on-screen layout for easier viewing on supported devices.",
      ],
      steps: [
        "Open Settings → Display & Brightness.",
        "Adjust the brightness slider, or toggle Dark Mode / Automatic.",
        "Tap 'Night Shift' or 'True Tone' to configure color settings.",
      ],
    },
    whyItMatters:
      "Display settings directly affect both battery life and eye comfort, since the screen is typically the single largest drain on an iPhone's battery. Dark Mode and Night Shift specifically help reduce eye strain and blue light exposure in the evening, which can affect sleep quality for some users. Text size and Bold Text settings also make a meaningful accessibility difference for anyone who finds default iOS text too small to read comfortably.",
    bestPractices: [
      "Enable Auto-Brightness so the screen adjusts to ambient light automatically instead of manually fighting with the slider all day.",
      "Schedule Dark Mode to switch automatically at sunset and sunrise rather than remembering to toggle it manually.",
      "Set Night Shift to start a couple of hours before your usual bedtime for a gradual, less jarring color shift.",
      "Increase text size gradually through Settings rather than relying on pinch-to-zoom gestures within individual apps.",
    ],
    commonIssues: [
      {
        issue: "Screen looks unusually dim or has a strange tint after adjusting settings",
        fix: "Check that Night Shift or an accessibility color filter isn't accidentally left on, and confirm True Tone is set the way you expect under Display & Brightness.",
      },
      {
        issue: "Auto-Brightness makes the screen too dark in bright sunlight",
        fix: "Manually override the brightness slider temporarily — Auto-Brightness will still learn and adjust its baseline over time based on your manual corrections.",
      },
      {
        issue: "Dark Mode doesn't apply to a particular app even though it's on system-wide",
        fix: "Some apps control their own appearance internally; check that app's own in-app settings for a separate dark theme toggle.",
      },
      {
        issue: "Text size changes in Settings don't affect all apps",
        fix: "Dynamic Type-compatible apps scale with system text size, but some third-party apps use fixed font sizes and require their own in-app font settings.",
      },
    ],
    faqs: [
      {
        q: "Does Dark Mode actually save battery?",
        a: "On iPhones with OLED screens, Dark Mode can meaningfully reduce battery usage since black pixels use little to no power, though the savings vary by how much of the screen is dark in any given app.",
      },
      {
        q: "What's the difference between Night Shift and True Tone?",
        a: "Night Shift shifts the whole display warmer on a schedule you set to reduce blue light in the evening, while True Tone continuously adjusts white balance based on ambient lighting conditions throughout the day, and the two work independently.",
      },
      {
        q: "Will increasing text size make some apps look broken?",
        a: "Occasionally, yes — apps that don't fully support Dynamic Type may truncate or overlap text at very large sizes, which is a limitation of that specific app rather than an iOS setting issue.",
      },
    ],
    tipsAndTricks: [
      "Add a Dark Mode toggle to Control Center for instant switching without opening Settings at all.",
      "Use Display Zoom to get a larger-looking interface across the whole system on supported devices, which is different from just increasing text size.",
      "Long-press the brightness slider in Control Center to reveal Dark Mode, Night Shift, and True Tone toggles in one expanded panel.",
    ],
    relatedSettingIds: ["ios-accessibility", "ios-bluetooth", "ios-privacy-permissions"],
  },
  {
    id: "ios-accessibility",
    title: "Accessibility Settings",
    icon: Accessibility,
    platform: "ios",
    category: "accessibility-language",
    recommended: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Accessibility on iPhone",
    description:
      "Accessibility settings on iPhone include VoiceOver screen reading, Zoom magnification, Voice Control, and many vision, hearing, mobility, and cognitive features.",
    details: [
      "VoiceOver reads the screen aloud and changes touch gestures system-wide.",
      "Zoom lets you magnify all or part of the screen with a simple gesture.",
      "Voice Control lets you navigate and dictate entirely by speaking commands.",
      "Accessibility Shortcut (triple-click the side button) gives one-tap access to your most-used feature.",
    ],
    important:
      "Turning on VoiceOver changes standard tap gestures to selection gestures — review Apple's VoiceOver guide before enabling it for the first time.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/get-started-with-accessibility-features-iph3e2e4367/ios",
    afterImageContent: {
      heading: "Finding the Right Accessibility Feature",
      paragraphs: [
        "Accessibility settings are grouped into Vision, Physical and Motor, Hearing, and General categories.",
        "Most features support the Accessibility Shortcut for quick one-tap or one-click access.",
        "Per-app accessibility settings are also available for some apps that support extra customization.",
      ],
      steps: [
        "Open Settings → Accessibility.",
        "Browse the categories (Vision, Physical and Motor, Hearing, General).",
        "Turn on the feature you need and set up an Accessibility Shortcut if useful.",
      ],
    },
    whyItMatters:
      "Accessibility settings can be the difference between an iPhone being usable or unusable for someone with a vision, hearing, motor, or cognitive difference, but many of these features — like Zoom, Voice Control, and Sound Recognition — are genuinely useful for anyone in the right situation. Because these settings span nearly every part of iOS, this hub consolidates dozens of otherwise scattered options into one place. It's also one of the most frequently overlooked settings screens, meaning many users never discover features that could directly solve a daily frustration they have with their device.",
    bestPractices: [
      "Set up the Accessibility Shortcut (triple-click the side button) for your single most-used feature so you're never digging through menus to turn it on or off.",
      "Try VoiceOver briefly in a low-stakes moment before you actually need it, since it changes standard tap gestures to selection-based gestures system-wide.",
      "Use Zoom's window mode instead of full-screen mode if you only need to magnify part of the screen while keeping the rest at normal size.",
      "Explore Sound Recognition if you're deaf or hard of hearing, since it can alert you to doorbells, alarms, and crying babies via notification.",
    ],
    commonIssues: [
      {
        issue: "VoiceOver was accidentally turned on and normal taps stopped working as expected",
        fix: "Ask Siri to 'turn off VoiceOver', or triple-click the side button if the Accessibility Shortcut was set to VoiceOver, since a single tap now just selects an item rather than activating it.",
      },
      {
        issue: "Zoom gesture (double-tap with two fingers) triggers accidentally during normal use",
        fix: "Turn off Zoom in Settings → Accessibility → Zoom if you don't need it, or practice the exact gesture needed to avoid accidental activation.",
      },
      {
        issue: "Voice Control doesn't recognize commands accurately",
        fix: "Make sure you're in a quiet environment, speak clearly and pause between commands, and try retraining specific custom commands that keep misfiring.",
      },
      {
        issue: "Accessibility Shortcut brings up a menu instead of directly toggling the feature",
        fix: "This happens when more than one feature is assigned to the shortcut — go to Settings → Accessibility → Accessibility Shortcut and select only the single feature you want direct access to.",
      },
    ],
    faqs: [
      {
        q: "Do I need a disability to benefit from Accessibility features?",
        a: "No, many features like Zoom, larger text, Sound Recognition, and Guided Access are broadly useful — for example, Guided Access is popular for locking a phone to one app when handing it to a child.",
      },
      {
        q: "How do I turn off VoiceOver if I enabled it by accident and don't know how to navigate anymore?",
        a: "Ask Siri to 'turn off VoiceOver,' or if configured, triple-click the side button to trigger the Accessibility Shortcut and disable it that way.",
      },
      {
        q: "Can I use different accessibility settings for different apps?",
        a: "Some apps support per-app accessibility customization, but most Accessibility features, like VoiceOver and Zoom, apply system-wide rather than per app.",
      },
    ],
    tipsAndTricks: [
      "Assign more than one feature to the Accessibility Shortcut and it'll present a small menu on triple-click letting you choose which one to toggle.",
      "Use 'Back Tap' (double-tap or triple-tap the back of the iPhone) to trigger shortcuts, screenshots, or accessibility features without touching the screen at all.",
      "Sound Recognition can be trained to alert you specifically to your own smoke alarm, doorbell, or appliance sounds rather than only generic categories.",
    ],
    relatedSettingIds: ["ios-display-brightness", "ios-bluetooth", "ios-screen-time-family"],
  },
  {
    id: "ios-screen-time-family",
    title: "Screen Time & Family",
    icon: Users,
    platform: "ios",
    category: "accounts-sync-family",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Screen Time & Family Sharing",
    description:
      "Screen Time shows how you (or your family) use your devices and lets you set app limits, downtime schedules, and content restrictions — especially useful when set up through Family Sharing for a child's device.",
    details: [
      "Weekly Screen Time reports break down usage by app and category.",
      "App Limits can cap daily time spent in specific apps or categories.",
      "Downtime schedules block distracting apps during set hours, like bedtime.",
      "Content & Privacy Restrictions can limit explicit content, in-app purchases, and privacy setting changes.",
    ],
    important:
      "A Screen Time passcode is required to change these settings once set — store it somewhere you (or a co-parent) can retrieve if forgotten.",
    redirectUrl: "https://support.apple.com/en-us/108806",
    afterImageContent: {
      heading: "Setting Up Screen Time for a Family Member",
      paragraphs: [
        "Family Sharing lets a parent or guardian manage Screen Time remotely for a child's device.",
        "Requests to extend app time can be sent from the child's device and approved right from a parent's iPhone.",
        "Screen Time settings sync across a person's own devices if they're signed in with the same Apple Account.",
      ],
      steps: [
        "Open Settings → Screen Time.",
        "Tap 'Turn On Screen Time', then set it up for yourself or 'For a Family Member'.",
        "Configure Downtime, App Limits, and Content & Privacy Restrictions.",
        "Set a Screen Time passcode to protect these settings.",
      ],
    },
    whyItMatters:
      "Screen Time turns vague worries about phone use into concrete data, showing exactly which apps are consuming the most time for you or a family member, which is the necessary first step before setting any meaningful limit. For families, it's the primary tool for keeping a child's device age-appropriate — blocking explicit content, restricting in-app purchases, and enforcing bedtime downtime without having to police the phone manually. Because settings are protected by a separate passcode, it also prevents a tech-savvy kid from simply disabling their own restrictions.",
    bestPractices: [
      "Set a Screen Time passcode that's different from the device passcode, and store it somewhere retrievable by another trusted adult if managing a child's device.",
      "Review the weekly Screen Time report together with a family member rather than only using it to enforce limits unilaterally.",
      "Use Downtime scheduled around bedtime rather than blocking apps all day, which tends to be more sustainable and less resented.",
      "Set Content & Privacy Restrictions before handing a device to a child for the first time, rather than retrofitting them after problematic content is already accessible.",
    ],
    commonIssues: [
      {
        issue: "Forgot the Screen Time passcode and can't change any restrictions",
        fix: "Use 'Forgot Passcode?' in Screen Time settings to reset it via Face ID/Touch ID and your Apple Account password, or a parent can reset a linked child's Screen Time passcode from their own device via Family Sharing.",
      },
      {
        issue: "App Limits don't seem to actually block the app once time is up",
        fix: "Confirm 'Block at End of Limit' is enabled rather than just 'Remind Me', since the default reminder-only mode doesn't enforce a hard stop.",
      },
      {
        issue: "A request to extend app time from a child's device never arrives on the parent's phone",
        fix: "Confirm Family Sharing is set up correctly and both devices are signed in to iCloud, since extension requests route through the Family Sharing organizer.",
      },
      {
        issue: "Screen Time reports look inaccurate or show usage on a device you don't recognize",
        fix: "Check that Screen Time isn't combining data across all your own devices signed into the same Apple Account under 'Share Across Devices'.",
      },
    ],
    faqs: [
      {
        q: "Can my child bypass Screen Time restrictions by deleting and reinstalling an app?",
        a: "No, App Limits and Content & Privacy Restrictions are tied to the device and Apple Account settings, not the individual app install, so reinstalling doesn't remove the restriction.",
      },
      {
        q: "What's the difference between App Limits and Downtime?",
        a: "App Limits cap total daily time in specific apps or categories regardless of when they're used, while Downtime blocks broad categories of apps during specific scheduled hours, like overnight.",
      },
      {
        q: "Can I see Screen Time reports for my whole family in one place?",
        a: "Yes, if Family Sharing is set up, the Screen Time app shows a combined view where you can tap into each family member's individual usage and settings.",
      },
    ],
    tipsAndTricks: [
      "Allow 'Always Allowed' apps (like Phone or Messages) to stay accessible even during Downtime, so essential communication isn't blocked.",
      "Use per-category rather than per-app limits (like 'Games' as a whole) to avoid having to configure dozens of individual app limits separately.",
      "Check 'Communication Limits' to control which contacts a child can call or message during Downtime hours, independent of app blocking.",
    ],
    relatedSettingIds: ["ios-privacy-permissions", "ios-accessibility", "ios-face-id-passcode"],
    updateFrequency:
      "Review the weekly Screen Time report every Sunday when it refreshes, and revisit limits whenever a family member's routine or school schedule changes.",
  },
  {
    id: "ios-reset-iphone",
    title: "Reset iPhone",
    icon: RotateCcw,
    platform: "ios",
    category: "troubleshooting-diagnostics",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Reset or Erase Your iPhone",
    description:
      "Reset options let you fix persistent software issues by resetting specific settings (like network or keyboard dictionary) or fully erase the device back to factory defaults.",
    details: [
      "Reset options include Network Settings, Keyboard Dictionary, Home Screen Layout, and full Erase All Content and Settings.",
      "Erasing removes your Apple Account from the device and wipes all personal data.",
      "Back up with iCloud or a computer before erasing if you want to keep your data.",
      "Find My must be turned off before some trade-in or transfer processes will work correctly.",
    ],
    important:
      "This action cannot be undone. Confirm you have a current backup and your Apple Account credentials ready before erasing.",
    redirectUrl: "https://support.apple.com/en-us/108931",
    afterImageContent: {
      heading: "Choosing the Right Reset",
      paragraphs: [
        "A smaller reset (like Network Settings) fixes specific issues without erasing personal data.",
        "Erase All Content and Settings is the option to use before selling, trading in, or giving away your iPhone.",
        "After erasing, the device restarts into the initial Setup Assistant as if it were new.",
      ],
      steps: [
        "Open Settings → General → Transfer or Reset iPhone.",
        "Choose a specific reset, or 'Erase All Content and Settings' for a full wipe.",
        "Confirm your Apple Account and passcode when prompted.",
        "Wait for your device to restart and complete the process.",
      ],
    },
    whyItMatters:
      "Reset options are often the fastest fix for stubborn software glitches — like broken Wi-Fi behavior or a misbehaving keyboard — without requiring a full factory wipe. At the other end of the spectrum, Erase All Content and Settings is the critical last step before selling, trading in, or giving away an iPhone, since it removes your Apple Account and personal data permanently. Understanding the difference between these reset levels prevents both under-reacting to a fixable glitch and over-reacting by wiping a device unnecessarily.",
    bestPractices: [
      "Try a targeted reset (like Network Settings) before jumping straight to a full erase, since most everyday glitches don't require losing all your data.",
      "Confirm you have a current iCloud or computer backup before erasing, and verify it by checking the backup date in Settings first.",
      "Turn off Find My iPhone before initiating a reset connected to trade-in or transfer, since Activation Lock can otherwise block the new owner's setup.",
      "Sign out of your Apple Account only as the final step right before erasing, not earlier, so you don't lose access to Find My protection prematurely.",
    ],
    commonIssues: [
      {
        issue: "Erase All Content and Settings fails partway through or gets stuck",
        fix: "Ensure the device has sufficient battery or is plugged in, then retry; if it remains stuck, connect to a computer and use Finder or iTunes to restore the device instead.",
      },
      {
        issue: "A reset device still shows the previous owner's Apple Account (Activation Lock)",
        fix: "The previous owner needs to remove the device from their Apple Account via Find My or iCloud.com before Activation Lock can be cleared on the new owner's setup.",
      },
      {
        issue: "Reset Network Settings disconnects all saved Wi-Fi passwords and Bluetooth pairings",
        fix: "This is expected — Reset Network Settings clears all saved networks and paired Bluetooth devices, so be prepared to re-enter Wi-Fi passwords and re-pair accessories afterward.",
      },
      {
        issue: "Forgot to back up before erasing and now data seems lost",
        fix: "Check for an existing recent iCloud backup, since automatic backups may have already captured most of your data even without a manual trigger beforehand.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Reset Network Settings and a full erase?",
        a: "Reset Network Settings only clears Wi-Fi passwords, cellular settings, and Bluetooth pairings while keeping all your apps, photos, and personal data intact, whereas a full erase wipes everything on the device back to factory defaults.",
      },
      {
        q: "Do I need to remove my SIM card before erasing my iPhone?",
        a: "It's not required for the erase process itself, but it's a good practical step if you're giving away or trading in the device, so you keep your SIM and phone number.",
      },
      {
        q: "Will erasing my iPhone remove it from Find My automatically?",
        a: "Yes, if you're signed in when you erase, the process automatically signs out of your Apple Account and removes the device from Find My and Activation Lock as part of the standard erase flow.",
      },
    ],
    tipsAndTricks: [
      "Use 'Reset Keyboard Dictionary' specifically if autocorrect keeps suggesting strange or incorrect words it seems to have 'learned' — it clears learned words without touching anything else.",
      "Erase via Settings rather than a computer if possible, since the on-device process automatically handles Activation Lock removal cleanly when you're signed in.",
      "If preparing a device for trade-in, use Apple's own Trade In flow, which prompts you through backup, sign-out, and erase steps in the correct order automatically.",
    ],
    relatedSettingIds: ["ios-icloud-backup", "ios-face-id-passcode", "ios-iphone-storage"],
  },
  {
    id: "ios-notifications",
    title: "Notifications",
    icon: Bell,
    platform: "ios",
    category: "display-sound-notifications",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Notifications on iPhone",
    description:
      "Notification settings let you control exactly how each app alerts you — as a banner, a sound, a badge, or grouped into a scheduled summary — so your Lock Screen and Notification Center reflect what actually deserves your attention.",
    details: [
      "Each app has its own notification style: Banners (temporary or persistent), Sounds, and Badges.",
      "Scheduled Summary bundles non-urgent notifications from chosen apps into one or more delivery times you set.",
      "Lock Screen visibility can be set to Always, When Unlocked Only, or Never per app.",
      "Time Sensitive notifications can bypass a scheduled summary or Focus so urgent alerts still arrive immediately.",
    ],
    important:
      "Government and public safety alerts (like AMBER and Emergency Alerts) cannot be turned off from this screen, by design.",
    redirectUrl: "https://support.apple.com/en-us/HT201925",
    afterImageContent: {
      heading: "How Notifications Work on iPhone",
      paragraphs: [
        "iOS lets you configure notification behavior individually for every installed app rather than applying one global rule.",
        "Notifications can be grouped automatically by app, grouped manually, or shown as individual alerts in the order received.",
        "Scheduled Summary uses on-device intelligence to rank included notifications so the most relevant ones appear near the top.",
      ],
      steps: [
        "Open Settings → Notifications.",
        "Tap an app to customize its Banners, Sounds, Badges, and Lock Screen visibility.",
        "Tap 'Scheduled Summary' to add apps and choose delivery times for bundled, less urgent alerts.",
        "Turn off 'Allow Notifications' entirely for apps you never want to hear from.",
      ],
    },
    whyItMatters:
      "Unmanaged notifications are one of the biggest sources of daily phone distraction, and the difference between a calm Lock Screen and a chaotic one usually comes down to a handful of overly chatty apps. Because each app is configured separately, this screen lets you keep truly important alerts (like messages from people, or delivery updates) immediate while pushing everything else into a scheduled summary instead of an endless stream of interruptions. Getting this right also affects battery life indirectly, since constant notification banners keep waking the screen throughout the day.",
    bestPractices: [
      "Move noisy, non-urgent apps (games, promotional notifications, social media) into Scheduled Summary instead of turning notifications off entirely.",
      "Set Lock Screen visibility to 'When Unlocked Only' for sensitive apps like banking or messaging if you share a room or workspace with others.",
      "Turn off Badges for apps whose unread counts don't reflect anything actionable, like News or a shopping app.",
      "Review notification settings right after installing a new app, since many request an all-or-nothing style by default that's rarely what you actually want.",
      "Reserve 'Persistent' banners only for genuinely important apps, since they require manual dismissal and can pile up if overused.",
    ],
    commonIssues: [
      {
        issue: "An important app's notifications aren't appearing at all",
        fix: "Check Settings → Notifications → [App] to confirm 'Allow Notifications' is on, and that it isn't set to Scheduled Summary only when you need it immediately.",
      },
      {
        issue: "Notifications from one app get silently included in the Scheduled Summary instead of arriving right away",
        fix: "Remove that specific app from the Scheduled Summary list, or mark its notifications as Time Sensitive from within the app if it supports that option.",
      },
      {
        issue: "Too many notifications appear on the Lock Screen even with a passcode set",
        fix: "Set individual apps' Lock Screen visibility to 'When Unlocked Only' rather than relying on a single device-wide privacy setting.",
      },
      {
        issue: "Notification sounds don't match what was chosen in Settings",
        fix: "Some apps use their own in-app sound settings that override the system default — check that app's internal notification preferences as well.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between a Banner and Scheduled Summary?",
        a: "A Banner appears immediately when a notification arrives, while Scheduled Summary holds less urgent notifications from chosen apps and delivers them together at set times you choose, like morning and evening.",
      },
      {
        q: "Can I stop all notifications from an app without deleting it?",
        a: "Yes, turn off 'Allow Notifications' for that app in Settings → Notifications, which silences it completely while keeping the app installed and usable.",
      },
      {
        q: "Do Scheduled Summary notifications still make a sound when they arrive?",
        a: "No, summary notifications are delivered silently as a bundled group at your scheduled time rather than triggering individual sounds or banners.",
      },
    ],
    tipsAndTricks: [
      "Long-press any notification on the Lock Screen or in Notification Center to reveal quick options like muting that app for an hour or a day.",
      "Use 'Notification Grouping' set to 'By App' if you get a lot of alerts from a single chatty app and want them collapsed into one stack.",
    ],
    relatedSettingIds: ["ios-focus", "ios-sounds-haptics", "ios-screen-time-family"],
  },
  {
    id: "ios-sounds-haptics",
    title: "Sounds & Haptics",
    icon: Volume2,
    platform: "ios",
    category: "display-sound-notifications",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Sounds and Haptics on iPhone",
    description:
      "Sounds & Haptics controls ringtone and alert tones, ringer and alert volume, and the tactile vibration feedback (haptics) your iPhone provides for calls, texts, and everyday interactions like typing.",
    details: [
      "Separate tones can be assigned for Ringtone, Text Tone, and other alerts like Mail or Calendar.",
      "The Ringer and Alerts volume slider can be locked, or left adjustable using the physical volume buttons.",
      "System Haptics adds tactile feedback to keyboard taps, toggles, and other interface controls.",
      "Newer iPhones with the Action Button can map a quick press to instantly toggle Silent Mode instead of using a physical switch.",
    ],
    important:
      "Turning off 'Change with Buttons' locks ringer volume to the on-screen slider, so the physical volume buttons will only affect media volume, not calls or alerts.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/change-sounds-and-vibrations-iph07c867f28/ios",
    afterImageContent: {
      heading: "Setting Up Ringtones, Volume, and Haptics",
      paragraphs: [
        "Each alert type (Ringtone, Text Tone, Mail, Calendar, and more) has its own tone and vibration pattern.",
        "You can assign a custom ringtone or vibration pattern to a specific contact so you recognize who's calling without looking.",
        "System Haptics is separate from ringer volume and can be left on even when the phone is silenced.",
      ],
      steps: [
        "Open Settings → Sounds & Haptics.",
        "Drag the Ringer and Alerts slider, or toggle 'Change with Buttons' to use the physical volume buttons instead.",
        "Tap 'Ringtone' or another alert type to choose a sound and vibration pattern.",
        "Toggle 'System Haptics' on or off for tactile feedback throughout iOS.",
      ],
    },
    whyItMatters:
      "The right sound and haptic setup is what lets you tell, without even looking at the phone, whether it's a call, a text, or just a keyboard tap — and getting it wrong means either missing important calls in a noisy environment or being startled by a loud tone in a quiet one. Custom ringtones and vibration patterns per contact are also a practical way to know who's calling before you glance at the screen. Haptics specifically make everyday typing and interface interactions feel more responsive, which is why some people notice their phone feels 'off' after disabling System Haptics without realizing why.",
    bestPractices: [
      "Assign a distinct ringtone or vibration pattern to your most important contacts so you can identify them by feel or sound alone.",
      "Turn off 'Change with Buttons' if you've ever accidentally silenced an important call by pressing the volume buttons in your pocket.",
      "Keep System Haptics on if you rely on tactile confirmation while typing, especially with Haptic Touch interactions elsewhere in iOS.",
      "Lower Ringtone and Text Tone volume independently from media volume if you find yourself constantly adjusting one after watching a video.",
    ],
    commonIssues: [
      {
        issue: "Phone rings much louder or quieter than expected after using the volume buttons during a video",
        fix: "Turn off 'Change with Buttons' under Settings → Sounds & Haptics so media volume and ringer volume are controlled independently.",
      },
      {
        issue: "A custom contact ringtone doesn't play — the default tone plays instead",
        fix: "Confirm the custom tone was properly synced or purchased and is still assigned in the Contacts app entry for that person, since a removed tone silently reverts to default.",
      },
      {
        issue: "Keyboard and toggle switches no longer vibrate when tapped",
        fix: "Check that 'System Haptics' is turned on in Settings → Sounds & Haptics, since it's a single toggle controlling tactile feedback system-wide.",
      },
      {
        issue: "Ringtone plays but there's no vibration, or vice versa",
        fix: "Open the specific Ringtone or Text Tone screen and check that a vibration pattern (not 'None') is selected alongside the chosen sound.",
      },
    ],
    faqs: [
      {
        q: "Can I use my own song as a ringtone?",
        a: "Yes, you can create a ringtone from a song using GarageBand or a third-party tool and sync it to your iPhone, then select it under Settings → Sounds & Haptics → Ringtone.",
      },
      {
        q: "Does turning off System Haptics affect Taptic feedback in games and apps?",
        a: "It mainly affects system-level interface feedback; many third-party apps and games implement their own separate haptic effects that aren't controlled by this single toggle.",
      },
      {
        q: "Why does my phone vibrate even though it's on silent?",
        a: "The silent switch (or Action Button) only mutes ringer and alert sounds; vibration for calls and notifications continues unless you also turn off vibration patterns for those alert types individually.",
      },
    ],
    tipsAndTricks: [
      "Assign a unique vibration pattern (not just sound) to your top contacts so you can identify callers even with the phone face-down and silenced.",
      "Use 'Create New Vibration' under any alert type's vibration menu to tap out a completely custom pattern with your finger.",
    ],
    relatedSettingIds: ["ios-notifications", "ios-display-brightness", "ios-focus"],
  },
  {
    id: "ios-focus",
    title: "Focus",
    icon: Moon,
    platform: "ios",
    category: "display-sound-notifications",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Focus Modes on iPhone",
    description:
      "Focus lets you silence distracting notifications based on what you're doing — like Work, Sleep, or Personal time — while still allowing calls and alerts from specific people or apps you choose to come through.",
    details: [
      "Built-in Focus options include Do Not Disturb, Personal, Work, Sleep, and Driving, plus fully custom Focus modes.",
      "Allowed People and Apps let specific contacts or apps bypass a Focus so their notifications still arrive.",
      "Focus Filters can limit what's shown in supported apps, like hiding non-work calendar events or muting certain Mail accounts.",
      "Share Across Devices syncs your active Focus to other Apple devices signed into the same Apple Account.",
    ],
    important:
      "A Focus can be scheduled to turn on automatically by time, location, or a specific app opening, which can silence notifications without you realizing it's active — check the status bar icon if alerts seem to be missing.",
    redirectUrl: "https://support.apple.com/en-us/HT212608",
    afterImageContent: {
      heading: "Building and Automating a Focus",
      paragraphs: [
        "Each Focus mode has its own separate list of allowed people, apps, and Focus Filters.",
        "Smart Activation can suggest turning a Focus on automatically based on your habits and current context.",
        "When a Focus is on, Messages can let others know your notifications are silenced if they try to reach you.",
      ],
      steps: [
        "Open Settings → Focus.",
        "Select an existing Focus (like Sleep or Work) or tap the '+' to create a custom one.",
        "Add People and Apps allowed to notify you during that Focus.",
        "Set a schedule or automation so the Focus turns on and off automatically.",
      ],
    },
    whyItMatters:
      "Focus is what makes it possible to actually disconnect during sleep or deep work without missing something genuinely urgent, since it separates 'important enough to interrupt me' from 'can wait until later' on a per-person and per-app basis rather than an all-or-nothing silence toggle. Because different Focus modes can carry entirely different allow lists, it also means your phone can behave differently depending on context — quiet during a meeting, but still letting a family member's call through during Sleep. Automations tied to time, location, or app also mean this protection can happen consistently without you remembering to turn it on manually every time.",
    bestPractices: [
      "Set up separate allow lists for Work and Personal Focus modes rather than reusing the same list, since who's urgent during work hours often isn't the same as after.",
      "Schedule Sleep Focus to start automatically before your usual bedtime instead of relying on remembering to turn it on manually.",
      "Use Focus Filters to hide work calendar events and Mail accounts during Personal time, reducing the temptation to check work messages off the clock.",
      "Enable 'Share Across Devices' so your Mac and iPad also respect your active iPhone Focus instead of continuing to ring or notify separately.",
      "Add close family members to your Sleep Focus allow list so a genuine emergency call can still reach you overnight.",
    ],
    commonIssues: [
      {
        issue: "Notifications you expect aren't arriving and you're not sure why",
        fix: "Check the status bar or Settings → Focus for an active Focus mode, since scheduled or location-based automations can turn one on without an obvious prompt.",
      },
      {
        issue: "An important contact's calls are being silenced during Sleep or Work Focus",
        fix: "Add that person to the specific Focus's 'People' allow list, or enable 'Allow Calls From' repeat callers so a second call within three minutes always breaks through.",
      },
      {
        issue: "A Focus schedule doesn't turn off automatically at the expected time",
        fix: "Check for a second overlapping automation (like a location-based trigger) that may be keeping the Focus active past its scheduled end time.",
      },
      {
        issue: "Someone messages you and doesn't realize your notifications are silenced",
        fix: "This is expected unless they're using Messages and you've allowed status sharing — iOS can show a 'Notifications are silenced' indicator to senders when Focus is on and shared.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Do Not Disturb and other Focus modes?",
        a: "Do Not Disturb is one specific built-in Focus, while iOS also supports multiple named Focus modes (like Work, Personal, or Sleep) that each have their own independent allow lists and can be automated separately.",
      },
      {
        q: "Will people know I have Focus turned on?",
        a: "Only if they message you through Messages and you've enabled status sharing — supported apps can then show that your notifications are silenced, though calls and other apps don't disclose this by default.",
      },
      {
        q: "Can I let a specific app always notify me no matter which Focus is active?",
        a: "Yes, adding an app to a Focus's allow list lets its notifications come through during that Focus, and you can repeat this across every Focus mode where you want that app to stay unrestricted.",
      },
    ],
    tipsAndTricks: [
      "Long-press the Focus icon in Control Center for a quick menu to turn any Focus on for a set duration, like 'For 1 hour' or 'Until I leave this location'.",
      "Use a custom Home Screen page tied to a Focus so only relevant apps are visible while that Focus is active, reducing visual temptation to check unrelated apps.",
    ],
    relatedSettingIds: ["ios-notifications", "ios-screen-time-family", "ios-sounds-haptics"],
  },
  {
    id: "ios-battery",
    title: "Battery",
    icon: Battery,
    platform: "ios",
    category: "system-updates",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Check Battery Health and Usage on iPhone",
    description:
      "The Battery screen shows your battery's current health and charging behavior, breaks down which apps used the most power recently, and includes Low Power Mode for stretching a low charge further.",
    details: [
      "Battery Health & Charging shows Maximum Capacity and whether Peak Performance Capability is currently limited.",
      "Optimized Battery Charging learns your daily routine and delays charging past 80% until closer to when you'll unplug.",
      "Battery usage by app is available for both the last 24 hours and the last 10 days, broken down by screen-on and background time.",
      "Low Power Mode reduces background activity, some visual effects, and mail fetch to extend remaining charge for the rest of the day.",
    ],
    important:
      "All rechargeable lithium-ion batteries chemically age over time — a declining Maximum Capacity percentage is normal wear, not necessarily a defect, though very low capacity may warrant a battery service.",
    redirectUrl: "https://support.apple.com/en-us/101575",
    afterImageContent: {
      heading: "Understanding the Battery Screen",
      paragraphs: [
        "Maximum Capacity compares your battery's current full charge to its capacity when new, as a percentage.",
        "iOS may temporarily manage peak performance to prevent unexpected shutdowns if an aged battery can't deliver enough instantaneous power.",
        "The app usage chart identifies exactly which apps drained the most battery recently, split between active use and background activity.",
      ],
      steps: [
        "Open Settings → Battery.",
        "Review the usage chart for the last 24 hours or last 10 days.",
        "Tap 'Battery Health & Charging' to see Maximum Capacity and Optimized Charging status.",
        "Toggle Low Power Mode directly from this screen or from Control Center when you need to stretch a low charge.",
      ],
    },
    whyItMatters:
      "The Battery screen turns 'my phone doesn't last as long as it used to' into a measurable fact by showing Maximum Capacity, which naturally declines through normal chemical aging and directly explains shorter battery life on older devices. The per-app usage breakdown is also one of the fastest ways to diagnose a phone that's draining unusually fast, since a single misbehaving app in the background is a common and fixable culprit. Low Power Mode, meanwhile, is a genuinely useful safety net for getting through the rest of a day on a device that's about to die, without needing to find a charger immediately.",
    bestPractices: [
      "Enable Optimized Battery Charging so your iPhone avoids sitting at 100% charge overnight, which reduces long-term battery wear.",
      "Check the 10-day usage view periodically to catch an app quietly consuming excessive background battery before it becomes a daily annoyance.",
      "Use Low Power Mode proactively when you know you'll be away from a charger for a while, rather than waiting until the battery is critically low.",
      "Avoid extreme heat exposure (like a hot car dashboard), since high temperatures accelerate battery chemical aging more than normal charging cycles do.",
      "Consider a battery service if Maximum Capacity drops well below 80% and you're noticing real day-to-day performance or longevity issues.",
    ],
    commonIssues: [
      {
        issue: "Battery drains noticeably faster than it used to after an iOS update",
        fix: "Give the device a day or two after an update for background indexing to finish, then check Settings → Battery for a specific app using unusually high background power.",
      },
      {
        issue: "Maximum Capacity shows a low percentage and the phone shuts down unexpectedly at low charge",
        fix: "Check whether Peak Performance Capability shows a note about performance management, and consider a battery replacement if the device is out of typical battery health range.",
      },
      {
        issue: "iPhone won't charge past 80% overnight even with Optimized Battery Charging off",
        fix: "Check for a separate Charge Limit setting (on supported models) that may be capping charging independently of Optimized Battery Charging.",
      },
      {
        issue: "Low Power Mode keeps turning itself off after a restart",
        fix: "This is expected — Low Power Mode automatically disables once the battery charges above 80%, and doesn't stay on permanently across charge cycles by design.",
      },
    ],
    faqs: [
      {
        q: "Is it bad for my battery to charge my iPhone overnight?",
        a: "No, Optimized Battery Charging is designed specifically for this — it delays finishing the charge past 80% until shortly before you typically unplug, reducing the time spent at a full charge.",
      },
      {
        q: "Does using Low Power Mode all the time damage my battery?",
        a: "No, Low Power Mode simply reduces power-hungry background activity and doesn't harm the battery; it's safe to leave on indefinitely if you prefer the extended battery life over slightly reduced background performance.",
      },
      {
        q: "What Maximum Capacity percentage means I should replace my battery?",
        a: "Apple doesn't publish one universal cutoff, but many users consider a battery service once capacity falls significantly below 80%, especially if it's paired with noticeable shutdowns or rapid drain.",
      },
    ],
    tipsAndTricks: [
      "Tap the clock icon next to the battery usage chart to switch between 'Last 24 Hours' (hourly detail) and 'Last 10 Days' (daily trend) views.",
      "Add the Low Power Mode toggle to Control Center for one-tap access without opening Settings when your charge is running low.",
    ],
    relatedSettingIds: ["ios-display-brightness", "ios-software-update", "ios-iphone-storage"],
  },
  {
    id: "ios-general-about",
    title: "General & About",
    icon: Info,
    platform: "ios",
    category: "system-info",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "View Device Information on iPhone",
    description:
      "The About screen lists identifying and technical details about your iPhone — name, iOS version, model and serial numbers, storage capacity, and carrier information — that support staff and other apps often need.",
    details: [
      "Device Name is used for AirDrop, Personal Hotspot, and Handoff, and can be renamed at any time.",
      "Model Number, Serial Number, and IMEI/MEID are all listed for warranty, carrier, or support purposes.",
      "Available storage capacity is shown alongside the total, distinct from the more detailed iPhone Storage breakdown.",
      "Legal and regulatory information, along with diagnostic data-sharing preferences, are accessible from this same screen.",
    ],
    important:
      "Never share your Serial Number or IMEI publicly online, since it can be used in scam attempts to falsely report a device as lost or stolen.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/get-information-about-your-iphone-iph3dd5fc7e/ios",
    afterImageContent: {
      heading: "Finding Your Device's Details",
      paragraphs: [
        "The About screen consolidates identifiers that Apple Support, carriers, and third-party services commonly ask for.",
        "Renaming your device here updates how it appears to nearby devices for sharing features like AirDrop.",
        "Diagnostics & Usage settings, found from the same General section, control whether crash data is shared with Apple and app developers.",
      ],
      steps: [
        "Open Settings → General → About.",
        "Scroll to find Model Number, Serial Number, or IMEI as needed.",
        "Tap 'Name' at the top to rename the device for AirDrop and Personal Hotspot.",
      ],
    },
    whyItMatters:
      "The About screen is the fastest way to get exact, verifiable facts about your iPhone — its precise model, iOS version, and unique identifiers — which support calls, warranty claims, carrier transfers, and insurance claims all typically require. Because the device name shown here is what appears to others during AirDrop or Personal Hotspot, an unclear or default name (like 'iPhone') can make it harder to identify your device among several nearby. It's also the quickest place to confirm exactly which iOS version and model you're running before troubleshooting a problem or checking compatibility with a new accessory or app.",
    bestPractices: [
      "Rename your device to something recognizable but not overly personal (avoiding your full name) so it's identifiable during AirDrop without oversharing identity details in public places.",
      "Note down your Serial Number and Model Number somewhere safe before selling, trading in, or sending your device for repair.",
      "Check the exact iOS version here before searching for troubleshooting steps online, since instructions can differ meaningfully between versions.",
      "Review Diagnostics & Usage sharing preferences periodically if you have specific concerns about sharing crash and analytics data.",
    ],
    commonIssues: [
      {
        issue: "Carrier or support staff ask for information you can't immediately find",
        fix: "Open Settings → General → About and scroll through — Model Number, Serial Number, IMEI, and carrier details are all listed together on this one screen.",
      },
      {
        issue: "iPhone shows an unfamiliar or default name to nearby AirDrop users",
        fix: "Tap 'Name' at the top of the About screen and set a clear, recognizable device name.",
      },
      {
        issue: "Unsure which exact iPhone model you own when buying a case or screen protector",
        fix: "Check the Model Number in About and cross-reference it against Apple's published model identifier list to confirm the exact device.",
      },
      {
        issue: "Storage shown in About doesn't match what's listed under iPhone Storage",
        fix: "This is expected — About shows total device capacity, while iPhone Storage reflects usable space after system reserves, so the two numbers won't match exactly.",
      },
    ],
    faqs: [
      {
        q: "Where do I find my iPhone's serial number without the physical device?",
        a: "If you can't access the device, the serial number is often available in Finder or iTunes if it's ever been connected to a computer, on the original packaging, or in your Apple Account's device list.",
      },
      {
        q: "Does renaming my iPhone affect my Apple Account or iCloud settings?",
        a: "No, the device name only affects how it appears locally for features like AirDrop, Personal Hotspot, and Bluetooth pairing, and has no effect on your Apple Account itself.",
      },
      {
        q: "Is it safe to share my iPhone's Model Number with a repair shop?",
        a: "Yes, the Model Number alone is not sensitive, unlike the Serial Number or IMEI, which should be shared only with trusted parties like Apple Support or your carrier.",
      },
    ],
    tipsAndTricks: [
      "Tap the Model Number line to briefly reveal the raw model identifier code (like 'iPhone15,2'), which can help confirm compatibility with certain accessories or older manuals.",
      "Copy the Serial Number directly from the About screen with a long-press instead of retyping it manually when filling out a support or warranty form.",
    ],
    relatedSettingIds: ["ios-software-update", "ios-iphone-storage", "ios-reset-iphone"],
  },
  {
    id: "ios-control-center",
    title: "Control Center",
    icon: SlidersHorizontal,
    platform: "ios",
    category: "personalization",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Control Center on iPhone",
    description:
      "Control Center gives you one-swipe access to frequently used toggles and shortcuts — Wi-Fi, Bluetooth, brightness, Flashlight, and more — and can be fully customized with the specific controls you personally rely on.",
    details: [
      "Controls can be added, removed, and reordered from Settings, including third-party app controls that support it.",
      "Long-pressing (or 3D Touch/Haptic Touch on) many controls reveals an expanded set of related options.",
      "Access from the Lock Screen and Access Within Apps can each be toggled on or off separately for security.",
      "Control Center can span multiple pages, letting you swipe sideways between different groups of controls.",
    ],
    important:
      "Turning off 'Access on Lock Screen' improves security if you lend your phone out or worry about physical access, but also means you'll need to unlock the device for quick toggles like Flashlight.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/use-and-customize-control-center-iph59095ec58/ios",
    afterImageContent: {
      heading: "Adding and Rearranging Controls",
      paragraphs: [
        "The customization screen lists all available controls, separating ones already included from ones you can add.",
        "Reordering controls is done by dragging the grip handle next to each item in the customization list.",
        "Some controls, like Camera or Timer, support press-and-hold for extra shortcuts (like jumping straight to selfie mode).",
      ],
      steps: [
        "Open Settings → Control Center.",
        "Tap the green '+' next to any control to add it, or the red '−' to remove one.",
        "Drag the grip icon on the right to reorder your included controls.",
      ],
    },
    whyItMatters:
      "Control Center is the fastest path to the settings you touch constantly throughout the day, and a customized layout can shave real time off tasks like turning on the flashlight, starting a screen recording, or toggling Airplane Mode before a flight. Because it's reachable from almost anywhere in iOS with a single swipe, what you choose to include here effectively becomes your personal shortcut bar for the whole operating system. Getting the Lock Screen access setting right also matters for security, since some controls could otherwise be triggered by anyone holding a locked phone.",
    bestPractices: [
      "Add controls for features you use daily (like Screen Recording, Low Power Mode, or Notes) rather than leaving only the small default set.",
      "Order your most-used controls near the top-left, since that's typically the fastest area to reach with one hand.",
      "Turn off Lock Screen access for sensitive controls if you frequently hand your phone to others, like children, without unlocking it first.",
      "Long-press seemingly simple controls like Wi-Fi or the Camera icon to discover expanded options you might not know exist, like quick network switching.",
    ],
    commonIssues: [
      {
        issue: "A control you added from Control Center settings doesn't actually appear when swiping down",
        fix: "Confirm you're swiping from the correct corner for your device (top-right on Face ID models, up from the bottom on Touch ID models), since Control Center's gesture location differs by model.",
      },
      {
        issue: "Control Center won't open from the Lock Screen anymore",
        fix: "Check Settings → Face ID & Passcode (or Touch ID & Passcode) → 'Control Center' under Allow Access When Locked, since this can be disabled separately from the main Control Center settings.",
      },
      {
        issue: "Too many controls make Control Center feel cluttered across multiple pages",
        fix: "Remove rarely used controls from Settings → Control Center so your most important toggles fit on the first page.",
      },
      {
        issue: "A third-party app's control doesn't show up in the customization list",
        fix: "Confirm the app has been opened at least once and supports Control Center integration, since not all apps offer a control to add.",
      },
    ],
    faqs: [
      {
        q: "Can I add third-party app controls to Control Center?",
        a: "Yes, apps that support Control Center integration appear in the 'More Controls' list in Settings → Control Center and can be added just like Apple's built-in controls.",
      },
      {
        q: "Why does Control Center open from a different gesture on my iPhone than on a friend's?",
        a: "Face ID iPhones open Control Center with a swipe down from the top-right corner, while older Touch ID iPhones use a swipe up from the bottom edge instead.",
      },
      {
        q: "Is it safe to leave all controls accessible from the Lock Screen?",
        a: "Most controls are low-risk, but a few (like enabling a hotspot or accessing Wallet) could be considered sensitive — disable Lock Screen access entirely if you're concerned about someone using your phone while it's locked.",
      },
    ],
    tipsAndTricks: [
      "Press and hold the brightness or volume sliders in Control Center to reveal additional toggles like Dark Mode, Night Shift, or True Tone in one expanded panel.",
      "Swipe left within Control Center to reach a second page if you've added more controls than fit on the first screen.",
    ],
    relatedSettingIds: ["ios-display-brightness", "ios-bluetooth", "ios-wifi"],
  },
  {
    id: "ios-home-screen-app-library",
    title: "Home Screen & App Library",
    icon: LayoutGrid,
    platform: "ios",
    category: "personalization",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Organize the Home Screen and App Library on iPhone",
    description:
      "Home Screen settings control how new apps are added and how your app pages are arranged, while App Library automatically sorts every installed app into categorized folders you can browse or search without needing a tidy Home Screen at all.",
    details: [
      "App Library is reached by swiping left past your last Home Screen page and groups apps automatically by category.",
      "New apps can be set to install on the Home Screen and App Library, or App Library Only to keep the Home Screen minimal.",
      "Entire Home Screen pages can be hidden (not deleted) from the page-dot editor without removing the apps themselves.",
      "App Library includes a 'Suggestions' folder that surfaces apps based on time of day and usage patterns, plus a 'Recently Added' folder.",
    ],
    important:
      "Hiding a Home Screen page doesn't uninstall its apps — they remain reachable through App Library or Spotlight search even while the page is hidden.",
    redirectUrl: "https://support.apple.com/en-us/108324",
    afterImageContent: {
      heading: "Choosing How Apps Appear",
      paragraphs: [
        "App Library sorts apps into automatically generated categories like Social, Utilities, and Creativity.",
        "The 'Newly Downloaded Apps' setting determines whether future app installs clutter the Home Screen or stay tucked in App Library.",
        "Individual Home Screen pages can be shown or hidden independently from the multi-page dot indicator.",
      ],
      steps: [
        "Touch and hold an empty area of the Home Screen to enter jiggle mode.",
        "Tap the page dots at the bottom to show or hide specific Home Screen pages.",
        "Open Settings → Home Screen to choose whether new apps install to the Home Screen or App Library Only.",
        "Swipe left past your last page to browse or search App Library directly.",
      ],
    },
    whyItMatters:
      "App Library solves the long-standing problem of a Home Screen overwhelmed with dozens of rarely used app icons, by automatically categorizing every installed app so nothing is ever truly lost even if it's not pinned anywhere visible. Setting new downloads to 'App Library Only' keeps a curated, deliberate Home Screen intact instead of every new install landing wherever there's free space. This combination gives you real control over how much visual clutter your phone shows daily, without sacrificing quick access to any app when you actually need it.",
    bestPractices: [
      "Set new app downloads to 'App Library Only' if you want your Home Screen to stay limited to a small, deliberately chosen set of apps.",
      "Hide Home Screen pages you rarely look at instead of leaving them visible and swiping past them out of habit.",
      "Use App Library's search (swipe down or tap the search bar at the top) to open an app quickly instead of hunting across multiple Home Screen pages.",
      "Check the 'Recently Added' folder in App Library after installing several new apps at once to quickly locate and organize them.",
    ],
    commonIssues: [
      {
        issue: "A newly installed app can't be found anywhere on the Home Screen",
        fix: "Check App Library by swiping left past your last page — it's likely there if 'Newly Downloaded Apps' is set to App Library Only.",
      },
      {
        issue: "An entire Home Screen page disappeared unexpectedly",
        fix: "Touch and hold the Home Screen, tap the page dots, and check whether that page was accidentally toggled off rather than the apps being deleted.",
      },
      {
        issue: "App Library categories seem to group unrelated apps together oddly",
        fix: "This is expected behavior since categorization is automatic and based on App Store metadata; there's no manual way to recategorize an app within App Library.",
      },
      {
        issue: "Deleting an app from the Home Screen also seems to remove it everywhere",
        fix: "Tapping 'Remove App' (rather than 'Remove from Home Screen') during jiggle mode fully uninstalls the app; use 'Remove from Home Screen Only' if you just want it out of view but kept in App Library.",
      },
    ],
    faqs: [
      {
        q: "Does hiding a Home Screen page delete the apps on it?",
        a: "No, hiding a page only removes it from view — the apps remain fully installed and accessible through App Library or Spotlight search.",
      },
      {
        q: "What's the difference between removing an app from the Home Screen and deleting it?",
        a: "Removing from the Home Screen keeps the app installed and moves it to App Library only, while deleting uninstalls the app entirely and removes its local data.",
      },
      {
        q: "Can I turn off App Library entirely?",
        a: "No, App Library is a permanent part of iOS and can't be disabled, though you can choose to send new downloads to the Home Screen as well so you rarely need to visit it.",
      },
    ],
    tipsAndTricks: [
      "Tap directly on a folder's small icon preview inside App Library to instantly reveal all the apps in that category without fully opening it.",
      "Swipe down anywhere on a Home Screen page to bring up Spotlight search as a faster alternative to browsing App Library for a specific app.",
    ],
    relatedSettingIds: ["ios-wallpaper", "ios-control-center", "ios-screen-time-family"],
  },
  {
    id: "ios-wallpaper",
    title: "Wallpaper",
    icon: Image,
    platform: "ios",
    category: "personalization",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Change the Wallpaper on iPhone",
    description:
      "Wallpaper settings let you personalize your Lock Screen and Home Screen with photos, curated presets, or Photo Shuffle rotations, plus Lock Screen extras like widgets, filters, and a customizable time display.",
    details: [
      "New wallpapers can be created from your own photos or chosen from preset categories like Weather & Astronomy, Emoji, or Color.",
      "Photo Shuffle rotates through a set of images automatically on a schedule like On Tap, On Lock, Hourly, or Daily.",
      "Lock Screen customization supports adding widgets, applying a photo filter, and changing the font and color of the time.",
      "iPhone 12 and later can generate 3D spatial wallpapers from certain photos for a subtle depth effect.",
    ],
    important:
      "Deleting a wallpaper you're actively using removes it from both the Lock Screen and Home Screen immediately, so switch to a different one first if you want to keep the current look.",
    redirectUrl: "https://support.apple.com/en-us/102638",
    afterImageContent: {
      heading: "Creating and Customizing a Wallpaper",
      paragraphs: [
        "Touching and holding the Lock Screen opens the wallpaper gallery, where you can add, edit, or switch between saved wallpapers.",
        "Each wallpaper is actually a linked pair — one for the Lock Screen, one for the Home Screen — that can be set to match or differ.",
        "Spatial wallpapers take a moment to generate, showing a 'Generating Spatial Scene' message before they're ready to apply.",
      ],
      steps: [
        "Touch and hold an empty area of the Lock Screen until the wallpaper gallery appears.",
        "Tap the '+' button to create a new wallpaper from Photos, a preset, or Photo Shuffle.",
        "Customize widgets, filters, and time style, then tap 'Add' to save it.",
        "Swipe between saved wallpapers and tap one to set it as active.",
      ],
    },
    whyItMatters:
      "Wallpaper is one of the most visible personalization choices on an iPhone, since it's the first thing you see dozens of times a day, and it also does real functional work through Lock Screen widgets that surface information like weather, battery, or calendar events at a glance. Photo Shuffle turns a static wallpaper into a small rotating slideshow of meaningful photos without any manual effort. Because Lock Screen and Home Screen wallpapers are linked as a pair, understanding how to set them independently (or intentionally match them) gives more control over the overall look than most people realize is available.",
    bestPractices: [
      "Use Photo Shuffle with a curated album of favorite photos if you want variety without manually changing the wallpaper yourself.",
      "Add a widget (like Weather or Calendar) to the Lock Screen wallpaper so useful information is visible without unlocking the phone.",
      "Choose a Lock Screen font and color that stays readable against your chosen photo, especially with busy or high-contrast images.",
      "Keep a small library of saved wallpapers rather than only one, so switching your look takes a single tap from the gallery instead of starting from scratch.",
    ],
    commonIssues: [
      {
        issue: "Changing the Home Screen wallpaper unexpectedly changes the Lock Screen too, or vice versa",
        fix: "Wallpapers are saved as a linked pair by default; when creating a new one, choose to set the Home Screen and Lock Screen independently if you don't want them to match.",
      },
      {
        issue: "A wallpaper widget stops updating with current information",
        fix: "Confirm the underlying app (like Weather or Calendar) has background refresh and location access enabled, since the widget relies on that app's own data permissions.",
      },
      {
        issue: "Spatial wallpaper option isn't available for a particular photo",
        fix: "Spatial wallpapers require a compatible photo and an iPhone 12 or later; not every image qualifies for the depth effect to generate correctly.",
      },
      {
        issue: "Deleted a wallpaper by accident and want it back",
        fix: "If it was created from a personal photo, that photo still exists in your library — simply create a new wallpaper from it again with the same customization choices.",
      },
    ],
    faqs: [
      {
        q: "Can I set different wallpapers for the Lock Screen and Home Screen?",
        a: "Yes, when creating or editing a wallpaper you can unlink the pair and choose separate images or styles for each screen instead of having them match.",
      },
      {
        q: "Does Photo Shuffle use my whole photo library or just certain albums?",
        a: "You choose the source — it can pull from a specific album, a smart category like Nature or Pets, or your full library, depending on what you select when setting it up.",
      },
      {
        q: "Do wallpaper widgets drain extra battery?",
        a: "Lock Screen widgets have a minimal impact since they update using the same efficient background refresh mechanisms as Home Screen widgets, not constant live tracking.",
      },
    ],
    tipsAndTricks: [
      "Use a Live Photo as your Lock Screen wallpaper and press firmly (or touch and hold on newer models) to play its motion and sound right from the Lock Screen.",
      "Tap the color dots below a photo wallpaper's preview to quickly try different tinted filter options before committing to one.",
    ],
    relatedSettingIds: ["ios-display-brightness", "ios-home-screen-app-library", "ios-control-center"],
  },
  {
    id: "ios-standby-lock-screen",
    title: "Lock Screen & StandBy",
    icon: Clock4,
    platform: "ios",
    category: "personalization",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Use StandBy and Customize the Lock Screen on iPhone",
    description:
      "StandBy turns your iPhone into a glanceable bedside display of clocks, widgets, and Live Activities whenever it's charging and turned sideways, while Lock Screen settings control what you see without unlocking the device at all.",
    details: [
      "StandBy activates automatically when the iPhone is charging, in landscape orientation, and the screen is locked.",
      "StandBy screens cycle between Clock, Photos, and Widgets views with a swipe, and each remembers its own last state.",
      "Night mode dims StandBy to a red-tinted display in low light so it's less disruptive on a nightstand.",
      "Tapping a StandBy screen once wakes it fully; a second tap can open the related app if Always-On features are supported.",
    ],
    important:
      "StandBy requires a stand, dock, or case that keeps the iPhone propped in landscape while charging — it won't activate lying flat on its back.",
    redirectUrl: "https://support.apple.com/guide/iphone/iph878d77632/ios",
    afterImageContent: {
      heading: "How StandBy Works on iPhone",
      paragraphs: [
        "StandBy detects charging plus landscape orientation and switches automatically to a large-format display within seconds.",
        "On iPhone 14 Pro and later with an always-on display, StandBy can stay dimly visible continuously instead of turning off between glances.",
        "Widgets shown in StandBy are the same interactive widgets available on your Home Screen, just resized for a distance view.",
      ],
      steps: [
        "Plug your iPhone in to charge and prop it up sideways.",
        "Wait a couple of seconds for StandBy to appear automatically.",
        "Swipe left or right to switch between Clock, Photos, and Widgets.",
        "Open Settings → StandBy to adjust Night Mode, Motion to Wake, and default screens.",
      ],
    },
    whyItMatters:
      "StandBy converts an idle charging phone into a useful bedside or desk display without buying a separate smart display or clock, showing the time, calendar events, and Live Activities at a glance. Because it only appears under specific conditions (charging, landscape, locked), understanding those requirements is the difference between it working reliably every night and never appearing at all. It's also worth configuring deliberately since a bright, non-dimmed StandBy screen can be genuinely disruptive on a nightstand if Night Mode isn't set up correctly.",
    bestPractices: [
      "Use a stand or MagSafe dock that reliably holds the iPhone in landscape, since a wobbly or flat charging setup will prevent StandBy from triggering consistently.",
      "Turn on Night Mode so StandBy automatically dims and tints red in a dark bedroom instead of staying at full brightness.",
      "Add Live Activities-aware widgets (like a timer or delivery tracker) to StandBy so in-progress activities stay visible while charging.",
      "Set a default StandBy screen (Clock, Photos, or Widgets) that matches what you actually check most, since it reopens to your last view otherwise.",
      "Disable 'Motion to Wake' if you find StandBy lighting up too often from small vibrations or nearby movement overnight.",
    ],
    commonIssues: [
      {
        issue: "StandBy never appears even though the iPhone is charging",
        fix: "Confirm the device is actually in landscape orientation and the screen is locked — StandBy won't trigger in portrait or while actively in use, and some third-party chargers may not be recognized reliably.",
      },
      {
        issue: "StandBy is too bright at night despite the room being dark",
        fix: "Turn on Night Mode in Settings → StandBy, which only tints and dims automatically once ambient light is low enough for the sensor to detect.",
      },
      {
        issue: "Tapping a StandBy widget doesn't do anything",
        fix: "Tap once to wake the display fully out of its dimmed state first — the first tap after inactivity only wakes the screen rather than activating the widget underneath it.",
      },
      {
        issue: "StandBy keeps switching back to the Clock screen instead of Widgets",
        fix: "Swipe to your preferred screen right before unplugging, since StandBy resumes from whichever view was active the last time it closed.",
      },
    ],
    faqs: [
      {
        q: "Does StandBy work with any charger?",
        a: "It works with any charging method — MagSafe, a Qi charger, or a Lightning/USB-C cable — as long as the iPhone is propped in landscape orientation while charging.",
      },
      {
        q: "Does StandBy drain the battery while charging?",
        a: "No, since the iPhone is plugged in while StandBy is active, the display itself doesn't meaningfully affect charging speed or overall battery health.",
      },
      {
        q: "Can I stop StandBy from turning on automatically?",
        a: "Yes, StandBy can be turned off entirely in Settings → StandBy if you'd rather your Lock Screen stay dark or in its normal locked state while charging.",
      },
    ],
    tipsAndTricks: [
      "Long-press any StandBy screen to access customization options for widgets, clock styles, or photo shuffle sources directly from that view.",
      "Pair StandBy with a Focus mode like Sleep so notifications stay quiet while the display still shows the time and any allowed alerts.",
    ],
    relatedSettingIds: ["ios-wallpaper", "ios-display-brightness", "ios-control-center"],
  },
  {
    id: "ios-location-services",
    title: "Location Services",
    icon: MapPin,
    platform: "ios",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Control Location Services on iPhone",
    description:
      "Location Services is the master switch and per-app control center for GPS-based location sharing on iPhone, letting you decide exactly which apps can see your precise or general location, and when.",
    details: [
      "A master Location Services toggle can disable location access for every app and system service at once.",
      "Each app can independently be set to Never, Ask Next Time, While Using the App, or Always.",
      "System Services (like Find My, Emergency Calls & SOS, and Significant Locations) are listed separately from regular apps.",
      "An arrow icon next to an app in the main Settings list indicates recent or current location use — solid for active, hollow for recent.",
    ],
    important:
      "Turning off Location Services entirely disables Find My iPhone's ability to locate the device, which removes an important anti-theft and lost-device recovery tool.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/control-the-location-information-you-share-iph3dd5f9be/ios",
    afterImageContent: {
      heading: "How Location Permissions Work on iPhone",
      paragraphs: [
        "iOS evaluates location access per app rather than as one blanket permission, so different apps can have entirely different access levels.",
        "Precise Location can be turned off independently, giving an app only your general area instead of exact GPS coordinates.",
        "System Services groups background location features that support Apple's own apps and device security separately from third-party apps.",
      ],
      steps: [
        "Open Settings → Privacy & Security → Location Services.",
        "Confirm the master toggle at the top is on.",
        "Tap an individual app to set its access level and toggle Precise Location.",
        "Scroll to System Services to review background location features like Find My and Significant Locations.",
      ],
    },
    whyItMatters:
      "Location data is some of the most sensitive information your iPhone handles, since it can reveal where you live, work, and travel over time, so granular per-app control is central to real privacy on the device. At the same time, Location Services powers genuinely useful features — accurate navigation, Find My device tracking, and location-based reminders — that stop working correctly if access is revoked too aggressively. Getting this setting right means balancing real privacy protection against not accidentally breaking the exact features you rely on daily.",
    bestPractices: [
      "Set most apps to 'While Using the App' rather than 'Always', reserving 'Always' for genuine background needs like Find My or a delivery-tracking app.",
      "Turn off Precise Location for apps like weather or retail that only need your general area, keeping exact coordinates private.",
      "Review the solid and hollow arrow indicators in the main Settings list periodically to spot apps using location more than expected.",
      "Keep Find My enabled under System Services even if you're cautious elsewhere, since it's one of the most effective tools for recovering a lost or stolen iPhone.",
      "Reset a specific app's location permission back to 'Ask Next Time' if you're unsure it still needs access, rather than leaving old grants unreviewed indefinitely.",
    ],
    commonIssues: [
      {
        issue: "Maps or a navigation app can't find your current position",
        fix: "Check that Location Services is on globally and that the specific app's permission is set to 'While Using the App' or 'Always', not 'Never'.",
      },
      {
        issue: "Find My shows an old or inaccurate last known location",
        fix: "Confirm Location Services and Find My are both enabled under System Services, and that the device has had a recent Wi-Fi or cellular connection to report its position.",
      },
      {
        issue: "Battery seems to drain faster after granting an app 'Always' location access",
        fix: "Change that app's permission to 'While Using the App' unless background tracking is genuinely required, since constant background location checks are one of the more power-hungry permissions.",
      },
      {
        issue: "An app keeps asking for location access even after it was denied once",
        fix: "This is expected for apps whose core function depends on location; if it's intrusive, set it explicitly to 'Never' in Settings → Privacy & Security → Location Services rather than dismissing the in-app prompt repeatedly.",
      },
    ],
    faqs: [
      {
        q: "Does turning off Location Services stop Find My from working?",
        a: "Yes, disabling the master Location Services toggle also disables Find My's ability to report the device's current location, which removes a key anti-theft protection.",
      },
      {
        q: "What's the difference between Precise and general location?",
        a: "Precise Location gives an app your exact GPS coordinates, while turning it off limits that app to a roughly 25-square-kilometer area, which is often enough for weather or local search without exposing your exact position.",
      },
      {
        q: "Can I tell if an app used my location recently without opening its settings?",
        a: "Yes, a solid purple arrow next to an app in the main Settings list means it used location in the last 24 hours, while an outlined arrow means it has geofencing set up but hasn't used it recently.",
      },
    ],
    tipsAndTricks: [
      "Tap 'System Services' at the very bottom of the Location Services screen to review background features like Location-Based Suggestions and Routing & Traffic individually.",
      "Use 'Ask Next Time' instead of a permanent Never/Always choice for apps you use only occasionally, so you're prompted fresh each time it's relevant.",
    ],
    relatedSettingIds: ["ios-privacy-permissions", "ios-battery", "ios-cellular-data"],
    updateFrequency:
      "Review per-app location permissions every couple of months, and immediately after installing any app that requests it.",
  },
  {
    id: "ios-cellular-data",
    title: "Cellular",
    icon: Signal,
    platform: "ios",
    category: "connectivity-network",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage Cellular Data on iPhone",
    description:
      "Cellular settings control your mobile data connection, including which apps can use cellular data, whether 5G or data roaming is allowed, and how much of your monthly plan each app has consumed.",
    details: [
      "Cellular Data can be toggled per app, letting you block specific apps from using mobile data while still allowing Wi-Fi.",
      "5G options (Auto, 5G On, or 5G Standalone) balance faster speeds against battery usage depending on your carrier and coverage.",
      "Data Roaming must be turned on separately to use cellular data while traveling internationally, and can incur significant charges if misconfigured.",
      "The Cellular Data Usage section shows how much data each app has used since the current stats were last reset.",
    ],
    important:
      "Cellular data usage statistics only reset when you manually tap 'Reset Statistics' — they don't automatically align with your carrier's monthly billing cycle.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/view-or-change-cellular-data-settings-iph3dd5f213/ios",
    afterImageContent: {
      heading: "Understanding Cellular Settings",
      paragraphs: [
        "The Cellular screen lists every app with its own on/off switch for using mobile data independently of Wi-Fi.",
        "Dual SIM and eSIM users can choose a default line for cellular data and calls, plus configure automatic switching between lines.",
        "Wi-Fi Assist can automatically switch to cellular when a Wi-Fi connection is weak, which is worth knowing about if data usage looks unexpectedly high.",
      ],
      steps: [
        "Open Settings → Cellular (or Mobile Data).",
        "Toggle Cellular Data on or off for individual apps under the app list.",
        "Tap 'Cellular Data Options' to adjust 5G settings, Data Roaming, or reset usage statistics.",
        "Review the usage breakdown to see which apps have consumed the most mobile data.",
      ],
    },
    whyItMatters:
      "Cellular settings directly control your monthly data bill, since large apps like video streaming or cloud backup services can quietly burn through a limited plan if left unrestricted. Data Roaming in particular carries real financial risk, as leaving it on unknowingly while traveling internationally can result in unexpectedly large charges. Per-app cellular toggles also give fine-grained control that a blanket 'Wi-Fi only' device setting can't offer, letting essential apps like Messages or Maps stay connected everywhere while data-heavy apps wait for Wi-Fi.",
    bestPractices: [
      "Turn off Cellular Data for large, non-essential apps (like a video streaming or backup app) if you're on a limited data plan, so they only sync over Wi-Fi.",
      "Turn off Data Roaming before international travel unless your carrier plan specifically includes it, and re-enable only the components (voice, data) your plan supports.",
      "Reset cellular usage statistics on the same day your billing cycle starts each month, so the on-device numbers actually match your carrier's bill.",
      "Set 5G to 'Auto' rather than 'On' if battery life matters more to you than maximizing peak speeds in areas with inconsistent 5G coverage.",
      "Check the Cellular Data Usage list before a trip to identify which apps are worth temporarily restricting while relying on a limited roaming plan.",
    ],
    commonIssues: [
      {
        issue: "An app won't load data or update outside of Wi-Fi",
        fix: "Check Settings → Cellular and confirm that specific app's Cellular Data toggle is turned on, since it may have been disabled intentionally or by an automatic data-saving setting.",
      },
      {
        issue: "Unexpectedly large charges appear after international travel",
        fix: "Verify Data Roaming was off for the trip, or confirm with your carrier that an international plan was active, since roaming data outside a covered plan is billed at a much higher rate.",
      },
      {
        issue: "Cellular Data Usage numbers don't match the carrier's app or bill",
        fix: "Remember these on-device statistics only reset manually and measure raw app usage, not your carrier's specific billing cycle or any Wi-Fi-based data included in your plan.",
      },
      {
        issue: "5G doesn't seem to connect even though it's turned on",
        fix: "5G availability depends on carrier coverage in your specific location — 'Auto' mode will fall back to LTE automatically where 5G isn't available or would drain battery faster than it's worth.",
      },
    ],
    faqs: [
      {
        q: "Does turning off Cellular Data for an app stop it from working entirely?",
        a: "No, it only prevents that app from using mobile data — it will still function normally whenever the iPhone is connected to Wi-Fi.",
      },
      {
        q: "Is 5G Standalone always faster than 5G Auto?",
        a: "Not necessarily — Standalone can offer higher peak speeds on supported networks but typically uses more battery, while Auto intelligently balances speed and power based on your carrier's actual coverage.",
      },
      {
        q: "Why does my data usage look wrong right after I reset the statistics?",
        a: "Resetting only clears the counters, not your carrier's actual billing record, so a brief mismatch is normal until a new full cycle of usage accumulates on-device.",
      },
    ],
    tipsAndTricks: [
      "Turn off 'Wi-Fi Assist' if you want your iPhone to strictly stay on a weak Wi-Fi signal instead of quietly switching to cellular data and consuming your plan.",
      "Set a reminder to reset Cellular Data Usage on your billing date each month, so the app-by-app breakdown always reflects the current cycle accurately.",
    ],
    relatedSettingIds: ["ios-wifi", "ios-personal-hotspot", "ios-vpn"],
  },
  {
    id: "ios-personal-hotspot",
    title: "Personal Hotspot",
    icon: Router,
    platform: "ios",
    category: "connectivity-network",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Share Your iPhone's Internet Connection with Personal Hotspot",
    description:
      "Personal Hotspot turns your iPhone's cellular data connection into a temporary Wi-Fi, USB, or Bluetooth network that other devices like a laptop, tablet, or another phone can join for internet access.",
    details: [
      "Nearby Apple devices signed into the same Apple Account can join automatically via Instant Hotspot without entering a password.",
      "Other devices join like any Wi-Fi network, using the hotspot's name and password shown right on the Personal Hotspot screen.",
      "Connecting over USB or Bluetooth instead of Wi-Fi can noticeably extend your iPhone's battery life while hotspotting.",
      "'Maximize Compatibility' can be turned on if certain older or non-Apple devices have trouble joining the hotspot's default network.",
    ],
    important:
      "Personal Hotspot uses your cellular data plan, so heavy use — like streaming video on a connected laptop — can consume a large amount of data quickly if your plan has a cap.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/share-internet-connection-personal-hotspot-iph45447ca6/ios",
    afterImageContent: {
      heading: "Turning On and Joining a Personal Hotspot",
      paragraphs: [
        "The Personal Hotspot screen displays the network name and password that other devices need to join over Wi-Fi.",
        "Instant Hotspot lets a nearby iPad or Mac join with a single tap, without you needing to manually turn on the hotspot first on some setups.",
        "A blue status bar or banner appears on the iPhone whenever another device is actively connected to the hotspot.",
      ],
      steps: [
        "Open Settings → Personal Hotspot.",
        "Turn on 'Allow Others to Join'.",
        "On the connecting device, choose your iPhone's hotspot network from its Wi-Fi list and enter the shown password.",
        "Confirm the connected devices count updates on your iPhone's Personal Hotspot screen.",
      ],
    },
    whyItMatters:
      "Personal Hotspot is often the difference between staying productive and losing connectivity entirely when traveling, working remotely, or dealing with an outage on a home or office network. Because it draws on the same cellular data plan used for everything else on the iPhone, understanding how it consumes data helps avoid an unpleasant overage surprise after a few hours of laptop use over a hotspot. It's also a genuinely convenient bridge between Apple devices thanks to Instant Hotspot, removing the friction of manually entering a password every time a nearby iPad needs a quick connection.",
    bestPractices: [
      "Change the default hotspot password to something memorable but not guessable if you share it with others regularly, like a coworking group or family.",
      "Prefer a USB or Bluetooth connection over Wi-Fi for a connected laptop when battery life matters more than maximum throughput.",
      "Monitor Cellular Data Usage while hotspotting for an extended session, since a connected computer can consume data far faster than the iPhone alone typically would.",
      "Turn on 'Maximize Compatibility' only if a specific device fails to join normally, since it can reduce hotspot performance for devices that connect fine already.",
      "Turn off 'Allow Others to Join' when you're done, rather than leaving the hotspot broadcasting and available indefinitely.",
    ],
    commonIssues: [
      {
        issue: "A laptop or other device can't find the iPhone's hotspot in its Wi-Fi list",
        fix: "Confirm 'Allow Others to Join' is turned on and the iPhone has an active cellular data connection, since Personal Hotspot requires cellular data to actually function.",
      },
      {
        issue: "Instant Hotspot doesn't appear as an option on a nearby Mac or iPad",
        fix: "Ensure both devices are signed into the same Apple Account with Wi-Fi and Bluetooth turned on, since Instant Hotspot relies on that pairing to detect nearby devices automatically.",
      },
      {
        issue: "Hotspot connection drops repeatedly during use",
        fix: "Move the connected device closer to the iPhone, check for a weak cellular signal, or switch the connection method to USB for a more stable link.",
      },
      {
        issue: "Cellular data plan runs out much faster than expected while hotspotting",
        fix: "Check Cellular Data Usage to see actual consumption, and avoid data-heavy activities like video streaming or large downloads over the hotspot on a limited plan.",
      },
    ],
    faqs: [
      {
        q: "Does Personal Hotspot use Wi-Fi data or cellular data?",
        a: "It uses your iPhone's cellular data connection, converting it into Wi-Fi, USB, or Bluetooth access for other devices — it does not use or require a separate Wi-Fi connection.",
      },
      {
        q: "Can I use Personal Hotspot and be connected to a separate Wi-Fi network at the same time?",
        a: "Generally no on the iPhone itself, since turning on the hotspot uses the cellular connection for others while the iPhone stays on its own network path; some device configurations vary slightly by carrier.",
      },
      {
        q: "How many devices can join my Personal Hotspot at once?",
        a: "The exact limit varies by carrier and iPhone model, but most plans support at least a handful of simultaneous connected devices sharing the same cellular connection.",
      },
    ],
    tipsAndTricks: [
      "Tap the Personal Hotspot password field to reveal and quickly copy it instead of manually typing a long generated password on the connecting device.",
      "Rename your iPhone under General → About if the hotspot network name showing up for others is unclear or overly generic.",
    ],
    relatedSettingIds: ["ios-wifi", "ios-cellular-data", "ios-bluetooth"],
  },
  {
    id: "ios-vpn",
    title: "VPN",
    icon: ShieldCheck,
    platform: "ios",
    category: "connectivity-network",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Connect Your iPhone to a VPN",
    description:
      "VPN settings let your iPhone route its network traffic through a virtual private network, commonly used to access a workplace network securely or to add an extra layer of privacy on public Wi-Fi.",
    details: [
      "Most VPN setups require installing a VPN app from the App Store, which then adds its configuration to Settings → VPN automatically.",
      "A VPN status indicator appears at the top of the screen whenever a VPN connection is actively in use.",
      "'Connect On Demand' can be configured so the VPN activates automatically for specific network conditions without a manual toggle.",
      "Organizations often deploy VPN configurations remotely through a device management profile rather than manual setup.",
    ],
    important:
      "A VPN reroutes all network traffic through its own servers, so only install a VPN app or profile from a source (employer or reputable provider) you genuinely trust.",
    redirectUrl: "https://support.apple.com/guide/iphone/use-vpn-iph45f7e324/13.0/ios/13.0",
    afterImageContent: {
      heading: "Setting Up and Using a VPN",
      paragraphs: [
        "Once a VPN app is installed and configured, its connection toggle typically appears both within the app and in Settings → VPN.",
        "A small VPN icon in the status bar confirms the connection is active system-wide, not just within the VPN app itself.",
        "Work or school VPN profiles installed via device management usually connect automatically without requiring you to open the VPN app manually.",
      ],
      steps: [
        "Install a VPN app from the App Store, or receive a VPN profile from your organization.",
        "Follow the app's in-app setup to authenticate and configure the connection.",
        "Open Settings → VPN and toggle the connection on if it isn't already active.",
        "Confirm the VPN status icon appears in the status bar once connected.",
      ],
    },
    whyItMatters:
      "A VPN is often the only way to securely reach internal company resources, like file servers or intranet tools, from outside the office, making it essential infrastructure for remote and hybrid work rather than an optional privacy add-on. On public or untrusted Wi-Fi, a reputable VPN also adds a real layer of protection against network-level snooping that Wi-Fi encryption alone doesn't fully address. Because a VPN sees all your routed traffic, this is also one of the settings where trusting the wrong provider can undermine the very privacy or security you're trying to add.",
    bestPractices: [
      "Only install a VPN app or accept a VPN profile from your employer or a well-reviewed, reputable provider, since it can see and route all your traffic.",
      "Use 'Connect On Demand' rules so a work VPN activates automatically only when needed, rather than manually remembering to toggle it each time.",
      "Check for the VPN status icon in the status bar after connecting to confirm traffic is actually being routed through it, not just that the app reports 'connected'.",
      "Remove old or unused VPN configurations from Settings → VPN & Device Management to avoid confusion between multiple saved connections.",
      "Contact your IT administrator directly for setup details rather than guessing at server or authentication settings for a work VPN.",
    ],
    commonIssues: [
      {
        issue: "VPN connects but internal work resources still aren't reachable",
        fix: "Confirm with your IT department that the correct VPN profile and authentication method are configured, since a successful VPN connection doesn't guarantee correct routing rules for internal servers.",
      },
      {
        issue: "VPN disconnects randomly throughout the day",
        fix: "Check whether 'Connect On Demand' rules are causing it to drop on certain networks, and confirm the VPN app itself has background app refresh enabled.",
      },
      {
        issue: "No VPN option appears in Settings even after installing a VPN app",
        fix: "Open the VPN app itself and complete its in-app setup first — Settings → VPN typically only shows a configuration after the app has registered one during setup.",
      },
      {
        issue: "Internet feels noticeably slower with the VPN turned on",
        fix: "This is expected to some degree since traffic takes a longer path through the VPN server, but try a different server location within the app if speeds seem unusually poor.",
      },
    ],
    faqs: [
      {
        q: "Do I need a VPN app, or does iPhone have one built in?",
        a: "iPhone doesn't include a general-purpose consumer VPN service built in — you need to install a VPN app from the App Store or receive a configuration profile from an organization to connect to one.",
      },
      {
        q: "Can my employer see everything I do on my personal iPhone if I install their VPN?",
        a: "A work VPN profile can typically only see traffic while the VPN is actively connected and routed through it, not your device's activity outside that connection, though exact visibility depends on how the organization's profile is configured.",
      },
      {
        q: "Does a VPN make public Wi-Fi completely safe to use?",
        a: "It substantially reduces certain risks like network-level snooping, but it doesn't protect against every threat, such as visiting a malicious website or entering credentials into a phishing page.",
      },
    ],
    tipsAndTricks: [
      "Look for the small 'VPN' label next to the time in the status bar as the quickest way to confirm a connection is actually active.",
      "Check Settings → General → VPN & Device Management to see all installed VPN configurations and any management profiles in one place.",
    ],
    relatedSettingIds: ["ios-wifi", "ios-privacy-permissions", "ios-cellular-data"],
  },
  {
    id: "ios-airdrop",
    title: "AirDrop",
    icon: Share2,
    platform: "ios",
    category: "connectivity-network",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Share Files with AirDrop on iPhone",
    description:
      "AirDrop lets you instantly send photos, documents, links, and more to nearby iPhones, iPads, and Macs using a combination of Wi-Fi and Bluetooth, without needing the same network or an internet connection.",
    details: [
      "Receiving options include Contacts Only, Everyone for 10 Minutes, and Receiving Off, controlling who can send you files.",
      "Both Wi-Fi and Bluetooth must be turned on for AirDrop to detect and connect to nearby devices.",
      "On iPhone 15 and later with iOS 17 or later, holding two iPhones close together starts an AirDrop transfer automatically.",
      "Transfers happen over a direct peer-to-peer connection, so no internet connection or shared Wi-Fi network is required.",
    ],
    important:
      "Setting AirDrop to 'Everyone for 10 Minutes' briefly exposes you to file requests from any nearby stranger's device, not just people you know — it automatically reverts afterward for this reason.",
    redirectUrl: "https://support.apple.com/en-us/HT204144",
    afterImageContent: {
      heading: "Sending and Receiving with AirDrop",
      paragraphs: [
        "AirDrop appears as a share sheet option throughout iOS, in Photos, Safari, Files, and most apps with shareable content.",
        "Nearby compatible devices with AirDrop discoverable appear as icons you can tap to send directly to.",
        "The recipient sees a preview and must accept the incoming item before it's saved to their device.",
      ],
      steps: [
        "Open Settings → General → AirDrop and choose Contacts Only or Everyone for 10 Minutes.",
        "In the app you're sharing from, tap the Share icon.",
        "Tap AirDrop, then tap the nearby device you want to send to.",
        "Wait for the recipient to accept the transfer.",
      ],
    },
    whyItMatters:
      "AirDrop remains one of the fastest ways to move files between Apple devices, often completing large transfers in seconds without needing cables, cloud uploads, or a shared network. Because its visibility setting determines who can even attempt to send you something, understanding Contacts Only versus Everyone is a meaningful privacy decision, not just a connectivity preference. It's also relied on constantly in everyday situations — sharing a photo after a group event, sending a boarding pass, or handing off a document in a meeting — making it one of the more frequently touched settings on the device despite rarely needing adjustment.",
    bestPractices: [
      "Keep AirDrop set to 'Contacts Only' as your default, switching to 'Everyone for 10 Minutes' only when you specifically need to receive from someone not in your Contacts.",
      "Turn on both Wi-Fi and Bluetooth before attempting an AirDrop transfer, since either being off will prevent devices from discovering each other.",
      "Confirm the recipient's name and device preview before accepting an AirDrop transfer from someone you don't recognize.",
      "Use AirDrop for large files like videos instead of Messages when both devices are nearby, since it transfers at full quality without any compression.",
    ],
    commonIssues: [
      {
        issue: "A nearby device doesn't appear as an AirDrop option",
        fix: "Confirm both devices have Wi-Fi and Bluetooth turned on, are unlocked, and are within roughly 30 feet of each other, and check the receiving device's AirDrop setting isn't set to 'Receiving Off'.",
      },
      {
        issue: "AirDrop transfer starts but gets stuck or fails partway through",
        fix: "Move the devices closer together and disable Personal Hotspot temporarily on either device, since an active hotspot can sometimes interfere with the Wi-Fi Direct connection AirDrop uses.",
      },
      {
        issue: "Set AirDrop to 'Everyone for 10 Minutes' but it reverted to Contacts Only unexpectedly",
        fix: "This is expected behavior by design — the Everyone setting automatically times out after 10 minutes as a security precaution and needs to be re-enabled if still needed.",
      },
      {
        issue: "Receiving unwanted AirDrop requests from strangers in a public place",
        fix: "Switch AirDrop to 'Contacts Only' or 'Receiving Off' immediately in Settings → General → AirDrop, or via Control Center.",
      },
    ],
    faqs: [
      {
        q: "Does AirDrop use my cellular data or internet connection?",
        a: "No, AirDrop transfers files directly between nearby devices over Wi-Fi and Bluetooth without needing an internet connection or consuming cellular data.",
      },
      {
        q: "Can I AirDrop files to an Android phone?",
        a: "No, AirDrop only works between Apple devices — Mac, iPhone, and iPad — and has no equivalent built-in support for Android or Windows devices.",
      },
      {
        q: "Is it safe to leave AirDrop set to 'Everyone'?",
        a: "It's generally not recommended to leave it that way indefinitely, since it allows any nearby stranger's device to send you a file request; Apple automatically reverts this setting to Contacts Only after 10 minutes for this reason.",
      },
    ],
    tipsAndTricks: [
      "Access AirDrop's visibility setting quickly from Control Center by long-pressing the network card in the top-left group, instead of digging through Settings.",
      "On supported iPhone 15 and later models, simply bring two unlocked iPhones close together to start a transfer without opening the share sheet manually.",
    ],
    relatedSettingIds: ["ios-wifi", "ios-bluetooth", "ios-privacy-permissions"],
  },
  {
    id: "ios-siri-search",
    title: "Siri & Search",
    icon: Search,
    platform: "ios",
    category: "apps-features",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Configure Siri and Search on iPhone",
    description:
      "Siri & Search settings control how you activate Siri (voice, button press, or typing), what each app can contribute to Spotlight search and Siri Suggestions, and how much Siri learns from your usage patterns.",
    details: [
      "Siri can be activated with 'Hey Siri', by pressing the side or Home button, or by typing requests instead of speaking.",
      "Each installed app has its own switch for whether it can appear in Search, Suggestions, and the Look Up feature.",
      "Siri Suggestions use on-device learning to predict what you might need next, like confirming an appointment or suggesting an app at a familiar time or place.",
      "Siri can be prevented from responding when the iPhone is locked, requiring the device to be unlocked first for sensitive requests.",
    ],
    important:
      "Allowing Siri access when locked means some requests, like sending a message or reading notifications, could be triggered by anyone holding the device without unlocking it first.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/change-siri-settings-iphc28624b81abc/ios",
    afterImageContent: {
      heading: "How Siri and Search Settings Work",
      paragraphs: [
        "Siri's voice, language, and activation methods are configured once and apply system-wide across every app.",
        "Per-app Search and Suggestions settings determine whether that app's content shows up in Spotlight results or the Siri Suggestions widget.",
        "Apple Intelligence-enabled devices layer additional contextual understanding on top of standard Siri Suggestions for more relevant results.",
      ],
      steps: [
        "Open Settings → Apps → Siri & Search (or Settings → Siri & Search on older iOS versions).",
        "Adjust 'Listen for Hey Siri', 'Press Side Button for Siri', and 'Allow Siri When Locked'.",
        "Scroll to the app list and toggle Search, Suggestions, and Notifications on Lock Screen per app.",
        "Retrain 'Hey Siri' recognition from this screen if voice detection feels unreliable.",
      ],
    },
    whyItMatters:
      "Siri & Search quietly shapes two very different things at once — how quickly you can get answers or perform tasks hands-free, and how much of your personal data (locations, messages, app content) gets indexed for search and suggestions across the system. Turning off Search and Suggestions for a sensitive app (like a journal or banking app) keeps its content out of Spotlight and the Suggestions widget, which is a meaningful privacy boundary many people never realize is adjustable per app. Because Siri can be configured to respond even when the device is locked, this settings screen is also directly tied to what a person holding your locked iPhone could still access.",
    bestPractices: [
      "Turn off Search and Siri Suggestions for sensitive apps (like journaling, health, or finance apps) so their content doesn't surface in Spotlight or the Suggestions widget.",
      "Disable 'Allow Siri When Locked' if you're concerned about someone accessing messages, notes, or other content without unlocking the device first.",
      "Retrain 'Hey Siri' if voice activation has become unreliable, since your voice and the environment you use it in can change over time.",
      "Leave Suggestions on for frequently used apps you're comfortable with, since it genuinely speeds up common daily actions like opening a ride-share app at a familiar time.",
    ],
    commonIssues: [
      {
        issue: "'Hey Siri' stops responding reliably",
        fix: "Go to Settings → Siri & Search → 'Listen for Hey Siri' and retrain the voice model, especially after a significant change in your voice or usual environment noise.",
      },
      {
        issue: "An app's content shows up in Spotlight search when you'd rather it didn't",
        fix: "Turn off 'Show in Search' for that specific app under Settings → Apps → Siri & Search, or its General settings page depending on iOS version.",
      },
      {
        issue: "Siri responds to requests without the phone being unlocked first",
        fix: "Turn off 'Allow Siri When Locked' if this is a concern, which then requires unlocking before Siri will act on most requests.",
      },
      {
        issue: "Siri Suggestions widget shows irrelevant or unwanted app suggestions",
        fix: "Turn off 'Show Suggestions' for the specific apps generating those suggestions rather than disabling the whole Suggestions feature.",
      },
    ],
    faqs: [
      {
        q: "What's the difference between Siri and Search settings for an app?",
        a: "Search controls whether an app's content appears in Spotlight results, while Siri Suggestions controls whether that app can proactively suggest actions or content based on your usage patterns — they can be toggled independently.",
      },
      {
        q: "Does turning off Siri Suggestions for an app delete any data?",
        a: "No, it only stops that app's content and predictions from surfacing in Search and Suggestions — the app itself and its data remain completely unaffected.",
      },
      {
        q: "Can I use Siri without saying 'Hey Siri' out loud?",
        a: "Yes, you can press and hold the side button (or Home button on older models), or turn on 'Type to Siri' to send text requests without speaking at all.",
      },
    ],
    tipsAndTricks: [
      "Use 'Type to Siri' in a quiet environment like a library or meeting where speaking a voice command out loud isn't practical.",
      "Check each app's individual entry under Siri & Search after installing something new, since defaults for Search and Suggestions vary by app.",
    ],
    relatedSettingIds: ["ios-privacy-permissions", "ios-notifications", "ios-keyboard"],
  },
  {
    id: "ios-keyboard",
    title: "Keyboard",
    icon: Keyboard,
    platform: "ios",
    category: "devices-peripherals",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize the Keyboard on iPhone",
    description:
      "Keyboard settings let you add languages and layouts, configure autocorrect and predictive text, and connect a physical Bluetooth or Magic Keyboard for a more traditional typing experience.",
    details: [
      "Multiple keyboards (different languages or layouts like emoji) can be added and switched between with the globe key.",
      "Autocorrect, Predictive Text, and Check Spelling can each be toggled independently based on typing preference.",
      "A paired Bluetooth or Magic Keyboard is managed from the same screen, including custom key mappings on supported models.",
      "Text Replacement lets you create shortcuts, like typing 'omw' to automatically expand into 'On my way!'.",
    ],
    important:
      "Removing a keyboard you're not using also removes its associated dictionary and text replacements for that language until it's added back.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/add-or-change-keyboards-iph73b71eb/ios",
    afterImageContent: {
      heading: "Adding Keyboards and Text Shortcuts",
      paragraphs: [
        "Each added keyboard appears in a rotation accessible by tapping and holding the globe icon on the on-screen keyboard.",
        "Text Replacement entries sync across your devices via iCloud if enabled, so shortcuts stay consistent everywhere you type.",
        "A connected external keyboard can use standard shortcuts for many system functions, like Cmd+Space for Spotlight search.",
      ],
      steps: [
        "Open Settings → General → Keyboard.",
        "Tap 'Keyboards' to add a new language or layout, or remove ones you don't use.",
        "Tap 'Text Replacement' to add custom shortcuts that expand into longer phrases.",
        "Toggle Autocorrection, Predictive Text, and other typing preferences to taste.",
      ],
    },
    whyItMatters:
      "Keyboard settings directly affect typing speed and accuracy for one of the most repetitive interactions on the device, so a poorly tuned autocorrect or missing language keyboard creates daily friction that compounds over thousands of taps. Text Replacement in particular is a genuinely powerful time-saver for anyone who types the same addresses, phrases, or signatures repeatedly, turning a few characters into a full sentence instantly. For bilingual users or anyone pairing a physical keyboard, this screen is also where language switching and external hardware behavior get configured correctly.",
    bestPractices: [
      "Add every language you regularly type in as a separate keyboard, rather than relying on autocorrect to guess between languages incorrectly.",
      "Set up Text Replacement shortcuts for information you type often, like your email address or a common closing line, to save real time over weeks of typing.",
      "Turn off Predictive Text if you find the suggestion bar distracting rather than helpful, since it's an independent toggle from Autocorrect.",
      "Enable 'Text Replacement' iCloud sync so your shortcuts are available immediately on a new or additional device rather than re-entering them manually.",
    ],
    commonIssues: [
      {
        issue: "Autocorrect keeps changing a name or word you type correctly and intentionally",
        fix: "Add that specific word as a Text Replacement with itself as both the shortcut and phrase, which teaches the keyboard to stop 'correcting' it.",
      },
      {
        issue: "Can't find the option to switch to a different language keyboard while typing",
        fix: "Tap and hold the globe icon at the bottom-left of the keyboard (or bottom-right depending on layout) to see and select from all added keyboards.",
      },
      {
        issue: "A connected Bluetooth keyboard types the wrong characters or has swapped keys",
        fix: "Check Settings → General → Keyboard → Hardware Keyboard and confirm the correct keyboard layout matches your physical device's language and region.",
      },
      {
        issue: "Text Replacement shortcuts don't appear on a second iPhone or iPad",
        fix: "Confirm both devices are signed into the same Apple Account with Text Replacement sync enabled under Settings → [Your Name] → iCloud → Saved to iCloud.",
      },
    ],
    faqs: [
      {
        q: "How do I type in more than one language on the same iPhone?",
        a: "Add each language as a separate keyboard under Settings → General → Keyboard → Keyboards, then switch between them by tapping and holding the globe key while typing.",
      },
      {
        q: "Can I use a physical keyboard with my iPhone?",
        a: "Yes, most Bluetooth keyboards, including Apple's Magic Keyboard, can be paired under Settings → Bluetooth and will then appear as a connected hardware keyboard option.",
      },
      {
        q: "What happens to my custom Text Replacement shortcuts if I remove a keyboard?",
        a: "Text Replacement shortcuts are generally tied to your account rather than a specific keyboard, so removing an unrelated language keyboard typically won't delete them, though language-specific dictionary words can be affected.",
      },
    ],
    tipsAndTricks: [
      "Use the one-handed keyboard mode (long-press the globe or emoji key) to shrink the keyboard to one side for easier reach on larger iPhones.",
      "Swipe across letters instead of tapping each one individually if your keyboard supports QuickPath gesture typing, for noticeably faster input on longer messages.",
    ],
    relatedSettingIds: ["ios-accessibility", "ios-siri-search", "ios-bluetooth"],
  },
  {
    id: "ios-language-region",
    title: "Language & Region",
    icon: Globe,
    platform: "ios",
    category: "accessibility-language",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Change Language and Region Settings on iPhone",
    description:
      "Language & Region controls which language iOS displays system-wide, plus region-specific formatting for calendars, number separators, measurement units, and temperature — separate settings that don't have to match each other.",
    details: [
      "iPhone Language sets the primary language used throughout Settings, system apps, and most third-party apps.",
      "Region affects date formats, the calendar system, number formatting, currency, and default measurement units independently of language.",
      "Additional languages can be added so specific apps or keyboards can use a different language than the main system language.",
      "Temperature Unit and the calendar type (like Gregorian or Buddhist) can each be overridden separately from the general Region setting.",
    ],
    important:
      "Changing the primary iPhone Language requires a short restart-like re-launch of the Settings app and can temporarily rename menus you're used to, which is expected, not a glitch.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/change-the-language-and-region-iphce20717a3/ios",
    afterImageContent: {
      heading: "How Language and Region Work Together on iPhone",
      paragraphs: [
        "Language determines the words iOS displays, while Region determines formatting conventions like whether dates read month-first or day-first.",
        "You can pair a language from one country with the region conventions of another, such as English display text with European date and measurement formats.",
        "Some apps use Apple's system language and region settings automatically, while a few manage their own separate in-app language preference.",
      ],
      steps: [
        "Open Settings → General → Language & Region.",
        "Tap 'iPhone Language' to change the primary system language, then confirm the change.",
        "Tap 'Region' to adjust date formats, measurement units, and calendar conventions.",
        "Add an 'Other Languages' entry if you want a secondary language available for specific apps or keyboards.",
      ],
    },
    whyItMatters:
      "Language and Region settings affect far more than the words on screen — they determine whether measurements show in miles or kilometers, how dates are formatted in Mail and Calendar, and which calendar system is used for date calculations. Getting Region wrong after moving or traveling can cause subtle but confusing issues, like a delivery date appearing swapped between day and month. Because language and region are independent settings, understanding that distinction avoids the common mistake of trying to fix a formatting problem by changing the language, or vice versa.",
    bestPractices: [
      "Set Region to match where you actually live day-to-day, even if you keep your iPhone Language set to something else, so dates and units stay locally relevant.",
      "Add a second language under 'Other Languages' instead of switching your primary iPhone Language back and forth if you regularly need both for different apps.",
      "Double check Region after returning from extended travel, since some carriers or Wi-Fi networks can prompt a temporary region suggestion.",
      "Review the Calendar type setting specifically if you rely on a non-Gregorian calendar for religious or cultural dates.",
    ],
    commonIssues: [
      {
        issue: "Dates appear with the day and month seemingly swapped",
        fix: "Check Settings → General → Language & Region → Region, since date order (day-first vs. month-first) is controlled by Region, not Language.",
      },
      {
        issue: "Changing the iPhone Language causes some app names or menus to look unfamiliar",
        fix: "This is expected right after a language change — give apps a moment to relaunch in the new language, and check each app's own language override if one still shows the old language.",
      },
      {
        issue: "Measurement units (miles, temperature) don't match your expectations",
        fix: "Adjust the specific Measurement Units and Temperature settings under Language & Region → Region, which can be set independently from the general region format.",
      },
      {
        issue: "A single app keeps displaying in a different language than the rest of the system",
        fix: "Check that app's own in-app language setting first, since some apps manage their own language preference separately from Settings → Language & Region.",
      },
    ],
    faqs: [
      {
        q: "Can my iPhone display one language while using another region's date formats?",
        a: "Yes, Language and Region are independent settings, so you can, for example, keep the display language in English while using a different region's date, currency, and measurement conventions.",
      },
      {
        q: "Does changing my iPhone Language delete any apps or data?",
        a: "No, changing the language only affects how text is displayed system-wide; your apps, photos, and data remain completely unaffected.",
      },
      {
        q: "Will changing Region affect what's available in the App Store or Apple Music?",
        a: "No, this Region setting under Language & Region is a display and formatting preference; your App Store storefront country is a separate setting tied to your Apple Account.",
      },
    ],
    tipsAndTricks: [
      "Use 'Other Languages' to keep a secondary keyboard and language ready for messaging bilingual contacts without switching your entire system language.",
      "Preview the exact date and number formatting a Region will use right on the Region selection screen before confirming the change.",
    ],
    relatedSettingIds: ["ios-keyboard", "ios-accessibility", "ios-general-about"],
  },
  {
    id: "ios-date-time",
    title: "Date & Time",
    icon: Clock,
    platform: "ios",
    category: "system-info",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set the Date and Time on iPhone",
    description:
      "Date & Time settings normally keep your iPhone's clock accurate automatically using your current location and cellular network, but they can also be set manually and switched between 12-hour and 24-hour display.",
    details: [
      "'Set Automatically' uses location and network time data to keep the clock and time zone continuously accurate, including during travel.",
      "Turning off 'Set Automatically' allows manually choosing a specific time zone, date, and time.",
      "The 24-Hour Time toggle switches the whole system, including Lock Screen, Clock, and Calendar, between 12-hour and 24-hour formats.",
      "An incorrect time zone can silently shift the accuracy of alarms, calendar events, and message timestamps.",
    ],
    important:
      "Turning off 'Set Automatically' means the clock and time zone stay fixed until you change them manually, even after traveling to a different time zone.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/change-the-date-and-time-iph65f82af3e/ios",
    afterImageContent: {
      heading: "How Automatic Date and Time Works",
      paragraphs: [
        "iPhone typically determines the correct time zone using a combination of location data and information from the cellular network.",
        "Devices without cellular service, like Wi-Fi-only iPads, rely more heavily on location and network time servers to stay accurate.",
        "Manual mode is mainly useful in rare cases like testing, or specific regions where automatic time zone detection is unreliable.",
      ],
      steps: [
        "Open Settings → General → Date & Time.",
        "Confirm 'Set Automatically' is turned on for the clock to update using location and network data.",
        "Toggle '24-Hour Time' on or off to match your preferred clock format.",
        "Turn off 'Set Automatically' only if you specifically need to set the date, time, or time zone manually.",
      ],
    },
    whyItMatters:
      "Accurate date and time settings are foundational to dozens of features working correctly at once — alarms firing on schedule, calendar invitations landing at the right hour, message timestamps making sense, and Screen Time or Focus schedules triggering when expected. Because 'Set Automatically' relies on location and cellular data, disabling Location Services for the system or losing cellular signal in a new time zone can cause the clock to drift out of sync without an obvious warning. This is also one of the first things worth checking when a scheduled reminder, alarm, or calendar event seems to fire at the wrong time.",
    bestPractices: [
      "Leave 'Set Automatically' turned on for nearly all everyday use, since it reliably adjusts the time zone during travel without any manual intervention.",
      "Confirm Location Services is enabled for System Services if the clock seems to be drifting, since time zone detection depends partly on location data.",
      "Switch to 24-Hour Time if you regularly work with international teams or schedules where 12-hour AM/PM formatting causes confusion.",
      "Double-check the time zone manually right after landing in a new country if you're on airplane mode without cellular service for an extended period.",
    ],
    commonIssues: [
      {
        issue: "Clock shows the wrong time zone after landing in a new country",
        fix: "Turn cellular data and Location Services back on so 'Set Automatically' can re-detect the correct time zone, since airplane mode alone can delay the update.",
      },
      {
        issue: "Alarms or calendar events fire an hour off from expected",
        fix: "Check Settings → General → Date & Time to confirm the correct time zone is selected, especially after a recent daylight saving time change.",
      },
      {
        issue: "Manually set time keeps resetting back to automatic detection",
        fix: "This happens because 'Set Automatically' was left on — turn it off explicitly if you need the date and time to stay fixed at a manual value.",
      },
      {
        issue: "24-Hour Time change doesn't seem to apply in a specific app",
        fix: "Most system apps like Clock and Calendar follow this setting immediately, but some third-party apps use their own internal time format preference instead.",
      },
    ],
    faqs: [
      {
        q: "Why would I ever turn off 'Set Automatically'?",
        a: "It's mainly useful in rare situations like software testing or specific travel circumstances where automatic time zone detection is unreliable; most users should leave it on.",
      },
      {
        q: "Does 24-Hour Time change how dates are formatted too?",
        a: "No, it only affects the clock time format; date formatting (day-first vs. month-first) is controlled separately by the Region setting under Language & Region.",
      },
      {
        q: "Can my iPhone's clock be wrong even with 'Set Automatically' on?",
        a: "It's uncommon, but a temporary loss of cellular signal and Location Services together can occasionally delay an automatic time zone update until connectivity is restored.",
      },
    ],
    tipsAndTricks: [
      "Add a second time zone clock in the Clock app's World Clock tab instead of manually changing your device's time zone to track a different location.",
      "Check the small time zone name shown at the top of the Date & Time screen to quickly confirm which zone your iPhone currently thinks it's in.",
    ],
    relatedSettingIds: ["ios-general-about", "ios-language-region", "ios-notifications"],
  },
  {
    id: "ios-find-my",
    title: "Find My",
    icon: LocateFixed,
    platform: "ios",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Find My on iPhone",
    description:
      "Find My helps you locate a lost or stolen iPhone on a map, remotely play a sound, mark it as lost, or erase it, and it can also share your location with family members or locate AirTags and other Apple accessories.",
    details: [
      "Find My iPhone must be turned on for the device to appear on a map if it's ever lost or stolen.",
      "'Send Last Location' automatically sends the device's final known location to Apple when the battery gets critically low.",
      "Find My Network lets a lost device (or a paired AirTag) be located using nearby Apple devices, even without its own Wi-Fi or cellular connection.",
      "Family Sharing members can optionally share their location with each other directly from the Find My app.",
    ],
    important:
      "Activation Lock, tied to Find My, requires your Apple Account password to erase or reactivate the device — turn off Find My before trading in or selling your iPhone to avoid blocking the new owner's setup.",
    redirectUrl: "https://support.apple.com/en-us/102648",
    afterImageContent: {
      heading: "How Find My Locates Your iPhone",
      paragraphs: [
        "Find My combines GPS, Wi-Fi, and Bluetooth signals, along with the Find My network of other Apple devices, to estimate a device's location.",
        "Mark As Lost locks the device with a passcode and displays a custom message with a contact number on its lock screen.",
        "Even after the battery dies, a recently reported last location remains visible in the Find My app if 'Send Last Location' was enabled.",
      ],
      steps: [
        "Open Settings → [Your Name] → Find My.",
        "Turn on 'Find My iPhone' and 'Find My Network'.",
        "Enable 'Send Last Location' to report a final position before the battery dies.",
        "Open the Find My app on another Apple device to view the location of your iPhone if it's ever missing.",
      ],
    },
    whyItMatters:
      "Find My is the single most effective built-in protection against a lost or stolen iPhone becoming a total loss, since it lets you locate, remotely lock, or erase the device before someone else can access your data. Activation Lock, which is tied directly to Find My, also makes a stolen iPhone far less valuable to resell, since it can't be reactivated without your Apple Account credentials. Beyond device recovery, Find My underpins family location sharing and AirTag tracking, making it one of the most functionally important privacy and security settings on the entire device.",
    bestPractices: [
      "Keep Find My iPhone turned on at all times, since it's one of the few settings that directly protects the value and data security of the device itself.",
      "Enable 'Send Last Location' so a dying battery doesn't erase your last chance at locating a missing iPhone.",
      "Turn off Find My and sign out of your Apple Account before selling, trading in, or giving away your iPhone, to avoid leaving Activation Lock enabled for the new owner.",
      "Use 'Notify When Left Behind' for tracked items like AirTags paired with Find My, so you're alerted before walking away without them.",
    ],
    commonIssues: [
      {
        issue: "A trade-in or new owner can't activate the iPhone after a factory reset",
        fix: "The previous owner needs to sign in to icloud.com/find or another device and remove the iPhone from their account to clear Activation Lock.",
      },
      {
        issue: "Find My shows an old or inaccurate location for a lost device",
        fix: "Check whether 'Send Last Location' was enabled and whether the device had a recent connection before the battery died, since Find My can only show the most recent location it received.",
      },
      {
        issue: "Find My iPhone can't be turned off during a reset",
        fix: "Enter your Apple Account password when prompted, since disabling Find My intentionally requires authentication to prevent a thief from doing the same thing.",
      },
      {
        issue: "A family member's location isn't showing up in the Find My app",
        fix: "Confirm they've accepted the Family Sharing invitation and enabled location sharing from their own device's Find My settings, since sharing must be turned on individually by each person.",
      },
    ],
    faqs: [
      {
        q: "Can a thief turn off Find My on my stolen iPhone?",
        a: "Not without your Apple Account password — Activation Lock requires those credentials to disable Find My or erase the device, which is what makes stolen iPhones difficult to resell.",
      },
      {
        q: "Does Find My work if my iPhone is off or out of battery?",
        a: "If 'Send Last Location' was enabled, Find My can show its final known position before it powered off; some newer iPhones can also be located for a short time even after shutting down using low-power hardware.",
      },
      {
        q: "Can I use Find My to track an AirTag or someone else's Apple device?",
        a: "You can track your own AirTags and devices, or another person's device only if they've explicitly shared their location with you through Family Sharing or a similar sharing feature.",
      },
    ],
    tipsAndTricks: [
      "Use 'Play Sound' in the Find My app to locate a misplaced iPhone that's still nearby, like lost somewhere in your own home.",
      "Check the Find My app's 'Devices' tab for a full list of every Apple device and accessory linked to your Apple Account, not just your current iPhone.",
    ],
    relatedSettingIds: ["ios-location-services", "ios-icloud-backup", "ios-reset-iphone"],
  },
  {
    id: "ios-apple-pay-wallet",
    title: "Wallet & Apple Pay",
    icon: Wallet,
    platform: "ios",
    category: "apps-features",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Wallet and Apple Pay on iPhone",
    description:
      "Wallet & Apple Pay settings let you add debit, credit, and transit cards for contactless payment, manage boarding passes and IDs, and control which card is used by default along with Face ID or Touch ID authorization.",
    details: [
      "Cards can be added by scanning them with the camera or entering details manually, subject to your card issuer's approval.",
      "A default card is used automatically for Apple Pay unless you select a different one at the moment of payment.",
      "Express Transit Cards can be used to tap through certain transit systems without unlocking the iPhone or authenticating first.",
      "Apple Cash (where available) and person-to-person payments sent through Messages are also managed from this same section.",
    ],
    important:
      "If your iPhone is lost or stolen, use Find My or contact your card issuer promptly — Apple Pay transactions still require device authentication, but suspending cards remotely adds an extra layer of protection.",
    redirectUrl: "https://support.apple.com/en-us/HT204506",
    afterImageContent: {
      heading: "Adding and Using Cards with Apple Pay",
      paragraphs: [
        "Each added card is tokenized rather than stored as a raw card number, meaning your actual card details aren't shared with merchants during a purchase.",
        "Face ID or Touch ID authorizes each Apple Pay transaction individually, in addition to double-clicking the side or Home button on older setups.",
        "Boarding passes, tickets, and IDs added to Wallet from supporting apps appear alongside your payment cards for quick access.",
      ],
      steps: [
        "Open Settings → Wallet & Apple Pay (or open the Wallet app directly).",
        "Tap the '+' button and choose 'Debit or Credit Card'.",
        "Scan the card with the camera or enter its details manually, then verify with your card issuer.",
        "Set your preferred Default Card and confirm Face ID/Touch ID is enabled for Apple Pay.",
      ],
    },
    whyItMatters:
      "Apple Pay replaces handing over a physical card with a tokenized, authenticated transaction, meaning your actual card number is never shared with the merchant and every purchase requires Face ID, Touch ID, or a passcode. This setting is also where Express Transit is configured, letting people move through certain subway or transit gates without unlocking their phone at all, which only works correctly if set up in advance. Because Wallet increasingly holds boarding passes, tickets, and IDs alongside payment cards, this section has become a central hub for everyday essentials well beyond just paying for things.",
    bestPractices: [
      "Set a default card that matches the one you actually want charged most often, since it's used automatically unless you manually select another during checkout.",
      "Enable Face ID or Touch ID specifically for Apple Pay so purchases stay protected even if your general passcode is compromised in some other way.",
      "Set up Express Transit for your city's supported transit system in advance, rather than discovering at the turnstile that authentication is required.",
      "Remove old or canceled cards from Wallet promptly to avoid confusion when selecting a payment method during checkout.",
      "Contact your card issuer immediately if your iPhone is lost, in addition to using Find My, since they can suspend the tokenized card independently.",
    ],
    commonIssues: [
      {
        issue: "A card won't add to Wallet or gets stuck on verification",
        fix: "Confirm the card issuer supports Apple Pay and try re-entering the details manually instead of scanning, or contact the card issuer directly if verification keeps failing.",
      },
      {
        issue: "The wrong card gets charged during a tap-to-pay purchase",
        fix: "Check which card is set as Default under Wallet & Apple Pay, and manually select the correct card in Wallet before tapping to pay if a different one is needed for that purchase.",
      },
      {
        issue: "Express Transit doesn't work at the turnstile without unlocking the phone",
        fix: "Confirm the specific card was set up as an Express Transit Card for your transit system, since only cards explicitly configured this way skip the authentication requirement.",
      },
      {
        issue: "Apple Pay declines at checkout despite the card working elsewhere",
        fix: "Check for a temporary hold from the card issuer, confirm the device's date and time are accurate, and try restarting the iPhone if the terminal still doesn't recognize the tap.",
      },
    ],
    faqs: [
      {
        q: "Does Apple Pay share my actual card number with stores?",
        a: "No, Apple Pay uses a unique tokenized device account number instead of your real card number, so merchants never see or store your actual card details.",
      },
      {
        q: "What happens to my cards in Wallet if I lose my iPhone?",
        a: "You can use Find My to suspend Apple Pay on the missing device remotely, and your card issuer can also freeze or reissue the card independently for extra protection.",
      },
      {
        q: "Can I use Apple Pay without an internet connection?",
        a: "Yes, in-store contactless Apple Pay transactions work over NFC and don't require an active internet connection on the iPhone itself.",
      },
    ],
    tipsAndTricks: [
      "Double-click the side button from the Lock Screen to bring up your default Apple Pay card instantly without fully unlocking or opening the Wallet app.",
      "Long-press a card in Wallet to quickly access its transaction history or card-specific settings without going through Settings.",
    ],
    relatedSettingIds: ["ios-face-id-passcode", "ios-privacy-permissions", "ios-app-store-settings"],
  },
  {
    id: "ios-app-store-settings",
    title: "App Store Settings",
    icon: Store,
    platform: "ios",
    category: "apps-features",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Manage App Store Settings on iPhone",
    description:
      "App Store settings control automatic app updates and downloads, whether purchases require a password or Face ID confirmation, and content restrictions that limit which apps and in-app purchases are accessible.",
    details: [
      "App Updates can install automatically in the background, or be left for manual review and approval.",
      "'Require Password' settings determine whether free downloads, paid purchases, or in-app purchases prompt for authentication.",
      "Content Restrictions (under Screen Time) can block apps above a certain age rating or disable in-app purchases entirely.",
      "'Offload Unused Apps' automatically removes rarely used apps to save storage while keeping their data intact for reinstallation.",
    ],
    important:
      "Disabling 'Require Password' for purchases makes it easy for anyone with access to an unlocked device, including a child, to make purchases without any confirmation step.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/change-settings-and-restrictions-iph3dfd91de/ios",
    afterImageContent: {
      heading: "Configuring Downloads, Purchases, and Restrictions",
      paragraphs: [
        "Automatic Downloads can sync new app installs and updates across every device signed into the same Apple Account.",
        "In-app purchase confirmation is a separate setting from the main App Store purchase password requirement.",
        "Content Restrictions rely on age ratings that developers assign to their own apps, reviewed periodically by Apple.",
      ],
      steps: [
        "Open Settings → App Store.",
        "Toggle App Updates and Automatic Downloads to your preference.",
        "Adjust 'Require Password' settings for free and paid content.",
        "Open Settings → Screen Time → Content & Privacy Restrictions to limit app ratings or in-app purchases if needed.",
      ],
    },
    whyItMatters:
      "App Store settings quietly control two very different things — how much friction exists before a purchase happens, and how much storage new updates silently consume in the background. For families, Content Restrictions are essential for keeping a child's device limited to age-appropriate apps and preventing surprise in-app purchase charges. For anyone managing storage carefully, disabling automatic app updates or downloads can prevent large background installs from eating into limited space at an inconvenient moment.",
    bestPractices: [
      "Keep 'Require Password' enabled for purchases on any shared or family device, even if it adds a small amount of friction to legitimate buying.",
      "Set Content & Privacy Restrictions before handing a device to a child, rather than reactively restricting access after a problematic download.",
      "Leave App Updates on automatic if storage isn't a concern, since it keeps apps patched with the latest security and bug fixes without manual effort.",
      "Review in-app purchase settings specifically for gaming apps, since those are the most common source of unexpected charges on a shared device.",
    ],
    commonIssues: [
      {
        issue: "A child made an unexpected in-app purchase without a parent noticing",
        fix: "Enable 'Require Password' for purchases immediately in Settings → App Store, and set up Ask to Buy under Family Sharing so purchase requests need explicit parental approval.",
      },
      {
        issue: "Apps keep updating automatically and consuming storage unexpectedly",
        fix: "Turn off 'App Updates' under Settings → App Store → Automatic Downloads if you'd rather review and install updates manually.",
      },
      {
        issue: "An age-appropriate app is blocked from installing on a managed device",
        fix: "Check the allowed app rating under Settings → Screen Time → Content & Privacy Restrictions → iTunes & App Store Purchases, and raise the age limit if it's set too restrictively.",
      },
      {
        issue: "A newly purchased app doesn't appear on another device signed into the same Apple Account",
        fix: "Confirm 'App Downloads' under Automatic Downloads is enabled on that other device, since apps don't sync automatically unless this setting is turned on there too.",
      },
    ],
    faqs: [
      {
        q: "Does 'Require Password' apply to free app downloads too?",
        a: "Yes, you can require authentication for free downloads as well as paid purchases, which is useful on a family or shared device even when no money changes hands.",
      },
      {
        q: "Can I block only in-app purchases without blocking new app installs entirely?",
        a: "Yes, Content & Privacy Restrictions lets you disable in-app purchases specifically while still allowing new app downloads and installs.",
      },
      {
        q: "Will turning off Automatic Downloads stop apps from updating forever?",
        a: "No, it only stops updates from installing automatically in the background — you can still update any app manually anytime from the App Store's Updates tab.",
      },
    ],
    tipsAndTricks: [
      "Enable 'Offload Unused Apps' under Automatic Downloads so iOS quietly frees storage from rarely used apps without deleting their saved data.",
      "Check purchase history in your Apple Account settings if a charge looks unfamiliar, rather than assuming it was unauthorized before investigating.",
    ],
    relatedSettingIds: ["ios-screen-time-family", "ios-iphone-storage", "ios-apple-pay-wallet"],
  },
  {
    id: "ios-safari-settings",
    title: "Safari Settings",
    icon: Compass,
    platform: "ios",
    category: "apps-features",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Customize Safari Settings on iPhone",
    description:
      "Safari settings control your default search engine, privacy protections like Intelligent Tracking Prevention and Privacy Report, AutoFill for passwords and payment details, and how tabs and extensions behave.",
    details: [
      "Intelligent Tracking Prevention limits cross-site tracking by advertisers and analytics scripts automatically, without needing manual configuration.",
      "AutoFill can fill in saved passwords, contact information, and payment card details from Settings or your device's Passwords.",
      "Privacy Report shows a summary of trackers Safari has blocked across the websites you've visited recently.",
      "Extensions installed from the App Store can add content blocking, password management, or other browsing features to Safari.",
    ],
    important:
      "Turning off 'Block Pop-ups' or Fraudulent Website Warning reduces built-in protection against intrusive ads and phishing sites — only disable these for specific, trusted use cases.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/customize-your-safari-settings-iphb3100d149/ios",
    afterImageContent: {
      heading: "Adjusting Privacy, Search, and AutoFill in Safari",
      paragraphs: [
        "Safari's privacy protections work automatically in the background without requiring you to configure individual website permissions.",
        "AutoFill pulls saved information from Contacts and your device's Passwords, and can be turned off independently for names/addresses versus payment cards.",
        "Per-website settings, like camera or location access, can be reviewed separately from Safari's general settings.",
      ],
      steps: [
        "Open Settings → Safari.",
        "Choose your preferred default search engine under 'Search Engine'.",
        "Toggle AutoFill for Contact Info and Credit Cards under 'AutoFill'.",
        "Scroll to Privacy & Security to review Fraudulent Website Warning and Privacy Report settings.",
      ],
    },
    whyItMatters:
      "Safari is the default gateway to the web on iPhone, so its settings determine how much cross-site tracking advertisers can perform, how convenient it is to log in to sites with saved passwords, and how exposed you are to phishing sites. Intelligent Tracking Prevention and Privacy Report work quietly in the background, giving a genuine, measurable reduction in advertiser tracking without requiring technical knowledge to configure. Because AutoFill can store payment card details for one-tap checkout, understanding and reviewing this setting also has real financial security implications, not just convenience.",
    bestPractices: [
      "Leave Fraudulent Website Warning turned on, since it actively blocks known phishing and malware sites before you can accidentally visit them.",
      "Review Privacy Report periodically to see which trackers Safari has blocked recently, and get a sense of which sites are the most aggressive trackers.",
      "Turn on AutoFill for Contact Info for convenience, but review Credit Card AutoFill specifically if you share your device with family members.",
      "Choose a privacy-respecting default search engine if that's a priority, since Safari lets you select alternatives beyond the default search provider.",
    ],
    commonIssues: [
      {
        issue: "Saved passwords or payment cards don't AutoFill on a login or checkout page",
        fix: "Check Settings → Safari → AutoFill to confirm the relevant toggle is on, and verify the specific credential exists in Passwords for that exact website.",
      },
      {
        issue: "A website looks broken or missing content after visiting it",
        fix: "Try Safari's 'Request Desktop Website' option from the aA menu, since some sites render incorrectly or hide features in the default mobile view.",
      },
      {
        issue: "Pop-up blocker prevents a legitimate feature (like a payment window) from opening",
        fix: "Tap the aA icon in the address bar and temporarily allow pop-ups for that specific site rather than disabling the blocker system-wide.",
      },
      {
        issue: "Safari keeps suggesting a search engine you don't want to use",
        fix: "Change the default under Settings → Safari → Search Engine, since Safari always uses whichever provider is selected there regardless of prior searches.",
      },
    ],
    faqs: [
      {
        q: "Does Safari's tracking prevention block all website ads?",
        a: "No, Intelligent Tracking Prevention limits cross-site tracking data used to build a profile of your browsing, but it doesn't function as a full ad blocker; a dedicated content blocker extension is needed for that.",
      },
      {
        q: "Is it safe to let Safari save my credit card for AutoFill?",
        a: "Saved cards are protected by your device's passcode and Face ID or Touch ID before AutoFill will insert them, making it reasonably safe on a personal device, though caution is warranted on any shared device.",
      },
      {
        q: "Can I use a different search engine than the default in Safari?",
        a: "Yes, Settings → Safari → Search Engine offers several alternatives beyond the default, and switching takes effect immediately for new searches.",
      },
    ],
    tipsAndTricks: [
      "Tap the aA icon in Safari's address bar to quickly access Reader view, text size, and per-site content blocker settings without opening the main Settings app.",
      "Use Safari's built-in Privacy Report (tap the shield icon in the address bar) to see trackers blocked on the current page in real time.",
    ],
    relatedSettingIds: ["ios-privacy-permissions", "ios-icloud-backup", "ios-wifi"],
  },
  {
    id: "ios-emergency-sos",
    title: "Emergency SOS",
    icon: Siren,
    platform: "ios",
    category: "privacy-permissions",
    frequentlyUsed: true,
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Emergency SOS on iPhone",
    description:
      "Emergency SOS lets you quickly call for help by pressing the side button rapidly or holding it with a volume button, automatically alerting emergency services and, if configured, notifying your chosen emergency contacts with your location.",
    details: [
      "Pressing and holding the side button and a volume button together starts a countdown before calling emergency services.",
      "Rapidly pressing the side button five times can also trigger Emergency SOS, depending on your region and settings.",
      "Emergency Contacts you've designated are automatically notified with your current location once a call to emergency services ends.",
      "Medical ID information, if set up, can be shared with emergency responders directly from the Lock Screen during a call.",
    ],
    important:
      "Emergency SOS calls emergency services directly and cannot be tested casually — practicing the gesture in a genuine emergency-services region can trigger a real call, so review Apple's guidance carefully before trying it.",
    redirectUrl:
      "https://support.apple.com/guide/iphone/contact-emergency-services-iph3c99374c/ios",
    afterImageContent: {
      heading: "How Emergency SOS Works on iPhone",
      paragraphs: [
        "Triggering Emergency SOS starts a countdown with a warning sound, giving you a moment to cancel if it was activated accidentally.",
        "After the call ends, iOS can automatically send a text to your Emergency Contacts with your current location and updates as it changes.",
        "Medical ID displays critical health information, like allergies or conditions, accessible from the Lock Screen without needing a passcode.",
      ],
      steps: [
        "Open Settings → Emergency SOS.",
        "Choose whether 'Call with Side Button' requires the countdown or an immediate press.",
        "Open the Health app and set up Medical ID, then choose to show it on the Lock Screen.",
        "Add trusted people as Emergency Contacts so they're notified automatically after an Emergency SOS call.",
      ],
    },
    whyItMatters:
      "Emergency SOS can be a genuinely life-saving feature in situations where dialing normally isn't practical, like during an accident, an assault, or a medical emergency where speed and simplicity matter most. Because it automatically shares your location with both emergency services and your designated Emergency Contacts, it closes a real gap that exists when someone can't verbally explain where they are. Setting up Medical ID alongside it means first responders can see critical health information immediately, even if the device is locked and you're unable to communicate.",
    bestPractices: [
      "Set up Medical ID with accurate allergies, medications, and conditions, since responders can view it from the Lock Screen without unlocking the device.",
      "Add at least one or two trusted Emergency Contacts so they're automatically notified with your location if you ever trigger a real Emergency SOS call.",
      "Know your region's exact trigger gesture (hold side + volume, or rapid side-button presses) in advance rather than discovering it during an actual emergency.",
      "Review the countdown and haptic/sound settings so you understand what an accidental trigger feels like and how to cancel it quickly.",
    ],
    commonIssues: [
      {
        issue: "Emergency SOS triggers accidentally while the phone is in a pocket or bag",
        fix: "Cancel the countdown immediately by tapping 'Stop' or sliding to cancel if a call hasn't connected yet, and consider using a case that better protects the side button from accidental presses.",
      },
      {
        issue: "Emergency Contacts weren't notified after a real Emergency SOS call",
        fix: "Confirm Emergency Contacts are correctly added in the Health app's Medical ID and that Location Services is enabled, since both are required for the automatic notification to send.",
      },
      {
        issue: "Medical ID information doesn't appear on the Lock Screen during an emergency",
        fix: "Open the Health app → Medical ID → Edit and confirm 'Show When Locked' is turned on, since Medical ID is hidden from the Lock Screen by default until enabled.",
      },
      {
        issue: "Unsure which gesture triggers Emergency SOS on a specific iPhone model or region",
        fix: "Check Settings → Emergency SOS, which displays the exact trigger method (hold side + volume button, or rapid presses) configured for your device and region.",
      },
    ],
    faqs: [
      {
        q: "Does Emergency SOS work without a cellular plan?",
        a: "In most regions, calls to emergency services are allowed even without an active cellular plan or SIM card, though satellite-based Emergency SOS features have their own separate device and coverage requirements.",
      },
      {
        q: "Will my location automatically be sent to my emergency contacts?",
        a: "Yes, once an Emergency SOS call to emergency services ends, iOS can automatically text your designated Emergency Contacts with your current location and updates for a period afterward.",
      },
      {
        q: "Can emergency responders see my medical conditions if my phone is locked?",
        a: "Yes, if Medical ID is set up with 'Show When Locked' enabled, responders can view it directly from the Lock Screen's emergency access without needing your passcode.",
      },
    ],
    tipsAndTricks: [
      "Set up Medical ID even if you're generally healthy, since basic details like your emergency contacts and blood type can still matter in an unrelated accident.",
      "Review Settings → Emergency SOS after getting a new iPhone or moving to a new country, since the exact trigger gesture can differ by region.",
    ],
    relatedSettingIds: ["ios-location-services", "ios-find-my", "ios-face-id-passcode"],
  },
  {
    id: "ios-game-center",
    title: "Game Center",
    icon: Gamepad2,
    platform: "ios",
    category: "apps-features",
    controlType: "action",
    actionLabel: "View Official Guide",
    heading: "Set Up Game Center on iPhone",
    description:
      "Game Center is Apple's social gaming network built into supported games, letting you track achievements and leaderboards, play with friends, and manage your public nickname and profile visibility across every Game Center-enabled app.",
    details: [
      "A Game Center profile includes a nickname and photo that appears to friends and other players across supported games.",
      "Friend requests can be sent and accepted directly within Game Center or through supported games that use it.",
      "Achievements and Leaderboards are tracked per game and sync automatically across your devices signed into the same Apple Account.",
      "Privacy settings control whether friend requests, invitations, or your activity status are visible to others.",
    ],
    important:
      "Game Center activity and friend connections are visible within any game that integrates it, so review your privacy settings if you'd rather limit who can see your profile or send requests.",
    redirectUrl: "https://support.apple.com/en-us/105022",
    afterImageContent: {
      heading: "Setting Up Your Game Center Profile",
      paragraphs: [
        "Game Center is accessed through the Games app or directly within any individual game that supports it.",
        "Your nickname, rather than your real name, is what's shown by default to other players and friends.",
        "Achievements and Leaderboards update automatically as you play, without needing to manually sync progress.",
      ],
      steps: [
        "Open the Games app and sign in with your Apple Account if not already signed in.",
        "Tap your profile icon to set up or edit your Game Center nickname and photo.",
        "Adjust privacy settings for friend requests and activity status.",
        "Open a supported game to see your Achievements and Leaderboards populate automatically.",
      ],
    },
    whyItMatters:
      "Game Center is what turns individual games into a connected social experience, letting achievements, leaderboards, and multiplayer invitations carry across dozens of supported titles instead of each game tracking progress in isolation. Because a Game Center profile is shared across every compatible game, getting the nickname and privacy settings right once saves you from repeatedly managing visibility on a per-game basis. For parents, understanding Game Center's friend request and messaging behavior is also relevant to Screen Time and Content Restrictions when managing a child's device.",
    bestPractices: [
      "Set a nickname that doesn't reveal your real identity if you play multiplayer games with strangers rather than only friends.",
      "Review friend requests periodically rather than accepting them automatically, especially on a device used by a younger family member.",
      "Turn off activity status or friend recommendations if you'd rather keep your gaming presence private from being discoverable by others.",
      "Check Content & Privacy Restrictions under Screen Time if you want to limit or disable multiplayer and friend features for a child's Game Center profile.",
    ],
    commonIssues: [
      {
        issue: "Achievements or Leaderboards don't appear for a game that should support them",
        fix: "Confirm you're signed in to Game Center through the Games app and that the specific game has been opened at least once while signed in to register its data.",
      },
      {
        issue: "A friend request in Game Center never arrives",
        fix: "Confirm the correct nickname or Apple Account email was used to send the request, and check that Game Center privacy settings aren't blocking incoming requests.",
      },
      {
        issue: "Progress doesn't carry over to a new iPhone",
        fix: "Sign in to Game Center with the same Apple Account on the new device, since Achievements and Leaderboards are tied to your account rather than the physical device.",
      },
      {
        issue: "A child's device shows unwanted multiplayer invitations",
        fix: "Restrict multiplayer games and Game Center-based friend features under Settings → Screen Time → Content & Privacy Restrictions.",
      },
    ],
    faqs: [
      {
        q: "Is Game Center required to play games on iPhone?",
        a: "No, Game Center is optional for most games; it only adds social features like Achievements, Leaderboards, and friend invitations to games that choose to integrate it.",
      },
      {
        q: "Can I use a different nickname than my real name in Game Center?",
        a: "Yes, Game Center nicknames are separate from your Apple Account name and can be set to anything you choose within Apple's naming guidelines.",
      },
      {
        q: "Do Game Center achievements sync across my iPhone and iPad?",
        a: "Yes, as long as both devices are signed into the same Apple Account, your Achievements and Leaderboards for supported games carry over automatically.",
      },
    ],
    tipsAndTricks: [
      "Open the Games app to see a unified view of Achievements and recently played Game Center-enabled titles instead of checking each game individually.",
      "Use Game Center's friend suggestions sparingly if you'd rather keep your player list limited to people you already know well.",
    ],
    relatedSettingIds: ["ios-screen-time-family", "ios-app-store-settings", "ios-privacy-permissions"],
  },
];
